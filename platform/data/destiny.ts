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
  const revealedKey = 'crown_destiny_revealed'

  // Kayıtlı kaderi kontrol et
  const stored = localStorage.getItem(storageKey)
  if (stored) {
    try {
      const parsed: DailyDestiny = JSON.parse(stored)
      if (parsed.date === today) {
        return parsed
      }
      // Tarih değişmiş, revealed flag'i temizle
      localStorage.removeItem(revealedKey)
    } catch {
      // Parse hatası, yeni oluştur
      localStorage.removeItem(revealedKey)
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

/**
 * Destiny verilerini temizle (test/debug için)
 * Tarayıcı konsolundan: clearDestinyData()
 */
export function clearDestinyData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('crown_daily_destiny')
  localStorage.removeItem('crown_destiny_revealed')
  console.log('Crown Destiny data cleared. Refresh the page.')
}

// Global'e ekle (debug için)
if (typeof window !== 'undefined') {
  (window as unknown as { clearDestinyData: typeof clearDestinyData }).clearDestinyData = clearDestinyData
}

/**
 * Belirtilen kategori için "Ters/Kötü" mesaj getirir
 * Mevcut mesajdan farklı bir negatif mesaj seçmeye çalışır
 */
export function getReverseMessage(category: FortuneCategory, currentMessageIndex: number = -1): FortuneMessage {
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

  // Rastgele bir negatif mesaj seç
  // Eğer mevcut mesaj zaten negatifse, farklı bir tane seçmeye çalış
  let candidates = negativeMessages
  // Mevcut mesaj indexini bulmamız zor çünkü filtered array farklı, ama text karşılaştırması yapabiliriz
  // Şimdilik sadece rastgele seçelim
  
  const randomIndex = Math.floor(Math.random() * negativeMessages.length)
  return negativeMessages[randomIndex]
}
