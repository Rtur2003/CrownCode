import React from 'react'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/crown-vote.module.css'

const FEATURE_KEYS = ['automation', 'parallel', 'tray', 'logging', 'safety', 'config'] as const

/** The app's banner and what it does, as a plain definition list. */
export const FeaturesGrid: React.FC = () => {
  const { t } = useLanguage()
  const features = t.crownVote.features

  return (
    <div>
      <figure className={styles.banner}>
        <Image
          src="/votryx/votryx-banner.webp"
          alt="VOTRYX"
          width={1536}
          height={1024}
          sizes="(max-width: 860px) 100vw, 560px"
        />
      </figure>
      <dl className={world.margins}>
        {FEATURE_KEYS.map(key => (
          <div key={key}>
            <dt>{features[key].title}</dt>
            <dd>{features[key].description}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
