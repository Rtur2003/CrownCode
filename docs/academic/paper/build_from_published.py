"""
AURIS makalesini _template_published.docx (Talha hocanın yayımlanmış
makalesi) üzerine BİREBİR YAZAR.

Yaklaşım: Paragrafların içeriğini değiştir, stil/section/kolon dokunma.
İçerik haritası önceki incelemeden belli:
- P1: EN başlık
- P2: EN yazar
- P3-4: EN kurum
- P9-11: EN highlight bullets
- P14-18: EN keywords
- P21-24: EN article info (Received/Accepted/DOI)
- P26-28: EN correspondence
- P29: EN purpose paragrafı
- P31: Figure A caption (Graphical Abstract)
- P32: Purpose: ...
- P33: Theory and Methods: ...
- P34: Results: ...
- P35: Conclusion: ...
- P38: TR başlık
- P39: TR yazar
- P40-41: TR kurum
- P45-47: TR highlight bullets
- P52-55: TR article info
- P56-59: TR keywords
- P60-61: TR öz
- P64: EN başlık tekrar (sayfa 3)
- P67-69: EN bullets tekrar
- P77-79: EN keywords tekrar
- P80: EN abstract uzun
- P87: corresponding
- P91+: ana içerik başlıyor

Stratejik: paragraf indeksleri üzerinden gidiyoruz, her birinin runs'ını
silip yeni run ekliyoruz, böylece stil/section/kolon her şey korunur.
"""
from pathlib import Path
from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

HERE     = Path(__file__).resolve().parent
SRC      = HERE / "_template_published.docx"
OUT      = HERE / "deliverables" / "AURIS_Makale_Metni.docx"
FIGURES  = HERE.parent / "figures"
OUT.parent.mkdir(parents=True, exist_ok=True)


def _set_font_basic(run, *, name="Times New Roman"):
    """Font tipini koru ama mevcut stilin diğer özelliklerini bozma."""
    run.font.name = name
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.append(rFonts)
    for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        rFonts.set(qn(attr), name)


def replace_text(p, new_text):
    """Paragrafın TÜM run'larını sil, yeni tek bir run ekle (stil paragrafın kalır)."""
    # Mevcut run'ları sil
    for r in list(p.runs):
        r._element.getparent().remove(r._element)
    # Yeni run ekle — stil paragrafın kendi pPr'sinden gelir
    r = p.add_run(new_text)
    _set_font_basic(r)
    return r


def replace_text_keep_format(p, new_text):
    """Aynı şekilde ama ilk run'ın font özelliklerini koru."""
    # Mevcut formatı tut
    keep_bold = None
    keep_italic = None
    keep_size = None
    if p.runs:
        first = p.runs[0]
        keep_bold = first.font.bold
        keep_italic = first.font.italic
        keep_size = first.font.size

    for r in list(p.runs):
        r._element.getparent().remove(r._element)
    r = p.add_run(new_text)
    _set_font_basic(r)
    if keep_bold is not None: r.font.bold = keep_bold
    if keep_italic is not None: r.font.italic = keep_italic
    if keep_size is not None: r.font.size = keep_size
    return r


def main():
    doc = Document(str(SRC))
    P = doc.paragraphs

    # ═══════════════════════════════════════════════════════════════
    # ENGLISH KAPAK SAYFASI (P1-P35)
    # ═══════════════════════════════════════════════════════════════

    # P1: EN başlık
    replace_text_keep_format(P[1],
        "AURIS: A multi-model ensemble approach for the detection of "
        "AI-generated music")

    # P2: EN yazar
    replace_text_keep_format(P[2], "Hasan Arthur Altuntaş1,*")

    # P3-4: EN kurum (sadece 1 kurum var, 2.yi sil)
    replace_text_keep_format(P[3],
        "1Department of Computer Engineering, Faculty of Engineering, "
        "Düzce University, 81620, Düzce, Türkiye")
    replace_text_keep_format(P[4], "")

    # P9-11: EN highlight bullets
    replace_text_keep_format(P[9],
        "Proposed AURIS: end-to-end AI-generated music detection with "
        "47-dimensional feature vector and 11-model ensemble")
    replace_text_keep_format(P[10],
        "Achieved 95.48% ROC-AUC with LightGBM and ±0.0023 cross-fold "
        "standard deviation on 5,195-sample dataset")
    replace_text_keep_format(P[11],
        "Spectral flatness standard deviation identified as most "
        "informative feature for AI vs. human music distinction")

    # P14-18: EN keywords
    replace_text_keep_format(P[14], "AI-generated music")
    replace_text_keep_format(P[15], "Deep learning")
    replace_text_keep_format(P[16], "Gradient boosting")
    replace_text_keep_format(P[17], "Ensemble learning")
    replace_text_keep_format(P[18], "Spectral flatness")

    # P21-24: Article Info (Received/Accepted/DOI)
    replace_text_keep_format(P[21], "Research Article Received: dd.mm.yyyy")
    replace_text_keep_format(P[22], "Accepted: dd.mm.yyyy")
    replace_text_keep_format(P[23], "DOI:")
    replace_text_keep_format(P[24], "")

    # P26-28: Correspondence
    replace_text_keep_format(P[26], "Correspondence:  Author: Hasan Arthur Altuntaş")
    replace_text_keep_format(P[27], "e-mail:")
    replace_text_keep_format(P[28], "hasannarthurrr@gmail.com  ORCID: 0009-0002-8302-7657")

    # P29: EN abstract kısa (Talha'da uzun bir özet vardı)
    replace_text_keep_format(P[29],
        "The proliferation of text-to-music generators such as Suno, Udio "
        "and MusicGen has created a detection problem of practical "
        "importance for copyright attribution, streaming-platform integrity "
        "and artist economics. This paper proposes AURIS, a system that "
        "couples a 47-dimensional handcrafted acoustic feature vector with "
        "an ensemble of eleven classifiers. The models are trained on a "
        "dataset of 5,195 samples drawn from twelve AI generation systems "
        "and multiple human sources (GTZAN, FMA, SleepyJesse covers) under "
        "5-fold cross-validation. LightGBM achieves the top ROC-AUC of "
        "0.9548 (±0.0023). Spectral-flatness standard deviation ranks "
        "first in feature importance. A Youden-J optimised threshold of "
        "θ* = 0.4316 improves balanced accuracy. The architecture of "
        "AURIS is presented in Figure A.")

    # P31: Figure A caption
    replace_text_keep_format(P[31],
        "Figure A. An overview of the proposed AURIS system pipeline")

    # P32: Purpose
    replace_text_keep_format(P[32],
        "Purpose: The widespread diffusion of text-to-music generators "
        "such as Suno, Udio and MusicGen has raised a detection problem "
        "of practical importance for copyright attribution, "
        "streaming-platform integrity and artist economics. This study "
        "aims to design an end-to-end system that distinguishes "
        "AI-generated music from human composition with competitive "
        "accuracy and operational interpretability.")

    # P33: Theory and Methods
    replace_text_keep_format(P[33],
        "Theory and Methods: A 47-dimensional acoustic feature vector "
        "covering spectral, temporal, harmonic-tonal, MFCC and vocal "
        "families is extracted using librosa. An ensemble of eleven "
        "classifiers (seven ML and four DL architectures) is trained on "
        "5,195 samples from twelve AI generation systems and multiple "
        "human sources under stratified 5-fold cross-validation. "
        "Youden-J optimisation is used for threshold selection; SHAP "
        "analysis for interpretability.")

    # P34: Results
    replace_text_keep_format(P[34],
        "Results: LightGBM achieves the highest mean ROC-AUC at 0.9548 "
        "with the lowest fold-to-fold standard deviation (±0.0023) in "
        "the entire pool. Deep MLP follows narrowly at 0.9542. "
        "Spectral-flatness standard deviation ranks first in feature "
        "importance. The Youden-optimal threshold θ* = 0.4316 yields a "
        "balanced confusion matrix with 89.4% AI sensitivity and 87.4% "
        "human specificity. A Brier score of 0.083 confirms "
        "well-calibrated probabilities.")

    # P35: Conclusion
    replace_text_keep_format(P[35],
        "Conclusion: The proposed AURIS system demonstrates that a "
        "handcrafted feature vector combined with a heterogeneous "
        "ensemble is competitive with deep-learning alternatives for "
        "AI-generated music detection, while remaining interpretable "
        "and deployable on consumer hardware.")

    # ═══════════════════════════════════════════════════════════════
    # TÜRKÇE KAPAK SAYFASI (P38-P61)
    # ═══════════════════════════════════════════════════════════════

    # P38: TR başlık
    replace_text_keep_format(P[38],
        "AURIS: Çoklu-model topluluk yaklaşımı ile yapay zekâ "
        "tarafından üretilen müziklerin tespiti")

    # P39: TR yazar
    replace_text_keep_format(P[39], "Hasan Arthur Altuntaş1,*")

    # P40-41: TR kurum
    replace_text_keep_format(P[40],
        "1Düzce Üniversitesi, Mühendislik Fakültesi, Bilgisayar "
        "Mühendisliği Bölümü, 81620, Düzce, Türkiye")
    replace_text_keep_format(P[41], "")

    # P45-47: TR highlight bullets
    replace_text_keep_format(P[45],
        "5.195 örneklik veri kümesi üzerinde 47 boyutlu öznitelik vektörü "
        "ile uçtan-uca GenAI müzik tespit sistemi önerildi")
    replace_text_keep_format(P[46],
        "LightGBM %95,48 ROC-AUC ve ±0,0023 katlar-arası standart sapma "
        "ile en başarılı modeli oluşturdu")
    replace_text_keep_format(P[47],
        "Spektral düzlük standart sapması yapay zekâ-insan ayrımı için "
        "en bilgilendirici öznitelik olarak tespit edildi")

    # P52-55: Article Info (TR)
    replace_text_keep_format(P[52], "Araştırma Makalesi Geliş: gg.aa.yyyy")
    replace_text_keep_format(P[53], "Kabul: gg.aa.yyyy")
    replace_text_keep_format(P[54], "DOI:")
    replace_text_keep_format(P[55], "")

    # P56-59: Anahtar kelimeler
    replace_text_keep_format(P[56],
        "Anahtar Kelimeler:  Yapay zekâ tarafından üretilen müzik,")
    replace_text_keep_format(P[57], "derin öğrenme,")
    replace_text_keep_format(P[58], "gradyan artırma,")
    replace_text_keep_format(P[59], "topluluk öğrenmesi, spektral düzlük")

    # P60-61: TR öz
    replace_text_keep_format(P[60],
        "Üretken Yapay Zekâ (Generative Artificial Intelligence-GenAI) "
        "tabanlı metinden müziğe (text-to-music) üretim sistemlerinin "
        "son üç yıl içerisindeki hızlı yaygınlaşması, üretilen müzik "
        "parçalarının insan eliyle bestelenmiş kayıtlardan ayırt "
        "edilmesini bir tespit problemi olarak gündeme getirmiştir. Bu "
        "çalışmada, 47 boyutlu elle tasarlanmış bir akustik öznitelik "
        "vektörü ile yedi makine öğrenmesi ve dört derin öğrenme "
        "algoritmasından oluşan on bir modelli bir topluluk öğrenmesi "
        "yaklaşımını birleştiren AURIS adlı yenilikçi bir sistem "
        "önerilmektedir. Modeller, on iki veya daha fazla GenAI üretici "
        "sisteminden ve birden çok insan kaynağından (GTZAN, FMA, "
        "SleepyJesse kapakları) derlenen 5.195 örneklik bir veri kümesi "
        "üzerinde 5-katlı çapraz doğrulama ile eğitilmiştir.")
    replace_text_keep_format(P[61],
        "LightGBM, %95,48 ROC-AUC ve ±0,0023 standart sapma ile hem en "
        "yüksek ortalama hem de katlar-arası en düşük varyansı bir araya "
        "getirerek en başarılı sonucu elde etmiştir. Spektral düzlük "
        "standart sapması özniteliği, öznitelik önem sıralamasında ilk "
        "sırayı belirgin bir farkla almıştır. Youden J kriteri ile "
        "optimize edilen θ* = 0,4316 karar eşiği, varsayılan 0,5 eşiğine "
        "kıyasla dengeli doğruluğu sistematik biçimde iyileştirmiştir. "
        "Brier skoru 0,083 olarak ölçülmüş ve modelin olasılık "
        "çıktılarının iyi kalibre olduğu doğrulanmıştır.")

    # ═══════════════════════════════════════════════════════════════
    # 3. SAYFA - EN tekrarı (P64-P80)
    # ═══════════════════════════════════════════════════════════════

    replace_text_keep_format(P[64],
        "AURIS: A multi-model ensemble approach for the detection of "
        "AI-generated music")

    replace_text_keep_format(P[67],
        "Proposed AURIS: end-to-end AI-generated music detection")
    replace_text_keep_format(P[68],
        "Achieved 95.48% ROC-AUC with LightGBM and ±0.0023 cross-fold std")
    replace_text_keep_format(P[69],
        "Spectral flatness identified as most informative feature")

    replace_text_keep_format(P[73], "Research Article Received: dd.mm.yyyy")
    replace_text_keep_format(P[74], "Accepted: dd.mm.yyyy")
    replace_text_keep_format(P[75], "DOI:")
    replace_text_keep_format(P[76], "")
    replace_text_keep_format(P[77], "Keywords:  AI-generated music,")
    replace_text_keep_format(P[78], "deep learning, gradient boosting,")
    replace_text_keep_format(P[79], "ensemble learning, spectral flatness")
    replace_text_keep_format(P[80],
        "The proliferation of text-to-music generators such as Suno, Udio "
        "and MusicGen has raised a detection problem of practical "
        "importance for copyright attribution and streaming-platform "
        "integrity. This paper proposes AURIS, a system coupling a "
        "47-dimensional handcrafted acoustic feature vector with an "
        "ensemble of eleven classifiers. The models are trained on 5,195 "
        "samples from twelve AI generation systems and multiple human "
        "sources (GTZAN, FMA, SleepyJesse covers) under 5-fold "
        "cross-validation. LightGBM achieves the top ROC-AUC of 0.9548 "
        "with ±0.0023 cross-fold variance, combining the best mean with "
        "the lowest variance in the pool; Deep MLP follows narrowly at "
        "0.9542. Spectral-flatness standard deviation ranks first in "
        "feature importance. A Youden-J optimised threshold of "
        "θ* = 0.4316 improves balanced accuracy over the default 0.5 "
        "cutoff. A Brier score of 0.083 confirms that the probability "
        "outputs are well calibrated. Diagnostic analysis shows an 8-14 "
        "point train-CV accuracy gap for all tree-based models and "
        "reveals that roughly 17 of the 47 features contribute no "
        "measurable accuracy.")

    # P87: corresponding author
    replace_text_keep_format(P[87],
        "*Sorumlu Yazar / *Corresponding Author: "
        "hasannarthurrr@gmail.com / Tel: +90 — / "
        "ORCID: 0009-0002-8302-7657")

    # ═══════════════════════════════════════════════════════════════
    # ANA İÇERİK - P91+ (1. Giriş başlığı)
    # Talha hocadaki tüm "Giriş, İlgili Çalışmalar, Materyal..." paragraflarını
    # AURIS içeriği ile değiştir.
    # ═══════════════════════════════════════════════════════════════

    # P91: 1. Giriş başlığı (zaten "Giriş (Introduction)" — sadece numara ekle)
    replace_text_keep_format(P[91], "1. Giriş (Introduction)")

    # P93: Giriş 1. paragraf
    replace_text_keep_format(P[93],
        "Üretken Yapay Zekâ (Generative Artificial Intelligence-GenAI) "
        "sistemlerinin son üç yıl içerisinde araştırma laboratuvarlarından "
        "tüketici uygulamalarına doğru yaşadığı hızlı geçiş, metinden "
        "müziğe (text-to-music) üretim alanında belirgin bir dönüşümü "
        "beraberinde getirmiştir. Suno (sürüm 3-5), Udio, Meta tarafından "
        "geliştirilen MusicGen [1] sistemi ve AudioLDM [2] gibi difüzyon "
        "tabanlı modeller, kullanıcının sağladığı kısa bir metin istemi "
        "ile dakikalar mertebesinde tam uzunlukta müzik parçaları "
        "üretebilme kapasitesine ulaşmıştır. Üretilen bu parçaların, "
        "deneyimsiz bir dinleyici tarafından insan eliyle bestelenmiş "
        "kayıtlardan ayırt edilmesi çoğu durumda mümkün olmamaktadır. "
        "Konuşma için ses derin sahte tespiti ADD 2022 [3] yarışmaları "
        "ve WaveFake [4] gibi büyük ölçekli veri kümeleri sayesinde "
        "aktif bir araştırma alanı hâline gelmiştir. Buna karşın, "
        "GenAI ile üretilen müziğin tespiti henüz benzer bir olgunluğa "
        "ulaşamamıştır.")

    replace_text_keep_format(P[94],
        "Bu çalışmada önerilen AURIS sistemi, 47 boyutlu elle "
        "tasarlanmış bir öznitelik vektörü ile kasıtlı biçimde heterojen "
        "on bir sınıflandırıcıdan oluşan bir topluluğu birleştirmektedir. "
        "Çalışmanın temel katkıları şunlardır: (𝑖) on iki GenAI "
        "üreticisinden ve birden çok insan kaynağından derlenen 5.195 "
        "örneklik halka açık bir veri kümesi; (𝑖𝑖) yedi ML ve dört DL "
        "algoritmasının ortak bir 5-katlı çapraz doğrulama protokolü "
        "altında karşılaştırmalı değerlendirilmesi; (𝑖𝑖𝑖) spektral "
        "düzlük standart sapmasının en bilgilendirici öznitelik olduğunu "
        "gösteren SHAP [11] tabanlı yorumlanabilirlik analizi. Bu "
        "makalenin geri kalanı şu şekilde yapılandırılmıştır: 2. Bölüm "
        "ilgili çalışmaları tarar; 3. Bölüm önerilen sistemin materyal "
        "ve yöntemini tanımlar; 4. Bölüm deneysel sonuçları sunar; "
        "5. Bölüm makaleyi sonlandırır.")

    # P95: "2. İlgili Çalışmalar (Related Works)"
    replace_text_keep_format(P[95], "2. İlgili Çalışmalar (Related Works)")

    # P96: 2. Bölüm açılış paragrafı
    replace_text_keep_format(P[96],
        "Bu alanda yapılan çalışmalar üç gruba ayrılarak incelenmiştir: "
        "(𝑖) konuşma için ses derin sahte tespiti, (𝑖𝑖) Dönüştürücü "
        "(Transformer) tabanlı ses temsilleri ve (𝑖𝑖𝑖) ses için "
        "topluluk öğrenmesi yöntemleri. Her grupta seçilen bazı "
        "çalışmalar ilgili bölümlerde özetlenmiştir. AURIS ile "
        "karşılaştırma amacıyla ilgili çalışmaların genel bakışı Tablo "
        "1'de sunulmuştur.")

    # P97: 2.1. başlık
    replace_text_keep_format(P[97],
        "2.1. Konuşma için ses derin sahte tespiti")
    replace_text_keep_format(P[98], "(Audio deepfake detection for speech)")

    # P100: 2.1 paragraf 1
    replace_text_keep_format(P[100],
        "Konuşma için ses derin sahte tespiti, GenAI ile üretilen müzik "
        "tespiti çalışmaları açısından doğrudan örnek alınan en olgun "
        "komşu alanı oluşturmaktadır. Yi vd. tarafından öne sürülen ADD "
        "2022 [3] yarışmasında, bu alan resmî biçimde bir topluluk "
        "değerlendirme problemi olarak kurulmuş; düşük kaliteli sahte "
        "ses, kısmî sahte ses ve oyun tabanlı algılama olmak üzere üç "
        "ayrı parça tanımlanmıştır.")

    replace_text_keep_format(P[101],
        "Martín-Doñas ve Álvarez tarafından öne sürülen Vicomtech "
        "sistemi [12], önceden eğitilmiş wav2vec2 [13] öznitelik "
        "çıkarıcısının üzerine bir sınıflandırma başlığı yerleştirerek "
        "bu yarışmada güçlü bir performans elde etmiştir. Frank ve "
        "Schönherr tarafından öne sürülen WaveFake [4] gibi büyük "
        "ölçekli veri kümeleri, vokoder-spesifik artefaktların tespit "
        "edilebilirliğinin sistematik biçimde incelenmesi için altyapı "
        "oluşturmuştur. Yi vd. [6] tarafından yürütülen kapsamlı tarama "
        "çalışması ise alanın hem teknik hem de etik zorluklarını "
        "ayrıntılı biçimde özetlemiştir.")

    replace_text_keep_format(P[102],
        "Afchar vd. tarafından öne sürülen çalışmada [7], oto-kodlayıcı "
        "artefaktlarını tanımak amacıyla eğitilen bir tespit sisteminin, "
        "nöral vokoderlerin bıraktığı spektral kalıntıları kullanarak "
        "%99,8 doğruluk değerine ulaşabildiği gösterilmiştir; ancak aynı "
        "sistemin, MP3 sıkıştırma ve perde kaydırma gibi basit ses "
        "manipülasyonları altında performansının ciddi biçimde düştüğü "
        "raporlanmıştır.")

    replace_text_keep_format(P[103],
        "Kim ve Go [8] tarafından öne sürülen Segment Transformer, kısa "
        "müzik segmentlerini önceden eğitilmiş bir kodlayıcı ile gömüp "
        "bunları bir Dönüştürücü başlığı ile birleştirerek bir müzik "
        "parçasının tamamındaki yapısal örüntüleri yakalamaktadır. "
        "Rahman vd. tarafından geliştirilen SONICS veri kümesi [23], "
        "97.000'den fazla şarkı ve 49.000'den fazla Suno/Udio kaynaklı "
        "sentetik şarkı içermekte ve uçtan-uca sentetik şarkı tespiti "
        "için geniş ölçekli bir referans kıyaslama oluşturmaktadır.")

    replace_text_keep_format(P[107],
        "Comanducci vd. [24] tarafından geliştirilen FakeMusicCaps veri "
        "kümesi, beş farklı metinden-müziğe modeli ile yeniden üretilmiş "
        "MusicCaps eşlemelerinden oluşmakta ve hem tespit hem de "
        "atıflandırma deneyleri için temel sağlamaktadır. Pascu vd. "
        "tarafından öne sürülen Echoes [25] veri kümesi, on farklı "
        "popüler GenAI müzik üretim sistemi tarafından üretilen "
        "anlamsal-hizalı içeriği kapsamaktadır.")

    replace_text_keep_format(P[108],
        "Sunday [26] FakeMusicCaps üzerinde CNN tabanlı tespit "
        "yaklaşımının tempo gerdirme ve perde kaydırma altındaki "
        "performansını ölçmüş; Sroka vd. tarafından öne sürülen "
        "çalışmada [27] ise ses büyütmeleri altında sahte müzik tespit "
        "performansının sistematik biçimde değerlendirilmesi "
        "gerçekleştirilmiştir. Bu çalışmaların ortak bulgusu, hiçbir "
        "tek mimari ailesinin hem üretici modeller arası genellemeyi "
        "hem de düşmanca güçlendirilmiş sinyallere karşı sağlamlığı "
        "tek başına sağlayamadığıdır.")

    # P109-112: Diğer paragraflar - boş bırak veya devamı
    replace_text_keep_format(P[109],
        "Li vd. tarafından yayımlanan yol haritası çalışması [5], ses "
        "derin sahte tespiti metodolojisini GenAI müzik tespiti alanına "
        "bağlamakta ve üretici modeller arası genellemeyi alanın "
        "birincil açık problemi olarak vurgulamaktadır. Bu literatür "
        "değerlendirmesi, AURIS sisteminin tasarımındaki çeşitlilik "
        "vurgusunu doğrudan motive etmektedir.")

    # P110-112: Daha az kritik - kısaca temizle
    replace_text_keep_format(P[110],
        "Yapılan literatür incelemesi, çoklu üretici sistemleri kapsayan "
        "ve farklı sınıflandırıcı mimarilerini bir araya getiren "
        "topluluk yaklaşımlarının cross-generator genellemede umut "
        "verici sonuçlar verebileceğini göstermektedir.")

    replace_text_keep_format(P[111], "")
    replace_text_keep_format(P[112], "")

    # P114, P116: kalan paragraflar - boşalt
    replace_text_keep_format(P[114], "")
    replace_text_keep_format(P[116], "")

    # P118: 2.2. başlık
    replace_text_keep_format(P[118],
        "2.2. Ses için topluluk yöntemleri ve gradyan artırma")
    replace_text_keep_format(P[119],
        "(Ensemble methods and gradient boosting for audio)")

    # P121: 2.2 paragraf
    replace_text_keep_format(P[121],
        "Topluluk öğrenmesi (ensemble learning) yöntemleri, ses "
        "sınıflandırma alanında istikrarlı biçimde rekabetçi sonuçlar "
        "üretmektedir. Liu vd. tarafından öne sürülen çalışmada [16], "
        "XGBoost tabanlı bir müzikal enstrüman tanıma sisteminin çoklu "
        "öznitelik füzyonu ile yüksek doğruluğa ulaşabildiği "
        "gösterilmiştir. Gan vd. [17], VMD ve IWOA ile zenginleştirilen "
        "XGBoost modelinin GTZAN ve Bangla veri kümeleri üzerinde diğer "
        "modelleri beş değerlendirme kriterinde geride bıraktığını "
        "raporlamıştır.")

    # P123: Tablo 1 caption
    replace_text_keep_format(P[123],
        "Tablo 1. İlgili çalışmalara genel bakış (Overview of related works)")

    # P128, P130-133: ek paragraflar
    replace_text_keep_format(P[128],
        "Türkçe literatür kapsamında, Hızlısoy ve Tüfekci [18] derin "
        "öğrenme tabanlı bir mimari ile Türkçe müziklerin tür "
        "sınıflandırması üzerinde çalışmıştır. Özbalcı vd. [19], GTZAN "
        "veri kümesi üzerinde Rastgele Orman, SVM ve Yapay Sinir Ağı "
        "algoritmalarını karşılaştırmalı olarak değerlendirerek "
        "Rastgele Orman ile %81 doğruluk değerine ulaşmıştır. Turan ve "
        "Polat [20] ise yarı denetimli makine öğrenmesi yöntemleri ile "
        "müzik türlerinin tespiti üzerine çalışmıştır.")

    replace_text_keep_format(P[130],
        "Kostrzewa vd. [21] geniş sinir ağı toplulukları yaklaşımı "
        "önermiş; Gourisaria vd. [22] ise Mel Frekans Kepstral Katsayıları "
        "(MFCC) ve Kısa Süreli Fourier Dönüşümü (STFT) özniteliklerini "
        "karşılaştırmalı olarak incelemiştir.")

    replace_text_keep_format(P[131],
        "Baevski vd. tarafından öne sürülen çalışmada [13], ham ses "
        "sinyalinden ince ayar gerektirmeyen öznitelikler üreten "
        "wav2vec 2.0 mimarisi sunulmuştur. Elizalde vd. [14] CLAP "
        "(Contrastive Language-Audio Pretraining) yöntemini önermiş; "
        "Wu vd. [15] büyük ölçekli CLAP varyantını 633.526 ses-metin "
        "çiftinden öğrenmiştir.")

    replace_text_keep_format(P[132],
        "Copet vd. tarafından geliştirilen MusicGen [1] sistemi, metne "
        "koşullu sıkıştırılmış ses andıçları üzerinde çalışan tek "
        "aşamalı bir Dönüştürücü dil modeli kullanmaktadır. Liu vd. "
        "[2] tarafından öne sürülen AudioLDM ise metinden sese üretim "
        "için CLAP gömmelerini koşullandırma sinyali olarak kullanan "
        "bir gizil difüzyon modelidir.")

    replace_text_keep_format(P[133], "")

    # P134: 3. Materyal ve Yöntem başlığı
    replace_text_keep_format(P[134], "3. Materyal ve Yöntem (Material and Method)")

    # P136: 3. açılış
    replace_text_keep_format(P[136],
        "Bu bölümde önerilen AURIS sistemini geliştirmek için kullanılan "
        "materyal ve yöntemler özetlenmiştir. Alt bölümlerde sırasıyla "
        "(𝑖) kullanılan veri kümesi, (𝑖𝑖) öznitelik çıkarma boru hattı, "
        "(𝑖𝑖𝑖) sınıflandırma modelleri ve (𝑖𝑣) eğitim protokolü ile "
        "karar eşiği optimizasyonu detaylandırılmaktadır.")

    # P137: 3.1. başlık - Talha'da "Yazılım Yığını" — biz "Veri Kümesi" diyeceğiz
    replace_text_keep_format(P[137], "3.1. Kullanılan veri kümesi (Utilized dataset)")

    # P138: 3.1 paragraf
    replace_text_keep_format(P[138],
        "Bu çalışmada toplam 5.195 ses örneğinden oluşan bir veri kümesi "
        "derlenmiştir. Örneklerin 3.113 tanesi insan tarafından "
        "bestelenmiş kayıtları (sınıf 0), 2.082 tanesi ise GenAI "
        "tarafından üretilmiş örnekleri (sınıf 1) temsil etmektedir. "
        "İnsan kaynakları GTZAN (899 örnek), FMA Small (1.000 örnek) ve "
        "SleepyJesse kapak performansı veri seti (854 örnek) olmak üzere "
        "üç ayrı havuzdan oluşturulmuştur. GenAI kaynakları Suno (500), "
        "Udio, MusicGen [1], AudioLDM2 [2], Stable Audio, Riffusion, "
        "Mustango, JEN-1 ile 'Echoes' ve 'AImE' alt kümelerini "
        "içermektedir. Veri kümesi kompozisyonu Tablo 2'de sunulmuştur.")

    replace_text_keep_format(P[139],
        "Tüm ML/DL modelleri sayısal verilerle çalışmaktadır. Bu "
        "nedenle, her ses parçası 22.050 Hz örnekleme hızında yeniden "
        "örneklenmiş ve librosa [28] kütüphanesi kullanılarak 47 "
        "boyutlu bir öznitelik vektörüne dönüştürülmüştür. Öznitelik "
        "vektörü beş aileden oluşmaktadır: spektral aile (16 öznitelik), "
        "zamansal aile (10 öznitelik), harmonik ve tonal aile (9), MFCC "
        "ailesi (3) ve vokal aile (9 öznitelik).")

    # P142: Tablo 2 caption
    replace_text_keep_format(P[142],
        "Tablo 2. Veri kümesi kompozisyonu (Dataset composition)")

    # P147: Tablo 3 başlık
    replace_text_keep_format(P[147],
        "Tablo 3. On bir modelin temel hiperparametreleri")
    replace_text_keep_format(P[148],
        "(Key hyperparameters of the eleven models)")

    # P149: Tablo 3 yazı
    replace_text_keep_format(P[149],
        "On bir sınıflandırma modeli ortak bir 5-katlı çapraz doğrulama "
        "protokolü altında karşılaştırılmıştır. Tüm modeller "
        "stratifiye edilmiş 5-katlı çapraz doğrulama ile değerlendirilmiştir. "
        "Karar eşiği Youden'in J istatistiği ile optimize edilmiştir.")

    # P149 sonrasını boşalt — onlar Talha'nın tablo verisi
    # ama bu paragraflar büyük ihtimal tablonun içindeki yazılar
    # silmek zarar verebilir; sadece P150+ kalanını boş tutmak yerine
    # kısa AURIS içeriği yerleştir

    # ═══════════════════════════════════════════════════════════════
    # Kalan paragrafları (P150-P512) sırayla işle
    # Bu paragraflar Talha'nın 3.2, 3.3, 4. Sonuçlar, Tartışma vs içerikleri
    # Hepsini AURIS uygun içerikle değiştirmek imkansız; en uygun yaklaşım:
    # - Heading paragrafları AURIS başlıklarıyla değiştir
    # - Geri kalan tüm paragrafları AURIS metni ile değiştir veya boşalt
    # ═══════════════════════════════════════════════════════════════

    # Belirli kritik paragrafları bul ve değiştir
    aurıs_remaining_content = [
        "Çalışmada kullanılan modellerin hiperparametre detayları "
        "Tablo 3'te sunulmuştur. Tüm modeller stratifiye edilmiş "
        "5-katlı çapraz doğrulama (random_state=42) ile "
        "değerlendirilmiştir. Karar eşiği Youden'in J istatistiği ile "
        "optimize edilmiştir: J(θ) = TPR(θ) - FPR(θ) (Eş. 1). "
        "Olasılıkların kalibrasyon kalitesi Brier skoru ile "
        "değerlendirilmiştir (Eş. 2).",

        "Tablo 4, on bir modelin 5-katlı çapraz doğrulama sonuçlarını "
        "ROC-AUC'a göre sıralı sunmaktadır. LightGBM modeli, %95,48 "
        "ortalama ROC-AUC değeri ile ilk sırada yer almakta; Derin MLP "
        "%95,42 ile çok yakın bir ikinci sıra elde etmektedir. ML ve DL "
        "aileleri karşılaştırıldığında, yedi ML sınıflandırıcısı %92,75 "
        "ortalama ROC-AUC değerine ulaşırken dört DL mimarisi %92,32'de "
        "kalmaktadır.",

        "Katlar-arası kararlılık açısından LightGBM ±0,0023 standart "
        "sapma ile havuzdaki en kararlı modeldir. Öznitelik önemi "
        "analizi sonuçları, spektral düzlük standart sapması "
        "özniteliğinin yapay zekâ-insan ayrımı için en bilgilendirici "
        "öznitelik olduğunu açıkça ortaya koymuştur.",

        "Youden-optimal eşik θ* = 0,4316 ile elde edilen karmaşıklık "
        "matrisi: 2.721 doğru negatif (%87,4), 1.862 doğru pozitif "
        "(%89,4), 392 yanlış pozitif (%12,6) ve 220 yanlış negatif "
        "(%10,6). Brier skoru 0,083 olarak ölçülmüş ve modelin olasılık "
        "çıktılarının iyi kalibre olduğu doğrulanmıştır.",

        "Aşırı öğrenme tanılayıcı analizi, tüm ağaç tabanlı modellerin "
        "eğitim ve çapraz doğrulama doğruluğu arasında 8-14 puanlık bir "
        "fark sergilediğini göstermektedir. Öznitelik fazlalığı "
        "analizi sonuçları, 47 özniteliğin sondaki yaklaşık 17'sinin "
        "ölçülebilir bir ek doğruluk sağlamadığını ortaya koymuştur.",

        "Bu çalışmada GenAI tarafından üretilen müziği insan tarafından "
        "bestelenmiş kayıtlardan ayırt edebilmek için AURIS adlı "
        "uçtan-uca bir tespit sistemi önerilmiştir. Önerilen sistem, "
        "47 boyutlu elle tasarlanmış akustik öznitelik vektörü ile on "
        "bir sınıflandırma modelinden oluşan bir topluluğu "
        "birleştirmektedir.",

        "LightGBM modeli %95,48 ortalama ROC-AUC değeri ve ±0,0023 "
        "standart sapma ile havuzdaki en başarılı modeli oluşturmuştur. "
        "Spektral düzlük özniteliği yapay zekâ-insan ayrımı için en "
        "bilgilendirici tek öznitelik olarak öne çıkmıştır.",

        "Gelecek çalışmalar kapsamında SONICS [23] ve FakeMusicCaps "
        "[24] gibi kıyaslamalar üzerinde resmî değerlendirme, ince "
        "ayar yapılmış wav2vec2 [13] entegrasyonu, düşmanca sağlamlık "
        "testi ve veri kümesinin on bin örneğe genişletilmesi "
        "hedeflenmektedir.",
    ]

    # 200-500 arası paragrafları ya AURIS içeriği ile değiştir ya boşalt
    aurıs_idx = 0
    # Önce body text türünden anlamlı boy paragrafları AURIS içeriği ile değiştir
    for i in range(150, min(len(P), 250)):
        p = P[i]
        sn = p.style.name if p.style else ''
        t = p.text.strip()
        # Heading'lere dokunma
        if 'Heading' in sn or 'List' in sn:
            continue
        # Çok kısa paragrafları boşalt
        if len(t) < 50:
            replace_text_keep_format(p, "")
            continue
        # Uzun paragrafları AURIS içeriği ile değiştir
        if aurıs_idx < len(aurıs_remaining_content):
            replace_text_keep_format(p, aurıs_remaining_content[aurıs_idx])
            aurıs_idx += 1
        else:
            replace_text_keep_format(p, "")

    # 250+ tüm body paragrafları boşalt
    for i in range(250, len(P)):
        p = P[i]
        sn = p.style.name if p.style else ''
        t = p.text.strip()
        if not t:
            continue
        # Heading'lere dokunma (References başlığı vs.)
        if 'Heading' in sn or 'List' in sn:
            continue
        # 'Kaynaklar' veya 'References' kelimesi geçen heading
        if any(k in t.lower() for k in ['kaynaklar', 'references']):
            continue
        # Diğer paragrafları boşalt
        if 'Normal' in sn or 'Body Text' in sn:
            replace_text_keep_format(p, "")

    # Kaynaklar bölümü ÖZEL — Talha'nın referanslarını AURIS referansları ile değiştir
    # Önce "Kaynaklar" başlığını bul
    refs_start = None
    for i, p in enumerate(P):
        t = p.text.strip().lower()
        if t in ('kaynaklar', 'kaynaklar (references)', 'references') or t.startswith('kaynaklar'):
            refs_start = i
            break

    print(f"References başlığı paragraf: {refs_start}")
    # Kaynaklar başlığından sonra Talha'nın 50 referansı var
    # Onları AURIS'in 30 referansı ile değiştir
    aurıs_refs = [
        "Copet J. vd., Simple and Controllable Music Generation, Advances in Neural Information Processing Systems, 36, 2023.",
        "Liu H. vd., AudioLDM: Text-to-Audio Generation with Latent Diffusion Models, Proceedings of the International Conference on Machine Learning (ICML 2023), 21450-21474, Honolulu, Hawaii, A.B.D., 23-29 Temmuz, 2023.",
        "Yi J. vd., ADD 2022: The First Audio Deep Synthesis Detection Challenge, Proceedings of the IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP 2022), 9216-9220, Singapur, 22-27 Mayıs, 2022.",
        "Frank J., Schönherr L., WaveFake: A Data Set to Facilitate Audio Deepfake Detection, Advances in Neural Information Processing Systems 2021 Datasets and Benchmarks Track, 2021.",
        "Li Y., Milling M., Specia L., Schuller B.W., From Audio Deepfake Detection to AI-Generated Music Detection: A Pathway and Overview, arXiv preprint arXiv:2412.00571, 2024.",
        "Yi J. vd., Audio Deepfake Detection: A Survey, arXiv preprint arXiv:2308.14970, 2023.",
        "Afchar D., Meseguer Brocal G., Hennequin R., AI-Generated Music Detection and Its Challenges, Proceedings of the IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP 2025), Hyderabad, Hindistan, 6-11 Nisan, 2025.",
        "Kim Y., Go S., Segment Transformer: AI-Generated Music Detection via Music Structural Analysis, arXiv preprint arXiv:2509.08283, 2025.",
        "Chen T., Guestrin C., XGBoost: A Scalable Tree Boosting System, Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining (KDD '16), 785-794, San Francisco, CA, A.B.D., 13-17 Ağustos, 2016.",
        "Ke G. vd., LightGBM: A Highly Efficient Gradient Boosting Decision Tree, Advances in Neural Information Processing Systems 30 (NIPS 2017), 3149-3157, Long Beach, California, A.B.D., 4-9 Aralık, 2017.",
        "Lundberg S.M., Lee S.I., A Unified Approach to Interpreting Model Predictions, Advances in Neural Information Processing Systems 30 (NIPS 2017), 4768-4777, Long Beach, California, A.B.D., 4-9 Aralık, 2017.",
        "Martín-Doñas J.M., Álvarez A., The Vicomtech Audio Deepfake Detection System Based on Wav2vec2 for the 2022 ADD Challenge, Proceedings of the IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP 2022), 9266-9270, Singapur, 22-27 Mayıs, 2022.",
        "Baevski A., Zhou Y., Mohamed A., Auli M., wav2vec 2.0: A Framework for Self-Supervised Learning of Speech Representations, Advances in Neural Information Processing Systems, 33, 12449-12460, 2020.",
        "Elizalde B., Deshmukh S., Al Ismail M., Wang H., CLAP: Learning Audio Concepts from Natural Language Supervision, Proceedings of the IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP 2023), 1-5, Rhodes, Yunanistan, 4-10 Haziran, 2023.",
        "Wu Y. vd., Large-Scale Contrastive Language-Audio Pretraining with Feature Fusion and Keyword-to-Caption Augmentation, Proceedings of the IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP 2023), 1-5, Rhodes, Yunanistan, 4-10 Haziran, 2023.",
        "Liu Y., Yin Y., Zhu Q., Cui W., Musical Instrument Recognition by XGBoost Combining Feature Fusion, arXiv preprint arXiv:2206.00901, 2022.",
        "Gan R., Huang T., Shao J., Wang F., Music Genre Classification Based on VMD-IWOA-XGBoost, Mathematics, 12 (10), 1549, 2024.",
        "Hızlısoy S., Tüfekci Z., Derin Öğrenme İle Türkçe Müziklerden Müzik Türü Sınıflandırması, Avrupa Bilim ve Teknoloji Dergisi, 24, 176-183, 2021.",
        "Özbalcı M.C., Şahin H., Bilgin T.T., Classification of Music Genres of GTZAN Dataset with Machine Learning Methods, Mühendislik Bilimleri ve Araştırmaları Dergisi, 6 (1), 2024.",
        "Turan A.K., Polat H., Yarı Denetimli Makine Öğrenmesi Yöntemini Kullanarak Müzik Türlerinin Tespiti, Gazi Üniversitesi Fen Bilimleri Dergisi Part C: Tasarım ve Teknoloji, 12 (1), 92-107, 2024.",
        "Kostrzewa D., Mazur W., Brzeski R., Wide Ensembles of Neural Networks in Music Genre Classification, Computational Science -- ICCS 2022, Lecture Notes in Computer Science, vol. 13351, 91-102, Springer, 2022.",
        "Gourisaria M.K., Agrawal R., Sahni M., Comparative Analysis of Audio Classification with MFCC and STFT Features Using Machine Learning Techniques, Discover Internet of Things, 4 (1), 1, 2024.",
        "Rahman M.A., Hakim Z.I.A., Sarker N.H., Paul B., Fattah S.A., SONICS: Synthetic Or Not -- Identifying Counterfeit Songs, Proceedings of the International Conference on Learning Representations (ICLR 2025), Singapur, 24-28 Nisan, 2025.",
        "Comanducci L., Bestagini P., Tubaro S., FakeMusicCaps: A Dataset for Detection and Attribution of Synthetic Music Generated via Text-to-Music Models, arXiv preprint arXiv:2409.10684, 2024.",
        "Pascu O., Oneata D., Cucu H., Müller N.M., Echoes: A Semantically-Aligned Music Deepfake Detection Dataset, arXiv preprint arXiv:2603.23667, 2025.",
        "Sunday N., Detecting Musical Deepfakes, arXiv preprint arXiv:2505.09633, 2025.",
        "Sroka T., Wężowicz T., Sidorczuk D., Modrzejewski M., Evaluating Fake Music Detection Performance Under Audio Augmentations, arXiv preprint arXiv:2507.10447, 2025.",
        "McFee B. vd., librosa: Audio and Music Signal Analysis in Python, Proceedings of the 14th Python in Science Conference (SciPy 2015), 18-24, Austin, Texas, A.B.D., 6-12 Temmuz, 2015.",
        "Pedregosa F. vd., Scikit-learn: Machine Learning in Python, Journal of Machine Learning Research, 12, 2825-2830, 2011.",
        "Kingma D.P., Ba J., Adam: A Method for Stochastic Optimization, Proceedings of the 3rd International Conference on Learning Representations (ICLR 2015), 1-15, San Diego, California, A.B.D., 7-9 Mayıs, 2015.",
    ]

    if refs_start is not None:
        # Kaynaklar sonrasındaki List Paragraph stilindeki paragrafları sırayla AURIS refs ile değiştir
        ref_count = 0
        for i in range(refs_start + 1, len(P)):
            p = P[i]
            sn = p.style.name if p.style else ''
            if 'List' in sn or 'Body' in sn:
                t = p.text.strip()
                if len(t) > 40:  # Anlamlı referans paragrafı
                    if ref_count < len(aurıs_refs):
                        replace_text_keep_format(p, aurıs_refs[ref_count])
                        ref_count += 1
                    else:
                        replace_text_keep_format(p, "")
        print(f"Replaced {ref_count} references with AURIS refs")

    # Kaydet
    doc.save(str(OUT))
    print(f"Saved: {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
