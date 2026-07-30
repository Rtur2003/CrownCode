// ─────────────────────────────────────────────────────────────
// ŞABLON ÖZELLEŞTİRME: Restoran bilgilerinizi buradan değiştirin.
// Bu dosya dışında hiçbir bileşende iletişim bilgisi yoktur.
// ─────────────────────────────────────────────────────────────
export const site = {
  name: 'Noir & Grain',
  tagline: 'Fine Dining & Kokteyl Bar',
  phone: '+90 212 000 00 00',
  // WhatsApp: uluslararası format, boşluksuz, + işaretsiz
  whatsapp: '902120000000',
  email: 'merhaba@noirgrain.com',
  address: {
    line1: 'Karaköy Mah., Bankalar Cd. No:12',
    line2: 'Beyoğlu, İstanbul',
  },
  // Not: Harita gömülü iframe ile değil, yukarıdaki adresten üretilen bir
  // "yol tarifi" bağlantısıyla verilir (üçüncü taraf çerezi ve ek yük yok).
  hours: [
    { days: 'Salı – Perşembe', time: '18:00 – 00:00' },
    { days: 'Cuma – Cumartesi', time: '18:00 – 02:00' },
    { days: 'Pazar', time: '17:00 – 23:00' },
  ],
  // Rezervasyon formunda sunulan saat seçenekleri
  reservationTimes: ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'],
  socials: [
    { label: 'Instagram', url: 'https://instagram.com/noirgrain' },
    { label: 'X', url: 'https://x.com/noirgrain' },
  ],
}
