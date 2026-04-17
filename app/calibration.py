"""Self-learning per-hour + per-cloud calibration for the solar forecast.

Learns multiplicative correction factors from historical (forecast, actual)
pairs we already have in the CSV archive. No neural network, no heavy deps -
just robust statistics that get better with every new day of data.

Approach:
  1. For each day in the CSV archive with actual solar data:
     - Fetch archived Open-Meteo GTI for that day (cached)
     - Apply the current panel model to get raw forecasted Wh per hour
     - Compare to actual Wh per hour from the archive
     - Accumulate ratios: factor_hour[h] = actual_wh[h] / forecast_wh[h]
  2. Compute robust estimators (trimmed mean) per hour 0..23
  3. Also compute per-cloud-cover bucket factor (0-25%, 25-50%, ...)
  4. Store in data/calibration.json with metadata:
     - Last updated, sample counts, variance, model version

The frontend reads this JSON and multiplies the raw Open-Meteo GTI forecast
by factor_hour[h] × factor_cloud[bucket] before displaying.

Retraining:
- Runs nightly as part of the ML loop (server.py ml_train_loop)
- Incremental: re-reads all archived days each run (small data volume)
- Robust: requires at least N=3 matched pairs per hour to use that hour's factor

Self-optimization:
- As more days accumulate, variance drops and factors become more reliable
- The confidence score (inverse of variance) is exposed via /api/solar-calibration
  so the frontend can blend raw + calibrated based on confidence
"""
import gzip
import json
import logging
import math
import os
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

try:
    import httpx
except Exception:  # pragma: no cover
    httpx = None

from app.config import TIMEZONE, LATITUDE, LONGITUDE, PANEL_PEAK_KW, PANEL_AZIMUTH_DEG
from app.database import get_hourly_solar_for_date, get_available_solar_dates, get_pool

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
CALIBRATION_PATH = DATA_DIR / "calibration.json"
ARCHIVE_CACHE_PATH = DATA_DIR / "archive_gti_cache.json"

# Same curve-strip model used client-side (60-90° tilt sweep, 60° azimuth)
CURVE_STRIPS = [
    {"tilt": 63, "weight": 0.2},
    {"tilt": 69, "weight": 0.2},
    {"tilt": 75, "weight": 0.2},
    {"tilt": 81, "weight": 0.2},
    {"tilt": 87, "weight": 0.2},
]
AZIMUTH = PANEL_AZIMUTH_DEG - 180  # Open-Meteo convention

PANEL_KWP = PANEL_PEAK_KW
PANEL_EFFICIENCY = 0.85

MIN_SAMPLES_PER_HOUR = 3
MIN_WH_THRESHOLD = 5.0  # skip hours with too little activity (noise dominates)
TRIM_PERCENT = 0.1  # trim 10% of outliers on each end


async def _fetch_archive_gti(start_date: str, end_date: str) -> dict[str, list[float]] | None:
    """Fetch per-hour GTI (weighted across strips) from Open-Meteo archive."""
    if httpx is None:
        return None
    try:
        async with httpx.AsyncClient(timeout=30) as c:
            strips = []
            for strip in CURVE_STRIPS:
                r = await c.get(
                    "https://archive-api.open-meteo.com/v1/archive",
                    params={
                        "latitude": LATITUDE, "longitude": LONGITUDE,
                        "hourly": "global_tilted_irradiance,cloud_cover",
                        "tilt": strip["tilt"], "azimuth": AZIMUTH,
                        "timezone": TIMEZONE,
                        "start_date": start_date, "end_date": end_date,
                    },
                )
                r.raise_for_status()
                strips.append(r.json().get("hourly") or {})
    except Exception as e:
        logger.warning("Archive GTI fetch failed %s..%s: %s", start_date, end_date, e)
        return None

    if not strips or not strips[0].get("time"):
        return None

    # Weight-sum the strips + extract cloud_cover from first strip call
    times = strips[0]["time"]
    weighted_gti = [0.0] * len(times)
    for i in range(len(times)):
        wgti = 0.0
        for j, strip in enumerate(CURVE_STRIPS):
            gti = (strips[j].get("global_tilted_irradiance") or [0] * len(times))[i] or 0
            wgti += gti * strip["weight"]
        weighted_gti[i] = wgti

    cloud = strips[0].get("cloud_cover") or [0] * len(times)
    return {"time": times, "gti": weighted_gti, "cloud": cloud}


def _load_archive_cache() -> dict:
    if ARCHIVE_CACHE_PATH.exists():
        try:
            return json.loads(ARCHIVE_CACHE_PATH.read_text())
        except Exception:
            pass
    return {}


def _save_archive_cache(data: dict) -> None:
    ARCHIVE_CACHE_PATH.write_text(json.dumps(data))


async def _get_archive_gti_for_date(date_str: str) -> dict | None:
    """Return {hour: 0..23 -> {gti_wh_m2, cloud_pct}} for a date, cached."""
    cache = _load_archive_cache()
    if date_str in cache:
        return cache[date_str]

    data = await _fetch_archive_gti(date_str, date_str)
    if not data:
        return None

    by_hour: dict[str, dict] = {}
    for i, ts in enumerate(data["time"]):
        if not ts.startswith(date_str):
            continue
        h = int(ts[11:13])
        by_hour[str(h)] = {
            "gti": round(data["gti"][i], 2),
            "cloud": round(data["cloud"][i], 1),
        }
    cache[date_str] = by_hour
    _save_archive_cache(cache)
    return by_hour


def _trimmed_mean(values: list[float], trim: float = TRIM_PERCENT) -> float:
    """Mean after trimming top+bottom trim% outliers."""
    if not values:
        return 0.0
    if len(values) < 4:
        return sum(values) / len(values)
    vs = sorted(values)
    k = max(1, int(len(vs) * trim))
    trimmed = vs[k:-k] if len(vs) - 2 * k >= 1 else vs
    return sum(trimmed) / len(trimmed)


async def retrain_calibration() -> dict:
    """Rebuild the per-hour calibration factors from all archived data.

    Called nightly. Writes data/calibration.json with factors + metadata.
    Returns summary dict.
    """
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    all_dates = await get_available_solar_dates()
    tz = ZoneInfo(TIMEZONE)
    today = datetime.now(tz).strftime("%Y-%m-%d")
    # Only past days (today is incomplete) and last 90 days max for relevance
    eligible = [d for d in all_dates if d < today][:90]
    if not eligible:
        logger.info("Calibration: no eligible past days")
        return {"ok": False, "reason": "no data"}

    # Per-hour ratio accumulators
    hour_ratios: dict[int, list[float]] = {h: [] for h in range(24)}
    # Per-cloud-bucket ratio accumulators (0-25, 25-50, 50-75, 75-100)
    cloud_ratios: dict[int, list[float]] = {0: [], 1: [], 2: [], 3: []}
    sample_days = 0
    sample_hours = 0

    for date_str in eligible:
        archive = await _get_archive_gti_for_date(date_str)
        if not archive:
            continue
        actual = await get_hourly_solar_for_date(date_str)
        if not actual or not actual.get("hourly_wh"):
            continue
        act_wh = actual["hourly_wh"]
        # Skip days with no production (unplugged)
        if sum(act_wh) < 100:  # <100 Wh total = basically nothing
            continue
        sample_days += 1
        for h in range(24):
            h_str = str(h)
            if h_str not in archive:
                continue
            gti = archive[h_str]["gti"]
            cloud = archive[h_str]["cloud"]
            # Raw forecast Wh for this hour: gti_wh_m2 × panel_kwp_kw × efficiency × 1h
            raw_wh = gti * PANEL_KWP * PANEL_EFFICIENCY
            act = act_wh[h]
            if raw_wh < MIN_WH_THRESHOLD and act < MIN_WH_THRESHOLD:
                continue  # both tiny, ratio noisy
            if raw_wh < 1.0:
                continue  # avoid divide-by-near-zero
            ratio = act / raw_wh
            # Sanity cap (reject extreme outliers that are likely data errors)
            if ratio <= 0 or ratio > 5:
                continue
            hour_ratios[h].append(ratio)
            bucket = min(3, int(cloud // 25))
            cloud_ratios[bucket].append(ratio)
            sample_hours += 1

    # Overall bias factor computed FIRST so per-hour can be decomposed as
    # (overall × residual). This way the frontend applies a reliable baseline
    # + small hourly adjustments rather than one noisy per-hour factor.
    _all_ratios = [r for hr in hour_ratios.values() for r in hr]
    _overall_tm = round(_trimmed_mean(_all_ratios), 3) if _all_ratios else 1.0
    overall_samples = len(_all_ratios)
    overall_confidence = 0.0
    if overall_samples >= 10:
        _mean = sum(_all_ratios) / overall_samples
        _var = sum((v - _mean) ** 2 for v in _all_ratios) / overall_samples
        _cv = math.sqrt(_var) / _mean if _mean > 0.01 else 1.0
        overall_confidence = max(0.0, min(1.0, 1.0 - _cv))

    # Build per-hour factors as RESIDUALS vs the overall factor
    hour_factors: dict[str, dict] = {}
    for h in range(24):
        values = hour_ratios[h]
        if len(values) < MIN_SAMPLES_PER_HOUR:
            hour_factors[str(h)] = {
                "factor": 1.0, "residual": 1.0,
                "samples": len(values), "confidence": 0.0,
            }
            continue
        tm = _trimmed_mean(values)
        residual = tm / _overall_tm if _overall_tm > 0.01 else 1.0
        # Confidence: 1 - coefficient_of_variation
        mean = sum(values) / len(values)
        variance = sum((v - mean) ** 2 for v in values) / len(values) if len(values) > 1 else 0
        stddev = math.sqrt(variance)
        cv = stddev / mean if mean > 0.01 else 1.0
        confidence = max(0.0, min(1.0, 1.0 - cv))
        hour_factors[str(h)] = {
            "factor": round(tm, 3),           # absolute factor (actual/forecast)
            "residual": round(residual, 3),   # after removing overall bias
            "samples": len(values),
            "confidence": round(confidence, 3),
            "stddev": round(stddev, 3),
        }

    cloud_factors: dict[str, dict] = {}
    for bucket, values in cloud_ratios.items():
        if len(values) < MIN_SAMPLES_PER_HOUR:
            cloud_factors[str(bucket)] = {"factor": 1.0, "samples": len(values)}
            continue
        cloud_factors[str(bucket)] = {
            "factor": round(_trimmed_mean(values), 3),
            "samples": len(values),
        }

    # Re-use values computed above
    overall_factor = _overall_tm

    # Configured peak (what the code thinks)
    configured_peak_w = PANEL_KWP * PANEL_EFFICIENCY * 1000  # W
    # Effective peak based on average bias (overall_factor)
    effective_peak_w_avg = configured_peak_w * overall_factor
    # Actual max peak ever observed from MQTT data + lookup date
    observed_peak_w = 0
    observed_peak_date = None
    try:
        db = await get_pool()
        cur = await db.execute(
            "SELECT date, peak_watts FROM daily_solar "
            "WHERE peak_watts IS NOT NULL ORDER BY peak_watts DESC LIMIT 1"
        )
        row = await cur.fetchone()
        if row:
            observed_peak_date = row[0]
            observed_peak_w = float(row[1] or 0)
    except Exception:
        observed_peak_w = 0

    # Effective efficiency from observed peak vs nameplate
    # nameplate = PANEL_KWP × 1000 (W, without efficiency)
    nameplate_w = PANEL_KWP * 1000
    observed_efficiency = observed_peak_w / nameplate_w if nameplate_w > 0 else 0

    deviation_pct = round((overall_factor - 1.0) * 100, 1)

    # Diagnosis: is the base config reasonable?
    diagnosis = "ok"
    recommendation = None
    peak_ratio = observed_peak_w / configured_peak_w if configured_peak_w > 0 else 0
    if sample_days < 3:
        diagnosis = "insufficient_data"
        recommendation = "Noch zu wenig Daten - System lernt nach einigen Tagen"
    elif peak_ratio > 1.05:
        diagnosis = "peak_higher"
        recommendation = (
            f"Beobachteter Peak ({observed_peak_w:.0f} W) uebertrifft Config-Peak "
            f"({configured_peak_w:.0f} W) um {(peak_ratio - 1) * 100:.0f}%. "
            f"Panels arbeiten ueber der Annahme - evtl. PANEL_EFFICIENCY hoeher setzen."
        )
    elif abs(deviation_pct) < 10:
        diagnosis = "good_match"
        recommendation = "Grundeinstellungen passen gut zur Realitat"
    elif deviation_pct < -20:
        diagnosis = "forecast_too_high"
        recommendation = (
            f"Prognose ~{abs(deviation_pct):.0f}% zu hoch (Ø Tagesbias). "
            f"Peak ist ok (gemessen {observed_peak_w:.0f}W vs config {configured_peak_w:.0f}W), "
            f"aber Off-Peak-Stunden uberschaetzt Open-Meteo. Kalibrierung korrigiert das."
        )
    elif deviation_pct > 20:
        diagnosis = "forecast_too_low"
        recommendation = f"Prognose ~{deviation_pct:.0f}% zu niedrig - Panels ueberperformen."
    else:
        diagnosis = "moderate_deviation"
        recommendation = f"Prognose weicht um {deviation_pct:+.1f}% ab - Kalibrierung korrigiert automatisch"

    output = {
        "version": 2,
        "updated_at": datetime.now(tz).isoformat(timespec="seconds"),
        "sample_days": sample_days,
        "sample_hours": sample_hours,
        "overall_factor": overall_factor,
        "overall_confidence": round(overall_confidence, 3),
        "overall_samples": overall_samples,
        "hour_factors": hour_factors,
        "cloud_factors": cloud_factors,
        "diagnosis": {
            "status": diagnosis,
            "nameplate_w": round(nameplate_w, 0),
            "configured_peak_w": round(configured_peak_w, 0),
            "observed_peak_w": round(observed_peak_w, 0),
            "observed_peak_date": observed_peak_date,
            "observed_efficiency_pct": round(observed_efficiency * 100, 1),
            "effective_peak_w_avg": round(effective_peak_w_avg, 0),
            "deviation_pct": deviation_pct,
            "recommendation": recommendation,
        },
    }
    CALIBRATION_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2))
    logger.info("Calibration updated: %d days, %d hours, overall=%.3f, diagnosis=%s",
                sample_days, sample_hours, overall_factor, diagnosis)
    return output


def load_calibration() -> dict | None:
    if not CALIBRATION_PATH.exists():
        return None
    try:
        return json.loads(CALIBRATION_PATH.read_text())
    except Exception:
        return None
