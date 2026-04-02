# CrownCode Platform

**AI Destekli Arastirma ve Yaratici Araclar Platformu**

[![Live Platform](https://img.shields.io/badge/Live-Platform-brightgreen?style=for-the-badge)](https://hasanarthuraltuntas.xyz)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## Platform Genel Bakis

CrownCode, yapay zeka destekli ses analizi ve yaratici araclar icin gelistirilmis acik kaynakli bir platformdur. Moduler yapida tasarlanmis olup, mobil ve masaustu cihazlarda tam uyumluluk saglar.

> **Duzce Universitesi Bilgisayar Muhendisligi Bolumu**
> **Gelistirici:** Hasan Arthur Altuntas

---

## Aktif Projeler

### 1. AURIS - AI Muzik Tespit Sistemi

**Cok Kuleli (Multi-Tower) Yapay Zeka Tespit Motoru**

- **Mimari:** wav2vec2 + 49 Akustik Ozellik + CLAP + FST API + Meta-Classifier
- **Amac:** AI ile uretilen muzigi insan yapimi muzikten ayirt etme
- **Kaynak:** YouTube link veya dosya yukleme destegi
- **Sayfa:** [`/ai-music-detection`](https://hasanarthuraltuntas.xyz/ai-music-detection)

### 2. ML Toolkit

- **Amac:** Arastirmacilar icin veri seti olusturma ve artirma araclari
- **Sayfa:** [`/data-manipulation`](https://hasanarthuraltuntas.xyz/data-manipulation)

### 3. Crown Fortune

- **Amac:** Interaktif sans carki oyunu
- **Sayfa:** [`/crown-fortune`](https://hasanarthuraltuntas.xyz/crown-fortune)

### 4. Crown Dreams

- **Amac:** AI destekli ruya yorumlama
- **Sayfa:** [`/crown-dreams`](https://hasanarthuraltuntas.xyz/crown-dreams)

### 5. Crown Commend

- **Amac:** YouTube yorum uretici
- **Sayfa:** [`/crown-commend`](https://hasanarthuraltuntas.xyz/crown-commend)

### 6. Crown Vote

- **Amac:** Oylama ve anket sistemi
- **Sayfa:** [`/crown-vote`](https://hasanarthuraltuntas.xyz/crown-vote)

---

## Teknoloji Stack

### Frontend

- **Framework:** Next.js 14 (Pages Router) + React 18 + TypeScript
- **Stil:** CSS Modules + ozel tasarim token sistemi (variables.css)
- **Animasyon:** Framer Motion 11
- **Ikon:** Lucide React
- **i18n:** Ozel LanguageContext (Turkce / Ingilizce)
- **Deployment:** Netlify

### Backend

- **Runtime:** Python 3.11+
- **Framework:** FastAPI (HuggingFace Spaces uzerinde)
- **AI/ML:** PyTorch, wav2vec2, CLAP, librosa, scikit-learn, XGBoost

---

## Tasarim Sistemi

### Responsive Breakpoints

```css
Mobile:   320px - 767px
Tablet:   768px - 1023px
Desktop:  1024px - 1439px
Large:    1440px+
```

### Renk Sistemi

Platform ozel CSS degiskenleri kullanir (`styles/base/variables.css`):

- Gold tonlari: `--color-gold-400` ile `--color-gold-700`
- Yuzey: `--color-surface`, `--color-surface-elevated`
- Glass efektler: `--glass-bg`, `--glass-border`
- Gradientler: `--gradient-primary`

---

## Proje Yapisi

```text
platform/
├── pages/                   # Route sayfalari
│   ├── index.tsx            # Ana sayfa (Hero + Projects)
│   ├── ai-music-detection/  # AURIS tespit araci
│   ├── crown-fortune/       # Sans carki
│   ├── crown-dreams/        # Ruya yorumlama
│   ├── crown-commend/       # YouTube yorum
│   ├── crown-vote/          # Oylama
│   ├── data-manipulation/   # ML Toolkit
│   ├── creator-studio/      # Yaratici araclar
│   ├── analysis-history/    # Analiz gecmisi
│   ├── system-status/       # Sistem durumu
│   ├── search.tsx           # Arama
│   ├── privacy.tsx          # Gizlilik politikasi
│   └── terms.tsx            # Kullanim sartlari
├── components/              # React bilesenleri
│   ├── Layout/              # MainLayout, Header, Footer
│   ├── Home/                # HeroSection, ProjectsSection
│   ├── AurisDetection/      # HeroSection, HowItWorks, AnalysisResultCard
│   ├── Navigation/          # HeaderNavbar, SearchModal
│   └── UI/                  # Toast, Skeleton, CopyButton
├── styles/                  # CSS dosyalari
│   ├── base/                # variables, reset, typography, animations
│   ├── components/          # Bilesen stilleri
│   └── pages/               # Sayfa CSS modulleri
├── context/                 # LanguageContext, ToastContext
├── hooks/                   # Custom hooks
├── locales/                 # en.json, tr.json
├── config/                  # product-catalog.ts
└── public/                  # Statik dosyalar, gorseller
```

---

## Gelistirme

### Gereksinimler

- **Node.js:** 20+
- **Python:** 3.11+ (backend ve dataset araclari icin)

### Kurulum

```bash
git clone https://github.com/Rtur2003/CrownCode.git
cd CrownCode/platform
npm install
npm run dev
# -> http://localhost:3000
```

### Komutlar

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint kontrolu
```

---

## Mobil Uyumluluk

- **Touch-Optimized:** 44px minimum dokunma alani
- **Responsive Grid:** Tum ekran boyutlarinda uyumlu
- **Mobile Navigation:** Hamburger menu
- **PWA Ready:** Progressive Web App altyapisi

---

## Iletisim

**Hasan Arthur Altuntas**

- **GitHub:** [@Rtur2003](https://github.com/Rtur2003)
- **Website:** [hasanarthuraltuntas.xyz](https://hasanarthuraltuntas.xyz)
- **Email:** contact@hasanarthuraltuntas.xyz

---

## Lisans

MIT Lisansi - detaylar icin [`LICENSE`](LICENSE) dosyasina bakiniz.
