/**
 * Runs AURIS jobs outside React so they survive page changes.
 *
 * A file or microphone take goes two ways at once:
 *   - to the backend's /api/analyze, where the trained models (LightGBM
 *     primary + 10-model vote, SHAP, wav2vec2, vocal analysis…) decide;
 *   - through the in-browser signal measurement, which draws the
 *     waveform/spectrogram and backs the report up if the server can't.
 * The verdict always names its source; the browser reading is never
 * passed off as the model.
 */

import { API_BASE_URL } from '@/config/api'
import { sendAnalysis, type AnalyzeOutcome } from '@/hooks/analysisGateway'
import type { AnalysisResult, AnalysisSource } from '@/hooks/analysisTypes'
import { appendHistory, HISTORY_KEYS } from '@/hooks/useLocalHistory'
import { clearLastJob, loadLastJob, saveLastJob, type StoredJob } from '@/hooks/auris/persist'
import { ensureServer } from '@/hooks/auris/server'
import { LOSSY_FORMATS, MODEL_VERSION, SAMPLE_RATE, analyseSignal, decodeBlob, type SignalReport } from '@/hooks/auris/signal'
import {
  getAurisState, isActive, patchJob, setAurisState,
  type AurisError, type AurisJob, type SourceKind,
} from '@/hooks/auris/store'

const MIN_SECONDS = 3

const MIME: Record<string, string> = {
  MP3: 'audio/mpeg', WAV: 'audio/wav', FLAC: 'audio/flac', M4A: 'audio/mp4', MP4: 'audio/mp4',
  AAC: 'audio/aac', OGG: 'audio/ogg', OPUS: 'audio/ogg', WEBM: 'audio/webm',
}

export interface JobInput {
  kind: SourceKind
  label: string
  format: string
  blob?: Blob
  url?: string
}

type Decoded = Awaited<ReturnType<typeof decodeBlob>>

let controller: AbortController | null = null
let restoreTried = false

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

// ── page-level side effects ──────────────────────────────────────────

const onBeforeUnload = (e: BeforeUnloadEvent) => {
  e.preventDefault()
  e.returnValue = ''
}

const guardUnload = (on: boolean) => {
  if (typeof window === 'undefined') {return}
  if (on) {window.addEventListener('beforeunload', onBeforeUnload)}
  else {window.removeEventListener('beforeunload', onBeforeUnload)}
}

/** Marks the tab title when a result lands while the visitor is in another tab. */
const flagTitle = () => {
  if (typeof document === 'undefined' || !document.hidden) {return}
  const original = document.title
  const flagged = `✓ ${original}`
  document.title = flagged
  const restore = () => {
    if (document.hidden) {return}
    if (document.title === flagged) {document.title = original}
    document.removeEventListener('visibilitychange', restore)
  }
  document.addEventListener('visibilitychange', restore)
}

const releaseAudio = (job: AurisJob | null) => {
  if (job?.audioUrl) {URL.revokeObjectURL(job.audioUrl)}
}

// ── results ──────────────────────────────────────────────────────────

const sourceOf = (input: JobInput, bytes: number): AnalysisSource => ({
  kind: 'file',
  fileName: input.kind === 'mic' ? `mikrofon.${input.format.toLowerCase()}` : input.label,
  fileSizeBytes: bytes,
  mimeType: input.blob?.type || MIME[input.format] || 'application/octet-stream',
})

/** The browser measurement wrapped as a result, for when the server has none. */
const signalResult = (report: SignalReport, source: AnalysisSource, decoded: Decoded, bytes: number, format: string, seconds: number): AnalysisResult => {
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
      duration: Math.round(decoded.duration * 100) / 100,
      sampleRate: SAMPLE_RATE,
      bitrate: decoded.duration ? Math.round((bytes * 8) / decoded.duration / 1000) : 0,
      format,
      channels: decoded.channels,
    },
    signal: report,
  }
}

/** History keeps readings only; the waveform/spectrogram stay in IndexedDB. */
const lightResult = (result: AnalysisResult): AnalysisResult => {
  if (!result.signal) {return result}
  const { visuals: _visuals, ...readings } = result.signal
  return { ...result, signal: readings as SignalReport }
}

const isPreview = (r: AnalysisResult) => r.analysisMode === 'preview' || r.decisionSource === 'preview'

// ── the job ──────────────────────────────────────────────────────────

const serve = async (id: string, input: JobInput, file: File | null, signal: AbortSignal): Promise<AnalyzeOutcome> => {
  const up = await ensureServer()
  if (signal.aborted) {return { result: null, error: 'cancelled', warnings: [] }}
  if (!up) {return { result: null, error: 'backend_unreachable', warnings: [] }}
  patchJob(id, { stage: file ? 'uploading' : 'processing' })
  return sendAnalysis(API_BASE_URL, file ? { sourceType: 'file', file } : { sourceType: 'youtube', url: input.url ?? '' }, {
    signal,
    onUploadProgress: (loaded, total) => { if (file) {patchJob(id, { uploadedBytes: loaded, uploadTotal: total })} },
    onUploaded: () => patchJob(id, { stage: 'processing', uploadEndedAt: Date.now() }),
  })
}

const measure = async (id: string, decoded: Decoded, format: string) => {
  try {
    const report = await analyseSignal({
      left: decoded.left,
      right: decoded.right,
      channels: decoded.channels,
      lossy: LOSSY_FORMATS.has(format),
      onProgress: p => { patchJob(id, { signalProgress: p }) },
    })
    patchJob(id, { signal: report, signalProgress: 1 })
    return report
  } catch {
    patchJob(id, { signalProgress: -1 })
    return null
  }
}

export const startJob = async (input: JobInput) => {
  controller?.abort()
  const previous = getAurisState().job
  releaseAudio(previous)

  const id = newId()
  const ac = new AbortController()
  controller = ac
  const startedAt = Date.now()
  const bytes = input.blob?.size ?? 0
  const file = input.blob
    ? new File([input.blob], sourceOf(input, bytes).fileName, { type: MIME[input.format] ?? (input.blob.type || 'audio/mpeg') })
    : null

  setAurisState({
    interrupted: null,
    job: {
      id, kind: input.kind, label: input.label, bytes, format: input.format, startedAt,
      stage: 'waking', uploadedBytes: 0, uploadTotal: bytes, uploadEndedAt: null, finishedAt: null,
      signalProgress: input.blob ? 0 : -1, signal: null, result: null, warnings: [],
      serverError: null, error: null,
      audioUrl: input.blob ? URL.createObjectURL(input.blob) : null,
      seen: false, restored: false,
    },
  })
  guardUnload(true)
  const pending: StoredJob = { id, kind: input.kind, label: input.label, format: input.format, bytes, startedAt, status: 'pending' }
  if (input.blob) {pending.blob = input.blob}
  if (input.url) {pending.url = input.url}
  void saveLastJob(pending)

  // Decode first: it is quick, and a take that is too short isn't worth an upload.
  let decoded: Decoded | null = null
  if (input.blob) {
    try {
      decoded = await decodeBlob(input.blob)
    } catch {
      patchJob(id, { signalProgress: -1 })
    }
    if (decoded && decoded.duration < MIN_SECONDS) {
      finish(id, { stage: 'error', error: 'tooShort' })
      return
    }
  }
  if (getAurisState().job?.id !== id) {return}

  const [outcome, report] = await Promise.all([
    serve(id, input, file, ac.signal),
    decoded ? measure(id, decoded, input.format) : Promise.resolve(null),
  ])
  if (getAurisState().job?.id !== id || outcome.error === 'cancelled') {return}

  let serverError: AurisError | null = outcome.error
  let result: AnalysisResult | null = null
  if (outcome.result && isPreview(outcome.result)) {
    serverError = 'serverPreview'
  } else if (outcome.result) {
    result = {
      ...outcome.result,
      // librosa loads mono on the server; the browser decode knows the real layout.
      audioInfo: decoded ? { ...outcome.result.audioInfo, channels: decoded.channels } : outcome.result.audioInfo,
      ...(report ? { signal: report } : {}),
    }
  }
  if (!result && report && decoded) {
    result = signalResult(report, sourceOf(input, bytes), decoded, bytes, input.format, (Date.now() - startedAt) / 1000)
  }

  if (!result) {
    finish(id, { stage: 'error', error: serverError ?? 'decodeFailed', warnings: outcome.warnings })
    return
  }
  finish(id, { stage: 'done', result, serverError, warnings: outcome.warnings })

  appendHistory(HISTORY_KEYS.ANALYSIS, input.kind === 'url' ? input.url ?? input.label : input.label, lightResult(result))
  const done: StoredJob = { ...pending, status: 'done', result, warnings: outcome.warnings, serverError, finishedAt: Date.now() }
  void saveLastJob(done)
}

const finish = (id: string, patch: Partial<AurisJob>) => {
  if (!patchJob(id, { ...patch, finishedAt: Date.now() })) {return}
  controller = null
  guardUnload(false)
  flagTitle()
  if (patch.stage === 'error') {void clearLastJob()}
}

/** Stops the running job and clears the console. */
export const resetJob = () => {
  controller?.abort()
  controller = null
  guardUnload(false)
  releaseAudio(getAurisState().job)
  setAurisState({ job: null })
  void clearLastJob()
}

export const markSeen = () => {
  const job = getAurisState().job
  if (job && (job.stage === 'done' || job.stage === 'error') && !job.seen) {patchJob(job.id, { seen: true })}
}

const jobFromStored = (stored: StoredJob, result: AnalysisResult): AurisJob => ({
  id: stored.id, kind: stored.kind, label: stored.label, bytes: stored.bytes, format: stored.format,
  startedAt: stored.startedAt, stage: 'done', uploadedBytes: stored.bytes, uploadTotal: stored.bytes,
  uploadEndedAt: null, finishedAt: stored.finishedAt ?? stored.startedAt,
  signalProgress: result.signal?.visuals ? 1 : -1,
  signal: result.signal?.visuals ? result.signal : null,
  result, warnings: stored.warnings ?? [], serverError: (stored.serverError as AurisError | null) ?? null, error: null,
  audioUrl: stored.blob ? URL.createObjectURL(stored.blob) : null,
  seen: true, restored: true,
})

/**
 * On the first AURIS visit of a page load: bring back the last finished
 * job, or surface one a reload interrupted so it can be rerun.
 */
export const restoreLastJob = async () => {
  if (restoreTried || getAurisState().job) {return}
  restoreTried = true
  const stored = await loadLastJob()
  if (!stored || getAurisState().job) {return}
  if (stored.status === 'done' && stored.result) {
    setAurisState({ job: jobFromStored(stored, stored.result) })
  } else if (stored.status === 'pending') {
    setAurisState({ interrupted: { id: stored.id, kind: stored.kind, label: stored.label, startedAt: stored.startedAt } })
  }
}

export const retryInterrupted = async () => {
  const stored = await loadLastJob()
  setAurisState({ interrupted: null })
  if (!stored || stored.status !== 'pending') {return}
  const input: JobInput = { kind: stored.kind, label: stored.label, format: stored.format }
  if (stored.blob) {input.blob = stored.blob}
  if (stored.url) {input.url = stored.url}
  void startJob(input)
}

export const dismissInterrupted = () => {
  setAurisState({ interrupted: null })
  void clearLastJob()
}

/** Reopens a saved report from the history list (readings only, no audio). */
export const openFromHistory = (label: string, result: AnalysisResult, timestamp: number) => {
  if (isActive(getAurisState().job)) {return}
  releaseAudio(getAurisState().job)
  const kind: SourceKind = result.source?.kind === 'youtube' ? 'url' : 'file'
  setAurisState({
    job: {
      id: newId(), kind, label, bytes: result.source?.kind === 'file' ? result.source.fileSizeBytes : 0,
      format: result.audioInfo?.format ?? '', startedAt: timestamp, stage: 'done',
      uploadedBytes: 0, uploadTotal: 0, uploadEndedAt: null, finishedAt: timestamp,
      signalProgress: -1, signal: null, result, warnings: [], serverError: null, error: null,
      audioUrl: null, seen: true, restored: true,
    },
  })
}
