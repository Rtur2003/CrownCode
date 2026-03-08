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
