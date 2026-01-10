"""
Health Check Endpoint

System health monitoring and status reporting.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timezone
import psutil
from ..config import get_settings

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response schema."""
    status: str
    timestamp: datetime
    version: str
    environment: str
    system: dict


@router.get("/health")
async def health_check() -> HealthResponse:
    """
    Check system health and return status information.
    
    Returns application status, version, and basic system metrics.
    """
    settings = get_settings()
    
    memory = psutil.virtual_memory()
    cpu_percent = psutil.cpu_percent(interval=0.1)
    
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(timezone.utc),
        version=settings.app_version,
        environment=settings.environment,
        system={
            "cpu_usage_percent": cpu_percent,
            "memory_used_percent": memory.percent,
            "memory_available_mb": memory.available / (1024 * 1024)
        }
    )
