/**
 * Loading Screen Component
 * Kullanım: Initial loading/welcome screen
 * Bağımlılıklar: styles/components/loading-screen.css
 */

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'

interface LoadingScreenProps {
  onLoadingComplete?: () => void
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsComplete(true)
            onLoadingComplete?.()
          }, 500)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)

    return () => clearInterval(interval)
  }, [onLoadingComplete])

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          className="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background Pattern */}
          <div className="loading-background">
            <div className="loading-gradient" />
            <div className="loading-grid" />
          </div>

          {/* Content */}
          <div className="loading-content">
            {/* Profile Image */}
            <motion.div
              className="loading-profile"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
                delay: 0.2
              }}
            >
              <div className="profile-ring" />
              <div className="profile-image-wrapper">
                <Image
                  src="/hasan-arthur-profile.jpg"
                  alt="Hasan Arthur Altuntaş"
                  width={120}
                  height={120}
                  className="profile-image"
                  priority
                />
              </div>
            </motion.div>

            {/* Brand Name */}
            <motion.div
              className="loading-brand"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h1 className="brand-title">
                <span className="brand-crown">Crown</span>
                <span className="brand-code">Code</span>
              </h1>
              <p className="brand-subtitle">
                {t.hero?.subtitle?.slice(0, 60) || 'AI Research & Development Platform'}...
              </p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              className="loading-progress-container"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="progress-text">{Math.floor(progress)}%</div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
