// Turns the course content (modules, lessons) plus one student's progress into what the course
// home needs: what is finished, what is locked, where they are, and what comes next.
// Pure functions: no database access, so the rules are easy to test and read in one place.

export type LessonKind =
  | 'video' | 'audio' | 'reading' | 'try_it' | 'explorer' | 'practice' | 'check_in' | 'care_note' | 'journal_prompt'

export type ModuleRow = {
  id: string
  ordinal: number
  slug: string
  title: string
  summary: string | null
  unlock_after_ordinal: number | null
}

export type LessonRow = {
  id: string
  module_id: string
  ordinal: number
  slug: string
  kind: LessonKind
  title: string
  duration_min: number | null
  required: boolean
  video_ref: string | null
  config: Record<string, unknown> | null
}

export type ProgressRow = {
  lesson_id: string
  started_at: string
  completed_at: string | null
  last_position_seconds: number
}

export type LessonState = 'new' | 'started' | 'done'
export type LessonView = LessonRow & { state: LessonState; resumeSeconds: number }

export type ModuleView = ModuleRow & {
  lessons: LessonView[]
  requiredTotal: number
  requiredDone: number
  /** At least one lesson opened. */
  started: boolean
  /** Has required lessons and every one is done. Open-ended modules (practice) are never "done". */
  done: boolean
  locked: boolean
  isCurrent: boolean
  /** Total minutes when every lesson has a length, otherwise null. */
  minutes: number | null
}

export type CourseState = {
  modules: ModuleView[]
  current: ModuleView | null
  next: { module: ModuleView; lesson: LessonView } | null
  finishedModules: number
  /** The student can open everything (admin review). */
  unlockedAll: boolean
}

/** Short labels for the lesson list, as on the design canvas. */
export const LESSON_LABEL: Record<LessonKind, string> = {
  video: 'VIDEO',
  audio: 'AUDIO',
  reading: 'READ',
  try_it: 'TRY IT',
  explorer: 'EXPLORE',
  practice: 'PRACTICE',
  check_in: 'CHECK-IN',
  care_note: 'CARE NOTE',
  journal_prompt: 'REFLECT',
}

/** Where a lesson lives. Practice rooms are separate full-screen pages, the rest are lesson pages. */
export function lessonHref(protocolSlug: string, lesson: Pick<LessonRow, 'kind' | 'slug' | 'config'>): string {
  if (lesson.kind === 'practice') {
    return lesson.config?.room === 'advanced'
      ? `/protocols/${protocolSlug}/practice/advanced`
      : `/protocols/${protocolSlug}/practice`
  }
  return `/protocols/${protocolSlug}/lesson/${lesson.slug}`
}

export function buildCourseState(input: {
  modules: ModuleRow[]
  lessons: LessonRow[]
  progress: ProgressRow[]
  /** Admin review: nothing is locked. */
  unlockAll?: boolean
}): CourseState {
  const progressByLesson = new Map(input.progress.map((p) => [p.lesson_id, p]))
  const sortedModules = [...input.modules].sort((a, b) => a.ordinal - b.ordinal)

  const built: ModuleView[] = sortedModules.map((m) => {
    const lessons: LessonView[] = input.lessons
      .filter((l) => l.module_id === m.id)
      .sort((a, b) => a.ordinal - b.ordinal)
      .map((l) => {
        const p = progressByLesson.get(l.id)
        return { ...l, state: p?.completed_at ? 'done' : p ? 'started' : 'new', resumeSeconds: p?.last_position_seconds ?? 0 }
      })
    const required = lessons.filter((l) => l.required)
    const requiredDone = required.filter((l) => l.state === 'done').length
    const durations = lessons.map((l) => l.duration_min)
    return {
      ...m,
      lessons,
      requiredTotal: required.length,
      requiredDone,
      started: lessons.some((l) => l.state !== 'new'),
      done: required.length > 0 && requiredDone === required.length,
      locked: false,
      isCurrent: false,
      minutes: lessons.length > 0 && durations.every((d) => d != null) ? durations.reduce<number>((s, d) => s + (d ?? 0), 0) : null,
    }
  })

  // A module opens once the module it depends on is finished.
  const byOrdinal = new Map(built.map((m) => [m.ordinal, m]))
  for (const m of built) {
    m.locked = !input.unlockAll && m.unlock_after_ordinal != null && !byOrdinal.get(m.unlock_after_ordinal)?.done
  }

  // "You are here": the first open module with lessons still to do (open-ended modules never count).
  const current = built.find((m) => !m.locked && m.requiredTotal > 0 && !m.done) ?? null
  if (current) current.isCurrent = true

  const nextLesson = current?.lessons.find((l) => l.required && l.state !== 'done') ?? null

  return {
    modules: built,
    current,
    next: current && nextLesson ? { module: current, lesson: nextLesson } : null,
    finishedModules: built.filter((m) => m.done).length,
    unlockedAll: !!input.unlockAll,
  }
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
