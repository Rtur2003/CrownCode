import { useId, useState } from 'react'
import { site } from '../../data/site.js'
import { contactPage } from '../../data/content.js'
import { images } from '../../data/images.js'
import { buildMailtoLink } from '../../utils/links.js'

// "Bulun / Yazın": sol kolon mekânı bulmaya, sağ kolon yazmaya adanır.
export default function ContactSplit() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  // Desen id'si benzersiz olmalı — sabit id başka bir <defs> ile çakışabilir.
  const patternId = `streets-${useId()}`

  const onSubmit = (e) => {
    e.preventDefault()
    window.location.href = buildMailtoLink(site.email, {
      subject: `${contactPage.mailSubject} — ${form.name}`,
      body: `${form.message}\n\n${form.name}\n${form.email}`,
    })
    // mailto: gezinmesi sessizce başarısız olabilir (istemci tanımlı değilse).
    setSent(true)
  }

  const inputCls =
    'w-full bg-transparent border-b border-noir-border focus:border-noir-accent outline-none py-3 font-body text-base text-noir-text placeholder:text-noir-text/55 transition-colors'

  const mapsHref = `https://maps.google.com/?q=${encodeURIComponent(`${site.address.line1} ${site.address.line2}`)}`

  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-[5vw] px-6 lg:px-16 pb-20 lg:pb-32">
      {/* ── Sol: Bulun ── */}
      <div className="relative">
        <span className="watermark hidden lg:block text-[16vw] -left-8 -top-10" aria-hidden="true">&amp;</span>

        {/* Görsel + üzerine taşan adres */}
        <div className="relative">
          <div className="wash w-[65%] h-[55%] -left-2 top-[18%]" aria-hidden="true" />
          <div className="duotone relative z-10 w-[88%] h-[30vh] lg:h-[36vh] overflow-hidden">
            <img src={images.contact} alt="" loading="lazy" className="w-full h-full object-cover" />
          </div>
          {/* Editoryal metin plakası: görsele bilinçli taşar, kontrast garanti */}
          <div className="relative z-20 -mt-10 lg:-mt-14 ml-4 lg:ml-8 inline-block bg-noir-bg px-5 py-4 border border-noir-accent/30 shadow-[0_20px_60px_rgba(14,12,9,0.7)]">
            <p className="font-display text-[clamp(1.7rem,2.6vw,2.6rem)] leading-[1.12] text-noir-text">
              {site.address.line1}
            </p>
            <p className="font-display italic text-lg lg:text-xl text-noir-accent mt-1">
              {site.address.line2}
            </p>
          </div>
        </div>

        <p className="font-body text-sm text-noir-text/60 leading-relaxed mt-6 max-w-md">
          {contactPage.note}
        </p>

        {/* Servis saatleri — adresin doğal devamı */}
        <div className="mt-8">
          <h2 className="text-xs tracking-[0.4em] uppercase text-noir-accent font-body mb-4">
            {contactPage.hoursTitle}
          </h2>
          <ul>
            {site.hours.map(({ days, time }) => (
              <li key={days} className="flex items-baseline gap-3 border-b border-noir-border py-2.5">
                <span className="font-display text-lg">{days}</span>
                <span className="flex-1 border-b border-dotted border-noir-text/15 mb-1.5" aria-hidden="true" />
                <span className="font-body text-sm text-noir-text/60 tabular-nums shrink-0">{time}</span>
              </li>
            ))}
          </ul>
          <p className="font-display italic text-sm text-noir-text/60 mt-3">{contactPage.hoursNote}</p>
        </div>

        {/* Harita kartı */}
        <a
          href={mapsHref}
          target="_blank"
          rel="noreferrer"
          data-cursor="Yol Tarifi"
          className="group relative block h-44 lg:h-52 mt-8 overflow-hidden border border-noir-border bg-noir-surface/30 transition-colors duration-500 hover:border-noir-accent/50"
        >
          <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
            <defs>
              <pattern id={patternId} width="72" height="72" patternUnits="userSpaceOnUse">
                <path d="M0 36h72M36 0v72" stroke="#F2E9DA" strokeOpacity="0.06" strokeWidth="1" />
                <path d="M0 12h72M12 0v72" stroke="#F2E9DA" strokeOpacity="0.03" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            <path d="M0 140 Q 180 100 380 150 T 800 120" fill="none" stroke="#F2E9DA" strokeOpacity="0.08" strokeWidth="12" />
          </svg>
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
            <span className="absolute -inset-4 rounded-full bg-noir-accent/20 animate-ping [animation-duration:2.4s]" />
            <span className="absolute -inset-8 rounded-full border border-noir-accent/20" />
            <span className="relative block w-3 h-3 rotate-45 bg-noir-accent" />
          </span>
          <span className="absolute bottom-3 right-4 font-body text-xs tracking-[0.25em] uppercase text-noir-accent group-hover:translate-x-1 transition-transform duration-300">
            {contactPage.directionsCta} <span aria-hidden="true">→</span>
          </span>
        </a>
      </div>

      {/* ── Sağ: Yazın ── */}
      <div className="mt-14 lg:mt-0">
        <h2 className="font-display text-4xl lg:text-6xl mb-3">{contactPage.formTitle}</h2>
        <p className="font-display italic text-noir-text/50 mb-8 lg:mb-10 max-w-md">
          {contactPage.formNote}
        </p>

        <form onSubmit={onSubmit} className="space-y-7 max-w-md">
          <div>
            <label htmlFor="c-name" className="block font-body text-xs tracking-[0.3em] uppercase text-noir-text/50 mb-1">
              {contactPage.labels.name}
            </label>
            <input id="c-name" type="text" required autoComplete="name" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label htmlFor="c-email" className="block font-body text-xs tracking-[0.3em] uppercase text-noir-text/50 mb-1">
              {contactPage.labels.email}
            </label>
            <input id="c-email" type="email" required autoComplete="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label htmlFor="c-message" className="block font-body text-xs tracking-[0.3em] uppercase text-noir-text/50 mb-1">
              {contactPage.labels.message}
            </label>
            <textarea id="c-message" required rows={4} value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className={`${inputCls} resize-none`} />
          </div>
          <button
            type="submit"
            data-cursor="Gönder"
            className="px-8 h-14 border border-noir-accent text-noir-accent font-body text-sm tracking-[0.2em] uppercase hover:bg-noir-accent hover:text-noir-bg transition-colors duration-300"
          >
            {contactPage.labels.send}
          </button>

          {sent && (
            <p role="status" className="font-display italic text-noir-accent max-w-md">
              {contactPage.sentNote}
            </p>
          )}
        </form>

        {/* Doğrudan hat */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-10 pt-8 border-t border-noir-border">
          <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="font-display text-xl text-noir-text hover:text-noir-accent transition-colors">
            {site.phone}
          </a>
          <a href={`mailto:${site.email}`} className="font-body text-sm text-noir-text/60 hover:text-noir-accent transition-colors">
            {site.email}
          </a>
          {site.socials.map(({ label, url }) => (
            <a key={label} href={url} target="_blank" rel="noreferrer" className="font-body text-sm tracking-widest uppercase text-noir-text/60 hover:text-noir-accent transition-colors">
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
