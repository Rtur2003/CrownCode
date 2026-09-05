/**
 * Crown Destiny - Kader Kartları Sistemi
 * Tarot değil, kendi evrenimiz!
 * Çeşitli mesajlar: olumlu, olumsuz, nötr, genel, özel
 */

// ============================================================
// LOCALSTORAGE KEYS - Merkezi yönetim
// ============================================================
export const STORAGE_KEYS = {
  DAILY_DESTINY: 'crown_daily_destiny',
  REVEALED: 'crown_destiny_revealed',
  IS_REVERSED: 'crown_destiny_is_reversed',
  REVERSE_MESSAGE: 'crown_destiny_reverse_msg',
  USER_ID: 'crown_destiny_user_id',
  STREAK_COUNT: 'crown_destiny_streak',
  STREAK_LAST_DATE: 'crown_destiny_streak_date',
  CARD_COLLECTION: 'crown_destiny_collection',
} as const

// Streak milestone badges
export const STREAK_MILESTONES = [
  { days: 3, badge: '🌱', label: { tr: 'Filiz', en: 'Seedling' } },
  { days: 7, badge: '🔥', label: { tr: 'Ateş Ruhu', en: 'Fire Spirit' } },
  { days: 14, badge: '⭐', label: { tr: 'Yıldız Avcısı', en: 'Star Hunter' } },
  { days: 30, badge: '🌙', label: { tr: 'Ay Çocuğu', en: 'Moon Child' } },
  { days: 60, badge: '👁️', label: { tr: 'Üçüncü Göz', en: 'Third Eye' } },
  { days: 100, badge: '👑', label: { tr: 'Kader Kralı', en: 'Destiny King' } },
  { days: 365, badge: '🔮', label: { tr: 'Efsane', en: 'Legend' } },
] as const

export interface StreakData {
  count: number
  lastDate: string
  currentMilestone: typeof STREAK_MILESTONES[number] | null
  nextMilestone: typeof STREAK_MILESTONES[number] | null
  daysToNext: number
}

// ============================================================
// MOON PHASE SYSTEM
// ============================================================
export const MOON_PHASES = [
  { id: 0, name: 'Yeni Ay', nameEn: 'New Moon', emoji: '🌑', energy: 'başlangıç', energyEn: 'beginning' },
  { id: 1, name: 'Hilal', nameEn: 'Waxing Crescent', emoji: '🌒', energy: 'büyüme', energyEn: 'growth' },
  { id: 2, name: 'İlk Dördün', nameEn: 'First Quarter', emoji: '🌓', energy: 'aksiyon', energyEn: 'action' },
  { id: 3, name: 'Şişkin Ay', nameEn: 'Waxing Gibbous', emoji: '🌔', energy: 'gelişim', energyEn: 'development' },
  { id: 4, name: 'Dolunay', nameEn: 'Full Moon', emoji: '🌕', energy: 'doruk', energyEn: 'peak' },
  { id: 5, name: 'Azalan Şişkin', nameEn: 'Waning Gibbous', emoji: '🌖', energy: 'yansıma', energyEn: 'reflection' },
  { id: 6, name: 'Son Dördün', nameEn: 'Last Quarter', emoji: '🌗', energy: 'bırakma', energyEn: 'release' },
  { id: 7, name: 'Azalan Hilal', nameEn: 'Waning Crescent', emoji: '🌘', energy: 'dinlenme', energyEn: 'rest' },
] as const

export type MoonPhase = typeof MOON_PHASES[number]

// ============================================================
// LUCKY ELEMENTS SYSTEM
// ============================================================
export const LUCKY_COLORS = [
  { name: 'Altın', nameEn: 'Gold', hex: '#FFD700' },
  { name: 'Mor', nameEn: 'Purple', hex: '#9b59b6' },
  { name: 'Zümrüt', nameEn: 'Emerald', hex: '#27ae60' },
  { name: 'Safir', nameEn: 'Sapphire', hex: '#3498db' },
  { name: 'Yakut', nameEn: 'Ruby', hex: '#e74c3c' },
  { name: 'Gümüş', nameEn: 'Silver', hex: '#bdc3c7' },
  { name: 'Kehribar', nameEn: 'Amber', hex: '#f39c12' },
  { name: 'Gül', nameEn: 'Rose', hex: '#e91e63' },
] as const

export const DIRECTIONS = [
  { name: 'Kuzey', nameEn: 'North', symbol: '↑' },
  { name: 'Güney', nameEn: 'South', symbol: '↓' },
  { name: 'Doğu', nameEn: 'East', symbol: '→' },
  { name: 'Batı', nameEn: 'West', symbol: '←' },
] as const

export interface LuckyElements {
  numbers: number[]
  color: typeof LUCKY_COLORS[number]
  direction: typeof DIRECTIONS[number]
}

// ============================================================
// CARD COLLECTION SYSTEM
// ============================================================
export interface CardCollection {
  seenCardIds: number[]
  firstSeenDates: Record<number, string>
  totalCards: 22
  collectionProgress: number
}

// ============================================================
// MOTIVATION QUOTES (22 kartın her biri için)
// ============================================================
export const MOTIVATION_QUOTES: Record<number, { tr: string; en: string; author: string }[]> = {
  0: [ // The Wanderer (Gezgin)
    { tr: 'Her yolculuk tek bir adımla başlar.', en: 'Every journey begins with a single step.', author: 'Lao Tzu' },
    { tr: 'Kaybolmak, kendini bulmanın ilk adımıdır.', en: 'Getting lost is the first step to finding yourself.', author: 'Anonim' },
    { tr: 'Macera, konfor alanının dışında başlar.', en: 'Adventure begins where comfort ends.', author: 'Neale Donald Walsch' },
  ],
  1: [ // The Creator (Yaratıcı)
    { tr: 'Hayal gücü bilgiden daha önemlidir.', en: 'Imagination is more important than knowledge.', author: 'Einstein' },
    { tr: 'Yaratıcılık, hata yapmaya cesaret etmektir.', en: 'Creativity is allowing yourself to make mistakes.', author: 'Scott Adams' },
    { tr: 'Her usta bir zamanlar öğrenciydi.', en: 'Every master was once a beginner.', author: 'Anonim' },
  ],
  2: [ // The Oracle (Kahin)
    { tr: 'Bilgelik, bilmediğini bilmektir.', en: 'Wisdom is knowing what you do not know.', author: 'Sokrates' },
    { tr: 'Sezgilerine güven, onlar gizli bilgiyi taşır.', en: 'Trust your intuition, it carries hidden wisdom.', author: 'Anonim' },
    { tr: 'Gerçek bilgi içsel sessizlikte bulunur.', en: 'True knowledge is found in inner silence.', author: 'Rumi' },
  ],
  3: [ // The Mother (Ana)
    { tr: 'Sevgi, en güçlü iyileştiricidir.', en: 'Love is the most powerful healer.', author: 'Anonim' },
    { tr: 'Şefkat göstermek, cesaret ister.', en: 'It takes courage to show compassion.', author: 'Buddha' },
    { tr: 'Veren el, alan elden üstündür.', en: 'The giving hand is above the receiving hand.', author: 'Türk Atasözü' },
  ],
  4: [ // The Father (Baba)
    { tr: 'Liderlik, örnek olmaktır.', en: 'Leadership is leading by example.', author: 'Albert Schweitzer' },
    { tr: 'Güç, kontrol etmek değil, yönlendirmektir.', en: 'Power is not control, but guidance.', author: 'Anonim' },
    { tr: 'Disiplin, özgürlüğün köprüsüdür.', en: 'Discipline is the bridge to freedom.', author: 'Jim Rohn' },
  ],
  5: [ // The Guide (Rehber)
    { tr: 'Öğretmen kapıyı açar, içeri girmek sana kalmış.', en: 'The teacher opens the door, but you must enter.', author: 'Çin Atasözü' },
    { tr: 'Her karşılaşma bir derstir.', en: 'Every encounter is a lesson.', author: 'Anonim' },
    { tr: 'Bilgi paylaşıldıkça çoğalır.', en: 'Knowledge grows when shared.', author: 'Türk Atasözü' },
  ],
  6: [ // The Lovers (Aşıklar)
    { tr: 'Gerçek aşk, birbirine tutunmak değil, birlikte büyümektir.', en: 'True love is not holding on, but growing together.', author: 'Anonim' },
    { tr: 'Kalbinle seç, aklınla yürü.', en: 'Choose with your heart, walk with your mind.', author: 'Anonim' },
    { tr: 'Sevgi, iki ruhun tek bir bedende buluşmasıdır.', en: 'Love is two souls meeting in one body.', author: 'Aristoteles' },
  ],
  7: [ // The Chariot (Savaş Arabası)
    { tr: 'Zafer, yoldan çıkmamaktır.', en: 'Victory is staying on the path.', author: 'Anonim' },
    { tr: 'İrade, kaderi değiştirir.', en: 'Willpower changes destiny.', author: 'Anonim' },
    { tr: 'Başarı, hazırlık ve fırsatın buluşmasıdır.', en: 'Success is where preparation meets opportunity.', author: 'Seneca' },
  ],
  8: [ // Strength (Güç)
    { tr: 'Gerçek güç, öfkeyi kontrol etmektir.', en: 'True strength is controlling anger.', author: 'Buddha' },
    { tr: 'Cesaret, korkunun yokluğu değil, korkuya rağmen ilerlemektir.', en: 'Courage is not the absence of fear, but moving forward despite it.', author: 'Nelson Mandela' },
    { tr: 'İç güç, dış engelleri aşar.', en: 'Inner strength overcomes outer obstacles.', author: 'Anonim' },
  ],
  9: [ // The Hermit (Münzevi)
    { tr: 'Yalnızlık, kendinle tanışma fırsatıdır.', en: 'Solitude is an opportunity to meet yourself.', author: 'Osho' },
    { tr: 'Sessizlikte en yüksek sesler duyulur.', en: 'In silence, the loudest voices are heard.', author: 'Anonim' },
    { tr: 'İçe dönüş, dışarıya açılmanın anahtarıdır.', en: 'Going inward is the key to opening outward.', author: 'Rumi' },
  ],
  10: [ // Wheel of Fortune (Kader Çarkı)
    { tr: 'Değişim, hayatın tek sabiti.', en: 'Change is the only constant in life.', author: 'Heraklitos' },
    { tr: 'Her düşüş, yeni bir yükselişin başlangıcıdır.', en: 'Every fall is the beginning of a new rise.', author: 'Anonim' },
    { tr: 'Bugün zor, yarın daha güzel.', en: 'Today is hard, tomorrow is beautiful.', author: 'Türk Atasözü' },
  ],
  11: [ // Justice (Adalet)
    { tr: 'Ne ekersen onu biçersin.', en: 'You reap what you sow.', author: 'Türk Atasözü' },
    { tr: 'Adalet, herkese hak ettiğini vermektir.', en: 'Justice is giving everyone what they deserve.', author: 'Platon' },
    { tr: 'Denge, iç huzurun temelidir.', en: 'Balance is the foundation of inner peace.', author: 'Anonim' },
  ],
  12: [ // The Hanged (Asılı Adam)
    { tr: 'Bazen bırakmak, kazanmaktır.', en: 'Sometimes letting go is winning.', author: 'Anonim' },
    { tr: 'Farklı bir bakış açısı, her şeyi değiştirir.', en: 'A different perspective changes everything.', author: 'Anonim' },
    { tr: 'Sabır, acı bir tohum ama meyvesi tatlıdır.', en: 'Patience is bitter, but its fruit is sweet.', author: 'Aristoteles' },
  ],
  13: [ // Death (Ölüm - Dönüşüm)
    { tr: 'Her son, yeni bir başlangıçtır.', en: 'Every ending is a new beginning.', author: 'Anonim' },
    { tr: 'Dönüşüm, acı verebilir ama kaçınılmazdır.', en: 'Transformation may hurt, but it is inevitable.', author: 'Anonim' },
    { tr: 'Eski yapraklar dökülmeden yenileri gelmez.', en: 'New leaves cannot come until the old ones fall.', author: 'Anonim' },
  ],
  14: [ // Temperance (Denge)
    { tr: 'Aşırılık, her şeyin düşmanıdır.', en: 'Excess is the enemy of everything.', author: 'Anonim' },
    { tr: 'Orta yol, en güvenli yoldur.', en: 'The middle path is the safest.', author: 'Buddha' },
    { tr: 'Uyum, zıtların birleşmesidir.', en: 'Harmony is the union of opposites.', author: 'Anonim' },
  ],
  15: [ // The Shadow (Gölge)
    { tr: 'Karanlığı kabul etmeden ışığı bulamazsın.', en: 'You cannot find light without accepting darkness.', author: 'Carl Jung' },
    { tr: 'Korkularınla yüzleşmek, onları yenmektir.', en: 'Facing your fears is defeating them.', author: 'Anonim' },
    { tr: 'Zincirler zihinsel, anahtar irade.', en: 'Chains are mental, the key is willpower.', author: 'Anonim' },
  ],
  16: [ // The Tower (Kule)
    { tr: 'Yıkım, yeniden inşanın habercisidir.', en: 'Destruction heralds reconstruction.', author: 'Anonim' },
    { tr: 'Şimşek çakınca, karanlık aydınlanır.', en: 'When lightning strikes, darkness is illuminated.', author: 'Anonim' },
    { tr: 'Kriz, fırsatın başka adıdır.', en: 'Crisis is another name for opportunity.', author: 'Çin Atasözü' },
  ],
  17: [ // The Star (Yıldız)
    { tr: 'Umut, en karanlık gecede bile parlar.', en: 'Hope shines even in the darkest night.', author: 'Anonim' },
    { tr: 'Yıldızlara ulaşmak için ayaklarını yerden kesme.', en: 'To reach the stars, keep your feet on the ground.', author: 'Theodore Roosevelt' },
    { tr: 'Her gece bir güne, her kış bir bahara gebedir.', en: 'Every night is pregnant with a day, every winter with spring.', author: 'Rumi' },
  ],
  18: [ // The Moon (Ay)
    { tr: 'Gece en karanlık olduğunda, şafak en yakındır.', en: 'When the night is darkest, dawn is nearest.', author: 'Anonim' },
    { tr: 'Sezgiler, aklın göremediğini görür.', en: 'Intuition sees what reason cannot.', author: 'Anonim' },
    { tr: 'Gölgelerden korkmak yerine, ışığı ara.', en: 'Instead of fearing shadows, seek the light.', author: 'Anonim' },
  ],
  19: [ // The Sun (Güneş)
    { tr: 'Güneş herkese eşit ışır.', en: 'The sun shines equally on everyone.', author: 'Anonim' },
    { tr: 'Mutluluk, dışarıda değil içeride bulunur.', en: 'Happiness is found within, not without.', author: 'Buddha' },
    { tr: 'Gülümsemek, güneşi çağırmaktır.', en: 'To smile is to summon the sun.', author: 'Türk Atasözü' },
  ],
  20: [ // Judgement (Yargı)
    { tr: 'Kendini affetmeden başkalarını affedemezsin.', en: 'You cannot forgive others without forgiving yourself.', author: 'Anonim' },
    { tr: 'Her gün yeniden doğmak için bir fırsattır.', en: 'Every day is an opportunity to be reborn.', author: 'Anonim' },
    { tr: 'Geçmiş, gelecek için ders olmalı, hapishane değil.', en: 'The past should be a lesson, not a prison.', author: 'Anonim' },
  ],
  21: [ // The Crown (Taç)
    { tr: 'Yolculuğun sonu, yeni bir başlangıçtır.', en: 'The end of the journey is a new beginning.', author: 'T.S. Eliot' },
    { tr: 'Bütünlük, parçaların toplamından fazlasıdır.', en: 'The whole is greater than the sum of its parts.', author: 'Aristoteles' },
    { tr: 'Taç giyen baş, sorumluluk taşır.', en: 'The crowned head carries responsibility.', author: 'Türk Atasözü' },
  ],
}

export interface MotivationQuote {
  tr: string
  en: string
  author: string
}

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

// Mesaj havuzu - kategori ve ton bazlı (TR + EN)
export const FORTUNE_MESSAGES: Record<FortuneCategory, FortuneMessage[]> = {
  love: [
    // Pozitif - Genel
    { text: 'Bugün kalbin açık, sevgi alacak ve vereceksin.', textEn: 'Your heart is open today, ready to give and receive love.', tone: 'positive', type: 'general' },
    { text: 'Aşk enerjin yükselişte, çevrendekiler bunu hissedecek.', textEn: 'Your love energy is rising, those around you will feel it.', tone: 'positive', type: 'general' },
    { text: 'Romantik bir sürpriz kapıda olabilir.', textEn: 'A romantic surprise may be on the way.', tone: 'positive', type: 'general' },
    { text: 'Duygusal bağların güçleniyor.', textEn: 'Your emotional bonds are strengthening.', tone: 'positive', type: 'general' },
    { text: 'Sevgi dolu anlar seni bekliyor.', textEn: 'Moments full of love await you.', tone: 'positive', type: 'general' },

    // Pozitif - Özel
    { text: 'Uzun süredir beklediğin haber bugün gelebilir.', textEn: 'The news you\'ve been waiting for may come today.', tone: 'positive', type: 'specific' },
    { text: 'Birileri seni düşünüyor, belki de sana ulaşacak.', textEn: 'Someone is thinking of you, they might reach out.', tone: 'positive', type: 'specific' },
    { text: 'Eski bir tanıdıkla karşılaşma ihtimali yüksek.', textEn: 'There\'s a high chance of meeting an old acquaintance.', tone: 'positive', type: 'specific' },
    { text: 'Bir bakış, bir gülümseme... Dikkatli ol, anlam yüklü.', textEn: 'A glance, a smile... Pay attention, it carries meaning.', tone: 'positive', type: 'specific' },

    // Pozitif - Tavsiye
    { text: 'Duygularını ifade etmekten çekinme, karşılık bulacaksın.', textEn: 'Don\'t hesitate to express your feelings, you\'ll be reciprocated.', tone: 'positive', type: 'advice' },
    { text: 'Kalbini dinle, akıl bugün ikinci planda kalmalı.', textEn: 'Listen to your heart, let logic take a back seat today.', tone: 'positive', type: 'advice' },
    { text: 'Affetmek güçtür, bugün bu gücü kullanabilirsin.', textEn: 'Forgiveness is strength, you can use this power today.', tone: 'positive', type: 'advice' },

    // Negatif - Genel
    { text: 'Bugün duygusal iniş çıkışlar yaşayabilirsin.', textEn: 'You may experience emotional ups and downs today.', tone: 'negative', type: 'general' },
    { text: 'Beklentilerini biraz düşür, hayal kırıklığından kaçın.', textEn: 'Lower your expectations a bit to avoid disappointment.', tone: 'negative', type: 'general' },
    { text: 'Yanlış anlaşılmalara açık bir gün, dikkatli ol.', textEn: 'A day prone to misunderstandings, be careful.', tone: 'negative', type: 'general' },

    // Negatif - Uyarı
    { text: 'Aceleye gerek yok, bazı duygular zaman ister.', textEn: 'No need to rush, some feelings need time.', tone: 'negative', type: 'warning' },
    { text: 'Her söylenen samimi olmayabilir, sezgilerini kullan.', textEn: 'Not everything said may be sincere, trust your intuition.', tone: 'negative', type: 'warning' },
    { text: 'Geçmişe takılma, bugünü kaçırırsın.', textEn: 'Don\'t dwell on the past, you\'ll miss the present.', tone: 'negative', type: 'warning' },

    // Nötr - Genel
    { text: 'Duygusal denge günü, ne çok yükseliş ne düşüş.', textEn: 'A day of emotional balance, neither highs nor lows.', tone: 'neutral', type: 'general' },
    { text: 'Aşk hayatında durağan bir dönem, bu da geçici.', textEn: 'A quiet period in love life, this too shall pass.', tone: 'neutral', type: 'general' },
    { text: 'Kendinle vakit geçirmek için ideal bir gün.', textEn: 'An ideal day to spend time with yourself.', tone: 'neutral', type: 'general' },
    { text: 'İlişkilerde sabır anahtarın bugün.', textEn: 'Patience is your key in relationships today.', tone: 'neutral', type: 'advice' },

    // === YENİ MESAJLAR - ÖZEL VE DETAYLI ===
    // Zaman Bazlı
    { text: 'Akşam saatlerinde gelen mesaj hayatını değiştirebilir.', textEn: 'A message arriving in the evening could change your life.', tone: 'positive', type: 'specific' },
    { text: 'Öğleden sonra beklenmedik bir davet alabilirsin.', textEn: 'You may receive an unexpected invitation this afternoon.', tone: 'positive', type: 'specific' },
    { text: 'Sabah saatlerinde içine doğan his doğru, ona güven.', textEn: 'The feeling you have in the morning is right, trust it.', tone: 'positive', type: 'advice' },
    { text: 'Bu hafta sonu romantik bir karşılaşma mümkün.', textEn: 'A romantic encounter is possible this weekend.', tone: 'positive', type: 'specific' },

    // Şans Elementleri
    { text: 'Kırmızı renk bugün aşk enerjini artırıyor, giy veya taşı.', textEn: 'Red enhances your love energy today, wear or carry it.', tone: 'positive', type: 'advice' },
    { text: 'Pembe tonları bugün şansını artırıyor.', textEn: 'Pink shades increase your luck today.', tone: 'positive', type: 'advice' },
    { text: 'Çift sayılar bugün şanslı - saat 22:22\'yi dikkatle izle.', textEn: 'Even numbers are lucky today - watch for 22:22.', tone: 'positive', type: 'specific' },
    { text: '7 sayısı bugün aşk hayatında uğurlu.', textEn: 'Number 7 is lucky in love today.', tone: 'positive', type: 'specific' },

    // Senaryo Bazlı
    { text: 'Kahve molasında tanışacağın biri önemli olabilir.', textEn: 'Someone you meet during a coffee break could be important.', tone: 'positive', type: 'specific' },
    { text: 'Bir arkadaşının arkadaşı dikkatini çekecek.', textEn: 'A friend of a friend will catch your attention.', tone: 'positive', type: 'specific' },
    { text: 'Tesadüf dediğin şey aslında kader - bu karşılaşma öyle.', textEn: 'What you call coincidence is actually fate - this meeting is one.', tone: 'positive', type: 'specific' },
    { text: 'Telefona bakma cesaretini göster, mesaj gönder.', textEn: 'Have the courage to not just look at your phone - send a message.', tone: 'positive', type: 'advice' },
    { text: 'Kalabalık bir ortamda gözler buluşacak.', textEn: 'Eyes will meet in a crowded place.', tone: 'positive', type: 'specific' },

    // Gizemli/İlgi Çekici
    { text: 'Rüyanda gördüğün yüz gerçek olabilir.', textEn: 'The face you saw in your dream might be real.', tone: 'positive', type: 'specific' },
    { text: 'Evren sana işaretler gönderiyor, dikkatli bak.', textEn: 'The universe is sending you signs, look carefully.', tone: 'neutral', type: 'advice' },
    { text: 'Bir şarkı çalarken aklına gelen kişi... onu düşün.', textEn: 'The person who comes to mind when a song plays... think of them.', tone: 'neutral', type: 'specific' },

    // Daha Fazla Negatif/Uyarı
    { text: 'Mesajlaşırken yanlış anlama riski var, yüz yüze konuş.', textEn: 'Risk of misunderstanding while texting, talk face to face.', tone: 'negative', type: 'warning' },
    { text: 'Kıskançlık bugün düşmanın, kontrol et.', textEn: 'Jealousy is your enemy today, keep it in check.', tone: 'negative', type: 'warning' },
    { text: 'Geçmişten biri dönebilir ama niyeti sorgulanmalı.', textEn: 'Someone from your past may return but question their intentions.', tone: 'negative', type: 'warning' },
    { text: 'Hemen karar verme, bir gece düşün.', textEn: 'Don\'t decide immediately, sleep on it.', tone: 'neutral', type: 'advice' },
  ],

  career: [
    // Pozitif - Genel
    { text: 'İş hayatında parlak bir gün! Fırsatlar kapıda.', textEn: 'A bright day in your career! Opportunities are knocking.', tone: 'positive', type: 'general' },
    { text: 'Yeteneklerin bugün fark edilecek.', textEn: 'Your talents will be noticed today.', tone: 'positive', type: 'general' },
    { text: 'Kariyer hedeflerine bir adım daha yaklaştın.', textEn: 'You\'re one step closer to your career goals.', tone: 'positive', type: 'general' },
    { text: 'Takım çalışması bugün harikalar yaratacak.', textEn: 'Teamwork will create wonders today.', tone: 'positive', type: 'general' },
    { text: 'Yaratıcı fikirler akacak, not almayı unutma.', textEn: 'Creative ideas will flow, don\'t forget to take notes.', tone: 'positive', type: 'general' },

    // Pozitif - Özel
    { text: 'Beklediğin onay veya terfi haberi yakın.', textEn: 'The approval or promotion news you\'ve been waiting for is near.', tone: 'positive', type: 'specific' },
    { text: 'Bir toplantı veya görüşme çok olumlu geçecek.', textEn: 'A meeting or interview will go very positively.', tone: 'positive', type: 'specific' },
    { text: 'Yeni bir proje teklifi alabilirsin.', textEn: 'You may receive a new project offer.', tone: 'positive', type: 'specific' },
    { text: 'Bir iş bağlantısı kapıları açacak.', textEn: 'A business connection will open doors.', tone: 'positive', type: 'specific' },

    // Pozitif - Tavsiye
    { text: 'Kendine güven, başarı seni bekliyor.', textEn: 'Trust yourself, success awaits you.', tone: 'positive', type: 'advice' },
    { text: 'Risk almaktan korkma, kazanacaksın.', textEn: 'Don\'t be afraid to take risks, you\'ll win.', tone: 'positive', type: 'advice' },
    { text: 'Fikirlerini paylaş, değer görecekler.', textEn: 'Share your ideas, they\'ll be appreciated.', tone: 'positive', type: 'advice' },

    // Negatif - Genel
    { text: 'İş yerinde gerilim olabilir, sakin kal.', textEn: 'There may be tension at work, stay calm.', tone: 'negative', type: 'general' },
    { text: 'Beklenmedik engeller çıkabilir ama geçici.', textEn: 'Unexpected obstacles may arise, but they\'re temporary.', tone: 'negative', type: 'general' },
    { text: 'Bugün büyük kararlar alma, bekle.', textEn: 'Don\'t make big decisions today, wait.', tone: 'negative', type: 'general' },

    // Negatif - Uyarı
    { text: 'Dedikodulara kulak asma, işine odaklan.', textEn: 'Don\'t pay attention to gossip, focus on your work.', tone: 'negative', type: 'warning' },
    { text: 'Acele işe şeytan karışır, detaylara dikkat.', textEn: 'Haste makes waste, pay attention to details.', tone: 'negative', type: 'warning' },
    { text: 'Herkese güvenme, önce kanıtlasınlar.', textEn: 'Don\'t trust everyone, let them prove themselves first.', tone: 'negative', type: 'warning' },

    // Nötr - Genel
    { text: 'Rutin bir iş günü, fırtına öncesi sessizlik.', textEn: 'A routine work day, calm before the storm.', tone: 'neutral', type: 'general' },
    { text: 'Planlama ve organizasyon için ideal gün.', textEn: 'An ideal day for planning and organization.', tone: 'neutral', type: 'general' },
    { text: 'Bugün tohumları ek, yarın hasat zamanı.', textEn: 'Plant the seeds today, harvest time is tomorrow.', tone: 'neutral', type: 'general' },
    { text: 'Öğrenmeye açık ol, yeni bilgiler geliyor.', textEn: 'Be open to learning, new knowledge is coming.', tone: 'neutral', type: 'advice' },

    // === YENİ MESAJLAR - ÖZEL VE DETAYLI ===
    // Zaman Bazlı
    { text: 'Sabahki toplantı kritik, erken hazırlan.', textEn: 'Morning meeting is critical, prepare early.', tone: 'positive', type: 'specific' },
    { text: 'Öğleden sonra 3-5 arası verimlilik pik yapacak.', textEn: 'Productivity will peak between 3-5 PM.', tone: 'positive', type: 'specific' },
    { text: 'Bu hafta içinde önemli bir gelişme bekleniyor.', textEn: 'An important development is expected this week.', tone: 'positive', type: 'specific' },
    { text: 'Cuma günü iyi haberler gelebilir.', textEn: 'Good news may come on Friday.', tone: 'positive', type: 'specific' },

    // Şans Elementleri
    { text: 'Mavi renk bugün başarı getiriyor, kravat veya aksesuar olabilir.', textEn: 'Blue brings success today, could be a tie or accessory.', tone: 'positive', type: 'advice' },
    { text: 'Güneydoğu yönü bugün şanslı, masanı öyle konumlandır.', textEn: 'Southeast direction is lucky today, position your desk accordingly.', tone: 'positive', type: 'advice' },
    { text: '3 ve 8 sayıları bugün kariyer için uğurlu.', textEn: 'Numbers 3 and 8 are lucky for career today.', tone: 'positive', type: 'specific' },
    { text: 'Kalem veya defter hediye almak şans getirecek.', textEn: 'Receiving a pen or notebook as a gift will bring luck.', tone: 'positive', type: 'specific' },

    // Senaryo Bazlı
    { text: 'Asansörde karşılaşacağın biri kariyerinde önemli rol oynayabilir.', textEn: 'Someone you meet in the elevator could play an important role in your career.', tone: 'positive', type: 'specific' },
    { text: 'E-posta kutunu kontrol et, kaçırdığın bir fırsat olabilir.', textEn: 'Check your email inbox, you might have missed an opportunity.', tone: 'positive', type: 'advice' },
    { text: 'Bir meslektaşın tavsiyesi altın değerinde olacak.', textEn: 'A colleague\'s advice will be worth its weight in gold.', tone: 'positive', type: 'specific' },
    { text: 'LinkedIn\'de beklenmedik bir bağlantı kapıları açacak.', textEn: 'An unexpected LinkedIn connection will open doors.', tone: 'positive', type: 'specific' },

    // Gizemli/İlgi Çekici
    { text: 'Rüyanda gördüğün iş fikri gerçekleştirilebilir.', textEn: 'The business idea you saw in your dream can be realized.', tone: 'positive', type: 'specific' },
    { text: 'İstemeden duyacağın bir konuşma ipucu verecek.', textEn: 'A conversation you overhear will give you a clue.', tone: 'neutral', type: 'specific' },

    // Daha Fazla Negatif/Uyarı
    { text: 'Bugün imzalayacağın belgeleri iki kez kontrol et.', textEn: 'Double-check any documents you sign today.', tone: 'negative', type: 'warning' },
    { text: 'Ofis politikalarına karışma, uzak dur.', textEn: 'Don\'t get involved in office politics, stay away.', tone: 'negative', type: 'warning' },
    { text: 'Bir rakip gizlice senin fikirlerini takip ediyor olabilir.', textEn: 'A rival might be secretly following your ideas.', tone: 'negative', type: 'warning' },
    { text: 'Hızlı kararlar bugün riskli, bekle.', textEn: 'Quick decisions are risky today, wait.', tone: 'negative', type: 'warning' },
  ],

  money: [
    // Pozitif - Genel
    { text: 'Bolluk enerjisi etrafında, paranı çekiyorsun.', textEn: 'Abundance energy surrounds you, you\'re attracting wealth.', tone: 'positive', type: 'general' },
    { text: 'Finansal şansın yükselişte!', textEn: 'Your financial luck is on the rise!', tone: 'positive', type: 'general' },
    { text: 'Beklenmedik bir gelir kapıda olabilir.', textEn: 'Unexpected income may be on the way.', tone: 'positive', type: 'general' },
    { text: 'Yatırımların meyvesini vermeye başlıyor.', textEn: 'Your investments are starting to bear fruit.', tone: 'positive', type: 'general' },
    { text: 'Maddi konularda olumlu gelişmeler var.', textEn: 'Positive developments in financial matters.', tone: 'positive', type: 'general' },

    // Pozitif - Özel
    { text: 'Uzun süredir beklediğin ödeme gelebilir.', textEn: 'The payment you\'ve been waiting for may arrive.', tone: 'positive', type: 'specific' },
    { text: 'Bir alışverişte beklenmedik indirim bulacaksın.', textEn: 'You\'ll find an unexpected discount while shopping.', tone: 'positive', type: 'specific' },
    { text: 'Yan gelir fırsatı kendini gösterebilir.', textEn: 'A side income opportunity may present itself.', tone: 'positive', type: 'specific' },
    { text: 'Finansal bir teklif dikkatini çekecek.', textEn: 'A financial offer will catch your attention.', tone: 'positive', type: 'specific' },

    // Pozitif - Tavsiye
    { text: 'Birikime başlamak için ideal gün.', textEn: 'An ideal day to start saving.', tone: 'positive', type: 'advice' },
    { text: 'Değerini bil, pazarlık yap.', textEn: 'Know your worth, negotiate.', tone: 'positive', type: 'advice' },
    { text: 'Cömertlik sana katlanarak dönecek.', textEn: 'Generosity will return to you multiplied.', tone: 'positive', type: 'advice' },

    // Negatif - Genel
    { text: 'Beklenmedik harcamalar çıkabilir, hazırlıklı ol.', textEn: 'Unexpected expenses may arise, be prepared.', tone: 'negative', type: 'general' },
    { text: 'Bugün büyük alımlar için uygun değil.', textEn: 'Today is not suitable for big purchases.', tone: 'negative', type: 'general' },
    { text: 'Finansal kararları ertele, netlik yok.', textEn: 'Postpone financial decisions, there\'s no clarity.', tone: 'negative', type: 'general' },

    // Negatif - Uyarı
    { text: 'Çok iyi görünen teklifler aldatıcı olabilir.', textEn: 'Offers that look too good may be deceptive.', tone: 'negative', type: 'warning' },
    { text: 'Borç verme veya alma konusunda dikkatli ol.', textEn: 'Be careful about lending or borrowing money.', tone: 'negative', type: 'warning' },
    { text: 'İmpulsif harcamalardan kaçın, pişman olursun.', textEn: 'Avoid impulsive spending, you\'ll regret it.', tone: 'negative', type: 'warning' },

    // Nötr - Genel
    { text: 'Finansal denge günü, ne kazanç ne kayıp.', textEn: 'A day of financial balance, neither gain nor loss.', tone: 'neutral', type: 'general' },
    { text: 'Bütçeni gözden geçirmek için iyi zaman.', textEn: 'A good time to review your budget.', tone: 'neutral', type: 'general' },
    { text: 'Para konusunda sabırlı ol, zaman senin yanında.', textEn: 'Be patient with money, time is on your side.', tone: 'neutral', type: 'general' },
    { text: 'Küçük adımlar büyük servetler yaratır.', textEn: 'Small steps create great fortunes.', tone: 'neutral', type: 'advice' },

    // === YENİ MESAJLAR - ÖZEL VE DETAYLI ===
    // Zaman Bazlı
    { text: 'Ayın ilk haftası finansal kararlar için ideal.', textEn: 'The first week of the month is ideal for financial decisions.', tone: 'positive', type: 'specific' },
    { text: 'Akşam saatlerinde beklenmedik bir kazanç haberi gelebilir.', textEn: 'News of unexpected gain may come in the evening.', tone: 'positive', type: 'specific' },
    { text: 'Bu ay tasarruf odaklı ol, gelecek ay meyvesini verecek.', textEn: 'Focus on saving this month, next month will bear fruit.', tone: 'positive', type: 'advice' },
    { text: 'Pazartesi günleri yatırım için şanslı.', textEn: 'Mondays are lucky for investments.', tone: 'positive', type: 'specific' },

    // Şans Elementleri
    { text: 'Yeşil cüzdan veya aksesuar bolluk çekiyor.', textEn: 'A green wallet or accessory attracts abundance.', tone: 'positive', type: 'advice' },
    { text: 'Altın rengi bugün para enerjini güçlendiriyor.', textEn: 'Gold color strengthens your money energy today.', tone: 'positive', type: 'advice' },
    { text: '8 ve 9 sayıları bugün finansal şans getiriyor.', textEn: 'Numbers 8 and 9 bring financial luck today.', tone: 'positive', type: 'specific' },
    { text: 'Kuzey yönünde yapılan işler bugün karlı.', textEn: 'Business done in the north direction is profitable today.', tone: 'positive', type: 'specific' },

    // Senaryo Bazlı
    { text: 'Bir tanıdık sana iş fırsatı sunabilir, kulaklarını aç.', textEn: 'An acquaintance may offer you a business opportunity, keep your ears open.', tone: 'positive', type: 'specific' },
    { text: 'İkinci el eşya satışı beklenenden fazla getirebilir.', textEn: 'Selling second-hand items may bring more than expected.', tone: 'positive', type: 'specific' },
    { text: 'Banka hesabını kontrol et, unuttuğun bir para olabilir.', textEn: 'Check your bank account, there might be money you forgot.', tone: 'positive', type: 'advice' },
    { text: 'Alışverişte pazarlık yap, başarılı olacaksın.', textEn: 'Negotiate while shopping, you\'ll be successful.', tone: 'positive', type: 'advice' },

    // Gizemli/İlgi Çekici
    { text: 'Yolda bulduğun bozuk para şans habercisi.', textEn: 'A coin you find on the street is a sign of luck.', tone: 'positive', type: 'specific' },
    { text: 'Rüyanda gördüğün rakamları not et, şans getirebilir.', textEn: 'Note the numbers you see in your dreams, they may bring luck.', tone: 'neutral', type: 'advice' },

    // Daha Fazla Negatif/Uyarı
    { text: 'Bugün kredi kartını cebinde tut, gereksiz harcama yapma.', textEn: 'Keep your credit card in your pocket today, avoid unnecessary spending.', tone: 'negative', type: 'warning' },
    { text: 'Arkadaşlara borç verme, geri almakta zorlanırsın.', textEn: 'Don\'t lend money to friends, you\'ll have trouble getting it back.', tone: 'negative', type: 'warning' },
    { text: 'Çok cazip görünen teklif aslında tuzak olabilir.', textEn: 'An offer that looks too tempting might actually be a trap.', tone: 'negative', type: 'warning' },
    { text: 'Online alışverişte dikkatli ol, dolandırıcılık riski var.', textEn: 'Be careful with online shopping, there\'s a risk of fraud.', tone: 'negative', type: 'warning' },
  ],

  health: [
    // Pozitif - Genel
    { text: 'Enerji seviyeni yüksek, tadını çıkar!', textEn: 'Your energy level is high, enjoy it!', tone: 'positive', type: 'general' },
    { text: 'Bedenin güçlü, bugün her şeyi başarabilirsin.', textEn: 'Your body is strong, you can achieve anything today.', tone: 'positive', type: 'general' },
    { text: 'Sağlık için olumlu enerji akışı var.', textEn: 'There\'s a positive energy flow for your health.', tone: 'positive', type: 'general' },
    { text: 'Zihin ve beden uyum içinde.', textEn: 'Mind and body are in harmony.', tone: 'positive', type: 'general' },
    { text: 'Şifa enerjisi seni sarıyor.', textEn: 'Healing energy surrounds you.', tone: 'positive', type: 'general' },

    // Pozitif - Özel
    { text: 'Yeni bir spor veya aktivite denersen çok keyif alırsın.', textEn: 'You\'ll enjoy trying a new sport or activity.', tone: 'positive', type: 'specific' },
    { text: 'Bugün aldığın besinler seni besleyecek.', textEn: 'The food you eat today will nourish you well.', tone: 'positive', type: 'specific' },
    { text: 'Uzun süredir yapmak istediğin sağlıklı değişiklik için tam gün.', textEn: 'Perfect day for that healthy change you\'ve been wanting.', tone: 'positive', type: 'specific' },

    // Pozitif - Tavsiye
    { text: 'Doğada zaman geçir, ruhun ve bedenin şükredecek.', textEn: 'Spend time in nature, your soul and body will thank you.', tone: 'positive', type: 'advice' },
    { text: 'Bol su iç, bedenin sana teşekkür edecek.', textEn: 'Drink plenty of water, your body will thank you.', tone: 'positive', type: 'advice' },
    { text: 'Gülümse, mutluluk hormonların aktif.', textEn: 'Smile, your happiness hormones are active.', tone: 'positive', type: 'advice' },

    // Negatif - Genel
    { text: 'Enerji seviyeni düşük hissedebilirsin.', textEn: 'You may feel your energy level is low.', tone: 'negative', type: 'general' },
    { text: 'Stres belirtilerine dikkat, dinlenme şart.', textEn: 'Watch for signs of stress, rest is essential.', tone: 'negative', type: 'general' },
    { text: 'Bedenin sana mesaj veriyor, dinle.', textEn: 'Your body is sending you a message, listen.', tone: 'negative', type: 'general' },

    // Negatif - Uyarı
    { text: 'Aşırı yorgunluk sinyalleri, mola ver.', textEn: 'Signs of extreme fatigue, take a break.', tone: 'negative', type: 'warning' },
    { text: 'Sağlıksız alışkanlıklardan bugün uzak dur.', textEn: 'Stay away from unhealthy habits today.', tone: 'negative', type: 'warning' },
    { text: 'Uyku düzenine dikkat, ihmal etme.', textEn: 'Pay attention to your sleep schedule, don\'t neglect it.', tone: 'negative', type: 'warning' },

    // Nötr - Genel
    { text: 'Dengeli bir sağlık günü, rutin koru.', textEn: 'A balanced health day, maintain your routine.', tone: 'neutral', type: 'general' },
    { text: 'Bedenini dinle, o sana ne istediğini söylüyor.', textEn: 'Listen to your body, it\'s telling you what it needs.', tone: 'neutral', type: 'general' },
    { text: 'Küçük değişiklikler büyük sonuçlar yaratır.', textEn: 'Small changes create big results.', tone: 'neutral', type: 'general' },
    { text: 'Önleme tedaviden iyidir, bugün buna odaklan.', textEn: 'Prevention is better than cure, focus on that today.', tone: 'neutral', type: 'advice' },

    // === YENİ MESAJLAR - ÖZEL VE DETAYLI ===
    // Zaman Bazlı
    { text: 'Sabah 6-8 arası egzersiz yapmak bugün çok etkili.', textEn: 'Exercise between 6-8 AM will be very effective today.', tone: 'positive', type: 'specific' },
    { text: 'Öğlen saatlerinde 15 dakikalık yürüyüş mucize yaratır.', textEn: 'A 15-minute walk at noon will work wonders.', tone: 'positive', type: 'advice' },
    { text: 'Akşam 10\'dan önce yatmak vücudunu yenileyecek.', textEn: 'Going to bed before 10 PM will rejuvenate your body.', tone: 'positive', type: 'advice' },
    { text: 'Bu hafta bağışıklık sistemin güçlü, tadını çıkar.', textEn: 'Your immune system is strong this week, enjoy it.', tone: 'positive', type: 'general' },

    // Şans Elementleri
    { text: 'Yeşil renkli yiyecekler bugün sağlığını destekliyor.', textEn: 'Green colored foods support your health today.', tone: 'positive', type: 'advice' },
    { text: 'Doğu yönünde uyumak enerji akışını iyileştiriyor.', textEn: 'Sleeping facing east improves energy flow.', tone: 'positive', type: 'advice' },
    { text: '4 ve 6 sayıları bugün sağlık için uğurlu.', textEn: 'Numbers 4 and 6 are lucky for health today.', tone: 'positive', type: 'specific' },
    { text: 'Turkuaz renk bugün şifa enerjisi taşıyor.', textEn: 'Turquoise color carries healing energy today.', tone: 'positive', type: 'specific' },

    // Senaryo Bazlı
    { text: 'Bir arkadaşın önerdiği egzersiz programı sana çok uygun.', textEn: 'The exercise program a friend suggested suits you well.', tone: 'positive', type: 'specific' },
    { text: 'Bugün deneyeceğin yeni tarif vücuduna iyi gelecek.', textEn: 'A new recipe you try today will be good for your body.', tone: 'positive', type: 'specific' },
    { text: 'Tesadüfen karşılaştığın bilgi sağlığına faydalı olacak.', textEn: 'Information you stumble upon will benefit your health.', tone: 'positive', type: 'specific' },
    { text: 'Eski bir alışkanlığı bırakmak için bugün mükemmel.', textEn: 'Today is perfect for breaking an old habit.', tone: 'positive', type: 'advice' },

    // Gizemli/İlgi Çekici
    { text: 'Bedenin sana bir mesaj gönderiyor, o ağrıyı dinle.', textEn: 'Your body is sending you a message, listen to that ache.', tone: 'neutral', type: 'advice' },
    { text: 'Rüyanda suyun içinde yüzmek şifa işareti.', textEn: 'Swimming in water in your dream is a sign of healing.', tone: 'positive', type: 'specific' },

    // Daha Fazla Negatif/Uyarı
    { text: 'Bugün aşırı fiziksel aktiviteden kaçın.', textEn: 'Avoid excessive physical activity today.', tone: 'negative', type: 'warning' },
    { text: 'Soğuk içeceklerden uzak dur, mide hassas.', textEn: 'Stay away from cold drinks, your stomach is sensitive.', tone: 'negative', type: 'warning' },
    { text: 'Ertelediğin doktor randevusunu bugün al.', textEn: 'Make that doctor\'s appointment you\'ve been postponing.', tone: 'negative', type: 'warning' },
    { text: 'Gece geç saatlere kadar uyanık kalma, bedenin dinlenme istiyor.', textEn: 'Don\'t stay up late at night, your body wants to rest.', tone: 'negative', type: 'warning' },
  ],

  spirit: [
    // Pozitif - Genel
    { text: 'Ruhsal enerjin çok yüksek, içsel huzur var.', textEn: 'Your spiritual energy is very high, inner peace reigns.', tone: 'positive', type: 'general' },
    { text: 'Sezgilerin bugün çok güçlü, güven onlara.', textEn: 'Your intuition is very strong today, trust it.', tone: 'positive', type: 'general' },
    { text: 'Evrenle bağlantın açık, mesajları al.', textEn: 'Your connection to the universe is open, receive its messages.', tone: 'positive', type: 'general' },
    { text: 'İç huzur ve denge hakim.', textEn: 'Inner peace and balance prevail.', tone: 'positive', type: 'general' },
    { text: 'Spiritüel farkındalığın artıyor.', textEn: 'Your spiritual awareness is increasing.', tone: 'positive', type: 'general' },

    // Pozitif - Özel
    { text: 'Bir rüya veya işaret dikkatini çekecek, not al.', textEn: 'A dream or sign will catch your attention, take note.', tone: 'positive', type: 'specific' },
    { text: 'Beklenmedik bir içgörü anı yaşayabilirsin.', textEn: 'You may experience an unexpected moment of insight.', tone: 'positive', type: 'specific' },
    { text: 'Birinin sözleri sana ilham verecek.', textEn: 'Someone\'s words will inspire you.', tone: 'positive', type: 'specific' },

    // Pozitif - Tavsiye
    { text: 'Meditasyon veya sessizlik için zaman ayır.', textEn: 'Make time for meditation or silence.', tone: 'positive', type: 'advice' },
    { text: 'Şükran listesi yaz, enerjin yükselecek.', textEn: 'Write a gratitude list, your energy will rise.', tone: 'positive', type: 'advice' },
    { text: 'Doğayla bağlantı kur, topraklan.', textEn: 'Connect with nature, ground yourself.', tone: 'positive', type: 'advice' },

    // Negatif - Genel
    { text: 'Zihinsel karmaşa yaşayabilirsin, sakinleş.', textEn: 'You may experience mental confusion, calm down.', tone: 'negative', type: 'general' },
    { text: 'Negatif düşünceler yoğun, bırak gitsinler.', textEn: 'Negative thoughts are intense, let them go.', tone: 'negative', type: 'general' },
    { text: 'Spiritüel yorgunluk belirtileri, şarj ol.', textEn: 'Signs of spiritual fatigue, recharge yourself.', tone: 'negative', type: 'general' },

    // Negatif - Uyarı
    { text: 'Başkalarının enerjisinden korun, sınır koy.', textEn: 'Protect yourself from others\' energy, set boundaries.', tone: 'negative', type: 'warning' },
    { text: 'Aşırı düşünme tuzağına düşme, hisset.', textEn: 'Don\'t fall into the trap of overthinking, just feel.', tone: 'negative', type: 'warning' },
    { text: 'Negatif ortamlardan uzak dur bugün.', textEn: 'Stay away from negative environments today.', tone: 'negative', type: 'warning' },

    // Nötr - Genel
    { text: 'İç dünyanda keşif zamanı, kendini dinle.', textEn: 'Time for inner exploration, listen to yourself.', tone: 'neutral', type: 'general' },
    { text: 'Ruhsal denge için ideal gün, korumaya al.', textEn: 'An ideal day for spiritual balance, protect it.', tone: 'neutral', type: 'general' },
    { text: 'Sorular cevaplardan önemli, sorgula.', textEn: 'Questions are more important than answers, keep questioning.', tone: 'neutral', type: 'general' },
    { text: 'Bugün sadece var ol, hiçbir şey yapma.', textEn: 'Just be today, do nothing.', tone: 'neutral', type: 'advice' },

    // === YENİ MESAJLAR - ÖZEL VE DETAYLI ===
    // Zaman Bazlı
    { text: 'Sabah ilk ışıklarla meditasyon bugün çok güçlü.', textEn: 'Meditation at first light is very powerful today.', tone: 'positive', type: 'specific' },
    { text: 'Akşam 7-9 arası ruhsal bağlantı en güçlü.', textEn: 'Spiritual connection is strongest between 7-9 PM.', tone: 'positive', type: 'specific' },
    { text: 'Dolunay yaklaşıyor, niyetlerini belirle.', textEn: 'Full moon is approaching, set your intentions.', tone: 'positive', type: 'advice' },
    { text: 'Bu hafta üçüncü göz çakran aktif, sezgilerine güven.', textEn: 'Your third eye chakra is active this week, trust your intuition.', tone: 'positive', type: 'specific' },

    // Şans Elementleri
    { text: 'Mor renk bugün ruhsal enerjini yükseltiyor.', textEn: 'Purple color elevates your spiritual energy today.', tone: 'positive', type: 'advice' },
    { text: 'Ametist taşı bugün yanında olsun, koruyacak.', textEn: 'Keep an amethyst stone with you today, it will protect you.', tone: 'positive', type: 'advice' },
    { text: '11 ve 22 sayıları bugün meleksel mesajlar taşıyor.', textEn: 'Numbers 11 and 22 carry angelic messages today.', tone: 'positive', type: 'specific' },
    { text: 'Batı yönünde oturmak ruhsal açılımı destekliyor.', textEn: 'Sitting facing west supports spiritual awakening.', tone: 'positive', type: 'specific' },

    // Senaryo Bazlı
    { text: 'Rastgele açtığın kitap sayfası sana mesaj veriyor.', textEn: 'The random book page you open gives you a message.', tone: 'positive', type: 'specific' },
    { text: 'Bir yabancının sözleri evrenin mesajı olabilir.', textEn: 'A stranger\'s words might be a message from the universe.', tone: 'positive', type: 'specific' },
    { text: 'Doğada geçireceğin zaman ruhunu arındıracak.', textEn: 'Time spent in nature will cleanse your soul.', tone: 'positive', type: 'advice' },
    { text: 'Bugün yazdığın günlük gelecekte sana ışık tutacak.', textEn: 'The journal entry you write today will guide you in the future.', tone: 'positive', type: 'advice' },

    // Gizemli/İlgi Çekici
    { text: 'Saat 11:11\'i gördüğünde bir dilek tut, gerçekleşecek.', textEn: 'When you see 11:11, make a wish, it will come true.', tone: 'positive', type: 'specific' },
    { text: 'Rüyanda uçmak özgürlüğe yaklaştığının işareti.', textEn: 'Flying in your dream is a sign you\'re approaching freedom.', tone: 'positive', type: 'specific' },
    { text: 'Bir kelebek veya kuş görürsen, geçmiş yaşamından mesaj.', textEn: 'If you see a butterfly or bird, it\'s a message from a past life.', tone: 'neutral', type: 'specific' },

    // Daha Fazla Negatif/Uyarı
    { text: 'Bugün tartışmalardan uzak dur, enerji hırsızları var.', textEn: 'Stay away from arguments today, energy vampires are around.', tone: 'negative', type: 'warning' },
    { text: 'Sosyal medya bugün ruhunu yoracak, ara ver.', textEn: 'Social media will tire your soul today, take a break.', tone: 'negative', type: 'warning' },
    { text: 'Kalabalıklardan uzak dur, auran hassas.', textEn: 'Stay away from crowds, your aura is sensitive.', tone: 'negative', type: 'warning' },
    { text: 'Karanlık düşünceler geçici, onlara tutunma.', textEn: 'Dark thoughts are temporary, don\'t cling to them.', tone: 'negative', type: 'advice' },
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
export function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return (Math.abs(hash) % 1000000) / 1000000
}

/**
 * Seed bazlı rastgele seçim (array'den)
 */
function seededChoice<T>(array: T[], seed: number): T {
  return array[Math.floor(seed * array.length)]
}

/**
 * Kullanıcı ID oluştur veya mevcut olanı getir
 */
export function getUserId(): string {
  if (typeof window === 'undefined') {return 'server'}

  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID)
  if (!userId) {
    userId = 'crown_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId)
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

  // Kayıtlı kaderi kontrol et
  const stored = localStorage.getItem(STORAGE_KEYS.DAILY_DESTINY)
  if (stored) {
    try {
      const parsed: DailyDestiny = JSON.parse(stored)
      if (parsed.date === today) {
        return parsed
      }
      // Tarih değişmiş, revealed flag'i temizle
      localStorage.removeItem(STORAGE_KEYS.REVEALED)
    } catch {
      // Parse hatası, yeni oluştur
      localStorage.removeItem(STORAGE_KEYS.REVEALED)
    }
  }

  // Yeni kader oluştur — each draw gets its own hashed seed (a distinct
  // string through seededRandom) rather than arithmetic on one shared
  // number, so card/category/tone/message are actually independent draws
  // instead of correlated outputs of a single linear seed.
  const dailyKey = `${today}_${userId}`
  const baseSeed = seededRandom(dailyKey)

  // Kart seç
  const cardId = Math.floor(baseSeed * DESTINY_CARDS.length)

  // Kategori seç
  const categorySeed = seededRandom(`${dailyKey}_category`)
  const categoryIndex = Math.floor(categorySeed * FORTUNE_CATEGORIES.length)
  const category = FORTUNE_CATEGORIES[categoryIndex].key

  // Ton belirle (kartın enerjisine göre ağırlıklı)
  const card = DESTINY_CARDS[cardId]
  const toneWeights: MessageTone[] =
    card.energy === 'ascending' ? ['positive', 'positive', 'positive', 'neutral'] :
    card.energy === 'descending' ? ['negative', 'negative', 'neutral', 'positive'] :
    ['positive', 'neutral', 'neutral', 'negative']

  const toneSeed = seededRandom(`${dailyKey}_tone`)
  const toneIndex = Math.floor(toneSeed * toneWeights.length)
  const tone = toneWeights[toneIndex]

  // Mesaj seç (ton filtreli)
  const categoryMessages = FORTUNE_MESSAGES[category]
  const filteredMessages = categoryMessages.filter(m => m.tone === tone)
  const messageSeed = seededRandom(`${dailyKey}_message`)
  const messageIndex = categoryMessages.indexOf(
    seededChoice(filteredMessages.length > 0 ? filteredMessages : categoryMessages, messageSeed)
  )

  const destiny: DailyDestiny = {
    date: today,
    cardId,
    category,
    messageIndex: Math.max(0, messageIndex),
    tone
  }

  localStorage.setItem(STORAGE_KEYS.DAILY_DESTINY, JSON.stringify(destiny))
  return destiny
}

/**
 * Kader detaylarını getir
 */
// Default card for fallback
const DEFAULT_CARD: DestinyCard = {
  id: 0,
  name: 'The Wanderer',
  nameTr: 'Gezgin',
  symbol: '🌟',
  image: '/tarot/the-fool.png',
  element: 'air',
  energy: 'ascending'
}

export function getDestinyDetails(destiny: DailyDestiny) {
  // Ensure cardId is a valid number within range
  const cardId = typeof destiny?.cardId === 'number'
    ? Math.max(0, Math.min(21, destiny.cardId))
    : 0

  // Get card with multiple fallbacks
  const card = DESTINY_CARDS?.[cardId] ?? DESTINY_CARDS?.[0] ?? DEFAULT_CARD
  const category = FORTUNE_CATEGORIES.find(c => c.key === destiny?.category) || FORTUNE_CATEGORIES[0]
  const messages = FORTUNE_MESSAGES[destiny?.category] || FORTUNE_MESSAGES.love
  const message = messages?.[destiny?.messageIndex] || messages?.[0]

  return {
    card,
    category,
    message,
    tone: destiny?.tone || 'neutral'
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

/**
 * Destiny verilerini temizle (test/debug için)
 * Tarayıcı konsolundan: clearDestinyData()
 */
export function clearDestinyData(): void {
  if (typeof window === 'undefined') {return}
  localStorage.removeItem(STORAGE_KEYS.DAILY_DESTINY)
  localStorage.removeItem(STORAGE_KEYS.REVEALED)
  localStorage.removeItem(STORAGE_KEYS.IS_REVERSED)
  localStorage.removeItem(STORAGE_KEYS.REVERSE_MESSAGE)
  console.log('Crown Destiny data cleared. Refresh the page.')
}

// Global'e ekle (sadece development modunda)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as unknown as { clearDestinyData: typeof clearDestinyData }).clearDestinyData = clearDestinyData
}

// =============== STREAK SİSTEMİ ===============

/**
 * Get yesterday's date in Turkey timezone (YYYY-MM-DD)
 */
function getYesterdayTurkeyDate(): string {
  const now = new Date()
  // Subtract 1 day
  now.setDate(now.getDate() - 1)
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  return formatter.format(now)
}

/**
 * Calculate current milestone and next milestone
 */
function calculateMilestones(streakCount: number) {
  let currentMilestone: typeof STREAK_MILESTONES[number] | null = null
  let nextMilestone: typeof STREAK_MILESTONES[number] | null = null

  for (const milestone of STREAK_MILESTONES) {
    if (streakCount >= milestone.days) {
      currentMilestone = milestone
    } else if (!nextMilestone) {
      nextMilestone = milestone
    }
  }

  const daysToNext = nextMilestone ? nextMilestone.days - streakCount : 0

  return { currentMilestone, nextMilestone, daysToNext }
}

/**
 * Get current streak data
 */
export function getStreakData(): StreakData {
  if (typeof window === 'undefined') {
    return { count: 0, lastDate: '', currentMilestone: null, nextMilestone: STREAK_MILESTONES[0], daysToNext: STREAK_MILESTONES[0].days }
  }

  const storedCount = localStorage.getItem(STORAGE_KEYS.STREAK_COUNT)
  const storedDate = localStorage.getItem(STORAGE_KEYS.STREAK_LAST_DATE)

  const count = storedCount ? parseInt(storedCount, 10) : 0
  const lastDate = storedDate || ''

  const { currentMilestone, nextMilestone, daysToNext } = calculateMilestones(count)

  return { count, lastDate, currentMilestone, nextMilestone, daysToNext }
}

/**
 * Update streak when user reveals their fortune
 * Call this when the fortune is revealed (card flipped)
 */
export function updateStreak(): StreakData {
  if (typeof window === 'undefined') {
    return { count: 0, lastDate: '', currentMilestone: null, nextMilestone: STREAK_MILESTONES[0], daysToNext: STREAK_MILESTONES[0].days }
  }

  const today = getTurkeyDate()
  const yesterday = getYesterdayTurkeyDate()
  const storedDate = localStorage.getItem(STORAGE_KEYS.STREAK_LAST_DATE)
  const storedCount = localStorage.getItem(STORAGE_KEYS.STREAK_COUNT)

  let newCount: number

  if (storedDate === today) {
    // Already checked today, don't increment
    newCount = storedCount ? parseInt(storedCount, 10) : 1
  } else if (storedDate === yesterday) {
    // Consecutive day! Increment streak
    newCount = (storedCount ? parseInt(storedCount, 10) : 0) + 1
  } else {
    // Streak broken or first time, start fresh
    newCount = 1
  }

  // Save updated streak
  localStorage.setItem(STORAGE_KEYS.STREAK_COUNT, newCount.toString())
  localStorage.setItem(STORAGE_KEYS.STREAK_LAST_DATE, today)

  const { currentMilestone, nextMilestone, daysToNext } = calculateMilestones(newCount)

  return { count: newCount, lastDate: today, currentMilestone, nextMilestone, daysToNext }
}

/**
 * Belirtilen kategori için "Ters/Kötü" mesaj getirir
 * Mevcut mesajdan farklı bir negatif mesaj seçmeye çalışır
 * Seed parametresi ile deterministik sonuç üretir
 */
export function getReverseMessage(category: FortuneCategory, seed: number): FortuneMessage {
  const messages = FORTUNE_MESSAGES[category]
  // Negatif veya uyarı mesajlarını filtrele
  const negativeMessages = messages.filter(m => m.tone === 'negative' || m.type === 'warning')
  
  if (negativeMessages.length === 0) {
    // Eğer hiç negatif yoksa (olmamalı ama), genel bir uyarı döndür
    return {
      text: 'Dikkatli ol, gölgeler her zaman ışığı takip eder.',
      textEn: 'Be careful, shadows always follow the light.',
      tone: 'negative',
      type: 'warning'
    }
  }

  // Seed kullanarak deterministik seçim yap
  const index = seed % negativeMessages.length
  return negativeMessages[index]
}

// =============== AY FAZI SİSTEMİ ===============

/**
 * Gerçek ay fazını hesapla (synodic döngü kullanarak)
 * Referans: 6 Ocak 2000 = Yeni Ay
 */
export function getMoonPhase(): MoonPhase {
  const LUNAR_CYCLE = 29.53058867 // Synodic ay döngüsü (gün)
  const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime()
  const now = Date.now()
  const daysSince = (now - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24)
  const phase = (daysSince % LUNAR_CYCLE) / LUNAR_CYCLE

  // 0-1 arası değeri 8 faza böl
  const phaseIndex = Math.floor(phase * 8) % 8
  return MOON_PHASES[phaseIndex]
}

// =============== ŞANSLI ELEMENTLER SİSTEMİ ===============

/**
 * Kart ve güne göre şanslı elementleri getir (deterministik)
 */
export function getLuckyElements(cardId: number, date: string): LuckyElements {
  const seed1 = seededRandom(`${cardId}_${date}_lucky1`)
  const seed2 = seededRandom(`${cardId}_${date}_lucky2`)
  const seed3 = seededRandom(`${cardId}_${date}_lucky3`)

  return {
    numbers: [
      Math.floor(seed1 * 49) + 1,
      Math.floor(seed2 * 49) + 1,
      Math.floor(seed3 * 49) + 1,
    ].sort((a, b) => a - b), // Küçükten büyüğe sırala
    color: LUCKY_COLORS[cardId % LUCKY_COLORS.length],
    direction: DIRECTIONS[Math.floor(seed1 * 4)],
  }
}

// =============== MOTİVASYON SÖZÜ SİSTEMİ ===============

/**
 * Kart ve güne göre günlük motivasyon sözünü getir
 */
export function getDailyQuote(cardId: number, date: string): MotivationQuote {
  const quotes = MOTIVATION_QUOTES[cardId] || MOTIVATION_QUOTES[0]
  const seed = seededRandom(`${cardId}_${date}_quote`)
  const index = Math.floor(seed * quotes.length)
  return quotes[index]
}

// =============== KART KOLEKSİYONU SİSTEMİ ===============

/**
 * Kart koleksiyonunu getir
 */
export function getCardCollection(): CardCollection {
  const total = DESTINY_CARDS.length as 22

  if (typeof window === 'undefined') {
    return {
      seenCardIds: [],
      firstSeenDates: {},
      totalCards: total,
      collectionProgress: 0
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.CARD_COLLECTION)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      const seenCount = parsed.seenCardIds?.length || 0
      return {
        seenCardIds: parsed.seenCardIds || [],
        firstSeenDates: parsed.firstSeenDates || {},
        totalCards: total,
        collectionProgress: Math.round((seenCount / total) * 100)
      }
    } catch {
      // Invalid JSON, return empty collection
    }
  }

  return {
    seenCardIds: [],
    firstSeenDates: {},
    totalCards: total,
    collectionProgress: 0
  }
}

/**
 * Kart koleksiyonuna yeni kart ekle
 * Aynı kart tekrar eklenmez
 */
export function addCardToCollection(cardId: number): CardCollection {
  if (typeof window === 'undefined') {
    return getCardCollection()
  }

  const collection = getCardCollection()
  const today = getTurkeyDate()

  // Kart zaten koleksiyonda mı?
  if (!collection.seenCardIds.includes(cardId)) {
    collection.seenCardIds.push(cardId)
    collection.firstSeenDates[cardId] = today
    collection.collectionProgress = Math.round((collection.seenCardIds.length / DESTINY_CARDS.length) * 100)

    // Kaydet
    localStorage.setItem(STORAGE_KEYS.CARD_COLLECTION, JSON.stringify({
      seenCardIds: collection.seenCardIds,
      firstSeenDates: collection.firstSeenDates
    }))
  }

  return collection
}

/**
 * Koleksiyon tamamlandı mı?
 */
export function isCollectionComplete(): boolean {
  const collection = getCardCollection()
  return collection.seenCardIds.length >= DESTINY_CARDS.length
}
