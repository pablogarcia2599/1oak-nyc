import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { Wordmark } from '@/components/Wordmark'
import { Reveal } from '@/components/Reveal'
import { EventCard } from '@/components/EventCard'
import { getEvents } from '@/lib/fourvenues/events'
import { getRoomCatalogue } from '@/lib/fourvenues/bookings'
import { isOnRequest } from '@/lib/floorplan'
import { FAQ, VENUE } from '@/content/venue'

export const revalidate = 60

/**
 * Section chrome: an index mark in the margin and the content beside it.
 * Deliberately not the centred eyebrow-headline-rule stack — that rhythm,
 * repeated down a page, is what makes a site read as generated.
 */
function Section({
  id,
  index,
  title,
  children,
}: {
  id?: string
  index: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-hairline-soft">
      <div className="mx-auto grid max-w-7xl gutter gap-8 py-16 sm:py-24 lg:grid-cols-[9rem_1fr] lg:gap-16">
        <p className="label lg:sticky lg:top-28 lg:self-start">
          {index} — {title}
        </p>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  )
}

export default async function HomePage() {
  let events: Awaited<ReturnType<typeof getEvents>> = []
  let eventsError = false
  try {
    events = (await getEvents({ limit: 8 })).slice(0, 8)
  } catch {
    eventsError = true
  }

  // Only for the "tables from" line on each night: the cheapest rate the
  // venue will actually sell online.
  let rooms: Awaited<ReturnType<typeof getRoomCatalogue>> = []
  if (events[0]) {
    try {
      rooms = await getRoomCatalogue(events[0]._id)
    } catch {
      rooms = []
    }
  }

  const fromPrice = rooms.find(room => !isOnRequest(room.rate))?.rate.price

  return (
    <>
      <SiteHeader />

      <main>
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="flex min-h-svh flex-col items-center gutter justify-center pb-16 pt-28">
          {/* The address is the mark, so it is the headline too. */}
          <Reveal>
            <h1>
              <Wordmark />
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="label mt-8 sm:mt-10">
              {VENUE.neighborhood} · {VENUE.city}
            </p>
          </Reveal>

          <Reveal delay={300} className="mt-14 w-full max-w-xs sm:mt-16">
            <Link href="/reserve" className="btn btn-primary w-full">
              Reserve a table
            </Link>
          </Reveal>
        </section>

        {/* ── Nights ─────────────────────────────────────────────────────── */}
        <Section id="nights" index="01" title="The calendar">
          <h2 className="heading heading-lg text-bone">Upcoming nights</h2>
          <p className="prose-lede mt-5 max-w-lg">
            Tables are released night by night. When a room is gone, it is gone.
          </p>

          <div className="mt-10">
            {eventsError ? (
              <p className="material p-6 text-sm leading-relaxed text-mute">
                The calendar is briefly unavailable. Write to{' '}
                <a href={`mailto:${VENUE.email}`} className="text-gold-lit">
                  {VENUE.email}
                </a>{' '}
                and a host will take it from there.
              </p>
            ) : events.length === 0 ? (
              <p className="material p-6 text-sm text-mute">
                No nights on sale right now. Check back shortly.
              </p>
            ) : (
              <div className="grid-hairline grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event, i) => (
                  <Reveal key={event._id} delay={i * 60}>
                    <EventCard event={event} fromPrice={fromPrice} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* ── Visit ──────────────────────────────────────────────────────── */}
        <Section id="visit" index="02" title="Visit">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="heading heading-lg text-bone">453 West 17th</h2>
              <dl className="mt-8">
                {[
                  ['Address', VENUE.address],
                  ['Hours', VENUE.hours],
                  ['Age', VENUE.agePolicy],
                  ['Dress code', VENUE.dressCode],
                ].map(([term, value]) => (
                  <div
                    key={term}
                    className="grid gap-1 border-b border-hairline-soft py-4 sm:grid-cols-[7rem_1fr] sm:gap-6"
                  >
                    <dt className="label sm:pt-0.5">{term}</dt>
                    <dd className="text-[0.95rem] leading-relaxed text-bone">{value}</dd>
                  </div>
                ))}
              </dl>
              <a
                href={VENUE.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-quiet mt-8 w-full sm:w-auto"
              >
                Open in maps
              </a>
            </div>

            <div>
              <h2 className="heading heading-lg text-bone">Before you come</h2>
              <div className="mt-8">
                {FAQ.map(item => (
                  <details key={item.q} className="group border-b border-hairline-soft py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[0.95rem] text-bone transition-colors hover:text-gold-lit">
                      {item.q}
                      <span className="shrink-0 text-gold transition-transform duration-300 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-mute">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </>
  )
}
