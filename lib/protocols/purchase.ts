import type Stripe from 'stripe'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getStripe } from './stripe'

/** Service-role client: bypasses row-level security. Server code only. */
export function serviceClient() {
  return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export type RecordResult =
  | { ok: true; created: boolean; protocolSlug: string; duplicatePayment?: boolean }
  | { ok: false; reason: 'unpaid' | 'not_ours' | 'unknown_protocol' | 'unknown_user' }

const idOf = <T extends { id: string }>(v: string | T | null | undefined) => (typeof v === 'string' ? v : v?.id ?? null)

/**
 * The ONLY place that writes a purchase from Stripe. Used by the webhook and by the page
 * the student returns to after paying, so access appears at once and a lost webhook never
 * leaves someone locked out. Safe to call any number of times for the same session.
 */
export async function recordPurchase(session: Stripe.Checkout.Session): Promise<RecordResult> {
  // 'no_payment_required' is what Checkout reports when a 100% promo code makes the total zero.
  if (session.mode !== 'payment' || !['paid', 'no_payment_required'].includes(session.payment_status)) {
    return { ok: false, reason: 'unpaid' }
  }

  const userId = session.metadata?.user_id
  // Sessions created by the first version of checkout carried only user_id (Neutralize).
  const slug = session.metadata?.protocol_slug ?? (userId ? 'neutralize' : null)
  if (!userId || !slug) return { ok: false, reason: 'not_ours' }

  const db = serviceClient()

  const { data: protocol, error: protocolErr } = await db.from('protocols').select('id, slug').eq('slug', slug).maybeSingle()
  if (protocolErr) throw protocolErr
  if (!protocol) return { ok: false, reason: 'unknown_protocol' }

  const { data: profile, error: profileErr } = await db.from('profiles').select('id').eq('id', userId).maybeSingle()
  if (profileErr) throw profileErr
  if (!profile) return { ok: false, reason: 'unknown_user' }

  // Best effort: the readable promo code (Stripe only gives its id on the session).
  let promoCode: string | null = null
  const promoId = idOf(session.discounts?.[0]?.promotion_code)
  if (promoId) {
    try {
      promoCode = (await getStripe().promotionCodes.retrieve(promoId)).code
    } catch (err) {
      console.error('Could not read promotion code', promoId, err)
    }
  }

  const { error } = await db.from('protocol_purchases').insert({
    user_id: userId,
    email: session.customer_details?.email ?? session.customer_email ?? null,
    protocol_id: protocol.id,
    source: 'stripe',
    status: 'active',
    stripe_session_id: session.id,
    stripe_payment_intent_id: idOf(session.payment_intent),
    amount_total: session.amount_total,
    amount_discount: session.total_details?.amount_discount ?? null,
    currency: session.currency,
    promo_code: promoCode,
    livemode: session.livemode,
  })

  let created = true
  let duplicatePayment = false
  if (error) {
    if (error.code !== '23505') throw error // anything but "already recorded" must surface, so Stripe retries
    created = false
    if (error.message.includes('protocol_purchases_one_active')) {
      // Paid twice for the same protocol: access is already in place; this needs a manual refund.
      duplicatePayment = true
      console.error('Duplicate payment for protocol', slug, 'user', userId, 'session', session.id)
    }
  }

  // Transition: keep the old flag in step until the old pages are retired (Phase 3 stops reading it).
  if (slug === 'neutralize') {
    const { error: flagErr } = await db.from('profiles').update({ purchased_neutralize: true }).eq('id', userId)
    if (flagErr) console.error('Could not mirror purchased_neutralize', flagErr)
  }

  return { ok: true, created, protocolSlug: slug, ...(duplicatePayment ? { duplicatePayment } : {}) }
}

/** Does this person already hold an active purchase of the protocol? (server code, bypasses RLS) */
export async function hasActivePurchase(userId: string, protocolId: string): Promise<boolean> {
  const { data, error } = await serviceClient()
    .from('protocol_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('protocol_id', protocolId)
    .eq('status', 'active')
    .limit(1)
  if (error) throw error
  return (data ?? []).length > 0
}
