// System Status: three live checks (this site's API, its version endpoint and the
// CrownCode backend), run when the page opens and again on request.

import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { NextPage } from 'next'
import { MainLayout } from '@/components/Layout/MainLayout'
import { BackendNote } from '@/components/UI/BackendNote'
import { WorldPage } from '@/components/UI/WorldPage'
import { useLanguage } from '@/context/LanguageContext'
import { API_BASE_URL } from '@/config/api'
import { fetchWithTimeout } from '@/hooks/useAsyncRequest'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/system-status.module.css'

type ServiceId = 'frontend' | 'version' | 'backend'

interface ServiceStatus {
  id: ServiceId
  url: string
  status: 'ok' | 'error' | 'loading'
  latency?: number
}

const TARGETS: { id: ServiceId; url: string }[] = [
  { id: 'frontend', url: '/api/health' },
  { id: 'version', url: '/api/version' },
  { id: 'backend', url: `${API_BASE_URL}/api/health` },
]

// A sleeping backend needs a minute or two to boot; give the probe room to see it answer.
const TIMEOUT_MS: Record<ServiceId, number> = { frontend: 10_000, version: 10_000, backend: 20_000 }

const loadingState = (): ServiceStatus[] => TARGETS.map(target => ({ ...target, status: 'loading' }))

async function probeServices(signal: AbortSignal): Promise<ServiceStatus[]> {
  return Promise.all(
    TARGETS.map(async (target): Promise<ServiceStatus> => {
      const start = Date.now()
      try {
        const res = await fetchWithTimeout(target.url, { timeout: TIMEOUT_MS[target.id], signal })
        return { ...target, status: res.ok ? 'ok' : 'error', latency: Date.now() - start }
      } catch {
        return { ...target, status: 'error', latency: Date.now() - start }
      }
    }),
  )
}

const SystemStatusPage: NextPage = () => {
  const { t, language } = useLanguage()
  const ss = t.systemStatus
  const [services, setServices] = useState<ServiceStatus[]>(loadingState)
  const [checking, setChecking] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  const apply = useCallback((results: ServiceStatus[]) => {
    setServices(results)
    setLastChecked(new Date())
    setChecking(false)
  }, [])

  const begin = useCallback(() => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    return controller
  }, [])

  // The first round starts on mount and the page begins in the checking state, so
  // nothing is set here until the answers arrive.
  useEffect(() => {
    const controller = begin()
    void probeServices(controller.signal).then(results => {
      if (!controller.signal.aborted) {apply(results)}
    })
    return () => controller.abort()
  }, [begin, apply])

  const refresh = () => {
    const controller = begin()
    setChecking(true)
    void probeServices(controller.signal).then(results => {
      if (!controller.signal.aborted) {apply(results)}
    })
  }

  const settled = services.every(s => s.status !== 'loading')
  const allOk = services.every(s => s.status === 'ok')
  const someOk = services.some(s => s.status === 'ok')
  const summary = !settled ? ss.checking : allOk ? ss.allOperational : someOk ? ss.degraded : ss.someIssues
  const tone = !settled ? 'pending' : allOk ? 'ok' : someOk ? 'pending' : 'down'
  const timeFormat = new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'tr-TR', { timeStyle: 'medium' })

  return (
    <MainLayout title={ss.meta.title} description={ss.meta.description} keywords={ss.meta.keywords} noIndex>
      <WorldPage world="kognita" planet={false} title={ss.title}>
        <section className={world.section} aria-labelledby="status-summary">
          <div className={world.sectionHead}>
            <h2 id="status-summary" role="status" aria-live="polite">{summary}</h2>
            {lastChecked && <p className={world.hint}>{ss.lastChecked}: {timeFormat.format(lastChecked)}</p>}
          </div>

          <div className={world.sectionBody}>
            <BackendNote />
            <ul className={styles.rows} data-tone={tone}>
              {services.map(service => (
                <li key={service.id} className={styles.row} data-status={service.status}>
                  <span className={styles.name}>{ss.services[service.id]}</span>
                  <span className={styles.state}>{ss.state[service.status]}</span>
                  <span className={styles.latency}>{service.latency !== undefined ? `${service.latency} ms` : ''}</span>
                </li>
              ))}
            </ul>
            <div className={world.actions}>
              <button type="button" className={world.primary} onClick={refresh} disabled={checking} aria-busy={checking}>
                {checking ? ss.checking : ss.refresh}
              </button>
            </div>
          </div>
        </section>
      </WorldPage>
    </MainLayout>
  )
}

export default SystemStatusPage
