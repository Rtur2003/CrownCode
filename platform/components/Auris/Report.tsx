import React, { useState } from 'react'
import { AlertTriangle, ArrowDown, Download, RefreshCw, RotateCcw, Share2 } from 'lucide-react'
import type { AnalysisResult, FeatureCategory, FeatureContribution, LayerStatus, TowerScores } from '@/hooks/analysisTypes'
import type { MeasureKey } from '@/hooks/auris/signal'
import type { AurisJob } from '@/hooks/auris/store'
import { AURIS_MODEL, DL_VOTERS, VOTER_AUC } from '@/config/auris-model'
import { useLanguage } from '@/context/LanguageContext'
import { aiProbability, clock, fill, isTrained, num, pct, percent, voteMissing } from '@/components/Auris/format'
import styles from '@/styles/pages/auris.module.css'

export type DoneJob = AurisJob & { result: AnalysisResult }

const MEASURE_ORDER: MeasureKey[] = [
  'spectralPeriodicity', 'bandwidthCutoff', 'flatnessVariation',
  'centroidVariation', 'loudnessRange', 'tempoDrift', 'stereoCorrelation',
]

const TOWER_ORDER = ['xai_ensemble', 'wav2vec2', 'vocals', 'clap', 'fst', 'local_features'] as const

const VOCAL_SCORES = [
  'pitchStabilityScore', 'vibratoRegularityScore', 'formantConsistencyScore', 'breathPatternScore', 'vocalTextureScore',
] as const

/** What the headline says, whichever source produced the result. */
export const summarize = (r: AnalysisResult) => {
  const trained = isTrained(r)
  // Only the calibrated LightGBM result counts as the model's verdict; a
  // server run without it fell back to combining the other layers' scores.
  const modelVerdict = trained && !!r.xai
  const p = aiProbability(r)
  const threshold = r.xai?.threshold ?? null
  const isAi = trained ? r.isAIGenerated : p >= 0.5
  const liveVotes = (r.xai?.modelVotes ?? []).filter(v => !voteMissing(v))
  const aiVotes = liveVotes.filter(v => v.vote === 'ai').length
  return { trained, modelVerdict, p, threshold, isAi, liveVotes, aiVotes }
}

const measureValue = (key: MeasureKey, v: number, language: string) => {
  switch (key) {
    case 'bandwidthCutoff': return `${num(language, v / 1000, 1)} kHz`
    case 'loudnessRange': return `${num(language, v, 1)} dB`
    case 'tempoDrift': return `± ${num(language, v, 1)} BPM`
    default: return num(language, v, 2)
  }
}

/** Raw feature values span Hz to ratios; keep them readable. */
const featureValue = (v: number, language: string) => {
  const a = Math.abs(v)
  if (a >= 1000) {return Math.round(v).toLocaleString(language === 'en' ? 'en-US' : 'tr-TR')}
  if (a >= 100) {return num(language, v, 0)}
  if (a >= 1) {return num(language, v, 2)}
  return num(language, v, 3)
}

const signed = (v: number, language: string, digits = 1) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${num(language, Math.abs(v), digits)}`

const exportJson = (job: DoneJob) => {
  const { signal, ...rest } = job.result
  const readings = signal ? (({ visuals: _v, ...keep }) => keep)(signal) : undefined
  const payload = { ...rest, signal: readings, warnings: job.warnings, serverError: job.serverError, label: job.label }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `auris-${new Date(job.finishedAt ?? Date.now()).toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

// ── the stage panel once a result is in ─────────────────────────────

interface VerdictProps {
  job: DoneJob
  onReset: () => void
  onRetryServer: (() => void) | undefined
  onOpenReport: () => void
}

export const Verdict: React.FC<VerdictProps> = ({ job, onReset, onRetryServer, onOpenReport }) => {
  const { t, language } = useLanguage()
  const A = t.aiDetection
  const L = A.report
  const r = job.result
  const s = summarize(r)
  const band = r.xai?.confidenceBand
    ? (language === 'en' ? r.xai.confidenceBand.labelEn : r.xai.confidenceBand.labelTr)
    : null
  const reason = job.serverError ? ((A.errors as Record<string, string>)[job.serverError] ?? A.errors.internalError) : ''
  const [sharing, setSharing] = useState<'idle' | 'busy' | 'saved'>('idle')
  const verdictText = s.modelVerdict ? (s.isAi ? L.verdictAi : L.verdictHuman) : (s.isAi ? L.leanAi : L.leanHuman)

  const share = async () => {
    setSharing('busy')
    try {
      const { drawCard, shareCard } = await import('@/components/Auris/shareCard')
      const url = `hasan-arthur-altuntas.xyz${language === 'en' ? '/en' : ''}/ai-music-detection`
      const blob = await drawCard({
        language,
        label: job.label,
        verdict: verdictText,
        probability: s.p,
        probabilityLabel: s.modelVerdict ? L.probability : L.signalScore,
        modelLine: s.modelVerdict ? `LightGBM · ${fill(L.consensus, { ai: s.aiVotes, n: s.liveVotes.length })}` : L.signalOnly,
        threshold: s.modelVerdict ? s.threshold : null,
        isAi: s.isAi,
        note: L.shareNote,
        url,
      })
      const outcome = await shareCard(blob, 'auris-sonuc.png', fill(L.shareText, { p: percent(language, s.p) }), `https://${url}`)
      setSharing(outcome === 'saved' ? 'saved' : 'idle')
    } catch {
      setSharing('idle')
    }
  }

  return (
    <div className={styles.verdict} data-verdict={s.isAi ? 'ai' : 'human'} data-source={s.modelVerdict ? 'model' : 'other'}>
      <p className={styles.verdictFile}>{job.label}</p>
      <h2 id="auris-verdict" className={styles.verdictTitle}>
        {verdictText}
      </h2>

      <div className={styles.reading}>
        <p className={styles.bigNum}>
          {language !== 'en' && <small>%</small>}<span>{pct(s.p)}</span>{language === 'en' && <small>%</small>}
        </p>
        <div className={styles.readingText}>
          <p>{s.modelVerdict ? L.probability : L.signalScore}</p>
          <p className={styles.readingMeta}>{s.modelVerdict ? `${L.trained}: ${r.xai?.bestModel}` : s.trained ? L.fusionOnly : L.signalOnly}</p>
          {band && <p className={styles.readingMeta}>{L.band}: {band}</p>}
          {s.liveVotes.length > 0 && <p className={styles.readingMeta}>{fill(L.consensus, { ai: s.aiVotes, n: s.liveVotes.length })}</p>}
        </div>
      </div>

      <Gauge p={s.p} threshold={s.modelVerdict ? s.threshold : null} language={language} labels={{ human: L.leanHuman, ai: L.leanAi, threshold: L.threshold }} />
      {s.modelVerdict && s.threshold !== null && (
        <p className={styles.note}>{fill(L.thresholdNote, { t: num(language, s.threshold, 3) })}</p>
      )}

      {!s.trained && (
        <div className={styles.fallback} role="note">
          <AlertTriangle size={18} />
          <div>
            <strong>{L.fallbackTitle}</strong>
            <p>{fill(L.fallbackBody, { reason })}</p>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.btnPrimary} onClick={onOpenReport}><ArrowDown size={16} /> {L.openReport}</button>
        <button type="button" className={styles.btnGhost} onClick={() => void share()} disabled={sharing === 'busy'} aria-live="polite">
          <Share2 size={16} /> {sharing === 'saved' ? L.shareSaved : L.share}
        </button>
        {onRetryServer && (
          <button type="button" className={styles.btnGhost} onClick={onRetryServer}><RefreshCw size={16} /> {L.retryServer}</button>
        )}
        <button type="button" className={styles.btnGhost} onClick={onReset}><RotateCcw size={16} /> {L.again}</button>
      </div>
    </div>
  )
}

const Gauge: React.FC<{ p: number; threshold: number | null; labels: { human: string; ai: string; threshold: string }; language: string }> = ({ p, threshold, labels, language }) => (
  <div className={styles.gauge} role="img" aria-label={`${percent(language, p)}${threshold !== null ? ` · ${labels.threshold} ${num(language, threshold, 2)}` : ''}`}>
    <div className={styles.gaugeTrack}>
      {threshold !== null && (
        <div className={styles.gaugeThreshold} style={{ left: `${threshold * 100}%` }}>
          <span>{labels.threshold} {num(language, threshold, 2)}</span>
        </div>
      )}
      <div className={styles.gaugeMark} style={{ left: `${p * 100}%` }} />
    </div>
    <div className={styles.gaugeEnds}><span>{labels.human}</span><span>{labels.ai}</span></div>
  </div>
)

// ── the report below the stage ──────────────────────────────────────

export const ReportLog: React.FC<{ job: DoneJob }> = ({ job }) => {
  const { t, language } = useLanguage()
  const L = t.aiDetection.report
  const r = job.result
  const s = summarize(r)
  const info = r.audioInfo
  const F = L.facts
  const facts: Array<[string, string]> = [
    [F.duration, clock(info.duration * 1000)],
    ...(info.analysedSec && info.analysedSec < info.duration - 1 ? [[F.analysed, `${Math.round(info.analysedSec)} s`] as [string, string]] : []),
    [F.format, (info.format || '—').toUpperCase()],
    ...(info.sampleRate ? [[F.sampleRate, `${num(language, info.sampleRate / 1000, 1)} kHz`] as [string, string]] : []),
    ...(info.bitrate ? [[F.bitrate, `${info.bitrate} kbps`] as [string, string]] : []),
    ...(info.channels ? [[F.channels, info.channels === 1 ? 'Mono' : 'Stereo'] as [string, string]] : []),
    ...(r.signal?.measurements ? [[F.bpm, `${Math.round(r.signal.measurements.bpm)} BPM`] as [string, string]] : []),
    ...(s.trained ? [[F.serverTime, `${num(language, r.processingTime, 1)} s`] as [string, string]] : []),
    ...(job.finishedAt && !job.restored ? [[F.totalTime, `${num(language, (job.finishedAt - job.startedAt) / 1000, 1)} s`] as [string, string]] : []),
    [F.model, r.xai ? r.xai.bestModel : r.modelVersion],
  ]
  const votes = r.xai?.modelVotes ?? []
  const meta = r.metaClassifier
  const metaTop = meta?.topFeatures[0]?.importance || 1
  const signal = r.signal
  const when = new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(job.finishedAt ?? job.startedAt)

  return (
    <>
      <Stop title={L.title} lead={`${job.label} · ${when}`} id="auris-report">
        <dl className={styles.facts}>
          {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
        <button type="button" className={styles.linkBtn} onClick={() => exportJson(job)}><Download size={15} /> {L.export}</button>
      </Stop>

      {votes.length > 0 && r.xai && <Votes votes={votes} best={r.xai.bestModel} threshold={r.xai.threshold} language={language} />}
      {r.xai && <Why items={r.xai.topContributions} language={language} />}
      {r.xai && Object.keys(r.xai.allFeatures ?? {}).length > 0 && <Families all={r.xai.allFeatures} />}
      {s.trained && <Towers scores={r.towerScores ?? {}} layers={r.layers ?? {}} language={language} />}
      {meta && (
        <Stop title={L.meta.title} lead={L.meta.lead}>
          <div className={styles.metaHead}>
            <strong>{meta.isAIGenerated ? L.verdictAi : L.verdictHuman}</strong>
            <span className={styles.chip} data-tone={meta.isAIGenerated === r.isAIGenerated ? 'ok' : 'warn'}>
              {meta.isAIGenerated === r.isAIGenerated ? L.meta.agrees : L.meta.disagrees}
            </span>
          </div>
          <Bar value={meta.isAIGenerated ? meta.confidence : 1 - meta.confidence} mid={0.5} />
          <p className={styles.small}>{L.probability}: {percent(language, meta.isAIGenerated ? meta.confidence : 1 - meta.confidence)}</p>
          {meta.topFeatures.length > 0 && (
            <>
              <h4 className={styles.subhead}>{L.meta.features}</h4>
              <ul className={styles.rankList}>
                {meta.topFeatures.slice(0, 6).map(f => (
                  <li key={f.feature}>
                    <span>{f.feature}</span>
                    <span className={styles.rankBar}><span style={{ transform: `scaleX(${f.importance / metaTop})` }} /></span>
                    <span className={styles.mono}>{num(language, f.importance, 3)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Stop>
      )}
      {s.trained && <Vocals result={r} language={language} />}
      {signal?.contributions && (
        <Stop title={L.signal.title} lead={L.signal.lead}>
          {signal.lossySource && <p className={styles.note}>{L.lossyNote}</p>}
          <ol className={styles.measureList}>
            {MEASURE_ORDER.map(key => {
              const c = signal.contributions[key]
              const copy = t.aiDetection.measures[key]
              return (
                <li key={key} className={styles.measure} data-direction={c.direction}>
                  <div className={styles.measureHead}>
                    <h4>{copy.label}</h4>
                    <span className={styles.mono}>{measureValue(key, c.value, language)}</span>
                  </div>
                  <Bar value={c.lean} mid={0.5} tone={c.direction === 'towards_ai' ? 'ai' : c.direction === 'towards_human' ? 'human' : 'neutral'} />
                  <p>{copy.desc}</p>
                </li>
              )
            })}
          </ol>
        </Stop>
      )}
      {job.warnings.length > 0 && (
        <Stop title={L.warnings.title}>
          <ul className={styles.warnList}>
            {job.warnings.map(w => (
              <li key={w}>{(L.warnings as Record<string, string>)[w] ?? fill(L.warnings.unknown, { code: w })}</li>
            ))}
          </ul>
        </Stop>
      )}
    </>
  )
}

// ── pieces ───────────────────────────────────────────────────────────

/** One stop on the route line: title and note on the left, the reading on the right. */
export const Stop: React.FC<React.PropsWithChildren<{ title: string; lead?: string | undefined; id?: string }>> = ({ title, lead, id, children }) => (
  <section className={styles.stop} id={id} aria-label={title}>
    <div className={styles.stopHead}>
      <h3>{title}</h3>
      {lead && <p>{lead}</p>}
    </div>
    <div className={styles.stopBody}>{children}</div>
  </section>
)

const Bar: React.FC<{ value: number; mid?: number; tone?: 'ai' | 'human' | 'neutral' | undefined }> = ({ value, mid, tone }) => (
  <span className={styles.bar} data-tone={tone ?? (value >= (mid ?? 0.5) ? 'ai' : 'human')}>
    <span className={styles.barFill} style={{ transform: `scaleX(${Math.max(0, Math.min(1, value))})` }} />
    {mid !== undefined && <span className={styles.barTick} style={{ left: `${mid * 100}%` }} />}
  </span>
)

const Votes: React.FC<{ votes: NonNullable<AnalysisResult['xai']>['modelVotes']; best: string; threshold: number; language: string }> = ({ votes, best, threshold, language }) => {
  const { t } = useLanguage()
  const V = t.aiDetection.report.votes
  return (
    <Stop title={V.title} lead={V.lead}>
      <ol className={styles.votes}>
        {votes.map(v => {
          const missing = voteMissing(v)
          const auc = VOTER_AUC[v.name]
          return (
            <li key={v.name} data-missing={missing ? 'true' : undefined} data-best={v.name === best ? 'true' : undefined}>
              <span className={styles.voteName}>
                {v.name}
                <em>{DL_VOTERS.has(v.name) ? 'DL' : 'ML'}</em>
                {v.name === best && <em data-tone="best">{V.best}</em>}
              </span>
              {missing
                ? <span className={styles.small}>{V.unavailable}</span>
                : <Bar value={v.probability} mid={v.name === best ? threshold : 0.5} tone={v.vote === 'ai' ? 'ai' : 'human'} />}
              <span className={styles.mono}>{missing ? '—' : percent(language, v.probability)}</span>
              <span className={styles.voteAuc}>{auc ? num(language, auc, 3) : ''}</span>
            </li>
          )
        })}
      </ol>
    </Stop>
  )
}

const Diverging: React.FC<{ value: number; max: number }> = ({ value, max }) => {
  const w = max ? Math.abs(value) / max : 0
  return (
    <span className={styles.diverge}>
      <span className={styles.divergeFill} data-tone={value >= 0 ? 'ai' : 'human'} style={{ transform: `scaleX(${w})` }} />
    </span>
  )
}

const Why: React.FC<{ items: FeatureContribution[]; language: string }> = ({ items, language }) => {
  const { t } = useLanguage()
  const W = t.aiDetection.report.why
  const shown = items.filter(c => c.direction !== 'neutral').slice(0, 8)
  const max = Math.max(...shown.map(c => Math.abs(c.shapValue)), 0)
  return (
    <Stop title={W.title} lead={W.lead}>
      {shown.length === 0 ? <p className={styles.small}>{W.none}</p> : (
        <>
          <div className={styles.divergeAxis} aria-hidden="true"><span>{W.towardsHuman}</span><span>{W.towardsAi}</span></div>
          <ol className={styles.why}>
            {shown.map(c => (
              <li key={c.name}>
                <div className={styles.whyHead}>
                  <span>{language === 'en' ? c.labelEn : c.label}</span>
                  <span className={styles.mono}>{featureValue(c.value, language)} · z {signed(c.zScore, language)}</span>
                </div>
                <Diverging value={c.shapValue} max={max} />
                {language !== 'en' && c.description && <p className={styles.whyDesc}>{c.description}</p>}
              </li>
            ))}
          </ol>
        </>
      )}
    </Stop>
  )
}

const Families: React.FC<{ all: Record<string, FeatureContribution> }> = ({ all }) => {
  const { t } = useLanguage()
  const Fm = t.aiDetection.report.families
  const sums = new Map<FeatureCategory, { sum: number; n: number }>()
  for (const c of Object.values(all)) {
    const e = sums.get(c.category) ?? { sum: 0, n: 0 }
    e.sum += c.shapValue
    e.n += 1
    sums.set(c.category, e)
  }
  const rows = [...sums.entries()].sort((a, b) => Math.abs(b[1].sum) - Math.abs(a[1].sum))
  const max = Math.max(...rows.map(([, e]) => Math.abs(e.sum)), 0)
  return (
    <Stop title={Fm.title} lead={Fm.lead}>
      <ol className={styles.families}>
        {rows.map(([cat, e]) => (
          <li key={cat}>
            <span>{(Fm.categories as Record<string, string>)[cat] ?? cat} <em>{e.n}</em></span>
            <Diverging value={e.sum} max={max} />
          </li>
        ))}
      </ol>
    </Stop>
  )
}

const Towers: React.FC<{ scores: TowerScores; layers: Record<string, LayerStatus>; language: string }> = ({ scores, layers, language }) => {
  const { t } = useLanguage()
  const T = t.aiDetection.report.towers
  return (
    <Stop title={T.title} lead={T.lead}>
      <ol className={styles.towers}>
        {TOWER_ORDER.map(key => {
          const v = scores[key]
          const missing = typeof v !== 'number'
          return (
            <li key={key} data-missing={missing ? 'true' : undefined}>
              <div className={styles.towerHead}>
                <span>{T.names[key]}</span>
                <span className={styles.mono}>{missing ? T.missing : num(language, v, 2)}</span>
              </div>
              {!missing && <Bar value={v} mid={0.5} />}
              <p className={styles.small}>
                {key === 'clap' && layers.clap?.mode === 'heuristic_spectral' ? T.clapHeuristic : T.notes[key]}
              </p>
            </li>
          )
        })}
      </ol>
    </Stop>
  )
}

const Vocals: React.FC<{ result: AnalysisResult; language: string }> = ({ result, language }) => {
  const { t } = useLanguage()
  const V = t.aiDetection.report.vocals
  const v = result.vocalAnalysis
  if (!v?.hasVocals) {
    return <Stop title={V.title}><p className={styles.small}>{V.none}</p></Stop>
  }
  const stats: Array<[string, string]> = [
    [V.pitchMean, `${num(language, v.pitchMeanHz, 0)} Hz`],
    [V.pitchStd, `${num(language, v.pitchStdCents, 0)} cent`],
    [V.vibratoRate, `${num(language, v.vibratoRateHz, 1)} Hz`],
    [V.vibratoExtent, `${num(language, v.vibratoExtentCents, 0)} cent`],
  ]
  return (
    <Stop title={V.title} lead={V.scoresLead}>
      <div className={styles.metaHead}>
        <strong>{V.aiScore}</strong>
        <span className={styles.mono}>{percent(language, v.vocalAiScore)}</span>
      </div>
      <Bar value={v.vocalAiScore} mid={0.5} />
      <dl className={styles.statGrid}>
        {stats.map(([k, val]) => <div key={k}><dt>{k}</dt><dd>{val}</dd></div>)}
      </dl>
      <ul className={styles.rankList}>
        {VOCAL_SCORES.map(k => (
          <li key={k}>
            <span>{V.scores[k]}</span>
            <Bar value={v[k]} mid={0.5} />
            <span className={styles.mono}>{num(language, v[k], 2)}</span>
          </li>
        ))}
      </ul>
    </Stop>
  )
}

/** The model's cross-validated numbers, for the method section. */
export const ModelMetrics: React.FC = () => {
  const { t, language } = useLanguage()
  const M = t.aiDetection.method.metrics
  const rows: Array<[string, string]> = [
    [M.accuracy, percent(language, AURIS_MODEL.accuracy, 1)],
    [M.precision, percent(language, AURIS_MODEL.precision, 1)],
    [M.recall, percent(language, AURIS_MODEL.recall, 1)],
    [M.f1, num(language, AURIS_MODEL.f1, 3)],
    [M.auc, num(language, AURIS_MODEL.rocAuc, 3)],
    [M.threshold, num(language, AURIS_MODEL.threshold, 3)],
  ]
  return (
    <dl className={styles.metrics}>
      {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
    </dl>
  )
}
