import localFont from 'next/font/local'

// Self-hosted, subset (Latin + Latin Extended-A for Turkish) WOFF2 files.
// next/font preloads them and generates size-adjusted fallbacks, replacing
// the render-blocking Google Fonts stylesheet and the raw TTF downloads.

export const imFell = localFont({
  src: './fonts/im-fell-double-pica-regular.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
  fallback: ['Times New Roman', 'serif'],
})

// Italic is only used by a few quote paragraphs (Fortune, Dreams), so it is
// its own family that isn't preloaded on every page; see --font-family-italic.
export const imFellItalic = localFont({
  src: './fonts/im-fell-double-pica-italic.woff2',
  weight: '400',
  style: 'italic',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Times New Roman',
  fallback: ['Times New Roman', 'serif'],
})

// Portmanteau shipped without ş/ğ/ı/İ; scripts/add-turkish-glyphs.py builds
// them from the font's own cedilla, dieresis and dotless i so Turkish
// headings no longer fall back to another typeface mid-word.
export const portmanteau = localFont({
  src: './fonts/portmanteau-regular.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
  fallback: ['Georgia', 'serif'],
})

// Fontsource's latin + latin-ext subsets merged into one file per weight,
// so builds don't depend on reaching Google Fonts.
export const jetbrainsMono = localFont({
  src: [
    { path: './fonts/jetbrains-mono-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/jetbrains-mono-500.woff2', weight: '500', style: 'normal' },
  ],
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  fallback: ['Courier New', 'monospace'],
})
