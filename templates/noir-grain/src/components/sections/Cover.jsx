import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import SplitText from '../ui/SplitText.jsx'
import { hero } from '../../data/content.js'
import { images } from '../../data/images.js'
import { getMediaCapability } from '../../hooks/useMediaCapability.js'

export default function Cover() {
  const imgRef = useRef(null)
  const sectionRef = useRef(null)
  const titleRef = useRef(null)

  useGSAP(() => {
    const { reducedMotion, isTouch } = getMediaCapability()
    if (reducedMotion || !imgRef.current) return

    // Yavaş zoom — 1.06'da durur ki tilt kaydırması kenar açmasın
    gsap.fromTo(
      imgRef.current,
      { scale: 1.12 },
      { scale: 1.06, duration: 6, ease: 'power1.out' }
    )

    // Katmanli fare paralaksi: gorsel ters yone, baslik fareye dogru kayar
    if (!isTouch && sectionRef.current) {
      const imgX = gsap.quickTo(imgRef.current, 'xPercent', { duration: 0.8, ease: 'power2.out' })
      const imgY = gsap.quickTo(imgRef.current, 'yPercent', { duration: 0.8, ease: 'power2.out' })
      const title = titleRef.current
      const titleX = title && gsap.quickTo(title, 'xPercent', { duration: 1.1, ease: 'power2.out' })
      const titleY = title && gsap.quickTo(title, 'yPercent', { duration: 1.1, ease: 'power2.out' })
      const onMove = (e) => {
        const nx = e.clientX / window.innerWidth - 0.5
        const ny = e.clientY / window.innerHeight - 0.5
        imgX(nx * -2.4)
        imgY(ny * -1.6)
        if (titleX) {
          titleX(nx * 1.1)
          titleY(ny * 0.8)
        }
      }
      const section = sectionRef.current
      section.addEventListener('mousemove', onMove)
      return () => {
        section.removeEventListener('mousemove', onMove)
      }
    }
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="snap-card relative h-svh overflow-hidden flex items-center justify-center" data-story-card>
      {/* LCP öğesi: gecikmeli yüklenmemeli ve tarayıcı sırasında öne alınmalı. */}
      <img
        ref={imgRef}
        src={images.hero}
        alt=""
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Okunabilirlik için karartma */}
      <div className="absolute inset-0 bg-noir-bg/60" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-noir-bg to-transparent" aria-hidden="true" />

      <div ref={titleRef} className="relative z-10 text-center px-6">
        <p className="text-xs md:text-sm tracking-[0.5em] uppercase text-noir-accent font-body mb-6">
          {hero.eyebrow}
        </p>
        <SplitText
          as="h1"
          animate
          className="font-display text-[clamp(2.75rem,9vw,6rem)] leading-[1.04] text-balance text-noir-text"
        >
          {hero.title}
        </SplitText>
        <p className="font-display italic text-lg md:text-2xl text-noir-text/70 mt-6 max-w-xl mx-auto">
          {hero.subtitle}
        </p>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
        <p className="text-[10px] tracking-[0.4em] uppercase text-noir-text/50 font-body">
          {hero.scrollHint}
        </p>
        <span className="block w-px h-10 bg-gradient-to-b from-noir-accent to-transparent animate-pulse" aria-hidden="true" />
      </div>
    </section>
  )
}
