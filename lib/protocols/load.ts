import type { SupabaseClient } from '@supabase/supabase-js'
import { buildCourseState, type CourseState, type LessonRow, type ModuleRow, type ProgressRow } from './course'

/**
 * Reads one protocol's modules, lessons and one student's progress, and works out the course state.
 * Run with the student's own session: row-level security shows a buyer published content only
 * and the admin everything, so no extra filtering is needed here.
 */
export async function loadCourseState(
  supabase: SupabaseClient,
  opts: { protocolId: string; userId: string; unlockAll: boolean },
): Promise<CourseState> {
  const [modules, lessons, progress] = await Promise.all([
    supabase
      .from('protocol_modules')
      .select('id, ordinal, slug, title, summary, unlock_after_ordinal')
      .eq('protocol_id', opts.protocolId)
      .order('ordinal'),
    supabase
      .from('protocol_lessons')
      .select('id, module_id, ordinal, slug, kind, title, duration_min, required, video_ref, config')
      .eq('protocol_id', opts.protocolId)
      .order('ordinal'),
    supabase.from('protocol_lesson_progress').select('lesson_id, started_at, completed_at, last_position_seconds').eq('user_id', opts.userId),
  ])
  return buildCourseState({
    modules: (modules.data ?? []) as ModuleRow[],
    lessons: (lessons.data ?? []) as LessonRow[],
    progress: (progress.data ?? []) as ProgressRow[],
    unlockAll: opts.unlockAll,
  })
}
