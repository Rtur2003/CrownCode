"""
Makale Metni dosyası: kontrol listesi + makale metni (KAPAK AYRI DOSYADA).

Resmi gereksinim: "Eser Kapak Sayfası, Makale Kontrol Listesi Formu ve Makale
Metni, Genişletilmiş İngilizce Özet ve Telif Hakkı Devir Formu olmak üzere
dört ayrı dosyadan oluşmalıdır" — yani bu dosya = kontrol listesi + makale.

Sayfa 1: Kontrol Listesi Formu (onaylar tikli)
Sayfa 2+: Türkçe Öne Çıkanlar, Öz, Anahtar Kelimeler + Highlights, Abstract,
Keywords + 1. Giriş, 2. Materyal..., 3. Sonuçlar..., Sonuçlar (Conclusions),
Kaynaklar (References).

Kapak SADECE Kapak Sayfası.docx'te.
"""
from pathlib import Path
from copy import deepcopy

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.shared import Cm, Pt, RGBColor

HERE     = Path(__file__).resolve().parent
KONTROL  = Path(r"D:/Downloads/Kontrol Listesi Formu.docx")
FIGURES  = HERE.parent / "figures"
OUT      = HERE / "deliverables" / "AURIS_Makale_Metni.docx"
OUT.parent.mkdir(parents=True, exist_ok=True)

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


def _keep_next(p):
    pPr = p._p.get_or_add_pPr()
    pPr.append(OxmlElement("w:keepNext"))


def _page_break_before(p):
    pPr = p._p.get_or_add_pPr()
    pPr.append(OxmlElement("w:pageBreakBefore"))


def _shade(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_color)
    tcPr.append(shd)


def _clear_cell(cell):
    for p in list(cell.paragraphs):
        p._element.getparent().remove(p._element)
    cell.add_paragraph()


def body(doc, text, *, size=9, justify=True, indent=True):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY if justify else WD_ALIGN_PARAGRAPH.LEFT
    pf = p.paragraph_format
    pf.line_spacing = 1.5
    if indent:
        pf.first_line_indent = Cm(0.5)
    pf.space_before = Pt(0)
    pf.space_after = Pt(6)
    r = p.add_run(text)
    _set_font(r, size=size)
    return p


def heading(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    pf = p.paragraph_format
    pf.line_spacing = 1.5
    pf.space_before = Pt(12)
    pf.space_after = Pt(4)
    r = p.add_run(text)
    _set_font(r, size=9, bold=True)
    _keep_next(p)
    return p


def subheading(doc, text):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.line_spacing = 1.5
    pf.space_before = Pt(8)
    pf.space_after = Pt(2)
    r = p.add_run(text)
    _set_font(r, size=9, bold=True, italic=True)
    _keep_next(p)
    return p


def figure(doc, filename, caption_tr, caption_en, width_cm=8.5):
    img = FIGURES / filename
    if not img.exists():
        body(doc, f"[FIGURE MISSING: {filename}]")
        return
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run()
    r.add_picture(str(img), width=Cm(width_cm))
    _keep_next(p)
    c1 = doc.add_paragraph()
    c1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    c1.paragraph_format.space_after = Pt(0)
    r = c1.add_run(caption_tr)
    _set_font(r, size=9, bold=True)
    _keep_next(c1)
    c2 = doc.add_paragraph()
    c2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    c2.paragraph_format.space_after = Pt(8)
    r = c2.add_run(f"({caption_en})")
    _set_font(r, size=8, italic=True)


def table_caption(doc, tr, en):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run(tr)
    _set_font(r, size=9, bold=True)
    _keep_next(p)
    p2 = doc.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p2.paragraph_format.space_after = Pt(2)
    r = p2.add_run(f"({en})")
    _set_font(r, size=8, italic=True)
    _keep_next(p2)


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
# BUILD: Kontrol Listesi ile başla, sonra makale metni
# ══════════════════════════════════════════════════════════════════════════
def build():
    # 1. Kontrol Listesi'ni base olarak kopyala
    doc = Document(str(KONTROL))

    # A4 + GUJSA marjinleri (2.5 cm her yan)
    for s in doc.sections:
        s.page_width    = Cm(21.0)
        s.page_height   = Cm(29.7)
        s.top_margin    = Cm(2.5)
        s.bottom_margin = Cm(2.5)
        s.left_margin   = Cm(2.5)
        s.right_margin  = Cm(2.5)

    # Kontrol listesi tablosunda tüm onayları işaretle (sol sütun)
    kontrol_tbl = doc.tables[1]
    for row in kontrol_tbl.rows:
        cell = row.cells[0]
        _clear_cell(cell)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run("✓")
        _set_font(r, size=14, bold=True)

    # Kontrol listesi tablosundan sonra sayfa sonu + makale metni
    # python-docx ile sayfa sonu: yeni paragrafa run + page break
    p = doc.add_paragraph()
    r = p.add_run()
    br = OxmlElement("w:br")
    br.set(qn("w:type"), "page")
    r._element.append(br)

    # ═══════════════════════ MAKALE METNİ ═══════════════════════
    # TR Öne Çıkanlar / Öz / Anahtar Kelimeler / EN Highlights / Abstract / Keywords
    # — Talha hoca yapısı: makale başında bu blok (kapak ayrı dosyada zaten)

    subheading(doc, "Öne Çıkanlar (Highlights)")
    for h in [
        "5.195 örneklik veri kümesi üzerinde 47 boyutlu akustik öznitelik vektörü ile "
        "uçtan-uca GenAI müzik tespit sistemi önerilmiştir.",
        "LightGBM, %95,48 ROC-AUC ve ±0,0023 katlar-arası standart sapma ile en "
        "başarılı modeli oluşturmuştur.",
        "Spektral düzlük standart sapması yapay zekâ-insan ayrımı için en "
        "bilgilendirici öznitelik olarak tespit edilmiştir.",
    ]:
        p = doc.add_paragraph()
        pf = p.paragraph_format
        pf.left_indent = Cm(0.5)
        pf.line_spacing = 1.5
        pf.space_after = Pt(2)
        r = p.add_run(f"• {h}")
        _set_font(r, size=9)

    subheading(doc, "Öz")
    body(doc,
         "Üretken Yapay Zekâ (Generative Artificial Intelligence-GenAI) tabanlı "
         "metinden müziğe (text-to-music) üretim sistemlerinin son üç yılda hızlı "
         "yaygınlaşması, üretilen müzik parçalarının insan eliyle bestelenmiş "
         "kayıtlardan ayırt edilmesini önemli bir tespit problemi olarak gündeme "
         "getirmiştir. Bu çalışmada, 47 boyutlu elle tasarlanmış bir akustik "
         "öznitelik vektörü ile yedi makine öğrenmesi ve dört derin öğrenme "
         "algoritmasından oluşan on bir modelli bir topluluk öğrenmesi yaklaşımını "
         "birleştiren AURIS adlı yenilikçi bir sistem önerilmektedir. Modeller, on "
         "iki veya daha fazla GenAI üretici sistemden ve birden çok insan kaynağından "
         "derlenen 5.195 örneklik bir veri kümesi üzerinde 5-katlı çapraz doğrulama "
         "ile eğitilmiştir. LightGBM, %95,48 ROC-AUC ve ±0,0023 standart sapma ile "
         "hem en yüksek ortalama hem de katlar-arası en düşük varyansı bir araya "
         "getirerek en başarılı sonucu elde etmiştir. Spektral düzlük standart "
         "sapması özniteliği, öznitelik önem sıralamasında ilk sırayı belirgin bir "
         "farkla almıştır. Youden J kriteri ile optimize edilen θ* = 0,4316 karar "
         "eşiği, varsayılan 0,5 eşiğine kıyasla dengeli doğruluğu sistematik biçimde "
         "iyileştirmiştir. Brier skoru 0,083 olarak ölçülmüştür.")

    subheading(doc, "Anahtar Kelimeler")
    body(doc, "Yapay zekâ tarafından üretilen müzik, derin öğrenme, gradyan artırma, "
              "topluluk öğrenmesi, spektral düzlük.", indent=False)

    subheading(doc, "Highlights")
    for h in [
        "An end-to-end GenAI music detection system is proposed using a "
        "47-dimensional acoustic feature vector on a 5,195-sample dataset.",
        "LightGBM achieves the top ROC-AUC of 0.9548 with the lowest cross-fold "
        "standard deviation of ±0.0023.",
        "Spectral flatness standard deviation emerges as the single most "
        "informative feature for the AI-versus-human distinction.",
    ]:
        p = doc.add_paragraph()
        pf = p.paragraph_format
        pf.left_indent = Cm(0.5)
        pf.line_spacing = 1.5
        pf.space_after = Pt(2)
        r = p.add_run(f"• {h}")
        _set_font(r, size=9, italic=True)

    subheading(doc, "Abstract")
    body(doc,
         "The proliferation of text-to-music generators such as Suno, Udio and "
         "MusicGen has raised a detection problem of practical importance for "
         "copyright attribution and streaming-platform integrity. This paper "
         "proposes AURIS, a system that couples a 47-dimensional handcrafted "
         "acoustic feature vector with an ensemble of eleven classifiers (seven "
         "machine learning and four deep learning algorithms). The models are "
         "trained on 5,195 samples drawn from twelve AI generation systems and "
         "multiple human sources (GTZAN, FMA, SleepyJesse covers) under 5-fold "
         "cross-validation. LightGBM achieves the top ROC-AUC of 0.9548 with "
         "±0.0023 cross-fold standard deviation, combining the best mean with the "
         "lowest variance in the pool; Deep MLP follows narrowly at 0.9542. "
         "Spectral-flatness standard deviation ranks first in feature importance. "
         "A Youden-J optimised threshold of θ* = 0.4316 improves balanced accuracy "
         "over the default 0.5 cutoff, and a Brier score of 0.083 confirms that "
         "the probability outputs are well calibrated.")

    subheading(doc, "Keywords")
    body(doc, "AI-generated music, deep learning, gradient boosting, ensemble "
              "learning, spectral flatness.", indent=False)

    # ═══════════════════════ 1. GİRİŞ ═══════════════════════
    heading(doc, "1. Giriş (Introduction)")

    body(doc,
         "Üretken Yapay Zekâ (Generative Artificial Intelligence-GenAI) "
         "sistemlerinin son üç yıl içerisinde araştırma laboratuvarlarından "
         "tüketici uygulamalarına doğru yaşadığı hızlı geçiş, metinden müziğe "
         "(text-to-music) üretim alanında belirgin bir dönüşümü beraberinde "
         "getirmiştir. Suno (sürüm 3-5), Udio, Meta tarafından geliştirilen "
         "MusicGen [1] sistemi ve AudioLDM [2] gibi difüzyon tabanlı modeller, "
         "kullanıcının sağladığı kısa bir metin istemi ile dakikalar mertebesinde "
         "tam uzunlukta müzik parçaları üretebilme kapasitesine ulaşmıştır. "
         "Üretilen bu parçaların, deneyimsiz bir dinleyici tarafından insan eliyle "
         "bestelenmiş kayıtlardan ayırt edilmesi çoğu durumda mümkün olmamaktadır. "
         "Bu gelişme; telif hakkı atıflandırması, çevrimiçi akış platformlarının "
         "içerik bütünlüğü, oturum müzisyenlerinin ekonomik hakları ve "
         "eğitimcilerin yazarlık değerlendirmesi gibi birçok kritik konuyu doğrudan "
         "etkilemektedir.")

    body(doc,
         "Konuşma için ses derin sahte tespiti, ADD 2022 [3] yarışmaları ve "
         "WaveFake [4] gibi büyük ölçekli veri kümeleri sayesinde aktif bir "
         "araştırma alanı hâline gelmiştir. Buna karşın, GenAI ile üretilen müziğin "
         "tespiti henüz benzer bir olgunluğa ulaşamamıştır. Bunun temel nedeni, "
         "müziğin konuşmadan farklı olarak sabit bir sözlüğe, doğrulanabilir bir "
         "konuşmacı kimliğine veya prozodi izine sahip olmamasıdır. Müzik; "
         "harmonik karmaşıklık, çokseslilik, perküsyon ve insan stüdyoları ile "
         "sentetik üretim hatları arasında geniş bir varyasyon gösteren kayıt "
         "artefaktları içermektedir. Konu üzerinde gerçekleştirilen güncel tarama "
         "çalışmaları [5, 6], alanın henüz oluşum aşamasında olduğunu "
         "belirtmekte ve üretici modeller arası genellemeyi alanın birincil açık "
         "problemi olarak vurgulamaktadır.")

    body(doc,
         "Yakın tarihli iki örnek çalışma, bu alandaki dengesizliği açık biçimde "
         "yansıtmaktadır. Afchar vd. tarafından öne sürülen çalışmada [7], "
         "oto-kodlayıcı artefaktlarını tanımak amacıyla eğitilen bir tespit "
         "sisteminin, nöral vokoderlerin (neural vocoder) bıraktığı spektral "
         "kalıntıları kullanarak %99,8 doğruluk değerine ulaşabildiği "
         "gösterilmiştir; ancak aynı sistemin, MP3 sıkıştırma ve perde kaydırma "
         "(pitch shifting) gibi basit ses manipülasyonları altında performansının "
         "ciddi biçimde düştüğü raporlanmıştır. Kim ve Go [8] ise kısa müzik "
         "segmentlerini önceden eğitilmiş bir kodlayıcı ile gömüp bunları bir "
         "Dönüştürücü (Transformer) başlığı ile birleştirerek bir müzik parçasının "
         "tamamındaki yapısal örüntüleri yakalayan Segment Transformer modelini "
         "önermiştir.")

    body(doc,
         "Bu çalışmada önerilen AURIS sistemi, söz konusu iki uç arasında dengeli "
         "bir konumda yer almaktadır. Sistem, tek bir temsile bağlı kalmak yerine; "
         "spektral, zamansal, harmonik ve vokal davranışı özetleyen 47 boyutlu "
         "elle tasarlanmış bir öznitelik vektörü ile kasıtlı biçimde heterojen on "
         "bir sınıflandırıcıdan oluşan bir topluluğu birleştirmektedir. Bu "
         "yaklaşımın amacı iki yönlüdür: birden çok GenAI üreticisi sisteminde "
         "rekabetçi tespit doğruluğu elde edebilmek ve tüketici donanımı üzerinde "
         "konuşlandırılabilir, yorumlanabilir ve güvenilir bir model elde "
         "edebilmek.")

    body(doc,
         "Bu makalenin geri kalanı şu şekilde yapılandırılmıştır: 1.1-1.5 alt "
         "bölümleri ses derin sahte tespiti, Dönüştürücü tabanlı ses temsilleri, "
         "ses için topluluk yöntemleri ve GenAI müzik tespiti alanındaki güncel "
         "literatürü gözden geçirmektedir. 2. Bölüm önerilen sistemin veri "
         "kümesini, öznitelik çıkarma boru hattını, on bir sınıflandırma modelini "
         "ve eğitim protokolünü tanımlamaktadır. 3. Bölüm deneysel sonuçları "
         "sunmakta ve tartışmaktadır. Son olarak Sonuçlar bölümü, çalışmanın temel "
         "bulgularını özetlemekte ve gelecek araştırmalar için öngörülen yönleri "
         "sunmaktadır. Önerilen sistem, "
         "https://huggingface.co/spaces/Rtur2003/AURIS adresinde halka açık olarak "
         "kullanıma sunulmuştur.")

    subheading(doc, "1.1. Konuşma için ses derin sahte tespiti "
                    "(Audio deepfake detection for speech)")
    body(doc,
         "Konuşma için ses derin sahte tespiti, GenAI ile üretilen müzik tespiti "
         "çalışmaları açısından doğrudan örnek alınan en olgun komşu alanı "
         "oluşturmaktadır. Yi vd. tarafından öne sürülen ADD 2022 [3] yarışmasında, "
         "bu alan resmî biçimde bir topluluk değerlendirme problemi olarak "
         "kurulmuş; düşük kaliteli sahte ses (LF), kısmî sahte ses (PF) ile oyun "
         "tabanlı algılama (FG) olmak üzere üç ayrı parça tanımlanmıştır. "
         "Martín-Doñas ve Álvarez tarafından öne sürülen Vicomtech sistemi [12], "
         "önceden eğitilmiş wav2vec2 [13] öznitelik çıkarıcısının üzerine bir "
         "sınıflandırma başlığı yerleştirerek bu yarışmada güçlü bir performans "
         "elde etmiştir. Yi vd. [6] tarafından yürütülen kapsamlı bir tarama "
         "çalışmasında alanın teknik ve etik zorlukları ayrıntılı biçimde "
         "özetlenmiştir. Frank ve Schönherr tarafından öne sürülen WaveFake [4] "
         "gibi büyük ölçekli veri kümeleri, vokoder-spesifik artefaktların tespit "
         "edilebilirliğinin sistematik biçimde incelenmesi için altyapı "
         "oluşturmuştur.")

    subheading(doc, "1.2. Dönüştürücü tabanlı ses temsilleri "
                    "(Transformer-based audio representations)")
    body(doc,
         "Dönüştürücü temelli ve kendi kendini denetimli (self-supervised) ses "
         "temsilleri, son beş yıl içerisinde geleneksel akustik öznitelik "
         "mühendisliğinin önemli bir alternatifi hâline gelmiştir. Baevski vd. "
         "tarafından öne sürülen çalışmada [13], ham ses sinyalinden ince ayar "
         "gerektirmeyen öznitelikler üreten wav2vec 2.0 mimarisi sunulmuştur. "
         "Elizalde vd. tarafından geliştirilen CLAP (Contrastive Language-Audio "
         "Pretraining) [14] yöntemi, karşıt öğrenme yaklaşımı ile ses ve metin "
         "temsillerini ortak bir gömü uzayında hizalamaktadır. Söz konusu çalışma, "
         "Wu vd. tarafından öne sürülen büyük ölçekli CLAP varyantında [15] "
         "genişletilmiş ve 633.526 ses-metin çiftinden öğrenilmiş daha güçlü bir "
         "model elde edilmiştir.")

    subheading(doc, "1.3. Ses için topluluk yöntemleri ve gradyan artırma "
                    "(Ensemble methods and gradient boosting for audio)")
    body(doc,
         "Topluluk öğrenmesi (ensemble learning) yöntemleri, ses sınıflandırma "
         "alanında istikrarlı biçimde rekabetçi sonuçlar üretmektedir. Liu vd. "
         "tarafından öne sürülen çalışmada [16], XGBoost tabanlı bir müzikal "
         "enstrüman tanıma sisteminin çoklu öznitelik füzyonu ile yüksek doğruluğa "
         "ulaşabildiği gösterilmiştir. Gan vd. [17] tarafından sunulan "
         "VMD-IWOA-XGBoost modeli, GTZAN ve Bangla veri kümeleri üzerinde diğer "
         "modelleri beş değerlendirme kriterinde geride bırakmıştır. Türkçe "
         "literatür kapsamında, Hızlısoy ve Tüfekci [18] derin öğrenme tabanlı bir "
         "mimari ile Türkçe müziklerin tür sınıflandırması üzerinde çalışmıştır. "
         "Özbalcı vd. [19], GTZAN veri kümesi üzerinde Rastgele Orman, SVM ve "
         "Yapay Sinir Ağı algoritmalarını karşılaştırmalı olarak değerlendirerek "
         "Rastgele Orman ile %81 doğruluk değerine ulaşmıştır. Turan ve Polat [20] "
         "ise yarı denetimli makine öğrenmesi yöntemleri ile müzik türlerinin "
         "tespiti üzerine çalışmıştır. Kostrzewa vd. [21] geniş sinir ağı "
         "toplulukları yaklaşımı önermiş; Gourisaria vd. [22] ise MFCC ve STFT "
         "özniteliklerini karşılaştırmalı olarak incelemiştir.")

    subheading(doc, "1.4. GenAI müzik üretici sistemleri "
                    "(GenAI music generation systems)")
    body(doc,
         "GenAI müzik üretim sistemleri, tespit problemini doğrudan şekillendiren "
         "teknik çeşitliliği yansıtmaktadır. Copet vd. tarafından geliştirilen "
         "MusicGen [1] sistemi, metne koşullu sıkıştırılmış ses andıçları üzerinde "
         "çalışan tek aşamalı bir Dönüştürücü dil modeli kullanmaktadır. Liu vd. "
         "[2] tarafından öne sürülen AudioLDM ise metinden sese üretim için CLAP "
         "gömmelerini koşullandırma sinyali olarak kullanan bir gizil difüzyon "
         "modelidir. Suno ve Udio gibi ticari ürünler altta yatan mimarilerini "
         "kamuoyu ile paylaşmamıştır; ancak çıktılarının sürümler arasında ölçülen "
         "spektral özellikleri dağılımsal olarak gözlemlenebilir tutarlı bir iz "
         "bırakmaktadır.")

    subheading(doc, "1.5. GenAI müzik tespitinde güncel gelişmeler "
                    "(Recent advances in GenAI music detection)")
    body(doc,
         "Bu alandaki en doğrudan ilgili çalışmalar 2024-2025 yılları arasında "
         "yayımlanmıştır. Li vd. [5] ses derin sahte tespiti metodolojisini GenAI "
         "müzik tespiti alanına bağlayan bir yol haritası sunmuş; üretici "
         "modeller arası genellemenin alanın birincil açık problemi olduğunu "
         "vurgulamıştır. Afchar vd. [7] oto-kodlayıcı artefaktları üzerinde "
         "eğitilen tespit sistemlerinin %99,8 doğruluk değerine ulaşabileceğini "
         "göstermiştir. Kim ve Go [8] tarafından öne sürülen Segment Transformer, "
         "kısa müzik segmentlerini Dönüştürücü başlığı ile işleyen bir mimari "
         "sunmaktadır. Rahman vd. [23] tarafından geliştirilen SONICS veri kümesi, "
         "97.000'den fazla şarkı ve 49.000'den fazla Suno/Udio kaynaklı sentetik "
         "şarkı içermektedir. Comanducci vd. [24] tarafından geliştirilen "
         "FakeMusicCaps veri kümesi, beş farklı metinden-müziğe modeli ile yeniden "
         "üretilmiş MusicCaps eşlemelerinden oluşmaktadır. Pascu vd. [25] "
         "tarafından öne sürülen Echoes veri kümesi, on farklı GenAI müzik üretim "
         "sistemini kapsamaktadır. Sunday [26] ve Sroka vd. [27] ses büyütmeleri "
         "altında tespit performansını sistematik biçimde değerlendirmiştir. AURIS "
         "ile karşılaştırma amacıyla ilgili çalışmaların özeti Tablo 1'de "
         "sunulmuştur.")

    table_caption(doc,
        "Tablo 1. İlgili çalışmaların genel bakışı",
        "Overview of related works")
    add_data_table(doc,
        ["Çalışma", "Veri Kümesi", "Metot", "Değerlendirme", "Sonuç"],
        [
            ["Afchar vd. [7]", "Özel", "wav2vec2 + başlık", "Doğruluk, AUC", "%99,8"],
            ["Kim ve Go [8]", "FakeMusicCaps + SONICS", "Segment Transformer", "F1", "%91+"],
            ["Rahman vd. [23]", "SONICS (97K)", "SpecTTTra", "F1, AUC", "Rekabetçi"],
            ["Comanducci vd. [24]", "FakeMusicCaps", "CNN + MFCC", "Doğruluk", "Referans"],
            ["Sunday [26]", "FakeMusicCaps", "CNN + Mel", "Doğruluk", "Değişken"],
            ["Sroka vd. [27]", "Birden çok", "Çoklu mimari", "AUC, F1", "Sağlamlık"],
            ["Pascu vd. [25]", "Echoes (3577)", "Çoklu", "Doğruluk", "Hizalı"],
            ["AURIS (bu çalışma)", "5.195, 12+ üretici", "47 öznitelik + 11 model", "AUC, F1, Brier", "%95,48"],
        ])

    # ═══════════════════════ 2. MATERYAL ═══════════════════════
    heading(doc, "2. Materyal ve Yöntem (Material and Method)")
    body(doc,
         "Bu bölümde önerilen AURIS sistemini geliştirmek için kullanılan "
         "materyal ve yöntemler özetlenmiştir. Alt bölümlerde sırasıyla (𝑖) "
         "kullanılan veri kümesi, (𝑖𝑖) öznitelik çıkarma boru hattı, (𝑖𝑖𝑖) "
         "sınıflandırma modelleri ve (𝑖𝑣) eğitim protokolü ile karar eşiği "
         "optimizasyonu detaylandırılmaktadır. Sistemin uçtan-uca işleyişi Şekil "
         "1'de sunulmuştur.")

    figure(doc, "paper_pipeline_diagram.png",
           "Şekil 1. AURIS uçtan-uca işleyiş şeması.",
           "End-to-end AURIS pipeline.", width_cm=15.0)

    subheading(doc, "2.1. Kullanılan veri kümesi (Utilized dataset)")
    body(doc,
         "Güçlü bir ML/DL modelinin inşa edilebilmesi için altın standartta bir "
         "veri kümesine sahip olmak en önemli gereksinimlerden biridir. Bu "
         "bağlamda, bu çalışmada toplam 5.195 ses örneğinden oluşan bir veri "
         "kümesi derlenmiştir. Örneklerin 3.113 tanesi insan tarafından "
         "bestelenmiş kayıtları (sınıf 0), 2.082 tanesi ise GenAI tarafından "
         "üretilmiş örnekleri (sınıf 1) temsil etmektedir. İnsan kaynakları üç "
         "ayrı havuzdan oluşturulmuştur: GTZAN (899 örnek), FMA Small (1.000 "
         "örnek) ve SleepyJesse kapak performansı veri seti (854 örnek). GenAI "
         "kaynakları Suno (500 örnek), Udio, MusicGen [1], AudioLDM2 [2], Stable "
         "Audio, Riffusion, Mustango, JEN-1 ile 'Echoes' ve 'AImE' alt kümelerini "
         "içermektedir. Veri kümesi kompozisyonu Tablo 2'de sunulmuştur.")

    table_caption(doc, "Tablo 2. Veri kümesi kompozisyonu", "Dataset composition")
    add_data_table(doc,
        ["Kaynak", "Tür", "Örnek Sayısı", "Etiket"],
        [
            ["GTZAN", "İnsan", "899", "0"],
            ["FMA Small", "İnsan", "1.000", "0"],
            ["SleepyJesse", "İnsan (kapak)", "854", "0"],
            ["Diğer insan", "İnsan (çeşitli)", "360", "0"],
            ["Echoes", "Yapay zekâ", "1.128", "1"],
            ["Suno (v3-v5)", "Yapay zekâ", "500", "1"],
            ["Deepfake seti", "Yapay zekâ", "492", "1"],
            ["AImE/Mustango/JEN-1", "Yapay zekâ", "204", "1"],
            ["Toplam", "", "5.195", ""],
        ])

    subheading(doc, "2.2. Öznitelik çıkarma (Feature extraction)")
    body(doc,
         "Tüm ML/DL modelleri sayısal verilerle çalışmaktadır. Bu nedenle, "
         "kullanılan veri kümesindeki ses parçalarının ayırt edici sayısal "
         "özniteliklerle temsil edilmesi gerekmektedir. Her ses parçası 22.050 Hz "
         "örnekleme hızında yeniden örneklenmiş ve librosa [28] kütüphanesi "
         "kullanılarak 47 boyutlu bir öznitelik vektörüne dönüştürülmüştür. "
         "Öznitelik vektörü beş aileden oluşmaktadır: (𝑖) spektral aile (16 "
         "öznitelik), (𝑖𝑖) zamansal aile (10 öznitelik), (𝑖𝑖𝑖) harmonik ve "
         "tonal aile (9 öznitelik), (𝑖𝑣) MFCC ailesi (3 öznitelik), (𝑣) vokal "
         "aile (9 öznitelik). İlk sekiz öznitelik için insan ve GenAI "
         "örneklerinin dağılımları Şekil 2'de karşılaştırılmıştır.")

    figure(doc, "feature_distribution_ai_vs_human.png",
           "Şekil 2. İlk sekiz özniteliğin insan-yapay zekâ dağılımları.",
           "Distribution of the top eight features.", width_cm=15.0)

    subheading(doc, "2.3. Sınıflandırma modelleri (Classification models)")
    body(doc,
         "On bir sınıflandırma modeli, ortak bir 5-katlı çapraz doğrulama "
         "protokolü altında karşılaştırılmıştır. Yedi makine öğrenmesi modeli "
         "scikit-learn [29] kütüphanesi kullanılarak uygulanmıştır: Lojistik "
         "Regresyon, Rastgele Orman, Gradyan Artırma, SVM-RBF, Çok Katmanlı "
         "Algılayıcı (MLP), XGBoost [9] ve LightGBM [10]. Dört derin öğrenme "
         "mimarisi PyTorch ile uygulanmıştır: Derin MLP, 1B-ESA, Artık MLP ve "
         "Dikkat MLP. Modellerin hiperparametreleri Tablo 3'te verilmiştir.")

    table_caption(doc, "Tablo 3. Modellerin hiperparametreleri",
                  "Hyperparameters of the models")
    add_data_table(doc,
        ["Model", "Tip", "Temel Hiperparametreler"],
        [
            ["Lojistik Regresyon", "ML", "C=2,0; max_iter=2500; balanced"],
            ["Rastgele Orman", "ML", "n_estimators=500; max_features=log2"],
            ["Gradyan Artırma", "ML", "n_estimators=180; max_depth=4; lr=0,07"],
            ["SVM (RBF)", "ML", "C=10,0; gamma=0,05"],
            ["ÇKA Sinir Ağı", "ML", "128-64; relu; adam"],
            ["XGBoost", "ML", "n_estimators=400; lr=0,05"],
            ["LightGBM", "ML", "n_estimators=400; lr=0,05; num_leaves=31"],
            ["Derin MLP", "DL", "512-256-128-64; BatchNorm; Dropout"],
            ["1B-ESA", "DL", "Conv1D + max-pool"],
            ["Artık MLP", "DL", "3 blok; 256-256"],
            ["Dikkat MLP", "DL", "Öz-dikkat; 4 baş"],
        ])

    subheading(doc, "2.4. Eğitim protokolü ve eşik optimizasyonu "
                    "(Training protocol and threshold optimisation)")
    body(doc,
         "Tüm modeller stratifiye edilmiş 5-katlı çapraz doğrulama "
         "(random_state=42) ile değerlendirilmiştir. Her kat içinde "
         "StandardScaler eğitim alt kümesi üzerinde fit edilmiş; ardından "
         "doğrulama alt kümesi üzerinde transform uygulanmıştır. Karar eşiği θ, "
         "varsayılan 0,5 yerine Youden'in J istatistiği ile optimize edilmiştir: "
         "J(θ) = TPR(θ) - FPR(θ) (Eş. 1). LightGBM için Youden-optimal eşik "
         "θ* = 0,4316 olarak ölçülmüştür. Kalibrasyon Brier skoru ile "
         "değerlendirilmiştir (Eş. 2). Modelin yorumlanabilirliği TreeSHAP [11] "
         "algoritması kullanılarak analiz edilmiştir.")

    # ═══════════════════════ 3. SONUÇLAR VE TARTIŞMALAR ═══════════════════════
    heading(doc, "3. Sonuçlar ve Tartışmalar (Results and Discussions)")

    body(doc,
         "Tablo 4, on bir modelin 5-katlı çapraz doğrulama sonuçlarını ROC-AUC'a "
         "göre sıralı sunmaktadır. LightGBM modeli, %95,48 ortalama ROC-AUC "
         "değeri ile ilk sırada yer almakta; Derin MLP %95,42 ile çok yakın bir "
         "ikinci sıra elde etmektedir. 1B-ESA modeli %85,43 ile en düşük "
         "performansı sergilemiştir. Şekil 3, on bir modelin karşılaştırmasını "
         "göstermektedir.")

    table_caption(doc, "Tablo 4. 5-katlı çapraz doğrulama sonuçları",
                  "5-fold cross-validation results")
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

    figure(doc, "paper_model_comparison.png",
           "Şekil 3. On bir modelin performans karşılaştırması.",
           "Performance comparison of the eleven models.")
    figure(doc, "paper_roc_curves.png",
           "Şekil 4. Yedi ML modelinin ROC eğrileri.",
           "ROC curves of the seven ML models.")
    figure(doc, "all_models_heatmap.png",
           "Şekil 5. On bir model performans ısı haritası.",
           "Performance heatmap.")

    body(doc,
         "ML ve DL aileleri karşılaştırıldığında, yedi ML sınıflandırıcısı %92,75 "
         "ortalama ROC-AUC değerine ulaşırken dört DL mimarisi %92,32'de "
         "kalmaktadır. 1B-ESA dışlandığında, kalan üç DL mimarisi %94,62 ortalama "
         "elde etmektedir. Bu bulgu, 47 boyutlu öznitelik vektörünün ayırt edici "
         "bilginin büyük kısmını kodladığını göstermektedir. Şekil 6 ve Şekil 7, "
         "iki aileyi ve epok bazlı eğitim eğrilerini sunmaktadır.")

    figure(doc, "paper_ml_vs_dl.png",
           "Şekil 6. ML ve DL ailelerinin karşılaştırması.",
           "Comparison of ML and DL families.")
    figure(doc, "training_history.png",
           "Şekil 7. DL mimarileri için epok bazlı eğitim eğrileri.",
           "Per-epoch training curves.", width_cm=15.0)

    body(doc,
         "Katlar-arası kararlılık açısından LightGBM ±0,0023 standart sapma ile "
         "havuzdaki en kararlı modeldir; beş katı 0,9515 ile 0,9580 arasında dar "
         "bir aralıkta değişmektedir. XGBoost (±0,0029) ve Gradyan Artırma "
         "(±0,0038) onu izlemektedir. En değişken modeller 1B-ESA (±0,0087) ve "
         "SVM-RBF (±0,0075) olmuştur (Şekil 8).")

    figure(doc, "paper_fold_std_table.png",
           "Şekil 8. On bir modelin kat bazlı ROC-AUC değerleri.",
           "Per-fold ROC-AUC values.", width_cm=15.0)

    body(doc,
         "Öznitelik önemi analizi sonuçları, spektral düzlük standart sapması "
         "özniteliğinin yapay zekâ-insan ayrımı için en bilgilendirici öznitelik "
         "olduğunu açıkça ortaya koymuştur. Tablo 5, ilk on özniteliği "
         "listelemektedir. Şekil 9 ilk yirmi özniteliği, Şekil 10 ise TreeSHAP "
         "tabanlı global etki dağılımını sunmaktadır.")

    table_caption(doc, "Tablo 5. LightGBM'in ilk on özniteliği",
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

    figure(doc, "paper_feature_importance.png",
           "Şekil 9. İlk yirmi öznitelik önem skorları.",
           "Top-twenty feature importance scores.")
    figure(doc, "shap_summary.png",
           "Şekil 10. TreeSHAP global etki diyagramı.",
           "TreeSHAP global effect plot.")

    body(doc,
         "Şekil 11, LightGBM'in Youden-optimal eşik θ* = 0,4316 ile elde edilen "
         "karmaşıklık matrisini göstermektedir: 2.721 doğru negatif (%87,4), "
         "1.862 doğru pozitif (%89,4), 392 yanlış pozitif (%12,6) ve 220 yanlış "
         "negatif (%10,6). Şekil 12 P(AI) tahmin olasılık dağılımlarını, Şekil "
         "13 kalibrasyon eğrisini (Brier = 0,083), Şekil 14 ise kesinlik-"
         "duyarlılık eğrisini (ortalama kesinlik 0,934) sunmaktadır.")

    figure(doc, "paper_confusion_matrix_lightgbm.png",
           "Şekil 11. LightGBM karmaşıklık matrisi.",
           "LightGBM confusion matrix.")
    figure(doc, "paper_score_distribution.png",
           "Şekil 12. P(AI) tahmin olasılık dağılımı.",
           "P(AI) probability distribution.")
    figure(doc, "paper_calibration.png",
           "Şekil 13. Kalibrasyon eğrisi (Brier = 0,083).",
           "Calibration curve.")
    figure(doc, "paper_precision_recall.png",
           "Şekil 14. Kesinlik-duyarlılık eğrisi.",
           "Precision-recall curve.")

    body(doc,
         "Eşik taraması analizi (Şekil 15), F1 skorunun 0,40-0,50 aralığında bir "
         "plato oluşturduğunu ve Youden-optimal eşiğin bu platonun sol kenarında "
         "konumlandığını göstermektedir. Üretici bazlı performans (Şekil 16) "
         "Suno parçalarında %93,0 duyarlılık, Echoes'ta %88,6 elde edildiğini; "
         "buna karşın deepfake alt kümesinde performansın %50,0'da kaldığını "
         "ortaya koymaktadır. Bu durum üretici modeller arası genelleme zorluğunu "
         "doğrulamaktadır. Şekil 17 sınıf bazlı performansı sunmaktadır.")

    figure(doc, "threshold_sweep.png",
           "Şekil 15. Karar eşiği taraması.",
           "Decision-threshold sweep.")
    figure(doc, "per_source_performance.png",
           "Şekil 16. Kaynak bazlı performans.",
           "Per-source performance.")
    figure(doc, "per_class_metrics.png",
           "Şekil 17. Sınıf bazlı performans değerleri.",
           "Per-class performance values.")

    subheading(doc, "3.1. Tartışma (Discussion)")
    body(doc,
         "Spektral düzlüğün öznitelik önem sıralamasındaki baskın konumu, daha "
         "geniş ses derin sahte literatürüyle [6] tutarlı ve yorumlanabilir bir "
         "bulgudur. Spektral düzlük, bir sinyalin güç spektrumunun geometrik ve "
         "aritmetik ortalamaları arasındaki oranı ölçmektedir. Güncel GenAI "
         "üretim sistemleri, algısal kalite ölçütlerini optimize etme "
         "eğilimindedir ve bunun yan etkisi olarak insan kayıtlarınınkinden "
         "sistematik biçimde daha temiz spektrumlar ortaya çıkmaktadır.")

    body(doc,
         "1B-ESA modelinin diğer mimarilere kıyasla belirgin biçimde düşük "
         "performansı, mimari bir uyumsuzluğun sonucu olarak "
         "değerlendirilmektedir. Tek boyutlu evrişim, bir dizi boyunca yerel "
         "korelasyonları kullanmak üzere tasarlanmıştır; ancak önerilen sistemde "
         "giriş, sıralanmamış 47 boyutlu düz bir öznitelik vektörüdür.")

    body(doc,
         "Aşırı öğrenme tanılayıcı analizi (Şekil 18), tüm ağaç tabanlı modellerin "
         "eğitim ve çapraz doğrulama doğruluğu arasında belirgin bir fark "
         "sergilediğini göstermektedir. Rastgele Orman %100,0 eğitim doğruluğuna "
         "karşı çapraz doğrulama altında %86,1 doğruluk elde etmiştir. LightGBM "
         "ve SVM sırasıyla 12,0 ve 13,4 puanlık farklarla bu eğilimi takip "
         "etmektedir. Eğitim ve çapraz doğrulama doğruluklarının esasen örtüştüğü "
         "tek model, yalnızca 0,6 puanlık fark ile Lojistik Regresyon olmuştur.")

    figure(doc, "train_val_gap.png",
           "Şekil 18. Eğitim ve çapraz doğrulama doğruluk farkı.",
           "Train vs cross-validation accuracy gap.")

    body(doc,
         "Öznitelik fazlalığı açısından, 47 özniteliğin tasarım gereği fazlalıklı "
         "bir yapıya sahip olduğu tespit edilmiştir. Yirmi öznitelik çiftinin "
         "|Pearson r| değeri 0,85'in üzerinde ölçülmüştür (Şekil 19). Öznitelik "
         "çıkarma deneyi (Şekil 20), öznitelik sayısı N = 30'a ulaştığında "
         "doğruluğun plato yaptığını ortaya koymuş; sondaki 17 özniteliğin "
         "ölçülebilir bir ek doğruluk sağlamadığı görülmüştür.")

    figure(doc, "feature_correlation_heatmap.png",
           "Şekil 19. 47 öznitelik korelasyon ısı haritası.",
           "47-feature correlation heatmap.", width_cm=15.0)
    figure(doc, "feature_ablation_curve.png",
           "Şekil 20. Öznitelik sayısı vs doğruluk.",
           "Number of features vs accuracy.")

    subheading(doc, "3.2. Sınırlamalar (Limitations)")
    body(doc,
         "Önerilen sistemin sınırlamaları açık biçimde değerlendirildiğinde dört "
         "temel husus öne çıkmaktadır: (𝑖) öznitelikler 15-30 saniye uzunluğundaki "
         "tam ses kliplerinden çıkarılmakta olup daha kısa klipler için tempo ve "
         "vibrato istatistikleri daha az güvenilir olabilir; (𝑖𝑖) bazı türlerin "
         "GenAI tarafında aşırı temsil edildiği gözlemlenmiştir; (𝑖𝑖𝑖) düşmanca "
         "sağlamlık açıkça test edilmemiştir; (𝑖𝑣) eğitim ile çapraz doğrulama "
         "doğrulukları arasındaki fark, modelin dağılım kayışına karşı duyarlı "
         "olduğunu göstermektedir.")

    # ═══════════════════════ SONUÇLAR ═══════════════════════
    heading(doc, "Sonuçlar (Conclusions)")
    body(doc,
         "Bu çalışmada, GenAI tarafından üretilen müziği insan tarafından "
         "bestelenmiş kayıtlardan ayırt edebilmek için AURIS adlı uçtan-uca bir "
         "tespit sistemi önerilmiştir. Önerilen sistem; 47 boyutlu elle "
         "tasarlanmış bir akustik öznitelik vektörünü, on iki veya daha fazla "
         "GenAI üretim sisteminden derlenen 5.195 örnek üzerinde eğitilen on bir "
         "sınıflandırma modelinden oluşan bir topluluk ile birleştirmektedir. "
         "Elde edilen temel bulgular şu şekilde özetlenebilir: LightGBM modeli, "
         "%95,48 ortalama ROC-AUC değeri ve ±0,0023 standart sapma ile havuzdaki "
         "en başarılı modeli oluşturmuştur. Derin MLP %95,42 ile çok yakın bir "
         "ikinci sırayı almıştır. Spektral düzlük özniteliği yapay zekâ-insan "
         "ayrımı için en bilgilendirici tek öznitelik olarak öne çıkmıştır. "
         "Tanılayıcı analiz iki önemli sınırlamayı açık biçimde ortaya koymuştur: "
         "tüm ağaç tabanlı modeller eğitim ile çapraz doğrulama doğrulukları "
         "arasında 8-14 puanlık bir fark sergilemekte ve 47 özniteliğin sondaki "
         "yaklaşık on yedisi ölçülebilir bir ek doğruluk sağlamamaktadır.")

    body(doc,
         "Bu araştırma, GenAI tarafından üretilen müziklerin tespiti alanında "
         "derin öğrenme ve topluluk öğrenmesi tekniklerinin etkinliğini "
         "vurgulayarak, çok üreticili müzik tespiti alanında daha fazla ilerleme "
         "için umut verici yollar sunmaktadır. Gelecek çalışmalar kapsamında dört "
         "yön takip edilecektir: SONICS [23] ve FakeMusicCaps [24] gibi gelişmekte "
         "olan halka açık kıyaslamalar üzerinde resmi bir üretici-modeller arası "
         "tutulan değerlendirme gerçekleştirilecektir; ince ayar yapılmış wav2vec2 "
         "[13] modeli protokole entegre edilecektir; düşmanca sağlamlık açıkça "
         "değerlendirilecektir; veri kümesi on bin örneğe doğru "
         "genişletilecektir.")

    # ═══════════════════════ KAYNAKLAR ═══════════════════════
    heading(doc, "Kaynaklar (References)")
    refs = [
        "Copet J. vd., Simple and Controllable Music Generation, Advances in "
        "Neural Information Processing Systems, 36, 2023.",
        "Liu H. vd., AudioLDM: Text-to-Audio Generation with Latent Diffusion "
        "Models, Proceedings of the International Conference on Machine Learning "
        "(ICML 2023), 21450-21474, Honolulu, Hawaii, A.B.D., 23-29 Temmuz, 2023.",
        "Yi J. vd., ADD 2022: The First Audio Deep Synthesis Detection Challenge, "
        "Proceedings of the IEEE International Conference on Acoustics, Speech "
        "and Signal Processing (ICASSP 2022), 9216-9220, Singapur, 22-27 Mayıs, "
        "2022.",
        "Frank J., Schönherr L., WaveFake: A Data Set to Facilitate Audio "
        "Deepfake Detection, Advances in Neural Information Processing Systems "
        "Datasets and Benchmarks Track, 2021.",
        "Li Y., Milling M., Specia L., Schuller B.W., From Audio Deepfake "
        "Detection to AI-Generated Music Detection: A Pathway and Overview, arXiv "
        "preprint arXiv:2412.00571, 2024.",
        "Yi J. vd., Audio Deepfake Detection: A Survey, arXiv preprint "
        "arXiv:2308.14970, 2023.",
        "Afchar D., Meseguer Brocal G., Hennequin R., AI-Generated Music "
        "Detection and Its Challenges, Proceedings of the IEEE International "
        "Conference on Acoustics, Speech and Signal Processing (ICASSP 2025), "
        "Hyderabad, Hindistan, 6-11 Nisan, 2025.",
        "Kim Y., Go S., Segment Transformer: AI-Generated Music Detection via "
        "Music Structural Analysis, arXiv preprint arXiv:2509.08283, 2025.",
        "Chen T., Guestrin C., XGBoost: A Scalable Tree Boosting System, "
        "Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge "
        "Discovery and Data Mining (KDD '16), 785-794, San Francisco, CA, A.B.D., "
        "13-17 Ağustos, 2016.",
        "Ke G. vd., LightGBM: A Highly Efficient Gradient Boosting Decision Tree, "
        "Advances in Neural Information Processing Systems 30 (NIPS 2017), "
        "3149-3157, Long Beach, California, A.B.D., 4-9 Aralık, 2017.",
        "Lundberg S.M., Lee S.I., A Unified Approach to Interpreting Model "
        "Predictions, Advances in Neural Information Processing Systems 30 (NIPS "
        "2017), 4768-4777, Long Beach, California, A.B.D., 4-9 Aralık, 2017.",
        "Martín-Doñas J.M., Álvarez A., The Vicomtech Audio Deepfake Detection "
        "System Based on Wav2vec2 for the 2022 ADD Challenge, Proceedings of the "
        "IEEE International Conference on Acoustics, Speech and Signal "
        "Processing (ICASSP 2022), 9266-9270, Singapur, 22-27 Mayıs, 2022.",
        "Baevski A., Zhou Y., Mohamed A., Auli M., wav2vec 2.0: A Framework for "
        "Self-Supervised Learning of Speech Representations, Advances in Neural "
        "Information Processing Systems, 33, 12449-12460, 2020.",
        "Elizalde B., Deshmukh S., Al Ismail M., Wang H., CLAP: Learning Audio "
        "Concepts from Natural Language Supervision, Proceedings of the IEEE "
        "International Conference on Acoustics, Speech and Signal Processing "
        "(ICASSP 2023), 1-5, Rhodes, Yunanistan, 4-10 Haziran, 2023.",
        "Wu Y. vd., Large-Scale Contrastive Language-Audio Pretraining with "
        "Feature Fusion and Keyword-to-Caption Augmentation, Proceedings of the "
        "IEEE International Conference on Acoustics, Speech and Signal "
        "Processing (ICASSP 2023), 1-5, Rhodes, Yunanistan, 4-10 Haziran, 2023.",
        "Liu Y., Yin Y., Zhu Q., Cui W., Musical Instrument Recognition by "
        "XGBoost Combining Feature Fusion, arXiv preprint arXiv:2206.00901, 2022.",
        "Gan R., Huang T., Shao J., Wang F., Music Genre Classification Based on "
        "VMD-IWOA-XGBoost, Mathematics, 12 (10), 1549, 2024.",
        "Hızlısoy S., Tüfekci Z., Derin Öğrenme İle Türkçe Müziklerden Müzik "
        "Türü Sınıflandırması, Avrupa Bilim ve Teknoloji Dergisi, 24, 176-183, "
        "2021.",
        "Özbalcı M.C., Şahin H., Bilgin T.T., Classification of Music Genres of "
        "GTZAN Dataset with Machine Learning Methods, Mühendislik Bilimleri ve "
        "Araştırmaları Dergisi, 6 (1), 2024.",
        "Turan A.K., Polat H., Yarı Denetimli Makine Öğrenmesi Yöntemini "
        "Kullanarak Müzik Türlerinin Tespiti, Gazi Üniversitesi Fen Bilimleri "
        "Dergisi Part C: Tasarım ve Teknoloji, 12 (1), 92-107, 2024.",
        "Kostrzewa D., Mazur W., Brzeski R., Wide Ensembles of Neural Networks "
        "in Music Genre Classification, Computational Science -- ICCS 2022, "
        "Lecture Notes in Computer Science, vol. 13351, 91-102, Springer, 2022.",
        "Gourisaria M.K., Agrawal R., Sahni M., Comparative Analysis of Audio "
        "Classification with MFCC and STFT Features Using Machine Learning "
        "Techniques, Discover Internet of Things, 4 (1), 1, 2024.",
        "Rahman M.A., Hakim Z.I.A., Sarker N.H., Paul B., Fattah S.A., SONICS: "
        "Synthetic Or Not -- Identifying Counterfeit Songs, Proceedings of the "
        "International Conference on Learning Representations (ICLR 2025), "
        "Singapur, 24-28 Nisan, 2025.",
        "Comanducci L., Bestagini P., Tubaro S., FakeMusicCaps: A Dataset for "
        "Detection and Attribution of Synthetic Music Generated via "
        "Text-to-Music Models, arXiv preprint arXiv:2409.10684, 2024.",
        "Pascu O., Oneata D., Cucu H., Müller N.M., Echoes: A Semantically-"
        "Aligned Music Deepfake Detection Dataset, arXiv preprint arXiv:2603."
        "23667, 2025.",
        "Sunday N., Detecting Musical Deepfakes, arXiv preprint arXiv:2505."
        "09633, 2025.",
        "Sroka T., Wężowicz T., Sidorczuk D., Modrzejewski M., Evaluating Fake "
        "Music Detection Performance Under Audio Augmentations, arXiv preprint "
        "arXiv:2507.10447, 2025.",
        "McFee B. vd., librosa: Audio and Music Signal Analysis in Python, "
        "Proceedings of the 14th Python in Science Conference (SciPy 2015), "
        "18-24, Austin, Texas, A.B.D., 6-12 Temmuz, 2015.",
        "Pedregosa F. vd., Scikit-learn: Machine Learning in Python, Journal of "
        "Machine Learning Research, 12, 2825-2830, 2011.",
        "Kingma D.P., Ba J., Adam: A Method for Stochastic Optimization, "
        "Proceedings of the 3rd International Conference on Learning "
        "Representations (ICLR 2015), 1-15, San Diego, California, A.B.D., 7-9 "
        "Mayıs, 2015.",
    ]
    for i, ref in enumerate(refs, start=1):
        add_ref(doc, i, ref)

    try:
        doc.save(str(OUT))
        target = OUT
    except PermissionError:
        target = OUT.parent / "AURIS_Makale_Metni_v2.docx"
        doc.save(str(target))
    print(f"Saved: {target} ({target.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    build()
