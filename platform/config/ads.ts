/**
 * Central Google AdSense configuration & placement registry.
 *
 * Pre-approval: stays dormant (`ADS_ENABLED === false`), rendering nothing to visitors
 * while letting the site owner preview every placement with `?ads-preview=1`.
 * Activation: set `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-...` plus slot IDs (or
 * `NEXT_PUBLIC_AD_SLOT_GLOBAL_BOTTOM`) in the environment and rebuild/deploy.
 */

import { NOINDEX_ROUTES } from '@/config/site'

const rawClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() ?? ''
export const ADSENSE_CLIENT_ID = /^ca-pub-\d{10,}$/.test(rawClientId) ? rawClientId : ''
export const ADS_ENABLED = Boolean(ADSENSE_CLIENT_ID)
export const AD_PREVIEW_ENV = process.env.NEXT_PUBLIC_ADS_PREVIEW === 'true'

export type AdPlacement =
  | 'home-bottom'
  | 'fl-mcp-bottom'
  | 'auris-mid'
  | 'auris-bottom'
  | 'ml-toolkit-bottom'
  | 'creator-studio-bottom'
  | 'crown-fortune-bottom'
  | 'crown-dreams-mid'
  | 'crown-dreams-bottom'
  | 'crown-commend-bottom'
  | 'crown-vote-bottom'
  | 'noir-grain-bottom'

const cleanSlot = (value: string | undefined): string => {
  const v = value?.trim() ?? ''
  return /^\d{6,}$/.test(v) ? v : ''
}

const GLOBAL_BOTTOM_FALLBACK = cleanSlot(process.env.NEXT_PUBLIC_AD_SLOT_GLOBAL_BOTTOM)
const GLOBAL_INCONTENT_FALLBACK = cleanSlot(process.env.NEXT_PUBLIC_AD_SLOT_INCONTENT)

const PER_PLACEMENT_SLOTS: Record<AdPlacement, string> = {
  'home-bottom': cleanSlot(process.env.NEXT_PUBLIC_AD_SLOT_HOME_BOTTOM) || GLOBAL_BOTTOM_FALLBACK,
  'fl-mcp-bottom': cleanSlot(process.env.NEXT_PUBLIC_AD_SLOT_FLMCP_BOTTOM) || GLOBAL_BOTTOM_FALLBACK,
  'auris-mid': cleanSlot(process.env.NEXT_PUBLIC_AD_SLOT_AURIS_MID) || GLOBAL_INCONTENT_FALLBACK,
  'auris-bottom': cleanSlot(process.env.NEXT_PUBLIC_AD_SLOT_AURIS_BOTTOM) || GLOBAL_BOTTOM_FALLBACK,
  'ml-toolkit-bottom': cleanSlot(process.env.NEXT_PUBLIC_AD_SLOT_ML_BOTTOM) || GLOBAL_BOTTOM_FALLBACK,
  'creator-studio-bottom': cleanSlot(process.env.NEXT_PUBLIC_AD_SLOT_CREATOR_BOTTOM) || GLOBAL_BOTTOM_FALLBACK,
  'crown-fortune-bottom': cleanSlot(process.env.NEXT_PUBLIC_AD_SLOT_FORTUNE_BOTTOM) || GLOBAL_BOTTOM_FALLBACK,
  'crown-dreams-mid': cleanSlot(process.env.NEXT_PUBLIC_AD_SLOT_DREAMS_MID) || GLOBAL_INCONTENT_FALLBACK,
  'crown-dreams-bottom': cleanSlot(process.env.NEXT_PUBLIC_AD_SLOT_DREAMS_BOTTOM) || GLOBAL_BOTTOM_FALLBACK,
  'crown-commend-bottom': cleanSlot(process.env.NEXT_PUBLIC_AD_SLOT_COMMEND_BOTTOM) || GLOBAL_BOTTOM_FALLBACK,
  'crown-vote-bottom': cleanSlot(process.env.NEXT_PUBLIC_AD_SLOT_VOTE_BOTTOM) || GLOBAL_BOTTOM_FALLBACK,
  'noir-grain-bottom': cleanSlot(process.env.NEXT_PUBLIC_AD_SLOT_NOIR_BOTTOM) || GLOBAL_BOTTOM_FALLBACK,
}

const PATH_TO_BOTTOM_PLACEMENT: Record<string, AdPlacement> = {
  '/': 'home-bottom',
  '/fl-mcp': 'fl-mcp-bottom',
  '/ai-music-detection': 'auris-bottom',
  '/data-manipulation': 'ml-toolkit-bottom',
  '/creator-studio': 'creator-studio-bottom',
  '/crown-fortune': 'crown-fortune-bottom',
  '/crown-dreams': 'crown-dreams-bottom',
  '/crown-commend': 'crown-commend-bottom',
  '/crown-vote': 'crown-vote-bottom',
  '/noir-grain': 'noir-grain-bottom',
}

/** Routes that must stay ad-free per AdSense program policies (legal, utility, error, noindex). */
const AD_EXCLUDED_ROUTES = new Set<string>([
  '/privacy',
  '/terms',
  ...NOINDEX_ROUTES,
])

export function adSlotIdFor(placement: AdPlacement): string {
  return PER_PLACEMENT_SLOTS[placement] || ''
}

export function bottomAdPlacementFor(pathname: string): AdPlacement | null {
  if (AD_EXCLUDED_ROUTES.has(pathname)) {
    return null
  }
  return PATH_TO_BOTTOM_PLACEMENT[pathname] ?? null
}

/** Standard Google ads.txt declaration line derived from ADSENSE_CLIENT_ID. */
export function adsTxtLine(): string | null {
  if (!ADSENSE_CLIENT_ID) {
    return null
  }
  const publisher = ADSENSE_CLIENT_ID.replace(/^ca-/, '')
  return `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`
}
