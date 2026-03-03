import React from 'react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'

const NotFoundPage: NextPage = () => {
  const { t } = useLanguage()
  const nf = t.notFound

  return (
    <MainLayout
      title={nf.meta.title}
      description={nf.meta.description}
    >
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* 404 Number */}
            <motion.h1
              className="text-9xl font-bold bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent mb-8"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              404
            </motion.h1>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              {nf.title}
            </h2>

            {/* Description */}
            <p className="text-lg text-text-secondary mb-8 max-w-md mx-auto">
              {nf.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/" className="btn-primary flex items-center gap-2">
                <Home size={20} />
                <span>{nf.goHome}</span>
              </Link>

              <button
                type="button"
                onClick={() => window.history.back()}
                className="btn-secondary flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                <span>{nf.goBack}</span>
              </button>
            </div>

            {/* Helpful Links */}
            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-text-muted mb-4">
                {nf.helpfulPages}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/#products" className="text-primary hover:text-accent transition-colors">
                  {nf.projects}
                </Link>
                <Link href="/ai-music-detection" className="text-primary hover:text-accent transition-colors">
                  AI Music Detection
                </Link>
                <Link href="/data-manipulation" className="text-primary hover:text-accent transition-colors">
                  ML Toolkit
                </Link>
                <a
                  href="https://github.com/Rtur2003?tab=repositories"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-accent transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  )
}

export default NotFoundPage
