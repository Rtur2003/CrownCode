# CrownCode Phase F Analysis (2026-03-07)

## Scope

- Bu fazda sadece analiz yapildi, kod degisikligi yapilmadi.
- Odak:
  - Home -> urun sayfalari -> global UI katmani UX/IA tutarliligi
  - i18n/a11y sozlesmesi
  - frontend API UX contract (kullaniciya yansiyan hata/telemetry davranisi)

## Validation Snapshot

- `cmd /c npm --prefix platform run lint` -> **passed**
- `cmd /c npm --prefix platform run type-check` -> **passed**

## P0 Findings (Critical)

1. Global dil/metadata sozlesmesi kirik (SEO + a11y etkisi).
- Kanit: `platform/pages/_document.tsx:5` (`<Html lang="tr">` sabit)
- Kanit: `platform/pages/index.tsx:11`-`platform/pages/index.tsx:13` (TR hardcoded meta)
- Kanit: `platform/pages/search.tsx:116` (hardcoded keywords)
- Kanit: `platform/pages/data-manipulation/index.tsx:224` (hardcoded keywords)
- Etki:
  - EN kullanicida HTML `lang` ve metadata gercekle uyusmuyor.
  - ekran okuyucu telaffuzu ve arama motoru indeksleme kalitesi dusuyor.

## P1 Findings (High)

1. Arama mimarisi iki farkli kaynaktan yonetiliyor (split-brain IA).
- Kanit: global modal source `platform/hooks/useSearch.ts:27`-`platform/hooks/useSearch.ts:67`
- Kanit: `/search` sayfasi source `platform/pages/search.tsx:29`-`platform/pages/search.tsx:79`
- Kanit: `/search` sonuc badge'i lokalize degil (`project/page` ham): `platform/pages/search.tsx:186`
- Etki:
  - Modal aramada bazi urunler gorunmezken `/search` sayfasinda gorunuyor.
  - IA davranisi kullaniciya gore degisiyor.

2. Crown Commend sayfasi SSR degerini kaybediyor (ilk render spinner).
- Kanit: `platform/pages/crown-commend/index.tsx:31`, `platform/pages/crown-commend/index.tsx:54`-`platform/pages/crown-commend/index.tsx:56`
- Kanit: `platform/pages/crown-commend/index.tsx:79`-`platform/pages/crown-commend/index.tsx:96` (`mounted` false iken loader)
- Etki:
  - Ilk HTML icerigi zayif (SEO/TTI/algilanan performans etkisi).

3. A11y/i18n etiketleri hala cok noktada hardcoded.
- Kanit: `platform/components/Layout/Header.tsx:68`, `platform/components/Layout/Header.tsx:129`
- Kanit: `platform/components/Layout/Footer.tsx:72`, `platform/components/Layout/Footer.tsx:81`, `platform/components/Layout/Footer.tsx:88`
- Kanit: `platform/components/Search/SearchModal.tsx:91`
- Kanit: `platform/components/KeyboardShortcuts/ShortcutsModal.tsx:111`
- Kanit: `platform/components/ExternalLink/ExternalLinkWarning.tsx:122`
- Kanit: `platform/components/UI/Toast/Toast.tsx:65`
- Kanit: `platform/pages/ai-music-detection/index.tsx:381`-`platform/pages/ai-music-detection/index.tsx:382`
- Etki:
  - Dil degistiginde yardimci metinler tutarsiz kalir.
  - i18n regression yakalama zorlasir.

4. Error boundary fallback tek dilde sabit (TR), locale-neutral degil.
- Kanit: `platform/components/ErrorBoundary/ErrorFallback.tsx:20`-`platform/components/ErrorBoundary/ErrorFallback.tsx:26`
- Etki:
  - Hata aninda EN kullaniciya TR metin gosterilir.

5. Data Manipulation hata mesaji backend detayini oldugu gibi UI'a basiyor.
- Kanit: `platform/pages/data-manipulation/index.tsx:117`
- Etki:
  - Teknik detay sizma riski.
  - Son kullanici icin tutarsiz/ham hata deneyimi.

6. `/api/version` ile runtime observability beyani uyusmuyor.
- Kanit: `platform/pages/api/version.ts:65` (`webVitals: true`)
- Kanit: `platform/pages/_app.tsx:104`-`platform/pages/_app.tsx:111` (web vitals gonderimi yorum satiri)
- Etki:
  - Operasyon ekipleri endpoint'e guvenip yanlis varsayim yapabilir.

## P2 Findings (Medium)

1. Crown Vote katmaninda genis hardcoded fallback kullanimi suruyor (locale parity olmasina ragmen).
- Kanit: `platform/pages/crown-vote/index.tsx:55`, `platform/pages/crown-vote/index.tsx:62`
- Kanit: `platform/components/CrownVote/HeroSection.tsx:20`, `platform/components/CrownVote/HeroSection.tsx:24`, `platform/components/CrownVote/HeroSection.tsx:28`
- Kanit: `platform/components/CrownVote/DownloadSection.tsx:63`-`platform/components/CrownVote/DownloadSection.tsx:106`
- Kanit: `platform/components/CrownVote/InstallationGuide.tsx:6`-`platform/components/CrownVote/InstallationGuide.tsx:38`
- Kanit: `platform/components/CrownVote/ConfigGenerator.tsx:86`-`platform/components/CrownVote/ConfigGenerator.tsx:203`
- Etki:
  - Lokalizasyon kalitesi borcu buyuyor.
  - Eksik key'ler "sessizce" gizleniyor.

2. DownloadSection dis API cagrisi dayaniksiz (abort/timeout yok, locale kontrolsuz tarih formati).
- Kanit: `platform/components/CrownVote/DownloadSection.tsx:22`
- Kanit: `platform/components/CrownVote/DownloadSection.tsx:31` (`toLocaleDateString()` locale explicit degil)
- Etki:
  - Yavas/ag kopmasinda UX bozulur.

3. MainLayout default metadata stale/urun-odakli (AURIS), yeni sayfalarda unutulursa yanlis SEO.
- Kanit: `platform/components/Layout/MainLayout.tsx:20`-`platform/components/Layout/MainLayout.tsx:22`

## Claude Task Pack (Phase F)

1. P0 - Dil/metadata sozlesmesi duzelt
- `document.documentElement.lang` locale degisince senkronlansin.
- Home/Search/Data Manipulation meta keyword/title/description locale key'lere tasinsin.
- `Html lang="tr"` sabiti tek kaynak gercege baglansin (cookie/locale strategy).

2. P1 - Arama IA birlestir
- Tek `search catalog` kaynagi olustur (hook + `/search` ortak data).
- Global modal ve `/search` ayni urun setini gostersin.
- Result type badge locale key ile gosterilsin (`pages/features/project`).

3. P1 - Crown Commend SSR/hydration iyilestir
- `mounted` gate kaldirilip SSR dostu rendera gecilsin.
- Ilk boyamada anlamli icerik korunsun (loader sadece gercek loading state icin).

4. P1 - i18n/a11y hardcoded temizligi
- Header/Footer/SearchModal/Shortcuts/ExternalLink/Toast/AI upload aria-title metinleri locale key'e tasinsin.
- ErrorFallback locale-neutral strategy ile calissin (provider disi senaryoya uygun fallback policy).

5. P1 - API UX contract netlestir
- Data manipulation backend hatalari kullanici-dostu kodlara maplensin.
- `/api/version` `webVitals` flag'i gercek telemetry durumuna gore duzelt.

6. P2 - Crown Vote fallback borcunu kapat
- Locale parity zorunlu hale gelsin; fallback string minimuma indirilsin.
- DownloadSection icin timeout + abort + locale-aware date format eklensin.

## Verification Targets (Claude)

1. `cmd /c npm --prefix platform run lint`
2. `cmd /c npm --prefix platform run type-check`
3. `cmd /c npm --prefix platform test -- --runInBand`
4. `cmd /c npm --prefix platform run build`
5. TR/EN manuel smoke:
- Header/Footer aria metinleri locale ile degismeli
- Global search ve `/search` ayni sonuclari uretmeli
- Crown Commend ilk yuklemede spinner-only sayfa gostermemeli
