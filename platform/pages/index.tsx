import React from 'react'
import type { NextPage } from 'next'
import { MainLayout } from '@/components/Layout/MainLayout'
import { HeroSection } from '@/components/Home/HeroSection'
import { AurisShowcase } from '@/components/Home/AurisShowcase'
import { ProjectsSection } from '@/components/Home/ProjectsSection'
import { useLanguage } from '@/context/LanguageContext'

const HomePage: NextPage = () => {
  const { t } = useLanguage()

  return (
    <MainLayout
      title={t.homeMeta?.title || 'CrownCode Platform'}
      description={t.homeMeta?.description || ''}
      keywords={t.homeMeta?.keywords || ''}
      url="https://hasanarthuraltuntas.xyz"
    >
      <HeroSection />
      <AurisShowcase />
      <ProjectsSection />
    </MainLayout>
  )
}

export default HomePage
