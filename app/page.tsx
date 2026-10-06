import Link from 'next/link'
import HomeHero from '@/components/HomeHero'
import { COMMITMENTS as PILLARS } from '@/lib/commitments'

const MOSAIC = [
  { img: '/redesign-placeholders/surf.jpg', label: 'Flow', span: 'row-span-2' },
  { img: '/redesign-placeholders/woman.jpg', label: 'Awe', span: '' },
  { img: '/redesign-placeholders/forest.jpg', label: 'Depth', span: '' },
  { img: '/redesign-placeholders/lab.jpg', label: 'Focus', span: 'col-span-2' },
]

const PROTOCOLS = [
  { n: '01', name: 'Neutralize', tag: 'Foundational', img: '/redesign-placeholders/hand.jpg' },
  { n: '02', name: 'NeuroGoal', tag: 'Tangible results', img: '/redesign-placeholders/forest.jpg' },
  { n: '03', name: 'Reality Distortion', tag: 'Advanced', img: '/redesign-placeholders/grass.jpg' },
  { n: '04', name: 'NeuroFinity', tag: 'The frontier', img: '/redesign-placeholders/sunwater.jpg' },
]

// Previous wording, kept here so it is easy to restore:
//   Book image: /redesign-placeholders/notebook.jpg (placeholder)
//   Book text: one paragraph only (the second paragraph "But attention management is only
//   the beginning..." was added 2026-10-05)
//   Book button: "Register Interest"
//   Quote: "The techniques do not ask you to believe anything. They simply ask you to
//   observe — precisely, repeatedly, and deliberately."
export default function HomePage() {
  return (
    <div className="ny-scope bg-white">
      <HomeHero />

      {/* Commitments */}
      <section className="max-w-[1120px] mx-auto px-8 pt-[140px] pb-[120px]">
        <div className="ny-eyebrow mb-3.5">NeuroYou Commitments</div>
        <h2 className="ny-display max-w-[780px]" style={{ textWrap: 'balance' }}>
          Four commitments. No belief required.
        </h2>
        <div className="grid gap-x-10 gap-y-12 mt-[72px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
          {PILLARS.map((p) => (
            <div key={p.n}>
              <div className="ny-caption font-medium">{p.n}</div>
              <h3 className="mt-2.5 mb-2.5 text-2xl leading-tight font-semibold" style={{ letterSpacing: '-0.015em', color: 'var(--ny-ink)' }}>
                {p.title}
              </h3>
              <p className="ny-body">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Image mosaic */}
      <section className="px-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ gridTemplateRows: 'repeat(2, 300px)' }}>
          {MOSAIC.map((m) => (
            <div key={m.label} className={`relative rounded-[28px] overflow-hidden ${m.span}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.img} alt="" className="w-full h-full object-cover" />
              <div
                className="absolute left-6 bottom-5 text-white font-semibold text-lg pointer-events-none"
                style={{ textShadow: '0 1px 12px rgba(0,0,0,.35)' }}
              >
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Protocols */}
      <section className="max-w-[1120px] mx-auto px-8 pt-[160px] pb-[120px]">
        <div className="flex flex-wrap gap-8 sm:gap-16 justify-between items-end">
          <div className="max-w-[640px]">
            <div className="ny-eyebrow mb-3.5">The NeuroYou Protocols</div>
            <h2 className="ny-display">Four Protocols. One Direction: Inward.</h2>
          </div>
          <p className="ny-body max-w-[400px]">
            Structured courses, taken in sequence. Each develops the skill the next one needs. Built from thirty years of direct practice.
          </p>
        </div>
        <div className="grid gap-4 mt-16" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {PROTOCOLS.map((p) => (
            <Link key={p.n} href="/protocols" className="ny-card block">
              <div className="h-[260px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.img} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="px-6 pt-5 pb-7">
                <div className="ny-caption font-medium" style={{ color: 'var(--ny-tide)' }}>{p.n} · {p.tag}</div>
                <div className="text-2xl font-semibold mt-1.5" style={{ letterSpacing: '-0.02em', color: 'var(--ny-ink)' }}>{p.name}</div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-9">
          <Link href="/protocols" className="ny-text-link text-lg">View the protocols</Link>
        </div>
      </section>

      {/* Book */}
      <section style={{ background: 'var(--ny-mist)' }}>
        <div className="max-w-[1120px] mx-auto px-8 py-[140px] grid gap-16 items-center" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <div className="h-[520px] rounded-[28px] overflow-hidden bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/reality-check-cover.webp"
              alt="Reality Check by Peter J Hill. How meditation moved from mysticism to neuroscience."
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="ny-eyebrow mb-3.5">The book</div>
            <h2 className="ny-title">Reality Check</h2>
            <p className="ny-body mt-6" style={{ textWrap: 'pretty' }}>
              How meditation moved from eastern mysticism to Silicon Valley, and why it is now framed by neuroscience. Peter J Hill breaks consciousness into senses, skills, and habits, with simple exercises that take a few minutes a day.
            </p>
            <p className="ny-body mt-4" style={{ textWrap: 'pretty' }}>
              But attention management is only the beginning. Once you have learnt to more effectively manage your attention, the book explores how the ordinary structure of waking consciousness can be deliberately taken apart, one sense at a time, and what it feels like on the other side. It is the full journey, from the first exercise to the deepest states, with the scientist&rsquo;s hat firmly on.
            </p>
            <div className="mt-8">
              <Link href="/connect" className="ny-btn ny-btn-primary">Let me know when it&rsquo;s out</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="relative h-[640px] overflow-hidden" style={{ background: '#2C6E7F' }}>
        <div className="absolute inset-0 ny-ken-burns">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/redesign-placeholders/sunwater.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,.32)' }} />
        <div className="absolute inset-0 flex items-center justify-center px-8 pointer-events-none">
          <figure className="m-0 max-w-[900px] text-center text-white">
            <blockquote className="m-0 font-medium" style={{ fontSize: 40, lineHeight: 1.2, letterSpacing: '-0.025em', textWrap: 'balance' }}>
              &ldquo;NeuroYou techniques do not ask you to believe anything. They simply ask you to observe — precisely, repeatedly, and deliberately.&rdquo;
            </blockquote>
            <figcaption className="mt-7 text-[15px] opacity-90">Peter J Hill, founder of NeuroYou</figcaption>
          </figure>
        </div>
      </section>

      {/* Access cards */}
      <section className="max-w-[1120px] mx-auto px-8 py-[140px]">
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <Link href="/exercises" className="ny-card block">
            <div className="h-[340px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/redesign-placeholders/hand.jpg" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="px-8 pt-7 pb-[34px]">
              <div className="ny-caption font-medium" style={{ color: 'var(--ny-tide)' }}>Free</div>
              <div className="text-[32px] font-semibold mt-1" style={{ letterSpacing: '-0.03em', color: 'var(--ny-ink)' }}>Learn</div>
              <p className="ny-body mt-2.5">Short text and audio practices for attention, sensation, and emotional state. Begin anywhere.</p>
            </div>
          </Link>
          <Link href="/blog" className="ny-card block">
            <div className="h-[340px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/redesign-placeholders/grass.jpg" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="px-8 pt-7 pb-[34px]">
              <div className="ny-caption font-medium" style={{ color: 'var(--ny-tide)' }}>Free</div>
              <div className="text-[32px] font-semibold mt-1" style={{ letterSpacing: '-0.03em', color: 'var(--ny-ink)' }}>Explore</div>
              <p className="ny-body mt-2.5">Essays on consciousness, perception, and the neuroscience of emotion.</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
