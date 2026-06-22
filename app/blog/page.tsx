import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, title, published_at, body, cover_image')
    .eq('type', 'blog')
    .order('published_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <p className="label mb-10">
        <span className="node mr-3" />
        Explore / Articles
      </p>
      <h1 className="text-4xl font-light text-[var(--white)] tracking-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
        Explore
      </h1>
      <p className="text-sm text-[var(--muted)] font-light mb-16 max-w-xl leading-relaxed">
        Explore the ideas that led to the creation of NeuroYou. These short articles cover some of the history, thinking and practical experimentation from the NeuroYou lab.
      </p>

      {posts && posts.length > 0 ? (
        <div className="divide-y divide-[var(--border)]">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="group flex items-start justify-between gap-8 py-10 hover:text-[var(--blue)] transition-colors"
            >
              <div className="flex gap-6 items-start w-full">
                {post.cover_image && (
                  <img src={post.cover_image} alt="" className="w-24 h-24 object-cover border border-[var(--border)] shrink-0 hidden sm:block" />
                )}
                <div className="min-w-0 flex-1">
                  <time className="label block mb-4">
                    {new Date(post.published_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </time>
                  <h2 className="text-xl font-light text-[var(--white)] group-hover:text-[var(--blue)] transition-colors tracking-tight mb-3">
                    {post.title}
                  </h2>
                  {post.body && (
                    <p className="text-xs text-[var(--muted)] font-light leading-relaxed line-clamp-2 max-w-xl">
                      {post.body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 220)}…
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
          <p className="label">Articles loading</p>
          <p className="text-xs text-[var(--muted)] mt-3 font-light">Blog content will appear here once published.</p>
        </div>
      )}
    </div>
  )
}
