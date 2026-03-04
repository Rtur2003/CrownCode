# 🔧 CrownCode Platform - Ana Platform GitHub Yapılandırması

## 📁 Repository Yapısı

```
CrownCode/
├── README.md                           # Ana platform README
├── LICENSE                             # MIT License
├── SECURITY.md                         # Guvenlik politikalari
├── CONTRIBUTING.md                     # Katki rehberi
├── Makefile                            # Dev komutlari (lint, test, build)
├── .gitignore                          # Global gitignore
├── .env.example                        # Environment template
│
├── .github/                            # GitHub Configurations
│   ├── workflows/
│   │   ├── ci.yml                     # CI/CD Pipeline (lint, build, deploy)
│   │   └── engineering-standards.yml  # PR quality gates
│   │
│   ├── ISSUE_TEMPLATE/                # Issue templates
│   ├── PULL_REQUEST_TEMPLATE.md       # PR template
│   ├── CODEOWNERS                     # Code owners
│   ├── dependabot.yml                 # Dependabot config
│   └── ENGINEERING_STANDARDS.md       # Muhendislik standartlari
│
├── platform/                           # Next.js frontend (Pages Router)
│   ├── pages/                         # Route'lar
│   ├── hooks/                         # React hook'lari
│   ├── components/                    # UI componentleri
│   ├── styles/                        # CSS Modules
│   ├── locales/                       # i18n (en.json, tr.json)
│   ├── data/                          # Statik veri
│   ├── public/                        # Static assets
│   └── __tests__/                     # Jest testleri
│
├── backend/                            # Core backend (minimal FastAPI)
│   └── app/                           # health, youtube analysis
│
├── docs/                               # Dokumantasyon
│   ├── notes/                         # Rolling plan, analiz raporlari
│   └── technical/                     # Teknik referanslar
│
└── scripts/                            # Utility scripts
```

> **Not:** `hf-crowncode-backend/` ayri bir repo olarak yonetilir ve `.gitignore`'da ignore edilir.
> Detaylar: `docs/BACKEND_CONTRACT.md`

## GitHub Actions Workflows

Repoda iki aktif workflow var:

1. **`.github/workflows/ci.yml`** — CI/CD Pipeline
   - `quality-check`: TypeScript type check + ESLint
   - `build`: Server mode build (varsayilan)
   - `build-static`: Static export build (`DEPLOYMENT_TARGET=static`)
   - `security`: npm audit + Trivy
   - `lighthouse`: PR'larda performans testi
   - `deploy`: Netlify'a static build deploy (master branch)

2. **`.github/workflows/engineering-standards.yml`** — PR Quality Gates
   - Branch name validation
   - Commit message validation (commitlint)
   - Atomic commit check
   - Python-first compliance (backend changes)
   - PR template validation

Detaylar icin dogrudan workflow dosyalarina bakiniz.

## 📝 Issue Templates

### 🐛 Bug Report Template

```yaml
# .github/ISSUE_TEMPLATE/bug_report.yml
name: 🐛 Bug Report
description: Report a bug to help us improve CrownCode Platform
title: '[BUG] '
labels: ['bug', 'needs-triage']
assignees: ['Rtur2003']

body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!

  - type: dropdown
    id: project
    attributes:
      label: Affected Project
      description: Which project is affected by this bug?
      options:
        - Platform (Ana platform)
        - AI Music Detection
        - Data Manipulation
        - ML Toolkit
        - Multiple projects
        - Not sure
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear and concise description of what the bug is.
      placeholder: Tell us what you see!
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. Scroll down to '...'
        4. See error
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: A clear and concise description of what you expected to happen.
    validations:
      required: true

  - type: dropdown
    id: browsers
    attributes:
      label: Browser
      description: What browser are you using?
      multiple: true
      options:
        - Chrome
        - Firefox
        - Safari
        - Edge
        - Other

  - type: dropdown
    id: device
    attributes:
      label: Device Type
      description: What device are you using?
      options:
        - Desktop
        - Mobile
        - Tablet

  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Add any other context about the problem here.
```

### ✨ Feature Request Template

```yaml
# .github/ISSUE_TEMPLATE/feature_request.yml
name: ✨ Feature Request
description: Suggest a new feature for CrownCode Platform
title: '[FEATURE] '
labels: ['enhancement', 'needs-discussion']

body:
  - type: dropdown
    id: project
    attributes:
      label: Target Project
      description: Which project should this feature be added to?
      options:
        - Platform (Ana platform)
        - AI Music Detection
        - Data Manipulation
        - ML Toolkit
        - New Project
    validations:
      required: true

  - type: textarea
    id: problem
    attributes:
      label: Problem Statement
      description: What problem does this feature solve?
      placeholder: I'm always frustrated when...
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: A clear and concise description of what you want to happen.
    validations:
      required: true

  - type: dropdown
    id: priority
    attributes:
      label: Priority Level
      description: How important is this feature?
      options:
        - Low
        - Medium
        - High
        - Critical
    validations:
      required: true

  - type: checkboxes
    id: mobile-support
    attributes:
      label: Mobile Support
      description: Should this feature work on mobile devices?
      options:
        - label: Full mobile support required
        - label: Limited mobile support acceptable
        - label: Desktop only feature
```

### 🚀 Project Proposal Template

```yaml
# .github/ISSUE_TEMPLATE/project_proposal.yml
name: 🚀 New Project Proposal
description: Propose a new project for CrownCode Platform
title: '[PROJECT] '
labels: ['new-project', 'needs-discussion']

body:
  - type: input
    id: project-name
    attributes:
      label: Project Name
      description: What should this project be called?
      placeholder: my-awesome-project
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: Project Description
      description: Detailed description of the proposed project
    validations:
      required: true

  - type: textarea
    id: technologies
    attributes:
      label: Technologies
      description: What technologies would be used?
      placeholder: Next.js, Python, TensorFlow, etc.
    validations:
      required: true

  - type: textarea
    id: features
    attributes:
      label: Core Features
      description: List the main features this project would have
    validations:
      required: true

  - type: dropdown
    id: timeline
    attributes:
      label: Estimated Timeline
      description: How long would this project take to develop?
      options:
        - 1-2 weeks
        - 1 month
        - 2-3 months
        - 3-6 months
        - 6+ months
    validations:
      required: true
```

## 🔍 Pull Request Templates

### 🔄 Default PR Template

```markdown
# .github/PULL_REQUEST_TEMPLATE/default.md

## 📋 Pull Request Açıklaması

### 🎯 Değişiklik Türü
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 💥 Breaking change
- [ ] 📚 Documentation update
- [ ] 🔧 Configuration change
- [ ] 🧪 Test update

### 📦 Etkilenen Proje
- [ ] Platform (Ana platform)
- [ ] AI Music Detection
- [ ] Data Manipulation
- [ ] ML Toolkit
- [ ] Documentation
- [ ] CI/CD

### 📝 Açıklama
Yapılan değişikliklerin kısa açıklaması:

### 🧪 Test Planı
- [ ] Unit testler yazıldı/güncellendi
- [ ] Integration testler çalıştırıldı
- [ ] E2E testler çalıştırıldı
- [ ] Manuel test yapıldı

### 📱 Mobil Uyumluluk
- [ ] Mobil cihazlarda test edildi
- [ ] Responsive tasarım kontrol edildi
- [ ] Touch interaction test edildi

### ✅ Checklist
- [ ] Kod lint kurallarına uygun
- [ ] TypeScript hataları yok
- [ ] Tests pass
- [ ] Documentation güncellendi
- [ ] CHANGELOG.md güncellendi (eğer gerekli ise)

### 🖼️ Ekran Görüntüleri (Eğer uygulanabilirse)

### 📋 İlgili Issue'lar
Closes #
Related to #
```

## 🔐 Security Configuration

### 🛡️ CODEOWNERS

```
# .github/CODEOWNERS

# Global ownership
* @Rtur2003

# Platform specific
/platform/ @Rtur2003
/docs/ @Rtur2003

# Backend
/backend/ @Rtur2003

# GitHub configuration
/.github/ @Rtur2003
/scripts/ @Rtur2003

# Security files
/SECURITY.md @Rtur2003
/LICENSE @Rtur2003
```

### 🤖 Dependabot Configuration

```yaml
# .github/dependabot.yml
version: 2
updates:
  # Platform dependencies
  - package-ecosystem: "npm"
    directory: "/platform"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
      - "platform"

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "github-actions"
```

### 🏷️ Auto Labeler

```yaml
# .github/labeler.yml
platform:
  - platform/**

ai-music-detection:
  - projects/ai-music-detection/**

data-manipulation:
  - projects/data-manipulation/**

documentation:
  - docs/**
  - "**/*.md"

github-actions:
  - .github/workflows/**

tests:
  - "**/*.test.*"
  - "**/*.spec.*"
  - tests/**

dependencies:
  - package*.json
  - yarn.lock
  - pnpm-lock.yaml
```

## 📊 Repository Settings

### 🔧 Branch Protection Rules

```yaml
# Repository Settings > Branches
Main Branch Protection:
  - Require pull request reviews before merging (2 reviewers)
  - Require status checks to pass before merging
  - Require branches to be up to date before merging
  - Require conversation resolution before merging
  - Restrict pushes that create files larger than 100 MB
  - Allow force pushes: No
  - Allow deletions: No

Develop Branch Protection:
  - Require pull request reviews before merging (1 reviewer)
  - Require status checks to pass before merging
  - Allow force pushes: No
```

### 🏷️ Repository Labels

```yaml
# Label Configuration
Labels:
  # Type
  - name: "bug"
    color: "d73a4a"
    description: "Something isn't working"

  - name: "enhancement"
    color: "a2eeef"
    description: "New feature or request"

  - name: "documentation"
    color: "0075ca"
    description: "Improvements or additions to documentation"

  # Priority
  - name: "priority: low"
    color: "009800"

  - name: "priority: medium"
    color: "fbca04"

  - name: "priority: high"
    color: "ff9500"

  - name: "priority: critical"
    color: "b60205"

  # Project
  - name: "platform"
    color: "1d76db"

  - name: "ai-music-detection"
    color: "0e8a16"

  - name: "data-manipulation"
    color: "fbca04"

  # Status
  - name: "needs-triage"
    color: "ffffff"

  - name: "in-progress"
    color: "ededed"

  - name: "ready-for-review"
    color: "bfd4f2"
```

Bu GitHub yapılandırması ile CrownCode Platform platformu profesyonel bir şekilde yönetilebilecek! 🚀🔧