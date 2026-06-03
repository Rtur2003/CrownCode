# -*- coding: utf-8 -*-
"""
AURIS — Profesyonel savunma sunumları (çakışmasız, jüri-odaklı).
Tüm veriler gerçek: training_results.json, deep_learning_results.json, makale.
"""
import sys, os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from sunum_lib import (
    slide, bg, rect, text, paras, header, footer, stat, chip, panel,
    table, imza, divider, image,
    NAVY, NAVY2, STEEL, TEAL, TEALL, WHITE, PAPER, MGRAY, LINE, DGRAY,
    TGRAY, GOLD, GOLDD, GREEN, GREENL, RED, REDL, AMBER, SW, SH,
)

FIGS = 'docs/academic/figures'


def newp():
    p = Presentation(); p.slide_width = Inches(13.33); p.slide_height = Inches(7.5)
    return p


# ════════ GERÇEK VERİLER ════════
MODELS = [  # ad, tip, doğruluk, F1, ROC-AUC, std
    ("LightGBM", "ML", "0,8839", "0,8575", "0,9548", "±0,0023"),
    ("Derin ÇKA", "DL", "0,8849", "0,8596", "0,9542", "±0,0036"),
    ("Artık ÇKA", "DL", "0,8756", "0,8476", "0,9485", "±0,0048"),
    ("XGBoost", "ML", "0,8751", "0,8408", "0,9465", "±0,0029"),
    ("Gradyan Artırma", "ML", "0,8685", "0,8337", "0,9397", "±0,0038"),
    ("Rastgele Orman", "ML", "0,8606", "0,8183", "0,9394", "±0,0051"),
    ("Dikkat ÇKA", "DL", "0,8628", "0,8293", "0,9359", "±0,0059"),
    ("SVM-RBF", "ML", "0,8612", "0,8252", "0,9346", "±0,0075"),
    ("ÇKA Sinir Ağı", "ML", "0,8566", "0,8189", "0,9276", "±0,0061"),
    ("1B-ESA", "DL", "0,7665", "0,7159", "0,8543", "±0,0087"),
    ("Lojistik Regresyon", "ML", "0,7779", "0,7390", "0,8515", "±0,0042"),
]
DATA_ROWS = [
    ["GTZAN", "İnsan", "899"], ["FMA Small", "İnsan", "1.000"],
    ["SleepyJesse (kapak)", "İnsan", "854"], ["Diğer insan kaynağı", "İnsan", "360"],
    ["Echoes", "Yapay zekâ", "1.128"], ["Suno (v3–v5)", "Yapay zekâ", "500"],
    ["Deepfake seti", "Yapay zekâ", "492"], ["AImE / Mustango / JEN-1", "Yapay zekâ", "204"],
    ["TOPLAM", "—", "5.195"],
]
FEAT10 = [
    ["1", "spectral_flatness_std", "0,0619", "Spektral"],
    ["2", "spectral_contrast_mean", "0,0467", "Spektral"],
    ["3", "rms_energy", "0,0456", "Zamansal"],
    ["4", "onset_strength_std", "0,0388", "Ritmik"],
    ["5", "spectral_flatness_mean", "0,0370", "Spektral"],
    ["6", "rms_dynamic_range", "0,0346", "Zamansal"],
    ["7", "onset_strength_mean", "0,0332", "Ritmik"],
    ["8", "rms_std", "0,0298", "Zamansal"],
    ["9", "beat_count", "0,0298", "Ritmik"],
    ["10", "mfcc_delta_var", "0,0289", "Spektral"],
]
LIT_ROWS = [
    ["Afchar vd. [5]", "Oto-kodlayıcı artefakt", "Özel", "—", "0,872"],
    ["Li vd. [22]", "Açıklanabilir öznitelik + ML", "Özel", "0,931", "0,884"],
    ["Cros Vila vd. [33]", "Spektral + ritmik + SVM", "Özel", "0,941", "—"],
    ["SONICS [34]", "Transformer tabanlı DL", "SONICS", "0,960", "0,921"],
    ["FakeMusicCaps [35]", "Çok modlu MusicCaps", "FMC", "0,943", "0,906"],
    ["AURIS (bu çalışma)", "47 öznitelik + 11 model topluluk", "5.195", "0,9548", "0,8731"],
]
FAMILIES = [
    ("Spektral", "16", "MFCC, mel-spektrogram, centroid, bandwidth, rolloff, flatness + delta", "Frekans içeriği / tını"),
    ("Zamansal", "10", "RMS enerjisi, sıfır geçiş hızı, dinamik aralık türevleri", "Enerji / zaman yapısı"),
    ("Ritmik", "9", "Tempo, beat sayısı, onset gücü istatistikleri", "Ritim / vuruş düzeni"),
    ("Harmonik", "8", "Chroma vektörü, tonnetz, harmonik–algısal ayrıştırma", "Perde / akor yapısı"),
    ("Vokal", "4", "Temel frekans, vibrato, formant tutarlılığı", "Şarkı sesi davranışı"),
]


# ════════════════════════════════════════════════════════════
# 01 — DÖNEM BAŞLANGIÇ
# ════════════════════════════════════════════════════════════
def s01(prs):
    # Kapak
    s = slide(prs); bg(s, PAPER)
    rect(s, 0, 0, SW, 2.75, NAVY); rect(s, 0, 2.75, SW, 0.06, GOLD)
    rect(s, 0, 0, 0.2, 2.75, GOLD)
    text(s, 0.6, 0.5, 12, 0.4, "01 — DÖNEM BAŞLANGIÇ SUNUMU", fs=13, bold=True, color=GOLD)
    text(s, 0.6, 1.0, 12, 0.95, "AURIS — Proje Önerisi", fs=34, bold=True, color=WHITE)
    text(s, 0.6, 1.92, 12, 0.55, "Yapay Zekâ Üretimli Müzik Tespitinde Topluluk Öğrenmesi",
         fs=16, color=RGBColor(0xAD, 0xC4, 0xD6))
    panel(s, 0.6, 3.15, 7.7, 3.5, "Projenin Özü",
          ["Problem: Üretken YZ sistemleri (Suno, Udio, MusicGen) insan kaydından ayırt edilemeyen müzik üretiyor.",
           "Amaç: %90+ ROC-AUC sağlayan, açıklanabilir ve hafif bir tespit sistemi geliştirmek.",
           "Yaklaşım: 47 boyutlu elle tasarlanmış akustik öznitelik + 11 modelli topluluk öğrenmesi.",
           "Çıktı: Çalışan sistem, GUJSA makalesi, açık kaynak kod."],
          fill=WHITE, bar=TEAL, bfs=12.5, gap=9)
    stat(s, 8.55, 3.15, 4.25, 1.05, "5.195", "Ses örneği", vfs=26)
    stat(s, 8.55, 4.38, 4.25, 1.05, "47", "Akustik öznitelik", vfs=26)
    stat(s, 8.55, 5.61, 4.25, 1.05, "11", "Sınıflandırma modeli", vfs=26)
    footer(s)

    # Problem
    s = slide(prs); bg(s, PAPER)
    header(s, "Bölüm 1 · Giriş", "Problem Tanımı ve Motivasyon",
           "Üretken yapay zekânın müzik alanında doğurduğu tespit ihtiyacı")
    panel(s, 0.4, 1.75, 6.15, 2.25, "Neden bir sorun?",
          "Metinden müziğe üretim sistemleri son üç yılda tüketici uygulamalarına taştı. "
          "Kullanıcı tek bir metin istemiyle dakikalar içinde, deneyimsiz dinleyicinin "
          "insan bestesinden ayıramayacağı tam uzunlukta parçalar üretebiliyor.",
          fill=AMBER, bar=GOLD)
    panel(s, 0.4, 4.15, 6.15, 2.45, "Doğan riskler",
          ["Telif hakkı ihlalleri ve içerik sahipliği belirsizliği",
           "Akış platformlarında sahte dinlenme / gelir manipülasyonu",
           "Dezenformasyon ve üslup / kimlik taklidi",
           "Yaratıcı endüstride ekonomik değer kaybı"],
          fill=REDL, bar=RED, bfs=12, gap=7)
    panel(s, 6.75, 1.75, 6.18, 4.85, "Mevcut yöntemler neden yetersiz?",
          ["Konuşma deepfake tespiti (ADD 2022, WaveFake) olgun bir alan; ancak müzik tespiti emekleme aşamasında.",
           "",
           "✗  Tek temsile (yalnız MFCC ya da yalnız spektrogram) bağlı yöntemler genelleme yapamıyor.",
           "",
           "✗  Topluluk öğrenmesi müzik tespitine yeterince uygulanmamış.",
           "",
           "✗  Kararın hangi akustik özellikten geldiğini açıklayan (SHAP) sistem yok.",
           "",
           "AURIS bu üç boşluğu birlikte ele alıyor."],
          fill=TEALL, bar=TEAL, bfs=12, gap=4)
    footer(s)

    # Amaç + literatür konumu
    s = slide(prs); bg(s, PAPER)
    header(s, "Bölüm 1 · Giriş", "Çalışmanın Amacı ve Literatüre Katkısı")
    text(s, 0.4, 1.7, 6.2, 0.4, "Araştırma Hedefleri", fs=15, bold=True, color=NAVY)
    paras(s, 0.45, 2.18, 6.1, 4.5,
          ["Müzik-spesifik, beş aileli 47 boyutlu öznitelik vektörü tasarlamak",
           "7 ML + 4 DL modelini ortak protokolde karşılaştırmak",
           "5-katlı çapraz doğrulama ile düşük varyanslı değerlendirme",
           "Youden J ile karar eşiğini optimize etmek",
           "TreeSHAP ile kararı açıklanabilir kılmak",
           "GUJSA formatında akademik yayın üretmek"],
          fs=13, color=DGRAY, gap=13, lead="•  ")
    panel(s, 6.85, 1.75, 6.08, 1.5, "Özgün değer",
          "Müzik deepfake tespitinde topluluk öğrenmesi ile SHAP açıklanabilirliğini "
          "birleştiren ilk çalışmalardandır.", fill=MGRAY, bar=TEAL, bfs=12)
    panel(s, 6.85, 3.4, 6.08, 1.5, "Hafiflik avantajı",
          "Derin öğrenme altyapısı gerektirmeden, elle tasarlanmış özniteliklerle "
          "rekabetçi doğruluk hedefleniyor.", fill=MGRAY, bar=GOLD, bfs=12)
    panel(s, 6.85, 5.05, 6.08, 1.55, "Açıklanabilirlik",
          "Her tahmin, kararı yönlendiren akustik özelliklerle birlikte sunulur — "
          "kara kutu değil.", fill=MGRAY, bar=GREEN, bfs=12)
    footer(s)

    # Zaman planı + risk
    s = slide(prs); bg(s, PAPER)
    header(s, "Proje Yönetimi", "Çalışma Planı ve Risk Yönetimi")
    text(s, 0.4, 1.65, 8, 0.4, "10 Haftalık Zaman Planı", fs=14, bold=True, color=NAVY)
    phases = [("Veri toplama ve ön işleme", 0, 2, TEAL),
              ("Öznitelik mühendisliği", 2, 2, TEAL),
              ("Model eğitimi ve çapraz doğrulama", 4, 2, STEEL),
              ("Değerlendirme ve SHAP analizi", 6, 2, STEEL),
              ("Yazım, sunum ve teslim", 8, 2, GOLD)]
    tl, tw = 4.0, 8.6
    for i, (nm, st, du, clr) in enumerate(phases):
        top = 2.2 + i*0.6
        text(s, 0.4, top, 3.5, 0.5, nm, fs=11, color=DGRAY, anchor=MSO_ANCHOR.MIDDLE)
        bl = tl + (st/10)*tw; bw = (du/10)*tw
        rect(s, bl, top+0.07, bw, 0.36, clr)
        text(s, bl, top+0.07, bw, 0.36, f"H{st+1}–{st+du}", fs=10, bold=True,
             color=WHITE, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    text(s, 0.4, 5.35, 12.5, 0.4, "Risk Analizi ve Önlemler", fs=14, bold=True, color=NAVY)
    risks = [("Sınıf dengesizliği", "class_weight='balanced', is_unbalance=True"),
             ("Aşırı uyum (overfitting)", "5-katlı CV, erken durdurma, düzenlileştirme"),
             ("Veri sızıntısı", "Scaler her katta yalnız eğitim verisine fit edilir")]
    for i, (rk, fx) in enumerate(risks):
        l = 0.4 + i*4.21
        rect(s, l, 5.82, 4.05, 1.0, WHITE, RED, 1.0)
        rect(s, l, 5.82, 0.09, 1.0, RED)
        text(s, l+0.2, 5.9, 3.75, 0.35, "⚠  "+rk, fs=12, bold=True, color=RED)
        text(s, l+0.2, 6.28, 3.75, 0.48, fx, fs=10.5, color=DGRAY)
    footer(s)
    imza(slide(prs), "01", "Dönem Başlangıç Sunumu")


# ════════════════════════════════════════════════════════════
# 02 — LİTERATÜR TARAMASI
# ════════════════════════════════════════════════════════════
def s02(prs):
    s = slide(prs); bg(s, PAPER)
    rect(s, 0, 0, SW, 2.75, NAVY); rect(s, 0, 2.75, SW, 0.06, GOLD)
    rect(s, 0, 0, 0.2, 2.75, GOLD)
    text(s, 0.6, 0.5, 12, 0.4, "02 — LİTERATÜR TARAMASI", fs=13, bold=True, color=GOLD)
    text(s, 0.6, 1.0, 12, 0.95, "İlgili Çalışmalar", fs=34, bold=True, color=WHITE)
    text(s, 0.6, 1.92, 12, 0.55, "39 kaynak · üç araştırma alanı · sistematik boşluk analizi",
         fs=16, color=RGBColor(0xAD,0xC4,0xD6))
    stat(s, 0.6, 3.15, 3.9, 1.15, "39", "Taranan kaynak", vfs=30)
    stat(s, 4.7, 3.15, 3.9, 1.15, "%74", "Son 5 yıl (2021+)", vfs=30, vcolor=RGBColor(0x6F,0xD8,0x95))
    stat(s, 8.8, 3.15, 4.0, 1.15, "3", "Araştırma alanı", vfs=30)
    paras(s, 0.6, 4.7, 12.2, 2.0,
          ["GUJSA, referansların en az %30'unun güncel olmasını şart koşar — AURIS %74 ile bu eşiği fazlasıyla aşar.",
           "Tarama üç eksende yürütüldü: ses deepfake tespiti, üretken müzik sistemleri, YZ müzik tespiti.",
           "Temel bulgu: müzik için topluluk öğrenmesi + SHAP açıklanabilirliğini birleştiren çalışma eksik."],
          fs=13, color=DGRAY, gap=10, lead="—  ")
    footer(s)

    # Alan 1 tablo
    s = slide(prs); bg(s, PAPER)
    header(s, "Alan 1", "Ses Derin Sahte Tespiti (Audio Deepfake Detection)",
           "GenAI müzik tespiti için en olgun komşu alan")
    rows = [
        ["AASIST [10]", "Jung vd.", "2022", "Bütünleşik spektro-temporal graf dikkat ağı"],
        ["RawNet2 [11]", "Tak vd.", "2021", "Ham dalga formundan uçtan uca öğrenme"],
        ["wav2vec 2.0 [13]", "Baevski vd.", "2020", "Öz-denetimli ses temsili; güçlü transfer tabanı"],
        ["WavLM [15]", "Chen vd.", "2022", "Maskelenmiş öngörü ile büyük ölçekli ön eğitim"],
        ["ADD 2022 [3]", "Yi vd.", "2022", "İlk YZ ses sentezi tespit yarışması"],
        ["ASVspoof 2019 [17]", "Wang vd.", "2020", "64k örnekli kıyaslama veri kümesi"],
    ]
    table(s, 0.4, 1.78, [2.5, 2.0, 0.9, 7.13],
          ["Çalışma", "Yazarlar", "Yıl", "Yaklaşım ve Katkı"], rows,
          row_h=0.6, fs=11.5,
          align_cols=[PP_ALIGN.LEFT, PP_ALIGN.CENTER, PP_ALIGN.CENTER, PP_ALIGN.LEFT])
    text(s, 0.4, 6.0, 12.5, 0.4,
         "Çıkarım: Bu yöntemler konuşma için olgun; müziğin ritmik ve harmonik yapısını hedeflemiyor.",
         fs=11.5, italic=True, color=TGRAY)
    footer(s)

    # Alan 2-3
    s = slide(prs); bg(s, PAPER)
    header(s, "Alan 2 & 3", "Üretken Müzik Sistemleri ve YZ Müzik Tespiti")
    text(s, 0.4, 1.65, 6.1, 0.38, "Üretici Sistemler", fs=14, bold=True, color=NAVY)
    g = [("MusicGen [1]", "Copet vd., 2023 (Meta) — metne koşullu, tek aşamalı transformer"),
         ("AudioLDM2 [2]", "Liu vd., 2023 — latent difüzyon tabanlı üretim"),
         ("Suno / Udio", "Ticari sistemler, 2024 — yüksek kaliteli şarkı üretimi"),
         ("Stable Audio / Riffusion", "Difüzyon tabanlı açık sistemler")]
    for i, (t, d) in enumerate(g):
        top = 2.12 + i*1.07
        rect(s, 0.4, top, 6.1, 0.95, WHITE, TEAL, 1.0)
        text(s, 0.55, top+0.1, 5.8, 0.34, t, fs=12.5, bold=True, color=TEAL)
        text(s, 0.55, top+0.46, 5.8, 0.42, d, fs=11, color=DGRAY)
    text(s, 6.85, 1.65, 6.0, 0.38, "Doğrudan İlgili Tespit Çalışmaları", fs=14, bold=True, color=NAVY)
    dd = [("Afchar vd. [5] · 2025", "Oto-kodlayıcı artefaktı; aynı üreticide %99,8, farklı üreticide ciddi düşüş"),
          ("Cros Vila vd. [33] · 2025", "Spektral + ritmik öznitelik + SVM; müzik-spesifik"),
          ("Li vd. [22] · 2026", "Açıklanabilir öznitelik tabanlı erken değerlendirme"),
          ("SONICS [34] · 2025", "Transformer DL; 97k şarkılık büyük veri kümesi"),
          ("FakeMusicCaps [35] · 2025", "Metin→müzik tespiti ve atıf veri kümesi")]
    for i, (t, d) in enumerate(dd):
        top = 2.12 + i*0.85
        rect(s, 6.85, top, 6.08, 0.76, WHITE, GOLD, 1.0)
        text(s, 7.0, top+0.07, 5.8, 0.32, t, fs=11.5, bold=True, color=GOLDD)
        text(s, 7.0, top+0.38, 5.8, 0.34, d, fs=10.5, color=DGRAY)
    footer(s)

    # Boşluk analizi
    s = slide(prs); bg(s, PAPER)
    header(s, "Sentez", "Literatür Boşluğu ve AURIS'in Konumu")
    text(s, 0.4, 1.7, 6.15, 0.4, "Tespit Edilen Boşluklar", fs=15, bold=True, color=RED)
    gaps = ["Müzik için topluluk yaklaşımı yetersiz uygulanmış",
            "Çok aileli (47 boyut) heterojen öznitelik seti yok",
            "Üretici/kaynak bazlı performans analizi eksik",
            "SHAP/TreeSHAP açıklanabilirliği taşınmamış",
            "Youden J karar eşiği optimizasyonu uygulanmamış"]
    for i, gp in enumerate(gaps):
        top = 2.2 + i*0.9
        rect(s, 0.4, top, 6.15, 0.78, REDL, RED, 1.0)
        text(s, 0.52, top, 0.5, 0.78, "✗", fs=18, bold=True, color=RED,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        text(s, 1.05, top, 5.4, 0.78, gp, fs=11.5, color=DGRAY, anchor=MSO_ANCHOR.MIDDLE)
    text(s, 6.78, 1.7, 6.15, 0.4, "AURIS'in Çözümü", fs=15, bold=True, color=GREEN)
    sols = ["7 ML + 4 DL = 11 modelli topluluk öğrenmesi",
            "Spektral · zamansal · ritmik · harmonik · vokal (47 boyut)",
            "Sekiz kaynak için ayrı duyarlılık analizi",
            "TreeSHAP ile global ve yerel öznitelik etkisi",
            "θ* = 0,4316 ile dengeli karar eşiği"]
    for i, so in enumerate(sols):
        top = 2.2 + i*0.9
        rect(s, 6.78, top, 6.15, 0.78, GREENL, GREEN, 1.0)
        text(s, 6.9, top, 0.5, 0.78, "✓", fs=18, bold=True, color=GREEN,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        text(s, 7.42, top, 5.4, 0.78, so, fs=11, color=DGRAY, anchor=MSO_ANCHOR.MIDDLE)
    footer(s)
    imza(slide(prs), "02", "Literatür Taraması Sunumu")


# ════════════════════════════════════════════════════════════
# 03 — TASARIM VE GELİŞTİRME
# ════════════════════════════════════════════════════════════
def s03(prs):
    s = slide(prs); bg(s, PAPER)
    rect(s, 0, 0, SW, 2.75, NAVY); rect(s, 0, 2.75, SW, 0.06, GOLD)
    rect(s, 0, 0, 0.2, 2.75, GOLD)
    text(s, 0.6, 0.5, 12, 0.4, "03 — TASARIM VE GELİŞTİRME", fs=13, bold=True, color=GOLD)
    text(s, 0.6, 1.0, 12, 0.95, "Sistem Mimarisi ve Yöntem", fs=34, bold=True, color=WHITE)
    text(s, 0.6, 1.92, 12, 0.55, "Ham sesten karara: yedi aşamalı uçtan uca işlem zinciri",
         fs=16, color=RGBColor(0xAD, 0xC4, 0xD6))
    paras(s, 0.6, 3.2, 12.2, 3.4,
          ["Veri katmanı: 5.195 ses örneği sekiz farklı insan ve YZ kaynağından derlendi.",
           "Öznitelik katmanı: librosa ile 22.050 Hz'de 47 boyutlu vektör çıkarıldı.",
           "Model katmanı: 7 ML + 4 DL modeli 5-katlı çapraz doğrulamada karşılaştırıldı.",
           "Karar katmanı: LightGBM olasılığına Youden-optimal eşik (θ*=0,4316) uygulandı.",
           "Açıklama katmanı: TreeSHAP her kararın akustik gerekçesini üretir."],
          fs=14, color=DGRAY, gap=11, lead="●  ")
    footer(s)

    # Pipeline görseli (oran korunur)
    s = slide(prs); bg(s, PAPER)
    header(s, "Mimari", "AURIS Uçtan Uca İşleyiş Şeması")
    image(s, f"{FIGS}/paper_pipeline_diagram.png", 0.4, 1.95, 8.5, 2.6,
          "Şekil 1: Yedi aşamalı işlem zinciri (ham ses → karar)")
    panel(s, 0.4, 4.95, 12.5, 1.7, "Aşamalar",
          ["1 · Ham ses (WAV/MP3)      2 · Ön işleme (22.050 Hz, mono)      3 · 47 öznitelik çıkarma      4 · StandardScaler (kat-içi)",
           "5 · 11 model / 5-katlı CV      6 · Youden eşik (θ*=0,4316)      7 · Karar (YZ / İnsan) + SHAP açıklaması"],
          fill=NAVY, bar=GOLD, tcolor=GOLD, bfs=12.5, gap=8)
    footer(s)

    # Veri kümesi — TABLO solda, panel sağda (ÇAKIŞMA YOK)
    s = slide(prs); bg(s, PAPER)
    header(s, "Veri", "Veri Kümesi Kompozisyonu", "5.195 örnek · 8 kaynak · iki sınıf")
    table(s, 0.4, 1.78, [4.4, 2.6, 1.5],
          ["Kaynak", "Tür", "Örnek"], DATA_ROWS, row_h=0.43, fs=11.5,
          highlight_row=8,
          align_cols=[PP_ALIGN.LEFT, PP_ALIGN.CENTER, PP_ALIGN.CENTER])
    panel(s, 9.1, 1.78, 3.83, 2.35, "Sınıf Dengesi",
          ["İnsan (0):  3.113  ·  %59,9",
           "Yapay zekâ (1):  2.082  ·  %40,1",
           "",
           "Giderme: class_weight='balanced', is_unbalance=True, stratifiye CV"],
          fill=TEALL, bar=TEAL, bfs=11.5, gap=5)
    panel(s, 9.1, 4.3, 3.83, 2.3, "Veri Sızıntısı Önlemi",
          ["duration_sec ve sample_rate öznitelik kümesinden çıkarıldı.",
           "",
           "StandardScaler her katta yalnız eğitim verisine fit edildi — "
           "doğrulama verisi sızmaz."],
          fill=REDL, bar=RED, bfs=11.5, gap=5)
    footer(s)

    # 47 öznitelik — aileler
    s = slide(prs); bg(s, PAPER)
    header(s, "Öznitelik Mühendisliği", "47 Boyutlu Heterojen Akustik Vektör",
           "Beş işlevsel aile — tek temsile aşırı uyumu sınırlamak için")
    for i, (nm, dim, desc, role) in enumerate(FAMILIES):
        lft = 0.4 + (i % 3)*4.25; top = 1.78 + (i//3)*2.45
        rect(s, lft, top, 4.0, 2.28, WHITE, TEAL, 1.0)
        rect(s, lft, top, 4.0, 0.5, TEAL)
        text(s, lft+0.14, top, 2.5, 0.5, nm, fs=14, bold=True, color=WHITE,
             anchor=MSO_ANCHOR.MIDDLE)
        chip(s, lft+2.95, top+0.09, 0.92, 0.32, dim+" boyut", fill=GOLD, fc=NAVY, fs=10)
        text(s, lft+0.14, top+0.6, 3.72, 1.15, desc, fs=11, color=DGRAY)
        text(s, lft+0.14, top+1.82, 3.72, 0.4, "▸ "+role, fs=10.5, italic=True, color=TEAL)
    # Toplam kartı (3. sütun 2. satır yerine)
    rect(s, 8.65, 4.23, 4.28, 2.28, NAVY)
    text(s, 8.65, 4.38, 4.28, 0.45, "Toplam", fs=14, color=WHITE, align=PP_ALIGN.CENTER)
    text(s, 8.65, 4.78, 4.28, 0.8, "47 boyut", fs=32, bold=True, color=GOLD, align=PP_ALIGN.CENTER)
    text(s, 8.65, 5.65, 4.28, 0.45, "16 + 10 + 9 + 8 + 4", fs=14,
         color=RGBColor(0xAD,0xC4,0xD6), align=PP_ALIGN.CENTER)
    footer(s)

    # Öznitelik dağılımı görseli + yorum
    s = slide(prs); bg(s, PAPER)
    header(s, "Öznitelik Analizi", "YZ ve İnsan Müziğinin Dağılım Farkları")
    image(s, f"{FIGS}/feature_distribution_ai_vs_human.png", 0.4, 1.78, 8.0, 4.6,
          "Şekil 2: İlk sekiz özniteliğin sınıf bazlı dağılımları")
    panel(s, 8.65, 1.78, 4.28, 4.95, "Yorum",
          ["YZ üretimi parçalar belirli özniteliklerde insan kayıtlarından sistematik biçimde ayrışıyor.",
           "",
           "Özellikle spectral_flatness değerleri YZ müziğinde daha düzenli ve yüksek — "
           "üretim sistemleri algısal kaliteyi optimize ederken daha 'düz' bir spektrum bırakıyor.",
           "",
           "Bu görsel ayrım, SHAP analiziyle doğrulanan en güçlü ayırt edici özelliğin temelidir."],
          fill=TEALL, bar=TEAL, bfs=11.5, gap=6)
    footer(s)

    # Modeller + protokol
    s = slide(prs); bg(s, PAPER)
    header(s, "Modelleme", "On Bir Sınıflandırma Modeli", "Ortak 5-katlı çapraz doğrulama protokolü")
    text(s, 0.4, 1.65, 6.2, 0.38, "Makine Öğrenmesi (7) — scikit-learn", fs=13, bold=True, color=NAVY)
    ml = [("LightGBM", "n_estimators=300, num_leaves=31, lr=0,05"),
          ("XGBoost", "n_estimators=240, max_depth=5, lr=0,06"),
          ("Gradyan Artırma", "n_estimators=180, max_depth=4"),
          ("Rastgele Orman", "n_estimators=500, max_features=log2"),
          ("SVM-RBF", "C=10, gamma=0,05, balanced"),
          ("ÇKA Sinir Ağı", "192-96-32, alpha=0,001"),
          ("Lojistik Regresyon", "C=2,0, max_iter=2500")]
    for i, (n, p) in enumerate(ml):
        top = 2.12 + i*0.62
        rect(s, 0.4, top, 6.15, 0.54, WHITE, TEAL, 0.8)
        text(s, 0.52, top, 2.3, 0.54, n, fs=11.5, bold=True, color=TEAL, anchor=MSO_ANCHOR.MIDDLE)
        text(s, 2.85, top, 3.6, 0.54, p, fs=9.5, color=DGRAY, anchor=MSO_ANCHOR.MIDDLE)
    text(s, 6.78, 1.65, 6.15, 0.38, "Derin Öğrenme (4) — PyTorch / Adam", fs=13, bold=True, color=NAVY)
    dl = [("Derin ÇKA", "512-256-128-64, BatchNorm, dropout"),
          ("Artık ÇKA", "3 artık blok, 256-256 boyut"),
          ("Dikkat ÇKA", "Öz-dikkat mekanizması, 4 baş"),
          ("1B-ESA", "Conv1D + max-pooling katmanları")]
    for i, (n, p) in enumerate(dl):
        top = 2.12 + i*0.62
        rect(s, 6.78, top, 6.15, 0.54, WHITE, GOLD, 0.8)
        text(s, 6.9, top, 2.3, 0.54, n, fs=11.5, bold=True, color=GOLDD, anchor=MSO_ANCHOR.MIDDLE)
        text(s, 9.25, top, 3.55, 0.54, p, fs=9.5, color=DGRAY, anchor=MSO_ANCHOR.MIDDLE)
    panel(s, 6.78, 4.75, 6.15, 1.9, "Ortak Eğitim Protokolü",
          ["Stratifiye 5-katlı çapraz doğrulama (sınıf oranı korunur)",
           "StandardScaler her katta yalnız eğitim verisine fit",
           "Veri sızıntısı önlemi: duration_sec & sample_rate dışlandı",
           "Dengesizlik: class_weight + is_unbalance"],
          fill=MGRAY, bar=NAVY, bfs=11, gap=5)
    footer(s)
    imza(slide(prs), "03", "Tasarım ve Geliştirme Sunumu")


# ════════════════════════════════════════════════════════════
# 04 — SONUÇ VE DEMO
# ════════════════════════════════════════════════════════════
def s04(prs):
    s = slide(prs); bg(s, PAPER)
    rect(s, 0, 0, SW, 2.75, NAVY); rect(s, 0, 2.75, SW, 0.06, GOLD)
    rect(s, 0, 0, 0.2, 2.75, GOLD)
    text(s, 0.6, 0.5, 12, 0.4, "04 — SONUÇ VE DEMO", fs=13, bold=True, color=GOLD)
    text(s, 0.6, 1.0, 12, 0.95, "Bulgular ve Çalışan Sistem", fs=34, bold=True, color=WHITE)
    text(s, 0.6, 1.92, 12, 0.55, "LightGBM lider model · gerçek çapraz doğrulama sonuçları",
         fs=16, color=RGBColor(0xAD, 0xC4, 0xD6))
    stat(s, 0.6, 3.15, 2.95, 1.5, "0,9548", "ROC-AUC", vfs=28)
    stat(s, 3.75, 3.15, 2.95, 1.5, "0,8839", "Doğruluk", vfs=28)
    stat(s, 6.9, 3.15, 2.95, 1.5, "0,8575", "F1-Skoru", vfs=28)
    stat(s, 10.05, 3.15, 2.85, 1.5, "0,4316", "Youden θ*", vfs=24)
    paras(s, 0.6, 5.05, 12.3, 1.9,
          ["LightGBM, 11 model içinde en yüksek ROC-AUC ve en düşük varyansı (±0,0023) elde etti.",
           "spectral_flatness_std, YZ-insan ayrımındaki en belirleyici öznitelik oldu.",
           "Youden J eşik optimizasyonu, dengesiz sınıf altında dengeli karar sağladı."],
          fs=13, color=DGRAY, gap=9, lead="✓  ")
    footer(s)

    # Model karşılaştırma görseli + yorum
    s = slide(prs); bg(s, PAPER)
    header(s, "Sonuçlar", "Tüm Modellerin Performans Karşılaştırması")
    image(s, f"{FIGS}/paper_model_comparison.png", 0.4, 1.78, 8.0, 4.6,
          "Şekil 3: Doğruluk, F1 ve ROC-AUC karşılaştırması")
    panel(s, 8.65, 1.78, 4.28, 4.95, "Öne çıkanlar",
          ["LightGBM (0,9548) ve Derin ÇKA (0,9542) başa baş.",
           "",
           "7 ML modeli ort. %92,75 ROC-AUC; 4 DL modeli ort. %92,32.",
           "",
           "1B-ESA hariç tutulduğunda DL ort. %94,62'ye yükseliyor.",
           "",
           "Sonuç: 47 boyutlu vektör ayırt edici bilginin büyük bölümünü kodluyor — "
           "öznitelik mühendisliği model kapasitesinin önüne geçiyor."],
          fill=TEALL, bar=TEAL, bfs=11.5, gap=5)
    footer(s)

    # Demo akışı
    s = slide(prs); bg(s, PAPER)
    header(s, "Demo", "Sistem Çalışma Akışı")
    steps = [("1", "Müzik dosyası yüklenir", "WAV / MP3 formatı kabul edilir"),
             ("2", "Ön işleme", "22.050 Hz'e indirgenir, mono'ya çevrilir"),
             ("3", "Öznitelik çıkarma", "librosa ile 47 boyutlu vektör hesaplanır"),
             ("4", "Model tahmini", "LightGBM yapay zekâ olasılığı üretir"),
             ("5", "Eşik uygulama", "θ*=0,4316 ile sınıf kararı verilir"),
             ("6", "Açıklama", "SHAP ile kararın gerekçesi gösterilir")]
    for i, (no, t, d) in enumerate(steps):
        top = 1.78 + i*0.82
        rect(s, 0.4, top, 7.4, 0.72, WHITE, TEAL, 1.0)
        rect(s, 0.4, top, 0.65, 0.72, NAVY)
        text(s, 0.4, top, 0.65, 0.72, no, fs=20, bold=True, color=GOLD,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        text(s, 1.2, top+0.09, 6.5, 0.32, t, fs=12.5, bold=True, color=NAVY)
        text(s, 1.2, top+0.41, 6.5, 0.28, d, fs=10.5, color=DGRAY)
    image(s, f"{FIGS}/paper_score_distribution.png", 8.05, 1.95, 4.85, 3.3,
          "Şekil 9: P(YZ) olasılık dağılımı")
    panel(s, 8.05, 5.55, 4.85, 1.05, "Çıktı",
          ["Sınıf etiketi (YZ / İnsan), güven skoru ve SHAP gerekçesi. "
           "Demo videosu Uygulama/ klasöründe."],
          fill=MGRAY, bar=GOLD, bfs=11, gap=4)
    footer(s)

    # Akademik katkı
    s = slide(prs); bg(s, PAPER)
    header(s, "Değerlendirme", "Akademik Katkı ve Özgün Değer")
    cards = [("47 boyutlu heterojen öznitelik", "Beş akustik aileyi tek vektörde birleştiren müzik-spesifik temsil."),
             ("11 modelli topluluk öğrenmesi", "ML ve DL ailelerinin ortak protokolde sistematik karşılaştırması."),
             ("TreeSHAP açıklanabilirlik", "Müzik deepfake tespitinde global + yerel öznitelik etkisi."),
             ("Youden J eşik optimizasyonu", "Dengesiz sınıf için θ*=0,4316; varsayılan 0,5'ten üstün denge."),
             ("Hafif ve rekabetçi", "Derin öğrenme altyapısı olmadan SONICS'e yakın ROC-AUC."),
             ("GUJSA akademik yayını", "39 güncel referansla ulusal hakemli dergi formatında.")]
    for i, (t, d) in enumerate(cards):
        lft = 0.4 + (i % 2)*6.35; top = 1.78 + (i//2)*1.68
        rect(s, lft, top, 6.1, 1.52, WHITE, TEAL, 1.0)
        rect(s, lft, top, 0.62, 1.52, NAVY)
        text(s, lft, top, 0.62, 1.52, str(i+1), fs=24, bold=True, color=GOLD,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        text(s, lft+0.8, top+0.16, 5.2, 0.5, t, fs=13, bold=True, color=NAVY)
        text(s, lft+0.8, top+0.66, 5.2, 0.8, d, fs=11, color=DGRAY)
    footer(s)
    imza(slide(prs), "04", "Sonuç ve Demo Sunumu")


# ════════════════════════════════════════════════════════════
# 05 — FİNAL SAVUNMA (jüri-odaklı, en kapsamlı)
# ════════════════════════════════════════════════════════════
def s05(prs):
    # Kapak
    s = slide(prs); bg(s, NAVY)
    rect(s, 0, 4.9, SW, 0.06, GOLD)
    text(s, 0.5, 1.0, 12.3, 1.3, "AURIS", fs=78, bold=True, color=GOLD, align=PP_ALIGN.CENTER)
    text(s, 0.5, 2.35, 12.3, 0.7, "Yapay Zekâ Üretimli Müzik Tespitinde Topluluk Öğrenmesi",
         fs=22, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    text(s, 0.5, 3.05, 12.3, 0.5, "Heterojen Akustik Öznitelikler ve LightGBM Tabanlı Bir Yaklaşım",
         fs=15, color=RGBColor(0xAD,0xC4,0xD6), align=PP_ALIGN.CENTER)
    text(s, 0.5, 3.7, 12.3, 0.45, "BM498 Mezuniyet Tezi · Final Savunma Sunumu",
         fs=14, italic=True, color=RGBColor(0x7E,0x9A,0xB4), align=PP_ALIGN.CENTER)
    text(s, 0.5, 5.2, 12.3, 0.45, "Hasan Arthur Altuntaş", fs=18, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    text(s, 0.5, 5.7, 12.3, 0.4, "Danışman: ___________________________",
         fs=14, color=RGBColor(0xAD,0xC4,0xD6), align=PP_ALIGN.CENTER)
    text(s, 0.5, 6.45, 12.3, 0.4, "Düzce Üniversitesi · Mühendislik Fakültesi · Bilgisayar Mühendisliği · 2025-2026",
         fs=12, color=RGBColor(0x5E,0x7A,0x94), align=PP_ALIGN.CENTER)

    # İçindekiler
    s = slide(prs); bg(s, PAPER)
    header(s, "Genel Bakış", "Sunum Planı")
    L = ["Motivasyon ve Problem", "Literatür ve Boşluk Analizi", "Sistem Mimarisi",
         "Veri Kümesi", "Öznitelik Çıkarma (47 boyut)", "Sınıflandırma Modelleri"]
    R = ["Eğitim Protokolü ve Eşik", "Sonuçlar — Model Karşılaştırması",
         "Açıklanabilirlik (SHAP)", "Tanılayıcı Analizler", "Literatür Karşılaştırması",
         "Kısıtlamalar, Sonuç, Gelecek"]
    for col, items, off in [(0, L, 0.4), (1, R, 6.78)]:
        for i, it in enumerate(items):
            top = 1.85 + i*0.8
            rect(s, off, top, 6.15, 0.68, WHITE, TEAL, 1.0)
            rect(s, off, top, 0.68, 0.68, NAVY)
            text(s, off, top, 0.68, 0.68, str(i+1+col*6), fs=18, bold=True, color=GOLD,
                 align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
            text(s, off+0.85, top, 5.2, 0.68, it, fs=12.5, color=DGRAY, anchor=MSO_ANCHOR.MIDDLE)
    footer(s)

    # 1 · Motivasyon
    s = slide(prs); bg(s, PAPER)
    header(s, "Bölüm 1", "Motivasyon ve Problem Tanımı")
    panel(s, 0.4, 1.75, 7.3, 2.3, "Üretken müzik patlaması",
          "Suno, Udio ve MusicGen, tek bir metin istemiyle dakikalar içinde deneyimsiz "
          "dinleyicinin insan bestesinden ayıramayacağı tam uzunlukta parçalar üretiyor. "
          "Üretim erişilebilirliği telif, özgünlük ve içerik bütünlüğü açısından somut bir "
          "tespit problemi doğurdu.", fill=AMBER, bar=GOLD)
    text(s, 0.4, 4.3, 7.3, 0.38, "Tespit ihtiyacının kaynakları", fs=13, bold=True, color=NAVY)
    paras(s, 0.45, 4.78, 7.25, 1.95,
          ["Telif hakkı ve içerik sahipliği belirsizliği",
           "Akış platformlarında sahte dinlenme ve gelir manipülasyonu",
           "Dezenformasyon ile kimlik ve üslup taklidi",
           "Konuşma-odaklı dedektörlerin müziğe genelleyememesi"],
          fs=12.5, color=DGRAY, gap=9, lead="•  ")
    stat(s, 7.95, 1.75, 4.98, 1.5, "0,9548", "AURIS ROC-AUC", vfs=30)
    stat(s, 7.95, 3.4, 2.4, 1.45, "5.195", "Örnek", vfs=24)
    stat(s, 10.53, 3.4, 2.4, 1.45, "8", "Kaynak", vfs=24)
    stat(s, 7.95, 5.0, 2.4, 1.45, "47", "Öznitelik", vfs=24)
    stat(s, 10.53, 5.0, 2.4, 1.45, "11", "Model", vfs=24)
    footer(s)

    # 2 · Literatür
    s = slide(prs); bg(s, PAPER)
    header(s, "Bölüm 2", "Literatür Özeti ve Boşluk Analizi")
    text(s, 0.4, 1.7, 6.2, 0.38, "Üç araştırma alanı", fs=13, bold=True, color=NAVY)
    areas = [("Ses Deepfake Tespiti", "AASIST, RawNet2, wav2vec 2.0, WavLM — konuşma için olgun"),
             ("Üretken Müzik Sistemleri", "MusicGen, AudioLDM2, Suno, Udio — tespit hedefini şekillendirir"),
             ("YZ Müzik Tespiti", "Afchar, Cros Vila, Li, SONICS, FakeMusicCaps — yeni ve dağınık")]
    for i, (t, d) in enumerate(areas):
        top = 2.18 + i*1.05
        rect(s, 0.4, top, 6.2, 0.92, WHITE, TEAL, 1.0)
        text(s, 0.55, top+0.1, 5.9, 0.35, t, fs=12.5, bold=True, color=TEAL)
        text(s, 0.55, top+0.46, 5.9, 0.42, d, fs=11, color=DGRAY)
    panel(s, 6.78, 1.7, 6.15, 4.95, "Tespit edilen boşluk",
          ["Literatürde müzik tespiti için:",
           "",
           "✗  Topluluk öğrenmesi yetersiz uygulanmış",
           "✗  Çok aileli (47 boyut) öznitelik seti yok",
           "✗  Kaynak bazlı performans analizi eksik",
           "✗  SHAP açıklanabilirliği taşınmamış",
           "✗  Youden J eşik optimizasyonu yok",
           "",
           "AURIS bu beş boşluğu birlikte ele alarak hafif, açıklanabilir ve rekabetçi bir sistem sunar."],
          fill=TEALL, bar=TEAL, bfs=11.5, gap=5)
    footer(s)

    # 3 · Pipeline
    s = slide(prs); bg(s, PAPER)
    header(s, "Bölüm 3", "Sistem Mimarisi — Uçtan Uca Pipeline")
    image(s, f"{FIGS}/paper_pipeline_diagram.png", 0.4, 1.9, 12.5, 2.5,
          "Şekil 1: AURIS uçtan uca işleyiş şeması")
    cards = [("1 · Giriş", "Ham ses WAV/MP3"), ("2 · Ön işleme", "22.050 Hz, mono"),
             ("3 · Öznitelik", "47 boyutlu vektör"), ("4 · Ölçekleme", "Kat-içi StandardScaler"),
             ("5 · Modeller", "11 model, 5-katlı CV"), ("6 · Eşik", "Youden θ*=0,4316"),
             ("7 · Karar", "YZ/İnsan + SHAP")]
    cw = 1.74
    for i, (t, d) in enumerate(cards):
        lft = 0.4 + i*1.79
        rect(s, lft, 4.85, cw, 1.5, WHITE, TEAL, 1.0)
        rect(s, lft, 4.85, cw, 0.5, NAVY)
        text(s, lft+0.05, 4.85, cw-0.1, 0.5, t, fs=10.5, bold=True, color=WHITE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        text(s, lft+0.06, 5.45, cw-0.12, 0.85, d, fs=9.5, color=DGRAY,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    footer(s)

    # 4 · Veri kümesi
    s = slide(prs); bg(s, PAPER)
    header(s, "Bölüm 4", "Veri Kümesi", "5.195 örnek · sekiz kaynak · iki sınıf")
    table(s, 0.4, 1.78, [4.4, 2.6, 1.5],
          ["Kaynak", "Tür", "Örnek"], DATA_ROWS, row_h=0.43, fs=11.5,
          highlight_row=8,
          align_cols=[PP_ALIGN.LEFT, PP_ALIGN.CENTER, PP_ALIGN.CENTER])
    panel(s, 9.1, 1.78, 3.83, 2.45, "Sınıf Dengesi",
          ["İnsan (0):  3.113 · %59,9",
           "Yapay zekâ (1):  2.082 · %40,1", "",
           "Giderme: class_weight='balanced', is_unbalance=True, stratifiye CV"],
          fill=TEALL, bar=TEAL, bfs=11.5, gap=5)
    panel(s, 9.1, 4.4, 3.83, 2.2, "Sızıntı Önlemi",
          ["duration_sec & sample_rate çıkarıldı.", "",
           "StandardScaler her katta yalnız eğitim verisine fit — doğrulama sızmaz."],
          fill=REDL, bar=RED, bfs=11.5, gap=5)
    footer(s)

    # 5 · Öznitelikler
    s = slide(prs); bg(s, PAPER)
    header(s, "Bölüm 5", "Öznitelik Çıkarma — 47 Boyutlu Vektör",
           "Beş işlevsel aile · tek temsile aşırı uyumu sınırlamak için")
    for i, (nm, dim, desc, role) in enumerate(FAMILIES):
        lft = 0.4 + (i % 3)*4.25; top = 1.78 + (i//3)*2.45
        rect(s, lft, top, 4.0, 2.28, WHITE, TEAL, 1.0)
        rect(s, lft, top, 4.0, 0.5, TEAL)
        text(s, lft+0.14, top, 2.5, 0.5, nm, fs=14, bold=True, color=WHITE, anchor=MSO_ANCHOR.MIDDLE)
        chip(s, lft+2.95, top+0.09, 0.92, 0.32, dim+" boyut", fill=GOLD, fc=NAVY, fs=10)
        text(s, lft+0.14, top+0.6, 3.72, 1.15, desc, fs=11, color=DGRAY)
        text(s, lft+0.14, top+1.82, 3.72, 0.4, "▸ "+role, fs=10.5, italic=True, color=TEAL)
    rect(s, 8.65, 4.23, 4.28, 2.28, NAVY)
    text(s, 8.65, 4.38, 4.28, 0.45, "Toplam", fs=14, color=WHITE, align=PP_ALIGN.CENTER)
    text(s, 8.65, 4.78, 4.28, 0.8, "47 boyut", fs=32, bold=True, color=GOLD, align=PP_ALIGN.CENTER)
    text(s, 8.65, 5.65, 4.28, 0.45, "16 + 10 + 9 + 8 + 4", fs=14,
         color=RGBColor(0xAD,0xC4,0xD6), align=PP_ALIGN.CENTER)
    footer(s)

    # 6 · Modeller + 7 · Protokol
    s = slide(prs); bg(s, PAPER)
    header(s, "Bölüm 6-7", "Modeller ve Eğitim Protokolü")
    text(s, 0.4, 1.62, 4.0, 0.36, "Makine Öğrenmesi (7)", fs=12.5, bold=True, color=TEAL)
    for i, n in enumerate(["LightGBM", "XGBoost", "Gradyan Artırma", "Rastgele Orman",
                           "SVM-RBF", "ÇKA Sinir Ağı", "Lojistik Reg."]):
        top = 2.05 + i*0.6
        rect(s, 0.4, top, 3.95, 0.52, WHITE, TEAL, 0.8)
        text(s, 0.52, top, 3.8, 0.52, n, fs=11.5, color=DGRAY, anchor=MSO_ANCHOR.MIDDLE)
    text(s, 4.55, 1.62, 4.0, 0.36, "Derin Öğrenme (4)", fs=12.5, bold=True, color=GOLDD)
    for i, n in enumerate(["Derin ÇKA (512-256-128-64)", "Artık ÇKA (3 blok)",
                           "Dikkat ÇKA (4 baş)", "1B-ESA (Conv1D)"]):
        top = 2.05 + i*0.6
        rect(s, 4.55, top, 4.0, 0.52, WHITE, GOLD, 0.8)
        text(s, 4.67, top, 3.8, 0.52, n, fs=11, color=DGRAY, anchor=MSO_ANCHOR.MIDDLE)
    panel(s, 8.75, 1.62, 4.18, 2.5, "Eğitim Protokolü",
          ["Stratifiye 5-katlı CV",
           "Kat-içi StandardScaler",
           "Adam optimize edici (DL)",
           "class_weight + is_unbalance",
           "TreeSHAP açıklanabilirlik"],
          fill=MGRAY, bar=NAVY, bfs=11.5, gap=6)
    panel(s, 8.75, 4.32, 4.18, 2.45, "Eşik Optimizasyonu (Youden J)",
          ["J(θ) = TPR(θ) − FPR(θ)", "",
           "θ* = 0,4316  (varsayılan 0,5 yerine)", "",
           "Brier skoru = 0,083 → model iyi kalibre; "
           "güven düzeyleri gerçek doğruluğu yansıtır."],
          fill=TEALL, bar=TEAL, bfs=11.5, gap=5)
    footer(s)

    # 8 · Sonuçlar TABLOSU (11 model)
    s = slide(prs); bg(s, PAPER)
    header(s, "Bölüm 8", "Sonuçlar — Model Karşılaştırması",
           "5-katlı çapraz doğrulama · ROC-AUC sırasına göre")
    rows = [[str(i+1)] + list(m) for i, m in enumerate(MODELS)]
    table(s, 0.4, 1.68, [0.6, 3.1, 1.0, 1.95, 1.75, 1.95, 1.78],
          ["#", "Model", "Tip", "Doğruluk", "F1", "ROC-AUC", "Std"], rows,
          row_h=0.41, fs=11, hdr_fs=11.5, highlight_row=0,
          align_cols=[PP_ALIGN.CENTER, PP_ALIGN.LEFT, PP_ALIGN.CENTER,
                      PP_ALIGN.CENTER, PP_ALIGN.CENTER, PP_ALIGN.CENTER, PP_ALIGN.CENTER])
    text(s, 0.4, 6.62, 12.5, 0.34,
         "LightGBM en yüksek ROC-AUC (0,9548) ve en düşük varyans (±0,0023) — "
         "yüksek performans istikrarsız optimumlardan değil, sağlam öznitelik temsilinden geliyor.",
         fs=10.5, italic=True, color=TGRAY)
    footer(s)

    # 8b · ROC + confusion (görsel)
    s = slide(prs); bg(s, PAPER)
    header(s, "Bölüm 8", "ROC Eğrileri ve Karmaşıklık Matrisi")
    image(s, f"{FIGS}/paper_roc_curves.png", 0.4, 1.78, 5.9, 4.3,
          "Şekil 4: Makine öğrenmesi ROC eğrileri")
    image(s, f"{FIGS}/paper_confusion_matrix_lightgbm.png", 6.55, 1.78, 4.5, 4.3,
          "Şekil 8: LightGBM karmaşıklık matrisi (θ*=0,4316)")
    panel(s, 11.25, 1.78, 1.68, 4.3, "Matris",
          ["DN 2.721", "(%87,4)", "", "DP 1.862", "(%89,4)", "", "YP 392", "(%12,6)",
           "", "YN 220", "(%10,6)"],
          fill=MGRAY, bar=NAVY, tfs=12, bfs=10, gap=2)
    footer(s)

    # 9 · SHAP + tablo
    s = slide(prs); bg(s, PAPER)
    header(s, "Bölüm 9", "Açıklanabilirlik — SHAP / TreeSHAP",
           "En belirleyici öznitelik: spectral_flatness_std")
    image(s, f"{FIGS}/shap_summary.png", 0.4, 1.78, 5.8, 4.6,
          "Şekil 7: TreeSHAP global etki diyagramı")
    text(s, 6.5, 1.7, 6.4, 0.36, "İlk 10 Öznitelik — Tablo 6", fs=13, bold=True, color=NAVY)
    table(s, 6.5, 2.12, [0.55, 3.35, 1.25, 1.28],
          ["#", "Öznitelik", "Önem", "Aile"], FEAT10, row_h=0.4, fs=10, hdr_fs=10.5,
          highlight_row=0,
          align_cols=[PP_ALIGN.CENTER, PP_ALIGN.LEFT, PP_ALIGN.CENTER, PP_ALIGN.CENTER])
    text(s, 6.5, 6.5, 6.4, 0.5,
         "Yüksek spectral_flatness_std değerleri modeli YZ sınıfına yönlendiriyor — "
         "bağımsız ses deepfake literatürüyle [16] örtüşüyor.", fs=10.5, italic=True, color=TGRAY)
    footer(s)

    # 10 · Tanılayıcı analizler
    s = slide(prs); bg(s, PAPER)
    header(s, "Bölüm 10", "Tanılayıcı Analizler")
    panel(s, 0.4, 1.75, 6.15, 2.35, "Kaynak Bazlı Performans (Şekil 13)",
          ["Suno parçaları:  %93,0 duyarlılık",
           "Echoes alt kümesi:  %88,6 duyarlılık",
           "Deepfake alt kümesi:  %50,0 duyarlılık",
           "",
           "Deepfake düşüşü genel başarısızlık değil; bu küme konuşma deepfake'inden "
           "türetilmiş, müzik üretim imzalarını taşımıyor (dağılım kayması)."],
          fill=AMBER, bar=GOLD, bfs=11, gap=4)
    panel(s, 0.4, 4.25, 6.15, 2.35, "Aşırı Uyum Tanısı (Şekil 14)",
          ["Ağaç modellerinde eğitim ile CV doğruluğu arasında 8–14 puanlık açık var.",
           "",
           "Rastgele Orman uç örnek: eğitim %100 → CV %86,1.",
           "Lojistik Regresyon en dengeli (0,6 puan) ama düşük kapasiteli."],
          fill=REDL, bar=RED, bfs=11, gap=4)
    image(s, f"{FIGS}/threshold_sweep.png", 6.75, 1.78, 6.15, 2.9,
          "Şekil 12: Karar eşiği taraması (0,40–0,50 platosu)")
    panel(s, 6.75, 5.05, 6.15, 1.55, "Öznitelik Sayısı Analizi (Şekil 16)",
          ["Doğruluk N=30'da platoya ulaşıyor; son 17 özniteliğin ölçülebilir katkısı yok. "
           "Gelecek yinelemede ~30 öznitelikle benzer doğruluk elde edilebilir."],
          fill=MGRAY, bar=TEAL, bfs=11, gap=4)
    footer(s)

    # 11 · Literatür karşılaştırma
    s = slide(prs); bg(s, PAPER)
    header(s, "Bölüm 11", "İlgili Çalışmalarla Karşılaştırma — Tablo 7")
    table(s, 0.4, 1.78, [2.9, 3.7, 2.0, 1.95, 1.98],
          ["Çalışma", "Yaklaşım", "Veri Kümesi", "ROC-AUC", "F1"], LIT_ROWS,
          row_h=0.62, fs=11, highlight_row=5,
          align_cols=[PP_ALIGN.LEFT, PP_ALIGN.LEFT, PP_ALIGN.CENTER,
                      PP_ALIGN.CENTER, PP_ALIGN.CENTER])
    panel(s, 0.4, 6.0, 12.53, 0.95, "Konumlandırma",
          ["AURIS (0,9548), Transformer tabanlı SONICS (0,960) ile Li vd. (0,931) arasında — "
           "üstelik derin öğrenme altyapısı gerektirmeden ve katlar arası en düşük varyansla (±0,0023)."],
          fill=TEALL, bar=TEAL, bfs=11.5, gap=3)
    footer(s)

    # 11b · Kısıtlamalar / güçlü yönler
    s = slide(prs); bg(s, PAPER)
    header(s, "Bölüm 11", "Kısıtlamalar ve Güçlü Yönler")
    text(s, 0.4, 1.7, 6.15, 0.38, "Kısıtlamalar", fs=14, bold=True, color=RED)
    lim = [("Dağılım kayması", "Eğitim dışı YZ sistemlerine ve deepfake setine (%50) sınırlı genelleme."),
           ("Aşırı uyum eğilimi", "Ağaç modellerinde 8–14 puanlık eğitim-CV açığı."),
           ("Öznitelik fazlalığı", "Son 17 özniteliğin doğruluğa ölçülebilir katkısı yok."),
           ("Gerçek zaman", "Düşük gecikmeli çıkarım henüz test edilmedi.")]
    for i, (t, d) in enumerate(lim):
        top = 2.18 + i*1.16
        rect(s, 0.4, top, 6.15, 1.04, REDL, RED, 1.0)
        text(s, 0.55, top+0.1, 5.9, 0.35, "⚠  "+t, fs=12, bold=True, color=RED)
        text(s, 0.55, top+0.46, 5.9, 0.5, d, fs=10.5, color=DGRAY)
    text(s, 6.78, 1.7, 6.15, 0.38, "Güçlü Yönler", fs=14, bold=True, color=GREEN)
    strg = [("Heterojen öznitelik", "5 aile / 47 boyut — tek temsile aşırı uyumu sınırlar."),
            ("Açıklanabilirlik", "TreeSHAP ile global ve yerel karar gerekçesi."),
            ("Eşik optimizasyonu", "Youden J ile dengeli karar (θ*=0,4316)."),
            ("Düşük varyans", "±0,0023 katlar arası std — en kararlı model.")]
    for i, (t, d) in enumerate(strg):
        top = 2.18 + i*1.16
        rect(s, 6.78, top, 6.15, 1.04, GREENL, GREEN, 1.0)
        text(s, 6.93, top+0.1, 5.9, 0.35, "✓  "+t, fs=12, bold=True, color=GREEN)
        text(s, 6.93, top+0.46, 5.9, 0.5, d, fs=10.5, color=DGRAY)
    footer(s)

    # 11c · Sonuçlar
    s = slide(prs); bg(s, PAPER)
    header(s, "Bölüm 11", "Sonuçlar")
    res = [("Uçtan uca tespit sistemi", "47 boyutlu vektör + 11 modelli topluluk, 5.195 örnekte eğitildi."),
           ("LightGBM lider", "ROC-AUC 0,9548, en düşük varyans (±0,0023); Derin ÇKA 0,9542 ile ikinci."),
           ("spectral_flatness_std belirleyici", "YZ-insan ayrımındaki en güçlü öznitelik; literatürle [16] tutarlı."),
           ("Hafif ama rekabetçi", "Derin öğrenme altyapısı olmadan SONICS'e yakın AUC."),
           ("Tanılanan sınırlar", "Aşırı uyum açığı, öznitelik fazlalığı, deepfake setinde dağılım kayması.")]
    for i, (t, d) in enumerate(res):
        top = 1.78 + i*1.02
        rect(s, 0.4, top, 12.53, 0.9, WHITE if i % 2 == 0 else MGRAY, TEAL, 1.0)
        rect(s, 0.4, top, 0.7, 0.9, NAVY)
        text(s, 0.4, top, 0.7, 0.9, str(i+1), fs=22, bold=True, color=GOLD,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        text(s, 1.3, top, 4.6, 0.9, t, fs=13, bold=True, color=NAVY, anchor=MSO_ANCHOR.MIDDLE)
        text(s, 6.0, top, 6.8, 0.9, d, fs=11.5, color=DGRAY, anchor=MSO_ANCHOR.MIDDLE)
    footer(s)

    # 11d · Gelecek
    s = slide(prs); bg(s, PAPER)
    header(s, "Bölüm 11", "Gelecek Çalışmalar")
    fut = [("Kısa Vade", GREENL, GREEN,
            ["SONICS / FakeMusicCaps ile üretici-bağımsız değerlendirme",
             "wav2vec2 ince ayarı ile doğrudan karşılaştırma",
             "MP3, perde kaydırma, zaman gerdirme sağlamlık testleri"]),
           ("Orta Vade", RGBColor(0xE8,0xF0,0xFA), STEEL,
            ["Alan uyarlama (domain adaptation) ile genelleme",
             "Gerçek zamanlı düşük gecikmeli çıkarım",
             "Veri kümesini 10.000 örneğe genişletme"]),
           ("Uzun Vade", AMBER, GOLDD,
            ["Yeni nesil üretici sistemlerin kapsanması",
             "Watermarking ve ses parmak izi entegrasyonu",
             "Sosyal medya ve canlı akış entegrasyonu"])]
    for ci, (title, fill, bar, items) in enumerate(fut):
        lft = 0.4 + ci*4.25
        rect(s, lft, 1.78, 4.0, 4.85, fill, bar, 1.2)
        rect(s, lft, 1.78, 4.0, 0.6, bar)
        text(s, lft+0.15, 1.78, 3.7, 0.6, title, fs=15, bold=True, color=WHITE,
             anchor=MSO_ANCHOR.MIDDLE)
        paras(s, lft+0.2, 2.6, 3.65, 3.9, items, fs=12, color=DGRAY, gap=14, lead="•  ")
    footer(s)

    # Teşekkür
    s = slide(prs); bg(s, NAVY)
    rect(s, 0, 2.9, SW, 0.06, GOLD)
    text(s, 0.5, 1.15, 12.3, 1.1, "Dinlediğiniz için teşekkürler.", fs=36, bold=True,
         color=WHITE, align=PP_ALIGN.CENTER)
    text(s, 0.5, 2.3, 12.3, 0.6, "Sorularınızı bekliyorum.", fs=22, color=GOLD, align=PP_ALIGN.CENTER)
    for i, (v, l) in enumerate([("0,9548", "ROC-AUC"), ("47", "Öznitelik"),
                                ("11", "Model"), ("5.195", "Örnek")]):
        lft = 1.15 + i*2.78
        rect(s, lft, 3.45, 2.45, 1.4, NAVY2, TEAL, 1.0)
        text(s, lft, 3.55, 2.45, 0.65, v, fs=26, bold=True, color=GOLD,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        text(s, lft, 4.18, 2.45, 0.5, l, fs=12, color=WHITE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    text(s, 0.5, 5.25, 12.3, 0.42, "Hasan Arthur Altuntaş  ·  hasannarthurrr@gmail.com",
         fs=14, color=RGBColor(0xAD,0xC4,0xD6), align=PP_ALIGN.CENTER)
    text(s, 0.5, 5.7, 12.3, 0.38, "Düzce Üniversitesi · Bilgisayar Mühendisliği · BM498 · 2025-2026",
         fs=12, color=RGBColor(0x5E,0x7A,0x94), align=PP_ALIGN.CENTER)
    imza(slide(prs), "05", "Final Savunma Sunumu")


# ════════════════ ÜRET ════════════════
def build():
    out = 'docs/academic/TeslimEdilecekler/Sunumlar'
    os.makedirs(out, exist_ok=True)
    jobs = [("01_Donem_Baslangic_Sunumu", s01, "Dönem Başlangıç Sunumu"),
            ("02_Literatur_Taramasi_Sunumu", s02, "Literatür Taraması Sunumu"),
            ("03_Tasarim_ve_Gelistirme_Sunumu", s03, "Tasarım ve Geliştirme Sunumu"),
            ("04_Sonuc_ve_Demo_Sunumu", s04, "Sonuç ve Demo Sunumu"),
            ("05_Final_Savunma_Sunumu", s05, "Final Savunma Sunumu")]
    for fname, fn, _ in jobs:
        p = newp(); fn(p); p.save(f"{out}/{fname}.pptx")
        print(f"[OK]  {fname}.pptx  ({len(p.slides)} slayt)")
    # Birleşik
    pA = newp()
    for fname, fn, title in jobs:
        divider(pA, fname[:2], title)
        fn(pA)
    pA.save(f"{out}/AURIS_Tum_Sunumlar_Birlesik.pptx")
    print(f"[OK]  AURIS_Tum_Sunumlar_Birlesik.pptx  ({len(pA.slides)} slayt)")


if __name__ == "__main__":
    build()
