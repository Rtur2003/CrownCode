"""
Logging Infrastructure for CrownCode Backend

Structured logging with configurable levels and output.
"""
import sys
from loguru import logger
from .config import get_settings


def configure_logging():
    """Configure application logging with structured format."""
    settings = get_settings()
    
    logger.remove()
    
    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )
    
    logger.add(
        sys.stdout,
        format=log_format,
        level="DEBUG" if settings.debug else "INFO",
        colorize=True
    )
    
    logger.add(
        "logs/crowncode_{time}.log",
        format=log_format,
        level="INFO",
        rotation="1 day",
        retention="30 days",
        compression="zip"
    )
    
    return logger


def get_logger():
    """Get configured logger instance."""
    return logger
