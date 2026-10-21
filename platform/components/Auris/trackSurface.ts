/* eslint-disable @typescript-eslint/no-non-null-assertion -- typed-array loops; every index is bounded by its loop */
/**
 * A track, as the surface of a world.
 *
 * The AURIS signal analysis already measures a spectrogram, the repeated peaks
 * in the spectrum and (on the server path) a lean towards AI or human for every
 * stretch of the track. This turns those measurements into one small texture a
 * planet can wear:
 *
 *   east to west   time, once around the equator
 *   south to north pitch, low sounds at the south pole, high at the north
 *   raised ground  louder
 *   amber / green  the stretches the models leaned towards AI / towards human
 *   fine rings     repeated peaks in the spectrum, a fingerprint some generators leave
 *
 * Nothing here is invented: every texel is a measurement. A track that has no
 * spectrogram (a link the server could not fetch) simply gets no surface and the
 * planet stays the procedural one.
 */

import type { SignalReport } from '@/hooks/auris/signal'
import type { Timeline, TimelineSegment } from '@/hooks/analysisTypes'

export interface TrackSurface {
  width: number
  height: number
  /** RGBA, row 0 is the lowest band. R energy, G lean (128 is neutral), B ring strength. */
  data: Uint8Array
  /** Seconds of the track the planet shows: its opening, at most 90 s. */
  spanSec: number
  /** Whether any stretch of the track carries a model reading. */
  hasLean: boolean
  /** Whether the spectrum repeats enough for the rings to mean something. */
  hasRings: boolean
}

const MIN_FRAMES = 8
const RING_FLOOR = 0.12
const SPEC_MIN_HZ = 40
const SPEC_MAX_HZ = 20000
const RESIDUAL_MIN_HZ = 4000

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

/** Lean of a stretch of the track: +1 far on the AI side of the threshold, -1 far on the human side, 0 unknown. */
export const segmentLean = (segment: TimelineSegment | undefined): number => {
  if (!segment || segment.state !== 'ok' || segment.isAi === null || segment.isAi === undefined) {return 0}
  const strength = clamp01(typeof segment.margin === 'number' ? segment.margin : 0.5)
  return (segment.isAi ? 1 : -1) * Math.max(0.2, strength)
}

/** The stretch of the track that covers `sec`. */
export const segmentAt = (timeline: Timeline | null | undefined, sec: number): TimelineSegment | undefined =>
  timeline?.segments.find(segment => sec >= segment.start && sec < segment.end)
  ?? (timeline && sec >= 0 ? timeline.segments[timeline.segments.length - 1] : undefined)

/** Lean for every column of the texture, from the timeline. */
const columnLean = (timeline: Timeline | null | undefined, spanSec: number, width: number): { lean: Float32Array; any: boolean } => {
  const lean = new Float32Array(width)
  let any = false
  if (!timeline) {return { lean, any }}
  for (let x = 0; x < width; x++) {
    const sec = ((x + 0.5) / width) * spanSec
    const segment = timeline.segments.find(s => sec >= s.start && sec < s.end)
    const value = segmentLean(segment)
    lean[x] = value
    if (value !== 0) {any = true}
  }
  return { lean, any }
}

/**
 * Ring strength for every band. The residual is the spectrum with its smooth
 * shape removed, sampled linearly from 4 kHz up to just under the bandwidth
 * cutoff; where it peaks repeatedly the measurement called it periodic.
 */
export const ringRows = (signal: SignalReport, rows: number): { rings: Float32Array; any: boolean } => {
  const rings = new Float32Array(rows)
  const residual = signal.visuals.periodicityResidual
  if (!residual || residual.length < 8) {return { rings, any: false }}

  const cutoff = signal.contributions.bandwidthCutoff?.value ?? SPEC_MAX_HZ
  const top = Math.max(RESIDUAL_MIN_HZ + 1000, Math.min(cutoff, SPEC_MAX_HZ) - 200)
  const bandOf = (hz: number) => Math.floor((Math.log(hz / SPEC_MIN_HZ) / Math.log(SPEC_MAX_HZ / SPEC_MIN_HZ)) * rows)

  const sums = new Float32Array(rows)
  const counts = new Uint16Array(rows)
  for (let i = 0; i < residual.length; i++) {
    const hz = RESIDUAL_MIN_HZ + (i / (residual.length - 1)) * (top - RESIDUAL_MIN_HZ)
    const band = bandOf(hz)
    if (band < 0 || band >= rows) {continue}
    sums[band]! += Math.max(0, residual[i]!)
    counts[band]! += 1
  }
  const means = Array.from(sums, (sum, band) => (counts[band]! ? sum / counts[band]! : 0))
  const sorted = [...means].filter(v => v > 0).sort((a, b) => a - b)
  const reference = sorted.length ? sorted[Math.floor(sorted.length * 0.95)]! : 0
  if (reference <= 0) {return { rings, any: false }}

  // The rings fade with how periodic the whole spectrum measured, so a clean track keeps a quiet surface.
  const lean = signal.contributions.spectralPeriodicity?.lean ?? 0
  const gate = 0.25 + 0.75 * clamp01(lean)
  let any = false
  for (let band = 0; band < rows; band++) {
    const value = clamp01(means[band]! / reference) * gate
    rings[band] = value >= RING_FLOOR ? value : 0
    if (rings[band]! > 0) {any = true}
  }
  return { rings, any }
}

export function buildTrackSurface(signal: SignalReport | null | undefined, timeline?: Timeline | null): TrackSurface | null {
  const spectrogram = signal?.visuals?.spectrogram
  if (!signal || !spectrogram || spectrogram.length < MIN_FRAMES || !spectrogram[0]?.length) {return null}

  const width = spectrogram.length
  const height = spectrogram[0].length
  const spanSec = Math.max(1, signal.measurements.analysedSeconds)
  const { lean, any: hasLean } = columnLean(timeline, spanSec, width)
  const { rings, any: hasRings } = ringRows(signal, height)

  const data = new Uint8Array(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const at = (y * width + x) * 4
      data[at] = Math.round(clamp01((spectrogram[x]?.[y] ?? 0) / 255) * 255)
      data[at + 1] = Math.round(128 + lean[x]! * 127)
      data[at + 2] = Math.round(rings[y]! * 255)
      data[at + 3] = 255
    }
  }
  return { width, height, data, spanSec, hasLean, hasRings }
}

/** Seconds at a longitude of the world (0 to 1 once around). */
export const secondsAt = (surface: Pick<TrackSurface, 'spanSec'>, u: number): number =>
  clamp01(u - Math.floor(u)) * surface.spanSec

/** Longitude of a moment in the track, or null when the planet does not cover it. */
export const longitudeOf = (surface: Pick<TrackSurface, 'spanSec'>, sec: number): number | null =>
  sec >= 0 && sec <= surface.spanSec ? sec / surface.spanSec : null

/** Tick spacing along the equator, in seconds: a mark every 5 s on a short clip, every 10 s on a long one. */
export const tickEvery = (spanSec: number): number => (spanSec <= 40 ? 5 : 10)
