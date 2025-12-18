/**
 * useYouTubeAnalysis Hook
 * Kullanım: YouTube URL analysis flow for AI music detection page
 * Bağımlılıklar: fetch API
 */

import { useCallback, useMemo, useRef, useState } from 'react'
import type { AnalysisErrorCode, AnalysisResult, DecisionSource, ProcessingState } from '@/hooks/analysisTypes'
import { analyzeSource } from '@/hooks/analysisGateway'
import { buildFeatureScores, buildSeed, previewIndicators } from '@/hooks/analysisUtils'

interface ParsedYouTubeUrl {
  videoId: string
  normalizedUrl: string
  startTimeSec?: number
}

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

const parseYouTubeUrl = (input: string): ParsedYouTubeUrl | null => {
  try {
    const url = new URL(input.trim())
    const host = url.hostname.toLowerCase()
    const path = url.pathname
    const params = url.searchParams

    let videoId: string | null = null

    const isYouTubeHost = host.includes('youtube.com') || host.includes('youtu.be') || host.includes('music.youtube.com')
    if (!isYouTubeHost) {
      return null
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

    const parsed: ParsedYouTubeUrl = {
      videoId,
      normalizedUrl,
      ...(startTimeSec !== undefined ? { startTimeSec } : {})
    }

    return parsed
  } catch (error) {
    return null
  }
}

const buildPreviewResult = (
  parsed: ParsedYouTubeUrl,
  url: string,
  elapsedSec: number,
  warnings: string[]
): AnalysisResult => {
  const seed = buildSeed(parsed.videoId)
  const isAIGenerated = seed > 0.5
  const baseConfidence = 0.55 + seed * 0.35
  const confidence = Number(Math.min(0.97, Math.max(0.51, baseConfidence + (Math.random() - 0.5) * 0.08)).toFixed(3))
  const featureScores = buildFeatureScores(seed)

  const indicators = previewIndicators()
  if (warnings.length) {
    indicators.push('Warnings reported by the backend pipeline.')
  }

  return {
    isAIGenerated,
    confidence,
    processingTime: elapsedSec,
    modelVersion: 'youtube-preview-v1',
    decisionSource: 'preview',
    source: {
      kind: 'youtube',
      url,
      normalizedUrl: parsed.normalizedUrl,
      videoId: parsed.videoId,
      ...(parsed.startTimeSec !== undefined ? { startTimeSec: parsed.startTimeSec } : {})
    },
    features: {
      ...featureScores,
      artificialIndicators: indicators
    },
    audioInfo: {
      duration: 0,
      sampleRate: 44100,
      bitrate: 192,
      format: 'YOUTUBE'
    }
  }
}

const mapBackendResponse = (
  parsed: ParsedYouTubeUrl,
  url: string,
  response: BackendResponse,
  elapsedSec: number
): AnalysisResult => {
  const seed = buildSeed(parsed.videoId)
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
    source: {
      kind: 'youtube',
      url,
      normalizedUrl: response.source.normalized_url,
      videoId: response.source.video_id,
      ...(response.source.start_time_sec !== undefined
        ? { startTimeSec: response.source.start_time_sec }
        : {})
    },
    features: {
      ...featureScores,
      artificialIndicators: [...indicators, ...warningIndicators]
    },
    audioInfo: {
      duration: response.source.duration_sec ?? 0,
      sampleRate: 44100,
      bitrate: 192,
      format: response.source.audio_format ?? 'YOUTUBE'
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

    const fallbackToPreview = (warningKey?: string) => {
      const elapsedSec = (Date.now() - startTimeRef.current) / 1000
      const warningsBuffer = warningKey ? [warningKey] : []
      setAnalysisResult(buildPreviewResult(parsed, url, elapsedSec, warningsBuffer))
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
        sourceType: 'youtube',
        url
      })

      if (result) {
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
