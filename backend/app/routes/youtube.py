"""
YouTube analysis route for CrownCode.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..schemas import YouTubeAnalyzeRequest, YouTubeAnalyzeResponse
from ..services.youtube_analysis import YouTubeAnalysisService


router = APIRouter()
service = YouTubeAnalysisService()


@router.post("/api/youtube/analyze", response_model=YouTubeAnalyzeResponse)
async def analyze_youtube(payload: YouTubeAnalyzeRequest) -> YouTubeAnalyzeResponse:
    try:
        return await service.analyze(payload.url, include_raw=payload.include_raw)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
