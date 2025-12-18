# AI Music Detection Preview Mode

- Model henüz entegre edilmediðinden önizleme sonuçlarý rastgele tohum + jitter ile çalýþýyor; güven ve feature skorlarý her çaðrýda hafif farklý olabilir.
- Gerçek model servisi geldiðinde:
  1) /api/analyze gateway'ini harici inference servisine baðla (yt-dlp + ffmpeg + model).
  2) Önizleme jitter'ini kaldýr, gerçek skorlarý dön.
- Gateway hedefi: INFERENCE_API_URL veya NEXT_PUBLIC_API_URL /api/analyze
- Limitler: max 30MB, ~6dk ses; Spotify/Apple þimdilik 501/preview.
