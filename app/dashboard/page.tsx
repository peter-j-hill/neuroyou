import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from './SignOutButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-start justify-between mb-12">
        <div>
          <p className="text-sm font-sans text-[var(--muted)] tracking-widest uppercase mb-2">
            Account
          </p>
          <h1 className="text-2xl font-normal">
            {profile?.full_name ?? user.email}
          </h1>
          <p className="text-sm text-[var(--muted)] font-sans mt-1">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      {/* Neutralize access */}
      <section className="mb-12 pb-12 border-b border-[var(--border)]">
        <h2 className="text-base font-normal mb-6">Neutralize</h2>
        {profile?.purchased_neutralize ? (
          <div>
            <p className="text-sm font-sans text-[var(--muted)] mb-6">
              You have full access.
            </p>
            {progress && progress.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-sans text-[var(--muted)] uppercase tracking-wider mb-3">
                  Completion log
                </p>
                {progress.map((p) => {
                  const mod = p.neutralize_modules as unknown as { order_index: number; title: string } | null
                  return (
                    <div key={p.module_id} className="flex items-center justify-between text-sm font-sans py-2 border-b border-[var(--border)]">
                      <span className="text-[var(--foreground)]">
                        Module {mod?.order_index} — {mod?.title}
                      </span>
                      <span className="text-[var(--muted)]">
                        {new Date(p.completed_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <Link
                href="/neutralize/1"
                className="text-sm font-sans text-[var(--accent)] hover:underline underline-offset-4"
              >
                Begin Module 1 →
              </Link>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm font-sans text-[var(--muted)] mb-4">
              You don&apos;t have access to Neutralize yet.
            </p>
            <Link
              href="/neutralize"
              className="text-sm font-sans text-[var(--accent)] hover:underline underline-offset-4"
            >
              View the course →
            </Link>
          </div>
        )}
      </section>

      {/* Free content */}
      <section>
        <h2 className="text-base font-normal mb-4">Free content</h2>
        <div className="flex gap-4 text-sm font-sans">
          <Link href="/exercises" className="text-[var(--accent)] hover:underline underline-offset-4">
            Exercises library
          </Link>
          <Link href="/blog" className="text-[var(--accent)] hover:underline underline-offset-4">
            Research articles
          </Link>
        </div>
      </section>
    </div>
  )
}
