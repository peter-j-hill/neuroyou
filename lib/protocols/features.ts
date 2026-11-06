import type { LessonKind } from './course'

// Switches for course pages that are built in later phases. While a switch is off, the course
// home shows the feature as "coming soon" instead of linking to a page that does not exist yet.
// Each phase turns on its own switch when its pages ship.
export const FEATURES = {
  lessonPlayer: true, // Phase 3b (video lessons so far; other lesson kinds follow)
  practiceRoom: true, // Phase 4 (the emotions room; the advanced room has its own switch)
  journal: true, // Phase 5 (journal for everyone, /journal)
  advancedRoom: false, // Phase 6
} as const

// Lesson kinds that have a page at /protocols/[protocol]/lesson/[lesson].
const LESSON_PAGE_KINDS: LessonKind[] = ['video']

/** Whether a page exists yet for this lesson, so the course home only links to pages that work. */
export function isLessonBuilt(lesson: { kind: LessonKind; config: Record<string, unknown> | null }): boolean {
  if (lesson.kind === 'practice') return lesson.config?.room === 'advanced' ? FEATURES.advancedRoom : FEATURES.practiceRoom
  return FEATURES.lessonPlayer && LESSON_PAGE_KINDS.includes(lesson.kind)
}
