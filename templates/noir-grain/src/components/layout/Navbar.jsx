import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { nav as links, navLabels } from '../../data/content.js'
import { site } from '../../data/site.js'
import Magnetic from '../ui/Magnetic.jsx'
import Wordmark from '../ui/Wordmark.jsx'

// Mobilde navigasyon MobileActionBar'da — üst bar sadece logo taşır.
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-noir-bg/90 backdrop-blur-md border-b border-noir-border' : ''
      }`}
    >
      {/* Etiket şart: sayfada MobileActionBar ile birlikte iki navigasyon */}
      <nav
        aria-label={navLabels.main}
        className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16 md:h-20"
      >
        <Link to="/" aria-label={site.name} className="group">
          <Wordmark className="text-sm md:text-base" />
        </Link>

        <ul className="hidden lg:flex items-center gap-10">
          {links.map(({ to, label }) => {
            // Dönüşüm CTA'sı: rezervasyon linki vurgulu buton olarak ayrışır
            const isCta = to === '/rezervasyon'
            return (
              <li key={to}>
                <Magnetic strength={0.35}>
                  <Link
                    to={to}
                    className={
                      isCta
                        ? 'block px-5 py-2.5 text-sm font-body tracking-widest uppercase border border-noir-accent text-noir-accent hover:bg-noir-accent hover:text-noir-bg transition-colors duration-300'
                        : 'block px-2 py-1 text-sm font-body tracking-widest uppercase text-noir-text/70 hover:text-noir-accent transition-colors duration-200'
                    }
                  >
                    {label}
                  </Link>
                </Magnetic>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
