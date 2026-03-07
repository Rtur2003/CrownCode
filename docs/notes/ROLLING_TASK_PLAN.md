# Rolling Task Plan (Gecici)

> Amac: Bu dosya kalici referans degil, dongusel gorev panosudur.
> Kural: Her yeni turda icerik sifirlanir, sadece aktif tur yazilir.
> Son Gecerlilik Tarihi: **31 Aralik 2026**

## Tur Durumu

- Son guncelleme: **7 Mart 2026**
- Tur: **Tur 5 - Asamali Platform Analizi (Faz G tamamlandi)**
- Mod: Faz bazli ilerleme (P0 -> P3)
- Analiz raporu: `docs/notes/ANALYSIS_REPORT_PHASE_G_I18N_A11Y_AUTOMATION_2026-03-07.md`

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

## Zorunlu Dogrulama (Claude)

1. `cmd /c npm --prefix platform run lint`
2. `cmd /c npm --prefix platform run type-check`
3. `cmd /c npm --prefix platform test -- --runInBand`
4. `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"`
5. `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"`

Not:
- Build komutlari ayni anda paralel kosulmamali; `.next` uzerinde cakisma olusturabilir.

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

- [ ] P0: Telemetry endpointlerini gercekle (`platform/pages/api/vitals.ts`, `platform/pages/api/errors.ts`) ve `/api/version` `webVitals` bayragini gercek duruma bagla.
- [ ] P0: CI'ya i18n/a11y quality gate ekle (`check-locale-parity`, `check-hardcoded-ui-text`, zorunlu PR job).
- [ ] P1: Crown Dreams placeholder contract duzelt (`appearsIn` key semantigi + render templating).
- [ ] P1: Header/Footer/SearchModal/Shortcuts/ExternalLink/Toast/AI upload hardcoded aria/title metinlerini locale key'lere tasi.
- [ ] P1: `useSearch` ve Crown Vote fallback borcunu azalt; eksik keyleri CI fail edecek modele gec.
- [ ] P1: Semantic a11y test paketi ekle (`jest-axe` + dialog/landmark/focus davranisi).
- [ ] P2: `Html lang` runtime locale senkronu + Hero landmark rol sadeleme.

### Faz G Dogrulama Logu

- [x] `cmd /c npm --prefix platform run lint` -> passed
- [x] `cmd /c npm --prefix platform run type-check` -> passed
- [x] `cmd /c npm --prefix platform test -- --runInBand` -> passed (2 suite / 16 test)
- [x] `cmd /c npm --prefix platform run build` -> passed
- [x] `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"` -> passed (beklenen static/API warning)

### Siradaki Analiz

- [ ] Faz H: API UX contract + telemetry dashboardleme + production error taxonomy standardizasyonu.
