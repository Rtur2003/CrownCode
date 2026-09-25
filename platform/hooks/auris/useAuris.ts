/**
 * useAuris — one flow for every AURIS source.
 *
 * Files and microphone takes are decoded and measured in the browser; the
 * audio never leaves the device. Links need the backend (it downloads the
 * audio), which answers with the same report shape.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AnalysisErrorCode, AnalysisResult, AnalysisSource } from '@/hooks/analysisTypes'
import { analyzeSource } from '@/hooks/analysisGateway'
import { HISTORY_KEYS, useLocalHistory } from '@/hooks/useLocalHistory'
import { LOSSY_FORMATS, MODEL_VERSION, SAMPLE_RATE, analyseSignal, decodeBlob, type SignalReport } from '@/hooks/auris/signal'

export type AurisPhase = 'idle' | 'recording' | 'decoding' | 'measuring' | 'remote' | 'done' | 'error'

const MAX_FILE_BYTES = 30 * 1024 * 1024
const MIN_FILE_BYTES = 1024
const MIN_SECONDS = 3
const MAX_RECORD_MS = 30_000
const EXTENSIONS = ['.mp3', '.wav', '.flac', '.m4a', '.mp4', '.aac', '.ogg', '.opus', '.webm']
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be'])

const extensionOf = (name: string) => {
  const i = name.lastIndexOf('.')
  return i === -1 ? '' : name.slice(i).toLowerCase()
}

export const isYouTubeUrl = (value: string) => {
  try {
    return YOUTUBE_HOSTS.has(new URL(value.trim()).hostname.toLowerCase())
  } catch {
    return false
  }
}

const buildResult = (
  report: SignalReport,
  source: AnalysisSource,
  info: { duration: number; channels: number; bytes: number; format: string },
  seconds: number,
): AnalysisResult => {
  const c = report.contributions
  const avg = (...keys: Array<keyof typeof c>) =>
    Math.round((keys.reduce((s, k) => s + c[k].lean, 0) / keys.length) * 1e4) / 1e4
  return {
    isAIGenerated: report.score >= 0.5,
    confidence: Math.round((0.5 + Math.abs(report.score - 0.5)) * 1e4) / 1e4,
    processingTime: Math.round(seconds * 100) / 100,
    modelVersion: MODEL_VERSION,
    decisionSource: 'auris_signal',
    analysisMode: 'signal',
    source,
    features: {
      spectralRegularity: avg('spectralPeriodicity', 'flatnessVariation'),
      temporalPatterns: avg('tempoDrift', 'loudnessRange'),
      harmonicStructure: avg('centroidVariation', 'bandwidthCutoff'),
      artificialIndicators: Object.values(c).filter(x => x.direction === 'towards_ai').map(x => x.name),
    },
    audioInfo: {
      duration: Math.round(info.duration * 100) / 100,
      sampleRate: SAMPLE_RATE,
      bitrate: info.duration ? Math.round((info.bytes * 8) / info.duration / 1000) : 0,
      format: info.format,
      channels: info.channels,
    },
    signal: report,
  }
}

const pickMimeType = () => {
  if (typeof MediaRecorder === 'undefined') {return ''}
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(t => MediaRecorder.isTypeSupported(t)) ?? ''
}

export const useAuris = () => {
  const [phase, setPhase] = useState<AurisPhase>('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<AnalysisErrorCode | 'micDenied' | 'decodeFailed' | 'tooShort' | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [sourceName, setSourceName] = useState<string>('')
  const [micLevel, setMicLevel] = useState(0)
  const [micElapsed, setMicElapsed] = useState(0)
  const runRef = useRef(0)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const micCleanupRef = useRef<(() => void) | null>(null)
  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL?.trim() || undefined, [])
  const history = useLocalHistory<AnalysisResult>(HISTORY_KEYS.ANALYSIS)
  const saveHistory = history.save

  // Keep the history light: readings only, no waveform/spectrogram.
  const finish = useCallback((next: AnalysisResult, label: string) => {
    setResult(next)
    setPhase('done')
    const { signal, ...rest } = next
    const { visuals: _visuals, ...readings } = signal ?? { visuals: null }
    saveHistory(label, (signal ? { ...rest, signal: readings } : rest) as AnalysisResult)
  }, [saveHistory])

  const setPlayable = useCallback((blob: Blob | null) => {
    setAudioUrl(prev => {
      if (prev) {URL.revokeObjectURL(prev)}
      return blob ? URL.createObjectURL(blob) : null
    })
  }, [])

  useEffect(() => () => {
    micCleanupRef.current?.()
    setPlayable(null)
  }, [setPlayable])

  const fail = useCallback((code: NonNullable<typeof error>) => {
    setError(code)
    setPhase('error')
  }, [])

  const measureBlob = useCallback(async (blob: Blob, source: AnalysisSource, format: string) => {
    const run = ++runRef.current
    const started = performance.now()
    setResult(null)
    setError(null)
    setProgress(0)
    setPhase('decoding')
    setPlayable(blob)

    let decoded: Awaited<ReturnType<typeof decodeBlob>>
    try {
      decoded = await decodeBlob(blob)
    } catch {
      if (run !== runRef.current) {return}
      // The browser can't read this codec; the backend's ffmpeg usually can.
      if (apiBaseUrl && blob instanceof File) {
        setPhase('remote')
        const { result: remote, error: remoteError } = await analyzeSource(apiBaseUrl, { sourceType: 'file', file: blob })
        if (run !== runRef.current) {return}
        if (remote) {
          finish(remote, blob.name)
        } else {
          fail(remoteError ?? 'decodeFailed')
        }
        return
      }
      fail('decodeFailed')
      return
    }
    if (run !== runRef.current) {return}
    if (decoded.duration < MIN_SECONDS) {
      fail('tooShort')
      return
    }

    setPhase('measuring')
    const report = await analyseSignal({
      left: decoded.left,
      right: decoded.right,
      channels: decoded.channels,
      lossy: LOSSY_FORMATS.has(format),
      onProgress: p => { if (run === runRef.current) {setProgress(p)} },
    })
    if (run !== runRef.current) {return}
    const label = source.kind === 'file' ? source.fileName : format
    finish(buildResult(report, source, { ...decoded, bytes: blob.size, format }, (performance.now() - started) / 1000), label)
  }, [apiBaseUrl, fail, finish, setPlayable])

  const analyseFile = useCallback((file: File) => {
    const ext = extensionOf(file.name)
    setSourceName(file.name)
    if (!EXTENSIONS.includes(ext) && !file.type.startsWith('audio/')) {return fail('unsupportedFileType')}
    if (file.size > MAX_FILE_BYTES) {return fail('fileTooLarge')}
    if (file.size < MIN_FILE_BYTES) {return fail('fileTooSmall')}
    void measureBlob(file, {
      kind: 'file',
      fileName: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type || 'application/octet-stream',
    }, (ext.slice(1) || 'audio').toUpperCase())
  }, [fail, measureBlob])

  const analyseUrl = useCallback(async (url: string) => {
    const value = url.trim()
    setSourceName(value)
    if (!value) {return fail('enterUrl')}
    if (!isYouTubeUrl(value)) {return fail('invalidYouTubeUrl')}
    if (!apiBaseUrl) {return fail('backend_not_configured')}
    const run = ++runRef.current
    setResult(null)
    setError(null)
    setPlayable(null)
    setPhase('remote')
    const { result: remote, error: remoteError } = await analyzeSource(apiBaseUrl, { sourceType: 'youtube', url: value })
    if (run !== runRef.current) {return}
    if (remote) {
      finish(remote, value)
    } else {
      fail(remoteError ?? 'internalError')
    }
  }, [apiBaseUrl, fail, finish, setPlayable])

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {recorderRef.current.stop()}
  }, [])

  const startRecording = useCallback(async () => {
    setError(null)
    setResult(null)
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
    } catch {
      fail('micDenied')
      return
    }

    const ctx = new AudioContext()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 1024
    ctx.createMediaStreamSource(stream).connect(analyser)
    const buf = new Float32Array(analyser.fftSize)
    const startedAt = performance.now()
    let raf = 0
    const tick = () => {
      analyser.getFloatTimeDomainData(buf)
      let s = 0
      for (const v of buf) {s += v * v}
      setMicLevel(Math.min(1, Math.sqrt(s / buf.length) * 4))
      setMicElapsed(performance.now() - startedAt)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const mimeType = pickMimeType()
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    const chunks: Blob[] = []
    const limit = setTimeout(() => recorder.state === 'recording' && recorder.stop(), MAX_RECORD_MS)
    const cleanup = () => {
      clearTimeout(limit)
      cancelAnimationFrame(raf)
      stream.getTracks().forEach(t => t.stop())
      ctx.close().catch(() => {})
      setMicLevel(0)
      micCleanupRef.current = null
    }
    micCleanupRef.current = cleanup
    recorder.ondataavailable = e => { if (e.data.size) {chunks.push(e.data)} }
    recorder.onstop = () => {
      cleanup()
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
      const format = blob.type.includes('mp4') ? 'M4A' : 'WEBM'
      setSourceName('mic')
      void measureBlob(blob, { kind: 'file', fileName: `mikrofon.${format.toLowerCase()}`, fileSizeBytes: blob.size, mimeType: blob.type }, format)
    }
    recorderRef.current = recorder
    recorder.start(250)
    setMicElapsed(0)
    setPhase('recording')
  }, [fail, measureBlob])

  const reset = useCallback(() => {
    runRef.current++
    micCleanupRef.current?.()
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.onstop = null
      recorderRef.current.stop()
    }
    setPlayable(null)
    setResult(null)
    setError(null)
    setProgress(0)
    setSourceName('')
    setPhase('idle')
  }, [setPlayable])

  return {
    phase, progress, result, error, audioUrl, sourceName, micLevel, micElapsed,
    maxRecordMs: MAX_RECORD_MS,
    hasBackend: Boolean(apiBaseUrl),
    analyseFile, analyseUrl, startRecording, stopRecording, reset,
  }
}

export type AurisController = ReturnType<typeof useAuris>
