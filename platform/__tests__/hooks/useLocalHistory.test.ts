import { renderHook, act } from '@testing-library/react'
import { useLocalHistory } from '@/hooks/useLocalHistory'

const TEST_KEY = 'test:history'

beforeEach(() => {
  localStorage.clear()
})

describe('useLocalHistory – multi-entry', () => {
  it('starts with empty entries', () => {
    const { result } = renderHook(() => useLocalHistory<string>(TEST_KEY))
    expect(result.current.entries).toEqual([])
    expect(result.current.lastEntry).toBeNull()
  })

  it('saves entries newest-first with unique ids', () => {
    const { result } = renderHook(() => useLocalHistory<string>(TEST_KEY))

    act(() => result.current.save('input-1', 'result-1'))
    act(() => result.current.save('input-2', 'result-2'))

    expect(result.current.entries).toHaveLength(2)
    expect(result.current.entries[0].input).toBe('input-2')
    expect(result.current.entries[1].input).toBe('input-1')
    expect(result.current.lastEntry?.input).toBe('input-2')
    // Each entry has a unique id
    expect(result.current.entries[0].id).toBeTruthy()
    expect(result.current.entries[0].id).not.toBe(result.current.entries[1].id)
  })

  it('caps entries at 20', () => {
    const { result } = renderHook(() => useLocalHistory<number>(TEST_KEY))

    for (let i = 0; i < 25; i++) {
      act(() => result.current.save(`input-${i}`, i))
    }

    expect(result.current.entries).toHaveLength(20)
    expect(result.current.entries[0].input).toBe('input-24')
  })

  it('removeById removes a specific entry by id', () => {
    const { result } = renderHook(() => useLocalHistory<string>(TEST_KEY))

    act(() => result.current.save('a', 'ra'))
    act(() => result.current.save('b', 'rb'))

    const idToRemove = result.current.entries[1].id
    act(() => result.current.removeById(idToRemove))

    expect(result.current.entries).toHaveLength(1)
    expect(result.current.entries[0].input).toBe('b')
  })

  it('removeById is collision-safe: same timestamp, only target removed', () => {
    const { result } = renderHook(() => useLocalHistory<string>(TEST_KEY))

    // Mock Date.now to return same timestamp
    const fixedTime = 1700000000000
    const originalNow = Date.now
    Date.now = () => fixedTime

    act(() => result.current.save('first', 'r1'))
    act(() => result.current.save('second', 'r2'))

    Date.now = originalNow

    // Both entries share same timestamp but different ids
    expect(result.current.entries[0].timestamp).toBe(fixedTime)
    expect(result.current.entries[1].timestamp).toBe(fixedTime)
    expect(result.current.entries[0].id).not.toBe(result.current.entries[1].id)

    // Remove only the second entry (index 0 = newest)
    const targetId = result.current.entries[0].id
    act(() => result.current.removeById(targetId))

    expect(result.current.entries).toHaveLength(1)
    expect(result.current.entries[0].input).toBe('first')
  })

  it('clear removes all entries', () => {
    const { result } = renderHook(() => useLocalHistory<string>(TEST_KEY))

    act(() => result.current.save('a', 'ra'))
    act(() => result.current.save('b', 'rb'))
    act(() => result.current.clear())

    expect(result.current.entries).toEqual([])
    expect(localStorage.getItem(TEST_KEY)).toBeNull()
  })

  it('migrates V1 single-entry format on read', () => {
    const v1Entry = { input: 'old', result: 'old-r', timestamp: 1000 }
    localStorage.setItem(TEST_KEY, JSON.stringify(v1Entry))

    const { result } = renderHook(() => useLocalHistory<string>(TEST_KEY))
    expect(result.current.entries).toHaveLength(1)
    expect(result.current.lastEntry?.input).toBe('old')
    // Migrated entry gets an id
    expect(result.current.entries[0].id).toBeTruthy()
  })

  it('backward-compat remove() drops the newest entry', () => {
    const { result } = renderHook(() => useLocalHistory<string>(TEST_KEY))

    act(() => result.current.save('a', 'ra'))
    act(() => result.current.save('b', 'rb'))
    act(() => result.current.remove())

    expect(result.current.entries).toHaveLength(1)
    expect(result.current.lastEntry?.input).toBe('a')
  })
})
