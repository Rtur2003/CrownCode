'use client'

import React, { useState } from 'react'
import type { NextPage } from 'next'
import { motion } from 'framer-motion'
import { Download, Settings } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'
import {
  HeroSection,
  FeaturesGrid,
  DownloadSection,
  ConfigGenerator,
  InstallationGuide,
} from '@/components/CrownVote'
import styles from '@/styles/pages/crown-vote.module.css'

const CrownVotePage: NextPage = () => {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'download' | 'config'>('download')

  const meta = t.crownVote?.meta

  return (
    <MainLayout
      title={meta?.title || 'Crown Vote - VOTRYX Automation Tool'}
      description={meta?.description || 'Automated voting tool for DistroKid Spotlight'}
      keywords={meta?.keywords || 'votryx, distrokid, spotlight, automation'}
    >
      <div className={styles['vote-page']}>
        {/* Background */}
        <div className={styles['vote-background']}>
          <div className={styles['vote-gradient']} />
        </div>

        <div className={styles['vote-container']}>
          {/* Hero Section */}
          <HeroSection />

          {/* Features Grid */}
          <FeaturesGrid />

          {/* Tab Navigation */}
          <motion.div
            className={styles['tab-navigation']}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <button
              className={activeTab === 'download' ? styles['active'] : ''}
              onClick={() => setActiveTab('download')}
            >
              <Download size={16} />
              {t.crownVote?.tabs?.download || 'Download'}
            </button>
            <button
              className={activeTab === 'config' ? styles['active'] : ''}
              onClick={() => setActiveTab('config')}
            >
              <Settings size={16} />
              {t.crownVote?.tabs?.config || 'Configuration'}
            </button>
          </motion.div>

          {/* Tab Content */}
          {activeTab === 'download' && (
            <>
              <DownloadSection />
              <InstallationGuide />
            </>
          )}

          {activeTab === 'config' && <ConfigGenerator />}
        </div>
      </div>
    </MainLayout>
  )
}

export default CrownVotePage
