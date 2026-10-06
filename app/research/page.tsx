import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { paperPdf } from '@/lib/paperPdf'

export const dynamic = 'force-dynamic'

// Page copy from the redesign handoff. Previous strings, kept here so they are
// easy to restore:
//   heading: "Research"
//   intro: "The scientific and theoretical foundations of the NeuroYou framework.
//   Deliberately dense — written for readers who want rigour, not reassurance."
const COPY = {
  eyebrow: 'Research',
  heading: 'Working papers.',
  intro:
    'The frameworks behind the NeuroYou protocols, set out for close reading and critique. Each paper can be read online or downloaded as a PDF for print.',
}

export default async function ResearchPage() {
  const supabase = await createClient()
  const { data: papers } = await supabase
    .from('content')
    .select('id, title, pdf_asset, show_download')
    .eq('site', 'neuroyou')
    .eq('type', 'paper')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
    .order('id')

  return (
    <div className="ny-scope bg-white">
      <div className="max-w-[1120px] mx-auto px-8 pt-24 pb-[120px]">
        <div className="ny-eyebrow mb-3.5">{COPY.eyebrow}</div>
        <h1 className="ny-page-title">{COPY.heading}</h1>
        <p className="ny-lede mt-5 max-w-[640px]" style={{ fontSize: 'clamp(19px, 2.6vw, 24px)', lineHeight: 1.4 }}>
          {COPY.intro}
        </p>

        {papers && papers.length > 0 ? (
          <div className="mt-[72px] border-t" style={{ borderColor: 'var(--ny-line)' }}>
            {papers.map((paper, i) => {
              const pdf = paperPdf(paper.id, paper.pdf_asset)
              return (
                <div
                  key={paper.id}
                  className="relative grid grid-cols-[40px_minmax(0,1fr)] sm:grid-cols-[64px_minmax(0,1fr)_auto] gap-x-6 gap-y-3 items-baseline py-8 border-b transition-colors hover:bg-[#FAFAFC]"
                  style={{ borderColor: 'var(--ny-line)' }}
                >
                  <span className="text-[15px] tabular-nums" style={{ color: 'var(--ny-ink-4)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    {/* stretched link: the whole row opens the paper */}
                    <Link
                      href={`/research/${paper.id}`}
                      className="text-xl sm:text-2xl leading-tight font-semibold after:absolute after:inset-0"
                      style={{ letterSpacing: '-0.015em', color: 'var(--ny-ink)' }}
                    >
                      {paper.title}
                    </Link>
                    <div className="text-[15px] mt-1.5" style={{ color: 'var(--ny-ink-3)' }}>
                      Working paper{paper.show_download !== false && ' · PDF'}
                    </div>
                  </div>
                  <div className="relative z-10 col-start-2 sm:col-start-auto flex items-center gap-2.5">
                    {paper.show_download !== false && (
                      <a
                        href={pdf.href}
                        {...(pdf.isFile ? { download: true } : {})}
                        className="rounded-full border px-3.5 py-2 text-sm whitespace-nowrap transition-colors hover:border-[var(--ny-ink)]"
                        style={{ borderColor: 'var(--ny-line-strong)', color: 'var(--ny-ink)', background: '#fff' }}
                      >
                        ↓ PDF
                      </a>
                    )}
                    <span className="text-[17px] whitespace-nowrap" style={{ color: 'var(--ny-tide)' }}>Read ›</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="ny-body mt-16" style={{ color: 'var(--ny-ink-3)' }}>
            Papers will appear here once published.
          </p>
        )}
      </div>
    </div>
  )
}
