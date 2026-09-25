// =========================================================================
// AURIS DETECTION — HERO SECTION
// =========================================================================
// Cinematic hero for the AI Music Detection page.
// Uses layered backgrounds, animated orb visual, and scroll CTA.
//
// @author CrownCode
// =========================================================================

import React from 'react'
import Image from 'next/image'
import type { CSSProperties } from 'react'
import { m as motion, useReducedMotion } from 'motion/react'
import { ChevronDown, Shield, Waves, Cpu, Music } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import styles from '@/styles/components/auris-hero.module.css'

// =========================================================================
// ENTRANCE
// =========================================================================
// Staggered CSS entrances (.enter-rise) instead of Motion variants: the hero
// text is the LCP element and must be visible in the server HTML.

const stagger = (index: number) => ({ '--enter-delay': `${0.08 + index * 0.1}s` }) as CSSProperties

// =========================================================================
// COMPONENT
// =========================================================================

interface AurisHeroProps {
  onScrollToDetection: () => void
}

export const AurisHeroSection: React.FC<AurisHeroProps> = ({ onScrollToDetection }) => {
  const { t } = useLanguage()
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className={styles.hero} aria-label="AURIS Hero">
      {/* ===== LAYERED BACKGROUND ===== */}
      <div className={styles.bgLayers} aria-hidden="true">
        {/* Ambient gradient background image */}
        <div className={styles.bgAmbient}>
          <Image
            src="/images/auris/gradient-bg.webp"
            alt=""
            fill
            preload
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* Sound wave overlay */}
        <div className={styles.bgWave}>
          <Image
            src="/images/auris/hero-wave.webp"
            alt=""
            fill
            loading="eager"
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center 60%' }}
          />
        </div>

        {/* Dot pattern */}
        <div className={styles.bgPattern} />

        {/* Vignette */}
        <div className={styles.bgVignette} />
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className={styles.container}>
        {/* ===== LEFT: TEXT ===== */}
        <div className={styles.content}>
          {/* Badge */}
          <div className={`${styles.badge} enter-rise`} style={stagger(0)}>
            <Shield size={14} aria-hidden="true" />
            <span>{t.aiDetection.header.badge}</span>
          </div>

          {/* Title */}
          <h1 className={`${styles.title} enter-rise`} style={stagger(1)}>
            <span className={styles.titleMain}>AURIS</span>
            <span className={styles.titleAccent}>
              {t.aiDetection.hero?.accent || 'AI Music Detection'}
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`${styles.subtitle} enter-rise`} style={stagger(2)}>
            {t.aiDetection.hero?.description || t.aiDetection.header.subtitle}
          </p>

          {/* Feature pills */}
          <div className={`${styles.features} enter-rise`} style={stagger(3)}>
            <div className={styles.feature}>
              <Waves size={16} aria-hidden="true" />
              <span>wav2vec2</span>
            </div>
            <div className={styles.feature}>
              <Cpu size={16} aria-hidden="true" />
              <span>{t.aiDetection.hero?.featureDeep || 'Deep Analysis'}</span>
            </div>
            <div className={styles.feature}>
              <Music size={16} aria-hidden="true" />
              <span>{t.aiDetection.hero?.featureMulti || 'Multi-Source'}</span>
            </div>
          </div>

          {/* CTA */}
          <div className={`${styles.actions} enter-rise`} style={stagger(4)}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={onScrollToDetection}
              aria-label={t.aiDetection.hero?.cta || 'Start Analysis'}
            >
              <span>{t.aiDetection.hero?.cta || 'Start Analysis'}</span>
              {!prefersReducedMotion && (
                <motion.div
                  className={styles.btnShine}
                  animate={{ x: [-120, 320] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}
                  aria-hidden="true"
                />
              )}
            </button>
          </div>
        </div>

        {/* ===== RIGHT: VISUAL ===== */}
        <div className={`${styles.visual} enter-fade`} style={stagger(2)} aria-hidden="true">
          {/* Glow pulse */}
          <div className={styles.orbGlow} />

          {/* Outer rings — slow rotation */}
          <motion.div
            className={styles.ringsWrap}
            {...(prefersReducedMotion ? {} : {
              animate: { rotate: 360 },
              transition: { repeat: Infinity, duration: 35, ease: 'linear' as const }
            })}
          >
            <Image
              src="/images/auris/sound-rings.webp"
              alt=""
              width={480}
              height={480}
              className={styles.ringsImg}
              loading="eager"
            />
          </motion.div>

          {/* Central speaker visual — breathing */}
          <motion.div
            className={styles.centerWrap}
            {...(prefersReducedMotion ? {} : {
              animate: { scale: [1, 1.03, 1], opacity: [0.95, 1, 0.95] },
              transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' as const }
            })}
          >
            <Image
              src="/images/auris/speaker.webp"
              alt=""
              width={420}
              height={420}
              className={styles.centerImg}
              loading="eager"
            />
          </motion.div>

          {/* AURIS label overlay */}
          <motion.div
            className={styles.orbLabel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <span className={styles.orbLabelText}>AURIS</span>
            <span className={styles.orbLabelSub}>Detection Engine</span>
          </motion.div>

          {/* Floating orb accent — bottom-right */}
          <motion.div
            className={styles.floatingOrb}
            {...(prefersReducedMotion ? {} : {
              animate: { y: [0, -10, 0], rotate: [0, 5, -5, 0] },
              transition: { repeat: Infinity, duration: 7, ease: 'easeInOut' as const }
            })}
          >
            <Image
              src="/images/auris/sound-orb.webp"
              alt=""
              width={120}
              height={120}
              className={styles.floatingOrbImg}
            />
          </motion.div>
        </div>
      </div>

      {/* ===== SCROLL INDICATOR ===== */}
      <motion.button
        type="button"
        className={styles.scrollCta}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        onClick={onScrollToDetection}
        aria-label={t.aiDetection.hero?.scrollLabel || 'Scroll to detection tool'}
      >
        <motion.div
          className={styles.scrollIcon}
          {...(prefersReducedMotion ? {} : {
            animate: { y: [0, 6, 0] },
            transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' as const }
          })}
        >
          <ChevronDown size={20} aria-hidden="true" />
        </motion.div>
        <span>{t.aiDetection.hero?.scroll || t.hero?.scroll || 'Explore'}</span>
      </motion.button>
    </section>
  )
}

export default AurisHeroSection
