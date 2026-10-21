import React from 'react'
import type { NextPage } from 'next'
import { LegalPage } from '@/components/UI/LegalPage'
import { useLanguage } from '@/context/LanguageContext'
import world from '@/styles/components/world-page.module.css'

const SECTION_KEYS = ['acceptableUse', 'userResponsibilities', 'intellectualProperty', 'disclaimer'] as const

const TermsPage: NextPage = () => {
  const { t } = useLanguage()
  const tm = t.terms

  return (
    <LegalPage
      meta={tm.meta}
      title={tm.title}
      updated={tm.lastUpdated}
      intro={tm.intro}
      sections={SECTION_KEYS.map(key => ({ key, title: tm.sections[key].title, content: tm.sections[key].content }))}
      extra={
        <section className={world.section} aria-labelledby="legal-open-source">
          <div className={world.sectionHead}>
            <h2 id="legal-open-source">{tm.openSource.title}</h2>
          </div>
          <div className={world.sectionBody}>
            <p className={world.interpretation}>{tm.openSource.content}</p>
            <div className={world.actions}>
              <a className={world.link} href="https://github.com/Rtur2003/CrownCode" target="_blank" rel="noopener noreferrer">
                {tm.openSource.viewOnGithub}
              </a>
            </div>
          </div>
        </section>
      }
      contactLabel={tm.contactLabel}
    />
  )
}

export default TermsPage
