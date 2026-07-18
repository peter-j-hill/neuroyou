import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MdxContent } from '@/lib/mdx'

export const dynamic = 'force-dynamic'

export default async function ResearchPaperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: paper } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .eq('site', 'neuroyou')
    .eq('type', 'paper')
    .single()

  if (!paper) notFound()

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <a href="/research" className="label hover:text-[var(--white)] transition-colors mb-12 inline-flex items-center gap-2">
        ← Research
      </a>

      {paper.hero_asset && (
        <img src={paper.hero_asset} alt="" className="w-full max-h-72 object-cover border border-[var(--border)] mt-12" />
      )}

      <div className="grid sm:grid-cols-[1fr_2fr] gap-16 mt-12">
        <div className="sm:sticky sm:top-12 self-start">
          <p className="label mb-6">White Paper</p>
          <h1 className="text-2xl font-light text-[var(--white)] tracking-tight leading-snug mb-6" style={{ letterSpacing: '-0.02em' }}>
            {paper.title}
          </h1>
          <time className="label block">
            {new Date(paper.published_at).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </time>
        </div>

        {paper.body_mdx && <MdxContent source={paper.body_mdx} />}
      </div>
    </div>
  )
}
