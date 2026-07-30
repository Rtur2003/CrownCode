import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { story } from '../../data/content.js'
import { images } from '../../data/images.js'
import { JourneyPanel } from './HorizontalJourney.jsx'
import { useJourney } from './journeyContext.js'

gsap.registerPlugin(ScrollTrigger)

// "Dergi Forması": solda tam boy ana görsel, dev italik cümle görselin
// üzerinden metne akar — kontrollü bindirme, dağınık kolaj değil.
export default function StoryCollage() {
  const rootRef = useRef(null)
  const { pinned, anim } = useJourney()

  useGSAP(() => {
    if (!pinned) return

    // Ana görsel maske-açılımla belirir, içi hafif paralaks yapar
    gsap.fromTo(
      '.story-hero',
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          containerAnimation: anim,
          start: 'left 90%',
          end: 'left 30%',
          scrub: true,
        },
      }
    )
    gsap.fromTo(
      '.story-hero img',
      { xPercent: -8 },
      {
        xPercent: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          containerAnimation: anim,
          start: 'left right',
          end: 'right left',
          scrub: true,
        },
      }
    )
    // Cümle görselden biraz yavaş akar (derinlik)
    gsap.to('.story-statement', {
      xPercent: -5,
      ease: 'none',
      scrollTrigger: {
        trigger: rootRef.current,
        containerAnimation: anim,
        start: 'left right',
        end: 'right left',
        scrub: true,
      },
    })
  }, { dependencies: [pinned, anim], scope: rootRef })

  return (
    <JourneyPanel id="hikaye" className="bg-noir-surface/30 overflow-hidden lg:w-[150vw]">
      {/* ── Mobil: story kartları — başlık + cümle ilk kartın üzerinde ── */}
      <div className="lg:hidden">
        {story.paragraphs.map((p, i) => (
          <div key={p.slice(0, 24)} className="snap-card relative h-svh overflow-hidden" data-story-card>
            <img
              src={images.story[i === 0 ? 0 : 2]}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {i === 0 && (
              <div className="absolute inset-x-0 top-0 p-6 pt-24 pb-16 bg-gradient-to-b from-noir-bg/95 via-noir-bg/75 to-transparent">
                <p className="text-xs tracking-[0.4em] uppercase text-noir-accent font-body mb-2">
                  {story.eyebrow}
                </p>
                <h2 className="font-display text-5xl text-noir-text mb-3">{story.title}</h2>
                <p className="font-display italic text-2xl leading-snug text-noir-text/90">
                  {story.statement}
                </p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-noir-bg via-noir-bg/70 to-transparent" aria-hidden="true" />
            <p className="absolute inset-x-0 bottom-0 p-6 pb-24 font-body text-base leading-relaxed text-noir-text/90">
              {p}
            </p>
          </div>
        ))}
      </div>

      {/* ── Masaüstü: dergi forması ── */}
      <div ref={rootRef} className="hidden lg:flex h-full relative">
        <span className="watermark text-[36vh] right-[3vw] bottom-[6vh]" aria-hidden="true">II</span>

        {/* Sol: tam boy ana görsel */}
        <div className="story-hero duotone relative shrink-0 w-[52vw] h-full overflow-hidden">
          <img src={images.story[0]} alt="" loading="lazy" className="w-full h-full object-cover scale-110" />
          <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-noir-bg/70 to-transparent" aria-hidden="true" />
        </div>

        {/* Sağ: editoryal içerik — cümle görselin üzerinden başlar */}
        <div className="relative flex flex-col justify-center h-full pl-0 pr-[7vw] pt-[6vh]">
          <p className="text-xs tracking-[0.4em] uppercase text-noir-accent font-body mb-4 ml-[4vw]">
            {story.eyebrow}
          </p>
          <h2 className="font-display text-7xl text-balance text-noir-text ml-[4vw]">{story.title}</h2>

          {/* Editoryal metin plakası: görsele bilinçli taşar, siyah zemin
              kontrastı her koşulda garanti eder */}
          <p className="story-statement relative z-20 font-display italic text-[clamp(2rem,3vw,4.2rem)] leading-[1.18] text-balance text-noir-text max-w-[52vw] -ml-[12vw] mt-12 bg-noir-bg px-8 py-6 border border-noir-accent/30 shadow-[0_20px_60px_rgba(14,12,9,0.7)]">
            {story.statement}
          </p>

          <div className="flex gap-[3vw] mt-12 ml-[4vw] items-end">
            <div className="columns-2 gap-[3vw] max-w-[44vw]">
              {story.paragraphs.map((p) => (
                <p key={p.slice(0, 24)} className="font-body text-[0.95rem] leading-relaxed text-noir-text/70 mb-4 break-inside-avoid">
                  {p}
                </p>
              ))}
            </div>
            {/* İkincil kare — şarap yıkamalı */}
            <div className="relative shrink-0 w-[13vw]">
              <div className="wash w-full h-full -left-3 -bottom-3" aria-hidden="true" />
              <div className="duotone relative z-10 h-[24vh] overflow-hidden">
                <img src={images.story[1]} alt="" loading="lazy" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </JourneyPanel>
  )
}
