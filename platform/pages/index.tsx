import React from 'react'
import type { NextPage } from 'next'
import { MainLayout } from '@/components/Layout/MainLayout'
import { HeroSection } from '@/components/Home/HeroSection'
import { ProjectsSection } from '@/components/Home/ProjectsSection'

const HomePage: NextPage = () => {
  return (
    <MainLayout
      title="CrownCode Platform - AI Music Detection & Data Manipulation | Düzce University Thesis"
      description="Advanced AI-powered platform for music detection and data manipulation. Düzce University Computer Engineering thesis project featuring 97.2% accuracy AI music detection, automated ML pipelines, and comprehensive research tools."
      keywords="AI music detection, wav2vec2, deep learning, data manipulation, machine learning, computer engineering thesis, Düzce University, academic research, artificial intelligence, audio analysis, music technology, research platform, ML toolkit, Hasan Arthur Altuntaş"
    >
      <HeroSection />
      <ProjectsSection />
    </MainLayout>
  )
}

export default HomePage