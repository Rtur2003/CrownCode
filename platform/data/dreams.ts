/**
 * Crown Dreams - Rüya Günlüğü Sistemi
 * Neural Dream Journal & Consciousness Analytics
 * CrownCode Platform
 */

export type DreamType = 'normal' | 'lucid' | 'nightmare' | 'recurring' | 'prophetic' | 'symbolic'
export type EmotionType = 'joy' | 'fear' | 'peace' | 'confusion' | 'love' | 'anxiety' | 'wonder' | 'neutral'
export type ClarityLevel = 1 | 2 | 3 | 4 | 5

export interface DreamEntry {
  id: string
  title: string
  titleEn: string
  content: string
  contentEn: string
  date: string
  type: DreamType
  emotions: EmotionType[]
  clarity: ClarityLevel
  lucidity: number // 0-100
  sleepQuality: number // 0-100
  duration: number // minutes
  tags: string[]
  symbols: string[]
  characters: string[]
  locations: string[]
  isStarred: boolean
  aiAnalysis?: string
  aiAnalysisEn?: string
}

export interface DreamStats {
  totalDreams: number
  lucidDreams: number
  lucidPercentage: number
  avgClarity: number
  avgSleepQuality: number
  streakDays: number
  weeklyActivity: { day: string; dayEn: string; count: number }[]
  monthlyTrend: { month: string; lucid: number; normal: number }[]
  emotionDistribution: { emotion: EmotionType; count: number }[]
  typeDistribution: { type: DreamType; count: number }[]
}

export interface DreamPattern {
  id: string
  type: 'symbol' | 'theme' | 'location' | 'character' | 'emotion'
  name: string
  nameEn: string
  frequency: number
  interpretation: string
  interpretationEn: string
}

export interface UserProfile {
  id: string
  name: string
  rank: string
  rankEn: string
  totalDreams: number
  lucidMastery: number
  joinedAt: string
}

// Rüya tipi renkleri - Eyes projesinden
export const DREAM_TYPE_COLORS: Record<DreamType, string> = {
  normal: '#D4AF37',
  lucid: '#FFD700',
  nightmare: '#B22222',
  recurring: '#6B8E23',
  prophetic: '#9370DB',
  symbolic: '#4682B4'
}

// Rüya tipi isimleri
export const DREAM_TYPE_LABELS: Record<DreamType, { tr: string; en: string }> = {
  normal: { tr: 'Normal', en: 'Normal' },
  lucid: { tr: 'Lüsid', en: 'Lucid' },
  nightmare: { tr: 'Kabus', en: 'Nightmare' },
  recurring: { tr: 'Tekrarlayan', en: 'Recurring' },
  prophetic: { tr: 'Kehanet', en: 'Prophetic' },
  symbolic: { tr: 'Sembolik', en: 'Symbolic' }
}

// Duygu renkleri - Eyes projesinden
export const EMOTION_COLORS: Record<EmotionType, string> = {
  joy: '#FFD700',
  fear: '#8B0000',
  peace: '#87CEEB',
  confusion: '#9370DB',
  love: '#FF69B4',
  anxiety: '#FF6347',
  wonder: '#DAA520',
  neutral: '#A0A0A0'
}

// Duygu isimleri
export const EMOTION_LABELS: Record<EmotionType, { tr: string; en: string }> = {
  joy: { tr: 'Sevinç', en: 'Joy' },
  fear: { tr: 'Korku', en: 'Fear' },
  peace: { tr: 'Huzur', en: 'Peace' },
  confusion: { tr: 'Kafa Karışıklığı', en: 'Confusion' },
  love: { tr: 'Aşk', en: 'Love' },
  anxiety: { tr: 'Endişe', en: 'Anxiety' },
  wonder: { tr: 'Merak', en: 'Wonder' },
  neutral: { tr: 'Nötr', en: 'Neutral' }
}

// Helper: X gün önce
const daysAgo = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

// Mock Rüyalar - Detaylı
export const MOCK_DREAMS: DreamEntry[] = [
  {
    id: 'dream-001',
    title: 'Altın Kütüphane',
    titleEn: 'The Golden Library',
    content: 'Sonsuz bir kütüphanenin içindeydim, tüm kitaplar altınla kaplıydı. Her kitap hayatımdan farklı bir anıyı içeriyordu, ama hiç öğrenmediğim bir dilde yazılmıştı - yine de bir şekilde anlayabiliyordum. Kütüphaneci tamamen ışıktan oluşan bir figürdü ve beni özel bir bölüme götürdü - henüz yazılmamış kitaplar. Birini açtığımda rüya gördüğümü fark ettim ve sayfalar seçimlerimin paralel versiyonlarını gösteren aynalara dönüştü.',
    contentEn: 'I found myself in an infinite library where all the books were bound in gold. Each book contained a different memory from my life, but written in a language I could somehow understand despite never learning it. The librarian was a figure made entirely of light who showed me to a special section—books that hadn\'t been written yet. When I opened one, I realized I was dreaming and the pages became mirrors showing parallel versions of my choices.',
    date: daysAgo(0),
    type: 'lucid',
    emotions: ['wonder', 'peace'],
    clarity: 5,
    lucidity: 92,
    sleepQuality: 95,
    duration: 45,
    tags: ['kütüphane', 'altın', 'kitaplar', 'bilgi'],
    symbols: ['altın kitaplar', 'sonsuz koridorlar', 'ışık varlığı', 'aynalar'],
    characters: ['Işık Kütüphanecisi'],
    locations: ['Sonsuz Kütüphane'],
    isStarred: true,
    aiAnalysis: 'Bu rüya bilgelik ve öz-yansıtma ile derin bir bağlantıya işaret ediyor. Altın kitaplar değerli yaşam deneyimlerini temsil ederken, lüsid farkındalık gerçekliği şekillendirme gücünüzün artan bilincini gösteriyor.',
    aiAnalysisEn: 'This dream suggests a deep connection to wisdom and self-reflection. The golden books represent valuable life experiences, while the lucid realization indicates growing awareness of your power to shape reality.'
  },
  {
    id: 'dream-002',
    title: 'Bronz Dağların Üzerinde Uçuş',
    titleEn: 'Flight Over Bronze Mountains',
    content: 'Gün batımını yansıtan cilalı bronzdan dağ sıralarının üzerinde uçuyordum. Her zirvede küçük bir tapınak vardı. Birinin üzerine indiğimde, bana her zaman istediğim şeye değil, gerçekten ihtiyacım olan şeye işaret eden bir pusula veren yaşlı bir kendimle karşılaştım.',
    contentEn: 'Flying over mountain ranges made of polished bronze that reflected the sunset. Each peak had a small temple at its summit. When I landed on one, I met an old version of myself who gave me a compass that always points to what I truly need, not what I want.',
    date: daysAgo(1),
    type: 'lucid',
    emotions: ['joy', 'wonder'],
    clarity: 4,
    lucidity: 78,
    sleepQuality: 88,
    duration: 38,
    tags: ['uçuş', 'dağlar', 'tapınaklar', 'öz-keşif'],
    symbols: ['bronz dağlar', 'pusula', 'tapınaklar', 'yaşlı ben'],
    characters: ['Yaşlı Ben'],
    locations: ['Bronz Dağlar', 'Tapınak'],
    isStarred: true,
    aiAnalysis: 'Uçuş rüyaları genellikle özgürlük ve aşkınlığı temsil eder. Yaşlı benliğinizle karşılaşmak, bilinçaltınızdan gelen bilgeliği entegre ettiğinizi gösteriyor. Pusula, iç rehberlik sisteminizi simgeliyor.',
    aiAnalysisEn: 'Flight dreams often represent freedom and transcendence. Meeting your elder self suggests you\'re integrating wisdom from your subconscious. The compass symbolizes your inner guidance system.'
  },
  {
    id: 'dream-003',
    title: 'Sualtı Şehri',
    titleEn: 'The Underwater City',
    content: 'İnsanların normal şekilde nefes aldığı, okyanusun altındaki antik bir şehre indim. Mimari, Art Deco ve yabancı bir şeyin karışımıydı. Kelimeler yerine renklerle konuşuyorlardı ve belirli altın tonlarının "ev" ve "aidiyet" anlamına geldiğini öğrendim.',
    contentEn: 'Descended into an ancient city beneath the ocean where people breathed normally. The architecture was a mix of Art Deco and something alien. They spoke through colors instead of words, and I learned that certain shades of gold meant "home" and "belonging".',
    date: daysAgo(2),
    type: 'normal',
    emotions: ['wonder', 'peace', 'confusion'],
    clarity: 3,
    lucidity: 15,
    sleepQuality: 72,
    duration: 52,
    tags: ['sualtı', 'şehir', 'iletişim', 'antik'],
    symbols: ['sualtı şehri', 'renk dili', 'altın = ev'],
    characters: ['Şehir Sakinleri'],
    locations: ['Sualtı Şehri'],
    isStarred: false,
    aiAnalysis: 'Su genellikle bilinçdışı zihni simgeler. Bu rüya, derin duyguların ve başkalarıyla bağlantı kurmanın alternatif yollarının keşfini öneriyor.',
    aiAnalysisEn: 'Water typically represents the unconscious mind. This dream suggests exploration of deep emotions and alternative ways of connecting with others.'
  },
  {
    id: 'dream-004',
    title: 'Gölge Benliğim Tarafından Kovalanma',
    titleEn: 'Chased by Shadow Self',
    content: 'Aynı koridorlarla dolu sonsuz bir otelde koşuyordum. Bana benzeyen ama gölgelerden yapılmış bir şey takip ediyordu. Her kaçtığımı düşündüğümde, onu bir aynada görüyordum. Sonunda koşmayı bıraktım ve ne istediğini sordum. Sadece kabul edilmek istediğini söyledi.',
    contentEn: 'Running through an endless hotel with identical corridors. Something that looked like me but made of shadows was following. Every time I thought I escaped, I would see it in a mirror. Finally, I stopped running and asked it what it wanted. It said it just wanted to be acknowledged.',
    date: daysAgo(3),
    type: 'nightmare',
    emotions: ['fear', 'anxiety'],
    clarity: 4,
    lucidity: 22,
    sleepQuality: 45,
    duration: 28,
    tags: ['kovalama', 'gölge', 'aynalar', 'yüzleşme'],
    symbols: ['gölge benlik', 'sonsuz koridorlar', 'aynalar', 'otel'],
    characters: ['Gölge Benlik'],
    locations: ['Sonsuz Otel'],
    isStarred: false,
    aiAnalysis: 'Gölge rüyaları, kişiliğin kabul edilmek isteyen bütünleştirilmemiş yönlerini gösterir. Çözüm - durmak ve iletişim kurmak - psikolojik olgunluğu gösterir.',
    aiAnalysisEn: 'Shadow dreams indicate unintegrated aspects of personality seeking acknowledgment. The resolution—stopping and communicating—shows psychological maturity.'
  },
  {
    id: 'dream-005',
    title: 'Zamanın Bahçesi',
    titleEn: 'Garden of Time',
    content: 'Her çiçeğin zamanda bir anı temsil ettiği bir bahçede yürüyordum. Bazıları anılardı, diğerleri olasılıklardı. Altın bir kelebek belirli çiçeklere konuyor ve onlar film gibi oynuyordu. Unuttuğum anları izleyerek saatler geçirdim.',
    contentEn: 'Walking through a garden where each flower represented a moment in time. Some were memories, others were possibilities. A golden butterfly would land on certain flowers and they would play like movies. I spent what felt like hours watching moments I had forgotten.',
    date: daysAgo(4),
    type: 'normal',
    emotions: ['peace', 'love'],
    clarity: 4,
    lucidity: 35,
    sleepQuality: 82,
    duration: 41,
    tags: ['bahçe', 'zaman', 'anılar', 'kelebek'],
    symbols: ['zaman çiçekleri', 'altın kelebek', 'canlı anılar'],
    characters: [],
    locations: ['Zamanın Bahçesi'],
    isStarred: true,
    aiAnalysis: 'Bahçeler genellikle kişisel büyüme ve gelişimi simgeler. Bu rüya, geçmişinizle sağlıklı bir ilişki ve gelecekteki olasılıklara açıklık öneriyor.',
    aiAnalysisEn: 'Gardens often symbolize personal growth and cultivation. This dream suggests a healthy relationship with your past and openness to future possibilities.'
  },
  {
    id: 'dream-006',
    title: 'Tekrarlayan Kapı',
    titleEn: 'The Recurring Door',
    content: 'Yıllardır rüyalarımda gördüğüm aynı kapı. Her zaman uzun bir koridorun sonunda, her zaman hafifçe aralık ve içinden altın ışık geliyor. Bu sefer sonunda açtım ve... başka bir kapı buldum. Ama bu farklı, daha sıcak hissettiriyordu.',
    contentEn: 'The same door I\'ve seen in dreams for years. Always at the end of a long hallway, always slightly ajar with golden light coming through. This time I finally opened it and found... another door. But this one felt different, warmer.',
    date: daysAgo(5),
    type: 'recurring',
    emotions: ['anxiety', 'wonder'],
    clarity: 5,
    lucidity: 48,
    sleepQuality: 68,
    duration: 25,
    tags: ['kapılar', 'koridor', 'tekrarlayan', 'ilerleme'],
    symbols: ['altın kapı', 'sonsuz koridor', 'iç içe kapılar'],
    characters: [],
    locations: ['Rüya Koridoru'],
    isStarred: false,
    aiAnalysis: 'Tekrarlayan kapı rüyaları genellikle fırsatları veya geçişleri temsil eder. Başka bir kapı bulmak için açmak, önemli bir yaşam değişikliğine doğru ilerlediğinizi gösteriyor.',
    aiAnalysisEn: 'Recurring door dreams often represent opportunities or transitions. Opening it to find another door suggests you\'re making progress toward a significant life change.'
  },
  {
    id: 'dream-007',
    title: 'Duyguların Orkestrası',
    titleEn: 'Orchestra of Emotions',
    content: 'Her enstrümanın notalar yerine duyguları çaldığı bir orkestrayı yönetiyordum. Kemanları kaldırdığımda herkes neşe hissediyordu. Çellolar melankoli getirdi. Duyguların senfonilerini yaratmayı öğrendim, duyguları hayal bile edemeyeceğim şekillerde karıştırarak.',
    contentEn: 'Conducted an orchestra where each instrument played an emotion instead of notes. When I raised the violins, everyone felt joy. The cellos brought melancholy. I learned to create symphonies of feeling, mixing emotions in ways I never imagined possible.',
    date: daysAgo(7),
    type: 'lucid',
    emotions: ['joy', 'wonder'],
    clarity: 5,
    lucidity: 85,
    sleepQuality: 91,
    duration: 55,
    tags: ['müzik', 'duygular', 'kontrol', 'orkestra'],
    symbols: ['duygu orkestrası', 'şef değneği', 'his senfonileri'],
    characters: ['Orkestra Üyeleri'],
    locations: ['Konser Salonu'],
    isStarred: true,
    aiAnalysis: 'Şef olmak duygusal ustalık arzusunu gösterir. Bu yüksek lüsidlik rüyası, güçlü duygusal zeka ve başkalarını olumlu etkileme yeteneğini gösteriyor.',
    aiAnalysisEn: 'Being a conductor indicates a desire for emotional mastery. This highly lucid dream shows strong emotional intelligence and the ability to influence others positively.'
  },
  {
    id: 'dream-008',
    title: 'Paylaşılan Rüya ile Karşılaşma',
    titleEn: 'Meeting a Shared Dream',
    content: 'İkimizin de rüya gördüğünü iddia eden biriyle tanıştım. Kimsenin bilmediği çocukluk evim hakkında detayları anlattı. Uyandığımızda belirli bir yere belirli bir nesne bırakmayı kabul ettik. Sabah cebimde onun çizimini içeren bir not buldum.',
    contentEn: 'Met someone who claimed we were both dreaming. They described details about my childhood home that no one else knows. We agreed to leave a specific object in a specific place when we wake up. In the morning, I found a note in my pocket with their drawing.',
    date: daysAgo(10),
    type: 'prophetic',
    emotions: ['wonder', 'confusion'],
    clarity: 4,
    lucidity: 67,
    sleepQuality: 79,
    duration: 34,
    tags: ['paylaşılan rüya', 'bağlantı', 'gizem', 'kanıt'],
    symbols: ['paylaşılan bilinç', 'hafıza doğrulama', 'rüya nesneleri'],
    characters: ['Bilinmeyen Rüyacı'],
    locations: ['Çocukluk Evi'],
    isStarred: true,
    aiAnalysis: 'Paylaşılan rüya deneyimleri, bilimsel olarak tartışmalı olsa da, genellikle bağlantı ve iç deneyimlerin doğrulanması için derin bir arzuyu temsil eder.',
    aiAnalysisEn: 'Shared dream experiences, while scientifically debated, often represent a deep desire for connection and validation of inner experiences.'
  }
]

// Mock İstatistikler
export const MOCK_STATS: DreamStats = {
  totalDreams: 247,
  lucidDreams: 89,
  lucidPercentage: 36,
  avgClarity: 4.2,
  avgSleepQuality: 78,
  streakDays: 12,
  weeklyActivity: [
    { day: 'Pzt', dayEn: 'Mon', count: 4 },
    { day: 'Sal', dayEn: 'Tue', count: 3 },
    { day: 'Çar', dayEn: 'Wed', count: 5 },
    { day: 'Per', dayEn: 'Thu', count: 2 },
    { day: 'Cum', dayEn: 'Fri', count: 6 },
    { day: 'Cmt', dayEn: 'Sat', count: 4 },
    { day: 'Paz', dayEn: 'Sun', count: 3 }
  ],
  monthlyTrend: [
    { month: 'Ağu', lucid: 8, normal: 15 },
    { month: 'Eyl', lucid: 12, normal: 18 },
    { month: 'Eki', lucid: 15, normal: 14 },
    { month: 'Kas', lucid: 18, normal: 12 },
    { month: 'Ara', lucid: 22, normal: 10 },
    { month: 'Oca', lucid: 14, normal: 8 }
  ],
  emotionDistribution: [
    { emotion: 'wonder', count: 156 },
    { emotion: 'peace', count: 98 },
    { emotion: 'joy', count: 87 },
    { emotion: 'fear', count: 45 },
    { emotion: 'confusion', count: 34 },
    { emotion: 'anxiety', count: 28 },
    { emotion: 'love', count: 22 },
    { emotion: 'neutral', count: 15 }
  ],
  typeDistribution: [
    { type: 'normal', count: 120 },
    { type: 'lucid', count: 89 },
    { type: 'symbolic', count: 18 },
    { type: 'recurring', count: 12 },
    { type: 'nightmare', count: 5 },
    { type: 'prophetic', count: 3 }
  ]
}

// Mock Pattern'lar
export const MOCK_PATTERNS: DreamPattern[] = [
  {
    id: 'pattern-001',
    type: 'symbol',
    name: 'Altın Nesneler',
    nameEn: 'Golden Objects',
    frequency: 45,
    interpretation: 'Rüyalarınızda altın sık sık bilgelik, değer ve aydınlanma ile ilişkili olarak görünüyor. Bu, iç değerinizle güçlü bir bağlantı öneriyor.',
    interpretationEn: 'Gold frequently appears in your dreams, often associated with wisdom, value, and enlightenment. This suggests a strong connection to your inner worth.'
  },
  {
    id: 'pattern-002',
    type: 'theme',
    name: 'Uçuş ve Özgürlük',
    nameEn: 'Flight & Freedom',
    frequency: 38,
    interpretation: 'Uçuş rüyaları düzenli olarak ortaya çıkıyor, günlük sınırlamalardan kurtuluş ve aşkınlık arzusunu gösteriyor.',
    interpretationEn: 'Flying dreams occur regularly, indicating a desire for liberation and transcendence of everyday limitations.'
  },
  {
    id: 'pattern-003',
    type: 'location',
    name: 'Sonsuz Mekanlar',
    nameEn: 'Infinite Spaces',
    frequency: 32,
    interpretation: 'Sonsuz koridorlar, sınırsız kütüphaneler ve geniş alanlar, bilinçdışının keşfini ve sınırsız potansiyeli öneriyor.',
    interpretationEn: 'Endless corridors, infinite libraries, and vast spaces suggest exploration of the unconscious and unlimited potential.'
  },
  {
    id: 'pattern-004',
    type: 'character',
    name: 'Bilge Rehberler',
    nameEn: 'Wise Guides',
    frequency: 28,
    interpretation: 'Tekrarlayan bilge figürler, bilinçli kararlarınızı yönlendirmeye çalışan üst benliğinizi veya iç bilgeliğinizi temsil ediyor.',
    interpretationEn: 'Recurring wise figures represent your higher self or inner wisdom seeking to guide your conscious decisions.'
  },
  {
    id: 'pattern-005',
    type: 'emotion',
    name: 'Merak ve Hayranlık',
    nameEn: 'Wonder & Awe',
    frequency: 52,
    interpretation: 'Merak, baskın rüya duygunuz olup, yaşamın gizemlerine doğal olarak meraklı ve açık bir yaklaşım öneriyor.',
    interpretationEn: 'Wonder is your dominant dream emotion, suggesting a naturally curious and open approach to life\'s mysteries.'
  }
]

// Mock Kullanıcı Profili
export const MOCK_USER: UserProfile = {
  id: 'user-001',
  name: 'Nexus Kaşifi',
  rank: 'Rüya Mimarı',
  rankEn: 'Dream Architect',
  totalDreams: 247,
  lucidMastery: 72,
  joinedAt: '2025-03-15'
}

// Yardımcı Fonksiyonlar

export function getDreamById(id: string): DreamEntry | undefined {
  return MOCK_DREAMS.find(d => d.id === id)
}

export function formatDreamDate(dateStr: string, language: 'tr' | 'en'): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return language === 'tr' ? 'Bugün' : 'Today'
  if (diffDays === 1) return language === 'tr' ? 'Dün' : 'Yesterday'
  if (diffDays < 7) {
    const weekdays = language === 'tr'
      ? ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return weekdays[date.getDay()]
  }

  return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'short'
  })
}

export function truncateDreamContent(text: string, maxLength: number = 80): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getDreamTypeColor(type: DreamType): string {
  return DREAM_TYPE_COLORS[type]
}

export function getEmotionColor(emotion: EmotionType): string {
  return EMOTION_COLORS[emotion]
}

export function getLucidityLevel(lucidity: number, language: 'tr' | 'en'): string {
  if (lucidity >= 80) return language === 'tr' ? 'Tam Kontrol' : 'Full Control'
  if (lucidity >= 60) return language === 'tr' ? 'Yüksek Farkındalık' : 'High Awareness'
  if (lucidity >= 40) return language === 'tr' ? 'Orta Düzey' : 'Moderate'
  if (lucidity >= 20) return language === 'tr' ? 'Hafif Farkındalık' : 'Glimpses'
  return language === 'tr' ? 'Lüsid Değil' : 'Non-Lucid'
}

export function getSleepQualityLabel(quality: number, language: 'tr' | 'en'): string {
  if (quality >= 90) return language === 'tr' ? 'Mükemmel' : 'Excellent'
  if (quality >= 70) return language === 'tr' ? 'İyi' : 'Good'
  if (quality >= 50) return language === 'tr' ? 'Orta' : 'Fair'
  if (quality >= 30) return language === 'tr' ? 'Zayıf' : 'Poor'
  return language === 'tr' ? 'Çok Zayıf' : 'Very Poor'
}
