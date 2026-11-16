// FL-MCP v0.3.0: Compact product & engineering showcase for FL Studio 2025.
// 5 sections: Verification & Quickstart, Tabbed Studio Workbench (Visuals & Telemetry,
// 14 Tools, dB/Hz Solver, 12 Genres), 5-Layer Transparency Ladder, License Boundary, and FAQ.

import React, { useState } from 'react'
import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  Download,
  ExternalLink,
  ArrowRight,
} from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
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
    groove: {
      tr: 'Dört dörtlük kick vuruşları ve 16lık offbeat açık hi-hat yürüyüşü',
      en: 'Four-on-the-floor kick with offbeat open hi-hat drive',
    },
    description: {
      tr: 'Senkoplu org akorları, kazanç kademeli alt bas ve piyano rulosu ritim şablonu.',
      en: 'Syncopated chord progressions, sub-bass gain staging and sequenced groove.',
    },
  },
  {
    name: { tr: 'Techno', en: 'Techno' },
    bpm: '132 BPM',
    scale: { tr: 'Fa Minör (F Minor)', en: 'F Minor' },
    groove: {
      tr: 'Rumble sub-kick gövdesi ve mekanik ride sürüşü',
      en: 'Rumble sub-kick low-end with hypnotic ride pulse',
    },
    description: {
      tr: 'Yuvarlanan monofonik alt frekanslar, endüstriyel perküsyon ve karanlık yankı kuyruğu.',
      en: 'Rolling monophonic low-end sequences, crisp transients and dark room tails.',
    },
  },
  {
    name: { tr: 'Trance', en: 'Trance' },
    bpm: '138 BPM',
    scale: { tr: 'Re Minör (D Minor)', en: 'D Minor' },
    groove: {
      tr: 'Yuvarlanan offbeat bas dizilimi ve yan-zincir pompalaması',
      en: 'Rolling offbeat bassline with pumped supersaw transitions',
    },
    description: {
      tr: 'Yüksek enerjili supersaw akor kırılımları, filtre tarama otomasyonu ve 138 BPM itişi.',
      en: 'Euphoric supersaw progressions, automated filter sweeps and 138 BPM drive.',
    },
  },
  {
    name: { tr: 'DnB', en: 'DnB' },
    bpm: '174 BPM',
    scale: { tr: 'Mi Minör (E Minor)', en: 'E Minor' },
    groove: {
      tr: 'Senkoplu breakbeat hayalet trampetleri ve keskin kick yerleşimi',
      en: 'Syncopated breakbeat ghost snares with locked kick pocket',
    },
    description: {
      tr: 'Reese alt bas geçişleri, cerrahi alt frekans ayrımı ve 174 BPM kırık ritim örgüsü.',
      en: 'Reese basslines, tight sub crossover and high-tempo breakbeat sequencing.',
    },
  },
  {
    name: { tr: 'Dubstep', en: 'Dubstep' },
    bpm: '140 BPM',
    scale: { tr: 'Fa Minör (F Minor)', en: 'F Minor' },
    groove: {
      tr: 'Yarım zamanlı ağır trampet darbesi ve alt bas ağırlığı',
      en: 'Half-time snare weight on beat three with mono sub foundation',
    },
    description: {
      tr: 'Modülasyonlu orta frekans growl katmanları ve temiz alt bas headroom ayrımı.',
      en: 'Modulated midrange growls with isolated clean mono sub-bass headroom.',
    },
  },
  {
    name: { tr: 'Trap', en: 'Trap' },
    bpm: '142 BPM',
    scale: { tr: 'Do# Minör (C# Minor)', en: 'C# Minor' },
    groove: {
      tr: 'Yarım zamanlı vuruşlar ve 32lik üçleme hi-hat ruloları',
      en: 'Half-time bounce with 32nd triplet hi-hat rolls',
    },
    description: {
      tr: 'Perde kaymalı 808 glide hatları, keskin trampet geçişleri ve karanlık melodi döngüleri.',
      en: 'Pitch-gliding 808 patterns, snapping snares and dark melodic loops.',
    },
  },
  {
    name: { tr: 'Oriental Trap / Hicaz', en: 'Oriental Trap / Hicaz' },
    bpm: '138 BPM',
    scale: { tr: 'Re Hicaz (Frigyen Dominant)', en: 'D Hicaz (Phrygian Dominant)' },
    groove: {
      tr: 'Modern 808 baslar üzerinde darbuka ve bendir senkopları',
      en: 'Darbuka and bendir rhythmic pocket over modern 808 glides',
    },
    description: {
      tr: 'Hicaz gam dizilimi, makamsal melodi yazımı ve otantik perküsyon kit seçimi.',
      en: 'Hicaz scale voicings, ornamented melodic writing and matched percussion.',
    },
  },
  {
    name: { tr: 'Boom Bap', en: 'Boom Bap' },
    bpm: '90 BPM',
    scale: { tr: 'Mi♭ Majör (Eb Major)', en: 'Eb Major' },
    groove: {
      tr: 'İnsanileştirilmiş swing ve akustik davul cebi',
      en: 'Swung unquantized pocket with dusty acoustic kit timing',
    },
    description: {
      tr: 'Caz yedili akor kesimleri, yumuşak plak doygunluğu ve gövdeli trampet.',
      en: 'Chopped jazz seventh voicings, subtle warmth and punchy acoustic snares.',
    },
  },
  {
    name: { tr: 'Lo-Fi', en: 'Lo-Fi' },
    bpm: '82 BPM',
    scale: { tr: 'Sol Minör (G Minor)', en: 'G Minor' },
    groove: {
      tr: 'Rahat kuantizesiz tempo cebi ve hafif kapalı hat dokusu',
      en: 'Laid-back unquantized beat pocket with muted hat texture',
    },
    description: {
      tr: 'Sıcak Rhodes akorları, 9lu uzantılar ve yumuşatılmış üst frekans spektrumu.',
      en: 'Warm Rhodes ninths, softened treble shelf and intimate stereo balance.',
    },
  },
  {
    name: { tr: 'Pop', en: 'Pop' },
    bpm: '116 BPM',
    scale: { tr: 'Do Majör (C Major)', en: 'C Major' },
    groove: {
      tr: 'Net dörtlü itiş ve nakarat öncesi enerji yükselişi',
      en: 'Clean four-beat pocket built around pre-chorus lift',
    },
    description: {
      tr: 'Vokal için açılmış orta frekans cebi, sıkı bas ve dengeli dinamik aralık.',
      en: 'Vocal-pocket midrange clarity, tight bass guitar anchor and balanced LUFS.',
    },
  },
  {
    name: { tr: 'Synthwave', en: 'Synthwave' },
    bpm: '110 BPM',
    scale: { tr: 'La Minör (A Minor)', en: 'A Minor' },
    groove: {
      tr: 'Gated reverb trampet vurgusu ve sekizlik oktav bas',
      en: 'Gated reverb backbeat paired with driven octave saw bass',
    },
    description: {
      tr: 'Analog testere dalga bas arpejleri, sıcak koro padleri ve parlak synth lead.',
      en: 'Analog octave saw bass arpeggios, wide chorus pads and crisp synth leads.',
    },
  },
  {
    name: { tr: 'Reggaeton', en: 'Reggaeton' },
    bpm: '94 BPM',
    scale: { tr: 'Si Minör (B Minor)', en: 'B Minor' },
    groove: {
      tr: 'Klasik dembow ritim iskeleti ve sıkı trampet darbesi',
      en: 'Classic dembow kick-snare syncopation with locked mono sub',
    },
    description: {
      tr: 'Dembow perküsyon dizilimi, sıkı mono sub bas ve modern perküsyon kit uyumu.',
      en: 'Dembow percussion lattice, controlled mono sub weight and sparse lead stabs.',
    },
  },
]

const PLUGIN_SOLVER_EXAMPLES = [
  {
    plugin: 'FabFilter Pro-Q 3',
    raw: 'band1_freq = 0.432',
    solved: 'real="32 Hz", Q=0.71 (18 dB/oct HPF)',
  },
  {
    plugin: 'FabFilter Pro-C 2',
    raw: 'thresh = 0.650, ratio = 0.380',
    solved: 'settings="Threshold=-18 dB, Ratio=4:1"',
  },
  {
    plugin: 'Image-Line FLEX / Serum',
    raw: 'cutoff = 0.540',
    solved: 'real="2.4 kHz", view="io" + preset load',
  },
  {
    plugin: 'Fruity Limiter',
    raw: 'gain = 0.720, ceil = 0.940',
    solved: 'real="-1.0 dBTP", Target="-14.0 LUFS-I"',
  },
]

type InstallTab = 'plugin' | 'desktop' | 'clients' | 'http'
type WorkbenchTab = 'overview' | 'tools' | 'solver' | 'genres'

const FlMcpShowcasePage: NextPage = () => {
  const { t, language } = useLanguage()
  const isTr = language === 'tr'
  const [installTab, setInstallTab] = useState<InstallTab>('plugin')
  const [workbenchTab, setWorkbenchTab] = useState<WorkbenchTab>('overview')
  const [activeGenreIndex, setActiveGenreIndex] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  if (!ENTRY) {
    return null
  }

  const item = resolveProduct(ENTRY, t)
  const P = (t as unknown as { flMcpPage?: typeof import('@/locales/en.json')['flMcpPage'] }).flMcpPage
  const activeGenre = GENRES[activeGenreIndex]
  const checkoutReady = Boolean(
    checkoutUrl('pro') && checkoutUrl('studio') && checkoutUrl('pack100')
  )

  const handleCopy = (id: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopiedId(id)
    setTimeout(() => {
      setCopiedId(prev => (prev === id ? null : prev))
    }, 2000)
  }

  const copyLabel = P?.install.copyButton || (isTr ? 'Kopyala' : 'Copy')
  const copiedLabel = P?.install.copiedButton || (isTr ? 'Kopyalandı' : 'Copied')

  const commandBlocks: Record<InstallTab, Array<{ id: string; label: string; code: string }>> = {
    plugin: [
      {
        id: 'cc-marketplace',
        label: isTr ? 'Claude Code (5 Skill + mix-engineer Alt Ajanı)' : 'Claude Code (5 Skills + mix-engineer Agent)',
        code: '/plugin marketplace add Rtur2003/FL-MCP',
      },
      {
        id: 'selftest-deep',
        label: isTr ? 'Canlı FL Studio 2025 Doğrulaması (17 kontrol)' : 'Live FL Studio 2025 Self-Test (17 checks)',
        code: 'fl-mcp selftest --deep',
      },
    ],
    desktop: [
      {
        id: 'mcpb-pipx',
        label: isTr ? 'Claude Desktop (.mcpb veya pipx)' : 'Claude Desktop (.mcpb bundle or pipx)',
        code: 'pipx install fl-mcp && fl-mcp install --client claude-desktop',
      },
      {
        id: 'desktop-json',
        label: 'claude_desktop_config.json',
        code: JSON.stringify({ mcpServers: { 'fl-mcp': { command: 'fl-mcp', args: [] } } }, null, 2),
      },
    ],
    clients: [
      {
        id: 'auto-register',
        label: 'Cursor · VS Code · Windsurf · Gemini CLI · Antigravity · Codex',
        code: 'fl-mcp install --all',
      },
      {
        id: 'cursor-json',
        label: '.cursor/mcp.json (Streamable-HTTP)',
        code: JSON.stringify({ mcpServers: { 'fl-mcp': { url: 'http://127.0.0.1:8765/mcp' } } }, null, 2),
      },
    ],
    http: [
      {
        id: 'http-serve',
        label: isTr ? 'Kalıcı HTTP (:8765/mcp) ve SSE (/sse) Daemon' : 'Persistent HTTP (:8765/mcp) & SSE (/sse) Daemon',
        code: 'fl-mcp serve --transport http --port 8765',
      },
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
        {/* Section 1: Runtime Verification Strip & Side-by-Side Connect */}
        <section id="install" className={`${world.section} ${styles.compactSection}`} aria-labelledby="flmcp-install-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-install-heading">{P?.install.title || 'Two Paths to Connect'}</h2>
            <p>{P?.install.subtitle}</p>
            <div className={world.actions}>
              <a
                href={GITHUB_RELEASES}
                target="_blank"
                rel="noreferrer"
                className={world.primary}
                style={{ gap: '8px' }}
              >
                <Download size={15} />
                <span>{P?.hero.getStarted || 'Download FL-MCP Studio'}</span>
              </a>
              <a
                href={GITHUB_REPO}
                target="_blank"
                rel="noreferrer"
                className={world.link}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <span>GitHub</span>
                <ExternalLink size={13} />
              </a>
              <Link
                href="/dashboard/fl-mcp"
                className={world.link}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <span>{isTr ? 'Lisans Kasası' : 'License Vault'}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className={world.sectionBody}>
            {/* Compact 4-column verified spec strip */}
            <dl className={styles.specStrip}>
              <div className={styles.specCell}>
                <dt>{P?.verification.liveLabel}</dt>
                <dd>
                  {P?.verification.liveValue}
                  <span className={styles.specSub}>{isTr ? 'build 5319 · API 40 (17 kontrol)' : 'build 5319 · API 40 (17 checks)'}</span>
                </dd>
              </div>
              <div className={styles.specCell}>
                <dt>{P?.verification.offlineLabel}</dt>
                <dd>
                  {P?.verification.offlineValue}
                  <span className={styles.specSub}>Stubs, MIDI, .flp, BS.1770, HTTP</span>
                </dd>
              </div>
              <div className={styles.specCell}>
                <dt>{P?.verification.platformsLabel}</dt>
                <dd>
                  {P?.verification.platformsValue}
                  <span className={styles.specSub}>loopMIDI · IAC Driver · Wine</span>
                </dd>
              </div>
              <div className={styles.specCell}>
                <dt>{P?.verification.clientsLabel}</dt>
                <dd>
                  {P?.verification.clientsValue}
                  <span className={styles.specSub}>~4k tok · stdio · :8765 · SSE</span>
                </dd>
              </div>
            </dl>

            {/* Side-by-side compact install grid */}
            <div className={styles.installGrid}>
              <article className={styles.installCard}>
                <div className={styles.installHeader}>
                  <h3 className={styles.installTitle}>{P?.install.studioTitle}</h3>
                  <span className={styles.installBadge}>{P?.install.studioBadge}</span>
                </div>
                <p className={styles.installDesc}>{P?.install.studioDesc}</p>
                <ul className={styles.bulletList}>
                  {P?.install.studioFeatures.map((feat: string, idx: number) => (
                    <li key={idx}>
                      <Check size={14} color="var(--accent)" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <p className={styles.packageNote}>{P?.install.studioPackageNote}</p>
              </article>

              <article className={styles.installCard}>
                <div className={styles.installHeader}>
                  <h3 className={styles.installTitle}>{P?.install.cliTitle}</h3>
                  <span className={styles.installBadge}>{P?.install.cliBadge}</span>
                </div>

                <div className={styles.tabs} role="tablist" aria-label={isTr ? 'Kurulum akışı seç' : 'Select setup method'}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={installTab === 'plugin'}
                    className={styles.tab}
                    data-active={installTab === 'plugin'}
                    onClick={() => setInstallTab('plugin')}
                  >
                    Claude Code
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={installTab === 'desktop'}
                    className={styles.tab}
                    data-active={installTab === 'desktop'}
                    onClick={() => setInstallTab('desktop')}
                  >
                    Desktop (.mcpb)
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={installTab === 'clients'}
                    className={styles.tab}
                    data-active={installTab === 'clients'}
                    onClick={() => setInstallTab('clients')}
                  >
                    IDE / CLI
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={installTab === 'http'}
                    className={styles.tab}
                    data-active={installTab === 'http'}
                    onClick={() => setInstallTab('http')}
                  >
                    HTTP / SSE
                  </button>
                </div>

                {commandBlocks[installTab].map(block => (
                  <div key={block.id} className={styles.codeWrap}>
                    <div className={styles.codeToolbar}>
                      <span className={styles.codeLabel}>{block.label}</span>
                      <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={() => handleCopy(block.id, block.code)}
                      >
                        {copiedId === block.id ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedId === block.id ? copiedLabel : copyLabel}</span>
                      </button>
                    </div>
                    <pre className={styles.codeBlockCompact}>
                      <code>{block.code}</code>
                    </pre>
                  </div>
                ))}
              </article>
            </div>
          </div>
        </section>

        {/* Section 2: Tabbed Studio Workbench (Visuals + 14 Tools + dB/Hz Solver + 12 Genres) */}
        <section className={`${world.section} ${styles.compactSection}`} aria-labelledby="flmcp-workbench-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-workbench-heading">{P?.features.title || 'Studio Engineering'}</h2>
            <p>{P?.features.subtitle}</p>
          </div>

          <div className={world.sectionBody}>
            <div className={styles.tabs} role="tablist" aria-label={isTr ? 'Stüdyo yetenekleri' : 'Studio capabilities'}>
              <button
                type="button"
                role="tab"
                aria-selected={workbenchTab === 'overview'}
                className={styles.tab}
                data-active={workbenchTab === 'overview'}
                onClick={() => setWorkbenchTab('overview')}
              >
                {isTr ? 'Görseller ve Ölçüm' : 'Visuals & Telemetry'}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={workbenchTab === 'tools'}
                className={styles.tab}
                data-active={workbenchTab === 'tools'}
                onClick={() => setWorkbenchTab('tools')}
              >
                {isTr ? '14 Düz Araç (~4k tok)' : '14 Flat Tools (~4k tok)'}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={workbenchTab === 'solver'}
                className={styles.tab}
                data-active={workbenchTab === 'solver'}
                onClick={() => setWorkbenchTab('solver')}
              >
                {isTr ? 'dB / Hz Çözücü' : 'dB / Hz Solver'}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={workbenchTab === 'genres'}
                className={styles.tab}
                data-active={workbenchTab === 'genres'}
                onClick={() => setWorkbenchTab('genres')}
              >
                {isTr ? '12 Tür Motoru' : '12-Genre Engine'}
              </button>
            </div>

            {workbenchTab === 'overview' && (
              <div>
                <div className={styles.gallery}>
                  <figure className={styles.shot}>
                    <Image
                      src="/images/fl-mcp/studio-bridge.webp"
                      alt={isTr ? 'FL-MCP ve FL Studio 2025 köprüsü' : 'FL-MCP and FL Studio 2025 bridge'}
                      width={1440}
                      height={900}
                      sizes="(max-width: 860px) 100vw, 400px"
                      priority
                    />
                    <figcaption>
                      {isTr
                        ? 'loopMIDI, IAC Driver veya Wine üzerinden API 40 ve FL-MCP Studio kontrolü.'
                        : 'API 40 and FL-MCP Studio bridge over loopMIDI, IAC Driver or Wine.'}
                    </figcaption>
                  </figure>
                  <figure className={styles.shot}>
                    <Image
                      src="/images/fl-mcp/acoustic-metering.webp"
                      alt={isTr ? 'BS.1770-4 LUFS ve True Peak ölçüm ekranı' : 'BS.1770-4 LUFS and True Peak metering'}
                      width={1440}
                      height={900}
                      sizes="(max-width: 860px) 100vw, 400px"
                      priority
                    />
                    <figcaption>
                      {isTr
                        ? 'ITU-R BS.1770-4 / EBU 3342 ölçümü ve gizli masaüstü mastering döngüsü.'
                        : 'ITU-R BS.1770-4 / EBU 3342 metering and focus-free hidden render loop.'}
                    </figcaption>
                  </figure>
                </div>

                <div className={styles.telemetryRibbon}>
                  <div className={styles.telemetryHead}>
                    <span className={styles.dawStatus}>
                      <span className={styles.statusDot} />
                      <span>
                        {isTr
                          ? 'FL Studio 2025 v25.2.5 [build 5319] · fl_audio + fl_mix Örneği'
                          : 'FL Studio 2025 v25.2.5 [build 5319] · fl_audio + fl_mix Sample'}
                      </span>
                    </span>
                    <span>ITU-R BS.1770-4 · EBU 3342</span>
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
                      <span className={styles.meterValue}>{isTr ? '7 Bant · +0.86 Kor.' : '7-Band · +0.86 Corr'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {workbenchTab === 'tools' && (
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

            {workbenchTab === 'solver' && (
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

            {workbenchTab === 'genres' && (
              <div>
                <div className={styles.genreRibbon}>
                  {GENRES.map((g, idx) => (
                    <button
                      key={g.name.en}
                      type="button"
                      className={styles.genreChip}
                      data-active={activeGenreIndex === idx}
                      onClick={() => setActiveGenreIndex(idx)}
                    >
                      <span>{isTr ? g.name.tr : g.name.en}</span>
                      <span className={styles.genreBpm}>{g.bpm.replace(' BPM', '')}</span>
                    </button>
                  ))}
                </div>
                <div className={styles.genreInspector}>
                  <div className={styles.genreInspectorHeader}>
                    <span className={styles.genreInspectorTitle}>
                      {isTr ? activeGenre.name.tr : activeGenre.name.en}
                    </span>
                    <span className={styles.genreInspectorMeta}>{activeGenre.bpm}</span>
                    <span className={styles.genreInspectorMeta}>
                      {isTr ? activeGenre.scale.tr : activeGenre.scale.en}
                    </span>
                  </div>
                  <p className={styles.genreInspectorBody} style={{ marginBottom: '4px' }}>
                    {isTr ? activeGenre.description.tr : activeGenre.description.en}
                  </p>
                  <p className={styles.genreInspectorBody} style={{ color: 'var(--muted)' }}>
                    <strong>{isTr ? 'Groove:' : 'Groove:'}</strong>{' '}
                    {isTr ? activeGenre.groove.tr : activeGenre.groove.en}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Compact 5-Layer Transparency Ladder */}
        <section id="architecture-transparency" className={`${world.section} ${styles.compactSection}`} aria-labelledby="flmcp-transparency-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-transparency-heading">{P?.transparency.title || 'Architecture Transparency'}</h2>
            <p>{P?.transparency.subtitle}</p>
          </div>
          <div className={world.sectionBody}>
            <div className={styles.transparencyBox}>
              <p className={styles.transparencyIntro}>{P?.transparency.intro}</p>
              <div className={styles.ladder}>
                {P?.transparency.layers.map((step, idx) => (
                  <div key={idx} className={styles.ladderRow}>
                    <div className={styles.ladderLayer}>{step.layer}</div>
                    <div className={styles.ladderBody}>
                      <p className={styles.ladderLine}>{step.how}</p>
                      <p className={styles.ladderBoundary}>
                        {step.scope} · {step.boundary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: License & Privacy Boundary (or Live Checkout Plans) */}
        <section id="pricing" className={`${world.section} ${styles.compactSection}`} aria-labelledby="flmcp-pricing-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-pricing-heading">
              {checkoutReady ? P?.pricing.title : P?.commerceNotice.title}
            </h2>
            <p>{checkoutReady ? P?.pricing.subtitle : P?.commerceNotice.subtitle}</p>
          </div>

          <div className={world.sectionBody}>
            {checkoutReady ? (
              <>
                <div className={styles.pricingGrid}>
                  <div className={styles.pricingCard}>
                    <h3 className={styles.tierName}>{P?.pricing.free.name}</h3>
                    <div className={styles.tierPriceBox}>
                      <span className={styles.tierPrice}>{P?.pricing.free.price}</span>
                      <span className={styles.tierPeriod}>{P?.pricing.free.period}</span>
                    </div>
                    <p className={styles.tierDesc}>{P?.pricing.free.description}</p>
                    <ul className={styles.tierFeatures}>
                      {P?.pricing.free.features.map((feat: string, i: number) => (
                        <li key={i}>
                          <Check size={14} color="var(--accent)" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/dashboard/fl-mcp" className={world.link} style={{ alignSelf: 'flex-start' }}>
                      {P?.pricing.free.cta}
                    </Link>
                  </div>

                  <div className={styles.pricingCard} data-featured="true">
                    <span className={styles.pricingBadge}>{P?.pricing.pro.badge}</span>
                    <h3 className={styles.tierName}>{P?.pricing.pro.name}</h3>
                    <div className={styles.tierPriceBox}>
                      <span className={styles.tierPrice}>{P?.pricing.pro.price}</span>
                      <span className={styles.tierPeriod}>{P?.pricing.pro.period}</span>
                    </div>
                    <p className={styles.tierDesc}>{P?.pricing.pro.description}</p>
                    <ul className={styles.tierFeatures}>
                      {P?.pricing.pro.features.map((feat: string, i: number) => (
                        <li key={i}>
                          <Check size={14} color="var(--accent)" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={checkoutUrl('pro') || '/dashboard/fl-mcp'} className={world.primary}>
                      {P?.pricing.pro.cta}
                    </Link>
                  </div>

                  <div className={styles.pricingCard}>
                    <h3 className={styles.tierName}>{P?.pricing.studio.name}</h3>
                    <div className={styles.tierPriceBox}>
                      <span className={styles.tierPrice}>{P?.pricing.studio.price}</span>
                      <span className={styles.tierPeriod}>{P?.pricing.studio.period}</span>
                    </div>
                    <p className={styles.tierDesc}>{P?.pricing.studio.description}</p>
                    <ul className={styles.tierFeatures}>
                      {P?.pricing.studio.features.map((feat: string, i: number) => (
                        <li key={i}>
                          <Check size={14} color="var(--accent)" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={checkoutUrl('studio') || '/dashboard/fl-mcp'} className={world.link} style={{ alignSelf: 'flex-start' }}>
                      {P?.pricing.studio.cta}
                    </Link>
                  </div>
                </div>

                <div className={styles.topupBanner}>
                  <div>
                    <strong style={{ color: 'var(--ink)' }}>
                      {P?.pricing.pack100.name} ({P?.pricing.pack100.price})
                    </strong>
                    <p style={{ margin: '2px 0 0', fontSize: '0.86rem', color: 'var(--body)' }}>
                      {P?.pricing.pack100.description}
                    </p>
                  </div>
                  <Link href={checkoutUrl('pack100') || '/dashboard/fl-mcp'} className={world.link}>
                    {P?.pricing.pack100.cta}
                  </Link>
                </div>
              </>
            ) : (
              <>
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
                <p className={world.privacy} style={{ marginTop: '12px' }}>{P?.commerceNotice.commercialNote}</p>
              </>
            )}
          </div>
        </section>

        {/* Section 5: Compact Technical FAQ Accordion */}
        <section className={`${world.section} ${styles.compactSection}`} aria-labelledby="flmcp-faq-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-faq-heading">{P?.faq.title || 'Frequently Asked Questions'}</h2>
            <p>{P?.faq.subtitle}</p>
          </div>
          <div className={world.sectionBody}>
            <div className={styles.faqList}>
              {P?.faq.items.map((faq: { q: string; a: string }, idx: number) => {
                const isOpen = openFaq === idx
                return (
                  <div key={idx} className={styles.faqItem}>
                    <button
                      type="button"
                      className={styles.faqTrigger}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {isOpen && <div className={styles.faqAnswer}>{faq.a}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </WorldPage>
    </MainLayout>
  )
}

export default FlMcpShowcasePage
