import { site } from '../../data/site.js'
import { footer } from '../../data/content.js'
import Wordmark from '../ui/Wordmark.jsx'

export default function Footer() {
  return (
    <footer className="bg-noir-bg border-t border-noir-border">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <Wordmark className="text-lg mb-4" />
          <p className="text-sm text-noir-text/50 font-body leading-relaxed">
            {site.tagline}<br />
            {site.address.line2}
          </p>
        </div>

        <div>
          <p className="text-xs tracking-widest uppercase text-noir-accent mb-4 font-body">Saatler</p>
          <ul className="text-sm text-noir-text/70 font-body space-y-1">
            {site.hours.map(({ days, time }) => (
              <li key={days}>{days}: {time}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs tracking-widest uppercase text-noir-accent mb-4 font-body">İletişim</p>
          <ul className="text-sm text-noir-text/70 font-body space-y-1">
            <li>{site.address.line1}</li>
            <li><a href={`tel:${site.phone.replace(/\s/g, '')}`} className="hover:text-noir-accent transition-colors">{site.phone}</a></li>
            <li><a href={`mailto:${site.email}`} className="hover:text-noir-accent transition-colors">{site.email}</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-noir-border max-w-7xl mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-noir-text/60 font-body">
          © {new Date().getFullYear()} {site.name}. {footer.rights}
        </p>
        <div className="flex gap-6">
          {site.socials.map(({ label, url }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-noir-text/50 hover:text-noir-accent transition-colors font-body tracking-wider uppercase"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
