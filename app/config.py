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
# Max dt (s) for trapezoidal kWh integration. Must be ≥ DISK_HEARTBEAT_S (300 s)
# + some buffer, because restore_accumulator replays deduped readings that can be
# up to heartbeat_s apart when values were stable (integration is still exact
# there — matching floats imply constant power).
GAP_THRESHOLD = 600

# Poland household electricity price in EUR/kWh (2025/2026)
ELECTRICITY_PRICE_EUR = 0.25

BATTERY_CAPACITY_WH = 1024  # C1000 Gen 2 capacity
# Location: Warsaw, Poland (52°11'34"N 21°0'37"E, 120m, SW facing 245°)
LATITUDE = 52.1928
LONGITUDE = 21.0103
