// Where a research paper's "Download PDF" should point.
//
// - If the paper has an uploaded PDF (`content.pdf_asset` holding a full http(s)
//   URL), link straight to that file.
// - Otherwise fall back to the paper's own print view (`?print=1` opens the browser
//   print dialog, where "Save as PDF" gives a clean document via the print CSS).
//
// `pdf_asset` values that are not full URLs (peterjonathanhill.com stores a bare
// file name in a private bucket) are ignored here, so they never become broken links.
export function paperPdf(id: string, pdfAsset: string | null | undefined): { href: string; isFile: boolean } {
  if (pdfAsset && /^https?:\/\//i.test(pdfAsset)) return { href: pdfAsset, isFile: true }
  return { href: `/research/${id}?print=1`, isFile: false }
}
