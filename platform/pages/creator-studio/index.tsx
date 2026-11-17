// Creator Studio: Tabbed workspace switching seamlessly between two-track Remix Studio
// and the 2-6 track Mixer, paired with inline server-rendered technical documentation.

import React, { useState } from 'react'
import type { NextPage } from 'next'
import { BookOpen } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { RemixStudio, MultitrackMixer } from '@/components/CreatorStudio'
import { BackendNote } from '@/components/UI/BackendNote'
import { WorldPage } from '@/components/UI/WorldPage'
import { useLanguage } from '@/context/LanguageContext'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/creator-studio.module.css'

type StudioTab = 'remix' | 'mixer'

const CreatorStudioPage: NextPage = () => {
  const { t } = useLanguage()
  const cs = t.creatorStudio
  const [studioTab, setStudioTab] = useState<StudioTab>('remix')

  const activeHead = studioTab === 'remix' ? cs.remixStudio : cs.multitrackMixer

  return (
    <MainLayout title={cs.meta.title} description={cs.meta.description} keywords={cs.meta.keywords}>
      <WorldPage world="creator-studio" title={cs.title} lead={cs.subtitle}>
        <section className={world.section} aria-labelledby="studio-workspace-title">
          <div className={world.sectionHead}>
            <h2 id="studio-workspace-title">{activeHead.title}</h2>
            <p>{activeHead.subtitle}</p>
            <div className={world.actions}>
              <a
                href="#studio-about-title"
                className={world.link}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <BookOpen size={14} />
                <span>{cs.about.title}</span>
              </a>
            </div>
          </div>

          <div className={world.sectionBody}>
            <div className={styles.modeTabs} role="tablist" aria-label={cs.title}>
              <button
                type="button"
                role="tab"
                aria-selected={studioTab === 'remix'}
                className={styles.modeTab}
                data-active={studioTab === 'remix'}
                onClick={() => setStudioTab('remix')}
              >
                {cs.remixStudio.title}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={studioTab === 'mixer'}
                className={styles.modeTab}
                data-active={studioTab === 'mixer'}
                onClick={() => setStudioTab('mixer')}
              >
                {cs.multitrackMixer.title}
              </button>
            </div>

            <BackendNote />

            {studioTab === 'remix' ? <RemixStudio /> : <MultitrackMixer />}
          </div>
        </section>

        <section id="studio-about" className={world.section} aria-labelledby="studio-about-title">
          <div className={world.sectionHead}>
            <h2 id="studio-about-title">{cs.about.title}</h2>
            <p>{cs.subtitle}</p>
          </div>

          <div className={world.sectionBody}>
            {cs.about.body.map((paragraph: string, index: number) => (
              <p
                key={paragraph}
                className={world.interpretation}
                style={index > 0 ? { marginTop: '14px' } : undefined}
              >
                {paragraph}
              </p>
            ))}

            <dl className={world.margins}>
              {cs.about.specs.map((item: { label: string; value: string }) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>

            <p className={world.privacy}>
              <strong>{cs.upcomingTitle}: {cs.features.generate.title}</strong>
              {' — '}
              {cs.features.generate.description}
            </p>
          </div>
        </section>
      </WorldPage>
    </MainLayout>
  )
}

export default CreatorStudioPage
