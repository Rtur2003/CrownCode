'use client'

import React, { useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Layers, Upload, X, Loader2, AlertCircle, Download, RotateCcw, Music, VolumeX, Volume2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useMultitrackMixer, MULTITRACK_MIN_TRACKS, MULTITRACK_MAX_TRACKS } from '@/hooks/useMultitrackMixer'
import styles from '@/styles/pages/creator-studio.module.css'

export const MultitrackMixer: React.FC = () => {
  const { t } = useLanguage()
  const mt = t.creatorStudio.multitrackMixer
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    tracks, state, error, resultUrl, analysis,
    addTrack, removeTrack, updateTrackSettings, mix, reset,
  } = useMultitrackMixer(mt.errors)

  const isProcessing = state === 'processing'
  const canMix = tracks.length >= MULTITRACK_MIN_TRACKS && tracks.length <= MULTITRACK_MAX_TRACKS && !isProcessing
  const canAddMore = tracks.length < MULTITRACK_MAX_TRACKS

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) {return}
    for (const file of Array.from(files)) {
      addTrack(file)
    }
    if (inputRef.current) {inputRef.current.value = ''}
  }

  const handleDownload = useCallback(() => {
    if (!resultUrl) {return}
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = 'crowncode-multitrack-mix.wav'
    a.click()
  }, [resultUrl])

  return (
    <motion.div
      className={styles['remix-studio']}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles['remix-header']}>
        <Layers size={18} />
        <h2>{mt.title}</h2>
      </div>
      <p className={styles['remix-subtitle']}>{mt.subtitle}</p>

      <div className={styles['mixer-tracks']}>
        {tracks.map((track, i) => (
          <motion.div
            key={track.id}
            className={styles['mixer-track']}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className={styles['mixer-track-head']}>
              <Music size={14} />
              <span className={styles['mixer-track-name']}>{track.file.name}</span>
              <button
                type="button"
                className={styles['mixer-track-remove']}
                onClick={() => removeTrack(track.id)}
                disabled={isProcessing}
                aria-label={mt.removeTrack}
              >
                <X size={14} />
              </button>
            </div>
            <div className={styles['mixer-track-controls']}>
              <button
                type="button"
                className={`${styles['mixer-mute-btn']} ${track.settings.muted ? styles['mixer-mute-active'] : ''}`}
                onClick={() => updateTrackSettings(track.id, { muted: !track.settings.muted })}
                disabled={isProcessing}
                aria-label={mt.mute}
                aria-pressed={track.settings.muted}
              >
                {track.settings.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <div className={styles['mixer-slider-group']}>
                <span className={styles['mixer-slider-label']}>{mt.gain}: {track.settings.gainDb.toFixed(1)}dB</span>
                <input
                  type="range"
                  min={-60}
                  max={12}
                  step={0.5}
                  value={track.settings.gainDb}
                  disabled={isProcessing}
                  onChange={(e) => updateTrackSettings(track.id, { gainDb: parseFloat(e.target.value) })}
                />
              </div>
              <div className={styles['mixer-slider-group']}>
                <span className={styles['mixer-slider-label']}>
                  {mt.pan}: {track.settings.pan === 0 ? mt.panCenter : track.settings.pan < 0 ? `${Math.abs(Math.round(track.settings.pan * 100))}% ${mt.panLeft}` : `${Math.round(track.settings.pan * 100)}% ${mt.panRight}`}
                </span>
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.1}
                  value={track.settings.pan}
                  disabled={isProcessing}
                  onChange={(e) => updateTrackSettings(track.id, { pan: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {canAddMore && (
        <div className={styles['mixer-add-track']}>
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileSelect}
            disabled={isProcessing}
            className={styles['track-drop-input']}
            id="mixer-file-input"
          />
          <label htmlFor="mixer-file-input" className={styles['mixer-add-track-label']}>
            <Upload size={16} />
            <span>{mt.addTrack.replace('{{count}}', String(tracks.length)).replace('{{max}}', String(MULTITRACK_MAX_TRACKS))}</span>
          </label>
        </div>
      )}

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
          onClick={mix}
          disabled={!canMix}
        >
          {isProcessing ? <Loader2 size={16} className={styles['spin']} /> : <Layers size={16} />}
          {isProcessing ? mt.processing : mt.mixButton}
        </button>
        {(resultUrl || error) && (
          <button type="button" className={styles['remix-reset-btn']} onClick={reset}>
            <RotateCcw size={14} />
            {mt.startOver}
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
                  <span>{mt.analysis.tracksmixed}</span>
                  <strong>{analysis.channels.filter((c) => !c.muted).length}/{analysis.channels.length}</strong>
                </div>
                <div className={styles['remix-analysis-item']}>
                  <span>{mt.analysis.outputDuration}</span>
                  <strong>{analysis.outputDurationSec.toFixed(1)}s</strong>
                </div>
                <div className={styles['remix-analysis-item']}>
                  <span>{mt.analysis.peakLevel}</span>
                  <strong>{(analysis.outputPeakLevel * 100).toFixed(0)}%</strong>
                </div>
                {analysis.clippingPrevented && (
                  <div className={styles['remix-analysis-item']}>
                    <span>{mt.analysis.normalization}</span>
                    <strong>{mt.analysis.applied}</strong>
                  </div>
                )}
              </div>
            )}

            <button type="button" className={styles['remix-download-btn']} onClick={handleDownload}>
              <Download size={16} />
              {mt.download}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default MultitrackMixer
