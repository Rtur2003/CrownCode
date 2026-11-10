/**
 * FL-MCP purchase links. Checkout happens on Lemon Squeezy; the links come from the build
 * environment (NEXT_PUBLIC_LS_CHECKOUT_*), so nothing is hard-coded and a missing one simply
 * sends the visitor to the dashboard instead.
 */

export type CheckoutPlan = 'pro' | 'studio' | 'pack100'

const LINKS: Record<CheckoutPlan, string> = {
  pro: process.env.NEXT_PUBLIC_LS_CHECKOUT_PRO?.trim() ?? '',
  studio: process.env.NEXT_PUBLIC_LS_CHECKOUT_STUDIO?.trim() ?? '',
  pack100: process.env.NEXT_PUBLIC_LS_CHECKOUT_PACK100?.trim() ?? '',
}

/** The checkout URL for a plan, with the buyer's email filled in; null when none is configured. */
export function checkoutUrl(plan: CheckoutPlan, email?: string): string | null {
  const base = LINKS[plan]
  if (!base || /YOUR_|PLACEHOLDER|CHANGE_ME/i.test(base)) {return null}
  try {
    const url = new URL(base)
    if (url.protocol !== 'https:') {return null}
    if (email) {url.searchParams.set('checkout[email]', email)}
    return url.toString()
  } catch {
    return null
  }
}

/** The credits each plan or pack brings, shown next to its button. */
export const PLAN_FACTS: Record<CheckoutPlan, { price: string; credits: number }> = {
  pro: { price: '$19 / month', credits: 300 },
  studio: { price: '$49 / month', credits: 1200 },
  pack100: { price: '$10 once', credits: 100 },
}

