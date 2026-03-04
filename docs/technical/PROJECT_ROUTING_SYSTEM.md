# CrownCode - Routing System (Current)

## 1) Scope
Bu dokuman, `platform/pages` altindaki mevcut Next.js Pages Router yapisini tanimlar.
Buradaki bilgi, aktif kod tabaniyla birebir uyumlu tutulmalidir.

## 2) Active Route Map
Ana alan adi: `https://hasanarthuraltuntas.xyz`

### Public pages
- `/` -> `platform/pages/index.tsx`
- `/ai-music-detection` -> `platform/pages/ai-music-detection/index.tsx`
- `/data-manipulation` -> `platform/pages/data-manipulation/index.tsx`
- `/crown-fortune` -> `platform/pages/crown-fortune/index.tsx`
- `/crown-commend` -> `platform/pages/crown-commend/index.tsx`
- `/crown-dreams` -> `platform/pages/crown-dreams/index.tsx`
- `/crown-vote` -> `platform/pages/crown-vote/index.tsx`
- `/search` -> `platform/pages/search.tsx`
- `/privacy` -> `platform/pages/privacy.tsx`
- `/terms` -> `platform/pages/terms.tsx`
- `/404` -> `platform/pages/404.tsx`

### Next internals
- `/_error` -> `platform/pages/_error.tsx`
- `/_app` -> `platform/pages/_app.tsx`
- `/_document` -> `platform/pages/_document.tsx`

### API routes (Next API)
- `/api/health` -> `platform/pages/api/health.ts`
- `/api/version` -> `platform/pages/api/version.ts`
- `/api/fortune-counter` -> `platform/pages/api/fortune-counter.ts`

## 3) Navigation Contract
Header ve footer baglantilari su route setiyle uyumlu olmalidir:
- Home: `/`
- Products anchor: `/#products`
- Crown Fortune: `/crown-fortune`
- Crown Commend: `/crown-commend`
- Crown Vote: `/crown-vote`
- Privacy/Terms: `/privacy`, `/terms`

Degisiklik yapildiginda asagidaki dosyalar birlikte kontrol edilir:
- `platform/components/Layout/Header.tsx`
- `platform/components/Layout/Footer.tsx`
- `platform/components/Home/ProjectsSection.tsx`
- `platform/hooks/useSearch.ts`

## 4) Route Addition Checklist
Yeni bir route eklendiginde:
1. `platform/pages/...` altinda sayfa dosyasini ekle.
2. Gerekliyse `Header`, `Footer`, `Search` ve product kartlarini guncelle.
3. `locales/tr.json` ve `locales/en.json` anahtarlarini ekle.
4. SEO metadata (`MainLayout` props) ve gerekiyorsa structured data guncelle.
5. Bu dosyadaki route haritasini guncelle.

## 5) Deprecated/Not Used
Asagidaki yapilar su an aktif degildir:
- Dynamic `[project]/[...slug]` routing
- `/projects`, `/about`, `/contact`, `/docs` page seti
- DevForge adlandirmasi ve `devforge-suite.com` bazli route referanslari

Bu maddeler tekrar aktive edilecekse once mimari karar kaydi acilmali, sonra kod + dokuman birlikte alinmalidir.

## 6) Deployment Mode Decision
Varsayilan deploy modu `server` olarak ayarlanmistir (`next.config.js:2`):
- `DEPLOYMENT_TARGET=server` (varsayilan) -> Next runtime acik, `pages/api/*` aktif, cikti `.next/`.
- `DEPLOYMENT_TARGET=static` -> `next export` cikti (`out/`), runtime API route yok.

CI pipeline'da her iki mod ayri job olarak dogrulaniyor (`ci.yml: build` + `build-static`).
Netlify deploy icin `build-static` artifact'i kullanilir.
