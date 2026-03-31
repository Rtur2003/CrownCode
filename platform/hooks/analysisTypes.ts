/**
 * =========================================================================
 * ANALYSIS TYPES - AI MUSIC DETECTION DATA STRUCTURES
 * =========================================================================
 * TypeScript type definitions and interfaces for AURIS analysis pipeline.
 * Defines data structures for analysis results, features, and error codes.
 *
 * @module analysisTypes
 * @author CrownCode
 * @version 1.1.0
 * =========================================================================
 */

export type ProcessingState = 'idle' | 'validating' | 'downloading' | 'analyzing' | 'complete' | 'error'

export type DecisionSource = 'music_ai' | 'ses_analizi' | 'preview' | 'auris_meta' | 'auris_fallback' | 'auris_local' | 'auris_fusion' | string
export type AnalysisMode = 'production' | 'preview'

export interface AnalysisFeatures {
  spectralRegularity: number
  temporalPatterns: number
  harmonicStructure: number
  artificialIndicators: string[]
}

export interface VocalAnalysis {
  hasVocals: boolean
  vocalConfidence: number
  vocalAiScore: number
  pitchStabilityScore: number
  vibratoRegularityScore: number
  formantConsistencyScore: number
  breathPatternScore: number
  vocalTextureScore: number
  pitchMeanHz: number
  pitchStdCents: number
  vibratoRateHz: number
  vibratoExtentCents: number
  indicators: string[]
}

export interface TowerScores {
  wav2vec2?: number
  local_features?: number
  vocals?: number
  clap?: number
  fst?: number
  [key: string]: number | undefined
}

export interface FeatureImportance {
  feature: string
  importance: number
  value: number
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

export interface SpotifySourceInfo {
  kind: 'spotify'
  url: string
  trackId: string
  normalizedUrl: string
}

export interface FileSourceInfo {
  kind: 'file'
  fileName: string
  fileSizeBytes: number
  mimeType: string
}

export type AnalysisSource = YouTubeSourceInfo | SpotifySourceInfo | FileSourceInfo

export interface AnalysisResult {
  isAIGenerated: boolean
  confidence: number
  processingTime: number
  modelVersion: string
  decisionSource: DecisionSource
  analysisMode: AnalysisMode
  source: AnalysisSource
  features: AnalysisFeatures
  audioInfo: AudioInfo
  vocalAnalysis?: VocalAnalysis
  towerScores?: TowerScores
  topFeatures?: FeatureImportance[]
}

export type AnalysisErrorCode =
  | 'enterUrl'
  | 'invalidYouTubeUrl'
  | 'youtubeAuthenticationRequired'
  | 'unsupportedSource'
  | 'missingFile'
  | 'missingUrl'
  | 'unsupportedFileType'
  | 'fileTooLarge'
  | 'fileTooSmall'
  | 'invalidFileName'
  | 'invalidSourceType'
  | 'internalError'
  | 'backend_not_configured'
  | 'backend_unreachable'
  | 'backend_unexpected_response'
  | 'youtubeAnalysisFailed'
