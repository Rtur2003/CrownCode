"""
API Router Initialization

Centralized router setup for all API endpoints.
"""
from fastapi import APIRouter

api_router = APIRouter()

# Import and include sub-routers
from .health import router as health_router

api_router.include_router(health_router, tags=["health"])

__all__ = ['api_router']
