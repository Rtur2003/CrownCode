import React from 'react'
import type { NextPage } from 'next'
import { MainLayout } from '@/components/Layout/MainLayout'
import { HeroSection } from '@/components/Home/HeroSection'
import { AboutSection } from '@/components/Home/AboutSection'
import { ProjectsSection } from '@/components/Home/ProjectsSection'

const HomePage: NextPage = () => {
  return (
    <MainLayout
      title="Hasan Arthur Altuntaş - Piyanist, Besteci ve Yapay Zeka Geliştiricisi"
      description="Piyanist, besteci ve bilgisayar mühendisi. Sinematik ambient müzik besteciliği ile yapay zeka geliştirmeyi birleştiren yaratıcı teknoloji uzmanı. Düzce Üniversitesi'nde AI müzik tespit sistemleri üzerine araştırmalar yapıyorum."
      keywords="Hasan Arthur Altuntaş, piyanist, besteci, yapay zeka geliştiricisi, AI music detection, wav2vec2, deep learning, audio analysis, sinematik müzik, ambient music, bilgisayar mühendisi, Düzce Üniversitesi, CrownCode"
    >
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
    </MainLayout>
  )
}

export default HomePage