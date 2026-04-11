"""One-shot migration: copy legacy `readings` rows into daily CSV archive files.

The `readings` SQLite table still holds historical data from before the CSV
archive existed (and from the pre-dedup era). We copy each row into the
corresponding daily archive file, skipping dates that already have an archive
file (CSV or gz) — we do NOT merge with existing archive rows, to avoid
clobbering the newer, more accurate deduped data.

Running the migration is safe and idempotent: it only writes missing daily
files, never touches existing ones. After running, the archive becomes the
full single source of truth and the legacy table can be safely dropped.

Called once from lifespan at startup. Uses a marker file so subsequent
restarts don't re-do the work.
"""
import gzip
import logging
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import aiosqlite

from app.config import DB_PATH, TIMEZONE

logger = logging.getLogger(__name__)

ARCHIVE_DIR = Path(__file__).resolve().parent.parent / "data" / "archive"
MARKER_FILE = Path(__file__).resolve().parent.parent / "data" / ".readings_migration_done"

ARCHIVE_HEADER = "timestamp,solar_watts,battery_soc,battery_soh,ac_output_watts,dc_output_watts,dc_12v_watts,usbc_1_watts,usbc_2_watts,usbc_3_watts,usba_1_watts,total_output_watts,ac_input_watts,temperature\n"

ARCHIVE_FIELDS = [
    "solar_watts", "battery_soc", "battery_soh",
    "ac_output_watts", "dc_output_watts", "dc_12v_watts",
    "usbc_1_watts", "usbc_2_watts", "usbc_3_watts", "usba_1_watts",
    "total_output_watts", "ac_input_watts", "temperature",
]


async def migrate_readings_to_archive():
    """Copy legacy readings rows into daily archive files for dates without one.

    Runs once per install. The marker file lives on the same volume as the
    archive, so a fresh volume triggers a fresh migration.
    """
    if MARKER_FILE.exists():
        return 0  # already migrated

    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    tz = ZoneInfo(TIMEZONE)
    today = datetime.now(tz).strftime("%Y-%m-%d")

    # Build the set of dates that already have any archive file so we don't clobber
    existing_dates: set[str] = set()
    for p in ARCHIVE_DIR.glob("*.csv"):
        existing_dates.add(p.stem)
    for p in ARCHIVE_DIR.glob("*.csv.gz"):
        existing_dates.add(p.name.replace(".csv.gz", ""))

    try:
        db = await aiosqlite.connect(str(DB_PATH))
    except Exception as e:
        logger.warning("Migration: could not open %s: %s", DB_PATH, e)
        return 0

    try:
        # Group readings by date. Only consider dates WITHOUT an existing archive.
        cur = await db.execute(
            "SELECT DISTINCT date(timestamp) as day FROM readings "
            "WHERE timestamp IS NOT NULL ORDER BY day ASC"
        )
        all_dates = [r[0] for r in await cur.fetchall() if r[0]]
        dates_to_migrate = [d for d in all_dates if d not in existing_dates and d != today]
        if not dates_to_migrate:
            MARKER_FILE.parent.mkdir(parents=True, exist_ok=True)
            MARKER_FILE.touch()
            logger.info("Readings migration: no missing dates to migrate")
            return 0

        total_rows = 0
        for date in dates_to_migrate:
            cur = await db.execute(
                "SELECT timestamp, solar_watts, battery_soc, battery_soh, "
                "ac_output_watts, dc_output_watts, dc_12v_watts, "
                "usbc_1_watts, usbc_2_watts, usbc_3_watts, usba_1_watts, "
                "total_output_watts, ac_input_watts, temperature "
                "FROM readings WHERE date(timestamp) = ? "
                "ORDER BY timestamp ASC",
                (date,),
            )
            rows = await cur.fetchall()
            if not rows:
                continue

            # Write a gzipped daily archive directly (these are historical days,
            # no reason to keep them as open CSVs).
            gz_path = ARCHIVE_DIR / f"{date}.csv.gz"
            with gzip.open(gz_path, "wt", compresslevel=9) as f:
                f.write(ARCHIVE_HEADER)
                for r in rows:
                    line = ",".join(str(v if v is not None else 0) for v in r)
                    f.write(line + "\n")
            total_rows += len(rows)
            logger.info("Readings migration: wrote %s (%d rows)", gz_path.name, len(rows))

        MARKER_FILE.parent.mkdir(parents=True, exist_ok=True)
        MARKER_FILE.touch()
        logger.info("Readings migration complete: %d rows across %d files",
                    total_rows, len(dates_to_migrate))
        return total_rows
    finally:
        await db.close()
