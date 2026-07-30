import { Link } from 'react-router-dom'
import { invite } from '../../data/content.js'
import { site } from '../../data/site.js'
import { images } from '../../data/images.js'
import { JourneyPanel } from './HorizontalJourney.jsx'
import Magnetic from '../ui/Magnetic.jsx'

// Köşe amblemi — davetiye çerçevesinin dört ucuna oturur
function CornerMark({ className }) {
  return (
    <span className={`absolute ${className}`} aria-hidden="true">
      <svg viewBox="0 0 16 16" className="w-4 h-4">
        <rect x="4.5" y="4.5" width="7" height="7" fill="none" stroke="#C89B5A" strokeWidth="1" transform="rotate(45 8 8)" />
      </svg>
    </span>
  )
}

// "Davetiye Kartı": loş servis fotoğrafı üzerinde çift çizgili altın
export default function ReserveInvite() {
  const frame = (
    <div className="relative h-full w-full border border-noir-accent/40 p-[6px]">
      <div className="relative h-full w-full border border-noir-accent/25 flex flex-col items-center justify-center text-center px-6 py-16">
        <CornerMark className="-top-2 -left-2" />
        <CornerMark className="-top-2 -right-2" />
        <CornerMark className="-bottom-2 -left-2" />
        <CornerMark className="-bottom-2 -right-2" />

        <p className="text-xs tracking-[0.4em] uppercase text-noir-accent font-body mb-6">
          {invite.eyebrow}
        </p>
        {/* Başlık content.js'ten gelir — önceden burada sabit yazılıydı ve */}
        <h2 className="font-display text-[clamp(2.6rem,6vw,5.5rem)] leading-[1.05] text-noir-text">
          {invite.titleLines.map((line, i) => (
            <span key={line} className={i === 0 ? 'block' : 'block italic text-noir-accent'}>
              {line}
            </span>
          ))}
        </h2>
        <p className="font-display italic text-noir-text/70 mt-6 text-lg max-w-md">{invite.note}</p>

        <Magnetic strength={0.25} className="mt-10">
          <Link
            to="/rezervasyon"
            data-cursor="Masanız"
            className="inline-block px-10 h-16 leading-[4rem] bg-noir-accent text-noir-bg font-body text-sm tracking-[0.25em] uppercase hover:bg-noir-text transition-colors duration-300"
          >
            {invite.cta}
          </Link>
        </Magnetic>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 mt-10 font-body text-xs tracking-[0.2em] text-noir-text/50">
          <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="hover:text-noir-accent transition-colors">
            {site.phone}
          </a>
          <span aria-hidden="true" className="w-1 h-1 rotate-45 bg-noir-accent/60" />
          <span>{site.hours[0].days} {site.hours[0].time}</span>
        </div>
      </div>
    </div>
  )

  return (
    <JourneyPanel id="davet" className="lg:w-screen bg-noir-bg overflow-hidden">
      {/* Tam ekran loş servis görseli */}
      <div className="absolute inset-0" aria-hidden="true">
        <img src={images.invite} alt="" loading="lazy" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-noir-bg/75" />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[60vh] rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(ellipse, rgba(92,31,26,0.5), transparent 65%)' }}
        />
      </div>

      <div
        className="snap-card relative z-20 h-full min-h-svh lg:min-h-0 flex items-center justify-center p-6 lg:p-[6vh]"
        data-story-card
      >
        <div className="w-full max-w-4xl h-[78svh] lg:h-full">{frame}</div>
      </div>
    </JourneyPanel>
  )
}
