import { worldLook, worldName } from '@/config/showroom-worlds'
import { PRODUCT_CATALOG } from '@/config/product-catalog'

describe('worldName', () => {
  it('keeps the name and drops what follows a colon', () => {
    expect(worldName({ id: 'noir-grain' }, 'Noir & Grain: Restaurant Template')).toBe('Noir & Grain')
    expect(worldName({ id: 'crown-dreams' }, 'Crown Dreams: Dream Journal & Analysis')).toBe('Crown Dreams')
  })

  it('also splits on a spaced hyphen', () => {
    expect(worldName({ id: 'x' }, 'Crown Commend - YouTube drafts')).toBe('Crown Commend')
  })

  it('gives the two projects whose names are not their titles', () => {
    expect(worldName({ id: 'crown-vote' }, 'Crown Vote: VOTRYX Automation Tool')).toBe('VOTRYX')
    expect(worldName({ id: 'ml-toolkit' }, 'ML Toolkit: Audio Dataset Tools')).toBe('ML Toolkit')
  })

  it('leaves a title without a separator alone', () => {
    expect(worldName({ id: 'x' }, 'AURIS')).toBe('AURIS')
  })
})

describe('worldLook', () => {
  it('has a palette for every project in the catalog', () => {
    for (const entry of PRODUCT_CATALOG) {
      const look = worldLook(entry)
      expect(look.base).toMatch(/^#/)
      expect(look.accent).toMatch(/^#/)
      expect(look.atmosphere).toMatch(/^#/)
      expect(look.sector.en).toBeTruthy()
      expect(look.sector.tr).toBeTruthy()
    }
  })

  it('derives a look for an id the catalog does not know, the same way every time', () => {
    expect(worldLook({ id: 'legal' })).toEqual(worldLook({ id: 'legal' }))
  })
})
