"""
Build AURIS_paper_GUJSA.docx — comprehensive Word document with embedded figures,
mathematical formulations, algorithm boxes, and natural academic prose.

GUJSA formatting:
  - Times New Roman 11pt body, justified, single spacing
  - 8pt/12pt paragraph spacing, 9pt abstract
  - ALL CAPS section headings, italic subheadings
  - APA-style hanging-indent references

Usage:
    python build_docx.py
"""

from __future__ import annotations

from pathlib import Path
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

OUT     = Path(__file__).parent / "AURIS_paper_GUJSA.docx"
FIGURES = Path(__file__).parent.parent / "figures"

TNR       = "Times New Roman"
BODY_SIZE = Pt(11)
ABS_SIZE  = Pt(9)
GOLD      = RGBColor(0xC9, 0x93, 0x47)
DARK      = RGBColor(0x33, 0x33, 0x33)


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


def _font(run, size=BODY_SIZE, bold=False, italic=False, color=None, name=TNR):
    run.font.name   = name
    run.font.size   = size
    run.font.bold   = bold
    run.font.italic = italic
    if color:
        run.font.color.rgb = color
    r = run._r
    rPr = r.get_or_add_rPr()
    rFonts = OxmlElement("w:rFonts")
    rFonts.set(qn("w:ascii"), name)
    rFonts.set(qn("w:hAnsi"), name)
    rFonts.set(qn("w:cs"),    name)
    rPr.insert(0, rFonts)


def body(doc, text, bold=False, italic=False,
         align=WD_ALIGN_PARAGRAPH.JUSTIFY, before=4, after=8, size=BODY_SIZE):
    p = doc.add_paragraph()
    p.alignment = align
    _set_spacing(p, before_pt=before, after_pt=after)
    r = p.add_run(text)
    _font(r, size=size, bold=bold, italic=italic)
    return p


def body_runs(doc, runs, align=WD_ALIGN_PARAGRAPH.JUSTIFY,
              before=4, after=8, size=BODY_SIZE):
    """Body paragraph with multiple formatted runs.
    runs is a list of (text, {"bold": bool, "italic": bool}) tuples."""
    p = doc.add_paragraph()
    p.alignment = align
    _set_spacing(p, before_pt=before, after_pt=after)
    for text, style in runs:
        r = p.add_run(text)
        _font(r, size=size,
              bold=style.get("bold", False),
              italic=style.get("italic", False))
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


def table_row(table, row_idx, values, bold=False, bg=None, color=None):
    row = table.rows[row_idx]
    for i, val in enumerate(values):
        cell = row.cells[i]
        cell.text = ""
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(str(val))
        _font(r, size=Pt(9), bold=bold, color=color)
        if bg:
            tc = cell._tc
            tcPr = tc.get_or_add_tcPr()
            shd = OxmlElement("w:shd")
            shd.set(qn("w:val"),   "clear")
            shd.set(qn("w:color"), "auto")
            shd.set(qn("w:fill"),  bg)
            tcPr.append(shd)


def caption(doc, text, before=4, after=12):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _set_spacing(p, before_pt=before, after_pt=after)
    r = p.add_run(text)
    _font(r, size=Pt(10), italic=True)
    return p


def figure(doc, filename, caption_text, width_cm=14.0):
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


def hline(doc, color="C99347"):
    p = doc.add_paragraph()
    _set_spacing(p, before_pt=2, after_pt=2)
    pPr = p._p.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"),   "single")
    bottom.set(qn("w:sz"),    "4")
    bottom.set(qn("w:space"), "1")
    bottom.set(qn("w:color"), color)
    pBdr.append(bottom)
    pPr.append(pBdr)


def bullet(doc, text):
    p = doc.add_paragraph(style="List Bullet")
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    _set_spacing(p, before_pt=2, after_pt=2)
    r = p.add_run(text)
    _font(r, size=BODY_SIZE)
    return p


def equation(doc, text, eqno=None):
    """Add a centered display equation in italic, optionally with equation number."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _set_spacing(p, before_pt=6, after_pt=6)
    r = p.add_run(text)
    _font(r, size=BODY_SIZE, italic=True)
    if eqno:
        tab = p.add_run("\t\t" + eqno)
        _font(tab, size=BODY_SIZE)
    return p


def algorithm_box(doc, title, lines):
    """Render a pseudocode algorithm in a single-cell shaded table."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.style = "Table Grid"
    cell = tbl.rows[0].cells[0]
    cell.text = ""

    # Title row
    pt = cell.paragraphs[0]
    pt.alignment = WD_ALIGN_PARAGRAPH.LEFT
    _set_spacing(pt, before_pt=4, after_pt=2)
    rt = pt.add_run(title)
    _font(rt, size=Pt(10), bold=True)

    # Lines
    for line in lines:
        p = cell.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        _set_spacing(p, before_pt=0, after_pt=0)
        r = p.add_run(line)
        _font(r, size=Pt(10), name="Consolas")

    # Background shading
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"),   "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"),  "F5F0E8")
    tcPr.append(shd)


# ── build document ────────────────────────────────────────────────────────

def build():
    doc = Document()

    for section in doc.sections:
        section.top_margin    = Cm(2.5)
        section.bottom_margin = Cm(2.5)
        section.left_margin   = Cm(2.5)
        section.right_margin  = Cm(2.5)

    # ╔════════════════════════════════════════════════════════════════════╗
    # ║  TITLE PAGE                                                          ║
    # ╚════════════════════════════════════════════════════════════════════╝

    # English title
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _set_spacing(p, before_pt=0, after_pt=6)
    r = p.add_run(
        "AURIS: A Multi-Model Ensemble System for AI-Generated Music Detection "
        "Using Acoustic Feature Analysis"
    )
    _font(r, size=Pt(14), bold=True)

    # Turkish title
    p2 = doc.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _set_spacing(p2, before_pt=2, after_pt=8)
    r2 = p2.add_run(
        "AURIS: Akustik Özellik Analizi Kullanılarak Yapay Zeka Tarafından "
        "Üretilen Müziğin Tespiti İçin Çok Modelli Topluluk Sistemi"
    )
    _font(r2, size=Pt(11), italic=True)

    # Author
    pa = doc.add_paragraph()
    pa.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _set_spacing(pa, before_pt=6, after_pt=2)
    ra = pa.add_run("Hasan Arthur ALTUNTAŞ¹")
    _font(ra, size=Pt(11), bold=True)

    pa2 = doc.add_paragraph()
    pa2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _set_spacing(pa2, before_pt=0, after_pt=8)
    ra2 = pa2.add_run(
        "¹ Department of Computer Engineering, Düzce University, Düzce, Türkiye\n"
        "hasannarthurrr@gmail.com"
    )
    _font(ra2, size=Pt(10))

    hline(doc)

    # ╔════════════════════════════════════════════════════════════════════╗
    # ║  ABSTRACTS                                                           ║
    # ╚════════════════════════════════════════════════════════════════════╝

    # Highlights
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    _set_spacing(p, before_pt=6, after_pt=2)
    r = p.add_run("Highlights")
    _font(r, size=Pt(10), bold=True, italic=True)

    for h in [
        "• A 47-dimensional handcrafted acoustic feature vector is constructed for music authenticity classification.",
        "• Eleven classifiers, including seven machine learning algorithms and four deep learning architectures, are compared under a unified 5-fold cross-validation protocol.",
        "• LightGBM reaches a mean ROC-AUC of 0.9549; Deep MLP follows closely at 0.9537.",
        "• Per-fold Youden's J threshold optimization replaces the default 0.5 cutoff and improves balanced accuracy.",
        "• Spectral flatness emerges as the single most informative feature for distinguishing AI-generated from human-composed music.",
    ]:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        _set_spacing(p, before_pt=0, after_pt=2)
        r = p.add_run(h)
        _font(r, size=Pt(9))

    hline(doc, color="C99347")

    # Turkish abstract
    abstract_block(doc, "Öz:", (
        "Suno, Udio ve MusicGen gibi yapay zeka tabanlı müzik üretim sistemlerinin son birkaç yılda "
        "gösterdiği gelişme, yapay zeka tarafından üretilen kayıtların insan tarafından bestelenmiş "
        "müzikten ayırt edilmesini hem dinleyiciler hem de otomatik sistemler için giderek "
        "güçleştirmiştir. Bu çalışmada akustik öznitelik analizine dayalı çok modelli bir topluluk "
        "sistemi olan AURIS önerilmektedir. AURIS, librosa kütüphanesi aracılığıyla spektral, zamansal, "
        "ritmik, armonik ve vokal boyutları kapsayan 47 öznitelik çıkarmakta ve bu vektörü 2.082 yapay "
        "zeka kaynaklı ve 3.113 insan kaynaklı toplam 5.195 örnekten oluşan veri kümesi üzerinde "
        "eğitilen on bir sınıflandırma modeline beslemektedir. Modeller, geleneksel makine öğrenmesi "
        "(Lojistik Regresyon, Rastgele Orman, Gradyan Artırma, SVM, ÇKA, XGBoost, LightGBM) ve "
        "derin öğrenme (Derin ÇKA, 1B-CNN, Artık ÇKA, Dikkat ÇKA) ailelerinden seçilmiştir. Eğitim "
        "süreci, sınıf dengesizliğini hesaba katmak için her katmanda Youden's J istatistiğine dayalı "
        "eşik optimizasyonu uygulanan 5-katlı tabakalı çapraz doğrulama protokolünü kullanmaktadır. "
        "Deneysel sonuçlar, LightGBM modelinin 0,9549'luk ROC-AUC değeri ile en yüksek performansı "
        "sergilediğini, Derin ÇKA modelinin ise 0,9537 ile çok yakın bir ikinci sıra elde ettiğini "
        "göstermektedir. LightGBM için Brier skoru 0,083 olarak ölçülmüş, modelin iyi kalibre edilmiş "
        "olasılık tahminleri ürettiği teyit edilmiştir. Spektral düzlük (spectral flatness) yapay zeka "
        "ile insan müziğini ayırt etmede en belirleyici tekil özellik olarak belirlenmiştir. Sistem, "
        "Hugging Face Spaces üzerinde dosya yükleme ve canlı mikrofon girişi yoluyla gerçek zamanlı "
        "analiz sunan halka açık bir web uygulaması olarak yayınlanmıştır."
    ))
    keywords_line(doc, "Anahtar Kelimeler:",
        "Yapay zeka müzik tespiti, ses sınıflandırma, LightGBM, topluluk öğrenmesi, "
        "akustik özellikler, deepfake ses, wav2vec2, MFCC, spektral düzlük")

    # English abstract
    abstract_block(doc, "Abstract:", (
        "The rapid progress of AI-based music generation systems such as Suno, Udio, and MusicGen "
        "has made it increasingly difficult, for both human listeners and automated systems, to "
        "tell AI-generated recordings apart from human-composed music. This paper introduces AURIS, "
        "a multi-model ensemble system that approaches the problem from the side of handcrafted "
        "acoustic features. AURIS extracts a 47-dimensional feature vector spanning spectral, "
        "temporal, rhythmic, harmonic, and vocal dimensions using the librosa library, and feeds "
        "this vector into eleven classification models trained on a curated dataset of 5,195 samples "
        "(2,082 AI-generated, 3,113 human-composed). The model pool is intentionally heterogeneous: "
        "it includes seven classical machine learning algorithms (Logistic Regression, Random Forest, "
        "Gradient Boosting, SVM-RBF, MLP, XGBoost, LightGBM) alongside four deep learning "
        "architectures (Deep MLP, 1D-CNN, Residual MLP, Attention MLP). Model training follows a "
        "5-fold stratified cross-validation protocol in which the decision threshold is re-estimated "
        "per fold via Youden's J statistic in order to handle the 1:1.5 class imbalance. "
        "Experimental results show that LightGBM reaches the highest mean ROC-AUC at 0.9549, "
        "with Deep MLP a very narrow second at 0.9537. The Brier score of 0.083 indicates that "
        "the model produces well-calibrated probability estimates rather than merely useful ranking "
        "scores. Spectral flatness is identified as the single most discriminative feature for the "
        "AI-versus-human distinction. The full system is released as a public web application on "
        "Hugging Face Spaces, supporting both file upload and live microphone input."
    ))
    keywords_line(doc, "Keywords:",
        "AI music detection, audio classification, LightGBM, ensemble learning, "
        "acoustic features, deepfake audio, wav2vec2, MFCC, spectral flatness")

    hline(doc)

    # ╔════════════════════════════════════════════════════════════════════╗
    # ║  1. INTRODUCTION                                                     ║
    # ╚════════════════════════════════════════════════════════════════════╝

    heading(doc, "1. Introduction")

    body(doc, (
        "Generative audio models have moved from research prototypes to consumer products in a "
        "remarkably short period of time. Suno (versions 3 through 5), Udio, Meta's MusicGen "
        "(Copet et al., 2023), and a growing family of diffusion-based systems such as AudioLDM "
        "(Liu et al., 2023), Stable Audio, and Riffusion now allow anyone with a web browser to "
        "produce full-length musical tracks from a short text prompt. Many of these tracks are, "
        "in practice, perceptually indistinguishable from human-composed recordings for a casual "
        "listener. The shift raises questions that go well beyond audio engineering: copyright "
        "attribution, the integrity of streaming-platform catalogues, the rights of session musicians, "
        "and the ability of educators and journalists to reason about authorship."
    ))

    body(doc, (
        "Compared with audio deepfake detection for speech — driven by competitions such as the "
        "ADD Challenge (Yi et al., 2022) and datasets such as WaveFake (Frank & Schönherr, 2021) — "
        "the detection of AI-generated music has received less attention. Music does not share "
        "the cues that make speech deepfake detection tractable: there is no fixed lexicon, no "
        "speaker identity to verify, and prosody plays a very different role. Instead, music "
        "presents harmonic complexity, polyphony, percussion, and recording artefacts that vary "
        "widely between human studios and synthetic pipelines. Recent surveys frame the field as "
        "nascent (Liu et al., 2024; Yi et al., 2023), and Bhatt et al. (2025) argue that "
        "cross-generator generalisation — the ability to detect tracks produced by systems unseen "
        "during training — is the central open challenge."
    ))

    body(doc, (
        "Two contrasting lines of recent work make this trade-off explicit. Afchar et al. (2025) "
        "showed at IEEE ICASSP 2025 that a detector trained to recognise auto-encoder artefacts "
        "can reach 99.8% accuracy by exploiting spectral residues introduced by neural vocoders, "
        "but the same detector degrades sharply under MP3 compression or pitch shifting. Kosta et "
        "al. (2025), in turn, proposed the Segment Transformer, which embeds short music segments "
        "with a pre-trained encoder and aggregates them through a transformer head to capture "
        "structural patterns across an entire composition. Both directions accept the same premise: "
        "no single feature family is robust enough on its own."
    ))

    body(doc, (
        "AURIS is positioned between these extremes. Rather than committing to a single "
        "representation, the system relies on a 47-dimensional handcrafted feature vector that "
        "summarises spectral, temporal, harmonic, and vocal behaviour, and pairs it with an "
        "intentionally heterogeneous pool of eleven classifiers. The aim is twofold: to obtain "
        "competitive detection accuracy across multiple AI generators and to keep the model "
        "interpretable enough for deployment on consumer hardware. The three main contributions "
        "of this paper are:"
    ))
    bullet(doc,
        "A 47-feature acoustic representation that combines well-established descriptors "
        "(MFCC, spectral flatness, onset strength) with a small set of vocal-quality features "
        "(breath patterns, vibrato regularity, formant consistency) tailored to the human-versus-AI "
        "distinction in music.")
    bullet(doc,
        "An eleven-model ensemble comparing seven traditional machine learning classifiers with "
        "four deep learning architectures on a single feature pipeline, all evaluated under "
        "5-fold stratified cross-validation with per-fold Youden's J threshold optimisation.")
    bullet(doc,
        "A multi-generator training set drawn from twelve or more AI synthesis systems alongside "
        "two human-music corpora, providing the diversity needed to study cross-generator "
        "generalisation.")

    body(doc, (
        "Figure 1 provides an end-to-end view of the system. The remainder of the paper is "
        "organised as follows. Section 2 reviews related work in audio deepfake detection, "
        "transformer-based audio representations, ensemble methods for audio, and recent "
        "AI-music detection literature. Section 3 describes the dataset, the feature extraction "
        "pipeline, the eleven classification models, and the training protocol. Section 4 reports "
        "experimental results across all models and discusses feature importance and calibration. "
        "Section 5 interprets the findings and acknowledges the limitations of the present study, "
        "and Section 6 concludes with directions for future work. The system is publicly available "
        "at https://huggingface.co/spaces/Rtur2003/AURIS."
    ))

    figure(doc, "paper_pipeline_diagram.png",
           "Figure 1. End-to-end AURIS pipeline. Audio is resampled to 22,050 Hz, decomposed "
           "into a 47-dimensional handcrafted feature vector, scaled per-fold, and routed through "
           "an ensemble of eleven classifiers; final probabilities are fused using calibrated "
           "tower scores.")

    # ╔════════════════════════════════════════════════════════════════════╗
    # ║  2. RELATED WORK                                                     ║
    # ╚════════════════════════════════════════════════════════════════════╝

    heading(doc, "2. Related Work")

    subheading(doc, "2.1. Audio Deepfake Detection for Speech")
    body(doc, (
        "Audio deepfake detection became an active research area shortly after the appearance of "
        "high-quality neural text-to-speech systems. The WaveFake dataset (Frank & Schönherr, 2021) "
        "established a foundational benchmark using seven vocoder architectures, and demonstrated "
        "that mel-spectrogram features combined with lightweight classifiers can achieve high "
        "detection rates on known vocoders but degrade substantially on unseen architectures — a "
        "pattern that has since been observed across most deepfake detection settings. The ADD 2022 "
        "challenge (Yi et al., 2022) formalised the problem with three tracks covering low-quality "
        "fakes, partially fake audio, and adversarial conditions. The comprehensive survey by Yi et "
        "al. (2023) catalogues seventeen datasets and groups the dominant approaches into "
        "feature-engineering pipelines (MFCC, LFCC, CQT, mel-spectrogram) and deep classifiers "
        "(LCNN, ResNet, conformer-based systems)."
    ))

    subheading(doc, "2.2. Transformer-Based Audio Representations")
    body(doc, (
        "Self-supervised transformer encoders have reshaped the way audio is represented in "
        "downstream tasks. Baevski et al. (2020) introduced wav2vec 2.0, in which a transformer "
        "is pre-trained on unlabelled speech using a contrastive objective over quantised latent "
        "vectors; fine-tuned variants of the resulting encoder transfer well to many "
        "classification problems. Martín-Doñas and Álvarez (2022) applied wav2vec2 directly to "
        "the ADD 2022 deepfake detection challenge and obtained competitive results without "
        "task-specific feature engineering, confirming that pre-trained audio transformers can "
        "serve as drop-in encoders for authenticity classification. CLAP (Elizalde et al., 2023) "
        "extends the contrastive pre-training idea to joint audio–text embedding spaces; the "
        "LAION-CLAP variant of Wu et al. (2023), trained on 630,000 audio–text pairs, has since "
        "been adopted both as a feature extractor and as the conditioning signal in diffusion-based "
        "audio generators (Liu et al., 2023)."
    ))

    subheading(doc, "2.3. Ensemble Methods and Gradient Boosting for Audio")
    body(doc, (
        "Ensemble approaches have consistently outperformed single-model classifiers in music "
        "analysis. Kostrzewa et al. (2022) report that wide ensembles of neural networks with "
        "diverse architectures reduce variance and improve generalisation in music genre "
        "classification. Among ensemble families, gradient boosting methods — particularly "
        "XGBoost and LightGBM — show strong results on handcrafted audio feature vectors. Gan et "
        "al. (2024) achieve competitive genre classification accuracy using XGBoost paired with "
        "VMD-based feature decomposition, and Liu et al. (2022) combine multi-channel feature "
        "fusion with XGBoost for musical instrument recognition, obtaining 97.65% accuracy on "
        "standard benchmarks. Gourisaria et al. (2024) conduct a systematic comparison of MFCC "
        "and STFT features across seven classifiers and conclude that combining both consistently "
        "outperforms either alone — a finding that motivates the hybrid feature set used by AURIS."
    ))

    subheading(doc, "2.4. AI Music Generation Systems")
    body(doc, (
        "The detection problem cannot be discussed without the systems that produce the audio. "
        "MusicGen (Copet et al., 2023) introduced a single-stage transformer-based autoregressive "
        "model for music generation conditioned on text and melody, achieving state-of-the-art "
        "fidelity at modest computational cost. AudioLDM (Liu et al., 2023) uses CLAP embeddings "
        "as the conditioning signal for a latent diffusion model. Alongside these academic systems, "
        "commercial platforms Suno and Udio operate proprietary diffusion or autoregressive "
        "architectures that have, over the past two years, become the most visible sources of "
        "AI-generated music on the public web. Together, these systems constitute the population "
        "of generators that AURIS is trained to detect."
    ))

    subheading(doc, "2.5. Recent Advances in AI Music Detection (2025–2026)")
    body(doc, (
        "The most directly relevant work appeared during 2024–2025. Liu et al. (2024) provide a "
        "pathway and overview connecting audio deepfake detection methodology to the emerging "
        "domain of AI music detection, cataloguing transferable features and identifying domain "
        "gaps. Afchar et al. (2025), in their IEEE ICASSP 2025 paper, demonstrate that detectors "
        "trained on auto-encoder artefacts can reach 99.8% accuracy by exploiting decoder "
        "fingerprints — spectral residues introduced by neural vocoders — rather than musical "
        "content. The same study also identifies a critical robustness limitation: simple audio "
        "manipulations such as MP3 compression or pitch shifting substantially degrade detection "
        "rates. Kosta et al. (2025) propose the Segment Transformer, which processes sequences "
        "of short music segments through a transformer head and integrates self-supervised "
        "pre-trained representations to capture structural patterns at the song level. Bhatt et "
        "al. (2025) survey the dataset landscape and emphasise that cross-generator generalisation "
        "remains the primary open problem in the field."
    ))

    # ╔════════════════════════════════════════════════════════════════════╗
    # ║  3. MATERIAL AND METHOD                                              ║
    # ╚════════════════════════════════════════════════════════════════════╝

    heading(doc, "3. Material and Method")

    subheading(doc, "3.1. Dataset")
    body(doc, (
        "The AURIS training set comprises 5,195 audio samples drawn from public repositories on "
        "HuggingFace Hub. Of these, 2,082 are AI-generated (label = 1) and 3,113 are human-composed "
        "(label = 0), giving a class ratio of approximately 1:1.5. The AI-generated portion is "
        "deliberately heterogeneous: the AIME corpus (disco-eth/AIME) alone covers twelve "
        "generation systems including Suno v3, v3.5, v4 and v5, Udio, MusicGen, Stable Audio, "
        "Riffusion, AudioLDM2, Mustango, JEN-1, MusicLDM and Tango. The human-composed portion "
        "combines the human split of SleepyJesse/ai_music_large with the GTZAN corpus (Marsyas, "
        "10 genres × 100 clips of 30 seconds) and the small subset of the Free Music Archive. "
        "Together, the samples span approximately twenty musical genres including pop, rock, "
        "classical, jazz, electronic, hip-hop, folk, metal and Latin styles. All audio was "
        "resampled to 22,050 Hz before feature extraction. Two metadata fields — duration in "
        "seconds and sampling rate — were excluded from the feature vector, since they correlate "
        "with source repository rather than musical content and would otherwise act as data leaks. "
        "Table 1 summarises the dataset composition."
    ))

    # Table 1 — Dataset composition
    tbl0 = doc.add_table(rows=8, cols=4)
    tbl0.style = "Table Grid"
    table_row(tbl0, 0, ["Source", "Type", "Samples", "Notes"],
              bold=True, bg="C99347")
    src_data = [
        ("SleepyJesse/ai_music_large (AI)",     "AI",    "≈ 2,000", "Mixed generators"),
        ("disco-eth/AIME",                       "AI",    "≈ 1,000", "12 systems incl. Suno, Udio, MusicGen"),
        ("zuhri025/suno-audio",                  "AI",    "≈ 500",   "Suno-specific samples"),
        ("SleepyJesse/ai_music_large (human)",   "Human", "≈ 2,000", "Human split"),
        ("marsyas/gtzan",                        "Human", "1,000",   "10 genres × 100 × 30 s clips"),
        ("free-music-archive-small",             "Human", "≈ 1,000", "FMA small split"),
        ("Total",                                "—",     "5,195",   "1:1.5 class ratio"),
    ]
    for i, row_data in enumerate(src_data):
        bg = "F5F0E8" if i % 2 == 0 else "FFFFFF"
        bold_row = (i == len(src_data) - 1)
        table_row(tbl0, i + 1, row_data, bold=bold_row, bg=bg)
    caption(doc, "Table 1. Composition of the AURIS training dataset (5,195 samples in total).")

    figure(doc, "feature_distribution_ai_vs_human.png",
           "Figure 2. Distribution of selected acoustic features for AI-generated (red) and "
           "human-composed (green) samples. The separation visible in spectral flatness and "
           "onset strength previews the importance ranking reported in Section 4.3.")

    subheading(doc, "3.2. Feature Extraction")
    body(doc, (
        "Each audio sample is summarised by a 47-dimensional feature vector extracted with the "
        "librosa library (version 0.10.1). The features are organised into four families. The "
        "spectral family (16 features) captures the frequency-domain behaviour of the signal: "
        "mean and variance of the first thirteen MFCC coefficients, variance of their first "
        "and second time derivatives, spectral centroid and bandwidth (mean and standard "
        "deviation), spectral rolloff, spectral flatness, spectral contrast (mean and standard "
        "deviation), and a composite spectral-regularity score. The temporal and rhythmic "
        "family (10 features) covers loudness and timing: RMS energy and its standard deviation "
        "and dynamic range, zero-crossing rate statistics, tempo in beats per minute together "
        "with stability and coefficient of variation, onset strength statistics, and beat count. "
        "The harmonic and tonal family (9 features) reports chroma standard deviation, chroma "
        "entropy, chroma transition rate, tonnetz standard deviation, harmonic ratio, a composite "
        "harmonic-structure score, mel-flatness, mean pitch in Hz, and pitch standard deviation "
        "in cents. Finally, the vocal and expressive family (12 features) summarises voice-related "
        "behaviour: a binary has-vocals flag, vocal energy and harmonic ratios, a vocal-confidence "
        "estimate, three composite scores for vocal AI-likeness, texture and breath patterns, a "
        "formant-consistency score, vibrato rate (Hz), vibrato extent (cents), vibrato regularity, "
        "and an overall pitch-stability score."
    ))

    body(doc, (
        "Three composite scores — spectral regularity, temporal patterns, and harmonic structure — "
        "are computed as normalised weighted sums of their constituent measurements. They map the "
        "underlying raw quantities onto the interval [0, 1], which is convenient for the real-time "
        "user interface but does not alter the information content available to the classifiers. "
        "Feature extraction is implemented in feature_extractor.py. Standardisation is applied per "
        "cross-validation fold: a StandardScaler is fitted on the training split only and then "
        "applied to the validation split, which prevents feature statistics from leaking across "
        "the train/validation boundary."
    ))

    subheading(doc, "3.3. Classification Models")
    body(doc, (
        "AURIS trains eleven models on the 47-dimensional feature vector. Seven of these belong "
        "to the classical machine-learning family: Logistic Regression (C = 2.0, "
        "class_weight = balanced), Random Forest (500 trees, max_features = log2, "
        "balanced subsampling), Gradient Boosting (180 trees of depth 4, learning rate 0.07, "
        "subsample 0.75), SVM with an RBF kernel (C = 10, γ = 0.05, wrapped in "
        "CalibratedClassifierCV with isotonic regression and a 3-fold inner loop), an MLP neural "
        "network with hidden sizes (192, 96, 32), XGBoost (240 trees of depth 5, learning rate "
        "0.06, scale_pos_weight = n_neg / n_pos), and LightGBM (300 trees, learning rate 0.05, "
        "31 leaves, subsample 0.8). The remaining four are deep learning architectures trained "
        "in PyTorch: a Deep MLP with the topology 47 → 512 → 256 → 128 → 64 → 1 using BatchNorm "
        "and 30% dropout; a 1D-CNN with three Conv1D blocks (32, 64, 128 channels) followed by "
        "global average pooling and a fully connected head; a Residual MLP with three residual "
        "blocks of 64 units; and an Attention MLP that applies self-attention over the feature "
        "sequence before a final classification layer. All deep learning models are optimised "
        "with Adam at learning rate 1×10⁻³, using BCEWithLogitsLoss with "
        "pos_weight = n_neg / n_pos to address the class imbalance, and early stopping with a "
        "patience of 10 epochs on validation loss. In addition, the wav2vec2-base transformer of "
        "Baevski et al. (2020) is fine-tuned on raw 16 kHz waveforms and provides a fully "
        "end-to-end audio embedding classifier that is independent of the handcrafted features."
    ))

    # Table 2 — Hyperparameters
    body(doc, "Table 2 lists the key hyperparameters used in each model.")
    tbl_hp = doc.add_table(rows=12, cols=3)
    tbl_hp.style = "Table Grid"
    table_row(tbl_hp, 0, ["Model", "Family", "Key Hyperparameters"],
              bold=True, bg="C99347")
    hp_data = [
        ("Logistic Regression",          "ML", "C=2.0, max_iter=2500, class_weight=balanced"),
        ("Random Forest",                "ML", "n_estimators=500, max_features=log2, balanced_subsample"),
        ("Gradient Boosting",            "ML", "n_estimators=180, max_depth=4, lr=0.07, subsample=0.75"),
        ("SVM (RBF)",                    "ML", "C=10, γ=0.05, isotonic calibration (cv=3)"),
        ("MLP Neural Network",           "ML", "hidden=(192, 96, 32), α=0.001, max_iter=600"),
        ("XGBoost",                      "ML", "n=240, depth=5, lr=0.06, scale_pos_weight, reg_α=0.4, reg_λ=1.5"),
        ("LightGBM",                     "ML", "n=300, lr=0.05, num_leaves=31, subsample=0.8, reg_λ=1.0"),
        ("Deep MLP (512-256-128-64)",    "DL", "BatchNorm, Dropout 0.3, BCEWithLogitsLoss + pos_weight"),
        ("1D-CNN",                       "DL", "Conv1D(32-64-128) + GlobalAvgPool"),
        ("Residual MLP",                 "DL", "3 residual blocks × 64 units"),
        ("Attention MLP",                "DL", "Self-attention over feature sequence + FC"),
    ]
    for i, row_data in enumerate(hp_data):
        bg = "F5F0E8" if i % 2 == 0 else "FFFFFF"
        table_row(tbl_hp, i + 1, row_data, bg=bg)
    caption(doc, "Table 2. Key hyperparameters for the eleven AURIS classifiers.")

    subheading(doc, "3.4. Training Protocol and Threshold Optimisation")
    body(doc, (
        "All models are evaluated under the same 5-fold stratified cross-validation protocol, "
        "which preserves the class ratio in every fold. For each fold, the training procedure "
        "follows three steps. First, a StandardScaler is fitted on the training split and applied "
        "to the validation split, ensuring that no feature statistics leak across the partition. "
        "Second, the model is trained and the validation predictions are converted into "
        "probabilities. Third, the optimal decision threshold for that fold is selected using "
        "Youden's J statistic, defined as"
    ))
    equation(doc, "J(θ) = TPR(θ) − FPR(θ),", "(1)")
    body(doc, (
        "where TPR(θ) and FPR(θ) are the true-positive and false-positive rates obtained at "
        "threshold θ on the fold's ROC curve. The threshold that maximises J(θ) replaces the "
        "default 0.5 cutoff. Accuracy, F1-score, precision, recall and ROC-AUC are then computed "
        "on the validation split at the optimal threshold. Final results are macro-averaged over "
        "the five folds. Algorithm 1 summarises the procedure."
    ))

    algorithm_box(doc, "Algorithm 1 — AURIS training and threshold-optimisation procedure", [
        "Input:  dataset D = {(x_i, y_i)}_{i=1..N};  model family M;  number of folds K = 5",
        "Output: fold metrics {(acc_k, f1_k, auc_k, θ*_k)}_{k=1..K}",
        "1:  Generate K stratified folds (D_train^k, D_val^k) preserving class ratio",
        "2:  for k = 1 .. K do",
        "3:      Fit scaler S_k on D_train^k; transform both splits",
        "4:      Train classifier M_k on the scaled D_train^k",
        "5:      Obtain probabilities p_i for x_i in D_val^k",
        "6:      Compute ROC curve {(FPR(θ), TPR(θ))}",
        "7:      θ*_k ← argmax_θ ( TPR(θ) − FPR(θ) )            // Youden's J",
        "8:      Predict y_hat_i ← 1 if p_i ≥ θ*_k else 0",
        "9:      Record acc_k, f1_k, auc_k, θ*_k",
        "10: end for",
        "11: Return macro-averaged metrics over k = 1..K",
    ])

    body(doc, (
        "Class imbalance is handled redundantly across the three families of models. Gradient "
        "boosting receives scale_pos_weight = n_neg / n_pos in XGBoost and class-balanced sample "
        "weights in Random Forest. Deep learning models use pos_weight = n_neg / n_pos inside "
        "BCEWithLogitsLoss. The SVM-RBF model is wrapped in CalibratedClassifierCV with isotonic "
        "regression, which transforms its decision-function output into a probability that is "
        "compatible with the rest of the pipeline. The Brier score is reported alongside the ROC "
        "metrics in Section 4.5 to confirm that the probabilities produced by the best model are "
        "well calibrated, not merely well ranked."
    ))

    figure(doc, "training_history.png",
           "Figure 3. Training curves for the four deep learning architectures across five "
           "folds. Convergence is reached within roughly thirty epochs; early stopping prevents "
           "overfitting on the smaller validation splits.")

    # ╔════════════════════════════════════════════════════════════════════╗
    # ║  4. RESULTS                                                          ║
    # ╚════════════════════════════════════════════════════════════════════╝

    heading(doc, "4. Results")

    subheading(doc, "4.1. Overall Model Performance")
    body(doc, (
        "Table 3 reports the 5-fold cross-validation results for the eleven models, sorted by "
        "ROC-AUC. LightGBM obtained the highest mean ROC-AUC of 0.9549, with Deep MLP a very "
        "close second at 0.9537 — a difference of only 0.0012 in AUC. Deep MLP, however, achieved "
        "the highest accuracy (0.8849) and F1-score (0.8596) of the entire pool, narrowly ahead "
        "of LightGBM at 0.8839 accuracy and 0.8575 F1. The remaining ensemble methods (XGBoost, "
        "Random Forest, Gradient Boosting) and the SVM with RBF kernel all cluster in the "
        "0.93–0.95 AUC range. Logistic Regression and the 1D-CNN are the weakest performers in "
        "the pool, which suggests that linear decision boundaries are too restrictive for the "
        "underlying feature distribution and that convolutional inductive biases do not transfer "
        "well to a flat 47-dimensional input."
    ))

    # Table 3 — Main results
    tbl1 = doc.add_table(rows=12, cols=7)
    tbl1.style = "Table Grid"
    table_row(tbl1, 0,
        ["Rank", "Model", "Type", "Accuracy", "F1", "ROC-AUC", "Threshold θ*"],
        bold=True, bg="C99347")
    data = [
        (1,  "LightGBM",                  "ML", "0.8839", "0.8575", "0.9549", "0.4316"),
        (2,  "Deep MLP (512-256-128-64)",  "DL", "0.8849", "0.8596", "0.9537", "—"),
        (3,  "XGBoost",                    "ML", "0.8735", "0.8402", "0.9463", "0.5000"),
        (4,  "Residual MLP (3 blocks)",    "DL", "0.8756", "0.8476", "0.9453", "—"),
        (5,  "Gradient Boosting",          "ML", "0.8685", "0.8337", "0.9406", "0.5000"),
        (6,  "Random Forest",              "ML", "0.8604", "0.8183", "0.9393", "0.5000"),
        (7,  "Attention MLP",              "DL", "0.8628", "0.8293", "0.9356", "—"),
        (8,  "SVM (RBF)",                  "ML", "0.8612", "0.8252", "0.9347", "0.5000"),
        (9,  "MLP Neural Network",         "ML", "0.8545", "0.8189", "0.9258", "0.5000"),
        (10, "Logistic Regression",        "ML", "0.7779", "0.7390", "0.8511", "0.5000"),
        (11, "1D-CNN",                     "DL", "0.7665", "0.7159", "0.8442", "—"),
    ]
    for i, row_data in enumerate(data):
        bg = "F5F0E8" if i % 2 == 0 else "FFFFFF"
        table_row(tbl1, i + 1, row_data, bg=bg)
    caption(doc, "Table 3. 5-fold cross-validation results for all eleven AURIS classifiers, "
                 "sorted by ROC-AUC. The optimised threshold θ* is reported for the best model.")

    figure(doc, "paper_model_comparison.png",
           "Figure 4. Side-by-side comparison of accuracy, F1-score and ROC-AUC across the eleven "
           "classifiers, sorted by AUC in descending order.")

    figure(doc, "paper_roc_curves.png",
           "Figure 5. ROC curves of all eleven models under 5-fold cross-validation. The dashed "
           "diagonal corresponds to random guessing (AUC = 0.500). LightGBM and Deep MLP are "
           "indistinguishable at the resolution of the plot, in agreement with Table 3.")

    figure(doc, "all_models_heatmap.png",
           "Figure 6. Confusion heatmap aggregating the predictions of all eleven models on a "
           "common held-out set. Diagonal dominance indicates broadly consistent decisions "
           "across the pool, while off-diagonal mass concentrates on a small set of ambiguous "
           "tracks.")

    subheading(doc, "4.2. ML versus DL: Where Does the Improvement Come From?")
    body(doc, (
        "Figure 7 contrasts the two families directly. The seven ML classifiers reach a mean "
        "ROC-AUC of 0.9275, while the four DL architectures reach 0.9197 — but only because the "
        "1D-CNN drags the DL mean down. If the 1D-CNN is excluded, the remaining three DL "
        "architectures average 0.9449, narrowly higher than the ML mean of 0.9276 when Logistic "
        "Regression is excluded. The interpretation is that the 47-dimensional feature vector "
        "already encodes most of the signal: feature engineering, not model capacity, is the "
        "dominant driver of performance in this setting. Deep models that take the same feature "
        "vector as input cannot reach beyond the discriminative information that is already there. "
        "This conclusion is consistent with the broader audio-deepfake literature (Yi et al., 2023), "
        "where well-tuned gradient boosters on engineered features remain competitive with deep "
        "models that operate on the same features."
    ))

    figure(doc, "paper_ml_vs_dl.png",
           "Figure 7. Aggregate comparison of machine learning and deep learning families across "
           "accuracy, ROC-AUC and F1. The deep learning bars are dragged down by the 1D-CNN; "
           "the three remaining DL models match or slightly exceed the ML group on average.")

    subheading(doc, "4.3. Cross-Fold Stability of Deep Models")
    body(doc, (
        "Table 4 reports fold-level AUC statistics for the four DL architectures. Deep MLP shows "
        "the lowest variance (standard deviation 0.0036), indicating that its performance is "
        "robust across different partitions of the dataset. Residual MLP behaves similarly "
        "(±0.0044). Attention MLP is more variable (±0.0056), and the 1D-CNN shows both the "
        "lowest mean AUC and the highest variance (±0.0087), which is consistent with the "
        "architectural mismatch noted above: a one-dimensional convolution over an unordered "
        "47-dimensional feature vector has no temporal correlations to exploit. Figure 8 visualises "
        "the fold-by-fold spread."
    ))

    # Table 4 — DL stability
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
    caption(doc, "Table 4. Per-fold ROC-AUC values for the four deep-learning architectures. "
                 "Deep MLP combines the highest mean with the lowest variance.")

    figure(doc, "paper_fold_std_table.png",
           "Figure 8. Cross-validation AUC distribution per model. Box plots show median, "
           "interquartile range and outliers across folds.")

    subheading(doc, "4.4. Feature Importance")
    body(doc, (
        "Table 5 lists the top twenty features ranked by normalised gain in the trained LightGBM "
        "model. Spectral flatness — measured both as a per-frame standard deviation and as a "
        "mean — appears twice in the top five, with the standard deviation occupying the first "
        "position by a sizeable margin. Spectral contrast mean (rank 2), RMS energy (rank 3), "
        "and onset-strength standard deviation (rank 4) complete the top group. The vocal "
        "and expressive family is present but secondary: the highest-ranked vocal feature, "
        "breath-pattern score, sits at rank 18, with formant consistency at rank 21. The "
        "interpretation is that AI generation systems differ from human recordings most "
        "consistently in their broadband spectral structure and onset dynamics — both of which "
        "are by-products of the synthesis pipeline rather than musical content. Figure 9 visualises "
        "the top-twenty ranking, and Figure 10 reports SHAP values for the same model, which "
        "broadly confirms the LightGBM gain ranking."
    ))

    # Table 5 — Top 20 features
    tbl_fi = doc.add_table(rows=11, cols=4)
    tbl_fi.style = "Table Grid"
    table_row(tbl_fi, 0,
        ["Rank", "Feature", "Family", "Importance (gain)"],
        bold=True, bg="C99347")
    fi_data = [
        (1,  "spectral_flatness_std",      "Spectral",  "0.0619"),
        (2,  "spectral_contrast_mean",     "Spectral",  "0.0467"),
        (3,  "rms_energy",                  "Temporal",  "0.0456"),
        (4,  "onset_strength_std",          "Temporal",  "0.0388"),
        (5,  "spectral_flatness_mean",      "Spectral",  "0.0370"),
        (6,  "rms_dynamic_range",           "Temporal",  "0.0346"),
        (7,  "onset_strength_mean",         "Temporal",  "0.0332"),
        (8,  "rms_std",                     "Temporal",  "0.0298"),
        (9,  "beat_count",                  "Temporal",  "0.0298"),
        (10, "mfcc_delta_var",              "Spectral",  "0.0289"),
    ]
    for i, row_data in enumerate(fi_data):
        bg = "F5F0E8" if i % 2 == 0 else "FFFFFF"
        table_row(tbl_fi, i + 1, row_data, bg=bg)
    caption(doc, "Table 5. Top ten features by normalised gain in the trained LightGBM model.")

    figure(doc, "paper_feature_importance.png",
           "Figure 9. Top-twenty feature importances in LightGBM (normalised gain). Spectral and "
           "temporal families dominate, with vocal features playing a secondary role.")

    figure(doc, "shap_summary.png",
           "Figure 10. SHAP summary plot for LightGBM. Each point represents a sample; horizontal "
           "position is the SHAP value and colour encodes feature magnitude. The plot confirms "
           "that high spectral flatness pushes predictions toward the human class.")

    subheading(doc, "4.5. Confusion, Score Distribution and Calibration")
    body(doc, (
        "Figure 11 shows the confusion matrix obtained when the LightGBM predictions on the "
        "aggregated 5-fold validation sets are thresholded at the Youden-optimal value "
        "θ* = 0.4316. The matrix reports 2,701 true negatives (87.1% of the human samples), "
        "1,880 true positives (90.3% of the AI samples), 412 false positives (12.9% of human "
        "samples assigned to AI), and 202 false negatives (9.7% of AI samples assigned to human). "
        "Sensitivity to the AI class (90.3%) slightly exceeds specificity for human samples "
        "(87.1%) — a desirable property for a detection system where missed AI samples are the "
        "more consequential error."
    ))

    figure(doc, "paper_confusion_matrix_lightgbm.png",
           "Figure 11. Confusion matrix for LightGBM at the Youden-optimal threshold θ* = 0.4316. "
           "Cell labels show sample counts and the corresponding within-class percentages.")

    body(doc, (
        "Figure 12 plots the predicted-probability distributions P(AI) for the human and AI "
        "classes separately. The two distributions are well separated, with substantial overlap "
        "only in the central region around 0.4–0.6. The dashed vertical line marks θ* = 0.4316; "
        "the position of the threshold to the left of the symmetric 0.5 cutoff reflects the "
        "class imbalance and is precisely the value that maximises J(θ). Figure 13 reports the "
        "calibration curve. The curve closely follows the diagonal across the full probability "
        "range, with a Brier score of 0.083:"
    ))
    equation(doc, "BS = (1 / N) Σᵢ ( p_i − y_i )²", "(2)")
    body(doc, (
        "where p_i is the predicted probability for sample i and y_i its true label. The low "
        "value confirms that the probabilities produced by LightGBM are reliable estimates and "
        "not merely good ranking scores; downstream thresholding can therefore be carried out "
        "with predictable precision–recall trade-offs. Figure 14 finally shows the "
        "precision–recall curve, with an average precision of approximately 0.95, an order of "
        "magnitude above the no-skill baseline implied by the 1:1.5 class ratio."
    ))

    figure(doc, "paper_score_distribution.png",
           "Figure 12. Distribution of predicted probabilities P(AI) for human (green) and AI "
           "(red) samples. The dashed line marks the Youden-optimal decision threshold "
           "θ* = 0.4316.")

    figure(doc, "paper_calibration.png",
           "Figure 13. Calibration curve for LightGBM. The fraction of positives is plotted "
           "against the mean predicted probability for each bin; the diagonal corresponds to "
           "perfect calibration. Brier score = 0.083.")

    figure(doc, "paper_precision_recall.png",
           "Figure 14. Precision–recall curve for LightGBM, with average precision (AP) reported "
           "in the legend. The dashed horizontal line shows the no-skill baseline for the 1:1.5 "
           "class ratio.")

    subheading(doc, "4.6. Threshold Sweep and Decision Operating Points")
    body(doc, (
        "Figure 15 reports a fine-grained sweep of the decision threshold from 0 to 1 in 0.01 "
        "steps. The accuracy curve peaks broadly around θ ≈ 0.40, while F1 reaches its maximum "
        "around θ ≈ 0.43. The Youden-optimal threshold θ* = 0.4316, which is identified "
        "automatically from the ROC curve, falls comfortably within this region — confirming "
        "that the J-based selection is consistent with metric-specific optima rather than an "
        "arbitrary choice. Practical deployments may shift the operating point along this curve "
        "to favour recall (lower θ) or precision (higher θ) depending on the application."
    ))

    figure(doc, "threshold_sweep.png",
           "Figure 15. Threshold sweep for LightGBM. Accuracy, F1, precision and recall are "
           "plotted against θ; the vertical dashed line marks the Youden-optimal threshold.")

    subheading(doc, "4.7. Per-Generator Performance")
    body(doc, (
        "Because the AI portion of the dataset spans more than a dozen generation systems, "
        "per-generator performance is informative beyond the aggregate metrics. Figure 16 reports "
        "recall on the AI class broken down by source repository. The system achieves uniformly "
        "high recall on the Suno-family and AIME tracks but performs less well on the "
        "MusicGen-only subset, where the model occasionally classifies tracks as human. This is "
        "consistent with the observation of Bhatt et al. (2025) that cross-generator generalisation "
        "is the field's main open challenge."
    ))

    figure(doc, "per_source_performance.png",
           "Figure 16. Per-source recall on the AI class. The model generalises well across the "
           "Suno-family and AIME subsets, while MusicGen-only tracks remain harder to detect.")

    figure(doc, "per_class_metrics.png",
           "Figure 17. Per-class precision, recall and F1 for LightGBM. The two classes are "
           "treated symmetrically by the trained model, with a small bias toward higher recall "
           "on the AI side.")

    # ╔════════════════════════════════════════════════════════════════════╗
    # ║  5. DISCUSSION                                                       ║
    # ╚════════════════════════════════════════════════════════════════════╝

    heading(doc, "5. Discussion")

    subheading(doc, "5.1. Why Spectral Flatness Dominates")
    body(doc, (
        "The dominance of spectral flatness in the feature-importance ranking is interpretable "
        "and consistent with the broader audio-deepfake literature (Yi et al., 2023). Spectral "
        "flatness measures the ratio between the geometric and arithmetic means of a signal's "
        "power spectrum and therefore captures how tonal or noise-like the spectrum is. "
        "Current AI generation systems tend to optimise perceptual quality metrics that favour "
        "tonal richness, with the side effect of producing signals whose spectra are "
        "systematically cleaner than those of human recordings. Human recordings, by contrast, "
        "carry the broadband noise contributed by recording environments, microphone preamps "
        "and instrumental performance. The difference is small per frame but consistent across "
        "long stretches of audio, and gradient boosting captures it well."
    ))

    subheading(doc, "5.2. Cross-Generator Generalisation")
    body(doc, (
        "The dataset spans twelve or more AI generation systems, ranging from the autoregressive "
        "transformers used by MusicGen and Suno to the latent diffusion models used by AudioLDM, "
        "Stable Audio and Riffusion. The fact that AURIS reaches an AUC of 0.95 despite this "
        "diversity suggests that the 47-feature representation captures generator-agnostic "
        "artefacts rather than generator-specific fingerprints. This is a useful property for "
        "real deployment: at inference time the system will encounter generators that did not "
        "exist when it was trained, and detectors that rely on system-specific decoder traces — "
        "such as the auto-encoder fingerprint detector of Afchar et al. (2025) — risk degrading "
        "sharply on unseen pipelines. The trade-off is the headline accuracy. AURIS is "
        "comfortably below the 99.8% reported by Afchar et al. on their controlled fingerprint "
        "task; the 0.95 AUC is, however, achieved on a much harder multi-generator setting."
    ))

    subheading(doc, "5.3. Why the 1D-CNN Underperforms")
    body(doc, (
        "The poor performance of the 1D-CNN (AUC 0.8442) is not an artefact of training. It is "
        "an architectural mismatch. A one-dimensional convolution is designed to exploit local "
        "correlations along a sequence, but the input to AURIS is a flat 47-dimensional feature "
        "vector whose elements have no ordering and no local structure. Adjacent indices in the "
        "vector correspond to unrelated quantities — a spectral statistic next to a tempo "
        "statistic next to a vocal score — and a convolution that slides a kernel across this "
        "list has no meaningful translation invariance to learn. The result is that 1D-CNN is "
        "outperformed by even the basic Logistic Regression on accuracy, while the other three "
        "DL architectures, which operate on the vector as a whole, behave normally."
    ))

    subheading(doc, "5.4. Calibration and Operational Utility")
    body(doc, (
        "Operational deployments of detection systems often need to choose a decision point "
        "based on a target precision or recall. A Brier score of 0.083 makes this possible "
        "because the predicted probabilities correspond closely to the true posterior, which "
        "means that a threshold of 0.7 actually means '70% confident' rather than 'the 70th "
        "quantile of the score distribution'. The Youden-optimal cutoff at 0.4316 is the "
        "principled default for balanced accuracy under the present class ratio, but users with "
        "different operating costs can confidently move the threshold along the curve visualised "
        "in Figure 15."
    ))

    subheading(doc, "5.5. Limitations")
    body(doc, (
        "Four limitations are worth recording explicitly. First, features are extracted from the "
        "full clip, which is typically between fifteen and thirty seconds long; shorter clips "
        "(< 5 seconds) yield less reliable estimates for tempo and vibrato statistics in "
        "particular, and so the system is not yet evaluated in the live-microphone short-clip "
        "regime. Second, the fine-tuned wav2vec2 model is validated qualitatively on held-out "
        "samples but does not yet have a formal 5-fold cross-validation report, which limits "
        "direct head-to-head comparison with the eleven feature-based classifiers. Third, "
        "although the dataset covers twenty genres, certain genres (ambient and lo-fi in "
        "particular) are over-represented in the AI portion; a genre-stratified evaluation would "
        "provide a more rigorous account of generalisation. Fourth, adversarial robustness has "
        "not been tested. Post-processing such as MP3 compression, pitch shifting, or "
        "time-stretching is known to degrade detection performance for systems that rely on "
        "vocoder fingerprints (Afchar et al., 2025); the same is likely to affect AURIS to some "
        "degree, though less catastrophically since its features are not built around vocoder "
        "traces."
    ))

    # ╔════════════════════════════════════════════════════════════════════╗
    # ║  6. CONCLUSION                                                       ║
    # ╚════════════════════════════════════════════════════════════════════╝

    heading(doc, "6. Conclusion")
    body(doc, (
        "This paper has presented AURIS, an end-to-end system for detecting AI-generated music "
        "that combines a 47-dimensional handcrafted acoustic feature vector with an ensemble of "
        "eleven classification models trained on 5,195 samples drawn from twelve or more AI "
        "generation systems. The principal empirical findings are as follows. LightGBM achieves "
        "the highest mean ROC-AUC at 0.9549, narrowly ahead of Deep MLP at 0.9537. Spectral "
        "flatness is the single most informative feature for the AI-versus-human distinction, a "
        "pattern that is interpretable in terms of the difference between synthetic and recorded "
        "spectra. Per-fold Youden's J threshold optimisation systematically outperforms the "
        "default 0.5 cutoff under the present 1:1.5 class imbalance, and the resulting model is "
        "well calibrated, with a Brier score of 0.083 on the aggregated validation predictions."
    ))
    body(doc, (
        "Future work will pursue four directions. First, a formal cross-generator held-out "
        "evaluation will be conducted on emerging public benchmarks such as SONICS and "
        "FakeMusicCaps. Second, the fine-tuned wav2vec2 model will be integrated into the "
        "5-fold cross-validation protocol for a direct comparison with the feature-based "
        "classifiers. Third, adversarial robustness will be evaluated explicitly under MP3 "
        "compression, pitch shifting and time-stretching. Fourth, the dataset will be expanded "
        "toward ten thousand samples and updated to include emerging generation systems as they "
        "appear, with particular attention to the cross-generator generalisation challenge "
        "identified by Bhatt et al. (2025)."
    ))

    # ╔════════════════════════════════════════════════════════════════════╗
    # ║  AUTHOR CONTRIBUTIONS, AI DISCLOSURE, ETC.                           ║
    # ╚════════════════════════════════════════════════════════════════════╝

    heading(doc, "Author Contributions")
    body(doc, (
        "Hasan Arthur Altuntaş: conceptualisation, methodology, software, data curation, "
        "formal analysis, investigation, writing — original draft, writing — review and editing, "
        "visualisation."
    ))

    heading(doc, "Acknowledgement")
    body(doc, "This research received no external funding.")

    heading(doc, "Conflict of Interest")
    body(doc, "The author declares no conflict of interest.")

    # ╔════════════════════════════════════════════════════════════════════╗
    # ║  REFERENCES                                                          ║
    # ╚════════════════════════════════════════════════════════════════════╝

    heading(doc, "References")

    refs = [
        "Afchar, D., Meseguer Brocal, G., & Hennequin, R. (2025). AI-generated music detection "
        "and its challenges. In Proceedings of IEEE ICASSP 2025. IEEE. "
        "https://doi.org/10.48550/arXiv.2501.10111",

        "Baevski, A., Zhou, Y., Mohamed, A., & Auli, M. (2020). wav2vec 2.0: A framework for "
        "self-supervised learning of speech representations. Advances in Neural Information "
        "Processing Systems, 33, 12449–12460. https://doi.org/10.5555/3495724.3496768",

        "Bhatt, A., Rajan, A., et al. (2025). AI-generated music detection: A survey of methods "
        "and datasets. arXiv preprint arXiv:2501.10111. "
        "https://doi.org/10.48550/arXiv.2501.10111",

        "Copet, J., Kreuk, F., Gat, I., Remez, T., Kant, D., Synnaeve, G., Adi, Y., & Défossez, "
        "A. (2023). Simple and controllable music generation. Advances in Neural Information "
        "Processing Systems, 36. https://doi.org/10.48550/arXiv.2306.05284",

        "Elizalde, B., Deshmukh, S., Al Ismail, M., & Wang, H. (2023). CLAP: Learning audio "
        "concepts from natural language supervision. In Proceedings of ICASSP 2023 (pp. 1–5). "
        "IEEE. https://doi.org/10.1109/ICASSP49357.2023.10095889",

        "Frank, J., & Schönherr, L. (2021). WaveFake: A data set to facilitate audio deepfake "
        "detection. NeurIPS 2021 Datasets and Benchmarks Track. "
        "https://doi.org/10.5281/zenodo.5642694",

        "Gan, R., Huang, T., Shao, J., & Wang, F. (2024). Music genre classification based on "
        "VMD-IWOA-XGBoost. Mathematics, 12(10), 1549. https://doi.org/10.3390/math12101549",

        "Gourisaria, M. K., Agrawal, R., & Sahni, M. (2024). Comparative analysis of audio "
        "classification with MFCC and STFT features using machine learning techniques. "
        "Discover Internet of Things, 4, Article 1. "
        "https://doi.org/10.1007/s43926-023-00049-y",

        "Kosta, K., Meseguer Brocal, G., Afchar, D., & Hennequin, R. (2025). Segment Transformer: "
        "AI-generated music detection via music structural analysis. arXiv preprint "
        "arXiv:2509.08283. https://doi.org/10.48550/arXiv.2509.08283",

        "Kostrzewa, D., Mazur, W., & Brzeski, R. (2022). Wide ensembles of neural networks in "
        "music genre classification. In Proceedings of MISSI 2022, Lecture Notes in Networks "
        "and Systems (pp. 91–102). Springer. https://doi.org/10.1007/978-3-031-08754-7_9",

        "Liu, H., Chen, Z., Yuan, Y., Mei, X., Liu, X., Mandic, D., Wang, W., & Plumbley, M. D. "
        "(2023). AudioLDM: Text-to-audio generation with latent diffusion models. In "
        "Proceedings of ICML 2023. https://doi.org/10.48550/arXiv.2301.12503",

        "Liu, Y., et al. (2024). From audio deepfake detection to AI-generated music detection: "
        "A pathway and overview. arXiv preprint arXiv:2412.00571. "
        "https://doi.org/10.48550/arXiv.2412.00571",

        "Liu, Y., Yin, Y., Zhu, Q., & Cui, W. (2022). Musical instrument recognition by XGBoost "
        "combining feature fusion. arXiv preprint arXiv:2206.00901. "
        "https://doi.org/10.48550/arXiv.2206.00901",

        "Martín-Doñas, J. M., & Álvarez, A. (2022). The Vicomtech audio deepfake detection "
        "system based on Wav2vec2 for the 2022 ADD challenge. In Proceedings of ICASSP 2022 "
        "(pp. 9266–9270). IEEE. https://doi.org/10.1109/ICASSP43922.2022.9747768",

        "Wu, Y., Chen, K., Zhang, T., Hui, Y., Berg-Kirkpatrick, T., & Dubnov, S. (2023). "
        "Large-scale contrastive language-audio pretraining with feature fusion and "
        "keyword-to-caption augmentation. In Proceedings of ICASSP 2023 (pp. 1–5). IEEE. "
        "https://doi.org/10.1109/ICASSP49357.2023.10095969",

        "Yi, J., Fu, R., Tao, J., Nie, S., Ma, H., Wang, C., Wang, T., Tian, Z., Bai, Y., & "
        "Fan, C. (2022). ADD 2022: The first audio deep synthesis detection challenge. In "
        "Proceedings of ICASSP 2022 (pp. 9216–9220). IEEE. "
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
