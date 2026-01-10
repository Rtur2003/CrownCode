'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import styles from './BackgroundFloatingCards.module.css'

const BackgroundFloatingCards = () => {
  const [cards, setCards] = useState<number[]>([])

  useEffect(() => {
    // Generate fewer cards for performance, e.g., 6-8 cards
    setCards(Array.from({ length: 8 }, (_, i) => i))
  }, [])

  return (
    <div className={styles.container}>
      {cards.map((i) => (
        <FloatingCard key={i} index={i} />
      ))}
    </div>
  )
}

const FloatingCard = ({ index }: { index: number }) => {
  // Random start positions and animation variants
  const randomX = Math.random() * 100 // %
  const randomY = Math.random() * 100 // %
  const duration = 15 + Math.random() * 15 // 15-30s
  const delay = Math.random() * 5

  return (
    <motion.div
      className={styles.card}
      initial={{ 
        x: `${randomX}vw`, 
        y: `${randomY}vh`, 
        opacity: 0, 
        rotate: Math.random() * 360 
      }}
      animate={{
        y: [`${randomY}vh`, `${(randomY + 50) % 100}vh`, `${randomY}vh`],
        x: [`${randomX}vw`, `${(randomX + 20) % 100}vw`, `${randomX}vw`],
        rotate: [0, 180, 360],
        opacity: [0, 0.15, 0]
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: "linear"
      }}
    >
      <div className={styles.cardContent}>
        <Crown size={24} className={styles.icon} />
      </div>
    </motion.div>
  )
}

export default BackgroundFloatingCards
