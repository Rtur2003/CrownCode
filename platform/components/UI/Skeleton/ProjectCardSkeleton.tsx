/**
 * Project Card Skeleton Component
 * Kullanım: ProjectsSection loading state
 * Bağımlılıklar: Skeleton.tsx
 */

import React from 'react'
import { Skeleton } from './Skeleton'

export const ProjectCardSkeleton: React.FC = () => {
  return (
    <div className="project-card-skeleton">
      {/* Icon */}
      <div className="skeleton-icon-wrapper">
        <Skeleton variant="rectangular" width={48} height={48} borderRadius={12} />
      </div>

      {/* Header */}
      <div className="skeleton-header">
        <Skeleton variant="text" width="80%" height={24} />
        <Skeleton variant="text" width="40%" height={16} />
      </div>

      {/* Description */}
      <div className="skeleton-description">
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="90%" height={16} />
        <Skeleton variant="text" width="70%" height={16} />
      </div>

      {/* Stats */}
      <div className="skeleton-stats">
        <Skeleton variant="text" width={80} height={20} />
        <Skeleton variant="text" width={100} height={20} />
      </div>

      {/* Tags */}
      <div className="skeleton-tags">
        <Skeleton variant="rectangular" width={80} height={28} borderRadius={14} />
        <Skeleton variant="rectangular" width={100} height={28} borderRadius={14} />
        <Skeleton variant="rectangular" width={90} height={28} borderRadius={14} />
      </div>

      {/* Button */}
      <Skeleton variant="rectangular" width="100%" height={44} borderRadius={8} />
    </div>
  )
}
