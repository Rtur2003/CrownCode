/**
 * Comment Editor Component
 * Read-only generated comment with copy and post functionality
 * Note: Editing disabled to maintain AI-generated content integrity
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Copy, Check, Sparkles, RefreshCw, Send, AlertCircle } from 'lucide-react'
import styles from './CommentEditor.module.css'

interface CommentEditorTexts {
  aiGenerated: string
  withTranscript: string
  copy: string
  copied: string
  regenerate: string
  post: string
  posting: string
  alreadyPosted: string
  processingTimeTemplate: string
  disclaimer: string
  alreadyPostedNote: string
}

interface CommentEditorProps {
  comment: string
  onRegenerate: () => void
  onPost: () => void
  isPosting: boolean
  isAlreadyPosted: boolean
  hasTranscript: boolean
  processingTime: number | null
  texts: CommentEditorTexts
}

export const CommentEditor: React.FC<CommentEditorProps> = ({
  comment,
  onRegenerate,
  onPost,
  isPosting,
  isAlreadyPosted,
  hasTranscript,
  processingTime,
  texts
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(comment)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const processingTimeText =
    processingTime !== null
      ? texts.processingTimeTemplate.replace('{{seconds}}', String(processingTime))
      : null

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Sparkles size={16} className={styles.sparkle} />
          <span>{texts.aiGenerated}</span>
          {hasTranscript && (
            <span className={styles.transcriptBadge}>
              {texts.withTranscript}
            </span>
          )}
        </div>
        {processingTimeText && (
          <span className={styles.processingTime}>
            {processingTimeText}
          </span>
        )}
      </div>

      {/* Comment Text (Read-only) */}
      <div className={styles.commentWrapper}>
        <div className={styles.commentText}>
          {comment}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <div className={styles.actionsLeft}>
          <button
            className={styles.actionButton}
            onClick={handleCopy}
            title={texts.copy}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className={styles.copied}
                >
                  <Check size={16} />
                  {texts.copied}
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy size={16} />
                  {texts.copy}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            className={styles.actionButton}
            onClick={onRegenerate}
            title={texts.regenerate}
            disabled={isAlreadyPosted}
          >
            <RefreshCw size={16} />
            {texts.regenerate}
          </button>
        </div>

        <motion.button
          className={`${styles.postButton} ${isAlreadyPosted ? styles.postButtonDisabled : ''}`}
          onClick={onPost}
          disabled={isPosting || isAlreadyPosted}
          whileHover={!isAlreadyPosted ? { scale: 1.02 } : {}}
          whileTap={!isAlreadyPosted ? { scale: 0.98 } : {}}
        >
          {isPosting ? (
            <>
              <RefreshCw size={18} className={styles.spinning} />
              {texts.posting}
            </>
          ) : isAlreadyPosted ? (
            <>
              <Check size={18} />
              {texts.alreadyPosted}
            </>
          ) : (
            <>
              <Send size={18} />
              {texts.post}
            </>
          )}
        </motion.button>
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <AlertCircle size={14} />
        <span>{isAlreadyPosted ? texts.alreadyPostedNote : texts.disclaimer}</span>
      </div>
    </motion.div>
  )
}
