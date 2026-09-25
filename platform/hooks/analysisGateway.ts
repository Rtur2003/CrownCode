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

/**
 * Same request as analyzeSource, over XMLHttpRequest so the upload can
 * report real progress (fetch has no upload progress events).
 */
export const sendAnalysis = (
  apiBaseUrl: string | undefined,
  payload: AnalyzePayload,
  { onUploadProgress, onUploaded, signal }: SendOptions = {},
): Promise<AnalyzeOutcome> => {
  const invalid = precheck(apiBaseUrl, payload)
  if (invalid) {return Promise.resolve(invalid)}
  if (typeof XMLHttpRequest === 'undefined') {return analyzeSource(apiBaseUrl, payload)}

  return new Promise(resolve => {
    const xhr = new XMLHttpRequest()
    const done = (outcome: AnalyzeOutcome) => {
      signal?.removeEventListener('abort', abort)
      resolve(outcome)
    }
    const abort = () => xhr.abort()

    xhr.open('POST', `${apiBaseUrl}/api/analyze`)
    xhr.timeout = TIMEOUT_MS
    xhr.responseType = 'json'
    xhr.upload.onprogress = e => { if (e.lengthComputable) {onUploadProgress?.(e.loaded, e.total)} }
    xhr.upload.onload = () => onUploaded?.()
    xhr.onload = () => done(readAnalyzeResponse(xhr.status, xhr.response as AnalyzeResponse | null))
    xhr.onerror = () => done(fail('backend_unreachable'))
    xhr.ontimeout = () => done(fail('backend_unreachable'))
    xhr.onabort = () => done(fail('cancelled'))

    if (signal?.aborted) {
      done(fail('cancelled'))
      return
    }
    signal?.addEventListener('abort', abort)
    xhr.send(buildForm(payload))
  })
}
