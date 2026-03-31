# AURIS - AI Muzik Tespit Sistemi: Model ve Veri Stratejisi

> Son guncelleme: 2026-03-31
> Durum: Feature extraction + multi-model pipeline tamamlandi, dataset genisletme devam ediyor

---

## 1. Sistem Mimarisi: 4-Tower + Meta-Classifier

AURIS, tek bir modele bagimli kalmak yerine 4 bagimsiz sinyal kaynagini
birlestiren bir ensemble yaklasimi kullanir:

```
Audio Input
    |
    +---> Tower 1: wav2vec2-base (self-supervised audio embeddings)
    |         facebook/wav2vec2-base, 363 MB
    |
    +---> Tower 2: Librosa Feature Extraction + Vocal Analysis
    |         49 handcrafted feature (spektral, temporal, harmonik, vokal)
    |
    +---> Tower 3: CLAP Embeddings
    |         laion-clap, HTSAT-base, 512-dim embeddings
    |
    +---> Tower 4: FST External API (Fusion Segment Transformer)
    |         Stage-1 MERT-AudioCAT (1.2 GB) + Stage-2 FST (46 MB)
    |
    v
  Meta-Classifier (en iyi model secilir: RF, XGBoost, LightGBM, SVM, MLP...)
    |
    v
  Final Prediction: AI-Generated vs Human-Composed
```

---

## 2. Feature Extraction Pipeline (Tower 2) - 49 Ozellik

### 2.1 Spektral Ozellikler (18 adet)

| Ozellik | Aciklama |
| --- | --- |
| rms_energy | Root Mean Square enerji (ortalama genligi) |
| rms_std | RMS standart sapmasi (dinamik degisim) |
| spectral_centroid_mean | Spektral agirlik merkezi (parlaklik) |
| spectral_centroid_std | Centroid degiskenligi |
| spectral_flatness_mean | Spektral duzluk (gomultu vs tonal) |
| spectral_flatness_std | Flatness degiskenligi |
| spectral_bandwidth_mean | Spektral bant genisligi |
| spectral_bandwidth_std | Bandwidth degiskenligi |
| spectral_rolloff_mean | %85 enerji altindaki frekans siniri |
| spectral_rolloff_std | Rolloff degiskenligi |
| spectral_contrast_mean | Vadi-tepe frekans kontarsti |
| spectral_contrast_std | Contrast degiskenligi |
| mfcc_variance | MFCC bantlari arasi ortalama varyans (tini parmak izi) |
| mfcc_delta_var | MFCC birinci turev varyansi (tini degisim hizi) |
| mfcc_delta2_var | MFCC ikinci turev varyansi (tini ivmelenmesi) |
| mel_flatness | Mel spektrogram temporal varyansi |
| spectral_regularity | Kompozit skor: AI-benzeri spektral duzenlilk (0-1) |
| harmonic_structure | Kompozit skor: AI-benzeri harmonik yapilanma (0-1) |

### 2.2 Temporal / Ritim Ozellikleri (9 adet)

| Ozellik | Aciklama |
| --- | --- |
| tempo_bpm | Tahmin edilen tempo (BPM) |
| tempo_stability | Inter-beat interval standart sapmasi |
| tempo_cv | Tempo degiskenlik katsayisi (std/mean) |
| zero_crossing_rate | Sifir gecis orani (doku gostergesi) |
| zero_crossing_std | ZCR degiskenligi |
| onset_strength_mean | Ritimik enerji ortalamasi |
| onset_strength_std | Onset guc degiskenligi |
| rms_dynamic_range | Ses yuksekligi dinamik araligi |
| beat_count | Toplam vurus sayisi |

### 2.3 Harmonik / Tonal Ozellikler (8 adet)

| Ozellik | Aciklama |
| --- | --- |
| chroma_entropy | Perde sinifi dagilim entropisi |
| chroma_std | Temporal chroma degiskenligi |
| chroma_transition_rate | Perde sinifi degisim hizi |
| harmonic_ratio | Harmonik / (harmonik + perkusif) enerji orani |
| tonnetz_std | Tonal centroid degiskenligi (ton iliskileri) |
| temporal_patterns | Kompozit skor: AI-benzeri zamansal duzenlilik (0-1) |

### 2.4 Vokal Analiz Ozellikleri (14 adet)

| Ozellik | Aciklama |
| --- | --- |
| has_vocals | Vokal tespit edildi mi (0/1) |
| vocal_confidence | Vokal tespit guven skoru |
| vocal_ai_score | Vokalin AI-uretilmis olma olasiligi |
| pitch_stability_score | Perde karaliligi (AI sesleri asiri kararli) |
| vibrato_regularity_score | Vibrato duzenliligi (AI vibratosu mekanik) |
| formant_consistency_score | Formant tutarliligi (AI formantlari sabit) |
| breath_pattern_score | Nefes oruntuleri (AI nefes almaz) |
| vocal_texture_score | Vokal doku kalitesi |
| pitch_mean_hz | Ortalama perde frekansi (Hz) |
| pitch_std_cents | Perde standart sapmasi (cent) |
| vibrato_rate_hz | Vibrato hizi (Hz) |
| vibrato_extent_cents | Vibrato genisligi (cent) |
| vocal_harmonic_ratio | Vokal harmonik orani |
| vocal_energy_ratio | Vokal enerji orani |

**Neden vokal ozellikleri kritik?**
AI muzik uretecleri (Suno, Udio) vokal sentezinde karakteristik artefaktlar birakir:
- Asiri kararli perde (insan sesi dogal olarak sallanir)
- Mekanik vibrato (insan vibratosu duzenli degildir)
- Nefes oruntuleri eksikligi (AI nefes almaz)
- Formant gecislerinde donukluk

---

## 3. Multi-Model Karsilastirma Pipeline'i

7 farkli siniflandirici 5-fold stratified cross-validation ile karsilastirilir:

| Model | Avantaj | Parametre Ozeti |
| --- | --- | --- |
| Logistic Regression | Baseline, yorumlanabilir | C=1.0, balanced |
| Random Forest | Robust, feature importance | 300 agac, depth=20 |
| Gradient Boosting | Yuksek dogruluk | 200 agac, lr=0.1 |
| SVM (RBF) | Non-linear sinirlar | C=10, gamma=scale |
| MLP Neural Network | Derin ozellik etkilesimleri | 128-64-32, relu, adam |
| XGBoost | Hiz + dogruluk | 300 agac, lr=0.05 |
| LightGBM | En hizli, leaf-wise | 300 agac, 31 yaprak |

### Ciktlar

Her model icin:
- Accuracy, Precision, Recall, F1, ROC-AUC
- Cross-validation fold sonuclari
- Egitim suresi

En iyi model secilir ve tum veri uzerinde final egitim yapilir.

---

## 4. Dataset Stratejisi

### 4.1 Kaynak Tabanli Otomatik Etiketleme

Manuel etiketleme SIFIR. Verinin kaynagina gore etiket atanir:

**AI Kaynaklari (Label: 1):**
- HuggingFace: SleepyJesse/ai_music_large, disco-eth/AIME, zuhri025/suno-audio
- AI modelleri: Suno v3/v3.5/v4/v5, Udio, MusicGen, Stable Audio, Riffusion,
  AudioLDM2, Mustango, JEN-1, MusicLDM, Tango, Mousai

**Insan Kaynaklari (Label: 0):**
- HuggingFace: marsyas/gtzan, ccmusic-database/music_genre
- Yerel: DataSet/pop/human (Adele koleksiyonu)
- MTG-Jamendo (disco-eth/AIME icinde 500 track)

**Vokal Deepfake (Ek Dogrulama):**
- UniDataPro/real-vs-fake-human-voice-deepfake-audio (5000 ornek)
- Hemg/Deepfake-Audio-Dataset

### 4.2 Hedef Veri Boyutu

| Faz | AI | Insan | Toplam |
| --- | --- | --- | --- |
| Faz 1 (temel) | 3,000 | 3,500 | 6,500 |
| Faz 2 (genisletilmis) | 5,500 | 4,000 | 9,500 |
| Vokal ozel set | 2,500 fake | 2,500 real | 5,000 |

### 4.3 Dizin Yapisi

```
DataSet/
  {genre}/
    ai/        # AI-uretilmis parcalar
    human/     # Insan parcalari
  mixed/
    ai/
    human/
  vocal_deepfake/
    fake/
    real/
  metadata.csv
```

---

## 5. Degerlendirme ve Gorsellestirme

### 5.1 Metrikler
- ROC-AUC (birincil metrik)
- Precision, Recall, F1 Score
- Confusion Matrix
- Classification Report (per-class)
- Feature Importance (top-20)

### 5.2 Publication-Quality Figurler (8 adet)
1. ROC Curves — tum modeller tek grafikte
2. Precision-Recall Curves — tum modeller
3. Confusion Matrices — model basina heatmap
4. Model Comparison Bar Chart — 5 metrik yan yana
5. Feature Importance — yatay cubuk grafik (top-20)
6. Correlation Heatmap — ozellik korelasyon matrisi
7. Feature Distributions — AI vs Human violin plot
8. LaTeX / Markdown tablo — makale icin hazir

### 5.3 Cikti Formatlari
- PNG (300 DPI) — sunum ve web
- PDF — LaTeX makale icin vektorel
- .tex dosyasi — direkt LaTeX tablo kodu

---

## 6. Akademik Referanslar

1. "Benchmarking Music Generation Models and Metrics" (2025) — arxiv:2506.19085
2. "Data-Driven Analysis of AI-Generated Music: Suno & Udio" (2025) — arxiv:2509.11824
3. "The AI Music Arms Race: On Detection of AI-Generated Music" (2025) — ISMIR
4. "WavLM model ensemble for audio deepfake detection" (2024) — arxiv:2408.07414
5. IRCAM Amplify AI Music Detector — %98.59 AI, %98.5 dogal muzik dogrulugu

---

## 7. Hedef Performans Metrikleri

```python
TARGET_METRICS = {
    "accuracy": 0.95,       # %95 dogruluk
    "precision": 0.93,      # Dusuk false positive
    "recall": 0.97,         # Dusuk false negative
    "f1_score": 0.95,       # Dengeli performans
    "roc_auc": 0.98,        # Yuksek ayirt edicilik
    "inference_time": 2.0,  # 2 saniye altinda (web)
    "model_size_mb": 50,    # Production model boyutu
}
```

---

## 8. Dosya Yapisi (Implementasyon)

```
hf-crowncode-backend/
  app/
    services/
      feature_extractor.py      # 49 ozellik cikarimi
      vocal_analyzer.py         # 14 vokal ozelligi
      wav2vec2_detector.py      # Tower 1
      clap_detector.py          # Tower 3
      fst_client.py             # Tower 4
      meta_classifier.py        # Final karar
      score_fusion.py           # Tower skorlarini birlestirme
    training/
      extract_features_batch.py # Toplu ozellik cikarimi
      train_classifier.py       # 7-model egitim pipeline'i
      evaluate.py               # Baseline + model degerlendirme
      visualize_results.py      # 8 publication-quality figur
      run_full_pipeline.py      # Tek komutla tum pipeline
      dataset_loader.py         # HuggingFace veri seti yukleme
      wav2vec2_classifier.py    # Tower 1 fine-tuning
  models/
    wav2vec2-base-cache/        # facebook/wav2vec2-base (363 MB)
    fst/                        # FST checkpoints (1.2 GB + 46 MB)
    auris_classifier_v1.pkl     # Egitilmis meta-classifier
    feature_scaler_v1.pkl       # StandardScaler
    feature_columns_v1.json     # Ozellik sira listesi
    training_results.json       # Tum model sonuclari
  figures/                      # Uretilen figurler (PNG + PDF)
  data/training/
    audio/                      # Egitim audio dosyalari
    manifest.csv                # Dosya yolu + etiket
    features.csv                # 49 ozellik + etiket
```
