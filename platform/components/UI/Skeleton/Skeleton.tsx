/**
 * Skeleton Component
 * Kullanım: Base loading skeleton
 * Bağımlılıklar: styles/components/skeleton.css
 */

import React from 'react'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  className = '',
  variant = 'rectangular'
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius
  }

  return (
    <div
      className={`skeleton skeleton-${variant} ${className}`}
      style={style}
      aria-busy="true"
      aria-live="polite"
    />
  )
}
