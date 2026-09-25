/* eslint-disable @typescript-eslint/no-non-null-assertion -- typed-array loops; every index is bounded by its loop */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import styles from '@/styles/pages/auris.module.css'

// Dark → umber → amber → cream, the site's palette as a heat map.
const STOPS: Array<[number, [number, number, number]]> = [
  [0, [11, 10, 8]],
  [0.35, [58, 34, 18]],
  [0.6, [154, 96, 40]],
  [0.82, [234, 176, 96]],
  [1, [250, 238, 214]],
]
const LUT = (() => {
  const lut = new Uint8ClampedArray(256 * 3)
  for (let i = 0; i < 256; i++) {
    const x = i / 255
    const k = STOPS.findIndex(([p]) => p >= x)
    const [p1, c1] = STOPS[Math.max(1, k)]!
    const [p0, c0] = STOPS[Math.max(0, k - 1)]!
    const t = p1 === p0 ? 0 : (x - p0) / (p1 - p0)
    for (let c = 0; c < 3; c++) {lut[i * 3 + c] = c0[c]! + (c1[c]! - c0[c]!) * t}
  }
  return lut
})()

const useCanvasSize = () => {
  const ref = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0, dpr: 1 })
  useEffect(() => {
    const el = ref.current
    if (!el) {return}
    const ro = new ResizeObserver(([entry]) => {
      const r = entry!.contentRect
      setSize({ w: Math.round(r.width), h: Math.round(r.height), dpr: Math.min(2, window.devicePixelRatio || 1) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return { ref, ...size }
}

const hzToY = (hz: number, minHz: number, maxHz: number, h: number) =>
  h - (Math.log(hz / minHz) / Math.log(maxHz / minHz)) * h

interface SpectrogramProps {
  data: number[][]
  minHz: number
  maxHz: number
  cutoffHz?: number | undefined
  cutoffLabel: string
  progress: number
}

export const Spectrogram: React.FC<SpectrogramProps> = ({ data, minHz, maxHz, cutoffHz, cutoffLabel, progress }) => {
  const { ref, w, h, dpr } = useCanvasSize()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !w || !h || !data.length) {return}
    const cols = data.length
    const rows = data[0]!.length
    const img = new ImageData(cols, rows)
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const v = data[x]![rows - 1 - y]!
        const o = (y * cols + x) * 4
        img.data[o] = LUT[v * 3]!
        img.data[o + 1] = LUT[v * 3 + 1]!
        img.data[o + 2] = LUT[v * 3 + 2]!
        img.data[o + 3] = 255
      }
    }
    const tmp = document.createElement('canvas')
    tmp.width = cols
    tmp.height = rows
    tmp.getContext('2d')!.putImageData(img, 0, 0)
    canvas.width = w * dpr
    canvas.height = h * dpr
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height)
  }, [data, w, h, dpr, ref])

  const ticks = [100, 1000, 4000, 16000]
  return (
    <div className={styles.spectro}>
      <canvas ref={ref} className={styles.canvas} aria-hidden="true" />
      <div className={styles.axis} aria-hidden="true">
        {ticks.map(hz => (
          <span key={hz} style={{ top: `${(hzToY(hz, minHz, maxHz, 1) * 100).toFixed(2)}%` }}>
            {hz >= 1000 ? `${hz / 1000}k` : hz}
          </span>
        ))}
      </div>
      {cutoffHz && cutoffHz < maxHz * 0.98 && (
        <div
          className={styles.cutoff}
          style={{ top: `${(hzToY(cutoffHz, minHz, maxHz, 1) * 100).toFixed(2)}%` }}
        >
          <span>{cutoffLabel} · {(cutoffHz / 1000).toFixed(1)} kHz</span>
        </div>
      )}
      <div className={styles.playhead} style={{ left: `${progress * 100}%` }} aria-hidden="true" />
    </div>
  )
}

interface WaveformProps {
  peaks: Array<[number, number]>
  progress: number
  onSeek?: ((ratio: number) => void) | undefined
  label: string
}

export const Waveform: React.FC<WaveformProps> = ({ peaks, progress, onSeek, label }) => {
  const { ref, w, h, dpr } = useCanvasSize()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !w || !h || !peaks.length) {return}
    canvas.width = w * dpr
    canvas.height = h * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    const max = Math.max(0.01, ...peaks.map(([lo, hi]) => Math.max(-lo, hi)))
    const bar = w / peaks.length
    const mid = h / 2
    const played = Math.floor(progress * peaks.length)
    peaks.forEach(([lo, hi], i) => {
      ctx.fillStyle = i < played ? '#eac06f' : 'rgba(200, 185, 167, 0.38)'
      const top = mid - (hi / max) * mid * 0.92
      const bottom = mid - (lo / max) * mid * 0.92
      ctx.fillRect(i * bar, top, Math.max(1, bar - 0.6), Math.max(1, bottom - top))
    })
  }, [peaks, progress, w, h, dpr, ref])

  const seek = (clientX: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    onSeek?.(Math.min(1, Math.max(0, (clientX - r.left) / r.width)))
  }

  return (
    <div
      className={styles.wave}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      onClick={e => seek(e.clientX, e.currentTarget)}
      onKeyDown={e => {
        if (e.key === 'ArrowRight') {onSeek?.(Math.min(1, progress + 0.05))}
        if (e.key === 'ArrowLeft') {onSeek?.(Math.max(0, progress - 0.05))}
      }}
    >
      <canvas ref={ref} className={styles.canvas} aria-hidden="true" />
    </div>
  )
}

interface ResidualProps {
  values: number[]
  label: string
}

/** The stationary high-band ripple the periodicity measure looks at. */
export const ResidualPlot: React.FC<ResidualProps> = ({ values, label }) => {
  if (values.length < 8) {return null}
  const max = Math.max(1e-3, ...values.map(Math.abs))
  const d = values
    .map((v, i) => `${i ? 'L' : 'M'}${((i / (values.length - 1)) * 100).toFixed(2)},${(20 - (v / max) * 18).toFixed(2)}`)
    .join(' ')
  return (
    <svg className={styles.residual} viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label={label}>
      <line x1="0" x2="100" y1="20" y2="20" className={styles.residualBase} />
      <path d={d} className={styles.residualLine} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/** Audio element + shared playback progress for the scope views. */
export const usePlayback = (src: string | null) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setPlaying(false)
    setProgress(0)
    if (!src) {return}
    const audio = new Audio(src)
    audioRef.current = audio
    let raf = 0
    const tick = () => {
      if (audio.duration) {setProgress(audio.currentTime / audio.duration)}
      raf = requestAnimationFrame(tick)
    }
    const onPlay = () => { setPlaying(true); raf = requestAnimationFrame(tick) }
    const onPause = () => { setPlaying(false); cancelAnimationFrame(raf) }
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onPause)
    return () => {
      cancelAnimationFrame(raf)
      audio.pause()
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onPause)
      audioRef.current = null
    }
  }, [src])

  const toggle = useCallback(() => {
    const a = audioRef.current
    if (!a) {return}
    if (a.paused) {void a.play()} else {a.pause()}
  }, [])

  const seek = useCallback((ratio: number) => {
    const a = audioRef.current
    if (!a || !a.duration) {return}
    a.currentTime = ratio * a.duration
    setProgress(ratio)
  }, [])

  return { playing, progress, toggle, seek, available: Boolean(src) }
}

export const PlayButton: React.FC<{ playing: boolean; onClick: () => void; labels: { play: string; pause: string } }> = ({ playing, onClick, labels }) => (
  <button type="button" className={styles.play} onClick={onClick} aria-label={playing ? labels.pause : labels.play}>
    {playing ? <Pause size={16} /> : <Play size={16} />}
  </button>
)
