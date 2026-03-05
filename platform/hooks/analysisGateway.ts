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

  // Validate required fields before hitting the network
  if (payload.sourceType === 'youtube' && !payload.url) {
    return { result: null, error: 'enterUrl' }
  }
  if (payload.sourceType === 'file' && !payload.file) {
    return { result: null, error: 'missingFile' }
  }

  try {
    const response = await fetch(`${apiBaseUrl}/api/analyze`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      return { result: null, error: 'backend_unreachable' as AnalysisErrorCode }
    }

    const data = await response.json() as AnalyzeResponse
    if (data.errors && data.errors.length) {
      const errs = data.errors
      if (errs.includes('missing_file')) return { result: null, error: 'missingFile' }
      if (errs.includes('unsupported_source')) return { result: null, error: 'unsupportedSource' }
      if (errs.includes('invalid_youtube_url')) return { result: null, error: 'invalidYouTubeUrl' }
      if (errs.includes('file_too_large')) return { result: null, error: 'fileTooLarge' }
      if (errs.includes('file_too_small')) return { result: null, error: 'fileTooSmall' }
      if (errs.includes('invalid_file_type')) return { result: null, error: 'unsupportedFileType' }
      if (errs.includes('youtube_analysis_failed')) return { result: null, error: 'youtubeAnalysisFailed' }
      return { result: null, error: 'backend_unexpected_response' as AnalysisErrorCode }
    }

    if (!data.result) {
      return { result: null, error: 'backend_unexpected_response' as AnalysisErrorCode }
    }

    // Normalize analysisMode if backend omits it
    if (!data.result.analysisMode) {
      data.result.analysisMode = data.result.decisionSource === 'preview' ? 'preview' : 'production'
    }

    return { result: data.result, error: null }
  } catch (error) {
    return { result: null, error: 'backend_unreachable' as AnalysisErrorCode }
  }
}
