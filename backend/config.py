"""
Configuration Management for CrownCode Backend

Centralized configuration with environment variable support.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    app_name: str = "CrownCode API"
    app_version: str = "1.0.0"
    environment: str = "development"
    debug: bool = False
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_prefix: str = "/api/v1"
    
    # CORS Configuration
    cors_origins: list = ["*"]
    
    # Model Configuration
    model_path: str = "./models"
    model_cache_dir: str = "./cache"
    
    # Audio Processing
    max_audio_size_mb: int = 50
    supported_audio_formats: list = [".mp3", ".wav", ".flac", ".m4a", ".ogg"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
