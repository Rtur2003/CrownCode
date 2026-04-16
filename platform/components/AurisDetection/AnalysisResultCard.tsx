/**
 * =========================================================================
 * ANALYSIS RESULT CARD - AI DETECTION RESULTS DISPLAY
 * =========================================================================
 * Comprehensive result display for AURIS AI music detection analysis.
 * Shows confidence gauge, feature bars, multi-tower scores, vocal analysis,
 * indicators, and expandable technical details with SHAP-based explanations.
 *
 * @component AnalysisResultCard
 * @author CrownCode
 * @version 1.0.0
 * =========================================================================
 */

import { motion } from 'motion/react'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  Activity,
  Mic,
  Radio,
  Brain,
  Layers,
  Download,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useState } from 'react'
import type { AnalysisResult, VocalAnalysis } from '../../hooks/analysisTypes'
import { XAIPanel } from './XAIPanel'
import styles from '../../styles/pages/ai-detection.module.css'

interface TowerLabels {
  wav2vec2?: string
  localFeatures?: string
  vocals?: string
  clap?: string
  fst?: string
}

interface ResultLabels {
  aiDetected?: string
  humanDetected?: string
  confidenceLabel?: string
  exportReport?: string
  analyzeAnother?: string
  analysisDetails?: string
  audioFeatureAnalysis?: string
  multiSignalAnalysis?: string
  vocalAnalysis?: string
  noVocalsDetected?: string
  vocalConfidence?: string
  showDetails?: string
  hideDetails?: string
  keyDecisionFactors?: string
  processingTime?: string
  sampleRate?: string
  duration?: string
  format?: string
  previewMode?: string
  spectralRegularity?: string
  temporalPatterns?: string
  harmonicStructure?: string
  vocalAiScore?: string
  pitchStability?: string
  vibratoRegularity?: string
  formantConsistency?: string
  breathPattern?: string
  vocalTexture?: string
  fileName?: string
  fileSize?: string
  towers?: TowerLabels
}

interface AnalysisResultCardProps {
  result: AnalysisResult
  onReset: () => void
  onExport?: () => void
  labels: ResultLabels
  locale?: 'tr' | 'en'
}

/* -- Confidence Gauge --------------------------------------------------- */

function ConfidenceGauge({
  confidence,
  isAI,
  sublabel,
}: {
  confidence: number
  isAI: boolean
  sublabel: string
}) {
  const percent = Math.round(confidence * 100)
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (confidence * circumference)
  const color = isAI ? 'var(--color-error, #a64b3c)' : 'var(--color-success, #7fb069)'
  const bgColor = isAI ? 'rgba(166, 75, 60, 0.15)' : 'rgba(127, 176, 105, 0.15)'

  return (
    <div className={styles['gauge-container']}>
      <svg viewBox="0 0 120 120" className={styles['gauge-svg']}>
        <circle
          cx="60" cy="60" r="54"
          fill="none"
          stroke="rgba(231, 199, 122, 0.08)"
          strokeWidth="8"
        />
        <motion.circle
          cx="60" cy="60" r="54"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          transform="rotate(-90 60 60)"
        />
        <circle cx="60" cy="60" r="44" fill={bgColor} />
      </svg>
      <div className={styles['gauge-label']}>
        <motion.span
          className={styles['gauge-percent']}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {percent}%
        </motion.span>
        <span className={styles['gauge-sublabel']}>{sublabel}</span>
      </div>
    </div>
  )
}

/* -- Feature Bar -------------------------------------------------------- */

function FeatureBar({ label, value, icon, delay = 0 }: {
  label: string
  value: number
  icon: React.ReactNode
  delay?: number
}) {
  const percent = Math.round(value * 100)
  const isHigh = value > 0.7
  const isLow = value < 0.3
  const barColor = isHigh
    ? 'var(--color-error, #a64b3c)'
    : isLow
      ? 'var(--color-success, #7fb069)'
      : 'var(--color-primary, #c99347)'

  return (
    <div className={styles['feature-bar-item']}>
      <div className={styles['feature-bar-header']}>
        <span className={styles['feature-bar-icon']}>{icon}</span>
        <span className={styles['feature-bar-label']}>{label}</span>
        <span className={styles['feature-bar-value']}>{percent}%</span>
      </div>
      <div className={styles['feature-bar-track']}>
        <motion.div
          className={styles['feature-bar-fill']}
          style={{ backgroundColor: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

/* -- Tower Score Dot ---------------------------------------------------- */

function TowerScore({ score, label }: {
  score: number
  label: string
}) {
  const percent = Math.round(score * 100)
  const isAI = score > 0.5

  return (
    <div className={styles['tower-score-item']}>
      <div className={styles['tower-score-dot-container']}>
        <motion.div
          className={`${styles['tower-score-dot']} ${isAI ? styles['tower-ai'] : styles['tower-human']}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        />
      </div>
      <div className={styles['tower-score-info']}>
        <span className={styles['tower-score-name']}>{label}</span>
        <span className={styles['tower-score-value']}>{percent}%</span>
      </div>
    </div>
  )
}

/* -- Vocal Analysis Section --------------------------------------------- */

function VocalSection({ vocal, labels }: { vocal: VocalAnalysis; labels: ResultLabels }) {
  if (!vocal.hasVocals) {
    return (
      <div className={styles['vocal-section-empty']}>
        <Mic size={16} />
        <span>{labels.noVocalsDetected || 'No vocals detected'}</span>
      </div>
    )
  }

  const metrics = [
    { label: labels.vocalAiScore || 'Vocal AI Score', value: vocal.vocalAiScore },
    { label: labels.pitchStability || 'Pitch Stability', value: vocal.pitchStabilityScore },
    { label: labels.vibratoRegularity || 'Vibrato Regularity', value: vocal.vibratoRegularityScore },
    { label: labels.formantConsistency || 'Formant Consistency', value: vocal.formantConsistencyScore },
    { label: labels.breathPattern || 'Breath Pattern', value: vocal.breathPatternScore },
    { label: labels.vocalTexture || 'Vocal Texture', value: vocal.vocalTextureScore },
  ]

  return (
    <div className={styles['vocal-section']}>
      <div className={styles['vocal-header']}>
        <Mic size={18} />
        <h4>{labels.vocalAnalysis || 'Vocal Analysis'}</h4>
        <span className={styles['vocal-confidence']}>
          {Math.round(vocal.vocalConfidence * 100)}% {labels.vocalConfidence || 'vocal confidence'}
        </span>
      </div>

      <div className={styles['vocal-metrics-grid']}>
        {metrics.map((m, i) => (
          <div key={m.label} className={styles['vocal-metric']}>
            <div className={styles['vocal-metric-label']}>{m.label}</div>
            <div className={styles['vocal-metric-bar-track']}>
              <motion.div
                className={styles['vocal-metric-bar-fill']}
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(m.value * 100)}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                style={{
                  backgroundColor: m.value > 0.7
                    ? 'var(--color-error, #a64b3c)'
                    : m.value < 0.3
                      ? 'var(--color-success, #7fb069)'
                      : 'var(--color-primary, #c99347)'
                }}
              />
            </div>
            <div className={styles['vocal-metric-value']}>
              {Math.round(m.value * 100)}%
            </div>
          </div>
        ))}
      </div>

      {vocal.pitchMeanHz > 0 && (
        <div className={styles['vocal-raw-stats']}>
          <span>Pitch: {vocal.pitchMeanHz.toFixed(0)} Hz ({'\u00B1'}{vocal.pitchStdCents.toFixed(1)} cents)</span>
          <span>Vibrato: {vocal.vibratoRateHz.toFixed(1)} Hz, {vocal.vibratoExtentCents.toFixed(0)} cents</span>
        </div>
      )}

      {vocal.indicators.length > 0 && (
        <ul className={styles['vocal-indicators']}>
          {vocal.indicators.map((ind, i) => (
            <li key={i}>{ind}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* -- Main Component ----------------------------------------------------- */

export function AnalysisResultCard({
  result,
  onReset,
  onExport,
  labels,
  locale = 'tr',
}: AnalysisResultCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const confidence = result.confidence
  const isAI = result.isAIGenerated
  const source = result.source

  const towerLabelMap: Record<string, string> = {
    wav2vec2: labels.towers?.wav2vec2 || 'wav2vec2 Deep Learning',
    local_features: labels.towers?.localFeatures || 'Spectral Analysis',
    vocals: labels.towers?.vocals || 'Vocal Analysis',
    clap: labels.towers?.clap || 'CLAP Embeddings',
    fst: labels.towers?.fst || 'FST Transformer',
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={styles['analysis-result-card']}
    >
      {/* -- Verdict Header -- */}
      <div className={styles['result-verdict']}>
        <ConfidenceGauge
          confidence={confidence}
          isAI={isAI}
          sublabel={labels.confidenceLabel || 'confidence'}
        />
        <div className={styles['verdict-text']}>
          <div className={`${styles['verdict-badge']} ${isAI ? styles['verdict-ai'] : styles['verdict-human']}`}>
            {isAI ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
            <span>{isAI ? (labels.aiDetected || 'AI Detected') : (labels.humanDetected || 'Human Detected')}</span>
          </div>
          <p className={styles['verdict-model']}>
            {result.analysisMode === 'production'
              ? `AURIS ${result.modelVersion} · ${result.decisionSource}`
              : 'AURIS Preview · Limited Analysis'}
          </p>
          {result.analysisMode === 'preview' && (
            <span className={styles['preview-badge']}>{labels.previewMode || 'Preview Mode'}</span>
          )}
        </div>
      </div>

      {/* -- Feature Scores -- */}
      <div className={styles['features-section']}>
        <h4 className={styles['section-title']}>
          <Activity size={18} />
          {labels.audioFeatureAnalysis || 'Audio Feature Analysis'}
        </h4>
        <div className={styles['feature-bars']}>
          <FeatureBar
            label={labels.spectralRegularity || 'Spectral Regularity'}
            value={result.features.spectralRegularity}
            icon={<Radio size={14} />}
            delay={0.2}
          />
          <FeatureBar
            label={labels.temporalPatterns || 'Temporal Patterns'}
            value={result.features.temporalPatterns}
            icon={<Clock size={14} />}
            delay={0.4}
          />
          <FeatureBar
            label={labels.harmonicStructure || 'Harmonic Structure'}
            value={result.features.harmonicStructure}
            icon={<Zap size={14} />}
            delay={0.6}
          />
        </div>
      </div>

      {/* -- Tower Scores (multi-signal) -- */}
      {result.towerScores && Object.keys(result.towerScores).length > 0 && (
        <div className={styles['towers-section']}>
          <h4 className={styles['section-title']}>
            <Layers size={18} />
            {labels.multiSignalAnalysis || 'Multi-Signal Analysis'}
          </h4>
          <div className={styles['tower-scores-grid']}>
            {Object.entries(result.towerScores).map(([key, score]) => (
              score !== undefined && (
                <TowerScore
                  key={key}
                  score={score}
                  label={towerLabelMap[key] || key}
                />
              )
            ))}
          </div>
        </div>
      )}

      {/* -- XAI Panel (academic explainable analysis) -- */}
      {result.xai && (
        <XAIPanel xai={result.xai} locale={locale} />
      )}

      {/* -- Vocal Analysis -- */}
      {result.vocalAnalysis && (
        <VocalSection vocal={result.vocalAnalysis} labels={labels} />
      )}

      {/* -- Indicators -- */}
      {result.features.artificialIndicators.length > 0 && (
        <div className={styles['indicators-section']}>
          <h4 className={styles['section-title']}>
            <Brain size={18} />
            {labels.analysisDetails || 'Analysis Details'}
          </h4>
          <div className={styles['indicators-list']}>
            {result.features.artificialIndicators.map((indicator, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className={styles['indicator-item']}
              >
                <Info size={14} />
                <span>{indicator}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* -- Detailed Metrics (expandable) -- */}
      <button
        type="button"
        className={styles['details-toggle']}
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        <span>{showDetails ? (labels.hideDetails || 'Hide Details') : (labels.showDetails || 'Show Technical Details')}</span>
      </button>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={styles['details-panel']}
        >
          <div className={styles['details-grid']}>
            <div className={styles['detail-item']}>
              <Clock size={14} />
              <span className={styles['detail-label']}>{labels.processingTime || 'Processing Time'}</span>
              <span className={styles['detail-value']}>{result.processingTime.toFixed(2)}s</span>
            </div>
            <div className={styles['detail-item']}>
              <Zap size={14} />
              <span className={styles['detail-label']}>{labels.sampleRate || 'Sample Rate'}</span>
              <span className={styles['detail-value']}>{result.audioInfo.sampleRate.toLocaleString()} Hz</span>
            </div>
            <div className={styles['detail-item']}>
              <BarChart3 size={14} />
              <span className={styles['detail-label']}>{labels.duration || 'Duration'}</span>
              <span className={styles['detail-value']}>
                {result.audioInfo.duration > 0
                  ? `${result.audioInfo.duration.toFixed(1)}s`
                  : '—'}
              </span>
            </div>
            <div className={styles['detail-item']}>
              <Radio size={14} />
              <span className={styles['detail-label']}>{labels.format || 'Format'}</span>
              <span className={styles['detail-value']}>{result.audioInfo.format.toUpperCase()}</span>
            </div>
            <div className={styles['detail-item']}>
              <Activity size={14} />
              <span className={styles['detail-label']}>Bitrate</span>
              <span className={styles['detail-value']}>
                {result.audioInfo.bitrate > 0 ? `${result.audioInfo.bitrate} kbps` : '—'}
              </span>
            </div>
            {result.audioInfo.channels !== undefined && (
              <div className={styles['detail-item']}>
                <Layers size={14} />
                <span className={styles['detail-label']}>Channels</span>
                <span className={styles['detail-value']}>
                  {result.audioInfo.channels === 1 ? 'Mono' : result.audioInfo.channels === 2 ? 'Stereo' : String(result.audioInfo.channels)}
                </span>
              </div>
            )}
          </div>

          {/* Source info */}
          <div className={styles['result-source']}>
            {source.kind === 'youtube' && (
              <>
                <div className={styles['result-source-item']}>
                  <span>Video ID</span>
                  <span>{source.videoId}</span>
                </div>
                <div className={styles['result-source-item']}>
                  <span>URL</span>
                  <span>{source.normalizedUrl}</span>
                </div>
              </>
            )}
            {source.kind === 'file' && (
              <>
                <div className={styles['result-source-item']}>
                  <span>{labels.fileName || 'File'}</span>
                  <span>{source.fileName}</span>
                </div>
                <div className={styles['result-source-item']}>
                  <span>{labels.fileSize || 'Size'}</span>
                  <span>{formatFileSize(source.fileSizeBytes)}</span>
                </div>
              </>
            )}
          </div>

          {/* Top features */}
          {result.topFeatures && result.topFeatures.length > 0 && (
            <div className={styles['top-features']}>
              <h5>{labels.keyDecisionFactors || 'Key Decision Factors'}</h5>
              {result.topFeatures.map((feat, i) => (
                <div key={i} className={styles['top-feature-row']}>
                  <span className={styles['top-feature-name']}>{feat.feature}</span>
                  <div className={styles['top-feature-bar-track']}>
                    <motion.div
                      className={styles['top-feature-bar-fill']}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(feat.importance * 100)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                    />
                  </div>
                  <span className={styles['top-feature-imp']}>{(feat.importance * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* -- Actions -- */}
      <div className={styles['result-actions']}>
        {onExport && (
          <button type="button" className={styles['btn-secondary']} onClick={onExport}>
            <Download size={16} />
            {labels.exportReport || 'Export Report'}
          </button>
        )}
        <button type="button" className={styles['btn-primary']} onClick={onReset}>
          {labels.analyzeAnother || 'Analyze Another'}
        </button>
      </div>
    </motion.div>
  )
}
