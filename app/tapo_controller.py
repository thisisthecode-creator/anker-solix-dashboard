"""SOC-driven on/off controller for a single Tapo plug.

Polls the latest battery SOC; turns the plug ON when SOC drops below
TAPO_SOC_LOW (default 20%) and OFF once SOC reaches TAPO_SOC_HIGH
(default 100%). Anti-flap cooldown between toggles, hard cap on charging
duration as a safety net.

All Tapo cloud failures are caught and logged - they never crash the
main app. The current state is exposed via /api/tapo-status.
"""
from __future__ import annotations

import asyncio
import logging
import os
import time
from dataclasses import asdict, dataclass, field
from typing import Awaitable, Callable

from app.tapo_cloud import TapoCloudClient, TapoCloudError, TapoDevice

logger = logging.getLogger(__name__)

POLL_INTERVAL_S = 30
COOLDOWN_S = 15 * 60          # 15 min between toggles
MAX_ON_DURATION_S = 6 * 3600  # 6 h hard cap
CONNECTIVITY_CHECK_S = 5 * 60  # Re-probe cloud reachability every 5 min


@dataclass
class TapoStatus:
    enabled: bool = False
    configured: bool = False        # credentials + alias present
    device_alias: str | None = None
    device_found: bool = False
    plug_on: bool | None = None     # last observed state
    last_action: str | None = None  # "on" | "off" | "skip-cooldown" | etc
    last_action_ts: float | None = None
    last_soc: int | None = None
    soc_low: int = 20
    soc_high: int = 100
    dry_run: bool = True
    last_error: str | None = None
    last_error_ts: float | None = None
    on_since_ts: float | None = None

    def as_dict(self) -> dict:
        d = asdict(self)
        # Add ISO timestamps for the dashboard
        for key in ("last_action_ts", "last_error_ts", "on_since_ts"):
            ts = d.get(key)
            if ts:
                d[key.replace("_ts", "_iso")] = _to_iso(ts)
        return d


def _to_iso(ts: float) -> str:
    import datetime
    return datetime.datetime.fromtimestamp(ts, tz=datetime.timezone.utc).isoformat(timespec="seconds")


class TapoController:
    def __init__(self, get_soc: Callable[[], int | None]):
        self._get_soc = get_soc
        self._email = os.environ.get("TAPO_EMAIL", "").strip()
        self._password = os.environ.get("TAPO_PASSWORD", "").strip()
        self._alias = os.environ.get("TAPO_DEVICE_ALIAS", "").strip()
        self.status = TapoStatus(
            enabled=os.environ.get("TAPO_ENABLED", "").lower() == "true",
            configured=bool(self._email and self._password and self._alias),
            device_alias=self._alias or None,
            soc_low=int(os.environ.get("TAPO_SOC_LOW", "20")),
            soc_high=int(os.environ.get("TAPO_SOC_HIGH", "100")),
            dry_run=os.environ.get("TAPO_DRY_RUN", "true").lower() == "true",
        )
        self._client: TapoCloudClient | None = None
        self._device: TapoDevice | None = None
        self._task: asyncio.Task | None = None
        self._last_connectivity_check_ts: float = 0.0

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def start(self) -> None:
        if self._task and not self._task.done():
            return
        if not self.status.enabled:
            logger.info("Tapo controller disabled (TAPO_ENABLED != true)")
            return
        if not self.status.configured:
            logger.warning("Tapo controller enabled but TAPO_EMAIL/PASSWORD/DEVICE_ALIAS missing")
            return
        self._task = asyncio.create_task(self._run_loop(), name="tapo_controller")
        logger.info(
            "Tapo controller started: alias=%r low=%d%% high=%d%% dry_run=%s",
            self._alias, self.status.soc_low, self.status.soc_high, self.status.dry_run,
        )

    async def stop(self) -> None:
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except (asyncio.CancelledError, Exception):
                pass
        if self._client:
            await self._client.aclose()

    # ------------------------------------------------------------------
    # Loop
    # ------------------------------------------------------------------

    async def _run_loop(self) -> None:
        # Initial pause so the rest of the app finishes startup first.
        await asyncio.sleep(10)
        # Proactive connectivity probe so the dashboard reflects cloud
        # reachability even when no SOC trigger is pending. Runs in dry-run
        # mode too because the value of "device_found" is purely diagnostic.
        await self._connectivity_check()
        while True:
            try:
                await self._tick()
                if time.time() - self._last_connectivity_check_ts > CONNECTIVITY_CHECK_S:
                    await self._connectivity_check()
            except asyncio.CancelledError:
                return
            except Exception as e:
                self._record_error(f"loop tick: {e}")
                logger.exception("Tapo controller tick failed")
            try:
                await asyncio.sleep(POLL_INTERVAL_S)
            except asyncio.CancelledError:
                return

    async def _connectivity_check(self) -> None:
        """Read the plug state via cloud to refresh device_found / plug_on."""
        self._last_connectivity_check_ts = time.time()
        connected = await self._ensure_client()
        if not connected:
            return
        client, device = connected
        try:
            state = await client.get_state(device)
            self.status.plug_on = state
        except Exception as e:
            self.status.device_found = False
            self._record_error(f"get_state: {e}")
            self._client = None
            self._device = None

    async def _ensure_client(self) -> tuple[TapoCloudClient, TapoDevice] | None:
        if self._client and self._device:
            return self._client, self._device
        try:
            client = TapoCloudClient(self._email, self._password)
            await client.login()
            device = await client.find_device(self._alias)
            self._client = client
            self._device = device
            self.status.device_found = True
            logger.info("Tapo cloud login OK, device %r found (id=%s)", device.alias, device.device_id[:8])
            return client, device
        except (TapoCloudError, Exception) as e:
            self.status.device_found = False
            self._record_error(f"login/find: {e}")
            logger.warning("Tapo cloud login/find failed: %s", e)
            return None

    async def _tick(self) -> None:
        soc = self._get_soc()
        self.status.last_soc = soc
        if soc is None:
            return

        # Decide intent
        intent: str | None = None  # "on" | "off" | None
        if soc <= self.status.soc_low and self.status.plug_on is not True:
            intent = "on"
        elif soc >= self.status.soc_high and self.status.plug_on is not False:
            intent = "off"

        # Safety: max charging duration
        if (
            self.status.plug_on is True
            and self.status.on_since_ts
            and time.time() - self.status.on_since_ts > MAX_ON_DURATION_S
        ):
            intent = "off"
            logger.warning("Tapo: max charging duration reached, forcing OFF")

        if intent is None:
            return

        # Anti-flap cooldown
        if (
            self.status.last_action_ts
            and time.time() - self.status.last_action_ts < COOLDOWN_S
        ):
            self.status.last_action = f"skip-cooldown ({intent})"
            return

        if self.status.dry_run:
            self.status.last_action = f"dry-run {intent} (soc={soc}%)"
            self.status.last_action_ts = time.time()
            logger.info("Tapo DRY-RUN: would turn %s (soc=%d%%)", intent.upper(), soc)
            return

        connected = await self._ensure_client()
        if not connected:
            return
        client, device = connected
        try:
            await client.set_on(device, intent == "on")
            self.status.plug_on = (intent == "on")
            self.status.last_action = intent
            self.status.last_action_ts = time.time()
            if intent == "on":
                self.status.on_since_ts = time.time()
            else:
                self.status.on_since_ts = None
            logger.info("Tapo: turned %s (soc=%d%%)", intent.upper(), soc)
        except Exception as e:
            self._record_error(f"set_on({intent}): {e}")
            # Force re-auth on next tick
            self._client = None
            self._device = None

    def _record_error(self, msg: str) -> None:
        self.status.last_error = msg[:200]
        self.status.last_error_ts = time.time()


# Module-level singleton
_controller: TapoController | None = None


def get_controller() -> TapoController | None:
    return _controller


def init_controller(get_soc: Callable[[], int | None]) -> TapoController:
    global _controller
    _controller = TapoController(get_soc)
    return _controller
