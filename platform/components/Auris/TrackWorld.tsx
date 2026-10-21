/**
 * The controls that belong to the track world: where on the planet you are in
 * the track, what the models read there, a way to hear that moment and a short
 * key. The planet is WebGL and hidden from assistive technology; this is the
 * same thing in plain controls (a slider, a button, text), so nothing the planet
 * offers is only available by dragging.
 */

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { fill, percent } from '@/components/Auris/format'
import { isScored, stamp } from '@/components/Auris/timelineModel'
import { secondsAt, segmentAt, tickEvery, type TrackSurface } from '@/components/Auris/trackSurface'
import type { Timeline, TimelineSegment } from '@/hooks/analysisTypes'
import styles from '@/styles/pages/auris.module.css'

interface TrackWorldProps {
  surface: TrackSurface
  timeline: Timeline | null
  /** Seconds in the whole track, to say when the planet covers only the opening. */
  totalSec: number
  /** Longitude under the pointer or facing the viewer, 0 to 1. */
  at: number
  playing: boolean
  canHear: boolean
  onScrub: (u: number) => void
  onHear: () => void
  onStop: () => void
}

type Reading = { tone: 'ai' | 'human' | 'none'; key: 'ai' | 'human' | 'silent' | 'none'; p: number | null }

/** What the models read at a stretch of the track, as a tone and a word. */
export const readingOf = (segment: TimelineSegment | undefined): Reading => {
  if (!segment) {return { tone: 'none', key: 'none', p: null }}
  if (segment.state === 'silent') {return { tone: 'none', key: 'silent', p: null }}
  if (!isScored(segment)) {return { tone: 'none', key: 'none', p: null }}
  return segment.isAi
    ? { tone: 'ai', key: 'ai', p: segment.probability }
    : { tone: 'human', key: 'human', p: 1 - segment.probability }
}

export const TrackWorld: React.FC<TrackWorldProps> = ({ surface, timeline, totalSec, at, playing, canHear, onScrub, onHear, onStop }) => {
  const { t, language } = useLanguage()
  const W = t.aiDetection.world
  const sec = secondsAt(surface, at)
  const reading = readingOf(segmentAt(timeline, sec))
  const readout = fill(W.readout[reading.key], { p: reading.p === null ? '' : percent(language, reading.p) })
  const covers = surface.spanSec + 1 < totalSec

  return (
    <aside className={styles.trackDock} aria-labelledby="track-world-title">
      <h2 id="track-world-title" className={styles.trackTitle}>{W.title}</h2>

      <p className={styles.trackRead}>
        <span className={styles.trackTime}>{stamp(sec)}</span>
        {surface.hasLean && <span data-tone={reading.tone}>{readout}</span>}
      </p>

      <input
        className={styles.trackSlider}
        type="range"
        min={0}
        max={1000}
        step={1}
        value={Math.min(1000, Math.round(at * 1000))}
        aria-label={W.position}
        aria-valuetext={surface.hasLean ? `${stamp(sec)}, ${readout}` : stamp(sec)}
        onChange={e => onScrub(Number(e.target.value) / 1000)}
      />

      {canHear && (
        <div className={styles.trackActions}>
          <button type="button" className={styles.btnGhost} onClick={playing ? onStop : onHear}>
            {playing ? W.stop : W.hear}
          </button>
        </div>
      )}

      <details className={styles.trackHow}>
        <summary>{W.how}</summary>
        <p>{W.lead}</p>
        <ul>
          <li>{W.legend.raised}</li>
          {surface.hasLean && <li data-tone="ai">{W.legend.ai}</li>}
          {surface.hasLean && <li data-tone="human">{W.legend.human}</li>}
          {surface.hasRings && <li>{W.legend.rings}</li>}
          <li>{fill(W.legend.marks, { s: tickEvery(surface.spanSec) })}</li>
        </ul>
        {covers && <p>{fill(W.covers, { sec: Math.round(surface.spanSec) })}</p>}
      </details>
    </aside>
  )
}

export default TrackWorld
