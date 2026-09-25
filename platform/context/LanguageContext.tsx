import React, { createContext, useCallback, useContext, useEffect, useMemo, ReactNode } from 'react'
import { useRouter } from 'next/router'
import tr from '@/locales/tr.json'
import en from '@/locales/en.json'
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/config/site'

type Language = Locale

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof tr
}

const translations = { tr, en }
const STORAGE_KEY = 'language'
const RESTORED_KEY = 'language-restored'

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function rememberLanguage(lang: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // Storage can be blocked; the URL still carries the language.
  }
  // Next.js reads NEXT_LOCALE when it has to pick a locale for a bare URL.
  document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; SameSite=Lax`
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter()
  // The locale comes from the URL (/en/... or unprefixed Turkish), so the
  // server HTML is already in the right language — no client-side flip.
  const routeLocale = router?.locale
  const language: Language = isLocale(routeLocale) ? routeLocale : DEFAULT_LOCALE

  const setLanguage = useCallback((lang: Language) => {
    rememberLanguage(lang)
    if (!router || lang === language) {return}
    const { pathname, query, asPath } = router
    router.push({ pathname, query }, asPath, { locale: lang, scroll: false })
  }, [router, language])

  // A returning visitor who picked English lands on an unprefixed (Turkish)
  // URL once per session: send them to their language. Crawlers have no
  // stored preference, so they always see the URL they requested.
  useEffect(() => {
    if (!router?.isReady || language !== DEFAULT_LOCALE) {return}
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!isLocale(saved) || saved === language || sessionStorage.getItem(RESTORED_KEY)) {return}
      sessionStorage.setItem(RESTORED_KEY, '1')
      const { pathname, query, asPath } = router
      router.replace({ pathname, query }, asPath, { locale: saved, scroll: false })
    } catch {
      // Storage blocked: stay on the requested URL.
    }
  }, [router, language])

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: translations[language],
  }), [language, setLanguage])

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
