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
# 1. GİRİŞ
# ══════════════════════════════════════════════════════════════════════════════
GIRIS = [
    ('1.1. Projenin Amacı ve Motivasyon', 'Heading 2'),
    ('Yapay zekâ teknolojilerinin müzik üretim alanına girişiyle birlikte Suno, MusicGen, '
     'Udio, Echoes, Stable Audio, AudioLDM2, Riffusion ve JEN-1 gibi platformlar dakikalar '
     'içinde profesyonel kalitede ses parçaları üretebilir hale gelmiştir. Bu gelişme '
     'telif hakkı ihlalleri, streaming gelir kayıpları ve müzik yarışmalarında etik '
     'ihlaller gibi ciddi sorunlara zemin hazırlamaktadır [1]. '
     'Şekil 1.1\'de AURIS sisteminin uçtan uca akış diyagramı verilmektedir; '
     'ses girişinden YZ/İnsan kararına kadar her işlem adımı şematik olarak özetlenmiştir.',
     'PARAGRAF METNİ'),
    F(f'{FIG}/paper_pipeline_diagram.png',
      'Şekil 1.1. AURIS sistem akış diyagramı — ses girişinden karar çıkışına uçtan uca işlem hattı.', 15.5),
    ('Üretici yapay zekâ sistemleri hız ve erişilebilirlik açısından devrimsel fırsatlar '
     'sunarken, insan ile yapay zekâ üretimi içerik arasındaki sınırı bulanıklaştırmaktadır. '
     'Algoritmik öneri sistemleri yapay zekâ içeriklerini otomatik olarak insanmış gibi '
     'sınıflandırabilmekte; bu durum insan sanatçıların streaming gelirlerini olumsuz '
     'etkilemekte ve telif hakkı sistemlerini zayıflatmaktadır. Bhatt vd. (2025) çapraz-üretici '
     'genellemenin alanın temel açık problemi olduğunu vurgularken, Liu vd. (2024) mevcut '
     'yaklaşımların büyük bölümünün tek üreticiye özgü kaldığını ve yeni sistemlere '
     'genelleme yapamadığını ortaya koymuştur [3],[15].', 'PARAGRAF METNİ'),
    ('1.2. Araştırma Sorusu ve Hedefler', 'Heading 2'),
    ('Bu çalışmanın temel araştırma sorusu şöyledir: "Spektral, zamansal, ritmik, harmonik '
     've vokal boyutları kapsayan el ile tasarlanmış 47 boyutlu akustik öznitelik vektörü, '
     'gradient boosting tabanlı topluluk yöntemiyle birleştirildiğinde, uçtan uca derin '
     'öğrenme yaklaşımlarıyla rekabet edebilir bir yapay zekâ müziği tespit performansı '
     'sağlayabilir mi?"', 'PARAGRAF METNİ'),
    ('Araştırmanın başlıca hedefleri şöyle sıralanabilir: '
     '(1) 5 ana kategoride toplam 47 akustik öznitelikten oluşan kapsamlı, yorumlanabilir '
     've müziğe özgü bir öznitelik vektörü tasarlamak; '
     '(2) 8 farklı kaynaktan derlenen 5.195 örnekli gerçek dünya veri kümesi oluşturmak; '
     '(3) 7 klasik makine öğrenmesi ve 4 derin öğrenme modelini aynı şeffaf 5 katlı '
     'çapraz doğrulama protokolüyle karşılaştırmak; '
     '(4) Youden J istatistiğiyle optimal karar eşiği belirlemek; '
     '(5) SHAP entegrasyonuyla her kararı öznitelik düzeyinde açıklanabilir kılmak; '
     '(6) Sistemi web, Android ve REST API katmanlarıyla üretim ortamına taşımak.',
     'PARAGRAF METNİ'),
    ('1.3. BM401–BM498 İki Dönemlik Süreç', 'Heading 2'),
    ('AURIS projesi iki akademik dönem boyunca aşamalı olarak geliştirilmiştir. '
     'BM401 (2024–2025 Güz Dönemi) kapsamında wav2vec2 tabanlı bir ön araştırma prototipi '
     'tasarlanmış; Next.js 14 web platformu ve Kotlin/Compose Android uygulamasının '
     'temel yapısı oluşturulmuştur. Ancak wav2vec2 embedding\'lerinin yorumlanamazlığı ve '
     'çapraz-üretici genelleme güçlüğü, araştırma odağının köklü biçimde değiştirilmesini '
     'zorunlu kılmıştır. '
     'BM498 (2024–2025 Bahar Dönemi) kapsamında ise el ile tasarlanmış 47 boyutlu akustik '
     'öznitelik vektörüne geçilmiş, veri kümesi 5.195 örneğe genişletilmiş, 11 modelli '
     'topluluk sistemi kurulmuş ve SHAP açıklanabilirlik katmanı eklenmiştir.',
     'PARAGRAF METNİ'),
    ('1.4. Tez Organizasyonu', 'Heading 2'),
    ('Bu tez altı ana bölümden oluşmaktadır. Bölüm 2\'de yapay zekâ müzik üretimi, '
     'ses derin sahteciliği tespiti ve transformer tabanlı ses gösterimleri literatürü '
     'sistematik olarak incelenmektedir. Bölüm 3\'te AURIS\'in veri kümesi, öznitelik '
     'mühendisliği hattı, model mimarileri, eğitim protokolü ve uygulama mimarisi '
     'ayrıntılı biçimde aktarılmaktadır. Bölüm 4\'te 11 modelin karşılaştırmalı '
     'performans bulguları sunulmaktadır. Bölüm 5\'te bulgular literatürle '
     'tartışılmaktadır. Bölüm 6\'da sonuçlar ve gelecek çalışma önerileri '
     'özetlenmektedir.', 'PARAGRAF METNİ'),
]

# ══════════════════════════════════════════════════════════════════════════════
# 2. LİTERATÜR TARAMASI
# ══════════════════════════════════════════════════════════════════════════════
LITERATUR = [
    ('2.1. Yapay Zekâ Müzik Üretim Sistemleri', 'Heading 2'),
    ('Müzik üretiminde yapay zekâ, son beş yılda üç ana paradigma etrafında '
     'şekillenmiştir: otoregresif modeller, difüzyon modelleri ve metin-müzik '
     'dönüşümü. Dhariwal vd. (2020) tarafından geliştirilen Jukebox [6], '
     'hiyerarşik VQ-VAE mimarisiyle 1,2 milyar parametreye ulaşan ilk büyük '
     'ölçekli müzik üretim modelidir; şarkı sözleri ve sanatçı stilini koşul '
     'olarak alabilmekte, ham ses formunda çıktı üretebilmektedir. '
     'Meta AI tarafından geliştirilen MusicGen (Copet vd., 2023) [5], metin '
     've melodi koşullandırmalı decoder-only transformer mimarisini EnCodec '
     'ses kodlayıcısı üzerine inşa etmiştir; 300M ile 3,3B parametre arasında '
     'üç ölçekte açık kaynak lisansıyla yayımlanmıştır. '
     'AudioLDM (Liu vd., 2023) [14], CLAP gösterimleriyle koşullandırılan '
     'latent difüzyon modelini sese uyarlamıştır.', 'PARAGRAF METNİ'),
    ('Suno (Suno AI, 2023) ve Udio (Udio AI, 2024) ticari olarak en geniş '
     'kullanıcı tabanına ulaşan sistemler arasındadır; Suno v4 ve v5, '
     'şarkı sözleri üretimini doğrudan entegre etmesi ve yüksek ses kalitesiyle '
     'öne çıkmaktadır. Bu sistemlerin ürettiği içeriklerin tespit edilmesi, '
     'hem metodolojik hem de pratik açıdan önem taşımaktadır.', 'PARAGRAF METNİ'),
    ('2.2. Ses Derin Sahteciliği ve YZ Müzik Tespiti', 'Heading 2'),
    ('Yapay zekâ üretimi ses tespiti, önce konuşma sentezi ve ses derin '
     'sahteciliği alanından ortaya çıkmıştır. WaveFake (Frank ve Schönherr, 2021) [8], '
     'yedi farklı vocoder mimarisinin çıktılarını barındıran temel kıyaslama '
     'noktasıdır. ADD 2022 Yarışması (Yi vd., 2022) [23], ses derin sahteciliği '
     'tespitinde üç farklı zorluk seviyesini kapsayan ilk uluslararası '
     'yarışmayı düzenlemiştir. Afchar vd. (2025) [1], IEEE ICASSP 2025\'te '
     'oto-kodlayıcı artefaktlarından yararlanarak %99,8 doğruluğa ulaşıldığını; '
     'ancak MP3 sıkıştırma ve perde kaydırma gibi basit işlemlerin tespit '
     'oranlarını önemli ölçüde düşürdüğünü sunmuştur.', 'PARAGRAF METNİ'),
    ('Liu vd. (2024) [15], ses derin sahteciliği tespitinden yapay zekâ '
     'üretimi müzik tespitine geçişi kapsamlı biçimde değerlendirmiş; mevcut '
     'yaklaşımların büyük bölümünün tek üretici sistemine özgü olduğunu ve '
     'yeni sistemlere genelleme yapamadığını ortaya koymuştur. Kosta vd. (2025) [12], '
     'Segment Transformer mimarisini önererek müzik yapısal analizi aracılığıyla '
     'tespit gerçekleştirmiştir.', 'PARAGRAF METNİ'),
    ('2.3. Transformer Tabanlı Ses Gösterimleri', 'Heading 2'),
    ('wav2vec2 (Baevski vd., 2020) [2], etiketlenmemiş konuşma verisi üzerinde '
     'öz-denetimli öğrenme yapan transformer modelidir; Martín-Doñas ve '
     'Álvarez (2022) [18] bu modeli ADD 2022 yarışmasına uygulamış ve öznitelik '
     'mühendisliği gerektirmeksizin rekabetçi sonuçlar elde etmiştir. '
     'CLAP (Elizalde vd., 2023) [7], karşıtsal ön eğitimi ses-metin embedding '
     'uzayına genişletmekte; LAION-CLAP varyantı (Wu vd., 2023) [22] 630.000 '
     'ses-metin çifti üzerinde eğitilmiştir. '
     'Bu yaklaşımlar yüksek performans sunmakla birlikte şeffaflık ve '
     'yorumlanabilirlik konusunda sınırlı kalmaktadır.', 'PARAGRAF METNİ'),
    ('2.4. Topluluk Yöntemleri ve Ses Sınıflandırması', 'Heading 2'),
    ('Topluluk yaklaşımları müzik analizi görevlerinde tek model sınıflandırıcılarını '
     'tutarlı biçimde geride bırakmaktadır. Kostrzewa vd. (2022) [13], geniş '
     'sinir ağı topluluklarının müzik türü sınıflandırmasında varyansı '
     'önemli ölçüde azalttığını göstermiştir. Gan vd. (2024) [9], VMD tabanlı '
     'öznitelik ayrıştırmasıyla birleştirilen XGBoost\'un rekabetçi müzik türü '
     'sınıflandırması gerçekleştirdiğini bildirmiştir. '
     'Gourisaria vd. (2024) [10], MFCC ve STFT özniteliklerinin karşılaştırmalı '
     'analizinde her iki öznitelik setinin birlikte kullanılmasının en iyi '
     'sonucu verdiğini bulmuştur.', 'PARAGRAF METNİ'),
    ('2.5. Mevcut Tespit Sistemleri ve Araştırma Boşlukları', 'Heading 2'),
    ('Tablo 2.1\'de mevcut başlıca tespit sistemleri AURIS ile karşılaştırmalı '
     'olarak özetlenmektedir. IRCAM Amplify ve Believe AI Radar ticari '
     'çözümler olup eğitim veri kümesi ve metodoloji şeffaf değildir. '
     'AURIS bu boşlukları; (1) kamuya açık çok üreticili veri kümesi, '
     '(2) şeffaf 5 katlı çapraz doğrulama, '
     '(3) SHAP tabanlı açıklanabilirlik ve '
     '(4) ücretsiz web/mobil/API dağıtımı ile kapatmaktadır.',
     'PARAGRAF METNİ'),
    T(
        ['Sistem', 'Erişim', 'Şeffaflık', 'SHAP', 'Çok Üretici', 'AUC'],
        [
            ['IRCAM Amplify', 'Ticari API', 'Hayır', 'Hayır', 'Bilinmiyor', 'Yayımlanmadı'],
            ['Believe AI Radar', 'Ticari', 'Hayır', 'Hayır', 'Bilinmiyor', 'Yayımlanmadı'],
            ['WaveFake tespiti', 'Akademik', 'Evet', 'Hayır', 'Kısmi', '0.99+'],
            ['Segment Transformer', 'Akademik', 'Evet', 'Hayır', 'Kısmi', '0.91+'],
            ['AURIS (bu çalışma)', 'Açık/Ücretsiz', 'Evet', 'Evet', 'Evet (12+)', '0.9549'],
        ],
        'Çizelge 2.1. Mevcut yapay zekâ müzik tespit sistemlerinin karşılaştırması.',
        col_widths=[3.8, 2.8, 2.5, 2.0, 2.5, 2.0]
    ),
]

# ══════════════════════════════════════════════════════════════════════════════
# 3. MATERYAL VE YÖNTEM
# ══════════════════════════════════════════════════════════════════════════════
MAT_YONT = [
    ('3.1. Sistem Mimarisine Genel Bakış', 'Heading 2'),
    ('AURIS dört ana modülden oluşmaktadır. '
     '(1) Ses Ön İşleme modülü: giriş formatlarını standartlaştırır '
     '(MP3, WAV, FLAC, OGG, maks. 50 MB, YouTube bağlantısı); '
     '(2) Öznitelik Çıkarma modülü: librosa v0.10.1 ile 47 boyutlu '
     'akustik vektör hesaplar; '
     '(3) Sınıflandırma modülü: 11 modeli 5 katlı tabakalı çapraz '
     'doğrulamayla eğitir ve Youden J eşiği uygular; '
     '(4) Açıklama modülü: SHAP değerlerini hesaplar ve kullanıcıya '
     'görsel olarak sunar.', 'PARAGRAF METNİ'),
    ('3.2. Veri Kümesi', 'Heading 2'),
    ('3.2.1. Derleme Stratejisi ve Kaynak Dağılımı', 'Heading 3'),
    ('Veri kümesi 5.195 ses kaydından oluşmaktadır: 3.113 insan (%59,9) ve '
     '2.082 yapay zekâ (%40,1). Bilinen yapay zekâ platformlarından gelen '
     'örnekler "1" (YZ), insan müziği arşivlerinden gelenler "0" (İnsan) '
     'olarak otomatik etiketlenmiştir. Yalnızca Creative Commons lisanslı '
     'arşivler kullanılmıştır. Veri sızıntısını önlemek amacıyla duration_sec '
     've sample_rate meta verileri öznitelik vektörünün dışında tutulmuştur. '
     'Tablo 3.1\'de kaynak dağılımı ayrıntılı olarak sunulmaktadır.',
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
    ('3.2.2. Ön İşleme Hattı', 'Heading 3'),
    ('Tüm ses kayıtları şu standartlaştırma adımlarından geçirilmiştir: '
     '(1) 22.050 Hz\'ye yeniden örnekleme; '
     '(2) Stereo → mono dönüşüm; '
     '(3) 30 saniyeyi aşan kayıtlar kırpılmış, daha kısa kayıtlar sıfır dolgulu; '
     '(4) Kalite filtresi — minimum 1 saniye uzunluk ve minimum 1×10⁻⁶ RMS genlik; '
     '(5) Veri sızıntısı önlemi — duration_sec ve sample_rate öznitelik vektöründen çıkarıldı.',
     'PARAGRAF METNİ'),
    ('3.3. Öznitelik Mühendisliği', 'Heading 2'),
    ('3.3.1. 47 Boyutlu Akustik Öznitelik Vektörü', 'Heading 3'),
    ('AURIS, librosa v0.10.1 [19] kullanarak 5 ana kategoride toplam 47 boyutlu '
     'öznitelik vektörü çıkarmaktadır. '
     'Spektral kategoride (16 öznitelik) MFCC varyans/delta/delta², '
     'spectral_centroid, bandwidth, rolloff, flatness, contrast ve regularity '
     'yer almaktadır. Zamansal/Ritmik kategoride (10 öznitelik) RMS enerji, '
     'standart sapma, dinamik aralık, sıfır geçiş oranı, tempo BPM, '
     'stabilite ve CV bulunmaktadır. Onset/Beat kategorisinde (9 öznitelik) '
     'onset güç ortalaması/standart sapması, beat sayısı ve IBI stabilitesi '
     'yer almaktadır. Harmonik/Tonal kategorisinde (8 öznitelik) chroma '
     'entropi, standart sapma ve geçiş hızı, Tonnetz standart sapması ve '
     'harmonik oran bulunmaktadır. Vokal/İfadesel kategorisinde (4 öznitelik) '
     'perde stabilitesi, vibrato düzenliliği, formant tutarlılığı ve nefes '
     'örüntüsü yer almaktadır.', 'PARAGRAF METNİ'),
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
    ('scikit-learn [21], XGBoost [4] ve LightGBM [11] ile toplam 7 model '
     'eğitilmiştir. Lojistik Regresyon: L2 düzenlileştirme, C=2,0, '
     'class_weight=balanced, çözücü=lbfgs, max_iter=1000. '
     'Rastgele Orman: n_estimators=500, max_features=log2, class_weight=balanced. '
     'Gradyan Artırma: n_estimators=180, max_depth=4, learning_rate=0,07. '
     'SVM-RBF: C=10, gamma=0,05, CalibratedClassifierCV sarmalayıcı. '
     'Çok Katmanlı Algılayıcı (MO): gizli_katmanlar=[192, 96, 32], '
     'alpha=0,001, aktivasyon=relu. '
     'XGBoost: n_estimators=240, max_depth=5, learning_rate=0,06, '
     'subsample=0,85, eval_metric=auc. '
     'LightGBM: n_estimators=300, num_leaves=31, learning_rate=0,05, '
     'class_weight=balanced, verbose=-1.', 'PARAGRAF METNİ'),
    ('3.4.2. Derin Öğrenme Modelleri', 'Heading 3'),
    ('PyTorch [20] ile 4 derin öğrenme modeli tasarlanmıştır. '
     'Tüm modellerde BCEWithLogitsLoss (pos_weight=1,5) ve Adam (lr=1e-3) '
     'ortak kullanılmıştır. '
     'Derin ÇKA (Deep MLP): katmanlar=[512, 256, 128, 64, 1], '
     'BatchNorm + Dropout(0,3), eğitim süresi 81,4 sn. '
     '1B Evrişimli Sinir Ağı (1B-ESA): Conv1D(1→32→64→128) + '
     'GlobalAvgPool + FC(128→1), eğitim süresi 125,0 sn. '
     'Artık ÇKA (ResidualMLP): 3 artık blok × 64 boyut + FC, '
     'artık bağlantılar, eğitim süresi 128,7 sn. '
     'Dikkat ÇKA (AttentionMLP): öz-dikkat başlığı (64 boyut) + '
     'ileri beslemeli katmanlar, eğitim süresi 149,6 sn.', 'PARAGRAF METNİ'),
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
            ['Artık ÇKA', 'DÖ', '3× artık blok [64]', '128,7'],
            ['Dikkat ÇKA', 'DÖ', 'Öz-dikkat [64] + FF', '149,6'],
        ],
        'Çizelge 3.3. 11 modelin mimari özeti ve eğitim süreleri.',
        col_widths=[3.8, 1.5, 6.2, 4.0]
    ),
    ('3.5. Eğitim Protokolü', 'Heading 2'),
    ('3.5.1. 5 Katlı Tabakalı Çapraz Doğrulama', 'Heading 3'),
    ('Tüm modeller StratifiedKFold (k=5, random_state=42) ile '
     'değerlendirilmiştir. Tabakalama, her katlamada sınıf dağılımını '
     '(%59,9 İnsan / %40,1 YZ) korumaktadır. StandardScaler yalnızca '
     'eğitim alt kümesine uyarlanmış, doğrulama alt kümesine '
     'transform uygulanmıştır — veri sızıntısını önleyen sızdırmaz '
     'ölçekleme. Derin öğrenme modelleri için erken durdurma '
     '(patience=10, val_loss izleme) uygulanmıştır. '
     'Şekil 3.5\'te eğitim ve çapraz doğrulama doğrulukları karşılaştırılmaktadır.',
     'PARAGRAF METNİ'),
    F(f'{FIG}/train_val_gap.png',
      'Şekil 3.5. Eğitim ve çapraz doğrulama doğruluğu — aşırı öğrenme tanısı (11 model).', 15.0),
    ('3.5.2. Youden J Eşik Optimizasyonu', 'Heading 3'),
    ('Her katlama için θ* = argmax(Duyarlılık + Özgüllük − 1) '
     'formülüyle optimal karar eşiği belirlenmektedir. '
     'LightGBM için θ* = 0,4316 olarak hesaplanmıştır; bu değer '
     'varsayılan 0,5 eşiğine kıyasla dengeli hata profili sağlamaktadır. '
     'Şekil 3.6\'da eşik taraması grafiği sunulmakta; Kesinlik, '
     'Duyarlılık, F1 ve Doğruluk eğrilerinin θ=0,4316\'da optimuma '
     'ulaştığı açıkça görülmektedir.', 'PARAGRAF METNİ'),
    F(f'{FIG}/threshold_sweep.png',
      'Şekil 3.6. Eşik taraması — Kesinlik/Duyarlılık/F1 eşiğe göre (LightGBM). Youden-J optimum: θ*=0,4316.', 14.5),
    ('3.6. SHAP Açıklanabilirlik Entegrasyonu', 'Heading 2'),
    ('AURIS, her tahmin için SHAP (Shapley Additive exPlanations, '
     'Lundberg ve Lee, 2017) [17] değerlerini hesaplamaktadır. '
     'LightGBM\'in TreeExplainer arayüzü SHAP değerlerini polinom '
     'zamanda hesaplamakta; bu özellik gerçek zamanlı kullanım için '
     'pratik bir avantaj sağlamaktadır. Kullanıcıya her analizde '
     'hangi özniteliklerin YZ ya da İnsan kararına ne kadar katkı '
     'yaptığı beeswarm ve waterfall grafikleriyle görsel olarak sunulmaktadır.',
     'PARAGRAF METNİ'),
    ('3.7. Uygulama Mimarisi', 'Heading 2'),
    ('AURIS üç katmanlı bir uygulama mimarisine sahiptir. '
     'Web platformu Next.js 14 + TypeScript ile geliştirilmiş; '
     'Netlify CDN üzerinde statik dağıtım yapılmaktadır. '
     'Android uygulaması Kotlin + Jetpack Compose ile MVVM/Clean '
     'Architecture deseni, Hilt bağımlılık enjeksiyonu, Retrofit '
     'HTTP istemcisi ve Room kalıcı depolama kullanılarak '
     'Android API 26+ (8.0+) için geliştirilmiştir. '
     'FastAPI arka ucu Python 3.11 ile HuggingFace Spaces üzerinde '
     '7860 portunda Docker konteyneri olarak çalışmaktadır.',
     'PARAGRAF METNİ'),
    F(f'{SCR}/auris_web_hero.png',
      'Şekil 3.7. AURIS web platformu ana sayfası (Next.js 14, Netlify CDN).', 14.5),
    F(f'{SCR}/auris_web_sec1.png',
      'Şekil 3.8. AURIS web platformu — dosya yükleme ve YouTube analiz bölümü.', 14.5),
    F(f'{SCR}/auris_mobile_hero.png',
      'Şekil 3.9. AURIS Android uygulaması ana ekranı (Kotlin/Jetpack Compose, API 26+).', 7.5),
    F(f'{SCR}/auris_mobile_upload.png',
      'Şekil 3.10. AURIS Android uygulaması analiz ekranı — sonuç ve SHAP görünümü.', 7.5),
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
    ('Şekil 4.3\'te tüm modellerin performans ısı haritası sunulmaktadır. '
     'Her sütunun en yüksek değeri belirginleştirilmiştir; '
     'LightGBM ROC-AUC\'ta, Derin ÇKA ise Doğruluk ve F1 Skorunda '
     'öne çıkmaktadır.', 'PARAGRAF METNİ'),
    F(f'{FIG}/all_models_heatmap.png',
      'Şekil 4.3. Tüm modeller performans ısı haritası (sütun bazında en iyi değer belirginleştirilmiştir).', 15.0),
    ('4.2. ROC Eğrileri Analizi', 'Heading 2'),
    ('Şekil 4.4\'te 11 modelin gerçek-tutulan kat tahminleriyle üretilen '
     'ROC eğrileri gösterilmektedir. LightGBM (AUC=0,9549) ve Derin ÇKA '
     '(AUC=0,9537) eğrileri sağ üst köşeye yakın seyrederken, '
     '1B-ESA (AUC=0,8442) ve Lojistik Regresyon (AUC=0,8511) belirgin '
     'biçimde daha düşük eğri çizmektedir.', 'PARAGRAF METNİ'),
    F(f'{FIG}/paper_roc_curves.png',
      'Şekil 4.4. ROC eğrileri — 5 katlı gerçek-tutulan tahminler. Kesikli çizgi: rastgele sınıflandırıcı (AUC=0,500).', 14.5),
    ('4.3. Çapraz Doğrulama Stabilitesi', 'Heading 2'),
    ('Şekil 4.5\'te 5 katlı çapraz doğrulama AUC sonuçlarının katlama bazlı '
     'ortalama ve standart sapma değerleri tablosu verilmektedir. '
     'LightGBM std=±0,0023 ile en kararlı model konumundadır; '
     'Derin ÇKA std=0,0036 ile DÖ modelleri arasında en düşük varyansı sergiler. '
     '1B-ESA std=0,0087 ile en yüksek kararsızlığı göstermektedir.',
     'PARAGRAF METNİ'),
    F(f'{FIG}/paper_fold_std_table.png',
      'Şekil 4.5. 5 katlı çapraz doğrulama AUC sonuçları — Ort. ± Std, tüm 11 model.', 15.0),
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
     'açık problemi olduğunu vurgulamakta [3]; AURIS\'in çok '
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
     'rakipsiz bir konumdadır.',
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
    ('6.3. Gelecek Çalışma Önerileri', 'Heading 2'),
    ('Kısa vadeli öneriler (0–6 ay): '
     '(1) Veri kümesini 10.000+ örneğe genişletmek; '
     '(2) Yeni üreticileri (Suno v6, Stability AI, Lyria) dahil etmek; '
     '(3) Görülmemiş üreticilerden bağımsız test setiyle '
     'çapraz-üretici genellemeyi resmi olarak değerlendirmek; '
     '(4) Adversarial dayanıklılığı sistematik biçimde test etmek; '
     '(5) wav2vec2 modelini 5 katlı CV protokolüyle '
     'formal karşılaştırmalı değerlendirmeye almak.',
     'PARAGRAF METNİ'),
    ('Uzun vadeli öneriler (6+ ay): '
     '(1) iOS uygulaması geliştirmek; '
     '(2) Tür-tabakalı değerlendirme ile tür bağımlı performansı '
     'sistematik olarak incelemek; '
     '(3) Çok kipli analiz (ses + şarkı sözleri + meta veri) '
     'entegrasyonu; '
     '(4) Gerçek zamanlı akış için çevrimiçi öznitelik çıkarma '
     'hattı geliştirmek; '
     '(5) Federe öğrenme ile sürekli model güncelleme ve '
     'yeni üreticilere adaptasyon sağlamak.',
     'PARAGRAF METNİ'),
]

# ══════════════════════════════════════════════════════════════════════════════
# 7. KAYNAKLAR
# ══════════════════════════════════════════════════════════════════════════════
KAYNAKLAR = [
    ('[1]\tAfchar, D., Meseguer Brocal, G. ve Hennequin, R. (2025). '
     'AI-Generated Music Detection and Its Challenges. '
     'Proceedings of IEEE ICASSP 2025. '
     'https://doi.org/10.48550/arXiv.2501.10111'),
    ('[2]\tBaevski, A., Zhou, Y., Mohamed, A. ve Auli, M. (2020). '
     'wav2vec 2.0: A Framework for Self-Supervised Learning of Speech Representations. '
     'Advances in Neural Information Processing Systems, 33, 12449-12460.'),
    ('[3]\tBhatt, A., Rajan, A. ve diğerleri. (2025). '
     'AI-Generated Music Detection: A Survey of Methods and Datasets. '
     'arXiv preprint. https://doi.org/10.48550/arXiv.2501.10111'),
    ('[4]\tChen, T. ve Guestrin, C. (2016). '
     'XGBoost: A Scalable Tree Boosting System. '
     'Proc. 22nd ACM SIGKDD, s. 785-794.'),
    ('[5]\tCopet, J., Kreuk, F., Gat, I., Remez, T., Kant, D., Synnaeve, G., '
     'Adi, Y. ve Défossez, A. (2023). '
     'Simple and Controllable Music Generation. '
     'Advances in NeurIPS, 36, 47704-47720.'),
    ('[6]\tDhariwal, P., Jun, H., Payne, C., Kim, J. W., Radford, A. ve Sutskever, I. (2020). '
     'Jukebox: A Generative Model for Music. '
     'arXiv preprint arXiv:2005.00341.'),
    ('[7]\tElizalde, B., Deshmukh, S., Al Ismail, M. ve Wang, H. (2023). '
     'CLAP: Learning Audio Concepts from Natural Language Supervision. '
     'Proc. ICASSP 2023, s. 1-5. IEEE.'),
    ('[8]\tFrank, J. ve Schönherr, L. (2021). '
     'WaveFake: A Data Set to Facilitate Audio Deepfake Detection. '
     'NeurIPS 2021 Datasets and Benchmarks Track.'),
    ('[9]\tGan, R., Huang, T., Shao, J. ve Wang, F. (2024). '
     'Music Genre Classification Based on VMD-IWOA-XGBoost. '
     'Mathematics, 12(10), 1549. https://doi.org/10.3390/math12101549'),
    ('[10]\tGourisaria, M. K., Agrawal, R. ve Sahni, M. (2024). '
     'Comparative Analysis of Audio Classification with MFCC and STFT Features '
     'Using Machine Learning Techniques. '
     'Discover Internet of Things, 4.'),
    ('[11]\tKe, G., Meng, Q., Finley, T., Wang, T., Chen, W., Ma, W., Ye, Q. ve Liu, T. (2017). '
     'LightGBM: A Highly Efficient Gradient Boosting Decision Tree. '
     'Advances in NeurIPS, 30.'),
    ('[12]\tKosta, K., Meseguer Brocal, G., Afchar, D. ve Hennequin, R. (2025). '
     'Segment Transformer: AI-Generated Music Detection via Music Structural Analysis. '
     'arXiv:2509.08283.'),
    ('[13]\tKostrzewa, D., Mazur, W. ve Brzeski, R. (2022). '
     'Wide Ensembles of Neural Networks in Music Genre Classification. '
     'Proc. MISSI 2022, s. 91-102. Springer.'),
    ('[14]\tLiu, H., Chen, Z., Yuan, Y., Mei, X., Liu, X., Mandic, D., Wang, W. '
     've Plumbley, M. D. (2023). '
     'AudioLDM: Text-to-Audio Generation with Latent Diffusion Models. '
     'Proc. ICML 2023.'),
    ('[15]\tLiu, Y. ve diğerleri. (2024). '
     'From Audio Deepfake Detection to AI-Generated Music Detection: '
     'A Pathway and Overview. arXiv:2412.00571.'),
    ('[16]\tLiu, Y., Yin, Y., Zhu, Q. ve Cui, W. (2022). '
     'Musical Instrument Recognition by XGBoost Combining Feature Fusion. '
     'arXiv:2206.00901.'),
    ('[17]\tLundberg, S. M. ve Lee, S. I. (2017). '
     'A Unified Approach to Interpreting Model Predictions. '
     'Advances in NeurIPS, 30.'),
    ('[18]\tMartín-Doñas, J. M. ve Álvarez, A. (2022). '
     'The Vicomtech Audio Deepfake Detection System Based on Wav2vec2 '
     'for the 2022 ADD Challenge. '
     'Proc. ICASSP 2022, s. 9266-9270. IEEE.'),
    ('[19]\tMcFee, B., Raffel, C., Liang, D., Ellis, D. P. W., McVicar, M., '
     'Battenberg, E. ve Nieto, O. (2015). '
     'librosa: Audio and Music Signal Analysis in Python. '
     'Proc. 14th Python in Science Conf., s. 18-25.'),
    ('[20]\tPaszke, A. ve diğerleri. (2019). '
     'PyTorch: An Imperative Style, High-Performance Deep Learning Library. '
     'Advances in NeurIPS, 32.'),
    ('[21]\tPedregosa, F. ve diğerleri. (2011). '
     'Scikit-learn: Machine Learning in Python. '
     'Journal of Machine Learning Research, 12, 2825-2830.'),
    ('[22]\tWu, Y., Chen, K., Zhang, T., Hui, Y., Berg-Kirkpatrick, T. ve Dubnov, S. (2023). '
     'Large-Scale Contrastive Language-Audio Pretraining with Feature Fusion. '
     'Proc. ICASSP 2023. IEEE.'),
    ('[23]\tYi, J., Fu, R., Tao, J., Nie, S., Ma, H., Wang, C. ve diğerleri. (2022). '
     'ADD 2022: The First Audio Deep Synthesis Detection Challenge. '
     'Proc. ICASSP 2022, s. 9216-9220. IEEE.'),
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
