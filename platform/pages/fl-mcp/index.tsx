// FL-MCP: Autonomous AI Copilot for FL Studio 2025.
// Product showcase, studio architecture visuals, interactive 12-genre matrix,
// plugin parameter solver in real dB/Hz, closed-loop loudness analysis, and pricing.

import React, { useState } from 'react'
import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ChevronDown,
  ChevronUp,
  Check,
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

interface GenreSpec {
  name: { tr: string; en: string }
  bpm: number
  scale: { tr: string; en: string }
  groove: { tr: string; en: string }
  description: { tr: string; en: string }
}

const GENRES: GenreSpec[] = [
  {
    name: { tr: 'House ve Tech House', en: 'House & Tech House' },
    bpm: 126,
    scale: { tr: 'La Minör (A Minor)', en: 'A Minor' },
    groove: {
      tr: 'Dört dörtlük kick vuruşları ve 16lık swingli hi-hat yürüyüşü',
      en: 'Four-on-the-floor kick with swinging 16th hi-hats',
    },
    description: {
      tr: 'Senkoplu açık hi-hatler, sidechain pompalı org akorları ve sürükleyici sub-bas yürüyüşü.',
      en: 'Driving sub-bass groove with syncopated open hi-hats and sidechained organ chords.',
    },
  },
  {
    name: { tr: 'Techno (Peak-Time)', en: 'Techno (Peak-Time)' },
    bpm: 132,
    scale: { tr: 'Fa Minör (F Minor)', en: 'F Minor' },
    groove: {
      tr: 'Rumble sub-kick dokusu ve kesintisiz ride zil sürüşü',
      en: 'Rumble sub-kick with driving ride cymbals',
    },
    description: {
      tr: 'Monofonik yuvarlanan bas hatları, endüstriyel perküsyon vuruşları ve karanlık reverb kuyrukları.',
      en: 'Monophonic rolling basslines, industrial transient percussion, and dark reverb tails.',
    },
  },
  {
    name: { tr: 'Trap ve Drill', en: 'Trap & Drill' },
    bpm: 142,
    scale: { tr: 'Do# Minör (C# Minor)', en: 'C# Minor' },
    groove: {
      tr: 'Yarım zamanlı vuruş ve 32lik üçleme hi-hat ruloları',
      en: 'Half-time punch with rolling 32nd triplet hi-hats',
    },
    description: {
      tr: 'Perde kaymalı 808 glide baslar, doygun soft-clipper katmanı ve keskin rimshot geçişleri.',
      en: 'Sliding 808 glides with aggressive soft-clipper saturation and snapping rimshots.',
    },
  },
  {
    name: { tr: 'Lo-Fi Hip Hop', en: 'Lo-Fi Hip Hop' },
    bpm: 84,
    scale: { tr: 'Mi♭ Majör (Eb Major)', en: 'Eb Major' },
    groove: {
      tr: 'Kuantize edilmemiş doğal boom-bap ritmi ve plak dokusu',
      en: 'Swung unquantized boom-bap rhythm with vinyl dust',
    },
    description: {
      tr: 'Caz 9lu ve 11li akor seslendirmeleri, kaset dalgalanması ve sıcak Rhodes yürüyüşleri.',
      en: 'Jazzy minor 9th and 11th chords, tape wow and flutter, and mellow Rhodes progressions.',
    },
  },
  {
    name: { tr: 'Drum & Bass', en: 'Drum & Bass' },
    bpm: 174,
    scale: { tr: 'Mi Minör (E Minor)', en: 'E Minor' },
    groove: {
      tr: 'Amen break senkopları ve hayalet trampet dokunuşları',
      en: 'Amen break syncopations with ghost snares',
    },
    description: {
      tr: 'Modülasyonlu Reese baslar, 120 Hz cerrahi alt frekans ayrımı ve yüksek enerjili breakbeatler.',
      en: 'Modulated Reese basslines, surgical sub-crossover at 120 Hz, and blistering breakbeats.',
    },
  },
  {
    name: { tr: 'Oriental Trap (Hicaz)', en: 'Oriental Trap (Hicaz)' },
    bpm: 138,
    scale: { tr: 'Re Hicaz (Frigyen Dominant)', en: 'D Hicaz (Phrygian Dominant)' },
    groove: {
      tr: 'Modern 808 baslar üzerinde darbuka ve tef senkopları',
      en: 'Darbuka and tef syncopation over modern 808s',
    },
    description: {
      tr: 'Makamsal perde bükmeleri, otantik melodik yürüyüşler ve kayan alt bas katmanları.',
      en: 'Microtonal makam note bends, authentic melodic lines, and sliding sub-bass.',
    },
  },
  {
    name: { tr: 'Synthwave ve Darksynth', en: 'Synthwave & Darksynth' },
    bpm: 110,
    scale: { tr: 'Re Minör (D Minor)', en: 'D Minor' },
    groove: {
      tr: 'Gated reverb trampet vuruşları ve ritmik sidechain',
      en: 'Gated snare backbeat with pumping sidechain',
    },
    description: {
      tr: 'Analog testere dalga bas arpejleri, vintage Juno koro padleri ve parlak bakır leadler.',
      en: 'Analog saw bass arpeggios, vintage Juno chorus pads, and soaring brass leads.',
    },
  },
  {
    name: { tr: 'Ambient ve Sinematik', en: 'Ambient & Cinematic' },
    bpm: 72,
    scale: { tr: 'Si Minör (B Minor)', en: 'B Minor' },
    groove: {
      tr: 'Evrilen poliritmik dokular ve dinamik kreşendo dalgaları',
      en: 'Evolving polyrhythmic textures with swell pulses',
    },
    description: {
      tr: 'Granüler dron katmanları, derin shimmer yankıları ve orkestral yaylı yükselişleri.',
      en: 'Granular drone layers, infinite shimmer reverbs, and gentle orchestral swells.',
    },
  },
  {
    name: { tr: 'Cyberpunk Midtempo', en: 'Cyberpunk Midtempo' },
    bpm: 105,
    scale: { tr: 'Sol Minör (G Minor)', en: 'G Minor' },
    groove: {
      tr: 'Ağır bas vuruşları ve doygun alt-orta frekans darbeleri',
      en: 'Heavy stomping kick with saturated downbeats',
    },
    description: {
      tr: 'Wavefolder bas hırıltıları, metalik trampetler ve perde bükümlü vokoder akorları.',
      en: 'Aggressive wavefolded bass growls, metallic snares, and pitch-bent vocoder stabs.',
    },
  },
  {
    name: { tr: 'UK Garage ve 2-Step', en: 'UK Garage & 2-Step' },
    bpm: 134,
    scale: { tr: 'Fa# Minör (F# Minor)', en: 'F# Minor' },
    groove: {
      tr: 'Sekmeli shuffle ritmi ve gecikmeli offbeat trampetler',
      en: 'Skippy swung shuffle with delayed offbeat snares',
    },
    description: {
      tr: 'Derin oyuk sub-bas sekmeleri, kesik vokal örnekleri ve parlak shaker örgüleri.',
      en: 'Deep hollow sub-bounces, vocal chops, and crisp shaker grooves.',
    },
  },
  {
    name: { tr: 'Afrobeats', en: 'Afrobeats' },
    bpm: 102,
    scale: { tr: 'Sol Majör (G Major)', en: 'G Major' },
    groove: {
      tr: '3e karşı 2 poliritmik rimshot ve shaker yürüyüşü',
      en: 'Polyrhythmic 3-against-2 rimshots and shakers',
    },
    description: {
      tr: 'Senkoplu log drum vuruşları, sıcak elektro gitar arpejleri ve akılda kalıcı melodiler.',
      en: 'Syncopated log drums, warm electric guitar plucks, and catchy melodic hooks.',
    },
  },
  {
    name: { tr: 'Neo-Soul ve R&B', en: 'Neo-Soul & R&B' },
    bpm: 88,
    scale: { tr: 'La♭ Majör (Ab Major)', en: 'Ab Major' },
    groove: {
      tr: 'Ritim cebinin gerisinde akan doğal groove ve hayalet notalar',
      en: 'Behind-the-beat pocket groove with ghost notes',
    },
    description: {
      tr: 'Genişletilmiş akor seslendirmeleri, kadifemsi bas geçişleri ve sıcak armoniler.',
      en: 'Extended chord voicings, velvety bass fills, and silky vocal harmonies.',
    },
  },
]

const PLUGIN_SOLVER_EXAMPLES = [
  {
    plugin: 'FabFilter Pro-Q 3',
    raw: 'band1_freq = 0.432',
    solved: {
      tr: 'Kesim: 32 Hz, Q: 0.71 (18 dB/oktav HPF)',
      en: 'Cutoff: 32 Hz, Q: 0.71 (18 dB/oct HPF)',
    },
  },
  {
    plugin: 'FabFilter Pro-C 2',
    raw: 'thresh = 0.650, ratio = 0.380',
    solved: {
      tr: 'Eşik: -14.2 dB, Oran: 4.2:1',
      en: 'Threshold: -14.2 dB, Ratio: 4.2:1',
    },
  },
  {
    plugin: 'Xfer Serum',
    raw: 'osc_a_pos = 0.812, cutoff = 0.540',
    solved: {
      tr: 'Dalga: Resonant Saw, Kesim: 2.4 kHz',
      en: 'Wavetable: Resonant Saw, Cutoff: 2.4 kHz',
    },
  },
  {
    plugin: 'Image-Line FLEX',
    raw: 'macro1 = 0.700, macro2 = 0.450',
    solved: {
      tr: 'Sıcaklık: +4.2 dB, Yankı Karışımı: %35',
      en: 'Warmth: +4.2 dB, Reverb Mix: 35%',
    },
  },
  {
    plugin: 'iZotope Ozone 11',
    raw: 'ceiling = 0.940, target = 0.720',
    solved: {
      tr: 'Tepe Tavanı: -1.0 dBTP, Hedef: -14.0 LUFS',
      en: 'True Peak: -1.0 dBTP, Target: -14.0 LUFS',
    },
  },
]

const FlMcpShowcasePage: NextPage = () => {
  const { t, language } = useLanguage()
  const isTr = language === 'tr'
  const [activeGenreIndex, setActiveGenreIndex] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  if (!ENTRY) {
    return null
  }

  const item = resolveProduct(ENTRY, t)
  const P = (t as unknown as { flMcpPage?: typeof import('@/locales/en.json')['flMcpPage'] }).flMcpPage
  const activeGenre = GENRES[activeGenreIndex]

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

  const splitSpecItem = (text: string) => {
    const idx = text.indexOf('(')
    if (idx > 0 && text.endsWith(')')) {
      return {
        term: text.slice(0, idx).trim(),
        detail: text.slice(idx + 1, -1).trim(),
      }
    }
    return { term: text, detail: '' }
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
        {/* Section 1: Studio Architecture & Live Telemetry */}
        <section className={world.section} aria-labelledby="flmcp-console-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-console-heading">{P?.features.flIntegration.title || 'FL Studio 2025 Bridge'}</h2>
            <p>
              {P?.features.subtitle ||
                (isTr
                  ? 'Claude Desktop, loopMIDI ve FL Studio 2025 arasında sıfır bulut gecikmeli donanım bağlantısı.'
                  : 'Real-time hardware link between Claude Desktop, loopMIDI, and FL Studio 2025.')}
            </p>
            <div className={world.actions}>
              <Link href="/dashboard/fl-mcp" className={world.primary} style={{ gap: '8px' }}>
                <span>{P?.hero.getStarted || (isTr ? 'Başlayın' : 'Get Started')}</span>
                <ArrowRight size={16} />
              </Link>
              <a href="#pricing" className={world.link}>
                {P?.pricing.title || (isTr ? 'Paketleri İncele' : 'View Plans')}
              </a>
            </div>
          </div>

          <div className={world.sectionBody}>
            {/* Studio Visual Gallery */}
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
                    ? 'loopMIDI ve Python API 40 üzerinden mikser, kanal rafı ve piyano rulosu kontrolü.'
                    : 'Direct mixer, channel rack, and piano roll control over loopMIDI and Python API 40.'}
                </figcaption>
              </figure>

              <figure className={styles.shot}>
                <Image
                  src="/images/fl-mcp/acoustic-metering.webp"
                  alt={
                    isTr
                      ? 'ITU-R BS.1770-4 LUFS ses yüksekliği ve True Peak spektral analiz ekranı'
                      : 'ITU-R BS.1770-4 LUFS loudness and True Peak spectral metering display'
                  }
                  width={1440}
                  height={900}
                  sizes="(max-width: 860px) 100vw, 400px"
                  priority
                />
                <figcaption>
                  {isTr
                    ? 'Gerçek dB ve Hz birimleriyle parametrik EQ çözümü ve yayın standardında LUFS ölçümü.'
                    : 'Parametric EQ solving in real dB and Hz units with broadcast-grade LUFS metering.'}
                </figcaption>
              </figure>
            </div>

            {/* Interactive DAW Console Telemetry */}
            <div className={styles.dawConsole}>
              <div className={styles.dawHeader}>
                <div className={styles.dawStatus}>
                  <span className={styles.statusDot} />
                  <span>
                    {isTr
                      ? 'FL Studio 2025 Motoru Bağlı (loopMIDI Port 1 · API 40)'
                      : 'FL Studio 2025 Engine Connected (loopMIDI Port 1 · API 40)'}
                  </span>
                </div>
                <div className={styles.dawLatency}>
                  {isTr ? 'Gecikme: 1.8 ms · Yerel Köprü' : 'Latency: 1.8 ms · Local Bridge'}
                </div>
              </div>

              <div className={styles.meterRow}>
                <div className={styles.meterBox}>
                  <span className={styles.meterLabel}>
                    {isTr ? 'Entegre Ses Yüksekliği' : 'Integrated Loudness'}
                  </span>
                  <span className={styles.meterValue}>-14.1 LUFS</span>
                  <div className={styles.meterBarOuter}>
                    <div className={styles.meterBarFill} style={{ width: '72%' }} />
                  </div>
                </div>
                <div className={styles.meterBox}>
                  <span className={styles.meterLabel}>
                    {isTr ? 'True Peak Tavanı' : 'True Peak Max'}
                  </span>
                  <span className={styles.meterValue}>-1.02 dBTP</span>
                  <div className={styles.meterBarOuter}>
                    <div className={styles.meterBarFill} style={{ width: '85%' }} />
                  </div>
                </div>
                <div className={styles.meterBox}>
                  <span className={styles.meterLabel}>
                    {isTr ? 'Dinamik Aralık' : 'Dynamic Spread'}
                  </span>
                  <span className={styles.meterValue}>9.4 LU</span>
                  <div className={styles.meterBarOuter}>
                    <div className={styles.meterBarFill} style={{ width: '60%' }} />
                  </div>
                </div>
                <div className={styles.meterBox}>
                  <span className={styles.meterLabel}>
                    {isTr ? 'Alt Bas Kesimi' : 'Sub Crossover'}
                  </span>
                  <span className={styles.meterValue}>32 Hz Mono</span>
                  <div className={styles.meterBarOuter}>
                    <div className={styles.meterBarFill} style={{ width: '45%' }} />
                  </div>
                </div>
              </div>

              <div className={styles.channelRack}>
                <div className={styles.channelRackHeader}>
                  <span>{isTr ? 'Aktif Mikser Kanalları' : 'Active Mixer Channels'}</span>
                  <span>{isTr ? 'Çıkış Seviyesi' : 'Output Level'}</span>
                </div>
                {[
                  {
                    name: isTr ? 'Kick (909 / Alt Odak)' : 'Kick (909 / Sub Focus)',
                    level: '-4.2 dB',
                    bar: '82%',
                  },
                  {
                    name: isTr ? 'Trampet ve Alkış Katmanı' : 'Snare & Clap Layer',
                    level: '-6.0 dB',
                    bar: '74%',
                  },
                  {
                    name: isTr ? 'Hi-Hat (16lık Swing)' : 'Hi-Hats (16th Swung)',
                    level: '-12.4 dB',
                    bar: '52%',
                  },
                  {
                    name: isTr ? '808 Alt Bas (Glide)' : '808 Sub Bass (Glide)',
                    level: '-3.1 dB',
                    bar: '86%',
                  },
                  {
                    name: isTr ? 'FLEX Sentetik Lead' : 'FLEX Synth Lead',
                    level: '-8.5 dB',
                    bar: '65%',
                  },
                  {
                    name: isTr ? 'Ozone Master Limiter' : 'Ozone Master Limiter',
                    level: '-1.0 dBTP',
                    bar: '95%',
                  },
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

        {/* Section 2: 12-Genre Production Engine */}
        <section className={world.section} aria-labelledby="flmcp-genres-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-genres-heading">
              {P?.features.genreEngine.title || '12-Genre Production Engine'}
            </h2>
            <p>
              {P?.features.genreEngine.description ||
                'Generate complete multi-track arrangements with drums, basslines, chords, and melodies.'}
            </p>
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
                    <span className={styles.genreBpm}>{g.bpm} BPM</span>
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
                  {isTr ? 'Tempo' : 'Tempo'}: {activeGenre.bpm} BPM
                </span>
                <span className={styles.genreInspectorMeta}>
                  {isTr ? 'Gam' : 'Scale'}: {isTr ? activeGenre.scale.tr : activeGenre.scale.en}
                </span>
              </div>
              <p className={styles.genreInspectorBody}>
                <strong>{isTr ? 'Ritim Örgüsü:' : 'Groove Profile:'}</strong>{' '}
                {isTr ? activeGenre.groove.tr : activeGenre.groove.en}
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Plugin Parameter Solver in Real dB & Hz */}
        <section className={world.section} aria-labelledby="flmcp-plugins-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-plugins-heading">
              {P?.features.pluginSolver.title || 'Plugin Parameter Solver'}
            </h2>
            <p>
              {P?.features.pluginSolver.description ||
                'Claude computes and sets exact musical values for stock and third-party VSTs in real units.'}
            </p>
          </div>
          <div className={world.sectionBody}>
            <div className={styles.pluginComparison}>
              <div className={`${styles.pluginRow} ${styles.pluginRowHeader}`}>
                <span>{isTr ? 'Hedef Eklenti' : 'Target Plugin'}</span>
                <span>{isTr ? 'Ham DAW Değeri (0.0 - 1.0)' : 'Raw DAW Float (0.0 - 1.0)'}</span>
                <span>{isTr ? 'Çözülen Müzikal Değer (dB / Hz)' : 'Solved Audio Value (dB / Hz)'}</span>
              </div>
              {PLUGIN_SOLVER_EXAMPLES.map((ex, idx) => (
                <div key={idx} className={styles.pluginRow}>
                  <span style={{ color: 'var(--ink)' }}>{ex.plugin}</span>
                  <span className={styles.pluginValueOld}>{ex.raw}</span>
                  <span className={styles.pluginValueNew}>
                    {isTr ? ex.solved.tr : ex.solved.en}
                  </span>
                </div>
              ))}
            </div>

            {P?.features.pluginSolver.items && (
              <dl className={world.margins}>
                {P.features.pluginSolver.items.map((rawItem: string, idx: number) => {
                  const { term, detail } = splitSpecItem(rawItem)
                  return (
                    <div key={idx}>
                      <dt>{term}</dt>
                      <dd>{detail}</dd>
                    </div>
                  )
                })}
              </dl>
            )}
          </div>
        </section>

        {/* Section 4: Closed-Loop Audio Analysis & Host Integration */}
        <section className={world.section} aria-labelledby="flmcp-analysis-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-analysis-heading">
              {P?.features.audioAnalysis.title || 'Closed-Loop Audio Analysis'}
            </h2>
            <p>
              {P?.features.audioAnalysis.description ||
                'Objective broadcast-standard loudness measurements and frequency spectrum monitoring.'}
            </p>
          </div>
          <div className={world.sectionBody}>
            <p className={world.interpretation}>
              {isTr
                ? 'Tüm ses analizi, ITU-R BS.1770-4 LUFS ölçümü ve MIDI üretimi yüzde yüz yerel olarak kendi işlemcinizde çalışır. Hiçbir ses dosyası dış sunuculara gönderilmez.'
                : 'All audio rendering, ITU-R BS.1770-4 LUFS metering, and MIDI playback execute locally on your CPU. No audio ever leaves your machine.'}
            </p>

            <dl className={world.margins}>
              {[
                ...(P?.features.audioAnalysis.items || []),
                ...(P?.features.flIntegration.items || []),
              ].map((rawItem: string, idx: number) => {
                const { term, detail } = splitSpecItem(rawItem)
                return (
                  <div key={idx}>
                    <dt>{term}</dt>
                    <dd>{detail}</dd>
                  </div>
                )
              })}
            </dl>
          </div>
        </section>

        {/* Section 5: Pricing & Tier Cards */}
        <section id="pricing" className={world.section} aria-labelledby="flmcp-pricing-heading">
          <div className={world.sectionHead}>
            <h2 id="flmcp-pricing-heading">
              {P?.pricing.title || 'Transparent Production Plans'}
            </h2>
            <p>
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
                <Link
                  href="/dashboard/fl-mcp"
                  className={world.link}
                  style={{ alignSelf: 'flex-start' }}
                >
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
                <Link
                  href={checkoutUrl('pro') || '/dashboard/fl-mcp'}
                  className={world.primary}
                >
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
                <Link
                  href={checkoutUrl('studio') || '/dashboard/fl-mcp'}
                  className={world.link}
                  style={{ alignSelf: 'flex-start' }}
                >
                  {P?.pricing.studio.cta || 'Get Studio Edition'}
                </Link>
              </div>
            </div>

            {/* Top-up pack note */}
            <div className={styles.topupBanner}>
              <div>
                <strong style={{ color: 'var(--ink)' }}>
                  {P?.pricing.pack100.name || '100 Credit Top-Up Pack'} ({P?.pricing.pack100.price || '$10'})
                </strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--body)' }}>
                  {P?.pricing.pack100.description}
                </p>
              </div>
              <Link href={checkoutUrl('pack100') || '/dashboard/fl-mcp'} className={world.link}>
                {P?.pricing.pack100.cta || 'Add 100 Credits'}
              </Link>
            </div>
          </div>
        </section>

        {/* Section 6: Comprehensive FAQ Accordion */}
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
