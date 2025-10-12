import React from 'react'
import type { NextPage } from 'next'
import { MainLayout } from '@/components/Layout/MainLayout'
import { HeroSection } from '@/components/Home/HeroSection'

import { ProjectsSection } from '@/components/Home/ProjectsSection'

const HomePage: NextPage = () => {
  return (
<MainLayout
  title="CrownCode Platform - Açık Kaynak Proje Sergisi & Demo Uygulamaları"
  description="Yazılım projeleri, araştırma çalışmaları ve geliştirme süreçlerinin sergilendiği merkezi platform. AI müzik tespiti, veri manipülasyonu ve diğer açık kaynak projelerin demo uygulamaları."
  keywords="CrownCode, açık kaynak projeler, demo uygulamalar, AI music detection, veri manipülasyonu, ML toolkit, proje sergisi, yazılım projeleri, GitHub, Hasan Arthur Altuntaş"
    >
      <HeroSection />
      <ProjectsSection />
    </MainLayout>
  )
}

export default HomePage
