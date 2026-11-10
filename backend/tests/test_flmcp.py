"""Tests for the FL-MCP licence API: Google/Supabase sign-in, trials, credits, rate limits, webhooks."""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import secrets
import tempfile
import time

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi.testclient import TestClient

from app.main import app
from app.services.flmcp import auth, keys, ratelimit, webhooks
from app.services.flmcp.db import DB

SUPABASE = "https://test-project.supabase.co"
_PRIVATE = ec.generate_private_key(ec.SECP256R1())


def token_for(email: str, sub: str | None = None, *, exp_in: int = 600, verified: bool = True,
              issuer: str = f"{SUPABASE}/auth/v1") -> str:
    now = int(time.time())
    claims = {
        "sub": sub or f"user-{email}", "email": email, "aud": "authenticated", "iss": issuer,
        "iat": now, "exp": now + exp_in, "user_metadata": {"email_verified": verified},
    }
    return jwt.encode(claims, _PRIVATE, algorithm="ES256")


def hdr(email: str, **kw) -> dict:
    return {"Authorization": f"Bearer {token_for(email, **kw)}"}


@pytest.fixture(autouse=True)
def _env(monkeypatch):
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    monkeypatch.setenv("FLMCP_DB", path)
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setenv("SUPABASE_URL", SUPABASE)
    monkeypatch.setenv("FLMCP_ADMIN_TOKEN", "test-admin-secret-token")
    monkeypatch.setenv("FLMCP_WEBHOOK_SECRETS", "stripe=stripe-test-secret,lemonsqueezy=lemon-secret")
    monkeypatch.setenv("FLMCP_LS_VARIANTS", "111=pro,222=studio,333=pack_100")
    monkeypatch.setattr(auth, "_signing_key", lambda _token: _PRIVATE.public_key())
    DB(path)
    ratelimit.reset()
    yield
    ratelimit.reset()
    try:
        os.remove(path)
    except OSError:
        pass


@pytest.fixture
def client():
    return TestClient(app)


def claim_trial(client, email="producer@gmail.com"):
    res = client.post("/api/v1/flmcp/me/trial", headers=hdr(email))
    assert res.status_code == 200, res.text
    return res.json()


def activate(client, key, device="dev-00000001", name="PC", **extra):
    return client.post("/api/v1/flmcp/activate", json={"key": key, "device_id": device, "name": name, **extra})


# ── keys ──────────────────────────────────────────────────────────────

def test_keys_checksum_catches_typos():
    key = keys.new_key()
    assert key.startswith("FLMCP-") and keys.normalize(key)
    typo = key[:-1] + ("A" if key[-1] != "A" else "B")
    assert keys.normalize(typo) is None


# ── sign-in ───────────────────────────────────────────────────────────

def test_me_requires_a_session(client):
    assert client.get("/api/v1/flmcp/me").status_code == 401
    assert client.get("/api/v1/flmcp/me", headers={"Authorization": "Bearer garbage"}).status_code == 401


def test_rejects_expired_wrong_issuer_and_unverified(client):
    assert client.get("/api/v1/flmcp/me", headers=hdr("a@gmail.com", exp_in=-10)).status_code == 401
    assert client.get("/api/v1/flmcp/me", headers=hdr("a@gmail.com", issuer="https://evil.example/auth/v1")).status_code == 401
    assert client.get("/api/v1/flmcp/me", headers=hdr("a@gmail.com", verified=False)).status_code == 403


def test_rejects_token_signed_with_another_key(client):
    other = ec.generate_private_key(ec.SECP256R1())
    now = int(time.time())
    forged = jwt.encode(
        {"sub": "x", "email": "a@gmail.com", "aud": "authenticated", "iss": f"{SUPABASE}/auth/v1", "exp": now + 60},
        other, algorithm="ES256",
    )
    assert client.get("/api/v1/flmcp/me", headers={"Authorization": f"Bearer {forged}"}).status_code == 401


def test_me_creates_account_with_nothing_in_it(client):
    res = client.get("/api/v1/flmcp/me", headers=hdr("new@gmail.com"))
    assert res.status_code == 200
    data = res.json()
    assert data["license"] is None and data["balance"] == 0 and data["trial_used"] is False


# ── trial ─────────────────────────────────────────────────────────────

def test_trial_once_per_account(client):
    first = claim_trial(client)
    assert first["key"].startswith("FLMCP-") and first["balance"] == 15
    assert first["license"]["plan"] == "trial" and first["trial_used"] is True
    again = client.post("/api/v1/flmcp/me/trial", headers=hdr("producer@gmail.com"))
    assert again.status_code == 409 and again.json()["code"] == "trial_used"


def test_trial_blocks_disposable_email(client):
    res = client.post("/api/v1/flmcp/me/trial", headers=hdr("bot@mailinator.com"))
    assert res.status_code == 403 and res.json()["code"] == "email_not_allowed"


def test_trial_is_rate_limited_per_ip(client):
    codes = [client.post("/api/v1/flmcp/me/trial", headers=hdr(f"u{i}@gmail.com")).status_code for i in range(5)]
    assert codes[:3] == [200, 200, 200]
    assert 429 in codes[3:]


def test_rate_limit_response_has_retry_after(client):
    for i in range(3):
        client.post("/api/v1/flmcp/me/trial", headers=hdr(f"v{i}@gmail.com"))
    res = client.post("/api/v1/flmcp/me/trial", headers=hdr("v9@gmail.com"))
    assert res.status_code == 429 and int(res.headers["Retry-After"]) >= 1


# ── activation, seats ─────────────────────────────────────────────────

def test_activate_and_account(client):
    key = claim_trial(client)["key"]
    res = activate(client, key, name="Desktop-Win11")
    assert res.status_code == 200
    body = res.json()
    assert body["device_token"] and body["balance"] == 15 and body["plan"] == "trial"
    acc = client.get("/api/v1/flmcp/account", headers={"Authorization": f"Bearer {body['device_token']}"})
    assert acc.status_code == 200 and acc.json()["devices"][0]["name"] == "Desktop-Win11"


def test_seat_limit_and_replace(client):
    key = claim_trial(client)["key"]
    assert activate(client, key, "dev-00000001", "One").status_code == 200
    blocked = activate(client, key, "dev-00000002", "Two")
    assert blocked.status_code == 409 and blocked.json()["code"] == "device_limit"
    assert activate(client, key, "dev-00000002", "Two", replace="One").status_code == 200


def test_activate_brute_force_is_limited(client):
    bad = keys.new_key()
    codes = [activate(client, bad, f"dev-{i:08d}").status_code for i in range(12)]
    assert codes[0] == 404
    assert codes[-1] == 429


def test_dashboard_can_revoke_a_seat(client):
    key = claim_trial(client)["key"]
    activate(client, key, "dev-aaaaaaaa", "Laptop")
    me = client.get("/api/v1/flmcp/me", headers=hdr("producer@gmail.com")).json()
    seat = me["devices"][0]["full_id"]
    res = client.post("/api/v1/flmcp/me/devices/revoke", json={"device_id": seat}, headers=hdr("producer@gmail.com"))
    assert res.status_code == 200 and res.json()["devices"] == []


def test_user_cannot_revoke_someone_elses_seat(client):
    key = claim_trial(client, "owner@gmail.com")["key"]
    activate(client, key, "dev-bbbbbbbb", "Owner-PC")
    client.get("/api/v1/flmcp/me", headers=hdr("intruder@gmail.com"))
    res = client.post("/api/v1/flmcp/me/devices/revoke", json={"device_id": "dev-bbbbbbbb"}, headers=hdr("intruder@gmail.com"))
    assert res.status_code == 404
    still = client.get("/api/v1/flmcp/me", headers=hdr("owner@gmail.com")).json()
    assert len(still["devices"]) == 1


def test_rotate_key_invalidates_the_old_one(client):
    old = claim_trial(client)["key"]
    new = client.post("/api/v1/flmcp/me/key/rotate", headers=hdr("producer@gmail.com")).json()["key"]
    assert new != old
    assert activate(client, old).status_code == 404
    assert activate(client, new).status_code == 200


def test_old_unauthenticated_endpoints_are_gone(client):
    assert client.post("/api/v1/flmcp/user/lookup", json={"email": "a@gmail.com"}).status_code in (404, 405)
    assert client.post("/api/v1/flmcp/user/generate-trial", json={"email": "a@gmail.com"}).status_code in (404, 405)
    assert client.post("/api/v1/flmcp/devices/revoke", json={"key": "x", "device_id": "y"}).status_code in (404, 405)


# ── credits ───────────────────────────────────────────────────────────

def device_token(client, email="credit@gmail.com"):
    key = claim_trial(client, email)["key"]
    return {"Authorization": f"Bearer {activate(client, key).json()['device_token']}"}


def test_reserve_settle_and_idempotency(client):
    h = device_token(client)
    idem = secrets.token_hex(16)
    body = {"ops": ["produce.compose", "mix.balance"], "idem": idem}
    held = client.post("/api/v1/flmcp/credits/reserve", json=body, headers=h).json()
    assert held["cost"] == 7 and held["balance"] == 8
    retry = client.post("/api/v1/flmcp/credits/reserve", json=body, headers=h).json()
    assert retry["id"] == held["id"] and retry["balance"] == 8
    done = client.post(f"/api/v1/flmcp/credits/{held['id']}/settle", json={"done": ["produce.compose"]}, headers=h).json()
    assert done["charged"] == 5 and done["refunded"] == 2 and done["balance"] == 10


def test_insufficient_credits_gives_topup_url(client):
    h = device_token(client)
    for _ in range(2):
        r = client.post("/api/v1/flmcp/credits/reserve", json={"ops": ["produce.compose", "produce.flp", "mix.balance"], "idem": secrets.token_hex(8)}, headers=h)
        if r.status_code == 200:
            client.post(f"/api/v1/flmcp/credits/{r.json()['id']}/settle", json={"done": ["produce.compose", "produce.flp", "mix.balance"]}, headers=h)
    res = client.post("/api/v1/flmcp/credits/reserve", json={"ops": ["produce.compose", "produce.flp"], "idem": secrets.token_hex(8)}, headers=h)
    assert res.status_code == 402 and "topup_url" in res.json()


def test_device_self_revoke(client):
    h = device_token(client, "revoker@gmail.com")
    assert client.post("/api/v1/flmcp/devices/self/revoke", headers=h).status_code == 204
    assert client.get("/api/v1/flmcp/account", headers=h).status_code == 401


# ── webhooks ──────────────────────────────────────────────────────────

def ls_post(client, payload: dict, secret="lemon-secret"):
    raw = json.dumps(payload).encode()
    sig = hmac.new(secret.encode(), raw, hashlib.sha256).hexdigest()
    return client.post("/api/v1/flmcp/webhooks/lemonsqueezy", content=raw, headers={"Content-Type": "application/json", "X-Signature": sig})


def ls_sub(variant="111", email="buyer@gmail.com", sub_id="9001"):
    return {
        "meta": {"event_name": "subscription_created"},
        "data": {"id": sub_id, "attributes": {
            "user_email": email, "variant_id": int(variant), "status": "active",
            "created_at": "2026-11-02T10:00:00.000000Z", "updated_at": "2026-11-02T10:00:00.000000Z",
            "renews_at": "2026-12-02T10:00:00.000000Z",
        }},
    }


def test_lemonsqueezy_rejects_bad_signature(client):
    assert ls_post(client, ls_sub(), secret="wrong").status_code == 401


def test_lemonsqueezy_subscription_gives_licence_and_credits(client):
    assert ls_post(client, ls_sub()).status_code == 200
    me = client.get("/api/v1/flmcp/me", headers=hdr("buyer@gmail.com")).json()
    assert me["license"]["plan"] == "pro" and me["balance"] == 300 and me["license"]["seats_allowed"] == 2


def test_lemonsqueezy_event_is_applied_once(client):
    ls_post(client, ls_sub())
    again = ls_post(client, ls_sub())
    assert again.json().get("duplicate") is True
    assert client.get("/api/v1/flmcp/me", headers=hdr("buyer@gmail.com")).json()["balance"] == 300


def test_lemonsqueezy_pack_adds_credits(client):
    ls_post(client, ls_sub())
    pack = {
        "meta": {"event_name": "order_created"},
        "data": {"id": "5001", "attributes": {
            "user_email": "buyer@gmail.com", "status": "paid", "created_at": "2026-11-02T11:00:00Z",
            "first_order_item": {"variant_id": 333},
        }},
    }
    assert ls_post(client, pack).status_code == 200
    assert client.get("/api/v1/flmcp/me", headers=hdr("buyer@gmail.com")).json()["balance"] == 400


def test_lemonsqueezy_cancel_keeps_access_until_period_end(client):
    ls_post(client, ls_sub())
    cancel = {"meta": {"event_name": "subscription_cancelled"},
              "data": {"id": "9001", "attributes": {"updated_at": "2026-11-05T10:00:00Z"}}}
    assert ls_post(client, cancel).status_code == 200
    me = client.get("/api/v1/flmcp/me", headers=hdr("buyer@gmail.com")).json()
    assert me["license"]["status"] == "canceled"


def test_signed_in_user_is_linked_to_licence_bought_by_email(client):
    ls_post(client, ls_sub(email="Buyer@Gmail.com"))
    me = client.get("/api/v1/flmcp/me", headers=hdr("buyer@gmail.com", sub="google-sub-1")).json()
    assert me["license"] is not None
    other = client.get("/api/v1/flmcp/me", headers=hdr("buyer@gmail.com", sub="google-sub-2"))
    assert other.status_code == 409


def test_generic_webhook_still_verifies_timestamped_signature(client):
    now = int(time.time())
    payload = {"id": "evt_1", "type": "subscription.started", "email": "gen@gmail.com", "plan": "studio",
               "ref": "sub_x", "period_start": now, "period_end": now + 86400 * 30}
    raw = json.dumps(payload).encode()
    res = client.post("/api/v1/flmcp/webhooks/stripe", content=raw,
                      headers={"Content-Type": "application/json", "X-Signature": webhooks.sign("stripe-test-secret", raw, now)})
    assert res.status_code == 200
