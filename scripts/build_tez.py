# -*- coding: utf-8 -*-
"""
BM498 Mezuniyet Tezi - Tam Build (v4)
AURIS — Hasan Arthur Altuntas — 221001047 — Duzce Universitesi

v4 yenilikleri:
- PDF rapor yapisi esas alinarak bolum organizasyonu
- Maksimum gorsel: 20+ Turkce etiketli figur
- Her bolumde gorsel + bol metin + tablo altyazilari
- XML corruption fix: safe_remove her yerde
- Tum figur yollari guncellendi
"""
import os
from docx import Document
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.shared import Cm, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH

TEMPLATE = "docs/academic/TeslimEdilecekler/tezşablonu.docx"
OUT = "docs/academic/TeslimEdilecekler/1.TEZ-RAPOR/BM498_Mezuniyet_Tezi_Hasan_Arthur_Altuntas.docx"
FIG  = "docs/academic/figures"
SCR  = "docs/academic/figures/screenshots"

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
        if isinstance(item, tuple):
            new_p = make_p(doc, item[0], item[1])
        else:
            new_p = item
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
# Gorsel Ekleme
# ─────────────────────────────────────────────────────────────────────────────
def make_figure(doc, img_path, caption, width_cm=14.5):
    """Gorsel paragraf + altyazi XML elementleri dondurur."""
    elems = []

    # --- Gorsel paragraf ---
    fig_p = doc.add_paragraph()
    try:
        fig_p.style = doc.styles['Şekiller']
    except KeyError:
        fig_p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    try:
        run = fig_p.add_run()
        run.add_picture(img_path, width=Cm(width_cm))
    except Exception as e:
        print(f"    [UYARI] Gorsel yuklenemedi: {os.path.basename(img_path)} — {e}")
        fig_p.add_run(f"[{os.path.basename(img_path)}]")

    elems.append(fig_p._element)

    # --- Altyazi paragraf ---
    cap_p = doc.add_paragraph()
    try:
        cap_p.style = doc.styles['Şekil Yazısı']
    except KeyError:
        cap_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = cap_p.add_run(caption)
    r.bold = True
    elems.append(cap_p._element)

    return elems

def fig(doc, img, caption, w=14.5):
    """Kisayol: make_figure listesi dondur."""
    return make_figure(doc, img, caption, w)

# ─────────────────────────────────────────────────────────────────────────────
# H1 Konumsal Bulma
# ─────────────────────────────────────────────────────────────────────────────
def find_h1s(doc):
    h1s = [p for p in doc.paragraphs if p.style.name == 'Heading 1']
    keys = ['giris','mat_yont','bolum3','bos_3','bolum4','bos_5',
            'bulgular_1','bos_7','kaynaklarin','bulgular_2','bos_10',
            'sonuclar_sab','kaynaklar','bos_13','ekler','ozgecmis']
    result = {}
    for i, h in enumerate(h1s):
        if i < len(keys):
            result[keys[i]] = h
    print(f"  H1 sayisi: {len(h1s)}")
    return result

# ─────────────────────────────────────────────────────────────────────────────
# BOLUM ICERIKLERI
# Isaretciler: ('__FIG:dosyaadi.png:altyazi:genis__', '__FIG__')
# ─────────────────────────────────────────────────────────────────────────────

def F(path, caption, w=14.5):
    """Gorsel isaretci tuple olustur (ayirici | kullanilir)."""
    return (f'__FIG|{path}|{caption}|{w}|__', '__FIG__')

# ────────── 1. GİRİŞ ──────────
GIRIS = [
    ('1.1. Projenin Amacı ve Motivasyon', 'Heading 2'),
    ('Yapay zekâ teknolojilerinin gelişmesiyle birlikte müzik üretimi de köklü bir dönüşüm '
     'geçirmiştir. Suno, MusicGen, Udio ve Echoes gibi üretici yapay zekâ platformları, '
     'müzik teorisi bilgisi olmayan bir kullanıcının dakikalar içinde profesyonel kalitede '
     'parçalar üretmesine olanak tanımaktadır. Şekil 1.1\'de yapay zekâ model eğitiminin '
     'genel şeması gösterilmektedir; veri hazırlığı, model eğitimi ve dağıtım '
     'aşamalarından oluşan bu süreç AURIS\'in de temel geliştirme döngüsünü '
     'oluşturmaktadır.', 'PARAGRAF METNİ'),
    F(f'{FIG}/paper_pipeline_diagram.png',
      'Şekil 1.1. AURIS sistem akış diyagramı — ses girişinden YZ/İnsan kararına uçtan uca işlem hattı.', 15.0),
    ('Bu teknolojik dönüşüm ciddi etik, hukuki ve ekonomik sorunlar doğurmaktadır. Yapay '
     'zekâ üretimi parçaların insan eserleriyle karışarak streaming platformlarına yüklenmesi '
     'telif hakkı ihlallerine zemin hazırlamaktadır. Algoritmik öneri sistemleri yapay zekâ '
     'içeriklerini insanmış gibi sunarak insan sanatçıların gelirlerini zedelemektedir. '
     'Müzik yarışmalarında ve burs değerlendirmelerinde yapay zekâ eserlerinin insan '
     'yaratıcılığı olarak gösterilmesi de ayrı bir sorun oluşturmaktadır [1].', 'PARAGRAF METNİ'),
    ('Yapay zekâ üretimi ses tespitine ilişkin araştırmaların büyük bölümü konuşma sentezi '
     've ses derin sahteciliğine odaklanmış; müziğe özgü tespit sistemleri görece sınırlı '
     'kalmıştır. Liu vd. (2024) bu alanı "gelişmekte olan" olarak nitelendirmekte ve mevcut '
     'yaklaşımların tek üreticiye özgü olduğunu, dolayısıyla yeni sistemlere genelleme '
     'yapamadığını vurgulamaktadır [15]. Bhatt vd. (2025) ise çapraz-üretici genellemenin '
     'alanın temel açık problemi olduğunu ortaya koymaktadır [3].', 'PARAGRAF METNİ'),
    ('1.2. Araştırma Sorusu ve Hedefler', 'Heading 2'),
    ('Bu çalışmanın temel araştırma sorusu şöyledir: "Spektral, zamansal, ritmik, harmonik '
     've vokal boyutları kapsayan el ile tasarlanmış 47 akustik öznitelik, gradient boosting '
     'topluluğuyla birleştirildiğinde, uçtan uca derin öğrenme yaklaşımlarıyla rekabet '
     'edebilir bir yapay zekâ müziği tespit performansı sağlayabilir mi?"', 'PARAGRAF METNİ'),
    ('Belirlenen hedefler: (1) 5 kategoride 47 öznitelikten oluşan kapsamlı ve yorumlanabilir '
     'akustik öznitelik vektörü tasarlamak; (2) 8 kaynaktan derlenen 5.195 örnekli gerçek '
     'dünya veri kümesi oluşturmak; (3) 7 klasik MO ve 4 derin öğrenme modelini aynı '
     'protokolle karşılaştırmak; (4) Youden J istatistiğiyle optimal karar eşiği belirlemek; '
     '(5) SHAP entegrasyonuyla her kararı açıklanabilir kılmak; (6) Sistemi web, Android '
     've API katmanlarıyla üretim ortamına taşımak.', 'PARAGRAF METNİ'),
    ('1.3. BM401–BM498 İki Dönemlik Süreç', 'Heading 2'),
    ('BM401 (2024-2025 Güz Dönemi) aşamasında wav2vec2 tabanlı hibrit bir yaklaşım '
     'tasarlanmış; Next.js 14 web platformu ve Kotlin Android uygulaması prototip düzeyinde '
     'geliştirilmiştir. BM498 (2024-2025 Bahar Dönemi) aşamasında ise araştırma odağı '
     'köklü biçimde değişmiştir: wav2vec2 embedding\'lerinin yorumlanamazlığı nedeniyle '
     'el ile tasarlanmış 47 boyutlu akustik öznitelik vektörüne geçilmiş, veri kümesi '
     '5.195 örneğe genişletilmiş ve SHAP açıklanabilirlik katmanı eklenmiştir.', 'PARAGRAF METNİ'),
    ('1.4. Tez Organizasyonu', 'Heading 2'),
    ('Bölüm 2\'de ilgili literatür, Bölüm 3\'te materyal ve yöntem (veri kümesi, öznitelik '
     'mühendisliği, model mimarileri, uygulama), Bölüm 4\'te bulgular, Bölüm 5\'te '
     'tartışma, Bölüm 6\'da sonuçlar ve öneriler sunulmaktadır.', 'PARAGRAF METNİ'),
]

# ────────── 2. LİTERATÜR TARAMASI ──────────
LITERATUR = [
    ('2.1. Yapay Zekâ Müzik Üretim Sistemleri', 'Heading 2'),
    ('Müzik üretiminde yapay zekâ son yıllarda üç ana paradigma etrafında şekillenmiştir: '
     'otoregresif modeller, difüzyon modelleri ve transformer tabanlı metin-müzik '
     'dönüşümü. Dhariwal vd. (2020) tarafından geliştirilen Jukebox, hiyerarşik VQ-VAE '
     'mimarisini kullanarak ham ses formunda üretim yapan ilk büyük ölçekli modeldir [6]. '
     '1,2 milyar parametresiyle dönemin en büyük müzik modeli olan Jukebox, şarkı sözleri '
     've sanatçı stilini koşul olarak alabilmektedir.', 'PARAGRAF METNİ'),
    ('Meta AI tarafından geliştirilen MusicGen (Copet vd., 2023), metin ve melodi '
     'koşullandırmalı decoder-only transformer mimarisidir [5]. EnCodec ses kodlayıcısı '
     'üzerine inşa edilmiş olan model, 300M ile 3,3B parametre arasında üç ölçekte açık '
     'kaynak lisansıyla yayımlanmıştır. AudioLDM (Liu vd., 2023) ise latent difüzyon '
     'modellerini ses üretimine uyarlayan; CLAP gösterimleriyle koşullandırılan yüksek '
     'kaliteli bir ses sentez mimarisidir [14].', 'PARAGRAF METNİ'),
    ('2.2. Ses Derin Sahteciliği Tespiti', 'Heading 2'),
    ('Yapay zekâ üretimi ses tespitine ilişkin sistematik araştırma, konuşma sentezi ve '
     'ses derin sahteciliği alanından başlamıştır. WaveFake veri kümesi (Frank ve '
     'Schönherr, 2021), yedi farklı vocoder mimarisinin çıktılarını barındıran temel bir '
     'kıyaslama noktası oluşturmuştur [8]. ADD 2022 Yarışması (Yi vd., 2022) ses derin '
     'sahteciliği tespiti alanında üç farklı zorluğu kapsamış; Yi vd. (2023) ise 2008-2023 '
     'yıllarını kapsayan kapsamlı bir derleme çalışması sunmuştur [23],[24].', 'PARAGRAF METNİ'),
    ('Afchar vd. (2025), oto-kodlayıcı artefaktlarından yararlanarak %99,8 doğruluğa '
     'ulaşıldığını, ancak MP3 sıkıştırma ve perde kaydırma gibi basit işlemlerin tespit '
     'oranlarını önemli ölçüde düşürdüğünü IEEE ICASSP 2025\'te sunmuştur [1].', 'PARAGRAF METNİ'),
    ('2.3. Transformer Tabanlı Ses Gösterimleri', 'Heading 2'),
    ('wav2vec2 (Baevski vd., 2020) etiketlenmemiş konuşma verisi üzerinde öz-denetimli '
     'öğrenme yapan bir transformer modelidir [2]. Martín-Doñas ve Álvarez (2022), '
     'wav2vec2\'yi ADD 2022 yarışmasına doğrudan uygulayarak öznitelik mühendisliği '
     'gerektirmeksizin rekabetçi sonuçlar elde etmiştir [18]. CLAP (Elizalde vd., 2023), '
     'karşıtsal önceden eğitimi ses-metin embedding uzayına genişletmekte; LAION-CLAP '
     'varyantı (Wu vd., 2023) 630.000 ses-metin çifti üzerinde eğitilmiştir [7],[22]. '
     'Kosta vd. (2025) ise müzik bölümlerini işleyen Segment Transformer\'ı önermiştir [12].', 'PARAGRAF METNİ'),
    ('2.4. Topluluk Yöntemleri ve Ses Sınıflandırması', 'Heading 2'),
    ('Topluluk yaklaşımları müzik analizi görevlerinde tek model sınıflandırıcılarını '
     'tutarlı biçimde geride bırakmaktadır. Kostrzewa vd. (2022), geniş sinir ağı '
     'topluluklarının müzik türü sınıflandırmasında varyansı azalttığını göstermiştir [13]. '
     'Gan vd. (2024), VMD tabanlı öznitelik ayrıştırmasıyla birleştirilen XGBoost\'un '
     'rekabetçi müzik türü sınıflandırması gerçekleştirdiğini bildirmiştir [9]. '
     'Gourisaria vd. (2024), MFCC ve STFT özniteliklerinin karşılaştırmalı analizinde '
     'her iki öznitelik setinin birlikte kullanılmasının en iyi sonucu verdiğini '
     'bulmuştur [10].', 'PARAGRAF METNİ'),
    ('2.5. Mevcut Tespit Sistemleri ve Araştırma Boşlukları', 'Heading 2'),
    ('IRCAM Amplify kapalı kaynaklı bir API hizmeti olarak yüksek doğruluk bildirmekte; '
     'ancak eğitim verisi ve metodoloji hakkında şeffaflık sunmamaktadır [1]. Believe AI '
     'Radar ticari bir çözüm olup ücretli erişim modeli akademik kullanımı '
     'kısıtlamaktadır. AURIS bu boşlukları; (1) kamuya açık çok üreticili veri kümesi, '
     '(2) şeffaf 5 katlı çapraz doğrulama, (3) SHAP tabanlı açıklanabilirlik ve '
     '(4) ücretsiz web/mobil dağıtım ile kapatmaktadır.', 'PARAGRAF METNİ'),
]

# ────────── 3. MATERYAL VE YÖNTEM ──────────
MAT_YONT = [
    ('3.1. Sistem Mimarisi', 'Heading 2'),
    ('AURIS dört ana modülden oluşmaktadır: (1) Ses Ön İşleme — format standartlaştırma, '
     'yeniden örnekleme, süre normalizasyonu; (2) Öznitelik Çıkarma — librosa tabanlı '
     '47 boyutlu vektör hesaplama; (3) Sınıflandırma — 11 modelin 5 katlı çapraz '
     'doğrulamayla eğitimi ve Youden J eşik optimizasyonu; (4) Açıklama — SHAP '
     'değerlerinin hesaplanması ve görsel sunumu. Desteklenen giriş formatları: '
     'MP3, WAV, FLAC, OGG (maks. 50 MB) ve YouTube bağlantısı.', 'PARAGRAF METNİ'),
    ('3.2. Veri Kümesi', 'Heading 2'),
    ('3.2.1. Derleme Stratejisi', 'Heading 3'),
    ('Veri kümesi, kaynak kökenine dayalı otomatik etiketleme stratejisiyle '
     'oluşturulmuştur. Bilinen yapay zekâ üretim platformlarından gelen örnekler "1" '
     '(YZ), insan müziği arşivlerinden gelenler "0" (İnsan) olarak etiketlenmiştir. '
     'Yalnızca kamuya açık ve Creative Commons lisanslı arşivler kullanılmıştır; '
     'veri sızıntısını önlemek için duration_sec ve sample_rate meta verileri '
     'öznitelik vektörünün dışında bırakılmıştır.', 'PARAGRAF METNİ'),
    ('3.2.2. Kaynak Dağılımı', 'Heading 3'),
    ('Şekil 3.1\'de YZ ve İnsan müziği örneklerinin temel öznitelik dağılımları '
     'karşılaştırmalı olarak sunulmaktadır. Veri kümesi 5.195 ses kaydından oluşmaktadır: '
     '3.113 insan (%59,9) ve 2.082 yapay zekâ (%40,1). YZ kaynakları: '
     'SleepyJesse/ai_music_large (~2.000, 12+ üretici), disco-eth/AIME (~1.000, Suno '
     'v3/v4/v5, Udio, MusicGen, AudioLDM2 dahil 12 sistem), zuhri025/suno-audio (~500). '
     'İnsan kaynakları: marsyas/gtzan (999), '
     'benjamin-paine/free-music-archive-small (~1.000), SleepyJesse insan bölünümü (~2.000).', 'PARAGRAF METNİ'),
    F(f'{FIG}/feature_distribution_ai_vs_human.png',
      'Şekil 3.1. YZ ve İnsan müziği — ilk sekiz özniteliğin dağılım karşılaştırması (5.195 örnek).', 15.0),
    ('Şekil 3.2\'de kaynak bazlı LightGBM performansı gösterilmektedir. Suno YZ örnekleri '
     '0,930 doğrulukla en yüksek ayrım kolaylığını sunarken, Deepfake seti 0,500 ile '
     'en zorlu kaynak olarak öne çıkmaktadır. GTZAN insan örnekleri 0,932 ile en yüksek '
     'insan sınıfı doğruluğunu sağlamaktadır.', 'PARAGRAF METNİ'),
    F(f'{FIG}/per_source_performance.png',
      'Şekil 3.2. Kaynak bazlı performans — LightGBM, θ*=0,4316 (5 katlı çapraz doğrulama tahminleri üzerinde).', 14.5),
    ('3.2.3. Ön İşleme Hattı', 'Heading 3'),
    ('Standartlaştırma adımları: (1) 22.050 Hz\'ye yeniden örnekleme; (2) Stereo→mono '
     'dönüşüm; (3) 30 sn üzeri kırpma, kısa kayıtlar sıfır dolgu; (4) Kalite filtresi — '
     'min 1 sn uzunluk ve min 1e-6 genlik; (5) Veri sızıntısı önlemi — duration_sec ve '
     'sample_rate öznitelik vektöründen çıkarıldı.', 'PARAGRAF METNİ'),
    ('3.3. Öznitelik Mühendisliği', 'Heading 2'),
    ('3.3.1. 47 Boyutlu Öznitelik Vektörü', 'Heading 3'),
    ('AURIS, librosa v0.10.1 [19] ile 47 boyutlu öznitelik vektörü çıkarmaktadır. '
     'Kategoriler: Spektral (16) — MFCC varyans/delta/delta², spectral_centroid, '
     'bandwidth, rolloff, flatness, contrast, regularity; Zamansal/Ritmik (10) — '
     'RMS enerji/std/dinamik aralık, sıfır geçiş oranı, tempo BPM/stabilite/CV; '
     'Onset/Beat (9) — onset güç ort/std, beat sayısı, IBI stabilitesi; '
     'Harmonik/Tonal (8) — chroma entropi/std/geçiş hızı, Tonnetz std, harmonik oran; '
     'Vokal/İfadesel (4) — perde stabilitesi, vibrato düzenliliği, '
     'formant tutarlılığı, nefes örüntüsü.', 'PARAGRAF METNİ'),
    ('Şekil 3.3\'te öznitelikler arası Pearson korelasyon ısı haritası sunulmaktadır. '
     'Koyu turuncu hücreler güçlü pozitif korelasyonu temsil etmektedir. Spektral '
     'öznitelikler kendi aralarında yüksek korelasyon sergilerken vokal öznitelikler '
     'ayrı bir küme oluşturmaktadır.', 'PARAGRAF METNİ'),
    F(f'{FIG}/feature_correlation_heatmap.png',
      'Şekil 3.3. Öznitelik korelasyon ısı haritası — Pearson r, 5.195 parça üzerinden.', 13.5),
    ('3.3.2. Ablasyon Analizi', 'Heading 3'),
    ('Şekil 3.4\'te LightGBM doğruluğunun öznitelik sayısına göre değişimi gösterilmektedir. '
     'Tek öznitelikle 0,598 olan doğruluk, 20 öznitelikte 0,880\'e, 47 öznitelikte '
     '0,884\'e ulaşmaktadır. Doğruluk eğrisi 20 öznitelik civarında doyuma ulaşmakta; '
     'bu bulgu, öznitelik vektörünün büyük bölümünün ayrımcı bilgi taşıdığını '
     'göstermektedir.', 'PARAGRAF METNİ'),
    F(f'{FIG}/feature_ablation_curve.png',
      'Şekil 3.4. Öznitelik çıkarma — LightGBM doğruluğu vs. öznitelik sayısı (öneme göre sıralı).', 13.5),
    ('3.4. Sınıflandırma Modelleri', 'Heading 2'),
    ('3.4.1. Klasik Makine Öğrenmesi Modelleri (7)', 'Heading 3'),
    ('scikit-learn [21], XGBoost [4] ve LightGBM [11] ile 7 model eğitilmiştir. '
     'Lojistik Regresyon: C=2,0, class_weight=balanced. '
     'Rastgele Orman: n_est=500, max_features=log2. '
     'Gradyan Artırma: n_est=180, max_depth=4, lr=0,07. '
     'SVM-RBF: C=10, gamma=0,05, CalibratedClassifierCV. '
     'ÇKA Sinir Ağı: gizli=[192,96,32], alpha=0,001. '
     'XGBoost: n_est=240, max_depth=5, lr=0,06. '
     'LightGBM: n_est=300, num_leaves=31, lr=0,05.', 'PARAGRAF METNİ'),
    ('3.4.2. Derin Öğrenme Modelleri (4)', 'Heading 3'),
    ('PyTorch [20] ile 4 derin öğrenme modeli tasarlanmıştır. BCEWithLogitsLoss ve '
     'Adam (lr=1e-3) tüm modellerde ortak kullanılmıştır. '
     'Derin ÇKA (512-256-128-64-1): BatchNorm + Dropout(0,3), 81,4 sn. '
     '1B-ESA (1D-CNN): Conv1D(1→32→64→128)+GlobalAvgPool+FC(128→1), 125,0 sn. '
     'Artık ÇKA (3 blok, 64 boyut): artık bağlantılar, 128,7 sn. '
     'Dikkat ÇKA: öz-dikkat (64 boyut) + ileri beslemeli katmanlar, 149,6 sn.', 'PARAGRAF METNİ'),
    ('3.5. Eğitim Protokolü', 'Heading 2'),
    ('3.5.1. 5 Katlı Tabakalı Çapraz Doğrulama', 'Heading 3'),
    ('Tüm modeller StratifiedKFold (k=5, random_state=42) ile değerlendirilmiştir. '
     'Tabakalama her katlamada sınıf dağılımını (%59,9 İnsan / %40,1 YZ) korur. '
     'StandardScaler yalnızca eğitim alt kümesine uyarlanmış, doğrulama alt kümesine '
     'dönüşüm uygulanmıştır — veri sızıntısını önleyen sızdırmaz ölçekleme.', 'PARAGRAF METNİ'),
    ('Şekil 3.5\'te eğitim doğruluğu ile 5 katlı CV doğruluğu arasındaki fark '
     '(aşırı öğrenme tanısı) gösterilmektedir. Rastgele Orman, SVM-RBF ve LightGBM '
     'eğitim setinde %100\'e yakın doğruluk sergilerken CV\'de anlamlı düşüş '
     'yaşamaktadır; bu LightGBM için en küçük açıktır.', 'PARAGRAF METNİ'),
    F(f'{FIG}/train_val_gap.png',
      'Şekil 3.5. Eğitim ve çapraz doğrulama doğruluğu — aşırı öğrenme tanısı.', 14.5),
    ('3.5.2. Youden J Eşik Optimizasyonu', 'Heading 3'),
    ('Her katlama için θ* = argmax(Duyarlılık + Özgüllük − 1) hesaplanmaktadır. '
     'LightGBM için θ* = 0,4316 olarak belirlenmiştir. Şekil 3.6\'da eşik taraması '
     'grafiği sunulmaktadır: Kesinlik, Duyarlılık, F1 Skoru ve Doğruluk eğrilerinin '
     'θ=0,4316\'da optimuma ulaştığı açıkça görülmektedir. Varsayılan 0,5 eşiğine '
     'kıyasla Youden eşiği dengeli hata profili sağlamaktadır.', 'PARAGRAF METNİ'),
    F(f'{FIG}/threshold_sweep.png',
      'Şekil 3.6. Eşik taraması — Kesinlik / Duyarlılık / F1 eşiğe göre (LightGBM). Youden-J en iyi θ*=0,4316.', 14.0),
    ('3.6. SHAP Açıklanabilirlik Entegrasyonu', 'Heading 2'),
    ('AURIS her tahmin için SHAP (Lundberg ve Lee, 2017) [17] değerlerini '
     'hesaplamaktadır. LightGBM\'in TreeExplainer arayüzü SHAP değerlerini lineer '
     'zamanda hesaplayarak gerçek zamanlı kullanım için pratik avantaj sağlamaktadır. '
     'Kullanıcıya her analizde hangi özniteliklerin YZ ya da İnsan kararına ne kadar '
     'katkı yaptığı görsel olarak sunulmaktadır.', 'PARAGRAF METNİ'),
    ('3.7. Uygulama Mimarisi', 'Heading 2'),
    ('AURIS üç katmanlı bir uygulama mimarisine sahiptir. Web platformu Next.js 14 + '
     'TypeScript ile geliştirilmiş; Netlify CDN üzerinde statik dağıtım yapılmaktadır. '
     'Android uygulaması Kotlin + Jetpack Compose ile MVVM/Clean Architecture deseni, '
     'API 26+ (Android 8.0), Hilt DI, Retrofit ve Room ile geliştirilmiştir. '
     'FastAPI arka ucu Python 3.11 ile HuggingFace Spaces\'ta 7860 portunda '
     'Docker konteyneri olarak çalışmaktadır.', 'PARAGRAF METNİ'),
    ('Şekil 3.7\'de AURIS web platformunun kullanıcı arayüzü gösterilmektedir. '
     'Kullanıcılar dosya yükleyebilir, YouTube bağlantısı analiz edebilir ve '
     'SHAP açıklamasını görüntüleyebilir.', 'PARAGRAF METNİ'),
    F(f'{SCR}/auris_web_hero.png',
      'Şekil 3.7. AURIS web platformu ana ekranı (Next.js 14, Netlify).', 14.0),
    F(f'{SCR}/auris_web_sec1.png',
      'Şekil 3.8. AURIS web platformu dosya yükleme ve YouTube analiz bölümü.', 14.0),
    ('Şekil 3.9\'da AURIS Android mobil uygulamasının ana ekranı ve analiz '
     'arayüzü gösterilmektedir.', 'PARAGRAF METNİ'),
    F(f'{SCR}/auris_mobile_hero.png',
      'Şekil 3.9. AURIS Android uygulaması ana ekranı (Kotlin/Jetpack Compose, API 26+).', 7.5),
    F(f'{SCR}/auris_mobile_upload.png',
      'Şekil 3.10. AURIS Android uygulaması dosya yükleme ve sonuç ekranı.', 7.5),
]

# ────────── 4. BULGULAR ──────────
BULGULAR = [
    ('4.1. Model Karşılaştırma Sonuçları', 'Heading 2'),
    ('Çizelge 4.1, 5.195 örnek ve 47 öznitelik üzerinde 5 katlı çapraz doğrulamayla '
     'elde edilen tüm 11 modelin performansını ROC-AUC\'a göre sıralı sunmaktadır. '
     'LightGBM 0,9549 ROC-AUC ile birinci, Derin ÇKA 0,9537 ile ikinci, '
     'XGBoost 0,9463 ile üçüncü sıradadır. 1B-ESA 0,8442 ile en düşük AUC\'u '
     'sergilemiştir.', 'PARAGRAF METNİ'),
    ('Çizelge 4.1. 11 modelin 5 katlı çapraz doğrulama performans karşılaştırması (ROC-AUC\'a göre sıralı).', 'Çizelge Yazısı'),
    ('LightGBM (ML): Doğ.=0,8839, F1=0,8575, AUC=0,9549 | '
     'Derin ÇKA (DL): Doğ.=0,8849, F1=0,8596, AUC=0,9537 | '
     'XGBoost (ML): Doğ.=0,8735, F1=0,8402, AUC=0,9463 | '
     'Artık ÇKA (DL): Doğ.=0,8756, F1=0,8476, AUC=0,9453 | '
     'Gradyan Artırma (ML): Doğ.=0,8685, F1=0,8337, AUC=0,9406 | '
     'Rastgele Orman (ML): Doğ.=0,8604, F1=0,8183, AUC=0,9393 | '
     'Dikkat ÇKA (DL): Doğ.=0,8628, F1=0,8293, AUC=0,9356 | '
     'SVM-RBF (ML): Doğ.=0,8612, F1=0,8252, AUC=0,9347 | '
     'ÇKA Sinir Ağı (ML): Doğ.=0,8545, F1=0,8189, AUC=0,9258 | '
     'Lojistik Regresyon (ML): Doğ.=0,7779, F1=0,7390, AUC=0,8511 | '
     '1B-ESA (DL): Doğ.=0,7665, F1=0,7159, AUC=0,8442', 'PARAGRAF METNİ'),
    ('Şekil 4.1\'de tüm 11 modelin Doğruluk, F1 ve ROC-AUC metriklerini '
     'karşılaştıran çubuk grafik sunulmaktadır.', 'PARAGRAF METNİ'),
    F(f'{FIG}/paper_model_comparison.png',
      'Şekil 4.1. 11 modelin performans karşılaştırması — Doğruluk, F1, ROC-AUC (5 katlı CV, 47 öznitelik, 5.195 örnek).', 15.0),
    ('Şekil 4.2\'de Makine Öğrenmesi ile Derin Öğrenme modelleri arasındaki karşılaştırma '
     'üç metrik için ayrı ayrı gösterilmektedir. LightGBM ve Derin ÇKA her üç metrikte de '
     'öne çıkmaktadır.', 'PARAGRAF METNİ'),
    F(f'{FIG}/paper_ml_vs_dl.png',
      'Şekil 4.2. MO ve DÖ modellerinin karşılaştırması — Doğruluk, ROC-AUC, F1 Skoru.', 15.0),
    ('Şekil 4.3\'te tüm modellerin performans ısı haritası sunulmaktadır. Her sütunun en '
     'yüksek değeri kalın olarak gösterilmekte; LightGBM ROC-AUC\'da, Derin ÇKA ise '
     'Doğruluk ve F1\'de öne çıkmaktadır.', 'PARAGRAF METNİ'),
    F(f'{FIG}/all_models_heatmap.png',
      'Şekil 4.3. Tüm modeller performans ısı haritası (sütun bazında en iyi değer kalın).', 15.0),
    ('4.2. ROC Eğrileri Analizi', 'Heading 2'),
    ('Şekil 4.4\'te 11 modelin gerçek tutulan kat tahminleriyle üretilen ROC eğrileri '
     'gösterilmektedir. LightGBM ve Derin ÇKA eğrileri 0,95 üzerinde AUC ile sağ üst '
     'köşeye yakın seyrederken 1B-ESA belirgin biçimde daha düşük eğri '
     'çizmektedir.', 'PARAGRAF METNİ'),
    F(f'{FIG}/paper_roc_curves.png',
      'Şekil 4.4. ROC eğrileri — gerçek tutulan kat tahminleri, 5 katlı CV. Kesikli çizgi: rastgele sınıflandırma (AUC=0,500).', 14.0),
    ('4.3. Çapraz Doğrulama Katlama Stabilitesi', 'Heading 2'),
    ('Şekil 4.5\'te 5 katlı çapraz doğrulama AUC sonuçları tablosu verilmektedir. '
     'LightGBM std=±0,0023 ile en kararlı model konumundadır. Derin ÇKA std=0,0036 '
     'ile DL modelleri arasında en düşük varyansı sergiler. 1B-ESA std=0,0087 ile '
     'en yüksek kararsızlığı göstermektedir.', 'PARAGRAF METNİ'),
    F(f'{FIG}/paper_fold_std_table.png',
      'Şekil 4.5. Çapraz doğrulama AUC sonuçları (5 katlı) — Ort. ± Std, tüm 11 model.', 15.0),
    ('4.4. LightGBM Ayrıntılı Analizi', 'Heading 2'),
    ('4.4.1. Tahmin Olasılık Dağılımı', 'Heading 3'),
    ('Şekil 4.6\'da LightGBM\'in P(YZ) tahmin olasılık dağılımı gösterilmektedir. '
     'İnsan örnekleri (yeşil) 0\'a yakın yoğunlaşırken YZ örnekleri (pembe) 1\'e '
     'yakın birikmiştir. Youden-optimal eşik θ*=0,4316\'nın iki dağılımı net biçimde '
     'ayırdığı görülmektedir.', 'PARAGRAF METNİ'),
    F(f'{FIG}/paper_score_distribution.png',
      'Şekil 4.6. LightGBM tahmin olasılık dağılımı. Kesikli çizgi: Youden-optimal eşik θ*=0,4316.', 13.0),
    ('4.4.2. Karışıklık Matrisi', 'Heading 3'),
    ('Şekil 4.7\'de LightGBM\'in θ*=0,4316 eşiğiyle elde ettiği karışıklık matrisi '
     'gösterilmektedir. Doğru Negatif (İnsan→İnsan): 2.721 (%87,4), '
     'Doğru Pozitif (YZ→YZ): 1.862 (%89,4), '
     'Yanlış Pozitif (İnsan→YZ): 392 (%12,6), '
     'Yanlış Negatif (YZ→İnsan): 220 (%10,6).', 'PARAGRAF METNİ'),
    F(f'{FIG}/paper_confusion_matrix_lightgbm.png',
      'Şekil 4.7. LightGBM karışıklık matrisi (θ*=0,4316). Örnek sayısı ve sınıf yüzdesi gösterilmiştir.', 10.0),
    ('4.4.3. Kalibrasyon Analizi', 'Heading 3'),
    ('Şekil 4.8\'de LightGBM kalibrasyon eğrisi sunulmaktadır. Brier skoru 0,083 ile '
     'model iyi kalibre edilmiş bir olasılık tahmincisi olduğunu kanıtlamaktadır; '
     'eğri köşegene yakın seyretmektedir.', 'PARAGRAF METNİ'),
    F(f'{FIG}/paper_calibration.png',
      'Şekil 4.8. LightGBM kalibrasyon eğrisi. Brier skoru=0,0830, N=5.195 (5 katlı CV).', 12.0),
    ('4.4.4. Kesinlik-Duyarlılık Analizi', 'Heading 3'),
    ('Şekil 4.9\'da LightGBM kesinlik-duyarlılık eğrisi (AP=0,9344) gösterilmektedir. '
     'Yüksek duyarlılık değerlerinde bile yüksek kesinlik korunmaktadır; bu model\'in '
     'az sayıda YZ örneğini gözden kaçırdığını doğrulamaktadır.', 'PARAGRAF METNİ'),
    F(f'{FIG}/paper_precision_recall.png',
      'Şekil 4.9. LightGBM kesinlik-duyarlılık eğrisi (AP=0,9344). Kesikli: baz sınıflandırıcı (0,401).', 12.0),
    ('4.5. Öznitelik Önemi ve SHAP Analizi', 'Heading 2'),
    ('4.5.1. LightGBM Öznitelik Önemi', 'Heading 3'),
    ('Şekil 4.10\'da LightGBM normalleştirilmiş kazanım öznitelik önemi gösterilmektedir. '
     'İlk 10: spectral_flatness_std (0,0619), spectral_contrast_mean (0,0467), '
     'rms_energy (0,0456), onset_strength_std (0,0388), spectral_flatness_mean (0,0370), '
     'rms_dynamic_range (0,0346), onset_strength_mean (0,0332), rms_std (0,0298), '
     'beat_count (0,0298), mfcc_delta_var (0,0289). Spektral kategori ilk 5\'te '
     '3 öznitelikle öne çıkmaktadır.', 'PARAGRAF METNİ'),
    F(f'{FIG}/paper_feature_importance.png',
      'Şekil 4.10. LightGBM normalleştirilmiş kazanım öznitelik önemi — ilk yirmi öznitelik.', 13.5),
    ('4.5.2. SHAP Özet Analizi', 'Heading 3'),
    ('Şekil 4.11\'de SHAP beeswarm grafiği sunulmaktadır. Her nokta bir örneği, yatay '
     'konum modelin çıktısı üzerindeki etkiyi, renk ise öznitelik değerinin büyüklüğünü '
     'temsil etmektedir. spectral_flatness_std yüksek değerlerinin (kırmızı) pozitif '
     'SHAP etkisi (→YZ) sergilediği görülmektedir.', 'PARAGRAF METNİ'),
    F(f'{FIG}/shap_summary.png',
      'Şekil 4.11. SHAP özet grafiği — LightGBM (2.000 örneklik CV diliminde). Kırmızı: yüksek değer, Mavi: düşük.', 12.0),
]

# ────────── 5. TARTIŞMA ──────────
TARTISMA = [
    ('5.1. LightGBM\'in Üstünlüğü', 'Heading 2'),
    ('LightGBM\'in 47 boyutlu öznitelik uzayında en yüksek ROC-AUC\'u (0,9549) elde '
     'etmesi birkaç yapısal faktörle açıklanabilir. Yaprak-düzeyinde büyüme stratejisi '
     'öznitelikler arası karmaşık etkileşimleri daha etkin modellemektedir. Histogram '
     'tabanlı bölme hem hesaplama verimliliğini artırmakta (2,95 sn eğitim) hem de '
     'düzenlilik etkisi yaratmaktadır. 5.195 örneklik orta ölçekli veri kümesinde '
     'LightGBM, derin öğrenme modellerine kıyasla daha verimli öğrenme '
     'sergilemektedir.', 'PARAGRAF METNİ'),
    ('5.2. MO-DÖ Yakınsaması ve Öznitelik Mühendisliğinin Önemi', 'Heading 2'),
    ('LightGBM (AUC=0,9549) ile Derin ÇKA (AUC=0,9537) arasındaki 0,0012\'lik küçük '
     'fark, 47 el ile tasarlanmış akustik özniteliğin mevcut ayrımcı bilginin neredeyse '
     'tamamını kodladığını göstermektedir. Performansın birincil belirleyicisinin '
     'öznitelik mühendisliği hattı olduğu anlaşılmaktadır. 1B-ESA\'nın zayıf performansı '
     '(AUC=0,8442) ise evrişimsel mimarinin uygunsuz indüktif önyargısından '
     'kaynaklanmaktadır: 47 boyutlu düz vektör üzerinde temporal evrişim uygulamak '
     'yerel korelasyon varsayımını geçersiz kılmaktadır.', 'PARAGRAF METNİ'),
    ('5.3. Spektral Düzlük: Yorumlanabilir Ayrımcı', 'Heading 2'),
    ('spectral_flatness_std\'nin en yüksek öznitelik önem skoruna (0,0619) ulaşması '
     'güçlü bir yorumsal çerçeve sunmaktadır. YZ müzik üretim sistemleri perceptual '
     'kalite metriklerini optimize ederek daha homojen ve tonal bir spektral yapı '
     'oluşturmaktadır; insan müziği ise kayıt ortamı gürültüsü ve doğal performans '
     'varyasyonları nedeniyle daha geniş spektral düzlük aralığı sergilemektedir. '
     'Afchar vd. (2025) ile paralel biçimde bu bulgu, YZ sentez süreçlerinin "spektral '
     'iz" bıraktığını kanıtlamaktadır [1].', 'PARAGRAF METNİ'),
    ('5.4. Çapraz-Üretici Genelleme Kapasitesi', 'Heading 2'),
    ('AIME veri kümesi 12 farklı YZ üretim mimarisini (Suno v3/v4/v5, Udio, MusicGen, '
     'Stable Audio, Riffusion, AudioLDM2, Mustango, JEN-1, MusicLDM, Tango) tek bir '
     'eğitim setinde barındırmaktadır. Bu çeşitlilik göz önünde bulundurulduğunda yüksek '
     'AUC değerleri, 47 öznitelik temsilinin üretici-bağımsız artefaktları yakaladığına '
     'işaret etmektedir. Bhatt vd. (2025) çapraz-üretici genellemenin alanın temel '
     'açık problemi olduğunu vurgulamakta; AURIS\'in çok üreticili eğitim stratejisi '
     'bu soruna doğrudan yanıt vermektedir [3].', 'PARAGRAF METNİ'),
    ('5.5. Kaynak Bazlı Performans Yorumu', 'Heading 2'),
    ('Kaynak bazlı analizde Deepfake seti (YZ, n=492) 0,500 ile en zor ayrım güçlüğünü '
     'sunmaktadır. Bu kaynak büyük olasılıkla ses kalitesi veya üretici yapısı açısından '
     'insan müziğine daha yakın örnekler içermektedir. GTZAN (İnsan, n=999) 0,932 ile '
     'en yüksek insan sınıfı doğruluğunu sağlamakta; türler arası homojenliği ve '
     'temiz etiketi bu başarıyı açıklamaktadır.', 'PARAGRAF METNİ'),
    ('5.6. Sınırlamalar', 'Heading 2'),
    ('(1) Veri kümesi büyüklüğü — 5.195 örnek ticari sistemlerle karşılaştırıldığında '
     'küçük kalmaktadır. (2) Adversarial dayanıklılık — MP3 sıkıştırma ve perde '
     'kaydırma gibi işlemlerin etkisi değerlendirilmemiştir. (3) Tür önyargısı — '
     'bazı türlerin aşırı temsili, tür-tabakalı değerlendirme yapılmaması nedeniyle '
     'belirsiz kalmaktadır. (4) wav2vec2 5 katlı CV — doğrudan karşılaştırma için '
     'formal değerlendirme tamamlanmamıştır.', 'PARAGRAF METNİ'),
    ('5.7. Literatürle Karşılaştırma', 'Heading 2'),
    ('AURIS\'in %88,4 doğruluğu ticari sistemlerin gerisinde kalmaktadır; ancak '
     'IRCAM Amplify ve Believe AI Radar şeffaf metodoloji sunmamaktadır. AURIS ise '
     'açık veri kümesi, şeffaf çapraz doğrulama, ücretsiz erişim ve SHAP '
     'açıklanabilirliğiyle akademik güvenilirlik açısından benzersiz bir '
     'konumdadır.', 'PARAGRAF METNİ'),
]

# ────────── 6. SONUÇLAR ──────────
SONUCLAR = [
    ('6.1. Araştırma Sonuçlarının Özeti', 'Heading 2'),
    ('AURIS sistemi 0,9549 ROC-AUC (±0,0023) ve Brier skoru 0,083 ile güçlü ve kararlı '
     'performans sergilemiştir. spectral_flatness_std (0,0619) en güçlü ayrımcı '
     'özniteliktir. Youden J eşik optimizasyonu (θ*=0,4316) dengeli hata profili '
     'sağlamaktadır. SHAP entegrasyonu kapalı kaynak rakiplerden farklılaştıran şeffaf '
     'karar mekanizması sunmaktadır. Tam yığın uygulama (web, Android, API) sistemi '
     'üretim ortamına taşımıştır.', 'PARAGRAF METNİ'),
    ('6.2. Özgün Katkılar', 'Heading 2'),
    ('(a) 5 kategoride 47 akustik öznitelikten oluşan ve müziğe özgü tasarlanmış kapsamlı '
     'öznitelik vektörü; (b) 12+ YZ üretici sistemi kapsayan çok üreticili eğitim veri '
     'kümesi; (c) 7 MO + 4 DÖ modelini aynı şeffaf protokolle karşılaştıran sistematik '
     'çalışma; (d) Youden J eşik optimizasyonunun müziğe özgü tespit bağlamına '
     'uyarlanması; (e) SHAP ile donatılmış ücretsiz ve açık kaynaklı üretim sistemi.', 'PARAGRAF METNİ'),
    ('6.3. Gelecek Çalışma Önerileri', 'Heading 2'),
    ('Kısa vadeli (0-6 ay): Veri kümesini 10.000+ örneğe genişletmek; yeni üreticileri '
     '(Suno v6, Stability AI) dahil etmek; görülmemiş üreticilerden bağımsız test '
     'setiyle çapraz-üretici genellemeyi resmi değerlendirmek; adversarial dayanıklılığı '
     'test etmek; wav2vec2 modelini 5 katlı CV protokolüyle formal değerlendirmek.', 'PARAGRAF METNİ'),
    ('Uzun vadeli (6+ ay): iOS uygulaması; tür-tabakalı değerlendirme; çok kipli analiz '
     '(ses + sözler + meta veri); gerçek zamanlı akış için çevrimiçi öznitelik çıkarma '
     'hattı; federe öğrenme ile sürekli model güncelleme ve yeni üreticilere adaptasyon.', 'PARAGRAF METNİ'),
]

# ────────── 7. KAYNAKLAR ──────────
KAYNAKLAR = [
    '[1]\tAfchar, D., Meseguer Brocal, G. ve Hennequin, R. (2025). AI-Generated Music Detection and Its Challenges. Proceedings of IEEE ICASSP 2025. https://doi.org/10.48550/arXiv.2501.10111',
    '[2]\tBaevski, A., Zhou, Y., Mohamed, A. ve Auli, M. (2020). wav2vec 2.0: A Framework for Self-Supervised Learning of Speech Representations. Advances in Neural Information Processing Systems, 33, 12449-12460.',
    '[3]\tBhatt, A., Rajan, A. ve diğerleri. (2025). AI-Generated Music Detection: A Survey of Methods and Datasets. arXiv preprint. https://doi.org/10.48550/arXiv.2501.10111',
    '[4]\tChen, T. ve Guestrin, C. (2016). XGBoost: A Scalable Tree Boosting System. Proc. 22nd ACM SIGKDD, s. 785-794.',
    '[5]\tCopet, J., Kreuk, F., Gat, I., Remez, T., Kant, D., Synnaeve, G., Adi, Y. ve Défossez, A. (2023). Simple and Controllable Music Generation. Advances in NeurIPS, 36, 47704-47720.',
    '[6]\tDhariwal, P., Jun, H., Payne, C., Kim, J. W., Radford, A. ve Sutskever, I. (2020). Jukebox: A Generative Model for Music. arXiv preprint arXiv:2005.00341.',
    '[7]\tElizalde, B., Deshmukh, S., Al Ismail, M. ve Wang, H. (2023). CLAP: Learning Audio Concepts from Natural Language Supervision. Proc. ICASSP 2023, s. 1-5. IEEE.',
    '[8]\tFrank, J. ve Schönherr, L. (2021). WaveFake: A Data Set to Facilitate Audio Deepfake Detection. NeurIPS 2021 Datasets and Benchmarks Track.',
    '[9]\tGan, R., Huang, T., Shao, J. ve Wang, F. (2024). Music Genre Classification Based on VMD-IWOA-XGBoost. Mathematics, 12(10), 1549. https://doi.org/10.3390/math12101549',
    '[10]\tGourisaria, M. K., Agrawal, R. ve Sahni, M. (2024). Comparative Analysis of Audio Classification with MFCC and STFT Features Using Machine Learning Techniques. Discover Internet of Things, 4.',
    '[11]\tKe, G., Meng, Q., Finley, T., Wang, T., Chen, W., Ma, W., Ye, Q. ve Liu, T. (2017). LightGBM: A Highly Efficient Gradient Boosting Decision Tree. Advances in NeurIPS, 30.',
    '[12]\tKosta, K., Meseguer Brocal, G., Afchar, D. ve Hennequin, R. (2025). Segment Transformer: AI-Generated Music Detection via Music Structural Analysis. arXiv:2509.08283.',
    '[13]\tKostrzewa, D., Mazur, W. ve Brzeski, R. (2022). Wide Ensembles of Neural Networks in Music Genre Classification. Proc. MISSI 2022, s. 91-102. Springer.',
    '[14]\tLiu, H., Chen, Z., Yuan, Y., Mei, X., Liu, X., Mandic, D., Wang, W. ve Plumbley, M. D. (2023). AudioLDM: Text-to-Audio Generation with Latent Diffusion Models. Proc. ICML 2023.',
    '[15]\tLiu, Y. ve diğerleri. (2024). From Audio Deepfake Detection to AI-Generated Music Detection: A Pathway and Overview. arXiv:2412.00571.',
    '[16]\tLiu, Y., Yin, Y., Zhu, Q. ve Cui, W. (2022). Musical Instrument Recognition by XGBoost Combining Feature Fusion. arXiv:2206.00901.',
    '[17]\tLundberg, S. M. ve Lee, S. I. (2017). A Unified Approach to Interpreting Model Predictions. Advances in NeurIPS, 30.',
    '[18]\tMartín-Doñas, J. M. ve Álvarez, A. (2022). The Vicomtech Audio Deepfake Detection System Based on Wav2vec2 for the 2022 ADD Challenge. Proc. ICASSP 2022, s. 9266-9270. IEEE.',
    '[19]\tMcFee, B., Raffel, C., Liang, D., Ellis, D. P. W., McVicar, M., Battenberg, E. ve Nieto, O. (2015). librosa: Audio and Music Signal Analysis in Python. Proc. 14th Python in Science Conf., s. 18-25.',
    '[20]\tPaszke, A. ve diğerleri. (2019). PyTorch: An Imperative Style, High-Performance Deep Learning Library. Advances in NeurIPS, 32.',
    '[21]\tPedregosa, F. ve diğerleri. (2011). Scikit-learn: Machine Learning in Python. Journal of Machine Learning Research, 12, 2825-2830.',
    '[22]\tWu, Y., Chen, K., Zhang, T., Hui, Y., Berg-Kirkpatrick, T. ve Dubnov, S. (2023). Large-Scale Contrastive Language-Audio Pretraining with Feature Fusion. Proc. ICASSP 2023. IEEE.',
    '[23]\tYi, J., Fu, R., Tao, J., Nie, S., Ma, H., Wang, C. ve diğerleri. (2022). ADD 2022: The First Audio Deep Synthesis Detection Challenge. Proc. ICASSP 2022, s. 9216-9220. IEEE.',
    '[24]\tYi, J., Wang, C., Tao, J., Zhang, X., Zhang, C. Y. ve Zhao, Y. (2023). Audio Deepfake Detection: A Survey. arXiv:2308.14970.',
]

# ────────── EKLER ──────────
EKLER = [
    ('Ek 1. AURIS 47 Öznitelik Tam Listesi', 'Heading 2'),
    ('Spektral (16): 1-spectral_centroid_mean | 2-spectral_centroid_std | '
     '3-spectral_bandwidth_mean | 4-spectral_bandwidth_std | 5-spectral_flatness_mean | '
     '6-spectral_flatness_std [EN GÜÇLÜ] | 7-spectral_rolloff_mean | '
     '8-spectral_rolloff_std | 9-spectral_contrast_mean | 10-spectral_contrast_std | '
     '11-mfcc_variance | 12-mfcc_delta_var | 13-mfcc_delta2_var | 14-mel_flatness | '
     '15-spectral_regularity | 16-harmonic_structure', 'PARAGRAF METNİ'),
    ('Zamansal/Ritmik (10): 17-tempo_bpm | 18-tempo_stability | 19-tempo_cv | '
     '20-beat_count | 21-onset_strength_mean | 22-onset_strength_std | '
     '23-rms_energy | 24-rms_std | 25-rms_dynamic_range | 26-zero_crossing_rate', 'PARAGRAF METNİ'),
    ('Onset/Beat (9): 27-zero_crossing_std | 28-temporal_patterns | '
     '29-chroma_entropy | 30-chroma_std | 31-chroma_transition_rate | '
     '32-tonnetz_std | 33-harmonic_ratio | 34-vocal_energy_ratio | '
     '35-vocal_harmonic_ratio', 'PARAGRAF METNİ'),
    ('Vokal/İfadesel (12): 36-vocal_confidence | 37-has_vocals | '
     '38-pitch_mean_hz | 39-pitch_std_cents | 40-pitch_stability_score | '
     '41-vibrato_rate_hz | 42-vibrato_extent_cents | 43-vibrato_regularity_score | '
     '44-formant_consistency_score | 45-breath_pattern_score | '
     '46-vocal_texture_score | 47-vocal_ai_score', 'PARAGRAF METNİ'),
    ('Ek 2. Sistem Gereksinimleri', 'Heading 2'),
    ('Donanım: RAM 8 GB+, Disk ~500 MB, CPU 4 çekirdek+ (GPU opsiyonel). '
     'Yazılım: Python 3.11+, Node.js 20.18.1+, Android Studio (API 26+). '
     'Backend: uvicorn app.main:app --host 0.0.0.0 --port 7860. '
     'Web: cd platform && npm install && npm run dev (port 3000).', 'PARAGRAF METNİ'),
    ('Ek 3. Erişim Bilgileri', 'Heading 2'),
    ('Web platformu: https://hasanarthuraltunas.xyz | '
     'HuggingFace Spaces: https://huggingface.co/spaces/Rtur2003/AURIS | '
     'Açık kaynak kod deposu: https://github.com/Rtur2003/CrownCode', 'PARAGRAF METNİ'),
]

# ────────── ÖZGEÇMİŞ ──────────
OZGECMIS = [
    ('Hasan Arthur ALTUNTAŞ, 2002 yılında doğmuştur. 2020 yılında Düzce Üniversitesi '
     'Mühendislik Fakültesi Bilgisayar Mühendisliği Bölümü\'ne kayıt yaptırmıştır. '
     'Lisans eğitimi süresince yapay zekâ, makine öğrenmesi ve ses işleme '
     'konularında akademik çalışmalar yürütmüştür.', 'PARAGRAF METNİ'),
    ('BM401 Proje Tasarımı dersinde wav2vec2 tabanlı müzik tespit sistemi prototipi, '
     'BM498 Mezuniyet Tezi kapsamında AURIS adlı çok modelli akustik öznitelik tabanlı '
     'ses sınıflandırma sistemi geliştirmiştir. AURIS projesi GUJSA dergisine makale '
     'olarak gönderilmiştir.', 'PARAGRAF METNİ'),
    ('Öğrenci No: 221001047 | E-posta: hasannarthurrr@gmail.com | '
     'GitHub: github.com/Rtur2003 | Düzce Üniversitesi, Haziran 2026', 'PARAGRAF METNİ'),
]

# ─────────────────────────────────────────────────────────────────────────────
# Bolum icerigi olusturucu — gorsel isaretcilerini gercek elemanlara cevir
# ─────────────────────────────────────────────────────────────────────────────
def build_items(section, doc):
    result = []
    for item in section:
        if isinstance(item, tuple) and item[1] == '__FIG__':
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
# ANA BUILD
# ─────────────────────────────────────────────────────────────────────────────
SILINCEK = [
    'Bu açıklama notlarını silmek için','OTOMATİK DEĞİŞİKLİKLERİ GÜNCELLEMEK',
    'ÇİZELGE, ŞEKİL VE DENKLEM NUMARALARI OTOMATİK','BÖLÜM BAŞLIKLARI SAYFA BAŞINDAN',
    'BAŞLIKLAR HER BİR EK İÇİN','TÜM BAŞLIKLAR KOPYALANIP','ALT BAŞLIK İTALİK OLMALIDIR',
    'EKLE MENÜSÜNDEN ÇAPRAZ BAŞVURU','NOT: BU KAYNAKLAR MENDELEY',
    'ENSON KAYNAKLAR KISMINA EKLERKEN','REFERANSLAR IEEE STANDARTLARINDA',
    'KAYNAKLAR 1 SATIR ARALIĞI','EKLER ANA VE ARA BAŞLIKLARI','DİPNOTLAR EKLENEBİLİR',
    'SADECE BUNLAR TEKRAR KOPYALANIP','SADECE BUNLARI TEKRAR KOPYALAYIP',
    'BAŞVURU TÜRÜ MENÜSÜNDE','BAŞVURU EKLE MENÜSÜ','HARİTA NUMARASI DEĞİŞTİĞİNDE',
    'ÖZGEÇMİŞ NUMARALANDIRILMAYACAKTIR','GİRİŞ BÖLÜMÜ ZORUNLUDUR',
    'SONUÇ BÖLÜMÜ ZORUNLUDUR','Bu TEZ ŞABLONU tez yazım',
    'Tezin Giriş Bölümü Tez ile','Bölüm 1, Tezin Giriş kısmıydı',
    'Aşağıda Tezde kullanılacak olan','NOT: BASKI ÖNİZLEME ŞEKLİ',
    'Çizelge 2.1 otomatik olarak','Şekil referansları şekillerden önce',
    'Şekil numarası değiştiğinde','Paragraf referansları şekillerden',
    'Çizelge referansları çizelgelerden','Şekilden önceki metin','seçilip, Biçim',
    '[1]\tG. Pipeleers','[2]\tB. Lu, F. Wu','[3]\tV. Q. Leu','[4]\tM. Alma',
    '[5]\tK. Graichen','[6]\tX. Litrico','[7]\tI. Masubuchi',
    'Agharkakli, A.,','Altun, Y. (','Chowdhury, D.','Feng, Y.,','Lauwerys, C.',
    'Roy, P.,','Sinthipsomboon','Wang, K., He','Zhao, P., &','Zheng, J. ming',
    'Makale Örnek:','Konferans Örnek:','Kitap Örnek:',
    'Bu bölüm varsa Eklerin','Kaynakları metin içerisinde',
    'Kaynaklar listesi, tezdeki','Bunun için Mendeley','Mendeley program',
    'Araştırmada kaynak gösterilen','Elde edilen bilgilerin',
    'Örneğin:,(','Paragraf.','Birimler','Manzara','Harita ..','Türkiye solar','Rs',
]

def build():
    print("[AURIS] Tez build v4 basliyor...")
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
            set_text(p, 'Anahtar Kelimeler: yapay zekâ müzik tespiti, akustik öznitelik, LightGBM, topluluk öğrenmesi, ses sınıflandırma.')
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
            set_text(p, 'Keywords: AI music detection, acoustic features, LightGBM, ensemble learning, audio classification.')

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
        print(f"    {key} -> {title!r} ({len(items)} item, {figs} gorsel elem)")

    fill('giris',      '1. GİRİŞ',               GIRIS)
    fill('mat_yont',   '2. LİTERATÜR TARAMASI',  LITERATUR)
    fill('bolum3',     '3. MATERYAL VE YÖNTEM',  MAT_YONT)
    fill('bolum4',     '4. BULGULAR',              BULGULAR)
    fill('bulgular_1', '5. TARTIŞMA',              TARTISMA)
    fill('kaynaklarin','6. SONUÇLAR VE ÖNERİLER', SONUCLAR)

    # Sablon artiklari temizle
    for key in ('bulgular_2','bos_10','sonuclar_sab','bos_13'):
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
        insert_block_after(p._element, EKLER, doc)
        print(f"    ekler ({len(EKLER)} item)")

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
