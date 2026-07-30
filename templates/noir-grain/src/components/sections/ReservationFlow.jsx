import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { site } from '../../data/site.js'
import { reservation } from '../../data/content.js'
import { images } from '../../data/images.js'
import { buildWhatsAppLink, buildMailtoLink, toTrDate } from '../../utils/links.js'
import { getMediaCapability } from '../../hooks/useMediaCapability.js'

gsap.registerPlugin(useGSAP)

// "Şefin Masası": sol tarafta adımlar, sağda siz cevapladıkça canlı
// yazılan not kartı — son adımda kart mühürlenip gönderilir.
const STEPS = ['guests', 'date', 'time', 'contact', 'note']
const STEP_FIELDS = {
  guests: ['guests'],
  date: ['date'],
  time: ['time'],
  contact: ['name', 'phone'],
  note: ['note'],
}

const todayIso = () => new Date().toISOString().slice(0, 10)

const schema = z.object({
  guests: z.number().min(1, 'Lütfen kişi sayısını seçin.').max(12, '1 ile 12 arasında kişi sayısı seçin.'),
  date: z.string()
    .min(1, 'Lütfen bir tarih seçin.')
    .refine(v => v >= todayIso(), 'Geçmiş bir tarih seçilemez.'),
  time: z.string().min(1, 'Lütfen bir saat seçin.'),
  name: z.string().min(2, 'Lütfen adınızı girin.'),
  phone: z.string().refine(
    v => /^(?:\+?90|0)?5\d{9}$/.test(v.replace(/[\s()-]/g, '')),
    'Geçerli bir cep telefonu girin (örn. 05xx xxx xx xx).'
  ),
  note: z.string().optional(),
})

// Canlı not kartı — boş alanlar zarif noktalı çizgi olarak bekler
function NoteCard({ values, sealed }) {
  const line = (label, value) => (
    <span className="flex items-baseline gap-2 font-display italic text-lg leading-loose">
      <span className="opacity-50 shrink-0">{label}</span>
      {value ? (
        <span>{value}</span>
      ) : (
        <span className="flex-1 border-b border-dotted border-noir-bg/30 translate-y-[-0.3em]" aria-hidden="true" />
      )}
    </span>
  )

  return (
    <div className="relative bg-noir-text text-noir-bg p-7 rotate-1 shadow-2xl w-full max-w-sm">
      <p lang="en" className="font-display tracking-[0.25em] uppercase text-sm mb-4 opacity-60">
        {site.name}
      </p>
      {line('Ad', values.name)}
      {line('Tarih', toTrDate(values.date))}
      {line('Saat', values.time)}
      {line('Kişi', values.guests > 0 ? String(values.guests) : '')}
      {values.note?.trim() ? line('Not', values.note.trim()) : null}

      {/* Mühür: gönderimde marka amblemi mum mührü gibi damgalanır */}
      <span
        className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-noir-wine flex items-center justify-center shadow-lg ${
          sealed ? 'seal-stamp' : 'scale-0'
        }`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 32" className="w-8 h-8">
          <g fill="#C89B5A" stroke="#C89B5A">
            <circle cx="16" cy="16" r="13.2" fill="none" strokeWidth="1" />
            <path d="M16 25.4V9.4" fill="none" strokeWidth="1.1" strokeLinecap="round" />
            <ellipse cx="16" cy="9.4" rx="1.3" ry="3.1" stroke="none" />
            <ellipse cx="0" cy="0" rx="1.35" ry="2.9" stroke="none" transform="translate(18.4 13.3) rotate(32)" />
            <ellipse cx="0" cy="0" rx="1.35" ry="2.9" stroke="none" transform="translate(13.6 13.3) rotate(-32)" />
            <ellipse cx="0" cy="0" rx="1.35" ry="2.9" stroke="none" transform="translate(18.4 17.2) rotate(32)" />
            <ellipse cx="0" cy="0" rx="1.35" ry="2.9" stroke="none" transform="translate(13.6 17.2) rotate(-32)" />
            <ellipse cx="0" cy="0" rx="1.35" ry="2.9" stroke="none" transform="translate(18.4 21.1) rotate(32)" />
            <ellipse cx="0" cy="0" rx="1.35" ry="2.9" stroke="none" transform="translate(13.6 21.1) rotate(-32)" />
            <path d="M13 26.2h6" fill="none" strokeWidth="1.1" strokeLinecap="round" />
          </g>
        </svg>
      </span>
    </div>
  )
}

export default function ReservationFlow() {
  const [stepIdx, setStepIdx] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const panelRef = useRef(null)
  const successRef = useRef(null)

  const step = STEPS[stepIdx]
  const isLast = stepIdx === STEPS.length - 1
  const { labels, steps: stepCopy } = reservation

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { guests: 0, date: '', time: '', name: '', phone: '', note: '' },
  })

  const formValues = watch()

  // Adım geçiş animasyonu
  useGSAP(() => {
    const { reducedMotion } = getMediaCapability()
    if (reducedMotion || !panelRef.current) return
    gsap.fromTo(
      panelRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }
    )
  }, { dependencies: [stepIdx], scope: panelRef })

  // Başarı ekranı animasyonu
  useGSAP(() => {
    if (!sent || !successRef.current) return
    const tl = gsap.timeline()
    tl.fromTo('.success-ring', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: 'power4.out' })
      .fromTo('.success-text', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, '-=0.4')
  }, { dependencies: [sent], scope: successRef })

  const setVal = (field, value) => {
    setValue(field, value, { shouldValidate: true })
  }

  const goNext = async () => {
    const ok = await trigger(STEP_FIELDS[step])
    if (ok) setStepIdx(i => Math.min(i + 1, STEPS.length - 1))
  }

  const goBack = () => setStepIdx(i => Math.max(i - 1, 0))

  // Tek <form>: ara adımlarda Enter / mobil klavyedeki "Git" sonraki fasla
  // geçirir, son adımda gerçek gönderim koşar. Form öğesi olmadan bu akış
  // yalnızca fareyle çalışıyordu.
  const onFormSubmit = (event) => {
    if (!isLast) {
      event.preventDefault()
      goNext()
      return
    }
    handleSubmit(onSubmit)(event)
  }

  const onSubmit = async (data) => {
    // Gerçek gönderim: kullanıcı hareketiyle senkron aç (popup engeline takılmaz).
    // Şablon backend'siz çalışır — talep, önceden yazılmış WhatsApp mesajı olarak iletilir.
    const waLink = buildWhatsAppLink(site.whatsapp, data)
    // Popup engellendiyse aynı sekmede aç: aksi halde kullanıcıya "iletildi"
    // denip hiçbir mesaj gönderilmemiş olur.
    if (!window.open(waLink, '_blank', 'noopener')) {
      window.location.href = waLink
      return
    }
    const { reducedMotion } = getMediaCapability()
    if (!reducedMotion) {
      setIsSubmitting(true)
      await new Promise(resolve => setTimeout(resolve, 2200))
      setIsSubmitting(false)
    }
    setSent(true)
  }

  const mailtoHref = buildMailtoLink(site.email, {
    subject: 'Rezervasyon Talebi',
    body: `Merhaba, rezervasyon yapmak istiyorum.\nAd: ${formValues.name}\nTarih: ${toTrDate(formValues.date)}\nSaat: ${formValues.time}\nKişi: ${formValues.guests}${formValues.note?.trim() ? `\nNot: ${formValues.note.trim()}` : ''}`,
  })

  const fieldError = (name) =>
    errors[name] ? (
      <p id={`err-${name}`} role="alert" className="font-body text-sm text-noir-accent mt-3">
        {errors[name]?.message}
      </p>
    ) : null

  const inputCls =
    'w-full bg-transparent border-b border-noir-border focus:border-noir-accent outline-none py-3 font-body text-lg text-noir-text placeholder:text-noir-text/30 transition-colors'

  if (sent) {
    return (
      <div ref={successRef} className="text-center py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative mb-12">
          <span className="success-ring absolute inset-0 rounded-full border border-noir-accent/30 scale-[1.5]" aria-hidden="true" />
          <span className="success-ring inline-flex items-center justify-center w-24 h-24 rounded-full border-2 border-noir-accent bg-noir-surface" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="w-10 h-10 stroke-noir-accent fill-none" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
        </div>
        <p className="success-text font-display text-3xl lg:text-4xl text-noir-text mb-4">Masanız adınıza ayrılıyor.</p>
        <p className="success-text font-display italic text-xl text-noir-text/60 max-w-md mx-auto">
          Sayın {formValues.name}, {toTrDate(formValues.date)} tarihinde saat {formValues.time} için talebiniz WhatsApp üzerinden iletildi. Onay için sizinle iletişime geçeceğiz.
        </p>
      </div>
    )
  }

  if (isSubmitting) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-12" role="status">
        {/* Tasarımın "kart mühürlenip gönderilir" adımı. Önceden bu ekran
            yalnızca spinner gösterdiği için mühür animasyonu hiç görünmüyordu. */}
        <NoteCard values={formValues} sealed />
        <p className="font-display italic text-2xl text-noir-text/70 text-center">
          Masanız adınıza ayrılıyor…
        </p>
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={onFormSubmit}
      className="relative lg:grid lg:grid-cols-[1fr,26rem] lg:gap-16"
    >
      {/* z-0: dev adım numarası filigranı */}
      <span className="watermark text-[20vw] lg:text-[12vw] right-4 top-0 lg:-top-10 tabular-nums" aria-hidden="true">
        {stepIdx + 1}
      </span>

      <div>
        {/* İlerleme */}
        <p className="relative z-20 font-body text-xs tracking-[0.4em] uppercase text-noir-text/40 mb-6 lg:mb-10">
          Fasıl {stepIdx + 1} / {STEPS.length}
        </p>

        {/* Mobil: kompakt fiş — dolan alanlar özetlenir */}
        <div className="lg:hidden flex flex-wrap gap-2 mb-8 relative z-20" aria-hidden="true">
          {[
            formValues.guests > 0 && `${formValues.guests} kişi`,
            formValues.date && toTrDate(formValues.date),
            formValues.time,
            formValues.name,
          ].filter(Boolean).map(chip => (
            <span key={chip} className="px-3 py-1 bg-noir-text text-noir-bg font-display italic text-sm">
              {chip}
            </span>
          ))}
        </div>

        <div ref={panelRef} className="relative z-20">
          {step === 'guests' && (
            <fieldset>
              <legend className="font-display text-3xl lg:text-5xl mb-2">{stepCopy.guests.question}</legend>
              <p className="font-display italic text-noir-text/50 mb-8">{stepCopy.guests.hint}</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-w-md">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setVal('guests', n)}
                    aria-pressed={formValues.guests === n}
                    className={`h-14 font-display text-xl border transition-colors duration-300 ${
                      formValues.guests === n
                        ? 'border-noir-accent text-noir-accent'
                        : 'border-noir-border text-noir-text/70 hover:border-noir-text/50'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {fieldError('guests')}
            </fieldset>
          )}

          {step === 'date' && (
            <div>
              <label htmlFor="res-date" className="block font-display text-3xl lg:text-5xl mb-2">
                {stepCopy.date.question}
              </label>
              <p className="font-display italic text-noir-text/50 mb-8">{stepCopy.date.hint}</p>
              <input
                id="res-date"
                type="date"
                min={todayIso()}
                {...register('date')}
                aria-describedby={errors.date ? 'err-date' : undefined}
                className={`${inputCls} max-w-xs [color-scheme:dark]`}
              />
              {fieldError('date')}
            </div>
          )}

          {step === 'time' && (
            <fieldset>
              <legend className="font-display text-3xl lg:text-5xl mb-2">{stepCopy.time.question}</legend>
              <p className="font-display italic text-noir-text/50 mb-8">{stepCopy.time.hint}</p>
              <div className="flex flex-wrap gap-3 max-w-lg">
                {site.reservationTimes.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setVal('time', t)}
                    aria-pressed={formValues.time === t}
                    className={`px-5 h-12 font-body text-sm tracking-wider border transition-colors duration-300 ${
                      formValues.time === t
                        ? 'border-noir-accent text-noir-accent'
                        : 'border-noir-border text-noir-text/70 hover:border-noir-text/50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {fieldError('time')}
            </fieldset>
          )}

          {step === 'contact' && (
            <div>
              <p className="font-display text-3xl lg:text-5xl mb-2">{stepCopy.contact.question}</p>
              <p className="font-display italic text-noir-text/50 mb-8">{stepCopy.contact.hint}</p>
              <div className="space-y-8 max-w-md">
                <div>
                  <label htmlFor="res-name" className="block font-body text-xs tracking-[0.3em] uppercase text-noir-text/50 mb-1">
                    {labels.name}
                  </label>
                  <input
                    id="res-name"
                    type="text"
                    autoComplete="name"
                    {...register('name')}
                    aria-describedby={errors.name ? 'err-name' : undefined}
                    className={inputCls}
                  />
                  {fieldError('name')}
                </div>
                <div>
                  <label htmlFor="res-phone" className="block font-body text-xs tracking-[0.3em] uppercase text-noir-text/50 mb-1">
                    {labels.phone}
                  </label>
                  <input
                    id="res-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="05xx xxx xx xx"
                    {...register('phone')}
                    aria-describedby={errors.phone ? 'err-phone' : undefined}
                    className={inputCls}
                  />
                  {fieldError('phone')}
                </div>
              </div>
            </div>
          )}

          {step === 'note' && (
            <div>
              <label htmlFor="res-note" className="block font-display text-3xl lg:text-5xl mb-2">
                {stepCopy.note.question}
              </label>
              <p className="font-display italic text-noir-text/50 mb-8">{stepCopy.note.hint}</p>
              <textarea
                id="res-note"
                rows={3}
                {...register('note')}
                className={`${inputCls} max-w-lg resize-none`}
              />
            </div>
          )}
        </div>

        {/* Gezinme */}
        <div className="relative z-20 flex flex-wrap items-center gap-6 mt-12">
          {stepIdx > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="font-body text-sm tracking-[0.2em] uppercase text-noir-text/50 hover:text-noir-text transition-colors"
            >
              {labels.back}
            </button>
          )}
          {isLast ? (
            <button
              type="submit"
              data-cursor="Mühürle"
              className="px-8 h-14 bg-noir-accent text-noir-bg font-body text-sm tracking-[0.2em] uppercase hover:bg-noir-text transition-colors duration-300"
            >
              Rezervasyonu Tamamla
            </button>
          ) : (
            <button
              type="submit"
              data-cursor="Devam"
              className="px-8 h-14 border border-noir-accent text-noir-accent font-body text-sm tracking-[0.2em] uppercase hover:bg-noir-accent hover:text-noir-bg transition-colors duration-300"
            >
              {labels.next}
            </button>
          )}
          {isLast && (
            <a
              href={mailtoHref}
              className="font-body text-sm text-noir-text/60 hover:text-noir-accent underline underline-offset-4 transition-colors"
            >
              {labels.sendEmail}
            </a>
          )}
        </div>
      </div>

      {/* Sağ: atmosfer görseli + canlı not kartı (masaüstü) */}
      <aside className="hidden lg:block relative z-10" aria-hidden="true">
        <div className="sticky top-36">
          <div className="duotone relative h-[26rem] overflow-hidden">
            <img src={images.story[0]} alt="" loading="lazy" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-20 -mt-24 ml-6">
            <NoteCard values={formValues} sealed={isSubmitting} />
          </div>
        </div>
      </aside>
    </form>
  )
}
