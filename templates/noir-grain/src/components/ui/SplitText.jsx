import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { getMediaCapability } from '../../hooks/useMediaCapability.js'

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;' }
const escapeHtml = s => s.replace(/[&<>]/g, c => ESCAPES[c])

// Metni karakter/kelime span'lerine böler; `animate` verilirse
export default function SplitText({
  children,
  className = '',
  as: Tag = 'span',
  type = 'chars',
  animate = false,
  delay = 0,
}) {
  const containerRef = useRef(null)
  // Kaynak metin DOM'dan değil prop'tan okunur. DOM'dan okunduğunda effect
  const text = typeof children === 'string' ? children : ''

  useGSAP(() => {
    const el = containerRef.current
    if (!el || !text) return

    const pieces = type === 'chars'
      // Array.from: kod noktası bazlı böler, surrogate çiftlerini kırmaz.
      ? Array.from(text).map(char => char === ' '
        ? '<span class="inline-block">&nbsp;</span>'
        : `<span class="inline-block overflow-hidden"><span class="split-char inline-block">${escapeHtml(char)}</span></span>`
      )
      : text.split(/\s+/).filter(Boolean).map(word =>
        `<span class="inline-block overflow-hidden mr-[0.25em]"><span class="split-word inline-block">${escapeHtml(word)}</span></span>`
      )

    // Parçalanmış görsel katman ekran okuyuculardan saklanır (harf harf
    el.innerHTML =
      `<span class="sr-only">${escapeHtml(text)}</span>` +
      `<span aria-hidden="true">${pieces.join('')}</span>`

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
  }, { dependencies: [text, type, animate, delay], scope: containerRef })

  return (
    <Tag ref={containerRef} className={className}>
      {children}
    </Tag>
  )
}
