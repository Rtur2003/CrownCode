/**
 * The last AURIS job in IndexedDB — audio included — so a reload or a
 * return visit can bring back the report (with playback), or offer to
 * rerun a job the reload cut short. Every call degrades to a no-op when
 * IndexedDB is unavailable (private mode, old browsers, tests).
 */

import type { AnalysisResult } from '@/hooks/analysisTypes'
import type { SourceKind } from '@/hooks/auris/store'

export interface StoredJob {
  id: string
  kind: SourceKind
  label: string
  format: string
  bytes: number
  startedAt: number
  status: 'pending' | 'done'
  /** The audio for file and mic jobs. */
  blob?: Blob
  /** The link for url jobs. */
  url?: string
  /** Server-side job id: a reload can resume polling instead of re-uploading. */
  serverJobId?: string
  result?: AnalysisResult
  warnings?: string[]
  serverError?: string | null
  finishedAt?: number
}

const DB_NAME = 'auris'
const STORE = 'jobs'
const KEY = 'last'

let dbPromise: Promise<IDBDatabase | null> | null = null

const openDb = () => {
  if (dbPromise) {return dbPromise}
  dbPromise = new Promise(resolve => {
    try {
      if (typeof indexedDB === 'undefined') {return resolve(null)}
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => { req.result.createObjectStore(STORE) }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
      req.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  return dbPromise
}

const run = async <T>(mode: IDBTransactionMode, op: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | null> => {
  const db = await openDb()
  if (!db) {return null}
  return new Promise(resolve => {
    try {
      const req = op(db.transaction(STORE, mode).objectStore(STORE))
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

export const saveLastJob = (job: StoredJob) => run('readwrite', s => s.put(job, KEY)).then(() => undefined)

export const loadLastJob = () => run<StoredJob | undefined>('readonly', s => s.get(KEY)).then(r => r ?? null)

export const clearLastJob = () => run('readwrite', s => s.delete(KEY)).then(() => undefined)
