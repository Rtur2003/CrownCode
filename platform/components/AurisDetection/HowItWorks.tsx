// =========================================================================
// AURIS — HOW IT WORKS SECTION
// =========================================================================
// Visual pipeline overview between hero and detection interface.
// Provides context before the user interacts with the tool.
// =========================================================================

import React from 'react'
import Image from 'next/image'
import { motion, Variants } from 'framer-motion'
import { Upload, Youtube, Cpu, BarChart3 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import styles from '@/styles/components/auris-pipeline.module.css'

const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
}

interface Step {
  icon: React.ReactNode
  titleKey: string
  descKey: string
  tagKey?: string
}

export const HowItWorks: React.FC = () => {
  const { t } = useLanguage()

  const steps: Step[] = [
    {
      icon: <Youtube size={24} aria-hidden="true" />,
      titleKey: 'step1Title',
      descKey: 'step1Desc'
    },
    {
      icon: <Upload size={24} aria-hidden="true" />,
      titleKey: 'step2Title',
      descKey: 'step2Desc'
    },
    {
      icon: <Cpu size={24} aria-hidden="true" />,
      titleKey: 'step3Title',
      descKey: 'step3Desc',
      tagKey: 'wav2vec2'
    },
    {
      icon: <BarChart3 size={24} aria-hidden="true" />,
      titleKey: 'step4Title',
      descKey: 'step4Desc'
    }
  ]

  const howItWorks = t.aiDetection.howItWorks

  return (
    <section className={styles.section} aria-label="How AURIS works">
      {/* Decorative background wave */}
      <div className={styles.bgDecor} aria-hidden="true">
        <Image
          src="/images/auris/sound-rings.png"
          alt=""
          width={300}
          height={300}
          className={styles.bgRings}
        />
      </div>

      <div className={styles.container}>
        {/* Section header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles.label}>
            {howItWorks?.label || 'How It Works'}
          </span>
          <h2 className={styles.title}>
            {howItWorks?.title || 'Detection Pipeline'}
          </h2>
          <p className={styles.subtitle}>
            {howItWorks?.subtitle || 'From audio source to AI verdict — four streamlined steps.'}
          </p>
        </motion.div>

        {/* Steps grid */}
        <motion.div
          className={styles.grid}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={styles.card}
              variants={cardVariants}
            >
              <div className={styles.cardNumber}>
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className={styles.cardIcon}>
                {step.icon}
              </div>
              <h3 className={styles.cardTitle}>
                {howItWorks?.[step.titleKey] || step.titleKey}
              </h3>
              <p className={styles.cardDesc}>
                {howItWorks?.[step.descKey] || step.descKey}
              </p>
              {step.tagKey && (
                <span className={styles.cardTag}>{step.tagKey}</span>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Connector line (desktop only) */}
        <div className={styles.connector} aria-hidden="true">
          <div className={styles.connectorLine} />
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
