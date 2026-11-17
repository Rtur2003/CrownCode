import React, { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { CheckCircle2, ExternalLink, Film, Heart, ShieldCheck, Sparkles } from 'lucide-react'
import { Modal } from '@/components/UI/Modal'
import { useLanguage } from '@/context/LanguageContext'
import { NOINDEX_ROUTES, SPONSORS_URL, normalizePath } from '@/config/site'
import {
  DISMISS_COOLDOWN_MS,
  SCROLL_DWELL_MS,
  SECOND_PAGE_DELAY_MS,
  SPONSORED_COOLDOWN_MS,
  SPONSOR_OPEN_EVENT,
  isEligibleAutoRoute,
  isSponsorCooldownActive,
  recordSessionPageView,
  setSponsorCooldown,
} from './sponsorPrompt'
import styles from './SponsorModal.module.css'

/**
 * Engagement-aware capability preview and voluntary open-source sponsorship modal.
 * Never blocks initial landing paint; opens automatically only after deeper browsing
 * or on explicit user request, and preserves a 14/30-day dismissal cooldown.
 */
export const SponsorModal: React.FC = () => {
  const [open, setOpen] = useState(false)
  const { t } = useLanguage()
  const router = useRouter()
  const copy = t.sponsorModal

  const tryOpenAutomatically = useCallback(() => {
    if (isSponsorCooldownActive()) {return}
    if (typeof document !== 'undefined' && document.querySelector('[role="dialog"]')) {return}
    setOpen(true)
  }, [])

  // Listen for explicit triggers (Footer, Homepage showcase card).
  useEffect(() => {
    const onManualOpen = () => setOpen(true)
    window.addEventListener(SPONSOR_OPEN_EVENT, onManualOpen)
    return () => window.removeEventListener(SPONSOR_OPEN_EVENT, onManualOpen)
  }, [])

  // Engagement-gated automatic trigger: never blocks initial landing / LCP.
  useEffect(() => {
    const cleanPath = normalizePath(router.pathname || '/')
    if (!isEligibleAutoRoute(cleanPath, NOINDEX_ROUTES) || isSponsorCooldownActive()) {
      return
    }

    const views = recordSessionPageView()
    let dwellTimer: number | undefined
    let engaged = views >= 2

    const scheduleAutoOpen = (delayMs: number) => {
      if (dwellTimer !== undefined) {return}
      dwellTimer = window.setTimeout(() => {
        tryOpenAutomatically()
      }, delayMs)
    }

    if (engaged) {
      scheduleAutoOpen(SECOND_PAGE_DELAY_MS)
    }

    let timeReached = false
    let scrolledDeep = false

    const maybeTriggerDwell = () => {
      if (timeReached && scrolledDeep && !engaged) {
        engaged = true
        scheduleAutoOpen(400)
      }
    }

    const activeTimer = window.setTimeout(() => {
      timeReached = true
      maybeTriggerDwell()
    }, SCROLL_DWELL_MS)

    const onScroll = () => {
      const doc = document.documentElement
      const scrollable = Math.max(1, doc.scrollHeight - window.innerHeight)
      if (window.scrollY / scrollable >= 0.45) {
        scrolledDeep = true
        maybeTriggerDwell()
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearTimeout(activeTimer)
      if (dwellTimer !== undefined) {window.clearTimeout(dwellTimer)}
      window.removeEventListener('scroll', onScroll)
    }
  }, [router.pathname, router.asPath, tryOpenAutomatically])

  const handleClose = useCallback(() => {
    setSponsorCooldown(DISMISS_COOLDOWN_MS)
    setOpen(false)
  }, [])

  const handleSponsorClick = useCallback(() => {
    setSponsorCooldown(SPONSORED_COOLDOWN_MS)
    setOpen(false)
  }, [])

  if (!copy) {return null}

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={copy.title}
      size="lg"
      closeLabel={copy.close}
      footer={(
        <p className={styles.legalNote}>
          <ShieldCheck size={15} className={styles.legalIcon} aria-hidden="true" />
          <span>{copy.legalNote}</span>
        </p>
      )}
    >
      <div className={styles.grid}>
        <div className={styles.mediaColumn}>
          <div className={styles.mediaFrame}>
            <Image
              src="/media/crowncode-showcase.webp"
              width={960}
              height={540}
              unoptimized
              alt={copy.previewAlt}
              className={styles.mediaImage}
            />
          </div>
          <p className={styles.mediaCaption}>
            <Film size={14} aria-hidden="true" />
            <span>{copy.previewTitle}</span>
          </p>
        </div>

        <div className={styles.contentColumn}>
          <span className={styles.badge}>
            <Sparkles size={13} aria-hidden="true" />
            <span>{copy.badge}</span>
          </span>

          <p className={styles.lead}>{copy.subtitle}</p>

          <ul className={styles.highlights}>
            {copy.highlights.map((item) => (
              <li key={item}>
                <CheckCircle2 size={16} className={styles.highlightIcon} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <a
              href={SPONSORS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.primaryCta}
              onClick={handleSponsorClick}
            >
              <Heart size={16} aria-hidden="true" />
              <span>{copy.primaryCta}</span>
              <ExternalLink size={14} aria-hidden="true" />
            </a>

            <button type="button" className={styles.secondaryCta} onClick={handleClose}>
              {copy.dismissCta}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default SponsorModal
