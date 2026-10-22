import Link from 'next/link'
import { OFFER } from '@/content/offers/neutralize'
import { PROTOCOL_CARDS } from '@/content/protocols'
import EnrollPanel from './EnrollPanel'

const h2Style = { fontSize: 'clamp(32px, 4.6vw, 44px)', lineHeight: 1.08, letterSpacing: '-0.035em', color: 'var(--ny-ink)' } as const
const eyebrowStyle = { color: 'var(--ny-tide)' } as const

function SectionHead({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 max-w-[760px]">
      <span className="text-[15px] font-medium" style={eyebrowStyle}>{eyebrow}</span>
      <h2 className="m-0" style={h2Style}>{title}</h2>
      {children}
    </div>
  )
}

export default function NeutralizeOffer({
  price,
  hasIntroVideo,
  openSlugs,
  initialCode,
  autoStart,
}: {
  price: string | null
  hasIntroVideo: boolean
  /** slugs of other protocols whose pages are open to the public */
  openSlugs: string[]
  initialCode: string
  autoStart: boolean
}) {
  const o = OFFER
  const later = PROTOCOL_CARDS.filter((p) => p.slug !== 'neutralize')

  return (
    <div className="max-w-[1120px] mx-auto px-5 sm:px-8 pt-24 pb-[104px] flex flex-col gap-[88px] sm:gap-[112px]">
      {/* Hero: a dark panel inside the page */}
      <section
        className="rounded-[28px] overflow-hidden grid md:grid-cols-2 text-white"
        style={{ background: 'var(--ny-night)' }}
      >
        <div className="flex flex-col gap-5 p-8 sm:p-14">
          <Link href="/protocols" className="text-sm" style={{ color: 'var(--ny-ink-4)' }}>‹ All protocols</Link>
          <span className="text-sm font-medium" style={{ color: 'var(--ny-tide-tint)' }}>{o.hero.eyebrow}</span>
          <h1 className="m-0" style={{ fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: 1.02, letterSpacing: '-0.04em', color: '#fff' }}>
            {o.hero.title}
          </h1>
          <p className="m-0 text-[22px] leading-snug" style={{ color: 'var(--ny-mist)' }}>{o.hero.lede}</p>
          <p className="m-0 text-[17px] leading-relaxed max-w-[540px]" style={{ color: 'var(--ny-line-strong)' }}>{o.hero.body}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a href="#enroll" className="ny-btn ny-btn-primary" style={{ background: '#fff', color: 'var(--ny-ink)' }}>
              {price ? `Enroll — ${price}` : 'Enroll'}
            </a>
            {hasIntroVideo && (
              <a href="#intro" className="ny-btn ny-btn-glass">▶ Watch the 3-minute introduction</a>
            )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm" style={{ color: 'var(--ny-ink-4)' }}>
            {o.hero.facts.map((f) => <span key={f}>{f}</span>)}
          </div>
        </div>
        <div className="relative min-h-[260px] md:min-h-full" style={{ background: 'var(--ny-night-2)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={o.hero.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </section>

      {/* The problem */}
      <section className="flex flex-col gap-8">
        <SectionHead eyebrow={o.problem.eyebrow} title={o.problem.title}>
          <p className="m-0 text-[18px] leading-relaxed" style={{ color: 'var(--ny-ink-2)' }}>{o.problem.body}</p>
        </SectionHead>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {o.problem.steps.map((s) => (
            <div
              key={s.title}
              className="rounded-[18px] p-7 flex flex-col gap-2.5"
              style={s.stall ? { background: '#fff', border: '1px solid var(--ny-coral)' } : { background: 'var(--ny-mist)' }}
            >
              <span className="text-[13px]" style={{ color: s.stall ? 'var(--ny-coral)' : 'var(--ny-ink-3)' }}>{s.label}</span>
              <h3 className="m-0 text-[22px]" style={{ letterSpacing: '-0.01em', color: 'var(--ny-ink)' }}>{s.title}</h3>
              <p className="m-0 text-[15px]" style={{ color: 'var(--ny-ink-2)' }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The approach */}
      <section className="flex flex-col gap-8">
        <SectionHead eyebrow={o.approach.eyebrow} title={o.approach.title} />
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div className="rounded-[28px] p-9 flex flex-col gap-3.5 border" style={{ borderColor: 'var(--ny-line)' }}>
            <span className="text-[13px] font-medium" style={{ color: 'var(--ny-ink-3)' }}>{o.approach.most.label}</span>
            <h3 className="m-0 text-[26px]" style={{ letterSpacing: '-0.02em', color: 'var(--ny-ink)' }}>{o.approach.most.title}</h3>
            <p className="m-0" style={{ color: 'var(--ny-ink-2)' }}>{o.approach.most.body}</p>
          </div>
          <div className="rounded-[28px] p-9 flex flex-col gap-3.5 text-white" style={{ background: 'var(--ny-night)' }}>
            <span className="text-[13px] font-medium" style={{ color: 'var(--ny-tide-tint)' }}>{o.approach.neutralize.label}</span>
            <h3 className="m-0 text-[26px]" style={{ letterSpacing: '-0.02em', color: '#fff' }}>{o.approach.neutralize.title}</h3>
            <p className="m-0" style={{ color: 'var(--ny-line-strong)' }}>{o.approach.neutralize.body}</p>
          </div>
        </div>
      </section>

      {/* What you will be able to do */}
      <section className="flex flex-col gap-8">
        <SectionHead eyebrow={o.outcomes.eyebrow} title={o.outcomes.title} />
        <div className="grid gap-x-6 gap-y-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          {o.outcomes.items.map((it) => (
            <div key={it.title} className="flex flex-col gap-2 pt-[18px] border-t" style={{ borderColor: 'var(--ny-ink)' }}>
              <h3 className="m-0 text-[19px]" style={{ color: 'var(--ny-ink)' }}>{it.title}</h3>
              <p className="m-0 text-[15px]" style={{ color: 'var(--ny-ink-2)' }}>{it.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Inside the protocol */}
      <section className="flex flex-wrap gap-12">
        <div className="flex-[1_1_360px] min-w-0 flex flex-col gap-3">
          <span className="text-[15px] font-medium" style={eyebrowStyle}>{o.inside.eyebrow}</span>
          <h2 className="m-0" style={h2Style}>{o.inside.title}</h2>
          <p className="m-0 text-[17px]" style={{ color: 'var(--ny-ink-2)' }}>{o.inside.body}</p>
        </div>
        <ol className="flex-[1.3_1_480px] min-w-0 list-none m-0 p-0 flex flex-col">
          {o.inside.modules.map((m, i) => (
            <li
              key={m.n}
              className="flex justify-between gap-4 py-[18px] border-t"
              style={{ borderColor: 'var(--ny-line)', ...(i === o.inside.modules.length - 1 ? { borderBottom: '1px solid var(--ny-line)' } : {}) }}
            >
              <span style={{ color: 'var(--ny-ink)' }}><b>{m.n}</b>&nbsp;&nbsp;{m.title}</span>
              <span className="text-sm shrink-0" style={{ color: 'var(--ny-ink-3)' }}>{m.meta}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* What to expect / care */}
      <section className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="rounded-[28px] p-9 flex flex-col gap-3.5" style={{ background: 'var(--ny-tide-tint)' }}>
          <span className="text-[13px] font-medium" style={{ color: 'var(--ny-tide-deep)' }}>{o.expect.label}</span>
          <h3 className="m-0 text-[26px]" style={{ letterSpacing: '-0.02em', color: 'var(--ny-ink)' }}>{o.expect.title}</h3>
          <p className="m-0" style={{ color: 'var(--ny-ink-2)' }}>{o.expect.body}</p>
        </div>
        <div className="rounded-[28px] p-9 flex flex-col gap-3.5 border" style={{ borderColor: 'var(--ny-line)' }}>
          <span className="text-[13px] font-medium" style={{ color: 'var(--ny-coral)' }}>{o.care.label}</span>
          <h3 className="m-0 text-[26px]" style={{ letterSpacing: '-0.02em', color: 'var(--ny-ink)' }}>{o.care.title}</h3>
          <p className="m-0" style={{ color: 'var(--ny-ink-2)' }}>{o.care.body}</p>
        </div>
      </section>

      {/* Founder */}
      <section className="flex flex-wrap gap-12 items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={o.founder.portrait} alt="Peter J Hill" width={160} height={160}
          className="shrink-0 w-[160px] h-[160px] rounded-full object-cover" />
        <figure className="m-0 flex-[1_1_480px] min-w-0 flex flex-col gap-3.5">
          <blockquote className="m-0 font-medium" style={{ fontSize: 'clamp(22px, 3vw, 28px)', lineHeight: 1.3, letterSpacing: '-0.02em', color: 'var(--ny-ink)' }}>
            {o.founder.quote}
          </blockquote>
          <figcaption className="text-[15px]" style={{ color: 'var(--ny-ink-3)' }}>{o.founder.byline}</figcaption>
        </figure>
      </section>

      {/* Enroll */}
      <section id="enroll" className="flex flex-wrap gap-8 rounded-[28px] p-6 sm:p-12 scroll-mt-20" style={{ background: 'var(--ny-mist)' }}>
        <div className="flex-[1_1_360px] min-w-0 flex flex-col gap-3.5">
          <span className="text-[15px] font-medium" style={eyebrowStyle}>{o.enroll.eyebrow}</span>
          <h2 className="m-0" style={{ fontSize: 'clamp(30px, 4vw, 40px)', lineHeight: 1.08, letterSpacing: '-0.035em', color: 'var(--ny-ink)' }}>
            {o.enroll.title}
          </h2>
          <ul className="list-none m-0 p-0 pt-1.5 flex flex-col gap-2.5 text-[15px]" style={{ color: 'var(--ny-ink-2)' }}>
            {o.enroll.includes.map((t) => (
              <li key={t}><span style={{ color: 'var(--ny-leaf)' }}>✓</span>&nbsp;&nbsp;{t}</li>
            ))}
          </ul>
        </div>
        <div className="flex-[1_1_360px] min-w-0">
          <EnrollPanel slug="neutralize" price={price} refund={o.enroll.refund} initialCode={initialCode} autoStart={autoStart} />
        </div>
      </section>

      {/* FAQ (native details: works without scripts and with a keyboard) */}
      <section className="flex flex-wrap gap-12">
        <div className="flex-[1_1_300px] min-w-0">
          <h2 className="m-0" style={{ fontSize: 36, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--ny-ink)' }}>Questions</h2>
        </div>
        <div className="flex-[2_1_520px] min-w-0 flex flex-col">
          {o.faqs.map((f, i) => (
            <details key={f.q} className="group border-t" style={{ borderColor: 'var(--ny-line)' }} {...(i === 0 ? { open: true } : {})}>
              <summary className="flex justify-between gap-4 py-5 cursor-pointer list-none text-[17px] font-medium" style={{ color: 'var(--ny-ink)' }}>
                <span>{f.q}</span>
                <span aria-hidden style={{ color: 'var(--ny-tide)' }}>
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">−</span>
                </span>
              </summary>
              <p className="m-0 pb-[22px] max-w-[640px]" style={{ color: 'var(--ny-ink-2)' }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* What comes after */}
      <section className="flex flex-col gap-5">
        <span className="text-sm font-medium" style={{ color: 'var(--ny-ink-3)' }}>{o.after.label}</span>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {later.map((p) => (
            <div key={p.slug} className="rounded-[18px] p-6 flex flex-col gap-2 border" style={{ borderColor: 'var(--ny-line)' }}>
              <span className="text-[13px]" style={eyebrowStyle}>{p.n} · {p.tag}</span>
              <h3 className="m-0 text-xl" style={{ color: 'var(--ny-ink)' }}>{p.full.replace(/^The | Protocol$/g, '')}</h3>
              <p className="m-0 text-sm" style={{ color: 'var(--ny-ink-2)' }}>{p.lede}</p>
              {openSlugs.includes(p.slug) && (
                <Link href={`/offers/${p.slug}`} className="text-sm pt-1.5" style={{ color: 'var(--ny-tide)' }}>Join the waitlist</Link>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
