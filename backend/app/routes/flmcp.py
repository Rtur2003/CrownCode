"""FL-MCP (FL Studio AI Copilot) licensing and credit API.

Two kinds of callers:
- the desktop client, which authenticates with a device token (Bearer) after `activate`;
- the CrownCode dashboard, where the user signs in with Google through Supabase and the
  Supabase access token (Bearer) is verified here. Everything under `/me` needs that session.
"""

from __future__ import annotations

import hmac
import json
import os
import secrets

from fastapi import APIRouter, Header, Request, status
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool

from ..services.client_ip import client_ip
from ..services.flmcp import accounts, keys, ledger, plans, ratelimit, webhooks
from ..services.flmcp.auth import AuthUser, bearer_user
from ..services.flmcp.db import DB
from ..services.flmcp.errors import ApiError

router = APIRouter(tags=["FL-MCP Licensing & Credits"])

MAX_WEBHOOK = 64 * 1024


def get_db() -> DB:
    return DB()


def get_config() -> plans.Config:
    return plans.load(os.environ.get("FLMCP_CONFIG"))


def get_topup_url() -> str:
    return os.environ.get("FLMCP_TOPUP_URL", "https://hasan-arthur-altuntas.xyz/fl-mcp#pricing")


def get_admin_token() -> str:
    return os.environ.get("FLMCP_ADMIN_TOKEN", "")


def _parse_kv_or_json(raw: str) -> dict[str, str]:
    raw = (raw or "").strip()
    if not raw:
        return {}
    if raw.startswith("{"):
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, dict):
                return {str(k).strip(): str(v).strip() for k, v in parsed.items() if str(k).strip()}
        except Exception:
            return {}
    pairs = (p.split("=", 1) for p in raw.split(",") if "=" in p)
    return {k.strip(): v.strip() for k, v in pairs if k.strip() and v.strip()}


def get_webhook_secrets() -> dict[str, str]:
    secrets_map = _parse_kv_or_json(os.environ.get("FLMCP_WEBHOOK_SECRETS", ""))
    for provider in ("lemonsqueezy", "stripe", "generic"):
        env_val = os.environ.get(f"FLMCP_WEBHOOK_SECRET_{provider.upper()}", "").strip()
        if env_val and provider not in secrets_map:
            secrets_map[provider] = env_val
    return secrets_map


def get_ls_variants() -> dict[str, str]:
    return _parse_kv_or_json(os.environ.get("FLMCP_LS_VARIANTS", ""))


class ActivateIn(BaseModel):
    key: str | None = Field(default=None, max_length=64)
    license_key: str | None = Field(default=None, max_length=64)
    device_id: str | None = Field(default=None, min_length=8, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")
    name: str | None = Field(default=None, max_length=80)
    device_name: str | None = Field(default=None, max_length=80)
    replace: str | None = Field(default=None, max_length=64)


class ReserveIn(BaseModel):
    ops: list[str] = Field(min_length=1, max_length=8)
    idem: str = Field(min_length=8, max_length=64)


class SettleIn(BaseModel):
    done: list[str] = Field(default_factory=list, max_length=8)


class RevokeDeviceIn(BaseModel):
    device_id: str = Field(min_length=4, max_length=64)


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


def _token_id(token: str) -> str:
    import hashlib

    return hashlib.sha256(token.encode()).hexdigest()[:16]


def _problem_response(exc: ApiError) -> JSONResponse:
    headers: dict[str, str] = {}
    if exc.status == 401:
        headers["WWW-Authenticate"] = "Bearer"
    if exc.status == 429 and "retry_after" in exc.extra:
        headers["Retry-After"] = str(exc.extra["retry_after"])
    body = {"type": "about:blank", "status": exc.status, "code": exc.code, "detail": exc.detail, **exc.extra}
    if exc.code == "insufficient_credits" and "topup_url" not in body:
        body["topup_url"] = get_topup_url()
    return JSONResponse(status_code=exc.status, content=body, headers=headers, media_type="application/problem+json")


def _verify_admin(authorization: str | None) -> None:
    admin_token = get_admin_token()
    if not admin_token:
        raise ApiError(404, "not_found", "admin API is not enabled")
    if not hmac.compare_digest(_bearer(authorization).encode(), admin_token.encode()):
        raise ApiError(401, "invalid_token", "wrong admin token")


# ── Desktop client: activation, account, credits ──────────────────────

@router.post("/api/v1/flmcp/activate")
@router.post("/v1/activate")
def activate_device(body: ActivateIn, request: Request):
    """Activate an FL-MCP desktop client with a licence key."""
    key = body.key or body.license_key
    if not key:
        return _problem_response(ApiError(400, "bad_request", "license key is required"))
    dev_name = (body.name or body.device_name or "Studio-PC").strip()
    dev_id = (body.device_id or secrets.token_hex(8)).strip()
    db, cfg = get_db(), get_config()
    try:
        ratelimit.hit("activate_ip", client_ip(request))
        ratelimit.hit("activate_key", keys.hash_key(key) or client_ip(request))
        with db.tx() as conn:
            return accounts.activate(conn, key, dev_id, dev_name, body.replace, db.now(), cfg)
    except ApiError as exc:
        return _problem_response(exc)


@router.get("/api/v1/flmcp/account")
@router.get("/v1/account")
def get_account_status(authorization: str | None = Header(None)):
    """Live balance, plan and device seats for an activated device."""
    db, cfg = get_db(), get_config()
    try:
        token = _bearer(authorization)
        ratelimit.hit("account_token", _token_id(token))
        with db.tx() as conn:
            now = db.now()
            lic = accounts.authenticate(conn, token, now)
            return {
                **accounts.describe(conn, lic, now, cfg),
                "devices": accounts.devices(conn, lic["id"]),
                "topup_url": get_topup_url(),
            }
    except ApiError as exc:
        return _problem_response(exc)


@router.post("/api/v1/flmcp/credits/reserve")
@router.post("/v1/credits/reserve")
def reserve_credits(body: ReserveIn, authorization: str | None = Header(None)):
    """Hold credits for FL Studio operations before they run."""
    db, cfg = get_db(), get_config()
    try:
        token = _bearer(authorization)
        ratelimit.hit("reserve_token", _token_id(token))
        with db.tx() as conn:
            now = db.now()
            lic = accounts.authenticate(conn, token, now)
            return ledger.reserve(conn, lic["account_id"], body.ops, body.idem, now, cfg)
    except ApiError as exc:
        return _problem_response(exc)


@router.post("/api/v1/flmcp/credits/{rid}/settle")
@router.post("/v1/credits/{rid}/settle")
def settle_reservation(rid: str, body: SettleIn, authorization: str | None = Header(None)):
    """Charge only what was delivered; the rest of the hold goes back to the balance."""
    db, cfg = get_db(), get_config()
    try:
        token = _bearer(authorization)
        ratelimit.hit("reserve_token", _token_id(token))
        with db.tx() as conn:
            now = db.now()
            lic = accounts.authenticate(conn, token, now)
            return ledger.settle(conn, lic["account_id"], rid, body.done, now, cfg)
    except ApiError as exc:
        return _problem_response(exc)


@router.post("/api/v1/flmcp/devices/self/revoke", status_code=status.HTTP_204_NO_CONTENT)
@router.post("/v1/devices/self/revoke", status_code=status.HTTP_204_NO_CONTENT)
def revoke_calling_device(authorization: str | None = Header(None)):
    """Free the seat of the machine that calls."""
    db = get_db()
    try:
        with db.tx() as conn:
            lic = accounts.authenticate(conn, _bearer(authorization), db.now())
            accounts.revoke_self(conn, lic)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ApiError as exc:
        return _problem_response(exc)


# ── Payment webhooks ──────────────────────────────────────────────────

@router.post("/api/v1/flmcp/webhooks/{provider}")
@router.post("/v1/webhooks/{provider}")
async def handle_provider_webhook(provider: str, request: Request):
    """Checkout and subscription events (signed with HMAC-SHA256)."""
    db, cfg = get_db(), get_config()
    try:
        ratelimit.hit("webhook_ip", client_ip(request))
    except ApiError as exc:
        return _problem_response(exc)
    secret = get_webhook_secrets().get(provider)
    if not secret:
        return _problem_response(ApiError(404, "unknown_provider", "no such provider"))
    if int(request.headers.get("content-length") or 0) > MAX_WEBHOOK:
        return _problem_response(ApiError(413, "too_large", "payload exceeds max size"))
    raw_body = await request.body()
    if len(raw_body) > MAX_WEBHOOK:
        return _problem_response(ApiError(413, "too_large", "payload exceeds max size"))
    sig_header = (
        request.headers.get("x-flmcp-signature")
        or request.headers.get("x-signature")
        or request.headers.get("stripe-signature")
    )
    if not webhooks.verify(secret, sig_header, raw_body, db.now()):
        return _problem_response(ApiError(401, "bad_signature", "invalid or expired webhook signature"))
    try:
        event = json.loads(raw_body)
    except ValueError:
        return _problem_response(ApiError(400, "bad_request", "payload must be valid JSON"))
    if not isinstance(event, dict):
        return _problem_response(ApiError(400, "bad_request", "payload must be a JSON object"))

    def _execute():
        nonlocal event
        if provider == "lemonsqueezy":
            normalized = webhooks.normalize_lemonsqueezy(event, get_ls_variants(), cfg)
            if normalized is None:
                return {"ignored": True}
            event = normalized
        with db.tx() as conn:
            return webhooks.apply(conn, provider, event, db.now(), cfg)

    try:
        return await run_in_threadpool(_execute)
    except ApiError as exc:
        return _problem_response(exc)


# ── Dashboard (Google sign-in through Supabase) ───────────────────────

def _summary(conn, db: DB, cfg: plans.Config, aid: str) -> dict:
    now = db.now()
    ledger.sweep(conn, aid, now, cfg)
    lic = accounts.latest_license(conn, aid)
    out: dict = {
        "balance": ledger.balance(conn, aid, now),
        "costs": cfg.costs,
        "trial_used": accounts.trial_used(conn, aid),
        "history": ledger.history(conn, aid, limit=10),
        "license": None,
        "devices": [],
        "topup_url": get_topup_url(),
    }
    if lic is not None:
        out["license"] = {
            "id": lic["id"],
            "plan": lic["plan"],
            "status": lic["status"],
            "period_end": lic["period_end"],
            "seats_allowed": lic["seats_allowed"],
        }
        out["devices"] = accounts.devices(conn, lic["id"])
        unread = conn.execute(
            "SELECT id, payload FROM outbox WHERE account_id=? AND kind='license_key' AND sent_at IS NULL ORDER BY id DESC LIMIT 1",
            (aid,),
        ).fetchone()
        if unread is not None:
            try:
                payload = json.loads(unread["payload"])
                if isinstance(payload, dict) and payload.get("key"):
                    out["key"] = payload["key"]
                    conn.execute("UPDATE outbox SET sent_at=? WHERE id=?", (now, unread["id"]))
            except Exception:
                pass
    return out


@router.get("/api/v1/flmcp/me")
def me_summary(request: Request, authorization: str | None = Header(None)):
    """The signed-in user's licence, credits and devices. Creates the account on first sign-in."""
    db, cfg = get_db(), get_config()
    try:
        user: AuthUser = bearer_user(authorization)
        ratelimit.hit("me_user", user.id)
        with db.tx() as conn:
            aid = accounts.account_for_user(conn, user.id, user.email, db.now())
            return {"email": user.email, **_summary(conn, db, cfg, aid)}
    except ApiError as exc:
        return _problem_response(exc)


@router.post("/api/v1/flmcp/me/trial")
def me_claim_trial(request: Request, authorization: str | None = Header(None)):
    """One free trial per account: 15 credits for 30 days. The key is shown once."""
    db, cfg = get_db(), get_config()
    try:
        user = bearer_user(authorization)
        ratelimit.hit("trial_ip", client_ip(request))
        ratelimit.hit("trial_user", user.id)
        domain = user.email.rsplit("@", 1)[-1]
        if domain in accounts.DISPOSABLE_DOMAINS:
            raise ApiError(403, "email_not_allowed", "use a permanent email address to claim a trial")
        now = db.now()
        with db.tx() as conn:
            aid = accounts.account_for_user(conn, user.id, user.email, now)
            if accounts.trial_used(conn, aid):
                raise ApiError(409, "trial_used", "this account has already used its free trial")
            lid, key = accounts.create_license(conn, aid, "trial", now, cfg)
            row = conn.execute("SELECT * FROM licenses WHERE id=?", (lid,)).fetchone()
            accounts.start_period(conn, row, now, row["period_end"], now, cfg)
            return {"key": key, **_summary(conn, db, cfg, aid)}
    except ApiError as exc:
        return _problem_response(exc)


@router.post("/api/v1/flmcp/me/key/rotate")
def me_rotate_key(authorization: str | None = Header(None)):
    """Issue a new licence key (the old one stops activating new devices). Shown once."""
    db, cfg = get_db(), get_config()
    try:
        user = bearer_user(authorization)
        ratelimit.hit("rotate_user", user.id)
        with db.tx() as conn:
            aid = accounts.account_for_user(conn, user.id, user.email, db.now())
            lic = accounts.latest_license(conn, aid)
            if lic is None:
                raise ApiError(404, "no_license", "this account has no licence yet")
            return {"key": accounts.rotate_key(conn, lic["id"]), **_summary(conn, db, cfg, aid)}
    except ApiError as exc:
        return _problem_response(exc)


@router.post("/api/v1/flmcp/me/devices/revoke")
def me_revoke_device(body: RevokeDeviceIn, authorization: str | None = Header(None)):
    """Free one seat from the dashboard."""
    db, cfg = get_db(), get_config()
    try:
        user = bearer_user(authorization)
        ratelimit.hit("me_user", user.id)
        with db.tx() as conn:
            aid = accounts.account_for_user(conn, user.id, user.email, db.now())
            lic = accounts.latest_license(conn, aid)
            if lic is None or not accounts.revoke_device(conn, lic["id"], body.device_id):
                raise ApiError(404, "device_not_found", "device seat not found or already revoked")
            return _summary(conn, db, cfg, aid)
    except ApiError as exc:
        return _problem_response(exc)


# ── Admin ─────────────────────────────────────────────────────────────

@router.post("/api/v1/flmcp/admin/licenses")
@router.post("/v1/admin/licenses")
def admin_create_license(body: AdminLicenseIn, authorization: str | None = Header(None)):
    db, cfg = get_db(), get_config()
    try:
        _verify_admin(authorization)
        now = db.now()
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
    db = get_db()
    try:
        _verify_admin(authorization)
        now = db.now()
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
    db, cfg = get_db(), get_config()
    try:
        _verify_admin(authorization)
        now = db.now()
        with db.tx() as conn:
            row = conn.execute("SELECT id FROM accounts WHERE email=?", (email.strip().lower(),)).fetchone()
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
