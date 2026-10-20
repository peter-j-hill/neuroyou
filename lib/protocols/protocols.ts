import type { SupabaseClient, User } from '@supabase/supabase-js'

export type ProtocolRow = {
  id: string
  slug: string
  title: string
  tagline: string | null
  status: 'live' | 'waitlist' | 'draft'
  prerequisite_protocol_id: string | null
  intro_video_ref: string | null
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'peter.j.hill@live.com'

export const isAdminUser = (user: User | null) => !!user && user.email === ADMIN_EMAIL

const COLUMNS = 'id, slug, title, tagline, status, prerequisite_protocol_id, intro_video_ref'

/**
 * Row-level security decides what comes back: the public sees live and waitlist protocols,
 * the admin also sees drafts (so the admin can preview a page before it is launched).
 */
export async function getProtocol(supabase: SupabaseClient, slug: string): Promise<ProtocolRow | null> {
  const { data } = await supabase.from('protocols').select(COLUMNS).eq('slug', slug).maybeSingle()
  return (data as ProtocolRow | null) ?? null
}

/** Where a student goes after buying. Phase 3 changes this to the course home. */
export const courseHomeHref = (slug: string) => `/dashboard?welcome=${encodeURIComponent(slug)}`
