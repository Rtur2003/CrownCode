'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Volume2, Waves, Scissors, Combine, Music2, Mic } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

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
}

export const AudioAugmentation: React.FC<AudioAugmentationProps> = ({ options, onChange }) => {
  const { t } = useLanguage()
  const augmentOptions = [
    {
      key: 'pitchShift' as keyof AudioAugmentationOptions,
      title: t.mlToolkit.audioOptions.pitchShift.title,
      description: t.mlToolkit.audioOptions.pitchShift.description,
      icon: Music2,
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      key: 'speedChange' as keyof AudioAugmentationOptions,
      title: t.mlToolkit.audioOptions.speedChange.title,
      description: t.mlToolkit.audioOptions.speedChange.description,
      icon: Waves,
      gradient: 'from-blue-400 to-cyan-500'
    },
    {
      key: 'bassBoost' as keyof AudioAugmentationOptions,
      title: t.mlToolkit.audioOptions.bassBoost.title,
      description: t.mlToolkit.audioOptions.bassBoost.description,
      icon: Volume2,
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      key: 'trimSilence' as keyof AudioAugmentationOptions,
      title: t.mlToolkit.audioOptions.trimSilence.title,
      description: t.mlToolkit.audioOptions.trimSilence.description,
      icon: Scissors,
      gradient: 'from-orange-400 to-amber-500'
    },
    {
      key: 'mixAudio' as keyof AudioAugmentationOptions,
      title: t.mlToolkit.audioOptions.mixAudio.title,
      description: t.mlToolkit.audioOptions.mixAudio.description,
      icon: Combine,
      gradient: 'from-red-400 to-rose-500'
    },
    {
      key: 'addNoise' as keyof AudioAugmentationOptions,
      title: t.mlToolkit.audioOptions.addNoise.title,
      description: t.mlToolkit.audioOptions.addNoise.description,
      icon: Mic,
      gradient: 'from-indigo-400 to-purple-500'
    }
  ]

  const handleToggle = (key: keyof AudioAugmentationOptions) => {
    onChange({
      ...options,
      [key]: !options[key]
    })
  }

  const selectedCount = Object.values(options).filter(Boolean).length

  return (
    <div className="augmentation-options">
      <div className="options-header">
        <h3 className="options-title">{t.mlToolkit.audioOptions.title}</h3>
        <span className="selected-count">{selectedCount} {t.mlToolkit.optionsActive}</span>
      </div>

      <div className="options-grid">
        {augmentOptions.map((option) => {
          const Icon = option.icon
          const isSelected = options[option.key]

          return (
            <motion.button
              key={option.key}
              onClick={() => handleToggle(option.key)}
              className={`option-card ${isSelected ? 'option-selected' : ''}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`option-icon bg-gradient-to-r ${option.gradient}`}>
                <Icon size={24} />
              </div>

              <div className="option-content">
                <h4 className="option-title">{option.title}</h4>
                <p className="option-description">{option.description}</p>
              </div>

              <div className={`option-checkbox ${isSelected ? 'checked' : ''}`}>
                {isSelected && (
                  <motion.svg
                    viewBox="0 0 24 24"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <path
                      fill="currentColor"
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                    />
                  </motion.svg>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default AudioAugmentation