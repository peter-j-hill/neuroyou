import { signedEmbedUrlFromInput } from '@/lib/protocols/bunny'

// The video on a free exercise page. The video lives in the Bunny Stream library; the page signs its own
// embed link on every load, so whatever token an editor pasted from Bunny is not needed.
export default function ExerciseVideo({ videoUrl, title }: { videoUrl: string; title: string }) {
  const src = signedEmbedUrlFromInput(videoUrl)
  if (!src) return null
  return (
    <div className="relative w-full overflow-hidden rounded-[18px]" style={{ paddingTop: '56.25%', background: 'var(--ny-night)' }}>
      <iframe
        src={src}
        title={title}
        className="absolute inset-0 h-full w-full border-0"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </div>
  )
}
