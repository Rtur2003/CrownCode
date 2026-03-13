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

  it('saves entries newest-first', () => {
    const { result } = renderHook(() => useLocalHistory<string>(TEST_KEY))

    act(() => result.current.save('input-1', 'result-1'))
    act(() => result.current.save('input-2', 'result-2'))

    expect(result.current.entries).toHaveLength(2)
    expect(result.current.entries[0].input).toBe('input-2')
    expect(result.current.entries[1].input).toBe('input-1')
    expect(result.current.lastEntry?.input).toBe('input-2')
  })

  it('caps entries at 20', () => {
    const { result } = renderHook(() => useLocalHistory<number>(TEST_KEY))

    for (let i = 0; i < 25; i++) {
      act(() => result.current.save(`input-${i}`, i))
    }

    expect(result.current.entries).toHaveLength(20)
    expect(result.current.entries[0].input).toBe('input-24')
  })

  it('removeById removes a specific entry', () => {
    const { result } = renderHook(() => useLocalHistory<string>(TEST_KEY))

    act(() => result.current.save('a', 'ra'))
    act(() => result.current.save('b', 'rb'))

    const tsToRemove = result.current.entries[1].timestamp
    act(() => result.current.removeById(tsToRemove))

    expect(result.current.entries).toHaveLength(1)
    expect(result.current.entries[0].input).toBe('b')
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
