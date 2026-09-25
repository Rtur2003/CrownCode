import fs from 'fs'
import path from 'path'
import React from 'react'
import { render } from '@testing-library/react'
import {
  INDEXABLE_ROUTES,
  NOINDEX_ROUTES,
  SITE_URL,
  localizedUrl,
  normalizePath,
} from '@/config/site'
import { buildSitemap } from '@/config/sitemap'

const mockRouter = { pathname: '/', asPath: '/', locale: 'tr', query: {}, isReady: true, push: jest.fn(), replace: jest.fn() }

jest.mock('next/router', () => ({ useRouter: () => mockRouter }))
jest.mock('next/head', () => function Head({ children }: { children: React.ReactNode }) {
  return <>{children}</>
})
jest.mock('@/components/Layout/Header', () => ({ Header: () => null }))
jest.mock('@/components/Layout/Footer', () => ({ Footer: () => null }))

const PAGES_DIR = path.join(__dirname, '..', '..', 'pages')

function pageRoutes(dir = PAGES_DIR, prefix = ''): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return entry.name === 'api' ? [] : pageRoutes(path.join(dir, entry.name), `${prefix}/${entry.name}`)
    }
    if (!/\.tsx?$/.test(entry.name)) {return []}
    const name = entry.name.replace(/\.tsx?$/, '')
    if (['_app', '_document', 'sitemap.xml'].includes(name)) {return []}
    return [name === 'index' ? prefix || '/' : `${prefix}/${name}`]
  })
}

function setRoute(pathname: string, locale: 'tr' | 'en') {
  mockRouter.pathname = pathname
  mockRouter.asPath = pathname
  mockRouter.locale = locale
}

async function renderLayout(props: Record<string, unknown> = {}) {
  const { LanguageProvider } = await import('@/context/LanguageContext')
  const { MainLayout } = await import('@/components/Layout/MainLayout')
  return render(
    <LanguageProvider>
      <MainLayout title="Crown Dreams - Journal" description="Dream journal" {...props}>
        <p>content</p>
      </MainLayout>
    </LanguageProvider>,
  )
}

describe('route classification', () => {
  it('lists every page as either indexable or noindex', () => {
    const known = new Set<string>([...INDEXABLE_ROUTES.map((r) => r.path), ...NOINDEX_ROUTES])
    const unclassified = pageRoutes().filter((route) => !known.has(route))
    expect(unclassified).toEqual([])
  })

  it('never lists a route as both indexable and noindex', () => {
    const noindex = new Set<string>(NOINDEX_ROUTES)
    expect(INDEXABLE_ROUTES.filter((r) => noindex.has(r.path))).toEqual([])
  })
})

describe('localizedUrl', () => {
  it('keeps Turkish unprefixed and puts English under /en', () => {
    expect(localizedUrl('/', 'tr')).toBe(`${SITE_URL}/`)
    expect(localizedUrl('/', 'en')).toBe(`${SITE_URL}/en`)
    expect(localizedUrl('/crown-vote', 'tr')).toBe(`${SITE_URL}/crown-vote`)
    expect(localizedUrl('/crown-vote', 'en')).toBe(`${SITE_URL}/en/crown-vote`)
  })

  it('drops query strings, hashes and trailing slashes', () => {
    expect(normalizePath('/search?q=auris#top')).toBe('/search')
    expect(normalizePath('/terms/')).toBe('/terms')
  })
})

describe('sitemap', () => {
  const xml = buildSitemap()

  it('contains every indexable route in both languages', () => {
    for (const route of INDEXABLE_ROUTES) {
      expect(xml).toContain(`<loc>${localizedUrl(route.path, 'tr')}</loc>`)
      expect(xml).toContain(`<loc>${localizedUrl(route.path, 'en')}</loc>`)
    }
    expect(xml.match(/<url>/g)).toHaveLength(INDEXABLE_ROUTES.length * 2)
  })

  it('declares reciprocal hreflang alternates and x-default', () => {
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
    expect(xml).toContain(`hreflang="en-US" href="${SITE_URL}/en/ai-music-detection"`)
    expect(xml).toContain(`hreflang="x-default" href="${SITE_URL}/ai-music-detection"`)
  })

  it('leaves noindexed pages out', () => {
    for (const route of NOINDEX_ROUTES) {
      expect(xml).not.toContain(`${SITE_URL}${route}<`)
    }
  })
})

describe('robots.txt', () => {
  const robots = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'robots.txt'), 'utf8')

  it('lets crawlers fetch the JS/CSS they need to render pages', () => {
    expect(robots).not.toMatch(/Disallow:\s*\/_next/)
  })

  it('points at the sitemap', () => {
    expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`)
  })
})

// React 19 hoists <title>, <meta> and <link> into document.head.
const head = () => document.head

describe('MainLayout metadata', () => {
  it('uses a self-referencing canonical per route and language', async () => {
    setRoute('/crown-dreams', 'en')
    await renderLayout()
    expect(head().querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${SITE_URL}/en/crown-dreams`)
    const alternates = Array.from(head().querySelectorAll('link[rel="alternate"]')).map((l) => [
      l.getAttribute('hreflang'),
      l.getAttribute('href'),
    ])
    expect(alternates).toEqual([
      ['tr-TR', `${SITE_URL}/crown-dreams`],
      ['en-US', `${SITE_URL}/en/crown-dreams`],
      ['x-default', `${SITE_URL}/crown-dreams`],
    ])
    expect(head().querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe('en_US')
  })

  it('adds the brand to the title once', async () => {
    setRoute('/crown-dreams', 'tr')
    await renderLayout()
    expect(document.title || document.querySelector('title')?.textContent).toBe('Crown Dreams - Journal | CrownCode')
  })

  it('omits canonical and hreflang on noindex pages', async () => {
    setRoute('/search', 'tr')
    await renderLayout({ noIndex: true })
    expect(head().querySelector('link[rel="canonical"]')).toBeNull()
    expect(head().querySelector('link[rel="alternate"]')).toBeNull()
    expect(head().querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow')
  })

  it('emits valid JSON-LD with breadcrumb and application nodes', async () => {
    setRoute('/crown-dreams', 'tr')
    const { container } = await renderLayout()
    const script = container.querySelector('script[type="application/ld+json"]')
    const data = JSON.parse(script?.innerHTML ?? '{}')
    const types = data['@graph'].map((node: { '@type': string }) => node['@type'])
    expect(types).toEqual(expect.arrayContaining(['WebPage', 'WebApplication', 'Person']))
    const page = data['@graph'].find((node: { '@type': string }) => node['@type'] === 'WebPage')
    expect(page.breadcrumb.itemListElement[1]).toMatchObject({ name: 'Crown Dreams', item: `${SITE_URL}/crown-dreams` })
  })

  it('renders a skip link to the main landmark', async () => {
    setRoute('/terms', 'tr')
    const { container } = await renderLayout()
    expect(container.querySelector('a.skip-link')?.getAttribute('href')).toBe('#main-content')
    expect(container.querySelector('main#main-content')).not.toBeNull()
  })
})
