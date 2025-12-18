export type ProcessingState = 'idle' | 'validating' | 'downloading' | 'analyzing' | 'complete' | 'error'

export type DecisionSource = 'music_ai' | 'ses_analizi' | 'preview'

export interface AnalysisFeatures {
  spectralRegularity: number
  temporalPatterns: number
  harmonicStructure: number
  artificialIndicators: string[]
}

export interface AudioInfo {
  duration: number
  sampleRate: number
  bitrate: number
  format: string
}

export interface YouTubeSourceInfo {
  kind: 'youtube'
  url: string
  normalizedUrl: string
  videoId: string
  startTimeSec?: number
}

export interface FileSourceInfo {
  kind: 'file'
  fileName: string
  fileSizeBytes: number
  mimeType: string
}

export type AnalysisSource = YouTubeSourceInfo | FileSourceInfo

export interface AnalysisResult {
  isAIGenerated: boolean
  confidence: number
  processingTime: number
  modelVersion: string
  decisionSource: DecisionSource
  source: AnalysisSource
  features: AnalysisFeatures
  audioInfo: AudioInfo
}

export type AnalysisErrorCode =
  | 'enterUrl'
  | 'invalidYouTubeUrl'
  | 'missingFile'
  | 'unsupportedFileType'
  | 'fileTooLarge'
  | 'fileTooSmall'
  | 'invalidFileName'
