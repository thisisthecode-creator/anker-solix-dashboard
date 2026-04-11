import asyncio
import functools
import gzip
import hashlib
import hmac
import json
import logging
import os
import time
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, Request, HTTPException
from fastapi.responses import FileResponse, Response, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.config import (
    TIMEZONE, WS_BROADCAST_INTERVAL, ELECTRICITY_PRICE_EUR,
    BATTERY_CAPACITY_WH, SYSTEM_COST_EUR, DASHBOARD_PASSWORD,
)
from app.database import (
    init_db, close_pool, upsert_daily, update_monthly,
    update_yearly, get_daily, get_monthly, get_yearly,
    get_readings, get_latest_reading, get_stats, get_energy_summary,
    get_soh_trend, get_daily_stats, cleanup_old_readings,
    get_cumulative_savings, insert_forecast, get_forecast_accuracy,
)
from app.accumulator import SolarAccumulator
from app.anker_client import AnkerClient
from app.battery_cycles import BatteryCycleTracker

logger = logging.getLogger(__name__)
STATIC = Path(__file__).parent / "static"
ARCHIVE_DIR = Path(__file__).resolve().parent.parent / "data" / "archive"

# Shared state
client = AnkerClient()
accumulator = SolarAccumulator()
battery_cycles = BatteryCycleTracker()
ws_clients: set[WebSocket] = set()
latest_data: dict = {}

# === Disk-write dedup (pure fingerprint, no heartbeat) ===
# Every 3s MQTT message is scanned (for accumulator + battery cycles + live broadcast),
# but we only write to archive/DB when a tracked value actually changes. Stable periods
# produce zero rows. The accumulator keeps integrating kWh in RAM regardless — losing
# disk writes doesn't lose energy data, because identical fingerprints mean 0 Wh was
# added in that interval anyway (constant power × dt with power == 0 is 0).
DAILY_UPSERT_S = 60      # refresh daily_solar at most once a minute
CYCLE_SAVE_S = 60        # persist battery_cycles.json at most once a minute

_last_write_fp: tuple = ()
_last_daily_upsert: float = 0
_last_cycle_save: float = 0

# === CSV Archive (all 3s MQTT data) ===
ARCHIVE_HEADER = "timestamp,solar_watts,battery_soc,battery_soh,ac_output_watts,dc_output_watts,dc_12v_watts,usbc_1_watts,usbc_2_watts,usbc_3_watts,usba_1_watts,total_output_watts,ac_input_watts,temperature\n"
_archive_file = None
_archive_date: str = ""

ARCHIVE_FIELDS = [
    "solar_watts", "battery_soc", "battery_soh",
    "ac_output_watts", "dc_output_watts", "dc_12v_watts",
    "usbc_1_watts", "usbc_2_watts", "usbc_3_watts", "usba_1_watts",
    "total_output_watts", "ac_input_watts", "temperature",
]


def _get_archive_file(date_str: str):
    """Get or open the CSV file for today's archive."""
    global _archive_file, _archive_date
    if _archive_date == date_str and _archive_file and not _archive_file.closed:
        return _archive_file
    # Close previous file
    if _archive_file and not _archive_file.closed:
        _archive_file.close()
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    csv_path = ARCHIVE_DIR / f"{date_str}.csv"
    is_new = not csv_path.exists()
    _archive_file = open(csv_path, "a", buffering=1)  # line-buffered
    if is_new:
        _archive_file.write(ARCHIVE_HEADER)
    _archive_date = date_str
    return _archive_file


def archive_reading(data: dict):
    """Append MQTT reading to today's CSV. Dedup happens at the call site."""
    tz = ZoneInfo(TIMEZONE)
    date_str = datetime.now(tz).strftime("%Y-%m-%d")
    f = _get_archive_file(date_str)
    row = data.get("timestamp", "") + "," + ",".join(
        str(data.get(k, 0)) for k in ARCHIVE_FIELDS
    )
    f.write(row + "\n")


def compress_old_archives():
    """Gzip any .csv files from previous days."""
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    tz = ZoneInfo(TIMEZONE)
    today = datetime.now(tz).strftime("%Y-%m-%d")
    compressed = 0
    for csv_path in sorted(ARCHIVE_DIR.glob("*.csv")):
        date_part = csv_path.stem  # e.g. "2026-04-08"
        if date_part >= today:
            continue  # Don't compress today's file
        gz_path = csv_path.with_suffix(".csv.gz")
        if gz_path.exists():
            csv_path.unlink()  # Already compressed, remove CSV
            continue
        with open(csv_path, "rb") as f_in:
            with gzip.open(gz_path, "wb", compresslevel=9) as f_out:
                f_out.write(f_in.read())
        csv_path.unlink()
        compressed += 1
        logger.info("Archived %s → %s", csv_path.name, gz_path.name)
    return compressed


_logged_field_count = 0
_last_mqtt_time: float = 0  # Track when we last got real MQTT data

def extract_data(raw: dict) -> dict:
    """Extract relevant fields from MQTT status dict."""
    global _logged_field_count, _last_mqtt_time
    field_count = len(raw)
    if field_count > _logged_field_count:
        # Log when we get more fields than before
        nonzero = {k: v for k, v in raw.items() if v and v != 0 and k not in ('last_message', 'topics')}
        logger.info("MQTT fields expanded to %d: %s", field_count, sorted(raw.keys()))
        if nonzero:
            logger.info("MQTT non-zero: %s", nonzero)
        _logged_field_count = field_count
    solar = raw.get("dc_input_power_total", 0) or 0
    ac_out = raw.get("ac_output_power", 0) or 0
    dc_12v = raw.get("dc_output_power_total", 0) or 0
    usbc = sum(raw.get(f"usbc_{i}_power", 0) or 0 for i in range(1, 4))
    usba = raw.get("usba_1_power", 0) or 0
    dc_out = dc_12v + usbc + usba
    total_out = raw.get("output_power_total", 0) or 0
    ac_in = raw.get("ac_input_power", 0) or 0
    soc = raw.get("battery_soc", 0) or 0
    temp = raw.get("temperature", 0) or 0
    soh = raw.get("battery_soh", 0) or 0
    # Guard against invalid 0 spikes for battery/temperature (these can never be 0 in reality):
    # always reuse the last known good value if current MQTT delivers 0.
    # Note: USB-C / USB-A / solar / AC values may legitimately be 0 (nothing plugged in).
    if soc == 0 and latest_data.get("battery_soc", 0) > 0:
        soc = latest_data["battery_soc"]
    if temp == 0 and latest_data.get("temperature", 0) > 0:
        temp = latest_data["temperature"]
    if soh == 0 and latest_data.get("battery_soh", 0) > 0:
        soh = latest_data["battery_soh"]
    _last_mqtt_time = time.time()
    return {
        "solar_watts": float(solar),
        "battery_soc": int(soc),
        "battery_soh": int(soh),
        "ac_output_watts": float(ac_out),
        "dc_output_watts": float(dc_out),
        "dc_12v_watts": float(dc_12v),
        "usbc_1_watts": float(raw.get("usbc_1_power", 0) or 0),
        "usbc_2_watts": float(raw.get("usbc_2_power", 0) or 0),
        "usbc_3_watts": float(raw.get("usbc_3_power", 0) or 0),
        "usba_1_watts": float(raw.get("usba_1_power", 0) or 0),
        "total_output_watts": float(total_out),
        "ac_input_watts": float(ac_in),
        "temperature": float(temp),
        # Extended MQTT fields (delivered by C1000 Gen 2 / A1763)
        "ac_switch": int(raw.get("ac_output_power_switch", 0) or 0),
        "dc_switch": int(raw.get("dc_output_power_switch", 0) or 0),
        "max_soc": int(raw.get("max_soc", 100) or 100),
        "min_soc": int(raw.get("min_soc", 0) or 0),
        "ac_input_limit": int(raw.get("ac_input_limit", 0) or 0),
        "display_switch": int(raw.get("display_switch", 0) or 0),
        "display_mode": int(raw.get("display_mode", 0) or 0),
        "usbc_1_status": int(raw.get("usbc_1_status", 0) or 0),
        "usbc_2_status": int(raw.get("usbc_2_status", 0) or 0),
        "usbc_3_status": int(raw.get("usbc_3_status", 0) or 0),
        "usba_1_status": int(raw.get("usba_1_status", 0) or 0),
    }


async def on_mqtt_data(raw: dict):
    """Called for each MQTT status update (every ~3 s).

    Flow:
      1. ALWAYS scan the message: feed accumulator + battery cycles (RAM, cheap).
      2. Skip 0-spike startup noise.
      3. ALWAYS refresh latest_data for the WebSocket broadcast.
      4. Dedup check: only write to disk (archive CSV + SQLite) if a tracked field
         actually changed. Stable periods produce zero disk writes.
      5. daily_solar + battery_cycles.json are persisted on their own slower schedule.
    """
    global latest_data, _last_write_fp, _last_daily_upsert, _last_cycle_save

    data = extract_data(raw)
    now = time.time()
    tz = ZoneInfo(TIMEZONE)
    data["timestamp"] = datetime.now(tz).isoformat(timespec="seconds")

    # --- 1. RAM trackers (every 3 s, no disk I/O) ---
    finalized = accumulator.update(
        solar_watts=data["solar_watts"],
        output_watts=data["total_output_watts"],
        charge_watts=data["ac_input_watts"],
        ts=now,
        soc=data.get("battery_soc"),
        soh=data.get("battery_soh"),
        temp=data.get("temperature"),
    )
    battery_cycles.update(data.get("battery_soc", 0))

    # Day rollover: persist finalized day + monthly/yearly aggregates
    if finalized:
        await upsert_daily(finalized["date"], finalized)
        await update_monthly(finalized["date"][:7])
        await update_yearly(finalized["date"][:4])
        battery_cycles.save(force=True)  # freeze the day's cycle state

    # --- 2. Skip 0-spike startup readings ---
    if data.get("battery_soc", 0) == 0 and data.get("temperature", 0) == 0:
        return

    # --- 3. Refresh latest_data (every 3 s — used by WebSocket broadcast) ---
    today = accumulator.get_today()
    soc = data["battery_soc"]
    charging = data["ac_input_watts"] + data["solar_watts"]
    discharging = data["total_output_watts"]
    battery_time = None
    battery_charging = False
    if charging > discharging and soc < 100:
        net_watts = charging - discharging
        remaining_wh = BATTERY_CAPACITY_WH * (100 - soc) / 100
        battery_time = round(remaining_wh / net_watts, 1) if net_watts > 0 else None
        battery_charging = True
    elif discharging > charging and soc > 0:
        net_watts = discharging - charging
        remaining_wh = BATTERY_CAPACITY_WH * soc / 100
        battery_time = round(remaining_wh / net_watts, 1) if net_watts > 0 else None
        battery_charging = False

    latest_data = {
        **data,
        "daily_kwh": today["solar_kwh"],
        "daily_peak_watts": today["peak_watts"],
        "solar_hours": today["solar_hours"],
        "daily_output_kwh": today["total_output_kwh"],
        "daily_charge_kwh": today["total_charge_kwh"],
        "daily_direct_use_kwh": today.get("direct_use_kwh", 0),
        "daily_battery_in_kwh": today.get("battery_in_kwh", 0),
        "daily_battery_out_kwh": today.get("battery_out_kwh", 0),
        "direct_use_pct": today.get("direct_use_pct", 0),
        "autarkie_pct": today.get("autarkie_pct", 0),
        "rte_pct": today.get("rte_pct", 0),
        "daily_savings_eur": round(today["solar_kwh"] * ELECTRICITY_PRICE_EUR, 2),
        "price_per_kwh": ELECTRICITY_PRICE_EUR,
        "device_name": client.device_name,
        "battery_time_hours": battery_time,
        "battery_charging": battery_charging,
        "battery_cycles_total": battery_cycles.total_cycles,
        "battery_cycles_today": battery_cycles.today_cycles,
    }

    # --- 4. Disk writes — only when a tracked field actually changes ---
    current_fp = tuple(data.get(k, 0) for k in ARCHIVE_FIELDS)
    if current_fp != _last_write_fp:
        archive_reading(data)
        _last_write_fp = current_fp

    # --- 5. daily_solar (≤ once per minute) ---
    if today["date"] and (now - _last_daily_upsert) >= DAILY_UPSERT_S:
        await upsert_daily(today["date"], today)
        _last_daily_upsert = now

    # --- 6. battery_cycles.json (≤ once per minute, only if dirty) ---
    if (now - _last_cycle_save) >= CYCLE_SAVE_S:
        battery_cycles.save()
        _last_cycle_save = now


async def _background_reconnect():
    """Keep trying to connect to Anker MQTT in the background."""
    wait = 600  # Start with 10 minutes to let rate-limit expire
    while True:
        logger.info("Background reconnect in %ds...", wait)
        await asyncio.sleep(wait)
        try:
            logger.info("Background reconnect attempt...")
            # Clean up any previous session first
            try:
                await client.close()
            except Exception:
                pass
            await client.connect()
            await client.start_mqtt(on_mqtt_data)
            logger.info("Background reconnect successful - device: %s", client.device_name)
            return  # Connected! _poll_loop now handles everything
        except Exception as e:
            logger.warning("Background reconnect failed: %s", e)
            wait = min(wait * 2, 1800)  # Double wait, max 30 min


async def broadcast_loop():
    """Send latest data to all WebSocket clients."""
    while True:
        await asyncio.sleep(WS_BROADCAST_INTERVAL)
        if not latest_data or not ws_clients:
            continue
        msg = json.dumps(latest_data)
        dead = set()
        for ws in ws_clients:
            try:
                await ws.send_text(msg)
            except Exception:
                dead.add(ws)
        ws_clients -= dead


async def restore_accumulator():
    """Restore today's accumulator state by replaying today's archive CSV.

    The archive is now the single source of truth — deduped readings are
    replayed with their stored timestamps, and the trapezoidal integrator
    fills in the energy totals exactly (identical fingerprints ≡ constant
    power × dt, so spanning gaps is fine).
    """
    tz = ZoneInfo(TIMEZONE)
    today = datetime.now(tz).strftime("%Y-%m-%d")
    csv_path = ARCHIVE_DIR / f"{today}.csv"
    if not csv_path.exists():
        return
    count = 0
    try:
        with open(csv_path, "r") as f:
            next(f, None)  # header
            for line in f:
                parts = line.strip().split(",")
                if len(parts) < 14:
                    continue
                try:
                    ts = datetime.fromisoformat(parts[0]).timestamp()
                    solar = float(parts[1] or 0)
                    soc = int(float(parts[2] or 0))
                    soh = int(float(parts[3] or 0))
                    output = float(parts[11] or 0)
                    charge = float(parts[12] or 0)
                    temp = float(parts[13] or 0)
                except (ValueError, IndexError):
                    continue
                accumulator.update(
                    solar_watts=solar,
                    output_watts=output,
                    charge_watts=charge,
                    ts=ts,
                    soc=soc,
                    soh=soh,
                    temp=temp,
                )
                count += 1
    except Exception as e:
        logger.warning("restore_accumulator read failed: %s", e)
        return
    if count:
        logger.info("Restored accumulator from %d archive rows for %s", count, today)


async def cleanup_loop():
    """Run DB cleanup + archive compression every 6 hours."""
    while True:
        await asyncio.sleep(21600)  # 6 hours
        try:
            # Compress yesterday's CSV archive to .gz
            gz_count = compress_old_archives()
            if gz_count:
                logger.info("Archive: compressed %d daily CSV files to .gz", gz_count)
            # Thin out legacy readings rows
            count = await cleanup_old_readings()
            if count:
                logger.info("DB cleanup: compressed %d legacy readings", count)
        except Exception as e:
            logger.error("Cleanup error: %s", e)


async def daily_forecast_loop():
    """Once a day (around 01:00 local) persist an Open-Meteo forecast snapshot
    for tomorrow's solar production. Feeds /api/forecast-accuracy over time.

    Also retrains the solar + load ML models and saves a prediction for
    tomorrow under source='ml_solar' / 'ml_load'.
    """
    from app.forecast import fetch_openmeteo_daily_kwh
    from app.ml_models import retrain_and_save, predict_tomorrow_internal
    tz = ZoneInfo(TIMEZONE)
    while True:
        now = datetime.now(tz)
        # Schedule next run at 01:07 local (off-minute to avoid fleet collisions)
        next_run = now.replace(hour=1, minute=7, second=0, microsecond=0)
        if next_run <= now:
            next_run += timedelta(days=1)
        sleep_s = (next_run - now).total_seconds()
        try:
            await asyncio.sleep(sleep_s)
        except asyncio.CancelledError:
            return
        try:
            tomorrow = (datetime.now(tz) + timedelta(days=1)).strftime("%Y-%m-%d")
            om = await fetch_openmeteo_daily_kwh(tomorrow)
            if om is not None:
                await insert_forecast(
                    date=tomorrow,
                    source="openmeteo",
                    predicted_kwh=om.get("predicted_kwh", 0),
                    features_json=json.dumps(om.get("features", {})),
                )
                logger.info(
                    "Forecast saved: openmeteo %s = %.2f kWh",
                    tomorrow, om.get("predicted_kwh", 0),
                )
            # Retrain local ML on all historical (features, actuals) and save
            try:
                await retrain_and_save()
                ml_pred = await predict_tomorrow_internal()
                if ml_pred:
                    if "solar_kwh" in ml_pred:
                        await insert_forecast(
                            date=tomorrow, source="ml_solar",
                            predicted_kwh=ml_pred["solar_kwh"],
                            features_json=json.dumps(ml_pred.get("features", {})),
                        )
                    if "load_kwh" in ml_pred:
                        await insert_forecast(
                            date=tomorrow, source="ml_load",
                            predicted_kwh=0,
                            predicted_load_kwh=ml_pred["load_kwh"],
                        )
                    logger.info("ML forecast saved: %s", ml_pred)
            except Exception as e:
                logger.warning("ML retrain/predict failed: %s", e)
        except Exception as e:
            logger.error("daily_forecast_loop error: %s", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global latest_data
    await init_db()
    await restore_accumulator()
    compress_old_archives()  # Gzip any leftover CSVs from before restart
    battery_cycles.load()    # Load cycles state (backfills from archive on first run)
    # Load last reading as fallback so dashboard isn't empty on reload
    last = await get_latest_reading()
    if last:
        latest_data = last
        logger.info("Loaded last reading from DB as initial data")
    # Connect to Anker MQTT (non-blocking — server starts immediately)
    try:
        await client.connect()
        await client.start_mqtt(on_mqtt_data)
        logger.info("Anker MQTT connected - device: %s", client.device_name)
    except Exception as e:
        logger.error("Anker connection failed: %s — Background-Reconnect aktiv", e)
        asyncio.create_task(_background_reconnect())

    task = asyncio.create_task(broadcast_loop())
    cleanup_task = asyncio.create_task(cleanup_loop())
    forecast_task = asyncio.create_task(daily_forecast_loop())
    yield
    task.cancel()
    cleanup_task.cancel()
    forecast_task.cancel()
    # Final snapshot: persist today's stats so a deploy doesn't lose live state
    try:
        today = accumulator.get_today()
        if today.get("date"):
            await upsert_daily(today["date"], today)
    except Exception as e:
        logger.warning("Final upsert_daily on shutdown failed: %s", e)
    battery_cycles.save(force=True)
    try:
        if _archive_file and not _archive_file.closed:
            _archive_file.flush()
            _archive_file.close()
    except Exception:
        pass
    await close_pool()
    await client.close()


app = FastAPI(lifespan=lifespan)


# === Auth ====================================================================
# When DASHBOARD_PASSWORD is empty, the dashboard stays public (backwards
# compatible). When set, /api/* and / require a session cookie issued by
# POST /auth/login with that password. /static/*, /auth/*, /api/health, and
# /metrics stay open so the login page can load and fly.io health checks work.
AUTH_SECRET = os.getenv("DASHBOARD_AUTH_SECRET", "") or (DASHBOARD_PASSWORD or "anker-dev-secret")
SESSION_COOKIE = "anker_session"
SESSION_TTL_S = 60 * 60 * 24 * 30  # 30 days

OPEN_PATHS = {"/api/health", "/metrics", "/auth/login", "/auth/logout", "/favicon.ico"}


def _sign_session() -> str:
    expiry = int(time.time()) + SESSION_TTL_S
    payload = f"ok:{expiry}"
    sig = hmac.new(AUTH_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}:{sig}"


def _verify_session(cookie: str | None) -> bool:
    if not cookie:
        return False
    try:
        parts = cookie.split(":")
        if len(parts) != 3:
            return False
        payload = f"{parts[0]}:{parts[1]}"
        expected = hmac.new(AUTH_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, parts[2]):
            return False
        expiry = int(parts[1])
        return time.time() < expiry
    except Exception:
        return False


@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    # No auth configured → fully open
    if not DASHBOARD_PASSWORD:
        return await call_next(request)
    path = request.url.path
    if (
        path in OPEN_PATHS
        or path.startswith("/static/")
        or path.startswith("/auth/")
    ):
        return await call_next(request)
    cookie = request.cookies.get(SESSION_COOKIE)
    if _verify_session(cookie):
        return await call_next(request)
    # API requests → 401 JSON; navigations → redirect to login
    if path.startswith("/api/") or path == "/ws":
        return JSONResponse({"error": "unauthorized"}, status_code=401)
    return RedirectResponse(url="/auth/login", status_code=302)


@app.get("/auth/login")
async def auth_login_page():
    if not DASHBOARD_PASSWORD:
        return RedirectResponse(url="/", status_code=302)
    return FileResponse(STATIC / "login.html")


@app.post("/auth/login")
async def auth_login_submit(request: Request):
    if not DASHBOARD_PASSWORD:
        return RedirectResponse(url="/", status_code=302)
    form = await request.form()
    password = form.get("password", "")
    if not hmac.compare_digest(password, DASHBOARD_PASSWORD):
        return JSONResponse({"error": "wrong_password"}, status_code=401)
    resp = JSONResponse({"ok": True})
    resp.set_cookie(
        SESSION_COOKIE, _sign_session(),
        max_age=SESSION_TTL_S, httponly=True, samesite="lax",
        secure=True, path="/",
    )
    return resp


@app.get("/auth/logout")
async def auth_logout():
    resp = RedirectResponse(url="/auth/login", status_code=302)
    resp.delete_cookie(SESSION_COOKIE, path="/")
    return resp


@app.get("/")
async def index():
    return FileResponse(STATIC / "index.html")


app.mount("/static", StaticFiles(directory=str(STATIC)), name="static")


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    ws_clients.add(ws)
    try:
        if latest_data:
            await ws.send_text(json.dumps(latest_data))
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        ws_clients.discard(ws)


@app.get("/api/daily")
async def api_daily(days: int = Query(30, ge=1, le=365)):
    return await get_daily(days)


@app.get("/api/monthly")
async def api_monthly(months: int = Query(12, ge=1, le=60)):
    return await get_monthly(months)


@app.get("/api/yearly")
async def api_yearly():
    return await get_yearly()


def _read_archive_rows(cutoff_str: str, before_str: str) -> list[dict]:
    """Read archive rows between cutoff_str and before_str (ISO timestamps)."""
    rows: list[dict] = []
    cutoff_date = cutoff_str[:10]
    before_date = before_str[:10]
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

    # Read gzipped daily archives
    for gz_path in sorted(ARCHIVE_DIR.glob("*.csv.gz")):
        file_date = gz_path.stem.replace(".csv", "")  # "2026-04-08.csv.gz" -> "2026-04-08"
        if file_date < cutoff_date or file_date > before_date:
            continue
        try:
            with gzip.open(gz_path, "rt") as f:
                next(f, None)  # skip header
                for line in f:
                    parts = line.strip().split(",")
                    if len(parts) < 14:
                        continue
                    ts = parts[0]
                    if ts < cutoff_str or ts >= before_str:
                        continue
                    rows.append({
                        "timestamp": ts,
                        "solar_watts": float(parts[1] or 0),
                        "battery_soc": int(float(parts[2] or 0)),
                        "battery_soh": int(float(parts[3] or 0)),
                        "ac_output_watts": float(parts[4] or 0),
                        "dc_output_watts": float(parts[5] or 0),
                        "dc_12v_watts": float(parts[6] or 0),
                        "usbc_1_watts": float(parts[7] or 0),
                        "usbc_2_watts": float(parts[8] or 0),
                        "usbc_3_watts": float(parts[9] or 0),
                        "usba_1_watts": float(parts[10] or 0),
                        "total_output_watts": float(parts[11] or 0),
                        "ac_input_watts": float(parts[12] or 0),
                        "temperature": float(parts[13] or 0),
                    })
        except Exception as e:
            logger.warning("Failed to read archive %s: %s", gz_path, e)

    # Read open daily CSVs
    for csv_path in sorted(ARCHIVE_DIR.glob("*.csv")):
        file_date = csv_path.stem
        if file_date < cutoff_date or file_date > before_date:
            continue
        try:
            with open(csv_path, "r") as f:
                next(f, None)
                for line in f:
                    parts = line.strip().split(",")
                    if len(parts) < 14:
                        continue
                    ts = parts[0]
                    if ts < cutoff_str or ts >= before_str:
                        continue
                    rows.append({
                        "timestamp": ts,
                        "solar_watts": float(parts[1] or 0),
                        "battery_soc": int(float(parts[2] or 0)),
                        "battery_soh": int(float(parts[3] or 0)),
                        "ac_output_watts": float(parts[4] or 0),
                        "dc_output_watts": float(parts[5] or 0),
                        "dc_12v_watts": float(parts[6] or 0),
                        "usbc_1_watts": float(parts[7] or 0),
                        "usbc_2_watts": float(parts[8] or 0),
                        "usbc_3_watts": float(parts[9] or 0),
                        "usba_1_watts": float(parts[10] or 0),
                        "total_output_watts": float(parts[11] or 0),
                        "ac_input_watts": float(parts[12] or 0),
                        "temperature": float(parts[13] or 0),
                    })
        except Exception as e:
            logger.warning("Failed to read archive %s: %s", csv_path, e)

    return rows


# === Archive cache ==========================================================
# Cache parsed archive rows by coarse hour-bucket so /api/readings reloads
# don't re-scan the whole gzip tree. Hot buckets (24h, 168h) stay in RAM.
_archive_cache: dict[tuple[int, int], tuple[float, list]] = {}
_ARCHIVE_CACHE_TTL = 60  # seconds — fresh rows land in today's CSV regardless


async def _cached_readings(hours: int) -> list:
    # Round timestamp to the nearest 5-minute boundary so the cache key is
    # stable across many requests in a short window but still refreshes
    # quickly enough to pick up new data.
    bucket = int(time.time() // _ARCHIVE_CACHE_TTL)
    key = (hours, bucket)
    cached = _archive_cache.get(key)
    if cached:
        return cached[1]
    rows = await get_readings(hours)
    _archive_cache.clear()  # keep cache small: one live entry at a time
    _archive_cache[key] = (time.time(), rows)
    return rows


@app.get("/api/readings")
async def api_readings(hours: int = Query(24, ge=1, le=8760)):
    """Chart readings straight from the CSV archive, cached for 60 s."""
    return await _cached_readings(hours)


@app.get("/api/stats")
async def api_stats():
    return await get_stats(ELECTRICITY_PRICE_EUR)


@app.get("/api/energy")
async def api_energy():
    summary = await get_energy_summary()
    # Add price calculation
    for period in summary.values():
        period["savings_eur"] = round(period["solar_kwh"] * ELECTRICITY_PRICE_EUR, 2)
    return summary


@app.get("/api/csv")
async def api_csv(hours: int = Query(24, ge=1, le=8760)):
    """CSV export from archive (deduplicated raw data, filtered by hours)."""
    import io

    tz = ZoneInfo(TIMEZONE)
    cutoff = datetime.now(tz) - timedelta(hours=hours)
    cutoff_str = cutoff.isoformat(timespec="seconds")

    output = io.StringIO()
    output.write(ARCHIVE_HEADER)

    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

    # Read from gzip archives
    for gz_path in sorted(ARCHIVE_DIR.glob("*.csv.gz")):
        # Quick date filter: skip files clearly before cutoff
        file_date = gz_path.name.split(".")[0]  # "2026-04-08.csv.gz" → "2026-04-08"
        if file_date < cutoff.strftime("%Y-%m-%d"):
            continue
        with gzip.open(gz_path, "rt") as f:
            for i, line in enumerate(f):
                if i == 0:
                    continue
                ts = line.split(",", 1)[0]
                if ts >= cutoff_str:
                    output.write(line)

    # Read from today's open CSV
    for csv_path in sorted(ARCHIVE_DIR.glob("*.csv")):
        file_date = csv_path.stem
        if file_date < cutoff.strftime("%Y-%m-%d"):
            continue
        with open(csv_path, "r") as f:
            for i, line in enumerate(f):
                if i == 0:
                    continue
                ts = line.split(",", 1)[0]
                if ts >= cutoff_str:
                    output.write(line)

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=solar-data-{hours}h.csv"}
    )


@app.get("/api/soh")
async def api_soh():
    return await get_soh_trend()


@app.get("/api/daily-stats")
async def api_daily_stats(days: int = Query(30, ge=1, le=9999)):
    return await get_daily_stats(days)


@app.get("/api/backup")
async def api_backup():
    """Full backup: all archived 3s data + today's live data as one big CSV."""
    import io

    output = io.StringIO()
    output.write(ARCHIVE_HEADER)

    # 1. Read all gzipped archives (oldest first)
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    for gz_path in sorted(ARCHIVE_DIR.glob("*.csv.gz")):
        with gzip.open(gz_path, "rt") as f:
            for i, line in enumerate(f):
                if i == 0:
                    continue  # Skip header
                output.write(line)

    # 2. Read today's open CSV (not yet gzipped)
    for csv_path in sorted(ARCHIVE_DIR.glob("*.csv")):
        with open(csv_path, "r") as f:
            for i, line in enumerate(f):
                if i == 0:
                    continue  # Skip header
                output.write(line)

    ts = datetime.now(ZoneInfo(TIMEZONE)).strftime("%Y%m%d_%H%M")
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=solar-backup-{ts}.csv"}
    )


@app.get("/api/archive-stats")
async def api_archive_stats():
    """Show archive storage stats."""
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    gz_files = sorted(ARCHIVE_DIR.glob("*.csv.gz"))
    csv_files = sorted(ARCHIVE_DIR.glob("*.csv"))
    total_gz = sum(f.stat().st_size for f in gz_files)
    total_csv = sum(f.stat().st_size for f in csv_files)
    return {
        "archive_days": len(gz_files) + len(csv_files),
        "gz_files": len(gz_files),
        "csv_files": len(csv_files),
        "total_size_mb": round((total_gz + total_csv) / 1024 / 1024, 2),
        "oldest": gz_files[0].name.split(".")[0] if gz_files else (csv_files[0].stem if csv_files else None),
        "newest": csv_files[-1].stem if csv_files else (gz_files[-1].name.split(".")[0] if gz_files else None),
    }


@app.get("/api/live")
async def api_live(since: str = None, refresh: bool = False):
    """Returns latest MQTT data, or 304 if unchanged since given timestamp.

    With refresh=true, forces a fresh read from the MQTT cache to ensure
    the most current data (useful after page reload).
    """
    if refresh and client.device_sn:
        # Pull fresh data directly from MQTT session cache
        raw = client.get_status()
        if raw:
            await on_mqtt_data(raw)
    if since and latest_data.get("timestamp") == since:
        return Response(status_code=304)
    return latest_data or {}


@app.get("/api/status")
async def api_status():
    return {
        "connected": bool(client.device_sn),
        "device_sn": client.device_sn,
        "device_name": client.device_name,
        "mqtt_active": client._mqtt_task is not None and not client._mqtt_task.done(),
    }


@app.get("/api/battery-cycles")
async def api_battery_cycles():
    """Pre-computed battery cycle stats. Replaces the old client-side
    calculation that fetched a full year of /api/readings on every load."""
    return battery_cycles.stats()


@app.get("/api/break-even")
async def api_break_even():
    """Cumulative savings vs system cost + linear projection to break-even."""
    return await get_cumulative_savings(ELECTRICITY_PRICE_EUR, SYSTEM_COST_EUR)


@app.get("/api/forecast-accuracy")
async def api_forecast_accuracy(days: int = Query(60, ge=7, le=365)):
    """Per-source forecast accuracy over the last N days (MAE/MAPE/RMSE)."""
    return await get_forecast_accuracy(days)


@app.get("/api/anomaly")
async def api_anomaly():
    """Z-score anomaly snapshot for current hour vs weekday baseline."""
    from app.anomaly import current_anomaly
    return await current_anomaly()


@app.get("/api/ml-forecast")
async def api_ml_forecast(target: str = Query("solar", pattern="^(solar|load)$")):
    """Local ML forecast for tomorrow, returns both Open-Meteo + local prediction."""
    from app.ml_models import predict_tomorrow
    return await predict_tomorrow(target)


@app.get("/api/health")
async def api_health():
    """Runtime + storage health for fly.io health-check + dashboards."""
    import os
    import resource
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    gz_files = list(ARCHIVE_DIR.glob("*.csv.gz"))
    csv_files = list(ARCHIVE_DIR.glob("*.csv"))
    archive_mb = round(
        (sum(f.stat().st_size for f in gz_files)
         + sum(f.stat().st_size for f in csv_files)) / 1024 / 1024, 2
    )
    try:
        db_mb = round(os.path.getsize(str(client.device_sn and client.device_sn or "")) / 1024 / 1024, 2) if False else 0.0
    except Exception:
        db_mb = 0.0
    try:
        from app.config import DB_PATH
        db_mb = round(os.path.getsize(str(DB_PATH)) / 1024 / 1024, 2)
    except Exception:
        pass
    # Memory (RSS in KB on Linux, bytes on macOS — normalise to MB)
    try:
        rss = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
        if os.uname().sysname == "Darwin":
            memory_mb = round(rss / 1024 / 1024, 1)
        else:
            memory_mb = round(rss / 1024, 1)
    except Exception:
        memory_mb = 0.0
    last_mqtt_s = round(time.time() - _last_mqtt_time, 1) if _last_mqtt_time else None
    status_code = 200 if (last_mqtt_s is None or last_mqtt_s < 600) else 503
    body = {
        "status": "ok" if status_code == 200 else "stale",
        "archive_days": len(gz_files) + len(csv_files),
        "archive_mb": archive_mb,
        "db_mb": db_mb,
        "ws_clients": len(ws_clients),
        "last_mqtt_s": last_mqtt_s,
        "memory_mb": memory_mb,
        "mqtt_connected": bool(client.device_sn),
        "battery_cycles_total": battery_cycles.total_cycles,
    }
    from fastapi import Response as FastAPIResponse
    return FastAPIResponse(
        content=json.dumps(body),
        media_type="application/json",
        status_code=status_code,
    )


@app.get("/metrics")
async def prometheus_metrics():
    """Prometheus exposition — scrape-friendly plain text."""
    lines: list[str] = []

    def gauge(name: str, value, help_text: str, labels: dict | None = None):
        lines.append(f"# HELP {name} {help_text}")
        lines.append(f"# TYPE {name} gauge")
        if labels:
            lbl = ",".join(f'{k}="{v}"' for k, v in labels.items())
            lines.append(f"{name}{{{lbl}}} {value}")
        else:
            lines.append(f"{name} {value}")

    ld = latest_data or {}
    gauge("anker_solar_watts", ld.get("solar_watts", 0), "Current solar power in W")
    gauge("anker_output_watts", ld.get("total_output_watts", 0), "Current load draw in W")
    gauge("anker_ac_input_watts", ld.get("ac_input_watts", 0), "Current AC grid input in W")
    gauge("anker_battery_soc_pct", ld.get("battery_soc", 0), "Battery state of charge in %")
    gauge("anker_battery_soh_pct", ld.get("battery_soh", 0), "Battery state of health in %")
    gauge("anker_temperature_c", ld.get("temperature", 0), "Device temperature in °C")
    gauge("anker_daily_solar_kwh", ld.get("daily_kwh", 0), "Today's solar energy in kWh")
    gauge("anker_daily_output_kwh", ld.get("daily_output_kwh", 0), "Today's load energy in kWh")
    gauge("anker_daily_direct_use_kwh", ld.get("daily_direct_use_kwh", 0), "Today's direct-use solar in kWh")
    gauge("anker_daily_battery_in_kwh", ld.get("daily_battery_in_kwh", 0), "Today's battery charge in kWh")
    gauge("anker_daily_battery_out_kwh", ld.get("daily_battery_out_kwh", 0), "Today's battery discharge in kWh")
    gauge("anker_autarkie_pct", ld.get("autarkie_pct", 0), "Today's autarky percentage")
    gauge("anker_direct_use_pct", ld.get("direct_use_pct", 0), "Today's direct-use percentage")
    gauge("anker_rte_pct", ld.get("rte_pct", 0), "Today's battery round-trip efficiency")
    gauge("anker_battery_cycles_total", battery_cycles.total_cycles, "Lifetime battery cycles")
    gauge("anker_battery_cycles_today", battery_cycles.today_cycles, "Today's battery cycles")
    gauge("anker_ws_clients", len(ws_clients), "Connected WebSocket clients")
    gauge("anker_mqtt_connected", 1 if client.device_sn else 0, "MQTT connection status")
    gauge(
        "anker_last_mqtt_age_seconds",
        round(time.time() - _last_mqtt_time, 1) if _last_mqtt_time else 0,
        "Seconds since last MQTT message",
    )

    return Response(content="\n".join(lines) + "\n", media_type="text/plain; version=0.0.4")
