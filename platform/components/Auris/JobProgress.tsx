import React, { useEffect, useState } from 'react'
import { Check, Loader2, Minus, X } from 'lucide-react'
import type { AnalysisResult } from '@/hooks/analysisTypes'
import type { JobStep, StepState } from '@/hooks/analysisGateway'
import type { ActiveJob } from '@/hooks/auris/store'
import { HISTORY_KEYS, readHistory } from '@/hooks/useLocalHistory'
import { useLanguage } from '@/context/LanguageContext'
import { clock, fill, isTrained, megabytes, num, percent, useNow } from '@/components/Auris/format'
import styles from '@/styles/pages/auris.module.css'

const FILE_STEPS = ['features', 'vocals', 'wav2vec2', 'clap', 'fst', 'xai', 'meta']
const SETTLED: StepState[] = ['done', 'skipped', 'failed']

/** Steps the band around the world is divided into: the upload, then each server step. */
export const jobSegments = (job: ActiveJob): { steps: JobStep[]; segments: number; progress: number } => {
  const steps = job.steps
  const upload = job.kind === 'url' ? 0 : 1
  const segments = (steps.length || FILE_STEPS.length + (job.kind === 'url' ? 1 : 0)) + upload
  const uploaded = upload === 0 ? 0 : job.stage === 'uploading' ? (job.uploadTotal ? job.uploadedBytes / job.uploadTotal : 0) : job.stage === 'processing' ? 1 : 0
  const settled = steps.filter(s => SETTLED.includes(s.state)).length
  const running = steps.filter(s => s.state === 'running').length
  return { steps, segments, progress: Math.min(1, (uploaded + settled + running * 0.35) / segments) }
}

/** Mean server time of recent model runs in this browser — real numbers or nothing. */
const useTypicalSeconds = () => {
  const [typical, setTypical] = useState<{ n: number; s: number } | null>(null)
  useEffect(() => {
    const runs = readHistory<AnalysisResult>(HISTORY_KEYS.ANALYSIS)
      .map(e => e.result)
      .filter(r => r && typeof r.processingTime === 'number' && isTrained(r) && !!r.xai && r.source?.kind === 'file')
      .slice(0, 5)
    if (runs.length) {
      setTypical({ n: runs.length, s: runs.reduce((a, r) => a + r.processingTime, 0) / runs.length })
    }
  }, [])
  return typical
}

const StepIcon: React.FC<{ state: StepState | undefined }> = ({ state }) => {
  switch (state) {
    case 'done': return <Check size={13} />
    case 'running': return <Loader2 size={13} className={styles.spin} />
    case 'failed': return <X size={13} />
    case 'skipped': return <Minus size={13} />
    default: return <span className={styles.stepDot} />
  }
}

/** The stage panel while a job runs: what the server is doing, right now. */
export const JobProgress: React.FC<{ job: ActiveJob; onCancel: () => void }> = ({ job, onCancel }) => {
  const { t, language } = useLanguage()
  const W = t.aiDetection.wait
  const now = useNow(true)
  const typical = useTypicalSeconds()
  const live = job.steps.length > 0
  const ids = job.kind === 'url' ? ['download', ...FILE_STEPS] : FILE_STEPS
  const steps = live ? job.steps : ids.map(id => ({ id, state: undefined as StepState | undefined, seconds: undefined as number | undefined }))
  const upload = job.uploadTotal ? job.uploadedBytes / job.uploadTotal : 0
  const note = job.stage === 'waking' ? W.wakingNote : job.resumed ? W.resumed : live ? W.liveNote : W.processingNote

  return (
    <div className={styles.run} aria-live="polite">
      <div className={styles.runHead}>
        <h2>{W.stages[job.stage]}</h2>
        <p className={styles.clock} aria-label={W.elapsed}>{clock(now - job.startedAt)}</p>
      </div>
      <p className={styles.runFile}>{job.label}</p>

      {job.stage === 'uploading' && (
        <div className={styles.upload}>
          <div className={styles.uploadBar} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(upload * 100)}>
            <span style={{ transform: `scaleX(${upload})` }} />
          </div>
          <small>{megabytes(language, job.uploadedBytes)} / {megabytes(language, job.uploadTotal)}</small>
        </div>
      )}

      <p className={styles.note}>{note}</p>

      <ol className={styles.steps} data-live={live ? 'true' : undefined} data-running={!live && job.stage === 'processing' ? 'true' : undefined}>
        {steps.map(step => (
          <li key={step.id} data-state={step.state ?? 'unknown'}>
            <span className={styles.stepIcon}><StepIcon state={step.state} /></span>
            <span>{(W.steps as Record<string, string>)[step.id] ?? step.id}</span>
            <small>
              {typeof step.seconds === 'number'
                ? `${num(language, step.seconds, 1)} s`
                : step.state && step.state !== 'pending' ? (W.stepState as Record<string, string>)[step.state] : ''}
            </small>
          </li>
        ))}
      </ol>

      <div className={styles.runFoot}>
        {job.kind !== 'url' && (
          <p className={styles.browserState} data-state={job.signalProgress < 0 ? 'fail' : job.signalProgress >= 1 ? 'done' : 'active'}>
            {W.browser}: {job.signalProgress < 0 ? W.browserFail : job.signalProgress >= 1 ? W.browserDone : percent(language, job.signalProgress)}
          </p>
        )}
        {typical && <p className={styles.note}>{fill(W.typical, { n: typical.n, s: num(language, typical.s, 1) })}</p>}
        <p className={styles.note}>{t.aiDetection.busy.elsewhere}</p>
        <button type="button" className={styles.btnGhost} onClick={onCancel}><X size={16} /> {t.aiDetection.busy.cancel}</button>
      </div>
    </div>
  )
}
