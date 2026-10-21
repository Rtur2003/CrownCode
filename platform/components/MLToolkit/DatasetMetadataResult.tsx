'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/data-manipulation.module.css'

export interface DatasetEntryMetadata {
  durationSec: number
  tempoBpm: number
  key: string
  loudnessDb: number
  tags: string[]
}

interface DatasetMetadataResultProps {
  metadata: DatasetEntryMetadata
}

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const DatasetMetadataResult: React.FC<DatasetMetadataResultProps> = ({ metadata }) => {
  const { t } = useLanguage()
  const om = t.mlToolkit.organizer

  const facts: Array<[string, string]> = [
    [om.duration, formatDuration(metadata.durationSec)],
    [om.tempo, metadata.tempoBpm > 0 ? `${metadata.tempoBpm} BPM` : om.noBeat],
    [om.key, metadata.key],
    [om.loudness, `${metadata.loudnessDb} dB`],
  ]

  return (
    <div className={world.reading}>
      <dl className={world.margins}>
        {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
      <h3 className={`${world.readingLabel} ${styles.tagsLabel}`}>{om.autoTags}</h3>
      <p className={world.interpretation}>{metadata.tags.join(', ')}</p>
    </div>
  )
}

export default DatasetMetadataResult
