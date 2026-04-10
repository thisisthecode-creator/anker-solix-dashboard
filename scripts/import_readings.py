#!/usr/bin/env python
"""Import readings JSON dump into solar.db on fly.io."""
import gzip
import json
import sqlite3
import sys
from pathlib import Path

DB = "/app/data/solar.db"
DUMP = "/tmp/readings_dump.json.gz"


def main():
    if not Path(DUMP).exists():
        print(f"ERROR: {DUMP} not found")
        sys.exit(1)

    with gzip.open(DUMP, "rt") as f:
        data = json.load(f)

    readings = data.get("readings", [])
    daily = data.get("daily_solar", [])
    monthly = data.get("monthly_solar", [])
    yearly = data.get("yearly_solar", [])

    print(f"Loaded {len(readings)} readings, {len(daily)} daily, {len(monthly)} monthly, {len(yearly)} yearly")

    c = sqlite3.connect(DB)
    cur = c.cursor()

    # Get existing reading timestamps to avoid duplicates
    existing_ts = {row[0] for row in cur.execute("SELECT timestamp FROM readings").fetchall()}
    print(f"Existing readings on fly.io: {len(existing_ts)}")

    # Insert readings (skip duplicates by timestamp)
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
                r.get("solar_watts", 0),
                r.get("battery_soc", 0),
                r.get("battery_soh", 0),
                r.get("ac_output_watts", 0),
                r.get("dc_12v_watts", 0),
                r.get("usbc_1_watts", 0),
                r.get("usbc_2_watts", 0),
                r.get("usbc_3_watts", 0),
                r.get("usba_1_watts", 0),
                r.get("dc_output_watts", 0),
                r.get("total_output_watts", 0),
                r.get("ac_input_watts", 0),
                r.get("temperature", 0),
            ),
        )
        new_readings += 1

    # Upsert daily_solar
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
            (
                d["date"],
                d.get("solar_kwh", 0),
                d.get("peak_watts", 0),
                d.get("solar_hours", 0),
                d.get("total_output_kwh", 0),
                d.get("total_charge_kwh", 0),
                d.get("samples", 0),
            ),
        )

    # Upsert monthly_solar
    for m in monthly:
        cur.execute(
            """INSERT INTO monthly_solar (month, solar_kwh, avg_daily_kwh,
               peak_day_kwh, total_output_kwh, days_with_solar)
               VALUES (?, ?, ?, ?, ?, ?)
               ON CONFLICT(month) DO UPDATE SET
               solar_kwh=excluded.solar_kwh,
               avg_daily_kwh=excluded.avg_daily_kwh,
               peak_day_kwh=excluded.peak_day_kwh,
               total_output_kwh=excluded.total_output_kwh,
               days_with_solar=excluded.days_with_solar""",
            (
                m["month"],
                m.get("solar_kwh", 0),
                m.get("avg_daily_kwh", 0),
                m.get("peak_day_kwh", 0),
                m.get("total_output_kwh", 0),
                m.get("days_with_solar", 0),
            ),
        )

    # Upsert yearly_solar
    for y in yearly:
        cur.execute(
            """INSERT INTO yearly_solar (year, solar_kwh, avg_monthly_kwh,
               best_month, total_output_kwh)
               VALUES (?, ?, ?, ?, ?)
               ON CONFLICT(year) DO UPDATE SET
               solar_kwh=excluded.solar_kwh,
               avg_monthly_kwh=excluded.avg_monthly_kwh,
               best_month=excluded.best_month,
               total_output_kwh=excluded.total_output_kwh""",
            (
                y["year"],
                y.get("solar_kwh", 0),
                y.get("avg_monthly_kwh", 0),
                y.get("best_month", ""),
                y.get("total_output_kwh", 0),
            ),
        )

    c.commit()

    final_count = cur.execute("SELECT COUNT(*) FROM readings").fetchone()[0]
    print(f"Inserted {new_readings} new readings")
    print(f"Total readings now: {final_count}")
    print(f"daily_solar: {cur.execute('SELECT COUNT(*) FROM daily_solar').fetchone()[0]}")
    print(f"monthly_solar: {cur.execute('SELECT COUNT(*) FROM monthly_solar').fetchone()[0]}")
    print(f"yearly_solar: {cur.execute('SELECT COUNT(*) FROM yearly_solar').fetchone()[0]}")

    c.close()


if __name__ == "__main__":
    main()
