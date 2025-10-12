'use client'

// =========================================================================
// ABOUT SECTION COMPONENT
// =========================================================================
// Professional about section showcasing the combination of music composition
// and AI development expertise with profile image.
//
// Features:
// - Profile image with gradient border
// - Dual expertise showcase (Music & Technology)
// - Multi-language support
// - Responsive design
// - Animated entrance effects
//
// @author Hasan Arthur Altuntaş
// @version 1.0.0
// @since 2025-01-12
// =========================================================================

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Music2, Brain, Award, Lightbulb } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

// =========================================================================
// COMPONENT INTERFACES
// =========================================================================

interface AboutSectionProps {
  className?: string
}

// =========================================================================
// ABOUT SECTION COMPONENT
// =========================================================================

export const AboutSection: React.FC<AboutSectionProps> = ({ className = '' }) => {
  const { t, language } = useLanguage()

  const expertise = [
    {
      icon: Music2,
      title: language === 'tr' ? 'Piyanist & Besteci' : 'Pianist & Composer',
      description: language === 'tr'
        ? 'Sinematik ambient müzik besteciliği. Film müziği tarzında duygusal ve atmosferik eserler.'
        : 'Cinematic ambient music composition. Emotional and atmospheric works in film score style.',
      gradient: 'from-purple-400 to-pink-600'
    },
    {
      icon: Brain,
      title: language === 'tr' ? 'AI Geliştiricisi' : 'AI Developer',
      description: language === 'tr'
        ? 'Yapay zeka müzik tespit sistemleri. wav2vec2 tabanlı derin öğrenme araştırmaları.'
        : 'AI music detection systems. wav2vec2-based deep learning research.',
      gradient: 'from-blue-400 to-cyan-600'
    }
  ]

  const highlights = [
    {
      icon: Award,
      text: language === 'tr' ? 'Düzce Üniversitesi Bilgisayar Mühendisliği' : 'Düzce University Computer Engineering'
    },
    {
      icon: Lightbulb,
      text: language === 'tr' ? 'Müzik + Teknoloji Araştırmaları' : 'Music + Technology Research'
    }
  ]

  return (
    <section className={`about-section ${className}`} id="about">
      <div className="about-container">
        {/* Profile Image Side */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="about-image-wrapper"
        >
          <div className="about-image-border">
            <Image
              src="/profil1.png"
              alt="Hasan Arthur Altuntaş - Piyanist, Besteci ve Yapay Zeka Geliştiricisi. Sinematik müzik besteciliği ile AI araştırmalarını birleştiren teknoloji uzmanı."
              width={400}
              height={400}
              className="about-image"
              priority
            />
          </div>
          <div className="about-image-glow" />
        </motion.div>

        {/* Content Side */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="about-content"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h2 className="about-title">
              {language === 'tr' ? 'Müzik ve Teknolojinin Kesişimi' : 'Where Music Meets Technology'}
            </h2>
            <p className="about-description">
              {language === 'tr'
                ? 'Piyanist ve besteci olarak sinematik ambient müzikler besteliyor, aynı zamanda bilgisayar mühendisi olarak yapay zeka geliştiriyorum. Bu iki tutkumu birleştirerek AI müzik tespit sistemleri üzerine araştırmalar yapıyorum.'
                : 'As a pianist and composer, I create cinematic ambient music, while as a computer engineer, I develop artificial intelligence. Combining these two passions, I conduct research on AI music detection systems.'}
            </p>
          </motion.div>

          {/* Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="about-highlights"
          >
            {highlights.map((item, index) => (
              <div key={index} className="about-highlight-item">
                <item.icon size={18} className="about-highlight-icon" />
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Expertise Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="about-expertise"
          >
            {expertise.map((item, index) => (
              <motion.div
                key={index}
                className="about-expertise-card"
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className={`about-expertise-icon bg-gradient-to-br ${item.gradient}`}>
                  <item.icon size={24} />
                </div>
                <h3 className="about-expertise-title">{item.title}</h3>
                <p className="about-expertise-description">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutSection
