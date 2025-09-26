'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, ExternalLink, Menu, X, Code2 } from 'lucide-react'
import { LanguageSelector } from '@/components/Navigation/LanguageSelector'
import { useLanguage } from '@/context/LanguageContext'

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
    setIsMobileMenuOpen(false)
  }

  const navItems = [
    { label: t.nav.home, href: '/' },
    { label: t.nav.products, action: scrollToProducts },
    { label: t.nav.github, href: 'https://github.com/Rtur2003?tab=repositories', external: true },
  ]

  return (
    <motion.header 
      className={`header ${isScrolled ? 'header-scrolled' : ''}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <Link href="/" className="header-logo">
            <div className="logo-icon">
              <Code2 size={24} />
            </div>
            <div className="logo-text">
              <span className="logo-main">Crown</span>
              <span className="logo-accent">Code</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="header-nav">
            {navItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
              >
                {item.href ? (
                  <Link 
                    href={item.href}
                    className="nav-link"
                    {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    <span>{item.label}</span>
                    {item.external && <ExternalLink size={14} />}
                  </Link>
                ) : (
                  <button onClick={item.action} className="nav-link">
                    <span>{item.label}</span>
                  </button>
                )}
              </motion.div>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="header-actions">
            <LanguageSelector />
            <motion.a
              href="https://github.com/Rtur2003?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="action-button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github size={18} />
              <span>{t.nav.github}</span>
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <motion.div 
          className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}
          initial={false}
          animate={{ 
            opacity: isMobileMenuOpen ? 1 : 0,
            y: isMobileMenuOpen ? 0 : -20
          }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <nav className="mobile-nav">
            {navItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: isMobileMenuOpen ? 1 : 0,
                  x: isMobileMenuOpen ? 0 : -20
                }}
                transition={{ 
                  delay: isMobileMenuOpen ? index * 0.1 : 0,
                  duration: 0.3
                }}
              >
                {item.href ? (
                  <Link 
                    href={item.href}
                    className="mobile-nav-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                    {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    <span>{item.label}</span>
                    {item.external && <ExternalLink size={16} />}
                  </Link>
                ) : (
                  <button 
                    onClick={item.action} 
                    className="mobile-nav-link"
                  >
                    <span>{item.label}</span>
                  </button>
                )}
              </motion.div>
            ))}
          </nav>
        </motion.div>

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
    </motion.header>
  )
}

export default Header