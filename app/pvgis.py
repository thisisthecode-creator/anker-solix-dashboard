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

# Curve strips matching the panel's bend: top fixed vertical on the railing
# (90°), bottom pulled out by the 30° bracket (60° from horizontal), middle
# sags smoothly in between. Each strip covers 20% of the panel area.
PVGIS_CURVE_STRIPS = [
    {"tilt": 60, "weight": 0.20, "label": "unten"},
    {"tilt": 68, "weight": 0.20, "label": "mitte-unten"},
    {"tilt": 75, "weight": 0.20, "label": "mitte"},
    {"tilt": 83, "weight": 0.20, "label": "mitte-oben"},
    {"tilt": 90, "weight": 0.20, "label": "oben"},
]

# System loss % - higher than PVGIS default (14%) to account for curved-panel
# geometry losses (self-shading between strips, non-uniform incident angles)
# and typical balcony environment losses (partial shading from railing/building).
PVGIS_LOSS = 20


async def _fetch_pvgis_one(tilt: int, kwp: float) -> dict | None:
    """Fetch PVGIS /PVcalc for one tilt + our common config."""
    params = {
        "lat": LATITUDE, "lon": LONGITUDE,
        "peakpower": kwp,
        "loss": PVGIS_LOSS,
        "angle": tilt,
        "aspect": PVGIS_ASPECT,
        "outputformat": "json",
    }
    try:
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.get("https://re.jrc.ec.europa.eu/api/v5_2/PVcalc", params=params)
            r.raise_for_status()
            return r.json()
    except Exception as e:
        logger.warning("PVGIS fetch failed for tilt=%d: %s", tilt, e)
        return None


async def fetch_pvgis_benchmark(force: bool = False) -> dict | None:
    """Fetch PVGIS yield for each curve strip + weighted-sum for curved panels.

    Sends 5 parallel requests (one per strip at 60/68/75/83/90°), weighted
    by their 20% area share. Result is stored in one cached JSON.
    """
    if httpx is None:
        return None
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    strips_key = ",".join(f"{s['tilt']}:{s['weight']}" for s in PVGIS_CURVE_STRIPS)
    cache_key = f"{LATITUDE}_{LONGITUDE}_{PANEL_PEAK_KW}_{PVGIS_ASPECT}_{PVGIS_LOSS}_{strips_key}"

    if not force and PVGIS_CACHE_PATH.exists():
        try:
            cached = json.loads(PVGIS_CACHE_PATH.read_text())
            if cached.get("cache_key") == cache_key:
                return cached
        except Exception:
            pass

    # Fetch one call per strip - each strip gets (kWp × weight) of the total
    import asyncio
    kwp_per_strip = PANEL_PEAK_KW  # PVcalc scales linearly by peakpower
    results = await asyncio.gather(*[
        _fetch_pvgis_one(s["tilt"], kwp_per_strip)
        for s in PVGIS_CURVE_STRIPS
    ])
    if not all(results):
        logger.warning("PVGIS: one or more strip fetches failed")
        return None

    try:
        # Weighted-sum monthly + yearly across all strips
        weighted_monthly = {str(m): 0.0 for m in range(1, 13)}
        weighted_monthly_days = {str(m): 0.0 for m in range(1, 13)}
        strips_detail = []
        for strip, data in zip(PVGIS_CURVE_STRIPS, results):
            monthly_raw = data["outputs"]["monthly"]["fixed"]
            per_strip = {}
            for m in monthly_raw:
                mk = str(m["month"])
                # Scale: kwp_per_strip was fetched as full kwp, we need weight × that
                contribution_m = m["E_m"] * strip["weight"]
                contribution_d = m["E_d"] * strip["weight"]
                weighted_monthly[mk] += contribution_m
                weighted_monthly_days[mk] += contribution_d
                per_strip[mk] = {"E_m": round(m["E_m"], 2), "E_d": round(m["E_d"], 3)}
            yearly = data["outputs"]["totals"]["fixed"]
            strips_detail.append({
                "tilt": strip["tilt"],
                "weight": strip["weight"],
                "label": strip["label"],
                "yearly_kwh_full_kwp": round(yearly.get("E_y", 0), 2),
                "daily_avg_kwh_full_kwp": round(yearly.get("E_d", 0), 3),
            })

        months = {}
        for mk in weighted_monthly:
            months[mk] = {
                "daily_avg_kwh": round(weighted_monthly_days[mk], 3),
                "monthly_kwh": round(weighted_monthly[mk], 2),
            }
        yearly_total = sum(weighted_monthly.values())
        yearly_daily = yearly_total / 365

        result = {
            "cache_key": cache_key,
            "config": {
                "lat": LATITUDE, "lon": LONGITUDE,
                "peakpower_kw": PANEL_PEAK_KW,
                "aspect_deg": PVGIS_ASPECT,
                "loss_pct": PVGIS_LOSS,
                "curve_strips": PVGIS_CURVE_STRIPS,
                "model": "curved_5strip",
            },
            "monthly": months,
            "yearly": {
                "total_kwh": round(yearly_total, 2),
                "daily_avg_kwh": round(yearly_daily, 3),
            },
            "strips_detail": strips_detail,
            "meta": results[0].get("meta", {}),
        }
        PVGIS_CACHE_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=2))
        logger.info(
            "PVGIS (5-strip curve) cached: yearly=%.1f kWh, daily avg=%.2f kWh",
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
