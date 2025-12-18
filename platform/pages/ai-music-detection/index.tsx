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

import React from 'react'
import type { NextPage } from 'next'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Download,
  Link as LinkIcon,
  Shield,
  Youtube,
  Zap
} from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'
import { useYouTubeAnalysis } from '@/hooks/useYouTubeAnalysis'
import styles from '@/styles/pages/ai-detection.module.css'

const AIMusicDetectionPage: NextPage = () => {
  const { t } = useLanguage()
  const {
    url,
    setUrl,
    processingState,
    analysisResult,
    error,
    runAnalysis,
    reset
  } = useYouTubeAnalysis()

  const isProcessing = ['validating', 'downloading', 'analyzing'].includes(processingState)
  const resolveErrorMessage = (errorKey: string | null) => {
    if (!errorKey) return null
    if (errorKey === 'enterUrl') {
      return t.aiDetection.errors?.enterUrl || t.aiDetection.error.title
    }
    if (errorKey === 'invalidYouTubeUrl') {
      return t.aiDetection.errors?.invalidYouTubeUrl || t.aiDetection.error.title
    }
    return t.aiDetection.error.title
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

  const getDecisionLabel = (source: string) => {
    const labels = t.aiDetection.result.sources
    if (!labels) return source
    if (source === 'music_ai') return labels.musicAi
    if (source === 'ses_analizi') return labels.sesAnalizi
    return labels.preview
  }

  const renderAnalysisResult = () => {
    if (!analysisResult) return null

    const confidence = Math.round(analysisResult.confidence * 100)
    const decisionLabel = getDecisionLabel(analysisResult.decisionSource)
    const isAI = analysisResult.isAIGenerated

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles['analysis-result-card']}
      >
        <div className={styles['result-header']}>
          <div className={`${styles['result-icon']} ${isAI ? styles['ai-detected'] : styles['human-detected']}`}>
            {isAI ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
          </div>
          <div className={styles['result-content']}>
            <h3 className={styles['result-title']}>
              {isAI ? t.aiDetection.result.aiDetected : t.aiDetection.result.humanDetected}
            </h3>
            <p className={styles['result-subtitle']}>
              {t.aiDetection.result.confidence}: {confidence}% | {t.aiDetection.result.model}: {analysisResult.modelVersion} | {t.aiDetection.result.decisionSource}: {decisionLabel}
            </p>
          </div>
        </div>

        <div className={styles['result-metrics']}>
          <div className={styles['metric-grid']}>
            <div className={styles['metric-item']}>
              <Clock size={16} />
              <span>{t.aiDetection.result.processingTime}: {analysisResult.processingTime.toFixed(1)}s</span>
            </div>
            <div className={styles['metric-item']}>
              <Zap size={16} />
              <span>{t.aiDetection.result.sampleRate}: {analysisResult.audioInfo.sampleRate.toLocaleString()} Hz</span>
            </div>
            <div className={styles['metric-item']}>
              <BarChart3 size={16} />
              <span>{t.aiDetection.result.duration}: {Math.round(analysisResult.audioInfo.duration)}s</span>
            </div>
          </div>
        </div>

        <div className={styles['result-source']}>
          <div className={styles['result-source-item']}>
            <span>{t.aiDetection.result.videoId}</span>
            <span>{analysisResult.source.videoId}</span>
          </div>
          <div className={styles['result-source-item']}>
            <span>{t.aiDetection.result.normalizedUrl}</span>
            <span>{analysisResult.source.normalizedUrl}</span>
          </div>
        </div>

        <div className={styles['artificial-indicators']}>
          <h4>{t.aiDetection.result.analysisDetails}</h4>
          <ul>
            {analysisResult.features.artificialIndicators.map((indicator, index) => (
              <li key={index}>{indicator}</li>
            ))}
          </ul>
        </div>

        <div className={styles['result-actions']}>
          <button className={styles['btn-secondary']}>
            <Download size={16} />
            {t.aiDetection.result.exportReport}
          </button>
          <button
            className={styles['btn-primary']}
            onClick={reset}
          >
            {t.aiDetection.result.analyzeAnother}
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <MainLayout
      title={t.aiDetection.meta.title}
      description={t.aiDetection.meta.description}
      keywords={t.aiDetection.meta.keywords}
    >
      <div className={styles['ai-detection-page']}>
        <div className={styles['detection-container']}>
          <motion.div
            className={styles['detection-header']}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles['header-badge']}>
              <Shield size={16} />
              <span>{t.aiDetection.header.badge}</span>
            </div>
            <h1 className={styles['detection-title']}>
              {t.aiDetection.header.title}
            </h1>
            <p className={styles['detection-subtitle']}>
              {t.aiDetection.header.subtitle}
            </p>

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
                    onClick={runAnalysis}
                    disabled={!url.trim() || isProcessing}
                    className={`${styles['btn-primary']} ${isProcessing ? styles['loading'] : ''}`}
                  >
                    {isProcessing ? t.aiDetection.url.analyzing : t.aiDetection.url.analyzeButton}
                  </button>
                </div>

                <div className={styles['supported-platforms']}>
                  <span>{t.aiDetection.url.supportedPlatforms}</span>
                  <div className={styles['source-chips']}>
                    <span className={`${styles['source-chip']} ${styles['source-chip-active']}`}>
                      <Youtube size={16} className={styles['source-chip-icon']} />
                      {t.aiDetection.url.sources.youtube}
                    </span>
                    <span className={`${styles['source-chip']} ${styles['source-chip-soon']}`}>
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
              </div>

              <div className={styles['pipeline-section']}>
                <h2>{t.aiDetection.pipeline.title}</h2>
                <ul className={styles['pipeline-list']}>
                  <li className={styles['pipeline-item']}>
                    <span>{t.aiDetection.pipeline.items.download}</span>
                    <span className={styles['pipeline-tag']}>yt-dlp</span>
                  </li>
                  <li className={styles['pipeline-item']}>
                    <span>{t.aiDetection.pipeline.items.musicAi}</span>
                    <span className={styles['pipeline-tag']}>optional</span>
                  </li>
                  <li className={styles['pipeline-item']}>
                    <span>{t.aiDetection.pipeline.items.sesAnalizi}</span>
                    <span className={styles['pipeline-tag']}>optional</span>
                  </li>
                  <li className={styles['pipeline-item']}>
                    <span>{t.aiDetection.pipeline.items.preview}</span>
                    <span className={styles['pipeline-tag']}>always</span>
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
                onClick={reset}
                className={styles['btn-primary']}
              >
                {t.aiDetection.error.tryAgain}
              </button>
            </motion.div>
          )}

          {analysisResult && renderAnalysisResult()}
        </div>
      </div>
    </MainLayout>
  )
}

export default AIMusicDetectionPage
