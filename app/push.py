"""Web Push notifications (VAPID + pywebpush).

Sends real push notifications to subscribed browsers/PWAs. Works with iOS
Safari PWA (16.4+) when the app is added to the home screen.

VAPID keypair is generated once with scripts/gen_vapid.py and stored in .env.
"""
import asyncio
import json
import logging

from app.config import VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY, VAPID_CLAIMS_SUB
from app.database import (
    get_push_subscriptions,
    remove_push_subscription,
    mark_push_sent,
)

logger = logging.getLogger(__name__)

try:
    from pywebpush import webpush, WebPushException
    _WEBPUSH_AVAILABLE = True
except Exception:
    _WEBPUSH_AVAILABLE = False


def is_configured() -> bool:
    return bool(VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY and _WEBPUSH_AVAILABLE)


def _send_one(sub: dict, payload: str) -> tuple[str, bool]:
    """Send push to one subscription. Returns (endpoint, success)."""
    try:
        webpush(
            subscription_info={
                "endpoint": sub["endpoint"],
                "keys": {"p256dh": sub["p256dh"], "auth": sub["auth"]},
            },
            data=payload,
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims={"sub": VAPID_CLAIMS_SUB},
        )
        return sub["endpoint"], True
    except WebPushException as e:
        # 404/410 means subscription is gone — remove it
        status = getattr(e.response, "status_code", 0) if e.response is not None else 0
        if status in (404, 410):
            return sub["endpoint"], False  # caller will remove
        logger.warning("Push send failed (%s): %s", status, e)
        return sub["endpoint"], None  # keep, retry later
    except Exception as e:
        logger.warning("Push send error: %s", e)
        return sub["endpoint"], None


async def send_notification(title: str, body: str, tag: str = "", url: str = "/") -> int:
    """Push a notification to every subscribed client. Returns count sent."""
    if not is_configured():
        return 0
    subs = await get_push_subscriptions()
    if not subs:
        return 0
    payload = json.dumps({"title": title, "body": body, "tag": tag, "url": url})
    loop = asyncio.get_running_loop()
    results = await asyncio.gather(
        *[loop.run_in_executor(None, _send_one, s, payload) for s in subs],
        return_exceptions=True,
    )
    sent = 0
    for r in results:
        if isinstance(r, Exception) or not isinstance(r, tuple):
            continue
        endpoint, ok = r
        if ok is True:
            sent += 1
            await mark_push_sent(endpoint)
        elif ok is False:
            await remove_push_subscription(endpoint)
    return sent
