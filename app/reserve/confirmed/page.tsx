import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { Wordmark } from '@/components/Wordmark'
import { VENUE } from '@/content/venue'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Reservation confirmed', robots: { index: false } }

export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; mock?: string }>
}) {
  const { reference, mock } = await searchParams

  return (
    <>
      <SiteHeader />

      <main className="flex min-h-[80svh] items-center gutter justify-center py-28">
        <div className="w-full max-w-lg text-center">
          <Wordmark className="mx-auto h-24 sm:h-28" />

          <p className="label label-gold mt-12">Confirmed</p>
          <h1 className="heading heading-lg mt-4 text-bone">The table is yours</h1>

          <span className="rule mx-auto mt-8 block" />

          <p className="mt-8 text-[0.95rem] leading-relaxed text-mute">
            Your confirmation and QR are on the way by email. Present it at the door with photo ID —
            the name must match the reservation.
          </p>

          {reference && (
            <div className="material mt-10 inline-block px-6 py-4">
              <p className="label">Reference</p>
              <p className="heading mt-2 text-xl tracking-wide text-gold-lit">{reference}</p>
            </div>
          )}

          {mock === '1' && (
            <p className="label mt-6">Demo mode — no payment was taken</p>
          )}

          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={VENUE.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              Directions
            </a>
            <Link href="/" className="btn btn-quiet">
              Back to the house
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  )
}
