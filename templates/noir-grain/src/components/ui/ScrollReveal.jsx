import { useRef } from 'react'
import { useGSAP } from '../../hooks/useGSAP.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  y = 40,
  duration = 0.8,
  start = 'top 85%',
}) {
  const ref = useRef(null)

  useGSAP(() => {
    if (!ref.current) return
    gsap.from(ref.current, {
      opacity: 0,
      y,
      duration,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: ref.current,
        start,
        once: true,
      },
    })
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
