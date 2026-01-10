# Model Placeholders

Bu klasör sadece yer tutucu dosyalar içerir; gerçek model ağırlıkları burada yoktur. Netlify üzerinde model barındırmıyoruz, gerçek inference harici `INFERENCE_API_URL` ile sağlanacak.

Beklenen gerçek dosyalar (eğitim sonrası):
- `auth_classifier.joblib`: AI/insan sınıflandırıcı (sklearn)
- `scaler.joblib`: Özellik ölçekleyici
- `metadata.json`: Model sürümü, veri özeti, lisans, eğitim tarihi
- `thresholds.json`: Karar eşikleri
- `signature.json`: Girdi/çıktı şeması (`AnalysisResult`)
- Derin model varsa: `checkpoint.pt` veya `model.safetensors`, `config.json`, `label_map.json`

Mevcut dosyalar sahte içeriktir ve yalnızca dosya yapısını gösterir.
