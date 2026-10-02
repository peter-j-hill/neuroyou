import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { type AccessItem } from './AccessCard'
import DashboardView, { type LogEntry } from './DashboardView'

// The dashboard shows a signed-in person what they have access to: purchased
// courses (with links), their progress, and a shortcut to Admin for the admin.
//
// Courses are listed in `items` below. Today the only one is Neutralize, switched
// on by profiles.purchased_neutralize. When purchasing is built and the hosting
// decision is made (on this site or elsewhere), add the new courses here and set
// `external: true` with a full URL for any that live off-site.
//
// Previous page (dark theme): "Account" eyebrow, name, "Neutralize" section with a
// completion log and "Begin Module 1 →" / "View the course →", and a "Free content"
// section with "Exercises library" and "Research articles" links.

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'peter.j.hill@live.com'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/dashboard')

  const isAdmin = user.email === ADMIN_EMAIL

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: progress } = await supabase
    .from('module_progress')
    .select('module_id, completed_at, neutralize_modules(order_index, title)')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })

  const { data: modules } = await supabase
    .from('neutralize_modules')
    .select('id, order_index')
    .order('order_index', { ascending: true })

  const items: AccessItem[] = []
  if (profile?.purchased_neutralize) {
    const done = new Set((progress ?? []).map((p) => p.module_id))
    const total = modules?.length ?? 0
    const next = (modules ?? []).find((m) => !done.has(m.id))
    const started = done.size > 0
    items.push({
      id: 'neutralize',
      title: 'Neutralize',
      summary: total
        ? started
          ? `${done.size} of ${total} modules complete.`
          : `${total} modules, taken in order.`
        : 'Full access.',
      status: 'Full access',
      href: next ? `/neutralize/${next.id}` : '/neutralize',
      cta: !next && total ? 'Review the course' : started ? 'Continue' : 'Begin Module 1',
    })
  }

  const log: LogEntry[] = profile?.purchased_neutralize
    ? (progress ?? []).map((p) => {
        const mod = p.neutralize_modules as unknown as { order_index: number; title: string } | null
        return { moduleId: p.module_id, order: mod?.order_index ?? null, title: mod?.title ?? null, completedAt: p.completed_at }
      })
    : []

  return (
    <DashboardView
      name={profile?.full_name || user.email || 'Your account'}
      email={user.email ?? ''}
      showEmail={!!profile?.full_name}
      isAdmin={isAdmin}
      items={items}
      log={log}
    />
  )
}
