import React from 'react'
import type { NextPage } from 'next'
import { MainLayout } from '@/components/Layout/MainLayout'
import { ProjectExplorer } from '@/components/Home/ProjectExplorer'
import { ProjectsSection } from '@/components/Home/ProjectsSection'
import { useLanguage } from '@/context/LanguageContext'
import styles from '@/components/Home/ProjectExplorer.module.css'

const HomePage: NextPage = () => {
  const { t } = useLanguage()

  return (
    <div className={styles.home}>
      <MainLayout
        title={t.homeMeta?.title || 'CrownCode Platform'}
        description={t.homeMeta?.description || ''}
        keywords={t.homeMeta?.keywords || ''}
        url="https://hasan-arthur-altuntas.xyz"
      >
        <ProjectExplorer />
        <ProjectsSection />
      </MainLayout>
    </div>
  )
}

export default HomePage
