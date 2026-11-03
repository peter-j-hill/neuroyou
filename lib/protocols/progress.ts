import { createClient } from '@/lib/supabase/server'
import { videoFinished } from './course'
import { loadCourseState } from './load'
import { hasActivePurchase, serviceClient } from './purchase'
import { getProtocol, isAdminUser } from './protocols'

export type ProgressResult = { ok: true; completed: boolean } | { ok: false }

const MAX_VIDEO_SECONDS = 6 * 60 * 60

/**
 * Saves where a student is in a video lesson, and marks the lesson finished once enough of it has played.
 * Server actions can be called by anyone, so everything is checked again here: signed in, owns the protocol
 * (or is the admin), the lesson belongs to it and is open to them. Progress is written with the service role
 * because students cannot write the table themselves. A finished lesson is never un-finished.
 */
export async function recordVideoProgress(input: {
  protocolSlug: string
  lessonId: string
  seconds: number
  duration: number
}): Promise<ProgressResult> {
  const { seconds, duration } = input
  if (!Number.isFinite(seconds) || !Number.isFinite(duration) || seconds < 0 || duration <= 0 || duration > MAX_VIDEO_SECONDS) return { ok: false }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false }

  const protocol = await getProtocol(supabase, input.protocolSlug)
  if (!protocol) return { ok: false }
  const admin = isAdminUser(user)
  if (!admin && !(await hasActivePurchase(user.id, protocol.id))) return { ok: false }

  const state = await loadCourseState(supabase, { protocolId: protocol.id, userId: user.id, unlockAll: admin })
  const mod = state.modules.find((m) => m.lessons.some((l) => l.id === input.lessonId))
  const lesson = mod?.lessons.find((l) => l.id === input.lessonId)
  if (!mod || !lesson || mod.locked || lesson.kind !== 'video') return { ok: false }

  const position = Math.min(Math.floor(seconds), Math.floor(duration))
  const finishedNow = videoFinished(position, duration)
  const alreadyDone = lesson.state === 'done'

  const row: Record<string, unknown> = {
    user_id: user.id,
    lesson_id: lesson.id,
    last_position_seconds: position,
    updated_at: new Date().toISOString(),
  }
  if (finishedNow && !alreadyDone) row.completed_at = new Date().toISOString()

  const { error } = await serviceClient().from('protocol_lesson_progress').upsert(row, { onConflict: 'user_id,lesson_id' })
  if (error) return { ok: false }
  return { ok: true, completed: alreadyDone || finishedNow }
}
