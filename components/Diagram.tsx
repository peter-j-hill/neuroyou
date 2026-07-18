// Placeholder for the interactive diagram system, shared with peterjonathanhill.com's
// content model — referenced from article bodies as <Diagram slug="..." />.
export default function Diagram({ slug, caption }: { slug: string; caption?: string }) {
  return (
    <div className="my-10 border border-[var(--border)] p-10 text-center">
      <p className="label mb-2">Diagram</p>
      <p className="text-sm text-[var(--muted)]">{caption ?? slug}</p>
    </div>
  )
}
