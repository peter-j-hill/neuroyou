import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ExercisesPage() {
  const supabase = await createClient()
  const { data: exercises } = await supabase
    .from('blog_posts')
    .select('id, title, published_at, body, cover_image')
    .eq('type', 'exercise')
    .order('sort_order', { ascending: true })

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <p className="label mb-10">
        <span className="node mr-3" />
        Learn / Free Exercises
      </p>
      <h1 className="text-4xl font-light text-[var(--white)] tracking-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
        Learn
      </h1>
      <p className="text-sm text-[var(--muted)] font-light mb-16 max-w-md leading-relaxed">
        Start your personal consciousness lab with these simple, free exercises. Most can be done in just a few minutes, wherever you are right now. They can be done in any order. The exercises help you reconnect with your senses, and start your exploration of consciousness. Making notes about your insights is highly recommended — there are optional self reflection prompts in each exercise.
      </p>

      {exercises && exercises.length > 0 ? (
        <div className="divide-y divide-[var(--border)]">
          {exercises.map((ex) => (
            <Link
              key={ex.id}
              href={`/exercises/${ex.id}`}
              className="group flex items-start justify-between gap-8 py-10 hover:text-[var(--blue)] transition-colors"
            >
              <div className="flex gap-6 items-start w-full">
                {ex.cover_image && (
                  <img src={ex.cover_image} alt="" className="w-24 h-24 object-cover border border-[var(--border)] shrink-0 hidden sm:block" />
                )}
                <div className="min-w-0 flex-1">
                  <time className="label block mb-4">
                    {new Date(ex.published_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </time>
                  <h2 className="text-xl font-light text-[var(--white)] group-hover:text-[var(--blue)] transition-colors tracking-tight mb-3">
                    {ex.title}
                  </h2>
                  {ex.body && (
                    <p className="text-xs text-[var(--muted)] font-light leading-relaxed line-clamp-2 max-w-xl">
                      {ex.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 220)}…
                    </p>
                  )}
                </div>
              </div>
              <span className="text-[var(--blue)] text-sm shrink-0 mt-1">→</span>
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
