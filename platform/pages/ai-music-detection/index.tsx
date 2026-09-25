// AURIS — measures a track for the traces generative audio models leave.
// Files and microphone takes are analysed in the browser (hooks/auris);
// links go through the backend's /api/analyze, which runs the same algorithm.

import React, { useCallback, useRef, useState } from 'react'
import type { NextPage } from 'next'
import { AlertTriangle, FileAudio, Link as LinkIcon, Mic, Square, Upload } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { PlayButton, ResidualPlot, Spectrogram, Waveform, usePlayback } from '@/components/Auris/SignalViews'
import { Report } from '@/components/Auris/Report'
import { useLanguage } from '@/context/LanguageContext'
import { useAuris, type AurisController } from '@/hooks/auris/useAuris'
import styles from '@/styles/pages/auris.module.css'

type Tab = 'file' | 'url' | 'mic'

const AurisPage: NextPage = () => {
  const { t } = useLanguage()
  const A = t.aiDetection
  const auris = useAuris()
  const [tab, setTab] = useState<Tab>('file')

  const changeTab = (next: Tab) => {
    if (next === tab) {return}
    auris.reset()
    setTab(next)
  }

  return (
    <MainLayout title={A.meta.title} description={A.meta.description} keywords={A.meta.keywords}>
      <div className={styles.page}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>{A.intro.eyebrow}</p>
          <h1 className={styles.title}>AURIS</h1>
          <p className={styles.lead}>{A.intro.lead}</p>
          <p className={styles.status}>
            <span className={styles.dot} data-on="true" /> {A.intro.localNote}
            <span className={styles.sep} />
            <span className={styles.dot} data-on={auris.hasBackend ? 'true' : 'false'} />
            {auris.hasBackend ? A.intro.serverOn : A.intro.serverOff}
          </p>
        </header>

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
                  onClick={() => changeTab(id)}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
            <div id="auris-source" role="tabpanel" aria-labelledby={`auris-tab-${tab}`} className={styles.sourcePanel}>
              {tab === 'file' && <FileSource auris={auris} />}
              {tab === 'url' && <UrlSource auris={auris} />}
              {tab === 'mic' && <MicSource auris={auris} />}
            </div>
          </aside>

          <Scope auris={auris} />
        </div>

        {auris.result && <Report result={auris.result} onReset={auris.reset} />}

        <section className={styles.method} aria-labelledby="auris-method">
          <div>
            <p className={styles.eyebrow}>{A.method.eyebrow}</p>
            <h2 id="auris-method">{A.method.title}</h2>
            <p>{A.method.lead}</p>
          </div>
          <div className={styles.methodCols}>
            <div>
              <h3>{A.method.stepsTitle}</h3>
              <ol>
                <li>{A.method.step1}</li>
                <li>{A.method.step2}</li>
                <li>{A.method.step3}</li>
                <li>{A.method.step4}</li>
              </ol>
            </div>
            <div>
              <h3>{A.method.limitsTitle}</h3>
              <ul>
                <li>{A.method.limit1}</li>
                <li>{A.method.limit2}</li>
                <li>{A.method.limit3}</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
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
  const busy = auris.phase === 'remote'
  return (
    <form className={styles.urlForm} onSubmit={e => { e.preventDefault(); void auris.analyseUrl(value) }}>
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
      <button type="submit" className={styles.btnPrimary} disabled={!value.trim() || busy}>
        {busy ? t.aiDetection.phase.remote : U.submit}
      </button>
      <p className={styles.hint}>{auris.hasBackend ? U.hint : U.needsServer}</p>
    </form>
  )
}

const MicSource: React.FC<{ auris: AurisController }> = ({ auris }) => {
  const { t } = useLanguage()
  const M = t.aiDetection.mic
  const recording = auris.phase === 'recording'
  const secs = Math.floor(auris.micElapsed / 1000)
  return (
    <div className={styles.mic}>
      <button
        type="button"
        className={styles.micButton}
        data-recording={recording}
        onClick={recording ? auris.stopRecording : () => void auris.startRecording()}
        style={{ ['--level' as string]: auris.micLevel }}
      >
        {recording ? <Square size={22} /> : <Mic size={24} />}
        <span>{recording ? M.stop : M.start}</span>
      </button>
      <p className={styles.hint}>
        {recording ? `${M.recording} ${secs} / ${auris.maxRecordMs / 1000} s` : M.hint}
      </p>
    </div>
  )
}

const Scope: React.FC<{ auris: AurisController }> = ({ auris }) => {
  const { t } = useLanguage()
  const A = t.aiDetection
  const playback = usePlayback(auris.audioUrl)
  const signal = auris.result?.signal
  const busy = ['decoding', 'measuring', 'remote'].includes(auris.phase)

  const errorText = auris.error ? (A.errors as Record<string, string>)[auris.error] ?? A.errors.internalError : null

  return (
    <section className={styles.scope} aria-live="polite" aria-busy={busy}>
      <div className={styles.scopeBar}>
        <span className={styles.scopeName}>{auris.sourceName === 'mic' ? A.mic.take : auris.sourceName || A.scope.empty}</span>
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
          {busy ? (
            <>
              <div className={styles.progress}>
                <div style={{ width: `${Math.round((auris.phase === 'measuring' ? 0.15 + auris.progress * 0.85 : auris.phase === 'decoding' ? 0.08 : 0.5) * 100)}%` }} />
              </div>
              <p>{A.phase[auris.phase as 'decoding' | 'measuring' | 'remote']}</p>
            </>
          ) : errorText ? (
            <div className={styles.error} role="alert">
              <AlertTriangle size={20} />
              <p>{errorText}</p>
              <button type="button" className={styles.btnGhost} onClick={auris.reset}>{A.errors.tryAgain}</button>
            </div>
          ) : auris.result ? (
            <p>{A.report.remoteNote} {auris.result.modelVersion}</p>
          ) : (
            <>
              {auris.phase === 'recording' ? <LiveMeter level={auris.micLevel} /> : <IdleTrace />}
              <p>{auris.phase === 'recording' ? A.mic.recording : A.scope.idle}</p>
            </>
          )}
        </div>
      )}
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

/** Static trace so the empty scope reads as an instrument, not a blank box. */
const IdleTrace = () => (
  <svg className={styles.idleTrace} viewBox="0 0 400 60" aria-hidden="true" preserveAspectRatio="none">
    <path d={Array.from({ length: 101 }, (_, i) => {
      const x = i * 4
      const y = 30 + Math.sin(i * 0.45) * 9 * Math.exp(-(((i - 50) / 26) ** 2)) + Math.sin(i * 1.7) * 2
      return `${i ? 'L' : 'M'}${x},${y.toFixed(1)}`
    }).join(' ')} />
  </svg>
)

export default AurisPage
