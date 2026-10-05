// Crown Dreams: a dream goes in, Gemini reads it. The sample journal below the
// writing surface is demo data and says so. The page takes its colours from the
// planet this project has in the homepage atlas (smoky quartz, amethyst).

import React from 'react'
import type { NextPage } from 'next'
import { MainLayout } from '@/components/Layout/MainLayout'
import { DreamAnalyzer } from '@/components/CrownDreams/DreamAnalyzer'
import { SampleJournal } from '@/components/CrownDreams/SampleJournal'
import { PRODUCT_CATALOG } from '@/config/product-catalog'
import { worldLook } from '@/config/showroom-worlds'
import { useLanguage } from '@/context/LanguageContext'
import styles from '@/styles/pages/crown-dreams.module.css'

const WORLD_ID = 'crown-dreams'
const WORLD_INDEX = PRODUCT_CATALOG.findIndex(p => p.id === WORLD_ID)
const LOOK = worldLook({ id: WORLD_ID })
const pad = (n: number) => String(n).padStart(2, '0')

const CrownDreamsPage: NextPage = () => {
  const { language, t } = useLanguage()
  const cd = t.crownDreams
  const sector = language === 'en' ? LOOK.sector.en : LOOK.sector.tr

  return (
    <MainLayout
      title={cd.meta.title}
      description={cd.meta.description}
      keywords={cd.meta.keywords}
    >
      <div className={styles.page}>
        <div className={styles.frame}>
          <header className={`${styles.hero} enter-rise`}>
            <div>
              <p className={styles.kicker}>
                <span>{pad(WORLD_INDEX + 1)} / {pad(PRODUCT_CATALOG.length)}</span>
                <span>{sector}</span>
              </p>
              <h1 className={styles.title}>{cd.header.title}</h1>
              <p className={styles.lead}>{cd.header.lead}</p>
            </div>
            <div className={styles.planet} aria-hidden="true" />
          </header>

          <DreamAnalyzer />
          <SampleJournal />
        </div>
      </div>
    </MainLayout>
  )
}

export default CrownDreamsPage
