'use client'

import React from 'react'
import { BackendNote } from '@/components/UI/BackendNote'
import { useLanguage } from '@/context/LanguageContext'
import { MAX_DREAM_LENGTH, useDreamAnalysis, type DreamEmotion } from '@/hooks/useDreamAnalysis'
import world from '@/styles/components/world-page.module.css'
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
    <section className={world.section} aria-labelledby="dream-write-title">
      <div className={world.sectionHead}>
        <h2 id="dream-write-title">{da.title}</h2>
        <p>{da.subtitle}</p>
      </div>

      <div className={world.sectionBody}>
        <BackendNote />
        <label htmlFor="dream-text" className="sr-only">{da.label}</label>
        <textarea
          id="dream-text"
          className={world.textarea}
          placeholder={da.placeholder}
          value={dreamText}
          onChange={(e) => setDreamText(e.target.value)}
          disabled={isReading}
          rows={6}
          maxLength={MAX_DREAM_LENGTH}
          aria-describedby="dream-text-hint"
        />

        <div className={styles.writeFoot}>
          <p id="dream-text-hint" className={world.hint}>
            <span className={world.count}>{dreamText.length} / {MAX_DREAM_LENGTH}</span>
            {tooShort && <span> · {da.hint}</span>}
          </p>
          <button
            type="button"
            className={world.primary}
            onClick={() => analyzeDream(backendLanguage)}
            disabled={tooShort || isReading}
            aria-busy={isReading}
          >
            {isReading ? da.analyzing : da.analyzeButton}
          </button>
        </div>

        <p className={world.privacy}>{da.privacy}</p>

        {error && <p className={world.error} role="alert">{error}</p>}

        <div aria-live="polite">
          {result && (
            <div className={world.reading}>
              <h3 className={world.readingLabel}>{da.interpretationLabel}</h3>
              <p className={world.interpretation}>{result.interpretation}</p>

              <dl className={world.margins}>
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

              {result.lucidityIndicator && <p className={world.note}>{da.lucidDetected}</p>}
              <p className={world.hint}>{da.disclaimer}</p>
              <button type="button" className={world.link} onClick={reset}>{da.analyzeAnother}</button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default DreamAnalyzer
