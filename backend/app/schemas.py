"""
Pydantic schemas for YouTube analysis endpoints.
"""

from __future__ import annotations

from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class YouTubeAnalyzeRequest(BaseModel):
    url: str = Field(..., description="YouTube video URL")
    include_raw: bool = Field(
        default=False,
        description="Include raw service responses in output",
    )


class YouTubeSource(BaseModel):
    url: str
    normalized_url: str
    video_id: str
    start_time_sec: Optional[int] = None
    title: Optional[str] = None
    duration_sec: Optional[float] = None
    audio_format: Optional[str] = None


class AnalysisSummary(BaseModel):
    is_ai_generated: bool
    confidence: float = Field(..., ge=0.0, le=1.0)
    decision_source: Literal["music_ai", "ses_analizi", "preview"]
    model_version: str
    indicators: List[str]


class ServiceResult(BaseModel):
    available: bool
    response: Optional[Dict[str, object]] = None
    error: Optional[str] = None


class YouTubeAnalyzeResponse(BaseModel):
    request_id: str
    status: Literal["ok", "partial"]
    source: YouTubeSource
    summary: AnalysisSummary
    music_ai: ServiceResult
    ses_analizi: ServiceResult
    warnings: List[str]
    errors: List[str]
    timings: Dict[str, float]


class AudioAugmentationOptions(BaseModel):
    pitch_shift: bool = Field(default=False, description="Apply random pitch shifting")
    speed_change: bool = Field(default=False, description="Apply random speed change")
    bass_boost: bool = Field(default=False, description="Apply bass boost equalization")
    trim_silence: bool = Field(default=False, description="Trim leading and trailing silence")
    mix_audio: bool = Field(default=False, description="Mix with another audio track (placeholder)")
    add_noise: bool = Field(default=False, description="Add Gaussian noise")
