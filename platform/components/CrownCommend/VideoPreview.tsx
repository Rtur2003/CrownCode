/**
 * Video Preview Component
 * Shows YouTube video details with a sleek design
 */

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Play, Eye, ThumbsUp, MessageCircle, Clock, Users } from 'lucide-react'
import type { VideoDetails } from '@/hooks/useCommend'
import styles from './VideoPreview.module.css'

interface VideoPreviewLabels {
  views: string
  likes: string
  comments: string
  subscribers: string
}

interface VideoPreviewProps {
  details: VideoDetails
  labels: VideoPreviewLabels
}

const formatNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return num.toString()
}

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ details, labels }) => {
  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Thumbnail */}
      <div className={styles.thumbnail}>
        {details.thumbnailUrl ? (
          <Image
            src={details.thumbnailUrl}
            alt={details.title}
            fill
            className={styles.thumbnailImage}
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className={styles.thumbnailPlaceholder}>
            <Play size={48} />
          </div>
        )}
        <div className={styles.duration}>
          <Clock size={12} />
          <span>{formatDuration(details.duration)}</span>
        </div>
        <div className={styles.overlay}>
          <Play size={48} className={styles.playIcon} />
        </div>
      </div>

      {/* Info */}
      <div className={styles.info}>
        <h3 className={styles.title}>{details.title}</h3>
        <p className={styles.channel}>{details.channelName}</p>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <Eye size={14} />
            <span>{formatNumber(details.viewCount)} {labels.views}</span>
          </div>
          <div className={styles.stat}>
            <ThumbsUp size={14} />
            <span>{formatNumber(details.likeCount)} {labels.likes}</span>
          </div>
          <div className={styles.stat}>
            <MessageCircle size={14} />
            <span>{formatNumber(details.commentCount)} {labels.comments}</span>
          </div>
          {details.subscriberCount && (
            <div className={styles.stat}>
              <Users size={14} />
              <span>{formatNumber(details.subscriberCount)} {labels.subscribers}</span>
            </div>
          )}
        </div>

        {/* Description preview */}
        {details.description && (
          <p className={styles.description}>
            {details.description.slice(0, 150)}
            {details.description.length > 150 ? '...' : ''}
          </p>
        )}
      </div>
    </motion.div>
  )
}
