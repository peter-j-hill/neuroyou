'use server'

import { createClient } from '@/lib/supabase/server'
import { MAX_ENTRY_CHARS, type JournalEntry } from '@/lib/journal/entries'
import { JOURNAL_SELECT, toEntry, type JournalRow } from '@/lib/journal/load'

export type JournalResultState = { ok: true } | { ok: false; error: string }
export type AddEntryResult = { ok: true; entry: JournalEntry } | { ok: false; error: string }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Adds a note to the signed-in person's own journal. Done with their own session, so row-level security
 * is the final check: they can only ever write rows that belong to them. A note about a free exercise is
 * kind 'exercise'; any other note is kind 'own'. Neither needs a purchase.
 */
export async function addJournalEntry(input: { text: string; exerciseId?: string | null }): Promise<AddEntryResult> {
  const text = typeof input.text === 'string' ? input.text.trim() : ''
  if (!text) return { ok: false, error: 'Write something first.' }
  if (text.length > MAX_ENTRY_CHARS) return { ok: false, error: `Entries can be up to ${MAX_ENTRY_CHARS.toLocaleString('en-US')} characters.` }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Please sign in again.' }

  let contentId: string | null = null
  if (input.exerciseId) {
    if (!UUID.test(input.exerciseId)) return { ok: false, error: 'That exercise could not be found.' }
    const { data: exercise } = await supabase
      .from('content')
      .select('id')
      .eq('id', input.exerciseId)
      .eq('site', 'neuroyou')
      .eq('type', 'exercise')
      .maybeSingle()
    if (!exercise) return { ok: false, error: 'That exercise could not be found.' }
    contentId = exercise.id
  }

  const { data, error } = await supabase
    .from('protocol_journal_entries')
    .insert({ user_id: user.id, kind: contentId ? 'exercise' : 'own', content_id: contentId, text })
    .select(JOURNAL_SELECT)
    .single()
  if (error || !data) return { ok: false, error: 'Your note could not be saved. Please try again.' }
  return { ok: true, entry: toEntry(data as unknown as JournalRow) }
}

export async function deleteJournalEntry(id: string): Promise<JournalResultState> {
  if (!UUID.test(id)) return { ok: false, error: 'That entry could not be found.' }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Please sign in again.' }

  const { error } = await supabase.from('protocol_journal_entries').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { ok: false, error: 'The entry could not be deleted. Please try again.' }
  return { ok: true }
}
