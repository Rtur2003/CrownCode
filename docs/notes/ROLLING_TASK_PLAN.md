# Rolling Task Plan (Gecici)

> Amac: Bu dosya kalici referans degil, dongusel gorev panosudur.
> Kural: Her yeni turda icerik sifirlanir, sadece aktif tur yazilir.
> Son Gecerlilik Tarihi: **31 Aralik 2026**

## Tur Durumu

- Son guncelleme: **4 Mart 2026**
- Tur: **Tur 4 - Kontrol Sonrasi Yeni Uygulama**
- Mod: Faz bazli ilerleme (P1 -> P3)
- Analiz raporu: `docs/notes/ANALYSIS_REPORT_TUR4_2026-03-04.md`

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

- [ ] P1: `useKeyboardShortcuts` input/textarea/contenteditable guard eklenecek.
- [ ] P1: Search/Shortcuts/ExternalLink icin ortak modal a11y standardi (`role=dialog`, `aria-modal`, focus trap, focus return) uygulanacak.
- [ ] P1: `useYouTubeAnalysis`, `useFileAnalysis`, `useCommend` icin abort + stale request guard eklenecek.
- [ ] P2: Hook/modal i18n fallback/hardcoded metinler locale key'lere tasinacak.
- [ ] P2: `ShortcutsModal` no-op keyboard listener kaldirilacak.
- [ ] P2: `useScrollAnimation` observer cleanup `disconnect()` ile guclendirilecek.
- [ ] P2: `useIsMobile` icindeki `ts-ignore` kalintisi typed helper ile temizlenecek.
- [ ] P3: Search/Shortcuts modal `AnimatePresence` exit akisi sadeleştirilecek.

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
- [ ] Dokuman/CI/devex stale policy fazi (Faz D) beklemede.

### Faz C Cikisli Claude Gorevleri

- [ ] P0: `hf-crowncode-backend/app/routes/commend/router.py` icin auth + rate-limit + abuse korumasi uygula (`/generate` ve `/post`).
- [ ] P0: `hf-crowncode-backend/app/routes/commend/router.py` icin `/post` endpointini env feature-flag ile default kapali modele al.
- [ ] P1: `hf-crowncode-backend/app/routes/commend/router.py` + `hf-crowncode-backend/app/routes/commend/youtube_service.py` URL validatorini exact-host + 11-char video id standardina cek.
- [ ] P1: `hf-crowncode-backend/app/routes/analyze.py` icinde `yt_result.errors` ve partial state bilgisini response contractina yansit.
- [ ] P1: `hf-crowncode-backend/app/routes/data_processing.py` icinde `content_type` null-safe kontrol + max payload limiti ekle.
- [ ] P1: `hf-crowncode-backend/app/services/preview_model.py` deterministik davranis ve `is_ai_generated` / confidence threshold uyumunu duzelt.
- [ ] P2: `platform/hooks/analysisGateway.ts` backend error map kapsamini genislet (`invalid_youtube_url`, `file_too_large`, `file_too_small`, `invalid_file_type`, `youtube_analysis_failed`).
- [ ] P2: `backend/app/services/external_clients.py` + `hf-crowncode-backend/app/services/external_clients.py` health payloadindan `base_url` leakini kaldir (debug mod disi).
- [ ] P2: `.github/workflows/ci.yml` icine core backend pytest job'u ekle; frontend pipeline ile birlikte zorunlu gate yap.
- [ ] P2: `hf-crowncode-backend/README.md` endpoint/env/default anlatimini mevcut kodla senkronize et.
- [ ] P2: HF backend testlerini `analyze`, `data_processing`, `commend` negatif/happy path ile genislet (coverage artisi hedefli).
- [ ] P3: `hf-crowncode-backend/app/routes/analyze.py` mutable list defaultlarini `Field(default_factory=list)` standardina cek.

### Faz C Dogrulama Logu (Analizci)

- [x] `python -m pytest backend/tests -q` -> `20 passed`
- [x] `python -m pytest hf-crowncode-backend/tests -q` -> `7 passed` (coverage toplam ~`%40`)

### Siradaki Analiz

- [ ] Faz D: dokuman/CI/devex zinciri derin analizi (stale policy, repo boundary, automation ownership).
