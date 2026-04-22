"""Solar accumulator — RAM-based per-day energy + statistics tracker.

Every 3 s MQTT message is fed into update(). Trapezoidal integration computes
energy totals (kWh), plus instantaneous phase detection derives battery flows,
self-consumption, direct-use and round-trip efficiency.

All derived metrics live in this single object so the MQTT loop stays cheap —
nothing hits disk until day-rollover or a periodic upsert.
"""
import time
from datetime import datetime
from zoneinfo import ZoneInfo

from app.config import TIMEZONE, GAP_THRESHOLD, BATTERY_CAPACITY_WH


class SolarAccumulator:
    def __init__(self):
        self.tz = ZoneInfo(TIMEZONE)
        self.current_date: str = ""

        # --- Energy integrators (trapezoidal) ---
        self.energy_wh: float = 0.0        # solar generated
        self.output_wh: float = 0.0        # load consumed
        self.charge_wh: float = 0.0        # grid AC input
        self.direct_use_wh: float = 0.0    # solar consumed directly by load
        self.battery_in_wh: float = 0.0    # net flow INTO battery (solar+grid-load > 0)
        self.battery_out_wh: float = 0.0   # net flow OUT of battery (load-solar-grid > 0)

        # --- Peak / instantaneous ---
        self.peak_watts: float = 0.0       # solar peak W
        self.peak_output_w: float = 0.0    # load peak W

        # --- Time / sample ---
        self.solar_seconds: float = 0.0
        self.sample_count: int = 0

        # --- Last values (for trapezoidal integration) ---
        self.last_ts: float = 0.0
        self.last_solar_w: float = 0.0
        self.last_output_w: float = 0.0
        self.last_charge_w: float = 0.0
        self.last_direct_use_w: float = 0.0
        self.last_battery_in_w: float = 0.0
        self.last_battery_out_w: float = 0.0

        # --- Running averages ---
        self.sum_solar_w: float = 0.0
        self.count_solar: int = 0
        self.sum_output_w: float = 0.0
        self.count_output: int = 0
        self.sum_temp: float = 0.0
        self.count_temp: int = 0
        self.sum_soh: float = 0.0
        self.count_soh: int = 0

        # --- Min / max (sentinels; normalised in get_today) ---
        self.min_temp: float = 9999.0
        self.max_temp: float = -9999.0
        self.min_soc: int = 101
        self.max_soc: int = -1
        self.first_soc: int = -1    # SOC of first reading (for RTE correction)
        self.last_soc: int = -1     # SOC of latest reading

        self._pending_day: dict | None = None

    @property
    def today(self) -> str:
        return datetime.now(self.tz).strftime("%Y-%m-%d")

    # Legacy accessors (kept for backwards compatibility)
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
               charge_watts: float = 0, ts: float | None = None,
               soc: int | None = None, soh: int | None = None,
               temp: float | None = None) -> dict | None:
        """Feed new MQTT reading. Returns finalized day dict if day rolled over.

        solar_watts   — PV generation (dc_input_power_total)
        output_watts  — total load out (output_power_total)
        charge_watts  — grid AC input (ac_input_power)
        soc / soh / temp — optional stats for daily_stats/SOH trend
        """
        now = ts or time.time()
        today = self.today
        finalized = None

        if self.current_date and self.current_date != today:
            finalized = self._finalize()

        if not self.current_date or self.current_date != today:
            self.current_date = today
            self._reset()

        # Instantaneous phase detection.
        # Conservation: solar + grid = load + battery_net
        # => battery_net > 0: charging; < 0: discharging
        net = solar_watts + charge_watts - output_watts
        battery_in_w = max(0.0, net)
        battery_out_w = max(0.0, -net)
        direct_use_w = min(solar_watts, output_watts)

        if self.last_ts > 0:
            dt = now - self.last_ts
            if 0 < dt < GAP_THRESHOLD:
                hours = dt / 3600
                self.energy_wh += ((self.last_solar_w + solar_watts) / 2) * hours
                self.output_wh += ((self.last_output_w + output_watts) / 2) * hours
                self.charge_wh += ((self.last_charge_w + charge_watts) / 2) * hours
                self.direct_use_wh += ((self.last_direct_use_w + direct_use_w) / 2) * hours
                self.battery_in_wh += ((self.last_battery_in_w + battery_in_w) / 2) * hours
                self.battery_out_wh += ((self.last_battery_out_w + battery_out_w) / 2) * hours
                if solar_watts > 5:
                    self.solar_seconds += dt

        # Peaks
        if solar_watts > self.peak_watts:
            self.peak_watts = solar_watts
        if output_watts > self.peak_output_w:
            self.peak_output_w = output_watts

        # Running averages (sample-based; good enough for daily stats)
        self.sum_solar_w += solar_watts
        self.count_solar += 1
        self.sum_output_w += output_watts
        self.count_output += 1

        if temp is not None and temp > -40:  # sanity check
            self.sum_temp += temp
            self.count_temp += 1
            if temp < self.min_temp:
                self.min_temp = temp
            if temp > self.max_temp:
                self.max_temp = temp

        if soh is not None and 0 < soh <= 100:
            self.sum_soh += soh
            self.count_soh += 1

        if soc is not None and 0 <= soc <= 100:
            if self.first_soc < 0:
                self.first_soc = soc
            self.last_soc = soc
            if soc < self.min_soc:
                self.min_soc = soc
            if soc > self.max_soc:
                self.max_soc = soc

        # Shift last values for next trapezoidal step
        self.last_ts = now
        self.last_solar_w = solar_watts
        self.last_output_w = output_watts
        self.last_charge_w = charge_watts
        self.last_direct_use_w = direct_use_w
        self.last_battery_in_w = battery_in_w
        self.last_battery_out_w = battery_out_w
        self.sample_count += 1

        return finalized

    def get_today(self) -> dict:
        """Return today's current state as a flat dict for upsert_daily + API."""
        avg_solar = self.sum_solar_w / self.count_solar if self.count_solar else 0.0
        avg_output = self.sum_output_w / self.count_output if self.count_output else 0.0
        avg_temp = self.sum_temp / self.count_temp if self.count_temp else 0.0
        avg_soh = self.sum_soh / self.count_soh if self.count_soh else 0.0

        # Derived ratios (see README / info box for definitions)
        # Eigenverbrauch = Solar directly used + solar stored in battery, over total solar
        # Since we don't feed back to grid, virtually 100% of solar is eigenverbraucht.
        # The useful metric is direct-use: what fraction of solar went straight to load.
        direct_use_pct = (
            self.direct_use_wh / self.energy_wh * 100
            if self.energy_wh > 0.01 else 0.0
        )
        # Autarkie = 1 - (Netzbezug / Verbrauch), standard PV industry formula.
        # Everything not directly from grid counts as self-supplied.
        grid_to_load = max(0.0, self.output_wh - self.direct_use_wh - self.battery_out_wh)
        autarkie_pct = (
            (1 - grid_to_load / self.output_wh) * 100
            if self.output_wh > 0.01 else 0.0
        )
        # Round-trip efficiency: corrected for SOC change.
        # Naive out/in is wrong when battery still holds energy from this
        # period. We subtract the delta-stored energy from battery_in so
        # only the energy that completed a full round-trip counts.
        rte_pct = 0.0
        if self.battery_in_wh > 10:
            delta_soc = 0
            if self.first_soc >= 0 and self.last_soc >= 0:
                delta_soc = self.last_soc - self.first_soc
            delta_stored_wh = delta_soc / 100.0 * BATTERY_CAPACITY_WH
            completed_in = self.battery_in_wh - delta_stored_wh
            if completed_in > 50 and self.battery_out_wh > 1:
                rte_pct = min(100.0, max(0.0, self.battery_out_wh / completed_in * 100))
            else:
                rte_pct = min(100.0, self.battery_out_wh / self.battery_in_wh * 100)

        return {
            "date": self.current_date,
            "solar_kwh": round(self.energy_wh / 1000, 3),
            "output_kwh": round(self.output_wh / 1000, 3),
            "charge_kwh": round(self.charge_wh / 1000, 3),
            "direct_use_kwh": round(self.direct_use_wh / 1000, 3),
            "battery_in_kwh": round(self.battery_in_wh / 1000, 3),
            "battery_out_kwh": round(self.battery_out_wh / 1000, 3),
            "peak_watts": round(self.peak_watts, 1),
            "peak_output_w": round(self.peak_output_w, 1),
            "avg_solar_w": round(avg_solar, 1),
            "avg_output_w": round(avg_output, 1),
            "avg_temp": round(avg_temp, 1),
            "min_temp": round(self.min_temp, 1) if self.min_temp < 9999 else 0.0,
            "max_temp": round(self.max_temp, 1) if self.max_temp > -9999 else 0.0,
            "min_soc": self.min_soc if self.min_soc <= 100 else 0,
            "max_soc": self.max_soc if self.max_soc >= 0 else 0,
            "avg_soh": round(avg_soh, 1),
            "solar_hours": round(self.solar_seconds / 3600, 1),
            "samples": self.sample_count,
            "direct_use_pct": round(direct_use_pct, 1),
            "autarkie_pct": round(autarkie_pct, 1),
            "rte_pct": round(rte_pct, 1),
            # Legacy keys (kept so existing callers in server.py + frontend keep working)
            "total_output_kwh": round(self.output_wh / 1000, 3),
            "total_charge_kwh": round(self.charge_wh / 1000, 3),
        }

    def _finalize(self) -> dict:
        result = self.get_today()
        self._pending_day = result
        return result

    def _reset(self):
        self.energy_wh = 0.0
        self.output_wh = 0.0
        self.charge_wh = 0.0
        self.direct_use_wh = 0.0
        self.battery_in_wh = 0.0
        self.battery_out_wh = 0.0
        self.peak_watts = 0.0
        self.peak_output_w = 0.0
        self.solar_seconds = 0.0
        self.sample_count = 0
        self.last_ts = 0.0
        self.last_solar_w = 0.0
        self.last_output_w = 0.0
        self.last_charge_w = 0.0
        self.last_direct_use_w = 0.0
        self.last_battery_in_w = 0.0
        self.last_battery_out_w = 0.0
        self.sum_solar_w = 0.0
        self.count_solar = 0
        self.sum_output_w = 0.0
        self.count_output = 0
        self.sum_temp = 0.0
        self.count_temp = 0
        self.sum_soh = 0.0
        self.count_soh = 0
        self.min_temp = 9999.0
        self.max_temp = -9999.0
        self.min_soc = 101
        self.max_soc = -1
        self.first_soc = -1
        self.last_soc = -1
