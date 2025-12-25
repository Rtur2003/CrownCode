"""
File Utility Functions

Common file operations and validations.
"""
from pathlib import Path
from typing import List, Optional
import os


def ensure_directory_exists(directory: Path) -> None:
    """
    Ensure a directory exists, creating it if necessary.
    
    Args:
        directory: Path to the directory to create
        
    Raises:
        OSError: If directory creation fails
    """
    directory.mkdir(parents=True, exist_ok=True)


def safe_delete_file(file_path: Path) -> bool:
    """
    Safely delete a file, ignoring errors.
    
    Args:
        file_path: Path to the file to delete
        
    Returns:
        True if file was deleted, False otherwise
    """
    try:
        if file_path.exists() and file_path.is_file():
            os.unlink(file_path)
            return True
    except Exception:
        pass
    return False


def get_file_extension(filename: str) -> str:
    """
    Get the file extension in lowercase.
    
    Args:
        filename: Name of the file
        
    Returns:
        File extension including the dot (e.g., '.mp3')
    """
    return Path(filename).suffix.lower()


def is_audio_file(filename: str, supported_formats: Optional[List[str]] = None) -> bool:
    """
    Check if a filename has an audio extension.
    
    Args:
        filename: Name of the file to check
        supported_formats: List of supported extensions (default: common audio formats)
        
    Returns:
        True if the file has an audio extension
    """
    if supported_formats is None:
        supported_formats = ['.mp3', '.wav', '.flac', '.m4a', '.ogg']
    
    extension = get_file_extension(filename)
    return extension in supported_formats


def sanitize_filename(filename: str, max_length: int = 255) -> str:
    """
    Sanitize a filename to remove potentially dangerous characters.
    
    Args:
        filename: Original filename
        max_length: Maximum allowed length
        
    Returns:
        Sanitized filename
    """
    # Remove path separators and other dangerous characters
    dangerous_chars = ['..', '/', '\\', '\0', '<', '>', ':', '"', '|', '?', '*']
    
    sanitized = filename
    for char in dangerous_chars:
        sanitized = sanitized.replace(char, '_')
    
    # Limit length
    if len(sanitized) > max_length:
        ext = get_file_extension(sanitized)
        sanitized = sanitized[:max_length - len(ext)] + ext
    
    return sanitized
