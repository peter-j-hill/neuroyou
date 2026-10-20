/**
 * A "?next=" value is only followed if it is a path on this site. Anything else (another
 * domain, "//evil.com", a scheme) is ignored, so a crafted sign-in link cannot send people away.
 */
export function safeNext(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return null
  return value
}
