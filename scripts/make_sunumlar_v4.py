"""
AURIS — Tüm Sunumlar (v4 — DETAYLI, GERÇEK VERİLERLE)
Zengin içerik, teknik derinlik, görsel + açıklama
Kaynak: training_results.json, deep_learning_results.json, makale tam metni
"""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
import os

NAVY  = RGBColor(0x0D, 0x2B, 0x55)
NAVY2 = RGBColor(0x06, 0x1A, 0x35)
TEAL  = RGBColor(0x00, 0x7A, 0x87)
TEALL = RGBColor(0xE0, 0xF0, 0xF2)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LGRAY = RGBColor(0xF4, 0xF6, 0xF8)
MGRAY = RGBColor(0xE8, 0xEC, 0xF0)
DGRAY = RGBColor(0x2A, 0x2A, 0x2A)
TGRAY = RGBColor(0x66, 0x70, 0x7A)
GOLD  = RGBColor(0xE0, 0xA8, 0x00)
GREEN = RGBColor(0x1A, 0x6B, 0x3A)
RED   = RGBColor(0xB5, 0x2A, 0x2A)
FIGS  = 'docs/academic/figures'

def new_prs():
    p = Presentation(); p.slide_width = Inches(13.33); p.slide_height = Inches(7.5)
    return p
def sl(prs): return prs.slides.add_slide(prs.slide_layouts[6])
def bg(s, c):
    f = s.background.fill; f.solid(); f.fore_color.rgb = c
def bx(s, l, t, w, h, text, fs=16, bold=False, color=WHITE,
       align=PP_ALIGN.LEFT, anchor=None, italic=False):
    tb = s.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True
    if anchor: tf.vertical_anchor = anchor
    p = tf.paragraphs[0]; p.alignment = align
    r = p.add_run(); r.text = text
    r.font.size = Pt(fs); r.font.bold = bold; r.font.color.rgb = color
    r.font.italic = italic
    return tb
def bullets(s, l, t, w, h, items, fs=14, color=DGRAY, gap=7, lead="•  "):
    """items: list of (text) or (text, indent_level)."""
    tb = s.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True; first = True
    for it in items:
        if isinstance(it, tuple):
            text, lvl = it
        else:
            text, lvl = it, 0
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False; p.space_after = Pt(gap)
        r = p.add_run()
        prefix = "" if text == "" else (lead if lvl == 0 else "    – ")
        r.text = prefix + text
        r.font.size = Pt(fs); r.font.color.rgb = color
        if lvl == 0 and text and not text.startswith(" "):
            pass
    return tb
def rc(s, l, t, w, h, fill, line=None, lw=1.0):
    sh = s.shapes.add_shape(1, Inches(l), Inches(t), Inches(w), Inches(h))
    sh.fill.solid(); sh.fill.fore_color.rgb = fill
    if line:
        sh.line.color.rgb = line; sh.line.width = Pt(lw)
    else:
        sh.line.fill.background()
    return sh
def hbar(s, kicker, title, sub=None):
    rc(s, 0, 0, 13.33, 1.5, NAVY)
    rc(s, 0, 1.5, 13.33, 0.06, GOLD)
    if kicker:
        bx(s, 0.4, 0.12, 12.5, 0.35, kicker.upper(), fs=11, bold=True,
           color=GOLD)
    bx(s, 0.4, 0.44, 12.5, 0.7, title, fs=24, bold=True, color=WHITE)
    if sub:
        bx(s, 0.4, 1.08, 12.5, 0.4, sub, fs=12.5, color=RGBColor(0xAE,0xC6,0xD6))
def chip(s, l, t, w, text, fill=TEAL, fc=WHITE, fs=11, h=0.4):
    rc(s, l, t, w, h, fill)
    bx(s, l, t+0.02, w, h-0.04, text, fs=fs, bold=True, color=fc,
       align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
def ft(s, page=None):
    bx(s, 0.4, 7.12, 9.0, 0.33,
       "AURIS  ·  Hasan Arthur Altuntaş  ·  BM498 Mezuniyet Tezi", fs=9,
       color=TGRAY)
    bx(s, 9.4, 7.12, 3.5, 0.33,
       "Düzce Üniversitesi · 2025-2026", fs=9, color=TGRAY, align=PP_ALIGN.RIGHT)
def img(s, path, l, t, w, h, caption=None):
    if os.path.exists(path):
        s.shapes.add_picture(path, Inches(l), Inches(t), Inches(w), Inches(h))
    else:
        rc(s, l, t, w, h, MGRAY, TEAL)
        bx(s, l, t+h/2-0.2, w, 0.4, f"[{os.path.basename(path)}]", fs=10,
           color=TGRAY, align=PP_ALIGN.CENTER)
    if caption:
        bx(s, l, t+h+0.04, w, 0.32, caption, fs=10, color=TGRAY, italic=True,
           align=PP_ALIGN.CENTER)
def statcard(s, l, t, w, h, value, label, vfs=30, fill=NAVY, vcolor=GOLD):
    rc(s, l, t, w, h, fill)
    bx(s, l, t+h*0.13, w, h*0.5, value, fs=vfs, bold=True, color=vcolor,
       align=PP_ALIGN.CENTER)
    bx(s, l, t+h*0.62, w, h*0.32, label, fs=11, color=WHITE,
       align=PP_ALIGN.CENTER)
def callout(s, l, t, w, h, title, body, fill=TEALL, bar=TEAL, tcolor=NAVY):
    rc(s, l, t, w, h, fill)
    rc(s, l, t, 0.09, h, bar)
    bx(s, l+0.22, t+0.12, w-0.35, 0.4, title, fs=13, bold=True, color=tcolor)
    bx(s, l+0.22, t+0.55, w-0.35, h-0.65, body, fs=12, color=DGRAY)

def imza(s, no, adi):
    bg(s, LGRAY); rc(s, 0, 0, 13.33, 0.5, NAVY)
    bx(s, 0.35, 0.07, 12.6, 0.38, f"BM498 — {no}: {adi}", fs=11, color=WHITE)
    rc(s, 2.5, 1.05, 8.3, 5.95, WHITE, TEAL, 1.5)
    bx(s, 2.6, 1.18, 8.1, 0.55, "ÖĞRENCİ İMZA SAYFASI", fs=17, bold=True,
       color=NAVY, align=PP_ALIGN.CENTER)
    sh = s.shapes.add_shape(1, Inches(2.6), Inches(1.78), Inches(8.1), Inches(0))
    sh.line.color.rgb = TEAL; sh.line.width = Pt(1.5)
    fields = [("Öğrenci Adı Soyadı","Hasan Arthur Altuntaş"),("Öğrenci Numarası",""),
              ("Bölüm","Bilgisayar Mühendisliği"),("Danışman",""),
              ("Sunum Tarihi",""),("Sunum Adı", adi)]
    for i, (lbl, val) in enumerate(fields):
        top = 1.98 + i*0.62
        bx(s, 2.7, top, 3.1, 0.35, lbl+":", fs=12, bold=True, color=NAVY)
        bx(s, 5.9, top, 4.7, 0.35, val, fs=12, color=DGRAY)
        ln = s.shapes.add_shape(1, Inches(5.85), Inches(top+0.37), Inches(4.75), Inches(0))
        ln.line.color.rgb = RGBColor(0xCC,0xCC,0xCC); ln.line.width = Pt(1)
    bx(s, 2.7, 5.95, 3.2, 0.38, "İmza:", fs=13, bold=True, color=NAVY)
    ln2 = s.shapes.add_shape(1, Inches(3.55), Inches(6.33), Inches(6.65), Inches(0))
    ln2.line.color.rgb = DGRAY; ln2.line.width = Pt(1.5)
    bx(s, 3.55, 6.39, 6.65, 0.3,
       "(Öğrenci bu alanı imzalayarak sunumun kendisine ait olduğunu onaylar.)",
       fs=9, color=TGRAY, align=PP_ALIGN.CENTER)

def divider_sl(prs, no, title, hint):
    s = sl(prs); bg(s, NAVY); rc(s, 0, 2.7, 13.33, 0.07, TEAL)
    bx(s, 0.5, 0.65, 12.3, 1.0, no, fs=52, bold=True, color=GOLD, align=PP_ALIGN.CENTER)
    bx(s, 0.5, 1.6, 12.3, 0.85, title, fs=24, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    bx(s, 0.5, 2.95, 12.3, 0.5, hint, fs=12, color=RGBColor(0xAE,0xC6,0xD6), align=PP_ALIGN.CENTER)
    bx(s, 0.5, 6.5, 12.3, 0.4,
       "Hasan Arthur Altuntaş  ·  BM498  ·  Düzce Üniversitesi  ·  2025-2026",
       fs=11, color=RGBColor(0x55,0x77,0x99), align=PP_ALIGN.CENTER)

# ════════════════ GERÇEK VERİLER ════════════════
MODEL_TABLE = [
    ("LightGBM",       "ML", "0,8839", "0,8575", "0,9548", "±0,0023"),
    ("Derin ÇKA",      "DL", "0,8849", "0,8596", "0,9542", "±0,0036"),
    ("Artık ÇKA",      "DL", "0,8756", "0,8476", "0,9485", "±0,0048"),
    ("XGBoost",        "ML", "0,8751", "0,8408", "0,9465", "±0,0029"),
    ("Gradyan Artırma","ML", "0,8685", "0,8337", "0,9397", "±0,0038"),
    ("Rastgele Orman", "ML", "0,8606", "0,8183", "0,9394", "±0,0051"),
    ("Dikkat ÇKA",     "DL", "0,8628", "0,8293", "0,9359", "±0,0059"),
    ("SVM-RBF",        "ML", "0,8612", "0,8252", "0,9346", "±0,0075"),
    ("ÇKA Sinir Ağı",  "ML", "0,8566", "0,8189", "0,9276", "±0,0061"),
    ("1B-ESA",         "DL", "0,7665", "0,7159", "0,8543", "±0,0087"),
    ("Lojistik Reg.",  "ML", "0,7779", "0,7390", "0,8515", "±0,0042"),
]
DATASET = [
    ("GTZAN",               "İnsan",       "899",  "0"),
    ("FMA Small",           "İnsan",       "1.000","0"),
    ("SleepyJesse (kapak)", "İnsan",       "854",  "0"),
    ("Diğer insan kaynağı", "İnsan",       "360",  "0"),
    ("Echoes",              "Yapay zekâ",  "1.128","1"),
    ("Suno (v3-v5)",        "Yapay zekâ",  "500",  "1"),
    ("Deepfake seti",       "Yapay zekâ",  "492",  "1"),
    ("AImE/Mustango/JEN-1", "Yapay zekâ",  "204",  "1"),
    ("TOPLAM",              "—",           "5.195",""),
]
FEAT_IMP = [
    ("1","spectral_flatness_std","0,0619","Spektral düzlüğün zamansal değişkenliği"),
    ("2","spectral_contrast_mean","0,0467","Tepe-vadi enerji farkı ortalaması"),
    ("3","rms_energy","0,0456","Ortalama sinyal enerjisi"),
    ("4","onset_strength_std","0,0388","Nota başlangıç gücü değişkenliği"),
    ("5","spectral_flatness_mean","0,0370","Spektral düzlük ortalaması"),
    ("6","rms_dynamic_range","0,0346","Enerji dinamik aralığı"),
    ("7","onset_strength_mean","0,0332","Nota başlangıç gücü ortalaması"),
    ("8","rms_std","0,0298","Enerji standart sapması"),
    ("9","beat_count","0,0298","Vuruş sayısı"),
    ("10","mfcc_delta_var","0,0289","MFCC birinci türev varyansı"),
]
FAMILIES = [
    ("Spektral", "16", "MFCC, mel-spektrogram, spectral centroid,\nbandwidth, rolloff, flatness ve delta istatistikleri",
     "Frekans içeriği ve tını"),
    ("Zamansal", "10", "RMS enerjisi, sıfır geçiş hızı,\ndinamik aralık türevleri",
     "Enerji ve zaman yapısı"),
    ("Ritmik", "9", "Tempo, beat sayısı,\nonset gücü istatistikleri",
     "Ritim ve vuruş düzeni"),
    ("Harmonik", "8", "Chroma vektörü, tonnetz,\nharmonik-algısal ayrıştırma",
     "Perde ve akor yapısı"),
    ("Vokal", "4", "Temel frekans, vibrato,\nformant tutarlılığı",
     "Şarkı sesi davranışı"),
]
LIT = [
    ("Afchar vd. [5]","Oto-kodlayıcı artefakt","Özel","—","0,872"),
    ("Li vd. [22]","Açıklanabilir öznitelik + ML","Özel","0,931","0,884"),
    ("Cros Vila vd. [33]","Spektral + ritmik + SVM","Özel","0,941","—"),
    ("SONICS [34]","Transformer tabanlı DL","SONICS","0,960","0,921"),
    ("FakeMusicCaps [35]","Çok modlu MusicCaps","FMC","0,943","0,906"),
    ("AURIS (bu çalışma)","47 öznitelik + 11 model topluluk","5.195","0,9548","0,8731"),
]

# ════════════════════════════════════════════════════════════════════════════
# BÖLÜM 01 — DÖNEM BAŞLANGIÇ
# ════════════════════════════════════════════════════════════════════════════
def make_01(prs):
    # Kapak
    s = sl(prs); bg(s, LGRAY)
    rc(s, 0, 0, 13.33, 2.7, NAVY)
    rc(s, 0, 2.7, 13.33, 0.07, GOLD)
    bx(s, 0.6, 0.45, 12.0, 0.4, "01 — DÖNEM BAŞLANGIÇ SUNUMU", fs=13, bold=True, color=GOLD)
    bx(s, 0.6, 0.95, 12.0, 1.0, "AURIS Proje Önerisi", fs=34, bold=True, color=WHITE)
    bx(s, 0.6, 1.85, 12.0, 0.6,
       "Yapay Zekâ Üretimli Müzik Tespitinde Topluluk Öğrenmesi",
       fs=16, color=RGBColor(0xAE,0xC6,0xD6))
    bullets(s, 0.7, 3.2, 7.6, 3.8, [
        "Problem: Üretken YZ sistemleri (Suno, Udio, MusicGen) insan kaydından",
        "ayırt edilemeyen müzik üretiyor; otomatik tespit yöntemi gerekiyor.",
        "",
        "Amaç: %90+ ROC-AUC ile sınıflandırma yapan, açıklanabilir, hafif bir",
        "tespit sistemi geliştirmek.",
        "",
        "Yaklaşım: 47 boyutlu elle tasarlanmış akustik öznitelik vektörü +",
        "11 modelden oluşan topluluk öğrenmesi.",
    ], fs=14, color=DGRAY, gap=4, lead="")
    statcard(s, 8.7, 3.25, 4.1, 1.05, "5.195", "Ses örneği", vfs=26)
    statcard(s, 8.7, 4.45, 4.1, 1.05, "47", "Akustik öznitelik", vfs=26)
    statcard(s, 8.7, 5.65, 4.1, 1.05, "11", "Sınıflandırma modeli", vfs=26)
    ft(s)

    # Problem derinlemesine
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Bölüm 1 · Giriş", "Problem Tanımı ve Motivasyon",
         "Üretken yapay zekânın müzik alanında yarattığı tespit ihtiyacı")
    callout(s, 0.4, 1.75, 6.15, 2.3, "Neden bir sorun?",
        "Metinden müziğe üretim sistemleri son üç yılda araştırma "
        "laboratuvarlarından tüketici uygulamalarına taştı. Kullanıcı tek bir "
        "metin istemiyle dakikalar içinde tam uzunlukta, deneyimsiz bir "
        "dinleyicinin insan bestesinden ayırt edemeyeceği parçalar üretebiliyor.",
        fill=RGBColor(0xFF,0xF3,0xE0), bar=GOLD)
    callout(s, 0.4, 4.2, 6.15, 2.5, "Doğurduğu riskler",
        "•  Telif hakkı ihlalleri ve içerik sahipliği belirsizliği\n"
        "•  Akış platformlarında sahte dinlenme / gelir manipülasyonu\n"
        "•  Dezenformasyon ve kimlik taklidi\n"
        "•  Yaratıcı endüstride ekonomik değer kaybı",
        fill=RGBColor(0xFD,0xE8,0xE8), bar=RED)
    callout(s, 6.75, 1.75, 6.15, 4.95, "Mevcut yöntemlerin yetersizliği",
        "Konuşma için ses derin sahte tespiti (ADD 2022, WaveFake) olgun bir "
        "alan; ancak müzik tespiti henüz emekleme aşamasında.\n\n"
        "Tespit açıkları:\n\n"
        "•  Tek bir akustik temsile (yalnızca MFCC veya yalnızca spektrogram) "
        "bağlı kalan yaklaşımlar genelleme yapamıyor.\n\n"
        "•  Topluluk (ensemble) öğrenmesi müzik tespitine yeterince "
        "uygulanmamış.\n\n"
        "•  Kararın hangi akustik özellikten kaynaklandığını açıklayan "
        "(SHAP tabanlı) bir sistem yok.\n\n"
        "AURIS bu üç boşluğu birlikte ele alıyor.",
        fill=TEALL, bar=TEAL)
    ft(s)

    # Hedefler + literatür konumu
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Bölüm 1 · Giriş", "Çalışmanın Amacı ve Literatüre Katkısı")
    bx(s, 0.4, 1.7, 6.2, 0.45, "Araştırma Hedefleri", fs=15, bold=True, color=NAVY)
    bullets(s, 0.45, 2.2, 6.1, 4.6, [
        "Müzik-spesifik, çok aileli 47 boyutlu öznitelik vektörü tasarlamak",
        "Yedi makine öğrenmesi + dört derin öğrenme modelini ortak protokolde karşılaştırmak",
        "5-katlı çapraz doğrulama ile güvenilir, varyansı düşük değerlendirme yapmak",
        "Youden J ile karar eşiğini optimize etmek",
        "TreeSHAP ile kararı açıklanabilir kılmak",
        "GUJSA formatında akademik yayın üretmek",
    ], fs=13.5, color=DGRAY, gap=12)
    bx(s, 6.9, 1.7, 6.0, 0.45, "Literatürdeki Konumu", fs=15, bold=True, color=NAVY)
    callout(s, 6.9, 2.25, 6.0, 1.65, "Özgün değer",
        "AURIS, müzik deepfake tespitinde topluluk öğrenmesi ile SHAP "
        "açıklanabilirliğini birleştiren ilk çalışmalardandır.", fill=MGRAY, bar=TEAL)
    callout(s, 6.9, 4.1, 6.0, 1.4, "Hafiflik avantajı",
        "Derin öğrenme altyapısı gerektirmeden, elle tasarlanmış "
        "özniteliklerle rekabetçi doğruluk hedefleniyor.", fill=MGRAY, bar=GOLD)
    callout(s, 6.9, 5.7, 6.0, 1.05, "Açıklanabilirlik",
        "Her tahmin, hangi akustik özelliğin kararı yönlendirdiğiyle birlikte sunulur.",
        fill=MGRAY, bar=GREEN)
    ft(s)

    # Zaman planı (Gantt benzeri)
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Proje Yönetimi", "Çalışma Planı ve Risk Yönetimi")
    phases = [
        ("Veri toplama ve ön işleme", 0, 2, TEAL),
        ("Öznitelik mühendisliği", 2, 2, TEAL),
        ("Model eğitimi ve çapraz doğrulama", 4, 2, NAVY),
        ("Değerlendirme ve SHAP analizi", 6, 2, NAVY),
        ("Yazım, sunum ve teslim", 8, 2, GOLD),
    ]
    bx(s, 0.4, 1.65, 8.0, 0.4, "10 Haftalık Zaman Planı", fs=14, bold=True, color=NAVY)
    track_l, track_w = 3.6, 8.9
    for i, (name, start, dur, clr) in enumerate(phases):
        top = 2.2 + i*0.62
        bx(s, 0.4, top, 3.1, 0.5, name, fs=11.5, color=DGRAY, anchor=MSO_ANCHOR.MIDDLE)
        bar_l = track_l + (start/10)*track_w
        bar_w = (dur/10)*track_w
        rc(s, bar_l, top+0.06, bar_w, 0.38, clr)
        bx(s, bar_l, top+0.08, bar_w, 0.34, f"H{start+1}-{start+dur}",
           fs=10, bold=True, color=WHITE, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    # Risk tablosu
    bx(s, 0.4, 5.5, 12.5, 0.4, "Risk Analizi ve Önlemler", fs=14, bold=True, color=NAVY)
    risks = [
        ("Sınıf dengesizliği", "class_weight='balanced', is_unbalance=True"),
        ("Aşırı uyum (overfitting)", "5-katlı CV, erken durdurma, düzenlileştirme"),
        ("Veri sızıntısı", "StandardScaler her katta yalnız eğitim verisine fit"),
    ]
    rw = 4.1
    for i, (risk, fix) in enumerate(risks):
        l = 0.4 + i*4.2
        rc(s, l, 5.95, rw, 1.0, WHITE, RED, 1.2)
        bx(s, l+0.12, 6.03, rw-0.24, 0.35, "⚠  "+risk, fs=12, bold=True, color=RED)
        bx(s, l+0.12, 6.42, rw-0.24, 0.5, fix, fs=10.5, color=DGRAY)
    ft(s)
    s = sl(prs); imza(s, "01", "Dönem Başlangıç Sunumu")

# ════════════════════════════════════════════════════════════════════════════
# BÖLÜM 02 — LİTERATÜR TARAMASI
# ════════════════════════════════════════════════════════════════════════════
def make_02(prs):
    s = sl(prs); bg(s, LGRAY)
    rc(s, 0, 0, 13.33, 2.7, NAVY); rc(s, 0, 2.7, 13.33, 0.07, GOLD)
    bx(s, 0.6, 0.45, 12.0, 0.4, "02 — LİTERATÜR TARAMASI", fs=13, bold=True, color=GOLD)
    bx(s, 0.6, 0.95, 12.0, 1.0, "İlgili Çalışmalar", fs=34, bold=True, color=WHITE)
    bx(s, 0.6, 1.85, 12.0, 0.6,
       "39 kaynak · üç araştırma alanı · sistematik boşluk analizi",
       fs=16, color=RGBColor(0xAE,0xC6,0xD6))
    statcard(s, 0.7, 3.25, 3.85, 1.15, "39", "Taranan kaynak", vfs=30)
    statcard(s, 4.75, 3.25, 3.85, 1.15, "%74", "Son 5 yıl (2021+)", vfs=30, vcolor=GREEN)
    statcard(s, 8.8, 3.25, 3.85, 1.15, "3", "Araştırma alanı", vfs=30)
    bullets(s, 0.7, 4.8, 12.0, 2.2, [
        "GUJSA kuralı referansların en az %30'unun güncel olmasını şart koşar — AURIS %74 ile bu eşiği fazlasıyla aşar.",
        "Tarama üç eksende yürütüldü: ses deepfake tespiti, üretken müzik sistemleri ve YZ müzik tespiti.",
        "Temel bulgu: müzik için topluluk öğrenmesi + SHAP açıklanabilirliğini birleştiren çalışma literatürde eksik.",
    ], fs=13, color=DGRAY, gap=9, lead="—  ")
    ft(s)

    # Alan 1
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Alan 1", "Ses Derin Sahte Tespiti (Audio Deepfake Detection)",
         "GenAI müzik tespiti için en olgun komşu alan")
    ch = ["Model / Çalışma","Yazarlar","Yıl","Yaklaşım ve Katkı"]
    cw = [2.5,2.2,0.9,6.9]; cx = [0.4,2.9,5.1,6.0]
    for h,x,w in zip(ch,cx,cw):
        r2=rc(s,x,1.75,w,0.45,NAVY); bx(s,x+0.08,1.79,w-0.12,0.38,h,fs=12,bold=True,color=WHITE)
    rows=[("AASIST [10]","Jung vd.","2022","Bütünleşik spektro-temporal graf dikkat ağı; ASVspoof 2019'da güçlü sonuç"),
          ("RawNet2 [11]","Tak vd.","2021","Ham dalga formundan uçtan uca öğrenme; öznitelik mühendisliği gerektirmez"),
          ("wav2vec 2.0 [13]","Baevski vd.","2020","Öz-denetimli ses temsili; transfer öğrenme için güçlü taban"),
          ("WavLM [15]","Chen vd.","2022","Maskelenmiş öngörü ile büyük ölçekli ön eğitim"),
          ("ADD 2022 [3]","Yi vd.","2022","İlk YZ ses sentezi tespit yarışması; alanı standartlaştırdı"),
          ("ASVspoof 2019 [17]","Wang vd.","2020","64k örnekli kıyaslama veri kümesi; sahte ses araştırmasının omurgası")]
    for ri,row in enumerate(rows):
        top=2.25+ri*0.74; rc2=WHITE if ri%2==0 else MGRAY
        for ci,(cell,x,w) in enumerate(zip(row,cx,cw)):
            rc(s,x,top,w,0.68,rc2,RGBColor(0xD5,0xD9,0xDD))
            al = PP_ALIGN.LEFT if ci==3 else PP_ALIGN.CENTER
            bx(s,x+0.1,top+0.08,w-0.18,0.54,cell,fs=11,color=DGRAY,
               align=al, anchor=MSO_ANCHOR.MIDDLE, bold=(ci==0))
    bx(s, 0.4, 6.95, 12.5, 0.3,
       "Çıkarım: Bu yöntemler konuşma için olgun; ancak müziğin ritmik ve harmonik yapısını hedeflemiyor.",
       fs=11, italic=True, color=TGRAY)
    ft(s)

    # Alan 2 & 3
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Alan 2 & 3", "Üretken Müzik Sistemleri ve YZ Müzik Tespiti")
    bx(s, 0.4, 1.65, 6.1, 0.4, "Üretici Sistemler", fs=14, bold=True, color=NAVY)
    rows2 = [("MusicGen [1]","Copet vd., 2023 — Meta; metne koşullu, tek aşamalı transformer"),
             ("AudioLDM2 [2]","Liu vd., 2023; latent difüzyon tabanlı üretim"),
             ("Suno / Udio","Ticari sistemler, 2024; yüksek kaliteli şarkı üretimi"),
             ("Stable Audio / Riffusion","Difüzyon tabanlı açık sistemler")]
    for i,(t,d) in enumerate(rows2):
        top = 2.15 + i*1.05
        rc(s, 0.4, top, 6.1, 0.95, WHITE, TEAL, 1.0)
        bx(s, 0.55, top+0.1, 5.8, 0.35, t, fs=12.5, bold=True, color=TEAL)
        bx(s, 0.55, top+0.46, 5.8, 0.42, d, fs=11, color=DGRAY)
    bx(s, 6.85, 1.65, 6.0, 0.4, "Doğrudan İlgili Tespit Çalışmaları", fs=14, bold=True, color=NAVY)
    rows3 = [("Afchar vd. [5] (2025)","Oto-kodlayıcı artefaktı; aynı üreticiye %99,8, farklı üreticide ciddi düşüş"),
             ("Cros Vila vd. [33] (2025)","Spektral + ritmik öznitelik + SVM; müzik-spesifik"),
             ("Li vd. [22] (2026)","Açıklanabilir öznitelik tabanlı erken sistematik değerlendirme"),
             ("SONICS [34] (2025)","Transformer DL; 97k şarkılık büyük veri kümesi"),
             ("FakeMusicCaps [35] (2025)","Metin→müzik tespiti ve atıf veri kümesi")]
    for i,(t,d) in enumerate(rows3):
        top = 2.15 + i*0.83
        rc(s, 6.85, top, 6.0, 0.75, WHITE, GOLD, 1.0)
        bx(s, 7.0, top+0.07, 5.7, 0.32, t, fs=11.5, bold=True, color=RGBColor(0x9A,0x73,0x00))
        bx(s, 7.0, top+0.38, 5.7, 0.34, d, fs=10.5, color=DGRAY)
    ft(s)

    # Boşluk analizi
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Sentez", "Literatür Boşluğu ve AURIS'in Konumu")
    bx(s, 0.4, 1.7, 6.2, 0.45, "Tespit Edilen Boşluklar", fs=15, bold=True, color=RED)
    gaps = ["Müzik için topluluk (ensemble) yaklaşımı yetersiz uygulanmış",
            "47 boyutlu, beş aileli heterojen öznitelik vektörü kullanılmamış",
            "Üretici/kaynak bazlı ayrıntılı performans analizi eksik",
            "SHAP/TreeSHAP açıklanabilirliği müzik tespitine taşınmamış",
            "Youden J karar eşiği optimizasyonu uygulanmamış"]
    for i, g in enumerate(gaps):
        top = 2.2 + i*0.88
        rc(s, 0.4, top, 6.2, 0.78, RGBColor(0xFD,0xEC,0xEC), RED, 1.0)
        bx(s, 0.55, top+0.06, 0.5, 0.66, "✗", fs=18, bold=True, color=RED, anchor=MSO_ANCHOR.MIDDLE)
        bx(s, 1.05, top+0.06, 5.4, 0.66, g, fs=11.5, color=DGRAY, anchor=MSO_ANCHOR.MIDDLE)
    bx(s, 6.95, 1.7, 6.0, 0.45, "AURIS'in Çözümü", fs=15, bold=True, color=GREEN)
    sols = ["7 ML + 4 DL = 11 modelli topluluk öğrenmesi",
            "Spektral, zamansal, ritmik, harmonik, vokal — 5 aile / 47 boyut",
            "Sekiz kaynak için ayrı duyarlılık analizi (Suno %93,0, Echoes %88,6)",
            "TreeSHAP ile global ve yerel öznitelik etkisi",
            "θ* = 0,4316 ile dengeli karar eşiği"]
    for i, sol in enumerate(sols):
        top = 2.2 + i*0.88
        rc(s, 6.95, top, 6.0, 0.78, RGBColor(0xE9,0xF6,0xEC), GREEN, 1.0)
        bx(s, 7.1, top+0.06, 0.5, 0.66, "✓", fs=18, bold=True, color=GREEN, anchor=MSO_ANCHOR.MIDDLE)
        bx(s, 7.6, top+0.06, 5.2, 0.66, sol, fs=11, color=DGRAY, anchor=MSO_ANCHOR.MIDDLE)
    ft(s)
    s = sl(prs); imza(s, "02", "Literatür Taraması Sunumu")

# ════════════════════════════════════════════════════════════════════════════
# BÖLÜM 03 — TASARIM VE GELİŞTİRME
# ════════════════════════════════════════════════════════════════════════════
def make_03(prs):
    s = sl(prs); bg(s, LGRAY)
    rc(s, 0, 0, 13.33, 2.7, NAVY); rc(s, 0, 2.7, 13.33, 0.07, GOLD)
    bx(s, 0.6, 0.45, 12.0, 0.4, "03 — TASARIM VE GELİŞTİRME", fs=13, bold=True, color=GOLD)
    bx(s, 0.6, 0.95, 12.0, 1.0, "Sistem Mimarisi ve Yöntem", fs=34, bold=True, color=WHITE)
    bx(s, 0.6, 1.85, 12.0, 0.6,
       "Ham sesten karara: yedi aşamalı uçtan uca işlem zinciri",
       fs=16, color=RGBColor(0xAE,0xC6,0xD6))
    bullets(s, 0.7, 3.25, 12.0, 3.6, [
        "Veri katmanı: 5.195 ses örneği sekiz farklı insan ve YZ kaynağından derlendi.",
        "Öznitelik katmanı: librosa ile 22.050 Hz'de 47 boyutlu vektör çıkarıldı.",
        "Model katmanı: 7 ML + 4 DL modeli 5-katlı çapraz doğrulamada karşılaştırıldı.",
        "Karar katmanı: LightGBM olasılığına Youden-optimal eşik (θ*=0,4316) uygulandı.",
        "Açıklama katmanı: TreeSHAP her kararın akustik gerekçesini üretir.",
    ], fs=14, color=DGRAY, gap=10, lead="●  ")
    ft(s)

    # Pipeline görseli + açıklama
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Mimari", "AURIS Uçtan Uca İşleyiş Şeması")
    img(s, f"{FIGS}/paper_pipeline_diagram.png", 0.4, 1.75, 8.4, 4.7,
        "Şekil 1: Yedi aşamalı işlem zinciri")
    callout(s, 9.0, 1.75, 3.95, 4.7, "Aşamalar",
        "1 · Ham ses (WAV/MP3)\n\n"
        "2 · Ön işleme: 22.050 Hz, mono\n\n"
        "3 · 47 öznitelik çıkarma\n\n"
        "4 · StandardScaler (kat-içi)\n\n"
        "5 · 11 model / 5-katlı CV\n\n"
        "6 · Youden eşik θ*=0,4316\n\n"
        "7 · Karar + SHAP açıklaması",
        fill=NAVY, bar=GOLD, tcolor=GOLD)
    ft(s)

    # Veri kümesi tablosu
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Veri", "Veri Kümesi Kompozisyonu", "5.195 örnek · 8 kaynak · iki sınıf")
    ch=["Kaynak","Tür","Örnek","Etiket"]; cw=[4.3,2.9,2.0,1.6]; cx=[0.4]
    [cx.append(cx[-1]+w) for w in cw[:-1]]
    for h,x,w in zip(ch,cx,cw):
        r=rc(s,x,1.7,w,0.42,NAVY); bx(s,x+0.08,1.73,w-0.12,0.36,h,fs=12,bold=True,color=WHITE,align=PP_ALIGN.CENTER)
    for ri,row in enumerate(DATASET):
        top=2.14+ri*0.43; is_t=(ri==len(DATASET)-1)
        clr = RGBColor(0xE9,0xF6,0xEC) if is_t else (WHITE if ri%2==0 else MGRAY)
        for cell,x,w in zip(row,cx,cw):
            rc(s,x,top,w,0.4,clr,RGBColor(0xD5,0xD9,0xDD))
            bx(s,x+0.05,top+0.04,w-0.1,0.32,cell,fs=11.5,bold=is_t,
               color=GREEN if is_t else DGRAY,align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    # Sağ panel — denge görseli
    callout(s, 9.0, 1.7, 3.95, 2.3, "Sınıf Dengesi",
        "İnsan (sınıf 0):  3.113  ·  %59,9\n"
        "Yapay zekâ (1):  2.082  ·  %40,1\n\n"
        "Dengesizlik şu yöntemlerle giderildi:\n"
        "class_weight='balanced'\nis_unbalance=True", fill=TEALL, bar=TEAL)
    callout(s, 9.0, 4.15, 3.95, 2.3, "İnsan Kaynakları",
        "GTZAN — tür çeşitliliği\nFMA Small — bağımsız sanatçılar\n"
        "SleepyJesse — kapak performansı\n\n"
        "YZ kaynakları sekiz farklı üretici sistemden örneklendi.",
        fill=MGRAY, bar=GOLD)
    ft(s)

    # Öznitelik aileleri detaylı
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Öznitelik Mühendisliği", "47 Boyutlu Heterojen Akustik Vektör",
         "Beş işlevsel aile — tek temsile aşırı uyumu sınırlamak için")
    for i,(nm,dim,desc,role) in enumerate(FAMILIES):
        lft=0.4+(i%3)*4.25; top=1.75+(i//3)*2.5
        rc(s,lft,top,4.0,2.3,WHITE,TEAL,1.1)
        rc(s,lft,top,4.0,0.55,TEAL)
        bx(s,lft+0.12,top+0.06,2.6,0.42,nm,fs=14,bold=True,color=WHITE,anchor=MSO_ANCHOR.MIDDLE)
        chip(s,lft+2.95,top+0.1,0.9,dim+" boyut",fill=GOLD,fc=NAVY,fs=10,h=0.34)
        bx(s,lft+0.12,top+0.65,3.75,1.1,desc,fs=11,color=DGRAY)
        bx(s,lft+0.12,top+1.85,3.75,0.4,"▸ "+role,fs=10.5,italic=True,color=TEAL)
    rc(s,8.65,4.25,4.25,2.3,NAVY)
    bx(s,8.75,4.4,4.05,0.5,"Toplam",fs=14,color=WHITE,align=PP_ALIGN.CENTER)
    bx(s,8.75,4.8,4.05,0.85,"47 boyut",fs=34,bold=True,color=GOLD,align=PP_ALIGN.CENTER)
    bx(s,8.75,5.7,4.05,0.5,"16 + 10 + 9 + 8 + 4",fs=14,color=RGBColor(0xAE,0xC6,0xD6),align=PP_ALIGN.CENTER)
    bx(s,8.75,6.15,4.05,0.35,"librosa ile çıkarıldı",fs=10,italic=True,color=RGBColor(0x88,0xA8,0xC0),align=PP_ALIGN.CENTER)
    ft(s)

    # Öznitelik dağılımı görseli
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Öznitelik Analizi", "YZ ve İnsan Müziğinin Dağılım Farkları")
    img(s, f"{FIGS}/feature_distribution_ai_vs_human.png", 0.4, 1.75, 8.3, 4.85,
        "Şekil 2: İlk sekiz özniteliğin sınıf bazlı dağılımları")
    callout(s, 8.9, 1.75, 4.05, 4.85, "Yorum",
        "YZ üretimi parçalar belirli özniteliklerde insan kayıtlarından "
        "sistematik biçimde ayrışıyor.\n\n"
        "Özellikle spectral_flatness değerleri YZ müziğinde daha düzenli ve "
        "yüksek — bu, üretim sistemlerinin algısal kaliteyi optimize ederken "
        "daha 'düz' bir spektrum bırakmasından kaynaklanıyor.\n\n"
        "Bu görsel ayrım, sonradan SHAP analiziyle de doğrulanan en güçlü "
        "ayırt edici özelliğin temelini oluşturuyor.",
        fill=TEALL, bar=TEAL)
    ft(s)

    # Modeller detaylı + hiperparametreler
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Modelleme", "On Bir Sınıflandırma Modeli", "Ortak 5-katlı çapraz doğrulama protokolü")
    bx(s, 0.4, 1.65, 6.2, 0.42, "Makine Öğrenmesi (7) — scikit-learn", fs=13, bold=True, color=NAVY)
    ml = [("LightGBM","n_estimators=300, num_leaves=31, lr=0,05"),
          ("XGBoost","n_estimators=240, max_depth=5, lr=0,06"),
          ("Gradyan Artırma","n_estimators=180, max_depth=4"),
          ("Rastgele Orman","n_estimators=500, max_features=log2"),
          ("SVM-RBF","C=10, gamma=0,05, balanced"),
          ("ÇKA Sinir Ağı","192-96-32, alpha=0,001"),
          ("Lojistik Regresyon","C=2,0, max_iter=2500")]
    for i,(n,p) in enumerate(ml):
        top=2.15+i*0.64
        rc(s,0.4,top,6.2,0.56,WHITE,TEAL,0.8)
        bx(s,0.5,top+0.04,2.2,0.48,n,fs=11.5,bold=True,color=TEAL,anchor=MSO_ANCHOR.MIDDLE)
        bx(s,2.75,top+0.04,3.75,0.48,p,fs=10,color=DGRAY,anchor=MSO_ANCHOR.MIDDLE)
    bx(s, 6.85, 1.65, 6.0, 0.42, "Derin Öğrenme (4) — PyTorch / Adam", fs=13, bold=True, color=NAVY)
    dl = [("Derin ÇKA","512-256-128-64, BatchNorm, dropout"),
          ("Artık ÇKA","3 artık blok, 256-256 boyut"),
          ("Dikkat ÇKA","Öz-dikkat mekanizması, 4 baş"),
          ("1B-ESA","Conv1D + max-pooling katmanları")]
    for i,(n,p) in enumerate(dl):
        top=2.15+i*0.64
        rc(s,6.85,top,6.0,0.56,WHITE,GOLD,0.8)
        bx(s,6.95,top+0.04,2.2,0.48,n,fs=11.5,bold=True,color=RGBColor(0x9A,0x73,0x00),anchor=MSO_ANCHOR.MIDDLE)
        bx(s,9.2,top+0.04,3.55,0.48,p,fs=10,color=DGRAY,anchor=MSO_ANCHOR.MIDDLE)
    callout(s, 6.85, 4.85, 6.0, 1.75, "Eğitim Protokolü",
        "•  Stratifiye 5-katlı çapraz doğrulama (sınıf oranı korunur)\n"
        "•  StandardScaler her katta yalnız eğitim verisine fit edilir\n"
        "•  Veri sızıntısı önlemi: duration_sec ve sample_rate dışlandı\n"
        "•  Dengesizlik: class_weight + is_unbalance",
        fill=MGRAY, bar=NAVY)
    ft(s)
    s = sl(prs); imza(s, "03", "Tasarım ve Geliştirme Sunumu")

# ════════════════════════════════════════════════════════════════════════════
# BÖLÜM 04 — SONUÇ VE DEMO
# ════════════════════════════════════════════════════════════════════════════
def make_04(prs):
    s = sl(prs); bg(s, LGRAY)
    rc(s, 0, 0, 13.33, 2.7, NAVY); rc(s, 0, 2.7, 13.33, 0.07, GOLD)
    bx(s, 0.6, 0.45, 12.0, 0.4, "04 — SONUÇ VE DEMO", fs=13, bold=True, color=GOLD)
    bx(s, 0.6, 0.95, 12.0, 1.0, "Bulgular ve Çalışan Sistem", fs=34, bold=True, color=WHITE)
    bx(s, 0.6, 1.85, 12.0, 0.6, "LightGBM lider model · gerçek çapraz doğrulama sonuçları",
       fs=16, color=RGBColor(0xAE,0xC6,0xD6))
    statcard(s, 0.7, 3.25, 2.95, 1.5, "0,9548", "ROC-AUC", vfs=28)
    statcard(s, 3.85, 3.25, 2.95, 1.5, "0,8839", "Doğruluk", vfs=28)
    statcard(s, 7.0, 3.25, 2.95, 1.5, "0,8575", "F1-Skoru", vfs=28)
    statcard(s, 10.15, 3.25, 2.65, 1.5, "0,4316", "Youden θ*", vfs=24)
    bullets(s, 0.7, 5.1, 12.1, 1.9, [
        "LightGBM, 11 model içinde en yüksek ROC-AUC ve en düşük varyansı (±0,0023) elde etti.",
        "spectral_flatness_std, YZ-insan ayrımındaki en belirleyici öznitelik olarak öne çıktı.",
        "Youden J eşik optimizasyonu, dengesiz sınıf altında dengeli karar sağladı (θ*=0,4316).",
    ], fs=13, color=DGRAY, gap=9, lead="✓  ")
    ft(s)

    # Model karşılaştırma görseli
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Sonuçlar", "Tüm Modellerin Performans Karşılaştırması")
    img(s, f"{FIGS}/paper_model_comparison.png", 0.4, 1.75, 8.3, 4.85,
        "Şekil 3: Doğruluk, F1 ve ROC-AUC karşılaştırması")
    callout(s, 8.9, 1.75, 4.05, 4.85, "Öne çıkanlar",
        "•  LightGBM (0,9548) ve Derin ÇKA (0,9542) başa baş.\n\n"
        "•  7 ML modeli ort. %92,75 ROC-AUC; 4 DL modeli ort. %92,32.\n\n"
        "•  1B-ESA hariç tutulduğunda DL ort. %94,62'ye yükseliyor.\n\n"
        "•  Sonuç: 47 boyutlu öznitelik vektörü ayırt edici bilginin büyük "
        "bölümünü kodluyor; öznitelik mühendisliği model kapasitesinin önüne "
        "geçiyor.",
        fill=TEALL, bar=TEAL)
    ft(s)

    # Demo akışı + ekran
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Demo", "Sistem Çalışma Akışı")
    steps = [("1","Müzik dosyası yüklenir","WAV / MP3 formatı kabul edilir"),
             ("2","Ön işleme","22.050 Hz'e indirgenir, mono'ya çevrilir"),
             ("3","Öznitelik çıkarma","librosa ile 47 boyutlu vektör hesaplanır"),
             ("4","Model tahmini","LightGBM yapay zekâ olasılığı üretir"),
             ("5","Eşik uygulama","θ*=0,4316 ile sınıf kararı verilir"),
             ("6","Açıklama","SHAP ile kararın gerekçesi gösterilir")]
    for i,(no,t,d) in enumerate(steps):
        top = 1.75 + i*0.82
        rc(s, 0.4, top, 7.4, 0.72, WHITE, TEAL, 1.0)
        rc(s, 0.4, top, 0.62, 0.72, NAVY)
        bx(s, 0.4, top+0.04, 0.62, 0.64, no, fs=20, bold=True, color=GOLD,
           align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        bx(s, 1.2, top+0.08, 6.5, 0.32, t, fs=12.5, bold=True, color=NAVY)
        bx(s, 1.2, top+0.4, 6.5, 0.3, d, fs=10.5, color=DGRAY)
    img(s, f"{FIGS}/paper_score_distribution.png", 8.1, 1.95, 4.8, 3.9,
        "Şekil 9: P(YZ) olasılık dağılımı")
    callout(s, 8.1, 6.0, 4.8, 0.95, "Çıktı",
        "Sınıf etiketi (YZ / İnsan) + güven skoru + SHAP gerekçesi. "
        "Demo videosu teslim paketinde (Uygulama/).", fill=MGRAY, bar=GOLD)
    ft(s)

    # Akademik katkı
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Değerlendirme", "Akademik Katkı ve Özgün Değer")
    cards = [("47 boyutlu heterojen öznitelik","Beş akustik aileyi tek vektörde birleştiren, müzik-spesifik kapsamlı temsil."),
             ("11 modelli topluluk öğrenmesi","ML ve DL ailelerinin ortak protokolde sistematik karşılaştırması."),
             ("TreeSHAP açıklanabilirlik","Müzik deepfake tespitinde global + yerel öznitelik etkisinin yorumlanması."),
             ("Youden J eşik optimizasyonu","Dengesiz sınıf için θ*=0,4316; varsayılan 0,5 eşiğinden üstün denge."),
             ("Hafif ve rekabetçi","Derin öğrenme altyapısı olmadan SONICS'e yakın ROC-AUC (0,9548)."),
             ("GUJSA akademik yayını","39 güncel referansla ulusal hakemli dergi formatında hazırlandı.")]
    for i,(t,d) in enumerate(cards):
        lft = 0.4 + (i%2)*6.35; top = 1.75 + (i//2)*1.72
        rc(s, lft, top, 6.1, 1.55, WHITE, TEAL, 1.0)
        bx(s, lft+0.15, top+0.12, 0.6, 0.6, f"{i+1}", fs=22, bold=True, color=TEAL)
        bx(s, lft+0.85, top+0.15, 5.1, 0.45, t, fs=13, bold=True, color=NAVY)
        bx(s, lft+0.85, top+0.62, 5.1, 0.85, d, fs=11, color=DGRAY)
    ft(s)
    s = sl(prs); imza(s, "04", "Sonuç ve Demo Sunumu")

# ════════════════════════════════════════════════════════════════════════════
# BÖLÜM 05 — FİNAL SAVUNMA (en kapsamlı)
# ════════════════════════════════════════════════════════════════════════════
def make_05(prs):
    # Kapak
    s = sl(prs); bg(s, NAVY)
    rc(s, 0, 0, 13.33, 7.5, NAVY)
    rc(s, 0, 4.95, 13.33, 0.06, GOLD)
    bx(s, 0.5, 1.0, 12.3, 1.3, "AURIS", fs=76, bold=True, color=GOLD, align=PP_ALIGN.CENTER)
    bx(s, 0.5, 2.35, 12.3, 0.7, "Yapay Zekâ Üretimli Müzik Tespitinde Topluluk Öğrenmesi",
       fs=22, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    bx(s, 0.5, 3.05, 12.3, 0.5, "Heterojen Akustik Öznitelikler ve LightGBM Tabanlı Bir Yaklaşım",
       fs=15, color=RGBColor(0xAE,0xC6,0xD6), align=PP_ALIGN.CENTER)
    bx(s, 0.5, 3.7, 12.3, 0.45, "BM498 Mezuniyet Tezi · Final Savunma Sunumu",
       fs=14, italic=True, color=RGBColor(0x88,0xA8,0xC0), align=PP_ALIGN.CENTER)
    bx(s, 0.5, 5.25, 12.3, 0.45, "Hasan Arthur Altuntaş", fs=18, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    bx(s, 0.5, 5.75, 12.3, 0.4, "Danışman: ___________________________",
       fs=14, color=RGBColor(0xAE,0xC6,0xD6), align=PP_ALIGN.CENTER)
    bx(s, 0.5, 6.4, 12.3, 0.4, "Düzce Üniversitesi · Mühendislik Fakültesi · Bilgisayar Mühendisliği · 2025-2026",
       fs=12, color=RGBColor(0x66,0x82,0x9A), align=PP_ALIGN.CENTER)

    # İçindekiler
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Genel Bakış", "Sunum Planı")
    left_items = ["Motivasyon ve Problem Tanımı","Literatür Özeti ve Boşluk Analizi",
                  "Sistem Mimarisi (Pipeline)","Veri Kümesi","Öznitelik Çıkarma (47 boyut)",
                  "Sınıflandırma Modelleri"]
    right_items = ["Eğitim Protokolü ve Eşik Optimizasyonu","Sonuçlar — Model Karşılaştırması",
                   "Açıklanabilirlik (SHAP)","Tanılayıcı Analizler","Literatür Karşılaştırması",
                   "Kısıtlamalar, Sonuç ve Gelecek"]
    for col, items, off in [(0, left_items, 0.4), (1, right_items, 6.85)]:
        for i, it in enumerate(items):
            top = 1.85 + i*0.82
            num = i+1 + col*6
            rc(s, off, top, 6.05, 0.7, WHITE, TEAL, 1.0)
            rc(s, off, top, 0.7, 0.7, NAVY)
            bx(s, off, top+0.04, 0.7, 0.62, str(num), fs=18, bold=True, color=GOLD,
               align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
            bx(s, off+0.85, top+0.04, 5.1, 0.62, it, fs=12.5, color=DGRAY, anchor=MSO_ANCHOR.MIDDLE)
    ft(s)

    # Motivasyon
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Bölüm 1", "Motivasyon ve Problem Tanımı")
    callout(s, 0.4, 1.7, 7.3, 2.4, "Üretken müzik patlaması",
        "Suno, Udio ve MusicGen gibi sistemler, tek bir metin istemiyle dakikalar "
        "içinde deneyimsiz dinleyicilerin insan bestesinden ayırt edemeyeceği "
        "tam uzunlukta parçalar üretiyor. Üretim erişilebilirliği telif, "
        "özgünlük ve içerik bütünlüğü açısından somut bir tespit problemi "
        "doğurdu.", fill=RGBColor(0xFF,0xF3,0xE0), bar=GOLD)
    bx(s, 0.4, 4.3, 7.3, 0.4, "Tespit ihtiyacının kaynakları", fs=13, bold=True, color=NAVY)
    bullets(s, 0.45, 4.78, 7.3, 2.1, [
        "Telif hakkı ve içerik sahipliği belirsizliği",
        "Akış platformlarında sahte dinlenme ve gelir manipülasyonu",
        "Dezenformasyon ile kimlik ve üslup taklidi",
        "Mevcut konuşma-odaklı dedektörlerin müziğe genelleyememesi",
    ], fs=12.5, color=DGRAY, gap=9, lead="•  ")
    statcard(s, 8.0, 1.7, 4.9, 1.5, "0,9548", "AURIS ROC-AUC", vfs=30)
    statcard(s, 8.0, 3.35, 2.35, 1.45, "5.195", "Örnek", vfs=24)
    statcard(s, 10.55, 3.35, 2.35, 1.45, "8", "Kaynak", vfs=24)
    statcard(s, 8.0, 4.95, 2.35, 1.45, "47", "Öznitelik", vfs=24)
    statcard(s, 10.55, 4.95, 2.35, 1.45, "11", "Model", vfs=24)
    ft(s)

    # Literatür özeti
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Bölüm 2", "Literatür Özeti ve Boşluk Analizi")
    bx(s, 0.4, 1.7, 6.2, 0.4, "Üç araştırma alanı taranmıştır", fs=13, bold=True, color=NAVY)
    areas = [("Ses Deepfake Tespiti","AASIST, RawNet2, wav2vec 2.0, WavLM — konuşma için olgun"),
             ("Üretken Müzik Sistemleri","MusicGen, AudioLDM2, Suno, Udio — tespit hedefini şekillendirir"),
             ("YZ Müzik Tespiti","Afchar, Cros Vila, Li, SONICS, FakeMusicCaps — yeni ve dağınık")]
    for i,(t,d) in enumerate(areas):
        top = 2.2 + i*1.05
        rc(s, 0.4, top, 6.2, 0.92, WHITE, TEAL, 1.0)
        bx(s, 0.55, top+0.1, 5.9, 0.35, t, fs=12.5, bold=True, color=TEAL)
        bx(s, 0.55, top+0.46, 5.9, 0.42, d, fs=11, color=DGRAY)
    callout(s, 6.95, 1.7, 5.95, 5.0, "Tespit edilen boşluk",
        "Literatürde müzik tespiti için:\n\n"
        "✗  Topluluk öğrenmesi yetersiz uygulanmış\n\n"
        "✗  Çok aileli (47 boyut) öznitelik seti yok\n\n"
        "✗  Kaynak bazlı performans analizi eksik\n\n"
        "✗  SHAP açıklanabilirliği taşınmamış\n\n"
        "✗  Youden J eşik optimizasyonu yok\n\n"
        "AURIS bu beş boşluğu birlikte ele alarak hafif, açıklanabilir ve "
        "rekabetçi bir sistem sunar.", fill=TEALL, bar=TEAL)
    ft(s)

    # Pipeline
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Bölüm 3", "Sistem Mimarisi — Uçtan Uca Pipeline")
    img(s, f"{FIGS}/paper_pipeline_diagram.png", 0.4, 1.75, 8.4, 4.7,
        "Şekil 1: AURIS uçtan uca işleyiş şeması")
    callout(s, 9.0, 1.75, 3.95, 4.7, "Yedi Aşama",
        "1 · Ham ses girişi\n\n2 · Ön işleme (22.050 Hz, mono)\n\n"
        "3 · 47 öznitelik çıkarma\n\n4 · Kat-içi StandardScaler\n\n"
        "5 · 11 model / 5-katlı CV\n\n6 · Youden eşik (θ*=0,4316)\n\n"
        "7 · Karar + SHAP açıklaması", fill=NAVY, bar=GOLD, tcolor=GOLD)
    ft(s)

    # Veri kümesi
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Bölüm 4", "Veri Kümesi", "5.195 örnek · sekiz kaynak · iki sınıf")
    ch=["Kaynak","Tür","Örnek","Etiket"]; cw=[4.3,2.9,2.0,1.6]; cx=[0.4]
    [cx.append(cx[-1]+w) for w in cw[:-1]]
    for h,x,w in zip(ch,cx,cw):
        r=rc(s,x,1.7,w,0.42,NAVY); bx(s,x+0.08,1.73,w-0.12,0.36,h,fs=12,bold=True,color=WHITE,align=PP_ALIGN.CENTER)
    for ri,row in enumerate(DATASET):
        top=2.14+ri*0.43; is_t=(ri==len(DATASET)-1)
        clr = RGBColor(0xE9,0xF6,0xEC) if is_t else (WHITE if ri%2==0 else MGRAY)
        for cell,x,w in zip(row,cx,cw):
            rc(s,x,top,w,0.4,clr,RGBColor(0xD5,0xD9,0xDD))
            bx(s,x+0.05,top+0.04,w-0.1,0.32,cell,fs=11.5,bold=is_t,
               color=GREEN if is_t else DGRAY,align=PP_ALIGN.CENTER,anchor=MSO_ANCHOR.MIDDLE)
    callout(s, 9.0, 1.7, 3.95, 2.55, "Sınıf Dengesi",
        "İnsan (0):  3.113 · %59,9\nYapay zekâ (1):  2.082 · %40,1\n\n"
        "Dengesizlik giderildi:\nclass_weight='balanced'\nis_unbalance=True\n"
        "Stratifiye örnekleme", fill=TEALL, bar=TEAL)
    callout(s, 9.0, 4.4, 3.95, 2.05, "Veri Sızıntısı Önlemi",
        "duration_sec ve sample_rate öznitelik kümesinden çıkarıldı.\n\n"
        "StandardScaler her katta yalnız eğitim verisine fit edildi.",
        fill=RGBColor(0xFD,0xEC,0xEC), bar=RED)
    ft(s)

    # 47 öznitelik
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Bölüm 5", "Öznitelik Çıkarma — 47 Boyutlu Vektör",
         "Beş işlevsel aile · tek temsile aşırı uyumu sınırlamak için")
    for i,(nm,dim,desc,role) in enumerate(FAMILIES):
        lft=0.4+(i%3)*4.25; top=1.75+(i//3)*2.5
        rc(s,lft,top,4.0,2.3,WHITE,TEAL,1.1); rc(s,lft,top,4.0,0.55,TEAL)
        bx(s,lft+0.12,top+0.06,2.6,0.42,nm,fs=14,bold=True,color=WHITE,anchor=MSO_ANCHOR.MIDDLE)
        chip(s,lft+2.95,top+0.1,0.9,dim+" boyut",fill=GOLD,fc=NAVY,fs=10,h=0.34)
        bx(s,lft+0.12,top+0.65,3.75,1.1,desc,fs=11,color=DGRAY)
        bx(s,lft+0.12,top+1.85,3.75,0.4,"▸ "+role,fs=10.5,italic=True,color=TEAL)
    rc(s,8.65,4.25,4.25,2.3,NAVY)
    bx(s,8.75,4.4,4.05,0.5,"Toplam",fs=14,color=WHITE,align=PP_ALIGN.CENTER)
    bx(s,8.75,4.8,4.05,0.85,"47 boyut",fs=34,bold=True,color=GOLD,align=PP_ALIGN.CENTER)
    bx(s,8.75,5.7,4.05,0.5,"16 + 10 + 9 + 8 + 4",fs=14,color=RGBColor(0xAE,0xC6,0xD6),align=PP_ALIGN.CENTER)
    ft(s)

    # Modeller + eğitim protokolü
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Bölüm 6-7", "Modeller ve Eğitim Protokolü")
    bx(s, 0.4, 1.62, 4.0, 0.38, "Makine Öğrenmesi (7)", fs=12.5, bold=True, color=TEAL)
    for i,n in enumerate(["LightGBM","XGBoost","Gradyan Artırma","Rastgele Orman","SVM-RBF","ÇKA Sinir Ağı","Lojistik Reg."]):
        top=2.05+i*0.6; rc(s,0.4,top,4.0,0.52,WHITE,TEAL,0.8)
        bx(s,0.52,top+0.04,3.8,0.44,n,fs=11.5,color=DGRAY,anchor=MSO_ANCHOR.MIDDLE)
    bx(s, 4.6, 1.62, 4.0, 0.38, "Derin Öğrenme (4)", fs=12.5, bold=True, color=RGBColor(0x9A,0x73,0x00))
    for i,n in enumerate(["Derin ÇKA (512-256-128-64)","Artık ÇKA (3 blok)","Dikkat ÇKA (4 baş)","1B-ESA (Conv1D)"]):
        top=2.05+i*0.6; rc(s,4.6,top,4.0,0.52,WHITE,GOLD,0.8)
        bx(s,4.72,top+0.04,3.8,0.44,n,fs=11,color=DGRAY,anchor=MSO_ANCHOR.MIDDLE)
    callout(s, 8.8, 1.62, 4.1, 2.55, "Eğitim Protokolü",
        "•  Stratifiye 5-katlı CV\n•  Kat-içi StandardScaler\n"
        "•  Adam optimize edici (DL)\n•  class_weight + is_unbalance\n"
        "•  TreeSHAP açıklanabilirlik", fill=MGRAY, bar=NAVY)
    callout(s, 8.8, 4.35, 4.1, 2.25, "Eşik Optimizasyonu",
        "J(θ) = TPR(θ) − FPR(θ)\n\nθ* = 0,4316\n\n"
        "Brier skoru = 0,083\n(iyi kalibre olasılık çıktısı)", fill=TEALL, bar=TEAL)
    # alt: kalibrasyon küçük not
    bx(s, 0.4, 5.5, 8.0, 1.1,
       "Kalibrasyon kalitesi Brier skoru ile ölçülmüş; 0,083 değeri modelin "
       "güven düzeylerinin gerçek doğruluğu iyi yansıttığını gösterir. Karar "
       "eşiği Youden J kriteriyle 0,5 yerine 0,4316'ya optimize edilmiştir.",
       fs=11.5, color=DGRAY)
    ft(s)

    # Model karşılaştırma TABLOSU (tam 11 model, varyans dahil)
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Bölüm 8", "Sonuçlar — Model Karşılaştırması",
         "5-katlı çapraz doğrulama · ROC-AUC sırasına göre")
    ch2=["#","Model","Tip","Doğruluk","F1","ROC-AUC","Std"]
    cw2=[0.6,3.0,1.1,1.9,1.7,1.9,1.7]; cx2=[0.4]
    [cx2.append(cx2[-1]+w) for w in cw2[:-1]]
    for h,x,w in zip(ch2,cx2,cw2):
        r=rc(s,x,1.7,w,0.4,NAVY); bx(s,x+0.03,1.72,w-0.06,0.36,h,fs=11.5,bold=True,color=WHITE,align=PP_ALIGN.CENTER)
    for ri,row in enumerate(MODEL_TABLE):
        top=2.12+ri*0.44
        clr = RGBColor(0xFF,0xF3,0xCC) if ri==0 else (WHITE if ri%2==0 else MGRAY)
        full = (str(ri+1),)+row
        for ci,(cell,x,w) in enumerate(zip(full,cx2,cw2)):
            rc(s,x,top,w,0.4,clr,RGBColor(0xD5,0xD9,0xDD))
            col = GREEN if ri==0 else DGRAY
            bx(s,x+0.03,top+0.03,w-0.06,0.34,cell,fs=11,bold=(ri==0),
               color=col,align=PP_ALIGN.CENTER,anchor=MSO_ANCHOR.MIDDLE)
    bx(s, 0.4, 7.0, 12.5, 0.34,
       "LightGBM en yüksek ROC-AUC (0,9548) ve en düşük varyans (±0,0023) — "
       "yüksek performans istikrarsız optimumlardan değil, sağlam öznitelik temsilinden geliyor.",
       fs=10.5, italic=True, color=TGRAY)
    ft(s)

    # ROC + confusion (görsel ağırlıklı)
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Bölüm 8", "ROC Eğrileri ve Karmaşıklık Matrisi")
    img(s, f"{FIGS}/paper_roc_curves.png", 0.4, 1.75, 5.85, 4.5,
        "Şekil 4: Makine öğrenmesi ROC eğrileri")
    img(s, f"{FIGS}/paper_confusion_matrix_lightgbm.png", 6.5, 1.75, 5.0, 4.5,
        "Şekil 8: LightGBM karmaşıklık matrisi (θ*=0,4316)")
    bx(s, 11.6, 1.85, 1.5, 4.4, "", fs=10)
    callout(s, 6.5, 6.35, 6.4, 0.85, "Karmaşıklık matrisi",
        "2.721 DN (%87,4) · 1.862 DP (%89,4) · 392 YP (%12,6) · 220 YN (%10,6)",
        fill=MGRAY, bar=NAVY)
    ft(s)

    # SHAP + öznitelik önemi tablosu
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Bölüm 9", "Açıklanabilirlik — SHAP / TreeSHAP",
         "En belirleyici öznitelik: spectral_flatness_std")
    img(s, f"{FIGS}/shap_summary.png", 0.4, 1.75, 6.0, 4.85,
        "Şekil 7: TreeSHAP global etki diyagramı")
    bx(s, 6.65, 1.7, 6.3, 0.4, "İlk 10 Öznitelik (Tablo 6)", fs=13, bold=True, color=NAVY)
    cw3=[0.55,3.3,1.3,1.15]; cx3=[6.65]; [cx3.append(cx3[-1]+w) for w in cw3[:-1]]
    for h,x,w in zip(["#","Öznitelik","Önem","Aile"],cx3,cw3):
        r=rc(s,x,2.15,w,0.36,NAVY); bx(s,x+0.04,2.17,w-0.08,0.32,h,fs=10.5,bold=True,color=WHITE,align=PP_ALIGN.CENTER)
    fam_of = ["Spektral","Spektral","Zamansal","Ritmik","Spektral","Zamansal","Ritmik","Zamansal","Ritmik","Spektral"]
    for ri,(no,name,imp,desc) in enumerate(FEAT_IMP):
        top=2.51+ri*0.4
        clr = RGBColor(0xFF,0xF3,0xCC) if ri==0 else (WHITE if ri%2==0 else MGRAY)
        for ci,(cell,x,w) in enumerate(zip([no,name,imp,fam_of[ri]],cx3,cw3)):
            rc(s,x,top,w,0.37,clr,RGBColor(0xD5,0xD9,0xDD))
            al = PP_ALIGN.LEFT if ci==1 else PP_ALIGN.CENTER
            bx(s,x+0.06,top+0.02,w-0.1,0.32,cell,fs=10,bold=(ri==0 and ci<2),
               color=GREEN if ri==0 else DGRAY,align=al,anchor=MSO_ANCHOR.MIDDLE)
    bx(s, 6.65, 6.65, 6.3, 0.55,
       "Yüksek spectral_flatness_std değerleri modeli YZ sınıfına yönlendiriyor — "
       "bağımsız ses deepfake literatürüyle [16] örtüşüyor.",
       fs=10.5, italic=True, color=TGRAY)
    ft(s)

    # Tanılayıcı analizler (kaynak bazlı + overfit)
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Bölüm 10", "Tanılayıcı Analizler")
    callout(s, 0.4, 1.7, 6.15, 2.35, "Kaynak Bazlı Performans (Şekil 13)",
        "•  Suno parçaları:  %93,0 duyarlılık\n"
        "•  Echoes alt kümesi:  %88,6 duyarlılık\n"
        "•  Deepfake alt kümesi:  %50,0 duyarlılık\n\n"
        "Deepfake setindeki düşüş genel bir başarısızlık değil; bu küme konuşma "
        "deepfake'inden türetilmiş olup müzik üretim imzalarını taşımıyor "
        "(dağılım kayması).", fill=RGBColor(0xFF,0xF3,0xE0), bar=GOLD)
    callout(s, 0.4, 4.2, 6.15, 2.5, "Aşırı Uyum Tanısı (Şekil 14)",
        "Ağaç tabanlı modellerde eğitim ile çapraz doğrulama doğruluğu arasında "
        "8–14 puanlık tutarlı açık var.\n\n"
        "Rastgele Orman uç örnek: eğitim %100 → CV %86,1.\n"
        "Lojistik Regresyon en dengeli (0,6 puan) ama düşük kapasiteli.",
        fill=RGBColor(0xFD,0xEC,0xEC), bar=RED)
    img(s, f"{FIGS}/threshold_sweep.png", 6.75, 1.75, 6.15, 3.05,
        "Şekil 12: Karar eşiği taraması (0,40–0,50 platosu)")
    callout(s, 6.75, 5.15, 6.15, 1.55, "Öznitelik Sayısı Analizi (Şekil 16)",
        "Doğruluk N=30'da platoya ulaşıyor; son 17 özniteliğin ölçülebilir "
        "katkısı yok. Gelecek yinelemede ~30 öznitelikle benzer doğruluk "
        "elde edilebilir.", fill=MGRAY, bar=TEAL)
    ft(s)

    # Literatür karşılaştırma TABLOSU
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Bölüm 11", "İlgili Çalışmalarla Karşılaştırma (Tablo 7)")
    ch4=["Çalışma","Yaklaşım","Veri Kümesi","ROC-AUC","F1"]
    cw4=[2.9,3.6,2.0,1.85,1.85]; cx4=[0.4]; [cx4.append(cx4[-1]+w) for w in cw4[:-1]]
    for h,x,w in zip(ch4,cx4,cw4):
        r=rc(s,x,1.75,w,0.42,NAVY); bx(s,x+0.06,1.78,w-0.1,0.38,h,fs=11.5,bold=True,color=WHITE,align=PP_ALIGN.CENTER)
    for ri,row in enumerate(LIT):
        top=2.22+ri*0.72; is_a=(ri==5)
        clr = RGBColor(0xFF,0xF3,0xCC) if is_a else (WHITE if ri%2==0 else MGRAY)
        for ci,(cell,x,w) in enumerate(zip(row,cx4,cw4)):
            rc(s,x,top,w,0.66,clr,RGBColor(0xD5,0xD9,0xDD))
            al = PP_ALIGN.LEFT if ci<=1 else PP_ALIGN.CENTER
            bx(s,x+0.08,top+0.04,w-0.14,0.58,cell,fs=10.5,bold=is_a,
               color=GREEN if is_a else DGRAY,align=al,anchor=MSO_ANCHOR.MIDDLE)
    callout(s, 0.4, 6.2, 12.5, 0.95, "Konumlandırma",
        "AURIS (0,9548), Transformer tabanlı SONICS (0,960) ile Li vd. (0,931) arasında yer alıyor — "
        "üstelik derin öğrenme altyapısı gerektirmeden ve katlar arası en düşük varyansla (±0,0023). "
        "Hafif bir sistemin ne ölçüde rekabetçi kalabileceğini gösteriyor.", fill=TEALL, bar=TEAL)
    ft(s)

    # Kısıtlamalar + güçlü yönler
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Bölüm 11", "Kısıtlamalar ve Güçlü Yönler")
    bx(s, 0.4, 1.7, 6.2, 0.4, "Kısıtlamalar", fs=14, bold=True, color=RED)
    lim = [("Dağılım kayması","Eğitim dışı YZ sistemlerine ve deepfake setine (%50 duyarlılık) sınırlı genelleme."),
           ("Aşırı uyum eğilimi","Ağaç modellerinde 8–14 puanlık eğitim-CV açığı."),
           ("Öznitelik fazlalığı","Son 17 özniteliğin doğruluğa ölçülebilir katkısı yok."),
           ("Gerçek zamanlı kullanım","Düşük gecikmeli çıkarım henüz test edilmedi.")]
    for i,(t,d) in enumerate(lim):
        top=2.18+i*1.18
        rc(s,0.4,top,6.2,1.05,RGBColor(0xFD,0xEC,0xEC),RED,1.0)
        bx(s,0.55,top+0.1,5.9,0.35,"⚠  "+t,fs=12,bold=True,color=RED)
        bx(s,0.55,top+0.47,5.9,0.5,d,fs=10.5,color=DGRAY)
    bx(s, 6.95, 1.7, 6.0, 0.4, "Güçlü Yönler", fs=14, bold=True, color=GREEN)
    strg = [("Heterojen öznitelik","5 aile / 47 boyut — tek temsile aşırı uyumu sınırlar."),
            ("Açıklanabilirlik","TreeSHAP ile global ve yerel karar gerekçesi."),
            ("Eşik optimizasyonu","Youden J ile dengeli karar (θ*=0,4316)."),
            ("Düşük varyans","±0,0023 katlar arası std — en kararlı model.")]
    for i,(t,d) in enumerate(strg):
        top=2.18+i*1.18
        rc(s,6.95,top,6.0,1.05,RGBColor(0xE9,0xF6,0xEC),GREEN,1.0)
        bx(s,7.1,top+0.1,5.7,0.35,"✓  "+t,fs=12,bold=True,color=GREEN)
        bx(s,7.1,top+0.47,5.7,0.5,d,fs=10.5,color=DGRAY)
    ft(s)

    # Sonuçlar
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Bölüm 11", "Sonuçlar")
    res = [("Uçtan uca tespit sistemi","47 boyutlu vektör + 11 modelli topluluk, 5.195 örnekte eğitildi."),
           ("LightGBM lider","ROC-AUC 0,9548 ve en düşük varyans (±0,0023); Derin ÇKA 0,9542 ile ikinci."),
           ("spectral_flatness_std belirleyici","YZ-insan ayrımındaki en güçlü öznitelik; literatürle [16] tutarlı."),
           ("Hafif ama rekabetçi","Derin öğrenme altyapısı olmadan SONICS'e yakın AUC."),
           ("Tanılanan sınırlar","Aşırı uyum açığı, öznitelik fazlalığı ve deepfake setinde dağılım kayması.")]
    for i,(t,d) in enumerate(res):
        top=1.75+i*1.05
        rc(s,0.4,top,12.5,0.92,WHITE if i%2==0 else MGRAY,TEAL,1.0)
        rc(s,0.4,top,0.7,0.92,NAVY)
        bx(s,0.4,top+0.05,0.7,0.82,str(i+1),fs=22,bold=True,color=GOLD,align=PP_ALIGN.CENTER,anchor=MSO_ANCHOR.MIDDLE)
        bx(s,1.3,top+0.1,4.6,0.72,t,fs=13,bold=True,color=NAVY,anchor=MSO_ANCHOR.MIDDLE)
        bx(s,6.0,top+0.1,6.7,0.72,d,fs=11.5,color=DGRAY,anchor=MSO_ANCHOR.MIDDLE)
    ft(s)

    # Gelecek çalışmalar
    s = sl(prs); bg(s, LGRAY)
    hbar(s, "Bölüm 11", "Gelecek Çalışmalar")
    fut = [("Kısa Vade",RGBColor(0xE9,0xF6,0xEC),GREEN,
            ["SONICS / FakeMusicCaps üzerinde üretici-bağımsız değerlendirme",
             "wav2vec2 ince ayarı ile doğrudan karşılaştırma",
             "MP3 sıkıştırma, perde kaydırma, zaman gerdirme sağlamlık testleri"]),
           ("Orta Vade",RGBColor(0xE8,0xF0,0xFF),NAVY,
            ["Alan uyarlama (domain adaptation) ile genelleme",
             "Gerçek zamanlı düşük gecikmeli çıkarım",
             "Veri kümesini 10.000 örneğe genişletme"]),
           ("Uzun Vade",RGBColor(0xFF,0xF3,0xCC),RGBColor(0x9A,0x73,0x00),
            ["Yeni nesil üretici sistemlerin kapsanması",
             "Watermarking ve ses parmak izi entegrasyonu",
             "Sosyal medya ve canlı akış entegrasyonu"])]
    for ci,(title,clr,bar,items) in enumerate(fut):
        lft=0.4+ci*4.25
        rc(s,lft,1.75,4.0,5.0,clr,bar,1.2)
        rc(s,lft,1.75,4.0,0.6,bar)
        bx(s,lft+0.15,1.82,3.7,0.46,title,fs=15,bold=True,color=WHITE,anchor=MSO_ANCHOR.MIDDLE)
        bullets(s,lft+0.18,2.55,3.65,4.0,items,fs=12,color=DGRAY,gap=14,lead="•  ")
    ft(s)

    # Teşekkür
    s = sl(prs); bg(s, NAVY); rc(s, 0, 0, 13.33, 7.5, NAVY)
    rc(s, 0, 2.95, 13.33, 0.06, GOLD)
    bx(s, 0.5, 1.15, 12.3, 1.1, "Dinlediğiniz için teşekkürler.", fs=36, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    bx(s, 0.5, 2.3, 12.3, 0.6, "Sorularınızı bekliyorum.", fs=22, color=GOLD, align=PP_ALIGN.CENTER)
    for i,(v,l) in enumerate([("0,9548","ROC-AUC"),("47","Öznitelik"),("11","Model"),("5.195","Örnek")]):
        lft=1.15+i*2.78
        rc(s,lft,3.45,2.45,1.4,NAVY2,TEAL,1.0)
        bx(s,lft+0.05,3.52,2.35,0.7,v,fs=26,bold=True,color=GOLD,align=PP_ALIGN.CENTER)
        bx(s,lft+0.05,4.2,2.35,0.5,l,fs=12,color=WHITE,align=PP_ALIGN.CENTER)
    bx(s, 0.5, 5.25, 12.3, 0.42, "Hasan Arthur Altuntaş  ·  hasannarthurrr@gmail.com",
       fs=14, color=RGBColor(0xAE,0xC6,0xD6), align=PP_ALIGN.CENTER)
    bx(s, 0.5, 5.7, 12.3, 0.38, "Düzce Üniversitesi · Bilgisayar Mühendisliği · BM498 · 2025-2026",
       fs=12, color=RGBColor(0x66,0x82,0x9A), align=PP_ALIGN.CENTER)
    s = sl(prs); imza(s, "05", "Final Savunma Sunumu")

# ════════════════ ÜRET ════════════════
out_dir='docs/academic/TeslimEdilecekler/Sunumlar'
os.makedirs(out_dir,exist_ok=True)
funcs=[("01_Donem_Baslangic_Sunumu",make_01),("02_Literatur_Taramasi_Sunumu",make_02),
       ("03_Tasarim_ve_Gelistirme_Sunumu",make_03),("04_Sonuc_ve_Demo_Sunumu",make_04),
       ("05_Final_Savunma_Sunumu",make_05)]
for fname, fn in funcs:
    p=new_prs(); fn(p); p.save(f"{out_dir}/{fname}.pptx")
    print(f"[OK]  {fname}.pptx  ({len(p.slides)} slayt)")

pAll=new_prs()
divider_sl(pAll,"01","Dönem Başlangıç Sunumu",""); make_01(pAll)
divider_sl(pAll,"02","Literatür Taraması Sunumu",""); make_02(pAll)
divider_sl(pAll,"03","Tasarım ve Geliştirme Sunumu",""); make_03(pAll)
divider_sl(pAll,"04","Sonuç ve Demo Sunumu",""); make_04(pAll)
divider_sl(pAll,"05","Final Savunma Sunumu",""); make_05(pAll)
pAll.save(f"{out_dir}/AURIS_Tum_Sunumlar_Birlesik.pptx")
print(f"[OK]  AURIS_Tum_Sunumlar_Birlesik.pptx  ({len(pAll.slides)} slayt)")
