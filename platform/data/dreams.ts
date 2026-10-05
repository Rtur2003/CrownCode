/**
 * Sample entries for the Crown Dreams journal.
 *
 * These are written for the page, not taken from anyone's journal: the page
 * says so next to them. Nothing the visitor writes in the analyzer is added here.
 */

import type { DreamEmotion } from '@/hooks/useDreamAnalysis'

export type DreamType = 'normal' | 'lucid' | 'nightmare' | 'recurring' | 'symbolic'

export const DREAM_TYPES: readonly DreamType[] = ['lucid', 'normal', 'nightmare', 'symbolic', 'recurring']

export const DREAM_TYPE_LABELS: Record<DreamType, { tr: string; en: string }> = {
  normal: { tr: 'Sıradan', en: 'Ordinary' },
  lucid: { tr: 'Lüsid', en: 'Lucid' },
  nightmare: { tr: 'Kabus', en: 'Nightmare' },
  recurring: { tr: 'Tekrar eden', en: 'Recurring' },
  symbolic: { tr: 'Simgesel', en: 'Symbolic' },
}

export interface DreamEntry {
  id: string
  title: string
  titleEn: string
  content: string
  contentEn: string
  type: DreamType
  emotions: DreamEmotion[]
  /** 1 to 5: how much of it was still there on waking. */
  clarity: number
  /** 0 to 100: how aware the dreamer was of dreaming. */
  lucidity: number
  /** Minutes the dream seemed to last. */
  duration: number
  symbols: string[]
  symbolsEn: string[]
  reading: string
  readingEn: string
}

export const SAMPLE_DREAMS: DreamEntry[] = [
  {
    id: 'extra-room',
    title: 'Ek oda',
    titleEn: 'The extra room',
    content:
      'Evimde dolabın arkasında hiç görmediğim bir kapı buluyorum. Açınca koridor, koridorun sonunda da boş odalar çıkıyor. Çok seviniyorum, sonra bu odaların kirasını nasıl ödeyeceğimi düşünmeye başlıyorum ve içim daralıyor.',
    contentEn:
      'Behind the wardrobe in my flat there is a door I have never seen. It opens onto a corridor, and the corridor onto empty rooms. I am delighted, and then I start working out how I would pay rent on them and my chest tightens.',
    type: 'recurring',
    emotions: ['wonder', 'anxiety'],
    clarity: 4,
    lucidity: 10,
    duration: 20,
    symbols: ['gizli kapı', 'boş odalar', 'kira'],
    symbolsEn: ['hidden door', 'empty rooms', 'rent'],
    reading:
      'Fark edilmemiş bir oda, kullanılmayan bir imkânı anlatan yaygın bir imgedir. Yanındaki kira kaygısı da o imkânın bir bedeli olduğunu düşündürüyor olabilir.',
    readingEn:
      'A room nobody noticed is a common picture for room to grow that has gone unused. The rent worry beside it may be the cost you expect that room to carry.',
  },
  {
    id: 'missed-train',
    title: 'Kaçan tren',
    titleEn: 'The missed train',
    content:
      'Gardayım ve elimdeki bilet başka bir şehre ait. Tren kalkıyor, ben peronda kalıyorum. Etraftaki herkes telefonuna bakıyor. Garip biçimde rahatım, bir sonraki treni bekliyorum.',
    contentEn:
      'I am at a station and my ticket is for a different city. The train pulls out and I stay on the platform. Everyone around me is looking at their phones. Strangely, I feel calm and wait for the next one.',
    type: 'normal',
    emotions: ['peace', 'confusion'],
    clarity: 3,
    lucidity: 0,
    duration: 10,
    symbols: ['tren', 'yanlış bilet', 'peron'],
    symbolsEn: ['train', 'wrong ticket', 'platform'],
    reading:
      'Treni kaçırmak genelde telaşla bağlanır; burada telaş yok. Bu, bir şeyin kaçmasına rağmen rahat kalabildiğini gösteriyor olabilir.',
    readingEn:
      'Missing a train usually comes with panic, and here there is none. It may point to being able to stay calm even when something has already gone.',
  },
  {
    id: 'blank-exam',
    title: 'Boş sınav kâğıdı',
    titleEn: 'The blank exam paper',
    content:
      'Çalışmadığım bir final sınavındayım. Kâğıt bembeyaz, sorular okuyamadığım bir yazıyla yazılmış. Kalemim tam yazmaya başlarken bitiyor, salondaki herkes yazıyor.',
    contentEn:
      'I am sitting a final I never studied for. The paper is blank and the questions are in handwriting I cannot read. My pen runs dry just as I start, and everyone else in the hall is writing.',
    type: 'nightmare',
    emotions: ['fear', 'shame'],
    clarity: 5,
    lucidity: 0,
    duration: 15,
    symbols: ['sınav', 'boş kâğıt', 'biten kalem'],
    symbolsEn: ['exam', 'blank paper', 'dry pen'],
    reading:
      'Hazırlıksız girilen sınav, değerlendirilme kaygısının en sık görülen rüya biçimlerinden biri. Okunamayan sorular, beklentinin ne olduğunu bilmemekle de ilgili olabilir.',
    readingEn:
      'An exam you did not prepare for is one of the most common shapes that worry about being judged takes. The unreadable questions may be about not knowing what is expected.',
  },
  {
    id: 'too-many-lines',
    title: 'Elimdeki çizgiler',
    titleEn: 'Too many lines on my hand',
    content:
      'İskelede yürürken avucumdaki çizgilerin fazla olduğunu fark ediyorum ve rüya gördüğümü anlıyorum. Bir tabelayı iki kez okuyorum, yazı değişiyor. Uçmaya karar veriyorum ama ancak bir metre kadar havalanabiliyorum. Yine de çok güzel.',
    contentEn:
      'Walking along a pier I notice my palm has too many lines, and I realise I am dreaming. I read a sign twice and the words change. I decide to fly but only manage to hover about a metre up. It is wonderful anyway.',
    type: 'lucid',
    emotions: ['joy', 'wonder'],
    clarity: 5,
    lucidity: 80,
    duration: 25,
    symbols: ['el çizgileri', 'tabela', 'iskele'],
    symbolsEn: ['palm lines', 'sign', 'pier'],
    reading:
      'El ve yazı, lüsid rüya araştırmalarında gerçeklik kontrolü olarak sık anılır; ikisi de rüyada tutarsız davranır. Bir metrelik uçuş, kontrolün henüz kısmi olduğunu gösteriyor.',
    readingEn:
      'Hands and text are the classic reality checks in lucid dreaming, because both behave inconsistently in a dream. The one-metre flight fits control that is still partial.',
  },
  {
    id: 'grandfathers-house',
    title: 'Dedemin evi',
    titleEn: "Grandfather's house",
    content:
      'Ev tıpkı hatırladığım gibi ama bahçe yerine deniz var. Dedem sofrada oturuyor ve bana bir kaşık uzatıyor. Ne söylediğini duyamıyorum, ama ne demek istediğini biliyorum.',
    contentEn:
      'The house is exactly as I remember it, except the garden is the sea. My grandfather sits at the table and holds out a spoon to me. I cannot hear what he says, but I know what he means.',
    type: 'symbolic',
    emotions: ['love', 'nostalgia'],
    clarity: 4,
    lucidity: 5,
    duration: 30,
    symbols: ['çocukluk evi', 'deniz', 'kaşık'],
    symbolsEn: ['childhood house', 'sea', 'spoon'],
    reading:
      'Çocukluk evinde değişen bir ayrıntı, hatıranın şimdiki duyguyla yeniden kurulduğunu gösterir. Duyulmayan ama anlaşılan söz, kayıp bir kişiyle kalan bağı anlatıyor olabilir.',
    readingEn:
      'One altered detail in a childhood home shows memory being rebuilt around a present feeling. Words that are understood without being heard may stand for a bond that outlasts the person.',
  },
  {
    id: 'loose-tooth',
    title: 'Toplantıda diş',
    titleEn: 'A tooth in the meeting',
    content:
      'Toplantıda konuşurken bir dişim ufalanıyor. Ağzımdan kum gibi dökülüyor ama kimse fark etmiyor, ben de konuşmaya devam ediyorum.',
    contentEn:
      'I am speaking in a meeting when a tooth crumbles. It runs out of my mouth like sand and nobody notices, so I carry on talking.',
    type: 'nightmare',
    emotions: ['anxiety', 'shame'],
    clarity: 4,
    lucidity: 0,
    duration: 5,
    symbols: ['diş', 'kum', 'toplantı'],
    symbolsEn: ['tooth', 'sand', 'meeting'],
    reading:
      'Diş dökülmesi, en sık raporlanan rüya temalarından biri ve genellikle kontrol kaybı ya da başkalarının önünde bozulma korkusuyla ilişkilendirilir. Kimsenin fark etmemesi, kaygının kendi içinde kaldığını düşündürebilir.',
    readingEn:
      'Losing teeth is one of the most commonly reported dream themes and is usually linked to loss of control or fear of falling apart in front of others. That nobody notices suggests the worry stays inside you.',
  },
]
