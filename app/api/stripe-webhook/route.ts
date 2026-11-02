import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/protocols/stripe'
import { recordPurchase } from '@/lib/protocols/purchase'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook is not configured' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // completed: card payments are already paid; a delayed method (bank debit) is 'unpaid' here and
  // arrives later as async_payment_succeeded. recordPurchase ignores anything not yet paid.
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    try {
      const result = await recordPurchase(event.data.object as Stripe.Checkout.Session)
      if (!result.ok && result.reason !== 'unpaid') {
        console.error('Stripe session not recorded:', result.reason, (event.data.object as Stripe.Checkout.Session).id)
      }
    } catch (err) {
      // Answer with an error so Stripe retries instead of the purchase being silently lost.
      console.error('Recording a purchase failed', err)
      return NextResponse.json({ error: 'Could not record purchase' }, { status: 500 })
    }
  }

  // Refunds are deliberately not handled yet: whether a refund removes access is a pending decision.
  return NextResponse.json({ received: true })
}
