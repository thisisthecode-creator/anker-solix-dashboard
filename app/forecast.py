"""Open-Meteo forecast helper — pulls tomorrow's weather and estimates
expected solar production from the orientation-aware tilt + sun-hours model.

The actual Open-Meteo API call lives here so the nightly forecast logger
and the live /api/forecast frontend route can share one implementation.
"""
import json
import logging
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

try:
    import httpx
except Exception:  # pragma: no cover
    httpx = None

from app.config import TIMEZONE, LATITUDE, LONGITUDE, PANEL_PEAK_KW, PANEL_AZIMUTH_DEG

logger = logging.getLogger(__name__)

OPENMETEO_URL = "https://api.open-meteo.com/v1/forecast"
OPENMETEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"


async def fetch_openmeteo_daily_kwh(date_str: str) -> dict | None:
    """Fetch Open-Meteo forecast for one day and return a predicted kWh.

    The kWh estimate is intentionally simple — sun_hours × peak_kw × clear_sky_factor
    — so we can compare it against the ML model on the same day.
    """
    if httpx is None:
        logger.warning("httpx not installed; forecast fetch disabled")
        return None
    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "daily": ",".join([
            "sunshine_duration", "shortwave_radiation_sum",
            "cloud_cover_mean", "temperature_2m_max",
            "temperature_2m_min", "uv_index_max",
            "precipitation_sum", "wind_speed_10m_max",
        ]),
        "timezone": TIMEZONE,
        "start_date": date_str,
        "end_date": date_str,
    }
    try:
        async with httpx.AsyncClient(timeout=10) as c:
            r = await c.get(OPENMETEO_URL, params=params)
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        logger.warning("Open-Meteo fetch failed: %s", e)
        return None
    daily = data.get("daily") or {}
    try:
        sunshine_s = (daily.get("sunshine_duration") or [0])[0] or 0
        shortwave = (daily.get("shortwave_radiation_sum") or [0])[0] or 0
        cloud = (daily.get("cloud_cover_mean") or [0])[0] or 0
        temp_max = (daily.get("temperature_2m_max") or [0])[0] or 0
        temp_min = (daily.get("temperature_2m_min") or [0])[0] or 0
        uv = (daily.get("uv_index_max") or [0])[0] or 0
        wind = (daily.get("wind_speed_10m_max") or [0])[0] or 0
        precip = (daily.get("precipitation_sum") or [0])[0] or 0
    except Exception as e:
        logger.warning("Unexpected Open-Meteo shape: %s", e)
        return None

    sunshine_h = sunshine_s / 3600
    # Simple physics-ish estimate: shortwave_radiation_sum is MJ/m² for the day.
    # For a 2×220 W panel at SW-245°, the empirical correlation is:
    #   kWh ≈ 0.045 × shortwave_MJ + 0.035 × sunshine_h × peak_kW
    # Then cloud attenuation (already in shortwave) and orientation loss (~12%).
    peak_kw = PANEL_PEAK_KW
    base = 0.045 * shortwave + 0.035 * sunshine_h * peak_kw * 1000  # Wh then scale
    base = base / 1000  # convert to kWh
    orientation_loss = 0.88  # SW 245° gets ~88% of south-facing
    predicted_kwh = max(0.0, base * orientation_loss)

    return {
        "predicted_kwh": round(predicted_kwh, 3),
        "features": {
            "sunshine_h": round(sunshine_h, 2),
            "shortwave_mj": round(shortwave, 2),
            "cloud_pct": round(cloud, 1),
            "temp_max": round(temp_max, 1),
            "temp_min": round(temp_min, 1),
            "uv_max": round(uv, 1),
            "wind_max_kmh": round(wind, 1),
            "precip_mm": round(precip, 2),
        },
    }


async def fetch_openmeteo_historical(date_str: str) -> dict | None:
    """Pull ACTUAL weather for a past day (for ML training pairs).

    Uses the archive API so we can backfill training data for dates we
    already have daily_solar rows for.
    """
    if httpx is None:
        return None
    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "daily": ",".join([
            "sunshine_duration", "shortwave_radiation_sum",
            "cloud_cover_mean", "temperature_2m_max",
            "temperature_2m_min", "uv_index_max",
            "precipitation_sum", "wind_speed_10m_max",
        ]),
        "timezone": TIMEZONE,
        "start_date": date_str,
        "end_date": date_str,
    }
    try:
        async with httpx.AsyncClient(timeout=15) as c:
            r = await c.get(OPENMETEO_ARCHIVE_URL, params=params)
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        logger.warning("Open-Meteo archive fetch failed for %s: %s", date_str, e)
        return None
    daily = data.get("daily") or {}
    try:
        return {
            "date": date_str,
            "sunshine_h": round(((daily.get("sunshine_duration") or [0])[0] or 0) / 3600, 2),
            "shortwave_mj": round((daily.get("shortwave_radiation_sum") or [0])[0] or 0, 2),
            "cloud_pct": round((daily.get("cloud_cover_mean") or [0])[0] or 0, 1),
            "temp_max": round((daily.get("temperature_2m_max") or [0])[0] or 0, 1),
            "temp_min": round((daily.get("temperature_2m_min") or [0])[0] or 0, 1),
            "uv_max": round((daily.get("uv_index_max") or [0])[0] or 0, 1),
            "wind_max_kmh": round((daily.get("wind_speed_10m_max") or [0])[0] or 0, 1),
            "precip_mm": round((daily.get("precipitation_sum") or [0])[0] or 0, 2),
        }
    except Exception:
        return None
