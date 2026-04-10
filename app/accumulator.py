import time
from datetime import datetime
from zoneinfo import ZoneInfo

from app.config import TIMEZONE, GAP_THRESHOLD


class SolarAccumulator:
    def __init__(self):
        self.tz = ZoneInfo(TIMEZONE)
        self.current_date: str = ""
        self.energy_wh: float = 0.0
        self.output_wh: float = 0.0
        self.charge_wh: float = 0.0
        self.peak_watts: float = 0.0
        self.solar_seconds: float = 0.0
        self.sample_count: int = 0
        self.last_ts: float = 0.0
        self.last_solar_w: float = 0.0
        self.last_output_w: float = 0.0
        self.last_charge_w: float = 0.0
        self._pending_day: dict | None = None

    @property
    def today(self) -> str:
        return datetime.now(self.tz).strftime("%Y-%m-%d")

    @property
    def kwh(self) -> float:
        return round(self.energy_wh / 1000, 3)

    @property
    def output_kwh(self) -> float:
        return round(self.output_wh / 1000, 3)

    @property
    def charge_kwh(self) -> float:
        return round(self.charge_wh / 1000, 3)

    @property
    def solar_hours(self) -> float:
        return round(self.solar_seconds / 3600, 1)

    def update(self, solar_watts: float, output_watts: float = 0,
               charge_watts: float = 0, ts: float | None = None) -> dict | None:
        """Feed new MQTT reading. Returns finalized day dict if day rolled over."""
        now = ts or time.time()
        today = self.today
        finalized = None

        if self.current_date and self.current_date != today:
            finalized = self._finalize()

        if not self.current_date or self.current_date != today:
            self.current_date = today
            self._reset()

        if self.last_ts > 0:
            dt = now - self.last_ts
            if 0 < dt < GAP_THRESHOLD:
                self.energy_wh += ((self.last_solar_w + solar_watts) / 2) * (dt / 3600)
                self.output_wh += ((self.last_output_w + output_watts) / 2) * (dt / 3600)
                self.charge_wh += ((self.last_charge_w + charge_watts) / 2) * (dt / 3600)
                if solar_watts > 5:
                    self.solar_seconds += dt

        if solar_watts > self.peak_watts:
            self.peak_watts = solar_watts

        self.last_ts = now
        self.last_solar_w = solar_watts
        self.last_output_w = output_watts
        self.last_charge_w = charge_watts
        self.sample_count += 1

        return finalized

    def get_today(self) -> dict:
        return {
            "date": self.current_date,
            "solar_kwh": self.kwh,
            "peak_watts": round(self.peak_watts, 1),
            "solar_hours": self.solar_hours,
            "total_output_kwh": self.output_kwh,
            "total_charge_kwh": self.charge_kwh,
            "samples": self.sample_count,
        }

    def _finalize(self) -> dict:
        result = self.get_today()
        self._pending_day = result
        return result

    def _reset(self):
        self.energy_wh = 0.0
        self.output_wh = 0.0
        self.charge_wh = 0.0
        self.peak_watts = 0.0
        self.solar_seconds = 0.0
        self.sample_count = 0
        self.last_ts = 0.0
        self.last_solar_w = 0.0
        self.last_output_w = 0.0
        self.last_charge_w = 0.0
