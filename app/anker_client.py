import sys
import os
import asyncio
import logging
from pathlib import Path

# Add anker-solix-api to path
_LIB = Path(__file__).resolve().parent.parent / "anker-solix-api"
if str(_LIB) not in sys.path:
    sys.path.insert(0, str(_LIB))

from aiohttp import ClientSession  # noqa: E402
from api.api import AnkerSolixApi  # noqa: E402
from api.mqtt_factory import SolixMqttDeviceFactory  # noqa: E402

try:
    from aiohttp_socks import ProxyConnector  # noqa: E402
    HAS_SOCKS = True
except ImportError:
    HAS_SOCKS = False

from app.config import ANKER_USER, ANKER_PASSWORD, ANKER_COUNTRY  # noqa: E402

logger = logging.getLogger(__name__)
TOR_PROXY = "socks5://127.0.0.1:9050"

# Persistent auth cache on volume mount (survives restarts)
AUTH_CACHE_DIR = Path(__file__).resolve().parent.parent / "data" / "authcache"
AUTH_CACHE_DIR.mkdir(parents=True, exist_ok=True)

# A1763 = C1000 Gen 2, A1761 = C1000
PPS_MODELS = {"A1763", "A1761"}


class AnkerClient:
    def __init__(self):
        self.api: AnkerSolixApi | None = None
        self.session: ClientSession | None = None
        self.device_sn: str = ""
        self.device_name: str = ""
        self.mqtt_device = None
        self._callback = None
        self._mqtt_task: asyncio.Task | None = None

    def _create_session(self) -> ClientSession:
        """Create aiohttp session, routing through TOR if available."""
        if HAS_SOCKS:
            connector = ProxyConnector.from_url(TOR_PROXY)
            logger.info("Using TOR SOCKS5 proxy for Anker API")
            return ClientSession(connector=connector)
        logger.warning("aiohttp_socks not available, using direct connection")
        return ClientSession()

    async def connect(self):
        self.session = self._create_session()
        self.api = AnkerSolixApi(
            ANKER_USER, ANKER_PASSWORD, ANKER_COUNTRY,
            self.session, logger
        )
        # Redirect auth cache to persistent volume
        self.api.apisession._authFile = str(AUTH_CACHE_DIR / f"{ANKER_USER}.json")
        await self.api.async_authenticate()
        await self.api.update_sites()
        await self.api.get_bind_devices()
        self._find_device()

    def _find_device(self):
        for sn, dev in self.api.devices.items():
            pn = dev.get("device_pn", "")
            if pn in PPS_MODELS:
                self.device_sn = sn
                self.device_name = dev.get("name", f"PPS {pn}")
                logger.info("Found device: %s (%s) SN=%s", self.device_name, pn, sn)
                return
        raise RuntimeError(
            f"Kein C1000 Geraet gefunden. Vorhandene Geraete: "
            f"{[d.get('device_pn') for d in self.api.devices.values()]}"
        )

    async def start_mqtt(self, callback):
        self._callback = callback
        self.mqtt_device = SolixMqttDeviceFactory(
            api_instance=self.api, device_sn=self.device_sn
        ).create_device()

        if not await self.api.startMqttSession():
            raise RuntimeError("MQTT-Session konnte nicht gestartet werden")

        logger.info("MQTT session started for %s", self.device_sn)

        # Subscribe to device topic
        mqtt_session = self.api.mqttsession
        device_dict = self.api.devices.get(self.device_sn, {})
        topic_prefix = mqtt_session.get_topic_prefix(deviceDict=device_dict)
        if topic_prefix:
            topic = topic_prefix + "#"
            mqtt_session.subscribe(topic)
            logger.info("Subscribed to MQTT topic: %s", topic)
        else:
            logger.warning("Could not determine MQTT topic prefix for device")

        # Trigger real-time updates (renewed every 60s in poll loop)
        await self.mqtt_device.realtime_trigger(timeout=600)
        self._mqtt_task = asyncio.create_task(self._poll_loop())

    def _get_mqtt_data(self) -> dict:
        """Get data directly from MQTT session cache."""
        if self.api and self.api.mqttsession:
            return self.api.mqttsession.mqtt_data.get(self.device_sn, {})
        return {}

    async def _poll_loop(self):
        poll_count = 0
        last_trigger = asyncio.get_event_loop().time()
        last_data_hash = ""
        last_new_data_time = asyncio.get_event_loop().time()
        STALE_TIMEOUT = 300  # 5 minutes without new data → reconnect
        while True:
            try:
                await asyncio.sleep(3)
                data = self._get_mqtt_data()
                poll_count += 1
                if poll_count == 1:
                    logger.info("First MQTT data received: %d fields", len(data))

                # Track if data is actually changing
                data_hash = str(sorted(data.items())) if data else ""
                now = asyncio.get_event_loop().time()
                if data_hash != last_data_hash:
                    last_data_hash = data_hash
                    last_new_data_time = now

                if data and self._callback:
                    await self._callback(data)

                # Check for stale data → full reconnect
                if now - last_new_data_time > STALE_TIMEOUT:
                    logger.warning("No new MQTT data for %ds, attempting full reconnect...", STALE_TIMEOUT)
                    await self._reconnect()
                    last_new_data_time = asyncio.get_event_loop().time()
                    last_trigger = last_new_data_time
                    last_data_hash = ""
                    continue

                # Re-trigger real-time updates every 250s (timeout is 600s)
                if now - last_trigger >= 250:
                    try:
                        await self.mqtt_device.realtime_trigger(timeout=600)
                        last_trigger = now
                        logger.info("Realtime trigger renewed")
                    except Exception as e:
                        logger.warning("Realtime trigger renewal failed: %s", e)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error("MQTT poll error: %s", e)
                await asyncio.sleep(10)
                try:
                    await self._reconnect()
                    last_new_data_time = asyncio.get_event_loop().time()
                    last_trigger = last_new_data_time
                except Exception as re:
                    logger.error("Reconnect failed: %s", re)

    async def _reconnect(self):
        """Full reconnect: close old session, re-authenticate, start new MQTT."""
        logger.info("Performing full MQTT reconnect...")
        try:
            if self.api and self.api.mqttsession:
                self.api.stopMqttSession()
            if self.session:
                await self.session.close()
        except Exception:
            pass

        self.session = self._create_session()
        self.api = AnkerSolixApi(
            ANKER_USER, ANKER_PASSWORD, ANKER_COUNTRY,
            self.session, logger
        )
        self.api.apisession._authFile = str(AUTH_CACHE_DIR / f"{ANKER_USER}.json")
        await self.api.async_authenticate()
        await self.api.update_sites()
        await self.api.get_bind_devices()
        self._find_device()

        self.mqtt_device = SolixMqttDeviceFactory(
            api_instance=self.api, device_sn=self.device_sn
        ).create_device()

        if not await self.api.startMqttSession():
            raise RuntimeError("MQTT reconnect: session start failed")

        mqtt_session = self.api.mqttsession
        device_dict = self.api.devices.get(self.device_sn, {})
        topic_prefix = mqtt_session.get_topic_prefix(deviceDict=device_dict)
        if topic_prefix:
            mqtt_session.subscribe(topic_prefix + "#")

        await self.mqtt_device.realtime_trigger(timeout=600)
        logger.info("MQTT reconnect successful for %s", self.device_sn)

    def get_status(self) -> dict:
        return self._get_mqtt_data()

    def _get_site_id(self) -> str:
        """Get the site ID for the device."""
        for sid, site in (self.api.sites if self.api else {}).items():
            return sid
        return ""

    async def fetch_energy_history(self, days: int = 30) -> list[dict]:
        """Fetch historical daily energy data from Anker cloud API."""
        if not self.api:
            return []
        site_id = self._get_site_id()
        if not site_id:
            logger.warning("No site ID found for energy history")
            return []

        from datetime import datetime, timedelta
        start = datetime.today() - timedelta(days=days)
        try:
            resp = await self.api.energy_analysis(
                siteId=site_id,
                deviceSn=self.device_sn,
                rangeType="week",
                startDay=start,
                endDay=datetime.today(),
                devType="pps",
            )
            items = resp.get("power") or []
            result = []
            for item in items:
                day = item.get("time", "")
                val = float(item.get("value", 0) or 0)
                if day and val > 0:
                    result.append({"date": day, "solar_kwh": val})
            logger.info("Fetched %d days of energy history from cloud", len(result))
            return result
        except Exception as e:
            logger.error("Failed to fetch energy history: %s", e)
            return []

    async def close(self):
        if self._mqtt_task:
            self._mqtt_task.cancel()
            try:
                await self._mqtt_task
            except asyncio.CancelledError:
                pass
        if self.api and self.api.mqttsession:
            self.api.stopMqttSession()
        if self.session:
            await self.session.close()
