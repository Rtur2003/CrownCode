# -*- coding: utf-8 -*-
"""
BM498 Mezuniyet Tezi - Tam Build (v3)
AURIS — Hasan Arthur Altuntas — 221001047 — Duzce Universitesi

Yenilikler v3:
- Gorseller (python-docx add_picture) Sekil kaynagi + altyazi
- XML corruption fix: her silme once parent kontrolu
- Bol akademik metin, tum bolumler tam
- Turkce etiketli tum gorseller kullaniliyor
"""
import os
import copy
from docx import Document
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.shared import Cm, Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

TEMPLATE = "docs/academic/TeslimEdilecekler/tezşablonu.docx"
OUT = "docs/academic/TeslimEdilecekler/1.TEZ-RAPOR/BM498_Mezuniyet_Tezi_Hasan_Arthur_Altuntas.docx"
FIGURES = "docs/academic/figures"
SCREENSHOTS = "docs/academic/figures/screenshots"

# ─────────────────────────────────────────────────────────────────────────────
# XML Yardimcilari
# ─────────────────────────────────────────────────────────────────────────────

def safe_remove(elem):
    """Elementi guvende kaldirma: parent None ise atla."""
    try:
        parent = elem.getparent()
        if parent is not None:
            parent.remove(elem)
    except Exception:
        pass

def get_style_id(doc, name):
    try:
        return doc.styles[name].style_id
    except KeyError:
        return name.replace(' ', '')

def make_p(doc, text, style_name):
    """Yeni <w:p> XML elementi olustur."""
    sid = get_style_id(doc, style_name)
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
    """Paragrafin run'larini temizle, yeni metin yaz."""
    for r in para._element.findall(qn('w:r')):
        para._element.remove(r)
    run = para.add_run(text)
    if bold:
        run.bold = True

def clear_para(para):
    for r in para._element.findall(qn('w:r')):
        para._element.remove(r)

def insert_block_after(anchor_el, items, doc):
    """
    anchor_el'den sonra items listesini ekle.
    items: [(text, style_name), ...] veya icerik dict listesi
    Donus: son eklenen element
    """
    cur = anchor_el
    for item in items:
        if isinstance(item, tuple):
            text, style_name = item
            new_p = make_p(doc, text, style_name)
        else:
            new_p = item  # ham XML element
        cur.addnext(new_p)
        cur = new_p
    return cur

def delete_until_next_h1(heading_elem):
    """heading_elem'den sonraki icerigi sil, sonraki H1'e kadar (H1 dahil degil)."""
    to_delete = []
    nxt = heading_elem.getnext()
    while nxt is not None:
        tag = nxt.tag.split('}')[-1] if '}' in nxt.tag else nxt.tag
        if tag == 'p':
            pStyle = nxt.find('.//' + qn('w:pStyle'))
            if pStyle is not None and pStyle.get(qn('w:val'), '') == 'Balk1':
                break
        to_delete.append(nxt)
        nxt = nxt.getnext()
    for el in to_delete:
        safe_remove(el)

# ─────────────────────────────────────────────────────────────────────────────
# Gorsel Ekleme
# ─────────────────────────────────────────────────────────────────────────────

def make_figure_elements(doc, img_path, caption_text, width_cm=14.0):
    """
    Gorsel + altyazi icin XML element listesi dondur.
    [sekil_p_elem, caption_p_elem]
    """
    results = []

    # Gorsel paragraf
    fig_para = doc.add_paragraph()
    fig_para.style = doc.styles['Normal']
    fig_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    try:
        # Syle 'Sekiller' varsa kullan
        try:
            fig_para.style = doc.styles['Şekiller']
        except KeyError:
            fig_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = fig_para.add_run()
        w = Cm(width_cm)
        run.add_picture(img_path, width=w)
    except Exception as e:
        print(f"    [UYARI] Gorsel yuklenemedi: {img_path} — {e}")
        run = fig_para.add_run(f"[Şekil: {os.path.basename(img_path)}]")

    # Altyazi paragraf
    cap_para = doc.add_paragraph()
    try:
        cap_para.style = doc.styles['Şekil Yazısı']
    except KeyError:
        cap_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap_run = cap_para.add_run(caption_text)
    cap_run.bold = True

    results.append(fig_para._element)
    results.append(cap_para._element)
    return results

# ─────────────────────────────────────────────────────────────────────────────
# H1 Konumsal Bulma
# ─────────────────────────────────────────────────────────────────────────────

def find_h1_elements(doc):
    h1s = [p for p in doc.paragraphs if p.style.name == 'Heading 1']
    keys = [
        'giris',        # 00
        'mat_yont',     # 01
        'bolum3',       # 02
        'bos_3',        # 03  (sayfa kesme, dokunma)
        'bolum4',       # 04
        'bos_5',        # 05
        'bulgular_1',   # 06
        'bos_7',        # 07
        'kaynaklarin',  # 08
        'bulgular_2',   # 09
        'bos_10',       # 10
        'sonuclar_sab', # 11
        'kaynaklar',    # 12
        'bos_13',       # 13
        'ekler',        # 14
        'ozgecmis',     # 15
    ]
    result = {}
    for i, h in enumerate(h1s):
        if i < len(keys):
            result[keys[i]] = h
    print(f"  Bulunan H1: {len(h1s)}")
    for k, h in result.items():
        txt = h.text[:40].encode('ascii', 'replace').decode()
        print(f"    {k}: {txt!r}")
    return result

# ─────────────────────────────────────────────────────────────────────────────
# BOLUM ICERIKLERI
# ─────────────────────────────────────────────────────────────────────────────

GIRIS = [
    ('1.1. Problemin Tanımı ve Araştırmanın Motivasyonu', 'Heading 2'),
    ('Suno, MusicGen, Udio ve Echoes gibi üretici yapay zekâ platformlarının son yıllarda '
     'gösterdiği hızlı ilerleme, müzik üretim alanını köklü biçimde dönüştürmüştür. Bu '
     'platformlar müzik teorisi bilgisi olmayan bir kullanıcının dakikalar içinde yüksek '
     'kaliteli, profesyonel düzeyde müzik üretmesine olanak tanımaktadır. Meta tarafından '
     'geliştirilen açık kaynak model MusicGen (Copet vd., 2023), AudioLDM2 (Liu vd., 2023) '
     've ticari platformlar Suno ile Udio yapay zekâ müziğini geniş kitlelere '
     'yaymıştır [5],[14].', 'PARAGRAF METNİ'),
    ('Bu teknolojik dönüşüm beraberinde ciddi etik, hukuki ve ekonomik sorunları '
     'getirmektedir. Yapay zekâ üretimi parçaların insan eserleriyle karışarak streaming '
     'platformlarına yüklenmesi telif hakkı ihlallerine zemin hazırlamaktadır. Algoritmik '
     'öneri sistemleri yapay zekâ üretimi içerikleri insanmış gibi göstererek insan '
     'sanatçıların gelirlerini olumsuz etkileyebilmektedir. Müzik yarışmalarında ve burs '
     'değerlendirmelerinde yapay zekâ eserleri insan yaratıcılığı olarak '
     'sunulabilmektedir [1].', 'PARAGRAF METNİ'),
    ('Yapay zekâ üretimi ses tespiti alanındaki araştırmaların büyük bölümü konuşma sentezi '
     've ses derin sahteciliğine odaklanmış; müziğe özgü tespit sistemleri görece az ilgi '
     'görmüştür. Liu vd. (2024) bu alanı "gelişmekte olan" olarak nitelendirmekte ve mevcut '
     'yaklaşımların büyük çoğunluğunun tek bir üretici sisteme özgü olduğunu, dolayısıyla '
     'yeni sistemlere genelleme yapamadığını vurgulamaktadır [15]. Bhatt vd. (2025) ise '
     'çapraz-üretici genellemenin alanın temel açık problemi olduğunu ortaya '
     'koymaktadır [3].', 'PARAGRAF METNİ'),
    ('AURIS (Acoustic Understanding and Recognition Intelligence System) bu boşluğu kapatmak '
     'amacıyla tasarlanmıştır. 12\'den fazla yapay zekâ üretim sistemini kapsayan bir eğitim '
     'veri kümesi, 47 boyutlu akustik öznitelik vektörü ve 11 modelin sistematik '
     'karşılaştırması ile hem teknik katkı hem yorumlanabilirlik sunan açık kaynaklı bir '
     'çözüm önerilmektedir.', 'PARAGRAF METNİ'),
    ('1.2. Araştırmanın Amaç ve Kapsamı', 'Heading 2'),
    ('Bu çalışmanın temel araştırma sorusu şöyledir: "Spektral, zamansal, ritmik, harmonik ve '
     'vokal boyutları kapsayan el ile tasarlanmış akustik öznitelikler, gradient boosting '
     'topluluğuyla birleştirildiğinde, uçtan uca derin öğrenme yaklaşımlarıyla rekabet '
     'edebilir bir yapay zekâ müziği tespit performansı sağlayabilir mi?" Bu soru, hem '
     'yorumlanabilirlik hem de genelleme kapasitesi açısından pratik bir öneme '
     'sahiptir.', 'PARAGRAF METNİ'),
    ('Belirlenen hedefler: (1) 5 kategoride 47 öznitelikten oluşan kapsamlı ve yorumlanabilir '
     'bir akustik öznitelik vektörü tasarlamak; (2) 8 farklı kaynaktan derlenen 5.195 örnekli '
     'gerçek dünya veri kümesi oluşturmak; (3) 7 klasik makine öğrenmesi ve 4 derin öğrenme '
     'modelini aynı değerlendirme protokolüyle karşılaştırmak; (4) Youden J istatistiğiyle '
     'optimize edilmiş karar eşiği belirlemek; (5) SHAP entegrasyonuyla her kararı öznitelik '
     'bazında açıklanabilir kılmak; (6) Sistemi web, Android ve API katmanlarıyla üretim '
     'ortamına taşımak.', 'PARAGRAF METNİ'),
    ('1.3. BM401-BM498 İki Dönemlik Araştırma Süreci', 'Heading 2'),
    ('Bu proje iki akademik dönemde sistematik biçimde geliştirilmiştir. BM401 (2024-2025 Güz '
     'Dönemi) aşamasında wav2vec2 tabanlı hibrit bir yaklaşım tasarlanmış; konuşma bağlamında '
     'ön eğitimli transformer modeli müzik sınıflandırmasına uyarlanmış, Next.js 14 web '
     'platformu ve Kotlin Android uygulaması prototip düzeyinde geliştirilmiştir.', 'PARAGRAF METNİ'),
    ('BM498 (2024-2025 Bahar Dönemi) aşamasında araştırma odağı köklü biçimde değişmiştir: '
     'wav2vec2 embedding\'lerinin yorumlanamazlığı ve müzik alanına özgü özelleştirme '
     'güçlükleri nedeniyle el ile tasarlanmış 47 boyutlu akustik öznitelik vektörüne '
     'geçilmiş; veri kümesi 5.195 örneğe genişletilmiş ve SHAP açıklanabilirlik katmanı '
     'entegre edilmiştir. Bu geçiş hem model yorumlanabilirliğini artırmış hem de çapraz-'
     'üretici genelleme kapasitesini güçlendirmiştir.', 'PARAGRAF METNİ'),
    ('1.4. Tez Organizasyonu', 'Heading 2'),
    ('Bölüm 2\'de yapay zekâ müzik üretimi, ses derin sahteciliği tespiti, transformer tabanlı '
     'ses gösterimleri ve topluluk yöntemlerine ilişkin ilgili literatür ele alınmaktadır. '
     'Bölüm 3\'te veri kümesi derleme stratejisi, öznitelik mühendisliği, model mimarileri, '
     'eğitim protokolü ve uygulama mimarisi ayrıntılı biçimde açıklanmaktadır. Bölüm 4\'te '
     'tüm modellerin performans karşılaştırması, öznitelik önemi analizi ve kalibrасyon '
     'değerlendirmesi sunulmaktadır. Bölüm 5\'te bulgular tartışılmakta; Bölüm 6\'da '
     'sonuçlar özetlenmekte ve gelecek çalışma önerileri verilmektedir.', 'PARAGRAF METNİ'),
]

LITERATUR = [
    ('2.1. Yapay Zekâ Müzik Üretim Sistemleri', 'Heading 2'),
    ('Müzik üretiminde yapay zekâ kullanımı son yıllarda üç ana paradigma etrafında '
     'şekillenmiştir: otoregresif modeller, difüzyon modelleri ve transformer tabanlı metin-'
     'müzik dönüşümü. Dhariwal vd. (2020) tarafından geliştirilen Jukebox, ham ses formunda '
     'doğrudan waveform üreten ilk büyük ölçekli modeldir [6]. 1,2 milyar parametresiyle '
     'dönemin en büyük müzik modeli olan Jukebox, hiyerarşik VQ-VAE mimarisini '
     'kullanmakta; şarkı sözleri ve sanatçı stilini koşul olarak alabilmektedir.', 'PARAGRAF METNİ'),
    ('Meta AI tarafından geliştirilen MusicGen (Copet vd., 2023), metin ve melodi '
     'koşullandırmalı, yüksek kaliteli müzik üretebilen decoder-only transformer '
     'mimarisidir [5]. Model EnCodec ses kodlayıcısı üzerine inşa edilmiş; 300M, 1,5B ve '
     '3,3B parametre ölçeklerinde açık kaynak lisansıyla yayımlanmıştır. MusicGen, '
     'standart değerlendirme ölçütlerinde Riffusion ve Mousai\'yi geride '
     'bırakmıştır.', 'PARAGRAF METNİ'),
    ('AudioLDM (Liu vd., 2023), latent difüzyon modellerini ses üretimine uyarlamış; CLAP '
     'gösterimleriyle koşullandırılan model metin girdisiyle yüksek kaliteli ses sentezi '
     'yapabilmektedir [14]. AudioLDM2, çok kipli içerik üretimini destekleyen ikinci nesil '
     'versiyondur. Ticari platformlar Suno (v3, v3.5, v4, v5) ve Udio kendi tescilli '
     'difüzyon ve otoregresif mimarilerini kullanmaktadır.', 'PARAGRAF METNİ'),
    ('2.2. Ses Derin Sahteciliği Tespiti', 'Heading 2'),
    ('Yapay zekâ üretimi ses tespitine ilişkin sistematik araştırma ilk olarak konuşma '
     'sentezi ve ses derin sahteciliği alanında başlamıştır. WaveFake veri kümesi (Frank ve '
     'Schönherr, 2021), yedi farklı vocoder mimarisinin çıktılarını barındıran temel bir '
     'kıyaslama noktası oluşturmuştur [8]. Bu çalışma mel-spektrogram özellikleriyle '
     'birleştirilen hafif sınıflandırıcıların bilinen vocoderlarda yüksek tespit oranları '
     'elde edebildiğini, ancak görülmemiş mimarilerde önemli ölçüde gerilediğini '
     'göstermiştir.', 'PARAGRAF METNİ'),
    ('ADD 2022 Yarışması (Yi vd., 2022), ses derin sahteciliği tespiti alanında üç farklı '
     'zorluğu kapsamıştır: düşük kaliteli sahte sesler, kısmen sahte ses ve çelişkili '
     'koşullar [23]. Yi vd. (2023), 2008-2023 yılları arasında yayımlanan araştırmaları '
     'kapsamlı biçimde incelemiş; MFCC, LFCC, CQT ve mel-spektrogram tabanlı özniteliklerin '
     'farklı derin öğrenme sınıflandırıcılarla kombinasyonlarını 17 veri kümesi üzerinde '
     'karşılaştırmıştır [24].', 'PARAGRAF METNİ'),
    ('Müziğe özgü tespit araştırmaları görece yenidir. Liu vd. (2024), ses derin sahteciliği '
     'tespitinden yapay zekâ üretimi müzik tespitine geçişi "yol haritası ve genel bakış" '
     'perspektifiyle ele almaktadır [15]. Afchar vd. (2025), oto-kodlayıcı artefaktlarından '
     'yararlanarak dedektörlerin %99,8 doğruluğa ulaşabildiğini, ancak MP3 sıkıştırma ve '
     'perde kaydırma gibi basit ses işleme işlemlerinin tespit oranlarını önemli ölçüde '
     'düşürdüğünü IEEE ICASSP 2025\'te sunmuştur [1].', 'PARAGRAF METNİ'),
    ('2.3. Transformer Tabanlı Ses Gösterimleri', 'Heading 2'),
    ('wav2vec2 (Baevski vd., 2020), etiketlenmemiş konuşma verisi üzerinde öz-denetimli '
     'öğrenme yapan bir transformer modelidir [2]. Model, kuantize edilmiş latent vektörler '
     'üzerindeki karşıtsal hedeflerle 960 saatlik LibriSpeech verisi üzerinde eğitilmiştir. '
     'Martín-Doñas ve Álvarez (2022), wav2vec2\'yi ADD 2022 yarışmasına doğrudan uygulayarak '
     'öznitelik mühendisliği gerektirmeksizin rekabetçi sonuçlar elde etmiştir [18].', 'PARAGRAF METNİ'),
    ('CLAP (Elizalde vd., 2023), karşıtsal önceden eğitimi ses-metin embedding uzayına '
     'genişletmektedir [7]. Wu vd. (2023) tarafından geliştirilen LAION-CLAP varyantı '
     '630.000 ses-metin çifti üzerinde eğitilmiştir [22]. Kosta vd. (2025) ise Segment '
     'Transformer\'ı önermiştir: müzik bölümlerinin dizisini işleyerek öz-denetimli önceden '
     'eğitilmiş gösterimlerle yapısal analiz yapmaktadır [12].', 'PARAGRAF METNİ'),
    ('2.4. Topluluk Yöntemleri ve Ses Sınıflandırması', 'Heading 2'),
    ('Topluluk yaklaşımları müzik analizi görevlerinde tek model sınıflandırıcılarını tutarlı '
     'biçimde geride bırakmaktadır. Kostrzewa vd. (2022), farklı mimarilere sahip sinir '
     'ağlarının geniş topluluklarının müzik türü sınıflandırmasında varyansı azalttığını '
     'göstermiştir [13]. Gradient boosting yöntemleri, özellikle XGBoost (Chen ve Guestrin, '
     '2016) [4] ve LightGBM (Ke vd., 2017) [11], el ile tasarlanmış ses öznitelik '
     'vektörlerine uygulandığında güçlü performans sergilemektedir.', 'PARAGRAF METNİ'),
    ('Gan vd. (2024), VMD tabanlı öznitelik ayrıştırmasıyla birleştirilen XGBoost\'un müzik '
     'türü sınıflandırmasında rekabetçi sonuçlar elde ettiğini bildirmiştir [9]. Liu vd. '
     '(2022), çok kanallı ses öznitelik füzyonunu XGBoost ile birleştirerek müzik enstrüman '
     'tanımada %97,65 doğruluk elde etmiştir [16]. Gourisaria vd. (2024), MFCC ve STFT '
     'özniteliklerinin karşılaştırmalı analizinde her iki öznitelik setinin birlikte '
     'kullanılmasının en iyi sonucu verdiğini bulmuştur [10].', 'PARAGRAF METNİ'),
    ('2.5. Mevcut Tespit Sistemleri ve Araştırma Boşlukları', 'Heading 2'),
    ('Mevcut ticari ve akademik sistemler çeşitli açılardan kısıtlamalar içermektedir. IRCAM '
     'Amplify, kapalı kaynaklı bir API hizmeti olarak yüksek doğruluk bildirmekte; ancak '
     'eğitim verisi, değerlendirme metodolojisi ve öznitelik mimarisi hakkında şeffaflık '
     'sunmamaktadır [1]. Believe AI Radar streaming platformlarına yönelik ticari bir çözüm '
     'olup ücretli erişim modeli akademik kullanımı kısıtlamaktadır. Açık kaynak '
     'lofcz/ai-music-detector projesi sistematik çapraz doğrulama eksikliği nedeniyle '
     'genelleme kapasitesi belirsiz kalmaktadır.', 'PARAGRAF METNİ'),
    ('AURIS bu boşlukları kapatmak üzere dört temel özellikle öne çıkmaktadır: (1) kamuya '
     'açık kaynaklardan derlenen çok üreticili veri kümesi, (2) şeffaf 5 katlı çapraz '
     'doğrulama protokolü, (3) SHAP tabanlı açıklanabilirlik katmanı ve (4) ücretsiz web '
     've mobil dağıtım. Bu özellikler kombinasyonu, AURIS\'i hem akademik kıyaslama hem de '
     'pratik kullanım için benzersiz bir konuma taşımaktadır.', 'PARAGRAF METNİ'),
]

MAT_YONT_TEXT = [
    ('3.1. Sistem Mimarisine Genel Bakış', 'Heading 2'),
    ('AURIS dört ana modülden oluşmaktadır: (1) Ses Ön İşleme modülü — format standartlaştırma, '
     'yeniden örnekleme, süre normalizasyonu ve kalite filtreleme; (2) Öznitelik Çıkarma modülü '
     '— librosa tabanlı 47 boyutlu vektör hesaplama; (3) Sınıflandırma modülü — 11 modelin '
     '5 katlı çapraz doğrulamayla eğitimi ve Youden J eşik optimizasyonu; (4) Açıklama modülü '
     '— SHAP değerlerinin hesaplanması ve kullanıcıya görsel sunumu. Desteklenen giriş '
     'formatları: MP3, WAV, FLAC, OGG (maksimum 50 MB) ve YouTube bağlantısı.', 'PARAGRAF METNİ'),
    ('Şekil 3.1, AURIS sisteminin uçtan uca akışını göstermektedir: ham ses girişinden '
     'öznitelik çıkarmaya, 11 modelden oluşan topluluğa, olasılık füzyonuna ve nihai '
     'YZ/İnsan kararına uzanan işlem hattı.', 'PARAGRAF METNİ'),
    # Gorsel 1: pipeline
    ('__FIG_PIPELINE__', '__FIG__'),
    ('3.2. Veri Kümesi', 'Heading 2'),
    ('3.2.1. Derleme Stratejisi ve Etik', 'Heading 3'),
    ('AURIS veri kümesi, kaynak kökenine dayalı otomatik etiketleme stratejisiyle '
     'oluşturulmuştur. Bilinen yapay zekâ üretim platformlarından gelen örnekler "1" (YZ), '
     'bilinen insan müziği arşivlerinden gelen örnekler "0" (İnsan) olarak etiketlenmektedir. '
     'Yalnızca kamuya açık ve Creative Commons lisanslı ses arşivleri kullanılmıştır. '
     'İnsan katılımcılardan birincil veri toplanmamış olduğundan etik kurul izni '
     'gerekmemektedir. Veri sızıntısını önlemek için duration_sec ve sample_rate '
     'öznitelikleri öznitelik vektöründen çıkarılmıştır.', 'PARAGRAF METNİ'),
    ('3.2.2. Kaynak Dağılımı', 'Heading 3'),
    ('Veri kümesi 5.195 ses kaydından oluşmaktadır: 3.113 insan üretimi (%59,9) ve 2.082 '
     'yapay zekâ üretimi (%40,1). YZ kaynakları: SleepyJesse/ai_music_large (Hugging Face, '
     '~2.000 örnek, 12+ üretici); disco-eth/AIME (~1.000, Suno v3/v3.5/v4/v5, Udio, '
     'MusicGen, Stable Audio, Riffusion, AudioLDM2, Mustango, JEN-1, MusicLDM, Tango dahil '
     '12 sistem); zuhri025/suno-audio (~500, Suno odaklı). İnsan kaynakları: '
     'SleepyJesse/ai_music_large (insan bölünümü, ~2.000); marsyas/gtzan (999, 10 tür, her '
     'biri 30 saniye); benjamin-paine/free-music-archive-small (~1.000, FMA).', 'PARAGRAF METNİ'),
    ('3.2.3. Ön İşleme Hattı', 'Heading 3'),
    ('Standartlaştırma adımları şu şekilde uygulanmıştır: (1) 22.050 Hz\'ye yeniden '
     'örnekleme — tüm örnekler tutarlı spektral analiz için tek örnekleme hızına '
     'getirilmiştir; (2) Tek kanala (mono) dönüşüm — stereo kayıtlarda kanal ortalaması '
     'alınmıştır; (3) Süre normalizasyonu — 30 saniye üzeri kayıtlar kırpılmış, kısa kayıtlar '
     'sıfır dolgu uygulanmıştır; (4) Kalite filtresi — minimum 1 saniye uzunluk ve minimum '
     '1e-6 ortalama genlik koşulları uygulanmıştır; (5) Veri sızıntısı önlemi — duration_sec '
     've sample_rate meta verileri öznitelik vektörünün dışında tutulmuştur.', 'PARAGRAF METNİ'),
    ('3.3. Öznitelik Mühendisliği', 'Heading 2'),
    ('3.3.1. Öznitelik Kategorileri ve Tasarım Gerekçesi', 'Heading 3'),
    ('AURIS, librosa v0.10.1 (McFee vd., 2015) [19] kütüphanesiyle 47 boyutlu öznitelik '
     'vektörü çıkarmaktadır. Bu öznitelikler beş kategoride organize edilmiştir: Spektral '
     'öznitelikler (16 adet) — MFCC varyans/delta/delta², spectral_centroid, bandwidth, '
     'rolloff, flatness, contrast ve regularity; Zamansal/Ritmik öznitelikler (10 adet) — '
     'RMS enerji/std/dinamik aralık, sıfır geçiş oranı ve std, tempo BPM/stabilite/'
     'varyasyon katsayısı; Onset/Beat öznitelikleri (9 adet) — onset güç ortalama/std, '
     'beat sayısı, vuruş arası aralık (IBI) stabilitesi ve temporhythmik örüntüler; '
     'Harmonik/Tonal öznitelikler (8 adet) — chroma entropi/std/geçiş hızı, Tonnetz std, '
     'harmonik oran; Vokal/İfadesel öznitelikler (4 adet) — perde stabilitesi, vibrato '
     'düzenliliği, formant tutarlılığı, nefes örüntüsü.', 'PARAGRAF METNİ'),
    ('3.3.2. Kritik Öznitelikler: Spectral Flatness', 'Heading 3'),
    ('Spektral düzlük (spectral_flatness), bir sesin gürültü benzeri (düz spektrum) mi yoksa '
     'tonal mı olduğunu ölçen 0-1 aralığında bir metriktir. Geometrik ortalama ile aritmetik '
     'ortalamanın oranı olarak hesaplanan bu metrik, tamamen tonal bir ses için 0\'a, beyaz '
     'gürültü için 1\'e yaklaşmaktadır. Yapay zekâ üretimi müzik, perceptual kalite '
     'metriklerini optimize ettiğinden genellikle daha homojen ve tonal bir spektral yapıya '
     'sahiptir.', 'PARAGRAF METNİ'),
    ('İnsan müziği kayıt ortamı gürültüsü, enstrüman rezonansları, oda akustiği ve doğal '
     'performans varyasyonları nedeniyle daha geniş bir spektral düzlük aralığı '
     'sergilemektedir. Bu temel fark, spectral_flatness_std\'nin en yüksek öznitelik önem '
     'skoruna (0,0619) ulaşmasını açıklamaktadır. Şekil 3.2\'de YZ ve insan müziği '
     'örneklerinin temel öznitelik dağılımları karşılaştırmalı olarak '
     'gösterilmektedir.', 'PARAGRAF METNİ'),
    # Gorsel 2: feature distribution
    ('__FIG_FEATDIST__', '__FIG__'),
    ('3.3.3. Vokal Özniteliklerin Özgün Katkısı', 'Heading 3'),
    ('Vokal öznitelikler AURIS\'in özgün katkılarından birini oluşturmaktadır. İnsan sesinin '
     'stokastik perde varyasyonu, doğal vibrato düzensizliği ve nefes örüntüleri yapay zekâ '
     'sentezli seslerde tam olarak taklit edilememektedir. Bu fenomen nöral vokoderların '
     'yapısal sınırlılıklarından kaynaklanmaktadır: mevcut ses sentez sistemleri insan sesine '
     'özgü mikro-zamanlama varyasyonlarını (jitter, shimmer) ve soluk geçişlerini perceptual '
     'olarak ikna edici biçimde modelleyememektedir. breath_pattern_score özniteliğinin '
     'öznitelik önem analizinde ilk 15\'e girmesi bu tasarım kararını '
     'doğrulamaktadır.', 'PARAGRAF METNİ'),
    ('3.4. Sınıflandırma Modelleri', 'Heading 2'),
    ('3.4.1. Klasik Makine Öğrenmesi Modelleri (7 Model)', 'Heading 3'),
    ('scikit-learn [21], XGBoost [4] ve LightGBM [11] kütüphaneleri kullanılarak yedi '
     'makine öğrenmesi modeli eğitilmiştir. Lojistik Regresyon: C=2,0, '
     'class_weight=balanced, solver=lbfgs, max_iter=1000 — doğrusal sınıflandırıcı '
     'referans modeli. Rastgele Orman: n_estimators=500, max_features=log2, '
     'min_samples_leaf=2, bootstrap=True — öznitelik rastgeleleştirmeli bagging topluluk '
     'yöntemi. Gradient Boosting: n_estimators=180, max_depth=4, learning_rate=0,07, '
     'subsample=0,8 — zayıf öğrenicilerin ardışık hata düzeltmesi. SVM-RBF: C=10, '
     'gamma=0,05, CalibratedClassifierCV ile olasılık kalibrasyonu. Çok Katmanlı '
     'Algılayıcı (sklearn): gizli=[192, 96, 32], alpha=0,001, activation=relu, '
     'solver=adam. XGBoost: n_estimators=240, max_depth=5, learning_rate=0,06, '
     'scale_pos_weight=1,5. LightGBM: n_estimators=300, num_leaves=31, '
     'learning_rate=0,05, feature_fraction=0,8.', 'PARAGRAF METNİ'),
    ('3.4.2. Derin Öğrenme Modelleri (4 Model)', 'Heading 3'),
    ('PyTorch [20] çerçevesinde 47 boyutlu öznitelik vektörünü girdi alan dört derin '
     'öğrenme modeli tasarlanmıştır. Tüm modeller BCEWithLogitsLoss kayıp fonksiyonu, '
     'Adam optimizer (lr=1e-3) ve erken durdurma (patience=10) kullanmaktadır. '
     'Derin ÇKA (512-256-128-64-1): Tam bağlı katmanlar arası BatchNorm ve Dropout(0,3), '
     'eğitim süresi 81,4 sn. 1B-ESA (1D-CNN): Conv1D(1→32→64→128) + GlobalAvgPool + '
     'FC(128→1), 3 evrişimsel katmanlı öznitelik çıkarıcı, 125,0 sn. Artık ÇKA (Residual '
     'MLP): 3 artık blok (64 boyut), her blokta atlama bağlantısı, 128,7 sn. Dikkat '
     'ÇKA (Attention MLP): öz-dikkat mekanizması (64 boyut) + ileri beslemeli katmanlar, '
     '149,6 sn.', 'PARAGRAF METNİ'),
    ('3.5. Eğitim Protokolü', 'Heading 2'),
    ('3.5.1. 5 Katlı Tabakalı Çapraz Doğrulama', 'Heading 3'),
    ('Tüm modeller aynı 5 katlı tabakalı çapraz doğrulama (StratifiedKFold, '
     'random_state=42) protokolüyle değerlendirilmiştir. Tabakalama, her katlamada sınıf '
     'dağılımını (İnsan: %59,9 / YZ: %40,1) koruyan bir bölünme stratejisidir. '
     'StandardScaler yalnızca eğitim alt kümesine uyarlanmış, aynı dönüşüm doğrulama '
     'alt kümesine uygulanmıştır; bu yaklaşım veri sızıntısını önleyen "sızdırmaz '
     'skalama" (leakage-free scaling) olarak adlandırılmaktadır.', 'PARAGRAF METNİ'),
    ('3.5.2. Youden J İstatistiği ile Eşik Optimizasyonu', 'Heading 3'),
    ('Her katlama için Youden J istatistiği maksimize edilerek optimal karar eşiği '
     'belirlenmektedir: θ* = argmax(Duyarlılık + Özgüllük − 1). Bu formülasyon, '
     'gerçek pozitif oranı (TPR) ile yanlış pozitif oranı (FPR) arasındaki dengeyi '
     'maksimize eder. LightGBM için θ* = 0,4316 olarak belirlenmiştir. Bu eşik '
     '0,50\'nin altında olup azınlık sınıfı (YZ) örneklerini daha hassas yakalamaya '
     'karşılık gelir; sınıf dengesizliğinin (1:1,5) doğal bir '
     'yansımasıdır.', 'PARAGRAF METNİ'),
    ('3.6. SHAP Açıklanabilirlik Entegrasyonu', 'Heading 2'),
    ('AURIS her tahmin için SHAP (SHapley Additive exPlanations) (Lundberg ve Lee, '
     '2017) [17] değerlerini hesaplamaktadır. Oyun teorisinden türetilen Shapley değerleri, '
     'her özniteliğin tahmine olan marjinal katkısını adil biçimde dağıtır. LightGBM\'in '
     'TreeExplainer arayüzü ağaç tabanlı modeller için SHAP değerlerini polinomial yerine '
     'lineer zamanda hesaplayarak gerçek zamanlı kullanım için pratik avantaj '
     'sağlamaktadır.', 'PARAGRAF METNİ'),
    ('Kullanıcıya her analizde hangi özniteliklerin YZ ya da İnsan kararına ne kadar katkı '
     'yaptığı SHAP beeswarm grafiği aracılığıyla görsel olarak sunulmaktadır. Yüksek '
     'öznitelik değeri (kırmızı nokta) ile düşük öznitelik değeri (mavi nokta) arasındaki '
     'SHAP etkisi, modelin kararını sezgisel biçimde açıklamaktadır.', 'PARAGRAF METNİ'),
    ('3.7. Uygulama Mimarisi', 'Heading 2'),
    ('AURIS üç katmanlı bir uygulama mimarisine sahiptir. Web platformu Next.js 14 + '
     'TypeScript ile geliştirilmiş; dosya yükleme, YouTube bağlantısı analizi ve SHAP '
     'görselleştirmesi desteklenmektedir. Netlify CDN üzerinde statik dağıtım '
     'yapılmaktadır. Android uygulaması Kotlin + Jetpack Compose ile MVVM/Clean '
     'Architecture deseninde geliştirilmiş; API 26+ (Android 8.0) desteği, Hilt DI, '
     'Retrofit ağ katmanı ve Room yerel önbellekleme kullanılmaktadır. Sistem, tam özellikli '
     'bir mobil deneyim sunmaktadır.', 'PARAGRAF METNİ'),
    ('FastAPI arka ucu Python 3.11 ile HuggingFace Spaces\'ta Docker konteyneri olarak '
     '7860 portunda çalışmaktadır. Arka uc; ses ön işleme, öznitelik çıkarma, LightGBM '
     'sınıflandırma ve SHAP hesaplama işlemlerini saniyeler içinde tamamlamaktadır. '
     'REST API belgelendirmesi otomatik Swagger/OpenAPI arayüzüyle sağlanmaktadır.', 'PARAGRAF METNİ'),
    # Gorsel 3: web screenshot
    ('__FIG_WEB__', '__FIG__'),
    # Gorsel 4: mobile screenshot
    ('__FIG_MOBILE__', '__FIG__'),
]

BULGULAR_TEXT = [
    ('4.1. Model Karşılaştırma Sonuçları', 'Heading 2'),
    ('Çizelge 4.1, 5.195 örnek ve 47 öznitelik üzerinde 5 katlı çapraz doğrulamayla elde '
     'edilen tüm 11 modelin performansını ROC-AUC\'a göre sıralı olarak sunmaktadır. '
     'LightGBM 0,9549 ROC-AUC ile birinci, Derin ÇKA 0,9537 ile ikinci, XGBoost 0,9463 '
     'ile üçüncü sırada yer almaktadır. 1B-ESA (1D-CNN) 0,8442 ile en düşük AUC değerini '
     'sergilemiştir.', 'PARAGRAF METNİ'),
    ('Şekil 4.1\'de tüm 11 modelin Doğruluk, F1 ve ROC-AUC metriklerini karşılaştıran çubuk '
     'grafik verilmektedir. LightGBM ve Derin ÇKA açık farkla öne çıkarken, Lojistik '
     'Regresyon ve 1B-ESA belirgin biçimde geride kalmaktadır.', 'PARAGRAF METNİ'),
    # Gorsel: model comparison
    ('__FIG_MODELCOMP__', '__FIG__'),
    ('Çizelge 4.1. 11 modelin 5 katlı çapraz doğrulama performans karşılaştırması (ROC-AUC\'a göre sıralı).', 'Çizelge Yazısı'),
    ('Tüm Makine Öğrenmesi modelleri: LightGBM Doğ.=0,8839 F1=0,8575 AUC=0,9549 | XGBoost '
     'Doğ.=0,8735 F1=0,8402 AUC=0,9463 | Gradient Boosting Doğ.=0,8685 F1=0,8337 AUC=0,9406 | '
     'Rastgele Orman Doğ.=0,8604 F1=0,8183 AUC=0,9393 | SVM-RBF Doğ.=0,8612 F1=0,8252 '
     'AUC=0,9347 | Çok Katmanlı Algılayıcı Doğ.=0,8545 F1=0,8189 AUC=0,9258 | Lojistik '
     'Regresyon Doğ.=0,7779 F1=0,7390 AUC=0,8511.', 'PARAGRAF METNİ'),
    ('Tüm Derin Öğrenme modelleri: Derin ÇKA (512-256-128-64) Doğ.=0,8849 F1=0,8596 '
     'AUC=0,9537 | Artık ÇKA (3 blok) Doğ.=0,8756 F1=0,8476 AUC=0,9453 | Dikkat ÇKA '
     'Doğ.=0,8628 F1=0,8293 AUC=0,9356 | 1B-ESA (1D-CNN) Doğ.=0,7665 F1=0,7159 '
     'AUC=0,8442.', 'PARAGRAF METNİ'),
    ('4.2. ROC Eğrileri', 'Heading 2'),
    ('Şekil 4.2\'de 11 modelin gerçek tutulan kat tahminleriyle üretilen ROC eğrileri '
     'gösterilmektedir. Kesikli köşegen çizgisi rastgele sınıflandırma referansını (AUC=0,500) '
     'temsil etmektedir. LightGBM ve Derin ÇKA eğrileri 0,95 üzerinde AUC ile sağ üst '
     'köşeye yakın seyrederken, 1B-ESA belirgin biçimde daha düşük bir eğri '
     'sergilemektedir.', 'PARAGRAF METNİ'),
    # Gorsel: ROC curves
    ('__FIG_ROC__', '__FIG__'),
    ('4.3. En İyi Model: LightGBM Ayrıntılı Analizi', 'Heading 2'),
    ('4.3.1. Karar Eşiği Optimizasyonu', 'Heading 3'),
    ('Varsayılan 0,50 eşiği yerine Youden J istatistiği ile optimal eşik θ* = 0,4316 olarak '
     'belirlenmiştir. Bu eşiğin 0,50\'nin altında olması sınıf dengesizliğini yansıtmaktadır: '
     'azınlık sınıfı olan YZ örneklerini daha hassas yakalamak için karar sınırı aşağıya '
     'çekilmiştir. Şekil 4.3\'te tahmin olasılık dağılımı ve Youden-optimal eşik '
     'gösterilmektedir.', 'PARAGRAF METNİ'),
    # Gorsel: score distribution
    ('__FIG_SCOREDIST__', '__FIG__'),
    ('4.3.2. Karışıklık Matrisi', 'Heading 3'),
    ('LightGBM modeli θ* = 0,4316 eşiğiyle 5 katlı toplulaştırılmış tahminlerde: Doğru '
     'Negatif (İnsan→İnsan) = 2.721 (%87,4), Doğru Pozitif (YZ→YZ) = 1.862 (%89,4), '
     'Yanlış Pozitif (İnsan→YZ) = 392 (%12,6), Yanlış Negatif (YZ→İnsan) = 220 (%10,6) '
     'olarak performans sergilemiştir. Model, YZ örneklerine karşı daha yüksek hassasiyet '
     '(%89,4) ile insan örneklerine karşı özgüllük (%87,4) arasında dengeli bir profil '
     'sergilemektedir.', 'PARAGRAF METNİ'),
    # Gorsel: confusion matrix
    ('__FIG_CONFMAT__', '__FIG__'),
    ('4.3.3. Kalibrasyon Analizi ve Brier Skoru', 'Heading 3'),
    ('LightGBM modelinin kalibrasyon eğrisi (Şekil 4.5) köşegene yakın bir seyir '
     'izlemektedir. Brier skoru 0,083 ile model iyi kalibre edilmiş bir olasılık tahmincisi '
     'olduğunu kanıtlamaktadır. Bu, P(YZ) skorlarının sıralama değil gerçek olasılık tahminleri '
     'olduğu anlamına gelmekte; eşik tabanlı karar vermeyi öngörülebilir kesinlik-duyarlılık '
     'dengeleriyle mümkün kılmaktadır.', 'PARAGRAF METNİ'),
    # Gorsel: calibration
    ('__FIG_CALIB__', '__FIG__'),
    ('4.4. Öznitelik Önemi Analizi', 'Heading 2'),
    ('LightGBM normalleştirilmiş kazanım tabanlı öznitelik önemi sıralaması ilk 10: '
     '(1) spectral_flatness_std = 0,0619; (2) spectral_contrast_mean = 0,0467; '
     '(3) rms_energy = 0,0456; (4) onset_strength_std = 0,0388; '
     '(5) spectral_flatness_mean = 0,0370; (6) rms_dynamic_range = 0,0346; '
     '(7) onset_strength_mean = 0,0332; (8) rms_std = 0,0298; '
     '(9) beat_count = 0,0298; (10) mfcc_delta_var = 0,0289.', 'PARAGRAF METNİ'),
    ('Şekil 4.6, LightGBM\'in normalleştirilmiş kazanım öznitelik önemini gösteren ilk 20 '
     'öznitelik grafiğidir. Spektral kategori ilk 5\'te 3 öznitelikle öne çıkmakta; '
     'vokal öznitelikler orta katmanda yer almaktadır.', 'PARAGRAF METNİ'),
    # Gorsel: feature importance
    ('__FIG_FEATIMP__', '__FIG__'),
    ('4.5. SHAP Analizi', 'Heading 2'),
    ('Şekil 4.7, LightGBM modelinin SHAP beeswarm grafiğini (2.000 örneklik CV diliminde) '
     'göstermektedir. Her nokta bir örneği, yatay konum modelin çıktısı üzerindeki etkiyi, '
     'renk ise öznitelik değerinin büyüklüğünü temsil etmektedir. spectral_flatness_std '
     'yüksek değerlerinin (kırmızı) pozitif SHAP etkisi (→YZ) sergilediği görülmektedir; '
     'bu, tonal/düz spektrumun YZ sınıfıyla ilişkili olduğunu '
     'doğrulamaktadır.', 'PARAGRAF METNİ'),
    # Gorsel: SHAP summary
    ('__FIG_SHAP__', '__FIG__'),
    ('4.6. Kesinlik-Duyarlılık Analizi', 'Heading 2'),
    ('Şekil 4.8, LightGBM için kesinlik-duyarlılık eğrisini (AP=0,9344) göstermektedir. '
     'Ortalama kesinlik (AP) 0,9344 ile rastgele sınıflandırma baz çizgisini (0,401) '
     'önemli ölçüde geride bırakmaktadır. Eğri yüksek duyarlılık değerlerinde bile yüksek '
     'kesinliği korumakta; bu da modelin YZ örneklerini yanlış sınıflandırma olmaksızın '
     'büyük oranda tespit edebildiğini göstermektedir.', 'PARAGRAF METNİ'),
    # Gorsel: precision recall
    ('__FIG_PR__', '__FIG__'),
    ('4.7. Derin Öğrenme Katlama Stabilitesi', 'Heading 2'),
    ('Derin ÇKA en düşük varyansı (std=0,0036) sergileyerek 5 katlama genelinde tutarlı '
     'genelleme kapasitesini kanıtlamıştır: Kat AUC değerleri [0,9582; 0,9557; 0,9508; '
     '0,9492; 0,9571]. LightGBM std=±0,0023 ile tüm modeller arasında en kararlı model '
     'konumundadır. 1B-ESA ise std=0,0087 ve ortalama AUC=0,8543 ile bu öznitelik vektörü '
     'formatında evrişimsel mimarinin dezavantajını ortaya koymaktadır.', 'PARAGRAF METNİ'),
]

TARTISMA_TEXT = [
    ('5.1. LightGBM\'in Üstünlüğü ve Açıklaması', 'Heading 2'),
    ('LightGBM\'in 47 boyutlu öznitelik uzayında en yüksek ROC-AUC\'u (0,9549) elde etmesi '
     'birkaç yapısal faktörle açıklanabilir. Yaprak-düzeyinde büyüme (leaf-wise growth) '
     'stratejisi, seviye-düzeyinde (level-wise) büyüyen ağaçlara kıyasla öznitelikler arası '
     'karmaşık etkileşim örüntülerini daha etkin modellemektedir. Histogram tabanlı bölme '
     '(histogram-based binning) hem hesaplama verimliliğini artırmakta (eğitim süresi: '
     '2,95 sn) hem de aşırı uyumu azaltıcı düzenlilik etkisi yaratmaktadır.', 'PARAGRAF METNİ'),
    ('5.195 örneklik veri kümesinde LightGBM, derin öğrenme modellerine kıyasla mevcut veri '
     'miktarında daha verimli öğrenme sergilemektedir. Derin öğrenme modelleri yüz binlerce '
     'örnekte avantaj kazanırken; ağaç tabanlı topluluk yöntemleri binlerce örneklik orta '
     'ölçekli veri kümelerinde kural dışı biçimde güçlüdür (Grinsztajn vd., 2022).', 'PARAGRAF METNİ'),
    ('5.2. MO-DÖ Yakınsaması: Öznitelik Mühendisliğinin Önemi', 'Heading 2'),
    ('LightGBM (AUC=0,9549) ile Derin ÇKA (AUC=0,9537) arasındaki 0,0012\'lik küçük fark, '
     '47 el ile tasarlanmış akustik özniteliğin mevcut ayrımcı bilginin neredeyse tamamını '
     'kodladığına işaret etmektedir. Derin öğrenme modelleri ham ses yerine aynı öznitelik '
     'vektörü üzerinde çalıştığından wav2vec2 gibi uçtan uca mimarilerin raw waveform '
     'bağlamından yararlanan avantajlarını edinememektedir. Bu yakınsama, performansın '
     'birincil belirleyicisinin öznitelik mühendisliği hattı olduğunu '
     'doğrulamaktadır.', 'PARAGRAF METNİ'),
    ('1B-ESA\'nın (AUC=0,8442) zayıf performansı, evrişimsel mimarinin uygunsuz indüktif '
     'önyargısıyla açıklanmaktadır: 47 boyutlu düz öznitelik vektörü zaman üzerinde değil '
     'öznitelikler üzerinde 1 boyutlu evrişim uygulamakta; bu mimari tercih yerel korelasyon '
     'varsayımını geçersiz kılmaktadır.', 'PARAGRAF METNİ'),
    ('5.3. Spektral Düzlük: Yorumlanabilir Bir Ayrımcı', 'Heading 2'),
    ('Spectral_flatness_std\'nin en yüksek öznitelik önem skoruna (0,0619) ulaşması güçlü '
     'bir yorumsal çerçeve sunmaktadır. YZ müzik üretim sistemleri PESQ, POLQA gibi '
     'perceptual kalite metriklerini optimize ederken daha homojen ve tonal bir spektral '
     'yapı oluşturmaktadır. İnsan müziği ise kayıt ortamı gürültüsü ve doğal performans '
     'varyasyonları nedeniyle daha geniş bir spektral düzlük aralığı sergilemektedir. '
     'Afchar vd. (2025) ile paralel biçimde bu bulgu, YZ sentez süreçlerinin "spektral '
     'iz" bıraktığını ve bu izin el ile tasarlanmış özniteliklerle '
     'yakalanabildiğini göstermektedir [1].', 'PARAGRAF METNİ'),
    ('5.4. Çapraz-Üretici Genelleme Kapasitesi', 'Heading 2'),
    ('AIME veri kümesi (disco-eth/AIME) 12 farklı YZ üretim mimarisini tek bir eğitim '
     'setinde barındırmaktadır: Suno v3/v3.5/v4/v5, Udio, MusicGen, Stable Audio, '
     'Riffusion, AudioLDM2, Mustango, JEN-1, MusicLDM ve Tango. Bu çeşitlilik göz önünde '
     'bulundurulduğunda elde edilen yüksek AUC değerleri, 47 öznitelik temsilinin '
     'üretici-bağımsız artefaktları — mevcut sentez hattlarına özgü düşük seviyeli akustik '
     'özellikler — yakaladığını düşündürmektedir. Bhatt vd. (2025) çapraz-üretici '
     'genellemenin alanın temel açık problemi olduğunu vurgulamaktadır [3]. AURIS\'in '
     'çok üreticili eğitim stratejisi bu soruna doğrudan yanıt vermektedir.', 'PARAGRAF METNİ'),
    ('5.5. Literatürle Karşılaştırma ve Konumlandırma', 'Heading 2'),
    ('AURIS\'in %88,4 doğruluk değeri ticari sistemlerin gerisinde kalmaktadır; ancak bu '
     'karşılaştırma dikkatli yorumlanmalıdır. Ticari sistemler kapalı ve muhtemelen çok '
     'daha büyük veri kümeleri üzerinde eğitilmiştir; değerlendirme metodolojileri şeffaf '
     'değildir. AURIS ise şeffaf 5 katlı çapraz doğrulama, kamuya açık veri kümesi, '
     'ücretsiz web/mobil erişim ve SHAP açıklanabilirliğiyle akademik güvenilirlik ve '
     'şeffaflık açısından mevcut rakiplerinden '
     'ayrışmaktadır.', 'PARAGRAF METNİ'),
    ('5.6. Sınırlamalar', 'Heading 2'),
    ('(1) Veri kümesi büyüklüğü — 5.195 örnek ticari sistemlerle karşılaştırıldığında '
     'küçük kalmaktadır; görülmemiş üreticilere genelleme kapasitesi bağımsız test '
     'setiyle henüz resmi olarak doğrulanmamıştır. (2) Dağılım kayması — konuşma sentezi '
     'gibi müzik-dışı YZ ses içerikleri tespit edilememektedir; sistem yalnızca müzik '
     'formatında içerikler için tasarlanmıştır. (3) Adversarial dayanıklılık — MP3 '
     'sıkıştırma, perde kaydırma ve zaman esneme gibi ses işleme operasyonlarının etkisi '
     'değerlendirilmemiştir. (4) Tür önyargısı — bazı türler YZ örnekleri arasında aşırı '
     'temsil edilmiş olabilir; tür-tabakalı değerlendirme yapılmamıştır.', 'PARAGRAF METNİ'),
]

SONUCLAR_TEXT = [
    ('6.1. Araştırma Sonuçlarının Özeti', 'Heading 2'),
    ('Bu tez çalışmasında AURIS sistemi tasarlanmış, geliştirilmiş ve kapsamlı biçimde '
     'değerlendirilmiştir. Temel bulgular şu şekilde özetlenebilir: (1) LightGBM 0,9549 '
     'ROC-AUC (±0,0023) ve Brier skoru 0,083 ile hem en yüksek ayrımcı güce hem de en '
     'iyi kalibrasyon performansına sahip model olarak öne çıkmıştır. (2) '
     'Spectral_flatness_std (0,0619) en güçlü ayrımcı özniteliktir; bu bulgu YZ sentez '
     'sistemlerinin "spektral iz" bıraktığını göstermekte ve yorumlanabilir bir mekanizma '
     'sunmaktadır. (3) Youden J eşik optimizasyonu (θ*=0,4316), varsayılan 0,50 eşiğine '
     'kıyasla dengeli hata profili elde etmeyi sağlamaktadır.', 'PARAGRAF METNİ'),
    ('(4) SHAP entegrasyonu, AURIS\'i kapalı kaynak rakiplerden farklılaştıran şeffaf karar '
     'mekanizması sunmaktadır; her kullanıcı analizi için hangi özniteliklerin kararı '
     'etkilediği görsel olarak açıklanmaktadır. (5) Tam yığın uygulama — Next.js 14 web '
     'platformu, Kotlin/Jetpack Compose Android uygulaması ve FastAPI arka ucu — sistemi '
     'üretim ortamına taşımış; Hugging Face Spaces üzerinden kamuya açık erişim '
     'sağlanmıştır. (6) GUJSA dergisine sunulan makale kapsamında çalışma, uluslararası '
     'akademik platformda yayımlanmaya aday hale getirilmiştir.', 'PARAGRAF METNİ'),
    ('6.2. Özgün Katkılar', 'Heading 2'),
    ('Bu çalışmanın bilim alanına özgün katkıları şu şekilde sıralanabilir: (a) 5 kategoride '
     '47 akustik öznitelikten oluşan ve müziğe özgü olarak tasarlanmış kapsamlı öznitelik '
     'vektörü; (b) 12+ YZ üretici sistemi kapsayan çok üreticili eğitim veri kümesi; '
     '(c) 7 MO + 4 DÖ modelini aynı şeffaf protokolle karşılaştıran sistematik ablasyon '
     'çalışması; (d) Youden J eşik optimizasyonunun müziğe özgü tespit bağlamına '
     'uyarlanması; (e) SHAP açıklanabilirlik katmanıyla donatılmış ücretsiz ve açık kaynaklı '
     'üretim sistemi.', 'PARAGRAF METNİ'),
    ('6.3. Gelecek Çalışma Önerileri', 'Heading 2'),
    ('Kısa vadeli öneriler (0-6 ay): Veri kümesini 10.000+ örneğe genişletmek; yeni üretici '
     'sistemleri (Suno v6, Stability AI, ElevenLabs Music) dahil etmek; görülmemiş '
     'üreticilerden oluşan bağımsız test setiyle çapraz-üretici genellemeyi resmi olarak '
     'değerlendirmek; MP3 sıkıştırma ve perde kaydırma gibi dönüşümlere karşı adversarial '
     'dayanıklılığı test etmek; wav2vec2 modelini 5 katlı çapraz doğrulama protokolüyle '
     'formal olarak değerlendirmek.', 'PARAGRAF METNİ'),
    ('Uzun vadeli öneriler (6+ ay): iOS uygulaması geliştirmek; tür-tabakalı değerlendirme '
     'ile tür önyargısını ölçmek; çok kipli analiz (ses + sözler + meta veri) entegrasyonu; '
     'gerçek zamanlı yayın akışı (streaming) için çevrimiçi öznitelik çıkarma hattı; '
     'federe öğrenme ile sürekli model güncelleme ve yeni üreticilere adaptasyon.', 'PARAGRAF METNİ'),
]

KAYNAKLAR_LIST = [
    '[1]\tAfchar, D., Meseguer Brocal, G. ve Hennequin, R. (2025). AI-Generated Music Detection and Its Challenges. Proceedings of IEEE ICASSP 2025. https://doi.org/10.48550/arXiv.2501.10111',
    '[2]\tBaevski, A., Zhou, Y., Mohamed, A. ve Auli, M. (2020). wav2vec 2.0: A Framework for Self-Supervised Learning of Speech Representations. Advances in Neural Information Processing Systems, 33, 12449-12460.',
    '[3]\tBhatt, A., Rajan, A. ve diğerleri. (2025). AI-Generated Music Detection: A Survey of Methods and Datasets. arXiv preprint. https://doi.org/10.48550/arXiv.2501.10111',
    '[4]\tChen, T. ve Guestrin, C. (2016). XGBoost: A Scalable Tree Boosting System. Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining, s. 785-794.',
    '[5]\tCopet, J., Kreuk, F., Gat, I., Remez, T., Kant, D., Synnaeve, G., Adi, Y. ve Défossez, A. (2023). Simple and Controllable Music Generation. Advances in Neural Information Processing Systems, 36, 47704-47720.',
    '[6]\tDhariwal, P., Jun, H., Payne, C., Kim, J. W., Radford, A. ve Sutskever, I. (2020). Jukebox: A Generative Model for Music. arXiv preprint arXiv:2005.00341.',
    '[7]\tElizalde, B., Deshmukh, S., Al Ismail, M. ve Wang, H. (2023). CLAP: Learning Audio Concepts from Natural Language Supervision. Proceedings of ICASSP 2023, s. 1-5. IEEE.',
    '[8]\tFrank, J. ve Schönherr, L. (2021). WaveFake: A Data Set to Facilitate Audio Deepfake Detection. NeurIPS 2021 Datasets and Benchmarks Track.',
    '[9]\tGan, R., Huang, T., Shao, J. ve Wang, F. (2024). Music Genre Classification Based on VMD-IWOA-XGBoost. Mathematics, 12(10), 1549. https://doi.org/10.3390/math12101549',
    '[10]\tGourisaria, M. K., Agrawal, R. ve Sahni, M. (2024). Comparative Analysis of Audio Classification with MFCC and STFT Features Using Machine Learning Techniques. Discover Internet of Things, 4.',
    '[11]\tKe, G., Meng, Q., Finley, T., Wang, T., Chen, W., Ma, W., Ye, Q. ve Liu, T. (2017). LightGBM: A Highly Efficient Gradient Boosting Decision Tree. Advances in Neural Information Processing Systems, 30.',
    '[12]\tKosta, K., Meseguer Brocal, G., Afchar, D. ve Hennequin, R. (2025). Segment Transformer: AI-Generated Music Detection via Music Structural Analysis. arXiv preprint arXiv:2509.08283.',
    '[13]\tKostrzewa, D., Mazur, W. ve Brzeski, R. (2022). Wide Ensembles of Neural Networks in Music Genre Classification. Proceedings of MISSI 2022, s. 91-102. Springer.',
    '[14]\tLiu, H., Chen, Z., Yuan, Y., Mei, X., Liu, X., Mandic, D., Wang, W. ve Plumbley, M. D. (2023). AudioLDM: Text-to-Audio Generation with Latent Diffusion Models. Proceedings of ICML 2023.',
    '[15]\tLiu, Y. ve diğerleri. (2024). From Audio Deepfake Detection to AI-Generated Music Detection: A Pathway and Overview. arXiv preprint arXiv:2412.00571.',
    '[16]\tLiu, Y., Yin, Y., Zhu, Q. ve Cui, W. (2022). Musical Instrument Recognition by XGBoost Combining Feature Fusion. arXiv preprint arXiv:2206.00901.',
    '[17]\tLundberg, S. M. ve Lee, S. I. (2017). A Unified Approach to Interpreting Model Predictions. Advances in Neural Information Processing Systems, 30.',
    '[18]\tMartín-Doñas, J. M. ve Álvarez, A. (2022). The Vicomtech Audio Deepfake Detection System Based on Wav2vec2 for the 2022 ADD Challenge. Proceedings of ICASSP 2022, s. 9266-9270. IEEE.',
    '[19]\tMcFee, B., Raffel, C., Liang, D., Ellis, D. P. W., McVicar, M., Battenberg, E. ve Nieto, O. (2015). librosa: Audio and Music Signal Analysis in Python. Proceedings of the 14th Python in Science Conference, s. 18-25.',
    '[20]\tPaszke, A. ve diğerleri. (2019). PyTorch: An Imperative Style, High-Performance Deep Learning Library. Advances in Neural Information Processing Systems, 32.',
    '[21]\tPedregosa, F. ve diğerleri. (2011). Scikit-learn: Machine Learning in Python. Journal of Machine Learning Research, 12, 2825-2830.',
    '[22]\tWu, Y., Chen, K., Zhang, T., Hui, Y., Berg-Kirkpatrick, T. ve Dubnov, S. (2023). Large-Scale Contrastive Language-Audio Pretraining with Feature Fusion and Keyword-to-Caption Augmentation. Proceedings of ICASSP 2023. IEEE.',
    '[23]\tYi, J., Fu, R., Tao, J., Nie, S., Ma, H., Wang, C. ve diğerleri. (2022). ADD 2022: The First Audio Deep Synthesis Detection Challenge. Proceedings of ICASSP 2022, s. 9216-9220. IEEE.',
    '[24]\tYi, J., Wang, C., Tao, J., Zhang, X., Zhang, C. Y. ve Zhao, Y. (2023). Audio Deepfake Detection: A Survey. arXiv preprint arXiv:2308.14970.',
]

EKLER_TEXT = [
    ('Ek 1. AURIS 47 Öznitelik Tam Listesi', 'Heading 2'),
    ('Aşağıda AURIS sisteminin her ses kaydından çıkardığı 47 akustik özniteliğin tam listesi '
     've kategori bilgileri verilmektedir.', 'PARAGRAF METNİ'),
    ('Spektral Öznitelikler (16): 1-spectral_centroid_mean | 2-spectral_centroid_std | '
     '3-spectral_bandwidth_mean | 4-spectral_bandwidth_std | 5-spectral_flatness_mean | '
     '6-spectral_flatness_std [EN GÜÇLÜ, önem=0,0619] | 7-spectral_rolloff_mean | '
     '8-spectral_rolloff_std | 9-spectral_contrast_mean | 10-spectral_contrast_std | '
     '11-mfcc_variance | 12-mfcc_delta_var | 13-mfcc_delta2_var | 14-mel_flatness | '
     '15-spectral_regularity | 16-harmonic_structure', 'PARAGRAF METNİ'),
    ('Zamansal/Ritmik Öznitelikler (10): 17-tempo_bpm | 18-tempo_stability | 19-tempo_cv | '
     '20-beat_count | 21-onset_strength_mean | 22-onset_strength_std | 23-rms_energy | '
     '24-rms_std | 25-rms_dynamic_range | 26-zero_crossing_rate', 'PARAGRAF METNİ'),
    ('Onset/Beat Öznitelikleri (9): 27-zero_crossing_std | 28-temporal_patterns | '
     '29-chroma_entropy | 30-chroma_std | 31-chroma_transition_rate | 32-tonnetz_std | '
     '33-harmonic_ratio | 34-vocal_energy_ratio | 35-vocal_harmonic_ratio', 'PARAGRAF METNİ'),
    ('Vokal/İfadesel Öznitelikler (12): 36-vocal_confidence | 37-has_vocals | '
     '38-pitch_mean_hz | 39-pitch_std_cents | 40-pitch_stability_score | '
     '41-vibrato_rate_hz | 42-vibrato_extent_cents | 43-vibrato_regularity_score | '
     '44-formant_consistency_score | 45-breath_pattern_score | 46-vocal_texture_score | '
     '47-vocal_ai_score', 'PARAGRAF METNİ'),
    ('Ek 2. Sistem Gereksinimleri ve Kurulum', 'Heading 2'),
    ('Donanım gereksinimleri: RAM 8 GB+, Disk ~500 MB boş alan, CPU 4 çekirdek+ (GPU '
     'opsiyonel). Yazılım gereksinimleri: Python 3.11+, Node.js 20.18.1+, Android '
     'Studio (mobil geliştirme için), Android API 26+ (8.0) cihaz veya emülatör. '
     'Ağ gereksinimleri: HuggingFace Spaces API erişimi için internet bağlantısı. '
     'Arka uç başlatma: uvicorn app.main:app --host 0.0.0.0 --port 7860. '
     'Web başlatma: cd platform && npm install && npm run dev (port 3000).', 'PARAGRAF METNİ'),
    ('Ek 3. Model Konfigürasyon Parametreleri Özeti', 'Heading 2'),
    ('LightGBM (en iyi model): n_estimators=300, num_leaves=31, learning_rate=0.05, '
     'max_depth=-1, feature_fraction=0.8, bagging_fraction=0.8, min_child_samples=20. '
     'Derin ÇKA: gizli=[512,256,128,64], BatchNorm=True, Dropout=0.3, lr=1e-3, '
     'epochs=100, patience=10. XGBoost: n_estimators=240, max_depth=5, lr=0.06, '
     'subsample=0.8, colsample_bytree=0.8, scale_pos_weight=1.5.', 'PARAGRAF METNİ'),
]

OZGECMIS_TEXT = [
    ('Hasan Arthur ALTUNTAŞ, 2002 yılında doğmuştur. 2020 yılında Düzce Üniversitesi '
     'Mühendislik Fakültesi Bilgisayar Mühendisliği Bölümü\'ne kayıt yaptırmıştır. '
     'Lisans eğitimi süresince yapay zekâ, makine öğrenmesi ve ses işleme konularında '
     'akademik çalışmalar yürütmüştür.', 'PARAGRAF METNİ'),
    ('BM401 Proje Tasarımı dersinde wav2vec2 tabanlı müzik tespit sistemi prototipi, '
     'BM498 Mezuniyet Tezi kapsamında ise AURIS adlı çok modelli akustik öznitelik '
     'tabanlı ses sınıflandırma sistemi geliştirmiştir.', 'PARAGRAF METNİ'),
    ('AURIS projesi GUJSA (Gazi Üniversitesi Fen Bilimleri Dergisi) dergisine makale '
     'olarak gönderilmiştir. Sistem HuggingFace Spaces\'ta ücretsiz ve kamuya açık '
     'biçimde yayımlanmaktadır.', 'PARAGRAF METNİ'),
    ('Öğrenci No: 221001047 | E-posta: hasannarthurrr@gmail.com | '
     'GitHub: github.com/Rtur2003 | Düzce Üniversitesi, 2026', 'PARAGRAF METNİ'),
]

# ─────────────────────────────────────────────────────────────────────────────
# GORSEL PLANLAYICI
# ─────────────────────────────────────────────────────────────────────────────

FIGURE_MAP = {
    '__FIG_PIPELINE__':  (f'{FIGURES}/paper_pipeline_diagram.png',   'Şekil 3.1. AURIS sistem akış diyagramı — ses girişinden YZ/İnsan kararına uçtan uca işlem hattı.', 15.0),
    '__FIG_FEATDIST__':  (f'{FIGURES}/feature_distribution_ai_vs_human.png', 'Şekil 3.2. YZ ve İnsan müziği — ilk sekiz özniteliğin dağılım karşılaştırması.', 15.0),
    '__FIG_WEB__':       (f'{SCREENSHOTS}/auris_web_hero.png',        'Şekil 3.3. AURIS web platformu ana ekranı (Next.js 14, Netlify).', 13.0),
    '__FIG_MOBILE__':    (f'{SCREENSHOTS}/auris_mobile_hero.png',     'Şekil 3.4. AURIS Android uygulaması ana ekranı (Kotlin/Jetpack Compose).', 7.0),
    '__FIG_MODELCOMP__': (f'{FIGURES}/paper_model_comparison.png',    'Şekil 4.1. 11 modelin performans karşılaştırması — Doğruluk, F1 ve ROC-AUC (5 katlı çapraz doğrulama, 47 öznitelik, 5.195 örnek).', 15.0),
    '__FIG_ROC__':       (f'{FIGURES}/paper_roc_curves.png',          'Şekil 4.2. ROC eğrileri — gerçek tutulan kat tahminleri, 5 katlı çapraz doğrulama. Kesikli çizgi: rastgele sınıflandırma (AUC=0,500).', 14.0),
    '__FIG_SCOREDIST__': (f'{FIGURES}/paper_score_distribution.png',  'Şekil 4.3. LightGBM tahmin olasılık dağılımı. Kesikli çizgi: Youden-optimal eşik θ*=0,4316.', 13.0),
    '__FIG_CONFMAT__':   (f'{FIGURES}/paper_confusion_matrix_lightgbm.png', 'Şekil 4.4. LightGBM karışıklık matrisi (θ*=0,4316). Değerler örnek sayısı ve sınıf yüzdesini göstermektedir.', 10.0),
    '__FIG_CALIB__':     (f'{FIGURES}/paper_calibration.png',         'Şekil 4.5. LightGBM kalibrasyon eğrisi. Brier skoru=0,0830, N=5.195 (5 katlı çapraz doğrulama).', 12.0),
    '__FIG_FEATIMP__':   (f'{FIGURES}/paper_feature_importance.png',  'Şekil 4.6. LightGBM normalleştirilmiş kazanım öznitelik önemi — ilk yirmi öznitelik.', 13.0),
    '__FIG_SHAP__':      (f'{FIGURES}/shap_summary.png',              'Şekil 4.7. SHAP özet grafiği — LightGBM (2.000 örneklik CV diliminde, gerçek). Kırmızı: yüksek öznitelik değeri, Mavi: düşük.', 12.0),
    '__FIG_PR__':        (f'{FIGURES}/paper_precision_recall.png',    'Şekil 4.8. LightGBM kesinlik-duyarlılık eğrisi (AP=0,9344). Kesikli çizgi: baz sınıflandırıcı (0,401).', 12.0),
}

# ─────────────────────────────────────────────────────────────────────────────
# BOLUM GORSEL ISLEYICI — metni gosel elementleriyle birlestir
# ─────────────────────────────────────────────────────────────────────────────

def build_section_items(text_items, doc, figure_map):
    """
    text_items icindeki __FIG_XXX__ isaret satirlarini gercek gorsel elementleriyle degistirir.
    Donus: (text, style) veya ham XML element listesi
    """
    result = []
    for item in text_items:
        if isinstance(item, tuple) and item[1] == '__FIG__':
            key = item[0]
            if key in figure_map:
                img_path, caption, width = figure_map[key]
                elems = make_figure_elements(doc, img_path, caption, width)
                result.extend(elems)
            else:
                result.append((f'[{key}]', 'PARAGRAF METNİ'))
        else:
            result.append(item)
    return result

# ─────────────────────────────────────────────────────────────────────────────
# ANA BUILD
# ─────────────────────────────────────────────────────────────────────────────

def build():
    print("[AURIS] Tez build basliyor (v3 — gorsel + XML fix)...")
    doc = Document(TEMPLATE)

    # ── [0] Harita Listesi TOC satiri ───────────────────────────────────────
    print("  [0] Harita Listesi TOC satiri siliniyor...")
    for p in list(doc.paragraphs):
        if p.style.name.startswith('toc') and 'HAR' in p.text and 'LISTES' in p.text:
            safe_remove(p._element)
            print("    Harita Listesi TOC satirı silindi.")
            break

    # ── [0b] Sablon kilavuz notlari ─────────────────────────────────────────
    print("  [0b] Sablon notlari siliniyor...")
    SILINCEK = [
        'Bu açıklama notlarını silmek için',
        'OTOMATİK DEĞİŞİKLİKLERİ GÜNCELLEMEK',
        'ÇİZELGE, ŞEKİL VE DENKLEM NUMARALARI OTOMATİK',
        'BÖLÜM BAŞLIKLARI SAYFA BAŞINDAN',
        'BAŞLIKLAR HER BİR EK İÇİN',
        'TÜM BAŞLIKLAR KOPYALANIP',
        'ALT BAŞLIK İTALİK OLMALIDIR',
        'EKLE MENÜSÜNDEN ÇAPRAZ BAŞVURU',
        'NOT: BU KAYNAKLAR MENDELEY',
        'ENSON KAYNAKLAR KISMINA EKLERKEN',
        'REFERANSLAR IEEE STANDARTLARINDA',
        'KAYNAKLAR 1 SATIR ARALIĞI',
        'EKLER ANA VE ARA BAŞLIKLARI',
        'DİPNOTLAR EKLENEBİLİR',
        'SADECE BUNLAR TEKRAR KOPYALANIP',
        'SADECE BUNLARI TEKRAR KOPYALAYIP',
        'BAŞVURU TÜRÜ MENÜSÜNDE',
        'BAŞVURU EKLE MENÜSÜ',
        'HARİTA NUMARASI DEĞİŞTİĞİNDE',
        'ÖZGEÇMİŞ NUMARALANDIRILMAYACAKTIR',
        'GİRİŞ BÖLÜMÜ ZORUNLUDUR',
        'SONUÇ BÖLÜMÜ ZORUNLUDUR',
        'Bu TEZ ŞABLONU tez yazım',
        'Tezin Giriş Bölümü Tez ile',
        'Bölüm 1, Tezin Giriş kısmıydı',
        'Aşağıda Tezde kullanılacak olan',
        'NOT: BASKI ÖNİZLEME ŞEKLİ',
        'Çizelge 2.1 otomatik olarak',
        'Şekil referansları şekillerden önce',
        'Şekil numarası değiştiğinde',
        'Paragraf referansları şekillerden',
        'Çizelge referansları çizelgelerden',
        'Şekilden önceki metin',
        'seçilip, Biçim',
        '[1]\tG. Pipeleers',
        '[2]\tB. Lu, F. Wu',
        '[3]\tV. Q. Leu',
        '[4]\tM. Alma',
        '[5]\tK. Graichen',
        '[6]\tX. Litrico',
        '[7]\tI. Masubuchi',
        'Agharkakli, A.,',
        'Altun, Y. (',
        'Chowdhury, D.',
        'Feng, Y.,',
        'Lauwerys, C.',
        'Roy, P.,',
        'Sinthipsomboon',
        'Wang, K., He',
        'Zhao, P., &',
        'Zheng, J. ming',
        'Makale Örnek:',
        'Konferans Örnek:',
        'Kitap Örnek:',
        'Bu bölüm varsa Eklerin',
        'Kaynakları metin içerisinde',
        'Kaynaklar listesi, tezdeki',
        'Bunun için Mendeley',
        'Mendeley program',
        'Araştırmada kaynak gösterilen',
        'Elde edilen bilgilerin',
        'Örneğin:,(',
        'Paragraf.',
        'Birimler',
        'Manzara',
        'Harita ..',
        'Türkiye solar',
        'Rs',
    ]

    to_remove = []
    for p in doc.paragraphs:
        t = p.text.strip()
        if not t:
            continue
        for s in SILINCEK:
            if s in t:
                to_remove.append(p._element)
                break

    removed = 0
    for elem in to_remove:
        if elem.getparent() is not None:
            safe_remove(elem)
            removed += 1
    print(f"    {removed} sablon notu silindi.")

    # ── [1] Kapak ve on sayfalar ─────────────────────────────────────────────
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
            set_text(p,
                'AURIS: AKUSTİK ÖZNİTELİK TABANLI YAPAY ZEKÂ ÜRETİMİ MÜZİĞİN '
                'TESPİTİ İÇİN ÇOK MODELLİ TOPLULUK SİSTEMİ', bold=True)
        elif t.strip() == 'Ad SOYAD':
            set_text(p, 'Hasan Arthur ALTUNTAŞ', bold=True)
        elif '1111111111111' in t:
            set_text(p, '221001047')
        elif '(Öğrencinin Adı Soyadı)' in t or ('rencinin Ad' in t and 'Soyad' in t):
            set_text(p, 'Hasan Arthur ALTUNTAŞ')
        elif 'değerli katk' in t and 'danışman' in t:
            set_text(p,
                'Bu tez çalışmasının her aşamasında değerli yönlendirmeleri ve '
                'akademik rehberliğiyle süreci şekillendiren danışman hocam '
                'Dr. Öğr. Üyesi Büşra TAKGİL\'e sonsuz teşekkürlerimi sunarım.')
        elif 'eş danışmanım Prof. Dr.' in t:
            clear_para(p)
        elif 'sevgili aileme' in t and 'çalışma arkadaşlar' in t:
            set_text(p,
                'Tez süreci boyunca gösterdikleri anlayış ve destekten dolayı '
                'aileme ve arkadaşlarıma teşekkür ederim.')
        elif 'BAP-XXX-WWW' in t:
            clear_para(p)

    # ── [2] OZET / ABSTRACT ──────────────────────────────────────────────────
    print("  [2] OZET/ABSTRACT guncelleniyor...")
    for p in doc.paragraphs:
        t = p.text
        if 'BURAYA TEZ BA' in t and 'NG' not in t:
            set_text(p,
                'AURIS: AKUSTİK ÖZNİTELİK TABANLI YAPAY ZEKÂ ÜRETİMİ MÜZİĞİN '
                'TESPİTİ İÇİN ÇOK MODELLİ TOPLULUK SİSTEMİ', bold=True)
        elif t.strip() in ('Öğrenci ADI', 'renci ADI') or 'renci AD' in t:
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
                'karşılaştırmaktadır. 8 farklı kaynaktan derlenen 5.195 ses kaydı üzerinde '
                'eğitilen LightGBM modeli 0,8839 doğruluk, 0,8575 F1-skoru ve 0,9548 '
                'ROC-AUC (Brier=0,083) elde etmiştir. Karar eşiği Youden J istatistiğiyle '
                'θ*=0,4316 olarak optimize edilmiştir. Sistem Next.js 14 web platformu, '
                'Kotlin/Jetpack Compose Android uygulaması ve FastAPI arka ucuyla tam yığın '
                'mimaride sunulmuştur. SHAP entegrasyonu her kararı öznitelik bazında '
                'açıklanabilir kılmaktadır.')
        elif 'Anahtar s' in t and 'zc' in t and 'bir' in t:
            set_text(p, 'Anahtar Kelimeler: yapay zekâ müzik tespiti, akustik öznitelik, LightGBM, topluluk öğrenmesi, ses sınıflandırma.')
        elif 'BURAYA TEZ BA' in t and 'NG' in t:
            set_text(p,
                'AURIS: A MULTI-MODEL ENSEMBLE SYSTEM FOR AI-GENERATED MUSIC '
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
            set_text(p, 'Keywords: AI music detection, acoustic features, LightGBM, ensemble learning, audio classification.')

    # ── [3] H1 bolumler (konumsal) ───────────────────────────────────────────
    print("  [3] H1 bolumleri dolduruluyor...")
    h1s = find_h1_elements(doc)

    def fill_section(key, new_title, text_items, figure_map=None):
        if key not in h1s:
            print(f"    [UYARI] H1 bulunamadi: {key}")
            return
        p = h1s[key]
        set_text(p, new_title)
        delete_until_next_h1(p._element)
        if figure_map:
            items = build_section_items(text_items, doc, figure_map)
        else:
            items = text_items
        insert_block_after(p._element, items, doc)
        print(f"    {key} -> {new_title!r} (item={len(items)})")

    fill_section('giris',      '1. GİRİŞ',                    GIRIS)
    fill_section('mat_yont',   '2. LİTERATÜR TARAMASI',       LITERATUR)
    fill_section('bolum3',     '3. MATERYAL VE YÖNTEM',       MAT_YONT_TEXT,  FIGURE_MAP)
    fill_section('bolum4',     '4. BULGULAR',                  BULGULAR_TEXT,  FIGURE_MAP)
    fill_section('bulgular_1', '5. TARTIŞMA',                  TARTISMA_TEXT)
    fill_section('kaynaklarin','6. SONUÇLAR VE ÖNERİLER',     SONUCLAR_TEXT)

    # Sablon artiklari — temizle
    for key in ('bulgular_2', 'bos_10', 'sonuclar_sab', 'bos_13'):
        if key in h1s:
            p = h1s[key]
            set_text(p, '')
            delete_until_next_h1(p._element)

    # KAYNAKLAR
    if 'kaynaklar' in h1s:
        p = h1s['kaynaklar']
        set_text(p, '7. KAYNAKLAR')
        delete_until_next_h1(p._element)
        ref_items = [(r, 'Normal') for r in KAYNAKLAR_LIST]
        insert_block_after(p._element, ref_items, doc)
        print(f"    kaynaklar -> 7. KAYNAKLAR ({len(KAYNAKLAR_LIST)} ref)")

    # EKLER
    if 'ekler' in h1s:
        p = h1s['ekler']
        delete_until_next_h1(p._element)
        insert_block_after(p._element, EKLER_TEXT, doc)
        print(f"    ekler -> EKLER ({len(EKLER_TEXT)} item)")

    # OZGECMIS
    if 'ozgecmis' in h1s:
        p = h1s['ozgecmis']
        delete_until_next_h1(p._element)
        insert_block_after(p._element, OZGECMIS_TEXT, doc)
        print(f"    ozgecmis -> OZGECMIS ({len(OZGECMIS_TEXT)} item)")

    # ── [4] Kaydet ───────────────────────────────────────────────────────────
    print("  [4] Kaydediliyor...")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    doc.save(OUT)
    size_mb = os.path.getsize(OUT) / 1024 / 1024
    print(f"[TAMAM] {OUT}")
    print(f"        Dosya boyutu: {size_mb:.2f} MB")


if __name__ == '__main__':
    build()
