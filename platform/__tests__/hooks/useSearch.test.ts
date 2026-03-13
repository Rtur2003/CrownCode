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

// Mock product catalog to isolate test from catalog data
jest.mock('@/config/product-catalog', () => ({
  PRODUCT_CATALOG: [
    { id: 'mock-product', href: '/mock', localeKey: 'mock' },
  ],
  resolveProduct: () => ({ title: 'Mock Product', description: 'A mock' }),
}))

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
