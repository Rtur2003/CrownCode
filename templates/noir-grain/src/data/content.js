// ─────────────────────────────────────────────────────────────
// ŞABLON ÖZELLEŞTİRME: Tüm sayfa metinleri burada.
// Fasıl yapısı: site bir tadım menüsü gibi sıralı "fasıllara" bölünür.
// ─────────────────────────────────────────────────────────────
export const nav = [
  { to: '/menu', label: 'Menü' },
  { to: '/rezervasyon', label: 'Rezervasyon' },
  { to: '/iletisim', label: 'İletişim' },
]

// Gezinme landmark etiketleri — sayfada iki <nav> var, ayırt edilebilmeli
export const navLabels = {
  main: 'Ana gezinme',
  mobile: 'Alt gezinme',
}

// Mobil alt bar: nav öğelerinin yanına eklenen doğrudan arama eylemi
export const mobileBar = {
  call: 'Ara',
}

export const hero = {
  eyebrow: 'İstanbul · Karaköy',
  title: 'Noir & Grain',
  subtitle: 'Karanlık, tahıl ve ateş. Yedi fasıllık bir gece.',
  scrollHint: 'Servis başlıyor',
}

// Ana sayfa yatay yolculuğunun fasılları (ServiceRail bunları izler)
export const chapters = [
  { id: 'imza', numeral: 'I', label: 'İmza' },
  { id: 'hikaye', numeral: 'II', label: 'Hikaye' },
  { id: 'davet', numeral: 'III', label: 'Davet' },
]

export const signature = {
  eyebrow: 'Fasıl I',
  title: 'İmza',
  note: 'Şefin masasından üç tabak.',
}

export const story = {
  eyebrow: 'Fasıl II',
  title: 'Hikaye',
  statement: 'Ateş sabırla, tahıl zamanla konuşur.',
  paragraphs: [
    'Noir & Grain, Karaköy\'ün taş duvarları arasında iki tutkunun buluşmasıdır: kömür ateşinin karanlığı ve ekşi maya tahılın sabrı.',
    'Menümüz mevsimle birlikte yedi fasılda döner; her tabak, İstanbul\'un pazarlarından o hafta ne geldiyse onunla kurulur.',
  ],
}

export const invite = {
  eyebrow: 'Fasıl III',
  // İki satır olarak dizilir; ikinci satır altın italik vurguyla ayrışır.
  titleLines: ['Masanızı', 'Ayırın'],
  note: 'Geceyi bizimle açın — masanız hazır olsun.',
  cta: 'Rezervasyon',
}

export const menuPage = {
  eyebrow: 'Tadım Menüsü',
  title: 'Menü',
  note: 'Mevsimle dönen fasıllar. Fiyatlar TL\'dir.',
}

export const reservation = {
  eyebrow: 'Rezervasyon',
  title: 'Masanızı Ayırın',
  steps: {
    guests: { question: 'Kaç kişisiniz?', hint: 'Daha kalabalık gruplar için bizi arayın.' },
    date: { question: 'Hangi gece?', hint: 'Pazartesi kapalıyız.' },
    time: { question: 'Saat kaçta?', hint: 'Son servis 22:00.' },
    contact: { question: 'Sizi kim bekliyor olacak?', hint: 'Ad ve telefon yeterli.' },
    note: { question: 'Eklemek istediğiniz bir not var mı?', hint: 'Alerjiler, kutlamalar, pencere kenarı…' },
  },
  labels: {
    name: 'Ad Soyad', phone: 'Telefon', note: 'Notunuz (opsiyonel)',
    back: 'Geri', next: 'Devam', submit: 'Rezervasyonu Tamamla',
    sendEmail: 'E-posta ile gönder',
    chapter: 'Fasıl',
  },
  // Mühürlenme (gönderim) ekranı
  sealing: 'Masanız adınıza ayrılıyor…',
  successTitle: 'Masanız adınıza ayrılıyor.',
  // {name} / {date} / {time} yer tutucuları form değerleriyle doldurulur.
  successBody: 'Sayın {name}, {date} tarihinde saat {time} için talebiniz WhatsApp üzerinden iletildi. Onay için sizinle iletişime geçeceğiz.',
}

export const marqueeItems = [
  'Noir & Grain', 'Karaköy', 'Tadım Menüsü', 'Kömür Ateşi', 'Ekşi Maya', 'Kokteyl Bar',
]

export const contactPage = {
  eyebrow: 'İletişim',
  title: 'Bizi Bulun',
  note: 'Karaköy\'ün taş sokaklarında, Bankalar Caddesi\'nin hemen üzerinde.',
  hoursTitle: 'Servis Saatleri',
  hoursNote: 'Pazartesi kapalıyız.',
  formTitle: 'Bize Yazın',
  formNote: 'Özel davet, etkinlik ve iş birlikleri için — aynı gün dönüş yapıyoruz.',
  labels: { name: 'Ad Soyad', email: 'E-posta', message: 'Mesajınız', send: 'Gönder' },
  mailSubject: 'Web sitesi üzerinden mesaj',
  directionsCta: 'Yol Tarifi Al',
  // Form backend'siz çalışır: mesaj kullanıcının e-posta istemcisinde açılır.
  sentNote: 'E-posta istemciniz mesajınızla birlikte açıldı. Açılmadıysa doğrudan aşağıdaki adrese yazabilirsiniz.',
}

export const footer = {
  rights: 'Tüm hakları saklıdır.',
}

export const notFound = {
  eyebrow: 'Fasıl bulunamadı',
  title: 'Bu masa boş.',
  body: 'Aradığınız sayfa kaldırılmış ya da adresi değişmiş olabilir. Sizi salona geri alalım.',
  homeCta: 'Ana sayfaya dön',
}
