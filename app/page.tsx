import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { Wordmark } from '@/components/Wordmark'
import { Reveal } from '@/components/Reveal'
import { EventCard } from '@/components/EventCard'
import { getEvents } from '@/lib/fourvenues/events'
import { getRoomCatalogue } from '@/lib/fourvenues/bookings'
import { formatMoney } from '@/lib/utils'
import { FAQ, ROOM_BLURBS, VENUE } from '@/content/venue'

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

  // The room list is the venue's own rate card, so it never drifts from what
  // the reservation flow will actually sell.
  let rooms: Awaited<ReturnType<typeof getRoomCatalogue>> = []
  if (events[0]) {
    try {
      rooms = await getRoomCatalogue(events[0]._id)
    } catch {
      rooms = []
    }
  }

  const fromPrice = rooms[0]?.rate.price
  const currency = events[0]?.currency ?? 'USD'

  return (
    <>
      <SiteHeader />

      <main>
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="flex min-h-svh flex-col items-center gutter justify-center pb-16 pt-28">
          {/* The mark leads. A headline big enough to compete with it would
              only shout over the one asset the brand actually owns. */}
          <Reveal>
            <Wordmark className="h-40 sm:h-52 lg:h-60" priority />
          </Reveal>

          <Reveal delay={160}>
            <h1 className="wordmark-echo mt-8 text-center sm:mt-10">{VENUE.city}</h1>
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

        {/* ── The room ───────────────────────────────────────────────────── */}
        <Section id="rooms" index="02" title="The room">
          <h2 className="heading heading-lg text-bone">Where you sit</h2>
          <p className="prose-lede mt-5 max-w-lg">
            Twenty-three tables across one floor. Each carries a minimum spend,
            redeemable in bottle service on the night.
          </p>

          {rooms.length > 0 ? (
            <ul className="mt-10">
              {rooms.map((room, i) => (
                <Reveal key={room.rate._id} delay={i * 50} as="li">
                  <div className="grid gap-4 border-b border-hairline-soft py-6 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-12">
                    <div>
                      <h3 className="heading heading-md text-bone">{room.rate.name}</h3>
                      <p className="mt-2.5 max-w-xl text-[0.95rem] leading-relaxed text-mute">
                        {ROOM_BLURBS[room.rate.name] ??
                          `${room.tableCount} ${room.tableCount === 1 ? 'table' : 'tables'} on the main floor.`}
                      </p>
                    </div>
                    <div className="flex items-baseline gap-6 sm:flex-col sm:items-end sm:gap-1.5">
                      <p className="figure text-2xl text-gold-lit">
                        {formatMoney(room.rate.price, currency)}
                      </p>
                      <p className="label">
                        {room.minGuests}–{room.maxGuests} guests
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
          ) : (
            <p className="material mt-10 p-6 text-sm text-mute">
              Open the reservation flow to see every table on sale.
            </p>
          )}

          <Link href="/reserve" className="btn btn-primary mt-10 w-full sm:w-auto">
            Choose your table
          </Link>
        </Section>

        {/* ── Visit ──────────────────────────────────────────────────────── */}
        <Section id="visit" index="03" title="Visit">
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
