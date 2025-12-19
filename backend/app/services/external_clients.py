"""
HTTP clients for external analysis services with enhanced validation.
"""

from __future__ import annotations

from dataclasses import dataclass
import os
from pathlib import Path
from typing import Optional

import httpx

from .validation import validate_audio_path, validate_timeout


@dataclass
class ClientResponse:
    available: bool
    response: Optional[dict]
    error: Optional[str]


class MusicAIDetectorClient:
    def __init__(self, base_url: Optional[str] = None, timeout_sec: float = 30.0) -> None:
        self.base_url = base_url or os.getenv("MUSIC_AI_API_URL")
        
        if not validate_timeout(timeout_sec):
            timeout_sec = 30.0
        
        self.timeout_sec = timeout_sec

    async def predict(self, audio_path: Path) -> ClientResponse:
        if not self.base_url:
            return ClientResponse(available=False, response=None, error="music_ai_not_configured")
        
        is_valid, error_msg = validate_audio_path(audio_path)
        if not is_valid:
            return ClientResponse(available=True, response=None, error=f"music_ai_{error_msg}")

        try:
            async with httpx.AsyncClient(timeout=self.timeout_sec) as client:
                with audio_path.open("rb") as handle:
                    files = {"file": (audio_path.name, handle, _guess_content_type(audio_path))}
                    response = await client.post(f"{self.base_url.rstrip('/')}/predict", files=files)
            if response.status_code != 200:
                return ClientResponse(
                    available=True,
                    response=None,
                    error=f"music_ai_http_{response.status_code}",
                )
            return ClientResponse(available=True, response=response.json(), error=None)
        except httpx.TimeoutException:
            return ClientResponse(available=True, response=None, error="music_ai_timeout")
        except httpx.NetworkError as exc:
            return ClientResponse(available=True, response=None, error=f"music_ai_network_error: {type(exc).__name__}")
        except OSError as exc:
            return ClientResponse(available=True, response=None, error=f"music_ai_file_error: {type(exc).__name__}")
        except Exception as exc:
            return ClientResponse(available=True, response=None, error=f"music_ai_error: {type(exc).__name__}")


class SesAnaliziClient:
    def __init__(self, base_url: Optional[str] = None, timeout_sec: float = 30.0) -> None:
        self.base_url = base_url or os.getenv("SES_ANALIZI_API_URL")
        
        if not validate_timeout(timeout_sec):
            timeout_sec = 30.0
        
        self.timeout_sec = timeout_sec

    async def analyze(self, audio_path: Path) -> ClientResponse:
        if not self.base_url:
            return ClientResponse(available=False, response=None, error="ses_analizi_not_configured")
        
        is_valid, error_msg = validate_audio_path(audio_path)
        if not is_valid:
            return ClientResponse(available=True, response=None, error=f"ses_analizi_{error_msg}")

        try:
            async with httpx.AsyncClient(timeout=self.timeout_sec) as client:
                with audio_path.open("rb") as handle:
                    files = {"file": (audio_path.name, handle, _guess_content_type(audio_path))}
                    response = await client.post(f"{self.base_url.rstrip('/')}/analyze", files=files)
            if response.status_code != 200:
                return ClientResponse(
                    available=True,
                    response=None,
                    error=f"ses_analizi_http_{response.status_code}",
                )
            return ClientResponse(available=True, response=response.json(), error=None)
        except httpx.TimeoutException:
            return ClientResponse(available=True, response=None, error="ses_analizi_timeout")
        except httpx.NetworkError as exc:
            return ClientResponse(available=True, response=None, error=f"ses_analizi_network_error: {type(exc).__name__}")
        except OSError as exc:
            return ClientResponse(available=True, response=None, error=f"ses_analizi_file_error: {type(exc).__name__}")
        except Exception as exc:
            return ClientResponse(available=True, response=None, error=f"ses_analizi_error: {type(exc).__name__}")


def service_status() -> dict:
    return {
        "music_ai": {
            "configured": bool(os.getenv("MUSIC_AI_API_URL")),
            "base_url": os.getenv("MUSIC_AI_API_URL"),
        },
        "ses_analizi": {
            "configured": bool(os.getenv("SES_ANALIZI_API_URL")),
            "base_url": os.getenv("SES_ANALIZI_API_URL"),
        },
    }


def _guess_content_type(path: Path) -> str:
    ext = path.suffix.lower()
    if ext == ".wav":
        return "audio/wav"
    if ext in {".mp3", ".m4a"}:
        return "audio/mpeg"
    if ext == ".flac":
        return "audio/flac"
    if ext == ".ogg":
        return "audio/ogg"
    if ext == ".webm":
        return "audio/webm"
    if ext == ".opus":
        return "audio/opus"
    return "application/octet-stream"
