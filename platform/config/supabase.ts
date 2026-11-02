/**
 * Supabase Auth in the browser (Google sign-in for the FL-MCP dashboard).
 *
 * The URL and the publishable key are public by design: they only identify the project, and row
 * level security keeps the tables closed. The licence API verifies the access token itself, so no
 * secret key ever reaches this app. Without the two variables the dashboard says sign-in is off.
 */

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ''
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? ''

export const SUPABASE_CONFIGURED = Boolean(URL && KEY)

let client: SupabaseClient | null = null

/** One shared browser client, or null when sign-in is not configured for this build. */
export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_CONFIGURED) {return null}
  client ??= createBrowserClient(URL, KEY)
  return client
}

