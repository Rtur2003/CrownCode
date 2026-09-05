'use client'

import React from 'react'
import type { NextPage } from 'next'
import { motion, AnimatePresence } from 'motion/react'
import {
  Youtube,
  Wand2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Brain,
  MessageSquare,
  Shield,
  Languages
} from 'lucide-react'
import { MainLayout } from '@/components/Layout/MainLayout'
import { useLanguage } from '@/context/LanguageContext'
import { VideoPreview, CommentEditor } from '@/components/CrownCommend'
import {
  useCommend,
  COMMENT_STYLES,
  COMMENT_LANGUAGES,
  type CommentLanguage,
  type CommentStyle
} from '@/hooks/useCommend'
import styles from '@/styles/pages/crown-commend.module.css'

const CrownCommendPage: NextPage = () => {
  const { t } = useLanguage()
  const commendT = t.crownCommend

  const {
    state,
    videoUrl,
    language: commentLanguage,
    style,
    generatedComment,
    videoDetails,
    processingTime,
    hasTranscript,
    error,
    postResult,
    isValidUrl,
    setVideoUrl,
    setLanguage: setCommentLanguage,
    setStyle,
    generateComment,
    postComment,
    reset
  } = useCommend(commendT.errors)

  const isLoading = state === 'generating' || state === 'fetching' || state === 'posting'

  const featureItems = [
    {
      icon: Brain,
      ...commendT.features.items.advancedAI
    },
    {
      icon: Languages,
      ...commendT.features.items.multiLanguage
    },
    {
      icon: MessageSquare,
      ...commendT.features.items.transcript
    },
    {
      icon: Shield,
      ...commendT.features.items.transparency
    }
  ]

  return (
    <MainLayout
      title={commendT.meta.title}
      description={commendT.meta.description}
      keywords={commendT.meta.keywords}
    >
      <div className={styles.commendPage}>
        {/* Background */}
        <div className={styles.commendBackground}>
          <div className={styles.commendGradient} />
          <div className={styles.commendPattern} />
        </div>

        <div className={styles.commendContainer}>
          {/* Header */}
          <motion.header
            className={styles.commendHeader}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.headerBadge}>
              <Youtube size={16} />
              <span>{commendT.header.badge}</span>
            </div>
            <h1 className={styles.commendTitle}>{commendT.header.title}</h1>
            <p className={styles.commendSubtitle}>{commendT.header.subtitle}</p>
          </motion.header>

          {/* Main Section */}
          <motion.section
            className={styles.mainSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Input Card */}
            <div className={styles.inputCard}>
              {/* URL Input */}
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>{commendT.form.urlLabel}</label>
                <div className={styles.urlInputWrapper}>
                  <Youtube size={20} className={styles.urlInputIcon} />
                  <input
                    type="text"
                    className={`${styles.urlInput} ${videoUrl ? (isValidUrl ? styles.urlValid : styles.urlInvalid) : ''}`}
                    placeholder={commendT.form.urlPlaceholder}
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value)
                      if (generatedComment) {
                        reset()
                      }
                    }}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Options */}
              <div className={styles.optionsRow}>
                <div className={styles.selectWrapper}>
                  <label className={styles.selectLabel}>{commendT.form.languageLabel}</label>
                  <select
                    className={styles.select}
                    value={commentLanguage}
                    onChange={(e) => setCommentLanguage(e.target.value as CommentLanguage)}
                    disabled={isLoading}
                  >
                    {COMMENT_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.selectWrapper}>
                  <label className={styles.selectLabel}>{commendT.form.styleLabel}</label>
                  <select
                    className={styles.select}
                    value={style}
                    onChange={(e) => setStyle(e.target.value as CommentStyle)}
                    disabled={isLoading}
                  >
                    {COMMENT_STYLES.map((commentStyle) => {
                      const styleCopy = commendT.styles[commentStyle.id]
                      return (
                        <option key={commentStyle.id} value={commentStyle.id}>
                          {styleCopy.name} - {styleCopy.description}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <motion.button
                className={`${styles.generateButton} ${isLoading ? styles.generating : ''}`}
                onClick={generateComment}
                disabled={!isValidUrl || isLoading}
                whileHover={{ scale: isValidUrl && !isLoading ? 1.02 : 1 }}
                whileTap={{ scale: isValidUrl && !isLoading ? 0.98 : 1 }}
              >
                {state === 'generating' ? (
                  <>
                    <Loader2 size={22} className={styles.buttonSpinner} />
                    {commendT.form.generating}
                  </>
                ) : (
                  <>
                    <Wand2 size={22} />
                    {commendT.form.generateButton}
                  </>
                )}
              </motion.button>
            </div>

            {/* Results Section — these blocks (error, success, video, comment)
                aren't mutually exclusive alternatives (video + comment render
                together after a successful generate), so `mode="wait"` is the
                wrong tool here: it serializes exit/enter across ALL children
                as if only one could exist, which glitches the transition when
                regenerating. Default `sync` mode animates each independently. */}
            <AnimatePresence>
              {/* Error */}
              {error && (
                <motion.div
                  key="error"
                  className={styles.errorCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <AlertCircle size={24} />
                  <div className={styles.errorText}>
                    <div className={styles.errorTitle}>{commendT.feedback.errorTitle}</div>
                    <div className={styles.errorMessage}>{error.message}</div>
                  </div>
                </motion.div>
              )}

              {/* Success Toast (after posting) */}
              {postResult && postResult.status === 'success' && (
                <motion.div
                  key="success"
                  className={styles.successToast}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <CheckCircle size={24} />
                  <span className={styles.successText}>{commendT.feedback.successMessage}</span>
                </motion.div>
              )}

              {/* Video Preview */}
              {videoDetails && (
                <motion.div
                  key="video"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <VideoPreview details={videoDetails} labels={commendT.preview.stats} />
                </motion.div>
              )}

              {/* Comment Editor */}
              {generatedComment && (
                <motion.div
                  key="comment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <CommentEditor
                    comment={generatedComment}
                    onRegenerate={generateComment}
                    onPost={postComment}
                    isPosting={state === 'posting'}
                    isAlreadyPosted={postResult?.status === 'success' || postResult?.alreadyCommented === true}
                    hasTranscript={hasTranscript}
                    processingTime={processingTime}
                    texts={commendT.editor}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Features Section */}
          <motion.section
            className={styles.featuresSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className={styles.featuresTitle}>{commendT.features.title}</h2>
            <div className={styles.featuresGrid}>
              {featureItems.map((feature, index) => (
                <motion.div
                  key={index}
                  className={styles.featureCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                >
                  <div className={styles.featureIcon}>
                    <feature.icon size={24} />
                  </div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Disclaimer Footer */}
          <motion.footer
            className={styles.disclaimerFooter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p>{commendT.disclaimer}</p>
          </motion.footer>
        </div>
      </div>
    </MainLayout>
  )
}

export default CrownCommendPage
