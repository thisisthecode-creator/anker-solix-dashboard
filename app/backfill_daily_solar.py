"""One-shot backfill: rebuild daily_solar stats from the CSV archive.

After migrate_readings_to_archive has consolidated the legacy rows into daily
archive files, this script re-runs a SolarAccumulator over each day's archive
and writes the resulting stats (direct_use_pct, autarkie_pct, rte_pct,
avg_temp, min/max_soc, avg_soh, peak_watts, battery_in/out_kwh, …) into the
daily_solar table via upsert_daily.

Idempotent via marker file. Skips today (accumulator is writing it live).
Safe to re-run after the archive has been updated — pass force=True.
"""
import gzip
import logging
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from app.config import DB_PATH, TIMEZONE
from app.accumulator import SolarAccumulator
from app.database import upsert_daily

logger = logging.getLogger(__name__)

ARCHIVE_DIR = Path(__file__).resolve().parent.parent / "data" / "archive"
MARKER = Path(__file__).resolve().parent.parent / "data" / ".daily_solar_backfill_v1"


def _parse_row(parts):
    try:
        return {
            "timestamp": parts[0],
            "solar_watts": float(parts[1] or 0),
            "battery_soc": int(float(parts[2] or 0)),
            "battery_soh": int(float(parts[3] or 0)),
            "total_output_watts": float(parts[11] or 0),
            "ac_input_watts": float(parts[12] or 0),
            "temperature": float(parts[13] or 0),
        }
    except (ValueError, IndexError):
        return None


def _iter_archive_rows(path: Path):
    opener = (lambda: gzip.open(path, "rt")) if path.suffix == ".gz" else (lambda: open(path, "r"))
    try:
        with opener() as f:
            next(f, None)  # header
            for line in f:
                parts = line.strip().split(",")
                if len(parts) < 14:
                    continue
                r = _parse_row(parts)
                if r and not (r["battery_soc"] == 0 and r["temperature"] == 0):
                    yield r
    except Exception as e:
        logger.warning("Backfill: failed to read %s: %s", path, e)


async def backfill_daily_solar(force: bool = False) -> dict:
    """Rebuild daily_solar rows from archive files.

    Returns a summary dict: {status, days_processed, days_written, skipped_today}
    """
    if MARKER.exists() and not force:
        return {"status": "skipped", "reason": "marker_exists"}

    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    tz = ZoneInfo(TIMEZONE)
    today = datetime.now(tz).strftime("%Y-%m-%d")

    summary = {
        "status": "ok",
        "days_processed": 0,
        "days_written": 0,
        "skipped_today": False,
    }

    # Collect all archive files by date
    files_by_date: dict[str, Path] = {}
    for p in sorted(ARCHIVE_DIR.glob("*.csv.gz")):
        date_str = p.name.replace(".csv.gz", "")
        files_by_date[date_str] = p
    for p in sorted(ARCHIVE_DIR.glob("*.csv")):
        # Prefer .csv over .csv.gz for the same date (shouldn't happen normally)
        files_by_date[p.stem] = p

    for date_str in sorted(files_by_date.keys()):
        if date_str == today:
            summary["skipped_today"] = True
            continue
        summary["days_processed"] += 1

        path = files_by_date[date_str]
        acc = SolarAccumulator()
        # Force the accumulator to believe this day is "current" so its
        # internal tracking works. We pass monotonically-increasing
        # timestamps from the stored ISO strings, which are tz-aware.
        row_count = 0
        last_ts = None
        for row in _iter_archive_rows(path):
            try:
                ts = datetime.fromisoformat(row["timestamp"]).timestamp()
            except (ValueError, TypeError):
                continue
            acc.update(
                solar_watts=row["solar_watts"],
                output_watts=row["total_output_watts"],
                charge_watts=row["ac_input_watts"],
                ts=ts,
                soc=row["battery_soc"],
                soh=row["battery_soh"],
                temp=row["temperature"],
            )
            row_count += 1
            last_ts = ts

        if row_count < 2:
            logger.info("Backfill: %s has only %d usable rows, skipping", date_str, row_count)
            continue

        # Override the accumulator's current_date so get_today returns this day
        acc.current_date = date_str
        today_stats = acc.get_today()
        try:
            await upsert_daily(date_str, today_stats)
            summary["days_written"] += 1
            logger.info(
                "Backfill: %s written — %d rows → %.3f solar_kwh, %.3f out_kwh, "
                "direct=%.1f%%, aut=%.1f%%, rte=%.1f%%, avg_soh=%.1f",
                date_str, row_count,
                today_stats["solar_kwh"], today_stats["output_kwh"],
                today_stats["direct_use_pct"], today_stats["autarkie_pct"],
                today_stats["rte_pct"], today_stats["avg_soh"],
            )
        except Exception as e:
            logger.warning("Backfill: upsert %s failed: %s", date_str, e)

    MARKER.parent.mkdir(parents=True, exist_ok=True)
    MARKER.touch()
    logger.info("Backfill summary: %s", summary)
    return summary
