"""Z-score anomaly detection on usage patterns.

Builds a rolling baseline of (weekday, hour) → mean+stddev of load_watts from
the CSV archive (last ANOMALY_BASELINE_DAYS days), compares the current hour's
average load against it, and flags anything > μ + k·σ.

Called on-demand by /api/anomaly. Cheap: only reads ~30 days of deduped archive.
"""
import gzip
import logging
import math
import statistics
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

from app.config import TIMEZONE, ANOMALY_BASELINE_DAYS, ANOMALY_SIGMA_THRESHOLD

logger = logging.getLogger(__name__)

ARCHIVE_DIR = Path(__file__).resolve().parent.parent / "data" / "archive"


async def current_anomaly() -> dict:
    """Compare current hour's load vs the (weekday, hour) baseline."""
    tz = ZoneInfo(TIMEZONE)
    now = datetime.now(tz)
    current_weekday = now.weekday()
    current_hour = now.hour

    cutoff_date = (now - timedelta(days=ANOMALY_BASELINE_DAYS)).strftime("%Y-%m-%d")

    # Bucket: (weekday, hour) → list of hourly-avg load watts
    buckets: dict[tuple[int, int], list[float]] = defaultdict(list)
    # For computing *today's* current-hour average
    current_hour_samples: list[float] = []

    def _walk(fh):
        next(fh, None)  # header
        # Aggregate per (day, hour): collect load watts samples
        prev_day_hour = None
        hour_samples: list[float] = []
        last_day_hour = None
        for line in fh:
            parts = line.strip().split(",")
            if len(parts) < 14:
                continue
            ts = parts[0]
            date_part = ts[:10]
            if date_part < cutoff_date:
                continue
            try:
                dt = datetime.fromisoformat(ts)
                load = float(parts[11] or 0)
            except Exception:
                continue
            wd = dt.weekday()
            hr = dt.hour
            is_today = date_part == now.strftime("%Y-%m-%d")
            key = (wd, hr)
            if last_day_hour is None:
                last_day_hour = (date_part, hr)
                hour_samples = [load]
                continue
            if (date_part, hr) != last_day_hour:
                # Finalise previous bucket
                if hour_samples:
                    avg = sum(hour_samples) / len(hour_samples)
                    prev_wd = datetime.fromisoformat(
                        last_day_hour[0] + "T00:00:00"
                    ).weekday()
                    prev_key = (prev_wd, last_day_hour[1])
                    if last_day_hour[0] == now.strftime("%Y-%m-%d") and last_day_hour[1] == current_hour:
                        current_hour_samples.extend(hour_samples)
                    else:
                        buckets[prev_key].append(avg)
                last_day_hour = (date_part, hr)
                hour_samples = [load]
            else:
                hour_samples.append(load)
        # Flush tail
        if hour_samples and last_day_hour:
            avg = sum(hour_samples) / len(hour_samples)
            prev_wd = datetime.fromisoformat(
                last_day_hour[0] + "T00:00:00"
            ).weekday()
            prev_key = (prev_wd, last_day_hour[1])
            if last_day_hour[0] == now.strftime("%Y-%m-%d") and last_day_hour[1] == current_hour:
                current_hour_samples.extend(hour_samples)
            else:
                buckets[prev_key].append(avg)

    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    for p in sorted(ARCHIVE_DIR.glob("*.csv.gz")):
        name = p.name.replace(".csv.gz", "")
        if name < cutoff_date:
            continue
        try:
            with gzip.open(p, "rt") as f:
                _walk(f)
        except Exception as e:
            logger.warning("anomaly gz read %s: %s", p, e)
    for p in sorted(ARCHIVE_DIR.glob("*.csv")):
        if p.stem < cutoff_date:
            continue
        try:
            with open(p, "r") as f:
                _walk(f)
        except Exception as e:
            logger.warning("anomaly csv read %s: %s", p, e)

    key = (current_weekday, current_hour)
    baseline = buckets.get(key, [])
    n = len(baseline)
    current_avg = (
        sum(current_hour_samples) / len(current_hour_samples)
        if current_hour_samples else None
    )

    if n < 3 or current_avg is None:
        return {
            "status": "insufficient_data",
            "weekday": current_weekday,
            "hour": current_hour,
            "baseline_n": n,
            "current_avg_w": round(current_avg, 1) if current_avg is not None else None,
        }

    mean = statistics.mean(baseline)
    sigma = statistics.pstdev(baseline) if n > 1 else 0.0
    z = (current_avg - mean) / sigma if sigma > 0 else 0.0
    threshold = ANOMALY_SIGMA_THRESHOLD
    is_high = z > threshold
    is_low = z < -threshold
    pct_diff = (
        (current_avg - mean) / mean * 100 if mean > 0.5 else 0
    )

    return {
        "status": "high" if is_high else ("low" if is_low else "normal"),
        "weekday": current_weekday,
        "hour": current_hour,
        "current_avg_w": round(current_avg, 1),
        "baseline_mean_w": round(mean, 1),
        "baseline_sigma_w": round(sigma, 1),
        "baseline_n": n,
        "z_score": round(z, 2),
        "pct_vs_baseline": round(pct_diff, 1),
        "threshold_sigma": threshold,
    }
