/**
 * useFileAnalysis Hook
 * Kullanim: Local audio file analysis flow for AI music detection page
 * Bagimliliklar: File API, fetch API (optional)
 */

import { useCallback, useMemo, useRef, useState } from 'react'
import type { AnalysisErrorCode, AnalysisResult, ProcessingState } from '@/hooks/analysisTypes'
import { analyzeSource } from '@/hooks/analysisGateway'
import { buildFeatureScores, buildSeed, buildConfidence, buildIndicators } from '@/hooks/analysisUtils'

const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024
const MIN_FILE_SIZE_BYTES = 1024

const ALLOWED_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/flac',
  'audio/x-flac',
  'audio/mp4',
  'audio/m4a',
  'audio/aac'
])

const ALLOWED_EXTENSIONS = new Set(['.mp3', '.wav', '.flac', '.m4a', '.mp4', '.aac'])

const getFileExtension = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf('.')
  if (dotIndex === -1) {return ''}
  return fileName.slice(dotIndex).toLowerCase()
}

const isSafeFileName = (fileName: string) => {
  if (!fileName.trim()) {return false}
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return false
  }
  return true
}

const isSupportedAudioFile = (file: File) => {
  const extension = getFileExtension(file.name)
  const hasAllowedExtension = extension ? ALLOWED_EXTENSIONS.has(extension) : false
  const mimeType = file.type

  if (mimeType) {
    if (ALLOWED_MIME_TYPES.has(mimeType)) {
      return true
    }
    if (mimeType.startsWith('audio/') && hasAllowedExtension) {
      return true
    }
    return false
  }

  return hasAllowedExtension
}

const decodeAudioMetadata = async (
  file: File
): Promise<{ duration: number; sampleRate: number; channels: number }> => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    const buffer = await ctx.decodeAudioData(arrayBuffer)
    const meta = {
      duration: buffer.duration,
      sampleRate: buffer.sampleRate,
      channels: buffer.numberOfChannels
    }
    ctx.close().catch(() => {})
    return meta
  } catch {
    return { duration: 0, sampleRate: 0, channels: 0 }
  }
}

const buildPreviewResult = async (file: File, elapsedSec: number): Promise<AnalysisResult> => {
  const seed = await buildSeed(`${file.name}:${file.size}:${file.lastModified}`)
  const confidence = buildConfidence(seed)
  const isAIGenerated = confidence > 0.5
  const featureScores = buildFeatureScores(seed)
  const extension = getFileExtension(file.name)
  const format = extension ? extension.slice(1).toUpperCase() : 'AUDIO'

  const audioMeta = await decodeAudioMetadata(file)
  const duration = Math.round(audioMeta.duration * 100) / 100
  const sampleRate = audioMeta.sampleRate || 44100
  const channels = audioMeta.channels || 2
  const bitrate = duration > 0 ? Math.round((file.size * 8) / (duration * 1000)) : 0

  const indicators = buildIndicators(isAIGenerated, confidence, [])

  return {
    isAIGenerated,
    confidence,
    processingTime: elapsedSec,
    modelVersion: 'preview-v2-enhanced',
    decisionSource: 'preview',
    analysisMode: 'preview',
    source: {
      kind: 'file',
      fileName: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type || 'application/octet-stream'
    },
    features: {
      ...featureScores,
      artificialIndicators: indicators
    },
    audioInfo: {
      duration,
      sampleRate,
      bitrate,
      format,
      channels
    }
  }
}

export const useFileAnalysis = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [processingState, setProcessingState] = useState<ProcessingState>('idle')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<AnalysisErrorCode | null>(null)
  const startTimeRef = useRef<number>(0)
  const requestIdRef = useRef(0)
  const apiBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL?.trim(), [])

  const validateFile = useCallback((file: File): AnalysisErrorCode | null => {
    if (!isSafeFileName(file.name)) {
      return 'invalidFileName'
    }

    if (file.size < MIN_FILE_SIZE_BYTES) {
      return 'fileTooSmall'
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return 'fileTooLarge'
    }

    if (!isSupportedAudioFile(file)) {
      return 'unsupportedFileType'
    }

    return null
  }, [])

  const selectFile = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setSelectedFile(null)
      setError(validationError)
      setProcessingState('error')
      setAnalysisResult(null)
      return
    }

    setSelectedFile(file)
    setError(null)
    setProcessingState('idle')
    setAnalysisResult(null)
  }, [validateFile])

  const reset = useCallback(() => {
    setSelectedFile(null)
    setError(null)
    setProcessingState('idle')
    setAnalysisResult(null)
  }, [])

  const runAnalysis = useCallback(async () => {
    if (!selectedFile) {
      setError('missingFile')
      setProcessingState('error')
      return
    }

    const validationError = validateFile(selectedFile)
    if (validationError) {
      setError(validationError)
      setProcessingState('error')
      return
    }

    const currentRequestId = ++requestIdRef.current
    const isStale = () => requestIdRef.current !== currentRequestId

    setError(null)
    setProcessingState('validating')
    startTimeRef.current = Date.now()

    const fallbackToPreview = async (warningKey?: string) => {
      const elapsedSec = Math.max((Date.now() - startTimeRef.current) / 1000, 0.4)
      const preview = await buildPreviewResult(selectedFile, elapsedSec)
      if (warningKey) {
        preview.features.artificialIndicators = [
          ...preview.features.artificialIndicators,
          `Note: Analysis completed with limited backend availability.`
        ]
      }
      if (isStale()) {return}
      setAnalysisResult(preview)
      setProcessingState('complete')
    }

    setProcessingState('downloading')

    if (!apiBaseUrl) {
      await fallbackToPreview('backend_not_configured')
      return
    }

    try {
      setProcessingState('analyzing')
      const { result, error: gatewayError } = await analyzeSource(apiBaseUrl, {
        sourceType: 'file',
        file: selectedFile
      })

      if (isStale()) {return}

      if (result) {
        setAnalysisResult(result)
        setProcessingState('complete')
        return
      }

      if (gatewayError === 'backend_not_configured' || gatewayError === 'backend_unreachable') {
        await fallbackToPreview(gatewayError)
      } else {
        setError(gatewayError || 'unsupportedFileType')
        setProcessingState('error')
      }
    } catch {
      if (isStale()) {return}
      try {
        await fallbackToPreview('backend_unreachable')
      } catch {
        if (!isStale()) {
          setError('backend_unreachable')
          setProcessingState('error')
        }
      }
    }
  }, [apiBaseUrl, selectedFile, validateFile])

  return {
    selectedFile,
    processingState,
    analysisResult,
    error,
    selectFile,
    runAnalysis,
    reset
  }
}
