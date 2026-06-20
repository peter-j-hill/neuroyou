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
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="text-sm font-sans text-[var(--muted)] tracking-widest uppercase mb-4">
        Research
      </p>
      <h1 className="text-3xl font-normal mb-12">Articles</h1>

      {posts && posts.length > 0 ? (
        <div className="divide-y divide-[var(--border)]">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="group block py-8 hover:text-[var(--accent)] transition-colors"
            >
              <time className="text-xs font-sans text-[var(--muted)] block mb-3">
                {new Date(post.published_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
              <h2 className="text-xl font-normal group-hover:text-[var(--accent)] transition-colors mb-3">
                {post.title}
              </h2>
              {post.body && (
                <p className="text-sm text-[var(--muted)] leading-relaxed line-clamp-2">
                  {post.body.slice(0, 200)}…
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border border-[var(--border)] rounded-sm">
          <p className="text-[var(--muted)] font-sans text-sm">
            Articles coming soon.
          </p>
        </div>
      )}
    </div>
  )
}
