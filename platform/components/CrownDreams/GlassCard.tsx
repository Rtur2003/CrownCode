'use client'

import React, { ReactNode } from 'react'
import { motion, HTMLMotionProps } from 'motion/react'
import styles from './GlassCard.module.css'

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  className?: string
  hoverEffect?: boolean
  glowEffect?: boolean
  delay?: number
  variant?: 'default' | 'bordered' | 'glow' | 'neural'
}

const variantClasses = {
  default: styles.variantDefault,
  bordered: styles.variantBordered,
  glow: styles.variantGlow,
  neural: styles.variantNeural,
}

export function GlassCard({
  children,
  className = '',
  hoverEffect = true,
  glowEffect = false,
  delay = 0,
  variant = 'default',
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={`
        ${styles.glassCard}
        ${variantClasses[variant]}
        ${hoverEffect ? styles.hoverEffect : ''}
        ${glowEffect ? styles.glowEffect : ''}
        ${className}
      `}
      {...props}
    >
      <div className={styles.gradientOverlay} />
      <div className={styles.cornerAccent} />
      <div className={styles.content}>
        {children}
      </div>
    </motion.div>
  )
}

// StatCard - İstatistik kartı
interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: number
  delay?: number
  className?: string
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  delay = 0,
  className = ''
}: StatCardProps) {
  return (
    <GlassCard delay={delay} className={`${styles.statCard} ${className}`}>
      <div className={styles.statHeader}>
        {icon && (
          <div className={styles.statIcon}>
            {icon}
          </div>
        )}
        {trend !== undefined && (
          <span className={`${styles.statTrend} ${trend >= 0 ? styles.positive : styles.negative}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </GlassCard>
  )
}

// FeatureCard - Özellik kartı
interface FeatureCardProps {
  title: string
  description: string
  icon?: React.ElementType
  delay?: number
  onClick?: () => void
  className?: string
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  delay = 0,
  onClick,
  className = ''
}: FeatureCardProps) {
  return (
    <GlassCard
      delay={delay}
      onClick={onClick}
      className={`${styles.featureCard} ${onClick ? styles.clickable : ''} ${className}`}
    >
      <div className={styles.featureContent}>
        {Icon && (
          <div className={styles.featureIcon}>
            <Icon size={24} />
          </div>
        )}
        <div className={styles.featureText}>
          <h3 className={styles.featureTitle}>{title}</h3>
          <p className={styles.featureDescription}>{description}</p>
        </div>
      </div>
    </GlassCard>
  )
}
