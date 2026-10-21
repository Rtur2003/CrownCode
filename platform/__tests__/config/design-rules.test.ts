/**
 * The site's house rules, as checks. These are the things that make an interface
 * read as generated, and they came up one by one while the pages were rebuilt:
 * numbered markers, tracked all-caps labels, gradient text, side stripes and
 * copy full of dashes and exclamation marks. A new page or a new project passes
 * or fails here before anyone has to notice by eye. See docs/ADDING_A_PROJECT.md.
 */

import fs from 'fs'
import path from 'path'
import en from '@/locales/en.json'
import tr from '@/locales/tr.json'

const root = path.resolve(__dirname, '../..')

const walk = (dir: string, extensions: string[]): string[] =>
  fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(entry => {
    const rel = path.join(dir, entry.name)
    if (entry.isDirectory()) {return walk(rel, extensions)}
    return extensions.some(ext => entry.name.endsWith(ext)) ? [rel] : []
  })

const css = ['components', 'pages', 'styles'].flatMap(dir => walk(dir, ['.css']))
const tsx = ['components', 'pages'].flatMap(dir => walk(dir, ['.tsx']))

const offenders = (files: string[], pattern: RegExp) =>
  files.filter(file => pattern.test(fs.readFileSync(path.join(root, file), 'utf8')))

describe('stylesheets', () => {
  it('have no all-caps labels', () => {
    expect(offenders(css, /text-transform:\s*uppercase/)).toEqual([])
  })

  it('have no gradient text', () => {
    expect(offenders(css, /background-clip:\s*text/)).toEqual([])
  })

  it('have no coloured stripe down one side of a box', () => {
    expect(offenders(css, /border-(left|right|inline-start|inline-end):\s*[2-9]px/)).toEqual([])
  })

  it('have no zero-padded counters', () => {
    expect(offenders(css, /decimal-leading-zero/)).toEqual([])
  })
})

describe('components and pages', () => {
  it('do not number things with a padded index', () => {
    expect(offenders(tsx, /\{\s*pad\(/)).toEqual([])
  })

  it('do not use all-caps utility classes', () => {
    expect(offenders(tsx, /className="[^"]*\buppercase\b/)).toEqual([])
  })
})

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }
const strings = (value: Json, trail = ''): Array<[string, string]> => {
  if (typeof value === 'string') {return [[trail, value]]}
  if (Array.isArray(value)) {return value.flatMap((item, index) => strings(item, `${trail}[${index}]`))}
  if (value && typeof value === 'object') {return Object.entries(value).flatMap(([key, item]) => strings(item, trail ? `${trail}.${key}` : key))}
  return []
}

describe.each([['en', en], ['tr', tr]] as const)('copy in %s', (_language, locale) => {
  const all = strings(locale as Json)
  const bad = (pattern: RegExp) => all.filter(([, text]) => pattern.test(text)).map(([key]) => key)

  it('has no dash used as punctuation', () => {
    expect(bad(/\s[—–]\s|[—–]\s*$/)).toEqual([])
  })

  it('has no exclamation marks', () => {
    expect(bad(/!/)).toEqual([])
  })

  it('has no emoji', () => {
    expect(bad(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u)).toEqual([])
  })

  it('has no "03 / 08" style counters', () => {
    expect(bad(/\b\d{2}\s*\/\s*\d{2}\b/)).toEqual([])
  })

  it('has no leftover placeholders', () => {
    expect(bad(/\bTODO\b|lorem ipsum/i)).toEqual([])
  })
})
