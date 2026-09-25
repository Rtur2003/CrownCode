import io
import math
import shutil
import struct
import wave

import numpy as np
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.audio_analysis import SAMPLE_RATE, Decoded, analyze_signal

client = TestClient(app)


def _wav_bytes(seconds: float = 6.0) -> bytes:
    t = np.arange(int(SAMPLE_RATE * seconds)) / SAMPLE_RATE
    rng = np.random.default_rng(0)
    beat = (np.sin(2 * math.pi * 2 * t) > 0.95).astype(float)
    left = 0.3 * np.sin(2 * math.pi * 220 * t) + 0.05 * rng.standard_normal(t.size) + 0.3 * beat
    right = 0.3 * np.sin(2 * math.pi * 330 * t) + 0.05 * rng.standard_normal(t.size)
    pcm = np.clip(np.stack([left, right], 1), -1, 1)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        w.writeframes(b"".join(struct.pack("<hh", int(a * 32767), int(b * 32767)) for a, b in pcm))
    return buf.getvalue()


def test_analyze_signal_shape():
    rng = np.random.default_rng(1)
    n = SAMPLE_RATE * 8
    decoded = Decoded(left=rng.standard_normal(n) * 0.1, right=rng.standard_normal(n) * 0.1, duration=8.0, channels=2)
    out = analyze_signal(decoded)
    assert 0.0 <= out["score"] <= 1.0
    assert set(out["contributions"]) >= {"spectralPeriodicity", "bandwidthCutoff", "loudnessRange"}
    assert len(out["visuals"]["waveform"]) == 480
    assert len(out["visuals"]["spectrogram"][0]) == 96


def test_missing_file_and_bad_source():
    assert client.post("/api/analyze", data={"sourceType": "file"}).json()["errors"] == ["missing_file"]
    assert client.post("/api/analyze", data={"sourceType": "x"}).json()["errors"] == ["invalid_source_type"]
    assert client.post("/api/analyze", data={"sourceType": "spotify", "url": "u"}).json()["errors"] == ["unsupported_source"]


def test_rejects_unknown_extension():
    res = client.post("/api/analyze", data={"sourceType": "file"}, files={"file": ("a.exe", b"x" * 2048)})
    assert res.json()["errors"] == ["invalid_file_type"]


@pytest.mark.skipif(shutil.which("ffmpeg") is None, reason="ffmpeg not installed")
def test_analyze_wav_upload():
    res = client.post("/api/analyze", data={"sourceType": "file"}, files={"file": ("tone.wav", _wav_bytes(), "audio/wav")})
    body = res.json()
    assert body["errors"] == []
    result = body["result"]
    assert result["decisionSource"] == "auris_signal"
    assert result["analysisMode"] == "signal"
    assert result["source"]["fileName"] == "tone.wav"
    assert abs(result["audioInfo"]["duration"] - 6.0) < 0.1
    assert 0.5 <= result["confidence"] <= 1.0
