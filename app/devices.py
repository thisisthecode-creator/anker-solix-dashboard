"""Device fingerprinting from AC output power steps.

Reads archived MQTT rows (ac_output_watts + dc_12v_watts + USB ports) and
detects discrete step changes in output power. Small, repeatable step
sizes typically correspond to individual consumers (e.g. +3 W = Apple TV
idle, +15 W = HomePod mini, +60 W = MacBook charging).

The algorithm:
  1. Iterate archive CSVs for the last N days.
  2. For each consecutive pair of rows, compute delta = ac_output[t+1] - ac_output[t].
  3. Keep |delta| >= MIN_STEP_W to filter out power meter jitter.
  4. Bucket deltas to 0.5 W and count occurrences.
  5. Match common bucket values to a small static library of known devices.

Output is a histogram the UI renders as a labelled bar chart.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

from app.config import TIMEZONE

logger = logging.getLogger(__name__)

ARCHIVE_DIR = Path(__file__).resolve().parent.parent / "data" / "archive"

# Ignore tiny fluctuations - real devices cause >=2 W jumps.
MIN_STEP_W = 2.0
BUCKET_W = 0.5  # round step sizes to this resolution
MAX_STEP_W = 400.0  # ignore huge spikes (likely multi-device simultaneous)

# Known-device library. Each entry: (center_w, tolerance_w, label).
# Tolerance is how far a bucketed step may deviate and still be considered
# that device (covers small line-noise and charging ramp).
KNOWN_DEVICES = [
    (2.5, 1.5, "Apple TV idle"),
    (5.0, 1.5, "iPhone (trickle)"),
    (8.0, 2.0, "MacBook idle"),
    (12.0, 2.5, "HomePod mini idle"),
    (17.0, 3.0, "iPhone schnellladen"),
    (25.0, 4.0, "MacBook leicht"),
    (45.0, 8.0, "MacBook 61 W lädt"),
    (75.0, 10.0, "MacBook Pro 96 W"),
    (120.0, 20.0, "Monitor / größerer Verbraucher"),
    (200.0, 40.0, "Staubsauger / Großverbraucher"),
]


def _label_for(step_w: float) -> str | None:
    for center, tol, label in KNOWN_DEVICES:
        if abs(step_w - center) <= tol:
            return label
    return None


def _iter_archive_rows(path: Path):
    """Yield (timestamp, ac_output_watts) tuples from one archive CSV."""
    import gzip
    from app.database import _parse_archive_row
    opener = (lambda: gzip.open(path, "rt")) if path.suffix == ".gz" else (lambda: open(path, "r"))
    try:
        with opener() as f:
            next(f, None)  # skip header
            for line in f:
                parts = line.strip().split(",")
                if len(parts) < 14:
                    continue
                r = _parse_archive_row(parts)
                if not r:
                    continue
                yield r["timestamp"], r.get("ac_output_watts", 0.0)
    except Exception as e:
        logger.warning("Device fingerprint: failed to read %s: %s", path, e)


async def analyze_device_steps(days: int = 7) -> dict:
    """Scan the last `days` of archive and return a step histogram.

    Returns:
      {
        "available": True | False,
        "days_analyzed": int,
        "total_steps": int,
        "steps": [
          {"watts": 3.0, "count": 42, "direction": "on", "label": "Apple TV idle"},
          ...
        ],
        "unknown_count": int,   # steps that matched no known device
      }
    """
    if not ARCHIVE_DIR.exists():
        return {"available": False, "reason": "no archive directory"}

    tz = ZoneInfo(TIMEZONE)
    today = datetime.now(tz).date()
    target_dates = [(today - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days)]

    on_buckets: dict[float, int] = {}
    off_buckets: dict[float, int] = {}
    days_analyzed = 0
    total_steps = 0

    for date_str in target_dates:
        csv_path = ARCHIVE_DIR / f"{date_str}.csv"
        gz_path = ARCHIVE_DIR / f"{date_str}.csv.gz"
        path = csv_path if csv_path.exists() else (gz_path if gz_path.exists() else None)
        if not path:
            continue
        days_analyzed += 1

        last_ac: float | None = None
        for _ts, ac in _iter_archive_rows(path):
            if last_ac is not None:
                delta = ac - last_ac
                absd = abs(delta)
                if MIN_STEP_W <= absd <= MAX_STEP_W:
                    # Bucket to 0.5 W resolution
                    bucket = round(absd / BUCKET_W) * BUCKET_W
                    target = on_buckets if delta > 0 else off_buckets
                    target[bucket] = target.get(bucket, 0) + 1
                    total_steps += 1
            last_ac = ac

    # Merge on+off counts by bucket (a device that turns on must also turn off;
    # both directions confirm the same power level).
    merged: dict[float, dict] = {}
    for bucket, cnt in on_buckets.items():
        merged.setdefault(bucket, {"on": 0, "off": 0})["on"] += cnt
    for bucket, cnt in off_buckets.items():
        merged.setdefault(bucket, {"on": 0, "off": 0})["off"] += cnt

    # Keep only buckets that were seen at least 3 times (filter noise)
    steps = []
    unknown_count = 0
    for bucket, d in merged.items():
        total = d["on"] + d["off"]
        if total < 3:
            continue
        label = _label_for(bucket)
        if label is None:
            unknown_count += total
        steps.append({
            "watts": bucket,
            "count": total,
            "on_count": d["on"],
            "off_count": d["off"],
            "label": label,
        })

    # Sort by count descending (most frequent first)
    steps.sort(key=lambda s: s["count"], reverse=True)
    # Limit to top 30 so UI stays readable
    steps = steps[:30]

    return {
        "available": days_analyzed > 0,
        "days_analyzed": days_analyzed,
        "total_steps": total_steps,
        "steps": steps,
        "unknown_count": unknown_count,
    }
