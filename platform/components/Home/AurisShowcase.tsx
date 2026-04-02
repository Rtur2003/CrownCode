'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import {
  Waves, Brain, Mic2, Radio, Network,
  BarChart3, Target, Layers, ArrowRight,
  Music, AudioWaveform, Fingerprint
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import styles from '@/styles/components/auris-showcase.module.css'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  }
}

interface AnimatedCounterProps {
  end: number
  suffix?: string
  duration?: number
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (hasAnimated) return
    setHasAnimated(true)
    const startTime = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration, hasAnimated])

  return <span>{count}{suffix}</span>
}

const towers = [
  { id: 'tower1', icon: Waves, color: '#6b8fbf', label: 'wav2vec2' },
  { id: 'tower2', icon: Fingerprint, color: '#c99347', label: '49 Features' },
  { id: 'tower3', icon: Radio, color: '#7fb069', label: 'CLAP' },
  { id: 'tower4', icon: Network, color: '#a64b8f', label: 'FST API' },
]

export const AurisShowcase: React.FC = () => {
  const { t } = useLanguage()
  const aurisT = t.aurisShowcase

  return (
    <section className={styles.section} aria-label="AURIS Showcase">
      <div className={styles.bgGlow} aria-hidden="true" />

      <div className={styles.container}>
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.badge}>
            <Brain size={16} />
            <span>{aurisT?.badge || 'Research Project'}</span>
          </div>
          <h2 className={styles.title}>
            {aurisT?.title || 'AURIS'}
            <span className={styles.titleAccent}> {aurisT?.titleAccent || 'AI Music Detection'}</span>
          </h2>
          <p className={styles.subtitle}>
            {aurisT?.subtitle || '4-Tower deep learning architecture for detecting AI-generated music with 49-feature acoustic fingerprinting'}
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className={styles.statsRow}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { value: 4, suffix: '', label: aurisT?.stats?.towers || 'Analysis Towers', icon: Layers },
            { value: 49, suffix: '', label: aurisT?.stats?.features || 'Acoustic Features', icon: AudioWaveform },
            { value: 7, suffix: '', label: aurisT?.stats?.models || 'ML Models', icon: BarChart3 },
            { value: 14, suffix: '', label: aurisT?.stats?.vocal || 'Vocal Features', icon: Mic2 },
          ].map((stat, i) => (
            <motion.div key={i} className={styles.statCard} variants={itemVariants}>
              <stat.icon size={20} className={styles.statIcon} />
              <div className={styles.statValue}>
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Architecture Visualization */}
        <motion.div
          className={styles.architectureSection}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h3 className={styles.archTitle}>
            <Target size={18} />
            {aurisT?.archTitle || '4-Tower Architecture'}
          </h3>

          <div className={styles.towerGrid}>
            {towers.map((tower, i) => (
              <motion.div
                key={tower.id}
                className={styles.towerCard}
                style={{ '--tower-color': tower.color } as React.CSSProperties}
                whileHover={{ y: -6, scale: 1.02 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.4, duration: 0.5 }}
              >
                <div className={styles.towerIconWrap}>
                  <tower.icon size={24} />
                </div>
                <div className={styles.towerLabel}>{tower.label}</div>
                <div className={styles.towerDesc}>
                  {aurisT?.towers?.[tower.id] || `Tower ${i + 1}`}
                </div>
                {/* Pulse animation */}
                <motion.div
                  className={styles.towerPulse}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
                />
              </motion.div>
            ))}
          </div>

          {/* Connector to Meta-Classifier */}
          <div className={styles.connectorArea}>
            <div className={styles.connectorLines} aria-hidden="true">
              {towers.map((_, i) => (
                <motion.div
                  key={i}
                  className={styles.connectorLine}
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                />
              ))}
            </div>
            <motion.div
              className={styles.metaClassifier}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <Brain size={20} />
              <span>{aurisT?.meta || 'Meta-Classifier'}</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Feature Categories */}
        <motion.div
          className={styles.featureGrid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { icon: Music, count: 18, label: aurisT?.featureCats?.spectral || 'Spectral', color: '#6b8fbf' },
            { icon: AudioWaveform, count: 9, label: aurisT?.featureCats?.temporal || 'Temporal', color: '#c99347' },
            { icon: Waves, count: 8, label: aurisT?.featureCats?.harmonic || 'Harmonic', color: '#7fb069' },
            { icon: Mic2, count: 14, label: aurisT?.featureCats?.vocal || 'Vocal', color: '#a64b8f' },
          ].map((cat, i) => (
            <motion.div key={i} className={styles.featureCard} variants={itemVariants}>
              <div className={styles.featureCardHeader}>
                <cat.icon size={18} style={{ color: cat.color }} />
                <span className={styles.featureCount} style={{ color: cat.color }}>{cat.count}</span>
              </div>
              <div className={styles.featureLabel}>{cat.label}</div>
              <div className={styles.featureBar}>
                <motion.div
                  className={styles.featureBarFill}
                  style={{ backgroundColor: cat.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(cat.count / 49) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className={styles.cta}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Link href="/ai-music-detection" className={styles.ctaButton}>
            <span>{aurisT?.cta || 'Try AURIS Detection'}</span>
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default AurisShowcase
