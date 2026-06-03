"""
AURIS — Tüm Sunumlar
5 ayrı PPTX + 1 birleşik PPTX
Gerçek görsellerle, Türkçe, akademik dil
"""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.oxml.ns import qn
from lxml import etree
import os, copy

# ── Renkler ──────────────────────────────────────────────────────────────────
NAVY  = RGBColor(0x0D, 0x2B, 0x55)
TEAL  = RGBColor(0x00, 0x7A, 0x87)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LGRAY = RGBColor(0xF4, 0xF6, 0xF8)
DGRAY = RGBColor(0x33, 0x33, 0x33)
GOLD  = RGBColor(0xE0, 0xA8, 0x00)
GREEN = RGBColor(0x1A, 0x6B, 0x3A)

FIGS = 'docs/academic/figures'

# ── Yardımcı fonksiyonlar ─────────────────────────────────────────────────────
def new_prs():
    p = Presentation()
    p.slide_width  = Inches(13.33)
    p.slide_height = Inches(7.5)
    return p

def sl(prs): return prs.slides.add_slide(prs.slide_layouts[6])

def bg(s, color):
    f = s.background.fill; f.solid(); f.fore_color.rgb = color

def bx(s, l, t, w, h, text, fs=16, bold=False, color=WHITE, align=PP_ALIGN.LEFT):
    tb = s.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.alignment = align
    r = p.add_run(); r.text = text
    r.font.size = Pt(fs); r.font.bold = bold; r.font.color.rgb = color
    return tb

def bl(s, l, t, w, h, lines, fs=14, color=DGRAY, gap=4):
    tb = s.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True
    first = True
    for line in lines:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False; p.space_after = Pt(gap)
        r = p.add_run(); r.text = line
        r.font.size = Pt(fs); r.font.color.rgb = color

def rc(s, l, t, w, h, fill, line=None):
    sh = s.shapes.add_shape(1, Inches(l), Inches(t), Inches(w), Inches(h))
    sh.fill.solid(); sh.fill.fore_color.rgb = fill
    if line: sh.line.color.rgb = line
    else: sh.line.fill.background()
    return sh

def hbar(s, title, sub=None):
    rc(s, 0, 0, 13.33, 1.55, NAVY)
    bx(s, 0.35, 0.1, 12.6, 0.9, title, fs=25, bold=True, color=WHITE)
    if sub: bx(s, 0.35, 0.92, 12.6, 0.5, sub, fs=12,
                color=RGBColor(0xB0,0xC8,0xD8))

def ft(s):
    bx(s, 0, 7.12, 13.33, 0.33,
       "Hasan Arthur Altuntaş  |  BM498  |  Düzce Üniversitesi  |  2025-2026",
       fs=9, color=RGBColor(0x88,0x99,0xAA), align=PP_ALIGN.CENTER)

def add_img(s, path, l, t, w, h):
    if os.path.exists(path):
        s.shapes.add_picture(path, Inches(l), Inches(t), Inches(w), Inches(h))
    else:
        rc(s, l, t, w, h, RGBColor(0xEE,0xEE,0xEE), TEAL)
        bx(s, l+0.1, t+h/2-0.2, w-0.2, 0.4,
           f"[{os.path.basename(path)}]", fs=10,
           color=RGBColor(0x99,0x99,0x99), align=PP_ALIGN.CENTER)

def imza(s, no, adi):
    bg(s, LGRAY)
    rc(s, 0, 0, 13.33, 0.5, NAVY)
    bx(s, 0.35, 0.07, 12.6, 0.38,
       f"BM498 — {no}: {adi}", fs=11, color=WHITE)
    rc(s, 2.5, 1.1, 8.3, 5.9, WHITE, TEAL)
    bx(s, 2.6, 1.22, 8.1, 0.6, "ÖĞRENCİ İMZA SAYFASI",
       fs=17, bold=True, color=NAVY, align=PP_ALIGN.CENTER)
    sh = s.shapes.add_shape(1, Inches(2.6), Inches(1.85), Inches(8.1), Inches(0))
    sh.line.color.rgb = TEAL; sh.line.width = Pt(1.5)
    fields = [("Öğrenci Adı Soyadı","Hasan Arthur Altuntaş"),
              ("Öğrenci Numarası",""),
              ("Bölüm","Bilgisayar Mühendisliği"),
              ("Danışman",""),("Sunum Tarihi",""),("Sunum Adı", adi)]
    for i, (lbl, val) in enumerate(fields):
        top = 2.05 + i*0.6
        bx(s, 2.7, top, 3.1, 0.35, lbl+":", fs=12, bold=True, color=NAVY)
        bx(s, 5.9, top, 4.7, 0.35, val, fs=12, color=DGRAY)
        ln = s.shapes.add_shape(1, Inches(5.85), Inches(top+0.37), Inches(4.75), Inches(0))
        ln.line.color.rgb = RGBColor(0xCC,0xCC,0xCC); ln.line.width = Pt(1)
    bx(s, 2.7, 5.9, 3.2, 0.38, "İmza:", fs=13, bold=True, color=NAVY)
    ln2 = s.shapes.add_shape(1, Inches(3.55), Inches(6.28), Inches(6.65), Inches(0))
    ln2.line.color.rgb = DGRAY; ln2.line.width = Pt(1.5)
    bx(s, 3.55, 6.34, 6.65, 0.32,
       "(Öğrenci bu alanı imzalayarak sunumun kendisine ait olduğunu onaylar.)",
       fs=9, color=RGBColor(0x88,0x88,0x88), align=PP_ALIGN.CENTER)

def divider_sl(prs, no, title, hint):
    s = sl(prs); bg(s, NAVY)
    rc(s, 0, 2.75, 13.33, 0.07, TEAL)
    bx(s, 0.5, 0.65, 12.3, 1.0, no, fs=52, bold=True,
       color=GOLD, align=PP_ALIGN.CENTER)
    bx(s, 0.5, 1.62, 12.3, 0.85, title, fs=24, bold=True,
       color=WHITE, align=PP_ALIGN.CENTER)
    bx(s, 0.5, 3.0, 12.3, 0.5, hint, fs=12,
       color=RGBColor(0xB0,0xC8,0xD8), align=PP_ALIGN.CENTER)
    bx(s, 0.5, 6.5, 12.3, 0.4,
       "Hasan Arthur Altuntaş  |  BM498  |  Düzce Üniversitesi  |  2025-2026",
       fs=11, color=RGBColor(0x55,0x77,0x99), align=PP_ALIGN.CENTER)

# ═══════════════════════════════════════════════════════════════════════════════
# ORTAK SLAYT ÜRETICI FONKSİYONLAR
# ═══════════════════════════════════════════════════════════════════════════════

def make_01(prs):
    # Kapak
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "01 — Dönem Başlangıç Sunumu", "BM498 | 2025-2026 Güz Dönemi")
    bl(s, 0.5, 1.7, 12.3, 5.0, [
        "Proje Adı :   AURIS — Yapay Zekâ Üretimli Müzik Tespitinde Topluluk Öğrenmesi",
        "Öğrenci   :   Hasan Arthur Altuntaş",
        "Danışman  :   ___________________________",
        "",
        "Problem   :   Suno, Udio, MusicGen gibi sistemlerin ürettiği müziği",
        "               insan yapımı müzikten otomatik olarak ayırt etmek.",
        "",
        "Hedef     :   %90+ ROC-AUC, 47 boyutlu öznitelik, açıklanabilir model.",
        "",
        "Kapsam    :   5.195 ses örneği, 8 YZ kaynağı, 11 sınıflandırma modeli.",
    ], fs=15, color=DGRAY); ft(s)

    # Problem
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Problem Tanımı ve Motivasyon")
    bl(s, 0.5, 1.7, 12.3, 5.2, [
        "▸  Suno, Udio, MusicGen saniyeler içinde insan sesinden ayırt edilemez müzik üretiyor.",
        "▸  Telif hakkı ihlalleri, sahte hit manipülasyonu, dezenformasyon riski artıyor.",
        "▸  Mevcut dedektörler konuşma odaklı — müzik için yetersiz.",
        "",
        "Tespit açığı:",
        "  • Müzik-spesifik öznitelik setleri yok.",
        "  • Topluluk (ensemble) yaklaşımı müziğe uygulanmamış.",
        "  • Açıklanabilir (SHAP) sistem yok.",
        "",
        "AURIS bu üç boşluğu doldurmayı hedeflemektedir.",
    ], fs=15, color=DGRAY); ft(s)

    # Planlanan yöntem
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Planlanan Yöntem ve Zaman Planı")
    bl(s, 0.5, 1.7, 6.0, 5.2, [
        "Veri:",
        "  5.195 örnek — 8 YZ kaynağı + insan kaydı",
        "Öznitelik:",
        "  47 boyutlu akustik vektör",
        "  (spektral, ritmik, tonal, enerji, yapısal)",
        "Model:",
        "  11 model topluluğu (ML + DL)",
        "  LightGBM lider model",
        "Değerlendirme:",
        "  5-katlı CV, SHAP açıklanabilirlik",
    ], fs=14, color=DGRAY)
    bl(s, 6.8, 1.7, 6.1, 5.2, [
        "Hafta 1-2 :  Veri toplama ve ön işleme",
        "Hafta 3-4 :  Öznitelik mühendisliği",
        "Hafta 5-6 :  Model eğitimi ve CV",
        "Hafta 7-8 :  Değerlendirme ve SHAP",
        "Hafta 9-10:  Yazım ve sunum hazırlığı",
        "",
        "Risk analizi:",
        "  Sınıf dengesizliği → class_weight",
        "  DL eğitim süresi → erken durdurma",
        "  Gerçek zamanlı kapsam → ileri çalışma",
    ], fs=14, color=DGRAY); ft(s)

    # Beklenen çıktılar
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Beklenen Çıktılar")
    for i, (t, d) in enumerate([
        ("Tespit Sistemi",   "Uçtan uca LightGBM tabanlı, 47 öznitelikli sınıflandırıcı"),
        ("Açıklanabilirlik", "SHAP ile her kararın yorumlanabilmesi"),
        ("Akademik Yayın",   "GUJSA'ya gönderilmek üzere hazırlanan makale"),
        ("Açık Kaynak Kod",  "GitHub üzerinden paylaşım — teslim paketiyle birlikte"),
    ]):
        top = 1.75 + i*1.3
        rc(s, 0.4, top, 12.5, 1.15, WHITE, TEAL)
        bx(s, 0.6, top+0.12, 3.5, 0.5, f"{i+1}.  {t}",
           fs=15, bold=True, color=NAVY)
        bx(s, 4.3, top+0.12, 8.4, 0.9, d, fs=14, color=DGRAY)
    ft(s)
    s = sl(prs); imza(s, "01", "Dönem Başlangıç Sunumu")

def make_02(prs):
    # Giriş
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "02 — Literatür Taraması", "Kapsam ve yöntem")
    bl(s, 0.5, 1.7, 12.3, 4.8, [
        "Taranan kaynak sayısı :  39 makale (2020-2026)",
        "Güncel oran           :  %74 son 5 yıl içinde yayımlanmış (GUJSA eşiği: %30)",
        "",
        "3 ana araştırma alanı:",
        "  1.  Ses Derin Sahte Tespiti (Audio Deepfake Detection)",
        "  2.  GenAI Müzik Üretici Sistemleri",
        "  3.  GenAI Müzik Tespitinde Güncel Gelişmeler",
        "",
        "Temel tespit: Müzik için ensemble + SHAP yaklaşımı literatürde henüz yok.",
    ], fs=15, color=DGRAY); ft(s)

    # Alan 1 tablosu
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Alan 1: Ses Derin Sahte Tespiti")
    ch = ["Model / Çalışma","Yazarlar","Yıl","Katkı"]
    cw = [2.8,2.5,1.2,6.5]; cx = [0.35,3.2,5.75,7.0]
    for i,(h,x,w) in enumerate(zip(ch,cx,cw)):
        r2=rc(s,x,1.75,w,0.42,NAVY); r2.line.fill.background()
        bx(s,x+0.05,1.78,w-0.1,0.36,h,fs=12,bold=True,
           color=WHITE,align=PP_ALIGN.CENTER)
    rows=[("AASIST","Jung vd.","2022","Spektro-temporal GAT — ASVspoof 2019"),
          ("RawNet2","Tak vd.","2021","Ham dalga formu, uçtan uca"),
          ("wav2vec 2.0","Baevski vd.","2020","Öz-denetimli temsil öğrenmesi"),
          ("WavLM","Chen vd.","2022","Maskelenmiş öngörüyle ön eğitim"),
          ("ADD 2022","Yi vd.","2022","İlk YZ ses sentezi tespit yarışması"),
          ("ASVspoof 2019","Wang vd.","2020","64k örnekli büyük ölçekli benchmark")]
    for ri,row in enumerate(rows):
        top=2.22+ri*0.72; rc2=WHITE if ri%2==0 else LGRAY
        for ci,(cell,x,w) in enumerate(zip(row,cx,cw)):
            r3=rc(s,x,top,w,0.65,rc2,RGBColor(0xCC,0xCC,0xCC))
            bx(s,x+0.05,top+0.12,w-0.1,0.42,cell,fs=12,
               color=DGRAY,align=PP_ALIGN.CENTER)
    ft(s)

    # Alan 2-3 + boşluk
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Alan 2-3: YZ Müzik ve Tespit + Boşluk Analizi")
    bl(s,0.5,1.7,6.0,5.2,[
        "YZ Müzik Üretici Sistemler:",
        "  MusicGen (Copet vd., 2023) — Meta, transformer",
        "  AudioLDM (Liu vd., 2023) — latent diffusion",
        "  Suno / Udio — ticari sistemler, 2024",
        "",
        "Tespit Çalışmaları:",
        "  Afchar vd. (ICASSP 2025) — MFCC+CNN",
        "  Cros Vila vd. (TISMIR 2025) — müzik öznitelik",
        "  Li vd. (Sci. Rep. 2026) — açıklanabilir",
        "",
        "Veri Setleri:",
        "  SONICS (ICLR 2025) — 97k şarkı",
        "  FakeMusicCaps (J. Imaging 2025)",
    ],fs=13,color=DGRAY)
    bl(s,6.8,1.7,6.1,5.2,[
        "Literatür Boşlukları:",
        "",
        "✗  Müzik için topluluk (ensemble) yok",
        "✗  47 boyutlu heterojen öznitelik yok",
        "✗  Kaynak bazlı performans analizi yok",
        "✗  SHAP açıklanabilirlik uygulanmamış",
        "✗  Youden J eşik optimizasyonu yok",
        "",
        "AURIS bu 5 boşluğu dolduruyor.",
        "",
        "Referans sayısı: 39",
        "Güncel oran   : %74 (2021-2026)",
    ],fs=13,color=DGRAY); ft(s)
    s=sl(prs); imza(s,"02","Literatür Taraması Sunumu")

def make_03(prs):
    # Pipeline
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"03 — Tasarım ve Geliştirme","Sistem mimarisi")
    add_img(s,f"{FIGS}/paper_pipeline_diagram.png",0.4,1.65,12.5,5.0)
    bx(s,0.4,6.75,12.5,0.38,
       "Şekil 1: AURIS uçtan uca işleyiş şeması",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER); ft(s)

    # Öznitelik çıkarma
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"Öznitelik Çıkarma — 47 Boyutlu Vektör")
    fams=[("Spektral (16)","MFCC×13, centroid, bandwidth,\nrolloff, flatness std"),
          ("Ritmik (10)","Tempo, beat strength,\nonset density, regularity"),
          ("Tonal (9)","Chroma×9, key confidence,\nHNR"),
          ("Enerji (8)","RMS, ZCR,\ndynamic range, crest factor"),
          ("Yapısal (4)","Segment sınırı yoğunluğu,\ntekrar oranı")]
    for i,(nm,ds) in enumerate(fams):
        lft=0.35+(i%3)*4.3; top=1.75+(i//3)*2.55
        rc(s,lft,top,4.0,2.35,WHITE,TEAL)
        bx(s,lft+0.1,top+0.1,3.8,0.45,nm,fs=14,bold=True,color=NAVY)
        bx(s,lft+0.1,top+0.65,3.8,1.55,ds,fs=12,color=DGRAY)
    rc(s,8.65,4.35,4.25,1.1,NAVY)
    bx(s,8.75,4.42,4.05,0.52,"Toplam: 47 boyut",fs=18,bold=True,
       color=GOLD,align=PP_ALIGN.CENTER)
    bx(s,8.75,4.88,4.05,0.4,"16+10+9+8+4",fs=13,
       color=WHITE,align=PP_ALIGN.CENTER); ft(s)

    # Öznitelik dağılımı görseli
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"Öznitelik Dağılımları","YZ vs İnsan — ilk 8 öznitelik")
    add_img(s,f"{FIGS}/feature_distribution_ai_vs_human.png",0.4,1.65,12.5,5.1)
    bx(s,0.4,6.82,12.5,0.35,
       "Şekil 2: YZ ve insan müziğinin öznitelik dağılımları karşılaştırması",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER); ft(s)

    # Model geliştirme
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"Sınıflandırma Modelleri — 11 Model")
    bl(s,0.4,1.7,5.8,5.2,[
        "Makine Öğrenmesi (7):",
        "  • LightGBM — is_unbalance=True",
        "  • XGBoost — scale_pos_weight",
        "  • Random Forest — class_weight=balanced",
        "  • Extra Trees",
        "  • AdaBoost",
        "  • Logistic Regression",
        "  • SVM (RBF kernel)",
        "",
        "Topluluk: soft voting",
        "LightGBM ağırlığı 2x",
    ],fs=14,color=DGRAY)
    bl(s,6.5,1.7,6.4,5.2,[
        "Derin Öğrenme (4):",
        "  • MLP (3 katman, ReLU, dropout=0,3)",
        "  • 1D-CNN (temporal convolution)",
        "  • LSTM (128 birim, dropout=0,3)",
        "  • Transformer (2 head, dim=64)",
        "",
        "Sınıf dengesi:",
        "  %59,9 YZ — %40,1 insan",
        "  class_weight='balanced'",
        "  Yöntem: ağırlık tabanlı",
    ],fs=14,color=DGRAY); ft(s)
    s=sl(prs); imza(s,"03","Tasarım ve Geliştirme Sunumu")

def make_04(prs):
    # Sonuç özeti
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"04 — Sonuç ve Demo","Elde edilen metrikler")
    for i,(lbl,val,sub) in enumerate([
        ("ROC-AUC",   "%95,48","±0,0023"),
        ("F1-Skoru",  "%92,7", "5-fold ort."),
        ("Brier",     "0,083", "iyi kalibre"),
        ("Youden θ*", "0,4316","optimum"),
    ]):
        lft=0.4+i*3.2
        rc(s,lft,1.75,3.0,2.2,NAVY)
        bx(s,lft+0.1,1.85,2.8,0.55,lbl,fs=14,color=WHITE,align=PP_ALIGN.CENTER)
        bx(s,lft+0.1,2.35,2.8,0.85,val,fs=30,bold=True,
           color=GOLD,align=PP_ALIGN.CENTER)
        bx(s,lft+0.1,3.15,2.8,0.45,sub,fs=12,
           color=RGBColor(0xB0,0xC8,0xD8),align=PP_ALIGN.CENTER)
    bl(s,0.4,4.2,12.5,2.8,[
        "LightGBM 11 model içinde tüm metriklerde lider.",
        "Spectral Flatness Std Dev en ayırt edici öznitelik (SHAP).",
        "Youden J eşik optimizasyonu F1'i %89,4'ten %92,7'ye taşıdı (+3,3 puan).",
    ],fs=14,color=DGRAY,gap=7); ft(s)

    # Model karşılaştırma görseli
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"Model Karşılaştırması","Tüm modellerin ROC-AUC değerleri")
    add_img(s,f"{FIGS}/paper_model_comparison.png",0.4,1.65,12.5,5.1)
    bx(s,0.4,6.82,12.5,0.35,
       "Şekil 3: Tüm modellerin performans karşılaştırması",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER); ft(s)

    # Demo
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"Demo — Sistem Çalışma Akışı")
    bl(s,0.5,1.7,6.5,5.2,[
        "1.  Müzik dosyası yüklenir (WAV / MP3).",
        "2.  Ön işleme: 22 050 Hz, mono, 30 sn.",
        "3.  47 öznitelik çıkarılır (librosa).",
        "4.  LightGBM olasılık üretir.",
        "5.  θ* = 0,4316 eşiği uygulanır.",
        "6.  Çıktı: 'YZ' / 'İnsan' + olasılık skoru.",
        "7.  SHAP ile karar yorumlanır.",
        "",
        "Demo videosu teslim paketi içindedir:",
        "  Uygulama/demo_video.mp4",
    ],fs=14,color=DGRAY)
    add_img(s,f"{FIGS}/paper_score_distribution.png",7.0,1.65,6.0,4.9)
    bx(s,7.0,6.6,6.0,0.4,
       "Şekil 9: P(YZ) tahmin olasılık dağılımı",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER); ft(s)

    # Katkı
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"Akademik Katkı ve Özgün Değer")
    for i,(t,d) in enumerate([
        ("47 boyutlu heterojen öznitelik","5 akustik aileden derlenen müzik-spesifik kapsamlı set."),
        ("Topluluk öğrenmesi","11 model soft-voting — tek model yaklaşımlarının üstünde."),
        ("SHAP açıklanabilirlik","Müzik deepfake tespitinde SHAP ilk kez uygulandı."),
        ("Youden J optimizasyonu","Dengesiz sınıf için θ*=0,4316 — varsayılan 0,5'ten üstün."),
        ("GUJSA yayını","Ulusal hakemli dergiye gönderilmek üzere hazırlandı."),
    ]):
        top=1.75+i*1.05
        rc(s,0.4,top,12.5,0.92,WHITE if i%2==0 else LGRAY,TEAL)
        bx(s,0.55,top+0.07,0.5,0.72,f"{i+1}.",fs=16,bold=True,
           color=TEAL,align=PP_ALIGN.CENTER)
        bx(s,1.1,top+0.05,4.2,0.38,t,fs=13,bold=True,color=NAVY)
        bx(s,1.1,top+0.46,11.6,0.38,d,fs=12,color=DGRAY)
    ft(s)
    s=sl(prs); imza(s,"04","Sonuç ve Demo Sunumu")

def make_05(prs):
    # 1-Kapak
    s=sl(prs); bg(s,NAVY)
    rc(s,0,0,13.33,7.5,NAVY)
    bx(s,0.5,0.6,12.3,1.1,"AURIS",fs=70,bold=True,color=GOLD,align=PP_ALIGN.CENTER)
    bx(s,0.5,1.65,12.3,0.72,
       "Yapay Zekâ Üretimli Müzik Tespitinde Topluluk Öğrenmesi",
       fs=21,bold=True,color=WHITE,align=PP_ALIGN.CENTER)
    bx(s,0.5,2.32,12.3,0.5,
       "Heterojen Akustik Öznitelikler ve LightGBM Tabanlı Bir Yaklaşım",
       fs=15,color=RGBColor(0xB0,0xC8,0xD8),align=PP_ALIGN.CENTER)
    rc(s,0,5.25,13.33,2.25,RGBColor(0x06,0x1A,0x35))
    bx(s,0.5,5.37,12.3,0.45,"Hasan Arthur Altuntaş",
       fs=16,bold=True,color=WHITE,align=PP_ALIGN.CENTER)
    bx(s,0.5,5.82,12.3,0.4,"Danışman: ___________________________",
       fs=14,color=RGBColor(0xB0,0xC8,0xD8),align=PP_ALIGN.CENTER)
    bx(s,0.5,6.22,12.3,0.38,
       "Düzce Üniversitesi  |  Mühendislik Fakültesi  |  BM498  |  2025-2026",
       fs=12,color=RGBColor(0x88,0x99,0xAA),align=PP_ALIGN.CENTER)

    # 2-İçindekiler
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"Sunum Planı — 05 Final Savunma")
    bl(s,0.5,1.7,12.3,5.5,[
        "1.   Motivasyon ve Problem Tanımı",
        "2.   Literatür Özeti ve Boşluk Analizi",
        "3.   Sistem Mimarisi (AURIS Pipeline)",
        "4.   Veri Kümesi",
        "5.   Öznitelik Çıkarma (47 Boyutlu Vektör)",
        "6.   Sınıflandırma Modelleri ve Eğitim Protokolü",
        "7.   Sonuçlar — Model Karşılaştırması",
        "8.   Açıklanabilirlik (SHAP / TreeSHAP)",
        "9.   İlgili Çalışmalarla Karşılaştırma",
        "10.  Kısıtlamalar ve Güçlü Yönler",
        "11.  Sonuçlar ve Gelecek Çalışmalar",
    ],fs=17,color=DGRAY,gap=5); ft(s)

    # 3-Motivasyon
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"Motivasyon","Neden AURIS? Neden şimdi?")
    bl(s,0.5,1.7,6.0,5.2,[
        "Suno, Udio, MusicGen saniyeler içinde",
        "insan sesinden ayırt edilemez müzik üretiyor.",
        "",
        "▸  Telif hakkı ihlalleri",
        "▸  Sahte hit (streaming fraud)",
        "▸  Dezenformasyon",
        "▸  Yaratıcı ekonomide zarar",
        "",
        "Mevcut dedektörler konuşma odaklı —",
        "müzik için yetersiz.",
    ],fs=15,color=DGRAY)
    for i,(v,l) in enumerate([
        ("%95,48","ROC-AUC"),("47","Öznitelik"),
        ("11","Model"),("5.195","Örnek")
    ]):
        top=1.75+i*1.3
        rc(s,7.0,top,5.9,1.15,NAVY)
        bx(s,7.1,top+0.05,5.7,0.6,v,fs=28,bold=True,color=GOLD,align=PP_ALIGN.CENTER)
        bx(s,7.1,top+0.62,5.7,0.42,l,fs=13,color=WHITE,align=PP_ALIGN.CENTER)
    ft(s)

    # 4-Pipeline görseli
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"Sistem Mimarisi","AURIS uçtan uca pipeline")
    add_img(s,f"{FIGS}/paper_pipeline_diagram.png",0.4,1.65,12.5,5.05)
    bx(s,0.4,6.78,12.5,0.38,
       "Şekil 1: AURIS uçtan uca işleyiş şeması",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER); ft(s)

    # 5-Veri kümesi tablosu
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"Veri Kümesi","5.195 örnek — 8 farklı kaynak")
    ch=["Kaynak","Tür","Örnek Sayısı","Oran"]
    cw=[4.0,3.0,2.6,2.4]; cx=[0.35]; [cx.append(cx[-1]+w) for w in cw[:-1]]
    rows=[("MusicGen","YZ üretimi","712","%13,7"),
          ("AudioLDM","YZ üretimi","498","%9,6"),
          ("Suno","YZ üretimi","644","%12,4"),
          ("Udio","YZ üretimi","610","%11,7"),
          ("Diğer YZ","YZ üretimi","649","%12,5"),
          ("İnsan Kaydı","Gerçek müzik","2.082","%40,1"),
          ("TOPLAM","—","5.195","%100")]
    for ci,(h,x,w) in enumerate(zip(ch,cx,cw)):
        r=rc(s,x,1.75,w,0.42,NAVY); r.line.fill.background()
        bx(s,x+0.05,1.78,w-0.1,0.36,h,fs=12,bold=True,
           color=WHITE,align=PP_ALIGN.CENTER)
    for ri,row in enumerate(rows):
        top=2.22+ri*0.56
        rclr=RGBColor(0xFF,0xF8,0xE1) if ri==5 else (RGBColor(0xE8,0xF4,0xE8) if ri==6 else (WHITE if ri%2==0 else LGRAY))
        for ci,(cell,x,w) in enumerate(zip(row,cx,cw)):
            r2=rc(s,x,top,w,0.5,rclr,RGBColor(0xCC,0xCC,0xCC))
            fc=GREEN if ri==6 else DGRAY
            bx(s,x+0.04,top+0.07,w-0.08,0.37,cell,fs=12,
               bold=(ri==6),color=fc,align=PP_ALIGN.CENTER)
    bx(s,0.4,6.3,12.5,0.38,
       "Sınıf dağılımı: %59,9 YZ — %40,1 insan  |  class_weight='balanced'",
       fs=12,color=TEAL,align=PP_ALIGN.CENTER); ft(s)

    # 6-47 öznitelik
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"Öznitelik Çıkarma","47 boyutlu heterojen akustik vektör — 5 aile")
    fams=[("Spektral (16)","MFCC×13, centroid, bandwidth,\nrolloff, flatness std"),
          ("Ritmik (10)","Tempo, beat strength,\nonset density, regularity"),
          ("Tonal (9)","Chroma×9, key confidence, HNR"),
          ("Enerji (8)","RMS, ZCR,\ndynamic range, crest factor"),
          ("Yapısal (4)","Segment sınırı yoğunluğu,\ntekrar oranı")]
    for i,(nm,ds) in enumerate(fams):
        lft=0.35+(i%3)*4.3; top=1.75+(i//3)*2.55
        rc(s,lft,top,4.0,2.35,WHITE,TEAL)
        bx(s,lft+0.1,top+0.1,3.8,0.45,nm,fs=14,bold=True,color=NAVY)
        bx(s,lft+0.1,top+0.65,3.8,1.55,ds,fs=12,color=DGRAY)
    rc(s,8.65,4.35,4.25,1.1,NAVY)
    bx(s,8.75,4.42,4.05,0.52,"Toplam: 47 boyut",fs=18,bold=True,
       color=GOLD,align=PP_ALIGN.CENTER)
    bx(s,8.75,4.88,4.05,0.4,"16 + 10 + 9 + 8 + 4",fs=13,
       color=WHITE,align=PP_ALIGN.CENTER); ft(s)

    # 7-Model karşılaştırma tablosu
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"Model Karşılaştırması","5-katlı CV sonuçları — 11 model")
    ch2=["Model","ROC-AUC","F1","Doğruluk","Hassasiyet","Duyarlılık"]
    cw2=[3.0,1.9,1.6,1.8,1.95,1.85]; cx2=[0.35]; [cx2.append(cx2[-1]+w) for w in cw2[:-1]]
    rd=[["LightGBM ★","95,48%","92,7%","93,1%","91,8%","93,6%"],
        ["XGBoost","94,21%","91,2%","91,8%","90,5%","92,0%"],
        ["Random Forest","93,87%","90,8%","91,3%","89,9%","91,7%"],
        ["Extra Trees","92,14%","89,3%","89,9%","88,2%","90,4%"],
        ["SVM (RBF)","91,05%","88,1%","88,7%","87,4%","88,8%"],
        ["MLP","90,43%","87,6%","88,2%","86,9%","88,3%"],
        ["1D-CNN","89,76%","86,8%","87,4%","85,7%","87,9%"],
        ["LSTM","88,32%","85,1%","85,8%","84,3%","85,9%"],
        ["Transformer","87,91%","84,7%","85,3%","83,8%","85,4%"]]
    for ci,(h,x,w) in enumerate(zip(ch2,cx2,cw2)):
        r=rc(s,x,1.75,w,0.4,NAVY); r.line.fill.background()
        bx(s,x+0.03,1.77,w-0.06,0.36,h,fs=11,bold=True,
           color=WHITE,align=PP_ALIGN.CENTER)
    for ri,row in enumerate(rd):
        top=2.2+ri*0.54
        rclr=RGBColor(0xFF,0xF8,0xE1) if ri==0 else (WHITE if ri%2==0 else LGRAY)
        for ci,(cell,x,w) in enumerate(zip(row,cx2,cw2)):
            rc(s,x,top,w,0.48,rclr,RGBColor(0xCC,0xCC,0xCC))
            bx(s,x+0.03,top+0.05,w-0.06,0.38,cell,fs=11,
               bold=(ri==0),color=GREEN if ri==0 else DGRAY,align=PP_ALIGN.CENTER)
    bx(s,0.35,7.1,12.6,0.3,
       "★ LightGBM — en yüksek performans, tüm metriklerde lider",
       fs=11,color=TEAL,align=PP_ALIGN.CENTER); ft(s)

    # 8-ROC eğrisi
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"ROC Eğrileri ve Karmaşıklık Matrisi")
    add_img(s,f"{FIGS}/paper_roc_curves.png",0.35,1.65,6.3,5.1)
    bx(s,0.35,6.82,6.3,0.35,
       "Şekil 4: Makine öğrenmesi ROC eğrileri",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER)
    add_img(s,f"{FIGS}/paper_confusion_matrix_lightgbm.png",6.9,1.65,6.1,5.1)
    bx(s,6.9,6.82,6.1,0.35,
       "Şekil 8: LightGBM karmaşıklık matrisi",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER); ft(s)

    # 9-SHAP
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"SHAP Açıklanabilirlik Analizi","Hangi öznitelik kararı yönlendiriyor?")
    bl(s,0.4,1.75,5.5,5.0,[
        "TreeSHAP ile global öznitelik sıralaması:",
        "",
        "1.  spectral_flatness_std  ← EN ÖNEMLİ",
        "2.  mfcc_4_mean",
        "3.  tempo",
        "4.  spectral_centroid_mean",
        "5.  zcr_mean",
        "",
        "YZ müziği spektral açıdan daha 'düz' ve",
        "düzenli — bu fark en güçlü ayırt edici.",
        "",
        "Tablo 5: İlk 10 öznitelik tam listesi.",
    ],fs=14,color=DGRAY)
    add_img(s,f"{FIGS}/shap_summary.png",6.1,1.65,7.0,5.0)
    bx(s,6.1,6.72,7.0,0.35,
       "Şekil 7: TreeSHAP global etki diyagramı",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER); ft(s)

    # 10-Öznitelik önemi
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"Öznitelik Önemi","LightGBM öznitelik önem skorları")
    add_img(s,f"{FIGS}/paper_feature_importance.png",0.35,1.65,12.6,5.1)
    bx(s,0.35,6.82,12.6,0.35,
       "Şekil 6: LightGBM öznitelik önem skorları — ilk 20",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER); ft(s)

    # 11-Literatür karşılaştırma
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"İlgili Çalışmalarla Karşılaştırma","Tablo 6")
    ch3=["Çalışma","Yöntem","Veri","ROC-AUC","Açıkl."]
    cw3=[2.8,3.0,2.2,1.9,1.9]; cx3=[0.35]; [cx3.append(cx3[-1]+w) for w in cw3[:-1]]
    rd2=[["Afchar (2025)","MFCC+CNN","Özel","91,3%","—"],
         ["Cros Vila (2025)","Müzik öznitelik","Özel","93,7%","—"],
         ["SONICS (2025)","End-to-end DL","97k","—","—"],
         ["FakeMusicCaps","Metin→müzik","FMC","—","—"],
         ["AURIS ★","LightGBM topluluk","5.195","95,48%","SHAP ✓"]]
    for ci,(h,x,w) in enumerate(zip(ch3,cx3,cw3)):
        r=rc(s,x,1.75,w,0.42,NAVY); r.line.fill.background()
        bx(s,x+0.04,1.77,w-0.08,0.38,h,fs=12,bold=True,
           color=WHITE,align=PP_ALIGN.CENTER)
    for ri,row in enumerate(rd2):
        top=2.22+ri*0.82
        rclr=RGBColor(0xFF,0xF8,0xE1) if ri==4 else (WHITE if ri%2==0 else LGRAY)
        for ci,(cell,x,w) in enumerate(zip(row,cx3,cw3)):
            rc(s,x,top,w,0.74,rclr,RGBColor(0xCC,0xCC,0xCC))
            bx(s,x+0.04,top+0.12,w-0.08,0.5,cell,fs=12,
               bold=(ri==4),color=GREEN if ri==4 else DGRAY,align=PP_ALIGN.CENTER)
    bx(s,0.35,6.55,12.6,0.45,
       "AURIS — literatürdeki en yüksek ROC-AUC + tek açıklanabilir yaklaşım",
       fs=13,bold=True,color=TEAL,align=PP_ALIGN.CENTER); ft(s)

    # 12-Kalibrasyon & eşik
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"Kalibrasyon ve Eşik Analizi")
    add_img(s,f"{FIGS}/paper_calibration.png",0.35,1.65,6.3,5.0)
    bx(s,0.35,6.72,6.3,0.35,"Şekil 10: Kalibrasyon eğrisi (Brier=0,083)",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER)
    add_img(s,f"{FIGS}/threshold_sweep.png",6.9,1.65,6.1,5.0)
    bx(s,6.9,6.72,6.1,0.35,"Şekil 12: Karar eşiği taraması",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER); ft(s)

    # 13-Kısıtlamalar
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"Kısıtlamalar ve Güçlü Yönler")
    bl(s,0.4,1.75,5.8,5.2,[
        "Kısıtlamalar:",
        "",
        "1.  Dağılım kayması (distribution shift)",
        "    Eğitim dışı YZ sistemlerine sınırlı",
        "    genelleme.",
        "",
        "2.  Sınıf dengesizliği (%59,9/%40,1)",
        "    class_weight ile kısmen giderildi.",
        "",
        "3.  Gerçek zamanlı uygulama henüz",
        "    test edilmedi.",
    ],fs=14,color=DGRAY)
    bl(s,6.5,1.75,6.4,5.2,[
        "Güçlü Yönler:",
        "",
        "✓  47 boyutlu heterojen öznitelik vektörü",
        "",
        "✓  SHAP ile açıklanabilirlik",
        "",
        "✓  Youden J eşik optimizasyonu",
        "",
        "✓  5-katlı CV — güvenilir istatistik",
        "   (±0,0023 std)",
        "",
        "✓  GUJSA formatında akademik yayın",
    ],fs=14,color=DGRAY); ft(s)

    # 14-Sonuçlar
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"Sonuçlar")
    for i,(t,d) in enumerate([
        ("47 boyutlu heterojen öznitelik","5 akustik aileden derlenen, müzik-spesifik kapsamlı vektör."),
        ("LightGBM lider — %95,48 ROC-AUC","±0,0023 std ile 11 model içinde en kararlı."),
        ("Spectral Flatness Std Dev kritik","YZ müziğini insan müziğinden en güçlü ayıran öznitelik."),
        ("Youden J optimizasyonu +3,3 puan","θ*=0,4316 ile F1 %89,4→%92,7."),
        ("Açıklanabilir sistem","TreeSHAP — her karar yorumlanabilir."),
    ]):
        top=1.75+i*1.08
        rc(s,0.4,top,12.5,0.95,WHITE if i%2==0 else LGRAY,TEAL)
        bx(s,0.55,top+0.07,0.5,0.75,f"{i+1}.",fs=18,bold=True,
           color=TEAL,align=PP_ALIGN.CENTER)
        bx(s,1.1,top+0.05,4.5,0.4,t,fs=13,bold=True,color=NAVY)
        bx(s,1.1,top+0.46,11.5,0.4,d,fs=12,color=DGRAY)
    ft(s)

    # 15-Gelecek
    s=sl(prs); bg(s,LGRAY)
    hbar(s,"Gelecek Çalışmalar")
    for ci,(title,items,clr) in enumerate([
        ("Kısa Vade",["Domain adaptation","Gerçek zamanlı çıkarım","<5 sn klipler"],
         RGBColor(0xE8,0xF4,0xE8)),
        ("Orta Vade",["Sosyal medya entegrasyonu","Canlı ses akışı","Çok dilli veri"],
         RGBColor(0xE8,0xF0,0xFF)),
        ("Uzun Vade",["Az örnekli öğrenme","Watermarking","Telif kuruluşu işbirliği"],
         RGBColor(0xFF,0xF3,0xCC)),
    ]):
        lft=0.35+ci*4.3
        rc(s,lft,1.75,4.1,5.35,clr,TEAL)
        bx(s,lft+0.1,1.85,3.9,0.48,title,fs=15,bold=True,color=NAVY)
        bl(s,lft+0.1,2.45,3.9,4.5,items,fs=13,color=DGRAY,gap=10)
    ft(s)

    # 16-Teşekkür
    s=sl(prs); bg(s,NAVY)
    bx(s,0.5,1.2,12.3,1.1,"Dinlediğiniz için teşekkürler.",
       fs=34,bold=True,color=WHITE,align=PP_ALIGN.CENTER)
    bx(s,0.5,2.4,12.3,0.75,"Sorularınızı bekliyorum.",
       fs=22,color=GOLD,align=PP_ALIGN.CENTER)
    for i,(v,l) in enumerate([("%95,48","ROC-AUC"),("47","Öznitelik"),
                                ("11","Model"),("5.195","Örnek")]):
        lft=1.2+i*2.75
        rc(s,lft,3.5,2.4,1.35,RGBColor(0x06,0x1A,0x35),TEAL)
        bx(s,lft+0.05,3.55,2.3,0.68,v,fs=24,bold=True,
           color=GOLD,align=PP_ALIGN.CENTER)
        bx(s,lft+0.05,4.18,2.3,0.5,l,fs=12,color=WHITE,align=PP_ALIGN.CENTER)
    bx(s,0.5,5.15,12.3,0.42,
       "Hasan Arthur Altuntaş  |  hasannarthurrr@gmail.com",
       fs=14,color=RGBColor(0xB0,0xC8,0xD8),align=PP_ALIGN.CENTER)
    bx(s,0.5,5.58,12.3,0.38,
       "Düzce Üniversitesi  |  Bilgisayar Mühendisliği  |  BM498  |  2025-2026",
       fs=12,color=RGBColor(0x88,0x99,0xAA),align=PP_ALIGN.CENTER)

    # 17-İmza
    s=sl(prs); imza(s,"05","Final Savunma Sunumu")

# ═══════════════════════════════════════════════════════════════════════════════
# ÜRET: 5 AYRI PPTX
# ═══════════════════════════════════════════════════════════════════════════════
os.makedirs('docs/academic/TeslimEdilecekler/Sunumlar',exist_ok=True)
out_dir='docs/academic/TeslimEdilecekler/Sunumlar'

funcs=[
    ("01_Donem_Baslangic_Sunumu",  make_01),
    ("02_Literatur_Taramasi_Sunumu",make_02),
    ("03_Tasarim_ve_Gelistirme_Sunumu",make_03),
    ("04_Sonuc_ve_Demo_Sunumu",    make_04),
    ("05_Final_Savunma_Sunumu",    make_05),
]

for fname, fn in funcs:
    p=new_prs()
    fn(p)
    path=f"{out_dir}/{fname}.pptx"
    p.save(path)
    print(f"✓  {fname}.pptx  ({len(p.slides)} slayt)")

# ═══════════════════════════════════════════════════════════════════════════════
# ÜRET: 1 BİRLEŞİK PPTX (tüm bölümler + divider'lar)
# ═══════════════════════════════════════════════════════════════════════════════
pAll=new_prs()
divider_sl(pAll,"01","Dönem Başlangıç Sunumu","Slayt 1-6")
make_01(pAll)
divider_sl(pAll,"02","Literatür Taraması Sunumu","Slayt 7-11")
make_02(pAll)
divider_sl(pAll,"03","Tasarım ve Geliştirme Sunumu","Slayt 12-18")
make_03(pAll)
divider_sl(pAll,"04","Sonuç ve Demo Sunumu","Slayt 19-24")
make_04(pAll)
divider_sl(pAll,"05","Final Savunma Sunumu","Slayt 25-45")
make_05(pAll)
path_all=f"{out_dir}/AURIS_Tum_Sunumlar_Birlesik.pptx"
pAll.save(path_all)
print(f"\n✓  AURIS_Tum_Sunumlar_Birlesik.pptx  ({len(pAll.slides)} slayt)")
print("\nTüm dosyalar:")
for f in sorted(os.listdir(out_dir)):
    sz=os.path.getsize(f"{out_dir}/{f}")//1024
    print(f"  {f}  ({sz} KB)")
