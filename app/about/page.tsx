export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <div className="grid sm:grid-cols-[minmax(0,280px)_1fr] gap-16 mb-20">
        {/* Portrait */}
        <div className="aspect-[3/4] border border-[var(--border)] overflow-hidden">
          <img src="/peter-hill.jpg" alt="Peter J Hill" className="w-full h-full object-cover" />
        </div>

        {/* Founder intro */}
        <div>
          <p className="label mb-4">The founder</p>
          <h1 className="text-4xl sm:text-5xl font-light text-[var(--white)] tracking-tight mb-3" style={{ letterSpacing: '-0.03em' }}>
            Peter J Hill
          </h1>
          <p className="label mb-10">Founder, NeuroYou</p>

          <div className="prose">
            <p>
              NeuroYou began as a private discipline. For more than two decades I have
              practised and refined a method for directing attention and intention —
              first for my own goals, then as a body of technique precise enough to
              teach. NeuroYou is where that work now lives.
            </p>
            <p>
              It is one practitioner&apos;s research, offered openly to others who take
              the subject as seriously.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-16 mb-16">
        <p className="label mb-6">The work</p>
        <div className="prose">
          <p>
            NeuroYou treats attention, intention, and awareness as trainable structures
            rather than states to be stumbled into. The work is organised as a sequence
            of Protocols, released in order, because each depends on the skills built
            before it.
          </p>
          <p>
            The sequence begins with a single foundational skill. From there it extends
            outward — first to the achievement of personal goals, then to the systems
            and relationships a life is built from, and finally to the structure of
            awareness itself. The order is not arbitrary. The later work is more
            demanding and more destabilising, and it rests on the confidence and
            competence the earlier work provides.
          </p>
          <p>
            Each Protocol opens with a white paper: a theoretical statement, openly
            readable, of what it does and why. The techniques themselves are unlocked
            in turn. You may read freely, but you practise in order.
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-16">
        <p className="label mb-6">The stance</p>
        <div className="prose">
          <p>
            This is deliberately not a mindfulness app. There are no streaks, no
            badges, no supermarket-aisle serenity. Progress, where it is recorded at
            all, is a plain note of what was completed and when — not motivational
            theatre.
          </p>
          <p>
            The register is closer to a research notebook than a wellness product,
            because the subject deserves that seriousness — and because the people
            this was built for were put off by everything else on offer.
          </p>
        </div>
      </div>
    </div>
  )
}
