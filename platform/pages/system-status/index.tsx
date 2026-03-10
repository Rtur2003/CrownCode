import React, { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { motion } from 'framer-motion'
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

  const checkServices = async () => {
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

    setServices(results)
    setChecking(false)
  }

  useEffect(() => {
    checkServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const allOk = services.every((s) => s.status === 'ok')

  return (
    <MainLayout
      title={ss?.meta?.title || 'System Status - CrownCode'}
      description={ss?.meta?.description || 'Live status of CrownCode services.'}
      keywords={ss?.meta?.keywords || 'system status, health, uptime'}
    >
      <div className={styles['page-container']}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles['header-row']}>
            <Activity size={28} className={styles['header-icon']} />
            <h1 className={styles['title']}>
              {ss?.title || 'System Status'}
            </h1>
          </div>

          <div className={styles['status-bar']}>
            <span className={`${styles['status-dot']} ${allOk ? styles['status-dot-ok'] : styles['status-dot-error']}`} />
            <span className={styles['status-text']}>
              {allOk
                ? (ss?.allOperational || 'All systems operational')
                : (ss?.someIssues || 'Some services have issues')}
            </span>
            <button
              onClick={checkServices}
              disabled={checking}
              className={styles['refresh-btn']}
            >
              <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
              {ss?.refresh || 'Refresh'}
            </button>
          </div>
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
