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


# devamı build_sunumlar2.py içinde import edilir
if __name__ == "__main__":
    pass
