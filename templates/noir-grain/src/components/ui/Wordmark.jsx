import { useId } from 'react'
import { site } from '../../data/site.js'

// Marka amblemi + yazı kilidi (wordmark).
// Amblem "Grain Seal": altın gradyanlı mühür halkası içinde stilize buğday
// başağı (tahıl = markanın adı). Dolgulu taneler küçük boyutta da net okunur,
// hairline yerine tek kalın halka kullanılır — 28px'te sub-pixel kırılmaz.
// site.name '&' içeriyorsa ampersand vurgulu dizilir; içermiyorsa düz yazılır.
//
// Üst öge `group` sınıfı taşırsa (ör. Navbar'daki <Link>) amblem hover'da
// hafifçe canlanır.
export default function Wordmark({ className = '', compact = false }) {
  const parts = site.name.split('&').map(s => s.trim())
  const hasAmp = parts.length === 2
  // Aynı sayfada birden çok Wordmark render edilebilir — gradyan id'si benzersiz olmalı.
  const gradientId = `wm-gold-${useId()}`

  // Başağın tane sıraları: gövdeye simetrik, yukarı doğru açılı.
  const kernelRows = [11.9, 14.9, 17.9]

  return (
    <span lang="en" className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 32 32"
        className="w-8 h-8 shrink-0 transition-transform duration-500 ease-out group-hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E8CE9A" />
            <stop offset="45%" stopColor="#C89B5A" />
            <stop offset="100%" stopColor="#8C6631" />
          </linearGradient>
        </defs>

        {/* Mühür halkası */}
        <circle
          cx="16" cy="16" r="14.4"
          fill="none" stroke={`url(#${gradientId})`} strokeWidth="1"
          className="opacity-70 transition-opacity duration-500 group-hover:opacity-100"
        />

        <g fill={`url(#${gradientId})`} stroke={`url(#${gradientId})`}>
          {/* Gövde */}
          <path d="M16 24.1V10.4" fill="none" strokeWidth="0.9" strokeLinecap="round" />
          {/* Uç tane */}
          <ellipse cx="16" cy="10.2" rx="0.85" ry="2" stroke="none" />
          {/* Simetrik tane çiftleri */}
          {kernelRows.map(y => (
            <g key={y} stroke="none">
              <ellipse cx="0" cy="0" rx="0.92" ry="2.05" transform={`translate(17.75 ${y}) rotate(30)`} />
              <ellipse cx="0" cy="0" rx="0.92" ry="2.05" transform={`translate(14.25 ${y}) rotate(-30)`} />
            </g>
          ))}
          {/* Taban çizgisi — başağı mühür içinde oturtur */}
          <path d="M13.4 24.9h5.2" fill="none" strokeWidth="0.9" strokeLinecap="round" />
        </g>
      </svg>

      {compact ? (
        // Amblem dekoratif (aria-hidden) — compact modda ekran okuyucu için ad şart.
        <span className="sr-only">{site.name}</span>
      ) : (
        <>
          <span aria-hidden="true" className="hidden sm:block w-px h-5 bg-noir-accent/25" />
          <span className="font-display tracking-[0.24em] uppercase text-noir-text leading-none">
            {hasAmp ? (
              <>
                {parts[0]}
                <span className="italic text-noir-accent normal-case tracking-normal mx-1.5">&amp;</span>
                {parts[1]}
              </>
            ) : (
              site.name
            )}
          </span>
        </>
      )}
    </span>
  )
}
