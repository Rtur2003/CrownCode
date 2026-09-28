"""A small synth for edit sound design, plus loading, ducking and mastering."""
import wave
from pathlib import Path

import librosa
import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000


def band(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)


class Sfx:
    """A mono effects bus `seconds` long. Every method adds into self.out."""

    def __init__(self, seconds: float, seed: int = 20260928):
        self.n = int(seconds * SR)
        self.t = np.arange(self.n) / SR
        self.out = np.zeros(self.n)
        self.noise = np.random.default_rng(seed).standard_normal(self.n)

    def env(self, t0, attack, decay):
        return np.clip((self.t - t0 + attack) / attack, 0, 1) * np.exp(-np.maximum(0, self.t - t0) / decay)

    def span(self, t0, t1):
        return max(0, int(t0 * SR)), min(self.n, int(t1 * SR))

    def whoosh(self, peak, dur=0.35, gain=0.14):
        """Air rising into a cut at `peak`."""
        i0, i1 = self.span(peak - dur, peak + 0.12)
        seg = self.noise[i0:i1]
        if len(seg) < 64:
            return
        x = np.linspace(0, 1, len(seg))
        knee = dur / (dur + 0.12)
        shape = np.where(x < knee, (x / knee) ** 2, np.exp(-(x - knee) * 30))
        self.out[i0:i1] += (band(seg, 300, 1400) * (1 - x) + band(seg, 1400, 7000) * x) * shape * gain

    def impact(self, t0, gain=1.0, low=48):
        sweep = low + 60 * np.exp(-np.maximum(0, self.t - t0) / 0.05)
        self.out += np.sin(2 * np.pi * np.cumsum(sweep) / SR) * self.env(t0, 0.003, 0.6) * 0.55 * gain
        self.out += sosfilt(butter(2, 2500, 'high', fs=SR, output='sos'), self.noise) * self.env(t0, 0.001, 0.03) * 0.25 * gain
        self.out += sosfilt(butter(2, 400, 'low', fs=SR, output='sos'), self.noise) * self.env(t0, 0.002, 0.18) * 0.5 * gain

    def dive(self, t0, dur=0.45, gain=0.3):
        """A falling tone and filtered air, for the camera diving into a world."""
        i0, i1 = self.span(t0, t0 + dur + 0.3)
        tt = self.t[i0:i1] - t0
        f = 900 * np.exp(-tt / (dur * 0.5)) + 60
        tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / (dur * 0.9))
        air = band(self.noise[i0:i1], 500, 3000) * np.clip(1 - tt / (dur + 0.3), 0, 1) * 0.6
        self.out[i0:i1] += (tone * 0.5 + air) * gain

    def riser(self, t0, t1, gain=0.15):
        i0, i1 = self.span(t0, t1)
        seg = self.noise[i0:i1]
        rise = np.zeros_like(seg)
        for c in range(12):
            a, z = int(c / 12 * len(seg)), int((c + 1) / 12 * len(seg))
            centre = 400 * (7000 / 400) ** ((c + 0.5) / 12)
            rise[a:z] = band(seg[a:z], centre * 0.7, min(centre * 1.4, 20000))
        self.out[i0:i1] += rise * np.linspace(0, 1, len(seg)) ** 2.2 * gain

    def click(self, t0, gain=0.07, pitch=1850):
        self.out += band(self.noise, 2500, 6500) * self.env(t0, 0.001, 0.006) * gain * 3
        self.out += np.sin(2 * np.pi * pitch * self.t) * self.env(t0, 0.001, 0.02) * gain

    def tick_run(self, t0, dur, count=16, gain=0.03):
        """Clicks that slow down, like a wheel or a counter settling."""
        for j in range(count):
            self.click(t0 + dur * (1 - (1 - j / count) ** 0.5), gain)

    def bell(self, t0, notes, gain=0.04):
        for m in notes:
            fq = 440 * 2 ** ((m - 69) / 12)
            for ratio, w, dec in ((1, 1.0, 1.2), (2.0, 0.25, 0.6), (2.76, 0.15, 0.4)):
                self.out += np.sin(2 * np.pi * fq * ratio * self.t) * self.env(t0, 0.004, dec) * w * gain

    def type_keys(self, t0, t1, rate=26, gain=0.05):
        """Soft key taps for text being typed."""
        rng = np.random.default_rng(int(t0 * 1000))
        t = t0
        while t < t1:
            self.click(t, gain * (0.7 + 0.6 * rng.random()), pitch=1200 + 900 * rng.random())
            t += 1 / rate * (0.7 + 0.6 * rng.random())


def load_music(path: Path, seconds: float, offset: float = 0.0, fade: float = 0.9):
    y, _ = librosa.load(path, sr=SR, mono=False)
    y = np.atleast_2d(y)
    if y.shape[0] == 1:
        y = np.vstack([y, y])
    y = y[:, int(offset * SR):]
    n = int(seconds * SR)
    out = np.zeros((2, n))
    out[:, :min(n, y.shape[1])] = y[:, :n]
    t = np.arange(n) / SR
    return out * np.clip((seconds - t) / fade, 0, 1)


def voice_chain(v):
    """Speech that sits in a mix: high-pass, presence, gentle compression, a little room."""
    v = sosfilt(butter(2, 90, 'high', fs=SR, output='sos'), v)
    v = v + 0.3 * band(v, 2300, 5200)
    v = v + 0.15 * sosfilt(butter(2, 180, 'low', fs=SR, output='sos'), v)
    rms = np.sqrt(np.convolve(v ** 2, np.ones(960) / 960, 'same')) + 1e-7
    thr = np.percentile(rms, 70) * 0.8
    gain = np.where(rms > thr, (thr * (rms / thr) ** (1 / 2.6)) / rms, 1.0)
    v = v * np.convolve(gain, np.ones(480) / 480, 'same')
    v = np.tanh(v / np.abs(v).max() * 1.4) / np.tanh(1.4)
    room = np.random.default_rng(1).standard_normal(int(0.3 * SR)) * np.exp(-np.arange(int(0.3 * SR)) / SR / 0.07)
    return v + fftconvolve(v, room)[:len(v)] * 0.012


def duck(music, voice, depth=0.6):
    active = np.convolve(np.abs(voice), np.ones(1440) / 1440, 'same')
    g = np.convolve(1 - depth * np.clip(active / 0.02, 0, 1), np.ones(int(0.12 * SR)) / int(0.12 * SR), 'same')
    return music * g


def master(x, loudest_db=-11.0):
    """Level so the loudest 0.4 s sits at `loudest_db` RMS, then a soft limiter below -1 dBFS."""
    win = int(0.4 * SR)
    loud = np.sqrt(np.convolve(np.mean(np.atleast_2d(x) ** 2, axis=0), np.ones(win) / win, 'same')).max()
    x = x / loud * 10 ** (loudest_db / 20)
    x = np.tanh(x * 1.15) / np.tanh(1.15)
    return x / max(1.0, np.abs(x).max() / 0.89)


def write_wav(path: Path, x):
    x = np.atleast_2d(x)
    if x.shape[0] == 1:
        x = np.vstack([x, x])
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x.T * 32767).astype(np.int16).tobytes())
