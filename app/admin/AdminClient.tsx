'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import RichEditor from './RichEditor'

type Post = { id: string; title: string; type: string; published_at: string }

export default function AdminClient({ posts }: { posts: Post[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<string | null>(null) // post id or 'new'
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'research' | 'blog'>('blog')
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().slice(0, 10))
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const startNew = () => {
    setEditing('new')
    setTitle('')
    setType('blog')
    setPublishedAt(new Date().toISOString().slice(0, 10))
    setBody('')
    setMsg('')
  }

  const startEdit = async (id: string) => {
    const supabase = createClient()
    const { data } = await supabase.from('blog_posts').select('*').eq('id', id).single()
    if (!data) return
    setEditing(id)
    setTitle(data.title)
    setType(data.type)
    setPublishedAt(data.published_at.slice(0, 10))
    setBody(data.body ?? '')
    setMsg('')
  }

  const handleSave = async () => {
    setSaving(true)
    setMsg('')
    const supabase = createClient()
    const payload = { title, type, body, published_at: new Date(publishedAt).toISOString() }

    if (editing === 'new') {
      const { error } = await supabase.from('blog_posts').insert(payload)
      setMsg(error ? `Error: ${error.message}` : 'Published.')
    } else {
      const { error } = await supabase.from('blog_posts').update(payload).eq('id', editing!)
      setMsg(error ? `Error: ${error.message}` : 'Saved.')
    }
    setSaving(false)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return
    const supabase = createClient()
    await supabase.from('blog_posts').delete().eq('id', id)
    if (editing === id) setEditing(null)
    router.refresh()
  }

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
          {posts.length === 0 && (
            <p className="p-4 text-xs text-[var(--muted)]">No posts yet.</p>
          )}
          {posts.map((p) => (
            <div
              key={p.id}
              className={`group flex items-start justify-between gap-2 p-4 border-b border-[var(--border)] cursor-pointer hover:bg-[var(--graphite)] transition-colors ${editing === p.id ? 'bg-[var(--graphite)]' : ''}`}
              onClick={() => startEdit(p.id)}
            >
              <div className="min-w-0">
                <p className={`text-[0.6rem] tracking-widest uppercase mb-1 ${p.type === 'research' ? 'text-[var(--blue)]' : 'text-[var(--muted)]'}`}>
                  {p.type}
                </p>
                <p className="text-xs text-[var(--white)] font-light leading-snug truncate">{p.title}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(p.id) }}
                className="text-[var(--muted)] hover:text-[var(--magenta)] text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Editor panel */}
        {editing ? (
          <div className="border border-[var(--border)] p-6 space-y-5">
            {/* Type toggle */}
            <div className="flex gap-2">
              {(['blog', 'research'] as const).map((t) => (
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
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 text-sm font-light rounded-none"
                placeholder="Post title"
              />
            </div>

            {/* Date */}
            <div>
              <label className="label block mb-2">Date</label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="px-4 py-3 text-sm font-light rounded-none"
              />
            </div>

            {/* Rich text editor */}
            <div>
              <label className="label block mb-2">Body</label>
              <RichEditor content={body} onChange={setBody} />
            </div>

            {/* Save */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !title}
                className="px-6 py-2.5 border border-[var(--blue)] text-[var(--blue)] text-xs tracking-widest uppercase hover:bg-[var(--accent-glow)] transition-colors disabled:opacity-40"
              >
                {saving ? 'Saving…' : editing === 'new' ? 'Publish' : 'Save changes'}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="text-xs text-[var(--muted)] tracking-widest uppercase hover:text-[var(--white)] transition-colors"
              >
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
