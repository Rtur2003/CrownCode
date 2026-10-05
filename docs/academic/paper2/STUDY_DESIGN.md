# Paper 2 — study design, controls, reviewer simulation, roadmap

Status: **design only, nothing executed.** Companion files: `LITERATURE_MAP.md` (what exists, what is open),
`DATA_MANIFEST.md` (what to download, sizes, commands), `WRITING_AND_VENUE.md` (voice, disclosure, venues).
Hardware assumption: one RTX 3050 Laptop (4 GB), 31.8 GB RAM, D: ≈ 300 GB free.

## 0. One-paragraph thesis (working)

Detectors of fully AI-generated music are usually compared through cross-dataset tables in which the generator and the real
corpus change together. We cross them. Using four fake sources (SONICS, FakeMusicCaps, Echoes, AIME) and several openly licensed
pre-2020 real corpora (FMA, MTG-Jamendo, and the real sets already in the first AURIS paper), we train every system on each
(fake source, real corpus) pair and test on every other pair, then split the AUROC change into a generator part, a real-corpus
part and their interaction. We compare interpretable handcrafted-feature models (the AURIS family) with frozen and fine-tuned
wav2vec2, XLS-R, MERT and CLAP representations and with published SONICS detectors used as released, and we add what the
earlier benchmarks lack: nuisance-only baselines, a real-vs-real null task, threshold-transfer policies, and a generator-version ladder.

Positioning rule: no "first". The contribution is a controlled decomposition plus the comparison it makes possible.

## 1. Research questions and falsifiable hypotheses

Frozen before any new data are touched (see section 9, pre-registration).

| RQ | Question | Hypothesis (can be wrong) | What would refute it |
|---|---|---|---|
| RQ1 | How much of a cross-dataset AUROC drop is generator shift, real-corpus shift, or their interaction? | H1: for handcrafted features the real-corpus term is at least as large as the generator term; for frozen SSL embeddings the generator term dominates | Mixed-model variance shares where real-corpus share (handcrafted) is clearly below the generator share, or SSL shows the reverse pattern |
| RQ2 | Do handcrafted and SSL systems degrade differently, and does the ranking depend on the shift type, the metric and the window? | H2: SSL leads in-domain; under at least one shift type the gap shrinks to within one clustered CI or reverses; no system is best in every cell | One system ahead in all shift types with non-overlapping CIs |
| RQ3 | Does the threshold carry over, and which policy repairs it? | H3: a source-fixed threshold gives TPR < 0.5 on at least one held-out generator for every system; a real-anchored target-quantile threshold fixes FPR but not TPR | Source-fixed thresholds hold TPR ≥ 0.5 everywhere, or recalibration with ≤ 100 labels restores TPR for all |
| RQ4 | How much apparent detection is explained by nuisance variables? | H4: a nuisance-only model reaches AUROC ≥ 0.70 on at least one benchmark pairing; AURIS accuracy falls after loudness/bandwidth equalisation | Nuisance-only ≈ 0.5 everywhere and AURIS unchanged by equalisation |
| RQ5 | Do detectors trained on older versions catch newer ones? | H5: TPR at fixed FPR falls monotonically along each family's release order | Flat or rising TPR along the ladder |
| RQ6 (secondary) | Do human tracks of some genres bear more false positives at a fixed overall FPR? | H6: electronic/ambient/lo-fi reals have the highest FPR | Per-genre FPR within overlapping CIs |
| RQ7 (secondary) | Which layers of wav2vec2/MERT carry transferable evidence? | H7: lower and middle layers transfer better than the last layer (as reported for speech and song spoofing) | Last layer best across shifts |
| RQ8 (secondary) | What precision does a measured detector give at deployment prevalence? | descriptive | — |

Scope advice: RQ1–RQ5 are the paper. RQ6–RQ8 go in as short analyses or a follow-up; adding robustness transforms (MP3/AAC/pitch/
time-stretch) as a full block would make the paper too broad (see R-risk 12).

## 2. Design factors

- **Fake source** F ∈ {SONICS, FakeMusicCaps, Echoes, AIME} with generator labels inside each (SONICS 5, FMC 5, Echoes 12, AIME 12).
- **Real corpus** R ∈ {FMA, MTG-Jamendo, GTZAN, SleepyJesse} (the last two are the paper-1 legacy reals; Echoes' 300 FMA references
  and AIME's 500 Jamendo clips are folded into FMA and Jamendo with their lineage IDs).
- **Training pair** (F_i, R_j): 16 pairs. **Test pair** (F_k, R_l): 16 pairs. 256 cells per system.
- Cell types: in-domain (i=k, j=l), generator shift (i≠k, j=l), real shift (i=k, j≠l), joint shift (i≠k, j≠l).
- **Splits.** Each source is cut once by lineage into train 60 % / calibration 15 % / sealed test 25 % with a published salt
  (as in ArtifactBench v2, which uses 20/10/70). Every reported cell uses the sealed-test partition of both sources; calibration
  partitions feed only threshold and recalibration policies; the test partitions are opened once.
- **Balance.** Each cell draws n_pos = n_neg (cap 500) 20 times; we report the mean and the draw SD next to the lineage-bootstrap CI.
  With 500 per class and AUROC ≈ 0.8 the Hanley–McNeil standard error is ≈ 0.014, enough to resolve ΔAUROC ≈ 0.05 in paired comparisons.
- **Systems per cell.** 12 systems (section 4) → ≈ 3,000 cells. Frozen embeddings plus a linear or GBM head make this cheap;
  fine-tuned models run on the 16 diagonal-plus-neighbour training pairs only.

## 3. Data roles, provenance and canonical preprocessing

1. **Provenance table** (E0 below): per source, licence, collection date, generator/version, original format (codec, bitrate, sample
   rate, channels), duration, lineage key (SONICS: lyrics+style pair; Echoes: reference track; AIME: prompt tag set; FMC: MusicCaps
   caption; FMA/Jamendo: track and artist), release date of the generator version (**verify each date from a primary source**).
2. **Overlap audit against the first paper's pool.** The pool (5,195 clips, 22,050 Hz) already holds Echoes 1,128, AIME 204, Suno
   audio 500, deepfake_audio 392, deepfake_audio_dataset 100, GTZAN 999, FMA 1,000, SleepyJesse 854, archive.org 18. Matching is
   by acoustic fingerprint or embedding nearest-neighbour, not by file hash (the pool was resampled). Frozen paper-1 artefacts are
   scored only on lineages with no overlap.
3. **Canonical audio.** Mono, 16 kHz, float32, fixed windows (10 s main; 30 s and full-length as secondary), centre crop for the
   main tables, a second crop position as a sensitivity check. AURIS features also run at their native 22.05 kHz where the source
   allows, so the bandwidth effect is measured, not assumed (a bandwidth ladder at 8/11.025/16/22.05 kHz).
4. **Equalisation regimes.** R0 raw-after-resample; R1 loudness-normalised (LUFS or RMS) and leading/trailing silence trimmed; R2
   R1 plus a uniform lossy re-encode of every file (same codec, bitrate) so container history cannot separate classes.
   The headline numbers use R1; R0 and R2 are reported as sensitivity.
5. **Legal handling.** No audio enters the repo. Only manifests (path-free IDs, SHA-256, lineage, split, licence) and scores are
   committed. Suno/Udio terms are not overridden by the dataset licences; files stay local.

## 4. Systems

| ID | System | Regime | Notes |
|---|---|---|---|
| S0 | Nuisance-only (duration, native rate, bitrate/codec, LUFS, peak, clipping fraction, leading/trailing silence, estimated low-pass cutoff, noise floor) → LR and GBM | retrain | Shortcut baseline; defines the floor |
| S1 | AURIS-47 + LightGBM | frozen (paper 1) and retrain | Paper-1 hyper-parameters; features frozen |
| S2 | AURIS-47 + stacking ensemble (11 models) | frozen and retrain | Paper-1 best ensemble |
| S3 | AURIS-invariant: feature subset chosen **only on the paper-1 pool** by invariance to loudness (±6 dB), resampling and MP3-128 | retrain | Defined before new data are touched; no re-selection on test pairs |
| S4 | Fourier fakeprint + linear head (Afchar et al. ISMIR 2025), if the public code runs | retrain | Interpretable non-SSL comparator; licence/availability to **verify** |
| S5 | wav2vec2-base frozen, mean and mean+std pooling, per-layer probes + logistic regression | retrain | Echoes-style protocol at base scale |
| S6 | XLS-R-300M frozen + logistic regression (C = 10⁶ as in Echoes) | retrain | XLS-R 2B (8.65 GB fp32) does not fit; if wanted, run on a rented GPU for the frozen-embedding step only (decision D3) |
| S7 | wav2vec2-base fine-tuned (paper-1 recipe: 10 epochs, dropout 0.3, weight decay 0.01, batch 2 × 4 accumulation, 30 s) | retrain, 5 seeds | Only on the 16 training pairs |
| S8 | MERT-v1-95M frozen + logistic regression / small MLP | retrain | Music-specific SSL |
| S9 | CLAP (laion music checkpoint) + SVM | retrain | Cros Vila protocol |
| S10 | SpecTTTra α/β/γ, 5 s and 120 s, as released | zero-shot | Native window and rate to **verify**; reported as "as released", never as retrained |
| S11 | Score-level and feature-level fusion of S1 with S5/S8 | retrain | Tests whether stacking helps or hurts under shift |
| S12 (optional) | Public third-party detectors (CLAM, Deezer fakeprint LR, ArtifactNet ONNX) | zero-shot | Only if weights, licence and size are confirmed; ArtifactNet is vendor-linked, so label it |

Tuning budget is equal per family (same number of trials, same nested grouped CV), recorded in the paper. Seeds: 5 for neural
heads and fine-tuning, 10 for GBMs.

## 5. Experiment blocks

| Block | Purpose | Output | Kill / stop rule |
|---|---|---|---|
| E-1 pilot | 200 clips per source: throughput of each extractor on the 4 GB GPU, feature-extraction cost, reproduce an in-domain sanity number (e.g. SONICS and FMC with S5/S6 land near Echoes' in-domain regime) | timings, sanity table | If extraction for all planned clips exceeds the time budget, drop S6/S8 to a subset or cut clip counts (gate G1) |
| E0 audit | Provenance, lineage keys, overlap with the paper-1 pool, duplicates inside and across corpora, format census | `audit/*.csv`, manifest hashes | Any unresolved overlap is excluded from "unseen" claims |
| E1 in-domain | All systems on the 16 diagonal cells | Table of AUROC, EER, TPR@1 % FPR with clustered CIs | — |
| E2 crossed matrix | 256 cells × systems | Heatmaps, shift-type bars, variance decomposition (mixed model: random effects for training pair and test pair; fixed effects for shift type) | H1/H2 evaluated here |
| E3 null tasks | Real-vs-real (R_j vs R_l) and fake-vs-fake (F_i vs F_k) with the same features | AUROC of corpus/source identification per system | If a system separates two human corpora with AUROC ≥ 0.9, its "detection" is partly corpus identification |
| E4 shortcut ladder | S0 → S1/S3 → S5–S9 under R0/R1/R2 | Ladder figure; Δ per equalisation step | H4 evaluated here |
| E5 codec round-trip control | Pass real clips through EnCodec 24 kHz (3, 6, 24 kbps) and DAC 44 kHz; score real vs reconstruction | Whether each system detects decoders or pipelines; content- and era-matched positives | If systems that score ≥ 0.95 on SONICS fail here, report as pipeline detection |
| E6 paired Echoes analysis | Echoes audio-to-audio fakes vs their FMA references | Paired score differences, sign test, per-provider results | — |
| E7 threshold policies | P1 source Youden, P2 source fixed FPR 5 %/1 %, P3 target real-quantile 95 %/99 %, P4 few-shot recalibration with k ∈ {10, 25, 50, 100} labelled target clips (200 repeats), P5 prior-shift correction | Realised vs nominal FPR/TPR, ECE, Brier, slope/intercept per held-out generator | H3 evaluated here |
| E8 version ladder | Train on versions ≤ t, test on later ones inside Suno and Udio families (and open families where dates are verified) | TPR@1 % FPR vs release order | If dates cannot be verified, run as "ordered by version label" and say so |
| E9 layer-wise | Per-layer probes of S5/S6/S8 under generator shift | Layer curves with CIs | — |
| E10 genre parity | Per-genre FPR of reals at fixed overall FPR | Parity table with Wilson/bootstrap CIs | Genres with fewer than 50 clips are withheld |
| E11 deployment | PPV and NPV at prevalence 1/10/28/44/50 % from measured TPR and FPR with CIs | PPV curves | Prevalence anchors: Deezer 2026 notices (28 % is a secondary-source figure for Sept 2025) |
| E12 robustness (appendix only) | MP3-128/64, resample 22.05/16/8 kHz, pitch ±2 st, tempo ±20 %, low/high-pass at Cros Vila cut-offs, **applied to both classes** | small table | Do not grow this into a full study |

## 6. Metrics and statistics

- Primary: AUROC and TPR at 1 % FPR. Also: EER, PR-AUC, balanced accuracy, MCC, Brier, ECE (10 bins), calibration slope and
  intercept. AUROC < 0.5 is reported as is and flagged as rank inversion (ArtifactBench reports 0.28–0.30).
- Intervals: 2,000 lineage-clustered bootstrap replicates, label-stratified; paired bootstrap for system differences.
  Holm correction over the pre-registered primary comparisons; everything else is labelled exploratory.
- Shift decomposition: linear mixed model on AUROC (or logit-AUROC) with shift-type fixed effects and random intercepts for
  training pair and test pair; report variance shares and the generator × real interaction with CI. Cross-check with a simple
  two-way ANOVA table.
- Seed variance reported for every learned model; no seed selection.
- No test-set threshold tuning; thresholds come from training or calibration partitions only (P3 uses target-domain *real*
  calibration clips, which is legitimate because it needs no target-domain fakes).

## 7. Integrity controls (what a reviewer will check first)

1. Test partitions sealed; opening logged with a timestamp and a git tag.
2. Lineage, not file, is the split unit; chromaprint or embedding de-duplication across corpora.
3. Feature selection (S3) and hyper-parameters fixed on training partitions or the paper-1 pool before any cross cell is computed.
4. Scalers and PCA fitted on training partitions only; no fitting on pooled data.
5. Coverage reported: decode failures and non-finite outputs are listed per system, not dropped silently.
6. Revisions pinned: dataset commits, model repo revisions, package versions, seeds, `pip freeze`, device string.
7. Every number in the manuscript is generated from a stored CSV by a script; no hand-typed results.

## 8. Reproducibility package (released)

Manifests (IDs, SHA-256, lineage, split, licence), per-track scores for every system, the analysis scripts, figures code in the
first paper's style, the pre-registration file, and a README that tells the reader how to rebuild the corpus from upstream sources.
No audio.

## 9. Pre-registration

Before the first test cell is computed: freeze sections 1–7 into a dated file, commit and tag it, and deposit the same text on
OSF (or an equivalent registry). Deviations afterwards are listed in a "Deviations" subsection of the paper.

## 10. Reviewer simulation (objection → answer built into the design)

| # | Likely objection | Answer |
|---|---|---|
| 1 | Not new: Echoes, CoMoE, MusicDET, Li et al., ArtifactBench exist | Related-work table (LITERATURE_MAP §2), contributions limited to C1–C4, "no first" wording, search protocol appendix |
| 2 | Real and fake sources are confounded | Crossed design; null tasks E3; equalisation R1/R2 |
| 3 | Reals are older recordings, fakes are modern productions | Codec round-trip E5, Echoes paired E6, loudness equalisation; era confound stated as a limitation, not claimed away |
| 4 | GTZAN is flawed | Treated as a legacy domain, results with and without; reference to its documented faults (**verify** citation) |
| 5 | SSL models may have seen FMA/Jamendo in pre-training | Stated; MERT's data are mined from the internet (160 k h) and not enumerable; the bias would favour SSL, so conclusions about handcrafted competitiveness are conservative |
| 6 | Subsampling | Power numbers in §2; repeated draws; one full-data pair as a check |
| 7 | Hyper-parameter fairness | Equal budget, grouped nested CV, disclosed |
| 8 | XLS-R 2B was used by Echoes, you used 300M | Stated; optional rented-GPU run for frozen 2B embeddings (D3) |
| 9 | SpecTTTra evaluated out of its design range | Both windows reported, "as released", no retraining claims |
| 10 | Thresholds leak test information | Thresholds from train/calibration partitions only; policy P3 uses real calibration clips |
| 11 | Multiple comparisons | Pre-registered primary list, Holm, exploratory label |
| 12 | Paper too broad | RQ1–RQ5 main; RQ6–RQ8 short; robustness in appendix |
| 13 | Lineage leakage inside datasets | Lineage keys per source; chromaprint/embedding de-dup |
| 14 | Prevalence differs from deployment | E11 PPV curves; Deezer anchors |
| 15 | Duration differs by source | Fixed windows; a second window reported |
| 16 | AURIS was tuned on its own pool | Features frozen; S3 chosen on that pool only; retrain regime reported separately from frozen regime |
| 17 | Cross-paper numbers compared at face value | Only protocol-matched replication; no cross-paper EER comparison |
| 18 | Dataset versions change | Commits pinned, hashes recorded |
| 19 | Claims about future generators | Scope every claim to tested generators; ladder is descriptive |
| 20 | Ethical risk of false accusation | E10 parity, wording that detectors are not proof of authorship, per-genre FPR caveats |
| 21 | Broadcast/real-world channels | Limitation; BAMM and AI-OpenBMAT cited |
| 22 | Label noise in "human" music | Pre-2020 openly licensed corpora; AI-assisted production before 2020 is rare but not zero — stated |
| 23 | Vendor-linked baselines | S12 optional and labelled; no conclusions rest on it |
| 24 | Self-citation inflation | Paper 1 supplies features and pool only; every claim here rests on new runs |
| 25 | Macro vs micro averaging hides weak generators | Per-generator tables in the appendix; macro over generators in the main text |
| 26 | Rank inversion averaged away | AUROC < 0.5 flagged per cell; inversion count reported |
| 27 | Linear head too weak for SSL | GBM/MLP head sensitivity on a subset; fine-tuned S7 included |
| 28 | Handcrafted features are format-sensitive | S3 and the bandwidth ladder quantify exactly this |
| 29 | Results driven by one dataset | Leave-one-fake-source-out and leave-one-real-corpus-out summaries |
| 30 | Reproducibility without audio | Manifests + scripts + rebuild README; upstream licences respected |

## 11. Gates and timeline (estimates, part-time; not commitments)

| Gate | Condition to pass | Rough effort after downloads finish |
|---|---|---|
| G0 | Downloads verified (checksums), E0 audit done, overlap resolved | 1–2 weeks |
| G1 | Pilot E-1: throughput known, sanity numbers plausible, clip budget fixed | 1 week |
| G2 | Pre-registration filed, splits sealed, code reviewed | 1 week |
| G3 | E1–E4 complete, no integrity red flags | 2–3 weeks |
| G4 | E5–E8 complete; headline story stable under R0/R1/R2 | 2 weeks |
| G5 | E9–E11 and appendix runs; figures in house style; replication check passes | 1–2 weeks |
| G6 | Manuscript drafted per `WRITING_AND_VENUE.md`, claims ledger green | 3–4 weeks |
| G7 | Submission once paper 1 is accepted (the advisor's condition) | — |

Overall realistic range: about 11–15 weeks from the day the downloads start. Experiments can run while paper 1 is still in review;
submission waits for its acceptance so that paper 1 can be cited as published.

## 12. Manuscript skeleton (figures and tables in the first paper's style)

Style carry-over: Times New Roman, transparent background, palette GOLD #C99347 / HUMAN #3cb44b / AI-red #e6194b, grid alpha
0.15, sequential numbering, short captions.

1. Introduction — why transfer, what is already known, what this paper adds (four contributions, no "first").
2. Related work — Table 1 (what each prior paper did / did not do).
3. Data and protocol — Table 2 (sources, licences, formats), Fig. 1 (crossed design), equalisation regimes, lineage and splits.
4. Systems — Table 3 (S0–S12, regime, parameters, tuning budget).
5. Results — Fig. 2 shift-type bars; Fig. 3 heatmaps; Table 4 variance decomposition; Fig. 4 shortcut ladder and null tasks; Fig. 5
   codec round-trip and Echoes pairs; Fig. 6 threshold policies; Fig. 7 version ladder; Table 5 secondary analyses (layers, genres, PPV).
6. Discussion — what transfers, what does not, limits (era, pre-training contamination, subsampling, broadcast channels, generator coverage).
7. Conclusion — claims scoped to tested generators.
Appendix — search protocol, per-generator tables, deviations from the pre-registration, full system settings, robustness.

## 13. Decisions

| # | Decision | Status |
|---|---|---|
| D1 | Scope | **Decided 2026-10-05:** one paper, RQ1–RQ5 as the core, which follows the advisor's request (cross-generator/cross-dataset on SONICS and FakeMusicCaps plus a direct wav2vec2 comparison) and adds the controlled design. RQ6–RQ8 are short analyses; robustness only in an appendix |
| D2 | Venue | **Deferred on purpose:** the advisor will name it after the research and writing are done; the manuscript is then adapted (template, limits, figure rules, disclosure place). Figure language, font size and legibility are held to a fixed standard from the start (`WRITING_AND_VENUE.md` §5b) |
| D3 | XLS-R 2B | **Decided:** no paid rental. Options in order: (a) TRUBA through the advisor's project account (free), (b) fp16 layer-streamed extraction on the local GPU, (c) Kaggle free GPU for frozen-embedding steps. See §14 |
| D4 | Paper-1 legacy reals | **Default adopted:** part of the main design, reported with and without GTZAN; the user did not object |
| D5 | Third-party detectors (S12) | Open; default is exclude until checkpoints and licences are confirmed |
| D6 | Author list, acknowledgements | Open; kept out of repo-visible files |
| D7 | Download start date, bandwidth | Open; the user will start the downloads |
| D8 | Citation of paper 1 | Placeholder until publication (expected in a few weeks per the user); then replace with the final volume, pages and DOI and re-verify every table number quoted from it |

## 14. Compute plan (free options only; limits as found on 2026-10-05, re-check before use)

| Option | What the sources say | Use here |
|---|---|---|
| TRUBA (TÜBİTAK ULAKBİM national HPC) | Free for academic researchers via e-Devlet; undergraduates get an account only inside an advisor's project; master's students 200,000 core-hours and 2 TB after advisor approval; GPU clusters: barbun-cuda (2× P100 per node), akya-cuda (4× V100), palamut-cuda (8× A100, reserved for AI work) | Best option: XLS-R 2B, MERT-330M, fine-tuning seeds, SONICS embedding extraction. Needs the advisor to add the user to a project account. Outbound internet from the cluster is **unverified** |
| Kaggle notebooks | Weekly GPU quota 30 h "or sometimes higher"; one P100 (4 CPU cores, 29 GB RAM) or 2× T4; 12 h per session; 20 GB auto-saved output; datasets up to 200 GB each; may queue; interactive idle timeout reported as 60 min (secondary source, **verify on Kaggle docs**) | Embedding extraction in 12 h chunks; SONICS is already a Kaggle dataset (awsaf49/sonics-dataset), so it can be attached without a local 32 GB download |
| Google Colab free | T4-class GPU, not guaranteed, limits unpublished (Google FAQ), 12 h max per notebook, idle disconnects | Fallback only |
| Lightning AI free | Pricing page: "up to 80 free GPU hours to start"; a third-party guide says 15 credits per month (about 22 T4 hours); free Studios restart every 4 h | Small extras only; figures disagree, check at sign-up |
| Local RTX 3050 (4 GB) | `accelerate` big-model inference streams layers from CPU RAM to GPU "as long as the largest layer fits"; `device_map="auto"` with fp16; bitsandbytes 8-bit/4-bit works on Windows with NVIDIA SM60+ (the 3050 qualifies) | XLS-R 2B in fp16 with layer streaming (about 4.3 GB of weights, 31.8 GB RAM); 8-bit only as a sensitivity run because quantisation changes the embeddings. Throughput is **unmeasured**; pilot E-1 decides |

Rules for any cloud run: (1) audio stays in private storage and never in a public dataset; (2) only embeddings and scores leave the
cloud; (3) library versions are pinned and identical to the local run; (4) a 200-clip equivalence check compares cloud and local
embeddings (cosine ≥ 0.999 per clip) before any cloud embedding is used; (5) dataset licences (CC BY-NC and the Suno/Udio terms) are
respected.
