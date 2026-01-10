"""
Health check route for the backend service.
"""

from __future__ import annotations

from fastapi import APIRouter

from ..services.external_clients import service_status


router = APIRouter()


@router.get("/api/health")
async def health() -> dict:
    return {
        "status": "ok",
        "services": service_status(),
    }
