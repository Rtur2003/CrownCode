/**
 * Site-wide constants shared by metadata, sitemap and locale routing.
 *
 * Locales are real URL prefixes (Next.js i18n sub-path routing): Turkish is
 * the unprefixed default and English lives under `/en`, so each language has
 * its own crawlable URL that hreflang alternates can point to.
 */

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

/**
 * Routes that are indexable and belong in the sitemap. Everything else under
 * `pages/` must either be listed here or in NOINDEX_ROUTES — a test enforces it.
 */
export const INDEXABLE_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: 1.0 },
  { path: '/ai-music-detection', changefreq: 'weekly', priority: 0.9 },
  { path: '/data-manipulation', changefreq: 'monthly', priority: 0.7 },
  { path: '/creator-studio', changefreq: 'monthly', priority: 0.7 },
  { path: '/crown-commend', changefreq: 'monthly', priority: 0.7 },
  { path: '/crown-fortune', changefreq: 'daily', priority: 0.7 },
  { path: '/crown-dreams', changefreq: 'monthly', priority: 0.7 },
  { path: '/crown-vote', changefreq: 'monthly', priority: 0.6 },
  { path: '/noir-grain', changefreq: 'monthly', priority: 0.6 },
  { path: '/privacy', changefreq: 'yearly', priority: 0.2 },
  { path: '/terms', changefreq: 'yearly', priority: 0.2 },
] as const

/**
 * schema.org application facts per product route. MainLayout turns the
 * matching entry into WebApplication/SoftwareApplication JSON-LD, using the
 * page's own localized title and description.
 */
export const APP_SCHEMA: Record<string, { category: string; os: string; type?: 'WebApplication' | 'SoftwareApplication' }> = {
  '/ai-music-detection': { category: 'MultimediaApplication', os: 'Web' },
  '/data-manipulation': { category: 'DeveloperApplication', os: 'Web' },
  '/creator-studio': { category: 'MultimediaApplication', os: 'Web' },
  '/crown-commend': { category: 'SocialNetworkingApplication', os: 'Web' },
  '/crown-fortune': { category: 'EntertainmentApplication', os: 'Web' },
  '/crown-dreams': { category: 'LifestyleApplication', os: 'Web' },
  '/crown-vote': { category: 'UtilitiesApplication', os: 'Windows 10, Windows 11', type: 'SoftwareApplication' },
  '/noir-grain': { category: 'DesignApplication', os: 'Web' },
}

/** Personal (localStorage), live-diagnostic or thin pages that stay out of the index. */
export const NOINDEX_ROUTES = ['/analysis-history', '/system-status', '/search', '/404', '/_error'] as const
