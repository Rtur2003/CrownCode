import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { m as motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Github, Menu, X, ChevronDown, Zap, MessageSquare, Vote, Sparkles } from 'lucide-react'
import { LanguageSelector, LanguageToggle } from '@/components/Navigation/LanguageSelector'
import { useLanguage } from '@/context/LanguageContext'

const DROPDOWN_ITEMS = [
  { key: 'fortune', href: '/crown-fortune', icon: Sparkles },
  { key: 'commend', href: '/crown-commend', icon: MessageSquare },
  { key: 'vote', href: '/crown-vote', icon: Vote },
  { key: 'aiMusic', href: '/ai-music-detection', icon: Zap },
] as const

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProjectsOpen, setIsProjectsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()
  const router = useRouter()
  const pathname = router.pathname
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    // Observe the threshold without reading layout during every scroll event.
    const sentinel = document.createElement('span')
    sentinel.setAttribute('aria-hidden', 'true')
    Object.assign(sentinel.style, {
      position: 'absolute', top: '50px', left: '0',
      width: '1px', height: '1px', pointerEvents: 'none',
    })
    document.body.appendChild(sentinel)
    let wasScrolled = false
    const observer = new IntersectionObserver(([entry]) => {
      const scrolled = entry.boundingClientRect.top < 0
      if (scrolled !== wasScrolled) {
        wasScrolled = scrolled
        setIsScrolled(scrolled)
      }
    }, { threshold: [0, 1] })
    observer.observe(sentinel)
    return () => {
      observer.disconnect()
      sentinel.remove()
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProjectsOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProjectsOpen(false)
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    if (pathname !== '/' || window.location.hash !== '#products') {return}
    const timer = setTimeout(() => {
      document.getElementById('products')?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' })
      // Drop the hash but keep the locale prefix (/en).
      window.history.replaceState(null, '', window.location.pathname)
    }, 100)
    return () => clearTimeout(timer)
  }, [pathname, reducedMotion])

  const scrollToProducts = () => {
    setIsMobileMenuOpen(false)
    if (pathname === '/') {
      document.getElementById('products')?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' })
    } else {
      router.push('/#products')
    }
  }

  const mainNavItems = [
    { label: t.nav.home, href: '/' },
    { label: t.nav.products, action: scrollToProducts },
    { label: t.nav.status, href: '/system-status' },
  ]

  const isProjectActive = DROPDOWN_ITEMS.some(item => pathname.startsWith(item.href))

  return (
    // The entrance runs in CSS (.enter-drop) so the header is visible in the
    // server HTML instead of waiting at opacity 0 for hydration.
    <header className={`header enter-drop ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <Link href="/" className="header-logo" aria-label={t.aria?.homePage || 'CrownCode Home'}>
            <div className="logo-icon brand-portrait">
              <Image src="/logo-mark.webp" alt="" width={64} height={64} loading="eager" />
            </div>
            <div className="logo-text">
              <span className="logo-main">Crown</span>
              <span className="logo-accent">Code</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="header-nav" aria-label={t.aria?.mainNavigation ?? 'Main'}>
            {mainNavItems.map((item) => (
              <div key={item.label}>
                {item.href ? (
                  <Link href={item.href} className="nav-link">
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <button type="button" onClick={item.action} className="nav-link">
                    <span>{item.label}</span>
                  </button>
                )}
              </div>
            ))}

            {/* Projects Dropdown */}
            <div ref={dropdownRef} className="nav-dropdown-wrapper">
              <button
                type="button"
                className={`nav-link nav-dropdown-trigger ${isProjectActive ? 'nav-link-active' : ''}`}
                onClick={() => setIsProjectsOpen(prev => !prev)}
                aria-expanded={isProjectsOpen ? 'true' : 'false'}
                aria-controls="projects-dropdown"
              >
                <span>{t.nav.projects}</span>
                <motion.span
                  animate={{ rotate: isProjectsOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <ChevronDown size={14} />
                </motion.span>
              </button>

              <AnimatePresence>
                {isProjectsOpen && (
                  <motion.div
                    id="projects-dropdown"
                    className="nav-dropdown"
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {DROPDOWN_ITEMS.map(item => {
                      const Icon = item.icon
                      const isActive = pathname.startsWith(item.href)
                      return (
                        <Link
                          key={item.key}
                          href={item.href}
                          className={`nav-dropdown-item ${isActive ? 'nav-dropdown-item-active' : ''}`}
                          onClick={() => setIsProjectsOpen(false)}
                        >
                          <span className="nav-dropdown-icon">
                            <Icon size={15} />
                          </span>
                          <span>{(t.nav as Record<string, string>)[item.key]}</span>
                        </Link>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Desktop Actions */}
          <div className="header-actions">
            <LanguageSelector />
            <motion.a
              href="https://github.com/Rtur2003?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="action-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github size={18} />
              <span>{t.nav.github}</span>
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? (t.aria?.closeMenu || 'Close Menu') : (t.aria?.openMenu || 'Open Menu')}
            aria-expanded={isMobileMenuOpen ? 'true' : 'false'}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu — the open/close transition (opacity, y, visibility)
            is fully handled by the .mobile-menu-open CSS class below;
            a Motion `animate` prop here would be a second system driving
            the same inline styles and can desync from the class toggle. */}
        <div id="mobile-menu" className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          <nav className="mobile-nav" aria-label={t.aria?.mainNavigation ?? 'Main'}>
            {mainNavItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isMobileMenuOpen ? 1 : 0, x: isMobileMenuOpen ? 0 : -20 }}
                transition={{ delay: isMobileMenuOpen ? index * 0.07 : 0, duration: 0.3 }}
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    className="mobile-nav-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <button type="button" onClick={item.action} className="mobile-nav-link">
                    <span>{item.label}</span>
                  </button>
                )}
              </motion.div>
            ))}

            {/* Projects section in mobile */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isMobileMenuOpen ? 1 : 0, x: isMobileMenuOpen ? 0 : -20 }}
              transition={{ delay: isMobileMenuOpen ? mainNavItems.length * 0.07 : 0, duration: 0.3 }}
            >
              <div className="mobile-nav-section-title">{t.nav.projects}</div>
              {DROPDOWN_ITEMS.map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: isMobileMenuOpen ? 1 : 0, x: isMobileMenuOpen ? 0 : -20 }}
                    transition={{ delay: isMobileMenuOpen ? (mainNavItems.length + i + 1) * 0.07 : 0, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      className="mobile-nav-link mobile-nav-link-sub"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="mobile-nav-sub-icon"><Icon size={15} /></span>
                      <span>{(t.nav as Record<string, string>)[item.key]}</span>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>

            <div className="mobile-nav-language">
              <LanguageToggle onSelect={() => setIsMobileMenuOpen(false)} />
            </div>
          </nav>
        </div>

        {/* Mobile Menu Backdrop */}
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
    </header>
  )
}

export default Header
