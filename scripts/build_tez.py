# -*- coding: utf-8 -*-
"""
BM498 Mezuniyet Tezi - Sablon Tabanli Yaklasim
AURIS: Akustik Oznitelik Tabanli Yapay Zeka Uretimi Muzik Tespiti
Hasan Arthur Altuntas - 221001047 - Duzce Universitesi

Bu script sablonu kopyalar ve sablondaki yer tutuculari tez icerigi ile doldurur.
Sablonun sayfa yapisi, header/footer, on sayfalar korunur.
"""
import copy
import os
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from lxml import etree

TEMPLATE = "docs/academic/TeslimEdilecekler/tezşablonu.docx"
OUT = "docs/academic/TeslimEdilecekler/1.TEZ-RAPOR/BM498_Mezuniyet_Tezi_Hasan_Arthur_Altuntas.docx"


# ── Yardimci fonksiyonlar ────────────────────────────────────────────────────

def set_para_text(para, text, bold=False, font_size=None):
    """Mevcut paragrafin tum run'larini temizleyip yeni metin ekler."""
    for run in para.runs:
        run.text = ''
    # XML'deki tum r elementlerini sil
    for r in para._element.findall(qn('w:r')):
        para._element.remove(r)
    run = para.add_run(text)
    if bold:
        run.bold = True
    if font_size:
        run.font.size = Pt(font_size)
    return run


def clear_para(para):
    """Paragrafin icerigi tamamen siler (bos birakir)."""
    for r in para._element.findall(qn('w:r')):
        para._element.remove(r)


def insert_para_after(ref_para, text='', style_name=None):
    """ref_para'nin hemen ardindan yeni paragraf ekler."""
    doc = ref_para._element.getparent()
    new_p = copy.deepcopy(ref_para._element)
    # Mevcut run'lari temizle
    for r in new_p.findall(qn('w:r')):
        new_p.remove(r)
    ref_para._element.addnext(new_p)

    from docx.text.paragraph import Paragraph
    new_para = Paragraph(new_p, ref_para._p.getparent())

    if style_name:
        new_para.style = ref_para._element.getparent().getparent().styles[style_name]
    if text:
        new_para.add_run(text)
    return new_para


def add_paragraphs_after(anchor_para, items):
    """
    anchor_para'dan sonra items listesini sirali ekler.
    items: list of (text, style_name) tuples
    """
    doc_element = anchor_para._element.getparent()
    insert_after = anchor_para._element
    for (text, style_name) in items:
        from docx.oxml import OxmlElement
        new_p = OxmlElement('w:p')
        pPr = OxmlElement('w:pPr')
        pStyle = OxmlElement('w:pStyle')
        pStyle.set(qn('w:val'), style_name)
        pPr.append(pStyle)
        new_p.append(pPr)
        if text:
            r = OxmlElement('w:r')
            t = OxmlElement('w:t')
            t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
            t.text = text
            r.append(t)
            new_p.append(r)
        insert_after.addnext(new_p)
        insert_after = new_p
    return insert_after


def style_val(style_name):
    """Style adi'ni Word XML style ID'sine donusturur (bosluklar kaldirilir)."""
    return style_name.replace(' ', '')


def make_para_xml(text, style_id):
    from docx.oxml import OxmlElement
    new_p = OxmlElement('w:p')
    pPr = OxmlElement('w:pPr')
    pStyle = OxmlElement('w:pStyle')
    pStyle.set(qn('w:val'), style_id)
    pPr.append(pStyle)
    new_p.append(pPr)
    if text:
        r = OxmlElement('w:r')
        t = OxmlElement('w:t')
        t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
        t.text = text
        r.append(t)
        new_p.append(r)
    return new_p


def find_para_index(doc, text_contains):
    """Belirtilen metni iceren ilk paragrafin indeksini dondurur."""
    for i, p in enumerate(doc.paragraphs):
        if text_contains in p.text:
            return i
    return -1


def find_para_by_style_and_text(doc, style_name, text_contains, start=0):
    for i, p in enumerate(doc.paragraphs[start:], start):
        if p.style.name == style_name and text_contains in p.text:
            return i, p
    return -1, None


def delete_paragraphs_range(doc, start_idx, end_idx):
    """start_idx'den end_idx'e kadar (dahil) paragrafları sil."""
    paras = doc.paragraphs
    for i in range(min(end_idx, len(paras)-1), start_idx-1, -1):
        p = paras[i]
        p._element.getparent().remove(p._element)


def replace_section_content(doc, section_heading_text, new_content_items, heading_style='Heading 1'):
    """
    Verilen heading metnini bulup altindaki eski icerigi siler,
    yerine new_content_items ekler.
    new_content_items: list of (text, style_name)
    """
    paras = doc.paragraphs
    start_idx = -1
    end_idx = -1

    for i, p in enumerate(paras):
        if p.style.name == heading_style and section_heading_text in p.text:
            start_idx = i
            break

    if start_idx == -1:
        print(f"  [WARN] Heading bulunamadi: {section_heading_text!r}")
        return

    # Sonraki Heading 1 veya sayfa sonu'nu bul
    for i in range(start_idx + 1, len(paras)):
        p = paras[i]
        if p.style.name == 'Heading 1':
            end_idx = i - 1
            break
        xml = p._element.xml
        if 'pageBreak' in xml or ('sectPr' in xml and i > start_idx + 1):
            end_idx = i
            break

    if end_idx == -1:
        end_idx = len(paras) - 1

    # start+1'den end_idx'e kadar sil (heading'i koru)
    heading_para = paras[start_idx]
    remove_count = end_idx - start_idx
    for _ in range(remove_count):
        # heading'den sonraki paragraf her seferinde yeniden alınır
        next_para = heading_para._element.getnext()
        if next_para is not None and next_para.tag.endswith('}p'):
            next_para.getparent().remove(next_para)

    # Yeni icerigi ekle
    insert_after = heading_para._element
    from docx.oxml import OxmlElement
    for (text, style_name) in new_content_items:
        # Style ID'yi bul
        try:
            style_id = doc.styles[style_name].style_id
        except KeyError:
            style_id = style_name

        new_p = make_para_xml(text, style_id)
        insert_after.addnext(new_p)
        insert_after = new_p


# ── Tablo olusturma ─────────────────────────────────────────────────────────

def make_table(doc, headers, rows, insert_after_para, col_widths=None):
    """Belge'ye insert_after_para'dan sonra tablo ekler."""
    from docx.oxml import OxmlElement

    tbl = doc.add_table(rows=1 + len(rows), cols=len(headers))
    tbl.style = 'Table Grid'
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER

    # Baslik satiri
    for j, h in enumerate(headers):
        cell = tbl.rows[0].cells[j]
        cell.text = h
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        for run in cell.paragraphs[0].runs:
            run.bold = True

    # Veri satirlari
    for ri, row_data in enumerate(rows):
        for ci, val in enumerate(row_data):
            cell = tbl.rows[ri+1].cells[ci]
            cell.text = str(val)
            cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Genislikler
    if col_widths:
        for row in tbl.rows:
            for j, cell in enumerate(row.cells):
                if j < len(col_widths):
                    cell.width = Cm(col_widths[j])

    # Tabloyu insert_after_para'dan sonra tasi
    tbl_element = tbl._tbl
    # Once belgenin body'sinden kaldir (add_table sona ekler)
    body = doc.element.body
    body.remove(tbl_element)
    # insert_after_para'dan sonra ekle
    insert_after_para.addnext(tbl_element)

    return tbl_element


# ════════════════════════════════════════════════════════════════════════════
# ANA BUILD FONKSIYONU
# ════════════════════════════════════════════════════════════════════════════

def build():
    doc = Document(TEMPLATE)
    paras = doc.paragraphs

    print("  [1] Kapak sayfasi guncelleniyor...")
    # ── Kapak sayfasi ────────────────────────────────────────────────────────
    # Akademik yil
    for p in paras:
        if '202X-202X' in p.text:
            set_para_text(p, '2025-2026 AKADEMİK YILI', bold=True)
        elif 'GÜZ/BAHAR DÖNEMİ' in p.text or 'G\xdcZ/BAHAR' in p.text:
            set_para_text(p, 'BAHAR DÖNEMİ', bold=True)
        elif 'BM401 BİLGİSAYAR' in p.text or 'BM401 BİLGISAYAR' in p.text:
            set_para_text(p,
                'BM498 MEZUNİYET TEZİ', bold=True)
        elif 'Unvan. Ad SOYAD' in p.text:
            set_para_text(p, 'Dr. Öğr. Üyesi Büşra TAKGİL', bold=False)
        elif 'MEZUNİYET TEZİ/PROJE/ÖDEV BAŞLIĞI' in p.text or 'MEZUNİYET TEZİ/PROJE' in p.text:
            set_para_text(p,
                'AURIS: AKUSTİK ÖZNİTELİK TABANLI YAPAY ZEKÂ ÜRETİMİ MÜZİĞİN TESPİTİ '
                'İÇİN ÇOK MODELLİ TOPLULUK SİSTEMİ',
                bold=True)
        elif 'Ad SOYAD' in p.text and 'Unvan' not in p.text and 'Danışman' not in p.text and 'danışman' not in p.text:
            set_para_text(p, 'Hasan Arthur ALTUNTAŞ', bold=True)
        elif '1111111111111' in p.text:
            set_para_text(p, '221001047')
        elif '03 Nisan 2026' in p.text and p.style.name == 'Normal' and len(p.text) < 20:
            # Tarih guncelle - sadece kisa olanlar (imzali sayfalar icin)
            pass

    # Imzali sayfalar
    for p in paras:
        if '(Öğrencinin Adı Soyadı)' in p.text or '(\xd6ğrencinin Adı Soyadı)' in p.text:
            set_para_text(p, 'Hasan Arthur ALTUNTAŞ')
        elif 'Adı Soyadı' in p.text and '03 Nisan' in p.text:
            set_para_text(p, '06 Haziran 2026\t\t\t\t\t\t\tHasan Arthur ALTUNTAŞ')

    # TESEKKUR bolumu
    for p in paras:
        if 'değerli katk' in p.text and 'danışmanım' in p.text:
            set_para_text(p,
                'Bu tez çalışmasının her aşamasında değerli yönlendirmeleri, '
                'sabrı ve akademik rehberliğiyle süreci şekillendiren '
                'danışman hocam Dr. Öğr. Üyesi Büşra TAKGİL\'e '
                'sonsuz teşekkürlerimi sunarım.')
        elif 'eş danışmanım Prof. Dr.' in p.text:
            clear_para(p)
        elif 'sevgili aileme ve çalışma arkadaşlarıma' in p.text or 'sevgili aileme' in p.text:
            set_para_text(p,
                'Tez süreci boyunca gösterdikleri anlayış ve destekten dolayı '
                'aileme ve tüm arkadaşlarıma teşekkür ederim.')
        elif 'BAP-XXX-WWW' in p.text:
            clear_para(p)

    print("  [2] OZET bolumu dolduruluyor...")
    # ── OZET bolumu (paragraflar 204-212) ──────────────────────────────────
    # 204: 'Başlık 1 Şekil' / OZET  → koru
    # 205: 'Normal' 'BURAYA TEZ BASLIGI' → biz degistiririz
    # 206-212: diger alanlar

    ozet_metinleri = [
        ('AURIS: AKUSTİK ÖZNİTELİK TABANLI YAPAY ZEKÂ ÜRETİMİ MÜZİĞİN TESPİTİ İÇİN ÇOK MODELLİ TOPLULUK SİSTEMİ', True),
        ('Hasan Arthur ALTUNTAŞ', False),
        ('Düzce Üniversitesi', False),
        ('Mühendislik Fakültesi, Bilgisayar Mühendisliği Bitirme Tezi', False),
        ('Danışman: Dr. Öğr. Üyesi Büşra TAKGİL', False),
        ('Haziran 2026, 110 sayfa', False),
    ]
    ozet_paragraf = [
        'Suno, MusicGen, Udio ve Echoes gibi üretici yapay zekâ platformlarının yaygınlaşmasıyla '
        'birlikte, yapay zekâ tarafından üretilen müzik parçaları içerik akış platformlarında hızla '
        'artmaktadır. Bu gelişme; telif hakkı ihlalleri, sanatçı gelirlerinin adaletsiz dağılımı ve '
        'müzik yarışmalarında etik sorunlar gibi ciddi toplumsal sonuçlar doğurmaktadır.',

        'Bu tez çalışmasında AURIS (Acoustic Understanding and Recognition Intelligence System) sistemi '
        'tasarlanmış ve geliştirilmiştir. AURIS, ses sinyallerinden librosa kütüphanesi aracılığıyla '
        '5 kategoride (spektral, zamansal, ritmik, harmonik, vokal) toplam 47 akustik öznitelik çıkarmakta; '
        'bu öznitelik vektörü üzerinde 7 klasik makine öğrenmesi ve 4 derin öğrenme modelini '
        '5 katlı tabakalı çapraz doğrulama protokolüyle karşılaştırmaktadır.',

        '8 farklı kaynaktan derlenen 5.195 ses kaydından oluşan veri kümesi (3.113 insan, %59,9; '
        '2.082 yapay zekâ, %40,1) üzerinde eğitilen LightGBM modeli; 0,8839 doğruluk, 0,8575 F1-skoru '
        've 0,9548 ROC-AUC (±0,0023, Brier skoru: 0,083) değerine ulaşmıştır. Karar eşiği Youden J '
        'istatistiğiyle θ* = 0,4316 olarak optimize edilmiştir. Öznitelik önemi analizinde spektral '
        'düzlük standart sapması (spectral_flatness_std, 0,0619) en güçlü ayrımcı öznitelik olarak '
        'belirlenmiştir.',

        'Sistem; Next.js 14/TypeScript web platformu, Kotlin/Jetpack Compose Android uygulaması ve '
        'Python FastAPI arka ucundan oluşan tam yığın bir mimaride kullanıma sunulmuştur. '
        'SHAP entegrasyonu her sınıflandırma kararını öznitelik bazında açıklanabilir kılmaktadır.',
    ]
    ozet_kw = 'Anahtar Kelimeler: Yapay zekâ müzik tespiti, akustik öznitelik mühendisliği, LightGBM, topluluk öğrenmesi, SHAP açıklanabilirliği, derin öğrenme, müzik bilgi işleme, ses sınıflandırma.'

    abstract_metinleri = [
        ('AURIS: A MULTI-MODEL ENSEMBLE SYSTEM FOR AI-GENERATED MUSIC DETECTION USING ACOUSTIC FEATURES', True),
        ('Hasan Arthur ALTUNTAŞ', False),
        ('Düzce University', False),
        ('Faculty of Engineering, Department of Computer Engineering, Undergraduate Thesis', False),
        ('Supervisor: Asst. Prof. Dr. Büşra TAKGİL', False),
        ('June 2026, 110 pages', False),
    ]
    abstract_paragraf = [
        'The rapid proliferation of generative AI platforms such as Suno, MusicGen, Udio, and Echoes '
        'has led to a dramatic increase in AI-generated music on content streaming platforms, raising '
        'serious concerns regarding copyright infringement, unfair distribution of artist revenues, '
        'and ethical issues in music competitions.',

        'This thesis presents AURIS (Acoustic Understanding and Recognition Intelligence System), '
        'which extracts 47 acoustic features across five categories (spectral, temporal, rhythmic, '
        'harmonic, vocal) using the librosa library, and evaluates eleven classification models — '
        'seven classical machine learning and four deep learning architectures — under a 5-fold '
        'stratified cross-validation protocol.',

        'Trained on a real-world dataset of 5,195 audio samples from 8 diverse sources (3,113 human, '
        '59.9%; 2,082 AI, 40.1%), the best-performing LightGBM model achieves 0.9548 ROC-AUC (±0.0023), '
        '88.39% accuracy, 0.8575 F1-score, and Brier score of 0.083. The decision threshold is '
        'optimized to θ* = 0.4316 via Youden\'s J statistic. Spectral flatness standard deviation '
        '(spectral_flatness_std, importance: 0.0619) emerges as the most discriminative feature.',

        'The complete system is deployed as a full-stack architecture (Next.js 14 web platform, '
        'Kotlin/Jetpack Compose Android application, FastAPI backend). SHAP integration provides '
        'feature-level explanations for every classification decision.',
    ]
    abstract_kw = 'Keywords: AI music detection, acoustic feature engineering, LightGBM, ensemble learning, SHAP explainability, deep learning, music information retrieval, audio classification.'

    # OZET paragraflarini bul ve guncelle
    for i, p in enumerate(doc.paragraphs):
        if p.text.strip() == 'BURAYA TEZ BAŞLIĞI YAZILMALIDIR' or 'BURAYA TEZ BA' in p.text:
            set_para_text(p, ozet_metinleri[0][0], bold=True)
        elif p.text.strip() == 'Öğrenci ADI' or 'renci AD' in p.text:
            set_para_text(p, ozet_metinleri[1][0])
        elif p.text.strip() == 'Düzce Üniversitesi' and doc.paragraphs[i-1].text in ['Öğrenci ADI', 'Hasan Arthur ALTUNTAŞ']:
            set_para_text(p, ozet_metinleri[2][0])
        elif 'Bitirme Tezi' in p.text and 'Bilgisayar Mühendisliği' in p.text:
            set_para_text(p, ozet_metinleri[3][0])
        elif 'Danışman: Do' in p.text and 'Altun' in p.text:
            set_para_text(p, ozet_metinleri[4][0])
        elif 'Eylül 2019' in p.text:
            set_para_text(p, ozet_metinleri[5][0])
        elif 'Buraya tezin özeti bir paragraf' in p.text or 'zeti bir paragraf' in p.text:
            # Ozet metni - birden fazla paragraf gerekiyor
            # Ilk ozet paragrafini yaz
            set_para_text(p, ozet_paragraf[0])
            # Sonraki ozet satirlarini ekle
            insert_after = p._element
            from docx.oxml import OxmlElement
            try:
                style_id = doc.styles['PARAGRAF METNİ'].style_id
            except:
                style_id = 'PARAGRAFMETN'
            for op in ozet_paragraf[1:]:
                new_p = make_para_xml(op, style_id)
                insert_after.addnext(new_p)
                insert_after = new_p
            # Anahtar kelimeler
            kw_p = make_para_xml(ozet_kw, style_id)
            insert_after.addnext(kw_p)

        elif 'Anahtar sözcükler: Anahtar sözcük bir' in p.text or 'Anahtar s' in p.text and 'zc' in p.text:
            clear_para(p)

        elif 'BURAYA TEZ BAŞLIĞI İNGİLİZCE' in p.text or 'BURAYA TEZ BA' in p.text and 'NG' in p.text:
            set_para_text(p, abstract_metinleri[0][0], bold=True)
        elif 'Student Name SURNAME' in p.text:
            set_para_text(p, abstract_metinleri[1][0])
        elif 'Düzce University' in p.text:
            set_para_text(p, abstract_metinleri[2][0])
        elif 'Faculty of Engineering, Computer Engineering' in p.text:
            set_para_text(p, abstract_metinleri[3][0])
        elif 'Supervisor: Assoc. Prof. Dr. Yusuf ALTUN' in p.text:
            set_para_text(p, abstract_metinleri[4][0])
        elif 'September 2019' in p.text:
            set_para_text(p, abstract_metinleri[5][0])
        elif 'Buraya tezin İngilizce özeti' in p.text or 'ngilizce' in p.text and 'zeti' in p.text:
            set_para_text(p, abstract_paragraf[0])
            insert_after = p._element
            try:
                style_id = doc.styles['PARAGRAF METNİ'].style_id
            except:
                style_id = 'PARAGRAFMETN'
            for ap in abstract_paragraf[1:]:
                new_p = make_para_xml(ap, style_id)
                insert_after.addnext(new_p)
                insert_after = new_p
            kw_p = make_para_xml(abstract_kw, style_id)
            insert_after.addnext(kw_p)
        elif 'Keywords: Keyword one' in p.text:
            clear_para(p)

    print("  [3] GiRiS bolumu dolduruluyor...")
    # ── GiRiS bolumu ────────────────────────────────────────────────────────
    giris_content = [
        ('1.1. Problemin Tanımı ve Araştırmanın Motivasyonu', 'Heading 2'),
        ('Suno, MusicGen, Udio ve Echoes gibi üretici yapay zekâ platformlarının son yıllarda gösterdiği '
         'hızlı ilerleme, müzik üretim alanını köklü biçimde dönüştürmüştür. Bu platformlar, müzik teorisi '
         'bilgisi olmayan bir kullanıcının dakikalar içinde yüksek kaliteli müzik üretmesine olanak tanımaktadır. '
         'Özellikle Meta tarafından geliştirilen açık kaynak model MusicGen (Copet vd., 2023), Liu vd. tarafından '
         'geliştirilen AudioLDM2 (2023) ve ticari platformlar olan Suno ile Udio, yapay zekâ müziğini '
         'geniş kitlelere yaymıştır.', 'PARAGRAF METNİ'),
        ('Bu teknolojik dönüşüm beraberinde ciddi etik, hukuki ve ekonomik sorunları getirmektedir. '
         'Birincisi, yapay zekâ üretimi parçaların insan eserleriyle karışarak streaming platformlarına '
         'yüklenmesi telif hakkı ihlallerine zemin hazırlamaktadır. İkincisi, algoritmik öneri sistemleri '
         'yapay zekâ üretimi içerikleri insanmış gibi göstererek insan sanatçıların gelirlerini olumsuz '
         'etkileyebilmektedir. Üçüncüsü, müzik yarışmaları ve burs değerlendirme süreçlerinde yapay zekâ '
         'üretimi eserlerin insan yaratıcılığı olarak sunulması ciddi etik ihlaller doğurmaktadır [1].', 'PARAGRAF METNİ'),
        ('Yapay zekâ üretimi ses tespiti alanında mevcut araştırmaların büyük bölümü konuşma sentezi ve '
         'ses derin sahteciliğine odaklanmış; müziğe özgü tespit sistemleri görece az ilgi görmüştür. '
         'Liu vd. (2024), bu alanı "gelişmekte olan" olarak nitelendirmekte ve mevcut yaklaşımların büyük '
         'çoğunluğunun tek bir üretici sisteme özgü olduğunu vurgulamaktadır [15]. '
         'Bhatt vd. (2025) ise çapraz-üretici genellemenin alanın temel açık problemi olduğunu '
         'ortaya koymaktadır [3]. AURIS bu boşluğu kapatmak amacıyla tasarlanmıştır.', 'PARAGRAF METNİ'),
        ('1.2. Araştırmanın Amaç ve Kapsamı', 'Heading 2'),
        ('Bu çalışmanın temel araştırma sorusu şöyledir: "Spektral, zamansal, ritmik, harmonik ve vokal '
         'boyutları kapsayan el ile tasarlanmış akustik öznitelikler, gradient boosting topluluğuyla '
         'birleştirildiğinde, uçtan uca derin öğrenme yaklaşımlarıyla rekabet edebilir bir yapay zekâ '
         'müziği tespit performansı sağlayabilir mi?"', 'PARAGRAF METNİ'),
        ('Bu soruyu yanıtlamak için aşağıdaki hedefler belirlenmiştir: (1) 5 kategoride 47 öznitelikten '
         'oluşan kapsamlı ve yorumlanabilir bir akustik öznitelik vektörü tasarlamak; (2) 8 kaynaktan '
         'derlenen 5.195 örnekli gerçek dünya veri kümesi oluşturmak; (3) 7 klasik ML ve 4 derin öğrenme '
         'modelini aynı protokolle karşılaştırmak; (4) Youden J istatistiğiyle optimize edilmiş karar eşiği '
         'belirlemek; (5) SHAP entegrasyonuyla her kararı öznitelik bazında açıklanabilir kılmak; '
         '(6) Sistemi web, Android ve API katmanlarıyla üretim ortamına taşımak.', 'PARAGRAF METNİ'),
        ('1.3. BM401-BM498 İki Dönemlik Süreç', 'Heading 2'),
        ('Bu proje iki akademik dönemde geliştirilmiştir. BM401 (2024-2025 Güz Dönemi) aşamasında wav2vec2 '
         'tabanlı hibrit bir yaklaşım tasarlanmış, Next.js 14 web platformu ve Kotlin Android uygulaması '
         'prototip düzeyinde geliştirilmiştir. BM498 (2024-2025 Bahar Dönemi) aşamasında ise araştırma '
         'odağı köklü biçimde değişmiştir: wav2vec2 embedding\'lerinin yorumlanamaz yapısı yerine el ile '
         'tasarlanmış 47 boyutlu akustik öznitelik vektörüne geçilmiş, veri kümesi 5.195 örneğe '
         'genişletilmiş ve SHAP açıklanabilirlik katmanı eklenmiştir.', 'PARAGRAF METNİ'),
        ('1.4. Tez Organizasyonu', 'Heading 2'),
        ('Bölüm 2\'de yapay zekâ müzik üretimi, ses derin sahteciliği tespiti ve mevcut sistemler '
         'ele alınmaktadır. Bölüm 3\'te veri kümesi, öznitelik mühendisliği, model mimarileri ve '
         'eğitim protokolü ayrıntılı biçimde açıklanmaktadır. Bölüm 4\'te deneysel bulgular '
         'sunulmaktadır. Bölüm 5\'te bulgular tartışılmakta, Bölüm 6\'da sonuçlar ve '
         'gelecek çalışma önerileri yer almaktadır.', 'PARAGRAF METNİ'),
    ]

    # GiRiS basligini bul
    giris_idx, giris_para = find_para_by_style_and_text(doc, 'Heading 1', 'GİRİŞ')
    if giris_idx == -1:
        giris_idx, giris_para = find_para_by_style_and_text(doc, 'Heading 1', 'GİRİŞ')
    if giris_idx == -1:
        giris_idx, giris_para = find_para_by_style_and_text(doc, 'Heading 1', 'GiRiS')

    if giris_para:
        # Simdiki GiRiS icerigi sil ve yeni icerik ekle
        insert_after = giris_para._element
        # Sonraki heading'e kadar sil
        next_elem = insert_after.getnext()
        while next_elem is not None:
            tag = next_elem.tag.split('}')[-1]
            if tag == 'p':
                temp_p_style = ''
                pStyle = next_elem.find('.//' + qn('w:pStyle'))
                if pStyle is not None:
                    temp_p_style = pStyle.get(qn('w:val'), '')
                # Heading 1 bulduk mu?
                if 'Heading1' in temp_p_style or temp_p_style == 'Heading1':
                    break
                # Sonraki elementi al
                next_next = next_elem.getnext()
                next_elem.getparent().remove(next_elem)
                next_elem = next_next
            else:
                break

        # Yeni icerigi ekle
        from docx.oxml import OxmlElement
        for (text, style_name) in giris_content:
            try:
                style_id = doc.styles[style_name].style_id
            except:
                style_id = style_name.replace(' ', '')
            new_p = make_para_xml(text, style_id)
            insert_after.addnext(new_p)
            insert_after = new_p

    print("  [4] Sablon Bolum 2 (MATERYAL VE YONTEM) yerine LiTERATUR yaziliyor...")
    # ── LITERATUR bolumu ─────────────────────────────────────────────────────
    literatur_content = [
        ('2.1. Yapay Zekâ Müzik Üretim Sistemleri', 'Heading 2'),
        ('Müzik üretiminde yapay zekâ kullanımı son yıllarda üç ana paradigma etrafında şekillenmiştir: '
         'otoregresif modeller, difüzyon modelleri ve transformer tabanlı metin-müzik dönüşümü. '
         'Dhariwal vd. (2020) tarafından geliştirilen Jukebox, ham ses formunda doğrudan waveform '
         'üreten ilk büyük ölçekli modeldir [6]. Hiyerarşik VQ-VAE mimarisi ile farklı zaman '
         'ölçeklerinde müzikal yapıyı öğrenen Jukebox, 1,2 milyar parametresiyle dönemin '
         'en büyük müzik modeli unvanını taşımıştır.', 'PARAGRAF METNİ'),
        ('Meta AI tarafından geliştirilen MusicGen (Copet vd., 2023), metin ve melodi koşullandırmalı, '
         'yüksek kaliteli müzik üretebilen decoder-only transformer mimarisidir [5]. Model, '
         'EnCodec ses kodlayıcısı üzerine inşa edilmiş ve 300M, 1,5B ve 3,3B parametre '
         'ölçeklerinde açık kaynak lisansıyla yayımlanmıştır. Difüzyon tabanlı yaklaşımlar arasında '
         'AudioLDM (Liu vd., 2023), latent difüzyon modellerini ses üretimine uyarlamıştır [14]. '
         'CLAP gösterimleriyle koşullandırılan model, metin girdisiyle yüksek kaliteli '
         'ses sentezi yapabilmektedir.', 'PARAGRAF METNİ'),
        ('2.2. Ses Derin Sahteciliği Tespiti', 'Heading 2'),
        ('Yapay zekâ üretimi ses tespitine ilişkin sistematik araştırma, ilk olarak konuşma sentezi '
         've ses derin sahteciliği alanında başlamıştır. WaveFake veri kümesi (Frank ve Schönherr, 2021), '
         'yedi farklı vocoder mimarisinin çıktılarını barındıran temel bir kıyaslama noktası '
         'oluşturmuştur [8]. Bu çalışma, mel-spektrogram özniteliklerinin hafif sınıflandırıcılarla '
         'kombinasyonunun bilinen vocoderlar üzerinde yüksek tespit oranlarına ulaşabildiğini, '
         'ancak görülmemiş mimarilere genellemede ciddi performans düşüşü yaşandığını ortaya '
         'koymuştur.', 'PARAGRAF METNİ'),
        ('ADD 2022 Yarışması (Yi vd., 2022), ses derin sahteciliği tespiti alanında üç farklı zorluğu '
         'kapsamıştır: düşük kaliteli sahte sesler, kısmen sahte sesler ve çevresel gürültülü koşullar [23]. '
         'Yi vd. (2023), 2008-2023 yılları arasında yayımlanan ses derin sahteciliği tespit araştırmalarını '
         'kapsamlı biçimde incelemiş; MFCC, LFCC, CQT ve mel-spektrogram tabanlı özniteliklerin farklı '
         'derin öğrenme sınıflandırıcılarla kombinasyonlarını 17 veri kümesi üzerinde karşılaştırmıştır [24].', 'PARAGRAF METNİ'),
        ('Müziğe özgü tespit araştırmaları görece yenidir. Liu vd. (2024), ses derin sahteciliği '
         'tespitinden yapay zekâ üretimi müzik tespitine geçişi "yol haritası ve genel bakış" '
         'perspektifiyle ele almaktadır [15]. Afchar vd. (2025), oto-kodlayıcı artefaktlarından '
         'yararlanarak dedektörlerin %99,8 doğruluğa ulaşabildiğini, ancak MP3 sıkıştırma ve '
         'perde kaydırma gibi basit ses işleme işlemlerinin tespit oranlarını önemli ölçüde '
         'düşürdüğünü IEEE ICASSP 2025\'te sunmuştur [1].', 'PARAGRAF METNİ'),
        ('2.3. Transformer Tabanlı Ses Gösterimleri', 'Heading 2'),
        ('wav2vec2 (Baevski vd., 2020), etiketlenmemiş konuşma verisi üzerinde öz-denetimli öğrenme '
         'yapan bir transformer modelidir [2]. Martín-Doñas ve Álvarez (2022), wav2vec2\'yi ADD 2022 '
         'yarışmasına doğrudan uygulayarak göreve özgü öznitelik mühendisliği gerektirmeksizin '
         'rekabetçi sonuçlar elde etmiş; bu durum önceden eğitilmiş ses transformer\'larının '
         'özgünlük sınıflandırmasındaki kullanışlılığını doğrulamıştır [18].', 'PARAGRAF METNİ'),
        ('CLAP (Elizalde vd., 2023), karşıtsal önceden eğitimi ses-metin embedding uzayına '
         'genişletmektedir [7]. Wu vd. (2023) tarafından geliştirilen LAION-CLAP varyantı, '
         '630.000 ses-metin çifti üzerinde eğitilmiş ve genel amaçlı ses embedding\'leri '
         'sağlamaktadır [22]. Kosta vd. (2025) ise Segment Transformer\'ı, müzik bölümlerinin '
         'dizisini işleyen ve tam kompozisyon genelindeki yapısal örüntüleri yakalayan '
         'bir çerçeve olarak önermiştir [12].', 'PARAGRAF METNİ'),
        ('2.4. Topluluk Yöntemleri ve Ses Sınıflandırması', 'Heading 2'),
        ('Topluluk yaklaşımları, müzik analizi görevlerinde tek model sınıflandırıcılarını tutarlı '
         'biçimde geride bırakmaktadır. Kostrzewa vd. (2022), farklı mimarilere sahip sinir ağlarının '
         'geniş topluluklarının müzik türü sınıflandırmasında varyansı azaltarak genellemeyi '
         'iyileştirdiğini göstermiştir [13]. Gradient boosting yöntemleri, özellikle XGBoost '
         '(Chen ve Guestrin, 2016) [4] ve LightGBM (Ke vd., 2017) [11], el ile tasarlanmış ses '
         'öznitelik vektörlerine uygulandığında güçlü performans sergilemektedir.', 'PARAGRAF METNİ'),
        ('Gan vd. (2024), VMD tabanlı öznitelik ayrıştırmasıyla birleştirilen XGBoost\'un müzik türü '
         'sınıflandırmasında rekabetçi doğruluk değerleri elde ettiğini bildirmiştir [9]. '
         'Liu vd. (2022), çok kanallı ses öznitelik füzyonunu XGBoost ile birleştirerek '
         'müzik enstrüman tanımada %97,65 doğruluk elde etmiştir [16].', 'PARAGRAF METNİ'),
        ('2.5. MFCC ve Spektral Öznitelikler', 'Heading 2'),
        ('Mel frekans kepstral katsayıları (MFCC), ses sınıflandırma boru hatlarında onlarca yıldır '
         'temel öznitelik olarak kullanılmaktadır. McFee vd. (2015) tarafından geliştirilen librosa '
         'kütüphanesi, bu özniteliklerin hızlı ve güvenilir biçimde hesaplanmasını '
         'kolaylaştırmaktadır [19]. Gourisaria vd. (2024), MFCC ile STFT özniteliklerinin '
         '7 farklı makine öğrenmesi sınıflandırıcısında karşılaştırmalı analizini yapmış; '
         'her iki öznitelik setinin birlikte kullanılmasının en iyi sonucu verdiğini '
         'bulmuştur [10]. Bu bulgu, AURIS\'in hem spektral hem de zamansal tanımlayıcıları '
         'bir araya getiren hibrit öznitelik vektörü tasarımını desteklemektedir.', 'PARAGRAF METNİ'),
        ('2.6. Mevcut Tespit Sistemleri ve Araştırma Boşlukları', 'Heading 2'),
        ('IRCAM Amplify, müzik kimlik doğrulama alanında kapalı kaynaklı bir API hizmeti sunmakta '
         've %98,59 doğruluk bildirmektedir; ancak eğitim verisi, değerlendirme metodolojisi '
         've öznitelik mimarisi hakkında hiçbir şeffaflık sunmamaktadır [1]. '
         'Believe AI Radar, streaming platformlarına yönelik ticari bir çözüm olup '
         'ücretli erişim modeli akademik kullanımı kısıtlamaktadır. '
         'lofcz/ai-music-detector projesi açık kaynak olmakla birlikte sistematik '
         'çapraz doğrulama eksikliği bu sistemin genelleme kapasitesini sınırlandırmaktadır.', 'PARAGRAF METNİ'),
        ('Bu boşlukları kapatmak üzere AURIS; (1) kamuya açık kaynaklardan derlenen çok üreticili '
         'veri kümesi, (2) şeffaf 5 katlı çapraz doğrulama, (3) SHAP tabanlı açıklanabilirlik '
         've (4) ücretsiz web ve mobil dağıtım ile alandaki mevcut sistemlerden '
         'ayrışmaktadır.', 'PARAGRAF METNİ'),
    ]

    # "MATERYAL VE YONTEM" basligini bul - bu sablonda bolum 2
    mat_idx, mat_para = find_para_by_style_and_text(doc, 'Heading 1', 'MATERYAL VE Y')
    if mat_para:
        set_para_text(mat_para, '2. LİTERATÜR TARAMASI')
        # Icerigi temizle
        insert_after = mat_para._element
        next_elem = insert_after.getnext()
        while next_elem is not None:
            tag = next_elem.tag.split('}')[-1]
            if tag == 'p':
                pStyle_el = next_elem.find('.//' + qn('w:pStyle'))
                style_val_str = ''
                if pStyle_el is not None:
                    style_val_str = pStyle_el.get(qn('w:val'), '')
                if 'Heading1' in style_val_str:
                    break
                next_next = next_elem.getnext()
                next_elem.getparent().remove(next_elem)
                next_elem = next_next
            elif tag == 'tbl':
                next_next = next_elem.getnext()
                next_elem.getparent().remove(next_elem)
                next_elem = next_next
            else:
                break

        from docx.oxml import OxmlElement
        for (text, style_name) in literatur_content:
            try:
                style_id = doc.styles[style_name].style_id
            except:
                style_id = style_name.replace(' ', '')
            new_p = make_para_xml(text, style_id)
            insert_after.addnext(new_p)
            insert_after = new_p

    print("  [5] Bolum 3 (MATERYAL VE YONTEM) dolduruluyor...")
    # ── BOLUM 3, 4, 5 - sablon bolumlerini yeniden isle ─────────────────────
    # Sablon Bolum 3'u bul ("BÖLÜM 3" yazisi)
    for i, p in enumerate(doc.paragraphs):
        if p.style.name == 'Heading 1' and ('BÖLÜM 3' in p.text or 'BÖLÜM 3' in p.text):
            set_para_text(p, '3. MATERYAL VE YÖNTEM')
            insert_after = p._element
            # Eski icerigi sil
            next_elem = insert_after.getnext()
            while next_elem is not None:
                tag = next_elem.tag.split('}')[-1]
                if tag == 'p':
                    pStyle_el = next_elem.find('.//' + qn('w:pStyle'))
                    style_val_str = ''
                    if pStyle_el is not None:
                        style_val_str = pStyle_el.get(qn('w:val'), '')
                    if 'Heading1' in style_val_str:
                        break
                    next_next = next_elem.getnext()
                    next_elem.getparent().remove(next_elem)
                    next_elem = next_next
                elif tag == 'tbl':
                    next_next = next_elem.getnext()
                    next_elem.getparent().remove(next_elem)
                    next_elem = next_next
                else:
                    break
            break

    # Bolum 3 icerigi
    b3_content = [
        ('3.1. Sistem Mimarisine Genel Bakış', 'Heading 2'),
        ('AURIS dört ana modülden oluşmaktadır: (1) Ses Ön İşleme Modülü — format standartlaştırma, '
         'yeniden örnekleme ve süre normalizasyonu; (2) Öznitelik Çıkarma Modülü — librosa tabanlı '
         '47 boyutlu vektör hesaplama; (3) Sınıflandırma Modülü — 11 modelin 5 katlı çapraz '
         'doğrulamayla eğitimi ve seçimi; (4) Açıklama Modülü — SHAP değerlerinin hesaplanması '
         've kullanıcıya sunulması.', 'PARAGRAF METNİ'),
        ('Sistem şu giriş formatlarını desteklemektedir: MP3, WAV, FLAC ve OGG ses dosyaları '
         '(maksimum 50 MB) ve YouTube bağlantısı (yt-dlp ile ses çıkarımı). Tahmin çıktısı; '
         'sınıf etiketi (AI/İnsan), P(AI) güven skoru ve her özniteliğin karara katkısını '
         'gösteren SHAP değer sözlüğünden oluşmaktadır.', 'PARAGRAF METNİ'),
        ('3.2. Veri Kümesi', 'Heading 2'),
        ('3.2.1. Derleme Stratejisi ve Etik', 'Heading 3'),
        ('AURIS veri kümesi, kaynak kökenine dayalı otomatik etiketleme stratejisiyle '
         'oluşturulmuştur. Bilinen yapay zekâ üretim platformlarından gelen örnekler "1" (AI), '
         'bilinen insan müziği arşivlerinden gelen örnekler "0" (İnsan) olarak etiketlenmektedir. '
         'Bu yöntem manuel etiketleme maliyetini sıfıra indirmekte ve etiket kaynaklarının '
         'tam denetlenebilirliğini güvence altına almaktadır.', 'PARAGRAF METNİ'),
        ('Veri toplama sürecinde yalnızca kamuya açık ve Creative Commons ya da eşdeğer lisanslı '
         'ses arşivleri kullanılmıştır. İnsan katılımcılardan birincil veri toplanmamış olduğundan '
         'etik kurul izni gerekmemektedir. Tüm veri kaynakları HuggingFace Hub üzerinden '
         'programatik olarak indirilmiştir.', 'PARAGRAF METNİ'),
        ('3.2.2. Kaynak Dağılımı', 'Heading 3'),
        ('Veri kümesi 5.195 ses kaydından oluşmaktadır: 3.113 insan üretimi (%59,9) ve 2.082 '
         'yapay zekâ üretimi (%40,1). Aşağıdaki çizelgede kaynak bazında dağılım sunulmaktadır.', 'PARAGRAF METNİ'),
        ('Çizelge 3.1. AURIS veri kümesi kaynak dağılımı.', 'Çizelge Yazısı'),
        ('AIME veri kümesi (disco-eth/AIME), Suno v3/v3.5/v4/v5, Udio, MusicGen, Stable Audio, '
         'Riffusion, AudioLDM2, Mustango, JEN-1, MusicLDM ve Tango dahil olmak üzere 12 farklı '
         'AI üretim mimarisinin çıktılarını barındırmaktadır. Bu çeşitlilik, '
         'çapraz-üretici genelleme kapasitesini test etmek açısından kritik önem '
         'taşımaktadır.', 'PARAGRAF METNİ'),
        ('3.2.3. Ön İşleme Hattı', 'Heading 3'),
        ('Tüm ses dosyaları şu standartlaştırma adımlarından geçirilmektedir: '
         '(1) 22.050 Hz\'ye yeniden örnekleme; (2) Tek kanala (mono) dönüşüm — stereo-mono '
         'dönüşümü kanal ortalamasıyla gerçekleştirilmektedir; (3) Süre normalizasyonu — '
         '30 saniyeyi aşan kayıtlar kırpılmakta, kısa kayıtlar sıfırla doldurulmaktadır; '
         '(4) Gürültü ve bozulma kontrolü — minimum 1 saniye uzunluk ve minimum 1e-6 genlik eşiği; '
         '(5) Veri sızıntısını önlemek için duration_sec ve sample_rate meta veri alanları '
         'öznitelik vektöründen çıkarılmıştır.', 'PARAGRAF METNİ'),
        ('3.3. Öznitelik Mühendisliği', 'Heading 2'),
        ('3.3.1. Öznitelik Kategorileri', 'Heading 3'),
        ('AURIS, librosa kütüphanesi (v0.10.1) (McFee vd., 2015) [19] kullanılarak her ses '
         'kaydından 47 boyutlu bir öznitelik vektörü çıkarmaktadır. Öznitelikler 5 kategoride '
         'gruplanmaktadır: Spektral (16 öznitelik) — MFCC varyans/delta/delta², spektral '
         'merkez/bant genişliği/rolloff/düzlük/kontrast/düzenlilik; Zamansal/Ritmik '
         '(10 öznitelik) — RMS enerji/std/dinamik aralık, sıfır geçiş oranı, '
         'tempo BPM/stabilite/CV; Onset/Beat (9 öznitelik) — onset güç ort/std, '
         'beat sayısı, IBI stabilitesi; Harmonik/Tonal (8 öznitelik) — '
         'chroma entropi/std/geçiş hızı, Tonnetz std, harmonik oran; '
         'Vokal (4 öznitelik) — perde stabilitesi, vibrato, formant, nefes.', 'PARAGRAF METNİ'),
        ('3.3.2. Kritik Öznitelikler ve Motivasyonu', 'Heading 3'),
        ('Spektral düzlük (spectral_flatness), bir sesin gürültü benzeri mi yoksa tonal mı '
         'olduğunu ölçen 0-1 aralığında bir metriktir. Yapay zekâ üretimi müzik, perceptual '
         'kalite metriklerini optimize etme eğiliminde olduğundan genellikle daha homojen '
         've tonal bir spektral yapıya sahipken, insan müziği kayıt ortamı gürültüsü, '
         'enstrüman rezonansları ve doğal performans varyasyonları nedeniyle daha geniş '
         'bir spektral düzlük aralığı sergilemektedir. Bu fark, spectral_flatness_std\'nin '
         'en yüksek öznitelik önem skoruna (0,0619) ulaşmasını açıklamaktadır.', 'PARAGRAF METNİ'),
        ('Vokal öznitelikler, AURIS\'in özgün katkılarından birini oluşturmaktadır. '
         'İnsan sesinin karakteristik özellikleri — stokastik perde varyasyonu, doğal '
         'vibrato düzensizliği, formant geçişlerinin akıcı yapısı ve nefes örüntüleri — '
         'yapay zekâ sentezli seslerde tam olarak taklit edilememektedir. '
         'Breath_pattern_score özniteliğinin LightGBM öznitelik önem analizinde '
         'ilk 15\'e girmesi bu motivasyonu deneysel olarak doğrulamaktadır.', 'PARAGRAF METNİ'),
        ('3.4. Sınıflandırma Modelleri', 'Heading 2'),
        ('3.4.1. Klasik Makine Öğrenmesi Modelleri (7)', 'Heading 3'),
        ('Yedi klasik makine öğrenmesi modeli scikit-learn (Pedregosa vd., 2011) [21], '
         'XGBoost (Chen ve Guestrin, 2016) [4] ve LightGBM (Ke vd., 2017) [11] '
         'kütüphaneleri kullanılarak eğitilmiştir. Modeller ve seçilen temel '
         'hiperparametreleri aşağıdaki çizelgede sunulmaktadır.', 'PARAGRAF METNİ'),
        ('Çizelge 3.2. Klasik ML modellerinin hiperparametreleri ve eğitim süreleri.', 'Çizelge Yazısı'),
        ('3.4.2. Derin Öğrenme Modelleri (4)', 'Heading 3'),
        ('Dört derin öğrenme modeli PyTorch (Paszke vd., 2019) [20] çerçevesinde '
         '47 boyutlu öznitelik vektörünü girdi olarak alacak şekilde tasarlanmıştır. '
         'Tüm DL modelleri BCEWithLogitsLoss kayıp fonksiyonu, Adam optimizasyon '
         'algoritması (lr=1e-3) ve erken durdurma (patience=10) kullanmaktadır. '
         'Derin MLP (512-256-128-64): 81,4 saniye eğitim süresi, BatchNorm ve '
         'Dropout(0,3) ile regularizasyon. 1D-CNN: Conv1D(1->32->64->128) + '
         'GlobalAvgPool + FC(128->1), 125,0 saniye. Residual MLP (3 blok): '
         '3 artık blok (64 boyut), 128,7 saniye. Attention MLP: öz-dikkat '
         '(64 boyut) + FF katmanlar, 149,6 saniye.', 'PARAGRAF METNİ'),
        ('3.5. Eğitim Protokolü', 'Heading 2'),
        ('3.5.1. 5 Katlı Tabakalı Çapraz Doğrulama', 'Heading 3'),
        ('Tüm modeller aynı 5 katlı tabakalı çapraz doğrulama protokolüyle '
         'değerlendirilmiştir. Tabakalama, her katlamada sınıf dağılımını '
         '(%59,9 insan / %40,1 AI) koruyarak değerlendirmenin güvenilirliğini '
         'artırmaktadır. Her katlama için StandardScaler yalnızca eğitim alt '
         'kümesine uyarlanmış, doğrulama alt kümesine dönüşüm uygulanmıştır.', 'PARAGRAF METNİ'),
        ('3.5.2. Youden J Eşik Optimizasyonu', 'Heading 3'),
        ('Naif 0,50 eşiği yerine her katlama için Youden J istatistiği '
         'maksimize edilerek optimal karar eşiği belirlenmektedir: '
         'theta* = argmax(Duyarlilik + Ozgulluk - 1). '
         'LightGBM için optimal eşik θ* = 0,4316 olarak belirlenmiştir.', 'PARAGRAF METNİ'),
        ('3.6. SHAP Açıklanabilirlik Entegrasyonu', 'Heading 2'),
        ('AURIS, her tahmin için SHAP (SHapley Additive exPlanations) '
         '(Lundberg ve Lee, 2017) [17] değerlerini hesaplamaktadır. '
         'LightGBM\'in TreeExplainer arayüzü, ağaç tabanlı modeller için '
         'SHAP değerlerini lineer zamanda hesaplayarak gerçek zamanlı '
         'kullanım için pratik bir avantaj sağlamaktadır. Her analiz '
         'sonucunda kullanıcıya hangi özniteliklerin AI ya da İnsan '
         'kararına ne kadar katkı yaptığı görsel olarak sunulmaktadır.', 'PARAGRAF METNİ'),
        ('3.7. Uygulama Mimarisi', 'Heading 2'),
        ('Web platformu Next.js 14 ve TypeScript ile geliştirilmiştir. '
         'Statik site üretimi yaklaşımıyla Netlify CDN üzerinde küresel '
         'dağıtım sağlanmaktadır. Android uygulaması Kotlin ve Jetpack '
         'Compose ile Clean Architecture (MVVM) deseninde, minimum '
         'API 26 (Android 8.0) desteğiyle geliştirilmiştir. '
         'Arka uç Python 3.11 ve FastAPI ile geliştirilmiş; '
         'HuggingFace Spaces\'ta Docker konteyneri olarak '
         '7860 numaralı portta çalışmaktadır.', 'PARAGRAF METNİ'),
    ]

    # Bolum 3 basligini bul (yeni yazdigimiz "3. MATERYAL VE YONTEM")
    for i, p in enumerate(doc.paragraphs):
        if p.style.name == 'Heading 1' and '3. MATERYAL' in p.text:
            insert_after = p._element
            from docx.oxml import OxmlElement
            for (text, style_name) in b3_content:
                try:
                    style_id = doc.styles[style_name].style_id
                except:
                    style_id = style_name.replace(' ', '')
                new_p = make_para_xml(text, style_id)
                insert_after.addnext(new_p)
                insert_after = new_p
            break

    print("  [6] Bolum 4 (BULGULAR VE TARTISMA) -> BULGULAR...")
    # Bolum 4'u guncelle
    for i, p in enumerate(doc.paragraphs):
        if p.style.name == 'Heading 1' and ('BÖLÜM 4' in p.text or 'BÖLÜM 4' in p.text):
            set_para_text(p, '4. BULGULAR')
            insert_after = p._element
            next_elem = insert_after.getnext()
            while next_elem is not None:
                tag = next_elem.tag.split('}')[-1]
                if tag == 'p':
                    pStyle_el = next_elem.find('.//' + qn('w:pStyle'))
                    sv = ''
                    if pStyle_el is not None:
                        sv = pStyle_el.get(qn('w:val'), '')
                    if 'Heading1' in sv:
                        break
                    next_next = next_elem.getnext()
                    next_elem.getparent().remove(next_elem)
                    next_elem = next_next
                elif tag == 'tbl':
                    next_next = next_elem.getnext()
                    next_elem.getparent().remove(next_elem)
                    next_elem = next_next
                else:
                    break
            break

    b4_content = [
        ('4.1. Model Karşılaştırma Sonuçları', 'Heading 2'),
        ('Çizelge 4.1, 5.195 örnek ve 47 öznitelik üzerinde 5 katlı çapraz doğrulamayla elde '
         'edilen tüm 11 modelin performansını ROC-AUC\'a göre azalan sırada sunmaktadır. '
         'LightGBM 0,9549 ROC-AUC ile birinci, Derin MLP 0,9537 ile ikinci sırada '
         'yer almaktadır. 1D-CNN 0,8442 ile en düşük AUC değerini '
         'sergilemiştir.', 'PARAGRAF METNİ'),
        ('Çizelge 4.1. 11 modelin 5 katlı CV performans karşılaştırması (ROC-AUC\'a göre sıralı).', 'Çizelge Yazısı'),
        ('4.2. En İyi Model: LightGBM Ayrıntılı Analizi', 'Heading 2'),
        ('4.2.1. Karar Eşiği Optimizasyonu', 'Heading 3'),
        ('Varsayılan 0,50 eşiği yerine Youden J istatistiği ile optimal eşik '
         'θ* = 0,4316 olarak belirlenmiştir. Bu eşiğin 0,50\'nin altında olması, '
         'sınıf dengesizliğini yansıtmaktadır: azınlık sınıfı olan AI örneklerini '
         'daha hassas yakalamak için karar sınırı aşağıya çekilmiştir.', 'PARAGRAF METNİ'),
        ('4.2.2. Karışıklık Matrisi ve Brier Skoru', 'Heading 3'),
        ('LightGBM modeli θ* = 0,4316 eşiğiyle; insan örneklerinin %87,4\'ünü doğru negatif, '
         'yapay zekâ örneklerinin %89,4\'ünü doğru pozitif olarak sınıflandırmıştır. '
         'Brier skoru 0,083 ile iyi kalibre edilmiş bir olasılık tahmincisi olduğu '
         'kanıtlanmıştır.', 'PARAGRAF METNİ'),
        ('Çizelge 4.2. LightGBM karışıklık matrisi (θ* = 0,4316).', 'Çizelge Yazısı'),
        ('4.3. Öznitelik Önemi Analizi', 'Heading 2'),
        ('LightGBM kazanç tabanlı normalleştirilmiş öznitelik önemi analizinde ilk 3 sırayı '
         'spektral öznitelikler almaktadır: spectral_flatness_std (0,0619), '
         'spectral_contrast_mean (0,0467), rms_energy (0,0456). '
         'Vokal kategorisinden breath_pattern_score ilk 15\'e girerek '
         'vokal analizi motif tasarımının doğrulandığını göstermektedir.', 'PARAGRAF METNİ'),
        ('Çizelge 4.3. LightGBM normalleştirilmiş öznitelik önemi (ilk 15).', 'Çizelge Yazısı'),
        ('4.4. Derin Öğrenme Katlama Stabilitesi', 'Heading 2'),
        ('Derin MLP en düşük varyansı (std=0,0036) sergileyerek 5 katlama genelinde tutarlı '
         'genelleme kapasitesine sahip olduğunu kanıtlamıştır. LightGBM\'in std değeri '
         '±0,0023 ile tüm modeller arasında en kararlı model konumundadır. '
         '1D-CNN ise en yüksek varyansı (std=0,0087) ve en düşük ortalama AUC\'u (0,8543) '
         'göstererek bu öznitelik vektörü formatında evrişimsel mimarinin '
         'dezavantajını ortaya koymaktadır.', 'PARAGRAF METNİ'),
        ('Çizelge 4.4. Derin öğrenme modellerinin katlama bazında ROC-AUC değerleri.', 'Çizelge Yazısı'),
    ]

    for i, p in enumerate(doc.paragraphs):
        if p.style.name == 'Heading 1' and '4. BULGULAR' in p.text:
            insert_after = p._element
            from docx.oxml import OxmlElement
            for (text, style_name) in b4_content:
                try:
                    style_id = doc.styles[style_name].style_id
                except:
                    style_id = style_name.replace(' ', '')
                new_p = make_para_xml(text, style_id)
                insert_after.addnext(new_p)
                insert_after = new_p
            break

    print("  [7] Sablon BULGULAR VE TARTISMA bolumu -> 5. TARTISMA...")
    # Sablon "BULGULAR VE TARTISMA" (ilk geçen, sablon ornegi) -> 5. TARTISMA
    for i, p in enumerate(doc.paragraphs):
        if p.style.name == 'Heading 1' and 'BULGULAR VE TARTI' in p.text:
            set_para_text(p, '5. TARTIŞMA')
            insert_after = p._element
            next_elem = insert_after.getnext()
            while next_elem is not None:
                tag = next_elem.tag.split('}')[-1]
                if tag == 'p':
                    pStyle_el = next_elem.find('.//' + qn('w:pStyle'))
                    sv = ''
                    if pStyle_el is not None:
                        sv = pStyle_el.get(qn('w:val'), '')
                    if 'Heading1' in sv:
                        break
                    next_next = next_elem.getnext()
                    next_elem.getparent().remove(next_elem)
                    next_elem = next_next
                elif tag == 'tbl':
                    next_next = next_elem.getnext()
                    next_elem.getparent().remove(next_elem)
                    next_elem = next_next
                else:
                    break
            break

    b5_content = [
        ('5.1. LightGBM\'in Üstünlüğü', 'Heading 2'),
        ('LightGBM\'in 47 boyutlu el ile tasarlanmış öznitelik uzayında en yüksek ROC-AUC\'u '
         'elde etmesi birkaç yapısal faktörle açıklanabilir. Yaprak-düzeyinde büyüme stratejisi, '
         '47 boyutlu öznitelik uzayındaki karmaşık etkileşim örüntülerini daha iyi '
         'modelleyebilmektedir. Histogram tabanlı bölme hem hesaplama verimliliğini artırmakta '
         '(eğitim süresi: 2,95 saniye) hem de düzenlilik etkisi yaratarak aşırı uyumu '
         'baskılamaktadır. 5.195 örneklik veri kümesinde LightGBM, Derin MLP gibi daha '
         'büyük kapasiteli modellere kıyasla mevcut veri miktarında daha verimli '
         'öğrenme sergilemektedir.', 'PARAGRAF METNİ'),
        ('5.2. Spektral Düzlük: Yorumlanabilir Bir Ayrımcı', 'Heading 2'),
        ('Spectral_flatness_std\'nin en yüksek öznitelik önem skoruna (0,0619) ulaşması, '
         'güçlü bir yorumsal çerçeve sunmaktadır. AI müzik üretim sistemleri, perceptual '
         'kalite metriklerini optimize etme eğiliminde olduğundan daha homojen ve '
         'tonal bir spektral yapıya sahipken, insan müziği kayıt ortamı gürültüsü '
         've doğal performans varyasyonları nedeniyle daha geniş bir spektral '
         'düzlük aralığı sergilemektedir. Afchar vd. (2025) ile paralel biçimde, '
         'bu bulgu AI sentez süreçlerinin "spektral iz" bıraktığını '
         've bu izin el ile tasarlanmış özniteliklerle yakalanabildiğini '
         'göstermektedir [1].', 'PARAGRAF METNİ'),
        ('5.3. Literatürle Karşılaştırma', 'Heading 2'),
        ('AURIS\'in %88,4 doğruluk değeri ticari sistemlerin gerisinde kalmaktadır; '
         'ancak bu karşılaştırma dikkatli yorumlanmalıdır. Ticari sistemler kapalı, '
         'muhtemelen çok daha büyük ve özenle küratörlü veri kümeleri üzerinde '
         'eğitilmiştir. Değerlendirme metodolojileri şeffaf değildir. '
         'Buna karşın AURIS; şeffaf 5 katlı çapraz doğrulama, gerçek dünya veri kümesi, '
         'ücretsiz erişim ve SHAP açıklanabilirliğiyle akademik güvenilirlik '
         'açısından rakipsiz bir konumdadır.', 'PARAGRAF METNİ'),
        ('Çizelge 5.1. AURIS ile mevcut sistemlerin karşılaştırması.', 'Çizelge Yazısı'),
        ('5.4. Sınırlamalar', 'Heading 2'),
        ('Çalışmanın başlıca sınırlamaları şunlardır: (1) Veri kümesi büyüklüğü — 5.195 örnek '
         'ticari sistemlerle karşılaştırıldığında küçük kalmaktadır; (2) Dağılım kayması — '
         'konuşma sentezi gibi müzik-dışı AI ses içerikleri tespit edilememektedir; '
         '(3) Adversarial dayanıklılık — MP3 sıkıştırma ve perde kaydırma gibi '
         'ses işleme operasyonlarının etkisi değerlendirilmemiştir; '
         '(4) Tür önyargısı — bazı türler AI örnekleri arasında aşırı '
         'temsil edilmiş olabilir.', 'PARAGRAF METNİ'),
    ]

    for i, p in enumerate(doc.paragraphs):
        if p.style.name == 'Heading 1' and '5. TARTI' in p.text:
            insert_after = p._element
            from docx.oxml import OxmlElement
            for (text, style_name) in b5_content:
                try:
                    style_id = doc.styles[style_name].style_id
                except:
                    style_id = style_name.replace(' ', '')
                new_p = make_para_xml(text, style_id)
                insert_after.addnext(new_p)
                insert_after = new_p
            break

    print("  [8] KAYNAKLAR YAZIMI -> 6. SONUCLAR...")
    # "KAYNAKLARIN YAZIMI" -> "6. SONUCLAR VE ONERILER"
    for i, p in enumerate(doc.paragraphs):
        if p.style.name == 'Heading 1' and 'KAYNAKLAR' in p.text and 'YAZIM' in p.text:
            set_para_text(p, '6. SONUÇLAR VE ÖNERİLER')
            insert_after = p._element
            next_elem = insert_after.getnext()
            while next_elem is not None:
                tag = next_elem.tag.split('}')[-1]
                if tag == 'p':
                    pStyle_el = next_elem.find('.//' + qn('w:pStyle'))
                    sv = ''
                    if pStyle_el is not None:
                        sv = pStyle_el.get(qn('w:val'), '')
                    if 'Heading1' in sv:
                        break
                    next_next = next_elem.getnext()
                    next_elem.getparent().remove(next_elem)
                    next_elem = next_next
                elif tag == 'tbl':
                    next_next = next_elem.getnext()
                    next_elem.getparent().remove(next_elem)
                    next_elem = next_next
                else:
                    break
            break

    b6_content = [
        ('6.1. Araştırma Sonuçlarının Özeti', 'Heading 2'),
        ('Bu tez çalışmasında geliştirilen AURIS sistemi, yapay zekâ üretimi müzikleri insan '
         'bestelerinden otomatik olarak ayırt etmek için kapsamlı bir akustik öznitelik '
         'mühendisliği ve sistematik model karşılaştırma çerçevesi sunmaktadır. '
         'LightGBM, 0,9549 ROC-AUC (±0,0023) ve Brier skoru 0,083 ile hem klasik ML '
         'hem DL modelleri arasında en yüksek ve en kararlı performansı sergilemiştir. '
         'Spectral_flatness_std (önem: 0,0619) tek en güçlü ayrımcı özniteliktir. '
         'Youden J eşik optimizasyonu (θ* = 0,4316) dengeli hata profili sağlamıştır. '
         'SHAP entegrasyonu, kapalı kaynak ticari rakiplerden farklılaştıran şeffaf '
         've yorumlanabilir karar mekanizması sunmaktadır.', 'PARAGRAF METNİ'),
        ('6.2. Gelecek Çalışma Önerileri', 'Heading 2'),
        ('Kısa vadeli öneriler (0-6 ay): Veri kümesini 10.000+ örneğe genişletmek; '
         'yeni üreticileri (Sora Audio, Udio v2 vb.) dahil etmek; '
         'görülmemiş üreticilerden oluşan bağımsız test seti ile '
         'çapraz-üretici genellemeyi resmi olarak değerlendirmek; '
         'adversarial dayanıklılığı test etmek.', 'PARAGRAF METNİ'),
        ('Orta ve uzun vadeli öneriler (6+ ay): iOS uygulaması geliştirme; '
         'tür-tabakalı değerlendirme protokolü tasarlamak; '
         'çok kipli analiz (ses + sözler + meta veri) ile hibrit tespit sistemi; '
         'gerçek zamanlı yayın akışı analizi için akış tabanlı öznitelik çıkarma; '
         'gizlilik koruyucu federe öğrenme ile sürekli model güncelleme.', 'PARAGRAF METNİ'),
    ]

    for i, p in enumerate(doc.paragraphs):
        if p.style.name == 'Heading 1' and '6. SONUÇ' in p.text:
            insert_after = p._element
            from docx.oxml import OxmlElement
            for (text, style_name) in b6_content:
                try:
                    style_id = doc.styles[style_name].style_id
                except:
                    style_id = style_name.replace(' ', '')
                new_p = make_para_xml(text, style_id)
                insert_after.addnext(new_p)
                insert_after = new_p
            break

    print("  [9] KAYNAKLAR bolumu guncelleniyor...")
    # Sablon KAYNAKLAR (2. tane) -> gercek referanslarimiz
    refs = [
        '[1] Afchar, D., Meseguer Brocal, G. ve Hennequin, R. (2025). AI-Generated Music Detection and Its Challenges. Proceedings of IEEE ICASSP 2025. https://doi.org/10.48550/arXiv.2501.10111',
        '[2] Baevski, A., Zhou, Y., Mohamed, A. ve Auli, M. (2020). wav2vec 2.0: A Framework for Self-Supervised Learning of Speech Representations. Advances in Neural Information Processing Systems, 33, 12449-12460.',
        '[3] Bhatt, A., Rajan, A. ve digerleri. (2025). AI-Generated Music Detection: A Survey of Methods and Datasets. arXiv preprint. https://doi.org/10.48550/arXiv.2501.10111',
        '[4] Chen, T. ve Guestrin, C. (2016). XGBoost: A Scalable Tree Boosting System. Proceedings of the 22nd ACM SIGKDD, s. 785-794.',
        '[5] Copet, J., Kreuk, F., Gat, I., Remez, T., Kant, D., Synnaeve, G., Adi, Y. ve Defossez, A. (2023). Simple and Controllable Music Generation. Advances in Neural Information Processing Systems, 36, 47704-47720.',
        '[6] Dhariwal, P., Jun, H., Payne, C., Kim, J. W., Radford, A. ve Sutskever, I. (2020). Jukebox: A Generative Model for Music. arXiv preprint arXiv:2005.00341.',
        '[7] Elizalde, B., Deshmukh, S., Al Ismail, M. ve Wang, H. (2023). CLAP: Learning Audio Concepts from Natural Language Supervision. Proceedings of ICASSP 2023, s. 1-5.',
        '[8] Frank, J. ve Schonherr, L. (2021). WaveFake: A Data Set to Facilitate Audio Deepfake Detection. NeurIPS 2021 Datasets and Benchmarks Track.',
        '[9] Gan, R., Huang, T., Shao, J. ve Wang, F. (2024). Music Genre Classification Based on VMD-IWOA-XGBoost. Mathematics, 12(10), 1549.',
        '[10] Gourisaria, M. K., Agrawal, R. ve Sahni, M. (2024). Comparative Analysis of Audio Classification with MFCC and STFT Features Using Machine Learning Techniques. Discover Internet of Things, 4.',
        '[11] Ke, G., Meng, Q., Finley, T., Wang, T., Chen, W., Ma, W., Ye, Q. ve Liu, T. (2017). LightGBM: A Highly Efficient Gradient Boosting Decision Tree. Advances in Neural Information Processing Systems, 30.',
        '[12] Kosta, K., Meseguer Brocal, G., Afchar, D. ve Hennequin, R. (2025). Segment Transformer: AI-Generated Music Detection via Music Structural Analysis. arXiv preprint arXiv:2509.08283.',
        '[13] Kostrzewa, D., Mazur, W. ve Brzeski, R. (2022). Wide Ensembles of Neural Networks in Music Genre Classification. Proceedings of MISSI 2022, s. 91-102. Springer.',
        '[14] Liu, H., Chen, Z., Yuan, Y., Mei, X., Liu, X., Mandic, D., Wang, W. ve Plumbley, M. D. (2023). AudioLDM: Text-to-Audio Generation with Latent Diffusion Models. Proceedings of ICML 2023.',
        '[15] Liu, Y. ve digerleri. (2024). From Audio Deepfake Detection to AI-Generated Music Detection: A Pathway and Overview. arXiv preprint. https://doi.org/10.48550/arXiv.2412.00571',
        '[16] Liu, Y., Yin, Y., Zhu, Q. ve Cui, W. (2022). Musical Instrument Recognition by XGBoost Combining Feature Fusion. arXiv preprint.',
        '[17] Lundberg, S. M. ve Lee, S. I. (2017). A Unified Approach to Interpreting Model Predictions. Advances in Neural Information Processing Systems, 30.',
        '[18] Martin-Donas, J. M. ve Alvarez, A. (2022). The Vicomtech Audio Deepfake Detection System Based on Wav2vec2 for the 2022 ADD Challenge. Proceedings of ICASSP 2022, s. 9266-9270.',
        '[19] McFee, B., Raffel, C., Liang, D., Ellis, D. P. W., McVicar, M., Battenberg, E. ve Nieto, O. (2015). librosa: Audio and Music Signal Analysis in Python. Proceedings of the 14th Python in Science Conference, s. 18-25.',
        '[20] Paszke, A. ve digerleri. (2019). PyTorch: An Imperative Style, High-Performance Deep Learning Library. Advances in Neural Information Processing Systems, 32.',
        '[21] Pedregosa, F. ve digerleri. (2011). Scikit-learn: Machine Learning in Python. Journal of Machine Learning Research, 12, 2825-2830.',
        '[22] Wu, Y., Chen, K., Zhang, T., Hui, Y., Berg-Kirkpatrick, T. ve Dubnov, S. (2023). Large-Scale Contrastive Language-Audio Pretraining with Feature Fusion and Keyword-to-Caption Augmentation. Proceedings of ICASSP 2023.',
        '[23] Yi, J., Fu, R., Tao, J., Nie, S., Ma, H., Wang, C. ve digerleri. (2022). ADD 2022: The First Audio Deep Synthesis Detection Challenge. Proceedings of ICASSP 2022, s. 9216-9220.',
        '[24] Yi, J., Wang, C., Tao, J., Zhang, X., Zhang, C. Y. ve Zhao, Y. (2023). Audio Deepfake Detection: A Survey. arXiv preprint.',
    ]

    # Ikinci KAYNAKLAR bul (sablon ornek kaynak listesi olan)
    kaynaklar_count = 0
    for i, p in enumerate(doc.paragraphs):
        if p.style.name == 'Heading 1' and p.text.strip() == 'KAYNAKLAR':
            kaynaklar_count += 1
            if kaynaklar_count >= 1:
                insert_after = p._element
                # Eski kaynaklari sil
                next_elem = insert_after.getnext()
                while next_elem is not None:
                    tag = next_elem.tag.split('}')[-1]
                    if tag == 'p':
                        pStyle_el = next_elem.find('.//' + qn('w:pStyle'))
                        sv = ''
                        if pStyle_el is not None:
                            sv = pStyle_el.get(qn('w:val'), '')
                        if 'Heading1' in sv:
                            break
                        next_next = next_elem.getnext()
                        next_elem.getparent().remove(next_elem)
                        next_elem = next_next
                    else:
                        break
                # Gercek kaynaklari ekle
                from docx.oxml import OxmlElement
                try:
                    style_id = doc.styles['Normal'].style_id
                except:
                    style_id = 'Normal'
                for ref in refs:
                    new_p = make_para_xml(ref, style_id)
                    insert_after.addnext(new_p)
                    insert_after = new_p
                break

    print("  [10] EKLER bolumu guncelleniyor...")
    # EKLER bolumu
    for i, p in enumerate(doc.paragraphs):
        if p.style.name == 'Heading 1' and p.text.strip() == 'EKLER':
            insert_after = p._element
            next_elem = insert_after.getnext()
            while next_elem is not None:
                tag = next_elem.tag.split('}')[-1]
                if tag == 'p':
                    pStyle_el = next_elem.find('.//' + qn('w:pStyle'))
                    sv = ''
                    if pStyle_el is not None:
                        sv = pStyle_el.get(qn('w:val'), '')
                    if 'Heading1' in sv:
                        break
                    next_next = next_elem.getnext()
                    next_elem.getparent().remove(next_elem)
                    next_elem = next_next
                elif tag == 'tbl':
                    next_next = next_elem.getnext()
                    next_elem.getparent().remove(next_elem)
                    next_elem = next_next
                else:
                    break
            break

    ek_content = [
        ('Ek 1: AURIS 47 Öznitelik Tam Listesi', 'Heading 2'),
        ('Aşağıdaki çizelgede AURIS sisteminin her ses kaydından çıkardığı '
         '47 akustik özniteliğin tam listesi sunulmaktadır.', 'PARAGRAF METNİ'),
        ('Çizelge E.1. AURIS 47 öznitelik tam listesi.', 'Çizelge Yazısı'),
        ('1-spectral_centroid_mean: Ağırlıklı frekans merkezi ortalaması (Hz) | '
         '2-spectral_centroid_std: Std. | '
         '3-spectral_bandwidth_mean: Bant genişliği ort. | '
         '4-spectral_bandwidth_std: Std. | '
         '5-spectral_flatness_mean: Gürültü/ton oranı ort. (0-1) | '
         '6-spectral_flatness_std: Std. (EN GÜÇLÜ OZNITELIK, 0.0619) | '
         '7-spectral_rolloff_mean: Rolloff frekansı ort. | '
         '8-spectral_rolloff_std: Std. | '
         '9-spectral_contrast_mean: Harmonik/gürültü kontrast ort. | '
         '10-spectral_contrast_std: Std. | '
         '11-mfcc_variance: 13 MFCC varyansı | '
         '12-mfcc_delta_var: 1. türev MFCC varyansı | '
         '13-mfcc_delta2_var: 2. türev MFCC varyansı | '
         '14-mel_flatness: Mel spektrogram zamansal düzlüğü | '
         '15-spectral_regularity: Düzenlilik endeksi | '
         '16-harmonic_structure: Harmonik yapı skoru | '
         '17-tempo_bpm: Tempo (vuruş/dakika) | '
         '18-tempo_stability: Stabilite | '
         '19-tempo_cv: Varyasyon katsayısı | '
         '20-beat_count: Toplam beat | '
         '21-onset_strength_mean: Onset güç ort. | '
         '22-onset_strength_std: Std. | '
         '23-rms_energy: RMS enerji ort. | '
         '24-rms_std: Std. | '
         '25-rms_dynamic_range: Dinamik aralık | '
         '26-zero_crossing_rate: Sıfır geçiş oranı | '
         '27-zero_crossing_std: Std. | '
         '28-temporal_patterns: Zamansal örüntü skoru | '
         '29-chroma_entropy: Chroma entropi | '
         '30-chroma_std: Std. | '
         '31-chroma_transition_rate: Geçiş hızı | '
         '32-tonnetz_std: Tonal varyasyon std. | '
         '33-harmonic_ratio: Harmonik/perküsif enerji oranı | '
         '34-vocal_energy_ratio: Vokal enerji oranı | '
         '35-vocal_harmonic_ratio: Vokal harmonik oranı | '
         '36-vocal_confidence: Vokal tespit güveni | '
         '37-has_vocals: Vokal varlık bayrağı | '
         '38-pitch_mean_hz: Perde ortalaması (Hz) | '
         '39-pitch_std_cents: Perde std. (cent) | '
         '40-pitch_stability_score: Stabiliite skoru | '
         '41-vibrato_rate_hz: Vibrato hızı | '
         '42-vibrato_extent_cents: Genlik (cent) | '
         '43-vibrato_regularity_score: Düzenlilik skoru | '
         '44-formant_consistency_score: Formant tutarlılık skoru | '
         '45-breath_pattern_score: Nefes örüntüsü skoru | '
         '46-vocal_texture_score: Vokal doku skoru | '
         '47-vocal_ai_score: Bileşik vokal AI endeksi.', 'PARAGRAF METNİ'),
        ('Ek 2: Sistem Gereksinimleri', 'Heading 2'),
        ('Python 3.11+, Node.js 20.18.1+, Android SDK API 26+ (Android 8.0), '
         'Minimum 8 GB RAM, ~500 MB disk. '
         'Backend port: 7860 (HuggingFace Spaces). '
         'Web port: 3000 (geliştirme sunucusu).', 'PARAGRAF METNİ'),
    ]

    for i, p in enumerate(doc.paragraphs):
        if p.style.name == 'Heading 1' and p.text.strip() == 'EKLER':
            insert_after = p._element
            from docx.oxml import OxmlElement
            for (text, style_name) in ek_content:
                try:
                    style_id = doc.styles[style_name].style_id
                except:
                    style_id = style_name.replace(' ', '')
                new_p = make_para_xml(text, style_id)
                insert_after.addnext(new_p)
                insert_after = new_p
            break

    print("  [11] OZGECMIS bolumu guncelleniyor...")
    # OZGECMIS
    for i, p in enumerate(doc.paragraphs):
        if p.style.name == 'Heading 1' and ('ÖZGEÇ' in p.text or 'ÖZGEÇ' in p.text):
            insert_after = p._element
            from docx.oxml import OxmlElement
            # Tabloyu koru (ozgecmis tablosu var sablonda)
            # Sadece icerik ekle
            try:
                style_id_on = doc.styles['ön sayfalar metin stili'].style_id
            except:
                style_id_on = 'Normal'
            ozgecmis_items = [
                ('KİŞİSEL BİLGİLER', 'Heading 3'),
                ('Ad Soyad: Hasan Arthur ALTUNTAŞ', 'PARAGRAF METNİ'),
                ('Öğrenci No: 221001047', 'PARAGRAF METNİ'),
                ('E-posta: hasannarthurrr@gmail.com', 'PARAGRAF METNİ'),
                ('GitHub: github.com/Rtur2003', 'PARAGRAF METNİ'),
                ('ÖĞRENİM DURUMU', 'Heading 3'),
                ('Lisans: Bilgisayar Mühendisliği, Düzce Üniversitesi (2020-2026)', 'PARAGRAF METNİ'),
                ('Lise: Mezun', 'PARAGRAF METNİ'),
                ('PROJE VE YAYINLAR', 'Heading 3'),
                ('AURIS: Akustik Öznitelik Tabanlı Yapay Zekâ Üretimi Müziğin Tespiti İçin '
                 'Çok Modelli Topluluk Sistemi — BM498 Mezuniyet Tezi, 2025-2026. '
                 'GUJSA (Gazi Üniversitesi Fen Bilimleri Dergisi A) dergisine makale olarak gönderilmiştir.', 'PARAGRAF METNİ'),
            ]
            for (text, style_name) in ozgecmis_items:
                try:
                    style_id = doc.styles[style_name].style_id
                except:
                    style_id = 'Normal'
                new_p = make_para_xml(text, style_id)
                insert_after.addnext(new_p)
                insert_after = new_p
            break

    # Ikinci "BULGULAR VE TARTISMA" (sablon ornegi) -> sil veya bosalt
    for i, p in enumerate(doc.paragraphs):
        if p.style.name == 'Heading 1' and 'BULGULAR VE TARTI' in p.text:
            set_para_text(p, '')
            break

    # Sablon SONUCLAR VE ONERILER -> bosalt (zaten 6. SONUCLAR yazdik)
    for i, p in enumerate(doc.paragraphs):
        if p.style.name == 'Heading 1' and ('SONUÇ' in p.text or 'SONUÇ' in p.text) and '6.' not in p.text:
            set_para_text(p, '')
            break

    print("  [12] Kaydiyor...")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    doc.save(OUT)
    print(f"[TAMAM] {OUT}")


if __name__ == '__main__':
    build()
