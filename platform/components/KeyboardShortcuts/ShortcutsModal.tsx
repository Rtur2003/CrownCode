/**
 * Shortcuts Modal Component
 * Kullanım: Keyboard shortcuts gösterimi
 * Bağımlılıklar: useKeyboardShortcuts, styles/components/shortcuts-modal.css
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

interface Shortcut {
  key: string
  modifiers?: ('ctrl' | 'cmd' | 'alt' | 'shift')[]
  description: string
  category: string
}

const SHORTCUTS: Shortcut[] = [
  {
    key: 'k',
    modifiers: ['ctrl'],
    description: 'Search',
    category: 'Navigation'
  },
  {
    key: 'u',
    modifiers: ['ctrl'],
    description: 'Upload file',
    category: 'Actions'
  },
  {
    key: '/',
    modifiers: ['ctrl'],
    description: 'Show shortcuts',
    category: 'Help'
  },
  {
    key: 'Escape',
    modifiers: [],
    description: 'Close modal',
    category: 'General'
  }
]

export const ShortcutsModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { language } = useLanguage()
  const { formatShortcut } = useKeyboardShortcuts({ shortcuts: [] })

  // Listen for Ctrl+/ to toggle modal
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: '/',
        modifiers: ['ctrl'],
        callback: () => setIsOpen((prev) => !prev)
      },
      {
        key: 'Escape',
        modifiers: [],
        callback: () => setIsOpen(false)
      }
    ],
    enabled: true
  })

  // Group shortcuts by category
  const groupedShortcuts = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, Shortcut[]>)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="shortcuts-modal-overlay" onClick={() => setIsOpen(false)}>
        <motion.div
          className="shortcuts-modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="shortcuts-modal-header">
            <div className="shortcuts-modal-title">
              <Keyboard size={24} />
              <h2>{language === 'tr' ? 'Klavye Kısayolları' : 'Keyboard Shortcuts'}</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="shortcuts-modal-close"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="shortcuts-modal-content">
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
              <div key={category} className="shortcuts-category">
                <h3 className="shortcuts-category-title">{category}</h3>
                <div className="shortcuts-list">
                  {shortcuts.map((shortcut, index) => (
                    <div key={index} className="shortcut-item">
                      <span className="shortcut-description">
                        {language === 'tr'
                          ? shortcut.description === 'Search' ? 'Arama'
                          : shortcut.description === 'Upload file' ? 'Dosya yükle'
                          : shortcut.description === 'Show shortcuts' ? 'Kısayolları göster'
                          : shortcut.description === 'Close modal' ? 'Modalı kapat'
                          : shortcut.description
                          : shortcut.description
                        }
                      </span>
                      <div className="shortcut-keys">
                        {formatShortcut(shortcut).split(' + ').map((key, i) => (
                          <kbd key={i} className="shortcut-key">
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
