# CrownCode Backend

YouTube-first backend service for AI music detection workflows.

---

## Hugging Face Spaces Deployment

### Quick Deploy

1. **Hugging Face Space Olustur**
   - [huggingface.co/new-space](https://huggingface.co/new-space) adresine git
   - Space Name: `crowncode-backend`
   - SDK: **Docker** (onemli!)
   - Hardware: **CPU Basic (Free)**

2. **Dosyalari Yukle**
   - Space sayfasinda "Files" sekmesine git
   - "Add file" > "Upload files" tikla
   - Su dosyalari yukle:
     - `Dockerfile`
     - `requirements.txt`
     - `app/` klasoru (tum icerigi ile)

3. **Deploy**
   - "Commit changes" butonuna bas
   - 3-5 dakika icinde build tamamlanir

### URL Format
```
https://KULLANICI_ADI-crowncode-backend.hf.space
```

### Test Endpoints
```
GET  /api/health     -> {"status": "healthy"}
GET  /docs           -> Swagger UI
POST /api/youtube/analyze
```

---

## What This Service Does

- Accepts a YouTube URL
- Downloads audio via `yt-dlp`
- Optionally forwards the audio to external services:
  - Music-AIDetector (`/predict`)
  - Ses-Analizi (`/analyze`)
- Produces a deterministic preview decision if no model is available

---

## Structure

```
backend/
  Dockerfile          <- Hugging Face Spaces icin
  requirements.txt    <- CPU-compatible dependencies
  app/
    main.py
    schemas.py
    routes/
      health.py
      youtube.py
      data_processing.py
    services/
      external_clients.py
      url_parser.py
      youtube_analysis.py
      youtube_downloader.py
      audio_processor.py
      validation.py
      logging_config.py
      preview_model.py
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/youtube/analyze` | Analyze YouTube video |
| POST | `/api/data/augment/audio` | Audio augmentation |
| POST | `/api/data/augment/image` | Image augmentation |

### POST /api/youtube/analyze

Request body:
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "include_raw": false
}
```

Response:
```json
{
  "summary": {
    "decision": "ai_generated",
    "confidence": 0.85,
    "source": "preview_model"
  },
  "music_ai": { ... },
  "ses_analizi": { ... },
  "warnings": [],
  "errors": []
}
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CROWNCODE_CORS_ORIGINS` | `*` | Allowed CORS origins |
| `MUSIC_AI_API_URL` | - | Music-AIDetector service URL |
| `SES_ANALIZI_API_URL` | - | Ses-Analizi service URL |
| `CROWNCODE_API_TIMEOUT_SEC` | `30` | External service timeout |
| `SES_ANALIZI_THRESHOLD` | `0.5` | Authenticity score threshold |
| `LOG_LEVEL` | `INFO` | Logging level |

---

## Frontend Configuration

Backend deploy edildikten sonra frontend `.env` dosyasini guncelle:

```env
NEXT_PUBLIC_API_URL=https://kullaniciadi-crowncode-backend.hf.space
```

---

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Install PyTorch CPU
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Run server
uvicorn app.main:app --reload --port 8000
```

---

## Docker Local Build

```bash
docker build -t crowncode-backend .
docker run -p 7860:7860 crowncode-backend
```

---

## Notes

- `yt-dlp` requires network access and works best with `ffmpeg` installed
- When external services are not configured, returns preview decision
- Hugging Face free tier has 16GB RAM and 2 vCPU
- Build may take 5-10 minutes due to PyTorch installation
