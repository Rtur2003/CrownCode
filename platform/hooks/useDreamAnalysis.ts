/**
 * Dream Analysis Hook
 * Real Gemini-powered dream text analysis via the backend /api/dreams/analyze
 * endpoint. Follows the same request-staleness-guard pattern as
 * useCommend.ts / useYouTubeAnalysis.ts so a slow/late response can't
 * clobber state after the user has already reset or resubmitted.
 */

import { useState, useCallback, useMemo, useRef } from 'react'
import { fetchWithTimeout } from '@/hooks/useAsyncRequest'

export type DreamEmotion =
  | 'joy' | 'fear' | 'anxiety' | 'sadness' | 'anger' | 'confusion'
  | 'peace' | 'excitement' | 'nostalgia' | 'wonder' | 'shame' | 'love'

export interface DreamAnalysisResult {
  emotions: DreamEmotion[]
  themes: string[]
  symbols: string[]
  interpretation: string
  lucidityIndicator: boolean
}

export type DreamAnalysisState = 'idle' | 'analyzing' | 'success' | 'error'

export interface DreamAnalysisMessages {
  tooShort: string
  serviceNotConfigured: string
  serviceUnavailable: string
  analysisFailed: string
  rateLimited: string
  unknownError: string
}

const DEFAULT_MESSAGES: DreamAnalysisMessages = {
  tooShort: 'Dream description is too short to analyze.',
  serviceNotConfigured: 'Dream analysis is not configured.',
  serviceUnavailable: 'Dream analysis is temporarily unavailable.',
  analysisFailed: 'Analysis failed. Please try again.',
  rateLimited: 'Too many requests. Please wait a moment.',
  unknownError: 'Something went wrong.',
}

const ERROR_CODE_MAP: Record<string, keyof DreamAnalysisMessages> = {
  dream_too_short: 'tooShort',
  service_not_configured: 'serviceNotConfigured',
  service_unavailable: 'serviceUnavailable',
  analysis_failed: 'analysisFailed',
  rate_limit_exceeded: 'rateLimited',
}

export const useDreamAnalysis = (messages: Partial<DreamAnalysisMessages> = {}) => {
  const [dreamText, setDreamText] = useState('')
  const [state, setState] = useState<DreamAnalysisState>('idle')
  const [result, setResult] = useState<DreamAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL?.trim(), [])
  const requestIdRef = useRef(0)
  const i18nMessages = useMemo(() => ({ ...DEFAULT_MESSAGES, ...messages }), [messages])

  const reset = useCallback(() => {
    requestIdRef.current++
    setState('idle')
    setResult(null)
    setError(null)
  }, [])

  const analyzeDream = useCallback(async (language: string) => {
    const trimmed = dreamText.trim()
    if (trimmed.length < 10) {
      setError(i18nMessages.tooShort)
      setState('error')
      return
    }

    if (!apiBaseUrl) {
      setError(i18nMessages.serviceNotConfigured)
      setState('error')
      return
    }

    const currentRequestId = ++requestIdRef.current
    const isStale = () => requestIdRef.current !== currentRequestId

    setState('analyzing')
    setError(null)

    try {
      const response = await fetchWithTimeout(`${apiBaseUrl}/api/dreams/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dreamText: trimmed, language }),
        timeout: 30_000,
      })

      if (isStale()) {return}

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: {} }))
        const detail = errorData.detail
        const backendCode = typeof detail === 'object' && detail?.code ? detail.code : undefined
        const mappedKey = backendCode ? ERROR_CODE_MAP[backendCode] : undefined
        const errorMessage = mappedKey
          ? i18nMessages[mappedKey]
          : (typeof detail === 'object' && detail?.message ? detail.message : i18nMessages.analysisFailed)
        throw new Error(errorMessage)
      }

      const data: DreamAnalysisResult = await response.json()
      if (isStale()) {return}

      setResult(data)
      setState('success')
    } catch (err) {
      if (isStale()) {return}
      const message = err instanceof Error ? err.message : i18nMessages.unknownError
      setError(message)
      setState('error')
    }
  }, [dreamText, apiBaseUrl, i18nMessages])

  return {
    dreamText,
    setDreamText,
    state,
    result,
    error,
    analyzeDream,
    reset,
  }
}
