import { createClient } from '@/lib/supabase/server'
import { MAX_ENTRY_CHARS } from '@/lib/journal/entries'
import { ANSWER_RESULTS, tidyEmotion, type AnswerResult } from './wording'
import { loadCourseState } from './load'
import { hasActivePurchase } from './purchase'
import { getProtocol, isAdminUser } from './protocols'

export type PracticeSaveResult = { ok: true } | { ok: false }

/** The emotions practice room's lesson, from a student's course state. */
export const isEmotionsRoom = (l: { kind: string; config: Record<string, unknown> | null }) =>
  l.kind === 'practice' && l.config?.room !== 'advanced'

/**
 * Saves one practice session to the signed-in student's journal: the emotion they worked on, how it felt
 * afterwards (Step 6) and an optional note. Server actions can be called by anyone, so everything is checked
 * again here: signed in, owns the protocol (or is the admin), and the practice room is open to them. The entry is
 * written with the student's own session, so row-level security is the last check.
 */
export async function recordPracticeEntry(input: {
  protocolSlug: string
  emotion: string
  result: string
  note: string
}): Promise<PracticeSaveResult> {
  const emotion = typeof input.emotion === 'string' ? tidyEmotion(input.emotion) : null
  const result = (ANSWER_RESULTS as readonly string[]).includes(input.result) ? (input.result as AnswerResult) : null
  const note = typeof input.note === 'string' ? input.note.trim() : ''
  if (!emotion || !result || note.length > MAX_ENTRY_CHARS) return { ok: false }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false }

  const protocol = await getProtocol(supabase, input.protocolSlug)
  if (!protocol) return { ok: false }
  const admin = isAdminUser(user)
  if (!admin && !(await hasActivePurchase(user.id, protocol.id))) return { ok: false }

  const state = await loadCourseState(supabase, { protocolId: protocol.id, userId: user.id, unlockAll: admin })
  const open = state.modules.some((m) => !m.locked && m.lessons.some(isEmotionsRoom))
  if (!open) return { ok: false }

  const { error } = await supabase.from('protocol_journal_entries').insert({
    user_id: user.id,
    protocol_id: protocol.id,
    kind: 'practice',
    topic_kind: 'emotion',
    topic: emotion,
    result,
    text: note,
  })
  return error ? { ok: false } : { ok: true }
}
