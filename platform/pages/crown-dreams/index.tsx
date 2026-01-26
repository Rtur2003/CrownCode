'use client'

import React, { useState, useMemo } from 'react'
import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
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
  Layers,
  Zap,
  BarChart3,
  Calendar,
  Target,
  Bed
} from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'
import { GlassCard, StatCard } from '@/components/CrownDreams/GlassCard'
import { ProgressBar, CircularProgress } from '@/components/CrownDreams/ProgressBar'
import { CyberButton } from '@/components/CrownDreams/CyberButton'
import {
  MOCK_DREAMS,
  MOCK_STATS,
  MOCK_PATTERNS,
  MOCK_USER,
  DREAM_TYPE_COLORS,
  DREAM_TYPE_LABELS,
  EMOTION_COLORS,
  EMOTION_LABELS,
  formatDreamDate,
  truncateDreamContent,
  getLucidityLevel,
  getSleepQualityLabel,
  type DreamEntry,
  type DreamType
} from '@/data/dreams'
import styles from '@/styles/pages/crown-dreams.module.css'

// Lazy load GoldenParticles for performance
const GoldenParticles = dynamic(
  () => import('@/components/CrownDreams/GoldenParticles'),
  { ssr: false }
)

// Dream type icons
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
  // Tab state - reserved for future analytics feature
  const [_activeTab, _setActiveTab] = useState<'journal' | 'analytics'>('journal')

  // Filtered dreams
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

  // Starred dreams
  const starredDreams = MOCK_DREAMS.filter(d => d.isStarred)
  const recentDreams = MOCK_DREAMS.slice(0, 4)

  // Stat cards data
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
      label: language === 'tr' ? 'Günlük Seri' : 'Current Streak',
      value: `${MOCK_STATS.streakDays} ${language === 'tr' ? 'gün' : 'days'}`,
      icon: Flame,
      trend: 8
    },
    {
      label: language === 'tr' ? 'Ort. Netlik' : 'Avg Clarity',
      value: `${MOCK_STATS.avgClarity}/5`,
      icon: Eye,
      trend: 5
    }
  ]

  return (
    <MainLayout
      title={language === 'tr' ? 'Crown Dreams - Rüya Günlüğü' : 'Crown Dreams - Dream Journal'}
      description={language === 'tr' ? 'Rüyalarınızı kaydedin, analiz edin ve bilinçaltınızı keşfedin.' : 'Record your dreams, analyze them, and explore your subconscious.'}
      keywords={language === 'tr' ? 'rüya günlüğü, lüsid rüya, rüya analizi' : 'dream journal, lucid dream, dream analysis'}
    >
      <div className={styles['dreams-page']}>
        {/* 3D Particle Background */}
        <GoldenParticles />

        {/* Background overlays */}
        <div className={styles['dreams-background']}>
          <div className={styles['dreams-gradient']} />
          <div className={styles['dreams-stars']} />
        </div>

        <div className={styles['dreams-container']}>
          {/* HEADER SECTION */}
          <motion.header
            className={styles['dreams-header']}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles['header-top']}>
              <div>
                <div className={styles['header-badge']}>
                  <Zap size={12} />
                  <span>{language === 'tr' ? 'Neural Link Aktif' : 'Neural Link Active'}</span>
                </div>
                <h1 className={styles['dreams-title']}>
                  {language === 'tr' ? `Hoş Geldin, ${MOCK_USER.name}` : `Welcome back, ${MOCK_USER.name}`}
                </h1>
                <p className={styles['dreams-subtitle']}>
                  {language === 'tr'
                    ? `${MOCK_STATS.streakDays} günlük seri • %${MOCK_STATS.lucidPercentage} lüsid oranı`
                    : `${MOCK_STATS.streakDays} day streak • ${MOCK_STATS.lucidPercentage}% lucid rate`
                  }
                </p>
              </div>
              <div className={styles['header-actions']}>
                <CyberButton
                  leftIcon={<BookOpen size={14} />}
                  onClick={() => setActiveTab('journal')}
                >
                  {language === 'tr' ? 'Yeni Rüya' : 'New Dream'}
                </CyberButton>
                <CyberButton
                  variant="ghost"
                  leftIcon={<BarChart3 size={14} />}
                  onClick={() => setActiveTab('analytics')}
                >
                  {language === 'tr' ? 'Analitik' : 'Analytics'}
                </CyberButton>
              </div>
            </div>
          </motion.header>

          {/* STAT CARDS */}
          <div className={styles['stats-grid']}>
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <StatCard
                  label={stat.label}
                  value={stat.value}
                  icon={<stat.icon size={18} />}
                  trend={stat.trend}
                />
              </motion.div>
            ))}
          </div>

          {/* MAIN CONTENT GRID */}
          <div className={styles['main-grid']}>
            {/* LEFT COLUMN - Lucid Mastery + Recent Dreams */}
            <div className={styles['left-column']}>
              {/* Lucid Mastery Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <GlassCard variant="bordered" className={styles['mastery-card']}>
                  <h3 className={styles['section-title']}>
                    <Brain size={16} />
                    {language === 'tr' ? 'Lüsid Ustalık' : 'Lucid Mastery'}
                  </h3>

                  <div className={styles['mastery-content']}>
                    <CircularProgress
                      value={MOCK_USER.lucidMastery}
                      size={140}
                      label={language === 'tr' ? 'Ustalık' : 'Mastery'}
                    />

                    <div className={styles['mastery-stats']}>
                      <ProgressBar
                        value={MOCK_STATS.avgClarity * 20}
                        label={language === 'tr' ? 'Rüya Netliği' : 'Dream Clarity'}
                        showPercentage
                        size="sm"
                      />
                      <ProgressBar
                        value={MOCK_STATS.avgSleepQuality}
                        label={language === 'tr' ? 'Uyku Kalitesi' : 'Sleep Quality'}
                        showPercentage
                        variant="bronze"
                        size="sm"
                      />
                    </div>
                  </div>

                  <div className={styles['mastery-footer']}>
                    <p className={styles['milestone-label']}>
                      {language === 'tr' ? 'Sonraki seviye' : 'Next milestone'}
                    </p>
                    <p className={styles['milestone-text']}>
                      %{100 - MOCK_USER.lucidMastery} {language === 'tr' ? 'kaldı' : 'to'}{' '}
                      <span className={styles['milestone-rank']}>
                        {language === 'tr' ? 'Bilinç Kaşifi' : 'Consciousness Explorer'}
                      </span>
                    </p>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Recent Dreams Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <GlassCard variant="bordered" className={styles['recent-card']}>
                  <div className={styles['section-header']}>
                    <h3 className={styles['section-title']}>
                      <Moon size={16} />
                      {language === 'tr' ? 'Son Rüyalar' : 'Recent Dreams'}
                    </h3>
                    <button
                      className={styles['view-all-btn']}
                      onClick={() => setActiveTab('journal')}
                    >
                      {language === 'tr' ? 'Tümünü Gör' : 'View All'}
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className={styles['recent-list']}>
                    {recentDreams.map((dream, i) => (
                      <motion.button
                        key={dream.id}
                        className={styles['recent-item']}
                        onClick={() => setSelectedDream(dream)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                      >
                        <div className={styles['recent-item-main']}>
                          <div className={styles['recent-item-header']}>
                            <span
                              className={styles['type-dot']}
                              style={{ backgroundColor: DREAM_TYPE_COLORS[dream.type] }}
                            />
                            <span className={styles['recent-item-title']}>
                              {language === 'tr' ? dream.title : dream.titleEn}
                            </span>
                            {dream.isStarred && (
                              <Star size={12} className={styles['star-icon']} />
                            )}
                          </div>
                          <p className={styles['recent-item-preview']}>
                            {truncateDreamContent(language === 'tr' ? dream.content : dream.contentEn, 60)}
                          </p>
                        </div>
                        <div className={styles['recent-item-meta']}>
                          <span className={styles['recent-date']}>
                            {formatDreamDate(dream.date, language)}
                          </span>
                          {dream.type === 'lucid' && (
                            <span className={styles['lucid-badge']}>
                              {language === 'tr' ? 'Lüsid' : 'Lucid'}
                            </span>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            {/* CENTER COLUMN - Dream Journal */}
            <motion.div
              className={styles['center-column']}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <GlassCard variant="bordered" className={styles['journal-card']}>
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
                      <button
                        onClick={() => setSearchQuery('')}
                        className={styles['search-clear']}
                      >
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
                    {(['lucid', 'normal', 'nightmare', 'symbolic', 'recurring', 'prophetic'] as DreamType[]).map(type => (
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
                          <div
                            className={styles['dream-type-indicator']}
                            style={{ backgroundColor: DREAM_TYPE_COLORS[dream.type] }}
                          />
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
                            {dream.emotions.slice(0, 3).map(emotion => (
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
              </GlassCard>
            </motion.div>

            {/* RIGHT COLUMN - Detail or Stats */}
            <motion.div
              className={styles['right-column']}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <AnimatePresence mode="wait">
                {selectedDream ? (
                  <motion.div
                    key="dream-detail"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <GlassCard variant="glow" className={styles['detail-card']}>
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
                            <Calendar size={12} />
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

                      {/* Dream Stats */}
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
                        <div className={styles['detail-stat']}>
                          <Bed size={14} />
                          <span>{language === 'tr' ? 'Uyku' : 'Sleep'}</span>
                          <strong>{getSleepQualityLabel(selectedDream.sleepQuality, language)}</strong>
                        </div>
                        <div className={styles['detail-stat']}>
                          <Clock size={14} />
                          <span>{language === 'tr' ? 'Süre' : 'Duration'}</span>
                          <strong>{selectedDream.duration} {language === 'tr' ? 'dk' : 'min'}</strong>
                        </div>
                      </div>

                      {/* Lucidity Level */}
                      <div className={styles['lucidity-bar']}>
                        <div className={styles['lucidity-label']}>
                          <Target size={14} />
                          <span>{getLucidityLevel(selectedDream.lucidity, language)}</span>
                        </div>
                        <ProgressBar
                          value={selectedDream.lucidity}
                          size="sm"
                          variant="gradient"
                        />
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

                      {/* Characters & Locations */}
                      {(selectedDream.characters.length > 0 || selectedDream.locations.length > 0) && (
                        <div className={styles['detail-extra']}>
                          {selectedDream.characters.length > 0 && (
                            <div className={styles['extra-section']}>
                              <h4>{language === 'tr' ? 'Karakterler' : 'Characters'}</h4>
                              <p>{selectedDream.characters.join(', ')}</p>
                            </div>
                          )}
                          {selectedDream.locations.length > 0 && (
                            <div className={styles['extra-section']}>
                              <h4>{language === 'tr' ? 'Mekanlar' : 'Locations'}</h4>
                              <p>{selectedDream.locations.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      )}

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
                    </GlassCard>
                  </motion.div>
                ) : (
                  <motion.div
                    key="stats-panel"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={styles['stats-panel']}
                  >
                    {/* Starred Dreams */}
                    <GlassCard className={styles['panel-card']}>
                      <h3 className={styles['panel-title']}>
                        <Star size={16} className={styles['star-filled']} />
                        {language === 'tr' ? 'Yıldızlı Rüyalar' : 'Starred Dreams'}
                      </h3>
                      <div className={styles['starred-list']}>
                        {starredDreams.length > 0 ? (
                          starredDreams.map(dream => (
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
                          ))
                        ) : (
                          <div className={styles['empty-starred']}>
                            <Star size={24} />
                            <p>{language === 'tr' ? 'Henüz yıldızlı rüya yok' : 'No starred dreams yet'}</p>
                          </div>
                        )}
                      </div>
                    </GlassCard>

                    {/* Dream Insights */}
                    <GlassCard className={styles['panel-card']}>
                      <h3 className={styles['panel-title']}>
                        <TrendingUp size={16} />
                        {language === 'tr' ? 'İç Görüler' : 'Dream Insights'}
                      </h3>
                      <div className={styles['insights-list']}>
                        {MOCK_PATTERNS.slice(0, 3).map((pattern, i) => (
                          <div
                            key={pattern.id}
                            className={`${styles['insight-card']} ${i === 2 ? styles['insight-highlight'] : ''}`}
                          >
                            <span className={styles['insight-label']}>
                              {pattern.type === 'theme' && (language === 'tr' ? 'En Yaygın Tema' : 'Most Common Theme')}
                              {pattern.type === 'emotion' && (language === 'tr' ? 'Baskın Duygu' : 'Dominant Emotion')}
                              {pattern.type === 'symbol' && (language === 'tr' ? 'Lüsid Tetikleyici' : 'Lucid Trigger')}
                              {pattern.type === 'location' && (language === 'tr' ? 'Sık Görülen Mekan' : 'Frequent Location')}
                              {pattern.type === 'character' && (language === 'tr' ? 'Tekrarlayan Karakter' : 'Recurring Character')}
                            </span>
                            <span className={styles['insight-value']}>
                              {language === 'tr' ? pattern.name : pattern.nameEn}
                            </span>
                            <span className={styles['insight-sub']}>
                              {language === 'tr'
                                ? `${pattern.frequency} rüyada görüldü`
                                : `Appears in ${pattern.frequency} dreams`
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                    {/* Weekly Activity */}
                    <GlassCard className={styles['panel-card']}>
                      <h3 className={styles['panel-title']}>
                        <Flame size={16} />
                        {language === 'tr' ? 'Haftalık Aktivite' : 'Weekly Activity'}
                      </h3>
                      <div className={styles['weekly-chart']}>
                        {MOCK_STATS.weeklyActivity.map((day, i) => (
                          <div key={day.day} className={styles['day-bar']}>
                            <motion.div
                              className={styles['bar-fill']}
                              initial={{ height: 0 }}
                              animate={{ height: `${(day.count / 10) * 100}%` }}
                              transition={{ duration: 0.5, delay: i * 0.1 }}
                            />
                            <span className={styles['day-label']}>
                              {language === 'tr' ? day.day : day.dayEn}
                            </span>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
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
