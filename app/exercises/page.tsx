import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const revalidate = 0

export default async function ExercisesPage() {
  const supabase = await createClient()
  const { data: exercises } = await supabase
    .from('free_exercises')
    .select('id, title, category, body')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <p className="label mb-10">
        <span className="node mr-3" />
        Free / Open access
      </p>
      <h1 className="text-4xl font-light text-[var(--white)] tracking-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
        Exercises Library
      </h1>
      <p className="text-sm text-[var(--muted)] font-light mb-16 max-w-md leading-relaxed">
        Practical techniques for working with attention, sensation, and emotional state.
        Text and audio. No sequence — begin anywhere.
      </p>

      {exercises && exercises.length > 0 ? (
        <div className="grid gap-px bg-[var(--border)]">
          {exercises.map((ex) => (
            <Link
              key={ex.id}
              href={`/exercises/${ex.id}`}
              className="group flex items-start justify-between gap-8 p-8 bg-[var(--black)] hover:bg-[var(--graphite)] transition-colors"
            >
              <div>
                {ex.category && (
                  <p className="label mb-3">{ex.category}</p>
                )}
                <h2 className="text-base font-light text-[var(--white)] group-hover:text-[var(--blue)] transition-colors tracking-tight">
                  {ex.title}
                </h2>
                {ex.body && (
                  <p className="text-xs text-[var(--muted)] mt-2 leading-relaxed font-light line-clamp-2 max-w-lg">
                    {ex.body.slice(0, 160)}…
                  </p>
                )}
              </div>
              <span className="text-[var(--blue)] text-sm shrink-0 mt-1 group-hover:text-glow-blue transition-all">→</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border border-[var(--border)]">
          <p className="label">Exercises loading</p>
          <p className="text-xs text-[var(--muted)] mt-3 font-light">Content will appear here once published.</p>
        </div>
      )}
    </div>
  )
}
