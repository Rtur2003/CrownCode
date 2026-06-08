# -*- coding: utf-8 -*-
"""
BM498 Mezuniyet Tezi - Sablon Tabanli Build
AURIS — Hasan Arthur Altuntas — 221001047 — Duzce Universitesi

Yaklasim: Sablonu yukle, her H1 basligini KONUMSAL mantikla bul
(karakter kodlamasi sorunlarindan kacinmak icin .text sonundaki
ASCII-guvenli altsimgeler yerine .text icindeki sabit kelimeler kullanilir).
"""
import os
from docx import Document
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Cm, Pt

TEMPLATE = "docs/academic/TeslimEdilecekler/tezşablonu.docx"
OUT = "docs/academic/TeslimEdilecekler/1.TEZ-RAPOR/BM498_Mezuniyet_Tezi_Hasan_Arthur_Altuntas.docx"

# ────────────────────────────────────────────────────────────────────────────
# Dusuk seviyeli XML yardimcilari
# ────────────────────────────────────────────────────────────────────────────

def get_style_id(doc, name):
    try:
        return doc.styles[name].style_id
    except KeyError:
        return name.replace(' ', '')

def make_p(doc, text, style_name):
    """Yeni <w:p> elementi olusturur (stil adi ile)."""
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
    """Paragrafin tum run'larini temizler ve yeni metin yazar."""
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
    anchor_el'den sonra items listesini sirali ekler.
    items: [(text, style_name), ...]
    Geri donus: son eklenen element.
    """
    cur = anchor_el
    for text, style_name in items:
        new_p = make_p(doc, text, style_name)
        cur.addnext(new_p)
        cur = new_p
    return cur

def delete_until_next_h1(heading_elem):
    """heading_elem'den sonraki tum icerigi siler, bir sonraki H1'e kadar."""
    nxt = heading_elem.getnext()
    while nxt is not None:
        tag = nxt.tag.split('}')[-1]
        if tag == 'p':
            pStyle = nxt.find('.//' + qn('w:pStyle'))
            if pStyle is not None and pStyle.get(qn('w:val'), '') == 'Balk1':
                break   # bir sonraki H1 — dur
        nxt_nxt = nxt.getnext()
        nxt.getparent().remove(nxt)
        nxt = nxt_nxt

# ────────────────────────────────────────────────────────────────────────────
# H1 paragraflarini KONUMSAL olarak bul (karakter sorununu atla)
# ────────────────────────────────────────────────────────────────────────────

def find_h1_elements(doc):
    """
    Dondurur: {konum_anahtar: element} sozlugu
    Anahtarlar: 'giris', 'mat_yont', 'bolum3', 'bolum4',
                'bulgular_1', 'kaynaklarin', 'bulgular_2',
                'sonuclar', 'kaynaklar', 'ekler', 'ozgecmis'
    """
    result = {}
    h1s = []
    for p in doc.paragraphs:
        if p.style.name == 'Heading 1':
            h1s.append(p)

    # Sablonda H1 sirasi (bos olanlari dahil):
    # 0: GiRiS (metin var)
    # 1: MATERYAL VE YONTEM (metin var)
    # 2: '' (bos)
    # 3: BOLUM 3 (metin var)
    # 4: '' (bos)
    # 5: BOLUM 4 (metin var)
    # 6: '' (bos)
    # 7: BULGULAR VE TARTISMA (1. ornek)
    # 8: '' (bos)
    # 9: KAYNAKLARIN YAZIMI
    # 10: BULGULAR VE TARTISMA (2. ornek)
    # 11: '' (bos)
    # 12: SONUCLAR VE ONERILER
    # 13: KAYNAKLAR
    # 14: '' (bos)
    # 15: EKLER
    # 16: OZGECMIS

    keys = [
        'giris',        # 00  GİRİŞ
        'mat_yont',     # 01  MATERYAL VE YÖNTEM
        'bolum3',       # 02  BÖLÜM 3
        'bos_3',        # 03  ''
        'bolum4',       # 04  BÖLÜM 4
        'bos_5',        # 05  ''
        'bulgular_1',   # 06  BULGULAR VE TARTIŞMA (örnek 1)
        'bos_7',        # 07  ''
        'kaynaklarin',  # 08  KAYNAKLARIN YAZIMI
        'bulgular_2',   # 09  BULGULAR VE TARTIŞMA (örnek 2)
        'bos_10',       # 10  ''
        'sonuclar_sab', # 11  SONUÇLAR VE ÖNERİLER (şablon)
        'kaynaklar',    # 12  KAYNAKLAR
        'bos_13',       # 13  ''
        'ekler',        # 14  EKLER
        'ozgecmis',     # 15  ÖZGEÇMİŞ
    ]

    for i, h in enumerate(h1s):
        if i < len(keys):
            result[keys[i]] = h
        else:
            result[f'extra_{i}'] = h

    print(f"  Bulunan H1 sayisi: {len(h1s)}")
    for k, h in result.items():
        txt = h.text[:30].encode('ascii', 'replace').decode()
        print(f"    {k}: {txt!r}")

    return result

# ────────────────────────────────────────────────────────────────────────────
# BOLUM ICERIKLERI
# ────────────────────────────────────────────────────────────────────────────

OZET_BASLIK = ('AURIS: AKUSTİK ÖZNİTELİK TABANLI YAPAY ZEKÂ ÜRETİMİ MÜZİĞİN TESPİTİ İÇİN ÇOK MODELLİ TOPLULUK SİSTEMİ', True)

GIRIS = [
    ('1.1. Problemin Tanımı ve Araştırmanın Motivasyonu', 'Heading 2'),
    ('Suno, MusicGen, Udio ve Echoes gibi üretici yapay zekâ platformlarının son yıllarda gösterdiği '
     'hızlı ilerleme, müzik üretim alanını köklü biçimde dönüştürmüştür. Bu platformlar müzik teorisi '
     'bilgisi olmayan bir kullanıcının dakikalar içinde yüksek kaliteli müzik üretmesine olanak '
     'tanımaktadır. Meta tarafından geliştirilen açık kaynak model MusicGen (Copet vd., 2023), '
     'AudioLDM2 (Liu vd., 2023) ve ticari platformlar Suno ile Udio yapay zekâ müziğini '
     'geniş kitlelere yaymıştır.', 'PARAGRAF METNİ'),
    ('Bu teknolojik dönüşüm beraberinde ciddi etik, hukuki ve ekonomik sorunları getirmektedir. '
     'Yapay zekâ üretimi parçaların insan eserleriyle karışarak streaming platformlarına yüklenmesi '
     'telif hakkı ihlallerine zemin hazırlamaktadır. Algoritmik öneri sistemleri yapay zekâ üretimi '
     'içerikleri insanmış gibi göstererek insan sanatçıların gelirlerini olumsuz etkileyebilmekte; '
     'müzik yarışmalarında ve burs değerlendirmelerinde yapay zekâ eserleri insan yaratıcılığı '
     'olarak sunulabilmektedir [1].', 'PARAGRAF METNİ'),
    ('Yapay zekâ üretimi ses tespiti alanındaki araştırmaların büyük bölümü konuşma sentezi ve '
     'ses derin sahteciliğine odaklanmış; müziğe özgü tespit sistemleri görece az ilgi görmüştür. '
     'Liu vd. (2024) bu alanı "gelişmekte olan" olarak nitelendirmekte ve mevcut yaklaşımların '
     'büyük çoğunluğunun tek bir üretici sisteme özgü olduğunu, dolayısıyla yeni sistemlere '
     'genelleme yapamadığını vurgulamaktadır [15]. Bhatt vd. (2025) ise çapraz-üretici '
     'genellemenin alanın temel açık problemi olduğunu ortaya koymaktadır [3].', 'PARAGRAF METNİ'),
    ('AURIS (Acoustic Understanding and Recognition Intelligence System) bu boşluğu kapatmak '
     'amacıyla tasarlanmıştır. 12\'den fazla yapay zekâ üretim sistemini kapsayan bir eğitim veri '
     'kümesi, 47 boyutlu akustik öznitelik vektörü ve 11 modelin sistematik karşılaştırması ile '
     'hem teknik katkı hem yorumlanabilirlik sunan açık kaynaklı bir çözüm önerilmektedir.', 'PARAGRAF METNİ'),
    ('1.2. Araştırmanın Amaç ve Kapsamı', 'Heading 2'),
    ('Bu çalışmanın temel araştırma sorusu şöyledir: "Spektral, zamansal, ritmik, harmonik ve vokal '
     'boyutları kapsayan el ile tasarlanmış akustik öznitelikler, gradient boosting topluluğuyla '
     'birleştirildiğinde, uçtan uca derin öğrenme yaklaşımlarıyla rekabet edebilir bir yapay zekâ '
     'müziği tespit performansı sağlayabilir mi?"', 'PARAGRAF METNİ'),
    ('Belirlenen hedefler: (1) 5 kategoride 47 öznitelikten oluşan kapsamlı ve yorumlanabilir bir '
     'akustik öznitelik vektörü tasarlamak; (2) 8 kaynaktan derlenen 5.195 örnekli gerçek dünya '
     'veri kümesi oluşturmak; (3) 7 klasik ML ve 4 derin öğrenme modelini aynı protokolle '
     'karşılaştırmak; (4) Youden J istatistiğiyle optimize edilmiş karar eşiği belirlemek; '
     '(5) SHAP entegrasyonuyla her kararı öznitelik bazında açıklanabilir kılmak; '
     '(6) Sistemi web, Android ve API katmanlarıyla üretim ortamına taşımak.', 'PARAGRAF METNİ'),
    ('1.3. BM401-BM498 İki Dönemlik Süreç', 'Heading 2'),
    ('Bu proje iki akademik dönemde geliştirilmiştir. BM401 (2024-2025 Güz Dönemi) aşamasında '
     'wav2vec2 tabanlı hibrit bir yaklaşım tasarlanmış, Next.js 14 web platformu ve Kotlin Android '
     'uygulaması prototip düzeyinde geliştirilmiştir. BM498 (2024-2025 Bahar Dönemi) aşamasında '
     'araştırma odağı köklü biçimde değişmiştir: wav2vec2 embedding\'lerinin yorumlanamaz yapısı '
     'yerine el ile tasarlanmış 47 boyutlu akustik öznitelik vektörüne geçilmiş, veri kümesi '
     '5.195 örneğe genişletilmiş ve SHAP açıklanabilirlik katmanı eklenmiştir.', 'PARAGRAF METNİ'),
    ('1.4. Tez Organizasyonu', 'Heading 2'),
    ('Bölüm 2\'de yapay zekâ müzik üretimi, ses derin sahteciliği tespiti ve mevcut sistemler '
     'ele alınmaktadır. Bölüm 3\'te veri kümesi, öznitelik mühendisliği, model mimarileri ve '
     'eğitim protokolü açıklanmaktadır. Bölüm 4\'te deneysel bulgular sunulmaktadır. '
     'Bölüm 5\'te tartışma, Bölüm 6\'da sonuçlar ve öneriler yer almaktadır.', 'PARAGRAF METNİ'),
]

LITERATUR = [
    ('2.1. Yapay Zekâ Müzik Üretim Sistemleri', 'Heading 2'),
    ('Müzik üretiminde yapay zekâ kullanımı son yıllarda üç ana paradigma etrafında şekillenmiştir: '
     'otoregresif modeller, difüzyon modelleri ve transformer tabanlı metin-müzik dönüşümü. '
     'Dhariwal vd. (2020) tarafından geliştirilen Jukebox, ham ses formunda doğrudan waveform '
     'üreten ilk büyük ölçekli modeldir [6]. 1,2 milyar parametresiyle dönemin en büyük müzik '
     'modeli olan Jukebox, hiyerarşik VQ-VAE mimarisini kullanmaktadır.', 'PARAGRAF METNİ'),
    ('Meta AI tarafından geliştirilen MusicGen (Copet vd., 2023), metin ve melodi koşullandırmalı, '
     'yüksek kaliteli müzik üretebilen decoder-only transformer mimarisidir [5]. Model EnCodec '
     'ses kodlayıcısı üzerine inşa edilmiş; 300M, 1,5B ve 3,3B parametre ölçeklerinde açık kaynak '
     'lisansıyla yayımlanmıştır. AudioLDM (Liu vd., 2023), latent difüzyon modellerini ses '
     'üretimine uyarlamış; CLAP gösterimleriyle koşullandırılan model metin girdisiyle '
     'yüksek kaliteli ses sentezi yapabilmektedir [14].', 'PARAGRAF METNİ'),
    ('2.2. Ses Derin Sahteciliği Tespiti', 'Heading 2'),
    ('Yapay zekâ üretimi ses tespitine ilişkin sistematik araştırma ilk olarak konuşma sentezi ve '
     'ses derin sahteciliği alanında başlamıştır. WaveFake veri kümesi (Frank ve Schönherr, 2021), '
     'yedi farklı vocoder mimarisinin çıktılarını barındıran temel bir kıyaslama noktası '
     'oluşturmuştur [8]. ADD 2022 Yarışması (Yi vd., 2022), ses derin sahteciliği tespiti '
     'alanında üç farklı zorluğu kapsamıştır [23]. Yi vd. (2023), 2008-2023 yılları arasında '
     'yayımlanan araştırmaları kapsamlı biçimde incelemiş; MFCC, LFCC, CQT ve mel-spektrogram '
     'tabanlı özniteliklerin farklı derin öğrenme sınıflandırıcılarla kombinasyonlarını '
     '17 veri kümesi üzerinde karşılaştırmıştır [24].', 'PARAGRAF METNİ'),
    ('Müziğe özgü tespit araştırmaları görece yenidir. Liu vd. (2024), ses derin sahteciliği '
     'tespitinden yapay zekâ üretimi müzik tespitine geçişi "yol haritası ve genel bakış" '
     'perspektifiyle ele almaktadır [15]. Afchar vd. (2025), oto-kodlayıcı artefaktlarından '
     'yararlanarak dedektörlerin %99,8 doğruluğa ulaşabildiğini, ancak MP3 sıkıştırma ve '
     'perde kaydırma gibi basit ses işleme işlemlerinin tespit oranlarını önemli ölçüde '
     'düşürdüğünü IEEE ICASSP 2025\'te sunmuştur [1].', 'PARAGRAF METNİ'),
    ('2.3. Transformer Tabanlı Ses Gösterimleri', 'Heading 2'),
    ('wav2vec2 (Baevski vd., 2020), etiketlenmemiş konuşma verisi üzerinde öz-denetimli öğrenme '
     'yapan bir transformer modelidir [2]. Martín-Doñas ve Álvarez (2022), wav2vec2\'yi ADD 2022 '
     'yarışmasına doğrudan uygulayarak öznitelik mühendisliği gerektirmeksizin rekabetçi sonuçlar '
     'elde etmiştir [18]. CLAP (Elizalde vd., 2023), karşıtsal önceden eğitimi ses-metin embedding '
     'uzayına genişletmektedir [7]. Wu vd. (2023) tarafından geliştirilen LAION-CLAP varyantı '
     '630.000 ses-metin çifti üzerinde eğitilmiştir [22]. Kosta vd. (2025) ise Segment '
     'Transformer\'ı önermiştir [12].', 'PARAGRAF METNİ'),
    ('2.4. Topluluk Yöntemleri ve Ses Sınıflandırması', 'Heading 2'),
    ('Topluluk yaklaşımları müzik analizi görevlerinde tek model sınıflandırıcılarını tutarlı '
     'biçimde geride bırakmaktadır. Kostrzewa vd. (2022), farklı mimarilere sahip sinir ağlarının '
     'geniş topluluklarının müzik türü sınıflandırmasında varyansı azalttığını göstermiştir [13]. '
     'Gradient boosting yöntemleri, özellikle XGBoost (Chen ve Guestrin, 2016) [4] ve '
     'LightGBM (Ke vd., 2017) [11], el ile tasarlanmış ses öznitelik vektörlerine '
     'uygulandığında güçlü performans sergilemektedir.', 'PARAGRAF METNİ'),
    ('Gan vd. (2024), VMD tabanlı öznitelik ayrıştırmasıyla birleştirilen XGBoost\'un müzik türü '
     'sınıflandırmasında rekabetçi sonuçlar elde ettiğini bildirmiştir [9]. Liu vd. (2022), '
     'çok kanallı ses öznitelik füzyonunu XGBoost ile birleştirerek müzik enstrüman tanımada '
     '%97,65 doğruluk elde etmiştir [16]. Gourisaria vd. (2024), MFCC ve STFT özniteliklerinin '
     'karşılaştırmalı analizinde her iki öznitelik setinin birlikte kullanılmasının en iyi '
     'sonucu verdiğini bulmuştur [10].', 'PARAGRAF METNİ'),
    ('2.5. Mevcut Tespit Sistemleri ve Araştırma Boşlukları', 'Heading 2'),
    ('IRCAM Amplify, kapalı kaynaklı bir API hizmeti olarak %98,59 doğruluk bildirmekte; '
     'ancak eğitim verisi, değerlendirme metodolojisi ve öznitelik mimarisi hakkında '
     'şeffaflık sunmamaktadır [1]. Believe AI Radar streaming platformlarına yönelik ticari '
     'bir çözüm olup ücretli erişim modeli akademik kullanımı kısıtlamaktadır. '
     'lofcz/ai-music-detector açık kaynak olmakla birlikte sistematik çapraz doğrulama '
     'eksikliği genelleme kapasitesini sınırlandırmaktadır.', 'PARAGRAF METNİ'),
    ('AURIS bu boşlukları kapatmak üzere: (1) kamuya açık kaynaklardan derlenen çok üreticili '
     'veri kümesi, (2) şeffaf 5 katlı çapraz doğrulama, (3) SHAP tabanlı açıklanabilirlik '
     've (4) ücretsiz web ve mobil dağıtım ile mevcut sistemlerden ayrışmaktadır.', 'PARAGRAF METNİ'),
]

MAT_YONT = [
    ('3.1. Sistem Mimarisine Genel Bakış', 'Heading 2'),
    ('AURIS dört ana modülden oluşmaktadır: (1) Ses Ön İşleme — format standartlaştırma, yeniden '
     'örnekleme, süre normalizasyonu; (2) Öznitelik Çıkarma — librosa tabanlı 47 boyutlu vektör; '
     '(3) Sınıflandırma — 11 modelin 5 katlı çapraz doğrulamayla eğitimi; '
     '(4) Açıklama — SHAP değerlerinin hesaplanması ve sunumu. '
     'Desteklenen giriş formatları: MP3, WAV, FLAC, OGG (max 50 MB) ve YouTube bağlantısı.', 'PARAGRAF METNİ'),
    ('3.2. Veri Kümesi', 'Heading 2'),
    ('3.2.1. Derleme Stratejisi ve Etik', 'Heading 3'),
    ('AURIS veri kümesi, kaynak kökenine dayalı otomatik etiketleme stratejisiyle oluşturulmuştur. '
     'Bilinen yapay zekâ üretim platformlarından gelen örnekler "1" (AI), bilinen insan müziği '
     'arşivlerinden gelen örnekler "0" (İnsan) olarak etiketlenmektedir. '
     'Yalnızca kamuya açık ve Creative Commons lisanslı ses arşivleri kullanılmıştır. '
     'İnsan katılımcılardan birincil veri toplanmamış olduğundan etik kurul izni '
     'gerekmemektedir.', 'PARAGRAF METNİ'),
    ('3.2.2. Kaynak Dağılımı', 'Heading 3'),
    ('Veri kümesi 5.195 ses kaydından oluşmaktadır: 3.113 insan üretimi (%59,9) ve 2.082 yapay zekâ '
     'üretimi (%40,1). Kaynaklar: SleepyJesse/ai_music_large (AI kısmı, ~2.000 örnek, 12+ üretici), '
     'disco-eth/AIME (~1.000, Suno v3-v5/Udio/MusicGen/AudioLDM2 dahil 12 sistem), '
     'zuhri025/suno-audio (~500, Suno), marsyas/gtzan (999, 10 tür), '
     'benjamin-paine/free-music-archive-small (~1.000, FMA).', 'PARAGRAF METNİ'),
    ('Çizelge 3.1. AURIS veri kümesi kaynak dağılımı.', 'Çizelge Yazısı'),
    ('3.2.3. Ön İşleme Hattı', 'Heading 3'),
    ('Standartlaştırma adımları: (1) 22.050 Hz\'ye yeniden örnekleme; (2) Tek kanala (mono) '
     'dönüşüm — stereo kanal ortalamasıyla; (3) Süre normalizasyonu — 30 saniye üstü kırpma, '
     'kısa kayıtlar sıfır dolgu; (4) Gürültü kontrolü — min 1 sn uzunluk ve min 1e-6 genlik; '
     '(5) Veri sızıntısı önlemi — duration_sec ve sample_rate öznitelik vektöründen '
     'çıkarıldı.', 'PARAGRAF METNİ'),
    ('3.3. Öznitelik Mühendisliği', 'Heading 2'),
    ('3.3.1. Öznitelik Kategorileri', 'Heading 3'),
    ('AURIS, librosa v0.10.1 (McFee vd., 2015) [19] ile 47 boyutlu öznitelik vektörü '
     'çıkarmaktadır. Dağılım: Spektral (16) — MFCC varyans/delta/delta², spectral_centroid, '
     'bandwidth, rolloff, flatness, contrast, regularity; Zamansal/Ritmik (10) — RMS enerji/std/'
     'dinamik aralık, sıfır geçiş oranı, tempo BPM/stabilite/CV; Onset/Beat (9) — onset güç '
     'ort/std, beat sayısı, IBI stabilitesi; Harmonik/Tonal (8) — chroma entropi/std/geçiş '
     'hızı, Tonnetz std, harmonik oran; Vokal (4) — perde stabilitesi, vibrato düzenliliği, '
     'formant tutarlılığı, nefes örüntüsü.', 'PARAGRAF METNİ'),
    ('Çizelge 3.2. Öznitelik kategorilerinin dağılımı.', 'Çizelge Yazısı'),
    ('3.3.2. Kritik Öznitelikler', 'Heading 3'),
    ('Spektral düzlük (spectral_flatness), bir sesin gürültü benzeri (düz spektrum) mi yoksa '
     'tonal mı olduğunu ölçen 0-1 aralığında bir metriktir. Yapay zekâ üretimi müzik, perceptual '
     'kalite metriklerini optimize ettiğinden genellikle daha homojen ve tonal bir spektral yapıya '
     'sahiptir. İnsan müziği kayıt ortamı gürültüsü, enstrüman rezonansları ve doğal varyasyonlar '
     'nedeniyle daha geniş bir spektral düzlük aralığı sergiler. Bu fark, '
     'spectral_flatness_std\'nin en yüksek öznitelik önem skoruna (0,0619) ulaşmasını '
     'açıklamaktadır.', 'PARAGRAF METNİ'),
    ('Vokal öznitelikler AURIS\'in özgün katkılarından birini oluşturmaktadır. İnsan sesinin '
     'stokastik perde varyasyonu, doğal vibrato düzensizliği ve nefes örüntüleri yapay zekâ '
     'sentezli seslerde tam olarak taklit edilememektedir. Breath_pattern_score\'un öznitelik '
     'önem analizinde ilk 15\'e girmesi bu tasarım kararını doğrulamaktadır.', 'PARAGRAF METNİ'),
    ('3.4. Sınıflandırma Modelleri', 'Heading 2'),
    ('3.4.1. Klasik Makine Öğrenmesi Modelleri (7)', 'Heading 3'),
    ('scikit-learn [21], XGBoost [4] ve LightGBM [11] kütüphaneleri kullanılarak yedi model '
     'eğitilmiştir. Logistic Regression: C=2.0, class_weight=balanced. '
     'Random Forest: n_est=500, max_features=log2. '
     'Gradient Boosting: n_est=180, max_depth=4, lr=0.07. '
     'SVM-RBF: C=10, gamma=0.05, CalibratedClassifierCV. '
     'MLP: gizli=[192,96,32], alpha=0.001. '
     'XGBoost: n_est=240, max_depth=5, lr=0.06. '
     'LightGBM: n_est=300, num_leaves=31, lr=0.05.', 'PARAGRAF METNİ'),
    ('Çizelge 3.3. Klasik ML modelleri hiperparametreleri ve eğitim süreleri.', 'Çizelge Yazısı'),
    ('3.4.2. Derin Öğrenme Modelleri (4)', 'Heading 3'),
    ('PyTorch [20] çerçevesinde 47 boyutlu öznitelik vektörünü girdi alan dört model tasarlanmıştır. '
     'Tüm DL modelleri BCEWithLogitsLoss kayıp fonksiyonu ve Adam (lr=1e-3) kullanmaktadır. '
     'Derin MLP (512-256-128-64-1): BatchNorm + Dropout(0.3), eğitim 81.4 sn. '
     '1D-CNN: Conv1D(1->32->64->128)+GlobalAvgPool+FC(128->1), 125.0 sn. '
     'Residual MLP (3 blok, 64 boyut): artık bağlantılar, 128.7 sn. '
     'Attention MLP: öz-dikkat (64 boyut) + FF katmanlar, 149.6 sn.', 'PARAGRAF METNİ'),
    ('Çizelge 3.4. Derin öğrenme model mimarileri.', 'Çizelge Yazısı'),
    ('3.5. Eğitim Protokolü', 'Heading 2'),
    ('3.5.1. 5 Katlı Tabakalı Çapraz Doğrulama', 'Heading 3'),
    ('Tüm modeller aynı 5 katlı tabakalı çapraz doğrulama (StratifiedKFold) protokolüyle '
     'değerlendirilmiştir. Tabakalama her katlamada sınıf dağılımını (%59,9 insan / %40,1 AI) '
     'korur. StandardScaler yalnızca eğitim alt kümesine uyarlanmış, doğrulama alt kümesine '
     'dönüşüm uygulanmıştır — veri sızıntısını önleyen sızdırmaz skalama.', 'PARAGRAF METNİ'),
    ('3.5.2. Youden J Eşik Optimizasyonu', 'Heading 3'),
    ('Her katlama için Youden J istatistiği maksimize edilerek optimal karar eşiği belirlenmektedir: '
     'theta* = argmax(Duyarlilik + Ozgulluk - 1). LightGBM için theta* = 0.4316 olarak '
     'belirlenmistir. Bu esik 0.50 esiginin altinda olup sinif dengesizligini '
     'yansitmaktadir.', 'PARAGRAF METNİ'),
    ('3.6. SHAP Açıklanabilirlik Entegrasyonu', 'Heading 2'),
    ('AURIS her tahmin için SHAP (SHapley Additive exPlanations) (Lundberg ve Lee, 2017) [17] '
     'değerlerini hesaplamaktadır. LightGBM\'in TreeExplainer arayüzü ağaç tabanlı modeller '
     'için SHAP değerlerini lineer zamanda hesaplayarak gerçek zamanlı kullanım için '
     'pratik avantaj sağlamaktadır. Kullanıcıya her analizde hangi özniteliklerin AI ya da '
     'İnsan kararına ne kadar katkı yaptığı görsel olarak sunulmaktadır.', 'PARAGRAF METNİ'),
    ('3.7. Uygulama Mimarisi', 'Heading 2'),
    ('Web platformu Next.js 14 + TypeScript ile geliştirilmiş; Netlify CDN üzerinde statik '
     'dağıtım yapılmaktadır. Android uygulaması Kotlin + Jetpack Compose ile MVVM/Clean '
     'Architecture deseninde, API 26+ (Android 8.0) desteğiyle; Hilt DI, Retrofit, Room '
     'kullanan tam özellikli mobil uygulama. FastAPI arka ucu Python 3.11 ile HuggingFace '
     'Spaces\'ta Docker konteyneri olarak 7860 portunda çalışmaktadır.', 'PARAGRAF METNİ'),
]

BULGULAR = [
    ('4.1. Model Karşılaştırma Sonuçları', 'Heading 2'),
    ('Çizelge 4.1, 5.195 örnek ve 47 öznitelik üzerinde 5 katlı çapraz doğrulamayla elde edilen '
     'tüm 11 modelin performansını ROC-AUC\'a göre sıralı olarak sunmaktadır. '
     'LightGBM 0,9549 ROC-AUC ile birinci, Derin MLP 0,9537 ile ikinci, XGBoost 0,9463 '
     'ile üçüncü sırada yer almaktadır. 1D-CNN 0,8442 ile en düşük AUC değerini '
     'sergilemiştir.', 'PARAGRAF METNİ'),
    ('Çizelge 4.1. 11 modelin 5 katlı CV performans karşılaştırması (ROC-AUC\'a göre sıralı).', 'Çizelge Yazısı'),
    ('4.2. En İyi Model: LightGBM Ayrıntılı Analizi', 'Heading 2'),
    ('4.2.1. Karar Eşiği Optimizasyonu', 'Heading 3'),
    ('Varsayılan 0,50 eşiği yerine Youden J istatistiği ile optimal eşik theta* = 0,4316 olarak '
     'belirlenmiştir. Bu eşiğin 0,50\'nin altında olması sınıf dengesizliğini yansıtmaktadır: '
     'azınlık sınıfı olan AI örneklerini daha hassas yakalamak için karar sınırı '
     'aşağıya çekilmiştir.', 'PARAGRAF METNİ'),
    ('4.2.2. Karışıklık Matrisi ve Brier Skoru', 'Heading 3'),
    ('LightGBM modeli theta* = 0,4316 eşiğiyle; insan örneklerinin %87,4\'ünü Doğru Negatif '
     '(DN=2.721), yapay zekâ örneklerinin %89,4\'ünü Doğru Pozitif (DP=1.862) olarak '
     'sınıflandırmıştır. Yanlış Pozitif: 392 (%12,6), Yanlış Negatif: 220 (%10,6). '
     'Brier skoru 0,083 ile iyi kalibre edilmiş bir olasılık tahmincisi olduğu '
     'kanıtlanmıştır.', 'PARAGRAF METNİ'),
    ('Çizelge 4.2. LightGBM karışıklık matrisi (theta* = 0,4316).', 'Çizelge Yazısı'),
    ('4.3. Öznitelik Önemi Analizi', 'Heading 2'),
    ('LightGBM kazanç tabanlı normalleştirilmiş öznitelik önemi sıralaması: '
     '1. spectral_flatness_std (0,0619), 2. spectral_contrast_mean (0,0467), '
     '3. rms_energy (0,0456), 4. onset_strength_std (0,0388), '
     '5. spectral_flatness_mean (0,0370), 6. rms_dynamic_range (0,0346), '
     '7. onset_strength_mean (0,0332), 8. rms_std (0,0298), 9. beat_count (0,0298), '
     '10. mfcc_delta_var (0,0289). Spektral kategorisi ilk 5\'te 3 öznitelikle öne '
     'çıkmaktadır.', 'PARAGRAF METNİ'),
    ('Çizelge 4.3. LightGBM normalleştirilmiş öznitelik önemi (ilk 10).', 'Çizelge Yazısı'),
    ('4.4. Derin Öğrenme Katlama Stabilitesi', 'Heading 2'),
    ('Derin MLP en düşük varyansı (std=0,0036) sergileyerek 5 katlama genelinde tutarlı '
     'genelleme kapasitesini kanıtlamıştır. LightGBM std=±0,0023 ile tüm modeller arasında '
     'en kararlı model konumundadır. 1D-CNN ise std=0,0087 ve ortalama AUC=0,8543 ile '
     'bu öznitelik vektörü formatında evrişimsel mimarinin dezavantajını '
     'ortaya koymaktadır.', 'PARAGRAF METNİ'),
    ('Çizelge 4.4. Derin öğrenme modellerinin katlama bazında ROC-AUC değerleri.', 'Çizelge Yazısı'),
]

TARTISMA = [
    ('5.1. LightGBM\'in Üstünlüğü', 'Heading 2'),
    ('LightGBM\'in 47 boyutlu öznitelik uzayında en yüksek ROC-AUC\'u elde etmesi birkaç yapısal '
     'faktörle açıklanabilir. Yaprak-düzeyinde büyüme stratejisi öznitelikler arası karmaşık '
     'etkileşim örüntülerini daha iyi modellemektedir. Histogram tabanlı bölme hem hesaplama '
     'verimliliğini artırmakta (eğitim süresi: 2,95 sn) hem de düzenlilik etkisi '
     'yaratmaktadır. 5.195 örneklik veri kümesinde LightGBM, derin öğrenme modellerine '
     'kıyasla mevcut veri miktarında daha verimli öğrenme sergilemektedir.', 'PARAGRAF METNİ'),
    ('5.2. Spektral Düzlük: Yorumlanabilir Bir Ayrımcı', 'Heading 2'),
    ('Spectral_flatness_std\'nin en yüksek öznitelik önem skoruna (0,0619) ulaşması güçlü bir '
     'yorumsal çerçeve sunmaktadır. AI müzik üretim sistemleri perceptual kalite metriklerini '
     'optimize ederken daha homojen ve tonal bir spektral yapı oluşturmaktadır. İnsan müziği ise '
     'kayıt ortamı gürültüsü ve doğal performans varyasyonları nedeniyle daha geniş bir spektral '
     'düzlük aralığı sergilemektedir. Afchar vd. (2025) ile paralel biçimde bu bulgu, AI sentez '
     'süreçlerinin "spektral iz" bıraktığını ve bu izin el ile tasarlanmış özniteliklerle '
     'yakalanabildiğini göstermektedir [1].', 'PARAGRAF METNİ'),
    ('5.3. Çapraz-Üretici Genelleme', 'Heading 2'),
    ('AIME veri kümesi 12 farklı AI üretim mimarisini tek bir eğitim setinde barındırmaktadır. '
     'Bu çeşitlilik göz önünde bulundurulduğunda elde edilen yüksek AUC değerleri, 47 öznitelik '
     'temsilinin üretici-bağımsız artefaktları — mevcut sentez hattlarına özgü düşük seviyeli '
     'akustik özellikler — yakaladığını düşündürmektedir. Bhatt vd. (2025) çapraz-üretici '
     'genellemenin alanın temel açık problemi olduğunu vurgulamaktadır [3]. AURIS\'in '
     'çok üreticili eğitim stratejisi bu soruna doğrudan yanıt vermektedir.', 'PARAGRAF METNİ'),
    ('5.4. Literatürle Karşılaştırma', 'Heading 2'),
    ('AURIS\'in %88,4 doğruluk değeri ticari sistemlerin gerisinde kalmaktadır; ancak bu '
     'karşılaştırma dikkatli yorumlanmalıdır. Ticari sistemler kapalı ve muhtemelen çok daha '
     'büyük veri kümeleri üzerinde eğitilmiştir. Değerlendirme metodolojileri şeffaf değildir. '
     'AURIS ise şeffaf 5 katlı çapraz doğrulama, gerçek dünya veri kümesi, ücretsiz erişim '
     've SHAP açıklanabilirliğiyle akademik güvenilirlik açısından '
     'rakipsiz bir konumdadır.', 'PARAGRAF METNİ'),
    ('Çizelge 5.1. AURIS ile mevcut sistemlerin karşılaştırması.', 'Çizelge Yazısı'),
    ('5.5. Sınırlamalar', 'Heading 2'),
    ('(1) Veri kümesi büyüklüğü — 5.195 örnek ticari sistemlerle karşılaştırıldığında küçük '
     'kalmaktadır. (2) Dağılım kayması — konuşma sentezi gibi müzik-dışı AI ses içerikleri '
     'tespit edilememektedir. (3) Adversarial dayanıklılık — MP3 sıkıştırma ve perde kaydırma '
     'gibi ses işleme operasyonlarının etkisi değerlendirilmemiştir. '
     '(4) Tür önyargısı — bazı türler AI örnekleri arasında aşırı temsil edilmiş '
     'olabilir.', 'PARAGRAF METNİ'),
]

SONUCLAR = [
    ('6.1. Araştırma Sonuçlarının Özeti', 'Heading 2'),
    ('AURIS sistemi 0,9549 ROC-AUC (±0,0023) ve Brier skoru 0,083 ile güçlü ve kararlı '
     'performans sergilemiştir. Spectral_flatness_std (0,0619) en güçlü ayrımcı özniteliktir. '
     'Youden J eşik optimizasyonu (theta* = 0,4316) dengeli hata profili sağlamıştır. '
     'SHAP entegrasyonu kapalı kaynak rakiplerden farklılaştıran şeffaf karar mekanizması '
     'sunmaktadır. Tam yığın uygulama (web, Android, API) sistemi üretim '
     'ortamına taşımıştır.', 'PARAGRAF METNİ'),
    ('6.2. Gelecek Çalışma Önerileri', 'Heading 2'),
    ('Kısa vadeli (0-6 ay): Veri kümesini 10.000+ örneğe genişletmek; yeni üreticileri dahil '
     'etmek; görülmemiş üreticilerden oluşan bağımsız test seti ile çapraz-üretici genellemeyi '
     'resmi değerlendirmek; adversarial dayanıklılığı test etmek.', 'PARAGRAF METNİ'),
    ('Uzun vadeli (6+ ay): iOS uygulaması; tür-tabakalı değerlendirme; çok kipli analiz '
     '(ses + sözler + meta veri); gerçek zamanlı yayın akışı için akış tabanlı öznitelik çıkarma; '
     'federe öğrenme ile sürekli model güncelleme.', 'PARAGRAF METNİ'),
]

KAYNAKLAR = [
    '[1] Afchar, D., Meseguer Brocal, G. ve Hennequin, R. (2025). AI-Generated Music Detection and Its Challenges. Proceedings of IEEE ICASSP 2025. https://doi.org/10.48550/arXiv.2501.10111',
    '[2] Baevski, A., Zhou, Y., Mohamed, A. ve Auli, M. (2020). wav2vec 2.0: A Framework for Self-Supervised Learning of Speech Representations. Advances in Neural Information Processing Systems, 33, 12449-12460.',
    '[3] Bhatt, A., Rajan, A. ve digerleri. (2025). AI-Generated Music Detection: A Survey. arXiv preprint arXiv:2501.10111.',
    '[4] Chen, T. ve Guestrin, C. (2016). XGBoost: A Scalable Tree Boosting System. Proc. 22nd ACM SIGKDD, s. 785-794.',
    '[5] Copet, J., Kreuk, F., Gat, I., Remez, T., Kant, D., Synnaeve, G., Adi, Y. ve Defossez, A. (2023). Simple and Controllable Music Generation. Advances in NeurIPS, 36, 47704-47720.',
    '[6] Dhariwal, P., Jun, H., Payne, C., Kim, J. W., Radford, A. ve Sutskever, I. (2020). Jukebox: A Generative Model for Music. arXiv:2005.00341.',
    '[7] Elizalde, B., Deshmukh, S., Al Ismail, M. ve Wang, H. (2023). CLAP: Learning Audio Concepts from Natural Language Supervision. Proc. ICASSP 2023, s. 1-5.',
    '[8] Frank, J. ve Schonherr, L. (2021). WaveFake: A Data Set to Facilitate Audio Deepfake Detection. NeurIPS 2021 Datasets and Benchmarks.',
    '[9] Gan, R., Huang, T., Shao, J. ve Wang, F. (2024). Music Genre Classification Based on VMD-IWOA-XGBoost. Mathematics, 12(10), 1549.',
    '[10] Gourisaria, M. K., Agrawal, R. ve Sahni, M. (2024). Comparative Analysis of Audio Classification with MFCC and STFT Features. Discover Internet of Things, 4.',
    '[11] Ke, G., Meng, Q., Finley, T., Wang, T., Chen, W., Ma, W., Ye, Q. ve Liu, T. (2017). LightGBM: A Highly Efficient Gradient Boosting Decision Tree. Advances in NeurIPS, 30.',
    '[12] Kosta, K., Meseguer Brocal, G., Afchar, D. ve Hennequin, R. (2025). Segment Transformer: AI-Generated Music Detection via Music Structural Analysis. arXiv:2509.08283.',
    '[13] Kostrzewa, D., Mazur, W. ve Brzeski, R. (2022). Wide Ensembles of Neural Networks in Music Genre Classification. Proc. MISSI 2022, s. 91-102. Springer.',
    '[14] Liu, H., Chen, Z., Yuan, Y., Mei, X., Liu, X., Mandic, D., Wang, W. ve Plumbley, M. D. (2023). AudioLDM: Text-to-Audio Generation with Latent Diffusion Models. Proc. ICML 2023.',
    '[15] Liu, Y. ve digerleri. (2024). From Audio Deepfake Detection to AI-Generated Music Detection: A Pathway and Overview. arXiv:2412.00571.',
    '[16] Liu, Y., Yin, Y., Zhu, Q. ve Cui, W. (2022). Musical Instrument Recognition by XGBoost Combining Feature Fusion. arXiv:2206.00901.',
    '[17] Lundberg, S. M. ve Lee, S. I. (2017). A Unified Approach to Interpreting Model Predictions. Advances in NeurIPS, 30.',
    '[18] Martin-Donas, J. M. ve Alvarez, A. (2022). The Vicomtech Audio Deepfake Detection System Based on Wav2vec2 for the 2022 ADD Challenge. Proc. ICASSP 2022, s. 9266-9270.',
    '[19] McFee, B., Raffel, C., Liang, D., Ellis, D. P. W., McVicar, M., Battenberg, E. ve Nieto, O. (2015). librosa: Audio and Music Signal Analysis in Python. Proc. 14th Python in Science Conf., s. 18-25.',
    '[20] Paszke, A. ve digerleri. (2019). PyTorch: An Imperative Style, High-Performance Deep Learning Library. Advances in NeurIPS, 32.',
    '[21] Pedregosa, F. ve digerleri. (2011). Scikit-learn: Machine Learning in Python. Journal of Machine Learning Research, 12, 2825-2830.',
    '[22] Wu, Y., Chen, K., Zhang, T., Hui, Y., Berg-Kirkpatrick, T. ve Dubnov, S. (2023). Large-Scale Contrastive Language-Audio Pretraining with Feature Fusion. Proc. ICASSP 2023.',
    '[23] Yi, J., Fu, R., Tao, J., Nie, S., Ma, H., Wang, C. ve digerleri. (2022). ADD 2022: The First Audio Deep Synthesis Detection Challenge. Proc. ICASSP 2022, s. 9216-9220.',
    '[24] Yi, J., Wang, C., Tao, J., Zhang, X., Zhang, C. Y. ve Zhao, Y. (2023). Audio Deepfake Detection: A Survey. arXiv:2308.14970.',
]

EKLER = [
    ('Ek 1: AURIS 47 Öznitelik Tam Listesi', 'Heading 2'),
    ('1-spectral_centroid_mean | 2-spectral_centroid_std | 3-spectral_bandwidth_mean | '
     '4-spectral_bandwidth_std | 5-spectral_flatness_mean | '
     '6-spectral_flatness_std [EN GUCLU, 0.0619] | 7-spectral_rolloff_mean | '
     '8-spectral_rolloff_std | 9-spectral_contrast_mean | 10-spectral_contrast_std | '
     '11-mfcc_variance | 12-mfcc_delta_var | 13-mfcc_delta2_var | 14-mel_flatness | '
     '15-spectral_regularity | 16-harmonic_structure | 17-tempo_bpm | 18-tempo_stability | '
     '19-tempo_cv | 20-beat_count | 21-onset_strength_mean | 22-onset_strength_std | '
     '23-rms_energy | 24-rms_std | 25-rms_dynamic_range | 26-zero_crossing_rate | '
     '27-zero_crossing_std | 28-temporal_patterns | 29-chroma_entropy | 30-chroma_std | '
     '31-chroma_transition_rate | 32-tonnetz_std | 33-harmonic_ratio | '
     '34-vocal_energy_ratio | 35-vocal_harmonic_ratio | 36-vocal_confidence | '
     '37-has_vocals | 38-pitch_mean_hz | 39-pitch_std_cents | 40-pitch_stability_score | '
     '41-vibrato_rate_hz | 42-vibrato_extent_cents | 43-vibrato_regularity_score | '
     '44-formant_consistency_score | 45-breath_pattern_score | 46-vocal_texture_score | '
     '47-vocal_ai_score', 'PARAGRAF METNİ'),
    ('Çizelge E.1. AURIS 47 öznitelik tam listesi.', 'Çizelge Yazısı'),
    ('Ek 2: Sistem Gereksinimleri', 'Heading 2'),
    ('Python 3.11+, Node.js 20.18.1+, Android API 26+ (Android 8.0), RAM 8 GB+, '
     'Disk ~500 MB. Backend: 7860 portu (HuggingFace Spaces). Web: 3000 portu.', 'PARAGRAF METNİ'),
]

OZGECMIS = [
    ('KİŞİSEL BİLGİLER', 'Heading 3'),
    ('Ad Soyad: Hasan Arthur ALTUNTAŞ | Öğrenci No: 221001047 | '
     'E-posta: hasannarthurrr@gmail.com | GitHub: github.com/Rtur2003', 'PARAGRAF METNİ'),
    ('ÖĞRENİM DURUMU', 'Heading 3'),
    ('Lisans: Bilgisayar Mühendisliği, Düzce Üniversitesi (2020-2026)', 'PARAGRAF METNİ'),
    ('PROJE VE YAYINLAR', 'Heading 3'),
    ('AURIS: Akustik Öznitelik Tabanlı Yapay Zekâ Üretimi Müziğin Tespiti İçin Çok Modelli '
     'Topluluk Sistemi — BM498 Mezuniyet Tezi, 2025-2026. '
     'GUJSA dergisine makale olarak gönderilmiştir.', 'PARAGRAF METNİ'),
]

# ────────────────────────────────────────────────────────────────────────────
# ANA BUILD
# ────────────────────────────────────────────────────────────────────────────

def build():
    doc = Document(TEMPLATE)

    print("  [0] Harita Listesi toc satiri ve sablon notlari siliniyor...")
    # ── Harita Listesi toc satirini sil ──────────────────────────────────────
    for p in doc.paragraphs:
        if p.style.name == 'toc 1' and 'HAR' in p.text and 'LISTES' in p.text:
            p._element.getparent().remove(p._element)
            break

    # ── Sablon kılavuz notlarini sil (buyuk harfli, köşeli parantezli) ────────
    # Bu satirlar sablonun orneklerinde kalan yazarlar icin açiklamalar:
    SILINCEK_IFADELER = [
        'Bu açıklama notlarını silmek için',
        'OTOMATİK DEĞİŞİKLİKLERİ GÜNCELLEMEK',
        'ÇİZELGE, ŞEKİL VE DENKLEM NUMARALARI OTOMATİK OLARAK ARTMAKTADIR',
        'BÖLÜM BAŞLIKLARI SAYFA BAŞINDAN BAŞLAMALIDIR',
        'BAŞLIKLAR HER BİR EK İÇİN BU ŞEKİLDE OLMALIDIR',
        'TÜM BAŞLIKLAR KOPYALANIP KULLANILDIĞINDA',
        'ALT BAŞLIK İTALİK OLMALIDIR',
        'EKLE MENÜSÜNDEN ÇAPRAZ BAŞVURU',
        'NOT: BU KAYNAKLAR MENDELEY',
        'ENSON KAYNAKLAR KISMINA EKLERKEN',
        'REFERANSLAR IEEE STANDARTLARINDA',
        'KAYNAKLAR 1 SATIR ARALIĞI OLMALIDIR',
        'EKLER ANA VE ARA BAŞLIKLARI',
        'DİPNOTLAR EKLENEBİLİR',
        'SADECE BUNLAR TEKRAR KOPYALANIP',
        'SADECE BUNLARI TEKRAR KOPYALAYIP',
        'BAŞVURU TÜRÜ MENÜSÜNDE',
        'BAŞVURU EKLE MENÜSÜ',
        'HARİTA NUMARASI DEĞİŞTİĞİNDE',
        'ÖZGEÇMİŞ NUMARALANDIRILMAYACAKTIR',
        'Örneğin:,(',
        'GİRİŞ BÖLÜMÜ ZORUNLUDUR',
        'SONUÇ BÖLÜMÜ ZORUNLUDUR',
        'Bu TEZ ŞABLONU tez yazım kurallarına',
        'Tezin Giriş Bölümü Tez ile ilgili',
        'Bölüm 1, Tezin Giriş kısmıydı',
        'Aşağıda Tezde kullanılacak olan',
        'NOT: BASKI ÖNİZLEME ŞEKLİ',
        'Çizelge 2.1 otomatik olarak',
        'Şekil referansları şekillerden önce',
        'Şekil numarası değiştiğinde',
        'Paragraf.',
        'Birimler',
        'Manzara',
        'Harita ..',
        'Türkiye solar',
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
        'Kaynakları metin içerisinde göstermede',
        'Kaynaklar listesi, tezdeki',
        'Bunun için Mendeley programının',
        'Mendeley program',
        'Araştırmada kaynak gösterilen',
        'Elde edilen bilgilerin',
        'Paragraf referansları şekillerden',
        'Çizelge referansları çizelgelerden',
        'Şekilden önceki metin',
        'seçilip, Biçim',
        'Rs',
    ]

    remove_paras = []
    for p in doc.paragraphs:
        t = p.text.strip()
        if not t:
            continue
        for ifade in SILINCEK_IFADELER:
            if ifade in t:
                remove_paras.append(p)
                break

    for p in remove_paras:
        try:
            p._element.getparent().remove(p._element)
        except Exception:
            pass

    print(f"    {len(remove_paras)} sablon notu silindi.")

    print("  [1] Kapak ve on sayfalar guncelleniyor...")
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
        elif 'MEZUNİYET TEZİ/PROJE' in t or 'MEZUNİYET TEZ' in t and 'PROJE' in t:
            set_text(p,
                'AURIS: AKUSTİK ÖZNİTELİK TABANLI YAPAY ZEKÂ ÜRETİMİ MÜZİĞİN TESPİTİ '
                'İÇİN ÇOK MODELLİ TOPLULUK SİSTEMİ', bold=True)
        elif t.strip() == 'Ad SOYAD':
            set_text(p, 'Hasan Arthur ALTUNTAŞ', bold=True)
        elif '1111111111111' in t:
            set_text(p, '221001047')
        elif '(Öğrencinin Adı Soyadı)' in t or 'rencinin Ad' in t and 'Soyad' in t:
            set_text(p, 'Hasan Arthur ALTUNTAŞ')
        elif 'değerli katk' in t and 'danışman' in t:
            set_text(p,
                'Bu tez çalışmasının her aşamasında değerli yönlendirmeleri ve '
                'akademik rehberliğiyle süreci şekillendiren danışman hocam '
                'Dr. Öğr. Üyesi Büşra TAKGİL\'e sonsuz teşekkürlerimi sunarım.')
        elif 'eş danışmanım Prof. Dr.' in t:
            clear_para(p)
        elif 'sevgili aileme' in t and 'çalışma arkadaşlar' in t:
            set_text(p, 'Tez süreci boyunca gösterdikleri anlayış ve destekten dolayı aileme ve arkadaşlarıma teşekkür ederim.')
        elif 'BAP-XXX-WWW' in t:
            clear_para(p)

    print("  [2] OZET / ABSTRACT guncelleniyor...")
    for p in doc.paragraphs:
        t = p.text
        if 'BURAYA TEZ BA' in t and 'NG' not in t:
            set_text(p, 'AURIS: AKUSTİK ÖZNİTELİK TABANLI YAPAY ZEKÂ ÜRETİMİ MÜZİĞİN TESPİTİ İÇİN ÇOK MODELLİ TOPLULUK SİSTEMİ', bold=True)
        elif t.strip() in ('Öğrenci ADI', 'renci ADI') or 'renci AD' in t:
            set_text(p, 'Hasan Arthur ALTUNTAŞ')
        elif t.strip() == 'Düzce Üniversitesi' or t.strip() == 'D\xfczce \xdcniversitesi':
            set_text(p, 'Düzce Üniversitesi')
        elif 'Bitirme Tezi' in t and 'Bilgisayar' in t:
            set_text(p, 'Mühendislik Fakültesi, Bilgisayar Mühendisliği Bitirme Tezi')
        elif 'Danışman: Do' in t and ('ALTUN' in t or 'Altun' in t):
            set_text(p, 'Danışman: Dr. Öğr. Üyesi Büşra TAKGİL')
        elif 'Eylül 2019' in t:
            set_text(p, 'Haziran 2026')
        elif ('zeti bir paragraf' in t or 'Buraya tezin' in t) and 'ngilizce' not in t:
            set_text(p,
                'Suno, MusicGen, Udio ve Echoes gibi üretici yapay zekâ platformlarının yaygınlaşmasıyla '
                'yapay zekâ üretimi müzik parçaları içerik akış platformlarında hızla artmaktadır. '
                'Bu tez çalışmasında AURIS sistemi tasarlanmış ve geliştirilmiştir. '
                'AURIS, ses sinyallerinden 5 kategoride toplam 47 akustik öznitelik çıkarmakta; '
                '7 klasik ML ve 4 derin öğrenme modelini 5 katlı tabakalı çapraz doğrulama '
                'protokolüyle karşılaştırmaktadır. 8 farklı kaynaktan derlenen 5.195 ses kaydı '
                'üzerinde eğitilen LightGBM modeli 0,8839 doğruluk, 0,8575 F1-skoru ve '
                '0,9548 ROC-AUC (Brier=0,083) elde etmiştir. Karar eşiği Youden J '
                'istatistiğiyle theta*=0,4316 olarak optimize edilmiştir. Sistem Next.js 14 '
                'web platformu, Kotlin/Jetpack Compose Android uygulaması ve FastAPI arka '
                'ucuyla tam yığın mimaride sunulmuştur. SHAP entegrasyonu her kararı '
                'öznitelik bazında açıklanabilir kılmaktadır.')
        elif 'Anahtar s' in t and 'zc' in t and 'bir' in t:
            set_text(p, 'Anahtar Kelimeler: yapay zekâ müzik tespiti, akustik öznitelik, LightGBM, topluluk öğrenmesi, ses sınıflandırma.')
        elif 'BURAYA TEZ BA' in t and 'NG' in t:
            set_text(p, 'AURIS: A MULTI-MODEL ENSEMBLE SYSTEM FOR AI-GENERATED MUSIC DETECTION USING ACOUSTIC FEATURES', bold=True)
        elif 'Student Name SURNAME' in t:
            set_text(p, 'Hasan Arthur ALTUNTAŞ')
        elif 'Düzce University' in t:
            set_text(p, 'Düzce University')
        elif t.strip() == 'Faculty of Engineering, Computer Engineering':
            set_text(p, 'Faculty of Engineering, Computer Engineering, Undergraduate Thesis')
        elif 'Assoc. Prof. Dr. Yusuf ALTUN' in t:
            set_text(p, 'Supervisor: Asst. Prof. Dr. Büşra TAKGİL')
        elif 'September 2019' in t:
            set_text(p, 'June 2026')
        elif 'ngilizce' in t and 'zeti' in t:
            set_text(p,
                'The rapid proliferation of generative AI platforms such as Suno, MusicGen, Udio, '
                'and Echoes has led to a dramatic increase in AI-generated music on streaming '
                'platforms. This thesis presents AURIS, which extracts 47 acoustic features across '
                'five categories using librosa and evaluates 11 classification models under '
                '5-fold stratified cross-validation. The best-performing LightGBM achieves '
                '0.9548 ROC-AUC, 88.39% accuracy, 0.8575 F1-score, and Brier score 0.083. '
                'Decision threshold is optimized to theta*=0.4316 via Youden\'s J statistic. '
                'SHAP provides feature-level explanations for every decision.')
        elif 'Keywords: Keyword one' in t:
            set_text(p, 'Keywords: AI music detection, acoustic features, LightGBM, ensemble learning, audio classification.')

    print("  [3] H1 bolumleri konumsal olarak dolduruluyor...")
    h1s = find_h1_elements(doc)

    # Sablon H1 sirasi (gercek):
    # 00 GİRİŞ             -> 1. GİRİŞ
    # 01 MATERYAL VE YÖNTEM -> 2. LİTERATÜR TARAMASI
    # 02 BÖLÜM 3            -> 3. MATERYAL VE YÖNTEM
    # 03 ''                 -> bos (sayfa kesme tasiyor, dokunma)
    # 04 BÖLÜM 4            -> 4. BULGULAR
    # 05 ''                 -> bos
    # 06 BULGULAR VE TARTI. -> 5. TARTIŞMA
    # 07 ''                 -> bos
    # 08 KAYNAKLARIN YAZIMI -> 6. SONUÇLAR VE ÖNERİLER
    # 09 BULGULAR VE TARTI. -> bos (sablon artigi)
    # 10 ''                 -> bos
    # 11 SONUÇLAR VE ÖNER.  -> bos (sablon artigi)
    # 12 KAYNAKLAR          -> 7. KAYNAKLAR (gercek referanslar)
    # 13 ''                 -> bos
    # 14 EKLER              -> EKLER
    # 15 ÖZGEÇMİŞ          -> ÖZGEÇMİŞ

    if 'giris' in h1s:
        p = h1s['giris']
        set_text(p, '1. GİRİŞ')
        delete_until_next_h1(p._element)
        insert_block_after(p._element, GIRIS, doc)

    if 'mat_yont' in h1s:
        p = h1s['mat_yont']
        set_text(p, '2. LİTERATÜR TARAMASI')
        delete_until_next_h1(p._element)
        insert_block_after(p._element, LITERATUR, doc)

    if 'bolum3' in h1s:
        p = h1s['bolum3']
        set_text(p, '3. MATERYAL VE YÖNTEM')
        delete_until_next_h1(p._element)
        insert_block_after(p._element, MAT_YONT, doc)

    if 'bolum4' in h1s:
        p = h1s['bolum4']
        set_text(p, '4. BULGULAR')
        delete_until_next_h1(p._element)
        insert_block_after(p._element, BULGULAR, doc)

    if 'bulgular_1' in h1s:
        p = h1s['bulgular_1']
        set_text(p, '5. TARTIŞMA')
        delete_until_next_h1(p._element)
        insert_block_after(p._element, TARTISMA, doc)

    if 'kaynaklarin' in h1s:
        p = h1s['kaynaklarin']
        set_text(p, '6. SONUÇLAR VE ÖNERİLER')
        delete_until_next_h1(p._element)
        insert_block_after(p._element, SONUCLAR, doc)

    # Sablon artiklari — icerik temizle, baslik bos birak
    for key in ('bulgular_2', 'bos_10', 'sonuclar_sab', 'bos_13'):
        if key in h1s:
            p = h1s[key]
            set_text(p, '')
            delete_until_next_h1(p._element)

    if 'kaynaklar' in h1s:
        p = h1s['kaynaklar']
        set_text(p, '7. KAYNAKLAR')
        delete_until_next_h1(p._element)
        ref_items = [(r, 'Normal') for r in KAYNAKLAR]
        insert_block_after(p._element, ref_items, doc)

    if 'ekler' in h1s:
        p = h1s['ekler']
        delete_until_next_h1(p._element)
        insert_block_after(p._element, EKLER, doc)

    if 'ozgecmis' in h1s:
        p = h1s['ozgecmis']
        delete_until_next_h1(p._element)
        insert_block_after(p._element, OZGECMIS, doc)

    print("  [4] Bos H1 basliklar temizleniyor...")
    for p in doc.paragraphs:
        if p.style.name == 'Heading 1' and not p.text.strip():
            # Sayfayi bozmamak icin silmiyoruz, bos birakiyoruz
            pass

    print("  [5] Kaydiyor...")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    doc.save(OUT)
    print(f"[TAMAM] {OUT}")


if __name__ == '__main__':
    build()
