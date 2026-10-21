/* eslint-disable @typescript-eslint/no-non-null-assertion -- tests index into data they have just built */
import {
  buildTrackSurface,
  longitudeOf,
  ringRows,
  secondsAt,
  segmentAt,
  segmentLean,
  tickEvery,
} from '@/components/Auris/trackSurface'
import type { SignalReport } from '@/hooks/auris/signal'
import type { Timeline, TimelineSegment } from '@/hooks/analysisTypes'

const FRAMES = 40
const BANDS = 12

const signal = (over: Partial<SignalReport['visuals']> = {}, extra: { cutoff?: number; periodicityLean?: number; seconds?: number } = {}): SignalReport => ({
  score: 0.5,
  band: { tier: 'uncertain', labelTr: '', labelEn: '', lowerBound: 0, upperBound: 1 },
  lossySource: false,
  contributions: {
    bandwidthCutoff: { value: extra.cutoff ?? 20000 },
    spectralPeriodicity: { lean: extra.periodicityLean ?? 0.8 },
  },
  measurements: { analysedSeconds: extra.seconds ?? 40 },
  visuals: {
    waveform: [],
    spectrogram: Array.from({ length: FRAMES }, (_, x) => Array.from({ length: BANDS }, (_, y) => (x * 5 + y) % 256)),
    spectrogramMinHz: 40,
    spectrogramMaxHz: 20000,
    periodicityResidual: Array.from({ length: 64 }, (_, i) => (i % 8 === 0 ? 1 : 0)),
    ...over,
  },
} as unknown as SignalReport)

const seg = (start: number, end: number, extra: Partial<TimelineSegment> = {}): TimelineSegment => ({
  index: 0, start, end, state: 'ok', probability: 0.5, isAi: false, margin: 0.5, ...extra,
})

const timeline = (segments: TimelineSegment[]): Timeline => ({
  durationSec: 40, totalSec: 40, truncated: false, threshold: 0.5, peaks: [], segments,
  summary: {} as Timeline['summary'],
})

describe('buildTrackSurface', () => {
  it('has no surface without a spectrogram', () => {
    expect(buildTrackSurface(null)).toBeNull()
    expect(buildTrackSurface(signal({ spectrogram: [] }))).toBeNull()
    expect(buildTrackSurface(signal({ spectrogram: [[1, 2, 3]] }))).toBeNull()
  })

  it('is as wide as the track has frames and as tall as it has bands', () => {
    const surface = buildTrackSurface(signal())!
    expect(surface.width).toBe(FRAMES)
    expect(surface.height).toBe(BANDS)
    expect(surface.data).toHaveLength(FRAMES * BANDS * 4)
    expect(surface.spanSec).toBe(40)
  })

  it('puts the lowest band on row 0 and carries the energy in red', () => {
    const surface = buildTrackSurface(signal())!
    const texel = (x: number, y: number) => surface.data.subarray((y * surface.width + x) * 4, (y * surface.width + x) * 4 + 4)
    expect(texel(0, 0)[0]).toBe(0)
    expect(texel(3, 2)[0]).toBe((3 * 5 + 2) % 256)
    expect(texel(3, 2)[3]).toBe(255)
  })

  it('leaves the lean neutral without a timeline', () => {
    const surface = buildTrackSurface(signal())!
    expect(surface.hasLean).toBe(false)
    expect(new Set(Array.from({ length: FRAMES }, (_, x) => surface.data[x * 4 + 1]))).toEqual(new Set([128]))
  })

  it('marks the stretches the models leaned towards AI and towards human', () => {
    const surface = buildTrackSurface(signal(), timeline([
      seg(0, 20, { isAi: true, margin: 1 }),
      seg(20, 40, { isAi: false, margin: 1 }),
    ]))!
    expect(surface.hasLean).toBe(true)
    const green = (x: number) => surface.data[x * 4 + 1]!
    expect(green(2)).toBeGreaterThan(200)
    expect(green(FRAMES - 3)).toBeLessThan(60)
  })

  it('ignores stretches that were silent, skipped or failed', () => {
    const surface = buildTrackSurface(signal(), timeline([
      seg(0, 20, { state: 'silent' }),
      seg(20, 40, { state: 'failed', isAi: true, margin: 1 }),
    ]))!
    expect(surface.hasLean).toBe(false)
  })
})

describe('segmentLean', () => {
  it('is zero for a stretch with no reading', () => {
    expect(segmentLean(undefined)).toBe(0)
    expect(segmentLean(seg(0, 1, { state: 'skipped' }))).toBe(0)
    expect(segmentLean(seg(0, 1, { isAi: null }))).toBe(0)
  })

  it('keeps even a marginal reading visible', () => {
    expect(segmentLean(seg(0, 1, { isAi: true, margin: 0 }))).toBeCloseTo(0.2)
    expect(segmentLean(seg(0, 1, { isAi: false, margin: 0 }))).toBeCloseTo(-0.2)
  })

  it('is signed by side and scaled by how far from the threshold', () => {
    expect(segmentLean(seg(0, 1, { isAi: true, margin: 0.8 }))).toBeCloseTo(0.8)
    expect(segmentLean(seg(0, 1, { isAi: false, margin: 0.6 }))).toBeCloseTo(-0.6)
  })
})

describe('segmentAt', () => {
  const t = timeline([seg(0, 10), seg(10, 20, { isAi: true }), seg(20, 30)])
  it('finds the stretch a moment falls in', () => {
    expect(segmentAt(t, 12)?.isAi).toBe(true)
    expect(segmentAt(t, 0)?.start).toBe(0)
  })
  it('falls back to the last stretch past the end, and to nothing without a timeline', () => {
    expect(segmentAt(t, 99)?.start).toBe(20)
    expect(segmentAt(null, 5)).toBeUndefined()
  })
})

describe('ringRows', () => {
  it('puts rings where the residual peaks, and nowhere below 4 kHz', () => {
    const { rings, any } = ringRows(signal(), 96)
    expect(any).toBe(true)
    const bandOf = (hz: number) => Math.floor((Math.log(hz / 40) / Math.log(500)) * 96)
    for (let band = 0; band < bandOf(3900); band++) {expect(rings[band]).toBe(0)}
    expect(Math.max(...rings)).toBeGreaterThan(0.2)
    expect(Math.max(...rings)).toBeLessThanOrEqual(1)
  })

  it('fades with how periodic the whole spectrum measured', () => {
    const loud = ringRows(signal({}, { periodicityLean: 1 }), 96).rings
    const quiet = ringRows(signal({}, { periodicityLean: 0 }), 96).rings
    expect(Math.max(...loud)).toBeGreaterThan(Math.max(...quiet))
  })

  it('draws nothing from a flat residual', () => {
    const { any } = ringRows(signal({ periodicityResidual: new Array(64).fill(0) }), 96)
    expect(any).toBe(false)
    expect(ringRows(signal({ periodicityResidual: [] }), 96).any).toBe(false)
  })

  it('stops under the bandwidth cutoff of a lossy file', () => {
    const { rings } = ringRows(signal({}, { cutoff: 9000 }), 96)
    const bandOf = (hz: number) => Math.floor((Math.log(hz / 40) / Math.log(500)) * 96)
    for (let band = bandOf(9000); band < 96; band++) {expect(rings[band]).toBe(0)}
  })
})

describe('longitude and time', () => {
  const surface = { spanSec: 90 }
  it('turns once around the span', () => {
    expect(secondsAt(surface, 0)).toBe(0)
    expect(secondsAt(surface, 0.5)).toBe(45)
    expect(secondsAt(surface, 1.25)).toBeCloseTo(22.5)
    expect(longitudeOf(surface, 45)).toBe(0.5)
  })
  it('has no longitude for a moment the planet does not cover', () => {
    expect(longitudeOf(surface, 91)).toBeNull()
    expect(longitudeOf(surface, -1)).toBeNull()
  })
  it('marks a short clip more often than a long one', () => {
    expect(tickEvery(30)).toBe(5)
    expect(tickEvery(90)).toBe(10)
  })
})
