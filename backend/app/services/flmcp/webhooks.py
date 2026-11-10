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



# ── Lemon Squeezy adapter ─────────────────────────────────────────────
# Lemon Squeezy signs the raw body with HMAC-SHA256 (hex, header X-Signature) and sends
# {"meta": {"event_name": ...}, "data": {"id": ..., "attributes": {...}}}. Variant ids are mapped
# to plans or credit packs with FLMCP_LS_VARIANTS="<variant_id>=pro,<variant_id>=pack_100".


def _ts(value: Any) -> int | None:
    from datetime import datetime

    if not isinstance(value, str) or not value:
        return None
    try:
        return int(datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp())
    except ValueError:
        return None


def normalize_lemonsqueezy(payload: dict, variants: dict[str, str], cfg: Config) -> dict | None:
    """Translate one Lemon Squeezy event into this module's event format; None means 'not for us'."""
    meta = payload.get("meta") or {}
    data = payload.get("data") or {}
    attrs = data.get("attributes") or {}
    name = str(meta.get("event_name") or "")
    did = str(data.get("id") or "")
    stamp = str(attrs.get("updated_at") or attrs.get("created_at") or "")
    if not name or not did:
        return None
    event_id = f"{name}:{did}:{stamp}"
    created = _ts(attrs.get("created_at"))

    if name == "order_created":
        item = attrs.get("first_order_item") or {}
        target = variants.get(str(item.get("variant_id") or ""))
        if target not in cfg.packs or attrs.get("status") != "paid":
            return None  # subscription orders are handled through subscription_* events
        return {"id": event_id, "type": "topup.paid", "email": attrs.get("user_email"), "pack": target}

    plan = variants.get(str(attrs.get("variant_id") or ""))
    if name == "subscription_created":
        if plan not in cfg.plans:
            raise ApiError(400, "unknown_variant", "variant is not mapped to a plan")
        start = created or 0
        end = _ts(attrs.get("renews_at")) or start + 31 * 86400
        return {
            "id": event_id, "type": "subscription.started", "email": attrs.get("user_email"),
            "plan": plan, "ref": did, "period_start": start, "period_end": end,
        }  # fmt: skip
    if name == "subscription_payment_success":
        if attrs.get("billing_reason") != "renewal":
            return None
        start = created or 0
        return {
            "id": event_id, "type": "subscription.renewed", "ref": str(attrs.get("subscription_id")),
            "period_start": start, "period_end": start + 31 * 86400,
        }  # fmt: skip
    if name == "subscription_updated":
        status = attrs.get("status")
        if status == "past_due":
            return {"id": event_id, "type": "subscription.past_due", "ref": did}
        if status in ("active", "on_trial") and plan in cfg.plans:
            return {"id": event_id, "type": "subscription.plan_changed", "ref": did, "plan": plan}
        return None
    if name == "subscription_cancelled":
        return {"id": event_id, "type": "subscription.canceled", "ref": did}
    if name == "subscription_expired":
        return {"id": event_id, "type": "subscription.expired", "ref": did}
    return None
