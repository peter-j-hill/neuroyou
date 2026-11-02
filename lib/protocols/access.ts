import { cache } from 'react'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProtocol, isAdminUser } from './protocols'
import { hasActivePurchase } from './purchase'

/**
 * The single gate for every course page (/protocols/[protocol] and below).
 *  - not signed in        -> sign in, then come back
 *  - protocol not visible -> 404 (a draft is visible to the admin only)
 *  - not bought           -> the offer page
 * The admin always gets in, to review the course. Cached per request, so a layout and
 * a page can both call it without repeating the queries.
 */
export const requireProtocolAccess = cache(async (slug: string) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(`/protocols/${slug}`)}`)

  const protocol = await getProtocol(supabase, slug)
  if (!protocol) notFound()

  const admin = isAdminUser(user)
  if (!admin && !(await hasActivePurchase(user.id, protocol.id))) redirect(`/offers/${slug}`)

  return { supabase, user, protocol, admin }
})
