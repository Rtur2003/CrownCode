// =========================================================================
// AURIS — HOW IT WORKS SECTION
// =========================================================================
// Visual pipeline overview between hero and detection interface.
// Provides context before the user interacts with the tool.
// =========================================================================

import React from 'react'
import Image from 'next/image'
import { motion, Variants } from 'motion/react'
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

// Each step in the pipeline enters from the direction its number implies —
// step 1 slides in from the left edge, step 4 from the right — so the
// sequence itself reads as a left-to-right journey rather than four
// identical cards rising in lockstep.
const stepDirections: Variants[] = [
  { hidden: { opacity: 0, x: -32 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } },
  { hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } },
  { hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } },
  { hidden: { opacity: 0, x: 32 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } },
]

interface Step {
  icon: React.ReactNode
  title: string
  desc: string
  tag?: string
}

export const HowItWorks: React.FC = () => {
  const { t } = useLanguage()

  const hw = t.aiDetection.howItWorks

  const steps: Step[] = [
    {
      icon: <Youtube size={24} aria-hidden="true" />,
      title: hw?.step1Title || 'Paste Link',
      desc: hw?.step1Desc || 'Drop a YouTube URL and AURIS fetches the audio automatically.'
    },
    {
      icon: <Upload size={24} aria-hidden="true" />,
      title: hw?.step2Title || 'Upload File',
      desc: hw?.step2Desc || 'Or upload MP3, WAV, FLAC directly from your device.'
    },
    {
      icon: <Cpu size={24} aria-hidden="true" />,
      title: hw?.step3Title || 'AI Analysis',
      desc: hw?.step3Desc || 'Deep neural analysis via wav2vec2 model inference.',
      tag: 'wav2vec2'
    },
    {
      icon: <BarChart3 size={24} aria-hidden="true" />,
      title: hw?.step4Title || 'Get Results',
      desc: hw?.step4Desc || 'Confidence score, audio features, and a detailed verdict.'
    }
  ]

  return (
    <section className={styles.section} aria-label="How AURIS works">
      {/* Decorative background wave */}
      <div className={styles.bgDecor} aria-hidden="true">
        <Image
          src="/images/auris/sound-rings.webp"
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
            {hw?.label || 'How It Works'}
          </span>
          <h2 className={styles.title}>
            {hw?.title || 'Detection Pipeline'}
          </h2>
          <p className={styles.subtitle}>
            {hw?.subtitle || 'From audio source to AI verdict — four streamlined steps.'}
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
              variants={stepDirections[index] ?? stepDirections[0]}
            >
              <div className={styles.cardNumber}>
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className={styles.cardIcon}>
                {step.icon}
              </div>
              <h3 className={styles.cardTitle}>
                {step.title}
              </h3>
              <p className={styles.cardDesc}>
                {step.desc}
              </p>
              {step.tag && (
                <span className={styles.cardTag}>{step.tag}</span>
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
