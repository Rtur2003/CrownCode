// Crown Commend: a YouTube link in, a comment draft out. The draft is yours to
// change and post; posting from the page exists only in a build that enables it
// (see COMMEND_POSTING_ENABLED), because it needs the server's own credentials.

import React from 'react'
import type { NextPage } from 'next'
import { MainLayout } from '@/components/Layout/MainLayout'
import { VideoPreview, CommentEditor } from '@/components/CrownCommend'
import { BackendNote } from '@/components/UI/BackendNote'
import { WorldPage } from '@/components/UI/WorldPage'
import { COMMEND_POSTING_ENABLED } from '@/config/api'
import { useLanguage } from '@/context/LanguageContext'
import {
  useCommend,
  COMMENT_STYLES,
  COMMENT_LANGUAGES,
  type CommentLanguage,
  type CommentStyle,
} from '@/hooks/useCommend'
import world from '@/styles/components/world-page.module.css'
import styles from '@/styles/pages/crown-commend.module.css'

const CrownCommendPage: NextPage = () => {
  const { t, language } = useLanguage()
  const C = t.crownCommend

  const {
    state, videoUrl, language: commentLanguage, style, generatedComment, videoDetails, processingTime,
    hasTranscript, error, postResult, isValidUrl, setVideoUrl, setLanguage, setStyle,
    generateComment, postComment, updateComment, reset,
  } = useCommend(C.errors)

  const busy = state === 'generating' || state === 'posting'
  const showInvalid = videoUrl.trim().length > 0 && !isValidUrl

  return (
    <MainLayout title={C.meta.title} description={C.meta.description} keywords={C.meta.keywords}>
      <WorldPage world="crown-commend" title={C.header.title} lead={C.header.lead}>
        <section className={world.section} aria-labelledby="commend-form-title">
          <div className={world.sectionHead}>
            <h2 id="commend-form-title">{C.form.title}</h2>
            <p>{C.form.subtitle}</p>
          </div>

          <div className={world.sectionBody}>
            <BackendNote />

            <form
              onSubmit={(e) => { e.preventDefault(); if (isValidUrl && !busy) {void generateComment()} }}
              noValidate
            >
              <div className={world.field}>
                <label className={world.fieldLabel} htmlFor="commend-url">{C.form.urlLabel}</label>
                <input
                  id="commend-url"
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  className={world.input}
                  placeholder={C.form.urlPlaceholder}
                  value={videoUrl}
                  aria-invalid={showInvalid}
                  aria-describedby={showInvalid ? 'commend-url-error' : undefined}
                  onChange={(e) => {
                    setVideoUrl(e.target.value)
                    if (generatedComment) {reset()}
                  }}
                  disabled={busy}
                />
                {showInvalid && <p id="commend-url-error" className={world.error}>{C.form.urlInvalid}</p>}
              </div>

              <div className={world.fields}>
                <div className={world.field}>
                  <label className={world.fieldLabel} htmlFor="commend-language">{C.form.languageLabel}</label>
                  <select
                    id="commend-language"
                    className={world.select}
                    value={commentLanguage}
                    onChange={(e) => setLanguage(e.target.value as CommentLanguage)}
                    disabled={busy}
                  >
                    {COMMENT_LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                  </select>
                </div>

                <div className={world.field}>
                  <label className={world.fieldLabel} htmlFor="commend-style">{C.form.styleLabel}</label>
                  <select
                    id="commend-style"
                    className={world.select}
                    value={style}
                    onChange={(e) => setStyle(e.target.value as CommentStyle)}
                    disabled={busy}
                  >
                    {COMMENT_STYLES.map(({ id }) => (
                      <option key={id} value={id}>{C.styles[id].name}: {C.styles[id].description}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={world.actions}>
                <button type="submit" className={world.primary} disabled={!isValidUrl || busy} aria-busy={state === 'generating'}>
                  {state === 'generating' ? C.form.generating : C.form.generateButton}
                </button>
              </div>
            </form>

            <div aria-live="polite">
              {error && <p className={world.error} role="alert">{error.message}</p>}

              {videoDetails && (
                <VideoPreview details={videoDetails} labels={C.preview.stats} language={language} />
              )}

              {generatedComment && (
                <CommentEditor
                  comment={generatedComment}
                  videoUrl={videoUrl.startsWith('http') ? videoUrl : `https://${videoUrl}`}
                  hasTranscript={hasTranscript}
                  processingTime={processingTime}
                  canPost={COMMEND_POSTING_ENABLED}
                  isPosting={state === 'posting'}
                  isPosted={postResult?.status === 'success' || postResult?.alreadyCommented === true}
                  texts={C.draft}
                  onChange={updateComment}
                  onRegenerate={generateComment}
                  onPost={postComment}
                />
              )}
            </div>
          </div>
        </section>

        <section className={world.section} aria-labelledby="commend-how-title">
          <div className={world.sectionHead}>
            <h2 id="commend-how-title">{C.how.title}</h2>
          </div>
          <div className={world.sectionBody}>
            <ol className={styles.steps}>
              {C.how.steps.map((step: string) => <li key={step}>{step}</li>)}
            </ol>
            <p className={world.privacy}>{C.disclaimer}</p>
          </div>
        </section>
      </WorldPage>
    </MainLayout>
  )
}

export default CrownCommendPage
