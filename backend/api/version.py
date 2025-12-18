"""
Version Information Endpoint

Application version and feature flag reporting.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from ..config import get_settings

router = APIRouter()


class VersionResponse(BaseModel):
    """Version information response schema."""
    version: str
    environment: str
    build_date: datetime
    features: dict


@router.get("/version")
async def get_version() -> VersionResponse:
    """
    Get application version and feature flags.
    
    Returns version information and enabled features.
    """
    settings = get_settings()
    
    return VersionResponse(
        version=settings.app_version,
        environment=settings.environment,
        build_date=datetime.utcnow(),
        features={
            "ai_music_detection": True,
            "data_manipulation": True,
            "batch_processing": False,
            "streaming_platform_support": False
        }
    )
