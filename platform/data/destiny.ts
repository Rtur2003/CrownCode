/**
 * Crown Destiny - Kader Kartları Sistemi
 * Tarot değil, kendi evrenimiz!
 * Çeşitli mesajlar: olumlu, olumsuz, nötr, genel, özel
 */

export type FortuneCategory = 'love' | 'career' | 'money' | 'health' | 'spirit'
export type MessageTone = 'positive' | 'negative' | 'neutral'
export type MessageType = 'general' | 'specific' | 'advice' | 'warning'

export interface DestinyCard {
  id: number
  name: string
  nameTr: string
  symbol: string // emoji or icon name
  image: string // path to image in /tarot
  element: 'fire' | 'water' | 'earth' | 'air' | 'ether'
  energy: 'ascending' | 'descending' | 'stable'
}

export interface FortuneMessage {
  text: string // Turkish
  textEn: string // English
  tone: MessageTone
  type: MessageType
}

export const FORTUNE_CATEGORIES: {
  key: FortuneCategory
  label: string
  labelTr: string
  icon: string
  color: string
  description: string
}[] = [
  {
    key: 'love',
    label: 'Love',
    labelTr: 'Aşk',
    icon: 'heart',
    color: '#e74c3c',
    description: 'Kalbin yolu'
  },
  {
    key: 'career',
    label: 'Career',
    labelTr: 'Kariyer',
    icon: 'briefcase',
    color: '#3498db',
    description: 'Başarı yolculuğu'
  },
  {
    key: 'money',
    label: 'Wealth',
    labelTr: 'Bereket',
    icon: 'coins',
    color: '#f39c12',
    description: 'Bolluk enerjisi'
  },
  {
    key: 'health',
    label: 'Vitality',
    labelTr: 'Sağlık',
    icon: 'activity',
    color: '#27ae60',
    description: 'Yaşam gücü'
  },
  {
    key: 'spirit',
    label: 'Spirit',
    labelTr: 'Ruh',
    icon: 'sparkles',
    color: '#9b59b6',
    description: 'İç dünya'
  },
]

// 22 Kader Kartı - Kendi evrenimiz
export const DESTINY_CARDS: DestinyCard[] = [
  { id: 0, name: 'The Wanderer', nameTr: 'Gezgin', symbol: '🌟', image: '/tarot/the-fool.png', element: 'air', energy: 'ascending' },
  { id: 1, name: 'The Creator', nameTr: 'Yaratıcı', symbol: '✨', image: '/tarot/the-magician.png', element: 'fire', energy: 'ascending' },
  { id: 2, name: 'The Oracle', nameTr: 'Kahin', symbol: '🔮', image: '/tarot/the-high-priestess.png', element: 'water', energy: 'stable' },
  { id: 3, name: 'The Nurturer', nameTr: 'Koruyucu', symbol: '🌸', image: '/tarot/the-empress.png', element: 'earth', energy: 'stable' },
  { id: 4, name: 'The Sovereign', nameTr: 'Hükümdar', symbol: '👑', image: '/tarot/the-emperor.png', element: 'fire', energy: 'stable' },
  { id: 5, name: 'The Guide', nameTr: 'Rehber', symbol: '🗝️', image: '/tarot/the-hierophant.png', element: 'earth', energy: 'stable' },
  { id: 6, name: 'The Union', nameTr: 'Birlik', symbol: '💫', image: '/tarot/the-lovers.png', element: 'air', energy: 'ascending' },
  { id: 7, name: 'The Chariot', nameTr: 'Zafer', symbol: '⚡', image: '/tarot/the-chariot.png', element: 'fire', energy: 'ascending' },
  { id: 8, name: 'The Phoenix', nameTr: 'Anka', symbol: '🔥', image: '/tarot/strength.png', element: 'fire', energy: 'ascending' },
  { id: 9, name: 'The Hermit', nameTr: 'Bilge', symbol: '🏔️', image: '/tarot/the-hermit.png', element: 'earth', energy: 'stable' },
  { id: 10, name: 'The Wheel', nameTr: 'Çark', symbol: '☯️', image: '/tarot/wheel-of-fortune.png', element: 'ether', energy: 'stable' },
  { id: 11, name: 'The Balance', nameTr: 'Denge', symbol: '⚖️', image: '/tarot/justice.png', element: 'air', energy: 'stable' },
  { id: 12, name: 'The Reflection', nameTr: 'Yansıma', symbol: '🪞', image: '/tarot/the-hanged-man.png', element: 'water', energy: 'descending' },
  { id: 13, name: 'The Transformation', nameTr: 'Dönüşüm', symbol: '🦋', image: '/tarot/death.png', element: 'water', energy: 'descending' },
  { id: 14, name: 'The Harmony', nameTr: 'Uyum', symbol: '🎵', image: '/tarot/temperance.png', element: 'water', energy: 'stable' },
  { id: 15, name: 'The Shadow', nameTr: 'Gölge', symbol: '🌑', image: '/tarot/the-devil.png', element: 'earth', energy: 'descending' },
  { id: 16, name: 'The Storm', nameTr: 'Fırtına', symbol: '⛈️', image: '/tarot/the-tower.png', element: 'air', energy: 'descending' },
  { id: 17, name: 'The Star', nameTr: 'Yıldız', symbol: '⭐', image: '/tarot/the-star.png', element: 'ether', energy: 'ascending' },
  { id: 18, name: 'The Dream', nameTr: 'Düş', symbol: '🌙', image: '/tarot/the-moon.png', element: 'water', energy: 'stable' },
  { id: 19, name: 'The Dawn', nameTr: 'Şafak', symbol: '☀️', image: '/tarot/the-sun.png', element: 'fire', energy: 'ascending' },
  { id: 20, name: 'The Awakening', nameTr: 'Uyanış', symbol: '🔔', image: '/tarot/judgement.png', element: 'ether', energy: 'ascending' },
  { id: 21, name: 'The Crown', nameTr: 'Taç', symbol: '👑', image: '/tarot/the-world.png', element: 'ether', energy: 'ascending' },
]

// Mesaj havuzu - kategori ve ton bazlı
export const FORTUNE_MESSAGES: Record<FortuneCategory, FortuneMessage[]> = {
  love: [
    // Pozitif - Genel
    { text: 'Bugün kalbin açık, sevgi alacak ve vereceksin.', tone: 'positive', type: 'general' },
    { text: 'Aşk enerjin yükselişte, çevrendekiler bunu hissedecek.', tone: 'positive', type: 'general' },
    { text: 'Romantik bir sürpriz kapıda olabilir.', tone: 'positive', type: 'general' },
    { text: 'Duygusal bağların güçleniyor.', tone: 'positive', type: 'general' },
    { text: 'Sevgi dolu anlar seni bekliyor.', tone: 'positive', type: 'general' },

    // Pozitif - Özel
    { text: 'Uzun süredir beklediğin haber bugün gelebilir.', tone: 'positive', type: 'specific' },
    { text: 'Birileri seni düşünüyor, belki de sana ulaşacak.', tone: 'positive', type: 'specific' },
    { text: 'Eski bir tanıdıkla karşılaşma ihtimali yüksek.', tone: 'positive', type: 'specific' },
    { text: 'Bir bakış, bir gülümseme... Dikkatli ol, anlam yüklü.', tone: 'positive', type: 'specific' },

    // Pozitif - Tavsiye
    { text: 'Duygularını ifade etmekten çekinme, karşılık bulacaksın.', tone: 'positive', type: 'advice' },
    { text: 'Kalbini dinle, akıl bugün ikinci planda kalmalı.', tone: 'positive', type: 'advice' },
    { text: 'Affetmek güçtür, bugün bu gücü kullanabilirsin.', tone: 'positive', type: 'advice' },

    // Negatif - Genel
    { text: 'Bugün duygusal iniş çıkışlar yaşayabilirsin.', tone: 'negative', type: 'general' },
    { text: 'Beklentilerini biraz düşür, hayal kırıklığından kaçın.', tone: 'negative', type: 'general' },
    { text: 'Yanlış anlaşılmalara açık bir gün, dikkatli ol.', tone: 'negative', type: 'general' },

    // Negatif - Uyarı
    { text: 'Aceleye gerek yok, bazı duygular zaman ister.', tone: 'negative', type: 'warning' },
    { text: 'Her söylenen samimi olmayabilir, sezgilerini kullan.', tone: 'negative', type: 'warning' },
    { text: 'Geçmişe takılma, bugünü kaçırırsın.', tone: 'negative', type: 'warning' },

    // Nötr - Genel
    { text: 'Duygusal denge günü, ne çok yükseliş ne düşüş.', tone: 'neutral', type: 'general' },
    { text: 'Aşk hayatında durağan bir dönem, bu da geçici.', tone: 'neutral', type: 'general' },
    { text: 'Kendinle vakit geçirmek için ideal bir gün.', tone: 'neutral', type: 'general' },
    { text: 'İlişkilerde sabır anahtarın bugün.', tone: 'neutral', type: 'advice' },
  ],

  career: [
    // Pozitif - Genel
    { text: 'İş hayatında parlak bir gün! Fırsatlar kapıda.', tone: 'positive', type: 'general' },
    { text: 'Yeteneklerin bugün fark edilecek.', tone: 'positive', type: 'general' },
    { text: 'Kariyer hedeflerine bir adım daha yaklaştın.', tone: 'positive', type: 'general' },
    { text: 'Takım çalışması bugün harikalar yaratacak.', tone: 'positive', type: 'general' },
    { text: 'Yaratıcı fikirler akacak, not almayı unutma.', tone: 'positive', type: 'general' },

    // Pozitif - Özel
    { text: 'Beklediğin onay veya terfı haberi yakın.', tone: 'positive', type: 'specific' },
    { text: 'Bir toplantı veya görüşme çok olumlu geçecek.', tone: 'positive', type: 'specific' },
    { text: 'Yeni bir proje teklifi alabilirsin.', tone: 'positive', type: 'specific' },
    { text: 'Bir iş bağlantısı kapıları açacak.', tone: 'positive', type: 'specific' },

    // Pozitif - Tavsiye
    { text: 'Kendine güven, başarı seni bekliyor.', tone: 'positive', type: 'advice' },
    { text: 'Risk almaktan korkma, kazanacaksın.', tone: 'positive', type: 'advice' },
    { text: 'Fikirlerini paylaş, değer görecekler.', tone: 'positive', type: 'advice' },

    // Negatif - Genel
    { text: 'İş yerinde gerilim olabilir, sakin kal.', tone: 'negative', type: 'general' },
    { text: 'Beklenmedik engeller çıkabilir ama geçici.', tone: 'negative', type: 'general' },
    { text: 'Bugün büyük kararlar alma, bekle.', tone: 'negative', type: 'general' },

    // Negatif - Uyarı
    { text: 'Dedikodulara kulak asma, işine odaklan.', tone: 'negative', type: 'warning' },
    { text: 'Acele işe şeytan karışır, detaylara dikkat.', tone: 'negative', type: 'warning' },
    { text: 'Herkese güvenme, önce kanıtlasınlar.', tone: 'negative', type: 'warning' },

    // Nötr - Genel
    { text: 'Rutin bir iş günü, fırtına öncesi sessizlik.', tone: 'neutral', type: 'general' },
    { text: 'Planlama ve organizasyon için ideal gün.', tone: 'neutral', type: 'general' },
    { text: 'Bugün tohumları ek, yarın hasat zamanı.', tone: 'neutral', type: 'general' },
    { text: 'Öğrenmeye açık ol, yeni bilgiler geliyor.', tone: 'neutral', type: 'advice' },
  ],

  money: [
    // Pozitif - Genel
    { text: 'Bolluk enerjisi etrafında, paranı çekiyorsun.', tone: 'positive', type: 'general' },
    { text: 'Finansal şansın yükselişte!', tone: 'positive', type: 'general' },
    { text: 'Beklenmedik bir gelir kapıda olabilir.', tone: 'positive', type: 'general' },
    { text: 'Yatırımların meyvesini vermeye başlıyor.', tone: 'positive', type: 'general' },
    { text: 'Maddi konularda olumlu gelişmeler var.', tone: 'positive', type: 'general' },

    // Pozitif - Özel
    { text: 'Uzun süredir beklediğin ödeme gelebilir.', tone: 'positive', type: 'specific' },
    { text: 'Bir alışverişte beklenmedik indirim bulacaksın.', tone: 'positive', type: 'specific' },
    { text: 'Yan gelir fırsatı kendini gösterebilir.', tone: 'positive', type: 'specific' },
    { text: 'Finansal bir teklif dikkatini çekecek.', tone: 'positive', type: 'specific' },

    // Pozitif - Tavsiye
    { text: 'Birikime başlamak için ideal gün.', tone: 'positive', type: 'advice' },
    { text: 'Değerini bil, pazarlık yap.', tone: 'positive', type: 'advice' },
    { text: 'Cömertlik sana katlanarak dönecek.', tone: 'positive', type: 'advice' },

    // Negatif - Genel
    { text: 'Beklenmedik harcamalar çıkabilir, hazırlıklı ol.', tone: 'negative', type: 'general' },
    { text: 'Bugün büyük alımlar için uygun değil.', tone: 'negative', type: 'general' },
    { text: 'Finansal kararları ertele, netlik yok.', tone: 'negative', type: 'general' },

    // Negatif - Uyarı
    { text: 'Çok iyi görünen teklifler aldatıcı olabilir.', tone: 'negative', type: 'warning' },
    { text: 'Borç verme veya alma konusunda dikkatli ol.', tone: 'negative', type: 'warning' },
    { text: 'İmpulsif harcamalardan kaçın, pişman olursun.', tone: 'negative', type: 'warning' },

    // Nötr - Genel
    { text: 'Finansal denge günü, ne kazanç ne kayıp.', tone: 'neutral', type: 'general' },
    { text: 'Bütçeni gözden geçirmek için iyi zaman.', tone: 'neutral', type: 'general' },
    { text: 'Para konusunda sabırlı ol, zaman senin yanında.', tone: 'neutral', type: 'general' },
    { text: 'Küçük adımlar büyük servetler yaratır.', tone: 'neutral', type: 'advice' },
  ],

  health: [
    // Pozitif - Genel
    { text: 'Enerji seviyeni yüksek, tadını çıkar!', tone: 'positive', type: 'general' },
    { text: 'Bedenin güçlü, bugün her şeyi başarabilirsin.', tone: 'positive', type: 'general' },
    { text: 'Sağlık için olumlu enerji akışı var.', tone: 'positive', type: 'general' },
    { text: 'Zihin ve beden uyum içinde.', tone: 'positive', type: 'general' },
    { text: 'Şifa enerjisi seni sarıyor.', tone: 'positive', type: 'general' },

    // Pozitif - Özel
    { text: 'Yeni bir spor veya aktivite denersen çok keyif alırsın.', tone: 'positive', type: 'specific' },
    { text: 'Bugün aldığın besinler seni besleyecek.', tone: 'positive', type: 'specific' },
    { text: 'Uzun süredir yapmak istediğin sağlıklı değişiklik için tam gün.', tone: 'positive', type: 'specific' },

    // Pozitif - Tavsiye
    { text: 'Doğada zaman geçir, ruhun ve bedenin şükredecek.', tone: 'positive', type: 'advice' },
    { text: 'Bol su iç, bedenin sana teşekkür edecek.', tone: 'positive', type: 'advice' },
    { text: 'Gülümse, mutluluk hormonların aktif.', tone: 'positive', type: 'advice' },

    // Negatif - Genel
    { text: 'Enerji seviyeni düşük hissedebilirsin.', tone: 'negative', type: 'general' },
    { text: 'Stres belirtilerine dikkat, dinlenme şart.', tone: 'negative', type: 'general' },
    { text: 'Bedenin sana mesaj veriyor, dinle.', tone: 'negative', type: 'general' },

    // Negatif - Uyarı
    { text: 'Aşırı yorgunluk sinyalleri, mola ver.', tone: 'negative', type: 'warning' },
    { text: 'Sağlıksız alışkanlıklardan bugün uzak dur.', tone: 'negative', type: 'warning' },
    { text: 'Uyku düzenine dikkat, ihmal etme.', tone: 'negative', type: 'warning' },

    // Nötr - Genel
    { text: 'Dengeli bir sağlık günü, rutin koru.', tone: 'neutral', type: 'general' },
    { text: 'Bedenini dinle, o sana ne istediğini söylüyor.', tone: 'neutral', type: 'general' },
    { text: 'Küçük değişiklikler büyük sonuçlar yaratır.', tone: 'neutral', type: 'general' },
    { text: 'Önleme tedaviden iyidir, bugün buna odaklan.', tone: 'neutral', type: 'advice' },
  ],

  spirit: [
    // Pozitif - Genel
    { text: 'Ruhsal enerijn çok yüksek, içsel huzur var.', tone: 'positive', type: 'general' },
    { text: 'Sezgilerin bugün çok güçlü, güven onlara.', tone: 'positive', type: 'general' },
    { text: 'Evrenle bağlantın açık, mesajları al.', tone: 'positive', type: 'general' },
    { text: 'İç huzur ve denge hakim.', tone: 'positive', type: 'general' },
    { text: 'Spiritüel farkındalığın artıyor.', tone: 'positive', type: 'general' },

    // Pozitif - Özel
    { text: 'Bir rüya veya işaret dikkatini çekecek, not al.', tone: 'positive', type: 'specific' },
    { text: 'Beklenmedik bir içgörü anı yaşayabilirsin.', tone: 'positive', type: 'specific' },
    { text: 'Birinin sözleri sana ilham verecek.', tone: 'positive', type: 'specific' },

    // Pozitif - Tavsiye
    { text: 'Meditasyon veya sessizlik için zaman ayır.', tone: 'positive', type: 'advice' },
    { text: 'Şükran listesi yaz, enerijn yükselecek.', tone: 'positive', type: 'advice' },
    { text: 'Doğayla bağlantı kur, topraklan.', tone: 'positive', type: 'advice' },

    // Negatif - Genel
    { text: 'Zihinsel karmaşa yaşayabilirsin, sakinleş.', tone: 'negative', type: 'general' },
    { text: 'Negatif düşünceler yoğun, bırak gitsinler.', tone: 'negative', type: 'general' },
    { text: 'Spiritüel yorgunluk belirtileri, şarj ol.', tone: 'negative', type: 'general' },

    // Negatif - Uyarı
    { text: 'Başkalarının enerjisinden korun, sınır koy.', tone: 'negative', type: 'warning' },
    { text: 'Aşırı düşünme tuzağına düşme, hisset.', tone: 'negative', type: 'warning' },
    { text: 'Negatif ortamlardan uzak dur bugün.', tone: 'negative', type: 'warning' },

    // Nötr - Genel
    { text: 'İç dünyanda keşif zamanı, kendini dinle.', tone: 'neutral', type: 'general' },
    { text: 'Ruhsal denge için ideal gün, korumaya al.', tone: 'neutral', type: 'general' },
    { text: 'Sorular cevaplardan önemli, sorgula.', tone: 'neutral', type: 'general' },
    { text: 'Bugün sadece var ol, hiçbir şey yapma.', tone: 'neutral', type: 'advice' },
  ],
}

// =============== YARDIMCI FONKSİYONLAR ===============

/**
 * GMT+3 (Türkiye) saat dilimine göre bugünün tarihini alır
 */
export function getTurkeyDate(): string {
  const now = new Date()
  const turkeyOffset = 3 * 60 // dakika cinsinden
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  const turkeyTime = new Date(utc + (turkeyOffset * 60000))
  return turkeyTime.toISOString().split('T')[0]
}

/**
 * GMT+3 gece yarısına kalan süreyi hesaplar (milisaniye)
 */
export function getTimeUntilMidnightGMT3(): number {
  const now = new Date()
  const turkeyOffset = 3 * 60
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  const turkeyTime = new Date(utc + (turkeyOffset * 60000))

  const midnight = new Date(turkeyTime)
  midnight.setHours(24, 0, 0, 0)

  return midnight.getTime() - turkeyTime.getTime()
}

/**
 * Tarih ve kullanıcı bazlı seed ile tutarlı rastgele sayı
 */
function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

/**
 * Seed bazlı rastgele seçim (array'den)
 */
function seededChoice<T>(array: T[], seed: number): T {
  return array[seed % array.length]
}

/**
 * Kullanıcı ID oluştur veya mevcut olanı getir
 */
export function getUserId(): string {
  if (typeof window === 'undefined') return 'server'

  let userId = localStorage.getItem('crown_destiny_user_id')
  if (!userId) {
    userId = 'crown_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    localStorage.setItem('crown_destiny_user_id', userId)
  }
  return userId
}

// =============== GÜNLÜK FAL SİSTEMİ ===============

export interface DailyDestiny {
  date: string
  cardId: number
  category: FortuneCategory
  messageIndex: number
  tone: MessageTone
}

/**
 * Günlük kaderi belirle veya mevcut olanı getir
 */
export function getDailyDestiny(): DailyDestiny {
  if (typeof window === 'undefined') {
    return { date: '', cardId: 0, category: 'spirit', messageIndex: 0, tone: 'neutral' }
  }

  const today = getTurkeyDate()
  const userId = getUserId()
  const storageKey = 'crown_daily_destiny'

  // Kayıtlı kaderi kontrol et
  const stored = localStorage.getItem(storageKey)
  if (stored) {
    try {
      const parsed: DailyDestiny = JSON.parse(stored)
      if (parsed.date === today) {
        return parsed
      }
    } catch {
      // Parse hatası, yeni oluştur
    }
  }

  // Yeni kader oluştur
  const baseSeed = seededRandom(`${today}_${userId}`)

  // Kart seç
  const cardId = baseSeed % DESTINY_CARDS.length

  // Kategori seç
  const categoryIndex = Math.floor(baseSeed / DESTINY_CARDS.length) % FORTUNE_CATEGORIES.length
  const category = FORTUNE_CATEGORIES[categoryIndex].key

  // Ton belirle (kartın enerjisine göre ağırlıklı)
  const card = DESTINY_CARDS[cardId]
  const toneWeights: MessageTone[] =
    card.energy === 'ascending' ? ['positive', 'positive', 'positive', 'neutral'] :
    card.energy === 'descending' ? ['negative', 'negative', 'neutral', 'positive'] :
    ['positive', 'neutral', 'neutral', 'negative']

  const toneIndex = Math.floor(baseSeed / (DESTINY_CARDS.length * FORTUNE_CATEGORIES.length)) % toneWeights.length
  const tone = toneWeights[toneIndex]

  // Mesaj seç (ton filtreli)
  const categoryMessages = FORTUNE_MESSAGES[category]
  const filteredMessages = categoryMessages.filter(m => m.tone === tone)
  const messageIndex = categoryMessages.indexOf(
    seededChoice(filteredMessages.length > 0 ? filteredMessages : categoryMessages, baseSeed)
  )

  const destiny: DailyDestiny = {
    date: today,
    cardId,
    category,
    messageIndex: Math.max(0, messageIndex),
    tone
  }

  localStorage.setItem(storageKey, JSON.stringify(destiny))
  return destiny
}

/**
 * Kader detaylarını getir
 */
export function getDestinyDetails(destiny: DailyDestiny) {
  const card = DESTINY_CARDS[destiny.cardId]
  const category = FORTUNE_CATEGORIES.find(c => c.key === destiny.category)!
  const messages = FORTUNE_MESSAGES[destiny.category]
  const message = messages[destiny.messageIndex] || messages[0]

  return {
    card,
    category,
    message,
    tone: destiny.tone
  }
}

/**
 * Element emoji
 */
export function getElementEmoji(element: DestinyCard['element']): string {
  const emojis = {
    fire: '🔥',
    water: '💧',
    earth: '🌍',
    air: '💨',
    ether: '✨'
  }
  return emojis[element]
}

/**
 * Enerji açıklaması
 */
export function getEnergyDescription(energy: DestinyCard['energy'], language: 'tr' | 'en'): string {
  const descriptions = {
    ascending: { tr: 'Yükselen Enerji', en: 'Rising Energy' },
    descending: { tr: 'Alçalan Enerji', en: 'Falling Energy' },
    stable: { tr: 'Dengeli Enerji', en: 'Balanced Energy' }
  }
  return descriptions[energy][language]
}
