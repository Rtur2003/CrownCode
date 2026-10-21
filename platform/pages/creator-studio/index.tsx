// Creator Studio: two real tools (remix two tracks, mix up to six) that run on the
// CrownCode backend. AI audio generation is listed as not built, not faked.

import React from 'react'
import type { NextPage } from 'next'
import { MainLayout } from '@/components/Layout/MainLayout'
import { RemixStudio, MultitrackMixer } from '@/components/CreatorStudio'
import { BackendNote } from '@/components/UI/BackendNote'
import { WorldPage } from '@/components/UI/WorldPage'
import { useLanguage } from '@/context/LanguageContext'
import world from '@/styles/components/world-page.module.css'

const CreatorStudioPage: NextPage = () => {
  const { t } = useLanguage()
  const cs = t.creatorStudio

  return (
    <MainLayout title={cs.meta.title} description={cs.meta.description} keywords={cs.meta.keywords}>
      <WorldPage world="creator-studio" title={cs.title} lead={cs.subtitle}>
        <section className={world.section} aria-labelledby="remix-title">
          <div className={world.sectionHead}>
            <h2 id="remix-title">{cs.remixStudio.title}</h2>
            <p>{cs.remixStudio.subtitle}</p>
          </div>
          <div className={world.sectionBody}>
            <BackendNote />
            <RemixStudio />
          </div>
        </section>

        <section className={world.section} aria-labelledby="mixer-title">
          <div className={world.sectionHead}>
            <h2 id="mixer-title">{cs.multitrackMixer.title}</h2>
            <p>{cs.multitrackMixer.subtitle}</p>
          </div>
          <div className={world.sectionBody}>
            <MultitrackMixer />
          </div>
        </section>

        <section className={world.section} aria-labelledby="about-title">
          <div className={world.sectionHead}>
            <h2 id="about-title">{cs.about.title}</h2>
          </div>
          <div className={world.sectionBody}>
            {cs.about.body.map((paragraph: string) => (
              <p key={paragraph} className={world.interpretation}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className={world.section} aria-labelledby="upcoming-title">
          <div className={world.sectionHead}>
            <h2 id="upcoming-title">{cs.upcomingTitle}</h2>
          </div>
          <div className={world.sectionBody}>
            <p className={world.interpretation}>
              <strong>{cs.features.generate.title}.</strong> {cs.features.generate.description}
            </p>
          </div>
        </section>
      </WorldPage>
    </MainLayout>
  )
}

export default CreatorStudioPage
