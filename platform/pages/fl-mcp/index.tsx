// FL-MCP: Autonomous AI Copilot for FL Studio 2025.
// Product showcase, interactive feature matrix, pricing tiers, and audio analysis visualizer.

import React, { useState } from 'react'
import type { NextPage } from 'next'
import Link from 'next/link'
import {
  SlidersHorizontal,
  Sparkles,
  Music,
  Sliders,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  Check,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Laptop,
  Terminal,
} from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { WorldPage } from '@/components/UI/WorldPage'
import { PRODUCT_CATALOG, resolveProduct } from '@/config/product-catalog'
import { worldName } from '@/config/showroom-worlds'
import { useLanguage } from '@/context/LanguageContext'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/fl-mcp.module.css'

const ENTRY = PRODUCT_CATALOG.find(entry => entry.id === 'fl-mcp')

interface GenreSpec {
  name: string
  bpm: number
  scale: string
  groove: string
  description: string
}

const GENRES: GenreSpec[] = [
  { name: 'House & Tech House', bpm: 126, scale: 'A Minor', groove: 'Four-on-the-floor kick with swinging 16th hats', description: 'Driving sub-bass groove with syncopated open hi-hats and sidechained organ chords.' },
  { name: 'Techno (Peak-Time)', bpm: 132, scale: 'F Minor', groove: 'Rumble sub-kick with driving ride cymbals', description: 'Monophonic rolling basslines, industrial transient percussion, and dark reverb tails.' },
  { name: 'Trap & Drill', bpm: 142, scale: 'C# Minor', groove: 'Half-time punch with rolling 32nd triplet hi-hats', description: 'Sliding 808 glides with aggressive soft-clipper saturation and snapping rimshots.' },
  { name: 'Lo-Fi Hip Hop', bpm: 84, scale: 'Eb Major', groove: 'Swung unquantized boom-bap rhythm with vinyl dust', description: 'Jazzy minor 9th and 11th chords, tape wow and flutter, and mellow rhodes progressions.' },
  { name: 'Drum & Bass', bpm: 174, scale: 'E Minor', groove: 'Amen break syncopations with ghost snares', description: 'Modulated Reese basslines, surgical sub-crossover at 120 Hz, and blistering breakbeats.' },
  { name: 'Oriental Trap (Hicaz)', bpm: 138, scale: 'D Hicaz (Phrygian Dominant)', groove: 'Darbuka and tef syncopation over modern 808s', description: 'Microtonal makam note bends, authentic quarter-tone melodic lines, and sliding sub-bass.' },
  { name: 'Synthwave & Darksynth', bpm: 110, scale: 'D Minor', groove: 'Gated snare backbeat with pumping sidechain', description: 'Analog saw bass arpeggios, vintage Juno chorus pads, and soaring brass leads.' },
  { name: 'Ambient & Cinematic', bpm: 72, scale: 'B Minor', groove: 'Evolving polyrhythmic textures with swell pulses', description: 'Granular drone layers, infinite shimmer reverbs, and gentle orchestral brass swells.' },
  { name: 'Cyberpunk Midtempo', bpm: 105, scale: 'G Minor', groove: 'Heavy stomping kick with distorted downbeats', description: 'Aggressive wavefolded bass growls, metallic snares, and pitch-bent vocoder stabs.' },
  { name: 'UK Garage & 2-Step', bpm: 134, scale: 'F# Minor', groove: 'Skippy swung shuffle with delayed offbeat snares', description: 'Deep hollow sub-bounces, vocal chops, and crisp shaker grooves.' },
  { name: 'Afrobeats', bpm: 102, scale: 'G Major', groove: 'Polyrhythmic 3-against-2 rimshots and shakers', description: 'Syncopated log drums, warm electric guitar plucks, and catchy melodic hooks.' },
  { name: 'Neo-Soul & R&B', bpm: 88, scale: 'Ab Major', groove: 'Behind-the-beat pocket groove with ghost notes', description: 'Extended chord voicings, velvety bass fills, and silky vocal harmonies.' },
]

const PLUGIN_SOLVER_EXAMPLES = [
  { plugin: 'FabFilter Pro-Q 3', raw: 'band1_freq = 0.432', solved: 'Cutoff: 32 Hz, Q: 0.71 (18 dB/oct HPF)' },
  { plugin: 'FabFilter Pro-C 2', raw: 'thresh = 0.650, ratio = 0.380', solved: 'Threshold: -14.2 dB, Ratio: 4.2:1' },
  { plugin: 'Xfer Serum', raw: 'osc_a_pos = 0.812, cutoff = 0.540', solved: 'Wavetable: Resonant Saw, Cutoff: 2.4 kHz' },
  { plugin: 'Image-Line FLEX', raw: 'macro1 = 0.700, macro2 = 0.450', solved: 'Warmth: +4.2 dB, Reverb Mix: 35%' },
  { plugin: 'iZotope Ozone 11', raw: 'ceiling = 0.940, target = 0.720', solved: 'True Peak: -1.0 dBTP, Target: -14.0 LUFS' },
]

const FlMcpShowcasePage: NextPage = () => {
  const { t } = useLanguage()
  const [activeGenreIndex, setActiveGenreIndex] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  if (!ENTRY) {
    return null
  }

  const item = resolveProduct(ENTRY, t)
  const P = (t as unknown as { flMcpPage?: typeof import('@/locales/en.json')['flMcpPage'] }).flMcpPage
  const activeGenre = GENRES[activeGenreIndex]

  // Structured Data schemas for SoftwareApplication and Product
  const softwareSchema = {
    '@type': 'SoftwareApplication',
    '@id': 'https://hasan-arthur-altuntas.xyz/fl-mcp#software',
    name: 'FL-MCP: FL Studio AI Copilot',
    description: item.description,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Windows 10, Windows 11, macOS',
    url: 'https://hasan-arthur-altuntas.xyz/fl-mcp',
    sameAs: ['https://github.com/Rtur2003/FL-MCP'],
    softwareVersion: '2025.1',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '128',
    },
    offers: [
      { '@type': 'Offer', name: 'Community Tier', price: '0', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'Pro Producer', price: '19', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'Studio Edition', price: '49', priceCurrency: 'USD' },
    ],
  }

  const productSchema = {
    '@type': 'Product',
    '@id': 'https://hasan-arthur-altuntas.xyz/fl-mcp#product',
    name: 'FL-MCP FL Studio AI Copilot',
    description: item.description,
    brand: { '@type': 'Brand', name: 'CrownCode' },
    category: 'Digital Audio Workstation AI Plugin',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '0',
      highPrice: '49',
      offerCount: '3',
    },
  }

  return (
    <MainLayout
      title={P?.meta.title || item.title}
      description={P?.meta.description || item.description}
      {...(P?.meta.keywords ? { keywords: P.meta.keywords } : {})}
      schema={[softwareSchema, productSchema]}
    >
      <WorldPage
        world="fl-mcp"
        title={worldName(ENTRY, item.title)}
        lead={P?.hero.subtitle || item.showroomDescription}
        {...(P?.hero.liveDemoBadge ? { meta: P.hero.liveDemoBadge } : {})}
      >
        {/* Interactive DAW Console Visualizer */}
        <section className={world.section} aria-labelledby="flmcp-console-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-console-heading">{P?.hero.badge || 'DAW Host Bridge'}</h2>
            <p className={world.reading}>
              Real-time hardware link between Claude Desktop, loopMIDI, and FL Studio 2025.
            </p>
            <div style={{ marginTop: '20px' }}>
              <Link href="/dashboard/fl-mcp" className={world.primary}>
                {P?.hero.getStarted || 'Get Started (Instant Access)'}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className={world.sectionBody}>
            <div className={styles.dawConsole}>
              <div className={styles.dawHeader}>
                <div className={styles.dawStatus}>
                  <span className={styles.statusDot} />
                  <span>FL Studio 2025 Engine Connected (loopMIDI Port 1, API 40)</span>
                </div>
                <div style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.82rem', color: 'var(--muted)' }}>
                  Latency: 1.8ms · Host: Localhost
                </div>
              </div>

              {/* Loudness Meters & Audio Specs */}
              <div className={styles.meterRow}>
                <div className={styles.meterBox}>
                  <span className={styles.meterLabel}>Integrated Loudness</span>
                  <span className={styles.meterValue}>-14.1 LUFS</span>
                  <div className={styles.meterBarOuter}>
                    <div className={styles.meterBarFill} style={{ width: '72%' }} />
                  </div>
                </div>
                <div className={styles.meterBox}>
                  <span className={styles.meterLabel}>True Peak Max</span>
                  <span className={styles.meterValue}>-1.02 dBTP</span>
                  <div className={styles.meterBarOuter}>
                    <div className={styles.meterBarFill} style={{ width: '85%' }} />
                  </div>
                </div>
                <div className={styles.meterBox}>
                  <span className={styles.meterLabel}>Dynamic Spread</span>
                  <span className={styles.meterValue}>9.4 LU</span>
                  <div className={styles.meterBarOuter}>
                    <div className={styles.meterBarFill} style={{ width: '60%' }} />
                  </div>
                </div>
                <div className={styles.meterBox}>
                  <span className={styles.meterLabel}>Sub Crossover</span>
                  <span className={styles.meterValue}>32 Hz Mono</span>
                  <div className={styles.meterBarOuter}>
                    <div className={styles.meterBarFill} style={{ width: '45%' }} />
                  </div>
                </div>
              </div>

              {/* Active Channel Stems */}
              <div style={{ background: '#000', padding: '14px 16px', borderRadius: '3px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontFamily: 'var(--font-family-mono)', fontSize: '0.78rem', color: 'var(--muted)' }}>
                  <span>Track Channels</span>
                  <span>Mixer Level & Pan</span>
                </div>
                {[
                  { name: 'Kick (909 / Sub Focus)', level: '-4.2 dB', pan: 'C', bar: '82%' },
                  { name: 'Snare & Clap Layer', level: '-6.0 dB', pan: 'C', bar: '74%' },
                  { name: 'Hi-Hats (16th Swung)', level: '-12.4 dB', pan: '24% R', bar: '52%' },
                  { name: '808 Sub Bass (Glide)', level: '-3.1 dB', pan: 'C', bar: '86%' },
                  { name: 'FLEX Synth Lead', level: '-8.5 dB', pan: '15% L', bar: '65%' },
                  { name: 'Ozone Master Limiter', level: '-1.0 dBTP', pan: 'C', bar: '95%' },
                ].map((channel, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 90px', gap: '12px', alignItems: 'center', padding: '6px 0', borderTop: i > 0 ? '1px solid #141218' : 'none', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--ink)' }}>{channel.name}</span>
                    <div className={styles.meterBarOuter} style={{ margin: 0, height: '4px' }}>
                      <div className={styles.meterBarFill} style={{ width: channel.bar }} />
                    </div>
                    <span style={{ textAlign: 'right', fontFamily: 'var(--font-family-mono)', fontSize: '0.8rem', color: 'var(--accent)' }}>
                      {channel.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feature 1: 12-Genre Production Engine */}
        <section className={world.section} aria-labelledby="flmcp-genres-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-genres-heading">{P?.features.genreEngine.title || '12-Genre Production Engine'}</h2>
            <p className={world.reading}>
              {P?.features.genreEngine.description ||
                'Generate complete multi-track arrangements with drums, basslines, chords, and melodies.'}
            </p>
          </div>
          <div className={world.sectionBody}>
            <div className={styles.genreGrid}>
              {GENRES.map((g, idx) => (
                <button
                  key={g.name}
                  type="button"
                  className={styles.genreCard}
                  data-active={activeGenreIndex === idx}
                  onClick={() => setActiveGenreIndex(idx)}
                >
                  <h3 className={styles.genreTitle}>{g.name}</h3>
                  <p className={styles.genreDesc}>{g.description}</p>
                </button>
              ))}
            </div>

            {/* Selected Genre Detail Inspector */}
            <div style={{ marginTop: '20px', padding: '18px 20px', background: 'color-mix(in srgb, #000 70%, transparent)', border: '1px solid var(--line)', borderRadius: '3px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 500, fontSize: '1.05rem' }}>{activeGenre.name} Specification</span>
                <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.85rem', color: 'var(--muted)' }}>Tempo: {activeGenre.bpm} BPM</span>
                <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.85rem', color: 'var(--muted)' }}>Key: {activeGenre.scale}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--body)' }}>
                <strong>Groove Profile:</strong> {activeGenre.groove}
              </p>
            </div>
          </div>
        </section>

        {/* Feature 2: Plugin Parameter Solver in Real dB & Hz */}
        <section className={world.section} aria-labelledby="flmcp-plugins-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-plugins-heading">{P?.features.pluginSolver.title || 'Plugin Parameter Solver'}</h2>
            <p className={world.reading}>
              {P?.features.pluginSolver.description ||
                'Claude computes and sets exact musical values for stock and third-party VSTs in real units.'}
            </p>
          </div>
          <div className={world.sectionBody}>
            <div className={styles.pluginComparison}>
              <div className={`${styles.pluginRow} ${styles.pluginRowHeader}`}>
                <span>Plugin Target</span>
                <span>Raw DAW Float (0.0 to 1.0)</span>
                <span>Solved Audio Value (dB / Hz / Q)</span>
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

        {/* Feature 3: Closed-Loop Audio Analysis & Host Integration */}
        <section className={world.section} aria-labelledby="flmcp-analysis-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-analysis-heading">{P?.features.audioAnalysis.title || 'Closed-Loop Audio Analysis'}</h2>
            <p className={world.reading}>
              {P?.features.audioAnalysis.description ||
                'Objective broadcast-standard loudness measurements and frequency spectrum monitoring.'}
            </p>
          </div>
          <div className={world.sectionBody}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '18px', background: 'color-mix(in srgb, #000 60%, transparent)', border: '1px solid var(--line)', borderRadius: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent)' }}>
                  <Activity size={18} />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--ink)' }}>BS.1770-4 LUFS Targets</h3>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--body)', lineHeight: 1.5 }}>
                  Continuous integrated, short-term, and momentary loudness measurement matching Spotify (-14 LUFS) and Apple Music (-16 LUFS) targets.
                </p>
              </div>

              <div style={{ padding: '18px', background: 'color-mix(in srgb, #000 60%, transparent)', border: '1px solid var(--line)', borderRadius: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent)' }}>
                  <Sliders size={18} />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--ink)' }}>True Peak DAC Safeguard</h3>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--body)', lineHeight: 1.5 }}>
                  4x oversampled intersample peak metering to guarantee zero clipping distortion across analog playback converters.
                </p>
              </div>

              <div style={{ padding: '18px', background: 'color-mix(in srgb, #000 60%, transparent)', border: '1px solid var(--line)', borderRadius: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent)' }}>
                  <Layers size={18} />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--ink)' }}>Piano Roll Script Bridge</h3>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--body)', lineHeight: 1.5 }}>
                  Procedural note generation, humanization velocity shifts, and strum timing directly written into FL Studio score files.
                </p>
              </div>

              <div style={{ padding: '18px', background: 'color-mix(in srgb, #000 60%, transparent)', border: '1px solid var(--line)', borderRadius: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent)' }}>
                  <ShieldCheck size={18} />
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--ink)' }}>100% Local Audio Privacy</h3>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--body)', lineHeight: 1.5 }}>
                  Audio never touches an external server. The entire analysis and DSP pipeline executes on your CPU in native Python and C++.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing & Tier Cards */}
        <section id="pricing" className={world.section} aria-labelledby="flmcp-pricing-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-pricing-heading">{P?.pricing.title || 'Transparent Production Plans'}</h2>
            <p className={world.reading}>
              {P?.pricing.subtitle ||
                'Basic transport, mixer fader moves, and local parameter adjustments cost zero credits and run offline forever.'}
            </p>
          </div>
          <div className={world.sectionBody}>
            <div className={styles.pricingGrid}>
              {/* Community Tier */}
              <div className={styles.pricingCard}>
                <h3 className={styles.tierName}>{P?.pricing.free.name || 'Community Tier'}</h3>
                <div className={styles.tierPriceBox}>
                  <span className={styles.tierPrice}>{P?.pricing.free.price || '$0'}</span>
                  <span className={styles.tierPeriod}>{P?.pricing.free.period || 'Forever Free'}</span>
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
                <Link href="/dashboard/fl-mcp" className={world.secondary || world.link} style={{ textAlign: 'center', display: 'block', padding: '10px 0' }}>
                  {P?.pricing.free.cta || 'Download Free Version'}
                </Link>
              </div>

              {/* Pro Producer (Featured) */}
              <div className={styles.pricingCard} data-featured="true">
                <span className={styles.pricingBadge}>{P?.pricing.pro.badge || 'Most Popular'}</span>
                <h3 className={styles.tierName}>{P?.pricing.pro.name || 'Pro Producer'}</h3>
                <div className={styles.tierPriceBox}>
                  <span className={styles.tierPrice}>{P?.pricing.pro.price || '$19'}</span>
                  <span className={styles.tierPeriod}>{P?.pricing.pro.period || '/ month'}</span>
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
                <Link href="/dashboard/fl-mcp" className={world.primary} style={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                  {P?.pricing.pro.cta || 'Get Pro Producer'}
                </Link>
              </div>

              {/* Studio Edition */}
              <div className={styles.pricingCard}>
                <h3 className={styles.tierName}>{P?.pricing.studio.name || 'Studio Edition'}</h3>
                <div className={styles.tierPriceBox}>
                  <span className={styles.tierPrice}>{P?.pricing.studio.price || '$49'}</span>
                  <span className={styles.tierPeriod}>{P?.pricing.studio.period || '/ month'}</span>
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
                <Link href="/dashboard/fl-mcp" className={world.secondary || world.link} style={{ textAlign: 'center', display: 'block', padding: '10px 0' }}>
                  {P?.pricing.studio.cta || 'Get Studio Edition'}
                </Link>
              </div>
            </div>

            {/* Top-up pack note */}
            <div style={{ marginTop: '20px', padding: '16px 20px', background: 'color-mix(in srgb, #000 60%, transparent)', border: '1px solid var(--line)', borderRadius: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <strong style={{ color: 'var(--ink)' }}>{P?.pricing.pack100.name || '100 Credit Top-Up Pack'} ($10)</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--body)' }}>{P?.pricing.pack100.description}</p>
              </div>
              <Link href="/dashboard/fl-mcp" className={world.link}>
                {P?.pricing.pack100.cta || 'Add 100 Credits'}
              </Link>
            </div>
          </div>
        </section>

        {/* Comprehensive FAQ Accordion */}
        <section className={world.section} aria-labelledby="flmcp-faq-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-faq-heading">{P?.faq.title || 'Frequently Asked Questions'}</h2>
            <p className={world.reading}>{P?.faq.subtitle}</p>
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
