/**
 * useLocalHistory — localStorage persistence for analysis history.
 *
 * V2: Stores up to MAX_ENTRIES per key (newest first).
 * Backward-compatible: `lastEntry` still returns the most recent entry,
 * `save` and `remove` work as before.
 */

import { useState, useCallback, useEffect } from 'react'

const MAX_ENTRIES = 20

export interface HistoryEntry<T> {
  id: string
  input: string
  result: T
  timestamp: number
}

let _counter = 0
function generateId(): string {
  return `${Date.now()}-${++_counter}-${Math.random().toString(36).slice(2, 8)}`
}

function readAll<T>(key: string): HistoryEntry<T>[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {return []}
    const parsed = JSON.parse(raw)
    // Migrate from V1 single-entry format
    if (parsed && !Array.isArray(parsed) && typeof parsed.timestamp === 'number') {
      const migrated = { ...parsed, id: parsed.id || generateId() } as HistoryEntry<T>
      return [migrated]
    }
    if (!Array.isArray(parsed)) {return []}
    // Backfill id for entries missing it
    return parsed.map((e: HistoryEntry<T>) => (e.id ? e : { ...e, id: generateId() }))
  } catch {
    return []
  }
}

function writeAll<T>(key: string, entries: HistoryEntry<T>[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(entries))
  } catch {
    // quota or unavailable — silently ignore
  }
}

function clearKey(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export function useLocalHistory<T>(storageKey: string) {
  // Always start empty so the client's first render matches the server's
  // (localStorage doesn't exist server-side); read the real data in an
  // effect after mount instead of a lazy initializer, which would make
  // the client's very first render diverge from SSR output and trigger
  // a hydration mismatch whenever the user already has saved entries.
  const [entries, setEntries] = useState<HistoryEntry<T>[]>([])

  useEffect(() => {
    setEntries(readAll<T>(storageKey))
  }, [storageKey])

  /** Most recent entry (backward compat) */
  const lastEntry = entries.length > 0 ? entries[0] : null

  /** Add a new entry (newest first, capped at MAX_ENTRIES) */
  const save = useCallback(
    (input: string, result: T) => {
      const entry: HistoryEntry<T> = { id: generateId(), input, result, timestamp: Date.now() }
      setEntries((prev) => {
        const next = [entry, ...prev].slice(0, MAX_ENTRIES)
        writeAll(storageKey, next)
        return next
      })
    },
    [storageKey],
  )

  /** Remove most recent entry (backward compat) */
  const remove = useCallback(() => {
    setEntries((prev) => {
      const next = prev.slice(1)
      if (next.length === 0) {
        clearKey(storageKey)
      } else {
        writeAll(storageKey, next)
      }
      return next
    })
  }, [storageKey])

  /** Remove a specific entry by id */
  const removeById = useCallback(
    (id: string) => {
      setEntries((prev) => {
        const next = prev.filter((e) => e.id !== id)
        if (next.length === 0) {
          clearKey(storageKey)
        } else {
          writeAll(storageKey, next)
        }
        return next
      })
    },
    [storageKey],
  )

  /** Clear all entries for this key */
  const clear = useCallback(() => {
    clearKey(storageKey)
    setEntries([])
  }, [storageKey])

  return { entries, lastEntry, save, remove, removeById, clear }
}

// Storage keys used across the platform
export const HISTORY_KEYS = {
  ANALYSIS: 'crowncode:last-analysis',
  COMMEND: 'crowncode:last-commend',
} as const
