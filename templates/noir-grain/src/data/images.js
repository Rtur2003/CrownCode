// ─────────────────────────────────────────────────────────────
// ŞABLON ÖZELLEŞTİRME: TÜM görseller bu dosyadan yönetilir.
// Satın aldığınız görselleri /public/images/ altına koyup
// URL'leri '/images/dosya.jpg' ile değiştirmeniz yeterli.
// Mevcut URL'ler Unsplash'ten geçici örneklerdir.
// ─────────────────────────────────────────────────────────────
const u = (id, w = 1600) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`

export const images = {
  // Ana sayfa kapak (koyu, atmosferik mekan)
  hero: u('photo-1414235077428-338989a2e8c0', 2000),

  // Hikaye kolajı — 3 görsel (bar, karanlık salon, vitrin)
  story: [
    u('photo-1514933651103-005eec06c04b'),
    u('photo-1517248135467-4c7edcad34c4'),
    u('photo-1481833761820-0509d3217039'),
  ],

  // İletişim sayfası paneli
  contact: u('photo-1552566626-52f8b828add9'),

  // Davet faslı (ana sayfa) — loş kokteyl servisi
  invite: u('photo-1470337458703-46ad1756a187'),

  // Menü öğeleri — anahtarlar menu.js'teki `id` alanlarıyla eşleşir
  dishes: {
    'levrek-marin':      u('photo-1519708227418-c8fd9a32b7a2'),
    'kozlenmis-pancar':  u('photo-1476718406336-bb5a9690ee2a'),
    'dana-carpaccio':    u('photo-1504674900247-0877df9cc836'),
    'kabak-cicegi':      u('photo-1476224203421-9ac39bcb3327'),
    'kuzu-incik':        u('photo-1432139555190-58524dae6a55'),
    'dry-aged-antrikot': u('photo-1558030006-450675393462'),
    'karides-linguine':  u('photo-1563379926898-05f4575a45d8'),
    'ordek-gogsu':       u('photo-1559339352-11d035aa65de'),
    'mantar-risotto':    u('photo-1481931098730-318b6f776db0'),
    'valrhona-sufle':    u('photo-1541544741938-0af808871cc0'),
    'fistikli-katmer':   u('photo-1470124182917-cc6e71b22ecc'),
    'creme-brulee':      u('photo-1488477181946-6428a0291777'),
    'cikolata-ganaj':    u('photo-1606313564200-e75d5e30476c'),
    'noir-old-fashioned': u('photo-1514362545857-3bc16c4c7d1b'),
    'grain-sour':        u('photo-1536935338788-846bb9981813'),
    'sef-seckisi-sarap': u('photo-1510812431401-41d2bd2722f3'),
    'el-yapimi-limonata': u('photo-1556679343-c7306c1976bc'),
    'turk-kahvesi':      u('photo-1447933601403-0c6688de566e'),
  },
}
