import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-6">

      {/* Hero */}
      <section className="pt-28 pb-24 border-b border-[var(--border)]">
        <p className="label mb-10">
          <span className="node mr-3" />
          Consciousness Research / Active
        </p>

        <h1
          className="text-5xl sm:text-7xl font-light leading-none tracking-tight mb-6 text-[var(--white)]"
          style={{ letterSpacing: '-0.03em' }}
        >
          Modify your
          <br />
          <span className="text-[var(--blue)] text-glow-blue">perceptual</span>
          <br />
          architecture.
        </h1>

        <p className="text-sm font-light text-[var(--muted)] max-w-md leading-relaxed mt-8 mb-12" style={{ letterSpacing: '0.02em' }}>
          NeuroYou is an independent laboratory for personal consciousness research.
          Not spiritual. Not wellness. Not religion. It&apos;s a place to explore your senses, attention,
          observation, and skills at direct perceptual investigation.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/start-here"
            className="px-6 py-3 border border-[var(--blue)] text-[var(--blue)] text-xs tracking-widest uppercase hover:bg-[var(--accent-glow)] transition-colors"
          >
            Start Here
          </Link>
          <Link
            href="/exercises"
            className="px-6 py-3 border border-[var(--border)] text-[var(--muted)] text-xs tracking-widest uppercase hover:border-[var(--white)] hover:text-[var(--white)] transition-colors"
          >
            Learn
          </Link>
        </div>
      </section>


      {/* Three axioms */}
      <section className="py-24 border-b border-[var(--border)]">
        <p className="label mb-12">Operating principles</p>
        <div className="grid sm:grid-cols-3 gap-12">
          {[
            {
              index: '01',
              title: 'Systems, not stories',
              body: 'Your experience is produced by physical systems. Understanding those systems changes what is possible.',
            },
            {
              index: '02',
              title: 'Zero gamification',
              body: 'No streaks. No points. No badges. Completion is recorded by date — and nothing more.',
            },
            {
              index: '03',
              title: 'Direct investigation',
              body: 'The techniques operate on actual sensory experience — not beliefs, not breath counts, not visualisations.',
            },
          ].map((item) => (
            <div key={item.index}>
              <p className="text-[var(--blue)] text-xs tracking-widest font-light mb-4">{item.index}</p>
              <h3 className="text-sm font-medium text-[var(--white)] tracking-wide mb-3 uppercase" style={{ letterSpacing: '0.08em' }}>
                {item.title}
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed font-light">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Protocols */}
      <section className="py-24 border-b border-[var(--border)] grid sm:grid-cols-2 gap-16 items-start">
        <div>
          <p className="label mb-6">
            <span style={{ color: 'var(--magenta)' }}>▸</span>
            {' '}The NeuroYou Protocols
          </p>
          <h2 className="text-4xl font-light text-[var(--white)] tracking-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
            Four Protocols.<br />One Direction: Inward.
          </h2>
          <p className="text-sm text-[var(--muted)] font-light leading-relaxed mb-8 max-w-sm">
            The NeuroYou protocols are a highly advanced set of sequential, experiential consciousness
            exploration exercises. Not therapy, not wellness. Consciousness engineering. The result of
            30 years of direct practice and thousands of hours of experimentation and observation in
            meditation and consciousness work, and only available from NeuroYou. Designed to be
            sequential, each requires the skills that are developed in the earlier protocols.
          </p>
          <Link
            href="/train"
            className="text-xs tracking-widest uppercase text-[var(--blue)] hover:text-glow-blue transition-colors border-b border-[var(--blue)] pb-0.5"
          >
            View the protocols →
          </Link>
        </div>
        <div className="border border-[var(--border)] p-8 space-y-px">
          {[
            { n: '01', title: 'Neutralize', note: 'Foundational — entry point' },
            { n: '02', title: 'NeuroGoal', note: 'First application — tangible results' },
            { n: '03', title: 'Reality Distortion', note: 'Advanced generalisation' },
            { n: '04', title: 'NeuroFinity', note: 'The frontier' },
          ].map((p) => (
            <div key={p.n} className="flex items-center justify-between gap-4 py-4 border-b border-[var(--border)] last:border-0">
              <div className="flex items-center gap-4">
                <span className="text-[0.6rem] tracking-widest text-[var(--blue)] font-light">{p.n}</span>
                <span className="text-sm font-light text-[var(--white)]">{p.title}</span>
              </div>
              <span className="text-[0.6rem] tracking-wider text-[var(--muted)] font-light text-right">{p.note}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Book */}
      <section className="py-24 border-b border-[var(--border)] grid sm:grid-cols-2 gap-16 items-start">
        <div>
          <p className="label mb-6">
            <span style={{ color: 'var(--violet)' }}>▸</span>
            {' '}The book
          </p>
          <h2 className="text-4xl font-light text-[var(--white)] tracking-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
            Reality Check
          </h2>
          <p className="text-sm text-[var(--muted)] font-light leading-relaxed mb-4 max-w-sm">
            How meditation moved from mysticism to neuroscience.
          </p>
          <p className="text-sm text-[var(--muted)] font-light leading-relaxed mb-8 max-w-sm">
            A field manual for the serious practitioner — built from thirty years of
            first-person investigation, stripped of doctrine, and grounded in how the
            brain actually constructs experience.
          </p>
          <p className="text-xs tracking-widest uppercase text-[var(--violet)] font-light">
            In preparation — 2025
          </p>
        </div>
        <div className="border border-[var(--border)] p-8" style={{ borderColor: 'rgba(140,92,255,0.3)' }}>
          <p className="text-[0.6rem] tracking-widest uppercase font-light mb-6" style={{ color: 'var(--violet)' }}>
            From the introduction
          </p>
          <p className="text-sm font-light text-[var(--white)] leading-relaxed mb-4" style={{ fontStyle: 'italic' }}>
            &ldquo;Meditation is not a retreat from reality. It is a more careful encounter with it.
            The techniques described in this book do not ask you to believe anything.
            They ask you to observe — precisely, repeatedly, and without flinching.&rdquo;
          </p>
          <p className="text-xs text-[var(--muted)] font-light">Peter J Hill</p>
        </div>
      </section>

      {/* Free content */}
      <section className="py-24">
        <p className="label mb-10">Access points</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/exercises"
            className="group block p-8 border border-[var(--border)] hover:border-[var(--blue)] hover:bg-[var(--accent-glow)] transition-all"
          >
            <p className="text-[var(--blue)] text-xs tracking-widest uppercase mb-4 font-light">Free</p>
            <h3 className="text-base font-light text-[var(--white)] tracking-tight mb-3 group-hover:text-[var(--blue)] transition-colors">
              Learn
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed font-light">
              Text and audio practices. Attention, sensation, and emotional state.
              No sequence — begin anywhere.
            </p>
          </Link>
          <Link
            href="/blog"
            className="group block p-8 border border-[var(--border)] hover:border-[var(--blue)] hover:bg-[var(--accent-glow)] transition-all"
          >
            <p className="text-[var(--blue)] text-xs tracking-widest uppercase mb-4 font-light">Free</p>
            <h3 className="text-base font-light text-[var(--white)] tracking-tight mb-3 group-hover:text-[var(--blue)] transition-colors">
              Explore
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed font-light">
              Deep reads on consciousness, perception, and the neuroscience of emotion.
              No cosmic swirls. No chakras.
            </p>
          </Link>
        </div>
      </section>

    </div>
  )
}
