import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { requireProtocolAccess } from '@/lib/protocols/access'
import { loadCourseState } from '@/lib/protocols/load'
import { LESSON_LABEL, lessonHref, lessonNeighbours } from '@/lib/protocols/course'
import { isLessonBuilt } from '@/lib/protocols/features'
import { loadLessonDetail } from '@/lib/protocols/lesson'
import { bunnyConfigured, isBunnyVideoId, signedEmbedUrl } from '@/lib/protocols/bunny'
import VideoLesson from '@/components/protocols/lesson/VideoLesson'

export const dynamic = 'force-dynamic'

type Params = Promise<{ protocol: string; lesson: string }>

export const metadata: Metadata = { robots: { index: false, follow: false } }

// Lesson player (design canvas artboard 03). The course-wide access check runs in the layout;
// this page adds the lesson-level rules: it must exist for this student, and its module must be open.
export default async function LessonPage({ params }: { params: Params }) {
  const { protocol: slug, lesson: lessonSlug } = await params
  const { supabase, user, protocol, admin } = await requireProtocolAccess(slug)

  const state = await loadCourseState(supabase, { protocolId: protocol.id, userId: user.id, unlockAll: admin })
  const mod = state.modules.find((m) => m.lessons.some((l) => l.slug === lessonSlug))
  const lesson = mod?.lessons.find((l) => l.slug === lessonSlug)
  if (!mod || !lesson) notFound()

  const courseHome = `/protocols/${slug}`
  if (mod.locked) redirect(courseHome)
  if (lesson.kind === 'practice') redirect(lessonHref(slug, lesson))
  if (!isLessonBuilt(lesson)) redirect(courseHome)

  const detail = await loadLessonDetail(supabase, lesson.id)
  const { prev, next } = lessonNeighbours(state, lesson.id, isLessonBuilt)

  const hasVideo = isBunnyVideoId(detail?.videoRef) && detail?.videoProvider === 'bunny'
  const src = hasVideo && detail ? signedEmbedUrl(detail.videoRef!) : null

  const navLink = (l: typeof lesson | null, label: string, primary: boolean) =>
    l ? (
      <Link
        href={lessonHref(slug, l)}
        className="rounded-full px-4 py-2 text-sm no-underline"
        style={primary ? { background: 'var(--ny-ink)', color: '#fff' } : { border: '1px solid var(--ny-line-strong)', color: 'var(--ny-ink)' }}
      >
        {label}
      </Link>
    ) : null

  return (
    <div className="ny-scope bg-white pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-8" style={{ borderColor: 'var(--ny-line)' }}>
        <div className="flex flex-wrap items-center gap-4">
          <Link href={courseHome} className="text-sm no-underline" style={{ color: 'var(--ny-tide)' }}>‹ {protocol.title}</Link>
          <span className="text-sm" style={{ color: 'var(--ny-ink-3)' }}>Module {mod.ordinal} · {mod.title}</span>
        </div>
        <div className="flex gap-2">
          {navLink(prev, 'Previous', false)}
          {navLink(next, 'Next lesson', true)}
        </div>
      </div>

      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-8 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <nav aria-label="Lessons in this module" className="order-last flex flex-col gap-1 text-sm lg:order-first">
          <span className="px-3 pb-2 text-xs font-semibold" style={{ color: 'var(--ny-ink-3)' }}>IN THIS MODULE</span>
          {mod.lessons.map((l) => {
            const current = l.id === lesson.id
            const label = `${LESSON_LABEL[l.kind][0]}${LESSON_LABEL[l.kind].slice(1).toLowerCase()} · ${l.title}`
            const style = current
              ? { color: 'var(--ny-tide-deep)', background: 'var(--ny-tide-tint)', fontWeight: 500 }
              : { color: 'var(--ny-ink-2)' }
            return isLessonBuilt(l) || current ? (
              <Link key={l.id} href={lessonHref(slug, l)} className="rounded-[10px] px-3 py-2.5 no-underline" style={style} aria-current={current ? 'page' : undefined}>
                {label}{l.state === 'done' && !current ? <span style={{ color: 'var(--ny-leaf)' }}> ✓</span> : null}
              </Link>
            ) : (
              <span key={l.id} className="rounded-[10px] px-3 py-2.5" style={{ color: 'var(--ny-ink-4)' }}>{label}</span>
            )
          })}
        </nav>

        <main className="flex min-w-0 flex-col gap-7">
          <div className="flex flex-col gap-2">
            <span className="text-[13px]" style={{ color: 'var(--ny-ink-3)' }}>
              {LESSON_LABEL[lesson.kind][0]}{LESSON_LABEL[lesson.kind].slice(1).toLowerCase()}
              {lesson.duration_min != null ? ` · ${lesson.duration_min} min` : ''} · Peter J Hill
            </span>
            <h1 className="m-0 text-[32px] leading-[1.1] sm:text-[40px]" style={{ letterSpacing: '-0.035em' }}>{lesson.title}</h1>
          </div>

          {src ? (
            <VideoLesson
              protocolSlug={slug}
              lessonId={lesson.id}
              title={lesson.title}
              src={src}
              resumeSeconds={lesson.state === 'done' ? 0 : lesson.resumeSeconds}
              finished={lesson.state === 'done'}
              chapters={detail?.chapters ?? []}
              transcript={detail?.transcript ?? []}
            />
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-[28px] p-8 text-center" style={{ background: 'var(--ny-night)', color: 'var(--ny-ink-4)' }}>
              <span>This video is not available yet.</span>
              {admin && (
                <span className="text-sm">
                  {!hasVideo ? 'Admin: this lesson has no Bunny video attached yet.' : !bunnyConfigured() ? 'Admin: the Bunny library settings are missing on this deployment.' : 'Admin: the video link could not be signed.'}
                </span>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
