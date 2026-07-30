// 'YYYY-MM-DD' → 'DD.MM.YYYY' (rezervasyon mesajlarında ve canlı not
// kartında TR gösterim). Boş/eksik değerde boş string döner — form
// doldurulurken kart "undefined.undefined.undefined" göstermesin.
export function toTrDate(isoDate) {
  if (!isoDate) return ''
  return isoDate.split('-').reverse().join('.')
}

export function buildWhatsAppLink(whatsappNumber, form) {
  const number = whatsappNumber.replace(/[^\d]/g, '')
  const lines = [
    'Merhaba, rezervasyon yapmak istiyorum.',
    `Ad: ${form.name}`,
    `Tarih: ${toTrDate(form.date)}`,
    `Saat: ${form.time}`,
    `Kişi: ${form.guests}`,
  ]
  if (form.note && form.note.trim()) lines.push(`Not: ${form.note.trim()}`)
  return `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`
}

export function buildMailtoLink(email, { subject, body }) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
