"""
AURIS Türkçe makalesini RESMİ Gazi MMF Dergisi şablonunun üzerine yazar.

Yaklaşım: Dosya (2).docx'i base olarak yükle, tablo hücrelerini benim
içeriğimle doldur, ardından tablodan sonra ana metni (1.Giriş...
2.Materyal... 3.Sonuçlar... Sonuçlar (Conclusions)... Kaynaklar) ekle.

Bu yaklaşım, şablonun orijinal stillerini ve sayfa düzenini korur.
"""

from __future__ import annotations
from pathlib import Path
from copy import deepcopy

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.shared import Cm, Pt, RGBColor

HERE        = Path(__file__).resolve().parent
TEMPLATE    = HERE / "_official_template.docx"
FIGURES     = HERE.parent / "figures"
OUT         = HERE / "AURIS_paper_TR_template.docx"

GOLD = "C99347"
DARK = "333333"


# ───── Helpers ─────
def _set_font(run, *, size=9, bold=False, italic=False, color=DARK, name="Times New Roman"):
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


def _set_keep_with_next(paragraph):
    pPr = paragraph._p.get_or_add_pPr()
    pPr.append(OxmlElement("w:keepNext"))


def _clear_cell(cell):
    """Remove all existing paragraphs in cell, then return cell ready to add new content."""
    for p in cell.paragraphs:
        p._element.getparent().remove(p._element)
    # Add fresh empty paragraph
    cell.add_paragraph()


def cell_text(cell, text, *, size=9, bold=False, italic=False, align=None):
    """Replace cell content with single text run."""
    _clear_cell(cell)
    p = cell.paragraphs[0]
    if align is not None:
        p.alignment = align
    r = p.add_run(text)
    _set_font(r, size=size, bold=bold, italic=italic)
    return p


def cell_multi(cell, lines, *, size=9, bold=False, italic=False):
    """Multi-line cell: each line a new paragraph."""
    _clear_cell(cell)
    first = cell.paragraphs[0]
    r = first.add_run(lines[0])
    _set_font(r, size=size, bold=bold, italic=italic)
    for line in lines[1:]:
        p = cell.add_paragraph()
        r = p.add_run(line)
        _set_font(r, size=size, bold=bold, italic=italic)


# ───── Body helpers (after cover tables) ─────
def add_body(doc, text, *, size=9, justify=True):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY if justify else WD_ALIGN_PARAGRAPH.LEFT
    pf = p.paragraph_format
    pf.line_spacing = 1.5
    pf.first_line_indent = Cm(0.5)
    pf.space_before = Pt(0)
    pf.space_after = Pt(6)
    r = p.add_run(text)
    _set_font(r, size=size)
    return p


def add_heading(doc, text):
    """Ana bölüm başlığı — 8pt BOLD (resmi kurallara göre)"""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    pf = p.paragraph_format
    pf.line_spacing = 1.5
    pf.space_before = Pt(12)
    pf.space_after = Pt(4)
    r = p.add_run(text)
    _set_font(r, size=9, bold=True)
    _set_keep_with_next(p)


def add_subheading(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    pf = p.paragraph_format
    pf.line_spacing = 1.5
    pf.space_before = Pt(8)
    pf.space_after = Pt(2)
    r = p.add_run(text)
    _set_font(r, size=9, bold=True, italic=True)
    _set_keep_with_next(p)


def add_figure(doc, filename, caption_tr, caption_en, width_cm=8.0):
    img = FIGURES / filename
    if not img.exists():
        add_body(doc, f"[FIGURE MISSING: {filename}]")
        return
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pf = p.paragraph_format
    pf.space_before = Pt(6)
    pf.space_after = Pt(2)
    r = p.add_run()
    r.add_picture(str(img), width=Cm(width_cm))
    _set_keep_with_next(p)

    c1 = doc.add_paragraph()
    c1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    c1.paragraph_format.space_after = Pt(0)
    r = c1.add_run(caption_tr)
    _set_font(r, size=8, bold=True)
    _set_keep_with_next(c1)

    c2 = doc.add_paragraph()
    c2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    c2.paragraph_format.space_after = Pt(8)
    r = c2.add_run(f"({caption_en})")
    _set_font(r, size=8, italic=True)


def add_table_caption(doc, tr, en):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run(tr)
    _set_font(r, size=8, bold=True)
    _set_keep_with_next(p)

    p2 = doc.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p2.paragraph_format.space_after = Pt(2)
    r = p2.add_run(f"({en})")
    _set_font(r, size=8, italic=True)
    _set_keep_with_next(p2)


def _shade(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_color)
    tcPr.append(shd)


def add_data_table(doc, headers, rows):
    tbl = doc.add_table(rows=1 + len(rows), cols=len(headers))
    tbl.style = "Table Grid"
    for j, h in enumerate(headers):
        cell = tbl.rows[0].cells[j]
        _clear_cell(cell)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        _set_font(r, size=8, bold=True, color="FFFFFF")
        _shade(cell, GOLD)
    for i, row in enumerate(rows, start=1):
        bg = "F5F0E8" if i % 2 == 0 else "FFFFFF"
        for j, val in enumerate(row):
            cell = tbl.rows[i].cells[j]
            _clear_cell(cell)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(val)
            _set_font(r, size=8)
            _shade(cell, bg)
    doc.add_paragraph().paragraph_format.space_after = Pt(8)


def add_ref(doc, idx, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    pf = p.paragraph_format
    pf.left_indent = Cm(0.6)
    pf.first_line_indent = Cm(-0.6)
    pf.line_spacing_rule = WD_LINE_SPACING.SINGLE
    pf.space_after = Pt(2)
    r = p.add_run(f"{idx}. {text}")
    _set_font(r, size=8)


# ══════════════════════════════════════════════════════════════════════════
# BUILD
# ══════════════════════════════════════════════════════════════════════════
def build():
    doc = Document(str(TEMPLATE))

    # GUJSA resmi kurallar — A4 + 2.5cm marjin (şablon US Letter ile gelmiş, düzelt)
    for s in doc.sections:
        s.page_width    = Cm(21.0)
        s.page_height   = Cm(29.7)
        s.top_margin    = Cm(2.5)
        s.bottom_margin = Cm(2.5)
        s.left_margin   = Cm(2.5)
        s.right_margin  = Cm(2.5)

    # ───── Tablo 0: Başlık ─────
    tbl0 = doc.tables[0]
    # R1C0: TR başlık
    cell_text(tbl0.rows[1].cells[0],
              "AURIS: Çoklu-Model Topluluk Yaklaşımı ile Yapay Zekâ "
              "Tarafından Üretilen Müziklerin Tespiti",
              size=14, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    # R2C0: TR şablon uyarısı yerine — biz kendi başlığımızı tekrar koymayalım, EN başlık koyalım
    cell_text(tbl0.rows[2].cells[0],
              "AURIS: A Multi-Model Ensemble Approach for the Detection of "
              "AI-Generated Music",
              size=14, bold=True, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER)

    # ───── Tablo 1: Yazar bilgileri + Highlights + Keywords + Article Info + Correspondence ─────
    tbl1 = doc.tables[1]

    # R0: Yazar adları (3 sütun aynı içerik)
    for c in range(3):
        cell_text(tbl1.rows[0].cells[c], "Hasan Arthur Altuntaş*",
                  size=10, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)

    # R1: Kurum (3 sütun aynı)
    for c in range(3):
        cell_text(tbl1.rows[1].cells[c],
                  "Düzce Üniversitesi, Mühendislik Fakültesi, "
                  "Bilgisayar Mühendisliği Bölümü, 81620, Düzce, Türkiye",
                  size=9, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER)

    # R3: Highlights başlığı
    cell_text(tbl1.rows[3].cells[0], "Öne Çıkanlar:", size=9, bold=True)
    cell_text(tbl1.rows[3].cells[2], "Grafiksel/Tablo Özet:", size=9, bold=True)

    # R4: Highlights bullets + GA içerik
    cell_multi(tbl1.rows[4].cells[0], [
        "• 5.195 örneklik veri kümesi üzerinde 47 boyutlu akustik öznitelik vektörü ile "
        "uçtan-uca bir GenAI müzik tespit sistemi önerilmiştir.",
        "• Yedi makine öğrenmesi ve dört derin öğrenme algoritması 5-katlı çapraz "
        "doğrulama ile karşılaştırılmıştır.",
        "• LightGBM, %95,48 ROC-AUC ve ±0,0023 katlar-arası standart sapma ile "
        "en başarılı modeli oluşturmuştur.",
        "• Spektral düzlük standart sapması yapay zekâ-insan ayrımı için en bilgilendirici "
        "öznitelik olarak tespit edilmiştir.",
    ], size=9)

    # GA = Genişletilmiş Özet İngilizce (Article Writing Rules madde 4: Extended English Abstract)
    cell_text(tbl1.rows[4].cells[2],
              "The proliferation of text-to-music generators such as Suno, Udio and "
              "MusicGen has raised a detection problem of practical importance for "
              "copyright attribution and streaming-platform integrity. This paper proposes "
              "AURIS, a system that couples a 47-dimensional handcrafted acoustic feature "
              "vector with an ensemble of eleven classifiers. The models are trained on "
              "5,195 samples drawn from twelve AI generation systems and multiple human "
              "sources (GTZAN, FMA, SleepyJesse covers) under 5-fold cross-validation. "
              "LightGBM achieves the top ROC-AUC of 0.9548 with ±0.0023 cross-fold "
              "variance, combining the best mean with the lowest variance in the pool; "
              "Deep MLP follows narrowly at 0.9542. Spectral-flatness standard deviation "
              "ranks first in feature importance. A Youden-J optimised threshold of "
              "θ* = 0.4316 improves balanced accuracy over the default 0.5 cutoff, and a "
              "Brier score of 0.083 confirms that the probability outputs are well "
              "calibrated. Diagnostic analysis shows an 8-14 point train-CV accuracy gap "
              "for all tree-based models and reveals that roughly 17 of the 47 features "
              "contribute no measurable accuracy.",
              size=9, italic=True)

    # R5: Keywords başlığı
    cell_text(tbl1.rows[5].cells[0], "Anahtar Kelimeler:", size=9, bold=True)
    # R5C2 boş bırak (GA devamı)
    _clear_cell(tbl1.rows[5].cells[2])

    # R6: Keywords
    cell_multi(tbl1.rows[6].cells[0], [
        "Yapay zekâ tarafından üretilen müzik",
        "Derin öğrenme",
        "Gradyan artırma",
        "Topluluk öğrenmesi",
        "Spektral düzlük",
    ], size=9)
    _clear_cell(tbl1.rows[6].cells[2])

    # R7: Article Info başlığı
    cell_text(tbl1.rows[7].cells[0], "Makale Bilgileri:", size=9, bold=True)
    _clear_cell(tbl1.rows[7].cells[2])

    # R8: Received/Accepted/DOI
    cell_multi(tbl1.rows[8].cells[0], [
        "Araştırma Makalesi",
        "Geliş: gg.aa.yyyy",
        "Kabul: gg.aa.yyyy",
        "",
        "DOI:",
    ], size=9)
    _clear_cell(tbl1.rows[8].cells[2])

    # R9-10: boş, GA devamı
    for r in (9, 10):
        for c in (0, 1, 2):
            _clear_cell(tbl1.rows[r].cells[c])

    # R11: Acknowledgement (boş bırak)
    cell_text(tbl1.rows[11].cells[0], "Teşekkür:", size=9, bold=True)
    cell_text(tbl1.rows[11].cells[2], "—", size=9)

    # R12-13: boş
    for r in (12, 13):
        for c in (0, 1, 2):
            _clear_cell(tbl1.rows[r].cells[c])

    # R14: Correspondence başlığı
    cell_text(tbl1.rows[14].cells[0], "Yazışma Bilgisi:", size=9, bold=True)
    _clear_cell(tbl1.rows[14].cells[2])

    # R15: Author/email/phone
    cell_multi(tbl1.rows[15].cells[0], [
        "Yazar: Hasan Arthur Altuntaş",
        "e-posta: hasannarthurrr@gmail.com",
        "ORCID: 0009-0002-8302-7657",
    ], size=9)
    _clear_cell(tbl1.rows[15].cells[2])

    # R16: boş
    for c in (0, 1, 2):
        _clear_cell(tbl1.rows[16].cells[c])

    # R17: YAZARA NOT - zaten şablonda var, dokunma
    # (Şablonda hazır bilgi olarak duruyor; bilerek bırakıyoruz)

    # ══════════════════════════════════════════════════════════════════
    # ŞABLONDAKİ BOŞ PARAGRAFLARI TEMİZLE ve ana metni başlat
    # ══════════════════════════════════════════════════════════════════
    # Şablonun tablodan sonraki paragraflarını tara, ilk olanı tut (anchor)
    body_paragraphs = doc.paragraphs

    # ───── ANA METİN ─────
    add_heading(doc, "1. Giriş (Introduction)")

    add_body(doc,
        "Üretken yapay zekâ (Generative Artificial Intelligence-GenAI) sistemlerinin "
        "son üç yıl içerisinde araştırma laboratuvarlarından tüketici uygulamalarına "
        "doğru yaşadığı hızlı geçiş, metinden müziğe (text-to-music) üretim alanında "
        "belirgin bir dönüşümü beraberinde getirmiştir. Suno (sürüm 3-5), Udio, Meta "
        "tarafından geliştirilen MusicGen [1] sistemi ve AudioLDM [2] gibi difüzyon "
        "tabanlı modeller, kullanıcının sağladığı kısa bir metin istemi ile dakikalar "
        "mertebesinde tam uzunlukta müzik parçaları üretebilme kapasitesine ulaşmıştır. "
        "Üretilen bu parçaların, deneyimsiz bir dinleyici tarafından insan eliyle "
        "bestelenmiş kayıtlardan ayırt edilmesi çoğu durumda mümkün olmamaktadır. "
        "Bu gelişme; telif hakkı atıflandırması, çevrimiçi akış platformlarının içerik "
        "bütünlüğü, oturum müzisyenlerinin ekonomik hakları ve eğitimcilerin yazarlık "
        "değerlendirmesi gibi birçok kritik konuyu doğrudan etkilemektedir.")

    add_body(doc,
        "Konuşma için ses derin sahte tespiti (audio deepfake detection), ADD 2022 [3] "
        "yarışmaları ve WaveFake [4] gibi büyük ölçekli veri kümeleri sayesinde aktif "
        "bir araştırma alanı hâline gelmiştir. Buna karşın, GenAI ile üretilen müziğin "
        "tespiti henüz benzer bir olgunluğa ulaşamamıştır. Bunun temel nedeni, müziğin "
        "konuşmadan farklı olarak sabit bir sözlüğe, doğrulanabilir bir konuşmacı "
        "kimliğine veya prozodi izine sahip olmamasıdır. Müzik; harmonik karmaşıklık, "
        "çokseslilik, perküsyon ve insan stüdyoları ile sentetik üretim hatları "
        "arasında geniş bir varyasyon gösteren kayıt artefaktları içermektedir. Konu "
        "üzerinde gerçekleştirilen güncel tarama çalışmaları [5,6], alanın henüz "
        "oluşum aşamasında olduğunu belirtmekte ve üretici modeller arası genellemeyi "
        "alanın birincil açık problemi olarak vurgulamaktadır [5].")

    add_body(doc,
        "Yakın tarihli iki örnek çalışma, bu alandaki dengesizliği açık biçimde "
        "yansıtmaktadır. Afchar vd. tarafından öne sürülen çalışmada [7], oto-kodlayıcı "
        "(auto-encoder) artefaktlarını tanımak amacıyla eğitilen bir tespit sisteminin, "
        "nöral vokoderlerin (neural vocoder) bıraktığı spektral kalıntıları kullanarak "
        "%99,8 doğruluk değerine ulaşabildiği gösterilmiştir; ancak aynı sistemin, MP3 "
        "sıkıştırma ve perde kaydırma (pitch shifting) gibi basit ses manipülasyonları "
        "altında performansının ciddi biçimde düştüğü raporlanmıştır. Kim ve Go [8] "
        "ise kısa müzik segmentlerini önceden eğitilmiş bir kodlayıcı ile gömüp "
        "bunları bir Dönüştürücü (Transformer) başlığı ile birleştirerek bir müzik "
        "parçasının tamamındaki yapısal örüntüleri yakalayan Segment Transformer "
        "modelini önermiştir. Her iki yaklaşım da aynı temel kabulü paylaşmaktadır: "
        "hiçbir tek öznitelik ailesi tek başına farklı üretici sistemlere karşı "
        "yeterince sağlam değildir.")

    add_body(doc,
        "Bu çalışmada önerilen AURIS sistemi, söz konusu iki uç arasında dengeli bir "
        "konumda yer almaktadır. Sistem, tek bir temsile bağlı kalmak yerine; "
        "spektral, zamansal, harmonik ve vokal davranışı özetleyen 47 boyutlu elle "
        "tasarlanmış bir öznitelik vektörü ile kasıtlı biçimde heterojen on bir "
        "sınıflandırıcıdan oluşan bir topluluğu birleştirmektedir. Bu yaklaşımın amacı "
        "iki yönlüdür: birden çok GenAI üreticisi sisteminde rekabetçi tespit "
        "doğruluğu elde edebilmek ve tüketici donanımı üzerinde konuşlandırılabilir, "
        "yorumlanabilir ve güvenilir bir model elde edebilmek. Çalışmanın temel "
        "katkıları şunlardır: (𝑖) on iki GenAI üreticisinden ve birden çok insan "
        "kaynağından derlenen 5.195 örneklik halka açık bir veri kümesi; (𝑖𝑖) yedi ML "
        "ve dört DL algoritmasının ortak bir 5-katlı çapraz doğrulama protokolü "
        "altında karşılaştırmalı değerlendirilmesi; (𝑖𝑖𝑖) spektral düzlük standart "
        "sapmasının en bilgilendirici öznitelik olduğunu gösteren SHAP [11] tabanlı "
        "yorumlanabilirlik analizi.")

    add_body(doc,
        "Bu makalenin geri kalanı şu şekilde yapılandırılmıştır: 1.1-1.5 alt "
        "bölümleri ses derin sahte tespiti, Dönüştürücü tabanlı ses temsilleri, ses "
        "için topluluk yöntemleri ve GenAI müzik tespiti alanındaki güncel literatürü "
        "gözden geçirmektedir. 2. Bölüm önerilen sistemin veri kümesini, öznitelik "
        "çıkarma boru hattını, on bir sınıflandırma modelini ve eğitim protokolünü "
        "tanımlamaktadır. 3. Bölüm deneysel sonuçları sunmakta, öznitelik önemi ile "
        "kalibrasyonu yorumlamakta ve sınırlamaları belirtmektedir. Son olarak "
        "Sonuçlar bölümü, çalışmanın temel bulgularını özetlemekte ve gelecek "
        "araştırmalar için öngörülen yönleri sunmaktadır. Önerilen sistem, "
        "https://huggingface.co/spaces/Rtur2003/AURIS adresinde halka açık olarak "
        "kullanıma sunulmuştur.")

    add_subheading(doc, "1.1. Konuşma için Ses Derin Sahte Tespiti "
                        "(Audio Deepfake Detection for Speech)")
    add_body(doc,
        "Konuşma için ses derin sahte tespiti, GenAI ile üretilen müzik tespiti "
        "çalışmaları açısından doğrudan örnek alınan en olgun komşu alanı "
        "oluşturmaktadır. Yi vd. tarafından öne sürülen ADD 2022 [3] yarışmasında, bu "
        "alan resmî biçimde bir topluluk değerlendirme problemi olarak kurulmuş ve "
        "düşük kaliteli sahte ses (LF), kısmî sahte ses (PF) ile oyun tabanlı algılama "
        "(FG) olmak üzere üç ayrı parça tanımlanmıştır. Martín-Doñas ve Álvarez "
        "tarafından öne sürülen Vicomtech sistemi [12], önceden eğitilmiş wav2vec2 "
        "[13] öznitelik çıkarıcısının üzerine bir sınıflandırma başlığı yerleştirerek "
        "bu yarışmada güçlü bir performans elde etmiştir. Yi vd. [6] tarafından "
        "yürütülen kapsamlı bir tarama çalışmasında, alanın hem teknik hem de etik "
        "zorlukları ayrıntılı biçimde özetlenmiştir. Bunun yanı sıra, Frank ve "
        "Schönherr tarafından öne sürülen WaveFake [4] gibi büyük ölçekli veri "
        "kümeleri, vokoder-spesifik artefaktların tespit edilebilirliğinin sistematik "
        "biçimde incelenmesi için altyapı oluşturmuştur.")

    add_subheading(doc, "1.2. Dönüştürücü Tabanlı Ses Temsilleri "
                        "(Transformer-Based Audio Representations)")
    add_body(doc,
        "Dönüştürücü temelli ve kendi kendini denetimli (self-supervised) ses "
        "temsilleri, son beş yıl içerisinde geleneksel akustik öznitelik "
        "mühendisliğinin önemli bir alternatifi hâline gelmiştir. Baevski vd. "
        "tarafından öne sürülen çalışmada [13], ham ses sinyalinden ince ayar "
        "gerektirmeyen öznitelikler üreten wav2vec 2.0 mimarisi sunulmuştur. Elizalde "
        "vd. tarafından geliştirilen CLAP (Contrastive Language-Audio Pretraining) "
        "[14] yöntemi, karşıt öğrenme yaklaşımı ile ses ve metin temsillerini ortak "
        "bir gömü uzayında hizalamaktadır. Söz konusu çalışma, Wu vd. tarafından öne "
        "sürülen büyük ölçekli CLAP varyantında [15] genişletilmiş ve 633.526 "
        "ses-metin çiftinden öğrenilmiş daha güçlü bir model elde edilmiştir.")

    add_subheading(doc, "1.3. Ses İçin Topluluk Yöntemleri ve Gradyan Artırma "
                        "(Ensemble Methods and Gradient Boosting for Audio)")
    add_body(doc,
        "Topluluk öğrenmesi (ensemble learning) yöntemleri, ses sınıflandırma "
        "alanında istikrarlı biçimde rekabetçi sonuçlar üretmektedir. Liu vd. "
        "tarafından öne sürülen çalışmada [16], XGBoost tabanlı bir müzikal enstrüman "
        "tanıma sisteminin çoklu öznitelik füzyonu ile yüksek doğruluğa ulaşabildiği "
        "gösterilmiştir. Gan vd. [17] tarafından sunulan VMD-IWOA-XGBoost modeli, "
        "GTZAN ve Bangla veri kümeleri üzerinde diğer modelleri beş değerlendirme "
        "kriterinde geride bırakmıştır. Türkçe literatür kapsamında, Hızlısoy ve "
        "Tüfekci [18] derin öğrenme tabanlı bir mimari ile Türkçe müziklerin tür "
        "sınıflandırması üzerinde çalışmıştır. Özbalcı vd. [19], GTZAN veri kümesi "
        "üzerinde Rastgele Orman, SVM ve YSA algoritmalarını karşılaştırmalı olarak "
        "değerlendirerek Rastgele Orman ile %81 doğruluk değerine ulaşmıştır. Turan "
        "ve Polat [20] ise yarı denetimli makine öğrenmesi yöntemleri ile müzik "
        "türlerinin tespiti üzerine çalışmıştır. Kostrzewa vd. [21] geniş sinir ağı "
        "toplulukları yaklaşımı önermiş, Gourisaria vd. [22] ise MFCC ve STFT "
        "özniteliklerini karşılaştırmalı olarak incelemiştir.")

    add_subheading(doc, "1.4. GenAI Müzik Üretici Sistemleri (GenAI Music Generation Systems)")
    add_body(doc,
        "GenAI müzik üretim sistemleri, tespit problemini doğrudan şekillendiren "
        "teknik çeşitliliği yansıtmaktadır. Copet vd. tarafından geliştirilen "
        "MusicGen [1] sistemi, metne koşullu sıkıştırılmış ses andıçları üzerinde "
        "çalışan tek aşamalı bir Dönüştürücü dil modeli kullanmaktadır. Liu vd. [2] "
        "tarafından öne sürülen AudioLDM ise metinden sese üretim için CLAP "
        "gömmelerini koşullandırma sinyali olarak kullanan bir gizil difüzyon "
        "modelidir. Suno ve Udio gibi ticari ürünler altta yatan mimarilerini kamuoyu "
        "ile paylaşmamıştır; ancak çıktılarının sürümler arasında ölçülen spektral "
        "özellikleri, dağılımsal olarak gözlemlenebilir tutarlı bir iz bırakmaktadır.")

    add_subheading(doc, "1.5. GenAI Müzik Tespitinde Güncel Gelişmeler (2024-2025) "
                        "(Recent Advances in GenAI Music Detection (2024-2025))")
    add_body(doc,
        "Bu alandaki en doğrudan ilgili çalışmalar 2024-2025 yılları arasında "
        "yayımlanmıştır. Li vd. [5] ses derin sahte tespiti metodolojisini GenAI "
        "müzik tespiti alanına bağlayan bir yol haritası sunmuş; üretici modeller "
        "arası genellemenin alanın birincil açık problemi olduğunu vurgulamıştır. "
        "Afchar vd. tarafından öne sürülen ICASSP 2025 çalışmasında [7], oto-kodlayıcı "
        "artefaktları üzerinde eğitilen tespit sistemlerinin %99,8 doğruluk değerine "
        "ulaşabileceği gösterilmiştir. Kim ve Go tarafından öne sürülen Segment "
        "Transformer [8], kısa müzik segmentlerini Dönüştürücü başlığı ile işleyen "
        "bir mimari sunmaktadır. Rahman vd. tarafından geliştirilen SONICS veri "
        "kümesi [23], 97.000'den fazla şarkı ve 49.000'den fazla Suno/Udio kaynaklı "
        "sentetik şarkı içermektedir. Comanducci vd. [24] tarafından geliştirilen "
        "FakeMusicCaps veri kümesi, beş farklı metinden-müziğe modeli ile yeniden "
        "üretilmiş MusicCaps eşlemelerinden oluşmaktadır. Pascu vd. [25] tarafından "
        "öne sürülen Echoes veri kümesi, on farklı popüler GenAI müzik üretim sistemi "
        "tarafından üretilen anlamsal-hizalı içeriği kapsamaktadır. Sunday [26] ve "
        "Sroka vd. [27] ses büyütmeleri altında tespit performansını sistematik "
        "biçimde değerlendirmiştir. Bu çalışmaların ortak bulgusu, hiçbir tek mimari "
        "ailesinin hem üretici modeller arası genellemeyi hem de düşmanca "
        "güçlendirilmiş sinyallere karşı sağlamlığı tek başına sağlayamadığıdır. "
        "AURIS ile karşılaştırma amacıyla ilgili çalışmaların özeti Tablo 1'de "
        "sunulmuştur.")

    add_table_caption(doc,
        "Tablo 1. Yapay zekâ müzik tespiti alanındaki ilgili çalışmaların genel bakışı",
        "Overview of related works in AI-generated music detection")
    add_data_table(doc,
        ["Çalışma", "Veri Kümesi", "Metot", "Değerlendirme", "En İyi Sonuç"],
        [
            ["Afchar vd. [7]", "Özel (Suno + insan)", "wav2vec2 + başlık", "Doğruluk, AUC", "%99,8"],
            ["Kim ve Go [8]", "FakeMusicCaps + SONICS", "Segment Transformer", "Doğruluk, F1", "%91+"],
            ["Rahman vd. [23]", "SONICS (97K şarkı)", "SpecTTTra", "F1, AUC", "Rekabetçi"],
            ["Comanducci vd. [24]", "FakeMusicCaps", "CNN + MFCC", "Doğruluk", "Referans"],
            ["Sunday [26]", "FakeMusicCaps + büyütmeler", "CNN + Mel-spektrogram", "Doğruluk", "Değişken"],
            ["Sroka vd. [27]", "Birden çok kamuya açık", "Çoklu mimari", "AUC, F1", "Sağlamlık dengesi"],
            ["Pascu vd. [25]", "Echoes (3577 parça)", "Çoklu üretici", "Doğruluk, AUC", "Hizalı kıyaslama"],
            ["Bu çalışma (AURIS)", "5.195 örnek, 12+ üretici", "47 öznitelik + 11 model", "Doğruluk, AUC, F1, Brier", "AUC %95,48"],
        ])

    # ═════════════════════════════════════════════════════
    # 2. MATERYAL VE YÖNTEM
    # ═════════════════════════════════════════════════════
    add_heading(doc, "2. Materyal ve Yöntem (Material and Method)")

    add_body(doc,
        "Bu bölümde önerilen AURIS sistemini geliştirmek için kullanılan materyal ve "
        "yöntemler özetlenmiştir. Alt bölümlerde sırasıyla (𝑖) kullanılan veri "
        "kümesi, (𝑖𝑖) öznitelik çıkarma boru hattı, (𝑖𝑖𝑖) sınıflandırma modelleri "
        "ve (𝑖𝑣) eğitim protokolü ile karar eşiği optimizasyonu detaylandırılmaktadır. "
        "Önerilen sistemin uçtan-uca işleyişine genel bir bakış Şekil 1'de "
        "sunulmuştur.")

    add_figure(doc, "paper_pipeline_diagram.png",
               "Şekil 1. AURIS uçtan-uca işleyiş şeması.",
               "End-to-end AURIS pipeline.",
               width_cm=15.0)

    add_subheading(doc, "2.1. Kullanılan Veri Kümesi (Utilized Dataset)")
    add_body(doc,
        "Güçlü bir ML/DL modelinin inşa edilebilmesi için en önemli "
        "gereksinimlerden biri altın standartta bir veri kümesine sahip olmaktır. Bu "
        "bağlamda, bu çalışmada toplam 5.195 ses örneğinden oluşan bir veri kümesi "
        "derlenmiştir. Bu örneklerin 3.113 tanesi insan tarafından bestelenmiş ve "
        "seslendirilmiş kayıtları (sınıf 0), 2.082 tanesi ise GenAI sistemleri "
        "tarafından üretilmiş örnekleri (sınıf 1) temsil etmektedir. İnsan kaynakları "
        "üç ayrı havuzdan oluşturulmuştur: GTZAN (899 örnek), FMA Small (1.000 "
        "örnek) ve SleepyJesse kapak performansı veri seti (854 örnek). GenAI "
        "kaynakları Suno (500 örnek, sürüm 3-5), Udio, MusicGen [1], AudioLDM2 [2], "
        "Stable Audio, Riffusion, Mustango, JEN-1 ile dahili 'Echoes' ve 'AImE' alt "
        "kümelerini içermektedir. Veri kümesinin kompozisyonu Tablo 2'de "
        "özetlenmiştir.")

    add_table_caption(doc,
        "Tablo 2. Veri kümesi kompozisyonu",
        "Dataset composition")
    add_data_table(doc,
        ["Kaynak", "Tür", "Örnek Sayısı", "Etiket"],
        [
            ["GTZAN", "İnsan (on tür)", "899", "0"],
            ["FMA Small", "İnsan (sekiz tür)", "1.000", "0"],
            ["SleepyJesse", "İnsan (kapak)", "854", "0"],
            ["Diğer insan", "İnsan (çeşitli)", "360", "0"],
            ["Echoes", "Yapay zekâ", "1.128", "1"],
            ["Suno (v3-v5)", "Yapay zekâ", "500", "1"],
            ["Deepfake seti", "Yapay zekâ", "492", "1"],
            ["AImE / Mustango / JEN-1", "Yapay zekâ", "204", "1"],
            ["Toplam", "", "5.195", ""],
        ])

    add_subheading(doc, "2.2. Öznitelik Çıkarma (Feature Extraction)")
    add_body(doc,
        "Tüm ML/DL modelleri sayısal verilerle çalışmaktadır. Bu nedenle, "
        "kullanılan veri kümesindeki ses parçalarının ayırt edici sayısal "
        "özniteliklerle temsil edilmesi gerekmektedir. Bu amaçla her ses parçası, "
        "22.050 Hz örnekleme hızında yeniden örneklenmiş ve librosa [28] kütüphanesi "
        "kullanılarak 47 boyutlu bir öznitelik vektörüne dönüştürülmüştür. Öznitelik "
        "vektörü beş aileden oluşmaktadır: (𝑖) spektral aile (16 öznitelik), (𝑖𝑖) "
        "zamansal aile (10 öznitelik), (𝑖𝑖𝑖) harmonik ve tonal aile (9 öznitelik), "
        "(𝑖𝑣) MFCC ailesi (3 öznitelik), (𝑣) vokal aile (9 öznitelik). İlk sekiz "
        "öznitelik için insan ve GenAI örneklerinin dağılımları Şekil 2'de "
        "karşılaştırılmıştır.")

    add_figure(doc, "feature_distribution_ai_vs_human.png",
               "Şekil 2. İlk sekiz özniteliğin insan-yapay zekâ dağılımları.",
               "Distribution of the top eight features (human vs AI).",
               width_cm=15.0)

    add_subheading(doc, "2.3. Sınıflandırma Modelleri (Classification Models)")
    add_body(doc,
        "On bir sınıflandırma modeli, ortak bir 5-katlı çapraz doğrulama protokolü "
        "altında karşılaştırılmıştır. Yedi makine öğrenmesi modeli scikit-learn [29] "
        "kütüphanesi kullanılarak uygulanmıştır: dengeli sınıf ağırlığı ile Lojistik "
        "Regresyon, Rastgele Orman (n_estimators=500), Gradyan Artırma, RBF "
        "çekirdeği ile SVM, Çok Katmanlı Algılayıcı (Multi-Layer Perceptron-MLP), "
        "XGBoost [9] ve LightGBM [10]. Dört derin öğrenme mimarisi PyTorch ile "
        "uygulanmıştır: Derin MLP (Deep MLP, 512-256-128-64), 1B-ESA (1D-CNN), Artık "
        "MLP (Residual MLP) ve Dikkat MLP (Attention MLP). Modellerin hiperparametre "
        "ayrıntıları Tablo 3'te verilmiştir.")

    add_table_caption(doc,
        "Tablo 3. On bir modelin temel hiperparametreleri",
        "Key hyperparameters of the eleven models")
    add_data_table(doc,
        ["Model", "Tip", "Temel Hiperparametreler"],
        [
            ["Lojistik Regresyon", "ML", "C=2,0; max_iter=2500; balanced"],
            ["Rastgele Orman", "ML", "n_estimators=500; max_features=log2"],
            ["Gradyan Artırma", "ML", "n_estimators=180; max_depth=4; lr=0,07"],
            ["SVM (RBF)", "ML", "C=10,0; gamma=0,05; izotonik kalibrasyon"],
            ["ÇKA Sinir Ağı", "ML", "Gizli katmanlar: 128-64; relu; adam"],
            ["XGBoost", "ML", "n_estimators=400; lr=0,05; max_depth=6"],
            ["LightGBM", "ML", "n_estimators=400; lr=0,05; num_leaves=31"],
            ["Derin MLP", "DL", "512-256-128-64; BatchNorm; Dropout"],
            ["1B-ESA", "DL", "Conv1D + max-pool + global avg"],
            ["Artık MLP", "DL", "3 artık blok; 256-256"],
            ["Dikkat MLP", "DL", "Öz-dikkat; 4 baş; gizli 128"],
        ])

    add_subheading(doc, "2.4. Eğitim Protokolü ve Eşik Optimizasyonu "
                        "(Training Protocol and Threshold Optimisation)")
    add_body(doc,
        "Tüm modeller stratifiye edilmiş 5-katlı çapraz doğrulama (random_state=42) "
        "ile değerlendirilmiştir. Her kat içinde StandardScaler eğitim alt kümesi "
        "üzerinde fit edilmiş, ardından doğrulama alt kümesi üzerinde transform "
        "uygulanmıştır. Bu sayede veri sızıntısı önlenmiştir. Karar eşiği θ, "
        "varsayılan 0,5 yerine Youden'in J istatistiği ile optimize edilmiştir: "
        "J(θ) = TPR(θ) - FPR(θ). LightGBM için Youden-optimal eşik θ* = 0,4316 "
        "olarak ölçülmüştür. Olasılıkların kalibrasyon kalitesi Brier skoru ile "
        "değerlendirilmiştir: BS = (1/N) Σᵢ (pᵢ - yᵢ)². Modelin yorumlanabilirliği "
        "TreeSHAP [11] algoritması kullanılarak analiz edilmiştir.")

    # ═════════════════════════════════════════════════════
    # 3. SONUÇLAR VE TARTIŞMALAR
    # ═════════════════════════════════════════════════════
    add_heading(doc, "3. Sonuçlar ve Tartışmalar (Results and Discussions)")

    add_body(doc,
        "Tablo 4, on bir modelin 5-katlı çapraz doğrulama sonuçlarını ROC-AUC'a "
        "göre sıralı biçimde sunmaktadır. LightGBM modeli, %95,48 ortalama ROC-AUC "
        "değeri ile ilk sırada yer almakta ve Derin MLP %95,42 ile çok yakın bir "
        "ikinci sıra elde etmektedir; iki model arasındaki fark yalnızca 0,0006 AUC "
        "mertebesindedir. 1B-ESA modeli %85,43 ile en düşük performansı "
        "sergilemiştir. Şekil 3, on bir sınıflandırıcının doğruluk, F1 ve ROC-AUC "
        "değerlerini karşılaştırmalı olarak göstermektedir.")

    add_table_caption(doc,
        "Tablo 4. On bir sınıflandırıcının 5-katlı çapraz doğrulama sonuçları",
        "5-fold cross-validation results of the eleven classifiers")
    add_data_table(doc,
        ["Sıra", "Model", "Tip", "Doğruluk", "F1", "ROC-AUC", "θ*"],
        [
            ["1",  "LightGBM",       "ML", "0,8839", "0,8575", "0,9548", "0,4316"],
            ["2",  "Derin MLP",      "DL", "0,8849", "0,8596", "0,9542", "—"],
            ["3",  "Artık MLP",      "DL", "0,8756", "0,8476", "0,9485", "—"],
            ["4",  "XGBoost",        "ML", "0,8751", "0,8408", "0,9465", "—"],
            ["5",  "Gradyan Artırma","ML", "0,8685", "0,8337", "0,9397", "—"],
            ["6",  "Rastgele Orman", "ML", "0,8606", "0,8183", "0,9394", "—"],
            ["7",  "Dikkat MLP",     "DL", "0,8628", "0,8293", "0,9359", "—"],
            ["8",  "SVM (RBF)",      "ML", "0,8612", "0,8252", "0,9346", "—"],
            ["9",  "ÇKA Sinir Ağı",  "ML", "0,8566", "0,8189", "0,9276", "—"],
            ["10", "1B-ESA",         "DL", "0,7665", "0,7159", "0,8543", "—"],
            ["11", "Lojistik Reg.",  "ML", "0,7779", "0,7390", "0,8515", "—"],
        ])

    add_figure(doc, "paper_model_comparison.png",
               "Şekil 3. On bir modelin performans karşılaştırması.",
               "Performance comparison of the eleven models.")

    add_figure(doc, "paper_roc_curves.png",
               "Şekil 4. Yedi ML modelinin ROC eğrileri.",
               "ROC curves of the seven ML models.")

    add_figure(doc, "all_models_heatmap.png",
               "Şekil 5. On bir model performans ısı haritası.",
               "Performance heatmap of the eleven models.")

    add_body(doc,
        "ML ve DL aileleri doğrudan karşılaştırıldığında, yedi ML sınıflandırıcısı "
        "%92,75 ortalama ROC-AUC değerine ulaşırken dört DL mimarisi %92,32'de "
        "kalmaktadır. Bu fark esas olarak 1B-ESA modelinin DL ortalamasını aşağı "
        "çekmesinden kaynaklanmaktadır. 1B-ESA dışlandığında, kalan üç DL mimarisi "
        "%94,62 ortalama elde etmektedir. Bu bulgu, 47 boyutlu öznitelik vektörünün "
        "ayırt edici bilginin büyük kısmını kodladığını; öznitelik mühendisliğinin "
        "model kapasitesinden daha belirleyici bir etken olduğunu göstermektedir. "
        "Şekil 6, iki aileyi doğrudan karşılaştırmaktadır. Şekil 7 ise dört DL "
        "mimarisinin epok bazlı eğitim eğrilerini sunmaktadır.")

    add_figure(doc, "paper_ml_vs_dl.png",
               "Şekil 6. ML ve DL ailelerinin karşılaştırması.",
               "Comparison of ML and DL families.")
    add_figure(doc, "training_history.png",
               "Şekil 7. DL mimarileri için epok bazlı eğitim eğrileri.",
               "Per-epoch training curves for the DL architectures.", width_cm=15.0)

    add_body(doc,
        "Katlar-arası kararlılık açısından incelendiğinde, LightGBM ±0,0023 standart "
        "sapma ile havuzdaki en kararlı modeldir; beş katı 0,9515 ile 0,9580 "
        "arasında dar bir aralıkta değişmektedir. XGBoost (±0,0029) ve Gradyan "
        "Artırma (±0,0038) onu izlemektedir. En değişken modeller 1B-ESA (±0,0087) "
        "ve SVM-RBF (±0,0075) olmuştur. Kararlılığa göre sıralama, ortalama AUC "
        "sıralamasını yakından izlemektedir; en yüksek skoru veren modeller aynı "
        "zamanda en kararlı olanlardır. Şekil 8, on bir modelin kat bazlı AUC "
        "değerlerini sunmaktadır.")

    add_figure(doc, "paper_fold_std_table.png",
               "Şekil 8. On bir modelin kat bazlı ROC-AUC değerleri.",
               "Per-fold ROC-AUC values for the eleven models.", width_cm=15.0)

    add_body(doc,
        "Öznitelik önemi analizi sonuçları, spektral düzlük standart sapması "
        "özniteliğinin yapay zekâ-insan ayrımı için en bilgilendirici öznitelik "
        "olduğunu açıkça ortaya koymuştur. Tablo 5, LightGBM modelinde "
        "normalleştirilmiş kazanca göre sıralanan ilk on özniteliği listelemektedir. "
        "Spektral düzlük hem standart sapma (sıra 1) hem de ortalama (sıra 5) olarak "
        "ilk beş içinde iki kez yer almaktadır. Şekil 9 ilk yirmi özniteliği, Şekil "
        "10 ise TreeSHAP tabanlı global etki dağılımını sunmaktadır.")

    add_table_caption(doc,
        "Tablo 5. LightGBM'in ilk on özniteliği",
        "Top ten features of LightGBM")
    add_data_table(doc,
        ["Sıra", "Öznitelik", "Önem"],
        [
            ["1",  "spectral_flatness_std",  "0,0619"],
            ["2",  "spectral_contrast_mean", "0,0467"],
            ["3",  "rms_energy",             "0,0456"],
            ["4",  "onset_strength_std",     "0,0388"],
            ["5",  "spectral_flatness_mean", "0,0370"],
            ["6",  "rms_dynamic_range",      "0,0346"],
            ["7",  "onset_strength_mean",    "0,0332"],
            ["8",  "rms_std",                "0,0298"],
            ["9",  "beat_count",             "0,0298"],
            ["10", "mfcc_delta_var",         "0,0289"],
        ])

    add_figure(doc, "paper_feature_importance.png",
               "Şekil 9. İlk yirmi öznitelik önem skorları.",
               "Top-twenty feature importance scores.")
    add_figure(doc, "shap_summary.png",
               "Şekil 10. TreeSHAP global etki diyagramı.",
               "TreeSHAP global effect plot.")

    add_body(doc,
        "Şekil 11, LightGBM'in Youden-optimal eşik θ* = 0,4316 ile elde edilen "
        "karmaşıklık matrisini göstermektedir. Matris şu değerleri raporlamaktadır: "
        "2.721 doğru negatif (%87,4), 1.862 doğru pozitif (%89,4), 392 yanlış "
        "pozitif (%12,6) ve 220 yanlış negatif (%10,6). Şekil 12 ise insan ve "
        "yapay zekâ sınıflarına ait P(AI) tahmini olasılık dağılımlarını ayrı ayrı "
        "çizmektedir; iki dağılım iyi ayrılmıştır. Şekil 13'teki kalibrasyon eğrisi "
        "0,083 Brier skoru ile birlikte modelin olasılık çıktılarının iyi kalibre "
        "olduğunu doğrulamaktadır. Şekil 14, kesinlik-duyarlılık eğrisini 0,934 "
        "ortalama kesinlik değeri ile sunmaktadır.")

    add_figure(doc, "paper_confusion_matrix_lightgbm.png",
               "Şekil 11. LightGBM karmaşıklık matrisi (θ* = 0,4316).",
               "LightGBM confusion matrix at θ* = 0.4316.")
    add_figure(doc, "paper_score_distribution.png",
               "Şekil 12. P(AI) tahmin olasılık dağılımı.",
               "P(AI) predicted-probability distribution.")
    add_figure(doc, "paper_calibration.png",
               "Şekil 13. Kalibrasyon eğrisi. Brier = 0,083.",
               "Calibration curve. Brier = 0.083.")
    add_figure(doc, "paper_precision_recall.png",
               "Şekil 14. Kesinlik-duyarlılık eğrisi.",
               "Precision-recall curve.")

    add_body(doc,
        "Eşik taraması analizi, kesinlik, duyarlılık ve F1 skorunun karar eşiğine "
        "göre nasıl değiştiğini göstermektedir. F1 skoru 0,40-0,50 aralığında bir "
        "plato oluşturmakta; Youden-optimal eşik bu platonun sol kenarında "
        "konumlanmaktadır (Şekil 15). Üretici bazlı performans değerlendirmesinde "
        "(Şekil 16), Suno parçaları %93,0 duyarlılık, Echoes %88,6 duyarlılık ile "
        "kurtarılmaktadır. Buna karşın, deepfake alt kümesinde performans %50,0'da "
        "kalmakta; tarafları akustik profili sistematik olarak farklı olan parçalar "
        "modeli zorlamaktadır. Bu durum üretici modeller arası genelleme zorluğunu "
        "doğrular niteliktedir. Şekil 17 sınıf bazlı performans değerlerini "
        "sunmaktadır.")

    add_figure(doc, "threshold_sweep.png",
               "Şekil 15. Karar eşiği taraması.", "Decision-threshold sweep.")
    add_figure(doc, "per_source_performance.png",
               "Şekil 16. Kaynak bazlı LightGBM performansı.",
               "Per-source LightGBM performance.")
    add_figure(doc, "per_class_metrics.png",
               "Şekil 17. Sınıf bazlı performans değerleri.",
               "Per-class performance values.")

    add_subheading(doc, "3.1. Tartışma (Discussion)")
    add_body(doc,
        "Spektral düzlüğün öznitelik önem sıralamasındaki baskın konumu, daha geniş "
        "ses derin sahte literatürüyle [6] tutarlı ve yorumlanabilir bir bulgudur. "
        "Spektral düzlük, bir sinyalin güç spektrumunun geometrik ve aritmetik "
        "ortalamaları arasındaki oranı ölçmektedir. Güncel GenAI üretim sistemleri, "
        "algısal kalite ölçütlerini optimize etme eğilimindedir ve bunun yan etkisi "
        "olarak insan kayıtlarınınkinden sistematik biçimde daha temiz spektrumlar "
        "üreten sinyaller ortaya çıkmaktadır.")

    add_body(doc,
        "1B-ESA modelinin diğer mimarilere kıyasla belirgin biçimde düşük "
        "performansı, mimari bir uyumsuzluğun sonucu olarak değerlendirilmektedir. "
        "Tek boyutlu evrişim, bir dizi boyunca yerel korelasyonları kullanmak üzere "
        "tasarlanmıştır; ancak önerilen sistemde giriş, sıralanmamış 47 boyutlu düz "
        "bir öznitelik vektörüdür. Bu liste boyunca bir çekirdeği kaydıran evrişim "
        "işleminin öğrenebileceği anlamlı bir öteleme değişmezliği "
        "bulunmamaktadır.")

    add_body(doc,
        "Aşırı öğrenme tanılayıcı analizi sonuçları (Şekil 18), tüm ağaç tabanlı "
        "modellerin eğitim ve çapraz doğrulama doğruluğu arasında belirgin bir fark "
        "sergilediğini göstermektedir. Rastgele Orman %100,0 eğitim doğruluğuna "
        "karşı çapraz doğrulama altında %86,1 doğruluk elde etmiştir; aradaki 13,9 "
        "puanlık fark dikkat çekicidir. LightGBM ve SVM sırasıyla 12,0 ve 13,4 "
        "puanlık farklarla bu eğilimi takip etmektedir. Eğitim ve çapraz doğrulama "
        "doğruluklarının esasen örtüştüğü tek model, yalnızca 0,6 puanlık fark ile "
        "Lojistik Regresyon olmuştur.")

    add_figure(doc, "train_val_gap.png",
               "Şekil 18. Eğitim ve çapraz doğrulama doğruluk farkı.",
               "Train versus cross-validation accuracy gap.")

    add_body(doc,
        "Öznitelik fazlalığı açısından yapılan analiz, 47 özniteliğin tasarım gereği "
        "fazlalıklı bir yapıya sahip olduğunu göstermiştir. Yirmi öznitelik çiftinin "
        "|Pearson r| değeri 0,85'in üzerinde ölçülmüştür; dört çift 0,97'yi "
        "aşmaktadır. Şekil 19 tüm |r| matrisini görselleştirmektedir. Öznitelik "
        "çıkarma deneyi (Şekil 20), öznitelik sayısının N = 30'a ulaştığında "
        "doğruluğun plato yaptığını ortaya koymuş; sondaki 17 özniteliğin ölçülebilir "
        "bir ek doğruluk sağlamadığı tespit edilmiştir.")

    add_figure(doc, "feature_correlation_heatmap.png",
               "Şekil 19. 47 öznitelik korelasyon ısı haritası.",
               "47-feature correlation heatmap.", width_cm=15.0)
    add_figure(doc, "feature_ablation_curve.png",
               "Şekil 20. Öznitelik sayısı vs doğruluk.",
               "Number of features vs accuracy.")

    add_subheading(doc, "3.2. Sınırlamalar (Limitations)")
    add_body(doc,
        "Önerilen sistemin sınırlamaları açık biçimde değerlendirildiğinde dört "
        "temel husus öne çıkmaktadır. Birincisi, öznitelikler 15-30 saniye "
        "uzunluğundaki tam ses kliplerinden çıkarılmakta olup daha kısa klipler için "
        "tempo ve vibrato istatistikleri daha az güvenilir olabilir. İkincisi, veri "
        "kümesi yirmi farklı tür kapsamakla birlikte bazı türlerin GenAI tarafında "
        "aşırı temsil edildiği gözlemlenmiştir. Üçüncüsü, düşmanca sağlamlık açıkça "
        "test edilmemiştir; MP3 sıkıştırma, perde kaydırma ve zaman gerdirme gibi "
        "sonradan işleme tekniklerinin etkisi Afchar vd. [7] tarafından raporlanmıştır. "
        "Dördüncüsü, eğitim ile çapraz doğrulama doğrulukları arasında tespit edilen "
        "fark, modelin dağılım kayışına karşı duyarlı olduğunu göstermektedir.")

    # ═════════════════════════════════════════════════════
    # SONUÇLAR (Conclusions) — numarasız
    # ═════════════════════════════════════════════════════
    add_heading(doc, "Sonuçlar (Conclusions)")
    add_body(doc,
        "Bu çalışmada, GenAI tarafından üretilen müziği insan tarafından "
        "bestelenmiş kayıtlardan ayırt edebilmek için AURIS adlı uçtan-uca bir "
        "tespit sistemi önerilmiştir. Önerilen sistem; 47 boyutlu elle tasarlanmış "
        "bir akustik öznitelik vektörünü, on iki veya daha fazla GenAI üretim "
        "sisteminden derlenen 5.195 örnek üzerinde eğitilen on bir sınıflandırma "
        "modelinden oluşan bir topluluk ile birleştirmektedir. Elde edilen temel "
        "bulgular şu şekilde özetlenebilir: LightGBM modeli, %95,48 ortalama "
        "ROC-AUC değeri ile en yüksek performansı elde etmiş; Derin MLP %95,42 ile "
        "çok yakın bir ikinci sırayı almıştır. LightGBM aynı zamanda ±0,0023 "
        "standart sapma ile havuzdaki en düşük katlar-arası varyansa sahip modeli "
        "oluşturmuştur. Spektral düzlük özniteliği, GenAI ile insan müziği ayrımı "
        "için en bilgilendirici tek öznitelik olarak öne çıkmaktadır. Tanılayıcı "
        "analiz iki önemli sınırlamayı açık biçimde ortaya koymaktadır: tüm ağaç "
        "tabanlı modeller eğitim ile çapraz doğrulama doğrulukları arasında 8-14 "
        "puanlık bir fark sergilemekte ve 47 özniteliğin önem sırasına göre "
        "sondaki yaklaşık on yedisi ölçülebilir bir ek doğruluk sağlamamaktadır.")

    add_body(doc,
        "Bu araştırma, GenAI tarafından üretilen müziklerin tespiti alanında derin "
        "öğrenme ve topluluk öğrenmesi tekniklerinin etkinliğini vurgulayarak, çok "
        "üreticili müzik tespiti alanında daha fazla ilerleme için umut verici "
        "yollar sunmaktadır. Gelecek çalışmalar kapsamında dört yön takip "
        "edilecektir: birincisi, SONICS [23] ve FakeMusicCaps [24] gibi gelişmekte "
        "olan halka açık kıyaslamalar üzerinde resmi bir üretici-modeller arası "
        "tutulan değerlendirme gerçekleştirilecektir. İkincisi, ince ayar yapılmış "
        "wav2vec2 [13] modeli, öznitelik tabanlı sınıflandırıcılarla doğrudan "
        "karşılaştırma için 5-katlı çapraz doğrulama protokolüne entegre "
        "edilecektir. Üçüncüsü, düşmanca sağlamlık MP3 sıkıştırma, perde kaydırma "
        "ve zaman gerdirme gibi ses manipülasyonları altında açıkça "
        "değerlendirilecektir. Dördüncüsü, kullanılan veri kümesi on bin örneğe "
        "doğru genişletilecek ve ortaya çıkan yeni GenAI üretim sistemleri "
        "kapsama dahil edilecektir.")

    # ═════════════════════════════════════════════════════
    # KAYNAKLAR (References) — IEEE numerik, doğal akış
    # ═════════════════════════════════════════════════════
    add_heading(doc, "Kaynaklar (References)")

    refs = [
        "Copet J. vd., Simple and Controllable Music Generation, Advances in Neural "
        "Information Processing Systems, 36, 2023. DOI: 10.48550/arXiv.2306.05284.",

        "Liu H. vd., AudioLDM: Text-to-Audio Generation with Latent Diffusion Models, "
        "Proceedings of the International Conference on Machine Learning (ICML 2023), "
        "21450-21474, Honolulu, Hawaii, A.B.D., 23-29 Temmuz, 2023. DOI: "
        "10.48550/arXiv.2301.12503.",

        "Yi J. vd., ADD 2022: The First Audio Deep Synthesis Detection Challenge, "
        "Proceedings of the IEEE International Conference on Acoustics, Speech and "
        "Signal Processing (ICASSP 2022), 9216-9220, Singapur, 22-27 Mayıs, 2022. "
        "DOI: 10.1109/ICASSP43922.2022.9746939.",

        "Frank J., Schönherr L., WaveFake: A Data Set to Facilitate Audio Deepfake "
        "Detection, Advances in Neural Information Processing Systems 2021 Datasets "
        "and Benchmarks Track, 2021. DOI: 10.5281/zenodo.5642694.",

        "Li Y., Milling M., Specia L., Schuller B.W., From Audio Deepfake Detection "
        "to AI-Generated Music Detection: A Pathway and Overview, arXiv preprint "
        "arXiv:2412.00571, 2024. DOI: 10.48550/arXiv.2412.00571.",

        "Yi J. vd., Audio Deepfake Detection: A Survey, arXiv preprint "
        "arXiv:2308.14970, 2023. DOI: 10.48550/arXiv.2308.14970.",

        "Afchar D., Meseguer Brocal G., Hennequin R., AI-Generated Music Detection "
        "and Its Challenges, Proceedings of the IEEE International Conference on "
        "Acoustics, Speech and Signal Processing (ICASSP 2025), Hyderabad, Hindistan, "
        "6-11 Nisan, 2025. DOI: 10.48550/arXiv.2501.10111.",

        "Kim Y., Go S., Segment Transformer: AI-Generated Music Detection via Music "
        "Structural Analysis, arXiv preprint arXiv:2509.08283, 2025. DOI: "
        "10.48550/arXiv.2509.08283.",

        "Chen T., Guestrin C., XGBoost: A Scalable Tree Boosting System, Proceedings "
        "of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and "
        "Data Mining (KDD '16), 785-794, San Francisco, CA, A.B.D., 13-17 Ağustos, "
        "2016. DOI: 10.1145/2939672.2939785.",

        "Ke G. vd., LightGBM: A Highly Efficient Gradient Boosting Decision Tree, "
        "Advances in Neural Information Processing Systems 30 (NIPS 2017), 3149-3157, "
        "Long Beach, California, A.B.D., 4-9 Aralık, 2017.",

        "Lundberg S.M., Lee S.I., A Unified Approach to Interpreting Model "
        "Predictions, Advances in Neural Information Processing Systems 30 (NIPS "
        "2017), 4768-4777, Long Beach, California, A.B.D., 4-9 Aralık, 2017. DOI: "
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

        "Elizalde B., Deshmukh S., Al Ismail M., Wang H., CLAP: Learning Audio "
        "Concepts from Natural Language Supervision, Proceedings of the IEEE "
        "International Conference on Acoustics, Speech and Signal Processing (ICASSP "
        "2023), 1-5, Rhodes, Yunanistan, 4-10 Haziran, 2023. DOI: "
        "10.1109/ICASSP49357.2023.10095889.",

        "Wu Y. vd., Large-Scale Contrastive Language-Audio Pretraining with Feature "
        "Fusion and Keyword-to-Caption Augmentation, Proceedings of the IEEE "
        "International Conference on Acoustics, Speech and Signal Processing (ICASSP "
        "2023), 1-5, Rhodes, Yunanistan, 4-10 Haziran, 2023. DOI: "
        "10.1109/ICASSP49357.2023.10095969.",

        "Liu Y., Yin Y., Zhu Q., Cui W., Musical Instrument Recognition by XGBoost "
        "Combining Feature Fusion, arXiv preprint arXiv:2206.00901, 2022. DOI: "
        "10.48550/arXiv.2206.00901.",

        "Gan R., Huang T., Shao J., Wang F., Music Genre Classification Based on "
        "VMD-IWOA-XGBoost, Mathematics, 12 (10), 1549, 2024. DOI: "
        "10.3390/math12101549.",

        "Hızlısoy S., Tüfekci Z., Derin Öğrenme İle Türkçe Müziklerden Müzik Türü "
        "Sınıflandırması, Avrupa Bilim ve Teknoloji Dergisi, 24, 176-183, 2021. DOI: "
        "10.31590/ejosat.898588.",

        "Özbalcı M.C., Şahin H., Bilgin T.T., Classification of Music Genres of "
        "GTZAN Dataset with Machine Learning Methods, Mühendislik Bilimleri ve "
        "Araştırmaları Dergisi, 6 (1), 2024.",

        "Turan A.K., Polat H., Yarı Denetimli Makine Öğrenmesi Yöntemini Kullanarak "
        "Müzik Türlerinin Tespiti, Gazi Üniversitesi Fen Bilimleri Dergisi Part C: "
        "Tasarım ve Teknoloji, 12 (1), 92-107, 2024. DOI: 10.29109/gujsc.1352477.",

        "Kostrzewa D., Mazur W., Brzeski R., Wide Ensembles of Neural Networks in "
        "Music Genre Classification, Computational Science -- ICCS 2022, Lecture "
        "Notes in Computer Science, vol. 13351, 91-102, Springer, 2022. DOI: "
        "10.1007/978-3-031-08754-7_9.",

        "Gourisaria M.K., Agrawal R., Sahni M., Comparative Analysis of Audio "
        "Classification with MFCC and STFT Features Using Machine Learning "
        "Techniques, Discover Internet of Things, 4 (1), 1, 2024. DOI: "
        "10.1007/s43926-023-00049-y.",

        "Rahman M.A., Hakim Z.I.A., Sarker N.H., Paul B., Fattah S.A., SONICS: "
        "Synthetic Or Not -- Identifying Counterfeit Songs, Proceedings of the "
        "International Conference on Learning Representations (ICLR 2025), Singapur, "
        "24-28 Nisan, 2025. DOI: 10.48550/arXiv.2408.14080.",

        "Comanducci L., Bestagini P., Tubaro S., FakeMusicCaps: A Dataset for "
        "Detection and Attribution of Synthetic Music Generated via Text-to-Music "
        "Models, arXiv preprint arXiv:2409.10684, 2024. DOI: "
        "10.48550/arXiv.2409.10684.",

        "Pascu O., Oneata D., Cucu H., Müller N.M., Echoes: A Semantically-Aligned "
        "Music Deepfake Detection Dataset, arXiv preprint arXiv:2603.23667, 2025. "
        "DOI: 10.48550/arXiv.2603.23667.",

        "Sunday N., Detecting Musical Deepfakes, arXiv preprint arXiv:2505.09633, "
        "2025. DOI: 10.48550/arXiv.2505.09633.",

        "Sroka T., Wężowicz T., Sidorczuk D., Modrzejewski M., Evaluating Fake Music "
        "Detection Performance Under Audio Augmentations, arXiv preprint "
        "arXiv:2507.10447, 2025. DOI: 10.48550/arXiv.2507.10447.",

        "McFee B. vd., librosa: Audio and Music Signal Analysis in Python, "
        "Proceedings of the 14th Python in Science Conference (SciPy 2015), 18-24, "
        "Austin, Texas, A.B.D., 6-12 Temmuz, 2015. DOI: "
        "10.25080/Majora-7b98e3ed-003.",

        "Pedregosa F. vd., Scikit-learn: Machine Learning in Python, Journal of "
        "Machine Learning Research, 12, 2825-2830, 2011.",

        "Kingma D.P., Ba J., Adam: A Method for Stochastic Optimization, Proceedings "
        "of the 3rd International Conference on Learning Representations (ICLR 2015), "
        "1-15, San Diego, California, A.B.D., 7-9 Mayıs, 2015. DOI: "
        "10.48550/arXiv.1412.6980.",
    ]
    for i, ref in enumerate(refs, start=1):
        add_ref(doc, i, ref)

    # Kaydet
    try:
        doc.save(str(OUT))
        target = OUT
    except PermissionError:
        target = OUT.parent / "AURIS_paper_TR_template_v2.docx"
        doc.save(str(target))
    print(f"Kaydedildi: {target} ({target.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    build()
