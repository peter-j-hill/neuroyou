'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import MdxEditor from '@/components/MdxEditor'
import { EXERCISE_CATEGORIES, categoryFromTags } from '@/lib/categories'

type Post = { id: string; title: string; type: string; status: string; published_at: string; sort_order?: number }
type Notice = { text: string; kind: 'ok' | 'error' } | null

const CONTENT_TYPES = ['article', 'paper', 'exercise'] as const
type ContentType = (typeof CONTENT_TYPES)[number]
const TYPE_LABEL: Record<string, string> = { article: 'Article', paper: 'Paper', exercise: 'Exercise' }
const TYPE_INK: Record<string, string> = { article: 'var(--ny-ink-2)', paper: 'var(--ny-tide)', exercise: 'var(--ny-leaf)' }

const slugify = (title: string) =>
  title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// Learn categories live in the existing tags / content_tags tables. Replace this
// exercise's category tag (at most one of the three category tags) with the chosen
// one; any other tags on the item are left alone. Returns an error message or null.
async function saveCategory(
  supabase: ReturnType<typeof createClient>,
  contentId: string,
  category: string,
): Promise<string | null> {
  const { data: catTags, error: tagErr } = await supabase
    .from('tags').select('id, title').in('title', [...EXERCISE_CATEGORIES])
  if (tagErr) return tagErr.message
  const ids = (catTags ?? []).map((t) => t.id)
  if (ids.length) {
    const { error } = await supabase.from('content_tags').delete().eq('content_id', contentId).in('tag_id', ids)
    if (error) return error.message
  }
  const chosen = (catTags ?? []).find((t) => t.title === category)
  if (chosen) {
    const { error } = await supabase.from('content_tags').insert({ content_id: contentId, tag_id: chosen.id })
    if (error) return error.message
  }
  return null
}

// ── small building blocks ────────────────────────────────────────────────────

/** Segmented control (the pill-in-a-tray look used for type and status). */
function Seg<T extends string>({
  options, value, onChange, size = 'md', activeInk,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  size?: 'sm' | 'md'
  activeInk?: (v: T) => string | undefined
}) {
  return (
    <div className="flex gap-1 p-[3px] rounded-[9px]" style={{ background: 'var(--ny-mist)' }}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded-[7px] font-medium transition-colors ${size === 'sm' ? 'py-[5px] text-xs' : 'px-3.5 py-[7px] text-[13px]'}`}
            style={{
              background: active ? '#fff' : 'transparent',
              color: active ? (activeInk?.(o.value) ?? 'var(--ny-ink)') : 'var(--ny-ink-3)',
              boxShadow: active ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[14px] bg-white p-4 flex flex-col gap-2.5">
      <div className="text-xs font-medium" style={{ color: 'var(--ny-ink-3)' }}>{title}</div>
      {children}
    </div>
  )
}

const pillSecondary = 'rounded-full border px-3.5 py-2 text-[13px] bg-white transition-colors hover:border-[var(--ny-ink)]'

/** A borderless textarea that grows with its content (used for the title and excerpt). */
function AutoTextarea({
  value, onChange, placeholder, className, style, singleLine,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  className?: string
  style?: React.CSSProperties
  singleLine?: boolean
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [value])
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={singleLine ? (e) => { if (e.key === 'Enter') e.preventDefault() } : undefined}
      className={`ny-bare ${className ?? ''}`}
      style={style}
    />
  )
}

// ── the editor ───────────────────────────────────────────────────────────────

export default function AdminClient({ posts }: { posts: Post[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [slugEdit, setSlugEdit] = useState(false)
  const [type, setType] = useState<ContentType>('article')
  const [status, setStatus] = useState<'draft' | 'published'>('published')
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().slice(0, 10))
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('')
  const [body, setBody] = useState('')
  const [heroAsset, setHeroAsset] = useState('')
  const [heroUploading, setHeroUploading] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [audioUploading, setAudioUploading] = useState(false)
  const [pdfAsset, setPdfAsset] = useState('')
  const [pdfUploading, setPdfUploading] = useState(false)
  const [showDownload, setShowDownload] = useState(true)
  const [sortOrder, setSortOrder] = useState(0)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)
  const [q, setQ] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | ContentType>('all')
  const heroInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const say = (text: string, kind: 'ok' | 'error' = 'ok') => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current)
    setNotice({ text, kind })
    if (kind === 'ok') noticeTimer.current = setTimeout(() => setNotice(null), 2600)
  }

  const reset = (newType: ContentType = 'article') => {
    setTitle(''); setSlug(''); setSlugTouched(false); setSlugEdit(false); setType(newType); setStatus('published')
    setPublishedAt(new Date().toISOString().slice(0, 10))
    setExcerpt(''); setCategory(''); setBody(''); setHeroAsset(''); setVideoUrl(''); setAudioUrl('')
    setPdfAsset(''); setShowDownload(true); setSortOrder(0); setNotice(null)
  }

  const startNew = () => { reset(typeFilter === 'all' ? 'article' : typeFilter); setEditing('new') }

  const startEdit = async (id: string, quiet = false) => {
    const supabase = createClient()
    const { data } = await supabase.from('content').select('*').eq('id', id).single()
    if (!data) return
    setEditing(id)
    setTitle(data.title)
    setSlug(data.slug)
    setSlugTouched(true)
    setSlugEdit(false)
    setType(data.type)
    setStatus(data.status)
    setPublishedAt((data.published_at as string).slice(0, 10))
    setExcerpt(data.excerpt ?? '')
    setBody(data.body_mdx ?? '')
    setHeroAsset(data.hero_asset ?? '')
    setVideoUrl(data.video_url ?? '')
    setAudioUrl(data.audio_url ?? '')
    setPdfAsset(data.pdf_asset ?? '')
    setShowDownload(data.show_download !== false)
    setSortOrder(data.sort_order ?? 0)
    if (!quiet) setNotice(null)
    setCategory('')
    if (data.type === 'exercise') {
      const { data: tagRows } = await supabase.from('content_tags').select('tags(title)').eq('content_id', id)
      const titles = ((tagRows ?? []) as unknown as { tags: { title: string } | null }[])
        .flatMap((r) => (r.tags ? [r.tags.title] : []))
      setCategory(categoryFromTags(titles) ?? '')
    }
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  const handleSave = async () => {
    setSaving(true); setNotice(null)
    const supabase = createClient()
    const payload = {
      site: 'neuroyou' as const,
      title, type, status,
      slug: slug || slugify(title),
      excerpt: excerpt || null,
      body_mdx: body || null,
      hero_asset: heroAsset || null,
      video_url: videoUrl || null,
      audio_url: audioUrl || null,
      sort_order: sortOrder,
      published_at: new Date(publishedAt).toISOString(),
      // PDF settings only apply to research papers
      ...(type === 'paper' ? { pdf_asset: pdfAsset || null, show_download: showDownload } : {}),
    }
    let contentId: string | null = null
    let message = ''
    let failed = false
    if (editing === 'new') {
      const { data, error } = await supabase.from('content').insert(payload).select('id').single()
      if (error) { message = `Error: ${error.message}`; failed = true } else {
        contentId = data.id; setEditing(data.id); message = status === 'published' ? 'Published · live on site' : 'Draft saved'
      }
    } else {
      // .select() returns the rows that were actually updated. If the session has expired
      // the database changes nothing and reports no error, so check for that explicitly.
      const { data: updated, error } = await supabase.from('content').update(payload).eq('id', editing!).select('id')
      if (error) { message = `Error: ${error.message}`; failed = true }
      else if (!updated || updated.length === 0) {
        message = 'Not saved: your session may have expired. Sign in again, then retry.'; failed = true
      } else {
        contentId = editing; message = status === 'published' ? 'Saved · live on site' : 'Draft saved'
      }
    }
    if (contentId && type === 'exercise') {
      const catErr = await saveCategory(supabase, contentId, category)
      if (catErr) { message = `Saved, but the category was not updated: ${catErr}`; failed = true }
    }
    say(message, failed ? 'error' : 'ok')
    setSaving(false)
    router.refresh()
  }

  const handleCancel = () => {
    if (editing === 'new' || !editing) { setEditing(null); return }
    startEdit(editing, true).then(() => say('Changes discarded'))
  }

  const handleDelete = async () => {
    if (!editing || editing === 'new') return
    if (!confirm('Delete this post?')) return
    const supabase = createClient()
    await supabase.from('content').delete().eq('id', editing)
    setEditing(null)
    router.refresh()
  }

  const uploadHero = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setHeroUploading(true)
    try {
      const form = new FormData(); form.append('file', file)
      const res = await fetch('/api/upload-image', { method: 'POST', body: form })
      const text = await res.text()
      let data: { url?: string; error?: string }
      try { data = JSON.parse(text) } catch { alert('Upload error: ' + text.slice(0, 200)); setHeroUploading(false); return }
      if (data.url) setHeroAsset(data.url)
      else alert('Upload failed: ' + (data.error ?? 'unknown') + ' (status ' + res.status + ')')
    } catch (err) { alert('Upload error: ' + (err instanceof Error ? err.message : JSON.stringify(err))) }
    setHeroUploading(false); e.target.value = ''
  }

  const uploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setAudioUploading(true)
    try {
      const urlRes = await fetch('/api/upload-audio-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name }),
      })
      const urlText = await urlRes.text()
      let urlData: { path?: string; token?: string; error?: string }
      try { urlData = JSON.parse(urlText) } catch { alert('Upload error: ' + urlText.slice(0, 200)); setAudioUploading(false); return }
      if (!urlData.path || !urlData.token) {
        alert('Upload failed: ' + (urlData.error ?? 'unknown') + ' (status ' + urlRes.status + ')')
        setAudioUploading(false); return
      }

      const supabase = createClient()
      const { error: uploadError } = await supabase.storage
        .from('audio-files')
        .uploadToSignedUrl(urlData.path, urlData.token, file)
      if (uploadError) { alert('Upload error: ' + uploadError.message); setAudioUploading(false); return }

      const { data: { publicUrl } } = supabase.storage.from('audio-files').getPublicUrl(urlData.path)
      setAudioUrl(publicUrl)
    } catch (err) { alert('Upload error: ' + (err instanceof Error ? err.message : JSON.stringify(err))) }
    setAudioUploading(false); e.target.value = ''
  }

  const uploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      say('That file is not a PDF.', 'error'); e.target.value = ''; return
    }
    setPdfUploading(true)
    try {
      const urlRes = await fetch('/api/upload-pdf-url', { method: 'POST' })
      const urlData: { path?: string; token?: string; error?: string } = await urlRes.json().catch(() => ({}))
      if (!urlData.path || !urlData.token) {
        say('Upload failed: ' + (urlData.error ?? 'unknown') + ' (status ' + urlRes.status + ')', 'error')
        setPdfUploading(false); e.target.value = ''; return
      }
      const supabase = createClient()
      const { error: uploadError } = await supabase.storage
        .from('paper-pdfs')
        .uploadToSignedUrl(urlData.path, urlData.token, file, { contentType: 'application/pdf' })
      if (uploadError) { say('Upload error: ' + uploadError.message, 'error'); setPdfUploading(false); e.target.value = ''; return }
      const { data: { publicUrl } } = supabase.storage.from('paper-pdfs').getPublicUrl(urlData.path)
      setPdfAsset(publicUrl)
      say('PDF uploaded. Save to publish it.')
    } catch (err) { say('Upload error: ' + (err instanceof Error ? err.message : JSON.stringify(err)), 'error') }
    setPdfUploading(false); e.target.value = ''
  }

  const visible = posts.filter(
    (p) => (typeFilter === 'all' || p.type === typeFilter) && (p.title || 'Untitled').toLowerCase().includes(q.trim().toLowerCase()),
  )
  const published = status === 'published'
  const saveLabel = saving ? 'Saving…' : published ? (editing === 'new' ? 'Publish' : 'Save & keep published') : 'Save draft'
  const shortTitle = title.length > 34 ? title.slice(0, 34) + '…' : title || 'Untitled'

  return (
    <div className="h-full grid lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)] min-h-0 min-w-0">
      {/* ── Post list ─────────────────────────────────────────── */}
      <div
        className={`${editing ? 'hidden lg:flex' : 'flex'} flex-col min-h-0 border-r bg-white`}
        style={{ borderColor: 'var(--ny-line)' }}
      >
        <div className="flex flex-col gap-3 px-4 pt-5 pb-3 border-b" style={{ borderColor: 'var(--ny-line)' }}>
          <div className="flex items-center justify-between">
            <h1 className="m-0 text-[22px]" style={{ letterSpacing: '-0.02em', color: 'var(--ny-ink)' }}>Content</h1>
            <button
              type="button"
              onClick={startNew}
              className="rounded-full px-3.5 py-[7px] text-[13px] font-medium text-white whitespace-nowrap transition-colors hover:bg-[var(--ny-tide-deep)]"
              style={{ background: 'var(--ny-tide)' }}
            >
              + New post
            </button>
          </div>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search posts"
            aria-label="Search posts"
            className="ny-search"
          />
          <Seg
            size="sm"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'article', label: 'Article' },
              { value: 'paper', label: 'Paper' },
              { value: 'exercise', label: 'Exercise' },
            ]}
          />
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {visible.length === 0 && (
            <p className="p-4 text-[13px] m-0" style={{ color: 'var(--ny-ink-4)' }}>
              {posts.length === 0 ? 'No posts yet.' : 'No posts match.'}
            </p>
          )}
          {visible.map((p) => {
            const active = editing === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => startEdit(p.id)}
                className="block w-full text-left px-4 py-3.5 border-b transition-colors hover:bg-[var(--ny-mist)]"
                style={{ borderColor: '#F0F0F3', background: active ? 'var(--ny-tide-tint)' : undefined }}
              >
                <div className="flex items-center gap-2 text-[11px] font-semibold" style={{ letterSpacing: '.02em' }}>
                  <span style={{ color: TYPE_INK[p.type] }}>{(TYPE_LABEL[p.type] ?? p.type).toUpperCase()}</span>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.status === 'published' ? 'var(--ny-leaf)' : '#C7C7CC' }} />
                  <span className="font-normal" style={{ color: 'var(--ny-ink-4)' }}>{p.status}</span>
                </div>
                <div className="mt-1 text-sm leading-snug" style={{ fontWeight: active ? 600 : 400, color: 'var(--ny-ink)' }}>
                  {p.title || 'Untitled'}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Editor ────────────────────────────────────────────── */}
      {editing ? (
        <div className="flex flex-col min-h-0 min-w-0">
          {/* Top bar */}
          <div
            className="flex-none flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 sm:px-6 py-2.5 min-h-14 border-b"
            style={{ background: 'rgba(255,255,255,.8)', backdropFilter: 'var(--ny-blur)', WebkitBackdropFilter: 'var(--ny-blur)', borderColor: 'var(--ny-line)' }}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="lg:hidden text-[14px] whitespace-nowrap"
                style={{ color: 'var(--ny-tide)' }}
              >
                ‹ Content
              </button>
              <Seg
                value={type}
                onChange={(v) => setType(v)}
                options={CONTENT_TYPES.map((t) => ({ value: t, label: TYPE_LABEL[t] }))}
              />
            </div>
            <div className="flex items-center gap-2">
              {notice?.kind === 'error' && (
                <span className="text-[13px] max-w-[320px]" role="alert" style={{ color: 'var(--ny-coral)' }}>{notice.text}</span>
              )}
              <button type="button" onClick={handleCancel} className={pillSecondary} style={{ borderColor: 'var(--ny-line-strong)', color: 'var(--ny-ink)' }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !title}
                className="rounded-full px-4 py-2 text-[13px] font-medium text-white whitespace-nowrap transition-colors hover:bg-[var(--ny-tide-deep)] disabled:opacity-40"
                style={{ background: 'var(--ny-tide)' }}
              >
                {saveLabel}
              </button>
            </div>
          </div>

          {/* Scrolling work area: writing column + settings cards (cards wrap below on narrower screens) */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-wrap items-start content-start">
            <div className="flex-[2_1_420px] min-w-0 max-w-[820px] mx-auto px-5 sm:px-8 pt-8 pb-20">
              <AutoTextarea
                value={title}
                onChange={handleTitleChange}
                placeholder="Title"
                singleLine
                style={{ fontSize: 36, lineHeight: 1.1, letterSpacing: '-0.03em', fontWeight: 600, color: 'var(--ny-ink)' }}
              />
              <AutoTextarea
                value={excerpt}
                onChange={setExcerpt}
                placeholder="Excerpt — short preview shown in listings (optional)"
                className="mt-3"
                style={{ fontSize: 19, lineHeight: 1.45, color: 'var(--ny-ink-3)' }}
              />
              <div className="mt-7">
                <MdxEditor key={editing} value={body} onChange={setBody} />
              </div>
            </div>

            <div
              className="flex-[1_1_280px] min-w-0 max-w-[820px] mx-auto lg:sticky lg:top-0 px-5 sm:px-6 pt-6 pb-10 grid gap-4 content-start"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))' }}
            >
              <Card title="Status · visibility on the live site">
                <Seg
                  value={status}
                  onChange={setStatus}
                  options={[{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }]}
                  activeInk={(v) => (v === 'published' ? 'var(--ny-leaf)' : undefined)}
                />
                <div className="text-xs" style={{ color: published ? 'var(--ny-leaf)' : 'var(--ny-ink-4)' }}>
                  {published ? '● Live now on neuroyou.online' : 'Hidden from the live site'}
                </div>
              </Card>

              <Card title="Details">
                <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: 'var(--ny-ink-3)' }}>
                  <span className="flex items-center justify-between">
                    Slug
                    <button type="button" onClick={() => setSlugEdit((v) => !v)} className="text-xs font-normal" style={{ color: 'var(--ny-tide)' }}>
                      {slugEdit ? 'Done' : 'Edit'}
                    </button>
                  </span>
                  <input
                    type="text"
                    value={slug || slugify(title)}
                    readOnly={!slugEdit}
                    onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }}
                    className="ny-sm ny-mono"
                  />
                </label>
                <div className="grid grid-cols-[minmax(0,1fr)_90px] gap-2.5">
                  <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: 'var(--ny-ink-3)' }}>
                    Date
                    <input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className="ny-sm" />
                  </label>
                  <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: 'var(--ny-ink-3)' }}>
                    Sort order
                    <input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} className="ny-sm" />
                  </label>
                </div>
                <div className="text-[11px] -mt-1" style={{ color: 'var(--ny-ink-4)' }}>Lower sort order appears first.</div>
              </Card>

              {type === 'exercise' && (
                <>
                  <Card title="Category · groups this exercise on the Learn page">
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="ny-sm">
                      <option value="">None</option>
                      {EXERCISE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Card>

                  <Card title="Video and audio">
                    <label className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: 'var(--ny-ink-3)' }}>
                      Vimeo video URL
                      <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://vimeo.com/123456789" className="ny-sm" />
                    </label>
                    <div className="text-xs font-medium mt-1" style={{ color: 'var(--ny-ink-3)' }}>Audio (MP3)</div>
                    <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={uploadAudio} />
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => audioInputRef.current?.click()} className={pillSecondary} style={{ borderColor: 'var(--ny-line-strong)' }}>
                        {audioUploading ? 'Uploading…' : audioUrl ? 'Replace audio' : 'Upload MP3'}
                      </button>
                      {audioUrl && (
                        <button type="button" onClick={() => setAudioUrl('')} className="px-2.5 py-2 text-[13px]" style={{ color: 'var(--ny-coral)' }}>Remove</button>
                      )}
                    </div>
                    {audioUrl && <p className="m-0 text-xs truncate" style={{ color: 'var(--ny-tide)' }}>{audioUrl}</p>}
                  </Card>
                </>
              )}

              {type === 'paper' && (
                <Card title="Downloadable PDF">
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px]" style={{ background: 'var(--ny-mist)' }}>
                    <div
                      className="w-8 h-10 rounded-[4px] bg-white border flex items-center justify-center text-[9px] font-bold"
                      style={{ borderColor: 'var(--ny-line)', color: 'var(--ny-coral)' }}
                    >
                      PDF
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] truncate">{pdfAsset ? `${slug || slugify(title) || 'paper'}.pdf` : 'No PDF uploaded'}</div>
                      <div className="text-[11px]" style={{ color: 'var(--ny-ink-4)' }}>
                        {pdfAsset ? 'Uploaded' : 'Readers get the print view and can save it as a PDF'}
                      </div>
                    </div>
                    {pdfAsset && (
                      <a href={pdfAsset} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: 'var(--ny-tide)' }}>View</a>
                    )}
                  </div>
                  <input ref={pdfInputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={uploadPdf} />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => pdfInputRef.current?.click()} className={`${pillSecondary} flex-1`} style={{ borderColor: 'var(--ny-line-strong)' }}>
                      {pdfUploading ? 'Uploading…' : pdfAsset ? 'Replace PDF' : 'Upload PDF'}
                    </button>
                    {editing !== 'new' ? (
                      <a
                        href={`/research/${editing}?print=1`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded-full px-3.5 py-2 text-[13px] text-center"
                        style={{ background: 'var(--ny-tide-tint)', color: 'var(--ny-tide)' }}
                        title="Opens the print view. Choose “Save as PDF”, then upload the file here."
                      >
                        Print view
                      </a>
                    ) : null}
                  </div>
                  {pdfAsset && (
                    <button type="button" onClick={() => setPdfAsset('')} className="self-start text-[13px]" style={{ color: 'var(--ny-coral)' }}>
                      Remove PDF
                    </button>
                  )}
                  <label className="flex items-center gap-2 text-[13px]">
                    <input type="checkbox" checked={showDownload} onChange={(e) => setShowDownload(e.target.checked)} style={{ accentColor: 'var(--ny-tide)' }} />
                    Show download button
                  </label>
                </Card>
              )}

              <Card title="Cover image">
                <div className="h-40 rounded-[10px] overflow-hidden flex items-center justify-center text-[13px]" style={{ background: 'var(--ny-mist)', color: 'var(--ny-ink-4)' }}>
                  {heroAsset ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={heroAsset} alt="Cover" className="w-full h-full object-cover" />
                  ) : 'No cover image'}
                </div>
                <input ref={heroInputRef} type="file" accept="image/*" className="hidden" onChange={uploadHero} />
                <div className="flex gap-2">
                  <button type="button" onClick={() => heroInputRef.current?.click()} className={`${pillSecondary} flex-1`} style={{ borderColor: 'var(--ny-line-strong)' }}>
                    {heroUploading ? 'Uploading…' : heroAsset ? 'Replace' : 'Upload image'}
                  </button>
                  {heroAsset && (
                    <button type="button" onClick={() => setHeroAsset('')} className="px-2.5 py-2 text-[13px]" style={{ color: 'var(--ny-coral)' }}>Remove</button>
                  )}
                </div>
              </Card>

              {editing !== 'new' && (
                <button type="button" onClick={handleDelete} className="self-start text-[13px] text-left px-1" style={{ color: 'var(--ny-coral)' }}>
                  Delete this post
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex items-center justify-center text-sm" style={{ color: 'var(--ny-ink-4)' }}>
          Select a post or create a new one
        </div>
      )}

      {/* Success toast */}
      {notice?.kind === 'ok' && (
        <div
          role="status"
          className="fixed left-1/2 -translate-x-1/2 bottom-6 z-[60] rounded-full px-[18px] py-2.5 text-sm text-white whitespace-nowrap"
          style={{ background: 'rgba(29,29,31,.88)' }}
        >
          {notice.text}
        </div>
      )}
    </div>
  )
}
