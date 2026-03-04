"""Unit tests for YouTube URL parser."""

import pytest

from app.services.url_parser import parse_youtube_url, ParsedYouTubeUrl, _parse_time_offset


class TestParseYouTubeUrl:
    """Happy-path: various valid YouTube URL formats."""

    def test_standard_watch_url(self):
        result = parse_youtube_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        assert result.video_id == "dQw4w9WgXcQ"
        assert result.normalized_url == "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        assert result.start_time_sec is None

    def test_short_url(self):
        result = parse_youtube_url("https://youtu.be/dQw4w9WgXcQ")
        assert result.video_id == "dQw4w9WgXcQ"

    def test_mobile_url(self):
        result = parse_youtube_url("https://m.youtube.com/watch?v=dQw4w9WgXcQ")
        assert result.video_id == "dQw4w9WgXcQ"

    def test_music_url(self):
        result = parse_youtube_url("https://music.youtube.com/watch?v=dQw4w9WgXcQ")
        assert result.video_id == "dQw4w9WgXcQ"

    def test_shorts_url(self):
        result = parse_youtube_url("https://www.youtube.com/shorts/dQw4w9WgXcQ")
        assert result.video_id == "dQw4w9WgXcQ"

    def test_embed_url(self):
        result = parse_youtube_url("https://www.youtube.com/embed/dQw4w9WgXcQ")
        assert result.video_id == "dQw4w9WgXcQ"

    def test_live_url(self):
        result = parse_youtube_url("https://www.youtube.com/live/dQw4w9WgXcQ")
        assert result.video_id == "dQw4w9WgXcQ"

    def test_time_offset_seconds(self):
        result = parse_youtube_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90")
        assert result.start_time_sec == 90
        assert "&t=90" in result.normalized_url

    def test_time_offset_hms(self):
        result = parse_youtube_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1h30m45s")
        assert result.start_time_sec == 5445

    def test_http_upgraded(self):
        result = parse_youtube_url("http://www.youtube.com/watch?v=dQw4w9WgXcQ")
        assert result.video_id == "dQw4w9WgXcQ"
        assert result.normalized_url.startswith("https://")


class TestParseYouTubeUrlErrors:
    """Error cases: invalid or non-YouTube URLs."""

    def test_empty_string(self):
        with pytest.raises(ValueError, match="empty"):
            parse_youtube_url("")

    def test_non_youtube_host(self):
        with pytest.raises(ValueError, match="video ID"):
            parse_youtube_url("https://vimeo.com/12345678")

    def test_missing_video_id(self):
        with pytest.raises(ValueError, match="video ID"):
            parse_youtube_url("https://www.youtube.com/watch")

    def test_invalid_scheme(self):
        with pytest.raises(ValueError, match="http"):
            parse_youtube_url("ftp://youtube.com/watch?v=dQw4w9WgXcQ")

    def test_subdomain_bypass_rejected(self):
        """Ensure evil-youtube.com doesn't match."""
        with pytest.raises(ValueError, match="video ID"):
            parse_youtube_url("https://evil-youtube.com/watch?v=dQw4w9WgXcQ")


class TestParseTimeOffset:
    def test_pure_digits(self):
        assert _parse_time_offset("120") == 120

    def test_hms_format(self):
        assert _parse_time_offset("1h2m3s") == 3723

    def test_empty_returns_none(self):
        assert _parse_time_offset("") is None

    def test_no_match_returns_none(self):
        assert _parse_time_offset("abc") is None
