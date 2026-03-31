// =========================================================================
// AI MUSIC DETECTION PAGE - YOUTUBE WORKFLOW
// =========================================================================
// YouTube-first interface for the AI music detection pipeline.
// Backend integrations are optional; preview mode is always available.
//
// @author Hasan Arthur Altuntas
// @version 1.1.0
// @since 2025-01-01
// =========================================================================

import React, { useCallback, useRef, useState } from 'react'
import type { NextPage } from 'next'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Link as LinkIcon,
  Music,
  Upload,
  Youtube,
} from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { AurisHeroSection } from '@/components/AurisDetection/HeroSection'
import { HowItWorks } from '@/components/AurisDetection/HowItWorks'
import { AnalysisResultCard } from '@/components/AurisDetection/AnalysisResultCard'
import { useLanguage } from '@/context/LanguageContext'
import { useFileAnalysis } from '@/hooks/useFileAnalysis'
import { useYouTubeAnalysis } from '@/hooks/useYouTubeAnalysis'
import type { AnalysisErrorCode } from '@/hooks/analysisTypes'
import styles from '@/styles/pages/ai-detection.module.css'

const AIMusicDetectionPage: NextPage = () => {
  const { t } = useLanguage()
  const {
    url,
    setUrl,
    processingState: youtubeProcessingState,
    analysisResult: youtubeResult,
    error: youtubeError,
    runAnalysis: runYouTubeAnalysis,
    reset: resetYouTube
  } = useYouTubeAnalysis()
  const {
    selectedFile,
    processingState: fileProcessingState,
    analysisResult: fileResult,
    error: fileError,
    selectFile,
    runAnalysis: runFileAnalysis,
    reset: resetFile
  } = useFileAnalysis()
  const [activeSource, setActiveSource] = useState<'youtube' | 'file'>('youtube')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const detectionRef = useRef<HTMLDivElement>(null)

  const scrollToDetection = useCallback(() => {
    detectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const processingState = activeSource === 'youtube' ? youtubeProcessingState : fileProcessingState
  const analysisResult = activeSource === 'youtube' ? youtubeResult : fileResult
  const error = activeSource === 'youtube' ? youtubeError : fileError

  const isProcessing = ['validating', 'downloading', 'analyzing'].includes(processingState)

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setActiveSource('file')
      resetYouTube()
      selectFile(file)
    }
    event.target.value = ''
  }, [resetYouTube, selectFile])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      setActiveSource('file')
      resetYouTube()
      selectFile(file)
    }
  }, [resetYouTube, selectFile])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleFileAnalyze = useCallback(() => {
    setActiveSource('file')
    resetYouTube()
    runFileAnalysis()
  }, [resetYouTube, runFileAnalysis])

  const handleUrlAnalyze = useCallback(() => {
    setActiveSource('youtube')
    resetFile()
    runYouTubeAnalysis()
  }, [resetFile, runYouTubeAnalysis])

  const resetAll = useCallback(() => {
    resetYouTube()
    resetFile()
    setActiveSource('youtube')
  }, [resetFile, resetYouTube])

  const resolveErrorMessage = (errorKey: AnalysisErrorCode | null) => {
    if (!errorKey) {
      return null
    }
    switch (errorKey) {
      case 'enterUrl':
        return t.aiDetection.errors?.enterUrl || t.aiDetection.error.title
      case 'invalidYouTubeUrl':
        return t.aiDetection.errors?.invalidYouTubeUrl || t.aiDetection.error.title
      case 'youtubeAuthenticationRequired':
        return t.aiDetection.errors?.youtubeAuthenticationRequired || t.aiDetection.error.title
      case 'unsupportedSource':
        return t.aiDetection.errors?.unsupportedSource || t.aiDetection.error.title
      case 'missingFile':
        return t.aiDetection.errors?.missingFile || t.aiDetection.error.title
    case 'unsupportedFileType':
      return t.aiDetection.errors?.unsupportedFileType || t.aiDetection.error.title
    case 'fileTooLarge':
      return t.aiDetection.errors?.fileTooLarge || t.aiDetection.error.title
    case 'fileTooSmall':
      return t.aiDetection.errors?.fileTooSmall || t.aiDetection.error.title
    case 'invalidFileName':
      return t.aiDetection.errors?.invalidFileName || t.aiDetection.error.title
    case 'backend_not_configured':
      return t.aiDetection.errors?.backend_not_configured || t.aiDetection.error.title
    case 'backend_unreachable':
      return t.aiDetection.errors?.backend_unreachable || t.aiDetection.error.title
    case 'backend_unexpected_response':
      return t.aiDetection.errors?.backend_unexpected_response || t.aiDetection.error.title
    default:
      return t.aiDetection.error.title
  }
}

  const errorMessage = resolveErrorMessage(error)

  const stepOrder: Array<'validating' | 'downloading' | 'analyzing' | 'complete'> = [
    'validating',
    'downloading',
    'analyzing',
    'complete'
  ]
  const currentStepIndex = stepOrder.indexOf(
    processingState === 'idle' || processingState === 'error' ? 'validating' : (processingState as 'validating' | 'downloading' | 'analyzing' | 'complete')
  )

  const resultLabels = t.aiDetection?.result || {}

  return (
    <MainLayout
      title={t.aiDetection.meta.title}
      description={t.aiDetection.meta.description}
      keywords={t.aiDetection.meta.keywords}
    >
      {/* ===== CINEMATIC HERO ===== */}
      <AurisHeroSection onScrollToDetection={scrollToDetection} />

      {/* ===== HOW IT WORKS ===== */}
      <HowItWorks />

      {/* ===== DETECTION TOOL ===== */}
      <div className={styles['ai-detection-page']} ref={detectionRef}>
        <div className={styles['detection-container']}>
          {/* Warning card */}
          <motion.div
            className={styles['detection-header']}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles['demo-warning-container']}>
              <div className={styles['demo-warning-card']}>
                <div className={styles['warning-header']}>
                  <AlertTriangle size={20} className={styles['warning-icon']} />
                  <span className={styles['warning-title']}>{t.aiDetection.warning.title}</span>
                </div>
                <div className={styles['warning-content']}>
                  <p><strong>{t.aiDetection.warning.currentStatus}</strong> {t.aiDetection.warning.currentStatusText}</p>
                  <p><strong>{t.aiDetection.warning.analysisResults}</strong> {t.aiDetection.warning.analysisResultsText}</p>
                  <p><strong>{t.aiDetection.warning.plannedImplementation}</strong> {t.aiDetection.warning.plannedImplementationText}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {!analysisResult && processingState !== 'complete' && !errorMessage && (
            <motion.div
              className={styles['detection-interface']}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className={styles['input-stack']}>
                <div className={styles['input-sources']}>
                  <span>{t.aiDetection.url.supportedPlatforms}</span>
                  <div className={styles['source-chips']}>
                    <span className={`${styles['source-chip']} ${styles['source-chip-active']}`}>
                      <Youtube size={16} className={styles['source-chip-icon']} />
                      {t.aiDetection.url.sources.youtube}
                    </span>
                    <span className={`${styles['source-chip']} ${styles['source-chip-active']}`}>
                      <Upload size={16} className={styles['source-chip-icon']} />
                      {t.aiDetection.url.sources.upload}
                    </span>
                    <span className={`${styles['source-chip']} ${styles['source-chip-soon']}`}>
                      {t.aiDetection.url.sources.spotify}
                    </span>
                    <span className={`${styles['source-chip']} ${styles['source-chip-soon']}`}>
                      {t.aiDetection.url.sources.appleMusic}
                    </span>
                  </div>
                </div>

                <div className={styles['upload-section']}>
                  <h2>{t.aiDetection.upload.title}</h2>
                  <div
                    className={`${styles['upload-dropzone']} ${isDragOver ? styles['drag-over'] : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={48} />
                    <h3>{t.aiDetection.upload.dropHere}</h3>
                    <p>{t.aiDetection.upload.orClick}</p>
                    <div className={styles['supported-formats']}>
                      <span>{t.aiDetection.upload.supported}</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*,.mp3,.wav,.flac,.m4a,.mp4,.aac"
                      onChange={handleFileSelect}
                      className={styles['hidden']}
                      aria-label={t.aria?.uploadAudioFile || 'Upload audio file for AI music detection'}
                      title={t.aria?.uploadAudioFile || 'Upload audio file for AI music detection'}
                    />
                  </div>

                  {selectedFile && (
                    <div className={styles['selected-file']}>
                      <Music size={20} />
                      <span>{selectedFile.name}</span>
                      <button
                        onClick={handleFileAnalyze}
                        disabled={isProcessing}
                        className={`${styles['btn-primary']} ${isProcessing ? styles['loading'] : ''}`}
                      >
                        {isProcessing ? t.aiDetection.upload.analyzing : t.aiDetection.upload.analyzeButton}
                      </button>
                    </div>
                  )}
                </div>

                <div className={styles['url-section']} id="url">
                  <h2>{t.aiDetection.url.title}</h2>
                  <div className={styles['url-input-container']}>
                    <div className={styles['url-input-wrapper']}>
                      <LinkIcon size={20} />
                      <input
                        type="url"
                        placeholder={t.aiDetection.url.placeholder}
                        value={url}
                        onChange={(event) => setUrl(event.target.value)}
                        className={styles['url-input']}
                      />
                    </div>
                    <button
                      onClick={handleUrlAnalyze}
                      disabled={!url.trim() || isProcessing}
                      className={`${styles['btn-primary']} ${isProcessing ? styles['loading'] : ''}`}
                    >
                      {isProcessing ? t.aiDetection.url.analyzing : t.aiDetection.url.analyzeButton}
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles['pipeline-section']}>
                <h2>{t.aiDetection.pipeline.title}</h2>
                <ul className={styles['pipeline-list']}>
                  <li className={styles['pipeline-item']}>
                    <span>{t.aiDetection.pipeline.items.download}</span>
                    <span className={styles['pipeline-tag']}>{t.aiDetection.pipeline.tags.ytDlp}</span>
                  </li>
                  <li className={styles['pipeline-item']}>
                    <span>{t.aiDetection.pipeline.items.musicAi}</span>
                    <span className={styles['pipeline-tag']}>{t.aiDetection.pipeline.tags.optional}</span>
                  </li>
                  <li className={styles['pipeline-item']}>
                    <span>{t.aiDetection.pipeline.items.sesAnalizi}</span>
                    <span className={styles['pipeline-tag']}>{t.aiDetection.pipeline.tags.optional}</span>
                  </li>
                  <li className={styles['pipeline-item']}>
                    <span>{t.aiDetection.pipeline.items.preview}</span>
                    <span className={styles['pipeline-tag']}>{t.aiDetection.pipeline.tags.always}</span>
                  </li>
                </ul>
                <p className={styles['pipeline-note']}>
                  {t.aiDetection.pipeline.note}
                </p>
              </div>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div
              className={styles['processing-state']}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className={styles['processing-spinner']}>
                <div className={styles['spinner']} />
              </div>
              <h3>{t.aiDetection.processing.title}</h3>
              <p>{t.aiDetection.processing.subtitle}</p>
              <div className={styles['processing-steps']}>
                {stepOrder.map((step, index) => (
                  <div
                    key={step}
                    className={`${styles['step']} ${index <= currentStepIndex ? styles['active'] : ''}`}
                  >
                    {t.aiDetection.processing.steps[step]}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              className={styles['error-state']}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AlertTriangle size={48} />
              <h3>{t.aiDetection.error.title}</h3>
              <p>{errorMessage}</p>
              <button
                onClick={resetAll}
                className={styles['btn-primary']}
              >
                {t.aiDetection.error.tryAgain}
              </button>
            </motion.div>
          )}

          {analysisResult && (
            <AnalysisResultCard
              result={analysisResult}
              onReset={resetAll}
              labels={resultLabels}
            />
          )}
        </div>
      </div>
    </MainLayout>
  )
}

export default AIMusicDetectionPage
