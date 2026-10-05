/* eslint-disable @typescript-eslint/no-non-null-assertion -- tests index into arrays they just built */
import type { Timeline, TimelineSegment } from '@/hooks/analysisTypes'
import { bandTint, place, rangeOf, readTimeline, segmentAt, stamp, toneOf } from '@/components/Auris/timelineModel'

const seg = (index: number, p: number | null, isAi = false, margin = 0.5, state: TimelineSegment['state'] = 'ok'): TimelineSegment => ({
  index,
  start: index * 30,
  end: (index + 1) * 30,
  state,
  probability: p,
  isAi: p === null ? null : isAi,
  margin: p === null ? null : margin,
})

const timeline = (segments: TimelineSegment[], over: Partial<Timeline> = {}): Timeline => {
  const scored = segments.filter(s => s.state === 'ok')
  const flagged = scored.filter(s => s.isAi)
  return {
    durationSec: segments.length * 30,
    totalSec: segments.length * 30,
    truncated: false,
    threshold: 0.43,
    peaks: [],
    segments,
    summary: {
      scoredCount: scored.length,
      flaggedCount: flagged.length,
      scoredSec: scored.length * 30,
      aiShare: scored.length ? flagged.length / scored.length : 0,
      meanProbability: 0.5,
      maxProbability: 0.9,
      peakIndex: 0,
    },
    ...over,
  }
}

describe('stamp', () => {
  it('formats minutes and seconds', () => {
    expect(stamp(0)).toBe('0:00')
    expect(stamp(65)).toBe('1:05')
    expect(stamp(214.4)).toBe('3:34')
  })
  it('adds hours past an hour', () => {
    expect(stamp(3725)).toBe('1:02:05')
  })
  it('never goes negative', () => {
    expect(stamp(-4)).toBe('0:00')
  })
})

describe('rangeOf', () => {
  it('joins start and end', () => {
    expect(rangeOf({ start: 30, end: 60 })).toBe('0:30 – 1:00')
  })
})

describe('toneOf', () => {
  it('reads the verdict of scored windows only', () => {
    expect(toneOf(seg(0, 0.9, true))).toBe('ai')
    expect(toneOf(seg(0, 0.1, false))).toBe('human')
    expect(toneOf(seg(0, null, false, 0, 'silent'))).toBe('none')
    expect(toneOf(seg(0, null, false, 0, 'skipped'))).toBe('none')
  })
})

describe('place', () => {
  it('maps a window onto the scanned part as fractions', () => {
    const t = timeline([seg(0, 0.2), seg(1, 0.8, true), seg(2, 0.3)])
    expect(place(t, t.segments[1]!)).toEqual({ left: 1 / 3, width: 1 / 3 })
  })
})

describe('segmentAt', () => {
  const t = timeline([seg(0, 0.2), seg(1, 0.8, true)])
  it('finds the window covering a time', () => {
    expect(segmentAt(t, 10)?.index).toBe(0)
    expect(segmentAt(t, 30)?.index).toBe(1)
  })
  it('clamps the end of the track to the last window', () => {
    expect(segmentAt(t, 60)?.index).toBe(1)
  })
})

describe('readTimeline', () => {
  it('says nothing was scored when no window has a score', () => {
    const t = timeline([seg(0, null, false, 0, 'skipped')])
    expect(readTimeline(t).key).toBe('none')
    expect(readTimeline(t).peak).toBeNull()
  })

  it('reports a track that leans AI all the way through', () => {
    const r = readTimeline(timeline([seg(0, 0.9, true), seg(1, 0.8, true)]))
    expect(r.key).toBe('allAi')
    expect(r.flagged).toBe(2)
  })

  it('reports a track that reads human all the way through', () => {
    const r = readTimeline(timeline([seg(0, 0.1), seg(1, 0.2)]))
    expect(r.key).toBe('allHuman')
    expect(r.peak?.probability).toBe(0.2)
  })

  it('flags a human opening followed by AI-like windows', () => {
    const r = readTimeline(timeline([seg(0, 0.2), seg(1, 0.9, true), seg(2, 0.7, true)]))
    expect(r.key).toBe('openingHuman')
    expect(r.flagged).toBe(2)
    expect(r.peak?.index).toBe(1)
  })

  it('flags an AI-like opening followed by human windows', () => {
    const r = readTimeline(timeline([seg(0, 0.9, true), seg(1, 0.2), seg(2, 0.1)]))
    expect(r.key).toBe('openingAi')
  })

  it('works the AI share out of the scored windows, weighted by length', () => {
    const t = timeline([seg(0, 0.2), seg(1, 0.9, true), seg(2, 0.8, true), seg(3, null, false, 0, 'skipped')])
    const r = readTimeline(t)
    expect(r.flagged).toBe(2)
    expect(r.share).toBeCloseTo(2 / 3, 5)
  })

  it('skips unscored windows when looking at the opening', () => {
    const r = readTimeline(timeline([seg(0, null, false, 0, 'silent'), seg(1, 0.9, true), seg(2, 0.2)]))
    expect(r.key).toBe('openingAi')
    expect(r.scored).toBe(2)
  })
})

describe('bandTint', () => {
  it('is stronger the further a window sits from the threshold', () => {
    const near = bandTint(seg(0, 0.5, true, 0.1))
    const far = bandTint(seg(0, 0.95, true, 0.9))
    expect(far[3]).toBeGreaterThan(near[3])
  })
  it('keeps unscored windows faint and neutral', () => {
    expect(bandTint(seg(0, null, false, 0, 'silent'))[3]).toBeLessThan(0.1)
  })
})
