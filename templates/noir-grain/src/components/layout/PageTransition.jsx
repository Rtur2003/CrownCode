import { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function PageTransition({ children }) {
  const curtainRef = useRef(null)
  const isFirstRender = useRef(true)

  const location = useLocation()

  useGSAP(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      gsap.from(document.body, { opacity: 0, duration: 0.6, ease: 'power2.out' })
      return
    }

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
      {children}
    </>
  )
}
