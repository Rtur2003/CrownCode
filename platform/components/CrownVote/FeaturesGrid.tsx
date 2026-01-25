import React from 'react'
import { motion } from 'framer-motion'
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

        return (
          <motion.div
            key={key}
            className={styles['feature-card']}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
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
