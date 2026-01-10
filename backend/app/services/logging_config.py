"""
Logging configuration for CrownCode backend services.

Provides structured logging with appropriate levels and formatting.
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path
from typing import Optional


def setup_logging(
    level: str = "INFO",
    log_file: Optional[Path] = None,
    json_format: bool = False
) -> None:
    """
    Configure application logging.
    
    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional file path for log output
        json_format: Use JSON formatting for structured logs
    """
    log_level = getattr(logging, level.upper(), logging.INFO)
    
    handlers = []
    
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    
    if json_format:
        formatter = logging.Formatter(
            '{"time":"%(asctime)s","level":"%(levelname)s","module":"%(name)s","message":"%(message)s"}'
        )
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    
    console_handler.setFormatter(formatter)
    handlers.append(console_handler)
    
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(log_level)
        file_handler.setFormatter(formatter)
        handlers.append(file_handler)
    
    logging.basicConfig(
        level=log_level,
        handlers=handlers,
        force=True
    )
    
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("yt_dlp").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for a module.
    
    Args:
        name: Logger name (usually __name__)
        
    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)


class LogContext:
    """Context manager for temporary log level changes."""
    
    def __init__(self, logger: logging.Logger, level: str) -> None:
        self.logger = logger
        self.new_level = getattr(logging, level.upper())
        self.old_level = logger.level
    
    def __enter__(self) -> logging.Logger:
        self.logger.setLevel(self.new_level)
        return self.logger
    
    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.logger.setLevel(self.old_level)
