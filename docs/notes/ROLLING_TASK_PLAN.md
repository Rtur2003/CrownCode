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

- Son guncelleme: **3 Mart 2026**
- Mod: Adim adim ilerleme + tamamlandi isaretleme

---

## Bu Turun Gorevleri

### P0 - Kritik (Codex Hata Duzeltme) - TAMAMLANDI

- [x] [H1] privacy.tsx ve terms.tsx encoding duzeltildi + i18n locale'a tasindi.
- [x] [H2] next.config.js remotePatterns'den `devforge-suite.com` kaldirildi, `i.ytimg.com` eklendi.
- [x] [H3] DEVFORGE_PLATFORM_STRUCTURE.md silindi.
- [x] [H4] ProjectDropdown.tsx kullanilmiyor - silindi (olu kod temizligi).
- [x] [H5] Duplicate `data-manipulation.css` silindi (sadece `.module.css` kaldi).
- [x] [H6] crown-dreams `_activeTab` unused state ve TODO yorumu temizlendi.

### P1 - Yuksek (i18n Standardizasyonu - Asama 2) - TAMAMLANDI

- [x] crown-dreams/index.tsx: 80+ hardcoded metin `crownDreams` namespace ile locale'a tasindi.
- [x] 404.tsx: tum metinler `notFound` namespace ile locale'a tasindi.
- [x] search.tsx: tum metinler `searchPage` namespace ile locale'a tasindi + aranabilir icerik 3'ten 7'ye genisletildi (crown-fortune, crown-dreams, crown-commend, crown-vote eklendi).
- [x] ExternalLinkWarning.tsx: inline `t` objesi `externalLink` namespace ile locale'a tasindi.
- [x] privacy.tsx: encoding bozulmasi giderildi + `privacy` namespace ile locale'a tasindi.
- [x] terms.tsx: encoding bozulmasi giderildi + `terms` namespace ile locale'a tasindi.

### P2 - Orta (Temizlik ve Kalite) - TAMAMLANDI

- [x] Kullanilmayan hook/bilesen dosyalarini tespit et ve kararla (usePWA, useLazyLoad, usePerformanceMonitor, MobileNavigation). → Hepsi silindi (hicbiri import edilmiyordu).
- [x] Eski/guncel olmayan dokumanlari temizle (TECHNOLOGY_STACK_2025.md icerik kontrolu). → DevForge/Express/PostgreSQL/Redis referanslari temizlendi, FastAPI/HuggingFace Spaces ile guncellendi.
- [x] Frontend icin minimum smoke testleri ekle (en az 3 sayfa render testi). → jest.config.js, jest.setup.ts, __tests__/pages/smoke.test.tsx (6 test, 3 sayfa).
- [x] Backend icin tests/ altinda route bazli temel testleri baslat. → conftest.py, test_health.py, test_youtube.py, test_commend.py (7 test).

### P3 - Dusuk (Iyilestirme) - KISMI TAMAMLANDI

- [ ] Search sayfasini CSS module ile yeniden stil ver (su an inline style kullaniliyor).
- [x] `platform/data/` icinde component dosyalari var (DestinyBackground.tsx, useDestinySystem.ts) - uygun konuma tasi. → Kullanilmiyor, silindi (tarot.ts dahil). destiny.ts ve dreams.ts aktif olarak kullaniliyor, yerinde kaldi.
- [ ] `next.config.js` icinde `eslint.ignoreDuringBuilds: true` kapatilip gercek lint kontrolu acilsin mi degerlendirmesi.

### Ek Gorevler (3 Mart 2026)

- [x] Merge conflict marker'lari temizlendi (4 dosya: ai-music-detection/index.tsx, ai-detection.module.css, en.json, tr.json).
- [x] Guvenlik taramasi: .env.example dosyalarindaki gercek API anahtarlari/secret'lar placeholder ile degistirildi.
- [x] docs/SECURITY_NOTES.md olusturuldu (credential rotation rehberi).
- [x] Teknoloji migration plani olusturuldu: docs/technical/MIGRATION_PLAN_2026.md (Next.js 15, React 19, TS 5.8, Node.js 22).

---

## Siradaki Adim

P3'ten kalan gorevler:

1. Search sayfasi CSS module refactor
2. `eslint.ignoreDuringBuilds` degerlendirmesi

## Tamamlananlar (Log)

- [x] 2026-02-24: P0 tamamlandi - Codex hatalari duzeltildi (encoding, DevForge kalintilari, duplicate dosya, unused state).
- [x] 2026-02-24: P1 tamamlandi - i18n Asama 2 (crown-dreams, 404, search, ExternalLinkWarning, privacy, terms).
- [x] 2026-02-24: Yeni locale namespace'leri eklendi: `crownDreams`, `notFound`, `externalLink`, `searchPage`, `privacy`, `terms`.
- [x] 2026-02-24: Search sayfasi aranabilir icerik 3 -> 7 proje (tum aktif projeler).
- [x] 2026-02-24: next.config.js `i.ytimg.com` remote pattern eklendi (VideoPreview YouTube thumbnail destegi).
- [x] 2026-03-03: Merge conflict marker'lari temizlendi (4 dosya: index.tsx, ai-detection.module.css, en.json, tr.json).
- [x] 2026-03-03: Guvenlik taramasi: .env.example'lardaki gercek secret'lar placeholder ile degistirildi + SECURITY_NOTES.md olusturuldu.
- [x] 2026-03-03: Dokumantasyon hizalamasi: DevForge/Express/PostgreSQL/Redis referanslari temizlendi (README, CHANGELOG, TECHNOLOGY_STACK, MOBILE_RESPONSIVE_DESIGN).
- [x] 2026-03-03: Test altyapisi: Frontend 6 smoke test (Jest) + Backend 7 pytest testi eklendi.
- [x] 2026-03-03: Olu kod temizligi: 8 dosya silindi (usePWA, useLazyLoad, usePerformanceMonitor, MobileNavigation, DestinyBackground, destiny-background.module.css, useDestinySystem, tarot).
- [x] 2026-03-03: Migration plani olusturuldu: MIGRATION_PLAN_2026.md (Next.js 15 + React 19, TS 5.8, Node.js 22, App Router degerlendirmesi).
