import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { ReserveFlow } from '@/components/reserve/ReserveFlow'
import { getEvents } from '@/lib/fourvenues/events'
import { VENUE } from '@/content/venue'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Table reservations',
  description:
    `Reserve a table at ${VENUE.name}, ${VENUE.city}.`,
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

  // A link naming a night that is no longer on sale is a dead link, and says
  // so. The venue renames and replaces events in FV Pro and Fourvenues
  // rebuilds the slug from the name, so a stale link is common — and serving
  // it whatever night took that one's place would put a guest in front of a
  // different event than the one they were sent to, at a different price.
  // Only when the calendar was actually read: a failed fetch is not a 404.
  if (!failed && eventSlug && !events.some(event => event.slug === eventSlug)) {
    notFound()
  }

  return (
    <>
      <SiteHeader />

      <main className="pt-28 sm:pt-36">
        {/* No page title and no explainer: a room like this does not narrate
            its own booking form. The heading of each step carries the page. */}
        <h1 className="sr-only">Table reservations</h1>

        {failed ? (
          <div className="gutter mx-auto max-w-xl">
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
