"""
CrownCode backend entrypoint.
"""

from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.health import router as health_router
from .routes.youtube import router as youtube_router


def _load_origins() -> list[str]:
    raw = os.getenv("CROWNCODE_CORS_ORIGINS", "http://localhost:3000")
    if raw.strip() == "*":
        return ["*"]
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


app = FastAPI(title="CrownCode Backend API", version="0.1.0")

_origins = _load_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials="*" not in _origins,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)

app.include_router(health_router)
app.include_router(youtube_router)
