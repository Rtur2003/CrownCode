import React, { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { motion } from 'framer-motion'
import { Activity, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'
import { fetchWithTimeout } from '@/hooks/useAsyncRequest'

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
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Activity size={28} style={{ color: '#ff4444' }} />
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
              {ss?.title || 'System Status'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: allOk ? '#22c55e' : '#ef4444',
              }}
            />
            <span style={{ color: '#999' }}>
              {allOk
                ? (ss?.allOperational || 'All systems operational')
                : (ss?.someIssues || 'Some services have issues')}
            </span>
            <button
              onClick={checkServices}
              disabled={checking}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '6px 12px',
                color: '#ccc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.85rem',
              }}
            >
              <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
              {ss?.refresh || 'Refresh'}
            </button>
          </div>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {services.map((svc, i) => (
            <motion.div
              key={svc.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '16px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {svc.status === 'ok' ? (
                  <CheckCircle size={18} style={{ color: '#22c55e' }} />
                ) : svc.status === 'error' ? (
                  <XCircle size={18} style={{ color: '#ef4444' }} />
                ) : (
                  <RefreshCw size={18} style={{ color: '#888' }} className="animate-spin" />
                )}
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{svc.name}</span>
              </div>
              <span style={{ color: '#666', fontSize: '0.85rem' }}>
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
