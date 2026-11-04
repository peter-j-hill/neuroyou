import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadJournal } from '@/lib/journal/load'
import { getProtocol, isAdminUser } from '@/lib/protocols/protocols'
import { hasActivePurchase } from '@/lib/protocols/purchase'
import JournalView from '@/components/journal/JournalView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Your journal · NeuroYou', robots: { index: false, follow: false } }

type Search = Promise<{ [key: string]: string | string[] | undefined }>

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// The journal belongs to the person: every account has one, bought a protocol or not.
// Layout from design canvas artboard 06. See the pull request for the copy that differs from the canvas.
export default async function JournalPage({ searchParams }: { searchParams: Search }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/journal')

  const sp = await searchParams
  const exerciseParam = Array.isArray(sp.exercise) ? sp.exercise[0] : sp.exercise

  const [entries, neutralize, exercise] = await Promise.all([
    loadJournal(supabase, user.id),
    getProtocol(supabase, 'neutralize'),
    // "Add to your journal" on a free exercise arrives with ?exercise=<id>, so the note starts tagged with it.
    exerciseParam && UUID.test(exerciseParam)
      ? supabase.from('content').select('id, title').eq('id', exerciseParam).eq('site', 'neuroyou').eq('type', 'exercise').maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const hasProtocol = !!neutralize && (isAdminUser(user) || (await hasActivePurchase(user.id, neutralize.id)))

  return (
    <JournalView
      entries={entries}
      exercise={exercise.data ? { id: exercise.data.id as string, title: exercise.data.title as string } : null}
      back={hasProtocol ? { href: '/protocols/neutralize', label: 'The Neutralize Protocol' } : { href: '/dashboard', label: 'Account' }}
      hasProtocol={hasProtocol}
    />
  )
}
