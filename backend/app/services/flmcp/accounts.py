"""Accounts, licences and device activations."""

from __future__ import annotations

import hashlib
import json
import secrets
import uuid
from typing import Any

from . import keys, ledger
from .errors import ApiError
from .plans import Config, require_usable


def _hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _spec(cfg: Config, plan: str):
    if plan not in cfg.plans:
        raise ApiError(409, "unknown_plan", f"plan '{plan}' is no longer offered; contact support")
    return cfg.plans[plan]


def account_for(conn: Any, email: str, now: int) -> str:
    email = email.strip().lower()
    if "@" not in email:
        raise ApiError(400, "bad_request", "a valid email is required")
    row = conn.execute("SELECT id FROM accounts WHERE email=?", (email,)).fetchone()
    if row:
        return row["id"]
    aid = uuid.uuid4().hex
    conn.execute(
        "INSERT INTO accounts(id, email, created_at) VALUES (?,?,?)",
        (aid, email, now),
    )
    return aid


def create_license(
    conn: Any,
    account_id: str,
    plan: str,
    now: int,
    cfg: Config,
    period_end: int | None = None,
    provider: str = "",
    ref: str = "",
    renews: bool = False,
    seats_allowed: int | None = None,
) -> tuple[str, str]:
    """Returns (licence id, the licence key). The key is stored hashed and cannot be retrieved again."""
    if plan not in cfg.plans:
        raise ApiError(400, "unknown_plan", f"unknown plan '{plan}'")
    spec = cfg.plans[plan]
    if period_end is None and spec.days:
        period_end = now + spec.days * 86400
    key = keys.new_key()
    lid = uuid.uuid4().hex
    status = "active" if renews or period_end is None else "canceled"
    seats = seats_allowed if seats_allowed is not None else spec.devices
    conn.execute(
        "INSERT INTO licenses(id, account_id, key_hash, plan, status, period_end, seats_allowed,"
        " provider, provider_ref, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
        (lid, account_id, keys.hash_key(key), plan, status, period_end, seats, provider, ref, now),
    )
    return lid, key


def start_period(
    conn: Any,
    lic: Any,
    period_start: int,
    period_end: int | None,
    now: int,
    cfg: Config,
) -> bool:
    """Give a licence its allowance for one billing period."""
    spec = _spec(cfg, lic["plan"])
    source = f"plan:{lic['id']}:{period_start}"
    return ledger.grant(conn, lic["account_id"], "plan", spec.credits, now, period_end, source)


def outbox_add(conn: Any, account_id: str, kind: str, payload: dict, now: int):
    conn.execute(
        "INSERT INTO outbox(account_id, kind, payload, created_at) VALUES (?,?,?,?)",
        (account_id, kind, json.dumps(payload), now),
    )


def activate(
    conn: Any,
    key: str,
    device_id: str,
    name: str,
    replace: str | None,
    now: int,
    cfg: Config,
) -> dict:
    digest = keys.hash_key(key)
    if digest is None:
        raise ApiError(400, "bad_key", "that is not a valid licence key; check it for typos")
    lic = conn.execute("SELECT * FROM licenses WHERE key_hash=?", (digest,)).fetchone()
    if lic is None:
        raise ApiError(404, "unknown_key", "licence key not found")
    require_usable(lic["status"], lic["period_end"], now)
    limit = lic.get("seats_allowed") if isinstance(lic, dict) and lic.get("seats_allowed") else _spec(cfg, lic["plan"]).devices

    mine = conn.execute(
        "SELECT * FROM devices WHERE license_id=? AND device_id=?", (lic["id"], device_id)
    ).fetchone()
    others = [
        d
        for d in conn.execute(
            "SELECT * FROM devices WHERE license_id=? AND revoked=0 ORDER BY last_seen",
            (lic["id"],),
        ).fetchall()
        if d["device_id"] != device_id
    ]
    if (mine is None or mine["revoked"]) and len(others) >= limit:
        victims = [
            d
            for d in others
            if replace
            and (d["name"] == replace or (len(replace) >= 4 and d["device_id"].startswith(replace)))
        ]
        if len(victims) > 1:
            raise ApiError(409, "ambiguous_replace", "more than one device matches; use its id")
        if victims:
            conn.execute("UPDATE devices SET revoked=1 WHERE pk=?", (victims[0]["pk"],))
            others.remove(victims[0])
        if len(others) >= limit:
            raise ApiError(
                409,
                "device_limit",
                f"this licence allows {limit} device(s); sign one out or pass replace",
                devices=[
                    {"id": d["device_id"][:8], "name": d["name"], "last_seen": d["last_seen"]}
                    for d in others
                ],
            )
    token = secrets.token_urlsafe(32)
    if mine is None:
        conn.execute(
            "INSERT INTO devices(license_id, device_id, name, token_hash, created_at, last_seen)"
            " VALUES (?,?,?,?,?,?)",
            (lic["id"], device_id, name, _hash(token), now, now),
        )
    else:
        conn.execute(
            "UPDATE devices SET name=?, token_hash=?, last_seen=?, revoked=0 WHERE pk=?",
            (name, _hash(token), now, mine["pk"]),
        )
    desc = describe(conn, lic, now, cfg)
    return {
        "token": token,
        "device_token": token,
        **desc,
    }


def describe(conn: Any, lic: Any, now: int, cfg: Config) -> dict:
    ledger.sweep(conn, lic["account_id"], now, cfg)
    return {
        "plan": lic["plan"],
        "status": lic["status"],
        "period_end": lic["period_end"],
        "balance": ledger.balance(conn, lic["account_id"], now),
        "costs": cfg.costs,
    }


def authenticate(conn: Any, token: str, now: int) -> Any:
    """The licence a device token belongs to."""
    row = conn.execute(
        "SELECT l.*, d.pk AS device_pk, d.device_id FROM devices d"
        " JOIN licenses l ON l.id = d.license_id WHERE d.token_hash=? AND d.revoked=0",
        (_hash(token),),
    ).fetchone()
    if row is None:
        raise ApiError(401, "invalid_token", "this device is not activated; sign in again")
    require_usable(row["status"], row["period_end"], now)
    conn.execute("UPDATE devices SET last_seen=? WHERE pk=?", (now, row["device_pk"]))
    return row


def revoke_self(conn: Any, lic: Any) -> None:
    conn.execute("UPDATE devices SET revoked=1 WHERE pk=?", (lic["device_pk"],))


def revoke_device(conn: Any, license_id: str, device_id_prefix: str) -> bool:
    """Revoke a device by device_id or prefix from the dashboard."""
    rows = conn.execute(
        "SELECT pk, device_id FROM devices WHERE license_id=? AND revoked=0",
        (license_id,),
    ).fetchall()
    matches = [r for r in rows if r["device_id"] == device_id_prefix or r["device_id"].startswith(device_id_prefix)]
    if not matches:
        return False
    for m in matches:
        conn.execute("UPDATE devices SET revoked=1 WHERE pk=?", (m["pk"],))
    return True


def devices(conn: Any, license_id: str) -> list[dict]:
    rows = conn.execute(
        "SELECT device_id, name, created_at, last_seen FROM devices WHERE license_id=? AND revoked=0"
        " ORDER BY last_seen DESC",
        (license_id,),
    ).fetchall()
    return [
        {
            "id": r["device_id"][:8],
            "full_id": r["device_id"],
            "name": r["name"],
            "created_at": r["created_at"],
            "last_seen": r["last_seen"],
        }
        for r in rows
    ]



# Throwaway-mailbox domains that must not receive a free trial.
DISPOSABLE_DOMAINS = frozenset(
    "mailinator.com guerrillamail.com 10minutemail.com tempmail.com temp-mail.org yopmail.com "
    "trashmail.com sharklasers.com getnada.com dispostable.com maildrop.cc throwawaymail.com "
    "fakeinbox.com mintemail.com mohmal.com emailondeck.com".split()
)


def account_for_user(conn: Any, auth_user_id: str, email: str, now: int) -> str:
    """The account of a signed-in Google user. Linked by the verified email, so a licence a
    payment provider created for that address is found; the Supabase id is then pinned to it."""
    email = email.strip().lower()
    row = conn.execute("SELECT id FROM accounts WHERE auth_user_id=?", (auth_user_id,)).fetchone()
    if row:
        return row["id"]
    row = conn.execute("SELECT id, auth_user_id FROM accounts WHERE email=?", (email,)).fetchone()
    if row:
        if row["auth_user_id"] and row["auth_user_id"] != auth_user_id:
            raise ApiError(409, "account_conflict", "this email belongs to another sign-in")
        conn.execute("UPDATE accounts SET auth_user_id=? WHERE id=?", (auth_user_id, row["id"]))
        return row["id"]
    aid = uuid.uuid4().hex
    conn.execute(
        "INSERT INTO accounts(id, email, auth_user_id, created_at) VALUES (?,?,?,?)",
        (aid, email, auth_user_id, now),
    )
    return aid


def latest_license(conn: Any, account_id: str) -> Any:
    return conn.execute(
        "SELECT * FROM licenses WHERE account_id=? AND status IN ('active','past_due','canceled')"
        " ORDER BY (plan='trial'), created_at DESC LIMIT 1",
        (account_id,),
    ).fetchone()


def trial_used(conn: Any, account_id: str) -> bool:
    row = conn.execute(
        "SELECT 1 AS x FROM licenses WHERE account_id=? AND plan='trial'", (account_id,)
    ).fetchone()
    return row is not None


def rotate_key(conn: Any, license_id: str) -> str:
    """Replace the licence key (leaked or lost). The new key is returned once; only its hash is
    stored. Devices already activated keep working; new activations need the new key."""
    key = keys.new_key()
    conn.execute("UPDATE licenses SET key_hash=? WHERE id=?", (keys.hash_key(key), license_id))
    return key
