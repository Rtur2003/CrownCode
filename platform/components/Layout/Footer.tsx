import React from 'react'
import Link from 'next/link'
import {
  Github,
  ExternalLink,
  Mail,
  Globe,
  Heart,
  Code2
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export const Footer: React.FC = () => {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: t.footer.sections.platform.title,
      links: [
        { label: t.footer.sections.platform.home, href: '/' },
        { label: t.footer.sections.platform.github, href: 'https://github.com/Rtur2003?tab=repositories', external: true },
      ],
    },
    {
      title: t.footer.sections.products.title,
      links: [
        { label: t.footer.sections.products.aiMusic, href: '/ai-music-detection' },
        { label: t.footer.sections.products.dataProcessing, href: '/data-manipulation' },
      ],
    },
    {
      title: t.footer.sections.developer.title,
      links: [
        { label: t.footer.sections.developer.contact, href: 'mailto:contact@hasanarthuraltuntas.xyz', external: true },
        { label: t.footer.sections.developer.portfolio, href: 'https://hasanarthuraltuntas.xyz', external: true },
      ],
    },
  ]


  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <Code2 size={28} />
              </div>
              <div className="footer-logo-text">
                <span className="footer-logo-main">Crown</span>
                <span className="footer-logo-accent">Code</span>
                <span className="footer-logo-sub">by Rthur</span>
              </div>
            </div>

            <p className="footer-description">
              {t.footer.description}
            </p>

            {/* Social Links */}
            <div className="footer-social">
              <a
                href="https://github.com/Rtur2003?tab=repositories"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="https://hasanarthuraltuntas.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Website"
              >
                <Globe size={20} />
              </a>
              <a
                href="mailto:contact@hasanarthuraltuntas.xyz"
                className="social-link"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          <div className="footer-sections">
            {footerSections.map((section) => (
              <div key={section.title} className="footer-section">
                <h3 className="section-title">{section.title}</h3>
                <ul className="section-links">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="footer-link external"
                        >
                          <span>{link.label}</span>
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <Link href={link.href} className="footer-link">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-bottom-left">
              <span className="copyright">
                © {currentYear} {t.footer.bottom.copyright}
              </span>
            </div>

            <div className="footer-bottom-center">
              <Link href="/privacy" className="footer-bottom-link">
                {t.footer.bottom.privacy}
              </Link>
              <span className="separator">•</span>
              <Link href="/terms" className="footer-bottom-link">
                {t.footer.bottom.terms}
              </Link>
            </div>

            <div className="footer-bottom-right">
              <span className="made-with">
                {t.footer.bottom.madeWith}{' '}
                <Heart size={14} className="heart-icon" />
                {' '}{t.footer.bottom.by}{' '}
                <a
                  href="https://hasanarthuraltuntas.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="author-link"
                >
                  Hasan Arthur Altuntaş
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer