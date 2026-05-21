"""
AURIS — Gazi MMF Dergisi RESMİ kurallara birebir uyumlu 3 dosya üretici.

RESMİ KURALLAR (özet):
  • A4, 2.5 cm her kenar
  • Times New Roman 9pt body, 14pt başlık, 8pt EN parantez/şekil-tablo başlığı
  • 1.5 satır aralığı, paragraf öncesi/sonrası otomatik aralık YOK
  • Tek bölüm, tek kolon (yayıncı baskı için sonradan değiştirir)
  • Maks 20 sayfa
  • Bölüm sırası: 1.Giriş - 2.Teorik Metot - 3.Sonuçlar ve Tartışmalar -
    5.Sonuçlar - Teşekkür - Kaynaklar
  • Türkçe başlıkların altında 8pt bold parantez içinde İngilizce
  • Şekil küçük 8.5 cm / büyük 12-15 cm
  • Tablo bold YOK, dolgu YOK, 9pt (sığmazsa 8pt)
  • Kaynak: numerik, makale yayınlanmışsa DOI verilmez, son 5 yıl >= %30

ÜRETİLEN DOSYALAR:
  1. AURIS_Kapak_Sayfasi.docx        (Kapak — sadece yazar bilgisi)
  2. AURIS_Makale_Metni.docx          (Kontrol Listesi + makale - tek dosya)
  3. AURIS_Genisletilmis_Ingilizce_Ozet.docx
"""
from pathlib import Path
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Cm, Pt
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

HERE = Path(__file__).resolve().parent
FIGURES = HERE.parent / "figures"
OUTDIR = HERE / "deliverables"
OUTDIR.mkdir(parents=True, exist_ok=True)

KAPAK_TPL = Path(r"D:/Downloads/Kapak Sayfası.docx")
KONTROL_TPL = Path(r"D:/Downloads/Kontrol Listesi Formu.docx")
OZET_TPL = Path(r"D:/Downloads/Genişletilmiş İngilizce Özet.docx")


# ───── YARDIMCI FONKSİYONLAR ─────
def _set_font(run, *, size=9, bold=False, italic=False,
              underline=False, name="Times New Roman"):
    run.font.name = name
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.underline = underline
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.append(rFonts)
    for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        rFonts.set(qn(attr), name)


def _setup_margins(doc):
    """A4 + 2.5 cm her kenar (resmi kural)."""
    for s in doc.sections:
        s.page_width = Cm(21.0)
        s.page_height = Cm(29.7)
        s.top_margin = Cm(2.5)
        s.bottom_margin = Cm(2.5)
        s.left_margin = Cm(2.5)
        s.right_margin = Cm(2.5)


def _set_line_15(paragraph, *, space_after=0):
    pf = paragraph.paragraph_format
    pf.line_spacing = 1.5
    pf.space_before = Pt(0)
    pf.space_after = Pt(space_after)


def add_p(doc, text, *, size=9, bold=False, italic=False, underline=False,
          align=None, indent=False, after=0):
    p = doc.add_paragraph()
    if align is not None:
        p.alignment = align
    _set_line_15(p, space_after=after)
    if indent:
        p.paragraph_format.first_line_indent = Cm(0.5)
    r = p.add_run(text)
    _set_font(r, size=size, bold=bold, italic=italic, underline=underline)
    return p


def add_body(doc, text):
    """Gövde paragrafı: 9pt, justify, 1.5 aralık, paragraf arası 1 boş satır."""
    p = add_p(doc, text, size=9, align=WD_ALIGN_PARAGRAPH.JUSTIFY, indent=True)
    # Resmi kural: paragraflar arası 1 BOŞ SATIR
    blank = doc.add_paragraph()
    _set_line_15(blank)
    return p


def add_heading_main(doc, text_tr, text_en):
    """1. Giriş (Introduction) tarzı ana başlık — 9pt bold, sonra İngilizce 8pt bold."""
    p = doc.add_paragraph()
    _set_line_15(p)
    # Türkçe başlık (9pt bold) + boşluk + İngilizce (8pt bold parantez içinde)
    r1 = p.add_run(text_tr + " ")
    _set_font(r1, size=9, bold=True)
    r2 = p.add_run(f"({text_en})")
    _set_font(r2, size=8, bold=True)
    # 1 boş satır
    blank = doc.add_paragraph()
    _set_line_15(blank)


def add_sub_heading(doc, text_tr, text_en):
    """1.1. Alt başlık — 9pt bold + 8pt EN."""
    p = doc.add_paragraph()
    _set_line_15(p)
    r1 = p.add_run(text_tr + " ")
    _set_font(r1, size=9, bold=True)
    r2 = p.add_run(f"({text_en})")
    _set_font(r2, size=8, bold=True)
    blank = doc.add_paragraph()
    _set_line_15(blank)


def add_figure(doc, filename, caption_tr, caption_en, width_cm=8.5):
    """Şekil + çift dilli başlık (altında)."""
    img = FIGURES / filename
    if not img.exists():
        return
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _set_line_15(p)
    r = p.add_run()
    r.add_picture(str(img), width=Cm(width_cm))

    # Şekil başlığı (Türkçe + İngilizce parantez 8pt)
    pcap = doc.add_paragraph()
    pcap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _set_line_15(pcap)
    r1 = pcap.add_run(caption_tr + " ")
    _set_font(r1, size=9)
    r2 = pcap.add_run(f"({caption_en})")
    _set_font(r2, size=8, bold=True)
    # 1 boş satır
    blank = doc.add_paragraph()
    _set_line_15(blank)


def add_table_caption(doc, tr, en):
    """Tablo başlığı — tablonun üstüne."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _set_line_15(p)
    r1 = p.add_run(tr + " ")
    _set_font(r1, size=9)
    r2 = p.add_run(f"({en})")
    _set_font(r2, size=8, bold=True)


def add_table(doc, headers, rows):
    """Tablo: 9pt, bold YOK, dolgu YOK."""
    tbl = doc.add_table(rows=1 + len(rows), cols=len(headers))
    tbl.style = "Table Grid"
    for j, h in enumerate(headers):
        cell = tbl.rows[0].cells[j]
        # Hücreyi temizle, tek paragraf + tek run
        for p in list(cell.paragraphs):
            p._element.getparent().remove(p._element)
        p = cell.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        _set_line_15(p)
        r = p.add_run(h)
        # Başlık satırı yine 9pt (resmi: bold yok, ama başlık ayırt edici olabilir)
        _set_font(r, size=9)
    for i, row_data in enumerate(rows, start=1):
        for j, val in enumerate(row_data):
            cell = tbl.rows[i].cells[j]
            for p in list(cell.paragraphs):
                p._element.getparent().remove(p._element)
            p = cell.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            _set_line_15(p)
            r = p.add_run(val)
            _set_font(r, size=9)
    blank = doc.add_paragraph()
    _set_line_15(blank)


def add_ref(doc, idx, text):
    """Kaynaklar listesi - 9pt, asılı girinti, tek satır aralığı."""
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.left_indent = Cm(0.5)
    pf.first_line_indent = Cm(-0.5)
    pf.line_spacing = 1.0
    pf.space_after = Pt(3)
    pf.space_before = Pt(0)
    r = p.add_run(f"{idx}. {text}")
    _set_font(r, size=9)


# ══════════════════════════════════════════════════════════════════════════
# 1. KAPAK SAYFASI
# ══════════════════════════════════════════════════════════════════════════
def build_kapak():
    """Resmi şablonu doldur."""
    doc = Document(str(KAPAK_TPL))
    _setup_margins(doc)
    paras = doc.paragraphs

    def replace(idx, text, *, size=9, bold=False):
        p = paras[idx]
        for r in list(p.runs):
            r._element.getparent().remove(r._element)
        r = p.add_run(text)
        _set_font(r, size=size, bold=bold)

    # P1: Türkçe başlık (14pt)
    replace(1, "AURIS: Çoklu-model topluluk yaklaşımı ile yapay zekâ "
               "tarafından üretilen müziklerin tespiti", size=14, bold=True)

    # P4-8: TR yazar/kurum/orcid/email
    replace(4, "Hasan Arthur Altuntaş1,*", size=9)
    replace(5, "1Düzce Üniversitesi, Mühendislik Fakültesi, "
               "Bilgisayar Mühendisliği Bölümü, 81620, Düzce, Türkiye", size=9)
    replace(6, "")  # 2. kurum yok
    replace(7, "0009-0002-8302-7657", size=9)
    replace(8, "hasannarthurrr@gmail.com", size=9)

    # P13: İngilizce başlık
    replace(13, "AURIS: A multi-model ensemble approach for the detection "
                "of AI-generated music", size=14, bold=True)

    # P17-21: EN yazar/kurum/orcid/email
    replace(17, "Hasan Arthur Altuntaş1,*", size=9)
    replace(18, "1Department of Computer Engineering, Faculty of Engineering, "
                "Düzce University, 81620, Düzce, Türkiye", size=9)
    replace(19, "")
    replace(20, "0009-0002-8302-7657", size=9)
    replace(21, "hasannarthurrr@gmail.com", size=9)

    out = OUTDIR / "AURIS_Kapak_Sayfasi.docx"
    doc.save(str(out))
    print(f"OK  {out.name}")


# ══════════════════════════════════════════════════════════════════════════
# 2. MAKALE METNİ (Kontrol Listesi + Makale)
# ══════════════════════════════════════════════════════════════════════════
def build_makale_metni():
    """Kontrol Listesi (resmi şablon) + sayfa sonu + makale metni."""
    # Önce Kontrol Listesi şablonunu yükle
    doc = Document(str(KONTROL_TPL))
    _setup_margins(doc)

    # Kontrol listesinde tüm onayları işaretle
    kontrol_tbl = doc.tables[1]
    for row in kontrol_tbl.rows:
        cell = row.cells[0]
        for p in list(cell.paragraphs):
            p._element.getparent().remove(p._element)
        p = cell.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run("✓")
        _set_font(r, size=14, bold=True)

    # Sayfa sonu + makale metni
    p = doc.add_paragraph()
    r = p.add_run()
    br = OxmlElement("w:br")
    br.set(qn("w:type"), "page")
    r._element.append(br)

    # ═══════ MAKALE BAŞLIK SAYFASI ═══════
    # Türkçe başlık 14pt
    add_p(doc, "AURIS: Çoklu-model topluluk yaklaşımı ile yapay zekâ "
               "tarafından üretilen müziklerin tespiti",
          size=14, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_p(doc, "")

    # Öne Çıkanlar
    add_p(doc, "Öne Çıkanlar", size=9, bold=True)
    for h in [
        "Yapay zekâ tarafından üretilen müzik tespiti için 47 boyutlu "
        "akustik öznitelik vektörü ve 11 modelli topluluk öğrenmesi yaklaşımı",
        "LightGBM ile %95,48 ROC-AUC ve ±0,0023 katlar-arası standart sapma",
        "Spektral düzlük standart sapması yapay zekâ-insan ayrımı için "
        "en bilgilendirici öznitelik olarak tespit edildi",
    ]:
        add_p(doc, "• " + h, size=9)
    add_p(doc, "")

    # Türkçe Öz (200 kelimeyi geçmemeli)
    add_p(doc, "Öz", size=9, bold=True)
    add_p(doc,
          "Suno, Udio ve MusicGen gibi metinden müziğe üretim "
          "sistemlerinin yaygınlaşması, üretilen müzik parçalarının insan "
          "eliyle bestelenmiş kayıtlardan ayırt edilmesini bir tespit "
          "problemi olarak gündeme getirmiştir. Bu çalışmada, 47 boyutlu "
          "akustik öznitelik vektörü ile yedi makine öğrenmesi ve dört "
          "derin öğrenme algoritmasından oluşan on bir modelli bir "
          "topluluk öğrenmesi yaklaşımını birleştiren AURIS adlı bir "
          "sistem önerilmektedir. Modeller, on iki yapay zekâ üretici "
          "sisteminden ve birden çok insan kaynağından derlenen 5.195 "
          "örneklik bir veri kümesi üzerinde 5-katlı çapraz doğrulama ile "
          "eğitilmiştir. LightGBM, %95,48 ROC-AUC ve ±0,0023 standart "
          "sapma ile en başarılı sonucu elde etmiştir. Spektral düzlük "
          "standart sapması en bilgilendirici öznitelik olarak ön plana "
          "çıkmıştır. Youden J kriteri ile optimize edilen θ* = 0,4316 "
          "karar eşiği varsayılan 0,5 eşiğine kıyasla dengeli doğruluğu "
          "iyileştirmiştir. Brier skoru 0,083 olarak ölçülmüş ve modelin "
          "olasılık çıktılarının iyi kalibre olduğu doğrulanmıştır.",
          size=9, align=WD_ALIGN_PARAGRAPH.JUSTIFY, indent=True)
    add_p(doc, "")

    add_p(doc, "Anahtar Kelimeler", size=9, bold=True)
    add_p(doc, "Yapay zekâ tarafından üretilen müzik, derin öğrenme, "
               "gradyan artırma, topluluk öğrenmesi, spektral düzlük",
          size=9)
    add_p(doc, "")

    # English
    add_p(doc, "AURIS: A multi-model ensemble approach for the detection "
               "of AI-generated music",
          size=14, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_p(doc, "")

    add_p(doc, "Highlights", size=9, bold=True)
    for h in [
        "End-to-end AI-generated music detection system using a "
        "47-dimensional acoustic feature vector and 11-model ensemble",
        "LightGBM achieves 95.48% ROC-AUC with ±0.0023 cross-fold "
        "standard deviation, the lowest variance in the pool",
        "Spectral flatness standard deviation identified as the most "
        "informative feature for the AI-versus-human distinction",
    ]:
        add_p(doc, "• " + h, size=9)
    add_p(doc, "")

    add_p(doc, "Abstract", size=9, bold=True)
    add_p(doc,
          "The proliferation of text-to-music generators such as Suno, "
          "Udio and MusicGen has raised a detection problem of practical "
          "importance for copyright attribution and streaming-platform "
          "integrity. This paper proposes AURIS, a system that couples a "
          "47-dimensional handcrafted acoustic feature vector with an "
          "ensemble of eleven classifiers (seven machine learning and four "
          "deep learning architectures). The models are trained on 5,195 "
          "samples drawn from twelve AI generation systems and multiple "
          "human sources under 5-fold cross-validation. LightGBM achieves "
          "the top ROC-AUC of 0.9548 with ±0.0023 cross-fold standard "
          "deviation, combining the best mean with the lowest variance in "
          "the pool. Spectral-flatness standard deviation ranks first in "
          "feature importance. A Youden-J optimised threshold of "
          "θ* = 0.4316 improves balanced accuracy over the default 0.5 "
          "cutoff, and a Brier score of 0.083 confirms that the "
          "probability outputs are well calibrated.",
          size=9, align=WD_ALIGN_PARAGRAPH.JUSTIFY, indent=True)
    add_p(doc, "")

    add_p(doc, "Key Words", size=9, bold=True)
    add_p(doc, "AI-generated music, deep learning, gradient boosting, "
               "ensemble learning, spectral flatness", size=9)
    add_p(doc, "")

    # ═══════ 1. GİRİŞ ═══════
    add_heading_main(doc, "1. Giriş", "Introduction")

    add_body(doc,
        "Yapay zekâ tabanlı metinden müziğe üretim sistemlerinin son üç "
        "yıl içerisinde araştırma laboratuvarlarından tüketici "
        "uygulamalarına doğru yaşadığı hızlı geçiş, üretilen müzik "
        "parçalarının insan kayıtlarından ayırt edilmesini önemli bir "
        "problem olarak gündeme getirmiştir. Suno (sürüm 3-5), Udio, Meta "
        "tarafından geliştirilen MusicGen [1] sistemi ve AudioLDM [2] gibi "
        "difüzyon tabanlı modeller, kullanıcının sağladığı kısa bir metin "
        "istemi ile dakikalar mertebesinde tam uzunlukta müzik parçaları "
        "üretebilme kapasitesine ulaşmıştır. Üretilen bu parçaların "
        "deneyimsiz bir dinleyici tarafından insan eliyle bestelenmiş "
        "kayıtlardan ayırt edilmesi çoğu durumda mümkün olmamaktadır. Bu "
        "gelişme; telif hakkı atıflandırması, çevrimiçi akış "
        "platformlarının içerik bütünlüğü, oturum müzisyenlerinin "
        "ekonomik hakları ve eğitimcilerin yazarlık değerlendirmesi gibi "
        "kritik konuları doğrudan etkilemektedir.")

    add_body(doc,
        "Konuşma için ses derin sahte tespiti ADD 2022 [3] yarışmaları ve "
        "WaveFake [4] gibi büyük ölçekli veri kümeleri sayesinde aktif "
        "bir araştırma alanı hâline gelmiştir. Buna karşın, yapay zekâ "
        "ile üretilen müziğin tespiti henüz benzer bir olgunluğa "
        "ulaşamamıştır. Bunun temel nedeni, müziğin konuşmadan farklı "
        "olarak sabit bir sözlüğe, doğrulanabilir bir konuşmacı kimliğine "
        "veya prozodi izine sahip olmamasıdır. Müzik; harmonik karmaşıklık, "
        "çokseslilik, perküsyon ve insan stüdyoları ile sentetik üretim "
        "hatları arasında geniş bir varyasyon gösteren kayıt artefaktları "
        "içermektedir. Konu üzerinde gerçekleştirilen güncel tarama "
        "çalışmaları [5, 6] alanın henüz oluşum aşamasında olduğunu "
        "belirtmektedir.")

    add_body(doc,
        "Afchar vd. tarafından öne sürülen çalışmada [7], oto-kodlayıcı "
        "artefaktlarını tanımak amacıyla eğitilen bir tespit sisteminin "
        "%99,8 doğruluk değerine ulaşabildiği; ancak aynı sistemin MP3 "
        "sıkıştırma ve perde kaydırma gibi basit ses manipülasyonları "
        "altında performansının ciddi biçimde düştüğü raporlanmıştır. Kim "
        "ve Go [8] tarafından öne sürülen Segment Transformer, kısa müzik "
        "segmentlerini önceden eğitilmiş bir kodlayıcı ile gömüp bunları "
        "bir Dönüştürücü başlığı ile birleştirerek bir müzik parçasının "
        "tamamındaki yapısal örüntüleri yakalamaktadır.")

    add_body(doc,
        "Bu çalışmada önerilen AURIS sistemi, tek bir temsile bağlı "
        "kalmak yerine; spektral, zamansal, harmonik ve vokal davranışı "
        "özetleyen 47 boyutlu elle tasarlanmış bir öznitelik vektörü ile "
        "kasıtlı biçimde heterojen on bir sınıflandırıcıdan oluşan bir "
        "topluluğu birleştirmektedir. Çalışmanın temel katkıları şunlardır: "
        "on iki yapay zekâ üreticisinden ve birden çok insan kaynağından "
        "derlenen 5.195 örneklik halka açık bir veri kümesi, yedi makine "
        "öğrenmesi ve dört derin öğrenme algoritmasının ortak bir 5-katlı "
        "çapraz doğrulama protokolü altında karşılaştırmalı "
        "değerlendirilmesi ve SHAP [11] tabanlı bir yorumlanabilirlik "
        "analizi sunulmaktadır.")

    # ═══════ 2. TEORİK METOT ═══════
    add_heading_main(doc, "2. Teorik Metot", "Theoretical Method")

    add_body(doc,
        "Bu bölümde önerilen AURIS sistemini geliştirmek için kullanılan "
        "veri kümesi, öznitelik çıkarma süreci, sınıflandırma modelleri "
        "ve eğitim protokolü detaylandırılmaktadır. Önerilen sistemin "
        "uçtan-uca işleyişine genel bir bakış Şekil 1'de sunulmuştur.")

    add_figure(doc, "paper_pipeline_diagram.png",
               "Şekil 1. AURIS uçtan-uca işleyiş şeması.",
               "End-to-end AURIS pipeline.", width_cm=15.0)

    add_sub_heading(doc, "2.1. Kullanılan veri kümesi", "Utilized dataset")

    add_body(doc,
        "Bu çalışmada toplam 5.195 ses örneğinden oluşan bir veri kümesi "
        "derlenmiştir. Örneklerin 3.113 tanesi insan tarafından "
        "bestelenmiş kayıtları (sınıf 0), 2.082 tanesi ise yapay zekâ "
        "tarafından üretilmiş örnekleri (sınıf 1) temsil etmektedir. İnsan "
        "kaynakları GTZAN (899 örnek), FMA Small (1.000 örnek) ve "
        "SleepyJesse kapak performansı veri seti (854 örnek) olmak üzere "
        "üç ayrı havuzdan oluşturulmuştur. Yapay zekâ kaynakları Suno "
        "(500), Udio, MusicGen [1], AudioLDM2 [2], Stable Audio, "
        "Riffusion, Mustango, JEN-1 ile Echoes ve AImE alt kümelerini "
        "içermektedir. Veri kümesi kompozisyonu Tablo 1'de sunulmuştur.")

    add_table_caption(doc, "Tablo 1. Veri kümesi kompozisyonu",
                      "Dataset composition")
    add_table(doc,
              ["Kaynak", "Tür", "Örnek Sayısı", "Etiket"],
              [
                  ["GTZAN", "İnsan", "899", "0"],
                  ["FMA Small", "İnsan", "1.000", "0"],
                  ["SleepyJesse", "İnsan (kapak)", "854", "0"],
                  ["Diğer insan", "İnsan", "360", "0"],
                  ["Echoes", "Yapay zekâ", "1.128", "1"],
                  ["Suno (v3-v5)", "Yapay zekâ", "500", "1"],
                  ["Deepfake seti", "Yapay zekâ", "492", "1"],
                  ["AImE/Mustango/JEN-1", "Yapay zekâ", "204", "1"],
                  ["Toplam", "", "5.195", ""],
              ])

    add_sub_heading(doc, "2.2. Öznitelik çıkarma", "Feature extraction")

    add_body(doc,
        "Her ses parçası 22.050 Hz örnekleme hızında yeniden örneklenmiş "
        "ve librosa [28] kütüphanesi kullanılarak 47 boyutlu bir "
        "öznitelik vektörüne dönüştürülmüştür. Öznitelik vektörü beş "
        "aileden oluşmaktadır: spektral aile (16 öznitelik), zamansal "
        "aile (10 öznitelik), harmonik ve tonal aile (9 öznitelik), MFCC "
        "ailesi (3 öznitelik) ve vokal aile (9 öznitelik). İlk sekiz "
        "öznitelik için insan ve yapay zekâ örneklerinin dağılımları "
        "Şekil 2'de karşılaştırılmıştır.")

    add_figure(doc, "feature_distribution_ai_vs_human.png",
               "Şekil 2. İlk sekiz özniteliğin dağılımları.",
               "Distribution of the top eight features.", width_cm=15.0)

    add_sub_heading(doc, "2.3. Sınıflandırma modelleri",
                    "Classification models")

    add_body(doc,
        "On bir sınıflandırma modeli ortak bir 5-katlı çapraz doğrulama "
        "protokolü altında karşılaştırılmıştır. Yedi makine öğrenmesi "
        "modeli scikit-learn [29] kütüphanesi kullanılarak uygulanmıştır: "
        "Lojistik Regresyon, Rastgele Orman, Gradyan Artırma, SVM-RBF, "
        "Çok Katmanlı Algılayıcı, XGBoost [9] ve LightGBM [10]. Dört "
        "derin öğrenme mimarisi PyTorch ile uygulanmıştır: Derin Çok "
        "Katmanlı Algılayıcı (Derin ÇKA), 1B-Evrişimli Sinir Ağı, Artık "
        "ÇKA ve Dikkat ÇKA. Modellerin hiperparametreleri Tablo 2'de "
        "verilmiştir.")

    add_table_caption(doc, "Tablo 2. Modellerin temel hiperparametreleri",
                      "Key hyperparameters of the models")
    add_table(doc,
              ["Model", "Tip", "Temel Hiperparametreler"],
              [
                  ["Lojistik Regresyon", "ML",
                   "C=2,0; max_iter=2500; balanced"],
                  ["Rastgele Orman", "ML", "n_estimators=500; log2"],
                  ["Gradyan Artırma", "ML",
                   "n_estimators=180; max_depth=4; lr=0,07"],
                  ["SVM-RBF", "ML", "C=10,0; gamma=0,05"],
                  ["ÇKA Sinir Ağı", "ML", "128-64; relu; adam"],
                  ["XGBoost", "ML", "n_estimators=400; lr=0,05"],
                  ["LightGBM", "ML",
                   "n_estimators=400; lr=0,05; num_leaves=31"],
                  ["Derin ÇKA", "DL", "512-256-128-64; BatchNorm"],
                  ["1B-ESA", "DL", "Conv1D + max-pool"],
                  ["Artık ÇKA", "DL", "3 blok; 256-256"],
                  ["Dikkat ÇKA", "DL", "Öz-dikkat; 4 baş"],
              ])

    add_sub_heading(doc, "2.4. Eğitim protokolü ve karar eşiği optimizasyonu",
                    "Training protocol and decision threshold optimisation")

    add_body(doc,
        "Tüm modeller stratifiye edilmiş 5-katlı çapraz doğrulama ile "
        "değerlendirilmiştir. Her kat içinde StandardScaler eğitim alt "
        "kümesi üzerinde fit edilmiş, ardından doğrulama alt kümesi "
        "üzerinde transform uygulanmıştır. Karar eşiği θ, varsayılan 0,5 "
        "yerine Youden'in J istatistiği ile optimize edilmiştir: "
        "J(θ) = TPR(θ) − FPR(θ), Eş. 1. LightGBM için Youden-optimal eşik "
        "θ* = 0,4316 olarak ölçülmüştür. Kalibrasyon kalitesi Brier "
        "skoru ile değerlendirilmiştir, Eş. 2: BS = (1/N) Σᵢ (pᵢ − yᵢ)². "
        "Modelin yorumlanabilirliği TreeSHAP [11] algoritması "
        "kullanılarak analiz edilmiştir.")

    # ═══════ 3. SONUÇLAR VE TARTIŞMALAR ═══════
    add_heading_main(doc, "3. Sonuçlar ve Tartışmalar",
                     "Results and Discussions")

    add_body(doc,
        "Tablo 3, on bir modelin 5-katlı çapraz doğrulama sonuçlarını "
        "ROC-AUC değerine göre sıralı olarak sunmaktadır. LightGBM "
        "modeli, %95,48 ortalama ROC-AUC değeri ile ilk sırada yer "
        "almakta; Derin ÇKA modeli %95,42 ile çok yakın bir ikinci sıra "
        "elde etmektedir. 1B-ESA modeli %85,43 ile en düşük performansı "
        "sergilemiştir. Şekil 3 on bir modelin doğruluk, F1 ve ROC-AUC "
        "değerlerini karşılaştırmalı olarak göstermektedir.")

    add_table_caption(doc, "Tablo 3. 5-katlı çapraz doğrulama sonuçları",
                      "5-fold cross-validation results")
    add_table(doc,
              ["Sıra", "Model", "Tip", "Doğruluk", "F1", "ROC-AUC", "θ*"],
              [
                  ["1", "LightGBM", "ML",
                   "0,8839", "0,8575", "0,9548", "0,4316"],
                  ["2", "Derin ÇKA", "DL",
                   "0,8849", "0,8596", "0,9542", "—"],
                  ["3", "Artık ÇKA", "DL",
                   "0,8756", "0,8476", "0,9485", "—"],
                  ["4", "XGBoost", "ML",
                   "0,8751", "0,8408", "0,9465", "—"],
                  ["5", "Gradyan Artırma", "ML",
                   "0,8685", "0,8337", "0,9397", "—"],
                  ["6", "Rastgele Orman", "ML",
                   "0,8606", "0,8183", "0,9394", "—"],
                  ["7", "Dikkat ÇKA", "DL",
                   "0,8628", "0,8293", "0,9359", "—"],
                  ["8", "SVM-RBF", "ML",
                   "0,8612", "0,8252", "0,9346", "—"],
                  ["9", "ÇKA Sinir Ağı", "ML",
                   "0,8566", "0,8189", "0,9276", "—"],
                  ["10", "1B-ESA", "DL",
                   "0,7665", "0,7159", "0,8543", "—"],
                  ["11", "Lojistik Regresyon", "ML",
                   "0,7779", "0,7390", "0,8515", "—"],
              ])

    add_figure(doc, "paper_model_comparison.png",
               "Şekil 3. On bir modelin performans karşılaştırması.",
               "Performance comparison of the eleven models.", width_cm=15.0)

    add_figure(doc, "paper_roc_curves.png",
               "Şekil 4. Yedi makine öğrenmesi modelinin ROC eğrileri.",
               "ROC curves of the seven machine learning models.", width_cm=12.0)

    add_body(doc,
        "Makine öğrenmesi ile derin öğrenme aileleri karşılaştırıldığında, "
        "yedi makine öğrenmesi sınıflandırıcısı %92,75 ortalama ROC-AUC "
        "değerine ulaşırken dört derin öğrenme mimarisi %92,32 değerinde "
        "kalmaktadır. 1B-ESA dışlandığında, kalan üç DL mimarisi %94,62 "
        "ortalama elde etmektedir. Bu bulgu, 47 boyutlu öznitelik "
        "vektörünün ayırt edici bilginin büyük kısmını kodladığını ve "
        "öznitelik mühendisliğinin model kapasitesinden daha belirleyici "
        "bir etken olduğunu göstermektedir.")

    add_figure(doc, "paper_ml_vs_dl.png",
               "Şekil 5. Makine öğrenmesi ile derin öğrenme ailelerinin "
               "karşılaştırması.",
               "Comparison of machine learning and deep learning families.",
               width_cm=15.0)

    add_body(doc,
        "Katlar-arası kararlılık açısından LightGBM ±0,0023 standart "
        "sapma ile havuzdaki en kararlı modeldir; beş katı 0,9515 ile "
        "0,9580 arasında dar bir aralıkta değişmektedir. XGBoost "
        "(±0,0029) ve Gradyan Artırma (±0,0038) onu izlemektedir. En "
        "değişken modeller 1B-ESA (±0,0087) ve SVM-RBF (±0,0075) "
        "olmuştur. Kararlılığa göre sıralama, ortalama AUC sıralamasını "
        "yakından izlemektedir.")

    add_figure(doc, "paper_fold_std_table.png",
               "Şekil 6. On bir modelin kat bazlı ROC-AUC değerleri.",
               "Per-fold ROC-AUC values for the eleven models.", width_cm=15.0)

    add_body(doc,
        "Öznitelik önemi analizi sonuçları spektral düzlük standart "
        "sapması özniteliğinin yapay zekâ ile insan müziği ayrımı için "
        "en bilgilendirici öznitelik olduğunu açık biçimde ortaya "
        "koymuştur. Tablo 4 ilk on özniteliği listelemektedir. Şekil 7 "
        "ilk yirmi özniteliğin normalize edilmiş önem skorlarını "
        "göstermektedir.")

    add_table_caption(doc, "Tablo 4. LightGBM'in ilk on özniteliği",
                      "Top ten features of LightGBM")
    add_table(doc,
              ["Sıra", "Öznitelik", "Önem"],
              [
                  ["1", "spectral_flatness_std", "0,0619"],
                  ["2", "spectral_contrast_mean", "0,0467"],
                  ["3", "rms_energy", "0,0456"],
                  ["4", "onset_strength_std", "0,0388"],
                  ["5", "spectral_flatness_mean", "0,0370"],
                  ["6", "rms_dynamic_range", "0,0346"],
                  ["7", "onset_strength_mean", "0,0332"],
                  ["8", "rms_std", "0,0298"],
                  ["9", "beat_count", "0,0298"],
                  ["10", "mfcc_delta_var", "0,0289"],
              ])

    add_figure(doc, "paper_feature_importance.png",
               "Şekil 7. İlk yirmi özniteliğin önem skorları.",
               "Top-twenty feature importance scores.", width_cm=12.0)

    add_figure(doc, "shap_summary.png",
               "Şekil 8. TreeSHAP global etki diyagramı.",
               "TreeSHAP global effect plot.", width_cm=12.0)

    add_body(doc,
        "Şekil 9 LightGBM modelinin Youden-optimal eşik θ* = 0,4316 ile "
        "elde edilen karmaşıklık matrisini göstermektedir: 2.721 doğru "
        "negatif (%87,4), 1.862 doğru pozitif (%89,4), 392 yanlış pozitif "
        "(%12,6) ve 220 yanlış negatif (%10,6). Şekil 10 insan ve yapay "
        "zekâ sınıflarına ait olasılık dağılımlarını sunmaktadır. Şekil "
        "11'deki kalibrasyon eğrisi 0,083 Brier skoru ile birlikte "
        "modelin olasılık çıktılarının iyi kalibre olduğunu "
        "doğrulamaktadır. Şekil 12 kesinlik-duyarlılık eğrisini 0,934 "
        "ortalama kesinlik değeri ile göstermektedir.")

    add_figure(doc, "paper_confusion_matrix_lightgbm.png",
               "Şekil 9. LightGBM karmaşıklık matrisi.",
               "LightGBM confusion matrix.", width_cm=10.0)

    add_figure(doc, "paper_score_distribution.png",
               "Şekil 10. P(AI) tahmin olasılık dağılımı.",
               "P(AI) probability distribution.", width_cm=12.0)

    add_figure(doc, "paper_calibration.png",
               "Şekil 11. Kalibrasyon eğrisi (Brier = 0,083).",
               "Calibration curve.", width_cm=10.0)

    add_figure(doc, "paper_precision_recall.png",
               "Şekil 12. Kesinlik-duyarlılık eğrisi.",
               "Precision-recall curve.", width_cm=10.0)

    add_body(doc,
        "Eşik taraması analizi (Şekil 13), F1 skorunun 0,40-0,50 "
        "aralığında bir plato oluşturduğunu göstermektedir. Üretici "
        "bazlı performans (Şekil 14) Suno parçalarında %93,0 duyarlılık, "
        "Echoes alt kümesinde ise %88,6 duyarlılık elde edildiğini; "
        "buna karşın deepfake alt kümesinde performansın %50,0 değerinde "
        "kaldığını ortaya koymaktadır. Bu sonuç üretici modeller arası "
        "genelleme zorluğunu doğrular niteliktedir.")

    add_figure(doc, "threshold_sweep.png",
               "Şekil 13. Karar eşiği taraması.",
               "Decision-threshold sweep.", width_cm=12.0)

    add_figure(doc, "per_source_performance.png",
               "Şekil 14. Kaynak bazlı LightGBM performansı.",
               "Per-source LightGBM performance.", width_cm=12.0)

    add_body(doc,
        "Spektral düzlüğün öznitelik önem sıralamasındaki baskın konumu "
        "daha geniş ses derin sahte literatürüyle [6] tutarlı ve "
        "yorumlanabilir bir bulgudur. Güncel yapay zekâ üretim "
        "sistemleri algısal kalite ölçütlerini optimize etme "
        "eğilimindedir ve bunun yan etkisi olarak insan kayıtlarınınkinden "
        "sistematik biçimde daha temiz spektrumlar üretmektedir. 1B-ESA "
        "modelinin diğer mimarilere kıyasla belirgin biçimde düşük "
        "performansı, sıralanmamış 47 boyutlu öznitelik vektörü üzerinde "
        "tek boyutlu evrişimin öğrenebileceği anlamlı bir öteleme "
        "değişmezliği bulunmamasından kaynaklanan mimari uyumsuzluğun "
        "sonucudur.")

    add_body(doc,
        "Aşırı öğrenme tanılayıcı analizi (Şekil 15), tüm ağaç tabanlı "
        "modellerin eğitim ve çapraz doğrulama doğruluğu arasında 8-14 "
        "puanlık bir fark sergilediğini göstermektedir. Rastgele Orman "
        "%100,0 eğitim doğruluğuna karşı çapraz doğrulama altında %86,1 "
        "doğruluk elde etmiştir. Eğitim ve çapraz doğrulama "
        "doğruluklarının esasen örtüştüğü tek model, yalnızca 0,6 "
        "puanlık fark ile Lojistik Regresyon olmuştur.")

    add_figure(doc, "train_val_gap.png",
               "Şekil 15. Eğitim ve çapraz doğrulama doğruluk farkı.",
               "Train versus cross-validation accuracy gap.", width_cm=12.0)

    add_body(doc,
        "Öznitelik fazlalığı analizi sonuçları 47 özniteliğin tasarım "
        "gereği fazlalıklı bir yapıya sahip olduğunu göstermiştir. "
        "Yirmi öznitelik çiftinin |Pearson r| değeri 0,85 değerinin "
        "üzerinde ölçülmüştür (Şekil 16). Öznitelik çıkarma deneyi "
        "(Şekil 17) öznitelik sayısı N = 30 değerine ulaştığında "
        "doğruluğun plato yaptığını ortaya koymuş; sondaki 17 "
        "özniteliğin ölçülebilir bir ek doğruluk sağlamadığı "
        "tespit edilmiştir.")

    add_figure(doc, "feature_correlation_heatmap.png",
               "Şekil 16. 47 öznitelik korelasyon ısı haritası.",
               "47-feature correlation heatmap.", width_cm=15.0)

    add_figure(doc, "feature_ablation_curve.png",
               "Şekil 17. Öznitelik sayısı vs doğruluk eğrisi.",
               "Number of features vs accuracy curve.", width_cm=12.0)

    # ═══════ 5. SONUÇLAR ═══════
    add_heading_main(doc, "4. Sonuçlar", "Conclusions")

    add_body(doc,
        "Bu çalışmada yapay zekâ tarafından üretilen müziği insan "
        "tarafından bestelenmiş kayıtlardan ayırt edebilmek için AURIS "
        "adlı uçtan-uca bir tespit sistemi önerilmiştir. Önerilen "
        "sistem 47 boyutlu elle tasarlanmış akustik öznitelik vektörünü, "
        "on iki yapay zekâ üretim sisteminden derlenen 5.195 örnek "
        "üzerinde eğitilen on bir sınıflandırma modelinden oluşan bir "
        "topluluk ile birleştirmektedir. Elde edilen temel bulgular: "
        "LightGBM modeli %95,48 ortalama ROC-AUC değeri ve ±0,0023 "
        "standart sapma ile havuzdaki en başarılı modeli oluşturmuştur. "
        "Derin ÇKA %95,42 ile çok yakın bir ikinci sıra almıştır. "
        "Spektral düzlük özniteliği yapay zekâ ile insan müziği ayrımı "
        "için en bilgilendirici tek öznitelik olarak öne çıkmıştır. "
        "Tanılayıcı analiz iki önemli sınırlamayı ortaya koymuştur: tüm "
        "ağaç tabanlı modeller eğitim ile çapraz doğrulama doğrulukları "
        "arasında 8-14 puanlık bir fark sergilemekte ve 47 özniteliğin "
        "sondaki yaklaşık on yedisi ölçülebilir bir ek doğruluk "
        "sağlamamaktadır.")

    add_body(doc,
        "Gelecek çalışmalar kapsamında SONICS [23] ve FakeMusicCaps [24] "
        "gibi gelişmekte olan halka açık kıyaslamalar üzerinde resmi bir "
        "üretici-modeller arası tutulan değerlendirme "
        "gerçekleştirilecektir. İnce ayar yapılmış wav2vec2 [13] modeli "
        "öznitelik tabanlı sınıflandırıcılarla doğrudan karşılaştırma "
        "için protokole entegre edilecektir. Düşmanca sağlamlık MP3 "
        "sıkıştırma, perde kaydırma ve zaman gerdirme altında açıkça "
        "değerlendirilecektir. Veri kümesi on bin örneğe doğru "
        "genişletilecek ve ortaya çıkan yeni yapay zekâ üretim "
        "sistemleri kapsama dahil edilecektir.")

    # ═══════ TEŞEKKÜR (numarasız) ═══════
    p = doc.add_paragraph()
    _set_line_15(p)
    r1 = p.add_run("Teşekkür ")
    _set_font(r1, size=9, bold=True)
    r2 = p.add_run("(Acknowledgement)")
    _set_font(r2, size=8, bold=True)
    add_p(doc, "")

    add_body(doc, "Yazar, çalışma boyunca rehberliği için Düzce "
                  "Üniversitesi Bilgisayar Mühendisliği Bölümü "
                  "öğretim üyelerine teşekkür eder.")

    # ═══════ KAYNAKLAR (numarasız) ═══════
    p = doc.add_paragraph()
    _set_line_15(p)
    r1 = p.add_run("Kaynaklar ")
    _set_font(r1, size=9, bold=True)
    r2 = p.add_run("(References)")
    _set_font(r2, size=8, bold=True)
    add_p(doc, "")

    # Referanslar - DOI YOK (resmi kural: yayınlanmışsa DOI verilmez)
    refs = [
        "Copet J., Kreuk F., Gat I., Remez T., Kant D., Synnaeve G., "
        "Adi Y., Défossez A., Simple and Controllable Music Generation, "
        "Adv Neural Inf Process Syst, 36, 2023.",

        "Liu H., Chen Z., Yuan Y., Mei X., Liu X., Mandic D., Wang W., "
        "Plumbley M.D., AudioLDM: Text-to-Audio Generation with Latent "
        "Diffusion Models, Proceedings of the 40th International "
        "Conference on Machine Learning (ICML 2023), 21450-21474, "
        "Honolulu, Hawaii, A.B.D., 23-29 Temmuz, 2023.",

        "Yi J. vd., ADD 2022: The First Audio Deep Synthesis Detection "
        "Challenge, Proceedings of the IEEE International Conference on "
        "Acoustics, Speech and Signal Processing (ICASSP 2022), "
        "9216-9220, Singapur, 22-27 Mayıs, 2022.",

        "Frank J., Schönherr L., WaveFake: A Data Set to Facilitate "
        "Audio Deepfake Detection, Advances in Neural Information "
        "Processing Systems Datasets and Benchmarks Track, 2021.",

        "Li Y., Milling M., Specia L., Schuller B.W., From Audio "
        "Deepfake Detection to AI-Generated Music Detection: A Pathway "
        "and Overview, arXiv preprint arXiv:2412.00571, 2024.",

        "Yi J., Wang C., Tao J., Zhang X., Zhang C.Y., Zhao Y., Audio "
        "Deepfake Detection: A Survey, arXiv preprint arXiv:2308.14970, "
        "2023.",

        "Afchar D., Meseguer Brocal G., Hennequin R., AI-Generated "
        "Music Detection and Its Challenges, Proceedings of the IEEE "
        "International Conference on Acoustics, Speech and Signal "
        "Processing (ICASSP 2025), Hyderabad, Hindistan, 6-11 Nisan, "
        "2025.",

        "Kim Y., Go S., Segment Transformer: AI-Generated Music "
        "Detection via Music Structural Analysis, arXiv preprint "
        "arXiv:2509.08283, 2025.",

        "Chen T., Guestrin C., XGBoost: A Scalable Tree Boosting "
        "System, Proceedings of the 22nd ACM SIGKDD International "
        "Conference on Knowledge Discovery and Data Mining (KDD '16), "
        "785-794, San Francisco, CA, A.B.D., 13-17 Ağustos, 2016.",

        "Ke G. vd., LightGBM: A Highly Efficient Gradient Boosting "
        "Decision Tree, Adv Neural Inf Process Syst, 30, 3149-3157, "
        "Long Beach, California, A.B.D., 4-9 Aralık, 2017.",

        "Lundberg S.M., Lee S.I., A Unified Approach to Interpreting "
        "Model Predictions, Adv Neural Inf Process Syst, 30, 4768-4777, "
        "Long Beach, California, A.B.D., 4-9 Aralık, 2017.",

        "Martín-Doñas J.M., Álvarez A., The Vicomtech Audio Deepfake "
        "Detection System Based on Wav2vec2 for the 2022 ADD Challenge, "
        "Proceedings of the IEEE International Conference on Acoustics, "
        "Speech and Signal Processing (ICASSP 2022), 9266-9270, "
        "Singapur, 22-27 Mayıs, 2022.",

        "Baevski A., Zhou Y., Mohamed A., Auli M., wav2vec 2.0: A "
        "Framework for Self-Supervised Learning of Speech "
        "Representations, Adv Neural Inf Process Syst, 33, 12449-12460, "
        "2020.",

        "Elizalde B., Deshmukh S., Al Ismail M., Wang H., CLAP: "
        "Learning Audio Concepts from Natural Language Supervision, "
        "Proceedings of the IEEE International Conference on Acoustics, "
        "Speech and Signal Processing (ICASSP 2023), 1-5, Rhodes, "
        "Yunanistan, 4-10 Haziran, 2023.",

        "Wu Y. vd., Large-Scale Contrastive Language-Audio Pretraining "
        "with Feature Fusion and Keyword-to-Caption Augmentation, "
        "Proceedings of the IEEE International Conference on Acoustics, "
        "Speech and Signal Processing (ICASSP 2023), 1-5, Rhodes, "
        "Yunanistan, 4-10 Haziran, 2023.",

        "Liu Y., Yin Y., Zhu Q., Cui W., Musical Instrument Recognition "
        "by XGBoost Combining Feature Fusion, arXiv preprint "
        "arXiv:2206.00901, 2022.",

        "Gan R., Huang T., Shao J., Wang F., Music Genre Classification "
        "Based on VMD-IWOA-XGBoost, Mathematics, 12 (10), 1549, 2024.",

        "Hızlısoy S., Tüfekci Z., Derin Öğrenme İle Türkçe Müziklerden "
        "Müzik Türü Sınıflandırması, Avrupa Bilim ve Teknoloji Dergisi, "
        "24, 176-183, 2021.",

        "Özbalcı M.C., Şahin H., Bilgin T.T., Classification of Music "
        "Genres of GTZAN Dataset with Machine Learning Methods, "
        "Mühendislik Bilimleri ve Araştırmaları Dergisi, 6 (1), 2024.",

        "Turan A.K., Polat H., Yarı Denetimli Makine Öğrenmesi "
        "Yöntemini Kullanarak Müzik Türlerinin Tespiti, Gazi Üniversitesi "
        "Fen Bilimleri Dergisi Part C: Tasarım ve Teknoloji, 12 (1), "
        "92-107, 2024.",

        "Kostrzewa D., Mazur W., Brzeski R., Wide Ensembles of Neural "
        "Networks in Music Genre Classification, Computational Science "
        "-- ICCS 2022, Lecture Notes in Computer Science, vol. 13351, "
        "91-102, Springer, 2022.",

        "Gourisaria M.K., Agrawal R., Sahni M., Comparative Analysis of "
        "Audio Classification with MFCC and STFT Features Using Machine "
        "Learning Techniques, Discover Internet of Things, 4 (1), 1, "
        "2024.",

        "Rahman M.A., Hakim Z.I.A., Sarker N.H., Paul B., Fattah S.A., "
        "SONICS: Synthetic Or Not -- Identifying Counterfeit Songs, "
        "Proceedings of the International Conference on Learning "
        "Representations (ICLR 2025), Singapur, 24-28 Nisan, 2025.",

        "Comanducci L., Bestagini P., Tubaro S., FakeMusicCaps: A "
        "Dataset for Detection and Attribution of Synthetic Music "
        "Generated via Text-to-Music Models, arXiv preprint "
        "arXiv:2409.10684, 2024.",

        "Pascu O., Oneata D., Cucu H., Müller N.M., Echoes: A "
        "Semantically-Aligned Music Deepfake Detection Dataset, arXiv "
        "preprint arXiv:2603.23667, 2025.",

        "Sunday N., Detecting Musical Deepfakes, arXiv preprint "
        "arXiv:2505.09633, 2025.",

        "Sroka T., Wężowicz T., Sidorczuk D., Modrzejewski M., "
        "Evaluating Fake Music Detection Performance Under Audio "
        "Augmentations, arXiv preprint arXiv:2507.10447, 2025.",

        "McFee B. vd., librosa: Audio and Music Signal Analysis in "
        "Python, Proceedings of the 14th Python in Science Conference "
        "(SciPy 2015), 18-24, Austin, Texas, A.B.D., 6-12 Temmuz, "
        "2015.",

        "Pedregosa F. vd., Scikit-learn: Machine Learning in Python, "
        "Journal of Machine Learning Research, 12, 2825-2830, 2011.",

        "Kingma D.P., Ba J., Adam: A Method for Stochastic "
        "Optimization, Proceedings of the 3rd International Conference "
        "on Learning Representations (ICLR 2015), 1-15, San Diego, "
        "California, A.B.D., 7-9 Mayıs, 2015.",
    ]
    for i, ref in enumerate(refs, start=1):
        add_ref(doc, i, ref)

    out = OUTDIR / "AURIS_Makale_Metni.docx"
    doc.save(str(out))
    print(f"OK  {out.name}")


# ══════════════════════════════════════════════════════════════════════════
# 3. GENİŞLETİLMİŞ İNGİLİZCE ÖZET
# ══════════════════════════════════════════════════════════════════════════
def build_genisletilmis_ozet():
    """Resmi şablonu doldur — tüm hücreler AURIS içeriği ile + GA görseli."""
    doc = Document(str(OZET_TPL))
    _setup_margins(doc)

    # Tablo 0: Başlık
    tbl0 = doc.tables[0]

    def cell_replace(cell, text, *, size=9, bold=False, italic=False,
                     align=None):
        for p in list(cell.paragraphs):
            p._element.getparent().remove(p._element)
        p = cell.add_paragraph()
        if align is not None:
            p.alignment = align
        r = p.add_run(text)
        _set_font(r, size=size, bold=bold, italic=italic)

    def cell_multi(cell, lines, *, size=9, bold=False):
        for p in list(cell.paragraphs):
            p._element.getparent().remove(p._element)
        for line in lines:
            p = cell.add_paragraph()
            r = p.add_run(line)
            _set_font(r, size=size, bold=bold)

    def cell_image(cell, img_path, *, width_cm=14.0, height_cm=6.0,
                   caption=None):
        for p in list(cell.paragraphs):
            p._element.getparent().remove(p._element)
        p = cell.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        if img_path.exists():
            r = p.add_run()
            r.add_picture(str(img_path), width=Cm(width_cm),
                          height=Cm(height_cm))
        if caption:
            pcap = cell.add_paragraph()
            pcap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            rc = pcap.add_run(caption)
            _set_font(rc, size=8, italic=True)

    cell_replace(tbl0.rows[1].cells[0],
                 "AURIS: A multi-model ensemble approach for the detection "
                 "of AI-generated music",
                 size=14, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    # R2 = uyarı, dokunma

    # Tablo 1
    tbl = doc.tables[1]
    for c in range(3):
        cell_replace(tbl.rows[0].cells[c], "Hasan Arthur Altuntaş1,*",
                     size=10, bold=True,
                     align=WD_ALIGN_PARAGRAPH.CENTER)
        cell_replace(tbl.rows[1].cells[c],
                     "1Department of Computer Engineering, Faculty of "
                     "Engineering, Düzce University, 81620, Düzce, Türkiye",
                     size=9, italic=True,
                     align=WD_ALIGN_PARAGRAPH.CENTER)

    cell_replace(tbl.rows[3].cells[0], "Highlights:", size=9, bold=True)
    cell_replace(tbl.rows[3].cells[2], "Graphical/Tabular Abstract",
                 size=9, bold=True)

    cell_multi(tbl.rows[4].cells[0], [
        "End-to-end AI music detection system using 47-D acoustic "
        "feature vector and 11-model ensemble (7 ML + 4 DL)",
        "LightGBM achieves 95.48% ROC-AUC with the lowest cross-fold "
        "standard deviation (±0.0023) in the entire pool",
        "Spectral flatness standard deviation identified as the most "
        "informative feature; 17 of 47 features add no measurable accuracy",
    ], size=9)
    # GA görseli — kurala göre 6×14 cm (h × w), 9pt yazı
    cell_image(tbl.rows[4].cells[2],
               FIGURES / "paper_pipeline_diagram.png",
               width_cm=14.0, height_cm=6.0,
               caption="Figure A. AURIS system pipeline overview")

    cell_replace(tbl.rows[5].cells[0], "Keywords:", size=9, bold=True)
    cell_replace(tbl.rows[5].cells[2], "Purpose:", size=9, bold=True)

    cell_multi(tbl.rows[6].cells[0], [
        "AI-generated music",
        "Deep learning",
        "Gradient boosting",
        "Ensemble learning",
        "Spectral flatness",
    ], size=9)
    cell_replace(tbl.rows[6].cells[2],
                 "The proliferation of text-to-music generators such as "
                 "Suno, Udio and MusicGen has raised a detection problem "
                 "of practical importance for copyright attribution, "
                 "streaming-platform integrity and artist economics. This "
                 "study aims to design an end-to-end system that "
                 "distinguishes AI-generated music from human composition "
                 "with both competitive accuracy and operational "
                 "interpretability.",
                 size=9)

    cell_replace(tbl.rows[7].cells[0], "Article Info:", size=9, bold=True)
    cell_replace(tbl.rows[7].cells[2], "Theory and Methods:",
                 size=9, bold=True)

    cell_multi(tbl.rows[8].cells[0], [
        "Research Article",
        "Received: dd.mm.yyyy",
        "Accepted: dd.mm.yyyy",
        "",
        "DOI:",
    ], size=9)
    cell_replace(tbl.rows[8].cells[2],
                 "A 47-dimensional acoustic feature vector covering "
                 "spectral, temporal, harmonic-tonal, MFCC and vocal "
                 "families is extracted using librosa. An ensemble of "
                 "eleven classifiers (Logistic Regression, Random Forest, "
                 "Gradient Boosting, SVM-RBF, MLP, XGBoost, LightGBM, Deep "
                 "MLP, 1D-CNN, Residual MLP and Attention MLP) is trained "
                 "on 5,195 samples from twelve AI generation systems and "
                 "multiple human sources under stratified 5-fold "
                 "cross-validation. Youden-J statistic is used for "
                 "threshold optimisation.",
                 size=9)

    cell_replace(tbl.rows[9].cells[0], "", size=9)
    cell_replace(tbl.rows[9].cells[2], "Results:", size=9, bold=True)
    cell_replace(tbl.rows[10].cells[0], "", size=9)
    cell_replace(tbl.rows[10].cells[2],
                 "LightGBM achieves the highest mean ROC-AUC at 0.9548 "
                 "with the lowest fold-to-fold standard deviation "
                 "(±0.0023). Deep MLP follows narrowly at 0.9542. "
                 "Spectral-flatness standard deviation ranks first in "
                 "feature importance. The Youden-optimal threshold "
                 "θ* = 0.4316 yields 89.4% AI sensitivity and 87.4% human "
                 "specificity. A Brier score of 0.083 confirms "
                 "well-calibrated probabilities. Per-source analysis "
                 "reveals 93.0% recall on Suno and 88.6% on Echoes, but "
                 "only 50.0% on the deepfake subset.",
                 size=9)

    cell_replace(tbl.rows[11].cells[0], "Acknowledgement:",
                 size=9, bold=True)
    cell_replace(tbl.rows[11].cells[2], "Conclusion:", size=9, bold=True)
    cell_replace(tbl.rows[12].cells[0], "—", size=9)
    cell_replace(tbl.rows[12].cells[2],
                 "The proposed AURIS system demonstrates that a "
                 "handcrafted feature vector combined with a "
                 "heterogeneous classifier ensemble is competitive with "
                 "deep-learning alternatives for AI-generated music "
                 "detection. Diagnostic analysis exposes train-CV "
                 "accuracy gaps for tree-based models and feature "
                 "redundancy in the bottom 17 features.",
                 size=9)

    cell_replace(tbl.rows[13].cells[0], "", size=9)
    cell_replace(tbl.rows[13].cells[2], "", size=9)
    cell_replace(tbl.rows[14].cells[0], "Correspondence:",
                 size=9, bold=True)
    cell_replace(tbl.rows[14].cells[2], "", size=9)

    cell_multi(tbl.rows[15].cells[0], [
        "Author: Hasan Arthur Altuntaş",
        "e-mail: hasannarthurrr@gmail.com",
        "ORCID: 0009-0002-8302-7657",
    ], size=9)
    cell_replace(tbl.rows[15].cells[2], "", size=9)
    cell_replace(tbl.rows[16].cells[0], "", size=9)
    cell_replace(tbl.rows[16].cells[2], "", size=9)

    out = OUTDIR / "AURIS_Genisletilmis_Ingilizce_Ozet.docx"
    doc.save(str(out))
    print(f"OK  {out.name}")


# ══════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    build_kapak()
    build_makale_metni()
    build_genisletilmis_ozet()
    print("\nTüm dosyalar tamamlandı:")
    for f in OUTDIR.glob("*.docx"):
        print(f"  {f.name}  ({f.stat().st_size // 1024} KB)")
