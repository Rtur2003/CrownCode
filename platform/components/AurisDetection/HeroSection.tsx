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
import { motion, useReducedMotion, Variants } from 'framer-motion'
import { ChevronDown, Shield, Waves, Cpu, Music } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import styles from '@/styles/components/auris-hero.module.css'

// =========================================================================
// ANIMATION VARIANTS
// =========================================================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  }
}

const visualVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
  }
}

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
            priority
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
            priority
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
        <motion.div
          className={styles.content}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div className={styles.badge} variants={itemVariants}>
            <Shield size={14} aria-hidden="true" />
            <span>{t.aiDetection.header.badge}</span>
          </motion.div>

          {/* Title */}
          <motion.h1 className={styles.title} variants={itemVariants}>
            <span className={styles.titleMain}>AURIS</span>
            <span className={styles.titleAccent}>
              {t.aiDetection.hero?.accent || 'AI Music Detection'}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p className={styles.subtitle} variants={itemVariants}>
            {t.aiDetection.hero?.description || t.aiDetection.header.subtitle}
          </motion.p>

          {/* Feature pills */}
          <motion.div className={styles.features} variants={itemVariants}>
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
          </motion.div>

          {/* CTA */}
          <motion.div className={styles.actions} variants={itemVariants}>
            <button
              className={styles.btnPrimary}
              onClick={onScrollToDetection}
              aria-label={t.aiDetection.hero?.cta || 'Start Analysis'}
            >
              <span>{t.aiDetection.hero?.cta || 'Start Analysis'}</span>
              <motion.div
                className={styles.btnShine}
                animate={{ x: [-120, 320] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}
                aria-hidden="true"
              />
            </button>
          </motion.div>
        </motion.div>

        {/* ===== RIGHT: VISUAL ===== */}
        <motion.div
          className={styles.visual}
          variants={visualVariants}
          initial="hidden"
          animate="visible"
          aria-hidden="true"
        >
          {/* Glow pulse */}
          <div className={styles.orbGlow} />

          {/* Outer rings — slow rotation */}
          <motion.div
            className={styles.ringsWrap}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 35, ease: 'linear' }}
          >
            <Image
              src="/images/auris/sound-rings.webp"
              alt=""
              width={480}
              height={480}
              className={styles.ringsImg}
              priority
            />
          </motion.div>

          {/* Central speaker visual — breathing */}
          <motion.div
            className={styles.centerWrap}
            animate={{ scale: [1, 1.03, 1], opacity: [0.95, 1, 0.95] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          >
            <Image
              src="/images/auris/speaker.webp"
              alt=""
              width={420}
              height={420}
              className={styles.centerImg}
              priority
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
            animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
          >
            <Image
              src="/images/auris/sound-orb.webp"
              alt=""
              width={120}
              height={120}
              className={styles.floatingOrbImg}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* ===== SCROLL INDICATOR ===== */}
      <motion.button
        className={styles.scrollCta}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        onClick={onScrollToDetection}
        aria-label={t.aiDetection.hero?.scrollLabel || 'Scroll to detection tool'}
      >
        <motion.div
          className={styles.scrollIcon}
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ChevronDown size={20} aria-hidden="true" />
        </motion.div>
        <span>{t.aiDetection.hero?.scroll || t.hero?.scroll || 'Explore'}</span>
      </motion.button>
    </section>
  )
}

export default AurisHeroSection
