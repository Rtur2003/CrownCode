/**
 * Meta-Classifier Panel — a second, independent opinion
 *
 * Shows the trained LightGBM stacking ensemble's own verdict alongside
 * the primary XAI result, purely for transparency. Never overrides the
 * main verdict — this is "here's what our second model thinks", not
 * a competing decision.
 */

import { motion } from 'motion/react'
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react'
import type { MetaClassifierExplanation } from '../../hooks/analysisTypes'
import styles from '../../styles/pages/xai-panel.module.css'

interface MetaClassifierPanelProps {
  meta: MetaClassifierExplanation
  locale?: 'tr' | 'en'
}

export function MetaClassifierPanel({ meta, locale = 'tr' }: MetaClassifierPanelProps) {
  const percent = Math.round(meta.confidence * 100)
  const verdictLabel = meta.isAIGenerated
    ? (locale === 'tr' ? 'AI Üretimi' : 'AI-Generated')
    : (locale === 'tr' ? 'İnsan Bestesi' : 'Human-Composed')
  const verdictColor = meta.isAIGenerated
    ? 'var(--color-error, #a64b3c)'
    : 'var(--color-success, #7fb069)'

  const towerEntries = Object.entries(meta.towerScores).filter(
    (entry): entry is [string, number] => typeof entry[1] === 'number'
  )
  const maxTower = Math.max(...towerEntries.map(([, v]) => v), 0.01)

  return (
    <motion.div
      className={styles.root}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className={styles.headerRow}>
        <div className={styles.headerTitle}>
          <Sparkles size={20} />
          <h3>{locale === 'tr' ? 'İkinci Görüş (Ensemble)' : 'Second Opinion (Ensemble)'}</h3>
        </div>
        <div className={styles.headerMeta}>
          <span>{meta.modelVersion}</span>
        </div>
      </div>

      <div className={styles.metaVerdictRow}>
        {meta.isAIGenerated ? (
          <TrendingUp size={22} style={{ color: verdictColor, flexShrink: 0 }} />
        ) : (
          <TrendingDown size={22} style={{ color: verdictColor, flexShrink: 0 }} />
        )}
        <div>
          <div className={styles.metaVerdictLabel} style={{ color: verdictColor }}>
            {verdictLabel}
          </div>
          <div className={styles.metaVerdictSub}>
            {locale === 'tr' ? 'Güven' : 'Confidence'}: {percent}%
          </div>
        </div>
      </div>

      {towerEntries.length > 0 && (
        <div>
          <h4 className={styles.metaTowersTitle}>
            {locale === 'tr' ? 'Kule Skorları' : 'Tower Scores'}
          </h4>
          <div className={styles.metaTowersList}>
            {towerEntries.map(([name, value], i) => (
              <motion.div
                key={name}
                className={styles.metaTowerRow}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className={styles.metaTowerName}>{name.replace(/_/g, ' ')}</span>
                <div className={styles.metaTowerTrack}>
                  <motion.div
                    className={styles.metaTowerFill}
                    initial={{ width: 0 }}
                    animate={{ width: `${(value / maxTower) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    style={{ backgroundColor: value > 0.5 ? 'var(--color-error, #a64b3c)' : 'var(--color-success, #7fb069)' }}
                  />
                </div>
                <span className={styles.metaTowerValue}>{Math.round(value * 100)}%</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {meta.indicators.length > 0 && (
        <ul className={styles.metaIndicators}>
          {meta.indicators.map((indicator, i) => (
            <li key={i}>{indicator}</li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}

export default MetaClassifierPanel
