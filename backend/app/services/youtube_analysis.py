"""
YouTube analysis orchestration for CrownCode.
"""

from __future__ import annotations

import asyncio
import os
from pathlib import Path
import tempfile
import time
import uuid
from typing import List

from .external_clients import ClientResponse, MusicAIDetectorClient, SesAnaliziClient
from .url_parser import parse_youtube_url
from .youtube_downloader import YouTubeDownloader
from ..schemas import AnalysisSummary, ServiceResult, YouTubeAnalyzeResponse, YouTubeSource


def _fnv1a_32(value: str) -> int:
    hash_value = 0x811C9DC5
    for char in value:
        hash_value ^= ord(char)
        hash_value = (hash_value * 0x01000193) & 0xFFFFFFFF
    return hash_value


def _preview_summary(video_id: str, warnings: List[str]) -> AnalysisSummary:
    seed = (_fnv1a_32(video_id) % 1000) / 1000.0
    is_ai = seed > 0.5
    confidence = 0.55 + seed * 0.35
    indicators = [
        "Preview-only decision based on URL fingerprint.",
        "No model inference was available at request time.",
    ]
    if warnings:
        indicators.append("Warnings present: " + ", ".join(warnings))

    return AnalysisSummary(
        is_ai_generated=is_ai,
        confidence=round(confidence, 4),
        decision_source="preview",
        model_version="youtube-preview-v1",
        indicators=indicators,
    )


class YouTubeAnalysisService:
    def __init__(self) -> None:
        timeout_sec = float(os.getenv("CROWNCODE_API_TIMEOUT_SEC", "30"))
        self.music_ai = MusicAIDetectorClient(timeout_sec=timeout_sec)
        self.ses_analizi = SesAnaliziClient(timeout_sec=timeout_sec)
        self.auth_threshold = float(os.getenv("SES_ANALIZI_THRESHOLD", "0.5"))

    async def analyze(self, url: str, include_raw: bool = False) -> YouTubeAnalyzeResponse:
        request_id = uuid.uuid4().hex
        warnings: List[str] = []
        errors: List[str] = []
        timings = {"download_sec": 0.0, "analysis_sec": 0.0, "total_sec": 0.0}

        start_total = time.monotonic()
        parsed = parse_youtube_url(url)

        with tempfile.TemporaryDirectory() as tmp_dir:
            downloader = YouTubeDownloader(output_dir=Path(tmp_dir))
            start_download = time.monotonic()
            try:
                download_result = downloader.download(parsed.normalized_url, parsed.video_id)
            except Exception as exc:
                errors.append(f"download_failed: {exc}")
                timings["total_sec"] = round(time.monotonic() - start_total, 4)
                summary = _preview_summary(parsed.video_id, warnings)
                source = YouTubeSource(
                    url=url,
                    normalized_url=parsed.normalized_url,
                    video_id=parsed.video_id,
                    start_time_sec=parsed.start_time_sec,
                )
                return YouTubeAnalyzeResponse(
                    request_id=request_id,
                    status="partial",
                    source=source,
                    summary=summary,
                    music_ai=ServiceResult(available=False, response=None, error="download_failed"),
                    ses_analizi=ServiceResult(available=False, response=None, error="download_failed"),
                    warnings=warnings,
                    errors=errors,
                    timings=timings,
                )

            timings["download_sec"] = round(time.monotonic() - start_download, 4)
            warnings.extend(download_result.warnings)

            start_analysis = time.monotonic()
            audio_ext = download_result.file_path.suffix.lower()
            music_supported = audio_ext in {".mp3", ".wav", ".flac", ".ogg", ".m4a"}
            ses_supported = audio_ext in {".mp3", ".wav", ".flac", ".ogg", ".m4a", ".webm", ".opus"}

            music_ai_result = (
                ClientResponse(available=False, response=None, error="music_ai_unsupported_format")
                if not music_supported
                else None
            )
            ses_result = (
                ClientResponse(available=False, response=None, error="ses_analizi_unsupported_format")
                if not ses_supported
                else None
            )

            music_task = asyncio.create_task(self.music_ai.predict(download_result.file_path)) if music_supported else None
            ses_task = asyncio.create_task(self.ses_analizi.analyze(download_result.file_path)) if ses_supported else None

            if music_task and ses_task:
                music_ai_result, ses_result = await asyncio.gather(music_task, ses_task)
            elif music_task:
                music_ai_result = await music_task
            elif ses_task:
                ses_result = await ses_task

            if music_ai_result is None:
                music_ai_result = ClientResponse(available=False, response=None, error="music_ai_unavailable")
            if ses_result is None:
                ses_result = ClientResponse(available=False, response=None, error="ses_analizi_unavailable")

            timings["analysis_sec"] = round(time.monotonic() - start_analysis, 4)

        if not music_ai_result.available:
            if music_ai_result.error == "music_ai_unsupported_format":
                warnings.append("music_ai_unsupported_format")
            else:
                warnings.append("music_ai_unavailable")
        elif music_ai_result.error:
            warnings.append("music_ai_failed")

        if not ses_result.available:
            if ses_result.error == "ses_analizi_unsupported_format":
                warnings.append("ses_analizi_unsupported_format")
            else:
                warnings.append("ses_analizi_unavailable")
        elif ses_result.error:
            warnings.append("ses_analizi_failed")

        summary = self._build_summary(music_ai_result, ses_result, parsed.video_id, warnings)
        timings["total_sec"] = round(time.monotonic() - start_total, 4)

        if music_ai_result.error and music_ai_result.error not in {"music_ai_not_configured", "music_ai_unsupported_format"}:
            errors.append(music_ai_result.error)
        if ses_result.error and ses_result.error not in {"ses_analizi_not_configured", "ses_analizi_unsupported_format"}:
            errors.append(ses_result.error)

        status = "ok" if not errors else "partial"

        source = YouTubeSource(
            url=url,
            normalized_url=parsed.normalized_url,
            video_id=parsed.video_id,
            start_time_sec=parsed.start_time_sec,
            title=download_result.title,
            duration_sec=download_result.duration_sec,
            audio_format=download_result.audio_format,
        )

        music_payload = music_ai_result.response if include_raw else None
        ses_payload = ses_result.response if include_raw else None

        return YouTubeAnalyzeResponse(
            request_id=request_id,
            status=status,
            source=source,
            summary=summary,
            music_ai=ServiceResult(
                available=music_ai_result.available,
                response=music_payload,
                error=music_ai_result.error,
            ),
            ses_analizi=ServiceResult(
                available=ses_result.available,
                response=ses_payload,
                error=ses_result.error,
            ),
            warnings=warnings,
            errors=errors,
            timings=timings,
        )

    def _build_summary(self, music_ai, ses_result, video_id: str, warnings: List[str]) -> AnalysisSummary:
        if music_ai.response and isinstance(music_ai.response, dict):
            prediction = music_ai.response.get("prediction")
            confidence = music_ai.response.get("confidence")
            if prediction in {"AI", "Human"} and isinstance(confidence, (int, float)):
                indicators = [
                    "Decision based on Music-AI Detector response.",
                    f"Prediction: {prediction}",
                ]
                return AnalysisSummary(
                    is_ai_generated=prediction == "AI",
                    confidence=float(confidence),
                    decision_source="music_ai",
                    model_version="music-ai-detector",
                    indicators=indicators,
                )

        if ses_result.response and isinstance(ses_result.response, dict):
            authenticity = ses_result.response.get("authenticity_score")
            if isinstance(authenticity, (int, float)):
                is_ai = float(authenticity) >= self.auth_threshold
                indicators = [
                    "Decision based on Ses-Analizi authenticity score.",
                    f"Authenticity score: {float(authenticity):.3f}",
                ]
                return AnalysisSummary(
                    is_ai_generated=is_ai,
                    confidence=float(authenticity),
                    decision_source="ses_analizi",
                    model_version="ses-analizi-authenticity",
                    indicators=indicators,
                )

        return _preview_summary(video_id, warnings)
