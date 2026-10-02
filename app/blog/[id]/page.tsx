import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MdxContent } from '@/lib/mdx'
import ArticleLayout from '@/components/ArticleLayout'

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
    <ArticleLayout
      backHref="/blog"
      backLabel="Explore"
      kind="Article"
      date={new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      title={post.title}
      excerpt={post.excerpt}
      heroAsset={post.hero_asset}
    >
      {post.body_mdx && <MdxContent source={post.body_mdx} variant="light" />}
    </ArticleLayout>
  )
}
