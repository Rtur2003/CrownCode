/* eslint-disable @typescript-eslint/no-non-null-assertion -- peak loops; every index is bounded by its loop */
import React, { useEffect, useMemo, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import type { Timeline, TimelineSegment } from '@/hooks/analysisTypes'
import { useLanguage } from '@/context/LanguageContext'
import { fill, num, percent } from '@/components/Auris/format'
import { useCanvasSize } from '@/components/Auris/SignalViews'
import {
  bandTint,
  isScored,
  place,
  rangeOf,
  readTimeline,
  segmentAt,
  stamp,
  strengthOf,
  toneOf,
} from '@/components/Auris/timelineModel'
import page from '@/styles/pages/auris.module.css'
import css from '@/components/Auris/Timeline.module.css'

export interface TimelinePlayback {
  available: boolean
  playing: boolean
  /** Playback position as a fraction of the whole audio. */
  progress: number
  toggle: () => void
  playFrom: (ratio: number) => void
}

const AI = '242, 180, 95'
const HUMAN = '205, 192, 170'
const QUIET = '160, 148, 130'

interface Props {
  timeline: Timeline
  playback: TimelinePlayback
}

export const TimelineView: React.FC<Props> = ({ timeline, playback }) => {
  const { t, language } = useLanguage()
  const T = t.aiDetection.timeline
  const insight = useMemo(() => readTimeline(timeline), [timeline])
  const [selected, setSelected] = useState<number | null>(null)
  const [hover, setHover] = useState<number | null>(null)

  const scale = timeline.totalSec > 0 ? timeline.totalSec / timeline.durationSec : 1
  const playheadSec = playback.progress * timeline.totalSec
  const playing = playback.playing ? segmentAt(timeline, playheadSec)?.index ?? null : null
  const activeIndex = hover ?? selected ?? playing ?? insight.peak?.index ?? 0
  const active = timeline.segments[activeIndex] ?? timeline.segments[0]

  const choose = (s: TimelineSegment) => {
    setSelected(s.index)
    if (playback.available) {playback.playFrom(s.start / timeline.totalSec)}
  }

  const sentence = fill(T.insight[insight.key], {
    flagged: insight.flagged,
    scored: insight.scored,
    share: percent(language, insight.share),
    p: insight.peak ? percent(language, insight.peak.probability) : '',
    when: insight.peak ? rangeOf(insight.peak) : '',
  })

  const stats: Array<[string, string]> = [
    [T.stats.windows, `${insight.flagged} / ${insight.scored}`],
    [T.stats.share, percent(language, timeline.summary.aiShare)],
    [T.stats.mean, percent(language, timeline.summary.meanProbability)],
    [T.stats.peak, insight.peak ? `${rangeOf(insight.peak)} · ${percent(language, insight.peak.probability)}` : '–'],
  ]

  const ticks = useMemo(() => {
    const step = timeline.durationSec > 240 ? 60 : 30
    const out: number[] = []
    for (let s = 0; s <= timeline.durationSec + 0.5; s += step) {out.push(s)}
    return out
  }, [timeline.durationSec])

  return (
    <div className={css.root}>
      <p className={css.insight}>{sentence}</p>

      <div className={css.figure}>
        <div className={css.stack} onMouseLeave={() => setHover(null)}>
          <div className={css.wave}>
            {timeline.segments.map(s => {
              const { left, width } = place(timeline, s)
              const [r, g, b, a] = bandTint(s)
              return (
                <span
                  key={s.index}
                  className={css.band}
                  data-tone={toneOf(s)}
                  style={{ left: `${left * 100}%`, width: `${width * 100}%`, background: `rgb(${r} ${g} ${b} / ${a})` }}
                />
              )
            })}
            <WaveCanvas timeline={timeline} progress={playback.progress * scale} label={T.waveLabel} />
            {timeline.segments.slice(1).map(s => (
              <span key={s.index} className={css.edge} style={{ left: `${place(timeline, s).left * 100}%` }} aria-hidden="true" />
            ))}
          </div>

          <div className={css.lane} role="img" aria-label={T.laneLabel}>
            <span className={css.thresholdLine} style={{ bottom: `${timeline.threshold * 100}%` }} aria-hidden="true">
              <em>{fill(T.threshold, { t: num(language, timeline.threshold, 2) })}</em>
            </span>
            {timeline.segments.map(s => {
              const { left, width } = place(timeline, s)
              const scored = isScored(s)
              return (
                <span key={s.index} className={css.col} style={{ left: `${left * 100}%`, width: `${width * 100}%` }}>
                  {scored ? (
                    <span
                      className={css.fill}
                      data-tone={toneOf(s)}
                      style={{ height: `${Math.max(2, s.probability * 100)}%`, ['--i' as string]: s.index }}
                    />
                  ) : (
                    <span className={css.gap} data-state={s.state} />
                  )}
                </span>
              )
            })}
          </div>

          <ol className={css.hits}>
            {timeline.segments.map(s => {
              const { left, width } = place(timeline, s)
              const label = isScored(s)
                ? `${rangeOf(s)}, ${percent(language, s.probability)}, ${T.legend[toneOf(s) as 'ai' | 'human']}`
                : `${rangeOf(s)}, ${T.detail.states[s.state as 'silent' | 'skipped' | 'failed']}`
              return (
                <li key={s.index} style={{ left: `${left * 100}%`, width: `${width * 100}%` }}>
                  <button
                    type="button"
                    className={css.hit}
                    data-active={activeIndex === s.index ? 'true' : undefined}
                    aria-label={label}
                    aria-pressed={selected === s.index}
                    onMouseEnter={() => setHover(s.index)}
                    onFocus={() => setHover(s.index)}
                    onBlur={() => setHover(null)}
                    onClick={() => choose(s)}
                  />
                </li>
              )
            })}
          </ol>

          {playback.available && (
            <span
              className={css.playhead}
              style={{ left: `${Math.min(1, playback.progress * scale) * 100}%` }}
              data-visible={playback.progress > 0 ? 'true' : undefined}
              aria-hidden="true"
            />
          )}
        </div>

        <div className={css.axis} aria-hidden="true">
          {ticks.map(s => (
            <span key={s} style={{ left: `${(s / timeline.durationSec) * 100}%` }}>{stamp(s)}</span>
          ))}
        </div>
      </div>

      <ul className={css.legend} aria-hidden="true">
        <li data-tone="ai">{T.legend.ai}</li>
        <li data-tone="human">{T.legend.human}</li>
        <li data-tone="none">{T.legend.none}</li>
      </ul>

      {active && <WindowCard segment={active} threshold={timeline.threshold} playback={playback} total={timeline.totalSec} />}

      <dl className={page.statGrid}>
        {stats.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>

      {timeline.truncated && (
        <p className={page.small}>{fill(T.truncated, { scanned: stamp(timeline.durationSec), total: stamp(timeline.totalSec) })}</p>
      )}
      <p className={`${page.small} ${css.note}`}>{T.note}</p>
    </div>
  )
}

/** Peak bars of the whole track, tinted by the window each one sits in. */
const WaveCanvas: React.FC<{ timeline: Timeline; progress: number; label: string }> = ({ timeline, progress, label }) => {
  const { ref, w, h, dpr } = useCanvasSize()
  const { peaks, segments, durationSec } = timeline

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !w || !h || !peaks.length) {return}
    canvas.width = w * dpr
    canvas.height = h * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    const bar = w / peaks.length
    const mid = h / 2
    const played = Math.floor(Math.min(1, progress) * peaks.length)
    for (let i = 0; i < peaks.length; i++) {
      const sec = ((i + 0.5) / peaks.length) * durationSec
      const seg = segments.find(s => sec >= s.start && sec < s.end) ?? segments[segments.length - 1]
      const tone = seg ? toneOf(seg) : 'none'
      const rgb = tone === 'ai' ? AI : tone === 'human' ? HUMAN : QUIET
      const strength = seg ? strengthOf(seg) : 0
      const alpha = i < played ? 1 : tone === 'ai' ? 0.72 + 0.28 * strength : tone === 'human' ? 0.5 : 0.28
      ctx.fillStyle = `rgb(${rgb} / ${alpha})`
      const half = Math.max(1, Math.pow(peaks[i]!, 0.8) * mid * 0.9)
      ctx.fillRect(i * bar, mid - half, Math.max(1, bar - 0.8), half * 2)
    }
  }, [peaks, segments, durationSec, progress, w, h, dpr, ref])

  return <canvas ref={ref} className={css.canvas} role="img" aria-label={label} />
}

const WindowCard: React.FC<{ segment: TimelineSegment; threshold: number; playback: TimelinePlayback; total: number }> = ({
  segment, threshold, playback, total,
}) => {
  const { t, language } = useLanguage()
  const D = t.aiDetection.timeline.detail
  const tone = toneOf(segment)
  const playingHere = playback.playing
    && playback.progress * total >= segment.start
    && playback.progress * total < segment.end

  return (
    <div className={css.card} data-tone={tone} aria-live="polite">
      <div className={css.cardHead}>
        <span className={css.range}>{rangeOf(segment)}</span>
        <span className={page.chip} data-tone={tone === 'ai' ? 'warn' : tone === 'human' ? 'ok' : undefined}>
          {t.aiDetection.timeline.legend[tone]}
        </span>
        {playback.available && (
          <button
            type="button"
            className={css.play}
            onClick={() => (playingHere ? playback.toggle() : playback.playFrom(segment.start / total))}
          >
            {playingHere ? <Pause size={14} /> : <Play size={14} />}
            {playingHere ? D.pause : D.play}
          </button>
        )}
      </div>

      {isScored(segment) ? (
        <>
          <div className={css.reading}>
            <strong>{percent(language, segment.probability)}</strong>
            <span className={css.track} aria-hidden="true">
              <span className={css.trackFill} data-tone={tone} style={{ transform: `scaleX(${segment.probability})` }} />
              <span className={css.trackTick} style={{ left: `${threshold * 100}%` }} />
            </span>
            <small>
              {fill(segment.probability >= threshold ? D.over : D.under, {
                n: num(language, Math.abs(segment.probability - threshold) * 100, 0),
              })}
            </small>
          </div>

          {segment.hasVocals === false && <p className={page.small}>{D.noVocals}</p>}

          {(segment.reasons?.length ?? 0) > 0 && (
            <>
              <h4 className={css.reasonsTitle}>{D.reasons}</h4>
              <ul className={css.reasons}>
                {segment.reasons!.map(r => (
                  <li key={r.name} data-direction={r.direction}>
                    <span>{language === 'en' ? r.labelEn : r.label}</span>
                    <small>{r.direction === 'towards_ai' ? D.towardsAi : D.towardsHuman}</small>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : (
        <p className={page.small}>{D.states[segment.state as 'silent' | 'skipped' | 'failed']}</p>
      )}
    </div>
  )
}
