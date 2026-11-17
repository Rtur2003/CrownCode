// Noir & Grain: visual template gallery with lightbox inspection and a compact single
// technical footer band combining overview specs, stack chips, and run commands.

import React, { useState } from 'react'
import type { NextPage } from 'next'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { Modal } from '@/components/UI/Modal'
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
  const { t, language } = useLanguage()
  const item = t.products.items.noirGrain
  const page = item.page
  const isTr = language === 'tr'
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const currentShot = lightboxIndex !== null ? GALLERY[lightboxIndex] : null

  return (
    <MainLayout title={item.title} description={page.metaDescription} keywords="restaurant template, webgl, gsap, react, fine dining">
      <WorldPage world="noir-grain" title="Noir & Grain" lead={page.subtitle}>
        <section className={world.section} aria-labelledby="noir-gallery-title">
          <div className={world.sectionHead}>
            <h2 id="noir-gallery-title">{page.galleryTitle}</h2>
            <p className={world.hint}>{page.about}</p>
          </div>
          <div className={world.sectionBody}>
            <div className={styles.gallery}>
              {GALLERY.map(({ key, src }, index) => (
                <figure key={key} className={styles.shot}>
                  <button
                    type="button"
                    className={styles.shotButton}
                    onClick={() => setLightboxIndex(index)}
                    aria-label={`${page.galleryItems[key]} - ${isTr ? 'Büyüt' : 'Preview'}`}
                  >
                    <Image
                      src={src}
                      alt={page.galleryItems[key]}
                      width={1440}
                      height={900}
                      sizes="(max-width: 860px) 100vw, 400px"
                      loading={index < 2 ? 'eager' : 'lazy'}
                    />
                    <span className={styles.zoomBadge} aria-hidden="true">
                      <Maximize2 size={14} />
                    </span>
                  </button>
                  <figcaption>{page.galleryItems[key]}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className={world.section} aria-labelledby="noir-about-title">
          <div className={world.sectionHead}>
            <h2 id="noir-about-title">{page.techTitle} & {page.runTitle}</h2>
            <p>{page.sourceNote}</p>
          </div>
          <div className={world.sectionBody}>
            <ul className={styles.tech}>
              {TECH.map(tech => <li key={tech}>{tech}</li>)}
            </ul>
            <pre className={styles.code}><code>{RUN_COMMANDS}</code></pre>
            <dl className={world.margins}>
              {page.specs.map((spec: { label: string; value: string }) => (
                <div key={spec.label}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className={world.section} aria-labelledby="noir-arch-title">
          <div className={world.sectionHead}>
            <h2 id="noir-arch-title">{page.architectureTitle}</h2>
          </div>
          <div className={world.sectionBody}>
            {page.architectureBody.map((paragraph: string, index: number) => (
              <p
                key={paragraph}
                className={world.interpretation}
                style={index > 0 ? { marginTop: '14px' } : undefined}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <Modal
          open={currentShot !== null}
          onClose={() => setLightboxIndex(null)}
          title={currentShot ? page.galleryItems[currentShot.key] : ''}
          subtitle="Noir & Grain"
          closeLabel={isTr ? 'Kapat' : 'Close'}
          size="lg"
          footer={
            currentShot ? (
              <>
                <button
                  type="button"
                  className={world.link}
                  onClick={() => setLightboxIndex(i => (i === null ? 0 : (i - 1 + GALLERY.length) % GALLERY.length))}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <ChevronLeft size={15} />
                  <span>{isTr ? 'Önceki' : 'Previous'}</span>
                </button>
                <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.8rem', color: 'var(--muted)' }}>
                  {(lightboxIndex ?? 0) + 1} / {GALLERY.length}
                </span>
                <button
                  type="button"
                  className={world.link}
                  onClick={() => setLightboxIndex(i => (i === null ? 0 : (i + 1) % GALLERY.length))}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>{isTr ? 'Sonraki' : 'Next'}</span>
                  <ChevronRight size={15} />
                </button>
              </>
            ) : undefined
          }
        >
          {currentShot && (
            <Image
              src={currentShot.src}
              alt={page.galleryItems[currentShot.key]}
              width={1440}
              height={900}
              sizes="(max-width: 900px) 95vw, 820px"
              style={{ width: '100%', height: 'auto', border: '1px solid var(--line-strong)', borderRadius: '2px' }}
            />
          )}
        </Modal>
      </WorldPage>
    </MainLayout>
  )
}

export default NoirGrainPage
