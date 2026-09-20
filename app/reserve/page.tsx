import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { ReserveFlow } from '@/components/reserve/ReserveFlow'
import { getEvents } from '@/lib/fourvenues/events'
import { VENUE } from '@/content/venue'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Table reservations',
  description:
    'Reserve a table at 1 OAK New York — main floor, booth side, mezzanine and The Fireplace.',
}

export const dynamic = 'force-dynamic'

export default async function ReservePage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>
}) {
  const { event: eventSlug } = await searchParams

  let events: Awaited<ReturnType<typeof getEvents>> = []
  let failed = false
  try {
    events = await getEvents({ limit: 24 })
  } catch {
    failed = true
  }

  return (
    <>
      <SiteHeader />

      <main className="pt-28 sm:pt-36">
        <header className="mx-auto mb-12 max-w-7xl px-4 sm:mb-16 sm:px-8">
          <p className="label label-gold">Reservations</p>
          <h1 className="heading heading-lg mt-4 text-bone">Take the room</h1>
          <p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-mute">
            Four steps: the night, the table, your details, done.
          </p>
        </header>

        {failed ? (
          <div className="mx-auto max-w-xl px-4 sm:px-8">
            <p className="material p-6 text-sm leading-relaxed text-mute">
              Our booking system is briefly unreachable. Call{' '}
              <a href={`tel:${VENUE.phone.replace(/[^\d+]/g, '')}`} className="text-gold-lit">
                {VENUE.phone}
              </a>{' '}
              or write to{' '}
              <a href={`mailto:${VENUE.email}`} className="text-gold-lit">
                {VENUE.email}
              </a>{' '}
              and a host will arrange the table.
            </p>
          </div>
        ) : (
          <ReserveFlow events={events} initialEventSlug={eventSlug} />
        )}
      </main>

      <SiteFooter />
    </>
  )
}
