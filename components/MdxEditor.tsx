'use client'

import { useEffect, useRef, useState, useTransition, type ReactNode } from 'react'
import { previewMdx } from '@/lib/actions'

type Props = { value: string; onChange: (value: string) => void }

const snippets: { label: string; insert: string; wrap?: boolean }[] = [
  { label: 'H2', insert: '## ', wrap: false },
  { label: 'H3', insert: '### ', wrap: false },
  { label: 'Bold', insert: '**', wrap: true },
  { label: 'Italic', insert: '_', wrap: true },
  { label: 'Link', insert: '[text](https://)', wrap: false },
  { label: 'List', insert: '- ', wrap: false },
  { label: 'Quote', insert: '> ', wrap: false },
  { label: 'Image', insert: '![alt](url)', wrap: false },
  { label: 'Diagram', insert: '<Diagram slug="" caption="" />', wrap: false },
]

export default function MdxEditor({ value, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // Existing content opens on Preview (formatted); a blank new post opens on Write.
  const [tab, setTab] = useState<'write' | 'preview'>(() => (value.trim() ? 'preview' : 'write'))
  const [previewNode, setPreviewNode] = useState<ReactNode>(null)
  const [previewError, setPreviewError] = useState('')
  const [isPending, startTransition] = useTransition()
  const hasRunInitialPreview = useRef(false)

  const runPreview = () => {
    setTab('preview')
    startTransition(async () => {
      const result = await previewMdx(value)
      if (result.error) {
        setPreviewError(result.error)
        setPreviewNode(null)
      } else {
        setPreviewError('')
        setPreviewNode(result.content ?? null)
      }
    })
  }

  // Auto-compile once on mount if we're starting on the Preview tab.
  useEffect(() => {
    if (tab === 'preview' && !hasRunInitialPreview.current) {
      hasRunInitialPreview.current = true
      runPreview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const insertSnippet = (snippet: (typeof snippets)[number]) => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end)

    const next = snippet.wrap
      ? value.slice(0, start) + snippet.insert + selected + snippet.insert + value.slice(end)
      : value.slice(0, start) + snippet.insert + selected + value.slice(end)

    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      const cursor = start + snippet.insert.length
      el.setSelectionRange(cursor, cursor)
    })
  }

  return (
    <div className="border border-[var(--border)]">
      {/* Prominent Write/Preview tabs */}
      <div className="flex items-stretch border-b border-[var(--border)]">
        <button
          type="button"
          onClick={() => setTab('write')}
          className={`flex-1 px-4 py-3 text-xs tracking-widest uppercase transition-colors ${
            tab === 'write'
              ? 'text-[var(--blue)] bg-[var(--accent-glow)] border-b-2 border-[var(--blue)]'
              : 'text-[var(--muted)] hover:text-[var(--white)] border-b-2 border-transparent'
          }`}
        >
          Write (raw source)
        </button>
        <button
          type="button"
          onClick={runPreview}
          className={`flex-1 px-4 py-3 text-xs tracking-widest uppercase transition-colors ${
            tab === 'preview'
              ? 'text-[var(--blue)] bg-[var(--accent-glow)] border-b-2 border-[var(--blue)]'
              : 'text-[var(--muted)] hover:text-[var(--white)] border-b-2 border-transparent'
          }`}
        >
          Preview (formatted)
        </button>
      </div>

      {tab === 'write' && (
        <div className="flex flex-wrap items-center gap-1 p-3 border-b border-[var(--border)]">
          {snippets.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => insertSnippet(s)}
              className="px-2.5 py-1 text-[0.65rem] tracking-wider uppercase border border-[var(--border)] text-[var(--muted)] hover:text-[var(--white)] hover:border-[var(--blue)] transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {tab === 'write' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[420px] p-6 text-sm font-mono leading-relaxed resize-y focus:outline-none bg-[var(--graphite)] text-[var(--white)]"
          placeholder="Write in Markdown/MDX. Use the Diagram button to embed a diagram."
        />
      ) : (
        <div className="p-6 min-h-[420px] bg-[var(--graphite)]">
          {isPending && <p className="text-xs text-[var(--muted)]">Compiling…</p>}
          {previewError && <p className="text-xs" style={{ color: 'var(--magenta)' }}>{previewError}</p>}
          {!isPending && !previewError && <div className="prose">{previewNode}</div>}
        </div>
      )}
    </div>
  )
}
