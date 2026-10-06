import Link from 'next/link'

export const metadata = {
  title: 'Protocols — NeuroYou',
  description: 'The NeuroYou Protocols — structured online courses for direct consciousness work.',
}

// Page copy from the redesign handoff (a suggested rewrite). Previous strings,
// kept here so they are easy to restore:
//
//   intro: "Structured online courses for direct consciousness work. Each protocol
//   follows a fixed sequence — no skipping, no shortcuts. Built for people who want
//   results, not insights."
//
//   Neutralize: "Most emotional suffering isn't a character flaw or a chemical
//   imbalance — it's a structural feature of how consciousness processes experience.
//   The Neutralize Protocol is a rigorous, neuroscience-informed method for working
//   directly with that structure. Rather than managing emotions or reframing them,
//   Neutralize targets the underlying architecture that generates unwanted emotional
//   states and systematically dissolves it. This is the foundational technology of
//   the NeuroYou system — the core skill everything else is built upon."
//
//   NeuroGoal: "Setting goals is trivial. Achieving them is a consciousness problem.
//   The NeuroGoal Protocol is a strategic process for precisely aligning intention and
//   attention on a desired outcome, then applying Neutralize to remove the emotional
//   interference — fear, self-doubt, ambivalence — that derails most goal-directed
//   effort before it begins. Where conventional goal-setting works on the surface of
//   behavior, NeuroGoal works at the level of the consciousness that generates
//   behavior."
//
//   Reality Distortion: "Consciousness is not a single layer. The Reality Distortion
//   Protocol is an advanced technique for systematically exploring its full
//   architecture — personal, interpersonal, collective, and energetic — and bringing
//   subconscious programming into coherent alignment. The result is not a vague sense
//   of improvement, but a measurable shift in how reality is perceived and engaged
//   with: a life that generates genuine delight and awe rather than quiet friction.
//   This is sophisticated inner research for serious practitioners."
//
//   NeuroFinity: "The NeuroFinity Protocol is the most advanced instrument in the
//   NeuroYou system. It is a structured methodology for temporarily suspending
//   ordinary consciousness — not through belief or suggestion, but through precise,
//   reproducible technique — to access deeply transcendent states. What most
//   traditions treat as rare, accidental, or spiritually mediated, NeuroFinity makes
//   systematic. For researchers of consciousness who want to map the full territory of
//   subjective experience, this is the frontier."
const COPY = {
  eyebrow: 'The NeuroYou Protocols',
  heading: 'Protocols.',
  intro: 'Four structured courses for direct consciousness work. Taken in sequence, with no shortcuts. Built for results.',
}

const PROTOCOLS = [
  {
    n: '01', tag: 'Foundational', full: 'The Neutralize Protocol', img: '/redesign-placeholders/hand.jpg',
    lede: 'Work directly with the structure of emotion.',
    body: 'Most emotional suffering is not a character flaw or a chemical imbalance. It is a structural feature of how consciousness processes experience. Neutralize is a rigorous, neuroscience-informed method for dissolving the architecture that generates unwanted emotional states. It is the core skill everything else builds on.',
    req: 'Entry point',
  },
  {
    n: '02', tag: 'Tangible results', full: 'The NeuroGoal Protocol', img: '/redesign-placeholders/forest.jpg',
    lede: 'Achieving goals is a consciousness problem.',
    body: 'NeuroGoal aligns intention and attention precisely on an outcome, then applies Neutralize to remove the fear, self-doubt, and ambivalence that derail most effort before it begins. It works at the level of the consciousness that generates behaviour.',
    req: 'Requires Neutralize',
  },
  {
    n: '03', tag: 'Advanced', full: 'The Reality Distortion Protocol', img: '/redesign-placeholders/grass.jpg',
    lede: 'Explore every layer of consciousness.',
    body: 'An advanced technique for exploring the full architecture of consciousness, personal, interpersonal, and collective, and bringing subconscious programming into alignment. The result is a measurable shift in how you perceive and engage with your life.',
    req: 'Requires NeuroGoal',
  },
  {
    n: '04', tag: 'The frontier', full: 'The NeuroFinity Protocol', img: '/redesign-placeholders/sunwater.jpg',
    lede: 'Transcendent states, made systematic.',
    body: 'The most advanced instrument in the NeuroYou system. A precise, reproducible method for temporarily suspending ordinary consciousness to access deeply transcendent states, through technique rather than belief.',
    req: 'Requires Reality Distortion',
  },
]

export default function ProtocolsPage() {
  return (
    <div className="ny-scope bg-white">
      {/* Hero — bleeds under the fixed nav (cancels main's pt-14) */}
      <section className="relative h-[72vh] min-h-[560px] overflow-hidden -mt-14" style={{ background: '#2C6E7F' }}>
        <div className="absolute inset-0 ny-ken-burns">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/redesign-placeholders/sunwater.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(0,0,0,.5), rgba(0,0,0,0) 65%), ' +
              'linear-gradient(180deg, rgba(0,0,0,.42), rgba(0,0,0,0) 30%, rgba(0,0,0,.35))',
          }}
        />
        <div className="absolute left-0 right-0 bottom-[72px] px-8 pointer-events-none">
          <div className="max-w-[1120px] mx-auto text-white">
            <div className="text-[15px] font-medium opacity-90 mb-3.5">{COPY.eyebrow}</div>
            <h1 className="ny-hero m-0" style={{ color: '#fff' }}>{COPY.heading}</h1>
            <p className="mt-5 text-xl leading-normal max-w-[560px] opacity-95">{COPY.intro}</p>
          </div>
        </div>
      </section>

      {PROTOCOLS.map((p, i) => (
        <section
          key={p.n}
          className={`max-w-[1120px] mx-auto px-8 pt-[120px] flex flex-wrap gap-14 items-center ${i % 2 ? 'flex-row-reverse' : ''}`}
        >
          <div className="flex-[1_1_420px] h-[320px] sm:h-[520px] rounded-[28px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.img} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-[1_1_380px]">
            <div className="text-[15px] font-medium" style={{ color: 'var(--ny-tide)' }}>{p.n} · {p.tag}</div>
            <h2
              className="mt-3 font-semibold"
              style={{ fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.05, letterSpacing: '-0.035em', color: 'var(--ny-ink)' }}
            >
              {p.full}
            </h2>
            <p
              className="mt-4 font-medium"
              style={{ fontSize: 'clamp(20px, 2.6vw, 24px)', lineHeight: 1.35, letterSpacing: '-0.01em', color: 'var(--ny-ink)' }}
            >
              {p.lede}
            </p>
            <p className="mt-4 text-[17px] leading-relaxed" style={{ color: 'var(--ny-ink-3)' }}>{p.body}</p>
            <div className="flex flex-wrap gap-4 mt-7 items-center">
              <Link href="/connect" className="ny-btn ny-btn-primary" style={{ padding: '12px 22px' }}>Coming Soon</Link>
              <span className="text-sm" style={{ color: 'var(--ny-ink-4)' }}>{p.req}</span>
            </div>
          </div>
        </section>
      ))}

      <div className="h-[140px]" />
    </div>
  )
}
