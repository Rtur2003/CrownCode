/**
 * XML sitemap for every indexable route in every language, with reciprocal
 * hreflang alternates. Served by pages/sitemap.xml.ts.
 */

import { DEFAULT_LOCALE, HREFLANG, INDEXABLE_ROUTES, LOCALES, localizedUrl } from '@/config/site'

export function buildSitemap(): string {
  const urls = INDEXABLE_ROUTES.flatMap((route) =>
    LOCALES.map((locale) => {
      const alternates = [
        ...LOCALES.map((alt) =>
          `    <xhtml:link rel="alternate" hreflang="${HREFLANG[alt]}" href="${localizedUrl(route.path, alt)}"/>`),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${localizedUrl(route.path, DEFAULT_LOCALE)}"/>`,
      ].join('\n')
      return [
        '  <url>',
        `    <loc>${localizedUrl(route.path, locale)}</loc>`,
        alternates,
        `    <changefreq>${route.changefreq}</changefreq>`,
        `    <priority>${route.priority.toFixed(1)}</priority>`,
        '  </url>',
      ].join('\n')
    }),
  )

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}
