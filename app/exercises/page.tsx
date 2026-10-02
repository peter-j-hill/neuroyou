import { createClient } from '@/lib/supabase/server'
import ExerciseGrid, { type Exercise } from '@/components/ExerciseGrid'
import { categoryFromTags } from '@/lib/categories'

export const dynamic = 'force-dynamic'

// Page copy from the redesign handoff. Previous strings, kept here so they are
// easy to restore:
//   heading: "Learn"
//   intro: "Start your personal consciousness lab with these simple, free exercises.
//   Most can be done in just a few minutes, wherever you are right now. They can be
//   done in any order. The exercises help you reconnect with your senses, and start
//   your exploration of consciousness. Making notes about your insights is highly
//   recommended — there are optional self reflection prompts in each exercise."
const COPY = {
  eyebrow: 'Learn · Free',
  heading: 'Practices.',
  intro:
    'Short text and audio practices for attention, sensation, and emotional state. No sequence. Begin anywhere.',
}

export default async function ExercisesPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('content')
    .select('id, title, excerpt, hero_asset, hero_focal, audio_url, video_url, content_tags(tags(title))')
    .eq('site', 'neuroyou')
    .eq('type', 'exercise')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  // Category = the exercise's tag that is one of the three Learn categories.
  type Row = Omit<Exercise, 'category'> & { content_tags: { tags: { title: string } | null }[] | null }
  const exercises: Exercise[] = ((data ?? []) as unknown as Row[]).map(({ content_tags, ...ex }) => ({
    ...ex,
    category: categoryFromTags((content_tags ?? []).flatMap((ct) => (ct.tags ? [ct.tags.title] : []))),
  }))

  return (
    <div className="ny-scope bg-white">
      <div className="max-w-[1120px] mx-auto px-8 pt-24 pb-[120px]">
        <div className="ny-eyebrow mb-3.5">{COPY.eyebrow}</div>
        <h1 className="ny-page-title">{COPY.heading}</h1>
        <p className="ny-lede mt-5 max-w-[640px]" style={{ fontSize: 'clamp(19px, 2.6vw, 24px)', lineHeight: 1.4 }}>
          {COPY.intro}
        </p>

        {exercises.length > 0 ? (
          <ExerciseGrid exercises={exercises} />
        ) : (
          <p className="ny-body mt-16" style={{ color: 'var(--ny-ink-3)' }}>
            Practices will appear here once published.
          </p>
        )}
      </div>
    </div>
  )
}
