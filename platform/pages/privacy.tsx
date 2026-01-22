'use client'

import React from 'react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Eye, Database, Lock, Mail } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'

const PrivacyPage: NextPage = () => {
  const { language } = useLanguage()

  const sections = language === 'tr' ? [
    {
      icon: Eye,
      title: 'Toplanan Veriler',
      content: 'CrownCode platformu, kullanıcı deneyimini iyileştirmek için minimal veri toplar. Bunlar arasında tarayıcı bilgileri, tercih edilen dil ve tema ayarları bulunur. Kişisel olarak tanımlanabilir bilgi toplamamaktayız.'
    },
    {
      icon: Database,
      title: 'Veri Kullanımı',
      content: 'Toplanan veriler yalnızca platform işlevselliğini sağlamak için kullanılır. Verileriniz üçüncü taraflarla paylaşılmaz veya satılmaz. AI araçları (Crown Commend, Crown Fortune) kullanıcı verilerini saklamaz.'
    },
    {
      icon: Lock,
      title: 'Veri Güvenliği',
      content: 'Tüm veri aktarımları HTTPS ile şifrelenir. Yerel depolama (localStorage) yalnızca kullanıcı tercihlerini saklar. Oturum verileri tarayıcı kapatıldığında silinir.'
    },
    {
      icon: Shield,
      title: 'Çerezler',
      content: 'Platform, temel işlevsellik için gerekli çerezleri kullanır. Bu çerezler dil tercihi ve tema ayarlarını içerir. Üçüncü taraf izleme çerezleri kullanılmamaktadır.'
    }
  ] : [
    {
      icon: Eye,
      title: 'Data Collection',
      content: 'CrownCode platform collects minimal data to improve user experience. This includes browser information, preferred language and theme settings. We do not collect personally identifiable information.'
    },
    {
      icon: Database,
      title: 'Data Usage',
      content: 'Collected data is used solely to provide platform functionality. Your data is not shared with or sold to third parties. AI tools (Crown Commend, Crown Fortune) do not store user data.'
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: 'All data transfers are encrypted via HTTPS. Local storage (localStorage) only stores user preferences. Session data is cleared when the browser is closed.'
    },
    {
      icon: Shield,
      title: 'Cookies',
      content: 'The platform uses essential cookies required for basic functionality. These cookies include language preference and theme settings. No third-party tracking cookies are used.'
    }
  ]

  return (
    <MainLayout
      title={language === 'tr' ? 'Gizlilik Politikası - CrownCode' : 'Privacy Policy - CrownCode'}
      description={language === 'tr' ? 'CrownCode platformu gizlilik politikası' : 'CrownCode platform privacy policy'}
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
              <span>{language === 'tr' ? 'Ana Sayfaya Dön' : 'Back to Home'}</span>
            </Link>

            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
                <Shield size={32} className="text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
                {language === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}
              </h1>
              <p className="text-text-secondary text-lg">
                {language === 'tr'
                  ? 'Son güncelleme: Ocak 2025'
                  : 'Last updated: January 2025'}
              </p>
            </div>

            {/* Introduction */}
            <div className="glass-card p-6 md:p-8 rounded-2xl mb-8">
              <p className="text-text-secondary leading-relaxed">
                {language === 'tr'
                  ? 'CrownCode, kullanıcı gizliliğine saygı gösterir. Bu politika, platformumuzun veri toplama ve kullanım uygulamalarını açıklar.'
                  : 'CrownCode respects user privacy. This policy explains our platform\'s data collection and usage practices.'}
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
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
                {language === 'tr'
                  ? 'Gizlilik ile ilgili sorularınız için:'
                  : 'For privacy-related questions:'}
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
