// 'YYYY-MM-DD' → 'DD.MM.YYYY' (rezervasyon mesajlarında TR gösterim)
function toTrDate(isoDate) {
  const [y, m, d] = isoDate.split('-')
  return `${d}.${m}.${y}`
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
