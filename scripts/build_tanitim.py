# -*- coding: utf-8 -*-
"""
AURIS — Genel Tanıtım Sunumu (15-20 dk)
Hocanın 'kim ne yapmış' tartışması için EKSTRA sunum.
Resmi 5 sunumdan bağımsız. Tüm proje hikâyesi:
çok platformlu sistem (web+mobil+backend) + akademik model çalışması.
Gerçek arayüz ekran görüntüleri + ML görselleri + karşılaştırma tabloları.
"""
import sys
import os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pptx import Presentation
from pptx.util import Inches
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from sunum_lib import (
    slide, bg, rect, text, paras, header, footer, stat, chip, panel,
    table, image,
    NAVY, NAVY2, STEEL, TEAL, TEALL, WHITE, PAPER, MGRAY, LINE, DGRAY,
    TGRAY, GOLD, GOLDD, GREEN, GREENL, RED, REDL, AMBER, SW, SH,
)

FIG = 'docs/academic/figures'
SS = 'docs/academic/figures/screenshots'


def newp():
    p = Presentation()
    p.slide_width = Inches(13.33)
    p.slide_height = Inches(7.5)
    return p


def cover_band(s, no, kicker, title, sub):
    rect(s, 0, 0, SW, 2.75, NAVY)
    rect(s, 0, 2.75, SW, 0.06, GOLD)
    rect(s, 0, 0, 0.2, 2.75, GOLD)
    text(s, 0.6, 0.5, 12, 0.4, kicker, fs=13, bold=True, color=GOLD)
    text(s, 0.6, 1.0, 12, 0.95, title, fs=33, bold=True, color=WHITE)
    text(s, 0.6, 1.95, 12, 0.55, sub, fs=16, color=RGBColor(0xAD, 0xC4, 0xD6))


# ════════════════ İÇERİK ════════════════

def build(prs):
    # ─── 1. KAPAK ───
    s = slide(prs); bg(s, NAVY)
    rect(s, 0, 4.85, SW, 0.06, GOLD)
    text(s, 0.5, 0.85, 12.3, 1.3, "AURIS", fs=80, bold=True, color=GOLD,
         align=PP_ALIGN.CENTER)
    text(s, 0.5, 2.25, 12.3, 0.7, "Yapay Zekâ Üretimi Müziklerin Tespiti",
         fs=24, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    text(s, 0.5, 2.98, 12.3, 0.5,
         "İki Dönemlik Gelişim: Çok Platformlu Sistemden Akademik Yayına",
         fs=15, color=RGBColor(0xAD, 0xC4, 0xD6), align=PP_ALIGN.CENTER)
    text(s, 0.5, 3.6, 12.3, 0.45, "Genel Tanıtım Sunumu — Baştan Sona Proje Hikâyesi",
         fs=15, italic=True, color=RGBColor(0x7E, 0x9A, 0xB4), align=PP_ALIGN.CENTER)
    text(s, 0.5, 5.15, 12.3, 0.45, "Hasan Arthur Altuntaş  ·  221001047",
         fs=17, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    text(s, 0.5, 5.65, 12.3, 0.4, "Düzce Üniversitesi · Bilgisayar Mühendisliği · 2025-2026",
         fs=13, color=RGBColor(0xAD, 0xC4, 0xD6), align=PP_ALIGN.CENTER)
    text(s, 0.5, 6.35, 12.3, 0.4, "Danışman: Dr. Öğr. Üyesi Büşra TAKGİL",
         fs=12, color=RGBColor(0x5E, 0x7A, 0x94), align=PP_ALIGN.CENTER)

    # ─── 2. PROJE NEDİR (30 saniyelik özet) ───
    s = slide(prs); bg(s, PAPER)
    header(s, "Tek Bakışta", "AURIS Nedir?",
           "Üç cümlede projenin tamamı")
    panel(s, 0.4, 1.75, 12.53, 1.7, "Problem → Çözüm → Ürün",
          ["Suno, Udio ve MusicGen gibi araçlar insan kaydından ayırt edilemeyen müzik üretiyor; "
           "AURIS bu müzikleri akustik özniteliklere ve makine öğrenmesine dayanarak tespit ediyor "
           "ve sonucu web ile mobil üzerinden saniyeler içinde kullanıcıya sunuyor."],
          fill=TEALL, bar=TEAL, bfs=13, gap=4)
    cards = [("Akademik Çekirdek", "47 boyutlu akustik öznitelik + 11 modelli topluluk öğrenmesi; "
              "LightGBM lider (ROC-AUC 0,9548).", TEAL),
             ("Çok Platformlu Ürün", "Next.js web arayüzü, Kotlin/Compose mobil uygulama, "
              "FastAPI backend ile uçtan uca sistem.", STEEL),
             ("Açıklanabilirlik", "TreeSHAP ile her karar 'neden YZ / neden insan' "
              "sorusunu yanıtlıyor — kara kutu değil.", GOLDD)]
    for i, (t, d, clr) in enumerate(cards):
        lft = 0.4 + i*4.18
        rect(s, lft, 3.75, 3.95, 2.85, WHITE, clr, 1.2)
        rect(s, lft, 3.75, 3.95, 0.62, clr)
        text(s, lft+0.15, 3.75, 3.65, 0.62, t, fs=14, bold=True, color=WHITE,
             anchor=MSO_ANCHOR.MIDDLE)
        text(s, lft+0.18, 4.55, 3.6, 1.95, d, fs=12.5, color=DGRAY)
    footer(s)

    # ─── 3. SUNUM AKIŞI ───
    s = slide(prs); bg(s, PAPER)
    header(s, "Yol Haritası", "Bugün Ne Anlatacağım?",
           "Baştan sona: geçen dönem ne yaptım, bu dönem ne ekledim")
    items = [
        ("1", "Proje Hikâyesi", "İki dönemlik gelişim (BM401 → BM498)"),
        ("2", "Arka Plan", "Problem neden önemli?"),
        ("3", "Sistem Mimarisi", "Web + Mobil + Backend nasıl birleşiyor?"),
        ("4", "Veri ve Öznitelikler", "5.195 örnek, neden 47 öznitelik?"),
        ("5", "Model Seçimi", "11 model denedim, neyi neden seçtim?"),
        ("6", "Sonuçlar ve SHAP", "Performans, açıklanabilirlik, dürüst analiz"),
        ("7", "Arayüzler ve Demo", "Gerçek web/mobil ekranlar + canlı gösterim"),
        ("8", "Teknoloji Yığını", "Hangi araçları neden kullandım?"),
        ("9", "Literatür Karşılaştırması", "AURIS rakiplerine göre nerede?"),
        ("10", "Kısıtlar ve Gelecek", "Ne eksik, sırada ne var?"),
    ]
    for i, (no, t, d) in enumerate(items):
        col = i // 5
        row = i % 5
        lft = 0.4 + col*6.35
        top = 1.9 + row*0.98
        rect(s, lft, top, 6.1, 0.86, WHITE, TEAL, 1.0)
        rect(s, lft, top, 0.8, 0.86, NAVY)
        text(s, lft, top, 0.8, 0.86, no, fs=22, bold=True, color=GOLD,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        text(s, lft+0.95, top+0.1, 5.05, 0.38, t, fs=13, bold=True, color=NAVY)
        text(s, lft+0.95, top+0.46, 5.05, 0.36, d, fs=10.5, color=DGRAY)
    footer(s)

    # ─── 4. PROJE HİKÂYESİ — ZAMAN ÇİZELGESİ ───
    s = slide(prs); bg(s, PAPER)
    header(s, "1 · Proje Hikâyesi", "AURIS Nasıl Gelişti? — İki Dönemlik Yolculuk",
           "Çalışan bir üründen akademik olarak sağlam bir sisteme")
    # Zaman çizelgesi çizgisi
    rect(s, 1.0, 3.65, 11.3, 0.06, STEEL)
    milestones = [
        (1.4, "2025 Güz\nBM401", "Proje Tasarımı", TEAL,
         "Çok platformlu sistem\nwav2vec2 + LightGBM\nWeb + Mobil + Backend"),
        (5.1, "2025-26 Kış", "Akademik Derinleşme", GOLD,
         "47 öznitelik tasarımı\n11 model karşılaştırması\n5-katlı çapraz doğrulama"),
        (8.8, "2026 Bahar\nBM498", "Mezuniyet Tezi", GREEN,
         "GUJSA makalesi\nSHAP açıklanabilirlik\nTeslim ve savunma"),
    ]
    for cx, donem, baslik, clr, detay in milestones:
        # nokta
        rect(s, cx-0.12, 3.5, 0.36, 0.36, clr)
        # üst kutu (dönem)
        rect(s, cx-1.2, 1.85, 3.4, 1.4, WHITE, clr, 1.3)
        rect(s, cx-1.2, 1.85, 3.4, 0.62, clr)
        text(s, cx-1.2, 1.85, 3.4, 0.62, donem, fs=11.5, bold=True, color=WHITE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        text(s, cx-1.15, 2.52, 3.3, 0.6, baslik, fs=13, bold=True, color=clr,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        # alt kutu (detay)
        rect(s, cx-1.2, 4.05, 3.4, 2.15, MGRAY, clr, 1.0)
        text(s, cx-1.05, 4.2, 3.1, 1.9, detay, fs=11.5, color=DGRAY)
    footer(s)

    # ─── 5. GEÇEN DÖNEM (BM401) ───
    s = slide(prs); bg(s, PAPER)
    header(s, "1 · Proje Hikâyesi", "BM401 Proje Tasarımı — Temeli Attım",
           "wav2vec2 tabanlı hibrit model + çok platformlu ürün")
    panel(s, 0.4, 1.75, 6.15, 2.4, "Ne yaptım?",
          ["wav2vec2 (Meta'nın geliştirdiği, sesi otomatik 'anlayan' bir derin öğrenme "
           "modeli) ile ham sesten 768 boyutlu temsil çıkardım.",
           "Üzerine LightGBM sınıflandırıcı koyarak hibrit bir model kurdum.",
           "Web, mobil ve backend ile uçtan uca çalışan bir ürün geliştirdim."],
          fill=TEALL, bar=TEAL, bfs=12, gap=6)
    panel(s, 0.4, 4.35, 6.15, 2.25, "Ne öğrendim?",
          ["wav2vec2 güçlü ama ağır — GPU ister, gerçek zamanlı çalışması zor.",
           "Çok büyük model her zaman en pratik çözüm değil.",
           "Bu, beni bu dönem 'hafif ama etkili' bir yöntem aramaya yönlendirdi."],
          fill=AMBER, bar=GOLD, bfs=12, gap=6)
    text(s, 6.85, 1.75, 6.1, 0.4, "BM401 Çıktıları", fs=13, bold=True, color=NAVY)
    bm401 = [("Hibrit Model", "wav2vec2 + LightGBM"),
             ("Web Platformu", "Next.js 14 + TypeScript"),
             ("Mobil Uygulama", "Kotlin + Jetpack Compose"),
             ("Backend API", "Python + FastAPI"),
             ("Kullanıcı Testi", "30 katılımcı, SUS 82,5 puan")]
    for i, (t, d) in enumerate(bm401):
        top = 2.2 + i*0.88
        rect(s, 6.85, top, 6.1, 0.76, WHITE, STEEL, 1.0)
        text(s, 7.0, top+0.08, 5.8, 0.32, t, fs=12, bold=True, color=STEEL)
        text(s, 7.0, top+0.4, 5.8, 0.32, d, fs=10.5, color=DGRAY)
    footer(s)

    # ─── 6. BU DÖNEM (BM498) ───
    s = slide(prs); bg(s, PAPER)
    header(s, "1 · Proje Hikâyesi", "BM498 Mezuniyet Tezi — Akademik Olarak Derinleştirdim",
           "Ağır derin modelden, hafif ve açıklanabilir topluluk öğrenmesine")
    panel(s, 0.4, 1.75, 6.15, 2.4, "Ne değişti?",
          ["wav2vec2'nin tek başına çıkardığı temsil yerine, 47 boyutlu elle tasarlanmış "
           "akustik öznitelik vektörü kurdum.",
           "Tek model yerine 11 modeli (7 ML + 4 DL) karşılaştırdım.",
           "5-katlı çapraz doğrulama ile güvenilir, varyansı düşük sonuçlar elde ettim."],
          fill=TEALL, bar=TEAL, bfs=12, gap=6)
    panel(s, 0.4, 4.35, 6.15, 2.25, "Neden bu yön?",
          ["Hafiflik: LightGBM GPU istemiyor, saniyeler içinde sonuç veriyor.",
           "Açıklanabilirlik: SHAP ile 'neden bu karar' sorusunu yanıtlayabiliyorum.",
           "Bilimsel katkı: çalışma GUJSA'ya gönderilebilir makale formatına ulaştı."],
          fill=GREENL, bar=GREEN, bfs=12, gap=6)
    text(s, 6.85, 1.75, 6.1, 0.4, "BM498 Çıktıları", fs=13, bold=True, color=NAVY)
    bm498 = [("47 Öznitelik Vektörü", "5 aile: spektral, ritmik, vokal..."),
             ("11 Modelli Topluluk", "LightGBM lider, ROC-AUC 0,9548"),
             ("SHAP Açıklanabilirlik", "TreeSHAP global + yerel etki"),
             ("Akademik Makale", "GUJSA formatı, 39 referans"),
             ("Dürüst Tanılama", "Aşırı uyum, dağılım kayması analizi")]
    for i, (t, d) in enumerate(bm498):
        top = 2.2 + i*0.88
        rect(s, 6.85, top, 6.1, 0.76, WHITE, GREEN, 1.0)
        text(s, 7.0, top+0.08, 5.8, 0.32, t, fs=12, bold=True, color=GREEN)
        text(s, 7.0, top+0.4, 5.8, 0.32, d, fs=10.5, color=DGRAY)
    footer(s)

    # ─── 7. İKİ DÖNEM KARŞILAŞTIRMASI ───
    s = slide(prs); bg(s, PAPER)
    header(s, "1 · Proje Hikâyesi", "İki Dönem Yan Yana — Ne Gelişti?")
    comp = [
        ["Yöntem", "wav2vec2 + LightGBM hibrit", "47 öznitelik + 11 model topluluk"],
        ["Model ağırlığı", "Ağır (GPU gerekir)", "Hafif (CPU yeterli)"],
        ["Yaklaşım", "Tek derin model", "Sistematik model karşılaştırması"],
        ["Doğrulama", "Tek bölme (70/15/15)", "5-katlı çapraz doğrulama"],
        ["Açıklanabilirlik", "Yok", "TreeSHAP ile tam açıklama"],
        ["Çıktı", "Çalışan ürün", "Ürün + akademik makale"],
        ["Odak", "Mühendislik / ürün", "Bilimsel sağlamlık / yayın"],
    ]
    table(s, 0.4, 1.78, [2.7, 4.9, 4.93],
          ["Boyut", "BM401 (Geçen Dönem)", "BM498 (Bu Dönem)"], comp,
          row_h=0.6, fs=11.5,
          align_cols=[PP_ALIGN.LEFT, PP_ALIGN.LEFT, PP_ALIGN.LEFT])
    panel(s, 0.4, 6.1, 12.53, 0.85, "Özet",
          ["Geçen dönem çalışan bir sistem kurdum; bu dönem onu bilimsel olarak "
           "sağlamlaştırdım, hafiflettim ve açıklanabilir hâle getirdim. İkisi birlikte "
           "AURIS'in tam hikâyesini oluşturuyor."],
          fill=TEALL, bar=TEAL, bfs=11.5, gap=3)
    footer(s)

    # ─── 4. MOTİVASYON ───
    s = slide(prs); bg(s, PAPER)
    header(s, "Arka Plan", "Neden Yapay Zekâ Müzik Tespiti?",
           "Problemin önemi ve bu projenin doğuş nedeni")
    panel(s, 0.4, 1.75, 7.4, 2.2, "Sorun büyüyor",
          "Üretken yapay zekâ son üç yılda müzik üretimini laboratuvardan herkesin eline "
          "taşıdı. Bir metin istemiyle dakikalar içinde, deneyimsiz bir kulağın insan "
          "bestesinden ayıramayacağı parçalar üretilebiliyor.",
          fill=AMBER, bar=GOLD)
    text(s, 0.4, 4.2, 7.4, 0.4, "Bu neyi tehdit ediyor?", fs=13, bold=True, color=NAVY)
    paras(s, 0.45, 4.7, 7.35, 2.0,
          ["Telif hakkı ve içerik sahipliği belirsizleşiyor",
           "Akış platformlarında sahte dinlenme / gelir manipülasyonu",
           "Dezenformasyon ve sanatçı üslubu taklidi",
           "Sanatçı emeğinin ekonomik karşılığı eriyor"],
          fs=12.5, color=DGRAY, gap=9, lead="•  ")
    panel(s, 8.05, 1.75, 4.88, 4.95, "Neden ben bu projeyi seçtim?",
          ["Mevcut çözümlerin çoğu:",
           "",
           "✗  Akademik makaleyle sınırlı, son kullanıcıya ulaşmıyor",
           "✗  Yüksek işlem gücü istiyor",
           "✗  Gerçek zamanlı çalışmıyor",
           "✗  Kararını açıklamıyor",
           "",
           "AURIS bunları hedefliyor: erişilebilir, hafif, hızlı ve açıklanabilir "
           "bir tespit sistemi."],
          fill=TEALL, bar=TEAL, bfs=12, gap=5)
    footer(s)

    # ─── 5. SİSTEM MİMARİSİ (3 katman) ───
    s = slide(prs); bg(s, PAPER)
    header(s, "3 · Sistem Mimarisi", "Üç Katmanlı Çok Platformlu Yapı",
           "Sunum · İş mantığı · Veri/Model katmanları")
    layers = [
        ("SUNUM KATMANI", STEEL,
         ["Web: Next.js 14 + TypeScript + Tailwind", "Mobil: Kotlin + Jetpack Compose (MVVM)",
          "Duyarlı, erişilebilir arayüz"]),
        ("İŞ MANTIĞI / API", TEAL,
         ["Backend: Python + FastAPI (REST)", "Dosya doğrulama, hız sınırı, güvenlik",
          "MP3/WAV/FLAC/OGG · maks. 50 MB"]),
        ("VERİ / MODEL KATMANI", NAVY,
         ["librosa ile 47 öznitelik çıkarma", "LightGBM topluluk modeli",
          "TreeSHAP açıklanabilirlik"]),
    ]
    for i, (title, clr, rows) in enumerate(layers):
        top = 1.78 + i*1.62
        rect(s, 0.4, top, 12.53, 1.48, WHITE, clr, 1.3)
        rect(s, 0.4, top, 3.4, 1.48, clr)
        text(s, 0.4, top, 3.4, 1.48, title, fs=15, bold=True, color=WHITE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        for j, r in enumerate(rows):
            text(s, 3.7, top+0.14+j*0.4, 9.0, 0.38, "▸  "+r, fs=12, color=DGRAY,
                 anchor=MSO_ANCHOR.MIDDLE)
    text(s, 0.4, 6.62, 12.5, 0.35,
         "Katmanlı tasarım: arayüz değişse de model katmanı aynı kalır — bakımı ve testi kolay.",
         fs=11, italic=True, color=TGRAY)
    footer(s)

    # ─── 6. PIPELINE ───
    s = slide(prs); bg(s, PAPER)
    header(s, "3 · Sistem Mimarisi", "Ham Sesten Karara: İşleyiş Şeması")
    image(s, f"{FIG}/paper_pipeline_diagram.png", 0.4, 1.9, 12.5, 2.5,
          "AURIS uçtan uca analiz hattı")
    steps = [("1 Giriş", "WAV/MP3"), ("2 Ön işleme", "22.050 Hz, mono"),
             ("3 Öznitelik", "47 boyut"), ("4 Ölçekleme", "StandardScaler"),
             ("5 Model", "LightGBM"), ("6 Eşik", "θ*=0,4316"), ("7 Sonuç", "YZ/İnsan + SHAP")]
    cw = 1.74
    for i, (t, d) in enumerate(steps):
        lft = 0.4 + i*1.79
        rect(s, lft, 4.85, cw, 1.5, WHITE, TEAL, 1.0)
        rect(s, lft, 4.85, cw, 0.5, NAVY)
        text(s, lft+0.04, 4.85, cw-0.08, 0.5, t, fs=10.5, bold=True, color=WHITE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        text(s, lft+0.05, 5.45, cw-0.1, 0.85, d, fs=10, color=DGRAY,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    footer(s)

    # ─── 7. VERİ KÜMESİ ───
    s = slide(prs); bg(s, PAPER)
    header(s, "4 · Veri", "Veri Kümesi: 5.195 Örnek, 8 Kaynak")
    rows = [["GTZAN", "İnsan", "899"], ["FMA Small", "İnsan", "1.000"],
            ["SleepyJesse (kapak)", "İnsan", "854"], ["Diğer insan", "İnsan", "360"],
            ["Echoes", "Yapay zekâ", "1.128"], ["Suno (v3–v5)", "Yapay zekâ", "500"],
            ["Deepfake seti", "Yapay zekâ", "492"], ["AImE/Mustango/JEN-1", "Yapay zekâ", "204"],
            ["TOPLAM", "—", "5.195"]]
    table(s, 0.4, 1.78, [4.3, 2.6, 1.5], ["Kaynak", "Tür", "Örnek"], rows,
          row_h=0.43, fs=11.5, highlight_row=8,
          align_cols=[PP_ALIGN.LEFT, PP_ALIGN.CENTER, PP_ALIGN.CENTER])
    panel(s, 9.1, 1.78, 3.83, 2.4, "Neden bu kaynaklar?",
          ["İnsan tarafı tür çeşitliliği (GTZAN), bağımsız sanatçılar (FMA) ve "
           "kapak performansları (SleepyJesse) ile dengelendi.",
           "",
           "YZ tarafı sekiz farklı üreticiden — tek sisteme aşırı uyumu önlemek için."],
          fill=TEALL, bar=TEAL, bfs=11, gap=5)
    panel(s, 9.1, 4.35, 3.83, 2.25, "Sınıf Dengesi",
          ["İnsan: 3.113 (%59,9)",
           "Yapay zekâ: 2.082 (%40,1)",
           "",
           "class_weight='balanced' ve stratifiye CV ile dengelendi."],
          fill=MGRAY, bar=GOLD, bfs=11.5, gap=5)
    # Etik / FAIR notu
    panel(s, 0.4, 6.0, 8.5, 0.78, "Veri Etiği",
          ["Tüm veriler kamuya açık kaynaklardan derlendi; insan katılımcıdan birincil "
           "veri toplanmadı, etik kurul izni gerekmedi. Veri yalnızca akademik amaçla kullanıldı."],
          fill=GREENL, bar=GREEN, bfs=10, tfs=11.5, gap=2)
    footer(s)

    # ─── 8. ÖZNİTELİKLER (NEYİ NEDEN) ───
    s = slide(prs); bg(s, PAPER)
    header(s, "4 · Öznitelikler", "Neden 47 Öznitelik? Neyi Ölçüyorum?",
           "Tek bir akustik temsile bağlı kalmamak için beş aile")
    fams = [("Spektral", "16", "Frekans içeriği ve tını — MFCC, flatness, centroid"),
            ("Zamansal", "10", "Enerji ve zaman yapısı — RMS, sıfır geçiş, dinamik aralık"),
            ("Ritmik", "9", "Ritim ve vuruş — tempo, beat sayısı, onset gücü"),
            ("Harmonik", "8", "Perde ve akor — chroma, tonnetz"),
            ("Vokal", "4", "Şarkı sesi — temel frekans, vibrato, formant")]
    for i, (nm, dim, desc) in enumerate(fams):
        top = 1.78 + i*0.83
        rect(s, 0.4, top, 8.3, 0.73, WHITE, TEAL, 1.0)
        rect(s, 0.4, top, 2.0, 0.73, TEAL)
        text(s, 0.4, top, 2.0, 0.73, nm, fs=13, bold=True, color=WHITE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        chip(s, 2.2, top+0.18, 0.85, 0.37, dim+" boyut", fill=GOLD, fc=NAVY, fs=10)
        text(s, 3.25, top, 5.35, 0.73, desc, fs=11, color=DGRAY, anchor=MSO_ANCHOR.MIDDLE)
    panel(s, 9.0, 1.78, 3.93, 4.05, "Mantığım",
          ["Tek bir temsil (yalnız MFCC ya da yalnız spektrogram) modeli o temsile aşırı uyumlu yapar.",
           "",
           "Beş farklı aileyi birleştirince model, müziğin farklı yönlerinden ayırt edici "
           "sinyal toplayabiliyor.",
           "",
           "Sonuç: 47 boyutlu, dayanıklı ve yorumlanabilir bir öznitelik vektörü."],
          fill=TEALL, bar=TEAL, bfs=11.5, gap=5)
    text(s, 0.4, 6.0, 8.3, 0.6,
         "Bulgu: Öznitelik çıkarma deneyi, doğruluğun ~30 öznitelikte platoya ulaştığını "
         "gösterdi — gelecekte daha az öznitelikle benzer başarı mümkün.",
         fs=11, italic=True, color=TGRAY)
    footer(s)

    # ─── 9. MODEL SEÇİMİ — NEYİ NEDEN (tam tablo) ───
    s = slide(prs); bg(s, PAPER)
    header(s, "5 · Model Seçimi", "11 Model Denedim — Neyi Neden Seçtim?",
           "5-katlı çapraz doğrulama · ROC-AUC sırasına göre")
    MODELS = [
        ["1", "LightGBM", "ML", "0,8839", "0,8575", "0,9548", "±0,0023"],
        ["2", "Derin MLP", "DL", "0,8849", "0,8596", "0,9542", "±0,0036"],
        ["3", "Artık MLP", "DL", "0,8756", "0,8476", "0,9485", "±0,0048"],
        ["4", "XGBoost", "ML", "0,8751", "0,8408", "0,9465", "±0,0029"],
        ["5", "Gradient Boosting", "ML", "0,8685", "0,8337", "0,9397", "±0,0038"],
        ["6", "Random Forest", "ML", "0,8606", "0,8183", "0,9394", "±0,0051"],
        ["7", "Attention MLP", "DL", "0,8628", "0,8293", "0,9359", "±0,0059"],
        ["8", "SVM-RBF", "ML", "0,8612", "0,8252", "0,9346", "±0,0075"],
        ["9", "MLP", "ML", "0,8566", "0,8189", "0,9276", "±0,0061"],
        ["10", "1D-CNN", "DL", "0,7665", "0,7159", "0,8543", "±0,0087"],
        ["11", "Logistic Reg.", "ML", "0,7779", "0,7390", "0,8515", "±0,0042"],
    ]
    table(s, 0.4, 1.68, [0.5, 2.95, 0.85, 1.45, 1.35, 1.5, 1.3],
          ["#", "Model", "Tip", "Doğr.", "F1", "ROC-AUC", "Std"], MODELS,
          row_h=0.38, fs=10.5, hdr_fs=11, highlight_row=0,
          align_cols=[PP_ALIGN.CENTER, PP_ALIGN.LEFT, PP_ALIGN.CENTER,
                      PP_ALIGN.CENTER, PP_ALIGN.CENTER, PP_ALIGN.CENTER, PP_ALIGN.CENTER])
    panel(s, 10.4, 1.68, 2.53, 3.05, "Neden LightGBM?",
          ["En yüksek ROC-AUC (0,9548)",
           "En düşük varyans (±0,0023) → en kararlı",
           "Hızlı eğitim, az bellek",
           "Derin ağlara yakın başarı, çok daha hafif"],
          fill=TEALL, bar=TEAL, bfs=10, gap=6)
    # Kısaltma açıklaması (jüri 'ÇKA/CNN ne?' demesin)
    panel(s, 10.4, 4.9, 2.53, 1.77, "Kısaltmalar",
          ["MLP: Çok Katmanlı Algılayıcı",
           "CNN: Evrişimli Sinir Ağı",
           "SVM: Destek Vektör Makinesi",
           "ML: Makine Öğr. · DL: Derin Öğr."],
          fill=MGRAY, bar=GOLD, bfs=9.5, gap=4)
    footer(s)

    # ─── 10. ML vs DL görsel ───
    s = slide(prs); bg(s, PAPER)
    header(s, "5 · Model Seçimi", "Makine Öğrenmesi mi, Derin Öğrenme mi?")
    image(s, f"{FIG}/paper_ml_vs_dl.png", 0.4, 1.78, 7.9, 4.6,
          "ML ve DL ailelerinin performans dağılımı")
    panel(s, 8.55, 1.78, 4.38, 4.95, "Çıkarım",
          ["7 ML modeli ortalama %92,75 ROC-AUC.",
           "4 DL modeli ortalama %92,32.",
           "",
           "1D-CNN dışlanınca DL ortalaması %94,62'ye çıkıyor.",
           "",
           "Sonuç: 47 boyutlu öznitelik vektörü ayırt edici bilginin büyük bölümünü "
           "zaten taşıyor. Karmaşık derin ağ şart değil — hafif LightGBM yeterli ve "
           "daha kararlı."],
          fill=TEALL, bar=TEAL, bfs=11.5, gap=5)
    footer(s)

    # ─── 11. SONUÇLAR — özet metrik ───
    s = slide(prs); bg(s, PAPER)
    header(s, "6 · Sonuçlar", "LightGBM Performansı")
    stat(s, 0.4, 1.78, 2.95, 1.5, "0,9548", "ROC-AUC", vfs=28)
    stat(s, 3.55, 1.78, 2.95, 1.5, "0,8839", "Doğruluk", vfs=28)
    stat(s, 6.7, 1.78, 2.95, 1.5, "0,8575", "F1-Skoru", vfs=28)
    stat(s, 9.85, 1.78, 3.08, 1.5, "0,4316", "Karar eşiği θ*", vfs=22)
    image(s, f"{FIG}/paper_confusion_matrix_lightgbm.png", 0.4, 3.5, 4.0, 3.05,
          "Karmaşıklık matrisi")
    panel(s, 4.7, 3.5, 8.23, 3.05, "Karmaşıklık matrisi ne diyor?",
          ["Doğru negatif (insan→insan):  2.721  (%87,4)",
           "Doğru pozitif (YZ→YZ):  1.862  (%89,4)",
           "Yanlış pozitif (insan→YZ):  392  (%12,6)",
           "Yanlış negatif (YZ→insan):  220  (%10,6)",
           "",
           "Model her iki sınıfı da dengeli ayırıyor; Youden J eşiği (0,4316) ile "
           "yanlış alarm ile kaçırma arasında denge kuruldu."],
          fill=MGRAY, bar=NAVY, bfs=11.5, gap=5)
    footer(s)

    # ─── 12. AÇIKLANABİLİRLİK SHAP ───
    s = slide(prs); bg(s, PAPER)
    header(s, "6 · Sonuçlar", "Kararı Açıklamak — SHAP Analizi",
           "Model neden 'yapay zekâ' diyor?")
    image(s, f"{FIG}/shap_summary.png", 0.4, 1.78, 5.9, 4.6,
          "TreeSHAP global etki diyagramı")
    text(s, 6.55, 1.72, 6.4, 0.4, "En Etkili 5 Öznitelik", fs=13, bold=True, color=NAVY)
    feat = [["1", "spectral_flatness_std", "0,0619"],
            ["2", "spectral_contrast_mean", "0,0467"],
            ["3", "rms_energy", "0,0456"],
            ["4", "onset_strength_std", "0,0388"],
            ["5", "spectral_flatness_mean", "0,0370"]]
    table(s, 6.55, 2.15, [0.6, 4.0, 1.5], ["#", "Öznitelik", "Önem"], feat,
          row_h=0.5, fs=11, highlight_row=0,
          align_cols=[PP_ALIGN.CENTER, PP_ALIGN.LEFT, PP_ALIGN.CENTER])
    panel(s, 6.55, 5.2, 6.4, 1.4, "Yorum",
          ["YZ müziği spektral açıdan daha 'düz' ve düzenli. spectral_flatness_std bu farkı "
           "yakalayan en güçlü öznitelik — bulgu bağımsız deepfake literatürüyle de örtüşüyor."],
          fill=TEALL, bar=TEAL, bfs=11, gap=4)
    footer(s)

    # ─── 13. KAYNAK BAZLI ANALİZ (dürüst) ───
    s = slide(prs); bg(s, PAPER)
    header(s, "6 · Sonuçlar", "Hangi Kaynakta Ne Kadar Başarılı?",
           "Dürüst değerlendirme: güçlü ve zayıf noktalar")
    panel(s, 0.4, 1.78, 6.15, 2.3, "İyi sonuçlar",
          ["Suno parçaları:  %93,0 duyarlılık",
           "Echoes alt kümesi:  %88,6 duyarlılık",
           "",
           "Müzik üretim sistemlerinin spektral imzaları belirgin olduğundan model "
           "bunları yüksek doğrulukla yakalıyor."],
          fill=GREENL, bar=GREEN, bfs=11.5, gap=5)
    panel(s, 0.4, 4.28, 6.15, 2.3, "Zayıf nokta — neden?",
          ["Deepfake seti:  %50,0 duyarlılık",
           "",
           "Bu küme konuşma deepfake'inden türetilmiş; müzik üretim imzalarını "
           "taşımıyor. Düşüş bir başarısızlık değil, dağılım kayması (distribution shift) — "
           "gelecekte alan uyarlamasıyla giderilebilir."],
          fill=REDL, bar=RED, bfs=11.5, gap=5)
    image(s, f"{FIG}/threshold_sweep.png", 6.75, 1.78, 6.18, 3.0,
          "Karar eşiği taraması (0,40–0,50 platosu)")
    panel(s, 6.75, 5.05, 6.18, 1.55, "Neden bunu gösteriyorum?",
          ["Bir sistemin sınırlarını bilmek, onu güçlendirmenin ilk adımıdır. Deepfake "
           "düşüşünü saklamak yerine analiz ettim ve gelecek çalışma olarak planladım."],
          fill=MGRAY, bar=GOLD, bfs=11, gap=4)
    footer(s)

    # ─── 14. WEB ARAYÜZÜ (GERÇEK EKRAN) ───
    s = slide(prs); bg(s, PAPER)
    header(s, "7 · Arayüzler", "Web Platformu — Gerçek Ekran Görüntüsü",
           "Next.js 14 · TypeScript · Tailwind CSS")
    image(s, f"{SS}/auris_web_hero.png", 0.4, 1.78, 8.1, 4.7,
          "AURIS web arayüzü — analiz sayfası")
    panel(s, 8.7, 1.78, 4.23, 4.7, "Web özellikleri",
          ["YouTube bağlantısı veya dosya yükleme ile analiz",
           "",
           "AURIS Pipeline paneli analiz adımlarını canlı gösterir",
           "",
           "Spotify / Apple Music entegrasyonu (yakında)",
           "",
           "Statik site üretimi → hızlı yükleme, düşük maliyet",
           "",
           "Ortalama sayfa yükleme: 1,2 sn · Lighthouse 94"],
          fill=TEALL, bar=TEAL, bfs=11.5, gap=5)
    footer(s)

    # ─── 15. WEB — DETAY EKRANLAR ───
    s = slide(prs); bg(s, PAPER)
    header(s, "7 · Arayüzler", "Web — Analiz ve Sonuç Akışı")
    image(s, f"{SS}/auris_web_sec1.png", 0.4, 1.78, 6.15, 3.85,
          "Dosya yükleme ve analiz alanı")
    image(s, f"{SS}/auris_web_sec2.png", 6.75, 1.78, 6.18, 3.85,
          "YouTube bağlantı analizi ve sonuç")
    panel(s, 0.4, 5.8, 12.53, 0.85, "Kullanıcı akışı",
          ["Kullanıcı dosya/bağlantı verir → sistem 47 özniteliği çıkarır → LightGBM "
           "olasılık üretir → sonuç skoru ve SHAP gerekçesiyle birlikte gösterilir."],
          fill=MGRAY, bar=TEAL, bfs=11, gap=3)
    footer(s)

    # ─── 16. MOBİL ARAYÜZ (GERÇEK EKRAN) ───
    s = slide(prs); bg(s, PAPER)
    header(s, "7 · Arayüzler", "Mobil Uygulama — Gerçek Ekran Görüntüleri",
           "Kotlin · Jetpack Compose · MVVM mimarisi")
    image(s, f"{SS}/auris_mobile_hero.png", 1.0, 1.78, 2.7, 4.8,
          "AURIS ana ekranı")
    image(s, f"{SS}/auris_mobile_upload.png", 4.0, 1.78, 2.7, 4.8,
          "Yükleme sekmeleri")
    panel(s, 7.2, 1.78, 5.73, 4.8, "Mobil özellikler",
          ["Android 8.0+ desteği",
           "Jetpack Compose ile modern, az kodlu arayüz",
           "MVVM: iş mantığı arayüzden ayrı → test edilebilir",
           "Retrofit + Kotlin Coroutines ile asenkron ağ",
           "Room veritabanı ile yerel geçmiş",
           "",
           "Başlatma süresi: 0,8 sn · Bellek: ~120 MB",
           "10 analiz için yalnız %3 batarya tüketimi"],
          fill=TEALL, bar=TEAL, bfs=11.5, gap=6)
    footer(s)

    # ─── 16b. CANLI DEMO GEÇİŞİ ───
    s = slide(prs); bg(s, NAVY)
    rect(s, 0, 2.95, SW, 0.06, GOLD)
    text(s, 0.5, 1.5, 12.3, 0.5, "CANLI DEMO", fs=16, bold=True, color=GOLD,
         align=PP_ALIGN.CENTER)
    text(s, 0.5, 2.05, 12.3, 0.9, "Şimdi Sistemi Birlikte Görelim",
         fs=30, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    text(s, 0.5, 3.2, 12.3, 0.5, "Bir müzik dosyası yükleyip gerçek zamanlı sonucu inceleyeceğiz",
         fs=14, color=RGBColor(0xAD, 0xC4, 0xD6), align=PP_ALIGN.CENTER)
    demo = [("1", "Dosya / bağlantı ver"), ("2", "47 öznitelik çıkar"),
            ("3", "LightGBM tahmin"), ("4", "Sonuç + SHAP gerekçe")]
    for i, (no, t) in enumerate(demo):
        lft = 1.45 + i*2.7
        rect(s, lft, 4.3, 2.4, 1.4, NAVY2, TEAL, 1.0)
        text(s, lft, 4.45, 2.4, 0.6, no, fs=26, bold=True, color=GOLD,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        text(s, lft+0.1, 5.05, 2.2, 0.6, t, fs=11, color=WHITE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    text(s, 0.5, 6.2, 12.3, 0.4,
         "(Demo videosu teslim paketinde · Uygulama/ klasörü)",
         fs=11, italic=True, color=RGBColor(0x7E, 0x9A, 0xB4), align=PP_ALIGN.CENTER)

    # ─── 17. TEKNOLOJİ YIĞINI (NE KULLANDIM) ───
    s = slide(prs); bg(s, PAPER)
    header(s, "8 · Teknoloji", "Ne Kullandım? — Teknoloji Yığını",
           "Her katmanda neden bu araçları seçtim")
    stacks = [
        ("Yapay Zekâ / Veri", TEAL,
         ["Python · librosa (öznitelik)", "scikit-learn · LightGBM · XGBoost",
          "PyTorch (derin modeller)", "SHAP (açıklanabilirlik)"]),
        ("Web", STEEL,
         ["Next.js 14 · React 18", "TypeScript (tip güvenliği)",
          "Tailwind CSS", "Statik site üretimi"]),
        ("Mobil", GOLDD,
         ["Kotlin · Jetpack Compose", "MVVM mimarisi",
          "Retrofit · Coroutines", "Room veritabanı"]),
        ("Backend", NAVY,
         ["Python · FastAPI", "RESTful API + JSON",
          "Dosya doğrulama / güvenlik", "Otomatik API dokümanı"]),
    ]
    for i, (title, clr, rows) in enumerate(stacks):
        lft = 0.4 + (i % 2)*6.35
        top = 1.78 + (i // 2)*2.45
        rect(s, lft, top, 6.1, 2.25, WHITE, clr, 1.2)
        rect(s, lft, top, 6.1, 0.55, clr)
        text(s, lft+0.18, top, 5.8, 0.55, title, fs=14, bold=True, color=WHITE,
             anchor=MSO_ANCHOR.MIDDLE)
        for j, r in enumerate(rows):
            text(s, lft+0.25, top+0.68+j*0.38, 5.6, 0.36, "•  "+r, fs=11.5,
                 color=DGRAY)
    footer(s)

    # ─── 18. LİTERATÜR KARŞILAŞTIRMASI ───
    s = slide(prs); bg(s, PAPER)
    header(s, "9 · Karşılaştırma", "AURIS Literatüre Göre Nerede?",
           "Yayımlanmış çalışmalarla sayısal karşılaştırma")
    LIT = [
        ["Afchar vd. (2025)", "Oto-kodlayıcı artefakt", "Özel", "—", "0,872"],
        ["Li vd. (2026)", "Açıklanabilir öznitelik + ML", "Özel", "0,931", "0,884"],
        ["Cros Vila vd. (2025)", "Spektral + ritmik + SVM", "Özel", "0,941", "—"],
        ["SONICS (2025)", "Transformer tabanlı DL", "SONICS", "0,960", "0,921"],
        ["FakeMusicCaps (2025)", "Çok modlu MusicCaps", "FMC", "0,943", "0,906"],
        ["AURIS (bu çalışma)", "47 öznitelik + 11 model topluluk", "5.195", "0,9548", "0,8731"],
    ]
    table(s, 0.4, 1.78, [2.9, 3.7, 2.0, 1.95, 1.98],
          ["Çalışma", "Yaklaşım", "Veri", "ROC-AUC", "F1"], LIT,
          row_h=0.62, fs=11, highlight_row=5,
          align_cols=[PP_ALIGN.LEFT, PP_ALIGN.LEFT, PP_ALIGN.CENTER,
                      PP_ALIGN.CENTER, PP_ALIGN.CENTER])
    panel(s, 0.4, 6.0, 12.53, 0.95, "Konumum",
          ["AURIS (0,9548), Transformer tabanlı SONICS (0,960) ile Li vd. (0,931) arasında. "
           "Üstelik derin öğrenme altyapısı gerektirmeden ve en düşük varyansla (±0,0023) — "
           "hafif bir sistemin ne kadar rekabetçi olabileceğini gösteriyor."],
          fill=TEALL, bar=TEAL, bfs=11.5, gap=3)
    footer(s)

    # ─── 19. KISITLAR + GELECEK ───
    s = slide(prs); bg(s, PAPER)
    header(s, "10 · Değerlendirme", "Ne Eksik? Sırada Ne Var?")
    text(s, 0.4, 1.7, 6.15, 0.38, "Bilinen Kısıtlar", fs=14, bold=True, color=RED)
    lim = [("Dağılım kayması", "Eğitim dışı YZ sistemlerine genelleme sınırlı (deepfake %50)."),
           ("Aşırı uyum eğilimi", "Ağaç modellerinde 8–14 puan eğitim-CV açığı."),
           ("Öznitelik fazlalığı", "Son 17 öznitelik doğruluğa katkı sağlamıyor."),
           ("Gerçek zaman", "Düşük gecikmeli çıkarım henüz test edilmedi.")]
    for i, (t, d) in enumerate(lim):
        top = 2.16 + i*1.12
        rect(s, 0.4, top, 6.15, 1.0, REDL, RED, 1.0)
        text(s, 0.55, top+0.1, 5.9, 0.35, "⚠  "+t, fs=12, bold=True, color=RED)
        text(s, 0.55, top+0.46, 5.9, 0.48, d, fs=10.5, color=DGRAY)
    text(s, 6.78, 1.7, 6.15, 0.38, "Gelecek Çalışmalar", fs=14, bold=True, color=GREEN)
    fut = [("Genelleme", "SONICS/FakeMusicCaps ile üretici-bağımsız test; alan uyarlama."),
           ("Sağlamlık", "MP3 sıkıştırma, perde kaydırma, zaman gerdirme testleri."),
           ("Gerçek zaman", "Düşük gecikmeli çıkarım ve canlı ses akışı."),
           ("Ölçek", "Veri kümesini 10.000 örneğe genişletme.")]
    for i, (t, d) in enumerate(fut):
        top = 2.16 + i*1.12
        rect(s, 6.78, top, 6.15, 1.0, GREENL, GREEN, 1.0)
        text(s, 6.93, top+0.1, 5.9, 0.35, "→  "+t, fs=12, bold=True, color=GREEN)
        text(s, 6.93, top+0.46, 5.9, 0.48, d, fs=10.5, color=DGRAY)
    footer(s)

    # ─── 20. ÖZET / KAPANIŞ ───
    s = slide(prs); bg(s, NAVY)
    rect(s, 0, 2.9, SW, 0.06, GOLD)
    text(s, 0.5, 0.9, 12.3, 0.9, "Özetle", fs=32, bold=True, color=GOLD,
         align=PP_ALIGN.CENTER)
    text(s, 0.5, 1.85, 12.3, 0.8,
         "AURIS, yapay zekâ müziğini tespit eden; akademik olarak sağlam, "
         "ürün olarak çalışan, çok platformlu ve açıklanabilir bir sistem.",
         fs=15, color=RGBColor(0xCD, 0xDD, 0xE8), align=PP_ALIGN.CENTER)
    for i, (v, l) in enumerate([("0,9548", "ROC-AUC"), ("47", "Öznitelik"),
                                ("11", "Model"), ("3", "Platform")]):
        lft = 1.15 + i*2.78
        rect(s, lft, 3.4, 2.45, 1.4, NAVY2, TEAL, 1.0)
        text(s, lft, 3.5, 2.45, 0.65, v, fs=26, bold=True, color=GOLD,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        text(s, lft, 4.15, 2.45, 0.5, l, fs=12, color=WHITE,
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    text(s, 0.5, 5.25, 12.3, 0.5, "Teşekkürler — Sorularınızı bekliyorum.",
         fs=20, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    text(s, 0.5, 5.95, 12.3, 0.4, "Hasan Arthur Altuntaş  ·  hasannarthurrr@gmail.com",
         fs=13, color=RGBColor(0xAD, 0xC4, 0xD6), align=PP_ALIGN.CENTER)
    text(s, 0.5, 6.4, 12.3, 0.38, "Düzce Üniversitesi · Bilgisayar Mühendisliği · 2025-2026",
         fs=11, color=RGBColor(0x5E, 0x7A, 0x94), align=PP_ALIGN.CENTER)


if __name__ == "__main__":
    out = 'docs/academic/TeslimEdilecekler/Sunumlar'
    os.makedirs(out, exist_ok=True)
    p = newp()
    build(p)
    path = f"{out}/AURIS_Genel_Tanitim_Sunumu.pptx"
    p.save(path)
    print(f"[OK] {path}  ({len(p.slides)} slayt)")
