import React, { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { AnimatePresence, m as motion } from 'motion/react'
import { Check, Globe } from 'lucide-react'
import { rememberLanguage, useLanguage } from '@/context/LanguageContext'
import type { Locale } from '@/config/site'

const LANGUAGES: { code: Locale; label: string; short: string }[] = [
  { code: 'tr', label: 'Türkçe', short: 'TR' },
  { code: 'en', label: 'English', short: 'EN' },
]

/**
 * Language options are real links to the other locale's URL (/en/…), so
 * crawlers can discover every translation and switching works without JS.
 */
function LanguageLink({ code, className, children, onSelect }: {
  code: Locale
  className: string
  children: React.ReactNode
  onSelect?: (() => void) | undefined
}) {
  const router = useRouter()
  const { language } = useLanguage()
  const active = language === code
  // Error pages are prerendered as /404; the browser's asPath is the missing
  // URL, so link to the home page there to keep SSR and hydration equal.
  const isErrorPage = router.pathname === '/404' || router.pathname === '/_error'
  return (
    <Link
      href={isErrorPage ? '/' : router.asPath}
      locale={code}
      scroll={false}
      hrefLang={code}
      lang={code}
      aria-current={active ? 'true' : undefined}
      className={`${className} ${active ? 'active' : ''}`}
      onClick={() => {
        rememberLanguage(code)
        onSelect?.()
      }}
    >
      {children}
    </Link>
  )
}

export const LanguageSelector: React.FC = () => {
  const { language, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0]

  useEffect(() => {
    if (!isOpen) {return}
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {setIsOpen(false)}
    }
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {setIsOpen(false)}
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [isOpen])

  return (
    <div className="language-selector" ref={rootRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="language-button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={t.aria?.changeLanguage ?? (language === 'tr' ? 'Dili değiştir' : 'Change language')}
      >
        <Globe size={18} aria-hidden="true" />
        <span className="language-label">{current.label}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={menuId}
            className="language-dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {LANGUAGES.map((lang) => (
              <LanguageLink key={lang.code} code={lang.code} className="language-option" onSelect={() => setIsOpen(false)}>
                <span className="language-code" aria-hidden="true">{lang.short}</span>
                <span>{lang.label}</span>
                {language === lang.code && <Check size={16} className="language-check" aria-hidden="true" />}
              </LanguageLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Compact TR / EN switch for the mobile menu, where the dropdown is hidden. */
export const LanguageToggle: React.FC<{ onSelect?: (() => void) | undefined }> = ({ onSelect }) => {
  const { language, t } = useLanguage()
  return (
    <nav className="language-toggle" aria-label={t.aria?.changeLanguage ?? (language === 'tr' ? 'Dili değiştir' : 'Change language')}>
      {LANGUAGES.map((lang) => (
        <LanguageLink key={lang.code} code={lang.code} className="language-toggle-option" onSelect={onSelect}>
          <span aria-hidden="true">{lang.short}</span>
          <span className="sr-only">{lang.label}</span>
        </LanguageLink>
      ))}
    </nav>
  )
}

export default LanguageSelector
