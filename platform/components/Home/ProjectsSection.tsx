'use client'

// =========================================================================
// PROJECTS SECTION COMPONENT
// =========================================================================
// Showcases the main research modules and projects of the CrownCode platform.
// Features interactive cards with hover effects, status indicators, and
// detailed information about each research area.
//
// Features:
// - Animated project cards with hover effects
// - Status indicators (Active, Developing, Planned)
// - Performance metrics and feature highlights
// - Responsive grid layout for all screen sizes
// - Call-to-action section for additional projects
//
// @author Hasan Arthur Altuntaş
// @version 1.0.0
// @since 2025-01-01
// =========================================================================

import React from 'react'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { Music, Brain, ArrowUpRight, Sparkles, Activity, LucideIcon } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

// =========================================================================
// ANIMATION VARIANTS
// =========================================================================

/**
 * Animation variants for container stagger effect
 */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
}

/**
 * Animation variants for individual project cards
 */
const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6
    }
  }
}

// =========================================================================
// TYPE DEFINITIONS
// =========================================================================

/**
 * Product/Project configuration interface
 */
interface ProductConfig {
  /** Unique identifier for the project */
  id: string
  /** Display title of the project */
  title: string
  /** Detailed description of the project */
  description: string
  /** Internal route path */
  href: string
  /** Lucide icon component */
  icon: LucideIcon
  /** Tailwind gradient classes for styling */
  gradient: string
  /** Current development status */
  status: string
  /** Key performance metric */
  stats: string
  /** Array of key features */
  features: string[]
}

/**
 * Component props interface
 */
interface ProjectsSectionProps {
  /** Optional CSS class name for additional styling */
  className?: string
}

// =========================================================================
// PROJECTS SECTION COMPONENT
// =========================================================================

/**
 * ProjectsSection Component
 *
 * Displays the main research modules and projects with interactive cards,
 * status indicators, and detailed information about each research area.
 * Includes a call-to-action section for additional projects.
 *
 * @param props - Component props
 * @returns JSX.Element - Rendered projects section
 */
export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ className = '' }) => {
  // -----------------------------------------------------------------------
  // HOOKS & STATE
  // -----------------------------------------------------------------------

  /** Translation hook for multi-language support */
  const { t } = useLanguage()

  // -----------------------------------------------------------------------
  // DATA CONFIGURATION
  // -----------------------------------------------------------------------

  /**
   * Product configurations for all research modules
   * Each product represents a major research area of the platform
   */

  const products: ProductConfig[] = [
    {
      id: 'ai-music-detection',
      title: t.products.items.aiMusic.title,
      description: t.products.items.aiMusic.description,
      href: '/ai-music-detection',
      icon: Music,
      gradient: 'from-amber-400 via-yellow-500 to-orange-600',
      status: t.products.items.aiMusic.status,
      stats: t.products.items.aiMusic.stats,
      features: t.products.items.aiMusic.features
    }
    ,
    {
      id: 'ml-toolkit',
      title: t.products.items.mlToolkit.title,
      description: t.products.items.mlToolkit.description,
      href: '/data-manipulation',
      icon: Brain,
      gradient: 'from-blue-400 via-cyan-500 to-teal-600',
      status: t.products.items.mlToolkit.status,
      stats: t.products.items.mlToolkit.stats,
      features: t.products.items.mlToolkit.features
    }
  ]

  // -----------------------------------------------------------------------
  // HELPER FUNCTIONS
  // -----------------------------------------------------------------------

  /**
   * Returns appropriate CSS classes for status indicators
   * @param status - Current project status
   * @returns CSS class string for status styling
   */
  const getStatusClass = (status: string): string => {
    if (status === 'Aktif' || status === 'Research Active') return 'active'
    if (status === 'Geliştiriliyor' || status === 'Developing') return 'developing'
    return 'planned'
  }

  // -----------------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------------

  return (
    <section
      id="products"
      className={`products-section ${className}`}
      role="region"
      aria-label="Research modules and projects"
    >
      <div className="products-container">
        {/* ===== SECTION HEADER ===== */}
        <motion.div
          className="products-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Section Badge */}
          <div className="products-badge" role="img" aria-label="Research modules indicator">
            <Sparkles size={16} aria-hidden="true" />
            <span>{t.products.badge}</span>
          </div>

          {/* Section Title */}
          <h2 className="products-title">
            {t.products.title}
            <span className="products-title-accent"> {t.products.titleAccent}</span>
          </h2>

          {/* Section Description */}
          <p className="products-subtitle">{t.products.subtitle}</p>
        </motion.div>

        {/* ===== PROJECTS GRID ===== */}
        <motion.div
          className="products-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          role="list"
          aria-label="Research projects"
        >
          {products.map((product) => {
            const Icon = product.icon

            return (
              <motion.div
                key={product.id}
                variants={cardVariants}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                role="listitem"
              >
                <Link
                  href={product.href}
                  className="product-card"
                  aria-label={`Explore ${product.title} - ${product.description}`}
                >
                  <div className="product-card-inner">
                    {/* ===== STATUS INDICATOR ===== */}
                    <div className="product-status" role="status">
                      <div
                        className={`status-dot ${getStatusClass(product.status)}`}
                        aria-hidden="true"
                      />
                      <span>{product.status}</span>
                    </div>

                    {/* ===== PROJECT ICON ===== */}
                    <div className="product-icon-container">
                      <div
                        className={`product-icon-bg bg-gradient-to-r ${product.gradient}`}
                        aria-hidden="true"
                      />
                      <Icon className="product-icon" size={32} aria-hidden="true" />
                    </div>

                    {/* ===== PROJECT CONTENT ===== */}
                    <div className="product-content">
                      {/* Project Title */}
                      <h3 className="product-title">{product.title}</h3>

                      {/* Project Description */}
                      <p className="product-description">{product.description}</p>

                      {/* Performance Stats */}
                      <div className="product-stats" role="group" aria-label="Performance metrics">
                        <div className="stat-item">
                          <Activity size={14} aria-hidden="true" />
                          <span>{product.stats}</span>
                        </div>
                      </div>

                      {/* Feature Tags */}
                      <div
                        className="product-features"
                        role="group"
                        aria-label={`${product.title} key features`}
                      >
                        {product.features.map((feature, idx) => (
                          <span key={idx} className="feature-tag">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* ===== NAVIGATION ARROW ===== */}
                    <div className="product-arrow" aria-hidden="true">
                      <ArrowUpRight size={20} />
                    </div>

                    {/* ===== HOVER EFFECT OVERLAY ===== */}
                    <div className="product-hover-effect" aria-hidden="true" />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {/* ===== CALL-TO-ACTION SECTION ===== */}
        <motion.div
          className="products-cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          role="complementary"
          aria-label="Additional projects information"
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