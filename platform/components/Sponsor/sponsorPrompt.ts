export const SPONSOR_OPEN_EVENT = 'crowncode:open-sponsor'
export const COOLDOWN_STORAGE_KEY = 'cc_sponsor_prompt_v1'
export const SESSION_VIEWS_KEY = 'cc_session_views_v1'

export const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000
export const SPONSORED_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000
export const SCROLL_DWELL_MS = 45000
export const SECOND_PAGE_DELAY_MS = 12000

const SKIP_AUTO_ROUTES = new Set(['/privacy', '/terms', '/404', '/_error'])

export function isEligibleAutoRoute(pathname: string, noindexRoutes: readonly string[]): boolean {
  if (!pathname) {return false}
  const normalized = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  if (SKIP_AUTO_ROUTES.has(normalized)) {return false}
  return !noindexRoutes.includes(normalized)
}

export function isSponsorCooldownActive(now = Date.now()): boolean {
  if (typeof window === 'undefined') {return true}
  try {
    const raw = window.localStorage.getItem(COOLDOWN_STORAGE_KEY)
    if (!raw) {return false}
    const until = Number(raw)
    return Number.isFinite(until) && until > now
  } catch {
    return false
  }
}

export function setSponsorCooldown(durationMs: number, now = Date.now()): void {
  if (typeof window === 'undefined') {return}
  try {
    window.localStorage.setItem(COOLDOWN_STORAGE_KEY, String(now + durationMs))
  } catch {
    // Ignore storage errors in restricted browsing modes.
  }
}

export function recordSessionPageView(): number {
  if (typeof window === 'undefined') {return 0}
  try {
    const current = Number(window.sessionStorage.getItem(SESSION_VIEWS_KEY) || '0')
    const next = Number.isFinite(current) ? current + 1 : 1
    window.sessionStorage.setItem(SESSION_VIEWS_KEY, String(next))
    return next
  } catch {
    return 1
  }
}

/** Open the CrownCode capability tour & sponsorship modal from anywhere in the UI. */
export function openSponsorModal(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SPONSOR_OPEN_EVENT))
  }
}
