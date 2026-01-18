'use client'

import React from 'react'
import { motion } from 'framer-motion'
import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  value: number
  label?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'gold' | 'bronze' | 'gradient'
  className?: string
}

export function ProgressBar({
  value,
  label,
  showPercentage = false,
  size = 'md',
  variant = 'gold',
  className = ''
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={`${styles.progressContainer} ${className}`}>
      {(label || showPercentage) && (
        <div className={styles.progressHeader}>
          {label && <span className={styles.progressLabel}>{label}</span>}
          {showPercentage && <span className={styles.progressPercent}>{Math.round(clampedValue)}%</span>}
        </div>
      )}
      <div className={`${styles.progressTrack} ${styles[`size-${size}`]}`}>
        <motion.div
          className={`${styles.progressFill} ${styles[`variant-${variant}`]}`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  )
}

interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  label,
  className = ''
}: CircularProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (clampedValue / 100) * circumference

  return (
    <div className={`${styles.circularContainer} ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={styles.circularSvg}>
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#CD7F32" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <circle
          className={styles.circularTrack}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Progress arc */}
        <motion.circle
          className={styles.circularFill}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
          stroke="url(#goldGradient)"
        />
      </svg>

      <div className={styles.circularContent}>
        <span className={styles.circularValue}>{Math.round(clampedValue)}%</span>
        {label && <span className={styles.circularLabel}>{label}</span>}
      </div>
    </div>
  )
}
