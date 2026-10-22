// Offer page copy for /offers/neutralize.
//
// WEBSITE COPY, NOT PETER'S COURSE CONTENT. Taken word for word from the design canvas
// (protocols-handoff/design-canvas/Offer.dc.html) and flagged in the pull request for Peter's review,
// including the founder quote, which is attributed to him. Edit here; the page just renders it.
// Items marked [pending] are not decided yet and are deliberately left out of the page.

export const OFFER = {
  hero: {
    eyebrow: '01 · Foundation',
    title: 'The Neutralize Protocol.',
    lede: 'Work directly with the structure of emotions.',
    body:
      'A short, precise technique for dissolving the uninvited emotions that stop you taking action — irritation, dread, procrastination, overwhelm. Learn it in a few hours. Use it for the rest of your life.',
    facts: ['7 modules', 'About 4 hours course content then practice', 'Video, audio, guided practice pages, online journal', 'Self-paced, lifetime access'],
    image: '/redesign-placeholders/hand.jpg', // placeholder, as on /protocols
  },

  problem: {
    eyebrow: 'The problem',
    title: 'You know what you need to do. Yet something stops you doing it.',
    body:
      'Every goal in life follows the same basic steps. The trouble is rarely your plan — it is the emotion that turns up when you start taking action, and drains your focus, energy and motivation.',
    steps: [
      { label: 'Step 1', title: 'Picture the outcome', body: 'Visualize it, write it down. you know all this and already do it.' },
      { label: 'Step 2', title: 'Make a Plan', body: 'Figure out what gets you from here to there.' },
      {
        label: 'Step 3 · where you get stuck',
        title: 'Take the action',
        body: 'Fear, reluctance, pracrastination, overwhelm, lack of energy. These are just some of emotions that block you from taking action by exhausting your attention — and attention is our most limited resource.',
        stall: true,
      },
    ],
  },

  approach: {
    eyebrow: 'The NeuroYou approach',
    title: 'Stop working with what emotion means. Work with how it is built in consciousness.',
    most: {
      label: 'Most self-development works at the level of meaning',
      title: 'Talk about the feeling.',
      body:
        'Where did it come from? What does it say about you? Your answers might be useful for understanding — but after hours or months of talking you are still stuck.',
    },
    neutralize: {
      label: 'Neutralize works at the structural level',
      title: 'Feel it fully. Then see it as information.',
      body:
        'Every emotion is a pattern of neurons firing in the brain. When we magine it that way it becomes neutral information. That gives you the choice to deliberately back control and switch the pattern off at its source.',
    },
  },

  outcomes: {
    eyebrow: 'What you will learn to do',
    title: 'Learn One skill. Everything else builds from there.',
    items: [
      { title: 'Find it', body: 'Spot an uninvited emotion as it arrives, instead of hours later on your therapists couch.' },
      { title: 'Feel it, without the story', body: 'Hold full attention on the feeling while leaving the meaning and story aside.' },
      { title: 'Dissolve it in minutes', body: 'Run the seven Neurtralize steps anywhere quiet. Repeat until it is gone.' },
      { title: 'Get back to work', body: 'Once you have freed the attention the emotion was block, take action.' },
    ],
  },

  inside: {
    eyebrow: 'Inside the protocol',
    title: 'Short lessons. Practice immediately.',
    body:
      'Two founder lectures, short preparation exercises, the guided neutralize practice, and a private online journal for your own observations.',
    // Marketing summary from the canvas. Lesson counts and minutes are the plan's targets, not read from
    // the database, so this stays accurate to the sales promise even while lessons are placeholders.
    modules: [
      { n: '0', title: 'Before you begin', meta: '3 lessons · 10 min' },
      { n: '1', title: 'Why emotion blocks action', meta: '3 lessons · 35 min' },
      { n: '2', title: 'The insight', meta: '5 lessons · 60 min' },
      { n: '3', title: 'The Neutralize Protocol in seven steps', meta: '3 lessons · 40 min' },
      { n: '4', title: 'Practice', meta: 'open-ended' },
      { n: '5', title: 'Troubleshooting', meta: '2 lessons · 25 min' },
      { n: '6', title: 'Taking Neurtralize beyond emotion', meta: '1 lecture · 30 min' },
      { n: '7', title: 'Advanced Practice', meta: 'custom-practice room · open-ended' }
    ],
  },

  expect: {
    label: 'What to expect',
    title: 'Results that you feel, not figure out.',
    body:
      'Neurtalize is experience consciousness work, not academic theory. Most people notice lightness, relief, or a spontaneous breath in and out as tension releases. Some feel a brief jolt as the nervous system resets. your experience will be unique, because you are unique. You may not gain new insight, but the emotion that blocked you before may simply stop being there.',
  },
  care: {
    label: 'Before you buy',
    title: 'This is real work with emotion.',
    body:
      'Consciousness work with emotions can trigger some people. If you are in therapy, under psychiatric care, or take medication for a psychological condition, please check with your professional before starting. Neutralize is not therapy and not a treatment. It is self-directed consciousness exploration, so you take responsibility for the result',
  },

  founder: {
    quote:
      '“I spent thousands of hours meditating so you don’t have to. In the next few hours, I’ll share a way of experiencing how your you have probably never thought about.”',
    byline: 'Peter J Hill · Founder of NeuroYou and creator of the Neutralize Protocol',
    portrait: '/peter-hill.jpg',
  },

  enroll: {
    eyebrow: 'Enroll',
    title: 'Start the Neutralize Protocol.',
    includes: [
      '7 modules, video and audio',
      'Guided practice rooms, accessable time',
      'Deskstop, mobile, tablet',
      'Private practice journal',
      'Lifetime access, including updates',
      'Enables access to NeuroGoal once completed',
    ],
    // [pending] Peter to supply. When null, the sentence is simply left out (nothing like
    // "[YOUR REFUND POLICY]" can ever reach the public page).
    refund: null as string | null,
  },

  faqs: [
    {
      q: 'Do I need to do the free exercises first?',
      a: 'Yes, for best results. The free Learn exercises train the attention skills Neutralize uses, especially Abstraction. You can enroll first, the free exercises are always available',
    },
    {
      q: 'How long does it take?',
      a: 'About four hours of lessons, at your own pace. Learning the Neutralize steps is quick. Mastering them in daily life takes repetition a some discipline, which is what the practice room is for.',
    },
    {
      q: 'Is this therapy?',
      a: 'No. It is personal consciousness and attention training informed by neuroscience. If you are in therapy or under medical care, please check with your health professional before you start.',
    },
    {
      q: 'Do I have to read the research paper?',
      a: 'No. It is written in precise academic language for those who want to think more deeply about the concepts behind Neutralize. The course explains everything you need in clear language and and action steps.',
    },
    {
      q: 'What if it does not work for me?',
      a: 'Experiences vary, and yours will be as unique as you are. Module 5 is an additional lecture for troubleshooting the most common reason for getting stuck and what to do.',
    },
    {
      q: 'What is the refund policy?',
      a: 'If for any reason, you are not happy with your Neutralize experience, NeuroYou will provide a full refund, no questions asked. The only request is you complete an short survey so your experience can help improve the technique for others. ',
    },
  ],

  after: { label: 'What comes after Neutralize' },
}
