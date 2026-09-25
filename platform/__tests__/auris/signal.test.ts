import { SAMPLE_RATE, analyseSignal } from '@/hooks/auris/signal'

const tone = (seconds: number, hz: number) => {
  const n = Math.floor(seconds * SAMPLE_RATE)
  const x = new Float32Array(n)
  for (let i = 0; i < n; i++) {x[i] = 0.3 * Math.sin((2 * Math.PI * hz * i) / SAMPLE_RATE)}
  return x
}

describe('analyseSignal', () => {
  it('returns a bounded score, seven readings and the visuals', async () => {
    const left = tone(6, 220)
    const report = await analyseSignal({ left, right: tone(6, 330), channels: 2, lossy: false })
    expect(report.score).toBeGreaterThanOrEqual(0)
    expect(report.score).toBeLessThanOrEqual(1)
    expect(Object.keys(report.contributions)).toHaveLength(7)
    expect(report.visuals.waveform).toHaveLength(480)
    expect(report.visuals.spectrogram[0]).toHaveLength(96)
    expect(report.measurements.analysedSeconds).toBeCloseTo(6, 1)
  })

  it('ignores the band limit for lossy sources', async () => {
    const left = tone(4, 440)
    const report = await analyseSignal({ left, right: left, channels: 2, lossy: true })
    expect(report.contributions.bandwidthCutoff.lean).toBe(0.5)
    expect(report.lossySource).toBe(true)
  })
})
