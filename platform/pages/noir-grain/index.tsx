import React from 'react'
import type { NextPage } from 'next'
import { motion } from 'motion/react'
import { UtensilsCrossed, ArrowUpRight, Terminal } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'

// =========================================================================
// NOIR & GRAIN SHOWCASE PAGE
// =========================================================================
// Presents the Noir & Grain fine-dining restaurant template as a
// sellable showcase product. Copy lives in locales under
// products.items.noirGrain(.page); screenshots in /images/noir-grain/.
// =========================================================================

const GALLERY = [
  { key: 'hero', src: '/images/noir-grain/hero.png' },
  { key: 'menu', src: '/images/noir-grain/menu.png' },
  { key: 'reservation', src: '/images/noir-grain/reservation.png' },
  { key: 'story', src: '/images/noir-grain/story.png' },
] as const

const TECH = ['React 19', 'Vite 8', 'Tailwind CSS', 'GSAP + ScrollTrigger', 'Lenis', 'OGL (WebGL)', 'Vitest'] as const

const NoirGrainPage: NextPage = () => {
  const { t } = useLanguage()
  const item = t.products?.items?.noirGrain
  const page = item?.page

  return (
    <MainLayout
      title={`${item?.title ?? 'Noir & Grain'} | CrownCode`}
      description={item?.description ?? ''}
      keywords="restaurant template, webgl, gsap, react, fine dining"
      url="https://hasanarthuraltuntas.xyz/noir-grain"
    >
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-32">
        {/* ===== HERO ===== */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-400">
            <UtensilsCrossed size={15} aria-hidden="true" />
            <span>{item?.stats}</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold md:text-6xl">{item?.title}</h1>
          <p className="max-w-2xl text-lg text-neutral-400">{page?.subtitle}</p>
        </motion.header>

        {/* ===== GALLERY ===== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-20"
        >
          <h2 className="mb-6 text-sm uppercase tracking-widest text-amber-400">{page?.galleryTitle}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {GALLERY.map(({ key, src }) => (
              <figure key={key} className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={page?.galleryItems?.[key] ?? key} loading="lazy" className="aspect-video w-full object-cover object-top transition-transform duration-500 hover:scale-[1.03]" />
                <figcaption className="px-4 py-3 text-sm text-neutral-400">
                  {page?.galleryItems?.[key]}
                </figcaption>
              </figure>
            ))}
          </div>
        </motion.div>

        {/* ===== ABOUT + TECH ===== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-20 grid gap-12 md:grid-cols-[1.4fr,1fr]"
        >
          <div>
            <h2 className="mb-4 text-sm uppercase tracking-widest text-amber-400">{page?.aboutTitle}</h2>
            <p className="leading-relaxed text-neutral-300">{page?.about}</p>
          </div>
          <div>
            <h2 className="mb-4 text-sm uppercase tracking-widest text-amber-400">{page?.techTitle}</h2>
            <div className="flex flex-wrap gap-2">
              {TECH.map(tech => (
                <span key={tech} className="rounded-full border border-neutral-700 px-3 py-1 text-sm text-neutral-300">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ===== RUN LOCALLY ===== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-xl border border-neutral-800 bg-neutral-900 p-6"
        >
          <h2 className="mb-3 flex items-center gap-2 text-sm uppercase tracking-widest text-amber-400">
            <Terminal size={15} aria-hidden="true" />
            {page?.runTitle}
          </h2>
          <pre className="overflow-x-auto rounded-lg bg-black/60 p-4 text-sm text-neutral-300">
            <code>{`cd templates/noir-grain\nnpm install\nnpm run dev`}</code>
          </pre>
          <p className="mt-3 flex items-center gap-1 text-sm text-neutral-500">
            {page?.sourceNote}
            <ArrowUpRight size={14} aria-hidden="true" />
          </p>
        </motion.div>
      </section>
    </MainLayout>
  )
}

export default NoirGrainPage
