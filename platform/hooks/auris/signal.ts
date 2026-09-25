/* eslint-disable @typescript-eslint/no-non-null-assertion -- typed-array loops; every index is bounded by its loop */
/**
 * AURIS signal analysis, browser side.
 *
 * Port of backend/app/services/audio_analysis.py so a track can be measured
 * without uploading it. Keep the constants and thresholds in sync with that
 * file. The output is hand-calibrated signal measurement, not a trained model.
 */

export const SAMPLE_RATE = 44100
const N_FFT = 2048
const HOP = 1024
const MAX_ANALYSIS_SEC = 90
const WAVEFORM_POINTS = 480
const SPEC_BANDS = 96
const SPEC_FRAMES = 240
export const MODEL_VERSION = 'auris-signal-1.0'

export type MeasureKey =
  | 'spectralPeriodicity'
  | 'bandwidthCutoff'
  | 'flatnessVariation'
  | 'centroidVariation'
  | 'loudnessRange'
  | 'tempoDrift'
  | 'stereoCorrelation'

export type MeasureCategory = 'spectral' | 'timbre' | 'temporal' | 'rhythm'

export const WEIGHTS: Record<MeasureKey, [number, MeasureCategory]> = {
  spectralPeriodicity: [0.3, 'spectral'],
  bandwidthCutoff: [0.15, 'spectral'],
  flatnessVariation: [0.15, 'timbre'],
  centroidVariation: [0.1, 'timbre'],
  loudnessRange: [0.1, 'temporal'],
  tempoDrift: [0.1, 'rhythm'],
  stereoCorrelation: [0.1, 'spectral'],
}

export const LOSSY_FORMATS = new Set(['MP3', 'AAC', 'M4A', 'MP4', 'OGG', 'OPUS', 'WEBM'])

export interface Contribution {
  name: MeasureKey
  category: MeasureCategory
  value: number
  lean: number
  weight: number
  shapValue: number
  direction: 'towards_ai' | 'towards_human' | 'neutral'
}

export interface SignalBand {
  tier: 'uncertain' | 'likely' | 'strong' | 'very_strong'
  labelTr: string
  labelEn: string
  lowerBound: number
  upperBound: number
}

export interface SignalReport {
  score: number
  band: SignalBand
  lossySource: boolean
  contributions: Record<MeasureKey, Contribution>
  measurements: {
    bpm: number
    pulseStrength: number
    crestDb: number
    rmsDb: number
    peakDb: number
    sideRatio: number
    analysedSeconds: number
  }
  visuals: {
    waveform: Array<[number, number]>
    spectrogram: number[][]
    spectrogramMinHz: number
    spectrogramMaxHz: number
    periodicityResidual: number[]
  }
}

// ── helpers ──────────────────────────────────────────────────────────

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const ramp = (x: number, lo: number, hi: number) => (hi === lo ? 0 : clamp01((x - lo) / (hi - lo)))
const db = (x: number) => 10 * Math.log10(Math.max(x, 1e-12))
const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d
const mean = (a: ArrayLike<number>) => {
  let s = 0
  for (let i = 0; i < a.length; i++) {s += a[i]!}
  return a.length ? s / a.length : 0
}
const std = (a: ArrayLike<number>) => {
  const m = mean(a)
  let s = 0
  for (let i = 0; i < a.length; i++) {s += (a[i]! - m) ** 2}
  return a.length ? Math.sqrt(s / a.length) : 0
}
const percentile = (a: ArrayLike<number>, p: number) => {
  const s = Float64Array.from(a).sort()
  if (!s.length) {return 0}
  const k = (s.length - 1) * (p / 100)
  const f = Math.floor(k)
  const c = Math.min(f + 1, s.length - 1)
  return s[f]! + (s[c]! - s[f]!) * (k - f)
}
const median = (a: ArrayLike<number>) => percentile(a, 50)

const movingAverage = (x: Float64Array, width: number) => {
  const pad = Math.floor(width / 2)
  const out = new Float64Array(x.length)
  for (let i = 0; i < x.length; i++) {
    let s = 0
    for (let k = -pad; k < width - pad; k++) {
      s += x[Math.min(x.length - 1, Math.max(0, i + k))]!
    }
    out[i] = s / width
  }
  return out
}

const dot = (a: ArrayLike<number>, b: ArrayLike<number>, n: number, offA = 0, offB = 0) => {
  let s = 0
  for (let i = 0; i < n; i++) {s += a[i + offA]! * b[i + offB]!}
  return s
}

// ── FFT (radix-2, in place) ──────────────────────────────────────────

const makeFft = (n: number) => {
  const levels = Math.log2(n)
  const cos = new Float64Array(n / 2)
  const sin = new Float64Array(n / 2)
  for (let i = 0; i < n / 2; i++) {
    cos[i] = Math.cos((2 * Math.PI * i) / n)
    sin[i] = Math.sin((2 * Math.PI * i) / n)
  }
  const rev = new Uint32Array(n)
  for (let i = 0; i < n; i++) {
    let r = 0
    for (let b = 0; b < levels; b++) {r = (r << 1) | ((i >>> b) & 1)}
    rev[i] = r
  }
  return (re: Float64Array, im: Float64Array) => {
    for (let i = 0; i < n; i++) {
      const j = rev[i]!
      if (j > i) {
        let t = re[i]!; re[i] = re[j]!; re[j] = t
        t = im[i]!; im[i] = im[j]!; im[j] = t
      }
    }
    for (let size = 2; size <= n; size *= 2) {
      const half = size / 2
      const step = n / size
      for (let i = 0; i < n; i += size) {
        for (let j = 0, k = 0; j < half; j++, k += step) {
          const l = i + j + half
          const tre = re[l]! * cos[k]! + im[l]! * sin[k]!
          const tim = -re[l]! * sin[k]! + im[l]! * cos[k]!
          re[l] = re[i + j]! - tre
          im[l] = im[i + j]! - tim
          re[i + j] = re[i + j]! + tre
          im[i + j] = im[i + j]! + tim
        }
      }
    }
  }
}

const yieldToUi = () => new Promise<void>(resolve => setTimeout(resolve, 0))

/** Power spectrogram, frames × (N_FFT/2+1), as one flat array. */
const stftPower = async (mono: Float64Array, onProgress?: (p: number) => void) => {
  const bins = N_FFT / 2 + 1
  const frames = 1 + Math.floor((mono.length - N_FFT) / HOP)
  const out = new Float64Array(frames * bins)
  const fft = makeFft(N_FFT)
  const win = new Float64Array(N_FFT)
  for (let i = 0; i < N_FFT; i++) {win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N_FFT - 1))}
  const re = new Float64Array(N_FFT)
  const im = new Float64Array(N_FFT)
  for (let f = 0; f < frames; f++) {
    const off = f * HOP
    for (let i = 0; i < N_FFT; i++) {
      re[i] = mono[off + i]! * win[i]!
      im[i] = 0
    }
    fft(re, im)
    const row = f * bins
    for (let b = 0; b < bins; b++) {out[row + b] = (re[b]! * re[b]! + im[b]! * im[b]!) / N_FFT}
    if (f % 400 === 399) {
      onProgress?.(f / frames)
      await yieldToUi()
    }
  }
  return { power: out, frames, bins }
}

// ── measurements ─────────────────────────────────────────────────────

interface Spec { power: Float64Array; frames: number; bins: number }

const freqOf = (bin: number) => (bin * SAMPLE_RATE) / N_FFT

const columnStat = (s: Spec, fn: (col: Float64Array) => number) => {
  const out = new Float64Array(s.bins)
  const col = new Float64Array(s.frames)
  for (let b = 0; b < s.bins; b++) {
    for (let f = 0; f < s.frames; f++) {col[f] = s.power[f * s.bins + b]!}
    out[b] = fn(col)
  }
  return out
}

const bandwidthCutoff = (meanDb: Float64Array) => {
  const ref: number[] = []
  for (let b = 0; b < meanDb.length; b++) {
    const f = freqOf(b)
    if (f >= 1000 && f <= 8000) {ref.push(meanDb[b]!)}
  }
  const threshold = median(ref) - 50
  for (let b = meanDb.length - 1; b >= 0; b--) {
    if (meanDb[b]! > threshold) {return freqOf(b)}
  }
  return freqOf(meanDb.length - 1)
}

const spectralPeriodicity = (s: Spec, cutoff: number) => {
  const medDb = columnStat(s, col => db(median(col)))
  const seg: number[] = []
  const hi = Math.min(cutoff, 20000) - 200
  for (let b = 0; b < s.bins; b++) {
    const f = freqOf(b)
    if (f >= 4000 && f <= hi) {seg.push(medDb[b]!)}
  }
  if (seg.length < 64) {return { peak: 0, residual: new Float64Array(0) }}
  const x = Float64Array.from(seg)
  const smooth = movingAverage(x, 31)
  const residual = new Float64Array(x.length)
  for (let i = 0; i < x.length; i++) {residual[i] = x[i]! - smooth[i]!}
  const m = mean(residual)
  for (let i = 0; i < residual.length; i++) {residual[i] = residual[i]! - m}
  const denom = dot(residual, residual, residual.length) || 1
  let peak = -Infinity
  for (let lag = 4; lag < Math.min(100, Math.floor(x.length / 3)); lag++) {
    peak = Math.max(peak, dot(residual, residual, residual.length - lag, 0, lag) / denom)
  }
  return { peak: clamp01(Number.isFinite(peak) ? peak : 0), residual }
}

const frameEnergies = (s: Spec) => {
  const e = new Float64Array(s.frames)
  for (let f = 0; f < s.frames; f++) {
    let t = 0
    for (let b = 0; b < s.bins; b++) {t += s.power[f * s.bins + b]!}
    e[f] = t
  }
  return e
}

const flatnessCv = (s: Spec, cutoff: number, energy: Float64Array) => {
  const lo = Math.ceil((200 * N_FFT) / SAMPLE_RATE)
  const hi = Math.min(s.bins - 1, Math.floor((cutoff * N_FFT) / SAMPLE_RATE))
  const gate = percentile(energy, 20)
  const vals: number[] = []
  const all: number[] = []
  for (let f = 0; f < s.frames; f++) {
    let logSum = 0
    let sum = 0
    for (let b = lo; b <= hi; b++) {
      const p = s.power[f * s.bins + b]! + 1e-12
      logSum += Math.log(p)
      sum += p
    }
    const n = hi - lo + 1
    const flat = Math.exp(logSum / n) / (sum / n)
    all.push(flat)
    if (energy[f]! > gate) {vals.push(flat)}
  }
  const v = vals.length ? vals : all
  return std(v) / (mean(v) || 1e-9)
}

const centroidCv = (s: Spec, energy: Float64Array) => {
  const gate = percentile(energy, 20)
  const vals: number[] = []
  const all: number[] = []
  for (let f = 0; f < s.frames; f++) {
    let w = 0
    for (let b = 0; b < s.bins; b++) {w += s.power[f * s.bins + b]! * freqOf(b)}
    const c = w / (energy[f]! + 1e-12)
    all.push(c)
    if (energy[f]! > gate) {vals.push(c)}
  }
  const v = vals.length ? vals : all
  return std(v) / (mean(v) || 1e-9)
}

const loudnessStats = (mono: Float64Array) => {
  const win = Math.floor(0.4 * SAMPLE_RATE)
  const hop = Math.floor(0.1 * SAMPLE_RATE)
  const n = 1 + Math.max(0, Math.floor((mono.length - win) / hop))
  const cum = new Float64Array(mono.length + 1)
  let peak = 0
  for (let i = 0; i < mono.length; i++) {
    cum[i + 1] = cum[i]! + mono[i]! * mono[i]!
    peak = Math.max(peak, Math.abs(mono[i]!))
  }
  const st: number[] = []
  for (let i = 0; i < n; i++) {
    const a = i * hop
    const b = Math.min(a + win, mono.length)
    st.push(db((cum[b]! - cum[a]!) / win))
  }
  let gated = st.filter(v => v > -70)
  if (gated.length) {
    const g = mean(gated) - 20
    gated = gated.filter(v => v > g)
  }
  const lra = gated.length > 4 ? percentile(gated, 95) - percentile(gated, 10) : 0
  const rms = Math.sqrt(cum[mono.length]! / mono.length) || 1e-12
  peak = peak || 1e-12
  return { lra, crest: 20 * Math.log10(peak / rms), rmsDb: 20 * Math.log10(rms), peakDb: 20 * Math.log10(peak) }
}

const tempoStats = (s: Spec) => {
  const top = N_FFT / 4
  const flux = new Float64Array(Math.max(0, s.frames - 1))
  for (let f = 1; f < s.frames; f++) {
    let t = 0
    for (let b = 0; b < top; b++) {
      const d = Math.log1p(s.power[f * s.bins + b]! * 1e3) - Math.log1p(s.power[(f - 1) * s.bins + b]! * 1e3)
      if (d > 0) {t += d}
    }
    flux[f - 1] = t
  }
  const smooth = movingAverage(flux, 16)
  for (let i = 0; i < flux.length; i++) {flux[i] = Math.max(0, flux[i]! - smooth[i]!)}
  const fps = SAMPLE_RATE / HOP
  const minLag = Math.floor((fps * 60) / 180)
  const maxLag = Math.floor((fps * 60) / 60)

  const bpmAndStrength = (x: Float64Array): [number, number] => {
    const m = mean(x)
    const y = x.map(v => v - m)
    const denom = dot(y, y, y.length) || 1
    let best = -Infinity
    let bestLag = minLag
    for (let lag = minLag; lag <= maxLag; lag++) {
      const v = dot(y, y, Math.max(0, y.length - lag), 0, lag) / denom
      if (v > best) { best = v; bestLag = lag }
    }
    return [(60 * fps) / bestLag, Number.isFinite(best) ? best : 0]
  }

  const [bpm, strength] = bpmAndStrength(flux)
  const folded: number[] = []
  // Same split as numpy.array_split(flux, 4).
  const base = Math.floor(flux.length / 4)
  const extra = flux.length % 4
  for (let i = 0, start = 0; i < 4; i++) {
    const len = base + (i < extra ? 1 : 0)
    const seg = flux.slice(start, start + len)
    start += len
    if (seg.length <= maxLag * 2) {continue}
    let b = bpmAndStrength(seg)[0]
    while (b > bpm * 1.4) {b /= 2}
    while (b < bpm / 1.4) {b *= 2}
    folded.push(b)
  }
  return { bpm, pulse: clamp01(strength), drift: folded.length > 1 ? std(folded) : 0 }
}

const stereoStats = (left: Float64Array, right: Float64Array) => {
  let ll = 0, rr = 0, lr = 0, mid = 0, side = 0
  for (let i = 0; i < left.length; i++) {
    const l = left[i]!, r = right[i]!
    ll += l * l; rr += r * r; lr += l * r
    mid += ((l + r) / 2) ** 2
    side += ((l - r) / 2) ** 2
  }
  return { correlation: lr / (Math.sqrt(ll * rr) || 1e-12), sideRatio: side / (mid || 1e-12) }
}

const waveform = (mono: Float64Array): Array<[number, number]> => {
  const out: Array<[number, number]> = []
  for (let i = 0; i < WAVEFORM_POINTS; i++) {
    const a = Math.floor((i * mono.length) / WAVEFORM_POINTS)
    const b = Math.floor(((i + 1) * mono.length) / WAVEFORM_POINTS)
    let lo = 0, hi = 0
    for (let k = a; k < b; k++) {
      lo = Math.min(lo, mono[k]!)
      hi = Math.max(hi, mono[k]!)
    }
    out.push([round(lo, 4), round(hi, 4)])
  }
  return out
}

const spectrogram = (s: Spec) => {
  const edges = Array.from({ length: SPEC_BANDS + 1 }, (_, i) => 40 * (20000 / 40) ** (i / SPEC_BANDS))
  const bandBins: number[][] = []
  for (let b = 0; b < SPEC_BANDS; b++) {
    const bins: number[] = []
    for (let k = 0; k < s.bins; k++) {
      const f = freqOf(k)
      if (f >= edges[b]! && f < edges[b + 1]!) {bins.push(k)}
    }
    if (!bins.length) {bins.push(Math.round((Math.sqrt(edges[b]! * edges[b + 1]!) * N_FFT) / SAMPLE_RATE))}
    bandBins.push(bins)
  }
  const groups = Math.min(SPEC_FRAMES, s.frames)
  const rows: number[][] = []
  const all: number[] = []
  for (let g = 0; g < groups; g++) {
    const f0 = Math.floor((g * s.frames) / groups)
    const f1 = Math.max(f0 + 1, Math.floor(((g + 1) * s.frames) / groups))
    const row = bandBins.map(bins => {
      let t = 0
      for (let f = f0; f < f1; f++) {for (const k of bins) {t += s.power[f * s.bins + k]!}}
      return db(t / ((f1 - f0) * bins.length))
    })
    rows.push(row)
    all.push(...row)
  }
  const topDb = percentile(all, 99.5)
  return rows.map(r => r.map(v => Math.round(clamp01((v - (topDb - 80)) / 80) * 255)))
}

// ── scoring ──────────────────────────────────────────────────────────

const band = (score: number): SignalBand => {
  const d = Math.abs(score - 0.5)
  const up = score > 0.5
  if (d < 0.1) {return { tier: 'uncertain', labelTr: 'Belirsiz', labelEn: 'Uncertain', lowerBound: 0.4, upperBound: 0.6 }}
  if (d < 0.2) {return { tier: 'likely', labelTr: 'Zayıf eğilim', labelEn: 'Weak lean', lowerBound: up ? 0.6 : 0.3, upperBound: up ? 0.7 : 0.4 }}
  if (d < 0.3) {return { tier: 'strong', labelTr: 'Belirgin eğilim', labelEn: 'Clear lean', lowerBound: up ? 0.7 : 0.2, upperBound: up ? 0.8 : 0.3 }}
  return { tier: 'very_strong', labelTr: 'Güçlü eğilim', labelEn: 'Strong lean', lowerBound: up ? 0.8 : 0, upperBound: up ? 1 : 0.2 }
}

export interface AnalyseInput {
  left: Float32Array
  right: Float32Array
  channels: number
  lossy: boolean
  onProgress?: (p: number) => void
}

export const analyseSignal = async ({ left: l32, right: r32, channels, lossy, onProgress }: AnalyseInput): Promise<SignalReport> => {
  const maxN = MAX_ANALYSIS_SEC * SAMPLE_RATE
  const start = l32.length > maxN ? Math.floor((l32.length - maxN) / 2) : 0
  const n = Math.min(l32.length, maxN)
  const left = Float64Array.from(l32.subarray(start, start + n))
  const right = Float64Array.from(r32.subarray(start, start + n))
  const mono = new Float64Array(n)
  for (let i = 0; i < n; i++) {mono[i] = (left[i]! + right[i]!) / 2}

  const spec = await stftPower(mono, p => onProgress?.(p * 0.7))
  const energy = frameEnergies(spec)
  const meanDb = columnStat(spec, col => db(mean(col)))
  onProgress?.(0.75)
  await yieldToUi()

  const cutoff = bandwidthCutoff(meanDb)
  const { peak: periodicity, residual } = spectralPeriodicity(spec, cutoff)
  onProgress?.(0.85)
  await yieldToUi()
  const loud = loudnessStats(mono)
  const tempo = tempoStats(spec)
  const stereo = stereoStats(left, right)

  const measured: Record<MeasureKey, number> = {
    spectralPeriodicity: periodicity,
    bandwidthCutoff: cutoff,
    flatnessVariation: flatnessCv(spec, cutoff, energy),
    centroidVariation: centroidCv(spec, energy),
    loudnessRange: loud.lra,
    tempoDrift: tempo.drift,
    stereoCorrelation: stereo.correlation,
  }
  const leans: Record<MeasureKey, number> = {
    spectralPeriodicity: ramp(measured.spectralPeriodicity, lossy ? 0.3 : 0.15, 0.6),
    bandwidthCutoff: lossy ? 0.5 : ramp(measured.bandwidthCutoff, 20500, 15500),
    flatnessVariation: ramp(measured.flatnessVariation, 0.9, 0.35),
    centroidVariation: ramp(measured.centroidVariation, 0.45, 0.15),
    loudnessRange: ramp(measured.loudnessRange, 9, 3),
    tempoDrift: tempo.pulse > 0.2 ? ramp(measured.tempoDrift, 3, 0.3) : 0.5,
    stereoCorrelation: channels > 1 ? ramp(measured.stereoCorrelation, 0.6, 0.97) : 0.5,
  }
  const keys = Object.keys(WEIGHTS) as MeasureKey[]
  const totalW = keys.reduce((s, k) => s + WEIGHTS[k][0], 0)
  const score = keys.reduce((s, k) => s + leans[k] * WEIGHTS[k][0], 0) / totalW

  const contributions = Object.fromEntries(keys.map(k => {
    const [weight, category] = WEIGHTS[k]
    const lean = leans[k]
    return [k, {
      name: k,
      category,
      value: round(measured[k], 4),
      lean: round(lean, 4),
      weight,
      shapValue: round(((lean - 0.5) * weight) / totalW, 4),
      direction: lean > 0.55 ? 'towards_ai' : lean < 0.45 ? 'towards_human' : 'neutral',
    } satisfies Contribution]
  })) as Record<MeasureKey, Contribution>

  const step = Math.max(1, Math.floor(residual.length / 256))
  const residualOut: number[] = []
  for (let i = 0; i < residual.length; i += step) {residualOut.push(round(residual[i]!, 3))}
  onProgress?.(1)

  return {
    score: round(score, 4),
    band: band(score),
    lossySource: lossy,
    contributions,
    measurements: {
      bpm: round(tempo.bpm, 1),
      pulseStrength: round(tempo.pulse, 3),
      crestDb: round(loud.crest, 2),
      rmsDb: round(loud.rmsDb, 2),
      peakDb: round(loud.peakDb, 2),
      sideRatio: round(stereo.sideRatio, 4),
      analysedSeconds: round(n / SAMPLE_RATE, 2),
    },
    visuals: {
      waveform: waveform(mono),
      spectrogram: spectrogram(spec),
      spectrogramMinHz: 40,
      spectrogramMaxHz: 20000,
      periodicityResidual: residualOut,
    },
  }
}

/** Decode any browser-playable blob to 44.1 kHz stereo. */
export const decodeBlob = async (blob: Blob) => {
  const bytes = await blob.arrayBuffer()
  const Ctx = window.OfflineAudioContext || (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext
  const ctx = new Ctx(2, SAMPLE_RATE, SAMPLE_RATE)
  const buffer = await ctx.decodeAudioData(bytes)
  const left = buffer.getChannelData(0)
  const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left
  return { left, right, channels: buffer.numberOfChannels, duration: buffer.duration }
}
