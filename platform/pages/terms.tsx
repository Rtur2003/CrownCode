'use client'

import React from 'react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Scale, Users, Mail } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'

const TermsPage: NextPage = () => {
  const { language } = useLanguage()

  const sections = language === 'tr' ? [
    {
      icon: CheckCircle,
      title: 'Kabul Edilen Kullanım',
      content: 'CrownCode platformunu kullanarak bu koşulları kabul etmiş olursunuz. Platform, yazılım geliştirme araçları, AI destekli uygulamalar ve açık kaynak projeler sunar. Platformu yasal amaçlar için kullanmayı kabul edersiniz.'
    },
    {
      icon: Users,
      title: 'Kullanıcı Sorumlulukları',
      content: 'Crown Commend gibi AI araçlarını sorumlu bir şekilde kullanmayı kabul edersiniz. Spam, kötüye kullanım veya platformların hizmet şartlarını ihlal eden içerik oluşturmak yasaktır. Tüm AI içerikleri bunu belirten bir açıklama içerir.'
    },
    {
      icon: Scale,
      title: 'Fikri Mülkiyet',
      content: 'CrownCode platformu ve içeriği Hasan Arthur Altuntaş\'a aittir. Açık kaynak projeler kendi lisansları altında sunulur (genellikle MIT). Platform kaynak kodunu kendi lisans koşulları altında kullanabilirsiniz.'
    },
    {
      icon: AlertTriangle,
      title: 'Sorumluluk Reddi',
      content: 'Platform "olduğu gibi" sunulmaktadır. AI araçları deneysel niteliktedir ve sonuçların doğruluğu garanti edilmez. Platform kesintileri veya veri kaybından sorumlu değiliz. Üçüncü taraf hizmetlerin kullanılabilirliğini garanti etmiyoruz.'
    }
  ] : [
    {
      icon: CheckCircle,
      title: 'Acceptable Use',
      content: 'By using the CrownCode platform, you agree to these terms. The platform provides software development tools, AI-powered applications, and open-source projects. You agree to use the platform for lawful purposes only.'
    },
    {
      icon: Users,
      title: 'User Responsibilities',
      content: 'You agree to use AI tools like Crown Commend responsibly. Creating spam, abuse, or content that violates platform terms of service is prohibited. All AI-generated content includes a disclaimer indicating this.'
    },
    {
      icon: Scale,
      title: 'Intellectual Property',
      content: 'The CrownCode platform and content belong to Hasan Arthur Altuntaş. Open-source projects are provided under their respective licenses (typically MIT). You may use platform source code under its license terms.'
    },
    {
      icon: AlertTriangle,
      title: 'Disclaimer',
      content: 'The platform is provided "as is". AI tools are experimental and result accuracy is not guaranteed. We are not responsible for platform interruptions or data loss. We do not guarantee third-party service availability.'
    }
  ]

  return (
    <MainLayout
      title={language === 'tr' ? 'Kullanım Koşulları - CrownCode' : 'Terms of Service - CrownCode'}
      description={language === 'tr' ? 'CrownCode platformu kullanım koşulları' : 'CrownCode platform terms of service'}
      url="https://hasanarthuraltuntas.xyz/terms"
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
                <FileText size={32} className="text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
                {language === 'tr' ? 'Kullanım Koşulları' : 'Terms of Service'}
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
                  ? 'CrownCode platformunu kullanmadan önce lütfen bu kullanım koşullarını dikkatlice okuyunuz. Platform üzerindeki tüm hizmetler bu koşullara tabidir.'
                  : 'Please read these terms of service carefully before using the CrownCode platform. All services on the platform are subject to these terms.'}
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

            {/* Open Source Note */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 glass-card p-6 md:p-8 rounded-2xl border-l-4 border-primary"
            >
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {language === 'tr' ? 'Açık Kaynak Lisansları' : 'Open Source Licenses'}
              </h3>
              <p className="text-text-secondary">
                {language === 'tr'
                  ? 'CrownCode açık kaynak bir projedir. Kaynak kodu MIT lisansı altında GitHub\'da mevcuttur. Üçüncü taraf kütüphaneler kendi lisanslarına tabidir.'
                  : 'CrownCode is an open-source project. Source code is available on GitHub under the MIT license. Third-party libraries are subject to their own licenses.'}
              </p>
              <a
                href="https://github.com/Rtur2003/CrownCode"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mt-4"
              >
                <span>{language === 'tr' ? 'GitHub\'da Görüntüle' : 'View on GitHub'}</span>
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
                {language === 'tr'
                  ? 'Koşullar hakkında sorularınız için:'
                  : 'For questions about these terms:'}
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

export default TermsPage
