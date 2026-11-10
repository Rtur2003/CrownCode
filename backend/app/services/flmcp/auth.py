"""Supabase Auth (Google sign-in) token verification for the FL-MCP dashboard.

The browser signs in with Supabase and sends its access token as a Bearer header. The token is
verified here against the project's public JWKS (asymmetric keys), so no secret is needed.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from typing import Any

import jwt
from jwt import PyJWKClient

from .errors import ApiError


@dataclass(frozen=True)
class AuthUser:
    id: str
    email: str


def _supabase_url() -> str:
    return os.environ.get("SUPABASE_URL", "").rstrip("/")


@lru_cache(maxsize=1)
def _jwks_client() -> PyJWKClient:
    url = os.environ.get("SUPABASE_JWKS_URL") or f"{_supabase_url()}/auth/v1/.well-known/jwks.json"
    return PyJWKClient(url, cache_keys=True, lifespan=3600)


def _signing_key(token: str) -> Any:
    """Separate function so tests can swap the key source."""
    return _jwks_client().get_signing_key_from_jwt(token).key


def verify_token(token: str) -> AuthUser:
    base = _supabase_url()
    if not base:
        raise ApiError(503, "auth_unconfigured", "sign-in is not configured on the server")
    try:
        claims = jwt.decode(
            token,
            _signing_key(token),
            algorithms=["ES256", "RS256"],
            audience="authenticated",
            issuer=f"{base}/auth/v1",
            options={"require": ["exp", "sub", "iss", "aud"]},
        )
    except Exception:  # expired, bad signature, wrong issuer, JWKS unreachable
        raise ApiError(401, "invalid_session", "your session is invalid or expired; sign in again") from None
    email = str(claims.get("email") or "").strip().lower()
    meta = claims.get("user_metadata") or {}
    if not email or "@" not in email or meta.get("email_verified") is False:
        raise ApiError(403, "email_unverified", "a verified email address is required")
    return AuthUser(id=str(claims["sub"]), email=email)


def bearer_user(authorization: str | None) -> AuthUser:
    scheme, _, token = (authorization or "").partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        raise ApiError(401, "invalid_session", "sign in to continue")
    return verify_token(token.strip())

