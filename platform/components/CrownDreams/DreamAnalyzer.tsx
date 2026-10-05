'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { MAX_DREAM_LENGTH, useDreamAnalysis, type DreamEmotion } from '@/hooks/useDreamAnalysis'
import styles from '@/styles/pages/crown-dreams.module.css'

const MIN_DREAM_LENGTH = 10

/** The writing surface: the dream goes in, a reading comes out beneath it. */
export const DreamAnalyzer: React.FC = () => {
  const { t, language } = useLanguage()
  const da = t.crownDreams.analyzer
  const { dreamText, setDreamText, state, result, error, analyzeDream, reset } = useDreamAnalysis(da.errors)

  const isReading = state === 'analyzing'
  const backendLanguage = language === 'tr' ? 'Turkish' : 'English'
  const emotionLabel = (emotion: DreamEmotion) => da.emotions?.[emotion] || emotion
  const tooShort = dreamText.trim().length < MIN_DREAM_LENGTH

  return (
    <section className={styles.section} aria-labelledby="dream-write-title">
      <div className={styles.sectionHead}>
        <h2 id="dream-write-title">{da.title}</h2>
        <p>{da.subtitle}</p>
      </div>

      <div className={styles.sectionBody}>
        <label htmlFor="dream-text" className="sr-only">{da.label}</label>
        <textarea
          id="dream-text"
          className={styles.textarea}
          placeholder={da.placeholder}
          value={dreamText}
          onChange={(e) => setDreamText(e.target.value)}
          disabled={isReading}
          rows={6}
          maxLength={MAX_DREAM_LENGTH}
          aria-describedby="dream-text-hint"
        />

        <div className={styles.writeFoot}>
          <p id="dream-text-hint" className={styles.hint}>
            <span className={styles.count}>{dreamText.length} / {MAX_DREAM_LENGTH}</span>
            {tooShort && <span> · {da.hint}</span>}
          </p>
          <button
            type="button"
            className={styles.primary}
            onClick={() => analyzeDream(backendLanguage)}
            disabled={tooShort || isReading}
            aria-busy={isReading}
          >
            {isReading ? da.analyzing : da.analyzeButton}
          </button>
        </div>

        <p className={styles.privacy}>{da.privacy}</p>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <div aria-live="polite">
          {result && (
            <div className={styles.reading}>
              <h3 className={styles.readingLabel}>{da.interpretationLabel}</h3>
              <p className={styles.interpretation}>{result.interpretation}</p>

              <dl className={styles.margins}>
                {result.emotions.length > 0 && (
                  <div>
                    <dt>{da.emotionsLabel}</dt>
                    <dd>{result.emotions.map(emotionLabel).join(', ')}</dd>
                  </div>
                )}
                {result.themes.length > 0 && (
                  <div>
                    <dt>{da.themesLabel}</dt>
                    <dd>{result.themes.join(', ')}</dd>
                  </div>
                )}
                {result.symbols.length > 0 && (
                  <div>
                    <dt>{da.symbolsLabel}</dt>
                    <dd>{result.symbols.join(', ')}</dd>
                  </div>
                )}
              </dl>

              {result.lucidityIndicator && <p className={styles.note}>{da.lucidDetected}</p>}
              <p className={styles.hint}>{da.disclaimer}</p>
              <button type="button" className={styles.link} onClick={reset}>{da.analyzeAnother}</button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default DreamAnalyzer
