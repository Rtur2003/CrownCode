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

- Son guncelleme: **24 Subat 2026**
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

### P2 - Orta (Temizlik ve Kalite)

- [ ] Kullanilmayan hook/bilesen dosyalarini tespit et ve kararla (usePWA, useLazyLoad, usePerformanceMonitor, MobileNavigation).
- [ ] Eski/guncel olmayan dokumanlari temizle (TECHNOLOGY_STACK_2025.md icerik kontrolu).
- [ ] Frontend icin minimum smoke testleri ekle (en az 3 sayfa render testi).
- [ ] Backend icin tests/ altinda route bazli temel testleri baslat.

### P3 - Dusuk (Iyilestirme)

- [ ] Search sayfasini CSS module ile yeniden stil ver (su an inline style kullaniliyor).
- [ ] `platform/data/` icinde component dosyalari var (DestinyBackground.tsx, useDestinySystem.ts) - uygun konuma tasi.
- [ ] `next.config.js` icinde `eslint.ignoreDuringBuilds: true` kapatilip gercek lint kontrolu acilsin mi degerlendirmesi.

---

## Siradaki Adim

P2'den devam: Kullanilmayan hook/bilesen tespiti ve temizlik.

## Tamamlananlar (Log)

- [x] 2026-02-24: P0 tamamlandi - Codex hatalari duzeltildi (encoding, DevForge kalintilari, duplicate dosya, unused state).
- [x] 2026-02-24: P1 tamamlandi - i18n Asama 2 (crown-dreams, 404, search, ExternalLinkWarning, privacy, terms).
- [x] 2026-02-24: Yeni locale namespace'leri eklendi: `crownDreams`, `notFound`, `externalLink`, `searchPage`, `privacy`, `terms`.
- [x] 2026-02-24: Search sayfasi aranabilir icerik 3 -> 7 proje (tum aktif projeler).
- [x] 2026-02-24: next.config.js `i.ytimg.com` remote pattern eklendi (VideoPreview YouTube thumbnail destegi).
