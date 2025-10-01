import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import tr from '@/locales/tr.json'
import en from '@/locales/en.json'

type Language = 'tr' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof tr
}

const translations = { tr, en }

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('tr')

  useEffect(() => {
    // SSR safe check - localStorage only available in browser
    if (typeof window === 'undefined') return

    const savedLang = localStorage.getItem('language') as Language
    if (savedLang && (savedLang === 'tr' || savedLang === 'en')) {
      setLanguageState(savedLang)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)

    // SSR safe check - localStorage only available in browser
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
  }

  const value = {
    language,
    setLanguage,
    t: translations[language]
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}