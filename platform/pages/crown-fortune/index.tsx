'use client'

import React, { useState, useEffect, useCallback } from 'react'
import type { NextPage } from 'next'
import Image from 'next/image'
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
  Star
} from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'
import {
  TAROT_CARDS,
  FORTUNE_CATEGORIES,
  getDailyFortune,
  getFortuneDetails,
  getTimeUntilMidnightGMT3,
  getTurkeyDate,
  type FortuneCategory,
  type DailyFortune
} from '@/data/tarot'
import styles from '@/styles/pages/crown-fortune.module.css'

const CATEGORY_ICONS: Record<FortuneCategory, React.ReactNode> = {
  love: <Heart size={24} />,
  career: <Briefcase size={24} />,
  money: <Coins size={24} />,
  health: <Activity size={24} />,
  spirit: <Sparkles size={24} />
}

const CrownFortunePage: NextPage = () => {
  const { t, language } = useLanguage()
  const [fortune, setFortune] = useState<DailyFortune | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [countdown, setCountdown] = useState('')
  const [mounted, setMounted] = useState(false)

  // Client-side mount check
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load daily fortune
  useEffect(() => {
    if (!mounted) return

    const dailyFortune = getDailyFortune()
    setFortune(dailyFortune)

    // Eğer bugün zaten fal bakılmışsa direkt göster
    const hasSeenToday = localStorage.getItem('crown_fortune_revealed')
    if (hasSeenToday === dailyFortune.date) {
      setIsRevealed(true)
      // Çarkı doğru pozisyona getir
      const categoryIndex = FORTUNE_CATEGORIES.findIndex(c => c.key === dailyFortune.category)
      setRotation(categoryIndex * (360 / FORTUNE_CATEGORIES.length) + 720)
    }
  }, [mounted])

  // Countdown timer
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

  // Midnight reset check
  useEffect(() => {
    if (!mounted) return

    const checkMidnight = () => {
      const currentDate = getTurkeyDate()
      if (fortune && fortune.date !== currentDate) {
        // Gece yarısı geçti, yeni fal yükle
        const newFortune = getDailyFortune()
        setFortune(newFortune)
        setIsRevealed(false)
        setRotation(0)
        localStorage.removeItem('crown_fortune_revealed')
      }
    }

    const interval = setInterval(checkMidnight, 60000) // Her dakika kontrol
    return () => clearInterval(interval)
  }, [mounted, fortune])

  const revealFortune = useCallback(() => {
    if (!fortune || isSpinning || isRevealed) return

    setIsSpinning(true)

    // Kategoriye göre çarkı döndür
    const categoryIndex = FORTUNE_CATEGORIES.findIndex(c => c.key === fortune.category)
    const segmentAngle = 360 / FORTUNE_CATEGORIES.length
    const targetAngle = (5 * 360) + (categoryIndex * segmentAngle) + (segmentAngle / 2)

    setRotation(targetAngle)

    setTimeout(() => {
      setIsSpinning(false)
      setIsRevealed(true)
      localStorage.setItem('crown_fortune_revealed', fortune.date)
    }, 4000)
  }, [fortune, isSpinning, isRevealed])

  if (!mounted || !fortune) {
    return (
      <MainLayout
        title="Crown Fortune - Günlük Tarot Falı"
        description="CrownCode günlük tarot falı ile şansını keşfet!"
      >
        <div className={styles['fortune-page']}>
          <div className={styles['fortune-container']}>
            <div className={styles['loading']}>
              <Sparkles className={styles['loading-icon']} size={32} />
              <span>Yükleniyor...</span>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  const fortuneDetails = getFortuneDetails(fortune)
  const categoryLabel = language === 'tr' ? fortuneDetails.category.labelTr : fortuneDetails.category.label
  const cardName = language === 'tr' ? fortuneDetails.card.nameTr : fortuneDetails.card.name

  return (
    <MainLayout
      title={t.crownFortune?.meta?.title || "Crown Fortune - Günlük Tarot Falı"}
      description={t.crownFortune?.meta?.description || "CrownCode günlük tarot falı ile şansını keşfet!"}
      keywords="tarot, günlük fal, şans, fortune, daily tarot, CrownCode"
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
              <span>{t.crownFortune?.header?.badge || "Günlük Tarot"}</span>
            </div>
            <h1 className={styles['fortune-title']}>
              {t.crownFortune?.header?.title || "Bugünün Falı"}
            </h1>
            <p className={styles['fortune-subtitle']}>
              {t.crownFortune?.header?.subtitle || "Çarkı çevir, kartını aç ve günün mesajını al."}
            </p>

            {/* Countdown */}
            <div className={styles['countdown']}>
              <Clock size={16} />
              <span>{t.crownFortune?.countdown?.label || "Yeni fal için:"}</span>
              <span className={styles['countdown-time']}>{countdown}</span>
            </div>
          </motion.div>

          {/* Wheel Section */}
          <div className={styles['wheel-section']}>
            <div className={styles['wheel-container']}>
              {/* Pointer */}
              <div className={styles['wheel-pointer']}>
                <Crown size={32} />
              </div>

              {/* Wheel */}
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

              {/* Glow Effect */}
              <div className={styles['wheel-glow']} />
            </div>

            {/* Spin Button */}
            {!isRevealed && (
              <motion.button
                className={`${styles['spin-button']} ${isSpinning ? styles['spinning'] : ''}`}
                onClick={revealFortune}
                disabled={isSpinning}
                whileHover={{ scale: isSpinning ? 1 : 1.05 }}
                whileTap={{ scale: isSpinning ? 1 : 0.95 }}
              >
                {isSpinning ? (
                  <>
                    <RefreshCw className={styles['spin-icon']} size={20} />
                    <span>{t.crownFortune?.buttons?.spinning || "Çevriliyor..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>{t.crownFortune?.buttons?.reveal || "Falımı Aç"}</span>
                  </>
                )}
              </motion.button>
            )}
          </div>

          {/* Result Card */}
          <AnimatePresence mode="wait">
            {isRevealed && (
              <motion.div
                className={styles['result-card']}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Tarot Card */}
                <div className={styles['tarot-card-container']}>
                  <motion.div
                    className={styles['tarot-card']}
                    initial={{ rotateY: 180 }}
                    animate={{ rotateY: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <div className={styles['tarot-card-inner']}>
                      <div className={styles['tarot-card-image']}>
                        <Image
                          src={fortuneDetails.card.image}
                          alt={cardName}
                          width={200}
                          height={320}
                          onError={(e) => {
                            // Fallback görsel
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                        <div className={styles['tarot-card-fallback']}>
                          <Crown size={64} />
                          <span>{cardName}</span>
                        </div>
                      </div>
                      <div className={styles['tarot-card-glow']} />
                    </div>
                  </motion.div>
                </div>

                {/* Card Info */}
                <div className={styles['result-header']}>
                  <div
                    className={styles['result-category-badge']}
                    style={{ backgroundColor: fortuneDetails.category.color }}
                  >
                    {CATEGORY_ICONS[fortune.category]}
                    <span>{categoryLabel}</span>
                  </div>
                  <h2 className={styles['result-card-name']}>{cardName}</h2>
                  <span className={styles['result-card-number']}>
                    {fortuneDetails.card.id === 0 ? '0' : fortuneDetails.card.id} - Major Arcana
                  </span>
                </div>

                {/* Message */}
                <div className={styles['result-message']}>
                  <p>{fortuneDetails.message}</p>
                </div>

                {/* Footer */}
                <div className={styles['result-footer']}>
                  <Sparkles size={14} />
                  <span>{t.crownFortune?.result?.footer || "Bugünün mesajı senin için"}</span>
                  <span className={styles['result-date']}>
                    {new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info Section */}
          <motion.div
            className={styles['info-section']}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className={styles['info-card']}>
              <h3>{t.crownFortune?.info?.title || "Nasıl Çalışır?"}</h3>
              <ul>
                <li>{t.crownFortune?.info?.steps?.[0] || "Her gün 00:00'da (GMT+3) yeni bir fal belirlenir"}</li>
                <li>{t.crownFortune?.info?.steps?.[1] || "Çarkı çevir ve günün kartını aç"}</li>
                <li>{t.crownFortune?.info?.steps?.[2] || "22 Major Arcana kartından biri sana atanır"}</li>
                <li>{t.crownFortune?.info?.steps?.[3] || "5 kategoriden birinde özel mesajını oku"}</li>
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
              <p>{t.crownFortune?.disclaimer || "Bu uygulama eğlence amaçlıdır. Tarot kartları sembolik yorumlar içerir."}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  )
}

export default CrownFortunePage
