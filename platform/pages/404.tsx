import React from 'react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { Crown, Home, ArrowLeft } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'
import styles from '@/styles/pages/not-found.module.css'

const NotFoundPage: NextPage = () => {
  const { t } = useLanguage()
  const nf = t.notFound
  const prefersReducedMotion = useReducedMotion()

  return (
    <MainLayout
      title={nf.meta.title}
      description={nf.meta.description}
    >
      <div className={styles.page}>
        <div className={styles['floor-glow']} aria-hidden="true" />

        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className={styles['crown-mark']}
            initial={{ opacity: 0, rotate: 0, scale: 0.8 }}
            animate={{ opacity: 1, rotate: prefersReducedMotion ? -18 : -18, scale: 1 }}
            transition={prefersReducedMotion ? { duration: 0.3 } : { duration: 0.7, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
            aria-hidden="true"
          >
            <Crown size={56} strokeWidth={1.25} />
          </motion.div>

          <h1 className={styles.seal}>404</h1>
          <h2 className={styles.title}>{nf.title}</h2>
          <p className={styles.description}>{nf.description}</p>

          <div className={styles.actions}>
            <Link href="/" className={styles['btn-primary']}>
              <Home size={18} />
              <span>{nf.goHome}</span>
            </Link>

            <button
              type="button"
              onClick={() => window.history.back()}
              className={styles['btn-secondary']}
            >
              <ArrowLeft size={18} />
              <span>{nf.goBack}</span>
            </button>
          </div>

          <div className={styles.helpful}>
            <p className={styles['helpful-label']}>{nf.helpfulPages}</p>
            <div className={styles['helpful-links']}>
              <Link href="/#products" className={styles['helpful-link']}>
                {nf.projects}
              </Link>
              <Link href="/ai-music-detection" className={styles['helpful-link']}>
                {t.nav.aiMusic}
              </Link>
              <Link href="/data-manipulation" className={styles['helpful-link']}>
                {t.footer.sections.products.dataProcessing}
              </Link>
              <a
                href="https://github.com/Rtur2003?tab=repositories"
                target="_blank"
                rel="noopener noreferrer"
                className={styles['helpful-link']}
              >
                GitHub
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  )
}

export default NotFoundPage
