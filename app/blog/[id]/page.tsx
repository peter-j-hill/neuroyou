import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MdxContent } from '@/lib/mdx'

export const dynamic = 'force-dynamic'

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .eq('site', 'neuroyou')
    .eq('type', 'article')
    .single()

  if (!post) notFound()

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <a href="/blog" className="label hover:text-[var(--white)] transition-colors mb-12 inline-flex items-center gap-2">
        ← Blog
      </a>

      {post.hero_asset && (
        <img src={post.hero_asset} alt="" className="w-full max-h-72 object-cover border border-[var(--border)] mt-12" />
      )}

      <div className={`grid sm:grid-cols-[1fr_2fr] gap-16 ${post.hero_asset ? 'mt-12' : 'mt-12'}`}>
        <div className="sm:sticky sm:top-12 self-start">
          <p className="label mb-6">Article</p>
          <h1 className="text-2xl font-light text-[var(--white)] tracking-tight leading-snug mb-6" style={{ letterSpacing: '-0.02em' }}>
            {post.title}
          </h1>
          <time className="label block">
            {new Date(post.published_at).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </time>
        </div>

        {post.body_mdx && <MdxContent source={post.body_mdx} />}
      </div>
    </div>
  )
}
