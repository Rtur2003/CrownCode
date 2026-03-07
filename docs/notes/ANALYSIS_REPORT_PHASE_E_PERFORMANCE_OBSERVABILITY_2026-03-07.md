# CrownCode Phase E Analysis (2026-03-07)

## Scope

- Bu fazda sadece analiz yapildi, kod degisikligi yapilmadi.
- Odak:
  - sayfa bazli performans ve bundle davranisi
  - runtime gozlenebilirlik (web vitals, error telemetry)
  - deploy/devex zinciri ile performansin birlestigi noktalar

## Validation Snapshot

- `cmd /c npm --prefix platform run build` -> **passed**
- `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"` -> **passed**
  - Beklenen uyari: static export API routes'i devre disi birakir.
- `cmd /c "set ANALYZE=true&& npm --prefix platform run build"` -> **failed**
  - `Cannot find module 'webpack-bundle-analyzer'`
- Not: Ilk denemede paralel build kosusu nedeniyle `.next/export` icin `ENOTEMPTY` goruldu; komutlar tek tek kosulunca problem tekrar etmedi.

## Build Size Snapshot (Server Build)

- Shared first load JS: ~`159 kB`
- En buyuk sayfa:
  - `/crown-fortune`: `34 kB` page, `184 kB` first load
  - `/crown-dreams`: `17.5 kB` page, `168 kB` first load
- En buyuk chunk: `platform/.next/static/chunks/11d837d1...js` ~`668 kB` (three.js agirlikli)

## Confirmed Good Points

1. Netlify repo config server-mode ile uyumlu.
- Kanit: `netlify.toml:9`-`netlify.toml:13` (`publish = ".next"`)

2. Fortune counter frontend tarafinda explicit feature flag ile korunuyor.
- Kanit: `platform/pages/crown-fortune/index.tsx:179`

3. Static ve server build farki acik sekilde testlenebilir.
- Kanit: `platform/next.config.js:2`-`platform/next.config.js:3`, `platform/next.config.js:77`-`platform/next.config.js:82`

## P0 Findings (Critical)

1. Deploy zinciri hala iki modele bolunmus; out/.next uyumsuzlugu yeniden fail uretiyor.
- Kanit: `netlify.toml:12` (`.next`)
- Kanit: `.github/workflows/ci.yml:207`-`.github/workflows/ci.yml:217` (deploy `platform/out`)
- Kanit (kullanici logu, 2026-03-07): Netlify `@netlify/plugin-nextjs` adiminda `publish directory .../platform/out not found`
- Etki: build green oldugu halde deploy red; operasyon guveni dusuyor.
- Inference: Netlify UI custom build/publish ayarlari veya stale branch config, repo ayari ile senkron degil.

2. Bundle analiz yolu kirik; regresyon izleme calismiyor.
- Kanit: `platform/next.config.js:56`-`platform/next.config.js:57` (`require('webpack-bundle-analyzer')`)
- Kanit: `platform/package.json:42`-`platform/package.json:67` icinde paket yok
- Kanit: `ANALYZE=true` build direkt `MODULE_NOT_FOUND` ile fail
- Etki: buyuyen bundle'lari olcemiyoruz, performans borcu birikiyor.

## P1 Findings (High)

1. `_app` "lazy" modal stratejisi gercekte eager fetch etkisi uretiyor.
- Kanit: `platform/pages/_app.tsx:17`-`platform/pages/_app.tsx:20` (lazy import)
- Kanit: `platform/pages/_app.tsx:66`-`platform/pages/_app.tsx:70` (tum modallar her zaman render)
- Etki: ilk yukleme paketinde gereksiz JS maliyeti.

2. Runtime gozlenebilirlik zayif (web vitals + error telemetry yok).
- Kanit: `platform/pages/_app.tsx:104`-`platform/pages/_app.tsx:111` (analytics gonderimi yorum satiri)
- Kanit: `platform/components/ErrorBoundary/ErrorBoundary.tsx:41`-`platform/components/ErrorBoundary/ErrorBoundary.tsx:43` (production raporlama yok)
- Kanit: `platform/next.config.js:71`-`platform/next.config.js:74` (production console kaldiriliyor)
- Etki: production sorunlarinda kok neden tespiti zorlasiyor.

3. SW cache politikasi ile no-cache sayfa politikasi cakisiyor.
- Kanit: `platform/public/sw.js:16`-`platform/public/sw.js:24` (`/crown-fortune` cache listesinde)
- Kanit: `platform/public/sw.js:105`-`platform/public/sw.js:113` (page cache yazimi)
- Kanit: `platform/public/_headers:2`-`platform/public/_headers:10` (`/crown-fortune` no-cache)
- Etki: gunluk icerik stale gorunebilir.

4. SW icindeki `setInterval` cleanup yaklasimi worker yasam dongusune ters.
- Kanit: `platform/public/sw.js:191`-`platform/public/sw.js:203`
- Etki: belirsiz calisma davranisi ve gereksiz complexity.

5. Crown Dreams 3D arka plan tum kullanicilara default acik.
- Kanit: `platform/pages/crown-dreams/index.tsx:53`-`platform/pages/crown-dreams/index.tsx:56`
- Kanit: `platform/pages/crown-dreams/index.tsx:114` (direct render)
- Kanit: `platform/components/CrownDreams/GoldenParticles.tsx:65` (`3500` particle)
- Etki: dusuk cihazlarda GPU/CPU baskisi.

6. Public asset footprint yuksek; deploy artifact gereksiz buyuyor.
- Kanit: `platform/public/tarot-original` toplam ~`177 MB` (22 dosya)
- Kanit: kod referanslari `/tarot` altini kullaniyor, `/tarot-original` kullanimi yok (repo taramasi)
- Etki: build/deploy/cdn maliyeti artiyor.

7. Ses dosyalari buyuk olasilikla placeholder/bozuk.
- Kanit: `platform/public/sounds/*.mp3` dosya boyutlari `48` byte
- Kanit: `platform/pages/crown-fortune/index.tsx:187`-`platform/pages/crown-fortune/index.tsx:190` bu dosyalari kullaniyor
- Etki: ses deneyimi gercekci degil, kullaniciya "calismiyor" algisi verebilir.

## P2 Findings (Medium)

1. Header linkleri icin prefetch stratejisi explicit degil.
- Kanit: `platform/components/Layout/Header.tsx:88`-`platform/components/Layout/Header.tsx:90`
- Kanit: `platform/components/Layout/Header.tsx:161`-`platform/components/Layout/Header.tsx:163`
- Etki: ana sayfada onemsiz route'larin erken prefetch'i artabilir.

2. Deploy tooling dili daginik (Netlify + Vercel scriptleri birlikte duruyor).
- Kanit: `package.json:20`-`package.json:21` (`vercel` deploy scripts)
- Etki: ekipte yanlis deploy yolu secilme riski.

3. Netlify `analyze` function dosyasi muhtemelen yetim.
- Kanit: `platform/netlify/functions/analyze.js` var
- Kanit: `platform/hooks/analysisGateway.ts:50` direkt `${apiBaseUrl}/api/analyze` cagiriyor
- Kanit: `netlify.toml` icinde bu function'a route/redirect tanimi yok
- Etki: bakim karmasasi, "hangi yol aktif?" belirsizligi.

## Claude Task Pack (Phase E)

1. P0 - Deploy zinciri tek modele indir
- `.github/workflows/ci.yml` deploy adimini server-mode ile hizala (`.next` artifact veya Netlify native build modeli)
- Netlify UI build settings (base, publish, build command, functions path) ile repo `netlify.toml` bire bir senkronla
- Kabul kriteri: Netlify logunda `publish directory .../out` hatasi tekrar etmesin

2. P0 - Bundle analyzer hattini onar
- `ANALYZE=true` build'in fail etmemesi saglanacak
- `webpack-bundle-analyzer` bagimliligi veya `@next/bundle-analyzer` plugin modeli tek secimle standardize edilecek
- Kabul kriteri: analyzer raporu CI artifact olarak alinabilir

3. P1 - Gercek lazy modal ve gozlenebilirlik
- `_app` icinde modallar context state acikken mount olacak sekilde refactor
- `reportWebVitals` ve `ErrorBoundary` production telemetry sink'ine baglanacak
- `removeConsole` karari telemetry ile uyumlu hale getirilecek

4. P1 - SW cache politikasi duzelt
- `/crown-fortune` icin network-first veya cache bypass uygula
- SW icindeki global `setInterval` cleanup kaldirilip deterministic policy'ye gec
- Kabul kriteri: gunluk icerik stale kalmiyor

5. P1 - Crown Dreams performans guard
- `GoldenParticles` mount'unu cihaz kapasitesi / reduced-motion / visibility ile sartlandir
- Mobil ve dusuk guclu cihazlarda degrade mode tanimla

6. P1/P2 - Asset ve toolchain temizlik
- `public/tarot-original` arsiv stratejisi (repo disina tasima veya LFS) netlestir
- `public/sounds` dosyalari gercek SFX ile degistir
- Root `vercel` deploy scriptleri netlify stratejisiyle uyumlu hale getir
- Kullanilmayan Netlify function yolu icin karar ver (aktif et veya kaldir)

## Verification Targets (Claude)

1. `cmd /c npm --prefix platform run lint`
2. `cmd /c npm --prefix platform run type-check`
3. `cmd /c npm --prefix platform test -- --runInBand`
4. `cmd /c npm --prefix platform run build`
5. `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"`
6. `cmd /c "set ANALYZE=true&& npm --prefix platform run build"`
7. Netlify yeni deploy logu:
- `publish .../platform/out` beklemeyecek
- `@netlify/plugin-nextjs` `onBuild` fail etmeyecek
