import type { Metadata, Viewport } from 'next'
import { Archivo } from 'next/font/google'
import './globals.css'
import { VENUE } from '@/content/venue'

/**
 * One grotesque for the whole site.
 *
 * The venue sets its own materials — the seating chart, the wordmark's "NEW
 * YORK" — in caps grotesque, so this is the brand's voice rather than an
 * imported idea of luxury. It also avoids the free-serif-plus-Futura pairing
 * that every template reaches for.
 */
const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
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
    <html lang="en" className={archivo.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
