import type { SupabaseClient } from '@supabase/supabase-js'
import type { JournalEntry } from './entries'

type Row = Omit<JournalEntry, 'detail'> & { lesson: { title: string } | null; exercise: { title: string } | null }

/**
 * A person's journal, newest first. Run with their own session: row-level security means only their own
 * rows can ever come back. The lesson title only resolves while they still have access to that lesson.
 */
export async function loadJournal(supabase: SupabaseClient, userId: string, limit = 500): Promise<JournalEntry[]> {
  const { data } = await supabase
    .from('protocol_journal_entries')
    .select('id, created_at, kind, topic_kind, topic, item, result, text, lesson:protocol_lessons(title), exercise:content(title)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return ((data ?? []) as unknown as Row[]).map(({ lesson, exercise, ...e }) => ({ ...e, detail: lesson?.title ?? exercise?.title ?? null }))
}
