'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Loader, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export interface LogEntry {
  id: string
  message: string
  status: 'success' | 'processing' | 'error'
  timestamp: Date
}

interface ProcessLogProps {
  logs: LogEntry[]
}

export const ProcessLog: React.FC<ProcessLogProps> = ({ logs }) => {
  const { t } = useLanguage()
  const getIcon = (status: LogEntry['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="log-icon success" size={20} />
      case 'processing':
        return <Loader className="log-icon processing animate-spin" size={20} />
      case 'error':
        return <AlertCircle className="log-icon error" size={20} />
    }
  }

  return (
    <div className="process-log">
      <h3 className="log-title">{t.mlToolkit.processLog.title}</h3>

      <div className="log-container">
        <AnimatePresence mode="popLayout">
          {logs.map((log, index) => (
            <motion.div
              key={log.id}
              className={`log-entry log-${log.status}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
            >
              {getIcon(log.status)}
              <span className="log-message">{log.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {logs.length === 0 && (
          <div className="log-empty">
            <p>{t.mlToolkit.processLog.notStarted}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProcessLog