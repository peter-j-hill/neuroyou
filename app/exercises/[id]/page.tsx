import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const revalidate = 60

export default async function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: exercise } = await supabase
    .from('free_exercises')
    .select('*')
    .eq('id', id)
    .single()

  if (!exercise) notFound()

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <a href="/exercises" className="text-sm font-sans text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-8 inline-block">
        ← All exercises
      </a>

      {exercise.category && (
        <p className="text-xs font-sans text-[var(--muted)] uppercase tracking-wider mb-4">
          {exercise.category}
        </p>
      )}

      <h1 className="text-3xl font-normal mb-10">{exercise.title}</h1>

      {exercise.audio_url && (
        <div className="mb-10 p-6 bg-[var(--accent-light)] rounded-sm">
          <p className="text-xs font-sans text-[var(--muted)] uppercase tracking-wider mb-3">
            Audio version
          </p>
          <audio controls className="w-full" preload="none">
            <source src={exercise.audio_url} />
            Your browser does not support audio playback.
          </audio>
        </div>
      )}

      <div className="prose">
        {exercise.body?.split('\n\n').map((para: string, i: number) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  )
}
