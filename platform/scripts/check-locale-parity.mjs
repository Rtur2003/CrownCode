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
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      for (const sub of collectKeys(obj[key], fullKey)) {
        keys.add(sub)
      }
    } else {
      keys.add(fullKey)
    }
  }
  return keys
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj)
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

// 2. Placeholder parity check (only for keys present in both)
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
