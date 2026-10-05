import type { Timeline, TimelineSegment } from '@/hooks/analysisTypes'

/** A window that carries a score (silent, skipped and failed ones do not). */
export const isScored = (s: TimelineSegment): s is TimelineSegment & { probability: number } =>
  s.state === 'ok' && typeof s.probability === 'number'

export type Tone = 'ai' | 'human' | 'none'

export const toneOf = (s: TimelineSegment): Tone => (!isScored(s) ? 'none' : s.isAi ? 'ai' : 'human')

/** How far the window sits from the threshold, 0 to 1. */
export const strengthOf = (s: TimelineSegment) => Math.min(1, Math.max(0, s.margin ?? 0))

/** Position in the track as m:ss, or h:mm:ss past an hour. */
export const stamp = (sec: number) => {
  const total = Math.max(0, Math.round(sec))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`
}

export const rangeOf = (s: Pick<TimelineSegment, 'start' | 'end'>) => `${stamp(s.start)} – ${stamp(s.end)}`

/** Left edge and width of a window as fractions of the scanned part. */
export const place = (t: Timeline, s: TimelineSegment) => {
  const total = t.durationSec > 0 ? t.durationSec : 1
  return { left: s.start / total, width: (s.end - s.start) / total }
}

/** The window covering `sec`, if any. */
export const segmentAt = (t: Timeline, sec: number) =>
  t.segments.find(s => sec >= s.start && sec < s.end) ?? (sec >= t.durationSec ? t.segments[t.segments.length - 1] : undefined)

/** What the scan says about the track as a whole, as a key the page turns into a sentence. */
export type InsightKey =
  | 'none'
  | 'allAi'
  | 'allHuman'
  | 'openingHuman'
  | 'openingAi'

export interface Insight {
  key: InsightKey
  scored: number
  flagged: number
  /** Share of the scored time that leans AI, 0 to 1. */
  share: number
  peak: (TimelineSegment & { probability: number }) | null
}

export const readTimeline = (t: Timeline): Insight => {
  const scored = t.segments.filter(isScored)
  const flagged = scored.filter(s => s.isAi)
  const peak = scored.length ? scored.reduce((a, b) => (b.probability > a.probability ? b : a)) : null
  const base = { scored: scored.length, flagged: flagged.length, share: t.summary.aiShare, peak }

  const first = scored[0]
  if (!first) {return { ...base, key: 'none' }}
  if (flagged.length === scored.length) {return { ...base, key: 'allAi' }}
  if (flagged.length === 0) {return { ...base, key: 'allHuman' }}
  return { ...base, key: first.isAi ? 'openingAi' : 'openingHuman' }
}

/** Fill colours for a window's band behind the waveform (r, g, b, alpha). */
export const bandTint = (s: TimelineSegment): [number, number, number, number] => {
  const k = strengthOf(s)
  switch (toneOf(s)) {
    case 'ai': return [242, 180, 95, 0.1 + 0.3 * k]
    case 'human': return [143, 192, 171, 0.05 + 0.15 * k]
    default: return [160, 148, 130, 0.05]
  }
}
