/**
 * useAsyncRequest — Unified fetch wrapper with timeout, abort, and retry.
 *
 * Provides a single `execute` function that wraps `fetch` with:
 * - AbortController (auto-cancel previous in-flight request)
 * - Configurable timeout (default 30 s)
 * - Optional retry with exponential backoff
 * - Loading / error / data state management
 */

import { useState, useRef, useCallback } from 'react'

// ── Types ───────────────────────────────────────────────────────────

export interface AsyncRequestOptions {
  /** Timeout in ms (default 30 000) */
  timeout?: number
  /** Number of retries on network failure (default 0 — no retry) */
  retries?: number
  /** Base delay in ms for exponential backoff (default 1 000) */
  retryDelay?: number
}

export interface AsyncRequestState<T> {
  data: T | null
  error: string | null
  isLoading: boolean
}

const DEFAULT_TIMEOUT = 30_000
const DEFAULT_RETRY_DELAY = 1_000

// ── Standalone helper (non-hook) ────────────────────────────────────

/**
 * Fire a single fetch with timeout via AbortSignal.
 * Returns the raw Response.
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit & { timeout?: number },
): Promise<Response> {
  const timeoutMs = init?.timeout ?? DEFAULT_TIMEOUT
  const controller = new AbortController()

  // Merge external signal if provided
  const externalSignal = init?.signal
  if (externalSignal?.aborted) {
    controller.abort(externalSignal.reason)
  }
  externalSignal?.addEventListener('abort', () => controller.abort(externalSignal.reason))

  const timer = setTimeout(() => controller.abort('Request timed out'), timeoutMs)
  try {
    const response = await fetch(input, { ...init, signal: controller.signal })
    return response
  } finally {
    clearTimeout(timer)
  }
}

// ── Hook ────────────────────────────────────────────────────────────

export function useAsyncRequest<T = unknown>(defaults?: AsyncRequestOptions) {
  const [state, setState] = useState<AsyncRequestState<T>>({
    data: null,
    error: null,
    isLoading: false,
  })

  const controllerRef = useRef<AbortController | null>(null)

  /**
   * Execute a fetch request.
   *
   * @param input  — URL or Request
   * @param init   — Standard RequestInit (body, method, headers …)
   * @param parse  — Optional response parser. Defaults to `res.json()`.
   *                 Pass `(res) => res.blob()` for binary responses.
   * @param opts   — Per-call overrides for timeout / retry.
   */
  const execute = useCallback(
    async (
      input: RequestInfo | URL,
      init?: RequestInit,
      parse?: (res: Response) => Promise<T>,
      opts?: AsyncRequestOptions,
    ): Promise<{ data: T | null; error: string | null }> => {
      // Abort any previous in-flight request
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller

      const timeout = opts?.timeout ?? defaults?.timeout ?? DEFAULT_TIMEOUT
      const retries = opts?.retries ?? defaults?.retries ?? 0
      const retryDelay = opts?.retryDelay ?? defaults?.retryDelay ?? DEFAULT_RETRY_DELAY

      setState({ data: null, error: null, isLoading: true })

      let lastError = ''

      for (let attempt = 0; attempt <= retries; attempt++) {
        if (controller.signal.aborted) {
          break
        }

        try {
          const response = await fetchWithTimeout(input, {
            ...init,
            signal: controller.signal,
            timeout,
          })

          if (!response.ok) {
            const errBody = await response.json().catch(() => ({ detail: {} }))
            const detail = errBody.detail
            const message =
              typeof detail === 'object' && detail?.message
                ? detail.message
                : typeof detail === 'string'
                  ? detail
                  : `HTTP ${response.status}`
            lastError = message
            // Don't retry on 4xx
            if (response.status >= 400 && response.status < 500) {
              break
            }
            // Retry on 5xx
            if (attempt < retries) {
              await delay(retryDelay * 2 ** attempt)
              continue
            }
            break
          }

          const parser = parse ?? ((res: Response) => res.json() as Promise<T>)
          const data = await parser(response)

          if (!controller.signal.aborted) {
            setState({ data, error: null, isLoading: false })
          }
          return { data, error: null }
        } catch (err: unknown) {
          if (controller.signal.aborted) {
            break
          }
          lastError =
            err instanceof DOMException && err.name === 'AbortError'
              ? 'Request timed out'
              : err instanceof Error
                ? err.message
                : 'Network error'

          if (attempt < retries) {
            await delay(retryDelay * 2 ** attempt)
          }
        }
      }

      if (!controller.signal.aborted) {
        setState({ data: null, error: lastError, isLoading: false })
      }
      return { data: null, error: lastError }
    },
    [defaults?.timeout, defaults?.retries, defaults?.retryDelay],
  )

  /** Cancel in-flight request. */
  const abort = useCallback(() => {
    controllerRef.current?.abort()
    setState((prev) => (prev.isLoading ? { ...prev, isLoading: false } : prev))
  }, [])

  return { ...state, execute, abort }
}

// ── Util ────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
