'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { useEffect, useRef, useCallback } from 'react'
import { DiagramEmbed } from './DiagramNode'

type Props = { value: string; onChange: (html: string) => void }

const btnClass = (active: boolean) =>
  `min-w-[34px] h-8 px-2.5 rounded-[7px] text-[13px] whitespace-nowrap transition-colors ${
    active
      ? 'bg-[var(--ny-tide-tint)] text-[var(--ny-tide)] font-semibold'
      : 'text-[var(--ny-ink)] hover:bg-[var(--ny-mist)]'
  }`

// Thin divider between groups of toolbar buttons
const Sep = () => <span className="w-px self-stretch my-1 mx-1" style={{ background: 'var(--ny-line)' }} />

export default function MdxEditor({ value, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      DiagramEmbed,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'ny-prose outline-none min-h-[420px] focus:outline-none',
      },
    },
  })

  const handleLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL', prev ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().unsetLink().run()
    } else {
      editor.chain().focus().setLink({ href: url, target: '_blank' }).run()
    }
  }, [editor])

  const handleDiagram = useCallback(() => {
    if (!editor) return
    const slug = window.prompt('Diagram slug', '')
    if (slug === null) return
    const caption = window.prompt('Caption (optional)', '') ?? ''
    editor.chain().focus().insertContent({ type: 'diagramEmbed', attrs: { slug, caption } }).run()
  }, [editor])

  useEffect(() => {
    if (!editor) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        handleLink()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [editor, handleLink])

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value)
  }, [value, editor])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/api/upload-image', { method: 'POST', body: form })
      const text = await res.text()
      let data: { url?: string; error?: string }
      try {
        data = JSON.parse(text)
      } catch {
        alert('Upload failed: server returned unexpected response.\n\n' + text.slice(0, 200))
        e.target.value = ''
        return
      }

      if (data.url) {
        editor.chain().focus().setImage({ src: data.url }).run()
      } else {
        alert('Upload failed: ' + (data.error ?? 'unknown error') + '\n\nStatus: ' + res.status)
      }
    } catch (err) {
      alert('Upload failed: ' + (err instanceof Error ? err.message + '\n' + err.stack : JSON.stringify(err)))
    }

    e.target.value = ''
  }

  if (!editor) return null

  return (
    <div>
      {/* Toolbar — stays in view while the page scrolls */}
      <div
        className="sticky top-0 z-[5] flex flex-wrap items-center gap-0.5 p-1.5 rounded-xl border bg-white"
        style={{ borderColor: 'var(--ny-line)', boxShadow: '0 2px 10px rgba(0,0,0,.04)' }}
      >
        <button type="button" title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))}>H1</button>
        <button type="button" title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))}>H2</button>
        <button type="button" title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive('heading', { level: 3 }))}>H3</button>
        <button type="button" title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} style={{ fontWeight: 700 }}>B</button>
        <button type="button" title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} style={{ fontStyle: 'italic' }}>I</button>
        <Sep />
        <button type="button" title="Bulleted list" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))}>• List</button>
        <button type="button" title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))}>1. List</button>
        <Sep />
        <button type="button" title="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))}>Quote</button>
        <button type="button" title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnClass(false)}>—</button>
        <button type="button" title="Link (Ctrl+K)" onClick={handleLink} className={btnClass(editor.isActive('link'))}>Link</button>
        <button
          type="button"
          onClick={() => editor.isActive('link') ? editor.chain().focus().unsetLink().run() : undefined}
          className={btnClass(false)}
          style={{ display: editor.isActive('link') ? 'inline-block' : 'none' }}
          title="Remove link"
        >Unlink</button>
        <Sep />
        <button type="button" title="Upload image" onClick={() => fileInputRef.current?.click()} className={btnClass(false)}>Image ↑</button>
        <button type="button" title="Embed a diagram" onClick={handleDiagram} className={btnClass(false)}>Diagram</button>
        <Sep />
        <button
          type="button"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className={btnClass(false)}
          title="Remove all formatting — converts selection to plain body text"
        >Clear</button>
        <Sep />
        <button type="button" title="Undo" onClick={() => editor.chain().focus().undo().run()} className={btnClass(false)}>↶</button>
        <button type="button" title="Redo" onClick={() => editor.chain().focus().redo().run()} className={btnClass(false)}>↷</button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Writing surface — styled like the public article body */}
      <div
        className="mt-2 rounded-[14px] bg-white px-6 sm:px-9 py-8 min-h-[480px] transition-shadow focus-within:shadow-[0_0_0_3px_rgba(10,108,140,.18)]"
        style={{ boxShadow: '0 1px 2px rgba(0,0,0,.04)' }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
