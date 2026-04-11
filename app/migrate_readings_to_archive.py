"""One-shot migration: consolidate legacy `readings` rows into daily archive files.

The legacy `readings` SQLite table still holds historical rows from before the
CSV archive existed (pre-2026-04-09) and from the early dedup era when the
archive was sparse. This migration consolidates everything into the archive:

  1. For each date that has rows in `readings`:
     - If no archive file exists → create one from readings (historical day).
     - If an archive file exists BUT has fewer non-header lines than readings
       has rows → replace the archive with the readings data (readings wins,
       it has the pre-dedup full sample rate).
     - Otherwise → leave the archive alone (it's more recent / more complete).
  2. After rebuilding, delete the migrated rows from the readings table.
  3. Run VACUUM to reclaim space.

The migration uses a schema-version marker (`.readings_migration_v2`) so it
re-runs once after deploying this version even if the old v1 marker exists.
"""
import gzip
import logging
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from app.config import TIMEZONE
from app.database import get_pool

logger = logging.getLogger(__name__)

ARCHIVE_DIR = Path(__file__).resolve().parent.parent / "data" / "archive"
MARKER_V2 = Path(__file__).resolve().parent.parent / "data" / ".readings_migration_v2"

ARCHIVE_HEADER = "timestamp,solar_watts,battery_soc,battery_soh,ac_output_watts,dc_output_watts,dc_12v_watts,usbc_1_watts,usbc_2_watts,usbc_3_watts,usba_1_watts,total_output_watts,ac_input_watts,temperature\n"


def _count_archive_rows(path: Path) -> int:
    """Count data rows in an archive file (excluding header). Returns 0 on error."""
    try:
        if path.suffix == ".gz" or path.name.endswith(".csv.gz"):
            with gzip.open(path, "rt") as f:
                n = sum(1 for _ in f) - 1
        else:
            with open(path, "r") as f:
                n = sum(1 for _ in f) - 1
        return max(0, n)
    except Exception:
        return 0


def _find_archive_for_date(date_str: str) -> Path | None:
    gz = ARCHIVE_DIR / f"{date_str}.csv.gz"
    if gz.exists():
        return gz
    csv = ARCHIVE_DIR / f"{date_str}.csv"
    if csv.exists():
        return csv
    return None


async def migrate_readings_to_archive():
    """Consolidate legacy readings → archive, then prune the readings table.

    Idempotent via the v2 marker file. Uses the shared pool connection so
    VACUUM works without contending against another open connection.
    """
    if MARKER_V2.exists():
        return {"status": "skipped", "reason": "marker_exists"}

    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    tz = ZoneInfo(TIMEZONE)
    today = datetime.now(tz).strftime("%Y-%m-%d")

    summary = {
        "status": "ok",
        "dates_processed": 0,
        "dates_created": 0,
        "dates_rebuilt": 0,
        "dates_skipped": 0,
        "rows_migrated": 0,
        "rows_deleted": 0,
    }

    try:
        db = await get_pool()
    except Exception as e:
        logger.warning("Migration v2: pool unavailable: %s", e)
        return {"status": "error", "reason": str(e)}

    try:
        cur = await db.execute(
            "SELECT date(timestamp) as day, COUNT(*) as n FROM readings "
            "WHERE timestamp IS NOT NULL "
            "GROUP BY date(timestamp) ORDER BY day ASC"
        )
        date_counts = [(r[0], r[1]) for r in await cur.fetchall() if r[0]]
    except Exception as e:
        logger.warning("Migration v2: readings query failed: %s", e)
        return {"status": "error", "reason": str(e)}

    if not date_counts:
        MARKER_V2.parent.mkdir(parents=True, exist_ok=True)
        MARKER_V2.touch()
        logger.info("Migration v2: readings table is empty, nothing to do")
        return summary

    dates_to_delete: list[str] = []

    for date_str, readings_count in date_counts:
        if date_str == today:
            # Don't touch today — the accumulator is writing it live.
            summary["dates_skipped"] += 1
            continue
        summary["dates_processed"] += 1

        existing = _find_archive_for_date(date_str)
        existing_count = _count_archive_rows(existing) if existing else 0

        # Rebuild if: no archive OR readings has strictly more rows
        needs_rebuild = (existing is None) or (readings_count > existing_count)

        if not needs_rebuild:
            # Archive already complete. Still delete the redundant readings rows.
            dates_to_delete.append(date_str)
            summary["dates_skipped"] += 1
            continue

        try:
            cur = await db.execute(
                "SELECT timestamp, solar_watts, battery_soc, battery_soh, "
                "ac_output_watts, dc_output_watts, dc_12v_watts, "
                "usbc_1_watts, usbc_2_watts, usbc_3_watts, usba_1_watts, "
                "total_output_watts, ac_input_watts, temperature "
                "FROM readings WHERE date(timestamp) = ? "
                "ORDER BY timestamp ASC",
                (date_str,),
            )
            rows = await cur.fetchall()
        except Exception as e:
            logger.warning("Migration v2: fetch %s failed: %s", date_str, e)
            continue

        if not rows:
            continue

        # Remove any existing archive file (CSV or gz) for this date
        old_gz = ARCHIVE_DIR / f"{date_str}.csv.gz"
        old_csv = ARCHIVE_DIR / f"{date_str}.csv"
        for p in (old_gz, old_csv):
            if p.exists():
                try:
                    p.unlink()
                except Exception:
                    pass

        gz_path = ARCHIVE_DIR / f"{date_str}.csv.gz"
        try:
            with gzip.open(gz_path, "wt", compresslevel=9) as f:
                f.write(ARCHIVE_HEADER)
                for r in rows:
                    line = ",".join(str(v if v is not None else 0) for v in r)
                    f.write(line + "\n")
        except Exception as e:
            logger.warning("Migration v2: write %s failed: %s", gz_path, e)
            continue

        if existing is None:
            summary["dates_created"] += 1
        else:
            summary["dates_rebuilt"] += 1
        summary["rows_migrated"] += len(rows)
        dates_to_delete.append(date_str)
        logger.info(
            "Migration v2: %s %s (%d rows, %d bytes)",
            "created" if existing is None else "rebuilt",
            gz_path.name, len(rows), gz_path.stat().st_size,
        )

    # Delete migrated rows from readings table
    if dates_to_delete:
        try:
            placeholder = ",".join("?" * len(dates_to_delete))
            cur = await db.execute(
                f"DELETE FROM readings WHERE date(timestamp) IN ({placeholder})",
                dates_to_delete,
            )
            summary["rows_deleted"] = cur.rowcount or 0
            await db.commit()
        except Exception as e:
            logger.warning("Migration v2: delete failed: %s", e)

        # VACUUM is safe here because we share the pool's single connection.
        try:
            await db.execute("VACUUM")
        except Exception as e:
            logger.warning("Migration v2: VACUUM failed: %s", e)

    MARKER_V2.parent.mkdir(parents=True, exist_ok=True)
    MARKER_V2.touch()
    logger.info("Migration v2 summary: %s", summary)
    return summary
