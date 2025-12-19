/**
 * useYouTubeAnalysis Hook
 * Kullanım: YouTube URL analysis flow for AI music detection page
 * Bağımlılıklar: fetch API
 */

import { useCallback, useMemo, useRef, useState } from 'react'
import type { AnalysisErrorCode, AnalysisResult, DecisionSource, ProcessingState } from '@/hooks/analysisTypes'
import { analyzeSource } from '@/hooks/analysisGateway'
import { buildFeatureScores, buildSeed, buildConfidence, buildIndicators } from '@/hooks/analysisUtils'

type ParsedSource =
  | { kind: 'youtube'; videoId: string; normalizedUrl: string; startTimeSec?: number }
  | { kind: 'spotify'; trackId: string; normalizedUrl: string }

interface BackendSummary {
  is_ai_generated: boolean
  confidence: number
  decision_source: DecisionSource
  model_version: string
  indicators: string[]
}

interface BackendResponse {
  status: 'ok' | 'partial'
  source: {
    normalized_url: string
    video_id: string
    start_time_sec?: number
    duration_sec?: number
    audio_format?: string
  }
  summary: BackendSummary
  warnings?: string[]
  errors?: string[]
  timings?: {
    total_sec?: number
  }
}

const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/

const parseTimeOffset = (raw: string | null): number | undefined => {
  if (!raw) return undefined
  const value = raw.trim().toLowerCase()
  if (/^\d+$/.test(value)) {
    return Number(value)
  }

  const matches = value.match(/(\d+)(h|m|s)/g)
  if (!matches) return undefined

  return matches.reduce((total, item) => {
    const amount = Number(item.slice(0, -1))
    const unit = item.slice(-1)
    if (unit === 'h') return total + amount * 3600
    if (unit === 'm') return total + amount * 60
    return total + amount
  }, 0)
}

const parseYouTubeUrl = (input: string): ParsedSource | null => {
  try {
    const url = new URL(input.trim())
    const host = url.hostname.toLowerCase()
    const path = url.pathname
    const params = url.searchParams

    let videoId: string | null = null

    const isYouTubeHost = host.includes('youtube.com') || host.includes('youtu.be') || host.includes('music.youtube.com')
    const isSpotifyHost = host.includes('spotify.com')
    if (!isYouTubeHost && !isSpotifyHost) {
      return null
    }

    if (isSpotifyHost) {
      const parts = path.split('/').filter(Boolean)
      const trackIndex = parts.findIndex((p) => p === 'track')
      const trackId = trackIndex >= 0 ? parts[trackIndex + 1] : null
      if (!trackId) return null
      const normalizedUrl = `https://open.spotify.com/track/${trackId}`
      return { kind: 'spotify', trackId, normalizedUrl }
    }

    if (host === 'youtu.be' || host === 'www.youtu.be') {
      videoId = path.replace('/', '').split('/')[0] || null
    } else if (host.includes('youtube.com') || host.includes('music.youtube.com')) {
      if (path === '/watch') {
        videoId = params.get('v')
      } else if (path.startsWith('/shorts/') || path.startsWith('/live/') || path.startsWith('/embed/')) {
        videoId = path.split('/')[2] || null
      }
    }

    if (!videoId || !YOUTUBE_ID_RE.test(videoId)) {
      return null
    }

    const startTimeSec = parseTimeOffset(params.get('t') || params.get('start') || params.get('time_continue'))
    const normalizedUrl = startTimeSec
      ? `https://www.youtube.com/watch?v=${videoId}&t=${startTimeSec}`
      : `https://www.youtube.com/watch?v=${videoId}`

    return {
      kind: 'youtube',
      videoId,
      normalizedUrl,
      ...(startTimeSec !== undefined ? { startTimeSec } : {})
    }
  } catch (error) {
    return null
  }
}

const buildPreviewResult = async (
  parsed: ParsedSource,
  url: string,
  elapsedSec: number,
  warnings: string[]
): Promise<AnalysisResult> => {
  const seed = await buildSeed(parsed.kind === 'spotify' ? parsed.trackId : parsed.videoId)
  const confidence = buildConfidence(seed)
  const isAIGenerated = confidence > 0.5
  const featureScores = buildFeatureScores(seed)
  
  const indicators = buildIndicators(isAIGenerated, confidence, warnings)

  return {
    isAIGenerated,
    confidence,
    processingTime: elapsedSec,
    modelVersion: 'preview-v2-enhanced',
    decisionSource: 'preview',
    source:
      parsed.kind === 'youtube'
        ? {
            kind: 'youtube',
            url,
            normalizedUrl: parsed.normalizedUrl,
            videoId: parsed.videoId,
            ...(parsed.startTimeSec !== undefined ? { startTimeSec: parsed.startTimeSec } : {})
          }
        : {
            kind: 'spotify',
            url,
            normalizedUrl: parsed.normalizedUrl,
            trackId: parsed.trackId
          },
    features: {
      ...featureScores,
      artificialIndicators: indicators
    },
    audioInfo: {
      duration: 0,
      sampleRate: 44100,
      bitrate: 192,
      format: parsed.kind === 'spotify' ? 'SPOTIFY' : 'YOUTUBE'
    }
  }
}

const mapBackendResponse = async (
  parsed: ParsedSource,
  url: string,
  response: BackendResponse,
  elapsedSec: number
): Promise<AnalysisResult> => {
  const seed = await buildSeed(parsed.kind === 'spotify' ? parsed.trackId : parsed.videoId)
  const featureScores = buildFeatureScores(seed)
  const indicators = response.summary.indicators || []
  const warnings = response.warnings || []
  const warningIndicators = warnings.length ? ['Warnings reported by the backend pipeline.'] : []

  return {
    isAIGenerated: response.summary.is_ai_generated,
    confidence: response.summary.confidence,
    processingTime: response.timings?.total_sec ?? elapsedSec,
    modelVersion: response.summary.model_version,
    decisionSource: response.summary.decision_source,
    source:
      parsed.kind === 'youtube'
        ? {
            kind: 'youtube',
            url,
            normalizedUrl: response.source.normalized_url,
            videoId: response.source.video_id,
            ...(response.source.start_time_sec !== undefined
              ? { startTimeSec: response.source.start_time_sec }
              : {})
          }
        : {
            kind: 'spotify',
            url,
            normalizedUrl: response.source.normalized_url || parsed.normalizedUrl,
            trackId: parsed.trackId
          },
    features: {
      ...featureScores,
      artificialIndicators: [...indicators, ...warningIndicators]
    },
    audioInfo: {
      duration: response.source.duration_sec ?? 0,
      sampleRate: 44100,
      bitrate: 192,
      format: response.source.audio_format ?? (parsed.kind === 'spotify' ? 'SPOTIFY' : 'YOUTUBE')
    }
  }
}

export const useYouTubeAnalysis = () => {
  const [url, setUrl] = useState('')
  const [processingState, setProcessingState] = useState<ProcessingState>('idle')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<AnalysisErrorCode | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const startTimeRef = useRef<number>(0)

  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL?.trim(), [])
  const minDurationMs = 4000

  const reset = useCallback(() => {
    setAnalysisResult(null)
    setError(null)
    setWarnings([])
    setProcessingState('idle')
  }, [])

  const runAnalysis = useCallback(async () => {
    if (!url.trim()) {
      setError('enterUrl')
      setProcessingState('error')
      return
    }

    setProcessingState('validating')
    const parsed = parseYouTubeUrl(url)
    if (!parsed) {
      setError('invalidYouTubeUrl')
      setProcessingState('error')
      return
    }

    const ensureMinDuration = async () => {
      const elapsedMs = Date.now() - startTimeRef.current
      if (elapsedMs < minDurationMs) {
        await new Promise((resolve) => setTimeout(resolve, minDurationMs - elapsedMs))
      }
    }

    const fallbackToPreview = async (warningKey?: string) => {
      await ensureMinDuration()
      const elapsedSec = (Date.now() - startTimeRef.current) / 1000
      const warningsBuffer = warningKey ? [warningKey] : []
      const result = await buildPreviewResult(parsed, url, elapsedSec, warningsBuffer)
      setAnalysisResult(result)
      setWarnings(warningsBuffer)
      setProcessingState('complete')
    }

    setError(null)
    setWarnings([])
    setAnalysisResult(null)
    startTimeRef.current = Date.now()

    setProcessingState('downloading')

    if (!apiBaseUrl) {
      fallbackToPreview('backend_not_configured')
      return
    }

    try {
      setProcessingState('analyzing')
      const { result, error: gatewayError } = await analyzeSource(apiBaseUrl, {
        sourceType: parsed.kind === 'spotify' ? 'spotify' : 'youtube',
        url
      })

      if (result) {
        await ensureMinDuration()
        setAnalysisResult(result)
        setProcessingState('complete')
        return
      }

      if (gatewayError === 'backend_not_configured' || gatewayError === 'backend_unreachable' || gatewayError === 'backend_unexpected_response') {
        fallbackToPreview(gatewayError)
      } else {
        setError(gatewayError || 'invalidYouTubeUrl')
        setProcessingState('error')
      }
    } catch (fetchError) {
      fallbackToPreview('backend_unreachable')
    }
  }, [apiBaseUrl, url])

  return {
    url,
    setUrl,
    processingState,
    analysisResult,
    error,
    warnings,
    runAnalysis,
    reset
  }
}
