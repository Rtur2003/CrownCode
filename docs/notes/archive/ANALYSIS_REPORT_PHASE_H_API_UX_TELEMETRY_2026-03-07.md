# CrownCode Phase H Analysis (2026-03-07)

## Scope

- Bu fazda sadece analiz yapildi, uygulama kodu degistirilmedi.
- Odak:
  - API UX contract tutarliligi (analyze/process/commend)
  - telemetry zinciri ve production hata taksonomisi
  - Claude tarafinda tamamlanan Faz G ciktilarinin dogrulanmasi

## Claude Output Verification Snapshot

1. Tamamlananlar (dogrulandi)
- `platform/pages/api/vitals.ts` ve `platform/pages/api/errors.ts` eklendi.
- `platform/package.json` icinde `i18n:check` scripti var.
- `.github/workflows/ci.yml` icinde `i18n locale parity check` adimi var.
- `platform/__tests__/api/telemetry.test.ts` ve `platform/__tests__/a11y/accessibility.test.tsx` eklendi.
- `platform/components/UI/Toast/Toast.tsx` ve `platform/pages/ai-music-detection/index.tsx` aria alanlarinda locale key kullanimi eklendi.

2. Bu tur analist dogrulama komutlari
- `cmd /c npm --prefix platform run i18n:check` -> **passed**
- `cmd /c npm --prefix platform run lint` -> **passed**
- `cmd /c npm --prefix platform run type-check` -> **passed**
- `cmd /c npm --prefix platform test -- --runInBand` -> **passed** (4 suite / 26 test)
- `cmd /c npm --prefix platform run build` -> **passed**

Not:
- Testler yesil olsa da `act(...)` warningleri devam ediyor (a11y testlerinde).

## P0 Findings (Critical)

1. Backend hatalari sessizce "preview success"e degrade olabiliyor.
- Kanit: `hf-crowncode-backend/app/routes/analyze.py:83`, `hf-crowncode-backend/app/routes/analyze.py:95`, `hf-crowncode-backend/app/routes/analyze.py:99` backend tarafinda `missing_url`, `invalid_source_type`, `internal_error` donuyor.
- Kanit: `platform/hooks/analysisGateway.ts:69` ve `platform/hooks/analysisGateway.ts:73` tanimsiz error code'lar `backend_unexpected_response`e dusuyor.
- Kanit: `platform/hooks/useYouTubeAnalysis.ts:224` ve `platform/hooks/useFileAnalysis.ts:206` `backend_unexpected_response` durumunda preview fallback calisiyor.
- Etki:
  - Gercek backend incidentleri kullaniciya "basarili analiz" gibi yansiyabilir.
  - Incident triage zorlasir.

2. API hata kontrati endpointler arasinda daginik, frontend ham hata metni gosterebiliyor.
- Kanit: `hf-crowncode-backend/app/routes/analyze.py:69`-`hf-crowncode-backend/app/routes/analyze.py:99` -> HTTP 200 + `errors[]` modeli.
- Kanit: `hf-crowncode-backend/app/routes/data_processing.py:29`, `hf-crowncode-backend/app/routes/data_processing.py:35`, `hf-crowncode-backend/app/routes/data_processing.py:52` -> HTTPException `detail` string modeli.
- Kanit: `hf-crowncode-backend/app/routes/commend/router.py:286` -> 409'da `detail` obje, `hf-crowncode-backend/app/routes/commend/router.py:301` -> 500'de `detail` string.
- Kanit: `platform/pages/data-manipulation/index.tsx:117` backend `detail` dogrudan UI mesaja donuyor.
- Kanit: `platform/hooks/useCommend.ts:139` ve `platform/hooks/useCommend.ts:201` detail string/JSON karisik parse edilip kullanıcıya aktariliyor.
- Etki:
  - UX tutarsiz hata dili.
  - Teknik detay sizmasi ve lokalizasyon disi metin riski.

## P1 Findings (High)

1. Commend testleri kontrat regresyonunu yakalamiyor.
- Kanit: `hf-crowncode-backend/app/routes/commend/router.py:43` request `videoUrl`, `hf-crowncode-backend/app/routes/commend/router.py:48` `commentStyle` bekliyor.
- Kanit: `hf-crowncode-backend/tests/test_commend.py:32` ve `hf-crowncode-backend/tests/test_commend.py:34` eski alan adlari (`url`, `style`) ile test ediyor.
- Kanit: `hf-crowncode-backend/tests/test_commend.py:37` ve `hf-crowncode-backend/tests/test_commend.py:50` genis status araligi (`400/401/422`) kabul ediyor.
- Etki:
  - Schema drift olsa da testler yesil kalabilir.

2. i18n parity scripti array-icindeki object key'leri denetlemiyor.
- Kanit: `platform/scripts/check-locale-parity.mjs:27` sadece object recursing yapiyor, `!Array.isArray(...)` sarti ile arrayleri leaf kabul ediyor.
- Kanit: `platform/locales/en.json:669`-`platform/locales/en.json:687` array-icinde object (`installation.steps[].title/description`) var.
- Etki:
  - Array item key drift'leri CI tarafinda kacabilir.

3. Yeni a11y testleri baseline sagliyor ama modal davranisini gercekten test etmiyor.
- Kanit: `platform/__tests__/a11y/accessibility.test.tsx:103` ve `platform/__tests__/a11y/accessibility.test.tsx:112` "dialog olmasin" senaryosu.
- Kanit: `platform/__tests__/a11y/accessibility.test.tsx:108` ve `platform/__tests__/a11y/accessibility.test.tsx:115` modal kapali oldugu icin `null` assert ediliyor.
- Etki:
  - Acik modal icin `role`, `aria-modal`, focus-trap, escape/return-focus regresyonlari yakalanmaz.

## P2 Findings (Medium)

1. Telemetry endpointleri su an log-only, operasyonel hardening eksik.
- Kanit: `platform/pages/api/vitals.ts:31` `console.log`, `platform/pages/api/errors.ts:30` `console.error`.
- Etki:
  - Yuksek trafikte log gürültüsü.
  - Sampling/rate-limit olmadan maliyet ve sinyal/noise problemi.

2. Commend ve data-manipulation fetch cagrilarinda timeout/abort standardi yok.
- Kanit: `platform/hooks/useCommend.ts:125` ve `platform/hooks/useCommend.ts:175` dogrudan fetch.
- Kanit: `platform/pages/data-manipulation/index.tsx:110` dogrudan fetch.
- Etki:
  - Yavas/ag kopuklugunda askida kalan UX akislari.

3. Health endpoint memory metrikleri process heap ile sinirli; sistem kapasitesi degil.
- Kanit: `platform/pages/api/health.ts:52` `heapTotal` "limit" olarak kullaniliyor.
- Etki:
  - Operasyon tarafinda yanlis kapasite algisi.

## Claude Task Pack (Phase H)

1. P0 - Error taxonomy standardi
- `hf-crowncode-backend/app/routes/analyze.py` icin canonical error code seti finalize et.
- `platform/hooks/analysisGateway.ts` mappingine eksik kodlari ekle (`missing_url`, `invalid_source_type`, `internal_error` vb.).
- `useYouTubeAnalysis` / `useFileAnalysis` fallback kuralini daralt:
  - sadece network/config kaynakli durumlarda preview fallback
  - backend internal/contract hatasinda kullaniciya acik hata state.

2. P0 - API error envelope birlestirme
- `data_processing` ve `commend` endpointlerinde `detail` yerine standard `{ code, message }` envelope kullan.
- Frontend tarafinda ham backend metni basma; locale key map zorunlu olsun.

3. P1 - Testlerin kontrat kalitesini artir
- `hf-crowncode-backend/tests/test_commend.py` payload alanlarini guncel schema ile hizala.
- Status araligi yerine spesifik beklentiler yaz (ornek: 422 invalid schema, 403 posting kapali).
- `analysisGateway` icin `missing_url`, `invalid_source_type`, `internal_error` map testleri ekle.
- a11y testlerinde modal acik senaryo + focus davranisi assert et.

4. P1 - i18n parity scriptini genislet
- `check-locale-parity.mjs` array icindeki objectleri de recursive kontrol edecek sekilde guncelle.

5. P2 - Telemetry hardening
- `/api/vitals` ve `/api/errors` icin basit sampling/rate-limit + request-id ekle.
- Telemetry acma/kapama icin env bazli gate tanimla (`FEATURE_WEB_VITALS` gibi).

## Verification Targets (Analist/Codex)

1. `cmd /c npm --prefix platform run i18n:check`
2. `cmd /c npm --prefix platform run lint`
3. `cmd /c npm --prefix platform run type-check`
4. `cmd /c npm --prefix platform test -- --runInBand`
5. `cmd /c npm --prefix platform run build`
6. `python -m pytest hf-crowncode-backend/tests -q`

## Ready-to-Send Handoff (Claude)

`D:\CrownCode\docs\notes\ANALYSIS_REPORT_PHASE_H_API_UX_TELEMETRY_2026-03-07.md` dosyasini baz alarak uygula. P0->P2 sirasi korunacak. Test komutlarini Claude kosmayacak; sadece dosya degisiklik raporu verecek. Test ve dogrulama adimlarini analist (Codex) kosacak.
