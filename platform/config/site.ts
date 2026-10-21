/**
 * Site-wide constants shared by metadata, sitemap and locale routing.
 *
 * Locales are real URL prefixes (Next.js i18n sub-path routing): Turkish is
 * the unprefixed default and English lives under `/en`, so each language has
 * its own crawlable URL that hreflang alternates can point to.
 */

import { internalProjects, slugOf, type AppSchema } from '@/config/product-catalog'

export const SITE_URL = 'https://hasan-arthur-altuntas.xyz'
export const SITE_NAME = 'CrownCode'
export const AUTHOR_NAME = 'Hasan Arthur Altuntaş'
export const MUSIC_SITE_URL = 'https://hasan-arthur-altuntas.com.tr'
export const GITHUB_URL = 'https://github.com/Rtur2003'

export const LOCALES = ['tr', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'tr'

export const OG_LOCALE: Record<Locale, string> = { tr: 'tr_TR', en: 'en_US' }
export const HREFLANG: Record<Locale, string> = { tr: 'tr-TR', en: 'en-US' }

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/** Strip query/hash and trailing slash so `/x?y#z` and `/x/` both map to `/x`. */
export function normalizePath(asPath: string): string {
  const path = asPath.split(/[?#]/)[0] || '/'
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
}

/** Absolute URL of `path` in `locale` (default locale stays unprefixed). */
export function localizedUrl(path: string, locale: Locale): string {
  const clean = normalizePath(path)
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`
  if (clean === '/') {
    return `${SITE_URL}${prefix || '/'}`
  }
  return `${SITE_URL}${prefix}${clean}`
}

/** Pages that are not projects of their own but belong in the index. */
const STANDALONE_ROUTES = [
  { path: '/creator-studio', lastmod: '2026-10-21', schema: { category: 'MultimediaApplication', os: 'Web' } as AppSchema },
  { path: '/privacy', lastmod: '2026-10-21' },
  { path: '/terms', lastmod: '2026-10-21' },
] as const

/**
 * Routes that are indexable and belong in the sitemap: the home page, every
 * project in the catalog that has a page here, and the standalone pages above.
 * Everything else under `pages/` must be here or in NOINDEX_ROUTES; a test
 * enforces it. `lastmod` is the date the page's content last changed (the
 * catalog's `updated`); bump it with the edit. Google ignores changefreq and
 * priority, so they are not emitted.
 */
export const INDEXABLE_ROUTES: readonly { path: string; lastmod: string }[] = [
  { path: '/', lastmod: '2026-10-21' },
  ...internalProjects().map(entry => ({ path: entry.href, lastmod: entry.updated ?? '2026-10-21' })),
  ...STANDALONE_ROUTES.map(({ path, lastmod }) => ({ path, lastmod })),
]

/**
 * schema.org application facts per route. MainLayout turns the matching entry
 * into WebApplication/SoftwareApplication JSON-LD, using the page's own
 * localized title and description.
 */
export const APP_SCHEMA: Record<string, AppSchema> = {
  ...Object.fromEntries(internalProjects().flatMap(entry => (entry.schema ? [[entry.href, entry.schema]] : []))),
  ...Object.fromEntries(STANDALONE_ROUTES.flatMap(route => ('schema' in route ? [[route.path, route.schema]] : []))),
}

/** Social preview image of a route: `public/og/<route>.jpg`, or the default for pages without one. */
export function ogImagePath(pathname: string): string {
  return pathname in APP_SCHEMA ? `/og/${slugOf(pathname)}.jpg` : '/og/default.jpg'
}

/** Personal (localStorage), live-diagnostic or thin pages that stay out of the index. */
export const NOINDEX_ROUTES = ['/analysis-history', '/system-status', '/search', '/404', '/_error'] as const
