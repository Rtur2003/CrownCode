import { site } from '../../data/site.js'

// Marka amblemi + yazı kilidi (wordmark).
// Amblem: halka içinde 45° dönük kare (tabak + tahıl tanesi metaforu).
// site.name '&' içeriyorsa ampersand vurgulu dizilir; içermiyorsa düz yazılır.
export default function Wordmark({ className = '', compact = false }) {
  const parts = site.name.split('&').map(s => s.trim())
  const hasAmp = parts.length === 2

  return (
    <span lang="en" className={`inline-flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 32 32" className="w-7 h-7 shrink-0" aria-hidden="true">
        <circle cx="16" cy="16" r="14.5" fill="none" stroke="#C89B5A" strokeWidth="0.75" opacity="0.9" />
        <rect
          x="12.5" y="12.5" width="7" height="7"
          fill="none" stroke="#C89B5A" strokeWidth="0.75"
          transform="rotate(45 16 16)"
        />
        <circle cx="16" cy="16" r="1.1" fill="#C89B5A" />
      </svg>
      {!compact && (
        <span className="font-display tracking-[0.28em] uppercase text-noir-text leading-none">
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
      )}
    </span>
  )
}
