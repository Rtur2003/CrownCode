// FL-MCP Gated User Dashboard.
// Protected customer vault: Supabase Google auth, license keys, credit balances,
// device seat revocations, key rotation, and 1-click client configuration.

import React, { useState, useEffect, useCallback } from 'react'
import type { NextPage } from 'next'
import type { Session } from '@supabase/supabase-js'
import {
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Laptop,
  Trash2,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Download,
  AlertCircle,
  LogIn,
  LogOut,
} from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { WorldPage } from '@/components/UI/WorldPage'
import { API_BASE_URL } from '@/config/api'
import { checkoutUrl } from '@/config/flmcp'
import { getSupabase, SUPABASE_CONFIGURED } from '@/config/supabase'
import { useLanguage } from '@/context/LanguageContext'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/fl-mcp.module.css'

interface DeviceSeat {
  id: string
  full_id?: string
  name: string
  created_at?: number
  last_seen: number
}

interface LicenseData {
  license_id: string
  key: string
  plan: string
  status: string
  period_end: number | null
  seats_allowed: number
  balance: number
  devices: DeviceSeat[]
  costs: Record<string, number>
}

interface LicenseSummary {
  id: string
  plan: string
  status: string
  period_end: number | null
  seats_allowed: number
}

interface AccountOverview {
  email: string
  balance: number
  trial_used: boolean
  license: LicenseSummary | null
  key?: string
  devices: DeviceSeat[]
  costs: Record<string, number>
}

const STORAGE_KEY = 'crowncode_flmcp_license'

const DEMO_LICENSE: LicenseData = {
  license_id: 'lic-demo-9921',
  key: 'FLMCP-9K42X-7T81B-VM26P-9Q84D',
  plan: 'pro',
  status: 'active',
  period_end: Math.floor(Date.now() / 1000) + 28 * 86400,
  seats_allowed: 2,
  balance: 295,
  devices: [
    {
      id: '9a8b1c2d',
      full_id: '9a8b1c2d-win11-studio',
      name: 'Studio-Main (Win11)',
      last_seen: Math.floor(Date.now() / 1000) - 3600,
    },
  ],
  costs: { 'produce.compose': 5, 'produce.flp': 3, 'mix.balance': 2 },
}

const FlMcpDashboardPage: NextPage = () => {
  const { t, language } = useLanguage()
  const isTr = language === 'tr'
  const P = (t as unknown as { flMcpPage?: typeof import('@/locales/en.json')['flMcpPage'] }).flMcpPage
  const D = P?.dashboard

  const [session, setSession] = useState<Session | null>(null)
  const [account, setAccount] = useState<AccountOverview | null>(null)
  const [inputKey, setInputKey] = useState('')
  const [license, setLicense] = useState<LicenseData | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'desktop' | 'cli' | 'cursor' | 'vscode'>('desktop')

  const loadAccount = useCallback(async (token: string) => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/flmcp/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        throw new Error(
          isTr
            ? 'Sunucudan hesap profili alınamadı.'
            : 'Could not fetch account profile from server.'
        )
      }
      const data: AccountOverview = await res.json()
      setAccount(data)
      if (data.license) {
        let cachedKey = data.key || ''
        if (cachedKey) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ license_id: data.license.id, key: cachedKey }))
          } catch {
            // Ignore storage errors
          }
        } else {
          try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
              const parsed = JSON.parse(saved)
              if (parsed?.key && (!parsed.license_id || parsed.license_id === data.license.id)) {
                cachedKey = parsed.key
              }
            }
          } catch {
            // Ignore storage errors
          }
        }
        setLicense(prev => ({
          license_id: data.license?.id || 'lic',
          key: cachedKey || prev?.key || 'FLMCP-•••••-•••••-•••••-•••••',
          plan: data.license?.plan || 'trial',
          status: data.license?.status || 'active',
          period_end: data.license?.period_end ?? null,
          seats_allowed: data.license?.seats_allowed ?? 2,
          balance: data.balance,
          devices: data.devices || [],
          costs: data.costs || { 'produce.compose': 5, 'produce.flp': 3, 'mix.balance': 2 },
        }))
      } else {
        setLicense(null)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : isTr ? 'Hesap yüklenemedi.' : 'Could not load account.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }, [isTr])

  // Subscribe to Supabase auth state
  useEffect(() => {
    const sb = getSupabase()
    if (!sb) { return }

    sb.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session)
        loadAccount(data.session.access_token)
      }
    })

    const { data: authListener } = sb.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
      if (currentSession?.access_token) {
        loadAccount(currentSession.access_token)
      } else {
        setAccount(null)
        setLicense(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [loadAccount])

  // Load standalone key from localStorage if not signed in
  useEffect(() => {
    if (session) { return }
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.key) {
          fetchStandaloneKey(parsed.key)
        }
      }
    } catch {
      // Ignore local storage errors
    }
  }, [session])

  const fetchStandaloneKey = async (keyInput: string) => {
    setLoading(true)
    setErrorMsg(null)
    try {
      if (keyInput.includes('DEMO') || keyInput.startsWith('FLMCP-')) {
        const normalized: LicenseData = {
          ...DEMO_LICENSE,
          key: keyInput,
        }
        setLicense(normalized)
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ key: normalized.key }))
      } else {
        throw new Error(
          isTr
            ? 'Lütfen geçerli bir FLMCP-XXXXX anahtarı girin veya Google ile giriş yapın.'
            : 'Please enter a valid FLMCP-XXXXX key or sign in with Google.'
        )
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : isTr ? 'Lisans yüklenemedi.' : 'Could not load license.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    const sb = getSupabase()
    if (!sb) {
      setErrorMsg(
        isTr
          ? 'Supabase kimlik doğrulaması bu ortamda yapılandırılmamış.'
          : 'Supabase authentication is not configured in this environment.'
      )
      return
    }
    setLoading(true)
    setErrorMsg(null)
    const options: { redirectTo?: string } = {}
    if (typeof window !== 'undefined') {
      options.redirectTo = `${window.location.origin}/dashboard/fl-mcp`
    }
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options,
    })
    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    const sb = getSupabase()
    if (sb) {
      await sb.auth.signOut()
    }
    setSession(null)
    setAccount(null)
    setLicense(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const handleClaimTrial = async () => {
    if (!session?.access_token) {
      await handleGoogleSignIn()
      return
    }

    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/flmcp/me/trial`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(
          errData.detail || (isTr ? 'Deneme sürümü başlatılamadı.' : 'Trial provisioning failed.')
        )
      }
      const data: AccountOverview & { key: string } = await res.json()
      const licId = data.license?.id || session.user.id
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ license_id: licId, key: data.key }))
      } catch {
        // Ignore storage errors
      }
      setShowKey(true)
      setSuccessMsg(
        isTr
          ? '30 günlük deneme sürümünüz ve 15 krediniz etkinleştirildi.'
          : 'Your 30-day trial and 15 credits are activated.'
      )
      setAccount(data)
      setLicense({
        license_id: licId,
        key: data.key,
        plan: data.license?.plan || 'trial',
        status: data.license?.status || 'active',
        period_end: data.license?.period_end ?? null,
        seats_allowed: data.license?.seats_allowed ?? 1,
        balance: data.balance ?? 15,
        devices: data.devices || [],
        costs: data.costs || { 'produce.compose': 5, 'produce.flp': 3, 'mix.balance': 2 },
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : isTr ? 'Deneme sürümü alınamadı.' : 'Could not claim trial.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleRotateKey = async () => {
    if (!session?.access_token) { return }
    const confirmText = isTr
      ? 'Yeni bir lisans anahtarı oluşturulsun mu? Eski anahtarınız hemen geçersiz olacaktır.'
      : 'Generate a new license key? Your old key will stop working immediately.'
    if (!window.confirm(confirmText)) { return }

    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/flmcp/me/key/rotate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      if (!res.ok) {
        throw new Error(isTr ? 'Lisans anahtarı yenilenemedi.' : 'Failed to rotate license key.')
      }
      const data = await res.json()
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ license_id: data.license?.id || license?.license_id, key: data.key })
        )
      } catch {
        // Ignore storage errors
      }
      setShowKey(true)
      setLicense(prev => (prev ? { ...prev, key: data.key } : null))
      setSuccessMsg(
        isTr ? 'Lisans anahtarı başarıyla yenilendi.' : 'License key regenerated successfully.'
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : isTr ? 'Anahtar yenilenemedi.' : 'Could not rotate key.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeSeat = async (deviceId: string) => {
    if (!license) { return }
    setRevokingId(deviceId)
    setErrorMsg(null)
    try {
      if (session?.access_token) {
        const res = await fetch(`${API_BASE_URL}/api/v1/flmcp/me/devices/revoke`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ device_id: deviceId }),
        })
        if (!res.ok) {
          throw new Error(isTr ? 'Cihaz koltuğu kaldırılamadı.' : 'Device seat revocation failed.')
        }
      }
      setLicense(prev =>
        prev
          ? {
              ...prev,
              devices: prev.devices.filter(d => d.id !== deviceId && d.full_id !== deviceId),
            }
          : null
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : isTr ? 'Cihaz kaldırılamadı.' : 'Could not revoke device.'
      setErrorMsg(msg)
    } finally {
      setRevokingId(null)
    }
  }

  const copyLicenseKey = () => {
    if (!license) { return }
    navigator.clipboard.writeText(license.key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const maskKey = (k: string) => {
    if (showKey) { return k }
    const parts = k.split('-')
    if (parts.length < 5) { return 'FLMCP-•••••-•••••-•••••-•••••' }
    return `${parts[0]}-•••••-•••••-•••••-${parts[4]}`
  }

  const formatPeriodEnd = (ts: number | null) => {
    if (!ts) { return isTr ? 'Aktif abonelik' : 'Active subscription' }
    return new Date(ts * 1000).toLocaleDateString(isTr ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const claudeDesktopConfig = JSON.stringify(
    {
      mcpServers: {
        'fl-mcp': {
          command: 'python',
          args: ['-m', 'fl_mcp.server'],
          env: {
            FL_MCP_LICENSE: license?.key || 'FLMCP-YOUR-KEY-HERE',
          },
        },
      },
    },
    null,
    2
  )

  const claudeCodeCommand = `claude mcp add fl-mcp python -m fl_mcp.server --env FL_MCP_LICENSE=${license?.key || 'FLMCP-YOUR-KEY-HERE'}`
  const cursorConfig = JSON.stringify(
    { mcpServers: { 'fl-mcp': { command: 'python', args: ['-m', 'fl_mcp.server'] } } },
    null,
    2
  )
  const vscodeConfig = JSON.stringify(
    { 'github.copilot.chat.mcpServers': { 'fl-mcp': { command: 'python', args: ['-m', 'fl_mcp.server'] } } },
    null,
    2
  )

  const stripStepPrefix = (s: string) => s.replace(/^\d+\.\s*/, '')

  return (
    <MainLayout
      title={D?.title || 'FL-MCP User Dashboard | CrownCode'}
      description={D?.subtitle || 'Manage your license key, active device seats, and credit balances.'}
      noIndex
    >
      <WorldPage
        world="fl-mcp"
        title={D?.title || 'FL-MCP License Dashboard'}
        lead={D?.subtitle || 'Manage your license key, device seats, and credit balances.'}
        planet={false}
      >
        {!session && !license ? (
          <section className={world.section} aria-labelledby="flmcp-auth-heading">
            <div className={world.sectionHead}>
              <h2 id="flmcp-auth-heading">{D?.authTitle || 'Access Your License Vault'}</h2>
              <p>
                {D?.authDescription ||
                  (isTr
                    ? 'Cihaz aktivasyonlarınıza ve kredilerinize ulaşmak için Google hesabınızla giriş yapın veya lisans anahtarınızı girin.'
                    : 'Sign in with your Google account to access your machines, licenses, and credits, or claim a 30-day free trial.')}
              </p>
            </div>
            <div className={world.sectionBody}>
              <div className={styles.vaultBox}>
                {errorMsg && (
                  <p className={world.error} style={{ marginTop: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </p>
                )}

                <div style={{ marginBottom: '26px' }}>
                  <button
                    type="button"
                    className={world.primary}
                    disabled={loading || !SUPABASE_CONFIGURED}
                    onClick={handleGoogleSignIn}
                    style={{ gap: '10px' }}
                  >
                    {loading ? <RefreshCw size={17} /> : <LogIn size={17} />}
                    <span>{isTr ? 'Google ile Giriş Yap' : 'Sign in with Google'}</span>
                  </button>
                  {!SUPABASE_CONFIGURED && (
                    <p className={world.error}>
                      {isTr
                        ? 'Supabase kimlik doğrulama ortam değişkenleri ayarlanmamış.'
                        : 'Supabase authentication environment variables are not set.'}
                    </p>
                  )}
                </div>

                <div style={{ paddingTop: '22px', borderTop: '1px solid var(--line)' }}>
                  <div className={world.field} style={{ marginBottom: '14px' }}>
                    <label htmlFor="flmcp-key-input" className={world.fieldLabel}>
                      {isTr ? 'Veya doğrudan lisans anahtarınızı girin' : 'Or enter standalone license key'}
                    </label>
                    <input
                      id="flmcp-key-input"
                      type="text"
                      className={world.input}
                      placeholder={D?.keyPlaceholder || 'FLMCP-XXXXX-XXXXX-XXXXX-XXXXX'}
                      value={inputKey}
                      onChange={e => setInputKey(e.target.value)}
                      style={{ maxWidth: '420px', fontFamily: 'var(--font-family-mono)' }}
                    />
                  </div>
                  <div className={world.actions}>
                    <button
                      type="button"
                      className={world.primary}
                      disabled={loading || !inputKey.trim()}
                      onClick={() => fetchStandaloneKey(inputKey.trim())}
                      style={{ gap: '8px' }}
                    >
                      <Key size={15} />
                      <span>{D?.loadButton || (isTr ? 'Kasayı Aç' : 'Access Vault')}</span>
                    </button>
                    <button
                      type="button"
                      className={world.link}
                      onClick={() => setLicense(DEMO_LICENSE)}
                    >
                      {isTr ? 'Örnek Oturumu Yükle' : 'Load Demo Session'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* User Session Bar */}
            <div className={styles.sessionBar}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={styles.statusDot} />
                <span style={{ fontSize: '0.92rem', color: 'var(--ink)' }}>
                  {isTr ? 'Aktif oturum:' : 'Signed in as'}{' '}
                  <strong>{session?.user?.email || account?.email || (isTr ? 'Doğrulanmış Prodüktör' : 'Authenticated Producer')}</strong>
                </span>
              </div>
              <button
                type="button"
                className={world.link}
                onClick={handleSignOut}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <LogOut size={14} />
                <span>{isTr ? 'Çıkış Yap' : 'Sign Out'}</span>
              </button>
            </div>

            {errorMsg && (
              <p className={world.error} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </p>
            )}

            {successMsg && (
              <p className={world.note} style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} />
                <span>{successMsg}</span>
              </p>
            )}

            {/* Trial Offer banner if signed in but no license yet */}
            {!license && account && !account.trial_used && (
              <section className={world.section} aria-labelledby="flmcp-claim-heading">
                <div className={world.sectionHead}>
                  <h2 id="flmcp-claim-heading">
                    {D?.claimTrialButton || (isTr ? '30 Günlük Ücretsiz Deneme' : '30-Day Free Trial')}
                  </h2>
                  <p>
                    {D?.trialPrompt ||
                      (isTr
                        ? 'Her doğrulanmış Google hesabına 15 ücretsiz üretim kredisi ve 30 günlük tam deneme lisansı tanımlanır.'
                        : 'Every verified Google account gets 15 complimentary production credits and a full 30-day evaluation license.')}
                  </p>
                </div>
                <div className={world.sectionBody}>
                  <button
                    type="button"
                    className={world.primary}
                    onClick={handleClaimTrial}
                    disabled={loading}
                    style={{ gap: '8px' }}
                  >
                    <Sparkles size={16} />
                    <span>{D?.claimTrialButton || (isTr ? '30 Günlük Ücretsiz Deneme Al' : 'Claim 30-Day Free Trial')}</span>
                  </button>
                </div>
              </section>
            )}

            {license && (
              <>
                {/* Section 1: License Vault */}
                <section className={world.section} aria-labelledby="flmcp-vault-heading">
                  <div className={world.sectionHead}>
                    <h2 id="flmcp-vault-heading">{D?.vaultTitle || 'License Vault'}</h2>
                    <p>
                      {D?.planLabel || (isTr ? 'Mevcut Plan' : 'Current Plan')}:{' '}
                      <strong style={{ color: 'var(--accent)' }}>{license.plan}</strong> ·{' '}
                      {D?.statusLabel || (isTr ? 'Durum' : 'Status')}: {license.status}
                    </p>
                  </div>
                  <div className={world.sectionBody}>
                    <div className={styles.vaultBox}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.82rem', color: 'var(--muted)' }}>
                          {D?.licenseKeyLabel || 'License Key'}
                        </span>
                        <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.82rem', color: 'var(--muted)' }}>
                          {D?.periodEndLabel || (isTr ? 'Yenilenme' : 'Renews')}: {formatPeriodEnd(license.period_end)}
                        </span>
                      </div>

                      <div className={styles.keyDisplayRow}>
                        <div className={styles.keyBox}>{maskKey(license.key)}</div>
                        <button
                          type="button"
                          className={world.primary}
                          onClick={() => setShowKey(!showKey)}
                          title={showKey ? D?.hideKey || 'Hide' : D?.showKey || 'Reveal'}
                          style={{ gap: '8px' }}
                        >
                          {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                          <span>{showKey ? D?.hideKey || 'Hide' : D?.showKey || 'Reveal'}</span>
                        </button>
                        <button
                          type="button"
                          className={world.primary}
                          onClick={copyLicenseKey}
                          title={D?.copyKey || 'Copy Key'}
                          style={{ gap: '8px' }}
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                          <span>{copied ? D?.copied || 'Copied' : D?.copyKey || 'Copy'}</span>
                        </button>
                        {session && (
                          <button
                            type="button"
                            className={world.link}
                            onClick={handleRotateKey}
                            disabled={loading}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <RefreshCw size={14} />
                            <span>{isTr ? 'Anahtarı Yenile' : 'Rotate Key'}</span>
                          </button>
                        )}
                      </div>

                      <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--muted)' }}>
                        <ShieldCheck size={16} color="var(--accent)" />
                        <span>
                          {D?.devicesCount || (isTr ? 'Kayıtlı Cihazlar' : 'Registered Seats')}:{' '}
                          {license.devices.length} / {license.seats_allowed}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 2: Credit Balance & Cost Breakdown */}
                <section className={world.section} aria-labelledby="flmcp-credits-heading">
                  <div className={world.sectionHead}>
                    <h2 id="flmcp-credits-heading">{D?.creditsTitle || 'Live Credit Balance'}</h2>
                    <p>
                      {isTr
                        ? 'Her kapsamlı üretim işlemi kredileri atomik olarak düşer. FL Studio üzerinde hata oluşursa kredi iade edilir.'
                        : 'Each complex AI generation settles credits atomically. No deduction occurs if an FL Studio operation fails.'}
                    </p>
                  </div>
                  <div className={world.sectionBody}>
                    <div className={styles.creditCard}>
                      <div className={styles.creditValueBox}>
                        <span className={styles.creditNumber}>{license.balance}</span>
                        <span className={styles.creditLabel}>{D?.creditsAvailable || 'Credits Available'}</span>
                      </div>

                      <div className={styles.creditMeter}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem', color: 'var(--body)' }}>
                          <span>{isTr ? 'Kredi Kapasitesi' : 'Credit Capacity'}</span>
                          <span>{license.balance} {isTr ? 'Kredi' : 'Credits'}</span>
                        </div>
                        <div className={styles.meterTrack}>
                          <div
                            className={styles.meterFill}
                            style={{ width: `${Math.min(100, Math.max(5, (license.balance / 300) * 100))}%` }}
                          />
                        </div>
                        <div className={world.actions} style={{ marginTop: '16px' }}>
                          <a
                            href={checkoutUrl('pro', session?.user?.email || account?.email) || '/fl-mcp#pricing'}
                            target="_blank"
                            rel="noreferrer"
                            className={world.link}
                          >
                            {isTr ? 'Pro Paket ($19/ay)' : 'Pro Plan ($19/mo)'}
                          </a>
                          <a
                            href={checkoutUrl('studio', session?.user?.email || account?.email) || '/fl-mcp#pricing'}
                            target="_blank"
                            rel="noreferrer"
                            className={world.link}
                          >
                            {isTr ? 'Studio Paket ($49/ay)' : 'Studio Plan ($49/mo)'}
                          </a>
                          <a
                            href={checkoutUrl('pack100', session?.user?.email || account?.email) || '/fl-mcp#pricing'}
                            target="_blank"
                            rel="noreferrer"
                            className={world.link}
                          >
                            {isTr ? '+100 Ek Kredi ($10)' : 'Top up +100 Credits ($10)'}
                          </a>
                        </div>
                      </div>
                    </div>

                    <dl className={world.margins}>
                      <div>
                        <dt>produce.compose</dt>
                        <dd>{D?.costCompose || 'Full Song Composition (5 credits)'}</dd>
                      </div>
                      <div>
                        <dt>produce.flp</dt>
                        <dd>{D?.costFlp || 'FLP Project Generation (3 credits)'}</dd>
                      </div>
                      <div>
                        <dt>mix.balance</dt>
                        <dd>{D?.costBalance || 'Mixer Auto-Balance (2 credits)'}</dd>
                      </div>
                      <div>
                        <dt>transport & metering</dt>
                        <dd>{D?.costTransport || 'Fader Moves & Audio Metering (0 credits)'}</dd>
                      </div>
                    </dl>
                  </div>
                </section>

                {/* Section 3: Device Seats Management */}
                <section className={world.section} aria-labelledby="flmcp-devices-heading">
                  <div className={world.sectionHead}>
                    <h2 id="flmcp-devices-heading">{D?.devicesTitle || 'Active Device Seats'}</h2>
                    <p>
                      {isTr
                        ? `${license.seats_allowed} koltuktan ${license.devices.length} tanesi kullanımda. Claude Desktop veya Claude Code ile bağlanın.`
                        : `${license.devices.length} of ${license.seats_allowed} seats used. Connect machines via Claude Desktop or Claude Code.`}
                    </p>
                  </div>
                  <div className={world.sectionBody}>
                    {license.devices.length === 0 ? (
                      <div style={{ padding: '24px', background: 'color-mix(in srgb, #050407 60%, transparent)', border: '1px solid var(--line)', borderRadius: '2px', color: 'var(--muted)' }}>
                        <p style={{ margin: 0, fontSize: '0.94rem' }}>
                          {D?.noDevices || 'No machines currently activated. Connect your first computer using the setup instructions below.'}
                        </p>
                      </div>
                    ) : (
                      <div className={styles.deviceList}>
                        {license.devices.map(device => {
                          const idToRevoke = device.id || device.full_id || ''
                          const isRevoking = revokingId === idToRevoke
                          return (
                            <div key={idToRevoke} className={styles.deviceItem}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Laptop size={20} color="var(--accent)" />
                                <div>
                                  <strong style={{ display: 'block', color: 'var(--ink)', fontSize: '0.95rem' }}>{device.name}</strong>
                                  <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.78rem', color: 'var(--muted)' }}>
                                    ID: {device.id} · {D?.deviceLastSeen || (isTr ? 'Son görülme' : 'Last seen')}:{' '}
                                    {new Date(device.last_seen * 1000).toLocaleTimeString(isTr ? 'tr-TR' : 'en-US')}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                className={world.link}
                                onClick={() => handleRevokeSeat(idToRevoke)}
                                disabled={isRevoking}
                                style={{ color: 'var(--warn)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                              >
                                <Trash2 size={14} />
                                <span>{isRevoking ? (isTr ? 'Kaldırılıyor...' : 'Revoking...') : D?.revokeSeat || 'Revoke Seat'}</span>
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </section>

                {/* Section 4: Quick Setup Guide */}
                <section className={world.section} aria-labelledby="flmcp-setup-heading">
                  <div className={world.sectionHead}>
                    <h2 id="flmcp-setup-heading">{D?.setupTitle || 'Quick Client Setup Guide'}</h2>
                    <p>
                      {D?.setupSubtitle || 'Connect FL-MCP to your AI development environment in under two minutes.'}
                    </p>
                    <div className={world.actions} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                      <a
                        href="https://github.com/Rtur2003/FL-MCP/releases"
                        target="_blank"
                        rel="noreferrer"
                        className={world.link}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Download size={14} />
                        <span>{D?.downloadBundle || 'Download Claude Desktop (.mcpb)'}</span>
                        <ExternalLink size={12} />
                      </a>
                      <a
                        href="https://www.tobias-erichsen.de/software/loopmidi.html"
                        target="_blank"
                        rel="noreferrer"
                        className={world.link}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Download size={14} />
                        <span>{D?.downloadLoopMidi || 'Download loopMIDI (Windows)'}</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                  <div className={world.sectionBody}>
                    <div className={styles.tabs}>
                      <button
                        type="button"
                        className={styles.tab}
                        data-active={activeTab === 'desktop'}
                        onClick={() => setActiveTab('desktop')}
                      >
                        {D?.tabDesktop || 'Claude Desktop'}
                      </button>
                      <button
                        type="button"
                        className={styles.tab}
                        data-active={activeTab === 'cli'}
                        onClick={() => setActiveTab('cli')}
                      >
                        {D?.tabCli || 'Claude Code'}
                      </button>
                      <button
                        type="button"
                        className={styles.tab}
                        data-active={activeTab === 'cursor'}
                        onClick={() => setActiveTab('cursor')}
                      >
                        {D?.tabCursor || 'Cursor'}
                      </button>
                      <button
                        type="button"
                        className={styles.tab}
                        data-active={activeTab === 'vscode'}
                        onClick={() => setActiveTab('vscode')}
                      >
                        {D?.tabVscode || 'VS Code'}
                      </button>
                    </div>

                    {activeTab === 'desktop' && (
                      <div>
                        <p className={world.hint}>
                          {isTr ? 'claude_desktop_config.json dosyasına ekleyin:' : 'Add to claude_desktop_config.json:'}
                        </p>
                        <pre className={styles.codeBlock}>{claudeDesktopConfig}</pre>
                      </div>
                    )}

                    {activeTab === 'cli' && (
                      <div>
                        <p className={world.hint}>
                          {isTr ? 'Proje terminalinizde çalıştırın:' : 'Run in your project terminal:'}
                        </p>
                        <pre className={styles.codeBlock}>{claudeCodeCommand}</pre>
                      </div>
                    )}

                    {activeTab === 'cursor' && (
                      <div>
                        <p className={world.hint}>
                          {isTr ? '.cursor/mcp.json dosyasına ekleyin:' : 'Add to .cursor/mcp.json:'}
                        </p>
                        <pre className={styles.codeBlock}>{cursorConfig}</pre>
                      </div>
                    )}

                    {activeTab === 'vscode' && (
                      <div>
                        <p className={world.hint}>
                          {isTr ? 'VS Code settings.json dosyasına ekleyin:' : 'Add to VS Code settings.json:'}
                        </p>
                        <pre className={styles.codeBlock}>{vscodeConfig}</pre>
                      </div>
                    )}

                    <ol className={styles.steps}>
                      <li>{stripStepPrefix(D?.step1 || 'Install loopMIDI and create ports FL_MCP_IN and FL_MCP_OUT.')}</li>
                      <li>{stripStepPrefix(D?.step2 || 'Copy the controller script to your FL Studio Settings/Hardware folder.')}</li>
                      <li>{stripStepPrefix(D?.step3 || 'Add the MCP configuration above to your AI client.')}</li>
                      <li>{stripStepPrefix(D?.step4 || 'Run activate tool with your license key in your first chat turn.')}</li>
                    </ol>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </WorldPage>
    </MainLayout>
  )
}

export default FlMcpDashboardPage
