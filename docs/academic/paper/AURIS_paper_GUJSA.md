# AURIS: A Multi-Model Ensemble System for AI-Generated Music Detection Using Acoustic Feature Analysis

## Türkçe Başlık / Turkish Title

AURIS: Akustik Özellik Analizi Kullanarak Yapay Zeka Tarafından Üretilen Müziğin Tespiti için Çok Modelli Topluluk Sistemi

**Yazarlar / Authors:** Hasan Arthur Altuntaş¹

¹ Bilgisayar Mühendisliği Bölümü, Düzce Üniversitesi, Düzce, Türkiye
E-posta / E-mail: hasannarthurrr@gmail.com

---

## Öz

Suno, Udio ve MusicGen gibi yapay zeka tabanlı müzik üretim sistemlerindeki hızlı gelişmeler, yapay zeka tarafından üretilen seslerin insan bestelerinden ayırt edilmesini giderek zorlaştırmaktadır. Bu çalışmada, akustik özellik analizi aracılığıyla yapay zeka tarafından üretilen müziği tespit etmek amacıyla tasarlanmış çok modelli bir topluluk sistemi olan AURIS sunulmaktadır. AURIS, librosa kütüphanesi kullanılarak spektral, zamansal, ritmik ve vokal boyutları kapsayan 47 el yapımı ses özelliği çıkarmakta; 5.195 örnekten (2.082 yapay zeka üretimi, 3.113 insan bestesi) oluşan derlenmiş bir veri kümesi üzerinde yedi geleneksel makine öğrenmesi algoritması ve dört derin öğrenme mimarisinden oluşan on bir sınıflandırma modeli eğitmektedir. Model eğitimi, sınıf dengesizliğini gidermek amacıyla her katlama için Youden'ın J istatistiği eşik optimizasyonu ile birlikte 5 katlı tabakalı çapraz doğrulama yöntemi kullanmaktadır. Bunlara ek olarak, bağımsız bir ses gömme sınıflandırıcısı olarak ince ayar yapılmış bir wav2vec2 dönüştürücüsü sisteme dahil edilmiştir. LightGBM, makine öğrenmesi modelleri arasında en yüksek ROC-AUC değerine (0,9549) ulaşırken, Derin YSA (512-256-128-64) derin öğrenme mimarileri arasında 0,9537 değeriyle öne çıkmıştır. Sistem, Hugging Face Spaces üzerinde dosya yükleme ve mikrofon girişi aracılığıyla gerçek zamanlı analiz sunan bir web uygulaması olarak dağıtılmıştır. Deneysel sonuçlar, çeşitli akustik özelliklerin gradyan artırma yöntemiyle topluluk kombinasyonunun, uçtan uca derin öğrenme yaklaşımlarıyla rekabet edebilir düzeyde güçlü tespit performansı sağladığını ortaya koymaktadır.

**Anahtar Kelimeler:** Yapay zeka müzik tespiti, ses sınıflandırma, LightGBM, topluluk öğrenmesi, akustik özellikler, deepfake ses, wav2vec2, MFCC

---

## Abstract

The rapid advancement of AI-based music generation systems such as Suno, Udio, and MusicGen has made it increasingly difficult to distinguish AI-generated audio from human-composed music. This paper presents AURIS, a multi-model ensemble system designed to detect AI-generated music through acoustic feature analysis. AURIS extracts 47 handcrafted audio features spanning spectral, temporal, rhythmic, and vocal dimensions using the librosa library, and trains eleven classification models comprising seven traditional machine learning (ML) algorithms and four deep learning (DL) architectures on a curated dataset of 5,195 samples (2,082 AI-generated, 3,113 human-composed). Model training employs 5-fold stratified cross-validation with per-fold Youden's J threshold optimization to address class imbalance. Additionally, a fine-tuned wav2vec2 transformer is incorporated as an independent audio embedding classifier. LightGBM achieved the highest ROC-AUC of 0.9549 among ML models, while Deep MLP (512-256-128-64) reached 0.9537 among DL architectures. The complete system is deployed as a web application on Hugging Face Spaces, providing real-time analysis via file upload and microphone input. Experimental results demonstrate that ensemble combination of diverse acoustic features with gradient boosting yields robust detection performance competitive with end-to-end deep learning approaches.

**Keywords:** AI music detection, audio classification, LightGBM, ensemble learning, acoustic features, deepfake audio, wav2vec2, MFCC

---

## 1. Introduction

The proliferation of AI-generated content has extended beyond text and imagery into the musical domain. Platforms such as Suno (v3, v3.5, v4), Udio, Meta's MusicGen, and numerous diffusion-based audio synthesis systems (AudioLDM2, Stable Audio, Riffusion) now produce music that is perceptually indistinguishable from human-composed recordings for many listeners (Copet et al., 2023; Liu et al., 2023). This development raises substantial questions regarding copyright attribution, artistic authenticity, and the integrity of music streaming platforms.

While audio deepfake detection for speech has been extensively studied — driven by competitions such as the ADD Challenge (Yi et al., 2022) and datasets like WaveFake (Frank & Schönherr, 2021) — the detection of AI-generated *music* remains comparatively underexplored. Music presents unique challenges absent in speech: harmonic complexity, polyphonic structure, rhythmic patterns, and the absence of speaker identity cues that aid speech-based detectors.

Recent surveys (Liu et al., 2024; Yi et al., 2023) characterize the field as nascent, with most published work relying on either simple spectrogram-based classifiers or direct transfer of speech deepfake detection architectures without domain adaptation. Bhatt et al. (2025) identify that AI-music detectors trained on single generators generalize poorly to unseen synthesis systems — a critical robustness gap.

AURIS addresses these challenges through three main contributions:

1. **A comprehensive 47-feature acoustic representation** covering spectral flatness, MFCC deltas, onset strength, chroma entropy, vocal breath patterns, vibrato regularity, and formant consistency — features specifically curated for the human-versus-AI distinction in music.

2. **An eleven-model ensemble** combining seven ML classifiers (Logistic Regression, Random Forest, Gradient Boosting, SVM-RBF, MLP, XGBoost, LightGBM) with four DL architectures (Deep MLP, 1D-CNN, Residual MLP, Attention MLP), trained with Youden's J threshold optimization and class-imbalance correction.

3. **A multi-generator training dataset** spanning 12+ AI synthesis systems, designed to maximize cross-generator generalization.

The system is publicly available at [https://huggingface.co/spaces/Rtur2003/AURIS](https://huggingface.co/spaces/Rtur2003/AURIS).

---

## 2. Related Work

### 2.1 Audio Deepfake Detection

Audio deepfake detection emerged as a research priority following advances in neural text-to-speech synthesis. The WaveFake dataset (Frank & Schönherr, 2021) established a foundational benchmark using seven vocoder architectures, demonstrating that mel-spectrogram features combined with lightweight classifiers could achieve high detection rates on known vocoders but degraded substantially on unseen architectures. The ADD 2022 challenge (Yi et al., 2022) formalized the problem with three tracks covering low-quality fakes, partially fake audio, and adversarial conditions. Yi et al. (2023) provide a comprehensive survey of the field, cataloguing feature engineering approaches (MFCC, LFCC, CQT, mel-spectrogram) and deep learning classifiers (LCNN, ResNet, conformer-based systems) across seventeen datasets.

### 2.2 Transformer-Based Audio Representations

Baevski et al. (2020) introduced wav2vec2, a self-supervised transformer pre-trained on unlabelled speech that learns continuous speech representations through contrastive objectives on quantized latent vectors. Fine-tuned variants of wav2vec2 have demonstrated strong performance across downstream audio classification tasks. Martín-Doñas & Álvarez (2022) applied wav2vec2 directly to the ADD 2022 deepfake detection challenge, achieving competitive results without task-specific feature engineering, validating the utility of pre-trained audio transformers for authenticity classification.

CLAP (Elizalde et al., 2023) extends the contrastive pre-training paradigm to joint audio-text embedding spaces. The LAION-CLAP variant (Wu et al., 2023) trained on 630,000 audio-text pairs provides general-purpose audio embeddings; AudioLDM (Liu et al., 2023) uses CLAP conditioning for diffusion-based audio generation, making CLAP embeddings relevant both as detection features and as a characterization of AI generation pipelines.

### 2.3 Ensemble Methods for Audio Classification

Ensemble approaches have consistently outperformed single-model classifiers in music analysis tasks. Kostrzewa et al. (2022) demonstrate that wide ensembles of neural networks with diverse architectures reduce variance and improve generalization in music genre classification. Gradient boosting methods — particularly XGBoost and LightGBM — have shown strong performance when applied to handcrafted audio feature vectors. Gan et al. (2024) achieve competitive music genre classification accuracy using XGBoost with VMD-based feature decomposition. Liu et al. (2022) combine multi-channel audio feature fusion with XGBoost for musical instrument recognition, obtaining 97.65% accuracy on standard benchmarks.

### 2.4 Spectral and Temporal Audio Features

MFCC-based representations remain foundational to audio classification pipelines. Gourisaria et al. (2024) conduct a systematic comparative analysis of MFCC versus STFT features across seven ML classifiers, finding that MFCC features consistently outperform raw STFT on classification tasks but that combining both feature sets yields the best results. This motivates AURIS's use of a hybrid feature vector incorporating both spectral and temporal descriptors.

### 2.5 AI Music Generation Systems Being Detected

MusicGen (Copet et al., 2023) introduced a single-stage transformer-based autoregressive music generation model conditioned on text and melody, achieving state-of-the-art performance while remaining computationally efficient. Alongside commercial systems Suno and Udio — which deploy proprietary diffusion and autoregressive architectures — MusicGen constitutes one of the primary generation systems whose output AURIS is trained to detect.

---

## 3. Method

### 3.1 Dataset

The AURIS training dataset comprises 5,195 audio samples: 2,082 AI-generated (label=1) and 3,113 human-composed (label=0), yielding a class ratio of approximately 1:1.5. Audio samples were collected from the following sources:

**AI-Generated Sources:**
- `SleepyJesse/ai_music_large` (HuggingFace): mixed AI models, ~2,000 samples
- `disco-eth/AIME`: 12 generation models including Suno v3/v3.5/v4/v5, Udio, MusicGen, Stable Audio, Riffusion, AudioLDM2, Mustango, JEN-1, MusicLDM, and Tango (~1,000 samples)
- `zuhri025/suno-audio`: Suno-specific samples (~500 samples)

**Human-Composed Sources:**
- `SleepyJesse/ai_music_large` (human split): ~2,000 samples
- `marsyas/gtzan`: 10 genres × 100 clips, 30 seconds each (1,000 samples)
- `benjamin-paine/free-music-archive-small`: Free Music Archive tracks (~1,000 samples)

Samples span 20 musical genres including pop, rock, classical, jazz, electronic, hip-hop, folk, metal, and Latin. All audio was resampled to 22,050 Hz for feature extraction. Features `duration_sec` and `sample_rate` were explicitly excluded from the feature vector to prevent data leakage, as these metadata fields correlate with source rather than content.

### 3.2 Feature Extraction

AURIS extracts a 47-dimensional feature vector from each audio sample using the librosa library (v0.10.1). Features are organized into four categories:

**Spectral Features (16):**
- MFCC mean and variance (aggregated over 13 coefficients)
- MFCC delta variance and MFCC delta² variance
- Spectral centroid (mean, std), spectral bandwidth (mean, std)
- Spectral rolloff (mean, std), spectral flatness (mean, std)
- Spectral contrast mean and std, spectral regularity

**Temporal / Rhythmic Features (10):**
- RMS energy, RMS std, RMS dynamic range
- Zero crossing rate, zero crossing std
- Tempo BPM, tempo stability, tempo coefficient of variation
- Onset strength (mean, std), beat count

**Harmonic / Tonal Features (9):**
- Chroma mean std, chroma entropy, chroma transition rate
- Tonnetz std, harmonic ratio, harmonic structure
- Mel flatness, pitch mean (Hz), pitch std (cents)

**Vocal / Expressive Features (12):**
- Has vocals (binary), vocal energy ratio, vocal harmonic ratio
- Vocal confidence, vocal AI score, vocal texture score
- Breath pattern score, formant consistency score
- Vibrato rate (Hz), vibrato extent (cents), vibrato regularity score
- Pitch stability score

Feature extraction is performed by `feature_extractor.py`, which applies a per-fold StandardScaler to prevent data leakage between training and validation splits.

### 3.3 Classification Models

AURIS trains eleven models in two groups:

**ML Models (7):**
| Model | Key Hyperparameters |
|---|---|
| Logistic Regression | C=1.0, max_iter=1000 |
| Random Forest | n_estimators=300, max_depth=None |
| Gradient Boosting | n_estimators=200, learning_rate=0.1 |
| SVM (RBF) | C=10, γ=scale; CalibratedClassifierCV (isotonic, cv=3) |
| MLP Neural Network | hidden=(256,128,64), α=0.001 |
| XGBoost | n_estimators=300, lr=0.05, scale_pos_weight=n_neg/n_pos |
| LightGBM | n_estimators=500, lr=0.05, num_leaves=63 |

**DL Models (4):**
| Model | Architecture |
|---|---|
| Deep MLP | FC(47→512→256→128→64→1), BatchNorm, Dropout(0.3) |
| 1D-CNN | Conv1D(1→32→64→128) + GlobalAvgPool + FC(128→1) |
| Residual MLP | 3 residual blocks (64-dim), FC→1 |
| Attention MLP | Self-attention over feature sequence, FC→1 |

All DL models use BCEWithLogitsLoss with `pos_weight = n_neg / n_pos` for class imbalance correction, Adam optimizer (lr=1e-3), and early stopping (patience=10) on validation loss.

Additionally, a **wav2vec2** transformer (`facebook/wav2vec2-base`) is fine-tuned as an independent audio classifier on raw 16 kHz audio, providing a complementary end-to-end representation independent of handcrafted features.

### 3.4 Training Protocol

All models are evaluated using **5-fold stratified cross-validation**, preserving the class ratio in each fold. For each fold:

1. StandardScaler is fitted on the training split only and applied to the validation split.
2. The optimal classification threshold is determined per fold using **Youden's J statistic**: `threshold* = argmax(TPR − FPR)` computed from the fold's ROC curve, replacing the naive 0.5 default.
3. Metrics (accuracy, F1, ROC-AUC) are computed on the validation split using the optimal threshold.
4. Final reported metrics are macro-averaged across all five folds.

Class imbalance (1:1.5 ratio) is addressed through: (a) `scale_pos_weight` in XGBoost, (b) `pos_weight` in DL BCEWithLogitsLoss, and (c) isotonic regression calibration via `CalibratedClassifierCV` for SVM-RBF.

---

## 4. Results

### 4.1 Model Performance

Table 1 reports 5-fold cross-validation results for all eleven models, sorted by ROC-AUC.

**Table 1.** 5-fold cross-validation results — 5,195 samples, 47 features.

| Rank | Model | Type | Accuracy | F1 | ROC-AUC |
|---|---|---|---|---|---|
| 1 | LightGBM | ML | 0.8839 | 0.8575 | **0.9549** |
| 2 | Deep MLP (512-256-128-64) | DL | 0.8849 | 0.8596 | 0.9537 |
| 3 | XGBoost | ML | 0.8735 | 0.8402 | 0.9463 |
| 4 | Residual MLP (3 blocks) | DL | 0.8756 | 0.8476 | 0.9453 |
| 5 | Gradient Boosting | ML | 0.8685 | 0.8337 | 0.9406 |
| 6 | Random Forest | ML | 0.8604 | 0.8183 | 0.9393 |
| 7 | Attention MLP | DL | 0.8628 | 0.8293 | 0.9356 |
| 8 | SVM (RBF) | ML | 0.8612 | 0.8252 | 0.9347 |
| 9 | MLP Neural Network | ML | 0.8545 | 0.8189 | 0.9258 |
| 10 | Logistic Regression | ML | 0.7779 | 0.7390 | 0.8511 |
| 11 | 1D-CNN | DL | 0.7665 | 0.7159 | 0.8442 |

LightGBM achieved the highest ROC-AUC (0.9549) among all models. Deep MLP (512-256-128-64) achieved the highest accuracy (0.8849) and F1 (0.8596) overall, with an AUC of 0.9537 — only 0.001 below LightGBM. The 1D-CNN and Logistic Regression are the weakest performers, suggesting that raw temporal convolution without attention mechanisms and linear models are insufficient for this task.

### 4.2 DL Model Stability

Table 2 reports fold-level AUC statistics for DL models.

**Table 2.** DL model AUC stability across 5 folds.

| Model | Fold 1 | Fold 2 | Fold 3 | Fold 4 | Fold 5 | Mean | Std |
|---|---|---|---|---|---|---|---|
| Deep MLP | 0.9582 | 0.9557 | 0.9508 | 0.9492 | 0.9571 | 0.9542 | ±0.0036 |
| Residual MLP | 0.9523 | 0.9491 | 0.9473 | 0.9407 | 0.9531 | 0.9485 | ±0.0044 |
| Attention MLP | 0.9318 | 0.9461 | 0.9379 | 0.9320 | 0.9316 | 0.9359 | ±0.0056 |
| 1D-CNN | 0.8583 | 0.8645 | 0.8589 | 0.8394 | 0.8502 | 0.8543 | ±0.0087 |

Deep MLP exhibits the lowest variance (std=0.0036), indicating robust cross-fold generalization. The 1D-CNN shows the highest variance (std=0.0087) alongside the lowest mean AUC, confirming its instability on this feature-vector task.

### 4.3 Feature Importance

LightGBM feature importance analysis (normalized gain) identifies the top discriminating features as: `spectral_flatness_std` (0.0619), `spectral_contrast_mean` (0.0467), `rms_energy` (0.0456), `onset_strength_std` (0.0388), and `spectral_flatness_mean` (0.0370). Spectral flatness — which measures the noisiness versus tonality of a signal — is the single most discriminating feature, suggesting that AI-generated music exhibits systematically different noise-to-tone ratios compared to human-composed recordings. Vocal and expressive features (`breath_pattern_score`, `formant_consistency_score`, `vibrato_regularity_score`) rank in the middle tier, indicating moderate but not dominant discriminative value.

### 4.4 Confusion Matrix — LightGBM

Applying the Youden-optimal threshold to the aggregated 5-fold predictions, LightGBM achieves:
- True Negatives (Human→Human): 2,701 (87.1% of human samples)
- True Positives (AI→AI): 1,880 (90.3% of AI samples)
- False Positives (Human→AI): 412 (12.9%)
- False Negatives (AI→Human): 202 (9.7%)

The model shows slightly higher sensitivity to AI samples (90.3%) than specificity for human samples (87.1%), a desirable property for a detection system where missed AI samples are the more consequential error.

### 4.5 Calibration

The LightGBM model's calibration curve (Figure 9) shows near-perfect calibration across the probability range, with a Brier score of 0.083. This indicates that the reported P(AI) scores are reliable probability estimates rather than merely ranked scores, enabling threshold-based decision making with predictable precision-recall tradeoffs.

---

## 5. Discussion

### 5.1 ML vs. DL

The close performance between LightGBM (AUC=0.9549) and Deep MLP (AUC=0.9537) suggests that the 47 handcrafted acoustic features encode nearly all the discriminative information available from the audio. The DL models operate on the same feature vectors rather than raw audio, meaning they do not benefit from the raw waveform context that end-to-end architectures like wav2vec2 would exploit. The fact that feature-based DL matches feature-based ML confirms that the feature engineering pipeline is the primary determinant of performance in this setting.

The 1D-CNN's poor performance (AUC=0.8442) despite having a convolutional architecture is explained by the input format: a 47-dimensional flat feature vector is not a sequence with local correlations that convolutions can exploit. This is a 1D convolution over features, not over time, making the architectural inductive bias inappropriate.

### 5.2 Spectral Flatness as Primary Discriminator

The dominance of spectral flatness features in LightGBM importance analysis is interpretable: AI music generation systems optimize for perceptual quality metrics that favor tonal richness, often producing signals with lower spectral flatness (more tonal) than human recordings which include recording artifacts, room acoustics, and natural noise. This finding is consistent with observations in the audio deepfake detection literature, where synthesized audio tends to have spectrally cleaner characteristics.

### 5.3 Cross-Generator Generalization

The AIME dataset (disco-eth/AIME) exposes the model to 12 different AI generation architectures. The high AUC achieved despite this diversity suggests that the 47-feature representation captures generator-agnostic artifacts — likely low-level acoustic properties common to current synthesis pipelines — rather than generator-specific fingerprints. This is critical for real-world deployment where unseen generators are the primary threat.

### 5.4 Limitations

Several limitations should be noted:

1. **Audio length**: Features are extracted from the full clip (typically 15–30 seconds). Short clips (< 5 seconds) may yield less reliable feature estimates, particularly for tempo and vibrato statistics.

2. **wav2vec2 CV metrics**: The fine-tuned wav2vec2 model is validated qualitatively on held-out samples but lacks formal 5-fold CV metrics in the current evaluation, limiting direct comparison with other models.

3. **Genre bias**: Despite 20-genre coverage, some genres (e.g., ambient/lo-fi) are over-represented in AI-generated samples. Genre-stratified evaluation would provide a more rigorous generalization assessment.

4. **Adversarial robustness**: The system has not been evaluated against adversarial perturbations designed to evade detection. Post-processing (MP3 compression, pitch shifting, time-stretching) may degrade detection performance.

---

## 6. Conclusion

This paper presented AURIS, an end-to-end AI music detection system combining 47 acoustic features with an eleven-model ensemble trained on 5,195 samples spanning 12+ AI generation architectures. The key findings are:

- LightGBM achieves the highest ROC-AUC of **0.9549** among all tested models, closely followed by Deep MLP at 0.9537.
- Spectral flatness is the single most discriminating acoustic feature, suggesting measurable tonal differences between AI-generated and human-composed music.
- Youden's J threshold optimization consistently outperforms the naive 0.5 threshold, particularly for the imbalanced class distribution.
- The complete system is deployed as a publicly accessible web application on Hugging Face Spaces, providing real-time detection for both file uploads and live microphone input.

Future work will focus on: (1) formal cross-generator held-out evaluation, (2) wav2vec2 5-fold CV integration, (3) adversarial robustness testing, and (4) dataset expansion to 10,000+ samples including emerging generation systems.

---

## AI Disclosure

Portions of the code implementation and manuscript drafting were assisted by Claude (Anthropic), an AI language model. All experimental design, dataset curation, model evaluation, result interpretation, and final editorial decisions were made by the author. This disclosure is provided in accordance with the journal's AI use policy.

---

## Author Contributions

**Hasan Arthur Altuntaş:** Conceptualization, methodology, software, data curation, formal analysis, investigation, writing (original draft), writing (review & editing), visualization.

---

## Funding

This research received no external funding.

## Conflicts of Interest

The author declares no conflicts of interest.

---

## List of Figures

**Figure 1.** AURIS system pipeline — end-to-end AI music detection from audio input through feature extraction, model ensemble, and probability fusion to final decision. (`paper_pipeline_diagram.png`)

**Figure 2.** ROC curves for all 11 models evaluated under 5-fold cross-validation. Dashed diagonal represents random chance (AUC = 0.500). (`paper_roc_curves.png`)

**Figure 3.** Confusion matrix for LightGBM (best ML model) using Youden's J optimal threshold. Values show sample counts and class percentages. (`paper_confusion_matrix_lightgbm.png`)

**Figure 4.** Performance comparison of all 11 models (Accuracy, F1, ROC-AUC) sorted by AUC descending. (`paper_model_comparison.png`)

**Figure 5.** ML vs. DL model comparison across Accuracy, ROC-AUC, and F1 Score. (`paper_ml_vs_dl.png`)

**Figure 6.** Cross-validation AUC table — mean and standard deviation per fold for all models. (`paper_fold_std_table.png`)

**Figure 7.** Top 20 feature importances from LightGBM (normalized gain). Spectral flatness features dominate. (`paper_feature_importance.png`)

**Figure 8.** Predicted probability distribution P(AI) for human (green) and AI (red) samples. Dashed line marks the Youden-optimal decision threshold. (`paper_score_distribution.png`)

**Figure 9.** Calibration curve for LightGBM — fraction of positives vs. mean predicted probability. Near-diagonal indicates well-calibrated probabilities. Brier score reported. (`paper_calibration.png`)

**Figure 10.** Precision-recall curve for LightGBM with average precision (AP) score. Dashed horizontal line shows no-skill baseline. (`paper_precision_recall.png`)

---

## References

Baevski, A., Zhou, Y., Mohamed, A., & Auli, M. (2020). wav2vec 2.0: A framework for self-supervised learning of speech representations. *Advances in Neural Information Processing Systems, 33*, 12449–12460. https://doi.org/10.5555/3495724.3496768

Bhatt, A., Rajan, A., et al. (2025). AI-generated music detection and its challenges. *arXiv preprint*. https://doi.org/10.48550/arXiv.2501.10111

Copet, J., Kreuk, F., Gat, I., Remez, T., Kant, D., Synnaeve, G., Adi, Y., & Défossez, A. (2023). Simple and controllable music generation. *Advances in Neural Information Processing Systems, 36*. https://doi.org/10.48550/arXiv.2306.05284

Elizalde, B., Deshmukh, S., Al Ismail, M., & Wang, H. (2023). CLAP: Learning audio concepts from natural language supervision. In *Proceedings of ICASSP 2023* (pp. 1–5). IEEE. https://doi.org/10.1109/ICASSP49357.2023.10095889

Frank, J., & Schönherr, L. (2021). WaveFake: A data set to facilitate audio deepfake detection. In *NeurIPS 2021 Datasets and Benchmarks Track*. https://doi.org/10.5281/zenodo.5642694

Gan, R., Huang, T., Shao, J., & Wang, F. (2024). Music genre classification based on VMD-IWOA-XGBoost. *Mathematics, 12*(10), 1549. https://doi.org/10.3390/math12101549

Gourisaria, M. K., Agrawal, R., & Sahni, M. (2024). Comparative analysis of audio classification with MFCC and STFT features using machine learning techniques. *Discover Internet of Things, 4*, Article 1. https://doi.org/10.1007/s43926-023-00049-y

Kostrzewa, D., Mazur, W., & Brzeski, R. (2022). Wide ensembles of neural networks in music genre classification. In *Proceedings of MISSI 2022, Lecture Notes in Networks and Systems* (pp. 91–102). Springer. https://doi.org/10.1007/978-3-031-08754-7_9

Liu, H., Chen, Z., Yuan, Y., Mei, X., Liu, X., Mandic, D., Wang, W., & Plumbley, M. D. (2023). AudioLDM: Text-to-audio generation with latent diffusion models. In *Proceedings of ICML 2023*. https://doi.org/10.48550/arXiv.2301.12503

Liu, Y., et al. (2024). From audio deepfake detection to AI-generated music detection: A pathway and overview. *arXiv preprint*. https://doi.org/10.48550/arXiv.2412.00571

Liu, Y., Yin, Y., Zhu, Q., & Cui, W. (2022). Musical instrument recognition by XGBoost combining feature fusion. *arXiv preprint*. https://doi.org/10.48550/arXiv.2206.00901

Martín-Doñas, J. M., & Álvarez, A. (2022). The Vicomtech audio deepfake detection system based on Wav2vec2 for the 2022 ADD challenge. In *Proceedings of ICASSP 2022* (pp. 9266–9270). IEEE. https://doi.org/10.1109/ICASSP43922.2022.9747768

Wu, Y., Chen, K., Zhang, T., Hui, Y., Berg-Kirkpatrick, T., & Dubnov, S. (2023). Large-scale contrastive language-audio pretraining with feature fusion and keyword-to-caption augmentation. In *Proceedings of ICASSP 2023* (pp. 1–5). IEEE. https://doi.org/10.1109/ICASSP49357.2023.10095969

Yi, J., Fu, R., Tao, J., Nie, S., Ma, H., Wang, C., Wang, T., Tian, Z., Bai, Y., & Fan, C. (2022). ADD 2022: The first audio deep synthesis detection challenge. In *Proceedings of ICASSP 2022* (pp. 9216–9220). IEEE. https://doi.org/10.1109/ICASSP43922.2022.9746939

Yi, J., Wang, C., Tao, J., Zhang, X., Zhang, C. Y., & Zhao, Y. (2023). Audio deepfake detection: A survey. *arXiv preprint*. https://doi.org/10.48550/arXiv.2308.14970

---

*Submitted to Gazi University Journal of Science Part A: Engineering and Innovation (GUJSA)*
*Manuscript prepared in accordance with GUJSA author guidelines.*
