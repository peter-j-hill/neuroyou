'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import MdxEditor from '@/components/MdxEditor'
import { EXERCISE_CATEGORIES, categoryFromTags } from '@/lib/categories'

type Post = { id: string; title: string; type: string; status: string; published_at: string; sort_order?: number }

const CONTENT_TYPES = ['article', 'paper', 'exercise'] as const

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

export default function AdminClient({ posts }: { posts: Post[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [type, setType] = useState<(typeof CONTENT_TYPES)[number]>('article')
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
  const [sortOrder, setSortOrder] = useState(0)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const heroInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setTitle(''); setSlug(''); setSlugTouched(false); setType('article'); setStatus('published')
    setPublishedAt(new Date().toISOString().slice(0, 10))
    setExcerpt(''); setCategory(''); setBody(''); setHeroAsset(''); setVideoUrl(''); setAudioUrl(''); setSortOrder(0); setMsg('')
  }

  const startNew = () => { reset(); setEditing('new') }

  const startEdit = async (id: string) => {
    const supabase = createClient()
    const { data } = await supabase.from('content').select('*').eq('id', id).single()
    if (!data) return
    setEditing(id)
    setTitle(data.title)
    setSlug(data.slug)
    setSlugTouched(true)
    setType(data.type)
    setStatus(data.status)
    setPublishedAt((data.published_at as string).slice(0, 10))
    setExcerpt(data.excerpt ?? '')
    setBody(data.body_mdx ?? '')
    setHeroAsset(data.hero_asset ?? '')
    setVideoUrl(data.video_url ?? '')
    setAudioUrl(data.audio_url ?? '')
    setSortOrder(data.sort_order ?? 0)
    setMsg('')
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
    setSaving(true); setMsg('')
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
    }
    let contentId: string | null = null
    let message = ''
    if (editing === 'new') {
      const { data, error } = await supabase.from('content').insert(payload).select('id').single()
      if (error) { message = `Error: ${error.message}` } else { contentId = data.id; setEditing(data.id); message = 'Published.' }
    } else {
      const { error } = await supabase.from('content').update(payload).eq('id', editing!)
      if (error) { message = `Error: ${error.message}` } else { contentId = editing; message = 'Saved.' }
    }
    if (contentId && type === 'exercise') {
      const catErr = await saveCategory(supabase, contentId, category)
      if (catErr) message = `Saved, but the category was not updated: ${catErr}`
    }
    setMsg(message)
    setSaving(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return
    const supabase = createClient()
    await supabase.from('content').delete().eq('id', id)
    if (editing === id) setEditing(null)
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

  const typeColor = (t: string) => t === 'paper' ? 'text-[var(--blue)]' : t === 'exercise' ? 'text-[var(--violet)]' : 'text-[var(--muted)]'

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-12">
        <div>
          <p className="label mb-2"><span className="node mr-3" />Admin</p>
          <h1 className="text-2xl font-light text-[var(--white)] tracking-tight">Content editor</h1>
        </div>
        <button
          onClick={startNew}
          className="px-5 py-2 border border-[var(--blue)] text-[var(--blue)] text-xs tracking-widest uppercase hover:bg-[var(--accent-glow)] transition-colors"
        >
          + New post
        </button>
      </div>

      <div className="grid sm:grid-cols-[280px_1fr] gap-8">
        {/* Post list */}
        <div className="border border-[var(--border)]">
          <div className="p-4 border-b border-[var(--border)]">
            <p className="label">All posts</p>
          </div>
          {posts.length === 0 && <p className="p-4 text-xs text-[var(--muted)]">No posts yet.</p>}
          {posts.map((p) => (
            <div
              key={p.id}
              className={`group flex items-start justify-between gap-2 p-4 border-b border-[var(--border)] cursor-pointer hover:bg-[var(--graphite)] transition-colors ${editing === p.id ? 'bg-[var(--graphite)]' : ''}`}
              onClick={() => startEdit(p.id)}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-[0.6rem] tracking-widest uppercase ${typeColor(p.type)}`}>{p.type}</p>
                  <span className="text-[0.6rem] text-[var(--border)] font-light">·</span>
                  <p className="text-[0.6rem] text-[var(--muted)] font-light">{p.status}</p>
                </div>
                <p className="text-xs text-[var(--white)] font-light leading-snug truncate">{p.title}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(p.id) }}
                className="text-[var(--muted)] hover:text-[var(--magenta)] text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >×</button>
            </div>
          ))}
        </div>

        {/* Editor panel */}
        {editing ? (
          <div className="border border-[var(--border)] p-6 space-y-5">
            {/* Type toggle */}
            <div className="flex gap-2">
              {CONTENT_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-1.5 text-[0.6rem] tracking-widest uppercase border transition-colors ${
                    type === t
                      ? 'border-[var(--blue)] text-[var(--blue)] bg-[var(--accent-glow)]'
                      : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted)]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Title */}
            <div>
              <label className="label block mb-2">Title</label>
              <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-3 text-sm font-light rounded-none" placeholder="Post title" />
            </div>

            {/* Slug */}
            <div>
              <label className="label block mb-2">Slug</label>
              <input type="text" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }}
                className="w-full px-4 py-3 text-sm font-light rounded-none" />
            </div>

            {/* Category (exercises only) */}
            {type === 'exercise' && (
              <div>
                <label className="label block mb-2">Category <span className="normal-case text-[var(--muted)]">— groups this exercise on the Learn page</span></label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-light rounded-none text-[var(--white)]"
                  style={{ background: '#1A2035', border: '1px solid #2E3348' }}>
                  <option value="">None</option>
                  {EXERCISE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            {/* Excerpt */}
            <div>
              <label className="label block mb-2">Excerpt <span className="normal-case text-[var(--muted)]">— short preview text shown in post listings, optional</span></label>
              <textarea rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-4 py-3 text-sm font-light rounded-none" placeholder="One or two sentences summarizing the post" />
            </div>

            {/* Status */}
            <div className="border border-[var(--border)] p-4">
              <label className="label block mb-3">Status — controls whether this is visible on the live site</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStatus('published')}
                  className={`flex-1 px-4 py-3 text-xs tracking-widest uppercase border-2 transition-colors ${
                    status === 'published' ? 'border-[var(--blue)] text-[var(--blue)] bg-[var(--accent-glow)]' : 'border-[var(--border)] text-[var(--muted)]'
                  }`}>Published — live now</button>
                <button type="button" onClick={() => setStatus('draft')}
                  className={`flex-1 px-4 py-3 text-xs tracking-widest uppercase border-2 transition-colors ${
                    status === 'draft' ? 'border-[var(--white)] text-[var(--white)] bg-[var(--border)]' : 'border-[var(--border)] text-[var(--muted)]'
                  }`}>Draft — hidden</button>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="label block mb-2">Date</label>
              <input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)}
                className="px-4 py-3 text-sm font-light rounded-none" />
            </div>

            {/* Sort order */}
            <div>
              <label className="label block mb-2">Sort order <span className="normal-case text-[var(--muted)]">(lower = first)</span></label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className="w-24 px-4 py-3 text-sm font-light rounded-none"
              />
            </div>

            {/* Cover image */}
            <div>
              <label className="label block mb-2">Cover image</label>
              <input ref={heroInputRef} type="file" accept="image/*" className="hidden" onChange={uploadHero} />
              <div className="flex items-start gap-4">
                <button type="button" onClick={() => heroInputRef.current?.click()}
                  className="px-4 py-2 border border-[var(--border)] text-[var(--muted)] text-xs tracking-widest uppercase hover:border-[var(--white)] hover:text-[var(--white)] transition-colors">
                  {heroUploading ? 'Uploading…' : heroAsset ? 'Replace image' : 'Upload image'}
                </button>
                {heroAsset && (
                  <button type="button" onClick={() => setHeroAsset('')}
                    className="text-xs text-[var(--muted)] hover:text-[var(--magenta)] transition-colors tracking-widest uppercase">
                    Remove
                  </button>
                )}
              </div>
              {heroAsset && <img src={heroAsset} alt="Cover" className="mt-3 max-h-48 border border-[var(--border)] object-cover" />}
            </div>

            {/* Exercise-only fields */}
            {type === 'exercise' && (
              <>
                {/* Vimeo URL */}
                <div>
                  <label className="label block mb-2">Vimeo video URL</label>
                  <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full px-4 py-3 text-sm font-light rounded-none"
                    placeholder="https://vimeo.com/123456789" />
                </div>

                {/* Audio upload */}
                <div>
                  <label className="label block mb-2">Audio (MP3)</label>
                  <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={uploadAudio} />
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => audioInputRef.current?.click()}
                      className="px-4 py-2 border border-[var(--border)] text-[var(--muted)] text-xs tracking-widest uppercase hover:border-[var(--white)] hover:text-[var(--white)] transition-colors">
                      {audioUploading ? 'Uploading…' : audioUrl ? 'Replace audio' : 'Upload MP3'}
                    </button>
                    {audioUrl && (
                      <button type="button" onClick={() => setAudioUrl('')}
                        className="text-xs text-[var(--muted)] hover:text-[var(--magenta)] transition-colors tracking-widest uppercase">
                        Remove
                      </button>
                    )}
                  </div>
                  {audioUrl && <p className="mt-2 text-xs text-[var(--blue)] font-light truncate">{audioUrl}</p>}
                </div>
              </>
            )}

            {/* MDX editor */}
            <div>
              <label className="label block mb-2">Body</label>
              <MdxEditor key={editing} value={body} onChange={setBody} />
            </div>

            {/* Save */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !title}
                className="px-6 py-2.5 border border-[var(--blue)] text-[var(--blue)] text-xs tracking-widest uppercase hover:bg-[var(--accent-glow)] transition-colors disabled:opacity-40"
              >
                {saving
                  ? 'Saving…'
                  : status === 'published'
                    ? (editing === 'new' ? 'Publish' : 'Save & keep published')
                    : 'Save as draft'}
              </button>
              <button onClick={() => setEditing(null)}
                className="text-xs text-[var(--muted)] tracking-widest uppercase hover:text-[var(--white)] transition-colors">
                Cancel
              </button>
              {msg && <p className="text-xs text-[var(--blue)]">{msg}</p>}
            </div>
          </div>
        ) : (
          <div className="border border-[var(--border)] flex items-center justify-center text-[var(--muted)] text-xs tracking-widest uppercase">
            Select a post or create a new one
          </div>
        )}
      </div>
    </div>
  )
}
