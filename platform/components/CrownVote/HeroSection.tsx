import React from 'react'
import { motion } from 'motion/react'
import { Bot } from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'
import styles from '@/styles/pages/crown-vote.module.css'

export const HeroSection: React.FC = () => {
  const { t } = useLanguage()

  return (
    <motion.header
      className={styles['vote-header']}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles['header-badge']}>
        <Bot size={14} />
        <span>{t.crownVote?.header?.badge || 'Desktop Application'}</span>
      </div>

      <h1 className={styles['vote-title']}>
        {t.crownVote?.header?.title || 'VOTRYX'}
      </h1>

      <p className={styles['vote-subtitle']}>
        {t.crownVote?.header?.subtitle || 'Automated Voting Intelligence for DistroKid Spotlight'}
      </p>

      <div className={styles['hero-image']}>
        <Image
          src="/votryx/votryx-banner.png"
          alt="VOTRYX Banner"
          width={800}
          height={400}
          style={{ width: '100%', height: 'auto' }}
          priority
        />
      </div>
    </motion.header>
  )
}
