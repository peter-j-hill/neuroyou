// Learn (exercise) categories. They are stored as rows in the existing `tags`
// table (linked through `content_tags`), matched here by exact title. Only these
// three are treated as categories; any other tag on an exercise is ignored by
// Learn. Order here is the order of the filter chips.
export const EXERCISE_CATEGORIES = [
  'External Consciousness',
  'Internal Consciousness',
  'Abstract Consciousness',
] as const

export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number]

// Pick the category out of a content row's tag titles (first match wins).
export function categoryFromTags(tagTitles: string[]): ExerciseCategory | null {
  return EXERCISE_CATEGORIES.find((c) => tagTitles.includes(c)) ?? null
}
