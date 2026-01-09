'use client'

import React, { useState, useCallback, useRef } from 'react'
import type { NextPage } from 'next'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Sparkles, RotateCcw, Star, Heart, Zap, Trophy, Gift, Sun, Moon } from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'
import styles from '@/styles/pages/crown-fortune.module.css'

interface WheelSegment {
  id: number
  icon: React.ReactNode
  color: string
  category: 'motivation' | 'luck' | 'wisdom' | 'energy' | 'love' | 'success' | 'gift' | 'cosmic'
}

const WHEEL_SEGMENTS: WheelSegment[] = [
  { id: 0, icon: <Star size={24} />, color: '#eac06f', category: 'motivation' },
  { id: 1, icon: <Heart size={24} />, color: '#c99347', category: 'love' },
  { id: 2, icon: <Zap size={24} />, color: '#8a5f2b', category: 'energy' },
  { id: 3, icon: <Trophy size={24} />, color: '#eac06f', category: 'success' },
  { id: 4, icon: <Sun size={24} />, color: '#c99347', category: 'luck' },
  { id: 5, icon: <Gift size={24} />, color: '#8a5f2b', category: 'gift' },
  { id: 6, icon: <Moon size={24} />, color: '#eac06f', category: 'cosmic' },
  { id: 7, icon: <Sparkles size={24} />, color: '#c99347', category: 'wisdom' },
]

const CrownFortunePage: NextPage = () => {
  const { t } = useLanguage()
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<{ category: string; message: string } | null>(null)
  const [spinCount, setSpinCount] = useState(0)
  const wheelRef = useRef<HTMLDivElement>(null)

  const fortuneMessages = t.crownFortune?.messages || {
    motivation: [
      "Bugün başarıya giden yolda büyük bir adım atacaksın!",
      "İçindeki güç seni zirveye taşıyacak.",
      "Her zorluk, seni daha güçlü yapan bir fırsattır."
    ],
    love: [
      "Sevgi dolu bir gün seni bekliyor.",
      "Kalbindeki ışık çevrene yayılacak.",
      "Bugün biriyle özel bir bağ kurabilirsin."
    ],
    energy: [
      "Enerjin bugün zirve yapacak!",
      "Yapamayacağın hiçbir şey yok.",
      "Dinamizmin herkesi etkileyecek."
    ],
    success: [
      "Başarı kapıda, sadece aç!",
      "Bugün hedeflerine bir adım daha yaklaşacaksın.",
      "Emeklerin meyvesini verecek."
    ],
    luck: [
      "Şans bugün yanında!",
      "Beklenmedik güzel sürprizler geliyor.",
      "Evren senin için çalışıyor."
    ],
    gift: [
      "Hayat sana güzel bir hediye hazırlıyor.",
      "Beklemediğin bir yerden güzel haberler gelecek.",
      "Bugün özel bir gün olacak."
    ],
    cosmic: [
      "Yıldızlar senin için parlıyor.",
      "Evrensel enerji seninle uyum içinde.",
      "Kozmik güçler seni destekliyor."
    ],
    wisdom: [
      "Bugün önemli bir farkındalık kazanacaksın.",
      "İç sesin sana doğru yolu gösterecek.",
      "Bilgelik seninle yürüyor."
    ]
  }

  const getRandomMessage = useCallback((category: string): string => {
    const messages = fortuneMessages[category as keyof typeof fortuneMessages] || fortuneMessages.motivation
    return messages[Math.floor(Math.random() * messages.length)]
  }, [fortuneMessages])

  const spinWheel = useCallback(() => {
    if (isSpinning) return

    setIsSpinning(true)
    setResult(null)

    const spins = 5 + Math.random() * 3
    const segmentAngle = 360 / WHEEL_SEGMENTS.length
    const randomSegment = Math.floor(Math.random() * WHEEL_SEGMENTS.length)
    const targetAngle = spins * 360 + randomSegment * segmentAngle + segmentAngle / 2

    setRotation(prev => prev + targetAngle)

    setTimeout(() => {
      const selectedSegment = WHEEL_SEGMENTS[randomSegment]
      const message = getRandomMessage(selectedSegment.category)

      setResult({
        category: selectedSegment.category,
        message
      })
      setIsSpinning(false)
      setSpinCount(prev => prev + 1)
    }, 4000)
  }, [isSpinning, getRandomMessage])

  const resetWheel = useCallback(() => {
    setResult(null)
    setRotation(0)
  }, [])

  const getCategoryLabel = (category: string): string => {
    const labels = t.crownFortune?.categories || {
      motivation: 'Motivasyon',
      love: 'Sevgi',
      energy: 'Enerji',
      success: 'Başarı',
      luck: 'Şans',
      gift: 'Hediye',
      cosmic: 'Kozmik',
      wisdom: 'Bilgelik'
    }
    return labels[category as keyof typeof labels] || category
  }

  const getCategoryIcon = (category: string): React.ReactNode => {
    const icons: Record<string, React.ReactNode> = {
      motivation: <Star size={28} />,
      love: <Heart size={28} />,
      energy: <Zap size={28} />,
      success: <Trophy size={28} />,
      luck: <Sun size={28} />,
      gift: <Gift size={28} />,
      cosmic: <Moon size={28} />,
      wisdom: <Sparkles size={28} />
    }
    return icons[category] || <Star size={28} />
  }

  return (
    <MainLayout
      title={t.crownFortune?.meta?.title || "Crown Fortune - Kraliyet Şansı"}
      description={t.crownFortune?.meta?.description || "CrownCode şans çarkı ile günlük motivasyon ve ilham kaynağınız."}
      keywords={t.crownFortune?.meta?.keywords || "şans çarkı, motivasyon, günlük şans, CrownCode, fortune wheel"}
    >
      <div className={styles['fortune-page']}>
        <div className={styles['fortune-container']}>
          <motion.div
            className={styles['fortune-header']}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles['header-badge']}>
              <Crown size={16} />
              <span>{t.crownFortune?.header?.badge || "Kraliyet Şansı"}</span>
            </div>
            <h1 className={styles['fortune-title']}>
              {t.crownFortune?.header?.title || "Şans Çarkını Çevir"}
            </h1>
            <p className={styles['fortune-subtitle']}>
              {t.crownFortune?.header?.subtitle || "Günlük motivasyon ve ilham kaynağın. Çarkı çevir, evrenin mesajını al."}
            </p>
          </motion.div>

          <div className={styles['wheel-section']}>
            <div className={styles['wheel-container']}>
              <div className={styles['wheel-pointer']}>
                <Crown size={32} />
              </div>

              <motion.div
                ref={wheelRef}
                className={styles['wheel']}
                animate={{ rotate: rotation }}
                transition={{
                  duration: 4,
                  ease: [0.2, 0.8, 0.2, 1]
                }}
              >
                {WHEEL_SEGMENTS.map((segment, index) => {
                  const angle = (360 / WHEEL_SEGMENTS.length) * index
                  return (
                    <div
                      key={segment.id}
                      className={styles['wheel-segment']}
                      style={{
                        transform: `rotate(${angle}deg)`,
                        backgroundColor: segment.color
                      }}
                    >
                      <div className={styles['segment-content']}>
                        {segment.icon}
                      </div>
                    </div>
                  )
                })}
                <div className={styles['wheel-center']}>
                  <Crown size={40} />
                </div>
              </motion.div>

              <div className={styles['wheel-glow']} />
            </div>

            <div className={styles['controls']}>
              <motion.button
                className={`${styles['spin-button']} ${isSpinning ? styles['spinning'] : ''}`}
                onClick={spinWheel}
                disabled={isSpinning}
                whileHover={{ scale: isSpinning ? 1 : 1.05 }}
                whileTap={{ scale: isSpinning ? 1 : 0.95 }}
              >
                {isSpinning ? (
                  <>
                    <Sparkles className={styles['spin-icon']} size={20} />
                    <span>{t.crownFortune?.buttons?.spinning || "Çevriliyor..."}</span>
                  </>
                ) : (
                  <>
                    <Crown size={20} />
                    <span>{t.crownFortune?.buttons?.spin || "Çarkı Çevir"}</span>
                  </>
                )}
              </motion.button>

              {spinCount > 0 && (
                <motion.button
                  className={styles['reset-button']}
                  onClick={resetWheel}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw size={18} />
                  <span>{t.crownFortune?.buttons?.reset || "Sıfırla"}</span>
                </motion.button>
              )}
            </div>

            {spinCount > 0 && (
              <motion.div
                className={styles['spin-counter']}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Sparkles size={14} />
                <span>
                  {t.crownFortune?.spinCount?.replace('{count}', spinCount.toString()) ||
                    `${spinCount} kez çevirdin`}
                </span>
              </motion.div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                className={styles['result-card']}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={styles['result-header']}>
                  <div className={styles['result-icon']}>
                    {getCategoryIcon(result.category)}
                  </div>
                  <div className={styles['result-category']}>
                    {getCategoryLabel(result.category)}
                  </div>
                </div>
                <div className={styles['result-message']}>
                  <p>{result.message}</p>
                </div>
                <div className={styles['result-footer']}>
                  <Sparkles size={14} />
                  <span>{t.crownFortune?.result?.footer || "Evren seninle konuştu"}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className={styles['info-section']}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className={styles['info-card']}>
              <h3>{t.crownFortune?.info?.title || "Nasıl Çalışır?"}</h3>
              <ul>
                <li>{t.crownFortune?.info?.steps?.[0] || "Çarkı çevir butonuna tıkla"}</li>
                <li>{t.crownFortune?.info?.steps?.[1] || "Çarkın durmasını bekle"}</li>
                <li>{t.crownFortune?.info?.steps?.[2] || "Günlük mesajını oku"}</li>
                <li>{t.crownFortune?.info?.steps?.[3] || "İlham al, motivasyonunu artır!"}</li>
              </ul>
            </div>
            <div className={styles['disclaimer']}>
              <p>{t.crownFortune?.disclaimer || "Bu uygulama tamamen eğlence amaçlıdır. Kumar içermez."}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  )
}

export default CrownFortunePage
