/**
 * MicrophoneTab — Shazam-benzeri canlı mikrofon kaydı + analiz.
 * Kullanım: AI Music Detection sayfasındaki 3. tab.
 */

import React from 'react'
import { Mic, StopCircle } from 'lucide-react'
import type { useMicrophoneAnalysis } from '@/hooks/useMicrophoneAnalysis'
import styles from '@/styles/pages/ai-detection.module.css'

type MicHook = ReturnType<typeof useMicrophoneAnalysis>

interface MicrophoneTabProps {
  mic: MicHook
  labels: {
    title: string
    hint: string
    start: string
    stop: string
    permissionDenied: string
    recording: string
  }
}

const formatTimer = (sec: number, max: number): string => {
  const mm = Math.floor(sec / 60).toString().padStart(2, '0')
  const ss = (sec % 60).toString().padStart(2, '0')
  const mmax = Math.floor(max / 60).toString().padStart(2, '0')
  const smax = (max % 60).toString().padStart(2, '0')
  return `${mm}:${ss} / ${mmax}:${smax}`
}

export const MicrophoneTab: React.FC<MicrophoneTabProps> = ({ mic, labels }) => {
  const isRecording = mic.micState === 'recording'
  const isRequesting = mic.micState === 'requesting'
  const isDenied = mic.micState === 'denied'

  const pulseScale = 1 + mic.amplitude * 0.6
  const ringScale = 1 + mic.amplitude * 0.22

  const onClick = () => {
    if (isRecording) {
      mic.stopRecording()
    } else {
      mic.startRecording()
    }
  }

  return (
    <div className={styles['mic-section']}>
      <h2>{labels.title}</h2>
      <p className={styles['mic-hint']}>{labels.hint}</p>

      <div className={styles['mic-visual']}>
        <div
          className={styles['mic-ring']}
          style={{
            transform: `scale(${ringScale})`,
            opacity: isRecording ? 1 : 0.4,
            borderColor: isRecording ? 'rgba(231, 107, 107, 0.45)' : 'rgba(201, 147, 71, 0.25)',
          }}
          aria-hidden="true"
        />
        <div
          className={styles['mic-ring-pulse']}
          style={{
            transform: `scale(${pulseScale})`,
            opacity: isRecording ? 0.8 : 0,
          }}
          aria-hidden="true"
        />

        <button
          type="button"
          className={`${styles['mic-button']} ${isRecording ? styles['mic-button-recording'] : ''}`}
          onClick={onClick}
          disabled={isRequesting}
          aria-label={isRecording ? labels.stop : labels.start}
        >
          {isRecording ? <StopCircle size={54} strokeWidth={1.5} /> : <Mic size={54} strokeWidth={1.8} />}
        </button>
      </div>

      {isRecording && (
        <div className={styles['mic-timer']} role="status" aria-live="polite">
          {formatTimer(mic.elapsedSeconds, mic.maxDurationSec)}
        </div>
      )}

      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
        {isRecording && labels.recording}
        {isRequesting && '…'}
      </div>

      {isDenied && (
        <div className={styles['mic-error']} role="alert">
          {labels.permissionDenied}
        </div>
      )}
    </div>
  )
}

export default MicrophoneTab
