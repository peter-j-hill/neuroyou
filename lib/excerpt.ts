// Many stored excerpts were cut to exactly 200 characters mid-word when content
// was first imported into the unified `content` table. Where an excerpt is shown
// in full (article header lede, featured card) that reads as a broken sentence,
// so skip it there. Nothing is edited or deleted; editing the excerpt in the admin
// (any value other than the import signature) makes it appear again.
// Card grids clamp excerpts with an ellipsis and don't need this.
export function displayableExcerpt(excerpt: string | null | undefined): string | null {
  if (!excerpt) return null
  const text = excerpt.trim()
  const looksTruncated = excerpt.length === 200 && !/[.!?"”’)…]$/.test(text)
  return looksTruncated ? null : text
}
