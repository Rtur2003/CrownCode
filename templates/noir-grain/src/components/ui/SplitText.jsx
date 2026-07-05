import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { getMediaCapability } from '../../hooks/useMediaCapability.js'

// Metni karakter/kelime span'lerine böler; `animate` verilirse
// preloader bittikten sonra maske altından stagger ile açar.
export default function SplitText({
  children,
  className = '',
  as: Tag = 'span',
  type = 'chars',
  animate = false,
  delay = 0,
}) {
  const containerRef = useRef(null)

  useGSAP(() => {
    const el = containerRef.current
    if (!el) return
    const text = el.textContent || ''
    el.setAttribute('aria-label', text)

    if (type === 'chars') {
      el.innerHTML = text
        .split('')
        .map(char => char === ' '
          ? '<span class="inline-block">&nbsp;</span>'
          : `<span class="inline-block overflow-hidden"><span class="split-char inline-block">${char}</span></span>`
        )
        .join('')
    } else {
      el.innerHTML = text
        .split(' ')
        .map(word => `<span class="inline-block overflow-hidden mr-[0.25em]"><span class="split-word inline-block">${word}</span></span>`)
        .join('')
    }

    if (!animate) return
    const { reducedMotion } = getMediaCapability()
    if (reducedMotion) return

    const targets = el.querySelectorAll('.split-char, .split-word')
    gsap.set(targets, { yPercent: 110 })

    const play = () => {
      gsap.to(targets, {
        yPercent: 0,
        duration: 1,
        delay,
        stagger: 0.035,
        ease: 'power4.out',
      })
    }

    if (document.documentElement.dataset.preloaderDone === '1') {
      play()
      return
    }

    document.addEventListener('preloader:done', play, { once: true })
    return () => {
      document.removeEventListener('preloader:done', play)
    }
  }, { dependencies: [children, type, animate, delay], scope: containerRef })

  return (
    <Tag ref={containerRef} className={className}>
      {children}
    </Tag>
  )
}
