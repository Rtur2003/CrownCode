# CrownCode Platform

**Open-Source AI Research & Creative Tools Platform**

> **Developer:** Hasan Arthur Altuntas
> **University:** Duzce University - Computer Engineering

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Platform-blue?style=for-the-badge)](https://hasanarthuraltuntas.xyz)
[![GitHub Repo](https://img.shields.io/badge/GitHub-CrownCode-black?style=for-the-badge&logo=github)](https://github.com/Rtur2003/CrownCode)

---

## Project Overview

CrownCode is a web-based platform hosting multiple open-source projects ranging from AI-powered audio analysis to creative tools. Each project is built with modern technologies and designed for real-world use.

### Featured: AURIS - AI Music Detection Engine

AURIS uses a **Multi-Tower Detection Architecture** to distinguish AI-generated music from human-composed tracks:

```
Audio Input
    |
    +---> Tower 1: wav2vec2-base (deep audio embeddings)
    +---> Tower 2: 49 Handcrafted Features (spectral, temporal, harmonic, vocal)
    +---> Tower 3: CLAP (cross-modal audio-text similarity)
    +---> Tower 4: FST API (external spectral fakeprint detection)
    |
    v
  Meta-Classifier (RF / XGBoost / LightGBM / SVM / MLP)
    |
    v
  Final Prediction: AI-Generated vs Human-Composed
```

### All Projects

| Project | Description | Status |
|---------|-------------|--------|
| **AURIS AI Music Detection** | Multi-tower AI/human music classifier | Active |
| **ML Toolkit** | Data augmentation & processing tools | In Development |
| **Crown Fortune** | Interactive fortune wheel game | Active |
| **Crown Dreams** | Dream interpretation with AI | Active |
| **Crown Commend** | YouTube comment generator | Active |
| **Crown Vote** | Voting & polling system | In Development |

---

## Architecture

```
CrownCode/
├── platform/                    # Next.js 14 Frontend (Pages Router)
│   ├── pages/                   # Route pages (14 routes)
│   ├── components/              # React components
│   │   ├── Layout/              # MainLayout, Header, Footer
│   │   ├── Home/                # HeroSection, ProjectsSection
│   │   ├── AurisDetection/      # HeroSection, HowItWorks, AnalysisResultCard
│   │   ├── Navigation/          # HeaderNavbar, SearchModal
│   │   └── UI/                  # Toast, Skeleton, CopyButton
│   ├── styles/                  # CSS Modules + global design system
│   │   ├── base/                # variables.css, reset, typography, animations
│   │   ├── components/          # Component-specific CSS
│   │   └── pages/               # Page-specific CSS modules
│   ├── context/                 # LanguageContext, ToastContext
│   ├── hooks/                   # useFileAnalysis, useYouTubeAnalysis, etc.
│   ├── locales/                 # en.json, tr.json (full i18n)
│   ├── config/                  # product-catalog.ts
│   └── public/                  # Static assets, images, icons
├── backend/                     # FastAPI Backend
├── hf-crowncode-backend/        # HuggingFace Spaces deployment
├── DataSet/                     # AURIS training data & download scripts
│   ├── download_datasets.py     # Streaming dataset downloader
│   └── metadata.csv             # Master manifest
├── Android-App-CrownCode/       # Android native app
├── docs/                        # Documentation
│   ├── academic/                # Thesis reports (TR/EN)
│   ├── technical/               # AI_MODEL_STRATEGY, architecture docs
│   ├── guides/                  # Quick start, code examples
│   ├── community/               # Code of conduct, contributing
│   └── notes/                   # Analysis reports
├── scripts/                     # Utility scripts
└── netlify/                     # Deployment config
```

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14 (Pages Router) + React 18 + TypeScript
- **Styling:** CSS Modules + custom design token system (variables.css)
- **Animation:** Motion 12 (formerly Framer Motion) with `useReducedMotion` support
- **Icons:** Lucide React
- **i18n:** Custom LanguageContext (Turkish / English)
- **Deployment:** Netlify

### Backend & AI
- **Runtime:** Python 3.11+
- **Framework:** FastAPI (deployed on HuggingFace Spaces)
- **AI Models:** wav2vec2-base, CLAP (HTSAT-base), librosa feature extraction
- **ML:** PyTorch, scikit-learn, XGBoost, LightGBM
- **Audio Processing:** librosa, torchaudio, soundfile

### Infrastructure
- **Frontend Hosting:** Netlify (automatic builds)
- **Backend Hosting:** HuggingFace Spaces
- **SEO:** JSON-LD structured data (Organization, WebSite, SoftwareApplication, BreadcrumbList)
- **PWA:** manifest.json, service worker ready

---

## Frontend Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage - Hero + Projects showcase |
| `/ai-music-detection` | AURIS detection tool + tech stack |
| `/data-manipulation` | ML Toolkit interface |
| `/crown-fortune` | Fortune wheel game |
| `/crown-dreams` | Dream interpretation |
| `/crown-commend` | YouTube comment generator |
| `/crown-vote` | Voting system |
| `/creator-studio` | Creator tools |
| `/analysis-history` | Past analysis results |
| `/system-status` | System health dashboard |
| `/search` | Global search |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/api/health` | Health check endpoint |
| `/api/version` | Version info endpoint |

---

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+ (for backend & dataset tools)

### Setup

```bash
# Clone
git clone https://github.com/Rtur2003/CrownCode.git
cd CrownCode

# Install frontend dependencies
cd platform
npm install

# Run development server
npm run dev
# -> http://localhost:3000

# Production build
npm run build
```

### Dataset Download (optional)

```bash
cd DataSet
pip install datasets soundfile numpy
python download_datasets.py --resume
```

---

## AURIS Dataset

Training data sourced from HuggingFace via streaming download:

| Source | Type | Target |
|--------|------|--------|
| SleepyJesse/ai_music_large | AI + Human | 4,000 |
| disco-eth/AIME | AI (12 models) | 1,000 |
| marsyas/gtzan | Human (10 genres) | 1,000 |
| benjamin-paine/free-music-archive-small | Human | 1,000 |
| zuhri025/suno-audio | AI (Suno) | 500 |
| UniDataPro/real-vs-fake | Vocal deepfake | 1,000 |

All audio resampled to 16kHz mono WAV, trimmed to 30s max.

See [DataSet/README.md](./DataSet/README.md) for full details.

---

## Documentation

### Academic
- [English Academic Report](./docs/academic/ACADEMIC_PROJECT_REPORT_EN.md)
- [Turkish Academic Report](./docs/academic/AKADEMIK_PROJE_RAPORU_TR.md)
- [Thesis Summary](./docs/academic/THESIS_SUMMARY.md)

### Technical
- [AI Model Strategy](./docs/technical/AI_MODEL_STRATEGY.md) - Multi-tower architecture details
- [Modular Architecture](./docs/technical/MODULAR_ARCHITECTURE.md)
- [Technology Stack](./docs/technical/TECHNOLOGY_STACK_2025.md)
- [Deployment Config](./docs/technical/DEPLOYMENT_CONFIG.md)

### Development
- [Quick Start Guide](./docs/QUICK_START.md)
- [Development Guidelines](./docs/DEVELOPMENT_GUIDELINES.md)
- [Changelog](./docs/CHANGELOG.md)

---

## Contributing

1. Read [Development Guidelines](./docs/DEVELOPMENT_GUIDELINES.md)
2. Create a topic branch from `gelistirme`
3. Make atomic commits using conventional commit format
4. Submit a pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full details.

---

## License

MIT License - see [LICENSE](./LICENSE)

### Citation

```bibtex
@thesis{altuntas2026crowncode,
  title={Web-Based AI Music Detection and Data Manipulation Platform},
  author={Hasan Arthur Altuntas},
  institution={Duzce University},
  department={Computer Engineering},
  year={2026},
  type={Bachelor's Thesis},
  url={https://hasanarthuraltuntas.xyz}
}
```

---

## Contact

- **GitHub:** [@Rtur2003](https://github.com/Rtur2003)
- **Website:** [hasanarthuraltuntas.xyz](https://hasanarthuraltuntas.xyz)
- **Email:** contact@hasanarthuraltuntas.xyz
