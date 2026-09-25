// AURIS — sends a track to the trained models on the CrownCode backend
// (Hugging Face Space) and explains the verdict. The browser measures the
// same audio for the waveform/spectrogram and as a labelled fallback.
// Jobs run in hooks/auris/runner.ts, so they survive leaving this page.

import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { AlertTriangle, ExternalLink, FileAudio, Link as LinkIcon, Mic, RefreshCw, Square, Upload, X } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { PlayButton, ResidualPlot, Spectrogram, Waveform, usePlayback } from '@/components/Auris/SignalViews'
import { ModelMetrics, Report } from '@/components/Auris/Report'
import { JobProgress } from '@/components/Auris/JobProgress'
import { aiProbability, clock, fill, isTrained, num, percent } from '@/components/Auris/format'
import { AURIS_MODELS_URL, AURIS_SPACE_URL } from '@/config/api'
import { AURIS_MODEL } from '@/config/auris-model'
import { useLanguage } from '@/context/LanguageContext'
import type { AnalysisResult } from '@/hooks/analysisTypes'
import { dismissInterrupted, markSeen, openFromHistory, rerunLast, retryInterrupted } from '@/hooks/auris/runner'
import { ensureServer } from '@/hooks/auris/server'
import { isActive, type AurisJob, type ServerState } from '@/hooks/auris/store'
import { useAuris, type AurisController } from '@/hooks/auris/useAuris'
import { HISTORY_KEYS, readHistory, type HistoryEntry } from '@/hooks/useLocalHistory'
import styles from '@/styles/pages/auris.module.css'

type Tab = 'file' | 'url' | 'mic'

const AurisPage: NextPage = () => {
  const { t, language } = useLanguage()
  const A = t.aiDetection
  const auris = useAuris(A.mic.take)
  const { job, server, interrupted } = auris
  const [tab, setTab] = useState<Tab>('file')
  const active = isActive(job)
  const finished = job?.stage === 'done' || job?.stage === 'error'

  // A result shown here counts as seen, so the site-wide pill stops announcing it.
  useEffect(() => {
    if (finished) {markSeen()}
  }, [finished, job?.id])

  // Bring the report into view when a run finishes while the visitor watches.
  const lastStage = useRef(job?.stage)
  useEffect(() => {
    const was = lastStage.current
    lastStage.current = job?.stage
    if (job?.stage === 'done' && was && was !== 'done' && !job.restored) {
      document.getElementById('auris-report')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [job?.stage, job?.restored])

  const report = job?.stage === 'done' && job.result ? (job as AurisJob & { result: AnalysisResult }) : null
  const canRerun = report && !report.result.xai && !report.restored

  return (
    <MainLayout title={A.meta.title} description={A.meta.description} keywords={A.meta.keywords}>
      <div className={styles.page}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>{A.intro.eyebrow}</p>
          <h1 className={styles.title}>AURIS</h1>
          <p className={styles.lead}>{A.intro.lead}</p>
          <ServerStatus server={server} />
        </header>

        {interrupted && !job && (
          <div className={styles.banner} role="status">
            <div>
              <strong>{A.interrupted.title}</strong>
              <p>{fill(A.interrupted.body, { label: interrupted.label })}</p>
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.btnPrimary} onClick={() => void retryInterrupted()}><RefreshCw size={16} /> {A.interrupted.retry}</button>
              <button type="button" className={styles.btnGhost} onClick={dismissInterrupted}>{A.interrupted.dismiss}</button>
            </div>
          </div>
        )}

        <div className={styles.console}>
          <aside className={styles.sources}>
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
                  onClick={() => setTab(id)}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
            <div id="auris-source" role="tabpanel" aria-labelledby={`auris-tab-${tab}`} className={styles.sourcePanel}>
              {active ? (
                <div className={styles.locked}>
                  <p>{A.busy.locked}</p>
                  <button type="button" className={styles.btnGhost} onClick={auris.reset}><X size={16} /> {A.busy.cancel}</button>
                </div>
              ) : (
                <>
                  {tab === 'file' && <FileSource auris={auris} />}
                  {tab === 'url' && <UrlSource auris={auris} />}
                  {tab === 'mic' && <MicSource auris={auris} />}
                </>
              )}
            </div>
          </aside>

          <Scope auris={auris} />
        </div>

        {active && <JobProgress job={job} onCancel={auris.reset} />}

        {report && (
          <div id="auris-report" className={styles.reportAnchor}>
            <Report job={report} onReset={auris.reset} onRetryServer={canRerun ? () => void rerunLast() : undefined} />
          </div>
        )}

        <Recent current={job} />

        <section className={styles.method} aria-labelledby="auris-method">
          <div>
            <p className={styles.eyebrow}>{A.method.eyebrow}</p>
            <h2 id="auris-method">{A.method.title}</h2>
            <p>
              {fill(A.method.lead, {
                samples: AURIS_MODEL.samples.toLocaleString(language === 'en' ? 'en-US' : 'tr-TR'),
                ai: AURIS_MODEL.aiSamples.toLocaleString(language === 'en' ? 'en-US' : 'tr-TR'),
                human: AURIS_MODEL.humanSamples.toLocaleString(language === 'en' ? 'en-US' : 'tr-TR'),
                features: AURIS_MODEL.features,
                folds: AURIS_MODEL.folds,
              })}
            </p>
            <ModelMetrics />
            <p className={styles.links}>
              <a href={AURIS_MODELS_URL} target="_blank" rel="noopener noreferrer">{A.server.models} <ExternalLink size={13} /></a>
              <a href={AURIS_SPACE_URL} target="_blank" rel="noopener noreferrer">{A.server.space} <ExternalLink size={13} /></a>
            </p>
          </div>
          <div className={styles.methodCols}>
            <div>
              <h3>{A.method.stepsTitle}</h3>
              <ol>
                <li>{A.method.step1}</li>
                <li>{fill(A.method.step2, { t: num(language, AURIS_MODEL.threshold, 3) })}</li>
                <li>{A.method.step3}</li>
                <li>{A.method.step4}</li>
              </ol>
            </div>
            <div>
              <h3>{A.method.limitsTitle}</h3>
              <ul>
                <li>{A.method.limit1}</li>
                <li>{A.method.limit2}</li>
                <li>{fill(A.method.limit3, { acc: num(language, AURIS_MODEL.accuracy * 100, 1) })}</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

const ServerStatus: React.FC<{ server: ServerState }> = ({ server }) => {
  const { t } = useLanguage()
  const S = t.aiDetection.server
  const label = S[server.status]
  const note = server.status === 'waking' ? S.wakingNote : server.status === 'down' ? S.downNote : null
  return (
    <div className={styles.serverStatus} data-status={server.status}>
      <p className={styles.status}>
        <span className={styles.dot} data-status={server.status} />
        {S.label}: {label}
        {server.status === 'ready' && server.latencyMs !== null && <span className={styles.mono}>{server.latencyMs} ms</span>}
        {server.status === 'down' && (
          <button type="button" className={styles.linkBtn} onClick={() => void ensureServer()}>{S.retry}</button>
        )}
      </p>
      {note && <p className={styles.hint}>{note}</p>}
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
      aria-label={F.browse}
      onClick={() => input.current?.click()}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.current?.click() } }}
      onDragOver={e => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0]) }}
    >
      <Upload size={28} />
      <strong>{F.drop}</strong>
      <span>{F.browse}</span>
      <small>{F.formats}</small>
      <small className={styles.privacy}>{F.privacy}</small>
      <input
        ref={input}
        type="file"
        accept="audio/*,.mp3,.wav,.flac,.m4a,.aac,.ogg,.opus"
        hidden
        onChange={e => { pick(e.target.files?.[0]); e.target.value = '' }}
      />
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
        {auris.recording ? <Square size={22} /> : <Mic size={24} />}
        <span>{auris.recording ? M.stop : M.start}</span>
      </button>
      <p className={styles.hint}>
        {auris.recording ? `${M.recording} ${secs} / ${auris.maxRecordMs / 1000} s` : M.hint}
      </p>
    </div>
  )
}

const Scope: React.FC<{ auris: AurisController }> = ({ auris }) => {
  const { t } = useLanguage()
  const A = t.aiDetection
  const { job } = auris
  const playback = usePlayback(job?.audioUrl ?? null)
  const signal = job?.signal?.visuals ? job.signal : null
  const active = isActive(job)
  const errorText = job?.stage === 'error' && job.error
    ? (A.errors as Record<string, string>)[job.error] ?? A.errors.internalError
    : null

  return (
    <section className={styles.scope} aria-live="polite" aria-busy={active}>
      <div className={styles.scopeBar}>
        <span className={styles.scopeName}>
          {job?.restored && <span className={styles.chip}>{A.scope.restored}</span>} {job?.label || A.scope.empty}
        </span>
        {signal && playback.available && (
          <PlayButton playing={playback.playing} onClick={playback.toggle} labels={{ play: A.scope.play, pause: A.scope.pause }} />
        )}
      </div>

      {signal ? (
        <div className={styles.views}>
          <div>
            <p className={styles.viewLabel}>{A.scope.waveform}</p>
            <Waveform peaks={signal.visuals.waveform} progress={playback.progress} onSeek={playback.seek} label={A.scope.seek} />
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
      ) : (
        <div className={styles.scopeIdle}>
          {active ? (
            <>
              <ScanTrace />
              <p>{A.wait.stages[job.stage as 'waking' | 'uploading' | 'processing']}</p>
            </>
          ) : errorText ? (
            <div className={styles.error} role="alert">
              <AlertTriangle size={20} />
              <p>{errorText}</p>
              <button type="button" className={styles.btnGhost} onClick={auris.reset}>{A.errors.tryAgain}</button>
            </div>
          ) : job?.stage === 'done' ? (
            <p>{A.scope.noVisuals}</p>
          ) : (
            <>
              {auris.recording ? <LiveMeter level={auris.micLevel} /> : <IdleTrace />}
              <p>{auris.recording ? A.mic.recording : A.scope.idle}</p>
            </>
          )}
        </div>
      )}
    </section>
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
    <section className={styles.recent} aria-labelledby="auris-recent">
      <div className={styles.recentHead}>
        <h2 id="auris-recent">{R.title}</h2>
        <Link href="/analysis-history">{R.all}</Link>
      </div>
      <ol>
        {entries.map(e => {
          const trained = isTrained(e.result)
          const p = aiProbability(e.result)
          const ai = trained ? e.result.isAIGenerated : p >= 0.5
          return (
            <li key={e.id}>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  openFromHistory(e.input, e.result, e.timestamp)
                  requestAnimationFrame(() => document.getElementById('auris-report')?.scrollIntoView({ behavior: 'smooth' }))
                }}
              >
                <span className={styles.recentVerdict} data-tone={ai ? 'ai' : 'human'}>{percent(language, p)}</span>
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
    </section>
  )
}

/** Rolling input level while the microphone records. */
const LiveMeter: React.FC<{ level: number }> = ({ level }) => {
  const [history, setHistory] = useState<number[]>(() => Array(96).fill(0))
  const [prevLevel, setPrevLevel] = useState(level)
  if (level !== prevLevel) {
    setPrevLevel(level)
    setHistory(h => [...h.slice(1), level])
  }
  return (
    <svg className={styles.idleTrace} viewBox="0 0 384 60" aria-hidden="true" preserveAspectRatio="none">
      {history.map((v, i) => {
        const hgt = Math.max(1.5, v * 56)
        return <rect key={i} x={i * 4} y={30 - hgt / 2} width={2.6} height={hgt} rx={1} className={styles.liveBar} />
      })}
    </svg>
  )
}

const tracePath = Array.from({ length: 101 }, (_, i) => {
  const x = i * 4
  const y = 30 + Math.sin(i * 0.45) * 9 * Math.exp(-(((i - 50) / 26) ** 2)) + Math.sin(i * 1.7) * 2
  return `${i ? 'L' : 'M'}${x},${y.toFixed(1)}`
}).join(' ')

/** Static trace so the empty scope reads as an instrument, not a blank box. */
const IdleTrace = () => (
  <svg className={styles.idleTrace} viewBox="0 0 400 60" aria-hidden="true" preserveAspectRatio="none">
    <path d={tracePath} />
  </svg>
)

/** The same trace with a sweep, while a job is in flight. */
const ScanTrace = () => (
  <svg className={`${styles.idleTrace} ${styles.scanTrace}`} viewBox="0 0 400 60" aria-hidden="true" preserveAspectRatio="none">
    <path d={tracePath} />
    <rect className={styles.scanBeam} x="0" y="0" width="60" height="60" />
  </svg>
)

export default AurisPage
