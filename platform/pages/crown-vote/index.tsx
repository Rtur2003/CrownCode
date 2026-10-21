// VOTRYX: a Windows desktop app. This page is where it is downloaded, with the
// install steps and a form that writes its config.json.

import React from 'react'
import type { NextPage } from 'next'
import { MainLayout } from '@/components/Layout/MainLayout'
import { WorldPage } from '@/components/UI/WorldPage'
import { ConfigGenerator, DownloadSection, FeaturesGrid } from '@/components/CrownVote'
import { useLanguage } from '@/context/LanguageContext'
import world from '@/styles/components/world-page.module.css'

const CrownVotePage: NextPage = () => {
  const { t } = useLanguage()
  const V = t.crownVote

  return (
    <MainLayout title={V.meta.title} description={V.meta.description} keywords={V.meta.keywords}>
      <WorldPage world="crown-vote" title={V.header.title} lead={V.header.subtitle}>
        <section className={world.section} aria-labelledby="vote-download-title">
          <div className={world.sectionHead}>
            <h2 id="vote-download-title">{V.download.title}</h2>
            <p>{V.download.description}</p>
          </div>
          <div className={world.sectionBody}>
            <DownloadSection />
          </div>
        </section>

        <section className={world.section} aria-labelledby="vote-features-title">
          <div className={world.sectionHead}>
            <h2 id="vote-features-title">{V.featuresTitle}</h2>
          </div>
          <div className={world.sectionBody}>
            <FeaturesGrid />
          </div>
        </section>

        <section className={world.section} aria-labelledby="vote-config-title">
          <div className={world.sectionHead}>
            <h2 id="vote-config-title">{V.configGenerator.title}</h2>
            <p>{V.configGenerator.description}</p>
          </div>
          <div className={world.sectionBody}>
            <ConfigGenerator />
          </div>
        </section>
      </WorldPage>
    </MainLayout>
  )
}

export default CrownVotePage
