# CrownCode Analysis Report - Tur 3 (2026-03-04)

## Scope

- Sadece analiz yapildi, uygulama kodu degistirilmedi.
- Incelenen alanlar:
  - CI/Workflow: `.github/workflows/*.yml`
  - Ownership/automation: `.github/CODEOWNERS`, `.github/dependabot.yml`
  - Frontend gateway/types: `platform/hooks/analysisGateway.ts`, `platform/hooks/analysisTypes.ts`
  - Backend contract + route parity: `docs/BACKEND_CONTRACT.md`, `backend/app/routes/youtube.py`
  - Teknik dokumanlar: `docs/technical/*.md`
  - Plan dosyasi: `docs/notes/ROLLING_TASK_PLAN.md`

## Verified Status

- Tur 2'de bildirilen ana degisikliklerin cogu mevcut.
- Ancak "tamamlandi" isaretli bazi maddeler fiilen hala acik (dokuman drift + kontrat drift).

## Findings (Priority Order)

### P0 - Plan/Reality Drift

1. `ROLLING_TASK_PLAN.md` icindeki bazi `[x]` maddeler gercekle uyumsuz.
- Kanit: `docs/notes/ROLLING_TASK_PLAN.md:63`
- Kanit: `docs/notes/ROLLING_TASK_PLAN.md:64`
- Buna ragmen stale referanslar hala var:
  - `docs/technical/MOBILE_RESPONSIVE_DESIGN.md:552`
  - `docs/technical/PLATFORM_GITHUB_CONFIG.md:45`
  - `docs/technical/PLATFORM_GITHUB_CONFIG.md:254`
  - `docs/technical/PLATFORM_GITHUB_CONFIG.md:258`
  - `docs/technical/PLATFORM_GITHUB_CONFIG.md:275`
  - `docs/technical/PLATFORM_GITHUB_CONFIG.md:295`
  - `docs/technical/PLATFORM_GITHUB_CONFIG.md:298`
  - `docs/technical/PLATFORM_GITHUB_CONFIG.md:301`
  - `docs/technical/PLATFORM_GITHUB_CONFIG.md:304`
  - `docs/technical/PLATFORM_GITHUB_CONFIG.md:644`
  - `docs/technical/PLATFORM_GITHUB_CONFIG.md:647`

Etkisi:
- Claude tarafinda "tamamlanmis" varsayilan isler gercekte acik kalabilir.

### P1 - Contract/Behavior Mismatch

1. Backend kontrat dokumani "iki backend de `/api/analyze` kontratina uyar" diyor, core backend bu endpointi sunmuyor.
- Kanit: `docs/BACKEND_CONTRACT.md:4`
- Kanit: `docs/BACKEND_CONTRACT.md:20`
- Kanit: `backend/app/routes/youtube.py:17` (`/api/youtube/analyze`)

Etkisi:
- Mimari beklenti belirsizlesir; yeni gelistirici yanlis backend'i hedefleyebilir.

2. Gateway hata map'i anlamsal olarak hatali:
- `unsupported_source` -> `invalidYouTubeUrl`
- Kanit: `platform/hooks/analysisGateway.ts:63`

Etkisi:
- Kullaniciya yanlis hata nedeni gosterilebilir.

3. Deployment default bilgisinde drift:
- Kod default: server
  - `platform/next.config.js:2`
- Env ornekleri default: static
  - `.env.example:18`
  - `platform/.env.example:17`
- Teknik dokuman "varsayilan static" diyor:
  - `docs/technical/PROJECT_ROUTING_SYSTEM.md:66`

Etkisi:
- Ortamlar arasi davranis farki, debug ve release karisikligi.

### P2 - Workflow/Dokuman Tutarlilik ve Hijyen

1. `engineering-standards.yml` yorumu "core + HF backend" diyor ama grep sadece `backend/` izliyor.
- Kanit: `.github/workflows/engineering-standards.yml:157`
- Kanit: `.github/workflows/engineering-standards.yml:158`
- Kanit: `.github/workflows/engineering-standards.yml:172`

2. `ci.yml` lighthouse job'inda localhost URL'leri var, acik bir server start adimi yok.
- Kanit: `.github/workflows/ci.yml:154`
- Kanit: `.github/workflows/ci.yml:158`
- Kanit: `.github/workflows/ci.yml:159`
- Kanit: `.github/workflows/ci.yml:160`

Not:
- Bu madde davranissal risk olarak isaretlendi; LHCI config/runner davranisina gore fail edebilir.

3. Repo hijyen:
- `.coverage` dosyasi untracked.
- Kanit: `git status --short` cikti.
- `.gitignore` sadece `coverage/` dizinini ignore ediyor, `.coverage` yok.
  - Kanit: `.gitignore:25`
  - Kanit: `.gitignore:82`

## Claude Uygulama Fazlari (Tur 3)

### Faz 0 - Plan Dogrulama ve Sifirlama (P0)

- `docs/notes/ROLLING_TASK_PLAN.md` yeni tura gore resetle.
- Yanlis `[x]` maddeleri kaldir, sadece gercek durum yaz.
- Bu raporu kaynak kabul et.

Kabul kriteri:
- Plan dosyasinda "tamamlandi" denilen her madde repo icinde dogrulanabilir olmali.

### Faz 1 - Dokuman Drift Temizligi (P0/P1)

- `docs/technical/PLATFORM_GITHUB_CONFIG.md` icindeki `projects/*`, `project-ci.yml`, `platform-ci.yml` kalintilarini mevcut yapiyla uyumlu hale getir.
- `docs/technical/MOBILE_RESPONSIVE_DESIGN.md` icindeki `/projects` nav ornegini aktif route setine uygun hale getir.
- `docs/technical/PROJECT_ROUTING_SYSTEM.md` deployment default bilgisini kodla uyumlu hale getir.

Kabul kriteri:
- `rg -n "projects/|/projects|project-ci.yml|platform-ci.yml" docs/technical/*.md` yalnizca bilincli "deprecated/history" baglaminda sonuc donmeli.

### Faz 2 - Contract ve Error Semantics (P1)

- Mimari karar:
  - Secenek A: Core backend'e `/api/analyze` adaptor ekle.
  - Secenek B (onerilen): Dokumani netlestir, `/api/analyze` kontratinin sadece advanced backend tarafinda oldugunu acik yaz.
- `platform/hooks/analysisGateway.ts` icinde `unsupported_source` map'ini ayri bir frontend error code'a tasi.
- `platform/hooks/analysisTypes.ts` + locale hata mesajlarini yeni code ile parity guncelle.

Kabul kriteri:
- `unsupported_source` artik `invalidYouTubeUrl` olarak maplenmemeli.

### Faz 3 - Workflow ve Hijyen (P2)

- `.github/workflows/engineering-standards.yml` yorum/metinlerini gercek grep davranisiyla uyumlu hale getir.
- `.github/workflows/ci.yml` lighthouse job'i icin server start stratejisini explicitlestir (`staticDistDir` veya `startServerCommand`).
- `.gitignore` icine `.coverage` ekle veya dosyayi bilincli olarak temizle.

Kabul kriteri:
- Workflow dosyalarinda yorum ve davranis birbiriyle celismemeli.

## Validation Commands (Claude)

1. `cmd /c npm --prefix platform run lint`
2. `cmd /c npm --prefix platform run type-check`
3. `cmd /c npm --prefix platform test -- --runInBand`
4. `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"`
5. `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"`

## Expected Deliverable from Claude

- Dosya bazli degisiklik ozeti.
- Hangi bulgunun hangi commit/degisiklikle kapatildigi.
- Kalan teknik borclar (varsa) ve neden ertelendigi.
