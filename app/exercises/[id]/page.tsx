import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AudioPlayer from '@/app/components/AudioPlayer'
import { MdxContent } from '@/lib/mdx'
import ArticleLayout from '@/components/ArticleLayout'

export const dynamic = 'force-dynamic'

function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return m ? m[1] : null
}

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

  const vid = exercise.video_url ? vimeoId(exercise.video_url) : null

  const media =
    vid || exercise.audio_url ? (
      <>
        {vid && (
          <div className="relative w-full rounded-[18px] overflow-hidden" style={{ paddingTop: '56.25%', background: 'var(--ny-mist)' }}>
            <iframe
              src={`https://player.vimeo.com/video/${vid}?title=0&byline=0&portrait=0&dnt=1`}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
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
    </ArticleLayout>
  )
}
