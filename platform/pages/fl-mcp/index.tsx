// FL-MCP v0.3.0: Atmospheric obsidian-brass studio stage with curved glass panels,
// live animated signal path, playable 16-step Web Audio FL sequencer, and rounded popups.

import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, m as motion, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  ExternalLink,
  Heart,
  Maximize2,
  Play,
  Square,
} from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { Modal } from '@/components/UI/Modal'
import { PRODUCT_CATALOG, resolveProduct } from '@/config/product-catalog'
import { worldImage, worldLook, worldName } from '@/config/showroom-worlds'
import { localizedUrl, SPONSORS_URL } from '@/config/site'
import { useLanguage } from '@/context/LanguageContext'
import styles from '@/styles/pages/fl-mcp-stage.module.css'

const ENTRY = PRODUCT_CATALOG.find(entry => entry.id === 'fl-mcp')
const GITHUB_REPO = 'https://github.com/Rtur2003/FL-MCP'
const GITHUB_RELEASES = 'https://github.com/Rtur2003/FL-MCP/releases'

interface GenrePreset {
  name: { tr: string; en: string }
  bpmNum: number
  bpm: string
  scale: { tr: string; en: string }
  groove: { tr: string; en: string }
  description: { tr: string; en: string }
  notes: number[]
  kick: number[]
  snare: number[]
  hat: number[]
  synth: number[]
}

const GENRES: GenrePreset[] = [
  {
    name: { tr: 'House', en: 'House' },
    bpmNum: 126,
    bpm: '126 BPM',
    scale: { tr: 'La Minör (A Minor)', en: 'A Minor' },
    groove: { tr: 'Dört dörtlük kick ve 16lık offbeat açık hi-hat yürüyüşü', en: 'Four-on-the-floor kick with offbeat open hi-hat drive' },
    description: { tr: 'Senkoplu akor dizileri, kazanç kademeli alt bas ve piyano rulosu şablonu.', en: 'Syncopated chord progressions, sub-bass gain staging and sequenced groove.' },
    notes: [220, 261.63, 329.63, 392, 220],
    kick:  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hat:   [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
    synth: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
  },
  {
    name: { tr: 'Techno', en: 'Techno' },
    bpmNum: 132,
    bpm: '132 BPM',
    scale: { tr: 'Fa Minör (F Minor)', en: 'F Minor' },
    groove: { tr: 'Rumble sub-kick gövdesi ve mekanik ride sürüşü', en: 'Rumble sub-kick low-end with hypnotic ride pulse' },
    description: { tr: 'Monofonik alt frekanslar, endüstriyel perküsyon ve karanlık yankı kuyruğu.', en: 'Rolling monophonic low-end sequences, crisp transients and dark room tails.' },
    notes: [174.61, 174.61, 207.65, 261.63, 174.61],
    kick:  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
    hat:   [0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1],
    synth: [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0],
  },
  {
    name: { tr: 'Trance', en: 'Trance' },
    bpmNum: 138,
    bpm: '138 BPM',
    scale: { tr: 'Re Minör (D Minor)', en: 'D Minor' },
    groove: { tr: 'Yuvarlanan offbeat bas dizilimi ve yan-zincir pompalaması', en: 'Rolling offbeat bassline with pumped supersaw transitions' },
    description: { tr: 'Supersaw akor kırılımları, filtre tarama otomasyonu ve 138 BPM itişi.', en: 'Euphoric supersaw progressions, automated filter sweeps and 138 BPM drive.' },
    notes: [293.66, 349.23, 440, 523.25, 440],
    kick:  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hat:   [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    synth: [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1],
  },
  {
    name: { tr: 'DnB', en: 'DnB' },
    bpmNum: 174,
    bpm: '174 BPM',
    scale: { tr: 'Mi Minör (E Minor)', en: 'E Minor' },
    groove: { tr: 'Senkoplu breakbeat hayalet trampetleri ve keskin kick', en: 'Syncopated breakbeat ghost snares with locked kick pocket' },
    description: { tr: 'Reese alt bas geçişleri ve cerrahi 174 BPM kırık ritim örgüsü.', en: 'Reese basslines, tight sub crossover and high-tempo breakbeat sequencing.' },
    notes: [164.81, 196, 246.94, 293.66, 329.63],
    kick:  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0],
    hat:   [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
    synth: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
  },
  {
    name: { tr: 'Dubstep', en: 'Dubstep' },
    bpmNum: 140,
    bpm: '140 BPM',
    scale: { tr: 'Fa Minör (F Minor)', en: 'F Minor' },
    groove: { tr: 'Yarım zamanlı trampet darbesi ve alt bas ağırlığı', en: 'Half-time snare weight on beat three with mono sub foundation' },
    description: { tr: 'Modülasyonlu orta frekans katmanları ve temiz alt bas headroom ayrımı.', en: 'Modulated midrange growls with isolated clean mono sub-bass headroom.' },
    notes: [174.61, 207.65, 261.63, 311.13, 174.61],
    kick:  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    hat:   [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    synth: [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0],
  },
  {
    name: { tr: 'Trap', en: 'Trap' },
    bpmNum: 142,
    bpm: '142 BPM',
    scale: { tr: 'Do# Minör (C# Minor)', en: 'C# Minor' },
    groove: { tr: 'Yarım zamanlı vuruşlar ve 32lik üçleme hi-hat ruloları', en: 'Half-time bounce with 32nd triplet hi-hat rolls' },
    description: { tr: 'Perde kaymalı 808 glide hatları, keskin trampet ve karanlık melodi.', en: 'Pitch-gliding 808 patterns, snapping snares and dark melodic loops.' },
    notes: [277.18, 329.63, 415.3, 493.88, 277.18],
    kick:  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    hat:   [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1],
    synth: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
  },
  {
    name: { tr: 'Oriental Trap / Hicaz', en: 'Oriental Trap / Hicaz' },
    bpmNum: 138,
    bpm: '138 BPM',
    scale: { tr: 'Re Hicaz (Frigyen Dominant)', en: 'D Hicaz (Phrygian Dominant)' },
    groove: { tr: 'Modern 808 baslar üzerinde darbuka ve bendir senkopları', en: 'Darbuka and bendir rhythmic pocket over modern 808 glides' },
    description: { tr: 'Hicaz gam dizilimi, makamsal melodi ve uyumlu perküsyon kiti.', en: 'Hicaz scale voicings, ornamented melodic writing and matched percussion.' },
    notes: [293.66, 311.13, 369.99, 392, 440],
    kick:  [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    hat:   [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    synth: [1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0],
  },
  {
    name: { tr: 'Boom Bap', en: 'Boom Bap' },
    bpmNum: 90,
    bpm: '90 BPM',
    scale: { tr: 'Mi Bemol Majör (Eb Major)', en: 'Eb Major' },
    groove: { tr: 'İnsanileştirilmiş swing ve akustik davul cebi', en: 'Swung unquantized pocket with dusty acoustic kit timing' },
    description: { tr: 'Caz yedili akor kesimleri, yumuşak doygunluk ve gövdeli trampet.', en: 'Chopped jazz seventh voicings, subtle warmth and punchy acoustic snares.' },
    notes: [311.13, 392, 466.16, 587.33, 349.23],
    kick:  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hat:   [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    synth: [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0],
  },
  {
    name: { tr: 'Lo-Fi', en: 'Lo-Fi' },
    bpmNum: 82,
    bpm: '82 BPM',
    scale: { tr: 'Sol Minör (G Minor)', en: 'G Minor' },
    groove: { tr: 'Kuantizesiz tempo cebi ve hafif kapalı hat dokusu', en: 'Laid-back unquantized beat pocket with muted hat texture' },
    description: { tr: 'Sıcak Rhodes dokuzluları ve yumuşatılmış üst frekans spektrumu.', en: 'Warm Rhodes ninths, softened treble shelf and intimate stereo balance.' },
    notes: [196, 233.08, 293.66, 349.23, 261.63],
    kick:  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    hat:   [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    synth: [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
  },
  {
    name: { tr: 'Pop', en: 'Pop' },
    bpmNum: 116,
    bpm: '116 BPM',
    scale: { tr: 'Do Majör (C Major)', en: 'C Major' },
    groove: { tr: 'Net dörtlü itiş ve nakarat öncesi enerji yükselişi', en: 'Clean four-beat pocket built around pre-chorus lift' },
    description: { tr: 'Vokal için açılmış orta frekans cebi ve dengeli dinamik aralık.', en: 'Vocal-pocket midrange clarity, tight bass anchor and balanced LUFS.' },
    notes: [261.63, 329.63, 392, 440, 523.25],
    kick:  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hat:   [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    synth: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
  },
  {
    name: { tr: 'Synthwave', en: 'Synthwave' },
    bpmNum: 110,
    bpm: '110 BPM',
    scale: { tr: 'La Minör (A Minor)', en: 'A Minor' },
    groove: { tr: 'Gated reverb trampet vurgusu ve sekizlik oktav bas', en: 'Gated reverb backbeat paired with driven octave saw bass' },
    description: { tr: 'Analog testere dalga arpejleri, sıcak koro padleri ve synth lead.', en: 'Analog octave saw bass arpeggios, wide chorus pads and crisp synth leads.' },
    notes: [220, 261.63, 329.63, 392, 440],
    kick:  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hat:   [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    synth: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
  {
    name: { tr: 'Reggaeton', en: 'Reggaeton' },
    bpmNum: 94,
    bpm: '94 BPM',
    scale: { tr: 'Si Minör (B Minor)', en: 'B Minor' },
    groove: { tr: 'Klasik dembow ritim iskeleti ve sıkı trampet darbesi', en: 'Classic dembow kick-snare syncopation with locked mono sub' },
    description: { tr: 'Dembow perküsyon dizilimi, mono sub bas ve modern perküsyon uyumu.', en: 'Dembow percussion lattice, controlled mono sub weight and sparse stabs.' },
    notes: [246.94, 293.66, 369.99, 440, 246.94],
    kick:  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0],
    hat:   [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    synth: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
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
type TrackKey = 'kick' | 'snare' | 'hat' | 'synth'

const DOWNLOAD_PACKAGES: Record<DownloadOs, { label: string; asset: string; bridge: string }> = {
  win: { label: 'Windows', asset: 'fl-mcp-studio-0.3.0-win-x64.zip', bridge: 'loopMIDI (x86_64 & ARM64)' },
  mac: { label: 'macOS', asset: 'fl-mcp-studio-0.3.0-macos-arm64.tar.gz', bridge: 'IAC Driver (Apple Silicon & Intel)' },
  linux: { label: 'Linux', asset: 'fl-mcp-studio-0.3.0-linux-x64.tar.gz', bridge: 'Wine path mapping' },
  mcpb: { label: '.mcpb Bundle', asset: 'fl-mcp-0.3.0.mcpb', bridge: 'Claude Desktop 1-click extension' },
}

const clonePattern = (preset: GenrePreset): Record<TrackKey, number[]> => ({
  kick: [...preset.kick],
  snare: [...preset.snare],
  hat: [...preset.hat],
  synth: [...preset.synth],
})

const triggerStepAudio = (
  ctx: AudioContext,
  track: TrackKey,
  freq: number,
  time: number
) => {
  if (track === 'kick') {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(140, time)
    osc.frequency.exponentialRampToValueAtTime(46, time + 0.09)
    gain.gain.setValueAtTime(0.32, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14)
    osc.connect(gain).connect(ctx.destination)
    osc.start(time)
    osc.stop(time + 0.15)
    return
  }

  if (track === 'snare') {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(210, time)
    osc.frequency.exponentialRampToValueAtTime(110, time + 0.07)
    gain.gain.setValueAtTime(0.18, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09)
    osc.connect(gain).connect(ctx.destination)
    osc.start(time)
    osc.stop(time + 0.1)
    return
  }

  if (track === 'hat') {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(6400, time)
    gain.gain.setValueAtTime(0.035, time)
    gain.gain.exponentialRampToValueAtTime(0.0005, time + 0.028)
    osc.connect(gain).connect(ctx.destination)
    osc.start(time)
    osc.stop(time + 0.03)
    return
  }

  const osc = ctx.createOscillator()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(freq, time)
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(1450, time)
  filter.frequency.exponentialRampToValueAtTime(360, time + 0.14)
  gain.gain.setValueAtTime(0.09, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15)
  osc.connect(filter).connect(gain).connect(ctx.destination)
  osc.start(time)
  osc.stop(time + 0.16)
}

const FlMcpShowcasePage: NextPage = () => {
  const { t, language } = useLanguage()
  const isTr = language === 'tr'
  const reducedMotion = useReducedMotion()

  const [installTab, setInstallTab] = useState<InstallTab>('plugin')
  const [deckTab, setDeckTab] = useState<DeckTab>('overview')
  const [activeGenreIndex, setActiveGenreIndex] = useState(0)
  const [pattern, setPattern] = useState<Record<TrackKey, number[]>>(() => clonePattern(GENRES[0]))
  const [isPlaying, setIsPlaying] = useState(false)
  const [playStep, setPlayStep] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [downloadOpen, setDownloadOpen] = useState(false)
  const [downloadOs, setDownloadOs] = useState<DownloadOs>('win')
  const [docsOpen, setDocsOpen] = useState(false)
  const [docsTab, setDocsTab] = useState<DocsModalTab>('architecture')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [zoomShotIndex, setZoomShotIndex] = useState<number | null>(null)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const stepRef = useRef(0)
  const patternRef = useRef(pattern)

  useEffect(() => {
    patternRef.current = pattern
  }, [pattern])

  const activeGenre = GENRES[activeGenreIndex]

  const selectGenre = useCallback((idx: number) => {
    setActiveGenreIndex(idx)
    setPattern(clonePattern(GENRES[idx]))
  }, [])

  const togglePad = (track: TrackKey, step: number) => {
    setPattern(prev => ({
      ...prev,
      [track]: prev[track].map((val, idx) => (idx === step ? (val ? 0 : 1) : val)),
    }))
  }

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setPlayStep(null)
      return
    }
    if (typeof window !== 'undefined') {
      const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (AudioCtor) {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
          audioCtxRef.current = new AudioCtor()
        } else if (audioCtxRef.current.state === 'suspended') {
          void audioCtxRef.current.resume()
        }
      }
    }
    stepRef.current = 0
    setPlayStep(0)
    setIsPlaying(true)
  }

  useEffect(() => {
    if (!isPlaying) {return}
    const stepMs = (60 / activeGenre.bpmNum / 4) * 1000
    const timer = window.setInterval(() => {
      const step = stepRef.current % 16
      setPlayStep(step)
      const ctx = audioCtxRef.current
      if (ctx) {
        const now = ctx.currentTime
        const p = patternRef.current
        if (p.kick[step]) {triggerStepAudio(ctx, 'kick', 60, now)}
        if (p.snare[step]) {triggerStepAudio(ctx, 'snare', 180, now)}
        if (p.hat[step]) {triggerStepAudio(ctx, 'hat', 6400, now)}
        if (p.synth[step]) {
          const note = activeGenre.notes[step % activeGenre.notes.length]
          triggerStepAudio(ctx, 'synth', note, now)
        }
      }
      stepRef.current = (step + 1) % 16
    }, stepMs)

    return () => window.clearInterval(timer)
  }, [isPlaying, activeGenre])

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        void audioCtxRef.current.close()
      }
    }
  }, [])

  if (!ENTRY) {
    return null
  }

  const item = resolveProduct(ENTRY, t)
  const P = (t as unknown as { flMcpPage?: typeof import('@/locales/en.json')['flMcpPage'] }).flMcpPage
  const M = P?.hero.modals
  const look = worldLook(ENTRY)
  const stageStyle = {
    '--world-base': look.base,
    '--world-accent': look.accent,
    '--world-atmosphere': look.atmosphere,
  } as React.CSSProperties

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
      { id: 'mcpb-pipx', label: isTr ? 'Claude Desktop (uv veya .mcpb)' : 'Claude Desktop (uv or .mcpb)', code: 'uv tool install "fl-mcp[audio] @ git+https://github.com/Rtur2003/FL-MCP" && fl-mcp setup --client claude-desktop --source git --write' },
      { id: 'desktop-json', label: 'claude_desktop_config.json', code: JSON.stringify({ mcpServers: { 'fl-studio': { command: 'uvx', args: ['--from', 'fl-mcp[audio] @ git+https://github.com/Rtur2003/FL-MCP', 'fl-mcp'] } } }, null, 2) },
    ],
    clients: [
      { id: 'auto-register', label: 'Cursor · VS Code · Windsurf · Gemini · Antigravity · Codex', code: 'fl-mcp config cursor --source git --write && fl-mcp config --source git' },
      { id: 'cursor-json', label: 'Streamable-HTTP (.cursor/mcp.json)', code: JSON.stringify({ mcpServers: { 'fl-studio': { url: 'http://127.0.0.1:8765/mcp' } } }, null, 2) },
    ],
    http: [
      { id: 'http-daemon', label: isTr ? 'Arka Plan Studio UI & Daemon (:8765)' : 'Background Studio UI & Daemon (:8765)', code: 'fl-mcp service start --open' },
      { id: 'http-serve', label: isTr ? 'Doğrudan Streamable-HTTP MCP' : 'Direct Streamable-HTTP MCP', code: 'fl-mcp serve --transport streamable-http --port 8765' },
    ],
  }

  const offersSchema = [{ '@type': 'Offer', name: 'MIT Open-Source Build (v0.3.0)', price: '0', priceCurrency: 'USD' }]

  const flMcpUrl = localizedUrl('/fl-mcp', language)
  const softwareSchema = {
    '@type': 'SoftwareApplication',
    '@id': `${flMcpUrl}#software`,
    name: 'FL-MCP (v0.3.0) & FL-MCP Studio',
    description: P?.meta.description || item.description,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Windows, macOS, Linux',
    url: flMcpUrl,
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
  const liveLufs = playStep !== null && (pattern.kick[playStep] || pattern.synth[playStep]) ? '-13.8 LUFS' : '-14.1 LUFS'
  const livePeak = playStep !== null && pattern.kick[playStep] ? '-0.94 dBTP' : '-1.02 dBTP'

  const trackMeta: Array<{ key: TrackKey; label: string; tone?: 'synth' }> = [
    { key: 'kick', label: 'Kick' },
    { key: 'snare', label: 'Snare' },
    { key: 'hat', label: 'Hat' },
    { key: 'synth', label: 'Lead', tone: 'synth' },
  ]

  return (
    <MainLayout
      title={P?.meta.title || item.title}
      description={P?.meta.description || item.description}
      {...(P?.meta.keywords ? { keywords: P.meta.keywords } : {})}
      schema={[softwareSchema]}
    >
      <section className={styles.stage} style={stageStyle} aria-labelledby="flmcp-page-title">
        {/* Atmospheric backdrop with orbital FL-MCP world aura */}
        <div className={styles.backdrop} aria-hidden="true">
          <div className={styles.nebulaLeft} />
          <div className={styles.nebulaRight} />
          <div
            className={styles.planetHalo}
            style={{ backgroundImage: `url(${worldImage('fl-mcp')})` }}
          />
        </div>

        <div className={styles.frame}>
          {/* 1. Editorial Hero */}
          <header className={styles.hero}>
            <div className={styles.versionPillRow}>
              <span className={styles.versionPill}>
                <span className={styles.pulseDot} aria-hidden="true" />
                <span>{P?.hero.liveDemoBadge || 'v0.3.0 · MIT Open Source'}</span>
              </span>
            </div>

            <h1 id="flmcp-page-title" className={styles.title}>
              {worldName(ENTRY, item.title)}
            </h1>

            <p className={styles.lead}>
              {P?.hero.subtitle || item.showroomDescription}
            </p>

            <div className={styles.ctaRow}>
              <button
                type="button"
                className={styles.primaryPill}
                onClick={() => setDownloadOpen(true)}
              >
                <Download size={15} />
                <span>{P?.hero.getStarted || (isTr ? 'İndir ve Kur' : 'Download & Install')}</span>
              </button>

              <button
                type="button"
                className={styles.glassPill}
                onClick={() => openDocsAt('architecture')}
              >
                <BookOpen size={15} />
                <span>{P?.hero.viewDocs || (isTr ? 'Teknik Doküman ve SSS' : 'Technical Docs & FAQ')}</span>
              </button>

              <Link href="/dashboard/fl-mcp" className={styles.ghostPill}>
                <span>{isTr ? 'Lisans Kasası' : 'License Vault'}</span>
                <ArrowRight size={13} />
              </Link>

              <a href={GITHUB_REPO} target="_blank" rel="noreferrer" className={styles.ghostPill}>
                <span>GitHub</span>
                <ExternalLink size={13} />
              </a>
            </div>

            <dl className={styles.metricPills}>
              <div className={styles.metricPill}>
                <dt>{P?.verification.liveLabel}</dt>
                <dd>{P?.verification.liveValue}</dd>
              </div>
              <div className={styles.metricPill}>
                <dt>{P?.verification.offlineLabel}</dt>
                <dd>{P?.verification.offlineValue}</dd>
              </div>
              <div className={styles.metricPill}>
                <dt>{P?.verification.platformsLabel}</dt>
                <dd>{P?.verification.platformsValue}</dd>
              </div>
              <div className={styles.metricPill}>
                <dt>{P?.verification.clientsLabel}</dt>
                <dd>{P?.verification.clientsValue}</dd>
              </div>
            </dl>
          </header>

          {/* 2. Animated Curved Signal Flow Bridge */}
          <div className={styles.signalBridge} aria-label={isTr ? 'Canlı DAW sinyal akışı' : 'Live DAW signal bridge'}>
            <svg className={styles.signalArcSvg} viewBox="0 0 1000 72" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="flmcp-signal-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(214, 171, 107, 0.2)" />
                  <stop offset="50%" stopColor="rgba(234, 192, 111, 0.85)" />
                  <stop offset="100%" stopColor="rgba(143, 192, 171, 0.7)" />
                </linearGradient>
              </defs>
              <path
                className={styles.signalPathFlow}
                d="M 110 36 C 240 12, 300 60, 420 36 C 540 12, 620 60, 760 36 C 830 22, 875 36, 910 36"
                fill="none"
                stroke="url(#flmcp-signal-grad)"
                strokeWidth="2"
              />
            </svg>
            <div className={styles.signalNode}>
              <span className={styles.signalTitle}>AI Host Client</span>
              <span className={styles.signalSub}>Claude · Cursor · Codex</span>
            </div>
            <div className={styles.signalNode}>
              <span className={styles.signalTitle}>FL-MCP v0.3.0</span>
              <span className={styles.signalSub}>14 Tools (~4k tok)</span>
            </div>
            <div className={styles.signalNode}>
              <span className={styles.signalTitle}>API 40 + Bridge</span>
              <span className={styles.signalSub}>loopMIDI · IAC · Wine</span>
            </div>
            <div className={styles.signalNode}>
              <span className={styles.signalTitle}>FL Studio 2025</span>
              <span className={styles.signalSub}>BS.1770-4 · .flp</span>
            </div>
          </div>

          {/* 3. Translucent Curved Studio Rack */}
          <div className={styles.rack}>
            <div className={styles.rackHeader}>
              <h2 className={styles.rackHeading}>
                {isTr ? 'Stüdyo Konsolu ve Canlı Pattern Motoru' : 'Studio Console & Live Pattern Engine'}
              </h2>
              <div className={styles.capsuleRail} role="tablist" aria-label={isTr ? 'FL-MCP görünümleri' : 'FL-MCP panels'}>
                <button type="button" role="tab" aria-selected={deckTab === 'overview'} className={styles.capsuleTab} data-active={deckTab === 'overview'} onClick={() => setDeckTab('overview')}>
                  {isTr ? 'Kurulum & Rack' : 'Setup & Rack'}
                </button>
                <button type="button" role="tab" aria-selected={deckTab === 'tools'} className={styles.capsuleTab} data-active={deckTab === 'tools'} onClick={() => setDeckTab('tools')}>
                  {isTr ? '14 Araç (~4k tok)' : '14 Tools (~4k tok)'}
                </button>
                <button type="button" role="tab" aria-selected={deckTab === 'solver'} className={styles.capsuleTab} data-active={deckTab === 'solver'} onClick={() => setDeckTab('solver')}>
                  {isTr ? 'dB / Hz Çözücü' : 'dB / Hz Solver'}
                </button>
                <button type="button" role="tab" aria-selected={deckTab === 'genres'} className={styles.capsuleTab} data-active={deckTab === 'genres'} onClick={() => setDeckTab('genres')}>
                  {isTr ? '12 Tür Motoru' : '12-Genre Engine'}
                </button>
                <button type="button" role="tab" aria-selected={deckTab === 'architecture'} className={styles.capsuleTab} data-active={deckTab === 'architecture'} onClick={() => setDeckTab('architecture')}>
                  {isTr ? 'Mimari ve Lisans' : 'Architecture & MIT'}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={deckTab}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.22 }}
                {...(reducedMotion
                  ? {}
                  : {
                      initial: { opacity: 0, y: 8 },
                      exit: { opacity: 0, y: -6 },
                    })}
              >
                {deckTab === 'overview' && (
                  <div className={styles.rackSplit}>
                    {/* Left Rack: Client Install & Config */}
                    <div className={styles.rackPanel}>
                      <div className={styles.panelTop}>
                        <h3 className={styles.panelTitle}>{P?.install.cliTitle}</h3>
                        <span className={styles.softBadge}>{P?.install.cliBadge}</span>
                      </div>

                      <div className={styles.subPills} role="tablist" aria-label={isTr ? 'Kurulum akışı' : 'Install client'}>
                        <button type="button" role="tab" aria-selected={installTab === 'plugin'} className={styles.subPill} data-active={installTab === 'plugin'} onClick={() => setInstallTab('plugin')}>Claude Code</button>
                        <button type="button" role="tab" aria-selected={installTab === 'desktop'} className={styles.subPill} data-active={installTab === 'desktop'} onClick={() => setInstallTab('desktop')}>Desktop (.mcpb)</button>
                        <button type="button" role="tab" aria-selected={installTab === 'clients'} className={styles.subPill} data-active={installTab === 'clients'} onClick={() => setInstallTab('clients')}>IDE / CLI</button>
                        <button type="button" role="tab" aria-selected={installTab === 'http'} className={styles.subPill} data-active={installTab === 'http'} onClick={() => setInstallTab('http')}>HTTP / SSE</button>
                      </div>

                      {commandBlocks[installTab].map(block => (
                        <div key={block.id} className={styles.codeCard}>
                          <div className={styles.codeBar}>
                            <span className={styles.codeLabel}>{block.label}</span>
                            <button type="button" className={styles.copyBtn} onClick={() => handleCopy(block.id, block.code)}>
                              {copiedId === block.id ? <Check size={12} /> : <Copy size={12} />}
                              <span>{copiedId === block.id ? copiedLabel : copyLabel}</span>
                            </button>
                          </div>
                          <pre className={styles.codePre}><code>{block.code}</code></pre>
                        </div>
                      ))}

                      <div className={styles.miniBanner}>
                        <span><strong>{P?.install.studioTitle}</strong> · {P?.install.studioBadge}</span>
                        <button type="button" className={styles.linkBtn} onClick={() => setDownloadOpen(true)}>
                          {isTr ? 'Paketleri Gör' : 'Get Binary'}
                        </button>
                      </div>
                    </div>

                    {/* Right Rack: Interactive 16-Step FL Pattern Sequencer + Telemetry + Gallery */}
                    <div className={styles.rackPanel}>
                      <div className={styles.seqHeader}>
                        <div className={styles.seqControls}>
                          <button
                            type="button"
                            className={styles.playBtn}
                            data-playing={isPlaying}
                            onClick={togglePlay}
                            aria-pressed={isPlaying}
                          >
                            {isPlaying ? <Square size={12} /> : <Play size={12} />}
                            <span>{isPlaying ? (isTr ? 'Durdur' : 'Stop') : (isTr ? 'Pattern Çal' : 'Audition')}</span>
                          </button>
                          <button
                            type="button"
                            className={styles.subPill}
                            onClick={() => selectGenre((activeGenreIndex + 1) % GENRES.length)}
                            title={isTr ? 'Sonraki tür şablonuna geç' : 'Cycle next genre preset'}
                          >
                            {isTr ? activeGenre.name.tr : activeGenre.name.en}
                          </button>
                        </div>
                        <span className={styles.seqMeta}>
                          {activeGenre.bpm} · {isTr ? activeGenre.scale.tr : activeGenre.scale.en}
                        </span>
                      </div>

                      <div className={styles.seqGrid} role="group" aria-label={isTr ? '16 adımlı FL pattern dizilimi' : '16-step FL pattern grid'}>
                        {trackMeta.map(row => (
                          <div key={row.key} className={styles.seqTrackRow}>
                            <span className={styles.seqTrackName}>{row.label}</span>
                            {pattern[row.key].map((on, stepIdx) => (
                              <button
                                key={stepIdx}
                                type="button"
                                className={styles.seqPad}
                                data-on={Boolean(on)}
                                data-beat={stepIdx % 4 === 0}
                                data-tone={row.tone}
                                data-playhead={playStep === stepIdx}
                                aria-pressed={Boolean(on)}
                                aria-label={`${row.label} step ${stepIdx + 1}`}
                                onClick={() => togglePad(row.key, stepIdx)}
                              />
                            ))}
                          </div>
                        ))}
                      </div>

                      <div className={styles.meterCapsules}>
                        <div className={styles.meterCapsule}>
                          <span className={styles.meterLabel}>LUFS-I</span>
                          <span className={styles.meterValue}>{liveLufs}</span>
                        </div>
                        <div className={styles.meterCapsule}>
                          <span className={styles.meterLabel}>True Peak</span>
                          <span className={styles.meterValue}>{livePeak}</span>
                        </div>
                        <div className={styles.meterCapsule}>
                          <span className={styles.meterLabel}>LRA · Crest</span>
                          <span className={styles.meterValue}>6.8 LU · 9.4 dB</span>
                        </div>
                        <div className={styles.meterCapsule}>
                          <span className={styles.meterLabel}>{isTr ? 'Spektrum' : 'Spectrum'}</span>
                          <span className={styles.meterValue}>{isTr ? '7 Bant · +0.86' : '7-Band · +0.86'}</span>
                        </div>
                      </div>

                      <div className={styles.galleryRow}>
                        {SHOTS.map((shot, idx) => (
                          <figure key={shot.id} className={styles.shotFigure}>
                            <button
                              type="button"
                              className={styles.shotTrigger}
                              onClick={() => setZoomShotIndex(idx)}
                              aria-label={isTr ? 'Görseli büyüt' : 'Enlarge screenshot'}
                            >
                              <Image
                                src={shot.src}
                                alt={isTr ? shot.caption.tr : shot.caption.en}
                                width={1440}
                                height={900}
                                sizes="(max-width: 960px) 100vw, 280px"
                                priority
                              />
                              <span className={styles.shotZoomPill} aria-hidden="true">
                                <Maximize2 size={13} />
                              </span>
                            </button>
                            <figcaption>{isTr ? shot.caption.tr : shot.caption.en}</figcaption>
                          </figure>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {deckTab === 'tools' && (
                  <div className={styles.toolsFlow}>
                    {P?.features.tools.items.map((tool, idx) => (
                      <article key={idx} className={styles.toolCapsuleCard}>
                        <div className={styles.toolTop}>
                          <span className={styles.toolName}>{tool.name}</span>
                          <span className={styles.toolRole}>{tool.role}</span>
                        </div>
                        <p className={styles.toolDetail}>{tool.detail}</p>
                      </article>
                    ))}
                  </div>
                )}

                {deckTab === 'solver' && (
                  <div className={styles.solverList}>
                    <div className={`${styles.solverRow} ${styles.solverHead}`}>
                      <span>{isTr ? 'Eklenti' : 'Plugin'}</span>
                      <span>{isTr ? 'Ham Değer (0.0-1.0)' : 'Raw DAW Float'}</span>
                      <span>{isTr ? 'fl_param Gerçek Birim' : 'fl_param Real Unit'}</span>
                    </div>
                    {PLUGIN_SOLVER_EXAMPLES.map((ex, idx) => (
                      <div key={idx} className={styles.solverRow}>
                        <span>{ex.plugin}</span>
                        <span className={styles.solverRaw}>{ex.raw}</span>
                        <span className={styles.solverReal}>{ex.solved}</span>
                      </div>
                    ))}
                  </div>
                )}

                {deckTab === 'genres' && (
                  <div>
                    <div className={styles.genrePillsWrap}>
                      {GENRES.map((g, idx) => (
                        <button
                          key={g.name.en}
                          type="button"
                          className={styles.genreChipPill}
                          data-active={activeGenreIndex === idx}
                          onClick={() => selectGenre(idx)}
                        >
                          <span>{isTr ? g.name.tr : g.name.en}</span>
                          <span className={styles.genreBpm}>{g.bpmNum}</span>
                        </button>
                      ))}
                    </div>

                    <div className={styles.genreCard}>
                      <div className={styles.genreTop}>
                        <div className={styles.genreTitleRow}>
                          <span className={styles.genreName}>{isTr ? activeGenre.name.tr : activeGenre.name.en}</span>
                          <span className={styles.softBadge}>{activeGenre.bpm}</span>
                          <span className={styles.softBadge}>{isTr ? activeGenre.scale.tr : activeGenre.scale.en}</span>
                        </div>
                        <button
                          type="button"
                          className={styles.playBtn}
                          data-playing={isPlaying}
                          onClick={togglePlay}
                        >
                          {isPlaying ? <Square size={12} /> : <Play size={12} />}
                          <span>{isPlaying ? (isTr ? 'Durdur' : 'Stop') : (isTr ? 'Bu Türü Dinle' : 'Audition Genre')}</span>
                        </button>
                      </div>
                      <p className={styles.toolDetail}>{isTr ? activeGenre.description.tr : activeGenre.description.en}</p>
                      <p className={styles.toolDetail} style={{ color: 'var(--muted)' }}>
                        <strong>Groove:</strong> {isTr ? activeGenre.groove.tr : activeGenre.groove.en}
                      </p>
                    </div>
                  </div>
                )}

                {deckTab === 'architecture' && (
                  <div className={styles.glassPair}>
                    <div className={styles.glassInfoCard}>
                      <h3>{P?.transparency.title}</h3>
                      <p>{P?.transparency.intro}</p>
                      <div>
                        <button type="button" className={styles.linkBtn} onClick={() => openDocsAt('architecture')}>
                          {isTr ? '5 Katmanı Detaylı Aç' : 'Open 5-Layer Reference'}
                        </button>
                      </div>
                    </div>
                    <div className={styles.glassInfoCard}>
                      <h3>{P?.commerceNotice.localBoundaryTitle}</h3>
                      <p>{P?.commerceNotice.localBoundaryBody}</p>
                      <div>
                        <button type="button" className={styles.linkBtn} onClick={() => openDocsAt('license')}>
                          {isTr ? 'Lisans ve Gizlilik Detayı' : 'Open License & FAQ'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 4. Concise Bottom Spec Strip */}
          <dl className={styles.factsStrip}>
            <div className={styles.factBubble}>
              <dt>{isTr ? 'Desteklenen İstemciler' : 'AI Host Integration'}</dt>
              <dd>{P?.verification.clientsDetail}</dd>
            </div>
            <div className={styles.factBubble}>
              <dt>{isTr ? 'Yerel Veri ve Gizlilik' : 'Local Data Boundary'}</dt>
              <dd>{P?.commerceNotice.openSourceBody}</dd>
            </div>
            <div className={styles.factBubble}>
              <dt>{isTr ? 'Derin Dokümantasyon' : 'Engineering Specs & FAQ'}</dt>
              <dd>
                <span>{P?.transparency.subtitle}</span>{' '}
                <button type="button" className={styles.linkBtn} onClick={() => openDocsAt('faq')}>
                  {isTr ? 'SSS ve Mimaride Oku' : 'Read Full FAQ & Architecture'}
                </button>
              </dd>
            </div>
          </dl>
        </div>

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
              <a href={GITHUB_RELEASES} target="_blank" rel="noreferrer" className={styles.primaryPill}>
                <Download size={15} />
                <span>{M?.downloadButton || 'Continue to Releases'}</span>
              </a>
            </>
          }
        >
          <div className={styles.subPills} role="tablist" aria-label={M?.platformLabel || 'Select OS'}>
            {(Object.keys(DOWNLOAD_PACKAGES) as DownloadOs[]).map(osKey => (
              <button
                key={osKey}
                type="button"
                role="tab"
                aria-selected={downloadOs === osKey}
                className={styles.subPill}
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
            <div>
              <a href={SPONSORS_URL} target="_blank" rel="noopener noreferrer" className={styles.glassPill} style={{ minHeight: '38px', fontSize: '0.85rem' }}>
                <span>{M?.supportButton}</span>
                <ExternalLink size={13} />
              </a>
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
          <div className={styles.subPills} role="tablist" aria-label={M?.docsTitle || 'Documentation sections'} style={{ marginBottom: '14px' }}>
            <button type="button" role="tab" aria-selected={docsTab === 'architecture'} className={styles.subPill} data-active={docsTab === 'architecture'} onClick={() => setDocsTab('architecture')}>
              {M?.tabArchitecture}
            </button>
            <button type="button" role="tab" aria-selected={docsTab === 'license'} className={styles.subPill} data-active={docsTab === 'license'} onClick={() => setDocsTab('license')}>
              {M?.tabLicense}
            </button>
            <button type="button" role="tab" aria-selected={docsTab === 'faq'} className={styles.subPill} data-active={docsTab === 'faq'} onClick={() => setDocsTab('faq')}>
              {M?.tabFaq}
            </button>
          </div>

          {docsTab === 'architecture' && (
            <div className={styles.ladder}>
              {P?.transparency.layers.map((step, idx) => (
                <div key={idx} className={styles.ladderRow}>
                  <div className={styles.ladderLayer}>{step.layer}</div>
                  <div>
                    <p className={styles.ladderLine}>{step.how}</p>
                    <p className={styles.ladderBoundary}>{step.scope} · {step.boundary}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {docsTab === 'license' && (
            <div className={styles.glassPair}>
              <div className={styles.glassInfoCard}>
                <h3>{P?.commerceNotice.openSourceTitle}</h3>
                <p>{P?.commerceNotice.openSourceBody}</p>
              </div>
              <div className={styles.glassInfoCard}>
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
            <Image
              src={SHOTS[zoomShotIndex].src}
              alt={isTr ? SHOTS[zoomShotIndex].caption.tr : SHOTS[zoomShotIndex].caption.en}
              width={1440}
              height={900}
              sizes="(max-width: 900px) 95vw, 820px"
              className={styles.lightboxImg}
            />
          )}
        </Modal>
      </section>
    </MainLayout>
  )
}

export default FlMcpShowcasePage
