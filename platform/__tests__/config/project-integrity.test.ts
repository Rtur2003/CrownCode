/* eslint-disable @typescript-eslint/no-non-null-assertion -- tests read data they have just checked exists */
/**
 * What a project needs, checked for every entry in the catalog. Adding a project
 * to PRODUCT_CATALOG without its page, text, images or look fails here, with the
 * missing piece named in the test title. See docs/ADDING_A_PROJECT.md.
 */

import fs from 'fs'
import path from 'path'
import en from '@/locales/en.json'
import tr from '@/locales/tr.json'
import { PRODUCT_CATALOG, internalProjects, slugOf } from '@/config/product-catalog'
import { APP_SCHEMA, INDEXABLE_ROUTES, ogImagePath } from '@/config/site'
import { RENDERED_WORLDS, worldImage, worldLook, worldName, worldPlacement } from '@/config/showroom-worlds'

const root = path.resolve(__dirname, '../..')
const exists = (...parts: string[]) => fs.existsSync(path.join(root, ...parts))
const ogScript = fs.readFileSync(path.join(root, 'scripts/generate-og-images.mjs'), 'utf8')

type Item = Record<string, unknown>
const itemOf = (locale: typeof en, key: string) => (locale.products.items as Record<string, Item>)[key]

describe('the catalog as a whole', () => {
  it('gives every project its own id, locale key and route', () => {
    for (const field of ['id', 'localeKey', 'href'] as const) {
      const values = PRODUCT_CATALOG.map(entry => entry[field])
      expect(values.filter((value, index) => values.indexOf(value) !== index)).toEqual([])
    }
  })

  it('has a rendered thumbnail for exactly the worlds that list one', () => {
    const files = fs.readdirSync(path.join(root, 'public/images/atlas'))
      .filter(name => /^world-.+\.webp$/.test(name))
      .map(name => name.replace(/^world-/, '').replace(/\.webp$/, ''))
      .sort()
    expect([...RENDERED_WORLDS].sort()).toEqual(files)
  })

  it('has a generic planet for a project that has no thumbnail yet', () => {
    expect(exists('public/images/showroom/planet-generic.webp')).toBe(true)
    expect(worldImage('a-project-that-does-not-exist-yet')).toBe('/images/showroom/planet-generic.webp')
  })

  it('can place one more world than there are today', () => {
    const { position, tilt } = worldPlacement(PRODUCT_CATALOG.length)
    expect([...position, ...tilt].every(Number.isFinite)).toBe(true)
  })
})

describe.each(PRODUCT_CATALOG.map(entry => [entry.id, entry] as const))('project %s', (_id, entry) => {
  it.each([['en', en], ['tr', tr]] as const)('has its text in %s', (_language, locale) => {
    const item = itemOf(locale, entry.localeKey)
    expect(item).toBeDefined()
    // `status` is only filled in when something is worth saying (in development, experimental); the rest is empty.
    expect(typeof item!.status).toBe('string')
    for (const field of ['title', 'description', 'showroomDescription', 'stats']) {
      expect(typeof item![field]).toBe('string')
      expect((item![field] as string).trim()).not.toBe('')
    }
    // Features are optional; when a project lists some they are plain strings.
    if ('features' in item!) {expect((item!.features as unknown[]).every(feature => typeof feature === 'string')).toBe(true)}
    expect(JSON.stringify(item)).not.toMatch(/TODO/)
  })

  it('has a name short enough for a label', () => {
    const name = worldName(entry, (itemOf(en, entry.localeKey)!.title as string))
    expect(name.length).toBeGreaterThan(0)
    expect(name.length).toBeLessThanOrEqual(24)
  })

  it('has a look the atlas can draw', () => {
    const look = worldLook(entry)
    for (const colour of [look.base, look.mid, look.accent, look.atmosphere]) {expect(colour).toMatch(/^#[0-9a-f]{6}$/i)}
    // A project without a hand-written sector shows its `stats` text instead.
    expect(look.sector.en || (itemOf(en, entry.localeKey)!.stats as string)).toBeTruthy()
    expect(look.sector.tr || (itemOf(tr, entry.localeKey)!.stats as string)).toBeTruthy()
  })

  if (entry.href.startsWith('/')) {
    const slug = slugOf(entry.href)

    it('has a page', () => {
      expect(exists('pages', slug, 'index.tsx') || exists('pages', `${slug}.tsx`)).toBe(true)
    })

    it('is in the sitemap with the date of its last change', () => {
      const route = INDEXABLE_ROUTES.find(candidate => candidate.path === entry.href)
      expect(route?.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('tells schema.org what it is', () => {
      expect(APP_SCHEMA[entry.href]?.category).toBeTruthy()
    })

    it('has a social image, and the script that makes them knows it', () => {
      expect(ogImagePath(entry.href)).toBe(`/og/${slug}.jpg`)
      expect(exists('public/og', `${slug}.jpg`)).toBe(true)
      expect(ogScript).toContain(`file: '${slug}'`)
    })
  }
})

describe('the projects with a page here', () => {
  it('are all in the sitemap', () => {
    const paths = new Set(INDEXABLE_ROUTES.map(route => route.path))
    expect(internalProjects().filter(entry => !paths.has(entry.href))).toEqual([])
  })
})
