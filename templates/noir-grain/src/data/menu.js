// ─────────────────────────────────────────────────────────────
// ŞABLON ÖZELLEŞTİRME: Menü kategorileri ve öğeleri.
// `signature: true` olan öğeler ana sayfadaki İmza faslında görünür (3 adet önerilir).
// Görsel eşleşmesi images.js → dishes[id] üzerinden yapılır.
// ─────────────────────────────────────────────────────────────
export const categories = [
  { id: 'baslangiclar', label: 'Başlangıçlar', numeral: 'I' },
  { id: 'ana-yemekler', label: 'Ana Yemekler', numeral: 'II' },
  { id: 'tatlilar', label: 'Tatlılar', numeral: 'III' },
  { id: 'icecekler', label: 'İçecekler', numeral: 'IV' },
]

export const menuItems = [
  // Başlangıçlar
  { id: 'levrek-marin', category: 'baslangiclar', name: 'Levrek Marin',
    desc: 'Turunç, taze kekik, soğuk sıkım zeytinyağı', price: 480, signature: true },
  { id: 'kozlenmis-pancar', category: 'baslangiclar', name: 'Közlenmiş Pancar',
    desc: 'Keçi peyniri köpüğü, fındık, nar ekşisi', price: 390 },
  { id: 'dana-carpaccio', category: 'baslangiclar', name: 'Dana Carpaccio',
    desc: 'Kapari, yıllanmış parmesan, roka yağı', price: 520 },
  { id: 'kabak-cicegi', category: 'baslangiclar', name: 'Kabak Çiçeği Dolması',
    desc: 'Otlu lor, limon zesti, dereotu yağı', price: 360 },

  // Ana Yemekler
  { id: 'kuzu-incik', category: 'ana-yemekler', name: 'Kuzu İncik',
    desc: '12 saat pişirim, kök sebze püresi, demi-glace', price: 980, signature: true },
  { id: 'dry-aged-antrikot', category: 'ana-yemekler', name: 'Dry-Aged Antrikot',
    desc: 'Kemik iliği tereyağı, közlenmiş sarımsak', price: 1250, signature: true },
  { id: 'karides-linguine', category: 'ana-yemekler', name: 'Karides Linguine',
    desc: 'Safran, ıstakoz bisque, taze fesleğen', price: 780 },
  { id: 'ordek-gogsu', category: 'ana-yemekler', name: 'Ördek Göğsü',
    desc: 'Vişne glaze, karamelize hindiba', price: 890 },
  { id: 'mantar-risotto', category: 'ana-yemekler', name: 'Mantar Risotto',
    desc: 'Orman mantarları, trüf yağı, yıllanmış parmesan', price: 640 },

  // Tatlılar
  { id: 'valrhona-sufle', category: 'tatlilar', name: 'Valrhona Sufle',
    desc: 'Tonka fasulyesi dondurması, kakao kırıkları', price: 380 },
  { id: 'fistikli-katmer', category: 'tatlilar', name: 'Fıstıklı Katmer',
    desc: 'Antep fıstığı, kaymak dondurması', price: 340 },
  { id: 'creme-brulee', category: 'tatlilar', name: 'Crème Brûlée',
    desc: 'Lavanta, yakılmış portakal', price: 320 },
  { id: 'cikolata-ganaj', category: 'tatlilar', name: 'Çikolata Ganaj',
    desc: 'Deniz tuzu, sızma zeytinyağı, ekşi maya kruton', price: 350 },

  // İçecekler
  { id: 'noir-old-fashioned', category: 'icecekler', name: 'Noir Old Fashioned',
    desc: 'Tütsülenmiş viski, portakal kabuğu, bitter', price: 420 },
  { id: 'grain-sour', category: 'icecekler', name: 'Grain Sour',
    desc: 'Rakı bazlı, anason köpüğü, limon', price: 390 },
  { id: 'sef-seckisi-sarap', category: 'icecekler', name: 'Şef Seçkisi Şarap',
    desc: 'Kadeh servisi, günün seçkisi', price: 350 },
  { id: 'el-yapimi-limonata', category: 'icecekler', name: 'El Yapımı Limonata',
    desc: 'Bergamot, taze nane', price: 180 },
  { id: 'turk-kahvesi', category: 'icecekler', name: 'Türk Kahvesi',
    desc: 'Damla sakızlı lokum ile', price: 150 },
]

export const signatureItems = menuItems.filter(i => i.signature)
