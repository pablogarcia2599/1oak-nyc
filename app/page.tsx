import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { Wordmark } from '@/components/Wordmark'
import { Reveal } from '@/components/Reveal'
import { EventCard } from '@/components/EventCard'
import { getEvents } from '@/lib/fourvenues/events'
import { getRoomCatalogue } from '@/lib/fourvenues/bookings'
import { formatMoney } from '@/lib/utils'
import { FAQ, MANIFESTO, ROOM_BLURBS, VENUE } from '@/content/venue'

export const revalidate = 60

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
        <section className="flex min-h-[88svh] flex-col items-center justify-center px-6 pb-20 pt-28 text-center sm:min-h-screen">
          <Reveal>
            <Wordmark className="h-32 sm:h-44 lg:h-52" priority />
          </Reveal>

          <Reveal delay={150}>
            <h1 className="heading heading-xl mt-10 text-bone">New York</h1>
          </Reveal>

          <Reveal delay={250} className="mt-8">
            <span className="rule block" />
          </Reveal>

          <Reveal delay={320}>
            <p className="lede mt-8 max-w-md">{VENUE.tagline}</p>
          </Reveal>

          <Reveal
            delay={420}
            className="mt-12 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center"
          >
            <Link href="/reserve" className="btn btn-primary">
              Reserve a table
            </Link>
            <Link href="#nights" className="btn btn-quiet">
              See the calendar
            </Link>
          </Reveal>
        </section>

        {/* ── Manifesto ──────────────────────────────────────────────────── */}
        <section className="border-y border-hairline-soft px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            {MANIFESTO.map((line, i) => (
              <Reveal key={line} delay={i * 120}>
                <p className="heading heading-md py-2 text-mute">{line}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Nights ─────────────────────────────────────────────────────── */}
        <section id="nights" className="scroll-mt-20 px-4 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <Reveal className="max-w-xl">
              <p className="label label-gold">The calendar</p>
              <h2 className="heading heading-lg mt-5 text-bone">Upcoming nights</h2>
              <p className="mt-6 text-[0.95rem] leading-relaxed text-mute">
                Tables are released night by night. When a room is gone, it is gone.
              </p>
            </Reveal>

            <div className="mt-12 sm:mt-16">
              {eventsError ? (
                <p className="material p-8 text-sm leading-relaxed text-mute">
                  The calendar is briefly unavailable. Write to{' '}
                  <a href={`mailto:${VENUE.email}`} className="text-gold-lit">
                    {VENUE.email}
                  </a>{' '}
                  and a host will take it from there.
                </p>
              ) : events.length === 0 ? (
                <p className="material p-8 text-sm text-mute">
                  No nights on sale right now. Check back shortly.
                </p>
              ) : (
                <div className="grid-hairline grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {events.map((event, i) => (
                    <Reveal key={event._id} delay={i * 70}>
                      <EventCard event={event} fromPrice={fromPrice} />
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── The room ───────────────────────────────────────────────────── */}
        <section id="rooms" className="scroll-mt-20 border-t border-hairline-soft px-4 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <Reveal className="max-w-xl">
              <p className="label label-gold">The room</p>
              <h2 className="heading heading-lg mt-5 text-bone">Where you sit</h2>
              <p className="mt-6 text-[0.95rem] leading-relaxed text-mute">
                Twenty-three tables across one floor. Each carries a minimum spend,
                redeemable in bottle service on the night.
              </p>
            </Reveal>

            {rooms.length > 0 ? (
              <ul className="mt-12 border-t border-hairline-soft sm:mt-16">
                {rooms.map((room, i) => (
                  <Reveal key={room.rate._id} delay={i * 60} as="li">
                    <div className="grid grid-cols-1 gap-3 border-b border-hairline-soft py-7 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-10">
                      <div>
                        <h3 className="heading heading-md text-bone">{room.rate.name}</h3>
                        <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-mute">
                          {ROOM_BLURBS[room.rate.name] ??
                            `${room.tableCount} ${room.tableCount === 1 ? 'table' : 'tables'} on the main floor.`}
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <p className="heading text-xl text-gold-lit">
                          {formatMoney(room.rate.price, currency)}
                        </p>
                        <p className="label mt-2">
                          {room.minGuests}–{room.maxGuests} guests ·{' '}
                          {room.tableCount} {room.tableCount === 1 ? 'table' : 'tables'}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </ul>
            ) : (
              <p className="material mt-12 p-8 text-sm text-mute">
                Open the reservation flow to see every table on sale.
              </p>
            )}

            <Reveal delay={180} className="mt-12 flex justify-center sm:justify-start">
              <Link href="/reserve" className="btn btn-primary w-full sm:w-auto">
                Choose your table
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ── Visit ──────────────────────────────────────────────────────── */}
        <section id="visit" className="scroll-mt-20 border-t border-hairline-soft px-4 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:gap-24">
            <Reveal>
              <p className="label label-gold">Visit</p>
              <h2 className="heading heading-lg mt-5 text-bone">453 West 17th</h2>
              <dl className="mt-10 border-t border-hairline-soft">
                {[
                  ['Address', VENUE.address],
                  ['Hours', VENUE.hours],
                  ['Age', VENUE.agePolicy],
                  ['Dress code', VENUE.dressCode],
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-hairline-soft py-5">
                    <dt className="label">{label}</dt>
                    <dd className="mt-2 text-[0.95rem] leading-relaxed text-bone">{value}</dd>
                  </div>
                ))}
              </dl>
              <a
                href={VENUE.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-quiet mt-10 w-full sm:w-auto"
              >
                Open in maps
              </a>
            </Reveal>

            <Reveal delay={120}>
              <p className="label label-gold">Before you come</p>
              <div className="mt-10 border-t border-hairline-soft">
                {FAQ.map(item => (
                  <details key={item.q} className="group border-b border-hairline-soft py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[0.95rem] text-bone transition-colors hover:text-gold-lit">
                      {item.q}
                      <span className="shrink-0 text-gold transition-transform duration-300 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-mute">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
