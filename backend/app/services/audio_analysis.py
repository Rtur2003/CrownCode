"""
AURIS signal analysis.

Measures a decoded track and reports how strongly each measurement leans
towards the traces generative audio models tend to leave. This is a set of
hand-calibrated signal measurements, not a trained classifier; every value
in the report is a real measurement of the uploaded audio.

The browser runs the same algorithm (platform/lib/auris/analyze.ts). Keep
the constants below in sync with that file.
"""

from __future__ import annotations

import math
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional

import numpy as np

SAMPLE_RATE = 44100
N_FFT = 2048
HOP = 1024
MAX_ANALYSIS_SEC = 90.0
MAX_DECODE_SEC = 600.0
MIN_ANALYSIS_SEC = 3.0
WAVEFORM_POINTS = 480
SPEC_BANDS = 96
SPEC_FRAMES = 240
MODEL_VERSION = "auris-signal-1.0"


class AudioDecodeError(RuntimeError):
    pass


@dataclass
class Decoded:
    left: np.ndarray
    right: np.ndarray
    duration: float
    channels: int


def ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None


def _probe_channels(path: Path) -> int:
    if shutil.which("ffprobe") is None:
        return 2
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-select_streams", "a:0",
             "-show_entries", "stream=channels", "-of", "csv=p=0", str(path)],
            capture_output=True, text=True, timeout=20, check=True,
        ).stdout.strip()
        return max(1, int(out.split(",")[0]))
    except (subprocess.SubprocessError, ValueError):
        return 2


def decode_file(path: Path) -> Decoded:
    """Decode any ffmpeg-readable file to 44.1 kHz stereo float32."""
    if not ffmpeg_available():
        raise AudioDecodeError("ffmpeg_unavailable")
    cmd = [
        "ffmpeg", "-v", "error", "-nostdin", "-i", str(path),
        "-t", str(MAX_DECODE_SEC), "-vn",
        "-ac", "2", "-ar", str(SAMPLE_RATE), "-f", "f32le", "-",
    ]
    try:
        raw = subprocess.run(cmd, capture_output=True, timeout=180, check=True).stdout
    except subprocess.CalledProcessError as exc:
        raise AudioDecodeError("decode_failed") from exc
    except subprocess.TimeoutExpired as exc:
        raise AudioDecodeError("decode_timeout") from exc

    data = np.frombuffer(raw, dtype=np.float32)
    if data.size < 2 * SAMPLE_RATE * MIN_ANALYSIS_SEC:
        raise AudioDecodeError("audio_too_short")
    data = data[: data.size - data.size % 2].reshape(-1, 2)
    return Decoded(
        left=data[:, 0].astype(np.float64),
        right=data[:, 1].astype(np.float64),
        duration=data.shape[0] / SAMPLE_RATE,
        channels=_probe_channels(path),
    )


# ── helpers ──────────────────────────────────────────────────────────


def _clamp01(x: float) -> float:
    return float(min(1.0, max(0.0, x)))


def _ramp(x: float, lo: float, hi: float) -> float:
    """0 at lo, 1 at hi (works for lo > hi too)."""
    if hi == lo:
        return 0.0
    return _clamp01((x - lo) / (hi - lo))


def _db(x: np.ndarray | float) -> np.ndarray | float:
    return 10.0 * np.log10(np.maximum(x, 1e-12))


def _analysis_window(sig: np.ndarray) -> slice:
    n = sig.size
    max_n = int(MAX_ANALYSIS_SEC * SAMPLE_RATE)
    if n <= max_n:
        return slice(0, n)
    start = (n - max_n) // 2
    return slice(start, start + max_n)


def _stft_power(mono: np.ndarray) -> np.ndarray:
    window = np.hanning(N_FFT)
    frames = 1 + (mono.size - N_FFT) // HOP
    idx = np.arange(N_FFT)[None, :] + HOP * np.arange(frames)[:, None]
    spec = np.fft.rfft(mono[idx] * window, axis=1)
    return (spec.real ** 2 + spec.imag ** 2) / N_FFT  # (frames, bins)


def _moving_average(x: np.ndarray, width: int) -> np.ndarray:
    kernel = np.ones(width) / width
    pad = width // 2
    padded = np.pad(x, (pad, width - 1 - pad), mode="edge")
    return np.convolve(padded, kernel, mode="valid")


# ── measurements ─────────────────────────────────────────────────────


def _bandwidth_cutoff(mean_db: np.ndarray, freqs: np.ndarray) -> float:
    """Highest frequency whose average level stays within 50 dB of the 1-8 kHz median."""
    ref_band = (freqs >= 1000) & (freqs <= 8000)
    ref = float(np.median(mean_db[ref_band]))
    above = np.where(mean_db > ref - 50.0)[0]
    if above.size == 0:
        return float(freqs[-1])
    return float(freqs[min(above[-1], freqs.size - 1)])


def _spectral_periodicity(power: np.ndarray, freqs: np.ndarray, cutoff: float) -> tuple[float, np.ndarray]:
    """Autocorrelation peak of the stationary part of the high-band spectrum.

    Decoders that upsample with transposed convolutions leave peaks at fixed,
    evenly spaced frequencies. Taking the median over time keeps what is
    stationary (those peaks) and drops moving musical harmonics.
    """
    med_db = _db(np.median(power, axis=0))
    band = (freqs >= 4000) & (freqs <= min(cutoff, 20000) - 200)
    seg = med_db[band]
    if seg.size < 64:
        return 0.0, np.zeros(0)
    residual = seg - _moving_average(seg, 31)
    residual = residual - residual.mean()
    denom = float(np.dot(residual, residual)) or 1.0
    lags = range(4, min(100, seg.size // 3))
    ac = np.array([np.dot(residual[:-lag], residual[lag:]) / denom for lag in lags])
    peak = float(ac.max()) if ac.size else 0.0
    return _clamp01(peak), residual


def _flatness_cv(power: np.ndarray, freqs: np.ndarray, cutoff: float) -> float:
    band = (freqs >= 200) & (freqs <= cutoff)
    p = power[:, band] + 1e-12
    flat = np.exp(np.mean(np.log(p), axis=1)) / np.mean(p, axis=1)
    loud = np.sum(power, axis=1)
    keep = loud > np.percentile(loud, 20)
    flat = flat[keep] if keep.any() else flat
    mean = float(np.mean(flat)) or 1e-9
    return float(np.std(flat) / mean)


def _centroid_cv(power: np.ndarray, freqs: np.ndarray) -> float:
    total = np.sum(power, axis=1) + 1e-12
    centroid = np.sum(power * freqs[None, :], axis=1) / total
    keep = total > np.percentile(total, 20)
    c = centroid[keep] if keep.any() else centroid
    return float(np.std(c) / (np.mean(c) or 1e-9))


def _loudness_stats(mono: np.ndarray) -> Dict[str, float]:
    win = int(0.4 * SAMPLE_RATE)
    hop = int(0.1 * SAMPLE_RATE)
    n = 1 + max(0, (mono.size - win) // hop)
    sq = np.concatenate([[0.0], np.cumsum(mono ** 2)])
    starts = np.arange(n) * hop
    ms = (sq[starts + win] - sq[starts]) / win
    st_db = _db(ms)
    gated = st_db[st_db > -70]
    if gated.size:
        gated = gated[gated > float(np.mean(gated)) - 20]
    lra = float(np.percentile(gated, 95) - np.percentile(gated, 10)) if gated.size > 4 else 0.0
    rms = math.sqrt(float(np.mean(mono ** 2)) or 1e-12)
    peak = float(np.max(np.abs(mono))) or 1e-12
    return {
        "lra": lra,
        "crest": 20 * math.log10(peak / rms),
        "rms_db": 20 * math.log10(rms),
        "peak_db": 20 * math.log10(peak),
    }


def _tempo_stats(power: np.ndarray) -> Dict[str, float]:
    log_p = np.log1p(power[:, : N_FFT // 4] * 1e3)
    flux = np.maximum(0.0, np.diff(log_p, axis=0)).sum(axis=1)
    flux = flux - _moving_average(flux, 16)
    flux = np.maximum(flux, 0.0)
    fps = SAMPLE_RATE / HOP
    min_lag, max_lag = int(fps * 60 / 180), int(fps * 60 / 60)

    def bpm_and_strength(x: np.ndarray) -> tuple[float, float]:
        x = x - x.mean()
        denom = float(np.dot(x, x)) or 1.0
        ac = np.array([np.dot(x[:-lag], x[lag:]) / denom for lag in range(min_lag, max_lag + 1)])
        i = int(np.argmax(ac))
        return 60.0 * fps / (min_lag + i), float(ac[i])

    bpm, strength = bpm_and_strength(flux)
    segs = np.array_split(flux, 4)
    seg_bpms = [bpm_and_strength(s)[0] for s in segs if s.size > max_lag * 2]
    # Fold octave errors onto the global tempo before measuring drift.
    folded = []
    for b in seg_bpms:
        while b > bpm * 1.4:
            b /= 2
        while b < bpm / 1.4:
            b *= 2
        folded.append(b)
    drift = float(np.std(folded)) if len(folded) > 1 else 0.0
    return {"bpm": bpm, "pulse": _clamp01(strength), "drift": drift}


def _stereo_stats(left: np.ndarray, right: np.ndarray) -> Dict[str, float]:
    mid = (left + right) / 2
    side = (left - right) / 2
    e_mid = float(np.dot(mid, mid)) or 1e-12
    e_side = float(np.dot(side, side))
    denom = math.sqrt(float(np.dot(left, left)) * float(np.dot(right, right))) or 1e-12
    return {"correlation": float(np.dot(left, right) / denom), "side_ratio": e_side / e_mid}


def _waveform(mono: np.ndarray) -> List[List[float]]:
    chunks = np.array_split(mono, WAVEFORM_POINTS)
    return [[round(float(c.min()), 4), round(float(c.max()), 4)] for c in chunks if c.size]


def _spectrogram(power: np.ndarray, freqs: np.ndarray) -> List[List[int]]:
    """Log-frequency spectrogram, 40 Hz-20 kHz, 0-255 over an 80 dB range."""
    edges = np.geomspace(40, 20000, SPEC_BANDS + 1)
    weights = np.zeros((freqs.size, SPEC_BANDS))
    for b in range(SPEC_BANDS):
        sel = (freqs >= edges[b]) & (freqs < edges[b + 1])
        if sel.any():
            weights[sel, b] = 1.0 / sel.sum()
        else:  # band narrower than one FFT bin: use the nearest bin
            weights[int(np.argmin(np.abs(freqs - math.sqrt(edges[b] * edges[b + 1])))), b] = 1.0
    groups = np.array_split(np.arange(power.shape[0]), min(SPEC_FRAMES, power.shape[0]))
    out = np.stack([power[g].mean(axis=0) for g in groups]) @ weights
    arr = _db(out)
    top = float(np.percentile(arr, 99.5))
    scaled = np.clip((arr - (top - 80.0)) / 80.0, 0, 1) * 255
    return scaled.astype(int).tolist()


# ── scoring ──────────────────────────────────────────────────────────

# (weight, category) per measurement. Weights are hand-set; leans are 0..1
# where 1 = matches the generative-audio pattern.
WEIGHTS = {
    "spectralPeriodicity": (0.30, "spectral"),
    "bandwidthCutoff": (0.15, "spectral"),
    "flatnessVariation": (0.15, "timbre"),
    "centroidVariation": (0.10, "timbre"),
    "loudnessRange": (0.10, "temporal"),
    "tempoDrift": (0.10, "rhythm"),
    "stereoCorrelation": (0.10, "spectral"),
}


LOSSY_FORMATS = {"MP3", "AAC", "M4A", "MP4", "OGG", "OPUS", "WEBM"}


def _leans(m: Dict[str, float], lossy: bool) -> Dict[str, float]:
    # Lossy encoders low-pass the signal and add their own spectral structure,
    # so a band limit says nothing about the source and periodicity needs more.
    return {
        "spectralPeriodicity": _ramp(m["spectralPeriodicity"], 0.3 if lossy else 0.15, 0.6),
        "bandwidthCutoff": 0.5 if lossy else _ramp(m["bandwidthCutoff"], 20500, 15500),
        "flatnessVariation": _ramp(m["flatnessVariation"], 0.9, 0.35),
        "centroidVariation": _ramp(m["centroidVariation"], 0.45, 0.15),
        "loudnessRange": _ramp(m["loudnessRange"], 9.0, 3.0),
        "tempoDrift": _ramp(m["tempoDrift"], 3.0, 0.3) if m["pulse"] > 0.2 else 0.5,
        "stereoCorrelation": _ramp(m["stereoCorrelation"], 0.6, 0.97) if m["channels"] > 1 else 0.5,
    }


def _band(score: float) -> Dict[str, object]:
    distance = abs(score - 0.5)
    if distance < 0.1:
        return {"tier": "uncertain", "labelTr": "Belirsiz", "labelEn": "Uncertain", "lowerBound": 0.4, "upperBound": 0.6}
    if distance < 0.2:
        lo, hi = (0.6, 0.7) if score > 0.5 else (0.3, 0.4)
        return {"tier": "likely", "labelTr": "Zayıf eğilim", "labelEn": "Weak lean", "lowerBound": lo, "upperBound": hi}
    if distance < 0.3:
        lo, hi = (0.7, 0.8) if score > 0.5 else (0.2, 0.3)
        return {"tier": "strong", "labelTr": "Belirgin eğilim", "labelEn": "Clear lean", "lowerBound": lo, "upperBound": hi}
    lo, hi = (0.8, 1.0) if score > 0.5 else (0.0, 0.2)
    return {"tier": "very_strong", "labelTr": "Güçlü eğilim", "labelEn": "Strong lean", "lowerBound": lo, "upperBound": hi}


def analyze_signal(decoded: Decoded, lossy: bool = False) -> Dict[str, object]:
    window = _analysis_window(decoded.left)
    left, right = decoded.left[window], decoded.right[window]
    mono = (left + right) / 2

    power = _stft_power(mono)
    freqs = np.fft.rfftfreq(N_FFT, 1 / SAMPLE_RATE)
    mean_db = _db(power.mean(axis=0))

    cutoff = _bandwidth_cutoff(mean_db, freqs)
    periodicity, residual = _spectral_periodicity(power, freqs, cutoff)
    loud = _loudness_stats(mono)
    tempo = _tempo_stats(power)
    stereo = _stereo_stats(left, right)

    measured = {
        "spectralPeriodicity": periodicity,
        "bandwidthCutoff": cutoff,
        "flatnessVariation": _flatness_cv(power, freqs, cutoff),
        "centroidVariation": _centroid_cv(power, freqs),
        "loudnessRange": loud["lra"],
        "tempoDrift": tempo["drift"],
        "stereoCorrelation": stereo["correlation"],
        "pulse": tempo["pulse"],
        "channels": float(decoded.channels),
    }
    leans = _leans(measured, lossy)
    total_w = sum(w for w, _ in WEIGHTS.values())
    score = sum(leans[k] * w for k, (w, _) in WEIGHTS.items()) / total_w

    contributions = {
        k: {
            "name": k,
            "category": cat,
            "value": round(measured[k], 4),
            "lean": round(leans[k], 4),
            "weight": w,
            "shapValue": round((leans[k] - 0.5) * w / total_w, 4),
            "direction": "towards_ai" if leans[k] > 0.55 else "towards_human" if leans[k] < 0.45 else "neutral",
        }
        for k, (w, cat) in WEIGHTS.items()
    }

    step = max(1, residual.size // 256) if residual.size else 1
    return {
        "score": round(score, 4),
        "band": _band(score),
        "contributions": contributions,
        "lossySource": lossy,
        "measurements": {
            "bpm": round(tempo["bpm"], 1),
            "pulseStrength": round(tempo["pulse"], 3),
            "crestDb": round(loud["crest"], 2),
            "rmsDb": round(loud["rms_db"], 2),
            "peakDb": round(loud["peak_db"], 2),
            "sideRatio": round(stereo["side_ratio"], 4),
            "analysedSeconds": round(mono.size / SAMPLE_RATE, 2),
        },
        "visuals": {
            "waveform": _waveform(mono),
            "spectrogram": _spectrogram(power, freqs),
            "spectrogramMinHz": 40,
            "spectrogramMaxHz": 20000,
            "periodicityResidual": [round(float(v), 3) for v in residual[::step]],
        },
    }


def build_result(decoded: Decoded, analysis: Dict[str, object], source: Dict[str, object],
                 processing_time: float, fmt: str, bitrate: int) -> Dict[str, object]:
    """Shape the analysis as the frontend `AnalysisResult` (platform/hooks/analysisTypes.ts)."""
    contributions: Dict[str, Dict[str, object]] = analysis["contributions"]  # type: ignore[assignment]
    score = float(analysis["score"])  # type: ignore[arg-type]
    leaning = sorted(contributions.values(), key=lambda c: abs(float(c["shapValue"])), reverse=True)
    avg = lambda *keys: round(sum(float(contributions[k]["lean"]) for k in keys) / len(keys), 4)  # noqa: E731

    return {
        "isAIGenerated": score >= 0.5,
        "confidence": round(0.5 + abs(score - 0.5), 4),
        "processingTime": round(processing_time, 2),
        "modelVersion": MODEL_VERSION,
        "decisionSource": "auris_signal",
        "analysisMode": "signal",
        "source": source,
        "features": {
            "spectralRegularity": avg("spectralPeriodicity", "flatnessVariation"),
            "temporalPatterns": avg("tempoDrift", "loudnessRange"),
            "harmonicStructure": avg("centroidVariation", "bandwidthCutoff"),
            "artificialIndicators": [str(c["name"]) for c in leaning if c["direction"] == "towards_ai"],
        },
        "audioInfo": {
            "duration": round(decoded.duration, 2),
            "sampleRate": SAMPLE_RATE,
            "bitrate": bitrate,
            "format": fmt,
            "channels": decoded.channels,
        },
        "signal": analysis,
    }


def analyze_path(path: Path, source: Dict[str, object], fmt: Optional[str] = None) -> Dict[str, object]:
    import time

    started = time.perf_counter()
    decoded = decode_file(path)
    fmt = (fmt or path.suffix.lstrip(".") or "audio").upper()
    analysis = analyze_signal(decoded, lossy=fmt in LOSSY_FORMATS)
    size = path.stat().st_size
    bitrate = int(size * 8 / decoded.duration / 1000) if decoded.duration else 0
    return build_result(
        decoded, analysis, source,
        processing_time=time.perf_counter() - started,
        fmt=fmt,
        bitrate=bitrate,
    )
