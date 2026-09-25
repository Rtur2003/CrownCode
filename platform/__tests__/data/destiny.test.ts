import { getLuckyElements, seededRandom, DESTINY_CARDS } from '@/data/destiny'

describe('seededRandom', () => {
  it('is deterministic and within [0, 1)', () => {
    for (const seed of ['a', 'crown_2026-09-25', '7_2026-01-01_lucky1']) {
      const value = seededRandom(seed)
      expect(value).toBe(seededRandom(seed))
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('separates seeds that differ only in the last character', () => {
    const values = [1, 2, 3].map((i) => seededRandom(`12_2026-09-25_lucky${i}`))
    const buckets = new Set(values.map((v) => Math.floor(v * 49)))
    expect(buckets.size).toBe(3)
  })
})

describe('getLuckyElements', () => {
  it('returns three distinct, sorted numbers between 1 and 49 for every card and many days', () => {
    for (const card of DESTINY_CARDS) {
      for (let day = 1; day <= 28; day++) {
        const { numbers } = getLuckyElements(card.id, `2026-02-${String(day).padStart(2, '0')}`)
        expect(numbers).toHaveLength(3)
        expect(new Set(numbers).size).toBe(3)
        expect([...numbers].sort((a, b) => a - b)).toEqual(numbers)
        numbers.forEach((n) => {
          expect(n).toBeGreaterThanOrEqual(1)
          expect(n).toBeLessThanOrEqual(49)
        })
      }
    }
  })

  it('is stable for the same card and date', () => {
    expect(getLuckyElements(4, '2026-09-25')).toEqual(getLuckyElements(4, '2026-09-25'))
  })
})
