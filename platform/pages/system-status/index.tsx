import React, { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { motion } from 'motion/react'
import { Activity, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'
import { fetchWithTimeout } from '@/hooks/useAsyncRequest'

import styles from '@/styles/pages/system-status.module.css'

interface ServiceStatus {
  name: string
  url: string
  status: 'ok' | 'error' | 'loading'
  latency?: number
}

const SystemStatusPage: NextPage = () => {
  const { t } = useLanguage()
  const ss = t.systemStatus
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Frontend API', url: '/api/health', status: 'loading' },
    { name: 'Version', url: '/api/version', status: 'loading' },
  ])
  const [checking, setChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const noExternalBackend = !process.env.NEXT_PUBLIC_API_URL

  const checkServices = async (isMounted: () => boolean) => {
    setChecking(true)
    const hfUrl = process.env.NEXT_PUBLIC_API_URL

    const targets: { name: string; url: string }[] = [
      { name: 'Frontend API', url: '/api/health' },
      { name: 'Version', url: '/api/version' },
    ]
    if (hfUrl) {
      targets.push({ name: 'HF Backend', url: `${hfUrl}/api/health` })
    }

    const results = await Promise.all(
      targets.map(async (svc) => {
        const start = Date.now()
        try {
          const res = await fetchWithTimeout(svc.url, { timeout: 10_000 })
          return {
            name: svc.name,
            url: svc.url,
            status: res.ok ? ('ok' as const) : ('error' as const),
            latency: Date.now() - start,
          }
        } catch {
          return {
            name: svc.name,
            url: svc.url,
            status: 'error' as const,
            latency: Date.now() - start,
          }
        }
      }),
    )

    if (!isMounted()) {return}
    setServices(results)
    setLastChecked(new Date())
    setChecking(false)
  }

  useEffect(() => {
    let mounted = true
    checkServices(() => mounted)
    return () => {
      mounted = false
    }
  }, [])

  const allOk = services.every((s) => s.status === 'ok')
  const someOk = services.some((s) => s.status === 'ok')
  const isDegraded = !allOk && someOk && services.every((s) => s.status !== 'loading')

  return (
    <MainLayout
      title={ss.meta.title}
      description={ss.meta.description}
      keywords={ss.meta.keywords}
    >
      <div className={styles['page-container']}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles['header-row']}>
            <Activity size={28} className={styles['header-icon']} />
            <h1 className={styles['title']}>
              {ss.title}
            </h1>
          </div>

          <div className={styles['status-bar']}>
            <span className={`${styles['status-dot']} ${allOk ? styles['status-dot-ok'] : isDegraded ? styles['status-dot-degraded'] : styles['status-dot-error']}`} />
            <span className={styles['status-text']}>
              {allOk ? ss.allOperational : isDegraded ? ss.degraded : ss.someIssues}
            </span>
            <button
              type="button"
              onClick={() => checkServices(() => true)}
              disabled={checking}
              className={styles['refresh-btn']}
            >
              <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
              {ss.refresh}
            </button>
          </div>

          {lastChecked && (
            <p className={styles['last-checked']}>
              {ss.lastChecked}: {lastChecked.toLocaleTimeString()}
            </p>
          )}

          {noExternalBackend && (
            <p className={styles['demo-label']}>
              {ss.noExternalBackend}
            </p>
          )}
        </motion.div>

        <div className={styles['services-list']}>
          {services.map((svc, i) => (
            <motion.div
              key={svc.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className={styles['service-card']}
            >
              <div className={styles['service-info']}>
                {svc.status === 'ok' ? (
                  <CheckCircle size={18} className={styles['icon-ok']} />
                ) : svc.status === 'error' ? (
                  <XCircle size={18} className={styles['icon-error']} />
                ) : (
                  <RefreshCw size={18} className={`${styles['icon-loading']} animate-spin`} />
                )}
                <span className={styles['service-name']}>{svc.name}</span>
              </div>
              <span className={styles['service-latency']}>
                {svc.latency !== undefined ? `${svc.latency}ms` : '...'}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}

export default SystemStatusPage
