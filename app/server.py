import asyncio
import gzip
import json
import logging
import time
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.config import TIMEZONE, WS_BROADCAST_INTERVAL, ELECTRICITY_PRICE_EUR, BATTERY_CAPACITY_WH
from app.database import (
    init_db, insert_reading, upsert_daily, update_monthly,
    update_yearly, get_daily, get_monthly, get_yearly,
    get_readings, get_latest_reading, get_stats, get_energy_summary,
    get_soh_trend, get_daily_stats, cleanup_old_readings,
)
from app.accumulator import SolarAccumulator
from app.anker_client import AnkerClient

logger = logging.getLogger(__name__)
STATIC = Path(__file__).parent / "static"
ARCHIVE_DIR = Path(__file__).resolve().parent.parent / "data" / "archive"

# Shared state
client = AnkerClient()
accumulator = SolarAccumulator()
ws_clients: set[WebSocket] = set()
latest_data: dict = {}
last_db_write: float = 0

# === CSV Archive (all 3s MQTT data) ===
ARCHIVE_HEADER = "timestamp,solar_watts,battery_soc,battery_soh,ac_output_watts,dc_output_watts,dc_12v_watts,usbc_1_watts,usbc_2_watts,usbc_3_watts,usba_1_watts,total_output_watts,ac_input_watts,temperature\n"
_archive_file = None
_archive_date: str = ""
_archive_last_values: tuple = ()
_archive_last_write: float = 0

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
    """Append MQTT reading to today's CSV — only if values changed or 5min heartbeat."""
    global _archive_last_values, _archive_last_write

    now = time.time()
    current_values = tuple(data.get(k, 0) for k in ARCHIVE_FIELDS)

    # Skip if identical to last write AND less than 5 min since last write
    if current_values == _archive_last_values and (now - _archive_last_write) < 300:
        return

    tz = ZoneInfo(TIMEZONE)
    date_str = datetime.now(tz).strftime("%Y-%m-%d")
    f = _get_archive_file(date_str)
    row = data.get("timestamp", "") + "," + ",".join(str(v) for v in current_values)
    f.write(row + "\n")

    _archive_last_values = current_values
    _archive_last_write = now


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
    """Called for each MQTT status update."""
    global latest_data, last_db_write

    data = extract_data(raw)
    now = time.time()
    tz = ZoneInfo(TIMEZONE)
    data["timestamp"] = datetime.now(tz).isoformat(timespec="seconds")

    # Update accumulator
    finalized = accumulator.update(
        solar_watts=data["solar_watts"],
        output_watts=data["total_output_watts"],
        charge_watts=data["ac_input_watts"],
        ts=now,
    )

    # If a day was finalized, persist it
    if finalized:
        await upsert_daily(
            finalized["date"], finalized["solar_kwh"], finalized["peak_watts"],
            finalized["solar_hours"], finalized["total_output_kwh"],
            finalized["total_charge_kwh"], finalized["samples"],
        )
        month = finalized["date"][:7]
        year = finalized["date"][:4]
        await update_monthly(month)
        await update_yearly(year)

    # Skip pure 0-spike readings only at startup (no previous good data to fall back on)
    if data.get("battery_soc", 0) == 0 and data.get("temperature", 0) == 0:
        return

    # Archive every MQTT reading to daily CSV (dedup is inside archive_reading)
    archive_reading(data)

    # Save reading to SQLite every 60s (for live charts only)
    if now - last_db_write >= 60:
        await insert_reading(data)
        today = accumulator.get_today()
        if today["date"]:
            await upsert_daily(
                today["date"], today["solar_kwh"], today["peak_watts"],
                today["solar_hours"], today["total_output_kwh"],
                today["total_charge_kwh"], today["samples"],
            )
        last_db_write = now

    # Merge accumulator data for broadcast
    today = accumulator.get_today()
    latest_data = {
        **data,
        "daily_kwh": today["solar_kwh"],
        "daily_peak_watts": today["peak_watts"],
        "solar_hours": today["solar_hours"],
        "daily_output_kwh": today["total_output_kwh"],
        "daily_charge_kwh": today["total_charge_kwh"],
        "daily_savings_eur": round(today["solar_kwh"] * ELECTRICITY_PRICE_EUR, 2),
        "price_per_kwh": ELECTRICITY_PRICE_EUR,
        "device_name": client.device_name,
    }

    # Battery time estimation
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

    latest_data["battery_time_hours"] = battery_time
    latest_data["battery_charging"] = battery_charging


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
    """Restore today's accumulator state from DB readings."""
    tz = ZoneInfo(TIMEZONE)
    today = datetime.now(tz).strftime("%Y-%m-%d")
    db = await import_module_get_db()
    try:
        rows = await db.execute_fetchall(
            "SELECT timestamp, solar_watts, total_output_watts, ac_input_watts "
            "FROM readings WHERE timestamp LIKE ? ORDER BY timestamp ASC",
            (today + "%",),
        )
        if not rows:
            return
        for row in rows:
            ts_str, solar, output, charge = row[0], row[1], row[2], row[3]
            ts = datetime.fromisoformat(ts_str).timestamp()
            accumulator.update(solar, output, charge, ts)
        logger.info("Restored accumulator from %d readings for %s", len(rows), today)
    finally:
        await db.close()


async def import_module_get_db():
    from app.database import get_db
    return await get_db()


async def cleanup_loop():
    """Run DB cleanup + archive compression every 6 hours."""
    while True:
        await asyncio.sleep(21600)  # 6 hours
        try:
            # Compress yesterday's CSV archive to .gz
            gz_count = compress_old_archives()
            if gz_count:
                logger.info("Archive: compressed %d daily CSV files to .gz", gz_count)
            # Thin out SQLite readings (only needed for charts)
            count = await cleanup_old_readings()
            if count:
                logger.info("DB cleanup: compressed %d readings", count)
        except Exception as e:
            logger.error("Cleanup error: %s", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global latest_data
    await init_db()
    await restore_accumulator()
    compress_old_archives()  # Gzip any leftover CSVs from before restart
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
    yield
    task.cancel()
    cleanup_task.cancel()
    await client.close()


app = FastAPI(lifespan=lifespan)


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


@app.get("/api/readings")
async def api_readings(hours: int = Query(24, ge=1, le=8760)):
    """Return chart readings combining DB (last 2 days, high-res) + CSV archive (older, delta storage)."""
    tz = ZoneInfo(TIMEZONE)
    now = datetime.now(tz)
    cutoff = now - timedelta(hours=hours)
    cutoff_str = cutoff.isoformat(timespec="seconds")

    # DB has high-res data for last 2 days
    db_cutoff = now - timedelta(days=2)
    db_rows = await get_readings(min(hours, 48))

    # If we need older data, read from archive
    archive_rows: list[dict] = []
    if hours > 48:
        archive_before = db_cutoff.isoformat(timespec="seconds")
        archive_rows = _read_archive_rows(cutoff_str, archive_before)

    # Merge: archive (older) first, then DB (newer)
    merged = archive_rows + db_rows
    # Dedupe by timestamp (DB wins over archive)
    seen = set()
    out: list[dict] = []
    for r in reversed(merged):  # process newest first
        ts = r.get("timestamp")
        if ts in seen:
            continue
        seen.add(ts)
        out.append(r)
    out.reverse()
    return out


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
