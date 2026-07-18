import type { ReactNode } from 'react'
import Diagram from '@/components/Diagram'

// Tiptap emits body as one continuous HTML blob (no blank lines between
// tags), which real MDX/JSX compilers treat as an inert raw-HTML passthrough
// rather than individually-addressable elements — so a compiled MDX
// component map can never intercept a tag inside it. Diagram embeds are the
// one thing that needs to become a real React component, so pull them out
// with a direct regex split instead of round-tripping through an MDX
// compiler for a single special case.
const DIAGRAM_TAG_RE = /<diagram-embed\s+([^>]*)>\s*<\/diagram-embed>/g

function parseAttrs(attrString: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const re = /(\w+)="([^"]*)"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(attrString))) attrs[m[1]] = m[2]
  return attrs
}

export function MdxContent({ source }: { source: string }) {
  const parts: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0
  DIAGRAM_TAG_RE.lastIndex = 0

  while ((match = DIAGRAM_TAG_RE.exec(source))) {
    const before = source.slice(lastIndex, match.index)
    if (before) parts.push(<div key={key++} dangerouslySetInnerHTML={{ __html: before }} />)

    const attrs = parseAttrs(match[1])
    parts.push(<Diagram key={key++} slug={attrs.slug ?? ''} caption={attrs.caption} />)

    lastIndex = match.index + match[0].length
  }

  const rest = source.slice(lastIndex)
  if (rest) parts.push(<div key={key++} dangerouslySetInnerHTML={{ __html: rest }} />)

  return <div className="prose">{parts}</div>
}
