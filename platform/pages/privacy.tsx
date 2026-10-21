import React from 'react'
import type { NextPage } from 'next'
import { LegalPage } from '@/components/UI/LegalPage'
import { useLanguage } from '@/context/LanguageContext'

const SECTION_KEYS = ['dataCollection', 'dataUsage', 'dataSecurity', 'cookies'] as const

const PrivacyPage: NextPage = () => {
  const { t } = useLanguage()
  const p = t.privacy

  return (
    <LegalPage
      meta={p.meta}
      title={p.title}
      updated={p.lastUpdated}
      intro={p.intro}
      sections={SECTION_KEYS.map(key => ({ key, title: p.sections[key].title, content: p.sections[key].content }))}
      contactLabel={p.contactLabel}
    />
  )
}

export default PrivacyPage
