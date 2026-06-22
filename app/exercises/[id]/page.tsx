import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AudioPlayer from '@/app/components/AudioPlayer'

export const dynamic = 'force-dynamic'

function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return m ? m[1] : null
}

export default async function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: exercise } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .eq('type', 'exercise')
    .single()

  if (!exercise) notFound()

  const vid = exercise.video_url ? vimeoId(exercise.video_url) : null

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <a href="/exercises" className="label hover:text-[var(--white)] transition-colors mb-12 inline-flex items-center gap-2">
        ← All exercises
      </a>

      {exercise.cover_image && (
        <img src={exercise.cover_image} alt="" className="w-full max-h-72 object-cover border border-[var(--border)] mt-12" />
      )}

      <div className="grid sm:grid-cols-[1fr_2fr] gap-16 mt-12">
        <div className="sm:sticky sm:top-12 self-start space-y-8">
          <div>
            <p className="label mb-6">Exercise</p>
            <h1 className="text-2xl font-light text-[var(--white)] tracking-tight leading-snug mb-6" style={{ letterSpacing: '-0.02em' }}>
              {exercise.title}
            </h1>
            <time className="label block">
              {new Date(exercise.published_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </time>
          </div>

          {exercise.audio_url && (
            <div>
              <p className="label mb-3">Audio</p>
              <AudioPlayer src={exercise.audio_url} filename={`${exercise.title}.mp3`} />
            </div>
          )}
        </div>

        <div className="space-y-10">
          {vid && (
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={`https://player.vimeo.com/video/${vid}?title=0&byline=0&portrait=0&dnt=1`}
                className="absolute inset-0 w-full h-full border border-[var(--border)]"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <div className="prose" dangerouslySetInnerHTML={{ __html: exercise.body ?? '' }} />
        </div>
      </div>
    </div>
  )
}
