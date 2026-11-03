import { createHash } from 'node:crypto'

// Lesson videos live in a Bunny Stream library. The library has embed-view token authentication
// switched on, so a video only plays from a link signed by this server, after the access check on
// the lesson page. Server code only: the token key must never reach the browser.

const EMBED_BASE = 'https://player.mediadelivery.net/embed'

// Bunny video ids are GUIDs. Anything else stored in a lesson is not a Bunny video.
const VIDEO_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const isBunnyVideoId = (ref: string | null | undefined): ref is string => !!ref && VIDEO_ID.test(ref)

export const bunnyConfigured = () => !!(process.env.BUNNY_STREAM_LIBRARY_ID && process.env.BUNNY_STREAM_TOKEN_KEY)

/**
 * A signed embed link: token = SHA-256 hex of (token key + video id + expiry), expiry in Unix seconds.
 * The link stops working after `ttlSeconds`; the lesson page signs a fresh one on every load.
 * Returns null when the library is not configured or the reference is not a Bunny video id.
 */
export function signedEmbedUrl(videoId: string, ttlSeconds = 4 * 60 * 60): string | null {
  const library = process.env.BUNNY_STREAM_LIBRARY_ID
  const key = process.env.BUNNY_STREAM_TOKEN_KEY
  if (!library || !key || !isBunnyVideoId(videoId)) return null

  const expires = Math.floor(Date.now() / 1000) + ttlSeconds
  const token = createHash('sha256').update(`${key}${videoId}${expires}`).digest('hex')
  return `${EMBED_BASE}/${encodeURIComponent(library)}/${videoId}?token=${token}&expires=${expires}`
}
