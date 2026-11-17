import React from 'react'

interface DestinyGlyphProps {
  cardId: number
  size?: number
  className?: string | undefined
}

/**
 * Engraved hairline SVG emblems for the 22 Crown Destiny arcana cards.
 * Replaces raw OS color emojis with crisp vector geometry matching the obsidian-brass theme.
 */
export const DestinyGlyph: React.FC<DestinyGlyphProps> = ({ cardId, size = 24, className }) => {
  const id = Math.max(0, Math.min(21, cardId))

  const paths = (): React.ReactNode => {
    switch (id) {
      case 0: // The Wanderer — Compass star
        return (
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 5l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" />
          </>
        )
      case 1: // The Creator — Four-point nova
        return (
          <>
            <path d="M12 2c1 4.5 5.5 9 10 10-4.5 1-9 5.5-10 10-1-4.5-5.5-9-10-10 4.5-1 9-5.5 10-10z" />
            <circle cx="12" cy="12" r="2" />
          </>
        )
      case 2: // The Oracle — Crescent moon & third eye
        return (
          <>
            <path d="M3 12c2.5-4 6-6 9-6s6.5 2 9 6c-2.5 4-6 6-9 6s-6.5-2-9-6z" />
            <circle cx="12" cy="12" r="2.6" />
          </>
        )
      case 3: // The Nurturer — Botanical chalice
        return (
          <>
            <path d="M12 3v18M12 10c-4 0-6-3-6-6 3 0 6 2 6 6zM12 14c4 0 6-3 6-6-3 0-6 2-6 6z" />
            <path d="M8 21h8" />
          </>
        )
      case 4: // The Sovereign — Crown sigil
      case 21: // The Crown
        return (
          <>
            <path d="M3 17l2-9 4 4 3-6 3 6 4-4 2 9H3z" />
            <path d="M4 20h16" />
          </>
        )
      case 5: // The Guide — Skeleton key
        return (
          <>
            <circle cx="8" cy="12" r="4" />
            <path d="M12 12h9M17 12v4M20 12v3" />
          </>
        )
      case 6: // The Union — Interlocking orbits
        return (
          <>
            <circle cx="9" cy="12" r="5" />
            <circle cx="15" cy="12" r="5" />
          </>
        )
      case 7: // The Chariot — Winged bolt
        return (
          <>
            <path d="M13 2L5 14h6l-1 8 9-12h-6l0-8z" />
          </>
        )
      case 8: // The Phoenix — Rising flame
        return (
          <>
            <path d="M12 2c3 4 6 7 6 11a6 6 0 11-12 0c0-3 2-6 4-8 0 2 1 3 2 3-1-2 0-4 0-6z" />
          </>
        )
      case 9: // The Hermit — Peak & lantern
        return (
          <>
            <path d="M3 19l6-10 4 5 3-4 5 9H3z" />
            <circle cx="12" cy="5" r="1.5" />
          </>
        )
      case 10: // The Wheel — Astral wheel
        return (
          <>
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="2.5" />
            <path d="M12 3v6.5M12 14.5V21M3 12h6.5M14.5 12H21" />
          </>
        )
      case 11: // The Balance — Twin scales
        return (
          <>
            <path d="M12 4v16M7 20h10M4 8h16M7 8l-3 6h6L7 8zM17 8l-3 6h6l-3-6z" />
          </>
        )
      case 12: // The Reflection — Inverted prism mirror
        return (
          <>
            <path d="M12 3l8 9-8 9-8-9 8-9z" />
            <path d="M4 12h16" />
          </>
        )
      case 13: // The Transformation — Phoenix eclipse chrysalis
        return (
          <>
            <circle cx="12" cy="12" r="6" />
            <path d="M4 7c3 2 5 4 8 5 3-1 5-3 8-5M4 17c3-2 5-4 8-5 3 1 5 3 8 5" />
          </>
        )
      case 14: // The Harmony — Harmonic wave
        return (
          <>
            <path d="M3 12c2.5-6 5.5-6 9 0s6.5 6 9 0" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="12" r="8" strokeDasharray="2 3" />
          </>
        )
      case 15: // The Shadow — Eclipsed sphere
        return (
          <>
            <circle cx="12" cy="12" r="8" />
            <path d="M14.5 5.5a6.5 6.5 0 000 13 7 7 0 010-13z" />
          </>
        )
      case 16: // The Storm — Zenithspire & lightning arc
        return (
          <>
            <path d="M12 3l6 16H6L12 3z" />
            <path d="M4 11l4-2M16 9l4 2" />
          </>
        )
      case 17: // The Star — Eight-ray astrolabe
        return (
          <>
            <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" />
            <circle cx="12" cy="12" r="3" />
          </>
        )
      case 18: // The Dream — Crescent moon
        return (
          <>
            <path d="M17 15.5A7.5 7.5 0 019.5 4a8 8 0 1010.5 11.5z" />
          </>
        )
      case 19: // The Dawn — Meridian sun
        return (
          <>
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
          </>
        )
      case 20: // The Awakening — Resonance horn
      default:
        return (
          <>
            <path d="M18 8a6 6 0 00-12 0c0 6-3 8-3 8h18s-3-2-3-8" />
            <path d="M10 19a2 2 0 004 0" />
          </>
        )
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths()}
    </svg>
  )
}
