# Backend API Contract Specification

> Defines the shared contract between the Next.js frontend (`platform/`) and both backends.
> Both backends MUST conform to this contract for the frontend gateway (`analysisGateway.ts`) to work.

## Architecture

| Component | Path | Role |
|-----------|------|------|
| **Core backend** | `backend/` | Minimal FastAPI: health, youtube analysis |
| **HF backend** | `hf-crowncode-backend/` (separate repo) | Advanced FastAPI: commend, data processing, analyze, audio augmentation |
| **Frontend** | `platform/` | Next.js 14 (Pages Router) |

> `hf-crowncode-backend/` is **gitignored** in this repo (line 120).
> It lives as a separate repository deployed to HuggingFace Spaces.
> CI, dependabot, and CODEOWNERS for it are managed in that repo.

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
    "decisionSource": "music_ai",    // "music_ai" | "ses_analizi" | "preview"
    "analysisMode": "production",    // "production" | "preview"  ← REQUIRED
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

When modifying either backend, verify:

- [ ] `/api/analyze` response shape matches the `AnalysisResult` interface in `platform/hooks/analysisTypes.ts`
- [ ] `analysisMode` field is present in all responses (`"production"` or `"preview"`)
- [ ] `decisionSource` values are from the set: `music_ai`, `ses_analizi`, `preview`
- [ ] URL validation uses exact hostname set lookup (not substring)
- [ ] CORS does not combine `allow_credentials=True` with wildcard `*` origins

## Frontend References

| File | Purpose |
|------|---------|
| `platform/hooks/analysisTypes.ts` | TypeScript interfaces (source of truth for frontend) |
| `platform/hooks/analysisGateway.ts` | HTTP client for `/api/analyze` |
| `platform/hooks/useYouTubeAnalysis.ts` | YouTube/Spotify analysis hook with preview fallback |
| `platform/hooks/useFileAnalysis.ts` | File upload analysis hook with preview fallback |
