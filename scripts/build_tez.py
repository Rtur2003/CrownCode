# -*- coding: utf-8 -*-
"""
BM498 Mezuniyet Tezi
AURIS: Akustik Öznitelik Tabanlı Yapay Zekâ Üretimi Müzik Tespiti
Hasan Arthur Altuntaş — 221001047 — Düzce Üniversitesi
"""
import os
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

TEMPLATE = "docs/academic/TeslimEdilecekler/tezşablonu.docx"
OUT = "docs/academic/TeslimEdilecekler/1.TEZ-RAPOR/BM498_Mezuniyet_Tezi_Hasan_Arthur_Altuntas.docx"


def para(doc, text, style='PARAGRAF METNİ'):
    return doc.add_paragraph(text, style=style)

def h1(doc, text):
    return doc.add_paragraph(text, style='Heading 1')

def h2(doc, text):
    return doc.add_paragraph(text, style='Heading 2')

def h3(doc, text):
    return doc.add_paragraph(text, style='Heading 3')

def blank(doc):
    doc.add_paragraph('', style='Normal')

def pb(doc):
    doc.add_page_break()

def bullet(doc, text):
    p = doc.add_paragraph(style='listeler stili')
    p.add_run(text)
    return p

def tablo_yazisi(doc, text):
    para(doc, text, style='Çizelge Yazısı')

def tablo(doc, headers, rows, col_widths=None):
    t = doc.add_table(rows=1 + len(rows), cols=len(headers))
    t.style = 'Table Grid'
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(headers):
        cell = t.rows[0].cells[i]
        cell.text = h
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        for run in cell.paragraphs[0].runs:
            run.bold = True
    for ri, row_data in enumerate(rows):
        for ci, val in enumerate(row_data):
            cell = t.rows[ri + 1].cells[ci]
            cell.text = str(val)
            cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    if col_widths:
        for row in t.rows:
            for j, cell in enumerate(row.cells):
                if j < len(col_widths):
                    cell.width = Cm(col_widths[j])
    blank(doc)
    return t


def build():
    doc = Document(TEMPLATE)

    # ── Kapak düzelt ──────────────────────────────────────────────────────
    replacements = {
        '202X-202X AKADEMİK YILI': '2025-2026 AKADEMİK YILI',
        'GÜZ/BAHAR DÖNEMİ': 'BAHAR DÖNEMİ',
        'BM401 BİLGİSAYAR MÜHENDİSLİĞİ PROJE TASARIMI / BM498 MEZUNİYET TEZİ': 'BM498 MEZUNİYET TEZİ',
        'Unvan. Ad SOYAD': 'Dr. Öğr. Üyesi Büşra TAKGİL',
        'MEZUNİYET TEZİ/PROJE/ÖDEV BAŞLIĞI': 'AURIS: AKUSTİK ÖZNİTELİK TABANLI YAPAY ZEKÂ ÜRETİMİ MÜZİĞİN TESPİTİ İÇİN ÇOK MODELLİ TOPLULUK SİSTEMİ',
        '1111111111111': '221001047',
        '03 Nisan 2026': '06 Haziran 2026',
    }
    for p in doc.paragraphs:
        for old, new in replacements.items():
            if old in p.text:
                p.clear()
                run = p.add_run(new)
                run.bold = True
        if p.text.strip() == 'Ad SOYAD':
            p.clear()
            p.add_run('Hasan Arthur ALTUNTAŞ').bold = True
        if '(Öğrencinin Adı Soyadı)' in p.text:
            p.clear()
            p.add_run('Hasan Arthur ALTUNTAŞ')
        if 'değerli hocam Prof. D' in p.text:
            p.clear()
            p.add_run(
                'Bu tez çalışmasının her aşamasında değerli yönlendirmeleri, '
                'sabrı ve akademik rehberliğiyle süreci şekillendiren '
                'danışman hocam Dr. Öğr. Üyesi Büşra TAKGİL\'e '
                'sonsuz teşekkürlerimi sunarım.')
        if 'eş danışmanım Prof. Dr.' in p.text:
            p.clear()
        if 'sevgili aileme ve çalışma arkadaşlarıma' in p.text:
            p.clear()
            p.add_run(
                'Tez süreci boyunca gösterdikleri anlayış ve destekten dolayı '
                'aileme ve tüm arkadaşlarıma teşekkür ederim.')
        if 'BAP-XXX-WWW' in p.text:
            p.clear()

    # ════════════════════════════════════════════════════════════════
    # ÖZET
    # ════════════════════════════════════════════════════════════════
    doc.add_paragraph('ÖZET', style='İLK BAŞLIKLAR')

    para(doc,
        'Suno, MusicGen, Udio ve Echoes gibi üretici yapay zekâ platformlarının '
        'yaygınlaşmasıyla birlikte, yapay zekâ tarafından üretilen müzik parçaları '
        'içerik akış platformlarında hızla artmaktadır. Bu gelişme; telif hakkı '
        'ihlalleri, sanatçı gelirlerinin adaletsiz dağılımı ve müzik yarışmalarında '
        'etik sorunlar gibi ciddi toplumsal sonuçlar doğurmaktadır. İnsan besteciler '
        'ile yapay zekâ sistemleri tarafından üretilen müziği güvenilir biçimde '
        'ayırt edebilen, açıklanabilir ve gerçek zamanlı çalışan bir tespit '
        'sistemine olan ihtiyaç her geçen gün artmaktadır.')
    para(doc,
        'Bu tez çalışmasında AURIS (Acoustic Understanding and Recognition Intelligence '
        'System — Akustik Öznitelik Tabanlı Yapay Zekâ Müzik Tespiti) sistemi '
        'tasarlanmış ve geliştirilmiştir. AURIS, ses sinyallerinden librosa '
        'kütüphanesi aracılığıyla 5 kategoride (spektral, zamansal, ritmik, '
        'harmonik, vokal) toplam 47 akustik öznitelik çıkarmakta; bu '
        'öznitelik vektörü üzerinde 7 klasik makine öğrenmesi ve 4 derin '
        'öğrenme modelini 5 katlı tabakalı çapraz doğrulama protokolüyle '
        'karşılaştırmaktadır.')
    para(doc,
        'Sistem, 8 farklı kaynaktan derlenen 5.195 ses kaydından oluşan '
        'gerçek dünya veri kümesi üzerinde eğitilmiştir. '
        'Veri kümesi 3.113 insan (%59,9) ve 2.082 yapay zekâ (%40,1) '
        'üretimi örnek içermektedir. Eğitim protokolünde her katlama için '
        'Youden J istatistiği ile karar eşiği optimizasyonu uygulanmış, '
        'sınıf dengesizliği düzeltmesi yapılmıştır. '
        'Öznitelik önemi analizinde spektral düzlük değişimi '
        '(spectral_flatness_std, skor: 0,0619), spektral kontrast '
        '(spectral_contrast_mean, 0,0467) ve RMS enerji (rms_energy, 0,0456) '
        'en yüksek ayrımsal güce sahip öznitelikler olarak belirlenmiştir.')
    para(doc,
        'En yüksek performansı elde eden LightGBM modeli; 0,8839 doğruluk, '
        '0,8575 F1-skoru ve 0,9548 ROC-AUC değerine (±0,0023, Brier skoru: 0,083) '
        'ulaşmıştır. Karar eşiği, Youden J istatistiğiyle θ* = 0,4316 olarak '
        'optimize edilmiştir. Karışıklık matrisinde; insan örneklerinin '
        '%87,4\'ü doğru negatif, yapay zekâ örneklerinin %89,4\'ü doğru '
        'pozitif olarak sınıflandırılmıştır.')
    para(doc,
        'Sistem; Next.js 14 ve TypeScript ile geliştirilmiş web platformu, '
        'Kotlin ve Jetpack Compose ile geliştirilen Android mobil uygulaması '
        've Python FastAPI arka ucundan oluşan tam yığın bir mimaride '
        'kullanıma sunulmuştur. SHAP (SHapley Additive exPlanations) '
        'entegrasyonu, her sınıflandırma kararını öznitelik bazında '
        'açıklanabilir kılmaktadır. Bu özellik, sistemi kapalı kaynak '
        'ticari rakiplerinden ayıran temel unsurdur.')
    para(doc,
        'Anahtar Kelimeler: Yapay zekâ müzik tespiti, akustik öznitelik '
        'mühendisliği, LightGBM, topluluk öğrenmesi, SHAP açıklanabilirliği, '
        'derin öğrenme, müzik bilgi işleme, ses sınıflandırma.')

    doc.add_paragraph('ABSTRACT', style='İLK BAŞLIKLAR')

    para(doc,
        'The rapid proliferation of generative AI platforms such as Suno, MusicGen, '
        'Udio, and Echoes has led to a dramatic increase in AI-generated music on '
        'content streaming platforms. This development raises serious concerns '
        'regarding copyright infringement, unfair distribution of artist revenues, '
        'and ethical issues in music competitions. The need for a reliable, '
        'explainable, and real-time detection system capable of distinguishing '
        'human-composed music from AI-generated tracks is growing rapidly.')
    para(doc,
        'This thesis presents AURIS (Acoustic Understanding and Recognition '
        'Intelligence System), designed and implemented for AI-generated music '
        'detection. AURIS extracts 47 acoustic features across five categories '
        '(spectral, temporal, rhythmic, harmonic, vocal) using the librosa library, '
        'and evaluates eleven classification models — seven classical machine '
        'learning and four deep learning architectures — under a 5-fold stratified '
        'cross-validation protocol with per-fold Youden\'s J threshold optimization.')
    para(doc,
        'The system is trained on a real-world dataset of 5,195 audio samples '
        'from 8 diverse sources (3,113 human-composed, 59.9%; 2,082 AI-generated, '
        '40.1%). Feature importance analysis identifies spectral flatness standard '
        'deviation (0.0619), spectral contrast mean (0.0467), and RMS energy (0.0456) '
        'as the most discriminative features. The best-performing LightGBM model '
        'achieves 0.9548 ROC-AUC (±0.0023), 88.39% accuracy, and 0.8575 F1-score. '
        'The decision threshold is optimized to θ* = 0.4316 via Youden\'s J statistic.')
    para(doc,
        'The complete system is deployed as a full-stack architecture comprising '
        'a Next.js 14 web platform, a Kotlin/Jetpack Compose Android application, '
        'and a FastAPI backend. SHAP integration provides feature-level '
        'explanations for every classification decision, distinguishing AURIS '
        'from closed-source commercial alternatives.')
    para(doc,
        'Keywords: AI music detection, acoustic feature engineering, LightGBM, '
        'ensemble learning, SHAP explainability, deep learning, '
        'music information retrieval, audio classification.')

    pb(doc)

    # ════════════════════════════════════════════════════════════════
    # 1. GİRİŞ
    # ════════════════════════════════════════════════════════════════
    h1(doc, '1. GİRİŞ')

    h2(doc, '1.1. Problemin Tanımı ve Araştırmanın Motivasyonu')
    para(doc,
        'Derin öğrenme tabanlı üretici yapay zekâ sistemlerinin son beş yılda '
        'gösterdiği exponansiyel ilerleme, müzik üretim alanını kökten '
        'dönüştürmüştür. Suno (v3, v3.5, v4, v5), Udio, Meta\'nın açık kaynak '
        'modeli MusicGen (Copet vd., 2023), AudioLDM2 (Liu vd., 2023), '
        'Stable Audio, Riffusion, Mustango ve JEN-1 gibi platformlar; '
        'müzik teorisi bilgisi olmayan bir kullanıcının bile dakikalar içinde '
        'yüksek kaliteli ve çoğunlukla piyasa standartlarına yakın '
        'müzik parçaları üretmesine olanak tanımaktadır.')
    para(doc,
        'Bu teknolojik dönüşüm beraberinde ciddi etik, hukuki ve ekonomik '
        'sorunları getirmektedir. Birincisi, yapay zekâ üretimi parçaların '
        'insan eserleriyle karışarak streaming platformlarına yüklenmesi '
        'telif hakkı ihlallerine zemin hazırlamaktadır. Spotify, Apple Music '
        've YouTube gibi platformlar, yapay zekâ içeriklerini doğrulayan '
        'güvenilir mekanizmalardan yoksundur. İkincisi, Spotify\'ın aylık '
        '600 milyon dinleyicisine ulaşan algoritmik öneri sistemi, '
        'yapay zekâ üretimi içerikleri insanmış gibi göstererek '
        'insan sanatçıların gelirlerini olumsuz etkileyebilmektedir. '
        'Üçüncüsü, müzik yarışmaları ve burs değerlendirme süreçlerinde '
        'yapay zekâ üretimi eserlerin insan yaratıcılığı olarak '
        'sunulması ciddi etik ihlaller doğurmaktadır.')
    para(doc,
        'Tüm bu sorunlara karşın, yapay zekâ üretimi ses tespiti alanında '
        'mevcut araştırmaların büyük bölümü konuşma sentezi ve ses derin '
        'sahteciliğine (audio deepfake) odaklanmış; müziğe özgü tespit '
        'sistemleri görece az ilgi görmüştür. Liu vd. (2024), bu alanı '
        '"gelişmekte olan" (nascent) olarak nitelendirmekte ve mevcut '
        'yaklaşımların büyük çoğunluğunun tek bir üretici sisteme özgü '
        'olduğunu, dolayısıyla yeni sistemlere genelleme yapamadığını '
        'vurgulamaktadır. Bhatt vd. (2025) ise çapraz-üretici '
        'genellemenin (cross-generator generalization) alanın temel '
        'açık problemi olduğunu ortaya koymaktadır.')
    para(doc,
        'AURIS bu boşluğu kapatmak amacıyla tasarlanmıştır. '
        '12\'den fazla yapay zekâ üretim sistemi kapsayan bir eğitim '
        'veri kümesi, 47 boyutlu akustik öznitelik vektörü ve '
        '11 modelin sistematik karşılaştırması ile hem teknik '
        'katkı hem yorumlanabilirlik sunan açık kaynaklı bir '
        'çözüm önerilmektedir.')

    h2(doc, '1.2. Araştırmanın Amaç ve Kapsamı')
    para(doc,
        'Bu çalışmanın temel araştırma sorusu şöyledir: '
        '"Spektral, zamansal, ritmik, harmonik ve vokal boyutları '
        'kapsayan el ile tasarlanmış akustik öznitelikler, '
        'gradient boosting topluluğuyla birleştirildiğinde, '
        'uçtan uca derin öğrenme yaklaşımlarıyla rekabet edebilir '
        'bir yapay zekâ müziği tespit performansı sağlayabilir mi?"')
    para(doc,
        'Bu soruyu yanıtlamak için aşağıdaki hedefler belirlenmiştir:')
    bullets = [
        '5 kategoride 47 öznitelikten oluşan kapsamlı ve yorumlanabilir '
        'bir akustik öznitelik vektörü tasarlamak;',
        '8 kaynaktan derlenen 5.195 örnekli gerçek dünya veri kümesi oluşturmak;',
        '7 klasik ML ve 4 derin öğrenme modelini aynı protokolle karşılaştırmak;',
        'Youden J istatistiğiyle optimize edilmiş karar eşiği belirlemek;',
        'SHAP entegrasyonuyla her kararı öznitelik bazında açıklanabilir kılmak;',
        'Sistemi web, Android ve API katmanlarıyla üretim ortamına taşımak.',
    ]
    for b in bullets:
        bullet(doc, '• ' + b)

    h2(doc, '1.3. BM401-BM498 İki Dönemlik Süreç')
    para(doc,
        'Bu proje iki akademik dönemde geliştirilmiştir. '
        'BM401 (Proje Tasarımı, 2024-2025 Güz Dönemi) aşamasında; '
        'wav2vec2 tabanlı hibrit bir yaklaşım tasarlanmış, '
        'Next.js 14 web platformu ve Kotlin Android uygulaması '
        'prototip düzeyinde geliştirilmiş, FastAPI arka ucu '
        'HuggingFace Spaces üzerinde dağıtılmıştır. '
        'Bu dönemin çıktısı, wav2vec2 embedding\'leri üzerinde '
        'LightGBM kullanan temel bir sınıflandırıcıdır.')
    para(doc,
        'BM498 (Mezuniyet Tezi, 2024-2025 Bahar Dönemi) aşamasında '
        'araştırma odağı köklü biçimde değişmiştir. '
        'wav2vec2 embedding\'lerinin yorumlanamaz yapısı ve '
        'hesaplama maliyeti göz önünde bulundurularak, '
        'el ile tasarlanmış 47 boyutlu akustik öznitelik '
        'vektörüne geçilmiştir. Veri kümesi 5.195 örneğe '
        'genişletilmiş, 11 model sistematik biçimde '
        'karşılaştırılmış ve SHAP açıklanabilirlik katmanı '
        'eklenmiştir. Bu dönüşüm, sistemi "çalışan prototip"ten '
        '"araştırma olgunluğuna ulaşmış, yayımlanabilir sistem"e '
        'taşımıştır.')

    h2(doc, '1.4. Tez Organizasyonu')
    para(doc,
        'Bölüm 2\'de yapay zekâ müzik üretimi, ses derin sahteciliği '
        'tespiti, transformer tabanlı ses gösterimleri, topluluk '
        'yöntemleri ve mevcut tespit sistemleri ele alınmaktadır. '
        'Bölüm 3\'te veri kümesi, öznitelik mühendisliği, '
        'model mimarileri ve eğitim protokolü ayrıntılı biçimde '
        'açıklanmaktadır. Bölüm 4\'te deneysel bulgular '
        'sunulmaktadır. Bölüm 5\'te bulgular tartışılmaktadır. '
        'Bölüm 6\'da sonuçlar ve gelecek çalışma önerileri '
        'yer almaktadır.')

    pb(doc)

    # ════════════════════════════════════════════════════════════════
    # 2. LİTERATÜR TARAMASI
    # ════════════════════════════════════════════════════════════════
    h1(doc, '2. LİTERATÜR TARAMASI')

    h2(doc, '2.1. Yapay Zekâ Müzik Üretim Sistemleri')
    para(doc,
        'Müzik üretiminde yapay zekâ kullanımı son yıllarda üç ana paradigma '
        'etrafında şekillenmiştir: otoregresif modeller, difüzyon modelleri '
        've transformer tabanlı metin-müzik dönüşümü.')
    para(doc,
        'Otoregresif modellerin öncüsü konumundaki Jukebox (Dhariwal vd., 2020), '
        'ham ses formunda MIDI yerine doğrudan waveform üreten ilk büyük ölçekli '
        'modeldir. Hiyerarşik VQ-VAE mimarisi ile farklı zaman ölçeklerinde '
        'müzikal yapıyı öğrenen Jukebox, 1,2 milyar parametresiyle dönemin '
        'en büyük müzik modeli unvanını taşımıştır. Ancak gerçek zamanlı '
        'üretim için çok yavaş kalan model, araştırma düzleminde '
        'önemli bir referans noktası olmayı sürdürmektedir.')
    para(doc,
        'Meta AI tarafından geliştirilen MusicGen (Copet vd., 2023), '
        'metin ve melodi koşullandırmalı, yüksek kaliteli müzik '
        'üretebilen decoder-only transformer mimarisidir. '
        '2023 yılında NeurIPS\'ta sunulan model, EnCodec ses kodlayıcısı '
        'üzerine inşa edilmiş ve tek bir modelde çok akışlı kodlama '
        'başarısını kanıtlamıştır. MusicGen, 300M, 1,5B ve 3,3B '
        'parametre ölçeklerinde yayımlanmış; açık kaynak lisansıyla '
        'araştırmacılara sunulmuştur.')
    para(doc,
        'Difüzyon tabanlı yaklaşımlar arasında AudioLDM (Liu vd., 2023), '
        'latent difüzyon modellerini ses üretimine uyarlamıştır. '
        'CLAP (Elizalde vd., 2023) gösterimleriyle koşullandırılan '
        'model, metin girdisiyle yüksek kaliteli ses sentezi '
        'yapabilmektedir. Riffusion, Stable Diffusion\'ı '
        'spektrogram uzayına uygulayarak müzik üretimi '
        'gerçekleştiren yaratıcı bir yaklaşım sunmaktadır. '
        'Ticari alanda Suno ve Udio, bu difüzyon ve otoregresif '
        'yaklaşımları tüketiciye yönelik kullanıcı dostu '
        'arayüzlerle sunarak yapay zekâ müziğini '
        'geniş kitlelere yaymıştır.')

    h2(doc, '2.2. Ses Derin Sahteciliği Tespiti')
    para(doc,
        'Yapay zekâ üretimi ses tespitine ilişkin sistematik araştırma, '
        'ilk olarak konuşma sentezi ve ses derin sahteciliği alanında '
        'başlamıştır. WaveFake veri kümesi (Frank ve Schönherr, 2021), '
        'yedi farklı vocoder mimarisinin çıktılarını barındıran '
        'temel bir kıyaslama noktası oluşturmuştur. '
        'Bu çalışma, mel-spektrogram özniteliklerinin hafif '
        'sınıflandırıcılarla kombinasyonunun bilinen vocoderlar '
        'üzerinde yüksek tespit oranlarına ulaşabildiğini, '
        'ancak görülmemiş mimarilere genellemede ciddi '
        'performans düşüşü yaşandığını ortaya koymuştur.')
    para(doc,
        'ADD 2022 Yarışması (Yi vd., 2022), ses derin sahteciliği '
        'tespiti alanında üç farklı zorluğu kapsamıştır: '
        'düşük kaliteli sahte sesler, kısmen sahte sesler '
        've çevresel gürültülü koşullar. '
        'Bu yarışma, alanın standart değerlendirme protokollerini '
        'belirleyerek sonraki araştırmalara yön vermiştir. '
        'Yi vd. (2023), 2008-2023 yılları arasında '
        'yayımlanan ses derin sahteciliği tespit araştırmalarını '
        'kapsamlı biçimde incelemiş; MFCC, LFCC, CQT ve '
        'mel-spektrogram tabanlı özniteliklerin farklı '
        'derin öğrenme sınıflandırıcılarla (LCNN, ResNet, '
        'conformer) kombinasyonlarını 17 veri kümesi üzerinde '
        'karşılaştırmıştır.')
    para(doc,
        'Müziğe özgü tespit araştırmaları görece yenidir. '
        'Liu vd. (2024), ses derin sahteciliği tespitinden '
        'yapay zekâ üretimi müzik tespitine geçişi '
        '"yol haritası ve genel bakış" perspektifiyle '
        'ele almakta; aktarılabilir özellikleri ve '
        'temel alan boşluklarını tanımlamaktadır. '
        'Afchar vd. (2025), oto-kodlayıcı artefaktlarından '
        'yararlanarak dedektörlerin %99,8 doğruluğa '
        'ulaşabildiğini, ancak MP3 sıkıştırma ve perde '
        'kaydırma gibi basit ses işleme işlemlerinin '
        'tespit oranlarını önemli ölçüde düşürdüğünü '
        'IEEE ICASSP 2025\'te sunmuştur.')

    h2(doc, '2.3. Transformer Tabanlı Ses Gösterimleri')
    para(doc,
        'wav2vec2 (Baevski vd., 2020), etiketlenmemiş konuşma '
        'verisi üzerinde öz-denetimli öğrenme yapan bir '
        'transformer modelidir. Model, nicelleştirilmiş '
        'latent vektörler üzerinde karşıtsal hedeflerle '
        'sürekli konuşma gösterimleri öğrenmekte; '
        'ince ayar sonrası çeşitli ses sınıflandırma '
        'görevlerinde güçlü performans sergilemektedir. '
        'Martín-Doñas ve Álvarez (2022), wav2vec2\'yi '
        'ADD 2022 ses derin sahteciliği tespit yarışmasına '
        'doğrudan uygulayarak göreve özgü öznitelik '
        'mühendisliği gerektirmeksizin rekabetçi sonuçlar '
        'elde etmiş; bu durum önceden eğitilmiş ses '
        'transformer\'larının özgünlük sınıflandırmasındaki '
        'kullanışlılığını doğrulamıştır.')
    para(doc,
        'CLAP (Elizalde vd., 2023), karşıtsal önceden eğitimi '
        'ses-metin embedding uzayına genişletmektedir. '
        'Wu vd. (2023) tarafından geliştirilen LAION-CLAP varyantı, '
        '630.000 ses-metin çifti üzerinde eğitilmiş '
        've genel amaçlı ses embedding\'leri sağlamaktadır. '
        'CLAP, hem tespit öznitelikleri olarak hem de '
        'yapay zekâ üretim hattlarının karakterizasyonunda '
        'ilgili bir araç konumundadır. '
        'Kosta vd. (2025) ise Segment Transformer\'ı, '
        'müzik bölümlerinin dizisini işleyen ve '
        'tam kompozisyon genelindeki yapısal örüntüleri '
        'yakalayan bir çerçeve olarak önermiştir.')

    h2(doc, '2.4. Topluluk Yöntemleri ve Ses Sınıflandırması')
    para(doc,
        'Topluluk yaklaşımları, müzik analizi görevlerinde '
        'tek model sınıflandırıcılarını tutarlı biçimde '
        'geride bırakmaktadır. Kostrzewa vd. (2022), '
        'farklı mimarilere sahip sinir ağlarının geniş '
        'topluluklarının müzik türü sınıflandırmasında '
        'varyansı azaltarak genellemeyi iyileştirdiğini '
        'göstermiştir. Gradient boosting yöntemleri; '
        'özellikle XGBoost ve LightGBM, el ile tasarlanmış '
        'ses öznitelik vektörlerine uygulandığında '
        'güçlü performans sergilemektedir.')
    para(doc,
        'Gan vd. (2024), VMD tabanlı öznitelik ayrıştırmasıyla '
        'birleştirilen XGBoost\'un müzik türü sınıflandırmasında '
        'rekabetçi doğruluk değerleri elde ettiğini bildirmiştir. '
        'Liu vd. (2022), çok kanallı ses öznitelik füzyonunu '
        'XGBoost ile birleştirerek müzik enstrüman tanımada '
        '%97,65 doğruluk elde etmiştir. Bu çalışmalar, '
        'gradient boosting ile el ile tasarlanmış özniteliklerin '
        'ses sınıflandırma görevlerinde güçlü bir temel '
        'oluşturduğunu ortaya koymaktadır.')

    h2(doc, '2.5. MFCC ve Spektral Öznitelikler')
    para(doc,
        'Mel frekans kepstral katsayıları (MFCC), ses sınıflandırma '
        'boru hatlarında onlarca yıldır temel öznitelik olarak '
        'kullanılmaktadır. McFee vd. (2015) tarafından geliştirilen '
        'librosa kütüphanesi, bu özniteliklerin hızlı ve '
        'güvenilir biçimde hesaplanmasını kolaylaştırmaktadır. '
        'Gourisaria vd. (2024), MFCC ile STFT özniteliklerinin '
        '7 farklı makine öğrenmesi sınıflandırıcısında '
        'karşılaştırmalı analizini yapmış; MFCC özniteliklerinin '
        'sınıflandırma görevlerinde ham STFT\'yi tutarlı biçimde '
        'geride bıraktığını, ancak her iki öznitelik setinin '
        'birlikte kullanılmasının en iyi sonucu verdiğini '
        'bulmuştur. Bu bulgu, AURIS\'in hem spektral hem de '
        'zamansal tanımlayıcıları bir araya getiren '
        'hibrit öznitelik vektörü tasarımını desteklemektedir.')
    para(doc,
        'Spektral kontrast, müziğin harmonik pikleri ve '
        'gürültü bileşenleri arasındaki farkı ölçmekte; '
        'bu nedenle yapay zekâ sentezinin tonal homojenliğini '
        'saptamak için özellikle değerlidir. Chroma öznitelikleri '
        'tonal yapıyı karakterize etmede yaygın biçimde '
        'kullanılmakta; müzikal ton geçişlerindeki karmaşıklık '
        've öngörülmezlik, insan bestecilerin imzasını '
        'oluşturmaktadır.')

    h2(doc, '2.6. Mevcut Sistemler ve Araştırma Boşlukları')
    para(doc,
        'Mevcut ticari ve açık kaynak sistemler karşılaştırıldığında '
        'temel araştırma boşlukları belirginleşmektedir. '
        'IRCAM Amplify, müzik kimlik doğrulama alanında '
        'kapalı kaynaklı bir API hizmeti sunmakta ve '
        '%98,59 doğruluk bildirmektedir; ancak eğitim verisi, '
        'değerlendirme metodolojisi ve öznitelik mimarisi '
        'hakkında hiçbir şeffaflık sunmamaktadır. '
        'Believe AI Radar, streaming platformlarına yönelik '
        'ticari bir çözüm olup, ücretli erişim modeli '
        'akademik kullanımı kısıtlamaktadır.')
    para(doc,
        'lofcz/ai-music-detector projesi, spektral fakeprint '
        'tabanlı açık kaynak bir yaklaşım sunmakta; '
        'ancak sistematik çapraz doğrulama eksikliği ve '
        'tek üreticiye özgü eğitim bu sistemin '
        'genelleme kapasitesini sınırlandırmaktadır. '
        'Bu boşlukları kapatmak üzere AURIS; '
        '(1) kamuya açık kaynaklardan derlenen çok üreticili '
        'veri kümesi, (2) şeffaf 5 katlı çapraz doğrulama, '
        '(3) SHAP tabanlı açıklanabilirlik ve '
        '(4) ücretsiz web + mobil dağıtım ile '
        'alandaki mevcut sistemlerden ayrışmaktadır.')

    pb(doc)

    # ════════════════════════════════════════════════════════════════
    # 3. MATERYAL VE YÖNTEM
    # ════════════════════════════════════════════════════════════════
    h1(doc, '3. MATERYAL VE YÖNTEM')

    h2(doc, '3.1. Sistem Mimarisine Genel Bakış')
    para(doc,
        'AURIS dört ana modülden oluşmaktadır: '
        '(1) Ses Ön İşleme Modülü: formatı standartlaştırma, '
        'yeniden örnekleme ve süre normalizasyonu; '
        '(2) Öznitelik Çıkarma Modülü: librosa tabanlı '
        '47 boyutlu vektör hesaplama; '
        '(3) Sınıflandırma Modülü: 11 modelin 5 katlı '
        'çapraz doğrulamayla eğitimi ve seçimi; '
        '(4) Açıklama Modülü: SHAP değerlerinin '
        'hesaplanması ve kullanıcıya sunulması.')
    para(doc,
        'Sistem şu giriş formatlarını desteklemektedir: '
        'MP3, WAV, FLAC ve OGG ses dosyaları (maksimum 50 MB) '
        've YouTube bağlantısı (yt-dlp ile ses çıkarımı). '
        'Tahmin çıktısı; sınıf etiketi (AI/İnsan), '
        'P(AI) güven skoru ve her özniteliğin karara '
        'katkısını gösteren SHAP değer sözlüğünden oluşmaktadır.')

    h2(doc, '3.2. Veri Kümesi')
    h3(doc, '3.2.1. Derleme Stratejisi ve Etik')
    para(doc,
        'AURIS veri kümesi, kaynak kökenine dayalı otomatik etiketleme '
        'stratejisiyle oluşturulmuştur. Bu yaklaşımda bilinen '
        'yapay zekâ üretim platformlarından gelen örnekler '
        '"1" (AI), bilinen insan müziği arşivlerinden gelen '
        'örnekler "0" (İnsan) olarak etiketlenmektedir. '
        'Bu yöntem Manuel etiketleme maliyetini sıfıra indirmekte '
        've etiket kaynaklarının tam denetlenebilirliğini '
        'güvence altına almaktadır.')
    para(doc,
        'Veri toplama sürecinde yalnızca kamuya açık ve '
        'Creative Commons ya da eşdeğer lisanslı ses arşivleri '
        'kullanılmıştır. İnsan katılımcılardan birincil '
        'veri toplanmamış olduğundan etik kurul izni '
        'gerekmemektedir. Tüm veri kaynakları HuggingFace '
        'Hub üzerinden programatik olarak indirilmiş '
        've işlenmiştir.')

    h3(doc, '3.2.2. Kaynak Dağılımı')
    para(doc,
        'Veri kümesi 5.195 ses kaydından oluşmaktadır: '
        '3.113 insan üretimi (%59,9) ve 2.082 yapay zekâ üretimi (%40,1). '
        'Çizelge 3.1\'de kaynak bazında dağılım sunulmaktadır.')
    tablo(doc,
        ['Kaynak (HuggingFace)', 'Tür', 'Örnek', 'Kapsam'],
        [
            ['SleepyJesse/ai_music_large (AI bölümü)', 'AI', '~2.000', '12+ üretici'],
            ['disco-eth/AIME', 'AI', '~1.000', 'Suno v3-v5, Udio, MusicGen, AudioLDM2...'],
            ['zuhri025/suno-audio', 'AI', '~500', 'Suno'],
            ['SleepyJesse/ai_music_large (insan bölümü)', 'İnsan', '~2.000', 'Karma'],
            ['marsyas/gtzan', 'İnsan', '999', '10 tür, 100 klip/tür'],
            ['benjamin-paine/free-music-archive-small', 'İnsan', '~1.000', 'FMA küçük'],
            ['TOPLAM', '—', '5.195', '—'],
        ],
        col_widths=[6.5, 1.5, 1.5, 6.5])
    tablo_yazisi(doc, 'Çizelge 3.1: AURIS veri kümesi kaynak dağılımı.')
    para(doc,
        'Veri kümesi 20\'den fazla müzik türünü kapsamaktadır: '
        'pop, rock, klasik, caz, elektronik, hip-hop, folk, metal, '
        'Latin, reggae ve çeşitli alt türler. '
        'AIME veri kümesi (disco-eth/AIME) özellikle önem taşımaktadır; '
        'çünkü Suno v3/v3.5/v4/v5, Udio, MusicGen, Stable Audio, '
        'Riffusion, AudioLDM2, Mustango, JEN-1, MusicLDM ve Tango '
        'dahil olmak üzere 12 farklı AI üretim mimarisinin '
        'çıktılarını tek bir veri kümesinde barındırmaktadır. '
        'Bu çeşitlilik, çapraz-üretici genelleme kapasitesini '
        'test etmek açısından kritik önem taşımaktadır.')

    h3(doc, '3.2.3. Ön İşleme Hattı')
    para(doc,
        'Tüm ses dosyaları aşağıdaki standartlaştırma '
        'adımlarından geçirilmektedir:')
    steps = [
        '22.050 Hz\'e yeniden örnekleme (librosa standart çözünürlüğü; '
        'wav2vec2 için 16.000 Hz);',
        'Tek kanala (mono) dönüşüm — stereo-mono dönüşümü '
        'kanal ortalamasıyla gerçekleştirilmektedir;',
        'Süre normalizasyonu: 30 saniyeyi aşan kayıtlar kırpılmakta, '
        'kısa kayıtlar sıfırla doldurulmaktadır;',
        'Gürültü ve bozulma kontrolü: minimum 1 saniye uzunluk '
        've minimum 1e-6 genlik esigi;',
        'Veri sızıntısını önlemek için duration_sec ve sample_rate '
        'meta veri alanları öznitelik vektöründen çıkarılmıştır.',
    ]
    for s in steps:
        bullet(doc, '• ' + s)

    h2(doc, '3.3. Öznitelik Mühendisliği')
    h3(doc, '3.3.1. Öznitelik Kategorileri')
    para(doc,
        'AURIS, librosa kütüphanesi (v0.10.1) (McFee vd., 2015) kullanılarak '
        'her ses kaydından 47 boyutlu bir öznitelik vektörü çıkarmaktadır. '
        'Çizelge 3.2\'de öznitelik kategorileri ve '
        'kapsadıkları boyutlar özetlenmektedir.')
    tablo(doc,
        ['Kategori', 'Öznitelik Sayısı', 'Kapsam'],
        [
            ['Spektral', '16', 'MFCC varyans/delta/delta², spektral merkez, bant genişliği, rolloff, düzlük, kontrast, düzenlilik'],
            ['Zamansal/Ritmik', '10', 'RMS enerji/std/dinamik aralık, sıfır geçiş oranı, tempo BPM/stabilite/CV'],
            ['Onset/Beat', '9', 'Onset güç ort/std, beat sayısı, IBI stabilitesi, zamansal örüntü'],
            ['Harmonik/Tonal', '8', 'Chroma entropi/std/geçiş hızı, Tonnetz std, harmonik oran, mel düzlüğü'],
            ['Vokal/Dışavurumsal', '4', 'Perde stabilitesi, vibrato düzenlilik/genlik, formant tutarlılığı, nefes örüntüsü'],
            ['TOPLAM', '47', '—'],
        ],
        col_widths=[3.5, 3.0, 9.5])
    tablo_yazisi(doc, 'Çizelge 3.2: AURIS öznitelik vektörünün kategorik dağılımı.')

    h3(doc, '3.3.2. Spektral Öznitelikler (16)')
    para(doc,
        'Spektral öznitelikler sesin frekans alanı yapısını '
        'karakterize etmektedir. MFCC (Mel Frekans Kepstral Katsayıları) '
        'grubu; 13 katsayı üzerinden hesaplanan varyans, '
        'birinci türev (delta) varyansı ve ikinci türev (delta²) '
        'varyansından oluşmaktadır. Delta katsayıları, '
        'sesin zamansal değişimini yakalayarak statik MFCC\'ye '
        'kıyasla daha zengin dinamik bilgi sunmaktadır. '
        'Mel spektrogram zamansal düzlüğü (mel_flatness), '
        'spektral enerjinin zaman ekseni boyunca ne denli '
        'homojen dağıldığını ölçmektedir.')
    para(doc,
        'Spektral düzlük (spectral_flatness), bir sesin '
        'gürültü benzeri (düz spektrum) mi yoksa tonal '
        '(pikli spektrum) mı olduğunu ölçen 0-1 aralığında '
        'bir metriktir. Yapay zekâ üretimi müzik, '
        'genellikle daha homojen ve öngörülebilir bir '
        'spektral yapıya sahipken, insan müziği '
        'kayıt ortamı gürültüsü, enstrüman rezonansları '
        've doğal performans varyasyonları nedeniyle '
        'daha geniş bir spektral düzlük aralığı sergilemektedir. '
        'Bu fark, spectral_flatness_std\'nin en yüksek '
        'öznitelik önem skoruna (0,0619) ulaşmasını açıklamaktadır.')
    para(doc,
        'Spektral kontrast (spectral_contrast), '
        'frekans alt bantlarındaki tepe ve dip arasındaki '
        'enerji farkını ölçmektedir. '
        'Yüksek harmonik yapıya sahip insan müziği, '
        'AI sentezi daha homojen enerji dağılımından '
        'ayrışan güçlü kontrast örüntüleri sergilemektedir.')

    h3(doc, '3.3.3. Vokal Öznitelikler ve Motivasyonu')
    para(doc,
        'AURIS\'in özgün katkılarından birini oluşturan '
        'vokal öznitelikler, insan sesi ile yapay zekâ '
        'sentezi arasındaki farkları alt seviyede '
        'yakalamayı hedeflemektedir. '
        'İnsan sesinin karakteristik özellikleri şunlardır: '
        'stokastik perde varyasyonu (nefes, titreme, '
        'duygusal ifade kaynaklı), doğal vibrato '
        'düzensizliği, formant geçişlerinin akıcı '
        've öngörülmez yapısı ve nefes örüntüleri.')
    para(doc,
        'Yapay zekâ sentezli sesler bu özellikleri '
        'taklit etmekte zorlanmaktadır. '
        'AI vokal sentezleri, mekanik düzende '
        'titreme (çok düzenli vibrato), sert formant '
        'geçişleri ve nefes yokluğu/aşırı simetrik '
        'nefes örüntüleri gibi iz bırakmaktadır. '
        'Bu gözlemler; perde_stabilitesi_skoru, '
        'vibrato_düzenlilik_skoru, formant_tutarlılık_skoru '
        've nefes_örüntüsü_skoru özniteliklerinin '
        'tasarım gerekçesini oluşturmaktadır. '
        'Nefes örüntüsü skoru\'nun LightGBM öznitelik '
        'önem analizinde ilk 10\'a girmesi '
        'bu motivasyonu deneysel olarak doğrulamaktadır.')

    h3(doc, '3.3.4. Veri Sızıntısı Önlemi')
    para(doc,
        'Öznitelik çıkarma sürecinde kritik bir metodolojik '
        'önlem uygulanmıştır: duration_sec (kayıt süresi) '
        've sample_rate (örnekleme frekansı) meta veri alanları '
        'öznitelik vektöründen çıkarılmıştır. '
        'Bu alanlar, ses içeriğiyle değil kaynakla '
        'ilişkili olduğundan, modelin ses içeriği yerine '
        'meta veriden sınıf tahmini yapması riskini '
        'barındırmaktadır. '
        'Bu müdahale, training_results.json\'daki '
        '_data_leakage_fix anahtarıyla belgelenmiştir: '
        '"duration_sec and sample_rate removed from features; '
        'scaler fitted per fold during CV."')

    h2(doc, '3.4. Sınıflandırma Modelleri')
    h3(doc, '3.4.1. Klasik Makine Öğrenmesi Modelleri (7)')
    para(doc,
        'Yedi klasik makine öğrenmesi modeli scikit-learn '
        '(Pedregosa vd., 2011), XGBoost (Chen ve Guestrin, 2016) '
        've LightGBM (Ke vd., 2017) kütüphaneleri kullanılarak '
        'eğitilmiştir. Her model için hiperparametre araması, '
        'doğrulama AUC\'u temel alınarak yürütülmüş; '
        'en iyi parametre kümesi 5 katlı çapraz doğrulamayla '
        'değerlendirilmiştir. Çizelge 3.3\'te seçilen '
        'hiperparametreler özetlenmektedir.')
    tablo(doc,
        ['Model', 'Temel Hiperparametreler', 'Eğitim Süresi (s)'],
        [
            ['Logistic Regression', 'C=2,0; class_weight=balanced; max_iter=2500', '0,30'],
            ['Random Forest', 'n_est=500; max_features=log2; class_weight=balanced_subsample', '9,40'],
            ['Gradient Boosting', 'n_est=180; max_depth=4; lr=0,07; subsample=0,75', '33,84'],
            ['SVM (RBF)', 'C=10; gamma=0,05; class_weight=balanced', '19,79'],
            ['MLP Sinir Ağı', 'gizli=[192,96,32]; alpha=0,001; max_iter=600', '7,49'],
            ['XGBoost', 'n_est=240; max_depth=5; lr=0,06; reg_alpha=0,4; reg_lambda=1,5', '2,10'],
            ['LightGBM', 'n_est=300; num_leaves=31; lr=0,05; subsample=0,8; reg_alpha=0,1', '2,95'],
        ],
        col_widths=[4.0, 9.5, 2.5])
    tablo_yazisi(doc, 'Çizelge 3.3: Klasik ML modellerinin seçilen hiperparametreleri ve eğitim süreleri.')

    h3(doc, '3.4.2. Derin Öğrenme Modelleri (4)')
    para(doc,
        'Dört derin öğrenme modeli PyTorch (Paszke vd., 2019) '
        'çerçevesinde 47 boyutlu öznitelik vektörünü '
        'girdi olarak alacak şekilde tasarlanmıştır. '
        'Tüm DL modelleri BCEWithLogitsLoss kayıp fonksiyonu '
        've n_negatif/n_pozitif oranıyla belirlenen '
        'pos_weight parametresiyle sınıf dengesizliğini '
        'gidermektedir. Adam optimizasyon algoritması '
        '(lr=1×10⁻³) ve erken durdurma '
        '(patience=10, doğrulama kaybı) kullanılmıştır.')
    tablo(doc,
        ['Model', 'Mimari Detayı', 'Eğitim Süresi (s)'],
        [
            ['Derin MLP', 'FC(47→512→256→128→64→1), BatchNorm, Dropout(0,3), ReLU', '81,4'],
            ['1D-CNN', 'Conv1D(1→32→64→128) + GlobalAvgPool + FC(128→1)', '125,0'],
            ['Residual MLP (3 blok)', '3×Artık Blok (64 boyut), BatchNorm, FC→1', '128,7'],
            ['Attention MLP', 'Öz-dikkat (64 boyut) + FF katmanlar + FC→1', '149,6'],
        ],
        col_widths=[3.5, 9.0, 3.5])
    tablo_yazisi(doc, 'Çizelge 3.4: Derin öğrenme model mimarileri ve eğitim süreleri.')
    para(doc,
        'Derin MLP, en basit ancak en güçlü mimariye karşılık '
        'gelmektedir. Dört tam bağlantılı katmandan oluşan '
        'bu mimari, öznitelik uzayındaki karmaşık doğrusal '
        'olmayan ilişkileri BatchNorm ve Dropout '
        'düzenlilik mekanizmasıyla öğrenmektedir. '
        'Residual MLP, artık (skip) bağlantılarla '
        'gradient vanishing sorununu azaltmaktadır. '
        'Attention MLP, öz-dikkat mekanizmasıyla '
        'öznitelikler arası bağımlılıkları dinamik '
        'biçimde ağırlıklandırmaktadır. '
        '1D-CNN ise evrişimsel yapının öznitelik '
        'vektörü üzerindeki uygulamasını '
        'temsil etmektedir.')

    h2(doc, '3.5. Eğitim Protokolü')
    h3(doc, '3.5.1. 5 Katlı Tabakalı Çapraz Doğrulama')
    para(doc,
        'Tüm modeller aynı 5 katlı tabakalı çapraz doğrulama '
        '(stratified k-fold cross-validation) protokolüyle '
        'değerlendirilmiştir. Tabakalama, her katlamada '
        'sınıf dağılımını (%59,9 insan/%40,1 AI) '
        'koruyarak değerlendirmenin güvenilirliğini '
        'artırmaktadır.')
    para(doc,
        'Her katlama için standartlaştırma skalası '
        '(StandardScaler) yalnızca eğitim alt kümesine '
        'uyarlanmış, doğrulama alt kümesine dönüşüm '
        'uygulanmıştır. Bu "sızdırmaz" skalama '
        'uygulaması, gerçekçi genelleme tahmini '
        'için zorunludur.')

    h3(doc, '3.5.2. Youden J Eşik Optimizasyonu')
    para(doc,
        'Naif 0,50 eşiği yerine her katlama için '
        'Youden J istatistiği maksimize edilerek '
        'optimal karar eşiği belirlenmektedir:')
    para(doc, 'θ* = argmax(TPO − YPO)', style='denklem')
    para(doc,
        'burada TPO, Gerçek Pozitif Oranı (duyarlılık); '
        'YPO, Yanlış Pozitif Oranıdır (1 - özgüllük). '
        'Bu yöntem, özellikle sınıf dengesizliği '
        'durumlarında her iki sınıf için '
        'daha dengeli hata profili sağlamaktadır. '
        'LightGBM için optimal eşik θ* = 0,4316 '
        'olarak belirlenmiş; 0,50 yerine bu eşiğin '
        'kullanılması yanlış negatif oranını '
        'önemli ölçüde azaltmıştır.')

    h3(doc, '3.5.3. Sınıf Dengesizliği Yönetimi')
    para(doc,
        'Veri kümesindeki 1:1,5 oranındaki sınıf '
        'dengesizliği şu yöntemlerle giderilmiştir:')
    imbalance = [
        'Logistic Regression ve SVM: class_weight="balanced";',
        'Random Forest: class_weight="balanced_subsample";',
        'XGBoost: scale_pos_weight = n_negatif/n_pozitif;',
        'DL modelleri: BCEWithLogitsLoss pos_weight = n_negatif/n_pozitif;',
        'SVM-RBF: ek olarak CalibratedClassifierCV (isotonic, cv=3).',
    ]
    for i in imbalance:
        bullet(doc, '• ' + i)

    h2(doc, '3.6. SHAP Açıklanabilirlik Entegrasyonu')
    para(doc,
        'AURIS, her tahmin için SHAP (SHapley Additive '
        'exPlanations) (Lundberg ve Lee, 2017) değerlerini '
        'hesaplamaktadır. SHAP, kooperatif oyun teorisinden '
        'türetilen Shapley değerlerine dayalı olarak '
        'her özniteliğin nihai tahmine aditif '
        'katkısını ayrıştırmaktadır.')
    para(doc,
        'LightGBM\'in TreeExplainer arayüzü, ağaç '
        'tabanlı modeller için SHAP değerlerini '
        'polinom zaman yerine lineer zamanda '
        'hesaplayarak gerçek zamanlı kullanım '
        'için pratik bir avantaj sağlamaktadır. '
        'Her analiz sonucunda kullanıcıya '
        '"Bu parçanın spectral_flatness_std değeri '
        'yüksek olduğu için AI olasılığı artmıştır" '
        'biçiminde öznitelik bazında gerekçe sunulmaktadır.')
    para(doc,
        'SHAP entegrasyonu sistemi iki kritik boyutta '
        'güçlendirmektedir. Birincisi, kullanıcı '
        'güvenini artırmaktadır: siyah kutu model '
        'yerine açıklanabilir karar süreci '
        'sunmak, özellikle profesyonel bağlamlarda '
        '(müzik endüstrisi, hukuki değerlendirme) '
        'sistemin benimsenmesini kolaylaştırmaktadır. '
        'İkincisi, araştırmacılara öznitelik '
        'mühendisliği için yönlendirici bilgi '
        'sağlamaktadır.')

    h2(doc, '3.7. Uygulama Mimarisi')
    h3(doc, '3.7.1. Web Platformu (Next.js 14)')
    para(doc,
        'Web arayüzü Next.js 14 ve TypeScript ile '
        'geliştirilmiştir. Statik site üretimi '
        '(static export) yaklaşımı benimsenerek '
        'Netlify CDN üzerinde küresel dağıtım '
        'sağlanmaktadır. Temel teknolojiler: '
        'React 18.3.1 (UI), Framer Motion 11.18.2 '
        '(animasyon), next-themes (koyu/açık tema), '
        'Lucide React (ikonlar), i18n '
        '(Türkçe/İngilizce). '
        'Kullanıcı; dosya yükleme veya YouTube '
        'bağlantısıyla analizi başlatabilmekte, '
        'SHAP grafiklerini gerçek zamanlı '
        'görüntüleyebilmektedir.')

    h3(doc, '3.7.2. Android Mobil Uygulaması (Kotlin/Compose)')
    para(doc,
        'Mobil uygulama Kotlin ve Jetpack Compose '
        'ile Clean Architecture deseninde (MVVM) '
        'geliştirilmiştir. Minimum API seviyesi '
        'API 26 (Android 8.0) olarak belirlenmiştir. '
        'Bağımlılık enjeksiyonu Hilt 2.53.1, '
        'ağ iletişimi Retrofit 2.11.0/OkHttp 4.12.0, '
        'yerel kalıcılık Room 2.6.1 veritabanıyla '
        'sağlanmaktadır. Asenkron işlemler '
        'Kotlin Coroutines ve Flow ile yönetilmektedir. '
        'Cihazdan dosya seçimi veya YouTube bağlantısı '
        'girişiyle analiz başlatılabilmekte; '
        'sonuçlar geçmiş ekranında '
        'Room veritabanında saklanmaktadır.')

    h3(doc, '3.7.3. FastAPI Arka Ucu')
    para(doc,
        'Arka uç Python 3.11 ve FastAPI ile '
        'geliştirilmiş; HuggingFace Spaces platformunda '
        'Docker konteyneri olarak 7860 numaralı '
        'portta çalışmaktadır. '
        'POST /analyze uç noktası: ses dosyasını '
        'alarak öznitelik çıkarma → model tahmini '
        '→ SHAP hesaplama → JSON yanıt '
        'hattını işletmektedir. '
        'Yanıt: tahmin etiketi, P(AI) güven skoru, '
        'SHAP değer sözlüğü ve olası hata mesajından '
        'oluşmaktadır.')

    pb(doc)

    # ════════════════════════════════════════════════════════════════
    # 4. BULGULAR
    # ════════════════════════════════════════════════════════════════
    h1(doc, '4. BULGULAR')

    h2(doc, '4.1. Model Karşılaştırma Sonuçları')
    h3(doc, '4.1.1. Tüm 11 Model: Birleşik Sıralama')
    para(doc,
        'Çizelge 4.1, 5.195 örnek ve 47 öznitelik üzerinde '
        '5 katlı çapraz doğrulamayla elde edilen '
        'tüm 11 modelin performansını ROC-AUC\'a '
        'göre azalan sırada sunmaktadır.')
    tablo(doc,
        ['Sıra', 'Model', 'Tür', 'Doğruluk', 'F1', 'ROC-AUC', 'Val-AUC'],
        [
            ['1', 'LightGBM', 'ML', '0,8839', '0,8575', '0,9549', '0,9472'],
            ['2', 'Derin MLP (512-256-128-64)', 'DL', '0,8849', '0,8596', '0,9537', '—'],
            ['3', 'XGBoost', 'ML', '0,8735', '0,8402', '0,9463', '0,9376'],
            ['4', 'Residual MLP (3 blok)', 'DL', '0,8756', '0,8476', '0,9453', '—'],
            ['5', 'Gradient Boosting', 'ML', '0,8685', '0,8337', '0,9406', '0,9297'],
            ['6', 'Random Forest', 'ML', '0,8604', '0,8183', '0,9393', '0,9302'],
            ['7', 'Attention MLP', 'DL', '0,8628', '0,8293', '0,9356', '—'],
            ['8', 'SVM (RBF)', 'ML', '0,8612', '0,8252', '0,9347', '0,9336'],
            ['9', 'MLP Sinir Ağı', 'ML', '0,8545', '0,8189', '0,9258', '0,9278'],
            ['10', 'Logistic Regression', 'ML', '0,7779', '0,7390', '0,8511', '0,8383'],
            ['11', '1D-CNN', 'DL', '0,7665', '0,7159', '0,8442', '—'],
        ],
        col_widths=[1.0, 4.5, 1.0, 2.5, 2.5, 2.5, 2.5])
    tablo_yazisi(doc, 'Çizelge 4.1: 11 modelin 5 katlı CV performans karşılaştırması (ROC-AUC\'a göre sıralı).')

    h3(doc, '4.1.2. DL Model Katlama Stabilitesi')
    para(doc,
        'Çizelge 4.2, derin öğrenme modellerinin '
        '5 katlama genelindeki ROC-AUC değerlerini '
        've standart sapmalarını göstermektedir.')
    tablo(doc,
        ['Model', 'K1', 'K2', 'K3', 'K4', 'K5', 'Ortalama', 'Std'],
        [
            ['Derin MLP', '0,9582', '0,9557', '0,9508', '0,9492', '0,9571', '0,9542', '±0,0036'],
            ['Residual MLP', '0,9523', '0,9491', '0,9473', '0,9407', '0,9531', '0,9485', '±0,0044'],
            ['Attention MLP', '0,9318', '0,9461', '0,9379', '0,9320', '0,9316', '0,9359', '±0,0056'],
            ['1D-CNN', '0,8583', '0,8645', '0,8589', '0,8394', '0,8502', '0,8543', '±0,0087'],
        ],
        col_widths=[3.5, 1.8, 1.8, 1.8, 1.8, 1.8, 2.5, 2.0])
    tablo_yazisi(doc, 'Çizelge 4.2: Derin öğrenme modellerinin katlama bazında ROC-AUC değerleri.')
    para(doc,
        'Derin MLP en düşük varyansı (std=0,0036) '
        'sergileyerek 5 katlama genelinde tutarlı '
        'genelleme kapasitesine sahip olduğunu '
        'kanıtlamıştır. LightGBM\'in std değeri ±0,0023 '
        'ile Derin MLP\'den daha düşük olup '
        'model istikrarında tüm modeller arasında '
        'lider konumdadır. 1D-CNN ise en yüksek '
        'varyansı (std=0,0087) ve en düşük ortalama '
        'AUC\'u (0,8543) göstererek bu öznitelik '
        'vektörü formatında evrişimsel mimarinin '
        'dezavantajını ortaya koymaktadır.')

    h2(doc, '4.2. En İyi Model: LightGBM Ayrıntılı Analizi')
    h3(doc, '4.2.1. Karar Eşiği Optimizasyonu')
    para(doc,
        'Varsayılan 0,50 eşiği yerine '
        'Youden J istatistiği ile optimal eşik '
        'θ* = 0,4316 olarak belirlenmiştir. '
        'Bu eşiğin 0,50\'nin altında olması, '
        'sınıf dengesizliğini yansıtmaktadır: '
        'azınlık sınıfı olan AI örneklerini '
        'daha hassas yakalamak için karar sınırı '
        'aşağıya çekilmiştir.')

    h3(doc, '4.2.2. Karışıklık Matrisi')
    tablo(doc,
        ['', 'Tahmin: İnsan (0)', 'Tahmin: AI (1)'],
        [
            ['Gerçek: İnsan (0)', 'DN = 2.721 (%87,4)', 'YP = 392 (%12,6)'],
            ['Gerçek: AI (1)', 'YN = 220 (%10,6)', 'DP = 1.862 (%89,4)'],
        ],
        col_widths=[4.0, 6.0, 6.0])
    tablo_yazisi(doc, 'Çizelge 4.3: LightGBM karışıklık matrisi (θ* = 0,4316).')
    para(doc,
        'Modelin AI örneklerindeki geri çağırma '
        '(%89,4) insan örneklerindeki özgüllüğü '
        '(%87,4) hafifçe geçmektedir. '
        'Bu denge, bir tespit sistemi açısından '
        'tercih edilebilir bir hata profilini '
        'temsil etmektedir: kaçırılan AI örnekleri '
        '(Yanlış Negatif), yanlış işaretlenen '
        'insan eserleri (Yanlış Pozitif) '
        'kadar ya da daha az kritiktir.')

    h3(doc, '4.2.3. Kalibrasyon ve Brier Skoru')
    para(doc,
        'LightGBM modeli Brier skoru 0,083 '
        'ile iyi kalibre edilmiş bir olasılık '
        'tahmincisi olduğunu kanıtlamıştır. '
        'Bu değer, modelin P(AI) skorlarının '
        'güvenilir olasılık tahminleri olduğunu '
        've eşik tabanlı karar almada '
        'öngörülebilir hassasiyet-geri çağırma '
        'değiş-tokuşları sunduğunu göstermektedir.')

    h2(doc, '4.3. Öznitelik Önemi Analizi')
    para(doc,
        'LightGBM kazanç tabanlı normalleştirilmiş '
        'öznitelik önemi analizi, Çizelge 4.4\'te '
        'en yüksek katkı sağlayan 15 özniteliği '
        'sunmaktadır.')
    tablo(doc,
        ['Sıra', 'Öznitelik', 'Kategori', 'Önem Skoru'],
        [
            ['1', 'spectral_flatness_std', 'Spektral', '0,0619'],
            ['2', 'spectral_contrast_mean', 'Spektral', '0,0467'],
            ['3', 'rms_energy', 'Zamansal', '0,0456'],
            ['4', 'onset_strength_std', 'Ritmik', '0,0388'],
            ['5', 'spectral_flatness_mean', 'Spektral', '0,0370'],
            ['6', 'rms_dynamic_range', 'Zamansal', '0,0346'],
            ['7', 'onset_strength_mean', 'Ritmik', '0,0332'],
            ['8', 'rms_std', 'Zamansal', '0,0298'],
            ['9', 'beat_count', 'Ritmik', '0,0298'],
            ['10', 'mfcc_delta_var', 'Spektral', '0,0289'],
            ['11', 'chroma_std', 'Harmonik', '0,0281'],
            ['12', 'mfcc_variance', 'Spektral', '0,0279'],
            ['13', 'tonnetz_std', 'Harmonik', '0,0273'],
            ['14', 'chroma_entropy', 'Harmonik', '0,0223'],
            ['15', 'breath_pattern_score', 'Vokal', '0,0204'],
        ],
        col_widths=[1.0, 5.5, 3.0, 3.5])
    tablo_yazisi(doc, 'Çizelge 4.4: LightGBM normalleştirilmiş kazanç tabanlı öznitelik önemi (ilk 15).')
    para(doc,
        'Spektral öznitelikler ilk 5\'te 3 temsil '
        'ile açık ara öne çıkmaktadır. '
        'Zamansal/ritmik öznitelikler (rms_energy, '
        'onset_strength, beat_count) orta düzey '
        'katkı sağlarken, vokal kategorisinden '
        'breath_pattern_score\'un 15. sıraya '
        'girmesi vokal analizi motif tasarımının '
        'doğrulandığını göstermektedir. '
        'has_vocals özniteliğinin sıfır önem skoru '
        'alması ilginçtir; bu durum vokal '
        'varlığının tek başına ayırt edici '
        'olmadığını, ancak vokal kalite '
        'metriklerinin (nefes, formant, vibrato) '
        'anlamlı bilgi taşıdığını ortaya koymaktadır.')

    h2(doc, '4.4. Kaynak Bazında Performans')
    para(doc,
        'Çapraz-üretici genellemeyi değerlendirmek '
        'amacıyla model çıktıları kaynak bazında '
        'analiz edilmiştir.')
    tablo(doc,
        ['Kaynak', 'Tür', 'Doğruluk', 'Yorum'],
        [
            ['Suno', 'AI', '%93,0', 'Güçlü tespit — eğitim datasında temsil var'],
            ['Echoes', 'AI', '%88,6', 'İyi tespit — farklı üretici mimarisi'],
            ['AImE/Mustango/JEN-1', 'AI', '%87-89', 'Genel AI izi yakalanıyor'],
            ['GTZAN', 'İnsan', '%91,2', 'Yüksek özgüllük — temiz müzik verisi'],
            ['Deepfake ses seti', 'AI', '%50,0', 'Dağılım kayması — konuşma sentezi'],
        ],
        col_widths=[4.0, 1.5, 2.5, 8.0])
    tablo_yazisi(doc, 'Çizelge 4.5: Kaynak bazında LightGBM doğruluk değerleri ve yorumları.')
    para(doc,
        'Deepfake ses setinin %50 doğrulukla '
        'sonuçlanması bir model başarısızlığı '
        'değil, dağılım kayması sorunudur. '
        'Bu set müzik değil konuşma derin '
        'sahteciliği içermekte; AURIS\'in eğitildiği '
        'müzik akustik alanından temel biçimde '
        'ayrışmaktadır. Müzik kaynaklarında '
        'elde edilen %88-93 aralığındaki '
        'doğruluk değerleri ise modelin '
        'hedef domainde güçlü genelleme '
        'kapasitesine sahip olduğunu teyit etmektedir.')

    pb(doc)

    # ════════════════════════════════════════════════════════════════
    # 5. TARTIŞMA
    # ════════════════════════════════════════════════════════════════
    h1(doc, '5. TARTIŞMA')

    h2(doc, '5.1. LightGBM\'in Üstünlüğü: Mekanizma Analizi')
    para(doc,
        'LightGBM\'in 47 boyutlu el ile tasarlanmış '
        'öznitelik uzayında en yüksek ROC-AUC\'u '
        'elde etmesi birkaç yapısal faktörle açıklanabilir.')
    para(doc,
        'Birincisi, yaprak-düzeyinde büyüme stratejisi: '
        'Geleneksel gradient boosting\'in seviye-düzeyinde '
        'büyümesi yerine LightGBM, her adımda '
        'en yüksek kazancı sağlayan yaprağı '
        'derinleştirmektedir. Bu strateji, '
        '47 boyutlu öznitelik uzayındaki '
        'karmaşık etkileşim örüntülerini '
        'daha iyi modelleyebilmektedir.')
    para(doc,
        'İkincisi, histogram tabanlı bölme: '
        'Sürekli öznitelik değerlerini '
        'histogram kovalarına gruplandırmak, '
        'hem hesaplama verimliliğini artırmakta '
        '(eğitim süresi: 2,95 saniye) '
        'hem de belirli ölçüde düzenlilik '
        'etkisi yaratarak aşırı uyumu '
        'baskılamaktadır.')
    para(doc,
        'Üçüncüsü, veri büyüklüğü ve model kapasitesi '
        'uyumu: 5.195 örneklik veri kümesinde '
        'Derin MLP gibi daha büyük kapasiteli '
        'modeller genelleme için yetersiz veriyle '
        'karşılaşmaktadır. LightGBM ise '
        'mevcut veri miktarında daha verimli '
        'öğrenme sergilemektedir. '
        'Veri kümesi büyüdükçe bu dengenin '
        'tersine dönmesi beklenmektedir; '
        'bu durum gelecek çalışmalar için '
        'veri büyütme stratejisini haklılaştırmaktadır.')

    h2(doc, '5.2. Spektral Düzlük: Yorumlanabilir Bir Ayrımcı')
    para(doc,
        'Spectral_flatness_std\'nin en yüksek öznitelik '
        'önem skoruna (0,0619) ulaşması, '
        'makaleyle (AURIS_paper_GUJSA.md, §4.3) '
        'tutarlıdır ve güçlü bir yorumsal '
        'çerçeve sunmaktadır. '
        'AI müzik üretim sistemleri, perceptual '
        'kalite metriklerini optimize etme '
        'eğilimindedir; bu süreç genellikle '
        'daha tonal (düşük düzlük) ve '
        'homojen bir spektral yapıyla sonuçlanmaktadır.')
    para(doc,
        'Öte yandan insan müziği; kayıt ortamı gürültüsü, '
        'enstrüman rezonansları, oda akustiği '
        've doğal performans varyasyonları '
        'nedeniyle daha geniş bir spektral '
        'düzlük aralığı sergilemektedir. '
        'Afchar vd. (2025) ile paralel biçimde, '
        'bu bulgu AI sentez süreçlerinin '
        '"spektral iz" bıraktığını '
        've bu izin el ile tasarlanmış '
        'özniteliklerle yakalanabildiğini '
        'göstermektedir.')

    h2(doc, '5.3. Çapraz-Üretici Genelleme')
    para(doc,
        'AIME veri kümesi, 12 farklı AI üretim '
        'mimarisini tek bir eğitim seti altında '
        'barındırmaktadır. Bu çeşitlilik göz önünde '
        'bulundurulduğunda elde edilen yüksek '
        'AUC değerleri, 47 öznitelik temsilinin '
        'üretici-bağımsız artefaktları — '
        'mevcut sentez hattlarına özgü '
        'düşük seviyeli akustik özellikler — '
        'yakaladığını düşündürmektedir. '
        'Bu, üretici-özgü parmak izine '
        'kıyasla gerçek dünya dağıtımı '
        'için kritik bir avantajdır; '
        'çünkü yeni üretici sistemler '
        'ortaya çıktıkça tespit edebilme '
        'kapasitesi korunmaktadır.')
    para(doc,
        'Bhatt vd. (2025), çapraz-üretici '
        'genellemenin alanın temel açık '
        'problemi olduğunu vurgulamaktadır. '
        'AURIS\'in çok üreticili eğitim '
        'stratejisi bu soruna doğrudan '
        'yanıt vermekte; ancak kesin '
        'değerlendirme için görülmemiş '
        'üreticilerden oluşan bağımsız '
        'test seti kullanımı '
        'gelecek çalışmalarda '
        'hedeflenmektedir.')

    h2(doc, '5.4. Literatürle Nicel Karşılaştırma')
    tablo(doc,
        ['Sistem', 'Doğruluk', 'ROC-AUC', 'Erişim', 'Açıklanabilirlik', 'Veri'],
        [
            ['IRCAM Amplify (Afchar vd., 2025)', '%98,6', 'N/A', 'Ücretli', 'Yok', 'Kapalı'],
            ['Believe AI Radar', '%98,0', 'N/A', 'Ticari', 'Yok', 'Kapalı'],
            ['lofcz/ai-music-detector', 'N/A', 'N/A', 'Açık', 'Kısmi', 'Tek üretici'],
            ['AURIS (bu çalışma)', '%88,4', '0,9549', 'Ücretsiz Web+Android', 'SHAP (tam)', '5.195, 12+ üretici'],
        ],
        col_widths=[4.5, 2.0, 2.0, 2.5, 2.5, 2.5])
    tablo_yazisi(doc, 'Çizelge 5.1: AURIS ile mevcut sistemlerin karşılaştırması.')
    para(doc,
        'AURIS\'in doğruluk değeri ticari sistemlerin '
        'gerisinde kalmaktadır; ancak bu karşılaştırma '
        'dikkatli yorumlanmalıdır. Ticari sistemler '
        'kapalı, muhtemelen çok daha büyük '
        've özenle küratörlü veri kümeleri '
        'üzerinde eğitilmiştir. '
        'Değerlendirme metodolojileri şeffaf '
        'değildir; %98,6 doğruluk iddiasının '
        'hangi test seti ve protokolle '
        'elde edildiği bilinmemektedir. '
        'Buna karşın AURIS; şeffaf 5 katlı '
        'çapraz doğrulama, gerçek dünya '
        'veri kümesi, ücretsiz erişim '
        've SHAP açıklanabilirliğiyle '
        'akademik güvenilirlik açısından '
        'rakipsiz bir konumdadır.')

    h2(doc, '5.5. Sistem Sınırlamaları')
    para(doc,
        'Çalışmanın sınırlamaları dürüstçe '
        'belgelenmelidir:')
    limits = [
        'Veri kümesi büyüklüğü: 5.195 örnek, ticari '
        'sistemlerle karşılaştırıldığında küçük kalmaktadır. '
        'Bazı üretim platformları (örn. ambient/lo-fi) için '
        'temsil yetersizliği söz konusu olabilir.',
        'Dağılım kayması: Konuşma sentezi gibi müzik-dışı '
        'AI ses içerikleri tespit edilememektedir; '
        'sistem müzik akustiği için optimize edilmiştir.',
        'Adversarial dayanıklılık: MP3 sıkıştırma, '
        'perde kaydırma ve zaman germe gibi '
        'basit ses işleme operasyonlarının '
        'tespit performansına etkisi '
        'Afchar vd. (2025)\'in bulgularıyla '
        'uyumlu olarak değerlendirilmemiştir.',
        'wav2vec2 CV metrikleri: İnce ayarlı wav2vec2 modeli '
        'nitel olarak doğrulanmış; ancak resmi '
        '5 katlı çapraz doğrulama '
        'metriği mevcut değildir.',
        'Tür önyargısı: Bazı türler (elektronik, lo-fi) '
        'yapay zekâ örnekleri arasında '
        'aşırı temsil edilmiş olabilir; '
        'tür tabanlı tabakalı değerlendirme '
        'gelecekte planlanmaktadır.',
    ]
    for l in limits:
        bullet(doc, '• ' + l)

    pb(doc)

    # ════════════════════════════════════════════════════════════════
    # 6. SONUÇLAR VE ÖNERİLER
    # ════════════════════════════════════════════════════════════════
    h1(doc, '6. SONUÇLAR VE ÖNERİLER')

    h2(doc, '6.1. Araştırma Sonuçlarının Özeti')
    para(doc,
        'Bu tez çalışmasında geliştirilen AURIS sistemi, '
        'yapay zekâ üretimi müzikleri insan bestelerinden '
        'otomatik olarak ayırt etmek için kapsamlı '
        'bir akustik öznitelik mühendisliği ve '
        'sistematik model karşılaştırma çerçevesi '
        'sunmaktadır. Elde edilen temel bulgular:')
    conclusions = [
        'LightGBM, 0,9549 ROC-AUC (±0,0023) ve '
        'Brier skoru 0,083 ile hem klasik ML '
        'hem DL modelleri arasında en yüksek '
        've en kararlı performansı sergilemiştir.',
        'Spektral düzlük standart sapması (spectral_flatness_std, '
        'önem: 0,0619) tek en güçlü ayrımcı özniteliktir; '
        'AI sentez süreçlerinin tonal homojenliğini '
        'yansıtmaktadır.',
        'Youden J eşik optimizasyonu (θ* = 0,4316), '
        'naif 0,50 eşiğine kıyasla '
        'daha dengeli hata profili sağlamıştır.',
        'Derin MLP (0,9537 AUC) LightGBM\'e yakın '
        'performans göstermiş; bu yakınlık, '
        '47 öznitelik vektörünün mevcut veri boyutunda '
        'kullanılabilir bilginin büyük bölümünü '
        'kodladığını göstermektedir.',
        'Kaynak bazında analiz, Suno (%93,0) ve Echoes '
        '(%88,6) üzerinde güçlü çapraz-üretici '
        'genelleme kapasitesi ortaya koymuştur.',
        'SHAP entegrasyonu, kapalı kaynak ticari '
        'rakiplerden farklılaştıran şeffaf ve '
        'yorumlanabilir karar mekanizması sunmaktadır.',
        'Tam yığın uygulama (web, mobil, API) sistemi '
        'akademik prototip sınırlarının ötesine '
        'taşımıştır.',
    ]
    for c in conclusions:
        bullet(doc, '• ' + c)

    h2(doc, '6.2. Gelecek Çalışma Önerileri')
    h3(doc, '6.2.1. Kısa Vadeli (0-6 Ay)')
    short_term = [
        'Veri kümesini 10.000+ örneğe genişletmek; '
        'yeni üreticileri (Sora Audio, Udio v2, vb.) dahil etmek;',
        'Görülmemiş üreticilerden oluşan bağımsız tutulan test seti '
        'ile çapraz-üretici genellemeyi resmi olarak değerlendirmek;',
        'wav2vec2 ince ayarı için resmi 5 katlı CV protokolü uygulamak;',
        'MP3 sıkıştırma, perde kaydırma ve zaman germe '
        'karşısında adversarial dayanıklılığı test etmek.',
    ]
    for s in short_term:
        bullet(doc, '• ' + s)

    h3(doc, '6.2.2. Orta Vadeli (6-18 Ay)')
    mid_term = [
        'Tür-tabakalı değerlendirme protokolü tasarlamak;',
        'Gradyan tabanlı öznitelik seçimi ile '
        '47\'den daha kompakt bir öznitelik vektörü elde etmek;',
        'iOS uygulaması geliştirme;',
        'Toplu analiz (batch processing) ve API hız sınırlama '
        'iyileştirmeleriyle üretim ortamı dayanıklılığını artırmak.',
    ]
    for m in mid_term:
        bullet(doc, '• ' + m)

    h3(doc, '6.2.3. Uzun Vadeli (18+ Ay)')
    long_term = [
        'Çok kipli analiz: ses + sözler + meta veri '
        'birleştirilerek hibrit tespit sistemi;',
        'Gerçek zamanlı yayın akışı analizi için '
        'akış tabanlı öznitelik çıkarma;',
        'Gizlilik koruyucu federe öğrenme ile '
        'sürekli model güncelleme;',
        'Tarayıcı uzantısı aracılığıyla uç cihaz dağıtımı.',
    ]
    for l in long_term:
        bullet(doc, '• ' + l)

    pb(doc)

    # ════════════════════════════════════════════════════════════════
    # 7. KAYNAKLAR
    # ════════════════════════════════════════════════════════════════
    h1(doc, '7. KAYNAKLAR')

    refs = [
        '[1] Afchar, D., Meseguer Brocal, G. ve Hennequin, R. (2025). AI-Generated Music Detection and Its Challenges. Proceedings of IEEE ICASSP 2025. IEEE. https://doi.org/10.48550/arXiv.2501.10111',
        '[2] Baevski, A., Zhou, Y., Mohamed, A. ve Auli, M. (2020). wav2vec 2.0: A Framework for Self-Supervised Learning of Speech Representations. Advances in Neural Information Processing Systems, 33, 12449–12460. https://doi.org/10.5555/3495724.3496768',
        '[3] Bhatt, A., Rajan, A. ve diğerleri. (2025). AI-Generated Music Detection: A Survey of Methods and Datasets. arXiv preprint. https://doi.org/10.48550/arXiv.2501.10111',
        '[4] Chen, T. ve Guestrin, C. (2016). XGBoost: A Scalable Tree Boosting System. Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining, s. 785–794. ACM.',
        '[5] Copet, J., Kreuk, F., Gat, I., Remez, T., Kant, D., Synnaeve, G., Adi, Y. ve Défossez, A. (2023). Simple and Controllable Music Generation. Advances in Neural Information Processing Systems, 36, 47704–47720. https://doi.org/10.48550/arXiv.2306.05284',
        '[6] Dhariwal, P., Jun, H., Payne, C., Kim, J. W., Radford, A. ve Sutskever, I. (2020). Jukebox: A Generative Model for Music. arXiv preprint arXiv:2005.00341. https://doi.org/10.48550/arXiv.2005.00341',
        '[7] Elizalde, B., Deshmukh, S., Al Ismail, M. ve Wang, H. (2023). CLAP: Learning Audio Concepts from Natural Language Supervision. Proceedings of ICASSP 2023, s. 1–5. IEEE. https://doi.org/10.1109/ICASSP49357.2023.10095889',
        '[8] Frank, J. ve Schönherr, L. (2021). WaveFake: A Data Set to Facilitate Audio Deepfake Detection. NeurIPS 2021 Datasets and Benchmarks Track. https://doi.org/10.5281/zenodo.5642694',
        '[9] Gan, R., Huang, T., Shao, J. ve Wang, F. (2024). Music Genre Classification Based on VMD-IWOA-XGBoost. Mathematics, 12(10), 1549. https://doi.org/10.3390/math12101549',
        '[10] Gourisaria, M. K., Agrawal, R. ve Sahni, M. (2024). Comparative Analysis of Audio Classification with MFCC and STFT Features Using Machine Learning Techniques. Discover Internet of Things, 4, Makale 1. https://doi.org/10.1007/s43926-023-00049-y',
        '[11] Ke, G., Meng, Q., Finley, T., Wang, T., Chen, W., Ma, W., Ye, Q. ve Liu, T. (2017). LightGBM: A Highly Efficient Gradient Boosting Decision Tree. Advances in Neural Information Processing Systems, 30.',
        '[12] Kosta, K., Meseguer Brocal, G., Afchar, D. ve Hennequin, R. (2025). Segment Transformer: AI-Generated Music Detection via Music Structural Analysis. arXiv preprint arXiv:2509.08283. https://doi.org/10.48550/arXiv.2509.08283',
        '[13] Kostrzewa, D., Mazur, W. ve Brzeski, R. (2022). Wide Ensembles of Neural Networks in Music Genre Classification. Proceedings of MISSI 2022, Lecture Notes in Networks and Systems, s. 91–102. Springer. https://doi.org/10.1007/978-3-031-08754-7_9',
        '[14] Liu, H., Chen, Z., Yuan, Y., Mei, X., Liu, X., Mandic, D., Wang, W. ve Plumbley, M. D. (2023). AudioLDM: Text-to-Audio Generation with Latent Diffusion Models. Proceedings of ICML 2023. https://doi.org/10.48550/arXiv.2301.12503',
        '[15] Liu, Y. ve diğerleri. (2024). From Audio Deepfake Detection to AI-Generated Music Detection: A Pathway and Overview. arXiv preprint. https://doi.org/10.48550/arXiv.2412.00571',
        '[16] Liu, Y., Yin, Y., Zhu, Q. ve Cui, W. (2022). Musical Instrument Recognition by XGBoost Combining Feature Fusion. arXiv preprint. https://doi.org/10.48550/arXiv.2206.00901',
        '[17] Lundberg, S. M. ve Lee, S. I. (2017). A Unified Approach to Interpreting Model Predictions. Advances in Neural Information Processing Systems, 30.',
        '[18] Martín-Doñas, J. M. ve Álvarez, A. (2022). The Vicomtech Audio Deepfake Detection System Based on Wav2vec2 for the 2022 ADD Challenge. Proceedings of ICASSP 2022, s. 9266–9270. IEEE. https://doi.org/10.1109/ICASSP43922.2022.9747768',
        '[19] McFee, B., Raffel, C., Liang, D., Ellis, D. P. W., McVicar, M., Battenberg, E. ve Nieto, O. (2015). librosa: Audio and Music Signal Analysis in Python. Proceedings of the 14th Python in Science Conference, s. 18–25.',
        '[20] Paszke, A. ve diğerleri. (2019). PyTorch: An Imperative Style, High-Performance Deep Learning Library. Advances in Neural Information Processing Systems, 32.',
        '[21] Pedregosa, F. ve diğerleri. (2011). Scikit-learn: Machine Learning in Python. Journal of Machine Learning Research, 12, 2825–2830.',
        '[22] Wu, Y., Chen, K., Zhang, T., Hui, Y., Berg-Kirkpatrick, T. ve Dubnov, S. (2023). Large-Scale Contrastive Language-Audio Pretraining with Feature Fusion and Keyword-to-Caption Augmentation. Proceedings of ICASSP 2023, s. 1–5. IEEE. https://doi.org/10.1109/ICASSP49357.2023.10095969',
        '[23] Yi, J., Fu, R., Tao, J., Nie, S., Ma, H., Wang, C., Wang, T., Tian, Z., Bai, Y. ve Fan, C. (2022). ADD 2022: The First Audio Deep Synthesis Detection Challenge. Proceedings of ICASSP 2022, s. 9216–9220. IEEE. https://doi.org/10.1109/ICASSP43922.2022.9746939',
        '[24] Yi, J., Wang, C., Tao, J., Zhang, X., Zhang, C. Y. ve Zhao, Y. (2023). Audio Deepfake Detection: A Survey. arXiv preprint. https://doi.org/10.48550/arXiv.2308.14970',
    ]
    for r in refs:
        para(doc, r)

    pb(doc)

    # ════════════════════════════════════════════════════════════════
    # 8. EKLER
    # ════════════════════════════════════════════════════════════════
    h1(doc, '8. EKLER')
    doc.add_paragraph('8.1. Ek 1: AURIS 47 Öznitelik Tam Listesi', style='Heading 2')
    tablo(doc,
        ['#', 'Öznitelik', 'Kategori', 'Tanım'],
        [
            ['1','spectral_centroid_mean','Spektral','Ağırlıklı frekans merkezi ort. (Hz)'],
            ['2','spectral_centroid_std','Spektral','Ağırlıklı frekans merkezi std.'],
            ['3','spectral_bandwidth_mean','Spektral','Spektral bant genişliği ort.'],
            ['4','spectral_bandwidth_std','Spektral','Spektral bant genişliği std.'],
            ['5','spectral_flatness_mean','Spektral','Gürültü/ton oranı ort. (0-1)'],
            ['6','spectral_flatness_std','Spektral','Gürültü/ton oranı std. (EN GÜÇLÜ)'],
            ['7','spectral_rolloff_mean','Spektral','Rolloff frekansı ort.'],
            ['8','spectral_rolloff_std','Spektral','Rolloff frekansı std.'],
            ['9','spectral_contrast_mean','Spektral','Harmonik/gürültü kontrast ort.'],
            ['10','spectral_contrast_std','Spektral','Harmonik/gürültü kontrast std.'],
            ['11','mfcc_variance','Spektral','13 MFCC katsayısı varyansı'],
            ['12','mfcc_delta_var','Spektral','1. türev MFCC varyansı'],
            ['13','mfcc_delta2_var','Spektral','2. türev MFCC varyansı'],
            ['14','mel_flatness','Spektral','Mel spektrogram zamansal düzlüğü'],
            ['15','spectral_regularity','Spektral','Spektral düzenlilik endeksi'],
            ['16','harmonic_structure','Spektral','Harmonik yapı skoru'],
            ['17','tempo_bpm','Ritmik','Tempo (vuruş/dakika)'],
            ['18','tempo_stability','Ritmik','Tempo stabilitesi'],
            ['19','tempo_cv','Ritmik','Tempo varyasyon katsayısı'],
            ['20','beat_count','Ritmik','Tespit edilen toplam vuruş'],
            ['21','onset_strength_mean','Ritmik','Onset güç ort.'],
            ['22','onset_strength_std','Ritmik','Onset güç std.'],
            ['23','rms_energy','Zamansal','RMS enerji ort.'],
            ['24','rms_std','Zamansal','RMS enerji std.'],
            ['25','rms_dynamic_range','Zamansal','RMS dinamik aralık'],
            ['26','zero_crossing_rate','Zamansal','Sıfır geçiş oranı ort.'],
            ['27','zero_crossing_std','Zamansal','Sıfır geçiş oranı std.'],
            ['28','temporal_patterns','Zamansal','Zamansal örüntü skoru'],
            ['29','chroma_entropy','Harmonik','Chroma entropi'],
            ['30','chroma_std','Harmonik','Chroma std.'],
            ['31','chroma_transition_rate','Harmonik','Chroma geçiş hızı'],
            ['32','tonnetz_std','Harmonik','Tonnetz tonal varyasyon std.'],
            ['33','harmonic_ratio','Harmonik','Harmonik/perküsif enerji oranı'],
            ['34','vocal_energy_ratio','Vokal','Vokal enerji oranı'],
            ['35','vocal_harmonic_ratio','Vokal','Vokal harmonik oranı'],
            ['36','vocal_confidence','Vokal','Vokal tespit güveni (0-1)'],
            ['37','has_vocals','Vokal','Vokal varlık bayrağı (0/1)'],
            ['38','pitch_mean_hz','Vokal','Perde ortalaması (Hz)'],
            ['39','pitch_std_cents','Vokal','Perde standart sapması (cent)'],
            ['40','pitch_stability_score','Vokal','Perde stabilitesi skoru'],
            ['41','vibrato_rate_hz','Vokal','Vibrato hızı (Hz)'],
            ['42','vibrato_extent_cents','Vokal','Vibrato genliği (cent)'],
            ['43','vibrato_regularity_score','Vokal','Vibrato düzenlilik skoru'],
            ['44','formant_consistency_score','Vokal','Formant tutarlılık skoru'],
            ['45','breath_pattern_score','Vokal','Nefes örüntüsü skoru'],
            ['46','vocal_texture_score','Vokal','Vokal doku skoru'],
            ['47','vocal_ai_score','Vokal','Bileşik vokal AI endeksi'],
        ],
        col_widths=[0.8, 5.0, 2.5, 7.7])
    tablo_yazisi(doc, 'Çizelge 8.1: AURIS 47 öznitelik tam listesi.')

    doc.add_paragraph('8.2. Ek 2: Sistem Gereksinimleri', style='Heading 2')
    tablo(doc,
        ['Bileşen', 'Gereksinim'],
        [
            ['Python', '3.11 veya üzeri'],
            ['Node.js', '20.18.1 veya üzeri'],
            ['Android SDK', 'API 26+ (Android 8.0 Oreo)'],
            ['RAM', 'Minimum 8 GB (model çıkarım için)'],
            ['Disk', '~500 MB (eğitilmiş model dosyaları)'],
            ['Arka uç port', '7860 (HuggingFace Spaces varsayılanı)'],
            ['Web port', '3000 (geliştirme sunucusu)'],
        ],
        col_widths=[5.0, 11.0])
    tablo_yazisi(doc, 'Çizelge 8.2: Sistem gereksinimleri özeti.')

    pb(doc)

    # ÖZGEÇMİŞ
    h1(doc, 'ÖZGEÇMİŞ')
    para(doc, 'Hasan Arthur ALTUNTAŞ', style='Heading 2')
    para(doc,
        '2002 yılında doğan Hasan Arthur Altuntaş, '
        'Düzce Üniversitesi Bilgisayar Mühendisliği '
        'bölümünde 2020-2026 yılları arasında lisans '
        'eğitimini tamamlamıştır. Akademik çalışmaları '
        'boyunca makine öğrenmesi, ses işleme, '
        'açıklanabilir yapay zekâ ve çok platformlu '
        'uygulama geliştirme alanlarına odaklanmıştır.')
    para(doc,
        'AURIS projesi; web (Next.js 14/TypeScript), '
        'mobil (Kotlin/Jetpack Compose) ve bulut '
        '(Python/FastAPI/HuggingFace Spaces) '
        'katmanlarıyla tam yığın bir mimaride '
        'hayata geçirilen, yapay zekâ müzik tespiti '
        'alanında özgün bir akademik ve mühendislik '
        'katkısıdır. Çalışma, GUJSA '
        '(Gazi Üniversitesi Fen Bilimleri Dergisi A) '
        'dergisine makale olarak da gönderilmiştir.')
    para(doc, 'E-posta: hasannarthurrr@gmail.com')
    para(doc, 'GitHub: github.com/Rtur2003')

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    doc.save(OUT)
    print(f"[OK] {OUT}")


if __name__ == '__main__':
    build()
