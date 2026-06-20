import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'], weight: ['300', '400', '500', '700'] })
const montserrat = Montserrat({ variable: '--font-montserrat', subsets: ['latin'], weight: ['300', '400', '700'] })

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
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
