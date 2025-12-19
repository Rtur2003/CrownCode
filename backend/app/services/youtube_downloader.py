"""
YouTube audio download helper using yt-dlp with validation.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

import yt_dlp

from .validation import sanitize_filename, validate_video_id


@dataclass
class DownloadResult:
    file_path: Path
    title: Optional[str]
    duration_sec: Optional[float]
    audio_format: Optional[str]
    warnings: List[str]


class YouTubeDownloader:
    def __init__(self, output_dir: Path) -> None:
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def download(self, url: str, video_id: str) -> DownloadResult:
        if not url or not url.strip():
            raise ValueError("URL cannot be empty")
        
        if not video_id or not video_id.strip():
            raise ValueError("Video ID cannot be empty")
        
        if not validate_video_id(video_id):
            raise ValueError("Invalid video ID format")
        
        warnings: List[str] = []

        info = self._download_with_ffmpeg(url, video_id)
        if info is None:
            info = self._download_without_ffmpeg(url, video_id)
            warnings.append("ffmpeg_unavailable")

        file_path = self._resolve_output_path(video_id)
        audio_format = file_path.suffix.lstrip(".") or (info.get("ext") if info else None)
        
        title = info.get("title") if info else None
        if title:
            title = sanitize_filename(title)

        return DownloadResult(
            file_path=file_path,
            title=title,
            duration_sec=info.get("duration") if info else None,
            audio_format=audio_format,
            warnings=warnings,
        )

    def _download_with_ffmpeg(self, url: str, video_id: str) -> Optional[dict]:
        safe_video_id = sanitize_filename(video_id)
        options = {
            "format": "bestaudio/best",
            "outtmpl": str(self.output_dir / f"{safe_video_id}.%(ext)s"),
            "noplaylist": True,
            "quiet": True,
            "no_warnings": True,
            "postprocessors": [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "wav",
                    "preferredquality": "192",
                }
            ],
        }
        try:
            with yt_dlp.YoutubeDL(options) as ydl:
                return ydl.extract_info(url, download=True)
        except Exception:
            return None

    def _download_without_ffmpeg(self, url: str, video_id: str) -> Optional[dict]:
        safe_video_id = sanitize_filename(video_id)
        options = {
            "format": "bestaudio[ext=m4a]/bestaudio[ext=mp3]/bestaudio",
            "outtmpl": str(self.output_dir / f"{safe_video_id}.%(ext)s"),
            "noplaylist": True,
            "quiet": True,
            "no_warnings": True,
        }
        try:
            with yt_dlp.YoutubeDL(options) as ydl:
                return ydl.extract_info(url, download=True)
        except Exception:
            return None

    def _resolve_output_path(self, video_id: str) -> Path:
        safe_video_id = sanitize_filename(video_id)
        candidates = list(self.output_dir.glob(f"{safe_video_id}.*"))
        if not candidates:
            raise FileNotFoundError("Downloaded audio file could not be located.")
        return max(candidates, key=lambda path: path.stat().st_mtime)
