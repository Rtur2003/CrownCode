import {
  PRODUCT_CATALOG,
  SEARCH_REGISTRY,
  FOOTER_PRODUCT_IDS,
  FOOTER_PRODUCT_LOCALE_MAP,
  getProductHref,
  resolveKey,
} from '@/config/product-catalog'

describe('product-catalog helpers', () => {
  describe('getProductHref', () => {
    it('returns href for a PRODUCT_CATALOG entry', () => {
      expect(getProductHref('ai-music-detection')).toBe('/ai-music-detection')
      expect(getProductHref('ml-toolkit')).toBe('/data-manipulation')
    })

    it('returns href for a SEARCH_REGISTRY entry not in catalog', () => {
      expect(getProductHref('creator-studio')).toBe('/creator-studio')
      expect(getProductHref('system-status')).toBe('/system-status')
    })

    it('returns "/" for unknown IDs', () => {
      expect(getProductHref('nonexistent')).toBe('/')
    })
  })

  describe('FOOTER_PRODUCT_IDS', () => {
    it('every ID resolves to a valid href', () => {
      for (const id of FOOTER_PRODUCT_IDS) {
        const href = getProductHref(id)
        expect(href).not.toBe('/')
      }
    })

    it('every ID has a locale map entry', () => {
      for (const id of FOOTER_PRODUCT_IDS) {
        expect(FOOTER_PRODUCT_LOCALE_MAP[id]).toBeDefined()
      }
    })
  })

  describe('resolveKey', () => {
    const t = {
      a: { b: { c: 'deep value' } },
      flat: 'top level',
    }

    it('resolves nested dot-path keys', () => {
      expect(resolveKey(t, 'a.b.c')).toBe('deep value')
    })

    it('resolves top-level keys', () => {
      expect(resolveKey(t, 'flat')).toBe('top level')
    })

    it('throws for missing keys in dev/test', () => {
      expect(() => resolveKey(t, 'a.b.missing')).toThrow('[resolveKey] Missing locale key: "a.b.missing"')
    })

    it('throws for non-string values in dev/test', () => {
      expect(() => resolveKey(t, 'a.b')).toThrow('[resolveKey] Missing locale key: "a.b"')
    })
  })

  describe('catalog integrity', () => {
    it('all PRODUCT_CATALOG entries have unique IDs', () => {
      const ids = PRODUCT_CATALOG.map((e) => e.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('all SEARCH_REGISTRY entries have unique IDs', () => {
      const ids = SEARCH_REGISTRY.map((e) => e.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('no ID collision between PRODUCT_CATALOG and SEARCH_REGISTRY', () => {
      const catalogIds = new Set(PRODUCT_CATALOG.map((e) => e.id))
      for (const entry of SEARCH_REGISTRY) {
        expect(catalogIds.has(entry.id)).toBe(false)
      }
    })
  })
})
