'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { addJournalEntry, deleteJournalEntry } from '@/app/journal/actions'
import {
  MAX_ENTRY_CHARS, SOURCE_LABEL, availableFilters, filterEntries, journalAsText, resultLabel, topicLabel, topicTrail, topicsOf,
  type JournalEntry, type JournalFilter, type JournalKind,
} from '@/lib/journal/entries'

// The journal (design canvas artboard 06). Every account has one. Practice entries come with the practice room.

const TAG_STYLE: Record<JournalKind, React.CSSProperties> = {
  practice: { background: 'var(--ny-night)', color: '#fff' },
  advanced: { background: 'var(--ny-ink-2)', color: '#fff' },
  lesson: { background: 'var(--ny-tide-tint)', color: 'var(--ny-tide-deep)' },
  exercise: { background: 'var(--ny-tide-tint)', color: 'var(--ny-tide-deep)' },
  own: { background: '#fff', color: 'var(--ny-ink-2)', border: '1px solid var(--ny-line-strong)' },
}

const pill = (on: boolean): React.CSSProperties => ({
  borderRadius: 999, padding: '7px 14px', fontSize: 14, minHeight: 36, cursor: 'pointer', fontFamily: 'inherit',
  background: on ? 'var(--ny-ink)' : '#fff', color: on ? '#fff' : 'var(--ny-ink)',
  border: `1px solid ${on ? 'var(--ny-ink)' : 'var(--ny-line-strong)'}`,
})

const dateOf = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true })

export default function JournalView({
  entries: serverEntries,
  exercise,
  hasProtocol,
}: {
  entries: JournalEntry[]
  exercise: { id: string; title: string } | null
  hasProtocol: boolean
}) {
  const router = useRouter()
  // The list is held here so a save or delete shows at once; it is replaced whenever the server sends a fresh one.
  const [entries, setEntries] = useState(serverEntries)
  const [seen, setSeen] = useState(serverEntries)
  if (serverEntries !== seen) {
    setSeen(serverEntries)
    setEntries(serverEntries)
  }
  const [draft, setDraft] = useState('')
  const [about, setAbout] = useState(exercise)
  const [filter, setFilter] = useState<JournalFilter>('all')
  const [topic, setTopic] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const filters = useMemo(() => availableFilters(entries), [entries])
  const topics = useMemo(() => topicsOf(entries), [entries])
  const shown = useMemo(() => filterEntries(entries, filter, topic), [entries, filter, topic])
  const trail = useMemo(() => (topic ? topicTrail(entries, topic) : []), [entries, topic])

  const save = () => {
    setError('')
    startTransition(async () => {
      const res = await addJournalEntry({ text: draft, exerciseId: about?.id })
      if (!res.ok) return setError(res.error)
      setEntries((list) => [res.entry, ...list])
      setDraft('')
      setAbout(null)
      setFilter('all')
      setTopic('')
      // Drop ?exercise=... from the address so reloading does not tag the next note to the same exercise.
      if (window.location.search) window.history.replaceState(null, '', '/journal')
      router.refresh()
    })
  }

  const remove = (id: string) => {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return
    startTransition(async () => {
      const res = await deleteJournalEntry(id)
      if (!res.ok) return setError(res.error)
      setEntries((list) => list.filter((e) => e.id !== id))
      router.refresh()
    })
  }

  const download = () => {
    const blob = new Blob([journalAsText(entries, 'en-GB')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'neuroyou-journal.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="ny-scope bg-white pb-24">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-10 px-4 pt-12 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-2.5">
            <Link href="/dashboard" className="text-sm no-underline" style={{ color: 'var(--ny-tide)' }}>‹ Account</Link>
            <h1 className="m-0 text-[40px] leading-[1.05] sm:text-[48px]" style={{ letterSpacing: '-0.035em', color: 'var(--ny-ink)' }}>Your journal</h1>
            <p className="m-0 max-w-[600px] text-[17px]" style={{ color: 'var(--ny-ink-2)' }}>
              {hasProtocol
                ? 'A private place to note what you noticed. Notes from a practice session are saved with the emotion or sense you worked on and how it felt afterwards, so you can look back on how each one has changed.'
                : 'A private place to note what you noticed, in your own words. Only you can see it.'}
            </p>
          </div>
          <span className="text-[13px]" style={{ color: 'var(--ny-ink-3)' }}>
            Only you can see this.{' '}
            {entries.length > 0 && (
              <button onClick={download} className="cursor-pointer border-0 bg-transparent p-0 text-[13px] underline" style={{ color: 'var(--ny-tide)', fontFamily: 'inherit' }}>
                Download as text
              </button>
            )}
          </span>
        </div>

        <div className="flex flex-col gap-4 rounded-[28px] p-6 sm:p-8" style={{ background: 'var(--ny-mist)' }}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="m-0 text-[22px]" style={{ letterSpacing: '-0.02em', color: 'var(--ny-ink)' }}>New entry</h2>
            <span className="text-sm" style={{ color: 'var(--ny-ink-3)' }} suppressHydrationWarning>{today}</span>
          </div>
          {about && (
            <div className="flex flex-wrap items-center gap-2 text-sm" style={{ color: 'var(--ny-ink-2)' }}>
              <span>About the exercise:</span>
              <span className="rounded-full px-2.5 py-0.5 text-xs" style={TAG_STYLE.exercise}>{about.title}</span>
              <button onClick={() => setAbout(null)} className="cursor-pointer border-0 bg-transparent p-0 text-xs underline" style={{ color: 'var(--ny-ink-3)', fontFamily: 'inherit' }}>Remove</button>
            </div>
          )}
          <label htmlFor="journal-text" className="sr-only">Entry text</label>
          <textarea
            id="journal-text"
            rows={4}
            value={draft}
            maxLength={MAX_ENTRY_CHARS}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What did you notice today? What came up, what eased, what stayed the same…"
            className="resize-y rounded-[10px] bg-white px-4 py-3.5 text-base leading-relaxed"
            style={{ border: '1px solid var(--ny-line-strong)', fontFamily: 'inherit', background: '#fff', color: 'var(--ny-ink)' }}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[13px]" style={{ color: 'var(--ny-ink-3)' }}>Saved to your account, not this device.</span>
            <button onClick={save} disabled={pending || !draft.trim()} className="ny-btn ny-btn-primary disabled:opacity-50">Save entry</button>
          </div>
          {error && <p role="alert" className="m-0 text-sm" style={{ color: '#B3261E' }}>{error}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
            <h2 className="m-0 text-[22px]" style={{ letterSpacing: '-0.02em', color: 'var(--ny-ink)' }}>My Notes</h2>
            <div className="flex flex-wrap items-center gap-3">
              {filters.length > 0 && (
                <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-1.5">
                  {filters.map((f) => (
                    <button key={f.id} onClick={() => setFilter(f.id)} aria-pressed={filter === f.id} style={pill(filter === f.id)}>{f.label}</button>
                  ))}
                </div>
              )}
              {(topics.emotions.length > 0 || topics.senses.length > 0) && (
                <>
                  <label htmlFor="journal-topic" className="text-sm" style={{ color: 'var(--ny-ink-2)' }}>Emotion or sense</label>
                  <select
                    id="journal-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="min-h-9 rounded-full bg-white px-3.5 py-2 text-sm"
                    style={{ border: '1px solid var(--ny-line-strong)', fontFamily: 'inherit', background: '#fff', color: 'var(--ny-ink)' }}
                  >
                    <option value="">All</option>
                    {topics.emotions.length > 0 && (
                      <optgroup label="Emotions">{topics.emotions.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}</optgroup>
                    )}
                    {topics.senses.length > 0 && (
                      <optgroup label="Senses · advanced practice">{topics.senses.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}</optgroup>
                    )}
                  </select>
                </>
              )}
            </div>
          </div>

          {topic && trail.length > 0 && (
            <div className="mb-2 flex flex-col gap-3 rounded-[18px] p-5 sm:px-6" style={{ border: '1px solid var(--ny-tide)', background: 'var(--ny-tide-tint)' }}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="m-0 text-[19px]" style={{ color: 'var(--ny-tide-deep)' }}>{topic.charAt(0).toUpperCase() + topic.slice(1)}</h3>
                <span className="text-[13px]" style={{ color: 'var(--ny-ink-2)' }}>{trail.length} practice {trail.length === 1 ? 'session' : 'sessions'}</span>
              </div>
              <span className="text-[13px]" style={{ color: 'var(--ny-ink-2)' }}>How it felt after each session, oldest first</span>
              <div className="flex flex-wrap items-center gap-2">
                {trail.map((e, i) => (
                  <span key={e.id} className="inline-flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--ny-ink-2)' }} suppressHydrationWarning>{new Date(e.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</span>
                    <span className="rounded-full bg-white px-3 py-0.5 text-[13px]" style={{ border: '1px solid var(--ny-line-strong)', color: 'var(--ny-ink)' }}>{resultLabel(e.result, e.topic_kind)}</span>
                    {i < trail.length - 1 && <span style={{ color: 'var(--ny-ink-3)' }}>→</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {shown.map((e) => (
            <div key={e.id} className="flex flex-wrap gap-x-8 gap-y-2 border-t py-5" style={{ borderColor: 'var(--ny-line)' }}>
              <div className="flex flex-[0_0_180px] flex-col gap-0.5">
                <span className="text-[15px] font-semibold" style={{ color: 'var(--ny-ink)' }} suppressHydrationWarning>{dateOf(e.created_at)}</span>
                <span className="text-[13px]" style={{ color: 'var(--ny-ink-3)' }} suppressHydrationWarning>{timeOf(e.created_at)}</span>
              </div>
              <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full px-2.5 py-0.5 text-xs" style={TAG_STYLE[e.kind]}>{SOURCE_LABEL[e.kind]}</span>
                  {e.topic && (
                    <>
                      <button
                        onClick={() => setTopic(e.topic as string)}
                        className="cursor-pointer rounded-full bg-white px-2.5 py-0.5 text-xs"
                        style={{ color: 'var(--ny-tide-deep)', border: '1px solid var(--ny-tide)', fontFamily: 'inherit' }}
                      >
                        {topicLabel(e)}
                      </button>
                      {e.result && <span className="text-xs" style={{ color: 'var(--ny-ink-2)' }}>felt {resultLabel(e.result, e.topic_kind).toLowerCase()} afterwards</span>}
                    </>
                  )}
                  {e.detail && <span className="rounded-full px-2.5 py-0.5 text-xs" style={{ color: 'var(--ny-ink-2)', background: 'var(--ny-mist)' }}>{e.detail}</span>}
                </div>
                <p className="m-0 whitespace-pre-line break-words" style={{ color: 'var(--ny-ink)' }}>{e.text}</p>
                <div>
                  <button onClick={() => remove(e.id)} className="cursor-pointer border-0 bg-transparent p-0 text-xs underline" style={{ color: 'var(--ny-ink-4)', fontFamily: 'inherit' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {shown.length === 0 && (
            <p className="m-0 border-t py-6" style={{ color: 'var(--ny-ink-3)', borderColor: 'var(--ny-line)' }}>
              {entries.length === 0 ? 'Nothing here yet. Your first note will appear here.' : 'Nothing here yet.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
