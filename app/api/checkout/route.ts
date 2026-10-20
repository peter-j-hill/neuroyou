import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getStripe, priceIdFor } from '@/lib/protocols/stripe'
import { getProtocol, isAdminUser } from '@/lib/protocols/protocols'
import { hasActivePurchase } from '@/lib/protocols/purchase'

// POST { protocol: 'neutralize', promo?: 'CODE', resume?: true }
// Answers { url } (go to Stripe), { redirect } (go to another page on this site) or { error }.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const slug = typeof body?.protocol === 'string' ? body.protocol : ''
  const promo = typeof body?.promo === 'string' ? body.promo.trim().slice(0, 64) : ''
  if (!slug) return NextResponse.json({ error: 'missing_protocol' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // The public only sees live and waitlist protocols; the admin can also reach a draft (to test checkout).
  const protocol = await getProtocol(supabase, slug)
  if (!protocol) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (protocol.status !== 'live' && !isAdminUser(user)) {
    return NextResponse.json({ error: 'not_available' }, { status: 403 })
  }

  if (!user) {
    // Sign up (or in), then come straight back and carry on to checkout.
    const back = `/offers/${slug}?checkout=1${promo ? `&code=${encodeURIComponent(promo)}` : ''}`
    return NextResponse.json({ redirect: `/signup?next=${encodeURIComponent(back)}` })
  }

  if (await hasActivePurchase(user.id, protocol.id)) {
    return NextResponse.json({ redirect: '/dashboard' })
  }

  // Each protocol requires the one before it.
  if (protocol.prerequisite_protocol_id && !(await hasActivePurchase(user.id, protocol.prerequisite_protocol_id))) {
    return NextResponse.json({ error: 'prerequisite_missing' }, { status: 409 })
  }

  const price = priceIdFor(slug)
  if (!price || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }

  const stripe = getStripe()

  // A typed code is checked here so a typo is reported on the offer page, not on Stripe's.
  // Stripe allows a session to carry a discount OR show its own code box, not both.
  let discounts: { promotion_code: string }[] | undefined
  if (promo) {
    const found = await stripe.promotionCodes.list({ code: promo, active: true, limit: 1 })
    if (found.data.length === 0) return NextResponse.json({ error: 'invalid_code' }, { status: 400 })
    discounts = [{ promotion_code: found.data[0].id }]
  }

  // Use the address the student is on (works on previews and locally, not just production).
  const origin = new URL(request.url).origin
  const metadata = { user_id: user.id, protocol_slug: slug, protocol_id: protocol.id }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price, quantity: 1 }],
    ...(discounts ? { discounts } : { allow_promotion_codes: true }),
    success_url: `${origin}/offers/${slug}/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/offers/${slug}`,
    customer_email: user.email,
    client_reference_id: user.id,
    metadata,
    payment_intent_data: { metadata },
  })

  return NextResponse.json({ url: session.url })
}
