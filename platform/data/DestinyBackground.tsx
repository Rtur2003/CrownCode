import React from 'react'
import styles from '@/styles/components/destiny-background.module.css'

/**
 * DestinyBackground Component
 * Web için arka planda süzülen kartlar animasyonu.
 * Performans için CSS animation kullanır.
 */
export const DestinyBackground = () => {
  // Rastgele pozisyonlarda kartlar oluştur
  const floatingCards = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 90}%`,
    top: `${Math.random() * 80}%`,
    animationDelay: `${Math.random() * 5}s`,
    duration: `${15 + Math.random() * 10}s`,
    scale: 0.5 + Math.random() * 0.5
  }))

  return (
    <div className={styles.backgroundContainer}>
      <div className={styles.overlay} />
      {floatingCards.map((card) => (
        <div
          key={card.id}
          className={styles.floatingCard}
          style={{
            left: card.left,
            top: card.top,
            animationDelay: card.animationDelay,
            animationDuration: card.duration,
            transform: `scale(${card.scale})`
          } as React.CSSProperties}
        >
          <div className={styles.cardInner} />
        </div>
      ))}
    </div>
  )
}