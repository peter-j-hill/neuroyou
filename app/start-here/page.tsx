export default function StartHerePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="text-sm font-sans text-[var(--muted)] tracking-widest uppercase mb-6">
        Start Here
      </p>
      <h1 className="text-4xl font-normal mb-10 max-w-xl leading-snug">
        This is not a mindfulness app.
      </h1>

      <div className="prose">
        <p>
          Most consciousness and self-improvement content shares an assumption: that what
          you need is <em>more</em> — more motivation, more discipline, more positive
          thinking. NeuroYou starts from a different place.
        </p>

        <p>
          The premise here is observational. Your nervous system is already doing
          something, right now, in every moment of your day. The question isn&apos;t how
          to add things on top of it — it&apos;s how to understand what&apos;s actually
          happening, and to work with it rather than against it.
        </p>

        <h2>Why "consciousness research"?</h2>
        <p>
          Because that&apos;s what it is. Consciousness — your direct, first-person
          experience of being here — is the subject matter. Not productivity. Not
          happiness. Not spiritual development in any traditional sense.
        </p>
        <p>
          The techniques on this site are drawn from neuroscience, phenomenology, and
          decades of first-person investigation into how experience actually works. They
          are practical: things you do, in your body, with your senses, right now.
        </p>

        <h2>What to expect</h2>
        <p>
          The free exercises are a starting point. They are short, specific, and
          instruction-based — you will be asked to notice something, or to direct your
          attention somewhere, and then to observe what happens.
        </p>
        <p>
          The Neutralize course goes deeper: a structured sequence specifically for
          emotional regulation, for people whose unpleasant emotional states are
          limiting their lives.
        </p>
        <p>
          There are no streaks. No badges. No progress bars. If you completed Module 3
          on June 14, it will say "Completed: June 14." That is the extent of
          the tracking.
        </p>

        <h2>Who this is for</h2>
        <p>
          People who are genuinely curious about how their mind works. People who have
          tried meditation and found the framing alienating. People who are interested
          in neuroscience and want practices that match that interest.
        </p>
        <p>
          And people who are dealing with difficult emotional states and want something
          more rigorous than "breathe and be present."
        </p>

        <h2>Where to begin</h2>
        <p>
          Browse the exercises library. Pick one that interests you. Do it once, and
          notice what happens.
        </p>
        <p>
          That&apos;s all.
        </p>
      </div>

      <div className="mt-12 flex gap-4">
        <a
          href="/exercises"
          className="px-6 py-3 bg-[var(--accent)] text-white text-sm font-sans rounded-sm hover:opacity-90 transition-opacity"
        >
          Exercises library
        </a>
        <a
          href="/signup"
          className="px-6 py-3 border border-[var(--border)] text-[var(--foreground)] text-sm font-sans rounded-sm hover:border-[var(--accent)] transition-colors"
        >
          Create an account
        </a>
      </div>
    </div>
  )
}
