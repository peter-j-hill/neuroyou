import Link from 'next/link'

// Page copy from the redesign handoff. Previous wording, kept here so it is easy to
// restore (also in git history before the Phase 5 commit):
//
//   Eyebrow: "Orientation protocol". Heading: "This is not mindfulness."
//   "Most consciousness content shares an assumption: that what you need is more — more
//   motivation, more discipline, more positive thinking. NeuroYou starts from a different
//   premise." / "Your nervous system is already doing something, right now, in every
//   moment. The question is not how to add things on top of it — it's how to understand
//   what is actually happening, and work with it rather than against it."
//   "What consciousness research means here": "Consciousness — your direct, first-person
//   experience of being here, in your body, with your thoughts, your emotion, your belief,
//   your identity, and your life — is the subject matter. Not productivity. Not spiritual
//   development. Not making more money. Not happiness optimization." / "The techniques are
//   drawn from neuroscience, phenomenology, and decades of first-person investigation into
//   how experience actually works. They are practical: things you do, in your body, with
//   your actual senses, right now."
//   "What to expect": "The free exercises are a starting point. They are short, specific,
//   and instruction-based — you will be asked to notice something, or to direct your
//   attention in a particular way, and then observe what happens." / "After you've done
//   some of the free exercises, if you are still curious, take a look at the NeuroYou
//   Protocols. These are more structured, committing courses where you will learn powerful
//   new ways to manage your consciousness more effectively."
//   "What is not here": "No streaks. No badges. No progress bars. No cosmic swirls. No
//   chakras. No galaxy backgrounds. No lotus poses."
//   "Begin": "Browse the exercises library. Pick one that interests you. Do it once.
//   Notice what happens. That's all."
//   Side cards: We are not: "Awaken your inner light." / We are: "Modify your perceptual
//   architecture." / Axiom: "Your experience of being alive is the most direct data you
//   have. Everything here starts from that."
//   Buttons: "Exercises library" (/exercises), "Create account" (/signup).
const COPY = {
  eyebrow: 'Start Here',
  heading: 'Three steps. Ten minutes to begin.',
  intro: 'Consciousness is a set of trainable skills. This is the quickest way to find out what that means for you.',
}

const STEPS = [
  {
    n: '01', title: 'Try a practice', img: '/redesign-placeholders/hand.jpg',
    body: 'Pick any free practice in Learn. Each takes about ten minutes and needs nothing but your attention.',
    cta: 'Go to Learn', href: '/exercises',
  },
  {
    n: '02', title: 'Read the thinking', img: '/redesign-placeholders/grass.jpg',
    body: 'Explore short essays on why consciousness is a matter of structure, not story.',
    cta: 'Go to Explore', href: '/blog',
  },
  {
    n: '03', title: 'Begin Neutralize', img: '/redesign-placeholders/surf.jpg',
    body: 'When you want results rather than insights, start the foundational protocol.',
    cta: 'View the Protocols', href: '/protocols',
  },
]

export default function StartHerePage() {
  return (
    <div className="ny-scope bg-white">
      <section className="max-w-[1120px] mx-auto px-8 pt-24 pb-24 text-center">
        <div className="ny-eyebrow mb-3.5">{COPY.eyebrow}</div>
        <h1 className="ny-page-title mx-auto max-w-[880px]" style={{ textWrap: 'balance' }}>{COPY.heading}</h1>
        <p className="ny-lede mx-auto mt-6 max-w-[640px]" style={{ fontSize: 'clamp(19px, 2.6vw, 24px)', lineHeight: 1.4 }}>
          {COPY.intro}
        </p>
      </section>

      <section
        className="max-w-[1120px] mx-auto px-8 pb-[140px] grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
      >
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-[28px] overflow-hidden flex flex-col" style={{ background: 'var(--ny-mist)' }}>
            <div className="h-[280px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.img} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col gap-2.5 flex-1 px-7 pt-7 pb-8">
              <div className="text-5xl font-semibold leading-none" style={{ letterSpacing: '-0.04em', color: 'var(--ny-tide)' }}>{s.n}</div>
              <h2 className="text-2xl m-0" style={{ letterSpacing: '-0.015em', color: 'var(--ny-ink)' }}>{s.title}</h2>
              <p className="m-0 flex-1 text-[17px] leading-relaxed" style={{ color: 'var(--ny-ink-3)' }}>{s.body}</p>
              <Link href={s.href} className="ny-btn ny-btn-primary self-start mt-3" style={{ fontSize: 15, padding: '11px 20px' }}>
                {s.cta}
              </Link>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
