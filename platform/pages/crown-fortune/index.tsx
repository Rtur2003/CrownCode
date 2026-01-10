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
  RefreshCw,
  Star,
  Flame,
  Droplets,
  Mountain,
  Wind
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
  getElementEmoji,
  getEnergyDescription,
  type FortuneCategory,
  type DailyDestiny
} from '@/data/destiny'
import styles from '@/styles/pages/crown-fortune.module.css'

const CATEGORY_ICONS: Record<FortuneCategory, React.ReactNode> = {
  love: <Heart size={24} />,
  career: <Briefcase size={24} />,
  money: <Coins size={24} />,
  health: <Activity size={24} />,
  spirit: <Sparkles size={24} />
}

const ELEMENT_ICONS: Record<string, React.ReactNode> = {
  fire: <Flame size={16} />,
  water: <Droplets size={16} />,
  earth: <Mountain size={16} />,
  air: <Wind size={16} />,
  ether: <Sparkles size={16} />
}

const CrownFortunePage: NextPage = () => {
  const { t, language } = useLanguage()
  const [destiny, setDestiny] = useState<DailyDestiny | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [countdown, setCountdown] = useState('')
  const [mounted, setMounted] = useState(false)

  // Client mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load daily destiny
  useEffect(() => {
    if (!mounted) return

    const dailyDestiny = getDailyDestiny()
    setDestiny(dailyDestiny)

    const hasSeenToday = localStorage.getItem('crown_destiny_revealed')
    if (hasSeenToday === dailyDestiny.date) {
      setIsRevealed(true)
      const categoryIndex = FORTUNE_CATEGORIES.findIndex(c => c.key === dailyDestiny.category)
      setRotation(categoryIndex * (360 / FORTUNE_CATEGORIES.length) + 720)
    }
  }, [mounted])

  // Countdown
  useEffect(() => {
    if (!mounted) return

    const updateCountdown = () => {
      const ms = getTimeUntilMidnightGMT3()
      const hours = Math.floor(ms / (1000 * 60 * 60))
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((ms % (1000 * 60)) / 1000)
      setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [mounted])

  // Midnight reset
  useEffect(() => {
    if (!mounted) return

    const checkMidnight = () => {
      const currentDate = getTurkeyDate()
      if (destiny && destiny.date !== currentDate) {
        const newDestiny = getDailyDestiny()
        setDestiny(newDestiny)
        setIsRevealed(false)
        setRotation(0)
        localStorage.removeItem('crown_destiny_revealed')
      }
    }

    const interval = setInterval(checkMidnight, 60000)
    return () => clearInterval(interval)
  }, [mounted, destiny])

  const revealDestiny = useCallback(() => {
    if (!destiny || isSpinning || isRevealed) return

    setIsSpinning(true)

    const categoryIndex = FORTUNE_CATEGORIES.findIndex(c => c.key === destiny.category)
    const segmentAngle = 360 / FORTUNE_CATEGORIES.length
    const targetAngle = (5 * 360) + (categoryIndex * segmentAngle) + (segmentAngle / 2)

    setRotation(targetAngle)

    setTimeout(() => {
      setIsSpinning(false)
      setIsRevealed(true)
      localStorage.setItem('crown_destiny_revealed', destiny.date)
    }, 4000)
  }, [destiny, isSpinning, isRevealed])

  if (!mounted || !destiny) {
    return (
      <MainLayout
        title="Crown Destiny - Günlük Kader"
        description="Crown Destiny ile bugünün enerjisini keşfet!"
      >
        <div className={styles['fortune-page']}>
          <div className={styles['fortune-container']}>
            <div className={styles['loading']}>
              <Sparkles className={styles['loading-icon']} size={32} />
              <span>Kader yükleniyor...</span>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  const details = getDestinyDetails(destiny)
  const categoryLabel = language === 'tr' ? details.category.labelTr : details.category.label
  const cardName = language === 'tr' ? details.card.nameTr : details.card.name
  const energyText = getEnergyDescription(details.card.energy, language as 'tr' | 'en')

  // Ton bazlı renk
  const toneColors = {
    positive: '#27ae60',
    negative: '#e74c3c',
    neutral: '#9b59b6'
  }

  return (
    <MainLayout
      title="Crown Destiny - Günlük Kader"
      description="Crown Destiny ile bugünün enerjisini keşfet!"
      keywords="günlük kader, şans, fortune, destiny, CrownCode"
    >
      <div className={styles['fortune-page']}>
        <div className={styles['fortune-container']}>
          {/* Header */}
          <motion.div
            className={styles['fortune-header']}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles['header-badge']}>
              <Crown size={16} />
              <span>Crown Destiny</span>
            </div>
            <h1 className={styles['fortune-title']}>
              Bugünün Kaderi
            </h1>
            <p className={styles['fortune-subtitle']}>
              Çarkı çevir, kartını aç ve evrenin bugün sana ne söylediğini öğren.
            </p>

            <div className={styles['countdown']}>
              <Clock size={16} />
              <span>Yeni kader için:</span>
              <span className={styles['countdown-time']}>{countdown}</span>
            </div>
          </motion.div>

          {/* Wheel */}
          <div className={styles['wheel-section']}>
            <div className={styles['wheel-container']}>
              <div className={styles['wheel-pointer']}>
                <Crown size={32} />
              </div>

              <motion.div
                className={styles['wheel']}
                animate={{ rotate: rotation }}
                transition={{
                  duration: 4,
                  ease: [0.2, 0.8, 0.2, 1]
                }}
              >
                {FORTUNE_CATEGORIES.map((category, index) => {
                  const angle = (360 / FORTUNE_CATEGORIES.length) * index
                  return (
                    <div
                      key={category.key}
                      className={styles['wheel-segment']}
                      style={{
                        transform: `rotate(${angle}deg)`,
                        backgroundColor: category.color
                      }}
                    >
                      <div className={styles['segment-content']}>
                        {CATEGORY_ICONS[category.key]}
                      </div>
                      <span className={styles['segment-label']}>
                        {language === 'tr' ? category.labelTr : category.label}
                      </span>
                    </div>
                  )
                })}
                <div className={styles['wheel-center']}>
                  <Star size={32} />
                </div>
              </motion.div>

              <div className={styles['wheel-glow']} />
            </div>

            {!isRevealed && (
              <motion.button
                className={`${styles['spin-button']} ${isSpinning ? styles['spinning'] : ''}`}
                onClick={revealDestiny}
                disabled={isSpinning}
                whileHover={{ scale: isSpinning ? 1 : 1.05 }}
                whileTap={{ scale: isSpinning ? 1 : 0.95 }}
              >
                {isSpinning ? (
                  <>
                    <RefreshCw className={styles['spin-icon']} size={20} />
                    <span>Çevriliyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Kaderimi Gör</span>
                  </>
                )}
              </motion.button>
            )}
          </div>

          {/* Result */}
          <AnimatePresence mode="wait">
            {isRevealed && (
              <motion.div
                className={styles['result-card']}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Kart */}
                <motion.div
                  className={styles['destiny-card']}
                  initial={{ rotateY: 180, scale: 0.8 }}
                  animate={{ rotateY: 0, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className={styles['destiny-card-inner']}>
                    <div className={styles['destiny-card-symbol']}>
                      {details.card.symbol}
                    </div>
                    <div className={styles['destiny-card-name']}>
                      {cardName}
                    </div>
                    <div className={styles['destiny-card-element']}>
                      {ELEMENT_ICONS[details.card.element]}
                      <span>{getElementEmoji(details.card.element)}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Bilgi */}
                <div className={styles['result-header']}>
                  <motion.div
                    className={styles['result-category-badge']}
                    style={{ backgroundColor: details.category.color }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                  >
                    {CATEGORY_ICONS[destiny.category]}
                    <span>{categoryLabel}</span>
                  </motion.div>

                  <motion.div
                    className={styles['result-energy']}
                    style={{ borderColor: toneColors[destiny.tone] }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <span style={{ color: toneColors[destiny.tone] }}>{energyText}</span>
                  </motion.div>
                </div>

                {/* Mesaj */}
                <motion.div
                  className={styles['result-message']}
                  style={{ borderColor: toneColors[destiny.tone] + '40' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <p>{details.message.text}</p>
                </motion.div>

                {/* Footer */}
                <motion.div
                  className={styles['result-footer']}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Sparkles size={14} />
                  <span>Evrenin bugünkü mesajı</span>
                  <span className={styles['result-date']}>
                    {new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info */}
          <motion.div
            className={styles['info-section']}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className={styles['info-card']}>
              <h3>Crown Destiny Nedir?</h3>
              <ul>
                <li>Her gün gece yarısı (00:00 GMT+3) yeni bir kader belirlenir</li>
                <li>22 benzersiz Kader Kartı ve 5 yaşam alanı</li>
                <li>Olumlu, olumsuz ve dengeli mesajlar</li>
                <li>Kişisel ve genel yorumlar</li>
              </ul>
            </div>

            <div className={styles['categories-grid']}>
              {FORTUNE_CATEGORIES.map(cat => (
                <div
                  key={cat.key}
                  className={styles['category-item']}
                  style={{ borderColor: cat.color }}
                >
                  <div style={{ color: cat.color }}>
                    {CATEGORY_ICONS[cat.key]}
                  </div>
                  <span>{language === 'tr' ? cat.labelTr : cat.label}</span>
                </div>
              ))}
            </div>

            <div className={styles['disclaimer']}>
              <p>Bu uygulama eğlence amaçlıdır. Mesajlar sembolik ve motivasyoneldir.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  )
}

export default CrownFortunePage
