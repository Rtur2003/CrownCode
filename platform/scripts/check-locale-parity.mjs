#!/usr/bin/env node

/**
 * i18n Locale Parity Checker
 * Validates that en.json and tr.json have identical key structures
 * and matching placeholder patterns (e.g. {{count}}).
 *
 * Exit 1 on any mismatch — designed for CI quality gate.
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const localesDir = resolve(__dirname, '..', 'locales')

const en = JSON.parse(readFileSync(resolve(localesDir, 'en.json'), 'utf8'))
const tr = JSON.parse(readFileSync(resolve(localesDir, 'tr.json'), 'utf8'))

const errors = []

function collectKeys(obj, prefix = '') {
  const keys = new Set()
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const val = obj[key]
    if (Array.isArray(val)) {
      // Track the array itself as a key (for length parity)
      keys.add(fullKey)
      // Recurse into object elements: array[0].title, array[1].title, etc.
      val.forEach((item, i) => {
        if (typeof item === 'object' && item !== null) {
          for (const sub of collectKeys(item, `${fullKey}[${i}]`)) {
            keys.add(sub)
          }
        }
      })
    } else if (typeof val === 'object' && val !== null) {
      for (const sub of collectKeys(val, fullKey)) {
        keys.add(sub)
      }
    } else {
      keys.add(fullKey)
    }
  }
  return keys
}

function getNestedValue(obj, path) {
  // Handle paths like "a.b[0].c" by splitting on . and then resolving [N] segments
  const segments = path.split('.').flatMap((seg) => {
    const parts = []
    const re = /^([^[]*)?(?:\[(\d+)\])?$/
    const m = seg.match(re)
    if (m) {
      if (m[1] !== undefined && m[1] !== '') parts.push(m[1])
      if (m[2] !== undefined) parts.push(Number(m[2]))
    } else {
      parts.push(seg)
    }
    return parts
  })
  return segments.reduce((o, k) => (o != null ? o[k] : undefined), obj)
}

function extractPlaceholders(str) {
  if (typeof str !== 'string') return []
  const matches = str.match(/\{\{?\w+\}?\}/g)
  return matches ? matches.sort() : []
}

// 1. Key parity check
const enKeys = collectKeys(en)
const trKeys = collectKeys(tr)

for (const key of enKeys) {
  if (!trKeys.has(key)) {
    errors.push(`MISSING in tr.json: ${key}`)
  }
}

for (const key of trKeys) {
  if (!enKeys.has(key)) {
    errors.push(`MISSING in en.json: ${key}`)
  }
}

// 2. Array length parity check
for (const key of enKeys) {
  if (!trKeys.has(key)) continue
  const enVal = getNestedValue(en, key)
  const trVal = getNestedValue(tr, key)
  if (Array.isArray(enVal) && Array.isArray(trVal) && enVal.length !== trVal.length) {
    errors.push(`ARRAY LENGTH MISMATCH at ${key}: en=${enVal.length} tr=${trVal.length}`)
  }
}

// 3. Placeholder parity check (only for keys present in both)
for (const key of enKeys) {
  if (!trKeys.has(key)) continue
  const enVal = getNestedValue(en, key)
  const trVal = getNestedValue(tr, key)
  const enPh = extractPlaceholders(enVal)
  const trPh = extractPlaceholders(trVal)
  if (enPh.join(',') !== trPh.join(',')) {
    errors.push(`PLACEHOLDER MISMATCH at ${key}: en=${JSON.stringify(enPh)} tr=${JSON.stringify(trPh)}`)
  }
}

if (errors.length > 0) {
  console.error(`\n❌ Locale parity check failed (${errors.length} issues):\n`)
  errors.forEach((e) => console.error(`  - ${e}`))
  console.error('')
  process.exit(1)
} else {
  console.log('✅ Locale parity check passed.')
}
