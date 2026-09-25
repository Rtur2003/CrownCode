# Backend API Contract Specification

> Defines the API contract between the Next.js frontend (`platform/`) and the backends.

## Architecture

| Component | Path | Role | Serves `/api/analyze`? |
|-----------|------|------|------------------------|
| **Core backend** | `backend/` | FastAPI: health, `/api/analyze` (AURIS signal analysis), `/api/youtube/analyze` | **Yes** |
| **HF backend** | `hf-crowncode-backend/` (separate repo) | Advanced FastAPI: commend, data processing, analyze, audio augmentation | Yes (legacy) |
| **Frontend** | `platform/` | Next.js 14 (Pages Router) | N/A |

> `hf-crowncode-backend/` is **gitignored** in this repo (line 120).
> It lives as a separate repository deployed to HuggingFace Spaces.
> CI, dependabot, and CODEOWNERS for it are managed in that repo.

> Core backend `/api/analyze` runs the AURIS signal analysis
> (`backend/app/services/audio_analysis.py`). The browser runs the same
> algorithm (`platform/hooks/auris/signal.ts`) for files and microphone takes,
> so the backend is only required for links. Keep the two in sync.

## Analyze Endpoint

**POST** `/api/analyze`

### Request (multipart/form-data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sourceType` | `youtube` \| `file` \| `spotify` \| `apple` | Yes | Input source type |
| `url` | string | If sourceType is youtube/spotify | Source URL |
| `file` | File (max 30 MB) | If sourceType is file | Audio file upload |

### Response (JSON)

```jsonc
{
  "result": {
    "isAIGenerated": true,           // boolean
    "confidence": 0.87,              // number, 0.0–1.0
    "processingTime": 3.2,           // number, seconds
    "modelVersion": "v2-enhanced",   // string
    "decisionSource": "auris_signal", // "auris_signal" | "music_ai" | "ses_analizi"
    "analysisMode": "signal",        // "signal" | "production" | "preview"  ← REQUIRED
    "source": { /* see Source variants below */ },
    "features": {
      "spectralRegularity": 0.8,     // number, 0.0–1.0
      "temporalPatterns": 0.7,       // number, 0.0–1.0
      "harmonicStructure": 0.6,      // number, 0.0–1.0
      "artificialIndicators": [      // string[]
        "High spectral regularity detected"
      ]
    },
    "audioInfo": {
      "duration": 180,               // number, seconds
      "sampleRate": 44100,           // number
      "bitrate": 192,                // number
      "format": "MP3"                // string
    }
  },
  // Core backend only: raw readings, per-measure lean/weight and visuals
  // (waveform peaks, 96-band log spectrogram, high-band residual).
  // "signal": { "score": 0.45, "band": {...}, "contributions": {...}, "measurements": {...}, "visuals": {...} }
  "warnings": [],                    // string[]
  "errors": []                       // string[] — if non-empty, result may be null
}
```

### Source Variants

**YouTube:**
```json
{ "kind": "youtube", "url": "...", "normalizedUrl": "...", "videoId": "...", "startTimeSec": 30 }
```

**Spotify:**
```json
{ "kind": "spotify", "url": "...", "normalizedUrl": "...", "trackId": "..." }
```

**File:**
```json
{ "kind": "file", "fileName": "track.mp3", "fileSizeBytes": 4200000, "mimeType": "audio/mpeg" }
```

## Audio Augmentation Endpoint (HF backend only)

Accepts both camelCase and snake_case field names via Pydantic aliases:

| snake_case | camelCase | Type | Default |
|-----------|-----------|------|---------|
| `pitch_shift` | `pitchShift` | bool | false |
| `speed_change` | `speedChange` | bool | false |
| `bass_boost` | `bassBoost` | bool | false |
| `trim_silence` | `trimSilence` | bool | false |
| `mix_audio` | `mixAudio` | bool | false |
| `add_noise` | `addNoise` | bool | false |

## Parity Checklist

### HF backend (`hf-crowncode-backend/`) — `/api/analyze` sahibi

- [ ] Response shape `AnalysisResult` interface ile uyumlu (`platform/hooks/analysisTypes.ts`)
- [ ] `analysisMode` field tum response'larda mevcut (`"production"` veya `"preview"`)
- [ ] `decisionSource` degerleri: `music_ai`, `ses_analizi`, `preview`

### Her iki backend icin ortak

- [ ] URL validation exact hostname set lookup kullanir (substring degil)
- [ ] CORS: `allow_credentials=True` ile wildcard `*` origins birlikte kullanilmaz

## Frontend References

| File | Purpose |
|------|---------|
| `platform/hooks/analysisTypes.ts` | TypeScript interfaces (source of truth for frontend) |
| `platform/hooks/analysisGateway.ts` | HTTP client for `/api/analyze` |
| `platform/hooks/auris/useAuris.ts` | File / link / microphone flow for the AURIS page |
| `platform/hooks/auris/signal.ts` | Browser port of the signal analysis |
