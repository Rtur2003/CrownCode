'use client'

import React, { useState, useMemo } from 'react'
import type { NextPage } from 'next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Moon,
  Sparkles,
  Flame,
  Eye,
  Star,
  Search,
  ChevronRight,
  Brain,
  TrendingUp,
  BookOpen,
  X,
  Clock,
  AlertTriangle,
  Repeat,
  Compass,
  Layers
} from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'
import {
  MOCK_DREAMS,
  MOCK_STATS,
  DREAM_TYPE_COLORS,
  DREAM_TYPE_LABELS,
  EMOTION_COLORS,
  EMOTION_LABELS,
  formatDreamDate,
  truncateDreamContent,
  type DreamEntry,
  type DreamType
} from '@/data/dreams'
import styles from '@/styles/pages/crown-dreams.module.css'

// Rüya tipi ikonları
const DREAM_TYPE_ICONS: Record<DreamType, React.ReactNode> = {
  normal: <Moon size={14} />,
  lucid: <Sparkles size={14} />,
  nightmare: <AlertTriangle size={14} />,
  recurring: <Repeat size={14} />,
  prophetic: <Compass size={14} />,
  symbolic: <Layers size={14} />
}

const CrownDreamsPage: NextPage = () => {
  const { language } = useLanguage()
  const [selectedDream, setSelectedDream] = useState<DreamEntry | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<DreamType | 'all'>('all')

  // Filtrelenmiş rüyalar
  const filteredDreams = useMemo(() => {
    let dreams = MOCK_DREAMS

    if (activeFilter !== 'all') {
      dreams = dreams.filter(d => d.type === activeFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      dreams = dreams.filter(d =>
        (language === 'tr' ? d.title : d.titleEn).toLowerCase().includes(query) ||
        (language === 'tr' ? d.content : d.contentEn).toLowerCase().includes(query) ||
        d.tags.some(tag => tag.toLowerCase().includes(query)) ||
        d.symbols.some(symbol => symbol.toLowerCase().includes(query))
      )
    }

    return dreams
  }, [activeFilter, searchQuery, language])

  // İstatistik kartları
  const statCards = [
    {
      label: language === 'tr' ? 'Toplam Rüya' : 'Total Dreams',
      value: MOCK_STATS.totalDreams,
      icon: Moon,
      trend: 12
    },
    {
      label: language === 'tr' ? 'Lüsid Rüya' : 'Lucid Dreams',
      value: MOCK_STATS.lucidDreams,
      icon: Sparkles,
      trend: 24
    },
    {
      label: language === 'tr' ? 'Günlük Seri' : 'Daily Streak',
      value: `${MOCK_STATS.streakDays} ${language === 'tr' ? 'gün' : 'days'}`,
      icon: Flame,
      trend: 8
    },
    {
      label: language === 'tr' ? 'Ort. Netlik' : 'Avg Clarity',
      value: `${MOCK_STATS.avgClarity}/5`,
      icon: Eye,
      trend: 5
    },
  ]

  // Yıldızlı rüyalar
  const starredDreams = MOCK_DREAMS.filter(d => d.isStarred)

  return (
    <MainLayout
      title={language === 'tr' ? 'Crown Dreams - Rüya Günlüğü' : 'Crown Dreams - Dream Journal'}
      description={language === 'tr' ? 'Rüyalarınızı kaydedin, analiz edin ve bilinçaltınızı keşfedin.' : 'Record your dreams, analyze them, and explore your subconscious.'}
      keywords={language === 'tr' ? 'rüya günlüğü, lüsid rüya, rüya analizi' : 'dream journal, lucid dream, dream analysis'}
    >
      <div className={styles['dreams-page']}>
        {/* Background */}
        <div className={styles['dreams-background']}>
          <div className={styles['dreams-gradient']} />
          <div className={styles['dreams-stars']} />
        </div>

        <div className={styles['dreams-container']}>
          {/* HEADER */}
          <motion.header
            className={styles['dreams-header']}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles['header-top']}>
              <div>
                <div className={styles['header-badge']}>
                  <Brain size={14} />
                  <span>{language === 'tr' ? 'Bilinç Aktif' : 'Neural Link Active'}</span>
                </div>
                <h1 className={styles['dreams-title']}>
                  {language === 'tr' ? 'Rüya Günlüğü' : 'Dream Journal'}
                </h1>
                <p className={styles['dreams-subtitle']}>
                  {language === 'tr'
                    ? `${MOCK_STATS.streakDays} günlük seri • %${MOCK_STATS.lucidPercentage.toFixed(0)} lüsid oranı`
                    : `${MOCK_STATS.streakDays} day streak • ${MOCK_STATS.lucidPercentage.toFixed(0)}% lucid rate`
                  }
                </p>
              </div>
              <button className={styles['new-dream-btn']}>
                <BookOpen size={16} />
                <span>{language === 'tr' ? 'Yeni Rüya' : 'New Dream'}</span>
              </button>
            </div>
          </motion.header>

          {/* STAT CARDS */}
          <motion.div
            className={styles['stats-grid']}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {statCards.map((stat) => (
              <div key={stat.label} className={styles['stat-card']}>
                <div className={styles['stat-header']}>
                  <div className={styles['stat-icon']}>
                    <stat.icon size={18} />
                  </div>
                  <span className={`${styles['stat-trend']} ${stat.trend >= 0 ? styles['positive'] : styles['negative']}`}>
                    {stat.trend >= 0 ? '+' : ''}{stat.trend}%
                  </span>
                </div>
                <div className={styles['stat-label']}>{stat.label}</div>
                <div className={styles['stat-value']}>{stat.value}</div>
              </div>
            ))}
          </motion.div>

          {/* MAIN CONTENT */}
          <div className={styles['main-content']}>
            {/* LEFT: Dream List */}
            <motion.div
              className={styles['dreams-list-section']}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Search & Filter */}
              <div className={styles['search-filter']}>
                <div className={styles['search-box']}>
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder={language === 'tr' ? 'Rüya ara...' : 'Search dreams...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className={styles['search-clear']}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className={styles['filter-chips']}>
                  <button
                    className={`${styles['filter-chip']} ${activeFilter === 'all' ? styles['active'] : ''}`}
                    onClick={() => setActiveFilter('all')}
                  >
                    {language === 'tr' ? 'Tümü' : 'All'}
                  </button>
                  {(['lucid', 'normal', 'nightmare', 'symbolic'] as DreamType[]).map(type => (
                    <button
                      key={type}
                      className={`${styles['filter-chip']} ${activeFilter === type ? styles['active'] : ''}`}
                      onClick={() => setActiveFilter(type)}
                      style={{
                        borderColor: activeFilter === type ? DREAM_TYPE_COLORS[type] : undefined,
                        color: activeFilter === type ? DREAM_TYPE_COLORS[type] : undefined
                      }}
                    >
                      {DREAM_TYPE_ICONS[type]}
                      <span>{DREAM_TYPE_LABELS[type][language]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dream List */}
              <div className={styles['dreams-list']}>
                {filteredDreams.length === 0 ? (
                  <div className={styles['no-dreams']}>
                    <Moon size={32} />
                    <p>{language === 'tr' ? 'Rüya bulunamadı' : 'No dreams found'}</p>
                  </div>
                ) : (
                  filteredDreams.map((dream, i) => (
                    <motion.button
                      key={dream.id}
                      className={`${styles['dream-card']} ${selectedDream?.id === dream.id ? styles['selected'] : ''}`}
                      onClick={() => setSelectedDream(dream)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className={styles['dream-card-header']}>
                        <div className={styles['dream-type-indicator']} style={{ backgroundColor: DREAM_TYPE_COLORS[dream.type] }} />
                        <span className={styles['dream-title']}>
                          {language === 'tr' ? dream.title : dream.titleEn}
                        </span>
                        {dream.isStarred && <Star size={12} className={styles['dream-star']} />}
                      </div>
                      <p className={styles['dream-preview']}>
                        {truncateDreamContent(language === 'tr' ? dream.content : dream.contentEn)}
                      </p>
                      <div className={styles['dream-card-footer']}>
                        <span className={styles['dream-date']}>
                          <Clock size={12} />
                          {formatDreamDate(dream.date, language)}
                        </span>
                        <div className={styles['dream-emotions']}>
                          {dream.emotions.slice(0, 2).map(emotion => (
                            <span
                              key={emotion}
                              className={styles['emotion-dot']}
                              style={{ backgroundColor: EMOTION_COLORS[emotion] }}
                              title={EMOTION_LABELS[emotion][language]}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>

            {/* RIGHT: Dream Detail or Stats */}
            <motion.div
              className={styles['detail-section']}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {selectedDream ? (
                  <motion.div
                    key="dream-detail"
                    className={styles['dream-detail']}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className={styles['detail-header']}>
                      <div>
                        <div
                          className={styles['detail-type-badge']}
                          style={{ backgroundColor: DREAM_TYPE_COLORS[selectedDream.type] }}
                        >
                          {DREAM_TYPE_ICONS[selectedDream.type]}
                          <span>{DREAM_TYPE_LABELS[selectedDream.type][language]}</span>
                        </div>
                        <h2 className={styles['detail-title']}>
                          {language === 'tr' ? selectedDream.title : selectedDream.titleEn}
                        </h2>
                        <span className={styles['detail-date']}>
                          {formatDreamDate(selectedDream.date, language)}
                        </span>
                      </div>
                      <button
                        className={styles['close-detail']}
                        onClick={() => setSelectedDream(null)}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Stats Row */}
                    <div className={styles['detail-stats']}>
                      <div className={styles['detail-stat']}>
                        <Eye size={14} />
                        <span>{language === 'tr' ? 'Netlik' : 'Clarity'}</span>
                        <strong>{selectedDream.clarity}/5</strong>
                      </div>
                      <div className={styles['detail-stat']}>
                        <Sparkles size={14} />
                        <span>{language === 'tr' ? 'Lüsidlik' : 'Lucidity'}</span>
                        <strong>{selectedDream.lucidity}%</strong>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={styles['detail-content']}>
                      <p>{language === 'tr' ? selectedDream.content : selectedDream.contentEn}</p>
                    </div>

                    {/* Emotions */}
                    <div className={styles['detail-emotions']}>
                      <h4>{language === 'tr' ? 'Duygular' : 'Emotions'}</h4>
                      <div className={styles['emotion-tags']}>
                        {selectedDream.emotions.map(emotion => (
                          <span
                            key={emotion}
                            className={styles['emotion-tag']}
                            style={{
                              backgroundColor: `${EMOTION_COLORS[emotion]}20`,
                              borderColor: EMOTION_COLORS[emotion],
                              color: EMOTION_COLORS[emotion]
                            }}
                          >
                            {EMOTION_LABELS[emotion][language]}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Symbols */}
                    <div className={styles['detail-symbols']}>
                      <h4>{language === 'tr' ? 'Semboller' : 'Symbols'}</h4>
                      <div className={styles['symbol-tags']}>
                        {selectedDream.symbols.map(symbol => (
                          <span key={symbol} className={styles['symbol-tag']}>
                            {symbol}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* AI Analysis */}
                    {selectedDream.aiAnalysis && (
                      <div className={styles['ai-analysis']}>
                        <h4>
                          <Brain size={14} />
                          {language === 'tr' ? 'AI Analizi' : 'AI Analysis'}
                        </h4>
                        <p>{language === 'tr' ? selectedDream.aiAnalysis : selectedDream.aiAnalysisEn}</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="stats-panel"
                    className={styles['stats-panel']}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Starred Dreams */}
                    <div className={styles['panel-section']}>
                      <h3>
                        <Star size={16} className={styles['star-filled']} />
                        {language === 'tr' ? 'Yıldızlı Rüyalar' : 'Starred Dreams'}
                      </h3>
                      <div className={styles['starred-list']}>
                        {starredDreams.map(dream => (
                          <button
                            key={dream.id}
                            className={styles['starred-item']}
                            onClick={() => setSelectedDream(dream)}
                          >
                            <span
                              className={styles['starred-dot']}
                              style={{ backgroundColor: DREAM_TYPE_COLORS[dream.type] }}
                            />
                            <span className={styles['starred-title']}>
                              {language === 'tr' ? dream.title : dream.titleEn}
                            </span>
                            <ChevronRight size={14} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Insights */}
                    <div className={styles['panel-section']}>
                      <h3>
                        <TrendingUp size={16} />
                        {language === 'tr' ? 'İç Görüler' : 'Dream Insights'}
                      </h3>
                      <div className={styles['insights-list']}>
                        <div className={styles['insight-card']}>
                          <span className={styles['insight-label']}>
                            {language === 'tr' ? 'En Yaygın Tema' : 'Most Common Theme'}
                          </span>
                          <span className={styles['insight-value']}>
                            {language === 'tr' ? 'Uçuş & Özgürlük' : 'Flight & Freedom'}
                          </span>
                          <span className={styles['insight-sub']}>
                            {language === 'tr' ? '18 rüyada görüldü' : 'Appears in 18 dreams'}
                          </span>
                        </div>
                        <div className={styles['insight-card']}>
                          <span className={styles['insight-label']}>
                            {language === 'tr' ? 'Baskın Duygu' : 'Dominant Emotion'}
                          </span>
                          <span className={styles['insight-value']}>
                            {language === 'tr' ? 'Merak' : 'Wonder'}
                          </span>
                          <span className={styles['insight-sub']}>
                            {language === 'tr' ? 'Rüyaların %63\'ünde' : 'Present in 63% of dreams'}
                          </span>
                        </div>
                        <div className={`${styles['insight-card']} ${styles['insight-highlight']}`}>
                          <span className={styles['insight-label']}>
                            {language === 'tr' ? 'Lüsid Tetikleyici' : 'Lucid Trigger'}
                          </span>
                          <span className={styles['insight-value']}>
                            {language === 'tr' ? 'Kapı sembolleri' : 'Door symbols'}
                          </span>
                          <span className={styles['insight-sub']}>
                            {language === 'tr' ? '5 kez lüsidliğe yol açtı' : '5 times led to lucidity'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Weekly Activity */}
                    <div className={styles['panel-section']}>
                      <h3>
                        <Flame size={16} />
                        {language === 'tr' ? 'Haftalık Aktivite' : 'Weekly Activity'}
                      </h3>
                      <div className={styles['weekly-chart']}>
                        {MOCK_STATS.weeklyActivity.map(day => (
                          <div key={day.day} className={styles['day-bar']}>
                            <div
                              className={styles['bar-fill']}
                              style={{ height: `${(day.count / 10) * 100}%` }}
                            />
                            <span className={styles['day-label']}>
                              {language === 'tr' ? day.day : day.dayEn}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default CrownDreamsPage
