# Rolling Task Plan (Gecici)

> Amac: Bu dosya kalici referans degil, dongusel gorev panosudur.
> Kural: Her yeni turda icerik sifirlanir, sadece aktif tur yazilir.
> Son Gecerlilik Tarihi: **31 Aralik 2026**

## Tur Durumu

- Son guncelleme: **8 Mart 2026**
- Tur: **Tur 5 - Asamali Platform Analizi (Faz M moduler guvenilirlik + buyume analizi tamamlandi, uygulama bekleniyor)**
- Mod: Faz bazli ilerleme (P0 -> P3)
- Analiz raporu: `docs/notes/ANALYSIS_REPORT_PHASE_M_MODULE_RELIABILITY_PRODUCT_GROWTH_2026-03-08.md`

## Isletim Protokolu (Zorunlu)

- Claude sadece kod/dokuman degisikligi yapar; lint/test/build komutlarini kosmaz.
- Tum dogrulama komutlarini analist (Codex) kosar ve sonucu plana isler.
- Claude "tamamlandi" dedikten sonra yeni faza gecmeden once analist diff + test sonucunu capraz kontrol eder.

---

## Bu Turun Gorevleri

### Faz 0 - Kontrol Dogrulama

- [x] Onceki tur commitleri ve dosyalari dogrulandi.
- [x] Bagimsiz kalite komutlari kosuldu (lint, type-check, test, build-server, build-static).
- [x] Yeni analiz raporu olusturuldu.

### Faz 1 - P1 Functional Fix

- [x] `ai-music-detection/index.tsx`: `unsupportedSource` case eklendi, `AnalysisErrorCode` import edildi, resolver tipi `string | null` -> `AnalysisErrorCode | null` duzeltildi.

### Faz 2 - P2/P3 Dokuman Senkronu

- [x] `MIGRATION_PLAN_2026.md`: "static export" anlatisi dual-mode gercegine guncellendi (server default, static Netlify icin).
- [x] `BACKEND_CONTRACT.md`: parity checklist HF backend / ortak olarak ayrildi, endpoint sahipligi netlesti.

### Faz 3 - Regression Test Guvencesi

- [x] `unsupportedSource` hata akisini kapsayan en az bir test eklenecek. (`__tests__/hooks/analysisGateway.test.ts`)
- [x] `analysisGateway` mapping davranisi 10 test ile dogrulandi (unsupported_source, missing_file, fileTooLarge, enterUrl, backend_unreachable, backend_unexpected_response, analysisMode normalization).

---

## Zorunlu Dogrulama (Analist/Codex)

1. `cmd /c npm --prefix platform run lint`
2. `cmd /c npm --prefix platform run type-check`
3. `cmd /c npm --prefix platform test -- --runInBand`
4. `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"`
5. `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"`

Not:
- Build komutlari ayni anda paralel kosulmamali; `.next` uzerinde cakisma olusturabilir.
- Bu komutlar Claude tarafinda kosulmaz; sadece analist tarafinda kosulur.

---

## Ek Backlog - Crown Fortune Deep (Analizden)

Kaynak rapor:
- `docs/notes/ANALYSIS_REPORT_CROWN_FORTUNE_DEEP_2026-03-04.md`

### P1

- [x] `platform/data/destiny.ts`: `seededRandom` kullanimi duzeltildi (unit float [0,1) donuyor).
- [x] `platform/data/destiny.ts`: `getLuckyElements` aralik mantigi duzeltildi (seed artik 0..1 float, Math.floor(seed*49)+1 dogru calisir).
- [x] `platform/data/destiny.ts`: `getDailyQuote` index secimi duzeltildi (Math.floor(seed*length) artik gecerli index verir).
- [x] `platform/pages/crown-fortune/index.tsx`: `native share` fallback eklendi (clipboard -> twitter).
- [x] `platform/pages/ai-music-detection/index.tsx`: `unsupportedSource` case'i error resolver'a eklenecek. (Tur 4 Faz 1'de tamamlandi.)

### P2

- [x] `platform/pages/crown-fortune/index.tsx`: `setTimeout` akislari unmount cleanup ile guvenli hale getirildi (pendingTimers ref).
- [x] Crown Fortune ve destiny icinde hardcoded `22` degerleri `DESTINY_CARDS.length` tabanli hale getirildi.
- [ ] Tarih/timezone helperlari standardize edilecek (`Europe/Istanbul` tek model).

### Test

- [ ] `platform` testlerine sansli sayilar / quote index / unsupportedSource / share fallback senaryolari eklenecek.

---

## Tur 5 - Asamali Platform Analizi (2026-03-04)

- Analiz raporu: `docs/notes/ANALYSIS_REPORT_PHASED_PLATFORM_AUDIT_2026-03-04.md`
- Yontem: asamali tarama (ortak katman -> ana sayfa -> urun sayfalari -> API -> ops)
- Rol: Analizci tespit yazar, Claude uygular.

### Faz A (Tamamlandi - Analiz)

- [x] Layout/Header/Footer/MainLayout detay analizi tamamlandi.
- [x] Home + urun sayfalari tarandi.
- [x] API route + operasyon dosyalari capraz kontrol edildi.
- [x] Dogrulama komutlari calistirildi (lint/type-check/test/build server+static + hf tests).
- [x] Yeni bulgular rapora islendi.

### Faz A Cikisli Claude Gorevleri

- [x] P1: canonical URL route-bazli duzeltildi (`MainLayout` — `router.asPath` tabanli, og:url dahil).
- [x] P1: Header router katmani Pages Router ile netlestirildi (`next/navigation` -> `next/router`, `'use client'` kaldirildi).
- [x] P1: Crown Fortune kalan buglar kapatildi (seededRandom unit float, getLuckyElements/getDailyQuote/seededChoice duzeltildi, native share fallback eklendi, hardcoded 22 -> DESTINY_CARDS.length).
- [x] P2: i18n fallback temizligi yapildi (Footer fortune fallback, Crown Vote meta fallback, 404 hardcoded linkler, locale key eklendi).
- [x] P2: timeout cleanup standardi uygulandi (Header, LoadingScreen, Crown Fortune — pendingTimers ref + unmount cleanup).
- [x] P2: `data-manipulation` backend URL davranisi production-safe hale getirildi (localhost fallback kaldirildi, env zorunlu).
- [x] P2: core backend minimum test paketi eklendi (`backend/tests/` — 20 test: url_parser 19 + health 1).

### Faz B (Siradaki Analiz Turu)

- [ ] Hook + context + modal katmani (a11y, memory, i18n parity) detay analizi.
- [ ] Backend servis katmani (core + hf) sozlesme ve guvenlik analizi.
- [ ] Dokuman/CI/devex zincirinde stale policy ve otomasyon bosluklari.

---

## Tur 5.1 - Faz B Tamamlandi (Hook/Context/Modal Analizi)

- Analiz raporu: `docs/notes/ANALYSIS_REPORT_PHASE_B_HOOK_CONTEXT_MODAL_2026-03-04.md`
- Durum: analiz tamamlandi, uygulama Claude'a devredilecek.

### Faz B Sonuc

- [x] Hook + context + modal katmani detay analizi tamamlandi.
- [x] Backend servis katmani (core + hf) sozlesme ve guvenlik analizi.
- [ ] Dokuman/CI/devex zincirinde stale policy ve otomasyon bosluklari.

### Faz B Cikisli Claude Gorevleri

- [x] P1: `useKeyboardShortcuts` input/textarea/contenteditable guard eklendi (`allowInInput` per-shortcut flag).
- [x] P1: Search/Shortcuts/ExternalLink icin modal a11y standardi uygulanadi (`role=dialog`, `aria-modal`, `aria-labelledby`).
- [x] P1: `useYouTubeAnalysis`, `useFileAnalysis`, `useCommend` icin `requestIdRef` + `isStale()` stale request guard eklendi.
- [x] P2: Hook/modal i18n hardcoded metinler locale key'lere tasindi (`shortcuts.*`, `search.features.*Desc`).
- [x] P2: `ShortcutsModal` no-op keyboard listener kaldirildi (`enabled: false`).
- [x] P2: `useScrollAnimation` observer cleanup `disconnect()` ile guclendirildi, `hasTriggered` dep kaldirildi.
- [x] P2: `useIsMobile` icindeki `ts-ignore` typed cast ile temizlendi.
- [x] P3: Search/Shortcuts modal `AnimatePresence` exit akisi duzeltildi (conditional render icine alindi).

### Siradaki Analiz

- [x] Faz C: backend/core + hf servis/validation/kontrat zinciri derin analizi.

---

## Tur 5.2 - Faz C Tamamlandi (Backend/Contract Analizi)

- Analiz raporu: `docs/notes/ANALYSIS_REPORT_PHASE_C_BACKEND_CONTRACT_2026-03-04.md`
- Durum: analiz tamamlandi, uygulama Claude'a devredilecek.

### Faz C Sonuc

- [x] Core backend + HF backend servis katmani capraz analiz edildi.
- [x] Frontend-backend error/contract uyumu kontrol edildi.
- [x] Backend test dogrulamasi tekrar kosuldu.
- [x] Dokuman/CI/devex stale policy fazi (Faz D) baslatildi.

### Faz C Cikisli Claude Gorevleri

- [x] P0: Commend auth + rate-limit uygulanadi (`COMMEND_API_KEY` env, 10 req/min/IP limiter, `/generate` + `/post`).
- [x] P0: `/post` endpointi `COMMEND_ENABLE_POSTING` env feature-flag ile default kapali modele alindi.
- [x] P1: Commend URL validatoru exact-host (`_YOUTUBE_HOSTS` frozenset) + 11-char video id regex standardina cekildi.
- [x] P1: `analyze.py` icinde `yt_result.errors` response contractina yansitildi (hardcoded `errors=[]` kaldirildi).
- [x] P1: `data_processing.py` icinde `content_type` null-safe kontrol + 30MB max payload limiti eklendi.
- [x] P1: `preview_model.py` deterministik hale getirildi (seeded RNG), `is_ai_generated` final confidence'a gore belirleniyor.
- [x] P2: `analysisGateway.ts` error map genisletildi (7 backend error -> frontend error code eslesmesi).
- [x] P2: `external_clients.py` (core + hf) health payloadindan `base_url` leak kaldirildi.
- [x] P2: `.github/workflows/ci.yml` icine core backend pytest job'u eklendi; deploy gate'e dahil edildi.
- [x] P2: `hf-crowncode-backend/README.md` endpoint/env/structure anlatimi guncellendi.
- [x] P2: HF backend testleri genisletildi (`test_analyze.py` 8 test, `test_data_processing.py` 3 test, `test_commend.py` 5 test).
- [x] P3: `analyze.py` Pydantic mutable list defaultlari `Field(default_factory=list)` standardina cekildi.

### Faz C Dogrulama Logu

- [x] `python -m pytest backend/tests -q` -> `20 passed`
- [x] `python -m pytest hf-crowncode-backend/tests -q` -> `21 passed` (coverage ~46%)

### Siradaki Analiz

- [x] Faz D: dokuman/CI/devex zinciri derin analizi (Netlify deploy incident odakli) tamamlandi.

---

## Tur 5.3 - Faz D Tamamlandi (Deploy/DevEx Netlify Incident)

- Analiz raporu: `docs/notes/ANALYSIS_REPORT_PHASE_D_DEVEX_NETLIFY_2026-03-05.md`
- Durum: analiz tamamlandi, uygulama Claude'a devredilecek.

### Faz D Sonuc

- [x] Netlify deploy incident kok nedeni dogrulandi.
- [x] Server-mode vs static-export config cakismasi netlestirildi.
- [x] Deploy/devex icin uygulanabilir gorev paketi cikarildi.

### Faz D Cikisli Claude Gorevleri

- [x] P0: `netlify.toml` `publish = "out"` -> `publish = ".next"` (server-mode uyumlu).
- [x] P0: Deploy modeli teklestirildi — `corepack` + `npm install` yerine `npm ci`, static `out` beklentisi kaldirildi.
- [x] P1: `DEPLOYMENT_CONFIG.md` sifirdan yazildi (server-mode deploy stratejisi, branch policy, checklist).
- [x] P1: `MIGRATION_PLAN_2026.md` mimari bolumu guncellendi (server-mode Netlify runtime, backend HF Spaces).
- [x] P1: Branch-context deploy policy dokumante edildi (master=production, gelistirme=branch-deploy).
- [x] P2: npm engine constraint sadeleştirildi (`npm>=10.9.2` kisitlamasi kaldirildi, `NODE_VERSION` pinlendi).
- [x] P2: Post-deploy checklist `DEPLOYMENT_CONFIG.md` icine eklendi.

### Faz D Dogrulama Logu

- [x] ESLint: no warnings/errors
- [x] TypeScript: passed
- [x] Frontend tests: 16 passed
- [x] Server build: compiled
- [x] Static build: compiled
- [x] Core backend tests: 20 passed
- [x] HF backend tests: 21 passed

### Faz D Kaynak Incident (Kullanici Logu)

- [x] Netlify hata: `publish directory not found: /opt/build/repo/platform/out`
- [x] Build basarili ama plugin `onBuild` adiminda fail.
- [x] Dynamic route ciktilari (`ƒ /api/*`) server-mode build oldugunu dogruladi.

### Siradaki Analiz

- [x] Faz E: sayfa bazli performans + bundle + runtime gozlenebilirlik analizi.

---

## Tur 5.4 - Faz E Tamamlandi (Performance/Bundle/Observability)

- Analiz raporu: `docs/notes/ANALYSIS_REPORT_PHASE_E_PERFORMANCE_OBSERVABILITY_2026-03-07.md`
- Durum: analiz tamamlandi, uygulama Claude'a devredilecek.

### Faz E Sonuc

- [x] Build, static build ve analyze-build dogrulamalari tekrar kosuldu.
- [x] Bundle agirlik noktalarina dair satir-bazli tespit cikartildi.
- [x] Runtime gozlenebilirlik (web vitals + error boundary + console policy) analizi tamamlandi.
- [x] Netlify deploy hatasi ile repo config/CI zinciri arasindaki yeni uyumsuzluklar raporlandi.

### Faz E Cikisli Claude Gorevleri

- [x] P0: CI deploy job server-mode ile hizalandi (`.next` artifact, `netlify-cli deploy --build --prod`), Lighthouse job `next start` ile guncellendi.
- [x] P0: `ANALYZE=true` build onarildi (`@next/bundle-analyzer` devDep, `withBundleAnalyzer` wrapper pattern, eski manual webpack-bundle-analyzer blogu kaldirildi).
- [x] P1: `_app` global modal lazy-load gercek lazy modele alindi (first user interaction'a kadar `<Suspense>` mount edilmiyor).
- [x] P1: Production telemetry eklendi (`reportWebVitals` -> `sendBeacon('/api/vitals')`, `ErrorBoundary` -> `sendBeacon('/api/errors')`).
- [x] P1: `sw.js` v3 yazildi — `/crown-fortune` network-first, diger sayfa cache-first, `setInterval` cleanup kaldirildi, `trimCache` activate event icinde deterministik.
- [x] P1: Crown Dreams 3D `GoldenParticles` icin `usePerformanceTier` eklendi — `prefers-reduced-motion` -> 3D tamamen kapali, dusuk cihaz (<=2 core veya mobil <=4 core) -> %77 azaltilmis particle/connection/orb/star sayilari + DPR 1.
- [x] P1/P2: Root deploy scripts `vercel` -> `netlify-cli` guncellendi. Orphan `platform/netlify/functions/analyze.js` silindi. `removeConsole` production'da warn/error haric kaldiracak sekilde guncellendi.

### Faz E Dogrulama Logu (Analiz Oncesi)

- [x] `cmd /c npm --prefix platform run build` -> passed
- [x] `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"` -> passed (beklenen static/API warning)
- [x] `cmd /c "set ANALYZE=true&& npm --prefix platform run build"` -> failed (`webpack-bundle-analyzer` missing)
- [x] Paralel build denemesinde gorulen `ENOTEMPTY` yarismasi not edildi; ardindan komutlar tek tek kosularak dogrulandi.

### Faz E Dogrulama Logu (Uygulama Sonrasi)

- [x] `cmd /c npm --prefix platform run lint` -> passed
- [x] `cmd /c npm --prefix platform run type-check` -> passed
- [x] `cmd /c npm --prefix platform test -- --runInBand` -> passed
- [x] `cmd /c npm --prefix platform run build` -> passed (server mode)
- [x] `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"` -> passed
- [x] `cmd /c "set ANALYZE=true&& npm --prefix platform run build"` -> passed (P0 fix onaylandi)

### Siradaki Analiz

- [x] Faz F: sayfa bazli UX/IA derin tur (Home -> product pages -> API UX contract), performans fixleri sonrasi yeniden olcum.

---

## Tur 5.5 - Faz F Tamamlandi (UX/IA + i18n/a11y Contract)

- Analiz raporu: `docs/notes/ANALYSIS_REPORT_PHASE_F_UX_IA_2026-03-07.md`
- Durum: analiz tamamlandi, uygulama Claude'a devredilecek.

### Faz F Sonuc

- [x] Home -> urun sayfalari -> global UI katmani UX/IA capraz analizi tamamlandi.
- [x] i18n/a11y hardcoded alanlar satir-bazli tespit edildi.
- [x] Search bilgi mimarisindeki split-brain kaynak sorunu dogrulandi.
- [x] API UX contract tarafinda kullaniciya yansiyan hata/telemetry tutarsizliklari raporlandi.
- [x] Lint + type-check tekrar kosuldu (green).

### Faz F Cikisli Claude Gorevleri

- [ ] P0: Dil/metadata sozlesmesi duzeltilecek (`Html lang`, locale bazli meta/title/keywords).
- [ ] P1: Search veri kaynagi tekillestirilecek (global modal + `/search` ortak katalog).
- [ ] P1: Crown Commend `mounted` gate kaldirilip SSR/hydration akisi iyilestirilecek.
- [ ] P1: Header/Footer/SearchModal/Shortcuts/ExternalLink/Toast/AI upload icin hardcoded aria/title metinleri locale key'lere tasinacak.
- [ ] P1: `ErrorFallback` locale-neutral fallback stratejisine alinacak.
- [ ] P1: Data manipulation hata map'i son-kullanici odakli hale getirilecek.
- [ ] P1: `/api/version` `webVitals` bayragi gercek telemetry durumuyla uyumlu hale getirilecek.
- [ ] P2: Crown Vote fallback borcu kapatilacak (locale parity strict, fallback minimize).
- [ ] P2: `DownloadSection` icin abort/timeout + locale-aware tarih formati eklenecek.

### Faz F Dogrulama Logu

- [x] `cmd /c npm --prefix platform run lint` -> passed
- [x] `cmd /c npm --prefix platform run type-check` -> passed

### Siradaki Analiz

- [x] Faz G: i18n kalite kapisi + locale parity otomasyonu (CI check) ve semantic accessibility audit (WCAG odakli) tasarimi.

---

## Tur 5.6 - Faz G Tamamlandi (i18n Quality Gate + Semantic A11y Automation)

- Analiz raporu: `docs/notes/ANALYSIS_REPORT_PHASE_G_I18N_A11Y_AUTOMATION_2026-03-07.md`
- Durum: analiz tamamlandi, uygulama Claude'a devredilecek.

### Faz G Sonuc

- [x] i18n parity + placeholder parity otomasyon bosluklari dogrulandi.
- [x] Semantic a11y test/gate eksikleri CI seviyesinde tespit edildi.
- [x] Telemetry contract kirigi dogrulandi (`/api/vitals`, `/api/errors` route yok).
- [x] Lint + type-check + test + build tekrar kosuldu.

### Faz G Cikisli Claude Gorevleri

- [x] P0: Telemetry endpointleri eklendi (`platform/pages/api/vitals.ts`, `platform/pages/api/errors.ts` — JSON body, method guard, size guard, structured log). `/api/version` `webVitals` bayragi `process.env.NODE_ENV === 'production'` ile gercek duruma baglandi.
- [x] P0: CI i18n quality gate eklendi (`platform/scripts/check-locale-parity.mjs` — key parity + placeholder parity). `ci.yml` quality-check job'una `i18n:check` step eklendi.
- [x] P1: Crown Dreams placeholder contract duzeltildi — EN `appearsIn` `"Appears in {{count}} dreams"` -> `"times in dreams"` (placeholder kaldirildi, TR ile ayni semantik).
- [x] P1: Header/Footer/SearchModal/Shortcuts/ExternalLink/Toast/AI upload hardcoded aria/title metinleri `t.aria.*` locale key'lerine tasindi. Her iki locale dosyasina `aria` section eklendi.
- [x] P1: useSearch/CrownVote fallback borcu i18n parity CI check ile kapatildi — key eksikleri artik CI'da fail ediyor.
- [x] P1: Semantic a11y test paketi eklendi (`jest-axe` + Footer axe, Toast axe, SearchModal dialog, ShortcutsModal dialog). Telemetry API testleri de eklendi (6 test: vitals POST/405/400, errors POST/405/400).
- [x] P2: `LanguageContext` icinde `document.documentElement.lang` runtime locale senkronu eklendi. Hero `role="banner"` kaldirildi (WCAG duplicate banner uyarisi onlendi).

### Faz G Dogrulama Logu (Analiz Oncesi)

- [x] `cmd /c npm --prefix platform run lint` -> passed
- [x] `cmd /c npm --prefix platform run type-check` -> passed
- [x] `cmd /c npm --prefix platform test -- --runInBand` -> passed (2 suite / 16 test)
- [x] `cmd /c npm --prefix platform run build` -> passed
- [x] `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"` -> passed (beklenen static/API warning)

### Faz G Dogrulama Logu (Uygulama Sonrasi)

- [x] `cmd /c npm --prefix platform run lint` -> passed
- [x] `cmd /c npm --prefix platform run type-check` -> passed
- [x] `cmd /c npm --prefix platform test -- --runInBand` -> passed (4 suite / 26 test)
- [x] `cmd /c npm --prefix platform run build` -> passed (server mode)
- [x] `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"` -> passed
- [x] `cmd /c npm --prefix platform run i18n:check` -> passed

### Siradaki Analiz

- [x] Faz H: API UX contract + telemetry dashboardleme + production error taxonomy standardizasyonu.

---

## Tur 5.7 - Faz H Tamamlandi (API UX Contract + Telemetry + Error Taxonomy)

- Analiz raporu: `docs/notes/ANALYSIS_REPORT_PHASE_H_API_UX_TELEMETRY_2026-03-07.md`
- Durum: analiz tamamlandi, uygulama Claude'a devredilecek.

### Faz H Sonuc

- [x] Claude'un Faz G ciktilari analist tarafinda satir bazli dogrulandi.
- [x] API hata sozlesmesinde sessiz degrade riskleri tespit edildi (`analyze` -> `backend_unexpected_response` -> preview fallback).
- [x] Endpointler arasi error envelope tutarsizliklari raporlandi (`analyze`, `process/audio`, `commend`).
- [x] Telemetry, i18n parity scripti ve a11y test kapsami icin kalan bosluklar belirlendi.
- [x] Analist kalite komutlarini tekrar kostu (i18n/lint/type-check/test/build).

### Faz H Cikisli Claude Gorevleri

- [x] P0: `analysisGateway` ve hook fallback kurallarini error taxonomy ile hizalandi. `analysisTypes.ts`'e `missingUrl`, `invalidSourceType`, `internalError` eklendi. `analysisGateway.ts`'e 3 yeni mapping eklendi. `useYouTubeAnalysis`/`useFileAnalysis` preview fallback sadece `backend_not_configured`/`backend_unreachable` ile sinirlandirildi.
- [x] P0: `data_processing.py` ve `commend/router.py` endpointlerinde tum HTTPException'lar `{ code, message }` envelope standardina gecirildi (8 HTTPException guncellendi).
- [x] P0: Frontend guvenli hata gosterimi — `useCommend.ts`'e `mapCommendErrorCode` + `COMMEND_ERROR_CODE_MAP` eklendi (6 backend kodu -> locale key eslesmesi). `data-manipulation/index.tsx` `errData.detail` obje-safe parse'a gecirildi.
- [x] P1: `test_commend.py` kontrat drifti kapatildi — `url`/`style` -> `videoUrl`/`commentStyle`, `videoId`/`comment` -> `videoUrl`/`commentText`, status code araliklari daraltildi. Yeni `test_commend_post_error_envelope_format` testi eklendi.
- [x] P1: `check-locale-parity.mjs` array-icindeki objectleri recursive kontrol edecek sekilde genisletildi. `getNestedValue` array index notasyonunu (`[N]`) destekliyor. Array uzunluk parity kontrolu eklendi.
- [x] P1: a11y testlerine acik modal senaryosu eklendi — `useSearch` mock ile `isOpen: true`, `role=dialog` + `aria-modal=true` assertion'i.
- [x] P1: `analysisGateway.test.ts`'e 3 yeni test eklendi (`missing_url` -> `missingUrl`, `invalid_source_type` -> `invalidSourceType`, `internal_error` -> `internalError`).
- [x] P2: `/api/vitals` ve `/api/errors` icin IP-bazli rate-limit (30/dk vitals, 10/dk errors), sampling (`VITALS_SAMPLE_RATE` env), ve `FEATURE_WEB_VITALS=false` ile tamamen kapatma gate'i eklendi.
- [ ] P2: `useCommend` ve `data-manipulation` fetch akislarina abort/timeout standardi getir. (deferred — low priority)

### Faz H Dogrulama Logu (Analist)

- [x] `cmd /c npm --prefix platform run i18n:check` -> passed
- [x] `cmd /c npm --prefix platform run lint` -> passed
- [x] `cmd /c npm --prefix platform run type-check` -> passed
- [x] `cmd /c npm --prefix platform test -- --runInBand` -> passed (4 suite / 26 test)
- [x] `cmd /c npm --prefix platform run build` -> passed

### Siradaki Analiz

- [ ] Faz I: guvenlik/saldiri yuzu derin turu (rate limit dayanimi, telemetry abuse senaryolari, CORS/policy sertlestirme).

---

## Tur 5.8 - Faz I Basladi (Post-H Dogrulama + Regresyon Turu)

- Analiz raporu: `docs/notes/ANALYSIS_REPORT_PHASE_I_POST_H_VERIFICATION_2026-03-07.md`
- Durum: analiz tamamlandi, uygulama Claude'a devredilecek.

### Faz I Sonuc

- [x] Claude'un son root commit'i (`ebd89d8`) satir bazli diff ile dogrulandi.
- [x] Core + HF backend testleri analist tarafinda tekrar kostu.
- [x] Faz H tamamlandi denilen paketin kalite kapilarinda regresyon urettigi dogrulandi.

### Faz I Cikisli Claude Gorevleri

- [x] P0: `vitals.ts` ve `errors.ts` lint `curly` ihlalleri giderildi — `isRateLimited` icindeki tek satirlik `if` bloklarina suslu parantez eklendi.
- [x] P0: Telemetry handlerlarda `req.headers?.` ve `req.socket?.` null-safe optional chaining uygulanadi. Test mocklari `headers`/`socket` tanimlamasa da artik crash etmiyor.
- [x] P0: a11y test `jest.resetModules()` + `jest.doMock` stratejisi kaldirildi. Open-modal testi artik inline component ile dialog attribute dogrulamasi yapiyor (duplicate-React riski ortadan kaldirildi).
- [x] P1: `crownCommend.errors` locale sozlesmesi tamamlandi — 6 yeni key (`rateLimitExceeded`, `unauthorized`, `postingDisabled`, `videoDetailsFailed`, `generationFailed`, `postingFailed`) hem `en.json` hem `tr.json`'a eklendi. i18n parity korundu.
- [x] P1: Telemetry hardening tamamlandi — `VITALS_SAMPLE_RATE` `clampSampleRate()` ile [0,1] araligina sabitlendi. IP hit maplari `MAX_TRACKED_IPS=10000` esik ile `evictStaleEntries()` stratejisine alindi.
- [x] P2: Feature gate ayrimi yapildi — `/api/vitals` icin `FEATURE_WEB_VITALS=false`, `/api/errors` icin `FEATURE_CLIENT_ERRORS=false` ayri env degiskenleri kullaniliyor. Coupling ortadan kaldirildi.

### Faz I Dogrulama Logu (Analist)

- [x] `cmd /c npm --prefix platform run i18n:check` -> passed
- [x] `cmd /c npm --prefix platform run lint` -> passed
- [x] `cmd /c npm --prefix platform run type-check` -> passed
- [x] `cmd /c npm --prefix platform test -- --runInBand` -> passed (`4 suite / 30 test`, known `act(...)` warnings)
- [x] `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"` -> passed
- [x] `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"` -> passed (beklenen static export API warning)
- [x] `python -m pytest backend/tests -q` -> passed (`20 passed`)
- [x] `python -m pytest hf-crowncode-backend/tests -q` -> passed (`22 passed`)

### Siradaki Analiz

- [x] Faz J: guvenlik/saldiri yuzu derin turu (Faz I P0/P1 yesile dondukten sonra) tamamlandi.

---

## Tur 5.9 - Faz J Tamamlandi (Security / Attack Surface Derin Tur)

- Analiz raporu: `docs/notes/ANALYSIS_REPORT_PHASE_J_SECURITY_ATTACK_SURFACE_2026-03-08.md`
- Durum: analiz tamamlandi, uygulama Claude'a devredilecek.

### Faz J Sonuc

- [x] Frontend + core backend + HF backend saldiri yuzeyi capraz analiz edildi.
- [x] CORS/auth/rate-limit/policy katmaninda kritik riskler kanitlandi.
- [x] CI guvenlik kapilarinin (npm audit) gecis kriteri bosluklari dogrulandi.
- [x] Baseline kalite komutlari tekrar kosuldu; kod sagligi yesil kaldigi teyit edildi.

### Faz J Cikisli Claude Gorevleri

- [x] P0: Commend auth fail-closed yapildi — `COMMEND_REQUIRE_AUTH=true` (default). Auth yokken 503 donuyor. Rate-limit artik auth'tan bagimsiz her istekte calisiyor (`_check_rate_limit` auth fonksiyonunun basina tasindi).
- [x] P0: Wildcard CORS default kaldirildi — `Dockerfile`'dan `CROWNCODE_CORS_ORIGINS="*"` silindi. `main.py` bos origin durumunda `localhost` default'una dusuyor. README guncellendi.
- [x] P0: CSP + HSTS `netlify.toml`'a eklendi — `Strict-Transport-Security` (2 yil, preload), `Content-Security-Policy` (script-src self+unsafe-inline+unsafe-eval, connect-src HF origins, frame-ancestors none).
- [x] P0: Next.js `^14.2.28`'e yukseltildi (DoS advisory fix). `eslint-config-next` ayni seviyeye cekildi. CI `npm audit` `continue-on-error: true` kaldirildi — artik high/critical bloklar.
- [x] P1: Trusted-proxy IP cozumleme — `x-nf-client-connection-ip` (Netlify) oncelikli, `x-forwarded-for` fallback. `vitals.ts`, `errors.ts`, `fortune-counter.ts` guncellendi.
- [x] P1: Limiter store standardizasyonu — Commend router'a `_evict_stale_ips()` + `_MAX_TRACKED_IPS=10000` eklendi. Fortune-counter'a `evictExpiredEntries()` + `MAX_TRACKED_IPS=10000` eklendi.
- [x] P1: Agir endpointlere rate-limit eklendi — `/api/analyze` (20 req/dk/IP), `/api/process/audio` (10 req/dk/IP). Her ikisi `Depends()` ile bounded + eviction-aware limiter kullaniyor.
- [x] P1: Upload boyut kontrolu stream'e cekildi — `data_processing.py` artik 1MB chunk'lar halinde okuyor, limit asildigi anda 413 donuyor (tam dosya bellegee yuklenmeden).
- [x] P2: Operasyonel fingerprint azaltildi — `health.ts`'ten uptime, memory MB detaylari, `version.ts`'ten nodeVersion, nextVersion, environment, buildDate kaldirildi. Sadece status + version + feature flags donuyor.
- [x] P2: Guvenlik test kapsami genisletildi — Telemetry testlere trusted-IP assertion eklendi (2 yeni test). Commend testlere `test_commend_auth_fail_closed_without_key` ve `test_commend_rate_limit_independent_of_auth` eklendi.

### Faz J Dogrulama Logu (Analist)

- [x] `cmd /c "npm --prefix platform run lint && npm --prefix platform run type-check && npm --prefix platform test -- --runInBand"` -> passed (`4 suite / 30 test`, known `act(...)` warnings)
- [x] `cmd /c npm --prefix platform run build` -> passed
- [x] `python -m pytest backend/tests -q` -> passed (`20 passed`)
- [x] `python -m pytest hf-crowncode-backend/tests -q` -> passed (`22 passed`)
- [x] `cmd /c npm --prefix platform audit --audit-level=high` -> **failed** (`11 vulnerabilities`, `5 high`)

### Siradaki Analiz

- [x] Faz K: Netlify runtime incident derin analizi (server function module-resolution kirigi) tamamlandi.

---

## Tur 5.10 - Faz K Tamamlandi (Netlify Runtime Incident: Missing Next Server Module)

- Incident: Netlify function crash (`Cannot find module 'next/dist/server/lib/start-server.js'`, id: `01KK5CSJYREQXZZTKWQS9W2G3Z`)
- Analiz raporu: `docs/notes/ANALYSIS_REPORT_PHASE_K_NETLIFY_RUNTIME_INCIDENT_2026-03-08.md`
- Durum: analiz tamamlandi, uygulama Claude'a devredilecek.

### Faz K Sonuc

- [x] Crash sinyali kod seviyesinden degil deploy paketleme/model uyumsuzlugundan kaynaklaniyor.
- [x] Monorepo + workspace + Netlify UI override kombinasyonunda dependency context sapmasi dogrulandi.
- [x] Runtime stack (`/var/task/.netlify/dist/run/next.cjs`) Next server runtime dosyasini resolve edemiyor.
- [x] Build green olsa bile runtime fail olabildigi (post-build packaging fault) netlestirildi.

### Faz K Cikisli Claude Gorevleri (Deploy Fix Paketi)

- [x] P0: Netlify konfig tek kaynaga indirgendi. `netlify.toml` header'ina UI override temizleme notu eklendi. `DEPLOYMENT_CONFIG.md`'ye detayli UI override cleanup tablosu eklendi.
- [x] P0: Build context repo root'a alindi (`base` kaldirildi), build komutu workspace modeline gecirildi:
  - `npm ci`
  - `npm run build --workspace platform`
- [x] P0: `netlify.toml` publish path root-context'e uygun hale getirildi (`platform/.next`). Tum context bloklari (production, deploy-preview, branch-deploy) guncellendi.
- [ ] P0: Deploy sonrasi cache temizlenmis yeni production deploy alinacak (clear cache + redeploy). _(Manuel islem — Netlify Dashboard)_
- [x] P1: Lockfile stratejisi `DEPLOYMENT_CONFIG.md`'de dokumante edildi (tek root `package-lock.json`, stale platform lockfile uyarisi).
- [x] P1: `DEPLOYMENT_CONFIG.md` post-deploy checklist genisletildi — build phase, runtime smoke (`/api/health`, `/api/version`), function log kontrolu olarak 3 bolume ayrildi.
- [x] P1: Troubleshooting bolumune `Cannot find module 'next/dist/server/lib/start-server.js'` incident ve cozum adimi eklendi.
- [ ] P1: CI'ya deploy-oncesi workspace smoke adimi eklenecek (deferred — deploy fix onaylaninca):
  - `npm ci`
  - `npm run build --workspace platform`
  - (opsiyonel) minimal runtime import check script (`require.resolve('next/dist/server/lib/start-server.js')`)

### Faz K Dogrulama Logu (Analist)

- [x] `cmd /c npm run build --workspace platform` -> passed (`Next.js 14.2.32`)
- [x] Lokal dogrulama: root `node_modules` icinde `next/dist/server/lib/start-server.js` mevcut, app-local install context bos (workspace hoisting davranisi).
- [x] Netlify dokumani capraz kontrol: monorepo'da package-directory ve config source tekillestirme gerekliligi.

### Siradaki Analiz

- [x] Faz L: Deploy runtime pivot analizi (root-context -> app-context) tamamlandi.

---

## Tur 5.11 - Faz L Tamamlandi (Deploy Runtime Pivot / Netlify)

- Incident devam: runtime crash (`Cannot find module 'next/dist/server/lib/start-server.js'`) Phase K sonrasi da tekrarlandi.
- Analiz raporu: `docs/notes/ANALYSIS_REPORT_PHASE_L_DEPLOY_RUNTIME_PIVOT_2026-03-08.md`
- Durum: analiz tamamlandi, uygulama Claude'a devredilecek.

### Faz L Sonuc

- [x] Root-context workspace stratejisinin sahada stabil olmadigi dogrulandi.
- [x] Runtime module-missing hatasi yeni deploylarda tekrarlandigi icin strateji pivotu gerekli goruldu.
- [x] App-context (`base=platform`) modelinin bu repo yapisinda daha deterministik oldugu teknik olarak netlestirildi.

### Faz L Cikisli Claude Gorevleri

> **NOT**: Faz L app-context pivot onerisi uygulanmadi. Root-context stratejisi + stale `platform/package-lock.json` silme kombinasyonu ile incident cozuldu. Site canli ve stabil. Asagidaki gorevler buna gore guncellendi.

- [x] P0: ~~`netlify.toml` app-context mode'a alinacak~~ — **Uygulanmadi**. Root-context (`base` yok, `--workspace platform`) korundu. Kok neden stale `platform/package-lock.json` idi — silindi.
- [x] P0: Netlify UI override drift temizlendi — UI'daki base/build/publish/functions degerleri kullanici tarafindan bosaltildi. `netlify.toml` tek authoritative kaynak.
- [x] P0: Clear-cache production deploy alindi — site canli (`hasanarthuraltuntas.xyz`). Runtime crash cozuldu.
- [x] P0: Stale `platform/package-lock.json` (10K satir) silindi — cift lockfile kaynakli dependency context cakismasi ortadan kaldirildi.
- [ ] P1: ~~Gecici function bundling guard~~ — Gerek kalmadi, crash cozuldu. Deferred.

### Faz L Dogrulama Logu (Analist)

- [x] Kullanici deploy loglariyla 3 ayri runtime crash id dogrulandi (`01KK5EZ...`, `01KK5FQ...`, `01KK6KK...`).
- [x] Kotu konfig desenleri logdan kanitlandi:
  - root current directory + workspace command + runtime 502
  - base/publish uyumsuzlugunda `platform/platform/.next`
  - app-contextte workspace command ile `No workspaces found` hatasi
- [x] Lokal komut: `cmd /c npm --prefix platform run build` -> passed

### Faz L Dogrulama Logu (Production Smoke)

- [x] `https://hasanarthuraltuntas.xyz/api/health` -> `{"status":"healthy","timestamp":"...","version":"1.0.0","checks":{"api":true}}` HTTP 200
- [x] `https://hasanarthuraltuntas.xyz/api/version` -> `{"version":"1.0.0","features":{"webVitals":true,"pwa":true,...}}` HTTP 200
- [x] Site canli, runtime crash cozuldu.

### Siradaki Analiz

- [x] Faz M: Production smoke + API UX regresyon + i18n contract turu + data-manipulation backend hatasi incelemesi tamamlandi.

---

## Tur 5.12 - Faz M Tamamlandi (Module Reliability + Product Growth)

- Analiz raporu: `docs/notes/ANALYSIS_REPORT_PHASE_M_MODULE_RELIABILITY_PRODUCT_GROWTH_2026-03-08.md`
- Durum: analiz tamamlandi, uygulama Claude'a devredilecek.

### Faz M Sonuc

- [x] Modul-calisma guvencesi icin operasyonel bosluklar netlestirildi.
- [x] Home + global search + `/search` katalog daginikligi kanitlandi.
- [x] Kritik fetch akislarinda timeout/abort standardi eksigi satir bazli cikarildi.
- [x] Yaratici ama uygulanabilir 3 yeni sayfa rotasi belirlendi (`creator-studio`, `analysis-history`, `system-status`).

### Faz M Cikisli Claude Gorevleri

- [x] P0: `platform/config/product-catalog.ts` olusturuldu; `ProjectsSection`, `useSearch`, `/search` bu katalogu kullaniyor.
- [x] P0: `useAsyncRequest` (timeout+abort+retry) standardi eklendi; `analysisGateway`, `useCommend`, `data-manipulation`, `DownloadSection` entegre edildi.
- [x] P1: `crown-dreams` demo-mode UX netlestirildi (non-functional actionlar disable + "Demo mode" title).
- [x] P1: `crown-commend` mounted gate kaldirildi (SSR-first render).
- [x] P1: Analysis + Commend icin minimal local history persistence (`useLocalHistory` hook) eklendi.
- [x] P1: Home/Search/Data-manipulation metadata hardcodedlari locale key'lere tasindi (`homeMeta`, `searchMeta`, `dataManipulationMeta`).
- [x] P2: Yeni MVP sayfalar olusturuldu:
  - `/creator-studio` (Coming Soon + 3 feature card)
  - `/analysis-history` (localStorage'dan son analiz gosterimi)
  - `/system-status` (canli servis saglik kontrolu)
- [x] P2: Yeni MVP sayfalarin locale keyleri eklendi (`creatorStudio`, `analysisHistory`, `systemStatus` — EN + TR parity).

### Faz M Dogrulama Logu (Analist)

- [x] `cmd /c npm --prefix platform run lint` -> passed
- [x] `cmd /c npm --prefix platform run type-check` -> passed
- [x] Faz F/H/L bulgulari ile capraz tutarlilik kontrolu tamamlandi.

### Siradaki Analiz

- [x] Faz N: Faz M uygulama sonrasi route-level smoke + UX regressions + growth KPI readiness analizi tamamlandi.

---

## Tur 5.13 - Faz N Tamamlandi (Post-M Route Smoke + UX Regression)

- Analiz raporu: `docs/notes/ANALYSIS_REPORT_PHASE_N_POST_M_ROUTE_SMOKE_UX_2026-03-09.md`
- Durum: analiz tamamlandi, uygulama Claude'a devredilecek.

### Faz N Sonuc

- [x] Faz M sonrasi route-level smoke turu tamamlandi.
- [x] Frontend kalite kapilarinda regresyon oldugu kanitlandi (lint/type/build red).
- [x] Yeni sayfa rollout'unda locale-schema drift ve type contract kirigi tespit edildi.
- [x] Yeni sayfalarin bilgi mimarisi/discoverability bosluklari (search/nav) netlesti.

### Faz N Cikisli Claude Gorevleri

- [x] P0: `platform/tsconfig.json` icine `@/config/*` path alias eklendi; module-resolution kirigi kapatildi.
- [x] P0: `platform/pages/creator-studio/index.tsx` locale-key drifti duzeltildi (`desc->description`, `layers->multitrack`, `comingSoonNote->comingSoonDesc`, `backHome` -> `errorPage.actions.home`), raw `<a>` yerine `next/link` kullanildi.
- [x] P0: `platform/pages/analysis-history/index.tsx` locale keyleri canonical hale getirildi (`clearBtn->delete`, `empty->noHistory+noHistoryDesc`).
- [x] P0: `CyberButton.tsx` icine `title` prop eklendi; Crown Dreams `disabled title="Demo mode"` type-safe hale geldi.
- [x] P1: Yeni rotalar (`/creator-studio`, `/analysis-history`, `/system-status`) `useSearch` ve `/search` sayfasina eklendi — kesfedilebilir.
- [ ] P1: `platform/__tests__/pages/smoke.test.tsx` icine 3 yeni route smoke testi ekle.
- [ ] P1: Kalan commitlerde conventional commit standardina geri don.

### Faz N Dogrulama Logu (Analist)

- [x] `cmd /c npm --prefix platform run lint` -> **failed** (`creator-studio` raw `<a>` / `next/link` kurali)
- [x] `cmd /c npm --prefix platform run type-check` -> **failed** (`@/config/*` alias eksigi + locale key drift + `CyberButton` prop mismatch)
- [x] `cmd /c npm --prefix platform test -- --runInBand` -> passed (`4 suites / 32 tests`, known `act(...)` warnings)
- [x] `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"` -> **failed** (lint gate)
- [x] `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"` -> **failed** (lint gate)
- [x] `cmd /c npm --prefix platform run i18n:check` -> passed
- [x] `python -m pytest backend/tests -q` -> passed (`20 passed`)
- [x] `python -m pytest hf-crowncode-backend/tests -q --disable-warnings --maxfail=1` -> passed (all tests green + coverage output)

### Faz N Dogrulama Logu (Analist - Post Fix Recheck)

- [x] `cmd /c npm --prefix platform run lint` -> passed
- [x] `cmd /c npm --prefix platform run type-check` -> passed
- [x] `cmd /c npm --prefix platform test -- --runInBand` -> passed (`4 suites / 32 tests`, known `act(...)` warnings)
- [x] `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"` -> passed
- [x] `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"` -> passed (beklenen static export API warning)
- [x] `cmd /c npm --prefix platform run i18n:check` -> passed
- [x] `python -m pytest backend/tests -q` -> passed (`20 passed`)
- [x] `python -m pytest hf-crowncode-backend/tests -q --disable-warnings --maxfail=1` -> passed

### Siradaki Analiz

- [x] Faz O: Faz N fixleri sonrasi full regression + discoverability KPI (search hit, route entry points, smoke parity) analizi tamamlandi.

---

## Tur 5.14 - Faz O Tamamlandi (Post-N Verification + Discoverability)

- Analiz raporu: `docs/notes/ANALYSIS_REPORT_PHASE_O_POST_N_VERIFICATION_DISCOVERABILITY_2026-03-09.md`
- Durum: analiz tamamlandi, uygulama Claude'a devredilecek.

### Faz O Sonuc

- [x] Faz N duzeltmeleri analist tarafinda bagimsiz kalite kapilariyla dogrulandi (hepsi green).
- [x] Yeni route'larin kesfedilebilirligi search katmaninda dogrulandi.
- [x] Kalan aciklar netlesti: page smoke kapsami + header/footer entry point eksigi + test warning gürültusu.

### Faz O Cikisli Claude Gorevleri

- [x] P1: `platform/__tests__/pages/smoke.test.tsx` icine `/creator-studio`, `/analysis-history`, `/system-status` smoke testleri eklendi (6 yeni test).
- [x] P1: `Header.tsx` icine `/system-status` ("Status") nav linki eklendi. `Footer.tsx` products section'ina Creator Studio + System Status eklendi. Locale keyleri (`nav.status`, `footer.sections.products.creatorStudio/systemStatus`) EN+TR parity ile eklendi.
- [ ] P2: a11y testlerinde gorulen `act(...)` warning gürültusu azaltilacak (test setup deterministiklestirme).
- [ ] P2: Yeni route'lar icin minimal KPI checklist dokumani eklenecek (entry source, first action, revisit marker).

### Faz O Dogrulama Logu (Analist)

- [x] `cmd /c npm --prefix platform run lint` -> passed
- [x] `cmd /c npm --prefix platform run type-check` -> passed
- [x] `cmd /c npm --prefix platform test -- --runInBand` -> passed (`4 suites / 32 tests`, known `act(...)` warnings)
- [x] `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"` -> passed
- [x] `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"` -> passed (beklenen static export API warning)
- [x] `cmd /c npm --prefix platform run i18n:check` -> passed
- [x] `python -m pytest backend/tests -q` -> passed (`20 passed`)
- [x] `python -m pytest hf-crowncode-backend/tests -q --disable-warnings --maxfail=1` -> passed

### Siradaki Analiz

- [ ] Faz P: Faz O uygulama sonrasi nav/footer UX etkisi + smoke coverage parity + warning-free test turu.

### Faz O Notu (Analist Post-P1 Recheck)

- `smoke.test.tsx` kapsami eklendi ancak kabul kriteri henuz saglanmadi:
  - `cmd /c npm --prefix platform test -- --runInBand` recheck'te `1 suite failed / 3 test failed`.
  - Kok neden: yeni testler locale-stabil degil (TR runtime'da EN title assertion).
- Header/Footer + locale key degisiklikleri dogru ve korunacak.

---

## Tur 5.15 - Faz P Tamamlandi (Post-O Smoke Stability / Determinism)

- Analiz raporu: `docs/notes/ANALYSIS_REPORT_PHASE_P_POST_O_SMOKE_STABILITY_2026-03-09.md`
- Durum: analiz tamamlandi, uygulama Claude'a devredilecek.

### Faz P Sonuc

- [x] P1 discoverability degisiklikleri (Header/Footer + locale keys) dogrulandi.
- [x] Smoke testlerine yeni route kapsami eklendigi dogrulandi.
- [x] Ancak smoke suite'in locale-stabil olmadigi ve test gate'i kirdigi kanitlandi.
- [x] P2 warning/kpi maddelerinin acik kaldigi teyit edildi.

### Faz P Cikisli Claude Gorevleri

- [x] P0: `platform/__tests__/pages/smoke.test.tsx` locale-agnostic hale getirildi — text assertion yerine `getByRole('heading', { level: 1 })` kullanildi. TR/EN farkinda fail etmiyor.
- [x] P0: `SystemStatusPage` smoke testleri `act()` + `waitFor` ile sarmalandi; fetch mock `json()` method'u eklendi. Async state update warning'leri azaltildi.
- [x] P1: Header/Footer discoverability degisiklikleri korundu, rollback yok.
- [x] P2: a11y warning noise azaltma + yeni route KPI checklist dokumani — Faz Q'da tamamlandi.

### Faz P Dogrulama Logu (Analist)

- [x] `cmd /c npm --prefix platform run lint` -> passed
- [x] `cmd /c npm --prefix platform run type-check` -> passed
- [x] `cmd /c npm --prefix platform run i18n:check` -> passed
- [x] `cmd /c npm --prefix platform test -- --runInBand` -> **failed** (`1 suite failed`, `3 failed`, `35 passed`)
- [x] `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"` -> passed
- [x] `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"` -> passed (beklenen static export API warning)
- [x] `python -m pytest backend/tests -q` -> passed (`20 passed`)
- [x] `python -m pytest hf-crowncode-backend/tests -q --disable-warnings --maxfail=1` -> passed

Not:
- Paralel build kosumunda bir kez `ENOTEMPTY ... .next\\export` goruldu; tekil/sirali build kosumunda sorun tekrarlanmadi.

### Faz P Dogrulama Logu (Analist - Post Fix Recheck)

- [x] `cmd /c npm --prefix platform run lint` -> passed
- [x] `cmd /c npm --prefix platform run type-check` -> passed
- [x] `cmd /c npm --prefix platform run i18n:check` -> passed
- [x] `cmd /c npm --prefix platform test -- --runInBand` -> passed (`4 suites / 38 tests`)
- [x] `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"` -> passed
- [x] `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"` -> passed (beklenen static export API warning)
- [x] `python -m pytest backend/tests -q` -> passed (`20 passed`)
- [x] `python -m pytest hf-crowncode-backend/tests -q --disable-warnings --maxfail=1` -> passed

### Siradaki Analiz

- [ ] Faz Q: Faz P fixleri sonrasi warning-minimized, locale-stabil test ve release-readiness analizi.

---

## Tur 5.16 - Faz Q Tamamlandi (Post-P Verification + Residual Warning Debt)

- Analiz raporu: `docs/notes/ANALYSIS_REPORT_PHASE_Q_POST_P_VERIFICATION_WARNING_DEBT_2026-03-09.md`
- Durum: analiz tamamlandi, uygulama Claude'a devredilecek.

### Faz Q Sonuc

- [x] Faz P smoke stabilite duzeltmeleri analist tarafinda dogrulandi.
- [x] Discoverability degisikliklerinin korundugu teyit edildi.
- [x] Tum kalite kapilari green.
- [x] Kalan borc netlesti: test warning noise + KPI checklist dokumani.

### Faz Q Cikisli Claude Gorevleri

- [x] P2: `act(...)` warning noise azaltildi:
  - `IntersectionObserver` mock'u `accessibility.test.tsx` ve `smoke.test.tsx`'e eklendi (Next Link prefetch warning'lerini onluyor).
  - Toast testi fake timers + `act()` ile sarmalandi (timer-driven state update warning'leri giderildi).
- [x] P2: `docs/technical/ROUTE_KPI_CHECKLIST.md` eklendi — `creator-studio`, `analysis-history`, `system-status` icin entry source, first action, revisit indicator, raporlama frekansi dokumante edildi.

### Data-Manipulation 422 Bug Fix (P0 Hotfix)

- [x] P0: `hf-crowncode-backend/app/routes/data_processing.py` — `options: Json[AudioAugmentationOptions] = Form(...)` → `options: str = Form(...)` + `AudioAugmentationOptions.model_validate_json(options)` ile manual parse. Frontend'in `JSON.stringify()` ile gonderdig JSON string artik dogru parse ediliyor. Hatali JSON icin kontrollü `422 invalid_options` donuyor.
- [x] P0: `hf-crowncode-backend/tests/test_data_processing.py` tamamen yeniden yazildi:
  - Gevşek `assert status_code in (400, 422)` kaldırıldı — her test kesin status code bekliyor.
  - Valid multipart request testi eklendi (422 olmadigi dogrulaniyor).
  - Invalid JSON options testi eklendi (`invalid_options` error code assertion).
  - camelCase options kabul testi eklendi (frontend uyumu).
  - Helper fonksiyonlari (`_valid_options`, `_fake_audio`) ile test DRY hale getirildi.

### Faz Q Dogrulama Logu (Analist)

- [x] `cmd /c npm --prefix platform run lint` -> passed
- [x] `cmd /c npm --prefix platform run type-check` -> passed
- [x] `cmd /c npm --prefix platform run i18n:check` -> passed
- [x] `cmd /c npm --prefix platform test -- --runInBand` -> passed (`4 suites / 38 tests`, warningler mevcut)
- [x] `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"` -> passed
- [x] `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"` -> passed (beklenen static export API warning)
- [x] `python -m pytest backend/tests -q` -> passed (`20 passed`)
- [x] `python -m pytest hf-crowncode-backend/tests -q --disable-warnings --maxfail=1` -> passed

### Siradaki Analiz

- [x] Faz R: Faz Q P2 fixleri sonrasi warning-clean test output + dokuman tamlik analizi tamamlandi.

---

## Tur 5.17 - Faz R Tamamlandi (Warning Debt + Contract Hardening + Style Migration)

- Durum: analist dogrulamasi tamamlandi, tum kapılar green.

### Faz R Sonuc

- [x] Toast axe test timeout cozuldu.
- [x] FileUploader controlled component'e donusturuldu.
- [x] Object URL memory leak onlendi.
- [x] Backend options backward-compat saglandi.
- [x] Search veri kaynagi tekillestirildi.
- [x] Yeni 3 sayfa CSS module'lerine tasinarak inline style borcu kapatildi.

### Faz R Cikisli Claude Gorevleri

- [x] P0: Toast axe timeout — `duration: 0` ile timer disable, `jest.useFakeTimers()` konflikti giderildi (`accessibility.test.tsx`).
- [x] P0: FileUploader state contract — uncontrolled → controlled (`files` + `onFilesChange` props, parent single source of truth). `type="button"` + `aria-label` eklendi (`FileUploader.tsx`).
- [x] P0: Object URL cleanup — `useRef` + `revokeObjectURL` lifecycle: unmount, back nav, new file, new URL (`data-manipulation/index.tsx`).
- [x] P0: `data_processing.py` options backward-compat — `Json[T] = Form(...)` → `str = Form(default="{}")` + `model_validate_json()`. Missing options `"{}"` defaulta dusuyor (tum augmentations off).
- [x] P1: Search dedup — `buildSearchItems(t)` `useSearch.ts`'den export edildi. `/search` sayfasi bu fonksiyonu import ediyor, duplicate item listesi kaldirildi.
- [x] P1: Inline style debt — 3 yeni sayfa (`creator-studio`, `analysis-history`, `system-status`) tamamen CSS module'lerine tasinarak inline `style={{...}}` borcu kapatildi:
  - `styles/pages/creator-studio.module.css` + `pages/creator-studio/index.tsx`
  - `styles/pages/analysis-history.module.css` + `pages/analysis-history/index.tsx`
  - `styles/pages/system-status.module.css` + `pages/system-status/index.tsx`

### Faz R Degisiklik Ozeti

| Dosya | Degisiklik | Risk |
| --- | --- | --- |
| `platform/__tests__/a11y/accessibility.test.tsx` | Toast test `duration: 0` | Dusuk — sadece test |
| `platform/components/MLToolkit/FileUploader.tsx` | Controlled component | Orta — tum tuketiciler (`data-manipulation`) ayni anda guncellendi |
| `platform/pages/data-manipulation/index.tsx` | URL cleanup + controlled FileUploader | Dusuk — ek fonksiyonellik yok, sadece memory/state fix |
| `hf-crowncode-backend/app/routes/data_processing.py` | `str = Form(default="{}")` + manual parse | Dusuk — backward-compat: missing options `"{}"` default |
| `hf-crowncode-backend/tests/test_data_processing.py` | 7 strict contract test | Dusuk — sadece test |
| `platform/hooks/useSearch.ts` | `buildSearchItems()` export | Dusuk — pure function extraction |
| `platform/pages/search.tsx` | Import `buildSearchItems`, duplicate kaldirildi | Dusuk — ayni veri, farkli kaynak |
| `platform/pages/creator-studio/index.tsx` | Inline style → CSS module | Dusuk — gorsel degisiklik yok |
| `platform/pages/analysis-history/index.tsx` | Inline style → CSS module | Dusuk — gorsel degisiklik yok |
| `platform/pages/system-status/index.tsx` | Inline style → CSS module | Dusuk — gorsel degisiklik yok |
| `platform/styles/pages/*.module.css` (3 dosya) | Yeni CSS module dosyalari | Dusuk — mevcut inline stillerin 1:1 karsiligi |

### Backward Compat Notlari

- **FileUploader**: API degisti (`onFilesSelected` → `onFilesChange`, `files` prop eklendi). Tek tuketici (`data-manipulation`) ayni committe guncellendi.
- **data_processing.py options**: `options` field olmadan gelen istekler `"{}"` default ile calisiyor (tum augmentations off). Mevcut frontend davranisi korunuyor.
- **CSS modules**: Birebir ayni CSS degerleri, sadece uygulama yontemi degisti. Gorsel regresyon yok.

### Faz R Dogrulama Logu (Analist)

- [x] `cmd /c npm --prefix platform run lint` -> passed
- [x] `cmd /c npm --prefix platform run type-check` -> passed
- [x] `cmd /c npm --prefix platform test -- --runInBand` -> passed (`4 suites / 38 tests`)
- [x] `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"` -> passed
- [x] `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"` -> passed (beklenen static export API warning)
- [x] `python -m pytest backend/tests -q` -> passed (`20 passed`)
- [x] `python -m pytest hf-crowncode-backend/tests -q` -> passed (`28 passed`, coverage ~%49)

### Faz R Sonrasi Analist Bulgulari

- [ ] P1: i18n fallback borcu — hardcoded EN metinler: `creator-studio/index.tsx:16`, `analysis-history/index.tsx:74`, `system-status/index.tsx:91`
- [ ] P1: FileUploader remove `aria-label` hardcoded EN: `FileUploader.tsx:128`
- [ ] P1: `/search` kategori eslesmesi semantik hatali (`features -> project`): `search.tsx:34`
- [ ] P1: Analysis History uzun input tasma riski (`word-break` yok): `analysis-history.module.css:49`
- [ ] P2: History tek kayit tutuyor, coklu kayit destegi yok: `useLocalHistory.ts:4`
- [ ] P2: Node 24 hedefi yok; runtime 20.18.1'e sabit: `netlify.toml:18`, `ci.yml:22`

### Siradaki Analiz

- [x] Faz S: Analist bulgulari (i18n hardcoded, search kategori, history v2, Node 24) + urun buyume adimi.

---

## Tur 5.18 - Faz S (i18n Hardening + Search Category + History V2 + Node 24 Canary)

- Durum: ilk uygulama tamamlandi, Faz S.1 acceptance hotfix ile duzeltildi.

### Faz S Sonuc

- [x] Hardcoded EN fallback borcu 3 sayfada tamamen kapatildi.
- [x] FileUploader aria-label locale-aware hale getirildi.
- [x] Search kategori semantigi `product|feature|page` olarak netlestirildi.
- [x] History V2: useLocalHistory multi-entry (max 20, V1 migration, backward-compat API).
- [x] Analysis-history sayfasi multi-entry gosteriminE + clearAll + entryCount UI eklendi.
- [x] `.entry-input-text` overflow/text-overflow/word-break CSS fix.
- [x] Node 24 canary CI job (non-blocking, `continue-on-error: true`).
- [x] `cache-dependency-path` drift duzeltildi (`platform/package-lock.json` -> `package-lock.json`).
- [x] 3 yeni test dosyasi: `useLocalHistory.test.ts` (7 test), `useSearch.test.ts` (4 test), smoke long-input testi.

### Faz S Cikisli Claude Gorevleri

- [x] P0-1: Hardcoded EN fallback (`|| 'English text'`) kaldirildi — `creator-studio/index.tsx`, `analysis-history/index.tsx`, `system-status/index.tsx`. Optional chaining (`?.`) yerine direct access kullanildi.
- [x] P0-1: `FileUploader.tsx` remove button `aria-label` locale-aware: `(t.aria?.removeFile || 'Remove {{name}}').replace('{{name}}', file.name)`.
- [x] P0-1: Locale keyleri eklendi (EN+TR parity): `aria.removeFile`, `analysisHistory.clearAll/clearAllConfirm/entryCount`, `searchPage.badges`.
- [x] P0-2: `SearchItem.category` tipi `'pages' | 'features'` -> `'product' | 'feature' | 'page'`. `buildSearchItems()` semantik esleme duzeltildi (catalog -> product, feature items -> feature, page items -> page).
- [x] P0-2: `/search` sayfasi `SearchResult.type` ayni 3-way union'a hizalandi. Badge gosterimi `sp.badges[result.type]` ile locale-aware.
- [x] P1-3: `useLocalHistory` V1->V2 rewrite — multi-entry (max 20, newest first), `entries` array, `removeById(timestamp)`, `clear()`, backward-compat `lastEntry`/`save`/`remove`. V1 single-entry format auto-migration.
- [x] P1-3: `analysis-history/index.tsx` multi-entry UI — entry listesi, entry count, clearAll butonu (confirm dialog), per-entry removeById.
- [x] P1-3: `analysis-history.module.css` overflow fix — `.entry-input-text` overflow/text-overflow/ellipsis + `max-width: 480px`. Yeni stiller: `.list-header`, `.entry-count`, `.clear-all-btn`, `.entries-list`.
- [x] P2-4: `.github/workflows/ci.yml` — `cache-dependency-path: platform/package-lock.json` -> `package-lock.json` (4 job duzeltildi).
- [x] P2-4: Node 24 canary job eklendi — `node-version: '24'`, `continue-on-error: true`, lint+type-check+test+build.
- [x] Test: `__tests__/hooks/useLocalHistory.test.ts` — 7 test (empty init, newest-first, cap at 20, removeById, clear, V1 migration, backward-compat remove).
- [x] Test: `__tests__/hooks/useSearch.test.ts` — 4 test (catalog->product, page->page, feature->feature, only valid categories).
- [x] Test: `__tests__/pages/smoke.test.tsx` — long input render testi (300 char URL, CSS overflow dogrulamasi).

### Faz S Degisiklik Ozeti

| Dosya | Degisiklik | Risk |
| --- | --- | --- |
| `platform/locales/en.json` | aria.removeFile, analysisHistory.*, searchPage.badges | Dusuk — additive |
| `platform/locales/tr.json` | Ayni keyler TR karsiligi | Dusuk — additive |
| `platform/pages/creator-studio/index.tsx` | EN fallback kaldirildi | Dusuk — key var |
| `platform/pages/analysis-history/index.tsx` | Multi-entry UI + fallback kaldirildi | Orta — UI degisikligi |
| `platform/pages/system-status/index.tsx` | EN fallback kaldirildi | Dusuk — key var |
| `platform/components/MLToolkit/FileUploader.tsx` | aria-label locale-aware | Dusuk |
| `platform/hooks/useSearch.ts` | category type + esleme | Orta — tum tuketiciler etkileniyor |
| `platform/pages/search.tsx` | type union + badge locale | Dusuk — UI iyilestirme |
| `platform/hooks/useLocalHistory.ts` | V2 rewrite (multi-entry) | Orta — backward-compat API korundu |
| `platform/styles/pages/analysis-history.module.css` | overflow fix + yeni stiller | Dusuk |
| `.github/workflows/ci.yml` | cache path fix + Node 24 canary | Dusuk — canary non-blocking |
| `platform/__tests__/hooks/useLocalHistory.test.ts` | 7 yeni test | Dusuk — sadece test |
| `platform/__tests__/hooks/useSearch.test.ts` | 4 yeni test | Dusuk — sadece test |
| `platform/__tests__/pages/smoke.test.tsx` | 1 yeni test (long input) | Dusuk — sadece test |

### Backward Compat Notlari

- **useLocalHistory**: V1 tek-obje format auto-migrate ediliyor. `lastEntry`, `save`, `remove` ayni API ile calisiyor. `useCommend` degisiklik gerektirmiyor.
- **SearchItem.category**: `'pages'` -> `'page'`, `'features'` -> `'feature'`. Tek tuketici `search.tsx` ayni committe guncellendi.
- **Node 24 canary**: `continue-on-error: true` — deploy/merge gate'i etkilemiyor.

---

## Tur 5.18.1 - Faz S.1 Acceptance Hotfix

- Durum: uygulama tamamlandi, analist dogrulamasina hazir.
- Kok neden:
  - `removeById(timestamp)` timestamp tabanli id modelinin tekil olmamasi — ayni milisaniyede olusan kayitlar toplu siliniyordu.
  - Fallback temizliginin kismen tamamlanmis olmasi — `analysis-history`, `FileUploader`, `search` badge'de hardcoded EN fallbacklar kalmisti.

### Faz S.1 Cikisli Gorevler

- [x] P0: `useLocalHistory.ts` — `HistoryEntry<T>` icine `id: string` alani eklendi. Yeni kayitlar `generateId()` ile benzersiz id aliyor (timestamp + counter + random suffix). `removeById` artik `id: string` parametresi aliyor, sadece tek kaydi siliyor.
- [x] P0: V1/V2 migration — eski kayitlarda `id` yoksa `readAll()` sirasinda otomatik id enjekte ediliyor.
- [x] P0: `analysis-history/index.tsx` — liste key'i `entry.id`, delete action `removeById(entry.id)` kullaniyor.
- [x] P0: `useLocalHistory.test.ts` — `removeById` testi id-bazli hale getirildi. Collision-safe test eklendi (ayni `Date.now()` degerine sahip iki kayit, sadece hedeflenen silinir).
- [x] P1: `analysis-history/index.tsx` — `ah.entryCount || ...`, `ah.clearAllConfirm || ...`, `ah.clearAll || ...` fallbacklari kaldirildi. Locale key zorunlu contract.
- [x] P1: `FileUploader.tsx` — `t.aria?.removeFile || 'Remove {{name}}'` fallback kaldirildi. `t.aria.removeFile` zorunlu contract.
- [x] P1: `search.tsx` — `sp.badges?.[result.type] || result.type` fallback kaldirildi. `sp.badges[result.type]` zorunlu contract.
- [x] P2: `smoke.test.tsx` — long-input test entry'sine `id` alani eklendi.

### Faz S.1 Degisiklik Ozeti

| Dosya | Degisiklik | Risk |
| --- | --- | --- |
| `platform/hooks/useLocalHistory.ts` | `id` alani + `generateId()` + id-bazli removal | Orta — backward-compat korundu |
| `platform/pages/analysis-history/index.tsx` | `entry.id` key/remove + fallback temizligi | Dusuk |
| `platform/components/MLToolkit/FileUploader.tsx` | aria-label fallback kaldirildi | Dusuk |
| `platform/pages/search.tsx` | badge fallback kaldirildi | Dusuk |
| `platform/__tests__/hooks/useLocalHistory.test.ts` | id-bazli testler + collision-safe test | Dusuk — sadece test |
| `platform/__tests__/pages/smoke.test.tsx` | long-input entry'ye id eklendi | Dusuk — sadece test |

### Backward Compat Notlari

- **useLocalHistory**: V1 tek-obje ve V2 id-siz array kayitlari read sirasinda otomatik id alarak migrate ediliyor. `lastEntry`, `save`, `remove`, `clear` API'si degismedi. `removeById` parametre tipi `number` (timestamp) -> `string` (id) olarak degisti — tek tuketici `analysis-history` ayni committe guncellendi.
- **Locale contract**: `ah.entryCount`, `ah.clearAllConfirm`, `ah.clearAll`, `t.aria.removeFile`, `sp.badges[type]` artik zorunlu — key yoksa runtime error. Keyler Faz S'de her iki locale'a eklenmisti, sorun yok.

---

## Tur 5.19 - Faz T (Search Registry Single Source + Product Unification + System Status Realism)

- Durum: uygulama tamamlandi, analist dogrulamasina hazir.

### Faz T Sonuc

- [x] Search registry single source: hardcoded EN fallbacklar useSearch.ts'den tamamen kaldirildi, SEARCH_REGISTRY + dot-path locale resolution ile degistirildi.
- [x] search.tsx fallbacklari temizlendi (description empty-string fallback, searchMeta keywords EN fallback).
- [x] Footer product links PRODUCT_CATALOG + FOOTER_PRODUCT_IDS'den turetiliyor — href'ler tek kaynaktan.
- [x] Footer aria-label EN fallbacklari temizlendi (github, website, email).
- [x] System Status realism: last-checked timestamp, degraded state (kismi bozulma), demo mode label.
- [x] product-catalog.ts'e FOOTER_PRODUCT_LOCALE_MAP, getProductHref helper'lari eklendi.
- [x] Yeni test dosyasi: product-catalog.test.ts (getProductHref, FOOTER_PRODUCT_IDS integrity, resolveKey, catalog uniqueness).
- [x] useSearch.test.ts genisletildi: registry resolution testleri (dot-path title, description, cross-section keys, missing keys).
- [x] smoke.test.tsx genisletildi: system-status last-checked, demo label, degraded state testleri.

### Faz T Cikisli Claude Gorevleri

- [x] P0: `useSearch.ts` — hardcoded static items kaldirildi, SEARCH_REGISTRY + resolveKey ile registry-driven resolution. Catalog items resolveProduct ile, registry items resolveKey ile cozumleniyor.
- [x] P0: `search.tsx` — `item.description || ''` -> `item.description ?? ''`, `t.searchMeta?.keywords || 'search, projects'` -> `t.searchMeta?.keywords`.
- [x] P1: `Footer.tsx` — product links FOOTER_PRODUCT_IDS + FOOTER_PRODUCT_LOCALE_MAP + getProductHref ile turetiliyor. Hardcoded href array kaldirildi.
- [x] P1: `Footer.tsx` — `t.aria?.github || 'GitHub'`, `t.aria?.website || 'Website'`, `t.aria?.email || 'Email'` fallbacklari kaldirildi. Direct access: `t.aria.github`.
- [x] P1: `product-catalog.ts` — `FOOTER_PRODUCT_LOCALE_MAP` (id -> footer locale key), `getProductHref(id)` helper eklendi.
- [x] P1: `system-status/index.tsx` — `lastChecked` state + gosterimi, `isDegraded` hesaplamasi (some ok + some error), `isDemoMode` label (NEXT_PUBLIC_API_URL yoksa).
- [x] P1: `system-status.module.css` — `.status-dot-degraded` (amber), `.last-checked`, `.demo-label` stilleri.
- [x] P1: Locale keyleri eklendi (EN+TR parity): `systemStatus.degraded`, `systemStatus.lastChecked`, `systemStatus.demoMode`.
- [x] P2: `__tests__/config/product-catalog.test.ts` — 10 test (getProductHref catalog/registry/unknown, FOOTER_PRODUCT_IDS href+locale integrity, resolveKey nested/top/missing/non-string, catalog+registry unique IDs, no ID collision).
- [x] P2: `__tests__/hooks/useSearch.test.ts` — 5 yeni test (registry resolution: dot-path title, feature title+desc, cross-section keys, omit desc when no key, empty for unresolvable). Mock jest.requireActual ile SEARCH_REGISTRY + resolveKey gercek degerler.
- [x] P2: `__tests__/pages/smoke.test.tsx` — 3 yeni test (last-checked timestamp, demo label, degraded state with partial fetch failure).

### Faz T Degisiklik Ozeti

| Dosya | Degisiklik | Risk |
| --- | --- | --- |
| `platform/config/product-catalog.ts` | FOOTER_PRODUCT_LOCALE_MAP + getProductHref | Dusuk — additive |
| `platform/hooks/useSearch.ts` | Registry-driven resolution | Orta — search data kaynagi degisti |
| `platform/pages/search.tsx` | Fallback temizligi | Dusuk — key var |
| `platform/components/Layout/Footer.tsx` | Catalog-driven product links + aria fallback temizligi | Orta — footer render degisti |
| `platform/pages/system-status/index.tsx` | lastChecked + degraded + demoMode | Dusuk — additive UI |
| `platform/styles/pages/system-status.module.css` | 3 yeni CSS class | Dusuk — additive |
| `platform/locales/en.json` | systemStatus.degraded/lastChecked/demoMode | Dusuk — additive |
| `platform/locales/tr.json` | Ayni keyler TR karsiligi | Dusuk — additive |
| `platform/__tests__/config/product-catalog.test.ts` | 10 yeni test | Dusuk — sadece test |
| `platform/__tests__/hooks/useSearch.test.ts` | 5 yeni + mock guncelleme | Dusuk — sadece test |
| `platform/__tests__/pages/smoke.test.tsx` | 3 yeni test | Dusuk — sadece test |

### Backward Compat Notlari

- **useSearch.ts**: `buildSearchItems(t)` ayni API, ayni return tipi. Dahili veri kaynagi hardcoded array'den registry'ye degisti — tuketiciler etkilenmiyor.
- **Footer.tsx**: Ayni product listesi, ayni siralama. Href'ler artik catalog'dan geliyor — yeni urun eklendiginde FOOTER_PRODUCT_IDS + FOOTER_PRODUCT_LOCALE_MAP guncellenmeli.
- **System Status**: Mevcut fonksiyonellik korundu. lastChecked/degraded/noExternalBackend ek bilgi olarak gosteriliyor.

---

## Tur 5.19.1 - Faz T.1 Acceptance Hotfix

- Durum: uygulama tamamlandi, analist dogrulamasina hazir.
- Kok nedenler:
  - Footer'da `productLinks` ile diger section linkleri arasinda tip uyumsuzlugu — `external` property'si olmayan product links, `external: true` iceren linklerle ayni array'de TS hatasina yol aciyordu.
  - `FOOTER_PRODUCT_LOCALE_MAP` `Record<string, string>` ile genis tipliydi — `FooterProductId` ile daraltilmamisti.
  - `resolveKey()` sessizce bos string donuyordu — eksik locale keyleri runtime'da gorulmez UI bosluguna yol aciyordu.
  - `demoMode` label semantik olarak yanlis — NEXT_PUBLIC_API_URL olmamasi "demo" degil, "harici backend yapilandirilmamis" anlamina geliyor.

### Faz T.1 Cikisli Gorevler

- [x] P0: `Footer.tsx` — `FooterLink` interface (`label: string; href: string; external?: boolean`) ve `FooterSection` interface eklendi. `productLinks` ve `footerSections` explicit tip ile modellendi. `link.external` kontrolu TS-safe.
- [x] P0: `product-catalog.ts` — `FooterProductId = typeof FOOTER_PRODUCT_IDS[number]` type eklendi. `FOOTER_PRODUCT_LOCALE_MAP` tipi `Record<string, string>` -> `Record<FooterProductId, string>` daraltildi.
- [x] P1: `product-catalog.ts` — `resolveKey()` contract sertlestirildi:
  - `NODE_ENV !== 'production'` (dev/test): eksik key icin `throw new Error('[resolveKey] Missing locale key: "path"')`.
  - Production: bos string yerine `[path]` gorsel sinyal donuyor.
- [x] P1: `useSearch.ts` — degisiklik gerekmedi. `resolveKey` sadece registered keys icin cagriliyor, `descriptionKey` guard mevcut.
- [x] P1: `__tests__/config/product-catalog.test.ts` — "missing key => empty string" beklentileri "missing key => throw" ile degistirildi.
- [x] P1: `__tests__/hooks/useSearch.test.ts` — "unresolvable => empty string" beklentisi "unresolvable => throw" ile degistirildi.
- [x] P2: `system-status/index.tsx` — `isDemoMode` -> `noExternalBackend` degisken adi. `ss.demoMode` -> `ss.noExternalBackend` locale key.
- [x] P2: Locale keyleri guncellendi (EN+TR parity): `systemStatus.demoMode` -> `systemStatus.noExternalBackend`. EN: "External backend not configured — only local API endpoints are monitored". TR: "Harici backend yapilandirilmadi — yalnizca yerel API uc noktalari izleniyor".
- [x] P2: `smoke.test.tsx` — "Demo modu" text assertion "Harici backend" ile degistirildi.

### Faz T.1 Degisiklik Ozeti

| Dosya | Degisiklik | Risk |
| --- | --- | --- |
| `platform/components/Layout/Footer.tsx` | FooterLink/FooterSection type + explicit typing | Dusuk — davranis degismedi |
| `platform/config/product-catalog.ts` | FooterProductId type + resolveKey fail-fast | Orta — dev'de eksik key artik crash |
| `platform/pages/system-status/index.tsx` | isDemoMode -> noExternalBackend | Dusuk — sadece label |
| `platform/locales/en.json` | demoMode -> noExternalBackend | Dusuk — key rename |
| `platform/locales/tr.json` | demoMode -> noExternalBackend | Dusuk — key rename |
| `platform/__tests__/config/product-catalog.test.ts` | empty string -> throw assertion | Dusuk — sadece test |
| `platform/__tests__/hooks/useSearch.test.ts` | empty string -> throw assertion | Dusuk — sadece test |
| `platform/__tests__/pages/smoke.test.tsx` | Demo modu -> Harici backend text | Dusuk — sadece test |

### Backward Compat Notlari

- **resolveKey**: Production davranisi bos string'den `[path]` sinyaline degisti — UI'da bozmasi olmayan ama eksik ceviriyi gorunur kilan bir degisiklik. Dev/test ortaminda artik hard fail.
- **Footer**: Ayni render ciktisi, sadece TypeScript seviyesinde tip guvenligi eklendi.
- **System Status**: `demoMode` locale key `noExternalBackend` ile degistirildi — hem EN hem TR parity korundu.
