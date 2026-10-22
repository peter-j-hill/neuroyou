import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { PROTOCOL_CARDS } from '@/content/protocols'

// Statuses change rarely; re-read at most once a minute.
export const revalidate = 60

export const metadata = {
  title: 'Protocols — NeuroYou',
  description: 'The NeuroYou Protocols — structured online courses for direct consciousness work.',
}

// Page copy from the redesign handoff (a suggested rewrite). Previous strings,
// kept here so they are easy to restore:
//
//   intro: "Structured online courses for direct consciousness work. Each protocol
//   follows a fixed sequence — no skipping, no shortcuts. Built for people who want
//   results, not insights."
//
//   Neutralize: "Most emotional suffering isn't a character flaw or a chemical
//   imbalance — it's a structural feature of how consciousness processes experience.
//   The Neutralize Protocol is a rigorous, neuroscience-informed method for working
//   directly with that structure. Rather than managing emotions or reframing them,
//   Neutralize targets the underlying architecture that generates unwanted emotional
//   states and systematically dissolves it. This is the foundational technology of
//   the NeuroYou system — the core skill everything else is built upon."
//
//   NeuroGoal: "Setting goals is trivial. Achieving them is a consciousness problem.
//   The NeuroGoal Protocol is a strategic process for precisely aligning intention and
//   attention on a desired outcome, then applying Neutralize to remove the emotional
//   interference — fear, self-doubt, ambivalence — that derails most goal-directed
//   effort before it begins. Where conventional goal-setting works on the surface of
//   behavior, NeuroGoal works at the level of the consciousness that generates
//   behavior."
//
//   Reality Distortion: "Consciousness is not a single layer. The Reality Distortion
//   Protocol is an advanced technique for systematically exploring its full
//   architecture — personal, interpersonal, collective, and energetic — and bringing
//   subconscious programming into coherent alignment. The result is not a vague sense
//   of improvement, but a measurable shift in how reality is perceived and engaged
//   with: a life that generates genuine delight and awe rather than quiet friction.
//   This is sophisticated inner research for serious practitioners."
//
//   NeuroFinity: "The NeuroFinity Protocol is the most advanced instrument in the
//   NeuroYou system. It is a structured methodology for temporarily suspending
//   ordinary consciousness — not through belief or suggestion, but through precise,
//   reproducible technique — to access deeply transcendent states. What most
//   traditions treat as rare, accidental, or spiritually mediated, NeuroFinity makes
//   systematic. For researchers of consciousness who want to map the full territory of
//   subjective experience, this is the frontier."
const COPY = {
  eyebrow: 'The NeuroYou Protocols',
  heading: 'Protocols.',
  intro: 'Four structured courses for direct consciousness work. Taken in sequence, with no shortcuts. Built for results.',
}


// Buttons follow each protocol's status in the database: a live protocol links to its offer page
// ("See the protocol"), a waitlist one to its waitlist page ("Join the waitlist"), anything else
// keeps the original "Coming Soon" button to the Connect form. So nothing links to a page that
// is not open to the public yet. (Anonymous reads only ever see live and waitlist protocols.)
async function loadStatuses(): Promise<Record<string, string>> {
  try {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data } = await db.from('protocols').select('slug, status')
    return Object.fromEntries((data ?? []).map((r) => [r.slug, r.status]))
  } catch {
    return {}
  }
}

const BUTTON = {
  live: { label: 'See the protocol', href: (slug: string) => `/offers/${slug}` },
  waitlist: { label: 'Join the waitlist', href: (slug: string) => `/offers/${slug}` },
} as const

export default async function ProtocolsPage() {
  const statuses = await loadStatuses()
  return (
    <div className="ny-scope bg-white">
      {/* Hero — bleeds under the fixed nav (cancels main's pt-14) */}
      <section className="relative h-[72vh] min-h-[560px] overflow-hidden -mt-14" style={{ background: '#2C6E7F' }}>
        <div className="absolute inset-0 ny-ken-burns">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/redesign-placeholders/sunwater.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(0,0,0,.5), rgba(0,0,0,0) 65%), ' +
              'linear-gradient(180deg, rgba(0,0,0,.42), rgba(0,0,0,0) 30%, rgba(0,0,0,.35))',
          }}
        />
        <div className="absolute left-0 right-0 bottom-[72px] px-8 pointer-events-none">
          <div className="max-w-[1120px] mx-auto text-white">
            <div className="text-[15px] font-medium opacity-90 mb-3.5">{COPY.eyebrow}</div>
            <h1 className="ny-hero m-0" style={{ color: '#fff' }}>{COPY.heading}</h1>
            <p className="mt-5 text-xl leading-normal max-w-[560px] opacity-95">{COPY.intro}</p>
          </div>
        </div>
      </section>

      {PROTOCOL_CARDS.map((p, i) => (
        <section
          key={p.n}
          className={`max-w-[1120px] mx-auto px-8 pt-[120px] flex flex-wrap gap-14 items-center ${i % 2 ? 'flex-row-reverse' : ''}`}
        >
          <div className="flex-[1_1_420px] h-[320px] sm:h-[520px] rounded-[28px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.img} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-[1_1_380px]">
            <div className="text-[15px] font-medium" style={{ color: 'var(--ny-tide)' }}>{p.n} · {p.tag}</div>
            <h2
              className="mt-3 font-semibold"
              style={{ fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.05, letterSpacing: '-0.035em', color: 'var(--ny-ink)' }}
            >
              {p.full}
            </h2>
            <p
              className="mt-4 font-medium"
              style={{ fontSize: 'clamp(20px, 2.6vw, 24px)', lineHeight: 1.35, letterSpacing: '-0.01em', color: 'var(--ny-ink)' }}
            >
              {p.lede}
            </p>
            <p className="mt-4 text-[17px] leading-relaxed" style={{ color: 'var(--ny-ink-3)' }}>{p.body}</p>
            <div className="flex flex-wrap gap-4 mt-7 items-center">
              {(() => {
                const b = BUTTON[statuses[p.slug] as keyof typeof BUTTON]
                return (
                  <Link href={b ? b.href(p.slug) : '/connect'} className="ny-btn ny-btn-primary" style={{ padding: '12px 22px' }}>
                    {b ? b.label : 'Coming Soon'}
                  </Link>
                )
              })()}
              <span className="text-sm" style={{ color: 'var(--ny-ink-4)' }}>{p.req}</span>
            </div>
          </div>
        </section>
      ))}

      <div className="h-[140px]" />
    </div>
  )
}
