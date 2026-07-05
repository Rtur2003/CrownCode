# Noir & Grain "Gece Servisi" Şablonu — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Spec'teki (docs/superpowers/specs/2026-07-03-noir-grain-restaurant-template-design.md) sinematik, satılabilir fine-dining restoran şablonunu mevcut Vite+React iskeleti üzerine inşa etmek.

**Architecture:** Tüm içerik/görsel/iletişim bilgisi `src/data/` altında; sayfalar `src/components/sections/` fasıllarını birleştirir; sinematik katman (Lenis, WebGL, preloader, imleç) `useMediaCapability` sinyaline göre zarif düşüş yapar.

**Tech Stack:** React 19, Vite 8, Tailwind 3, GSAP 3 (ScrollTrigger), lenis, ogl, vitest (dev).

## Global Constraints

- **Git commit'leri KULLANICI atar.** Executor asla `git commit`/`git push` çalıştırmaz; her commit noktasında durur, "şu dosyalar commit'e hazır" der.
- İçerik dili Türkçe; tüm metin/görsel/iletişim verisi YALNIZCA `src/data/*.js`'den gelir, bileşen içinde hardcode edilmez.
- Palet (tailwind `noir.*` token'ları): bg `#0E0C09`, text `#F2E9DA`, accent `#C89B5A`, wine `#5C1F1A`, surface `#2A2620`, border `#2A2620`.
- Tipografi: Cormorant Garamond (display) + Manrope (body), Google Fonts.
- Eklenebilecek bağımlılıklar sadece: `lenis`, `ogl`, `vitest` (dev). Başka paket yok.
- Her animasyonlu özellik: `prefers-reduced-motion` desteği + mobil karşılık + dokunmatikte imleç kapalı.
- Her task sonunda `npm run lint` temiz geçer; görsel task'larda dev sunucuda masaüstü + 390px mobil viewport kontrolü yapılır.

---

### Task 1: Tasarım token'ları, fontlar, global tuval

**Files:**

- Modify: `tailwind.config.js` (renkler + fontlar)
- Modify: `index.html` (lang="tr", meta description, Google Fonts linkleri, title)
- Modify: `src/styles/globals.css` (grain overlay, focus-visible, seçim rengi, reduced-motion tabanı; `scroll-behavior: smooth` KALDIRILIR — Task 4'te Lenis gelecek)

**Interfaces:**

- Produces: Tailwind sınıfları `bg-noir-bg text-noir-text text-noir-accent bg-noir-wine bg-noir-surface border-noir-border font-display font-body`; global `.grain-overlay` katmanı (body::after ile film grain, `pointer-events:none`, SVG feTurbulence data-URI, opacity ~0.05).

**Steps:**

- [ ] tailwind.config.js `noir` paletini spec değerleriyle değiştir (`grain` paleti kalksın — kullanılmıyor), fontFamily: display `'Cormorant Garamond', Georgia, serif`; body `'Manrope', system-ui, sans-serif`.
- [ ] index.html: `lang="tr"`, `<meta name="description" content="Noir & Grain — Karaköy'de fine dining ve kokteyl bar. Tadım menüsü, rezervasyon.">`, Google Fonts preconnect + `Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Manrope:wght@300;400;500;600` stylesheet.
- [ ] globals.css: smooth-scroll satırını sil; `::selection` (bg accent, text bg); `:focus-visible` görünür halka (accent, 2px offset); body::after grain overlay; `@media (prefers-reduced-motion: reduce)` altında `*{animation:none!important;transition:none!important}` DEĞİL — sadece `html{scroll-behavior:auto}` (GSAP tarafı JS'te kapatılacak, CSS'te agresif kill yapılmaz).
- [ ] Verify: `npm run lint` temiz; `npm run dev` → fontlar ve grain dokusu görünür.
- [ ] KULLANICI COMMIT NOKTASI: "tokens + fonts + global canvas hazır."

### Task 2: Veri katmanı + Footer/Navbar'ın veriye bağlanması

**Files:**

- Create: `src/data/site.js`, `src/data/images.js`, `src/data/menu.js`, `src/data/content.js`
- Modify: `src/components/layout/Footer.jsx` (hardcode içerik → site.js), `src/components/layout/Navbar.jsx` (links → content.js nav)

**Interfaces (Produces):**

```js
// site.js
export const site = {
  name: 'Noir & Grain', tagline: 'Fine Dining & Kokteyl Bar',
  phone: '+90 212 000 00 00', whatsapp: '902120000000', email: 'merhaba@noirgrain.com',
  address: { line1: 'Karaköy Mah., Bankalar Cd. No:12', line2: 'Beyoğlu, İstanbul' },
  mapsEmbedUrl: '...', hours: [{ days: 'Salı – Perşembe', time: '18:00 – 00:00' }, ...],
  socials: [{ label: 'Instagram', url: 'https://instagram.com/...' }, ...],
}
// images.js — TÜM görseller tek yerden (Unsplash örnek URL'leri, ?q=80&w=1600 paramlı)
export const images = { hero: '...', story: ['...','...','...'],
  dishes: { 'levrek-marin': '...', ... }, contact: '...' }
// menu.js
export const categories = [{ id: 'baslangiclar', label: 'Başlangıçlar' }, /* ana-yemekler, tatlilar, icecekler */]
export const menuItems = [{ id: 'levrek-marin', category: 'baslangiclar', name: 'Levrek Marin',
  desc: 'Turunç, taze kekik, soğuk sıkım zeytinyağı', price: 480, signature: true }, ...]
// content.js — hero, fasıl başlıkları/numaraları, hikaye paragrafları, form soruları,
// nav: [{ to:'/menu', label:'Menü' }, ...], CTA metinleri
```

**Steps:**

- [ ] 4 veri dosyasını tam Türkçe içerikle yaz (menüde kategori başına 4-6 öğe, 3'ü `signature: true`; Unsplash'ten gerçek yemek/mekan fotoğrafı URL'leri).
- [ ] Footer.jsx ve Navbar.jsx'i veri dosyalarını tüketecek şekilde refactor et (görünüm aynı kalır).
- [ ] Verify: lint temiz, dev'de Footer/Navbar içerikleri veriden geliyor.
- [ ] KULLANICI COMMIT NOKTASI.

### Task 3: Mantık yardımcıları (TDD — vitest)

**Files:**

- Create: `src/utils/links.js`, `src/utils/validateReservation.js`
- Test: `src/utils/__tests__/links.test.js`, `src/utils/__tests__/validateReservation.test.js`
- Modify: `package.json` (devDep `vitest`, script `"test": "vitest run"`)

**Interfaces (Produces):**

```js
// links.js
buildWhatsAppLink(whatsappNumber, form) // → `https://wa.me/902120000000?text=<encoded TR mesaj>`
// mesaj şablonu: "Merhaba, rezervasyon yapmak istiyorum.\nAd: X\nTarih: 12.08.2026\nSaat: 20:00\nKişi: 4\nNot: ..."
buildMailtoLink(email, { subject, body }) // → `mailto:...?subject=...&body=...` (encodeURIComponent)
// validateReservation.js
validateReservation(form, now = new Date()) // → { valid: boolean, errors: { name?, phone?, date?, time?, guests? } }
// kurallar: name ≥ 2 harf; phone TR formatı /^(\+90|0)?5\d{9}$/ (boşluklar temizlenir);
// date bugünden önce olamaz; time 'HH:MM'; guests 1-12 tamsayı. Hata mesajları Türkçe.
```

**Steps:**

- [ ] `npm i -D vitest`; test script ekle.
- [ ] Önce testleri yaz (her kural için: geçerli form, geçersiz telefon, geçmiş tarih, boş ad, sınır guests=0/13; link testleri: encoding, numara temizliği) → `npm test` FAIL görülür.
- [ ] Minimal implementasyonları yaz → `npm test` PASS.
- [ ] Verify: `npm test` ve `npm run lint` temiz.
- [ ] KULLANICI COMMIT NOKTASI.

### Task 4: Yetenek sinyali + Lenis pürüzsüz kayma

**Files:**

- Create: `src/hooks/useMediaCapability.js`, `src/hooks/useLenis.js`
- Modify: `src/App.jsx` (useLenis çağrısı), `package.json` (`lenis`)

**Interfaces (Produces):**

```js
useMediaCapability() // → { reducedMotion, isTouch, hasWebGL } (matchMedia + canvas.getContext('webgl') probe; resize'da güncellenmez, mount'ta bir kez)
useLenis() // App'te çağrılır; reducedMotion ise Lenis kurmaz. lenis instance'ı gsap ticker'a bağlanır:
// lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add((t)=>lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0)
```

**Steps:**

- [ ] `npm i lenis`; iki hook'u yaz; App.jsx'te `useLenis()` ekle.
- [ ] Verify: dev'de kayma pürüzsüz; DevTools reduced-motion emülasyonunda native scroll; lint temiz.
- [ ] KULLANICI COMMIT NOKTASI.

### Task 5: Preloader, ServiceRail, CustomCursor güçlendirme

**Files:**

- Create: `src/components/ui/Preloader.jsx`, `src/components/ui/ServiceRail.jsx`
- Modify: `src/components/ui/CustomCursor.jsx` (delegasyon fix + bağlamsal etiket), `src/App.jsx` (Preloader mount)

**Interfaces (Produces):**

- `<Preloader />`: ilk yüklemede tam ekran `bg-noir-bg` katman; 0→100 sayaç (`font-display`, dev punto) + "Noir & Grain" logosu; tamamlanınca `clip-path: inset(0 0 100% 0)` animasyonuyla perde açılır (gsap, power4.inOut, ~1.1s). `sessionStorage.ng_seen` varsa süre kısalır (~0.5s). reducedMotion → anında kaybolur. Bittiğinde `document.dispatchEvent(new CustomEvent('preloader:done'))`.
- `<ServiceRail sections={[{id,label}]} />`: sağ kenarda dikey ince ray (fixed, `hidden lg:flex`); aktif fasıl vurgulu; ScrollTrigger ile section id'leri izler.
- CustomCursor fix: `querySelectorAll` + element listener'ları yerine `document` üzerinde `mouseover`/`mouseout` delegasyonu (`e.target.closest('a,button,[data-cursor]')`) — rota değişiminde yeni elemanlar otomatik yakalanır. `isTouch` ise null döner.

**Steps:**

- [ ] Üç bileşeni yaz/güncelle; App.jsx'e Preloader ekle.
- [ ] Verify: dev'de ilk yükleme sekansı, rota değişince imleç etiketlerinin yeni sayfada da çalıştığı, mobil viewport'ta rail gizli; lint temiz.
- [ ] KULLANICI COMMIT NOKTASI.

### Task 6: WebGLImage (ogl, fallback'li)

**Files:**

- Create: `src/components/ui/WebGLImage.jsx`
- Modify: `package.json` (`ogl`)

**Interfaces (Produces):**

- `<WebGLImage src alt className distortion={0.15} />`: hasWebGL && !reducedMotion && !isTouch ise ogl Renderer + düzlem + fragment shader (hover'da mouse-takipli sıvı displacement; uniform'lar gsap ile ease'lenir); aksi halde sade `<img loading="lazy">`. Her iki dalda da `alt` korunur. IntersectionObserver ile görünmeyince raf durur.
- Ayrıca export: `<WebGLCrossfade images={[...]} activeIndex />` — menü yapışkan paneli için distortion crossfade; fallback: opacity crossfade'li img yığını.

**Steps:**

- [ ] `npm i ogl`; bileşeni shader'la yaz (basit dalga/displacement fragment — uv + mouse uniform + strength).
- [ ] Verify: dev'de hover dalgalanması; WebGL kapalı emülasyonda düz img; lint temiz.
- [ ] KULLANICI COMMIT NOKTASI.

### Task 7: Ana Sayfa — Kapak faslı (Cover)

**Files:**

- Create: `src/components/sections/Cover.jsx`
- Modify: `src/pages/Home.jsx`, `src/components/ui/SplitText.jsx` (animasyon entegrasyonu: `animate` prop'u — chars gsap stagger y:'110%'→0, `preloader:done` event'ini bekler)

**Interfaces (Produces):**

- `<Cover />`: 100svh; arka plan `images.hero` (yavaş scale 1.08→1, 6s); üstte kitap kapağı hissi: küçük eyebrow ("İstanbul · Karaköy"), `SplitText` ile dev display başlık (content.hero.title), altta italik alt satır + aşağı ok işareti. Metinler `content.js`'ten.

**Steps:**

- [ ] SplitText'e `animate` desteği ekle (reducedMotion → animasyonsuz görünür).
- [ ] Cover'ı yaz; Home'a yerleştir.
- [ ] Verify: preloader → kapak sekansı akıcı; mobilde tipografi ölçeği (clamp) taşmıyor; lint temiz.
- [ ] KULLANICI COMMIT NOKTASI.

### Task 8: Ana Sayfa — Yatay yolculuk (SignatureStrip, StoryCollage, ReserveInvite)

**Files:**

- Create: `src/components/sections/HorizontalJourney.jsx` (pin + scrub konteyner),
  `src/components/sections/SignatureStrip.jsx`, `src/components/sections/StoryCollage.jsx`,
  `src/components/sections/ReserveInvite.jsx`
- Modify: `src/pages/Home.jsx` (Cover + HorizontalJourney + ServiceRail)

**Interfaces:**

- Consumes: `WebGLImage`, `ScrollReveal`, `content.js`, `menu.js` (signature öğeler), `images.js`.
- Produces: `<HorizontalJourney>{children}</HorizontalJourney>` — masaüstünde: dış sarmal `height: (panelSayısı*100)vh`, iç flex satır `translateX` scrub (ScrollTrigger pin); `isTouch || reducedMotion || <lg` → children normal dikey akışta render edilir (tek kod yolu: `enabled` bayrağı). Paneller `w-screen shrink-0 h-svh` fasıl kartları; fasıl numarası + başlık sol üstte ("Fasıl I — İmza", roma rakamı sıralı — tadım menüsü sırası gerçek bilgi).

**Steps:**

- [ ] HorizontalJourney'yi yaz (gsap context + matchMedia `(min-width:1024px) and (prefers-reduced-motion: no-preference)`).
- [ ] SignatureStrip: 3 signature yemek — büyük WebGLImage + ad/fiyat, `data-cursor="Gör"`, panele hafif iç paralaks. İMZA ÖĞE: her panelin ana görseli panele girerken `clip-path: inset(...)` maske-açılımıyla belirir (tabak kapağı hissi, scrub'a bağlı).
- [ ] StoryCollage: bindirmeli kolaj — 3 görsel farklı hız/ofsetlerde, üstlerine taşan dev italik display cümle, kısa hikaye paragrafı.
- [ ] ReserveInvite: menünün son sayfası hissi — ortada dev "Masanızı Ayırın" CTA (`Link` → /rezervasyon, `data-cursor` halka büyümesi), altta telefon.
- [ ] Verify: masaüstünde dikey scroll → yatay akış, service rail fasıl takibi; 390px mobilde düzgün dikey akış; reduced-motion'da pin yok; lint temiz.
- [ ] KULLANICI COMMIT NOKTASI.

### Task 9: Menü sayfası

**Files:**

- Create: `src/components/sections/MenuExperience.jsx`
- Modify: `src/pages/Menu.jsx`

**Interfaces:**

- Consumes: `categories`, `menuItems`, `images.dishes`, `WebGLCrossfade`.
- Yapı (masaüstü): sol %45 yapışkan panel (`sticky top-0 h-svh`) — aktif öğe görseli WebGLCrossfade; sağda kategori indeksi (büyük display rakam/ad, tıklayınca stagger geçiş) + asimetrik iki kolonlu öğe listesi (ad `font-display`, açıklama italik, fiyat `tabular-nums`); öğe hover → `setActive(item.id)`. Mobil: üstte yatay kaydırılabilir görsel şerit (`overflow-x-auto snap-x`), altında tek kolon liste; kategori değişimi yatay chip'ler.

**Steps:**

- [ ] MenuExperience'ı yaz; kategori geçişinde çıkan/giren öğeler gsap stagger (giriş y:24 opacity, 0.05 stagger).
- [ ] Verify: filtre akıcı, hover görsel değişimi, mobil şerit + chip'ler; klavyeyle kategori değişimi (buton odaklanabilir); lint temiz.
- [ ] KULLANICI COMMIT NOKTASI.

### Task 10: Rezervasyon sayfası — adımlı sohbet formu

**Files:**

- Create: `src/components/sections/ReservationFlow.jsx`
- Modify: `src/pages/Reservation.jsx`

**Interfaces:**

- Consumes: `validateReservation`, `buildWhatsAppLink`, `buildMailtoLink`, `site`, `content.reservation` (soru metinleri).
- Akış: 5 adım (kişi sayısı [1-12 büyük dokunma hedefli seçim], tarih [`<input type="date" min=bugün>`], saat [servis saatlerinden seçenek butonları], ad+telefon, not(ops)]. Her adım tek büyük soru (`font-display`), gsap ile giren/çıkan; üstte "Fasıl x/5" ilerleme. Son ekran: not kartı önizlemesi (krem `bg-noir-text text-noir-bg` kart, hafif rotate, el yazısı hissi italik) → "WhatsApp ile Gönder" (`window.open(waLink)`) + "E-posta ile gönder" mailto yedeği + başarı mikro-animasyonu (kartın mühürlenmesi: accent halka çizimi).
- Doğrulama adım bazında; hata alan altında Türkçe, `aria-describedby` bağlı. Geri butonu her adımda.

**Steps:**

- [ ] ReservationFlow'u yaz (state: `step`, `form`, `errors`; adım geçişi validate sonrası).
- [ ] Verify: uçtan uca akış → üretilen wa.me linki doğru (konsolda kontrol), geçmiş tarih/kısa telefon engelleri, mobilde native tarih girdisi; lint + test temiz.
- [ ] KULLANICI COMMIT NOKTASI.

### Task 11: İletişim sayfası

**Files:**

- Create: `src/components/sections/ContactSplit.jsx`
- Modify: `src/pages/Contact.jsx`

**Interfaces:**

- Consumes: `site`, `buildMailtoLink`, `images.contact`.
- Yapı: masaüstü split — sol yapışkan panel dev display adres tipografisi + telefon + sosyaller; sağ akış: saatler tablosu, koyu harita iframe (`title="Harita"`, `loading="lazy"`), kısa form (ad, e-posta, mesaj → mailto). Mobil: alt alta, adres tipografisi clamp ile küçülür.

**Steps:**

- [ ] ContactSplit'i yaz; Contact.jsx'e bağla.
- [ ] Verify: mailto doğru üretiliyor, iframe yükleniyor, mobil istif; lint temiz.
- [ ] KULLANICI COMMIT NOKTASI.

### Task 12: Cila + doğrulama + şablon dokümantasyonu

**Files:**

- Modify: `src/pages/*.jsx` (document.title per sayfa — küçük `usePageTitle(title)` hook'u `src/hooks/usePageTitle.js`)
- Modify: `README.md` (şablon kullanım kılavuzu: `src/data/` özelleştirme, görsel takası, WhatsApp numarası değişimi, dağıtım)
- Modify: gerekiyorsa küçük görsel rötuşlar (spacing/scale tutarlılığı)

**Steps:**

- [ ] usePageTitle hook + 4 sayfaya başlıklar ("Menü — Noir & Grain" vb.).
- [ ] README'yi şablon-satış diliyle yeniden yaz (özellik listesi + özelleştirme adımları).
- [ ] Tam doğrulama turu: `npm run lint`, `npm test`, `npm run build`; dev'de 4 sayfa masaüstü + 390px; reduced-motion emülasyonu; klavye gezinme (odak halkaları).
- [ ] KULLANICI COMMIT NOKTASI: final.
