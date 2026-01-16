'use client'

import React, { useState, useEffect, useCallback } from 'react'
import type { NextPage } from 'next'
import Image from 'next/image'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import {
  Crown,
  Sparkles,
  Heart,
  Briefcase,
  Coins,
  Activity,
  Clock,
  RotateCcw,
  Star,
  X,
  Maximize2,
  AlertTriangle,
  Skull
} from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import BackgroundFloatingCards from '@/components/CrownFortune/BackgroundFloatingCards'
import { useLanguage } from '@/context/LanguageContext'
import {
  FORTUNE_CATEGORIES,
  getDailyDestiny,
  getDestinyDetails,
  getTimeUntilMidnightGMT3,
  getTurkeyDate,
  getReverseMessage,
  type FortuneCategory,
  type DailyDestiny,
  type FortuneMessage
} from '@/data/destiny'
import styles from '@/styles/pages/crown-fortune.module.css'

// Kategori ikonları - Wheel için
const CATEGORY_ICONS: Record<FortuneCategory, React.ReactNode> = {
  love: <Heart size={24} />,
  career: <Briefcase size={24} />,
  money: <Coins size={24} />,
  health: <Activity size={24} />,
  spirit: <Sparkles size={24} />
}

// Kart içindeki küçük ikonlar
const CATEGORY_ICONS_SMALL: Record<FortuneCategory, React.ReactNode> = {
  love: <Heart size={12} />,
  career: <Briefcase size={12} />,
  money: <Coins size={12} />,
  health: <Activity size={12} />,
  spirit: <Sparkles size={12} />
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Reverse / Tempt Fate State
  const [isReversed, setIsReversed] = useState(false)
  const [reverseMessage, setReverseMessage] = useState<FortuneMessage | null>(null)
  const [isFlipping, setIsFlipping] = useState(false)

  // Spring animation for card flip
  const flipProgress = useMotionValue(0)
  const springFlip = useSpring(flipProgress, {
    stiffness: 260,
    damping: 20,
    mass: 1
  })

  // Transform for sheen effect during flip
  const sheenX = useTransform(springFlip, [0, 0.5, 1], ['-100%', '0%', '100%'])
  const sheenOpacity = useTransform(springFlip, [0, 0.3, 0.5, 0.7, 1], [0, 0.8, 1, 0.8, 0])

  // Client mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load destiny
  useEffect(() => {
    if (!mounted) return

    const loadDestiny = () => {
      const daily = getDailyDestiny()
      const today = getTurkeyDate()

      // Eski revealed flag'leri temizle
      const revealed = localStorage.getItem('crown_destiny_revealed')
      if (revealed && revealed !== today) {
        localStorage.removeItem('crown_destiny_revealed')
        localStorage.removeItem('crown_destiny_is_reversed')
        localStorage.removeItem('crown_destiny_reverse_msg')
      }

      setDestiny(daily)

      // Eğer bugün zaten bakıldıysa
      const currentRevealed = localStorage.getItem('crown_destiny_revealed')
      if (currentRevealed === daily.date && daily.date === today) {
        const catIndex = FORTUNE_CATEGORIES.findIndex(c => c.key === daily.category)
        setRotation(catIndex * 72 + 720 + 36)
        setShowCard(true)
        setIsCardFlipped(true)
        
        // Reverse durumunu kontrol et
        const reversed = localStorage.getItem('crown_destiny_is_reversed')
        if (reversed === 'true') {
          setIsReversed(true)
          const savedMsg = localStorage.getItem('crown_destiny_reverse_msg')
          if (savedMsg) {
            setReverseMessage(JSON.parse(savedMsg))
          }
        }
      } else {
        // Yeni gün, sıfırla
        setShowCard(false)
        setIsCardFlipped(false)
        setRotation(0)
        setIsReversed(false)
        setReverseMessage(null)
      }
    }

    loadDestiny()
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

  // Midnight reset check
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
        setIsReversed(false)
        setReverseMessage(null)
        
        localStorage.removeItem('crown_destiny_revealed')
        localStorage.removeItem('crown_destiny_is_reversed')
        localStorage.removeItem('crown_destiny_reverse_msg')
      }
    }

    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [mounted, destiny])

  const spinWheel = useCallback(() => {
    if (!destiny || isSpinning || showCard) return

    setIsSpinning(true)

    // Hedef kategori indeksi
    const catIndex = FORTUNE_CATEGORIES.findIndex(c => c.key === destiny.category)
    const target = (5 * 360) + (catIndex * 72) + 36

    setRotation(target)

    setTimeout(() => {
      setIsSpinning(false)
      setShowCard(true)

      setTimeout(() => {
        setIsCardFlipped(true)
        localStorage.setItem('crown_destiny_revealed', destiny.date)
      }, 500)
    }, 4000)
  }, [destiny, isSpinning, showCard])

  const handleReverseDestiny = useCallback(() => {
    if (!destiny) return
    
    // Zaten reverse ise işlem yapma
    if (isReversed) return

    const msg = getReverseMessage(destiny.category, destiny.messageIndex)
    setReverseMessage(msg)
    setIsReversed(true)
    
    localStorage.setItem('crown_destiny_is_reversed', 'true')
    localStorage.setItem('crown_destiny_reverse_msg', JSON.stringify(msg))
  }, [destiny, isReversed])

  if (!mounted || !destiny) {
    return (
      <MainLayout
        title={t.crownFortune.meta.title}
        description={t.crownFortune.meta.description}
        keywords={t.crownFortune.meta.keywords}
        noCache={true}
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
  
  // Mesaj: Reverse ise yeni mesajı, değilse orijinali göster
  const displayMessage = isReversed && reverseMessage 
    ? (language === 'tr' ? reverseMessage.text : reverseMessage.textEn)
    : (language === 'tr' ? details.message.text : details.message.textEn)

  return (
    <MainLayout
      title={t.crownFortune.meta.title}
      description={t.crownFortune.meta.description}
      keywords={t.crownFortune.meta.keywords}
      noCache={true}
    >
      <div className={styles['fortune-page']}>
        {/* Background Elements */}
        <div className={styles['fortune-background']}>
          <div className={styles['fortune-gradient']} />
          <div className={styles['fortune-pattern']} />
          {/* Floating Cards Animation - Web only check inside component or css */}
          <BackgroundFloatingCards />
        </div>

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
              <span>{t.crownFortune.header.badge}</span>
            </div>
            <h1 className={styles['fortune-title']}>{t.crownFortune.header.title}</h1>
            <p className={styles['fortune-subtitle']}>
              {t.crownFortune.header.subtitle}
            </p>
            <div className={styles['countdown']}>
              <Clock size={16} />
              <span>{t.crownFortune.countdown.label}</span>
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
                <div className={styles['wheel-icons']}>
                  {FORTUNE_CATEGORIES.map((cat) => (
                    <div key={cat.key} className={styles['wheel-icon']}>
                      {CATEGORY_ICONS[cat.key]}
                    </div>
                  ))}
                </div>
                <div className={styles['wheel-center']}>
                  <Crown size={32} />
                </div>
              </motion.div>

              <div className={styles['wheel-glow']} />
            </div>

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
                    <span>{t.crownFortune.buttons.spinning}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>{t.crownFortune.buttons.spin}</span>
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
                  <div
                    className={`${styles['card-flipper']} ${isCardFlipped ? styles['flipped'] : ''}`}
                    onClick={() => isCardFlipped && setIsModalOpen(true)}
                  >
                    {/* CARD BACK */}
                    <div className={`${styles['card-face']} ${styles['card-back']}`}>
                      <div className={styles['card-back-pattern']} />
                      <Crown className={styles['card-back-logo']} size={80} />
                      <span className={styles['card-back-text']}>Crown Destiny</span>
                    </div>

                    {/* CARD FRONT */}
                    <div className={`${styles['card-face']} ${styles['card-front']}`}>
                      <div className={styles['card-background']}>
                        <Image
                          src={details.card.image}
                          alt={cardName}
                          fill
                          className={styles['card-bg-image']}
                          sizes="(max-width: 768px) 100vw, 300px"
                          priority
                          style={{
                            transform: isReversed ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.6s ease'
                          }}
                        />
                      </div>

                      <div className={styles['card-overlay']} />
                      <div className={styles['card-sheen']} />

                      <div className={styles['card-content']}>
                        <div className={styles['card-header']}>
                          <span className={styles['card-symbol']}>{details.card.symbol}</span>
                          <h2 className={styles['card-name']}>
                            {cardName} {isReversed && (language === 'tr' ? '(Ters)' : '(Reversed)')}
                          </h2>
                        </div>

                        <div className={styles['card-meta']}>
                          <div
                            className={styles['card-category']}
                            style={{ 
                              backgroundColor: isReversed ? '#e74c3c' : CATEGORY_COLORS[destiny.category],
                              transition: 'background-color 0.3s ease'
                            }}
                          >
                            {CATEGORY_ICONS_SMALL[destiny.category]}
                            <span>{catLabel}</span>
                          </div>
                          <span className={styles['card-energy']}>{energyText}</span>
                        </div>

                        <div className={styles['card-message']}>
                          <p>{displayMessage}</p>
                        </div>

                        <div className={styles['card-footer']}>
                          <Star size={12} />
                          <span className={styles['card-date']}>
                            {new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                              day: 'numeric',
                              month: 'long'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {isCardFlipped && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexDirection: 'column', alignItems: 'center' }}>
                      <motion.div
                        className={styles['card-click-hint']}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                      >
                        <Maximize2 size={12} style={{ marginRight: 4, display: 'inline' }} />
                        {language === 'tr' ? 'Büyütmek için tıkla' : 'Click to enlarge'}
                      </motion.div>

                      {/* Tempt Fate Button */}
                      {!isReversed && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.5 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleReverseDestiny()
                          }}
                          className={styles['spin-button']} // Reusing spin button style for consistency
                          style={{ 
                            fontSize: '0.9rem', 
                            padding: '0.5rem 1rem',
                            background: 'rgba(0,0,0,0.6)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            marginTop: '0.5rem'
                          }}
                          whileHover={{ scale: 1.05, backgroundColor: 'rgba(200, 50, 50, 0.8)' }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <AlertTriangle size={16} />
                          <span style={{ marginLeft: '8px' }}>
                            {language === 'tr' ? 'Kötü Talihini Gör' : 'See Your Dark Fate'}
                          </span>
                        </motion.button>
                      )}
                    </div>
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* CARD MODAL */}
          <AnimatePresence>
            {isModalOpen && (
              <motion.div
                className={styles['card-modal-overlay']}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
              >
                <div
                  className={styles['card-modal']}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className={styles['card-modal-close']}
                    onClick={() => setIsModalOpen(false)}
                    aria-label={language === 'tr' ? 'Kapat' : 'Close'}
                  >
                    <X size={20} />
                  </button>

                  <motion.div
                    className={styles['card-modal-inner']}
                    initial={{ rotateX: 90, scale: 0.5, opacity: 0 }}
                    animate={{ rotateX: 0, scale: 1, opacity: 1 }}
                    exit={{ rotateX: -90, scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <div className={styles['card-modal-image-wrapper']}>
                      <Image
                        src={details.card.image}
                        alt={cardName}
                        fill
                        className={styles['card-modal-image']}
                        sizes="(max-width: 600px) 85vw, 500px"
                        priority
                        style={{
                            transform: isReversed ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.6s ease'
                        }}
                      />

                      <div className={styles['card-modal-info']}>
                        <div className={styles['card-modal-title']}>
                          <span className={styles['card-modal-symbol']}>{details.card.symbol}</span>
                          <h2 className={styles['card-modal-name']}>
                             {cardName} {isReversed && (language === 'tr' ? '(Ters)' : '(Reversed)')}
                          </h2>
                        </div>

                        <div className={styles['card-modal-meta']}>
                          <span
                            className={styles['card-modal-category']}
                            style={{ backgroundColor: isReversed ? '#e74c3c' : CATEGORY_COLORS[destiny.category] }}
                          >
                            {CATEGORY_ICONS_SMALL[destiny.category]}
                            {catLabel}
                          </span>
                          <span className={styles['card-modal-energy']}>{energyText}</span>
                        </div>

                        <p className={styles['card-modal-message']}>
                          {displayMessage}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
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
              <h3>{t.crownFortune.info.title}</h3>
              <ul>
                {t.crownFortune.info.steps.map((step: string, index: number) => (
                  <li key={index}>{step}</li>
                ))}
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
                  <span>{t.crownFortune.categories[cat.key as keyof typeof t.crownFortune.categories]}</span>
                </div>
              ))}
            </div>

            <div className={styles['disclaimer']}>
              <p>{t.crownFortune.disclaimer}</p>
            </div>
          </motion.section>

        </div>
      </div>
    </MainLayout>
  )
}

export default CrownFortunePage