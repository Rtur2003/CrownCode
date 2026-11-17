import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import {
  Github,
  ExternalLink,
  Mail,
  Globe,
  Heart
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { FOOTER_PRODUCT_IDS, FOOTER_PRODUCT_LOCALE_MAP, getProductHref } from '@/config/product-catalog'
import { NOINDEX_ROUTES, normalizePath } from '@/config/site'

interface FooterLink {
  label: string
  href: string
  external?: boolean
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

export const Footer: React.FC = () => {
  const { language, t } = useLanguage()
  const router = useRouter()
  const currentYear = new Date().getFullYear()
  const otherLocale = language === 'tr' ? 'en' : 'tr'
  const isErrorPage = router.pathname === '/404' || router.pathname === '/_error'
  const isNoIndexPage =
    isErrorPage || (NOINDEX_ROUTES as readonly string[]).includes(normalizePath(router.pathname))
  const currentPath = isErrorPage ? '/' : (router.asPath?.split(/[?#]/)[0] || '/')

  const productLinks: FooterLink[] = FOOTER_PRODUCT_IDS.map((id) => ({
    label: (t.footer.sections.products as Record<string, string>)[FOOTER_PRODUCT_LOCALE_MAP[id]],
    href: getProductHref(id),
  }))

  const footerSections: FooterSection[] = [
    {
      title: t.footer.sections.platform.title,
      links: [
        { label: t.footer.sections.platform.home, href: '/' },
        { label: t.footer.sections.platform.github, href: 'https://github.com/Rtur2003?tab=repositories', external: true },
      ],
    },
    {
      title: t.footer.sections.products.title,
      links: productLinks,
    },
    {
      title: t.footer.sections.developer.title,
      links: [
        { label: t.footer.sections.developer.contact, href: 'mailto:contact@hasan-arthur-altuntas.xyz', external: true },
        { label: t.footer.sections.developer.portfolio, href: 'https://hasan-arthur-altuntas.com.tr', external: true },
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
              <div className="footer-logo-icon brand-portrait">
                <Image src="/logo-mark.webp" alt="" width={96} height={96} />
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
                aria-label={t.aria.github}
              >
                <Github size={20} />
              </a>
              <a
                href="https://hasan-arthur-altuntas.com.tr"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label={t.aria.website}
              >
                <Globe size={20} />
              </a>
              <a
                href="mailto:contact@hasan-arthur-altuntas.xyz"
                className="social-link"
                aria-label={t.aria.email}
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          <div className="footer-sections">
            {footerSections.map((section) => (
              <div key={section.title} className="footer-section">
                <h2 className="section-title">{section.title}</h2>
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
              <span className="separator">•</span>
              <Link
                href={currentPath}
                locale={otherLocale}
                hrefLang={isNoIndexPage ? undefined : otherLocale}
                lang={otherLocale}
                className="footer-bottom-link"
              >
                {language === 'tr' ? 'English' : 'Türkçe'}
              </Link>
            </div>

            <div className="footer-bottom-right">
              <span className="made-with">
                {t.footer.bottom.madeWith}{' '}
                <Heart size={14} className="heart-icon" />
                {' '}{t.footer.bottom.by}{' '}
                <a
                  href="https://hasan-arthur-altuntas.com.tr"
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
