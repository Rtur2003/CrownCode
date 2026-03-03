# CrownCode - Teknoloji Migration Planı 2026

> Son güncelleme: 3 Mart 2026

## Mevcut Durum

| Teknoloji | Mevcut Sürüm | Hedef Sürüm | Öncelik |
|-----------|-------------|-------------|---------|
| Next.js | 14.2.18 | 15.x (sonra 16.x) | Yüksek |
| React | 18.3.1 | 19.x | Yüksek |
| TypeScript | 5.7.2 | 5.8+ | Düşük |
| Node.js | 20.x LTS | 22.x LTS | Orta |

## Mimari Analiz

### Mevcut Yapı
- **Router**: Pages Router (`pages/` dizini, 15+ sayfa)
- **SSR/SSG**: Statik export (`next export`) - `DEPLOYMENT_TARGET=static`
- **State**: React Context API (LanguageContext)
- **Styling**: CSS Modules + global CSS
- **Hosting**: Netlify (static build)
- **App Router**: Kullanılmıyor (`app/` dizini yok)
- **Not**: Header bileşeni `next/navigation` (App Router API) kullanıyor ama pages/_app.tsx içinde çalışıyor

## Migration Stratejisi

### Faz 1: Next.js 14 → 15 (Öncelik: YÜKSEK)

**Risk seviyesi**: Orta
**Tahmini etki**: Düşük (statik export kullanıldığı için)

#### Checklist
- [ ] `package.json` güncelle: `next@^15`, `react@^19`, `react-dom@^19`
- [ ] `@types/react` ve `@types/react-dom` güncelle (React 19 tipleri)
- [ ] Breaking change kontrolü:
  - [ ] `next.config.js` → `next.config.ts` (opsiyonel)
  - [ ] `next/image` değişikliklerini kontrol et
  - [ ] `next/link` artık `<a>` otomatik render eder - gereksiz `<a>` tag'lerini kaldır
  - [ ] Async request API'leri: `cookies()`, `headers()`, `params`, `searchParams` async oldu
- [ ] Turbopack uyumluluğunu test et (`next dev --turbopack`)
- [ ] `npm run build && npm run lint && npm test` çalıştır
- [ ] Netlify deploy test et

#### Kritik Riskler
1. **React 19 geçişi zorunlu**: Next.js 15, React 19 gerektirir
2. **`useFormState` → `useActionState`** değişikliği (kullanılmıyor, risk yok)
3. **Caching davranışı değişti**: `fetch` artık default olarak cache'lemez (statik export'ta etki yok)

### Faz 2: Pages Router → App Router (Öncelik: DÜŞÜK)

**Risk seviyesi**: Yüksek
**Tahmini etki**: Yüksek (büyük refactor)

#### Neden şimdi yapılmasın?
1. Proje statik export kullanıyor - App Router'ın sunucu bileşenleri avantajı yok
2. 15+ sayfa geçişi gerekiyor - büyük çaplı iş
3. Pages Router hala destekleniyor ve deprecated değil
4. Mevcut yapı stabil ve çalışıyor

#### Eğer yapılacaksa (incremental plan)
1. `app/layout.tsx` oluştur (LanguageProvider, global styles)
2. Sayfa sayfa taşı (önce basit sayfalar: privacy, terms, 404)
3. Her sayfa için:
   - `pages/x.tsx` → `app/x/page.tsx`
   - `getStaticProps` → statik metadata export
   - Client component'leri `'use client'` ile işaretle
4. Tüm sayfalar taşındıktan sonra `pages/` dizinini sil
5. `_app.tsx` ve `_document.tsx` → `app/layout.tsx` ile değiştir

#### Sayfalar ve Karmaşıklık

| Sayfa | Dosya | Karmaşıklık | Not |
|-------|-------|-------------|-----|
| Home | `pages/index.tsx` | Düşük | Statik, client components |
| Privacy | `pages/privacy.tsx` | Düşük | Sadece metin |
| Terms | `pages/terms.tsx` | Düşük | Sadece metin |
| 404 | `pages/404.tsx` | Düşük | Error page |
| Search | `pages/search.tsx` | Orta | Client-side state |
| AI Music | `pages/ai-music-detection/` | Yüksek | Hooks, file upload, state |
| Crown Commend | `pages/crown-commend/` | Yüksek | API entegrasyonu |
| Crown Dreams | `pages/crown-dreams/` | Yüksek | Complex state |
| Crown Fortune | `pages/crown-fortune/` | Yüksek | Animasyonlar, state |
| Crown Vote | `pages/crown-vote/` | Orta | Config generator |
| Data Manipulation | `pages/data-manipulation/` | Orta | File processing |
| ML Toolkit | `pages/ml-toolkit/` | Orta | UI demo |

### Faz 3: TypeScript 5.7 → 5.8+ (Öncelik: DÜŞÜK)

**Risk seviyesi**: Düşük
**Yapılacaklar**:
- [ ] `typescript` paketini güncelle
- [ ] Yeni type-check özellikleri aktifleştir (opsiyonel)
- [ ] `npm run type-check` çalıştır

### Faz 4: Node.js 20 → 22 LTS (Öncelik: ORTA)

**Risk seviyesi**: Düşük
**Yapılacaklar**:
- [ ] Node.js 22 LTS'i yükle
- [ ] `engines` field'ı güncelle
- [ ] Netlify build ortamını güncelle
- [ ] Tüm testleri çalıştır

## Önerilen Sıralama

```
1. TypeScript güncelle (5.7 → 5.8+)     → Düşük risk, hızlı
2. Next.js 15 + React 19 güncelle       → Orta risk, en değerli
3. Node.js 22 LTS geçiş                 → Düşük risk
4. App Router geçişi (opsiyonel)         → Yüksek risk, düşük ROI
```

## Karar Noktaları

| Soru | Cevap | Gerekçe |
|------|-------|---------|
| App Router'a geçmeli mi? | Hayır (şimdilik) | Statik export kullanılıyor, avantaj düşük |
| React 19'a geçmeli mi? | Evet, Next.js 15 ile | Zorunlu bağımlılık |
| Server Components kullanmalı mı? | Hayır (şimdilik) | Statik export, server yok |
| Turbopack kullanmalı mı? | Dev ortamında test et | Production build hala webpack |

## Referanslar

- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [React 19 Migration](https://react.dev/blog/2024/12/05/react-19)
- [Next.js Pages vs App Router](https://nextjs.org/docs/pages)
