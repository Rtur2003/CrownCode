import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { m as motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ArrowRight, ArrowUpRight, ChevronDown, Github, Menu, X } from 'lucide-react'
import { LanguageSelector, LanguageToggle } from '@/components/Navigation/LanguageSelector'
import { useLanguage } from '@/context/LanguageContext'
import { PRODUCT_CATALOG } from '@/config/product-catalog'
import { worldLook, worldName } from '@/config/showroom-worlds'
import { MUSIC_SITE_URL } from '@/config/site'

interface ProjectLink {
  id: string
  href: string
  index: string
  name: string
  sector: string
  external: boolean
}

const GITHUB_URL = 'https://github.com/Rtur2003?tab=repositories'

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProjectsOpen, setIsProjectsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { t, language } = useLanguage()
  const router = useRouter()
  const pathname = router.pathname
  const reducedMotion = useReducedMotion()

  const items = t.products.items as Record<string, { title: string }>
  const projects: ProjectLink[] = PRODUCT_CATALOG.map((entry, i) => ({
    id: entry.id,
    href: entry.href,
    index: String(i + 1).padStart(2, '0'),
    name: worldName(entry, items[entry.localeKey]?.title ?? entry.id),
    sector: worldLook(entry).sector[language === 'en' ? 'en' : 'tr'],
    external: entry.href.startsWith('http'),
  }))
  const isProjectActive = projects.some(p => !p.external && pathname.startsWith(p.href))

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
      const scrolled = (entry?.boundingClientRect.top ?? 0) < 0
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

  // Close menus on navigation.
  useEffect(() => {
    const close = () => {
      setIsProjectsOpen(false)
      setIsMobileMenuOpen(false)
    }
    router.events?.on('routeChangeStart', close)
    return () => router.events?.off('routeChangeStart', close)
  }, [router.events])

  // Lock page scroll behind the open mobile menu.
  useEffect(() => {
    if (!isMobileMenuOpen) {return}
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isMobileMenuOpen])

  useEffect(() => {
    if (pathname !== '/' || window.location.hash !== '#products') {return}
    const timer = setTimeout(() => {
      document.getElementById('products')?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' })
      // Drop the hash but keep the locale prefix (/en).
      window.history.replaceState(null, '', window.location.pathname)
    }, 100)
    return () => clearTimeout(timer)
  }, [pathname, reducedMotion])

  const openAtlas = () => {
    setIsProjectsOpen(false)
    setIsMobileMenuOpen(false)
    if (pathname === '/') {
      document.getElementById('products')?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' })
    } else {
      void router.push('/#products')
    }
  }

  const projectLink = (p: ProjectLink, className: string, onClick: () => void) => {
    const active = !p.external && pathname.startsWith(p.href)
    const body = (
      <>
        <span className="nav-project-index">{p.index}</span>
        <span className="nav-project-text">
          <span className="nav-project-name">{p.name}</span>
          <span className="nav-project-sector">{p.sector}</span>
        </span>
        {p.external && <ArrowUpRight size={14} className="nav-project-ext" aria-hidden="true" />}
      </>
    )
    return p.external ? (
      <a key={p.id} href={p.href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
        {body}
      </a>
    ) : (
      <Link
        key={p.id}
        href={p.href}
        className={`${className}${active ? ' is-active' : ''}`}
        aria-current={active ? 'page' : undefined}
        onClick={onClick}
      >
        {body}
      </Link>
    )
  }

  return (
    // The entrance runs in CSS (.enter-drop) so the header is visible in the
    // server HTML instead of waiting at opacity 0 for hydration.
    <header className={`header enter-drop ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        <div className="header-content">
          <Link href="/" className="header-logo" aria-label={t.aria?.homePage || 'CrownCode Home'}>
            <div className="logo-icon brand-portrait">
              <Image src="/logo-mark.webp" alt="" width={64} height={64} loading="eager" />
            </div>
            <div className="logo-text">
              <span className="logo-main">Crown</span>
              <span className="logo-accent">Code</span>
            </div>
          </Link>

          <nav className="header-nav" aria-label={t.aria?.mainNavigation ?? 'Main'}>
            <div ref={dropdownRef} className="nav-dropdown-wrapper">
              <button
                type="button"
                className={`nav-link nav-dropdown-trigger ${isProjectActive ? 'nav-link-active' : ''}`}
                onClick={() => setIsProjectsOpen(prev => !prev)}
                aria-expanded={isProjectsOpen}
                aria-controls="projects-dropdown"
              >
                <span>{t.nav.projects}</span>
                <ChevronDown size={14} className={`nav-chevron ${isProjectsOpen ? 'is-open' : ''}`} aria-hidden="true" />
              </button>

              <AnimatePresence>
                {isProjectsOpen && (
                  <motion.div
                    id="projects-dropdown"
                    className="nav-dropdown"
                    initial={reducedMotion ? false : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="nav-dropdown-grid">
                      {projects.map(p => projectLink(p, 'nav-project', () => setIsProjectsOpen(false)))}
                    </div>
                    <button type="button" className="nav-dropdown-footer" onClick={openAtlas}>
                      <span>{t.nav.atlas}</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href={MUSIC_SITE_URL} target="_blank" rel="noopener noreferrer" className="nav-link">
              <span>{t.nav.music}</span>
              <ArrowUpRight size={13} aria-hidden="true" className="nav-ext" />
            </a>
            <Link
              href="/system-status"
              className={`nav-link ${pathname.startsWith('/system-status') ? 'nav-link-active' : ''}`}
            >
              <span>{t.nav.status}</span>
            </Link>
          </nav>

          <div className="header-actions">
            <LanguageSelector />
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="action-button">
              <Github size={18} />
              <span>{t.nav.github}</span>
            </a>
          </div>

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(open => !open)}
            aria-label={isMobileMenuOpen ? (t.aria?.closeMenu || 'Close Menu') : (t.aria?.openMenu || 'Open Menu')}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Open/close is driven only by the .mobile-menu-open class. */}
        <div
          id="mobile-menu"
          className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}
          inert={!isMobileMenuOpen}
        >
          <nav className="mobile-nav" aria-label={t.aria?.mainNavigation ?? 'Main'}>
            <p className="mobile-nav-section-title">{t.nav.projects}</p>
            <div className="mobile-projects">
              {projects.map(p => projectLink(p, 'nav-project nav-project-mobile', () => setIsMobileMenuOpen(false)))}
            </div>
            <button type="button" className="mobile-nav-link mobile-nav-atlas" onClick={openAtlas}>
              <span>{t.nav.atlas}</span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <div className="mobile-nav-row">
              <a href={MUSIC_SITE_URL} target="_blank" rel="noopener noreferrer" className="mobile-nav-link">
                <span>{t.nav.music}</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <Link href="/system-status" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                <span>{t.nav.status}</span>
              </Link>
            </div>
            <div className="mobile-nav-language">
              <LanguageToggle onSelect={() => setIsMobileMenuOpen(false)} />
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="mobile-github">
                <Github size={16} />
                <span>{t.nav.github}</span>
              </a>
            </div>
          </nav>
        </div>

        {isMobileMenuOpen && (
          <div className="mobile-menu-backdrop" onClick={() => setIsMobileMenuOpen(false)} aria-hidden="true" />
        )}
      </div>
    </header>
  )
}

export default Header
