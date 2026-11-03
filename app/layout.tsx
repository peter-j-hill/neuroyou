import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import SiteChrome from '@/components/SiteChrome'

// Fonts are files in the project (app/fonts, SIL Open Font License) rather than fetched from Google at
// build time: Vercel's build sometimes failed to download them. Variable fonts, latin subset, so one file
// each covers every weight the site uses (Inter 300-700, Montserrat 300-700).
const inter = localFont({ src: './fonts/Inter-latin-variable.woff2', variable: '--font-inter', weight: '100 900', display: 'swap' })
const montserrat = localFont({ src: './fonts/Montserrat-latin-variable.woff2', variable: '--font-montserrat', weight: '100 900', display: 'swap' })

export const metadata: Metadata = {
  title: 'NeuroYou — Independent Consciousness Laboratory',
  description:
    'Modify your perceptual architecture. Consciousness research, exercises, and the Neutralize course — neuroscience-grounded, zero mysticism.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.neuroyou.online'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}
