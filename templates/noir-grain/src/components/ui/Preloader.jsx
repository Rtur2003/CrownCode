import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { site } from '../../data/site.js'
import { getMediaCapability } from '../../hooks/useMediaCapability.js'
import Wordmark from './Wordmark.jsx'

const SEEN_KEY = 'ng_seen'

// Safari gizli sekme / kısıtlı çerez ayarlarında sessionStorage erişimi
// exception atar. Sarmalanmazsa preloader hiç bitmez: tam ekran katman
// kalkmaz ve 'preloader:done' beklediği için tüm SplitText başlıkları
// görünmez kalır.
function hasSeen() {
  try {
    return Boolean(sessionStorage.getItem(SEEN_KEY))
  } catch {
    return false
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Depolama yok — her ziyarette uzun sayaç gösterilir, kritik değil.
  }
}

function finish() {
  document.documentElement.dataset.preloaderDone = '1'
  document.dispatchEvent(new CustomEvent('preloader:done'))
}

export default function Preloader() {
  const rootRef = useRef(null)
  const counterRef = useRef(null)
  const [done, setDone] = useState(false)

  useGSAP(() => {
    const { reducedMotion } = getMediaCapability()
    if (reducedMotion) {
      setDone(true)
      finish()
      return
    }

    const countDuration = hasSeen() ? 0.5 : 1.6
    const counter = { value: 0 }

    const tl = gsap.timeline({
      onComplete: () => {
        markSeen()
        setDone(true)
        finish()
      },
    })

    tl.to(counter, {
      value: 100,
      duration: countDuration,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.textContent = String(Math.round(counter.value)).padStart(3, '0')
        }
      },
    })
    tl.to(rootRef.current, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 1.1,
      ease: 'power4.inOut',
    })
  }, { scope: rootRef })

  if (done) return null

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[200] bg-noir-bg flex flex-col items-center justify-center gap-6"
      style={{ clipPath: 'inset(0 0 0% 0)' }}
      aria-hidden="true"
    >
      <Wordmark className="text-2xl md:text-3xl [&>svg]:w-10 [&>svg]:h-10" />
      <p
        ref={counterRef}
        className="font-display text-6xl md:text-8xl text-noir-accent tabular-nums"
      >
        000
      </p>
      <p className="text-xs tracking-[0.4em] uppercase text-noir-text/60 font-body">
        {site.tagline}
      </p>
    </div>
  )
}
