"""
CrownCode Backend - Main Application Entry Point

FastAPI application for AI music detection and data manipulation.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import get_settings
from .logging_config import configure_logging
from .exceptions import CrownCodeException
from .api import api_router

configure_logging()
settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="AI-Powered Music Detection & Data Analysis Platform",
    version=settings.app_version
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(CrownCodeException)
async def crowncode_exception_handler(request: Request, exc: CrownCodeException):
    """Handle custom CrownCode exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.message}
    )


app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/")
async def root():
    """Root endpoint with basic API information."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "operational",
        "docs": "/docs",
        "health": f"{settings.api_prefix}/health"
    }
