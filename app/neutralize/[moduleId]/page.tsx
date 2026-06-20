import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import CompleteButton from './CompleteButton'

export default async function ModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/neutralize/' + moduleId)

  // Check purchase
  const { data: profile } = await supabase
    .from('profiles')
    .select('purchased_neutralize')
    .eq('id', user.id)
    .single()

  if (!profile?.purchased_neutralize) redirect('/neutralize')

  const { data: module } = await supabase
    .from('neutralize_modules')
    .select('*')
    .eq('id', moduleId)
    .single()

  if (!module) notFound()

  // Check if already completed
  const { data: progress } = await supabase
    .from('module_progress')
    .select('completed_at')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .single()

  // Get adjacent modules for navigation
  const { data: allModules } = await supabase
    .from('neutralize_modules')
    .select('id, order_index, title')
    .order('order_index', { ascending: true })

  const currentIdx = allModules?.findIndex((m) => m.id === moduleId) ?? -1
  const prevModule = currentIdx > 0 ? allModules![currentIdx - 1] : null
  const nextModule = allModules && currentIdx < allModules.length - 1 ? allModules[currentIdx + 1] : null

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <Link href="/neutralize" className="text-sm font-sans text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
          ← All modules
        </Link>
        {progress?.completed_at && (
          <p className="text-xs font-sans text-[var(--muted)]">
            Completed:{' '}
            {new Date(progress.completed_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
      </div>

      <p className="text-xs font-sans text-[var(--muted)] uppercase tracking-wider mb-3">
        Module {module.order_index}
      </p>
      <h1 className="text-3xl font-normal mb-10">{module.title}</h1>

      {/* Video */}
      {module.video_url && (
        <div className="mb-10 aspect-video">
          <iframe
            src={module.video_url}
            className="w-full h-full rounded-sm"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Audio */}
      {module.audio_url && (
        <div className="mb-10 p-6 bg-[var(--accent-light)] rounded-sm">
          <p className="text-xs font-sans text-[var(--muted)] uppercase tracking-wider mb-3">
            Audio exercise
          </p>
          <audio controls className="w-full" preload="none">
            <source src={module.audio_url} />
          </audio>
        </div>
      )}

      {/* Slides */}
      {module.slides_url && (
        <div className="mb-10">
          <p className="text-xs font-sans text-[var(--muted)] uppercase tracking-wider mb-3">
            Slides
          </p>
          <a
            href={module.slides_url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-sans text-[var(--accent)] hover:underline underline-offset-4"
          >
            Download slides (PDF) →
          </a>
        </div>
      )}

      {/* Body text */}
      {module.body_text && (
        <div className="prose mb-16">
          {module.body_text.split('\n\n').map((para: string, i: number) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}

      {/* Completion + navigation */}
      <div className="border-t border-[var(--border)] pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex gap-4">
          {prevModule && (
            <Link
              href={`/neutralize/${prevModule.id}`}
              className="text-sm font-sans text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              ← Module {prevModule.order_index}
            </Link>
          )}
          {nextModule && (
            <Link
              href={`/neutralize/${nextModule.id}`}
              className="text-sm font-sans text-[var(--accent)] hover:underline underline-offset-4"
            >
              Module {nextModule.order_index} →
            </Link>
          )}
        </div>
        {!progress?.completed_at && (
          <CompleteButton moduleId={moduleId} userId={user.id} />
        )}
      </div>
    </div>
  )
}
