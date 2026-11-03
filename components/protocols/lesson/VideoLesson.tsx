'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Player } from 'player.js'
import { saveVideoProgress } from '@/app/protocols/[protocol]/lesson/[lesson]/actions'
import { formatClock } from '@/lib/protocols/course'
import type { Chapter, TranscriptLine } from '@/lib/protocols/lesson'

// The video itself is Bunny's player in an iframe; this component listens to it (position, pause, end),
// saves progress, resumes where the student left off, and lets the chapter list and transcript seek.

const SAVE_EVERY_MS = 15_000
type Tab = 'chapters' | 'transcript'

// Bunny sends { seconds, duration }; older docs show it as a JSON string. Accept both.
function readTime(data: unknown): { seconds: number; duration: number } | null {
  let d = data
  if (typeof d === 'string') {
    try { d = JSON.parse(d) } catch { return null }
  }
  if (!d || typeof d !== 'object') return null
  const { seconds, duration } = d as { seconds?: unknown; duration?: unknown }
  return typeof seconds === 'number' && typeof duration === 'number' && Number.isFinite(seconds) && Number.isFinite(duration)
    ? { seconds, duration }
    : null
}

export default function VideoLesson({
  protocolSlug,
  lessonId,
  title,
  src,
  resumeSeconds,
  finished,
  chapters,
  transcript,
}: {
  protocolSlug: string
  lessonId: string
  title: string
  src: string
  resumeSeconds: number
  finished: boolean
  chapters: Chapter[]
  transcript: TranscriptLine[]
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)
  const positionRef = useRef({ seconds: 0, duration: 0 })
  const savedRef = useRef({ at: 0, seconds: -1 })

  const [now, setNow] = useState(0)
  const [done, setDone] = useState(finished)
  const [tab, setTab] = useState<Tab>(chapters.length > 0 ? 'chapters' : 'transcript')

  const save = useCallback(
    (force: boolean) => {
      const { seconds, duration } = positionRef.current
      if (duration <= 0 || seconds < 1) return
      const last = savedRef.current
      if (!force && Date.now() - last.at < SAVE_EVERY_MS) return
      if (Math.floor(seconds) === last.seconds) return
      savedRef.current = { at: Date.now(), seconds: Math.floor(seconds) }
      saveVideoProgress({ protocolSlug, lessonId, seconds, duration })
        .then((r) => { if (r.ok && r.completed) setDone(true) })
        .catch(() => {})
    },
    [protocolSlug, lessonId],
  )

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let active = true

    let iframe: HTMLIFrameElement | null = null

    // player.js reads `window` as soon as it loads, so it can only be imported in the browser.
    import('player.js').then((mod) => {
      if (!active) return
      const playerjs = mod.default ?? (mod as unknown as typeof mod.default)

      // Bunny's docs: build the iframe from script, and create the player in the same step, so the
      // player is listening before the iframe can finish loading (otherwise `ready` never arrives).
      iframe = document.createElement('iframe')
      iframe.src = src
      iframe.title = title
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'
      iframe.allowFullscreen = true
      iframe.className = 'absolute inset-0 h-full w-full border-0'
      host.appendChild(iframe)
      const player = new playerjs.Player(iframe)
      playerRef.current = player

      player.on('ready', () => {
        if (active && resumeSeconds > 0) player.setCurrentTime(resumeSeconds)
      })
      player.on('timeupdate', (data) => {
        if (!active) return
        const t = readTime(data)
        if (!t) return
        // The player reports 0 for a moment while it loads; do not let that overwrite a saved position.
        if (t.seconds === 0 && resumeSeconds > 0 && positionRef.current.seconds === 0) return
        positionRef.current = t
        setNow(t.seconds)
        save(false)
      })
      player.on('pause', () => { if (active) save(true) })
      player.on('ended', () => { if (active) save(true) })
    })

    const onHide = () => { if (document.visibilityState === 'hidden') save(true) }
    document.addEventListener('visibilitychange', onHide)

    return () => {
      active = false
      document.removeEventListener('visibilitychange', onHide)
      save(true)
      playerRef.current = null
      iframe?.remove()
    }
  }, [src, title, resumeSeconds, save])

  const seek = (t: number) => {
    playerRef.current?.setCurrentTime(t)
    playerRef.current?.play()
  }

  const activeIndex = (list: { t: number }[]) => {
    let idx = -1
    list.forEach((item, i) => { if (item.t <= now) idx = i })
    return idx
  }
  const activeChapter = activeIndex(chapters)
  const activeLine = activeIndex(transcript)

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: 'chapters', label: 'Chapters', show: chapters.length > 0 },
    { id: 'transcript', label: 'Transcript', show: transcript.length > 0 },
  ]
  const shownTabs = tabs.filter((t) => t.show)

  return (
    <div className="flex flex-col gap-6">
      <div className="relative aspect-video overflow-hidden rounded-[28px]" style={{ background: 'var(--ny-night)' }}>
        <div ref={hostRef} className="absolute inset-0" />
      </div>

      <p className="m-0 text-sm" style={{ color: done ? 'var(--ny-leaf)' : 'var(--ny-ink-3)' }} aria-live="polite">
        {done ? '✓ You have finished this lesson. You can watch it again whenever you like.' : 'Your place is saved as you watch.'}
      </p>

      {shownTabs.length > 0 && (
        <div className="flex flex-col gap-4">
          <div role="tablist" aria-label="Lesson details" className="flex gap-1.5 border-b" style={{ borderColor: 'var(--ny-line)' }}>
            {shownTabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className="bg-transparent px-3.5 py-3 text-[15px] cursor-pointer -mb-px border-0 border-b-2"
                style={{
                  color: tab === t.id ? 'var(--ny-ink)' : 'var(--ny-ink-3)',
                  fontWeight: tab === t.id ? 600 : 400,
                  borderBottomColor: tab === t.id ? 'var(--ny-ink)' : 'transparent',
                  borderBottomStyle: 'solid',
                  borderBottomWidth: 2,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'chapters' && chapters.length > 0 && (
            <ol className="m-0 flex list-none flex-col gap-1 p-0">
              {chapters.map((c, i) => (
                <li key={`${c.t}-${i}`}>
                  <button
                    onClick={() => seek(c.t)}
                    className="flex w-full cursor-pointer items-baseline gap-4 rounded-[10px] border-0 px-3 py-2.5 text-left text-[15px]"
                    style={{
                      background: i === activeChapter ? 'var(--ny-tide-tint)' : 'transparent',
                      color: i === activeChapter ? 'var(--ny-tide-deep)' : 'var(--ny-ink-2)',
                    }}
                  >
                    <span className="w-12 shrink-0 text-[13px]" style={{ color: 'var(--ny-ink-3)' }}>{formatClock(c.t)}</span>
                    {c.title}
                  </button>
                </li>
              ))}
            </ol>
          )}

          {tab === 'transcript' && transcript.length > 0 && (
            <div className="flex max-w-[680px] flex-col gap-1">
              {transcript.map((l, i) => (
                <button
                  key={`${l.t}-${i}`}
                  onClick={() => seek(l.t)}
                  className="cursor-pointer rounded-[10px] border-0 px-3 py-2 text-left text-[15px] leading-relaxed"
                  style={{
                    background: i === activeLine ? 'var(--ny-tide-tint)' : 'transparent',
                    color: i === activeLine ? 'var(--ny-ink)' : 'var(--ny-ink-2)',
                  }}
                >
                  <span className="mr-3 text-[13px]" style={{ color: 'var(--ny-tide)' }}>{formatClock(l.t)}</span>
                  {l.text}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
