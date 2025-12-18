"""
YouTube URL parsing helpers.
"""

from __future__ import annotations

from dataclasses import dataclass
import re
from typing import Optional
from urllib.parse import parse_qs, urlparse


VIDEO_ID_RE = re.compile(r"^[a-zA-Z0-9_-]{11}$")


@dataclass(frozen=True)
class ParsedYouTubeUrl:
    video_id: str
    normalized_url: str
    start_time_sec: Optional[int] = None


def _parse_time_offset(raw: str) -> Optional[int]:
    if not raw:
        return None
    value = raw.strip().lower()
    if value.isdigit():
        return int(value)

    total = 0
    matches = re.findall(r"(\d+)(h|m|s)", value)
    if not matches:
        return None

    for amount, unit in matches:
        amount_int = int(amount)
        if unit == "h":
            total += amount_int * 3600
        elif unit == "m":
            total += amount_int * 60
        elif unit == "s":
            total += amount_int
    return total or None


def _extract_video_id(parsed_url) -> Optional[str]:
    host = parsed_url.netloc.lower()
    path = parsed_url.path or ""
    query = parse_qs(parsed_url.query)

    if host in {"youtu.be", "www.youtu.be"}:
        candidate = path.strip("/").split("/")[0]
        return candidate or None

    if "youtube.com" in host or "music.youtube.com" in host:
        if path == "/watch":
            return query.get("v", [None])[0]
        if path.startswith("/shorts/") or path.startswith("/live/") or path.startswith("/embed/"):
            parts = path.strip("/").split("/")
            return parts[1] if len(parts) > 1 else None

    return None


def parse_youtube_url(url: str) -> ParsedYouTubeUrl:
    if not url or not url.strip():
        raise ValueError("URL is empty.")

    parsed = urlparse(url.strip())
    if parsed.scheme not in {"http", "https"}:
        raise ValueError("URL must start with http:// or https://")

    video_id = _extract_video_id(parsed)
    if not video_id or not VIDEO_ID_RE.match(video_id):
        raise ValueError("Invalid or missing YouTube video ID.")

    query = parse_qs(parsed.query)
    start_raw = query.get("t", [None])[0] or query.get("start", [None])[0] or query.get("time_continue", [None])[0]
    start_time_sec = _parse_time_offset(start_raw) if start_raw else None

    normalized_url = f"https://www.youtube.com/watch?v={video_id}"
    if start_time_sec:
        normalized_url = f"{normalized_url}&t={start_time_sec}"

    return ParsedYouTubeUrl(
        video_id=video_id,
        normalized_url=normalized_url,
        start_time_sec=start_time_sec,
    )
