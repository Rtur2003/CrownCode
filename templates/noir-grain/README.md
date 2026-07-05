# Noir & Grain — Sinematik Restoran Şablonu

Fine-dining restoranlar için ödül sitesi kalitesinde, tamamen özelleştirilebilir React şablonu.
Karanlık "noir" estetiği, tadım menüsü kurgusu ve katmanlı editoryal tipografi ile.

## Öne Çıkanlar

- **Sinematik açılış** — sayaçlı preloader, perde maske-açılımıyla sahneye giriş
- **Yatay yolculuk** — masaüstünde ana sayfa fasılları pinned yatay sinema olarak akar (GSAP ScrollTrigger)
- **Cep Servisi** — mobilde bambaşka deneyim: tam ekran story kartları, kenar ilerleme noktaları, başparmak-dostu alt aksiyon çubuğu, menüde kaydırılabilir kart destesi
- **Katman Sistemi** — dev filigran tipografi, şarap bordosu renk blokları, duotone görseller, görsel sınırını kesen başlıklar (z-ölçeği: filigran → medya → tipografi → UI)
- **WebGL dokunuşu** — görsellerde sıvı displacement hover ve distortion crossfade (`ogl`, three.js yok); desteklenmeyen cihazda zarif düşüş
- **Pürüzsüz kayma** — `lenis` + GSAP entegrasyonu
- **Backend'siz formlar** — rezervasyon adım adım sohbet formu → WhatsApp'a önceden yazılmış mesaj; iletişim → mailto
- **Erişilebilirlik** — `prefers-reduced-motion` desteği, klavye gezinme, görünür odak halkaları, semantik HTML

## Teknoloji

React 19 · Vite 8 · Tailwind CSS 3 · GSAP 3 · Lenis · OGL · Vitest

## Başlangıç

```bash
npm install
npm run dev      # geliştirme sunucusu
npm run build    # üretim derlemesi
npm test         # birim testleri (form doğrulama, link üretimi)
npm run lint     # oxlint
```

## Özelleştirme — tek klasör: `src/data/`

Şablonun tüm içeriği dört dosyada toplanır; bileşenlere dokunmanıza gerek yok.

| Dosya | İçerik |
|---|---|
| `src/data/site.js` | Restoran adı, telefon, **WhatsApp numarası**, adres, çalışma saatleri, rezervasyon saatleri, sosyal linkler, harita embed URL'i |
| `src/data/menu.js` | Menü kategorileri ve öğeleri (`signature: true` olanlar ana sayfa İmza faslında görünür) |
| `src/data/images.js` | **Tüm görsel URL'leri** — kendi görsellerinizi `/public/images/` altına koyup yolları değiştirin |
| `src/data/content.js` | Sayfa metinleri: hero, fasıl başlıkları, hikaye, form soruları, marquee |

### Görselleri değiştirme

Mevcut URL'ler Unsplash'ten geçici örneklerdir. Satın aldığınız görselleri
`public/images/` klasörüne koyun ve `images.js` içindeki URL'leri
`'/images/dosya-adi.jpg'` ile değiştirin. Menü görselleri `dishes` nesnesinde
menü öğesi `id`'siyle eşleşir.

### WhatsApp rezervasyonu

`site.js` → `whatsapp` alanına numaranızı uluslararası formatta, boşluksuz ve
`+` işaretsiz yazın (örn. `905321112233`). Form doğrulamadan geçen talepler
önceden yazılmış Türkçe mesajla WhatsApp'a yönlenir.

### Renk ve tipografi

Palet `tailwind.config.js` içindeki `noir.*` token'larından yönetilir
(zemin, metin, pirinç vurgu, şarap bordosu, yüzey). Fontlar `index.html`'de
Google Fonts üzerinden yüklenir: Cormorant Garamond (display) + Manrope (gövde).

## Mimari Notlar

- `src/hooks/useMediaCapability.js` — dokunmatik / reduced-motion / WebGL tespiti;
  tüm sinematik katman bu sinyale göre otomatik düşüş yapar
- `src/components/sections/` — sayfa fasılları (tek sorumluluk, veriyi `data/`den alır)
- `src/utils/` — saf mantık (test kapsamında): form doğrulama, WhatsApp/mailto link üretimi
- Tasarım spec'i: `docs/superpowers/specs/` · Uygulama planı: `docs/superpowers/plans/`
