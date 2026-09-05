'use client'

// =========================================================================
// PROJECTS SECTION COMPONENT
// =========================================================================
// Bento-style showcase of the platform's products. Cell size and visual
// treatment are grounded in what each product actually is, not a repeated
// card template: AURIS gets the flagship hero tile with its own imagery,
// Fortune and Dreams carry their mystical art direction, Commend and Vote
// (literal automation tools) get a leaner technical treatment, and
// Noir & Grain closes the grid full-width since it's a different product
// category entirely (a client showcase template, not a CrownCode tool).
// =========================================================================

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, Variants } from 'motion/react'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { PRODUCT_CATALOG, resolveProduct } from '@/config/product-catalog'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

const cellVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
}

interface ProjectsSectionProps {
  className?: string
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ className = '' }) => {
  const { t } = useLanguage()

  const byId = (id: string) => {
    const entry = PRODUCT_CATALOG.find((p) => p.id === id)
    if (!entry) {return null}
    return { entry, resolved: resolveProduct(entry, t) }
  }

  const auris = byId('ai-music-detection')
  const mlToolkit = byId('ml-toolkit')
  const fortune = byId('crown-fortune')
  const dreams = byId('crown-dreams')
  const commend = byId('crown-commend')
  const vote = byId('crown-vote')
  const noirGrain = byId('noir-grain')
  const kognita = byId('kognita')

  return (
    <section
      id="products"
      className={`products-section ${className}`}
      role="region"
      aria-label="Research modules and projects"
    >
      <div className="products-container">
        <motion.div
          className="products-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="products-badge">
            <Sparkles size={14} aria-hidden="true" />
            <span>{t.products.badge}</span>
          </div>
          <h2 className="products-title">
            {t.products.title}
            <span className="products-title-accent"> {t.products.titleAccent}</span>
          </h2>
          <p className="products-subtitle">{t.products.subtitle}</p>
        </motion.div>

        <motion.div
          className="bento-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          role="list"
          aria-label="Research projects"
        >
          {/* AURIS — flagship hero tile */}
          {auris && (
            <motion.div variants={cellVariants} className="bento-cell bento-cell--hero" role="listitem">
              <Link href={auris.entry.href} className="bento-tile bento-tile--auris" aria-label={`${auris.resolved.title} — ${auris.resolved.description}`}>
                <div className="bento-tile-media" aria-hidden="true">
                  <Image src="/images/auris/hero-wave.webp" alt="" fill sizes="(max-width: 768px) 100vw, 60vw" style={{ objectFit: 'cover' }} />
                  <div className="bento-tile-scrim bento-tile-scrim--auris" />
                </div>
                <div className="bento-tile-content">
                  <span className="bento-eyebrow">{auris.resolved.status}</span>
                  <h3 className="bento-title bento-title--lg">{auris.resolved.title}</h3>
                  <p className="bento-desc">{auris.resolved.description}</p>
                  <div className="bento-foot">
                    <span className="bento-metric">{auris.resolved.stats}</span>
                    <span className="bento-go" aria-hidden="true"><ArrowUpRight size={16} /></span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* ML Toolkit — compact companion to AURIS */}
          {mlToolkit && (
            <motion.div variants={cellVariants} className="bento-cell bento-cell--tall" role="listitem">
              <Link href={mlToolkit.entry.href} className="bento-tile bento-tile--data" aria-label={`${mlToolkit.resolved.title} — ${mlToolkit.resolved.description}`}>
                <div className="bento-tile-content">
                  <span className="bento-eyebrow">{mlToolkit.resolved.status}</span>
                  <h3 className="bento-title">{mlToolkit.resolved.title}</h3>
                  <p className="bento-desc">{mlToolkit.resolved.description}</p>
                  <div className="bento-foot">
                    <span className="bento-metric">{mlToolkit.resolved.stats}</span>
                    <span className="bento-go" aria-hidden="true"><ArrowUpRight size={16} /></span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Fortune — tarot art direction */}
          {fortune && (
            <motion.div variants={cellVariants} className="bento-cell bento-cell--tall" role="listitem">
              <Link href={fortune.entry.href} className="bento-tile bento-tile--fortune" aria-label={`${fortune.resolved.title} — ${fortune.resolved.description}`}>
                <div className="bento-tile-media bento-tile-media--tarot" aria-hidden="true">
                  <Image src="/tarot/wheel-of-fortune.png" alt="" width={120} height={200} className="bento-tarot-card" />
                </div>
                <div className="bento-tile-content">
                  <span className="bento-eyebrow">{fortune.resolved.status}</span>
                  <h3 className="bento-title">{fortune.resolved.title}</h3>
                  <p className="bento-desc">{fortune.resolved.description}</p>
                  <div className="bento-foot">
                    <span className="bento-metric">{fortune.resolved.stats}</span>
                    <span className="bento-go" aria-hidden="true"><ArrowUpRight size={16} /></span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Dreams — starfield glow */}
          {dreams && (
            <motion.div variants={cellVariants} className="bento-cell" role="listitem">
              <Link href={dreams.entry.href} className="bento-tile bento-tile--dreams" aria-label={`${dreams.resolved.title} — ${dreams.resolved.description}`}>
                <div className="bento-tile-content">
                  <span className="bento-eyebrow">{dreams.resolved.status}</span>
                  <h3 className="bento-title">{dreams.resolved.title}</h3>
                  <p className="bento-desc">{dreams.resolved.description}</p>
                  <div className="bento-foot">
                    <span className="bento-metric">{dreams.resolved.stats}</span>
                    <span className="bento-go" aria-hidden="true"><ArrowUpRight size={16} /></span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Commend — technical/terminal treatment (literal automation tool) */}
          {commend && (
            <motion.div variants={cellVariants} className="bento-cell" role="listitem">
              <Link href={commend.entry.href} className="bento-tile bento-tile--tool" aria-label={`${commend.resolved.title} — ${commend.resolved.description}`}>
                <div className="bento-tile-content">
                  <span className="bento-eyebrow bento-eyebrow--mono">{commend.resolved.status}</span>
                  <h3 className="bento-title">{commend.resolved.title}</h3>
                  <p className="bento-desc">{commend.resolved.description}</p>
                  <div className="bento-foot">
                    <span className="bento-metric bento-metric--mono">{commend.resolved.stats}</span>
                    <span className="bento-go" aria-hidden="true"><ArrowUpRight size={16} /></span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Vote — technical/terminal treatment (literal automation tool) */}
          {vote && (
            <motion.div variants={cellVariants} className="bento-cell" role="listitem">
              <Link href={vote.entry.href} className="bento-tile bento-tile--tool" aria-label={`${vote.resolved.title} — ${vote.resolved.description}`}>
                <div className="bento-tile-content">
                  <span className="bento-eyebrow bento-eyebrow--mono">{vote.resolved.status}</span>
                  <h3 className="bento-title">{vote.resolved.title}</h3>
                  <p className="bento-desc">{vote.resolved.description}</p>
                  <div className="bento-foot">
                    <span className="bento-metric bento-metric--mono">{vote.resolved.stats}</span>
                    <span className="bento-go" aria-hidden="true"><ArrowUpRight size={16} /></span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Kognita — external repo, no in-platform page; technical tool
              treatment like Commend/Vote, links out to GitHub directly */}
          {kognita && (
            <motion.div variants={cellVariants} className="bento-cell" role="listitem">
              <a
                href={kognita.entry.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bento-tile bento-tile--tool"
                aria-label={`${kognita.resolved.title} — ${kognita.resolved.description} (opens on GitHub)`}
              >
                <div className="bento-tile-content">
                  <span className="bento-eyebrow bento-eyebrow--mono">{kognita.resolved.status}</span>
                  <h3 className="bento-title">{kognita.resolved.title}</h3>
                  <p className="bento-desc">{kognita.resolved.description}</p>
                  <div className="bento-foot">
                    <span className="bento-metric bento-metric--mono">{kognita.resolved.stats}</span>
                    <span className="bento-go" aria-hidden="true"><ArrowUpRight size={16} /></span>
                  </div>
                </div>
              </a>
            </motion.div>
          )}

          {/* Noir & Grain — full-width closer, own product category */}
          {noirGrain && (
            <motion.div variants={cellVariants} className="bento-cell bento-cell--wide" role="listitem">
              <Link href={noirGrain.entry.href} className="bento-tile bento-tile--noir" aria-label={`${noirGrain.resolved.title} — ${noirGrain.resolved.description}`}>
                <div className="bento-tile-media" aria-hidden="true">
                  <Image src="/images/noir-grain/hero.png" alt="" fill sizes="(max-width: 768px) 100vw, 100vw" style={{ objectFit: 'cover' }} />
                  <div className="bento-tile-scrim bento-tile-scrim--noir" />
                </div>
                <div className="bento-tile-content bento-tile-content--row">
                  <div>
                    <span className="bento-eyebrow">{noirGrain.resolved.status}</span>
                    <h3 className="bento-title">{noirGrain.resolved.title}</h3>
                    <p className="bento-desc">{noirGrain.resolved.description}</p>
                  </div>
                  <div className="bento-foot bento-foot--col">
                    <span className="bento-metric">{noirGrain.resolved.stats}</span>
                    <span className="bento-go" aria-hidden="true"><ArrowUpRight size={16} /></span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="products-cta"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="cta-content">
            <h3>{t.products.cta.title}</h3>
            <p>{t.products.cta.description}</p>
            <a
              href="https://github.com/Rtur2003?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button"
              aria-label="View all repositories on GitHub (opens in new tab)"
            >
              <span>{t.products.cta.button}</span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ProjectsSection
