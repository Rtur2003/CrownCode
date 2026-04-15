'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion, Variants } from 'motion/react'
import { ChevronDown, Code, Shield, Github, Zap } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

// =========================================================================
// ANIMATION VARIANTS
// =========================================================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  }
}

const glowVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
  }
}

// =========================================================================
// COMPONENT
// =========================================================================

interface HeroSectionProps {
  className?: string
}

export const HeroSection: React.FC<HeroSectionProps> = ({ className = '' }) => {
  const { t } = useLanguage()
  const prefersReducedMotion = useReducedMotion()

  const scrollToProducts = (): void => {
    const productsSection = document.getElementById('products')
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className={`hero-section ${className}`} aria-label="Hero section">
      {/* ===== LAYERED BACKGROUND ===== */}
      <div className="hero-background" aria-hidden="true">
        {/* Base gradient */}
        <div className="hero-gradient" />
        {/* Sound wave background image */}
        <div className="hero-bg-wave">
          <Image
            src="/images/auris/hero-wave.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        </div>
        {/* Dot pattern overlay */}
        <div className="hero-pattern" />
        {/* Vignette overlay */}
        <div className="hero-vignette" />
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="hero-container">
        {/* ===== LEFT: TEXT CONTENT ===== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="hero-content"
        >
          {/* Platform Badge */}
          <motion.div className="hero-badge" variants={itemVariants}>
            <Zap size={14} />
            <span>{t.hero.badge || 'Open Source'}</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1 className="hero-title" variants={itemVariants}>
            <span className="hero-title-main">{t.hero.title.main}</span>
            <span className="hero-title-accent">{t.hero.title.accent}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p className="hero-subtitle" variants={itemVariants}>
            {t.hero.subtitle}
          </motion.p>

          {/* Feature Pills */}
          <motion.div className="hero-features" variants={itemVariants}>
            <motion.div
              className="hero-feature"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(201, 147, 71, 0.15)' }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Code size={16} aria-hidden="true" />
              <span>{t.hero.features.modern}</span>
            </motion.div>
            <motion.div
              className="hero-feature"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(201, 147, 71, 0.15)' }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Shield size={16} aria-hidden="true" />
              <span>{t.hero.features.accuracy}</span>
            </motion.div>
            <motion.div
              className="hero-feature"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(201, 147, 71, 0.15)' }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Github size={16} aria-hidden="true" />
              <span>{t.hero.features?.github || 'GitHub'}</span>
            </motion.div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div className="hero-actions" variants={itemVariants}>
            <Link
              href="/ai-music-detection"
              className="hero-btn-primary"
              aria-label="Try AI music detection system"
            >
              {t.hero.cta.explore}
              {!prefersReducedMotion && (
                <motion.div
                  className="btn-shine"
                  animate={{ x: [-100, 300] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  aria-hidden="true"
                />
              )}
            </Link>
            <a
              href="https://github.com/Rtur2003/CrownCode"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-btn-secondary"
              aria-label="View source code on GitHub (opens in new tab)"
            >
              {t.hero.cta.github}
            </a>
          </motion.div>
        </motion.div>

        {/* ===== RIGHT: VISUAL SHOWCASE ===== */}
        <motion.div
          className="hero-visual"
          initial="hidden"
          animate="visible"
          variants={glowVariants}
          aria-label="AURIS visual showcase"
        >
          {/* Outer rotating rings */}
          <motion.div
            className="hero-orb-rings"
            {...(prefersReducedMotion ? {} : {
              animate: { rotate: 360 },
              transition: { repeat: Infinity, duration: 30, ease: "linear" as const }
            })}
          >
            <Image
              src="/images/auris/sound-rings.webp"
              alt=""
              width={520}
              height={520}
              className="hero-rings-img"
              priority
            />
          </motion.div>

          {/* Central glowing orb */}
          <motion.div
            className="hero-orb-center"
            {...(prefersReducedMotion ? {} : {
              animate: { scale: [1, 1.04, 1], opacity: [0.9, 1, 0.9] },
              transition: { repeat: Infinity, duration: 4, ease: "easeInOut" as const }
            })}
          >
            <Image
              src="/images/auris/sound-orb.webp"
              alt="AURIS Sound Analysis Orb"
              width={380}
              height={380}
              className="hero-orb-img"
              priority
            />
          </motion.div>

          {/* Floating speaker element */}
          <motion.div
            className="hero-speaker-float"
            {...(prefersReducedMotion ? {} : {
              animate: { y: [0, -12, 0], rotate: [0, 3, -3, 0] },
              transition: { repeat: Infinity, duration: 6, ease: "easeInOut" as const }
            })}
          >
            <Image
              src="/images/auris/speaker.webp"
              alt=""
              width={140}
              height={140}
              className="hero-speaker-img"
            />
          </motion.div>

          {/* Platform label overlay on orb */}
          <motion.div
            className="hero-orb-label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <span className="orb-label-text">{t.hero.orb?.title || 'CrownCode'}</span>
            <span className="orb-label-sub">{t.hero.orb?.sub || 'Platform'}</span>
          </motion.div>

          {/* Glow pulse behind orb */}
          <div className="hero-orb-glow" />
        </motion.div>
      </div>

      {/* ===== SCROLL INDICATOR ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="hero-scroll"
        onClick={scrollToProducts}
        role="button"
        tabIndex={0}
        aria-label="Scroll to products section"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { scrollToProducts() }
        }}
      >
        <motion.div
          className="scroll-indicator"
          {...(prefersReducedMotion ? {} : {
            animate: { y: [0, 8, 0] },
            transition: { repeat: Infinity, duration: 2, ease: "easeInOut" as const }
          })}
        >
          <ChevronDown size={20} aria-hidden="true" />
        </motion.div>
        <span>{t.hero.scroll}</span>
      </motion.div>
    </section>
  )
}

export default HeroSection
