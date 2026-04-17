import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

ANKER_USER = os.getenv("ANKERUSER", "")
ANKER_PASSWORD = os.getenv("ANKERPASSWORD", "")
ANKER_COUNTRY = os.getenv("ANKERCOUNTRY", "DE")

DB_PATH = BASE_DIR / "data" / "solar.db"
SERVER_HOST = "0.0.0.0"
SERVER_PORT = 8420
TIMEZONE = "Europe/Warsaw"

MQTT_TRIGGER_TIMEOUT = 120
WS_BROADCAST_INTERVAL = 3.0
DB_SAMPLE_INTERVAL = 30
# Max dt (s) for trapezoidal kWh integration. Set generously high so the
# accumulator tolerates long stable periods: disk writes only land on value
# changes now, so restore_accumulator may replay readings hours apart when
# nothing happened (e.g. overnight idle). The integration is still exact there
# because identical fingerprints imply constant power × dt.
GAP_THRESHOLD = 7200

# Poland household electricity price in EUR/kWh (2025/2026)
ELECTRICITY_PRICE_EUR = 0.25

BATTERY_CAPACITY_WH = 2080  # C1000 Gen 2 (1024 Wh) + BP1000 expansion (1056 Wh)
# System cost in EUR (4011 PLN ÷ 4.2623 NBP rate 2026-04-08)
SYSTEM_COST_EUR = 941
# Location: Warsaw, Poland (52°11'34"N 21°0'37"E, 120m, SW facing 240°)
LATITUDE = 52.1928
LONGITUDE = 21.0103
# Panel orientation (SW 240°) and nominal peak power (2× 200 W)
PANEL_AZIMUTH_DEG = 240
PANEL_PEAK_KW = 0.40

# Anomaly-detection baseline: how many days back to build the per-hour
# weekday baseline from, and how many sigmas above mean triggers an alert.
ANOMALY_BASELINE_DAYS = 30
ANOMALY_SIGMA_THRESHOLD = 2.0

# Auth (optional): when set, /api/* + / require a signed session cookie
# obtained from POST /auth/login with this password. Empty = public (no auth).
DASHBOARD_PASSWORD = os.getenv("DASHBOARD_PASSWORD", "")
