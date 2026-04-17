"""Battery cycle tracker — RAM-based, persisted as JSON.

A "full cycle" = complete discharge + recharge = 200% of SOC change.
Tracks every 3s from on_mqtt_data. Replaces the expensive frontend-side
computation that used to read a full year of /api/readings on each page load.
"""
import gzip
import json
import logging
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from app.config import TIMEZONE, BATTERY_CAPACITY_WH

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
STATE_FILE = DATA_DIR / "battery_cycles.json"
ARCHIVE_DIR = DATA_DIR / "archive"

# A full cycle is 100% discharge + 100% recharge = 200% of cumulative SOC delta
FULL_CYCLE_PCT = 200.0
# Ignore SOC jumps bigger than this (data gaps, sensor glitches, restarts)
MAX_SANE_DELTA = 30


class BatteryCycleTracker:
    """Cumulative SOC-delta tracker. Load once, update every 3s, save periodically."""

    def __init__(self):
        self.tz = ZoneInfo(TIMEZONE)
        self.total_delta: float = 0.0   # lifetime cumulative abs(SOC delta)
        self.today_delta: float = 0.0
        self.current_date: str = ""
        self.first_date: str = ""       # earliest day we have data for (for cycles/day)
        self.last_soc: int | None = None
        self._dirty: bool = False
        # Runtime capacity (updated when BP1000 expansion detected via MQTT)
        self.current_capacity_wh: int = BATTERY_CAPACITY_WH

    # ---------- persistence ----------

    def load(self):
        """Load persisted state. Backfills from archive on first run."""
        today = datetime.now(self.tz).strftime("%Y-%m-%d")
        if not STATE_FILE.exists():
            logger.info("No battery_cycles.json — backfilling from archive")
            self._backfill_from_archive()
            self.current_date = today
            self.save(force=True)
            return
        try:
            with open(STATE_FILE) as f:
                state = json.load(f)
            self.total_delta = float(state.get("total_delta", 0))
            self.first_date = state.get("first_date", "")
            saved_date = state.get("today_date", "")
            if saved_date == today:
                self.today_delta = float(state.get("today_delta", 0))
                self.current_date = today
            else:
                # Day rolled over while server was down — recompute today from archive
                self.today_delta = 0.0
                self.current_date = today
                self._compute_today_from_archive()
            logger.info(
                "Battery cycles loaded: total=%.2f cycles, today=%.3f cycles (first=%s)",
                self.total_cycles, self.today_cycles, self.first_date or "unknown",
            )
        except Exception as e:
            logger.warning("Failed to load battery_cycles.json: %s — starting fresh", e)
            self._backfill_from_archive()
            self.current_date = today
            self.save(force=True)

    def save(self, force: bool = False):
        """Persist state. Skips disk I/O if nothing changed."""
        if not self._dirty and not force:
            return
        STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
        tmp = STATE_FILE.with_suffix(".json.tmp")
        try:
            with open(tmp, "w") as f:
                json.dump({
                    "total_delta": round(self.total_delta, 2),
                    "today_delta": round(self.today_delta, 2),
                    "today_date": self.current_date,
                    "first_date": self.first_date,
                    "last_soc": self.last_soc,
                }, f)
            tmp.replace(STATE_FILE)
            self._dirty = False
        except Exception as e:
            logger.warning("Failed to save battery_cycles.json: %s", e)

    # ---------- live update ----------

    def update(self, soc):
        """Feed a new SOC reading (called every 3s from on_mqtt_data)."""
        if soc is None:
            return
        try:
            soc = int(soc)
        except (TypeError, ValueError):
            return
        if soc <= 0:
            return

        today = datetime.now(self.tz).strftime("%Y-%m-%d")
        if self.current_date != today:
            # Day rolled over mid-session
            self.today_delta = 0.0
            self.current_date = today
            if not self.first_date:
                self.first_date = today
            self._dirty = True

        if self.last_soc is None:
            self.last_soc = soc
            return

        delta = abs(soc - self.last_soc)
        if 0 < delta < MAX_SANE_DELTA:
            self.total_delta += delta
            self.today_delta += delta
            self._dirty = True
        self.last_soc = soc

    # ---------- derived ----------

    @property
    def total_cycles(self) -> float:
        return round(self.total_delta / FULL_CYCLE_PCT, 3)

    @property
    def today_cycles(self) -> float:
        return round(self.today_delta / FULL_CYCLE_PCT, 3)

    def days_tracked(self) -> int:
        if not self.first_date or not self.current_date:
            return 0
        try:
            a = datetime.strptime(self.first_date, "%Y-%m-%d")
            b = datetime.strptime(self.current_date, "%Y-%m-%d")
            return max(1, (b - a).days + 1)
        except ValueError:
            return 0

    def stats(self) -> dict:
        days = self.days_tracked()
        cycles_per_day = (self.total_cycles / days) if days > 0 else 0.0
        # Battery one-way throughput per day in kWh: total cycles × capacity ÷ days
        # Industry-standard: 1 cycle ≡ 1 full capacity worth of energy in (or out).
        # Uses runtime capacity (adjusts for BP1000 expansion when connected).
        capacity_kwh = self.current_capacity_wh / 1000.0
        avg_daily_kwh = (self.total_cycles * capacity_kwh / days) if days > 0 else 0.0
        return {
            "total_cycles": self.total_cycles,
            "today_cycles": self.today_cycles,
            "total_delta_pct": round(self.total_delta, 1),
            "today_delta_pct": round(self.today_delta, 1),
            "days_tracked": days,
            "first_date": self.first_date,
            "cycles_per_day": round(cycles_per_day, 4),
            "avg_daily_kwh": round(avg_daily_kwh, 4),
            "battery_capacity_kwh": round(capacity_kwh, 3),
            "last_soc": self.last_soc,
        }

    # ---------- backfill helpers ----------

    def _backfill_from_archive(self):
        """Scan every archive file (.csv + .csv.gz) once and rebuild total_delta."""
        if not ARCHIVE_DIR.exists():
            return
        prev_soc = None
        total = 0.0
        rows = 0
        earliest = ""
        files = sorted(ARCHIVE_DIR.iterdir())
        for path in files:
            name = path.name
            if name.endswith(".csv.gz"):
                date_part = name.replace(".csv.gz", "")
                opener = lambda p=path: gzip.open(p, "rt")
            elif name.endswith(".csv"):
                date_part = path.stem
                opener = lambda p=path: open(p, "r")
            else:
                continue
            if not earliest or date_part < earliest:
                earliest = date_part
            try:
                with opener() as f:
                    next(f, None)  # header
                    for line in f:
                        parts = line.strip().split(",")
                        if len(parts) < 3:
                            continue
                        try:
                            soc = int(float(parts[2]))
                        except ValueError:
                            continue
                        if soc <= 0:
                            continue
                        if prev_soc is not None:
                            delta = abs(soc - prev_soc)
                            if 0 < delta < MAX_SANE_DELTA:
                                total += delta
                        prev_soc = soc
                        rows += 1
            except Exception as e:
                logger.warning("Backfill read %s failed: %s", path, e)
        self.total_delta = total
        self.last_soc = prev_soc
        if earliest:
            self.first_date = earliest
        logger.info(
            "Backfill: %d archive rows, total_delta=%.1f%% (%.3f cycles), first=%s",
            rows, total, total / FULL_CYCLE_PCT, earliest or "n/a",
        )

    def _compute_today_from_archive(self):
        """Recompute today's delta from today's open archive CSV (on restart)."""
        path = ARCHIVE_DIR / f"{self.current_date}.csv"
        if not path.exists():
            return
        prev_soc = self.last_soc
        total = 0.0
        try:
            with open(path, "r") as f:
                next(f, None)
                for line in f:
                    parts = line.strip().split(",")
                    if len(parts) < 3:
                        continue
                    try:
                        soc = int(float(parts[2]))
                    except ValueError:
                        continue
                    if soc <= 0:
                        continue
                    if prev_soc is not None:
                        delta = abs(soc - prev_soc)
                        if 0 < delta < MAX_SANE_DELTA:
                            total += delta
                    prev_soc = soc
        except Exception as e:
            logger.warning("Failed to recompute today from archive: %s", e)
            return
        self.today_delta = total
        self.last_soc = prev_soc
