"""Plans, credit costs and policy."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from .errors import ApiError

GRACE_SECONDS = 3 * 86400  # a late renewal webhook must not lock a paying customer out


@dataclass(frozen=True)
class Plan:
    credits: int  # granted each period
    devices: int  # activations allowed at once
    days: int | None = None  # one-off plans (trial): length of the licence and of its credits


@dataclass(frozen=True)
class Config:
    costs: dict[str, int]
    plans: dict[str, Plan]
    packs: dict[str, int]
    topup_days: int | None = None  # purchased credits do not expire unless set
    refund_days: int = 30  # life of the credits returned for a lot that expired meanwhile
    hold_seconds: int = 600


DEFAULT = {
    "costs": {"produce.compose": 5, "produce.flp": 3, "mix.balance": 2},
    "plans": {
        "trial": {"credits": 15, "devices": 1, "days": 30},
        "pro": {"credits": 300, "devices": 2},
        "studio": {"credits": 1200, "devices": 5},
    },
    "packs": {"pack_100": 100, "pack_500": 500},
}


def load(path: str | Path | None = None) -> Config:
    raw = {**DEFAULT, **(json.loads(Path(path).read_text("utf-8")) if path else {})}
    costs, packs = dict(raw["costs"]), dict(raw["packs"])
    plans = {name: Plan(**p) for name, p in raw["plans"].items()}
    if not costs or any(not isinstance(v, int) or v < 1 for v in costs.values()):
        raise ValueError("every cost must be a whole number of credits, at least 1")
    if any(not isinstance(v, int) or v < 1 for v in packs.values()):
        raise ValueError("every pack must be a whole number of credits, at least 1")
    if any(p.credits < 0 or p.devices < 1 for p in plans.values()):
        raise ValueError("plans need credits >= 0 and devices >= 1")
    return Config(
        costs,
        plans,
        packs,
        raw.get("topup_days"),
        int(raw.get("refund_days", 30)),
        int(raw.get("hold_seconds", 600)),
    )


def usable(status: str, period_end: int | None, now: int) -> bool:
    """active licences run a grace period past period_end; canceled ones stop at period_end."""
    if status not in ("active", "canceled"):
        return False
    if period_end is None:
        return True
    return now < period_end + (GRACE_SECONDS if status == "active" else 0)


def require_usable(status: str, period_end: int | None, now: int) -> None:
    if not usable(status, period_end, now):
        state = "expired" if status == "active" else status
        raise ApiError(
            403,
            "license_inactive",
            f"the subscription is {state}; renew it to continue",
            subscription=state,
        )

