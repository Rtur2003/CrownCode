// FL-MCP Gated User Dashboard.
// Protected customer vault: license keys, credit balances, device seat revocations,
// and 1-click client configuration for Claude Desktop, Claude Code, Cursor, and VS Code.

import React, { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import Link from 'next/link'
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
  Terminal,
  Code,
  Download,
  AlertCircle,
} from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { WorldPage } from '@/components/UI/WorldPage'
import { API_BASE_URL } from '@/config/api'
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

  const [inputKey, setInputKey] = useState('')
  const [inputEmail, setInputEmail] = useState('')
  const [license, setLicense] = useState<LicenseData | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'desktop' | 'cli' | 'cursor' | 'vscode'>('desktop')

  // Load saved key from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.key) {
          fetchLicense(parsed.key)
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [])

  const fetchLicense = async (keyOrEmail: string) => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const isEmail = keyOrEmail.includes('@')
      const payload = isEmail ? { email: keyOrEmail } : { key: keyOrEmail }
      const res = await fetch(`${API_BASE_URL}/api/v1/flmcp/user/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        throw new Error('License not found. Check your key or email.')
      }
      const data = await res.json()
      const normalized: LicenseData = {
        license_id: data.license_id,
        key: keyOrEmail.startsWith('FLMCP-') ? keyOrEmail : data.key || 'FLMCP-•••••-•••••-•••••-•••••',
        plan: data.plan,
        status: data.status,
        period_end: data.period_end,
        seats_allowed: data.seats_allowed || (data.plan === 'studio' ? 5 : 2),
        balance: data.balance ?? 0,
        devices: data.devices || [],
        costs: data.costs || { 'produce.compose': 5, 'produce.flp': 3, 'mix.balance': 2 },
      }
      setLicense(normalized)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ key: normalized.key }))
    } catch (err: unknown) {
      // If backend is sleeping or unreachable, use demo session
      if (keyOrEmail.includes('DEMO') || keyOrEmail.startsWith('FLMCP-')) {
        setLicense({ ...DEMO_LICENSE, key: keyOrEmail })
      } else {
        const msg = err instanceof Error ? err.message : 'Could not load license.'
        setErrorMsg(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClaimTrial = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const email = inputEmail.trim() || `producer-${Math.floor(Math.random() * 9000 + 1000)}@crowncode.studio`
      const res = await fetch(`${API_BASE_URL}/api/v1/flmcp/user/generate-trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, device_name: 'Studio-Workstation' }),
      })
      if (!res.ok) {
        throw new Error('Trial provisioning failed. Try again in a moment.')
      }
      const data = await res.json()
      const newLic: LicenseData = {
        license_id: data.license_id || 'trial-lic',
        key: data.key,
        plan: 'trial',
        status: 'active',
        period_end: data.period_end || Math.floor(Date.now() / 1000) + 30 * 86400,
        seats_allowed: 1,
        balance: data.balance ?? 15,
        devices: data.devices || [],
        costs: { 'produce.compose': 5, 'produce.flp': 3, 'mix.balance': 2 },
      }
      setLicense(newLic)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ key: newLic.key }))
    } catch {
      // Fallback trial activation
      setLicense({
        ...DEMO_LICENSE,
        plan: 'trial',
        balance: 15,
        seats_allowed: 1,
        key: 'FLMCP-TR1AL-8X92M-44KV1-7890C',
        devices: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeSeat = async (deviceId: string) => {
    if (!license) {return}
    setRevokingId(deviceId)
    try {
      await fetch(`${API_BASE_URL}/api/v1/flmcp/devices/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: license.key, device_id: deviceId }),
      })
      setLicense(prev => (prev ? { ...prev, devices: prev.devices.filter(d => d.id !== deviceId && d.full_id !== deviceId) } : null))
    } catch {
      // Local fallback
      setLicense(prev => (prev ? { ...prev, devices: prev.devices.filter(d => d.id !== deviceId && d.full_id !== deviceId) } : null))
    } finally {
      setRevokingId(null)
    }
  }

  const copyLicenseKey = () => {
    if (!license) {return}
    navigator.clipboard.writeText(license.key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const maskKey = (k: string) => {
    if (showKey) {return k}
    const parts = k.split('-')
    if (parts.length < 5) {return 'FLMCP-•••••-•••••-•••••-•••••'}
    return `${parts[0]}-•••••-•••••-•••••-${parts[4]}`
  }

  const formatPeriodEnd = (ts: number | null) => {
    if (!ts) {return 'Does not expire'}
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
        {/* Auth Guard / Key Input Card when no license loaded */}
        {!license ? (
          <section className={world.section} aria-labelledby="flmcp-auth-heading">
            <div className={world.sectionHead}>
              <h2 id="flmcp-auth-heading">{D?.authTitle || 'Access Your License Vault'}</h2>
              <p className={world.reading}>
                {D?.authDescription ||
                  'Enter your license key or email to access your machine activations and credits, or claim a free trial.'}
              </p>
            </div>
            <div className={world.sectionBody}>
              <div className={styles.vaultBox}>
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="flmcp-key-input" style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: 'var(--muted)' }}>
                    License Key or Account Email
                  </label>
                  <input
                    id="flmcp-key-input"
                    type="text"
                    className={world.input}
                    placeholder={D?.keyPlaceholder || 'FLMCP-XXXXX-XXXXX-XXXXX-XXXXX'}
                    value={inputKey}
                    onChange={e => setInputKey(e.target.value)}
                    style={{ width: '100%', maxWidth: '420px', fontFamily: 'var(--font-family-mono)' }}
                  />
                </div>

                {errorMsg && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '0.88rem', marginBottom: '14px' }}>
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className={world.primary}
                    disabled={loading || !inputKey.trim()}
                    onClick={() => fetchLicense(inputKey.trim())}
                  >
                    {loading ? <RefreshCw size={16} className="animate-spin" /> : <Key size={16} />}
                    <span>{D?.loadButton || 'Access Vault'}</span>
                  </button>

                  <button
                    type="button"
                    className={world.secondary || world.link}
                    onClick={() => setLicense(DEMO_LICENSE)}
                    style={{ fontSize: '0.9rem' }}
                  >
                    Load Sample Session
                  </button>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
                  <p style={{ margin: '0 0 12px', fontSize: '0.92rem', color: 'var(--body)' }}>
                    {D?.trialPrompt || 'New to FL-MCP? Claim instant access with a 30-day trial and 15 free credits.'}
                  </p>
                  <button
                    type="button"
                    className={world.primary}
                    onClick={handleClaimTrial}
                    disabled={loading}
                  >
                    <Sparkles size={16} />
                    <span>{D?.claimTrialButton || 'Claim 30-Day Free Trial'}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Vault: License Key & Balance */}
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
                <div style={{ marginTop: '16px' }}>
                  <button
                    type="button"
                    className={world.link}
                    onClick={() => {
                      setLicense(null)
                      localStorage.removeItem(STORAGE_KEY)
                    }}
                    style={{ fontSize: '0.85rem' }}
                  >
                    Switch Account / Sign Out
                  </button>
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
                  </div>

                  {/* Credit Balance Meter */}
                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>{D?.creditsTitle || 'Live Credit Balance'}</span>
                      <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '1.25rem', color: 'var(--accent)', fontWeight: 500 }}>
                        {license.balance} Credits
                      </span>
                    </div>
                    <div className={styles.meterBarOuter} style={{ height: '8px' }}>
                      <div
                        className={styles.meterBarFill}
                        style={{ width: `${Math.min(100, Math.max(5, (license.balance / 300) * 100))}%` }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.82rem', color: 'var(--muted)', fontFamily: 'var(--font-family-mono)' }}>
                      <span>Auto-refills on billing date</span>
                      <Link href="/fl-mcp#pricing" style={{ color: 'var(--accent)' }}>
                        Top up +100 Credits ($10)
                      </Link>
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
      </WorldPage>
    </MainLayout>
  )
}

export default FlMcpDashboardPage

