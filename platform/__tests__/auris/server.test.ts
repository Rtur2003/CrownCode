import { ensureServer, pollDelay, WAKE_BUDGET_MS } from '@/hooks/auris/server'
import { getAurisState, patchServer } from '@/hooks/auris/store'

// jsdom has no Response; the health check only reads ok and json().
const ok = () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ status: 'ok', models: { a: 1 } }) })
const booting = () => Promise.resolve({ ok: false, status: 503, json: () => Promise.resolve({}) })

describe('pollDelay', () => {
  it('starts at a few seconds, backs off, and never waits longer than 15 s', () => {
    const delays = [0, 1, 2, 3, 4, 5, 20].map(pollDelay)
    expect(delays[0]).toBe(4000)
    expect(delays[1]).toBe(6000)
    expect(delays[2]).toBe(9000)
    expect(delays.every((d, i) => i === 0 || d >= (delays[i - 1] ?? 0))).toBe(true)
    expect(Math.max(...delays)).toBe(15000)
  })

  it('probes the container far less than once every 5 s over the whole wake budget', () => {
    let at = 0
    let probes = 1
    for (let attempt = 0; at + pollDelay(attempt) <= WAKE_BUDGET_MS; attempt++) {
      at += pollDelay(attempt)
      probes++
    }
    expect(probes).toBeLessThan(WAKE_BUDGET_MS / 5000 / 2)
  })
})

describe('ensureServer', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    patchServer({ status: 'checking', checkedAt: null, latencyMs: null, models: null })
  })
  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('reports ready as soon as the health check answers', async () => {
    global.fetch = jest.fn(ok) as unknown as typeof fetch
    await expect(ensureServer()).resolves.toBe(true)
    expect(getAurisState().server.status).toBe('ready')
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('keeps asking while the Space boots, then reports ready', async () => {
    const responses = [booting, booting, ok]
    global.fetch = jest.fn(() => (responses.shift() ?? booting)()) as unknown as typeof fetch
    const result = ensureServer()
    await jest.advanceTimersByTimeAsync(pollDelay(0) + pollDelay(1) + 10)
    await expect(result).resolves.toBe(true)
    expect(global.fetch).toHaveBeenCalledTimes(3)
    expect(getAurisState().server.status).toBe('ready')
  })

  it('gives up with "down" once the budget is spent', async () => {
    global.fetch = jest.fn(booting) as unknown as typeof fetch
    const result = ensureServer(20_000)
    await jest.advanceTimersByTimeAsync(20_000)
    await expect(result).resolves.toBe(false)
    expect(getAurisState().server.status).toBe('down')
  })
})
