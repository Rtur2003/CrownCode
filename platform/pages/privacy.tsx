'use client'

import React from 'react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowLeft, Shield, Eye, Database, Lock, Mail } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'

const SECTION_ICONS = [Eye, Database, Lock, Shield] as const
const SECTION_KEYS = ['dataCollection', 'dataUsage', 'dataSecurity', 'cookies'] as const

const PrivacyPage: NextPage = () => {
  const { t } = useLanguage()
  const p = t.privacy

  const sections = SECTION_KEYS.map((key, i) => ({
    icon: SECTION_ICONS[i],
    title: p.sections[key].title,
    content: p.sections[key].content
  }))

  return (
    <MainLayout
      title={p.meta.title}
      description={p.meta.description}
      url="https://hasanarthuraltuntas.xyz/privacy"
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
              <span>{p.backToHome}</span>
            </Link>

            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
                <Shield size={32} className="text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
                {p.title}
              </h1>
              <p className="text-text-secondary text-lg">
                {p.lastUpdated}
              </p>
            </div>

            {/* Introduction */}
            <div className="glass-card p-6 md:p-8 rounded-2xl mb-8">
              <p className="text-text-secondary leading-relaxed">
                {p.intro}
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

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-12 text-center"
            >
              <p className="text-text-secondary mb-4">
                {p.contactLabel}
              </p>
              <a
                href="mailto:contact@hasanarthuraltuntas.xyz"
                className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors"
              >
                <Mail size={20} />
                <span>contact@hasanarthuraltuntas.xyz</span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  )
}

export default PrivacyPage
