/**
 * AURIS job store.
 *
 * Lives at module scope, outside React, so an analysis keeps running and
 * its result stays put while the visitor browses other pages; the AURIS
 * page and the global progress pill both read it. Kept free of the heavy
 * analysis code: the pill imports this on every page.
 */

import { useSyncExternalStore } from 'react'
import type { AnalysisErrorCode, AnalysisResult } from '@/hooks/analysisTypes'
import type { JobStep } from '@/hooks/analysisGateway'
import type { SignalReport } from '@/hooks/auris/signal'

export type SourceKind = 'file' | 'mic' | 'url'

/**
 * waking     – waiting for the Space to answer its health check
 * uploading  – request body on its way (real byte progress)
 * processing – body delivered; the server is running the models
 */
export type JobStage = 'waking' | 'uploading' | 'processing' | 'done' | 'error'

export type AurisError = AnalysisErrorCode | 'micDenied' | 'decodeFailed'

export interface AurisJob {
  id: string
  kind: SourceKind
  label: string
  bytes: number
  format: string
  startedAt: number
  stage: JobStage
  uploadedBytes: number
  uploadTotal: number
  uploadEndedAt: number | null
  finishedAt: number | null
  /** Id of the job on the server, when the backend supports background jobs. */
  serverJobId: string | null
  /** The server's own per-step progress (empty on the one-shot endpoint). */
  steps: JobStep[]
  /** Browser-side measurement of the same audio: 0‥1, or -1 if the browser can't decode it. */
  signalProgress: number
  signal: SignalReport | null
  /** What the page shows: the server's model result, or the browser measurement as a labelled fallback. */
  result: AnalysisResult | null
  warnings: string[]
  /** Why the server's model result is missing (the job may still finish on the fallback). */
  serverError: AurisError | null
  /** Fatal: nothing to show. */
  error: AurisError | null
  audioUrl: string | null
  /** The visitor has looked at the finished result on the AURIS page. */
  seen: boolean
  /** Brought back from storage after a reload, or opened from the history list. */
  restored: boolean
  /** A server job picked up again after a reload (no second upload). */
  resumed: boolean
}

export type ServerStatus = 'unknown' | 'checking' | 'ready' | 'waking' | 'down'

export interface ServerState {
  status: ServerStatus
  checkedAt: number | null
  latencyMs: number | null
  /** Optional model inventory, when the backend's health route reports it. */
  models: Record<string, unknown> | null
}

/** A job that was still running when the tab was reloaded or closed. */
export interface InterruptedJob {
  id: string
  kind: SourceKind
  label: string
  startedAt: number
}

export interface AurisState {
  job: AurisJob | null
  server: ServerState
  interrupted: InterruptedJob | null
}

const INITIAL: AurisState = {
  job: null,
  server: { status: 'unknown', checkedAt: null, latencyMs: null, models: null },
  interrupted: null,
}

let state: AurisState = INITIAL
const listeners = new Set<() => void>()

export const getAurisState = () => state

export const setAurisState = (patch: Partial<AurisState>) => {
  state = { ...state, ...patch }
  listeners.forEach(l => l())
}

/** Patches the current job, ignoring stale runs that were replaced or reset. */
export const patchJob = (id: string, patch: Partial<AurisJob>) => {
  if (state.job?.id !== id) {return false}
  setAurisState({ job: { ...state.job, ...patch } })
  return true
}

export const patchServer = (patch: Partial<ServerState>) => setAurisState({ server: { ...state.server, ...patch } })

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function useAurisStore<T>(select: (s: AurisState) => T): T {
  return useSyncExternalStore(subscribe, () => select(state), () => select(INITIAL))
}

export type ActiveJob = AurisJob & { stage: 'waking' | 'uploading' | 'processing' }

export const isActive = (job: AurisJob | null): job is ActiveJob =>
  !!job && (job.stage === 'waking' || job.stage === 'uploading' || job.stage === 'processing')
