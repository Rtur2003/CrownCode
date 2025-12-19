"""
Input validation and sanitization for backend services.

Provides defensive validation layers for all external inputs
to ensure system security and data integrity.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Optional


# YouTube video ID format: 11 alphanumeric characters plus _ and -
# This has been stable since 2006 but could theoretically change
VIDEO_ID_PATTERN = re.compile(r'^[a-zA-Z0-9_-]{11}$')
VIDEO_ID_LENGTH = 11

ALLOWED_AUDIO_EXTENSIONS = {'.mp3', '.wav', '.flac', '.ogg', '.m4a', '.webm', '.opus'}


def validate_video_id(video_id: str) -> bool:
    """
    Validate YouTube video ID format.
    
    YouTube video IDs are currently 11 characters long, consisting of
    alphanumeric characters, underscores, and hyphens. This format has
    been stable since 2006.
    
    Args:
        video_id: Video identifier to validate
        
    Returns:
        True if valid format, False otherwise
    """
    if not video_id or not isinstance(video_id, str):
        return False
    
    if len(video_id) != VIDEO_ID_LENGTH:
        return False
        
    return bool(VIDEO_ID_PATTERN.match(video_id))


def validate_url(url: str) -> bool:
    """
    Validate URL format and allowed domains.
    
    Args:
        url: URL string to validate
        
    Returns:
        True if valid and safe, False otherwise
    """
    if not url or not isinstance(url, str):
        return False
    
    url = url.strip()
    
    if not url.startswith(('http://', 'https://')):
        return False
    
    if len(url) > 2048:
        return False
    
    dangerous_chars = ['<', '>', '"', "'", '`', '{', '}']
    if any(char in url for char in dangerous_chars):
        return False
    
    allowed_domains = [
        'youtube.com',
        'youtu.be',
        'music.youtube.com',
        'spotify.com',
        'open.spotify.com'
    ]
    
    url_lower = url.lower()
    if not any(domain in url_lower for domain in allowed_domains):
        return False
    
    return True


def validate_audio_path(path: Path) -> tuple[bool, Optional[str]]:
    """
    Validate audio file path for security and format.
    
    Args:
        path: File path to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not path.exists():
        return False, "file_not_found"
    
    if not path.is_file():
        return False, "not_a_file"
    
    try:
        # resolve with strict=True validates path and prevents traversal
        resolved = path.resolve(strict=True)
        
    except (OSError, RuntimeError):
        return False, "invalid_path"
    
    extension = path.suffix.lower()
    if extension not in ALLOWED_AUDIO_EXTENSIONS:
        return False, f"unsupported_format_{extension}"
    
    try:
        file_size = path.stat().st_size
        
        if file_size < 1024:
            return False, "file_too_small"
        
        if file_size > 100 * 1024 * 1024:
            return False, "file_too_large"
            
    except OSError:
        return False, "cannot_read_file"
    
    return True, None


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent directory traversal and injection.
    
    Args:
        filename: Raw filename from user input
        
    Returns:
        Sanitized filename safe for use
    """
    if not filename:
        return "unnamed"
    
    filename = filename.strip()
    
    dangerous_patterns = ['..', '/', '\\', '\x00', '\n', '\r']
    for pattern in dangerous_patterns:
        filename = filename.replace(pattern, '_')
    
    filename = re.sub(r'[<>:"|?*]', '_', filename)
    
    if len(filename) > 255:
        name_part = filename[:200]
        ext_part = Path(filename).suffix[:55]
        filename = name_part + ext_part
    
    if not filename or filename in {'.', '..'}:
        filename = "unnamed"
    
    return filename


def validate_threshold(value: float) -> bool:
    """
    Validate threshold value is in acceptable range.
    
    Args:
        value: Threshold value to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not isinstance(value, (int, float)):
        return False
    
    return 0.0 <= value <= 1.0


def validate_timeout(seconds: float) -> bool:
    """
    Validate timeout value is reasonable.
    
    Args:
        seconds: Timeout value in seconds
        
    Returns:
        True if valid, False otherwise
    """
    if not isinstance(seconds, (int, float)):
        return False
    
    return 1.0 <= seconds <= 300.0
