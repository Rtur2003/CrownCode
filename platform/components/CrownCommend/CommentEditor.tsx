/**
 * The draft: editable text, what it was based on, and what can be done with it.
 * Copying and opening the video are always there; posting only in a build that enables it.
 */

import React from 'react'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { fill } from '@/components/Auris/format'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/crown-commend.module.css'

export interface DraftTexts {
  title: string
  editLabel: string
  aiNote: string
  withTranscript: string
  noTranscript: string
  copy: string
  copied: string
  openVideo: string
  regenerate: string
  time: string
  post: string
  posting: string
  posted: string
  alreadyPostedNote: string
}

interface CommentEditorProps {
  comment: string
  videoUrl: string
  hasTranscript: boolean
  processingTime: number | null
  canPost: boolean
  isPosting: boolean
  isPosted: boolean
  texts: DraftTexts
  onChange: (text: string) => void
  onRegenerate: () => void
  onPost: () => void
}

export const CommentEditor: React.FC<CommentEditorProps> = ({
  comment, videoUrl, hasTranscript, processingTime, canPost, isPosting, isPosted, texts, onChange, onRegenerate, onPost,
}) => {
  const { copied, copyToClipboard } = useCopyToClipboard()

  return (
    <div className={world.reading}>
      <h3 className={world.readingLabel}>{texts.title}</h3>

      <label htmlFor="commend-draft" className="sr-only">{texts.editLabel}</label>
      <textarea
        id="commend-draft"
        className={`${world.textarea} ${styles.draft}`}
        value={comment}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        maxLength={10_000}
        disabled={isPosted}
      />

      <p className={world.hint}>
        {hasTranscript ? texts.withTranscript : texts.noTranscript}
        {processingTime !== null && ` ${fill(texts.time, { seconds: processingTime })}.`}
      </p>
      <p className={world.hint}>{isPosted ? texts.alreadyPostedNote : texts.aiNote}</p>

      <div className={world.actions}>
        <button type="button" className={world.primary} onClick={() => copyToClipboard(comment)} aria-live="polite">
          {copied ? texts.copied : texts.copy}
        </button>
        <a className={world.link} href={videoUrl} target="_blank" rel="noopener noreferrer">{texts.openVideo}</a>
        <button type="button" className={world.link} onClick={onRegenerate} disabled={isPosted}>{texts.regenerate}</button>
        {canPost && (
          <button type="button" className={world.link} onClick={onPost} disabled={isPosting || isPosted}>
            {isPosting ? texts.posting : isPosted ? texts.posted : texts.post}
          </button>
        )}
      </div>
    </div>
  )
}
