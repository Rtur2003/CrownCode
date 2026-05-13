"""
Build AURIS_paper_GUJSA.docx from the markdown source.
GUJSA formatting: Times New Roman 11pt, justified, single spacing,
8pt/12pt spacing, 9pt abstract, ALL CAPS headings, hanging refs.
Figures are embedded from docs/academic/figures/paper_*.png

Usage:
    python build_docx.py
"""

from __future__ import annotations

from pathlib import Path
from docx import Document
from docx.shared import Pt, Cm, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

OUT     = Path(__file__).parent / "AURIS_paper_GUJSA.docx"
FIGURES = Path(__file__).parent.parent / "figures"

TNR       = "Times New Roman"
BODY_SIZE = Pt(11)
ABS_SIZE  = Pt(9)
GOLD      = RGBColor(0xC9, 0x93, 0x47)


# ── helpers ──────────────────────────────────────────────────────────────

def _set_spacing(para, before_pt=8, after_pt=12, line_rule="single"):
    pPr = para._p.get_or_add_pPr()
    spacing = OxmlElement("w:spacing")
    spacing.set(qn("w:before"), str(int(before_pt * 20)))
    spacing.set(qn("w:after"),  str(int(after_pt  * 20)))
    if line_rule == "single":
        spacing.set(qn("w:line"),     "240")
        spacing.set(qn("w:lineRule"), "auto")
    pPr.append(spacing)


def _font(run, size=BODY_SIZE, bold=False, italic=False, color=None):
    run.font.name   = TNR
    run.font.size   = size
    run.font.bold   = bold
    run.font.italic = italic
    if color:
        run.font.color.rgb = color
    r = run._r
    rPr = r.get_or_add_rPr()
    rFonts = OxmlElement("w:rFonts")
    rFonts.set(qn("w:ascii"), TNR)
    rFonts.set(qn("w:hAnsi"), TNR)
    rFonts.set(qn("w:cs"),    TNR)
    rPr.insert(0, rFonts)


def body(doc, text, bold=False, italic=False,
         align=WD_ALIGN_PARAGRAPH.JUSTIFY, before=8, after=12, size=BODY_SIZE):
    p = doc.add_paragraph()
    p.alignment = align
    _set_spacing(p, before, after)
    r = p.add_run(text)
    _font(r, size=size, bold=bold, italic=italic)
    return p


def heading(doc, text, level=1):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    _set_spacing(p, before_pt=14, after_pt=6)
    r = p.add_run(text.upper())
    _font(r, size=BODY_SIZE, bold=True)
    return p


def subheading(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    _set_spacing(p, before_pt=10, after_pt=4)
    r = p.add_run(text)
    _font(r, size=BODY_SIZE, bold=True, italic=True)
    return p


def abstract_block(doc, label, text, size=ABS_SIZE):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    _set_spacing(p, before_pt=4, after_pt=4)
    rl = p.add_run(label + " ")
    _font(rl, size=size, bold=True)
    rb = p.add_run(text)
    _font(rb, size=size)
    return p


def keywords_line(doc, label, text, size=ABS_SIZE):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    _set_spacing(p, before_pt=2, after_pt=8)
    rl = p.add_run(label + " ")
    _font(rl, size=size, bold=True, italic=True)
    rb = p.add_run(text)
    _font(rb, size=size, italic=True)
    return p


def table_row(table, row_idx, values, bold=False, bg=None):
    row = table.rows[row_idx]
    for i, val in enumerate(values):
        cell = row.cells[i]
        cell.text = ""
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(str(val))
        _font(r, size=Pt(9), bold=bold)
        if bg:
            tc = cell._tc
            tcPr = tc.get_or_add_tcPr()
            shd = OxmlElement("w:shd")
            shd.set(qn("w:val"),   "clear")
            shd.set(qn("w:color"), "auto")
            shd.set(qn("w:fill"),  bg)
            tcPr.append(shd)


def caption(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _set_spacing(p, before_pt=4, after_pt=10)
    r = p.add_run(text)
    _font(r, size=BODY_SIZE, italic=True)
    return p


def figure(doc, filename, caption_text, width_cm=14.0):
    """Embed a figure from the figures directory with caption."""
    fig_path = FIGURES / filename
    if fig_path.exists():
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        _set_spacing(p, before_pt=8, after_pt=2)
        run = p.add_run()
        run.add_picture(str(fig_path), width=Cm(width_cm))
    else:
        body(doc, f"[Figure not found: {filename}]",
             italic=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    caption(doc, caption_text)


def reference_entry(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    _set_spacing(p, before_pt=2, after_pt=4)
    pPr = p._p.get_or_add_pPr()
    ind = OxmlElement("w:ind")
    ind.set(qn("w:left"),    "360")
    ind.set(qn("w:hanging"), "360")
    pPr.append(ind)
    r = p.add_run(text)
    _font(r, size=Pt(10))
    return p


def hline(doc):
    p = doc.add_paragraph()
    _set_spacing(p, before_pt=2, after_pt=2)
    pPr = p._p.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"),   "single")
    bottom.set(qn("w:sz"),    "4")
    bottom.set(qn("w:space"), "1")
    bottom.set(qn("w:color"), "C99347")
    pBdr.append(bottom)
    pPr.append(pBdr)


def bullet(doc, text):
    p = doc.add_paragraph(style="List Bullet")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    _set_spacing(p, before_pt=2, after_pt=2)
    r = p.add_run(text)
    _font(r, size=BODY_SIZE)
    return p


# ── build document ────────────────────────────────────────────────────────

def build():
    doc = Document()

    for section in doc.sections:
        section.top_margin    = Cm(2.5)
        section.bottom_margin = Cm(2.5)
        section.left_margin   = Cm(2.5)
        section.right_margin  = Cm(2.5)

    # ── Title ──────────────────────────────────────────────────────────
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _set_spacing(p, before_pt=0, after_pt=6)
    r = p.add_run(
        "AURIS: A Multi-Model Ensemble System for AI-Generated Music Detection "
        "Using Acoustic Feature Analysis"
    )
    _font(r, size=Pt(13), bold=True)

    p2 = doc.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _set_spacing(p2, before_pt=2, after_pt=4)
    r2 = p2.add_run(
        "AURIS: Akustik Özellik Analizi Kullanarak Yapay Zeka Tarafından "
        "Üretilen Müziğin Tespiti için Çok Modelli Topluluk Sistemi"
    )
    _font(r2, size=Pt(11), italic=True)

    pa = doc.add_paragraph()
    pa.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _set_spacing(pa, before_pt=6, after_pt=2)
    ra = pa.add_run("Hasan Arthur Altuntaş")
    _font(ra, size=Pt(11), bold=True)

    pa2 = doc.add_paragraph()
    pa2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _set_spacing(pa2, before_pt=0, after_pt=2)
    ra2 = pa2.add_run(
        "Department of Computer Engineering, Düzce University, Düzce, Turkey\n"
        "hasannarthurrr@gmail.com"
    )
    _font(ra2, size=Pt(10))

    hline(doc)

    # ── Turkish Abstract ────────────────────────────────────────────────
    abstract_block(doc, "Öz:", (
        "Suno, Udio ve MusicGen gibi yapay zeka tabanlı müzik üretim sistemlerindeki hızlı gelişmeler, "
        "yapay zeka tarafından üretilen seslerin insan bestelerinden ayırt edilmesini giderek "
        "zorlaştırmaktadır. Bu çalışmada, akustik özellik analizi aracılığıyla yapay zeka tarafından "
        "üretilen müziği tespit etmek amacıyla tasarlanmış çok modelli bir topluluk sistemi olan AURIS "
        "sunulmaktadır. AURIS, librosa kütüphanesi kullanılarak spektral, zamansal, ritmik ve vokal "
        "boyutları kapsayan 47 el yapımı ses özelliği çıkarmakta; 5.195 örnekten (2.082 yapay zeka "
        "üretimi, 3.113 insan bestesi) oluşan veri kümesi üzerinde on bir sınıflandırma modeli "
        "eğitmektedir. Model eğitimi 5 katlı tabakalı çapraz doğrulama ve Youden's J eşik optimizasyonu "
        "kullanmaktadır. LightGBM en yüksek ROC-AUC değerine (0,9549) ulaşmış, Derin YSA (512-256-128-64) "
        "0,9537 ile derin öğrenme modelleri arasında öne çıkmıştır. Sistem Hugging Face Spaces üzerinde "
        "gerçek zamanlı analiz sunan bir web uygulaması olarak dağıtılmıştır."
    ))
    keywords_line(doc, "Anahtar Kelimeler:",
        "Yapay zeka müzik tespiti, ses sınıflandırma, LightGBM, topluluk öğrenmesi, "
        "akustik özellikler, deepfake ses, wav2vec2, MFCC")

    # ── English Abstract ────────────────────────────────────────────────
    abstract_block(doc, "Abstract:", (
        "The rapid advancement of AI-based music generation systems such as Suno, Udio, and MusicGen "
        "has made it increasingly difficult to distinguish AI-generated audio from human-composed music. "
        "This paper presents AURIS, a multi-model ensemble system designed to detect AI-generated music "
        "through acoustic feature analysis. AURIS extracts 47 handcrafted audio features spanning "
        "spectral, temporal, rhythmic, and vocal dimensions using the librosa library, and trains eleven "
        "classification models comprising seven traditional machine learning (ML) algorithms and four "
        "deep learning (DL) architectures on a curated dataset of 5,195 samples (2,082 AI-generated, "
        "3,113 human-composed). Model training employs 5-fold stratified cross-validation with per-fold "
        "Youden's J threshold optimization to address class imbalance. LightGBM achieved the highest "
        "ROC-AUC of 0.9549 among ML models, while Deep MLP (512-256-128-64) reached 0.9537 among DL "
        "architectures. The complete system is deployed as a web application on Hugging Face Spaces, "
        "providing real-time analysis via file upload and microphone input."
    ))
    keywords_line(doc, "Keywords:",
        "AI music detection, audio classification, LightGBM, ensemble learning, acoustic features, "
        "deepfake audio, wav2vec2, MFCC")

    hline(doc)

    # ── 1. Introduction ────────────────────────────────────────────────
    heading(doc, "1. Introduction")
    body(doc, (
        "The proliferation of AI-generated content has extended beyond text and imagery into the musical "
        "domain. Platforms such as Suno (v3, v3.5, v4), Udio, Meta's MusicGen, and numerous diffusion-based "
        "audio synthesis systems now produce music that is perceptually indistinguishable from human-composed "
        "recordings for many listeners (Copet et al., 2023; Liu et al., 2023). This development raises "
        "substantial questions regarding copyright attribution, artistic authenticity, and the integrity "
        "of music streaming platforms."
    ))
    body(doc, (
        "While audio deepfake detection for speech has been extensively studied — driven by competitions "
        "such as the ADD Challenge (Yi et al., 2022) and datasets like WaveFake (Frank & Schönherr, 2021) "
        "— the detection of AI-generated music remains comparatively underexplored. Music presents unique "
        "challenges: harmonic complexity, polyphonic structure, rhythmic patterns, and the absence of "
        "speaker identity cues that aid speech-based detectors."
    ))
    body(doc, (
        "Recent surveys (Liu et al., 2024; Yi et al., 2023) characterize the field as nascent, with most "
        "published work relying on simple spectrogram classifiers or transfer of speech deepfake detection "
        "architectures without domain adaptation. Bhatt et al. (2025) identify that AI-music detectors "
        "trained on single generators generalize poorly to unseen synthesis systems — a critical "
        "robustness gap. Afchar et al. (2025) demonstrated that decoder-artifact-based detection can "
        "achieve 99.8% accuracy, yet degrades substantially under common audio manipulations such as "
        "MP3 compression and pitch shifting."
    ))
    body(doc, "AURIS addresses these challenges through three main contributions:")
    bullet(doc,
        "A comprehensive 47-feature acoustic representation covering spectral flatness, MFCC deltas, "
        "onset strength, chroma entropy, vocal breath patterns, vibrato regularity, and formant "
        "consistency — features specifically curated for the human-versus-AI distinction in music.")
    bullet(doc,
        "An eleven-model ensemble combining seven ML classifiers (Logistic Regression, Random Forest, "
        "Gradient Boosting, SVM-RBF, MLP, XGBoost, LightGBM) with four DL architectures (Deep MLP, "
        "1D-CNN, Residual MLP, Attention MLP), trained with Youden's J threshold optimization.")
    bullet(doc,
        "A multi-generator training dataset spanning 12+ AI synthesis systems, designed to maximize "
        "cross-generator generalization.")
    body(doc, (
        "The system pipeline is illustrated in Figure 1. The complete system is publicly available "
        "on Hugging Face Spaces."
    ))

    figure(doc, "paper_pipeline_diagram.png",
           "Figure 1. AURIS system pipeline — end-to-end AI music detection from audio input through "
           "feature extraction, model ensemble, and probability fusion to final decision.")

    # ── 2. Related Work ────────────────────────────────────────────────
    heading(doc, "2. Related Work")
    subheading(doc, "2.1. Audio Deepfake Detection")
    body(doc, (
        "Audio deepfake detection emerged as a research priority following advances in neural "
        "text-to-speech synthesis. The WaveFake dataset (Frank & Schönherr, 2021) established a "
        "foundational benchmark using seven vocoder architectures, demonstrating that mel-spectrogram "
        "features combined with lightweight classifiers achieve high detection rates on known vocoders "
        "but degrade substantially on unseen architectures. The ADD 2022 challenge (Yi et al., 2022) "
        "formalized the problem with three tracks covering low-quality fakes, partially fake audio, "
        "and adversarial conditions. Yi et al. (2023) provide a comprehensive survey cataloguing feature "
        "engineering approaches (MFCC, LFCC, CQT) and deep learning classifiers across seventeen datasets."
    ))
    subheading(doc, "2.2. Transformer-Based Audio Representations")
    body(doc, (
        "Baevski et al. (2020) introduced wav2vec2, a self-supervised transformer pre-trained on "
        "unlabelled speech through contrastive objectives on quantized latent vectors. Fine-tuned "
        "variants demonstrate strong performance across audio classification tasks. "
        "Martín-Doñas & Álvarez (2022) applied wav2vec2 to the ADD 2022 deepfake detection challenge, "
        "achieving competitive results without task-specific feature engineering. CLAP (Elizalde et al., "
        "2023) and its LAION variant (Wu et al., 2023) extend contrastive pre-training to joint "
        "audio-text embedding spaces, enabling zero-shot audio classification."
    ))
    subheading(doc, "2.3. Ensemble Methods and Gradient Boosting for Audio")
    body(doc, (
        "Ensemble approaches consistently outperform single-model classifiers in music analysis "
        "(Kostrzewa et al., 2022). Gradient boosting methods — particularly XGBoost and LightGBM — "
        "show strong performance on handcrafted audio feature vectors (Gan et al., 2024; "
        "Liu et al., 2022). Gourisaria et al. (2024) establish that combining MFCC and STFT features "
        "consistently outperforms either feature set alone, motivating AURIS's hybrid 47-feature "
        "representation."
    ))
    subheading(doc, "2.4. AI Music Generation Systems")
    body(doc, (
        "MusicGen (Copet et al., 2023) introduced a single-stage transformer-based autoregressive "
        "music generation model. AudioLDM (Liu et al., 2023) uses CLAP embeddings for diffusion-based "
        "generation. Alongside commercial systems Suno and Udio — which deploy proprietary architectures "
        "— these systems constitute the primary generation pipelines whose output AURIS is trained "
        "to detect."
    ))
    subheading(doc, "2.5. Recent Advances in AI Music Detection (2025–2026)")
    body(doc, (
        "Liu et al. (2024) provide a comprehensive pathway connecting audio deepfake detection to the "
        "emerging AI-generated music detection domain. Afchar et al. (2025) demonstrated that detectors "
        "trained on auto-encoder artifacts can achieve 99.8% accuracy by exploiting decoder fingerprints, "
        "while also identifying robustness limitations under common audio manipulations. Kosta et al. "
        "(2025) proposed the Segment Transformer, which processes sequences of music segments and "
        "integrates self-supervised pre-trained representations within a transformer-based framework "
        "to capture structural patterns. Bhatt et al. (2025) further characterize the challenge landscape, "
        "emphasizing that cross-generator generalization remains the primary open problem."
    ))

    # ── 3. Method ──────────────────────────────────────────────────────
    heading(doc, "3. Material and Method")
    subheading(doc, "3.1. Dataset")
    body(doc, (
        "The AURIS training dataset comprises 5,195 audio samples: 2,082 AI-generated (label=1) and "
        "3,113 human-composed (label=0), yielding a class ratio of approximately 1:1.5. Audio samples "
        "were collected from HuggingFace Hub repositories spanning 12+ AI generation architectures "
        "(Suno v3/v3.5/v4/v5, Udio, MusicGen, Stable Audio, Riffusion, AudioLDM2, Mustango, JEN-1, "
        "MusicLDM, Tango) and human music corpora including GTZAN and the Free Music Archive. "
        "Samples span 20 musical genres. All audio was resampled to 22,050 Hz. Duration and sample "
        "rate metadata were excluded from feature vectors to prevent data leakage."
    ))
    subheading(doc, "3.2. Feature Extraction")
    body(doc, (
        "AURIS extracts a 47-dimensional feature vector per sample using the librosa library (v0.10.1), "
        "organized into four categories:"
    ))
    bullet(doc,
        "Spectral (16 features): MFCC mean/variance, MFCC delta/delta² variance, spectral centroid, "
        "bandwidth, rolloff, flatness (mean+std), contrast (mean+std), mel flatness, spectral regularity.")
    bullet(doc,
        "Temporal/Rhythmic (10): RMS energy, RMS std, dynamic range, zero-crossing rate/std, "
        "tempo BPM/stability/CV, onset strength mean/std, beat count.")
    bullet(doc,
        "Harmonic/Tonal (9): chroma std, chroma entropy, chroma transition rate, tonnetz std, "
        "harmonic ratio, harmonic structure, temporal patterns.")
    bullet(doc,
        "Vocal/Expressive (12): has_vocals, vocal energy ratio, vocal harmonic ratio, vocal confidence, "
        "vocal AI score, vocal texture score, breath pattern score, formant consistency, "
        "vibrato rate/extent/regularity, pitch stability.")
    body(doc, (
        "Composite scores (spectral_regularity, temporal_patterns, harmonic_structure) are computed as "
        "normalized weighted sums of their constituent features, providing interpretable [0, 1] scores "
        "for real-time UI display alongside raw metrics."
    ))
    subheading(doc, "3.3. Classification Models")
    body(doc, (
        "AURIS trains eleven models in two groups. ML models: Logistic Regression, Random Forest "
        "(n=300), Gradient Boosting (n=200), SVM-RBF with CalibratedClassifierCV (isotonic, cv=3), "
        "MLP (256-128-64), XGBoost (n=300, scale_pos_weight=n_neg/n_pos), and LightGBM "
        "(n=500, num_leaves=63). DL models: Deep MLP (512-256-128-64, BatchNorm, Dropout 0.3), "
        "1D-CNN (Conv1D 32-64-128 + GlobalAvgPool), Residual MLP (3 blocks, 64-dim), and Attention MLP. "
        "All DL models use BCEWithLogitsLoss with pos_weight=n_neg/n_pos, Adam (lr=1e-3), and "
        "early stopping (patience=10). A fine-tuned wav2vec2 transformer (facebook/wav2vec2-base) "
        "provides an independent end-to-end classifier on raw 16 kHz audio."
    ))
    subheading(doc, "3.4. Training Protocol")
    body(doc, (
        "All models are evaluated under 5-fold stratified cross-validation. Per fold: "
        "(1) StandardScaler is fitted on the training split only to prevent leakage; "
        "(2) the optimal decision threshold is determined via Youden's J statistic "
        "(threshold* = argmax(TPR − FPR) on the fold ROC curve), replacing the naive 0.5 default; "
        "(3) accuracy, F1, precision, recall, and ROC-AUC are computed on the validation split "
        "at the optimal threshold. Final reported metrics are macro-averaged across five folds."
    ))

    # ── 4. Results ─────────────────────────────────────────────────────
    heading(doc, "4. Results and Discussion")
    subheading(doc, "4.1. Model Performance")
    body(doc, (
        "Table 1 reports 5-fold cross-validation results for all eleven models sorted by ROC-AUC. "
        "LightGBM achieved the highest ROC-AUC (0.9549) among all models. Deep MLP (512-256-128-64) "
        "achieved the highest accuracy (0.8849) and F1 (0.8596) overall, with AUC of 0.9537 — only "
        "0.001 below LightGBM. The 1D-CNN and Logistic Regression are the weakest performers, "
        "suggesting that raw temporal convolution without attention and linear models are insufficient "
        "for this task."
    ))

    # Table 1
    tbl1 = doc.add_table(rows=12, cols=6)
    tbl1.style = "Table Grid"
    table_row(tbl1, 0, ["Rank", "Model", "Type", "Accuracy", "F1", "ROC-AUC"],
              bold=True, bg="C99347")
    data = [
        (1,  "LightGBM",                    "ML", "0.8839", "0.8575", "0.9549"),
        (2,  "Deep MLP (512-256-128-64)",    "DL", "0.8849", "0.8596", "0.9537"),
        (3,  "XGBoost",                      "ML", "0.8735", "0.8402", "0.9463"),
        (4,  "Residual MLP (3 blocks)",      "DL", "0.8756", "0.8476", "0.9453"),
        (5,  "Gradient Boosting",            "ML", "0.8685", "0.8337", "0.9406"),
        (6,  "Random Forest",                "ML", "0.8604", "0.8183", "0.9393"),
        (7,  "Attention MLP",                "DL", "0.8628", "0.8293", "0.9356"),
        (8,  "SVM (RBF)",                    "ML", "0.8612", "0.8252", "0.9347"),
        (9,  "MLP Neural Network",           "ML", "0.8545", "0.8189", "0.9258"),
        (10, "Logistic Regression",          "ML", "0.7779", "0.7390", "0.8511"),
        (11, "1D-CNN",                       "DL", "0.7665", "0.7159", "0.8442"),
    ]
    for i, row_data in enumerate(data):
        bg = "F5F0E8" if i % 2 == 0 else "FFFFFF"
        table_row(tbl1, i + 1, row_data, bg=bg)
    caption(doc, "Table 1. 5-fold cross-validation results — 5,195 samples, 47 features, sorted by ROC-AUC.")

    figure(doc, "paper_model_comparison.png",
           "Figure 4. Performance comparison of all 11 models (Accuracy, F1, ROC-AUC) sorted by AUC.")

    figure(doc, "paper_roc_curves.png",
           "Figure 2. ROC curves for all 11 models under 5-fold cross-validation. "
           "Dashed diagonal: random chance (AUC=0.500).")

    subheading(doc, "4.2. DL Model Stability")
    body(doc, (
        "Table 2 reports fold-level AUC statistics for DL models. Deep MLP shows the lowest variance "
        "(std=0.0036), indicating robust cross-fold generalization. The 1D-CNN shows the highest "
        "variance (std=0.0087) alongside the lowest mean AUC, confirming its instability on this "
        "feature-vector task."
    ))

    # Table 2
    tbl2 = doc.add_table(rows=5, cols=8)
    tbl2.style = "Table Grid"
    table_row(tbl2, 0,
        ["Model", "F1", "F2", "F3", "F4", "F5", "Mean", "Std"],
        bold=True, bg="C99347")
    dl_data = [
        ("Deep MLP",      "0.9582", "0.9557", "0.9508", "0.9492", "0.9571", "0.9542", "±0.0036"),
        ("Residual MLP",  "0.9523", "0.9491", "0.9473", "0.9407", "0.9531", "0.9485", "±0.0044"),
        ("Attention MLP", "0.9318", "0.9461", "0.9379", "0.9320", "0.9316", "0.9359", "±0.0056"),
        ("1D-CNN",        "0.8583", "0.8645", "0.8589", "0.8394", "0.8502", "0.8543", "±0.0087"),
    ]
    for i, row_data in enumerate(dl_data):
        bg = "F5F0E8" if i % 2 == 0 else "FFFFFF"
        table_row(tbl2, i + 1, row_data, bg=bg)
    caption(doc, "Table 2. DL model AUC stability across 5 folds.")

    figure(doc, "paper_ml_vs_dl.png",
           "Figure 5. ML vs. DL model comparison across Accuracy, ROC-AUC, and F1 Score.")

    subheading(doc, "4.3. Feature Importance")
    body(doc, (
        "LightGBM feature importance analysis (Figure 7) identifies spectral_flatness_std (0.0619), "
        "spectral_contrast_mean (0.0467), rms_energy (0.0456), onset_strength_std (0.0388), and "
        "spectral_flatness_mean (0.0370) as the top discriminating features. Spectral flatness — "
        "measuring signal noisiness versus tonality — is the most discriminating single feature, "
        "suggesting AI generation systems produce systematically more tonal signals than human "
        "recordings which include room acoustics and natural noise."
    ))

    figure(doc, "paper_feature_importance.png",
           "Figure 7. Top 20 feature importances from LightGBM (normalized gain). "
           "Spectral flatness features dominate.")

    subheading(doc, "4.4. Confusion Matrix — LightGBM")
    body(doc, (
        "Figure 3 shows the confusion matrix for LightGBM using the Youden-optimal threshold "
        "(θ* = 0.4316). At this threshold, the model achieves 89.4% recall on AI-generated samples "
        "(true positive rate) with 87.4% precision."
    ))

    figure(doc, "paper_confusion_matrix_lightgbm.png",
           "Figure 3. Confusion matrix for LightGBM using Youden's J optimal threshold (θ*=0.4316). "
           "Values show sample counts and class percentages.")

    subheading(doc, "4.5. Calibration and Score Distribution")
    body(doc, (
        "The LightGBM model's calibration curve (Figure 9) shows near-perfect calibration across the "
        "probability range, with a Brier score of 0.083. This indicates that the reported P(AI) scores "
        "are reliable probability estimates rather than merely ranked scores, enabling threshold-based "
        "decision making with predictable precision-recall tradeoffs."
    ))

    figure(doc, "paper_score_distribution.png",
           "Figure 8. Predicted probability distribution P(AI) for human (green) and AI (red) samples. "
           "Dashed line marks the Youden-optimal decision threshold.")

    figure(doc, "paper_calibration.png",
           "Figure 9. Calibration curve for LightGBM — fraction of positives vs. mean predicted "
           "probability. Brier score = 0.083.")

    figure(doc, "paper_precision_recall.png",
           "Figure 10. Precision-recall curve for LightGBM with average precision (AP) score.")

    # ── 5. Discussion ──────────────────────────────────────────────────
    heading(doc, "5. Discussion")
    body(doc, (
        "The close performance between LightGBM (AUC=0.9549) and Deep MLP (AUC=0.9537) demonstrates "
        "that the 47 handcrafted acoustic features encode nearly all discriminative information available. "
        "Both model families operate on the same feature vectors, so feature engineering is the primary "
        "determinant of performance. The 1D-CNN's underperformance (AUC=0.8442) reflects an architectural "
        "mismatch: a 47-dimensional flat feature vector lacks the local temporal correlations that "
        "1D convolutions are designed to exploit."
    ))
    body(doc, (
        "Spectral flatness dominance is interpretable: AI generation systems optimize perceptual quality "
        "metrics favoring tonal richness, producing lower spectral flatness (more tonal) than human "
        "recordings. This is consistent with observations in audio deepfake detection literature where "
        "synthesized audio tends to be spectrally cleaner (Yi et al., 2023)."
    ))
    body(doc, (
        "The dataset spans 12+ AI architectures, achieving high AUC despite this diversity. This suggests "
        "the 47-feature representation captures generator-agnostic artifacts rather than generator-specific "
        "fingerprints — critical for deployment against unseen systems (Bhatt et al., 2025; "
        "Afchar et al., 2025)."
    ))
    body(doc, (
        "Limitations: (1) Short clips (<5 seconds) may yield unreliable tempo/vibrato estimates. "
        "(2) The fine-tuned wav2vec2 model lacks formal 5-fold CV metrics, limiting direct comparison "
        "with feature-based models. (3) Genre-stratified evaluation would provide more rigorous "
        "generalization assessment. (4) Adversarial robustness under MP3 compression and pitch shifting "
        "has not been evaluated (Afchar et al., 2025)."
    ))

    # ── 6. Conclusion ──────────────────────────────────────────────────
    heading(doc, "6. Conclusion")
    body(doc, (
        "This paper presented AURIS, an end-to-end AI music detection system combining 47 acoustic "
        "features with an eleven-model ensemble trained on 5,195 samples spanning 12+ AI generation "
        "architectures. The key findings are:"
    ))
    bullet(doc,
        "LightGBM achieves the highest ROC-AUC of 0.9549 among all tested models, closely followed "
        "by Deep MLP at 0.9537.")
    bullet(doc,
        "Spectral flatness is the single most discriminating feature, reflecting systematic tonal "
        "differences between AI-generated and human-composed music.")
    bullet(doc,
        "Youden's J threshold optimization (θ*=0.4316) consistently outperforms the naive 0.5 "
        "threshold under the 1:1.5 class imbalance.")
    bullet(doc,
        "The LightGBM model is well-calibrated (Brier score=0.083), making P(AI) scores "
        "interpretable as probabilities.")
    body(doc, (
        "Future work will focus on: (1) formal cross-generator held-out evaluation on SONICS and "
        "FakeMusicCaps datasets, (2) wav2vec2 5-fold CV integration, "
        "(3) adversarial robustness testing against audio manipulations, and "
        "(4) dataset expansion to 10,000+ samples including emerging generation systems."
    ))

    # ── Author Contributions ───────────────────────────────────────────
    heading(doc, "Author Contributions")
    body(doc, (
        "Hasan Arthur Altuntaş: Conceptualization, methodology, software, data curation, "
        "formal analysis, investigation, writing (original draft), writing (review and editing), "
        "visualization."
    ))

    # ── AI Disclosure ──────────────────────────────────────────────────
    heading(doc, "AI Disclosure")
    body(doc, (
        "Portions of the code implementation and manuscript drafting were assisted by Claude "
        "(Anthropic), an AI language model. All experimental design, dataset curation, model "
        "evaluation, result interpretation, and final editorial decisions were made by the author. "
        "This disclosure is provided in accordance with the journal's AI use policy."
    ))

    # ── Acknowledgement ────────────────────────────────────────────────
    heading(doc, "Acknowledgement")
    body(doc, "This research received no external funding.")

    # ── Conflict of Interest ───────────────────────────────────────────
    heading(doc, "Conflict of Interest")
    body(doc, "The authors declare no conflict of interest.")

    # ── References ─────────────────────────────────────────────────────
    heading(doc, "References")

    refs = [
        "Afchar, D., Meseguer Brocal, G., & Hennequin, R. (2025). AI-generated music detection and "
        "its challenges. In Proceedings of IEEE ICASSP 2025. IEEE. "
        "https://doi.org/10.48550/arXiv.2501.10111",

        "Baevski, A., Zhou, Y., Mohamed, A., & Auli, M. (2020). wav2vec 2.0: A framework for "
        "self-supervised learning of speech representations. Advances in Neural Information "
        "Processing Systems, 33, 12449-12460. https://doi.org/10.5555/3495724.3496768",

        "Bhatt, A., Rajan, A., et al. (2025). AI-generated music detection: A survey of methods and "
        "datasets. arXiv preprint arXiv:2501.10111. https://doi.org/10.48550/arXiv.2501.10111",

        "Copet, J., Kreuk, F., Gat, I., Remez, T., Kant, D., Synnaeve, G., Adi, Y., & Défossez, A. "
        "(2023). Simple and controllable music generation. Advances in Neural Information Processing "
        "Systems, 36. https://doi.org/10.48550/arXiv.2306.05284",

        "Elizalde, B., Deshmukh, S., Al Ismail, M., & Wang, H. (2023). CLAP: Learning audio concepts "
        "from natural language supervision. Proceedings of ICASSP 2023 (pp. 1-5). IEEE. "
        "https://doi.org/10.1109/ICASSP49357.2023.10095889",

        "Frank, J., & Schönherr, L. (2021). WaveFake: A data set to facilitate audio deepfake "
        "detection. NeurIPS 2021 Datasets and Benchmarks Track. "
        "https://doi.org/10.5281/zenodo.5642694",

        "Gan, R., Huang, T., Shao, J., & Wang, F. (2024). Music genre classification based on "
        "VMD-IWOA-XGBoost. Mathematics, 12(10), 1549. https://doi.org/10.3390/math12101549",

        "Gourisaria, M. K., Agrawal, R., & Sahni, M. (2024). Comparative analysis of audio "
        "classification with MFCC and STFT features using machine learning techniques. "
        "Discover Internet of Things, 4, Article 1. https://doi.org/10.1007/s43926-023-00049-y",

        "Kosta, K., Meseguer Brocal, G., Afchar, D., & Hennequin, R. (2025). Segment Transformer: "
        "AI-generated music detection via music structural analysis. arXiv preprint arXiv:2509.08283. "
        "https://doi.org/10.48550/arXiv.2509.08283",

        "Kostrzewa, D., Mazur, W., & Brzeski, R. (2022). Wide ensembles of neural networks in "
        "music genre classification. Proceedings of MISSI 2022, Lecture Notes in Networks and "
        "Systems (pp. 91-102). Springer. https://doi.org/10.1007/978-3-031-08754-7_9",

        "Liu, H., Chen, Z., Yuan, Y., Mei, X., Liu, X., Mandic, D., Wang, W., & Plumbley, M. D. "
        "(2023). AudioLDM: Text-to-audio generation with latent diffusion models. "
        "Proceedings of ICML 2023. https://doi.org/10.48550/arXiv.2301.12503",

        "Liu, Y., et al. (2024). From audio deepfake detection to AI-generated music detection: "
        "A pathway and overview. arXiv preprint arXiv:2412.00571. "
        "https://doi.org/10.48550/arXiv.2412.00571",

        "Liu, Y., Yin, Y., Zhu, Q., & Cui, W. (2022). Musical instrument recognition by XGBoost "
        "combining feature fusion. arXiv preprint arXiv:2206.00901. "
        "https://doi.org/10.48550/arXiv.2206.00901",

        "Martín-Doñas, J. M., & Álvarez, A. (2022). The Vicomtech audio deepfake detection system "
        "based on Wav2vec2 for the 2022 ADD challenge. Proceedings of ICASSP 2022 (pp. 9266-9270). "
        "IEEE. https://doi.org/10.1109/ICASSP43922.2022.9747768",

        "Wu, Y., Chen, K., Zhang, T., Hui, Y., Berg-Kirkpatrick, T., & Dubnov, S. (2023). "
        "Large-scale contrastive language-audio pretraining with feature fusion and keyword-to-caption "
        "augmentation. Proceedings of ICASSP 2023 (pp. 1-5). IEEE. "
        "https://doi.org/10.1109/ICASSP49357.2023.10095969",

        "Yi, J., Fu, R., Tao, J., Nie, S., Ma, H., Wang, C., Wang, T., Tian, Z., Bai, Y., & Fan, C. "
        "(2022). ADD 2022: The first audio deep synthesis detection challenge. "
        "Proceedings of ICASSP 2022 (pp. 9216-9220). IEEE. "
        "https://doi.org/10.1109/ICASSP43922.2022.9746939",

        "Yi, J., Wang, C., Tao, J., Zhang, X., Zhang, C. Y., & Zhao, Y. (2023). Audio deepfake "
        "detection: A survey. arXiv preprint arXiv:2308.14970. "
        "https://doi.org/10.48550/arXiv.2308.14970",
    ]

    for ref in refs:
        reference_entry(doc, ref)

    doc.save(str(OUT))
    print(f"Saved: {OUT} ({OUT.stat().st_size // 1024} KB)")
    print(f"Figures embedded from: {FIGURES}")


if __name__ == "__main__":
    build()
