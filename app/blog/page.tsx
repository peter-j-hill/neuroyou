import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { displayableExcerpt } from '@/lib/excerpt'

export const dynamic = 'force-dynamic'

// Page copy from the redesign handoff. Previous strings, kept here so they are
// easy to restore:
//   heading: "Explore"
//   intro: "Explore the sort of ideas you can expect to encounter in the NeuroYou
//   consciousness lab. These short articles cover some of the history, thinking and
//   practical experimentation from the NeuroYou lab over many years."
const COPY = {
  eyebrow: 'Explore · Free',
  heading: 'From the lab.',
  intro:
    'Short essays on consciousness, perception, and practical experimentation, drawn from many years of work.',
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('content')
    .select('id, title, published_at, excerpt, hero_asset, hero_focal')
    .eq('site', 'neuroyou')
    .eq('type', 'article')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('published_at', { ascending: false })
    .order('id')

  // The first post (current sort order) is featured; there is no separate
  // "featured" flag in the CMS.
  const [featured, ...rest] = posts ?? []

  return (
    <div className="ny-scope bg-white">
      <div className="max-w-[1120px] mx-auto px-8 pt-24 pb-[120px]">
        <div className="ny-eyebrow mb-3.5">{COPY.eyebrow}</div>
        <h1 className="ny-page-title">{COPY.heading}</h1>
        <p className="ny-lede mt-5 max-w-[640px]" style={{ fontSize: 'clamp(19px, 2.6vw, 24px)', lineHeight: 1.4 }}>
          {COPY.intro}
        </p>

        {featured ? (
          <>
            <Link
              href={`/blog/${featured.id}`}
              className="grid gap-10 items-center mt-16 group"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}
            >
              <div className="h-[300px] sm:h-[440px] rounded-[28px] overflow-hidden" style={{ background: 'var(--ny-tide-tint)' }}>
                {featured.hero_asset && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.hero_asset}
                    alt=""
                    className="w-full h-full object-cover"
                    style={featured.hero_focal ? { objectPosition: featured.hero_focal } : undefined}
                  />
                )}
              </div>
              <div>
                <div className="ny-caption">{fmtDate(featured.published_at)}</div>
                <h2 className="ny-title mt-2.5">{featured.title}</h2>
                {displayableExcerpt(featured.excerpt) && (
                  <p className="mt-4 text-[19px] leading-normal" style={{ color: 'var(--ny-ink-3)' }}>
                    {displayableExcerpt(featured.excerpt)}
                  </p>
                )}
                <div className="mt-5 text-[17px] group-hover:underline" style={{ color: 'var(--ny-tide)' }}>Read ›</div>
              </div>
            </Link>

            {rest.length > 0 && (
              <div
                className="grid mt-24 gap-x-6 gap-y-12"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
              >
                {rest.map((post) => (
                  <Link key={post.id} href={`/blog/${post.id}`} className="group flex flex-col gap-3.5">
                    <div className="h-[220px] rounded-[18px] overflow-hidden" style={{ background: 'var(--ny-tide-tint)' }}>
                      {post.hero_asset && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.hero_asset}
                          alt=""
                          className="w-full h-full object-cover"
                          style={post.hero_focal ? { objectPosition: post.hero_focal } : undefined}
                        />
                      )}
                    </div>
                    <div className="ny-caption">{fmtDate(post.published_at)}</div>
                    <div
                      className="text-[21px] leading-tight font-semibold transition-colors group-hover:text-[var(--ny-tide)]"
                      style={{ letterSpacing: '-0.015em', color: 'var(--ny-ink)' }}
                    >
                      {post.title}
                    </div>
                    {post.excerpt && (
                      <div className="text-[15px] leading-normal line-clamp-3" style={{ color: 'var(--ny-ink-3)' }}>
                        {post.excerpt}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="ny-body mt-16" style={{ color: 'var(--ny-ink-3)' }}>
            Articles will appear here once published.
          </p>
        )}
      </div>
    </div>
  )
}
