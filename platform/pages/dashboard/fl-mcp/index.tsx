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

interface AccountOverview {
  account_id: string
  email: string
  plan: string
  balance: number
  trial_used: boolean
  seats_allowed: number
  license_key: string | null
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
    { id: '9a8b1c2d', full_id: '9a8b1c2d-win11-studio', name: 'Studio-Main (Win11)', last_seen: Math.floor(Date.now() / 1000) - 3600 },
  ],
  costs: { 'produce.compose': 5, 'produce.flp': 3, 'mix.balance': 2 },
}

const FlMcpDashboardPage: NextPage = () => {
  const { t } = useLanguage()
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
        throw new Error('Could not fetch account profile from server.')
      }
      const data: AccountOverview = await res.json()
      setAccount(data)
      if (data.license_key) {
        setLicense({
          license_id: data.account_id,
          key: data.license_key,
          plan: data.plan,
          status: 'active',
          period_end: null,
          seats_allowed: data.seats_allowed,
          balance: data.balance,
          devices: data.devices || [],
          costs: data.costs || { 'produce.compose': 5, 'produce.flp': 3, 'mix.balance': 2 },
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not load account.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }, [])

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
      // In standalone mode, activate test or load demo
      if (keyInput.includes('DEMO') || keyInput.startsWith('FLMCP-')) {
        const normalized: LicenseData = {
          ...DEMO_LICENSE,
          key: keyInput,
        }
        setLicense(normalized)
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ key: normalized.key }))
      } else {
        throw new Error('Please enter a valid FLMCP-XXXXX key or sign in with Google.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not load license.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    const sb = getSupabase()
    if (!sb) {
      setErrorMsg('Supabase authentication is not configured in this environment.')
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
      // Prompt user to sign in first
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
        throw new Error(errData.detail || 'Trial provisioning failed.')
      }
      const data = await res.json()
      setSuccessMsg('Your 30-day trial and 15 credits are activated.')
      setLicense({
        license_id: session.user.id,
        key: data.key,
        plan: data.plan || 'trial',
        status: 'active',
        period_end: null,
        seats_allowed: 1,
        balance: data.balance ?? 15,
        devices: [],
        costs: { 'produce.compose': 5, 'produce.flp': 3, 'mix.balance': 2 },
      })
      await loadAccount(session.access_token)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not claim trial.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleRotateKey = async () => {
    if (!session?.access_token) { return }
    if (!window.confirm('Generate a new license key? Your old key will stop working immediately.')) { return }

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
        throw new Error('Failed to rotate license key.')
      }
      const data = await res.json()
      setLicense(prev => (prev ? { ...prev, key: data.key } : null))
      setSuccessMsg('License key regenerated successfully.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not rotate key.'
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
          throw new Error('Device seat revocation failed.')
        }
      }
      setLicense(prev => (prev ? { ...prev, devices: prev.devices.filter(d => d.id !== deviceId && d.full_id !== deviceId) } : null))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not revoke device.'
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
    if (!ts) { return 'Active subscription' }
    return new Date(ts * 1000).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Configuration JSON for Claude Desktop
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
  const cursorConfig = JSON.stringify({ mcpServers: { 'fl-mcp': { command: 'python', args: ['-m', 'fl_mcp.server'] } } }, null, 2)
  const vscodeConfig = JSON.stringify({ 'github.copilot.chat.mcpServers': { 'fl-mcp': { command: 'python', args: ['-m', 'fl_mcp.server'] } } }, null, 2)

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
        {/* Auth Guard Card when not signed in and no license loaded */}
        {!session && !license ? (
          <section className={world.section} aria-labelledby="flmcp-auth-heading">
            <div className={world.sectionHead}>
              <h2 id="flmcp-auth-heading">{D?.authTitle || 'Access Your License Vault'}</h2>
              <p className={world.reading}>
                {D?.authDescription ||
                  'Sign in with your Google account to access your machines, licenses, and credits, or claim a 30-day free trial.'}
              </p>
            </div>
            <div className={world.sectionBody}>
              <div className={styles.vaultBox}>
                {errorMsg && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '0.88rem', marginBottom: '14px' }}>
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Primary: Sign in with Google */}
                <div style={{ marginBottom: '24px' }}>
                  <button
                    type="button"
                    className={world.primary}
                    disabled={loading || !SUPABASE_CONFIGURED}
                    onClick={handleGoogleSignIn}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 24px', fontSize: '1rem' }}
                  >
                    {loading ? <RefreshCw size={18} className="animate-spin" /> : <LogIn size={18} />}
                    <span>Sign in with Google</span>
                  </button>
                  {!SUPABASE_CONFIGURED && (
                    <p style={{ marginTop: '8px', fontSize: '0.82rem', color: '#f87171' }}>
                      Supabase authentication environment variables are not set.
                    </p>
                  )}
                </div>

                {/* Secondary: Standalone License Key */}
                <div style={{ paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
                  <label htmlFor="flmcp-key-input" style={{ display: 'block', marginBottom: '6px', fontSize: '0.88rem', color: 'var(--muted)' }}>
                    Or enter standalone license key
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                    <input
                      id="flmcp-key-input"
                      type="text"
                      className={world.input}
                      placeholder={D?.keyPlaceholder || 'FLMCP-XXXXX-XXXXX-XXXXX-XXXXX'}
                      value={inputKey}
                      onChange={e => setInputKey(e.target.value)}
                      style={{ width: '100%', maxWidth: '380px', fontFamily: 'var(--font-family-mono)' }}
                    />
                    <button
                      type="button"
                      className={world.secondary || world.link}
                      disabled={loading || !inputKey.trim()}
                      onClick={() => fetchStandaloneKey(inputKey.trim())}
                    >
                      <Key size={15} />
                      <span>{D?.loadButton || 'Access Vault'}</span>
                    </button>
                    <button
                      type="button"
                      className={world.link}
                      onClick={() => setLicense(DEMO_LICENSE)}
                      style={{ fontSize: '0.85rem' }}
                    >
                      Load Demo Session
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* User Session Bar */}
            <div style={{ marginBottom: '24px', padding: '12px 18px', background: 'color-mix(in srgb, #000 60%, transparent)', border: '1px solid var(--line)', borderRadius: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--ink)' }}>
                  Signed in as <strong>{session?.user?.email || account?.email || 'Authenticated Producer'}</strong>
                </span>
              </div>
              <button
                type="button"
                className={world.link}
                onClick={handleSignOut}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>

            {errorMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '0.88rem', marginBottom: '18px' }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80', fontSize: '0.88rem', marginBottom: '18px' }}>
                <Check size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Trial Offer banner if signed in but no license yet */}
            {!license && account && !account.trial_used && (
              <section className={world.section} aria-labelledby="flmcp-claim-heading">
                <div className={world.sectionHead}>
                  <h2 id="flmcp-claim-heading">{D?.trialPrompt || 'Claim Your 30-Day Free Trial'}</h2>
                  <p className={world.reading}>
                    Every verified Google account gets 15 complimentary production credits and a full 30-day evaluation license.
                  </p>
                </div>
                <div className={world.sectionBody}>
                  <button
                    type="button"
                    className={world.primary}
                    onClick={handleClaimTrial}
                    disabled={loading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Sparkles size={16} />
                    <span>{D?.claimTrialButton || 'Claim 30-Day Free Trial (15 Credits)'}</span>
                  </button>
                </div>
              </section>
            )}

            {/* Vault: License Key & Balance */}
            {license && (
              <>
                <section className={world.section} aria-labelledby="flmcp-vault-heading">
                  <div className={world.sectionHead}>
                    <h2 id="flmcp-vault-heading">{D?.vaultTitle || 'License Vault'}</h2>
                    <div style={{ marginTop: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '3px', border: '1px solid var(--accent)', color: 'var(--accent)', fontFamily: 'var(--font-family-mono)', fontSize: '0.8rem' }}>
                        Plan: {license.plan.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                        Status: {license.status}
                      </span>
                    </div>
                  </div>
                  <div className={world.sectionBody}>
                    <div className={styles.vaultBox}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.82rem', color: 'var(--muted)' }}>
                          {D?.licenseKeyLabel || 'License Key'}
                        </span>
                        <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.82rem', color: 'var(--muted)' }}>
                          Renews: {formatPeriodEnd(license.period_end)}
                        </span>
                      </div>

                      <div className={styles.keyDisplayRow}>
                        <div className={styles.keyBox}>{maskKey(license.key)}</div>
                        <button
                          type="button"
                          className={world.primary}
                          onClick={() => setShowKey(!showKey)}
                          title={showKey ? D?.hideKey || 'Hide' : D?.showKey || 'Reveal'}
                        >
                          {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                          <span>{showKey ? D?.hideKey || 'Hide' : D?.showKey || 'Reveal'}</span>
                        </button>
                        <button
                          type="button"
                          className={world.primary}
                          onClick={copyLicenseKey}
                          title={D?.copyKey || 'Copy Key'}
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                          <span>{copied ? D?.copied || 'Copied' : D?.copyKey || 'Copy'}</span>
                        </button>
                        {session && (
                          <button
                            type="button"
                            className={world.secondary || world.link}
                            onClick={handleRotateKey}
                            disabled={loading}
                            title="Regenerate license key"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <RefreshCw size={14} />
                            <span>Rotate</span>
                          </button>
                        )}
                      </div>

                      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--muted)' }}>
                        <ShieldCheck size={16} color="var(--accent)" />
                        <span>Seat Allocation: {license.devices.length} / {license.seats_allowed} machines activated</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Credit Balance & Cost Breakdown */}
                <section className={world.section} aria-labelledby="flmcp-credits-heading">
                  <div className={world.sectionHead}>
                    <h2 id="flmcp-credits-heading">{D?.creditsTitle || 'Live Credit Balance'}</h2>
                    <p className={world.reading}>
                      Each complex AI generation settles credits atomically. No deduction occurs on FL Studio errors.
                    </p>
                  </div>
                  <div className={world.sectionBody}>
                    <div className={styles.creditCard}>
                      <div className={styles.creditValueBox}>
                        <span className={styles.creditNumber}>{license.balance}</span>
                        <span className={styles.creditLabel}>{D?.creditsAvailable || 'Credits Available'}</span>
                      </div>

                      <div className={styles.creditMeter}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--body)' }}>
                          <span>Monthly Allocation Usage</span>
                          <span>{license.balance} Credits</span>
                        </div>
                        <div className={styles.meterTrack}>
                          <div
                            className={styles.meterFill}
                            style={{ width: `${Math.min(100, Math.max(5, (license.balance / 300) * 100))}%` }}
                          />
                        </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '8px', fontSize: '0.82rem', color: 'var(--muted)', fontFamily: 'var(--font-family-mono)' }}>
                            <span>Auto-refills on billing date</span>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                              <a
                                href={checkoutUrl('pro', session?.user?.email || account?.email) || '/fl-mcp#pricing'}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: 'var(--accent)' }}
                              >
                                Pro Plan ($19/mo)
                              </a>
                              <a
                                href={checkoutUrl('studio', session?.user?.email || account?.email) || '/fl-mcp#pricing'}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: 'var(--accent)' }}
                              >
                                Studio Plan ($49/mo)
                              </a>
                              <a
                                href={checkoutUrl('pack100', session?.user?.email || account?.email) || '/fl-mcp#pricing'}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: 'var(--accent)' }}
                              >
                                Top up +100 Credits ($10)
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                </section>

                {/* Device Seats Management */}
                <section className={world.section} aria-labelledby="flmcp-devices-heading">
                  <div className={world.sectionHead}>
                    <h2 id="flmcp-devices-heading">{D?.devicesTitle || 'Active Device Seats'}</h2>
                    <p className={world.reading}>
                      {license.devices.length} of {license.seats_allowed} seats used. Connect machines via Claude Desktop or Claude Code.
                    </p>
                  </div>
                  <div className={world.sectionBody}>
                    {license.devices.length === 0 ? (
                      <div style={{ padding: '24px', background: 'color-mix(in srgb, #000 50%, transparent)', border: '1px solid var(--line)', borderRadius: '3px', textAlign: 'center', color: 'var(--muted)' }}>
                        <Laptop size={32} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
                        <p style={{ margin: 0, fontSize: '0.92rem' }}>
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
                                    ID: {device.id} · Active: {new Date(device.last_seen * 1000).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                className={world.link}
                                onClick={() => handleRevokeSeat(idToRevoke)}
                                disabled={isRevoking}
                                style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}
                              >
                                <Trash2 size={14} />
                                <span>{isRevoking ? 'Revoking...' : D?.revokeSeat || 'Revoke Seat'}</span>
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </section>

                {/* Quick Setup Guide */}
                <section className={world.section} aria-labelledby="flmcp-setup-heading">
                  <div className={world.sectionHead}>
                    <h2 id="flmcp-setup-heading">{D?.setupTitle || 'Quick Client Setup Guide'}</h2>
                    <p className={world.reading}>
                      {D?.setupSubtitle || 'Connect FL-MCP to your AI development environment in under two minutes.'}
                    </p>
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <a
                        href="https://github.com/Rtur2003/FL-MCP/releases"
                        target="_blank"
                        rel="noreferrer"
                        className={world.link}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
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
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Download size={14} />
                        <span>{D?.downloadLoopMidi || 'Download loopMIDI (Windows)'}</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                  <div className={world.sectionBody}>
                    {/* Client Tabs */}
                    <div className={styles.tabList}>
                      <button
                        type="button"
                        className={styles.tabButton}
                        data-active={activeTab === 'desktop'}
                        onClick={() => setActiveTab('desktop')}
                      >
                        {D?.tabDesktop || 'Claude Desktop'}
                      </button>
                      <button
                        type="button"
                        className={styles.tabButton}
                        data-active={activeTab === 'cli'}
                        onClick={() => setActiveTab('cli')}
                      >
                        {D?.tabCli || 'Claude Code'}
                      </button>
                      <button
                        type="button"
                        className={styles.tabButton}
                        data-active={activeTab === 'cursor'}
                        onClick={() => setActiveTab('cursor')}
                      >
                        {D?.tabCursor || 'Cursor'}
                      </button>
                      <button
                        type="button"
                        className={styles.tabButton}
                        data-active={activeTab === 'vscode'}
                        onClick={() => setActiveTab('vscode')}
                      >
                        {D?.tabVscode || 'VS Code'}
                      </button>
                    </div>

                    {/* Configuration Code Block */}
                    {activeTab === 'desktop' && (
                      <div>
                        <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--body)' }}>
                          Add to <code>claude_desktop_config.json</code>:
                        </p>
                        <pre className={styles.codeBlock}>{claudeDesktopConfig}</pre>
                      </div>
                    )}

                    {activeTab === 'cli' && (
                      <div>
                        <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--body)' }}>
                          Run in your project terminal:
                        </p>
                        <pre className={styles.codeBlock}>{claudeCodeCommand}</pre>
                      </div>
                    )}

                    {activeTab === 'cursor' && (
                      <div>
                        <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--body)' }}>
                          Add to <code>.cursor/mcp.json</code>:
                        </p>
                        <pre className={styles.codeBlock}>{cursorConfig}</pre>
                      </div>
                    )}

                    {activeTab === 'vscode' && (
                      <div>
                        <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--body)' }}>
                          Add to VS Code <code>settings.json</code>:
                        </p>
                        <pre className={styles.codeBlock}>{vscodeConfig}</pre>
                      </div>
                    )}

                    {/* Step-by-step checklist */}
                    <div style={{ marginTop: '20px', padding: '16px', background: 'color-mix(in srgb, #000 60%, transparent)', border: '1px solid var(--line)', borderRadius: '3px' }}>
                      <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--body)' }}>
                        <li>{D?.step1 || '1. Install loopMIDI and create virtual ports FL_MCP_IN and FL_MCP_OUT.'}</li>
                        <li>{D?.step2 || '2. Copy the controller script to your FL Studio Settings/Hardware folder.'}</li>
                        <li>{D?.step3 || '3. Paste the configuration above into your AI client and restart it.'}</li>
                        <li>{D?.step4 || '4. Ask Claude to initialize FL Studio: your license will automatically activate.'}</li>
                      </ol>
                    </div>
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
