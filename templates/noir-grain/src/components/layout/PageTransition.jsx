import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { getMediaCapability } from '../../hooks/useMediaCapability.js'

export default function PageTransition({ children }) {
  const curtainRef = useRef(null)
  const isFirstRender = useRef(true)
  const [announcement, setAnnouncement] = useState('')

  const location = useLocation()

  // SPA rota degisimi ekran okuyucuya duyurulmaz; basligi okut.
  useEffect(() => {
    if (isFirstRender.current) return
    const id = requestAnimationFrame(() => setAnnouncement(document.title))
    return () => cancelAnimationFrame(id)
  }, [location.pathname])

  useGSAP(() => {
    // Diğer tüm hareket katmanları gibi hareket azaltma tercihine uy.
    const { reducedMotion } = getMediaCapability()

    if (isFirstRender.current) {
      isFirstRender.current = false
      if (!reducedMotion) {
        gsap.from(document.body, { opacity: 0, duration: 0.6, ease: 'power2.out' })
      }
      return
    }

    if (reducedMotion) return

    const curtain = curtainRef.current
    if (!curtain) return

    gsap.fromTo(
      curtain,
      { scaleY: 0, transformOrigin: 'top' },
      {
        scaleY: 1,
        duration: 0.4,
        ease: 'power3.inOut',
        onComplete: () => {
          gsap.to(curtain, {
            scaleY: 0,
            transformOrigin: 'top',
            duration: 0.4,
            delay: 0.05,
            ease: 'power3.inOut',
          })
        },
      }
    )
  }, { dependencies: [location.pathname] })

  return (
    <>
      <div
        ref={curtainRef}
        className="fixed inset-0 z-[100] bg-noir-bg pointer-events-none origin-top scale-y-0"
        aria-hidden="true"
      />
      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
      {children}
    </>
  )
}
