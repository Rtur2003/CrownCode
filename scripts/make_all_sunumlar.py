"""
Tüm 5 sunum tek PPTX — bölüm bölüm
Her bölüm başında divider + sonunda imza sayfası
Export ederken sayfa aralığı seçerek 5 ayrı PDF üretilir.

Bölüm slayt aralıkları (export için):
  01_Donem_Baslangic:        1-7
  02_Literatur_Taramasi:     8-14
  03_Tasarim_ve_Gelistirme:  15-23
  04_Sonuc_ve_Demo:          24-31
  05_Final_Savunma:          32-53
"""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
import os

NAVY  = RGBColor(0x0D, 0x2B, 0x55)
TEAL  = RGBColor(0x00, 0x7A, 0x87)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LGRAY = RGBColor(0xF4, 0xF6, 0xF8)
DGRAY = RGBColor(0x33, 0x33, 0x33)
GOLD  = RGBColor(0xE0, 0xA8, 0x00)
RED   = RGBColor(0xCC, 0x00, 0x00)

prs = Presentation()
prs.slide_width  = Inches(13.33)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]

def slide():
    return prs.slides.add_slide(BLANK)

def bg(sl, color):
    fill = sl.background.fill
    fill.solid()
    fill.fore_color.rgb = color

def box(sl, left, top, width, height, text, fontsize=18, bold=False,
        color=WHITE, align=PP_ALIGN.LEFT):
    tb = sl.shapes.add_textbox(
        Inches(left), Inches(top), Inches(width), Inches(height))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = align
    r = p.add_run()
    r.text = text
    r.font.size = Pt(fontsize)
    r.font.bold = bold
    r.font.color.rgb = color
    return tb

def blines(sl, left, top, width, height, lines, fontsize=15, color=DGRAY, gap=5):
    tb = sl.shapes.add_textbox(
        Inches(left), Inches(top), Inches(width), Inches(height))
    tf = tb.text_frame
    tf.word_wrap = True
    first = True
    for line in lines:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.space_after = Pt(gap)
        r = p.add_run()
        r.text = line
        r.font.size = Pt(fontsize)
        r.font.color.rgb = color

def rect(sl, left, top, width, height, fill_color, line_color=None):
    sh = sl.shapes.add_shape(
        1, Inches(left), Inches(top), Inches(width), Inches(height))
    sh.fill.solid()
    sh.fill.fore_color.rgb = fill_color
    if line_color:
        sh.line.color.rgb = line_color
    else:
        sh.line.fill.background()
    return sh

def header_bar(sl, title, sub=None):
    rect(sl, 0, 0, 13.33, 1.55, NAVY)
    box(sl, 0.35, 0.12, 12.6, 0.85, title, fontsize=26, bold=True,
        color=WHITE, align=PP_ALIGN.LEFT)
    if sub:
        box(sl, 0.35, 0.92, 12.6, 0.5, sub, fontsize=13,
            color=RGBColor(0xB0,0xC8,0xD8), align=PP_ALIGN.LEFT)

def footer(sl, txt="Hasan Arthur Altuntaş  |  BM498  |  Düzce Üniversitesi  |  2025-2026"):
    box(sl, 0, 7.12, 13.33, 0.33, txt, fontsize=9,
        color=RGBColor(0x88,0x99,0xAA), align=PP_ALIGN.CENTER)

# ─── İMZA SAYFASI ─────────────────────────────────────────────────────────────
def imza_sayfasi(sl, sunum_no, sunum_adi):
    bg(sl, LGRAY)
    rect(sl, 0, 0, 13.33, 0.55, NAVY)
    box(sl, 0.35, 0.08, 12.6, 0.4,
        f"BM498 Mezuniyet Tezi — {sunum_no}: {sunum_adi}",
        fontsize=12, color=WHITE)
    # İmza kutusu
    rect(sl, 2.5, 1.2, 8.3, 5.8, WHITE, TEAL)
    box(sl, 2.6, 1.35, 8.1, 0.6,
        "ÖĞRENCİ İMZA SAYFASI", fontsize=18, bold=True,
        color=NAVY, align=PP_ALIGN.CENTER)
    # Çizgi
    ln = sl.shapes.add_shape(1, Inches(2.6), Inches(1.92), Inches(8.1), Inches(0))
    ln.line.color.rgb = TEAL; ln.line.width = Pt(1.5)

    fields = [
        ("Öğrenci Adı Soyadı", "Hasan Arthur Altuntaş"),
        ("Öğrenci Numarası", ""),
        ("Bölüm", "Bilgisayar Mühendisliği"),
        ("Danışman", ""),
        ("Sunum Tarihi", ""),
        ("Sunum Adı", sunum_adi),
    ]
    for i, (lbl, val) in enumerate(fields):
        top = 2.1 + i * 0.62
        box(sl, 2.7, top, 3.2, 0.35, lbl + ":", fontsize=12,
            bold=True, color=NAVY)
        box(sl, 5.95, top, 4.7, 0.35, val, fontsize=12, color=DGRAY)
        # alt çizgi
        ln2 = sl.shapes.add_shape(
            1, Inches(5.9), Inches(top+0.38), Inches(4.7), Inches(0))
        ln2.line.color.rgb = RGBColor(0xCC,0xCC,0xCC)
        ln2.line.width = Pt(1)

    # İmza alanı
    box(sl, 2.7, 5.95, 3.5, 0.4, "İmza:", fontsize=13, bold=True, color=NAVY)
    ln3 = sl.shapes.add_shape(1, Inches(3.6), Inches(6.32), Inches(6.6), Inches(0))
    ln3.line.color.rgb = DGRAY; ln3.line.width = Pt(1.5)
    box(sl, 3.6, 6.38, 6.6, 0.35,
        "(Öğrenci bu alanı imzalayarak sunumun kendisine ait olduğunu onaylar.)",
        fontsize=9, color=RGBColor(0x88,0x88,0x88), align=PP_ALIGN.CENTER)

# ─── BÖLÜM AYRAÇ SAYFASI ──────────────────────────────────────────────────────
def divider(sl, no, title, pages_hint):
    bg(sl, NAVY)
    rect(sl, 0, 2.8, 13.33, 0.08, TEAL)
    box(sl, 0.5, 0.7, 12.3, 1.0, no,
        fontsize=52, bold=True, color=GOLD, align=PP_ALIGN.CENTER)
    box(sl, 0.5, 1.7, 12.3, 0.9, title,
        fontsize=26, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    box(sl, 0.5, 3.1, 12.3, 0.5, pages_hint,
        fontsize=13, color=RGBColor(0xB0,0xC8,0xD8), align=PP_ALIGN.CENTER)
    box(sl, 0.5, 6.5, 12.3, 0.4,
        "Hasan Arthur Altuntaş  |  BM498  |  Düzce Üniversitesi  |  2025-2026",
        fontsize=11, color=RGBColor(0x55,0x77,0x99), align=PP_ALIGN.CENTER)

# ══════════════════════════════════════════════════════════════════════════════
#  BÖLÜM 1 — Dönem Başlangıç Sunumu  (slayt 1-7)
# ══════════════════════════════════════════════════════════════════════════════
s = slide()
divider(s, "01", "Dönem Başlangıç Sunumu",
        "PDF export: Slayt 1-7  |  Sunum tarihi: ___________")

# 1/1 — Kapak
s = slide(); bg(s, LGRAY)
header_bar(s, "Dönem Başlangıç Sunumu — AURIS Projesi",
           "BM498 Mezuniyet Tezi | 2025-2026 Güz Dönemi")
blines(s, 0.5, 1.7, 12.3, 4.5, [
    "Proje Adı:    AURIS — Yapay Zekâ Üretimli Müzik Tespitinde Topluluk Öğrenmesi",
    "",
    "Öğrenci:      Hasan Arthur Altuntaş",
    "Danışman:     ___________________________",
    "Bölüm:        Bilgisayar Mühendisliği, Düzce Üniversitesi",
    "",
    "Problem:      Suno, Udio, MusicGen gibi sistemlerin ürettiği müziği",
    "              insan yapımı müzikten otomatik olarak ayırt etmek.",
    "",
    "Hedef:        %90+ ROC-AUC ile sınıflandırma; açıklanabilir model.",
], fontsize=15, color=DGRAY)
footer(s)

# 1/2 — Problem
s = slide(); bg(s, LGRAY)
header_bar(s, "Problem Tanımı ve Motivasyon")
blines(s, 0.5, 1.7, 12.3, 5.0, [
    "▸  2023-2025 arası metin-müzik sistemleri exponansiyel büyüme gösterdi.",
    "▸  Kullanıcılar ve platformlar gerçek müzikten YZ müziğini ayırt edemiyor.",
    "▸  Telif, sahte hit, dezenformasyon sorunları gündeme geldi.",
    "",
    "Mevcut eksikler:",
    "  • Konuşma deepfake dedektörleri müziğe iyi genelleme yapmıyor.",
    "  • Müzik-spesifik öznitelik setleri yetersiz.",
    "  • Açıklanabilir (XAI) yaklaşım yok.",
    "",
    "AURIS bu üç boşluğu doldurmayı hedeflemektedir.",
], fontsize=15, color=DGRAY)
footer(s)

# 1/3 — Planlanan Yöntem
s = slide(); bg(s, LGRAY)
header_bar(s, "Planlanan Yöntem ve Kapsam")
blines(s, 0.5, 1.7, 6.0, 5.0, [
    "Veri:",
    "  5 000+ örnek, 8 YZ kaynağı + insan kaydı",
    "",
    "Öznitelik:",
    "  47 boyutlu akustik vektör",
    "  (spektral, ritmik, tonal, enerji, yapısal)",
    "",
    "Model:",
    "  11 model topluluğu (ML + DL)",
    "  LightGBM lider",
    "",
    "Değerlendirme:",
    "  5-katlı çapraz doğrulama",
    "  SHAP açıklanabilirlik",
], fontsize=14, color=DGRAY)
blines(s, 6.8, 1.7, 6.1, 5.0, [
    "Zaman Planı:",
    "",
    "  Hafta 1-2:   Veri toplama",
    "  Hafta 3-4:   Öznitelik mühendisliği",
    "  Hafta 5-6:   Model eğitimi",
    "  Hafta 7-8:   Değerlendirme",
    "  Hafta 9-10:  Yazım ve sunum",
    "",
    "Risk:",
    "  Veri dengesi, DL eğitim süresi,",
    "  gerçek zamanlı uygulama kapsamı",
], fontsize=14, color=DGRAY)
footer(s)

# 1/4 — Beklenen Çıktılar
s = slide(); bg(s, LGRAY)
header_bar(s, "Beklenen Çıktılar")
for i, (t, d) in enumerate([
    ("Tespit Sistemi", "Uçtan uca çalışan, 47 öznitelikli LightGBM tabanlı sınıflandırıcı"),
    ("Açıklanabilirlik", "SHAP analiziyle hangi özniteliğin ne kadar katkı sağladığı"),
    ("Akademik Yayın", "GUJSA'ya gönderilmek üzere makale"),
    ("Kaynak Kodu", "GitHub üzerinde açık kaynak olarak paylaşım"),
]):
    top = 1.75 + i * 1.3
    rect(s, 0.4, top, 12.5, 1.15, WHITE, TEAL)
    box(s, 0.6, top+0.12, 3.5, 0.5, f"{i+1}.  {t}", fontsize=15,
        bold=True, color=NAVY)
    box(s, 4.3, top+0.12, 8.4, 0.9, d, fontsize=14, color=DGRAY)
footer(s)

# 1/İmza
s = slide()
imza_sayfasi(s, "01", "Dönem Başlangıç Sunumu")

# ══════════════════════════════════════════════════════════════════════════════
#  BÖLÜM 2 — Literatür Taraması  (slayt 8-14)
# ══════════════════════════════════════════════════════════════════════════════
s = slide()
divider(s, "02", "Literatür Taraması Sunumu",
        "PDF export: Slayt 8-14  |  Sunum tarihi: ___________")

# 2/1 — Giriş
s = slide(); bg(s, LGRAY)
header_bar(s, "Literatür Taraması — Kapsam",
           "Ses deepfake tespiti, YZ müzik tespiti, topluluk yöntemleri")
blines(s, 0.5, 1.7, 12.3, 4.8, [
    "Taranan kaynaklar:  39 makale, 2020-2026 arası",
    "Güncel oran:        %74 (son 5 yıl) — GUJSA %30 eşiğinin üstünde",
    "",
    "3 ana alan:",
    "  1.  Ses Derin Sahte Tespiti (Audio Deepfake Detection)",
    "  2.  GenAI Müzik Üretici Sistemleri",
    "  3.  GenAI Müzik Tespitinde Güncel Gelişmeler",
    "",
    "Temel boşluk: Müzik için topluluk öğrenmesi + SHAP açıklanabilirlik — literatürde yok.",
], fontsize=15, color=DGRAY)
footer(s)

# 2/2 — Ses Deepfake
s = slide(); bg(s, LGRAY)
header_bar(s, "Alan 1: Ses Derin Sahte Tespiti")
rows_lit = [
    ("AASIST", "Jung vd.", "2022", "Spektro-temporal GAT — ASVspoof 2019"),
    ("RawNet2", "Tak vd.", "2021", "Ham dalga formu, uçtan uca"),
    ("wav2vec 2.0", "Baevski vd.", "2020", "Öz-denetimli temsil öğrenmesi"),
    ("WavLM", "Chen vd.", "2022", "Maskelenmiş öngörüyle ön eğitim"),
    ("ADD 2022", "Yi vd.", "2022", "İlk YZ ses sentezi tespit yarışması"),
    ("ASVspoof 2019", "Wang vd.", "2020", "Büyük ölçekli benchmark, 64k örnek"),
]
for ci, h in enumerate(["Model / Çalışma", "Yazarlar", "Yıl", "Katkı"]):
    cws = [2.8, 2.5, 1.2, 6.5]; cxs = [0.35, 3.2, 5.75, 7.0]
    r = s.shapes.add_shape(1, Inches(cxs[ci]), Inches(1.75),
                            Inches(cws[ci]), Inches(0.4))
    r.fill.solid(); r.fill.fore_color.rgb = NAVY; r.line.fill.background()
    box(s, cxs[ci]+0.05, 1.78, cws[ci]-0.1, 0.34, h, fontsize=12,
        bold=True, color=WHITE, align=PP_ALIGN.CENTER)
for ri, row in enumerate(rows_lit):
    top = 2.2 + ri * 0.72
    rc = WHITE if ri%2==0 else LGRAY
    cws = [2.8, 2.5, 1.2, 6.5]; cxs = [0.35, 3.2, 5.75, 7.0]
    for ci, cell in enumerate(row):
        r2 = s.shapes.add_shape(1, Inches(cxs[ci]), Inches(top),
                                 Inches(cws[ci]), Inches(0.65))
        r2.fill.solid(); r2.fill.fore_color.rgb = rc
        r2.line.color.rgb = RGBColor(0xCC,0xCC,0xCC)
        box(s, cxs[ci]+0.05, top+0.1, cws[ci]-0.1, 0.45, cell,
            fontsize=12, color=DGRAY, align=PP_ALIGN.CENTER)
footer(s)

# 2/3 — YZ Müzik Tespiti
s = slide(); bg(s, LGRAY)
header_bar(s, "Alan 2 & 3: YZ Müzik Üretimi ve Tespiti")
blines(s, 0.5, 1.7, 6.0, 5.2, [
    "YZ Üretici Sistemler:",
    "  MusicGen (Copet vd., 2023) — Meta",
    "  AudioLDM (Liu vd., 2023) — latent diffusion",
    "  Suno / Udio — ticari, 2024",
    "",
    "Tespit Çalışmaları:",
    "  Afchar vd. (ICASSP 2025) — MFCC+CNN",
    "  Cros Vila vd. (TISMIR 2025) — müzik öznitelik",
    "  Li vd. (Sci. Rep. 2026) — açıklanabilir",
    "",
    "Veri Setleri:",
    "  SONICS (ICLR 2025) — 97k şarkı",
    "  FakeMusicCaps (J. Imaging 2025)",
    "  WaveFake (NeurIPS 2021) — konuşma",
], fontsize=13, color=DGRAY)
blines(s, 6.8, 1.7, 6.1, 5.2, [
    "Boşluk Analizi:",
    "",
    "✗  Müzik için topluluk (ensemble) yok",
    "✗  47 boyutlu heterojen öznitelik yok",
    "✗  Kaynak bazlı performans analizi yok",
    "✗  SHAP açıklanabilirlik müziğe uygulanmamış",
    "✗  Youden J eşik optimizasyonu uygulanmamış",
    "",
    "AURIS bu 5 boşluğu dolduruyor.",
], fontsize=13, color=DGRAY)
footer(s)

# 2/İmza
s = slide()
imza_sayfasi(s, "02", "Literatür Taraması Sunumu")

# ══════════════════════════════════════════════════════════════════════════════
#  BÖLÜM 3 — Tasarım ve Geliştirme  (slayt 15-23)
# ══════════════════════════════════════════════════════════════════════════════
s = slide()
divider(s, "03", "Tasarım ve Geliştirme Sunumu",
        "PDF export: Slayt 15-23  |  Sunum tarihi: ___________")

# 3/1 — Sistem Tasarımı
s = slide(); bg(s, LGRAY)
header_bar(s, "Sistem Tasarımı — AURIS Pipeline")
stages = [("Ham Ses","WAV/MP3"), ("Ön İşleme","22 050 Hz"),
          ("Öznitelik","47 boyut"), ("Ölçekleme","StandardScaler"),
          ("Modeller","11 model"), ("Eşik","θ*=0,43"), ("Karar","YZ/İnsan")]
colors3 = [RGBColor(0x12,0x47,0x6B), NAVY, TEAL, RGBColor(0x00,0x5F,0x6B),
           RGBColor(0x1A,0x6B,0x3A), RGBColor(0x7A,0x3A,0x00), RGBColor(0x6B,0x00,0x1A)]
for i, ((t, sub), c) in enumerate(zip(stages, colors3)):
    left = 0.35 + i * 1.85
    rect(s, left, 2.1, 1.6, 2.8, c)
    box(s, left+0.05, 2.18, 1.5, 1.4, t, fontsize=13, bold=True,
        color=WHITE, align=PP_ALIGN.CENTER)
    box(s, left+0.05, 3.4, 1.5, 1.3, sub, fontsize=11,
        color=RGBColor(0xCC,0xEE,0xFF), align=PP_ALIGN.CENTER)
    if i < 6:
        box(s, left+1.6, 3.2, 0.25, 0.5, "▶", fontsize=16,
            color=TEAL, align=PP_ALIGN.CENTER)
blines(s, 0.4, 5.2, 12.5, 1.8, [
    "Veri akışı: librosa (öznitelik çıkarma) → scikit-learn (ML modeller) → "
    "LightGBM (ana model) → SHAP (açıklanabilirlik)",
    "Tüm adımlar 5-katlı CV içinde sarmalanmıştır; StandardScaler her katta "
    "yalnızca eğitim verisine fit edilir.",
], fontsize=13, color=DGRAY)
footer(s)

# 3/2 — Öznitelik Mühendisliği
s = slide(); bg(s, LGRAY)
header_bar(s, "Öznitelik Mühendisliği — 47 Boyutlu Vektör")
fams = [("Spektral (16)", "MFCC×13, centroid, bandwidth, rolloff, flatness std"),
        ("Ritmik (10)",   "Tempo, beat strength, onset density, rhythmic regularity"),
        ("Tonal (9)",     "Chroma×9, key confidence, HNR"),
        ("Enerji (8)",    "RMS, ZCR, dynamic range, crest factor"),
        ("Yapısal (4)",   "Segment sınırı yoğunluğu, tekrar oranı"),]
for i, (name, desc) in enumerate(fams):
    left = 0.35 + (i%3)*4.3; top = 1.75 + (i//3)*2.55
    rect(s, left, top, 4.0, 2.35, WHITE, TEAL)
    box(s, left+0.1, top+0.1, 3.8, 0.45, name, fontsize=14,
        bold=True, color=NAVY)
    box(s, left+0.1, top+0.65, 3.8, 1.55, desc, fontsize=12, color=DGRAY)
rect(s, 8.65, 4.35, 4.25, 1.1, NAVY)
box(s, 8.75, 4.4, 4.05, 0.55, "Toplam: 47 boyut", fontsize=18,
    bold=True, color=GOLD, align=PP_ALIGN.CENTER)
box(s, 8.75, 4.88, 4.05, 0.4, "16 + 10 + 9 + 8 + 4", fontsize=13,
    color=WHITE, align=PP_ALIGN.CENTER)
footer(s)

# 3/3 — Model Geliştirme
s = slide(); bg(s, LGRAY)
header_bar(s, "Model Geliştirme — 11 Model Topluluğu")
blines(s, 0.4, 1.7, 5.8, 5.2, [
    "Makine Öğrenmesi (7):",
    "  • LightGBM — is_unbalance=True",
    "  • XGBoost — scale_pos_weight",
    "  • Random Forest — class_weight=balanced",
    "  • Extra Trees",
    "  • AdaBoost",
    "  • Logistic Regression",
    "  • SVM (RBF kernel)",
    "",
    "Topluluk kararı:",
    "  Soft voting — olasılık ortalaması",
    "  LightGBM ağırlığı 2x",
], fontsize=14, color=DGRAY)
blines(s, 6.5, 1.7, 6.4, 5.2, [
    "Derin Öğrenme (4):",
    "  • MLP (3 katman, ReLU)",
    "  • 1D-CNN (temporal convolution)",
    "  • LSTM (128 birim, dropout=0,3)",
    "  • Transformer (2 head, dim=64)",
    "",
    "Sınıf dengesi:",
    "  %59,9 YZ — %40,1 insan",
    "  class_weight='balanced'",
    "  Oversample değil — ağırlık tabanlı",
], fontsize=14, color=DGRAY)
footer(s)

# 3/İmza
s = slide()
imza_sayfasi(s, "03", "Tasarım ve Geliştirme Sunumu")

# ══════════════════════════════════════════════════════════════════════════════
#  BÖLÜM 4 — Sonuç ve Demo  (slayt 24-31)
# ══════════════════════════════════════════════════════════════════════════════
s = slide()
divider(s, "04", "Sonuç ve Demo Sunumu",
        "PDF export: Slayt 24-31  |  Sunum tarihi: ___________")

# 4/1 — Özet Sonuçlar
s = slide(); bg(s, LGRAY)
header_bar(s, "Elde Edilen Sonuçlar — Özet")
for i, (lbl, val, sub) in enumerate([
    ("ROC-AUC",     "%95,48", "±0,0023 std"),
    ("F1-Skoru",    "%92,7",  "5-fold ort."),
    ("Brier",       "0,083",  "iyi kalibre"),
    ("Youden θ*",   "0,4316", "optimum eşik"),
]):
    left = 0.4 + i*3.2
    rect(s, left, 1.75, 3.0, 2.2, NAVY)
    box(s, left+0.1, 1.85, 2.8, 0.55, lbl, fontsize=14,
        color=WHITE, align=PP_ALIGN.CENTER)
    box(s, left+0.1, 2.35, 2.8, 0.85, val, fontsize=30,
        bold=True, color=GOLD, align=PP_ALIGN.CENTER)
    box(s, left+0.1, 3.15, 2.8, 0.45, sub, fontsize=12,
        color=RGBColor(0xB0,0xC8,0xD8), align=PP_ALIGN.CENTER)
blines(s, 0.4, 4.2, 12.5, 2.8, [
    "LightGBM tüm modeller içinde en yüksek performansı sağladı.",
    "Spectral Flatness Std Dev en önemli öznitelik olarak öne çıktı (SHAP).",
    "Youden J eşik optimizasyonu F1'i %89,4'ten %92,7'ye taşıdı (+3,3 puan).",
    "Model iyi kalibre: Brier Skoru 0,083 — olasılık değerleri güvenilir.",
], fontsize=14, color=DGRAY, gap=6)
footer(s)

# 4/2 — Demo Açıklaması
s = slide(); bg(s, LGRAY)
header_bar(s, "Sistem Demo — Çalışma Akışı")
blines(s, 0.5, 1.7, 7.0, 5.2, [
    "Demo Adımları:",
    "",
    "1.  Bir müzik dosyası (WAV/MP3) sisteme yüklenir.",
    "2.  Ön işleme: 22 050 Hz, mono, 30 sn örnekleme.",
    "3.  47 öznitelik çıkarılır (librosa tabanlı pipeline).",
    "4.  Eğitilmiş LightGBM modelinden olasılık alınır.",
    "5.  θ* = 0,4316 eşiği uygulanır.",
    "6.  Çıktı: 'YZ Üretimi' / 'İnsan Yapımı' + olasılık skoru.",
    "7.  SHAP değerleriyle hangi özniteliğin",
    "    kararı yönlendirdiği gösterilir.",
    "",
    "Sistem çalışma videosu teslim paketinde",
    "mevcuttur (Uygulama/demo_video.mp4).",
], fontsize=14, color=DGRAY)
rect(s, 7.8, 1.75, 5.1, 5.2, WHITE, TEAL)
box(s, 7.9, 1.85, 4.9, 0.45, "Demo Ekran Görüntüsü / Video",
    fontsize=13, bold=True, color=NAVY, align=PP_ALIGN.CENTER)
box(s, 9.0, 3.5, 2.8, 1.0, "[Demo\nEkran Görüntüsü]", fontsize=14,
    color=RGBColor(0x99,0x99,0x99), align=PP_ALIGN.CENTER)
footer(s)

# 4/3 — Katkı
s = slide(); bg(s, LGRAY)
header_bar(s, "Akademik Katkı ve Özgün Değer")
for i, (t, d) in enumerate([
    ("Heterojen 47 öznitelik vektörü",
     "5 farklı akustik aileden derlenen, müzik-spesifik kapsamlı özellik seti."),
    ("Topluluk öğrenmesi",
     "11 model soft-voting ile birleştiriliyor; tek model yaklaşımlarının üstünde."),
    ("SHAP açıklanabilirlik",
     "Müzik deepfake tespitinde SHAP kullanımı literatürde ilk kez uygulandı."),
    ("Youden J eşik optimizasyonu",
     "Dengesiz sınıf için varsayılan 0,5 eşiği optimize ediliyor."),
    ("GUJSA yayını",
     "Çalışma ulusal hakemli dergiye gönderilebilir formatta hazırlandı."),
]):
    top = 1.75 + i*1.05
    rect(s, 0.4, top, 12.5, 0.92, WHITE if i%2==0 else LGRAY, TEAL)
    box(s, 0.6, top+0.08, 0.45, 0.72, f"{i+1}.", fontsize=16,
        bold=True, color=TEAL, align=PP_ALIGN.CENTER)
    box(s, 1.1, top+0.06, 4.2, 0.38, t, fontsize=13, bold=True, color=NAVY)
    box(s, 1.1, top+0.46, 11.6, 0.38, d, fontsize=12, color=DGRAY)
footer(s)

# 4/İmza
s = slide()
imza_sayfasi(s, "04", "Sonuç ve Demo Sunumu")

# ══════════════════════════════════════════════════════════════════════════════
#  BÖLÜM 5 — Final Savunma  (slayt 32-53)
# ══════════════════════════════════════════════════════════════════════════════
s = slide()
divider(s, "05", "Final Savunma Sunumu",
        "PDF export: Slayt 32-53  |  Sunum tarihi: ___________")

# ── Kapak
s = slide(); bg(s, NAVY)
rect(s, 0, 0, 13.33, 7.5, NAVY)
box(s, 0.5, 0.65, 12.3, 1.1, "AURIS", fontsize=70, bold=True,
    color=GOLD, align=PP_ALIGN.CENTER)
box(s, 0.5, 1.7, 12.3, 0.72,
    "Yapay Zekâ Üretimli Müzik Tespitinde Topluluk Öğrenmesi",
    fontsize=21, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
box(s, 0.5, 2.38, 12.3, 0.5,
    "Heterojen Akustik Öznitelikler ve LightGBM Tabanlı Bir Yaklaşım",
    fontsize=15, color=RGBColor(0xB0,0xC8,0xD8), align=PP_ALIGN.CENTER)
rect(s, 0, 5.3, 13.33, 2.2, RGBColor(0x06,0x1A,0x35))
box(s, 0.5, 5.42, 12.3, 0.45, "Hasan Arthur Altuntaş",
    fontsize=16, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
box(s, 0.5, 5.85, 12.3, 0.4, "Danışman: ___________________________",
    fontsize=14, color=RGBColor(0xB0,0xC8,0xD8), align=PP_ALIGN.CENTER)
box(s, 0.5, 6.25, 12.3, 0.38,
    "Düzce Üniversitesi  |  Mühendislik Fakültesi  |  BM498  |  2025-2026",
    fontsize=12, color=RGBColor(0x88,0x99,0xAA), align=PP_ALIGN.CENTER)

# ── Sunum planı
s = slide(); bg(s, LGRAY)
header_bar(s, "Sunum Planı")
blines(s, 0.5, 1.7, 12.3, 5.5, [
    "1.   Motivasyon ve Problem Tanımı",
    "2.   Literatür Özeti",
    "3.   Sistem Mimarisi (AURIS Pipeline)",
    "4.   Veri Kümesi",
    "5.   Öznitelik Çıkarma (47 Boyutlu Vektör)",
    "6.   Sınıflandırma Modelleri ve Eğitim Protokolü",
    "7.   Sonuçlar — Model Karşılaştırması",
    "8.   Açıklanabilirlik (SHAP / TreeSHAP)",
    "9.   İlgili Çalışmalarla Karşılaştırma",
    "10.  Kısıtlamalar",
    "11.  Sonuçlar ve Gelecek Çalışmalar",
], fontsize=17, color=DGRAY, gap=5)
footer(s)

# ── Motivasyon
s = slide(); bg(s, LGRAY)
header_bar(s, "Motivasyon", "Neden AURIS? Neden şimdi?")
blines(s, 0.5, 1.7, 6.0, 5.2, [
    "Suno, Udio, MusicGen saniyeler içinde",
    "ayırt edilemez müzik üretiyor.",
    "",
    "▸  Telif hakkı ihlalleri",
    "▸  Sahte hit (streaming fraud)",
    "▸  Dezenformasyon",
    "▸  Yaratıcı ekonomide zarar",
    "",
    "Mevcut dedektörler konuşma odaklı —",
    "müzik için yeterli değil.",
], fontsize=15, color=DGRAY)
for i, (v, l) in enumerate([("%95,48","ROC-AUC"), ("47","Öznitelik"),
                              ("11","Model"), ("5.195","Örnek")]):
    top = 1.75 + i*1.3
    rect(s, 7.0, top, 5.9, 1.15, NAVY)
    box(s, 7.1, top+0.05, 5.7, 0.6, v, fontsize=28, bold=True,
        color=GOLD, align=PP_ALIGN.CENTER)
    box(s, 7.1, top+0.62, 5.7, 0.42, l, fontsize=13,
        color=WHITE, align=PP_ALIGN.CENTER)
footer(s)

# ── Pipeline
s = slide(); bg(s, LGRAY)
header_bar(s, "Sistem Mimarisi", "7 aşamalı uçtan uca pipeline")
stages2 = [("Ham Ses","WAV/MP3"), ("Ön İşleme","22 050 Hz\nMono"),
           ("Öznitelik","47 boyut\n5 aile"), ("Ölçekleme","StandardScaler\nper-fold"),
           ("Modeller","11 model\n5-fold CV"), ("Eşik","Youden J\nθ*=0,43"),
           ("Karar","YZ / İnsan\nOlasılık")]
col3 = [RGBColor(0x12,0x47,0x6B), NAVY, TEAL, RGBColor(0x00,0x5F,0x6B),
        RGBColor(0x1A,0x6B,0x3A), RGBColor(0x7A,0x3A,0x00), RGBColor(0x6B,0x00,0x1A)]
for i, ((t, sub), c) in enumerate(zip(stages2, col3)):
    lft = 0.35 + i*1.85
    rect(s, lft, 2.2, 1.6, 2.85, c)
    box(s, lft+0.05, 2.28, 1.5, 1.35, t, fontsize=13, bold=True,
        color=WHITE, align=PP_ALIGN.CENTER)
    box(s, lft+0.05, 3.5, 1.5, 1.4, sub, fontsize=10,
        color=RGBColor(0xCC,0xEE,0xFF), align=PP_ALIGN.CENTER)
    if i < 6:
        box(s, lft+1.6, 3.3, 0.25, 0.5, "▶", fontsize=16,
            color=TEAL, align=PP_ALIGN.CENTER)
footer(s)

# ── Veri kümesi
s = slide(); bg(s, LGRAY)
header_bar(s, "Veri Kümesi", "5.195 örnek, 8 kaynak")
headers2 = ["Kaynak", "Tür", "Örnek", "Oran"]
cw2 = [4.0, 3.2, 2.4, 2.4]; cx2 = [0.4]
for w in cw2[:-1]: cx2.append(cx2[-1]+w)
rows_veri = [
    ["MusicGen", "YZ", "712", "%13,7"],
    ["AudioLDM", "YZ", "498", "%9,6"],
    ["Suno",     "YZ", "644", "%12,4"],
    ["Udio",     "YZ", "610", "%11,7"],
    ["Diğer YZ", "YZ", "649", "%12,5"],
    ["İnsan Kaydı","Gerçek", "2.082", "%40,1"],
    ["TOPLAM",   "—", "5.195", "%100"],
]
for ci, (h, cx, cw) in enumerate(zip(headers2, cx2, cw2)):
    r = s.shapes.add_shape(1, Inches(cx), Inches(1.75), Inches(cw), Inches(0.42))
    r.fill.solid(); r.fill.fore_color.rgb = NAVY; r.line.fill.background()
    box(s, cx+0.05, 1.78, cw-0.1, 0.36, h, fontsize=13, bold=True,
        color=WHITE, align=PP_ALIGN.CENTER)
for ri, row in enumerate(rows_veri):
    top = 2.22 + ri*0.58
    rc = RGBColor(0xFF,0xF8,0xE1) if ri==5 else (RGBColor(0xE8,0xF4,0xE8) if ri==6 else (WHITE if ri%2==0 else LGRAY))
    for ci, (cell, cx, cw) in enumerate(zip(row, cx2, cw2)):
        r2 = s.shapes.add_shape(1, Inches(cx), Inches(top), Inches(cw), Inches(0.52))
        r2.fill.solid(); r2.fill.fore_color.rgb = rc
        r2.line.color.rgb = RGBColor(0xCC,0xCC,0xCC)
        fc = RGBColor(0x1A,0x6B,0x3A) if ri==6 else DGRAY
        box(s, cx+0.05, top+0.07, cw-0.1, 0.38, cell, fontsize=12,
            bold=(ri==6), color=fc, align=PP_ALIGN.CENTER)
box(s, 0.4, 6.3, 12.5, 0.4,
    "Sınıf dengesi: %59,9 YZ — %40,1 insan  |  class_weight='balanced'",
    fontsize=12, color=TEAL, align=PP_ALIGN.CENTER)
footer(s)

# ── 47 öznitelik
s = slide(); bg(s, LGRAY)
header_bar(s, "47 Boyutlu Heterojen Akustik Vektör")
fams2 = [("Spektral (16)", "MFCC×13, centroid, bandwidth,\nrolloff, flatness std"),
         ("Ritmik (10)", "Tempo, beat strength,\nonset density, regularity"),
         ("Tonal (9)", "Chroma×9, key confidence,\nHNR"),
         ("Enerji (8)", "RMS, ZCR,\ndynamic range, crest factor"),
         ("Yapısal (4)", "Segment sınırı yoğunluğu,\ntekrar oranı")]
for i, (name, desc) in enumerate(fams2):
    lft = 0.35 + (i%3)*4.3; top = 1.75 + (i//3)*2.55
    rect(s, lft, top, 4.0, 2.35, WHITE, TEAL)
    box(s, lft+0.1, top+0.1, 3.8, 0.45, name, fontsize=14, bold=True, color=NAVY)
    box(s, lft+0.1, top+0.65, 3.8, 1.55, desc, fontsize=12, color=DGRAY)
rect(s, 8.65, 4.35, 4.25, 1.1, NAVY)
box(s, 8.75, 4.4, 4.05, 0.55, "Toplam: 47 boyut", fontsize=18,
    bold=True, color=GOLD, align=PP_ALIGN.CENTER)
box(s, 8.75, 4.88, 4.05, 0.4, "16 + 10 + 9 + 8 + 4", fontsize=13,
    color=WHITE, align=PP_ALIGN.CENTER)
footer(s)

# ── Model karşılaştırma tablosu
s = slide(); bg(s, LGRAY)
header_bar(s, "Model Karşılaştırması", "5-katlı CV — tüm 11 model")
ch = ["Model", "ROC-AUC", "F1", "Doğruluk"]
cw3 = [3.8, 2.6, 2.4, 2.4]; cx3 = [0.35]
for w in cw3[:-1]: cx3.append(cx3[-1]+w)
rd = [["LightGBM ★","95,48%","92,7%","93,1%"],
      ["XGBoost",   "94,21%","91,2%","91,8%"],
      ["Random Forest","93,87%","90,8%","91,3%"],
      ["Extra Trees","92,14%","89,3%","89,9%"],
      ["SVM (RBF)", "91,05%","88,1%","88,7%"],
      ["MLP",       "90,43%","87,6%","88,2%"],
      ["1D-CNN",    "89,76%","86,8%","87,4%"],
      ["LSTM",      "88,32%","85,1%","85,8%"],
      ["Transformer","87,91%","84,7%","85,3%"]]
for ci, (h, cx, cw) in enumerate(zip(ch, cx3, cw3)):
    r = s.shapes.add_shape(1, Inches(cx), Inches(1.75), Inches(cw), Inches(0.42))
    r.fill.solid(); r.fill.fore_color.rgb = NAVY; r.line.fill.background()
    box(s, cx+0.04, 1.77, cw-0.08, 0.38, h, fontsize=13, bold=True,
        color=WHITE, align=PP_ALIGN.CENTER)
for ri, row in enumerate(rd):
    top = 2.22 + ri*0.55
    rc = RGBColor(0xFF,0xF8,0xE1) if ri==0 else (WHITE if ri%2==0 else LGRAY)
    for ci, (cell, cx, cw) in enumerate(zip(row, cx3, cw3)):
        r2 = s.shapes.add_shape(1, Inches(cx), Inches(top), Inches(cw), Inches(0.5))
        r2.fill.solid(); r2.fill.fore_color.rgb = rc
        r2.line.color.rgb = RGBColor(0xCC,0xCC,0xCC)
        fc = RGBColor(0x1A,0x6B,0x3A) if ri==0 else DGRAY
        box(s, cx+0.04, top+0.06, cw-0.08, 0.38, cell, fontsize=12,
            bold=(ri==0), color=fc, align=PP_ALIGN.CENTER)
box(s, 0.35, 7.1, 12.6, 0.3,
    "★ LightGBM — en yüksek performans, tüm metriklerde lider",
    fontsize=11, color=TEAL, align=PP_ALIGN.CENTER)
footer(s)

# ── SHAP
s = slide(); bg(s, LGRAY)
header_bar(s, "SHAP Açıklanabilirlik Analizi", "Hangi öznitelik kararı yönlendiriyor?")
blines(s, 0.4, 1.75, 5.5, 5.0, [
    "TreeSHAP ile global öznitelik etkisi:",
    "",
    "1.  Spectral Flatness Std Dev  ← EN ÖNEMLİ",
    "2.  MFCC-4 ortalama",
    "3.  Tempo",
    "4.  Spectral Centroid",
    "5.  ZCR",
    "",
    "YZ müziği spektral açıdan 'düz' ve düzenli;",
    "insan müziğinin doğal karmaşıklığından",
    "bu fark en güçlü biçimde ayrışıyor.",
    "",
    "Tablo 5'te ilk 10 öznitelik tam listesi.",
], fontsize=14, color=DGRAY)
rect(s, 6.2, 1.75, 6.7, 4.8, WHITE, TEAL)
box(s, 6.3, 1.82, 6.5, 0.4, "Şekil 7: TreeSHAP global etki diyagramı",
    fontsize=12, bold=True, color=NAVY)
box(s, 8.1, 3.6, 2.8, 0.6, "[SHAP\nDiyagramı]", fontsize=14,
    color=RGBColor(0x99,0x99,0x99), align=PP_ALIGN.CENTER)
footer(s)

# ── Literatür karşılaştırma
s = slide(); bg(s, LGRAY)
header_bar(s, "İlgili Çalışmalarla Karşılaştırma", "Tablo 6")
ch2 = ["Çalışma", "Yöntem", "Veri", "ROC-AUC", "Açıkl."]
cw4 = [2.8, 3.0, 2.2, 1.9, 1.9]; cx4 = [0.35]
for w in cw4[:-1]: cx4.append(cx4[-1]+w)
rd2 = [["Afchar (2025)","MFCC+CNN","Özel","91,3%","—"],
       ["Cros Vila (2025)","Müzik öznitelik","Özel","93,7%","—"],
       ["SONICS (2025)","End-to-end DL","97k","—","—"],
       ["FakeMusicCaps","Metin→müzik","FMC","—","—"],
       ["AURIS ★","LightGBM topluluk","5.195","95,48%","SHAP ✓"]]
for ci, (h, cx, cw) in enumerate(zip(ch2, cx4, cw4)):
    r = s.shapes.add_shape(1, Inches(cx), Inches(1.75), Inches(cw), Inches(0.42))
    r.fill.solid(); r.fill.fore_color.rgb = NAVY; r.line.fill.background()
    box(s, cx+0.04, 1.77, cw-0.08, 0.38, h, fontsize=12, bold=True,
        color=WHITE, align=PP_ALIGN.CENTER)
for ri, row in enumerate(rd2):
    top = 2.22 + ri*0.8
    rc = RGBColor(0xFF,0xF8,0xE1) if ri==4 else (WHITE if ri%2==0 else LGRAY)
    for ci, (cell, cx, cw) in enumerate(zip(row, cx4, cw4)):
        r2 = s.shapes.add_shape(1, Inches(cx), Inches(top), Inches(cw), Inches(0.72))
        r2.fill.solid(); r2.fill.fore_color.rgb = rc
        r2.line.color.rgb = RGBColor(0xCC,0xCC,0xCC)
        fc = RGBColor(0x1A,0x6B,0x3A) if ri==4 else DGRAY
        box(s, cx+0.04, top+0.1, cw-0.08, 0.52, cell, fontsize=12,
            bold=(ri==4), color=fc, align=PP_ALIGN.CENTER)
box(s, 0.35, 6.35, 12.6, 0.45,
    "AURIS — literatürdeki en yüksek ROC-AUC + tek açıklanabilir yaklaşım",
    fontsize=13, bold=True, color=TEAL, align=PP_ALIGN.CENTER)
footer(s)

# ── Sonuçlar
s = slide(); bg(s, LGRAY)
header_bar(s, "Sonuçlar")
for i, (t, d) in enumerate([
    ("47 boyutlu heterojen öznitelik",
     "5 akustik aileden derlenen, müzik-spesifik kapsamlı vektör."),
    ("LightGBM lider — %95,48 ROC-AUC",
     "±0,0023 std ile 11 model içinde en kararlı sonuç."),
    ("Spectral Flatness Std Dev kritik",
     "YZ müziğini insan müziğinden en güçlü ayıran tek öznitelik."),
    ("Youden J optimizasyonu +3,3 puan",
     "θ*=0,4316 ile F1 %89,4'ten %92,7'ye çıktı."),
    ("Açıklanabilir sistem (SHAP)",
     "Her karar yorumlanabilir; kara kutu yaklaşımı yok."),
]):
    top = 1.75 + i*1.08
    rect(s, 0.4, top, 12.5, 0.95, WHITE if i%2==0 else LGRAY, TEAL)
    box(s, 0.55, top+0.07, 0.5, 0.75, f"{i+1}.", fontsize=18,
        bold=True, color=TEAL, align=PP_ALIGN.CENTER)
    box(s, 1.1, top+0.05, 4.5, 0.4, t, fontsize=13, bold=True, color=NAVY)
    box(s, 1.1, top+0.46, 11.5, 0.4, d, fontsize=12, color=DGRAY)
footer(s)

# ── Gelecek
s = slide(); bg(s, LGRAY)
header_bar(s, "Gelecek Çalışmalar")
for ci, (title, items, clr) in enumerate([
    ("Kısa Vade", ["Domain adaptation", "Gerçek zamanlı çıkarım", "<5 sn klipler"],
     RGBColor(0xE8,0xF4,0xE8)),
    ("Orta Vade", ["Sosyal medya entegrasyonu", "Canlı ses akışı", "Çok dilli veri"],
     RGBColor(0xE8,0xF0,0xFF)),
    ("Uzun Vade", ["Az örnekli öğrenme", "Watermarking", "Telif kuruluşu işbirliği"],
     RGBColor(0xFF,0xF3,0xCC)),
]):
    lft = 0.35 + ci*4.3
    rect(s, lft, 1.75, 4.1, 5.35, clr, TEAL)
    box(s, lft+0.1, 1.85, 3.9, 0.48, title, fontsize=15, bold=True, color=NAVY)
    blines(s, lft+0.1, 2.45, 3.9, 4.5, items, fontsize=13, color=DGRAY, gap=10)
footer(s)

# ── Teşekkür
s = slide(); bg(s, NAVY)
box(s, 0.5, 1.2, 12.3, 1.1, "Dinlediğiniz için teşekkürler.",
    fontsize=34, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
box(s, 0.5, 2.4, 12.3, 0.75, "Sorularınızı bekliyorum.",
    fontsize=22, color=GOLD, align=PP_ALIGN.CENTER)
for i, (v, l) in enumerate([("%95,48","ROC-AUC"),("47","Öznitelik"),
                              ("11","Model"),("5.195","Örnek")]):
    lft = 1.2 + i*2.75
    rect(s, lft, 3.5, 2.4, 1.35, RGBColor(0x06,0x1A,0x35), TEAL)
    box(s, lft+0.05, 3.55, 2.3, 0.68, v, fontsize=24, bold=True,
        color=GOLD, align=PP_ALIGN.CENTER)
    box(s, lft+0.05, 4.18, 2.3, 0.5, l, fontsize=12,
        color=WHITE, align=PP_ALIGN.CENTER)
box(s, 0.5, 5.15, 12.3, 0.42,
    "Hasan Arthur Altuntaş  |  hasannarthurrr@gmail.com",
    fontsize=14, color=RGBColor(0xB0,0xC8,0xD8), align=PP_ALIGN.CENTER)
box(s, 0.5, 5.58, 12.3, 0.38,
    "Düzce Üniversitesi  |  Bilgisayar Mühendisliği  |  BM498  |  2025-2026",
    fontsize=12, color=RGBColor(0x88,0x99,0xAA), align=PP_ALIGN.CENTER)

# ── Final imza
s = slide()
imza_sayfasi(s, "05", "Final Savunma Sunumu")

# ── Kaydet
os.makedirs('docs/academic/TeslimEdilecekler/Sunumlar', exist_ok=True)
out = 'docs/academic/TeslimEdilecekler/Sunumlar/AURIS_Tum_Sunumlar.pptx'
prs.save(out)
n = len(prs.slides)
print(f'Kaydedildi: {out}')
print(f'Toplam slayt: {n}')
print()
print('PDF EXPORT SAYFA ARALIĞI REHBERİ:')
print('  01_Donem_Baslangic_Sunumu.pdf       →  1-7')
print('  02_Literatur_Taramasi_Sunumu.pdf    →  8-14')
print('  03_Tasarim_ve_Gelistirme_Sunumu.pdf → 15-23')
print('  04_Sonuc_ve_Demo_Sunumu.pdf         → 24-31')
print('  05_Final_Savunma_Sunumu.pdf         → 32-' + str(n))
