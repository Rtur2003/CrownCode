import React from 'react'
import type { NextPage } from 'next'
import { motion } from 'motion/react'
import { Wand2, Layers } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'
import { RemixStudio } from '@/components/CreatorStudio'

import styles from '@/styles/pages/creator-studio.module.css'

const CreatorStudioPage: NextPage = () => {
  const { t } = useLanguage()
  const cs = t.creatorStudio

  // "AI Generate" and "Multitrack" still need infrastructure this platform
  // doesn't have yet (a generative audio model, a full multitrack editor) —
  // shown as upcoming rather than faked. Remix is real: see RemixStudio,
  // backed by the /api/remix/blend DSP engine (real tempo/key detection,
  // time-stretch/pitch-shift, crossfade).
  const upcomingFeatures = [
    { icon: Wand2, title: cs.features.generate.title, description: cs.features.generate.description },
    { icon: Layers, title: cs.features.multitrack.title, description: cs.features.multitrack.description },
  ]

  return (
    <MainLayout
      title={cs.meta.title}
      description={cs.meta.description}
      keywords={cs.meta.keywords}
    >
      <div className={styles['page-container']}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className={styles['title']}>
            {cs.title}
          </h1>
          <p className={styles['subtitle']}>
            {cs.subtitle}
          </p>
        </motion.div>

        <RemixStudio />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={styles['upcoming-section']}
        >
          <h2 className={styles['upcoming-title']}>{cs.upcomingTitle}</h2>
          <div className={styles['features-grid']}>
            {upcomingFeatures.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className={styles['feature-card']}
                >
                  <span className={styles['coming-soon-badge']}>{cs.comingSoon}</span>
                  <Icon size={28} className={styles['feature-icon']} />
                  <h3 className={styles['feature-title']}>{f.title}</h3>
                  <p className={styles['feature-desc']}>{f.description}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  )
}

export default CreatorStudioPage
