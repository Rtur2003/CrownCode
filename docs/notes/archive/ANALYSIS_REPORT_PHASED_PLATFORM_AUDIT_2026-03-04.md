# CrownCode Phased Platform Audit (2026-03-04) - Phase A

## Scope

- Bu turda kod degisikligi yapilmadi; sadece analiz ve dogrulama yapildi.
- Asama odagi:
- `platform/components/Layout/*` (Header, Footer, MainLayout)
- `platform/pages/index.tsx` + Home bilecenleri
- Ana sayfa disindaki page katmani (`search`, `data-manipulation`, `crown-*`, `404`, `privacy`, `terms`)
- API route katmani (`platform/pages/api/*`)
- Operasyon dosyalari (`.github/*`, `Makefile`)

## Dogrulama Sonuclari

- `cmd /c npm --prefix platform run lint` -> gecti.
- `cmd /c npm --prefix platform run type-check` -> gecti.
- `cmd /c npm --prefix platform test -- --runInBand` -> gecti.
- `cmd /c "set DEPLOYMENT_TARGET=server&& npm --prefix platform run build"` -> gecti.
- `cmd /c "set DEPLOYMENT_TARGET=static&& npm --prefix platform run build"` -> gecti (beklenen static export + API route uyari mesaji var).
- `python -m pytest hf-crowncode-backend/tests -q` -> gecti (coverage toplam ~%40).

## Neler Dogru Calisiyor (Onaylananlar)

1. `analysisMode` normalize zinciri aktif.
- Kanit: `platform/hooks/analysisGateway.ts:71`
- Kanit: `hf-crowncode-backend/app/routes/analyze.py:55`

2. AI Detection tarafinda `unsupportedSource` case artik ele aliniyor.
- Kanit: `platform/pages/ai-music-detection/index.tsx:124`

3. Crown Fortune teker hedef acisi tek helper ile hesaplanmis; spin + restore ayni formulu kullaniyor.
- Kanit: `platform/pages/crown-fortune/index.tsx:113`
- Kanit: `platform/pages/crown-fortune/index.tsx:365`
- Kanit: `platform/pages/crown-fortune/index.tsx:482`

4. Crown Fortune PNG export mirror fixi clone tabanli yapiyla uygulanmis.
- Kanit: `platform/pages/crown-fortune/index.tsx:643`
- Kanit: `platform/pages/crown-fortune/index.tsx:676`

## P1 Bulgular (Yuksek)

1. Canonical URL cogu sayfada root'a sabitleniyor.
- Kanit: `platform/components/Layout/MainLayout.tsx:69`
- Etki: SEO tarafinda farkli sayfalar tek canonical altinda toplanir; indexleme kalitesi duser.
- Oneri: canonical URL'i route bazli uret (`asPath`) veya her page explicit `url` gecsin.

2. Header, Pages Router yapisinda `next/navigation` kullaniyor.
- Kanit: `platform/components/Layout/Header.tsx:5`
- Kanit: `platform/__tests__/pages/smoke.test.tsx:18` (testte mock ile ortuluyor)
- Etki: runtime uyumluluk riski; testler gercek router davranisini tam temsil etmiyor.
- Oneri: Pages Router katmaninda `next/router` standardina gec veya wrapper ile netlestir.

3. Crown Fortune deterministic random buglari halen acik (onceki rapor P1'i devam ediyor).
- Kanit: `platform/data/destiny.ts:672`
- Kanit: `platform/data/destiny.ts:1005`
- Kanit: `platform/data/destiny.ts:1010`
- Kanit: `platform/data/destiny.ts:1022`
- Etki: lucky numbers / direction / quote index tutarsizliklari.
- Oneri: int-vs-unit random ayrimi ve modulo tabanli secim.

4. Native share fallback eksikligi halen acik.
- Kanit: `platform/pages/crown-fortune/index.tsx:607`
- Kanit: `platform/pages/crown-fortune/index.tsx:620`
- Etki: `navigator.share` olmayan ortamlarda paylasim no-op kalabilir.
- Oneri: native yoksa otomatik web-share fallback (twitter/copy).

## P2 Bulgular (Orta)

1. Footer fallback metni gereksiz ve i18n parity bozucu.
- Kanit: `platform/components/Layout/Footer.tsx:30`
- Kanit: `platform/locales/en.json:201`
- Oneri: fallback stringi kaldir, locale key'i zorunlu kullan.

2. Footer grid kolon sayisi ile render yapisi tutarsiz.
- Kanit: `platform/styles/components/footer.css:42`
- Kanit: `platform/styles/components/footer.css:280`
- Etki: layout dengesizligi ve bos kolon riski.
- Oneri: grid kolonlarini gercek item sayisina gore tanimla.

3. `Html lang` sabit `tr`; dil degistiginde belge seviyesi dil degismiyor.
- Kanit: `platform/pages/_document.tsx:5`
- Etki: a11y/SEO dil sinyali zayif.
- Oneri: locale tabanli lang stratejisi (SSR veya route tabanli).

4. Timer cleanup borcu birden fazla yerde devam ediyor.
- Kanit: `platform/components/Layout/Header.tsx:31`
- Kanit: `platform/components/Loading/LoadingScreen.tsx:27`
- Kanit: `platform/pages/crown-fortune/index.tsx:486`
- Kanit: `platform/pages/crown-fortune/index.tsx:538`
- Oneri: timeout ID ref + unmount cleanup standardi.

5. Data Manipulation API fallback'i lokal HTTP'ye sabit.
- Kanit: `platform/pages/data-manipulation/index.tsx:106`
- Etki: production HTTPS ortaminda mixed-content veya baglanti hatasi.
- Oneri: explicit backend config zorunlulugu + preview/demo fallback.

6. Crown Vote tarafinda fazla fallback/hardcoded metin var (locale var olmasina ragmen).
- Kanit: `platform/pages/crown-vote/index.tsx:26`
- Kanit: `platform/components/CrownVote/DownloadSection.tsx:63`
- Kanit: `platform/components/CrownVote/ConfigGenerator.tsx:86`
- Kanit: `platform/components/CrownVote/HeroSection.tsx:20`
- Oneri: fallbackleri azalt, locale key parity test ekle.

7. `useFileAnalysis` icinde hardcoded Ingilizce uyarı metni var.
- Kanit: `platform/hooks/useFileAnalysis.ts:172`
- Oneri: locale key uzerinden mesaj uret.

8. Search/404 gibi sayfalarda locale disi sabit metinler devam ediyor.
- Kanit: `platform/pages/search.tsx:73`
- Kanit: `platform/pages/search.tsx:186`
- Kanit: `platform/pages/404.tsx:72`
- Kanit: `platform/pages/404.tsx:75`
- Kanit: `platform/pages/404.tsx:83`
- Oneri: tum label/text pathlerini locale anahtarina tasima.

9. Client-side GitHub release fetch rate-limit'e acik.
- Kanit: `platform/components/CrownVote/DownloadSection.tsx:22`
- Oneri: server proxy/cache veya stale-while-revalidate endpoint.

10. Core backend test katmani yok; Makefile bunu pass gibi maskeleyebiliyor.
- Kanit: `Makefile:127`
- Oneri: `backend/tests` olusturup en az health + url parser unit testleri ekle.

## P3 Gozlem (Dusuk Ama Stratejik)

1. MainLayout structured data icindeki aggregate rating statik ve dogrulanmamis olabilir.
- Kanit: `platform/components/Layout/MainLayout.tsx:51`
- Oneri: dogrulanabilir metrik yoksa kaldir veya gercek kaynaga bagla.

2. Test kapsami hala dar.
- Kanit: `platform/__tests__/pages/smoke.test.tsx:1`
- Kanit: `platform/__tests__/hooks/analysisGateway.test.ts:1`
- Oneri: page-level happy path + error-state + i18n parity testleri.

## Claude Icin Uygulama Sirasi (Bu Fazdan Sonra)

1. P1:
- canonical URL stratejisini route-bazli duzelt.
- Header router katmanini Pages Router ile uyumlu hale getir.
- Crown Fortune random/share kalan P1'leri kapat.

2. P2:
- i18n fallback temizligi (Footer, Crown Vote, Search, 404, shared components).
- timer cleanup standardi (Header, Loading, Crown Fortune).
- data-manipulation backend config davranisini production-safe yap.

3. P2 ops:
- core backend icin minimum test paketi.
- Crown Vote release fetch icin cache/proxy plani.

4. Dogrulama:
- platform lint/type-check/test/build(server+static)
- hf backend test
- eklenen testler icin green kaniti

## Sonraki Analiz Fazlari (Analizci Akisi)

- Faz B: ortak hooklar + context + modal altyapisi (a11y, memory, i18n parity).
- Faz C: backend/core + hf servis katmani ve kontrat uyumu.
- Faz D: dokumantasyon/CI/devex dosya zinciri ve stale policy temizligi.
