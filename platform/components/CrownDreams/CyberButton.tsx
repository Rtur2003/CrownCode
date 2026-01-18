'use client'

import React, { forwardRef, ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import styles from './CyberButton.module.css'

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const CyberButton = forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    const classes = [
      styles.cyberButton,
      styles[`variant-${variant}`],
      styles[`size-${size}`],
      (disabled || isLoading) ? styles.disabled : '',
      className
    ].filter(Boolean).join(' ')

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        className={classes}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {/* Shimmer effect */}
        <div className={styles.shimmer} />

        {/* Loading spinner */}
        {isLoading && (
          <svg className={styles.spinner} viewBox="0 0 24 24">
            <circle
              className={styles.spinnerTrack}
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className={styles.spinnerHead}
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {!isLoading && leftIcon && <span className={styles.icon}>{leftIcon}</span>}

        <span className={styles.text}>{children}</span>

        {!isLoading && rightIcon && <span className={styles.icon}>{rightIcon}</span>}

        {/* Bottom line accent */}
        <div className={styles.bottomLine} />
      </motion.button>
    )
  }
)

CyberButton.displayName = 'CyberButton'

// Icon Button variant
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'glow'
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const classes = [
      styles.iconButton,
      styles[`iconVariant-${variant}`],
      className
    ].filter(Boolean).join(' ')

    return (
      <motion.button
        ref={ref}
        className={classes}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

IconButton.displayName = 'IconButton'
