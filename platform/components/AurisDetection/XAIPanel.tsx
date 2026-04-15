/**
 * XAI Panel — Rich explainable analysis UI
 *
 * Displays:
 *  - SHAP waterfall (top 10 feature contributions)
 *  - Feature radar (category-grouped)
 *  - Model ensemble votes
 *  - Confidence band with CI and threshold
 *  - Full 49-feature inspector (expandable)
 */

import { motion } from 'motion/react'
import { useState, useMemo } from 'react'
import {
  TrendingUp, TrendingDown, Minus,
  Target, Users, Microscope, ChevronRight,
  AlertCircle, CheckCircle2,
} from 'lucide-react'
import type {
  XAIExplanation,
  FeatureContribution,
  FeatureCategory,
  ModelVote,
  ConfidenceBand as ConfidenceBandType,
} from '../../hooks/analysisTypes'
import styles from '../../styles/pages/xai-panel.module.css'

interface XAIPanelProps {
  xai: XAIExplanation
  locale?: 'tr' | 'en'
}

/* =========================================================================
   Confidence Band Indicator
   ======================================================================= */

function ConfidenceBandIndicator({ band, probability, threshold, locale }: {
  band: ConfidenceBandType
  probability: number
  threshold: number
  locale: 'tr' | 'en'
}) {
  const label = locale === 'tr' ? band.labelTr : band.labelEn
  const percent = Math.round(probability * 100)
  const lowerPct = Math.round(band.lowerBound * 100)
  const upperPct = Math.round(band.upperBound * 100)
  const thresholdPct = Math.round(threshold * 100)

  const tierColor = {
    uncertain: 'var(--color-warning, #e0a84a)',
    likely: 'var(--color-primary, #c99347)',
    strong: 'var(--color-primary, #c99347)',
    very_strong: probability >= threshold
      ? 'var(--color-error, #a64b3c)'
      : 'var(--color-success, #7fb069)',
  }[band.tier]

  return (
    <div className={styles.bandRoot}>
      <div className={styles.bandHeader}>
        <Target size={18} style={{ color: tierColor }} />
        <span className={styles.bandLabel}>{label}</span>
        <span className={styles.bandProb} style={{ color: tierColor }}>
          {percent}%
        </span>
      </div>
      <div className={styles.bandTrack}>
        {/* threshold marker */}
        <div
          className={styles.bandThresholdLine}
          style={{ left: `${thresholdPct}%` }}
          title={`Eşik / Threshold: ${thresholdPct}%`}
        />
        {/* CI band */}
        <motion.div
          className={styles.bandCI}
          initial={{ opacity: 0, width: 0 }}
          animate={{
            opacity: 1,
            width: `${upperPct - lowerPct}%`,
            marginLeft: `${lowerPct}%`,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ backgroundColor: tierColor, opacity: 0.25 }}
        />
        {/* point estimate */}
        <motion.div
          className={styles.bandPoint}
          initial={{ opacity: 0, left: '50%' }}
          animate={{ opacity: 1, left: `${percent}%` }}
          transition={{ duration: 1.0, delay: 0.2 }}
          style={{ backgroundColor: tierColor }}
        />
      </div>
      <div className={styles.bandFooter}>
        <span>{locale === 'tr' ? 'İnsan' : 'Human'}</span>
        <span className={styles.bandCIText}>
          {locale === 'tr' ? 'Güven aralığı' : 'CI'}: {lowerPct}%–{upperPct}%
        </span>
        <span>{locale === 'tr' ? 'AI' : 'AI'}</span>
      </div>
    </div>
  )
}

/* =========================================================================
   SHAP Waterfall
   ======================================================================= */

function ShapWaterfall({ contributions, baseProb, finalProb, locale }: {
  contributions: FeatureContribution[]
  baseProb: number
  finalProb: number
  locale: 'tr' | 'en'
}) {
  const items = contributions.slice(0, 10)
  const maxAbs = Math.max(...items.map(c => Math.abs(c.shapValue)), 0.01)

  return (
    <div className={styles.shapRoot}>
      <div className={styles.shapHeader}>
        <Microscope size={18} />
        <h4>{locale === 'tr' ? 'Kararın Temelleri (SHAP)' : 'Decision Drivers (SHAP)'}</h4>
        <span className={styles.shapBaseline}>
          {locale === 'tr' ? 'Temel' : 'Base'}: {Math.round(baseProb * 100)}%
          {' → '}
          {locale === 'tr' ? 'Sonuç' : 'Final'}: {Math.round(finalProb * 100)}%
        </span>
      </div>
      <div className={styles.shapList}>
        {items.map((c, i) => {
          const isPositive = c.shapValue > 0
          const barPct = (Math.abs(c.shapValue) / maxAbs) * 100
          const label = locale === 'tr' ? c.label : c.labelEn
          const color = isPositive
            ? 'var(--color-error, #a64b3c)'
            : 'var(--color-success, #7fb069)'
          const Icon = isPositive ? TrendingUp : TrendingDown

          return (
            <motion.div
              key={c.name}
              className={styles.shapRow}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className={styles.shapLabelCol}>
                <Icon size={14} style={{ color }} />
                <span className={styles.shapFeatureLabel}>{label}</span>
                <span className={styles.shapCat}>{c.category}</span>
              </div>
              <div className={styles.shapBarWrapper}>
                <div className={styles.shapBarCenter} />
                <motion.div
                  className={styles.shapBar}
                  initial={{ width: 0 }}
                  animate={{ width: `${barPct / 2}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  style={{
                    backgroundColor: color,
                    [isPositive ? 'left' : 'right']: '50%',
                  }}
                />
              </div>
              <div className={styles.shapValueCol}>
                <span className={styles.shapShap} style={{ color }}>
                  {isPositive ? '+' : ''}{c.shapValue.toFixed(3)}
                </span>
                <span className={styles.shapZ}>
                  z={c.zScore >= 0 ? '+' : ''}{c.zScore.toFixed(2)}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
      <p className={styles.shapFooter}>
        {locale === 'tr'
          ? 'Pozitif değerler (kırmızı) tahmini AI\'a yaklaştırır, negatif değerler (yeşil) İnsan\'a yaklaştırır. Değerler log-odds\'tur.'
          : 'Positive values (red) push toward AI, negative (green) toward Human. Values are in log-odds.'}
      </p>
    </div>
  )
}

/* =========================================================================
   Model Ensemble Votes
   ======================================================================= */

function ModelEnsemble({ votes, bestModel, locale }: {
  votes: ModelVote[]
  bestModel: string
  locale: 'tr' | 'en'
}) {
  if (!votes.length) return null
  const aiCount = votes.filter(v => v.vote === 'ai').length
  const humanCount = votes.length - aiCount

  return (
    <div className={styles.ensembleRoot}>
      <div className={styles.ensembleHeader}>
        <Users size={18} />
        <h4>{locale === 'tr' ? 'Model Topluluğu' : 'Model Ensemble'}</h4>
        <span className={styles.ensembleSummary}>
          {aiCount} AI / {humanCount} {locale === 'tr' ? 'İnsan' : 'Human'}
        </span>
      </div>
      <div className={styles.ensembleList}>
        {votes.map((v, i) => {
          const percent = Math.round(v.probability * 100)
          const isAI = v.vote === 'ai'
          const isBest = v.name === bestModel
          const color = isAI
            ? 'var(--color-error, #a64b3c)'
            : 'var(--color-success, #7fb069)'

          return (
            <motion.div
              key={v.name}
              className={`${styles.ensembleRow} ${isBest ? styles.ensembleBest : ''}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className={styles.ensembleName}>
                {isBest && <span className={styles.ensembleBestBadge}>★</span>}
                <span>{v.name}</span>
              </div>
              <div className={styles.ensembleBarTrack}>
                <motion.div
                  className={styles.ensembleBarFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.7, delay: i * 0.08 }}
                  style={{ backgroundColor: color }}
                />
              </div>
              <div className={styles.ensembleValue}>
                <span style={{ color }}>{percent}%</span>
                <span className={styles.ensembleVote}>
                  {isAI ? 'AI' : locale === 'tr' ? 'İnsan' : 'Human'}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* =========================================================================
   Feature Category Radar (simplified radar using bars per category)
   ======================================================================= */

const CATEGORY_LABELS: Record<FeatureCategory, { tr: string; en: string }> = {
  spectral: { tr: 'Spektral', en: 'Spectral' },
  temporal: { tr: 'Zamansal', en: 'Temporal' },
  harmonic: { tr: 'Harmonik', en: 'Harmonic' },
  rhythm: { tr: 'Ritim', en: 'Rhythm' },
  timbre: { tr: 'Timbre', en: 'Timbre' },
  vocal: { tr: 'Vokal', en: 'Vocal' },
  meta: { tr: 'Meta', en: 'Meta' },
  composite: { tr: 'Birleşik', en: 'Composite' },
  other: { tr: 'Diğer', en: 'Other' },
}

function CategoryRadar({ features, locale }: {
  features: Record<string, FeatureContribution>
  locale: 'tr' | 'en'
}) {
  const grouped = useMemo(() => {
    const map = new Map<FeatureCategory, { total: number; ai: number; count: number }>()
    for (const c of Object.values(features)) {
      const entry = map.get(c.category) || { total: 0, ai: 0, count: 0 }
      entry.total += Math.abs(c.shapValue)
      entry.ai += Math.max(0, c.shapValue)
      entry.count += 1
      map.set(c.category, entry)
    }
    return Array.from(map.entries())
      .map(([cat, v]) => ({
        category: cat,
        aiPush: v.ai,
        humanPush: v.total - v.ai,
        count: v.count,
      }))
      .sort((a, b) => (b.aiPush + b.humanPush) - (a.aiPush + a.humanPush))
  }, [features])

  const maxTotal = Math.max(...grouped.map(g => g.aiPush + g.humanPush), 0.01)

  return (
    <div className={styles.radarRoot}>
      <div className={styles.radarHeader}>
        <h4>{locale === 'tr' ? 'Kategori Katkıları' : 'Category Contributions'}</h4>
      </div>
      <div className={styles.radarList}>
        {grouped.map((g, i) => {
          const aiPct = (g.aiPush / maxTotal) * 100
          const humanPct = (g.humanPush / maxTotal) * 100
          const label = CATEGORY_LABELS[g.category][locale]
          return (
            <motion.div
              key={g.category}
              className={styles.radarRow}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className={styles.radarLabel}>
                <span>{label}</span>
                <span className={styles.radarCount}>{g.count}</span>
              </div>
              <div className={styles.radarBars}>
                <div className={styles.radarSide}>
                  <motion.div
                    className={styles.radarBarHuman}
                    initial={{ width: 0 }}
                    animate={{ width: `${humanPct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                  />
                </div>
                <div className={styles.radarCenter} />
                <div className={styles.radarSide}>
                  <motion.div
                    className={styles.radarBarAi}
                    initial={{ width: 0 }}
                    animate={{ width: `${aiPct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
      <div className={styles.radarLegend}>
        <span><span className={styles.radarLegendHuman} />{locale === 'tr' ? 'İnsan işareti' : 'Human-like'}</span>
        <span><span className={styles.radarLegendAi} />{locale === 'tr' ? 'AI işareti' : 'AI-like'}</span>
      </div>
    </div>
  )
}

/* =========================================================================
   Full Feature Inspector (all 49 features, filterable)
   ======================================================================= */

function FullFeatureInspector({ features, locale }: {
  features: Record<string, FeatureContribution>
  locale: 'tr' | 'en'
}) {
  const [filter, setFilter] = useState<FeatureCategory | 'all'>('all')
  const list = useMemo(() => {
    const arr = Object.values(features)
    const filtered = filter === 'all' ? arr : arr.filter(c => c.category === filter)
    return filtered.sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue))
  }, [features, filter])

  const categories: (FeatureCategory | 'all')[] = [
    'all', 'spectral', 'temporal', 'harmonic', 'rhythm',
    'timbre', 'vocal', 'composite', 'meta',
  ]

  return (
    <div className={styles.inspectorRoot}>
      <div className={styles.inspectorHeader}>
        <h4>
          {locale === 'tr' ? 'Tam Özellik Tablosu' : 'Full Feature Table'}
          <span className={styles.inspectorCount}>{list.length}</span>
        </h4>
        <div className={styles.inspectorFilters}>
          {categories.map(c => (
            <button
              key={c}
              type="button"
              className={`${styles.inspectorFilterBtn} ${filter === c ? styles.inspectorFilterActive : ''}`}
              onClick={() => setFilter(c)}
            >
              {c === 'all'
                ? (locale === 'tr' ? 'Hepsi' : 'All')
                : CATEGORY_LABELS[c][locale]}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.inspectorTable}>
        <div className={styles.inspectorTableHead}>
          <span>{locale === 'tr' ? 'Özellik' : 'Feature'}</span>
          <span>{locale === 'tr' ? 'Değer' : 'Value'}</span>
          <span>Z</span>
          <span>SHAP</span>
          <span>{locale === 'tr' ? 'Yön' : 'Direction'}</span>
        </div>
        {list.map((c, i) => {
          const label = locale === 'tr' ? c.label : c.labelEn
          const color = c.direction === 'towards_ai'
            ? 'var(--color-error, #a64b3c)'
            : c.direction === 'towards_human'
              ? 'var(--color-success, #7fb069)'
              : 'var(--color-text-muted, #888)'
          const Icon = c.direction === 'towards_ai'
            ? TrendingUp
            : c.direction === 'towards_human'
              ? TrendingDown
              : Minus
          return (
            <motion.div
              key={c.name}
              className={styles.inspectorRow}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
              title={c.description}
            >
              <span className={styles.inspectorName}>{label}</span>
              <span className={styles.inspectorVal}>{c.value.toFixed(3)}</span>
              <span className={`${styles.inspectorZ} ${Math.abs(c.zScore) > 1.5 ? styles.inspectorZHigh : ''}`}>
                {c.zScore >= 0 ? '+' : ''}{c.zScore.toFixed(2)}
              </span>
              <span className={styles.inspectorShap} style={{ color }}>
                {c.shapValue >= 0 ? '+' : ''}{c.shapValue.toFixed(3)}
              </span>
              <Icon size={14} style={{ color }} />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* =========================================================================
   Main Panel
   ======================================================================= */

export function XAIPanel({ xai, locale = 'tr' }: XAIPanelProps) {
  const [showFullTable, setShowFullTable] = useState(false)

  return (
    <motion.div
      className={styles.root}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.headerRow}>
        <div className={styles.headerTitle}>
          <Microscope size={20} />
          <h3>{locale === 'tr' ? 'Akademik Analiz (XAI)' : 'Academic Analysis (XAI)'}</h3>
        </div>
        <div className={styles.headerMeta}>
          <span>
            {locale === 'tr' ? 'Model' : 'Model'}: <strong>{xai.bestModel}</strong>
          </span>
          <span>
            {xai.featureCount} {locale === 'tr' ? 'özellik' : 'features'}
          </span>
        </div>
      </div>

      <ConfidenceBandIndicator
        band={xai.confidenceBand}
        probability={xai.probability}
        threshold={xai.threshold}
        locale={locale}
      />

      <div className={styles.grid2}>
        <ShapWaterfall
          contributions={xai.topContributions}
          baseProb={xai.baseProbability}
          finalProb={xai.probability}
          locale={locale}
        />
        <div className={styles.rightColumn}>
          <ModelEnsemble
            votes={xai.modelVotes}
            bestModel={xai.bestModel}
            locale={locale}
          />
          <CategoryRadar
            features={xai.allFeatures}
            locale={locale}
          />
        </div>
      </div>

      <button
        type="button"
        className={styles.inspectorToggle}
        onClick={() => setShowFullTable(!showFullTable)}
      >
        <ChevronRight
          size={16}
          style={{
            transform: showFullTable ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.2s',
          }}
        />
        <span>
          {locale === 'tr'
            ? (showFullTable ? '49 özelliği gizle' : 'Tüm 49 özelliği göster')
            : (showFullTable ? 'Hide all 49 features' : 'Show all 49 features')}
        </span>
      </button>

      {showFullTable && (
        <FullFeatureInspector
          features={xai.allFeatures}
          locale={locale}
        />
      )}
    </motion.div>
  )
}
