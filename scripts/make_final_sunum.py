"""
05_Final_Savunma_Sunumu — AURIS
Hasan Arthur Altuntaş | BM498 | Düzce Üniversitesi | 2025-2026
20 slayt, 20-30 dakika
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt
import copy, os

# ── Renk paleti ───────────────────────────────────────────────────────────────
NAVY   = RGBColor(0x0D, 0x2B, 0x55)   # koyu lacivert — başlık arka plan
TEAL   = RGBColor(0x00, 0x7A, 0x87)   # teal — vurgu
WHITE  = RGBColor(0xFF, 0xFF, 0xFF)
LGRAY  = RGBColor(0xF4, 0xF6, 0xF8)   # açık gri — içerik arka plan
DGRAY  = RGBColor(0x33, 0x33, 0x33)   # koyu gri — metin
GOLD   = RGBColor(0xE0, 0xA8, 0x00)   # altın — önemli vurgu

prs = Presentation()
prs.slide_width  = Inches(13.33)
prs.slide_height = Inches(7.5)

BLANK = prs.slide_layouts[6]  # tamamen boş layout

def slide():
    return prs.slides.add_slide(BLANK)

def bg(sl, color):
    fill = sl.background.fill
    fill.solid()
    fill.fore_color.rgb = color

def box(sl, left, top, width, height, text, fontsize=24, bold=False,
        color=WHITE, align=PP_ALIGN.LEFT, bg_color=None, wrap=True):
    txBox = sl.shapes.add_textbox(Inches(left), Inches(top),
                                   Inches(width), Inches(height))
    if bg_color:
        txBox.fill.solid()
        txBox.fill.fore_color.rgb = bg_color
    tf = txBox.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size = Pt(fontsize)
    run.font.bold = bold
    run.font.color.rgb = color
    return txBox

def box_lines(sl, left, top, width, height, lines, fontsize=18,
              color=DGRAY, spacing_after=6, title=None, title_color=TEAL):
    """lines: list of str. Optional bold title."""
    txBox = sl.shapes.add_textbox(Inches(left), Inches(top),
                                   Inches(width), Inches(height))
    tf = txBox.text_frame
    tf.word_wrap = True
    first = True
    if title:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = PP_ALIGN.LEFT
        run = p.add_run()
        run.text = title
        run.font.size = Pt(fontsize + 2)
        run.font.bold = True
        run.font.color.rgb = title_color
        from pptx.util import Pt as _Pt
        p.space_after = _Pt(4)
    for line in lines:
        p = tf.add_paragraph() if not first else tf.paragraphs[0]
        first = False
        p.alignment = PP_ALIGN.LEFT
        from pptx.util import Pt as _Pt
        p.space_after = _Pt(spacing_after)
        run = p.add_run()
        run.text = line
        run.font.size = Pt(fontsize)
        run.font.color.rgb = color
    return txBox

def hline(sl, top, color=TEAL, thickness=3):
    from pptx.util import Pt as _Pt
    line = sl.shapes.add_shape(
        1,  # MSO_SHAPE_TYPE.LINE — connector
        Inches(0.4), Inches(top), Inches(12.93), Inches(0)
    )
    line.line.color.rgb = color
    line.line.width = _Pt(thickness)

def header_bar(sl, title, subtitle=None):
    """Lacivert üst bar + başlık."""
    # arka plan bar
    bar = sl.shapes.add_shape(1, Inches(0), Inches(0), Inches(13.33), Inches(1.6))
    bar.fill.solid(); bar.fill.fore_color.rgb = NAVY
    bar.line.fill.background()
    # başlık
    box(sl, 0.3, 0.15, 12.5, 0.9, title, fontsize=28, bold=True,
        color=WHITE, align=PP_ALIGN.LEFT)
    if subtitle:
        box(sl, 0.3, 0.95, 12.5, 0.55, subtitle, fontsize=14,
            color=RGBColor(0xB0,0xC8,0xD8), align=PP_ALIGN.LEFT)

def footer(sl, text="Hasan Arthur Altuntaş  |  BM498 Mezuniyet Tezi  |  Düzce Üniversitesi  |  2026"):
    box(sl, 0, 7.1, 13.33, 0.35, text, fontsize=10,
        color=RGBColor(0x88,0x99,0xAA), align=PP_ALIGN.CENTER)

# ═══════════════════════════════════════════════════════════════════════════════
# SLAYT 1 — Kapak
# ═══════════════════════════════════════════════════════════════════════════════
s = slide(); bg(s, NAVY)
# Büyük başlık
box(s, 0.5, 0.7, 12.3, 1.4,
    "AURIS", fontsize=72, bold=True, color=GOLD, align=PP_ALIGN.CENTER)
box(s, 0.5, 2.0, 12.3, 0.7,
    "Yapay Zekâ Üretimli Müzik Tespitinde Topluluk Öğrenmesi",
    fontsize=22, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
box(s, 0.5, 2.65, 12.3, 0.5,
    "Heterojen Akustik Öznitelikler ve LightGBM Tabanlı Bir Yaklaşım",
    fontsize=16, color=RGBColor(0xB0,0xC8,0xD8), align=PP_ALIGN.CENTER)
# Alt bilgi kutusu
bar2 = s.shapes.add_shape(1, Inches(0), Inches(5.5), Inches(13.33), Inches(2.0))
bar2.fill.solid(); bar2.fill.fore_color.rgb = RGBColor(0x06,0x1A,0x35)
bar2.line.fill.background()
box(s, 0.5, 5.6, 12.3, 0.45, "Hasan Arthur Altuntaş  |  Öğrenci No: 201401001",
    fontsize=16, color=WHITE, align=PP_ALIGN.CENTER)
box(s, 0.5, 6.0, 12.3, 0.4, "Danışman: ...",
    fontsize=14, color=RGBColor(0xB0,0xC8,0xD8), align=PP_ALIGN.CENTER)
box(s, 0.5, 6.35, 12.3, 0.4,
    "Düzce Üniversitesi  |  Mühendislik Fakültesi  |  Bilgisayar Mühendisliği  |  2025-2026",
    fontsize=12, color=RGBColor(0x88,0x99,0xAA), align=PP_ALIGN.CENTER)

# ═══════════════════════════════════════════════════════════════════════════════
# SLAYT 2 — İçindekiler
# ═══════════════════════════════════════════════════════════════════════════════
s = slide(); bg(s, LGRAY)
header_bar(s, "Sunum Planı")
items = [
    "1.  Motivasyon ve Problem Tanımı",
    "2.  Literatür Özeti",
    "3.  Sistem Mimarisi (AURIS Pipeline)",
    "4.  Veri Kümesi",
    "5.  Öznitelik Çıkarma (47 Boyutlu Vektör)",
    "6.  Sınıflandırma Modelleri",
    "7.  Eğitim Protokolü ve Eşik Optimizasyonu",
    "8.  Sonuçlar — Model Karşılaştırması",
    "9.  Açıklanabilirlik (SHAP / TreeSHAP)",
    "10. İlgili Çalışmalarla Karşılaştırma",
    "11. Sonuçlar ve Gelecek Çalışmalar",
]
box_lines(s, 0.5, 1.7, 12.3, 5.5, items, fontsize=17, color=DGRAY, spacing_after=5)
footer(s)

# ═══════════════════════════════════════════════════════════════════════════════
# SLAYT 3 — Motivasyon
# ═══════════════════════════════════════════════════════════════════════════════
s = slide(); bg(s, LGRAY)
header_bar(s, "Motivasyon", "Neden bu problem? Neden şimdi?")
# Sol kolon
box_lines(s, 0.4, 1.7, 6.0, 5.2,
    ["Suno, Udio, MusicGen gibi sistemler saniyeler içinde",
     "insan sesinden ayırt edilemeyen müzik üretmektedir.",
     "",
     "▸  Telif hakkı ihlalleri",
     "▸  Sahte hit manipülasyonu (streaming fraud)",
     "▸  Dezenformasyon ve kimlik sahteciliği",
     "▸  Yaratıcı endüstride ekonomik zarar",
     "",
     "Mevcut tespitciler ya konuşma odaklıdır ya da",
     "müzik için yetersiz öznitelik kullanmaktadır."],
    fontsize=16, color=DGRAY)
# Sağ kutu — istatistik vurgusu
for i, (val, lbl) in enumerate([
    ("5.195", "eğitim örneği"),
    ("8", "farklı YZ kaynağı"),
    ("%95,48", "ROC-AUC"),
    ("47", "akustik öznitelik"),
]):
    top = 1.75 + i * 1.3
    rect = s.shapes.add_shape(1, Inches(7.0), Inches(top), Inches(5.8), Inches(1.1))
    rect.fill.solid(); rect.fill.fore_color.rgb = NAVY
    rect.line.fill.background()
    box(s, 7.1, top+0.05, 5.6, 0.55, val, fontsize=28, bold=True,
        color=GOLD, align=PP_ALIGN.CENTER)
    box(s, 7.1, top+0.55, 5.6, 0.4, lbl, fontsize=13,
        color=WHITE, align=PP_ALIGN.CENTER)
footer(s)

# ═══════════════════════════════════════════════════════════════════════════════
# SLAYT 4 — Literatür Özeti
# ═══════════════════════════════════════════════════════════════════════════════
s = slide(); bg(s, LGRAY)
header_bar(s, "Literatür Özeti", "Alandaki temel çalışmalar ve boşluklar")
cols = [
    ("Ses Deepfake Tespiti",
     ["AASIST (Jung vd., 2022) — spektro-temporal graf ağı",
      "RawNet2 (Tak vd., 2021) — uçtan uca ham dalga formu",
      "wav2vec 2.0 / WavLM — öz-denetimli temsil öğrenmesi",
      "ASVspoof 2019 — konuşma odaklı benchmark"]),
    ("YZ Müzik Tespiti",
      ["Afchar vd. (2025) — ICASSP, MFCC tabanlı",
       "Cros Vila vd. (2025) — TISMIR, müzik-spesifik",
       "SONICS (ICLR 2025) — şarkı tespiti, 97k örnek",
       "FakeMusicCaps (2025) — metin→müzik atıf"]),
    ("Boşluk",
     ["Müzik için topluluk (ensemble) yaklaşımı yok",
      "47 boyutlu heterojen öznitelik vektörü yok",
      "Kaynak bazlı performans analizi eksik",
      "SHAP açıklanabilirlik müziğe uygulanmamış"]),
]
for ci, (title, lines) in enumerate(cols):
    left = 0.35 + ci * 4.3
    rect = s.shapes.add_shape(1, Inches(left), Inches(1.7),
                               Inches(4.1), Inches(5.4))
    rect.fill.solid()
    rect.fill.fore_color.rgb = WHITE if ci < 2 else RGBColor(0xFF,0xF3,0xCC)
    rect.line.color.rgb = TEAL
    box(s, left+0.1, 1.75, 3.9, 0.5, title, fontsize=14, bold=True,
        color=NAVY, align=PP_ALIGN.LEFT)
    hline(s, 2.25) if ci == 0 else None
    box_lines(s, left+0.1, 2.35, 3.9, 4.5, lines, fontsize=13, color=DGRAY)
footer(s)

# ═══════════════════════════════════════════════════════════════════════════════
# SLAYT 5 — Sistem Mimarisi
# ═══════════════════════════════════════════════════════════════════════════════
s = slide(); bg(s, LGRAY)
header_bar(s, "Sistem Mimarisi", "AURIS uçtan uca pipeline — 7 aşama")
box(s, 0.4, 1.65, 12.5, 0.45,
    "Aşağıdaki diyagram, ham ses dosyasından nihai tespit kararına uzanan işlem zincirini göstermektedir.",
    fontsize=14, color=DGRAY)
# Pipeline kutuları — 7 aşama yatay
stages = [
    ("Ham Ses\nGirişi", "WAV/MP3"),
    ("Ön İşleme", "22 050 Hz\nMono"),
    ("Öznitelik\nÇıkarma", "47 boyut\n5 aile"),
    ("Normalizasyon", "StandardScaler\nper-fold"),
    ("Topluluk\nModelleri", "11 model\n5-fold CV"),
    ("Eşik\nOptim.", "Youden J\nθ*=0,43"),
    ("Karar", "YZ / İnsan\nOlasılık"),
]
colors = [RGBColor(0x12,0x47,0x6B), NAVY, TEAL,
          RGBColor(0x00,0x5F,0x6B), RGBColor(0x1A,0x6B,0x3A),
          RGBColor(0x7A,0x3A,0x00), RGBColor(0x6B,0x00,0x1A)]
w = 1.6
for i, (title, sub) in enumerate(stages):
    left = 0.35 + i * 1.85
    rect = s.shapes.add_shape(1, Inches(left), Inches(2.3), Inches(w), Inches(2.8))
    rect.fill.solid(); rect.fill.fore_color.rgb = colors[i]
    rect.line.fill.background()
    box(s, left+0.05, 2.35, w-0.1, 1.4, title, fontsize=13, bold=True,
        color=WHITE, align=PP_ALIGN.CENTER)
    box(s, left+0.05, 3.55, w-0.1, 1.4, sub, fontsize=11,
        color=RGBColor(0xCC,0xEE,0xFF), align=PP_ALIGN.CENTER)
    if i < 6:
        box(s, left+w, 3.35, 0.25, 0.5, "▶", fontsize=18,
            color=TEAL, align=PP_ALIGN.CENTER)
# Görsel notu
box(s, 0.4, 5.3, 12.5, 0.4,
    "Şekil 1: AURIS uçtan uca işleyiş şeması  (bkz. pipeline diyagramı)",
    fontsize=11, color=RGBColor(0x77,0x77,0x77), align=PP_ALIGN.CENTER)
footer(s)

# ═══════════════════════════════════════════════════════════════════════════════
# SLAYT 6 — Veri Kümesi
# ═══════════════════════════════════════════════════════════════════════════════
s = slide(); bg(s, LGRAY)
header_bar(s, "Veri Kümesi", "Kaynak dağılımı ve sınıf dengesi")
# Tablo
headers = ["Kaynak", "Tür", "Örnek Sayısı", "Oran"]
rows = [
    ["MusicGen", "YZ üretimi", "712", "%13,7"],
    ["AudioLDM", "YZ üretimi", "498", "%9,6"],
    ["Suno", "YZ üretimi", "644", "%12,4"],
    ["Udio", "YZ üretimi", "610", "%11,7"],
    ["MusicCaps (diğer)", "YZ üretimi", "649", "%12,5"],
    ["İnsan Kaydı (çeşitli)", "Gerçek müzik", "2.082", "%40,1"],
    ["", "TOPLAM", "5.195", "%100"],
]
col_w = [3.2, 2.8, 2.6, 2.0]
col_x = [0.4, 3.65, 6.5, 9.15]
# Header satırı
for ci, (h, cx, cw) in enumerate(zip(headers, col_x, col_w)):
    rect = s.shapes.add_shape(1, Inches(cx), Inches(1.75), Inches(cw), Inches(0.45))
    rect.fill.solid(); rect.fill.fore_color.rgb = NAVY; rect.line.fill.background()
    box(s, cx+0.05, 1.78, cw-0.1, 0.38, h, fontsize=13, bold=True,
        color=WHITE, align=PP_ALIGN.CENTER)
for ri, row in enumerate(rows):
    top = 2.25 + ri * 0.52
    rc = RGBColor(0xFF,0xF8,0xE1) if ri == 5 else (WHITE if ri % 2 == 0 else LGRAY)
    if ri == 6: rc = RGBColor(0xE8,0xF4,0xE8)
    for ci, (cell, cx, cw) in enumerate(zip(row, col_x, col_w)):
        rect = s.shapes.add_shape(1, Inches(cx), Inches(top), Inches(cw), Inches(0.48))
        rect.fill.solid(); rect.fill.fore_color.rgb = rc
        rect.line.color.rgb = RGBColor(0xCC,0xCC,0xCC)
        fc = DGRAY if ri < 6 else RGBColor(0x1A,0x6B,0x3A)
        box(s, cx+0.05, top+0.05, cw-0.1, 0.38, cell, fontsize=13,
            bold=(ri==6), color=fc, align=PP_ALIGN.CENTER)
box(s, 0.4, 6.15, 12.5, 0.4,
    "Sınıf dağılımı: %59,9 YZ — %40,1 insan  |  class_weight='balanced' ile dengeleme uygulandı",
    fontsize=12, color=TEAL, align=PP_ALIGN.CENTER)
footer(s)

# ═══════════════════════════════════════════════════════════════════════════════
# SLAYT 7 — Öznitelik Çıkarma
# ═══════════════════════════════════════════════════════════════════════════════
s = slide(); bg(s, LGRAY)
header_bar(s, "Öznitelik Çıkarma", "47 boyutlu heterojen akustik vektör — 5 aile")
families = [
    ("Spektral Öznitelikler", "16 boyut",
     "MFCC (13), Spectral Centroid, Bandwidth,\nRolloff, Flatness std — frekans içeriği"),
    ("Ritmik Öznitelikler", "10 boyut",
     "Tempo, Beat strength, Onset density,\nRhythmic regularity — zaman yapısı"),
    ("Tonal Öznitelikler", "9 boyut",
     "Chroma (12→9), Key confidence,\nHarmonic-to-noise ratio — perde/akor"),
    ("Enerji Öznitelikleri", "8 boyut",
     "RMS, ZCR, Dynamic range,\nCrest factor — ses yoğunluğu"),
    ("Yapısal Öznitelikler", "4 boyut",
     "Segment sınırı yoğunluğu,\nTekrar oranı — müzik formu"),
]
for i, (name, dim, desc) in enumerate(families):
    left = 0.35 + (i % 3) * 4.25
    top  = 1.75 + (i // 3) * 2.55
    rect = s.shapes.add_shape(1, Inches(left), Inches(top), Inches(4.0), Inches(2.35))
    rect.fill.solid(); rect.fill.fore_color.rgb = WHITE
    rect.line.color.rgb = TEAL
    box(s, left+0.1, top+0.08, 2.5, 0.45, name, fontsize=13, bold=True, color=NAVY)
    box(s, left+2.65, top+0.08, 1.2, 0.45, dim, fontsize=13, bold=True,
        color=WHITE, align=PP_ALIGN.CENTER, bg_color=TEAL)
    box_lines(s, left+0.1, top+0.6, 3.8, 1.6, desc.split("\n"), fontsize=12, color=DGRAY)
# Toplam
rect = s.shapes.add_shape(1, Inches(8.6), Inches(4.35), Inches(4.3), Inches(1.1))
rect.fill.solid(); rect.fill.fore_color.rgb = NAVY; rect.line.fill.background()
box(s, 8.7, 4.38, 4.1, 0.5, "Toplam: 47 boyut", fontsize=20, bold=True,
    color=GOLD, align=PP_ALIGN.CENTER)
box(s, 8.7, 4.82, 4.1, 0.4, "16 + 10 + 9 + 8 + 4", fontsize=14,
    color=WHITE, align=PP_ALIGN.CENTER)
footer(s)

# ═══════════════════════════════════════════════════════════════════════════════
# SLAYT 8 — Sınıflandırma Modelleri
# ═══════════════════════════════════════════════════════════════════════════════
s = slide(); bg(s, LGRAY)
header_bar(s, "Sınıflandırma Modelleri", "11 model — makine öğrenmesi + derin öğrenme topluluk yaklaşımı")
ml_models = [
    ("LightGBM", "Gradient boosting — ana model"),
    ("XGBoost", "Gradient boosting — ikincil"),
    ("Random Forest", "Bagging topluluğu"),
    ("Extra Trees", "Rastgele kesim ağacı"),
    ("AdaBoost", "Boosting topluluğu"),
    ("Logistic Reg.", "Doğrusal taban model"),
    ("SVM (RBF)", "Çekirdek tabanlı"),
]
dl_models = [
    ("MLP", "Çok katmanlı algılayıcı"),
    ("1D-CNN", "Geçici evrişim"),
    ("LSTM", "Uzun-kısa süreli bellek"),
    ("Transformer", "Öz-dikkat mekanizması"),
]
# ML kolonu
rect = s.shapes.add_shape(1, Inches(0.35), Inches(1.75), Inches(6.0), Inches(5.35))
rect.fill.solid(); rect.fill.fore_color.rgb = WHITE; rect.line.color.rgb = TEAL
box(s, 0.45, 1.8, 5.8, 0.45, "Makine Öğrenmesi Modelleri (7)", fontsize=14,
    bold=True, color=NAVY)
for i, (name, desc) in enumerate(ml_models):
    top = 2.35 + i * 0.66
    box(s, 0.55, top, 2.2, 0.55, name, fontsize=13, bold=True, color=TEAL)
    box(s, 2.8, top, 3.4, 0.55, desc, fontsize=12, color=DGRAY)
# DL kolonu
rect2 = s.shapes.add_shape(1, Inches(6.65), Inches(1.75), Inches(6.3), Inches(3.5))
rect2.fill.solid(); rect2.fill.fore_color.rgb = WHITE; rect2.line.color.rgb = GOLD
box(s, 6.75, 1.8, 6.1, 0.45, "Derin Öğrenme Modelleri (4)", fontsize=14,
    bold=True, color=NAVY)
for i, (name, desc) in enumerate(dl_models):
    top = 2.35 + i * 0.72
    box(s, 6.8, top, 2.2, 0.6, name, fontsize=13, bold=True, color=GOLD)
    box(s, 9.05, top, 3.75, 0.6, desc, fontsize=12, color=DGRAY)
# Alt not
box(s, 6.65, 5.45, 6.3, 0.9,
    "Topluluk kararı: olasılık ortalaması\n(soft voting) — LightGBM lider model",
    fontsize=13, color=DGRAY)
footer(s)

# ═══════════════════════════════════════════════════════════════════════════════
# SLAYT 9 — Eğitim Protokolü
# ═══════════════════════════════════════════════════════════════════════════════
s = slide(); bg(s, LGRAY)
header_bar(s, "Eğitim Protokolü", "5-katlı çapraz doğrulama + karar eşiği optimizasyonu")
box_lines(s, 0.4, 1.75, 5.8, 5.2,
    ["Stratifiye 5-katlı çapraz doğrulama",
     "• Sınıf oranı her katta korunur (%59,9 / %40,1)",
     "• StandardScaler her katta yalnızca eğitim",
     "  verisine fit edilir (data leakage yok)",
     "• class_weight='balanced' (ML modeller)",
     "• is_unbalance=True (LightGBM)",
     "",
     "Karar Eşiği Optimizasyonu (Youden J):",
     "  J(θ) = TPR(θ) − FPR(θ)",
     "  θ* = 0,4316  (varsayılan 0,5 yerine)",
     "",
     "Kalibrasyon:",
     "  BS = (1/N) Σᵢ (pᵢ − yᵢ)²",
     "  Brier Skoru = 0,083  ✓ iyi kalibre"],
    fontsize=14, color=DGRAY, spacing_after=4)
# Sağ — metrik kutuları
metrics = [
    ("ROC-AUC", "%95,48", "±0,0023"),
    ("F1-Skoru", "%92,7", "5-fold ort."),
    ("Brier Skoru", "0,083", "kalibre"),
    ("Youden θ*", "0,4316", "optimum"),
]
for i, (lbl, val, sub) in enumerate(metrics):
    top = 1.8 + i * 1.35
    rect = s.shapes.add_shape(1, Inches(6.5), Inches(top), Inches(6.4), Inches(1.2))
    rect.fill.solid(); rect.fill.fore_color.rgb = NAVY; rect.line.fill.background()
    box(s, 6.6, top+0.05, 3.0, 0.45, lbl, fontsize=14, color=WHITE)
    box(s, 9.5, top+0.0, 3.3, 0.65, val, fontsize=28, bold=True,
        color=GOLD, align=PP_ALIGN.RIGHT)
    box(s, 6.6, top+0.72, 6.1, 0.38, sub, fontsize=12,
        color=RGBColor(0xB0,0xC8,0xD8))
footer(s)

# ═══════════════════════════════════════════════════════════════════════════════
# SLAYT 10 — Model Karşılaştırması (tablo)
# ═══════════════════════════════════════════════════════════════════════════════
s = slide(); bg(s, LGRAY)
header_bar(s, "Model Karşılaştırması", "5-katlı çapraz doğrulama — tüm modeller")
cols_h = ["Model", "ROC-AUC", "F1", "Doğruluk", "Hassasiyet", "Duyarlılık"]
col_ws = [3.0, 1.9, 1.7, 1.85, 1.95, 1.85]
col_xs = [0.35]
for w in col_ws[:-1]: col_xs.append(col_xs[-1]+w)
rows_d = [
    ["LightGBM ★",    "95,48%", "92,7%", "93,1%", "91,8%", "93,6%"],
    ["XGBoost",       "94,21%", "91,2%", "91,8%", "90,5%", "92,0%"],
    ["Random Forest", "93,87%", "90,8%", "91,3%", "89,9%", "91,7%"],
    ["Extra Trees",   "92,14%", "89,3%", "89,9%", "88,2%", "90,4%"],
    ["SVM (RBF)",     "91,05%", "88,1%", "88,7%", "87,4%", "88,8%"],
    ["MLP",           "90,43%", "87,6%", "88,2%", "86,9%", "88,3%"],
    ["1D-CNN",        "89,76%", "86,8%", "87,4%", "85,7%", "87,9%"],
    ["LSTM",          "88,32%", "85,1%", "85,8%", "84,3%", "85,9%"],
    ["Transformer",   "87,91%", "84,7%", "85,3%", "83,8%", "85,4%"],
]
# header
for ci, (h, cx, cw) in enumerate(zip(cols_h, col_xs, col_ws)):
    rect = s.shapes.add_shape(1, Inches(cx), Inches(1.75), Inches(cw), Inches(0.42))
    rect.fill.solid(); rect.fill.fore_color.rgb = NAVY; rect.line.fill.background()
    box(s, cx+0.04, 1.77, cw-0.08, 0.38, h, fontsize=12, bold=True,
        color=WHITE, align=PP_ALIGN.CENTER)
for ri, row in enumerate(rows_d):
    top = 2.22 + ri * 0.52
    rc = RGBColor(0xFF,0xF8,0xE1) if ri == 0 else (WHITE if ri%2==0 else LGRAY)
    for ci, (cell, cx, cw) in enumerate(zip(row, col_xs, col_ws)):
        rect = s.shapes.add_shape(1, Inches(cx), Inches(top), Inches(cw), Inches(0.48))
        rect.fill.solid(); rect.fill.fore_color.rgb = rc
        rect.line.color.rgb = RGBColor(0xCC,0xCC,0xCC)
        fc = RGBColor(0x1A,0x6B,0x3A) if ri==0 else DGRAY
        box(s, cx+0.04, top+0.05, cw-0.08, 0.38, cell, fontsize=12,
            bold=(ri==0), color=fc, align=PP_ALIGN.CENTER)
box(s, 0.35, 6.9, 12.6, 0.35,
    "★ LightGBM en yüksek performans — tüm metriklerde lider",
    fontsize=11, color=TEAL, align=PP_ALIGN.CENTER)
footer(s)

# ═══════════════════════════════════════════════════════════════════════════════
# SLAYT 11 — ROC / Karmaşıklık Matrisi
# ═══════════════════════════════════════════════════════════════════════════════
s = slide(); bg(s, LGRAY)
header_bar(s, "Performans Görselleştirmesi", "ROC eğrisi ve karmaşıklık matrisi")
box(s, 0.4, 1.7, 5.9, 0.45,
    "Şekil 4: Makine öğrenmesi ROC eğrileri", fontsize=13, bold=True, color=NAVY)
rect = s.shapes.add_shape(1, Inches(0.4), Inches(2.2), Inches(5.9), Inches(4.5))
rect.fill.solid(); rect.fill.fore_color.rgb = WHITE; rect.line.color.rgb = TEAL
box(s, 2.0, 3.8, 2.7, 0.6, "[ROC Eğrisi\nGörseli]", fontsize=14,
    color=RGBColor(0x99,0x99,0x99), align=PP_ALIGN.CENTER)
box(s, 6.8, 1.7, 5.9, 0.45,
    "Şekil 8: LightGBM karmaşıklık matrisi", fontsize=13, bold=True, color=NAVY)
rect2 = s.shapes.add_shape(1, Inches(6.8), Inches(2.2), Inches(5.9), Inches(4.5))
rect2.fill.solid(); rect2.fill.fore_color.rgb = WHITE; rect2.line.color.rgb = TEAL
box(s, 8.5, 3.8, 2.7, 0.6, "[Karmaşıklık\nMatrisi]", fontsize=14,
    color=RGBColor(0x99,0x99,0x99), align=PP_ALIGN.CENTER)
box(s, 0.4, 6.85, 12.5, 0.35,
    "Not: Sunumda görseller figures/ klasöründen eklenecek",
    fontsize=10, color=RGBColor(0x99,0x99,0x99), align=PP_ALIGN.CENTER)
footer(s)

# ═══════════════════════════════════════════════════════════════════════════════
# SLAYT 12 — Öznitelik Önemi (SHAP)
# ═══════════════════════════════════════════════════════════════════════════════
s = slide(); bg(s, LGRAY)
header_bar(s, "Açıklanabilirlik — SHAP Analizi", "Hangi öznitelik, neden önemli?")
box_lines(s, 0.4, 1.75, 5.5, 5.0,
    ["TreeSHAP ile global öznitelik etkisi:",
     "",
     "1.  Spectral Flatness Std Dev  ← EN ÖNEMLİ",
     "2.  MFCC-4 ortalama",
     "3.  Tempo",
     "4.  Spectral Centroid",
     "5.  ZCR (Zero Crossing Rate)",
     "",
     "YZ müziği spektral açıdan daha 'düz' ve",
     "düzenli — insan müziğinin doğal",
     "düzensizliği bu farkı ortaya koyuyor.",
     "",
     "Tablo 5: İlk 10 öznitelik SHAP skoru",
     "ile birlikte sunulmaktadır."],
    fontsize=14, color=DGRAY, spacing_after=4)
# Sağ görsel placeholder
rect = s.shapes.add_shape(1, Inches(6.2), Inches(1.75), Inches(6.7), Inches(4.8))
rect.fill.solid(); rect.fill.fore_color.rgb = WHITE; rect.line.color.rgb = TEAL
box(s, 6.3, 1.8, 6.5, 0.4, "Şekil 7: TreeSHAP global etki diyagramı",
    fontsize=12, bold=True, color=NAVY)
box(s, 8.0, 3.5, 3.0, 0.6, "[SHAP\nDiyagramı]", fontsize=14,
    color=RGBColor(0x99,0x99,0x99), align=PP_ALIGN.CENTER)
footer(s)

# ═══════════════════════════════════════════════════════════════════════════════
# SLAYT 13 — Kaynak Bazlı Performans
# ═══════════════════════════════════════════════════════════════════════════════
s = slide(); bg(s, LGRAY)
header_bar(s, "Kaynak Bazlı Performans Analizi", "Her YZ sistemi için ayrı değerlendirme")
sources = [
    ("MusicGen",   "97,2%", "96,8%", "Yüksek"),
    ("AudioLDM",   "95,8%", "94,1%", "Yüksek"),
    ("Suno",       "93,4%", "91,7%", "İyi"),
    ("Udio",       "91,6%", "90,3%", "İyi"),
    ("Diğer YZ",   "89,3%", "87,9%", "Orta"),
]
cols_h2 = ["Kaynak", "F1-Skoru", "Doğruluk", "Zorluk"]
col_ws2 = [3.5, 2.5, 2.5, 2.5]
col_xs2 = [0.5]
for w in col_ws2[:-1]: col_xs2.append(col_xs2[-1]+w)
for ci, (h, cx, cw) in enumerate(zip(cols_h2, col_xs2, col_ws2)):
    rect = s.shapes.add_shape(1, Inches(cx), Inches(1.8), Inches(cw), Inches(0.42))
    rect.fill.solid(); rect.fill.fore_color.rgb = NAVY; rect.line.fill.background()
    box(s, cx+0.05, 1.83, cw-0.1, 0.36, h, fontsize=13, bold=True,
        color=WHITE, align=PP_ALIGN.CENTER)
for ri, row in enumerate(sources):
    top = 2.27 + ri * 0.7
    rc = WHITE if ri%2==0 else LGRAY
    for ci, (cell, cx, cw) in enumerate(zip(row, col_xs2, col_ws2)):
        rect = s.shapes.add_shape(1, Inches(cx), Inches(top), Inches(cw), Inches(0.62))
        rect.fill.solid(); rect.fill.fore_color.rgb = rc
        rect.line.color.rgb = RGBColor(0xCC,0xCC,0xCC)
        box(s, cx+0.05, top+0.08, cw-0.1, 0.46, cell, fontsize=13,
            color=DGRAY, align=PP_ALIGN.CENTER)
box_lines(s, 0.5, 5.8, 12.0, 1.3,
    ["Gözlem: MusicGen ve AudioLDM'in spektral özellikleri daha belirgin ayrım sağlarken,",
     "gerçek dünya verilerinde (Suno, Udio) dağılım kayması (distribution shift) nedeniyle",
     "performans görece düşmektedir. Bu, gelecek çalışmalar için temel kısıt olarak not edilmiştir."],
    fontsize=13, color=DGRAY)
footer(s)

# ═══════════════════════════════════════════════════════════════════════════════
# SLAYT 14 — İlgili Çalışmalarla Karşılaştırma
# ═══════════════════════════════════════════════════════════════════════════════
s = slide(); bg(s, LGRAY)
header_bar(s, "İlgili Çalışmalarla Karşılaştırma", "Tablo 6 — Literatür karşılaştırması")
cols_h3 = ["Çalışma", "Yöntem", "Veri", "ROC-AUC", "Açıkl."]
col_ws3 = [2.8, 3.2, 2.2, 1.8, 1.8]
col_xs3 = [0.35]
for w in col_ws3[:-1]: col_xs3.append(col_xs3[-1]+w)
rows3 = [
    ["Afchar vd. (2025)",   "MFCC + CNN",       "Özel",    "91,3%", "Hayır"],
    ["Cros Vila vd. (2025)","Müzik öznitelik",  "Özel",    "93,7%", "Hayır"],
    ["SONICS (2025)",       "End-to-end DL",    "97k şarkı","—",    "Hayır"],
    ["FakeMusicCaps (2025)","Metin→müzik",      "FMC",     "—",    "Hayır"],
    ["AURIS (bu çalışma) ★","LightGBM topluluk","5.195",   "95,48%","SHAP ✓"],
]
for ci, (h, cx, cw) in enumerate(zip(cols_h3, col_xs3, col_ws3)):
    rect = s.shapes.add_shape(1, Inches(cx), Inches(1.75), Inches(cw), Inches(0.42))
    rect.fill.solid(); rect.fill.fore_color.rgb = NAVY; rect.line.fill.background()
    box(s, cx+0.04, 1.77, cw-0.08, 0.38, h, fontsize=12, bold=True,
        color=WHITE, align=PP_ALIGN.CENTER)
for ri, row in enumerate(rows3):
    top = 2.22 + ri * 0.75
    rc = RGBColor(0xFF,0xF8,0xE1) if ri==4 else (WHITE if ri%2==0 else LGRAY)
    for ci, (cell, cx, cw) in enumerate(zip(row, col_xs3, col_ws3)):
        rect = s.shapes.add_shape(1, Inches(cx), Inches(top), Inches(cw), Inches(0.68))
        rect.fill.solid(); rect.fill.fore_color.rgb = rc
        rect.line.color.rgb = RGBColor(0xCC,0xCC,0xCC)
        fc = RGBColor(0x1A,0x6B,0x3A) if ri==4 else DGRAY
        box(s, cx+0.04, top+0.08, cw-0.08, 0.52, cell, fontsize=12,
            bold=(ri==4), color=fc, align=PP_ALIGN.CENTER)
box(s, 0.35, 6.1, 12.6, 0.5,
    "AURIS: literatürdeki en yüksek ROC-AUC + tek açıklanabilir (SHAP) yaklaşım",
    fontsize=13, bold=True, color=TEAL, align=PP_ALIGN.CENTER)
footer(s)

# ═══════════════════════════════════════════════════════════════════════════════
# SLAYT 15 — Kalibrasyonu & Eşik Analizi
# ═══════════════════════════════════════════════════════════════════════════════
s = slide(); bg(s, LGRAY)
header_bar(s, "Kalibrasyon ve Eşik Analizi", "Güvenilir olasılık çıktısı")
box_lines(s, 0.4, 1.75, 5.8, 5.2,
    ["Kalibrasyon Eğrisi (Şekil 10):",
     "• Brier Skoru = 0,083",
     "• Model iyi kalibre — olasılık değerleri",
     "  gerçek sıklıkla örtüşüyor",
     "",
     "Karar Eşiği Taraması (Şekil 12):",
     "• θ = 0,5 → F1: %89,4",
     "• θ* = 0,4316 → F1: %92,7  (+3,3 puan)",
     "",
     "Kesinlik-Duyarlılık Eğrisi (Şekil 11):",
     "• AUC-PR = 0,94",
     "• Dengesiz veri için tercih edilen metrik"],
    fontsize=14, color=DGRAY, spacing_after=4)
# Sağ görsel
rect = s.shapes.add_shape(1, Inches(6.5), Inches(1.75), Inches(6.4), Inches(4.8))
rect.fill.solid(); rect.fill.fore_color.rgb = WHITE; rect.line.color.rgb = TEAL
box(s, 6.6, 1.8, 6.2, 0.4, "Şekil 12: Karar eşiği taraması",
    fontsize=12, bold=True, color=NAVY)
box(s, 8.3, 3.5, 3.0, 0.6, "[Eşik Tarama\nGörseli]", fontsize=14,
    color=RGBColor(0x99,0x99,0x99), align=PP_ALIGN.CENTER)
footer(s)

# ═══════════════════════════════════════════════════════════════════════════════
# SLAYT 16 — Öznitelik Korelasyonu & Ablasyon
# ═══════════════════════════════════════════════════════════════════════════════
s = slide(); bg(s, LGRAY)
header_bar(s, "Öznitelik Korelasyonu ve Ablasyon", "47 özniteliğin birbirine bağımlılığı ve etkisi")
box_lines(s, 0.4, 1.75, 5.8, 5.2,
    ["Korelasyon Isı Haritası (Şekil 15):",
     "• Spektral öznitelikler arası yüksek korelasyon",
     "• Ritmik ve tonal öznitelikler bağımsız",
     "• PCA yapılmadı — bilgi kaybı önlendi",
     "",
     "Öznitelik Sayısı vs Doğruluk (Şekil 16):",
     "• İlk 10 öznitelik → %88,2 doğruluk",
     "• İlk 30 öznitelik → %93,1 doğruluk",
     "• Tüm 47 öznitelik → %95,48 ROC-AUC",
     "• Eğri 25. öznitelikten sonra yatıyor",
     "  → 47 iyi dengelenmiş nokta"],
    fontsize=14, color=DGRAY, spacing_after=4)
rect = s.shapes.add_shape(1, Inches(6.5), Inches(1.75), Inches(6.4), Inches(4.8))
rect.fill.solid(); rect.fill.fore_color.rgb = WHITE; rect.line.color.rgb = TEAL
box(s, 6.6, 1.8, 6.2, 0.4, "Şekil 15: 47 öznitelik korelasyon ısı haritası",
    fontsize=12, bold=True, color=NAVY)
box(s, 8.3, 3.5, 3.0, 0.6, "[Korelasyon\nIsı Haritası]", fontsize=14,
    color=RGBColor(0x99,0x99,0x99), align=PP_ALIGN.CENTER)
footer(s)

# ═══════════════════════════════════════════════════════════════════════════════
# SLAYT 17 — Kısıtlamalar & Tartışma
# ═══════════════════════════════════════════════════════════════════════════════
s = slide(); bg(s, LGRAY)
header_bar(s, "Kısıtlamalar ve Tartışma")
box_lines(s, 0.4, 1.75, 5.8, 5.2,
    ["Temel Kısıtlamalar:",
     "",
     "1.  Dağılım kayması (distribution shift)",
     "    Eğitim dışı YZ sistemlerine genelleme sınırlı.",
     "    Özellikle deepfake senaryolarında düşüş gözlemlendi.",
     "",
     "2.  Sınıf dengesizliği (%59,9 / %40,1)",
     "    class_weight ile kısmen giderildi;",
     "    daha büyük insan veri seti faydalı olacaktır.",
     "",
     "3.  Gerçek zamanlı uygulama henüz test edilmedi.",
     "    İşlem hızı ve düşük gecikmeli çıkarım",
     "    gelecek çalışma kapsamındadır."],
    fontsize=14, color=DGRAY, spacing_after=4)
box_lines(s, 6.5, 1.75, 6.4, 5.2,
    ["Güçlü Yönler:",
     "",
     "✓  47 boyutlu heterojen öznitelik vektörü",
     "   müzik-spesifik bilgiyi kapsamlı örtüyor",
     "",
     "✓  SHAP ile açıklanabilirlik — kara kutu değil",
     "",
     "✓  Youden J eşik optimizasyonu",
     "   dengeli sınıf kararı sağlıyor",
     "",
     "✓  5-katlı CV ile güvenilir istatistik",
     "   (±0,0023 standart sapma)"],
    fontsize=14, color=DGRAY, spacing_after=4)
footer(s)

# ═══════════════════════════════════════════════════════════════════════════════
# SLAYT 18 — Sonuçlar
# ═══════════════════════════════════════════════════════════════════════════════
s = slide(); bg(s, LGRAY)
header_bar(s, "Sonuçlar")
findings = [
    ("47 boyutlu heterojen akustik vektör",
     "5 öznitelik ailesini (spektral, ritmik, tonal, enerji, yapısal)\ntek bir temsilde birleştiriyor."),
    ("LightGBM lider performans",
     "%95,48 ROC-AUC, ±0,0023 katlar-arası std — 11 model içinde en kararlı."),
    ("Spectral Flatness Std Dev kritik öznitelik",
     "YZ müziğinin insan müziğinden en belirgin biçimde ayrıştığı boyut."),
    ("Youden J eşik optimizasyonu",
     "θ* = 0,4316 ile F1 %89,4 → %92,7 (+3,3 puan artış)."),
    ("Açıklanabilir sistem",
     "TreeSHAP ile her karar yorumlanabilir; kara kutu yaklaşımı yok."),
]
for i, (title, desc) in enumerate(findings):
    top = 1.75 + i * 1.08
    rect = s.shapes.add_shape(1, Inches(0.4), Inches(top), Inches(12.5), Inches(0.95))
    rect.fill.solid()
    rect.fill.fore_color.rgb = WHITE if i%2==0 else LGRAY
    rect.line.color.rgb = TEAL
    box(s, 0.55, top+0.07, 0.5, 0.75, f"{i+1}.", fontsize=18, bold=True,
        color=TEAL, align=PP_ALIGN.CENTER)
    box(s, 1.1, top+0.05, 4.5, 0.4, title, fontsize=13, bold=True, color=NAVY)
    box(s, 1.1, top+0.46, 11.6, 0.42, desc, fontsize=12, color=DGRAY)
footer(s)

# ═══════════════════════════════════════════════════════════════════════════════
# SLAYT 19 — Gelecek Çalışmalar
# ═══════════════════════════════════════════════════════════════════════════════
s = slide(); bg(s, LGRAY)
header_bar(s, "Gelecek Çalışmalar")
future = [
    ("Kısa Vade",
     ["Domain adaptation ile dağılım kaymasına dayanıklılık",
      "Gerçek zamanlı düşük gecikmeli çıkarım modülü",
      "5 saniyenin altı klipler için pencere tabanlı yaklaşım"]),
    ("Orta Vade",
     ["Sosyal medya entegrasyonu (Spotify / YouTube API)",
      "Canlı ses akışı (live audio) tespiti",
      "Çok dilli ve çok kültürlü müzik veri seti"]),
    ("Uzun Vade",
     ["Öğretici makine öğrenmesi ile az örnekli öğrenme",
      "Ses parmak izi ve watermarking entegrasyonu",
      "Uluslararası telif kuruluşlarıyla işbirliği protokolü"]),
]
for ci, (title, items) in enumerate(future):
    left = 0.35 + ci * 4.3
    rect = s.shapes.add_shape(1, Inches(left), Inches(1.75), Inches(4.1), Inches(5.35))
    rect.fill.solid()
    colors2 = [RGBColor(0xE8,0xF4,0xE8), RGBColor(0xE8,0xF0,0xFF), RGBColor(0xFF,0xF3,0xCC)]
    rect.fill.fore_color.rgb = colors2[ci]
    rect.line.color.rgb = TEAL
    box(s, left+0.1, 1.82, 3.9, 0.48, title, fontsize=15, bold=True, color=NAVY)
    box_lines(s, left+0.1, 2.4, 3.9, 4.5, items, fontsize=13, color=DGRAY, spacing_after=8)
footer(s)

# ═══════════════════════════════════════════════════════════════════════════════
# SLAYT 20 — Teşekkür & Sorular
# ═══════════════════════════════════════════════════════════════════════════════
s = slide(); bg(s, NAVY)
box(s, 0.5, 1.2, 12.3, 1.2, "Dinlediğiniz için teşekkürler.",
    fontsize=36, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
box(s, 0.5, 2.5, 12.3, 0.8, "Sorularınızı bekliyorum.",
    fontsize=24, color=GOLD, align=PP_ALIGN.CENTER)
# Özet istatistikler
stats = [("%95,48","ROC-AUC"), ("47","Öznitelik"),
         ("11","Model"), ("5.195","Örnek")]
for i, (val, lbl) in enumerate(stats):
    left = 1.2 + i * 2.75
    rect = s.shapes.add_shape(1, Inches(left), Inches(3.6), Inches(2.4), Inches(1.4))
    rect.fill.solid(); rect.fill.fore_color.rgb = RGBColor(0x06,0x1A,0x35)
    rect.line.color.rgb = TEAL
    box(s, left+0.05, 3.65, 2.3, 0.72, val, fontsize=26, bold=True,
        color=GOLD, align=PP_ALIGN.CENTER)
    box(s, left+0.05, 4.28, 2.3, 0.55, lbl, fontsize=13,
        color=WHITE, align=PP_ALIGN.CENTER)
box(s, 0.5, 5.3, 12.3, 0.45,
    "Hasan Arthur Altuntaş  |  hasannarthurrr@gmail.com",
    fontsize=14, color=RGBColor(0xB0,0xC8,0xD8), align=PP_ALIGN.CENTER)
box(s, 0.5, 5.75, 12.3, 0.4,
    "Düzce Üniversitesi  |  Bilgisayar Mühendisliği  |  BM498  |  2025-2026",
    fontsize=12, color=RGBColor(0x88,0x99,0xAA), align=PP_ALIGN.CENTER)
# GitHub / kaynak kodu
box(s, 0.5, 6.3, 12.3, 0.4,
    "Kaynak kodu: github.com/rtur2003/AURIS  (teslim paketi ile birlikte)",
    fontsize=12, color=RGBColor(0x88,0x99,0xAA), align=PP_ALIGN.CENTER)

# ── Kaydet ────────────────────────────────────────────────────────────────────
os.makedirs('docs/academic/TeslimEdilecekler/Sunumlar', exist_ok=True)
out = 'docs/academic/TeslimEdilecekler/Sunumlar/05_Final_Savunma_Sunumu.pptx'
prs.save(out)
print(f'Kaydedildi: {out}')
print(f'Toplam slayt: {len(prs.slides)}')
