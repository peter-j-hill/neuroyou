import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react'

// Lowercase, hyphenated tag name — browsers lowercase any element tag name
// on both parse and serialize, so a capitalized tag can't round-trip through
// Tiptap's HTML output. The public MDX renderer maps this exact tag name
// to the real <Diagram/> component (see lib/mdx.tsx).
const TAG = 'diagram-embed'

function DiagramNodeView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const edit = () => {
    const slug = window.prompt('Diagram slug', node.attrs.slug ?? '')
    if (slug === null) return
    const caption = window.prompt('Caption (optional)', node.attrs.caption ?? '') ?? ''
    updateAttributes({ slug, caption })
  }

  return (
    <NodeViewWrapper className="my-6 border border-[var(--border)] p-6 text-center" contentEditable={false}>
      <p className="label mb-2">Diagram</p>
      <p className="text-sm text-[var(--muted)]">{node.attrs.caption || node.attrs.slug || '(empty — click Edit)'}</p>
      <div className="mt-3 flex items-center justify-center gap-4">
        <button type="button" onClick={edit} className="text-xs text-[var(--blue)] hover:underline">Edit</button>
        <button type="button" onClick={() => deleteNode()} className="text-xs text-[var(--muted)] hover:text-[var(--magenta)]">Remove</button>
      </div>
    </NodeViewWrapper>
  )
}

export const DiagramEmbed = Node.create({
  name: 'diagramEmbed',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      slug: { default: '' },
      caption: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: TAG }]
  },

  renderHTML({ HTMLAttributes }) {
    return [TAG, mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(DiagramNodeView)
  },
})
