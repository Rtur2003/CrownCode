'use client'

import React, { useCallback, useRef } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useMultitrackMixer, MULTITRACK_MIN_TRACKS, MULTITRACK_MAX_TRACKS } from '@/hooks/useMultitrackMixer'
import world from '@/styles/components/world-page.module.css'
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

  const panText = (pan: number) =>
    pan === 0 ? mt.panCenter : pan < 0 ? `${Math.abs(Math.round(pan * 100))}% ${mt.panLeft}` : `${Math.round(pan * 100)}% ${mt.panRight}`

  const results: Array<[string, string]> = analysis ? [
    [mt.analysis.tracksmixed, `${analysis.channels.filter((c) => !c.muted).length} / ${analysis.channels.length}`],
    [mt.analysis.outputDuration, `${analysis.outputDurationSec.toFixed(1)} s`],
    [mt.analysis.peakLevel, `${(analysis.outputPeakLevel * 100).toFixed(0)}%`],
    ...(analysis.clippingPrevented ? [[mt.analysis.normalization, mt.analysis.applied] as [string, string]] : []),
  ] : []

  return (
    <div>
      {tracks.length > 0 && (
        <ol className={styles.tracks}>
          {tracks.map((track) => (
            <li key={track.id} className={styles.track}>
              <div className={styles.trackHead}>
                <span className={styles.fileName}>{track.file.name}</span>
                <button type="button" className={world.link} onClick={() => removeTrack(track.id)} disabled={isProcessing}>
                  ×<span className="sr-only"> {mt.removeTrack}</span>
                </button>
              </div>
              <div className={styles.trackControls}>
                <button
                  type="button"
                  className={styles.mute}
                  aria-pressed={track.settings.muted}
                  disabled={isProcessing}
                  onClick={() => updateTrackSettings(track.id, { muted: !track.settings.muted })}
                >
                  {mt.mute}
                </button>
                <label className={styles.range}>
                  <span>{mt.gain}: {track.settings.gainDb.toFixed(1)} dB</span>
                  <input
                    type="range"
                    min={-60}
                    max={12}
                    step={0.5}
                    value={track.settings.gainDb}
                    disabled={isProcessing}
                    onChange={(e) => updateTrackSettings(track.id, { gainDb: parseFloat(e.target.value) })}
                  />
                </label>
                <label className={styles.range}>
                  <span>{mt.pan}: {panText(track.settings.pan)}</span>
                  <input
                    type="range"
                    min={-1}
                    max={1}
                    step={0.1}
                    value={track.settings.pan}
                    disabled={isProcessing}
                    onChange={(e) => updateTrackSettings(track.id, { pan: parseFloat(e.target.value) })}
                  />
                </label>
              </div>
            </li>
          ))}
        </ol>
      )}

      {canAddMore && (
        <div>
          <input
            ref={inputRef}
            id="mixer-file-input"
            type="file"
            accept="audio/*"
            multiple
            className="sr-only"
            disabled={isProcessing}
            onChange={handleFileSelect}
          />
          <label htmlFor="mixer-file-input" className={styles.pick} aria-disabled={isProcessing}>
            {mt.addTrack.replace('{{count}}', String(tracks.length)).replace('{{max}}', String(MULTITRACK_MAX_TRACKS))}
          </label>
        </div>
      )}

      {error && <p className={world.error} role="alert">{error.message}</p>}

      <div className={world.actions}>
        <button type="button" className={world.primary} onClick={mix} disabled={!canMix} aria-busy={isProcessing}>
          {isProcessing ? mt.processing : mt.mixButton}
        </button>
        {(resultUrl || error) && (
          <button type="button" className={world.link} onClick={reset}>{mt.startOver}</button>
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
              <button type="button" className={world.primary} onClick={handleDownload}>{mt.download}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MultitrackMixer
