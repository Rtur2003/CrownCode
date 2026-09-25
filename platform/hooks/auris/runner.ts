/**
 * Runs AURIS jobs outside React so they survive page changes.
 *
 * A file or microphone take goes two ways at once:
 *   - to the backend, where the trained models (LightGBM primary + 10-model
 *     vote, SHAP, wav2vec2, vocal analysis…) decide. On a backend with the
 *     jobs API the upload starts a server-side job whose real per-step
 *     progress is polled — and a reload resumes that job instead of
 *     uploading again. Older backends get the one-shot endpoint.
 *   - through the in-browser signal measurement, which draws the
 *     waveform/spectrogram and backs the report up if the server can't.
 * The verdict always names its source; the browser reading is never
 * passed off as the model.
 */

import { API_BASE_URL } from '@/config/api'
import {
  pollServerJob, readAnalyzeResponse, sendAnalysis, startServerJob,
  type AnalyzeOutcome, type AnalyzePayload,
} from '@/hooks/analysisGateway'
import type { AnalysisResult, FileSourceInfo } from '@/hooks/analysisTypes'
import { appendHistory, HISTORY_KEYS } from '@/hooks/useLocalHistory'
import { clearLastJob, loadLastJob, saveLastJob, type StoredJob } from '@/hooks/auris/persist'
import { ensureServer } from '@/hooks/auris/server'
import { LOSSY_FORMATS, MODEL_VERSION, SAMPLE_RATE, analyseSignal, decodeBlob, type SignalReport } from '@/hooks/auris/signal'
import {
  getAurisState, isActive, patchJob, setAurisState,
  type AurisError, type AurisJob, type SourceKind,
} from '@/hooks/auris/store'

const MIN_SECONDS = 3
const POLL_MS = 1_500
// A Space restart drops in-memory jobs; give it about a minute before giving up.
const MAX_POLL_MISSES = 40
// The server keeps finished jobs for 15 minutes.
const RESUME_WINDOW_MS = 14 * 60_000

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

const sleep = (ms: number, signal: AbortSignal) => new Promise<void>(resolve => {
  const t = setTimeout(resolve, ms)
  signal.addEventListener('abort', () => { clearTimeout(t); resolve() }, { once: true })
})

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

const sourceOf = (input: JobInput, bytes: number): FileSourceInfo => ({
  kind: 'file',
  fileName: input.kind === 'mic' ? `mikrofon.${input.format.toLowerCase()}` : input.label,
  fileSizeBytes: bytes,
  mimeType: input.blob?.type || MIME[input.format] || 'application/octet-stream',
})

/** The browser measurement wrapped as a result, for when the server has none. */
const signalResult = (report: SignalReport, source: FileSourceInfo, decoded: Decoded, bytes: number, format: string, seconds: number): AnalysisResult => {
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

// ── server side ──────────────────────────────────────────────────────

/** Polls a server job until it settles, mirroring its steps into the store. */
const followServerJob = async (id: string, serverJobId: string, signal: AbortSignal): Promise<AnalyzeOutcome> => {
  let misses = 0
  for (;;) {
    if (signal.aborted) {return { result: null, error: 'cancelled', warnings: [] }}
    const poll = await pollServerJob(API_BASE_URL, serverJobId, signal)
    if (signal.aborted) {return { result: null, error: 'cancelled', warnings: [] }}
    if (poll.kind === 'lost') {return { result: null, error: 'jobLost', warnings: [] }}
    if (poll.kind === 'unreachable') {
      if (++misses >= MAX_POLL_MISSES) {return { result: null, error: 'backend_unreachable', warnings: [] }}
    } else {
      misses = 0
      const { snapshot } = poll
      patchJob(id, { steps: snapshot.steps ?? [] })
      if (snapshot.status !== 'running') {
        return readAnalyzeResponse(200, snapshot.response)
      }
    }
    await sleep(POLL_MS, signal)
  }
}

const serve = async (id: string, input: JobInput, file: File | null, signal: AbortSignal, pending: StoredJob): Promise<AnalyzeOutcome> => {
  const up = await ensureServer()
  if (signal.aborted) {return { result: null, error: 'cancelled', warnings: [] }}
  if (!up) {return { result: null, error: 'backend_unreachable', warnings: [] }}
  patchJob(id, { stage: file ? 'uploading' : 'processing' })

  const payload: AnalyzePayload = file ? { sourceType: 'file', file } : { sourceType: 'youtube', url: input.url ?? '' }
  const options = {
    signal,
    onUploadProgress: (loaded: number, total: number) => { if (file) {patchJob(id, { uploadedBytes: loaded, uploadTotal: total })} },
    onUploaded: () => patchJob(id, { stage: 'processing', uploadEndedAt: Date.now() }),
  }

  const started = await startServerJob(API_BASE_URL, payload, options)
  if (started.kind === 'outcome') {return started.outcome}
  if (started.kind === 'unsupported') {return sendAnalysis(API_BASE_URL, payload, options)}

  patchJob(id, { stage: 'processing', serverJobId: started.jobId, steps: started.steps })
  void saveLastJob({ ...pending, serverJobId: started.jobId })
  return followServerJob(id, started.jobId, signal)
}

// ── browser side ─────────────────────────────────────────────────────

const decode = async (id: string, blob: Blob): Promise<Decoded | null> => {
  try {
    return await decodeBlob(blob)
  } catch {
    patchJob(id, { signalProgress: -1 })
    return null
  }
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

// ── lifecycle ────────────────────────────────────────────────────────

const freshJob = (id: string, input: JobInput, bytes: number, startedAt: number, patch: Partial<AurisJob> = {}): AurisJob => ({
  id, kind: input.kind, label: input.label, bytes, format: input.format, startedAt,
  stage: 'waking', uploadedBytes: 0, uploadTotal: bytes, uploadEndedAt: null, finishedAt: null,
  serverJobId: null, steps: [],
  signalProgress: input.blob ? 0 : -1, signal: null, result: null, warnings: [],
  serverError: null, error: null,
  audioUrl: input.blob ? URL.createObjectURL(input.blob) : null,
  seen: false, restored: false, resumed: false,
  ...patch,
})

const finish = (id: string, patch: Partial<AurisJob>) => {
  if (!patchJob(id, { ...patch, finishedAt: Date.now() })) {return}
  controller = null
  guardUnload(false)
  flagTitle()
  if (patch.stage === 'error') {void clearLastJob()}
}

/** Turns the server's outcome and the browser measurement into what the page shows. */
const settle = (
  id: string, input: JobInput, pending: StoredJob,
  outcome: AnalyzeOutcome, decoded: Decoded | null, report: SignalReport | null,
) => {
  if (getAurisState().job?.id !== id || outcome.error === 'cancelled') {return}
  const bytes = pending.bytes

  let serverError: AurisError | null = outcome.error
  let result: AnalysisResult | null = null
  if (outcome.result && isPreview(outcome.result)) {
    serverError = 'serverPreview'
  } else if (outcome.result) {
    const info = outcome.result.audioInfo
    result = {
      ...outcome.result,
      // The browser decode knows the real channel layout when the server couldn't read the container.
      audioInfo: decoded && !info.channels ? { ...info, channels: decoded.channels } : info,
      ...(report ? { signal: report } : {}),
    }
  }
  if (!result && report && decoded) {
    result = signalResult(report, sourceOf(input, bytes), decoded, bytes, input.format, (Date.now() - pending.startedAt) / 1000)
  }

  if (!result) {
    finish(id, { stage: 'error', error: serverError ?? 'decodeFailed', warnings: outcome.warnings })
    return
  }
  finish(id, { stage: 'done', result, serverError, warnings: outcome.warnings })

  appendHistory(HISTORY_KEYS.ANALYSIS, input.kind === 'url' ? input.url ?? input.label : input.label, lightResult(result))
  void saveLastJob({ ...pending, status: 'done', result, warnings: outcome.warnings, serverError, finishedAt: Date.now() })
}

export const startJob = async (input: JobInput) => {
  controller?.abort()
  releaseAudio(getAurisState().job)

  const id = newId()
  const ac = new AbortController()
  controller = ac
  const startedAt = Date.now()
  const bytes = input.blob?.size ?? 0
  const file = input.blob
    ? new File([input.blob], sourceOf(input, bytes).fileName, { type: MIME[input.format] ?? (input.blob.type || 'audio/mpeg') })
    : null

  setAurisState({ interrupted: null, job: freshJob(id, input, bytes, startedAt) })
  guardUnload(true)
  const pending: StoredJob = { id, kind: input.kind, label: input.label, format: input.format, bytes, startedAt, status: 'pending' }
  if (input.blob) {pending.blob = input.blob}
  if (input.url) {pending.url = input.url}
  void saveLastJob(pending)

  // Decode first: it is quick, and a take that is too short isn't worth an upload.
  const decoded = input.blob ? await decode(id, input.blob) : null
  if (decoded && decoded.duration < MIN_SECONDS) {
    finish(id, { stage: 'error', error: 'tooShort' })
    return
  }
  if (getAurisState().job?.id !== id) {return}

  const [outcome, report] = await Promise.all([
    serve(id, input, file, ac.signal, pending),
    decoded ? measure(id, decoded, input.format) : Promise.resolve(null),
  ])
  settle(id, input, pending, outcome, decoded, report)
}

/** Picks a server job back up after a reload, without uploading again. */
const resumeJob = async (stored: StoredJob & { serverJobId: string }) => {
  const ac = new AbortController()
  controller = ac
  const input: JobInput = { kind: stored.kind, label: stored.label, format: stored.format }
  if (stored.blob) {input.blob = stored.blob}
  if (stored.url) {input.url = stored.url}

  setAurisState({
    interrupted: null,
    job: freshJob(stored.id, input, stored.bytes, stored.startedAt, {
      stage: 'processing', serverJobId: stored.serverJobId, uploadedBytes: stored.bytes, resumed: true,
    }),
  })
  guardUnload(true)

  const decoded = input.blob ? await decode(stored.id, input.blob) : null
  const [outcome, report] = await Promise.all([
    followServerJob(stored.id, stored.serverJobId, ac.signal),
    decoded ? measure(stored.id, decoded, stored.format) : Promise.resolve(null),
  ])
  if (outcome.error === 'jobLost') {
    // The Space restarted and forgot the job: offer a clean rerun instead.
    controller = null
    guardUnload(false)
    releaseAudio(getAurisState().job)
    setAurisState({ job: null, interrupted: { id: stored.id, kind: stored.kind, label: stored.label, startedAt: stored.startedAt } })
    return
  }
  settle(stored.id, input, stored, outcome, decoded, report)
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
  serverJobId: stored.serverJobId ?? null, steps: [],
  signalProgress: result.signal?.visuals ? 1 : -1,
  signal: result.signal?.visuals ? result.signal : null,
  result, warnings: stored.warnings ?? [], serverError: (stored.serverError as AurisError | null) ?? null, error: null,
  audioUrl: stored.blob ? URL.createObjectURL(stored.blob) : null,
  seen: true, restored: true, resumed: false,
})

/**
 * On the first AURIS visit of a page load: bring back the last finished
 * job, resume one still running on the server, or surface one a reload
 * interrupted so it can be rerun.
 */
export const restoreLastJob = async () => {
  if (restoreTried || getAurisState().job) {return}
  restoreTried = true
  const stored = await loadLastJob()
  if (!stored || getAurisState().job) {return}
  if (stored.status === 'done' && stored.result) {
    setAurisState({ job: jobFromStored(stored, stored.result) })
  } else if (stored.status === 'pending') {
    const serverJobId = stored.serverJobId
    if (serverJobId && Date.now() - stored.startedAt < RESUME_WINDOW_MS) {
      void resumeJob({ ...stored, serverJobId })
    } else {
      setAurisState({ interrupted: { id: stored.id, kind: stored.kind, label: stored.label, startedAt: stored.startedAt } })
    }
  }
}

const inputFrom = (stored: StoredJob): JobInput => {
  const input: JobInput = { kind: stored.kind, label: stored.label, format: stored.format }
  if (stored.blob) {input.blob = stored.blob}
  if (stored.url) {input.url = stored.url}
  return input
}

export const retryInterrupted = async () => {
  const stored = await loadLastJob()
  setAurisState({ interrupted: null })
  if (!stored || stored.status !== 'pending') {return}
  void startJob(inputFrom(stored))
}

/** Sends the last job's audio (or link) again, e.g. after the server woke up. */
export const rerunLast = async () => {
  const stored = await loadLastJob()
  if (!stored || (!stored.blob && !stored.url)) {return false}
  void startJob(inputFrom(stored))
  return true
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
      serverJobId: null, steps: [],
      signalProgress: -1, signal: null, result, warnings: [], serverError: null, error: null,
      audioUrl: null, seen: true, restored: true, resumed: false,
    },
  })
}
