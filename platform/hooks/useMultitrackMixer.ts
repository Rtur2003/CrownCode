/**
 * Creator Studio Multitrack Mixer Hook
 * Mixes 2-6 uploaded tracks with per-track gain/pan/mute into one WAV,
 * via the backend's real DSP mixer (equal-power panning, peak normalization).
 */

import { useState, useCallback, useMemo, useRef } from 'react'
import { fetchWithTimeout } from '@/hooks/useAsyncRequest'

export const MULTITRACK_MIN_TRACKS = 2
export const MULTITRACK_MAX_TRACKS = 6

export interface MultitrackChannelSettings {
  gainDb: number
  pan: number
  muted: boolean
}

export interface MultitrackChannelReport {
  index: number
  durationSec: number
  appliedGainDb: number
  pan: number
  muted: boolean
  peakLevel: number
}

export interface MultitrackAnalysis {
  channels: MultitrackChannelReport[]
  outputDurationSec: number
  outputPeakLevel: number
  clippingPrevented: boolean
}

export type MultitrackState = 'idle' | 'processing' | 'success' | 'error'

export interface MultitrackError {
  code: string
  message: string
}

export interface MultitrackMessages {
  tooFewTracks: string
  tooManyTracks: string
  apiNotConfigured: string
  invalidFileType: string
  fileTooLarge: string
  rateLimitExceeded: string
  validationError: string
  mixFailed: string
}

const DEFAULT_MESSAGES: MultitrackMessages = {
  tooFewTracks: `Please add at least ${MULTITRACK_MIN_TRACKS} tracks`,
  tooManyTracks: `A maximum of ${MULTITRACK_MAX_TRACKS} tracks is supported`,
  apiNotConfigured: 'API not configured',
  invalidFileType: 'One of the files is not a supported audio format',
  fileTooLarge: 'File too large (max 30 MB per track)',
  rateLimitExceeded: 'Too many mix requests. Please wait before trying again.',
  validationError: 'One of the tracks could not be processed',
  mixFailed: 'Failed to mix the tracks',
}

const ERROR_CODE_MAP: Record<string, keyof MultitrackMessages> = {
  invalid_track_count: 'tooFewTracks',
  invalid_file_type: 'invalidFileType',
  file_too_large: 'fileTooLarge',
  rate_limit_exceeded: 'rateLimitExceeded',
  validation_error: 'validationError',
  internal_error: 'mixFailed',
}

export interface MixerTrack {
  id: string
  file: File
  settings: MultitrackChannelSettings
}

const DEFAULT_SETTINGS = (): MultitrackChannelSettings => ({ gainDb: 0, pan: 0, muted: false })

export const useMultitrackMixer = (messages: Partial<MultitrackMessages> = {}) => {
  const [tracks, setTracks] = useState<MixerTrack[]>([])
  const [state, setState] = useState<MultitrackState>('idle')
  const [error, setError] = useState<MultitrackError | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<MultitrackAnalysis | null>(null)

  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL?.trim(), [])
  const requestIdRef = useRef(0)
  const resultUrlRef = useRef<string | null>(null)
  const i18nMessages = useMemo(() => ({ ...DEFAULT_MESSAGES, ...messages }), [messages])

  const addTrack = useCallback((file: File) => {
    setTracks((prev) => {
      if (prev.length >= MULTITRACK_MAX_TRACKS) {return prev}
      return [...prev, { id: `${file.name}-${file.size}-${Date.now()}`, file, settings: DEFAULT_SETTINGS() }]
    })
  }, [])

  const removeTrack = useCallback((id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const updateTrackSettings = useCallback((id: string, patch: Partial<MultitrackChannelSettings>) => {
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, settings: { ...t.settings, ...patch } } : t)))
  }, [])

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

  const mix = useCallback(async () => {
    if (tracks.length < MULTITRACK_MIN_TRACKS) {
      setError({ code: 'invalid_track_count', message: i18nMessages.tooFewTracks })
      setState('error')
      return
    }
    if (tracks.length > MULTITRACK_MAX_TRACKS) {
      setError({ code: 'invalid_track_count', message: i18nMessages.tooManyTracks })
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
    for (const t of tracks) {
      formData.append('tracks', t.file)
    }
    formData.append('options', JSON.stringify({
      channels: tracks.map((t) => ({
        gainDb: t.settings.gainDb,
        pan: t.settings.pan,
        muted: t.settings.muted,
      })),
      normalizeOutput: true,
    }))

    try {
      const response = await fetchWithTimeout(`${apiBaseUrl}/api/remix/multitrack`, {
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
        const errorMessage = key ? i18nMessages[key] : (typeof detail === 'string' ? detail : i18nMessages.mixFailed)
        setError({ code: backendCode || 'mix_failed', message: errorMessage })
        setState('error')
        return
      }

      const analysisHeader = response.headers.get('X-Multitrack-Analysis')
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
          setAnalysis(JSON.parse(analysisHeader) as MultitrackAnalysis)
        } catch {
          setAnalysis(null)
        }
      }

      setState('success')
    } catch (err) {
      if (isStale()) {return}
      const message = err instanceof Error ? err.message : i18nMessages.mixFailed
      setError({ code: 'network_error', message })
      setState('error')
    }
  }, [tracks, apiBaseUrl, i18nMessages])

  return {
    tracks,
    state,
    error,
    resultUrl,
    analysis,
    addTrack,
    removeTrack,
    updateTrackSettings,
    mix,
    reset,
  }
}
