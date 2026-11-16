import { INDEXABLE_ROUTES, NOINDEX_ROUTES } from '@/config/site'
import { bottomAdPlacementFor } from '@/config/ads'

describe('Google AdSense placement routing', () => {
  it('assigns bottom ad placements to all indexable content pages except legal pages', () => {
    const adEligible = INDEXABLE_ROUTES
      .map(r => r.path)
      .filter(p => p !== '/privacy' && p !== '/terms')

    for (const route of adEligible) {
      expect(bottomAdPlacementFor(route)).toBeTruthy()
    }
  })

  it('keeps legal, noindex, search, dashboard and utility routes ad-free', () => {
    for (const route of ['/privacy', '/terms', ...NOINDEX_ROUTES]) {
      expect(bottomAdPlacementFor(route)).toBeNull()
    }
  })
})
