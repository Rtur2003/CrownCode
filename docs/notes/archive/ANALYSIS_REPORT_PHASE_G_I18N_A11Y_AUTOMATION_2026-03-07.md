# CrownCode Phase G Analysis (2026-03-07)

## Scope

- Bu fazda sadece analiz yapildi, kod degisikligi yapilmadi.
- Odak:
  - i18n kalite kapisi (locale parity + placeholder parity + hardcoded fallback borcu)
  - semantic accessibility audit otomasyonu (dialog/landmark/aria kalite kapisi)
  - CI zincirinde zorunlu quality gate bosluklari

## Validation Snapshot

- `cmd /c npm --prefix platform run lint` -> **passed**
- `cmd /c npm --prefix platform run type-check` -> **passed**
- `cmd /c npm --prefix platform test -- --runInBand` -> **passed** (2 suite / 16 test)
- `cmd /c npm --prefix platform run build` -> **passed**
- `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"` -> **passed** (beklenen static export API warning)

## P0 Findings (Critical)

1. Telemetry contract kirik: frontend beacon endpointleri yok.
- Kanit: `platform/pages/_app.tsx:129` -> `navigator.sendBeacon('/api/vitals', body)`
- Kanit: `platform/components/ErrorBoundary/ErrorBoundary.tsx:49` -> `navigator.sendBeacon('/api/errors', body)`
- Kanit: `platform/pages/api/version.ts:65` -> `webVitals: true`
- Kanit: `platform/pages/api/` sadece `fortune-counter.ts`, `health.ts`, `version.ts` iceriyor (vitals/errors route yok).
- Etki:
  - Production telemetry claim'i gercekte 404'a duser.
  - Observability false-positive: endpoint "varmis gibi" raporlanir.

2. CI'da i18n/a11y quality gate yok.
- Kanit: `.github/workflows/ci.yml:11`, `.github/workflows/ci.yml:42`, `.github/workflows/ci.yml:73`, `.github/workflows/ci.yml:108`, `.github/workflows/ci.yml:132`, `.github/workflows/ci.yml:153`, `.github/workflows/ci.yml:198` (mevcut joblar: quality/build/build-static/backend/security/lighthouse/deploy).
- Kanit: test seti sadece `platform/__tests__/pages/smoke.test.tsx` ve `platform/__tests__/hooks/analysisGateway.test.ts`.
- Kanit: `platform/package.json:44`-`platform/package.json:62` test toolchain var, fakat a11y assertion araclari yok (`jest-axe` vb. yok).
- Etki:
  - Locale bozulmasi veya aria regression'lari merge oncesi fail etmez.
  - "Hardcoded text yasagi" policy'si otomasyonla enforce edilmiyor.

## P1 Findings (High)

1. Locale placeholder sozlesmesi bozuk (Crown Dreams).
- Kanit: `platform/locales/en.json:775` -> `"Appears in {{count}} dreams"`
- Kanit: `platform/locales/tr.json:775` -> `"ruyada goruldu"` (placeholder yok)
- Kanit: `platform/pages/crown-dreams/index.tsx:595` -> `` `${pattern.frequency} ${cd.patterns.appearsIn}` ``
- Etki:
  - EN'de metin hatali cikar (`5 Appears in {{count}} dreams`).
  - TR/EN davranis semantigi ayrisir.

2. Shared UI katmaninda hardcoded aria/title metinleri suruyor.
- Kanit: `platform/components/Layout/Header.tsx:68`, `platform/components/Layout/Header.tsx:129`
- Kanit: `platform/components/Layout/Footer.tsx:72`, `platform/components/Layout/Footer.tsx:81`, `platform/components/Layout/Footer.tsx:88`
- Kanit: `platform/components/Search/SearchModal.tsx:91`
- Kanit: `platform/components/KeyboardShortcuts/ShortcutsModal.tsx:111`
- Kanit: `platform/components/ExternalLink/ExternalLinkWarning.tsx:122`
- Kanit: `platform/components/UI/Toast/Toast.tsx:65`
- Kanit: `platform/pages/ai-music-detection/index.tsx:381`, `platform/pages/ai-music-detection/index.tsx:382`
- Etki:
  - Dil degistiginde yardimci metinler karisik kalir.
  - a11y consistency test edilmedigi icin regression riski yuksek.

3. Fallback borcu aktif: locale key eksigi "sessizce" hardcoded stringe dusuyor.
- Kanit: `platform/hooks/useSearch.ts:31`, `platform/hooks/useSearch.ts:37`, `platform/hooks/useSearch.ts:56`, `platform/hooks/useSearch.ts:64`
- Kanit: `platform/components/Search/SearchModal.tsx:73`, `platform/components/Search/SearchModal.tsx:82`
- Kanit: `platform/components/CrownVote/DownloadSection.tsx:63`, `platform/components/CrownVote/DownloadSection.tsx:84`
- Etki:
  - Parity bozulmasi gizlenir, testte fark edilmez.
  - Lokalizasyon borcu buyur.

4. Modal a11y semantigi minimal seviyede; focus-management kalite kapisi yok.
- Kanit: `platform/components/Search/SearchModal.tsx:65`, `platform/components/KeyboardShortcuts/ShortcutsModal.tsx:93`, `platform/components/ExternalLink/ExternalLinkWarning.tsx:110` (`role=dialog`, `aria-modal` var).
- Inference:
  - Kodda focus trap/return-focus dogrulamasi icin test bulunmuyor.
  - `aria-describedby` standardi sistematik uygulanmiyor.
- Etki:
  - Klavye ve ekran okuyucu deneyiminde regressions kolayca kacabilir.

## P2 Findings (Medium)

1. Landmark semantigi tartismali: Hero `role="banner"`.
- Kanit: `platform/components/Home/HeroSection.tsx:113`
- Etki:
  - Sayfada birden fazla banner landmark olusabilir (header zaten implicit banner).

2. Global dil attribute hala statik.
- Kanit: `platform/pages/_document.tsx:5` -> `<Html lang="tr">`
- Kanit: `platform/context/LanguageContext.tsx:24`, `platform/context/LanguageContext.tsx:35` (dil sadece localStorage tabanli).
- Etki:
  - EN modunda document `lang` ile gercek dil ayrisabilir.

## Claude Task Pack (Phase G)

1. P0 - Telemetry contract'i gercekle
- `platform/pages/api/vitals.ts` ve `platform/pages/api/errors.ts` endpointlerini ekle (JSON body, method guard, size guard, no-store).
- `platform/pages/api/version.ts` icindeki `features.webVitals` bayragini endpoint mevcudiyeti ve env'e bagli deterministic modele cek.
- En az unit/smoke test ekle: POST success + non-POST 405.

2. P0 - CI'ya i18n/a11y kalite kapisi ekle
- `platform/scripts/check-locale-parity.mjs`:
  - en/tr key parity
  - placeholder parity (`{count}` / `{{count}}`) kontrolu
- `platform/scripts/check-hardcoded-ui-text.mjs`:
  - `aria-label`, `title`, belirli fallback patternleri icin allowlist tabanli denetim
- `.github/workflows/ci.yml` icine `i18n-a11y-gate` job ekle; PR'larda zorunlu calissin.

3. P1 - Crown Dreams placeholder contract duzelt
- `crownDreams.patterns.appearsIn` anahtarini her iki dilde ayni placeholder semantigine cek.
- `platform/pages/crown-dreams/index.tsx:595` string birlestirme yerine templating helper kullan.

4. P1 - Hardcoded aria/title cleanup
- Header/Footer/SearchModal/Shortcuts/ExternalLink/Toast/AI upload satirlarindaki sabit etiketleri locale key'e tasi.
- `|| '...'` fallbacklerini kritik pathlerde kaldir; key eksigini CI fail ile yakala.

5. P1 - Semantic a11y test paketi
- `@testing-library/react` + `jest-axe` ile minimum dialog/landmark testleri ekle:
  - SearchModal
  - ShortcutsModal
  - ExternalLinkWarning
  - Home landmarks
- Focus-trap + escape + return-focus davranislarini assert et.

6. P2 - Dil/landmark son temizligi
- `Html lang` + runtime locale senkronunu tek modele cek.
- Hero landmark rolunu WCAG/ARIA landmark kurallarina gore sadele.

## Verification Targets (Claude)

1. `cmd /c npm --prefix platform run lint`
2. `cmd /c npm --prefix platform run type-check`
3. `cmd /c npm --prefix platform test -- --runInBand`
4. `cmd /c npm --prefix platform run build`
5. `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"`
6. `cmd /c npm --prefix platform run i18n:check` (yeni)
7. `cmd /c npm --prefix platform run a11y:test` (yeni)

## Ready-to-Send Handoff (Claude)

`D:\CrownCode\docs\notes\ANALYSIS_REPORT_PHASE_G_I18N_A11Y_AUTOMATION_2026-03-07.md` dosyasini baz alarak uygula. Phase G'de P0->P2 sirasini bozma, her adimi dosya-bazli raporla ve quality gate komutlarinin ciktisini sonuca ekle.
