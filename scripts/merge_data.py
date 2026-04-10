#!/usr/bin/env python
"""Merge local data folder onto fly.io.

- Decompresses /tmp/local_data.tar.gz
- Merges archive CSV files (sort + dedupe by timestamp)
- Re-imports readings_dump.json.gz
"""
import gzip
import json
import sqlite3
import tarfile
from pathlib import Path

DB = "/app/data/solar.db"
LOCAL_TAR = "/app/data/local_data.tar.gz"
EXTRACT_DIR = Path("/app/data/local_data_extract")
ARCHIVE_DIR = Path("/app/data/archive")


def merge_csv(local_path: Path, target_date: str):
    """Merge a local CSV with the corresponding fly.io archive (csv or csv.gz)."""
    fly_csv = ARCHIVE_DIR / f"{target_date}.csv"
    fly_gz = ARCHIVE_DIR / f"{target_date}.csv.gz"

    rows: dict[str, str] = {}  # ts -> line

    # Load existing fly.io data
    if fly_gz.exists():
        with gzip.open(fly_gz, "rt") as f:
            header = next(f, None)
            for line in f:
                ts = line.split(",", 1)[0]
                if ts:
                    rows[ts] = line.rstrip()
    elif fly_csv.exists():
        with open(fly_csv) as f:
            header = next(f, None)
            for line in f:
                ts = line.split(",", 1)[0]
                if ts:
                    rows[ts] = line.rstrip()
    else:
        header = None

    # Add local rows (overwrites duplicates - local first since it might be more accurate)
    with open(local_path, encoding="utf-8", errors="replace") as f:
        local_header = next(f, None)
        if header is None:
            header = local_header
        for line in f:
            ts = line.split(",", 1)[0]
            if ts and ts not in rows:
                rows[ts] = line.rstrip()

    if not header:
        header = "timestamp,solar_watts,battery_soc,battery_soh,ac_output_watts,dc_output_watts,dc_12v_watts,usbc_1_watts,usbc_2_watts,usbc_3_watts,usba_1_watts,total_output_watts,ac_input_watts,temperature\n"

    # Write merged result
    sorted_rows = sorted(rows.items())
    is_today = False  # Will check below
    from datetime import datetime
    today_str = datetime.now().strftime("%Y-%m-%d")
    is_today = target_date >= today_str

    if is_today:
        # Today's file stays as plain CSV
        with open(fly_csv, "w") as f:
            f.write(header if header.endswith("\n") else header + "\n")
            for _, line in sorted_rows:
                f.write(line + "\n")
        # Remove old gz if it existed
        if fly_gz.exists():
            fly_gz.unlink()
    else:
        # Older files compressed
        with gzip.open(fly_gz, "wt", compresslevel=9) as f:
            f.write(header if header.endswith("\n") else header + "\n")
            for _, line in sorted_rows:
                f.write(line + "\n")
        # Remove old plain csv if it existed
        if fly_csv.exists():
            fly_csv.unlink()

    return len(sorted_rows)


def import_readings_dump(dump_path: Path):
    with gzip.open(dump_path, "rt") as f:
        data = json.load(f)

    readings = data.get("readings", [])
    daily = data.get("daily_solar", [])
    monthly = data.get("monthly_solar", [])
    yearly = data.get("yearly_solar", [])

    c = sqlite3.connect(DB)
    cur = c.cursor()
    existing_ts = {row[0] for row in cur.execute("SELECT timestamp FROM readings").fetchall()}

    new_readings = 0
    for r in readings:
        if r["timestamp"] in existing_ts:
            continue
        cur.execute(
            """INSERT INTO readings (timestamp, solar_watts, battery_soc, battery_soh,
               ac_output_watts, dc_12v_watts, usbc_1_watts, usbc_2_watts, usbc_3_watts,
               usba_1_watts, dc_output_watts, total_output_watts,
               ac_input_watts, temperature)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                r["timestamp"],
                r.get("solar_watts", 0), r.get("battery_soc", 0), r.get("battery_soh", 0),
                r.get("ac_output_watts", 0), r.get("dc_12v_watts", 0),
                r.get("usbc_1_watts", 0), r.get("usbc_2_watts", 0), r.get("usbc_3_watts", 0),
                r.get("usba_1_watts", 0), r.get("dc_output_watts", 0),
                r.get("total_output_watts", 0), r.get("ac_input_watts", 0),
                r.get("temperature", 0),
            ),
        )
        new_readings += 1

    for d in daily:
        cur.execute(
            """INSERT INTO daily_solar (date, solar_kwh, peak_watts, solar_hours,
               total_output_kwh, total_charge_kwh, samples)
               VALUES (?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(date) DO UPDATE SET
               solar_kwh=MAX(solar_kwh, excluded.solar_kwh),
               peak_watts=MAX(peak_watts, excluded.peak_watts),
               solar_hours=MAX(solar_hours, excluded.solar_hours),
               total_output_kwh=MAX(total_output_kwh, excluded.total_output_kwh),
               total_charge_kwh=MAX(total_charge_kwh, excluded.total_charge_kwh),
               samples=MAX(samples, excluded.samples)""",
            (d["date"], d.get("solar_kwh", 0), d.get("peak_watts", 0),
             d.get("solar_hours", 0), d.get("total_output_kwh", 0),
             d.get("total_charge_kwh", 0), d.get("samples", 0)),
        )
    c.commit()
    c.close()
    return new_readings


def main():
    if not Path(LOCAL_TAR).exists():
        print(f"ERROR: {LOCAL_TAR} not found")
        return

    EXTRACT_DIR.mkdir(parents=True, exist_ok=True)
    with tarfile.open(LOCAL_TAR, "r:gz") as t:
        t.extractall(EXTRACT_DIR)

    print(f"Extracted to {EXTRACT_DIR}")

    # Merge each local CSV in archive
    local_archive = EXTRACT_DIR / "archive"
    if local_archive.exists():
        # Skip macOS AppleDouble files
        for csv_path in sorted(local_archive.glob("*.csv")):
            if csv_path.name.startswith("._"):
                continue
            target_date = csv_path.stem
            count = merge_csv(csv_path, target_date)
            print(f"Merged {csv_path.name}: {count} unique rows in archive")

        # Also handle .gz files if any
        for gz_path in sorted(local_archive.glob("*.csv.gz")):
            target_date = gz_path.stem.replace(".csv", "")
            # Decompress to temp
            tmp_csv = EXTRACT_DIR / f"{target_date}_tmp.csv"
            with gzip.open(gz_path, "rt") as f_in, open(tmp_csv, "w") as f_out:
                f_out.write(f_in.read())
            count = merge_csv(tmp_csv, target_date)
            print(f"Merged {gz_path.name}: {count} unique rows in archive")
            tmp_csv.unlink()

    # Import readings dump
    dump = EXTRACT_DIR / "readings_dump.json.gz"
    if dump.exists():
        count = import_readings_dump(dump)
        print(f"Imported {count} new readings from dump")

    # Cleanup
    import shutil
    shutil.rmtree(EXTRACT_DIR)
    print("Cleanup complete")


if __name__ == "__main__":
    main()
