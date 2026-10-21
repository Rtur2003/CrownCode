// Noir & Grain: a restaurant website template, shown as screenshots with the notes
// that matter (what it is, what it is built with, how to run it).

import React from 'react'
import type { NextPage } from 'next'
import Image from 'next/image'
import { MainLayout } from '@/components/Layout/MainLayout'
import { WorldPage } from '@/components/UI/WorldPage'
import { useLanguage } from '@/context/LanguageContext'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/noir-grain.module.css'

const GALLERY = [
  { key: 'hero', src: '/images/noir-grain/hero.webp' },
  { key: 'menu', src: '/images/noir-grain/menu.webp' },
  { key: 'reservation', src: '/images/noir-grain/reservation.webp' },
  { key: 'story', src: '/images/noir-grain/story.webp' },
] as const

const TECH = ['React 19', 'Vite 8', 'Tailwind CSS', 'GSAP + ScrollTrigger', 'Lenis', 'OGL (WebGL)', 'Vitest'] as const

const RUN_COMMANDS = 'cd templates/noir-grain\nnpm install\nnpm run dev'

const NoirGrainPage: NextPage = () => {
  const { t } = useLanguage()
  const item = t.products.items.noirGrain
  const page = item.page

  return (
    <MainLayout title={item.title} description={page.metaDescription} keywords="restaurant template, webgl, gsap, react, fine dining">
      <WorldPage world="noir-grain" title="Noir & Grain" lead={page.subtitle}>
        <section className={world.section} aria-labelledby="noir-gallery-title">
          <div className={world.sectionHead}>
            <h2 id="noir-gallery-title">{page.galleryTitle}</h2>
          </div>
          <div className={world.sectionBody}>
            <div className={styles.gallery}>
              {GALLERY.map(({ key, src }, index) => (
                <figure key={key} className={styles.shot}>
                  <Image
                    src={src}
                    alt={page.galleryItems[key]}
                    width={1440}
                    height={900}
                    sizes="(max-width: 860px) 100vw, 400px"
                    loading={index < 2 ? 'eager' : 'lazy'}
                  />
                  <figcaption>{page.galleryItems[key]}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className={world.section} aria-labelledby="noir-about-title">
          <div className={world.sectionHead}>
            <h2 id="noir-about-title">{page.aboutTitle}</h2>
          </div>
          <div className={world.sectionBody}>
            <p className={world.interpretation}>{page.about}</p>
          </div>
        </section>

        <section className={world.section} aria-labelledby="noir-tech-title">
          <div className={world.sectionHead}>
            <h2 id="noir-tech-title">{page.techTitle}</h2>
          </div>
          <div className={world.sectionBody}>
            <ul className={styles.tech}>
              {TECH.map(tech => <li key={tech}>{tech}</li>)}
            </ul>
          </div>
        </section>

        <section className={world.section} aria-labelledby="noir-run-title">
          <div className={world.sectionHead}>
            <h2 id="noir-run-title">{page.runTitle}</h2>
            <p>{page.sourceNote}</p>
          </div>
          <div className={world.sectionBody}>
            <pre className={styles.code}><code>{RUN_COMMANDS}</code></pre>
          </div>
        </section>
      </WorldPage>
    </MainLayout>
  )
}

export default NoirGrainPage
