import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const revalidate = 60

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, title, published_at, body')
    .order('published_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <p className="label mb-10">
        <span className="node mr-3" />
        Research / Articles
      </p>
      <h1 className="text-4xl font-light text-[var(--white)] tracking-tight mb-16" style={{ letterSpacing: '-0.02em' }}>
        Research
      </h1>

      {posts && posts.length > 0 ? (
        <div className="divide-y divide-[var(--border)]">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="group flex items-start justify-between gap-8 py-10 hover:text-[var(--blue)] transition-colors"
            >
              <div>
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
                    {post.body.slice(0, 200)}…
                  </p>
                )}
              </div>
              <span className="text-[var(--blue)] text-sm shrink-0 mt-1">→</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border border-[var(--border)]">
          <p className="label">Articles loading</p>
          <p className="text-xs text-[var(--muted)] mt-3 font-light">Research content will appear here once published.</p>
        </div>
      )}
    </div>
  )
}
