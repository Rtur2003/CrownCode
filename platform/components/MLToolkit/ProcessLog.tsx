'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'
import styles from '@/styles/pages/data-manipulation.module.css'

export interface LogEntry {
  id: string
  message: string
  status: 'success' | 'processing' | 'error'
  timestamp: Date
}

interface ProcessLogProps {
  logs: LogEntry[]
}

/** What the tool has done so far, newest last. */
export const ProcessLog: React.FC<ProcessLogProps> = ({ logs }) => {
  const { t, language } = useLanguage()
  const time = new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'tr-TR', { timeStyle: 'medium' })

  return (
    <div className={styles.log} role="log" aria-label={t.mlToolkit.processLog.title}>
      {logs.length === 0 ? (
        <p>{t.mlToolkit.processLog.notStarted}</p>
      ) : (
        <ol>
          {logs.map(log => (
            <li key={log.id} data-status={log.status}>
              <time dateTime={log.timestamp.toISOString()}>{time.format(log.timestamp)}</time>
              <span>{log.message}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export default ProcessLog
