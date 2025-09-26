'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'tr' as const, label: 'Türkçe', flag: '🇹🇷' },
    { code: 'en' as const, label: 'English', flag: '🇬🇧' }
  ]

  const currentLang = languages.find(l => l.code === language)

  return (
    <div className="language-selector">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="language-button"
      >
        <Globe size={18} />
        <span className="language-label">{currentLang?.flag} {currentLang?.label}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="language-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="language-dropdown"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code)
                    setIsOpen(false)
                  }}
                  className={`language-option ${language === lang.code ? 'active' : ''}`}
                >
                  <span className="language-flag">{lang.flag}</span>
                  <span>{lang.label}</span>
                  {language === lang.code && (
                    <motion.div
                      className="language-check"
                      layoutId="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      ✓
                    </motion.div>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LanguageSelector