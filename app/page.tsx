import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-6">
      {/* Philosophy statement */}
      <section className="pt-20 pb-16 border-b border-[var(--border)]">
        <p className="text-sm font-sans text-[var(--muted)] mb-8 tracking-widest uppercase">
          Consciousness Research
        </p>
        <h1 className="text-4xl sm:text-5xl font-normal leading-tight mb-8 max-w-2xl">
          Your experience of being alive is the most direct data you have.
        </h1>
        <p className="text-xl text-[var(--muted)] max-w-xl leading-relaxed mb-10">
          NeuroYou is a practical research project into consciousness and self-discovery —
          grounded in neuroscience, not wellness culture. The goal is presence, not performance.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/start-here"
            className="px-6 py-3 bg-[var(--accent)] text-white text-sm font-sans rounded-sm hover:opacity-90 transition-opacity"
          >
            Start here
          </Link>
          <Link
            href="/exercises"
            className="px-6 py-3 border border-[var(--border)] text-[var(--foreground)] text-sm font-sans rounded-sm hover:border-[var(--accent)] transition-colors"
          >
            Free exercises
          </Link>
        </div>
      </section>

      {/* Three pillars */}
      <section className="py-16 grid sm:grid-cols-3 gap-12 border-b border-[var(--border)]">
        <div>
          <h2 className="text-base mb-3">Research-grounded</h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Exercises drawn from neuroscience, phenomenology, and consciousness research —
            not habit loops or motivational frameworks.
          </p>
        </div>
        <div>
          <h2 className="text-base mb-3">No gamification</h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            No streaks, no points, no celebratory animations. Progress here is quiet:
            a date stamp, nothing more.
          </p>
        </div>
        <div>
          <h2 className="text-base mb-3">Direct experience</h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            The techniques work on your actual moment-to-moment sensory experience —
            not beliefs, not breath counts, not visualisations.
          </p>
        </div>
      </section>

      {/* Neutralize promo */}
      <section className="py-16 grid sm:grid-cols-2 gap-12 border-b border-[var(--border)]">
        <div>
          <p className="text-xs font-sans text-[var(--muted)] tracking-widest uppercase mb-4">
            The course
          </p>
          <h2 className="text-2xl font-normal mb-4">Neutralize</h2>
          <p className="text-[var(--muted)] leading-relaxed mb-6">
            A fixed sequential course in emotional regulation. Designed for people whose
            unpleasant emotions are limiting their lives — and who want a rigorous,
            neuroscience-informed way through.
          </p>
          <Link
            href="/neutralize"
            className="text-sm font-sans text-[var(--accent)] hover:underline underline-offset-4"
          >
            Learn more →
          </Link>
        </div>
        <div className="bg-[var(--accent-light)] rounded-sm p-8 flex items-center">
          <p className="text-sm text-[var(--muted)] leading-relaxed italic">
            "Emotional regulation doesn&apos;t mean suppression. It means learning what your
            nervous system is actually doing — and working with it."
          </p>
        </div>
      </section>

      {/* Free content links */}
      <section className="py-16">
        <h2 className="text-xl font-normal mb-8">Explore the free material</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <Link
            href="/exercises"
            className="group block p-6 border border-[var(--border)] rounded-sm hover:border-[var(--accent)] transition-colors"
          >
            <h3 className="text-base mb-2 group-hover:text-[var(--accent)] transition-colors">
              Exercises library
            </h3>
            <p className="text-sm text-[var(--muted)]">
              Text and audio practices. No account required to browse; create one to track
              what you&apos;ve done.
            </p>
          </Link>
          <Link
            href="/blog"
            className="group block p-6 border border-[var(--border)] rounded-sm hover:border-[var(--accent)] transition-colors"
          >
            <h3 className="text-base mb-2 group-hover:text-[var(--accent)] transition-colors">
              Research articles
            </h3>
            <p className="text-sm text-[var(--muted)]">
              Deep reads on consciousness, perception, and the neuroscience of emotion.
            </p>
          </Link>
        </div>
      </section>
    </div>
  )
}
