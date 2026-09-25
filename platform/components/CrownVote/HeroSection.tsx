import React from 'react'
import { Bot } from 'lucide-react'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'
import styles from '@/styles/pages/crown-vote.module.css'

export const HeroSection: React.FC = () => {
  const { t } = useLanguage()

  return (
    <header className={`${styles['vote-header']} enter-drop`}>
      <div className={styles['header-badge']}>
        <Bot size={14} />
        <span>{t.crownVote?.header?.badge || 'Desktop Application'}</span>
      </div>

      <h1 className={styles['vote-title']}>
        {t.crownVote?.header?.title || 'VOTRYX'}
      </h1>

      <p className={styles['vote-subtitle']}>
        {t.crownVote?.header?.subtitle || 'A Windows app that automates DistroKid Spotlight voting'}
      </p>

      <div className={styles['hero-image']}>
        <Image
          src="/votryx/votryx-banner.webp"
          alt="VOTRYX"
          width={1536}
          height={1024}
          sizes="(max-width: 900px) 100vw, 800px"
          style={{ width: '100%', height: 'auto' }}
          preload
        />
      </div>
    </header>
  )
}
