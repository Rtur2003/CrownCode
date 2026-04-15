'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import styles from './BackgroundFloatingCards.module.css'

// Tarot card images for floating background
const TAROT_IMAGES = [
  '/tarot/the-fool.png',
  '/tarot/the-magician.png',
  '/tarot/the-high-priestess.png',
  '/tarot/the-empress.png',
  '/tarot/the-emperor.png',
  '/tarot/the-hierophant.png',
  '/tarot/the-lovers.png',
  '/tarot/the-chariot.png',
  '/tarot/strength.png',
  '/tarot/the-hermit.png',
  '/tarot/wheel-of-fortune.png',
  '/tarot/justice.png',
  '/tarot/the-hanged-man.png',
  '/tarot/death.png',
  '/tarot/temperance.png',
  '/tarot/the-devil.png',
  '/tarot/the-tower.png',
  '/tarot/the-star.png',
  '/tarot/the-moon.png',
  '/tarot/the-sun.png',
  '/tarot/judgement.png',
  '/tarot/the-world.png',
]

// Depth layer configuration for parallax effect
interface LayerConfig {
  depth: number
  scale: number
  blur: number
  speedMultiplier: number
  opacity: number
  count: number
}

const LAYERS: LayerConfig[] = [
  { depth: 1, scale: 0.35, blur: 8, speedMultiplier: 0.4, opacity: 0.04, count: 3 },
  { depth: 2, scale: 0.45, blur: 5, speedMultiplier: 0.6, opacity: 0.06, count: 3 },
  { depth: 3, scale: 0.55, blur: 3, speedMultiplier: 0.8, opacity: 0.08, count: 2 },
  { depth: 4, scale: 0.65, blur: 1, speedMultiplier: 1.0, opacity: 0.10, count: 2 },
  { depth: 5, scale: 0.75, blur: 0, speedMultiplier: 1.2, opacity: 0.12, count: 2 },
]

interface FloatingCardData {
  id: number
  layer: LayerConfig
  image: string
  startX: number
  startY: number
  rotation: number
  duration: number
  delay: number
}

const BackgroundFloatingCards = () => {
  const [cards, setCards] = useState<FloatingCardData[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  // Generate card data on mount
  useEffect(() => {
    // Check for mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Generate cards for each layer
    const generatedCards: FloatingCardData[] = []
    let cardId = 0

    LAYERS.forEach((layer) => {
      // Reduce count on mobile
      const count = isMobile ? Math.max(1, Math.floor(layer.count / 2)) : layer.count

      for (let i = 0; i < count; i++) {
        generatedCards.push({
          id: cardId++,
          layer,
          image: TAROT_IMAGES[Math.floor(Math.random() * TAROT_IMAGES.length)],
          startX: Math.random() * 100,
          startY: Math.random() * 100,
          rotation: Math.random() * 30 - 15, // -15 to 15 degrees
          duration: (25 + Math.random() * 20) / layer.speedMultiplier, // 25-45s base, adjusted by speed
          delay: Math.random() * 10,
        })
      }
    })

    setCards(generatedCards)

    return () => window.removeEventListener('resize', checkMobile)
  }, [isMobile])

  if (prefersReducedMotion) {
    return null
  }

  return (
    <div className={styles.container}>
      {cards.map((card) => (
        <FloatingCard key={card.id} card={card} />
      ))}
    </div>
  )
}

interface FloatingCardProps {
  card: FloatingCardData
}

const FloatingCard = ({ card }: FloatingCardProps) => {
  const { layer, image, startX, startY, rotation, duration, delay } = card

  // Calculate animation path - smooth wave-like motion
  const pathVariance = 15 + (5 - layer.depth) * 5 // Closer cards move more

  // Memoize animation values for performance
  const animationConfig = useMemo(() => ({
    initial: {
      x: `${startX}vw`,
      y: `${startY}vh`,
      rotate: rotation,
      opacity: 0,
      scale: layer.scale,
    },
    animate: {
      x: [
        `${startX}vw`,
        `${(startX + pathVariance) % 100}vw`,
        `${(startX + pathVariance / 2) % 100}vw`,
        `${startX}vw`,
      ],
      y: [
        `${startY}vh`,
        `${(startY + pathVariance * 1.5) % 100}vh`,
        `${(startY + pathVariance * 0.5) % 100}vh`,
        `${startY}vh`,
      ],
      rotate: [rotation, rotation + 10, rotation - 5, rotation],
      opacity: [0, layer.opacity, layer.opacity, 0],
      scale: [layer.scale * 0.9, layer.scale, layer.scale * 1.05, layer.scale * 0.9],
    },
    transition: {
      duration: duration,
      repeat: Infinity,
      delay: delay,
      ease: 'easeInOut' as const,
      times: [0, 0.33, 0.66, 1],
    },
  }), [startX, startY, rotation, duration, delay, layer, pathVariance])

  return (
    <motion.div
      className={styles.card}
      initial={animationConfig.initial}
      animate={animationConfig.animate}
      transition={animationConfig.transition}
      style={{
        filter: layer.blur > 0 ? `blur(${layer.blur}px)` : 'none',
        zIndex: layer.depth,
        willChange: 'transform, opacity',
      }}
    >
      <div className={styles.cardInner}>
        <Image
          src={image}
          alt=""
          fill
          sizes="80px"
          className={styles.cardImage}
          priority={false}
          loading="lazy"
        />
        <div className={styles.cardOverlay} />
      </div>
    </motion.div>
  )
}

export default BackgroundFloatingCards
