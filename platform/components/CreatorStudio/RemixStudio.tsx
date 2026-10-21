'use client'

import React, { useCallback, useRef } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useRemixStudio } from '@/hooks/useRemixStudio'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/creator-studio.module.css'

interface TrackSlotProps {
  label: string
  file: File | null
  onSelect: (file: File | null) => void
  disabled: boolean
  placeholder: string
  inputId: string
}

const TrackSlot: React.FC<TrackSlotProps> = ({ label, file, onSelect, disabled, placeholder, inputId }) => {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className={styles.slot}>
      <span className={world.fieldLabel}>{label}</span>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="audio/*"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
      />
      {file ? (
        <p className={styles.file}>
          <span className={styles.fileName}>{file.name}</span>
          <span className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
          <button
            type="button"
            className={world.link}
            disabled={disabled}
            onClick={() => {
              onSelect(null)
              if (inputRef.current) {inputRef.current.value = ''}
            }}
          >
            ×<span className="sr-only"> {label}</span>
          </button>
        </p>
      ) : (
        <label htmlFor={inputId} className={styles.pick} aria-disabled={disabled}>{placeholder}</label>
      )}
    </div>
  )
}

export const RemixStudio: React.FC = () => {
  const { t } = useLanguage()
  const rs = t.creatorStudio.remixStudio

  const {
    trackA, trackB, options, state, error, resultUrl, analysis,
    setTrackA, setTrackB, setOptions, blend, reset,
  } = useRemixStudio(rs.errors)

  const isProcessing = state === 'processing'
  const canBlend = !!trackA && !!trackB && !isProcessing

  const handleDownload = useCallback(() => {
    if (!resultUrl) {return}
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = 'crowncode-remix.wav'
    a.click()
  }, [resultUrl])

  const results: Array<[string, string]> = analysis ? [
    [rs.analysis.trackA, `${analysis.trackABpm} BPM · ${analysis.trackAKey}`],
    [rs.analysis.trackB, `${analysis.trackBBpm} BPM · ${analysis.trackBKey}`],
    ...(options.matchTempo ? [[rs.analysis.stretchApplied, `${analysis.appliedStretchRate.toFixed(2)}x`] as [string, string]] : []),
    ...(options.matchKey && analysis.appliedPitchShiftSemitones !== 0
      ? [[rs.analysis.pitchShiftApplied, `${analysis.appliedPitchShiftSemitones > 0 ? '+' : ''}${analysis.appliedPitchShiftSemitones} st`] as [string, string]]
      : []),
    [rs.analysis.outputDuration, `${analysis.outputDurationSec.toFixed(1)} s`],
  ] : []

  return (
    <div>
      <div className={styles.slots}>
        <TrackSlot inputId="remix-a" label={rs.trackALabel} file={trackA} onSelect={setTrackA} disabled={isProcessing} placeholder={rs.trackAPlaceholder} />
        <TrackSlot inputId="remix-b" label={rs.trackBLabel} file={trackB} onSelect={setTrackB} disabled={isProcessing} placeholder={rs.trackBPlaceholder} />
      </div>

      <div className={styles.options}>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={options.matchTempo}
            disabled={isProcessing}
            onChange={(e) => setOptions({ ...options, matchTempo: e.target.checked })}
          />
          <span>{rs.matchTempo}</span>
        </label>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={options.matchKey}
            disabled={isProcessing}
            onChange={(e) => setOptions({ ...options, matchKey: e.target.checked })}
          />
          <span>{rs.matchKey}</span>
        </label>
        <label className={styles.range}>
          <span>{rs.crossfadeLabel.replace('{{seconds}}', String(options.crossfadeSeconds))}</span>
          <input
            type="range"
            min={0.5}
            max={30}
            step={0.5}
            value={options.crossfadeSeconds}
            disabled={isProcessing}
            onChange={(e) => setOptions({ ...options, crossfadeSeconds: parseFloat(e.target.value) })}
          />
        </label>
      </div>

      {error && <p className={world.error} role="alert">{error.message}</p>}

      <div className={world.actions}>
        <button type="button" className={world.primary} onClick={blend} disabled={!canBlend} aria-busy={isProcessing}>
          {isProcessing ? rs.processing : rs.blendButton}
        </button>
        {(resultUrl || error) && (
          <button type="button" className={world.link} onClick={reset}>{rs.startOver}</button>
        )}
      </div>

      <div aria-live="polite">
        {resultUrl && (
          <div className={world.reading}>
            <audio controls src={resultUrl} className={styles.audio} />
            {results.length > 0 && (
              <dl className={world.margins}>
                {results.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
              </dl>
            )}
            <div className={world.actions}>
              <button type="button" className={world.primary} onClick={handleDownload}>{rs.download}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RemixStudio
