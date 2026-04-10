import aiosqlite
from datetime import datetime, timedelta
from app.config import DB_PATH


async def get_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(str(DB_PATH))
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    return db


async def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    db = await get_db()
    try:
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
        """)
        await db.commit()
    finally:
        await db.close()


async def insert_reading(data: dict):
    db = await get_db()
    try:
        await db.execute(
            """INSERT INTO readings (timestamp, solar_watts, battery_soc, battery_soh,
               ac_output_watts, dc_12v_watts, usbc_1_watts, usbc_2_watts, usbc_3_watts,
               usba_1_watts, dc_output_watts, total_output_watts,
               ac_input_watts, temperature)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                data["timestamp"],
                data.get("solar_watts", 0),
                data.get("battery_soc", 0),
                data.get("battery_soh", 0),
                data.get("ac_output_watts", 0),
                data.get("dc_12v_watts", 0),
                data.get("usbc_1_watts", 0),
                data.get("usbc_2_watts", 0),
                data.get("usbc_3_watts", 0),
                data.get("usba_1_watts", 0),
                data.get("dc_output_watts", 0),
                data.get("total_output_watts", 0),
                data.get("ac_input_watts", 0),
                data.get("temperature", 0),
            ),
        )
        await db.commit()
    finally:
        await db.close()


async def upsert_daily(date: str, solar_kwh: float, peak_watts: float,
                       solar_hours: float, output_kwh: float,
                       charge_kwh: float, samples: int):
    db = await get_db()
    try:
        await db.execute(
            """INSERT INTO daily_solar (date, solar_kwh, peak_watts, solar_hours,
               total_output_kwh, total_charge_kwh, samples)
               VALUES (?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(date) DO UPDATE SET
               solar_kwh=excluded.solar_kwh, peak_watts=excluded.peak_watts,
               solar_hours=excluded.solar_hours, total_output_kwh=excluded.total_output_kwh,
               total_charge_kwh=excluded.total_charge_kwh, samples=excluded.samples""",
            (date, solar_kwh, peak_watts, solar_hours, output_kwh, charge_kwh, samples),
        )
        await db.commit()
    finally:
        await db.close()


async def update_monthly(month: str):
    db = await get_db()
    try:
        row = await db.execute_fetchall(
            """SELECT COALESCE(SUM(solar_kwh),0) as total,
                      COALESCE(AVG(solar_kwh),0) as avg_daily,
                      COALESCE(MAX(solar_kwh),0) as peak_day,
                      COALESCE(SUM(total_output_kwh),0) as output,
                      COUNT(CASE WHEN solar_kwh > 0.01 THEN 1 END) as days
               FROM daily_solar WHERE date LIKE ?||'%'""",
            (month,),
        )
        if row:
            r = row[0]
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
    finally:
        await db.close()


async def update_yearly(year: str):
    db = await get_db()
    try:
        row = await db.execute_fetchall(
            """SELECT COALESCE(SUM(solar_kwh),0),
                      COALESCE(AVG(solar_kwh),0),
                      COALESCE(SUM(total_output_kwh),0)
               FROM monthly_solar WHERE month LIKE ?||'%'""",
            (year,),
        )
        best = await db.execute_fetchall(
            """SELECT month FROM monthly_solar
               WHERE month LIKE ?||'%' ORDER BY solar_kwh DESC LIMIT 1""",
            (year,),
        )
        if row:
            r = row[0]
            best_month = best[0][0] if best else ""
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
    finally:
        await db.close()


async def get_daily(days: int = 30) -> list[dict]:
    db = await get_db()
    try:
        rows = await db.execute_fetchall(
            "SELECT * FROM daily_solar ORDER BY date DESC LIMIT ?", (days,)
        )
        return [dict(r) for r in rows]
    finally:
        await db.close()


async def get_monthly(months: int = 12) -> list[dict]:
    db = await get_db()
    try:
        rows = await db.execute_fetchall(
            "SELECT * FROM monthly_solar ORDER BY month DESC LIMIT ?", (months,)
        )
        return [dict(r) for r in rows]
    finally:
        await db.close()


async def get_yearly() -> list[dict]:
    db = await get_db()
    try:
        rows = await db.execute_fetchall(
            "SELECT * FROM yearly_solar ORDER BY year DESC"
        )
        return [dict(r) for r in rows]
    finally:
        await db.close()


async def get_soh_trend():
    db = await get_db()
    try:
        rows = await db.execute_fetchall(
            "SELECT date(timestamp) as day, ROUND(AVG(battery_soh)) as avg_soh "
            "FROM readings WHERE battery_soh > 0 "
            "GROUP BY date(timestamp) ORDER BY day"
        )
        return [{"date": r[0], "soh": int(r[1])} for r in rows]
    finally:
        await db.close()


async def get_daily_stats(days: int = 30):
    db = await get_db()
    try:
        if days >= 9999:
            # All data
            rows = await db.execute_fetchall(
                "SELECT date(timestamp) as day, "
                "ROUND(AVG(solar_watts), 1) as avg_solar, "
                "MAX(solar_watts) as peak_solar, "
                "ROUND(AVG(temperature), 1) as avg_temp, "
                "MIN(temperature) as min_temp, MAX(temperature) as max_temp, "
                "MIN(battery_soc) as min_soc, MAX(battery_soc) as max_soc, "
                "ROUND(AVG(total_output_watts), 1) as avg_output, "
                "MAX(total_output_watts) as peak_output "
                "FROM readings GROUP BY date(timestamp) "
                "ORDER BY day DESC",
            )
        else:
            cutoff = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
            rows = await db.execute_fetchall(
                "SELECT date(timestamp) as day, "
                "ROUND(AVG(solar_watts), 1) as avg_solar, "
                "MAX(solar_watts) as peak_solar, "
                "ROUND(AVG(temperature), 1) as avg_temp, "
                "MIN(temperature) as min_temp, MAX(temperature) as max_temp, "
                "MIN(battery_soc) as min_soc, MAX(battery_soc) as max_soc, "
                "ROUND(AVG(total_output_watts), 1) as avg_output, "
                "MAX(total_output_watts) as peak_output "
                "FROM readings WHERE date(timestamp) >= ? "
                "GROUP BY date(timestamp) ORDER BY day DESC",
                (cutoff,),
            )
        return [{"date": r[0], "avg_solar": r[1], "peak_solar": r[2],
                 "avg_temp": r[3], "min_temp": r[4], "max_temp": r[5],
                 "min_soc": r[6], "max_soc": r[7],
                 "avg_output": r[8], "peak_output": r[9]} for r in rows]
    finally:
        await db.close()


async def cleanup_old_readings():
    """Simple cleanup: delete readings older than 2 days.

    SQLite is only for live dashboard charts (last 2 days, high res).
    All historical changes live in the CSV/gzip archive (delta storage).
    Charts longer than 2 days are served from the archive.
    """
    db = await get_db()
    try:
        cutoff = (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d")
        result = await db.execute("DELETE FROM readings WHERE timestamp < ?", (cutoff,))
        count = result.rowcount
        await db.commit()
        if count > 0:
            await db.execute("VACUUM")
        return count
    finally:
        await db.close()



async def get_latest_reading() -> dict | None:
    db = await get_db()
    try:
        row = await db.execute_fetchall(
            "SELECT * FROM readings ORDER BY timestamp DESC LIMIT 1"
        )
        return dict(row[0]) if row else None
    finally:
        await db.close()


async def get_readings(hours: int = 24) -> list[dict]:
    db = await get_db()
    try:
        rows = await db.execute_fetchall(
            """SELECT * FROM readings
               WHERE timestamp >= datetime('now', ? || ' hours')
                 AND NOT (battery_soc = 0 AND temperature = 0)
               ORDER BY timestamp ASC""",
            (f"-{hours}",),
        )
        return [dict(r) for r in rows]
    finally:
        await db.close()


async def get_energy_summary() -> dict:
    """Get energy totals for today, this week, this month, this year, and all-time."""
    db = await get_db()
    try:
        periods = {}
        for label, where in [
            ("week", "date >= date('now', 'weekday 1', '-7 days')"),
            ("month", "date >= date('now', 'start of month')"),
            ("year", "date >= date('now', 'start of year')"),
            ("total", "1=1"),
        ]:
            row = await db.execute_fetchall(
                f"""SELECT COALESCE(SUM(solar_kwh),0),
                           COALESCE(SUM(total_output_kwh),0)
                    FROM daily_solar WHERE {where}"""
            )
            r = row[0] if row else (0, 0)
            periods[label] = {"solar_kwh": round(r[0], 3), "output_kwh": round(r[1], 3)}
        return periods
    finally:
        await db.close()


async def get_stats(price_eur: float = 0.25) -> dict:
    db = await get_db()
    try:
        total = await db.execute_fetchall(
            """SELECT COALESCE(SUM(solar_kwh),0) as total_kwh,
                      COALESCE(AVG(solar_kwh),0) as avg_daily,
                      COALESCE(MAX(solar_kwh),0) as best_day_kwh,
                      COUNT(*) as total_days
               FROM daily_solar WHERE solar_kwh > 0"""
        )
        r = total[0] if total else (0, 0, 0, 0)
        total_kwh = r[0]
        return {
            "total_solar_kwh": round(total_kwh, 2),
            "avg_daily_kwh": round(r[1], 2),
            "best_day_kwh": round(r[2], 2),
            "total_days": r[3],
            "total_savings_eur": round(total_kwh * price_eur, 2),
            "price_per_kwh": price_eur,
        }
    finally:
        await db.close()
