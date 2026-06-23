export default function StartHerePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <p className="label mb-10">
        <span className="node mr-3" />
        Orientation protocol
      </p>

      <h1 className="text-5xl sm:text-6xl font-light text-[var(--white)] tracking-tight mb-16" style={{ letterSpacing: '-0.03em' }}>
        This is not<br />
        <span className="text-[var(--blue)] text-glow-blue">mindfulness.</span>
      </h1>

      <div className="grid sm:grid-cols-2 gap-16 mb-20">
        <div className="prose">
          <p>
            Most consciousness content shares an assumption: that what you need is
            <em> more</em> — more motivation, more discipline, more positive
            thinking. NeuroYou starts from a different premise.
          </p>
          <p>
            Your nervous system is already doing something, right now, in every moment.
            The question is not how to add things on top of it — it&apos;s how to understand
            what is actually happening, and work with it rather than against it.
          </p>

          <h2>What consciousness research means here</h2>
          <p>
            Consciousness — your direct, first-person experience of being here, in your body,
            with your thoughts, your emotion, your belief, your identity, and your life — is the
            subject matter. Not productivity. Not spiritual development. Not making more money.
            Not happiness optimization.
          </p>
          <p>
            The techniques are drawn from neuroscience, phenomenology, and decades of
            first-person investigation into how experience actually works.
            They are practical: things you do, in your body, with your actual senses,
            right now.
          </p>

          <h2>What to expect</h2>
          <p>
            The free exercises are a starting point. They are short, specific, and
            instruction-based — you will be asked to notice something, or to direct
            your attention in a particular way, and then observe what happens.
          </p>
          <p>
            The Neutralize course goes deeper: a structured sequence specifically for
            emotional regulation, for people whose unpleasant emotional states are
            limiting their lives.
          </p>

          <h2>What is not here</h2>
          <p>
            No streaks. No badges. No progress bars. No cosmic swirls.
            No chakras. No galaxy backgrounds. No lotus poses.
            If you completed Module 3 on June 14 — it will say "Completed: June 14."
            That is the extent of the tracking.
          </p>

          <h2>Begin</h2>
          <p>
            Browse the exercises library. Pick one that interests you.
            Do it once. Notice what happens. That&apos;s all.
          </p>
        </div>

        {/* Punch card */}
        <div className="space-y-6">
          {[
            { q: 'We are not:', a: '"Awaken your inner light."' },
            { q: 'We are:', a: '"Modify your perceptual architecture."' },
          ].map((item, i) => (
            <div key={i} className="border border-[var(--border)] p-8">
              <p className="label mb-3">{item.q}</p>
              <p
                className={`text-lg font-light tracking-tight ${
                  i === 1 ? 'text-[var(--blue)] text-glow-blue' : 'text-[var(--muted)] line-through'
                }`}
              >
                {item.a}
              </p>
            </div>
          ))}

          <div className="border border-[var(--border)] p-8 mt-8">
            <p className="label mb-4">Axiom</p>
            <p className="text-sm font-light text-[var(--muted)] leading-relaxed">
              Your experience of being alive is the most direct data you have.
              Everything here starts from that.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <a
          href="/exercises"
          className="px-6 py-3 border border-[var(--blue)] text-[var(--blue)] text-xs tracking-widest uppercase hover:bg-[var(--accent-glow)] transition-colors"
        >
          Exercises library
        </a>
        <a
          href="/signup"
          className="px-6 py-3 border border-[var(--border)] text-[var(--muted)] text-xs tracking-widest uppercase hover:border-[var(--white)] hover:text-[var(--white)] transition-colors"
        >
          Create account
        </a>
      </div>
    </div>
  )
}
