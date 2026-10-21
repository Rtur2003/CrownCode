// Crown Dreams: a dream goes in, Gemini reads it. The sample journal below the
// writing surface is demo data and says so. The page takes its colours from the
// planet this project has in the homepage atlas (smoky quartz, amethyst).

import React from 'react'
import type { NextPage } from 'next'
import { MainLayout } from '@/components/Layout/MainLayout'
import { DreamAnalyzer } from '@/components/CrownDreams/DreamAnalyzer'
import { SampleJournal } from '@/components/CrownDreams/SampleJournal'
import { WorldPage } from '@/components/UI/WorldPage'
import { useLanguage } from '@/context/LanguageContext'

const CrownDreamsPage: NextPage = () => {
  const { t } = useLanguage()
  const cd = t.crownDreams

  return (
    <MainLayout
      title={cd.meta.title}
      description={cd.meta.description}
      keywords={cd.meta.keywords}
    >
      <WorldPage world="crown-dreams" title={cd.header.title} lead={cd.header.lead}>
        <DreamAnalyzer />
        <SampleJournal />
      </WorldPage>
    </MainLayout>
  )
}

export default CrownDreamsPage
