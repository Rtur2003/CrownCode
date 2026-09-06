'use client'

import React, { useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Music, Upload, X, Wand2, Loader2, AlertCircle, Download, RotateCcw, Gauge, KeyRound } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useRemixStudio } from '@/hooks/useRemixStudio'
import styles from '@/styles/pages/creator-studio.module.css'

interface TrackSlotProps {
  label: string
  file: File | null
  onSelect: (file: File | null) => void
  disabled: boolean
  placeholder: string
}

const TrackSlot: React.FC<TrackSlotProps> = ({ label, file, onSelect, disabled, placeholder }) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(e.target.files?.[0] ?? null)
  }

  return (
    <div className={styles['track-slot']}>
      <span className={styles['track-slot-label']}>{label}</span>
      <div
        className={`${styles['track-drop']} ${file ? styles['track-drop-filled'] : ''}`}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {inputRef.current?.click()}
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          onChange={handleChange}
          disabled={disabled}
          className={styles['track-drop-input']}
        />
        {file ? (
          <div className={styles['track-file']}>
            <Music size={18} />
            <span className={styles['track-file-name']}>{file.name}</span>
            <span className={styles['track-file-size']}>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
            <button
              type="button"
              className={styles['track-file-remove']}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(null)
                if (inputRef.current) {inputRef.current.value = ''}
              }}
              aria-label={label}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className={styles['track-drop-empty']}>
            <Upload size={20} />
            <span>{placeholder}</span>
          </div>
        )}
      </div>
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

  return (
    <motion.div
      className={styles['remix-studio']}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles['remix-header']}>
        <Wand2 size={18} />
        <h2>{rs.title}</h2>
      </div>
      <p className={styles['remix-subtitle']}>{rs.subtitle}</p>

      <div className={styles['track-slots']}>
        <TrackSlot
          label={rs.trackALabel}
          file={trackA}
          onSelect={setTrackA}
          disabled={isProcessing}
          placeholder={rs.trackAPlaceholder}
        />
        <TrackSlot
          label={rs.trackBLabel}
          file={trackB}
          onSelect={setTrackB}
          disabled={isProcessing}
          placeholder={rs.trackBPlaceholder}
        />
      </div>

      <div className={styles['remix-options']}>
        <label className={styles['remix-toggle']}>
          <input
            type="checkbox"
            checked={options.matchTempo}
            disabled={isProcessing}
            onChange={(e) => setOptions({ ...options, matchTempo: e.target.checked })}
          />
          <Gauge size={14} />
          <span>{rs.matchTempo}</span>
        </label>
        <label className={styles['remix-toggle']}>
          <input
            type="checkbox"
            checked={options.matchKey}
            disabled={isProcessing}
            onChange={(e) => setOptions({ ...options, matchKey: e.target.checked })}
          />
          <KeyRound size={14} />
          <span>{rs.matchKey}</span>
        </label>
        <div className={styles['remix-crossfade']}>
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
        </div>
      </div>

      {error && (
        <div className={styles['remix-error']}>
          <AlertCircle size={16} />
          <span>{error.message}</span>
        </div>
      )}

      <div className={styles['remix-actions']}>
        <button
          type="button"
          className={styles['remix-blend-btn']}
          onClick={blend}
          disabled={!canBlend}
        >
          {isProcessing ? <Loader2 size={16} className={styles['spin']} /> : <Wand2 size={16} />}
          {isProcessing ? rs.processing : rs.blendButton}
        </button>
        {(resultUrl || error) && (
          <button type="button" className={styles['remix-reset-btn']} onClick={reset}>
            <RotateCcw size={14} />
            {rs.startOver}
          </button>
        )}
      </div>

      <AnimatePresence>
        {resultUrl && (
          <motion.div
            className={styles['remix-result']}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <audio controls src={resultUrl} className={styles['remix-audio']} />

            {analysis && (
              <div className={styles['remix-analysis']}>
                <div className={styles['remix-analysis-item']}>
                  <span>{rs.analysis.trackA}</span>
                  <strong>{analysis.trackABpm} BPM · {analysis.trackAKey}</strong>
                </div>
                <div className={styles['remix-analysis-item']}>
                  <span>{rs.analysis.trackB}</span>
                  <strong>{analysis.trackBBpm} BPM · {analysis.trackBKey}</strong>
                </div>
                {options.matchTempo && (
                  <div className={styles['remix-analysis-item']}>
                    <span>{rs.analysis.stretchApplied}</span>
                    <strong>{analysis.appliedStretchRate.toFixed(2)}x</strong>
                  </div>
                )}
                {options.matchKey && analysis.appliedPitchShiftSemitones !== 0 && (
                  <div className={styles['remix-analysis-item']}>
                    <span>{rs.analysis.pitchShiftApplied}</span>
                    <strong>{analysis.appliedPitchShiftSemitones > 0 ? '+' : ''}{analysis.appliedPitchShiftSemitones} st</strong>
                  </div>
                )}
                <div className={styles['remix-analysis-item']}>
                  <span>{rs.analysis.outputDuration}</span>
                  <strong>{analysis.outputDurationSec.toFixed(1)}s</strong>
                </div>
              </div>
            )}

            <button type="button" className={styles['remix-download-btn']} onClick={handleDownload}>
              <Download size={16} />
              {rs.download}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default RemixStudio
