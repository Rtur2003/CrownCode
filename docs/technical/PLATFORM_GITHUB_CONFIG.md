# 🔧 DevForge Suite - Ana Platform GitHub Yapılandırması

## 📁 Repository Yapısı

```
DevForge-Suite-with-Rthur/
├── 📋 README.md                        # Ana platform README
├── 📜 LICENSE                          # MIT License
├── 🔐 SECURITY.md                      # Güvenlik politikaları
├── 🤝 CONTRIBUTING.md                  # Katkı rehberi
├── 📝 CHANGELOG.md                     # Değişiklik kayıtları
├── ⚙️ package.json                     # Platform dependencies
├── 🚫 .gitignore                       # Global gitignore
├── 🔧 .env.example                     # Environment template
│
├── 🔄 .github/                         # GitHub Configurations
│   ├── workflows/                      # GitHub Actions
│   │   ├── platform-ci.yml            # Platform CI/CD
│   │   ├── project-ci.yml              # Individual project CI
│   │   ├── security-scan.yml           # Security scanning
│   │   ├── deploy-staging.yml          # Staging deployment
│   │   ├── deploy-production.yml       # Production deployment
│   │   └── auto-assign.yml             # Auto-assign reviewers
│   │
│   ├── ISSUE_TEMPLATE/                 # Issue templates
│   │   ├── bug_report.yml              # Bug report template
│   │   ├── feature_request.yml         # Feature request template
│   │   ├── project_proposal.yml        # New project proposal
│   │   └── question.yml                # Question template
│   │
│   ├── PULL_REQUEST_TEMPLATE/          # PR templates
│   │   ├── default.md                  # Default PR template
│   │   ├── feature.md                  # Feature PR template
│   │   ├── bugfix.md                   # Bugfix PR template
│   │   └── project.md                  # New project PR template
│   │
│   ├── CODEOWNERS                      # Code owners
│   ├── dependabot.yml                  # Dependabot config
│   └── labeler.yml                     # Auto-labeling config
│
├── 📚 docs/                            # Platform documentation
├── 🎨 assets/                          # Shared assets
├── 🔧 scripts/                         # Utility scripts
├── 🧪 tests/                           # Platform tests
└── 📦 projects/                        # Individual projects
    ├── ai-music-detection/
    ├── data-manipulation/
    └── ml-toolkit/
```

## 🔄 GitHub Actions Workflows

### 🏗️ Platform CI/CD Pipeline

```yaml
# .github/workflows/platform-ci.yml
name: 🚀 Platform CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'platform/**'
      - '.github/workflows/platform-ci.yml'
  pull_request:
    branches: [main]
    paths:
      - 'platform/**'

env:
  NODE_VERSION: '20.18.1'
  PNPM_VERSION: '8.15.0'

jobs:
  # Code Quality
  quality:
    name: 🔍 Code Quality
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          cache-dependency-path: platform/pnpm-lock.yaml

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: cd platform && pnpm install --frozen-lockfile

      - name: Type check
        run: cd platform && pnpm type-check

      - name: Lint
        run: cd platform && pnpm lint

      - name: Format check
        run: cd platform && pnpm format:check

  # Security Scan
  security:
    name: 🛡️ Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: './platform'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

  # Unit Tests
  test:
    name: 🧪 Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: cd platform && pnpm install --frozen-lockfile

      - name: Run tests
        run: cd platform && pnpm test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          directory: ./platform/coverage
          flags: platform
          name: platform-coverage

  # Build
  build:
    name: 🏗️ Build
    runs-on: ubuntu-latest
    needs: [quality, test]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: cd platform && pnpm install --frozen-lockfile

      - name: Build application
        run: cd platform && pnpm build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: platform-build
          path: platform/.next

  # Deploy to Staging
  deploy-staging:
    name: 🚀 Deploy Staging
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: platform-build
          path: platform/.next

      - name: Deploy to Vercel Staging
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_STAGING_PROJECT_ID }}
          working-directory: ./platform

  # Deploy to Production
  deploy-production:
    name: 🚀 Deploy Production
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: platform-build
          path: platform/.next

      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./platform

      - name: Update deployment status
        run: |
          echo "✅ Production deployment successful!"
          echo "🌐 URL: https://devforge-suite.com"
```

### 🔧 Project-Specific CI/CD

```yaml
# .github/workflows/project-ci.yml
name: 📦 Project CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'projects/**'
  pull_request:
    branches: [main]
    paths:
      - 'projects/**'

jobs:
  detect-changes:
    name: 🔍 Detect Changed Projects
    runs-on: ubuntu-latest
    outputs:
      projects: ${{ steps.changes.outputs.projects }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Detect changed projects
        id: changes
        run: |
          CHANGED_PROJECTS=$(git diff --name-only HEAD~1 HEAD | grep '^projects/' | cut -d/ -f2 | sort -u | jq -R -s -c 'split("\n")[:-1]')
          echo "projects=$CHANGED_PROJECTS" >> $GITHUB_OUTPUT

  build-projects:
    name: 🏗️ Build Projects
    runs-on: ubuntu-latest
    needs: detect-changes
    if: needs.detect-changes.outputs.projects != '[]'
    strategy:
      matrix:
        project: ${{ fromJson(needs.detect-changes.outputs.projects) }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.18.1'
          cache: 'npm'
          cache-dependency-path: projects/${{ matrix.project }}/package-lock.json

      - name: Install dependencies
        run: cd projects/${{ matrix.project }} && npm ci

      - name: Run tests
        run: cd projects/${{ matrix.project }} && npm test

      - name: Build project
        run: cd projects/${{ matrix.project }} && npm run build

      - name: Deploy project (if main branch)
        if: github.ref == 'refs/heads/main'
        run: |
          echo "Deploying ${{ matrix.project }} to production..."
          # Project-specific deployment logic
```

## 📝 Issue Templates

### 🐛 Bug Report Template

```yaml
# .github/ISSUE_TEMPLATE/bug_report.yml
name: 🐛 Bug Report
description: Report a bug to help us improve DevForge Suite
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
description: Suggest a new feature for DevForge Suite
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
description: Propose a new project for DevForge Suite
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

# Project specific
/projects/ai-music-detection/ @Rtur2003
/projects/data-manipulation/ @Rtur2003
/projects/ml-toolkit/ @Rtur2003

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

  # AI Music Detection project
  - package-ecosystem: "npm"
    directory: "/projects/ai-music-detection"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "ai-music-detection"

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

Bu GitHub yapılandırması ile DevForge Suite platformu profesyonel bir şekilde yönetilebilecek! 🚀🔧