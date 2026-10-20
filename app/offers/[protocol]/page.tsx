import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProtocol, isAdminUser } from '@/lib/protocols/protocols'
import { hasActivePurchase } from '@/lib/protocols/purchase'
import { getPriceDisplay } from '@/lib/protocols/stripe'
import { PROTOCOL_CARDS } from '@/content/protocols'
import NeutralizeOffer from '@/components/protocols/NeutralizeOffer'
import WaitlistForm from '@/components/protocols/WaitlistForm'

export const dynamic = 'force-dynamic'

type Params = Promise<{ protocol: string }>
type Search = Promise<{ [key: string]: string | string[] | undefined }>

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

// Which protocols have a full sales page. The others show a waitlist page.
const SALES_PAGES = ['neutralize']

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { protocol: slug } = await params
  const protocol = await getProtocol(await createClient(), slug)
  if (!protocol) return {}
  return {
    title: `${protocol.title} Protocol — NeuroYou`,
    description: protocol.tagline ?? undefined,
    // A draft is only ever visible to the admin; keep it out of search results regardless.
    robots: protocol.status === 'draft' ? { index: false, follow: false } : undefined,
  }
}

export default async function OfferPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { protocol: slug } = await params
  const sp = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Row-level security hides drafts from everyone except the admin, so a draft is a 404 for the public.
  const protocol = await getProtocol(supabase, slug)
  if (!protocol) notFound()

  // Someone who already bought it has no use for the sales page.
  if (user && (await hasActivePurchase(user.id, protocol.id))) redirect('/dashboard')

  const isDraft = protocol.status === 'draft'
  const payment = first(sp.payment)

  const banner = (
    <>
      {isAdminUser(user) && isDraft && (
        <div className="max-w-[1120px] mx-auto px-5 sm:px-8 pt-20">
          <div className="rounded-[10px] px-4 py-3 text-sm" style={{ background: 'var(--ny-tide-tint)', color: 'var(--ny-tide-deep)' }}>
            Admin preview: this page is not public yet (the protocol is still a draft).
          </div>
        </div>
      )}
      {payment === 'pending' && (
        <div className="max-w-[1120px] mx-auto px-5 sm:px-8 pt-6">
          <div className="rounded-[10px] px-4 py-3 text-sm" style={{ background: 'var(--ny-mist)', color: 'var(--ny-ink-2)' }}>
            Your payment is still being confirmed. Access appears as soon as it clears; you can refresh this page in a minute.
          </div>
        </div>
      )}
      {payment === 'error' && (
        <div className="max-w-[1120px] mx-auto px-5 sm:px-8 pt-6">
          <div className="rounded-[10px] px-4 py-3 text-sm" role="alert" style={{ background: 'var(--ny-mist)', color: 'var(--ny-coral)' }}>
            We could not confirm your payment on this page. If you were charged, please contact us and we will sort it out.
          </div>
        </div>
      )}
    </>
  )

  // ── Sales page ─────────────────────────────────────────────────────────────
  if (SALES_PAGES.includes(slug) && protocol.status !== 'waitlist') {
    const price = await getPriceDisplay(slug)
    // Pages of the other protocols that are open to the public (the admin may see drafts too).
    const { data: others } = await supabase.from('protocols').select('slug, status').neq('slug', slug)
    const openSlugs = (others ?? []).filter((r) => r.status !== 'draft' || isAdminUser(user)).map((r) => r.slug)

    return (
      <div className="ny-scope bg-white">
        {banner}
        <NeutralizeOffer
          price={protocol.status === 'live' || isAdminUser(user) ? price?.formatted ?? null : null}
          hasIntroVideo={!!protocol.intro_video_ref}
          openSlugs={openSlugs}
          initialCode={first(sp.code)}
          autoStart={first(sp.checkout) === '1'}
        />
      </div>
    )
  }

  // ── Waitlist page ──────────────────────────────────────────────────────────
  const card = PROTOCOL_CARDS.find((c) => c.slug === slug)
  if (!card) notFound()
  const shortTitle = card.full.replace(/^The | Protocol$/g, '')

  return (
    <div className="ny-scope bg-white">
      {banner}
      <div className="max-w-[1120px] mx-auto px-5 sm:px-8 pt-24 pb-[120px] grid gap-14 md:grid-cols-2 items-center">
        <div>
          <Link href="/protocols" className="text-sm" style={{ color: 'var(--ny-tide)' }}>‹ All protocols</Link>
          <div className="mt-8 text-[15px] font-medium" style={{ color: 'var(--ny-tide)' }}>{card.n} · {card.tag}</div>
          <h1 className="m-0 mt-3" style={{ fontSize: 'clamp(38px, 5.5vw, 56px)', lineHeight: 1.05, letterSpacing: '-0.04em', color: 'var(--ny-ink)' }}>
            {card.full}.
          </h1>
          <p className="mt-4 mb-0 font-medium" style={{ fontSize: 'clamp(20px, 2.6vw, 24px)', lineHeight: 1.35, color: 'var(--ny-ink)' }}>{card.lede}</p>
          <p className="mt-4 mb-0 text-[17px] leading-relaxed" style={{ color: 'var(--ny-ink-3)' }}>{card.body}</p>
          <p className="mt-4 mb-0 text-sm" style={{ color: 'var(--ny-ink-4)' }}>{card.req}</p>
          <div className="mt-8">
            <h2 className="m-0 mb-4 text-[22px]" style={{ letterSpacing: '-0.02em', color: 'var(--ny-ink)' }}>Join the waitlist</h2>
            <WaitlistForm interest={`Waitlist: ${shortTitle}`} title={card.full} />
          </div>
        </div>
        <div className="h-[320px] md:h-[520px] rounded-[28px] overflow-hidden" style={{ background: 'var(--ny-tide-tint)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card.img} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  )
}
