# Paper 2 — literature map and gap analysis

Compiled 2026-10-05 from primary sources (arXiv/HF paper mirrors, publisher pages, dataset cards). "Depth" says how much of
each source was actually read; nothing below comes from memory alone. Anything marked **verify** must be checked against the
final PDF/DOI before it enters the manuscript.

## 1. Search protocol (for the Related Work appendix)

- Sources queried: Hugging Face paper index, arXiv HTML, publisher pages (Springer Nature, Nature, TISMIR, ISCA, Cell/Patterns,
  Science Advances, IEEE author centre), dataset cards (HF, Zenodo, GitHub).
- Queries (examples): "AI-generated music detection SONICS FakeMusicCaps", "synthetic song detection unseen generators",
  "handcrafted features vs self-supervised AI music", "shortcut learning silence bandwidth audio deepfake", "layer-wise SSL deepfake",
  "calibration threshold transfer unseen generator", "AI music detection broadcast", "Deezer share of AI uploads".
- Window: 2024-01 to 2026-10-05. Not a PRISMA review; it is a targeted search, and the paper must say so.
- A "we found no prior work that…" sentence is allowed only for items in section 5 and must cite this protocol.

## 2. Prior work and what it leaves open

| # | Work (venue, id) | What it did | What it did not do | Depth |
|---|---|---|---|---|
| 1 | SONICS, Rahman et al., ICLR 2025, arXiv 2408.14080 | 97,164 songs (49,074 fake, 48,090 real), Suno v2/v3/v3.5 + Udio 32/130; unseen algorithms in valid/test; pair-leakage rule on (lyrics, style); SpecTTTra (α-120 s F1 0.97, α-5 s F1 0.78 per the repo table) | Reals come from YouTube (not redistributable); single real domain; no external-corpus test | abstract, dataset tables, repo card |
| 2 | FakeMusicCaps, Comanducci et al., J. Imaging 11(7):242, 2025, arXiv 2409.10684 | 27,605 ten-second clips from 5 open TTMs, 16 kHz mono; detection + attribution, closed/open set | Clip-level only, 16 kHz band-limited; reals are MusicCaps (YouTube-derived) | abstract, dataset section |
| 3 | Afchar, Meseguer-Brocal, Hennequin, ICASSP 2025, arXiv 2501.10111 (earlier: arXiv 2405.04181) | Real vs autoencoder reconstruction (FMA-medium, EnCodec/DAC/Musika/GriffinMel), 99.8 % accuracy; caveats: manipulation robustness, unseen decoders, calibration, interpretability | No cross-corpus real shift; no system comparison | nearly full text |
| 4 | Afchar et al., "A Fourier explanation of AI-music artifacts", ISMIR 2025, arXiv 2506.19108 | Theory: deconvolution gives periodic spectral peaks; simple interpretable detector | Not compared with SSL embeddings under shift | first half |
| 5 | Cros Vila, Sturm, Casini, Dalmazzo, TISMIR 8(1):179–194, 2025 | 30,000 tracks (MSD, Suno, Udio); CLAP + SVM; shows shortcuts: a 44.1 kHz rule gives 83 % precision, resampling to 22.05 kHz fools a commercial detector, reliance on <500 Hz and >10 kHz bands | Own dataset not released; no crossed real/fake design | excerpts |
| 6 | MoM / CLAM, Batra et al., TMLR 2025, arXiv 2512.00621 | 130,435 songs, OOD generators; MERT + wav2vec2 dual stream | Reals are YouTube-derived; no handcrafted baseline | abstract |
| 7 | Echoes, Pascu, Oneata, Cucu, Müller, arXiv 2603.23667 (v2) | 4,468 fakes (12 providers) with 300 FMA references; SONICS/FMC/AIME/Echoes cross-dataset matrix; XLS-R 2B + logistic regression; EER only; leave-one-provider-out; attribution 78.6 % (12 classes) | Each dataset brings its own real corpus, so generator shift and real shift are confounded in the matrix; one representation; no calibration/threshold analysis | abstract + results |
| 8 | CoMoE, Park et al., arXiv 2606.08663 (ICML 2026 ML4Audio workshop) | MoM-open (FMA + MTG-Jamendo reals, 146,309 clips); real-source- and fake-source-restricted splits; token spaces compared; AUC and operating point diverge (CLAM held-out-fake detection 2.6 % under Fake-Udio at AUC 66.5) | One benchmark, fixed classifier; says calibration/fusion and training-pool size are future work | abstract + results |
| 9 | MusicDET, Han, Wang, Gui, ICML 2026, arXiv 2605.18072 | Real-only (zero-shot) normalizing flow; cross-generator EER matrix on FMC and SONICS; SSL front-ends "unstable" | No handcrafted comparison, no real-corpus shift | abstract + excerpts |
| 10 | Li, Sun, Li, Specia, Schuller, Sci. Rep. 2026 (s41598-026-42133-7); M6, arXiv 2412.06001 / Sci. Rep. s41598-026-36044-w | Many model families on FMC, OOD on M6, XAI | No SSL-vs-handcrafted shift decomposition; M6 licence unverified | abstract + excerpts |
| 11 | ArtifactNet, Oh, arXiv 2604.16254; ArtifactBench v2, arXiv 2609.23550 | Lineage-aware frozen protocol, 828 tracks, 20/10/70 split, calibration-only thresholds, lineage bootstrap (2,000), coverage reporting; four public detectors | Single author, vendor-linked, modest cohort; no SSL-embedding baselines; AUROC < 0.30 for SpecTTTra/CLAM shows rank inversion that is not analysed | long excerpts |
| 12 | "Finding the noise: zero-shot AI music detection", arXiv 2607.25530 | Real-quantile thresholds give a controllable FPR without fake data | Detector-specific; no cross-system threshold-policy comparison | excerpts |
| 13 | Sofia / MUSIC8K, arXiv 2606.16612 | Music-intrinsic feature experts (vocal, audio effect, structure) | abstract only | abstract |
| 14 | BAMM (arXiv 2608.07359), AI-OpenBMAT (arXiv 2602.06823, ICASSP 2026) | Broadcast conditions: short excerpts, speech masking, 8 kHz/AAC | Out of our scope; cite as limitation | abstracts |
| 15 | Hand-crafted cues, engrXiv 7433 (independent preprint, not peer reviewed) | Temporal-stationarity feature AUC 0.68, blind to Suno/Udio | Single author, small data; treat as anecdotal | abstract |
| 16 | Speech anti-spoofing methodology: Müller et al. 2021 (silence), Müller et al. 2022 Interspeech, Pascu et al. (arXiv 2309.05384), Kheir et al. (arXiv 2502.03559), arXiv 2606.30791 | Silence-duration shortcut (85 % accuracy from leading silence alone); frozen SSL + linear head generalises; lower layers carry most evidence; probing-guided layer selection | Not repeated for music under crossed shift | abstracts / excerpts |
| 17 | Deezer newsroom 2026-04-20 and 2026-07-21 | ~75,000 AI tracks/day (~44 % of uploads) in April; ~90,000/day and >50 % at the June 2026 peak; proprietary detector claims 99.8 % accuracy, <1 in 10,000 human tracks flagged; AI tracks 1–3 % of streams | Numbers are unverifiable vendor statements | page text |

## 3. Facts that shape the design

1. Every cross-dataset matrix so far pairs a dataset's fakes with *that dataset's* reals (Echoes, MusicDET, Li et al.). A cell off
   the diagonal therefore changes the generator and the real corpus at once. CoMoE separates them, but on one benchmark and one classifier.
2. Rank inversion exists: ArtifactBench reports AUROC 0.299 (SpecTTTra) and 0.284 (CLAM), far below chance. A detector can be
   systematically wrong under shift; AUROC < 0.5 must be reported and tested for, not averaged away.
3. Ranking quality and operating point come apart (CoMoE; ArtifactBench: CLAM native threshold gives TPR 0.889 at FPR 0.942).
4. Shortcuts are documented but rarely measured as baselines: leading silence (speech), sample rate/bitrate (Cros Vila), codec and
   genre confounding (Afchar). Nuisance-only baselines are the standard remedy and are missing from the music benchmarks we read.
5. Published Echoes numbers differ between arXiv v1 (3,577 tracks, EER on SONICS 2.06 %) and v2 (4,468 tracks, 4.8 %). Cite the
   version used; do not compare absolute EERs across papers.
6. The first AURIS paper's own LOGO table (`real_tables/logo_results.csv`) shows held-out recall at the train-derived threshold of
   0.222 (Echoes), 0.181 (AIME), 0.252 (Suno audio) with no human clips in those folds, so AUROC is undefined there. That is
   direct, self-generated evidence that threshold transfer fails; **verify** how the paper presents it before citing.
7. The first paper's pool already contains Echoes (1,128 clips), AIME (204), Suno audio (500) and the reals GTZAN (999), FMA (1,000),
   SleepyJesse (854), archive.org (18), all stored at 22,050 Hz (`dataset_bias_table.csv`). Any "unseen" claim for those sources is
   invalid for the frozen paper-1 models; an overlap audit is mandatory (see STUDY_DESIGN, E0).
8. AURIS's strongest features are rms_energy, rms_dynamic_range, rms_std, onset_strength, spectral_flatness_std,
   spectral_bandwidth_std, zero_crossing_rate (`feature_importance_top20.csv`). Several are level-, mastering- or bandwidth-sensitive,
   which makes them the most exposed to source shortcuts. This is a testable weakness, not a hypothetical one.

## 4. Claims we must not make

- "First", "pioneering", "fills the gap" for cross-generator or cross-dataset evaluation, wav2vec2 comparison on SONICS/FMC, or
  generator-shift analysis. Echoes, CoMoE, MusicDET, Li et al. and ArtifactBench already cover parts of each.
- That any reported detector "generalises to future generators". Scope every sentence to the generators actually tested.
- That 99.8 % (Deezer) or any vendor figure is evidence; it is a vendor statement.
- That a real corpus recorded before 2020 is free of confounds; it removes label noise, not era/mastering differences.
- That our AUROC differences are significant without a clustered interval.

## 5. Candidate contributions (each needs an "absence of evidence" check before it is claimed)

| Candidate | What we searched | Result so far |
|---|---|---|
| C1 Crossed real-corpus × fake-source design with variance decomposition of cross-dataset AUROC | cross-dataset music deepfake papers above | No paper found that fully crosses ≥3 real corpora with ≥4 fake sources; CoMoE restricts one side at a time |
| C2 Interpretable handcrafted features vs SSL embeddings (wav2vec2, XLS-R, MERT, CLAP) under identical splits and shifts | "handcrafted vs SSL AI music" | Only an unreviewed preprint (row 15) and the Fourier-peak work (row 4) touch handcrafted cues; no controlled comparison found |
| C3 Threshold-policy comparison (source-fixed, real-anchored quantile, few-shot recalibration) across detector families | "calibration threshold transfer AI music" | Real-quantile thresholds exist inside one method (row 12); no cross-system comparison found |
| C4 Shortcut ladder (nuisance-only → handcrafted → SSL) plus a real-vs-real null task | "shortcut learning music deepfake" | Shortcuts discussed (rows 3, 5, 16) but not used as a measured baseline ladder in music |
| C5 Forward-chained generator-version ladder (Suno v2→v3→v3.5→v5, Udio 32→130) | "generator version drift detector" | Version cohorts appear in ArtifactBench; no ordered train-old/test-new protocol found |
| C6 Layer-wise cross-generator transfer for wav2vec2/MERT on music | "layer-wise SSL deepfake" | Layer-wise work is speech/song-spoof (rows 16); not found for end-to-end AI music under generator shift |
| C7 Per-genre FPR parity of human music at a fixed overall FPR | "AI music detector false positive genre" | Nothing found; ArtifactBench reports real-domain FPR (0.020 FMA vs 0.211 web hard negatives) only |
| C8 PPV against measured deployment prevalence (28 %→50 %) | Deezer + detector papers | Deezer publishes prevalence; detector papers do not convert TPR/FPR to PPV |

Priority for the main paper: C1, C2, C3, C4 (core), C5 (if data allow). C6–C8 are secondary analyses.

## 6. Reading queue (full text before drafting)

Must read in full: Echoes v2, CoMoE, ArtifactBench v2, MusicDET, Li et al. Sci. Rep., Cros Vila TISMIR, Afchar ICASSP (finish
section on interpretability), Fourier explanation, MoM/CLAM, Pascu et al. 2309.05384, Kheir et al. 2502.03559, "Finding the noise"
2607.25530, Müller 2021/2022. Should read: ArtifactNet 2604.16254, Sofia 2606.16612, AIME (Grötschla et al., ICASSP 2025),
GTZAN critique (Sturm; **verify** reference), clustered bootstrap and calibration references for the statistics section.
