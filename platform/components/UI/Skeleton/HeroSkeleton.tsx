/**
 * Hero Skeleton Component
 * Kullanım: HeroSection loading state
 * Bağımlılıklar: Skeleton.tsx
 */

import React from 'react'
import { Skeleton } from './Skeleton'

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="hero-skeleton">
      <div className="hero-skeleton-content">
        {/* Title */}
        <div className="skeleton-title">
          <Skeleton variant="text" width="60%" height={48} />
          <Skeleton variant="text" width="40%" height={48} />
        </div>

        {/* Subtitle */}
        <div className="skeleton-subtitle">
          <Skeleton variant="text" width="80%" height={20} />
          <Skeleton variant="text" width="70%" height={20} />
        </div>

        {/* Buttons */}
        <div className="skeleton-buttons">
          <Skeleton variant="rectangular" width={200} height={48} borderRadius={8} />
          <Skeleton variant="rectangular" width={180} height={48} borderRadius={8} />
        </div>

        {/* Features */}
        <div className="skeleton-features">
          <Skeleton variant="rectangular" width={180} height={36} borderRadius={18} />
          <Skeleton variant="rectangular" width={200} height={36} borderRadius={18} />
        </div>
      </div>

      {/* Code Preview */}
      <div className="hero-skeleton-code">
        <Skeleton variant="rectangular" width="100%" height={400} borderRadius={12} />
      </div>
    </div>
  )
}
