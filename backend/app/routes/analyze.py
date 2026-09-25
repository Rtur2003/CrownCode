"""
POST /api/analyze — the endpoint the AURIS page calls (multipart form).

Contract: docs/BACKEND_CONTRACT.md. Errors are returned as 200 with an
`errors` list so the frontend can map them to localized messages.
"""

from __future__ import annotations

import asyncio
import logging
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, Form, UploadFile

from ..services.audio_analysis import AudioDecodeError, analyze_path
from ..services.url_parser import parse_youtube_url
from ..services.youtube_downloader import YouTubeDownloader

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_BYTES = 30 * 1024 * 1024
MIN_BYTES = 1024
ALLOWED_EXT = {".mp3", ".wav", ".flac", ".m4a", ".mp4", ".aac", ".ogg", ".opus", ".webm"}


def _fail(*codes: str) -> dict:
    return {"result": None, "warnings": [], "errors": list(codes)}


def _decode_error(exc: AudioDecodeError) -> dict:
    code = str(exc)
    if code == "audio_too_short":
        return _fail("file_too_small")
    if code in {"decode_failed", "decode_timeout"}:
        return _fail("invalid_file_type")
    return _fail("internal_error")


async def _analyze_upload(file: UploadFile) -> dict:
    name = Path(file.filename or "").name
    ext = Path(name).suffix.lower()
    if ext not in ALLOWED_EXT:
        return _fail("invalid_file_type")

    data = await file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        return _fail("file_too_large")
    if len(data) < MIN_BYTES:
        return _fail("file_too_small")

    with tempfile.TemporaryDirectory(prefix="auris_") as tmp:
        path = Path(tmp) / f"upload{ext}"
        path.write_bytes(data)
        source = {
            "kind": "file",
            "fileName": name,
            "fileSizeBytes": len(data),
            "mimeType": file.content_type or "application/octet-stream",
        }
        try:
            result = await asyncio.to_thread(analyze_path, path, source)
        except AudioDecodeError as exc:
            return _decode_error(exc)
    return {"result": result, "warnings": [], "errors": []}


async def _analyze_youtube(url: str) -> dict:
    try:
        parsed = parse_youtube_url(url)
    except ValueError:
        return _fail("invalid_youtube_url")

    with tempfile.TemporaryDirectory(prefix="auris_yt_") as tmp:
        downloader = YouTubeDownloader(Path(tmp))
        try:
            download = await asyncio.to_thread(downloader.download, parsed.normalized_url, parsed.video_id)
        except Exception as exc:  # yt-dlp raises many types
            message = str(exc).lower()
            if "sign in" in message or "cookies" in message or "bot" in message:
                return _fail("youtube_authentication_required")
            logger.warning("youtube download failed: %s", exc)
            return _fail("youtube_analysis_failed")

        source = {
            "kind": "youtube",
            "url": url,
            "normalizedUrl": parsed.normalized_url,
            "videoId": parsed.video_id,
            **({"startTimeSec": parsed.start_time_sec} if parsed.start_time_sec else {}),
        }
        try:
            result = await asyncio.to_thread(analyze_path, download.file_path, source, download.audio_format)
        except AudioDecodeError as exc:
            return _decode_error(exc)
    return {"result": result, "warnings": download.warnings, "errors": []}


@router.post("/api/analyze")
async def analyze(
    sourceType: str = Form(...),
    url: Optional[str] = Form(default=None),
    file: Optional[UploadFile] = File(default=None),
) -> dict:
    if sourceType == "file":
        return await _analyze_upload(file) if file else _fail("missing_file")
    if sourceType == "youtube":
        return await _analyze_youtube(url.strip()) if url and url.strip() else _fail("missing_url")
    if sourceType in {"spotify", "apple"}:
        return _fail("unsupported_source")
    return _fail("invalid_source_type")
