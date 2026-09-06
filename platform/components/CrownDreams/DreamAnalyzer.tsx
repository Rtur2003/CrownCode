'use client'

import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, AlertCircle, Brain, Tag, Layers, Wand2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useDreamAnalysis, DreamEmotion } from '@/hooks/useDreamAnalysis'
import { GlassCard } from '@/components/CrownDreams/GlassCard'
import { CyberButton } from '@/components/CrownDreams/CyberButton'
import styles from '@/styles/pages/crown-dreams.module.css'

// Colors for the 12 emotions the backend can return — reuses the existing
// journal palette where the label overlaps, with a sane distinct color for
// the ones the mock journal data never modeled (sadness, anger, excitement,
// nostalgia, shame).
const ANALYZER_EMOTION_COLORS: Record<DreamEmotion, string> = {
  joy: '#FFD700',
  fear: '#8B0000',
  anxiety: '#FF6347',
  sadness: '#4A6FA5',
  anger: '#C1440E',
  confusion: '#9370DB',
  peace: '#87CEEB',
  excitement: '#FF8C00',
  nostalgia: '#B08D57',
  wonder: '#DAA520',
  shame: '#6B4C6B',
  love: '#FF69B4',
}

interface DreamAnalyzerProps {
  onClose?: () => void
}

export const DreamAnalyzer: React.FC<DreamAnalyzerProps> = ({ onClose }) => {
  const { t, language } = useLanguage()
  const da = t.crownDreams.analyzer
  const { dreamText, setDreamText, state, result, error, analyzeDream, reset } = useDreamAnalysis(da.errors)

  const isAnalyzing = state === 'analyzing'
  const backendLanguage = language === 'tr' ? 'Turkish' : 'English'

  const emotionLabel = (emotion: DreamEmotion) => da.emotions?.[emotion] || emotion
  const charCount = dreamText.length

  return (
    <GlassCard variant="glow" className={styles['analyzer-card']}>
      <div className={styles['analyzer-header']}>
        <h3 className={styles['section-title']}>
          <Wand2 size={16} />
          {da.title}
        </h3>
        {onClose && (
          <button type="button" className={styles['close-detail']} onClick={onClose} aria-label={da.close}>
            &times;
          </button>
        )}
      </div>

      <p className={styles['analyzer-subtitle']}>{da.subtitle}</p>

      <textarea
        className={styles['analyzer-textarea']}
        placeholder={da.placeholder}
        value={dreamText}
        onChange={(e) => setDreamText(e.target.value)}
        disabled={isAnalyzing}
        rows={5}
        maxLength={4000}
      />
      <div className={styles['analyzer-char-count']}>{charCount}/4000</div>

      {error && (
        <div className={styles['analyzer-error']}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <CyberButton
        leftIcon={<Sparkles size={16} />}
        isLoading={isAnalyzing}
        onClick={() => analyzeDream(backendLanguage)}
        disabled={dreamText.trim().length < 10}
      >
        {isAnalyzing ? da.analyzing : da.analyzeButton}
      </CyberButton>

      <AnimatePresence>
        {result && (
          <motion.div
            className={styles['analyzer-result']}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles['analyzer-result-section']}>
              <h4>
                <Brain size={14} />
                {da.emotionsLabel}
              </h4>
              <div className={styles['emotion-tags']}>
                {result.emotions.map((emotion) => (
                  <span
                    key={emotion}
                    className={styles['emotion-tag']}
                    style={{
                      backgroundColor: `${ANALYZER_EMOTION_COLORS[emotion]}20`,
                      borderColor: ANALYZER_EMOTION_COLORS[emotion],
                      color: ANALYZER_EMOTION_COLORS[emotion],
                    }}
                  >
                    {emotionLabel(emotion)}
                  </span>
                ))}
              </div>
            </div>

            {result.themes.length > 0 && (
              <div className={styles['analyzer-result-section']}>
                <h4>
                  <Layers size={14} />
                  {da.themesLabel}
                </h4>
                <div className={styles['symbol-tags']}>
                  {result.themes.map((theme) => (
                    <span key={theme} className={styles['symbol-tag']}>{theme}</span>
                  ))}
                </div>
              </div>
            )}

            {result.symbols.length > 0 && (
              <div className={styles['analyzer-result-section']}>
                <h4>
                  <Tag size={14} />
                  {da.symbolsLabel}
                </h4>
                <div className={styles['symbol-tags']}>
                  {result.symbols.map((symbol) => (
                    <span key={symbol} className={styles['symbol-tag']}>{symbol}</span>
                  ))}
                </div>
              </div>
            )}

            <div className={styles['ai-analysis']}>
              <h4>
                <Brain size={14} />
                {da.interpretationLabel}
              </h4>
              <p>{result.interpretation}</p>
            </div>

            {result.lucidityIndicator && (
              <div className={styles['lucid-badge']}>{da.lucidDetected}</div>
            )}

            <button type="button" className={styles['view-all-btn']} onClick={reset}>
              {da.analyzeAnother}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}

export default DreamAnalyzer
