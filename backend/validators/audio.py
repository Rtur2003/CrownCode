"""
Audio File Validation

Validates audio file uploads before processing.
"""
from pathlib import Path
from typing import Optional
from pydantic import BaseModel, Field, validator


class AudioFileValidator(BaseModel):
    """Validation schema for audio file uploads."""
    
    filename: str = Field(..., min_length=1, max_length=255)
    file_size: int = Field(..., gt=0)
    content_type: str
    
    @validator('filename')
    def validate_filename(cls, v):
        """Ensure filename has valid audio extension."""
        supported_extensions = ['.mp3', '.wav', '.flac', '.m4a', '.ogg']
        file_path = Path(v)
        
        if file_path.suffix.lower() not in supported_extensions:
            raise ValueError(
                f"Unsupported audio format. Supported: {', '.join(supported_extensions)}"
            )
        
        return v
    
    @validator('file_size')
    def validate_file_size(cls, v):
        """Ensure file size is within acceptable limits."""
        max_size_bytes = 50 * 1024 * 1024
        
        if v > max_size_bytes:
            raise ValueError(f"File size exceeds maximum of 50MB")
        
        return v
    
    @validator('content_type')
    def validate_content_type(cls, v):
        """Ensure content type matches audio formats."""
        valid_types = [
            'audio/mpeg',
            'audio/wav',
            'audio/x-wav',
            'audio/flac',
            'audio/mp4',
            'audio/ogg'
        ]
        
        if v not in valid_types:
            raise ValueError(f"Invalid content type: {v}")
        
        return v
