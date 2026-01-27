'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { NextPage } from 'next'
import Image from 'next/image'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import confetti from 'canvas-confetti'
import useSound from 'use-sound'
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
  Skull,
  Users,
  Volume2,
  VolumeX,
  Download,
  Share2,
  Flame,
  TrendingUp,
  BookOpen,
  Clover,
  Quote,
  Lock
} from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import BackgroundFloatingCards from '@/components/CrownFortune/BackgroundFloatingCards'
import { useLanguage } from '@/context/LanguageContext'
import {
  FORTUNE_CATEGORIES,
  STORAGE_KEYS,
  DESTINY_CARDS,
  getDailyDestiny,
  getDestinyDetails,
  getTimeUntilMidnightGMT3,
  getTurkeyDate,
  getReverseMessage,
  getStreakData,
  updateStreak,
  getMoonPhase,
  getLuckyElements,
  getDailyQuote,
  getCardCollection,
  addCardToCollection,
  type FortuneCategory,
  type DailyDestiny,
  type FortuneMessage,
  type StreakData,
  type MoonPhase,
  type LuckyElements,
  type CardCollection,
  type MotivationQuote
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

// Animation timing constants (ms)
const ANIMATION = {
  WHEEL_SPIN_DURATION: 4000,
  CARD_FLIP_DELAY: 500,
  REVERSE_ANIMATION_PEAK: 400,
  COUNTER_REFRESH_INTERVAL: 30000,
  MIDNIGHT_CHECK_INTERVAL: 30000,
  COUNTDOWN_INTERVAL: 1000,
} as const

// Haptic feedback patterns (ms)
const HAPTIC = {
  LIGHT: 50,
  MEDIUM: 100,
  SUCCESS: [100, 50, 100] as const,
  WHEEL_SPIN: [50, 30, 50, 30, 50] as const,
} as const

// Trigger haptic feedback if supported
const triggerHaptic = (pattern: number | readonly number[]) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern as number | number[])
  }
}

// Celebration confetti effect
const celebrateConfetti = (isReversed = false) => {
  const duration = 3000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

  // Color scheme based on fortune type
  const colors = isReversed
    ? ['#8b0000', '#4a0000', '#2d0000', '#dc143c'] // Dark reds for reversed
    : ['#FFD700', '#9b59b6', '#3498db', '#e74c3c', '#27ae60'] // Golden + category colors

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      clearInterval(interval)
      return
    }

    const particleCount = 50 * (timeLeft / duration)

    // Burst from both sides
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors,
    })
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors,
    })
  }, 250)
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

  // Daily counter state
  const [dailyCount, setDailyCount] = useState<number>(0)
  const [counterAvailable, setCounterAvailable] = useState<boolean>(true)

  // Sound settings state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)

  // Sound effects (files should be in /public/sounds/)
  const [playWhoosh] = useSound('/sounds/whoosh.mp3', { volume: 0.5, soundEnabled })
  const [playReveal] = useSound('/sounds/reveal.mp3', { volume: 0.6, soundEnabled })
  const [playSuccess] = useSound('/sounds/success.mp3', { volume: 0.5, soundEnabled })
  const [playDark] = useSound('/sounds/dark.mp3', { volume: 0.4, soundEnabled })

  // Card ref for download feature
  const cardRef = useRef<HTMLDivElement>(null)

  // Streak state
  const [streak, setStreak] = useState<StreakData>({
    count: 0,
    lastDate: '',
    currentMilestone: null,
    nextMilestone: null,
    daysToNext: 0
  })

  // Moon phase state
  const [moonPhase, setMoonPhase] = useState<MoonPhase | null>(null)

  // Lucky elements state
  const [luckyElements, setLuckyElements] = useState<LuckyElements | null>(null)

  // Daily quote state
  const [dailyQuote, setDailyQuote] = useState<MotivationQuote | null>(null)

  // Card collection state
  const [collection, setCollection] = useState<CardCollection>({
    seenCardIds: [],
    firstSeenDates: {},
    totalCards: 22,
    collectionProgress: 0
  })
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false)

  // Modal ESC key handler + body scroll lock
  useEffect(() => {
    if (!isModalOpen) {
      return
    }

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false)
      }
    }

    // Lock body scroll
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEsc)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEsc)
    }
  }, [isModalOpen])

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

  // Load streak data on mount
  useEffect(() => {
    if (!mounted) {
      return
    }
    const streakData = getStreakData()
    setStreak(streakData)
  }, [mounted])

  // Load moon phase on mount
  useEffect(() => {
    if (!mounted) {
      return
    }
    const phase = getMoonPhase()
    setMoonPhase(phase)
  }, [mounted])

  // Load card collection on mount
  useEffect(() => {
    if (!mounted) {
      return
    }
    const col = getCardCollection()
    setCollection(col)
  }, [mounted])

  // Load lucky elements and daily quote when destiny is ready
  useEffect(() => {
    if (!mounted || !destiny) {
      return
    }
    const lucky = getLuckyElements(destiny.cardId, destiny.date)
    setLuckyElements(lucky)

    const quote = getDailyQuote(destiny.cardId, destiny.date)
    setDailyQuote(quote)
  }, [mounted, destiny])

  // Fetch daily counter
  useEffect(() => {
    if (!mounted) {
      return
    }

    let isMounted = true

    const fetchCounter = async () => {
      try {
        const res = await fetch('/api/fortune-counter')
        if (!res.ok) {
          // API not available (404, 500, etc.)
          if (isMounted) {
            setCounterAvailable(false)
          }
          return
        }
        const data = await res.json()
        if (isMounted && data.success) {
          setDailyCount(data.count)
          setCounterAvailable(true)
        }
      } catch {
        // Network error or API unavailable
        if (isMounted) {
          setCounterAvailable(false)
        }
      }
    }

    fetchCounter()

    // Refresh counter every 30 seconds (only if available)
    const interval = setInterval(fetchCounter, ANIMATION.COUNTER_REFRESH_INTERVAL)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [mounted])

  // Load destiny
  useEffect(() => {
    if (!mounted) {
      return
    }

    const loadDestiny = () => {
      const daily = getDailyDestiny()
      const today = getTurkeyDate()

      // Eski revealed flag'leri temizle
      const revealed = localStorage.getItem(STORAGE_KEYS.REVEALED)
      if (revealed && revealed !== today) {
        localStorage.removeItem(STORAGE_KEYS.REVEALED)
        localStorage.removeItem(STORAGE_KEYS.IS_REVERSED)
        localStorage.removeItem(STORAGE_KEYS.REVERSE_MESSAGE)
      }

      setDestiny(daily)

      // Eğer bugün zaten bakıldıysa
      const currentRevealed = localStorage.getItem(STORAGE_KEYS.REVEALED)
      if (currentRevealed === daily.date && daily.date === today) {
        const catIndex = FORTUNE_CATEGORIES.findIndex(c => c.key === daily.category)
        setRotation(catIndex * 72 + 720 + 36)
        setShowCard(true)
        setIsCardFlipped(true)

        // Reverse durumunu kontrol et
        const reversed = localStorage.getItem(STORAGE_KEYS.IS_REVERSED)
        if (reversed === 'true') {
          setIsReversed(true)
          const savedMsg = localStorage.getItem(STORAGE_KEYS.REVERSE_MESSAGE)
          if (savedMsg) {
            try {
              setReverseMessage(JSON.parse(savedMsg))
            } catch {
              // Invalid JSON, clear corrupted data
              localStorage.removeItem(STORAGE_KEYS.REVERSE_MESSAGE)
              localStorage.removeItem(STORAGE_KEYS.IS_REVERSED)
              setIsReversed(false)
            }
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
    if (!mounted) {
      return
    }

    const update = () => {
      const ms = getTimeUntilMidnightGMT3()
      const h = Math.floor(ms / 3600000)
      const m = Math.floor((ms % 3600000) / 60000)
      const s = Math.floor((ms % 60000) / 1000)
      setCountdown(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
    }

    update()
    const interval = setInterval(update, ANIMATION.COUNTDOWN_INTERVAL)
    return () => clearInterval(interval)
  }, [mounted])

  // Midnight reset check - destiny'yi ref ile takip et, infinite loop önle
  const destinyDateRef = React.useRef<string | null>(null)

  useEffect(() => {
    if (destiny) {
      destinyDateRef.current = destiny.date
    }
  }, [destiny])

  useEffect(() => {
    if (!mounted) {
      return
    }

    const check = () => {
      const today = getTurkeyDate()

      if (destinyDateRef.current && destinyDateRef.current !== today) {
        const newDestiny = getDailyDestiny()
        setDestiny(newDestiny)
        setShowCard(false)
        setIsCardFlipped(false)
        setRotation(0)
        setIsReversed(false)
        setReverseMessage(null)

        localStorage.removeItem(STORAGE_KEYS.REVEALED)
        localStorage.removeItem(STORAGE_KEYS.IS_REVERSED)
        localStorage.removeItem(STORAGE_KEYS.REVERSE_MESSAGE)
      }
    }

    check()
    const interval = setInterval(check, ANIMATION.MIDNIGHT_CHECK_INTERVAL)
    return () => clearInterval(interval)
  }, [mounted])

  const spinWheel = useCallback(async () => {
    if (!destiny || isSpinning || showCard) {
      return
    }

    // Haptic feedback on spin start
    triggerHaptic(HAPTIC.WHEEL_SPIN)
    playWhoosh()

    setIsSpinning(true)

    // Increment daily counter (non-blocking, won't stop spin if fails)
    if (counterAvailable) {
      try {
        const res = await fetch('/api/fortune-counter', { method: 'POST' })
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setDailyCount(data.count)
          }
        }
      } catch {
        // Silently fail - counter is not critical for spin functionality
      }
    }

    // Hedef kategori indeksi
    const catIndex = FORTUNE_CATEGORIES.findIndex(c => c.key === destiny.category)
    const target = (5 * 360) + (catIndex * 72) + 36

    setRotation(target)

    setTimeout(() => {
      setIsSpinning(false)
      setShowCard(true)
      playReveal()

      setTimeout(() => {
        setIsCardFlipped(true)
        localStorage.setItem(STORAGE_KEYS.REVEALED, destiny.date)

        // Update streak
        const newStreak = updateStreak()
        setStreak(newStreak)

        // Add card to collection
        const newCollection = addCardToCollection(destiny.cardId)
        setCollection(newCollection)

        // Celebration effects
        triggerHaptic(HAPTIC.SUCCESS)
        playSuccess()
        celebrateConfetti(false)
      }, ANIMATION.CARD_FLIP_DELAY)
    }, ANIMATION.WHEEL_SPIN_DURATION)
  }, [destiny, isSpinning, showCard, counterAvailable, playWhoosh, playReveal, playSuccess])

  const handleReverseDestiny = useCallback(() => {
    if (!destiny) {
      return
    }

    // Zaten reverse ise veya flip devam ediyorsa işlem yapma
    if (isReversed || isFlipping) {
      return
    }

    // Haptic feedback on dark fate reveal
    triggerHaptic(HAPTIC.MEDIUM)
    playDark()

    // Start flip animation
    setIsFlipping(true)
    flipProgress.set(0)

    // Animate to 1 (full flip)
    const animateFlip = () => {
      flipProgress.set(1)
    }

    // Start animation after a tiny delay for state to settle
    requestAnimationFrame(animateFlip)

    // Get reverse message and update state after animation peak
    setTimeout(() => {
      const msg = getReverseMessage(destiny.category, destiny.messageIndex)
      setReverseMessage(msg)
      setIsReversed(true)
      setIsFlipping(false)

      // Dark celebration effects
      triggerHaptic(HAPTIC.SUCCESS)
      celebrateConfetti(true)

      localStorage.setItem(STORAGE_KEYS.IS_REVERSED, 'true')
      localStorage.setItem(STORAGE_KEYS.REVERSE_MESSAGE, JSON.stringify(msg))
    }, ANIMATION.REVERSE_ANIMATION_PEAK)
  }, [destiny, isReversed, isFlipping, flipProgress, playDark])

  // Memoized card details - MUST be before any conditional returns (React hooks rule)
  const { details, cardName, catLabel, energyText, displayMessage } = useMemo(() => {
    if (!destiny) {
      return {
        details: null,
        cardName: '',
        catLabel: '',
        energyText: '',
        displayMessage: ''
      }
    }

    const cardDetails = getDestinyDetails(destiny)
    if (!cardDetails.card) {
      return {
        details: null,
        cardName: '',
        catLabel: '',
        energyText: '',
        displayMessage: ''
      }
    }
    const name = language === 'tr' ? cardDetails.card.nameTr : cardDetails.card.name
    const category = t.crownFortune.categories[destiny.category as keyof typeof t.crownFortune.categories]
    const energy = t.crownFortune.energy[cardDetails.card.energy as keyof typeof t.crownFortune.energy]

    // Mesaj: Reverse ise yeni mesajı, değilse orijinali göster
    const message = isReversed && reverseMessage
      ? (language === 'tr' ? reverseMessage.text : reverseMessage.textEn)
      : (language === 'tr' ? cardDetails.message.text : cardDetails.message.textEn)

    return {
      details: cardDetails,
      cardName: name,
      catLabel: category,
      energyText: energy,
      displayMessage: message
    }
  }, [destiny, language, t, isReversed, reverseMessage])

  // Share fortune to social media
  const handleShare = useCallback(async (platform: 'twitter' | 'whatsapp' | 'facebook' | 'native') => {
    if (!destiny || !details) {
      return
    }

    const shareText = language === 'tr'
      ? `🔮 Bugünkü kaderim: ${cardName}${isReversed ? ' (Ters)' : ''} - ${catLabel}\n\n"${displayMessage}"\n\n#CrownDestiny #Tarot`
      : `🔮 My destiny today: ${cardName}${isReversed ? ' (Reversed)' : ''} - ${catLabel}\n\n"${displayMessage}"\n\n#CrownDestiny #Tarot`

    const shareUrl = 'https://hasanarthuraltuntas.xyz/crown-fortune'

    triggerHaptic(HAPTIC.LIGHT)

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: t.crownFortune.share.title,
          text: shareText,
          url: shareUrl,
        })
      } catch {
        // User cancelled or error
      }
      return
    }

    const urls: Record<string, string> = {
      twitter: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
    }

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'noopener,noreferrer,width=600,height=400')
    }
  }, [destiny, details, cardName, catLabel, displayMessage, isReversed, language, t.crownFortune.share.title])

  // Download card as PNG
  const handleDownload = useCallback(async () => {
    if (!cardRef.current || !details) {
      return
    }

    triggerHaptic(HAPTIC.MEDIUM)

    try {
      // Dynamic import for code splitting
      const { toPng } = await import('html-to-image')

      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#1a1a2e',
      })

      const link = document.createElement('a')
      link.download = `crown-destiny-${destiny?.date || 'card'}.png`
      link.href = dataUrl
      link.click()

      triggerHaptic(HAPTIC.SUCCESS)
    } catch {
      // Error generating image
      console.error('Failed to generate card image')
    }
  }, [details, destiny])

  // Loading state - after all hooks
  if (!mounted || !destiny || !details) {
    return (
      <MainLayout
        title={t.crownFortune.meta.title}
        description={t.crownFortune.meta.description}
        keywords={t.crownFortune.meta.keywords}
        url="https://hasanarthuraltuntas.xyz/crown-fortune"
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
            <div className={styles['header-stats']}>
              <div className={styles['countdown']}>
                <Clock size={16} />
                <span>{t.crownFortune.countdown.label}</span>
                <span className={styles['countdown-time']}>{countdown}</span>
              </div>
              {counterAvailable && (
                <div className={styles['daily-counter']}>
                  <Users size={16} />
                  <span>{t.crownFortune.counter?.label || 'Today:'}</span>
                  <motion.span
                    className={styles['counter-value']}
                    key={dailyCount}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {dailyCount.toLocaleString()}
                  </motion.span>
                  <span className={styles['counter-suffix']}>{t.crownFortune.counter?.suffix || 'fortunes'}</span>
                </div>
              )}
              {streak.count > 0 && (
                <motion.div
                  className={styles['streak-counter']}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  title={streak.nextMilestone
                    ? `${streak.daysToNext} ${t.crownFortune.streak.daysTo} ${streak.nextMilestone.badge}`
                    : ''
                  }
                >
                  <Flame size={16} className={styles['streak-icon']} />
                  <span className={styles['streak-value']}>{streak.count}</span>
                  {streak.currentMilestone && (
                    <span className={styles['streak-badge']}>{streak.currentMilestone.badge}</span>
                  )}
                  {streak.nextMilestone && (
                    <div className={styles['streak-progress']}>
                      <TrendingUp size={12} />
                      <span>{streak.daysToNext}</span>
                    </div>
                  )}
                </motion.div>
              )}
              {moonPhase && (
                <div
                  className={styles['moon-phase']}
                  title={`${language === 'tr' ? moonPhase.name : moonPhase.nameEn} - ${language === 'tr' ? moonPhase.energy : moonPhase.energyEn} ${t.crownFortune.moonPhase.energySuffix}`}
                >
                  <span className={styles['moon-emoji']}>{moonPhase.emoji}</span>
                  <span className={styles['moon-name']}>
                    {language === 'tr' ? moonPhase.name : moonPhase.nameEn}
                  </span>
                </div>
              )}
              <button
                type="button"
                className={styles['collection-badge']}
                onClick={() => setIsCollectionModalOpen(true)}
                title={t.crownFortune.collection.title}
              >
                <BookOpen size={16} />
                <span>{collection.seenCardIds.length}/22</span>
              </button>
              <button
                type="button"
                className={styles['sound-toggle']}
                onClick={() => setSoundEnabled(!soundEnabled)}
                aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
              >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
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
                aria-label={isSpinning ? t.crownFortune.buttons.spinning : t.crownFortune.buttons.spin}
                aria-busy={isSpinning}
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
                <div className={styles['card-container']} ref={cardRef}>
                  <motion.div
                    className={`${styles['card-flipper']} ${isCardFlipped ? styles['flipped'] : ''} ${isReversed ? styles['reversed'] : ''}`}
                    onClick={() => isCardFlipped && !isFlipping && setIsModalOpen(true)}
                    animate={{
                      rotateY: isCardFlipped ? 180 : 0
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 20,
                      mass: 1
                    }}
                    style={{
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    {/* CARD BACK - Initial Crown Destiny */}
                    <div className={`${styles['card-face']} ${styles['card-back']}`}>
                      <div className={styles['card-back-pattern']} />
                      <Crown className={styles['card-back-logo']} size={80} />
                      <span className={styles['card-back-text']}>Crown Destiny</span>
                    </div>

                    {/* CARD FRONT - Tarot Image (tek kart, ters/düz durumuna göre içerik değişir) */}
                    <div className={`${styles['card-face']} ${styles['card-front']} ${isReversed ? styles['card-front-reversed'] : ''}`}>
                      <div className={styles['card-background']}>
                        <Image
                          src={details?.card?.image || '/tarot/the-fool.png'}
                          alt={cardName}
                          fill
                          className={styles['card-bg-image']}
                          sizes="(max-width: 768px) 100vw, 300px"
                          priority
                        />
                      </div>

                      <div className={isReversed ? styles['card-overlay-dark'] : styles['card-overlay']} />

                      {/* Animated Sheen Effect */}
                      <motion.div
                        className={styles['card-sheen-animated']}
                        style={{
                          x: sheenX,
                          opacity: sheenOpacity
                        }}
                      />

                      <div className={styles['card-content']}>
                        <div className={styles['card-header']}>
                          <span className={styles['card-symbol']}>{details?.card?.symbol || '✨'}</span>
                          <h2 className={styles['card-name']}>
                            {cardName} {isReversed && t.crownFortune.card.reversed}
                          </h2>
                        </div>

                        <div className={styles['card-meta']}>
                          <div
                            className={styles['card-category']}
                            style={{ backgroundColor: isReversed ? '#8b0000' : CATEGORY_COLORS[destiny.category] }}
                          >
                            {isReversed ? <Skull size={12} /> : CATEGORY_ICONS_SMALL[destiny.category]}
                            <span>{isReversed ? t.crownFortune.card.darkFate : catLabel}</span>
                          </div>
                          <span className={styles['card-energy']}>{energyText}</span>
                        </div>

                        <div className={isReversed ? styles['card-message-dark'] : styles['card-message']}>
                          <p>{displayMessage}</p>
                        </div>

                        <div className={styles['card-footer']}>
                          {isReversed ? <AlertTriangle size={12} color="#e74c3c" /> : <Star size={12} />}
                          <span className={isReversed ? styles['card-date-dark'] : styles['card-date']}>
                            {isReversed
                              ? t.crownFortune.card.beWarned
                              : new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                                  day: 'numeric',
                                  month: 'long'
                                })
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {isCardFlipped && (
                    <div className={styles['card-actions']}>
                      <motion.div
                        className={styles['card-click-hint']}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                      >
                        <Maximize2 size={12} />
                        <span>{t.crownFortune.card.clickToEnlarge}</span>
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
                          disabled={isFlipping}
                          className={styles['tempt-fate-button']}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.div
                            className={styles['tempt-fate-glow']}
                            animate={{
                              opacity: [0.3, 0.7, 0.3],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                          />
                          <Skull size={18} />
                          <span>{t.crownFortune.card.revealDarkFate}</span>
                        </motion.button>
                      )}

                      {/* Reversed indicator */}
                      {isReversed && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={styles['reversed-indicator']}
                        >
                          <Skull size={14} />
                          <span>{t.crownFortune.card.darkFateRevealed}</span>
                        </motion.div>
                      )}

                      {/* Share & Download Actions */}
                      <motion.div
                        className={styles['share-actions']}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2 }}
                      >
                        <button
                          type="button"
                          className={styles['action-button']}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleShare('native')
                          }}
                          aria-label={t.crownFortune.share.button}
                        >
                          <Share2 size={16} />
                          <span>{t.crownFortune.share.button}</span>
                        </button>
                        <button
                          type="button"
                          className={styles['action-button']}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownload()
                          }}
                          aria-label={t.crownFortune.share.download}
                        >
                          <Download size={16} />
                          <span>{t.crownFortune.share.download}</span>
                        </button>
                      </motion.div>

                      {/* Lucky Elements */}
                      {luckyElements && (
                        <motion.div
                          className={styles['lucky-elements']}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 2.5 }}
                        >
                          <div className={styles['lucky-numbers']}>
                            <Clover size={14} />
                            <span>{t.crownFortune.lucky.numbers}</span>
                            <strong>{luckyElements?.numbers?.join(', ') || '7, 14, 21'}</strong>
                          </div>
                          <div className={styles['lucky-color']}>
                            <span
                              className={styles['color-dot']}
                              style={{ backgroundColor: luckyElements?.color?.hex || '#FFD700' }}
                            />
                            <span>{language === 'tr' ? luckyElements?.color?.name : luckyElements?.color?.nameEn}</span>
                          </div>
                          <div className={styles['lucky-direction']}>
                            <span>{luckyElements?.direction?.symbol || '→'}</span>
                            <span>{language === 'tr' ? luckyElements?.direction?.name : luckyElements?.direction?.nameEn}</span>
                          </div>
                        </motion.div>
                      )}

                      {/* Daily Quote */}
                      {dailyQuote && (
                        <motion.div
                          className={styles['daily-quote']}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 3 }}
                        >
                          <Quote size={14} className={styles['quote-icon']} />
                          <blockquote>
                            <p>{language === 'tr' ? dailyQuote?.tr : dailyQuote?.en}</p>
                            <cite>— {dailyQuote?.author || 'Unknown'}</cite>
                          </blockquote>
                        </motion.div>
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
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-card-title"
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
                    type="button"
                    className={styles['card-modal-close']}
                    onClick={() => setIsModalOpen(false)}
                    aria-label={t.crownFortune.modal.close}
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
                        src={details?.card?.image || '/tarot/the-fool.png'}
                        alt={cardName}
                        fill
                        className={`${styles['card-modal-image']} ${isReversed ? styles['card-modal-image-reversed'] : ''}`}
                        sizes="(max-width: 600px) 85vw, 500px"
                        priority
                      />

                      <div className={styles['card-modal-info']}>
                        <div className={styles['card-modal-title']}>
                          <span className={styles['card-modal-symbol']}>{details?.card?.symbol || '✨'}</span>
                          <h2 className={styles['card-modal-name']}>
                             {cardName} {isReversed && t.crownFortune.card.reversed}
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

          {/* COLLECTION MODAL */}
          <AnimatePresence>
            {isCollectionModalOpen && (
              <motion.div
                className={styles['collection-modal-overlay']}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCollectionModalOpen(false)}
              >
                <motion.div
                  className={styles['collection-modal']}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={styles['collection-header']}>
                    <h2>
                      <BookOpen size={20} />
                      {t.crownFortune.collection.title}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsCollectionModalOpen(false)}
                      className={styles['collection-close']}
                      aria-label={t.crownFortune.collection.close}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className={styles['collection-progress']}>
                    <div className={styles['progress-bar']}>
                      <div
                        className={styles['progress-fill']}
                        style={{ width: `${collection.collectionProgress}%` }}
                      />
                    </div>
                    <span>{collection.seenCardIds.length} / 22 ({collection.collectionProgress}%)</span>
                  </div>

                  <div className={styles['collection-grid']}>
                    {Array.isArray(DESTINY_CARDS) && DESTINY_CARDS.map((card, index) => {
                      if (!card || typeof card !== 'object') {
                        return null
                      }
                      const cardId = typeof card.id === 'number' ? card.id : index
                      const isSeen = collection.seenCardIds.includes(cardId)
                      const seenDate = collection.firstSeenDates[cardId] || ''
                      const cardSymbol = card.symbol || '?'
                      const cardName = language === 'tr' ? (card.nameTr || card.name || '?') : (card.name || '?')
                      return (
                        <div
                          key={cardId}
                          className={`${styles['collection-card']} ${isSeen ? styles['seen'] : styles['locked']}`}
                          title={isSeen
                            ? `${cardName} - ${seenDate}`
                            : t.crownFortune.collection.notSeen
                          }
                        >
                          {isSeen ? (
                            <>
                              <span className={styles['card-symbol']}>{cardSymbol}</span>
                              <span className={styles['card-name-small']}>{cardName}</span>
                            </>
                          ) : (
                            <Lock size={20} className={styles['lock-icon']} />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {collection.collectionProgress === 100 && (
                    <div className={styles['collection-complete']}>
                      <Crown size={24} />
                      <span>{t.crownFortune.collection.complete}</span>
                    </div>
                  )}
                </motion.div>
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