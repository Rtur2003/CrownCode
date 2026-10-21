'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/data-manipulation.module.css'

export interface AudioAugmentationOptions {
  pitchShift: boolean
  speedChange: boolean
  bassBoost: boolean
  trimSilence: boolean
  mixAudio: boolean
  addNoise: boolean
}

interface AudioAugmentationProps {
  options: AudioAugmentationOptions
  onChange: (options: AudioAugmentationOptions) => void
  fileCount?: number
}

const KEYS: Array<keyof AudioAugmentationOptions> = ['pitchShift', 'speedChange', 'bassBoost', 'trimSilence', 'mixAudio', 'addNoise']

/** Which changes to make to the sound, as a plain checklist. */
export const AudioAugmentation: React.FC<AudioAugmentationProps> = ({ options, onChange, fileCount = 0 }) => {
  const { t } = useLanguage()
  const A = t.mlToolkit.audioOptions
  const active = KEYS.filter(key => options[key]).length

  return (
    <fieldset className={styles.checklist}>
      <legend className={world.fieldLabel}>{A.title} · {active} {A.selectedCount}</legend>
      {KEYS.map(key => {
        const copy = A[key]
        const needsSecond = key === 'mixAudio' && options.mixAudio
        return (
          <label key={key} className={styles.check}>
            <input
              type="checkbox"
              checked={options[key]}
              onChange={() => onChange({ ...options, [key]: !options[key] })}
            />
            <span>
              <strong>{copy.title}</strong>
              <small>{copy.description}</small>
              {needsSecond && (
                <small className={fileCount < 2 ? styles.needs : undefined}>
                  {fileCount < 2 ? A.mixAudioNeedsTwoFiles : A.mixAudioHint}
                </small>
              )}
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}

export default AudioAugmentation
