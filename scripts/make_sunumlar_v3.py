"""
AURIS — Tüm Sunumlar (v3 — GERÇEK VERİLERLE)
5 ayrı PPTX + 1 birleşik PPTX
Veri kaynağı: training_results.json, deep_learning_results.json, makale tabloları
Türkçe, akademik dil, gerçek görseller
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
GREEN = RGBColor(0x1A, 0x6B, 0x3A)
FIGS  = 'docs/academic/figures'

def new_prs():
    p = Presentation(); p.slide_width = Inches(13.33); p.slide_height = Inches(7.5)
    return p
def sl(prs): return prs.slides.add_slide(prs.slide_layouts[6])
def bg(s, c):
    f = s.background.fill; f.solid(); f.fore_color.rgb = c
def bx(s, l, t, w, h, text, fs=16, bold=False, color=WHITE, align=PP_ALIGN.LEFT):
    tb = s.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.alignment = align
    r = p.add_run(); r.text = text
    r.font.size = Pt(fs); r.font.bold = bold; r.font.color.rgb = color
    return tb
def bl(s, l, t, w, h, lines, fs=14, color=DGRAY, gap=4):
    tb = s.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True; first = True
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
    if sub: bx(s, 0.35, 0.92, 12.6, 0.5, sub, fs=12, color=RGBColor(0xB0,0xC8,0xD8))
def ft(s):
    bx(s, 0, 7.12, 13.33, 0.33,
       "Hasan Arthur Altuntaş  |  BM498  |  Düzce Üniversitesi  |  2025-2026",
       fs=9, color=RGBColor(0x88,0x99,0xAA), align=PP_ALIGN.CENTER)
def img(s, path, l, t, w, h):
    if os.path.exists(path):
        s.shapes.add_picture(path, Inches(l), Inches(t), Inches(w), Inches(h))
    else:
        rc(s, l, t, w, h, RGBColor(0xEE,0xEE,0xEE), TEAL)
        bx(s, l+0.1, t+h/2-0.2, w-0.2, 0.4, f"[{os.path.basename(path)}]",
           fs=10, color=RGBColor(0x99,0x99,0x99), align=PP_ALIGN.CENTER)
def imza(s, no, adi):
    bg(s, LGRAY); rc(s, 0, 0, 13.33, 0.5, NAVY)
    bx(s, 0.35, 0.07, 12.6, 0.38, f"BM498 — {no}: {adi}", fs=11, color=WHITE)
    rc(s, 2.5, 1.1, 8.3, 5.9, WHITE, TEAL)
    bx(s, 2.6, 1.22, 8.1, 0.6, "ÖĞRENCİ İMZA SAYFASI", fs=17, bold=True,
       color=NAVY, align=PP_ALIGN.CENTER)
    sh = s.shapes.add_shape(1, Inches(2.6), Inches(1.85), Inches(8.1), Inches(0))
    sh.line.color.rgb = TEAL; sh.line.width = Pt(1.5)
    fields = [("Öğrenci Adı Soyadı","Hasan Arthur Altuntaş"),("Öğrenci Numarası",""),
              ("Bölüm","Bilgisayar Mühendisliği"),("Danışman",""),
              ("Sunum Tarihi",""),("Sunum Adı", adi)]
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
    s = sl(prs); bg(s, NAVY); rc(s, 0, 2.75, 13.33, 0.07, TEAL)
    bx(s, 0.5, 0.65, 12.3, 1.0, no, fs=52, bold=True, color=GOLD, align=PP_ALIGN.CENTER)
    bx(s, 0.5, 1.62, 12.3, 0.85, title, fs=24, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    bx(s, 0.5, 3.0, 12.3, 0.5, hint, fs=12, color=RGBColor(0xB0,0xC8,0xD8), align=PP_ALIGN.CENTER)
    bx(s, 0.5, 6.5, 12.3, 0.4,
       "Hasan Arthur Altuntaş  |  BM498  |  Düzce Üniversitesi  |  2025-2026",
       fs=11, color=RGBColor(0x55,0x77,0x99), align=PP_ALIGN.CENTER)

# ── GERÇEK VERİLER (training_results.json + deep_learning_results.json) ─────────
# Model tablosu (Makale Tablo 4 — ROC-AUC sırasına göre)
MODEL_TABLE = [
    # (Model, Tip, Doğruluk, F1, ROC-AUC)
    ("LightGBM ★",      "ML", "0,8839", "0,8575", "0,9548"),
    ("Derin ÇKA",       "DL", "0,8849", "0,8596", "0,9542"),
    ("Artık ÇKA",       "DL", "0,8756", "0,8476", "0,9485"),
    ("XGBoost",         "ML", "0,8751", "0,8408", "0,9465"),
    ("Gradyan Artırma", "ML", "0,8685", "0,8337", "0,9397"),
    ("Rastgele Orman",  "ML", "0,8606", "0,8183", "0,9394"),
    ("Dikkat ÇKA",      "DL", "0,8628", "0,8293", "0,9359"),
    ("SVM-RBF",         "ML", "0,8612", "0,8252", "0,9346"),
    ("ÇKA Sinir Ağı",   "ML", "0,8566", "0,8189", "0,9276"),
    ("1B-ESA",          "DL", "0,7665", "0,7159", "0,8543"),
    ("Lojistik Reg.",   "ML", "0,7779", "0,7390", "0,8515"),
]
# Veri kümesi (Makale Tablo 2)
DATASET = [
    ("GTZAN",               "İnsan",        "899",  "0"),
    ("FMA Small",           "İnsan",        "1.000","0"),
    ("SleepyJesse (kapak)", "İnsan",        "854",  "0"),
    ("Diğer insan",         "İnsan",        "360",  "0"),
    ("Echoes",              "Yapay zekâ",   "1.128","1"),
    ("Suno (v3-v5)",        "Yapay zekâ",   "500",  "1"),
    ("Deepfake seti",       "Yapay zekâ",   "492",  "1"),
    ("AImE/Mustango/JEN-1", "Yapay zekâ",   "204",  "1"),
    ("TOPLAM",              "",             "5.195",""),
]
# Öznitelik önemi (Makale Tablo 6 — ilk 10)
FEAT_IMP = [
    ("spectral_flatness_std",  "0,0619"),
    ("spectral_contrast_mean", "0,0467"),
    ("rms_energy",             "0,0456"),
    ("onset_strength_std",     "0,0388"),
    ("spectral_flatness_mean", "0,0370"),
    ("rms_dynamic_range",      "0,0346"),
    ("onset_strength_mean",    "0,0332"),
    ("rms_std",                "0,0298"),
    ("beat_count",             "0,0298"),
    ("mfcc_delta_var",         "0,0289"),
]
# Öznitelik aileleri (Makale — 5 aile: spektral 16, zamansal 10, ritmik 9, harmonik 8, vokal 4)
FAMILIES = [
    ("Spektral (16)", "MFCC, mel-spektrogram, centroid,\nbandwidth, rolloff, flatness + delta"),
    ("Zamansal (10)", "RMS enerjisi, sıfır geçiş hızı,\ndinamik aralık türevleri"),
    ("Ritmik (9)",    "Tempo, beat sayısı,\nonset gücü istatistikleri"),
    ("Harmonik (8)",  "Chroma vektörü, harmonik-\nalgısal ayrıştırma bileşenleri"),
    ("Vokal (4)",     "Temel frekans istatistikleri,\nvibrato, formant"),
]
# Literatür karşılaştırma (Makale Tablo 7)
LIT = [
    ("Afchar vd. (2025)",   "Oto-kodlayıcı artefakt", "Özel",   "—",     "0,872"),
    ("Li vd. (2026)",       "Açıklanabilir öznitelik","Özel",   "0,931", "0,884"),
    ("Cros Vila vd. (2025)","Spektral+ritmik+SVM",    "Özel",   "0,941", "—"),
    ("SONICS (2025)",       "Transformer DL",         "SONICS", "0,960", "0,921"),
    ("FakeMusicCaps (2025)","Çok modlu MusicCaps",    "FMC",    "0,943", "0,906"),
    ("AURIS ★",             "47 öznitelik+11 model",  "5.195",  "0,9548","0,8731"),
]

def make_01(prs):
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "01 — Dönem Başlangıç Sunumu", "BM498 | 2025-2026 Güz Dönemi")
    bl(s, 0.5, 1.7, 12.3, 5.0, [
        "Proje Adı :   AURIS — Yapay Zekâ Üretimli Müzik Tespitinde Topluluk Öğrenmesi",
        "Öğrenci   :   Hasan Arthur Altuntaş",
        "Danışman  :   ___________________________",
        "",
        "Problem   :   Suno, Udio, MusicGen gibi sistemlerin ürettiği müziği",
        "               insan kayıtlarından otomatik olarak ayırt etmek.",
        "",
        "Hedef     :   %90+ ROC-AUC, 47 boyutlu öznitelik, açıklanabilir model.",
        "",
        "Kapsam    :   5.195 ses örneği, çoklu kaynak, 11 sınıflandırma modeli.",
    ], fs=15, color=DGRAY); ft(s)

    s = sl(prs); bg(s, LGRAY); hbar(s, "Problem Tanımı ve Motivasyon")
    bl(s, 0.5, 1.7, 12.3, 5.2, [
        "▸  Suno, Udio, MusicGen saniyeler içinde insan kaydından ayırt edilemez müzik üretiyor.",
        "▸  Telif hakkı ihlalleri, sahte hit manipülasyonu, dezenformasyon riski artıyor.",
        "▸  Mevcut dedektörler konuşma odaklı — müzik için yetersiz kalıyor.",
        "",
        "Tespit açığı:",
        "  • Müzik-spesifik heterojen öznitelik setleri yetersiz.",
        "  • Topluluk (ensemble) yaklaşımı müzik tespitine yeterince uygulanmamış.",
        "  • Açıklanabilir (SHAP tabanlı) sistem literatürde eksik.",
        "",
        "AURIS bu üç boşluğu doldurmayı hedeflemektedir.",
    ], fs=15, color=DGRAY); ft(s)

    s = sl(prs); bg(s, LGRAY); hbar(s, "Planlanan Yöntem ve Zaman Planı")
    bl(s, 0.5, 1.7, 6.0, 5.2, [
        "Veri:",
        "  5.195 örnek — çoklu insan + YZ kaynağı",
        "Öznitelik:",
        "  47 boyutlu akustik vektör",
        "  (spektral, zamansal, ritmik, harmonik, vokal)",
        "Model:",
        "  11 model topluluğu (7 ML + 4 DL)",
        "  LightGBM lider model",
        "Değerlendirme:",
        "  5-katlı çapraz doğrulama, SHAP",
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
        "  Genelleme → ileri çalışma kapsamı",
    ], fs=14, color=DGRAY); ft(s)

    s = sl(prs); bg(s, LGRAY); hbar(s, "Beklenen Çıktılar")
    for i, (t, d) in enumerate([
        ("Tespit Sistemi",   "Uçtan uca LightGBM tabanlı, 47 öznitelikli sınıflandırıcı"),
        ("Açıklanabilirlik", "SHAP/TreeSHAP ile her kararın yorumlanabilmesi"),
        ("Akademik Yayın",   "GUJSA'ya gönderilmek üzere hazırlanan makale"),
        ("Açık Kaynak Kod",  "Backend + model — teslim paketiyle birlikte"),
    ]):
        top = 1.75 + i*1.3
        rc(s, 0.4, top, 12.5, 1.15, WHITE, TEAL)
        bx(s, 0.6, top+0.12, 3.5, 0.5, f"{i+1}.  {t}", fs=15, bold=True, color=NAVY)
        bx(s, 4.3, top+0.12, 8.4, 0.9, d, fs=14, color=DGRAY)
    ft(s)
    s = sl(prs); imza(s, "01", "Dönem Başlangıç Sunumu")

def make_02(prs):
    s = sl(prs); bg(s, LGRAY); hbar(s, "02 — Literatür Taraması", "Kapsam ve yöntem")
    bl(s, 0.5, 1.7, 12.3, 4.8, [
        "Taranan kaynak sayısı :  39 makale (2020-2026)",
        "Güncel oran           :  %74 son 5 yıl içinde (GUJSA eşiği: %30)",
        "",
        "3 ana araştırma alanı:",
        "  1.  Ses Derin Sahte Tespiti (Audio Deepfake Detection)",
        "  2.  GenAI Müzik Üretici Sistemleri",
        "  3.  GenAI Müzik Tespitinde Güncel Gelişmeler",
        "",
        "Temel tespit: Müzik için ensemble + SHAP yaklaşımı literatürde henüz eksik.",
    ], fs=15, color=DGRAY); ft(s)

    s = sl(prs); bg(s, LGRAY); hbar(s, "Alan 1: Ses Derin Sahte Tespiti")
    ch = ["Model / Çalışma","Yazarlar","Yıl","Katkı"]
    cw = [2.8,2.5,1.2,6.5]; cx = [0.35,3.2,5.75,7.0]
    for h,x,w in zip(ch,cx,cw):
        r2=rc(s,x,1.75,w,0.42,NAVY); r2.line.fill.background()
        bx(s,x+0.05,1.78,w-0.1,0.36,h,fs=12,bold=True,color=WHITE,align=PP_ALIGN.CENTER)
    rows=[("AASIST","Jung vd.","2022","Spektro-temporal GAT — ASVspoof 2019"),
          ("RawNet2","Tak vd.","2021","Ham dalga formu, uçtan uca"),
          ("wav2vec 2.0","Baevski vd.","2020","Öz-denetimli temsil öğrenmesi"),
          ("WavLM","Chen vd.","2022","Maskelenmiş öngörüyle ön eğitim"),
          ("ADD 2022","Yi vd.","2022","İlk YZ ses sentezi tespit yarışması"),
          ("ASVspoof 2019","Wang vd.","2020","Büyük ölçekli benchmark")]
    for ri,row in enumerate(rows):
        top=2.22+ri*0.72; rc2=WHITE if ri%2==0 else LGRAY
        for cell,x,w in zip(row,cx,cw):
            rc(s,x,top,w,0.65,rc2,RGBColor(0xCC,0xCC,0xCC))
            bx(s,x+0.05,top+0.12,w-0.1,0.42,cell,fs=12,color=DGRAY,align=PP_ALIGN.CENTER)
    ft(s)

    s = sl(prs); bg(s, LGRAY); hbar(s, "Alan 2-3: YZ Müzik ve Tespit + Boşluk Analizi")
    bl(s,0.5,1.7,6.0,5.2,[
        "YZ Müzik Üretici Sistemler:",
        "  MusicGen (Copet vd., 2023) — Meta",
        "  AudioLDM (Liu vd., 2023) — latent diffusion",
        "  Suno / Udio — ticari sistemler, 2024",
        "",
        "Tespit Çalışmaları:",
        "  Afchar vd. (ICASSP 2025) — oto-kodlayıcı",
        "  Cros Vila vd. (TISMIR 2025) — müzik öznitelik",
        "  Li vd. (Sci. Rep. 2026) — açıklanabilir",
        "",
        "Veri Setleri:",
        "  SONICS (ICLR 2025), FakeMusicCaps (2025)",
    ],fs=13,color=DGRAY)
    bl(s,6.8,1.7,6.1,5.2,[
        "Literatür Boşlukları:",
        "",
        "✗  Müzik için topluluk (ensemble) yetersiz",
        "✗  47 boyutlu heterojen öznitelik yok",
        "✗  Kaynak bazlı performans analizi yok",
        "✗  SHAP açıklanabilirlik uygulanmamış",
        "✗  Youden J eşik optimizasyonu yok",
        "",
        "AURIS bu 5 boşluğu dolduruyor.",
        "",
        "Referans: 39  |  Güncel oran: %74",
    ],fs=13,color=DGRAY); ft(s)
    s=sl(prs); imza(s,"02","Literatür Taraması Sunumu")

def make_03(prs):
    s=sl(prs); bg(s,LGRAY); hbar(s,"03 — Tasarım ve Geliştirme","Sistem mimarisi")
    img(s,f"{FIGS}/paper_pipeline_diagram.png",0.4,1.65,12.5,5.0)
    bx(s,0.4,6.75,12.5,0.38,"Şekil 1: AURIS uçtan uca işleyiş şeması",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER); ft(s)

    s=sl(prs); bg(s,LGRAY); hbar(s,"Öznitelik Çıkarma — 47 Boyutlu Vektör","5 işlevsel aile (librosa tabanlı)")
    for i,(nm,ds) in enumerate(FAMILIES):
        lft=0.35+(i%3)*4.3; top=1.75+(i//3)*2.55
        rc(s,lft,top,4.0,2.35,WHITE,TEAL)
        bx(s,lft+0.1,top+0.1,3.8,0.45,nm,fs=14,bold=True,color=NAVY)
        bx(s,lft+0.1,top+0.65,3.8,1.55,ds,fs=12,color=DGRAY)
    rc(s,8.65,4.35,4.25,1.1,NAVY)
    bx(s,8.75,4.42,4.05,0.52,"Toplam: 47 boyut",fs=18,bold=True,color=GOLD,align=PP_ALIGN.CENTER)
    bx(s,8.75,4.88,4.05,0.4,"16 + 10 + 9 + 8 + 4",fs=13,color=WHITE,align=PP_ALIGN.CENTER); ft(s)

    s=sl(prs); bg(s,LGRAY); hbar(s,"Öznitelik Dağılımları","YZ vs İnsan — ilk 8 öznitelik")
    img(s,f"{FIGS}/feature_distribution_ai_vs_human.png",0.4,1.65,12.5,5.1)
    bx(s,0.4,6.82,12.5,0.35,"Şekil 2: YZ ve insan müziğinin öznitelik dağılımları",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER); ft(s)

    s=sl(prs); bg(s,LGRAY); hbar(s,"Sınıflandırma Modelleri — 11 Model")
    bl(s,0.4,1.7,5.8,5.2,[
        "Makine Öğrenmesi (7):",
        "  • LightGBM — is_unbalance=True",
        "  • XGBoost — n_estimators=400",
        "  • Gradyan Artırma — max_depth=4",
        "  • Rastgele Orman — n_estimators=500",
        "  • SVM-RBF — C=10, gamma=0,05",
        "  • ÇKA Sinir Ağı — 128-64, relu",
        "  • Lojistik Regresyon — balanced",
    ],fs=14,color=DGRAY)
    bl(s,6.5,1.7,6.4,5.2,[
        "Derin Öğrenme (4):",
        "  • Derin ÇKA — 512-256-128-64, BatchNorm",
        "  • Artık ÇKA — 3 blok, 256-256",
        "  • Dikkat ÇKA — öz-dikkat, 4 baş",
        "  • 1B-ESA — Conv1D + max-pool",
        "",
        "Sınıf dengesi:",
        "  %59,9 insan — %40,1 YZ",
        "  class_weight='balanced'",
        "  is_unbalance=True (ağaç modelleri)",
    ],fs=14,color=DGRAY); ft(s)
    s=sl(prs); imza(s,"03","Tasarım ve Geliştirme Sunumu")

def make_04(prs):
    s=sl(prs); bg(s,LGRAY); hbar(s,"04 — Sonuç ve Demo","Elde edilen metrikler (LightGBM)")
    for i,(lbl,val,sub) in enumerate([
        ("ROC-AUC",   "0,9548","5-katlı CV"),
        ("Doğruluk",  "0,8839","θ*=0,4316"),
        ("F1-Skoru",  "0,8575","dengeli"),
        ("Youden θ*", "0,4316","optimum"),
    ]):
        lft=0.4+i*3.2
        rc(s,lft,1.75,3.0,2.2,NAVY)
        bx(s,lft+0.1,1.85,2.8,0.55,lbl,fs=14,color=WHITE,align=PP_ALIGN.CENTER)
        bx(s,lft+0.1,2.35,2.8,0.85,val,fs=30,bold=True,color=GOLD,align=PP_ALIGN.CENTER)
        bx(s,lft+0.1,3.15,2.8,0.45,sub,fs=12,color=RGBColor(0xB0,0xC8,0xD8),align=PP_ALIGN.CENTER)
    bl(s,0.4,4.2,12.5,2.8,[
        "LightGBM 11 model içinde en yüksek ROC-AUC (0,9548) değerini sağladı.",
        "spectral_flatness_std en ayırt edici öznitelik olarak öne çıktı (SHAP).",
        "Youden J eşik optimizasyonu (θ*=0,4316) dengeli sınıf kararı sağladı.",
    ],fs=14,color=DGRAY,gap=7); ft(s)

    s=sl(prs); bg(s,LGRAY); hbar(s,"Model Karşılaştırması","Tüm modellerin ROC-AUC değerleri")
    img(s,f"{FIGS}/paper_model_comparison.png",0.4,1.65,12.5,5.1)
    bx(s,0.4,6.82,12.5,0.35,"Şekil 3: Tüm modellerin performans karşılaştırması",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER); ft(s)

    s=sl(prs); bg(s,LGRAY); hbar(s,"Demo — Sistem Çalışma Akışı")
    bl(s,0.5,1.7,6.5,5.2,[
        "1.  Müzik dosyası yüklenir (WAV / MP3).",
        "2.  Ön işleme: 22 050 Hz, mono.",
        "3.  47 öznitelik çıkarılır (librosa).",
        "4.  LightGBM olasılık üretir.",
        "5.  θ* = 0,4316 eşiği uygulanır.",
        "6.  Çıktı: 'YZ' / 'İnsan' + olasılık skoru.",
        "7.  SHAP ile karar yorumlanır.",
        "",
        "Demo videosu teslim paketindedir:",
        "  Uygulama/demo_video.mp4",
    ],fs=14,color=DGRAY)
    img(s,f"{FIGS}/paper_score_distribution.png",7.0,1.65,6.0,4.9)
    bx(s,7.0,6.6,6.0,0.4,"Şekil 9: P(YZ) tahmin olasılık dağılımı",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER); ft(s)

    s=sl(prs); bg(s,LGRAY); hbar(s,"Akademik Katkı ve Özgün Değer")
    for i,(t,d) in enumerate([
        ("47 boyutlu heterojen öznitelik","5 akustik aileden derlenen müzik-spesifik kapsamlı set."),
        ("Topluluk öğrenmesi","11 model — tek model yaklaşımlarının üstünde sonuç."),
        ("SHAP açıklanabilirlik","Müzik deepfake tespitinde TreeSHAP entegrasyonu."),
        ("Youden J optimizasyonu","Dengesiz sınıf için θ*=0,4316 — varsayılan 0,5'ten üstün."),
        ("GUJSA yayını","Ulusal hakemli dergiye gönderilmek üzere hazırlandı."),
    ]):
        top=1.75+i*1.05
        rc(s,0.4,top,12.5,0.92,WHITE if i%2==0 else LGRAY,TEAL)
        bx(s,0.55,top+0.07,0.5,0.72,f"{i+1}.",fs=16,bold=True,color=TEAL,align=PP_ALIGN.CENTER)
        bx(s,1.1,top+0.05,4.2,0.38,t,fs=13,bold=True,color=NAVY)
        bx(s,1.1,top+0.46,11.6,0.38,d,fs=12,color=DGRAY)
    ft(s)
    s=sl(prs); imza(s,"04","Sonuç ve Demo Sunumu")

def make_05(prs):
    # Kapak
    s=sl(prs); bg(s,NAVY); rc(s,0,0,13.33,7.5,NAVY)
    bx(s,0.5,0.6,12.3,1.1,"AURIS",fs=70,bold=True,color=GOLD,align=PP_ALIGN.CENTER)
    bx(s,0.5,1.65,12.3,0.72,"Yapay Zekâ Üretimli Müzik Tespitinde Topluluk Öğrenmesi",
       fs=21,bold=True,color=WHITE,align=PP_ALIGN.CENTER)
    bx(s,0.5,2.32,12.3,0.5,"Heterojen Akustik Öznitelikler ve LightGBM Tabanlı Bir Yaklaşım",
       fs=15,color=RGBColor(0xB0,0xC8,0xD8),align=PP_ALIGN.CENTER)
    rc(s,0,5.25,13.33,2.25,RGBColor(0x06,0x1A,0x35))
    bx(s,0.5,5.37,12.3,0.45,"Hasan Arthur Altuntaş",fs=16,bold=True,color=WHITE,align=PP_ALIGN.CENTER)
    bx(s,0.5,5.82,12.3,0.4,"Danışman: ___________________________",
       fs=14,color=RGBColor(0xB0,0xC8,0xD8),align=PP_ALIGN.CENTER)
    bx(s,0.5,6.22,12.3,0.38,"Düzce Üniversitesi  |  Mühendislik Fakültesi  |  BM498  |  2025-2026",
       fs=12,color=RGBColor(0x88,0x99,0xAA),align=PP_ALIGN.CENTER)

    # İçindekiler
    s=sl(prs); bg(s,LGRAY); hbar(s,"Sunum Planı — 05 Final Savunma")
    bl(s,0.5,1.7,12.3,5.5,[
        "1.   Motivasyon ve Problem Tanımı","2.   Literatür Özeti ve Boşluk Analizi",
        "3.   Sistem Mimarisi (AURIS Pipeline)","4.   Veri Kümesi",
        "5.   Öznitelik Çıkarma (47 Boyutlu Vektör)","6.   Sınıflandırma Modelleri ve Eğitim",
        "7.   Sonuçlar — Model Karşılaştırması","8.   Açıklanabilirlik (SHAP / TreeSHAP)",
        "9.   İlgili Çalışmalarla Karşılaştırma","10.  Kısıtlamalar ve Güçlü Yönler",
        "11.  Sonuçlar ve Gelecek Çalışmalar",
    ],fs=17,color=DGRAY,gap=5); ft(s)

    # Motivasyon
    s=sl(prs); bg(s,LGRAY); hbar(s,"Motivasyon","Neden AURIS? Neden şimdi?")
    bl(s,0.5,1.7,6.0,5.2,[
        "Suno, Udio, MusicGen saniyeler içinde","insan kaydından ayırt edilemez müzik üretiyor.",
        "","▸  Telif hakkı ihlalleri","▸  Sahte hit (streaming fraud)",
        "▸  Dezenformasyon","▸  Yaratıcı ekonomide zarar","",
        "Mevcut dedektörler konuşma odaklı —","müzik için yetersiz.",
    ],fs=15,color=DGRAY)
    for i,(v,l) in enumerate([("0,9548","ROC-AUC"),("47","Öznitelik"),("11","Model"),("5.195","Örnek")]):
        top=1.75+i*1.3
        rc(s,7.0,top,5.9,1.15,NAVY)
        bx(s,7.1,top+0.05,5.7,0.6,v,fs=28,bold=True,color=GOLD,align=PP_ALIGN.CENTER)
        bx(s,7.1,top+0.62,5.7,0.42,l,fs=13,color=WHITE,align=PP_ALIGN.CENTER)
    ft(s)

    # Pipeline
    s=sl(prs); bg(s,LGRAY); hbar(s,"Sistem Mimarisi","AURIS uçtan uca pipeline")
    img(s,f"{FIGS}/paper_pipeline_diagram.png",0.4,1.65,12.5,5.05)
    bx(s,0.4,6.78,12.5,0.38,"Şekil 1: AURIS uçtan uca işleyiş şeması",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER); ft(s)

    # Veri kümesi tablosu (GERÇEK)
    s=sl(prs); bg(s,LGRAY); hbar(s,"Veri Kümesi","5.195 örnek — çoklu insan ve YZ kaynağı")
    ch=["Kaynak","Tür","Örnek Sayısı","Etiket"]
    cw=[4.2,3.0,2.6,2.2]; cx=[0.35]; [cx.append(cx[-1]+w) for w in cw[:-1]]
    for h,x,w in zip(ch,cx,cw):
        r=rc(s,x,1.7,w,0.42,NAVY); r.line.fill.background()
        bx(s,x+0.05,1.73,w-0.1,0.36,h,fs=12,bold=True,color=WHITE,align=PP_ALIGN.CENTER)
    for ri,row in enumerate(DATASET):
        top=2.16+ri*0.5
        is_total = (ri==len(DATASET)-1)
        rclr = RGBColor(0xE8,0xF4,0xE8) if is_total else (WHITE if ri%2==0 else LGRAY)
        for cell,x,w in zip(row,cx,cw):
            rc(s,x,top,w,0.46,rclr,RGBColor(0xCC,0xCC,0xCC))
            bx(s,x+0.04,top+0.06,w-0.08,0.34,cell,fs=12,bold=is_total,
               color=GREEN if is_total else DGRAY,align=PP_ALIGN.CENTER)
    bx(s,0.35,6.4,12.6,0.38,
       "Sınıf dağılımı: 3.113 insan (%59,9) — 2.082 YZ (%40,1)  |  class_weight='balanced'",
       fs=12,color=TEAL,align=PP_ALIGN.CENTER); ft(s)

    # 47 öznitelik (GERÇEK aileler)
    s=sl(prs); bg(s,LGRAY); hbar(s,"Öznitelik Çıkarma","47 boyutlu heterojen vektör — 5 işlevsel aile")
    for i,(nm,ds) in enumerate(FAMILIES):
        lft=0.35+(i%3)*4.3; top=1.75+(i//3)*2.55
        rc(s,lft,top,4.0,2.35,WHITE,TEAL)
        bx(s,lft+0.1,top+0.1,3.8,0.45,nm,fs=14,bold=True,color=NAVY)
        bx(s,lft+0.1,top+0.65,3.8,1.55,ds,fs=12,color=DGRAY)
    rc(s,8.65,4.35,4.25,1.1,NAVY)
    bx(s,8.75,4.42,4.05,0.52,"Toplam: 47 boyut",fs=18,bold=True,color=GOLD,align=PP_ALIGN.CENTER)
    bx(s,8.75,4.88,4.05,0.4,"16 + 10 + 9 + 8 + 4",fs=13,color=WHITE,align=PP_ALIGN.CENTER); ft(s)

    # Model karşılaştırma tablosu (GERÇEK — 11 model)
    s=sl(prs); bg(s,LGRAY); hbar(s,"Model Karşılaştırması","5-katlı CV — 11 model, ROC-AUC sırasına göre")
    ch2=["Model","Tip","Doğruluk","F1","ROC-AUC"]
    cw2=[3.6,1.6,2.3,2.3,2.3]; cx2=[0.35]; [cx2.append(cx2[-1]+w) for w in cw2[:-1]]
    for h,x,w in zip(ch2,cx2,cw2):
        r=rc(s,x,1.7,w,0.4,NAVY); r.line.fill.background()
        bx(s,x+0.03,1.72,w-0.06,0.36,h,fs=12,bold=True,color=WHITE,align=PP_ALIGN.CENTER)
    for ri,row in enumerate(MODEL_TABLE):
        top=2.13+ri*0.44
        rclr=RGBColor(0xFF,0xF8,0xE1) if ri==0 else (WHITE if ri%2==0 else LGRAY)
        for cell,x,w in zip(row,cx2,cw2):
            rc(s,x,top,w,0.4,rclr,RGBColor(0xCC,0xCC,0xCC))
            bx(s,x+0.03,top+0.03,w-0.06,0.34,cell,fs=11,bold=(ri==0),
               color=GREEN if ri==0 else DGRAY,align=PP_ALIGN.CENTER)
    bx(s,0.35,7.05,12.6,0.32,
       "★ LightGBM — en yüksek ROC-AUC (0,9548) ve Youden eşik optimizasyonu uygulanan tek model",
       fs=10,color=TEAL,align=PP_ALIGN.CENTER); ft(s)

    # ROC + confusion
    s=sl(prs); bg(s,LGRAY); hbar(s,"ROC Eğrileri ve Karmaşıklık Matrisi")
    img(s,f"{FIGS}/paper_roc_curves.png",0.35,1.65,6.3,5.1)
    bx(s,0.35,6.82,6.3,0.35,"Şekil 4: Makine öğrenmesi ROC eğrileri",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER)
    img(s,f"{FIGS}/paper_confusion_matrix_lightgbm.png",6.9,1.65,6.1,5.1)
    bx(s,6.9,6.82,6.1,0.35,"Şekil 8: LightGBM karmaşıklık matrisi",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER); ft(s)

    # SHAP (GERÇEK öznitelik sırası)
    s=sl(prs); bg(s,LGRAY); hbar(s,"SHAP Açıklanabilirlik Analizi","Hangi öznitelik kararı yönlendiriyor?")
    bl(s,0.4,1.75,5.5,5.0,[
        "TreeSHAP global öznitelik sıralaması:",
        "",
        "1.  spectral_flatness_std  ← EN ÖNEMLİ",
        "2.  spectral_contrast_mean",
        "3.  rms_energy",
        "4.  onset_strength_std",
        "5.  spectral_flatness_mean",
        "",
        "YZ müziği spektral açıdan daha 'düz' ve",
        "düzenli — en güçlü ayırt edici özellik.",
        "",
        "Tablo 6: İlk 10 öznitelik tam listesi.",
    ],fs=14,color=DGRAY)
    img(s,f"{FIGS}/shap_summary.png",6.1,1.65,7.0,5.0)
    bx(s,6.1,6.72,7.0,0.35,"Şekil 7: TreeSHAP global etki diyagramı",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER); ft(s)

    # Öznitelik önemi
    s=sl(prs); bg(s,LGRAY); hbar(s,"Öznitelik Önemi","LightGBM öznitelik önem skorları")
    img(s,f"{FIGS}/paper_feature_importance.png",0.35,1.65,12.6,5.1)
    bx(s,0.35,6.82,12.6,0.35,"Şekil 6: LightGBM öznitelik önem skorları",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER); ft(s)

    # Literatür karşılaştırma (GERÇEK Tablo 7)
    s=sl(prs); bg(s,LGRAY); hbar(s,"İlgili Çalışmalarla Karşılaştırma","Tablo 7")
    ch3=["Çalışma","Yaklaşım","Veri","ROC-AUC","F1"]
    cw3=[2.8,3.4,1.9,1.85,1.85]; cx3=[0.35]; [cx3.append(cx3[-1]+w) for w in cw3[:-1]]
    for h,x,w in zip(ch3,cx3,cw3):
        r=rc(s,x,1.75,w,0.42,NAVY); r.line.fill.background()
        bx(s,x+0.04,1.77,w-0.08,0.38,h,fs=12,bold=True,color=WHITE,align=PP_ALIGN.CENTER)
    for ri,row in enumerate(LIT):
        top=2.22+ri*0.68
        rclr=RGBColor(0xFF,0xF8,0xE1) if ri==5 else (WHITE if ri%2==0 else LGRAY)
        for cell,x,w in zip(row,cx3,cw3):
            rc(s,x,top,w,0.6,rclr,RGBColor(0xCC,0xCC,0xCC))
            bx(s,x+0.04,top+0.1,w-0.08,0.4,cell,fs=11,bold=(ri==5),
               color=GREEN if ri==5 else DGRAY,align=PP_ALIGN.CENTER)
    bx(s,0.35,6.5,12.6,0.45,
       "AURIS — yüksek ROC-AUC (0,9548) + tek açıklanabilir (SHAP) topluluk yaklaşımı",
       fs=13,bold=True,color=TEAL,align=PP_ALIGN.CENTER); ft(s)

    # Kalibrasyon + eşik
    s=sl(prs); bg(s,LGRAY); hbar(s,"Kalibrasyon ve Eşik Analizi")
    img(s,f"{FIGS}/paper_calibration.png",0.35,1.65,6.3,5.0)
    bx(s,0.35,6.72,6.3,0.35,"Şekil 10: Kalibrasyon eğrisi",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER)
    img(s,f"{FIGS}/threshold_sweep.png",6.9,1.65,6.1,5.0)
    bx(s,6.9,6.72,6.1,0.35,"Şekil 12: Karar eşiği taraması (θ*=0,4316)",
       fs=11,color=RGBColor(0x77,0x77,0x77),align=PP_ALIGN.CENTER); ft(s)

    # Kısıtlamalar
    s=sl(prs); bg(s,LGRAY); hbar(s,"Kısıtlamalar ve Güçlü Yönler")
    bl(s,0.4,1.75,5.8,5.2,[
        "Kısıtlamalar:","",
        "1.  Dağılım kayması (distribution shift)",
        "    Eğitim dışı YZ sistemlerine sınırlı","    genelleme.","",
        "2.  Sınıf dengesizliği (%59,9/%40,1)",
        "    class_weight ile giderildi.","",
        "3.  Gerçek zamanlı uygulama henüz","    test edilmedi.",
    ],fs=14,color=DGRAY)
    bl(s,6.5,1.75,6.4,5.2,[
        "Güçlü Yönler:","",
        "✓  47 boyutlu heterojen öznitelik vektörü","",
        "✓  SHAP/TreeSHAP ile açıklanabilirlik","",
        "✓  Youden J eşik optimizasyonu (θ*=0,4316)","",
        "✓  5-katlı CV — güvenilir istatistik","",
        "✓  GUJSA formatında akademik yayın",
    ],fs=14,color=DGRAY); ft(s)

    # Sonuçlar
    s=sl(prs); bg(s,LGRAY); hbar(s,"Sonuçlar")
    for i,(t,d) in enumerate([
        ("47 boyutlu heterojen öznitelik","5 akustik aileden derlenen müzik-spesifik kapsamlı vektör."),
        ("LightGBM lider — ROC-AUC 0,9548","11 model içinde en yüksek ayırt etme gücü."),
        ("spectral_flatness_std kritik","YZ müziğini insan müziğinden en güçlü ayıran öznitelik."),
        ("Youden J optimizasyonu","θ*=0,4316 ile dengeli sınıf kararı sağlandı."),
        ("Açıklanabilir sistem","TreeSHAP — her karar yorumlanabilir."),
    ]):
        top=1.75+i*1.08
        rc(s,0.4,top,12.5,0.95,WHITE if i%2==0 else LGRAY,TEAL)
        bx(s,0.55,top+0.07,0.5,0.75,f"{i+1}.",fs=18,bold=True,color=TEAL,align=PP_ALIGN.CENTER)
        bx(s,1.1,top+0.05,4.7,0.4,t,fs=13,bold=True,color=NAVY)
        bx(s,1.1,top+0.46,11.3,0.4,d,fs=12,color=DGRAY)
    ft(s)

    # Gelecek
    s=sl(prs); bg(s,LGRAY); hbar(s,"Gelecek Çalışmalar")
    for ci,(title,items,clr) in enumerate([
        ("Kısa Vade",["SONICS/FakeMusicCaps ile","  üretici-bağımsız değerlendirme","Gerçek zamanlı çıkarım"],RGBColor(0xE8,0xF4,0xE8)),
        ("Orta Vade",["Sosyal medya entegrasyonu","Canlı ses akışı tespiti","Çok dilli veri seti"],RGBColor(0xE8,0xF0,0xFF)),
        ("Uzun Vade",["Az örnekli öğrenme","Watermarking entegrasyonu","Telif kuruluşu işbirliği"],RGBColor(0xFF,0xF3,0xCC)),
    ]):
        lft=0.35+ci*4.3
        rc(s,lft,1.75,4.1,5.35,clr,TEAL)
        bx(s,lft+0.1,1.85,3.9,0.48,title,fs=15,bold=True,color=NAVY)
        bl(s,lft+0.1,2.45,3.9,4.5,items,fs=13,color=DGRAY,gap=10)
    ft(s)

    # Teşekkür
    s=sl(prs); bg(s,NAVY)
    bx(s,0.5,1.2,12.3,1.1,"Dinlediğiniz için teşekkürler.",fs=34,bold=True,color=WHITE,align=PP_ALIGN.CENTER)
    bx(s,0.5,2.4,12.3,0.75,"Sorularınızı bekliyorum.",fs=22,color=GOLD,align=PP_ALIGN.CENTER)
    for i,(v,l) in enumerate([("0,9548","ROC-AUC"),("47","Öznitelik"),("11","Model"),("5.195","Örnek")]):
        lft=1.2+i*2.75
        rc(s,lft,3.5,2.4,1.35,RGBColor(0x06,0x1A,0x35),TEAL)
        bx(s,lft+0.05,3.55,2.3,0.68,v,fs=24,bold=True,color=GOLD,align=PP_ALIGN.CENTER)
        bx(s,lft+0.05,4.18,2.3,0.5,l,fs=12,color=WHITE,align=PP_ALIGN.CENTER)
    bx(s,0.5,5.15,12.3,0.42,"Hasan Arthur Altuntaş  |  hasannarthurrr@gmail.com",
       fs=14,color=RGBColor(0xB0,0xC8,0xD8),align=PP_ALIGN.CENTER)
    bx(s,0.5,5.58,12.3,0.38,"Düzce Üniversitesi  |  Bilgisayar Mühendisliği  |  BM498  |  2025-2026",
       fs=12,color=RGBColor(0x88,0x99,0xAA),align=PP_ALIGN.CENTER)
    s=sl(prs); imza(s,"05","Final Savunma Sunumu")

# ── ÜRET ──────────────────────────────────────────────────────────────────────
out_dir='docs/academic/TeslimEdilecekler/Sunumlar'
os.makedirs(out_dir,exist_ok=True)
funcs=[("01_Donem_Baslangic_Sunumu",make_01),("02_Literatur_Taramasi_Sunumu",make_02),
       ("03_Tasarim_ve_Gelistirme_Sunumu",make_03),("04_Sonuc_ve_Demo_Sunumu",make_04),
       ("05_Final_Savunma_Sunumu",make_05)]
for fname, fn in funcs:
    p=new_prs(); fn(p); p.save(f"{out_dir}/{fname}.pptx")
    print(f"[OK]  {fname}.pptx  ({len(p.slides)} slayt)")

pAll=new_prs()
divider_sl(pAll,"01","Dönem Başlangıç Sunumu","Slayt 1-6"); make_01(pAll)
divider_sl(pAll,"02","Literatür Taraması Sunumu","Slayt 7-11"); make_02(pAll)
divider_sl(pAll,"03","Tasarım ve Geliştirme Sunumu","Slayt 12-18"); make_03(pAll)
divider_sl(pAll,"04","Sonuç ve Demo Sunumu","Slayt 19-24"); make_04(pAll)
divider_sl(pAll,"05","Final Savunma Sunumu","Slayt 25-45"); make_05(pAll)
pAll.save(f"{out_dir}/AURIS_Tum_Sunumlar_Birlesik.pptx")
print(f"[OK]  AURIS_Tum_Sunumlar_Birlesik.pptx  ({len(pAll.slides)} slayt)")
