import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MdxContent } from '@/lib/mdx'
import ArticleLayout from '@/components/ArticleLayout'
import PrintButton from '@/components/PrintButton'
import PrintOnLoad from '@/components/PrintOnLoad'
import { paperPdf } from '@/lib/paperPdf'

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

  const pdf = paperPdf(paper.id, paper.pdf_asset)
  const downloadBtn = { fontSize: 15, padding: '10px 18px' }

  const media = (
    <div
      className="flex flex-wrap gap-3 items-center justify-between rounded-[14px] px-5 py-[18px]"
      style={{ background: 'var(--ny-mist)' }}
    >
      <div>
        <div className="text-[15px] font-semibold">Download for print</div>
        <div className="text-[13px] mt-0.5" style={{ color: 'var(--ny-ink-3)' }}>
          {pdf.isFile ? 'PDF · A4 / Letter' : 'Opens your print dialog. Choose “Save as PDF”.'}
        </div>
      </div>
      <div className="flex gap-2">
        {pdf.isFile ? (
          <a href={pdf.href} download className="ny-btn ny-btn-primary" style={downloadBtn}>↓ Download PDF</a>
        ) : (
          <PrintButton className="ny-btn ny-btn-primary" style={downloadBtn}>↓ Download PDF</PrintButton>
        )}
        <PrintButton className="ny-btn ny-btn-secondary" style={downloadBtn}>Print</PrintButton>
      </div>
    </div>
  )

  return (
    <>
      <PrintOnLoad />
      <ArticleLayout
        backHref="/research"
        backLabel="Research"
        kind="Research paper"
        date={new Date(paper.published_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        title={paper.title}
        excerpt={paper.excerpt}
        heroAsset={paper.hero_asset}
        media={media}
      >
        {paper.body_mdx && <MdxContent source={paper.body_mdx} variant="light" />}
      </ArticleLayout>
    </>
  )
}
