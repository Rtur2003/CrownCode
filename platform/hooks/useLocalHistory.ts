/**
 * useLocalHistory — Minimal localStorage persistence for last input/result.
 *
 * Stores at most ONE entry per key (the most recent).
 * Gracefully degrades if localStorage is unavailable (SSR, private mode).
 */

import { useState, useCallback } from 'react'

export interface HistoryEntry<T> {
  input: string
  result: T
  timestamp: number
}

function read<T>(key: string): HistoryEntry<T> | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as HistoryEntry<T>
  } catch {
    return null
  }
}

function write<T>(key: string, entry: HistoryEntry<T>): void {
  try {
    localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // quota or unavailable — silently ignore
  }
}

function clear(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export function useLocalHistory<T>(storageKey: string) {
  const [lastEntry, setLastEntry] = useState<HistoryEntry<T> | null>(() => {
    if (typeof window === 'undefined') return null
    return read<T>(storageKey)
  })

  const save = useCallback(
    (input: string, result: T) => {
      const entry: HistoryEntry<T> = { input, result, timestamp: Date.now() }
      write(storageKey, entry)
      setLastEntry(entry)
    },
    [storageKey],
  )

  const remove = useCallback(() => {
    clear(storageKey)
    setLastEntry(null)
  }, [storageKey])

  return { lastEntry, save, remove }
}

// Storage keys used across the platform
export const HISTORY_KEYS = {
  ANALYSIS: 'crowncode:last-analysis',
  COMMEND: 'crowncode:last-commend',
} as const
