import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { type AccessItem } from './AccessCard'
import DashboardView from './DashboardView'
import { serviceClient } from '@/lib/protocols/purchase'
import { loadCourseState } from '@/lib/protocols/load'

// The dashboard shows a signed-in person what they have access to: the protocols they have
// bought (each linking to its course home, with a progress line) and a shortcut to Admin for the admin.
//
// Previous page (dark theme): "Account" eyebrow, name, "Neutralize" section with a
// completion log and "Begin Module 1 →" / "View the course →", and a "Free content"
// section with "Exercises library" and "Research articles" links. The completion log was
// retired with the old Neutralize pages; progress now lives on the course home.

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'peter.j.hill@live.com'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  const isAdmin = user.email === ADMIN_EMAIL

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

  // Bought protocols. Titles come from a server-side lookup so a protocol that is still a draft shows too.
  const { data: purchases } = await supabase
    .from('protocol_purchases')
    .select('protocol_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
  // The journal belongs to every account: show how many notes there are and when the latest was written.
  const [{ count: journalCount }, { data: latestNote }] = await Promise.all([
    supabase.from('protocol_journal_entries').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('protocol_journal_entries').select('created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  const ids = (purchases ?? []).map((p) => p.protocol_id as string)
  const { data: protocols } = ids.length
    ? await serviceClient().from('protocols').select('id, slug, title').in('id', ids).order('sort_order')
    : { data: [] }

  const items: AccessItem[] = []
  for (const p of protocols ?? []) {
    const state = await loadCourseState(supabase, { protocolId: p.id, userId: user.id, unlockAll: false })
    const total = state.modules.filter((m) => m.requiredTotal > 0).length
    const anyProgress = state.modules.some((m) => m.started)
    items.push({
      id: p.slug,
      title: p.title,
      summary: total
        ? anyProgress
          ? `${state.finishedModules} of ${total} modules finished.`
          : `${total} modules, taken in order.`
        : 'Full access.',
      status: 'Full access',
      href: `/protocols/${p.slug}`,
      cta: anyProgress ? 'Continue' : 'Begin',
    })
  }

  return (
    <DashboardView
      name={profile?.full_name || user.email || 'Your account'}
      email={user.email ?? ''}
      showEmail={!!profile?.full_name}
      isAdmin={isAdmin}
      items={items}
      journal={{ count: journalCount ?? 0, latest: latestNote?.created_at ?? null }}
    />
  )
}
