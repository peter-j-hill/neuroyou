import Link from 'next/link'
import { LESSON_LABEL, formatClock, lessonHref, type CourseState, type LessonView, type ModuleView } from '@/lib/protocols/course'
import { FEATURES, isLessonBuilt } from '@/lib/protocols/features'

// Course home (design canvas artboard 02). Presentational: all data comes in through props.
//
// COPY on this page is website copy from the design canvas (flagged in the pull request).
// New-student and "all finished" wording is new, written to match.

export type JournalPreview = { id: string; created_at: string; topic: string | null; kind: string; text: string }

const KIND_LABEL: Record<string, string> = { practice: 'Practice', advanced: 'Advanced practice', lesson: 'Lesson', own: 'My note', exercise: 'Exercise' }

const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

const mix = (pct: number) => `color-mix(in srgb, var(--ny-tide) ${pct}%, white)`

function Segments({ modules }: { modules: ModuleView[] }) {
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${modules.length}, minmax(0, 1fr))` }} aria-hidden="true">
      {modules.map((m) => (
        <span
          key={m.id}
          className="h-1 rounded"
          style={{ background: m.done ? 'var(--ny-tide)' : m.isCurrent || m.started ? mix(45) : 'var(--ny-line)' }}
        />
      ))}
    </div>
  )
}

function LessonRowItem({ protocol, lesson, interactive }: { protocol: string; lesson: LessonView; interactive: boolean }) {
  const isRoom = lesson.kind === 'practice'
  const built = isLessonBuilt(lesson)
  const right =
    lesson.state === 'done' ? <span style={{ color: 'var(--ny-leaf)' }}>✓</span>
    : lesson.state === 'started' ? <span style={{ color: 'var(--ny-tide)' }}>In progress</span>
    : lesson.duration_min != null ? <span style={{ color: 'var(--ny-ink-3)' }}>{lesson.duration_min} min</span>
    : isRoom ? <span style={{ color: 'var(--ny-ink-3)' }}>open-ended</span>
    : null

  const label = (
    <span>
      <span className="inline-block w-16 text-xs" style={{ color: 'var(--ny-ink-3)' }}>{LESSON_LABEL[lesson.kind]}</span>
      {lesson.title}
    </span>
  )

  return (
    <li className="flex justify-between gap-3 py-3 border-t text-[15px]" style={{ borderColor: 'var(--ny-line)' }}>
      {interactive && built ? (
        <Link href={lessonHref(protocol, lesson)} className="hover:underline" style={{ color: 'var(--ny-ink)' }}>{label}</Link>
      ) : (
        <span style={{ color: 'var(--ny-ink)' }}>{label}</span>
      )}
      <span className="text-sm shrink-0">{interactive && !built ? <span style={{ color: 'var(--ny-ink-4)' }}>Coming soon</span> : right}</span>
    </li>
  )
}

function ModuleCard({ protocol, m, unlockedAll }: { protocol: string; m: ModuleView; unlockedAll: boolean }) {
  const meta =
    m.requiredTotal === 0 && m.lessons.length > 0 ? 'open-ended'
    : `${m.lessons.length} ${m.lessons.length === 1 ? 'lesson' : 'lessons'}${m.minutes != null ? ` · ${m.minutes} min` : ''}`

  if (m.locked) {
    return (
      <div className="rounded-[18px] px-6 py-5 flex justify-between gap-4 flex-wrap border border-dashed" style={{ borderColor: 'var(--ny-line-strong)' }}>
        <div className="flex flex-col">
          <span className="text-[13px]" style={{ color: 'var(--ny-ink-3)' }}>Module {m.ordinal}</span>
          <h3 className="m-0 text-lg" style={{ color: 'var(--ny-ink)' }}>{m.title}</h3>
        </div>
        <span className="text-sm self-center" style={{ color: 'var(--ny-ink-3)' }}>
          Opens when you finish Module {m.unlock_after_ordinal}
        </span>
      </div>
    )
  }

  return (
    <details
      className="group rounded-[18px] border"
      style={{ borderColor: m.isCurrent ? 'var(--ny-tide)' : 'var(--ny-line)' }}
      {...(m.isCurrent ? { open: true } : {})}
    >
      <summary className="list-none cursor-pointer px-6 py-5 flex justify-between gap-4 flex-wrap">
        <div className="flex flex-col">
          <span className="text-[13px]" style={{ color: m.isCurrent ? 'var(--ny-tide)' : 'var(--ny-ink-3)' }}>
            Module {m.ordinal}{m.isCurrent ? ' · you are here' : ''}
          </span>
          <h3 className="m-0 text-lg" style={{ color: 'var(--ny-ink)' }}>{m.title}</h3>
        </div>
        <span className="text-sm self-center" style={{ color: m.done ? 'var(--ny-leaf)' : 'var(--ny-ink-3)' }}>
          {m.done ? '✓ Visited' : meta}
          <span aria-hidden className="ml-2" style={{ color: 'var(--ny-ink-4)' }}>
            <span className="group-open:hidden">+</span>
            <span className="hidden group-open:inline">−</span>
          </span>
        </span>
      </summary>
      <ul className="list-none m-0 px-6 pb-3">
        {m.lessons.map((l) => <LessonRowItem key={l.id} protocol={protocol} lesson={l} interactive />)}
        {m.lessons.length === 0 && (
          <li className="py-3 border-t text-sm" style={{ borderColor: 'var(--ny-line)', color: 'var(--ny-ink-3)' }}>Lessons are on their way.</li>
        )}
        {unlockedAll && m.unlock_after_ordinal != null && (
          <li className="py-2 border-t text-xs" style={{ borderColor: 'var(--ny-line)', color: 'var(--ny-ink-4)' }}>
            Students unlock this after Module {m.unlock_after_ordinal}.
          </li>
        )}
      </ul>
    </details>
  )
}

export default function CourseHome({
  slug,
  eyebrow,
  title,
  state,
  journal,
  welcome,
  adminView,
}: {
  slug: string
  eyebrow: string
  title: string
  state: CourseState
  journal: JournalPreview[]
  welcome: boolean
  adminView: boolean
}) {
  const { modules, current, next, finishedModules } = state
  const roomUnlocked = !modules.find((m) => m.ordinal === 4)?.locked
  const anyProgress = modules.some((m) => m.started)
  const allDone = !next && finishedModules > 0

  const intro = allDone
    ? 'You have been through every lesson. Revisit anything below, or keep practising.'
    : anyProgress
      ? 'Welcome back. Take the next lesson when you have 15 quiet minutes.'
      : 'Welcome. Start with the first lesson when you have a few quiet minutes.'

  const caption = allDone
    ? 'You have finished the lessons'
    : current
      ? `You are in Module ${current.ordinal} · ${current.title}`
      : ''

  return (
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-24 pb-24 flex flex-col gap-10">
      {adminView && (
        <div className="rounded-[10px] px-4 py-3 text-sm" style={{ background: 'var(--ny-tide-tint)', color: 'var(--ny-tide-deep)' }}>
          Admin view: every module is open here. Students unlock them in order.
        </div>
      )}
      {welcome && (
        <div className="rounded-[18px] p-6" role="status" style={{ background: 'var(--ny-tide-tint)' }}>
          <div className="ny-caption font-medium" style={{ color: 'var(--ny-tide)' }}>Thank you</div>
          <p className="m-0 mt-1 text-[17px]" style={{ color: 'var(--ny-ink)' }}>
            You now have access to {title}. Begin with the first lesson below.
          </p>
        </div>
      )}

      {/* Header and progress */}
      <div className="flex flex-wrap gap-8 items-end justify-between">
        <div className="flex flex-col gap-2.5 flex-[1_1_520px] min-w-0">
          <span className="text-sm font-medium" style={{ color: 'var(--ny-tide)' }}>{eyebrow}</span>
          <h1 className="m-0" style={{ fontSize: 'clamp(34px, 5vw, 48px)', lineHeight: 1.05, letterSpacing: '-0.035em', color: 'var(--ny-ink)' }}>{title}</h1>
          <p className="m-0 text-[17px]" style={{ color: 'var(--ny-ink-2)' }}>{intro}</p>
        </div>
        <div className="flex flex-col gap-2 flex-[0_1_360px] min-w-0 w-full sm:w-auto">
          {caption && <span className="text-[13px]" style={{ color: 'var(--ny-ink-3)' }}>{caption}</span>}
          <Segments modules={modules} />
        </div>
      </div>

      {/* Resume card */}
      <div className="rounded-[28px] overflow-hidden grid md:grid-cols-2" style={{ background: 'var(--ny-night)', color: '#fff' }}>
        <div className="min-h-[200px] md:min-h-[280px] flex items-center justify-center p-6 text-center text-sm" style={{ background: 'var(--ny-night-2)', color: 'var(--ny-ink-4)' }}>
          {next ? `${LESSON_LABEL[next.lesson.kind]}${next.lesson.duration_min != null ? ` · ${next.lesson.duration_min} min` : ''}` : 'Course complete'}
        </div>
        <div className="p-8 sm:p-10 flex flex-col gap-3.5 justify-center">
          {next ? (
            <>
              <span className="text-[13px] font-medium" style={{ color: 'var(--ny-tide-tint)' }}>
                {next.lesson.state === 'started' ? 'Continue where you left off' : anyProgress ? 'Up next' : 'Start here'}
              </span>
              <h2 className="m-0 text-[30px] leading-[1.15]" style={{ letterSpacing: '-0.025em', color: '#fff' }}>{next.lesson.title}</h2>
              <p className="m-0" style={{ color: 'var(--ny-line-strong)' }}>Module {next.module.ordinal} · {next.module.title}</p>
              <div className="flex flex-wrap gap-3 pt-1.5">
                {isLessonBuilt(next.lesson) ? (
                  <Link href={lessonHref(slug, next.lesson)} className="ny-btn" style={{ background: '#fff', color: 'var(--ny-ink)', fontWeight: 500 }}>
                    {next.lesson.state === 'started' && next.lesson.resumeSeconds > 0
                      ? `▶ Resume at ${formatClock(next.lesson.resumeSeconds)}`
                      : next.lesson.state === 'started' ? '▶ Continue' : '▶ Start lesson'}
                  </Link>
                ) : (
                  <span className="text-sm" style={{ color: 'var(--ny-ink-4)' }}>This lesson opens in an upcoming update.</span>
                )}
              </div>
            </>
          ) : (
            <>
              <span className="text-[13px] font-medium" style={{ color: 'var(--ny-tide-tint)' }}>
                {allDone ? 'All lessons finished' : 'Lessons are on their way'}
              </span>
              <h2 className="m-0 text-[30px] leading-[1.15]" style={{ letterSpacing: '-0.025em', color: '#fff' }}>
                {allDone ? 'Keep practising.' : 'Nothing to take just yet.'}
              </h2>
              <p className="m-0" style={{ color: 'var(--ny-line-strong)' }}>
                {allDone ? 'The practice room and your journal stay open.' : 'The first lessons are being prepared.'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Outline + side column */}
      <div className="flex flex-wrap gap-10 items-start">
        <section className="flex-[999_1_560px] min-w-0 flex flex-col gap-3.5" aria-labelledby="outline-h">
          <h2 id="outline-h" className="m-0 text-2xl" style={{ letterSpacing: '-0.02em', color: 'var(--ny-ink)' }}>Course outline</h2>
          {modules.map((m) => <ModuleCard key={m.id} protocol={slug} m={m} unlockedAll={state.unlockedAll} />)}
        </section>

        <aside className="flex-[1_1_320px] min-w-0 flex flex-col gap-4">
          <div className="rounded-[18px] p-6 flex flex-col gap-2.5" style={{ background: 'var(--ny-mist)' }}>
            <h3 className="m-0 text-lg" style={{ color: 'var(--ny-ink)' }}>Practice room</h3>
            <p className="m-0 text-sm" style={{ color: 'var(--ny-ink-2)' }}>
              Run the seven steps on any uninvited emotion, guided by voice or text.{' '}
              {roomUnlocked ? '' : 'Opens after Module 3.'}
            </p>
            {roomUnlocked && FEATURES.practiceRoom ? (
              <Link href={`/protocols/${slug}/practice`} className="text-sm pt-1" style={{ color: 'var(--ny-tide)' }}>Open the practice room ›</Link>
            ) : roomUnlocked ? (
              <span className="text-sm pt-1" style={{ color: 'var(--ny-ink-4)' }}>Coming soon</span>
            ) : null}
          </div>

          <div className="rounded-[18px] p-6 flex flex-col gap-3 border" style={{ borderColor: 'var(--ny-line)' }}>
            <div className="flex justify-between items-baseline">
              <h3 className="m-0 text-lg" style={{ color: 'var(--ny-ink)' }}>Your journal</h3>
              <span className="text-xs" style={{ color: 'var(--ny-ink-3)' }}>Private to you</span>
            </div>
            {journal.length === 0 && (
              <p className="m-0 text-sm py-2.5 border-t" style={{ borderColor: 'var(--ny-line)', color: 'var(--ny-ink-3)' }}>
                Nothing here yet. Your own notes, and notes from your practice and lessons, are saved here.
              </p>
            )}
            {journal.map((j) => (
              <div key={j.id} className="flex flex-col gap-1 text-sm py-2.5 border-t" style={{ borderColor: 'var(--ny-line)' }}>
                <span className="text-xs" style={{ color: 'var(--ny-ink-3)' }}>
                  {shortDate(j.created_at)} · {j.topic ? `${KIND_LABEL[j.kind] ?? j.kind}: ${j.topic}` : KIND_LABEL[j.kind] ?? j.kind}
                </span>
                {j.text && <span className="line-clamp-2" style={{ color: 'var(--ny-ink-2)' }}>{j.text}</span>}
              </div>
            ))}
            <Link href="/journal" className="text-sm" style={{ color: 'var(--ny-tide)' }}>Open journal ›</Link>
          </div>

          <div className="rounded-[18px] p-6 flex flex-col gap-2 border" style={{ borderColor: 'var(--ny-line)' }}>
            <h3 className="m-0 text-base" style={{ color: 'var(--ny-ink)' }}>Going gently</h3>
            <p className="m-0 text-sm" style={{ color: 'var(--ny-ink-2)' }}>
              If a lesson stirs up more than you expected, pause. Come back tomorrow. If something will not shift, the
              troubleshooting module covers it. You can also <Link href="/connect" style={{ color: 'var(--ny-tide)' }}>get in touch</Link>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
