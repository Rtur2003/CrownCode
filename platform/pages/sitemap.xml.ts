/**
 * /sitemap.xml — generated from config/site.ts so it can't drift from the
 * real routes. Every indexable page is listed once per language with
 * reciprocal hreflang alternates (Google's sitemap flavour of hreflang).
 */

import type { GetServerSideProps } from 'next'
import { DEFAULT_LOCALE } from '@/config/site'
import { buildSitemap } from '@/config/sitemap'

export const getServerSideProps: GetServerSideProps = async ({ res, locale }) => {
  // One canonical sitemap URL; /en/sitemap.xml isn't a thing.
  if (locale && locale !== DEFAULT_LOCALE) {
    return { notFound: true }
  }
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400')
  res.write(buildSitemap())
  res.end()
  return { props: {} }
}

export default function Sitemap() {
  return null
}
