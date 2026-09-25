/**
 * Showroom worlds — how each project looks and sits in the homepage atlas.
 *
 * Every entry in PRODUCT_CATALOG becomes a world automatically. Worlds are
 * placed along a tilted helix that recedes into depth (−Z), one turn step per
 * project, so a new project simply becomes the next world further down the
 * route. A project without a hand-tuned look gets a stable palette derived
 * from its id, so the atlas never needs a new image to grow.
 */

import type { ProductEntry } from '@/config/product-catalog'

export type RingStyle = 'grooves' | 'wheel' | 'dust'

export interface WorldLook {
  /** Deep surface, mid surface and engraved-line / highlight colors. */
  base: string
  mid: string
  accent: string
  /** Thin atmosphere rim. */
  atmosphere: string
  /** 0 = rocky/marbled, 1 = strongly banded gas giant. */
  bands: number
  /** Noise frequency of the surface pattern. */
  detail: number
  /** Strength of the glowing engraved contour lines (the site's brass-engraving motif). */
  lines: number
  /** Specular gloss (lacquer, glass). */
  gloss: number
  /** Relative planet size. */
  size: number
  /** Axial spin, radians per second. */
  spin: number
  ring?: RingStyle
  /** Short sector label shown in the atlas HUD. */
  sector: { tr: string; en: string }
}

const LOOKS: Record<string, WorldLook> = {
  // Black lacquer disc with copper grooves → a glossy dark giant with a vinyl ring.
  'ai-music-detection': {
    base: '#0d0b0a', mid: '#3a2618', accent: '#e0a15a', atmosphere: '#d99a55',
    bands: 0.85, detail: 2.2, lines: 0.55, gloss: 0.9, size: 1.45, spin: 0.09, ring: 'grooves',
    sector: { tr: 'Ses · Araştırma', en: 'Sound · Research' },
  },
  // Tape and machined brass → striated bronze.
  'ml-toolkit': {
    base: '#1b140d', mid: '#6a4a26', accent: '#f0c47c', atmosphere: '#c9974f',
    bands: 0.6, detail: 3.4, lines: 0.75, gloss: 0.25, size: 1.1, spin: 0.14,
    sector: { tr: 'Veri · Araçlar', en: 'Data · Tooling' },
  },
  // Engraved brass wheel → golden world wearing a segmented wheel ring.
  'crown-fortune': {
    base: '#2a1b0a', mid: '#9a6a2c', accent: '#ffd98a', atmosphere: '#f0b95e',
    bands: 0.2, detail: 2.6, lines: 0.6, gloss: 0.45, size: 1.25, spin: 0.12, ring: 'wheel',
    sector: { tr: 'Ritüel · Günlük', en: 'Ritual · Daily' },
  },
  // Smoky quartz with amethyst traces.
  'crown-dreams': {
    base: '#120d18', mid: '#4a3560', accent: '#d7b8ff', atmosphere: '#a88bd6',
    bands: 0.15, detail: 1.8, lines: 0.5, gloss: 0.7, size: 1.15, spin: 0.07,
    sector: { tr: 'Yapay Zekâ · Günlük', en: 'AI · Journal' },
  },
  // Oxblood shellac.
  'crown-commend': {
    base: '#1a0908', mid: '#6b1f18', accent: '#f08c62', atmosphere: '#c9573d',
    bands: 0.7, detail: 2.8, lines: 0.45, gloss: 0.55, size: 1.05, spin: 0.16,
    sector: { tr: 'Yapay Zekâ · Metin', en: 'AI · Writing' },
  },
  // Olive enamel voting dial.
  'crown-vote': {
    base: '#10140b', mid: '#465a2a', accent: '#d9e29a', atmosphere: '#9fb465',
    bands: 0.35, detail: 3.0, lines: 0.65, gloss: 0.35, size: 1.0, spin: 0.2, ring: 'dust',
    sector: { tr: 'Masaüstü · Otomasyon', en: 'Desktop · Automation' },
  },
  // Coffee-glazed ceramic.
  'noir-grain': {
    base: '#140d08', mid: '#5b3a22', accent: '#f3dcb8', atmosphere: '#b9865a',
    bands: 0.05, detail: 5.0, lines: 0.35, gloss: 0.3, size: 1.05, spin: 0.1,
    sector: { tr: 'Web · Şablon', en: 'Web · Template' },
  },
  // Smoked glass lens with circuit etchings.
  kognita: {
    base: '#0a0f12', mid: '#27414a', accent: '#9ee7f0', atmosphere: '#6fb7c4',
    bands: 0.1, detail: 2.4, lines: 0.9, gloss: 1.0, size: 0.95, spin: 0.11,
    sector: { tr: 'Masaüstü · Gizlilik', en: 'Desktop · Privacy' },
  },
}

/** Stable 32-bit hash of a string (FNV-1a). */
function hash(id: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function hsl(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(c * 255).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/** A warm, on-palette look for projects that don't have a tuned one yet. */
export function derivedLook(id: string): WorldLook {
  const h = hash(id)
  const hue = 18 + (h % 38) // stays in the amber–ochre family
  const r = (shift: number) => ((h >>> shift) & 0xff) / 255
  return {
    base: hsl(hue, 0.35, 0.06),
    mid: hsl(hue, 0.45, 0.24 + r(8) * 0.1),
    accent: hsl(hue + 8, 0.85, 0.72),
    atmosphere: hsl(hue + 4, 0.6, 0.55),
    bands: r(16) * 0.8,
    detail: 2 + r(24) * 3,
    lines: 0.4 + r(4) * 0.4,
    gloss: r(12) * 0.6,
    size: 0.95 + r(20) * 0.35,
    spin: 0.08 + r(2) * 0.1,
    ...(r(28) > 0.7 ? { ring: 'dust' as const } : {}),
    sector: { tr: 'Yeni dünya', en: 'New world' },
  }
}

export function worldLook(entry: Pick<ProductEntry, 'id'>): WorldLook {
  return LOOKS[entry.id] ?? derivedLook(entry.id)
}

/** How far apart consecutive worlds sit along the route. */
export const WORLD_SPACING = 11

export interface WorldPlacement {
  position: [number, number, number]
  /** Axial tilt of the planet (radians, around X then Z). */
  tilt: [number, number]
}

/**
 * Position of the n-th world on the helix. Pure function of the index, so
 * adding a project never moves the existing ones.
 */
export function worldPlacement(index: number): WorldPlacement {
  const angle = 0.55 + index * 1.28
  const radial = 5.4 + (index % 3) * 0.7
  return {
    position: [
      Math.cos(angle) * radial,
      Math.sin(angle) * radial * 0.62,
      -7 - index * WORLD_SPACING,
    ],
    tilt: [0.25 + ((index * 37) % 10) * 0.035, -0.2 + ((index * 53) % 10) * 0.04],
  }
}
