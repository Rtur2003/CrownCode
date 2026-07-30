import { Link } from 'react-router-dom'
import { nav, notFound } from '../data/content.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import Magnetic from '../components/ui/Magnetic.jsx'

// Bilinmeyen rotalar için 404. Önceden catch-all rota yoktu: hatalı bir
// adreste Navbar ile Footer arası tamamen boş kalıyordu.
export default function NotFound() {
  usePageTitle('Sayfa bulunamadı')

  return (
    <main className="min-h-svh bg-noir-bg text-noir-text pt-28 pb-24 lg:py-36 relative overflow-hidden flex items-center">
      {/* z-0: dev filigran — diğer sayfalardaki katman sistemiyle aynı dil */}
      <span className="watermark text-[38vw] lg:text-[26vw] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 tabular-nums" aria-hidden="true">
        404
      </span>

      <div className="relative z-20 px-6 lg:px-16 max-w-2xl">
        <p className="text-xs tracking-[0.4em] uppercase text-noir-accent font-body mb-4">
          {notFound.eyebrow}
        </p>
        <h1 className="font-display text-5xl lg:text-7xl mb-6">{notFound.title}</h1>
        <p className="font-display italic text-lg lg:text-xl text-noir-text/60 mb-12 max-w-lg">
          {notFound.body}
        </p>

        <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
          <Magnetic strength={0.35}>
            <Link
              to="/"
              className="block px-8 h-14 leading-[3.5rem] border border-noir-accent text-noir-accent font-body text-sm tracking-[0.2em] uppercase hover:bg-noir-accent hover:text-noir-bg transition-colors duration-300"
            >
              {notFound.homeCta}
            </Link>
          </Magnetic>

          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {nav.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="font-body text-sm tracking-widest uppercase text-noir-text/50 hover:text-noir-accent transition-colors duration-200"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
