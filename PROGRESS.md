# AURIS Proje Progress Notları

Son Güncelleme: 2026-04-14 16:14 (CHECKPOINT — kaldığımız yer)

## ⏸ Resume Point (sonra buradan devam)
1. **ML pipeline task bzn8slu74 hâlâ çalışıyor** (background, 11 worker). features.csv = 175 satır / 5197. Rate ~10/dk → tahmini ~8 saat. Makine açık kalırsa kendi başına ilerler. Kill gerekirse: `taskkill //F //IM python.exe` ama önce PIDleri kontrol et.
2. **Monitor task bdlehxenv** 3 dk aralıklı event üretiyor (session kapanırsa yeniden başlatılabilir).
3. **CI durumu**:
   - [x] backend/requirements.txt'e pytest + pytest-asyncio eklendi
   - [x] platform/ içinde `npm audit fix` çalıştırıldı — 16 → 8 vuln (4 low, 4 high)
   - [ ] Kalan 4 HIGH hepsi Next.js — `npm audit fix --force` gerekli ama Next 16 breaking change. Kullanıcı kararı bekliyor.
   - [ ] smoke.test.tsx:99 `getByText('CrownCode')` multiple element bulduğu için fail ediyor. Node 24 Canary continue-on-error=true olduğu için blocker değil ama düzeltilebilir (getAllByText veya getByRole('heading')).
4. **Commit edilmesi gereken değişiklikler**: backend/requirements.txt, platform/package-lock.json (npm audit fix sonrası).

## Seçilen Yaklaşım

## Seçilen Yaklaşım
**A: Tam Dataset (5,197 örnek)** — 11 worker paralel feature extraction ile ~1.5-2 saat.
Akademik rapor için en iyi sonuç.

## Durum

### Tamamlanan
- [x] Echoes dataseti indirildi (6.2 GB, MIT lisans, +1128 AI örneği)
- [x] Manifest yenilendi: 5,197 örnek (2,082 AI + 3,115 Human)
- [x] `extract_features_batch.py` multiprocessing ile paralelleştirildi
- [x] Android app kod review: entity/usecase/model tutarlı
- [x] build.gradle.kts: HF_API_BASE_URL, kotlinx-serialization plugin aktif
- [x] Önceki takılı Python süreçleri temizlendi

### Çalışıyor
- [ ] ML pipeline (task_id: bzn8slu74)
  - 11 worker × ~5 sample/dk = ~55 sample/dk beklenen
  - Feature extraction → Heuristic baseline → 7 model train → 8 figure

### Kalan
- [ ] Ekstra akademik görseller ekle:
  - Dataset istatistikleri (tür/kaynak dağılımı)
  - t-SNE/UMAP feature embedding
  - Calibration plot
  - Per-source breakdown
- [ ] Android app Gradle build test (gerektirir Android SDK)
- [ ] Daha fazla AI örneği (opsiyonel, AIME/SleepyJesse)

## Dataset Kaynakları (Mevcut)
| Kaynak | AI | Human | Not |
|--------|-----|-------|-----|
| GTZAN | 0 | 899 | Tür klasörleri |
| Curated | 0 | 118 | Pop |
| Mixed (AIME) | 704 | 1856 | AIME + FMA + SleepyJesse |
| Vocal Deepfake | 250 | 242 | Vokal odaklı |
| Echoes | 1128 | 0 | Pop/Rock/Elektronik |
| **TOPLAM** | **2,082** | **3,115** | **5,197** |

## Feature Extraction
49 özellik:
- 18 Spektral (MFCC, spectral centroid/flatness/rolloff, mel)
- 9 Temporal (tempo, ZCR, onset, RMS)
- 5 Harmonik (chroma, tonnetz)
- 3 Heuristic composite
- 14 Vokal (pitch stability, vibrato, formant, breath, vocal texture)

## Modeller (7)
1. Logistic Regression
2. Random Forest
3. Gradient Boosting
4. SVM (RBF)
5. MLP Neural Network
6. XGBoost
7. LightGBM
+ 2 Heuristic baseline (no vocals, with vocals)

## Görseller Üretilecek (visualize_results.py) — 13 Figure + Tablo + Rapor
1. fig1: ROC Curves (overlay tüm modeller)
2. fig2: Precision-Recall Curves
3. fig3: Confusion Matrices
4. fig4: Model Comparison Bar Chart
5. fig5: Feature Importance (Top 20)
6. fig6: Correlation Heatmap
7. fig7: Feature Distributions (violin, AI vs Human)
8. table1: LaTeX + Markdown comparison tablosu
9. **fig9: Dataset Statistics** (class dist + source dist + duration histogram)
10. **fig10: Per-Source Class Balance** (AI vs Human her kaynak için)
11. **fig11: Feature Space Embedding** (PCA + t-SNE)
12. **fig12: Calibration Curves** (reliability diagram)
13. **fig13: Prediction Score Distribution** (best model)
14. **REPORT_SUMMARY.md** (dataset + results kapsamlı özet)

## Notlar
- PYTHONUNBUFFERED=1 ile stdout anlık akıyor
- features.csv her 25 örnekte flush ediliyor
- Bozuk ses dosyaları extract_sample_features'ta exception yakalayıp None dönüyor
- Echoes cache: D:/CrownCode/DataSet/_hf_cache/echoes/ (silebilir, 6GB)

## Günlük
- 16:06 - features.csv 50 satır, 13 Python process aktif. Rate düşük görünüyor (~8/dk), belki sustained daha hızlanır
- 16:03 - Pipeline feat=26, monitor (bdlehxenv) 3 dk aralıklı rapor veriyor
- 16:00 - Multiprocessing eklendi, 11 worker ile pipeline restart
- 15:52 - Echoes tamamlandı, manifest yenilendi
- 15:50 - Echoes script (bgl40jqcw) failed ama 1128 örnek işlendi
- 15:37 - Echoes download script başladı
- 15:15 - İlk pipeline run: features.csv 308 satıra ulaştı sonra takıldı
