import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'
import { VENUE } from '@/content/venue'

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-jost',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://reservations.1oaknyc.com'),
  title: {
    default: `${VENUE.name} ${VENUE.city} · Table Reservations`,
    template: `%s · ${VENUE.name} ${VENUE.city}`,
  },
  description:
    'Reserve a table at 1 OAK New York. Main floor, booth side, mezzanine and The Fireplace — bottle service and priority entry in Chelsea.',
  openGraph: {
    title: `${VENUE.name} ${VENUE.city}`,
    description: 'One of a Kind. Table reservations and bottle service.',
    type: 'website',
    locale: 'en_US',
  },
  robots: { index: true, follow: true },
  icons: { icon: '/icon.png', apple: '/icon.png' },
}

export const viewport: Viewport = {
  themeColor: '#070809',
  colorScheme: 'dark',
  // The flow uses a fixed action bar, so the page must not be zoom-locked.
  initialScale: 1,
  width: 'device-width',
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jost.variable} ${cormorant.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
