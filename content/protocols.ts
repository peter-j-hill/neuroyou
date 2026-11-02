// The four protocols: the website copy shown on /protocols and on the waitlist pages
// (/offers/neurogoal and so on). One place, so the two never disagree.
// Copy comes from the redesign handoff; previous wording is kept at the top of app/protocols/page.tsx.
export const PROTOCOL_CARDS = [
  {
    slug: 'neutralize', n: '01', tag: 'Foundational', full: 'The Neutralize Protocol', img: '/redesign-placeholders/hand.jpg',
    lede: 'Work directly with the structure of emotion.',
    body: 'Most emotional suffering is not a character flaw or a chemical imbalance. It is a structural feature of how consciousness processes experience. Neutralize is a rigorous, neuroscience-informed method for dissolving the architecture that generates unwanted emotional states. It is the core skill everything else builds on.',
    req: 'Entry point',
  },
  {
    slug: 'neurogoal', n: '02', tag: 'Tangible results', full: 'The NeuroGoal Protocol', img: '/redesign-placeholders/forest.jpg',
    lede: 'Achieving goals is a consciousness problem.',
    body: 'NeuroGoal aligns intention and attention precisely on an outcome, then applies Neutralize to remove the fear, self-doubt, and ambivalence that derail most effort before it begins. It works at the level of the consciousness that generates behaviour.',
    req: 'Requires Neutralize',
  },
  {
    slug: 'realitydistortion', n: '03', tag: 'Advanced', full: 'The Reality Distortion Protocol', img: '/redesign-placeholders/grass.jpg',
    lede: 'Explore every layer of consciousness.',
    body: 'An advanced technique for exploring the full architecture of consciousness, personal, interpersonal, and collective, and bringing subconscious programming into alignment. The result is a measurable shift in how you perceive and engage with your life.',
    req: 'Requires NeuroGoal',
  },
  {
    slug: 'neurofinity', n: '04', tag: 'The frontier', full: 'The NeuroFinity Protocol', img: '/redesign-placeholders/sunwater.jpg',
    lede: 'Transcendent states, made systematic.',
    body: 'The most advanced instrument in the NeuroYou system. A precise, reproducible method for temporarily suspending ordinary consciousness to access deeply transcendent states, through technique rather than belief.',
    req: 'Requires Reality Distortion',
  },
]

export type ProtocolCard = (typeof PROTOCOL_CARDS)[number]
