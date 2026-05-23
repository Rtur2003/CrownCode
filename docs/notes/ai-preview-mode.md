# AI Music Detection Preview Mode

- Model henüz entegre edilmediğinden önizleme sonuçları rastgele tohum + jitter ile çalışıyor; güven ve feature skorları her çağrıda hafif farklı olabilir.
- Gerçek model servisi geldiğinde:
  1) /api/analyze gateway'ini harici inference servisine bağla (yt-dlp + ffmpeg + model).
  2) Önizleme jitter'ini kaldır, gerçek skorları dön.
- Gateway hedefi: INFERENCE_API_URL veya NEXT_PUBLIC_API_URL /api/analyze
- Limitler: max 30MB, ~6dk ses; Spotify/Apple şimdilik 501/preview.
