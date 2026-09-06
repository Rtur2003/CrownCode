'use client'

// =========================================================================
// TILT CELL
// =========================================================================
// Wraps a bento cell with a subtle mouse-follow 3D tilt + glare — the
// "cards that feel alive" polish. Pure framer-motion springs on transform
// (GPU-composited), no layout thrash. Standalone so any grid can opt in or
// a future redesign can drop it without touching the cells it wraps.
// =========================================================================

import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, Variants } from 'motion/react'

interface TiltCellProps {
  className: string
  variants: Variants
  role: string
  children: React.ReactNode
}

const SPRING = { stiffness: 220, damping: 22, mass: 0.6 }
const MAX_TILT_DEG = 6

export const TiltCell: React.FC<TiltCellProps> = ({ className, variants, role, children }) => {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const springX = useSpring(mouseX, SPRING)
  const springY = useSpring(mouseY, SPRING)

  const rotateX = useTransform(springY, [0, 1], [MAX_TILT_DEG, -MAX_TILT_DEG])
  const rotateY = useTransform(springX, [0, 1], [-MAX_TILT_DEG, MAX_TILT_DEG])
  const glareX = useTransform(springX, [0, 1], ['0%', '100%'])
  const glareY = useTransform(springY, [0, 1], ['0%', '100%'])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) {return}
    const rect = el.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }

  const handleMouseLeave = () => {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      variants={variants}
      className={className}
      role={role}
      style={{ perspective: 900 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          height: '100%',
          width: '100%',
          position: 'relative',
        }}
      >
        {children}
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none',
            borderRadius: 'inherit',
            background: 'radial-gradient(circle at var(--gx) var(--gy), rgba(255,255,255,0.08), transparent 55%)',
            ['--gx' as string]: glareX,
            ['--gy' as string]: glareY,
          }}
        />
      </motion.div>
    </motion.div>
  )
}

export default TiltCell
