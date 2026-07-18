'use server'

import { compileMDX } from 'next-mdx-remote/rsc'
import Diagram from '@/components/Diagram'
import type { ReactNode } from 'react'

export async function previewMdx(source: string): Promise<{ content?: ReactNode; error?: string }> {
  if (!source.trim()) return { content: null }
  try {
    const { content } = await compileMDX({ source, components: { Diagram } })
    return { content }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Could not compile MDX' }
  }
}
