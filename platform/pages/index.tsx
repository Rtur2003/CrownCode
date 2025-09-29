import React from 'react'
import type { NextPage } from 'next'
import { MainLayout } from '@/components/Layout/MainLayout'
import { HeroSection } from '@/components/Home/HeroSection'
import { ProjectsSection } from '@/components/Home/ProjectsSection'

const HomePage: NextPage = () => {
  return (
    <MainLayout
      title="CrownCode Platform - Professional AI Music Detection | Advanced Audio Analysis"
      description="Professional AI-powered platform for detecting AI-generated music with 97.2% accuracy. Advanced wav2vec2-based deep learning technology for streaming platforms, audio analysis, and music industry applications."
      keywords="AI music detection, wav2vec2, deep learning, audio analysis, machine learning, artificial intelligence, music technology, streaming platforms, professional audio tools, music industry, Spotify detection, YouTube analysis, Hasan Arthur Altuntaş"
    >
      <HeroSection />
      <ProjectsSection />
    </MainLayout>
  )
}

export default HomePage