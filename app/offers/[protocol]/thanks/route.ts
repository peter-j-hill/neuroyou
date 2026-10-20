import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/protocols/stripe'
import { recordPurchase } from '@/lib/protocols/purchase'
import { courseHomeHref } from '@/lib/protocols/protocols'

// Where Stripe sends the student after paying. The purchase is verified with Stripe and
// recorded here (the webhook does the same, so whichever arrives first wins and the other is a no-op).
export async function GET(request: Request, ctx: { params: Promise<{ protocol: string }> }) {
  const { protocol } = await ctx.params
  const url = new URL(request.url)
  const sessionId = url.searchParams.get('session_id')
  const offer = (query = '') => NextResponse.redirect(new URL(`/offers/${protocol}${query}`, url.origin))

  if (!sessionId || !sessionId.startsWith('cs_')) return offer()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const back = `/offers/${protocol}/thanks?session_id=${encodeURIComponent(sessionId)}`
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(back)}`, url.origin))
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId)
    // Only the person who started this checkout may claim it.
    if (session.metadata?.user_id !== user.id) return offer('?payment=error')

    const result = await recordPurchase(session)
    if (result.ok) return NextResponse.redirect(new URL(courseHomeHref(result.protocolSlug), url.origin))
    return offer(result.reason === 'unpaid' ? '?payment=pending' : '?payment=error')
  } catch (err) {
    console.error('Return from checkout failed', err)
    return offer('?payment=error')
  }
}
