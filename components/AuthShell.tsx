import type { ReactNode } from 'react'

// Split layout for sign in / sign up and the related account pages: the form on
// the left, a calm image on the right (image hidden on phones). Bleeds under the
// fixed nav, like the other full-height pages.
export default function AuthShell({ children, image = '/redesign-placeholders/grass.jpg' }: { children: ReactNode; image?: string }) {
  return (
    <div className="ny-scope bg-white -mt-14 grid md:grid-cols-2 min-h-screen">
      <div className="flex flex-col justify-center items-center px-8 pt-[136px] pb-24">
        <div className="w-full max-w-[380px]">{children}</div>
      </div>
      <div className="hidden md:block relative min-h-[420px]" style={{ background: '#2C6E7F' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
      </div>
    </div>
  )
}

export function AuthTitle({ title, sub }: { title: string; sub?: ReactNode }) {
  return (
    <>
      <h1 className="m-0" style={{ fontSize: 'clamp(36px, 5vw, 48px)', lineHeight: 1.05, letterSpacing: '-0.035em', color: 'var(--ny-ink)' }}>
        {title}
      </h1>
      {sub && <p className="mt-3 text-[17px]" style={{ color: 'var(--ny-ink-3)' }}>{sub}</p>}
    </>
  )
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null
  return <p className="text-sm m-0" role="alert" style={{ color: 'var(--ny-coral)' }}>{message}</p>
}
