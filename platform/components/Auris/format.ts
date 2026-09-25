import { useEffect, useState } from 'react'
import type { AnalysisResult } from '@/hooks/analysisTypes'

/** Fills `{name}` placeholders in a translated string. */
export const fill = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m))

export const locale = (language: string) => (language === 'en' ? 'en-US' : 'tr-TR')

export const num = (language: string, v: number, digits = 2) =>
  v.toLocaleString(locale(language), { minimumFractionDigits: digits, maximumFractionDigits: digits })

export const pct = (v: number) => Math.round(v * 100)

/** A 0–1 value as a percentage in the reader's convention: %73 in Turkish, 73% in English. */
export const percent = (language: string, v: number, digits = 0) => {
  const n = num(language, v * 100, digits)
  return language === 'en' ? `${n}%` : `%${n}`
}

export const clock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export const megabytes = (language: string, bytes: number) => `${num(language, bytes / 1024 / 1024, 1)} MB`

/** Ticks once a second while `active`, for elapsed-time readouts. */
export const useNow = (active: boolean) => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) {return}
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [active])
  return now
}

/** True when the verdict came from the server's models, not the browser fallback. */
export const isTrained = (r: AnalysisResult) => r.analysisMode !== 'signal' && r.decisionSource !== 'auris_signal'

/** P(AI) on a 0–1 scale, whichever source produced the result. */
export const aiProbability = (r: AnalysisResult) => {
  if (r.xai) {return r.xai.probability}
  if (!isTrained(r) && r.signal) {return r.signal.score}
  // Score fusion reports P(AI) as its confidence (is_ai = confidence > 0.5).
  return r.confidence
}

/** The backend fills a model it couldn't load with exactly 0.5. */
export const voteMissing = (v: { probability: number; available?: boolean }) =>
  v.available === false || (v.available === undefined && v.probability === 0.5)
