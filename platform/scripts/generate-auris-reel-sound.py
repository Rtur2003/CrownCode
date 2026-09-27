"""Sound for the AURIS reel, placed on the events the capture recorded.

No samples and no borrowed music: a quiet D-minor bed with sounds on what
happens on screen. The file drop lands with a soft thud, the upload rises
as filtered air, every finished step rings a bell a little higher than the
last, the AI verdict answers with a low minor swell and the human one
opens into D major. It is kept under the voice of a song, so a track from
Instagram's own library can be laid on top.

Usage (from platform/):
  python scripts/generate-auris-reel-sound.py --events assets-src/video/auris/events.json \
      [--video assets-src/video/auris/auris-reel-9x16-tr-silent.mp4]
Writes <dir>/auris-reel-sound.wav and, with --video, the muxed mp4 next to it.
Requires numpy, scipy and (for muxing) ffmpeg.
"""
import argparse
import json
import subprocess
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
parser = argparse.ArgumentParser()
parser.add_argument('--events', required=True)
parser.add_argument('--video')
args = parser.parse_args()

meta = json.loads(Path(args.events).read_text(encoding='utf-8'))
duration = meta['frames'] / meta['fps']
events = meta['events']
total = int((duration + 0.2) * SR)
t = np.arange(total) / SR
rng = np.random.default_rng(20260927)


def at(name):
    return [e[0] for e in events if e[1] == name]


def note(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def env(start, attack, decay, length):
    e = np.zeros(total)
    i0 = int(max(0, start) * SR)
    if i0 >= total:
        return e
    n = min(total - i0, int(length * SR))
    x = np.arange(n) / SR
    e[i0:i0 + n] = np.minimum(1, x / attack) * np.exp(-np.maximum(0, x - attack) / decay)
    return e


def tone(freq, partials=((1, 1.0), (2, 0.3), (3, 0.12))):
    out = np.zeros(total)
    for h, w in partials:
        out += w * np.sin(2 * np.pi * freq * h * t + rng.random() * 6.28)
    return out


def gate(a, b, fade=0.8):
    return np.clip((t - a) / fade, 0, 1) * np.clip((b - t) / fade, 0, 1)


verdict_ai = (at('mode:ai') or [None])[0]
verdict_human = (at('mode:human') or [None])[0]
end = (at('end') or [duration - 3])[0]

# ── Bed: D minor (add9) that opens to D major 7 for the human verdict ──
bed = np.zeros(total)
minor = [38, 45, 53, 57, 64]      # D2 A2 F3 A3 E4
major = [38, 45, 54, 57, 61, 64]  # D2 A2 F#3 A3 C#4 E4
switch = verdict_human if verdict_human else duration
back = end - 0.2
for n_ in minor:
    for det in (-0.1, 0.1):
        bed += tone(note(n_) * 2 ** (det / 12)) * (0.04 if n_ < 45 else 0.028) * gate(0, switch + 0.4, 1.2)
for n_ in major:
    for det in (-0.1, 0.1):
        bed += tone(note(n_) * 2 ** (det / 12)) * (0.04 if n_ < 45 else 0.026) * gate(switch - 0.2, back + 0.6, 1.0)
# Back to the home chord under the end card.
for n_ in [38, 45, 50, 57, 62, 69]:
    bed += tone(note(n_)) * 0.03 * gate(back, duration + 0.5, 1.2)
bed *= 0.7 + 0.3 * np.sin(2 * np.pi * t / 6.1)
bed = sosfilt(butter(2, 1800, 'low', fs=SR, output='sos'), bed)

fx = np.zeros(total)

# ── Hot: a shimmer as the file hovers over the world ───────────────────
for s in at('hot'):
    shimmer = sum(np.sin(2 * np.pi * note(m) * t) for m in (81, 86, 88)) / 3
    fx += shimmer * env(s, 0.25, 0.5, 1.4) * 0.05

# ── Drop: soft thud ────────────────────────────────────────────────────
for s in at('drop'):
    sweep = 55 + 70 * np.exp(-np.maximum(0, t - s) / 0.04)
    fx += np.sin(2 * np.pi * np.cumsum(sweep) / SR) * env(s, 0.004, 0.22, 0.8) * 0.4

# ── Upload: filtered air rising until processing starts ────────────────
noise = rng.standard_normal(total)
for s in at('upload'):
    e_ = [p for p in at('processing') if p > s]
    stop = e_[0] if e_ else s + 1
    i0, i1 = int(s * SR), int(stop * SR)
    seg = noise[i0:i1]
    if len(seg) > 256:
        lo = sosfilt(butter(2, [400, 1600], 'band', fs=SR, output='sos'), seg)
        hi = sosfilt(butter(2, [1600, 6000], 'band', fs=SR, output='sos'), seg)
        x = np.linspace(0, 1, len(seg))
        fx[i0:i1] += (lo * (1 - x) + hi * x) * np.sin(np.pi * x) ** 1.5 * 0.035

# ── Steps: a bell per finished step, climbing D minor pentatonic ───────
scale = [74, 77, 79, 81, 84, 86, 89, 91]
runs = [d for d in at('drop')]
for i, s in enumerate(at('step')):
    # Restart the climb on the second song.
    n_before = sum(1 for d in runs if d < s)
    k = sum(1 for x in at('step') if x <= s and sum(1 for d in runs if d < x) == n_before) - 1
    f = note(scale[k % len(scale)] + (5 if n_before > 1 else 0))
    for ratio, w, dec in ((1, 1.0, 0.9), (2.0, 0.25, 0.5), (2.76, 0.18, 0.35)):
        fx += np.sin(2 * np.pi * f * ratio * t) * env(s, 0.003, dec, 1.8) * w * 0.07

# ── Verdicts ───────────────────────────────────────────────────────────
if verdict_ai is not None:
    for n_, g in ((26, 0.22), (38, 0.14), (45, 0.08), (53, 0.06)):
        fx += tone(note(n_)) * env(verdict_ai, 0.35, 1.6, 3.2) * g
    fx += np.sin(2 * np.pi * note(86) * t) * env(verdict_ai + 0.05, 0.004, 1.3, 2.5) * 0.06
if verdict_human is not None:
    for n_, delay in ((74, 0.0), (78, 0.09), (81, 0.18), (85, 0.27)):
        for ratio, w in ((1, 1.0), (2.0, 0.2)):
            fx += np.sin(2 * np.pi * note(n_) * ratio * t) * env(verdict_human + delay, 0.004, 1.4, 2.6) * w * 0.05

# ── End card ───────────────────────────────────────────────────────────
for n_ in (62, 69, 74):
    fx += np.sin(2 * np.pi * note(n_) * t) * env(end + 0.1, 0.02, 2.0, 3.0) * 0.045

dry = bed + fx
ir_len = int(1.8 * SR)
decay = np.exp(-np.arange(ir_len) / SR / 0.5)
left = fftconvolve(dry, rng.standard_normal(ir_len) * decay)[:total]
right = fftconvolve(dry, rng.standard_normal(ir_len) * decay)[:total]
mix = np.stack([dry + left * 0.01, dry + right * 0.01], axis=1)
fade = np.clip(t / 0.3, 0, 1) * np.clip((duration + 0.2 - t) / 1.2, 0, 1)
mix *= fade[:, None]
mix /= np.sqrt(np.mean(mix ** 2)) / 10 ** (-21 / 20)
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix = np.clip(mix, -0.97, 0.97)

out = Path(args.events).with_name('auris-reel-sound.wav')
with wave.open(str(out), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print(out, f'{duration:.2f}s', 'events:', len(events))

if args.video:
    video = Path(args.video)
    muxed = video.with_name(video.name.replace('-silent', ''))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(video), '-i', str(out),
                    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', str(muxed)], check=True)
    print(muxed)
