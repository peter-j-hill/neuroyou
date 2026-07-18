'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { useEffect, useRef, useCallback } from 'react'
import { DiagramEmbed } from './DiagramNode'

type Props = { value: string; onChange: (html: string) => void }

const btnClass = (active: boolean) =>
  `px-2.5 py-1 text-[0.65rem] tracking-wider uppercase border transition-colors ${
    active
      ? 'border-[var(--blue)] text-[var(--blue)]'
      : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--white)] hover:border-[var(--muted)]'
  }`

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
        class: 'prose outline-none min-h-[400px] focus:outline-none',
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
    <div className="border border-[var(--border)]">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-3 border-b border-[var(--border)]">
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))}>H1</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive('heading', { level: 3 }))}>H3</button>
        <span className="w-px bg-[var(--border)] mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))}>I</button>
        <span className="w-px bg-[var(--border)] mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))}>List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))}>1. List</button>
        <span className="w-px bg-[var(--border)] mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))}>Quote</button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnClass(false)}>HR</button>
        <button type="button" onClick={handleLink} className={btnClass(editor.isActive('link'))} title="Link (Ctrl+K)">Link</button>
        <button
          type="button"
          onClick={() => editor.isActive('link') ? editor.chain().focus().unsetLink().run() : undefined}
          className={btnClass(false)}
          style={{ display: editor.isActive('link') ? 'inline-block' : 'none' }}
          title="Remove link"
        >Unlink</button>
        <span className="w-px bg-[var(--border)] mx-1" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={btnClass(false)}
          title="Upload image"
        >
          Image ↑
        </button>
        <button type="button" onClick={handleDiagram} className={btnClass(false)} title="Embed a diagram">
          Diagram
        </button>
        <span className="w-px bg-[var(--border)] mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className={btnClass(false)}
          title="Remove all formatting — converts selection to plain body text"
        >Clear fmt</button>
        <span className="w-px bg-[var(--border)] mx-1" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btnClass(false)}>Undo</button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btnClass(false)}>Redo</button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Editor area */}
      <div className="p-6 bg-[var(--graphite)]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
