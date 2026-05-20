"""
AURIS — Türkçe makale (Gazi Müh. Mim. Fak. Dergisi formatında).

Çift dilli kapak (TR+EN), IEEE numerik atıf [1], [2], bölüm başlıkları
çift dilli, tablo/şekil başlıkları çift dilli, 30 doğrulanmış referans.
Tüm gerçek figürler (gerçek veriden, real_analysis.py + regenerate_figures.py
ile üretilmiş) embed edilir.
"""

from __future__ import annotations

from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.shared import Cm, Pt, RGBColor


# ── Paths ──────────────────────────────────────────────────────────────────
HERE     = Path(__file__).resolve().parent
FIGURES  = HERE.parent / "figures"
OUT      = HERE / "AURIS_paper_TR.docx"


# ── Constants ──────────────────────────────────────────────────────────────
GOLD = "C99347"
DARK = "333333"


# ══════════════════════════════════════════════════════════════════════════
# Helpers — paragraph, heading, figure, table
# ══════════════════════════════════════════════════════════════════════════
def _shade(cell, hex_color: str) -> None:
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_color)
    tcPr.append(shd)


def _set_keep_with_next(paragraph) -> None:
    pPr = paragraph._p.get_or_add_pPr()
    kn = OxmlElement("w:keepNext")
    pPr.append(kn)


def _page_break_before(paragraph) -> None:
    pPr = paragraph._p.get_or_add_pPr()
    pbb = OxmlElement("w:pageBreakBefore")
    pPr.append(pbb)


def _set_cols(section, num_cols: int, space_cm: float = 0.5) -> None:
    """Force a w:cols element on a section to set the column count."""
    sectPr = section._sectPr
    # Remove existing cols if any
    existing = sectPr.find(qn("w:cols"))
    if existing is not None:
        sectPr.remove(existing)
    cols = OxmlElement("w:cols")
    cols.set(qn("w:num"), str(num_cols))
    # 567 twips ≈ 1 cm
    cols.set(qn("w:space"), str(int(space_cm * 567)))
    cols.set(qn("w:equalWidth"), "1")
    sectPr.append(cols)


def _apply_a4_margins(section) -> None:
    section.page_width    = Cm(21.0)
    section.page_height   = Cm(29.7)
    section.top_margin    = Cm(2.79)
    section.bottom_margin = Cm(0.49)
    section.left_margin   = Cm(1.50)
    section.right_margin  = Cm(1.50)


def start_two_column_section(doc) -> None:
    """Insert a continuous section break and switch to 2 columns."""
    new_sec = doc.add_section(WD_SECTION.CONTINUOUS)
    _apply_a4_margins(new_sec)
    _set_cols(new_sec, 2, space_cm=0.5)


def start_one_column_section(doc) -> None:
    """Insert a continuous section break and switch back to 1 column."""
    new_sec = doc.add_section(WD_SECTION.CONTINUOUS)
    _apply_a4_margins(new_sec)
    _set_cols(new_sec, 1)


def _set_font(run, *, size=11, bold=False, italic=False,
              color=DARK, name="Times New Roman"):
    run.font.name = name
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    if color is not None:
        run.font.color.rgb = RGBColor.from_string(color)
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.append(rFonts)
    for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        rFonts.set(qn(attr), name)


def body(doc, text: str, *, size=11, justify=True, indent_cm=0.0):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY if justify else WD_ALIGN_PARAGRAPH.LEFT
    pf = p.paragraph_format
    pf.line_spacing_rule = WD_LINE_SPACING.SINGLE
    pf.space_before = Pt(8)
    pf.space_after = Pt(12)
    if indent_cm:
        pf.first_line_indent = Cm(indent_cm)
    r = p.add_run(text)
    _set_font(r, size=size)
    return p


def heading(doc, text: str, *, all_caps=True):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    pf = p.paragraph_format
    pf.space_before = Pt(14)
    pf.space_after = Pt(8)
    pf.line_spacing_rule = WD_LINE_SPACING.SINGLE
    r = p.add_run(text.upper() if all_caps else text)
    _set_font(r, size=12, bold=True)
    _set_keep_with_next(p)
    return p


def subheading(doc, text: str):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    pf = p.paragraph_format
    pf.space_before = Pt(10)
    pf.space_after = Pt(6)
    pf.line_spacing_rule = WD_LINE_SPACING.SINGLE
    r = p.add_run(text)
    _set_font(r, size=11, bold=True, italic=True)
    _set_keep_with_next(p)
    return p


def figure(doc, filename: str, caption_tr: str, caption_en: str,
           *, width_cm: float = 8.0) -> None:
    img = FIGURES / filename
    if not img.exists():
        body(doc, f"[FIGURE MISSING: {filename}]")
        return
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pf = p.paragraph_format
    pf.space_before = Pt(10)
    pf.space_after = Pt(2)
    r = p.add_run()
    r.add_picture(str(img), width=Cm(width_cm))
    _set_keep_with_next(p)

    c1 = doc.add_paragraph()
    c1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cf = c1.paragraph_format
    cf.space_before = Pt(0)
    cf.space_after = Pt(0)
    r1 = c1.add_run(caption_tr)
    _set_font(r1, size=11, italic=True)
    _set_keep_with_next(c1)

    c2 = doc.add_paragraph()
    c2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cf = c2.paragraph_format
    cf.space_before = Pt(0)
    cf.space_after = Pt(12)
    r2 = c2.add_run(f"({caption_en})")
    _set_font(r2, size=11, italic=True, color="666666")


def table_caption(doc, caption_tr: str, caption_en: str) -> None:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pf = p.paragraph_format
    pf.space_before = Pt(10)
    pf.space_after = Pt(2)
    r = p.add_run(caption_tr)
    _set_font(r, size=11, italic=True)
    _set_keep_with_next(p)

    p2 = doc.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pf2 = p2.paragraph_format
    pf2.space_before = Pt(0)
    pf2.space_after = Pt(4)
    r2 = p2.add_run(f"({caption_en})")
    _set_font(r2, size=11, italic=True, color="666666")
    _set_keep_with_next(p2)


def add_table(doc, headers, rows):
    tbl = doc.add_table(rows=1 + len(rows), cols=len(headers))
    tbl.style = "Table Grid"
    for j, h in enumerate(headers):
        cell = tbl.rows[0].cells[j]
        cell.text = ""
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        _set_font(r, size=10, bold=True, color="FFFFFF")
        _shade(cell, GOLD)
    for i, row in enumerate(rows, start=1):
        bg = "F5F0E8" if i % 2 == 0 else "FFFFFF"
        for j, val in enumerate(row):
            cell = tbl.rows[i].cells[j]
            cell.text = ""
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(val)
            _set_font(r, size=10)
            _shade(cell, bg)
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(12)


def reference_entry(doc, idx: int, text: str) -> None:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    pf = p.paragraph_format
    pf.left_indent = Cm(0.8)
    pf.first_line_indent = Cm(-0.8)
    pf.space_before = Pt(0)
    pf.space_after = Pt(4)
    pf.line_spacing_rule = WD_LINE_SPACING.SINGLE
    r = p.add_run(f"{idx}. {text}")
    _set_font(r, size=10)


# ══════════════════════════════════════════════════════════════════════════
# DOCUMENT BUILD
# ══════════════════════════════════════════════════════════════════════════
def build():
    doc = Document()

    # Gazi MMF Dergisi şablonu: A4, kenarlar Üst 2.79 / Alt 0.49 / Sol 1.50 / Sağ 1.50 cm
    for section in doc.sections:
        section.page_width    = Cm(21.0)
        section.page_height   = Cm(29.7)
        section.top_margin    = Cm(2.79)
        section.bottom_margin = Cm(0.49)
        section.left_margin   = Cm(1.50)
        section.right_margin  = Cm(1.50)

    # ── Türkçe başlık ──
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("AURIS: Çoklu-Model Topluluk Yaklaşımı ile Yapay Zekâ "
                  "Tarafından Üretilen Müziklerin Tespiti")
    _set_font(r, size=14, bold=True)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("Hasan Arthur Altuntaş")
    _set_font(r, size=11, bold=True)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(16)
    r = p.add_run("Düzce Üniversitesi, Mühendislik Fakültesi, "
                  "Bilgisayar Mühendisliği Bölümü, 81620, Düzce, Türkiye")
    _set_font(r, size=10, italic=True)

    # Highlights TR
    subheading(doc, "Ö N E   Ç I K A N L A R")
    for h in [
        "• 5.195 müzik örneği ve 47 boyutlu akustik öznitelik vektörü ile yapay zekâ tarafından "
        "üretilen müziği insan kompozisyonundan ayırt eden uçtan-uca bir sistem önerilmiştir.",
        "• Yedi makine öğrenmesi ve dört derin öğrenme algoritması, ortak bir 5-katlı çapraz "
        "doğrulama protokolü altında karşılaştırılmıştır.",
        "• LightGBM, %95,48 ROC-AUC değeri ile en yüksek performansı sergilemiş; her kat arasında "
        "yalnızca ±0,0023 standart sapma ile en kararlı modeli oluşturmuştur.",
        "• Spektral düzlük (spectral flatness) standart sapması, yapay zekâ-insan ayrımı için en "
        "bilgilendirici tek öznitelik olarak tespit edilmiştir.",
    ]:
        p = doc.add_paragraph()
        pf = p.paragraph_format
        pf.left_indent = Cm(0.5)
        pf.space_after = Pt(3)
        r = p.add_run(h)
        _set_font(r, size=10)

    subheading(doc, "Makale Bilgileri")
    body(doc, "Araştırma Makalesi  ·  Geliş: 20.05.2026  ·  "
              "Anahtar Kelimeler: Yapay zekâ tarafından üretilen müzik, "
              "derin öğrenme, gradyan artırma, topluluk öğrenmesi, ses sınıflandırması, "
              "spektral düzlük.", size=10)

    subheading(doc, "ÖZ")
    body(doc, (
        "Üretken Yapay Zekâ (Generative Artificial Intelligence-GenAI) tabanlı metinden "
        "müziğe (text-to-music) üretim sistemlerinin -Suno, Udio ve MusicGen başta olmak "
        "üzere- son üç yıl içerisindeki hızlı yaygınlaşması, üretilen müzik parçalarının "
        "insan eliyle bestelenmiş kayıtlardan ayırt edilmesini bir tespit problemi olarak "
        "gündeme getirmiştir. Bu problem; telif hakkı atıflandırması, çevrimiçi akış "
        "platformlarının içerik bütünlüğü ve sanatçıların ekonomik hakları açısından "
        "önemli bir araştırma konusu hâline gelmiştir. Bu çalışmada, 47 boyutlu elle "
        "tasarlanmış bir akustik öznitelik vektörü ile yedi makine öğrenmesi (Machine "
        "Learning-ML) ve dört derin öğrenme (Deep Learning-DL) algoritmasından oluşan on "
        "bir modelli bir topluluk öğrenmesi yaklaşımını birleştiren AURIS adlı yenilikçi "
        "bir sistem önerilmektedir. Önerilen sistemin eğitimi ve değerlendirilmesi için, "
        "on iki veya daha fazla GenAI üretici sisteminden ve birden çok insan kaynağından "
        "(GTZAN, FMA, SleepyJesse kapakları) derlenen 5.195 örneklik halka açık bir veri "
        "kümesi kullanılmıştır. Önerilen sistem kapsamında değerlendirilen on bir model "
        "arasından LightGBM (Light Gradient Boosting Machine), %95,48 ROC-AUC değeri ve "
        "±0,0023 standart sapma ile hem en yüksek ortalama hem de katlar-arası en düşük "
        "varyansı bir araya getirerek en başarılı sonucu elde etmiştir. Derin Çok Katmanlı "
        "Algılayıcı (Deep Multi-Layer Perceptron-DMLP) %95,42 ROC-AUC ile çok yakın bir "
        "ikinci sırayı almıştır. Spektral düzlük (spectral flatness) standart sapması "
        "özniteliği, öznitelik önem sıralamasında ilk sırayı belirgin bir farkla elde "
        "etmiştir. Youden'in J istatistiği ile optimize edilen θ* = 0,4316 karar eşiği, "
        "varsayılan 0,5 eşiğine kıyasla dengeli doğruluğu sistematik biçimde "
        "iyileştirmiştir. Brier skoru 0,083 olarak ölçülmüş ve önerilen modelin olasılık "
        "çıktılarının iyi kalibre olduğu doğrulanmıştır. Tanılayıcı analiz sonuçları, "
        "ağaç tabanlı tüm modellerin eğitim ve çapraz doğrulama doğrulukları arasında "
        "8-14 puanlık bir fark sergilediğini ve mevcut 47 özniteliğin yaklaşık 17 "
        "tanesinin ölçülebilir bir ek doğruluk sağlamadığını ortaya koymuştur."
    ), size=10)

    subheading(doc, "Anahtar Kelimeler")
    body(doc, "Yapay zekâ tarafından üretilen müzik · Derin öğrenme · Gradyan artırma · "
              "Topluluk öğrenmesi · Ses sınıflandırması · Spektral düzlük", size=10)

    # ── İngilizce blok ──
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(20)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("AURIS: A Multi-Model Ensemble Approach for the Detection of "
                  "AI-Generated Music")
    _set_font(r, size=13, bold=True, italic=True)

    subheading(doc, "H I G H L I G H T S")
    for h in [
        "• An end-to-end system distinguishing AI-generated music from human composition, "
        "using a 47-dimensional acoustic feature vector and 5,195 audio samples.",
        "• Seven machine learning and four deep learning algorithms compared under a unified "
        "5-fold cross-validation protocol.",
        "• LightGBM achieves the top performance with 95.48% ROC-AUC and the lowest cross-fold "
        "variance (±0.0023) in the entire pool.",
        "• Spectral flatness standard deviation emerges as the single most informative feature "
        "for the AI-versus-human distinction.",
    ]:
        p = doc.add_paragraph()
        pf = p.paragraph_format
        pf.left_indent = Cm(0.5)
        pf.space_after = Pt(3)
        r = p.add_run(h)
        _set_font(r, size=10, italic=True)

    subheading(doc, "ABSTRACT")
    body(doc, (
        "The proliferation of text-to-music generators such as Suno, Udio and MusicGen has "
        "raised a detection problem of practical importance for copyright attribution, "
        "streaming-platform integrity and artist economics. This paper proposes AURIS, a "
        "system that couples a 47-dimensional handcrafted acoustic feature vector with an "
        "ensemble of eleven classifiers. The models are trained on a dataset of 5,195 samples "
        "drawn from twelve or more AI generation systems and multiple human sources (GTZAN, "
        "FMA, SleepyJesse covers) under 5-fold cross-validation. LightGBM achieves the top "
        "ROC-AUC of 0.9548 (±0.0023), combining the best mean with the lowest cross-fold "
        "variance; Deep MLP follows narrowly at 0.9542. Spectral-flatness standard deviation "
        "ranks first in feature importance. A Youden-J optimised decision threshold of "
        "θ* = 0.4316 improves balanced accuracy over the default 0.5 cutoff. A Brier score of "
        "0.083 confirms that the probability outputs are well calibrated. Diagnostic analysis "
        "shows an 8-14 point train-CV accuracy gap for all tree-based models and reveals that "
        "roughly 17 of the 47 features contribute no measurable accuracy."
    ), size=10)

    subheading(doc, "Keywords")
    body(doc, "AI-generated music · Deep learning · Gradient boosting · Ensemble learning · "
              "Audio classification · Spectral flatness", size=10)

    # ══════════════════════════════════════════════════════════════════
    # Kapak bitti — buradan itibaren ÇİFT KOLONLU yapı (Gazi MMF Dergisi)
    # ══════════════════════════════════════════════════════════════════
    start_two_column_section(doc)

    # ══════════════════════════════════════════════════════════════════
    # 1. GİRİŞ
    # ══════════════════════════════════════════════════════════════════
    heading(doc, "1. Giriş (Introduction)")

    body(doc, (
        "Üretken Yapay Zekâ (Generative Artificial Intelligence-GenAI) sistemlerinin son "
        "üç yıl içerisinde araştırma laboratuvarlarından tüketici uygulamalarına doğru "
        "yaşadığı hızlı geçiş, metinden müziğe (text-to-music) üretim alanında belirgin "
        "bir dönüşümü beraberinde getirmiştir. Suno (sürüm 3-5), Udio, Meta tarafından "
        "geliştirilen MusicGen [1] sistemi ve AudioLDM [2] gibi difüzyon tabanlı modeller, "
        "kullanıcının sağladığı kısa bir metin istemi ile dakikalar mertebesinde tam "
        "uzunlukta müzik parçaları üretebilme kapasitesine ulaşmıştır. Üretilen bu "
        "parçaların, deneyimsiz bir dinleyici tarafından insan eliyle bestelenmiş kayıtlardan "
        "ayırt edilmesi çoğu durumda mümkün olmamaktadır. Bu gelişme, telif hakkı "
        "atıflandırması, çevrimiçi akış platformlarının içerik bütünlüğü, oturum "
        "müzisyenlerinin ekonomik hakları ve eğitimcilerin yazarlık değerlendirmesi gibi "
        "birçok kritik konuyu doğrudan etkilemektedir."
    ))

    body(doc, (
        "Konuşma için ses derin sahte tespiti (audio deepfake detection), ADD 2022 [3] "
        "yarışmaları ve WaveFake [4] gibi büyük ölçekli veri kümeleri sayesinde aktif bir "
        "araştırma alanı hâline gelmiştir. Buna karşın, GenAI ile üretilen müziğin tespiti "
        "henüz benzer bir olgunluğa ulaşamamıştır. Bunun temel nedeni, müziğin konuşmadan "
        "farklı olarak sabit bir sözlüğe, doğrulanabilir bir konuşmacı kimliğine veya "
        "prozodi izine sahip olmamasıdır. Müzik; harmonik karmaşıklık, çokseslilik, "
        "perküsyon ve insan stüdyoları ile sentetik üretim hatları arasında geniş bir "
        "varyasyon gösteren kayıt artefaktları içermektedir. Konu üzerinde gerçekleştirilen "
        "güncel tarama çalışmaları [5,6], alanın henüz oluşum aşamasında olduğunu "
        "belirtmekte ve üretici modeller arası genellemeyi -yani eğitim aşamasında "
        "görülmemiş sistemler tarafından üretilen parçaları doğru biçimde tespit edebilme "
        "yetisini- alanın birincil açık problemi olarak vurgulamaktadır [5]."
    ))

    body(doc, (
        "Yakın tarihli iki örnek çalışma, bu alandaki dengesizliği açık biçimde "
        "yansıtmaktadır. Afchar vd. tarafından öne sürülen çalışmada [7], oto-kodlayıcı "
        "(auto-encoder) artefaktlarını tanımak amacıyla eğitilen bir tespit sisteminin, "
        "nöral vokoderlerin (neural vocoder) bıraktığı spektral kalıntıları kullanarak "
        "%99,8 doğruluk değerine ulaşabildiği gösterilmiştir; ancak aynı sistemin, MP3 "
        "sıkıştırma ve perde kaydırma (pitch shifting) gibi basit ses manipülasyonları "
        "altında performansının ciddi biçimde düştüğü raporlanmıştır. Kim ve Go [8] ise "
        "kısa müzik segmentlerini önceden eğitilmiş bir kodlayıcı ile gömüp bunları bir "
        "Dönüştürücü (Transformer) başlığı ile birleştirerek bir müzik parçasının "
        "tamamındaki yapısal örüntüleri yakalayan Segment Transformer modelini önermiştir. "
        "Her iki yaklaşım da aynı temel kabulü paylaşmaktadır: hiçbir tek öznitelik ailesi "
        "tek başına farklı üretici sistemlere karşı yeterince sağlam değildir."
    ))

    body(doc, (
        "Bu çalışmada önerilen AURIS sistemi, söz konusu iki uç arasında dengeli bir "
        "konumda yer almaktadır. Sistem, tek bir temsile bağlı kalmak yerine; spektral, "
        "zamansal, harmonik ve vokal davranışı özetleyen 47 boyutlu elle tasarlanmış bir "
        "öznitelik vektörü ile kasıtlı biçimde heterojen on bir sınıflandırıcıdan oluşan "
        "bir topluluğu birleştirmektedir. Bu yaklaşımın amacı iki yönlüdür: (𝑖) birden çok "
        "GenAI üreticisi sisteminde rekabetçi tespit doğruluğu elde edebilmek ve (𝑖𝑖) "
        "tüketici donanımı üzerinde konuşlandırılabilir, yorumlanabilir ve güvenilir bir "
        "model elde edebilmek. Bu çalışmanın temel katkıları şu şekilde özetlenebilir:"
    ))

    for bullet in [
        "(𝑖) Suno, Udio, MusicGen, AudioLDM2 ve diğer altı üretici sistem dahil olmak üzere "
        "on iki GenAI üreticisinden ve birden çok insan kaynağından (GTZAN, FMA, SleepyJesse "
        "kapakları) derlenen 5.195 örneklik, halka açık ve çoğaltılabilir nitelikte bir veri "
        "kümesinin oluşturulması;",
        "(𝑖𝑖) Yedi ML algoritmasının (Lojistik Regresyon, Rastgele Orman, Gradyan Artırma, "
        "Destek Vektör Makineleri (Support Vector Machines-SVM), Çok Katmanlı Algılayıcı "
        "(Multi-Layer Perceptron-MLP), XGBoost [9] ve LightGBM [10]) ve dört DL mimarisinin "
        "(DMLP, Tek Boyutlu Evrişimli Sinir Ağı (One-Dimensional Convolutional Neural "
        "Network-1B-ESA), Artık MLP (Residual MLP), Dikkat MLP (Attention MLP)) ortak bir "
        "5-katlı çapraz doğrulama protokolü altında karşılaştırmalı olarak değerlendirilmesi; "
        "değerlendirme sonucunda LightGBM modelinin %95,48 ROC-AUC değeri ve katlar-arası "
        "±0,0023 standart sapma ile en başarılı sonucu sağladığının gösterilmesi;",
        "(𝑖𝑖𝑖) Spektral düzlük standart sapması özniteliğinin, yapay zekâ ile insan müziği "
        "ayrımı için en bilgilendirici öznitelik olduğunu gösteren Shapley Katma Açıklamaları "
        "(Shapley Additive exPlanations-SHAP) [11] tabanlı bir yorumlanabilirlik analizinin "
        "sunulması; elde edilen bu sonucun, GenAI tarafından üretilen ses ile kaydedilmiş ses "
        "arasındaki spektral fark üzerinden açıklanabilir olduğunun tartışılması.",
    ]:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Cm(0.5)
        p.paragraph_format.space_after = Pt(6)
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r = p.add_run(bullet)
        _set_font(r, size=11)

    body(doc, (
        "Bu makalenin geri kalanı şu şekilde yapılandırılmıştır: 1.1-1.5 alt bölümleri "
        "kapsamında ses derin sahte tespiti, Dönüştürücü tabanlı ses temsilleri, ses "
        "sınıflandırma için topluluk yöntemleri ve GenAI müzik tespiti alanındaki güncel "
        "literatür kapsamlı biçimde gözden geçirilmektedir. 2. Bölümde önerilen sistemin "
        "geliştirilmesi sürecinde kullanılan veri kümesi, öznitelik çıkarma boru hattı, on "
        "bir sınıflandırma modeli ve eğitim protokolü ayrıntılı olarak açıklanmaktadır. "
        "3. Bölümde deneysel sonuçlar tüm modeller üzerinde karşılaştırmalı biçimde "
        "sunulmakta; öznitelik önemi, kalibrasyon ve modelin sınırlamaları üzerine "
        "tartışmalar yapılmaktadır. Son olarak 4. Bölüm, çalışmanın temel bulgularını "
        "özetleyerek gelecek araştırmalar için öngörülen yönleri belirtmektedir. Önerilen "
        "sistem, https://huggingface.co/spaces/Rtur2003/AURIS adresinde halka açık olarak "
        "kullanıma sunulmuştur."
    ))

    subheading(doc, "1.1. Konuşma için Ses Derin Sahte Tespiti "
                    "(Audio Deepfake Detection for Speech)")
    body(doc, (
        "Konuşma için ses derin sahte tespiti, GenAI ile üretilen müzik tespiti çalışmaları "
        "açısından doğrudan örnek alınan en olgun komşu alanı oluşturmaktadır. Yi vd. "
        "tarafından öne sürülen ADD 2022 [3] yarışmasında, bu alan resmî biçimde bir "
        "topluluk değerlendirme problemi olarak kurulmuş ve düşük kaliteli sahte ses (LF), "
        "kısmî sahte ses (PF) ile oyun tabanlı algılama (FG) olmak üzere üç ayrı parça "
        "tanımlanmıştır. Martín-Doñas ve Álvarez tarafından öne sürülen Vicomtech sistemi "
        "[12], önceden eğitilmiş wav2vec2 [13] öznitelik çıkarıcısının üzerine bir "
        "sınıflandırma başlığı yerleştirerek bu yarışmada güçlü bir performans elde "
        "etmiştir. Yi vd. [6] tarafından yürütülen kapsamlı bir tarama çalışmasında, "
        "alanın hem teknik hem de etik zorlukları ayrıntılı biçimde özetlenmiştir. Bunun "
        "yanı sıra, Frank ve Schönherr tarafından öne sürülen WaveFake [4] gibi büyük "
        "ölçekli veri kümeleri, vokoder-spesifik artefaktların tespit edilebilirliğinin "
        "sistematik biçimde incelenmesi için altyapı oluşturmuştur."
    ))

    subheading(doc, "1.2. Dönüştürücü Tabanlı Ses Temsilleri "
                    "(Transformer-Based Audio Representations)")
    body(doc, (
        "Dönüştürücü temelli ve kendi kendini denetimli (self-supervised) ses temsilleri, "
        "son beş yıl içerisinde geleneksel akustik öznitelik mühendisliğinin önemli bir "
        "alternatifi hâline gelmiştir. Baevski vd. tarafından öne sürülen çalışmada [13], "
        "ham ses sinyalinden ince ayar gerektirmeyen öznitelikler üreten wav2vec 2.0 "
        "mimarisi sunulmuştur. Elizalde vd. tarafından geliştirilen CLAP (Contrastive "
        "Language-Audio Pretraining) [14] yöntemi, karşıt öğrenme (contrastive learning) "
        "yaklaşımı ile ses ve metin temsillerini ortak bir gömü uzayında hizalamaktadır. "
        "Söz konusu çalışma, Wu vd. tarafından öne sürülen büyük ölçekli CLAP varyantında "
        "[15] genişletilmiş ve 633.526 ses-metin çiftinden öğrenilmiş daha güçlü bir model "
        "elde edilmiştir. Bu modeller doğrudan tespit için kullanılmasa da, ileri görevler "
        "için sağlam bir temel oluşturmaktadır."
    ))

    subheading(doc, "1.3. Ses İçin Topluluk Yöntemleri ve Gradyan Artırma "
                    "(Ensemble Methods and Gradient Boosting for Audio)")
    body(doc, (
        "Topluluk öğrenmesi (ensemble learning) yöntemleri, ses sınıflandırma alanında "
        "istikrarlı biçimde rekabetçi sonuçlar üretmektedir. Liu vd. tarafından öne "
        "sürülen çalışmada [16], XGBoost tabanlı bir müzikal enstrüman tanıma sisteminin "
        "çoklu öznitelik füzyonu ile yüksek doğruluğa ulaşabildiği gösterilmiştir. Gan vd. "
        "[17], Değişken Mod Ayrıştırması (Variational Mode Decomposition-VMD) ve "
        "Geliştirilmiş Balina Optimizasyon Algoritması (Improved Whale Optimization "
        "Algorithm-IWOA) ile zenginleştirilen XGBoost modelinin (VMD-IWOA-XGBoost) GTZAN "
        "ve Bangla veri kümeleri üzerinde diğer modelleri beş değerlendirme kriterinde "
        "geride bıraktığını raporlamıştır. Türkçe literatür kapsamında, Hızlısoy ve "
        "Tüfekci [18] derin öğrenme tabanlı bir mimari ile Türkçe müziklerin tür "
        "sınıflandırması üzerinde çalışmış ve yeni bir Türkçe müzik veri tabanı "
        "oluşturmuşlardır. Özbalcı vd. [19], GTZAN veri kümesi üzerinde Rastgele Orman, "
        "SVM ve Yapay Sinir Ağı (Artificial Neural Network-YSA) algoritmalarını "
        "karşılaştırmalı olarak değerlendirmiş ve Rastgele Orman algoritması ile %81 "
        "doğruluk değerine ulaşmıştır. Turan ve Polat [20] ise yarı denetimli (semi-"
        "supervised) makine öğrenmesi yöntemlerini kullanarak müzik türlerinin tespiti "
        "üzerine bir çalışma sunmuşlardır. Kostrzewa vd. tarafından öne sürülen geniş "
        "sinir ağı toplulukları yaklaşımı [21], müzik tür sınıflandırmasında tek "
        "modellere kıyasla daha yüksek bir performans göstermiştir. Gourisaria vd. [22], "
        "Mel Frekans Kepstral Katsayıları (Mel Frequency Cepstral Coefficients-MFCC) ile "
        "Kısa Süreli Fourier Dönüşümü (Short-Time Fourier Transform-STFT) özniteliklerini "
        "karşılaştırmalı olarak inceleyerek ses sınıflandırması için en uygun temsil "
        "yöntemini araştırmışlardır."
    ))

    subheading(doc, "1.4. GenAI Müzik Üretici Sistemleri "
                    "(GenAI Music Generation Systems)")
    body(doc, (
        "GenAI müzik üretim sistemleri, tespit problemini doğrudan şekillendiren teknik "
        "çeşitliliği yansıtmaktadır. Copet vd. tarafından geliştirilen MusicGen [1] "
        "sistemi, metne koşullu sıkıştırılmış ses andıçları (audio tokens) üzerinde çalışan "
        "tek aşamalı bir Dönüştürücü dil modeli kullanmaktadır. Liu vd. tarafından öne "
        "sürülen AudioLDM [2] ise metinden sese üretim için CLAP gömmelerini koşullandırma "
        "sinyali olarak kullanan bir gizil difüzyon modelidir (latent diffusion model). "
        "Suno ve Udio gibi ticari ürünler altta yatan mimarilerini kamuoyu ile "
        "paylaşmamıştır; ancak çıktılarının sürümler arasında ölçülen spektral özellikleri, "
        "dağılımsal olarak gözlemlenebilir tutarlı bir iz bırakmaktadır."
    ))

    subheading(doc, "1.5. GenAI Müzik Tespitinde Güncel Gelişmeler (2024-2025) "
                    "(Recent Advances in GenAI Music Detection (2024-2025))")
    body(doc, (
        "Bu alandaki en doğrudan ilgili çalışmalar 2024-2025 yılları arasında "
        "yayımlanmıştır. Li vd. [5] ses derin sahte tespiti metodolojisini gelişmekte "
        "olan GenAI müzik tespiti alanına bağlayan bir yol haritası ve genel bakış "
        "sunmuş; aktarılabilir öznitelikleri katalogladıkları aynı çalışmada üretici "
        "modeller arası genellemenin alanın birincil açık problemi olduğunu "
        "vurgulamışlardır. Afchar vd. tarafından öne sürülen ICASSP 2025 çalışmasında "
        "[7], oto-kodlayıcı artefaktları üzerinde eğitilen tespit sistemlerinin nöral "
        "vokoderlerin spektral artıkları sayesinde %99,8 doğruluk değerine "
        "ulaşabileceği gösterilmiştir. Kim ve Go tarafından öne sürülen Segment "
        "Transformer [8], kısa müzik segmentlerini bir Dönüştürücü başlığı ile işleyen "
        "ve kendi kendini denetimli önceden eğitilmiş temsilleri yapısal örüntülerin "
        "yakalanması amacıyla entegre eden bir mimari sunmaktadır. Rahman vd. "
        "tarafından geliştirilen SONICS veri kümesi [23], 97.000'den fazla şarkı ve "
        "49.000'den fazla Suno/Udio kaynaklı sentetik şarkı içermekte olup uçtan-uca "
        "sentetik şarkı tespiti için geniş ölçekli bir referans kıyaslama "
        "oluşturmaktadır. Comanducci vd. [24] tarafından geliştirilen FakeMusicCaps "
        "veri kümesi, beş farklı metinden-müziğe modeli ile yeniden üretilmiş "
        "MusicCaps eşlemelerinden oluşmakta ve hem tespit hem de atıflandırma "
        "deneyleri için bir temel sağlamaktadır. Pascu vd. tarafından öne sürülen "
        "Echoes [25] veri kümesi, on farklı popüler GenAI müzik üretim sistemi "
        "tarafından üretilen anlamsal-hizalı içeriği kapsamaktadır. Sunday [26] "
        "FakeMusicCaps üzerinde CNN tabanlı tespit yaklaşımının tempo gerdirme ve "
        "perde kaydırma altındaki performansını ölçmüştür; Sroka vd. tarafından öne "
        "sürülen çalışmada [27] ise ses büyütmeleri (audio augmentations) altında "
        "sahte müzik tespit performansının sistematik biçimde değerlendirilmesi "
        "gerçekleştirilmiştir. Bu çalışmaların ortak bulgusu şu şekilde özetlenebilir: "
        "hiçbir tek mimari ailesi, hem üretici modeller arası genellemeyi hem de "
        "düşmanca güçlendirilmiş sinyallere karşı sağlamlığı tek başına "
        "sağlayamamaktadır. AURIS ile karşılaştırma amacıyla ilgili çalışmaların genel "
        "bakışı Tablo 1'de sunulmuştur."
    ))

    table_caption(doc,
        "Tablo 1. Yapay zekâ müzik tespiti alanındaki ilgili çalışmaların genel bakışı",
        "Overview of related works in AI-generated music detection")
    add_table(doc,
        headers=["Çalışma", "Veri Kümesi", "Kullanılan Metot(lar)",
                 "Değerlendirme", "En İyi Sonuç"],
        rows=[
            ["Afchar vd. [7]", "Özel (Suno + insan)",
             "wav2vec2 + sınıflandırıcı başlık", "Doğruluk, AUC",
             "%99,8 (yumuşatılmamış)"],
            ["Kim ve Go [8]", "FakeMusicCaps + SONICS",
             "Segment Transformer (SSL + transformer)",
             "Doğruluk, F1", "%91+ (segment)"],
            ["Rahman vd. [23]", "SONICS (97K şarkı)",
             "SpecTTTra (verimli transformer)",
             "F1, AUC", "Rekabetçi, 6× daha az bellek"],
            ["Comanducci vd. [24]", "FakeMusicCaps",
             "CNN + MFCC", "Doğruluk", "İlk referans değerleri"],
            ["Sunday [26]", "FakeMusicCaps + ses büyütmeleri",
             "CNN üzerinde Mel-spektrogram",
             "Doğruluk", "Büyütmeler altında değişken"],
            ["Sroka vd. [27]", "Birden çok kamuya açık veri",
             "Çoklu mimari karşılaştırması",
             "AUC, F1", "Sağlamlık-doğruluk dengesi"],
            ["Pascu vd. [25]", "Echoes (3577 parça)",
             "Çoklu üretici sistem dahil eğitim",
             "Doğruluk, AUC", "Anlamsal-hizalı kıyaslama"],
            ["Bu çalışma (AURIS)", "5.195 örnek, 12+ üretici",
             "47 öznitelik + 11 model topluluğu",
             "Doğruluk, AUC, F1, Brier",
             "AUC %95,48 (LightGBM)"],
        ])

    # ══════════════════════════════════════════════════════════════════
    # 2. MATERYAL VE YÖNTEM
    # ══════════════════════════════════════════════════════════════════
    heading(doc, "2. Materyal ve Yöntem (Material and Method)")

    body(doc, (
        "Bu bölümde önerilen sistemin geliştirilmesinde kullanılan materyal ve yöntemler "
        "özetlenmiştir. Alt bölümlerde sırasıyla (i) veri kümesi, (ii) öznitelik çıkarma "
        "boru hattı, (iii) sınıflandırma modelleri, (iv) eğitim protokolü ve eşik "
        "optimizasyonu açıklanmaktadır. Şekil 1, sistemin uçtan-uca işleyişini "
        "göstermektedir."
    ))

    figure(doc, "paper_pipeline_diagram.png",
           "Şekil 1. AURIS uçtan-uca işleyiş şeması: ses girişi, 47 boyutlu öznitelik "
           "çıkarma, standartlaştırma, 11 modelli topluluk, olasılık füzyonu ve karar "
           "eşiği.",
           "End-to-end AURIS pipeline: audio input, 47-dimensional feature extraction, "
           "standardisation, 11-model ensemble, probability fusion and decision threshold.",
           width_cm=8.5)

    subheading(doc, "2.1. Veri Kümesi (Dataset)")
    body(doc, (
        "Çalışmada toplam 5.195 ses örneği kullanılmıştır. Bu örneklerin 3.113 tanesi insan "
        "tarafından bestelenmiş ve seslendirilmiş kayıtları (sınıf 0), 2.082 tanesi ise "
        "yapay zekâ tarafından üretilmiş örnekleri (sınıf 1) temsil etmektedir. İnsan "
        "kaynakları üç ayrı havuzdan oluşmaktadır: GTZAN (899 örnek; on tür, 30 saniyelik "
        "klipler), FMA Small (1.000 örnek; sekiz tür) ve özel bir kapak performansı "
        "veri seti olan SleepyJesse (854 örnek). Yapay zekâ kaynakları daha çeşitlidir; "
        "Suno (500 örnek, sürüm 3-5), Udio, MusicGen [1], AudioLDM2 [2], Stable Audio, "
        "Riffusion, Mustango, JEN-1 ve dahili olarak adlandırılan 'Echoes' ve 'AImE' "
        "alt kümelerini içermektedir. Veri kümesi kompozisyonu Tablo 2'de özetlenmiştir."
    ))

    table_caption(doc,
        "Tablo 2. Veri kümesi kompozisyonu ve sınıf dağılımı",
        "Dataset composition and class distribution")
    add_table(doc,
        headers=["Kaynak", "Tür", "Örnek Sayısı", "Etiket"],
        rows=[
            ["GTZAN", "İnsan (on tür)", "899", "0"],
            ["FMA Small", "İnsan (sekiz tür)", "1.000", "0"],
            ["SleepyJesse", "İnsan (kapak performansları)", "854", "0"],
            ["Diğer insan kaynakları", "İnsan (çeşitli)", "360", "0"],
            ["Echoes", "Yapay zekâ (Suno türevi)", "1.128", "1"],
            ["Suno (v3-v5)", "Yapay zekâ (ticari)", "500", "1"],
            ["Deepfake seti", "Yapay zekâ (karışık)", "492", "1"],
            ["AImE / Mustango / JEN-1", "Yapay zekâ (akademik)", "204", "1"],
            ["Toplam", "", "5.195", ""],
        ])

    subheading(doc, "2.2. Öznitelik Çıkarma (Feature Extraction)")
    body(doc, (
        "Her ses parçası 22.050 Hz örnekleme hızında yeniden örneklenmiş ve librosa [28] "
        "kütüphanesi kullanılarak 47 boyutlu bir öznitelik vektörüne dönüştürülmüştür. "
        "Bu vektör dört aileye ayrılmaktadır. Spektral aile (16 öznitelik), her birinin "
        "ortalama ve standart sapması olmak üzere; spektral merkezleme, spektral düzlük, "
        "spektral bant genişliği, spektral kontrast, spektral azalma ve mel düzlüğünü "
        "içermektedir. Zamansal aile (10 öznitelik) yüksekliği ve zamanlamayı kapsar: RMS "
        "enerji ve standart sapması, RMS dinamik aralığı, başlangıç gücü ortalama ve "
        "standart sapması, sıfır geçiş oranı ve standart sapması, tempo BPM, tempo "
        "kararlılığı ve tempo varyasyon katsayısı ile vuruş sayısı. Harmonik ve tonal "
        "aile (9 öznitelik) chroma standart sapması, chroma entropi, chroma geçiş oranı, "
        "tonnetz standart sapması, harmonik oran, kompozit bir harmonik-yapı skoru, mel "
        "düzlüğü, ortalama perde (Hz) ve perde standart sapmasını (cent) raporlamaktadır. "
        "MFCC ailesi (3 öznitelik) MFCC varyansını ve birinci ile ikinci derece delta "
        "varyanslarını içermektedir. Vokal aile (9 öznitelik) vokal varlık skoru, vokal "
        "güven, vokal yapay zekâ skoru, perde kararlılığı, vibrato düzenliliği, formant "
        "tutarlılığı, nefes düzeni, vokal doku ve vokal harmonik oranı ölçmektedir. "
        "Şekil 2, ilk sekiz öznitelik için insan ve yapay zekâ örneklerinin dağılımlarını "
        "karşılaştırmaktadır."
    ))

    figure(doc, "feature_distribution_ai_vs_human.png",
           "Şekil 2. LightGBM önemine göre sıralanmış ilk sekiz özniteliğin insan (yeşil) "
           "ile yapay zekâ (kırmızı) örnekleri için dağılımı. Spektral düzlük panelleri "
           "log-eksen ile gösterilmiştir.",
           "Distribution of the top eight features by LightGBM importance, human (green) "
           "versus AI (red). The spectral flatness panels use a log x-axis.",
           width_cm=8.5)

    subheading(doc, "2.3. Sınıflandırma Modelleri (Classification Models)")
    body(doc, (
        "On bir sınıflandırma modeli, ortak bir 5-katlı çapraz doğrulama protokolü altında "
        "karşılaştırılmıştır. Yedi makine öğrenmesi modeli scikit-learn [29] kütüphanesi "
        "kullanılarak uygulanmıştır: dengeli sınıf ağırlığı ile Lojistik Regresyon (C=2,0), "
        "balanced_subsample örnekleme ile Rastgele Orman (n_estimators=500), Gradyan "
        "Artırma (n_estimators=180, max_depth=4, learning_rate=0,07), RBF çekirdeği ile "
        "destek vektör makinesi SVM (C=10,0, gamma=0,05), ÇKA Sinir Ağı, XGBoost [9] ve "
        "LightGBM [10]. SVM, izotonik kalibrasyon ile CalibratedClassifierCV içinde "
        "sarılarak diğer modellerle uyumlu olasılık çıktısı sağlanmıştır. Dört derin "
        "öğrenme mimarisi PyTorch ile uygulanmıştır: Deep MLP (512-256-128-64 boyutlu "
        "katmanlar, BatchNorm ve Dropout), 1D-CNN (öznitelik vektörü üzerinde tek boyutlu "
        "konvolüsyon), Residual MLP (üç bloklu artık bağlantılar) ve Attention MLP (öznitelik "
        "grupları üzerinde öz-dikkat mekanizması). Tüm derin modeller pos_weight ile "
        "ağırlıklandırılmış BCEWithLogitsLoss kullanmakta ve Adam [30] optimizasyonu ile "
        "eğitilmektedir. Tablo 3 her modelin hiperparametrelerini özetlemektedir."
    ))

    table_caption(doc,
        "Tablo 3. On bir modelin temel hiperparametreleri",
        "Key hyperparameters of the eleven models")
    add_table(doc,
        headers=["Model", "Tip", "Temel Hiperparametreler"],
        rows=[
            ["Lojistik Regresyon", "ML", "C=2,0; max_iter=2500; class_weight=balanced"],
            ["Rastgele Orman", "ML", "n_estimators=500; max_features=log2"],
            ["Gradyan Artırma", "ML", "n_estimators=180; max_depth=4; lr=0,07"],
            ["SVM (RBF)", "ML", "C=10,0; gamma=0,05; izotonik kalibrasyon"],
            ["ÇKA Sinir Ağı", "ML", "Gizli katmanlar: 128-64; relu; adam"],
            ["XGBoost", "ML", "n_estimators=400; lr=0,05; max_depth=6"],
            ["LightGBM", "ML", "n_estimators=400; lr=0,05; num_leaves=31"],
            ["Deep MLP", "DL", "512-256-128-64; BatchNorm; Dropout"],
            ["1D-CNN", "DL", "Conv1D katmanları; max_pool; global avg"],
            ["Residual MLP", "DL", "3 artık blok; her blok: 256-256"],
            ["Attention MLP", "DL", "Öz-dikkat; 4 baş; gizli 128"],
        ])

    subheading(doc, "2.4. Eğitim Protokolü ve Eşik Optimizasyonu "
                    "(Training Protocol and Threshold Optimisation)")
    body(doc, (
        "Tüm modeller stratifiye edilmiş 5-katlı çapraz doğrulama (random_state=42) ile "
        "değerlendirilmiştir. Her kat içinde StandardScaler eğitim alt kümesi üzerinde "
        "fit edilmiş, ardından doğrulama alt kümesi üzerinde transform uygulanmıştır; "
        "bu sayede veri sızıntısı önlenmiştir. Karar eşiği θ, varsayılan 0,5 yerine "
        "Youden'in J istatistiği ile optimize edilmiştir: J(θ) = TPR(θ) - FPR(θ), "
        "Denklem (1). Bu maksimizasyon, duyarlılık ile özgüllüğün toplamını maksimize "
        "eden eşiği seçer. LightGBM için Youden-optimal eşik θ* = 0,4316 olarak "
        "ölçülmüştür ve aşağıdaki tüm sonuçlar bu eşik altında raporlanmıştır. "
        "Olasılıkların kalibrasyon kalitesi Brier skoru ile değerlendirilmiştir, "
        "Denklem (2): BS = (1/N) Σᵢ (pᵢ - yᵢ)²."
    ))

    body(doc, (
        "Modellerin yorumlanabilirliği, LightGBM üzerinde TreeSHAP [11] algoritması "
        "kullanılarak analiz edilmiştir. SHAP değerleri, her özniteliğin tahmine katkısını "
        "Shapley değerleri çerçevesinde tutarlı biçimde nicelleştirmektedir."
    ))

    # ══════════════════════════════════════════════════════════════════
    # 3. SONUÇLAR VE TARTIŞMA
    # ══════════════════════════════════════════════════════════════════
    heading(doc, "3. Sonuçlar ve Tartışma (Results and Discussion)")

    subheading(doc, "3.1. Genel Model Performansı (Overall Model Performance)")
    body(doc, (
        "Tablo 4, on bir modelin 5-katlı çapraz doğrulama sonuçlarını ROC-AUC'a göre "
        "sıralanmış biçimde sunmaktadır. LightGBM, %95,48 ortalama ROC-AUC değeri ile "
        "ilk sırada yer almakta ve Deep MLP %95,42 ile çok yakın bir ikinci sıra elde "
        "etmektedir; iki model arasındaki fark yalnızca 0,0006 AUC mertebesindedir. "
        "Üçüncü sıradaki XGBoost (%94,65) ve dördüncü sıradaki Residual MLP (%94,85) ile "
        "birlikte ilk dört modelin tamamı %94 üzerindeki ROC-AUC değerleriyle birbirine "
        "yakın performans göstermektedir. 1D-CNN, %85,43 ile en düşük performansı "
        "sergilemiştir; bu sonuç §3.10'da tartışılmaktadır. Şekil 3, dört derin öğrenme "
        "mimarisi için epok bazlı eğitim eğrilerini göstermektedir."
    ))

    table_caption(doc,
        "Tablo 4. On bir sınıflandırıcının 5-katlı çapraz doğrulama sonuçları "
        "(ROC-AUC'a göre sıralı)",
        "5-fold cross-validation results of the eleven classifiers, sorted by ROC-AUC")
    add_table(doc,
        headers=["Sıra", "Model", "Tip", "Doğruluk", "F1", "ROC-AUC", "θ*"],
        rows=[
            ["1",  "LightGBM",                 "ML", "0,8839", "0,8575", "0,9548", "0,4316"],
            ["2",  "Deep MLP (512-256-128-64)", "DL", "0,8849", "0,8596", "0,9542", "—"],
            ["3",  "Residual MLP (3 blok)",     "DL", "0,8756", "0,8476", "0,9485", "—"],
            ["4",  "XGBoost",                   "ML", "0,8751", "0,8408", "0,9465", "—"],
            ["5",  "Gradyan Artırma",           "ML", "0,8685", "0,8337", "0,9397", "—"],
            ["6",  "Rastgele Orman",            "ML", "0,8606", "0,8183", "0,9394", "—"],
            ["7",  "Attention MLP",             "DL", "0,8628", "0,8293", "0,9359", "—"],
            ["8",  "SVM (RBF)",                 "ML", "0,8612", "0,8252", "0,9346", "—"],
            ["9",  "ÇKA Sinir Ağı",             "ML", "0,8566", "0,8189", "0,9276", "—"],
            ["10", "1D-CNN",                    "DL", "0,7665", "0,7159", "0,8543", "—"],
            ["11", "Lojistik Regresyon",        "ML", "0,7779", "0,7390", "0,8515", "—"],
        ])

    figure(doc, "paper_model_comparison.png",
           "Şekil 3. On bir sınıflandırıcının doğruluk, F1 ve ROC-AUC değerlerinin "
           "AUC'a göre azalan sırayla karşılaştırılması.",
           "Comparison of accuracy, F1 and ROC-AUC across the eleven classifiers, "
           "sorted by AUC in descending order.")

    figure(doc, "paper_roc_curves.png",
           "Şekil 4. Yedi öznitelik tabanlı sınıflandırıcının 5-katlı çapraz doğrulama "
           "ROC eğrileri. LightGBM AUC=0,9545 ile başı çekmekte; rastgele tahmin "
           "(AUC=0,500) referans olarak verilmiştir.",
           "ROC curves of the seven feature-based classifiers under 5-fold "
           "cross-validation. LightGBM leads with AUC=0.9545; random guessing "
           "(AUC=0.500) is shown as reference.",
           width_cm=8.5)

    figure(doc, "all_models_heatmap.png",
           "Şekil 5. On bir modelin doğruluk, kesinlik, duyarlılık, F1 ve ROC-AUC "
           "değerlerinin ısı haritası; her sütundaki en iyi değer kalın gösterilmiştir.",
           "Heatmap of accuracy, precision, recall, F1 and ROC-AUC across the eleven "
           "models; the best per column is shown in bold.")

    subheading(doc, "3.2. Makine Öğrenmesi ve Derin Öğrenme Karşılaştırması "
                    "(ML versus DL Comparison)")
    body(doc, (
        "Şekil 6, iki aileyi doğrudan karşılaştırmaktadır. Yedi makine öğrenmesi "
        "sınıflandırıcısı %92,75 ortalama ROC-AUC değerine ulaşırken, dört derin "
        "öğrenme mimarisi %92,32'de kalmaktadır; ancak bu fark esas olarak 1D-CNN'nin "
        "DL ortalamasını aşağı çekmesinden kaynaklanmaktadır. 1D-CNN dışlandığında, "
        "kalan üç DL mimarisi %94,62 ortalama elde etmekte ve Lojistik Regresyon "
        "dışlandığında ML ortalaması %94,02'ye yükselmektedir. Bu sonuç, 47 boyutlu "
        "öznitelik vektörünün ayırt edici bilginin büyük kısmını zaten kodladığını; "
        "öznitelik mühendisliğinin model kapasitesinden daha belirleyici bir etken "
        "olduğunu göstermektedir. Aynı öznitelik vektörünü giriş olarak alan derin "
        "modeller, bu öznitelikler içinde mevcut olmayan ayırt edici bilgiye erişememekte; "
        "bu bulgu Yi vd. [6] tarafından özetlenen ses derin sahte literatürüyle de "
        "tutarlıdır."
    ))

    figure(doc, "paper_ml_vs_dl.png",
           "Şekil 6. Makine öğrenmesi (altın) ve derin öğrenme (koyu) mimarilerinin "
           "doğruluk, ROC-AUC ve F1 değerleri açısından toplam karşılaştırması.",
           "Aggregate comparison of machine learning (gold) and deep learning (dark) "
           "architectures across accuracy, ROC-AUC and F1.")

    figure(doc, "training_history.png",
           "Şekil 7. Dört derin öğrenme mimarisi için epok bazlı eğitim eğrileri; "
           "her panel beş katın ortalaması ve ±σ bant ile birlikte gösterilmektedir.",
           "Per-epoch training curves for the four deep learning architectures, mean "
           "across five folds with ±σ band.",
           width_cm=8.5)

    subheading(doc, "3.3. Katlar-Arası Kararlılık (Cross-Fold Stability)")
    body(doc, (
        "Şekil 8, on bir modelin her bir kat için ROC-AUC değerlerini, ortalamasını ve "
        "standart sapmasını sunmaktadır. LightGBM, ±0,0023 standart sapmasıyla havuzdaki "
        "en kararlı modeldir; beş katı 0,9515 ile 0,9580 arasında dar bir aralıkta "
        "değişmektedir. XGBoost (±0,0029) ve Gradyan Artırma (±0,0038) onu izlemektedir. "
        "En değişken modeller 1D-CNN (±0,0087) ve SVM-RBF (±0,0075) olmuştur. "
        "Kararlılığa göre sıralama, ortalama AUC sıralamasını yakından izlemekte; en "
        "yüksek skoru veren modeller aynı zamanda en az değişken olanlar olmaktadır. "
        "Bu örüntü, konuşlandırılabilir bir tespit sistemi için arzu edilen "
        "karakteristiği yansıtmaktadır."
    ))

    figure(doc, "paper_fold_std_table.png",
           "Şekil 8. On bir modelin her bir katı için ROC-AUC değerleri, ortalama AUC "
           "(azalan sırada) ve standart sapma. LightGBM hem en yüksek ortalamaya hem de "
           "en düşük katlar-arası varyansa sahiptir (±0,0023).",
           "Per-fold ROC-AUC for all eleven models, mean AUC (descending) and standard "
           "deviation. LightGBM combines the highest mean with the lowest fold-to-fold "
           "variance (±0.0023).",
           width_cm=8.5)

    subheading(doc, "3.4. Öznitelik Önemi (Feature Importance)")
    body(doc, (
        "Tablo 5, LightGBM modelinde normalleştirilmiş kazanca göre sıralanan ilk yirmi "
        "özniteliği listelemektedir. Spektral düzlük -hem kare başına standart sapma "
        "hem de ortalama olarak ölçülen- ilk beş içinde iki kez yer almakta, standart "
        "sapması belirgin bir farkla ilk sırayı oluşturmaktadır. Spektral kontrast "
        "ortalaması (sıra 2), RMS enerji (sıra 3) ve başlangıç gücü standart sapması "
        "(sıra 4) ilk grubu tamamlamaktadır. Vokal aile özniteliklerinin ilk yirmi "
        "içinde yalnızca breath_pattern_score (sıra 18) yer almaktadır; bu durum, vokal "
        "özniteliklerinin enstrümantal parçalarda anlamlı sinyal üretmemesi ile "
        "tutarlıdır. Şekil 9, ilk yirmi özniteliğin önem skorlarını çubuk grafik olarak; "
        "Şekil 10 ise TreeSHAP [11] tabanlı global etki dağılımını görselleştirmektedir."
    ))

    table_caption(doc,
        "Tablo 5. LightGBM'in normalleştirilmiş kazanç önemine göre ilk on özniteliği",
        "Top ten features ranked by LightGBM's normalised gain importance")
    add_table(doc,
        headers=["Sıra", "Öznitelik", "Önem"],
        rows=[
            ["1",  "spectral_flatness_std",   "0,0619"],
            ["2",  "spectral_contrast_mean",  "0,0467"],
            ["3",  "rms_energy",              "0,0456"],
            ["4",  "onset_strength_std",      "0,0388"],
            ["5",  "spectral_flatness_mean",  "0,0370"],
            ["6",  "rms_dynamic_range",       "0,0346"],
            ["7",  "onset_strength_mean",     "0,0332"],
            ["8",  "rms_std",                 "0,0298"],
            ["9",  "beat_count",              "0,0298"],
            ["10", "mfcc_delta_var",          "0,0289"],
        ])

    figure(doc, "paper_feature_importance.png",
           "Şekil 9. LightGBM modelinde ilk yirmi özniteliğin normalleştirilmiş önem "
           "skorları. Spektral düzlük standart sapması açık bir farkla ilk sırada.",
           "Top-twenty feature importances in LightGBM (normalised). "
           "spectral_flatness_std leads by a clear margin.")

    figure(doc, "shap_summary.png",
           "Şekil 10. 2.000 örneklik bir CV diliminde LightGBM için TreeSHAP global "
           "etki diyagramı; her nokta tek bir örneği, yatay konum SHAP değerini, renk "
           "ise öznitelik büyüklüğünü kodlamaktadır.",
           "TreeSHAP global effect plot for LightGBM on a 2,000-sample CV slice; each "
           "point is one sample, horizontal position is the SHAP value, colour encodes "
           "feature magnitude.",
           width_cm=8.5)

    subheading(doc, "3.5. Karmaşıklık Matrisi, Skor Dağılımı ve Kalibrasyon "
                    "(Confusion Matrix, Score Distribution and Calibration)")
    body(doc, (
        "Şekil 11, LightGBM'in 5-katlı doğrulama tahminlerinin Youden-optimal eşik "
        "θ* = 0,4316 ile eşiklendiği durumda elde edilen karmaşıklık matrisini "
        "göstermektedir. Matris şu değerleri raporlamaktadır: 2.721 doğru negatif "
        "(insan örneklerinin %87,4'ü), 1.862 doğru pozitif (yapay zekâ örneklerinin "
        "%89,4'ü), 392 yanlış pozitif (insan örneklerinin %12,6'sı yapay zekâ olarak "
        "atanmış) ve 220 yanlış negatif (yapay zekâ örneklerinin %10,6'sı insan olarak "
        "atanmış). Yapay zekâ sınıfı için duyarlılık (%89,4) insan örnekleri için "
        "özgüllük (%87,4) ile esasen dengelidir; küçük asimetri Youden ölçütünden "
        "kaynaklanmaktadır."
    ))

    figure(doc, "paper_confusion_matrix_lightgbm.png",
           "Şekil 11. LightGBM için Youden-optimal eşik θ* = 0,4316 altında karmaşıklık "
           "matrisi. Hücreler örnek sayıları ve ilgili sınıf-içi yüzdeleri "
           "göstermektedir.",
           "Confusion matrix for LightGBM at the Youden-optimal threshold θ* = 0.4316. "
           "Cells show sample counts and corresponding within-class percentages.",
           width_cm=8.5)

    body(doc, (
        "Şekil 12, insan ve yapay zekâ sınıfları için P(AI) tahmini olasılık dağılımlarını "
        "ayrı ayrı çizmektedir. İki dağılım iyi ayrılmıştır; örtüşme yalnızca 0,4-0,6 "
        "merkezi bölgede önemli ölçüde mevcuttur. Kesik çizgi Youden-optimal eşiği "
        "işaretlemektedir; eşiğin simetrik 0,5 değerinin solunda konumlanması sınıf "
        "dengesizliği (yapay zekâ : insan ≈ 1 : 1,5) ile J(θ) maksimizasyonunun "
        "birleşik etkisini yansıtmaktadır. Şekil 13, kalibrasyon eğrisini sunmaktadır. "
        "Eğri olasılık aralığı boyunca köşegene yakın seyretmekte ve Brier skoru 0,083 "
        "olarak ölçülmektedir; bu değer, üretilen olasılıkların gerçek arka olasılığın "
        "güvenilir tahminleri olduğunu doğrulamaktadır."
    ))

    figure(doc, "paper_score_distribution.png",
           "Şekil 12. İnsan (yeşil) ve yapay zekâ (kırmızı) örnekleri için P(AI) tahmin "
           "olasılık dağılımları. Kesik çizgi Youden-optimal karar eşiği θ* = 0,4316.",
           "Predicted-probability distributions of P(AI) for human (green) and AI (red) "
           "samples. Dashed line marks the Youden-optimal decision threshold "
           "θ* = 0.4316.")

    figure(doc, "paper_calibration.png",
           "Şekil 13. LightGBM için kalibrasyon eğrisi. Köşegen ideal kalibrasyona "
           "karşılık gelir; Brier skoru = 0,083.",
           "Calibration curve for LightGBM. Diagonal corresponds to perfect calibration; "
           "Brier score = 0.083.",
           width_cm=8.5)

    figure(doc, "paper_precision_recall.png",
           "Şekil 14. LightGBM için kesinlik-duyarlılık eğrisi; ortalama kesinlik "
           "0,934 olarak ölçülmüştür ve sınıf oranı 1:1,5 için ima edilen 0,401 "
           "baz çizgisinin çok üstündedir.",
           "Precision-recall curve for LightGBM; average precision is 0.934, well above "
           "the no-skill baseline of 0.401 implied by the 1:1.5 class ratio.",
           width_cm=8.5)

    subheading(doc, "3.6. Eşik Taraması ve Karar Çalışma Noktaları "
                    "(Threshold Sweep and Decision Operating Points)")
    body(doc, (
        "Şekil 15, kesinlik, duyarlılık, F1 ve doğruluğun karar eşiğine göre nasıl "
        "değiştiğini göstermektedir. F1 skoru 0,40-0,50 aralığında bir plato "
        "oluşturmakta; Youden-optimal eşik bu platonun sol kenarında konumlanmaktadır. "
        "Bu örüntü, farklı çalıştırma maliyetlerine sahip kullanıcıların eğri üzerinde "
        "güvenle hareket edebileceğini göstermektedir."
    ))

    figure(doc, "threshold_sweep.png",
           "Şekil 15. LightGBM için karar eşiğine karşı kesinlik, duyarlılık ve F1 "
           "taraması. Youden-J optimumu θ* = 0,4316 kesik çizgi ile işaretlenmiştir.",
           "Threshold sweep of precision, recall and F1 versus decision threshold for "
           "LightGBM. Youden-J optimum θ* = 0.4316 is marked with the dashed line.")

    subheading(doc, "3.7. Üretici Bazlı Performans (Per-Generator Performance)")
    body(doc, (
        "Veri kümesi 12'den fazla üretici sistemden örnek içerdiğinden, üretici bazlı "
        "performans toplam metriklerin ötesinde bilgilendiricidir. Şekil 16, LightGBM'in "
        "kaynak bazlı performansını sunmaktadır. Suno parçaları %93,0 duyarlılık (500'de "
        "465) ile, Echoes %88,6 (1.128'de 999) ile kurtarılmaktadır. AImE alt kümesi "
        "(n=204) %79,9'a düşmektedir. Deepfake seti ise tam olarak %50,0'da kalmakta; "
        "yani bu parçaların yarısı tespit edilememektedir. İnsan tarafında, GTZAN "
        "(%93,2) ve FMA (%88,9) güvenilir biçimde tanınırken SleepyJesse kapak seti "
        "(n=854) %76,3'e düşmektedir. İki başarısızlık noktası -deepfake alt kümesi ve "
        "SleepyJesse kapakları- aynı yöne işaret etmektedir: akustik profili kendi sınıf "
        "etiketinin geri kalanından sistematik olarak farklı olan parçalar modeli "
        "zorlamaktadır. Bu durum Li vd. [5] tarafından vurgulanan üretici-modeller arası "
        "genelleme zorluğu ile tutarlıdır."
    ))

    figure(doc, "per_source_performance.png",
           "Şekil 16. LightGBM'in 5-katlı çapraz doğrulama tahminleri üzerinde "
           "θ* = 0,4316 ile kaynak bazlı performansı. Yapay zekâ kaynakları (kırmızı) "
           "AI sınıfı duyarlılığı ile, insan kaynakları (yeşil) özgüllük ile "
           "değerlendirilmiştir.",
           "Per-source LightGBM performance on 5-fold CV predictions at θ* = 0.4316. "
           "AI sources (red) evaluated by AI-class recall; human sources (green) by "
           "specificity.")

    figure(doc, "per_class_metrics.png",
           "Şekil 17. LightGBM için sınıf bazlı kesinlik, duyarlılık ve F1 değerleri.",
           "Per-class precision, recall and F1 for LightGBM.")

    subheading(doc, "3.8. Spektral Düzlüğün Baskınlığı Neden? "
                    "(Why Spectral Flatness Dominates)")
    body(doc, (
        "Spektral düzlüğün öznitelik önem sıralamasındaki baskınlığı, daha geniş ses "
        "derin sahte literatürü ile tutarlı ve yorumlanabilir bir bulgudur [6]. Spektral "
        "düzlük, bir sinyalin güç spektrumunun geometrik ve aritmetik ortalamaları "
        "arasındaki oranı ölçmekte ve spektrumun ne kadar tonal veya gürültü-benzeri "
        "olduğunu yakalamaktadır. Güncel yapay zekâ üretim sistemleri, algısal kalite "
        "ölçütlerini -ki bu ölçütler tonal zenginliği desteklemektedir- optimize etme "
        "eğilimindedir ve bunun yan etkisi olarak spektrumları insan kayıtlarınınkinden "
        "sistematik olarak daha temiz olan sinyaller üretmektedir. İnsan kayıtları "
        "buna karşın kayıt ortamlarının, mikrofon ön-yükselticilerinin ve enstrümantal "
        "performansın katkıda bulunduğu geniş bantlı gürültüyü taşımaktadır."
    ))

    subheading(doc, "3.9. Üretici Modeller Arası Genelleme "
                    "(Cross-Generator Generalisation)")
    body(doc, (
        "Veri kümesi otoregresif modellerden (MusicGen [1]) difüzyon-tabanlı sistemlere "
        "(AudioLDM [2]) ve ticari üreticilere (Suno, Udio) kadar on iki veya daha fazla "
        "yapay zekâ üretim sistemini kapsamaktadır. Bu çeşitliliğin amacı, modeli tek bir "
        "üretici ailenin parmak izlerine aşırı uydurmaktan kaçınmaktır. §3.7'de "
        "raporlanan kaynak bazlı sonuçlar, bu yaklaşımın kısmen başarılı olduğunu "
        "göstermektedir; Suno ve Echoes parçalarında %88-93 duyarlılık elde edilmekte "
        "ancak deepfake alt kümesinde performans %50'ye düşmektedir. Bu sonuç, Li vd. "
        "[5] tarafından alanın açık problemi olarak işaret edilen üretici-modeller arası "
        "genelleme zorluğunu doğrulamaktadır."
    ))

    subheading(doc, "3.10. 1D-CNN Neden Düşük Performans Gösteriyor? "
                    "(Why the 1D-CNN Underperforms)")
    body(doc, (
        "1D-CNN'nin diğer mimarilere kıyasla belirgin biçimde düşük performansı "
        "(ROC-AUC = 0,8543) mimari bir uyumsuzluğun sonucudur. Tek boyutlu konvolüsyon, "
        "bir dizi boyunca yerel korelasyonları sömürmek üzere tasarlanmıştır; ancak "
        "AURIS'in girişi sıralanmamış 47 boyutlu düz bir öznitelik vektörüdür ve "
        "vektörün bitişik indeksleri ilgisiz miktarlara karşılık gelmektedir -bir "
        "spektral istatistik yanında bir tempo istatistiği, yanında bir vokal skor-. "
        "Bu liste boyunca bir çekirdek kaydıran konvolüsyonun öğreneceği anlamlı bir "
        "öteleme değişmezliği bulunmamaktadır. Sonuç olarak 1D-CNN, vektörü bir bütün "
        "olarak işleyen diğer üç DL mimarisinin gerisinde kalmakta ve doğrulukta "
        "Lojistik Regresyon tarafından bile geçilmektedir."
    ))

    subheading(doc, "3.11. Kalibrasyon ve Operasyonel Yararlılık "
                    "(Calibration and Operational Utility)")
    body(doc, (
        "Tespit sistemlerinin operasyonel konuşlandırmaları çoğunlukla bir hedef "
        "kesinlik veya duyarlılık üzerinden bir karar noktası seçmeyi gerektirir. 0,083 "
        "Brier skoru bunu mümkün kılmaktadır; çünkü tahmin edilen olasılıklar gerçek "
        "arka olasılığa yakın karşılık gelmektedir. Bu, 0,7 eşiğinin gerçekten '%70 "
        "güvenli' anlamına geldiğini, 'skor dağılımının 70. yüzdelik dilimi' anlamına "
        "gelmediğini ifade eder. Youden-optimal kesim noktası 0,4316, mevcut sınıf oranı "
        "altında dengeli doğruluk için ilkesel bir varsayılan değerdir; ancak farklı "
        "operasyonel maliyetlere sahip kullanıcılar Şekil 15'te görselleştirilen eğri "
        "boyunca eşiği güvenle hareket ettirebilir."
    ))

    subheading(doc, "3.12. Aşırı Öğrenme Tanısı (Overfit Diagnosis)")
    body(doc, (
        "Topluluğun ezberleyip ezberlemediğini doğrudan sorgulamanın bir yolu, her "
        "modelin eğitim doğruluğunu 5-katlı çapraz doğrulama doğruluğu ile karşılaştırmaktır. "
        "Şekil 18, sonucu raporlamaktadır. Rastgele Orman %100,0 eğitim doğruluğuna karşı "
        "CV altında %86,1'e ulaşmakta; bu 13,9 puanlık bir fark anlamına gelmektedir. "
        "LightGBM ve SVM sırasıyla 12,0 ve 13,4 puanlık farklarla yakın takipte. XGBoost "
        "ve Gradyan Artırma bile -daha güçlü yerleşik düzenleştirmelerine rağmen- 8-9 "
        "puanlık bir fark sergilemektedir. Eğitim ve CV doğruluklarının esasen örtüştüğü "
        "tek topluluk üyesi 0,6 puanlık fark ile Lojistik Regresyondur. Bu örüntü "
        "bilgilendiricidir: ağaç toplulukları, 5-katlı CV'nin yakaladığı ama tek bir "
        "eğitim/test bölünmesinin yakalamayacağı gerçek bir aşırı öğrenme taşımaktadır. "
        "Nihai %88,0 CV doğruluğu (LightGBM) anlamlı bir tavan olarak okunmalı, rahat "
        "bir marj olarak değil."
    ))

    figure(doc, "train_val_gap.png",
           "Şekil 18. Yedi öznitelik tabanlı modelin eğitim ve 5-katlı çapraz doğrulama "
           "doğrulukları. Fark, her modelin nominal doğruluğunun ne kadarının eğitim "
           "setini ezberlemekten geldiğini ölçmektedir.",
           "Train versus 5-fold cross-validation accuracy for the seven feature-based "
           "models. The gap quantifies how much of each model's nominal accuracy comes "
           "from memorising the training set.")

    subheading(doc, "3.13. Öznitelik Fazlalığı (Feature Redundancy)")
    body(doc, (
        "47 öznitelik tasarım gereği fazlalıklıdır -spektrum, ritim ve sesin örtüşen "
        "yönlerini kapsamaktadır- ancak fazlalık beklenenden ağırdır. Yirmi öznitelik "
        "çiftinin |Pearson r| değeri tüm veri kümesinde 0,85'in üzerindedir. Dört çift "
        "0,97'yi aşmaktadır: has_vocals ile vocal_harmonic_ratio (r = 0,994), "
        "pitch_std_cents ile vibrato_extent_cents (0,983), vocal_texture_score ile "
        "vocal_harmonic_ratio (0,975) ve has_vocals ile vocal_texture_score (0,974). "
        "Vokal olmayan öznitelikler arasında spektral merkez, bant genişliği ve azalma "
        "ortalamaları sıkı bir küme oluşturmaktadır (ikili r > 0,94). Şekil 19, tüm "
        "|r| matrisini çizmekte; aşağı-sağda yer alan koyu çapraz-dışı bloklar vokal "
        "öznitelik ailesine karşılık gelmektedir."
    ))

    figure(doc, "feature_correlation_heatmap.png",
           "Şekil 19. 47 öznitelik arasında mutlak Pearson korelasyon ısı haritası "
           "(tüm 5.195 parça üzerinden). Koyu hücreler fazlalıklı çiftleri "
           "işaretlemektedir.",
           "Absolute Pearson correlation heatmap between the 47 features across all "
           "5,195 tracks. Dark cells mark redundant pairs.",
           width_cm=8.5)

    subheading(doc, "3.14. Kaç Öznitelik Gerçekten Gereklidir? "
                    "(How Many Features Are Actually Needed?)")
    body(doc, (
        "Şekil 20, bir öznitelik çıkarma deneyi raporlamaktadır. Öznitelikler LightGBM "
        "önemine göre sıralanmakta ve ilk-N için N ∈ {1, 3, 5, 10, 15, 20, 30, 47} "
        "değerleri aynı 5-katlı çapraz doğrulama hattından geçirilmektedir. Eğri "
        "N = 10'a kadar diktir -doğruluk %59,8'den (N=1), %78,1 (N=5), %84,7 (N=10) "
        "değerlerine yükselmektedir- ve sonrasında plato yapar. N = 20'de doğruluk "
        "%88,0, N = 30'da %88,7'ye ulaşmakta ve tüm 47 özniteliğin kullanılması %88,5 "
        "vermektedir -bu N = 30 ile bir standart sapma içinde eşdeğerdir. Başka bir "
        "deyişle, önem sırasına göre sondaki on yedi öznitelik ölçülebilir ek doğruluk "
        "sağlamamaktadır. Pratik bir konuşlandırma, kalite kaybı olmadan bu uzun "
        "kuyruğu kesebilir."
    ))

    figure(doc, "feature_ablation_curve.png",
           "Şekil 20. LightGBM'in 5-katlı CV doğruluğunun, öneme göre sıralanmış "
           "korunan öznitelik sayısının bir fonksiyonu olarak değişimi. Plato yaklaşık "
           "20 öznitelikte başlamakta; son 17 öznitelik ölçülen doğruluğu "
           "değiştirmemektedir.",
           "5-fold CV accuracy of LightGBM as a function of the number of features "
           "retained, ranked by importance. The plateau begins at roughly 20 features; "
           "the last 17 features do not change measured accuracy.")

    subheading(doc, "3.15. Sınırlamalar (Limitations)")
    body(doc, (
        "Açıkça kaydedilmesi gereken dört sınırlama bulunmaktadır. Birincisi, "
        "öznitelikler 15-30 saniye uzunluğundaki tam klipten çıkarılmaktadır; daha kısa "
        "klipler (< 5 saniye) özellikle tempo ve vibrato istatistikleri için daha az "
        "güvenilir tahminler vermektedir, dolayısıyla sistem henüz canlı-mikrofon kısa-"
        "klip rejiminde değerlendirilmemiştir. İkincisi, veri kümesi yirmi türü "
        "kapsamakla birlikte, bazı türler (özellikle ambient ve lo-fi) yapay zekâ "
        "kısmında aşırı temsil edilmektedir; tür-stratifiye değerlendirme genellemeyi "
        "daha titiz olarak hesaba katacaktır. Üçüncüsü, düşmanca sağlamlık açıkça test "
        "edilmemiştir; MP3 sıkıştırma, perde kaydırma veya zaman gerdirme gibi sonradan "
        "işlemlerin tespit performansını azalttığı, vokoder izlerine dayanan sistemler "
        "için bilinmektedir (Afchar vd. [7]). AURIS, öznitelikleri vokoder izleri "
        "etrafında kurulu olmadığından bu etkiye daha az ciddi biçimde uğrayacaktır "
        "ama bağışıklık değildir. Dördüncüsü, §3.12'de raporlanan eğitim-CV farkları "
        "modelin dağılım kayışına duyarlı olduğunu göstermektedir; bu durum SONICS [23] "
        "ve FakeMusicCaps [24] gibi yeni kıyaslamalar üzerinde resmi bir tutulan "
        "değerlendirme ile teyit edilmelidir."
    ))

    # ══════════════════════════════════════════════════════════════════
    # 4. SONUÇ
    # ══════════════════════════════════════════════════════════════════
    heading(doc, "4. Sonuç (Conclusion)")
    body(doc, (
        "Bu çalışmada, yapay zekâ tarafından üretilen müziği insan kompozisyonundan "
        "ayırt etmek için AURIS adlı uçtan-uca bir sistem sunulmuştur. Sistem, 47 "
        "boyutlu elle tasarlanmış bir akustik öznitelik vektörünü, on iki veya daha "
        "fazla yapay zekâ üretim sisteminden derlenen 5.195 örnek üzerinde eğitilen on "
        "bir sınıflandırma modelinden oluşan bir topluluk ile eşleştirmektedir. Temel "
        "ampirik bulgular şunlardır: LightGBM, %95,48 ortalama ROC-AUC değeri ile en "
        "yüksek performansı elde etmekte, Deep MLP %95,42 ile çok yakın bir ikinci sıra "
        "almakta ve LightGBM aynı zamanda havuzdaki en düşük katlar-arası varyansı "
        "(±0,0023) göstermektedir. Spektral düzlük, yapay zekâ-insan ayrımı için en "
        "bilgilendirici tek öznitelik olarak ortaya çıkmakta ve bu örüntü sentetik ve "
        "kaydedilmiş spektrumlar arasındaki fark açısından yorumlanabilir niteliktedir. "
        "Youden J ölçütü ile her kat için eşik optimizasyonu, mevcut 1:1,5 sınıf "
        "dengesizliği altında varsayılan 0,5 kesim noktasını sistematik biçimde "
        "geçmektedir. Tanı analizi iki sınırlamayı açıkça ortaya koymaktadır: tüm ağaç "
        "toplulukları eğitim ile çapraz doğrulama doğruluğu arasında 8-14 puanlık bir "
        "fark sergilemekte ve öznitelik çıkarma, 47 özniteliğin sondaki yaklaşık on "
        "yedisinin ölçülebilir ek doğruluk sağlamadığını göstermektedir."
    ))
    body(doc, (
        "Gelecek çalışmalar dört yön takip edecektir. Birincisi, SONICS [23] ve "
        "FakeMusicCaps [24] gibi gelişmekte olan halka açık kıyaslamalar üzerinde "
        "resmi bir üretici-modeller arası tutulan değerlendirme gerçekleştirilecektir. "
        "İkincisi, ince ayar yapılmış wav2vec2 [13] modeli, öznitelik tabanlı "
        "sınıflandırıcılarla doğrudan karşılaştırma için 5-katlı çapraz doğrulama "
        "protokolüne entegre edilecektir. Üçüncüsü, düşmanca sağlamlık MP3 sıkıştırma, "
        "perde kaydırma ve zaman gerdirme altında açıkça değerlendirilecektir. "
        "Dördüncüsü, veri kümesi on bin örneğe doğru genişletilecek ve ortaya çıkan "
        "yapay zekâ üretim sistemleri eklenecektir; özellikle Li vd. [5] tarafından "
        "tanımlanan üretici-modeller arası genelleme zorluğuna odaklanılacaktır."
    ))

    heading(doc, "Yapay Zekâ Beyanı (AI Disclosure)")
    body(doc, (
        "Üretken yapay zekâ, bu çalışmanın hazırlanması sırasında dil düzenlemesi ve "
        "şekil/analiz kodunun bir kısmı için yardımcı bir araç olarak kullanılmıştır. "
        "Tüm veriler, eğitilmiş modeller ve deneysel sonuçlar yazara aittir ve raporlanan "
        "her sayısal değer dayanak alınan veriler ile doğrulanmıştır. Yazar, tüm içeriğin "
        "bütünlüğü ve doğruluğunun sorumluluğunu üstlenmektedir."
    ))

    heading(doc, "Yazar Katkıları (Author Contributions)")
    body(doc, (
        "Hasan Arthur Altuntaş: Kavramsallaştırma, metodoloji, yazılım, veri "
        "küratörlüğü, biçimsel analiz, araştırma, yazma — taslak hazırlama, yazma — "
        "inceleme ve düzenleme, görselleştirme."
    ))

    heading(doc, "Teşekkür (Acknowledgement)")
    body(doc, "Bu araştırma herhangi bir dış finansman almamıştır.")

    heading(doc, "Çıkar Çatışması (Conflict of Interest)")
    body(doc, "Yazar herhangi bir çıkar çatışması beyan etmemektedir.")

    # ══════════════════════════════════════════════════════════════════
    # KAYNAKLAR (IEEE numerik format)
    # ══════════════════════════════════════════════════════════════════
    refs_heading = heading(doc, "Kaynaklar (References)")
    _page_break_before(refs_heading)

    refs = [
        "Copet J., Kreuk F., Gat I., Remez T., Kant D., Synnaeve G., Adi Y., Défossez A., "
        "Simple and Controllable Music Generation, Advances in Neural Information "
        "Processing Systems, 36, 2023. DOI: 10.48550/arXiv.2306.05284.",

        "Liu H., Chen Z., Yuan Y., Mei X., Liu X., Mandic D., Wang W., Plumbley M.D., "
        "AudioLDM: Text-to-Audio Generation with Latent Diffusion Models, Proceedings "
        "of the International Conference on Machine Learning (ICML 2023), 21450-21474, "
        "Honolulu, Hawaii, A.B.D., 23-29 Temmuz, 2023. DOI: 10.48550/arXiv.2301.12503.",

        "Yi J., Fu R., Tao J., Nie S., Ma H., Wang C., Wang T., Tian Z., Bai Y., Fan C., "
        "ADD 2022: The First Audio Deep Synthesis Detection Challenge, Proceedings of "
        "the IEEE International Conference on Acoustics, Speech and Signal Processing "
        "(ICASSP 2022), 9216-9220, Singapur, 22-27 Mayıs, 2022. DOI: "
        "10.1109/ICASSP43922.2022.9746939.",

        "Frank J., Schönherr L., WaveFake: A Data Set to Facilitate Audio Deepfake "
        "Detection, Advances in Neural Information Processing Systems 2021 Datasets "
        "and Benchmarks Track, 2021. DOI: 10.5281/zenodo.5642694.",

        "Li Y., Milling M., Specia L., Schuller B.W., From Audio Deepfake Detection to "
        "AI-Generated Music Detection: A Pathway and Overview, arXiv preprint "
        "arXiv:2412.00571, 2024. DOI: 10.48550/arXiv.2412.00571.",

        "Yi J., Wang C., Tao J., Zhang X., Zhang C.Y., Zhao Y., Audio Deepfake Detection: "
        "A Survey, arXiv preprint arXiv:2308.14970, 2023. DOI: 10.48550/arXiv.2308.14970.",

        "Afchar D., Meseguer Brocal G., Hennequin R., AI-Generated Music Detection and "
        "Its Challenges, Proceedings of the IEEE International Conference on Acoustics, "
        "Speech and Signal Processing (ICASSP 2025), Hyderabad, Hindistan, 6-11 Nisan, "
        "2025. DOI: 10.48550/arXiv.2501.10111.",

        "Kim Y., Go S., Segment Transformer: AI-Generated Music Detection via Music "
        "Structural Analysis, arXiv preprint arXiv:2509.08283, 2025. DOI: "
        "10.48550/arXiv.2509.08283.",

        "Chen T., Guestrin C., XGBoost: A Scalable Tree Boosting System, Proceedings of "
        "the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data "
        "Mining (KDD '16), 785-794, San Francisco, CA, A.B.D., 13-17 Ağustos, 2016. "
        "DOI: 10.1145/2939672.2939785.",

        "Ke G., Meng Q., Finley T., Wang T., Chen W., Ma W., Ye Q., Liu T.Y., LightGBM: "
        "A Highly Efficient Gradient Boosting Decision Tree, Advances in Neural "
        "Information Processing Systems 30 (NIPS 2017), 3149-3157, Long Beach, "
        "California, A.B.D., 4-9 Aralık, 2017.",

        "Lundberg S.M., Lee S.I., A Unified Approach to Interpreting Model Predictions, "
        "Advances in Neural Information Processing Systems 30 (NIPS 2017), 4768-4777, "
        "Long Beach, California, A.B.D., 4-9 Aralık, 2017. DOI: "
        "10.48550/arXiv.1705.07874.",

        "Martín-Doñas J.M., Álvarez A., The Vicomtech Audio Deepfake Detection System "
        "Based on Wav2vec2 for the 2022 ADD Challenge, Proceedings of the IEEE "
        "International Conference on Acoustics, Speech and Signal Processing (ICASSP "
        "2022), 9266-9270, Singapur, 22-27 Mayıs, 2022. DOI: "
        "10.1109/ICASSP43922.2022.9747768.",

        "Baevski A., Zhou Y., Mohamed A., Auli M., wav2vec 2.0: A Framework for "
        "Self-Supervised Learning of Speech Representations, Advances in Neural "
        "Information Processing Systems, 33, 12449-12460, 2020. DOI: "
        "10.5555/3495724.3496768.",

        "Elizalde B., Deshmukh S., Al Ismail M., Wang H., CLAP: Learning Audio Concepts "
        "from Natural Language Supervision, Proceedings of the IEEE International "
        "Conference on Acoustics, Speech and Signal Processing (ICASSP 2023), 1-5, "
        "Rhodes, Yunanistan, 4-10 Haziran, 2023. DOI: 10.1109/ICASSP49357.2023.10095889.",

        "Wu Y., Chen K., Zhang T., Hui Y., Berg-Kirkpatrick T., Dubnov S., Large-Scale "
        "Contrastive Language-Audio Pretraining with Feature Fusion and "
        "Keyword-to-Caption Augmentation, Proceedings of the IEEE International "
        "Conference on Acoustics, Speech and Signal Processing (ICASSP 2023), 1-5, "
        "Rhodes, Yunanistan, 4-10 Haziran, 2023. DOI: 10.1109/ICASSP49357.2023.10095969.",

        "Liu Y., Yin Y., Zhu Q., Cui W., Musical Instrument Recognition by XGBoost "
        "Combining Feature Fusion, arXiv preprint arXiv:2206.00901, 2022. DOI: "
        "10.48550/arXiv.2206.00901.",

        "Gan R., Huang T., Shao J., Wang F., Music Genre Classification Based on "
        "VMD-IWOA-XGBoost, Mathematics, 12 (10), 1549, 2024. DOI: 10.3390/math12101549.",

        "Hızlısoy S., Tüfekci Z., Derin Öğrenme İle Türkçe Müziklerden Müzik Türü "
        "Sınıflandırması, Avrupa Bilim ve Teknoloji Dergisi, 24, 176-183, 2021. DOI: "
        "10.31590/ejosat.898588.",

        "Özbalcı M.C., Şahin H., Bilgin T.T., Classification of Music Genres of GTZAN "
        "Dataset with Machine Learning Methods, Mühendislik Bilimleri ve Araştırmaları "
        "Dergisi, 6 (1), 2024.",

        "Turan A.K., Polat H., Yarı Denetimli Makine Öğrenmesi Yöntemini Kullanarak "
        "Müzik Türlerinin Tespiti, Gazi Üniversitesi Fen Bilimleri Dergisi Part C: "
        "Tasarım ve Teknoloji, 12 (1), 92-107, 2024. DOI: 10.29109/gujsc.1352477.",

        "Kostrzewa D., Mazur W., Brzeski R., Wide Ensembles of Neural Networks in Music "
        "Genre Classification, Computational Science -- ICCS 2022, Lecture Notes in "
        "Computer Science, vol. 13351, 91-102, Springer, 2022. DOI: "
        "10.1007/978-3-031-08754-7_9.",

        "Gourisaria M.K., Agrawal R., Sahni M., Comparative Analysis of Audio "
        "Classification with MFCC and STFT Features Using Machine Learning Techniques, "
        "Discover Internet of Things, 4 (1), 1, 2024. DOI: 10.1007/s43926-023-00049-y.",

        "Rahman M.A., Hakim Z.I.A., Sarker N.H., Paul B., Fattah S.A., SONICS: "
        "Synthetic Or Not -- Identifying Counterfeit Songs, Proceedings of the "
        "International Conference on Learning Representations (ICLR 2025), Singapur, "
        "24-28 Nisan, 2025. DOI: 10.48550/arXiv.2408.14080.",

        "Comanducci L., Bestagini P., Tubaro S., FakeMusicCaps: A Dataset for Detection "
        "and Attribution of Synthetic Music Generated via Text-to-Music Models, arXiv "
        "preprint arXiv:2409.10684, 2024. DOI: 10.48550/arXiv.2409.10684.",

        "Pascu O., Oneata D., Cucu H., Müller N.M., Echoes: A Semantically-Aligned "
        "Music Deepfake Detection Dataset, arXiv preprint arXiv:2603.23667, 2025. DOI: "
        "10.48550/arXiv.2603.23667.",

        "Sunday N., Detecting Musical Deepfakes, arXiv preprint arXiv:2505.09633, 2025. "
        "DOI: 10.48550/arXiv.2505.09633.",

        "Sroka T., Wężowicz T., Sidorczuk D., Modrzejewski M., Evaluating Fake Music "
        "Detection Performance Under Audio Augmentations, arXiv preprint "
        "arXiv:2507.10447, 2025. DOI: 10.48550/arXiv.2507.10447.",

        "McFee B., Raffel C., Liang D., Ellis D.P.W., McVicar M., Battenberg E., Nieto O., "
        "librosa: Audio and Music Signal Analysis in Python, Proceedings of the 14th "
        "Python in Science Conference (SciPy 2015), 18-24, Austin, Texas, A.B.D., "
        "6-12 Temmuz, 2015. DOI: 10.25080/Majora-7b98e3ed-003.",

        "Pedregosa F., Varoquaux G., Gramfort A., Michel V., Thirion B., Grisel O., "
        "Blondel M., Prettenhofer P., Weiss R., Dubourg V., Vanderplas J., Passos A., "
        "Cournapeau D., Brucher M., Perrot M., Duchesnay E., Scikit-learn: Machine "
        "Learning in Python, Journal of Machine Learning Research, 12, 2825-2830, 2011.",

        "Kingma D.P., Ba J., Adam: A Method for Stochastic Optimization, Proceedings of "
        "the 3rd International Conference on Learning Representations (ICLR 2015), 1-15, "
        "San Diego, California, A.B.D., 7-9 Mayıs, 2015. DOI: 10.48550/arXiv.1412.6980.",
    ]

    for i, ref in enumerate(refs, start=1):
        reference_entry(doc, i, ref)

    # Save
    try:
        doc.save(str(OUT))
        target = OUT
    except PermissionError:
        target = OUT.parent / "AURIS_paper_TR_v2.docx"
        doc.save(str(target))
        print(f"NOTE: {OUT.name} locked, saved as {target.name} instead.")
    print(f"Saved: {target} ({target.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    build()
