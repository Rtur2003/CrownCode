import type { AnalysisResult, AnalysisErrorCode } from '@/hooks/analysisTypes'

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

const MAX_BYTES = 30 * 1024 * 1024 // 30MB

export const analyzeSource = async (
  apiBaseUrl: string | undefined,
  payload: AnalyzePayload
): Promise<{ result: AnalysisResult | null; error: AnalysisErrorCode | null }> => {
  if (!apiBaseUrl) {
    return { result: null, error: 'backend_not_configured' as AnalysisErrorCode }
  }

  const formData = new FormData()
  formData.append('sourceType', payload.sourceType)

  if (payload.url) {
    formData.append('url', payload.url)
  }

  if (payload.file) {
    if (payload.file.size > MAX_BYTES) {
      return { result: null, error: 'fileTooLarge' }
    }
    formData.append('file', payload.file)
  }

  const response = await fetch(`${apiBaseUrl}/api/analyze`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    return { result: null, error: 'backend_unreachable' as AnalysisErrorCode }
  }

  const data = await response.json() as AnalyzeResponse
  if (data.errors && data.errors.length) {
    // Map a few known errors to the existing codes
    if (data.errors.includes('missing_file')) return { result: null, error: 'missingFile' }
    if (data.errors.includes('unsupported_source')) return { result: null, error: 'invalidYouTubeUrl' }
    return { result: null, error: 'backend_unexpected_response' as AnalysisErrorCode }
  }

  return { result: data.result ?? null, error: null }
}
