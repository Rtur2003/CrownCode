import { useEffect, useState } from 'react'

// Mobil story-modu ilerleme noktaları — [data-story-card] kartlarını izler.
export default function MobileStoryDots() {
  const [count, setCount] = useState(0)
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) return

    const cards = Array.from(document.querySelectorAll('[data-story-card]'))
    setCount(cards.length)
    if (!cards.length) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(cards.indexOf(e.target))
        })
      },
      { threshold: 0.55 }
    )
    cards.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  if (!count) return null

  return (
    <div
      className="lg:hidden fixed right-3 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2.5"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
            i === active ? 'bg-noir-accent scale-125' : 'bg-noir-text/25'
          }`}
        />
      ))}
    </div>
  )
}
