import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const revalidate = 60

export default async function ExercisesPage() {
  const supabase = await createClient()
  const { data: exercises } = await supabase
    .from('free_exercises')
    .select('id, title, category, body')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="text-sm font-sans text-[var(--muted)] tracking-widest uppercase mb-4">
        Free exercises
      </p>
      <h1 className="text-3xl font-normal mb-3">Exercises library</h1>
      <p className="text-[var(--muted)] mb-12 max-w-xl">
        Practical techniques for working with attention, sensation, and emotional state.
        Text and audio. No sequence — start anywhere.
      </p>

      {exercises && exercises.length > 0 ? (
        <div className="grid gap-4">
          {exercises.map((ex) => (
            <Link
              key={ex.id}
              href={`/exercises/${ex.id}`}
              className="group block p-6 border border-[var(--border)] rounded-sm hover:border-[var(--accent)] transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  {ex.category && (
                    <p className="text-xs font-sans text-[var(--muted)] uppercase tracking-wider mb-2">
                      {ex.category}
                    </p>
                  )}
                  <h2 className="text-base font-normal group-hover:text-[var(--accent)] transition-colors">
                    {ex.title}
                  </h2>
                  {ex.body && (
                    <p className="text-sm text-[var(--muted)] mt-2 line-clamp-2 leading-relaxed">
                      {ex.body.slice(0, 160)}…
                    </p>
                  )}
                </div>
                <span className="text-[var(--muted)] text-lg mt-0.5 shrink-0">→</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border border-[var(--border)] rounded-sm">
          <p className="text-[var(--muted)] font-sans text-sm">
            Exercises coming soon. Check back shortly.
          </p>
        </div>
      )}
    </div>
  )
}
