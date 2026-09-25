/**
 * Reachability of the AURIS backend. A free Hugging Face Space sleeps
 * after a quiet spell and needs a minute or two to boot (the container
 * also pulls its model weights), so "not answering yet" is reported as
 * waking and polled for a while before it counts as down.
 */

import { API_BASE_URL } from '@/config/api'
import { fetchWithTimeout } from '@/hooks/useAsyncRequest'
import { getAurisState, patchServer } from '@/hooks/auris/store'

const PING_TIMEOUT_MS = 8_000
const POLL_MS = 5_000
export const WAKE_BUDGET_MS = 180_000

interface Health {
  status?: string
  models?: Record<string, unknown>
}

const ping = async () => {
  const t0 = performance.now()
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/health`, { timeout: PING_TIMEOUT_MS, cache: 'no-store' })
    if (!res.ok) {return null}
    const body = await res.json() as Health
    if (body?.status !== 'ok') {return null}
    return { latencyMs: Math.round(performance.now() - t0), models: body.models ?? null }
  } catch {
    return null
  }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

let pending: Promise<boolean> | null = null

/**
 * Resolves true once the backend answers its health check. Concurrent
 * callers share one probe loop; a recent success is reused.
 */
export const ensureServer = (budgetMs = WAKE_BUDGET_MS): Promise<boolean> => {
  const { server } = getAurisState()
  if (server.status === 'ready' && server.checkedAt && Date.now() - server.checkedAt < 60_000) {
    return Promise.resolve(true)
  }
  if (pending) {return pending}

  pending = (async () => {
    const deadline = Date.now() + budgetMs
    patchServer({ status: server.status === 'waking' ? 'waking' : 'checking' })
    for (;;) {
      const hit = await ping()
      if (hit) {
        patchServer({ status: 'ready', checkedAt: Date.now(), latencyMs: hit.latencyMs, models: hit.models })
        return true
      }
      if (Date.now() + POLL_MS > deadline) {
        patchServer({ status: 'down', checkedAt: Date.now(), latencyMs: null })
        return false
      }
      patchServer({ status: 'waking', checkedAt: Date.now() })
      await sleep(POLL_MS)
    }
  })().finally(() => { pending = null })

  return pending
}
