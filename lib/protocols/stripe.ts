import Stripe from 'stripe'

let client: Stripe | null = null

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return (client ??= new Stripe(key))
}

/**
 * The Stripe price for a protocol lives in an environment variable, not the database:
 * Preview and Production share one database but use different Stripe modes (test / live).
 * STRIPE_PRICE_NEUTRALIZE, STRIPE_PRICE_NEUROGOAL, ... (Neutralize also accepts the old name.)
 */
export function priceIdFor(slug: string): string | null {
  const named = process.env[`STRIPE_PRICE_${slug.toUpperCase()}`]
  const legacy = slug === 'neutralize' ? process.env.STRIPE_NEUTRALIZE_PRICE_ID : undefined
  return named || legacy || null
}

export type PriceDisplay = { formatted: string; amount: number; currency: string }

const CACHE_MS = 5 * 60 * 1000
const ERROR_CACHE_MS = 30 * 1000
const priceCache = new Map<string, { at: number; ttl: number; value: PriceDisplay | null }>()

/** The price to show on the offer page, read from Stripe (so the page can never disagree with checkout). */
export async function getPriceDisplay(slug: string): Promise<PriceDisplay | null> {
  const id = priceIdFor(slug)
  if (!id || !process.env.STRIPE_SECRET_KEY) return null

  const hit = priceCache.get(id)
  if (hit && Date.now() - hit.at < hit.ttl) return hit.value

  try {
    const price = await getStripe().prices.retrieve(id)
    if (price.unit_amount == null || !price.active) throw new Error('Price is not a fixed, active amount')
    const whole = price.unit_amount % 100 === 0
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    }).format(price.unit_amount / 100)
    const value = { formatted, amount: price.unit_amount, currency: price.currency }
    priceCache.set(id, { at: Date.now(), ttl: CACHE_MS, value })
    return value
  } catch (err) {
    console.error('Could not read the Stripe price for', slug, err)
    priceCache.set(id, { at: Date.now(), ttl: ERROR_CACHE_MS, value: null })
    return null
  }
}
