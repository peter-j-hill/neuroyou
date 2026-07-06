import Link from 'next/link'

export const metadata = {
  title: 'Protocols — NeuroYou',
  description: 'The NeuroYou Protocols — structured online courses for direct consciousness work.',
}

const protocols = [
  {
    title: 'The Neutralize Protocol',
    status: 'Coming Soon',
    href: '/neutralize',
    body: 'Most emotional suffering isn\'t a character flaw or a chemical imbalance — it\'s a structural feature of how consciousness processes experience. The Neutralize Protocol is a rigorous, neuroscience-informed method for working directly with that structure. Rather than managing emotions or reframing them, Neutralize targets the underlying architecture that generates unwanted emotional states and systematically dissolves it. This is the foundational technology of the NeuroYou system — the core skill everything else is built upon.',
  },
  {
    title: 'The NeuroGoal Protocol',
    status: 'Coming Soon',
    href: null,
    body: 'Setting goals is trivial. Achieving them is a consciousness problem. The NeuroGoal Protocol is a strategic process for precisely aligning intention and attention on a desired outcome, then applying Neutralize to remove the emotional interference — fear, self-doubt, ambivalence — that derails most goal-directed effort before it begins. Where conventional goal-setting works on the surface of behavior, NeuroGoal works at the level of the consciousness that generates behavior.',
  },
  {
    title: 'The Reality Distortion Protocol',
    status: 'Coming Soon',
    href: null,
    body: 'Consciousness is not a single layer. The Reality Distortion Protocol is an advanced technique for systematically exploring its full architecture — personal, interpersonal, collective, and energetic — and bringing subconscious programming into coherent alignment. The result is not a vague sense of improvement, but a measurable shift in how reality is perceived and engaged with: a life that generates genuine delight and awe rather than quiet friction. This is sophisticated inner research for serious practitioners.',
  },
  {
    title: 'The NeuroFinity Protocol',
    status: 'Coming Soon',
    href: null,
    body: 'The NeuroFinity Protocol is the most advanced instrument in the NeuroYou system. It is a structured methodology for temporarily suspending ordinary consciousness — not through belief or suggestion, but through precise, reproducible technique — to access deeply transcendent states. What most traditions treat as rare, accidental, or spiritually mediated, NeuroFinity makes systematic. For researchers of consciousness who want to map the full territory of subjective experience, this is the frontier.',
  },
]

export default function TrainPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <p className="label mb-10">
        <span className="node mr-3" style={{ background: 'var(--violet)', boxShadow: '0 0 8px var(--violet)' }} />
        The NeuroYou Protocols
      </p>
      <h1 className="text-4xl font-light text-[var(--white)] tracking-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
        Protocols
      </h1>
      <p className="text-sm text-[var(--muted)] font-light mb-16 max-w-xl leading-relaxed">
        Structured online courses for direct consciousness work. Each protocol follows a fixed
        sequence — no skipping, no shortcuts. Built for people who want results, not insights.
      </p>

      <div className="space-y-px">
        {protocols.map((p, i) => (
          <div key={p.title} className="border border-[var(--border)] p-10">
            <div className="flex items-start justify-between gap-6 mb-4">
              <div className="flex items-center gap-4">
                <span className="text-[0.6rem] tracking-widest uppercase text-[var(--blue)] font-light">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h2 className="text-xl font-light text-[var(--white)] tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                  {p.title}
                </h2>
              </div>
              <span className="text-[0.6rem] tracking-widest uppercase text-[var(--muted)] font-light shrink-0 border border-[var(--border)] px-3 py-1">
                {p.status}
              </span>
            </div>
            <p className="text-sm text-[var(--muted)] font-light leading-relaxed max-w-2xl">
              {p.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
