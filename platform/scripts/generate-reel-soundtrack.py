"""Synthesize the soundtrack for the 9:16 atlas reel, locked to its timeline.

Everything is generated here (no samples, no licensing questions):
  - a warm D-minor pad (Dm9 → Bbmaj7 → Dm9) that swells into the outro,
  - a soft low pulse on every arrival,
  - a rising D-minor pentatonic bell as the camera reaches each world,
  - an airy noise sweep for every move between stops,
  - a synthetic room reverb.

The timing mirrors scripts/capture-atlas-reel.mjs (intro 1.3 s, travel 1.1 s,
dwell 0.75 s, outro 2.4 s). Pass the world count if the catalog grows.

Usage (from platform/):
  python scripts/generate-reel-soundtrack.py [--worlds 8] [--out assets-src/video/atlas-reel-soundtrack.wav]
Requires numpy + scipy.
"""
import argparse
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
T = {'intro': 1.3, 'travel': 1.1, 'dwell': 0.75, 'outro': 2.4}

parser = argparse.ArgumentParser()
parser.add_argument('--worlds', type=int, default=8)
parser.add_argument('--out', default='assets-src/video/atlas-reel-soundtrack.wav')
args = parser.parse_args()

count = args.worlds
segments = count + 1
duration = T['intro'] + segments * T['travel'] + count * T['dwell'] + T['outro']
total = int((duration + 0.4) * SR)
t = np.arange(total) / SR
rng = np.random.default_rng(20260926)

travel_starts = [T['intro'] + k * (T['travel'] + T['dwell']) for k in range(segments)]
arrivals = [s + T['travel'] for s in travel_starts]  # last one is the outro


def note(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def env(start, attack, decay, length=None):
    """Exponential-decay envelope starting at `start` seconds."""
    e = np.zeros(total)
    i0 = int(start * SR)
    if i0 >= total:
        return e
    n = total - i0 if length is None else min(total - i0, int(length * SR))
    x = np.arange(n) / SR
    e[i0:i0 + n] = np.minimum(1, x / attack) * np.exp(-np.maximum(0, x - attack) / decay)
    return e


# ── Pad: detuned additive voices through a gentle low-pass ──────────────
def pad_voice(freq, amp):
    out = np.zeros(total)
    for detune in (-0.12, 0.0, 0.13):
        f = freq * 2 ** (detune / 12)
        phase = rng.random() * 2 * np.pi
        for h, w in ((1, 1.0), (2, 0.34), (3, 0.16), (4, 0.07)):
            out += w * np.sin(2 * np.pi * f * h * t + phase * h)
    return out * amp / 3


chords = [
    (0.0, [38, 45, 53, 60, 64]),               # Dm9  (D2 A2 F3 C4 E4)
    (arrivals[3], [34, 41, 50, 57, 62]),       # Bbmaj7 (Bb1 F2 D3 A3 D4)
    (arrivals[-1] - 0.6, [38, 45, 53, 57, 64]),  # Dm(add9) resolve
]
pad = np.zeros(total)
for i, (start, notes) in enumerate(chords):
    end = chords[i + 1][0] if i + 1 < len(chords) else duration + 0.4
    gate = np.clip((t - start) / 0.9, 0, 1) * np.clip((end + 0.8 - t) / 0.8, 0, 1)
    for n_ in notes:
        pad += pad_voice(note(n_), 0.05 if n_ < 45 else 0.035) * gate
# Slow breathing plus a swell into the ending.
swell = 0.55 + 0.25 * np.sin(2 * np.pi * t / 7.3) + 0.45 * np.clip((t - arrivals[-1] + 1.5) / 2.0, 0, 1)
pad *= swell * np.clip(t / 1.2, 0, 1)
pad = sosfilt(butter(2, 2200, 'low', fs=SR, output='sos'), pad)

# ── Pulse on every arrival ──────────────────────────────────────────────
pulse = np.zeros(total)
for a in arrivals:
    e = env(a, 0.004, 0.35, 1.2)
    sweep = 62 + 40 * np.exp(-np.maximum(0, t - a) / 0.05)
    pulse += np.sin(2 * np.pi * np.cumsum(sweep) / SR) * e * 0.35

# ── Bells: rising D-minor pentatonic, one per world ─────────────────────
scale = [74, 77, 79, 81, 84, 86, 89, 91, 93, 96]  # D5 F5 G5 A5 C6 D6 F6 G6 A6 C7
bells = np.zeros(total)
for i, a in enumerate(arrivals[:-1]):
    f = note(scale[i % len(scale)])
    for ratio, w, dec in ((1, 1.0, 1.4), (2.0, 0.28, 0.9), (2.76, 0.22, 0.6), (5.4, 0.08, 0.25)):
        bells += np.sin(2 * np.pi * f * ratio * t) * env(a + 0.02, 0.003, dec, 3.0) * w * 0.11
# Final chord of bells on the outro.
for n_ in (74, 81, 86):
    bells += np.sin(2 * np.pi * note(n_) * t) * env(arrivals[-1], 0.01, 2.2, 3.0) * 0.07

# ── Air sweeps for each move ────────────────────────────────────────────
noise = rng.standard_normal(total)
air = np.zeros(total)
for s in travel_starts:
    i0, n = int(s * SR), int((T['travel'] + 0.3) * SR)
    seg = noise[i0:i0 + n].copy()
    if len(seg) < 64:
        continue
    lo = sosfilt(butter(2, [300, 1400], 'band', fs=SR, output='sos'), seg)
    hi = sosfilt(butter(2, [1400, 5200], 'band', fs=SR, output='sos'), seg)
    x = np.linspace(0, 1, len(seg))
    shape = np.sin(np.pi * np.clip(x / 0.85, 0, 1)) ** 2
    air[i0:i0 + len(seg)] += (lo * (1 - x) + hi * x) * shape * 0.03

dry = pad + pulse + bells + air

# ── Room: synthetic stereo impulse response ─────────────────────────────
ir_len = int(2.2 * SR)
decay = np.exp(-np.arange(ir_len) / SR / 0.55)
left = fftconvolve(dry, rng.standard_normal(ir_len) * decay)[:total]
right = fftconvolve(dry, rng.standard_normal(ir_len) * decay)[:total]
wet = 0.012
mix = np.stack([dry + left * wet, dry + right * wet], axis=1)

# ── Master: fade, level, soft clip ──────────────────────────────────────
fade = np.clip(t / 0.25, 0, 1) * np.clip((duration + 0.4 - t) / 1.4, 0, 1)
mix *= fade[:, None]
mix /= np.sqrt(np.mean(mix ** 2)) / 10 ** (-19 / 20)  # ~-14 LUFS integrated
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix = np.clip(mix, -0.98, 0.98)

with wave.open(args.out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print(f'{args.out}: {duration:.2f} s, {count} worlds, peak {np.abs(mix).max():.2f}')
