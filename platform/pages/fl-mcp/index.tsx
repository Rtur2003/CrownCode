// FL-MCP v0.3.0: Single-viewport studio deck with on-demand Download/Support & Docs Modals.
// All deep reference docs (5-layer architecture, license boundary, FAQ) and release bundles live
// in accessible popups so the main screen stays concise, scannable, and clutter-free.

import React, { useState } from 'react'
import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  ExternalLink,
  Heart,
  Maximize2,
  ArrowRight,
} from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { Modal } from '@/components/UI/Modal'
import { WorldPage } from '@/components/UI/WorldPage'
import { checkoutUrl } from '@/config/flmcp'
import { PRODUCT_CATALOG, resolveProduct } from '@/config/product-catalog'
import { worldName } from '@/config/showroom-worlds'
import { useLanguage } from '@/context/LanguageContext'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/fl-mcp.module.css'

const ENTRY = PRODUCT_CATALOG.find(entry => entry.id === 'fl-mcp')
const GITHUB_REPO = 'https://github.com/Rtur2003/FL-MCP'
const GITHUB_RELEASES = 'https://github.com/Rtur2003/FL-MCP/releases'

interface GenreSpec {
  name: { tr: string; en: string }
  bpm: string
  scale: { tr: string; en: string }
  groove: { tr: string; en: string }
  description: { tr: string; en: string }
}

const GENRES: GenreSpec[] = [
  {
    name: { tr: 'House', en: 'House' },
    bpm: '126 BPM',
    scale: { tr: 'La Minör (A Minor)', en: 'A Minor' },
    groove: { tr: 'Dört dörtlük kick ve 16lık offbeat açık hi-hat yürüyüşü', en: 'Four-on-the-floor kick with offbeat open hi-hat drive' },
    description: { tr: 'Senkoplu akor dizileri, kazanç kademeli alt bas ve piyano rulosu şablonu.', en: 'Syncopated chord progressions, sub-bass gain staging and sequenced groove.' },
  },
  {
    name: { tr: 'Techno', en: 'Techno' },
    bpm: '132 BPM',
    scale: { tr: 'Fa Minör (F Minor)', en: 'F Minor' },
    groove: { tr: 'Rumble sub-kick gövdesi ve mekanik ride sürüşü', en: 'Rumble sub-kick low-end with hypnotic ride pulse' },
    description: { tr: 'Monofonik alt frekanslar, endüstriyel perküsyon ve karanlık yankı kuyruğu.', en: 'Rolling monophonic low-end sequences, crisp transients and dark room tails.' },
  },
  {
    name: { tr: 'Trance', en: 'Trance' },
    bpm: '138 BPM',
    scale: { tr: 'Re Minör (D Minor)', en: 'D Minor' },
    groove: { tr: 'Yuvarlanan offbeat bas dizilimi ve yan-zincir pompalaması', en: 'Rolling offbeat bassline with pumped supersaw transitions' },
    description: { tr: 'Supersaw akor kırılımları, filtre tarama otomasyonu ve 138 BPM itişi.', en: 'Euphoric supersaw progressions, automated filter sweeps and 138 BPM drive.' },
  },
  {
    name: { tr: 'DnB', en: 'DnB' },
    bpm: '174 BPM',
    scale: { tr: 'Mi Minör (E Minor)', en: 'E Minor' },
    groove: { tr: 'Senkoplu breakbeat hayalet trampetleri ve keskin kick', en: 'Syncopated breakbeat ghost snares with locked kick pocket' },
    description: { tr: 'Reese alt bas geçişleri ve cerrahi 174 BPM kırık ritim örgüsü.', en: 'Reese basslines, tight sub crossover and high-tempo breakbeat sequencing.' },
  },
  {
    name: { tr: 'Dubstep', en: 'Dubstep' },
    bpm: '140 BPM',
    scale: { tr: 'Fa Minör (F Minor)', en: 'F Minor' },
    groove: { tr: 'Yarım zamanlı trampet darbesi ve alt bas ağırlığı', en: 'Half-time snare weight on beat three with mono sub foundation' },
    description: { tr: 'Modülasyonlu orta frekans katmanları ve temiz alt bas headroom ayrımı.', en: 'Modulated midrange growls with isolated clean mono sub-bass headroom.' },
  },
  {
    name: { tr: 'Trap', en: 'Trap' },
    bpm: '142 BPM',
    scale: { tr: 'Do# Minör (C# Minor)', en: 'C# Minor' },
    groove: { tr: 'Yarım zamanlı vuruşlar ve 32lik üçleme hi-hat ruloları', en: 'Half-time bounce with 32nd triplet hi-hat rolls' },
    description: { tr: 'Perde kaymalı 808 glide hatları, keskin trampet ve karanlık melodi.', en: 'Pitch-gliding 808 patterns, snapping snares and dark melodic loops.' },
  },
  {
    name: { tr: 'Oriental Trap / Hicaz', en: 'Oriental Trap / Hicaz' },
    bpm: '138 BPM',
    scale: { tr: 'Re Hicaz (Frigyen Dominant)', en: 'D Hicaz (Phrygian Dominant)' },
    groove: { tr: 'Modern 808 baslar üzerinde darbuka ve bendir senkopları', en: 'Darbuka and bendir rhythmic pocket over modern 808 glides' },
    description: { tr: 'Hicaz gam dizilimi, makamsal melodi ve uyumlu perküsyon kiti.', en: 'Hicaz scale voicings, ornamented melodic writing and matched percussion.' },
  },
  {
    name: { tr: 'Boom Bap', en: 'Boom Bap' },
    bpm: '90 BPM',
    scale: { tr: 'Mi♭ Majör (Eb Major)', en: 'Eb Major' },
    groove: { tr: 'İnsanileştirilmiş swing ve akustik davul cebi', en: 'Swung unquantized pocket with dusty acoustic kit timing' },
    description: { tr: 'Caz yedili akor kesimleri, yumuşak doygunluk ve gövdeli trampet.', en: 'Chopped jazz seventh voicings, subtle warmth and punchy acoustic snares.' },
  },
  {
    name: { tr: 'Lo-Fi', en: 'Lo-Fi' },
    bpm: '82 BPM',
    scale: { tr: 'Sol Minör (G Minor)', en: 'G Minor' },
    groove: { tr: 'Kuantizesiz tempo cebi ve hafif kapalı hat dokusu', en: 'Laid-back unquantized beat pocket with muted hat texture' },
    description: { tr: 'Sıcak Rhodes dokuzluları ve yumuşatılmış üst frekans spektrumu.', en: 'Warm Rhodes ninths, softened treble shelf and intimate stereo balance.' },
  },
  {
    name: { tr: 'Pop', en: 'Pop' },
    bpm: '116 BPM',
    scale: { tr: 'Do Majör (C Major)', en: 'C Major' },
    groove: { tr: 'Net dörtlü itiş ve nakarat öncesi enerji yükselişi', en: 'Clean four-beat pocket built around pre-chorus lift' },
    description: { tr: 'Vokal için açılmış orta frekans cebi ve dengeli dinamik aralık.', en: 'Vocal-pocket midrange clarity, tight bass anchor and balanced LUFS.' },
  },
  {
    name: { tr: 'Synthwave', en: 'Synthwave' },
    bpm: '110 BPM',
    scale: { tr: 'La Minör (A Minor)', en: 'A Minor' },
    groove: { tr: 'Gated reverb trampet vurgusu ve sekizlik oktav bas', en: 'Gated reverb backbeat paired with driven octave saw bass' },
    description: { tr: 'Analog testere dalga arpejleri, sıcak koro padleri ve synth lead.', en: 'Analog octave saw bass arpeggios, wide chorus pads and crisp synth leads.' },
  },
  {
    name: { tr: 'Reggaeton', en: 'Reggaeton' },
    bpm: '94 BPM',
    scale: { tr: 'Si Minör (B Minor)', en: 'B Minor' },
    groove: { tr: 'Klasik dembow ritim iskeleti ve sıkı trampet darbesi', en: 'Classic dembow kick-snare syncopation with locked mono sub' },
    description: { tr: 'Dembow perküsyon dizilimi, mono sub bas ve modern perküsyon uyumu.', en: 'Dembow percussion lattice, controlled mono sub weight and sparse stabs.' },
  },
]

const PLUGIN_SOLVER_EXAMPLES = [
  { plugin: 'FabFilter Pro-Q 3', raw: 'band1_freq = 0.432', solved: 'real="32 Hz", Q=0.71 (18 dB/oct HPF)' },
  { plugin: 'FabFilter Pro-C 2', raw: 'thresh = 0.650, ratio = 0.380', solved: 'settings="Threshold=-18 dB, Ratio=4:1"' },
  { plugin: 'Image-Line FLEX / Serum', raw: 'cutoff = 0.540', solved: 'real="2.4 kHz", view="io" + preset load' },
  { plugin: 'Fruity Limiter', raw: 'gain = 0.720, ceil = 0.940', solved: 'real="-1.0 dBTP", Target="-14.0 LUFS-I"' },
]

const SHOTS = [
  {
    id: 'bridge',
    src: '/images/fl-mcp/studio-bridge.webp',
    caption: {
      tr: 'loopMIDI, IAC Driver veya Wine üzerinden API 40 ve FL-MCP Studio.',
      en: 'API 40 and FL-MCP Studio over loopMIDI, IAC Driver or Wine.',
    },
  },
  {
    id: 'metering',
    src: '/images/fl-mcp/acoustic-metering.webp',
    caption: {
      tr: 'ITU-R BS.1770-4 / EBU 3342 ölçümü ve gizli masaüstü mastering.',
      en: 'ITU-R BS.1770-4 / EBU 3342 metering and focus-free render loop.',
    },
  },
] as const

type InstallTab = 'plugin' | 'desktop' | 'clients' | 'http'
type DeckTab = 'overview' | 'tools' | 'solver' | 'genres' | 'architecture'
type DocsModalTab = 'architecture' | 'license' | 'faq'
type DownloadOs = 'win' | 'mac' | 'linux' | 'mcpb'

const DOWNLOAD_PACKAGES: Record<DownloadOs, { label: string; asset: string; bridge: string }> = {
  win: { label: 'Windows', asset: 'fl-mcp-studio-0.3.0-win-x64.zip', bridge: 'loopMIDI (x86_64 & ARM64)' },
  mac: { label: 'macOS', asset: 'fl-mcp-studio-0.3.0-macos-arm64.tar.gz', bridge: 'IAC Driver (Apple Silicon & Intel)' },
  linux: { label: 'Linux', asset: 'fl-mcp-studio-0.3.0-linux-x64.tar.gz', bridge: 'Wine path mapping' },
  mcpb: { label: '.mcpb Bundle', asset: 'fl-mcp-0.3.0.mcpb', bridge: 'Claude Desktop 1-click extension' },
}

const FlMcpShowcasePage: NextPage = () => {
  const { t, language } = useLanguage()
  const isTr = language === 'tr'
  const [installTab, setInstallTab] = useState<InstallTab>('plugin')
  const [deckTab, setDeckTab] = useState<DeckTab>('overview')
  const [activeGenreIndex, setActiveGenreIndex] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Interactive popups
  const [downloadOpen, setDownloadOpen] = useState(false)
  const [downloadOs, setDownloadOs] = useState<DownloadOs>('win')
  const [docsOpen, setDocsOpen] = useState(false)
  const [docsTab, setDocsTab] = useState<DocsModalTab>('architecture')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [zoomShotIndex, setZoomShotIndex] = useState<number | null>(null)

  if (!ENTRY) {
    return null
  }

  const item = resolveProduct(ENTRY, t)
  const P = (t as unknown as { flMcpPage?: typeof import('@/locales/en.json')['flMcpPage'] }).flMcpPage
  const M = P?.hero.modals
  const activeGenre = GENRES[activeGenreIndex]
  const checkoutReady = Boolean(checkoutUrl('pro') && checkoutUrl('studio') && checkoutUrl('pack100'))
  const supportLink = checkoutUrl('pack100')

  const handleCopy = (id: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopiedId(id)
    setTimeout(() => setCopiedId(prev => (prev === id ? null : prev)), 2000)
  }

  const copyLabel = P?.install.copyButton || (isTr ? 'Kopyala' : 'Copy')
  const copiedLabel = P?.install.copiedButton || (isTr ? 'Kopyalandı' : 'Copied')

  const commandBlocks: Record<InstallTab, Array<{ id: string; label: string; code: string }>> = {
    plugin: [
      { id: 'cc-marketplace', label: isTr ? 'Claude Code (5 Skill + mix-engineer)' : 'Claude Code (5 Skills + mix-engineer)', code: '/plugin marketplace add Rtur2003/FL-MCP' },
      { id: 'selftest-deep', label: isTr ? 'Canlı Doğrulama (17 kontrol)' : 'Live FL Self-Test (17 checks)', code: 'fl-mcp selftest --deep' },
    ],
    desktop: [
      { id: 'mcpb-pipx', label: isTr ? 'Claude Desktop (.mcpb veya pipx)' : 'Claude Desktop (.mcpb or pipx)', code: 'pipx install fl-mcp && fl-mcp install --client claude-desktop' },
      { id: 'desktop-json', label: 'claude_desktop_config.json', code: JSON.stringify({ mcpServers: { 'fl-mcp': { command: 'fl-mcp', args: [] } } }, null, 2) },
    ],
    clients: [
      { id: 'auto-register', label: 'Cursor · VS Code · Windsurf · Gemini · Antigravity · Codex', code: 'fl-mcp install --all' },
      { id: 'cursor-json', label: 'Streamable-HTTP (.cursor/mcp.json)', code: JSON.stringify({ mcpServers: { 'fl-mcp': { url: 'http://127.0.0.1:8765/mcp' } } }, null, 2) },
    ],
    http: [
      { id: 'http-serve', label: isTr ? 'Kalıcı HTTP (:8765/mcp) & SSE' : 'Persistent HTTP (:8765/mcp) & SSE', code: 'fl-mcp serve --transport http --port 8765' },
    ],
  }

  const offersSchema = checkoutReady
    ? [
        { '@type': 'Offer', name: 'MIT Open-Source Build', price: '0', priceCurrency: 'USD' },
        { '@type': 'Offer', name: 'Pro Producer', price: '19', priceCurrency: 'USD' },
        { '@type': 'Offer', name: 'Studio Edition', price: '49', priceCurrency: 'USD' },
      ]
    : [{ '@type': 'Offer', name: 'MIT Open-Source Build (v0.3.0)', price: '0', priceCurrency: 'USD' }]

  const softwareSchema = {
    '@type': 'SoftwareApplication',
    '@id': 'https://hasan-arthur-altuntas.xyz/fl-mcp#software',
    name: 'FL-MCP (v0.3.0) & FL-MCP Studio',
    description: P?.meta.description || item.description,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Windows, macOS, Linux',
    url: 'https://hasan-arthur-altuntas.xyz/fl-mcp',
    sameAs: [GITHUB_REPO],
    softwareVersion: '0.3.0',
    license: 'https://opensource.org/licenses/MIT',
    offers: offersSchema,
  }

  const openDocsAt = (tab: DocsModalTab) => {
    setDocsTab(tab)
    setDocsOpen(true)
  }

  const selectedPkg = DOWNLOAD_PACKAGES[downloadOs]

  return (
    <MainLayout
      title={P?.meta.title || item.title}
      description={P?.meta.description || item.description}
      {...(P?.meta.keywords ? { keywords: P.meta.keywords } : {})}
      schema={[softwareSchema]}
    >
      <WorldPage
        world="fl-mcp"
        title={worldName(ENTRY, item.title)}
        lead={P?.hero.subtitle || item.showroomDescription}
        {...(P?.hero.liveDemoBadge ? { meta: P.hero.liveDemoBadge } : {})}
      >
        {/* Single Compact Studio Console — no stacked vertical walls */}
        <section id="studio-console" className={styles.consoleSection} aria-labelledby="flmcp-console-heading">
          <div className={styles.consoleTopBar}>
            <div className={styles.topActionRow}>
              <button
                type="button"
                className={world.primary}
                onClick={() => setDownloadOpen(true)}
                style={{ gap: '8px' }}
              >
                <Download size={15} />
                <span>{P?.hero.getStarted || (isTr ? 'İndir ve Kur' : 'Download & Install')}</span>
              </button>
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => openDocsAt('architecture')}
              >
                <BookOpen size={15} />
                <span>{P?.hero.viewDocs || (isTr ? 'Teknik Doküman ve SSS' : 'Technical Docs & FAQ')}</span>
              </button>
              <Link href="/dashboard/fl-mcp" className={world.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span>{isTr ? 'Lisans Kasası' : 'License Vault'}</span>
                <ArrowRight size={13} />
              </Link>
              <a href={GITHUB_REPO} target="_blank" rel="noreferrer" className={world.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span>GitHub</span>
                <ExternalLink size={13} />
              </a>
            </div>

            <dl className={styles.specStripCompact}>
              <div className={styles.specChip}>
                <dt>{P?.verification.liveLabel}</dt>
                <dd>{P?.verification.liveValue}</dd>
              </div>
              <div className={styles.specChip}>
                <dt>{P?.verification.offlineLabel}</dt>
                <dd>{P?.verification.offlineValue}</dd>
              </div>
              <div className={styles.specChip}>
                <dt>{P?.verification.platformsLabel}</dt>
                <dd>{P?.verification.platformsValue}</dd>
              </div>
              <div className={styles.specChip}>
                <dt>{P?.verification.clientsLabel}</dt>
                <dd>{P?.verification.clientsValue}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.workbenchFrame}>
            <div className={styles.workbenchHeader}>
              <h2 id="flmcp-console-heading" className={styles.workbenchHeading}>
                {isTr ? 'Stüdyo Konsolu' : 'Studio Workbench'}
              </h2>
              <div className={styles.tabs} role="tablist" aria-label={isTr ? 'FL-MCP görünümleri' : 'FL-MCP panels'}>
                <button type="button" role="tab" aria-selected={deckTab === 'overview'} className={styles.tab} data-active={deckTab === 'overview'} onClick={() => setDeckTab('overview')}>
                  {isTr ? 'Kurulum & Görsel' : 'Setup & Visuals'}
                </button>
                <button type="button" role="tab" aria-selected={deckTab === 'tools'} className={styles.tab} data-active={deckTab === 'tools'} onClick={() => setDeckTab('tools')}>
                  {isTr ? '14 Araç (~4k tok)' : '14 Tools (~4k tok)'}
                </button>
                <button type="button" role="tab" aria-selected={deckTab === 'solver'} className={styles.tab} data-active={deckTab === 'solver'} onClick={() => setDeckTab('solver')}>
                  {isTr ? 'dB / Hz Çözücü' : 'dB / Hz Solver'}
                </button>
                <button type="button" role="tab" aria-selected={deckTab === 'genres'} className={styles.tab} data-active={deckTab === 'genres'} onClick={() => setDeckTab('genres')}>
                  {isTr ? '12 Tür Motoru' : '12-Genre Engine'}
                </button>
                <button type="button" role="tab" aria-selected={deckTab === 'architecture'} className={styles.tab} data-active={deckTab === 'architecture'} onClick={() => setDeckTab('architecture')}>
                  {isTr ? 'Mimari ve Lisans' : 'Architecture & MIT'}
                </button>
              </div>
            </div>

            {deckTab === 'overview' && (
              <div className={styles.deckSplit}>
                <div className={styles.deckLeft}>
                  <div className={styles.installHeader}>
                    <h3 className={styles.installTitle}>{P?.install.cliTitle}</h3>
                    <span className={styles.installBadge}>{P?.install.cliBadge}</span>
                  </div>
                  <div className={styles.tabs} role="tablist" aria-label={isTr ? 'Kurulum akışı' : 'Install client'}>
                    <button type="button" role="tab" aria-selected={installTab === 'plugin'} className={styles.tab} data-active={installTab === 'plugin'} onClick={() => setInstallTab('plugin')}>Claude Code</button>
                    <button type="button" role="tab" aria-selected={installTab === 'desktop'} className={styles.tab} data-active={installTab === 'desktop'} onClick={() => setInstallTab('desktop')}>Desktop (.mcpb)</button>
                    <button type="button" role="tab" aria-selected={installTab === 'clients'} className={styles.tab} data-active={installTab === 'clients'} onClick={() => setInstallTab('clients')}>IDE / CLI</button>
                    <button type="button" role="tab" aria-selected={installTab === 'http'} className={styles.tab} data-active={installTab === 'http'} onClick={() => setInstallTab('http')}>HTTP / SSE</button>
                  </div>

                  {commandBlocks[installTab].map(block => (
                    <div key={block.id} className={styles.codeWrap}>
                      <div className={styles.codeToolbar}>
                        <span className={styles.codeLabel}>{block.label}</span>
                        <button type="button" className={styles.copyBtn} onClick={() => handleCopy(block.id, block.code)}>
                          {copiedId === block.id ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedId === block.id ? copiedLabel : copyLabel}</span>
                        </button>
                      </div>
                      <pre className={styles.codeBlockCompact}><code>{block.code}</code></pre>
                    </div>
                  ))}

                  <div className={styles.studioMiniCallout}>
                    <span><strong>{P?.install.studioTitle}</strong> · {P?.install.studioBadge}</span>
                    <button type="button" className={world.link} onClick={() => setDownloadOpen(true)}>
                      {isTr ? 'Paketleri Gör' : 'Get Binary'}
                    </button>
                  </div>
                </div>

                <div className={styles.deckRight}>
                  <div className={styles.galleryCompact}>
                    {SHOTS.map((shot, idx) => (
                      <figure key={shot.id} className={styles.shot}>
                        <button
                          type="button"
                          className={styles.shotButton}
                          onClick={() => setZoomShotIndex(idx)}
                          aria-label={isTr ? 'Görseli büyüt' : 'Enlarge screenshot'}
                        >
                          <Image
                            src={shot.src}
                            alt={isTr ? shot.caption.tr : shot.caption.en}
                            width={1440}
                            height={900}
                            sizes="(max-width: 860px) 100vw, 320px"
                            priority
                          />
                          <span className={styles.shotZoomBadge} aria-hidden="true">
                            <Maximize2 size={13} />
                          </span>
                        </button>
                        <figcaption>{isTr ? shot.caption.tr : shot.caption.en}</figcaption>
                      </figure>
                    ))}
                  </div>

                  <div className={styles.telemetryRibbon}>
                    <div className={styles.telemetryHead}>
                      <span className={styles.dawStatus}>
                        <span className={styles.statusDot} />
                        <span>{isTr ? 'API 40 · fl_audio + fl_mix' : 'API 40 · fl_audio + fl_mix'}</span>
                      </span>
                      <span>ITU-R BS.1770-4</span>
                    </div>
                    <div className={styles.meterRow}>
                      <div className={styles.meterBox}>
                        <span className={styles.meterLabel}>LUFS-I</span>
                        <span className={styles.meterValue}>-14.1 LUFS</span>
                      </div>
                      <div className={styles.meterBox}>
                        <span className={styles.meterLabel}>True Peak</span>
                        <span className={styles.meterValue}>-1.02 dBTP</span>
                      </div>
                      <div className={styles.meterBox}>
                        <span className={styles.meterLabel}>LRA · Crest</span>
                        <span className={styles.meterValue}>6.8 LU · 9.4 dB</span>
                      </div>
                      <div className={styles.meterBox}>
                        <span className={styles.meterLabel}>{isTr ? 'Spektrum' : 'Spectrum'}</span>
                        <span className={styles.meterValue}>{isTr ? '7 Bant · +0.86' : '7-Band · +0.86'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {deckTab === 'tools' && (
              <div className={styles.toolGrid}>
                {P?.features.tools.items.map((tool, idx) => (
                  <article key={idx} className={styles.toolCard}>
                    <div className={styles.toolHeader}>
                      <span className={styles.toolName}>{tool.name}</span>
                      <span className={styles.toolRole}>{tool.role}</span>
                    </div>
                    <p className={styles.toolDetail}>{tool.detail}</p>
                  </article>
                ))}
              </div>
            )}

            {deckTab === 'solver' && (
              <div className={styles.pluginComparison}>
                <div className={`${styles.pluginRow} ${styles.pluginRowHeader}`}>
                  <span>{isTr ? 'Eklenti' : 'Plugin'}</span>
                  <span>{isTr ? 'Ham Değer (0.0-1.0)' : 'Raw DAW Float'}</span>
                  <span>{isTr ? 'fl_param Gerçek Birim' : 'fl_param Real Unit'}</span>
                </div>
                {PLUGIN_SOLVER_EXAMPLES.map((ex, idx) => (
                  <div key={idx} className={styles.pluginRow}>
                    <span style={{ color: 'var(--ink)' }}>{ex.plugin}</span>
                    <span className={styles.pluginValueOld}>{ex.raw}</span>
                    <span className={styles.pluginValueNew}>{ex.solved}</span>
                  </div>
                ))}
              </div>
            )}

            {deckTab === 'genres' && (
              <div>
                <div className={styles.genreRibbon}>
                  {GENRES.map((g, idx) => (
                    <button key={g.name.en} type="button" className={styles.genreChip} data-active={activeGenreIndex === idx} onClick={() => setActiveGenreIndex(idx)}>
                      <span>{isTr ? g.name.tr : g.name.en}</span>
                      <span className={styles.genreBpm}>{g.bpm.replace(' BPM', '')}</span>
                    </button>
                  ))}
                </div>
                <div className={styles.genreInspector}>
                  <div className={styles.genreInspectorHeader}>
                    <span className={styles.genreInspectorTitle}>{isTr ? activeGenre.name.tr : activeGenre.name.en}</span>
                    <span className={styles.genreInspectorMeta}>{activeGenre.bpm}</span>
                    <span className={styles.genreInspectorMeta}>{isTr ? activeGenre.scale.tr : activeGenre.scale.en}</span>
                  </div>
                  <p className={styles.genreInspectorBody} style={{ marginBottom: '4px' }}>{isTr ? activeGenre.description.tr : activeGenre.description.en}</p>
                  <p className={styles.genreInspectorBody} style={{ color: 'var(--muted)' }}>
                    <strong>{isTr ? 'Groove:' : 'Groove:'}</strong> {isTr ? activeGenre.groove.tr : activeGenre.groove.en}
                  </p>
                </div>
              </div>
            )}

            {deckTab === 'architecture' && (
              <div className={styles.commerceGrid}>
                <div className={styles.commerceCard}>
                  <h3>{P?.transparency.title}</h3>
                  <p>{P?.transparency.intro}</p>
                  <div style={{ marginTop: '10px' }}>
                    <button type="button" className={world.link} onClick={() => openDocsAt('architecture')}>
                      {isTr ? '5 Katmanı Detaylı Aç' : 'Open 5-Layer Reference'}
                    </button>
                  </div>
                </div>
                <div className={styles.commerceCard}>
                  <h3>{P?.commerceNotice.localBoundaryTitle}</h3>
                  <p>{P?.commerceNotice.localBoundaryBody}</p>
                  <div style={{ marginTop: '10px' }}>
                    <button type="button" className={world.link} onClick={() => openDocsAt('license')}>
                      {isTr ? 'Lisans ve Gizlilik Detayı' : 'Open License & FAQ'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Concise SEO & Scannable Facts Bar (zero scrolling bloat, solid crawlable HTML) */}
          <dl className={styles.bottomSummaryGrid}>
            <div>
              <dt>{isTr ? 'Desteklenen İstemciler' : 'AI Host Integration'}</dt>
              <dd>{P?.verification.clientsDetail}</dd>
            </div>
            <div>
              <dt>{isTr ? 'Yerel Veri ve Gizlilik' : 'Local Data Boundary'}</dt>
              <dd>{P?.commerceNotice.openSourceBody}</dd>
            </div>
            <div>
              <dt>{isTr ? 'Derin Dokümantasyon' : 'Engineering Specs & FAQ'}</dt>
              <dd>
                <span>{P?.transparency.subtitle}</span>{' '}
                <button type="button" className={world.link} onClick={() => openDocsAt('faq')}>
                  {isTr ? 'SSS ve Mimaride Oku' : 'Read Full FAQ & Architecture'}
                </button>
              </dd>
            </div>
          </dl>
        </section>

        {/* Modal 1: Download & Voluntary Support Popup */}
        <Modal
          open={downloadOpen}
          onClose={() => setDownloadOpen(false)}
          title={M?.downloadTitle || 'Download FL-MCP v0.3.0 & Studio'}
          subtitle={M?.downloadSubtitle}
          closeLabel={M?.close}
          size="md"
          footer={
            <>
              <span style={{ fontSize: '0.8rem', color: 'var(--soft)' }}>MIT License · v0.3.0</span>
              <a href={GITHUB_RELEASES} target="_blank" rel="noreferrer" className={world.primary} style={{ gap: '8px' }}>
                <Download size={15} />
                <span>{M?.downloadButton || 'Continue to Releases'}</span>
              </a>
            </>
          }
        >
          <div className={styles.tabs} role="tablist" aria-label={M?.platformLabel || 'Select OS'}>
            {(Object.keys(DOWNLOAD_PACKAGES) as DownloadOs[]).map(osKey => (
              <button
                key={osKey}
                type="button"
                role="tab"
                aria-selected={downloadOs === osKey}
                className={styles.tab}
                data-active={downloadOs === osKey}
                onClick={() => setDownloadOs(osKey)}
              >
                {DOWNLOAD_PACKAGES[osKey].label}
              </button>
            ))}
          </div>

          <div className={styles.modalPackageCard}>
            <div className={styles.modalPkgRow}>
              <span className={styles.modalPkgLabel}>{isTr ? 'Paket Dosyası' : 'Release Asset'}</span>
              <code className={styles.modalPkgCode}>{selectedPkg.asset}</code>
            </div>
            <div className={styles.modalPkgRow}>
              <span className={styles.modalPkgLabel}>{isTr ? 'Köprü / Hedef' : 'MIDI Bridge'}</span>
              <span className={styles.modalPkgVal}>{selectedPkg.bridge}</span>
            </div>
            <div className={styles.modalPkgRow}>
              <span className={styles.modalPkgLabel}>{isTr ? 'Canlı Doğrulama' : 'Self-Test CLI'}</span>
              <button type="button" className={styles.copyBtn} onClick={() => handleCopy('modal-selftest', 'fl-mcp selftest --deep')}>
                {copiedId === 'modal-selftest' ? <Check size={12} /> : <Copy size={12} />}
                <code>fl-mcp selftest --deep</code>
              </button>
            </div>
          </div>

          <div className={styles.supportPrompt}>
            <div className={styles.supportHeader}>
              <Heart size={16} color="var(--accent)" />
              <strong>{M?.supportTitle}</strong>
            </div>
            <p>{M?.supportBody}</p>
            <div className={world.actions} style={{ marginTop: '10px' }}>
              {supportLink ? (
                <a href={supportLink} target="_blank" rel="noreferrer" className={world.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span>{M?.supportButton} ($10)</span>
                  <ExternalLink size={13} />
                </a>
              ) : (
                <a href="https://github.com/sponsors/Rtur2003" target="_blank" rel="noreferrer" className={world.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span>{M?.supportButton} (GitHub Sponsors)</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
            {M?.supportNote && <p className={styles.supportMeta}>{M.supportNote}</p>}
          </div>
        </Modal>

        {/* Modal 2: Full Engineering Docs, License Boundary & FAQ Popup */}
        <Modal
          open={docsOpen}
          onClose={() => setDocsOpen(false)}
          title={M?.docsTitle || 'Architecture & FAQ'}
          subtitle={M?.docsSubtitle}
          closeLabel={M?.close}
          size="lg"
        >
          <div className={styles.tabs} role="tablist" aria-label={M?.docsTitle || 'Documentation sections'}>
            <button type="button" role="tab" aria-selected={docsTab === 'architecture'} className={styles.tab} data-active={docsTab === 'architecture'} onClick={() => setDocsTab('architecture')}>
              {M?.tabArchitecture}
            </button>
            <button type="button" role="tab" aria-selected={docsTab === 'license'} className={styles.tab} data-active={docsTab === 'license'} onClick={() => setDocsTab('license')}>
              {M?.tabLicense}
            </button>
            <button type="button" role="tab" aria-selected={docsTab === 'faq'} className={styles.tab} data-active={docsTab === 'faq'} onClick={() => setDocsTab('faq')}>
              {M?.tabFaq}
            </button>
          </div>

          {docsTab === 'architecture' && (
            <div className={styles.ladder}>
              {P?.transparency.layers.map((step, idx) => (
                <div key={idx} className={styles.ladderRow}>
                  <div className={styles.ladderLayer}>{step.layer}</div>
                  <div className={styles.ladderBody}>
                    <p className={styles.ladderLine}>{step.how}</p>
                    <p className={styles.ladderBoundary}>{step.scope} · {step.boundary}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {docsTab === 'license' && (
            <div className={styles.commerceGrid}>
              <div className={styles.commerceCard}>
                <h3>{P?.commerceNotice.openSourceTitle}</h3>
                <p>{P?.commerceNotice.openSourceBody}</p>
              </div>
              <div className={styles.commerceCard}>
                <h3>{P?.commerceNotice.localBoundaryTitle}</h3>
                <p>{P?.commerceNotice.localBoundaryBody}</p>
              </div>
            </div>
          )}

          {docsTab === 'faq' && (
            <div className={styles.faqList}>
              {P?.faq.items.map((faq: { q: string; a: string }, idx: number) => {
                const isOpen = openFaq === idx
                return (
                  <div key={idx} className={styles.faqItem}>
                    <button type="button" className={styles.faqTrigger} onClick={() => setOpenFaq(isOpen ? null : idx)} aria-expanded={isOpen}>
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {isOpen && <div className={styles.faqAnswer}>{faq.a}</div>}
                  </div>
                )
              })}
            </div>
          )}
        </Modal>

        {/* Modal 3: Gallery Screenshot Lightbox */}
        <Modal
          open={zoomShotIndex !== null}
          onClose={() => setZoomShotIndex(null)}
          title={zoomShotIndex !== null ? (isTr ? SHOTS[zoomShotIndex].caption.tr : SHOTS[zoomShotIndex].caption.en) : ''}
          closeLabel={M?.close}
          size="lg"
        >
          {zoomShotIndex !== null && (
            <div className={styles.lightboxBody}>
              <Image
                src={SHOTS[zoomShotIndex].src}
                alt={isTr ? SHOTS[zoomShotIndex].caption.tr : SHOTS[zoomShotIndex].caption.en}
                width={1440}
                height={900}
                sizes="(max-width: 900px) 95vw, 820px"
                style={{ width: '100%', height: 'auto', borderRadius: '2px', border: '1px solid var(--line-strong)' }}
              />
            </div>
          )}
        </Modal>
      </WorldPage>
    </MainLayout>
  )
}

export default FlMcpShowcasePage
