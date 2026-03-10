import React from 'react'
import type { NextPage } from 'next'
import { motion } from 'framer-motion'
import { Palette, Wand2, Layers, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'

import styles from '@/styles/pages/creator-studio.module.css'

const CreatorStudioPage: NextPage = () => {
  const { t } = useLanguage()
  const cs = t.creatorStudio

  const features = [
    { icon: Palette, title: cs?.features?.remix?.title || 'Audio Remix', description: cs?.features?.remix?.description || 'Remix and transform audio tracks with AI-powered tools.' },
    { icon: Wand2, title: cs?.features?.generate?.title || 'AI Generate', description: cs?.features?.generate?.description || 'Generate original audio content using advanced AI models.' },
    { icon: Layers, title: cs?.features?.multitrack?.title || 'Multi-Track', description: cs?.features?.multitrack?.description || 'Edit and mix multiple audio tracks in a unified workspace.' },
  ]

  return (
    <MainLayout
      title={cs?.meta?.title || 'Creator Studio - CrownCode'}
      description={cs?.meta?.description || 'Audio remix, AI generation, and multi-track editing tools.'}
      keywords={cs?.meta?.keywords || 'creator studio, audio, AI, remix'}
    >
      <div className={styles['page-container']}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className={styles['coming-soon-badge']}>
            {cs?.comingSoon || 'Coming Soon'}
          </span>
          <h1 className={styles['title']}>
            {cs?.title || 'Creator Studio'}
          </h1>
          <p className={styles['subtitle']}>
            {cs?.subtitle || 'Audio creation tools powered by AI'}
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
            {cs?.comingSoonDesc || 'We\'re building something amazing. Stay tuned for audio remix, AI generation, and multi-track editing tools.'}
          </p>
          <Link href="/" className={styles['back-link']}>
            {t.errorPage?.actions?.home || 'Back to Home'} <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </MainLayout>
  )
}

export default CreatorStudioPage
