import type { AnalysisResult, AnalysisErrorCode } from '@/hooks/analysisTypes'
import { fetchWithTimeout } from '@/hooks/useAsyncRequest'

export type SourceType = 'youtube' | 'file' | 'spotify' | 'apple'

export interface AnalyzePayload {
  sourceType: SourceType
  url?: string
  file?: File
}

export interface AnalyzeResponse {
  result?: AnalysisResult
  warnings?: string[]
  errors?: string[]
}

export interface AnalyzeOutcome {
  result: AnalysisResult | null
  error: AnalysisErrorCode | null
  warnings: string[]
}

const MAX_BYTES = 30 * 1024 * 1024 // 30MB
const TIMEOUT_MS = 600_000

// Backend error strings → UI error codes, most specific first.
const ERROR_MAP: Array<[string, AnalysisErrorCode]> = [
  ['missing_file', 'missingFile'],
  ['missing_url', 'missingUrl'],
  ['unsupported_source', 'unsupportedSource'],
  ['invalid_youtube_url', 'invalidYouTubeUrl'],
  ['youtube_authentication_required', 'youtubeAuthenticationRequired'],
  ['invalid_source_type', 'invalidSourceType'],
  ['file_too_large', 'fileTooLarge'],
  ['file_too_small', 'fileTooSmall'],
  ['invalid_file_type', 'unsupportedFileType'],
  ['youtube_analysis_failed', 'youtubeAnalysisFailed'],
  ['audio_too_short', 'tooShort'],
  ['audio_silent', 'audioSilent'],
  ['audio_decode_failed', 'serverDecodeFailed'],
  ['internal_error', 'internalError'],
]

const fail = (error: AnalysisErrorCode, warnings: string[] = []): AnalyzeOutcome => ({ result: null, error, warnings })

/** Validates a payload before it touches the network. */
const precheck = (apiBaseUrl: string | undefined, payload: AnalyzePayload): AnalyzeOutcome | null => {
  if (!apiBaseUrl) {return fail('backend_not_configured')}
  if (payload.file && payload.file.size > MAX_BYTES) {return fail('fileTooLarge')}
  if (payload.sourceType === 'youtube' && !payload.url) {return fail('enterUrl')}
  if (payload.sourceType === 'file' && !payload.file) {return fail('missingFile')}
  return null
}

const buildForm = (payload: AnalyzePayload) => {
  const formData = new FormData()
  formData.append('sourceType', payload.sourceType)
  if (payload.url) {formData.append('url', payload.url)}
  if (payload.file) {formData.append('file', payload.file)}
  return formData
}

/** Turns an HTTP status + parsed body into a result or an error code. */
export const readAnalyzeResponse = (status: number, data: AnalyzeResponse | null): AnalyzeOutcome => {
  if (status === 429) {return fail('rateLimited')}
  if (status === 503) {return fail('serverBusy')}
  if (status < 200 || status >= 300) {return fail('backend_unreachable')}
  if (!data) {return fail('backend_unexpected_response')}
  const warnings = data.warnings ?? []

  const errors = data.errors ?? []
  if (errors.length) {
    const hit = ERROR_MAP.find(([code]) => errors.includes(code))
    return fail(hit ? hit[1] : 'backend_unexpected_response', warnings)
  }
  if (!data.result) {return fail('backend_unexpected_response', warnings)}

  // Normalize analysisMode if backend omits it
  if (!data.result.analysisMode) {
    data.result.analysisMode = data.result.decisionSource === 'preview' ? 'preview' : 'production'
  }
  return { result: data.result, error: null, warnings }
}

export const analyzeSource = async (
  apiBaseUrl: string | undefined,
  payload: AnalyzePayload
): Promise<AnalyzeOutcome> => {
  const invalid = precheck(apiBaseUrl, payload)
  if (invalid) {return invalid}

  try {
    const response = await fetchWithTimeout(`${apiBaseUrl}/api/analyze`, {
      method: 'POST',
      body: buildForm(payload),
      timeout: TIMEOUT_MS,
    })
    if (!response.ok) {return readAnalyzeResponse(response.status ?? 500, null)}
    return readAnalyzeResponse(200, await response.json() as AnalyzeResponse)
  } catch {
    return fail('backend_unreachable')
  }
}

export interface SendOptions {
  /** Bytes sent so far and the request's total size. */
  onUploadProgress?: (loaded: number, total: number) => void
  /** Fires once the request body has been fully sent. */
  onUploaded?: () => void
  signal?: AbortSignal
}

interface XhrReply {
  status: number
  body: unknown
  /** Network failure, timeout or abort — no HTTP status at all. */
  failure: 'network' | 'cancelled' | null
}

/** POST a form over XMLHttpRequest, which (unlike fetch) reports upload progress. */
const postForm = (url: string, form: FormData, { onUploadProgress, onUploaded, signal }: SendOptions): Promise<XhrReply> =>
  new Promise(resolve => {
    const xhr = new XMLHttpRequest()
    const done = (reply: XhrReply) => {
      signal?.removeEventListener('abort', abort)
      resolve(reply)
    }
    const abort = () => xhr.abort()

    xhr.open('POST', url)
    xhr.timeout = TIMEOUT_MS
    xhr.responseType = 'json'
    xhr.upload.onprogress = e => { if (e.lengthComputable) {onUploadProgress?.(e.loaded, e.total)} }
    xhr.upload.onload = () => onUploaded?.()
    xhr.onload = () => done({ status: xhr.status, body: xhr.response, failure: null })
    xhr.onerror = () => done({ status: 0, body: null, failure: 'network' })
    xhr.ontimeout = () => done({ status: 0, body: null, failure: 'network' })
    xhr.onabort = () => done({ status: 0, body: null, failure: 'cancelled' })

    if (signal?.aborted) {
      done({ status: 0, body: null, failure: 'cancelled' })
      return
    }
    signal?.addEventListener('abort', abort)
    xhr.send(form)
  })

const failureOutcome = (reply: XhrReply): AnalyzeOutcome =>
  fail(reply.failure === 'cancelled' ? 'cancelled' : 'backend_unreachable')

/**
 * Same request as analyzeSource, over XMLHttpRequest so the upload can
 * report real progress (fetch has no upload progress events).
 */
export const sendAnalysis = async (
  apiBaseUrl: string | undefined,
  payload: AnalyzePayload,
  options: SendOptions = {},
): Promise<AnalyzeOutcome> => {
  const invalid = precheck(apiBaseUrl, payload)
  if (invalid) {return invalid}
  if (typeof XMLHttpRequest === 'undefined') {return analyzeSource(apiBaseUrl, payload)}
  const reply = await postForm(`${apiBaseUrl}/api/analyze`, buildForm(payload), options)
  if (reply.failure) {return failureOutcome(reply)}
  return readAnalyzeResponse(reply.status, reply.body as AnalyzeResponse | null)
}

// ── background jobs: POST /api/analyze/jobs, then poll ────────────────

export type StepState = 'pending' | 'running' | 'done' | 'failed' | 'skipped'

export interface JobStep {
  id: string
  state: StepState
  seconds?: number
}

export interface JobSnapshot {
  jobId: string | null
  status: 'running' | 'done' | 'error'
  steps: JobStep[]
  elapsedSec: number
  response: AnalyzeResponse | null
}

export type JobStart =
  | { kind: 'job'; jobId: string; steps: JobStep[] }
  | { kind: 'outcome'; outcome: AnalyzeOutcome }
  /** The backend predates the jobs API; use the one-shot endpoint instead. */
  | { kind: 'unsupported' }

/** Uploads and starts a server-side job; validation errors come back at once. */
export const startServerJob = async (
  apiBaseUrl: string | undefined,
  payload: AnalyzePayload,
  options: SendOptions = {},
): Promise<JobStart> => {
  const invalid = precheck(apiBaseUrl, payload)
  if (invalid) {return { kind: 'outcome', outcome: invalid }}
  if (typeof XMLHttpRequest === 'undefined') {return { kind: 'unsupported' }}

  const reply = await postForm(`${apiBaseUrl}/api/analyze/jobs`, buildForm(payload), options)
  if (reply.failure) {return { kind: 'outcome', outcome: failureOutcome(reply) }}
  if (reply.status === 404 || reply.status === 405) {return { kind: 'unsupported' }}

  const body = reply.body as Partial<JobSnapshot> | null
  if (reply.status === 202 && body?.jobId) {
    return { kind: 'job', jobId: body.jobId, steps: body.steps ?? [] }
  }
  if (reply.status === 200 && body?.response) {
    return { kind: 'outcome', outcome: readAnalyzeResponse(200, body.response) }
  }
  return { kind: 'outcome', outcome: readAnalyzeResponse(reply.status, null) }
}

export type JobPoll =
  | { kind: 'snapshot'; snapshot: JobSnapshot }
  /** The server no longer knows the job (restarted, or it expired). */
  | { kind: 'lost' }
  | { kind: 'unreachable' }

export const pollServerJob = async (apiBaseUrl: string, jobId: string, signal?: AbortSignal): Promise<JobPoll> => {
  try {
    const res = await fetchWithTimeout(`${apiBaseUrl}/api/analyze/jobs/${encodeURIComponent(jobId)}`, {
      timeout: 15_000,
      cache: 'no-store',
      ...(signal ? { signal } : {}),
    })
    if (res.status === 404) {return { kind: 'lost' }}
    if (!res.ok) {return { kind: 'unreachable' }}
    return { kind: 'snapshot', snapshot: await res.json() as JobSnapshot }
  } catch {
    return { kind: 'unreachable' }
  }
}
