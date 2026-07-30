import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { JourneyContext } from './journeyContext.js'

gsap.registerPlugin(ScrollTrigger)

export function JourneyPanel({ id, className = '', children }) {
  return (
    <section id={id} className={`relative lg:h-svh lg:shrink-0 ${className}`}>
      {children}
    </section>
  )
}

// Masaüstü (≥1024px, reduced-motion yok): dikey scroll pinned yatay yolculuğa çevrilir.
// Diğer tüm durumlarda children normal dikey akışta kalır — tek kod yolu.
export default function HorizontalJourney({ children, onChapterChange }) {
  const wrapperRef = useRef(null)
  const trackRef = useRef(null)
  const [journey, setJourney] = useState({ pinned: false, anim: null })

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const track = trackRef.current
      const distance = () => track.scrollWidth - window.innerWidth

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        // Fasil takibi tween onUpdate'inde: scrub'in gorsel konumuyla senkron kalir
        // senkron kalır (scrollTrigger.onUpdate ani scroll'da erken ateşlenir)
        onUpdate: () => {
          if (!onChapterChange) return
          const center = -Number(gsap.getProperty(track, 'x')) + window.innerWidth / 2
          let idx = 0
          Array.from(track.children).forEach((panel, i) => {
            if (panel.offsetLeft <= center) idx = i
          })
          onChapterChange(idx)
        },
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })

      setJourney({ pinned: true, anim: tween })
      return () => setJourney({ pinned: false, anim: null })
    })

    return () => mm.revert()
  }, [onChapterChange])

  return (
    <JourneyContext.Provider value={journey}>
      <div ref={wrapperRef} className="lg:overflow-hidden">
        <div ref={trackRef} className="flex flex-col lg:flex-row">
          {children}
        </div>
      </div>
    </JourneyContext.Provider>
  )
}
