'use client'

import type { CSSProperties, ReactNode } from 'react'

export default function PrintButton({
  children,
  className,
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <button type="button" className={className} style={style} onClick={() => window.print()}>
      {children}
    </button>
  )
}
