/**
 * Toast Component
 * Kullanım: Tek bir toast notification gösterimi
 * Bağımlılıklar: styles/components/toast.css, framer-motion
 */

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { Toast as ToastType, ToastType as TType } from '@/context/ToastContext'

interface ToastProps {
  toast: ToastType
  onClose: (id: string) => void
}

const iconMap: Record<TType, React.ReactNode> = {
  success: <CheckCircle size={20} />,
  error: <AlertCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (toast.duration! / 50))
        return newProgress <= 0 ? 0 : newProgress
      })
    }, 50)

    return () => clearInterval(interval)
  }, [toast.duration])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`toast toast-${toast.type}`}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="toast-icon">
        {iconMap[toast.type]}
      </div>

      {/* Content */}
      <div className="toast-content">
        <h4 className="toast-title">{toast.title}</h4>
        {toast.message && <p className="toast-message">{toast.message}</p>}
      </div>

      {/* Close Button */}
      <button
        onClick={() => onClose(toast.id)}
        className="toast-close"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>

      {/* Progress Bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="toast-progress-bar">
          <motion.div
            className="toast-progress-fill"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.05, ease: 'linear' }}
          />
        </div>
      )}
    </motion.div>
  )
}
