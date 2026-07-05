import { Link, useLocation } from 'react-router-dom'
import { nav } from '../../data/content.js'
import { site } from '../../data/site.js'

// Mobil "Cep Servisi": hamburger yerine başparmak-dostu sabit alt bar.
// Masaüstünde görünmez; navigasyonun tamamını üstlenir.
export default function MobileActionBar() {
  const location = useLocation()

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-noir-bg/90 backdrop-blur-md border-t border-noir-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Alt gezinme"
    >
      <div className="grid grid-cols-4">
        {nav.map(({ to, label }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center h-16 gap-1 transition-colors ${
                active ? 'text-noir-accent' : 'text-noir-text/60'
              }`}
            >
              <span className={`block w-1 h-1 rotate-45 ${active ? 'bg-noir-accent' : 'bg-transparent'}`} aria-hidden="true" />
              <span className="font-body text-[11px] tracking-[0.2em] uppercase">{label}</span>
            </Link>
          )
        })}
        <a
          href={`tel:${site.phone.replace(/\s/g, '')}`}
          className="flex flex-col items-center justify-center h-16 gap-1 text-noir-text/60"
        >
          <span className="block w-1 h-1 rotate-45 bg-transparent" aria-hidden="true" />
          <span className="font-body text-[11px] tracking-[0.2em] uppercase">Ara</span>
        </a>
      </div>
    </nav>
  )
}
