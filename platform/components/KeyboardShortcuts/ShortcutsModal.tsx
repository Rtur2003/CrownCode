/**
 * Shortcuts Modal Component
 * Kullanım: Keyboard shortcuts gösterimi
 * Bağımlılıklar: useKeyboardShortcuts, styles/components/shortcuts-modal.css
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

interface Shortcut {
  key: string
  modifiers?: ('ctrl' | 'cmd' | 'alt' | 'shift')[]
  descriptionKey: string
  categoryKey: string
}

const SHORTCUTS: Shortcut[] = [
  {
    key: 'k',
    modifiers: ['ctrl'],
    descriptionKey: 'search',
    categoryKey: 'navigation'
  },
  {
    key: 'u',
    modifiers: ['ctrl'],
    descriptionKey: 'uploadFile',
    categoryKey: 'actions'
  },
  {
    key: '/',
    modifiers: ['ctrl'],
    descriptionKey: 'showShortcuts',
    categoryKey: 'help'
  },
  {
    key: 'Escape',
    modifiers: [],
    descriptionKey: 'closeModal',
    categoryKey: 'general'
  }
]

export const ShortcutsModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()
  const { formatShortcut } = useKeyboardShortcuts({ shortcuts: [], enabled: false })

  // Listen for Ctrl+/ to toggle modal
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: '/',
        modifiers: ['ctrl'],
        allowInInput: true,
        callback: () => setIsOpen((prev) => !prev)
      },
      {
        key: 'Escape',
        modifiers: [],
        allowInInput: true,
        callback: () => setIsOpen(false)
      }
    ],
    enabled: true
  })

  const categories = t.shortcuts?.categories as Record<string, string> | undefined
  const items = t.shortcuts?.items as Record<string, string> | undefined

  const getCategoryLabel = (key: string) => categories?.[key] || key
  const getItemLabel = (key: string) => items?.[key] || key

  // Group shortcuts by category
  const groupedShortcuts = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.categoryKey]) {
      acc[shortcut.categoryKey] = []
    }
    acc[shortcut.categoryKey].push(shortcut)
    return acc
  }, {} as Record<string, Shortcut[]>)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="shortcuts-modal-overlay" onClick={() => setIsOpen(false)} role="presentation">
          <motion.div
            className="shortcuts-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-modal-title"
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
              <h2 id="shortcuts-modal-title">{t.shortcuts?.title || 'Keyboard Shortcuts'}</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="shortcuts-modal-close"
              aria-label={t.aria?.closeModal || 'Close'}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="shortcuts-modal-content">
            {Object.entries(groupedShortcuts).map(([categoryKey, shortcuts]) => (
              <div key={categoryKey} className="shortcuts-category">
                <h3 className="shortcuts-category-title">{getCategoryLabel(categoryKey)}</h3>
                <div className="shortcuts-list">
                  {shortcuts.map((shortcut, index) => (
                    <div key={index} className="shortcut-item">
                      <span className="shortcut-description">
                        {getItemLabel(shortcut.descriptionKey)}
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
      )}
    </AnimatePresence>
  )
}
