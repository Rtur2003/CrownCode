"""FL-MCP Commerce & Licensing Package for CrownCode."""

from .accounts import (
    account_for,
    activate,
    authenticate,
    create_license,
    describe,
    devices,
    revoke_device,
    revoke_self,
    start_period,
)
from .db import DB, default_db_path
from .errors import ApiError
from .keys import display, hash_key, new_key, normalize
from .ledger import balance, grant, history, reserve, settle, sweep
from .plans import Config, Plan, load, require_usable, usable
from .webhooks import apply, sign, verify

__all__ = [
    "DB",
    "default_db_path",
    "ApiError",
    "Config",
    "Plan",
    "load",
    "usable",
    "require_usable",
    "new_key",
    "normalize",
    "hash_key",
    "display",
    "account_for",
    "create_license",
    "start_period",
    "activate",
    "describe",
    "authenticate",
    "revoke_self",
    "revoke_device",
    "devices",
    "grant",
    "balance",
    "sweep",
    "reserve",
    "settle",
    "history",
    "verify",
    "sign",
    "apply",
]

