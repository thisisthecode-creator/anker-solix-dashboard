"""SQLite access layer.

The live MQTT stream no longer writes to the `readings` table — that data now
lives exclusively in the CSV/gzip archive. SQLite only holds per-day / per-month
/ per-year aggregates (cheap to query) plus a forecast_log for accuracy tracking.

`readings` still exists as a CREATE TABLE IF NOT EXISTS to keep historical rows
readable during the transition, but nothing new is inserted. It can be dropped
once the archive has enough runway to cover all queries.
"""
import gzip
import logging
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

import aiosqlite

from app.config import DB_PATH, TIMEZONE

_TZ = ZoneInfo(TIMEZONE)


def _now_local() -> datetime:
    """Always return a TZ-aware local datetime so cutoff strings match the
    archive / daily_solar date format regardless of container TZ env var."""
    return datetime.now(_TZ)

logger = logging.getLogger(__name__)

ARCHIVE_DIR = Path(__file__).resolve().parent.parent / "data" / "archive"


# --- New columns added to daily_solar (migrated on init) ---
DAILY_SOLAR_EXTRA_COLUMNS = [
    # Energy breakdown
    ("direct_use_kwh", "REAL DEFAULT 0"),
    ("battery_in_kwh", "REAL DEFAULT 0"),
    ("battery_out_kwh", "REAL DEFAULT 0"),
    # Derived percentages
    ("direct_use_pct", "REAL DEFAULT 0"),
    ("autarkie_pct", "REAL DEFAULT 0"),
    ("rte_pct", "REAL DEFAULT 0"),
    # Daily stats (replaces readings-table aggregates)
    ("peak_output_w", "REAL DEFAULT 0"),
    ("avg_solar_w", "REAL DEFAULT 0"),
    ("avg_output_w", "REAL DEFAULT 0"),
    ("avg_temp", "REAL DEFAULT 0"),
    ("min_temp", "REAL DEFAULT 0"),
    ("max_temp", "REAL DEFAULT 0"),
    ("min_soc", "INTEGER DEFAULT 0"),
    ("max_soc", "INTEGER DEFAULT 0"),
    ("avg_soh", "REAL DEFAULT 0"),
]


# === Global connection pool (single connection, WAL mode) =====================
# aiosqlite is safe to share one connection across an asyncio event loop.
# init_db() is always awaited first in lifespan, so subsequent get_pool() calls
# hit the already-initialised connection — no locking needed in practice.
_db: aiosqlite.Connection | None = None


async def get_pool() -> aiosqlite.Connection:
    """Return the shared pooled connection. Initialises on first call."""
    global _db
    if _db is None:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        _db = await aiosqlite.connect(str(DB_PATH))
        _db.row_factory = aiosqlite.Row
        await _db.execute("PRAGMA journal_mode=WAL")
        await _db.execute("PRAGMA synchronous=NORMAL")
        await _db.execute("PRAGMA busy_timeout=5000")
    return _db


async def close_pool():
    global _db
    if _db is not None:
        try:
            await _db.close()
        except Exception as e:
            logger.warning("DB close error: %s", e)
        _db = None


# Legacy shim — some callers still do `db = await get_db()` / `await db.close()`.
# Return the pooled connection and make `.close()` a no-op so old code paths work
# without leaking or closing the shared handle.
class _PooledHandle:
    def __init__(self, real):
        self._real = real

    def __getattr__(self, name):
        return getattr(self._real, name)

    async def close(self):
        # Intentionally no-op: the pool owns the real connection.
        return


async def get_db():
    real = await get_pool()
    return _PooledHandle(real)


# === Init + schema migration =================================================

async def init_db():
    db = await get_pool()
    await db.executescript("""
        CREATE TABLE IF NOT EXISTS readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            solar_watts REAL DEFAULT 0,
            battery_soc INTEGER DEFAULT 0,
            battery_soh INTEGER DEFAULT 0,
            ac_output_watts REAL DEFAULT 0,
            dc_12v_watts REAL DEFAULT 0,
            usbc_1_watts REAL DEFAULT 0,
            usbc_2_watts REAL DEFAULT 0,
            usbc_3_watts REAL DEFAULT 0,
            usba_1_watts REAL DEFAULT 0,
            dc_output_watts REAL DEFAULT 0,
            total_output_watts REAL DEFAULT 0,
            ac_input_watts REAL DEFAULT 0,
            temperature REAL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_readings_ts ON readings(timestamp);

        CREATE TABLE IF NOT EXISTS daily_solar (
            date TEXT PRIMARY KEY,
            solar_kwh REAL DEFAULT 0,
            peak_watts REAL DEFAULT 0,
            solar_hours REAL DEFAULT 0,
            total_output_kwh REAL DEFAULT 0,
            total_charge_kwh REAL DEFAULT 0,
            samples INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS monthly_solar (
            month TEXT PRIMARY KEY,
            solar_kwh REAL DEFAULT 0,
            avg_daily_kwh REAL DEFAULT 0,
            peak_day_kwh REAL DEFAULT 0,
            total_output_kwh REAL DEFAULT 0,
            days_with_solar INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS yearly_solar (
            year TEXT PRIMARY KEY,
            solar_kwh REAL DEFAULT 0,
            avg_monthly_kwh REAL DEFAULT 0,
            best_month TEXT DEFAULT '',
            total_output_kwh REAL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS forecast_log (
            date TEXT NOT NULL,
            source TEXT NOT NULL,
            created_at TEXT NOT NULL,
            predicted_kwh REAL DEFAULT 0,
            predicted_load_kwh REAL DEFAULT 0,
            features_json TEXT DEFAULT '',
            PRIMARY KEY (date, source)
        );
        CREATE INDEX IF NOT EXISTS idx_forecast_log_date ON forecast_log(date);
    """)

    # --- Migrate: add extra columns to daily_solar if missing ---
    cur = await db.execute("PRAGMA table_info(daily_solar)")
    cols = await cur.fetchall()
    existing = {r[1] for r in cols}
    for col, ddl in DAILY_SOLAR_EXTRA_COLUMNS:
        if col not in existing:
            try:
                await db.execute(f"ALTER TABLE daily_solar ADD COLUMN {col} {ddl}")
                logger.info("Migrated daily_solar: added %s", col)
            except Exception as e:
                logger.warning("Could not add column %s: %s", col, e)
    await db.commit()


# === insert_reading: no-op (kept for backwards compat) =======================

async def insert_reading(data: dict):
    """Deprecated: readings table is no longer written to. Kept as a no-op
    so any legacy call sites (or tests) don't break."""
    return


# === upsert_daily (extended signature) =======================================

async def upsert_daily(date: str, data: dict):
    """Persist one day's full stats to daily_solar.

    `data` is the flat dict returned by SolarAccumulator.get_today().
    """
    db = await get_pool()
    await db.execute(
        """INSERT INTO daily_solar (
             date, solar_kwh, peak_watts, solar_hours,
             total_output_kwh, total_charge_kwh, samples,
             direct_use_kwh, battery_in_kwh, battery_out_kwh,
             direct_use_pct, autarkie_pct, rte_pct,
             peak_output_w, avg_solar_w, avg_output_w,
             avg_temp, min_temp, max_temp,
             min_soc, max_soc, avg_soh
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(date) DO UPDATE SET
             solar_kwh=excluded.solar_kwh, peak_watts=excluded.peak_watts,
             solar_hours=excluded.solar_hours,
             total_output_kwh=excluded.total_output_kwh,
             total_charge_kwh=excluded.total_charge_kwh, samples=excluded.samples,
             direct_use_kwh=excluded.direct_use_kwh,
             battery_in_kwh=excluded.battery_in_kwh,
             battery_out_kwh=excluded.battery_out_kwh,
             direct_use_pct=excluded.direct_use_pct,
             autarkie_pct=excluded.autarkie_pct, rte_pct=excluded.rte_pct,
             peak_output_w=excluded.peak_output_w,
             avg_solar_w=excluded.avg_solar_w, avg_output_w=excluded.avg_output_w,
             avg_temp=excluded.avg_temp,
             min_temp=excluded.min_temp, max_temp=excluded.max_temp,
             min_soc=excluded.min_soc, max_soc=excluded.max_soc,
             avg_soh=excluded.avg_soh""",
        (
            date,
            data.get("solar_kwh", 0),
            data.get("peak_watts", 0),
            data.get("solar_hours", 0),
            data.get("total_output_kwh", data.get("output_kwh", 0)),
            data.get("total_charge_kwh", data.get("charge_kwh", 0)),
            data.get("samples", 0),
            data.get("direct_use_kwh", 0),
            data.get("battery_in_kwh", 0),
            data.get("battery_out_kwh", 0),
            data.get("direct_use_pct", 0),
            data.get("autarkie_pct", 0),
            data.get("rte_pct", 0),
            data.get("peak_output_w", 0),
            data.get("avg_solar_w", 0),
            data.get("avg_output_w", 0),
            data.get("avg_temp", 0),
            data.get("min_temp", 0),
            data.get("max_temp", 0),
            data.get("min_soc", 0),
            data.get("max_soc", 0),
            data.get("avg_soh", 0),
        ),
    )
    await db.commit()


async def update_monthly(month: str):
    db = await get_pool()
    cur = await db.execute(
        """SELECT COALESCE(SUM(solar_kwh),0) as total,
                  COALESCE(AVG(solar_kwh),0) as avg_daily,
                  COALESCE(MAX(solar_kwh),0) as peak_day,
                  COALESCE(SUM(total_output_kwh),0) as output,
                  COUNT(CASE WHEN solar_kwh > 0.01 THEN 1 END) as days
           FROM daily_solar WHERE date LIKE ?||'%'""",
        (month,),
    )
    r = await cur.fetchone()
    if r:
        await db.execute(
            """INSERT INTO monthly_solar (month, solar_kwh, avg_daily_kwh,
               peak_day_kwh, total_output_kwh, days_with_solar)
               VALUES (?, ?, ?, ?, ?, ?)
               ON CONFLICT(month) DO UPDATE SET
               solar_kwh=excluded.solar_kwh, avg_daily_kwh=excluded.avg_daily_kwh,
               peak_day_kwh=excluded.peak_day_kwh, total_output_kwh=excluded.total_output_kwh,
               days_with_solar=excluded.days_with_solar""",
            (month, r[0], r[1], r[2], r[3], r[4]),
        )
        await db.commit()


async def update_yearly(year: str):
    db = await get_pool()
    cur = await db.execute(
        """SELECT COALESCE(SUM(solar_kwh),0),
                  COALESCE(AVG(solar_kwh),0),
                  COALESCE(SUM(total_output_kwh),0)
           FROM monthly_solar WHERE month LIKE ?||'%'""",
        (year,),
    )
    r = await cur.fetchone()
    cur2 = await db.execute(
        """SELECT month FROM monthly_solar
           WHERE month LIKE ?||'%' ORDER BY solar_kwh DESC LIMIT 1""",
        (year,),
    )
    best = await cur2.fetchone()
    if r:
        best_month = best[0] if best else ""
        await db.execute(
            """INSERT INTO yearly_solar (year, solar_kwh, avg_monthly_kwh,
               best_month, total_output_kwh)
               VALUES (?, ?, ?, ?, ?)
               ON CONFLICT(year) DO UPDATE SET
               solar_kwh=excluded.solar_kwh, avg_monthly_kwh=excluded.avg_monthly_kwh,
               best_month=excluded.best_month, total_output_kwh=excluded.total_output_kwh""",
            (year, r[0], r[1], best_month, r[2]),
        )
        await db.commit()


async def get_daily(days: int = 30) -> list[dict]:
    db = await get_pool()
    cur = await db.execute(
        "SELECT * FROM daily_solar ORDER BY date DESC LIMIT ?", (days,)
    )
    rows = await cur.fetchall()
    return [dict(r) for r in rows]


async def get_monthly(months: int = 12) -> list[dict]:
    db = await get_pool()
    cur = await db.execute(
        "SELECT * FROM monthly_solar ORDER BY month DESC LIMIT ?", (months,)
    )
    rows = await cur.fetchall()
    return [dict(r) for r in rows]


async def get_yearly() -> list[dict]:
    db = await get_pool()
    cur = await db.execute("SELECT * FROM yearly_solar ORDER BY year DESC")
    rows = await cur.fetchall()
    return [dict(r) for r in rows]


async def get_soh_trend():
    """SOH trend merged from daily_solar + legacy readings table.

    daily_solar has one row per day (populated by the new accumulator).
    The legacy readings table has per-reading battery_soh values for older
    days where daily_solar was not yet being filled. We merge both so the
    SOH chart shows the full history.
    """
    db = await get_pool()
    merged: dict[str, int] = {}
    # Legacy rows first (older), then daily_solar wins on collision
    try:
        cur = await db.execute(
            "SELECT date(timestamp) as day, ROUND(AVG(battery_soh)) as avg_soh "
            "FROM readings WHERE battery_soh > 0 "
            "GROUP BY date(timestamp)"
        )
        for r in await cur.fetchall():
            merged[r[0]] = int(r[1])
    except Exception as e:
        logger.warning("Legacy SOH query failed: %s", e)

    cur = await db.execute(
        "SELECT date, avg_soh FROM daily_solar WHERE avg_soh > 0"
    )
    for r in await cur.fetchall():
        merged[r[0]] = int(round(r[1]))

    return [{"date": d, "soh": s} for d, s in sorted(merged.items())]


async def get_daily_stats(days: int = 30):
    """Daily stats merged from daily_solar (new) + legacy readings aggregates.

    For days where daily_solar has all the new columns at 0 (either because
    the day predates the accumulator migration OR because the accumulator
    hasn't filled them yet), fall through to aggregating the legacy readings
    table for that same date. That way old days still show real numbers.
    """
    db = await get_pool()
    if days >= 9999:
        cur = await db.execute(
            "SELECT date, avg_solar_w, peak_watts, avg_temp, min_temp, max_temp, "
            "min_soc, max_soc, avg_output_w, peak_output_w "
            "FROM daily_solar ORDER BY date DESC"
        )
        cutoff = None
    else:
        cutoff = (_now_local() - timedelta(days=days)).strftime("%Y-%m-%d")
        cur = await db.execute(
            "SELECT date, avg_solar_w, peak_watts, avg_temp, min_temp, max_temp, "
            "min_soc, max_soc, avg_output_w, peak_output_w "
            "FROM daily_solar WHERE date >= ? ORDER BY date DESC",
            (cutoff,),
        )
    new_rows = await cur.fetchall()
    by_date: dict[str, dict] = {}
    for r in new_rows:
        by_date[r[0]] = {
            "date": r[0],
            "avg_solar": r[1] or 0,
            "peak_solar": r[2] or 0,
            "avg_temp": r[3] or 0,
            "min_temp": r[4] or 0,
            "max_temp": r[5] or 0,
            "min_soc": r[6] or 0,
            "max_soc": r[7] or 0,
            "avg_output": r[8] or 0,
            "peak_output": r[9] or 0,
        }

    # Legacy-fallback: aggregate the readings table for dates where
    # the new accumulator hasn't filled stats yet.
    try:
        if cutoff is None:
            legacy_cur = await db.execute(
                "SELECT date(timestamp) as day, "
                "ROUND(AVG(solar_watts), 1), MAX(solar_watts), "
                "ROUND(AVG(temperature), 1), MIN(temperature), MAX(temperature), "
                "MIN(battery_soc), MAX(battery_soc), "
                "ROUND(AVG(total_output_watts), 1), MAX(total_output_watts) "
                "FROM readings "
                "WHERE NOT (battery_soc = 0 AND temperature = 0) "
                "GROUP BY date(timestamp)"
            )
        else:
            legacy_cur = await db.execute(
                "SELECT date(timestamp) as day, "
                "ROUND(AVG(solar_watts), 1), MAX(solar_watts), "
                "ROUND(AVG(temperature), 1), MIN(temperature), MAX(temperature), "
                "MIN(battery_soc), MAX(battery_soc), "
                "ROUND(AVG(total_output_watts), 1), MAX(total_output_watts) "
                "FROM readings "
                "WHERE date(timestamp) >= ? "
                "  AND NOT (battery_soc = 0 AND temperature = 0) "
                "GROUP BY date(timestamp)",
                (cutoff,),
            )
        for r in await legacy_cur.fetchall():
            date = r[0]
            existing = by_date.get(date)
            # Only fill from legacy when the new row is empty (all stats ≈ 0)
            if existing is None or (
                (existing["avg_temp"] or 0) == 0 and (existing["min_soc"] or 0) == 0
                and (existing["max_soc"] or 0) == 0
            ):
                by_date[date] = {
                    "date": date,
                    "avg_solar": r[1] or 0,
                    "peak_solar": r[2] or 0,
                    "avg_temp": r[3] or 0,
                    "min_temp": r[4] or 0,
                    "max_temp": r[5] or 0,
                    "min_soc": r[6] or 0,
                    "max_soc": r[7] or 0,
                    "avg_output": r[8] or 0,
                    "peak_output": r[9] or 0,
                }
    except Exception as e:
        logger.warning("Legacy daily_stats fallback failed: %s", e)

    return sorted(by_date.values(), key=lambda d: d["date"], reverse=True)


async def cleanup_old_readings():
    """Prune the legacy readings table.

    Now that migrate_readings_to_archive consolidates rows into the daily
    archive on every startup, the readings table is expected to drain naturally
    (it's no longer being written to by on_mqtt_data). Retention is kept at
    60 days as a safety net so anything that slipped past the migration still
    has a chance to surface in /api/readings before being deleted.
    """
    db = await get_pool()
    cutoff = (_now_local() - timedelta(days=60)).strftime("%Y-%m-%d")
    cur = await db.execute(
        "DELETE FROM readings WHERE timestamp < ?", (cutoff,)
    )
    count = cur.rowcount
    await db.commit()
    if count > 0:
        try:
            await db.execute("VACUUM")
        except Exception as e:
            logger.warning("VACUUM failed: %s", e)
    return count


async def cleanup_old_forecasts(days_keep: int = 400) -> int:
    """Prune forecast_log rows older than days_keep.

    Forecasts + training-weather entries have long-term value for model
    accuracy analysis, but rows much older than a year add zero signal
    (weather patterns shift, the panel hasn't aged that much yet). Default
    retention: 400 days so we keep at least a full 365-day comparison window.
    """
    db = await get_pool()
    cutoff = (_now_local() - timedelta(days=days_keep)).strftime("%Y-%m-%d")
    cur = await db.execute(
        "DELETE FROM forecast_log WHERE date < ?", (cutoff,)
    )
    count = cur.rowcount
    await db.commit()
    return count


def _parse_archive_row(parts: list[str]) -> dict | None:
    """Parse one archive CSV row. Handles both legacy (14 col) and v2 (25 col).

    Legacy format: timestamp + 13 numeric fields.
    v2 format: timestamp + 13 numeric + 11 status/config fields.
    """
    if len(parts) < 14:
        return None
    try:
        row = {
            "timestamp": parts[0],
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
        }
    except (ValueError, IndexError):
        return None
    # v2 columns (status / config) — only present if archive has them
    if len(parts) >= 25:
        try:
            row["ac_switch"] = int(float(parts[14] or 0))
            row["dc_switch"] = int(float(parts[15] or 0))
            row["max_soc"] = int(float(parts[16] or 100))
            row["min_soc"] = int(float(parts[17] or 0))
            row["ac_input_limit"] = int(float(parts[18] or 0))
            row["display_switch"] = int(float(parts[19] or 0))
            row["display_mode"] = int(float(parts[20] or 0))
            row["usbc_1_status"] = int(float(parts[21] or 0))
            row["usbc_2_status"] = int(float(parts[22] or 0))
            row["usbc_3_status"] = int(float(parts[23] or 0))
            row["usba_1_status"] = int(float(parts[24] or 0))
        except (ValueError, IndexError):
            pass  # silently fall back to legacy fields only
    return row


async def get_latest_reading() -> dict | None:
    """Return the most recent archive row as a dict (or None).

    Reads the tail of today's open CSV (or yesterday's gzip if today is empty).
    Used as a startup fallback so the dashboard isn't blank on first load.
    """
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    csv_files = sorted(ARCHIVE_DIR.glob("*.csv"), reverse=True)
    gz_files = sorted(ARCHIVE_DIR.glob("*.csv.gz"), reverse=True)

    def _parse(line: str) -> dict | None:
        return _parse_archive_row(line.strip().split(","))

    for csv_path in csv_files:
        try:
            with open(csv_path, "r") as f:
                lines = f.readlines()
            for line in reversed(lines):
                if line.startswith("timestamp"):
                    continue
                parsed = _parse(line)
                if parsed:
                    return parsed
        except Exception as e:
            logger.warning("Failed to tail %s: %s", csv_path, e)

    for gz_path in gz_files:
        try:
            with gzip.open(gz_path, "rt") as f:
                lines = f.readlines()
            for line in reversed(lines):
                if line.startswith("timestamp"):
                    continue
                parsed = _parse(line)
                if parsed:
                    return parsed
        except Exception as e:
            logger.warning("Failed to tail %s: %s", gz_path, e)

    return None


async def get_readings(hours: int = 24) -> list[dict]:
    """Historical readings merged from the CSV archive AND the legacy
    `readings` SQLite table.

    The legacy table still holds rows from before we had the archive
    running (and from the pre-dedup era). Merging both sources keeps
    every historical row visible in charts + the MQTT log until the
    legacy table is either migrated or naturally drained by cleanup.

    Archive rows win on timestamp collision (they are the newer format).
    """
    tz_now = _now_local()
    cutoff = tz_now - timedelta(hours=hours)
    # Cutoff without TZ offset so it lexicographically compares correctly
    # against archive rows that include it.
    cutoff_str = cutoff.strftime("%Y-%m-%dT%H:%M:%S")
    cutoff_date = cutoff.strftime("%Y-%m-%d")

    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

    # --- Archive (newer source of truth) ---
    archive_rows: list[dict] = []
    for gz_path in sorted(ARCHIVE_DIR.glob("*.csv.gz")):
        file_date = gz_path.name.replace(".csv.gz", "")
        if file_date < cutoff_date:
            continue
        try:
            with gzip.open(gz_path, "rt") as f:
                next(f, None)
                for line in f:
                    parts = line.strip().split(",")
                    if len(parts) < 14:
                        continue
                    if parts[0] < cutoff_str:
                        continue
                    r = _parse_archive_row(parts)
                    if r and not (r["battery_soc"] == 0 and r["temperature"] == 0):
                        archive_rows.append(r)
        except Exception as e:
            logger.warning("Failed to read %s: %s", gz_path, e)

    for csv_path in sorted(ARCHIVE_DIR.glob("*.csv")):
        file_date = csv_path.stem
        if file_date < cutoff_date:
            continue
        try:
            with open(csv_path, "r") as f:
                next(f, None)
                for line in f:
                    parts = line.strip().split(",")
                    if len(parts) < 14:
                        continue
                    if parts[0] < cutoff_str:
                        continue
                    r = _parse_archive_row(parts)
                    if r and not (r["battery_soc"] == 0 and r["temperature"] == 0):
                        archive_rows.append(r)
        except Exception as e:
            logger.warning("Failed to read %s: %s", csv_path, e)

    # --- Legacy readings table (older source, still populated for early days) ---
    legacy_rows: list[dict] = []
    try:
        db = await get_pool()
        cur = await db.execute(
            """SELECT timestamp, solar_watts, battery_soc, battery_soh,
                      ac_output_watts, dc_output_watts, dc_12v_watts,
                      usbc_1_watts, usbc_2_watts, usbc_3_watts, usba_1_watts,
                      total_output_watts, ac_input_watts, temperature
               FROM readings
               WHERE timestamp >= ?
                 AND NOT (battery_soc = 0 AND temperature = 0)
               ORDER BY timestamp ASC""",
            (cutoff_str,),
        )
        for r in await cur.fetchall():
            legacy_rows.append({
                "timestamp": r[0],
                "solar_watts": r[1] or 0,
                "battery_soc": int(r[2] or 0),
                "battery_soh": int(r[3] or 0),
                "ac_output_watts": r[4] or 0,
                "dc_output_watts": r[5] or 0,
                "dc_12v_watts": r[6] or 0,
                "usbc_1_watts": r[7] or 0,
                "usbc_2_watts": r[8] or 0,
                "usbc_3_watts": r[9] or 0,
                "usba_1_watts": r[10] or 0,
                "total_output_watts": r[11] or 0,
                "ac_input_watts": r[12] or 0,
                "temperature": r[13] or 0,
            })
    except Exception as e:
        logger.warning("Legacy readings query failed: %s", e)

    # Merge by timestamp — archive wins on collision (newer format,
    # properly deduped). Legacy rows fill the gaps for older days.
    merged: dict[str, dict] = {r["timestamp"]: r for r in legacy_rows}
    for r in archive_rows:
        merged[r["timestamp"]] = r

    # DST-safe chronological sort. String sorting would break on the autumn
    # DST fallback (last Sunday of October) because "02:30+01:00" sorts
    # lexicographically BEFORE "02:30+02:00" even though the "+02:00" row
    # happens earlier in real time. Parsing into tz-aware datetime objects
    # restores true chronological order across the ambiguous hour.
    def _ts_key(row: dict):
        try:
            return datetime.fromisoformat(row["timestamp"])
        except (ValueError, TypeError):
            return datetime.min.replace(tzinfo=_TZ)

    out = list(merged.values())
    out.sort(key=_ts_key)
    return out


async def get_energy_summary() -> dict:
    """Get energy totals for today, this week, this month, this year, and all-time."""
    db = await get_pool()
    periods = {}
    for label, where in [
        ("week", "date >= date('now', 'weekday 1', '-7 days')"),
        ("month", "date >= date('now', 'start of month')"),
        ("year", "date >= date('now', 'start of year')"),
        ("total", "1=1"),
    ]:
        cur = await db.execute(
            f"""SELECT COALESCE(SUM(solar_kwh),0),
                       COALESCE(SUM(total_output_kwh),0)
                FROM daily_solar WHERE {where}"""
        )
        r = await cur.fetchone()
        r = r or (0, 0)
        periods[label] = {"solar_kwh": round(r[0], 3), "output_kwh": round(r[1], 3)}
    return periods


async def get_stats(price_eur: float = 0.25) -> dict:
    db = await get_pool()
    cur = await db.execute(
        """SELECT COALESCE(SUM(solar_kwh),0) as total_kwh,
                  COALESCE(AVG(solar_kwh),0) as avg_daily,
                  COALESCE(MAX(solar_kwh),0) as best_day_kwh,
                  COUNT(*) as total_days
           FROM daily_solar WHERE solar_kwh > 0"""
    )
    r = await cur.fetchone()
    r = r or (0, 0, 0, 0)
    total_kwh = r[0]
    return {
        "total_solar_kwh": round(total_kwh, 2),
        "avg_daily_kwh": round(r[1], 2),
        "best_day_kwh": round(r[2], 2),
        "total_days": r[3],
        "total_savings_eur": round(total_kwh * price_eur, 2),
        "price_per_kwh": price_eur,
    }


# === Chart-specific aggregation helpers ======================================

async def get_hourly_heatmap(days: int = 30) -> dict:
    """Return a (hour × day) grid of average solar power for the last N days.

    Aggregates directly from the CSV archive (the only store with sub-daily
    resolution). Output shape:
      {"days": ["2026-04-01", ...], "data": [[day_idx, hour, avg_w], ...]}
    """
    tz_now = _now_local()
    cutoff_date = (tz_now - timedelta(days=days)).strftime("%Y-%m-%d")
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

    # (date, hour) -> [sum_w, count]
    buckets: dict[tuple[str, int], list[float]] = {}

    def _consume(line: str):
        parts = line.strip().split(",")
        if len(parts) < 14:
            return
        ts = parts[0]
        if len(ts) < 13 or ts[:10] < cutoff_date:
            return
        date = ts[:10]
        try:
            hour = int(ts[11:13])
            solar = float(parts[1] or 0)
        except ValueError:
            return
        key = (date, hour)
        bucket = buckets.get(key)
        if bucket is None:
            buckets[key] = [solar, 1]
        else:
            bucket[0] += solar
            bucket[1] += 1

    for p in sorted(ARCHIVE_DIR.glob("*.csv.gz")):
        file_date = p.name.replace(".csv.gz", "")
        if file_date < cutoff_date:
            continue
        try:
            with gzip.open(p, "rt") as f:
                next(f, None)
                for line in f:
                    _consume(line)
        except Exception as e:
            logger.warning("heatmap gz %s: %s", p, e)
    for p in sorted(ARCHIVE_DIR.glob("*.csv")):
        file_date = p.stem
        if file_date < cutoff_date:
            continue
        try:
            with open(p, "r") as f:
                next(f, None)
                for line in f:
                    _consume(line)
        except Exception as e:
            logger.warning("heatmap csv %s: %s", p, e)

    # Also fall back on legacy readings for days the archive is sparse
    try:
        db = await get_pool()
        cur = await db.execute(
            "SELECT date(timestamp), CAST(strftime('%H', timestamp) AS INTEGER), "
            "AVG(solar_watts) "
            "FROM readings WHERE date(timestamp) >= ? "
            "  AND NOT (battery_soc = 0 AND temperature = 0) "
            "GROUP BY date(timestamp), strftime('%H', timestamp)",
            (cutoff_date,),
        )
        for d, h, avg_w in await cur.fetchall():
            if d is None or h is None:
                continue
            key = (d, int(h))
            if key not in buckets:  # don't override archive aggregates
                buckets[key] = [avg_w * 60, 60]  # fake 60 samples for averaging
    except Exception as e:
        logger.warning("heatmap legacy: %s", e)

    dates = sorted({k[0] for k in buckets})
    data = []
    for (date, hour), (sum_w, count) in buckets.items():
        day_idx = dates.index(date)
        avg_w = sum_w / max(1, count)
        if avg_w > 0.5:
            data.append([day_idx, hour, round(avg_w, 1)])
    return {"days": dates, "data": data}


async def get_monthly_distribution(months: int = 12) -> list[dict]:
    """Daily solar kWh distribution per month (median, Q1, Q3, min, max, n).

    Used by the monthly box-plot chart.
    """
    db = await get_pool()
    cutoff = (_now_local() - timedelta(days=months * 31)).strftime("%Y-%m-%d")
    cur = await db.execute(
        "SELECT substr(date, 1, 7) as month, solar_kwh "
        "FROM daily_solar WHERE date >= ? AND solar_kwh > 0 "
        "ORDER BY date ASC",
        (cutoff,),
    )
    by_month: dict[str, list[float]] = {}
    for m, kwh in await cur.fetchall():
        by_month.setdefault(m, []).append(float(kwh))

    def _quantile(sorted_values: list[float], q: float) -> float:
        if not sorted_values:
            return 0
        n = len(sorted_values)
        pos = q * (n - 1)
        lo = int(pos)
        hi = min(lo + 1, n - 1)
        frac = pos - lo
        return sorted_values[lo] * (1 - frac) + sorted_values[hi] * frac

    out = []
    for month in sorted(by_month.keys()):
        vals = sorted(by_month[month])
        if not vals:
            continue
        out.append({
            "month": month,
            "n": len(vals),
            "min": round(vals[0], 3),
            "q1": round(_quantile(vals, 0.25), 3),
            "median": round(_quantile(vals, 0.5), 3),
            "q3": round(_quantile(vals, 0.75), 3),
            "max": round(vals[-1], 3),
        })
    return out


async def get_cumulative_production() -> dict:
    """Cumulative daily kWh since first day + milestone crossings.

    Output:
      {
        "series": [{"date": "...", "kwh": 0.5, "cumulative": 1.2}, ...],
        "milestones": [{"threshold_kwh": 1, "date": "..."}, ...],
        "total_kwh": 12.4
      }
    """
    db = await get_pool()
    cur = await db.execute(
        "SELECT date, solar_kwh FROM daily_solar "
        "WHERE solar_kwh >= 0 ORDER BY date ASC"
    )
    rows = await cur.fetchall()
    series: list[dict] = []
    cumulative = 0.0
    milestones_set = [0.1, 1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
    reached: dict[float, str] = {}
    for r in rows:
        kwh = float(r[1] or 0)
        if kwh < 0:
            continue
        prev = cumulative
        cumulative += kwh
        for m in milestones_set:
            if prev < m <= cumulative and m not in reached:
                reached[m] = r[0]
        series.append({
            "date": r[0], "kwh": round(kwh, 3), "cumulative": round(cumulative, 3),
        })
    milestones = [
        {"threshold_kwh": m, "date": reached[m]}
        for m in milestones_set if m in reached
    ]
    return {
        "series": series,
        "milestones": milestones,
        "total_kwh": round(cumulative, 3),
    }


async def get_sankey_flows(days: int = 1) -> dict:
    """Return solar / battery / grid / load flows over the last N days for the
    Sankey energy-flow diagram.

    Uses daily_solar which has the phase-detected breakdown (direct_use,
    battery_in, battery_out, grid_in, total_output).
    """
    db = await get_pool()
    cutoff = (_now_local() - timedelta(days=days)).strftime("%Y-%m-%d")
    cur = await db.execute(
        """SELECT
              COALESCE(SUM(solar_kwh), 0),
              COALESCE(SUM(direct_use_kwh), 0),
              COALESCE(SUM(battery_in_kwh), 0),
              COALESCE(SUM(battery_out_kwh), 0),
              COALESCE(SUM(total_charge_kwh), 0),
              COALESCE(SUM(total_output_kwh), 0),
              COUNT(*)
           FROM daily_solar
           WHERE date >= ?""",
        (cutoff,),
    )
    r = await cur.fetchone()
    if not r:
        return {"days": 0, "nodes": [], "flows": []}
    solar, direct, bat_in, bat_out, grid_in, output, n = r
    # Conservation check (not enforced, just for debugging)
    # solar + grid_in = output + (bat_in - bat_out); residual goes into "verlust"
    solar_to_battery = max(0.0, solar - direct)
    grid_to_load = max(0.0, output - direct - bat_out)
    grid_to_battery = max(0.0, grid_in - grid_to_load)
    loss = max(0.0, bat_in - bat_out)  # self-discharge/efficiency loss
    return {
        "days": n,
        "totals": {
            "solar_kwh": round(solar, 3),
            "grid_in_kwh": round(grid_in, 3),
            "load_kwh": round(output, 3),
            "battery_in_kwh": round(bat_in, 3),
            "battery_out_kwh": round(bat_out, 3),
        },
        "flows": [
            {"from": "solar", "to": "load", "kwh": round(direct, 3)},
            {"from": "solar", "to": "battery", "kwh": round(solar_to_battery, 3)},
            {"from": "battery", "to": "load", "kwh": round(bat_out, 3)},
            {"from": "grid", "to": "load", "kwh": round(grid_to_load, 3)},
            {"from": "grid", "to": "battery", "kwh": round(grid_to_battery, 3)},
            {"from": "battery", "to": "loss", "kwh": round(loss, 3)},
        ],
    }


# === Break-even + aggregate helpers ==========================================

async def get_cumulative_savings(price_eur: float, system_cost_eur: float) -> dict:
    """Cumulative EUR savings since first day, plus projection.

    Uses the last 30 days as the extrapolation window for break-even.
    """
    db = await get_pool()
    cur = await db.execute(
        "SELECT date, solar_kwh FROM daily_solar "
        "WHERE solar_kwh > 0 ORDER BY date ASC"
    )
    rows = await cur.fetchall()
    if not rows:
        return {
            "total_kwh": 0.0, "total_savings_eur": 0.0,
            "percent_amortised": 0.0, "break_even_date": None,
            "days_tracked": 0, "avg_daily_kwh_last30": 0.0,
            "system_cost_eur": system_cost_eur, "price_per_kwh": price_eur,
        }
    total_kwh = sum(r[1] for r in rows)
    total_savings = total_kwh * price_eur
    pct = min(100.0, (total_savings / system_cost_eur) * 100) if system_cost_eur > 0 else 0
    days_tracked = len(rows)

    # Projection: last 30 days avg
    last30 = rows[-30:] if len(rows) >= 30 else rows
    avg_last30 = sum(r[1] for r in last30) / max(1, len(last30))

    remaining_eur = max(0.0, system_cost_eur - total_savings)
    break_even_date = None
    if avg_last30 * price_eur > 0 and remaining_eur > 0:
        days_to_break_even = remaining_eur / (avg_last30 * price_eur)
        last_date = datetime.strptime(rows[-1][0], "%Y-%m-%d")
        break_even = last_date + timedelta(days=round(days_to_break_even))
        break_even_date = break_even.strftime("%Y-%m-%d")

    return {
        "total_kwh": round(total_kwh, 2),
        "total_savings_eur": round(total_savings, 2),
        "percent_amortised": round(pct, 2),
        "break_even_date": break_even_date,
        "days_tracked": days_tracked,
        "avg_daily_kwh_last30": round(avg_last30, 2),
        "system_cost_eur": system_cost_eur,
        "price_per_kwh": price_eur,
    }


# === Forecast logging (Phase 3) ==============================================

async def insert_forecast(date: str, source: str, predicted_kwh: float,
                          predicted_load_kwh: float = 0,
                          features_json: str = "",
                          created_at: str | None = None):
    db = await get_pool()
    created_at = created_at or datetime.now().isoformat(timespec="seconds")
    await db.execute(
        """INSERT INTO forecast_log (date, source, created_at,
           predicted_kwh, predicted_load_kwh, features_json)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(date, source) DO UPDATE SET
             created_at=excluded.created_at,
             predicted_kwh=excluded.predicted_kwh,
             predicted_load_kwh=excluded.predicted_load_kwh,
             features_json=excluded.features_json""",
        (date, source, created_at, predicted_kwh, predicted_load_kwh, features_json),
    )
    await db.commit()


async def get_forecast_accuracy(days: int = 60) -> dict:
    """Return per-source forecast accuracy metrics over the last N days.

    Joins forecast_log with daily_solar on date. Returns one summary per
    source (e.g. "openmeteo", "ml_solar") with MAE, MAPE, bias, n.
    """
    db = await get_pool()
    cutoff = (_now_local() - timedelta(days=days)).strftime("%Y-%m-%d")
    cur = await db.execute(
        """SELECT fl.source, fl.date, fl.predicted_kwh, ds.solar_kwh
           FROM forecast_log fl
           LEFT JOIN daily_solar ds ON ds.date = fl.date
           WHERE fl.date >= ? AND ds.solar_kwh IS NOT NULL
           ORDER BY fl.date ASC""",
        (cutoff,),
    )
    rows = await cur.fetchall()
    by_source: dict[str, list[tuple[str, float, float]]] = {}
    for r in rows:
        by_source.setdefault(r[0], []).append((r[1], r[2] or 0, r[3] or 0))

    out: dict[str, dict] = {}
    for source, items in by_source.items():
        if not items:
            continue
        n = len(items)
        errs = [abs(p - a) for _, p, a in items]
        mae = sum(errs) / n
        bias = sum(p - a for _, p, a in items) / n
        # MAPE skipping zero actuals
        mape_items = [abs(p - a) / a * 100 for _, p, a in items if a > 0.05]
        mape = sum(mape_items) / len(mape_items) if mape_items else 0
        rmse = (sum((p - a) ** 2 for _, p, a in items) / n) ** 0.5
        out[source] = {
            "n": n,
            "mae_kwh": round(mae, 3),
            "rmse_kwh": round(rmse, 3),
            "bias_kwh": round(bias, 3),
            "mape_pct": round(mape, 1),
            "series": [
                {"date": d, "predicted": round(p, 3), "actual": round(a, 3)}
                for d, p, a in items
            ],
        }
    return out
