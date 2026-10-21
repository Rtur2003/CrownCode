import React, { type ReactNode } from 'react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { WorldPage } from '@/components/UI/WorldPage'
import world from '@/styles/components/world-page.module.css'

export interface LegalSection {
  key: string
  title: string
  content: string
}

interface LegalPageProps {
  meta: { title: string; description: string }
  title: string
  updated: string
  intro: string
  sections: LegalSection[]
  /** Sections that are more than a paragraph (a link, say), rendered after the text ones. */
  extra?: ReactNode
  contactLabel: string
}

const CONTACT_EMAIL = 'contact@hasan-arthur-altuntas.xyz'

/** Privacy and terms: plain headed text in the site's frame, no cards, no icons. */
export const LegalPage: React.FC<LegalPageProps> = ({ meta, title, updated, intro, sections, extra, contactLabel }) => (
  <MainLayout title={meta.title} description={meta.description}>
    <WorldPage world="kognita" planet={false} meta={updated} title={title}>
      <p className={world.interpretation}>{intro}</p>

      {sections.map(section => (
        <section key={section.key} className={world.section} aria-labelledby={`legal-${section.key}`}>
          <div className={world.sectionHead}>
            <h2 id={`legal-${section.key}`}>{section.title}</h2>
          </div>
          <div className={world.sectionBody}>
            <p className={world.interpretation}>{section.content}</p>
          </div>
        </section>
      ))}

      {extra}

      <section className={world.section} aria-labelledby="legal-contact">
        <div className={world.sectionHead}>
          <h2 id="legal-contact">{contactLabel}</h2>
        </div>
        <div className={world.sectionBody}>
          <a className={world.link} href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
      </section>
    </WorldPage>
  </MainLayout>
)

export default LegalPage
