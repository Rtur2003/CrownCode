# -*- coding: utf-8 -*-
"""
AURIS teslim dökümanları:
  Kullanim_Kilavuzu.pdf, Kurulum_Talimatlari.pdf, Lisans_Bilgileri.txt
Gerçek proje bilgilerine dayanır (requirements.txt, package.json, build.gradle).
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, ListFlowable, ListItem,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

OUT = 'docs/academic/TeslimEdilecekler/Dokumanlar'
os.makedirs(OUT, exist_ok=True)

# ── Türkçe karakter için font ──
FONT = "Helvetica"
FONT_B = "Helvetica-Bold"
for fam, reg, bold in [
    ("DejaVu", "C:/Windows/Fonts/DejaVuSans.ttf", "C:/Windows/Fonts/DejaVuSans-Bold.ttf"),
    ("Calibri", "C:/Windows/Fonts/calibri.ttf", "C:/Windows/Fonts/calibrib.ttf"),
    ("Arial", "C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/arialbd.ttf"),
]:
    if os.path.exists(reg) and os.path.exists(bold):
        try:
            pdfmetrics.registerFont(TTFont(fam, reg))
            pdfmetrics.registerFont(TTFont(fam+"-B", bold))
            FONT, FONT_B = fam, fam+"-B"
            break
        except Exception:
            continue

NAVY = colors.HexColor("#102A4C")
TEAL = colors.HexColor("#0A808C")
GOLD = colors.HexColor("#D99A07")
GRAY = colors.HexColor("#444A50")
LGRAY = colors.HexColor("#EAEEF2")
LINE = colors.HexColor("#D2D9E0")


def styles():
    ss = getSampleStyleSheet()
    s = {}
    s['title'] = ParagraphStyle('title', parent=ss['Title'], fontName=FONT_B,
                                 fontSize=22, textColor=NAVY, spaceAfter=4, leading=26)
    s['subtitle'] = ParagraphStyle('subtitle', fontName=FONT, fontSize=12,
                                    textColor=TEAL, spaceAfter=14)
    s['h1'] = ParagraphStyle('h1', fontName=FONT_B, fontSize=14, textColor=NAVY,
                             spaceBefore=14, spaceAfter=6, leading=18)
    s['h2'] = ParagraphStyle('h2', fontName=FONT_B, fontSize=11.5, textColor=TEAL,
                             spaceBefore=9, spaceAfter=4, leading=15)
    s['body'] = ParagraphStyle('body', fontName=FONT, fontSize=10, textColor=GRAY,
                               alignment=TA_JUSTIFY, spaceAfter=6, leading=15)
    s['bullet'] = ParagraphStyle('bullet', fontName=FONT, fontSize=10, textColor=GRAY,
                                 leading=15, leftIndent=12)
    s['code'] = ParagraphStyle('code', fontName="Courier", fontSize=9,
                               textColor=colors.HexColor("#1A1A1A"),
                               backColor=LGRAY, borderPadding=6, leading=13,
                               spaceAfter=8, spaceBefore=2)
    s['note'] = ParagraphStyle('note', fontName=FONT, fontSize=9.5,
                               textColor=GRAY, leading=13, leftIndent=10,
                               borderColor=GOLD, borderWidth=0)
    s['foot'] = ParagraphStyle('foot', fontName=FONT, fontSize=8,
                               textColor=colors.HexColor("#8A929A"), alignment=TA_CENTER)
    return s


S = styles()


def header_footer(canvas, doc, title):
    canvas.saveState()
    # üst bant
    canvas.setFillColor(NAVY)
    canvas.rect(0, A4[1]-1.5*cm, A4[0], 1.5*cm, fill=1, stroke=0)
    canvas.setFillColor(GOLD)
    canvas.rect(0, A4[1]-1.55*cm, A4[0], 0.05*cm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont(FONT_B, 11)
    canvas.drawString(2*cm, A4[1]-1.0*cm, "AURIS")
    canvas.setFont(FONT, 9)
    canvas.drawRightString(A4[0]-2*cm, A4[1]-1.0*cm, title)
    # alt
    canvas.setStrokeColor(LINE)
    canvas.line(2*cm, 1.3*cm, A4[0]-2*cm, 1.3*cm)
    canvas.setFillColor(colors.HexColor("#8A929A"))
    canvas.setFont(FONT, 8)
    canvas.drawString(2*cm, 0.95*cm, "Hasan Arthur Altuntaş · BM498 · Düzce Üniversitesi")
    canvas.drawRightString(A4[0]-2*cm, 0.95*cm, f"Sayfa {doc.page}")
    canvas.restoreState()


def cover(title, subtitle):
    el = []
    el.append(Spacer(1, 0.5*cm))
    el.append(Paragraph(title, S['title']))
    el.append(Paragraph(subtitle, S['subtitle']))
    el.append(HRFlowable(width="100%", thickness=2, color=TEAL, spaceAfter=10))
    return el


def code_block(text):
    return Paragraph(text.replace('\n', '<br/>').replace(' ', '&nbsp;'), S['code'])


def bullets(items):
    return ListFlowable(
        [ListItem(Paragraph(i, S['bullet']), leftIndent=10, value='•') for i in items],
        bulletType='bullet', start='•', leftIndent=6)


def info_table(rows, col_w):
    t = Table(rows, colWidths=col_w)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), FONT_B),
        ('FONTNAME', (0, 1), (-1, -1), FONT),
        ('FONTSIZE', (0, 0), (-1, -1), 9.5),
        ('TEXTCOLOR', (0, 1), (-1, -1), GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, LINE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LGRAY]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    return t


# ════════════════════════════════════════════════════════════════
# 1. KULLANIM KILAVUZU
# ════════════════════════════════════════════════════════════════
def kullanim_kilavuzu():
    path = f"{OUT}/Kullanim_Kilavuzu.pdf"
    doc = SimpleDocTemplate(path, pagesize=A4, topMargin=2.0*cm,
                            bottomMargin=1.7*cm, leftMargin=2*cm, rightMargin=2*cm)
    e = cover("AURIS Kullanım Kılavuzu",
              "Yapay Zekâ Üretimi Müzik Tespit Sistemi — Kullanıcı Rehberi")

    e.append(Paragraph("1. Giriş", S['h1']))
    e.append(Paragraph(
        "AURIS, bir müzik parçasının yapay zekâ tarafından mı yoksa insan tarafından mı "
        "üretildiğini tespit eden bir analiz sistemidir. Sistem; web arayüzü, Android mobil "
        "uygulaması ve bir arka uç servisinden oluşur. Bu kılavuz, son kullanıcının sistemi "
        "nasıl kullanacağını adım adım açıklar.", S['body']))

    e.append(Paragraph("2. Desteklenen Girdiler", S['h1']))
    e.append(info_table([
        ["Özellik", "Değer"],
        ["Ses formatları", "MP3, WAV, FLAC, OGG"],
        ["Maksimum dosya boyutu", "50 MB"],
        ["Bağlantı analizi", "YouTube bağlantısı"],
        ["Önerilen süre", "En az 30 saniye"],
        ["Örnekleme", "Otomatik 22.050 Hz'e indirgenir"],
    ], [6*cm, 9*cm]))
    e.append(Spacer(1, 0.3*cm))

    e.append(Paragraph("3. Web Arayüzü Kullanımı", S['h1']))
    e.append(Paragraph("3.1. Dosya Yükleyerek Analiz", S['h2']))
    e.append(bullets([
        "Web arayüzünde 'Ses Dosyası Yükle' alanına gidin.",
        "Analiz etmek istediğiniz müzik dosyasını sürükleyip bırakın veya seçin.",
        "Sistem dosyayı doğrular ve analiz hattını (AURIS Pipeline) başlatır.",
        "Birkaç saniye içinde sonuç ekranda görüntülenir.",
    ]))
    e.append(Paragraph("3.2. YouTube Bağlantısı ile Analiz", S['h2']))
    e.append(bullets([
        "'YouTube Bağlantısını Analiz Et' alanına geçin.",
        "Geçerli bir YouTube bağlantısı yapıştırın.",
        "'Bağlantıyı İşle' düğmesine basın; sistem sesi alır ve analiz eder.",
    ]))

    e.append(Paragraph("4. Sonuç Ekranının Okunması", S['h1']))
    e.append(Paragraph(
        "Analiz tamamlandığında sistem üç bilgi sunar:", S['body']))
    e.append(info_table([
        ["Bilgi", "Açıklama"],
        ["Sınıf etiketi", "'Yapay Zekâ' veya 'İnsan' kararı"],
        ["Güven skoru", "Modelin kararına olan güveni (0–1 olasılık)"],
        ["SHAP gerekçesi", "Kararı en çok etkileyen akustik öznitelikler"],
    ], [4.5*cm, 10.5*cm]))
    e.append(Spacer(1, 0.2*cm))
    e.append(Paragraph(
        "Not: Karar eşiği, dengeli sınıflandırma için Youden J kriteriyle 0,4316 olarak "
        "ayarlanmıştır. Güven skoru bu eşiğin üzerindeyse parça 'Yapay Zekâ' olarak işaretlenir.",
        S['note']))

    e.append(Paragraph("5. Android Mobil Uygulaması", S['h1']))
    e.append(bullets([
        "Uygulamayı açın; ana ekrandan hızlı analiz başlatabilirsiniz.",
        "Cihazınızdaki bir müzik dosyasını seçin veya yeni kayıt yapın.",
        "Analiz ekranı yükleme ilerlemesini ve ardından sonucu gösterir.",
        "Geçmiş analizleriniz yerel veritabanında (Room) saklanır.",
    ]))

    e.append(Paragraph("6. Sık Karşılaşılan Durumlar", S['h1']))
    e.append(info_table([
        ["Durum", "Çözüm"],
        ["Dosya reddedildi", "Format MP3/WAV/FLAC/OGG ve boyut < 50 MB olmalı"],
        ["Analiz uzun sürüyor", "Uzun dosyalarda öznitelik çıkarma zaman alabilir"],
        ["Düşük güven skoru", "0,3–0,6 aralığı belirsiz bölgedir; daha uzun klip deneyin"],
        ["YouTube hatası", "Bağlantının herkese açık ve geçerli olduğundan emin olun"],
    ], [5*cm, 10*cm]))

    e.append(Paragraph("7. Sınırlamalar", S['h1']))
    e.append(Paragraph(
        "AURIS, eğitim verisindeki müzik üretim sistemlerine yüksek doğrulukla genelleme "
        "yapar. Ancak konuşma temelli deepfake kayıtları gibi farklı türden içeriklerde "
        "performansı düşebilir; sistem bu tür girdiler için tasarlanmamıştır. Sonuçlar "
        "destekleyici bir gösterge olarak değerlendirilmelidir.", S['body']))

    doc.build(e, onFirstPage=lambda c, d: header_footer(c, d, "Kullanım Kılavuzu"),
              onLaterPages=lambda c, d: header_footer(c, d, "Kullanım Kılavuzu"))
    print(f"[OK] {path}")


# ════════════════════════════════════════════════════════════════
# 2. KURULUM TALİMATLARI
# ════════════════════════════════════════════════════════════════
def kurulum_talimatlari():
    path = f"{OUT}/Kurulum_Talimatlari.pdf"
    doc = SimpleDocTemplate(path, pagesize=A4, topMargin=2.0*cm,
                            bottomMargin=1.7*cm, leftMargin=2*cm, rightMargin=2*cm)
    e = cover("AURIS Kurulum Talimatları",
              "Geliştirici Ortamı Kurulumu ve Çalıştırma Rehberi")

    e.append(Paragraph("1. Sistem Gereksinimleri", S['h1']))
    e.append(info_table([
        ["Bileşen", "Gereksinim"],
        ["İşletim sistemi", "Windows 10/11, Linux veya macOS"],
        ["Python", "3.11 veya üzeri (arka uç ve model)"],
        ["Node.js", "20.18.1 veya üzeri (web arayüzü)"],
        ["Android SDK", "API 26+ (minSdk 26, Android 8.0)"],
        ["Bellek", "En az 8 GB RAM önerilir"],
        ["Disk", "Model dosyaları için ~500 MB"],
    ], [5*cm, 10*cm]))
    e.append(Spacer(1, 0.3*cm))

    e.append(Paragraph("2. Arka Uç ve Model (Python)", S['h1']))
    e.append(Paragraph("2.1. Bağımlılıkların Kurulumu", S['h2']))
    e.append(code_block(
        "cd hf-crowncode-backend\n"
        "python -m venv venv\n"
        "venv\\Scripts\\activate        # Windows\n"
        "source venv/bin/activate      # Linux / macOS\n"
        "pip install -r requirements.txt"))
    e.append(Paragraph("2.2. Temel Bağımlılıklar", S['h2']))
    e.append(Paragraph(
        "Sistem; FastAPI ve Uvicorn (servis), librosa ve soundfile (ses işleme), "
        "scikit-learn, LightGBM ve XGBoost (modeller), transformers (wav2vec2) ve "
        "SHAP (açıklanabilirlik) kütüphanelerine dayanır.", S['body']))
    e.append(Paragraph("2.3. Yerel Demo Çalıştırma", S['h2']))
    e.append(code_block(
        "python local_demo.py\n"
        "# Gradio tabanlı yerel arayüz başlatır"))
    e.append(Paragraph("2.4. API Servisini Başlatma", S['h2']))
    e.append(code_block(
        "uvicorn app.main:app --host 0.0.0.0 --port 7860"))
    e.append(Paragraph(
        "Servis çalıştığında otomatik API dokümantasyonuna '/docs' adresinden erişilebilir.",
        S['note']))

    e.append(Paragraph("3. Web Arayüzü (Next.js)", S['h1']))
    e.append(code_block(
        "cd platform\n"
        "npm install\n"
        "npm run dev         # geliştirme sunucusu (http://localhost:3000)\n"
        "npm run build       # üretim derlemesi (statik dışa aktarım)"))
    e.append(Paragraph(
        "Web arayüzü Next.js 14 ve TypeScript ile geliştirilmiştir. Statik site üretimi "
        "kullanılarak hızlı yükleme ve düşük barındırma maliyeti sağlanır.", S['body']))

    e.append(Paragraph("4. Android Mobil Uygulaması", S['h1']))
    e.append(bullets([
        "Android Studio ile 'Android-App-CrownCode' klasörünü açın.",
        "Gradle senkronizasyonunun tamamlanmasını bekleyin.",
        "Bir emülatör veya fiziksel cihaz (Android 8.0+) bağlayın.",
        "'Run' düğmesiyle uygulamayı derleyip çalıştırın.",
    ]))
    e.append(Paragraph(
        "Uygulama Kotlin ve Jetpack Compose ile MVVM mimarisinde geliştirilmiştir. "
        "Ağ istekleri Retrofit, asenkron işlemler Kotlin Coroutines ile yönetilir.",
        S['body']))

    e.append(Paragraph("5. Model Eğitimi (İsteğe Bağlı)", S['h1']))
    e.append(Paragraph(
        "Modeli sıfırdan eğitmek için öznitelik çıkarma ve eğitim betikleri kullanılır:",
        S['body']))
    e.append(code_block(
        "cd hf-crowncode-backend\n"
        "python -m app.training.extract_features_batch  # öznitelik çıkarma\n"
        "python -m app.training.train_classifier data/training/features.csv"))
    e.append(Paragraph(
        "Eğitim çıktıları 'models/' klasörüne kaydedilir: eğitilmiş model, ölçekleyici, "
        "öznitelik sütunları ve metrik dosyaları (training_results.json).", S['body']))

    e.append(Paragraph("6. Doğrulama", S['h1']))
    e.append(bullets([
        "Arka uç: '/docs' adresinin açılması servisin çalıştığını gösterir.",
        "Web: Tarayıcıda http://localhost:3000 adresinin yüklenmesi yeterlidir.",
        "Model: training_results.json içindeki LightGBM ROC-AUC ≈ 0,9548 olmalıdır.",
    ]))

    doc.build(e, onFirstPage=lambda c, d: header_footer(c, d, "Kurulum Talimatları"),
              onLaterPages=lambda c, d: header_footer(c, d, "Kurulum Talimatları"))
    print(f"[OK] {path}")


# ════════════════════════════════════════════════════════════════
# 3. LİSANS BİLGİLERİ
# ════════════════════════════════════════════════════════════════
def lisans_bilgileri():
    path = f"{OUT}/Lisans_Bilgileri.txt"
    content = """AURIS — LİSANS BİLGİLERİ
================================================================

Proje      : AURIS — Yapay Zekâ Üretimi Müziklerin Tespiti
Geliştirici: Hasan Arthur Altuntaş
Kurum      : Düzce Üniversitesi, Bilgisayar Mühendisliği
Yıl        : 2025-2026

----------------------------------------------------------------
1. PROJE LİSANSI
----------------------------------------------------------------

Bu proje MIT Lisansı altında dağıtılmaktadır.

MIT License

Copyright (c) 2025 Hasan Arthur Altuntaş

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

----------------------------------------------------------------
2. KULLANILAN ÜÇÜNCÜ TARAF KÜTÜPHANELERİ VE LİSANSLARI
----------------------------------------------------------------

Yapay Zekâ / Veri İşleme:
  - librosa ............... ISC License
  - scikit-learn .......... BSD 3-Clause License
  - LightGBM .............. MIT License
  - XGBoost ............... Apache License 2.0
  - PyTorch ............... BSD-style License
  - transformers (HF) ..... Apache License 2.0
  - SHAP .................. MIT License
  - NumPy / SciPy ......... BSD 3-Clause License

Arka Uç:
  - FastAPI ............... MIT License
  - Uvicorn ............... BSD 3-Clause License
  - Pydantic .............. MIT License

Web Arayüzü:
  - Next.js ............... MIT License
  - React ................. MIT License
  - TypeScript ............ Apache License 2.0
  - Tailwind CSS .......... MIT License

Mobil Uygulama:
  - Kotlin ................ Apache License 2.0
  - Jetpack Compose ....... Apache License 2.0
  - Retrofit .............. Apache License 2.0
  - Room .................. Apache License 2.0

----------------------------------------------------------------
3. VERİ KÜMESİ KAYNAKLARI
----------------------------------------------------------------

Eğitimde kullanılan veriler kamuya açık kaynaklardan derlenmiştir.
İnsan katılımcılardan birincil veri toplanmamıştır; bu nedenle etik
kurul izni gerekmemektedir.

İnsan müziği kaynakları : GTZAN, FMA Small, SleepyJesse (kapak)
Yapay zekâ kaynakları   : Suno, Udio, MusicGen, AudioLDM2, Echoes,
                          Stable Audio, Riffusion, Mustango, JEN-1, AImE

Her kaynak kendi kullanım koşullarına tabidir. Veri kümesi yalnızca
akademik araştırma amacıyla kullanılmıştır.

----------------------------------------------------------------
4. SORUMLULUK REDDİ
----------------------------------------------------------------

AURIS bir araştırma projesidir. Analiz sonuçları destekleyici bir
gösterge olarak değerlendirilmeli, tek başına hukuki veya ticari
karar dayanağı olarak kullanılmamalıdır.

================================================================
İletişim: hasannarthurrr@gmail.com
"""
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[OK] {path}")


if __name__ == "__main__":
    kullanim_kilavuzu()
    kurulum_talimatlari()
    lisans_bilgileri()
    print("\nTüm dökümanlar oluşturuldu.")
