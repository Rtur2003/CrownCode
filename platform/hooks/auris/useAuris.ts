/**
 * useAuris — the AURIS page's view of the job store, plus the microphone.
 *
 * Jobs themselves run in hooks/auris/runner.ts, outside React, so leaving
 * the page doesn't stop them. Recording is the one thing tied to the page:
 * leaving mid-take stops the microphone and analyses what was recorded.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { restoreLastJob, resetJob, startJob } from '@/hooks/auris/runner'
import { ensureServer } from '@/hooks/auris/server'
import { setAurisState, useAurisStore } from '@/hooks/auris/store'

const MAX_FILE_BYTES = 30 * 1024 * 1024
const MIN_FILE_BYTES = 1024
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

const pickMimeType = () => {
  if (typeof MediaRecorder === 'undefined') {return ''}
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(t => MediaRecorder.isTypeSupported(t)) ?? ''
}

/** Validation failures before a job starts, shown in place of one. */
const failNow = (label: string, error: 'unsupportedFileType' | 'fileTooLarge' | 'fileTooSmall' | 'enterUrl' | 'invalidYouTubeUrl' | 'micDenied') => {
  resetJob()
  const now = Date.now()
  setAurisState({
    job: {
      id: `invalid-${now}`, kind: 'file', label, bytes: 0, format: '', startedAt: now, stage: 'error',
      uploadedBytes: 0, uploadTotal: 0, uploadEndedAt: null, finishedAt: now, serverJobId: null, steps: [], signalProgress: -1, signal: null,
      result: null, warnings: [], serverError: null, error, audioUrl: null, seen: true, restored: false, resumed: false,
    },
  })
}

export const useAuris = (micLabel: string) => {
  const job = useAurisStore(s => s.job)
  const server = useAurisStore(s => s.server)
  const interrupted = useAurisStore(s => s.interrupted)
  const [recording, setRecording] = useState(false)
  const [micLevel, setMicLevel] = useState(0)
  const [micElapsed, setMicElapsed] = useState(0)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const micCleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    void restoreLastJob()
    // Wake the Space early; a cold start takes a minute or two.
    void ensureServer()
  }, [])

  // Leaving mid-take: stop the microphone; onstop hands the take to the runner.
  useEffect(() => () => {
    if (recorderRef.current?.state === 'recording') {recorderRef.current.stop()}
  }, [])

  const analyseFile = useCallback((file: File) => {
    const ext = extensionOf(file.name)
    if (!EXTENSIONS.includes(ext) && !file.type.startsWith('audio/')) {return failNow(file.name, 'unsupportedFileType')}
    if (file.size > MAX_FILE_BYTES) {return failNow(file.name, 'fileTooLarge')}
    if (file.size < MIN_FILE_BYTES) {return failNow(file.name, 'fileTooSmall')}
    void startJob({ kind: 'file', label: file.name, format: (ext.slice(1) || 'audio').toUpperCase(), blob: file })
  }, [])

  const analyseUrl = useCallback((url: string) => {
    const value = url.trim()
    if (!value) {return failNow(value, 'enterUrl')}
    if (!isYouTubeUrl(value)) {return failNow(value, 'invalidYouTubeUrl')}
    void startJob({ kind: 'url', label: value, format: 'YOUTUBE', url: value })
  }, [])

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {recorderRef.current.stop()}
  }, [])

  const startRecording = useCallback(async () => {
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
    } catch {
      failNow(micLabel, 'micDenied')
      return
    }
    resetJob()

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
      setRecording(false)
      micCleanupRef.current = null
    }
    micCleanupRef.current = cleanup
    recorder.ondataavailable = e => { if (e.data.size) {chunks.push(e.data)} }
    recorder.onstop = () => {
      cleanup()
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
      void startJob({ kind: 'mic', label: micLabel, format: blob.type.includes('mp4') ? 'M4A' : 'WEBM', blob })
    }
    recorderRef.current = recorder
    recorder.start(250)
    setMicElapsed(0)
    setRecording(true)
  }, [micLabel])

  const reset = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.onstop = null
      recorderRef.current.stop()
    }
    micCleanupRef.current?.()
    resetJob()
  }, [])

  return {
    job, server, interrupted, recording, micLevel, micElapsed,
    maxRecordMs: MAX_RECORD_MS,
    analyseFile, analyseUrl, startRecording, stopRecording, reset,
  }
}

export type AurisController = ReturnType<typeof useAuris>
