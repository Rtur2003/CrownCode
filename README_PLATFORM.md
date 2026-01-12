# 🚀 CrownCode Platform

<div align="center">

![CrownCode Logo](https://img.shields.io/badge/Crown-Code-gold?style=for-the-badge&logo=crown&logoColor=white)

**AI-Powered Research Platform for Music Detection and Data Analysis**

[![GitHub Stars](https://img.shields.io/github/stars/Rtur2003/CrownCode?style=social)](https://github.com/Rtur2003/CrownCode)
[![Live Platform](https://img.shields.io/badge/Live-Platform-brightgreen?style=for-the-badge)](https://hasanarthuraltuntas.xyz)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Branch](https://img.shields.io/badge/Branch-geliştirme-blue?style=for-the-badge)](https://github.com/Rtur2003/CrownCode/tree/geliştirme)

</div>

## 🌟 Platform Genel Bakış

CrownCode, yapay zeka destekli müzik tespiti ve veri manipülasyonu için geliştirilmiş bir araştırma platformudur. Modüler yapıda tasarlanmış olup, mobil ve masaüstü cihazlarda mükemmel uyumluluk sağlıyor.

> **Düzce Üniversitesi Bilgisayar Mühendisliği Bölümü**
> **Bitirme Projesi 2025-2026**
> **Geliştirici:** Hasan Arthur Altuntaş

### ✨ Platform Özellikleri

- 🎯 **Modüler Mimari**: Bağımsız araştırma modülleri, ortak platform altyapısı
- 📱 **Responsive Tasarım**: Mobil-first yaklaşım ile tam uyumluluk
- ⚡ **Yüksek Performans**: Optimize edilmiş kod yapısı ve caching
- 🔄 **Gerçek Zamanlı**: Live işleme ve interaktif özellikler
- 🛡️ **Güvenli**: Modern güvenlik standartları
- 🌐 **Çok Dilli**: Türkçe ve İngilizce tam destek

---

## 🏗️ Aktif Araştırma Modülleri

### 1. 🎵 AI Music Detection
**Yapay Zeka Destekli Müzik Tespit Sistemi**

[![Status](https://img.shields.io/badge/Status-In_Development-yellow)](https://github.com/Rtur2003/CrownCode)
[![Target](https://img.shields.io/badge/Target_Accuracy-95%25+-blue)](https://github.com/Rtur2003/CrownCode)

- **Amaç**: AI ile üretilen müziği insan yapımı müzikten ayırt etme
- **Model**: wav2vec2 tabanlı deep learning
- **Teknoloji Stack**: PyTorch, Next.js 14, TensorFlow.js
- **Hedef Özellikler**:
  - ✅ Web-based dosya yükleme
  - 🔄 YouTube/Spotify/SoundCloud link desteği (geliştiriliyor)
  - 🔄 Real-time audio analysis (planlanıyor)
  - 🔄 Batch processing (planlanıyor)

**📁 Sayfa**: [`/ai-music-detection`](https://hasanarthuraltuntas.xyz/ai-music-detection)

---

### 2. 📊 Data Augmentation Toolkit
**Veri Arttırma ve İşleme Araçları**

[![Status](https://img.shields.io/badge/Status-UI_Ready-green)](https://github.com/Rtur2003/CrownCode)
[![Backend](https://img.shields.io/badge/Backend-Planned-yellow)](https://github.com/Rtur2003/CrownCode)

- **Amaç**: Araştırmacılar için veri seti oluşturma ve arttırma
- **Teknoloji**: React, Node.js, Python, librosa
- **Hedef Özellikler**:
  - ✅ Dosya yükleme UI
  - ✅ Veri tipi seçimi (ses/görüntü/metin)
  - 🔄 Audio augmentation (pitch, tempo, noise)
  - 🔄 Batch processing pipeline (planlanıyor)

**📁 Sayfa**: [`/data-manipulation`](https://hasanarthuraltuntas.xyz/data-manipulation)

---

## 🎨 Tasarım Sistemi

### 📱 Responsive Breakpoints

```css
Mobile:   320px - 767px   (Primary focus)
Tablet:   768px - 1023px
Desktop:  1024px - 1439px
Large:    1440px+
```

### 🎨 Renk Paleti

```css
:root {
  /* Brand Colors */
  --primary-gold: #FFD700;      /* CrownCode altın */
  --primary-blue: #1E40AF;      /* Vurgu rengi */
  --primary-dark: #1F2937;      /* Arka plan */

  /* Status Colors */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
}
```

### 🖼️ Tasarım Prensipleri

- **Clarity**: Minimalist ve net arayüz
- **Accessibility**: WCAG 2.1 AA uyumlu
- **Performance**: <2s sayfa yükleme süresi
- **Mobile-First**: Öncelik mobil kullanıcı deneyimi

---

## 🚀 Proje Yapısı

```
CrownCode/
├── platform/                    # Ana Next.js platformu
│   ├── pages/                   # Route sayfaları
│   │   ├── index.tsx           # Ana sayfa
│   │   ├── ai-music-detection/ # AI müzik modülü
│   │   └── data-manipulation/  # Veri işleme modülü
│   ├── components/             # React komponentleri
│   │   ├── Layout/            # Layout bileşenleri
│   │   ├── Home/              # Ana sayfa bileşenleri
│   │   ├── Navigation/        # Navigasyon
│   │   └── MLToolkit/         # ML araç bileşenleri
│   ├── styles/                # CSS dosyaları
│   │   ├── base/              # Temel stiller
│   │   ├── components/        # Komponent stilleri
│   │   └── globals.css        # Global CSS
│   ├── context/               # React Context
│   ├── hooks/                 # Custom hooks
│   └── utils/                 # Yardımcı fonksiyonlar
├── backend/                   # FastAPI Backend & AI Model
│   ├── app/                   # Uygulama kodu
│   ├── models/                # wav2vec2 modelleri
│   └── Dockerfile             # Container yapılandırması
├── mobile/                    # Android Native Uygulama
│   ├── app/                   # Android kaynak kodları
│   └── build.gradle           # Gradle yapılandırması
├── tools/                     # Yardımcı Araçlar
│   ├── audio-analysis/        # Ses analiz scriptleri
│   └── dataset/               # Veri seti araçları
├── docs/                      # Dokümantasyon
├── assets/                    # Medya dosyaları
└── .github/                   # GitHub Actions & Templates
```

---

## 💻 Geliştirme Ortamı

### 📋 Gereksinimler

- **Node.js**: 20.18.1+ LTS
- **npm**: 10.9.2+
- **Git**: 2.40+
- **Python**: 3.11+ (model eğitimi için)

### 🛠️ Kurulum

```bash
# Repository'yi klonla
git clone https://github.com/Rtur2003/CrownCode.git
cd CrownCode

# Geliştirme branch'ine geç
git checkout geliştirme

# Platform bağımlılıklarını yükle
cd platform
npm install

# Development server'ı başlat
npm run dev
```

Platform `http://localhost:3000` adresinde çalışacaktır.

### 🔧 Mevcut Komutlar

```bash
# Platform dizininde
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint kontrolü
npm run type-check   # TypeScript tip kontrolü
```

---

## 📱 Mobil Uyumluluk

### ✅ Mobil Özellikleri

- **Touch-Optimized**: 44px minimum dokunma alanı
- **Responsive Grid**: Tüm ekran boyutlarında uyumlu
- **Mobile Navigation**: Hamburger menü ve bottom nav
- **Fast Loading**: Optimize edilmiş asset yükleme
- **PWA Ready**: Progressive Web App hazır altyapı

### ⚠️ Mobil Kısıtlamalar

Bazı özellikler mobilde sınırlı çalışabilir:

- **Büyük Dosya İşleme**: 50MB+ dosyalar için masaüstü önerilir
- **CPU-Yoğun İşlemler**: Model inference mobilde yavaş olabilir
- **Batch Processing**: Çoklu dosya işleme masaüstüde daha verimli

---

## 🌍 Canlı Platform

### 🔗 Erişim

- **Ana Platform**: [hasanarthuraltuntas.xyz](https://hasanarthuraltuntas.xyz)
- **GitHub Repo**: [github.com/Rtur2003/CrownCode](https://github.com/Rtur2003/CrownCode)
- **Geliştirme Branch**: [geliştirme](https://github.com/Rtur2003/CrownCode/tree/geliştirme)

### 📊 Branch Yapısı

- **`master`**: Production-ready kararlı sürüm
- **`geliştirme`**: Aktif geliştirme branch'i
- **`arayüz`**: UI/UX odaklı geliştirmeler

---

## 🔮 Geliştirme Yol Haritası

### 📅 Q1 2025 (Şubat - Nisan)

- [x] Platform altyapısı kurulumu
- [x] Responsive UI tasarımı
- [x] Çoklu dil desteği
- [ ] AI model training pipeline
- [ ] Veri seti toplama otomasyonu

### 📅 Q2 2025 (Mayıs - Temmuz)

- [ ] YouTube/Spotify/SoundCloud entegrasyonu
- [ ] Audio augmentation backend
- [ ] Real-time inference API
- [ ] Model deployment

### 📅 Q3 2025 (Ağustos - Ekim)

- [ ] Production deployment
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Tez teslimi

---

## 🤝 Katkıda Bulunma

Bu proje Düzce Üniversitesi bitirme projesi kapsamında geliştirilmektedir. Katkılar ve geri bildirimler için:

- **Issues**: [GitHub Issues](https://github.com/Rtur2003/CrownCode/issues)
- **Pull Requests**: `geliştirme` branch'ine PR açabilirsiniz
- **Discussions**: Sorularınız için GitHub Discussions

---

## 📞 İletişim

### 👨‍💻 Geliştirici

**Hasan Arthur Altuntaş**
- **GitHub**: [@Rtur2003](https://github.com/Rtur2003)
- **Email**: contact@hasanarthuraltuntas.xyz
- **Website**: [hasanarthuraltuntas.xyz](https://hasanarthuraltuntas.xyz)
- **LinkedIn**: [Hasan Arthur Altuntaş](https://linkedin.com/in/hasanarthuraltuntas)

---

## 📜 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [`LICENSE`](LICENSE) dosyasına bakınız.

---

<div align="center">

**🏆 Düzce Üniversitesi Bilgisayar Mühendisliği**
**Bitirme Projesi 2025-2026**

[![Düzce University](https://img.shields.io/badge/🏫_Düzce_University-Computer_Engineering-blue?style=for-the-badge)](https://duzce.edu.tr)
[![Academic Year](https://img.shields.io/badge/📅_Academic_Year-2025--2026-green?style=for-the-badge)](#)
[![Status](https://img.shields.io/badge/🚀_Status-In_Development-yellow?style=for-the-badge)](#)

**Made with ❤️ by Hasan Arthur Altuntaş**

</div>