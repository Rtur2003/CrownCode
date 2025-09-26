'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Image, Music } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface DataTypeSelectorProps {
  selected: 'image' | 'audio' | null
  onSelect: (type: 'image' | 'audio') => void
}

export const DataTypeSelector: React.FC<DataTypeSelectorProps> = ({ selected, onSelect }) => {
  const { t } = useLanguage()
  const types = [
    {
      id: 'image' as const,
      title: t.mlToolkit.dataType.image.title,
      description: t.mlToolkit.dataType.image.description,
      icon: Image,
      gradient: 'from-blue-400 to-cyan-500'
    },
    {
      id: 'audio' as const,
      title: t.mlToolkit.dataType.audio.title,
      description: t.mlToolkit.dataType.audio.description,
      icon: Music,
      gradient: 'from-purple-400 to-pink-500'
    }
  ]

  return (
    <div className="data-type-selector">
      <h2 className="selector-title">{t.mlToolkit.dataType.title}</h2>
      <p className="selector-subtitle">{t.mlToolkit.dataType.subtitle}</p>

      <div className="type-grid">
        {types.map((type) => {
          const Icon = type.icon
          const isSelected = selected === type.id

          return (
            <motion.button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={`type-card ${isSelected ? 'type-card-selected' : ''}`}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`type-icon bg-gradient-to-r ${type.gradient}`}>
                <Icon size={32} />
              </div>
              <h3 className="type-title">{type.title}</h3>
              <p className="type-description">{type.description}</p>

              {isSelected && (
                <motion.div
                  className="selected-indicator"
                  layoutId="selected"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default DataTypeSelector