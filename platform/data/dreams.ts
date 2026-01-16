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
  tags: string[]
  symbols: string[]
  isStarred: boolean
  aiAnalysis?: string
  aiAnalysisEn?: string
}

export interface DreamStats {
  totalDreams: number
  lucidDreams: number
  lucidPercentage: number
  avgClarity: number
  streakDays: number
  weeklyActivity: { day: string; dayEn: string; count: number }[]
  emotionDistribution: { emotion: EmotionType; count: number }[]
  typeDistribution: { type: DreamType; count: number }[]
}

// Rüya tipi renkleri
export const DREAM_TYPE_COLORS: Record<DreamType, string> = {
  normal: '#eac06f',
  lucid: '#9b59b6',
  nightmare: '#e74c3c',
  recurring: '#3498db',
  prophetic: '#f39c12',
  symbolic: '#27ae60'
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

// Duygu renkleri
export const EMOTION_COLORS: Record<EmotionType, string> = {
  joy: '#f39c12',
  fear: '#8b0000',
  peace: '#3498db',
  confusion: '#9b59b6',
  love: '#e74c3c',
  anxiety: '#e67e22',
  wonder: '#eac06f',
  neutral: '#95a5a6'
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

// Mock veriler
export const MOCK_DREAMS: DreamEntry[] = [
  {
    id: 'dream-1',
    title: 'Gökyüzünde Uçuş',
    titleEn: 'Flight in the Sky',
    content: 'Bulutların üzerinde süzülüyordum. Altın rengi güneş ışıkları her yanımı sarıyordu. Özgürlük hissini hiç bu kadar yoğun yaşamamıştım.',
    contentEn: 'I was gliding above the clouds. Golden sunlight surrounded me everywhere. I had never felt freedom so intensely.',
    date: '2025-01-15',
    type: 'lucid',
    emotions: ['joy', 'wonder', 'peace'],
    clarity: 5,
    lucidity: 85,
    tags: ['uçuş', 'gökyüzü', 'özgürlük'],
    symbols: ['güneş', 'bulutlar', 'kanatlar'],
    isStarred: true,
    aiAnalysis: 'Bu rüya, hayatınızdaki engelleri aştığınızı ve yeni başlangıçlara hazır olduğunuzu gösteriyor.',
    aiAnalysisEn: 'This dream indicates that you have overcome obstacles in your life and are ready for new beginnings.'
  },
  {
    id: 'dream-2',
    title: 'Antik Tapınak',
    titleEn: 'Ancient Temple',
    content: 'Yosun kaplı taş basamakları tırmanıyordum. Tapınağın içinde altın bir taç vardı ve beni bekliyordu.',
    contentEn: 'I was climbing moss-covered stone steps. Inside the temple there was a golden crown waiting for me.',
    date: '2025-01-14',
    type: 'symbolic',
    emotions: ['wonder', 'peace'],
    clarity: 4,
    lucidity: 30,
    tags: ['tapınak', 'keşif', 'gizem'],
    symbols: ['taç', 'merdiven', 'tapınak'],
    isStarred: true,
    aiAnalysis: 'Rüyadaki taç, ulaşmak istediğiniz bir hedefi veya potansiyelinizi simgeliyor.',
    aiAnalysisEn: 'The crown in the dream symbolizes a goal you want to reach or your potential.'
  },
  {
    id: 'dream-3',
    title: 'Karanlık Orman',
    titleEn: 'Dark Forest',
    content: 'Sislerin arasında yürüyordum. Her adımda arkamdan sesler geliyordu ama döndüğümde kimse yoktu.',
    contentEn: 'I was walking through the mist. With each step, sounds came from behind me, but when I turned there was no one.',
    date: '2025-01-13',
    type: 'nightmare',
    emotions: ['fear', 'anxiety'],
    clarity: 3,
    lucidity: 10,
    tags: ['orman', 'karanlık', 'takip'],
    symbols: ['sis', 'gölgeler', 'ayak sesleri'],
    isStarred: false,
    aiAnalysis: 'Bu rüya, bilinçaltınızdaki kaçınılan konuları veya korkuları yansıtıyor olabilir.',
    aiAnalysisEn: 'This dream may reflect avoided topics or fears in your subconscious.'
  },
  {
    id: 'dream-4',
    title: 'Aynı Kapı',
    titleEn: 'The Same Door',
    content: 'Yine o kapının önündeydim. Her seferinde açmak istiyorum ama elim tutamağa her ulaştığında uyanıyorum.',
    contentEn: 'I was in front of that door again. Every time I want to open it, but every time my hand reaches the handle, I wake up.',
    date: '2025-01-12',
    type: 'recurring',
    emotions: ['confusion', 'anxiety'],
    clarity: 4,
    lucidity: 20,
    tags: ['kapı', 'tekrar', 'engel'],
    symbols: ['kapı', 'tutamak', 'eşik'],
    isStarred: false,
    aiAnalysis: 'Tekrarlayan rüyalar genellikle çözümlenmemiş konulara işaret eder. Kapı, yeni fırsatları simgeliyor olabilir.',
    aiAnalysisEn: 'Recurring dreams often point to unresolved issues. The door may symbolize new opportunities.'
  },
  {
    id: 'dream-5',
    title: 'Denizin Altında',
    titleEn: 'Under the Sea',
    content: 'Nefes alabiliyordum suyun altında. Renkli balıklar etrafımda dans ediyordu. Her şey o kadar huzurluydu.',
    contentEn: 'I could breathe underwater. Colorful fish were dancing around me. Everything was so peaceful.',
    date: '2025-01-11',
    type: 'normal',
    emotions: ['peace', 'wonder', 'joy'],
    clarity: 4,
    lucidity: 40,
    tags: ['deniz', 'balıklar', 'yüzme'],
    symbols: ['su', 'balıklar', 'mercan'],
    isStarred: true,
    aiAnalysis: 'Su genellikle duyguları simgeler. Bu rüya, duygusal dengenizi ve iç huzurunuzu yansıtıyor.',
    aiAnalysisEn: 'Water often symbolizes emotions. This dream reflects your emotional balance and inner peace.'
  },
  {
    id: 'dream-6',
    title: 'Yarının Haberi',
    titleEn: 'Tomorrow\'s News',
    content: 'Gazete okuyordum ve yarının tarihini taşıyordu. Manşette tanıdık bir isim vardı.',
    contentEn: 'I was reading a newspaper and it had tomorrow\'s date. There was a familiar name in the headline.',
    date: '2025-01-10',
    type: 'prophetic',
    emotions: ['wonder', 'confusion'],
    clarity: 3,
    lucidity: 15,
    tags: ['gelecek', 'gazete', 'önsezi'],
    symbols: ['gazete', 'tarih', 'isim'],
    isStarred: true,
    aiAnalysis: 'Kehanet rüyaları nadirdir. Bu detayları not etmeniz önerilir.',
    aiAnalysisEn: 'Prophetic dreams are rare. It is recommended to note these details.'
  }
]

export const MOCK_STATS: DreamStats = {
  totalDreams: 47,
  lucidDreams: 12,
  lucidPercentage: 25.5,
  avgClarity: 3.8,
  streakDays: 7,
  weeklyActivity: [
    { day: 'Pzt', dayEn: 'Mon', count: 8 },
    { day: 'Sal', dayEn: 'Tue', count: 6 },
    { day: 'Çar', dayEn: 'Wed', count: 9 },
    { day: 'Per', dayEn: 'Thu', count: 5 },
    { day: 'Cum', dayEn: 'Fri', count: 7 },
    { day: 'Cmt', dayEn: 'Sat', count: 6 },
    { day: 'Paz', dayEn: 'Sun', count: 6 }
  ],
  emotionDistribution: [
    { emotion: 'wonder', count: 18 },
    { emotion: 'peace', count: 14 },
    { emotion: 'joy', count: 12 },
    { emotion: 'fear', count: 8 },
    { emotion: 'confusion', count: 6 },
    { emotion: 'anxiety', count: 5 },
    { emotion: 'love', count: 4 },
    { emotion: 'neutral', count: 3 }
  ],
  typeDistribution: [
    { type: 'normal', count: 20 },
    { type: 'lucid', count: 12 },
    { type: 'symbolic', count: 8 },
    { type: 'recurring', count: 4 },
    { type: 'nightmare', count: 2 },
    { type: 'prophetic', count: 1 }
  ]
}

/**
 * Rüya ID'sine göre rüya getir
 */
export function getDreamById(id: string): DreamEntry | undefined {
  return MOCK_DREAMS.find(d => d.id === id)
}

/**
 * Tarihe göre formatla
 */
export function formatDreamDate(dateStr: string, language: 'tr' | 'en'): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'short'
  })
}

/**
 * Metni kısalt
 */
export function truncateDreamContent(text: string, maxLength: number = 80): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
