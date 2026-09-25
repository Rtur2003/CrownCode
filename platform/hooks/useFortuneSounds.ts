/**
 * Crown Fortune sound cues, synthesized with the Web Audio API.
 * Kullanım: const play = useFortuneSounds(enabled); play('reveal')
 *
 * No audio files and no playback library: each cue is a few oscillators or
 * a noise burst shaped by envelopes, so there is nothing to download and the
 * cues can't silently fail on a missing/empty asset.
 */

import { useCallback, useEffect, useRef } from 'react'

export type FortuneCue = 'whoosh' | 'reveal' | 'success' | 'dark'

const MASTER_GAIN = 0.22

function envelope(ctx: AudioContext, destination: AudioNode, start: number, attack: number, decay: number, peak = 1) {
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(peak, start + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay)
  gain.connect(destination)
  return gain
}

function tone(ctx: AudioContext, out: AudioNode, type: OscillatorType, freq: number, start: number, attack: number, decay: number, peak = 1) {
  const osc = ctx.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  osc.connect(envelope(ctx, out, start, attack, decay, peak))
  osc.start(start)
  osc.stop(start + attack + decay + 0.05)
}

const SYNTHS: Record<FortuneCue, (ctx: AudioContext, out: AudioNode) => void> = {
  // Airy sweep for the wheel spin: band-passed noise rising in pitch.
  whoosh(ctx, out) {
    const now = ctx.currentTime
    const length = Math.floor(ctx.sampleRate * 1.1)
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) {data[i] = Math.random() * 2 - 1}
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.Q.value = 1.4
    band.frequency.setValueAtTime(350, now)
    band.frequency.exponentialRampToValueAtTime(2600, now + 0.9)
    noise.connect(band)
    band.connect(envelope(ctx, out, now, 0.25, 0.8, 0.9))
    noise.start(now)
    noise.stop(now + 1.1)
  },

  // Card reveal: a slightly detuned bell chord that rings out.
  reveal(ctx, out) {
    const now = ctx.currentTime
    ;[659.25, 987.77, 1318.51].forEach((freq, i) => {
      tone(ctx, out, 'sine', freq, now + i * 0.04, 0.01, 1.6, 0.5)
      tone(ctx, out, 'sine', freq * 1.003, now + i * 0.04, 0.01, 1.2, 0.2)
    })
  },

  // Good fortune: a quick rising arpeggio.
  success(ctx, out) {
    const now = ctx.currentTime
    ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      tone(ctx, out, 'triangle', freq, now + i * 0.09, 0.01, 0.5, 0.6)
    })
  },

  // Tempting fate: a low, beating drone that swells and fades.
  dark(ctx, out) {
    const now = ctx.currentTime
    const low = ctx.createBiquadFilter()
    low.type = 'lowpass'
    low.frequency.value = 320
    low.connect(envelope(ctx, out, now, 0.6, 1.4, 0.8))
    ;[55, 55.9, 82.4].forEach((freq) => {
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.value = freq
      osc.connect(low)
      osc.start(now)
      osc.stop(now + 2.1)
    })
  },
}

export function useFortuneSounds(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => () => {
    void ctxRef.current?.close()
    ctxRef.current = null
  }, [])

  return useCallback((cue: FortuneCue) => {
    if (!enabled || typeof window === 'undefined') {return}
    try {
      const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioCtor) {return}
      // Created lazily inside a user gesture (spin/flip click) so browsers allow playback.
      const ctx = ctxRef.current ?? (ctxRef.current = new AudioCtor())
      if (ctx.state === 'suspended') {void ctx.resume()}
      const master = ctx.createGain()
      master.gain.value = MASTER_GAIN
      master.connect(ctx.destination)
      SYNTHS[cue](ctx, master)
    } catch {
      // Audio is decoration; never let it break the reading.
    }
  }, [enabled])
}
