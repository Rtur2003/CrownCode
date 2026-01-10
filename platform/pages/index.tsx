import React from 'react'
import type { NextPage } from 'next'
import { MainLayout } from '@/components/Layout/MainLayout'
import { HeroSection } from '@/components/Home/HeroSection'
import { ProjectsSection } from '@/components/Home/ProjectsSection'

const HomePage: NextPage = () => {
  return (
    <MainLayout
      title="CrownCode Platform - AI Music Detection & Data Analysis Research"
      description="Academic research platform for AI-powered music detection using wav2vec2 deep learning. Developed at Düzce University Computer Engineering Department as senior thesis project by Hasan Arthur Altuntaş."
      keywords="AI music detection, wav2vec2, deep learning, audio analysis, machine learning, data augmentation, research platform, Düzce University, computer engineering, thesis project, Hasan Arthur Altuntaş, CrownCode"
    >
      <HeroSection />
      <ProjectsSection />
    </MainLayout>
  )
}

export default HomePage