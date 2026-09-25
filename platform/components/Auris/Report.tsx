import React from 'react'
import { AlertTriangle, Download, RefreshCw, RotateCcw } from 'lucide-react'
import type { AnalysisResult, FeatureCategory, FeatureContribution, LayerStatus, TowerScores } from '@/hooks/analysisTypes'
import type { MeasureKey } from '@/hooks/auris/signal'
import type { AurisJob } from '@/hooks/auris/store'
import { AURIS_MODEL, DL_VOTERS, VOTER_AUC } from '@/config/auris-model'
import { useLanguage } from '@/context/LanguageContext'
import { aiProbability, clock, fill, isTrained, num, pct, percent, voteMissing } from '@/components/Auris/format'
import styles from '@/styles/pages/auris.module.css'

const MEASURE_ORDER: MeasureKey[] = [
  'spectralPeriodicity', 'bandwidthCutoff', 'flatnessVariation',
  'centroidVariation', 'loudnessRange', 'tempoDrift', 'stereoCorrelation',
]

const TOWER_ORDER = ['xai_ensemble', 'wav2vec2', 'vocals', 'clap', 'fst', 'local_features'] as const
type TowerKey = typeof TOWER_ORDER[number]

// Which server warning explains a missing tower.
const TOWER_WARNING: Partial<Record<TowerKey, string>> = {
  xai_ensemble: 'xai_unavailable',
  wav2vec2: 'wav2vec2_unavailable',
  vocals: 'vocal_analysis_unavailable',
  clap: 'clap_analysis_unavailable',
  fst: 'fst_analysis_unavailable',
}

const VOCAL_SCORES = [
  'pitchStabilityScore', 'vibratoRegularityScore', 'formantConsistencyScore', 'breathPatternScore', 'vocalTextureScore',
] as const

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

interface ReportProps {
  job: AurisJob & { result: AnalysisResult }
  onReset: () => void
  onRetryServer: (() => void) | undefined
}

export const Report: React.FC<ReportProps> = ({ job, onReset, onRetryServer }) => {
  const { t, language } = useLanguage()
  const A = t.aiDetection
  const L = A.report
  const r = job.result
  const trained = isTrained(r)
  const xai = r.xai
  const p = aiProbability(r)
  const threshold = xai?.threshold ?? 0.5
  const isAi = trained ? r.isAIGenerated : p >= 0.5
  const votes = xai?.modelVotes ?? []
  const liveVotes = votes.filter(v => !voteMissing(v))
  const aiVotes = liveVotes.filter(v => v.vote === 'ai').length
  const band = xai?.confidenceBand
    ? (language === 'en' ? xai.confidenceBand.labelEn : xai.confidenceBand.labelTr)
    : r.signal?.band ? (language === 'en' ? r.signal.band.labelEn : r.signal.band.labelTr) : null
  const meta = r.metaClassifier
  const metaTop = meta?.topFeatures[0]?.importance || 1
  const signal = r.signal
  const reason = job.serverError ? ((A.errors as Record<string, string>)[job.serverError] ?? A.errors.internalError) : ''

  const exportReport = () => {
    const { signal, ...rest } = r
    const readings = signal ? (({ visuals: _v, ...keep }) => keep)(signal) : undefined
    const payload = { ...rest, signal: readings, warnings: job.warnings, serverError: job.serverError, label: job.label }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `auris-${new Date(job.finishedAt ?? Date.now()).toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  const info = r.audioInfo
  const F = L.facts
  const facts: Array<[string, string]> = [
    [F.duration, clock(info.duration * 1000)],
    ...(info.analysedSec && info.analysedSec < info.duration - 1 ? [[F.analysed, `${Math.round(info.analysedSec)} s`] as [string, string]] : []),
    [F.format, (info.format || '—').toUpperCase()],
    ...(info.sampleRate ? [[F.sampleRate, `${num(language, info.sampleRate / 1000, 1)} kHz`] as [string, string]] : []),
    ...(info.bitrate ? [[F.bitrate, `${info.bitrate} kbps`] as [string, string]] : []),
    ...(info.channels ? [[F.channels, info.channels === 1 ? 'Mono' : 'Stereo'] as [string, string]] : []),
    ...(r.signal?.measurements ? [
      [F.bpm, `${Math.round(r.signal.measurements.bpm)} BPM`] as [string, string],
      [F.peak, `${num(language, r.signal.measurements.peakDb, 1)} dBFS`] as [string, string],
    ] : []),
    ...(trained ? [[F.serverTime, `${num(language, r.processingTime, 1)} s`] as [string, string]] : []),
    ...(job.finishedAt && !job.restored ? [[F.totalTime, `${num(language, (job.finishedAt - job.startedAt) / 1000, 1)} s`] as [string, string]] : []),
    [F.model, xai ? `${xai.bestModel} · ${r.modelVersion}` : r.modelVersion],
  ]

  return (
    <section className={styles.report} aria-labelledby="auris-report-title">
      <div className={styles.hero} data-verdict={isAi ? 'ai' : 'human'} data-source={trained ? 'trained' : 'signal'}>
        <div className={styles.heroMain}>
          <p className={styles.eyebrow}>{L.eyebrow} · <span className={styles.heroLabel}>{job.label}</span></p>
          <h2 id="auris-report-title" className={styles.verdictTitle}>
            {trained ? (isAi ? L.verdictAi : L.verdictHuman) : (isAi ? L.leanAi : L.leanHuman)}
          </h2>
          <p className={styles.chips}>
            <span className={styles.chip} data-tone={trained ? 'ok' : 'warn'}>
              {trained ? `${L.trained} · ${xai?.bestModel ?? r.decisionSource}` : L.signalOnly}
            </span>
            {band && <span className={styles.chip}>{L.band}: {band}</span>}
            {liveVotes.length > 0 && <span className={styles.chip}>{fill(L.consensus, { ai: aiVotes, n: liveVotes.length })}</span>}
          </p>

          <Gauge p={p} threshold={trained ? threshold : 0.5} labels={{ human: L.leanHuman, ai: L.leanAi, threshold: L.threshold }} language={language} />
          {trained && xai && <p className={styles.note}>{fill(L.thresholdNote, { t: num(language, threshold, 3) })}</p>}
          {!trained && r.signal?.lossySource && <p className={styles.note}>{L.lossyNote}</p>}
        </div>

        <div className={styles.heroSide}>
          <p className={styles.bigNum}>{language !== 'en' && <small>%</small>}<span>{pct(p)}</span>{language === 'en' && <small>%</small>}</p>
          <p className={styles.bigLabel}>{trained ? L.probability : L.signalScore}</p>
          <dl className={styles.facts}>
            {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
          <div className={styles.actions}>
            <button type="button" className={styles.btnGhost} onClick={exportReport}><Download size={16} /> {L.export}</button>
            <button type="button" className={styles.btnPrimary} onClick={onReset}><RotateCcw size={16} /> {L.again}</button>
          </div>
        </div>
      </div>

      {!trained && (
        <div className={styles.fallback} role="note">
          <AlertTriangle size={20} />
          <div>
            <strong>{L.fallbackTitle}</strong>
            <p>{fill(L.fallbackBody, { reason })}</p>
          </div>
          {onRetryServer && (
            <button type="button" className={styles.btnGhost} onClick={onRetryServer}><RefreshCw size={16} /> {L.retryServer}</button>
          )}
        </div>
      )}

      <div className={styles.panels}>
        {votes.length > 0 && <Votes votes={votes} best={xai?.bestModel ?? ''} threshold={threshold} language={language} />}
        {xai && <Why items={xai.topContributions} language={language} />}
        {xai && Object.keys(xai.allFeatures ?? {}).length > 0 && <Families all={xai.allFeatures} language={language} />}
        {trained && <Towers scores={r.towerScores ?? {}} warnings={job.warnings} layers={r.layers ?? {}} language={language} />}
        {r.metaClassifier && (
          <Panel title={L.meta.title} lead={L.meta.lead}>
            <div className={styles.metaHead}>
              <strong>{r.metaClassifier.isAIGenerated ? L.verdictAi : L.verdictHuman}</strong>
              <span className={styles.chip} data-tone={r.metaClassifier.isAIGenerated === r.isAIGenerated ? 'ok' : 'warn'}>
                {r.metaClassifier.isAIGenerated === r.isAIGenerated ? L.meta.agrees : L.meta.disagrees}
              </span>
            </div>
            <Bar value={r.metaClassifier.isAIGenerated ? r.metaClassifier.confidence : 1 - r.metaClassifier.confidence} mid={0.5} />
            <p className={styles.small}>{L.probability}: {percent(language, r.metaClassifier.isAIGenerated ? r.metaClassifier.confidence : 1 - r.metaClassifier.confidence)} · {r.metaClassifier.modelVersion}</p>
            {r.metaClassifier.topFeatures.length > 0 && (
              <>
                <p className={styles.subhead}>{L.meta.features}</p>
                <ul className={styles.rankList}>
                  {r.metaClassifier.topFeatures.slice(0, 6).map(f => (
                    <li key={f.feature}>
                      <span>{f.feature}</span>
                      <span className={styles.rankBar}><span style={{ width: `${(f.importance / metaTop) * 100}%` }} /></span>
                      <span className={styles.mono}>{num(language, f.importance, 3)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panel>
        )}
        {trained && <Vocals result={r} language={language} />}
        {signal?.contributions && (
          <Panel title={L.signal.title} lead={L.signal.lead} wide>
            <ol className={styles.measureList}>
              {MEASURE_ORDER.map(key => {
                const c = signal.contributions[key]
                const copy = A.measures[key]
                return (
                  <li key={key} className={styles.measure} data-direction={c.direction}>
                    <div className={styles.measureHead}>
                      <h4>{copy.label}</h4>
                      <span className={styles.measureValue}>{measureValue(key, c.value, language)}</span>
                    </div>
                    <div className={styles.meter} role="img" aria-label={`${copy.label}: ${pct(c.lean)}/100`}>
                      <div className={styles.meterFill} style={{ width: `${c.lean * 100}%` }} />
                      <div className={styles.meterMid} />
                    </div>
                    <p>{copy.desc}</p>
                    <span className={styles.weight}>{L.signal.weight} {percent(language, c.weight)}</span>
                  </li>
                )
              })}
            </ol>
          </Panel>
        )}
        {job.warnings.length > 0 && (
          <Panel title={L.warnings.title} wide>
            <ul className={styles.warnList}>
              {job.warnings.map(w => (
                <li key={w}>{(L.warnings as Record<string, string>)[w] ?? fill(L.warnings.unknown, { code: w })}</li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
    </section>
  )
}

// ── pieces ───────────────────────────────────────────────────────────

const Panel: React.FC<React.PropsWithChildren<{ title: string; lead?: string; wide?: boolean }>> = ({ title, lead, wide, children }) => (
  <section className={styles.panel} data-wide={wide ? 'true' : undefined}>
    <h3>{title}</h3>
    {lead && <p className={styles.panelLead}>{lead}</p>}
    {children}
  </section>
)

const Bar: React.FC<{ value: number; mid?: number; tone?: 'ai' | 'human' | undefined }> = ({ value, mid, tone }) => (
  <span className={styles.bar} data-tone={tone ?? (value >= (mid ?? 0.5) ? 'ai' : 'human')}>
    <span className={styles.barFill} style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    {mid !== undefined && <span className={styles.barTick} style={{ left: `${mid * 100}%` }} />}
  </span>
)

const Gauge: React.FC<{ p: number; threshold: number; labels: { human: string; ai: string; threshold: string }; language: string }> = ({ p, threshold, labels, language }) => (
  <div className={styles.gauge} role="img" aria-label={`${percent(language, p)} · ${labels.threshold} ${num(language, threshold, 2)}`}>
    <div className={styles.gaugeTrack}>
      <div className={styles.gaugeAiZone} style={{ left: `${threshold * 100}%` }} />
      <div className={styles.gaugeThreshold} style={{ left: `${threshold * 100}%` }}>
        <span>{labels.threshold} {num(language, threshold, 2)}</span>
      </div>
      <div className={styles.gaugeMark} style={{ left: `${p * 100}%` }} />
    </div>
    <div className={styles.gaugeEnds}><span>{labels.human}</span><span>{labels.ai}</span></div>
  </div>
)

const Votes: React.FC<{ votes: NonNullable<AnalysisResult['xai']>['modelVotes']; best: string; threshold: number; language: string }> = ({ votes, best, threshold, language }) => {
  const { t } = useLanguage()
  const V = t.aiDetection.report.votes
  return (
    <Panel title={V.title} lead={V.lead}>
      <ol className={styles.votes}>
        {votes.map(v => {
          const missing = voteMissing(v)
          const tick = v.name === best ? threshold : 0.5
          const auc = VOTER_AUC[v.name]
          return (
            <li key={v.name} data-missing={missing ? 'true' : undefined} data-best={v.name === best ? 'true' : undefined}>
              <span className={styles.voteName}>
                {v.name}
                <em>{DL_VOTERS.has(v.name) ? 'DL' : 'ML'}</em>
                {v.name === best && <em data-tone="best">{V.best}</em>}
              </span>
              {missing ? (
                <span className={styles.small}>{V.unavailable}</span>
              ) : (
                <Bar value={v.probability} mid={tick} tone={v.vote === 'ai' ? 'ai' : 'human'} />
              )}
              <span className={styles.mono}>{missing ? '—' : percent(language, v.probability)}</span>
              <span className={styles.voteAuc}>{auc ? num(language, auc, 3) : ''}</span>
            </li>
          )
        })}
      </ol>
    </Panel>
  )
}

const Diverging: React.FC<{ value: number; max: number }> = ({ value, max }) => {
  const w = max ? (Math.abs(value) / max) * 50 : 0
  return (
    <span className={styles.diverge}>
      <span className={styles.divergeFill} data-tone={value >= 0 ? 'ai' : 'human'} style={value >= 0 ? { left: '50%', width: `${w}%` } : { right: '50%', width: `${w}%` }} />
    </span>
  )
}

const Why: React.FC<{ items: FeatureContribution[]; language: string }> = ({ items, language }) => {
  const { t } = useLanguage()
  const W = t.aiDetection.report.why
  const shown = items.filter(c => c.direction !== 'neutral').slice(0, 8)
  const max = Math.max(...shown.map(c => Math.abs(c.shapValue)), 0)
  return (
    <Panel title={W.title} lead={W.lead}>
      {shown.length === 0 ? <p className={styles.small}>{W.none}</p> : (
        <>
          <div className={styles.divergeAxis}><span>{W.towardsHuman}</span><span>{W.towardsAi}</span></div>
          <ol className={styles.why}>
            {shown.map(c => (
              <li key={c.name} title={language === 'en' ? undefined : c.description}>
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
    </Panel>
  )
}

const Families: React.FC<{ all: Record<string, FeatureContribution>; language: string }> = ({ all }) => {
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
    <Panel title={Fm.title} lead={Fm.lead}>
      <ol className={styles.families}>
        {rows.map(([cat, e]) => (
          <li key={cat}>
            <span>{(Fm.categories as Record<string, string>)[cat] ?? cat} <em>{e.n}</em></span>
            <Diverging value={e.sum} max={max} />
          </li>
        ))}
      </ol>
    </Panel>
  )
}

const Towers: React.FC<{ scores: TowerScores; warnings: string[]; layers: Record<string, LayerStatus>; language: string }> = ({ scores, warnings, layers, language }) => {
  const { t } = useLanguage()
  const T = t.aiDetection.report.towers
  return (
    <Panel title={T.title} lead={T.lead}>
      <ol className={styles.towers}>
        {TOWER_ORDER.map(key => {
          const v = scores[key]
          const missing = typeof v !== 'number'
          const code = TOWER_WARNING[key]
          const warned = !!code && warnings.includes(code)
          return (
            <li key={key} data-missing={missing ? 'true' : undefined} data-warned={warned ? 'true' : undefined}>
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
    </Panel>
  )
}

const Vocals: React.FC<{ result: AnalysisResult; language: string }> = ({ result, language }) => {
  const { t } = useLanguage()
  const V = t.aiDetection.report.vocals
  const v = result.vocalAnalysis
  if (!v?.hasVocals) {
    return <Panel title={V.title}><p className={styles.small}>{V.none}</p></Panel>
  }
  const stats: Array<[string, string]> = [
    [V.pitchMean, `${num(language, v.pitchMeanHz, 0)} Hz`],
    [V.pitchStd, `${num(language, v.pitchStdCents, 0)} cent`],
    [V.vibratoRate, `${num(language, v.vibratoRateHz, 1)} Hz`],
    [V.vibratoExtent, `${num(language, v.vibratoExtentCents, 0)} cent`],
  ]
  return (
    <Panel title={V.title}>
      <div className={styles.metaHead}>
        <strong>{V.aiScore}</strong>
        <span className={styles.mono}>{percent(language, v.vocalAiScore)}</span>
      </div>
      <Bar value={v.vocalAiScore} mid={0.5} />
      <dl className={styles.statGrid}>
        {stats.map(([k, val]) => <div key={k}><dt>{k}</dt><dd>{val}</dd></div>)}
      </dl>
      <p className={styles.subhead}>{V.scoresLead}</p>
      <ul className={styles.rankList}>
        {VOCAL_SCORES.map(k => (
          <li key={k}>
            <span>{V.scores[k]}</span>
            <Bar value={v[k]} mid={0.5} />
            <span className={styles.mono}>{num(language, v[k], 2)}</span>
          </li>
        ))}
      </ul>
      {v.indicators.length > 0 && (
        <ul className={styles.tags}>{v.indicators.map(i => <li key={i}>{i}</li>)}</ul>
      )}
    </Panel>
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
