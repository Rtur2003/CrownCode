# AURIS: AI Music Detection Platform

## Project Overview

**Project Title:** AURIS - Artificial Intelligence Music Detection System with Web and Mobile Platforms
**Developer:** Hasan Arthur Altuntas
**Institution:** Duzce University - Computer Engineering Department
**Academic Year:** 2025-2026
**Supervisor:** [Faculty Advisor Name]
**Platform URL:** <https://hasanarthuraltuntas.xyz>

---

## Research Objectives

### Primary Research Question

*"Can a multi-tower ensemble system combining self-supervised audio representations (wav2vec2), handcrafted acoustic features with vocal analysis, CLAP embeddings, and spectral fakeprint detection effectively distinguish AI-generated music from human-composed music across diverse genres and AI generation models?"*

### Specific Goals

1. **High Accuracy Detection**: Achieve >95% accuracy (ROC-AUC >0.98) in AI music detection
2. **Comprehensive Feature Engineering**: Extract 49 acoustic + vocal features for robust classification
3. **Multi-Model Comparison**: Evaluate 7 classifier families to identify optimal approach
4. **Real-time Processing**: Complete analysis in <2 seconds for production deployment
5. **Multi-Platform Access**: Web platform + Native Android application
6. **Automated Pipeline**: Zero-manual-labeling dataset collection from known AI/human sources
7. **Publication-Quality Evaluation**: Generate ROC, PR curves, confusion matrices, and LaTeX tables

---

## Technical Innovation

### Novel Contributions

#### 1. 4-Tower Ensemble Architecture

Unlike existing single-model approaches, AURIS combines four independent signal towers:

- **Tower 1 (wav2vec2):** Self-supervised audio representations from facebook/wav2vec2-base
- **Tower 2 (Librosa + Vocal):** 49 handcrafted features including 14 dedicated vocal analysis metrics
- **Tower 3 (CLAP):** Contrastive Language-Audio Pretraining embeddings (512-dim, HTSAT-base)
- **Tower 4 (FST):** Fusion Segment Transformer via MERT-AudioCAT external API

A meta-classifier fuses all tower outputs for the final decision.

#### 2. Vocal Analysis for AI Music Detection

Novel application of vocal-specific features for AI music detection:

- Pitch stability analysis (AI voices are unnaturally steady)
- Vibrato regularity detection (AI vibrato is mechanically periodic)
- Breath pattern scoring (AI-generated vocals lack natural breathing)
- Formant consistency measurement (AI formant transitions are rigid)
- 14 dedicated vocal features extracted per sample

#### 3. 49-Feature Acoustic Fingerprint

Comprehensive feature set spanning 4 domains:

- 18 spectral features (centroid, flatness, bandwidth, rolloff, contrast, MFCC + deltas, mel flatness)
- 9 temporal/rhythm features (tempo, beat stability, onset strength, dynamic range, ZCR)
- 8 harmonic/tonal features (chroma entropy, tonnetz, harmonic ratio, transition rate)
- 14 vocal features (pitch, vibrato, formant, breath, texture analysis)

#### 4. Multi-Model Benchmarking Pipeline

7 classifier families compared via 5-fold stratified cross-validation:

Logistic Regression, Random Forest, Gradient Boosting, SVM (RBF), MLP Neural Network, XGBoost, LightGBM

#### 5. Source-Based Automatic Labeling

Zero manual labeling by leveraging source provenance:

- AI: Suno v3/v3.5/v4/v5, Udio, MusicGen, Stable Audio, Riffusion, AudioLDM2, Mustango, JEN-1 (12 models)
- Human: GTZAN, Free Music Archive (FMA), curated artist collections

#### 6. Multi-Platform Architecture

- **Web Platform:** Next.js 14 with TypeScript, i18n (EN/TR), Framer Motion
- **Mobile Application:** Native Android with Kotlin and Jetpack Compose
- **Backend API:** FastAPI with PyTorch for ML inference (HuggingFace Spaces)

---

## Platform Architecture

### Web Platform (`platform/`)

| Technology | Version | Purpose |
| --- | --- | --- |
| Next.js | 14 | React Framework (Pages Router) |
| TypeScript | Strict Mode | Type Safety |
| Framer Motion | Latest | Animations |
| CSS Modules | - | Scoped Styling |
| i18n | Custom LanguageContext | EN/TR localization |

### Mobile Application (`Android-App-CrownCode/`)

| Technology | Version | Purpose |
| --- | --- | --- |
| Kotlin | Latest | Programming Language |
| Jetpack Compose | Material 3 | Modern UI Toolkit |
| Hilt | Latest | Dependency Injection |
| Coroutines + Flow | Latest | Async Operations |
| Retrofit + OkHttp | Latest | Network Layer |
| Clean Architecture | MVVM | Design Pattern |

### Backend API Proxy (`hf-crowncode-backend/`)

| Technology | Version | Purpose |
| --- | --- | --- |
| FastAPI | Latest | API Framework |
| Python | 3.11+ | Runtime |
| httpx | Latest | Async HTTP client (proxy to ML API) |
| yt-dlp | Latest | YouTube audio extraction |
| pydantic | Latest | Data validation |
| uvicorn | Latest | ASGI server |

### ML Training Pipeline (`DataSet/`)

| Technology | Version | Purpose |
| --- | --- | --- |
| PyTorch | CPU | ML Inference |
| librosa | 0.10+ | Audio Feature Extraction |
| scikit-learn | Latest | Classical ML Models |
| XGBoost + LightGBM | Latest | Gradient Boosting |
| Hugging Face Transformers | 4.44.2 | wav2vec2, CLAP |
| matplotlib + seaborn | Latest | Publication Figures |

---

## Methodology

### 4-Tower Ensemble Architecture

```text
Audio Input (File / YouTube URL)
    |
    v
  Preprocessing: 16kHz resample, mono, max 120s
    |
    +----> Tower 1: wav2vec2-base (768-dim embeddings)
    |
    +----> Tower 2: Feature Extractor (49 features)
    |          |-- 18 spectral (centroid, flatness, bandwidth, rolloff,
    |          |                contrast, MFCC var/delta/delta2, mel)
    |          |-- 9 temporal (tempo, stability, CV, ZCR, onset, beats)
    |          |-- 8 harmonic (chroma, tonnetz, harmonic ratio)
    |          |-- 14 vocal (pitch, vibrato, formant, breath, texture)
    |
    +----> Tower 3: CLAP (512-dim contrastive embeddings)
    |
    +----> Tower 4: FST (MERT-AudioCAT + Fusion Segment Transformer)
    |
    v
  Meta-Classifier: Best of 7 models (selected via 5-fold CV)
    |
    v
  Output: {is_ai_generated, confidence, decision_source, indicators}
```

### Feature Engineering Pipeline

**Phase 1: Audio Preprocessing**

- Resampling to 22050 Hz (librosa standard) or 16kHz (wav2vec2)
- Mono conversion, duration limiting (120s max)
- Silence and corruption detection (>1s min, >1e-6 amplitude)

**Phase 2: Spectral Feature Extraction**

- Spectral centroid, bandwidth, rolloff, flatness, contrast (mean + std)
- MFCCs (13 bands): variance, first derivative variance, second derivative variance
- Mel spectrogram temporal flatness

**Phase 3: Temporal/Rhythm Feature Extraction**

- Beat tracking: tempo BPM, inter-beat interval stability, coefficient of variation
- Onset detection: strength mean/std
- Energy dynamics: RMS mean/std, dynamic range
- Texture: zero-crossing rate mean/std

**Phase 4: Harmonic/Tonal Feature Extraction**

- Harmonic-percussive source separation (HPSS)
- Chroma features: entropy, temporal std, transition rate
- Tonnetz: tonal centroid variability
- Harmonic ratio: harmonic vs percussive energy

**Phase 5: Vocal Analysis**

- Vocal detection (presence + confidence)
- Pitch analysis: mean Hz, std cents, stability score
- Vibrato: rate Hz, extent cents, regularity score
- Formant consistency, breath pattern, vocal texture scoring
- Vocal-specific AI score (composite indicator)

### Classification Models Evaluated

| # | Model | Type | Key Hyperparameters |
| --- | --- | --- | --- |
| 1 | Logistic Regression | Linear | C=1.0, balanced weights |
| 2 | Random Forest | Ensemble (bagging) | 300 trees, depth=20 |
| 3 | Gradient Boosting | Ensemble (boosting) | 200 trees, lr=0.1 |
| 4 | SVM (RBF) | Kernel method | C=10, gamma=scale |
| 5 | MLP Neural Network | Deep learning | 128-64-32, relu, adam |
| 6 | XGBoost | Gradient boosting | 300 trees, lr=0.05 |
| 7 | LightGBM | Leaf-wise boosting | 300 trees, 31 leaves |

### Evaluation Protocol

- 5-fold Stratified Cross-Validation (preserves class balance per fold)
- Primary metric: ROC-AUC (threshold-independent discrimination)
- Secondary metrics: Accuracy, Precision, Recall, F1 Score
- Baseline comparison: Heuristic scoring system (weighted sigmoid scores)
- Feature importance analysis via model-specific methods

---

## Dataset Characteristics

### Data Sources

**AI-Generated Music (Label: 1):**

| Source | Platform/Model | Samples | Format |
| --- | --- | --- | --- |
| SleepyJesse/ai_music_large | Mixed AI | 2,000 | WAV |
| disco-eth/AIME | 12 AI models | 1,000 | WAV |
| zuhri025/suno-audio | Suno | 500 | WAV |
| ai-music4you3/ai-generated-songs3 | Suno | 250 | WAV |
| blanchon/suno-20k-LAION | Suno + CLAP | TBD | WAV |

**Human-Composed Music (Label: 0):**

| Source | Content | Samples | Format |
| --- | --- | --- | --- |
| SleepyJesse/ai_music_large | Mixed human | 2,000 | WAV |
| marsyas/gtzan | 10 genres | 1,000 | WAV |
| benjamin-paine/free-music-archive-small | Free Music Archive | 1,000 | WAV |
| Curated collection | Pop (Adele) | 18 | MP3 |

**Vocal Deepfake Validation Set:**

| Source | Content | Samples |
| --- | --- | --- |
| UniDataPro/real-vs-fake | Real + AI voices | 5,000 |

### Dataset Statistics (Target)

- **Total samples:** ~3,750 downloaded (target: 6,500+ Phase 1, 9,500+ Phase 2) — collection in progress
- **AI generators represented:** 12+ distinct models
- **Human genres covered:** 10+ genres (pop, rock, blues, jazz, classical, metal, hiphop, country, reggae, electronic)
- **Audio format:** WAV/MP3, 16-22kHz, mono
- **Duration:** 10-300 seconds per sample

---

## Research Results

### Model Performance (TBD - Pending Full Training)

| Metric | Target | Industry Benchmark |
| --- | --- | --- |
| **ROC-AUC** | >0.98 | 0.95-0.99 |
| **Accuracy** | >95% | 94-99% |
| **Precision** | >93% | 95-98% |
| **Recall** | >97% | 94-97% |
| **F1 Score** | >95% | 95-98% |
| **Inference Time** | <2s | 2-5s |

### Comparison Baselines

| System | Reported Accuracy | Type |
| --- | --- | --- |
| IRCAM Amplify | 98.59% AI / 98.5% human | Commercial |
| lofcz/ai-music-detector | Spectral fakeprint | Open-source |
| garystafford/wav2vec2-deepfake | wav2vec2 binary | Open-source |
| AURIS (ours) | TBD | Multi-tower ensemble |

### Publication-Quality Outputs (TBD — will be generated after full training)

8 figures planned for automatic generation:

1. ROC Curves (all models overlaid)
2. Precision-Recall Curves (all models overlaid)
3. Confusion Matrices (per-model heatmaps)
4. Model Comparison Bar Chart (5 metrics side-by-side)
5. Feature Importance (top-20 horizontal bars)
6. Feature Correlation Heatmap
7. Feature Distributions (AI vs Human violin plots)
8. LaTeX/Markdown comparison table

---

## Mobile Application Features

### Android App Architecture

```text
com.crowncode/
  di/                     # Dependency Injection (Hilt)
  presentation/
    components/           # SoundWaveAnimation, EqualizerBars, GradientButton
    navigation/           # Routes, CrownCodeNavHost
    screens/
      welcome/            # Welcome Screen
      auth/               # Login and Signup
      aimusic/            # AI Music Detection
    theme/                # Material 3 Theme (Gold/Bronze)
  util/                   # Utilities
```

### Mobile App Key Features

1. **File Upload Analysis**: Select audio files from device storage
2. **URL Analysis**: Paste YouTube links for direct analysis
3. **Real-time Processing**: Visual feedback with animated indicators
4. **Result Display**: Clear AI/Human classification with confidence scores
5. **Offline Support**: Cached results and graceful error handling

---

## Impact and Applications

### Academic Contributions

- **Open Science**: Complete source code and datasets publicly available
- **Reproducible Research**: Automated pipeline from data to figures
- **Novel Methodology**: 4-tower ensemble + vocal analysis for music AI detection
- **Comprehensive Benchmark**: 7 models compared on same data with proper CV
- **Multi-Platform**: First AI music detector with native mobile app

### Industrial Applications

1. **Streaming Platforms**: Content moderation and fair artist compensation
2. **Music Industry**: A&R process verification and copyright protection
3. **Legal System**: Evidence for copyright dispute resolution
4. **Social Media**: YouTube, TikTok, Instagram audio authenticity verification

### Social Impact

- **Artist Protection**: Preserving human creativity recognition
- **Transparency**: Enabling detection of AI-generated content
- **Research Acceleration**: Open-source tools for academic community

---

## Future Research Directions

### Completed

- [x] Web platform with real-time analysis (Next.js 14 + FastAPI)
- [x] Native Android application (Kotlin + Jetpack Compose)
- [x] Backend API proxy on HuggingFace Spaces
- [x] 49-feature extraction pipeline code with vocal analysis
- [x] 7-model comparison pipeline code with 5-fold CV
- [x] Publication-quality visualization pipeline code (8 figures)
- [x] YouTube bot detection handling with cookie support
- [x] Automated dataset download pipeline (download_datasets.py)
- [x] Product catalog system for 6 projects
- [x] SEO with JSON-LD structured data

### In Progress

- [ ] Dataset collection (~3,750/6,500+ samples downloaded)
- [ ] Full training and evaluation on expanded dataset
- [ ] wav2vec2 fine-tuning (Tower 1)
- [ ] CLAP embedding integration (Tower 3)

### Short-term (6-12 months)

- [ ] iOS application development
- [ ] Batch processing for multiple files
- [ ] Real-time streaming analysis
- [ ] Browser extension for in-page detection
- [ ] Social media integration (TikTok, Instagram audio)

### Long-term (1-3 years)

- [ ] Multimodal analysis (audio + lyrics + metadata)
- [ ] Explainable AI with SHAP-based detection reasoning
- [ ] Federated learning for privacy-preserving model updates
- [ ] Edge deployment for offline detection

---

## Academic References

1. "Benchmarking Music Generation Models and Metrics via Human Preference Studies" (2025) - arxiv:2506.19085
2. "Data-Driven Analysis of Text-Conditioned AI-Generated Music: Suno and Udio" (2025) - arxiv:2509.11824
3. "The AI Music Arms Race: On the Detection of AI-Generated Music" (2025) - ISMIR Transactions
4. "WavLM model ensemble for audio deepfake detection" (2024) - arxiv:2408.07414
5. facebook/wav2vec2-base - Self-supervised speech representations (Baevski et al., 2020)
6. CLAP: Learning Audio Concepts from Natural Language Supervision (Wu et al., 2023)
7. MERT: Acoustic Music Understanding Model (Li et al., 2024)

---

## Publications and Citations

### Thesis Citation

```bibtex
@thesis{altuntas2026auris,
  title   = {AURIS: AI Music Detection System with Multi-Tower Ensemble
             Architecture for Web and Mobile Platforms},
  author  = {Hasan Arthur Altuntas},
  institution = {Duzce University},
  department  = {Computer Engineering},
  year    = {2026},
  type    = {Bachelor's Thesis},
  url     = {https://hasanarthuraltuntas.xyz},
  note    = {Senior Year Capstone Project 2025-2026}
}
```

### Related Documentation

- **Technical Report EN**: [ACADEMIC_PROJECT_REPORT_EN.md](./ACADEMIC_PROJECT_REPORT_EN.md)
- **Technical Report TR**: [AKADEMIK_PROJE_RAPORU_TR.md](./AKADEMIK_PROJE_RAPORU_TR.md)
- **AI Model Strategy**: [AI_MODEL_STRATEGY.md](../technical/AI_MODEL_STRATEGY.md)
- **Dataset Plan**: [DATASETS_TO_DOWNLOAD.md](../../DataSet/DATASETS_TO_DOWNLOAD.md)

---

## Acknowledgments

### Technical Resources

- **Facebook AI Research**: wav2vec2 pre-trained models
- **Hugging Face**: Transformers library, datasets, and model hosting
- **LAION**: CLAP audio-language model
- **mippia**: FST (Fusion Segment Transformer) checkpoints
- **Google**: Android development tools and Jetpack libraries

### Academic Support

- **Duzce University**: Computer Engineering Department
- **Research Community**: Open-source datasets and papers
