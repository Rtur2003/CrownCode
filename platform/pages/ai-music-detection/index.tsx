// AURIS — the first world of the homepage atlas, opened up. A track goes to
// the trained models on the CrownCode backend (Hugging Face Space); the
// browser measures the same audio for the waveform and spectrogram, and as
// a labelled fallback. Jobs run in hooks/auris/runner.ts, so they survive
// leaving this page.

import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { AlertTriangle, ExternalLink, FileAudio, Link as LinkIcon, Mic, RefreshCw, Square, Upload } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { PlayButton, ResidualPlot, Spectrogram, Waveform, usePlayback } from '@/components/Auris/SignalViews'
import { ModelMetrics, ReportLog, Stop, Verdict, summarize, type DoneJob } from '@/components/Auris/Report'
import { JobProgress, jobSegments } from '@/components/Auris/JobProgress'
import type { WorldMode } from '@/components/Auris/AurisWorld'
import { aiProbability, clock, fill, isTrained, num, percent } from '@/components/Auris/format'
import { AURIS_MODELS_URL, AURIS_SPACE_URL } from '@/config/api'
import { AURIS_MODEL } from '@/config/auris-model'
import { PRODUCT_CATALOG } from '@/config/product-catalog'
import { worldLook } from '@/config/showroom-worlds'
import { useLanguage } from '@/context/LanguageContext'
import type { AnalysisResult } from '@/hooks/analysisTypes'
import { dismissInterrupted, markSeen, openFromHistory, rerunLast, retryInterrupted } from '@/hooks/auris/runner'
import { ensureServer } from '@/hooks/auris/server'
import { isActive, type AurisJob, type ServerState } from '@/hooks/auris/store'
import { useAuris, type AurisController } from '@/hooks/auris/useAuris'
import { HISTORY_KEYS, readHistory, type HistoryEntry } from '@/hooks/useLocalHistory'
import styles from '@/styles/pages/auris.module.css'

// The world is WebGL; the server HTML shows a still of the same scene.
const AurisWorld = dynamic(() => import('@/components/Auris/AurisWorld'), { ssr: false })

type Tab = 'file' | 'url' | 'mic'

const WORLD_ID = 'ai-music-detection'
const WORLD_INDEX = PRODUCT_CATALOG.findIndex(p => p.id === WORLD_ID)
const LOOK = worldLook({ id: WORLD_ID })
const pad = (n: number) => String(n).padStart(2, '0')

/** What the planet shows for the current job. */
const worldState = (job: AurisJob | null): { mode: WorldMode; progress: number; threshold: number | null; ticks: number } => {
  if (isActive(job)) {
    if (job.stage === 'waking' || job.queue || (job.stage === 'processing' && job.steps.length === 0)) {
      return { mode: 'waking', progress: 0, threshold: null, ticks: 0 }
    }
    const { segments, progress } = jobSegments(job)
    return { mode: 'running', progress, threshold: null, ticks: segments }
  }
  if (job?.stage === 'done' && job.result) {
    const s = summarize(job.result)
    return { mode: s.isAi ? 'ai' : 'human', progress: s.p, threshold: s.modelVerdict ? s.threshold : null, ticks: 0 }
  }
  return { mode: 'idle', progress: 0, threshold: null, ticks: 0 }
}

const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return reduced
}

const AurisPage: NextPage = () => {
  const { t, language } = useLanguage()
  const A = t.aiDetection
  const auris = useAuris(A.mic.take)
  const { job, server, interrupted } = auris
  const [tab, setTab] = useState<Tab>('file')
  const [hot, setHot] = useState(false)
  const [inView, setInView] = useState(true)
  const [worldReady, setWorldReady] = useState(false)
  const dragDepth = useRef(0)
  const stageRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const active = isActive(job)
  const finished = job?.stage === 'done' || job?.stage === 'error'

  // A result shown here counts as seen, so the site-wide pill stops announcing it.
  useEffect(() => {
    if (finished) {markSeen()}
  }, [finished, job?.id])

  // Rendering pauses while the stage is scrolled away.
  useEffect(() => {
    const el = stageRef.current
    if (!el) {return}
    const io = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), { rootMargin: '80px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Drop a file anywhere on the stage, straight onto the world.
  const onDragEnter = (e: React.DragEvent) => {
    if (active || !e.dataTransfer.types.includes('Files')) {return}
    dragDepth.current++
    setHot(true)
  }
  const onDragLeave = () => {
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    if (dragDepth.current === 0) {setHot(false)}
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragDepth.current = 0
    setHot(false)
    const file = e.dataTransfer.files?.[0]
    if (file && !active) {
      setTab('file')
      auris.analyseFile(file)
    }
  }

  const report = job?.stage === 'done' && job.result ? (job as DoneJob) : null
  const canRerun = report && !report.result.xai && !report.restored
  const openReport = () => document.getElementById('auris-report')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  const world = worldState(job)
  const signal = job?.signal?.visuals ? job.signal : null
  const sector = language === 'en' ? LOOK.sector.en : LOOK.sector.tr

  return (
    <MainLayout
      title={A.meta.title}
      description={A.meta.description}
      keywords={A.meta.keywords}
      image={language === 'en' ? '/og/ai-music-detection-en.jpg' : '/og/ai-music-detection.jpg'}
      schema={[faqSchema(A.faq.items)]}
    >
      <div className={styles.page}>
        <section
          ref={stageRef}
          className={styles.stage}
          data-mode={world.mode}
          data-hot={hot ? 'true' : undefined}
          aria-labelledby="auris-title"
          onDragEnter={onDragEnter}
          onDragOver={e => { if (!active) {e.preventDefault()} }}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className={styles.world} data-ready={worldReady ? 'true' : undefined}>
            <div className={styles.worldPoster} aria-hidden="true" />
            <div className={styles.worldCanvas}>
              <AurisWorld
                {...world}
                hot={hot}
                active={inView}
                reducedMotion={reducedMotion}
                onReady={() => setWorldReady(true)}
              />
            </div>
          </div>
          <div className={styles.scrim} aria-hidden="true" />

          <div className={styles.panel}>
            <p className={styles.kicker}>
              <span>{pad(WORLD_INDEX + 1)} / {pad(PRODUCT_CATALOG.length)}</span>
              <span>{sector}</span>
            </p>
            <h1 id="auris-title" className={styles.title}>
              AURIS
              <span className={styles.question}>{A.intro.question}</span>
            </h1>

            {active ? (
              <JobProgress job={job} onCancel={auris.reset} />
            ) : report ? (
              <Verdict job={report} onReset={auris.reset} onRetryServer={canRerun ? () => void rerunLast() : undefined} onOpenReport={openReport} />
            ) : (
              <>
                <p className={styles.lead}>{A.intro.lead}</p>
                {interrupted && !job && (
                  <div className={styles.banner} role="status">
                    <p><strong>{A.interrupted.title}.</strong> {fill(A.interrupted.body, { label: interrupted.label })}</p>
                    <div className={styles.actions}>
                      <button type="button" className={styles.btnPrimary} onClick={() => void retryInterrupted()}><RefreshCw size={16} /> {A.interrupted.retry}</button>
                      <button type="button" className={styles.btnGhost} onClick={dismissInterrupted}>{A.interrupted.dismiss}</button>
                    </div>
                  </div>
                )}
                <Console auris={auris} tab={tab} onTab={setTab} />
              </>
            )}
          </div>

          <ServerStatus server={server} />
        </section>

        <div className={styles.route}>
          {signal && job && <Scope auris={auris} signal={signal} />}
          {report && <ReportLog job={report} />}
          <Recent current={job} />
          <Faq />
          <Method />
        </div>
      </div>
    </MainLayout>
  )
}

// ── stage pieces ────────────────────────────────────────────────────

const ServerStatus: React.FC<{ server: ServerState }> = ({ server }) => {
  const { t } = useLanguage()
  const S = t.aiDetection.server
  const note = server.status === 'waking' ? S.wakingNote : server.status === 'down' ? S.downNote : null
  return (
    <div className={styles.server} data-status={server.status}>
      <p>
        <span className={styles.dot} aria-hidden="true" />
        {S.label}: {S[server.status]}
        {server.status === 'ready' && server.latencyMs !== null && <span className={styles.mono}>{server.latencyMs} ms</span>}
        {server.status === 'down' && (
          <button type="button" className={styles.linkBtn} onClick={() => void ensureServer()}>{S.retry}</button>
        )}
      </p>
      {note && <p className={styles.serverNote}>{note}</p>}
    </div>
  )
}

const Console: React.FC<{ auris: AurisController; tab: Tab; onTab: (t: Tab) => void }> = ({ auris, tab, onTab }) => {
  const { t } = useLanguage()
  const A = t.aiDetection
  const job = auris.job
  const errorText = job?.stage === 'error' && job.error
    ? (A.errors as Record<string, string>)[job.error] ?? A.errors.internalError
    : null
  return (
    <div className={styles.console}>
      <div className={styles.tabs} role="tablist" aria-label={A.tabs.ariaLabel}>
        {([
          ['file', FileAudio, A.tabs.file],
          ['url', LinkIcon, A.tabs.url],
          ['mic', Mic, A.tabs.mic],
        ] as const).map(([id, Icon, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`auris-tab-${id}`}
            aria-controls="auris-source"
            aria-selected={tab === id}
            className={styles.tab}
            onClick={() => onTab(id)}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
      <div id="auris-source" role="tabpanel" aria-labelledby={`auris-tab-${tab}`} className={styles.sourcePanel}>
        {tab === 'file' && <FileSource auris={auris} />}
        {tab === 'url' && <UrlSource auris={auris} />}
        {tab === 'mic' && <MicSource auris={auris} />}
      </div>
      {errorText && (
        <p className={styles.error} role="alert"><AlertTriangle size={16} /> {errorText}</p>
      )}
    </div>
  )
}

const FileSource: React.FC<{ auris: AurisController }> = ({ auris }) => {
  const { t } = useLanguage()
  const F = t.aiDetection.file
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const pick = useCallback((file?: File) => { if (file) {auris.analyseFile(file)} }, [auris])

  return (
    <div
      className={styles.drop}
      data-over={over}
      role="button"
      tabIndex={0}
      aria-label={`${F.drop}. ${F.browse}`}
      onClick={() => input.current?.click()}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.current?.click() } }}
      onDragOver={e => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); e.stopPropagation(); setOver(false); pick(e.dataTransfer.files?.[0]) }}
    >
      <Upload size={22} />
      <span className={styles.dropText}>
        <strong>{F.drop}</strong>
        <span>{F.browse}</span>
      </span>
      <small>{F.formats}</small>
      <input
        ref={input}
        type="file"
        accept="audio/*,.mp3,.wav,.flac,.m4a,.aac,.ogg,.opus"
        hidden
        onChange={e => { pick(e.target.files?.[0]); e.target.value = '' }}
      />
      <small className={styles.privacy}>{F.privacy}</small>
    </div>
  )
}

const UrlSource: React.FC<{ auris: AurisController }> = ({ auris }) => {
  const { t } = useLanguage()
  const U = t.aiDetection.url
  const [value, setValue] = useState('')
  return (
    <form className={styles.urlForm} onSubmit={e => { e.preventDefault(); auris.analyseUrl(value) }}>
      <label htmlFor="auris-url">{U.label}</label>
      <div className={styles.urlRow}>
        <input
          id="auris-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder={U.placeholder}
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <button type="submit" className={styles.btnPrimary} disabled={!value.trim()}>{U.submit}</button>
      </div>
      <p className={styles.hint}>{U.hint}</p>
    </form>
  )
}

const MicSource: React.FC<{ auris: AurisController }> = ({ auris }) => {
  const { t } = useLanguage()
  const M = t.aiDetection.mic
  const secs = Math.floor(auris.micElapsed / 1000)
  return (
    <div className={styles.mic}>
      <button
        type="button"
        className={styles.micButton}
        data-recording={auris.recording}
        onClick={auris.recording ? auris.stopRecording : () => void auris.startRecording()}
        style={{ ['--level' as string]: auris.micLevel }}
      >
        {auris.recording ? <Square size={20} /> : <Mic size={22} />}
        <span>{auris.recording ? M.stop : M.start}</span>
      </button>
      <div className={styles.micSide}>
        {auris.recording ? <LiveMeter level={auris.micLevel} /> : null}
        <p className={styles.hint}>
          {auris.recording ? `${M.recording} ${secs} / ${auris.maxRecordMs / 1000} s` : M.hint}
        </p>
      </div>
    </div>
  )
}

/** Rolling input level while the microphone records. */
const LiveMeter: React.FC<{ level: number }> = ({ level }) => {
  const [history, setHistory] = useState<number[]>(() => Array(64).fill(0))
  const [prevLevel, setPrevLevel] = useState(level)
  if (level !== prevLevel) {
    setPrevLevel(level)
    setHistory(h => [...h.slice(1), level])
  }
  return (
    <svg className={styles.liveMeter} viewBox="0 0 256 40" aria-hidden="true" preserveAspectRatio="none">
      {history.map((v, i) => {
        const hgt = Math.max(1.5, v * 38)
        return <rect key={i} x={i * 4} y={20 - hgt / 2} width={2.6} height={hgt} rx={1} />
      })}
    </svg>
  )
}

// ── below the stage, on the route line ─────────────────────────────

const Scope: React.FC<{ auris: AurisController; signal: NonNullable<AurisJob['signal']> }> = ({ auris, signal }) => {
  const { t } = useLanguage()
  const A = t.aiDetection
  const playback = usePlayback(auris.job?.audioUrl ?? null)
  return (
    <Stop title={A.scope.title} lead={A.scope.lead}>
      <div className={styles.scope}>
        <div className={styles.scopeRow}>
          {playback.available && (
            <PlayButton playing={playback.playing} onClick={playback.toggle} labels={{ play: A.scope.play, pause: A.scope.pause }} />
          )}
          <div className={styles.scopeWave}>
            <Waveform peaks={signal.visuals.waveform} progress={playback.progress} onSeek={playback.seek} label={A.scope.seek} />
          </div>
        </div>
        <div>
          <p className={styles.viewLabel}>{A.scope.spectrogram}</p>
          <Spectrogram
            data={signal.visuals.spectrogram}
            minHz={signal.visuals.spectrogramMinHz}
            maxHz={signal.visuals.spectrogramMaxHz}
            cutoffHz={signal.contributions.bandwidthCutoff.value}
            cutoffLabel={A.scope.cutoff}
            progress={playback.progress}
          />
        </div>
        <div>
          <p className={styles.viewLabel}>{A.scope.residual}</p>
          <ResidualPlot values={signal.visuals.periodicityResidual} label={A.scope.residual} />
        </div>
      </div>
    </Stop>
  )
}

/** Last analyses from this browser; reopening one shows its saved report. */
const Recent: React.FC<{ current: AurisJob | null }> = ({ current }) => {
  const { t, language } = useLanguage()
  const R = t.aiDetection.recent
  const [entries, setEntries] = useState<HistoryEntry<AnalysisResult>[]>([])
  const finishedAt = current?.finishedAt
  useEffect(() => {
    setEntries(readHistory<AnalysisResult>(HISTORY_KEYS.ANALYSIS).filter(e => e.result && typeof e.result.isAIGenerated === 'boolean').slice(0, 6))
  }, [finishedAt])
  if (!entries.length) {return null}
  const busy = isActive(current)
  const fmt = new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <Stop title={R.title} lead={R.lead}>
      <ol className={styles.recent}>
        {entries.map(e => {
          const trained = isTrained(e.result) && !!e.result.xai
          const p = aiProbability(e.result)
          const ai = trained ? e.result.isAIGenerated : p >= 0.5
          return (
            <li key={e.id}>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  openFromHistory(e.input, e.result, e.timestamp)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                <span className={styles.recentValue} data-tone={ai ? 'ai' : 'human'}>{percent(language, p)}</span>
                <span className={styles.recentLabel}>{e.input}</span>
                <span className={styles.recentMeta}>
                  {trained ? R.model : R.signal} · {fmt.format(e.timestamp)}
                  {typeof e.result.processingTime === 'number' && ` · ${clock(e.result.processingTime * 1000)}`}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      <Link href="/analysis-history" className={styles.linkBtn}>{R.all}</Link>
    </Stop>
  )
}

/** The questions people search for, answered on the page (and as FAQPage data). */
const Faq: React.FC = () => {
  const { t } = useLanguage()
  const F = t.aiDetection.faq
  return (
    <Stop title={F.title} lead={F.lead}>
      <div className={styles.faq}>
        {F.items.map(item => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </Stop>
  )
}

const faqSchema = (items: ReadonlyArray<{ q: string; a: string }>) => ({
  '@type': 'FAQPage',
  mainEntity: items.map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
})

const Method: React.FC = () => {
  const { t, language } = useLanguage()
  const M = t.aiDetection.method
  const count = (n: number) => n.toLocaleString(language === 'en' ? 'en-US' : 'tr-TR')
  return (
    <>
      <Stop
        title={M.title}
        lead={fill(M.lead, {
          samples: count(AURIS_MODEL.samples),
          ai: count(AURIS_MODEL.aiSamples),
          human: count(AURIS_MODEL.humanSamples),
          features: AURIS_MODEL.features,
          folds: AURIS_MODEL.folds,
        })}
      >
        <ModelMetrics />
        <p className={styles.links}>
          <a href={AURIS_MODELS_URL} target="_blank" rel="noopener noreferrer">{t.aiDetection.server.models} <ExternalLink size={13} /></a>
          <a href={AURIS_SPACE_URL} target="_blank" rel="noopener noreferrer">{t.aiDetection.server.space} <ExternalLink size={13} /></a>
        </p>
      </Stop>
      <Stop title={M.stepsTitle}>
        <ol className={styles.methodList}>
          <li>{M.step1}</li>
          <li>{fill(M.step2, { t: num(language, AURIS_MODEL.threshold, 3) })}</li>
          <li>{M.step3}</li>
          <li>{M.step4}</li>
        </ol>
      </Stop>
      <Stop title={M.limitsTitle}>
        <ul className={styles.methodList}>
          <li>{M.limit1}</li>
          <li>{M.limit2}</li>
          <li>{fill(M.limit3, { acc: num(language, AURIS_MODEL.accuracy * 100, 1) })}</li>
        </ul>
      </Stop>
    </>
  )
}

export default AurisPage
