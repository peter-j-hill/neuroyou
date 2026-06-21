import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const revalidate = 0

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
    <div className="max-w-5xl mx-auto px-6 py-20">
      <a href="/exercises" className="label hover:text-[var(--white)] transition-colors mb-12 inline-flex items-center gap-2">
        ← All exercises
      </a>

      <div className="grid sm:grid-cols-2 gap-16 mt-12">
        <div>
          {exercise.category && (
            <p className="label mb-6">{exercise.category}</p>
          )}
          <h1 className="text-3xl font-light text-[var(--white)] tracking-tight mb-12" style={{ letterSpacing: '-0.02em' }}>
            {exercise.title}
          </h1>

          {exercise.audio_url && (
            <div className="mb-12 border border-[var(--border)] p-6 glow-blue">
              <p className="label mb-4">Audio version</p>
              <audio controls className="w-full" preload="none" style={{ filter: 'invert(1) hue-rotate(180deg)' }}>
                <source src={exercise.audio_url} />
              </audio>
            </div>
          )}
        </div>

        <div className="prose">
          {exercise.body?.split('\n\n').map((para: string, i: number) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </div>
  )
}
