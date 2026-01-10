"""
Application Constants

Centralized constants for the CrownCode backend.
"""
from typing import List

# Audio Processing Constants
MAX_AUDIO_SIZE_MB: int = 50
MAX_AUDIO_SIZE_BYTES: int = MAX_AUDIO_SIZE_MB * 1024 * 1024
MIN_AUDIO_SIZE_BYTES: int = 1024  # 1 KB minimum

# Supported Audio Formats
SUPPORTED_AUDIO_EXTENSIONS: List[str] = ['.mp3', '.wav', '.flac', '.m4a', '.ogg']
SUPPORTED_AUDIO_MIME_TYPES: List[str] = [
    'audio/mpeg',
    'audio/wav',
    'audio/x-wav',
    'audio/flac',
    'audio/mp4',
    'audio/m4a',
    'audio/ogg',
    'audio/vorbis'
]

# File Validation Constants
MAX_FILENAME_LENGTH: int = 255
DANGEROUS_FILE_PATTERNS: List[str] = [
    '..', '\0', '<', '>', ':', '"', '|', '?', '*'
]

# Model Configuration
DEFAULT_SAMPLE_RATE: int = 16000
DEFAULT_MODEL_VERSION: str = "demo-interface-v1.0"

# System Limits
MAX_CONCURRENT_ANALYSES: int = 10
ANALYSIS_TIMEOUT_SECONDS: int = 300  # 5 minutes

# Logging
LOG_RETENTION_DAYS: int = 30
LOG_ROTATION_INTERVAL: str = "1 day"
