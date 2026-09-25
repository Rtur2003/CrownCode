/**
 * Site-wide AURIS indicator: while a job runs (or has just finished)
 * and the visitor is on another page, a small pill links back to it.
 */

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { AudioWaveform, Check, TriangleAlert, X } from 'lucide-react'
import { isActive, patchJob, useAurisStore } from '@/hooks/auris/store'
import { useLanguage } from '@/context/LanguageContext'
import { clock, percent, useNow } from '@/components/Auris/format'
import styles from './JobPill.module.css'

const AURIS_PATH = '/ai-music-detection'

export const JobPill: React.FC = () => {
  const job = useAurisStore(s => s.job)
  const { pathname } = useRouter()
  const { t, language } = useLanguage()
  const P = t.aiDetection.pill
  const active = isActive(job)
  const now = useNow(active)

  if (!job || pathname === AURIS_PATH) {return null}
  const finished = job.stage === 'done' || job.stage === 'error'
  if (finished && job.seen) {return null}
  if (!active && !finished) {return null}

  const label = active ? P[job.stage as 'waking' | 'uploading' | 'processing'] : job.stage === 'done' ? P.done : P.error
  const upload = job.stage === 'uploading' && job.uploadTotal ? ` ${percent(language, job.uploadedBytes / job.uploadTotal)}` : ''

  return (
    <div className={styles.pill} data-state={active ? 'active' : job.stage} role="status" aria-live="polite">
      <Link href={AURIS_PATH} className={styles.link}>
        <span className={styles.icon} aria-hidden="true">
          {active ? <AudioWaveform size={16} /> : job.stage === 'done' ? <Check size={16} /> : <TriangleAlert size={16} />}
        </span>
        <span className={styles.text}>
          <strong>{label}{upload}</strong>
          <small>{job.label}{active ? ` · ${clock(now - job.startedAt)}` : ''}</small>
        </span>
        <span className={styles.open}>{P.open}</span>
      </Link>
      {finished && (
        <button type="button" className={styles.close} aria-label={P.dismiss} onClick={() => patchJob(job.id, { seen: true })}>
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export default JobPill
