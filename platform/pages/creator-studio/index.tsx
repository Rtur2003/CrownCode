import React from 'react'
import type { NextPage } from 'next'
import { motion } from 'motion/react'
import { Palette, Wand2, Layers, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'

import styles from '@/styles/pages/creator-studio.module.css'

const CreatorStudioPage: NextPage = () => {
  const { t } = useLanguage()
  const cs = t.creatorStudio

  const features = [
    { icon: Palette, title: cs.features.remix.title, description: cs.features.remix.description },
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
          <span className={styles['coming-soon-badge']}>
            {cs.comingSoon}
          </span>
          <h1 className={styles['title']}>
            {cs.title}
          </h1>
          <p className={styles['subtitle']}>
            {cs.subtitle}
          </p>
        </motion.div>

        <div className={styles['features-grid']}>
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className={styles['feature-card']}
              >
                <Icon size={28} className={styles['feature-icon']} />
                <h3 className={styles['feature-title']}>{f.title}</h3>
                <p className={styles['feature-desc']}>{f.description}</p>
              </motion.div>
            )
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className={styles['footer-section']}>
          <p className={styles['footer-note']}>
            {cs.comingSoonDesc}
          </p>
          <Link href="/" className={styles['back-link']}>
            {t.errorPage?.actions?.home} <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </MainLayout>
  )
}

export default CreatorStudioPage
