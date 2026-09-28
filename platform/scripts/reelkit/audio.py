"""Reading music for an edit: stitching sections, finding hits, spectrum per frame."""
from pathlib import Path

import librosa
import numpy as np

from .core import FPS
from .sound import SR


def section(path: Path, start: float, seconds: float) -> np.ndarray:
    """A stereo stretch of a file, at the edit's sample rate."""
    y, _ = librosa.load(path, sr=SR, mono=False, offset=max(0.0, start), duration=seconds + 0.5)
    y = np.atleast_2d(y)
    if y.shape[0] == 1:
        y = np.vstack([y, y])
    n = int(seconds * SR)
    out = np.zeros((2, n))
    out[:, :min(n, y.shape[1])] = y[:, :n]
    return out


def stitch(parts, fade: float = 0.3):
    """Join (audio, seconds on screen) parts with equal-power crossfades.

    Each part should carry `fade` extra seconds at its end for the overlap.
    Returns the mix and the edit time each part starts at.
    """
    total = sum(sec for _, sec in parts) + fade
    out = np.zeros((2, int(total * SR) + 1))
    starts, t = [], 0.0
    nf = int(fade * SR)
    for i, (y, sec) in enumerate(parts):
        n = min(y.shape[1], int((sec + fade) * SR))
        seg = y[:, :n].copy()
        if i > 0:
            seg[:, :nf] *= np.sin(np.linspace(0, np.pi / 2, nf))
        if i < len(parts) - 1:
            seg[:, n - nf:n] *= np.cos(np.linspace(0, np.pi / 2, nf))
        i0 = int(t * SR)
        out[:, i0:i0 + n] += seg[:, :out.shape[1] - i0]
        starts.append(t)
        t += sec
    return out[:, :int(t * SR)], starts


def hits(y: np.ndarray, min_gap: float = 0.35, top: float = 0.35):
    """Times of the strongest onsets (the loudest `top` share), at least `min_gap` apart."""
    mono = y.mean(axis=0) if y.ndim == 2 else y
    env = librosa.onset.onset_strength(y=mono, sr=SR, hop_length=512)
    frames = librosa.onset.onset_detect(onset_envelope=env, sr=SR, hop_length=512)
    if not len(frames):
        return np.array([])
    strength = env[frames]
    keep = frames[strength >= np.quantile(strength, 1 - top)]
    times = librosa.frames_to_time(keep, sr=SR, hop_length=512)
    out = []
    for t in times:
        if not out or t - out[-1] >= min_gap:
            out.append(t)
    return np.array(out)


def snap(t: float, candidates, reach: float = 0.25) -> float:
    """Move a planned cut onto the nearest hit, if one is close."""
    if len(candidates) == 0:
        return t
    i = int(np.argmin(np.abs(candidates - t)))
    return float(candidates[i]) if abs(candidates[i] - t) <= reach else t


def spectrum(y: np.ndarray, bands: int = 48, lo: float = 45, hi: float = 9000):
    """Per-frame band energies (frames x bands), 0..~1, fast attack and slow release."""
    mono = y.mean(axis=0) if y.ndim == 2 else y
    mono = librosa.resample(mono, orig_sr=SR, target_sr=22050)
    hop = 22050 // FPS
    S = np.abs(librosa.stft(mono, n_fft=2048, hop_length=hop))
    f = librosa.fft_frequencies(sr=22050, n_fft=2048)
    edges = np.geomspace(lo, hi, bands + 1)
    cols = []
    for a, b in zip(edges[:-1], edges[1:]):
        idx = np.flatnonzero((f >= a) & (f < b))
        if not len(idx):
            idx = [int(np.argmin(np.abs(f - a)))]
        cols.append(S[idx].mean(0))
    x = np.log1p(np.stack(cols, 1) * 20)
    x /= np.percentile(x, 98, axis=0, keepdims=True) + 1e-6
    out = np.zeros_like(x)
    for i in range(len(x)):
        prev = out[i - 1] if i else x[0]
        out[i] = np.where(x[i] > prev, x[i], prev * 0.8 + x[i] * 0.2)
    return np.clip(out, 0, 1.2)


def loudness(y: np.ndarray):
    """Per-frame RMS, normalised to its 98th percentile."""
    mono = y.mean(axis=0) if y.ndim == 2 else y
    hop = SR // FPS
    r = librosa.feature.rms(y=mono, frame_length=hop * 2, hop_length=hop)[0]
    return np.clip(r / (np.percentile(r, 98) + 1e-9), 0, 1.3)
