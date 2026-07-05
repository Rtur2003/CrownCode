# Noir & Grain — "Gece Servisi" Sinematik Restoran Şablonu (Tasarım Spec'i)

Tarih: 2026-07-03 · Durum: Onaylandı (cesur revizyon dahil)

## Amaç

Satılabilir, kolay özelleştirilebilir, vitrin değeri yüksek fine-dining restoran web şablonu.
Müşteriye "metninizi/görselinizi verin, size böyle sayfalar tasarlayalım" denebilecek örnek ürün.
Mevcut Vite + React 19 + Tailwind 3 + GSAP + React Router iskeleti tamamlanacak.

## Kararlar

- **Konsept:** Fine-dining, koyu "noir" tema, içerik dili Türkçe.
- **Formlar:** Backend yok. Rezervasyon → WhatsApp deep link (`wa.me/<no>?text=...`);
  iletişim → `mailto:`.
- **Görseller:** Unsplash canlı URL'leri geçici örnek; tümü `src/data/images.js` içinde,
  satın alınan görsellerle tek dosyadan değiştirilir.
- **Kapsam:** Sinematik tam paket + cesur revizyon ("Gece Servisi").
- **Mobil:** Her kurgu kararının mobil karşılığı tanımlı; dokunmatik öncelikli düşünülür.

## Tasarım Dili: "Tadım Menüsü"

Site bir degustasyon gibi davranır: sayfa bölümleri sıralı **"Fasıl"** (kurs) olarak
kurgulanır — tadım menüsünde sıra gerçek bilgi taşır. Sağ kenarda ince **"servis rayı"**
scroll ilerlemesini fasıl bazında gösterir (mobilde gizli).

**İmza öğe:** Fasıllar arası **maske-açılım geçişleri** (clip-path reveal) — tabak
kapağının kaldırılması gibi. Cesaret burada yoğunlaşır; geri kalan disiplinli kalır.

### Görsel Kimlik

- Palet: közlenmiş siyah `#0E0C09` zemin, sıcak krem `#F2E9DA` metin, pirinç `#C89B5A`
  vurgu, derin şarap bordosu `#5C1F1A` (hover/seçim), yükseltilmiş yüzey `#2A2620`.
- Tipografi: Cormorant Garamond (display; italikler menü açıklamalarında karakter verir)
  ve Manrope (gövde), Google Fonts.
- Doku: ince film-grain overlay, editoryal bol boşluk, görsel sınırlarını taşan büyük punto.

## Sinematik Katman ("Gece Servisi" revizyonu)

1. **Preloader:** Sayaç + logo → perde maske-açılımıyla hero'ya geçiş. İlk ziyarette tam,
   sayfa geçişlerinde kısa varyant.
2. **Pürüzsüz kayma:** `lenis` ile smooth scroll (tüm site).
3. **WebGL görsel dokunuşu:** `ogl` ile hover'da sıvı displacement; menü yapışkan panelinde
   görseller arası distortion crossfade. Desteklenmeyen cihaz/`prefers-reduced-motion`
   durumunda düz görsele düşüş.
4. **Bağlamsal imleç:** Mevcut CustomCursor genişletilir — yatay şeritte "Sürükle", yemek
   üzerinde "Gör", CTA'da büyüyen halka. Dokunmatik cihazlarda tamamen kapalı.

Eklenen bağımlılıklar: `lenis`, `ogl` (hafif; three.js yok).

## Sayfalar

### Ana Sayfa (`/`) — yatay sinema

- Menü kitabı kapağı gibi tipografik tam ekran açılış (SplitText harf açılışı + yavaş zoom).
- Sonrası **pinned yatay yolculuk** (GSAP ScrollTrigger; dikey scroll → yatay hareket):
  İmza yemekler film şeridi → hikaye kolajı (farklı hızlarda paralaks, bindirmeli tipografi)
  → rezervasyon daveti (menünün son sayfası hissi).
- **Mobil:** Yatay yolculuk otomatik dikey akışa düşer; kolaj tek kolon, paralaks hafifler.

### Menü (`/menu`)

- Solda **yapışkan görsel paneli** (aktif öğeye göre WebGL crossfade), sağda asimetrik iki
  kolonlu öğe listesi; 4 kategori (Başlangıçlar, Ana Yemekler, Tatlılar, İçecekler) büyük
  döner indeksle gezilir; öğeler stagger animasyonla girer/çıkar.
- **Mobil:** Görsel paneli üstte yatay kaydırılabilir şerit olur; liste tek kolon.

### Rezervasyon (`/rezervasyon`) — adım adım sohbet formu

- Tek tek büyük tipografili sorular: kişi sayısı → tarih → saat → ad/telefon → not (ops.).
- Doğrulama: zorunlu alanlar, telefon formatı, geçmiş tarih engeli; hatalar alan altında Türkçe.
- Son adım: WhatsApp mesajı **not kartı önizlemesi** → onayla `wa.me` linki açılır;
  başarı mikro-animasyonu. `mailto:` yedeği sunulur.
- **Mobil:** Adımlı yapı doğal uyar; büyük dokunma hedefleri, native tarih/saat girdileri.

### İletişim (`/iletisim`) — bölünmüş ekran

- Solda dev tipografili yapışkan adres paneli; sağda saatler, koyu temalı harita iframe'i,
  sosyal linkler, kısa `mailto:` formu.
- **Mobil:** Paneller alt alta; adres tipografisi ölçek küçültür.

## Mimari

```text
src/
  data/
    site.js      # telefon, WhatsApp no, adres, saatler, sosyal linkler
    menu.js      # menü öğeleri (kategori, ad, açıklama, fiyat, görsel anahtarı)
    images.js    # TÜM görsel URL'leri (tek yerden takas)
    content.js   # sayfa metinleri (hero, hikaye, fasıl başlıkları, form soruları)
  components/
    layout/      # Navbar, Footer, PageTransition (mevcut, tamamlanacak)
    ui/          # SplitText, ScrollReveal, CustomCursor, Preloader, ServiceRail,
                 # WebGLImage (fallback'li)
    sections/    # sayfa fasılları (Cover, SignatureStrip, StoryCollage, ReserveInvite, ...)
  pages/         # 4 sayfa; fasılları birleştirir
  hooks/         # useGSAP, useScrollTrigger (mevcut), useLenis, useMediaCapability
```

- Bölüm bileşenleri tek sorumluluklu; veri ve metin daima `src/data/`den gelir.
- Şablon müşterisi yalnızca `src/data/` düzenleyerek siteyi özelleştirir.
- `useMediaCapability`: dokunmatik / reduced-motion / WebGL desteğini tek yerden raporlar;
  tüm sinematik katman bu sinyale göre zarif düşüş yapar.

## Hata Yönetimi ve Erişilebilirlik

- Form hataları alan altında Türkçe; geçersizken gönderim engellenir.
- `prefers-reduced-motion: reduce` → GSAP/WebGL/lenis kapalı, içerik direkt görünür.
- Görsel yüklenemezse koyu zemin zarif fallback.
- Semantik HTML, form etiketleri, görünür odak halkaları, klavye ile gezilebilirlik.
- Yatay bölüm klavye kullanıcıları için de erişilebilir (scroll ile ilerler, odak sırası korunur).

## Doğrulama

1. `npm run lint` ve `npm run build` temiz geçer.
2. Dev sunucuda 4 sayfa masaüstü + mobil viewport'ta gezilir: animasyonlar, yatay yolculuk,
   filtre, form akışı, WhatsApp/mailto linklerinin doğru üretimi.
3. Reduced-motion emülasyonunda sayfalar animasyonsuz okunabilir.
4. Mobil emülasyonda dokunmatik akışlar ve dikey düşüşler kontrol edilir.
