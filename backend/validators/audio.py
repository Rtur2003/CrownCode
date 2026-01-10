"""
Audio File Validation

Validates audio file uploads before processing.
"""
from pathlib import Path
from typing import Optional
from pydantic import BaseModel, Field, validator
from ..constants import (
    SUPPORTED_AUDIO_EXTENSIONS,
    SUPPORTED_AUDIO_MIME_TYPES,
    MAX_AUDIO_SIZE_BYTES
)


class AudioFileValidator(BaseModel):
    """Validation schema for audio file uploads."""
    
    filename: str = Field(..., min_length=1, max_length=255)
    file_size: int = Field(..., gt=0)
    content_type: str
    
    @validator('filename')
    def validate_filename(cls, v: str) -> str:
        """Ensure filename has valid audio extension."""
        file_path = Path(v)
        
        if file_path.suffix.lower() not in SUPPORTED_AUDIO_EXTENSIONS:
            raise ValueError(
                f"Unsupported audio format. Supported: {', '.join(SUPPORTED_AUDIO_EXTENSIONS)}"
            )
        
        return v
    
    @validator('file_size')
    def validate_file_size(cls, v: int) -> int:
        """Ensure file size is within acceptable limits."""
        if v > MAX_AUDIO_SIZE_BYTES:
            max_mb = MAX_AUDIO_SIZE_BYTES / (1024 * 1024)
            raise ValueError(f"File size exceeds maximum of {max_mb:.0f}MB")
        
        return v
    
    @validator('content_type')
    def validate_content_type(cls, v: str) -> str:
        """Ensure content type matches audio formats."""
        if v not in SUPPORTED_AUDIO_MIME_TYPES:
            raise ValueError(f"Invalid content type: {v}")
        
        return v
