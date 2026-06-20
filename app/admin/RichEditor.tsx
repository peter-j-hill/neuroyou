'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

type Props = { content: string; onChange: (html: string) => void }

const btnClass = (active: boolean) =>
  `px-2.5 py-1 text-[0.65rem] tracking-wider uppercase border transition-colors ${
    active
      ? 'border-[var(--blue)] text-[var(--blue)]'
      : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--white)] hover:border-[var(--muted)]'
  }`

export default function RichEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose outline-none min-h-[400px] focus:outline-none',
      },
    },
  })

  // Sync external content changes (switching posts)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) return null

  return (
    <div className="border border-[var(--border)]">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-3 border-b border-[var(--border)]">
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))}>H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))}>H2</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive('heading', { level: 3 }))}>H3</button>
        <span className="w-px bg-[var(--border)] mx-1" />
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))}>I</button>
        <span className="w-px bg-[var(--border)] mx-1" />
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))}>List</button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))}>1. List</button>
        <span className="w-px bg-[var(--border)] mx-1" />
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))}>Quote</button>
        <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnClass(false)}>HR</button>
        <span className="w-px bg-[var(--border)] mx-1" />
        <button onClick={() => editor.chain().focus().undo().run()} className={btnClass(false)}>Undo</button>
        <button onClick={() => editor.chain().focus().redo().run()} className={btnClass(false)}>Redo</button>
      </div>

      {/* Editor area */}
      <div className="p-6 bg-[var(--graphite)]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
