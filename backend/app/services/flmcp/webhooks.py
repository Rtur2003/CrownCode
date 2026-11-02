"""Webhook adapter for Stripe, Lemon Squeezy, and Paddle."""

from __future__ import annotations

import hashlib
import hmac
from collections.abc import Callable
from typing import Any

from . import accounts, ledger
from .errors import ApiError
from .plans import Config

TOLERANCE = 300


def sign(secret: str, body: bytes, t: int) -> str:
    mac = hmac.new(secret.encode(), f"{t}.".encode() + body, hashlib.sha256).hexdigest()
    return f"t={t},v1={mac}"


def verify(secret: str, header: str | None, body: bytes, now: int) -> bool:
    if not secret or not header:
        return False

    # Check for direct hex signature or t=...,v1=...
    if "," in header and "v1=" in header:
        try:
            parts = dict(p.split("=", 1) for p in header.split(","))
            t = int(parts["t"])
            got = parts["v1"]
        except (KeyError, ValueError):
            return False
        good = sign(secret, body, t).split("v1=")[1]
        return abs(now - t) <= TOLERANCE and hmac.compare_digest(good.encode(), got.encode())

    # Direct raw hex HMAC
    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    got = header.replace("sha256=", "").strip()
    return hmac.compare_digest(expected.encode(), got.encode())


def _text(ev: dict, field: str) -> str:
    value = ev.get(field)
    if not isinstance(value, str) or not value.strip():
        raise ApiError(400, "bad_request", f"'{field}' is required")
    return value.strip()


def _int(ev: dict, field: str, optional: bool = False) -> int | None:
    value = ev.get(field)
    if value is None and optional:
        return None
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise ApiError(400, "bad_request", f"'{field}' must be a unix time in seconds")
    return value


def _licence(conn: Any, provider: str, ev: dict) -> Any:
    row = conn.execute(
        "SELECT * FROM licenses WHERE provider=? AND provider_ref=?", (provider, _text(ev, "ref"))
    ).fetchone()
    if row is None:
        raise ApiError(409, "unknown_subscription", "no such subscription yet; retry later")
    return row


def _started(conn: Any, provider: str, ev: dict, now: int, cfg: Config) -> dict:
    start = _int(ev, "period_start", optional=True) or now
    end = _int(ev, "period_end", optional=True)
    plan = _text(ev, "plan")
    ref = _text(ev, "ref")
    email = _text(ev, "email")

    row = conn.execute(
        "SELECT * FROM licenses WHERE provider=? AND provider_ref=?", (provider, ref)
    ).fetchone()
    if row is None:
        aid = accounts.account_for(conn, email, now)
        lid, key = accounts.create_license(
            conn, aid, plan, now, cfg, end, provider, ref, renews=True
        )
        info = {"email": email, "plan": plan, "key": key}
        accounts.outbox_add(conn, aid, "license_key", info, now)
        row = conn.execute("SELECT * FROM licenses WHERE id=?", (lid,)).fetchone()

    accounts.start_period(conn, row, start, end, now, cfg)
    return {"license": row["id"]}


def _renewed(conn: Any, provider: str, ev: dict, now: int, cfg: Config) -> dict:
    row = _licence(conn, provider, ev)
    start = _int(ev, "period_start", optional=True) or now
    end = _int(ev, "period_end", optional=True)
    conn.execute("UPDATE licenses SET status='active', period_end=? WHERE id=?", (end, row["id"]))
    accounts.start_period(conn, row, start, end, now, cfg)
    return {"license": row["id"]}


def _plan_changed(conn: Any, provider: str, ev: dict, now: int, cfg: Config) -> dict:
    row = _licence(conn, provider, ev)
    plan = _text(ev, "plan")
    if plan not in cfg.plans:
        raise ApiError(400, "unknown_plan", f"unknown plan '{plan}'")
    conn.execute("UPDATE licenses SET plan=? WHERE id=?", (plan, row["id"]))
    return {"license": row["id"]}


def _status(status: str):
    def run(conn: Any, provider: str, ev: dict, now: int, cfg: Config) -> dict:
        row = _licence(conn, provider, ev)
        conn.execute("UPDATE licenses SET status=? WHERE id=?", (status, row["id"]))
        return {"license": row["id"]}

    return run


def _topup(conn: Any, provider: str, ev: dict, now: int, cfg: Config) -> dict:
    pack = _text(ev, "pack")
    if pack not in cfg.packs:
        raise ApiError(400, "unknown_pack", f"unknown pack '{pack}'")
    aid = accounts.account_for(conn, _text(ev, "email"), now)
    expires = now + cfg.topup_days * 86400 if cfg.topup_days else None
    ledger.grant(
        conn, aid, "topup", cfg.packs[pack], now, expires, f"topup:{provider}:{_text(ev, 'id')}"
    )
    return {"account": aid}


HANDLERS: dict[str, Callable] = {
    "subscription.started": _started,
    "checkout.completed": _started,
    "subscription.renewed": _renewed,
    "subscription.plan_changed": _plan_changed,
    "subscription.canceled": _status("canceled"),
    "subscription.cancelled": _status("canceled"),
    "subscription.past_due": _status("past_due"),
    "subscription.expired": _status("revoked"),
    "topup.paid": _topup,
}


def apply(conn: Any, provider: str, ev: dict, now: int, cfg: Config) -> dict:
    """Apply one event exactly once; repeated event IDs are safely ignored."""
    event_id = _text(ev, "id")
    event_type = _text(ev, "type")
    handler = HANDLERS.get(event_type)
    if handler is None:
        raise ApiError(400, "unknown_event", f"unknown event type '{event_type}'")
    fresh = conn.execute(
        "INSERT OR IGNORE INTO webhook_events(provider, event_id, received_at) VALUES (?,?,?)",
        (provider, event_id, now),
    )
    if not fresh.rowcount:
        return {"duplicate": True}
    return handler(conn, provider, ev, now, cfg)
