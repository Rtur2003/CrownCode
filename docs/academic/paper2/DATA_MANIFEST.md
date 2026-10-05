# Paper 2 — data and model download manifest

Status: **planning only. Nothing has been downloaded.** Every size below comes from a registry/API/HEAD
response checked on 2026-10-05; items I could not check are listed in section 8.
Study: cross-generator / cross-dataset comparison of AI-music detectors (handcrafted-feature AURIS models vs.
wav2vec2 / CLAP / MERT embeddings vs. published SONICS detectors), legal real-audio side only.

Working root (outside the repo, so nothing can leak into git): `D:\paper2_data\`
Raw downloads: `D:\paper2_data\raw\<source>\`. Derived 16 kHz caches: `D:\paper2_data\cache\`.

## 1. What is already published (changes how we position the paper)

| Work | What it already covers | Read depth so far |
|---|---|---|
| Echoes, arXiv 2603.23667 (v2) | SONICS / FakeMusicCaps / AIME / Echoes cross-dataset matrix, wav2vec2 XLS-R 2B + logistic regression, EER only; leave-one-provider-out | abstract + results tables |
| CoMoE, arXiv 2606.08663 | Cross-generator AUC on MoM-open (FMA + MTG-Jamendo reals), real-source-restricted and fake-source-restricted splits; lists calibration/fusion under shift as future work | abstract + results tables |
| ArtifactBench, arXiv 2609.23550 | Lineage-aware protocol, public detectors (ArtifactNet, SpecTTTra, CLAM, Deezer), calibration-only thresholds, coverage reporting. Single-author, vendor-linked, preprint | abstract + method excerpts |
| Li et al., Sci. Rep. 2026 (s41598-026-42133-7) | Many model families on FakeMusicCaps, OOD test on M6 | abstract + excerpts |
| MoM / CLAM, arXiv 2512.00621 (TMLR 2025) | MERT + wav2vec2 dual-stream detector, OOD generators | abstract + excerpts |
| Cros Vila et al., TISMIR 2025 | CLAP + SVM, MSD vs Suno/Udio, robustness to resampling | abstract + excerpts |
| SONICS, arXiv 2408.14080 (ICLR 2025) | Dataset + SpecTTTra | abstract + dataset tables |
| FakeMusicCaps, arXiv 2409.10684 (J. Imaging 2025) | Dataset + closed/open-set baselines | abstract + dataset section |

Consequence: do **not** claim "first" or "fills an empty gap". The defensible contribution is a controlled head-to-head of
interpretable handcrafted features against SSL embeddings under one protocol, with calibration and operating-point
transfer, bootstrap CIs, per-generator slices, and a format/source-shortcut audit. All of the above must be read in
full before drafting.

## 2. Fake (AI-generated) audio

| ID | Source | Size | License | Role | Tier |
|---|---|---|---|---|---|
| F1 | SONICS fakes, HF `awsaf49/sonics`, `fake_songs/part_01..10.zip` | 32.2 GB (sum of 10 parts; bytes checked via Hub API) | CC BY-NC 4.0 | Suno v2/v3/v3.5, Udio 32/130; official train/valid/test with unseen algorithms | A |
| F1m | SONICS metadata: `fake_songs.csv` 132.5 MB, `train.csv` 152.3 MB, `test.csv` 57.0 MB, `valid.csv` 9.8 MB, `metadata.json` 3.2 MB | ~0.36 GB | CC BY-NC 4.0 | algorithm/split/style per file | A |
| F2 | FakeMusicCaps, Zenodo 15063698, `FakeMusicCaps.zip` (md5 `db418dc95ab7dc378a55f29d6021fd66`) | 12,889,873,014 B (12.9 GB) | CC BY-NC 4.0 | 27,605 ten-second clips, 5 open TTMs (MusicGen, MusicLDM, AudioLDM2, Stable Audio Open, Mustango), 16 kHz mono float32 WAV | A |
| F3 | Echoes, HF `Octavian97/Echoes`, `Echoes.zip` | 8,598,345,242 B (8.6 GB) | CC BY-SA 4.0 | 4,468 fakes, 12 providers incl. recent commercial ones; text- and audio-conditioned | A |
| F4 | AIME, HF `disco-eth/AIME` (210 parquet shards) | 62.28 GB full; selective row-group reads possible | CC BY-4.0 (generated), per-track CC for the 500 Jamendo reals | 6,000 fakes, 12 generators, prompts built from MTG-Jamendo tags | A (selective) |
| F5 | SunoCaps, Kaggle `miguelcivit/sunocaps` | not verified | not verified | 256 Suno tracks from 64 MusicCaps prompts, mp3 192 kbps 48 kHz | B |
| F6 | ArtifactBench v1 AI tracks, HF `intrect/artifactbench-v1/ai_tracks` | 15.99 GB | CC BY-NC 4.0 | extra recent Suno/Udio + re-hosted SONICS/AIME/MoM tracks. Overlaps F1/F4 (lineage risk); two sources are scraped CDN files with unclear terms | B (probe only) |

## 3. Real (human) audio — legal, pre-generative-AI

Rule: only openly licensed recordings published before 2020 (Suno/Udio-class generators did not exist), so the label is
safe without per-track checking. No YouTube downloads.

| ID | Source | Size | License | Role | Tier |
|---|---|---|---|---|---|
| R1 | FMA metadata `fma_metadata.zip` (sha1 `f0df49ffe5f2a6008d7dc83c6915b31835dfe733`) | 358,412,441 B | CC BY 4.0 | track licences, genres, dates, subset membership | A |
| R2 | FMA `fma_medium.zip` (sha1 `c67b69ea232021025fca9231fc1c7c1a063ab50b`) | 23,825,005,356 B (22.2 GiB) | per-artist CC; research use | 25,000 × 30 s mp3, 16 genres (small has 8 genres only, so no classical/jazz/blues/country) | A |
| R3 | MTG-Jamendo `raw_30s/audio-low`, tars 00–05 (`https://cdn.freesound.org/mtg-jamendo/raw_30s/audio-low/raw_30s_audio-low-NN.tar`) | 1,661,317,120 B per tar (tar 00 checked) → ~10 GB for 6 | per-track CC; non-commercial research only | vocal-heavy pop/rock/electronic reals, same domain as AIME prompts; mono LAME VBR2 | A |
| R4 | Echoes bona-fide references: 300 FMA tracks (CC0/CC-BY/public domain) pulled from `fma_full.zip` by HTTP range (943,642,698,636 B, Accept-Ranges confirmed; only the central directory plus ~300 mp3 ≈ 2–3 GB read) | ~2.5 GB (estimate) | CC0/CC-BY/PD | matched real counterpart for every Echoes fake → paired analysis | A |
| R5 | AIME's 500 MTG-Jamendo reals (inside F4 shards) | included in F4 | per-track CC | matched reals for AIME | A |
| R6 | MusicNet, Zenodo 5120004, `musicnet.tar.gz` (md5 `844764911fa0d5b97c97da944a057590`) | 11.1 GB | CC BY 4.0 | 330 classical recordings, hard-negative slice | B |

## 4. Models and checkpoints (all Hugging Face)

| Model | Files to fetch | Size | Use |
|---|---|---|---|
| `facebook/wav2vec2-base` | `pytorch_model.bin` + json | 380 MB | frozen-embedding and fine-tune comparator (same checkpoint as the first paper) |
| `facebook/wav2vec2-xls-r-300m` | `pytorch_model.bin` + json | 1.27 GB | XLS-R comparator (Echoes used the 2B variant; it does not fit a 4 GB GPU in fp32, so we use 300M and say so) |
| `m-a-p/MERT-v1-95M` | `pytorch_model.bin` + json/py | 378 MB | music-specific SSL embeddings (skip the 1.3 GB fairseq `.pt`) |
| `m-a-p/MERT-v1-330M` (optional) | same | 1.26 GB | larger music SSL |
| `laion/larger_clap_music` | full repo | 776 MB | music CLAP (the first paper used the `laion_clap` default checkpoint; keep that one too for continuity — size not verified) |
| `awsaf49/sonics-spectttra-alpha-120s` | `pytorch_model.bin` + config | 75 MB | published SONICS detector, long window |
| `awsaf49/sonics-spectttra-alpha-5s` | same | 68 MB | published SONICS detector, 5 s window |
| `awsaf49/sonics-spectttra-{beta,gamma}-{5s,120s}` (optional) | same | ~70–80 MB each (not individually verified) | SpecTTTra variants |

Third-party detectors named in the literature (CLAM, ArtifactNet ONNX, Deezer fakeprint LR) are **not** in this tier:
checkpoint availability, licence and size are unverified, and ArtifactNet/ArtifactBench are single-author vendor-linked
work. Decide after the core results exist.

## 5. Disk and time budget

| Block | GB |
|---|---|
| SONICS fakes + metadata | 32.6 |
| FakeMusicCaps | 12.9 |
| Echoes | 8.6 |
| FMA metadata + medium | 24.2 |
| Echoes bona-fide extraction | ~2.5 |
| MTG-Jamendo 6 tars | ~10.0 |
| AIME (selective ≈ 15–20, full 62.3) | 17 → 62 |
| Models | ~3.3 |
| **Raw total** | **~111 GB selective AIME / ~156 GB full AIME** |
| Derived caches (16 kHz mono, fixed windows) | ~40–60 GB |

D: has 302.5 GB free. At 100 Mbit/s the raw total is about 2.5–4 h.

## 6. Commands (run later, in this order; I will not run any of them)

Prerequisite: `pip install -U huggingface_hub remotezip pyarrow`.

```bash
mkdir -p /d/paper2_data/raw && cd /d/paper2_data/raw

# F1 SONICS (CSVs first, then the ten zips)
hf download awsaf49/sonics --repo-type dataset --local-dir sonics --include "*.csv" "metadata.json" "README.md"
hf download awsaf49/sonics --repo-type dataset --local-dir sonics --include "fake_songs/*.zip"

# F2 FakeMusicCaps (resumable) + checksum
curl -L -C - -o fakemusiccaps/FakeMusicCaps.zip --create-dirs "https://zenodo.org/records/15063698/files/FakeMusicCaps.zip?download=1"
md5sum fakemusiccaps/FakeMusicCaps.zip   # expect db418dc95ab7dc378a55f29d6021fd66

# F3 Echoes
hf download Octavian97/Echoes --repo-type dataset --local-dir echoes

# R1 + R2 FMA (resumable) + checksums
curl -L -C - -o fma/fma_metadata.zip --create-dirs https://os.unil.cloud.switch.ch/fma/fma_metadata.zip
curl -L -C - -o fma/fma_medium.zip https://os.unil.cloud.switch.ch/fma/fma_medium.zip
sha1sum fma/fma_metadata.zip fma/fma_medium.zip   # expect f0df49ff... and c67b69ea...

# R3 MTG-Jamendo, six low-quality tars + checksum list
mkdir -p jamendo && cd jamendo
curl -L -O https://raw.githubusercontent.com/MTG/mtg-jamendo-dataset/master/data/download/raw_30s_audio-low_sha256_tars.txt
for n in 00 01 02 03 04 05; do curl -L -C - -O "https://cdn.freesound.org/mtg-jamendo/raw_30s/audio-low/raw_30s_audio-low-$n.tar"; done
grep -E "audio-low-0[0-5]\.tar" raw_30s_audio-low_sha256_tars.txt | sha256sum -c -
cd ..

# F4 AIME: selective is scripted after download of F3 (needs shard→model map); full alternative:
# hf download disco-eth/AIME --repo-type dataset --local-dir aime

# Models
hf download facebook/wav2vec2-base --local-dir ../models/wav2vec2-base
hf download facebook/wav2vec2-xls-r-300m --local-dir ../models/wav2vec2-xls-r-300m
hf download m-a-p/MERT-v1-95M --local-dir ../models/MERT-v1-95M --include "*.json" "*.py" "pytorch_model.bin"
hf download laion/larger_clap_music --local-dir ../models/larger_clap_music
hf download awsaf49/sonics-spectttra-alpha-120s --local-dir ../models/sonics-spectttra-alpha-120s
hf download awsaf49/sonics-spectttra-alpha-5s --local-dir ../models/sonics-spectttra-alpha-5s
```

Cheaper SONICS alternative (range reads, needs only a few hundred MB instead of 32 GB): `remotezip` over the HF
`resolve` URLs (Accept-Ranges confirmed on part_01) after I write a stratified selector from `fake_songs.csv`.
The Zenodo FakeMusicCaps HEAD returned no `Accept-Ranges`, so plan a full download for F2.

R4 (Echoes bona-fide references) and the AIME shard selector are scripts I write once `echoes/dataset_manifest.csv`
and the AIME parquet metadata are on disk.

## 7. Protocol constraints these downloads must serve

1. **Format harmonization.** Sources differ in codec and rate (FMC: 16 kHz mono float WAV; SONICS/FMA/Echoes: mp3;
   Jamendo low: mono VBR mp3; SunoCaps: 48 kHz mp3). All audio goes through one pipeline (mono, 16 kHz, same window,
   optional uniform mp3 re-encode) and a format-only control (can a classifier tell sources apart on silence-trimmed
   high-frequency bands alone?) is reported.
2. **Real-source-restricted splits.** Train reals from one corpus (e.g. FMA), test reals from another (Jamendo), and vice
   versa, so a detector that keys on corpus identity is exposed.
3. **Generator-held-out splits.** Leave-one-generator-out inside each dataset plus the official SONICS unseen-algorithm split.
4. **Lineage groups.** SONICS pairs share (lyrics, style) inputs; Echoes fakes share one reference track; AIME/ArtifactBench
   re-host SONICS/AIME. Split by lineage, never by file; drop F6 tracks that duplicate F1/F4.
5. **Windows.** FMC/AIME are 10 s clips, FMA/Jamendo are 30 s, SONICS/Echoes are full length: fix one analysis window (and
   report a second one) so duration is not a shortcut.
6. **Reporting.** ROC-AUC, PR-AUC, EER, balanced accuracy, MCC, Brier/ECE, calibration-only threshold transfer, 95 % bootstrap
   CIs grouped by lineage, per-generator TPR at a fixed real-FPR.

## 8. Unverified — confirm at download time

- FakeMusicCaps zip: only the `audioldm2/` folder was visible in Zenodo's preview; whether any real MusicCaps audio is
  inside is unknown (descriptions say 27,605 generated tracks only).
- Zenodo range support (HEAD showed none).
- FMA subset nesting (small ⊂ medium) — check `tracks.csv` column `set.subset`.
- SunoCaps size and licence; ArtifactBench provenance of the `*_cdn_latest` and `*_extra` sources.
- AIME shard-to-generator mapping; AIME clip length.
- Echoes record counts differ between arXiv v1 (3,577 tracks, 10 providers, 310 references, MIT) and v2/HF
  (4,468 tracks, 12 providers, 300 references, CC BY-SA 4.0). We follow the HF card and v2.
- Jamendo per-track licence mix (some tracks may carry NC/ND terms; fine for private research, relevant only if we ever redistribute).
- SONICS fakes are Suno/Udio outputs: the CC BY-NC dataset licence does not override those services' terms; keep files out of the repo.

## 9. Excluded, with reason

| Item | Reason |
|---|---|
| SONICS reals (`real_songs.csv` → YouTube) | YouTube downloads; copyright |
| MusicCaps reals (AudioSet/YouTube) | same |
| MoM-CLAM audio (`anonymous2212/MoM-CLAM-dataset`) | reals are YouTube-derived; fakes partly link-only |
| M6 (`yl7622/M6`, 30.2 GB single tar.gz) | no dataset card or licence; contains GTZAN (copyright questions) |
| MuseBench (`Anonymousv22222/MuseBench-part1..5`, ~800 GB) | anonymous review-stage repo, licence unverified, too large |
| Million Song Dataset audio, GTZAN, RWC | not freely redistributable / paid |
| MagnaTagATune | 16 kHz 32 kbps mono mp3: a pure format shortcut |
| XLS-R 2B | does not fit the 4 GB GPU for fine-tuning; frozen fp16 inference only if later justified |
