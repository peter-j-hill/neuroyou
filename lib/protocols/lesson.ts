import type { SupabaseClient } from '@supabase/supabase-js'

export type Chapter = { t: number; title: string }
export type TranscriptLine = { t: number; text: string }

export type LessonDetail = {
  videoProvider: string | null
  videoRef: string | null
  chapters: Chapter[]
  transcript: TranscriptLine[]
}

// Chapters and transcript are jsonb typed in the admin; accept only well-formed entries, in time order.
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0

function parseList<T>(raw: unknown, pick: (item: Record<string, unknown>) => T | null, time: (item: T) => number): T[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => (item && typeof item === 'object' ? pick(item as Record<string, unknown>) : null))
    .filter((item): item is T => item !== null)
    .sort((a, b) => time(a) - time(b))
}

export const parseChapters = (raw: unknown): Chapter[] =>
  parseList(raw, (i) => (isNum(i.t) && typeof i.title === 'string' ? { t: i.t, title: i.title } : null), (c) => c.t)

export const parseTranscript = (raw: unknown): TranscriptLine[] =>
  parseList(raw, (i) => (isNum(i.t) && typeof i.text === 'string' ? { t: i.t, text: i.text } : null), (l) => l.t)

/** The parts of a lesson the course outline does not carry. Row-level security decides who can read it. */
export async function loadLessonDetail(supabase: SupabaseClient, lessonId: string): Promise<LessonDetail | null> {
  const { data } = await supabase
    .from('protocol_lessons')
    .select('video_provider, video_ref, chapters, transcript')
    .eq('id', lessonId)
    .maybeSingle()
  if (!data) return null
  return {
    videoProvider: data.video_provider,
    videoRef: data.video_ref,
    chapters: parseChapters(data.chapters),
    transcript: parseTranscript(data.transcript),
  }
}
