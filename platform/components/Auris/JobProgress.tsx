import React, { useEffect, useState } from 'react'
import { Check, Loader2, Minus, X } from 'lucide-react'
import type { AnalysisResult } from '@/hooks/analysisTypes'
import type { StepState } from '@/hooks/analysisGateway'
import type { AurisJob, JobStage } from '@/hooks/auris/store'
import { HISTORY_KEYS, readHistory } from '@/hooks/useLocalHistory'
import { useLanguage } from '@/context/LanguageContext'
import { clock, fill, isTrained, megabytes, num, percent, useNow } from '@/components/Auris/format'
import styles from '@/styles/pages/auris.module.css'

const STAGES: JobStage[] = ['waking', 'uploading', 'processing']
const FILE_STEPS = ['features', 'vocals', 'wav2vec2', 'clap', 'fst', 'xai', 'meta']

/** Mean server time of recent model runs in this browser — real numbers or nothing. */
const useTypicalSeconds = () => {
  const [typical, setTypical] = useState<{ n: number; s: number } | null>(null)
  useEffect(() => {
    const runs = readHistory<AnalysisResult>(HISTORY_KEYS.ANALYSIS)
      .map(e => e.result)
      .filter(r => r && typeof r.processingTime === 'number' && isTrained(r) && r.source?.kind === 'file')
      .slice(0, 5)
    if (runs.length) {
      setTypical({ n: runs.length, s: runs.reduce((a, r) => a + r.processingTime, 0) / runs.length })
    }
  }, [])
  return typical
}

const StepIcon: React.FC<{ state: StepState | undefined }> = ({ state }) => {
  switch (state) {
    case 'done': return <Check size={14} />
    case 'running': return <Loader2 size={14} className={styles.spin} />
    case 'failed': return <X size={14} />
    case 'skipped': return <Minus size={14} />
    default: return <span className={styles.stepDot} />
  }
}

export const JobProgress: React.FC<{ job: AurisJob; onCancel: () => void }> = ({ job, onCancel }) => {
  const { t, language } = useLanguage()
  const W = t.aiDetection.wait
  const now = useNow(true)
  const typical = useTypicalSeconds()
  const stages = job.kind === 'url' ? STAGES.filter(s => s !== 'uploading') : STAGES
  const current = stages.indexOf(job.stage)
  const upload = job.uploadTotal ? job.uploadedBytes / job.uploadTotal : 0
  const live = job.steps.length > 0
  const steps = live
    ? job.steps
    : (job.kind === 'url' ? ['download', ...FILE_STEPS] : FILE_STEPS).map(id => ({ id, state: undefined as StepState | undefined, seconds: undefined as number | undefined }))

  return (
    <section className={styles.progressPanel} aria-live="polite" aria-labelledby="auris-wait-title">
      <div className={styles.progressHead}>
        <div>
          <p className={styles.eyebrow}>{W.title}</p>
          <h2 id="auris-wait-title">{W.stages[job.stage as 'waking' | 'uploading' | 'processing']}</h2>
        </div>
        <p className={styles.elapsed}><span>{W.elapsed}</span>{clock(now - job.startedAt)}</p>
      </div>

      <ol className={styles.stageTrack}>
        {stages.map((s, i) => (
          <li key={s} data-state={i < current ? 'done' : i === current ? 'active' : 'todo'}>
            <span className={styles.stageDot} />
            <span>{W.stages[s as 'waking' | 'uploading' | 'processing']}</span>
            {s === 'uploading' && i <= current && (
              <small>{megabytes(language, job.uploadedBytes)} / {megabytes(language, job.uploadTotal)}</small>
            )}
          </li>
        ))}
      </ol>

      {job.stage === 'uploading' && (
        <div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(upload * 100)}>
          <div style={{ width: `${upload * 100}%` }} />
        </div>
      )}

      <div className={styles.progressBody}>
        <div>
          <p className={styles.note}>
            {job.stage === 'waking' ? W.wakingNote : live ? W.liveNote : W.processingNote}
          </p>
          {job.resumed && <p className={styles.note}>{W.resumed}</p>}
          {typical && <p className={styles.note}>{fill(W.typical, { n: typical.n, s: num(language, typical.s, 1) })}</p>}
          <p className={styles.subhead}>{W.pipelineTitle}</p>
          <ol className={styles.steps} data-live={live ? 'true' : undefined} data-running={!live && job.stage === 'processing' ? 'true' : undefined}>
            {steps.map(step => (
              <li key={step.id} data-state={step.state ?? 'unknown'}>
                <span className={styles.stepIcon}><StepIcon state={step.state} /></span>
                <span>{(W.steps as Record<string, string>)[step.id] ?? step.id}</span>
                <small>
                  {step.state && step.state !== 'pending' && (W.stepState as Record<string, string>)[step.state]}
                  {typeof step.seconds === 'number' && ` · ${num(language, step.seconds, 1)} s`}
                </small>
              </li>
            ))}
          </ol>
        </div>
        <div className={styles.progressSide}>
          {job.kind !== 'url' && (
            <p className={styles.browserState} data-state={job.signalProgress < 0 ? 'fail' : job.signalProgress >= 1 ? 'done' : 'active'}>
              <strong>{W.browser}</strong>
              {job.signalProgress < 0 ? W.browserFail : job.signalProgress >= 1 ? W.browserDone : percent(language, job.signalProgress)}
            </p>
          )}
          <p className={styles.note}>{t.aiDetection.busy.elsewhere}</p>
          <button type="button" className={styles.btnGhost} onClick={onCancel}><X size={16} /> {t.aiDetection.busy.cancel}</button>
        </div>
      </div>
    </section>
  )
}
