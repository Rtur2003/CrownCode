"""
YouTube audio download helper using yt-dlp.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import TYPE_CHECKING, Any, List, Optional
import re
import logging

if TYPE_CHECKING:  # pragma: no cover
    import yt_dlp

logger = logging.getLogger(__name__)


# yt-dlp agir ve opsiyonel bir bagimlilik. Modul seviyesinde import edilirse
# kurulu olmadiginda app/main.py zincirle patliyor ve /health dahil TUM API
# ayaga kalkmiyordu. Ilk kullanimda yuklenir.
def _load_yt_dlp() -> "Any":
    try:
        import yt_dlp as _mod
    except ModuleNotFoundError as exc:  # pragma: no cover
        raise RuntimeError(
            "yt-dlp kurulu degil; YouTube analizi kullanilamaz."
            " Kurulum: pip install yt-dlp"
        ) from exc
    return _mod


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
        warnings: List[str] = []

        info = self._download_with_ffmpeg(url)
        if info is None:
            info = self._download_without_ffmpeg(url)
            warnings.append("ffmpeg_unavailable")

        file_path = self._resolve_output_path(video_id)

        return DownloadResult(
            file_path=file_path,
            title=info.get("title") if info else None,
            duration_sec=info.get("duration") if info else None,
            audio_format=info.get("ext") if info else None,
            warnings=warnings,
        )

    def _download_with_ffmpeg(self, url: str) -> Optional[dict]:
        options = {
            "format": "bestaudio/best",
            "outtmpl": str(self.output_dir / "%(id)s.%(ext)s"),
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
            yt_dlp = _load_yt_dlp()
            with yt_dlp.YoutubeDL(options) as ydl:
                return ydl.extract_info(url, download=True)
        except Exception as exc:
            logger.debug(f"FFmpeg download attempt failed: {exc}")
            return None

    def _download_without_ffmpeg(self, url: str) -> Optional[dict]:
        options = {
            "format": "bestaudio/best",
            "outtmpl": str(self.output_dir / "%(id)s.%(ext)s"),
            "noplaylist": True,
            "quiet": True,
            "no_warnings": True,
        }
        yt_dlp = _load_yt_dlp()
        with yt_dlp.YoutubeDL(options) as ydl:
            return ydl.extract_info(url, download=True)

    def _resolve_output_path(self, video_id: str) -> Path:
        if not re.match(r'^[a-zA-Z0-9_-]{11}$', video_id):
            raise ValueError("Invalid video ID format")
        candidates = list(self.output_dir.glob(f"{video_id}.*"))
        if not candidates:
            raise FileNotFoundError("Downloaded audio file could not be located.")
        return max(candidates, key=lambda path: path.stat().st_mtime)
