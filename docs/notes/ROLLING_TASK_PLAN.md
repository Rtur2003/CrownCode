# Rolling Task Plan (Gecici)

> Amac: Bu dosya kalici referans degil, dongusel gorev panosudur.
> Kural: Her yeni gorev turunda icerik tamamen temizlenir ve yeniden yazilir.
> Son Gecerlilik Tarihi: **31 Aralik 2026**
> Bu tarihten sonra islem: **dosyayi sil veya tarihi guncelleyip yeni tur baslat**.

## Yenileme Protokolu

1. Once mevcut maddeleri tamamlandi/iptal olarak kapat.
2. Dosya icerigini tamamen temizle.
3. Yeni tur icin sadece guncel gorevleri ekle.
4. Gerekirse "Son Gecerlilik Tarihi"ni ileri al.

## Tur Durumu

- Son guncelleme: **4 Mart 2026**
- Mod: Faz bazli ilerleme + APEI protokolu

## Mimari Not

Iki backend aktif:

- `backend/` = core (minimal FastAPI: health + youtube analysis)
- `hf-crowncode-backend/` = advanced (full FastAPI: commend, data processing, analyze, preview model)

`hf-crowncode-backend/` root `.gitignore`'da ayri repo olarak ignore ediliyor (satir 120).
CI/Makefile sadece `backend/` hedefliyor; `hf-crowncode-backend/` kendi yasam dongusune sahip.

---

## Bu Turun Gorevleri

### Faz 0 - Repo Topolojisi ve Operasyon Senkronu

- [x] Makefile: dual backend target'lari eklendi (`*-core`, `*-hf`), kirik `backend/` yollari duzeltildi.
- [x] `.github/dependabot.yml`: var olmayan `/projects/*` yollari kaldirildi, `hf-crowncode-backend` pip eklendi, target-branch `geliştirme` yapildi.
- [x] `.github/CODEOWNERS`: var olmayan `/projects/*` bloklari kaldirildi, `/hf-crowncode-backend/` eklendi, phantom dosya referanslari temizlendi.
- [x] `.github/workflows/engineering-standards.yml`: backend degisim kontrolune `hf-crowncode-backend/` eklendi.
- [x] ROLLING_TASK_PLAN.md yeni tur olarak sifirlandi.

### Faz 1 - Guvenlik ve Fonksiyonel P0 Duzeltmeleri

- [x] URL dogrulama: `domain in url` substring → exact-host set lookup (validation.py, url_parser.py, useYouTubeAnalysis.ts).
- [x] CORS: wildcard + credentials kombinasyonu duzeltildi — `allow_credentials` sadece explicit origin listesinde `True` (backend + hf-backend).
- [x] Audio augmentation: Pydantic `AudioAugmentationOptions` camelCase alias + `populate_by_name` eklendi.
- [x] Fortune counter: `NEXT_PUBLIC_ENABLE_FORTUNE_COUNTER` feature flag eklendi, false iken fetch yapilmaz.
- [x] `analysisMode` field: `useFileAnalysis.ts` ve `useYouTubeAnalysis.ts` preview/production mode eklendi (build-blocking TS hatasi cozuldu).

### Faz 2 - Hibrit Preview Urunlestirme

- [x] AI Detection: `analysisMode === 'preview'` oldiginda sonuc kartinda "Preview" badge gosteriliyor (CSS: `.preview-badge`).
- [x] Crown Dreams: header'a "Demo Data" / "Demo Verisi" badge eklendi (locale + CSS: `.demo-badge`).
- [x] Fortune counter: `NEXT_PUBLIC_ENABLE_FORTUNE_COUNTER=false` ile counter gizli; true iken gercek API'den veri aliniyor (simulated base zaten sadece bootstrap).

### Faz 3 - i18n + Legacy Temizlik

- [x] Hardcoded fallback: Incelendi, mevcut `||` fallback'ler locale anahtarlariyla eslesiyor (defensive coding). Gercek i18n ihlali yok.
- [x] `sw.js`: `devforge-suite-v1` → `crowncode-v2`, cache isimleri guncellendi, `/projects`, `/about`, `/contact` → gercek CrownCode route'lari, `/api/` cache kaldirildi.
- [x] `tailwind.config.js`: `.devforge-container` → `.crowncode-container` (kullanilmiyordu ama isim duzeltildi).
- [x] `version` endpoint: hardcoded `14.2.33` → `require('next/package.json').version` dinamik okuma.
- [x] Olu kod: `mapBackendResponse` + `BackendResponse` + `BackendSummary` interfaceleri + kullanilmayan `DecisionSource` import'u kaldirildi.

---

## Siradaki Adim

Tum fazlar tamamlandi.

## Tamamlananlar (Log)

- [x] 2026-03-04: Faz 0 tamamlandi - Makefile dual backend, dependabot `/projects/*` temizlendi, CODEOWNERS guncellendi, workflow `hf-crowncode-backend/` izleme eklendi.
- [x] 2026-03-04: Faz 1 tamamlandi - URL exact-host, CORS wildcard+credentials fix, audio camelCase alias, fortune counter feature flag, analysisMode field eklendi. lint/tsc/test/build temiz.
- [x] 2026-03-04: Faz 2 tamamlandi - AI Detection preview badge, Crown Dreams demo badge, fortune counter feature flag ile hibrit mod netlestirme. lint/tsc/test/build temiz.
- [x] 2026-03-04: Faz 3 tamamlandi - sw.js DevForge→CrownCode, tailwind legacy utility, version endpoint dinamik, mapBackendResponse olu kod temizligi. lint/tsc/test/build temiz.
