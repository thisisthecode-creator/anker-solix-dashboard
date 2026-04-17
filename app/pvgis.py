"""PVGIS integration - EU JRC climatological PV yield benchmark.

PVGIS is a satellite-calibrated (SARAH-2) long-term solar irradiance dataset
from the EU Joint Research Centre. Unlike Open-Meteo (day-ahead weather
forecast), PVGIS gives us the *expected typical output* for our exact panel
configuration based on 15+ years of measured satellite data.

Use cases:
  1. Sanity-check: "Is my system delivering what the climatology says is
     typical for Warsaw in April?"
  2. Reference baseline: per-month expected kWh so users can compare their
     actual output to long-term normals.
  3. Cross-validation of Open-Meteo: if Open-Meteo consistently overshoots
     PVGIS, the underlying irradiance model may be optimistic.

API: https://re.jrc.ec.europa.eu/api/v5_2/PVcalc
  - Free, no key required
  - Returns monthly + yearly avg PV output for given lat/lon/tilt/azimuth/kWp
  - Based on SARAH-2 (2005-2020 satellite-measured irradiance)

Result is cached locally since PVGIS output doesn't change unless config
(tilt, kWp, azimuth, location) changes.
"""
import json
import logging
from pathlib import Path

try:
    import httpx
except Exception:
    httpx = None

from app.config import LATITUDE, LONGITUDE, PANEL_PEAK_KW, PANEL_AZIMUTH_DEG

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PVGIS_CACHE_PATH = DATA_DIR / "pvgis_benchmark.json"

# PVGIS aspect convention: 0=south, -90=east, +90=west (south=0, positive=west)
# Our panel 240° compass => 240 - 180 = +60 (WSW)
PVGIS_ASPECT = PANEL_AZIMUTH_DEG - 180

# Averaged tilt across our curve strips (60-90° sweep -> 75° average).
# PVGIS uses a single tilt so we pick the effective mean of the curve.
PVGIS_TILT = 75

# Default system loss: 14% (PVGIS default) covers cabling, inverter, temp, dust, mismatch
PVGIS_LOSS = 14


async def fetch_pvgis_benchmark(force: bool = False) -> dict | None:
    """Fetch + cache monthly expected PV output from PVGIS.

    Cached locally because the climatology doesn't change (satellite data is fixed).
    Re-runs when config (tilt/aspect/kWp) changes - detected via cache hash.
    """
    if httpx is None:
        return None
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # Cache key based on our config - invalidate if anything changes
    cache_key = f"{LATITUDE}_{LONGITUDE}_{PANEL_PEAK_KW}_{PVGIS_TILT}_{PVGIS_ASPECT}_{PVGIS_LOSS}"

    if not force and PVGIS_CACHE_PATH.exists():
        try:
            cached = json.loads(PVGIS_CACHE_PATH.read_text())
            if cached.get("cache_key") == cache_key:
                return cached
        except Exception:
            pass

    # PVGIS API call
    params = {
        "lat": LATITUDE, "lon": LONGITUDE,
        "peakpower": PANEL_PEAK_KW,
        "loss": PVGIS_LOSS,
        "angle": PVGIS_TILT,
        "aspect": PVGIS_ASPECT,
        "outputformat": "json",
    }
    try:
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.get("https://re.jrc.ec.europa.eu/api/v5_2/PVcalc", params=params)
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        logger.warning("PVGIS fetch failed: %s", e)
        return None

    # Extract monthly + yearly totals
    # Structure: data["outputs"]["monthly"]["fixed"] = list of 12 dicts
    #   each with: month, E_d (avg daily kWh), E_m (monthly kWh), H(i)_d, SD_m, etc.
    try:
        monthly_raw = data["outputs"]["monthly"]["fixed"]
        months = {}
        for m in monthly_raw:
            months[str(m["month"])] = {
                "daily_avg_kwh": round(m["E_d"], 3),
                "monthly_kwh": round(m["E_m"], 2),
                "irradiance_daily": round(m.get("H(i)_d", 0), 2),
                "stddev_monthly": round(m.get("SD_m", 0), 2),
            }
        yearly = data["outputs"]["totals"]["fixed"]
        result = {
            "cache_key": cache_key,
            "config": {
                "lat": LATITUDE, "lon": LONGITUDE, "peakpower_kw": PANEL_PEAK_KW,
                "tilt_deg": PVGIS_TILT, "aspect_deg": PVGIS_ASPECT, "loss_pct": PVGIS_LOSS,
            },
            "monthly": months,
            "yearly": {
                "total_kwh": round(yearly.get("E_y", 0), 2),
                "daily_avg_kwh": round(yearly.get("E_d", 0), 3),
                "irradiance_yearly": round(yearly.get("H(i)_y", 0), 2),
            },
            "meta": data.get("meta", {}),
        }
        PVGIS_CACHE_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=2))
        logger.info(
            "PVGIS benchmark cached: yearly=%.1f kWh, daily avg=%.2f kWh",
            result["yearly"]["total_kwh"], result["yearly"]["daily_avg_kwh"],
        )
        return result
    except Exception as e:
        logger.warning("PVGIS response parse failed: %s", e)
        return None


def load_pvgis_benchmark() -> dict | None:
    if not PVGIS_CACHE_PATH.exists():
        return None
    try:
        return json.loads(PVGIS_CACHE_PATH.read_text())
    except Exception:
        return None
