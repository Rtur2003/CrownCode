import React, { useEffect, useRef, useSyncExternalStore } from 'react'
import {
  ADSENSE_CLIENT_ID,
  ADS_ENABLED,
  AD_PREVIEW_ENV,
  adSlotIdFor,
  type AdPlacement,
} from '@/config/ads'
import { useLanguage } from '@/context/LanguageContext'
import styles from './AdSlot.module.css'

interface AdSlotProps {
  placement: AdPlacement
  layout?: 'leaderboard' | 'in-content'
  className?: string | undefined
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>
  }
}

const subscribeLocation = () => () => {}

const getPreviewQuerySnapshot = () => {
  if (typeof window === 'undefined') {return false}
  return new URLSearchParams(window.location.search).get('ads-preview') === '1'
}

/**
 * Policy-safe Google AdSense slot with CLS reservation and `?ads-preview=1`
 * visual placement preview. Returns null for regular visitors when unconfigured
 * so no blank placeholders degrade page geometry.
 */
export const AdSlot: React.FC<AdSlotProps> = ({ placement, layout = 'leaderboard', className }) => {
  const { language } = useLanguage()
  const isTr = language === 'tr'
  const pushedRef = useRef(false)
  const previewQuery = useSyncExternalStore(subscribeLocation, getPreviewQuerySnapshot, () => false)

  const slotId = adSlotIdFor(placement)
  const isLive = ADS_ENABLED && Boolean(slotId)

  useEffect(() => {
    if (!isLive || pushedRef.current || typeof window === 'undefined') {return}
    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
      pushedRef.current = true
    } catch {
      // Ignore AdSense init timing or blocker errors cleanly
    }
  }, [isLive, placement])

  const showPreview = !isLive && (AD_PREVIEW_ENV || previewQuery)
  if (!isLive && !showPreview) {
    return null
  }

  const label = isTr ? 'Reklam Alanı' : 'Advertisement'

  return (
    <aside
      className={`${styles.wrapper}${className ? ` ${className}` : ''}`}
      data-layout={layout}
      data-ad-placement={placement}
      aria-label={label}
    >
      <div className={styles.inner}>
        <span className={styles.label}>{label}</span>
        {isLive ? (
          <div className={styles.frame}>
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%' }}
              data-ad-client={ADSENSE_CLIENT_ID}
              data-ad-slot={slotId}
              data-ad-format={layout === 'in-content' ? 'rectangle' : 'horizontal'}
              data-full-width-responsive="true"
            />
          </div>
        ) : (
          <div className={styles.previewBox}>
            <span>{`AdSense Slot: ${placement}`}</span>
            <span className={styles.previewMeta}>
              {layout === 'in-content' ? 'Responsive Rectangle (336×280 / Auto)' : 'Responsive Banner (728×90 / Mobile 320×100)'}
            </span>
          </div>
        )}
      </div>
    </aside>
  )
}

export default AdSlot
