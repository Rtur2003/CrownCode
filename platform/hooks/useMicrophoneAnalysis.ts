/**
 * useMicrophoneAnalysis Hook
 * Kullanım: Browser mikrofonundan canlı ses kaydı alıp AI music detection'a gönderir.
 * Shazam benzeri tek tıkla kaydet → analiz flow'u.
 * Bağımlılıklar: MediaRecorder API, AudioContext, getUserMedia
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AnalysisErrorCode, AnalysisResult, ProcessingState } from '@/hooks/analysisTypes'
import { analyzeSource } from '@/hooks/analysisGateway'
import { buildFeatureScores, buildSeed, buildConfidence, buildIndicators } from '@/hooks/analysisUtils'

export type MicrophoneState = 'idle' | 'requesting' | 'recording' | 'stopping' | 'denied'

const MAX_RECORD_MS = 30_000
const MIN_RECORD_MS = 1_500

const pickMimeType = (): string => {
  if (typeof MediaRecorder === 'undefined') {return 'audio/webm'}
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4;codecs=mp4a.40.2', 'audio/mp4']
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) {return type}
  }
  return ''
}

const buildPreviewResult = async (
  blob: Blob,
  elapsedSec: number,
  actualSampleRate?: number
): Promise<AnalysisResult> => {
  const seed = await buildSeed(`mic:${blob.size}:${Date.now()}`)
  const confidence = buildConfidence(seed)
  const isAIGenerated = confidence > 0.5
  const featureScores = buildFeatureScores(seed)
  const indicators = buildIndicators(isAIGenerated, confidence, ['microphone_preview'])
  const sampleRate = actualSampleRate || 48000
  const bitrate = elapsedSec > 0 ? Math.round((blob.size * 8) / (elapsedSec * 1000)) : 128

  return {
    isAIGenerated,
    confidence,
    processingTime: elapsedSec,
    modelVersion: 'preview-v2-enhanced',
    decisionSource: 'preview',
    analysisMode: 'preview',
    source: {
      kind: 'file',
      fileName: 'microphone-recording.webm',
      fileSizeBytes: blob.size,
      mimeType: blob.type || 'audio/webm'
    },
    features: {
      ...featureScores,
      artificialIndicators: indicators
    },
    audioInfo: {
      duration: Math.round(elapsedSec * 100) / 100,
      sampleRate,
      bitrate,
      format: 'WEBM',
      channels: 1
    }
  }
}

export const useMicrophoneAnalysis = () => {
  const [micState, setMicState] = useState<MicrophoneState>('idle')
  const [processingState, setProcessingState] = useState<ProcessingState>('idle')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<AnalysisErrorCode | null>(null)
  const [amplitude, setAmplitude] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const startTimestampRef = useRef<number>(0)
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL?.trim(), [])

  const cleanup = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current)
      autoStopTimerRef.current = null
    }
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current)
      elapsedTimerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
    analyserRef.current = null
    mediaRecorderRef.current = null
  }, [])

  useEffect(() => cleanup, [cleanup])

  const reset = useCallback(() => {
    cleanup()
    chunksRef.current = []
    setAnalysisResult(null)
    setError(null)
    setProcessingState('idle')
    setMicState('idle')
    setAmplitude(0)
    setElapsedSeconds(0)
  }, [cleanup])

  // rAF dongusu icteki `tick` ile kurulur: useCallback'in kendi degerine
  // referans vermesi (pollAmplitude -> pollAmplitude) kirilgan bir baglama.
  const pollAmplitude = useCallback(() => {
    const tick = () => {
      const analyser = analyserRef.current
      if (!analyser) {return}
      const data = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteTimeDomainData(data)
      let sum = 0
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128
        sum += v * v
      }
      const rms = Math.sqrt(sum / data.length)
      setAmplitude(Math.min(1, rms * 3))
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()
  }, [])

  const sampleRateRef = useRef<number>(0)

  const analyzeBlob = useCallback(
    async (blob: Blob, elapsedMs: number) => {
      const elapsedSec = Math.max(elapsedMs / 1000, 0.5)
      const file = new File([blob], `microphone-${Date.now()}.webm`, {
        type: blob.type || 'audio/webm'
      })
      const sr = sampleRateRef.current || undefined

      setProcessingState('analyzing')

      if (!apiBaseUrl) {
        const preview = await buildPreviewResult(blob, elapsedSec, sr)
        setAnalysisResult(preview)
        setProcessingState('complete')
        return
      }

      try {
        const { result, error: gatewayError } = await analyzeSource(apiBaseUrl, {
          sourceType: 'file',
          file
        })

        if (result) {
          setAnalysisResult(result)
          setProcessingState('complete')
          return
        }

        if (gatewayError === 'backend_not_configured' || gatewayError === 'backend_unreachable') {
          const preview = await buildPreviewResult(blob, elapsedSec, sr)
          setAnalysisResult(preview)
          setProcessingState('complete')
          return
        }

        setError(gatewayError || 'internalError')
        setProcessingState('error')
      } catch {
        const preview = await buildPreviewResult(blob, elapsedSec, sr)
        setAnalysisResult(preview)
        setProcessingState('complete')
      }
    },
    [apiBaseUrl]
  )

  const startRecording = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      setError('internalError')
      setMicState('denied')
      return
    }

    reset()
    setMicState('requesting')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      })
      streamRef.current = stream

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const audioCtx = new AudioCtx()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)
      audioCtxRef.current = audioCtx
      analyserRef.current = analyser
      sampleRateRef.current = audioCtx.sampleRate

      const mimeType = pickMimeType()
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = async () => {
        const elapsedMs = Date.now() - startTimestampRef.current
        cleanup()
        setMicState('idle')
        setAmplitude(0)

        if (elapsedMs < MIN_RECORD_MS) {
          setError('fileTooSmall')
          setProcessingState('error')
          return
        }

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        await analyzeBlob(blob, elapsedMs)
      }

      startTimestampRef.current = Date.now()
      recorder.start(250)
      setMicState('recording')
      setProcessingState('idle')
      setElapsedSeconds(0)
      rafRef.current = requestAnimationFrame(pollAmplitude)

      elapsedTimerRef.current = setInterval(() => {
        const sec = Math.floor((Date.now() - startTimestampRef.current) / 1000)
        setElapsedSeconds(sec)
      }, 250)

      autoStopTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop()
        }
      }, MAX_RECORD_MS)
    } catch (err) {
      cleanup()
      const isPermissionError =
        err instanceof DOMException &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')
      setMicState(isPermissionError ? 'denied' : 'idle')
      setError(isPermissionError ? 'internalError' : 'backend_unreachable')
      setProcessingState('error')
    }
  }, [analyzeBlob, cleanup, pollAmplitude, reset])

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (!recorder) {return}
    if (recorder.state === 'recording') {
      setMicState('stopping')
      setProcessingState('downloading')
      recorder.stop()
    }
  }, [])

  return {
    micState,
    processingState,
    analysisResult,
    error,
    amplitude,
    elapsedSeconds,
    maxDurationSec: Math.floor(MAX_RECORD_MS / 1000),
    startRecording,
    stopRecording,
    reset
  }
}
