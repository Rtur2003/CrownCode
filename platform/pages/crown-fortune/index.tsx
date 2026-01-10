'use client'

import React, { useState, useEffect, useCallback } from 'react'
import type { NextPage } from 'next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown,
  Sparkles,
  Heart,
  Briefcase,
  Coins,
  Activity,
  Clock,
  RotateCcw,
  Star
} from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'
import {
  DESTINY_CARDS,
  FORTUNE_CATEGORIES,
  getDailyDestiny,
  getDestinyDetails,
  getTimeUntilMidnightGMT3,
  getTurkeyDate,
  getEnergyDescription,
  type FortuneCategory,
  type DailyDestiny
} from '@/data/destiny'
import styles from '@/styles/pages/crown-fortune.module.css'

// Kategori ikonları
const CATEGORY_ICONS: Record<FortuneCategory, React.ReactNode> = {
  love: <Heart size={28} />,
  career: <Briefcase size={28} />,
  money: <Coins size={28} />,
  health: <Activity size={28} />,
  spirit: <Sparkles size={28} />
}

// Kategori renkleri
const CATEGORY_COLORS: Record<FortuneCategory, string> = {
  love: '#e74c3c',
  career: '#3498db',
  money: '#f39c12',
  health: '#27ae60',
  spirit: '#9b59b6'
}

const CrownFortunePage: NextPage = () => {
  const { language, t } = useLanguage()
  const [destiny, setDestiny] = useState<DailyDestiny | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [countdown, setCountdown] = useState('')
  const [mounted, setMounted] = useState(false)

  // Client mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load destiny
  useEffect(() => {
    if (!mounted) return

    const daily = getDailyDestiny()
    setDestiny(daily)

    // Eğer bugün zaten bakıldıysa
    const revealed = localStorage.getItem('crown_destiny_revealed')
    if (revealed === daily.date) {
      const catIndex = FORTUNE_CATEGORIES.findIndex(c => c.key === daily.category)
      setRotation(catIndex * 72 + 720 + 36)
      setShowCard(true)
      setIsCardFlipped(true)
    }
  }, [mounted])

  // Countdown
  useEffect(() => {
    if (!mounted) return

    const update = () => {
      const ms = getTimeUntilMidnightGMT3()
      const h = Math.floor(ms / 3600000)
      const m = Math.floor((ms % 3600000) / 60000)
      const s = Math.floor((ms % 60000) / 1000)
      setCountdown(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [mounted])

  // Midnight reset
  useEffect(() => {
    if (!mounted) return

    const check = () => {
      const today = getTurkeyDate()
      if (destiny && destiny.date !== today) {
        const newDestiny = getDailyDestiny()
        setDestiny(newDestiny)
        setShowCard(false)
        setIsCardFlipped(false)
        setRotation(0)
        localStorage.removeItem('crown_destiny_revealed')
      }
    }

    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [mounted, destiny])

  const spinWheel = useCallback(() => {
    if (!destiny || isSpinning || showCard) return

    setIsSpinning(true)

    // Hedef kategori indeksi
    const catIndex = FORTUNE_CATEGORIES.findIndex(c => c.key === destiny.category)
    // Her segment 72 derece, ortası için +36
    const target = (5 * 360) + (catIndex * 72) + 36

    setRotation(target)

    // Çark durduğunda kart göster
    setTimeout(() => {
      setIsSpinning(false)
      setShowCard(true)

      // Kart flip animasyonu
      setTimeout(() => {
        setIsCardFlipped(true)
        localStorage.setItem('crown_destiny_revealed', destiny.date)
      }, 500)
    }, 4000)
  }, [destiny, isSpinning, showCard])

  if (!mounted || !destiny) {
    return (
      <MainLayout
        title={t.crownFortune.meta.title}
        description={t.crownFortune.meta.description}
        keywords={t.crownFortune.meta.keywords}
      >
        <div className={styles['fortune-page']}>
          <div className={styles['fortune-container']}>
            <div className={styles['loading']}>
              <Sparkles className={styles['loading-icon']} size={32} />
              <span>{t.crownFortune.loading}</span>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  const details = getDestinyDetails(destiny)
  const cardName = language === 'tr' ? details.card.nameTr : details.card.name
  const catLabel = t.crownFortune.categories[destiny.category as keyof typeof t.crownFortune.categories]
  const energyText = t.crownFortune.energy[details.card.energy as keyof typeof t.crownFortune.energy]

  return (
    <MainLayout
      title={t.crownFortune.meta.title}
      description={t.crownFortune.meta.description}
      keywords={t.crownFortune.meta.keywords}
    >
      <div className={styles['fortune-page']}>
        <div className={styles['fortune-container']}>

          {/* HEADER */}
          <motion.header
            className={styles['fortune-header']}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles['header-badge']}>
              <Crown size={16} />
              <span>Crown Destiny</span>
            </div>
            <h1 className={styles['fortune-title']}>Bugünün Kaderi</h1>
            <p className={styles['fortune-subtitle']}>
              Çarkı çevir ve evrenin bugün sana ne söylediğini keşfet.
            </p>
            <div className={styles['countdown']}>
              <Clock size={16} />
              <span>Yeni kader:</span>
              <span className={styles['countdown-time']}>{countdown}</span>
            </div>
          </motion.header>

          {/* WHEEL SECTION */}
          <motion.section
            className={styles['wheel-section']}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className={styles['wheel-container']}>
              {/* Pointer */}
              <div className={styles['wheel-pointer']}>
                <Crown size={32} />
              </div>

              {/* Wheel with conic gradient */}
              <motion.div
                className={styles['wheel']}
                animate={{ rotate: rotation }}
                transition={{
                  duration: 4,
                  ease: [0.2, 0.8, 0.2, 1]
                }}
              >
                {/* Icons overlay */}
                <div className={styles['wheel-icons']}>
                  {FORTUNE_CATEGORIES.map((cat) => (
                    <div key={cat.key} className={styles['wheel-icon']}>
                      {CATEGORY_ICONS[cat.key]}
                    </div>
                  ))}
                </div>

                {/* Center */}
                <div className={styles['wheel-center']}>
                  <Crown size={32} />
                </div>
              </motion.div>

              {/* Glow */}
              <div className={styles['wheel-glow']} />
            </div>

            {/* Spin Button - sadece henüz açılmamışsa */}
            {!showCard && (
              <motion.button
                className={`${styles['spin-button']} ${isSpinning ? styles['spinning'] : ''}`}
                onClick={spinWheel}
                disabled={isSpinning}
                whileHover={{ scale: isSpinning ? 1 : 1.05 }}
                whileTap={{ scale: isSpinning ? 1 : 0.95 }}
              >
                {isSpinning ? (
                  <>
                    <RotateCcw className={styles['spin-icon']} size={20} />
                    <span>Çevriliyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Çarkı Çevir</span>
                  </>
                )}
              </motion.button>
            )}
          </motion.section>

          {/* 3D CARD SECTION */}
          <AnimatePresence>
            {showCard && (
              <motion.section
                className={styles['card-section']}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.6 }}
              >
                <div className={styles['card-container']}>
                  <div className={`${styles['card-flipper']} ${isCardFlipped ? styles['flipped'] : ''}`}>
                    {/* CARD BACK */}
                    <div className={`${styles['card-face']} ${styles['card-back']}`}>
                      <div className={styles['card-back-pattern']} />
                      <Crown className={styles['card-back-logo']} size={80} />
                      <span className={styles['card-back-text']}>Crown Destiny</span>
                    </div>

                    {/* CARD FRONT */}
                    <div className={`${styles['card-face']} ${styles['card-front']}`}>
                      <div className={styles['card-symbol']}>
                        {details.card.symbol}
                      </div>
                      <h2 className={styles['card-name']}>{cardName}</h2>
                      <div
                        className={styles['card-category']}
                        style={{ backgroundColor: CATEGORY_COLORS[destiny.category] }}
                      >
                        {CATEGORY_ICONS[destiny.category]}
                        <span>{catLabel}</span>
                      </div>
                      <div className={styles['card-energy']}>
                        {energyText}
                      </div>
                      <div className={styles['card-message']}>
                        <p>{details.message.text}</p>
                      </div>
                      <div className={styles['card-footer']}>
                        <Star size={12} />
                        <span className={styles['card-date']}>
                          {new Date().toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* INFO SECTION */}
          <motion.section
            className={styles['info-section']}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className={styles['info-card']}>
              <h3>Nasıl Çalışır?</h3>
              <ul>
                <li>Her gün gece yarısı (00:00) yeni kader belirlenir</li>
                <li>Çarkı çevir, kategorini öğren</li>
                <li>Kartın açılsın, mesajını oku</li>
                <li>Ertesi güne kadar aynı kader geçerli</li>
              </ul>
            </div>

            <div className={styles['categories-grid']}>
              {FORTUNE_CATEGORIES.map(cat => (
                <div
                  key={cat.key}
                  className={styles['category-item']}
                  style={{ borderColor: CATEGORY_COLORS[cat.key] }}
                >
                  <div style={{ color: CATEGORY_COLORS[cat.key] }}>
                    {CATEGORY_ICONS[cat.key]}
                  </div>
                  <span>{language === 'tr' ? cat.labelTr : cat.label}</span>
                </div>
              ))}
            </div>

            <div className={styles['disclaimer']}>
              <p>Bu uygulama eğlence amaçlıdır.</p>
            </div>
          </motion.section>

        </div>
      </div>
    </MainLayout>
  )
}

export default CrownFortunePage
