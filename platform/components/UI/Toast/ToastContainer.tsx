/**
 * Toast Container Component
 * Kullanım: Tüm toast notifications'ları render eder
 * Bağımlılıklar: Toast.tsx, ToastContext
 */

import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { useToast } from '@/context/ToastContext'
import { Toast } from './Toast'

export const ToastContainer: React.FC = () => {
  const { toasts, hideToast } = useToast()

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={hideToast} />
        ))}
      </AnimatePresence>
    </div>
  )
}
