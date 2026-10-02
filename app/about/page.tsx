import Link from 'next/link'
import { COMMITMENTS } from '@/lib/commitments'

// Page copy from the redesign handoff (the bio is a DRAFT for Peter to approve).
// The wide full-bleed image in the handoff was removed at Peter's request; only the
// portrait remains. Previous wording, kept here so it is easy to restore:
//
//   Founder block (eyebrow "The founder", name "Peter J Hill", "Founder, NeuroYou"):
//     "NeuroYou began as a personal meditation practice over 30 years ago. After years
//     of frustration with the way meditation and self development techniques were
//     practiced and taught, a refined approach was developed for directing attention
//     and intention — first for my own goals, then as a body of techniques precise
//     enough to teach. NeuroYou is the final result of multiple decades of this
//     painstaking process."
//     "The work is deliberately stripped of the dogma, mysticism or pseudoscience that
//     is often found when studying personal consciousness."
//
//   "The work": "NeuroYou treats attention, intention, and awareness as trainable
//     structures rather than states to be stumbled into. The work is organised as a
//     sequence of Protocols, released in order, because each depends on the skills built
//     before it." / "The sequence begins with a single foundational skill. From there it
//     extends outward — first to the achievement of personal goals, then to the systems
//     and relationships a life is built from, and finally to the structure of awareness
//     itself. The order is not arbitrary. The later work is more demanding and more
//     destabilising, and it rests on the confidence and competence the earlier work
//     provides." / "Each Protocol opens with a white paper: a theoretical statement,
//     openly readable, of what it does and why. The techniques themselves are unlocked
//     in turn. You may read freely, but you practise in order."
//
//   "The stance": "This is deliberately not a mindfulness app. There are no streaks, no
//     badges, no supermarket-aisle serenity. Progress, where it is recorded at all, is a
//     plain note of what was completed and when — not motivational theatre." / "The
//     register is closer to a research notebook than a wellness product, because the
//     subject deserves that seriousness — and because the people this was built for were
//     put off by everything else on offer."
const COPY = {
  eyebrow: 'About',
  heading: 'An independent laboratory for consciousness.',
  lede: 'NeuroYou turns thirty years of daily practice, across dozens of techniques, into precise methods you can test for yourself. Not spiritual. Not wellness. Neuroscience-grounded.',
  founderEyebrow: 'Founder',
  founderName: 'Peter J Hill',
  bio1: 'Peter has practised meditation daily for more than thirty years and has spent thousands of hours experimenting with and observing consciousness. He trained as a designer and works as a program manager in large technology companies. He brings the same discipline to inner research: clear structure, careful testing, and no mysticism.',
}

export default function AboutPage() {
  return (
    <div className="ny-scope bg-white">
      <section className="max-w-[1120px] mx-auto px-8 pt-24 pb-12">
        <div className="ny-eyebrow mb-3.5">{COPY.eyebrow}</div>
        <h1 className="ny-page-title max-w-[900px]" style={{ textWrap: 'balance' }}>{COPY.heading}</h1>
        <p className="ny-lede mt-7 max-w-[720px]" style={{ fontSize: 'clamp(19px, 2.6vw, 24px)', lineHeight: 1.4 }}>
          {COPY.lede}
        </p>
      </section>

      <section
        className="max-w-[1120px] mx-auto px-8 pt-12 pb-[140px] grid gap-16 items-center"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}
      >
        <div className="h-[420px] sm:h-[560px] rounded-[28px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/peter-hill.jpg" alt="Peter J Hill" className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="ny-eyebrow mb-3.5">{COPY.founderEyebrow}</div>
          <h2 style={{ fontSize: 'clamp(34px, 5vw, 48px)', lineHeight: 1.05, letterSpacing: '-0.035em', color: 'var(--ny-ink)' }}>
            {COPY.founderName}
          </h2>
          <p className="mt-5 text-[19px] leading-relaxed" style={{ color: 'var(--ny-ink-2)' }}>{COPY.bio1}</p>
          <p className="mt-4 text-[19px] leading-relaxed" style={{ color: 'var(--ny-ink-2)' }}>
            He is the author of <i>Reality Check</i> and the inventor of the NeuroYou Protocols.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Link href="/protocols" className="ny-btn ny-btn-primary" style={{ padding: '12px 22px' }}>The Protocols</Link>
            <Link href="/connect" className="ny-btn ny-btn-secondary" style={{ padding: '12px 22px' }}>Get in touch</Link>
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--ny-mist)' }}>
        <div className="max-w-[1120px] mx-auto px-8 py-[120px]">
          <h2 className="ny-title">Our commitments</h2>
          <div className="grid gap-10 mt-12" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
            {COMMITMENTS.map((c) => (
              <div key={c.n}>
                <div className="ny-caption font-medium">{c.n}</div>
                <h3 className="mt-2.5 mb-2.5 text-[21px]" style={{ letterSpacing: '-0.01em', color: 'var(--ny-ink)' }}>{c.title}</h3>
                <p className="m-0 text-[15px] leading-relaxed" style={{ color: 'var(--ny-ink-3)' }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
