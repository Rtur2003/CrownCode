# Analysis Report - Phase M Module Reliability and Product Growth (2026-03-08)

## Scope
- Target: `platform/` page-level product behavior, cross-module reliability, growth opportunities.
- Focus:
  - "moduller gercekten calisiyor mu?" guvencesi
  - tekrarli kod/parca-katalog sorunlari
  - yaratıcı ama uygulanabilir yeni sayfa ve akış onerileri
- Mode: analyst-only (no feature implementation in this phase).

## Validation Snapshot (Analyst)
- `cmd /c npm --prefix platform run lint` -> PASS
- `cmd /c npm --prefix platform run type-check` -> PASS

## P0 Findings (Critical / Operational)

1. Product catalog tek kaynakta degil; IA farkli katmanlarda ayrisiyor.
- Evidence: `platform/components/Home/ProjectsSection.tsx` urun listesi local array ile tanimli.
- Evidence: `platform/hooks/useSearch.ts:27` farkli bir `searchItems` listesi var.
- Evidence: `platform/pages/search.tsx:29` ucuncu bir `searchableContent` listesi var.
- Impact:
  - Bir urun eklendiginde Home, global search, `/search` farkli sonuclar uretebilir.
  - Yeni sayfa rollout'lari kirilgan hale gelir.

2. Kritik network akislarinda timeout/abort standardi yok.
- Evidence: `platform/hooks/analysisGateway.ts:50` dogrudan `fetch`.
- Evidence: `platform/pages/data-manipulation/index.tsx:110` dogrudan `fetch`.
- Evidence: `platform/hooks/useCommend.ts:153` ve `platform/hooks/useCommend.ts:206` dogrudan `fetch`.
- Evidence: `platform/components/CrownVote/DownloadSection.tsx:22` dis API call timeout olmadan calisiyor.
- Impact:
  - Yavas agda takili UI, gec biten stale response, kotu retry deneyimi.

3. Deploy/runtime incident halen active risk; product akislari dogrudan etkileniyor.
- Evidence: Faz L incident zinciri (`start-server.js` module-missing) birden fazla deploy id ile tekrarlandi.
- Impact:
  - Yeni ozellik gelistirmekten once runtime stabilizasyonu zorunlu.

## P1 Findings (High / Product Quality)

1. Crown Dreams demo/mok datada calisiyor, aksiyon butonlari gercek akis baslatmiyor.
- Evidence: `platform/pages/crown-dreams/index.tsx:74`-`platform/pages/crown-dreams/index.tsx:95` (tam akis `MOCK_DREAMS` uzerinden).
- Evidence: `platform/pages/crown-dreams/index.tsx:145` ve `platform/pages/crown-dreams/index.tsx:148` (`newDream`, `analytics`) fonksiyonel baglantisiz butonlar.
- Impact:
  - Kullanici urunu gercek servis gibi algilasa da veri kalici degil.
  - Guven hissi azalir.

2. Crown Commend ilk render SSR icerigini zayiflatiyor.
- Evidence: `platform/pages/crown-commend/index.tsx:31`, `platform/pages/crown-commend/index.tsx:79`.
- Impact:
  - Ilk yuklemede spinner-only davranis (TTI/SEO/algilanan kalite etkisi).

3. Sonuc gecmisi (history) moduller arasi standard degil.
- Evidence: Fortune local persistence var (`platform/pages/crown-fortune/index.tsx:361` vb.).
- Evidence: Analysis/Commend akislarinda local/session persistence yok (ilgili hooks/pages icinde localStorage kullanimi yok).
- Impact:
  - Kullanici analiz sonucunu sayfa yenileyince kaybediyor.
  - "tekrar kullanilabilir urun" hissi dusuyor.

4. Metadata/keywords bazi sayfalarda hardcoded kaldi.
- Evidence: `platform/pages/index.tsx:11`-`platform/pages/index.tsx:13`.
- Evidence: `platform/pages/search.tsx:116`.
- Evidence: `platform/pages/data-manipulation/index.tsx:226`.
- Impact:
  - Locale/SEO tutarliligi zayifliyor.

## P2 Findings (Growth and Innovation Opportunities)

1. "Workflow-level" sayfa eksik: moduller bagimsiz adaciklar gibi duruyor.
- Current: AI Detection, Data Manipulation, Commend, Dreams, Fortune ayri sayfalarda.
- Gap: Kullanicinin tek is akisini birlestirecegi bir "studio" yok.

2. Operasyon gorunurlugu son-kullaniciya kapali.
- Current: `/api/health`, `/api/version` var; UI status sayfasi yok.
- Gap: "sistem su an stabil mi?" bilgisi gosterilmiyor.

3. Kalici deger katacak "History/Replay" urunu yok.
- Gap: Geçmis analizler, tekrar calistirma, karsilastirma akisi yok.

## Claude Action Pack (Creative + Practical, Ordered)

1. P0 - Product Registry tek kaynak
- Yeni dosya: `platform/config/product-catalog.ts`
  - tum urun metadata, route, search tags, status burada tutulacak.
- `ProjectsSection`, `useSearch`, `/search` bu kaynagi kullanacak.
- Kabul: ayni urun seti Home + global search + `/search`te birebir ayni.

2. P0 - Async reliability standard
- Yeni util/hook: `platform/hooks/useAsyncRequest.ts` (abort + timeout + retry-policy).
- `analysisGateway`, `useCommend`, `data-manipulation`, `DownloadSection` bu standarda alinacak.
- Kabul: her kritik fetch'te timeout ve abort var; stale response UI state'i bozamiyor.

3. P1 - "Working modules first" hardening
- Crown Dreams UI icin net "demo mode" state card + non-functional actionlarin disable/tooltips.
- Crown Commend `mounted` gate kaldirilip SSR-first render.
- Analysis/Commend icin minimal history persistence (`last_result`, `last_input`) eklensin.

4. P1 - Metadata/i18n parity cleanup
- Home/Search/Data-manipulation hardcoded keywords/metadata locale key'e tasinsin.
- Kabul: TR/EN gecisinde metadata/keywords parity korunur.

5. P2 - New pages (innovation with concrete value)
- `platform/pages/creator-studio.tsx`
  - Tek ekranda: URL analyze -> comment generate -> optional export
  - Kart bazli pipeline UI, step status, copy/export actionlari.
- `platform/pages/analysis-history.tsx`
  - Son N analiz/comment sonucunu timeline olarak gosterir (local-first).
  - "Re-run" ve "compare" aksiyonlari.
- `platform/pages/system-status.tsx`
  - `/api/health` + `/api/version` polling; feature flags + latency + last failure badge.

## Acceptance Criteria
- Core reliability:
  - Home, search modal, `/search` ayni katalogu kullanir.
  - En az 4 kritik fetch akisi timeout+abort standardinda.
  - Runtime incident yokken smoke: `/`, `/api/health`, `/api/version`, 3 ana modulde action flow PASS.
- Product growth:
  - Yeni sayfalar nav/search kataloguna kaydedilmis.
  - Creator Studio temel akisi tek ekranda demonstrable.
  - History sayfasinda son calismalar gorunur ve rerun aksiyonu calisir.

## Ready Message for Claude
```md
Faz M basliyor: hedef "calisan moduller + yaratici ama uygulanabilir buyume".

Referans dosya:
- `docs/notes/ANALYSIS_REPORT_PHASE_M_MODULE_RELIABILITY_PRODUCT_GROWTH_2026-03-08.md`

P0 oncelik:
1) Product registry'yi tek kaynaga indir (`platform/config/product-catalog.ts`) ve Home + useSearch + /search bu kaynagi kullansin.
2) `fetch` standardini bir util/hook ile timeout+abort+retry modeline cek (`analysisGateway`, `useCommend`, `data-manipulation`, `DownloadSection`).

P1:
3) Crown Dreams demo-mode UX'i netlestir (non-functional actionlarin davranisi acik).
4) Crown Commend mounted gate'i kaldir, SSR-first render.
5) Analysis/Commend icin minimal local history persistence ekle.
6) Home/Search/Data-manipulation metadata hardcodedlarini locale key'e tasi.

P2:
7) Yeni sayfalar: `/creator-studio`, `/analysis-history`, `/system-status` (MVP seviyesinde).

Teslim:
- Dosya bazli degisiklik ozeti
- P0/P1/P2 checklist
- Hangi yeni route'lar eklendi bilgisi
```
