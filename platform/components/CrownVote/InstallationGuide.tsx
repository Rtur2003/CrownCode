import React from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import styles from '@/styles/pages/crown-vote.module.css'

const defaultSteps = [
  {
    title: 'Download Installer',
    description: 'Click the button above to download the installer',
  },
  {
    title: 'Run Setup',
    description: 'Run the downloaded .exe file and follow the instructions',
  },
  {
    title: 'Verify Chrome',
    description: 'Ensure Google Chrome is installed',
  },
  {
    title: 'Launch Application',
    description: 'Start VOTRYX and configure your target URL',
  },
]

export const InstallationGuide: React.FC = () => {
  const { t } = useLanguage()

  const installationText = t.crownVote?.installation
  const steps = installationText?.steps || defaultSteps

  return (
    <motion.div
      className={styles['installation-guide']}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <h2>{installationText?.title || 'Installation Steps'}</h2>

      <div className={styles['steps-list']}>
        {steps.map((step: { title: string; description: string }, index: number) => (
          <motion.div
            key={index}
            className={styles['step-item']}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
          >
            <div className={styles['step-number']}>{index + 1}</div>
            <div className={styles['step-content']}>
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
