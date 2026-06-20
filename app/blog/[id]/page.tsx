import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const revalidate = 60

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (!post) notFound()

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <a href="/blog" className="text-sm font-sans text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-8 inline-block">
        ← Research
      </a>

      <time className="text-xs font-sans text-[var(--muted)] block mb-4">
        {new Date(post.published_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </time>

      <h1 className="text-3xl font-normal mb-12">{post.title}</h1>

      <div className="prose">
        {post.body?.split('\n\n').map((para: string, i: number) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  )
}
