import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { getMediaCapability } from '../../hooks/useMediaCapability.js'

export default function CustomCursor() {
  const cursorRef = useRef(null)
  const dotRef = useRef(null)
  const labelRef = useRef(null)
  // Dokunmatik + reduced-motion'da hic render edilmez
  // (yerel imlec gizli oldugu icin hareketsiz nokta kaliyordu)
  const { isTouch, reducedMotion } = getMediaCapability()
  const enabled = !isTouch && !reducedMotion

  useGSAP(() => {
    if (!enabled) return

    const cursor = cursorRef.current
    const dot = dotRef.current
    const label = labelRef.current
    if (!cursor) return

    // quickTo: her mousemove'da yeni tween yaratmak yerine tek tween'i günceller
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.15, ease: 'power2.out' })
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.15, ease: 'power2.out' })
    const onMouseMove = (e) => {
      xTo(e.clientX)
      yTo(e.clientY)
    }

    // Delegasyon: rota değişse de yeni elemanlar otomatik yakalanır
    const onMouseOver = (e) => {
      const el = e.target.closest('a, button, [data-cursor]')
      if (!el) return
      const cursorText = el.dataset.cursor || ''
      if (cursorText) {
        label.textContent = cursorText
        gsap.to(dot, { scale: 3, duration: 0.3, ease: 'power2.out' })
        gsap.to(label, { opacity: 1, duration: 0.2 })
      } else {
        gsap.to(dot, { scale: 1.5, duration: 0.3, ease: 'power2.out' })
      }
    }

    const onMouseOut = (e) => {
      const el = e.target.closest('a, button, [data-cursor]')
      if (!el) return
      // Hâlâ aynı interaktifin içindeysek sıfırlama
      if (el.contains(e.relatedTarget)) return
      label.textContent = ''
      gsap.to(dot, { scale: 1, duration: 0.3, ease: 'power2.out' })
      gsap.to(label, { opacity: 0, duration: 0.2 })
    }

    // Tiklanan eleman DOM'dan kalkarsa mouseout atesletmez; etiket asili kalir
    // -> tik sonrasi imlec altindaki ogeyi dogrula
    const onClick = () => {
      requestAnimationFrame(() => {
        const under = document.elementFromPoint(
          Number(gsap.getProperty(cursor, 'x')),
          Number(gsap.getProperty(cursor, 'y'))
        )
        if (!under?.closest('a, button, [data-cursor]')) {
          label.textContent = ''
          gsap.to(dot, { scale: 1, duration: 0.3, ease: 'power2.out' })
          gsap.to(label, { opacity: 0, duration: 0.2 })
        }
      })
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseover', onMouseOver)
    document.addEventListener('mouseout', onMouseOut)
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mouseout', onMouseOut)
      document.removeEventListener('click', onClick)
    }
  }, { dependencies: [enabled], scope: cursorRef })

  if (!enabled) return null

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:block"
      aria-hidden="true"
    >
      <div
        ref={dotRef}
        className="w-4 h-4 rounded-full border border-noir-accent bg-transparent"
      />
      <span
        ref={labelRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-body tracking-widest text-noir-accent uppercase opacity-0 whitespace-nowrap"
      />
    </div>
  )
}
