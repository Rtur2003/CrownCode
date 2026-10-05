import { act, renderHook } from '@testing-library/react'
import { fetchWithTimeout, isCallerAbort, useAsyncRequest } from '@/hooks/useAsyncRequest'

const ok = (body: unknown = {}) => ({ ok: true, status: 200, json: async () => body }) as unknown as Response

/** A fetch that never answers on its own, only rejects with the signal's reason when aborted. */
const hangingFetch = () =>
  jest.fn((_input: unknown, init?: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      // Like the real fetch: a signal that is already aborted rejects at once.
      if (init?.signal?.aborted) {return reject(init.signal.reason)}
      init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true })
    }),
  )

afterEach(() => {
  jest.useRealTimers()
  jest.restoreAllMocks()
})

describe('fetchWithTimeout', () => {
  it('does not pass its own timeout option on to fetch', async () => {
    const fetchMock = jest.fn().mockResolvedValue(ok())
    global.fetch = fetchMock
    await fetchWithTimeout('/x', { timeout: 5000, method: 'POST' })
    const init = fetchMock.mock.calls[0]![1] as Record<string, unknown>
    expect(init.method).toBe('POST')
    expect('timeout' in init).toBe(false)
  })

  it('rejects with a TimeoutError once the time is up', async () => {
    jest.useFakeTimers()
    global.fetch = hangingFetch()
    const pending = fetchWithTimeout('/slow', { timeout: 1000 })
    const caught = pending.catch(e => e)
    await jest.advanceTimersByTimeAsync(1000)
    const err = await caught
    expect(err).toBeInstanceOf(DOMException)
    expect((err as DOMException).name).toBe('TimeoutError')
  })

  it('stops listening to the caller signal when the request is done', async () => {
    global.fetch = jest.fn().mockResolvedValue(ok())
    const external = new AbortController()
    const add = jest.spyOn(external.signal, 'addEventListener')
    const remove = jest.spyOn(external.signal, 'removeEventListener')
    await fetchWithTimeout('/x', { signal: external.signal })
    expect(add).toHaveBeenCalledWith('abort', expect.any(Function), { once: true })
    expect(remove).toHaveBeenCalledWith('abort', add.mock.calls[0]![1])
  })

  it('passes the caller signal through, with the caller reason', async () => {
    global.fetch = hangingFetch()
    const external = new AbortController()
    const caught = fetchWithTimeout('/x', { signal: external.signal }).catch(e => e)
    external.abort('stop')
    expect(await caught).toBe('stop')
  })

  it('rejects at once for a signal that is already aborted', async () => {
    global.fetch = hangingFetch()
    const external = new AbortController()
    external.abort('early')
    expect(await fetchWithTimeout('/x', { signal: external.signal }).catch(e => e)).toBe('early')
  })
})

describe('isCallerAbort', () => {
  it('is true only when the caller aborted and it was not a timeout', () => {
    const controller = new AbortController()
    expect(isCallerAbort(new Error('x'), controller.signal)).toBe(false)
    controller.abort()
    expect(isCallerAbort(new Error('x'), controller.signal)).toBe(true)
    expect(isCallerAbort(new DOMException('t', 'TimeoutError'), controller.signal)).toBe(false)
  })
})

describe('useAsyncRequest', () => {
  it('returns data and clears loading', async () => {
    global.fetch = jest.fn().mockResolvedValue(ok({ a: 1 }))
    const { result } = renderHook(() => useAsyncRequest<{ a: number }>())
    let out: Awaited<ReturnType<typeof result.current.execute>> | undefined
    await act(async () => { out = await result.current.execute('/x') })
    expect(out).toEqual({ data: { a: 1 }, error: null })
    expect(result.current.isLoading).toBe(false)
  })

  it('reports an abort as aborted with no error text', async () => {
    global.fetch = hangingFetch()
    const { result } = renderHook(() => useAsyncRequest())
    let pending!: ReturnType<typeof result.current.execute>
    act(() => { pending = result.current.execute('/x') })
    act(() => { result.current.abort() })
    const out = await pending
    expect(out).toEqual({ data: null, error: null, aborted: true })
    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('reports a timeout as an error, not as an abort', async () => {
    jest.useFakeTimers()
    global.fetch = hangingFetch()
    const { result } = renderHook(() => useAsyncRequest())
    let pending!: ReturnType<typeof result.current.execute>
    act(() => { pending = result.current.execute('/x', undefined, undefined, { timeout: 500 }) })
    await act(async () => { await jest.advanceTimersByTimeAsync(500) })
    const out = await pending
    expect(out.aborted).toBeUndefined()
    expect(out.error).toBe('Request timed out')
  })

  it('aborts the request in flight when the component unmounts', async () => {
    let seen: AbortSignal | undefined
    global.fetch = jest.fn((_input: unknown, init?: RequestInit) => {
      seen = init?.signal ?? undefined
      return new Promise<Response>(() => undefined)
    })
    const { result, unmount } = renderHook(() => useAsyncRequest())
    act(() => { void result.current.execute('/x') })
    await Promise.resolve()
    expect(seen?.aborted).toBe(false)
    unmount()
    expect(seen?.aborted).toBe(true)
  })

  it('stops waiting between retries when aborted', async () => {
    jest.useFakeTimers()
    const fetchMock = jest.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) })
    global.fetch = fetchMock
    const { result } = renderHook(() => useAsyncRequest())
    let pending!: ReturnType<typeof result.current.execute>
    act(() => { pending = result.current.execute('/x', undefined, undefined, { retries: 3, retryDelay: 60_000 }) })
    await act(async () => { await jest.advanceTimersByTimeAsync(0) })
    act(() => { result.current.abort() })
    const out = await pending
    expect(out.aborted).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
