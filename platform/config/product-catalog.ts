/**
 * Product Catalog — Single source of truth for all platform products.
 *
 * Every component that needs to list, search, or link products must import
 * from this file instead of maintaining its own hardcoded array.
 *
 * Localised strings (title, description, etc.) still come from the
 * translation files; this catalog provides the *structural* data:
 * id, route, icon name, gradient, category and locale-key path.
 */

import type { LucideIcon } from 'lucide-react'
import { Music, Brain, Crown, Moon, Youtube, Bot } from 'lucide-react'

// ── Types ───────────────────────────────────────────────────────────

export interface ProductEntry {
  /** Stable identifier (matches locale key path `products.items.<localeKey>`) */
  id: string
  /** Key under `products.items` in locale JSON */
  localeKey: string
  /** Client-side route */
  href: string
  /** Lucide icon component */
  icon: LucideIcon
  /** Tailwind gradient classes for card styling */
  gradient: string
  /** Product category for search/filter */
  category: 'project' | 'page'
}

// ── Catalog ─────────────────────────────────────────────────────────

export const PRODUCT_CATALOG: readonly ProductEntry[] = [
  {
    id: 'ai-music-detection',
    localeKey: 'aiMusic',
    href: '/ai-music-detection',
    icon: Music,
    gradient: 'from-amber-400 via-yellow-500 to-orange-600',
    category: 'project',
  },
  {
    id: 'ml-toolkit',
    localeKey: 'mlToolkit',
    href: '/data-manipulation',
    icon: Brain,
    gradient: 'from-blue-400 via-cyan-500 to-teal-600',
    category: 'project',
  },
  {
    id: 'crown-fortune',
    localeKey: 'fortune',
    href: '/crown-fortune',
    icon: Crown,
    gradient: 'from-amber-400 via-orange-500 to-red-500',
    category: 'project',
  },
  {
    id: 'crown-dreams',
    localeKey: 'dreams',
    href: '/crown-dreams',
    icon: Moon,
    gradient: 'from-purple-400 via-violet-500 to-indigo-600',
    category: 'project',
  },
  {
    id: 'crown-commend',
    localeKey: 'commend',
    href: '/crown-commend',
    icon: Youtube,
    gradient: 'from-red-500 via-red-600 to-amber-500',
    category: 'project',
  },
  {
    id: 'crown-vote',
    localeKey: 'vote',
    href: '/crown-vote',
    icon: Bot,
    gradient: 'from-emerald-400 via-green-500 to-teal-600',
    category: 'project',
  },
] as const

// ── Search Registry (pages + features) ──────────────────────────────

export type SearchCategory = 'product' | 'feature' | 'page'

export interface SearchRegistryEntry {
  id: string
  href: string
  category: SearchCategory
  /** Dot-path to resolve title from locale object, e.g. "search.pages.home" */
  titleKey: string
  /** Dot-path for optional description */
  descriptionKey?: string
}

/**
 * Static pages and features that appear in search alongside PRODUCT_CATALOG.
 * All titles/descriptions are resolved from locale at runtime — no EN fallbacks.
 */
export const SEARCH_REGISTRY: readonly SearchRegistryEntry[] = [
  { id: 'home', href: '/', category: 'page', titleKey: 'search.pages.home' },
  { id: 'projects', href: '/#products', category: 'page', titleKey: 'search.pages.projects' },
  { id: 'url-analysis', href: '/ai-music-detection#url', category: 'feature', titleKey: 'search.features.urlAnalysis', descriptionKey: 'search.features.urlAnalysisDesc' },
  { id: 'data-augmentation', href: '/data-manipulation', category: 'feature', titleKey: 'search.features.dataAugmentation', descriptionKey: 'search.features.dataAugmentationDesc' },
  { id: 'creator-studio', href: '/creator-studio', category: 'page', titleKey: 'creatorStudio.title', descriptionKey: 'creatorStudio.subtitle' },
  { id: 'analysis-history', href: '/analysis-history', category: 'page', titleKey: 'analysisHistory.title', descriptionKey: 'analysisHistory.subtitle' },
  { id: 'system-status', href: '/system-status', category: 'page', titleKey: 'systemStatus.title', descriptionKey: 'systemStatus.allOperational' },
] as const

/**
 * Resolve a dot-path key from the locale object.
 * e.g. resolveKey(t, "search.pages.home") → t.search.pages.home
 *
 * Contract:
 * - In development/test: throws if key is missing (fail-fast).
 * - In production: returns the dot-path itself as a visible signal
 *   so missing translations are obvious in the UI, not silently blank.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolveKey(t: Record<string, any>, path: string): string {
  const parts = path.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = t
  for (const part of parts) {
    current = current?.[part]
  }
  if (typeof current === 'string') {
    return current
  }
  if (process.env.NODE_ENV !== 'production') {
    throw new Error(`[resolveKey] Missing locale key: "${path}"`)
  }
  return `[${path}]`
}

/**
 * All product IDs that should appear in footer product links.
 * Order is display order.
 */
export const FOOTER_PRODUCT_IDS = [
  'ai-music-detection',
  'ml-toolkit',
  'crown-fortune',
  'creator-studio',
  'system-status',
] as const

export type FooterProductId = (typeof FOOTER_PRODUCT_IDS)[number]

/** Maps each footer product ID → locale key under `t.footer.sections.products` */
export const FOOTER_PRODUCT_LOCALE_MAP: Record<FooterProductId, string> = {
  'ai-music-detection': 'aiMusic',
  'ml-toolkit': 'dataProcessing',
  'crown-fortune': 'fortune',
  'creator-studio': 'creatorStudio',
  'system-status': 'systemStatus',
}

/**
 * Look up the href for a given product ID from PRODUCT_CATALOG or SEARCH_REGISTRY.
 */
export function getProductHref(id: string): string {
  const catalogEntry = PRODUCT_CATALOG.find((e) => e.id === id)
  if (catalogEntry) return catalogEntry.href
  const registryEntry = SEARCH_REGISTRY.find((e) => e.id === id)
  if (registryEntry) return registryEntry.href
  return '/'
}

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Resolve localised product fields from the translation object.
 *
 * Usage:
 * ```ts
 * const { t } = useLanguage()
 * const resolved = resolveProduct(entry, t)
 * // resolved.title, resolved.description, resolved.status, ...
 * ```
 */
export function resolveProduct(
  entry: ProductEntry,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any,
): {
  title: string
  description: string
  status: string
  stats: string
  features: string[]
} {
  const item = t.products?.items?.[entry.localeKey]
  return {
    title: item?.title ?? entry.id,
    description: item?.description ?? '',
    status: item?.status ?? '',
    stats: item?.stats ?? '',
    features: item?.features ?? [],
  }
}
