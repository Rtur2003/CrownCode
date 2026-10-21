// Adds a project to the site: its page, its catalog entry, its text and its social
// card. Everything else (atlas world, header, footer badge, search, sitemap,
// structured data) is derived from the catalog.
//
//   node scripts/new-project.mjs --route my-tool --name "My Tool" --icon Wrench
//   node scripts/new-project.mjs --route my-tool --name "My Tool" --icon Wrench --dry-run
//
// Options: --id (default: the route), --key (locale key, default: camelCase of the
// id), --schema (schema.org category, default WebApplication), --os (default Web).
// The text it writes into the locale files says TODO on purpose: the integrity
// test (__tests__/config/project-integrity.test.ts) stays red until it is replaced.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const file = (...parts) => path.join(root, ...parts)

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) {continue}
    const key = argv[i].slice(2)
    const next = argv[i + 1]
    if (next === undefined || next.startsWith('--')) {out[key] = true} else {out[key] = next; i++}
  }
  return out
}

const args = parseArgs(process.argv.slice(2))
const fail = (message) => { console.error(`new-project: ${message}`); process.exit(1) }

// Git Bash on Windows rewrites a leading-slash argument into a drive path, so the slash is optional.
const rawRoute = String(args.route ?? '').replace(/^[A-Za-z]:[\/].*[\/]/, '')
const route = rawRoute && !rawRoute.startsWith('/') ? `/${rawRoute}` : rawRoute
const name = String(args.name ?? '')
const icon = String(args.icon ?? '')
if (!/^\/[a-z0-9]+(-[a-z0-9]+)*$/.test(route)) {fail('--route must look like /my-tool')}
if (!name.trim()) {fail('--name is required, e.g. --name "My Tool"')}
if (!/^[A-Z][A-Za-z0-9]*$/.test(icon)) {fail('--icon must be a lucide-react icon name, e.g. Wrench')}

const slug = route.slice(1)
const id = String(args.id ?? slug)
const camel = id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())
const localeKey = String(args.key ?? camel)
const schema = String(args.schema ?? 'WebApplication')
const os = String(args.os ?? 'Web')
const dry = Boolean(args['dry-run'])
const today = new Date().toISOString().slice(0, 10)

const read = (p) => fs.readFileSync(p, 'utf8')
const write = (p, text) => {
  console.log(`${dry ? 'would write' : 'wrote'} ${path.relative(root, p)}`)
  if (!dry) {fs.writeFileSync(p, text)}
}

// ── checks: nothing is overwritten, nothing is added twice ───────────
const catalogPath = file('config/product-catalog.ts')
const catalog = read(catalogPath)
if (catalog.includes(`id: '${id}'`) || catalog.includes(`href: '${route}'`)) {fail(`${id} or ${route} is already in the catalog`)}
const pagePath = file('pages', slug, 'index.tsx')
if (fs.existsSync(pagePath) || fs.existsSync(file('pages', `${slug}.tsx`))) {fail(`a page for ${route} already exists`)}
try {
  const lucide = await import('lucide-react')
  if (!(icon in lucide)) {fail(`lucide-react has no icon called ${icon}`)}
} catch (error) {
  if (error?.code !== 'ERR_MODULE_NOT_FOUND') {throw error}
}

// ── the page ─────────────────────────────────────────────────────────
const page = `// ${name}: what the page is for, in one line.

import React from 'react'
import type { NextPage } from 'next'
import { MainLayout } from '@/components/Layout/MainLayout'
import { WorldPage } from '@/components/UI/WorldPage'
import { PRODUCT_CATALOG, resolveProduct } from '@/config/product-catalog'
import { worldName } from '@/config/showroom-worlds'
import { useLanguage } from '@/context/LanguageContext'
import world from '@/styles/components/world-page.module.css'

const ENTRY = PRODUCT_CATALOG.find(entry => entry.id === '${id}')

const ${camel.replace(/^./, c => c.toUpperCase())}Page: NextPage = () => {
  const { t } = useLanguage()
  if (!ENTRY) {return null}
  const item = resolveProduct(ENTRY, t)
  const heading = (t.products?.items?.['${localeKey}']?.heading as string | undefined) ?? item.title

  return (
    <MainLayout title={item.title} description={item.description}>
      <WorldPage world="${id}" title={worldName(ENTRY, item.title)} lead={item.showroomDescription}>
        <section className={world.section} aria-labelledby="${slug}-about">
          <div className={world.sectionHead}>
            <h2 id="${slug}-about">{heading}</h2>
          </div>
          <div className={world.sectionBody}>
            <p className={world.interpretation}>{item.description}</p>
            {/* The tool itself goes here. Fields, buttons and results: world.field, world.input,
                world.primary, world.reading (styles/components/world-page.module.css). */}
          </div>
        </section>
      </WorldPage>
    </MainLayout>
  )
}

export default ${camel.replace(/^./, c => c.toUpperCase())}Page
`
fs.mkdirSync(path.dirname(pagePath), { recursive: true })
write(pagePath, page)

// ── the catalog entry ────────────────────────────────────────────────
const entry = `  {
    id: '${id}',
    localeKey: '${localeKey}',
    href: '${route}',
    icon: ${icon},
    gradient: 'from-stone-700 via-amber-600 to-yellow-500',
    category: 'project',
    schema: { category: '${schema}', os: '${os}' },
    updated: '${today}',
  },
`
const marker = '\n] as const\n\n/** The project\'s route without its slash'
if (!catalog.includes(marker)) {fail('could not find the end of PRODUCT_CATALOG in config/product-catalog.ts')}
let nextCatalog = catalog.replace(marker, `\n${entry.replace(/\n$/, '')}${marker}`)
const iconImport = nextCatalog.match(/import \{([^}]*)\} from 'lucide-react'\n/)
if (!iconImport) {fail('could not find the lucide-react import in config/product-catalog.ts')}
if (!iconImport[1].split(',').map(s => s.trim()).includes(icon)) {
  nextCatalog = nextCatalog.replace(iconImport[0], `import {${iconImport[1].replace(/\s+$/, '')}, ${icon} } from 'lucide-react'\n`)
}
write(catalogPath, nextCatalog)

// ── the text, in both languages ──────────────────────────────────────
for (const lang of ['en', 'tr']) {
  const p = file('locales', `${lang}.json`)
  const json = JSON.parse(read(p))
  json.products.items[localeKey] = {
    title: `${name}: TODO what it does`,
    description: 'TODO one or two plain sentences about what it is and who it is for.',
    showroomDescription: 'TODO one plain sentence for the atlas.',
    status: '',
    stats: 'TODO',
    heading: 'TODO a short heading for the first section of the page.',
  }
  write(p, `${JSON.stringify(json, null, 2)}\n`)
}

// ── the social card ──────────────────────────────────────────────────
const ogPath = file('scripts/generate-og-images.mjs')
const og = read(ogPath)
const ogMarker = '\n]\n\nconst escape'
if (!og.includes(ogMarker)) {fail('could not find the CARDS list in scripts/generate-og-images.mjs')}
write(ogPath, og.replace(ogMarker, `\n  { file: '${slug}', world: '${id}', title: '${name.replace(/'/g, "\\'")}', line: 'TODO' },${ogMarker}`))

console.log(`
${dry ? 'Dry run: nothing was written.\n' : ''}Left for you:
  1. Replace every TODO in locales/en.json and locales/tr.json (products.items.${localeKey}).
  2. Build the tool in pages/${slug}/index.tsx and give the OG card its line in scripts/generate-og-images.mjs.
  3. node scripts/generate-og-images.mjs   (writes public/og/${slug}.jpg)
  4. Optional: render the planet (scripts/capture-atlas-assets.py), add '${id}' to RENDERED_WORLDS
     in config/showroom-worlds.ts and give it a hand-tuned look there. Until then it gets the generic
     planet and a look derived from its id.
  5. npx jest __tests__/config   (green means the project is complete)
`)
