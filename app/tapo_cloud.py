"""Minimal TP-Link Tapo cloud HTTP client.

Reverse-engineered protocol; intentionally small. Only does what the
controller needs: log in, find one device by alias, turn it on or off.

The cloud path is fragile (TP-Link can change anything in a firmware
update). Errors are bubbled up so the caller can decide how to react.
"""
from __future__ import annotations

import asyncio
import base64
import json
import logging
import secrets
import uuid
from dataclasses import dataclass
from typing import Any

import httpx
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, padding, serialization
from cryptography.hazmat.primitives.asymmetric import padding as asym_padding, rsa
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

logger = logging.getLogger(__name__)

CLOUD_BASE = "https://wap.tplinkcloud.com"
APP_TYPE = "Tapo_Android"
HTTP_TIMEOUT = 15.0


@dataclass
class TapoDevice:
    device_id: str
    alias: str
    app_server_url: str
    device_type: str


@dataclass
class _Session:
    key: bytes  # 16 bytes AES key
    iv: bytes   # 16 bytes IV
    cookie: str | None  # TP_SESSIONID returned by handshake


class TapoCloudError(Exception):
    pass


class TapoCloudClient:
    def __init__(self, email: str, password: str):
        self._email = email
        self._password = password
        self._terminal_uuid = str(uuid.uuid4())
        self._token: str | None = None
        self._session_cache: dict[str, _Session] = {}  # by device_id
        self._http = httpx.AsyncClient(timeout=HTTP_TIMEOUT)

    async def aclose(self) -> None:
        await self._http.aclose()

    # ------------------------------------------------------------------
    # Cloud login + device discovery
    # ------------------------------------------------------------------

    async def login(self) -> None:
        body = {
            "method": "login",
            "params": {
                "appType": APP_TYPE,
                "cloudUserName": self._email,
                "cloudPassword": self._password,
                "terminalUUID": self._terminal_uuid,
            },
        }
        r = await self._http.post(CLOUD_BASE, json=body)
        r.raise_for_status()
        data = r.json()
        if data.get("error_code") != 0:
            raise TapoCloudError(f"Login failed: {data}")
        self._token = data["result"]["token"]

    async def find_device(self, alias: str) -> TapoDevice:
        if not self._token:
            await self.login()
        body = {"method": "getDeviceList"}
        r = await self._http.post(f"{CLOUD_BASE}?token={self._token}", json=body)
        r.raise_for_status()
        data = r.json()
        if data.get("error_code") != 0:
            raise TapoCloudError(f"getDeviceList failed: {data}")
        for dev in data["result"]["deviceList"]:
            try:
                decoded = base64.b64decode(dev.get("alias", "")).decode("utf-8")
            except Exception:
                decoded = dev.get("alias", "")
            if decoded == alias:
                return TapoDevice(
                    device_id=dev["deviceId"],
                    alias=decoded,
                    app_server_url=dev["appServerUrl"],
                    device_type=dev.get("deviceType", ""),
                )
        names = [base64.b64decode(d.get("alias", "")).decode("utf-8", "ignore") for d in data["result"]["deviceList"]]
        raise TapoCloudError(f"Device alias '{alias}' not found. Available: {names}")

    # ------------------------------------------------------------------
    # securePassthrough handshake + encrypted commands
    # ------------------------------------------------------------------

    async def _handshake(self, device: TapoDevice) -> _Session:
        # Fresh RSA-1024 keypair per session.
        priv = rsa.generate_private_key(public_exponent=65537, key_size=1024, backend=default_backend())
        pub_pem = priv.public_key().public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        ).decode("ascii")

        inner = {"method": "handshake", "params": {"key": pub_pem}}
        result = await self._cloud_passthrough(device, json.dumps(inner))
        encrypted_key_b64 = result.get("key")
        if not encrypted_key_b64:
            raise TapoCloudError(f"Handshake response missing key: {result}")

        encrypted_key = base64.b64decode(encrypted_key_b64)
        decrypted = priv.decrypt(encrypted_key, asym_padding.PKCS1v15())
        if len(decrypted) < 32:
            raise TapoCloudError(f"Bad handshake key length: {len(decrypted)}")
        sess = _Session(key=decrypted[:16], iv=decrypted[16:32], cookie=None)
        self._session_cache[device.device_id] = sess
        return sess

    async def _cloud_passthrough(self, device: TapoDevice, request_data: str) -> dict[str, Any]:
        """Wrap raw inner JSON in cloud passthrough envelope."""
        if not self._token:
            await self.login()
        body = {
            "method": "passthrough",
            "params": {
                "deviceId": device.device_id,
                "requestData": request_data,
            },
        }
        r = await self._http.post(f"{device.app_server_url}?token={self._token}", json=body)
        r.raise_for_status()
        outer = r.json()
        if outer.get("error_code") != 0:
            raise TapoCloudError(f"Cloud passthrough error: {outer}")
        # responseData is the raw inner response as JSON string
        inner_str = outer.get("result", {}).get("responseData")
        if inner_str is None:
            raise TapoCloudError(f"Missing responseData: {outer}")
        inner = json.loads(inner_str)
        if inner.get("error_code") != 0:
            raise TapoCloudError(f"Inner response error: {inner}")
        return inner.get("result", {})

    def _encrypt(self, sess: _Session, plaintext: str) -> str:
        cipher = Cipher(algorithms.AES(sess.key), modes.CBC(sess.iv), backend=default_backend())
        encryptor = cipher.encryptor()
        padder = padding.PKCS7(128).padder()
        padded = padder.update(plaintext.encode("utf-8")) + padder.finalize()
        ct = encryptor.update(padded) + encryptor.finalize()
        return base64.b64encode(ct).decode("ascii")

    def _decrypt(self, sess: _Session, b64: str) -> str:
        ct = base64.b64decode(b64)
        cipher = Cipher(algorithms.AES(sess.key), modes.CBC(sess.iv), backend=default_backend())
        decryptor = cipher.decryptor()
        padded = decryptor.update(ct) + decryptor.finalize()
        unpadder = padding.PKCS7(128).unpadder()
        pt = unpadder.update(padded) + unpadder.finalize()
        return pt.decode("utf-8")

    async def _secure_request(self, device: TapoDevice, payload: dict) -> dict:
        sess = self._session_cache.get(device.device_id) or await self._handshake(device)
        encrypted = self._encrypt(sess, json.dumps(payload))
        wrapper = {"method": "securePassthrough", "params": {"request": encrypted}}
        try:
            result = await self._cloud_passthrough(device, json.dumps(wrapper))
        except TapoCloudError:
            # Session may have expired - retry once with fresh handshake.
            self._session_cache.pop(device.device_id, None)
            sess = await self._handshake(device)
            encrypted = self._encrypt(sess, json.dumps(payload))
            wrapper = {"method": "securePassthrough", "params": {"request": encrypted}}
            result = await self._cloud_passthrough(device, json.dumps(wrapper))
        encrypted_response = result.get("response")
        if not encrypted_response:
            raise TapoCloudError(f"securePassthrough response missing: {result}")
        return json.loads(self._decrypt(sess, encrypted_response))

    # ------------------------------------------------------------------
    # Public commands
    # ------------------------------------------------------------------

    async def set_on(self, device: TapoDevice, on: bool) -> None:
        payload = {
            "method": "set_device_info",
            "params": {"device_on": bool(on)},
            "requestTimeMils": 0,
            "terminalUUID": self._terminal_uuid,
        }
        resp = await self._secure_request(device, payload)
        if resp.get("error_code", 0) != 0:
            raise TapoCloudError(f"set_device_info failed: {resp}")

    async def get_state(self, device: TapoDevice) -> bool:
        payload = {"method": "get_device_info", "requestTimeMils": 0}
        resp = await self._secure_request(device, payload)
        if resp.get("error_code", 0) != 0:
            raise TapoCloudError(f"get_device_info failed: {resp}")
        return bool(resp.get("result", {}).get("device_on", False))
