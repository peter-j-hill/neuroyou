import Link from 'next/link'

export const metadata = {
  title: 'Train — NeuroYou',
  description: 'Paid training programmes from NeuroYou. Structured, sequential, neuroscience-grounded.',
}

export default function TrainPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <p className="label mb-10">
        <span className="node mr-3" />
        Structured training
      </p>
      <h1 className="text-4xl font-light text-[var(--white)] tracking-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
        Train
      </h1>
      <p className="text-sm text-[var(--muted)] font-light mb-16 max-w-xl leading-relaxed">
        Sequential programmes for direct intervention. Each course follows a fixed structure —
        no skipping, no shortcuts. Built for people who want results, not insights.
      </p>

      {/* Neutralize */}
      <div className="border border-[var(--border)] hover:border-[var(--blue)] hover:bg-[var(--accent-glow)] transition-all group">
        <Link href="/neutralize" className="block p-10">
          <div className="flex items-start justify-between gap-8">
            <div className="max-w-lg">
              <p className="text-[0.6rem] tracking-widest uppercase text-[var(--magenta)] mb-4 font-light">
                ▸ Course — Available now
              </p>
              <h2 className="text-2xl font-light text-[var(--white)] tracking-tight mb-4 group-hover:text-[var(--blue)] transition-colors" style={{ letterSpacing: '-0.02em' }}>
                Neutralize
              </h2>
              <p className="text-sm text-[var(--muted)] font-light leading-relaxed mb-6">
                A fixed sequential course in emotional regulation. For people whose unpleasant
                emotional states are limiting their lives — and who want a rigorous,
                neuroscience-informed method through.
              </p>
              <p className="text-xs tracking-widest uppercase text-[var(--blue)] font-light group-hover:text-glow-blue transition-colors">
                View course →
              </p>
            </div>
            <div className="border border-[var(--border)] p-6 shrink-0 hidden sm:block w-56" style={{ borderColor: 'rgba(255,46,138,0.2)' }}>
              <p className="text-[0.6rem] tracking-widest uppercase text-[var(--muted)] mb-3">What you get</p>
              {[
                'Sequential module structure',
                'Neuroscience-grounded method',
                'Direct sensory intervention',
                'Zero gamification',
              ].map((item) => (
                <p key={item} className="text-xs text-[var(--muted)] font-light py-1.5 border-b border-[var(--border)] last:border-0">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </Link>
      </div>

      <p className="text-xs text-[var(--muted)] font-light mt-12 tracking-wide">
        More programmes in development.
      </p>
    </div>
  )
}
