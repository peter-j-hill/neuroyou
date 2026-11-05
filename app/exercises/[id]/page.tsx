import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AudioPlayer from '@/app/components/AudioPlayer'
import { MdxContent } from '@/lib/mdx'
import ArticleLayout from '@/components/ArticleLayout'
import JournalCta from '@/components/journal/JournalCta'
import ExerciseVideo from '@/components/ExerciseVideo'

export const dynamic = 'force-dynamic'

export default async function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: exercise } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .eq('site', 'neuroyou')
    .eq('type', 'exercise')
    .single()

  if (!exercise) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const media =
    exercise.video_url || exercise.audio_url ? (
      <>
        {exercise.video_url && <ExerciseVideo videoUrl={exercise.video_url} title={exercise.title} />}
        {exercise.audio_url && <AudioPlayer src={exercise.audio_url} filename={`${exercise.title}.mp3`} />}
      </>
    ) : null

  return (
    <ArticleLayout
      backHref="/exercises"
      backLabel="Learn"
      kind="Exercise"
      date={new Date(exercise.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      title={exercise.title}
      excerpt={exercise.excerpt}
      heroAsset={exercise.hero_asset}
      heroAlt={exercise.hero_alt}
      heroFocal={exercise.hero_focal}
      media={media}
    >
      {exercise.body_mdx && <MdxContent source={exercise.body_mdx} variant="light" />}
      <JournalCta exerciseId={exercise.id} signedIn={!!user} />
    </ArticleLayout>
  )
}
