import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import WebGLImage from '../ui/WebGLImage.jsx'
import { signatureItems } from '../../data/menu.js'
import { images } from '../../data/images.js'
import { signature } from '../../data/content.js'
import { JourneyPanel } from './HorizontalJourney.jsx'
import { useJourney } from './journeyContext.js'

gsap.registerPlugin(ScrollTrigger)

export default function SignatureStrip() {
  const rootRef = useRef(null)
  const { pinned, anim } = useJourney()

  // İmza öğe: görseller "tabak kapağı kaldırılır" gibi maske-açılımla belirir
  // (pinned yatay modda, scrub'a bağlı)
  useEffect(() => {
    if (!pinned) return

    const ctx = gsap.context(() => {
      gsap.utils.toArray('.dish-media').forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(0 0 100% 0)' },
          {
            clipPath: 'inset(0 0 0% 0)',
            ease: 'none',
            scrollTrigger: { trigger: el, containerAnimation: anim, start: 'left 95%', end: 'left 45%', scrub: true },
          }
        )
      })
    }, rootRef)

    return () => ctx.revert()
  }, [pinned, anim])

  return (
    <JourneyPanel id="imza" className="bg-noir-bg overflow-hidden lg:w-[170vw]">
      {/* ── Mobil: story kartları — başlık ilk kartın üzerinde, boş kart yok ── */}
      <div className="lg:hidden">
        {signatureItems.map((item, idx) => (
          <figure key={item.id} className="snap-card relative h-svh overflow-hidden" data-story-card>
            <img
              src={images.dishes[item.id]}
              alt={item.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {idx === 0 && (
              <div className="absolute inset-x-0 top-0 p-6 pt-24 pb-16 bg-gradient-to-b from-noir-bg/95 via-noir-bg/70 to-transparent">
                <p className="text-xs tracking-[0.4em] uppercase text-noir-accent font-body mb-2">
                  {signature.eyebrow}
                </p>
                <span className="flex items-baseline gap-3">
                  <h2 className="font-display text-5xl text-noir-text">{signature.title}</h2>
                  <span className="font-display italic text-noir-text/60 text-base">{signature.note}</span>
                </span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-noir-bg via-noir-bg/70 to-transparent" aria-hidden="true" />
            <figcaption className="absolute inset-x-0 bottom-0 p-6 pb-24">
              <span className="flex items-baseline justify-between gap-4">
                <span className="font-display text-4xl text-noir-text min-w-0 line-clamp-2">{item.name}</span>
                <span className="font-body text-sm text-noir-accent tabular-nums shrink-0">{item.price} ₺</span>
              </span>
              <span className="block font-display italic text-noir-text/60 mt-2">{item.desc}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* ── Masaüstü: yatay film şeridi ── */}
      <div className="hidden lg:block h-full">
        <span className="watermark text-[38vh] left-[4vw] top-1/2 -translate-y-1/2" aria-hidden="true">I</span>
        <div ref={rootRef} className="relative h-full flex items-center gap-[6vw] px-[8vw]">
          <header className="shrink-0 w-[22vw] relative z-20">
            <p className="text-xs tracking-[0.4em] uppercase text-noir-accent font-body mb-4">
              {signature.eyebrow}
            </p>
            <h2 className="font-display text-7xl text-noir-text">{signature.title}</h2>
            <p className="font-display italic text-noir-text/60 mt-4 text-lg">{signature.note}</p>
          </header>

          {signatureItems.map((item, i) => (
            <figure key={item.id} className="relative shrink-0 w-[34vw]" data-cursor="Gör">
              <div className={`wash w-[60%] h-[70%] ${i % 2 ? '-right-4 -top-4' : '-left-4 -bottom-2'}`} aria-hidden="true" />
              <div className={`dish-media duotone relative z-10 overflow-hidden ${i % 2 ? 'mt-[10vh]' : '-mt-[6vh]'}`}>
                <WebGLImage src={images.dishes[item.id]} alt={item.name} className="h-[60vh] w-full" />
              </div>
              <figcaption className="relative z-20 flex items-baseline justify-between gap-4 -mt-8 px-2">
                <span className="font-display text-4xl text-noir-text drop-shadow-[0_2px_8px_rgba(14,12,9,0.9)]">
                  {item.name}
                </span>
                <span className="font-body text-sm text-noir-accent tabular-nums shrink-0">{item.price} ₺</span>
              </figcaption>
              <p className="font-display italic text-noir-text/50 text-sm mt-2 px-2">{item.desc}</p>
            </figure>
          ))}
        </div>
      </div>
    </JourneyPanel>
  )
}
