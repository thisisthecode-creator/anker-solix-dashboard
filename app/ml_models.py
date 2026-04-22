"""Simple, self-training ML forecast models.

Two tiny models that retrain nightly from the data we already collect:

  1. Solar model — predicts tomorrow's solar kWh from Open-Meteo weather features
     (sunshine_h, shortwave_mj, cloud_pct, temp_max/min, uv_max, precip_mm,
     day_of_year_sin/cos for seasonality). Uses sklearn LinearRegression trained
     on all (historical_weather → actual_daily_solar) pairs we've accumulated.

  2. Load model — predicts tomorrow's consumption kWh from a rolling 30-day
     weekday average. No weather features; it's a pure 7×4 lookup by
     weekday + month-quarter. Good enough as a baseline.

Both models are persisted as pickle files on the data volume so they survive
restarts. The retrain function skips training when there are fewer than 5 data
points (cold start) — the Open-Meteo physics estimate is the only forecast then.

Accuracy is tracked via forecast_log + daily_solar so /api/forecast-accuracy
can show you which model is actually winning.
"""
import json
import logging
import math
import pickle
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

from app.config import TIMEZONE
from app.database import get_pool
from app.forecast import fetch_openmeteo_historical, fetch_openmeteo_daily_kwh

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).resolve().parent.parent / "data" / "models"
SOLAR_MODEL_PATH = MODEL_DIR / "solar_linreg.pkl"
LOAD_MODEL_PATH = MODEL_DIR / "load_weekday.pkl"

FEATURE_KEYS = [
    "sunshine_h", "shortwave_mj", "cloud_pct",
    "temp_max", "temp_min", "uv_max", "precip_mm", "wind_max_kmh",
    "doy_sin", "doy_cos",
]

MIN_TRAIN_ROWS = 5


def _features_from_weather(w: dict, date_str: str) -> list[float]:
    """Build feature vector from weather dict + seasonality proxy."""
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d").timetuple().tm_yday
    except ValueError:
        d = 1
    angle = 2 * math.pi * d / 365
    return [
        w.get("sunshine_h", 0), w.get("shortwave_mj", 0), w.get("cloud_pct", 0),
        w.get("temp_max", 0), w.get("temp_min", 0), w.get("uv_max", 0),
        w.get("precip_mm", 0), w.get("wind_max_kmh", 0),
        math.sin(angle), math.cos(angle),
    ]


async def _load_training_pairs() -> list[tuple[list[float], float]]:
    """Fetch (weather_features, actual_solar_kwh) pairs.

    Weather comes from Open-Meteo archive for each day we have a daily_solar
    row. Results are cached in forecast_log rows with source='training_weather'
    so we don't hammer the archive API on every retrain.
    """
    db = await get_pool()
    cur = await db.execute(
        "SELECT date, solar_kwh FROM daily_solar "
        "WHERE solar_kwh > 0 ORDER BY date ASC"
    )
    rows = await cur.fetchall()
    if not rows:
        return []

    # Pull cached training features from forecast_log
    cur = await db.execute(
        "SELECT date, features_json FROM forecast_log "
        "WHERE source = 'training_weather'"
    )
    cached = {r[0]: r[1] for r in await cur.fetchall()}

    pairs: list[tuple[list[float], float]] = []
    tz = ZoneInfo(TIMEZONE)
    today = datetime.now(tz).strftime("%Y-%m-%d")
    for date_str, kwh in rows:
        if date_str >= today:
            continue  # skip today (not yet final)
        feat_str = cached.get(date_str)
        weather = None
        if feat_str:
            try:
                weather = json.loads(feat_str)
            except Exception:
                weather = None
        if weather is None:
            weather = await fetch_openmeteo_historical(date_str)
            if not weather:
                continue
            # Cache it
            from app.database import insert_forecast
            await insert_forecast(
                date=date_str,
                source="training_weather",
                predicted_kwh=0,
                features_json=json.dumps(weather),
            )
        feats = _features_from_weather(weather, date_str)
        pairs.append((feats, float(kwh)))
    return pairs


async def _load_training_load_pairs() -> list[tuple[tuple[int, int], float]]:
    """(weekday, month_quarter) → daily_output_kwh pairs for the load model."""
    db = await get_pool()
    cur = await db.execute(
        "SELECT date, total_output_kwh FROM daily_solar "
        "WHERE total_output_kwh > 0 ORDER BY date ASC"
    )
    rows = await cur.fetchall()
    pairs = []
    for date_str, kwh in rows:
        try:
            d = datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            continue
        weekday = d.weekday()  # 0-6
        month_q = (d.month - 1) // 3  # 0-3 (winter/spring/summer/autumn-ish)
        pairs.append(((weekday, month_q), float(kwh)))
    return pairs


async def retrain_and_save():
    """Retrain both models and write pickles to the volume."""
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    # --- Solar model (sklearn LinearRegression) ---
    try:
        pairs = await _load_training_pairs()
    except Exception as e:
        logger.warning("Could not build solar training set: %s", e)
        pairs = []

    solar_trained = False
    solar_metrics: dict = {}
    if len(pairs) >= MIN_TRAIN_ROWS:
        try:
            import numpy as np
            X = np.array([p[0] for p in pairs])
            y = np.array([p[1] for p in pairs])

            # With >= 20 samples use GradientBoosting (much better non-linear fit).
            # With < 20, stick to LinearRegression to avoid overfitting.
            if len(pairs) >= 20:
                from sklearn.ensemble import GradientBoostingRegressor
                model = GradientBoostingRegressor(
                    n_estimators=100, max_depth=3, learning_rate=0.05,
                    random_state=42, min_samples_leaf=2,
                )
                model_type = "sklearn_gbr"
            else:
                from sklearn.linear_model import LinearRegression
                model = LinearRegression()
                model_type = "sklearn_linreg"

            # Compute holdout metrics via k-fold CV when we have enough data,
            # otherwise fall back to simple leave-one-out for small sample sizes.
            if len(pairs) >= 6:
                from sklearn.model_selection import cross_val_predict
                k = min(5, max(2, len(pairs) // 2)) if len(pairs) < 10 else min(5, max(2, len(pairs) // 4))
                preds = cross_val_predict(model, X, y, cv=k)
                errors = y - preds
                mae = float(np.mean(np.abs(errors)))
                rmse = float(np.sqrt(np.mean(errors ** 2)))
                ss_res = float(np.sum(errors ** 2))
                ss_tot = float(np.sum((y - np.mean(y)) ** 2))
                r2 = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0.0
                mape_items = [abs(e / a) * 100 for e, a in zip(errors, y) if a > 0.05]
                mape = float(np.mean(mape_items)) if mape_items else 0.0
                solar_metrics = {
                    "mae_kwh": round(mae, 3),
                    "rmse_kwh": round(rmse, 3),
                    "r2": round(r2, 3),
                    "mape_pct": round(mape, 1),
                    "cv_folds": k,
                }

            # Fit full model and persist (for prediction we use .predict via pickled model)
            model.fit(X, y)
            with open(SOLAR_MODEL_PATH, "wb") as f:
                pickle.dump({
                    "type": model_type,
                    "feature_keys": FEATURE_KEYS,
                    "model_pickle": pickle.dumps(model),
                    "n_train": len(pairs),
                    "trained_at": datetime.now().isoformat(timespec="seconds"),
                    "metrics": solar_metrics,
                }, f)
            solar_trained = True
            logger.info("Solar ML (%s) retrained on %d pairs. metrics=%s",
                        model_type, len(pairs), solar_metrics)
        except Exception as e:
            logger.warning("Solar model training failed: %s", e)
    else:
        logger.info("Not enough solar training data yet (%d < %d)", len(pairs), MIN_TRAIN_ROWS)

    # --- Load model (weekday × month_quarter lookup) ---
    try:
        load_pairs = await _load_training_load_pairs()
    except Exception as e:
        logger.warning("Could not build load training set: %s", e)
        load_pairs = []

    load_trained = False
    if len(load_pairs) >= MIN_TRAIN_ROWS:
        try:
            from collections import defaultdict
            buckets: dict[tuple[int, int], list[float]] = defaultdict(list)
            for key, kwh in load_pairs:
                buckets[key].append(kwh)
            table = {}
            global_mean = sum(k for _, k in load_pairs) / len(load_pairs)
            for key, values in buckets.items():
                if len(values) >= 2:
                    table[f"{key[0]}_{key[1]}"] = round(sum(values) / len(values), 3)
                else:
                    # Blend with global mean for small-sample buckets
                    table[f"{key[0]}_{key[1]}"] = round(
                        (values[0] + global_mean) / 2, 3
                    )
            with open(LOAD_MODEL_PATH, "wb") as f:
                pickle.dump({
                    "type": "weekday_quarter_lookup",
                    "table": table,
                    "global_mean": round(global_mean, 3),
                    "n_train": len(load_pairs),
                    "trained_at": datetime.now().isoformat(timespec="seconds"),
                }, f)
            load_trained = True
            logger.info("Load ML model retrained on %d pairs", len(load_pairs))
        except Exception as e:
            logger.warning("Load model training failed: %s", e)

    return {"solar_trained": solar_trained, "load_trained": load_trained}


_model_cache: dict[str, tuple[float, dict]] = {}


def _load_model_cached(path: Path) -> dict | None:
    if not path.exists():
        return None
    mtime = path.stat().st_mtime
    key = str(path)
    if key in _model_cache and _model_cache[key][0] == mtime:
        return _model_cache[key][1]
    try:
        with open(path, "rb") as f:
            model = pickle.load(f)
        _model_cache[key] = (mtime, model)
        return model
    except Exception as e:
        logger.warning("Failed to load model %s: %s", path, e)
        return None


def _load_solar_model() -> dict | None:
    return _load_model_cached(SOLAR_MODEL_PATH)


def _load_load_model() -> dict | None:
    return _load_model_cached(LOAD_MODEL_PATH)


def _predict_solar(weather: dict, date_str: str) -> float | None:
    """Predict solar kWh from weather features using the persisted model."""
    model = _load_solar_model()
    if not model:
        return None
    feats = _features_from_weather(weather, date_str)
    try:
        # New format: real pickled sklearn model
        if "model_pickle" in model:
            sk_model = pickle.loads(model["model_pickle"])
            import numpy as np
            pred = float(sk_model.predict(np.array([feats]))[0])
            return max(0.0, round(pred, 3))
        # Legacy format: coef + intercept
        pred = model["intercept"] + sum(
            c * x for c, x in zip(model["coef"], feats)
        )
        return max(0.0, round(pred, 3))
    except Exception as e:
        logger.warning("Solar predict failed: %s", e)
        return None


def _predict_load(date_str: str) -> float | None:
    """Predict load kWh from weekday × quarter lookup."""
    model = _load_load_model()
    if not model:
        return None
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        return None
    weekday = d.weekday()
    month_q = (d.month - 1) // 3
    key = f"{weekday}_{month_q}"
    return model["table"].get(key, model.get("global_mean", 0))


async def predict_tomorrow(target: str = "solar") -> dict:
    """Return forecast comparison for tomorrow: Open-Meteo + local ML."""
    tz = ZoneInfo(TIMEZONE)
    tomorrow = (datetime.now(tz) + timedelta(days=1)).strftime("%Y-%m-%d")

    out: dict = {"date": tomorrow, "target": target}
    om = await fetch_openmeteo_daily_kwh(tomorrow)
    if om:
        out["openmeteo_kwh"] = om["predicted_kwh"]
        out["features"] = om["features"]
    if target == "solar":
        ml = _predict_solar(om.get("features", {}) if om else {}, tomorrow)
        if ml is not None:
            out["ml_kwh"] = ml
    else:  # load
        ml = _predict_load(tomorrow)
        if ml is not None:
            out["ml_kwh"] = ml
    return out


async def predict_tomorrow_internal() -> dict:
    """Used by the nightly loop — combines both targets into one dict for
    writing to forecast_log."""
    tz = ZoneInfo(TIMEZONE)
    tomorrow = (datetime.now(tz) + timedelta(days=1)).strftime("%Y-%m-%d")
    out: dict = {}
    om = await fetch_openmeteo_daily_kwh(tomorrow)
    if om:
        out["features"] = om.get("features", {})
        s = _predict_solar(om.get("features", {}), tomorrow)
        if s is not None:
            out["solar_kwh"] = s
    l = _predict_load(tomorrow)
    if l is not None:
        out["load_kwh"] = l
    return out
