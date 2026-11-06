// Practice room wording. The words live in content/practice-wording.json (generated from Peter's spreadsheet by
// scripts/build-practice-wording.mjs) and content/practice-interface.json (the words around the steps).
// Nothing in the room components is hard-coded text.

import wordingJson from '@/content/practice-wording.json'
import interfaceJson from '@/content/practice-interface.json'

export type StepText = { main: string; support: string }

export type RoomWording = {
  opening: string
  pills: string[]
  placeholder: string
  step2: StepText
  step3: StepText & { lines: string[] }
  step6: { question: string; answers: string[] }
}

export type SharedWording = {
  step4: StepText & { label: string }
  step5: StepText & { label: string }
  afterZoom: string
  step7Emotions: StepText & { label: string }
  step7Advanced: StepText & { label: string }
}

export type PracticeInterface = typeof interfaceJson

/** Everything the emotions room needs; the senses of the advanced room are not sent to the browser here. */
export type EmotionRoomWording = { room: RoomWording; shared: SharedWording; ui: PracticeInterface }

export function emotionRoomWording(): EmotionRoomWording {
  return {
    room: (wordingJson as unknown as { emotion: RoomWording }).emotion,
    shared: (wordingJson as unknown as { shared: SharedWording }).shared,
    ui: interfaceJson,
  }
}

/** The order of the spreadsheet's four answer buttons, and what each is saved as in the journal. */
export const ANSWER_RESULTS = ['lighter', 'neutral', 'same', 'stronger'] as const
export type AnswerResult = (typeof ANSWER_RESULTS)[number]

/** "About the same" and "Stronger" mean another round (Step 7); "Lighter" and "Neutral" lead to the note. */
export const needsAnotherRound = (r: AnswerResult | null) => r === 'same' || r === 'stronger'

/** Spaces become underscores and quotes are dropped, so an emotion reads as part of an instruction: feel(let_down). */
export const instructionName = (choice: string) => choice.replace(/[’']/g, '').trim().replace(/\s+/g, '_')

/** Fills the [emotion] placeholder in an instruction line. */
export const fillInstruction = (line: string, choice: string) => line.replace('[emotion]', instructionName(choice))

/** Splits text around its [emotion] placeholder so the emotion can be shown underlined in the middle. */
export function splitAtEmotion(text: string): [string, string] {
  const i = text.indexOf('[emotion]')
  return i < 0 ? [text, ''] : [text.slice(0, i), text.slice(i + '[emotion]'.length)]
}

/** What a person typed as their own emotion, tidied. Returns null when it is not usable. */
export function tidyEmotion(input: string): string | null {
  const t = input.trim().toLowerCase().replace(/\s+/g, ' ')
  return /^[\p{L}][\p{L}' ’-]{0,39}$/u.test(t) ? t : null
}
