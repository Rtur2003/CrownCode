/**
 * Creator Studio AI Remix Hook
 * Blends two uploaded tracks via the backend's real DSP remix engine —
 * tempo/key detection, time-stretch/pitch-shift matching, crossfade blend.
 */

import { useState, useCallback, useMemo, useRef } from 'react'
import { fetchWithTimeout } from '@/hooks/useAsyncRequest'

export type RemixCrossfadeCurve = 'equal_power' | 'linear'

export interface RemixOptions {
  matchTempo: boolean
  matchKey: boolean
  crossfadeSeconds: number
  crossfadeCurve: RemixCrossfadeCurve
}

export interface RemixAnalysis {
  trackABpm: number
  trackBBpm: number
  trackAKey: string
  trackBKey: string
  appliedStretchRate: number
  appliedPitchShiftSemitones: number
  outputDurationSec: number
}

export type RemixState = 'idle' | 'processing' | 'success' | 'error'

export interface RemixError {
  code: string
  message: string
}

export interface RemixMessages {
  missingTracks: string
  apiNotConfigured: string
  invalidFileType: string
  fileTooLarge: string
  rateLimitExceeded: string
  validationError: string
  remixFailed: string
}

const DEFAULT_MESSAGES: RemixMessages = {
  missingTracks: 'Please select two audio tracks to blend',
  apiNotConfigured: 'API not configured',
  invalidFileType: 'One of the files is not a supported audio format',
  fileTooLarge: 'File too large (max 30 MB per track)',
  rateLimitExceeded: 'Too many remix requests. Please wait before trying again.',
  validationError: 'One of the tracks could not be processed',
  remixFailed: 'Failed to blend the tracks',
}

const ERROR_CODE_MAP: Record<string, keyof RemixMessages> = {
  invalid_file_type: 'invalidFileType',
  file_too_large: 'fileTooLarge',
  rate_limit_exceeded: 'rateLimitExceeded',
  validation_error: 'validationError',
  internal_error: 'remixFailed',
}

const DEFAULT_OPTIONS: RemixOptions = {
  matchTempo: true,
  matchKey: false,
  crossfadeSeconds: 4,
  crossfadeCurve: 'equal_power',
}

export const useRemixStudio = (messages: Partial<RemixMessages> = {}) => {
  const [trackA, setTrackA] = useState<File | null>(null)
  const [trackB, setTrackB] = useState<File | null>(null)
  const [options, setOptions] = useState<RemixOptions>(DEFAULT_OPTIONS)
  const [state, setState] = useState<RemixState>('idle')
  const [error, setError] = useState<RemixError | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<RemixAnalysis | null>(null)

  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL?.trim(), [])
  const requestIdRef = useRef(0)
  const resultUrlRef = useRef<string | null>(null)
  const i18nMessages = useMemo(() => ({ ...DEFAULT_MESSAGES, ...messages }), [messages])

  const reset = useCallback(() => {
    requestIdRef.current++
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current)
      resultUrlRef.current = null
    }
    setState('idle')
    setError(null)
    setResultUrl(null)
    setAnalysis(null)
  }, [])

  const blend = useCallback(async () => {
    if (!trackA || !trackB) {
      setError({ code: 'missing_tracks', message: i18nMessages.missingTracks })
      setState('error')
      return
    }

    if (!apiBaseUrl) {
      setError({ code: 'no_api', message: i18nMessages.apiNotConfigured })
      setState('error')
      return
    }

    const currentRequestId = ++requestIdRef.current
    const isStale = () => requestIdRef.current !== currentRequestId

    setState('processing')
    setError(null)

    const formData = new FormData()
    formData.append('track_a', trackA)
    formData.append('track_b', trackB)
    formData.append('options', JSON.stringify(options))

    try {
      const response = await fetchWithTimeout(`${apiBaseUrl}/api/remix/blend`, {
        method: 'POST',
        body: formData,
        timeout: 120_000,
      })

      if (isStale()) {return}

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: {} }))
        const detail = errorData.detail
        const backendCode = typeof detail === 'object' && detail?.code ? detail.code : undefined
        const key = backendCode ? ERROR_CODE_MAP[backendCode] : undefined
        const errorMessage = key ? i18nMessages[key] : (typeof detail === 'string' ? detail : i18nMessages.remixFailed)
        setError({ code: backendCode || 'remix_failed', message: errorMessage })
        setState('error')
        return
      }

      const analysisHeader = response.headers.get('X-Remix-Analysis')
      const blob = await response.blob()

      if (isStale()) {return}

      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current)
      }
      const url = URL.createObjectURL(blob)
      resultUrlRef.current = url
      setResultUrl(url)

      if (analysisHeader) {
        try {
          setAnalysis(JSON.parse(analysisHeader) as RemixAnalysis)
        } catch {
          setAnalysis(null)
        }
      }

      setState('success')
    } catch (err) {
      if (isStale()) {return}
      const message = err instanceof Error ? err.message : i18nMessages.remixFailed
      setError({ code: 'network_error', message })
      setState('error')
    }
  }, [trackA, trackB, options, apiBaseUrl, i18nMessages])

  return {
    trackA,
    trackB,
    options,
    state,
    error,
    resultUrl,
    analysis,
    setTrackA,
    setTrackB,
    setOptions,
    blend,
    reset,
  }
}
