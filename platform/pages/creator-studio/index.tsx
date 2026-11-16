// Creator Studio: Tabbed workspace switching seamlessly between two-track Remix Studio
// and the 2-6 track Mixer without stacking redundant vertical sections.

import React, { useState } from 'react'
import type { NextPage } from 'next'
import { BookOpen } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { RemixStudio, MultitrackMixer } from '@/components/CreatorStudio'
import { BackendNote } from '@/components/UI/BackendNote'
import { Modal } from '@/components/UI/Modal'
import { WorldPage } from '@/components/UI/WorldPage'
import { useLanguage } from '@/context/LanguageContext'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/creator-studio.module.css'

type StudioTab = 'remix' | 'mixer'

const CreatorStudioPage: NextPage = () => {
  const { t, language } = useLanguage()
  const cs = t.creatorStudio
  const [studioTab, setStudioTab] = useState<StudioTab>('remix')
  const [docsOpen, setDocsOpen] = useState(false)
  const isTr = language === 'tr'

  const activeHead = studioTab === 'remix' ? cs.remixStudio : cs.multitrackMixer

  return (
    <MainLayout title={cs.meta.title} description={cs.meta.description} keywords={cs.meta.keywords}>
      <WorldPage world="creator-studio" title={cs.title} lead={cs.subtitle}>
        <section className={world.section} aria-labelledby="studio-workspace-title">
          <div className={world.sectionHead}>
            <h2 id="studio-workspace-title">{activeHead.title}</h2>
            <p>{activeHead.subtitle}</p>
            <div className={world.actions}>
              <button
                type="button"
                className={world.link}
                onClick={() => setDocsOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <BookOpen size={14} />
                <span>{cs.about.title}</span>
              </button>
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

            <dl className={world.margins}>
              {cs.about.specs.map((item: { label: string; value: string }) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <Modal
          open={docsOpen}
          onClose={() => setDocsOpen(false)}
          title={cs.about.title}
          subtitle={cs.subtitle}
          closeLabel={isTr ? 'Kapat' : 'Close'}
          size="md"
        >
          <div className={styles.modalStack}>
            {cs.about.body.map((paragraph: string) => (
              <p key={paragraph} className={styles.modalPara}>{paragraph}</p>
            ))}
            <div className={styles.modalUpcoming}>
              <strong>{cs.upcomingTitle}: {cs.features.generate.title}</strong>
              <p>{cs.features.generate.description}</p>
            </div>
          </div>
        </Modal>
      </WorldPage>
    </MainLayout>
  )
}

export default CreatorStudioPage
