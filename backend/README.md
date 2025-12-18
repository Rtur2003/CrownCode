# CrownCode Backend

YouTube-first backend service for AI music detection workflows.

## What This Service Does
- Accepts a YouTube URL.
- Downloads audio via `yt-dlp`.
- Optionally forwards the audio to external services:
  - Music-AIDetector (`/predict`)
  - Ses-Analizi (`/analyze`)
- Produces a deterministic preview decision if no model is available.

## Structure
```
backend/
  app/
    main.py
    schemas.py
    routes/
      health.py
      youtube.py
    services/
      external_clients.py
      url_parser.py
      youtube_analysis.py
      youtube_downloader.py
```

## API Endpoints
```
POST /api/youtube/analyze
GET  /api/health
```

### POST /api/youtube/analyze
Request body:
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "include_raw": false
}
```

Response highlights:
- `summary`: decision + confidence + decision source
- `music_ai` / `ses_analizi`: external service status (optional raw output)
- `warnings` and `errors` when downstream services are unavailable

## Environment Variables
- `MUSIC_AI_API_URL`: Base URL for Music-AIDetector (example: `http://localhost:8001`)
- `SES_ANALIZI_API_URL`: Base URL for Ses-Analizi (example: `http://localhost:8002`)
- `CROWNCODE_API_TIMEOUT_SEC`: Timeout for external service calls (default: `30`)
- `CROWNCODE_CORS_ORIGINS`: Comma-separated list of allowed origins
- `SES_ANALIZI_THRESHOLD`: Authenticity score threshold (default: `0.5`)

## External Service Contracts
- Music-AIDetector: `POST /predict` with `file` form-data
- Ses-Analizi: `POST /analyze` with `file` form-data

## Notes
- `yt-dlp` requires network access and works best with `ffmpeg` installed.
- When external services are not configured, the backend returns a preview decision.
- If the downloaded audio format is unsupported by a service, the backend skips that call and continues in preview mode.
- This service does not run or execute any training code.
