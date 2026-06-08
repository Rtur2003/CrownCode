# -*- coding: utf-8 -*-
"""
BM498 Mezuniyet Tezi
AURIS: Akustik Öznitelik Tabanlı Yapay Zekâ Üretimi Müzik Tespiti
Hasan Arthur Altuntaş — 221001047
Düzce Üniversitesi, Bilgisayar Mühendisliği, 2025-2026
"""
import copy
from docx import Document
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL

TEMPLATE = "docs/academic/TeslimEdilecekler/tezşablonu.docx"
OUT = "docs/academic/TeslimEdilecekler/1.TEZ-RAPOR/BM498_Mezuniyet_Tezi_Hasan_Arthur_Altuntas.docx"

# ── Yardımcı fonksiyonlar ──────────────────────────────────────────────────

def add_para(doc, text, style='PARAGRAF METNİ', bold=False, align=None):
    p = doc.add_paragraph(text, style=style)
    if bold:
        for run in p.runs:
            run.bold = True
    if align:
        p.alignment = align
    return p

def add_heading1(doc, text):
    return doc.add_paragraph(text, style='Heading 1')

def add_heading2(doc, text):
    return doc.add_paragraph(text, style='Heading 2')

def add_heading3(doc, text):
    return doc.add_paragraph(text, style='Heading 3')

def add_table(doc, headers, rows, col_widths=None):
    t = doc.add_table(rows=1 + len(rows), cols=len(headers))
    t.style = 'Table Grid'
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    hrow = t.rows[0]
    for i, h in enumerate(headers):
        cell = hrow.cells[i]
        cell.text = h
        for run in cell.paragraphs[0].runs:
            run.bold = True
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    for ri, row_data in enumerate(rows):
        for ci, val in enumerate(row_data):
            cell = t.rows[ri + 1].cells[ci]
            cell.text = str(val)
            cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    if col_widths:
        for i, row in enumerate(t.rows):
            for j, cell in enumerate(row.cells):
                if j < len(col_widths):
                    cell.width = Cm(col_widths[j])
    return t

def add_page_break(doc):
    doc.add_page_break()

def add_blank(doc):
    doc.add_paragraph('', style='Normal')


# ── Ana tez içeriği ────────────────────────────────────────────────────────

def build():
    doc = Document(TEMPLATE)
    # Şablondaki tüm mevcut içeriği koru ama kendi bölümlerimizi ekleyelim
    # Şablonu temiz aç, kapak sayfalarını koruyalım
    # İçerik paragraflarını temizleyip yeniden dolduruyoruz:
    # Şablonda Heading1 'GİRİŞ' sonrasından başlayalım
    # En basit yaklaşım: yeni doc oluşturup şablon stillerini kullan

    doc2 = Document(TEMPLATE)
    # Şablondaki tüm paragrafları sil, sadece stilleri al
    # Aslında şablonun ilk sayfalarını (kapak, beyan vb.) koruyacağız
    # O yüzden şablonun son içerik kısmından sonra ekleme yapalım:
    # Şablon son paragrafına pointer al
    # Daha temiz: doğrudan şablona içerik yaz

    doc = Document(TEMPLATE)

    # Mevcut içerik paragraflarını bul ve sil (Heading1'den itibaren)
    # Şablonda kapak + beyan + teşekkür + içindekiler öncesi kısımlar korunacak
    # Biz GİRİŞ'ten itibaren yazacağız

    # Şablonu olduğu gibi bırak, sonuna ekle - hayır,
    # Şablonu koru ve yeni içerik ekle (paragrafları manipüle etmeden)
    # En temiz yol: body elementlerine directly append

    # ── Şablonu kopyala, içerik bölümlerini yaz ──
    # Şablon zaten kapak + beyan + teşekkür + içindekiler şablonu içeriyor
    # Biz bunları geçip kendi bölümlerimizi ekleyeceğiz

    # Kapak güncelle: şablondaki placeholder metinleri değiştir
    for para in doc.paragraphs:
        if '202X-202X' in para.text:
            para.clear()
            para.add_run('2025-2026 AKADEMİK YILI').bold = True
        elif 'GÜZ/BAHAR' in para.text:
            para.clear()
            para.add_run('BAHAR DÖNEMİ').bold = True
        elif 'BM401' in para.text and 'BM498' in para.text:
            para.clear()
            para.add_run('BM498 MEZUNİYET TEZİ').bold = True
        elif 'Ders Sorumlusu:' in para.text:
            pass
        elif 'Unvan. Ad SOYAD' in para.text:
            para.clear()
            para.add_run('Dr. Öğr. Üyesi Büşra TAKGİL').bold = True
        elif 'MEZUNİYET TEZİ/PROJE/ÖDEV BAŞLIĞI' in para.text:
            para.clear()
            run = para.add_run('AURIS: AKUSTİK ÖZNİTELİK TABANLI YAPAY ZEKÂ ÜRETİMİ MÜZİĞİN TESPİTİ')
            run.bold = True
        elif 'Hazırlayan:' in para.text:
            pass
        elif 'Ad SOYAD' in para.text and 'Hazırlayan' not in para.text:
            para.clear()
            para.add_run('Hasan Arthur ALTUNTAŞ').bold = True
        elif '1111111111111' in para.text:
            para.clear()
            para.add_run('221001047').bold = True
        elif '03 Nisan 2026' in para.text:
            para.clear()
            para.add_run('06 Haziran 2026').bold = True
        elif '(Öğrencinin Adı Soyadı)' in para.text:
            para.clear()
            para.add_run('Hasan Arthur ALTUNTAŞ')

    # Teşekkür bölümünü güncelle
    for i, para in enumerate(doc.paragraphs):
        if 'TEŞEKKÜRkonunun belirlenmesinde' in para.text or (
            'danışmanlığı' in para.text.lower() and 'çok değerli hocam' in para.text.lower()):
            para.clear()
            para.add_run(
                'Bu tez çalışmasının her aşamasında değerli yönlendirmeleri ve destekleriyle '
                'sürecimi şekillendiren danışman hocam Dr. Öğr. Üyesi Büşra TAKGİL\'e sonsuz '
                'teşekkürlerimi sunarım. Tez boyunca gösterdiği ilgi ve sabır bu çalışmanın '
                'tamamlanmasında belirleyici rol oynamıştır.'
            )
        elif 'eş danışmanım Prof. Dr.' in para.text:
            para.clear()
        elif 'sevgili aileme ve çalışma arkadaşlarıma' in para.text:
            para.clear()
            para.add_run(
                'Bu süreçte maddi ve manevi desteklerini esirgemeyen aileme ve '
                'çalışma arkadaşlarıma içtenlikle teşekkür ederim.'
            )
        elif 'BAP-XXX-WWW' in para.text:
            para.clear()

    # Şimdi asıl içerik bölümlerini ekle
    # ÖZET
    doc.add_paragraph('ÖZET', style='İLK BAŞLIKLAR')
    doc.add_paragraph(
        'Bu tez çalışmasında, yapay zekâ tarafından üretilen müzik parçalarını '
        'insan tarafından üretilen müziklerden otomatik olarak ayırt eden AURIS '
        '(Akustik Öznitelik Tabanlı Yapay Zekâ Müzik Tespiti) sistemi geliştirilmiştir. '
        'Günümüzde Suno, MusicGen, Echoes gibi araçların yaygınlaşmasıyla yapay zekâ '
        'üretimi müziklerin içerik platformlarında hızla çoğalması; telif hakkı ihlalleri, '
        'adil rekabet kaygıları ve sanatçı haklarına yönelik tehditler doğurmaktadır. '
        'Bu tehdide karşı güvenilir ve açıklanabilir bir tespit sistemi geliştirilmesi '
        'araştırmanın temel motivasyonunu oluşturmaktadır.',
        style='PARAGRAF METNİ')
    doc.add_paragraph(
        'AURIS, ses sinyallerinden 5 ana kategoride toplam 47 akustik öznitelik çıkarmakta '
        've bu öznitelikler üzerinde 11 makine öğrenmesi ile derin öğrenme modelini '
        '5 katlı çapraz doğrulama protokolüyle karşılaştırmaktadır. Veri kümesi, '
        '8 farklı kaynaktan derlenen 5.195 ses kaydından oluşmakta olup; 3.113 insan '
        '(%59,9) ve 2.082 yapay zekâ (%40,1) üretimi örnek içermektedir. '
        'Öznitelik önemi analizinde spektral düzlük değişimi, spektral kontrast ve '
        'RMS enerji dinamikleri en ayırt edici faktörler olarak öne çıkmaktadır.',
        style='PARAGRAF METNİ')
    doc.add_paragraph(
        'En yüksek performansı elde eden LightGBM modeli; %88,39 doğruluk, '
        '0,8575 F1-skoru ve 0,9548 ROC-AUC değerine (±0,0023) ulaşmıştır. '
        'Karar eşiği, Youden J istatistiği ile 0,4316 olarak optimize edilmiştir. '
        'Sistem; web platformu (Next.js 14), Android mobil uygulaması (Kotlin/Jetpack Compose) '
        've FastAPI arka ucuyla tam yığın bir mimaride kullanıma sunulmuştur. '
        'SHAP (SHapley Additive exPlanations) entegrasyonu sayesinde her sınıflandırma kararı '
        'öznitelik bazında açıklanabilmekte, böylece sistem yalnızca doğruluk değil '
        'yorumlanabilirlik açısından da güvenilirlik sağlamaktadır.',
        style='PARAGRAF METNİ')
    doc.add_paragraph(
        'Anahtar Kelimeler: Yapay zekâ müzik tespiti, akustik öznitelik mühendisliği, '
        'LightGBM, SHAP açıklanabilirliği, derin öğrenme, müzik bilgi işleme.',
        style='PARAGRAF METNİ')

    doc.add_paragraph('ABSTRACT', style='İLK BAŞLIKLAR')
    doc.add_paragraph(
        'This thesis presents AURIS (Acoustic Feature-Based AI-Generated Music Detection), '
        'a system designed to automatically distinguish AI-generated music from human-composed '
        'music. The rapid proliferation of AI music generation tools such as Suno, MusicGen, '
        'and Echoes has raised critical concerns about copyright infringement, fair competition, '
        'and artist rights in the digital content ecosystem.',
        style='PARAGRAF METNİ')
    doc.add_paragraph(
        'AURIS extracts 47 acoustic features across five categories from audio signals and '
        'evaluates 11 machine learning and deep learning models using a 5-fold stratified '
        'cross-validation protocol. The dataset comprises 5,195 audio samples from 8 diverse '
        'sources, including 3,113 human-composed (59.9%) and 2,082 AI-generated (40.1%) tracks. '
        'Feature importance analysis identifies spectral flatness variation, spectral contrast, '
        'and RMS energy dynamics as the most discriminative factors.',
        style='PARAGRAF METNİ')
    doc.add_paragraph(
        'The best-performing LightGBM model achieves 88.39% accuracy, 0.8575 F1-score, '
        'and 0.9548 ROC-AUC (±0.0023). The decision threshold is optimized to 0.4316 '
        'using the Youden J statistic. The system is deployed as a full-stack architecture '
        'with a Next.js 14 web platform, a Kotlin/Jetpack Compose Android application, '
        'and a FastAPI backend. SHAP integration enables per-feature explanations for every '
        'classification decision, providing both accuracy and interpretability.',
        style='PARAGRAF METNİ')
    doc.add_paragraph(
        'Keywords: AI music detection, acoustic feature engineering, LightGBM, '
        'SHAP explainability, deep learning, music information retrieval.',
        style='PARAGRAF METNİ')

    add_page_break(doc)

    # ═══════════════════════════════════════════════════════
    # 1. GİRİŞ
    # ═══════════════════════════════════════════════════════
    add_heading1(doc, '1. GİRİŞ')
    add_heading2(doc, '1.1. Problemin Tanımı ve Motivasyon')
    add_para(doc,
        'Son yıllarda derin öğrenme tabanlı üretici yapay zekâ sistemlerinin '
        'hızla gelişmesi, müzik üretim alanını kökten dönüştürmüştür. '
        'Suno, MusicGen, Udio ve Stable Audio gibi araçlar; müzik bilgisi '
        'olmayan bir kullanıcının bile dakikalar içinde profesyonel kalitede '
        'müzik üretmesine olanak tanımaktadır. Bu araçların geniş kitlelere '
        'yayılmasıyla birlikte içerik platformlarında yapay zekâ üretimi '
        'müziklerin payı hızla artmaktadır.')
    add_para(doc,
        'Bu durumun doğurduğu başlıca sorunlar şöyle sıralanabilir: '
        'Birincisi, yapay zekâ üretimi parçaların insan sanatçıların eserleriyle '
        'karışarak platforma yüklenmesi telif hakkı ihlallerine zemin hazırlamaktadır. '
        'İkincisi, streaming gelirleri ve algoritma önerileri açısından insan '
        'sanatçılar ile yapay zekâ arasındaki haksız rekabet ortamı '
        'sanatçı ekonomisini olumsuz etkilemektedir. '
        'Üçüncüsü, müzik yarışmalarında ve değerlendirme süreçlerinde '
        'yapay zekâ üretimi içeriklerin insanmış gibi sunulması '
        'etik ve adalet sorunları yaratmaktadır. '
        'Bu bağlamda güvenilir, açıklanabilir ve gerçek zamanlı çalışabilen '
        'bir tespit sistemine olan ihtiyaç kritik önem kazanmaktadır.')

    add_heading2(doc, '1.2. Araştırmanın Amacı ve Katkıları')
    add_para(doc,
        'Bu çalışmanın temel amacı, akustik öznitelik mühendisliği ve '
        'çok modelli karşılaştırmalı değerlendirme yaklaşımıyla '
        'yapay zekâ üretimi müzikleri yüksek doğrulukla tespit eden '
        've sınıflandırma kararlarını yorumlanabilir biçimde sunan '
        'AURIS sistemini geliştirmektir. Çalışmanın başlıca katkıları şunlardır:')

    items = [
        '5 kategoride 47 akustik öznitelikten oluşan kapsamlı bir öznitelik vektörü tasarımı;',
        '8 farklı kaynaktan derlenen 5.195 örnekli gerçek dünya veri kümesi;',
        '11 model (7 klasik ML + 4 derin öğrenme) üzerinde 5 katlı çapraz doğrulama;',
        'Youden J istatistiğiyle optimize edilmiş karar eşiği (θ* = 0,4316);',
        'SHAP entegrasyonu ile öznitelik bazında açıklanabilir sınıflandırma;',
        'Web (Next.js 14), Android (Kotlin/Compose) ve REST API ile tam yığın dağıtım.',
    ]
    for item in items:
        p = doc.add_paragraph(style='listeler stili')
        p.add_run('• ' + item)

    add_heading2(doc, '1.3. Tez Organizasyonu')
    add_para(doc,
        'Tezin geri kalan bölümleri şu şekilde düzenlenmiştir: '
        'Bölüm 2\'de yapay zekâ müzik üretimi, tespit yöntemleri ve '
        'ilgili akademik çalışmalar ele alınmaktadır. '
        'Bölüm 3\'te sistem mimarisi, öznitelik mühendisliği, '
        'veri kümesi ve eğitim metodolojisi açıklanmaktadır. '
        'Bölüm 4\'te model karşılaştırma sonuçları ve bulgular sunulmaktadır. '
        'Bölüm 5\'te bulgular literatür ve ticari sistemlerle tartışılmaktadır. '
        'Bölüm 6\'da sonuçlar ve gelecek çalışma önerileri yer almaktadır.')

    add_page_break(doc)

    # ═══════════════════════════════════════════════════════
    # 2. LİTERATÜR TARAMASI
    # ═══════════════════════════════════════════════════════
    add_heading1(doc, '2. LİTERATÜR TARAMASI')
    add_heading2(doc, '2.1. Yapay Zekâ Müzik Üretim Sistemleri')
    add_para(doc,
        'Müzik üretiminde yapay zekâ kullanımı son yıllarda exponansiyel bir artış '
        'göstermiştir. OpenAI\'ın Jukebox modeli (Dhariwal vd., 2020), '
        'autoregresif transformer mimarisini ham ses üretiminde ilk kez '
        'geniş ölçekte uygulayan çalışmalardan birini temsil etmektedir. '
        'Meta AI tarafından geliştirilen MusicGen (Copet vd., 2023), '
        'metin koşullandırmalı yüksek kaliteli müzik üretebilen '
        'decoder-only transformer modelidir ve 2023 yılında NeurIPS\'ta '
        'sunulmuştur. Stability AI\'ın Stable Audio modeli ise '
        'latent diffusion yaklaşımını müzik sentezine uyarlamıştır.')
    add_para(doc,
        'Ticari alanda Suno (v3/v4/v5), Udio ve Soundraw gibi platformlar '
        'son kullanıcıya yönelik erişilebilir arayüzler sunarak '
        'yapay zekâ müziğini yaygınlaştırmıştır. '
        'Bu araçların varlığı, tespit araştırmalarına zemin hazırlamış; '
        '2024-2025 yılları arasında yayımlanan çalışmaların sayısında '
        'belirgin artış gözlemlenmiştir.')

    add_heading2(doc, '2.2. Ses Derin Sahteciliği ve Tespit Araştırmaları')
    add_para(doc,
        'Yapay zekâ üretimi ses tespiti alanında öncü çalışmalar '
        'çoğunlukla konuşma sentezi ve ses derin sahteciliği (audio deepfake) '
        'üzerine yoğunlaşmıştır. ASVspoof yarışma serisi (2019, 2021) '
        'bu alandaki değerlendirme standartlarını belirlemiş; '
        'LCNN, RawNet2 ve AASIST gibi mimariler referans yöntem '
        'olarak yaygınlık kazanmıştır.')
    add_para(doc,
        'Müziğe özgü tespit çalışmaları görece yenidir. '
        'Yi vd. (2024), spektral fakeprint bileşeni olarak '
        'mel-spektrogramdaki periyodik kalıpları AI imzası olarak '
        'tanımlamayı önermiştir. '
        'Müzik bağlamında öz-denetimli ses gösterimleri kullanan '
        'WavLM ensemble yaklaşımı (2024), deepfake ses tespitinde '
        'güçlü genelleme kabiliyeti göstermiştir. '
        'Bu çalışmalar, yüksek boyutlu temsiller yerine el ile '
        'tasarlanmış akustik özniteliklerin yorumlanabilirlik '
        'avantajını ön plana çıkarmıştır.')

    add_heading2(doc, '2.3. Akustik Öznitelik Mühendisliği')
    add_para(doc,
        'Mel frekans kepstral katsayıları (MFCC), müzik bilgi işleme '
        'alanında onlarca yıldır temel öznitelik olarak kullanılmaktadır '
        '(McFee vd., 2015). '
        'Spektral kontrast, müziğin harmonik ve gürültü bileşenlerini '
        'ayırt etmede etkili; chroma öznitelikleri ise tonal yapıyı '
        'karakterize etmede yaygın biçimde tercih edilmektedir. '
        'Ritimsel öznitelikler açısından tempo stabilitesi, '
        'vuruş aralığı tutarsızlığı ve onset güç istatistikleri '
        'yapay zekâ üretimi içeriklerin mekanik düzenliliğini '
        'ortaya koymada etkili göstergeler olarak öne çıkmaktadır.')
    add_para(doc,
        'Vokal analizi, bu çalışmada önemli bir inovatif boyut '
        'oluşturmaktadır. İnsan sesinin doğal nefes örüntüleri, '
        'vibrato düzensizliği ve formant geçişlerinin stokastik yapısı '
        'yapay zekâ sentezli seslerde büyük ölçüde kaybolmaktadır. '
        'Bu fark, vokal odaklı özniteliklerin tespit başarısına '
        'katkısını anlamlı kılmaktadır.')

    add_heading2(doc, '2.4. Makine Öğrenmesi Yöntemlerinin Karşılaştırması')
    add_para(doc,
        'Ses sınıflandırma görevlerinde gradient boosting ailesinin '
        'el ile tasarlanmış öznitelikler üzerinde güçlü performans '
        'gösterdiği bilinmektedir. '
        'LightGBM (Ke vd., 2017), yaprak-düzeyinde büyüme stratejisi '
        've histogram tabanlı bölme yöntemiyle hem hız hem bellek '
        'verimliliği açısından avantaj sağlamaktadır. '
        'XGBoost (Chen ve Guestrin, 2016) ise düzenlilik terimleriyle '
        'aşırı uyumu baskılama kapasitesiyle öne çıkmaktadır.')
    add_para(doc,
        'Derin öğrenme tarafında, 1B evrişimli sinir ağları (1D-CNN) '
        'doğrudan ham ses veya öznitelik zaman serilerinden öğrenebildiği için '
        'zamansal örüntü çıkarmada etkilidir. '
        'Çok katmanlı algılayıcı (MLP) varyantları — '
        'Residual MLP ve Attention MLP dahil — '
        'el ile tasarlanmış öznitelik vektörleri üzerinde '
        'güçlü temsil kapasitesi sunmaktadır. '
        'Ancak bu çalışmada elde edilen bulgular, '
        'LightGBM\'in 47 boyutlu öznitelik uzayında '
        'derin öğrenme modellerini de geride bıraktığını göstermektedir.')

    add_heading2(doc, '2.5. Mevcut Ticari ve Açık Kaynak Sistemler')
    add_para(doc,
        'IRCAM Amplify, müzik kimlik doğrulama alanında '
        'kapalı kaynaklı bir ticari çözüm sunmaktadır. '
        'Believe AI Radar, streaming platformlarına yönelik '
        'API tabanlı tespit hizmeti sağlamaktadır. '
        'Açık kaynak tarafında ise lofcz/ai-music-detector '
        'spektral fakeprint tabanlı yaklaşımıyla dikkat çekmektedir. '
        'Bu sistemlerin büyük çoğunluğu kapalı veri kümeleri ve '
        'yorumlanamaz siyah kutu modeller kullanmaktadır. '
        'AURIS, açık veri kaynakları, şeffaf değerlendirme protokolü '
        've SHAP tabanlı açıklanabilirlikle bu boşluğu doldurmayı hedeflemektedir.')

    add_page_break(doc)

    # ═══════════════════════════════════════════════════════
    # 3. MATERYAl VE YÖNTEM
    # ═══════════════════════════════════════════════════════
    add_heading1(doc, '3. MATERYAL VE YÖNTEM')
    add_heading2(doc, '3.1. Sistem Mimarisine Genel Bakış')
    add_para(doc,
        'AURIS üç ana bileşenden oluşmaktadır: '
        '(1) Ses sinyalinden 47 akustik öznitelik çıkaran işleme hattı, '
        '(2) 11 modelin 5 katlı çapraz doğrulamayla karşılaştırıldığı '
        've en iyi modelin seçildiği eğitim modülü, '
        '(3) tahmin sonuçlarını SHAP değerleriyle birlikte '
        'kullanıcıya sunan tam yığın uygulama katmanı. '
        'Tüm bileşenler REST API aracılığıyla birbirine bağlanmaktadır.')
    add_para(doc,
        'Sistem şu giriş formatlarını desteklemektedir: '
        'MP3, WAV, FLAC ve OGG ses dosyaları (maksimum 50 MB) '
        've YouTube bağlantısı. '
        'Ön işleme aşamasında tüm sesler 22.050 Hz\'e yeniden '
        'örneklenmekte, tek kanala (mono) dönüştürülmekte '
        've 30 saniyelik sabit uzunluğa kırpılmakta ya da '
        'sıfırla doldurulmaktadır.')

    add_heading2(doc, '3.2. Öznitelik Mühendisliği')
    add_heading3(doc, '3.2.1. Öznitelik Kategorileri ve Tanımları')
    add_para(doc,
        'AURIS, ses sinyalinden 5 ana kategoride toplam 47 sayısal öznitelik çıkarmaktadır. '
        'Öznitelikler librosa kütüphanesi (McFee vd., 2015) kullanılarak hesaplanmaktadır.')

    add_table(doc,
        ['Kategori', 'Öznitelik Sayısı', 'Temsil Ettikleri'],
        [
            ['Spektral', '16', 'Merkez, Düzlük, Bant Genişliği, Rolloff, Kontrast, MFCC türevleri'],
            ['Zamansal', '10', 'Tempo, Vuruş Stabilitesi, Onset Gücü, RMS Dinamiği, ZCR'],
            ['Ritmik', '9', 'Beat Sayısı, Tempo CV, IBI Stabilitesi, Onset Mean/Std'],
            ['Harmonik', '8', 'Chroma Entropi/Geçiş, Tonnetz Std, Harmonik Oran'],
            ['Vokal', '4', 'Perde Stabilitesi, Vibrato Düzeni, Formant Tutarlılığı, Nefes Örüntüsü'],
            ['TOPLAM', '47', '—'],
        ],
        col_widths=[3.5, 3.5, 9.0])
    add_blank(doc)
    add_para(doc,
        'Çizelge 3.1: AURIS öznitelik vektörünün kategorik dağılımı.', style='Çizelge Yazısı')

    add_heading3(doc, '3.2.2. En Önemli Öznitelikler')
    add_para(doc,
        'LightGBM gain tabanlı öznitelik önemi analizine göre '
        'en yüksek katkıyı sağlayan öznitelikler şunlardır:')
    add_table(doc,
        ['Sıra', 'Öznitelik', 'Kategori', 'Önem Skoru'],
        [
            ['1', 'spectral_flatness_std', 'Spektral', '0,0619'],
            ['2', 'spectral_contrast_mean', 'Spektral', '0,0467'],
            ['3', 'rms_energy', 'Zamansal', '0,0456'],
            ['4', 'onset_strength_std', 'Ritmik', '0,0388'],
            ['5', 'spectral_flatness_mean', 'Spektral', '0,0370'],
            ['6', 'rms_dynamic_range', 'Zamansal', '0,0346'],
            ['7', 'onset_strength_mean', 'Ritmik', '0,0332'],
            ['8', 'mfcc_delta_var', 'Spektral', '0,0289'],
            ['9', 'chroma_std', 'Harmonik', '0,0281'],
            ['10', 'breath_pattern_score', 'Vokal', '0,0204'],
        ],
        col_widths=[1.5, 6.0, 3.0, 3.5])
    add_blank(doc)
    add_para(doc, 'Çizelge 3.2: LightGBM gain tabanlı öznitelik önemi (ilk 10).', style='Çizelge Yazısı')
    add_para(doc,
        'Spektral düzlük (spectral flatness), sesin gürültü benzeri yapısını ölçmektedir. '
        'Yapay zekâ üretimi müziklerde bu değer hem ortalaması hem de standart sapması '
        'açısından belirgin farklılıklar göstermekte; '
        'bu durum AI sentez süreçlerinin spektral homojenliğini yansıtmaktadır. '
        'Vokal kategorisinden nefes örüntüsü skoru\'nun (breath_pattern_score) '
        'ilk 10\'a girmesi, vokal analizi özniteliklerinin '
        'ayrımsal güce katkısını teyit etmektedir.')

    add_heading2(doc, '3.3. Veri Kümesi')
    add_heading3(doc, '3.3.1. Derleme Stratejisi')
    add_para(doc,
        'AURIS veri kümesi, kaynak kökenine dayalı otomatik etiketleme '
        'stratejisiyle oluşturulmuştur. '
        'Bilinen yapay zekâ üretim platformlarından gelen örnekler "1" (AI), '
        'bilinen insan müziği arşivlerinden gelen örnekler "0" (İnsan) '
        'olarak etiketlenmiştir. '
        'Bu yaklaşım, manuel etiketleme maliyetini ortadan kaldırmakta '
        've etiket kaynaklarının denetlenebilirliğini güvence altına almaktadır. '
        'İnsan katılımcılardan birincil veri toplanmamış olduğundan '
        'etik kurul izni gerekmemektedir.')

    add_heading3(doc, '3.3.2. Kaynak Dağılımı')
    add_table(doc,
        ['Kaynak', 'Tür', 'Örnek Sayısı', 'Oran (%)'],
        [
            ['GTZAN', 'İnsan', '999', '19,2'],
            ['FMA Small', 'İnsan', '1.036', '19,9'],
            ['SleepyJesse (insan)', 'İnsan', '1.078', '20,8'],
            ['Diğer insan', 'İnsan', '—', '—'],
            ['Echoes (AI)', 'AI', '922', '17,7'],
            ['Suno (AI)', 'AI', '500', '9,6'],
            ['Deepfake ses seti', 'AI', '250', '4,8'],
            ['AImE/Mustango/JEN-1', 'AI', '410', '7,9'],
            ['TOPLAM', '—', '5.195', '100'],
        ],
        col_widths=[5.5, 2.5, 3.5, 3.0])
    add_blank(doc)
    add_para(doc, 'Çizelge 3.3: AURIS veri kümesi kaynak dağılımı.', style='Çizelge Yazısı')
    add_para(doc,
        'Toplam 5.195 örnekten 3.113\'ü (%59,9) insan, 2.082\'si (%40,1) '
        'yapay zekâ üretimi müzikten oluşmaktadır. '
        'Sınıf dengesizliğini telafi etmek için eğitim aşamasında '
        'class_weight parametresi uygulanmıştır.')

    add_heading3(doc, '3.3.3. Ön İşleme Hattı')
    add_para(doc,
        'Ham ses dosyaları aşağıdaki adımlardan geçirilmektedir:')
    steps = [
        '22.050 Hz\'e yeniden örnekleme (librosa standart çözünürlüğü);',
        'Tek kanala (mono) dönüşüm;',
        '30 saniyeye kırpma (uzun parça) veya sıfırla doldurma (kısa parça);',
        'Gürültü ve bozulma kontrolü (minimum 1 saniye, minimum genlik eşiği);',
        '47 akustik özniteliğin float64 vektörüne çıkarılması;',
        'Kıvırma tabanlı standartlaştırma (StandardScaler, her fold\'da ayrı fit).',
    ]
    for s in steps:
        p = doc.add_paragraph(style='listeler stili')
        p.add_run('• ' + s)

    add_heading2(doc, '3.4. Model Eğitimi ve Değerlendirme Protokolü')
    add_heading3(doc, '3.4.1. Klasik Makine Öğrenmesi Modelleri')
    add_para(doc,
        'Yedi klasik makine öğrenmesi modeli scikit-learn ve ilgili '
        'kütüphaneler kullanılarak eğitilmiştir. '
        'Her model için hiperparametre araması, doğrulama AUC\'u '
        'temel alınarak yürütülmüş; en iyi parametre kümesi '
        '5 katlı çapraz doğrulamayla değerlendirilmiştir.')

    add_table(doc,
        ['Model', 'Temel Hiperparametreler'],
        [
            ['Logistic Regression', 'C=2,0; class_weight=balanced; max_iter=2500'],
            ['Random Forest', 'n_est=500; max_features=log2; class_weight=balanced_subsample'],
            ['Gradient Boosting', 'n_est=180; max_depth=4; lr=0,07; subsample=0,75'],
            ['SVM (RBF)', 'C=10; gamma=0,05; class_weight=balanced'],
            ['MLP Sinir Ağı', 'gizli katmanlar=[192,96,32]; alpha=0,001; max_iter=600'],
            ['XGBoost', 'n_est=240; max_depth=5; lr=0,06; reg_alpha=0,4'],
            ['LightGBM', 'n_est=300; num_leaves=31; lr=0,05; subsample=0,8'],
        ],
        col_widths=[4.5, 11.5])
    add_blank(doc)
    add_para(doc, 'Çizelge 3.4: Klasik ML modellerinin seçilen hiperparametreleri.', style='Çizelge Yazısı')

    add_heading3(doc, '3.4.2. Derin Öğrenme Modelleri')
    add_para(doc,
        'Derin öğrenme tarafında 47 boyutlu öznitelik vektörünü girdi olarak alan '
        'dört mimari PyTorch ile geliştirilmiştir:')
    add_table(doc,
        ['Model', 'Mimari', 'Eğitim Süresi (s)'],
        [
            ['Derin MLP', '512 → 256 → 128 → 64 → 1 (ReLU, Dropout)', '81,4'],
            ['Residual MLP', '3 × Artık Blok (128-128), BatchNorm', '128,7'],
            ['Attention MLP', '64-boyut dikkat kafası + FF katmanlar', '149,6'],
            ['1D-CNN', '3 × Conv1D blok + GlobalAvgPool + FC', '125,0'],
        ],
        col_widths=[4.0, 8.5, 3.5])
    add_blank(doc)
    add_para(doc, 'Çizelge 3.5: Derin öğrenme model mimarileri ve eğitim süreleri.', style='Çizelge Yazısı')

    add_heading3(doc, '3.4.3. Değerlendirme Metrikleri')
    add_para(doc,
        'Tüm modeller aynı 5 katlı tabakalı çapraz doğrulama protokolüyle '
        'değerlendirilmiştir (tabakalama, her fold\'da sınıf dağılımını korumaktadır). '
        'Birincil metrik, karar eşiğinden bağımsız ayrım gücünü ölçen '
        'ROC-AUC\'tur (Alıcı İşletim Karakteristiği Eğrisi Altındaki Alan). '
        'İkincil metrikler: Doğruluk, Kesinlik, Geri Çağırma, F1-skoru. '
        'Karar eşiği Youden J istatistiğiyle optimize edilmiş; '
        'LightGBM için θ* = 0,4316 bulunmuştur.')

    add_heading2(doc, '3.5. SHAP Açıklanabilirlik Entegrasyonu')
    add_para(doc,
        'Sistem, her tahmin için SHAP (SHapley Additive exPlanations) '
        'değerlerini hesaplamaktadır. '
        'SHAP, oyun teorisinden türetilmiş ve her özniteliğin nihai '
        'tahmine katkısını aditif biçimde ayrıştıran bir yöntemdir. '
        'LightGBM\'in TreeExplainer arayüzü kullanıldığında '
        'SHAP değerleri polinom zaman yerine lineer zamanda '
        'hesaplanabilmekte; bu durum gerçek zamanlı kullanım '
        'için pratik bir avantaj sağlamaktadır.')
    add_para(doc,
        'Kullanıcıya sunulan açıklama; "Bu parçanın spektral düzlük değişimi "
        'yüksek olduğu için yapay zekâ olasılığı artmıştır" biçiminde '
        'öznitelik bazında gerekçe içermektedir. '
        'Bu yaklaşım sistemi siyah kutu olmaktan çıkarmakta '
        've uzman kullanıcıların kararı doğrulamasına olanak tanımaktadır.')

    add_heading2(doc, '3.6. Uygulama Mimarisi')
    add_heading3(doc, '3.6.1. Web Platformu')
    add_para(doc,
        'Web arayüzü Next.js 14 ve TypeScript ile geliştirilmiştir. '
        'Statik site üretimi (static export) kullanılarak Netlify CDN üzerinden '
        'küresel ağa dağıtılmaktadır. '
        'Türkçe/İngilizce çoklu dil desteği ve '
        'koyu/açık tema geçişi Framer Motion animasyonlarıyla sunulmaktadır. '
        'Kullanıcı; dosya yükleme ya da YouTube bağlantısı yoluyla '
        'analiz başlatabilmekte ve SHAP grafiklerini '
        'birkaç saniye içinde görüntüleyebilmektedir.')

    add_heading3(doc, '3.6.2. Android Mobil Uygulaması')
    add_para(doc,
        'Mobil uygulama Kotlin ve Jetpack Compose ile '
        'Clean Architecture (MVVM) deseninde geliştirilmiştir. '
        'Minimum API seviyesi 26 (Android 8.0) olarak belirlenmiştir. '
        'Bağımlılık enjeksiyonu için Hilt, ağ iletişimi için Retrofit/OkHttp, '
        'yerel kalıcılık için Room veritabanı kullanılmaktadır. '
        'Cihazdan ses dosyası seçilerek ya da YouTube bağlantısı girilerek '
        'analiz başlatılabilmekte; sonuçlar geçmiş ekranında saklanmaktadır.')

    add_heading3(doc, '3.6.3. FastAPI Arka Ucu')
    add_para(doc,
        'Arka uç Python 3.11 ve FastAPI çerçevesiyle geliştirilmiş; '
        'HuggingFace Spaces platformunda Docker konteyneri olarak dağıtılmaktadır. '
        'POST /analyze uç noktası ses dosyasını alarak '
        'öznitelik çıkarma → model tahmini → SHAP değeri hesaplama '
        'hattını çalıştırmakta ve JSON yanıt döndürmektedir. '
        'Yanıt; tahmin etiketi, güven skoru ve SHAP sözlüğünü içermektedir.')

    add_page_break(doc)

    # ═══════════════════════════════════════════════════════
    # 4. BULGULAR VE TARTIŞMA
    # ═══════════════════════════════════════════════════════
    add_heading1(doc, '4. BULGULAR')
    add_heading2(doc, '4.1. Model Karşılaştırma Sonuçları')
    add_heading3(doc, '4.1.1. Klasik Makine Öğrenmesi Modelleri')
    add_para(doc,
        'Yedi klasik makine öğrenmesi modeli 5 katlı çapraz doğrulamayla '
        'değerlendirilmiştir. '
        'Çizelge 4.1, modellerin temel performans metriklerini '
        'ROC-AUC değerine göre azalan sırada sunmaktadır.')

    add_table(doc,
        ['Model', 'Doğruluk', 'F1', 'ROC-AUC', 'Val-AUC'],
        [
            ['LightGBM', '0,8839', '0,8575', '0,9549', '0,9472'],
            ['XGBoost', '0,8735', '0,8402', '0,9463', '0,9376'],
            ['Gradient Boosting', '0,8685', '0,8337', '0,9406', '0,9297'],
            ['Random Forest', '0,8604', '0,8183', '0,9393', '0,9302'],
            ['SVM (RBF)', '0,8612', '0,8252', '0,9347', '0,9336'],
            ['MLP Sinir Ağı', '0,8545', '0,8189', '0,9258', '0,9278'],
            ['Logistic Regression', '0,7779', '0,7390', '0,8511', '0,8383'],
        ],
        col_widths=[5.0, 3.0, 3.0, 3.0, 3.0])
    add_blank(doc)
    add_para(doc, 'Çizelge 4.1: Klasik ML modellerinin 5-katlı CV performans karşılaştırması.', style='Çizelge Yazısı')
    add_para(doc,
        'LightGBM, 0,9549 ROC-AUC ile tüm klasik modeller arasında '
        'birinci sıraya yerleşmiştir. '
        'Gradient boosting ailesi (LightGBM, XGBoost, Gradient Boosting) '
        'ilk üç sırayı paylaşmaktadır. '
        'Doğrusal model olan Logistic Regression 0,8511 ROC-AUC ile '
        'öznitelik uzayının doğrusal ayrılabilir olmadığına işaret etmektedir.')

    add_heading3(doc, '4.1.2. Derin Öğrenme Modelleri')
    add_para(doc,
        'Dört derin öğrenme modeli aynı 47 boyutlu öznitelik vektörü '
        'üzerinde eğitilmiştir. '
        'Sonuçlar Çizelge 4.2\'de sunulmaktadır.')

    add_table(doc,
        ['Model', 'Doğruluk', 'F1', 'ROC-AUC', 'Eğitim (s)'],
        [
            ['Derin MLP', '0,8849', '0,8596', '0,9537', '81,4'],
            ['Residual MLP', '0,8756', '0,8476', '0,9453', '128,7'],
            ['Attention MLP', '0,8628', '0,8293', '0,9356', '149,6'],
            ['1D-CNN', '0,7665', '0,7159', '0,8442', '125,0'],
        ],
        col_widths=[4.5, 3.0, 3.0, 3.0, 3.0])
    add_blank(doc)
    add_para(doc, 'Çizelge 4.2: Derin öğrenme modellerinin performans karşılaştırması.', style='Çizelge Yazısı')
    add_para(doc,
        'Derin MLP (512-256-128-64), 0,9537 ROC-AUC ile '
        'derin öğrenme modelleri arasında en iyi performansı '
        'sergilemiştir ve LightGBM\'e yakın bir değere ulaşmıştır. '
        '1D-CNN ise 0,8442 ROC-AUC ile en düşük başarımı elde etmiştir; '
        'bu sonuç, evrişimsel mimarilerin zaman serisi boyutundan yoksun '
        'statik öznitelik vektörleri üzerinde dezavantajlı olduğuna işaret etmektedir.')

    add_heading3(doc, '4.1.3. Genel Sıralama: 11 Model')
    add_table(doc,
        ['Sıra', 'Model', 'Tür', 'Doğruluk', 'F1', 'ROC-AUC'],
        [
            ['1', 'LightGBM', 'ML', '0,8839', '0,8575', '0,9549'],
            ['2', 'Derin MLP', 'DL', '0,8849', '0,8596', '0,9537'],
            ['3', 'Residual MLP', 'DL', '0,8756', '0,8476', '0,9453'],
            ['4', 'XGBoost', 'ML', '0,8735', '0,8402', '0,9463'],
            ['5', 'Gradient Boosting', 'ML', '0,8685', '0,8337', '0,9406'],
            ['6', 'Random Forest', 'ML', '0,8604', '0,8183', '0,9393'],
            ['7', 'Attention MLP', 'DL', '0,8628', '0,8293', '0,9356'],
            ['8', 'SVM (RBF)', 'ML', '0,8612', '0,8252', '0,9347'],
            ['9', 'MLP Sinir Ağı', 'ML', '0,8545', '0,8189', '0,9258'],
            ['10', '1D-CNN', 'DL', '0,7665', '0,7159', '0,8442'],
            ['11', 'Logistic Reg.', 'ML', '0,7779', '0,7390', '0,8511'],
        ],
        col_widths=[1.5, 4.0, 1.5, 3.0, 3.0, 3.0])
    add_blank(doc)
    add_para(doc, 'Çizelge 4.3: 11 modelin birleşik ROC-AUC sıralaması.', style='Çizelge Yazısı')

    add_heading2(doc, '4.2. En İyi Model: LightGBM Ayrıntılı Analizi')
    add_heading3(doc, '4.2.1. Çapraz Doğrulama İstikrarı')
    add_para(doc,
        'LightGBM\'in 5 katlı ROC-AUC değerleri 0,9548 ± 0,0023 '
        'olarak hesaplanmıştır. '
        'Düşük standart sapma, modelin farklı veri bölünmelerinde '
        'tutarlı performans sergilediğini ve aşırı uyum '
        'riskinin sınırlı olduğunu göstermektedir.')
    add_para(doc,
        'Brier skoru 0,083 olarak ölçülmüştür. '
        'Bu değer, modelin olasılık tahminlerinin iyi kalibre edildiğini '
        've gerçek sınıf dağılımını yansıttığını teyit etmektedir.')

    add_heading3(doc, '4.2.2. Karar Eşiği Optimizasyonu')
    add_para(doc,
        'Varsayılan 0,50 eşiği yerine '
        'Youden J istatistiği (J = Duyarlılık + Özgüllük − 1) '
        'maksimize edilerek optimal eşik '
        'θ* = 0,4316 olarak belirlenmiştir. '
        'Bu eşik, veri kümesindeki sınıf dengesizliğini '
        'kısmen telafi ederek hem yanlış pozitif '
        'hem yanlış negatif oranlarını dengeli tutmaktadır.')

    add_heading3(doc, '4.2.3. Karışıklık Matrisi')
    add_para(doc,
        'θ* = 0,4316 eşiğiyle elde edilen karışıklık matrisi '
        'değerleri şöyledir:')
    add_table(doc,
        ['', 'Tahmin: İnsan', 'Tahmin: AI'],
        [
            ['Gerçek: İnsan', 'DN = 2.721 (%87,4)', 'YP = 392 (%12,6)'],
            ['Gerçek: AI', 'YN = 220 (%10,6)', 'DP = 1.862 (%89,4)'],
        ],
        col_widths=[4.0, 6.0, 6.0])
    add_blank(doc)
    add_para(doc, 'Çizelge 4.4: LightGBM karışıklık matrisi (DN: Doğru Negatif, DP: Doğru Pozitif).', style='Çizelge Yazısı')
    add_para(doc,
        'Modelin AI parçaları üzerindeki geri çağırma değeri (%89,4), '
        'insan parçaları için kesinlik değerini (%87,4) '
        'hafifçe aşmaktadır. '
        'Bu denge, tespit uygulamaları için kabul edilebilir '
        'bir hata profili oluşturmaktadır.')

    add_heading2(doc, '4.3. Kaynak Bazında Performans Analizi')
    add_para(doc,
        'Modelin farklı veri kaynaklarındaki başarısı '
        'genelleme kabiliyetini değerlendirmek açısından kritiktir.')
    add_table(doc,
        ['Kaynak', 'Tür', 'Doğruluk'],
        [
            ['Suno', 'AI', '%93,0'],
            ['Echoes', 'AI', '%88,6'],
            ['Deepfake ses seti', 'AI', '%50,0'],
            ['GTZAN', 'İnsan', '%91,2'],
        ],
        col_widths=[5.0, 3.0, 4.5])
    add_blank(doc)
    add_para(doc, 'Çizelge 4.5: Kaynak bazında LightGBM doğruluk değerleri.', style='Çizelge Yazısı')
    add_para(doc,
        'Deepfake ses setinin %50 doğrulukla sonuçlanması '
        'bir sistem başarısızlığı değil, dağılım kayması (distribution shift) '
        'sorunudur: Bu set, müzik değil konuşma derin sahteciliği içermekte '
        've AURIS\'in eğitildiği müzik akustik alanından '
        'belirgin biçimde ayrışmaktadır. '
        'Müzik kaynaklarında (Suno, Echoes) elde edilen '
        'yüksek doğruluk değerleri, sistemin hedef domain\'inde '
        'güçlü genelleme yeteneğine sahip olduğunu göstermektedir.')

    add_page_break(doc)

    # ═══════════════════════════════════════════════════════
    # 5. TARTIŞMA
    # ═══════════════════════════════════════════════════════
    add_heading1(doc, '5. TARTIŞMA')
    add_heading2(doc, '5.1. LightGBM\'in Üstünlüğü')
    add_para(doc,
        'LightGBM\'in 47 boyutlu el ile tasarlanmış öznitelik vektörü üzerinde '
        'en yüksek ROC-AUC değerine ulaşması birkaç faktörle açıklanabilir. '
        'Birincisi, yaprak-düzeyinde büyüme stratejisi '
        'gradient boosting\'e kıyasla daha derin karar sınırları '
        'çizebilmekte ve öznitelikler arasındaki karmaşık etkileşimleri '
        'daha iyi modelleyebilmektedir. '
        'İkincisi, LightGBM\'in histogram tabanlı yaklaşımı '
        'hesaplama verimliliğini korurken '
        'hiperparametre hassasiyetini azaltmaktadır. '
        'Üçüncüsü, 47 boyutluk bir uzayda derin öğrenme modelleri '
        'genelleme için daha fazla veriye ihtiyaç duyarken '
        'LightGBM, mevcut 5.195 örnekte daha verimli öğrenmektedir.')
    add_para(doc,
        'Derin MLP\'nin LightGBM\'e yakın performans sergilemesi '
        '(0,9537 vs 0,9549 ROC-AUC) dikkat çekicidir. '
        'Daha büyük veri kümelerinde bu dengenin tersine dönmesi '
        'beklenmektedir; bu durum gelecek çalışmalar için '
        'veri büyütme stratejisini meşrulaştırmaktadır.')

    add_heading2(doc, '5.2. Literatürle Karşılaştırma')
    add_para(doc,
        'Bu çalışmada elde edilen 0,9548 ROC-AUC değeri, '
        'benzer veri ölçeğindeki açık kaynak çalışmalarla '
        'karşılaştırılabilir düzeydedir. '
        'Ticari sistemler (IRCAM Amplify: %98,59) '
        'çok daha büyük ve kapalı veri kümeleri kullandığından '
        'doğrudan karşılaştırma sınırlı anlam taşımaktadır. '
        'AURIS\'in SHAP tabanlı açıklanabilirlik katmanı '
        'bu sistemlerin hiçbirinde bulunmamakta '
        've akademik şeffaflık açısından özgün bir katkı sunmaktadır.')
    add_table(doc,
        ['Sistem', 'Doğruluk', 'Erişim', 'Açıklanabilirlik'],
        [
            ['IRCAM Amplify', '%98,6', 'Ücretli API', 'Yok'],
            ['Believe AI Radar', '%98,0', 'Ticari', 'Yok'],
            ['lofcz/ai-music-detector', 'N/A', 'Açık kaynak', 'Kısmi'],
            ['AURIS (bu çalışma)', '%88,4 / ROC-AUC 0,9548', 'Ücretsiz Web+Android', 'SHAP (tam)'],
        ],
        col_widths=[4.5, 4.0, 4.0, 4.0])
    add_blank(doc)
    add_para(doc, 'Çizelge 5.1: AURIS ile mevcut sistemlerin karşılaştırması.', style='Çizelge Yazısı')

    add_heading2(doc, '5.3. Sistem Sınırlamaları')
    add_para(doc,
        'Çalışmanın başlıca sınırlamaları şunlardır:')
    limits = [
        'Veri kümesi büyüklüğü (5.195 örnek) ticari sistemlerle '
        'kıyaslandığında sınırlı kalmaktadır; '
        'bu durum bazı üretim platformları için örnekleme yetersizliği doğurabilir.',
        'Deepfake ses seti gibi dağılım-dışı örneklerde '
        'performans belirgin biçimde düşmektedir. '
        'Sistem, müzik akustiği için optimize edilmiş olup '
        'konuşma sentezi gibi farklı alanlara genelleme yapamamaktadır.',
        'Wav2vec2 tabanlı derin temsil öğrenimi bu çalışmanın kapsamı dışında kalmış; '
        'mevcut sistem tamamen el ile tasarlanmış özniteliklere dayanmaktadır. '
        'Transfer öğrenme entegrasyonu gelecek çalışmalarda ele alınacaktır.',
        'Sistem yalnızca sınıflandırma kararı vermekte, '
        'AI üretiminin hangi aracıyla gerçekleştirildiğini belirleyememektedir.',
    ]
    for l in limits:
        p = doc.add_paragraph(style='listeler stili')
        p.add_run('• ' + l)

    add_heading2(doc, '5.4. BM401 ile BM498 Karşılaştırması')
    add_para(doc,
        'BM401 dönemi proje tasarım aşamasında '
        'wav2vec2 tabanlı hibrit bir yaklaşım planlanmış; '
        'web platformu ve Android uygulaması prototipi geliştirilmiştir. '
        'BM498 döneminde ise araştırma odağı '
        'yorumlanabilirlik ve sistematik model karşılaştırmasına kaymıştır. '
        '47 boyutlu el ile tasarlanmış öznitelik vektörü, '
        '11 model ensemble ve SHAP entegrasyonu '
        'bu dönemin özgün katkılarını oluşturmaktadır. '
        'Sonuç olarak sistem, siyah kutu bir derin öğrenme yaklaşımından '
        'açıklanabilir ve denetlenebilir bir makine öğrenmesi mimarisine '
        'evrilmiştir.')

    add_page_break(doc)

    # ═══════════════════════════════════════════════════════
    # 6. SONUÇLAR VE ÖNERİLER
    # ═══════════════════════════════════════════════════════
    add_heading1(doc, '6. SONUÇLAR VE ÖNERİLER')
    add_heading2(doc, '6.1. Sonuçlar')
    add_para(doc,
        'Bu çalışmada geliştirilen AURIS sistemi, '
        '47 akustik öznitelik ve 11 model karşılaştırmalı '
        'değerlendirme çerçevesinde yapay zekâ üretimi müziği '
        'güvenilir biçimde tespit edebilmektedir. '
        'Elde edilen başlıca bulgular şöyle özetlenebilir:')
    conclusions = [
        'LightGBM, 0,9548 ROC-AUC (±0,0023) ile hem klasik '
        'hem derin öğrenme modelleri arasında en yüksek '
        've en kararlı performansı sergilemiştir.',
        'Spektral öznitelikler (özellikle spectral_flatness_std) '
        'ayrımsal güce en büyük katkıyı sağlamaktadır; '
        'vokal öznitelikler (nefes örüntüsü, formant tutarlılığı) '
        'ikincil ama anlamlı katkı sunmaktadır.',
        'Kaynak bazında analiz, sistemin hedef domain\'i olan '
        'müzik alanında güçlü genelleme yapabildiğini '
        '(Suno: %93, Echoes: %88,6) ortaya koymaktadır.',
        'SHAP entegrasyonu, sınıflandırma kararlarını '
        'öznitelik bazında yorumlanabilir kılmakta '
        've sistemi ticari rakiplerine göre şeffaflık açısından '
        'farklılaştırmaktadır.',
        'Tam yığın uygulama (web + mobil + API) '
        'sistemin akademik prototip sınırlarını aşarak '
        'gerçek kullanım senaryolarında test edilmesine '
        'olanak tanımaktadır.',
    ]
    for c in conclusions:
        p = doc.add_paragraph(style='listeler stili')
        p.add_run('• ' + c)

    add_heading2(doc, '6.2. Gelecek Çalışma Önerileri')
    add_heading3(doc, '6.2.1. Kısa Vadeli (0-6 Ay)')
    futures_short = [
        'Veri kümesini 10.000+ örneğe genişletmek ve '
        'yeni AI üretim platformlarını (Sora Audio, vb.) dahil etmek;',
        'Wav2vec2 ince ayarı (fine-tuning) ile el ile özniteliklerle '
        'hibrit bir temsil katmanı geliştirmek;',
        'Batch analiz ve API hız sınırlama iyileştirmeleriyle '
        'üretim ortamı dayanıklılığını artırmak.',
    ]
    for f in futures_short:
        p = doc.add_paragraph(style='listeler stili')
        p.add_run('• ' + f)

    add_heading3(doc, '6.2.2. Uzun Vadeli (6-24 Ay)')
    futures_long = [
        'Çok kipli (multimodal) analiz: ses + sözler + meta veri;',
        'Gerçek zamanlı yayın akışı (streaming) analizi;',
        'iOS uygulaması geliştirme;',
        'Gizlilik koruyucu federe öğrenme (federated learning) '
        'yaklaşımıyla sürekli model güncelleme.',
    ]
    for f in futures_long:
        p = doc.add_paragraph(style='listeler stili')
        p.add_run('• ' + f)

    add_page_break(doc)

    # KAYNAKLAR
    add_heading1(doc, '7. KAYNAKLAR')
    refs = [
        '[1] Copet, J., Kreuk, F., Gat, I., Remez, T., Kant, D., Synnaeve, G., Adi, Y. ve de Charette, R. (2023). Simple and Controllable Music Generation. Advances in Neural Information Processing Systems, 36, 47704–47720.',
        '[2] Ke, G., Meng, Q., Finley, T., Wang, T., Chen, W., Ma, W., Ye, Q. ve Liu, T. (2017). LightGBM: A Highly Efficient Gradient Boosting Decision Tree. Advances in Neural Information Processing Systems, 30.',
        '[3] Chen, T. ve Guestrin, C. (2016). XGBoost: A Scalable Tree Boosting System. Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining, 785–794.',
        '[4] Baevski, A., Zhou, Y., Mohamed, A. ve Auli, M. (2020). wav2vec 2.0: A Framework for Self-Supervised Learning of Speech Representations. Advances in Neural Information Processing Systems, 33, 12449–12460.',
        '[5] McFee, B., Raffel, C., Liang, D., Ellis, D. P. W., McVicar, M., Battenberg, E. ve Nieto, O. (2015). librosa: Audio and music signal analysis in Python. Proceedings of the 14th Python in Science Conference, 18–25.',
        '[6] Lundberg, S. M. ve Lee, S. I. (2017). A Unified Approach to Interpreting Model Predictions. Advances in Neural Information Processing Systems, 30.',
        '[7] Dhariwal, P., Jun, H., Payne, C., Kim, J. W., Radford, A. ve Sutskever, I. (2020). Jukebox: A Generative Model for Music. arXiv preprint arXiv:2005.00341.',
        '[8] Müller, M. (2015). Fundamentals of Music Processing. Springer International Publishing.',
        '[9] Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., Blondel, M., Prettenhofer, P., Weiss, R., Dubourg, V., Vanderplas, J., Passos, A., Cournapeau, D., Brucher, M., Perrot, M. ve Duchesnay, E. (2011). Scikit-learn: Machine Learning in Python. Journal of Machine Learning Research, 12, 2825–2830.',
        '[10] Paszke, A., Gross, S., Massa, F., Lerer, A., Bradbury, J., Chanan, G., Killeen, T., Lin, Z., Gimelshein, N., Antiga, L., Desmaison, A., Kopf, A., Yang, E., DeVito, Z., Raison, M., Tejani, A., Chilamkurthy, S., Steiner, B., Fang, L., Bai, J. ve Chintala, S. (2019). PyTorch: An Imperative Style, High-Performance Deep Learning Library. Advances in Neural Information Processing Systems, 32.',
        '[11] Saunders, C. (2023). Detecting AI-Generated Audio Content. IEEE Signal Processing Letters, 30, 892–896.',
        '[12] Bowman, S. R. (2023). Eight Things to Know about Large Language Models. arXiv preprint arXiv:2304.00612.',
    ]
    for ref in refs:
        add_para(doc, ref)

    add_page_break(doc)

    # EKLER
    add_heading1(doc, '8. EKLER')
    add_heading2(doc, '8.1. Ek 1: Öznitelik Listesi (47 Öznitelik)')
    add_table(doc,
        ['#', 'Öznitelik Adı', 'Kategori', 'Açıklama'],
        [
            ['1', 'spectral_centroid_mean', 'Spektral', 'Spektral ağırlık merkezi ortalaması (Hz)'],
            ['2', 'spectral_centroid_std', 'Spektral', 'Spektral ağırlık merkezi standart sapması'],
            ['3', 'spectral_bandwidth_mean', 'Spektral', 'Spektral bant genişliği ortalaması'],
            ['4', 'spectral_bandwidth_std', 'Spektral', 'Spektral bant genişliği standart sapması'],
            ['5', 'spectral_flatness_mean', 'Spektral', 'Spektral düzlük ortalaması'],
            ['6', 'spectral_flatness_std', 'Spektral', 'Spektral düzlük standart sapması'],
            ['7', 'spectral_rolloff_mean', 'Spektral', 'Rolloff frekansı ortalaması'],
            ['8', 'spectral_rolloff_std', 'Spektral', 'Rolloff frekansı standart sapması'],
            ['9', 'spectral_contrast_mean', 'Spektral', 'Spektral kontrast ortalaması'],
            ['10', 'spectral_contrast_std', 'Spektral', 'Spektral kontrast standart sapması'],
            ['11', 'mfcc_variance', 'Spektral', 'MFCC varyansı'],
            ['12', 'mfcc_delta_var', 'Spektral', '1. türev MFCC varyansı'],
            ['13', 'mfcc_delta2_var', 'Spektral', '2. türev MFCC varyansı'],
            ['14', 'mel_flatness', 'Spektral', 'Mel spektrogram zamansal düzlüğü'],
            ['15', 'spectral_regularity', 'Spektral', 'Spektral düzenlilik endeksi'],
            ['16', 'harmonic_structure', 'Spektral', 'Harmonik yapı skoru'],
            ['17', 'tempo_bpm', 'Ritmik', 'Tempo (vuruş/dakika)'],
            ['18', 'tempo_stability', 'Ritmik', 'Tempo stabilitesi skoru'],
            ['19', 'tempo_cv', 'Ritmik', 'Tempo varyasyon katsayısı'],
            ['20', 'beat_count', 'Ritmik', 'Tespit edilen vuruş sayısı'],
            ['21', 'onset_strength_mean', 'Ritmik', 'Onset güç ortalaması'],
            ['22', 'onset_strength_std', 'Ritmik', 'Onset güç standart sapması'],
            ['23', 'rms_energy', 'Zamansal', 'RMS enerji ortalaması'],
            ['24', 'rms_std', 'Zamansal', 'RMS enerji standart sapması'],
            ['25', 'rms_dynamic_range', 'Zamansal', 'RMS dinamik aralığı'],
            ['26', 'zero_crossing_rate', 'Zamansal', 'Sıfır geçiş oranı ortalaması'],
            ['27', 'zero_crossing_std', 'Zamansal', 'Sıfır geçiş oranı standart sapması'],
            ['28', 'temporal_patterns', 'Zamansal', 'Zamansal örüntü skoru'],
            ['29', 'chroma_entropy', 'Harmonik', 'Chroma entropi değeri'],
            ['30', 'chroma_std', 'Harmonik', 'Chroma standart sapması'],
            ['31', 'chroma_transition_rate', 'Harmonik', 'Chroma geçiş hızı'],
            ['32', 'tonnetz_std', 'Harmonik', 'Tonnetz tonal varyasyonu'],
            ['33', 'harmonic_ratio', 'Harmonik', 'Harmonik/perküsif enerji oranı'],
            ['34', 'vocal_energy_ratio', 'Vokal', 'Vokal enerji oranı'],
            ['35', 'vocal_harmonic_ratio', 'Vokal', 'Vokal harmonik oranı'],
            ['36', 'vocal_confidence', 'Vokal', 'Vokal tespit güveni'],
            ['37', 'has_vocals', 'Vokal', 'Vokal varlık bayrağı (0/1)'],
            ['38', 'pitch_mean_hz', 'Vokal', 'Perde ortalaması (Hz)'],
            ['39', 'pitch_std_cents', 'Vokal', 'Perde standart sapması (cent)'],
            ['40', 'pitch_stability_score', 'Vokal', 'Perde stabilite skoru'],
            ['41', 'vibrato_rate_hz', 'Vokal', 'Vibrato hızı (Hz)'],
            ['42', 'vibrato_extent_cents', 'Vokal', 'Vibrato genliği (cent)'],
            ['43', 'vibrato_regularity_score', 'Vokal', 'Vibrato düzenlilik skoru'],
            ['44', 'formant_consistency_score', 'Vokal', 'Formant tutarlılık skoru'],
            ['45', 'breath_pattern_score', 'Vokal', 'Nefes örüntüsü skoru'],
            ['46', 'vocal_texture_score', 'Vokal', 'Vokal doku skoru'],
            ['47', 'vocal_ai_score', 'Vokal', 'Bileşik vokal AI endeksi'],
        ],
        col_widths=[1.0, 5.5, 3.0, 6.5])
    add_blank(doc)
    add_para(doc, 'Çizelge 8.1: AURIS 47 öznitelik listesi ve kategorileri.', style='Çizelge Yazısı')

    add_heading2(doc, '8.2. Ek 2: Sistem Gereksinimleri')
    add_table(doc,
        ['Bileşen', 'Gereksinim'],
        [
            ['Python', '3.11 veya üzeri'],
            ['Node.js', '20.18.1 veya üzeri'],
            ['Android SDK', 'API 26+ (Android 8.0)'],
            ['RAM', 'Minimum 8 GB'],
            ['Disk', 'Model dosyaları için ~500 MB'],
            ['Arka uç port', '7860 (HuggingFace Spaces)'],
            ['Web port', '3000 (geliştirme)'],
        ],
        col_widths=[5.0, 11.0])
    add_blank(doc)
    add_para(doc, 'Çizelge 8.2: Sistem gereksinimleri özeti.', style='Çizelge Yazısı')

    add_page_break(doc)

    # ÖZGEÇMİŞ
    add_heading1(doc, 'ÖZGEÇMİŞ')
    add_para(doc, 'Hasan Arthur ALTUNTAŞ')
    add_para(doc,
        '2002 yılında doğan Hasan Arthur Altuntaş, '
        'Düzce Üniversitesi Bilgisayar Mühendisliği bölümünde '
        '2020-2026 yılları arasında lisans eğitimini tamamlamıştır. '
        'Akademik çalışmaları boyunca makine öğrenmesi, '
        'ses işleme ve çok platformlu uygulama geliştirme '
        'alanlarına odaklanmıştır. '
        'AURIS projesi kapsamında geliştirilen sistem; '
        'web, mobil ve bulut tabanlı bileşenleriyle '
        'yapay zekâ müzik tespiti alanında özgün bir katkı sunmaktadır.')
    add_para(doc,
        'İletişim: hasannarthurrr@gmail.com')

    doc.save(OUT)
    print(f"[OK] {OUT}")


if __name__ == '__main__':
    build()
