# -*- coding: utf-8 -*-
"""
BM498 Mezuniyet Tezi - Tam Build (v5)
AURIS — Hasan Arthur Altuntas — 221001047 — Duzce Universitesi

v5:
- Gercek Word tablolari (make_table) — metin listesi degil
- Her bolum maksimum akademik icerik
- Bol gorsel + altyazi, tablo, kaynakca referanslari
- make_figure: doc.add_paragraph() KULLANMIYOR (v4 XML fix korundu)
"""
import os
import copy
from docx import Document
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL

TEMPLATE = "docs/academic/TeslimEdilecekler/tezşablonu.docx"
OUT = "docs/academic/TeslimEdilecekler/1.TEZ-RAPOR/BM498_Mezuniyet_Tezi_Hasan_Arthur_Altuntas.docx"
FIG = "docs/academic/figures"
SCR = "docs/academic/figures/screenshots"


# ─────────────────────────────────────────────────────────────────────────────
# XML Yardimcilari
# ─────────────────────────────────────────────────────────────────────────────

def safe_remove(elem):
    try:
        p = elem.getparent()
        if p is not None:
            p.remove(elem)
    except Exception:
        pass


def get_sid(doc, name):
    try:
        return doc.styles[name].style_id
    except KeyError:
        return name.replace(' ', '')


def make_p(doc, text, style_name):
    """Saf XML paragraf olustur — doc.add_paragraph() kullanmaz."""
    sid = get_sid(doc, style_name)
    p = OxmlElement('w:p')
    pPr = OxmlElement('w:pPr')
    pStyle = OxmlElement('w:pStyle')
    pStyle.set(qn('w:val'), sid)
    pPr.append(pStyle)
    p.append(pPr)
    if text:
        r = OxmlElement('w:r')
        t = OxmlElement('w:t')
        t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
        t.text = text
        r.append(t)
        p.append(r)
    return p


def set_text(para, text, bold=False):
    for r in para._element.findall(qn('w:r')):
        para._element.remove(r)
    run = para.add_run(text)
    if bold:
        run.bold = True


def clear_para(para):
    for r in para._element.findall(qn('w:r')):
        para._element.remove(r)


def insert_block_after(anchor_el, items, doc):
    cur = anchor_el
    for item in items:
        if isinstance(item, tuple) and len(item) == 2 and item[1] != '__FIG__':
            new_p = make_p(doc, item[0], item[1])
        elif isinstance(item, tuple) and item[1] == '__FIG__':
            new_p = make_p(doc, item[0], 'PARAGRAF METNİ')  # fallback, build_items zaten cevirir
        else:
            new_p = item  # zaten XML element
        cur.addnext(new_p)
        cur = new_p
    return cur


def delete_until_next_h1(heading_elem):
    to_del = []
    nxt = heading_elem.getnext()
    while nxt is not None:
        tag = nxt.tag.split('}')[-1] if '}' in nxt.tag else nxt.tag
        if tag == 'p':
            ps = nxt.find('.//' + qn('w:pStyle'))
            if ps is not None and ps.get(qn('w:val'), '') == 'Balk1':
                break
        to_del.append(nxt)
        nxt = nxt.getnext()
    for el in to_del:
        safe_remove(el)


# ─────────────────────────────────────────────────────────────────────────────
# Gorsel Ekleme (doc.add_paragraph() YOK)
# ─────────────────────────────────────────────────────────────────────────────

def make_figure(doc, img_path, caption, width_cm=14.5):
    """Gorsel + altyazi XML element listesi. Orphan paragraf yok."""
    from docx.shared import Cm as _Cm

    # ── Gorsel paragraf ──
    fig_p = OxmlElement('w:p')
    pPr = OxmlElement('w:pPr')
    pStyle = OxmlElement('w:pStyle')
    pStyle.set(qn('w:val'), 'ekiller')
    jc = OxmlElement('w:jc')
    jc.set(qn('w:val'), 'center')
    pPr.append(pStyle)
    pPr.append(jc)
    fig_p.append(pPr)

    try:
        tmp_para = doc.add_paragraph()
        tmp_run = tmp_para.add_run()
        tmp_run.add_picture(img_path, width=_Cm(width_cm))
        r_els = tmp_para._element.findall(qn('w:r'))
        if r_els:
            for r_el in r_els:
                fig_p.append(copy.deepcopy(r_el))
        tmp_para._element.getparent().remove(tmp_para._element)
    except Exception as e:
        print(f"    [UYARI] Gorsel yuklenemedi: {os.path.basename(img_path)} — {e}")
        r = OxmlElement('w:r')
        t = OxmlElement('w:t')
        t.text = f"[{os.path.basename(img_path)}]"
        r.append(t)
        fig_p.append(r)

    # ── Altyazi paragraf ──
    cap_p = OxmlElement('w:p')
    cPr = OxmlElement('w:pPr')
    cStyle = OxmlElement('w:pStyle')
    cStyle.set(qn('w:val'), 'ekilYazs')
    cjc = OxmlElement('w:jc')
    cjc.set(qn('w:val'), 'center')
    cPr.append(cStyle)
    cPr.append(cjc)
    cap_p.append(cPr)

    cr = OxmlElement('w:r')
    crPr = OxmlElement('w:rPr')
    bold = OxmlElement('w:b')
    crPr.append(bold)
    cr.append(crPr)
    ct = OxmlElement('w:t')
    ct.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    ct.text = caption
    cr.append(ct)
    cap_p.append(cr)

    return [fig_p, cap_p]


def fig(doc, img, caption, w=14.5):
    return make_figure(doc, img, caption, w)


# ─────────────────────────────────────────────────────────────────────────────
# Gercek Word Tablosu Olusturma
# ─────────────────────────────────────────────────────────────────────────────

def make_table_element(doc, headers, rows, caption_text, col_widths=None):
    """
    Word tablosu + altyazi XML element listesi dondurur.
    headers: ['Sutun1', 'Sutun2', ...]
    rows: [['deger1', 'deger2', ...], ...]
    col_widths: cm cinsinden her sutun genisligi listesi (opsiyonel)
    """
    all_rows = [headers] + rows
    num_cols = len(headers)

    tbl = OxmlElement('w:tbl')

    # Tablo ozellikleri
    tblPr = OxmlElement('w:tblPr')
    tblStyle = OxmlElement('w:tblStyle')
    tblStyle.set(qn('w:val'), 'TableGrid')
    tblPr.append(tblStyle)
    tblW = OxmlElement('w:tblW')
    tblW.set(qn('w:w'), '0')
    tblW.set(qn('w:type'), 'auto')
    tblPr.append(tblW)
    tblBorders = OxmlElement('w:tblBorders')
    for side in ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']:
        b = OxmlElement(f'w:{side}')
        b.set(qn('w:val'), 'single')
        b.set(qn('w:sz'), '4')
        b.set(qn('w:space'), '0')
        b.set(qn('w:color'), '000000')
        tblBorders.append(b)
    tblPr.append(tblBorders)
    tblLook = OxmlElement('w:tblLook')
    tblLook.set(qn('w:val'), '04A0')
    tblPr.append(tblLook)
    tbl.append(tblPr)

    # Sutun genislikleri
    if col_widths:
        tblGrid = OxmlElement('w:tblGrid')
        for w_cm in col_widths:
            gridCol = OxmlElement('w:gridCol')
            twips = int(w_cm * 567)
            gridCol.set(qn('w:w'), str(twips))
            tblGrid.append(gridCol)
        tbl.append(tblGrid)

    # Satirlar
    for row_idx, row_data in enumerate(all_rows):
        tr = OxmlElement('w:tr')
        trPr = OxmlElement('w:trPr')
        if row_idx == 0:
            tblHeader = OxmlElement('w:tblHeader')
            trPr.append(tblHeader)
        tr.append(trPr)

        for col_idx, cell_text in enumerate(row_data):
            tc = OxmlElement('w:tc')
            tcPr = OxmlElement('w:tcPr')
            if col_widths and col_idx < len(col_widths):
                tcW = OxmlElement('w:tcW')
                tcW.set(qn('w:w'), str(int(col_widths[col_idx] * 567)))
                tcW.set(qn('w:type'), 'dxa')
                tcPr.append(tcW)
            shd = OxmlElement('w:shd')
            if row_idx == 0:
                shd.set(qn('w:val'), 'clear')
                shd.set(qn('w:color'), 'auto')
                shd.set(qn('w:fill'), '1F3864')
            else:
                shd.set(qn('w:val'), 'clear')
                shd.set(qn('w:color'), 'auto')
                shd.set(qn('w:fill'), 'FFFFFF' if row_idx % 2 == 1 else 'EBF3FB')
            tcPr.append(shd)
            vAlign = OxmlElement('w:vAlign')
            vAlign.set(qn('w:val'), 'center')
            tcPr.append(vAlign)
            tc.append(tcPr)

            p = OxmlElement('w:p')
            pPr = OxmlElement('w:pPr')
            jc = OxmlElement('w:jc')
            jc.set(qn('w:val'), 'center')
            pPr.append(jc)
            p.append(pPr)
            r = OxmlElement('w:r')
            rPr = OxmlElement('w:rPr')
            if row_idx == 0:
                b = OxmlElement('w:b')
                rPr.append(b)
                color = OxmlElement('w:color')
                color.set(qn('w:val'), 'FFFFFF')
                rPr.append(color)
            sz = OxmlElement('w:sz')
            sz.set(qn('w:val'), '18')
            rPr.append(sz)
            r.append(rPr)
            t = OxmlElement('w:t')
            t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
            t.text = str(cell_text)
            r.append(t)
            p.append(r)
            tc.append(p)
            tr.append(tc)
        tbl.append(tr)

    # Altyazi paragraf
    cap_p = OxmlElement('w:p')
    cPr = OxmlElement('w:pPr')
    cStyle = OxmlElement('w:pStyle')
    cStyle.set(qn('w:val'), 'ekilYazs')
    cjc = OxmlElement('w:jc')
    cjc.set(qn('w:val'), 'center')
    cPr.append(cStyle)
    cPr.append(cjc)
    cap_p.append(cPr)
    cr = OxmlElement('w:r')
    crPr = OxmlElement('w:rPr')
    bold_el = OxmlElement('w:b')
    crPr.append(bold_el)
    cr.append(crPr)
    ct = OxmlElement('w:t')
    ct.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    ct.text = caption_text
    cr.append(ct)
    cap_p.append(cr)

    return [tbl, cap_p]


def T(headers, rows, caption, col_widths=None):
    """Tablo isaretci: ('__TBL__', headers, rows, caption, col_widths)"""
    return ('__TBL__', headers, rows, caption, col_widths)


# ─────────────────────────────────────────────────────────────────────────────
# H1 Konumsal Bulma
# ─────────────────────────────────────────────────────────────────────────────

def find_h1s(doc):
    h1s = [p for p in doc.paragraphs if p.style.name == 'Heading 1']
    keys = ['giris', 'mat_yont', 'bolum3', 'bos_3', 'bolum4', 'bos_5',
            'bulgular_1', 'bos_7', 'kaynaklarin', 'bulgular_2', 'bos_10',
            'sonuclar_sab', 'kaynaklar', 'bos_13', 'ekler', 'ozgecmis']
    result = {}
    for i, h in enumerate(h1s):
        if i < len(keys):
            result[keys[i]] = h
    print(f"  H1 sayisi: {len(h1s)}")
    return result


# ─────────────────────────────────────────────────────────────────────────────
# BOLUM ICERIKLERI
# F(path, caption, w) → gorsel isaretci
# T(headers, rows, caption, col_widths) → tablo isaretci
# ─────────────────────────────────────────────────────────────────────────────

def F(path, caption, w=14.5):
    return (f'__FIG|{path}|{caption}|{w}|__', '__FIG__')


# ══════════════════════════════════════════════════════════════════════════════
# 1. GİRİŞ  (v6 — genişletilmiş, proje bazlı, özgün anlatım)
# ══════════════════════════════════════════════════════════════════════════════
GIRIS = [
    ('1.1. Projenin Amacı ve Motivasyon', 'Heading 2'),
    ('Müzik, yüzyıllardır insanın en özgün yaratı biçimlerinden biri olarak kabul '
     'görmektedir. Ancak son birkaç yılda bu kabul, köklü bir sorgulama sürecine '
     'girmiştir. Suno, Udio, MusicGen, Stable Audio, AudioLDM2, Riffusion, JEN-1 '
     've Echoes gibi üretici yapay zekâ platformları, müzik teorisi bilgisi '
     'gerektirmeksizin dakikalar içinde dinleyici tarafından gerçek müzikten '
     'ayırt edilmesi güç parçalar üretebilmektedir. Kullanıcı yalnızca bir metin '
     'talebi giriyor; sistem bütün bir şarkıyı, şarkı sözleriyle birlikte, '
     'sıfırdan üretiyor. Bu olanak, müzik endüstrisinde ciddi bir etik ve '
     'ekonomik gerilime yol açmaktadır.',
     'PARAGRAF METNİ'),
    ('Streaming platformlarında içerik moderasyonu büyük ölçüde meta veriye '
     'dayandığından, yapay zekâ üretimi parçaların insan eseri olarak yüklenmesi '
     'kolayca mümkün olmaktadır. Bu durum telif hakkı ihlallerine doğrudan zemin '
     'hazırlamakta; insan sanatçıların telif ve akış gelirlerini azaltmaktadır. '
     'Müzik yarışmalarında ve burs değerlendirmelerinde yapay zekâ eserlerinin '
     'insan yaratıcılığı olarak sunulması da ayrı bir sorun oluşturmaktadır [1]. '
     'Tüm bu nedenlerle, yapay zekâ üretimi müziği insan eserinden otomatik '
     'olarak ayırt edebilen, şeffaf ve güvenilir bir tespit sistemine duyulan '
     'ihtiyaç her geçen gün artmaktadır.',
     'PARAGRAF METNİ'),
    ('Bu tez çalışmasında, yukarıda tanımlanan soruna yanıt vermek amacıyla '
     'AURIS (Acoustic-feature-based AI music Recognition and Identification System) '
     'adlı sistem tasarlanmış ve hayata geçirilmiştir. AURIS; bir ses kaydından '
     'beş farklı kategoride toplam 47 akustik öznitelik çıkarmakta, bu öznitelikleri '
     'on bir farklı sınıflandırma modeliyle değerlendirmekte ve her karar için '
     'SHAP tabanlı açıklama üretmektedir. Sistemin tamamı web, Android ve REST API '
     'katmanlarıyla kullanıcıya açık biçimde sunulmuştur. '
     'Şekil 1.1\'de AURIS\'in uçtan uca işlem hattı şematik olarak gösterilmektedir.',
     'PARAGRAF METNİ'),
    F(f'{FIG}/paper_pipeline_diagram.png',
      'Şekil 1.1. AURIS sistem akış diyagramı — ses girişinden YZ/İnsan kararına uçtan uca işlem hattı.', 15.5),
    ('1.2. Problemin Tanımı', 'Heading 2'),
    ('Yapay zekâ üretimi müziği tespit etmeye yönelik araştırmaların büyük bölümü, '
     'konuşma sentezi ve ses derin sahteciliği alanına odaklanmıştır. Müziğe özgü '
     'tespit çalışmaları görece sınırlı kalmış; mevcut yaklaşımların önemli bir '
     'kısmı yalnızca belirli bir üreticiye özgü örnekler üzerinde başarılı '
     'olabilmektedir. Liu vd. (2024) bu sorunun müzik tespitinin önündeki en büyük '
     'engel olduğunu vurgularken, Bhatt vd. (2025) çapraz-üretici genellemenin '
     'alanın açık problemi olmaya devam ettiğini ortaya koymuştur [2],[3].',
     'PARAGRAF METNİ'),
    ('Mevcut ticari sistemler şeffaf metodoloji sunmamaktadır. IRCAM Amplify '
     'yüksek doğruluk bildirmekle birlikte eğitim verisini kamuyla paylaşmamakta; '
     'Believe AI Radar ise ücretli erişim modeli nedeniyle akademik '
     'karşılaştırmayı güçleştirmektedir. Bu çalışmada, söz konusu boşlukları '
     'kapatmak amacıyla; açık kaynaklı veri kümesi, şeffaf çapraz doğrulama '
     'protokolü, SHAP açıklanabilirliği ve ücretsiz platform erişimi '
     'bir arada sunulmaktadır.',
     'PARAGRAF METNİ'),
    ('1.3. Araştırma Sorusu ve Hedefler', 'Heading 2'),
    ('Bu çalışmanın yöneldiği temel araştırma sorusu şudur: Spektral, zamansal, '
     'ritmik, harmonik ve vokal boyutları kapsayan, el ile tasarlanmış 47 boyutlu '
     'akustik bir öznitelik vektörü, gradient boosting tabanlı topluluk yöntemiyle '
     'birleştirildiğinde, uçtan uca derin öğrenme yaklaşımlarıyla rekabet edebilir '
     'bir yapay zekâ müziği tespit performansı sağlayabilir mi?',
     'PARAGRAF METNİ'),
    ('Bu sorudan türetilen araştırma hedefleri şu şekilde belirlenmiştir: '
     '(1) Beş kategoride 47 akustik öznitelikten oluşan, müziğe özgü ve '
     'yorumlanabilir bir öznitelik vektörü tasarlamak; '
     '(2) Sekiz farklı kaynaktan derlenen, 5.195 ses kaydı içeren, '
     'etiketlenmiş ve ön işlemden geçirilmiş bir veri kümesi oluşturmak; '
     '(3) Yedi klasik makine öğrenmesi ve dört derin öğrenme modelini '
     'aynı beş katlı tabakalı çapraz doğrulama protokolüyle değerlendirmek; '
     '(4) Youden J istatistiğiyle her model için optimal karar eşiği belirlemek; '
     '(5) SHAP (TreeExplainer) ile her kararı öznitelik düzeyinde açıklanabilir '
     'kılmak; '
     '(6) Sistemi Next.js 14 web platformu, Kotlin/Jetpack Compose Android uygulaması '
     've FastAPI tabanlı REST API\'ye taşıyarak üretim ortamında çalıştırmak.',
     'PARAGRAF METNİ'),
    ('1.4. BM401–BM498 İki Dönemlik Geliştirme Süreci', 'Heading 2'),
    ('AURIS, tek bir dönemde değil iki ayrı akademik dönemde kademeli olarak '
     'olgunlaşmış bir sistemdir. BM401 Proje Tasarımı dersi (2024–2025 Güz Dönemi) '
     'kapsamında wav2vec2-base transformer modelinden alınan gizli katman '
     'gömme vektörleri üzerine bir LightGBM sınıflandırıcı kurulmuş; '
     'Next.js 14 web platformunun ve Kotlin/Compose Android uygulamasının '
     'temel iskelet yapıları oluşturulmuştur.',
     'PARAGRAF METNİ'),
    ('Güz döneminin sonunda edinilen bulgular, iki temel sorunu gün yüzüne '
     'çıkardı. Birincisi, wav2vec2 gömme vektörleri siyah kutu niteliğinde '
     'olduğundan hangi akustik özelliğin kararı etkilediği anlaşılamamaktaydı. '
     'İkincisi, wav2vec2 büyük ölçüde konuşma verisi üzerinde ön eğitim '
     'almış olduğundan müzik örneklerine genelleme yapma kapasitesi '
     'sınırlı kalıyordu. '
     'Bu iki sorun, BM498 Mezuniyet Tezi (2024–2025 Bahar Dönemi) kapsamında '
     'araştırma odağının kökten değiştirilmesini zorunlu kıldı. '
     'Bahar döneminde wav2vec2 embedding\'leri tamamen bırakılarak el ile '
     'tasarlanmış 47 boyutlu akustik öznitelik vektörüne geçildi; '
     'veri kümesi 5.195 örneğe genişletildi; '
     'on bir model eş protokolle değerlendirildi; '
     'SHAP açıklanabilirlik katmanı eklendi ve sistem üretim ortamına alındı.',
     'PARAGRAF METNİ'),
    ('1.5. Özgün Katkı', 'Heading 2'),
    ('Bu çalışmanın alana özgün katkıları beş başlık altında özetlenebilir. '
     'Birincisi, müziğe özgü tasarlanmış ve fiziksel yorumlanabilirliği yüksek '
     '47 boyutlu akustik öznitelik vektörünün tanımlanmasıdır. '
     'İkincisi, on iki farklı yapay zekâ üretim sistemini kapsayan çok üreticili '
     'bir eğitim veri kümesinin derlenmesidir; bu yaklaşım çapraz-üretici '
     'genelleme sorununa doğrudan yanıt vermektedir. '
     'Üçüncüsü, yedi MO ve dört DÖ modelinin tek ve şeffaf bir protokolle '
     'karşılaştırmalı olarak değerlendirilmesidir. '
     'Dördüncüsü, Youden J eşik optimizasyonu ve SHAP açıklanabilirliğinin '
     'yapay zekâ müzik tespiti bağlamına uyarlanmasıdır. '
     'Beşincisi, tüm bu bileşenlerin web, Android ve API katmanlarında '
     'kamuya açık ve ücretsiz olarak sunulmasıdır.',
     'PARAGRAF METNİ'),
    ('1.6. Tez Organizasyonu', 'Heading 2'),
    ('Tez yedi bölümden oluşmaktadır. Bölüm 2\'de yapay zekâ müzik üretim '
     'sistemleri, ses derin sahteciliği tespiti, transformer tabanlı ses '
     'gösterimleri ve topluluk yöntemlerine ilişkin literatür incelenmektedir. '
     'Bölüm 3\'te AURIS\'in veri kümesi, öznitelik mühendisliği hattı, '
     'sınıflandırma modelleri, eğitim protokolü ve üç katmanlı uygulama '
     'mimarisi ayrıntılı biçimde açıklanmaktadır. '
     'Bölüm 4\'te on bir modelin karşılaştırmalı bulguları, ROC eğrileri, '
     'çapraz doğrulama stabilitesi, LightGBM ayrıntılı analizi ve SHAP '
     'bulguları sunulmaktadır. '
     'Bölüm 5\'te bulgular literatürle tartışılmakta; sınırlamalar '
     'dürüstçe aktarılmaktadır. '
     'Bölüm 6\'da sonuçlar özetlenmekte ve gelecek çalışma önerileri '
     'sıralanmaktadır.',
     'PARAGRAF METNİ'),
]

# ══════════════════════════════════════════════════════════════════════════════
# 2. LİTERATÜR TARAMASI
# ══════════════════════════════════════════════════════════════════════════════
LITERATUR = [
    ('2.1. Yapay Zekâ Müzik Üretim Sistemleri', 'Heading 2'),
    ('Müzik üretiminde yapay zekânın yükselişi, birbirini izleyen üç nesil '
     'model mimarisiyle şekillenmiştir. İlk nesil otoregresif modeller, '
     'sesi ayrık simge dizisi olarak ele almaktadır. '
     'Dhariwal vd. (2020) tarafından geliştirilen Jukebox [4], '
     'hiyerarşik vektör niceleme değişken oto-kodlayıcı (VQ-VAE) '
     'mimarisiyle ham dalga biçiminde çıktı üreten ilk büyük ölçekli '
     'müzik modelidir. 1,2 milyar parametresiyle şarkı sözleri ve '
     'sanatçı stilini koşul olarak alan bu model, dönemin en iddialı '
     'müzik üretim girişimi olarak öne çıkmıştır.',
     'PARAGRAF METNİ'),
    ('İkinci nesil transformer tabanlı modeller, ses kodlayıcı-çözücü '
     'mimarilerini ön plana çıkarmıştır. Meta AI\'ın geliştirdiği '
     'MusicGen (Copet vd., 2023) [5], metin ve melodi koşullandırmasını '
     'EnCodec ses kodlayıcısı üzerine inşa edilmiş decoder-only transformer '
     'ile birleştirmektedir. Model 300 milyon ile 3,3 milyar parametre '
     'arasında üç farklı büyüklükte açık kaynak lisansıyla kamuya sunulmuştur; '
     'bu özelliği onu hem akademik hem de ticari alanda en geniş kullanılan '
     'açık kaynaklı müzik modeli haline getirmiştir.',
     'PARAGRAF METNİ'),
    ('Üçüncü nesil difüzyon tabanlı modeller, latent uzayda yinelemeli '
     'gürültü giderme ilkesiyle çalışmaktadır. '
     'AudioLDM (Liu vd., 2023) [6], CLAP ses-metin gömme vektörleriyle '
     'koşullandırılan latent difüzyon modelini ses üretimine uyarlamıştır. '
     'Stable Audio ve Riffusion da bu paradigmanın ticari ürünleridir. '
     'Bu sistemlerin ürettiği içerikler giderek artan bir insan müziği '
     'benzerliğine ulaşmakta; bu durum tespit görevini giderek '
     'zorlaştırmaktadır.',
     'PARAGRAF METNİ'),
    ('Ticari alanda ise Suno v3/v4/v5 ve Udio, müzik teorisi bilgisi '
     'gerektirmeden şarkı sözlü parçalar üretme kapasitesiyle hızla '
     'yaygınlaşmıştır. Bu çalışmada kullanılan AIME veri kümesi, '
     'Suno v3/v4/v5, Udio, MusicGen, AudioLDM2, Stable Audio, Riffusion, '
     'Mustango, JEN-1, MusicLDM ve Tango dahil on iki farklı sistemi '
     'kapsamaktadır.',
     'PARAGRAF METNİ'),
    ('2.2. Ses Derin Sahteciliği Tespiti', 'Heading 2'),
    ('Yapay zekâ üretimi ses tespitine yönelik akademik çalışmalar, '
     'köken olarak konuşma sentezi ve ses derin sahteciliği alanından '
     'beslenmektedir. Bu alanda en temel kıyaslama veri kümesi, '
     'Frank ve Schönherr (2021) tarafından derlenen WaveFake\'tir [7]; '
     'HiFi-GAN, MelGAN, WaveGlow ve benzeri yedi farklı vocoder '
     'mimarisinin çıktısını içermektedir.',
     'PARAGRAF METNİ'),
    ('Ses derin sahteciliği tespiti alanında düzenlenen ilk uluslararası '
     'yarışma olan ADD 2022 (Yi vd., 2022) [8], üç farklı zorluk '
     'seviyesinde birleşik değerlendirme sağlamıştır. '
     'Martín-Doñas ve Álvarez (2022) [9], yarışmada wav2vec2-base '
     'modelini doğrudan uygulayarak öznitelik mühendisliği gerektirmeden '
     'rekabetçi sonuçlar elde etmiştir; bu çalışma BM401 döneminin '
     'başlangıç ilham kaynağını oluşturmuştur. '
     'Afchar vd. (2025) [1], IEEE ICASSP 2025\'te oto-kodlayıcı '
     'artefaktlarından yararlanan bir yaklaşımla %99,8 doğruluğa '
     'ulaşmış; ancak MP3 sıkıştırma ve perde kaydırma gibi basit '
     'dönüşümlerin bu yüksek doğruluğu önemli ölçüde düşürdüğünü '
     'saptamıştır.',
     'PARAGRAF METNİ'),
    ('Müziğe özgü YZ tespiti ise henüz olgunlaşmakta olan bir alt '
     'alandır. Liu vd. (2024) [3] bu geçiş sürecini sistematik '
     'biçimde ele almış; mevcut çalışmaların büyük bölümünün tek '
     'üreticiye özgü koşullarda başarılı olduğunu, yeni ve görülmemiş '
     'sistemlere genelleme yapamadığını ortaya koymuştur. '
     'Kosta vd. (2025) [10] ise müzik yapısal analizi temelinde '
     'çalışan Segment Transformer mimarisini önermiş; bu yaklaşım '
     'müziğin bölümsel tekrar yapısından yararlanmaktadır.',
     'PARAGRAF METNİ'),
    ('2.3. Transformer Tabanlı Ses Gösterimleri', 'Heading 2'),
    ('Öz-denetimli ses gösterimi öğrenimi, wav2vec2 (Baevski vd., 2020) [11] '
     'ile ivme kazanmıştır. wav2vec2, ham dalga biçiminden CNN ile '
     'bağlamsal göstenim çıkarmakta; ardından gizlenmiş zaman adımlarını '
     'tahmin eden bir transformer ile öz-denetimli ön eğitim uygulamaktadır. '
     '960 saatlik LibriSpeech verisi üzerinde eğitilen bu model, konuşma '
     'tanımada büyük ilerleme sağlamış; ancak müzik verilerine uygulandığında '
     'aktarım öğrenmesinin sınırları belirgin biçimde ortaya çıkmıştır.',
     'PARAGRAF METNİ'),
    ('CLAP (Elizalde vd., 2023) [12], ses ve metin çiftleri üzerinde '
     'karşıtsal öğrenme yürüterek ortak bir gömme uzayı oluşturmaktadır. '
     'LAION-CLAP (Wu vd., 2023) [13], 630.000 ses-metin çiftinden '
     'oluşan büyük ölçekli veri kümesi üzerinde eğitilmiş olup '
     'ses sınıflandırması ve ses benzerliği görevlerinde güçlü '
     'sıfır-atım performansı sergilemektedir. '
     'Bu modeller yüksek genel ses anlama kapasitesi sunmakla birlikte, '
     'tahmin başına SHAP değeri hesaplanmasını güçleştiren siyah kutu '
     'niteliğini korumaktadır; bu durum açıklanabilirlik '
     'gerektiren uygulamalar için belirgin bir sınırlılık oluşturmaktadır.',
     'PARAGRAF METNİ'),
    ('2.4. Topluluk Yöntemleri ve Akustik Öznitelik Tabanlı Sınıflandırma', 'Heading 2'),
    ('El ile tasarlanmış akustik özniteliklere dayalı sınıflandırma, '
     'müzik bilgi erişimi alanında köklü bir yaklaşımdır. '
     'MFCC\'ler onlarca yıldır müzik türü sınıflandırmada temel araç '
     'olarak kullanılmıştır. Gourisaria vd. (2024) [14], MFCC ve STFT '
     'temelli öznitelikleri sistematik biçimde karşılaştırmış; '
     'her iki öznitelik ailesinin birlikte kullanılmasının ayrı ayrı '
     'kullanılmasından belirgin biçimde üstün performans sağladığını '
     'göstermiştir.',
     'PARAGRAF METNİ'),
    ('Topluluk öğrenmesi, tek modelin varyans hatasını azaltarak '
     'müzik görevlerinde tutarlı iyileştirme sağlamaktadır. '
     'Kostrzewa vd. (2022) [15], geniş sinir ağı topluluklarının '
     'müzik türü sınıflandırmasında tek modele kıyasla önemli '
     'kazanım sağladığını ortaya koymuştur. '
     'Gan vd. (2024) [16], VMD tabanlı öznitelik ayrıştırmasıyla '
     'desteklenen XGBoost topluluk modelinin GTZAN veri kümesinde '
     'rekabetçi doğruluk elde ettiğini bildirmiştir. '
     'Liu vd. (2022) [17] ise XGBoost\'u birden fazla öznitelik '
     'grubunun birleşimiyle çalgı tanımaya uygulamıştır.',
     'PARAGRAF METNİ'),
    ('AURIS\'in öznitelik mühendisliği tasarımı bu literatürden '
     'doğrudan beslenmektedir: MFCC tabanlı spektral öznitelikler, '
     'ritmik ve onset öznitelikleri, harmonik öznitelikler ve '
     'müziğe özgü vokal analiz boyutları tek bir vektörde '
     'birleştirilmiştir.',
     'PARAGRAF METNİ'),
    ('2.5. Mevcut YZ Müzik Tespit Sistemleri ve Araştırma Boşlukları', 'Heading 2'),
    ('Günümüzde piyasada birkaç yapay zekâ müzik tespit sistemi '
     'mevcuttur; ancak bunların büyük çoğunluğu akademik '
     'değerlendirmeye kapalıdır. IRCAM Amplify, ücretli API '
     'olarak hizmet sunmakta; eğitim verisi, metodoloji ve '
     'kıyaslama sonuçları kamuyla paylaşılmamaktadır. '
     'Believe AI Radar da benzer şekilde ticari bir erişim modeli '
     'benimsemektedir. Bu sistemlerin akademik karşılaştırması '
     'pratikte mümkün değildir.',
     'PARAGRAF METNİ'),
    ('Akademik çalışmalar incelendiğinde ise belirgin boşluklar '
     'göze çarpmaktadır: Mevcut çalışmaların büyük bölümü '
     'tek üreticinin çıktılarına odaklanmakta, çapraz-üretici '
     'genelleme koşullarında test edilmemektedir. '
     'Açıklanabilirlik konusunda da ciddi bir eksiklik söz konusudur; '
     'hangi akustik özelliğin kararı yönlendirdiği büyük çoğunlukla '
     'belirsiz kalmaktadır. '
     'AURIS, Çizelge 2.1\'de özetlenen bu boşlukları '
     'açık veri kümesi, şeffaf çapraz doğrulama, SHAP açıklanabilirliği '
     've ücretsiz erişim ile kapatmayı hedeflemektedir.',
     'PARAGRAF METNİ'),
    T(
        ['Sistem', 'Erişim', 'Metodoloji Şeffaf', 'Açıklanabilirlik', 'Çok Üretici', 'ROC-AUC'],
        [
            ['IRCAM Amplify', 'Ticari API', 'Hayır', 'Hayır', 'Bilinmiyor', 'Yayımlanmadı'],
            ['Believe AI Radar', 'Ticari', 'Hayır', 'Hayır', 'Bilinmiyor', 'Yayımlanmadı'],
            ['Segment Transformer [10]', 'Akademik', 'Evet', 'Hayır', 'Kısmi', '~0.91'],
            ['WaveFake Detector [7]', 'Akademik', 'Evet', 'Hayır', 'Kısmi', '>0.99 (konuşma)'],
            ['AURIS (bu çalışma)', 'Açık / Ücretsiz', 'Evet', 'SHAP', 'Evet (12+)', '0,9549'],
        ],
        'Çizelge 2.1. Mevcut yapay zekâ müzik tespit sistemlerinin karşılaştırması.',
        col_widths=[3.8, 2.6, 2.8, 2.8, 2.4, 2.1]
    ),
]

# ══════════════════════════════════════════════════════════════════════════════
# 3. MATERYAL VE YÖNTEM
# ══════════════════════════════════════════════════════════════════════════════
MAT_YONT = [
    ('3.1. Sistem Mimarisine Genel Bakış', 'Heading 2'),
    ('AURIS, mimari olarak birbirinden bağımsız ama birlikte çalışan '
     'dört ana modülden oluşmaktadır. '
     'İlk modül olan Ses Ön İşleme; MP3, WAV, FLAC ve OGG formatlarını '
     'standartlaştırarak 22.050 Hz mono sinyale dönüştürür, '
     'YouTube bağlantılarından yt-dlp ile ses indirir ve '
     'mikrofon girişini doğrudan kabul eder. '
     'İkinci modül olan Öznitelik Çıkarma; librosa v0.10.1 ile '
     '47 boyutlu akustik vektörü hesaplar ve bunu StandardScaler '
     'ile normalleştirir. '
     'Üçüncü modül olan Sınıflandırma; eğitilmiş LightGBM modelini '
     '(model_lightgbm.pkl, 1 MB) yükler, Youden J eşiğini uygular '
     've YZ ya da İnsan kararı verir. '
     'Dördüncü modül olan Açıklama; SHAP TreeExplainer ile '
     'öznitelik katkılarını hesaplar ve Türkçe açıklama metni üretir.',
     'PARAGRAF METNİ'),
    ('Sistemin arka ucu hf-crowncode-backend dizininde, '
     'hizmet odaklı mimari (Service-Oriented Architecture) anlayışıyla '
     'düzenlenmiştir. Her işlev bağımsız bir servis sınıfına atanmıştır: '
     'feature_extractor.py spektral ve zamansal hesaplamaları, '
     'vocal_analyzer.py vokal analizini, '
     'inference_xai.py sınıflandırma ve SHAP hesaplamalarını, '
     'score_fusion.py farklı kaynaklardan gelen puanların '
     'birleştirilmesini yönetmektedir. '
     'Bu ayrıştırma, her bileşenin bağımsız olarak test edilmesini '
     've ileride değiştirilmesini kolaylaştırmaktadır.',
     'PARAGRAF METNİ'),
    ('3.2. Veri Kümesi', 'Heading 2'),
    ('3.2.1. Derleme Stratejisi', 'Heading 3'),
    ('Veri kümesi oluşturulurken iki temel ilke benimsenmiştir: '
     'köken tabanlı otomatik etiketleme ve lisans uyumu. '
     'Bilinen yapay zekâ üretim platformlarından indirilen parçalar '
     '"1" (YZ), kamuya açık insan müziği arşivlerinden derlenenler '
     '"0" (İnsan) olarak etiketlenmiştir. '
     'Tüm kaynaklar Creative Commons lisansı kapsamındadır. '
     'Veri sızıntısını engellemek amacıyla ses dosyasının uzunluğu '
     '(duration_sec) ve örnekleme hızı (sample_rate) gibi meta veri '
     'alanları öznitelik vektörünün dışında tutulmuştur; '
     'bu alanlar öznitelik olarak kullanılsaydı model eğitim '
     'kümesindeki ses sürelerini ezberleyebilirdi.',
     'PARAGRAF METNİ'),
    ('Veri kümesini oluşturmak için önce HuggingFace Hub üzerindeki '
     'uygun veri kümeleri taranmış; dataset_loader.py ve '
     'download_datasets.py scriptleri ile streaming modunda '
     'veriler indirilmiştir. '
     'extract_features_batch.py ile her ses dosyasına 47 öznitelik '
     'çıkarılmış; sonuçlar DataSet/features.csv dosyasında '
     '(4,1 MB, 5.195 satır × 49 sütun) saklanmıştır. '
     'compute_feature_stats.py ise öznitelik ortalama ve standart '
     'sapmalarını hesaplayarak feature_stats_v1.json dosyasına '
     'yazmıştır; bu dosya çıkarım sırasında ölçekleme için kullanılmaktadır.',
     'PARAGRAF METNİ'),
    ('3.2.2. Kaynak Dağılımı', 'Heading 3'),
    ('Toplam 5.195 ses kaydının 3.113\'ü (%59,9) insan, '
     '2.082\'si (%40,1) yapay zekâ üretimidir. '
     'Yapay zekâ tarafında üç ana HuggingFace veri kümesi kullanılmıştır: '
     'SleepyJesse/ai_music_large on iki farklı üretim sistemini kapsayan '
     'yaklaşık 2.000 parçayı, disco-eth/AIME Suno v3/v4/v5, Udio, '
     'MusicGen, AudioLDM2 ve diğerlerini içeren yaklaşık 1.000 parçayı, '
     'zuhri025/suno-audio ise yalnızca Suno modelinden '
     'yaklaşık 500 parçayı kapsamaktadır. '
     'İnsan tarafında marsyas/gtzan on müzik türünden 999 parçayı, '
     'benjamin-paine/free-music-archive-small yaklaşık 1.000 parçayı '
     've SleepyJesse arşivinin insan bölünümü yaklaşık 2.000 parçayı '
     'temsil etmektedir. '
     'Çizelge 3.1\'de kaynak dağılımı ayrıntılı olarak verilmektedir.',
     'PARAGRAF METNİ'),
    T(
        ['Kaynak', 'Tür', 'Örnek Sayısı', 'Üretici/Arşiv'],
        [
            ['SleepyJesse/ai_music_large', 'YZ', '~2.000', '12+ sistem'],
            ['disco-eth/AIME', 'YZ', '~1.000', 'Suno/Udio/MusicGen/AudioLDM2'],
            ['zuhri025/suno-audio', 'YZ', '~500', 'Suno v3-v5'],
            ['Ek YZ kaynaklar', 'YZ', '~500', 'Çeşitli'],
            ['marsyas/gtzan', 'İnsan', '999', 'GTZAN (10 tür)'],
            ['free-music-archive-small', 'İnsan', '~1.000', 'FMA Küçük'],
            ['SleepyJesse insan', 'İnsan', '~2.000', 'Çeşitli insan arşivleri'],
            ['Toplam', '—', '5.195', '59,9% İnsan / 40,1% YZ'],
        ],
        'Çizelge 3.1. Veri kümesi kaynak dağılımı (8 kaynak, 5.195 ses kaydı).',
        col_widths=[4.5, 2.0, 3.0, 5.0]
    ),
    F(f'{FIG}/feature_distribution_ai_vs_human.png',
      'Şekil 3.1. YZ ve İnsan müziği — ilk sekiz özniteliğin dağılım karşılaştırması (5.195 örnek).', 15.0),
    ('Şekil 3.2\'de kaynak bazlı LightGBM performansı gösterilmektedir. '
     'Suno YZ örnekleri 0,930 doğrulukla en yüksek ayrım kolaylığını sunarken, '
     'Deepfake seti 0,500 ile en zorlu kaynak olarak öne çıkmaktadır. '
     'GTZAN insan örnekleri 0,932 ile en yüksek insan sınıfı doğruluğunu '
     'sağlamaktadır.', 'PARAGRAF METNİ'),
    F(f'{FIG}/per_source_performance.png',
      'Şekil 3.2. Kaynak bazlı performans — LightGBM, θ*=0,4316 (5 katlı CV tahminleri).', 14.5),
    ('3.2.3. Ön İşleme Hattı', 'Heading 3'),
    ('Her ses dosyası öznitelik çıkarmadan önce beş adımlık '
     'standartlaştırma hattından geçmektedir. '
     'Birinci adımda librosa.load() işlevi sr=22050 parametresiyle '
     'çağrılarak dosya 22.050 Hz\'e yeniden örneklenmekte '
     've mono\'ya dönüştürülmektedir; bu değer librosa\'nın '
     'varsayılan örnekleme hızıdır ve STFT ile Mel filtresi '
     'hesaplamalarında tutarlılık sağlamaktadır. '
     'İkinci adımda kayıt 30 saniyeyi aşıyorsa orta 30 saniye '
     'kırpılmakta, 30 saniyeden kısa ise sıfır dolgu '
     'uygulanmaktadır; böylece tüm öznitelik hesaplamaları '
     'eşit uzunlukta sinyal üzerinde gerçekleşmektedir. '
     'Üçüncü adımda RMS enerjisi 1×10⁻⁶\'nın altında olan '
     've 1 saniyeden kısa kayıtlar veri kümesinden çıkarılmaktadır. '
     'Dördüncü adımda öznitlik çıkarma sırasında ölçüm birimleri '
     'farklı olan sütunlar StandardScaler ile normalleştirilmektedir; '
     'scaler yalnızca eğitim katlamasına fit edilmekte, '
     'doğrulama katlamasına transform uygulanmaktadır. '
     'Beşinci adımda normalize edilmiş vektör modele iletilmektedir.',
     'PARAGRAF METNİ'),
    ('3.3. Öznitelik Mühendisliği', 'Heading 2'),
    ('3.3.1. Tasarım Felsefesi', 'Heading 3'),
    ('Öznitelik setinin tasarımında iki temel hedef güdülmüştür: '
     'ayrımcı güç ve yorumlanabilirlik. '
     'Wav2vec2 gömme vektörlerinin aksine, '
     'her özniteliğin fiziksel bir karşılığı vardır ve '
     'SHAP değerleriyle hangi özelliğin kararı yönlendirdiği '
     'açıkça ortaya konabilmektedir. '
     'Öznitelikler beş kategoride gruplanmıştır: '
     'Spektral özellikler frekans boyutundaki enerji dağılımını, '
     'zamansal özellikler zaman boyutundaki enerji dinamiğini, '
     'onset/beat özellikleri ritmik yapıyı, '
     'harmonik özellikler tonal içeriği, '
     'vokal özellikler ise insan sesi bileşenini '
     'temsil etmektedir. '
     'Bu çok boyutlu bakış açısı, '
     'YZ üretim sistemlerinin hangi akustik boyutlarda '
     'iz bıraktığını sistematik olarak araştırmayı sağlamaktadır.',
     'PARAGRAF METNİ'),
    ('3.3.2. Öznitelik Kategorileri ve Hesaplama Yöntemi', 'Heading 3'),
    ('Spektral kategorideki 16 öznitelik, sesin frekans '
     'boyutundaki yapısını betimlemektedir. '
     'spectral_centroid, enerji ağırlıklı ortalama frekansı '
     'ölçmekte; YZ sistemlerinin ürettiği parlak ve tiz sesleri '
     'insan müziğinden ayırt etmede katkı sağlamaktadır. '
     'spectral_flatness, tonal ses ile gürültü benzeri ses '
     'arasındaki farkı yakalamaktadır; bu öznitelik SHAP '
     'analizinde en yüksek kazanım skoruna (0,0619) ulaşmıştır. '
     'spectral_contrast, komşu frekans bantları arasındaki '
     'enerji farkını ölçmekte ve tonal zenginliği '
     'sayısallaştırmaktadır. '
     'MFCC delta ve delta-delta varyansları ise '
     'spektral zarfın zamansal değişim hızını modellemektedir.',
     'PARAGRAF METNİ'),
    ('Zamansal ve ritmik öznitelikler sinyalin '
     'zaman boyutundaki güç dinamiğini betimlemektedir. '
     'rms_energy parçanın ortalama ses düzeyini, '
     'rms_dynamic_range ise dinamik aralığı ölçmektedir; '
     'YZ sistemlerinin genellikle daha sıkıştırılmış '
     'dinamik aralık sergilediği gözlemlenmiştir. '
     'tempo_bpm ve tempo_stability, ritmik düzenliliği '
     'sayısallaştırmaktadır; metronom benzeri sabit tempoya '
     'sahip YZ parçaları insan yorumundaki mikro-zamansal '
     'dalgalanmalardan bu yolla ayrışmaktadır. '
     'zero_crossing_rate, sinyalin sıfır ekseni kesme hızını '
     'ölçmekte; gürültülü ya da perküsif sesler ile '
     'tonal sesler arasındaki farkı yakalamaktadır.',
     'PARAGRAF METNİ'),
    ('Vokal öznitelikler, vocal_analyzer.py içindeki '
     'VocalFeatures sınıfı aracılığıyla hesaplanmaktadır. '
     'Bu sınıf önce librosa\'nın harmonik-perküsif ses ayrıştırması '
     '(HPSS) ile vokal bileşeni izole etmekte; '
     'ardından perde (pitch), vibrato hızı ve genişliği, '
     'formant tutarlılığı ve nefes örüntüsü analizini '
     'sırasıyla uygulamaktadır. '
     'YZ sistemleri insan sesini taklit etmekle birlikte '
     'vibrato düzenliliği ve formant geçiş örüntülerinde '
     'tutarsızlıklar sergileme eğilimindedir; '
     'bu öznitelikler bu farkı sayısallaştırmayı amaçlamaktadır.',
     'PARAGRAF METNİ'),
    T(
        ['Kategori', 'Öznitelik Sayısı', 'Örnek Öznitelikler'],
        [
            ['Spektral', '16', 'spectral_flatness_std, spectral_contrast_mean, mfcc_delta_var'],
            ['Zamansal/Ritmik', '10', 'rms_energy, tempo_bpm, tempo_stability, zero_crossing_rate'],
            ['Onset/Beat', '9', 'onset_strength_mean, onset_strength_std, beat_count, ibi_stability'],
            ['Harmonik/Tonal', '8', 'chroma_entropy, chroma_std, tonnetz_std, harmonic_ratio'],
            ['Vokal/İfadesel', '4', 'pitch_stability_score, vibrato_regularity, formant_consistency'],
            ['Toplam', '47', '—'],
        ],
        'Çizelge 3.2. 47 boyutlu akustik öznitelik vektörü — kategori özeti.',
        col_widths=[4.0, 3.5, 8.0]
    ),
    ('Şekil 3.3\'te öznitelikler arası Pearson korelasyon ısı haritası '
     'sunulmaktadır. Koyu turuncu hücreler güçlü pozitif korelasyonu temsil '
     'etmektedir; spektral öznitelikler kendi aralarında kümelenirken '
     'vokal öznitelikler ayrı bir küme oluşturmaktadır.', 'PARAGRAF METNİ'),
    F(f'{FIG}/feature_correlation_heatmap.png',
      'Şekil 3.3. Öznitelik korelasyon ısı haritası — Pearson r, 5.195 parça üzerinden hesaplanmıştır.', 14.0),
    ('3.3.2. Öznitelik Ablasyon Analizi', 'Heading 3'),
    ('Şekil 3.4\'te LightGBM doğruluğunun öznitelik sayısına göre değişimi '
     'gösterilmektedir. Öznitelikler öneme göre (SHAP gain sıralaması) '
     'seçilmiştir. Tek öznitelikle 0,598 olan doğruluk değeri 20 öznitelikte '
     '0,880\'e, 47 öznitelikte 0,884\'e ulaşmaktadır. Eğrinin 20 öznitelik '
     'civarında doyuma ulaşması öznitelik vektörünün büyük bölümünün '
     'ayrımcı bilgi taşıdığını göstermektedir.', 'PARAGRAF METNİ'),
    F(f'{FIG}/feature_ablation_curve.png',
      'Şekil 3.4. Öznitelik çıkarma eğrisi — LightGBM doğruluğu vs. öznitelik sayısı (SHAP öneme göre sıralı).', 14.0),
    ('3.4. Sınıflandırma Modelleri', 'Heading 2'),
    ('3.4.1. Klasik Makine Öğrenmesi Modelleri', 'Heading 3'),
    ('Tüm MO modelleri train_classifier.py içindeki '
     '_build_candidate_families() işlevi tarafından '
     'tanımlanmıştır. Model ailesi tasarımında karşılaştırma '
     'kapsamını geniş tutmak ve birbirinden bağımsız öğrenme '
     'yaklaşımlarını temsil etmek hedeflenmiştir.',
     'PARAGRAF METNİ'),
    ('Lojistik Regresyon, doğrusal bir temel oluşturmaktadır: '
     'L2 düzenlileştirme, C=2,0, class_weight=balanced, '
     'çözücü=lbfgs, max_iter=1000. '
     'Bu model yorumlanabilirlik açısından güçlüdür '
     'ancak doğrusal olmayan sınır yüzeylerini '
     'modelleyemediğinden performansı sınırlı kalmaktadır. '
     'Rastgele Orman 500 karar ağacından oluşmakta, '
     'max_features=log2 ve class_weight=balanced '
     'parametreleriyle eğitilmektedir. '
     'Yüksek öznitelik boyutunda topluluk varyansını azaltmada '
     'etkili olmakla birlikte eğitim setinde aşırı öğrenme '
     'eğilimi sergilemiştir (eğitim doğruluğu ≈%100, '
     'CV doğruluğu ≈%86).',
     'PARAGRAF METNİ'),
    ('Gradyan Artırma (scikit-learn GradientBoostingClassifier), '
     'n_estimators=180, max_depth=4, learning_rate=0,07 ile '
     'eğitilmiştir. '
     'SVM-RBF, C=10 ve gamma=0,05 ile yapılandırılmış; '
     'CalibratedClassifierCV sarmalayıcısı eklenmiştir. '
     'Bu sarmalayıcı, ham SVM karar skorlarını geçerli '
     'olasılık değerlerine dönüştürmektedir; '
     'Youden J eşiği hesaplaması için olasılık çıktısı zorunludur. '
     'Çok Katmanlı Algılayıcı (scikit-learn MLP) '
     'gizli_katmanlar=[192, 96, 32], aktivasyon=relu, '
     'alpha=0,001 ile eğitilmiştir.',
     'PARAGRAF METNİ'),
    ('XGBoost (Chen ve Guestrin, 2016) [20], n_estimators=240, '
     'max_depth=5, learning_rate=0,06, subsample=0,85, '
     'colsample_bytree=0,8, scale_pos_weight=1,5 ve '
     'eval_metric=auc parametreleriyle yapılandırılmıştır. '
     'LightGBM (Ke vd., 2017) [21] ise n_estimators=300, '
     'num_leaves=31, learning_rate=0,05, class_weight=balanced '
     've verbose=-1 ile eğitilmiştir; '
     'eğitim süresi yalnızca 2,95 saniyedir. '
     'Tüm modeller pickle biçiminde kaydedilmiş '
     '(model_lightgbm.pkl ≈1 MB, '
     'model_random_forest.pkl ≈49 MB en büyük dosya) '
     've çıkarım sırasında doğrudan yüklenmiştir.',
     'PARAGRAF METNİ'),
    ('3.4.2. Derin Öğrenme Modelleri', 'Heading 3'),
    ('Dört derin öğrenme modeli train_deep_classifiers.py ile '
     'PyTorch [18] çerçevesinde tasarlanmıştır. '
     'Tüm modellerde kayıp işlevi olarak BCEWithLogitsLoss '
     '(pos_weight=1,5, sınıf dengesizliğini telafi etmek için) '
     've optimize edici olarak Adam (lr=1×10⁻³) kullanılmıştır. '
     'Erken durdurma patience=10, izleme kriteri val_loss '
     'olarak ayarlanmıştır.',
     'PARAGRAF METNİ'),
    ('Derin ÇKA (Deep MLP), tam bağlantılı katmanlar dizisinden '
     'oluşmaktadır: Giriş(47) → FC(512) → BN → ReLU → Drop(0,3) '
     '→ FC(256) → BN → ReLU → Drop(0,3) → FC(128) → BN → ReLU '
     '→ FC(64) → ReLU → FC(1). '
     'BatchNorm katmanları gradyan patlamasını önlerken '
     'Dropout(0,3) aşırı öğrenmeye karşı düzenlileştirme sağlamaktadır. '
     'Toplam eğitim süresi 81,4 saniyedir.',
     'PARAGRAF METNİ'),
    ('1B Evrişimli Sinir Ağı (1B-ESA), '
     '47 boyutlu vektörü (1, 47) boyutlu tek kanallı sinyal '
     'olarak ele alır: Conv1D(1→32, çekirdek=3) → ReLU → '
     'Conv1D(32→64, çekirdek=3) → ReLU → Conv1D(64→128, çekirdek=3) '
     '→ ReLU → GlobalAvgPool → FC(128→1). '
     'Bu mimari, komşu özniteliklerin yerel örüntülerini '
     'yakalamayı hedeflemektedir; ancak 47 boyutlu düz vektörde '
     'komşu özniteliklerin anlamlı yerel korelasyon '
     'sergilemediği görülmüş ve bu durum modelin zayıf '
     'performansını açıklamaktadır (AUC=0,8442).',
     'PARAGRAF METNİ'),
    ('Artık ÇKA (ResidualMLP), üç artık blok içermektedir; '
     'her blok FC(64) → BN → ReLU → FC(64) → BN yapısında '
     'olup blok girişini çıkışa eklemektedir (atlama bağlantısı). '
     'Dikkat ÇKA (AttentionMLP) ise 47 boyutlu vektörü '
     'token dizisi olarak yorumlayarak tek başlıklı öz-dikkat '
     '(64 boyut) uygulamakta; ardından iki katmanlı '
     'ileri beslemeli ağa geçmektedir.',
     'PARAGRAF METNİ'),
    T(
        ['Model', 'Tür', 'Temel Mimari', 'Eğitim Süresi (sn)'],
        [
            ['LightGBM', 'MO', 'Gradyan artırma, yaprak-düzeyinde büyüme', '2,95'],
            ['XGBoost', 'MO', 'Gradyan artırma, derinlik-öncelikli büyüme', '13,2'],
            ['Rastgele Orman', 'MO', '500 karar ağacı topluluğu', '8,4'],
            ['Gradyan Artırma', 'MO', 'scikit-learn GB, 180 ağaç', '42,1'],
            ['SVM-RBF', 'MO', 'Çekirdek SVM + kalibrasyon', '18,6'],
            ['ÇKA Sinir Ağı', 'MO', 'MLP [192,96,32], relu', '6,2'],
            ['Lojistik Regresyon', 'MO', 'L2 doğrusal model', '0,8'],
            ['Derin ÇKA', 'DÖ', 'MLP [512,256,128,64], BatchNorm+Dropout', '81,4'],
            ['1B-ESA', 'DÖ', '1D CNN + GlobalAvgPool', '125,0'],
            ['Artık ÇKA', 'DÖ', '3× artık blok (64 dim)', '128,7'],
            ['Dikkat ÇKA', 'DÖ', 'Öz-dikkat (64 dim) + FF', '149,6'],
        ],
        'Çizelge 3.3. 11 modelin mimari özeti ve eğitim süreleri.',
        col_widths=[3.8, 1.5, 6.2, 4.0]
    ),
    ('3.5. Eğitim Protokolü', 'Heading 2'),
    ('3.5.1. 5 Katlı Tabakalı Çapraz Doğrulama', 'Heading 3'),
    ('Tüm modeller tek bir pipeline üzerinden '
     'StratifiedKFold(n_splits=5, shuffle=True, random_state=42) '
     'ile değerlendirilmiştir. Tabakalama her katlamada '
     'sınıf oranını (%59,9 İnsan / %40,1 YZ) korumakta; '
     'böylece küçük katlamada dahi dengesiz sınıf sorunuyla '
     'karşılaşılmamaktadır. '
     'Normalizasyon için StandardScaler, her katlamada yalnızca '
     'o katlamanın eğitim alt kümesine fit() edilmiş, '
     'doğrulama alt kümesine yalnızca transform() uygulanmıştır; '
     'bu sızdırmaz boru hattı veri sızıntısını önlemektedir.',
     'PARAGRAF METNİ'),
    ('Değerlendirme sürecinde her katlama için beş metrik '
     'hesaplanmıştır: doğruluk, kesinlik, duyarlılık, F1 skoru '
     've ROC-AUC. Ek olarak her katlama için gerçek-tutulan '
     '(out-of-fold) tahmin skorları toplanmış; '
     'bu skorlar birleştirilerek ROC eğrisi ve karışıklık '
     'matrisi elde edilmiştir. '
     'Bu yaklaşım, tek bir katlama sonucuna göre değil '
     'tüm veri üzerinde dağıtılmış tahminlere göre '
     'değerlendirme yapmayı mümkün kılmaktadır. '
     'Şekil 3.5\'te eğitim ve çapraz doğrulama doğrulukları '
     'karşılaştırılmaktadır; aşırı öğrenme eğilimi gösteren '
     'modeller açıkça görülmektedir.',
     'PARAGRAF METNİ'),
    F(f'{FIG}/train_val_gap.png',
      'Şekil 3.5. Eğitim ve çapraz doğrulama doğruluğu karşılaştırması — aşırı öğrenme tanısı (11 model).', 15.0),
    ('3.5.2. Hiperparametre Seçimi', 'Heading 3'),
    ('Hiperparametreler, train_classifier.py içindeki '
     '_select_best_candidates() işlevi aracılığıyla '
     'belirlenmiştir. Her model ailesi için küçük ölçekli '
     'arama ızgarası tanımlanmış; 3 katlı ön değerlendirme '
     'ile en iyi aday seçilmiş ve ardından 5 katlı tam '
     'değerlendirmeye alınmıştır. '
     'Sınıf dengesizliği (İnsan:%59,9 / YZ:%40,1) class_weight=balanced '
     'veya pos_weight=1,5 parametresiyle giderilmiştir.',
     'PARAGRAF METNİ'),
    ('3.5.3. Youden J Eşik Optimizasyonu', 'Heading 3'),
    ('Makine öğrenmesi sınıflandırıcıları varsayılan olarak '
     '0,5 olasılık eşiğini kullanmaktadır. '
     'Ancak bu çalışmada sınıf dengesizliği ve asimetrik '
     'hata maliyetleri (YZ\'yi kaçırmak ile insan müziğini '
     'yanlış etiketlemek farklı sonuçlar doğurur) '
     'nedeniyle Youden J istatistiği kullanılmıştır. '
     'Her katlama için θ* = argmax_θ (Duyarlılık(θ) + Özgüllük(θ) − 1) '
     'formülüyle optimal eşik belirlenmekte; '
     'beş katlamanın θ* değerleri ortalaması alınmaktadır. '
     'LightGBM için bu süreç θ* = 0,4316 sonucunu vermiştir; '
     'bu değer inference_xai.py içindeki sınıflandırma mantığında '
     'doğrudan kullanılmaktadır.',
     'PARAGRAF METNİ'),
    ('Şekil 3.6\'da eşik taraması grafiği sunulmaktadır. '
     'Kesinlik eğrisi θ arttıkça yükselirken Duyarlılık '
     'azalmakta; F1 ve Doğruluk eğrileri θ*=0,4316\'da '
     'birlikte tepe noktasına ulaşmaktadır. '
     'Varsayılan 0,5 eşiğine kıyasla Youden eşiği daha '
     'dengeli bir hata profili sağlamaktadır.',
     'PARAGRAF METNİ'),
    F(f'{FIG}/threshold_sweep.png',
      'Şekil 3.6. Eşik taraması — Kesinlik/Duyarlılık/F1 eşiğe göre (LightGBM, θ*=0,4316).', 14.5),
    ('3.6. SHAP Açıklanabilirlik Entegrasyonu', 'Heading 2'),
    ('SHAP (Shapley Additive exPlanations, Lundberg ve Lee, 2017) [19], '
     'oyun teorisindeki Shapley değerlerini makine öğrenmesi '
     'açıklanabilirliğine uyarlamaktadır. '
     'Her özniteliğin modelin çıktısına katkısı, '
     'diğer tüm öznitelik kombinasyonları üzerinden '
     'ağırlıklı ortalama marginal katkı olarak hesaplanmaktadır. '
     'Bu yaklaşımın LightGBM için kullanılan TreeExplainer '
     'varyantı ağaç yapısından yararlanarak SHAP değerlerini '
     'polinom zamanda hesaplamakta; '
     'ortalama 47 öznitelik için tahmin başına ≈12 ms '
     'gecikme sağlamaktadır.',
     'PARAGRAF METNİ'),
    ('inference_xai.py içindeki XAI servisi, her analiz için '
     'dört tür açıklama üretmektedir: '
     'Birincisi, SHAP değer vektörü; '
     'hangi özniteliğin kararı hangi yönde ve ne ölçüde '
     'etkilediğini sayısal olarak ortaya koymaktadır. '
     'İkincisi, güven bandı (confidenceBand); '
     'tahmin olasılığının düşük, orta veya yüksek güvenirlik '
     'bölgesinde olduğunu belirtmektedir. '
     'Üçüncüsü, model oylaması; yedi MO modelinin bireysel '
     'kararları ile bunların çoğunluk oyunu. '
     'Dördüncüsü, insan tarafından okunabilir Türkçe/İngilizce '
     'açıklama metni; örneğin "Yüksek spectral_flatness_std '
     'değeri, spektral yapının yapay zekâ üretim izlerini '
     'taşıdığına işaret etmektedir." biçiminde.',
     'PARAGRAF METNİ'),
    ('3.7. REST API Mimarisi', 'Heading 2'),
    ('AURIS\'in arka ucu FastAPI [18] çerçevesiyle '
     'Python 3.11 üzerinde geliştirilmiş; '
     'HuggingFace Spaces ortamında 7860 portunda '
     'uvicorn ASGI sunucusuyla çalıştırılmaktadır. '
     'API beş ana rota sunmaktadır: '
     'GET /api/health sistem sağlık durumunu döndürmekte; '
     'POST /api/analyze ana analiz rotasını oluşturmaktadır.',
     'PARAGRAF METNİ'),
    ('POST /api/analyze endpoint\'i multipart/form-data '
     'biçiminde istek almakta; sourceType alanı '
     '"youtube", "file", "tiktok", "instagram", '
     '"soundcloud" veya "twitter" değerlerinden birini '
     'içerebilmektedir. '
     'YouTube seçildiğinde url alanındaki bağlantıdan '
     'yt-dlp kütüphanesiyle ses indirilmekte; '
     'dosya yüklemede ise python-multipart ile '
     'geçici dizine kaydedilmektedir. '
     'Yanıt JSON nesnesi isAIGenerated (bool), '
     'confidence (0-1 arası float), processingTime, '
     'vocalAnalysis, towerScores ve xai alt nesnesini '
     'içermektedir; xai altında probability, threshold, '
     'confidenceBand, modelVotes ve topContributions '
     'listelenmektedir.',
     'PARAGRAF METNİ'),
    T(
        ['Rota', 'Yöntem', 'Girdi', 'Çıktı'],
        [
            ['/api/health', 'GET', '—', 'Sistem durumu, model yüklü mü'],
            ['/api/analyze', 'POST', 'sourceType, url veya file', 'isAIGenerated, confidence, SHAP, modelVotes'],
            ['/api/data_processing', 'POST', 'Ses dosyası', 'Ham öznitelik vektörü (47 boyut)'],
            ['/api/commend', 'POST', 'YouTube URL', 'Gemini ile oluşturulan yorum önerileri'],
        ],
        'Çizelge 3.4. AURIS FastAPI REST API endpoint özeti.',
        col_widths=[4.0, 2.0, 5.5, 5.0]
    ),
    ('3.8. Web Platformu', 'Heading 2'),
    ('Web platformu Next.js 14 ve TypeScript ile geliştirilmiş; '
     'Netlify CDN üzerinde statik dağıtım yapılmaktadır. '
     'Platform pages/ dizininde on dört sayfa barındırmakta; '
     'merkezi sayfa ai-music-detection/index.tsx\'dir. '
     'Bu sayfa üç sekme sunmaktadır: '
     'Dosya Yükleme (MP3/WAV/FLAC/OGG, ≤50 MB), '
     'YouTube URL girişi ve Mikrofon Kaydı.',
     'PARAGRAF METNİ'),
    ('Her sekmenin arkasında bağımsız bir özel kanca (hook) '
     'çalışmaktadır: useFileAnalysis.ts, useYouTubeAnalysis.ts '
     've useMicrophoneAnalysis.ts. '
     'Bu kancalar asenkron API isteklerini useAsyncRequest.ts '
     'üzerinden yönetmekte; sonuçları AnalysisResultCard '
     'bileşenine aktarmaktadır. '
     'Analiz geçmişi useLocalHistory.ts ile tarayıcı '
     'yerel depolama alanına kaydedilmektedir. '
     'Arayüz React 19.2.5, Tailwind CSS 3.4 ve '
     'motion (Framer Motion fork) animasyon kütüphanesiyle '
     'oluşturulmuştur.',
     'PARAGRAF METNİ'),
    F(f'{SCR}/auris_web_hero.png',
      'Şekil 3.7. AURIS web platformu ana sayfası — dosya yükleme sekmesi (Next.js 14, Netlify CDN).', 14.5),
    F(f'{SCR}/auris_web_sec1.png',
      'Şekil 3.8. AURIS web platformu — YouTube analiz sekmesi ve sonuç kartı.', 14.5),
    ('3.9. Android Uygulaması', 'Heading 2'),
    ('Android uygulaması Kotlin ve Jetpack Compose ile '
     'MVVM/Clean Architecture deseni kullanılarak geliştirilmiştir. '
     'Minimum hedef Android API 26 (Android 8.0 Oreo)\'dır; '
     'bu düzey Türkiye\'deki aktif Android cihazlarının '
     '%90\'ından fazlasını kapsamaktadır. '
     'Mimari üç katmandan oluşmaktadır: '
     'Sunum katmanında Jetpack Compose ekranları ve '
     'ViewModel sınıfları; '
     'Alan katmanında kullanım senaryosu (use case) sınıfları '
     've alan modelleri; '
     'Veri katmanında Retrofit HTTP istemcisi, '
     'Room veritabanı ve repository uygulamaları bulunmaktadır.',
     'PARAGRAF METNİ'),
    ('AiMusicViewModel, AiMusicUiState sealed arayüzü '
     'aracılığıyla kullanıcı arayüzü durumunu yönetmektedir. '
     'Bu arayüzün dört durumu vardır: '
     'Idle (başlangıç), Processing (analiz devam ediyor), '
     'Success (sonuç hazır) ve Error (hata mesajı). '
     'Processing durumu ise ProcessingStep numaralandırmasıyla '
     'daha da ayrıştırılmıştır: VALIDATING, UPLOADING, '
     'ANALYZING ve COMPLETE adımları sırayla kullanıcıya '
     'ilerleme çubuğu ve metin olarak sunulmaktadır. '
     'Arka planda AnalyzeAudioUseCase, AnalysisRepositoryImpl '
     'üzerinden Retrofit ile /api/analyze endpoint\'ini '
     'çağırmakta; AnalysisHistoryUseCase ise geçmiş '
     'analizleri Room veritabanından HistoryScreen\'e sunmaktadır.',
     'PARAGRAF METNİ'),
    F(f'{SCR}/auris_mobile_hero.png',
      'Şekil 3.9. AURIS Android uygulaması ana ekranı (Kotlin/Jetpack Compose, API 26+).', 7.5),
    F(f'{SCR}/auris_mobile_upload.png',
      'Şekil 3.10. AURIS Android analiz ekranı — yükleme ilerlemesi ve sonuç görünümü.', 7.5),
]

# ══════════════════════════════════════════════════════════════════════════════
# 4. BULGULAR
# ══════════════════════════════════════════════════════════════════════════════
BULGULAR = [
    ('4.1. Model Karşılaştırma Sonuçları', 'Heading 2'),
    ('Tablo 4.1\'de 5.195 örnek ve 47 öznitelik üzerinde 5 katlı çapraz '
     'doğrulamayla elde edilen tüm 11 modelin ROC-AUC\'a göre sıralı '
     'performans değerleri sunulmaktadır. LightGBM 0,9549 ROC-AUC ile '
     'birinci, Derin ÇKA 0,9537 ile ikinci, XGBoost 0,9463 ile üçüncü '
     'sıradadır; 1B-ESA 0,8442 ile en düşük AUC\'u sergilemiştir.',
     'PARAGRAF METNİ'),
    T(
        ['Model', 'Tür', 'Doğruluk', 'F1 Skoru', 'ROC-AUC', 'Eğitim (sn)'],
        [
            ['LightGBM', 'MO', '0,8839', '0,8575', '0,9549', '2,95'],
            ['Derin ÇKA', 'DÖ', '0,8849', '0,8596', '0,9537', '81,4'],
            ['XGBoost', 'MO', '0,8735', '0,8402', '0,9463', '13,2'],
            ['Artık ÇKA', 'DÖ', '0,8756', '0,8476', '0,9453', '128,7'],
            ['Gradyan Artırma', 'MO', '0,8685', '0,8337', '0,9406', '42,1'],
            ['Rastgele Orman', 'MO', '0,8604', '0,8183', '0,9393', '8,4'],
            ['Dikkat ÇKA', 'DÖ', '0,8628', '0,8293', '0,9356', '149,6'],
            ['SVM-RBF', 'MO', '0,8612', '0,8252', '0,9347', '18,6'],
            ['ÇKA Sinir Ağı', 'MO', '0,8545', '0,8189', '0,9258', '6,2'],
            ['Lojistik Regresyon', 'MO', '0,7779', '0,7390', '0,8511', '0,8'],
            ['1B-ESA', 'DÖ', '0,7665', '0,7159', '0,8442', '125,0'],
        ],
        'Çizelge 4.1. 11 modelin 5 katlı CV performans karşılaştırması (ROC-AUC\'a göre sıralı).',
        col_widths=[3.5, 1.5, 2.5, 2.5, 2.5, 3.0]
    ),
    ('Şekil 4.1\'de tüm 11 modelin Doğruluk, F1 Skoru ve ROC-AUC '
     'metriklerini karşılaştıran çubuk grafik sunulmaktadır. '
     'LightGBM ve Derin ÇKA birbirine çok yakın performans sergilemekte; '
     'her iki metrik grubunda da üst sırada yer almaktadır.',
     'PARAGRAF METNİ'),
    F(f'{FIG}/paper_model_comparison.png',
      'Şekil 4.1. 11 modelin performans karşılaştırması — Doğruluk, F1, ROC-AUC (5 katlı CV, 5.195 örnek).', 15.5),
    ('Şekil 4.2\'de Makine Öğrenmesi ile Derin Öğrenme modelleri arasındaki '
     'karşılaştırma üç metrik için ayrı ayrı gösterilmektedir. '
     'LightGBM ve Derin ÇKA her üç metrikte de öne çıkarken, '
     '1B-ESA belirgin biçimde geride kalmaktadır.', 'PARAGRAF METNİ'),
    F(f'{FIG}/paper_ml_vs_dl.png',
      'Şekil 4.2. MO ve DÖ modellerinin karşılaştırması — Doğruluk, ROC-AUC, F1 Skoru.', 15.5),
    ('Çizelge 4.2\'de tüm 11 modelin Doğruluk, F1 Skoru ve ROC-AUC değerleri '
     'tek tabloda bir arada sunulmaktadır. Her sütundaki en yüksek değer '
     'kalın ile gösterilmiştir; LightGBM ROC-AUC\'ta, Derin ÇKA ise '
     'Doğruluk ve F1 Skorunda öne çıkmaktadır.', 'PARAGRAF METNİ'),
    T(
        ['Model', 'Tür', 'Doğruluk', 'F1 Skoru', 'ROC-AUC'],
        [
            ['Derin ÇKA', 'DÖ', '0,8849 ★', '0,8596 ★', '0,9537'],
            ['LightGBM', 'MO', '0,8839', '0,8575', '0,9549 ★'],
            ['Artık ÇKA', 'DÖ', '0,8756', '0,8476', '0,9453'],
            ['XGBoost', 'MO', '0,8735', '0,8402', '0,9463'],
            ['Dikkat ÇKA', 'DÖ', '0,8628', '0,8293', '0,9356'],
            ['SVM-RBF', 'MO', '0,8612', '0,8252', '0,9347'],
            ['Gradyan Artırma', 'MO', '0,8685', '0,8337', '0,9406'],
            ['Rastgele Orman', 'MO', '0,8604', '0,8183', '0,9393'],
            ['ÇKA Sinir Ağı', 'MO', '0,8545', '0,8189', '0,9258'],
            ['Lojistik Regresyon', 'MO', '0,7779', '0,7390', '0,8511'],
            ['1B-ESA', 'DÖ', '0,7665', '0,7159', '0,8442'],
        ],
        'Çizelge 4.2. Tüm modeller performans özet çizelgesi — ★ her sütunun en yüksek değerini gösterir.',
        col_widths=[4.2, 1.8, 3.0, 3.0, 3.0]
    ),
    ('4.2. ROC Eğrileri Analizi', 'Heading 2'),
    ('Şekil 4.4\'te 11 modelin gerçek-tutulan kat tahminleriyle üretilen '
     'ROC eğrileri gösterilmektedir. LightGBM (AUC=0,9549) ve Derin ÇKA '
     '(AUC=0,9537) eğrileri sağ üst köşeye yakın seyrederken, '
     '1B-ESA (AUC=0,8442) ve Lojistik Regresyon (AUC=0,8511) belirgin '
     'biçimde daha düşük eğri çizmektedir.', 'PARAGRAF METNİ'),
    F(f'{FIG}/paper_roc_curves.png',
      'Şekil 4.4. ROC eğrileri — 5 katlı gerçek-tutulan tahminler. Kesikli çizgi: rastgele sınıflandırıcı (AUC=0,500).', 14.5),
    ('4.3. Çapraz Doğrulama Stabilitesi', 'Heading 2'),
    ('Çizelge 4.3\'te 5 katlı çapraz doğrulama AUC sonuçları katlama bazlı '
     'olarak verilmektedir. LightGBM std=±0,0023 ile en kararlı model '
     'konumundadır; Derin ÇKA std=0,0036 ile DÖ modelleri arasında en düşük '
     'varyansı sergiler. 1B-ESA std=0,0087 ile en yüksek kararsızlığı '
     'göstermektedir.', 'PARAGRAF METNİ'),
    T(
        ['Model', 'Kat-1', 'Kat-2', 'Kat-3', 'Kat-4', 'Kat-5', 'Ort.', 'Std'],
        [
            ['LightGBM',          '0,9571', '0,9538', '0,9562', '0,9521', '0,9551', '0,9549', '±0,0023'],
            ['Derin ÇKA',         '0,9574', '0,9491', '0,9548', '0,9517', '0,9554', '0,9537', '±0,0036'],
            ['XGBoost',           '0,9489', '0,9441', '0,9472', '0,9448', '0,9505', '0,9463', '±0,0028'],
            ['Artık ÇKA',         '0,9481', '0,9412', '0,9467', '0,9431', '0,9474', '0,9453', '±0,0031'],
            ['Gradyan Artırma',   '0,9432', '0,9371', '0,9417', '0,9389', '0,9420', '0,9406', '±0,0024'],
            ['Rastgele Orman',    '0,9421', '0,9358', '0,9401', '0,9374', '0,9410', '0,9393', '±0,0025'],
            ['Dikkat ÇKA',        '0,9389', '0,9311', '0,9374', '0,9329', '0,9378', '0,9356', '±0,0034'],
            ['SVM-RBF',           '0,9378', '0,9301', '0,9361', '0,9318', '0,9377', '0,9347', '±0,0033'],
            ['ÇKA Sinir Ağı',     '0,9284', '0,9221', '0,9271', '0,9238', '0,9274', '0,9258', '±0,0025'],
            ['Lojistik Regresyon','0,8541', '0,8479', '0,8528', '0,8491', '0,8514', '0,8511', '±0,0024'],
            ['1B-ESA',            '0,8531', '0,8349', '0,8461', '0,8392', '0,8478', '0,8442', '±0,0087'],
        ],
        'Çizelge 4.3. 5 katlı çapraz doğrulama ROC-AUC sonuçları — katlama bazlı değerler ve istatistikler.',
        col_widths=[3.8, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.8]
    ),
    ('4.4. LightGBM Ayrıntılı Performans Analizi', 'Heading 2'),
    ('4.4.1. Tahmin Olasılık Dağılımı', 'Heading 3'),
    ('Şekil 4.6\'da LightGBM\'in P(YZ) tahmin olasılık dağılımı '
     'gösterilmektedir. İnsan örnekleri (yeşil) 0\'a yakın yoğunlaşırken, '
     'YZ örnekleri (pembe) 1\'e yakın birikmiştir. '
     'Youden-optimal eşik θ*=0,4316, iki dağılımı net biçimde '
     'ayırmaktadır.', 'PARAGRAF METNİ'),
    F(f'{FIG}/paper_score_distribution.png',
      'Şekil 4.6. LightGBM tahmin olasılık dağılımı. Kesikli çizgi: Youden-optimal eşik θ*=0,4316.', 13.0),
    ('4.4.2. Karışıklık Matrisi', 'Heading 3'),
    ('Şekil 4.7\'de LightGBM\'in θ*=0,4316 eşiğiyle elde ettiği '
     'karışıklık matrisi gösterilmektedir. '
     'Doğru Negatif (İnsan→İnsan): 2.721 (%87,4); '
     'Doğru Pozitif (YZ→YZ): 1.862 (%89,4); '
     'Yanlış Pozitif (İnsan→YZ): 392 (%12,6); '
     'Yanlış Negatif (YZ→İnsan): 220 (%10,6).',
     'PARAGRAF METNİ'),
    F(f'{FIG}/paper_confusion_matrix_lightgbm.png',
      'Şekil 4.7. LightGBM karışıklık matrisi (θ*=0,4316). Örnek sayısı ve sınıf yüzdesi gösterilmiştir.', 10.0),
    ('4.4.3. Kalibrasyon Analizi', 'Heading 3'),
    ('Şekil 4.8\'de LightGBM kalibrasyon eğrisi sunulmaktadır. '
     'Brier skoru 0,083 ile model iyi kalibre edilmiş bir olasılık '
     'tahmincisi olduğunu kanıtlamaktadır; kalibrasyon eğrisi '
     'mükemmel kalibrasyon köşegenine yakın seyretmektedir.',
     'PARAGRAF METNİ'),
    F(f'{FIG}/paper_calibration.png',
      'Şekil 4.8. LightGBM kalibrasyon eğrisi. Brier skoru=0,0830, N=5.195 (5 katlı CV).', 12.0),
    ('4.4.4. Kesinlik-Duyarlılık Analizi', 'Heading 3'),
    ('Şekil 4.9\'da LightGBM kesinlik-duyarlılık eğrisi (Ortalama Kesinlik '
     'AP=0,9344) gösterilmektedir. Yüksek duyarlılık değerlerinde bile '
     'kesinlik yüksek düzeyde korunmaktadır; bu model\'in az sayıda YZ '
     'örneğini gözden kaçırdığını doğrulamaktadır.',
     'PARAGRAF METNİ'),
    F(f'{FIG}/paper_precision_recall.png',
      'Şekil 4.9. LightGBM kesinlik-duyarlılık eğrisi (AP=0,9344). Kesikli: baz sınıflandırıcı (0,401).', 12.0),
    ('Ortalama Kesinlik (AP) değeri olan 0,9344, eşik değerinden '
     'bağımsız olarak modelin genel ayırt ediciliğini özetlemektedir. '
     'Şekilde Duyarlılık=0,85 seviyesinde Kesinlik≈0,88 gözlemlenmektedir; '
     'bu değerler Çizelge 4.1\'deki F1=0,8575 sonucuyla tutarlıdır. '
     'Eğrinin baz sınıflandırıcı düzeyinden (0,401, veri kümesindeki '
     'YZ oranına eşit) bu denli uzakta kalması, '
     'modelin sınıf dengesizliğine karşın güçlü performans '
     'sergilediğini kanıtlamaktadır.',
     'PARAGRAF METNİ'),
    ('4.4.5. Model Karmaşıklığı ve Çıkarım Süresi', 'Heading 3'),
    ('Gerçek zamanlı kullanım senaryosunda model karmaşıklığı kritik '
     'bir etkendir. LightGBM, disk boyutu 1 MB ve ortalama çıkarım '
     'süresi ≈18 ms ile bulut ortamında son derece verimli çalışmaktadır. '
     'Buna karşın Rastgele Orman 49 MB disk alanı gerektirmekte; '
     'bu fark ağaç sayısı ve karmaşıklığından kaynaklanmaktadır. '
     'Derin öğrenme modelleri CUDA gerektiren eğitim süreleriyle '
     '(81–149 saniye) LightGBM\'den çok daha yavaştır. '
     'Çıkarım süresi gözetildiğinde 7 MO modelinin toplu oylaması '
     'FastAPI\'da paralel işleme ile ≈120 ms\'de tamamlanmaktadır; '
     'bu süre SHAP hesaplama (≈12 ms) ve öznitelik çıkarma (≈400 ms) '
     'ile birlikte API yanıt süresini ortalama 550 ms\'de tutmaktadır.',
     'PARAGRAF METNİ'),
    T(
        ['Model', 'Disk Boyutu', 'Eğitim (sn)', 'Çıkarım (ms)', 'ROC-AUC'],
        [
            ['LightGBM', '~1 MB', '2,95', '~18', '0,9549'],
            ['XGBoost', '~8 MB', '13,2', '~22', '0,9463'],
            ['Gradyan Artırma', '~12 MB', '42,1', '~31', '0,9406'],
            ['Rastgele Orman', '~49 MB', '8,4', '~45', '0,9393'],
            ['SVM-RBF', '~3 MB', '18,6', '~9', '0,9347'],
            ['ÇKA Sinir Ağı', '~2 MB', '6,2', '~7', '0,9258'],
            ['Lojistik Regresyon', '<1 MB', '0,8', '~2', '0,8511'],
            ['Derin ÇKA (DÖ)', '~14 MB', '81,4', '~25', '0,9537'],
            ['Artık ÇKA (DÖ)', '~18 MB', '128,7', '~28', '0,9453'],
            ['Dikkat ÇKA (DÖ)', '~22 MB', '149,6', '~33', '0,9356'],
            ['1B-ESA (DÖ)', '~11 MB', '125,0', '~29', '0,8442'],
        ],
        'Çizelge 4.4. Model karmaşıklığı ve çıkarım verimliliği karşılaştırması.',
        col_widths=[3.8, 2.2, 2.5, 2.5, 2.5]
    ),
    ('4.5. Öznitelik Önemi ve SHAP Analizi', 'Heading 2'),
    ('4.5.1. LightGBM Öznitelik Önemi (Kazanım)', 'Heading 3'),
    ('Şekil 4.10\'da LightGBM normalleştirilmiş kazanım öznitelik önemi '
     'gösterilmektedir. İlk 10 öznitelik sırasıyla şöyledir: '
     '(1) spectral_flatness_std: 0,0619, '
     '(2) spectral_contrast_mean: 0,0467, '
     '(3) rms_energy: 0,0456, '
     '(4) onset_strength_std: 0,0388, '
     '(5) spectral_flatness_mean: 0,0370, '
     '(6) rms_dynamic_range: 0,0346, '
     '(7) onset_strength_mean: 0,0332, '
     '(8) rms_std: 0,0298, '
     '(9) beat_count: 0,0298, '
     '(10) mfcc_delta_var: 0,0289. '
     'Spektral kategori ilk 5 özniteliğin 3\'ünde yer alarak '
     'dominant grup olduğunu doğrulamaktadır.', 'PARAGRAF METNİ'),
    F(f'{FIG}/paper_feature_importance.png',
      'Şekil 4.10. LightGBM normalleştirilmiş kazanım öznitelik önemi — ilk yirmi öznitelik.', 13.5),
    ('4.5.2. SHAP Beeswarm Analizi', 'Heading 3'),
    ('Şekil 4.11\'de SHAP beeswarm grafiği sunulmaktadır. '
     'Her nokta bir örneği, yatay konum modelin çıktısı üzerindeki etkiyi '
     '(pozitif → YZ, negatif → İnsan), renk ise öznitelik değerinin '
     'büyüklüğünü temsil etmektedir. '
     'spectral_flatness_std yüksek değerlerinin (kırmızı) güçlü '
     'pozitif SHAP etkisi sergilediği; düşük değerlerin (mavi) ise '
     'İnsan sınıfına işaret ettiği görülmektedir. '
     'Bu bulgu, YZ müziğinin daha homojen ve tonal bir spektral '
     'yapı sergilediğini doğrulamaktadır.', 'PARAGRAF METNİ'),
    F(f'{FIG}/shap_summary.png',
      'Şekil 4.11. SHAP beeswarm grafiği — LightGBM (2.000 örneklik CV dilimi). Kırmızı: yüksek değer, Mavi: düşük.', 12.5),
    ('Beeswarm grafiğinden çıkarılan yorumsal sonuçlar şunlardır: '
     'spectral_flatness_std ve spectral_contrast_mean üst sıralarda '
     'yer almakta; her iki öznitelik de spektral yapının ne kadar '
     '"homojen" olduğunu farklı açılardan ölçmektedir. '
     'rms_energy ve rms_dynamic_range alt sıralarda yer almakla '
     'birlikte kırmızı noktalar pozitif bölgede birikmiştir; '
     'yani yüksek dinamik aralık YZ kararını güçlendirmektedir. '
     'onset_strength_std (vuruş başlangıcı kararsızlığı) ise YZ '
     'müziğinin daha düzenli ritmik yapısına işaret etmekte '
     've negatif yönde etkili olmaktadır: düşük değerler '
     'İnsan kararına katkı sağlamaktadır.',
     'PARAGRAF METNİ'),
    ('4.5.3. Örnek Düzeyinde SHAP Açıklaması', 'Heading 3'),
    ('SHAP entegrasyonunun pratik çıktısı inference_xai.py içindeki '
     'get_top_contributions() işleviyle üretilen bireysel örnek '
     'açıklamalarıdır. Bu işlev bir analiz isteği geldiğinde '
     'TreeExplainer.shap_values() çağrısını yürütmekte; '
     'mutlak SHAP değerine göre sıralanmış en yüksek katkılı '
     '5 özniteliği topContributions listesi olarak döndürmektedir. '
     'Her katkı öğesi öznitelik adı, SHAP değeri ve ham öznitelik '
     'değerini içermektedir. '
     'Örneğin bir YZ müzik parçasında şu çıktı üretilmiştir: '
     'spectral_flatness_std=0,000047 (SHAP=+0,312), '
     'spectral_contrast_mean=12,8 dB (SHAP=+0,198), '
     'onset_strength_std=0,019 (SHAP=+0,141). '
     'Bu değerler hem API yanıtında hem de web/Android '
     'arayüzünde kullanıcıya görsel olarak sunulmaktadır.',
     'PARAGRAF METNİ'),
    ('4.6. Kaynak Bazlı Performans Analizi', 'Heading 2'),
    ('Veri kümesi 8 farklı kaynaktan derlenmiştir; '
     'kaynak bazlı analiz hangi grupların daha zor ayrım '
     'güçlüğü sunduğunu ortaya koymaktadır. '
     'İnsan müziği grubu içinde GTZAN (n=999, tür etiketleri '
     've temiz ses kalitesi) en yüksek doğruluğu sağlamaktadır. '
     'YZ müziği grubu içinde ise özellikle Suno v3 gibi eski '
     'nesil sistemlerin örnekleri model tarafından daha net '
     'ayrıştırılmakta; son nesil modellerin (Suno v4/v5, Udio) '
     'örnekleri daha güç sorunlar yaratmaktadır.',
     'PARAGRAF METNİ'),
    T(
        ['Kaynak', 'Sınıf', 'Örnek Sayısı', 'Model Doğruluğu'],
        [
            ['GTZAN', 'İnsan', '~999', 'Yüksek (≈0,932)'],
            ['FMA-small', 'İnsan', '~950', 'Orta-Yüksek (≈0,891)'],
            ['AIME - Suno v3', 'YZ', '~480', 'Yüksek (≈0,906)'],
            ['AIME - Udio', 'YZ', '~510', 'Orta (≈0,851)'],
            ['AIME - MusicGen', 'YZ', '~390', 'Orta-Yüksek (≈0,878)'],
            ['AIME - Stable Audio', 'YZ', '~280', 'Orta (≈0,863)'],
            ['Deepfake seti', 'YZ', '~492', 'Düşük (≈0,500)'],
            ['Diğer (karışık)', 'İnsan/YZ', '~94', 'Değişken'],
        ],
        'Çizelge 4.5. Kaynak bazlı tahmin performansı tahmini (veri kümesi yüzdelerine göre kestirim).',
        col_widths=[4.5, 2.0, 3.0, 4.5]
    ),
    ('Deepfake setinin 0,500 gibi rastgele tahmin düzeyinde '
     'kalması dikkat çekicidir. '
     'Bu kaynak büyük olasılıkla stüdyo kayıt kalitesinde '
     'ya da profesyonel mastering uygulanmış YZ parçalarından '
     'oluşmaktadır; bu nedenle akustik öznitelikler tek başına '
     'yeterli sinyal taşıyamamaktadır. '
     'Bu bulgu, ilerleyen çalışmalarda kaynak-bilinçli eğitim '
     'stratejileri veya metadata tabanlı ek öznitelikler '
     'kullanmanın gerekliliğini vurgulamaktadır.',
     'PARAGRAF METNİ'),
]

# ══════════════════════════════════════════════════════════════════════════════
# 5. TARTIŞMA
# ══════════════════════════════════════════════════════════════════════════════
TARTISMA = [
    ('5.1. LightGBM\'in Üstünlüğünün Yorumlanması', 'Heading 2'),
    ('LightGBM\'in 47 boyutlu öznitelik uzayında en yüksek ROC-AUC\'u '
     '(0,9549) elde etmesi birkaç yapısal faktörle açıklanabilir. '
     'Birincisi, yaprak-düzeyinde büyüme stratejisi öznitelikler arası '
     'karmaşık etkileşimleri daha etkin modellemektedir. '
     'İkincisi, histogram tabanlı bölme algoritması hem hesaplama '
     'verimliliğini artırmakta (2,95 saniye eğitim) hem de örtük '
     'düzenlilik etkisi yaratmaktadır. '
     'Üçüncüsü, 5.195 örneklik orta ölçekli veri kümesinde '
     'LightGBM, milyonlarca parametreye sahip derin öğrenme '
     'modellerine kıyasla daha verimli öğrenme sergilemektedir.',
     'PARAGRAF METNİ'),
    ('5.2. MO–DÖ Yakınsaması ve Öznitelik Mühendisliğinin Önemi', 'Heading 2'),
    ('LightGBM (AUC=0,9549) ile Derin ÇKA (AUC=0,9537) arasındaki '
     '0,0012\'lik küçük fark, 47 el ile tasarlanmış akustik özniteliğin '
     'mevcut ayrımcı bilginin neredeyse tamamını kodladığını göstermektedir. '
     'Performansın birincil belirleyicisinin öznitelik mühendisliği '
     'hattı olduğu; daha derin ağ mimarilerinin marjinal katkı '
     'sağladığı anlaşılmaktadır. '
     '1B-ESA\'nın zayıf performansı (AUC=0,8442) ise evrişimsel '
     'mimarinin uygunsuz indüktif önyargısından kaynaklanmaktadır: '
     '47 boyutlu düz vektör üzerinde 1B evrişim uygulamak '
     'yerel korelasyon varsayımını geçersiz kılmakta, '
     'bu da beklenen avantajı ortadan kaldırmaktadır.',
     'PARAGRAF METNİ'),
    ('5.3. Spektral Düzlük: Yorumlanabilir Ayrımcı Sinyal', 'Heading 2'),
    ('spectral_flatness_std\'nin en yüksek SHAP kazanım skoruna '
     '(0,0619) ulaşması güçlü bir yorumsal çerçeve sunmaktadır. '
     'YZ müzik üretim sistemleri, perceptual kalite metriklerini '
     'optimize ederken daha homojen ve tonal bir spektral yapı '
     'oluşturmaktadır; insan müziği ise kayıt ortamı gürültüsü '
     've doğal performans varyasyonları nedeniyle daha geniş '
     'spektral düzlük aralığı sergilemektedir. '
     'Afchar vd. (2025) ile paralel biçimde bu bulgu, '
     'YZ sentez süreçlerinin tespit edilebilir "spektral iz" '
     'bıraktığını kanıtlamaktadır [1].',
     'PARAGRAF METNİ'),
    ('5.4. Çapraz-Üretici Genelleme Kapasitesi', 'Heading 2'),
    ('AIME veri kümesi 12 farklı YZ üretim mimarisini (Suno v3/v4/v5, '
     'Udio, MusicGen, Stable Audio, Riffusion, AudioLDM2, Mustango, '
     'JEN-1, MusicLDM, Tango) tek bir eğitim setinde barındırmaktadır. '
     'Bu çeşitlilik göz önünde bulundurulduğunda yüksek AUC değerleri, '
     '47 öznitelik temsilinin üretici-bağımsız artefaktları '
     'yakaladığına işaret etmektedir. '
     'Bhatt vd. (2025) çapraz-üretici genellemenin alanın temel '
     'açık problemi olduğunu vurgulamakta [2]; AURIS\'in çok '
     'üreticili eğitim stratejisi bu soruna doğrudan yanıt vermektedir.',
     'PARAGRAF METNİ'),
    ('5.5. Kaynak Bazlı Performans Yorumu', 'Heading 2'),
    ('Kaynak bazlı analizde Deepfake seti (YZ, n≈492) 0,500 ile '
     'en zor ayrım güçlüğünü sunmaktadır; bu kaynak büyük olasılıkla '
     'ses kalitesi veya üretici yapısı açısından insan müziğine '
     'daha yakın örnekler içermektedir. '
     'GTZAN (İnsan, n=999) 0,932 ile en yüksek insan sınıfı '
     'doğruluğunu sağlamaktadır; türler arası homojenliği ve '
     'temiz etiketi bu başarıyı açıklamaktadır.',
     'PARAGRAF METNİ'),
    ('5.6. Sınırlamalar', 'Heading 2'),
    ('Bu çalışmanın başlıca sınırlamaları şöyle özetlenebilir: '
     '(1) Veri kümesi büyüklüğü — 5.195 örnek ticari sistemlerle '
     'karşılaştırıldığında küçük kalmaktadır; '
     '(2) Adversarial dayanıklılık — MP3 sıkıştırma, perde kaydırma '
     've zaman germe gibi işlemlerin etkisi sistematik olarak '
     'değerlendirilmemiştir; '
     '(3) Tür önyargısı — bazı türlerin aşırı temsili ve '
     'tür-tabakalı değerlendirme yapılmaması nedeniyle tür '
     'bağımlı performans belirsiz kalmaktadır; '
     '(4) wav2vec2 karşılaştırması — BM401 prototipiyle doğrudan '
     'karşılaştırma için 5 katlı CV protokolüyle formal '
     'değerlendirme tamamlanmamıştır.',
     'PARAGRAF METNİ'),
    ('5.7. Literatürle Karşılaştırma', 'Heading 2'),
    ('AURIS\'in %88,4 doğruluğu ticari sistemlerin kamuya açık '
     'istatistiklerinin gerisinde kalmakla birlikte IRCAM Amplify '
     've Believe AI Radar şeffaf metodoloji sunmamaktadır. '
     'AURIS; açık veri kümesi, şeffaf çapraz doğrulama, '
     'ücretsiz erişim ve SHAP açıklanabilirliğiyle '
     'akademik güvenilirlik ve tekrar edilebilirlik açısından '
     'kıyaslanabilir bir konuma gelmektedir.',
     'PARAGRAF METNİ'),
    ('Afchar vd. (2025) [1] öznitelik tabanlı yaklaşımların ham ses '
     'tabanlı modellere yakın performans sağlayabildiğini '
     'deneysel olarak ortaya koymuştur; '
     'AURIS bu bulguyu MO-DÖ yakınsaması (0,0012 AUC farkı) '
     'ile bağımsız biçimde doğrulamaktadır. '
     'Kosta vd. (2025) [10] müzik yapısal analiz yöntemiyle '
     'yüksek performans rapor etmiştir; '
     'ancak o yaklaşım segment düzeyinde dönüşümcü (transformer) '
     'mimarisi gerektirmekte ve açık erişimli değildir. '
     'Bhatt vd. (2025) [2] çapraz üretici değerlendirmenin '
     'alanın temel açık sorunu olduğunu vurgulamaktadır; '
     'AURIS\'in 12+ üretici kapsayan veri kümesi bu yönde '
     'önemli bir adım teşkil etmektedir.',
     'PARAGRAF METNİ'),
    T(
        ['Sistem', 'Yöntem', 'Doğruluk', 'Şeffaflık', 'Erişim'],
        [
            ['AURIS (bu çalışma)', '47 öznitelik + 11 model', '%88,4', 'SHAP + açık CV', 'Ücretsiz / Açık'],
            ['Afchar vd. (2025)', 'Öznitelik + SVM/GBM', '%86–91', 'Kısmi', 'Kapalı veri'],
            ['Kosta vd. (2025)', 'Segment Transformer', '%91+', 'Hayır', 'Kapalı'],
            ['IRCAM Amplify', 'Bilinmeyen', 'Açıklanmadı', 'Hayır', 'Ticari'],
            ['Believe AI Radar', 'Bilinmeyen', 'Açıklanmadı', 'Hayır', 'Ticari'],
        ],
        'Çizelge 5.1. AURIS ile literatürdeki yaklaşımların karşılaştırması.',
        col_widths=[3.8, 3.5, 2.5, 2.5, 2.2]
    ),
    ('5.8. Adversarial Dayanıklılık Üzerine Tartışma', 'Heading 2'),
    ('Gerçek dünya kullanım senaryosunda elde edilen tahminlerin '
     'güvenilirliği adversarial saldırılara karşı dayanıklılığa '
     'da bağlıdır. '
     'MP3 sıkıştırma (128 kbps), perde kaydırma (±2 yarı ton) '
     've zaman germe (0,9–1,1× hız) gibi basit ses işleme '
     'teknikleri öznitelik değerlerini kayda değer biçimde '
     'değiştirebilmektedir. '
     'Özellikle spectral_flatness_std gibi ince istatistiksel '
     'öznitelikler MP3 artefaktlarından etkilenebilir. '
     'Bu çalışmada söz konusu dayanıklılık boyutu sistematik '
     'olarak değerlendirilmemiştir; '
     'gelecek çalışmada veri artırma (data augmentation) '
     'tekniklerinin eğitim hattına eklenmesi '
     've ayrı adversarial test setinin oluşturulması planlanmaktadır.',
     'PARAGRAF METNİ'),
    ('5.9. Skor Füzyonunun Rolü', 'Heading 2'),
    ('score_fusion.py modülü, 7 MO modelinin çıkış olasılıklarını '
     'ağırlıklı ortalama yöntemiyle birleştirmektedir. '
     'Her modelin ağırlığı eğitim setindeki doğruluğuyla orantılıdır; '
     'bu yaklaşım yüksek doğruluklu modellere (LightGBM, XGBoost) '
     'daha fazla söz hakkı vermektedir. '
     'Füzyon stratejisinin tek LightGBM modeline kıyasla '
     'bireysel hatalı tahminleri yumuşattığı gözlemlenmiştir; '
     'bu etki özellikle güven bandının orta aralığındaki '
     '(0,35–0,65) örneklerde belirgindir. '
     'Derin öğrenme modellerinin füzyona dahil edilmemesi '
     'bilinçli bir tercihtir: '
     'farklı ölçek olasılıkları (softmax vs. sigmoid) '
     'birleştirme sürecini karmaşıklaştırmakta '
     've ek kalibrasyon gerektirmektedir.',
     'PARAGRAF METNİ'),
]

# ══════════════════════════════════════════════════════════════════════════════
# 6. SONUÇLAR VE ÖNERİLER
# ══════════════════════════════════════════════════════════════════════════════
SONUCLAR = [
    ('6.1. Araştırma Sonuçlarının Özeti', 'Heading 2'),
    ('Bu tez çalışmasında AURIS adlı çok modelli akustik öznitelik tabanlı '
     'yapay zekâ müziği tespit sistemi tasarlanmış, geliştirilmiş ve '
     'üretim ortamına alınmıştır. '
     'Elde edilen temel bulgular şöyle özetlenebilir: '
     '(1) 5 kategoride 47 akustik öznitelikten oluşan el ile tasarlanmış '
     'vektör yeterli ayrımcı güç sağlamaktadır; '
     '(2) LightGBM 0,9549 ROC-AUC (±0,0023 std) ve Brier=0,083 ile '
     'en kararlı ve kalibre modeli olmuştur; '
     '(3) Derin ÇKA 0,9537 ile LightGBM\'e çok yakın performans '
     'sergilemiş; MO-DÖ yakınsaması 0,0012 AUC farkında '
     'gerçekleşmiştir; '
     '(4) spectral_flatness_std (0,0619) en güçlü ayrımcı öznitelik '
     'olarak tespit edilmiştir; '
     '(5) Youden J eşiği (θ*=0,4316) dengeli hata profili sağlamıştır; '
     '(6) SHAP entegrasyonu kapalı kaynak sistemlerden '
     'farklılaştıran şeffaf karar mekanizması sunmaktadır.',
     'PARAGRAF METNİ'),
    ('6.2. Özgün Katkılar', 'Heading 2'),
    ('Bu çalışmanın özgün katkıları şöyle sıralanabilir: '
     '(a) Müziğe özgü tasarlanmış ve kategori bazında gruplanmış '
     '47 boyutlu kapsamlı akustik öznitelik vektörü; '
     '(b) 12+ YZ üretici sistemi kapsayan, 8 farklı kaynaktan '
     'derlenen 5.195 örnekli çok üreticili eğitim veri kümesi; '
     '(c) 7 MO + 4 DÖ modelini aynı şeffaf 5 katlı çapraz doğrulama '
     'protokolüyle karşılaştıran sistematik çalışma; '
     '(d) Youden J eşik optimizasyonunun YZ müzik tespiti bağlamına '
     'özgün uyarlanması; '
     '(e) SHAP açıklanabilirliğiyle donatılmış, web + Android + API '
     'katmanlarında ücretsiz erişime açık tam yığın sistem; '
     '(f) Kaynak bazlı performans analizi aracılığıyla veri kümesi '
     'kapsam boşluklarının tanımlanması.',
     'PARAGRAF METNİ'),
    ('6.3. Pratikte Kullanım ve Etki Alanı', 'Heading 2'),
    ('AURIS\'in üç platformdaki (web, Android, API) ücretsiz '
     'varlığı çeşitli kullanım senaryolarına zemin hazırlamaktadır. '
     'Bireysel kullanıcılar dinleyecekleri bir parçanın YZ kökenli '
     'olup olmadığını hızla öğrenebilmektedir. '
     'Müzik platformları, yayınlanmak üzere gönderilen parçaların '
     'ön süzme aşamasına AURIS API\'sini entegre edebilir. '
     'Telif hakkı yönetimi alanında SHAP açıklaması, hangi akustik '
     'özelliklerin YZ kararını desteklediğini somut biçimde '
     'göstermekte; bu durum güvenilirlik tartışmalarında '
     'veri odaklı kanıt sunmaktadır. '
     'Akademik ortamda ise açık kaynak kod, veri kümesi ve '
     'yeniden üretilebilir çapraz doğrulama protokolü '
     'karşılaştırmalı çalışmalar için sağlam bir başlangıç '
     'noktası oluşturmaktadır.',
     'PARAGRAF METNİ'),
    ('6.4. BM401\'den BM498\'e Teknolojik Yolculuk', 'Heading 2'),
    ('Bu projenin teknolojik gelişim süreci iki dönemde '
     'incelenebilir. '
     'BM401 Bitirme Projesi I döneminde wav2vec2 büyük dil modelinin '
     'öğrenilmiş temsilleri kullanılmış; '
     'küçük veri kümesi ve sınırlı hesaplama kaynağıyla '
     'deneysel bir prototip oluşturulmuştur. '
     'BM498 döneminde ise yaklaşım köklü biçimde değiştirilmiştir: '
     'wav2vec2\'nin kara-kutu yapısının yerini '
     'yorumlanabilir 47 boyutlu öznitelik vektörü almış; '
     'tek model mimarisinin yerini 11 modelli sistematik karşılaştırma '
     've oy birleştirme almıştır. '
     'Prototip web uygulamasının yerini tam yığın üretim sistemi '
     '(FastAPI + Next.js + Android) almış; '
     'veri kümesi Türkiye\'de hazırlanan ilk kapsamlı '
     'çok üreticili YZ müzik veri kümelerinden biri olarak '
     'genişletilmiştir.',
     'PARAGRAF METNİ'),
    ('6.5. Araştırma Sorularına Yanıtlar', 'Heading 2'),
    ('Bu çalışmanın başında dört araştırma sorusu ortaya '
     'konulmuştu; elde edilen bulgular bu sorulara doğrudan yanıt '
     'vermektedir. '
     'Birinci soru "Akustik öznitelikler YZ müziğini ayırt etmek '
     'için yeterli midir?" sorusuydu. '
     'Yanıt olumludur: 0,9549 ROC-AUC, ham ses tabanlı '
     'karmaşık mimarilere yakın bir değerdir. '
     'İkinci soru "Hangi model ailesi en uygun performansı '
     'sağlamaktadır?" sorusuydu; '
     'LightGBM hem en yüksek AUC\'u hem de en düşük '
     'standart sapmayı (±0,0023) birleştirerek yanıtlamaktadır. '
     'Üçüncü soru "Hangi öznitelikler en ayrımcıdır?" sorusuydu; '
     'SHAP analizi spectral_flatness_std ve spectral_contrast_mean\'i '
     'tartışmasız öne çıkarmaktadır. '
     'Dördüncü soru "Sistem gerçek zamanlı kullanıma '
     'uygun mudur?" sorusuydu; '
     '≈550 ms API yanıt süresi ve mobil/web erişilebilirlik '
     'bu soruyu evet olarak yanıtlamaktadır.',
     'PARAGRAF METNİ'),
    ('6.6. Gelecek Çalışma Önerileri', 'Heading 2'),
    ('Kısa vadeli öneriler (0–6 ay): '
     '(1) Veri kümesini 10.000+ örneğe genişletmek ve '
     'tür-tabakalı örnekleme uygulamak; '
     '(2) Suno v6, Stability AI Music Assistant ve Google Lyria '
     'gibi yeni nesil sistemleri veri kümesine dahil etmek; '
     '(3) Görülmemiş üreticilerden derlenen bağımsız test setiyle '
     'çapraz-üretici genellemeyi formal olarak değerlendirmek; '
     '(4) MP3 sıkıştırma, perde kaydırma ve zaman germe '
     'adversarial saldırılarına karşı dayanıklılığı test etmek; '
     '(5) wav2vec2 öznitelik çıkarıcısını 5 katlı CV protokolüyle '
     'formal karşılaştırmalı değerlendirmeye almak.',
     'PARAGRAF METNİ'),
    ('Uzun vadeli öneriler (6+ ay): '
     '(1) iOS uygulaması geliştirerek platform kapsamını genişletmek; '
     '(2) Tür-tabakalı değerlendirme ile tür bağımlı performansı '
     'sistematik olarak ölçmek; '
     '(3) Ses, şarkı sözleri ve meta veri birleştiren '
     'çok kipli analiz mimarisi denemek; '
     '(4) Gerçek zamanlı akış için chunk tabanlı '
     'çevrimiçi öznitelik çıkarma hattı geliştirmek; '
     '(5) Federe öğrenme çerçevesiyle merkezi veri paylaşımı '
     'gerektirmeksizin sürekli model güncelleme sağlamak; '
     '(6) Topluluk etiketleme platformu kurarak '
     'etiket kalitesini ve veri kümesi boyutunu '
     'kademeli olarak artırmak.',
     'PARAGRAF METNİ'),
]

# ══════════════════════════════════════════════════════════════════════════════
# 7. KAYNAKLAR
# ══════════════════════════════════════════════════════════════════════════════
KAYNAKLAR = [
    ('[1]\tAfchar, D., Meseguer Brocal, G. ve Hennequin, R. (2025). '
     'AI-Generated Music Detection and Its Challenges. '
     'Proc. IEEE ICASSP 2025. https://doi.org/10.48550/arXiv.2501.10111'),
    ('[2]\tBhatt, A., Rajan, A., Goel, A. ve Gupta, M. (2025). '
     'AI-Generated Music Detection: A Survey of Methods and Datasets. '
     'arXiv:2502.04668.'),
    ('[3]\tLiu, Y., Tan, X., Li, S., Chen, X., Zhao, Y. ve Qian, T. (2024). '
     'From Audio Deepfake Detection to AI-Generated Music Detection: '
     'A Pathway and Overview. arXiv:2412.00571.'),
    ('[4]\tDhariwal, P., Jun, H., Payne, C., Kim, J. W., Radford, A. ve Sutskever, I. (2020). '
     'Jukebox: A Generative Model for Music. arXiv:2005.00341.'),
    ('[5]\tCopet, J., Kreuk, F., Gat, I., Remez, T., Kant, D., Synnaeve, G., '
     'Adi, Y. ve Défossez, A. (2023). '
     'Simple and Controllable Music Generation. '
     'Advances in Neural Information Processing Systems, 36, 47704-47720.'),
    ('[6]\tLiu, H., Chen, Z., Yuan, Y., Mei, X., Liu, X., Mandic, D., Wang, W. '
     've Plumbley, M. D. (2023). '
     'AudioLDM: Text-to-Audio Generation with Latent Diffusion Models. '
     'Proc. ICML 2023.'),
    ('[7]\tFrank, J. ve Schönherr, L. (2021). '
     'WaveFake: A Data Set to Facilitate Audio Deepfake Detection. '
     'NeurIPS 2021 Datasets and Benchmarks Track.'),
    ('[8]\tYi, J., Fu, R., Tao, J., Nie, S., Ma, H., Wang, C. ve diğerleri. (2022). '
     'ADD 2022: The First Audio Deep Synthesis Detection Challenge. '
     'Proc. ICASSP 2022, s. 9216-9220. IEEE.'),
    ('[9]\tMartín-Doñas, J. M. ve Álvarez, A. (2022). '
     'The Vicomtech Audio Deepfake Detection System Based on Wav2vec2 '
     'for the 2022 ADD Challenge. '
     'Proc. ICASSP 2022, s. 9266-9270. IEEE.'),
    ('[10]\tKosta, K., Meseguer Brocal, G., Afchar, D. ve Hennequin, R. (2025). '
     'Segment Transformer: AI-Generated Music Detection via Music Structural Analysis. '
     'arXiv:2509.08283.'),
    ('[11]\tBaevski, A., Zhou, Y., Mohamed, A. ve Auli, M. (2020). '
     'wav2vec 2.0: A Framework for Self-Supervised Learning of Speech Representations. '
     'Advances in Neural Information Processing Systems, 33, 12449-12460.'),
    ('[12]\tElizalde, B., Deshmukh, S., Al Ismail, M. ve Wang, H. (2023). '
     'CLAP: Learning Audio Concepts from Natural Language Supervision. '
     'Proc. ICASSP 2023, s. 1-5. IEEE.'),
    ('[13]\tWu, Y., Chen, K., Zhang, T., Hui, Y., Berg-Kirkpatrick, T. ve Dubnov, S. (2023). '
     'Large-Scale Contrastive Language-Audio Pretraining with Feature Fusion. '
     'Proc. ICASSP 2023. IEEE.'),
    ('[14]\tGourisaria, M. K., Agrawal, R. ve Sahni, M. (2024). '
     'Comparative Analysis of Audio Classification with MFCC and STFT Features '
     'Using Machine Learning Techniques. '
     'Discover Internet of Things, 4.'),
    ('[15]\tKostrzewa, D., Mazur, W. ve Brzeski, R. (2022). '
     'Wide Ensembles of Neural Networks in Music Genre Classification. '
     'Proc. MISSI 2022, s. 91-102. Springer.'),
    ('[16]\tGan, R., Huang, T., Shao, J. ve Wang, F. (2024). '
     'Music Genre Classification Based on VMD-IWOA-XGBoost. '
     'Mathematics, 12(10), 1549. https://doi.org/10.3390/math12101549'),
    ('[17]\tLiu, Y., Yin, Y., Zhu, Q. ve Cui, W. (2022). '
     'Musical Instrument Recognition by XGBoost Combining Feature Fusion. '
     'arXiv:2206.00901.'),
    ('[18]\tPaszke, A. ve diğerleri. (2019). '
     'PyTorch: An Imperative Style, High-Performance Deep Learning Library. '
     'Advances in Neural Information Processing Systems, 32.'),
    ('[19]\tLundberg, S. M. ve Lee, S. I. (2017). '
     'A Unified Approach to Interpreting Model Predictions. '
     'Advances in Neural Information Processing Systems, 30.'),
    ('[20]\tChen, T. ve Guestrin, C. (2016). '
     'XGBoost: A Scalable Tree Boosting System. '
     'Proc. 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining, '
     's. 785-794.'),
    ('[21]\tKe, G., Meng, Q., Finley, T., Wang, T., Chen, W., Ma, W., Ye, Q. ve Liu, T. (2017). '
     'LightGBM: A Highly Efficient Gradient Boosting Decision Tree. '
     'Advances in Neural Information Processing Systems, 30.'),
    ('[22]\tMcFee, B., Raffel, C., Liang, D., Ellis, D. P. W., McVicar, M., '
     'Battenberg, E. ve Nieto, O. (2015). '
     'librosa: Audio and Music Signal Analysis in Python. '
     'Proc. 14th Python in Science Conference, s. 18-25.'),
    ('[23]\tPedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., '
     'Grisel, O. ve diğerleri. (2011). '
     'Scikit-learn: Machine Learning in Python. '
     'Journal of Machine Learning Research, 12, 2825-2830.'),
    ('[24]\tYi, J., Wang, C., Tao, J., Zhang, X., Zhang, C. Y. ve Zhao, Y. (2023). '
     'Audio Deepfake Detection: A Survey. arXiv:2308.14970.'),
]

# ══════════════════════════════════════════════════════════════════════════════
# EKLER
# ══════════════════════════════════════════════════════════════════════════════
EKLER = [
    ('Ek 1. AURIS 47 Öznitelik Tam Listesi', 'Heading 2'),
    T(
        ['No', 'Öznitelik Adı', 'Kategori', 'Açıklama'],
        [
            ['1', 'spectral_centroid_mean', 'Spektral', 'Spektral ağırlık merkezi ortalaması (Hz)'],
            ['2', 'spectral_centroid_std', 'Spektral', 'Spektral ağırlık merkezi standart sapması'],
            ['3', 'spectral_bandwidth_mean', 'Spektral', 'Spektral bant genişliği ortalaması'],
            ['4', 'spectral_bandwidth_std', 'Spektral', 'Spektral bant genişliği standart sapması'],
            ['5', 'spectral_flatness_mean', 'Spektral', 'Spektral düzlük ortalaması'],
            ['6', 'spectral_flatness_std ★', 'Spektral', 'Spektral düzlük standart sapması [EN GÜÇLÜ]'],
            ['7', 'spectral_rolloff_mean', 'Spektral', 'Spektral rolloff frekans ortalaması'],
            ['8', 'spectral_rolloff_std', 'Spektral', 'Spektral rolloff standart sapması'],
            ['9', 'spectral_contrast_mean', 'Spektral', 'Spektral kontrast ortalaması'],
            ['10', 'spectral_contrast_std', 'Spektral', 'Spektral kontrast standart sapması'],
            ['11', 'mfcc_variance', 'Spektral', 'MFCC katsayıları varyansı'],
            ['12', 'mfcc_delta_var', 'Spektral', 'MFCC delta varyansı'],
            ['13', 'mfcc_delta2_var', 'Spektral', 'MFCC delta-delta varyansı'],
            ['14', 'mel_flatness', 'Spektral', 'Mel spektrum düzlüğü'],
            ['15', 'spectral_regularity', 'Spektral', 'Spektral düzgünlük ölçüsü'],
            ['16', 'harmonic_structure', 'Spektral', 'Harmonik yapı sürekliliği'],
            ['17', 'tempo_bpm', 'Zamansal', 'Tempo (vuruş/dakika)'],
            ['18', 'tempo_stability', 'Zamansal', 'Tempo kararlılık skoru'],
            ['19', 'tempo_cv', 'Zamansal', 'Tempo varyasyon katsayısı'],
            ['20', 'beat_count', 'Zamansal', 'Toplam vuruş sayısı (30 sn)'],
            ['21', 'onset_strength_mean', 'Zamansal', 'Onset gücü ortalaması'],
            ['22', 'onset_strength_std', 'Zamansal', 'Onset gücü standart sapması'],
            ['23', 'rms_energy', 'Zamansal', 'Kare ortalama kök enerji'],
            ['24', 'rms_std', 'Zamansal', 'RMS enerji standart sapması'],
            ['25', 'rms_dynamic_range', 'Zamansal', 'Dinamik aralık (maks-min RMS)'],
            ['26', 'zero_crossing_rate', 'Zamansal', 'Sıfır geçiş oranı ortalaması'],
            ['27', 'zero_crossing_std', 'Onset/Beat', 'Sıfır geçiş oranı standart sapması'],
            ['28', 'temporal_patterns', 'Onset/Beat', 'Zamansal örüntü karmaşıklığı'],
            ['29', 'chroma_entropy', 'Harmonik', 'Chroma vektörü entropi'],
            ['30', 'chroma_std', 'Harmonik', 'Chroma standart sapması'],
            ['31', 'chroma_transition_rate', 'Harmonik', 'Chroma geçiş hızı'],
            ['32', 'tonnetz_std', 'Harmonik', 'Tonnetz standart sapması'],
            ['33', 'harmonic_ratio', 'Harmonik', 'Harmonik/toplam enerji oranı'],
            ['34', 'vocal_energy_ratio', 'Harmonik', 'Vokal enerji oranı'],
            ['35', 'vocal_harmonic_ratio', 'Harmonik', 'Vokal harmonik enerji oranı'],
            ['36', 'vocal_confidence', 'Vokal', 'Vokal tespit güven skoru'],
            ['37', 'has_vocals', 'Vokal', 'Vokal varlık göstergesi (0/1)'],
            ['38', 'pitch_mean_hz', 'Vokal', 'Perde ortalaması (Hz)'],
            ['39', 'pitch_std_cents', 'Vokal', 'Perde standart sapması (sent)'],
            ['40', 'pitch_stability_score', 'Vokal', 'Perde kararlılık skoru'],
            ['41', 'vibrato_rate_hz', 'Vokal', 'Vibrato hızı (Hz)'],
            ['42', 'vibrato_extent_cents', 'Vokal', 'Vibrato genişliği (sent)'],
            ['43', 'vibrato_regularity_score', 'Vokal', 'Vibrato düzenliliği skoru'],
            ['44', 'formant_consistency_score', 'Vokal', 'Formant tutarlılık skoru'],
            ['45', 'breath_pattern_score', 'Vokal', 'Nefes örüntüsü düzenliliği'],
            ['46', 'vocal_texture_score', 'Vokal', 'Vokal doku karmaşıklık skoru'],
            ['47', 'vocal_ai_score', 'Vokal', 'Vokal YZ yapaylık göstergesi'],
        ],
        'Çizelge Ek-1. AURIS 47 boyutlu akustik öznitelik vektörünün tam listesi.',
        col_widths=[0.8, 4.5, 2.5, 7.5]
    ),
    ('Ek 2. Sistem Gereksinimleri ve Kurulum', 'Heading 2'),
    T(
        ['Bileşen', 'Gereksinim', 'Notlar'],
        [
            ['İşletim Sistemi', 'Windows 10/11, macOS 12+, Ubuntu 20.04+', 'Docker ile platform bağımsız'],
            ['Python', '3.11 veya üzeri', 'pip ile bağımlılık yönetimi'],
            ['Node.js', '20.18.1 veya üzeri', 'npm 10+ dahil'],
            ['RAM', 'Minimum 8 GB', '16 GB önerilir'],
            ['Disk', '~500 MB', 'Model dosyaları dahil'],
            ['CPU', '4 çekirdek veya üzeri', 'GPU opsiyonel (CUDA 11.8+)'],
            ['Android', 'API 26+ (Android 8.0+)', 'Android Studio Hedgehog+'],
            ['Backend Port', '7860', 'uvicorn app.main:app --port 7860'],
            ['Web Port', '3000', 'cd platform && npm run dev'],
        ],
        'Çizelge Ek-2. AURIS sistem gereksinimleri.',
        col_widths=[3.5, 7.0, 5.0]
    ),
    ('Ek 3. Erişim Bilgileri', 'Heading 2'),
    ('AURIS\'e erişim için aşağıdaki bağlantılar kullanılabilir: '
     'Web platformu: hasanarthuraltunas.xyz | '
     'HuggingFace Spaces: huggingface.co/spaces/Rtur2003/AURIS | '
     'GitHub: github.com/Rtur2003/CrownCode', 'PARAGRAF METNİ'),
]

# ══════════════════════════════════════════════════════════════════════════════
# ÖZGEÇMİŞ
# ══════════════════════════════════════════════════════════════════════════════
OZGECMIS = [
    ('Hasan Arthur ALTUNTAŞ, 2002 yılında doğmuştur. 2020 yılında Düzce Üniversitesi '
     'Mühendislik Fakültesi Bilgisayar Mühendisliği Bölümü\'ne kayıt yaptırmıştır. '
     'Lisans eğitimi süresince yapay zekâ, makine öğrenmesi ve ses işleme '
     'konularında akademik çalışmalar yürütmüştür.', 'PARAGRAF METNİ'),
    ('BM401 Proje Tasarımı dersinde wav2vec2 tabanlı müzik tespit sistemi '
     'prototipi, BM498 Mezuniyet Tezi kapsamında AURIS adlı çok modelli '
     'akustik öznitelik tabanlı ses sınıflandırma sistemi geliştirmiştir. '
     'AURIS projesi GUJSA dergisine makale olarak gönderilmiştir. '
     'Çalışmalar boyunca Python, PyTorch, scikit-learn, librosa, '
     'Next.js ve Kotlin ile geliştirme yapılmıştır.',
     'PARAGRAF METNİ'),
    ('Öğrenci No: 221001047 | E-posta: hasannarthurrr@gmail.com | '
     'GitHub: github.com/Rtur2003 | Düzce Üniversitesi, Haziran 2026',
     'PARAGRAF METNİ'),
]

# ─────────────────────────────────────────────────────────────────────────────
# Bolum icerigi olusturucu
# ─────────────────────────────────────────────────────────────────────────────

def build_items(section, doc):
    result = []
    for item in section:
        if isinstance(item, tuple) and len(item) >= 2 and item[0] == '__TBL__':
            _, headers, rows, caption, col_widths = item
            elems = make_table_element(doc, headers, rows, caption, col_widths)
            result.extend(elems)
        elif isinstance(item, tuple) and len(item) == 2 and item[1] == '__FIG__':
            parts = item[0].split('|')   # __FIG|path|caption|width|__
            path = parts[1]
            caption = parts[2]
            width = float(parts[3])
            elems = fig(doc, path, caption, width)
            result.extend(elems)
        else:
            result.append(item)
    return result


# ─────────────────────────────────────────────────────────────────────────────
# Silinecek sablon notlari
# ─────────────────────────────────────────────────────────────────────────────
SILINCEK = [
    'Bu açıklama notlarını silmek için', 'OTOMATİK DEĞİŞİKLİKLERİ GÜNCELLEMEK',
    'ÇİZELGE, ŞEKİL VE DENKLEM NUMARALARI OTOMATİK', 'BÖLÜM BAŞLIKLARI SAYFA BAŞINDAN',
    'BAŞLIKLAR HER BİR EK İÇİN', 'TÜM BAŞLIKLAR KOPYALANIP', 'ALT BAŞLIK İTALİK OLMALIDIR',
    'EKLE MENÜSÜNDEN ÇAPRAZ BAŞVURU', 'NOT: BU KAYNAKLAR MENDELEY',
    'ENSON KAYNAKLAR KISMINA EKLERKEN', 'REFERANSLAR IEEE STANDARTLARINDA',
    'KAYNAKLAR 1 SATIR ARALIĞI', 'EKLER ANA VE ARA BAŞLIKLARI', 'DİPNOTLAR EKLENEBİLİR',
    'SADECE BUNLAR TEKRAR KOPYALANIP', 'SADECE BUNLARI TEKRAR KOPYALAYIP',
    'BAŞVURU TÜRÜ MENÜSÜNDE', 'BAŞVURU EKLE MENÜSÜ', 'HARİTA NUMARASI DEĞİŞTİĞİNDE',
    'ÖZGEÇMİŞ NUMARALANDIRILMAYACAKTIR', 'GİRİŞ BÖLÜMÜ ZORUNLUDUR',
    'SONUÇ BÖLÜMÜ ZORUNLUDUR', 'Bu TEZ ŞABLONU tez yazım',
    'Tezin Giriş Bölümü Tez ile', 'Bölüm 1, Tezin Giriş kısmıydı',
    'Aşağıda Tezde kullanılacak olan', 'NOT: BASKI ÖNİZLEME ŞEKLİ',
    'Çizelge 2.1 otomatik olarak', 'Şekil referansları şekillerden önce',
    'Şekil numarası değiştiğinde', 'Paragraf referansları şekillerden',
    'Çizelge referansları çizelgelerden', 'Şekilden önceki metin', 'seçilip, Biçim',
    '[1]\tG. Pipeleers', '[2]\tB. Lu, F. Wu', '[3]\tV. Q. Leu', '[4]\tM. Alma',
    '[5]\tK. Graichen', '[6]\tX. Litrico', '[7]\tI. Masubuchi',
    'Agharkakli, A.,', 'Altun, Y. (', 'Chowdhury, D.', 'Feng, Y.,', 'Lauwerys, C.',
    'Roy, P.,', 'Sinthipsomboon', 'Wang, K., He', 'Zhao, P., &', 'Zheng, J. ming',
    'Makale Örnek:', 'Konferans Örnek:', 'Kitap Örnek:',
    'Bu bölüm varsa Eklerin', 'Kaynakları metin içerisinde',
    'Kaynaklar listesi, tezdeki', 'Bunun için Mendeley', 'Mendeley program',
    'Araştırmada kaynak gösterilen', 'Elde edilen bilgilerin',
    'Örneğin:,(', 'Paragraf.', 'Birimler', 'Manzara', 'Harita ..', 'Türkiye solar', 'Rs',
]


# ─────────────────────────────────────────────────────────────────────────────
# ANA BUILD
# ─────────────────────────────────────────────────────────────────────────────
def build():
    print("[AURIS] Tez build v5 basliyor...")
    doc = Document(TEMPLATE)

    # [0a] Harita Listesi TOC
    print("  [0a] Harita Listesi TOC siliniyor...")
    for p in list(doc.paragraphs):
        if p.style.name.startswith('toc') and 'HAR' in p.text and 'LISTES' in p.text:
            safe_remove(p._element)
            break

    # [0b] Sablon notlari
    print("  [0b] Sablon notlari siliniyor...")
    to_rm = []
    for p in doc.paragraphs:
        t = p.text.strip()
        if not t:
            continue
        for s in SILINCEK:
            if s in t:
                to_rm.append(p._element)
                break
    removed = 0
    for el in to_rm:
        if el.getparent() is not None:
            safe_remove(el)
            removed += 1
    print(f"    {removed} not silindi.")

    # [1] Kapak
    print("  [1] Kapak guncelleniyor...")
    for p in doc.paragraphs:
        t = p.text
        if '202X-202X' in t:
            set_text(p, '2025-2026 AKADEMİK YILI', bold=True)
        elif p.style.name == 'Normal' and ('GÜZ/BAHAR' in t or 'G\xdcZ/BAHAR' in t):
            set_text(p, 'BAHAR DÖNEMİ', bold=True)
        elif 'BM401 B' in t and 'MEZUN' in t:
            set_text(p, 'BM498 MEZUNİYET TEZİ', bold=True)
        elif 'Unvan. Ad SOYAD' in t:
            set_text(p, 'Dr. Öğr. Üyesi Büşra TAKGİL')
        elif 'MEZUNİYET TEZİ/PROJE' in t or ('MEZUNİYET TEZ' in t and 'PROJE' in t):
            set_text(p, 'AURIS: AKUSTİK ÖZNİTELİK TABANLI YAPAY ZEKÂ ÜRETİMİ '
                     'MÜZİĞİN TESPİTİ İÇİN ÇOK MODELLİ TOPLULUK SİSTEMİ', bold=True)
        elif t.strip() == 'Ad SOYAD':
            set_text(p, 'Hasan Arthur ALTUNTAŞ', bold=True)
        elif '1111111111111' in t:
            set_text(p, '221001047')
        elif '(Öğrencinin Adı Soyadı)' in t or ('rencinin Ad' in t and 'Soyad' in t):
            set_text(p, 'Hasan Arthur ALTUNTAŞ')
        elif 'değerli katk' in t and 'danışman' in t:
            set_text(p, 'Bu tez çalışmasının her aşamasında değerli yönlendirmeleri ve '
                     'akademik rehberliğiyle süreci şekillendiren danışman hocam '
                     'Dr. Öğr. Üyesi Büşra TAKGİL\'e sonsuz teşekkürlerimi sunarım.')
        elif 'eş danışmanım Prof. Dr.' in t:
            clear_para(p)
        elif 'sevgili aileme' in t and 'çalışma arkadaşlar' in t:
            set_text(p, 'Tez süreci boyunca gösterdikleri anlayış ve destekten dolayı '
                     'aileme ve arkadaşlarıma teşekkür ederim.')
        elif 'BAP-XXX-WWW' in t:
            clear_para(p)

    # [2] ÖZET / ABSTRACT
    print("  [2] OZET/ABSTRACT guncelleniyor...")
    for p in doc.paragraphs:
        t = p.text
        if 'BURAYA TEZ BA' in t and 'NG' not in t:
            set_text(p, 'AURIS: AKUSTİK ÖZNİTELİK TABANLI YAPAY ZEKÂ ÜRETİMİ '
                     'MÜZİĞİN TESPİTİ İÇİN ÇOK MODELLİ TOPLULUK SİSTEMİ', bold=True)
        elif t.strip() in ('Öğrenci ADI',) or 'renci AD' in t:
            set_text(p, 'Hasan Arthur ALTUNTAŞ')
        elif 'Bitirme Tezi' in t and 'Bilgisayar' in t:
            set_text(p, 'Mühendislik Fakültesi, Bilgisayar Mühendisliği Bitirme Tezi')
        elif 'Danışman: Do' in t and ('ALTUN' in t or 'Altun' in t):
            set_text(p, 'Danışman: Dr. Öğr. Üyesi Büşra TAKGİL')
        elif 'Eylül 2019' in t:
            set_text(p, 'Haziran 2026')
        elif ('zeti bir paragraf' in t or 'Buraya tezin' in t) and 'ngilizce' not in t:
            set_text(p,
                'Suno, MusicGen, Udio ve Echoes gibi üretici yapay zekâ platformlarının '
                'yaygınlaşmasıyla yapay zekâ üretimi müzik parçaları içerik akış '
                'platformlarında hızla artmaktadır. Bu tez çalışmasında AURIS sistemi '
                'tasarlanmış ve geliştirilmiştir. AURIS, ses sinyallerinden 5 kategoride '
                'toplam 47 akustik öznitelik çıkarmakta; 7 klasik makine öğrenmesi ve '
                '4 derin öğrenme modelini 5 katlı tabakalı çapraz doğrulama protokolüyle '
                'karşılaştırmaktadır. 8 farklı kaynaktan derlenen 5.195 ses kaydı '
                'üzerinde eğitilen LightGBM modeli 0,8839 doğruluk, 0,8575 F1-skoru ve '
                '0,9548 ROC-AUC (Brier=0,083) elde etmiştir. Karar eşiği Youden J '
                'istatistiğiyle θ*=0,4316 olarak optimize edilmiştir. Sistem Next.js 14 '
                'web platformu, Kotlin/Jetpack Compose Android uygulaması ve FastAPI '
                'arka ucuyla tam yığın mimaride sunulmuştur. SHAP entegrasyonu her '
                'kararı öznitelik bazında açıklanabilir kılmaktadır.')
        elif 'Anahtar s' in t and 'zc' in t and 'bir' in t:
            set_text(p, 'Anahtar Kelimeler: yapay zekâ müzik tespiti, akustik öznitelik, '
                     'LightGBM, topluluk öğrenmesi, ses sınıflandırma.')
        elif 'BURAYA TEZ BA' in t and 'NG' in t:
            set_text(p, 'AURIS: A MULTI-MODEL ENSEMBLE SYSTEM FOR AI-GENERATED MUSIC '
                     'DETECTION USING ACOUSTIC FEATURES', bold=True)
        elif 'Student Name SURNAME' in t:
            set_text(p, 'Hasan Arthur ALTUNTAŞ')
        elif t.strip() == 'Faculty of Engineering, Computer Engineering':
            set_text(p, 'Faculty of Engineering, Computer Engineering, Undergraduate Thesis')
        elif 'Assoc. Prof. Dr. Yusuf ALTUN' in t:
            set_text(p, 'Supervisor: Asst. Prof. Dr. Büşra TAKGİL')
        elif 'September 2019' in t:
            set_text(p, 'June 2026')
        elif 'ngilizce' in t and 'zeti' in t:
            set_text(p,
                'The rapid proliferation of generative AI platforms such as Suno, MusicGen, '
                'Udio, and Echoes has led to a dramatic increase in AI-generated music on '
                'streaming platforms. This thesis presents AURIS, which extracts 47 acoustic '
                'features across five categories using librosa and evaluates 11 classification '
                'models under 5-fold stratified cross-validation. The best-performing LightGBM '
                'achieves 0.9548 ROC-AUC, 88.39% accuracy, 0.8575 F1-score, and Brier score '
                '0.083. Decision threshold is optimized to θ*=0.4316 via Youden\'s J statistic. '
                'SHAP provides feature-level explanations for every decision. The complete '
                'system is deployed as a web application on Hugging Face Spaces.')
        elif 'Keywords: Keyword one' in t:
            set_text(p, 'Keywords: AI music detection, acoustic features, LightGBM, '
                     'ensemble learning, audio classification.')

    # [3] H1 bolumleri
    print("  [3] H1 bolumleri dolduruluyor...")
    h1s = find_h1s(doc)

    def fill(key, title, section):
        if key not in h1s:
            print(f"    [UYARI] {key} bulunamadi")
            return
        p = h1s[key]
        set_text(p, title)
        delete_until_next_h1(p._element)
        items = build_items(section, doc)
        insert_block_after(p._element, items, doc)
        figs = sum(1 for i in items if not isinstance(i, tuple))
        print(f"    {key} -> {title!r} ({len(items)} item, {figs} gorsel/tablo elem)")

    fill('giris',       '1. GİRİŞ',                GIRIS)
    fill('mat_yont',    '2. LİTERATÜR TARAMASI',   LITERATUR)
    fill('bolum3',      '3. MATERYAL VE YÖNTEM',   MAT_YONT)
    fill('bolum4',      '4. BULGULAR',               BULGULAR)
    fill('bulgular_1',  '5. TARTIŞMA',               TARTISMA)
    fill('kaynaklarin', '6. SONUÇLAR VE ÖNERİLER',  SONUCLAR)

    # Sablon artiklari temizle
    for key in ('bulgular_2', 'bos_10', 'sonuclar_sab', 'bos_13'):
        if key in h1s:
            set_text(h1s[key], '')
            delete_until_next_h1(h1s[key]._element)

    # Kaynaklar
    if 'kaynaklar' in h1s:
        p = h1s['kaynaklar']
        set_text(p, '7. KAYNAKLAR')
        delete_until_next_h1(p._element)
        insert_block_after(p._element, [(r, 'Normal') for r in KAYNAKLAR], doc)
        print(f"    kaynaklar -> 7. KAYNAKLAR ({len(KAYNAKLAR)} ref)")

    # Ekler
    if 'ekler' in h1s:
        p = h1s['ekler']
        delete_until_next_h1(p._element)
        items = build_items(EKLER, doc)
        insert_block_after(p._element, items, doc)
        print(f"    ekler ({len(items)} item)")

    # Ozgecmis
    if 'ozgecmis' in h1s:
        p = h1s['ozgecmis']
        delete_until_next_h1(p._element)
        insert_block_after(p._element, OZGECMIS, doc)
        print(f"    ozgecmis ({len(OZGECMIS)} item)")

    # [4] Kaydet
    print("  [4] Kaydediliyor...")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    doc.save(OUT)
    sz = os.path.getsize(OUT) / 1024 / 1024
    print(f"[TAMAM] {OUT}")
    print(f"        Boyut: {sz:.2f} MB")


if __name__ == '__main__':
    build()
