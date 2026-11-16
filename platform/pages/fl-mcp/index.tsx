// FL-MCP v0.3.0: Local FL Studio 2025 MCP Server & FL-MCP Studio Desktop App.
// Product engineering showcase, verification metrics, side-by-side install flows,
// 14 flat-schema tools, 5-layer Scripting API resolution ladder, and 12 seeded genres.

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

const FlMcpShowcasePage: NextPage = () => {
  const { t, language } = useLanguage()
  const isTr = language === 'tr'
  const [activeGenreIndex, setActiveGenreIndex] = useState(0)
  const [installTab, setInstallTab] = useState<InstallTab>('plugin')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

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
        label: isTr ? 'Claude Code Marketplace (5 Skill + mix-engineer Alt Ajanı)' : 'Claude Code Plugin Marketplace (5 Skills + mix-engineer Agent)',
        code: '/plugin marketplace add Rtur2003/FL-MCP',
      },
      {
        id: 'selftest-deep',
        label: isTr ? 'Canlı FL Studio 2025 Köprü Doğrulaması (17 derin kontrol)' : 'Live FL Studio 2025 Bridge Check (17 deep checks)',
        code: 'fl-mcp selftest --deep',
      },
    ],
    desktop: [
      {
        id: 'mcpb-pipx',
        label: isTr ? 'Claude Desktop .mcpb uzantısı veya pipx ile yerel kurulum' : 'Claude Desktop (.mcpb bundle) or pipx local install',
        code: 'pipx install fl-mcp\nfl-mcp install --client claude-desktop',
      },
      {
        id: 'desktop-json',
        label: 'claude_desktop_config.json (stdio)',
        code: JSON.stringify(
          {
            mcpServers: {
              'fl-mcp': {
                command: 'fl-mcp',
                args: [],
              },
            },
          },
          null,
          2
        ),
      },
    ],
    clients: [
      {
        id: 'auto-register',
        label: isTr ? 'Cursor · VS Code · Windsurf · Gemini CLI · Antigravity · Codex CLI' : 'Cursor · VS Code · Windsurf · Gemini CLI · Antigravity · Codex CLI',
        code: 'fl-mcp install --all',
      },
      {
        id: 'cursor-json',
        label: '.cursor/mcp.json (Streamable-HTTP)',
        code: JSON.stringify(
          {
            mcpServers: {
              'fl-mcp': {
                url: 'http://127.0.0.1:8765/mcp',
              },
            },
          },
          null,
          2
        ),
      },
    ],
    http: [
      {
        id: 'http-serve',
        label: isTr ? 'Kalıcı Yerel HTTP/SSE Daemon (Streamable-HTTP :8765/mcp ve /sse)' : 'Persistent Local HTTP/SSE Daemon (:8765/mcp & /sse)',
        code: 'fl-mcp serve --transport http --port 8765',
      },
      {
        id: 'endpoints',
        label: isTr ? 'Yerel Uç Noktalar' : 'Local Endpoints',
        code: 'Streamable-HTTP: http://127.0.0.1:8765/mcp\nSSE Stream:      http://127.0.0.1:8765/sse',
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
        {/* Section 1: Live Verification & Runtime Support */}
        <section className={world.section} aria-labelledby="flmcp-verify-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-verify-heading">{P?.verification.title || 'Verification & Runtime'}</h2>
            <p>{P?.verification.subtitle}</p>
            <div className={world.actions}>
              <a
                href={GITHUB_RELEASES}
                target="_blank"
                rel="noreferrer"
                className={world.primary}
                style={{ gap: '8px' }}
              >
                <Download size={16} />
                <span>{P?.hero.getStarted || 'Download FL-MCP Studio'}</span>
              </a>
              <a
                href={GITHUB_REPO}
                target="_blank"
                rel="noreferrer"
                className={world.link}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <span>{P?.hero.viewDocs || 'GitHub & Docs'}</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          <div className={world.sectionBody}>
            <div className={styles.factGrid}>
              <div className={styles.factCard}>
                <span className={styles.factLabel}>{P?.verification.liveLabel}</span>
                <span className={styles.factValue}>{P?.verification.liveValue}</span>
                <p className={styles.factDetail}>{P?.verification.liveDetail}</p>
              </div>
              <div className={styles.factCard}>
                <span className={styles.factLabel}>{P?.verification.offlineLabel}</span>
                <span className={styles.factValue}>{P?.verification.offlineValue}</span>
                <p className={styles.factDetail}>{P?.verification.offlineDetail}</p>
              </div>
              <div className={styles.factCard}>
                <span className={styles.factLabel}>{P?.verification.platformsLabel}</span>
                <span className={styles.factValue}>{P?.verification.platformsValue}</span>
                <p className={styles.factDetail}>{P?.verification.platformsDetail}</p>
              </div>
              <div className={styles.factCard}>
                <span className={styles.factLabel}>{P?.verification.clientsLabel}</span>
                <span className={styles.factValue}>{P?.verification.clientsValue}</span>
                <p className={styles.factDetail}>{P?.verification.clientsDetail}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Side-by-Side Install (Zero-Terminal Studio vs Plugin / CLI) */}
        <section id="install" className={world.section} aria-labelledby="flmcp-install-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-install-heading">{P?.install.title || 'Two Paths to Connect'}</h2>
            <p>{P?.install.subtitle}</p>
          </div>

          <div className={world.sectionBody}>
            <div className={styles.installGrid}>
              {/* Card A: Zero-Terminal FL-MCP Studio Desktop App */}
              <article className={styles.installCard}>
                <div className={styles.installHeader}>
                  <h3 className={styles.installTitle}>{P?.install.studioTitle}</h3>
                  <span className={styles.installBadge}>{P?.install.studioBadge}</span>
                </div>
                <p className={styles.installDesc}>{P?.install.studioDesc}</p>
                <ul className={styles.bulletList}>
                  {P?.install.studioFeatures.map((feat: string, idx: number) => (
                    <li key={idx}>
                      <Check size={15} color="var(--accent)" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <div className={world.actions} style={{ marginTop: 0 }}>
                  <a
                    href={GITHUB_RELEASES}
                    target="_blank"
                    rel="noreferrer"
                    className={world.primary}
                    style={{ gap: '8px' }}
                  >
                    <Download size={15} />
                    <span>{P?.install.studioDownloadCta}</span>
                  </a>
                </div>
                <p className={styles.packageNote}>{P?.install.studioPackageNote}</p>
              </article>

              {/* Card B: Copyable Plugin / .mcpb / Terminal Flows */}
              <article className={styles.installCard}>
                <div className={styles.installHeader}>
                  <h3 className={styles.installTitle}>{P?.install.cliTitle}</h3>
                  <span className={styles.installBadge}>{P?.install.cliBadge}</span>
                </div>
                <p className={styles.installDesc}>{P?.install.cliDesc}</p>

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
                    Claude Desktop (.mcpb)
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={installTab === 'clients'}
                    className={styles.tab}
                    data-active={installTab === 'clients'}
                    onClick={() => setInstallTab('clients')}
                  >
                    Cursor / IDE / CLI
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
                        {copiedId === block.id ? <Check size={13} /> : <Copy size={13} />}
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

        {/* Section 3: Studio Visuals & Real-Time Metering Console */}
        <section className={world.section} aria-labelledby="flmcp-console-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-console-heading">{P?.features.flIntegration.title || 'FL Studio 2025 Bridge'}</h2>
            <p>{P?.features.flIntegration.description}</p>
            <div className={world.actions}>
              <Link href="/dashboard/fl-mcp" className={world.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span>{isTr ? 'Geliştirici Lisans Kasası' : 'Developer License Vault'}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className={world.sectionBody}>
            <div className={styles.gallery}>
              <figure className={styles.shot}>
                <Image
                  src="/images/fl-mcp/studio-bridge.webp"
                  alt={
                    isTr
                      ? 'FL-MCP ve FL Studio 2025 arasında çift yönlü MIDI CC ve piyano rulosu köprüsü'
                      : 'Bi-directional MIDI CC and piano roll bridge between FL-MCP and FL Studio 2025'
                  }
                  width={1440}
                  height={900}
                  sizes="(max-width: 860px) 100vw, 400px"
                  priority
                />
                <figcaption>
                  {isTr
                    ? 'loopMIDI (Windows), IAC Driver (macOS) veya Wine (Linux) üzerinden FL Studio 2025 Scripting API 40 köprüsü.'
                    : 'FL Studio 2025 Scripting API 40 bridge over loopMIDI (Win), IAC Driver (macOS) or Wine (Linux).'}
                </figcaption>
              </figure>

              <figure className={styles.shot}>
                <Image
                  src="/images/fl-mcp/acoustic-metering.webp"
                  alt={
                    isTr
                      ? 'ITU-R BS.1770-4 / EBU 3342 LUFS ses yüksekliği ve True Peak spektral analiz ekranı'
                      : 'ITU-R BS.1770-4 / EBU 3342 LUFS loudness and True Peak spectral metering display'
                  }
                  width={1440}
                  height={900}
                  sizes="(max-width: 860px) 100vw, 400px"
                  priority
                />
                <figcaption>
                  {isTr
                    ? 'ITU-R BS.1770-4 / EBU 3342 ölçümü ve gerçek dB/Hz birimleriyle kapalı çevrim miks kontrolü.'
                    : 'ITU-R BS.1770-4 / EBU 3342 metering and real dB/Hz closed-loop mix verification.'}
                </figcaption>
              </figure>
            </div>

            <div className={styles.dawConsole}>
              <div className={styles.dawHeader}>
                <div className={styles.dawStatus}>
                  <span className={styles.statusDot} />
                  <span>
                    {isTr
                      ? 'FL Studio 2025 v25.2.5 [build 5319] · API 40 · fl_audio Örneği'
                      : 'FL Studio 2025 v25.2.5 [build 5319] · API 40 · fl_audio Sample'}
                  </span>
                </div>
                <div className={styles.dawLatency}>
                  {isTr ? 'ITU-R BS.1770-4 · EBU 3342 · 7 Bant' : 'ITU-R BS.1770-4 · EBU 3342 · 7-Band'}
                </div>
              </div>

              <div className={styles.meterRow}>
                <div className={styles.meterBox}>
                  <span className={styles.meterLabel}>LUFS-I</span>
                  <span className={styles.meterValue}>-14.1 LUFS</span>
                  <div className={styles.meterBarOuter}>
                    <div className={styles.meterBarFill} style={{ width: '72%' }} />
                  </div>
                </div>
                <div className={styles.meterBox}>
                  <span className={styles.meterLabel}>True Peak</span>
                  <span className={styles.meterValue}>-1.02 dBTP</span>
                  <div className={styles.meterBarOuter}>
                    <div className={styles.meterBarFill} style={{ width: '85%' }} />
                  </div>
                </div>
                <div className={styles.meterBox}>
                  <span className={styles.meterLabel}>LRA (EBU 3342)</span>
                  <span className={styles.meterValue}>6.8 LU</span>
                  <div className={styles.meterBarOuter}>
                    <div className={styles.meterBarFill} style={{ width: '58%' }} />
                  </div>
                </div>
                <div className={styles.meterBox}>
                  <span className={styles.meterLabel}>
                    {isTr ? 'Crest / Korelasyon' : 'Crest / Correlation'}
                  </span>
                  <span className={styles.meterValue}>9.4 dB · +0.86</span>
                  <div className={styles.meterBarOuter}>
                    <div className={styles.meterBarFill} style={{ width: '64%' }} />
                  </div>
                </div>
              </div>

              <div className={styles.channelRack}>
                <div className={styles.channelRackHeader}>
                  <span>{isTr ? 'Mikser Insert Hedefleri (fl_mix)' : 'Mixer Insert Targets (fl_mix)'}</span>
                  <span>{isTr ? 'Kalibreli Seviye' : 'Calibrated Level'}</span>
                </div>
                {[
                  { name: 'Insert 1 · Kick', level: '-4.2 dB', bar: '82%' },
                  { name: 'Insert 2 · Snare / Clap', level: '-6.0 dB', bar: '74%' },
                  { name: 'Insert 3 · Sub / 808', level: '-3.1 dB', bar: '86%' },
                  { name: 'Insert 4 · Chord / Pad Bus', level: '-11.4 dB', bar: '55%' },
                  { name: 'Master · Limiter Gain', level: '-1.0 dBTP', bar: '95%' },
                ].map((channel, i) => (
                  <div key={i} className={styles.channelRow}>
                    <span className={styles.channelName}>{channel.name}</span>
                    <div className={styles.meterBarOuter} style={{ margin: 0 }}>
                      <div className={styles.meterBarFill} style={{ width: channel.bar }} />
                    </div>
                    <span className={styles.channelLevel}>{channel.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: 14 Flat-Schema Tools + Opt-in fl_desk */}
        <section className={world.section} aria-labelledby="flmcp-tools-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-tools-heading">{P?.features.tools.title || '14 Flat-Schema Tools'}</h2>
            <p>{P?.features.tools.description}</p>
            <p className={world.hint} style={{ marginTop: '12px' }}>
              {P?.features.tools.schemaNote}
            </p>
          </div>
          <div className={world.sectionBody}>
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
          </div>
        </section>

        {/* Section 5: 12-Genre Seeded Production Engine */}
        <section className={world.section} aria-labelledby="flmcp-genres-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-genres-heading">{P?.features.genreEngine.title || '12-Genre Production Engine'}</h2>
            <p>{P?.features.genreEngine.description}</p>
          </div>
          <div className={world.sectionBody}>
            <div className={styles.genreGrid}>
              {GENRES.map((g, idx) => (
                <button
                  key={g.name.en}
                  type="button"
                  className={styles.genreCard}
                  data-active={activeGenreIndex === idx}
                  onClick={() => setActiveGenreIndex(idx)}
                >
                  <div className={styles.genreCardTop}>
                    <h3 className={styles.genreTitle}>{isTr ? g.name.tr : g.name.en}</h3>
                    <span className={styles.genreBpm}>{g.bpm}</span>
                  </div>
                  <p className={styles.genreDesc}>{isTr ? g.description.tr : g.description.en}</p>
                </button>
              ))}
            </div>

            <div className={styles.genreInspector}>
              <div className={styles.genreInspectorHeader}>
                <span className={styles.genreInspectorTitle}>
                  {isTr ? activeGenre.name.tr : activeGenre.name.en}
                </span>
                <span className={styles.genreInspectorMeta}>
                  {isTr ? 'Tempo' : 'Tempo'}: {activeGenre.bpm}
                </span>
                <span className={styles.genreInspectorMeta}>
                  {isTr ? 'Gam' : 'Scale'}: {isTr ? activeGenre.scale.tr : activeGenre.scale.en}
                </span>
              </div>
              <p className={styles.genreInspectorBody}>
                <strong>{isTr ? 'Ritim ve Yazım Profili:' : 'Groove & Output Profile:'}</strong>{' '}
                {isTr ? activeGenre.groove.tr : activeGenre.groove.en}
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Plugin Parameter Solver in Real Units */}
        <section className={world.section} aria-labelledby="flmcp-plugins-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-plugins-heading">{P?.features.pluginSolver.title || 'Plugin Parameter Solver'}</h2>
            <p>{P?.features.pluginSolver.description}</p>
          </div>
          <div className={world.sectionBody}>
            <div className={styles.pluginComparison}>
              <div className={`${styles.pluginRow} ${styles.pluginRowHeader}`}>
                <span>{isTr ? 'Eklenti / Hedef' : 'Plugin Target'}</span>
                <span>{isTr ? 'Ham DAW Parametresi (0.0-1.0)' : 'Raw DAW Float (0.0-1.0)'}</span>
                <span>{isTr ? 'fl_param Gerçek Birim Çıktısı' : 'fl_param Real Unit Output'}</span>
              </div>
              {PLUGIN_SOLVER_EXAMPLES.map((ex, idx) => (
                <div key={idx} className={styles.pluginRow}>
                  <span style={{ color: 'var(--ink)' }}>{ex.plugin}</span>
                  <span className={styles.pluginValueOld}>{ex.raw}</span>
                  <span className={styles.pluginValueNew}>{ex.solved}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 7: Transparency Box — Scripting API Limits & 5-Layer Resolution Ladder */}
        <section id="architecture-transparency" className={world.section} aria-labelledby="flmcp-transparency-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-transparency-heading">{P?.transparency.title || 'Architecture Transparency'}</h2>
            <p>{P?.transparency.subtitle}</p>
          </div>
          <div className={world.sectionBody}>
            <div className={styles.transparencyBox}>
              <p className={world.interpretation} style={{ fontSize: '1.05rem', marginBottom: '18px' }}>
                {P?.transparency.intro}
              </p>
              <h3 style={{ margin: '0 0 8px', fontSize: '0.96rem', fontFamily: 'var(--font-family-mono)', color: 'var(--muted)' }}>
                {P?.transparency.ladderTitle}
              </h3>
              <div className={styles.ladder}>
                {P?.transparency.layers.map((step, idx) => (
                  <div key={idx} className={styles.ladderStep}>
                    <div className={styles.ladderHead}>
                      <h4 className={styles.ladderTitle}>{step.layer}</h4>
                      <span className={styles.ladderScope}>{step.scope}</span>
                    </div>
                    <p className={styles.ladderHow}>{step.how}</p>
                    <p className={styles.ladderBoundary}>{step.boundary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: Licensing & Privacy Boundary (or Live Checkout Plans when configured) */}
        <section id="pricing" className={world.section} aria-labelledby="flmcp-pricing-heading">
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
                          <Check size={16} color="var(--accent)" />
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
                          <Check size={16} color="var(--accent)" />
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
                          <Check size={16} color="var(--accent)" />
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
                    <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--body)' }}>
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
                <p className={world.privacy}>{P?.commerceNotice.commercialNote}</p>
                <div className={world.actions}>
                  <a href={GITHUB_RELEASES} target="_blank" rel="noreferrer" className={world.primary} style={{ gap: '8px' }}>
                    <Download size={16} />
                    <span>{P?.hero.getStarted}</span>
                  </a>
                  <Link href="/dashboard/fl-mcp" className={world.link}>
                    {isTr ? 'Lisans Kasasını Aç' : 'Open License Vault'}
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Section 9: Technical FAQ Accordion */}
        <section className={world.section} aria-labelledby="flmcp-faq-heading">
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
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
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
