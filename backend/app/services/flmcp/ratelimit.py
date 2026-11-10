"""Sliding-window rate limiter for the licence API.

In memory, per process: the Space runs a single instance, so this is enough to stop spam and
brute force. If the service is ever scaled out, move the counters to Postgres or Redis.
"""

from __future__ import annotations

import threading
import time
from collections import defaultdict, deque

from .errors import ApiError

_lock = threading.Lock()
_hits: dict[str, deque[float]] = defaultdict(deque)
_MAX_KEYS = 50_000

# bucket -> (max requests, window seconds)
LIMITS: dict[str, tuple[int, int]] = {
    "activate_ip": (10, 60),
    "activate_key": (10, 300),
    "account_token": (60, 60),
    "reserve_token": (60, 60),
    "me_user": (60, 60),
    "trial_ip": (3, 3600),
    "trial_user": (3, 3600),
    "rotate_user": (5, 3600),
    "webhook_ip": (120, 60),
}


def hit(bucket: str, key: str, now: float | None = None) -> None:
    """Count one request; raise 429 with Retry-After when the bucket is full."""
    limit, window = LIMITS[bucket]
    t = time.monotonic() if now is None else now
    name = f"{bucket}:{key}"
    with _lock:
        if len(_hits) > _MAX_KEYS:
            for stale in [k for k, q in _hits.items() if not q or q[-1] < t - 3600]:
                del _hits[stale]
        q = _hits[name]
        while q and q[0] <= t - window:
            q.popleft()
        if len(q) >= limit:
            retry = max(1, int(window - (t - q[0])))
            raise ApiError(429, "rate_limited", "too many requests; slow down", retry_after=retry)
        q.append(t)


def reset() -> None:
    with _lock:
        _hits.clear()

