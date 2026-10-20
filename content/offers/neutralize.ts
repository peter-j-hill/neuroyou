// Offer page copy for /offers/neutralize.
//
// WEBSITE COPY, NOT PETER'S COURSE CONTENT. Taken word for word from the design canvas
// (protocols-handoff/design-canvas/Offer.dc.html) and flagged in the pull request for Peter's review,
// including the founder quote, which is attributed to him. Edit here; the page just renders it.
// Items marked [pending] are not decided yet and are deliberately left out of the page.

export const OFFER = {
  hero: {
    eyebrow: '01 · Foundational',
    title: 'The Neutralize Protocol.',
    lede: 'Work directly with the structure of emotion.',
    body:
      'A short, precise technique for dissolving the uninvited emotions that stall you — irritation, dread, procrastination, overwhelm. You learn it in a few hours. You use it for the rest of your life.',
    facts: ['7 modules', 'About 4 hours, then practice', 'Video, audio, guided practice', 'Self-paced, lifetime access'],
    image: '/redesign-placeholders/hand.jpg', // placeholder, as on /protocols
  },

  problem: {
    eyebrow: 'The problem',
    title: 'You know what to do. Something stops you doing it.',
    body:
      'Every goal follows the same three steps. The trouble is rarely the plan — it is the emotion that turns up at step three and quietly drains the energy you need.',
    steps: [
      { label: 'Step 1', title: 'Picture the outcome', body: 'Say it, write it, see it.' },
      { label: 'Step 2', title: 'Plan the action', body: 'Work out what gets you from here to there.' },
      {
        label: 'Step 3 · where it stalls',
        title: 'Take the action',
        body: 'Fear, reluctance, overwhelm, “later”. Each block burns attention — and attention is a limited resource.',
        stall: true,
      },
    ],
  },

  approach: {
    eyebrow: 'The approach',
    title: 'Stop working with what it means. Work with how it is built.',
    most: {
      label: 'Most methods · the meaning level',
      title: 'Talk about the feeling.',
      body:
        'Where did it come from? What does it say about you? Useful for understanding — but you can talk for months and still feel exactly the same.',
    },
    neutralize: {
      label: 'Neutralize · the structural level',
      title: 'Feel it fully. Then see it as information.',
      body:
        'Every feeling is a pattern of neurons firing. Imagine it that way and it becomes neutral — just information. Then you deliberately switch the pattern off.',
    },
  },

  outcomes: {
    eyebrow: 'What you will be able to do',
    title: 'One skill. Everything else builds on it.',
    items: [
      { title: 'Name it', body: 'Spot an uninvited emotion as it arrives, instead of hours later.' },
      { title: 'Feel it, without the story', body: 'Hold full attention on the feeling and leave the explanations aside.' },
      { title: 'Dissolve it in minutes', body: 'Run the seven steps anywhere quiet. Repeat until it is lighter.' },
      { title: 'Get back to the work', body: 'Free the attention the block was using, and act.' },
    ],
  },

  inside: {
    eyebrow: 'Inside the protocol',
    title: 'Short lessons. Practice straight after every idea.',
    body:
      'Two founder lectures, short pause-and-try exercises, a guided audio practice, and a private journal for your own observations.',
    // Marketing summary from the canvas. Lesson counts and minutes are the plan's targets, not read from
    // the database, so this stays accurate to the sales promise even while lessons are placeholders.
    modules: [
      { n: '0', title: 'Before you begin', meta: '3 lessons · 10 min' },
      { n: '1', title: 'Why emotion blocks action', meta: '3 lessons · 35 min' },
      { n: '2', title: 'The insight', meta: '5 lessons · 60 min' },
      { n: '3', title: 'The protocol — seven steps', meta: '3 lessons · 40 min' },
      { n: '4', title: 'Practice', meta: 'open-ended' },
      { n: '5', title: 'When it does not shift', meta: '2 lessons · 25 min' },
      { n: '6', title: 'Advanced practice — beyond emotion', meta: '1 lecture · open-ended' },
    ],
  },

  expect: {
    label: 'What to expect',
    title: 'Results are felt, not figured out.',
    body:
      'Most people notice lightness, relief, or a spontaneous breath out. Some feel a brief jolt along the neck or spine as the nervous system settles. Both are normal. You may not gain new insight — the emotion may simply stop being there.',
  },
  care: {
    label: 'Before you buy',
    title: 'This is real work with emotion.',
    body:
      'It can feel hard at first. If you are in therapy, under psychiatric care, or take medication for a psychological condition, please check with your professional before starting. Neutralize is not therapy and not a treatment.',
  },

  founder: {
    quote:
      '“I spent thousands of hours meditating so you don’t have to. In the next few hours, I’ll share ideas you have probably never thought about.”',
    byline: 'Peter J Hill · Founder, NeuroYou · thirty years of direct practice',
    portrait: '/peter-hill.jpg',
  },

  enroll: {
    eyebrow: 'Enroll',
    title: 'Start the Neutralize Protocol.',
    includes: [
      '7 modules, video and audio',
      'Guided practice room, any time',
      'Private practice journal',
      'Lifetime access, including updates',
      'Unlocks NeuroGoal when it opens',
    ],
    // [pending] Peter to supply. When null, the sentence is simply left out (nothing like
    // "[YOUR REFUND POLICY]" can ever reach the public page).
    refund: null as string | null,
  },

  faqs: [
    {
      q: 'Do I need to do the free exercises first?',
      a: 'It helps. The free Learn exercises train the attention skills Neutralize uses, especially Abstraction. The course links to them where they matter.',
    },
    {
      q: 'How long does it take?',
      a: 'About four hours of lessons, at your own pace. Learning the steps is quick. Mastering them in daily life takes repetition, which is what the practice room is for.',
    },
    {
      q: 'Is this therapy?',
      a: 'No. It is personal attention training. If you are in therapy or under medical care, please check with your professional before you start.',
    },
    {
      q: 'Do I have to read the research paper?',
      a: 'No. It is written in precise academic language for those who want it. The course explains everything you need in plain words.',
    },
    {
      q: 'What if it does not work for me?',
      a: 'Experiences vary, and we say so openly. Module 5 covers the most common reason it stalls — layered emotions — and what to do.',
    },
  ],

  after: { label: 'What comes after Neutralize' },
}
