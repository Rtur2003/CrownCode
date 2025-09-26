'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Palette, RotateCw, ZoomIn, ZoomOut, Maximize2, Blend } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export interface ImageAugmentationOptions {
  colorChange: boolean
  rotation: boolean
  zoomIn: boolean
  zoomOut: boolean
  blend: boolean
  overlay: boolean
}

interface ImageAugmentationProps {
  options: ImageAugmentationOptions
  onChange: (options: ImageAugmentationOptions) => void
}

export const ImageAugmentation: React.FC<ImageAugmentationProps> = ({ options, onChange }) => {
  const { t } = useLanguage()
  const augmentOptions = [
    {
      key: 'colorChange' as keyof ImageAugmentationOptions,
      title: t.mlToolkit.imageOptions.colorChange.title,
      description: t.mlToolkit.imageOptions.colorChange.description,
      icon: Palette,
      gradient: 'from-pink-400 to-rose-500'
    },
    {
      key: 'rotation' as keyof ImageAugmentationOptions,
      title: t.mlToolkit.imageOptions.rotation.title,
      description: t.mlToolkit.imageOptions.rotation.description,
      icon: RotateCw,
      gradient: 'from-blue-400 to-cyan-500'
    },
    {
      key: 'zoomIn' as keyof ImageAugmentationOptions,
      title: t.mlToolkit.imageOptions.zoomIn.title,
      description: t.mlToolkit.imageOptions.zoomIn.description,
      icon: ZoomIn,
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      key: 'zoomOut' as keyof ImageAugmentationOptions,
      title: t.mlToolkit.imageOptions.zoomOut.title,
      description: t.mlToolkit.imageOptions.zoomOut.description,
      icon: ZoomOut,
      gradient: 'from-purple-400 to-violet-500'
    },
    {
      key: 'blend' as keyof ImageAugmentationOptions,
      title: t.mlToolkit.imageOptions.blend.title,
      description: t.mlToolkit.imageOptions.blend.description,
      icon: Blend,
      gradient: 'from-orange-400 to-amber-500'
    },
    {
      key: 'overlay' as keyof ImageAugmentationOptions,
      title: t.mlToolkit.imageOptions.overlay.title,
      description: t.mlToolkit.imageOptions.overlay.description,
      icon: Maximize2,
      gradient: 'from-indigo-400 to-blue-500'
    }
  ]

  const handleToggle = (key: keyof ImageAugmentationOptions) => {
    onChange({
      ...options,
      [key]: !options[key]
    })
  }

  const selectedCount = Object.values(options).filter(Boolean).length

  return (
    <div className="augmentation-options">
      <div className="options-header">
        <h3 className="options-title">{t.mlToolkit.imageOptions.title}</h3>
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

export default ImageAugmentation