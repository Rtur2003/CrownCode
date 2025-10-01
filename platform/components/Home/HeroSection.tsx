'use client'

// =========================================================================
// HERO SECTION COMPONENT
// =========================================================================
// Main landing page hero section featuring animated content, call-to-action
// buttons, and interactive elements. Showcases the CrownCode platform's
// AI music detection capabilities and research focus.
//
// Features:
// - Framer Motion animations for engaging user experience
// - Multi-language support (Turkish/English)
// - Responsive design with mobile optimization
// - Interactive code preview with syntax highlighting
// - Smooth scroll navigation to products section
//
// @author Hasan Arthur Altuntaş
// @version 1.0.0
// @since 2025-01-01
// =========================================================================

import React from 'react'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { ChevronDown, Code, Shield } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

// =========================================================================
// ANIMATION VARIANTS
// =========================================================================

/**
 * Animation variants for staggered entrance effects
 */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
}

// =========================================================================
// COMPONENT INTERFACES
// =========================================================================

/**
 * Props interface for HeroSection component
 */
interface HeroSectionProps {
  /** Optional CSS class name for additional styling */
  className?: string
}

// =========================================================================
// HERO SECTION COMPONENT
// =========================================================================

/**
 * HeroSection Component
 *
 * Main hero section that introduces the CrownCode platform with animated
 * content, feature highlights, and call-to-action buttons. Includes a
 * visual code preview demonstrating the AI music detection capabilities.
 *
 * @param props - Component props
 * @returns JSX.Element - Rendered hero section
 */
export const HeroSection: React.FC<HeroSectionProps> = ({ className = '' }) => {
  // -----------------------------------------------------------------------
  // HOOKS & STATE
  // -----------------------------------------------------------------------

  /** Translation hook for multi-language support */
  const { t } = useLanguage()

  // -----------------------------------------------------------------------
  // EVENT HANDLERS
  // -----------------------------------------------------------------------

  /**
   * Smoothly scrolls to the products section when called
   * Uses browser's native scrollIntoView for optimal performance
   */
  const scrollToProducts = (): void => {
    const productsSection = document.getElementById('products')
    if (productsSection) {
      productsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  // -----------------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------------

  return (
    <section className={`hero-section ${className}`} role="banner" aria-label="Hero section">
      {/* ===== BACKGROUND ELEMENTS ===== */}
      <div className="hero-background" aria-hidden="true">
        <div className="hero-gradient" />
        <div className="hero-pattern" />
      </div>

      {/* ===== MAIN CONTENT CONTAINER ===== */}
      <div className="hero-container">
        {/* ===== LEFT CONTENT AREA ===== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="hero-content"
        >
          {/* Main Title */}
          <motion.h1 className="hero-title" variants={itemVariants}>
            <span className="hero-title-main">{t.hero.title.main}</span>
            <span className="hero-title-accent">{t.hero.title.accent}</span>
          </motion.h1>

          {/* Subtitle Description */}
          <motion.p className="hero-subtitle" variants={itemVariants}>
            {t.hero.subtitle}
          </motion.p>

          {/* Feature Highlights */}
          <motion.div className="hero-features" variants={itemVariants}>
            <motion.div
              className="hero-feature"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Code size={18} aria-hidden="true" />
              <span>{t.hero.features.modern}</span>
            </motion.div>
            <motion.div
              className="hero-feature"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Shield size={18} aria-hidden="true" />
              <span>{t.hero.features.accuracy}</span>
            </motion.div>
          </motion.div>

          {/* Call-to-Action Buttons */}
          <motion.div className="hero-actions" variants={itemVariants}>
            <Link
              href="/ai-music-detection"
              className="hero-btn-primary"
              aria-label="Try AI music detection system"
            >
              {t.hero.cta.explore}
              <motion.div
                className="btn-shine"
                animate={{ x: [-100, 300] }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                aria-hidden="true"
              />
            </Link>
            <a
              href="https://github.com/hasanarthuraltuntas/Data-Manipilasyonu"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-btn-secondary"
              aria-label="View source code on GitHub (opens in new tab)"
            >
              {t.hero.cta.github}
            </a>
          </motion.div>
        </motion.div>

        {/* ===== RIGHT VISUAL AREA ===== */}
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Interactive code preview"
        >
          <div className="hero-card">
            {/* Code Editor Header */}
            <div className="hero-card-header">
              <div className="hero-card-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <span className="hero-card-title">CrownCode AI</span>
            </div>

            {/* Code Preview Content */}
            <div className="hero-card-content">
              <div className="hero-code-line">
                <span className="code-comment">// CrownCode AI Music Detection Platform</span>
              </div>
              <div className="hero-code-line">
                <span className="code-keyword">import</span>
                <span className="code-brace"> &#123; </span>
                <span className="code-variable">AIDetector</span>
                <span className="code-brace"> &#125; </span>
                <span className="code-keyword">from</span>
                <span className="code-string"> '@crowncode/platform'</span>
              </div>
              <div className="hero-code-line">
                <span className="code-keyword">const</span>
                <span className="code-variable"> analysis </span>
                <span className="code-operator">= </span>
                <span className="code-keyword">await </span>
                <span className="code-function">AIDetector</span>
                <span className="code-brace">(</span>
                <span className="code-string">'music.wav'</span>
                <span className="code-brace">)</span>
              </div>
              <div className="hero-code-line">
                <span className="code-comment">// Professional AI Detection | Accuracy: 97.2%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== SCROLL INDICATOR ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="hero-scroll"
        onClick={scrollToProducts}
        role="button"
        tabIndex={0}
        aria-label="Scroll to products section"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            scrollToProducts()
          }
        }}
      >
        <motion.div
          className="scroll-indicator"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown size={20} aria-hidden="true" />
        </motion.div>
        <span>{t.hero.scroll}</span>
      </motion.div>
    </section>
  )
}

export default HeroSection