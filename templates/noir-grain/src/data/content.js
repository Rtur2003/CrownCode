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
  subtitle: 'Yedi fasıllık tadım menüsü ve kokteyl bar.',
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
  statement: 'Ekmek her sabah dörtte yoğuruluyor, ateş altıda yakılıyor.',
  paragraphs: [
    'Bankalar Caddesi\'ndeki eski bir tahıl deposunda, 2019\'dan beri aynı yerdeyiz. Mutfakta tek ısı kaynağımız kömür.',
    'Menü mevsimle değişiyor. Her fasıl, o hafta pazardan ne geldiyse ona göre kuruluyor.',
  ],
}

export const invite = {
  eyebrow: 'Fasıl III',
  // İki satır olarak dizilir; ikinci satır altın italik vurguyla ayrışır.
  titleLines: ['Masanızı', 'Ayırın'],
  note: 'On iki masamız var. Aynı gün rezervasyon için telefonla arayın.',
  cta: 'Rezervasyon',
}

export const menuPage = {
  title: 'Tadım Menüsü',
  note: 'Fiyatlar TL\'dir. Menü mevsimle değişir.',
}

export const reservation = {
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
  sealing: 'Notunuz hazırlanıyor…',
  // Dürüstlük: WhatsApp mesajı yalnızca HAZIRLANIR, göndermeyi kullanıcı yapar.
  // Eski metin "iletildi" diyordu; gönderilmemiş talep için yanlış bilgiydi.
  successTitle: 'Notunuz WhatsApp\'ta hazır.',
  // {name} / {date} / {time} form değerleriyle doldurulur.
  successBody: '{date}, saat {time}, {name} adına. Mesajı WhatsApp\'tan göndermeniz yeterli; onayı biz döneceğiz.',
}

export const marqueeItems = [
  'Noir & Grain', 'Karaköy', 'Tadım Menüsü', 'Kömür Ateşi', 'Ekşi Maya', 'Kokteyl Bar',
]

export const contactPage = {
  title: 'Bizi Bulun',
  note: 'Karaköy\'ün taş sokaklarında, Bankalar Caddesi\'nin hemen üzerinde.',
  hoursTitle: 'Servis Saatleri',
  hoursNote: 'Pazartesi kapalıyız.',
  formTitle: 'Bize Yazın',
  formNote: 'Etkinlik ve özel davetler için yazın. Aynı gün dönüyoruz.',
  labels: { name: 'Ad Soyad', email: 'E-posta', message: 'Mesajınız', send: 'Gönder' },
  mailSubject: 'Web sitesi üzerinden mesaj',
  directionsCta: 'Yol Tarifi Al',
  // Backend yok: mesaj kullanıcının e-posta istemcisinde açılır.
  sentNote: 'Mesajınız e-posta istemcinizde açıldı. Açılmadıysa aşağıdaki adrese yazabilirsiniz.',
}

export const footer = {
  rights: 'Tüm hakları saklıdır.',
}

export const notFound = {
  title: 'Böyle bir sayfa yok.',
  body: 'Adres değişmiş ya da bağlantı eski olabilir.',
  homeCta: 'Ana sayfaya dön',
}
