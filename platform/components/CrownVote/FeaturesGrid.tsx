import React from 'react'
import { motion } from 'motion/react'
import { Chrome, Layers, Monitor, FileText, Shield, Settings } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import styles from '@/styles/pages/crown-vote.module.css'

const featureIcons = {
  automation: Chrome,
  parallel: Layers,
  tray: Monitor,
  logging: FileText,
  safety: Shield,
  config: Settings,
}

const featureKeys = ['automation', 'parallel', 'tray', 'logging', 'safety', 'config'] as const

// The grid is 3 columns wide — give each column its own entrance direction
// (left / rise / right) instead of every card rising in the same lockstep,
// so the two rows read as two considered beats, not one repeated template.
const columnOffsets = [-24, 0, 24]

export const FeaturesGrid: React.FC = () => {
  const { t } = useLanguage()

  return (
    <motion.div
      className={styles['features-grid']}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {featureKeys.map((key, index) => {
        const Icon = featureIcons[key]
        const feature = t.crownVote?.features?.[key]
        const xOffset = columnOffsets[index % 3]

        return (
          <motion.div
            key={key}
            className={styles['feature-card']}
            initial={{ opacity: 0, y: 20, x: xOffset }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.45, delay: 0.08 * index, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles['feature-icon']}>
              <Icon size={20} />
            </div>
            <h3>{feature?.title || key}</h3>
            <p>{feature?.description || ''}</p>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
