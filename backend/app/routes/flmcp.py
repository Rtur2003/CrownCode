"""FL-MCP (FL Studio AI Copilot) Commerce & Licensing Router for CrownCode.

Provides end-to-end licensing, seat management, credit reservations, settlements,
and payment webhooks for FL-MCP desktop clients and CrownCode web dashboard.
"""

from __future__ import annotations

import hmac
import json
import os
import secrets
from typing import Any

from fastapi import APIRouter, Header, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool

from ..services.flmcp import accounts, keys, ledger, plans, webhooks
from ..services.flmcp.db import DB
from ..services.flmcp.errors import ApiError

router = APIRouter(tags=["FL-MCP Licensing & Credits"])

MAX_WEBHOOK = 64 * 1024


def get_db() -> DB:
    return DB()


def get_config() -> plans.Config:
    cfg_path = os.environ.get("FLMCP_CONFIG")
    return plans.load(cfg_path)


def get_topup_url() -> str:
    return os.environ.get("FLMCP_TOPUP_URL", "https://hasan-arthur-altuntas.xyz/fl-mcp#pricing")


def get_admin_token() -> str:
    return os.environ.get("FLMCP_ADMIN_TOKEN", "")


def get_webhook_secrets() -> dict[str, str]:
    raw = os.environ.get("FLMCP_WEBHOOK_SECRETS", "")
    pairs = (p.split("=", 1) for p in raw.split(",") if "=" in p)
    return {k.strip(): v.strip() for k, v in pairs}


class ActivateIn(BaseModel):
    key: str | None = Field(default=None, max_length=64)
    license_key: str | None = Field(default=None, max_length=64)
    device_id: str | None = Field(default=None, max_length=64)
    name: str | None = Field(default=None, max_length=80)
    device_name: str | None = Field(default=None, max_length=80)
    replace: str | None = Field(default=None, max_length=64)


class ReserveIn(BaseModel):
    ops: list[str] = Field(min_length=1, max_length=8)
    idem: str = Field(min_length=8, max_length=64)


class SettleIn(BaseModel):
    done: list[str] = Field(default_factory=list, max_length=8)


class TrialIn(BaseModel):
    email: str = Field(max_length=254)
    device_name: str | None = Field(default="Studio-PC", max_length=80)


class LookupIn(BaseModel):
    email: str | None = Field(default=None, max_length=254)
    key: str | None = Field(default=None, max_length=64)


class RevokeDeviceIn(BaseModel):
    key: str = Field(max_length=64)
    device_id: str = Field(max_length=64)


class AdminLicenseIn(BaseModel):
    email: str = Field(max_length=254)
    plan: str = Field(max_length=32)
    days: int | None = Field(default=None, ge=1, le=3660)


class AdminGrantIn(BaseModel):
    email: str = Field(max_length=254)
    credits: int = Field(gt=0, le=1_000_000)
    days: int | None = Field(default=None, ge=1, le=3660)


def _bearer(authorization: str | None) -> str:
    scheme, _, token = (authorization or "").partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        raise ApiError(401, "invalid_token", "send the device token as 'Authorization: Bearer <token>'")
    return token.strip()


def _problem_response(exc: ApiError) -> JSONResponse:
    headers = {"WWW-Authenticate": "Bearer"} if exc.status == 401 else {}
    body = {
        "type": "about:blank",
        "status": exc.status,
        "code": exc.code,
        "detail": exc.detail,
        **exc.extra,
    }
    if exc.code == "insufficient_credits" and "topup_url" not in body:
        body["topup_url"] = get_topup_url()
    return JSONResponse(status_code=exc.status, content=body, headers=headers, media_type="application/problem+json")


def _verify_admin(authorization: str | None) -> None:
    admin_token = get_admin_token()
    if not admin_token:
        raise ApiError(404, "not_found", "admin API is not enabled")
    if not hmac.compare_digest(_bearer(authorization).encode(), admin_token.encode()):
        raise ApiError(401, "invalid_token", "wrong admin token")


# ── Activation & Account ──────────────────────────────────────────────

@router.post("/api/v1/flmcp/activate")
@router.post("/v1/activate")
def activate_device(body: ActivateIn):
    """Activate an FL-MCP desktop client with a license key."""
    key = body.key or body.license_key
    if not key:
        return _problem_response(ApiError(400, "bad_request", "license key is required"))

    dev_name = (body.name or body.device_name or "Studio-PC").strip()
    dev_id = (body.device_id or secrets.token_hex(8)).strip()

    db = get_db()
    cfg = get_config()
    try:
        with db.tx() as conn:
            return accounts.activate(conn, key, dev_id, dev_name, body.replace, db.now(), cfg)
    except ApiError as exc:
        return _problem_response(exc)


@router.get("/api/v1/flmcp/account")
@router.get("/v1/account")
def get_account_status(authorization: str | None = Header(None)):
    """Retrieve live license balance, device seats, and costs."""
    db = get_db()
    cfg = get_config()
    try:
        with db.tx() as conn:
            now = db.now()
            lic = accounts.authenticate(conn, _bearer(authorization), now)
            desc = accounts.describe(conn, lic, now, cfg)
            dev_list = accounts.devices(conn, lic["id"])
            return {
                **desc,
                "devices": dev_list,
                "topup_url": get_topup_url(),
            }
    except ApiError as exc:
        return _problem_response(exc)


# ── Credit Ledger (Reserve & Settle) ──────────────────────────────────

@router.post("/api/v1/flmcp/credits/reserve")
@router.post("/v1/credits/reserve")
def reserve_credits(body: ReserveIn, authorization: str | None = Header(None)):
    """Reserve credits for requested FL Studio operations."""
    db = get_db()
    cfg = get_config()
    try:
        with db.tx() as conn:
            now = db.now()
            lic = accounts.authenticate(conn, _bearer(authorization), now)
            return ledger.reserve(conn, lic["account_id"], body.ops, body.idem, now, cfg)
    except ApiError as exc:
        return _problem_response(exc)


@router.post("/api/v1/flmcp/credits/{rid}/settle")
@router.post("/v1/credits/{rid}/settle")
def settle_reservation(rid: str, body: SettleIn, authorization: str | None = Header(None)):
    """Settle charges for operations delivered successfully; refund remaining held credits."""
    db = get_db()
    cfg = get_config()
    try:
        with db.tx() as conn:
            now = db.now()
            lic = accounts.authenticate(conn, _bearer(authorization), now)
            return ledger.settle(conn, lic["account_id"], rid, body.done, now, cfg)
    except ApiError as exc:
        return _problem_response(exc)


@router.post("/api/v1/flmcp/devices/self/revoke", status_code=status.HTTP_204_NO_CONTENT)
@router.post("/v1/devices/self/revoke", status_code=status.HTTP_204_NO_CONTENT)
def revoke_calling_device(authorization: str | None = Header(None)):
    """Revoke license activation on the calling client machine."""
    db = get_db()
    try:
        with db.tx() as conn:
            lic = accounts.authenticate(conn, _bearer(authorization), db.now())
            accounts.revoke_self(conn, lic)
            return None
    except ApiError as exc:
        return _problem_response(exc)


# ── Webhooks (Stripe / Lemon Squeezy / Paddle) ─────────────────────────

@router.post("/api/v1/flmcp/webhooks/{provider}")
@router.post("/v1/webhooks/{provider}")
async def handle_provider_webhook(provider: str, request: Request):
    """Handle incoming checkout and subscription webhook events from payment providers."""
    db = get_db()
    cfg = get_config()
    secrets_map = get_webhook_secrets()
    secret = secrets_map.get(provider)
    if not secret:
        return _problem_response(ApiError(404, "unknown_provider", f"no webhook secret configured for {provider}"))

    raw_body = await request.body()
    if len(raw_body) > MAX_WEBHOOK:
        return _problem_response(ApiError(413, "too_large", "payload exceeds max size"))

    sig_header = (
        request.headers.get("x-flmcp-signature")
        or request.headers.get("x-signature")
        or request.headers.get("stripe-signature")
        or request.headers.get("x-hub-signature-256")
    )

    now = db.now()
    if not webhooks.verify(secret, sig_header, raw_body, now):
        return _problem_response(ApiError(401, "bad_signature", "invalid or expired webhook signature"))

    try:
        event = json.loads(raw_body)
    except ValueError:
        return _problem_response(ApiError(400, "bad_request", "payload must be valid JSON"))

    if not isinstance(event, dict):
        return _problem_response(ApiError(400, "bad_request", "payload must be a JSON object"))

    def _execute():
        with db.tx() as conn:
            return webhooks.apply(conn, provider, event, db.now(), cfg)

    try:
        return await run_in_threadpool(_execute)
    except ApiError as exc:
        return _problem_response(exc)


# ── User Web Dashboard Endpoints ──────────────────────────────────────

@router.post("/api/v1/flmcp/user/generate-trial")
def generate_trial_license(body: TrialIn):
    """Issue a 30-day trial license with 15 credits for CrownCode users."""
    db = get_db()
    cfg = get_config()
    now = db.now()
    try:
        with db.tx() as conn:
            aid = accounts.account_for(conn, body.email, now)
            # Check if user already has an active license
            existing = conn.execute(
                "SELECT * FROM licenses WHERE account_id=? AND status='active'",
                (aid,),
            ).fetchone()
            if existing:
                return {
                    "account_id": aid,
                    "existing": True,
                    "plan": existing["plan"],
                    "balance": ledger.balance(conn, aid, now),
                    "devices": accounts.devices(conn, existing["id"]),
                    "message": "Account already has an active license. Use your existing key.",
                }

            lid, key = accounts.create_license(conn, aid, "trial", now, cfg)
            row = conn.execute("SELECT * FROM licenses WHERE id=?", (lid,)).fetchone()
            accounts.start_period(conn, row, now, row["period_end"], now, cfg)
            return {
                "account_id": aid,
                "license_id": lid,
                "key": key,
                "plan": "trial",
                "balance": ledger.balance(conn, aid, now),
                "period_end": row["period_end"],
                "devices": [],
            }
    except ApiError as exc:
        return _problem_response(exc)


@router.post("/api/v1/flmcp/user/lookup")
def lookup_user_license(body: LookupIn):
    """Lookup license key details and device seats for the user dashboard."""
    db = get_db()
    cfg = get_config()
    now = db.now()
    try:
        with db.tx() as conn:
            lic = None
            if body.key:
                digest = keys.hash_key(body.key)
                if not digest:
                    return _problem_response(ApiError(400, "bad_key", "invalid license key format"))
                lic = conn.execute("SELECT * FROM licenses WHERE key_hash=?", (digest,)).fetchone()
            elif body.email:
                row = conn.execute("SELECT id FROM accounts WHERE email=?", (body.email.strip().lower(),)).fetchone()
                if row:
                    lic = conn.execute(
                        "SELECT * FROM licenses WHERE account_id=? ORDER BY created_at DESC LIMIT 1",
                        (row["id"],),
                    ).fetchone()

            if not lic:
                return _problem_response(ApiError(404, "not_found", "no matching license found"))

            desc = accounts.describe(conn, lic, now, cfg)
            dev_list = accounts.devices(conn, lic["id"])
            entries = ledger.history(conn, lic["account_id"], limit=10)
            return {
                "license_id": lic["id"],
                "plan": lic["plan"],
                "status": lic["status"],
                "period_end": lic["period_end"],
                "seats_allowed": lic["seats_allowed"],
                "balance": desc["balance"],
                "costs": desc["costs"],
                "devices": dev_list,
                "recent_history": entries,
            }
    except ApiError as exc:
        return _problem_response(exc)


@router.post("/api/v1/flmcp/devices/revoke")
def revoke_device_by_id(body: RevokeDeviceIn):
    """Revoke a specific device seat from the web dashboard."""
    db = get_db()
    try:
        with db.tx() as conn:
            digest = keys.hash_key(body.key)
            if not digest:
                return _problem_response(ApiError(400, "bad_key", "invalid license key"))
            lic = conn.execute("SELECT id FROM licenses WHERE key_hash=?", (digest,)).fetchone()
            if not lic:
                return _problem_response(ApiError(404, "not_found", "license not found"))
            revoked = accounts.revoke_device(conn, lic["id"], body.device_id)
            if not revoked:
                return _problem_response(ApiError(404, "device_not_found", "device seat not found or already revoked"))
            return {"revoked": True, "device_id": body.device_id}
    except ApiError as exc:
        return _problem_response(exc)


# ── Admin Endpoints ───────────────────────────────────────────────────

@router.post("/api/v1/flmcp/admin/licenses")
@router.post("/v1/admin/licenses")
def admin_create_license(body: AdminLicenseIn, authorization: str | None = Header(None)):
    """Admin endpoint: Issue a new license for an email."""
    _verify_admin(authorization)
    db = get_db()
    cfg = get_config()
    now = db.now()
    try:
        with db.tx() as conn:
            aid = accounts.account_for(conn, body.email, now)
            end = now + body.days * 86400 if body.days else None
            lid, key = accounts.create_license(conn, aid, body.plan, now, cfg, end)
            row = conn.execute("SELECT * FROM licenses WHERE id=?", (lid,)).fetchone()
            accounts.start_period(conn, row, now, row["period_end"], now, cfg)
            return {"license": lid, "key": key, "plan": body.plan, "period_end": row["period_end"]}
    except ApiError as exc:
        return _problem_response(exc)


@router.post("/api/v1/flmcp/admin/grants")
@router.post("/v1/admin/grants")
def admin_grant_credits(body: AdminGrantIn, authorization: str | None = Header(None)):
    """Admin endpoint: Grant manual credits to an account."""
    _verify_admin(authorization)
    db = get_db()
    cfg = get_config()
    now = db.now()
    try:
        with db.tx() as conn:
            aid = accounts.account_for(conn, body.email, now)
            end = now + body.days * 86400 if body.days else None
            ledger.grant(conn, aid, "adjust", body.credits, now, end)
            return {"balance": ledger.balance(conn, aid, now)}
    except ApiError as exc:
        return _problem_response(exc)


@router.get("/api/v1/flmcp/admin/accounts")
@router.get("/v1/admin/accounts")
def admin_lookup_account(email: str, authorization: str | None = Header(None)):
    """Admin endpoint: Lookup an account and inspect its licenses and ledger."""
    _verify_admin(authorization)
    db = get_db()
    cfg = get_config()
    now = db.now()
    try:
        with db.tx() as conn:
            row = conn.execute(
                "SELECT id FROM accounts WHERE email=?", (email.strip().lower(),)
            ).fetchone()
            if row is None:
                raise ApiError(404, "not_found", "no such account")
            ledger.sweep(conn, row["id"], now, cfg)
            lics = conn.execute(
                "SELECT id, plan, status, period_end, seats_allowed FROM licenses WHERE account_id=?",
                (row["id"],),
            ).fetchall()
            return {
                "balance": ledger.balance(conn, row["id"], now),
                "licenses": [dict(r) for r in lics],
                "entries": ledger.history(conn, row["id"]),
            }
    except ApiError as exc:
        return _problem_response(exc)
