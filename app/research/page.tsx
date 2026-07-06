import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ResearchPage() {
  const supabase = await createClient()
  const { data: papers } = await supabase
    .from('blog_posts')
    .select('id, title, published_at, body, cover_image')
    .eq('type', 'research')
    .order('sort_order', { ascending: true })

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <p className="label mb-10">
        <span className="node mr-3" style={{ background: 'var(--white)', boxShadow: '0 0 8px rgba(255,255,255,0.4)' }} />
        Research / White Papers
      </p>
      <h1 className="text-4xl font-light text-[var(--white)] tracking-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
        Research
      </h1>
      <p className="text-sm text-[var(--muted)] font-light mb-16 max-w-xl leading-relaxed">
        The scientific and theoretical foundations of the NeuroYou framework.
        Deliberately dense — written for readers who want rigour, not reassurance.
      </p>

      {papers && papers.length > 0 ? (
        <div className="divide-y divide-[var(--border)]">
          {papers.map((paper) => (
            <Link
              key={paper.id}
              href={`/research/${paper.id}`}
              className="group flex items-start justify-between gap-8 py-10 hover:text-[var(--blue)] transition-colors"
            >
              <div className="flex gap-6 items-start w-full">
                {paper.cover_image && (
                  <img src={paper.cover_image} alt="" className="w-24 h-24 object-cover border border-[var(--border)] shrink-0 hidden sm:block" />
                )}
                <div className="min-w-0 flex-1">
                  <time className="label block mb-4">
                    {new Date(paper.published_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </time>
                  <h2 className="text-xl font-light text-[var(--white)] group-hover:text-[var(--blue)] transition-colors tracking-tight mb-3">
                    {paper.title}
                  </h2>
                  {paper.body && (
                    <p className="text-xs text-[var(--muted)] font-light leading-relaxed line-clamp-2 max-w-xl">
                      {paper.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 220)}…
                    </p>
                  )}
                </div>
              </div>
              <span className="text-[var(--blue)] text-sm shrink-0 mt-1">→</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border border-[var(--border)]">
          <p className="label">Papers loading</p>
          <p className="text-xs text-[var(--muted)] mt-3 font-light">Research content will appear here once published.</p>
        </div>
      )}
    </div>
  )
}
