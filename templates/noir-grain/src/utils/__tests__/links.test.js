import { describe, it, expect } from 'vitest'
import { buildWhatsAppLink, buildMailtoLink } from '../links.js'

describe('buildWhatsAppLink', () => {
  const form = {
    name: 'Arda Yılmaz',
    phone: '0532 111 22 33',
    date: '2026-08-12',
    time: '20:00',
    guests: 4,
    note: 'Pencere kenarı',
  }

  it('wa.me tabanlı, numarası temizlenmiş link üretir', () => {
    const link = buildWhatsAppLink('902120000000', form)
    expect(link.startsWith('https://wa.me/902120000000?text=')).toBe(true)
  })

  it('numaradaki + ve boşlukları temizler', () => {
    const link = buildWhatsAppLink('+90 212 000 00 00', form)
    expect(link.startsWith('https://wa.me/902120000000?text=')).toBe(true)
  })

  it('mesaj Türkçe alan adlarını ve TR tarih formatını içerir', () => {
    const link = buildWhatsAppLink('902120000000', form)
    const text = decodeURIComponent(link.split('text=')[1])
    expect(text).toContain('Ad: Arda Yılmaz')
    expect(text).toContain('Tarih: 12.08.2026')
    expect(text).toContain('Saat: 20:00')
    expect(text).toContain('Kişi: 4')
    expect(text).toContain('Not: Pencere kenarı')
  })

  it('not boşsa Not satırı eklenmez', () => {
    const link = buildWhatsAppLink('902120000000', { ...form, note: '' })
    const text = decodeURIComponent(link.split('text=')[1])
    expect(text).not.toContain('Not:')
  })

  it('özel karakterler URL için doğru kodlanır', () => {
    const link = buildWhatsAppLink('902120000000', { ...form, note: 'Doğum günü & sürpriz' })
    expect(link).not.toContain(' ')
    expect(link).toContain('%26')
  })
})

describe('buildMailtoLink', () => {
  it('subject ve body kodlanmış mailto üretir', () => {
    const link = buildMailtoLink('a@b.com', { subject: 'Merhaba Dünya', body: 'Satır 1\nSatır 2' })
    expect(link.startsWith('mailto:a@b.com?')).toBe(true)
    expect(link).toContain('subject=Merhaba%20D%C3%BCnya')
    expect(link).toContain('body=Sat%C4%B1r%201%0ASat%C4%B1r%202')
  })
})
