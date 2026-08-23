'use client'

import React from 'react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Scale, Users, Mail } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'

const SECTION_ICONS = [CheckCircle, Users, Scale, AlertTriangle] as const
const SECTION_KEYS = ['acceptableUse', 'userResponsibilities', 'intellectualProperty', 'disclaimer'] as const

const TermsPage: NextPage = () => {
  const { t } = useLanguage()
  const tm = t.terms

  const sections = SECTION_KEYS.map((key, i) => ({
    icon: SECTION_ICONS[i],
    title: tm.sections[key].title,
    content: tm.sections[key].content
  }))

  return (
    <MainLayout
      title={tm.meta.title}
      description={tm.meta.description}
      url="https://hasan-arthur-altuntas.xyz/terms"
    >
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Back Link */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft size={20} />
              <span>{tm.backToHome}</span>
            </Link>

            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
                <FileText size={32} className="text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
                {tm.title}
              </h1>
              <p className="text-text-secondary text-lg">
                {tm.lastUpdated}
              </p>
            </div>

            {/* Introduction */}
            <div className="glass-card p-6 md:p-8 rounded-2xl mb-8">
              <p className="text-text-secondary leading-relaxed">
                {tm.intro}
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {sections.map((section, index) => (
                <motion.div
                  key={SECTION_KEYS[index]}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card p-6 md:p-8 rounded-2xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <section.icon size={24} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-text-primary mb-3">
                        {section.title}
                      </h2>
                      <p className="text-text-secondary leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Open Source Note */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 glass-card p-6 md:p-8 rounded-2xl border-l-4 border-primary"
            >
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {tm.openSource.title}
              </h3>
              <p className="text-text-secondary">
                {tm.openSource.content}
              </p>
              <a
                href="https://github.com/Rtur2003/CrownCode"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mt-4"
              >
                <span>{tm.openSource.viewOnGithub}</span>
              </a>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-12 text-center"
            >
              <p className="text-text-secondary mb-4">
                {tm.contactLabel}
              </p>
              <a
                href="mailto:contact@hasan-arthur-altuntas.xyz"
                className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors"
              >
                <Mail size={20} />
                <span>contact@hasan-arthur-altuntas.xyz</span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  )
}

export default TermsPage
