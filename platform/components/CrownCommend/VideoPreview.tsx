/**
 * The video the draft is about: thumbnail, title, channel and the four counts YouTube reports.
 */

import React from 'react'
import Image from 'next/image'
import type { VideoDetails } from '@/hooks/useCommend'
import { clock } from '@/components/Auris/format'
import styles from '@/styles/pages/crown-commend.module.css'

interface VideoPreviewLabels {
  views: string
  likes: string
  comments: string
  subscribers: string
}

interface VideoPreviewProps {
  details: VideoDetails
  labels: VideoPreviewLabels
  language: string
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ details, labels, language }) => {
  const compact = new Intl.NumberFormat(language === 'en' ? 'en-US' : 'tr-TR', { notation: 'compact', maximumFractionDigits: 1 })
  const counts: Array<[string, number]> = [
    [labels.views, details.viewCount],
    [labels.likes, details.likeCount],
    [labels.comments, details.commentCount],
    ...(details.subscriberCount ? [[labels.subscribers, details.subscriberCount] as [string, number]] : []),
  ]

  return (
    <div className={styles.video}>
      {details.thumbnailUrl && (
        <div className={styles.thumbnail}>
          <Image
            src={details.thumbnailUrl}
            alt=""
            fill
            sizes="(max-width: 860px) 100vw, 280px"
            className={styles.thumbnailImage}
          />
          <span className={styles.duration}>{clock(details.duration * 1000)}</span>
        </div>
      )}
      <div className={styles.videoInfo}>
        <h3 className={styles.videoTitle}>{details.title}</h3>
        <p className={styles.channel}>{details.channelName}</p>
        <dl className={styles.counts}>
          {counts.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{compact.format(value)}</dd></div>
          ))}
        </dl>
      </div>
    </div>
  )
}
