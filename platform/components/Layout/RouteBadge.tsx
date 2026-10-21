/**
 * Route badge: the way back to the atlas, and on to the neighbouring projects.
 *
 * Project pages are the worlds of the homepage atlas. The badge finds the
 * current page in PRODUCT_CATALOG and offers the way back to that world in
 * the atlas plus the neighbouring worlds in catalog order (wrapping around),
 * so a new catalog entry joins the route without touching any page.
 * Rendered by MainLayout; renders nothing outside a project route.
 */

import { useEffect, useRef, type CSSProperties } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { PRODUCT_CATALOG, resolveProduct } from '@/config/product-catalog'
import { worldLook, worldName } from '@/config/showroom-worlds'
import styles from './RouteBadge.module.css'

const isExternal = (href: string) => /^https?:/.test(href)

/** Catalog index of the world whose page is `pathname`, or -1. */
export function worldIndexForPath(pathname: string): number {
  return PRODUCT_CATALOG.findIndex(
    (entry) => !isExternal(entry.href) && (pathname === entry.href || pathname.startsWith(`${entry.href}/`)),
  )
}

export function RouteBadge() {
  const { t } = useLanguage()
  const { pathname } = useRouter()
  const ref = useRef<HTMLElement>(null)
  const index = worldIndexForPath(pathname)

  // Tuck away while reading downwards, come back on the way up and at the
  // end of the page (where the next world is the natural next step).
  useEffect(() => {
    const el = ref.current
    if (!el) {return}
    let last = window.scrollY
    let frame = 0
    const update = () => {
      frame = 0
      const y = window.scrollY
      const atEnd = y + window.innerHeight >= document.documentElement.scrollHeight - 120
      if (Math.abs(y - last) < 8 && !atEnd) {return}
      el.toggleAttribute('data-tucked', y > last && y > 160 && !atEnd)
      last = y
    }
    const onScroll = () => { frame ||= requestAnimationFrame(update) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
      el.removeAttribute('data-tucked')
    }
  }, [index])

  if (index < 0) {return null}

  const count = PRODUCT_CATALOG.length
  const world = (i: number) => {
    const at = (i + count) % count
    const entry = PRODUCT_CATALOG[at]
    return {
      entry,
      name: worldName(entry, resolveProduct(entry, t).title),
      accent: worldLook(entry).accent,
      external: isExternal(entry.href),
    }
  }
  const here = world(index)
  const copy = t.routeBadge

  const neighbour = (w: ReturnType<typeof world>, dir: 'prev' | 'next') => (
    <Link
      href={w.entry.href}
      className={styles.step}
      data-dir={dir}
      rel={w.external ? 'noreferrer' : dir}
      target={w.external ? '_blank' : undefined}
      aria-label={`${dir === 'prev' ? copy.previous : copy.next}: ${w.name}${w.external ? ` (${copy.newTab})` : ''}`}
      style={{ '--world': w.accent } as CSSProperties}
    >
      {dir === 'prev' && <ChevronLeft size={16} aria-hidden="true" />}
      <span className={styles.name}>{w.name}</span>
      {w.external && <ArrowUpRight size={13} className={styles.external} aria-hidden="true" />}
      {dir === 'next' && <ChevronRight size={16} aria-hidden="true" />}
    </Link>
  )

  return (
    <nav ref={ref} className={styles.badge} aria-label={copy.label} style={{ '--world': here.accent } as CSSProperties}>
      <Link href={`/#world-${here.entry.id}`} className={styles.home}>
        <ArrowLeft size={15} aria-hidden="true" />
        <span>{copy.backToAtlas}</span>
      </Link>
      <span className={styles.rule} aria-hidden="true" />
      {neighbour(world(index - 1), 'prev')}
      {neighbour(world(index + 1), 'next')}
    </nav>
  )
}

export default RouteBadge
