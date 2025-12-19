"""
CrownCode backend entrypoint with enhanced error handling.
"""

from __future__ import annotations

import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .routes.health import router as health_router
from .routes.youtube import router as youtube_router
from .services.logging_config import setup_logging, get_logger


setup_logging(level=os.getenv("LOG_LEVEL", "INFO"))
logger = get_logger(__name__)


def _load_origins() -> list[str]:
    raw = os.getenv("CROWNCODE_CORS_ORIGINS", "http://localhost:3000")
    if raw.strip() == "*":
        logger.warning("CORS configured to allow all origins")
        return ["*"]
    origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
    logger.info(f"CORS configured for origins: {origins}")
    return origins


app = FastAPI(title="CrownCode Backend API", version="0.1.0")


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    logger.warning(f"Validation error: {exc}")
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc), "type": "validation_error"}
    )


@app.exception_handler(FileNotFoundError)
async def file_not_found_handler(request: Request, exc: FileNotFoundError) -> JSONResponse:
    logger.error(f"File not found: {exc}")
    return JSONResponse(
        status_code=404,
        content={"detail": "Resource not found", "type": "not_found"}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(f"Unhandled exception: {type(exc).__name__}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "type": "server_error"}
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=_load_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(youtube_router)

logger.info("CrownCode backend API initialized")
