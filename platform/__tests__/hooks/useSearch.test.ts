import { buildSearchItems } from '@/hooks/useSearch'

// Minimal mock translations matching locale structure
const mockT = {
  search: {
    pages: { home: 'Ana Sayfa', projects: 'Projeler' },
    features: {
      urlAnalysis: 'URL Analizi',
      urlAnalysisDesc: 'YouTube link analizi',
      dataAugmentation: 'Veri Artırma',
      dataAugmentationDesc: 'Veri setinizi artırın',
    },
  },
  creatorStudio: { title: 'Creator Studio', subtitle: 'AI audio tools' },
  analysisHistory: { title: 'Analiz Geçmişi', subtitle: 'Son analizler' },
  systemStatus: { title: 'Sistem Durumu', allOperational: 'Tüm sistemler çalışıyor' },
}

// Mock product catalog — keep real SEARCH_REGISTRY and resolveKey, mock only PRODUCT_CATALOG
jest.mock('@/config/product-catalog', () => {
  const actual = jest.requireActual('@/config/product-catalog')
  return {
    ...actual,
    PRODUCT_CATALOG: [
      { id: 'mock-product', href: '/mock', localeKey: 'mock' },
    ],
    resolveProduct: () => ({ title: 'Mock Product', description: 'A mock' }),
  }
})

describe('buildSearchItems – category semantics', () => {
  const items = buildSearchItems(mockT)

  it('assigns "product" to catalog items', () => {
    const catalogItem = items.find((i) => i.id === 'mock-product')
    expect(catalogItem?.category).toBe('product')
  })

  it('assigns "page" to static page items', () => {
    const home = items.find((i) => i.id === 'home')
    const history = items.find((i) => i.id === 'analysis-history')
    expect(home?.category).toBe('page')
    expect(history?.category).toBe('page')
  })

  it('assigns "feature" to feature items', () => {
    const urlAnalysis = items.find((i) => i.id === 'url-analysis')
    const dataAug = items.find((i) => i.id === 'data-augmentation')
    expect(urlAnalysis?.category).toBe('feature')
    expect(dataAug?.category).toBe('feature')
  })

  it('only uses product|feature|page categories', () => {
    const validCategories = new Set(['product', 'feature', 'page'])
    for (const item of items) {
      expect(validCategories.has(item.category)).toBe(true)
    }
  })
})

describe('buildSearchItems – registry resolution', () => {
  const items = buildSearchItems(mockT)

  it('resolves page titles from locale dot-path keys', () => {
    const home = items.find((i) => i.id === 'home')
    expect(home?.title).toBe('Ana Sayfa')
  })

  it('resolves feature titles and descriptions', () => {
    const urlAnalysis = items.find((i) => i.id === 'url-analysis')
    expect(urlAnalysis?.title).toBe('URL Analizi')
    expect(urlAnalysis?.description).toBe('YouTube link analizi')
  })

  it('resolves cross-section locale keys (creatorStudio.title)', () => {
    const cs = items.find((i) => i.id === 'creator-studio')
    expect(cs?.title).toBe('Creator Studio')
    expect(cs?.description).toBe('AI audio tools')
  })

  it('omits description when descriptionKey is absent', () => {
    const home = items.find((i) => i.id === 'home')
    expect(home?.description).toBeUndefined()
  })

  it('returns empty string for unresolvable locale keys', () => {
    const badT = { search: { pages: {} } }
    const badItems = buildSearchItems(badT)
    const home = badItems.find((i) => i.id === 'home')
    expect(home?.title).toBe('')
  })
})
