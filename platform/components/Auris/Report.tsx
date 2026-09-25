import React from 'react'
import { Download, RotateCcw } from 'lucide-react'
import type { AnalysisResult } from '@/hooks/analysisTypes'
import type { MeasureKey } from '@/hooks/auris/signal'
import { useLanguage } from '@/context/LanguageContext'
import styles from '@/styles/pages/auris.module.css'

const formatValue = (key: MeasureKey, v: number) => {
  switch (key) {
    case 'bandwidthCutoff': return `${(v / 1000).toFixed(1)} kHz`
    case 'loudnessRange': return `${v.toFixed(1)} dB`
    case 'tempoDrift': return `± ${v.toFixed(1)} BPM`
    default: return v.toFixed(2)
  }
}

const ORDER: MeasureKey[] = [
  'spectralPeriodicity', 'bandwidthCutoff', 'flatnessVariation',
  'centroidVariation', 'loudnessRange', 'tempoDrift', 'stereoCorrelation',
]

interface ReportProps {
  result: AnalysisResult
  onReset: () => void
}

export const Report: React.FC<ReportProps> = ({ result, onReset }) => {
  const { t, language } = useLanguage()
  const L = t.aiDetection.report
  const M = t.aiDetection.measures
  const signal = result.signal
  const score = signal ? signal.score : (result.isAIGenerated ? result.confidence : 1 - result.confidence)
  const bandLabel = signal ? (language === 'en' ? signal.band.labelEn : signal.band.labelTr) : null
  const pct = Math.round(score * 100)
  const lean = score >= 0.5 ? L.leanAi : L.leanHuman

  const exportReport = () => {
    const { visuals: _v, ...rest } = signal ?? { visuals: null }
    const blob = new Blob([JSON.stringify({ ...result, signal: signal ? rest : undefined }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `auris-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  const info = result.audioInfo
  const facts: Array<[string, string]> = [
    [L.duration, `${Math.floor(info.duration / 60)}:${String(Math.round(info.duration % 60)).padStart(2, '0')}`],
    [L.format, info.format],
    [L.channels, info.channels === 1 ? 'Mono' : 'Stereo'],
    ...(signal ? [
      [L.bpm, `${Math.round(signal.measurements.bpm)}`] as [string, string],
      [L.peak, `${signal.measurements.peakDb.toFixed(1)} dBFS`] as [string, string],
      [L.crest, `${signal.measurements.crestDb.toFixed(1)} dB`] as [string, string],
      [L.analysed, `${Math.round(signal.measurements.analysedSeconds)} s`] as [string, string],
    ] : []),
    [L.time, `${result.processingTime.toFixed(1)} s`],
  ]

  return (
    <section className={styles.report} aria-labelledby="auris-report-title">
      <div className={styles.verdict}>
        <p className={styles.eyebrow}>{L.title}</p>
        <h2 id="auris-report-title" className={styles.verdictScore}>
          <span>{pct}</span><small>/100</small>
        </h2>
        <p className={styles.verdictLean}>{bandLabel ? `${bandLabel} · ${lean}` : lean}</p>
        <div className={styles.scale} aria-hidden="true">
          <div className={styles.scaleMid} />
          <div className={styles.scaleMark} style={{ left: `${pct}%` }} />
          <span>{L.leanHuman}</span>
          <span>{L.leanAi}</span>
        </div>
        <p className={styles.verdictNote}>{L.scoreHint}</p>
        {signal?.lossySource && <p className={styles.verdictNote}>{L.lossyNote}</p>}
        <dl className={styles.facts}>
          {facts.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        <div className={styles.actions}>
          <button type="button" className={styles.btnGhost} onClick={exportReport}>
            <Download size={16} /> {L.export}
          </button>
          <button type="button" className={styles.btnPrimary} onClick={onReset}>
            <RotateCcw size={16} /> {L.again}
          </button>
        </div>
      </div>

      <div className={styles.measures}>
        <p className={styles.eyebrow}>{L.measurements}</p>
        {signal ? (
          <ol className={styles.measureList}>
            {ORDER.map(key => {
              const c = signal.contributions[key]
              const copy = M[key]
              return (
                <li key={key} className={styles.measure} data-direction={c.direction}>
                  <div className={styles.measureHead}>
                    <h3>{copy.label}</h3>
                    <span className={styles.measureValue}>{formatValue(key, c.value)}</span>
                  </div>
                  <div className={styles.meter} aria-label={`${copy.label}: ${Math.round(c.lean * 100)}/100`} role="img">
                    <div className={styles.meterFill} style={{ width: `${c.lean * 100}%` }} />
                    <div className={styles.meterMid} />
                  </div>
                  <p>{copy.desc}</p>
                  <span className={styles.weight}>{L.weight} {Math.round(c.weight * 100)}%</span>
                </li>
              )
            })}
          </ol>
        ) : (
          <p className={styles.verdictNote}>{L.remoteNote} {result.modelVersion}</p>
        )}
      </div>
    </section>
  )
}
