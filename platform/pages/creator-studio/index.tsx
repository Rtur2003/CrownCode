import React from 'react'
import type { NextPage } from 'next'
import { motion } from 'motion/react'
import { Wand2 } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'
import { RemixStudio, MultitrackMixer } from '@/components/CreatorStudio'

import styles from '@/styles/pages/creator-studio.module.css'

const CreatorStudioPage: NextPage = () => {
  const { t } = useLanguage()
  const cs = t.creatorStudio

  // "AI Generate" still needs infrastructure this platform doesn't have
  // (a generative audio model — multi-GB weights, long inference, not a
  // fit for this deployment) — shown as upcoming rather than faked.
  // Remix and Multitrack are both real: see RemixStudio (/api/remix/blend
  // — tempo/key detection, time-stretch/pitch-shift, crossfade) and
  // MultitrackMixer (/api/remix/multitrack — real per-track gain/pan
  // mixdown with peak normalization).
  const upcomingFeatures = [
    { icon: Wand2, title: cs.features.generate.title, description: cs.features.generate.description },
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

        <MultitrackMixer />

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
