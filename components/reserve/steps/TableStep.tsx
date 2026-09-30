'use client'

import type { FvTable, FvTableRate, FvZone } from '@/types/fourvenues'
import { FloorMap } from '../FloorMap'
import { ZoneSwitch } from '../ZoneSwitch'
import { VENUE } from '@/content/venue'
import { BreakdownLines } from '../Breakdown'
import { priceBreakdown } from '@/lib/pricing'
import { isOnRequest, partyBounds, rateColor, ratesFor, roomsFrom, whatsappLink } from '@/lib/floorplan'
import { cn, formatMoney } from '@/lib/utils'

export function TableStep({
  zones,
  loading,
  error,
  partySize,
  zone,
  table,
  rate,
  onZone,
  onTable,
  onRate,
  onPartySize,
  currency,
  nightLabel,
}: {
  zones: FvZone[]
  loading: boolean
  error?: string
  partySize: number
  zone?: FvZone
  table?: FvTable
  rate?: FvTableRate
  onZone: (zone: FvZone) => void
  onTable: (table?: FvTable) => void
  onRate: (rate: FvTableRate) => void
  onPartySize: (n: number) => void
  currency: string
  /** Used to write the request a guest sends about a contact-only table. */
  nightLabel: string
}) {
  const heading = <h2 className="heading heading-lg text-bone">Pick your table</h2>

  if (loading) {
    return (
      <div>
        {heading}
        <div className="material-lg mt-8 h-96 animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div>
        {heading}
        <p className="material mt-8 p-6 text-sm leading-relaxed text-mute">{error}</p>
      </div>
    )
  }

  if (zones.length === 0) {
    return (
      <div>
        {heading}
        <p className="material mt-8 p-6 text-sm text-mute">
          No tables are on sale for this night.
        </p>
      </div>
    )
  }

  const rooms = roomsFrom(zone ? [zone] : zones)
  // Bounds of the room on screen, not of the venue: the two rooms here take
  // different parties, and a limit from the other one would be wrong advice.
  const zoneBounds = partyBounds(zone ? [zone] : zones)
  const nothingFree = rooms.every(r => r.availableCount === 0)
  const elsewhere = zones.find(
    z => z._id !== zone?._id && (z.spaces ?? []).some(space => space.available),
  )
  const selectedRateId = table ? ratesFor(table, zone)[0]?._id : undefined

  const selectTable = (t: FvTable) => {
    onTable(t)
    // Every table here carries exactly one rate; select it rather than asking
    // the guest to confirm a choice they have no say in.
    const [only, ...rest] = ratesFor(t, zone)
    if (only && rest.length === 0) onRate(only)
  }

  const tablesOf = (rateId: string) =>
    (zone?.spaces ?? []).filter(s => !s.hidden && ratesFor(s, zone).some(r => r._id === rateId))

  return (
    <div className="space-y-8">
      <div>
        {heading}

      </div>

      {nothingFree && (
        <div className="material p-6">
          <p className="text-[0.95rem] leading-relaxed text-bone">
            {zone ? `${zone.name} has nothing for a party of ` : 'Nothing is available for a party of '}
            <span className="text-gold-lit">{partySize}</span> on this night.
            {zone && partySize < zoneBounds.min && (
              <> Tables there take a minimum of {zoneBounds.min} guests.</>
            )}
            {zone && partySize > zoneBounds.max && (
              <> The largest table there seats {zoneBounds.max} guests.</>
            )}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {/* A room that does have space is the most useful thing to offer,
                ahead of changing the party size. */}
            {elsewhere && (
              <button
                type="button"
                onClick={() => onZone(elsewhere)}
                className="btn btn-primary w-full sm:w-auto"
              >
                Try {elsewhere.name}
              </button>
            )}
            {(partySize < zoneBounds.min || partySize > zoneBounds.max) && (
              <button
                type="button"
                onClick={() =>
                  onPartySize(partySize < zoneBounds.min ? zoneBounds.min : zoneBounds.max)
                }
                className="btn btn-quiet w-full sm:w-auto"
              >
                Set party to {partySize < zoneBounds.min ? zoneBounds.min : zoneBounds.max}
              </button>
            )}
          </div>
        </div>
      )}

      {zone && (
        <div className="flex flex-col items-center gap-5">
          {/* Directly above the plan, because it changes the plan. */}
          <ZoneSwitch zones={zones} selectedId={zone._id} onSelect={onZone} />
          <FloorMap
            zone={zone}
            selectedId={table?._id}
            partySize={partySize}
            currency={currency}
            onSelect={selectTable}
          />
        </div>
      )}

      {/* What you just tapped, spelled out. */}
      {table && rate && (
        <div
          className="material-lg overflow-hidden"
          style={{ animation: 'rise 320ms var(--ease-soft) both' }}
        >
          <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
            <div className="min-w-0">
              <p className="label">Selected</p>
              <p className="heading heading-md mt-2 truncate text-bone">
                Table {table.name} · {rate.name}
              </p>
              <p className="label mt-2">
                {table.minimum}–{table.capacity} guests · {rate.included_persons} included
              </p>
            </div>
            <button type="button" onClick={() => onTable(undefined)} className="btn btn-plain shrink-0">
              Clear
            </button>
          </div>

          {isOnRequest(rate) ? (
            <div className="border-t border-hairline-soft p-5 sm:p-6">
              <p className="text-[0.95rem] leading-relaxed text-mute">
                {rate.name} is arranged with a host rather than booked online.
              </p>
              {(() => {
                const link = whatsappLink(
                  rate,
                  `Hi ${VENUE.name} — I would like to request ${rate.name}, table ${table.name}, for ${nightLabel}, ${partySize} guests.`,
                )
                return link ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary mt-5 w-full sm:w-auto"
                  >
                    Request on WhatsApp
                  </a>
                ) : (
                  <a href={`mailto:${VENUE.email}`} className="btn btn-primary mt-5 w-full sm:w-auto">
                    Request by email
                  </a>
                )
              })()}
            </div>
          ) : (
            (() => {
              const extraGuests = Math.max(0, partySize - rate.included_persons)
              const supplements = extraGuests * (rate.supplement_price ?? 0)
              const price = priceBreakdown(rate.price, supplements)

              return (
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-ink p-5 sm:p-6">
                    <span>
                      <span className="label label-gold block">Pay now</span>
                      <span className="figure mt-2 block text-2xl text-gold-lit">
                        {formatMoney(price.payNow, currency, { cents: true })}
                      </span>
                    </span>
                    <span className="text-gold transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>

                  <div className="border-t border-hairline-soft p-5 sm:p-6">
                    <BreakdownLines
                      price={price}
                      currency={currency}
                      note={
                        extraGuests > 0 && supplements > 0
                          ? `Minimum includes ${extraGuests} additional ${extraGuests === 1 ? 'guest' : 'guests'}`
                          : undefined
                      }
                    />
                  </div>
                </details>
              )
            })()
          )}

          {rate.content && (
            <p className="border-t border-hairline-soft p-5 text-[0.95rem] leading-relaxed text-mute sm:p-6">
              {rate.content}
            </p>
          )}
        </div>
      )}

      {/* The venue models each part of the room as a rate, so this is the room
          list — and the full-size way to choose when the plan's dots are small. */}
      {zone && (
        <div>
          <p className="label">The rooms</p>
          <ul className="mt-4 space-y-2">
            {rooms.map(room => {
              const open = room.rate._id === selectedRateId
              const free = room.availableCount > 0
              const firstFree = tablesOf(room.rate._id).find(s => s.available)
              return (
                <li
                  key={room.rate._id}
                  className={cn('material overflow-hidden', !free && 'opacity-45')}
                >
                  <button
                    type="button"
                    disabled={!firstFree}
                    onClick={() => firstFree && selectTable(firstFree)}
                    className="flex w-full items-center gap-3 p-4 text-left disabled:cursor-not-allowed"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: rateColor(room.rate, 1) ?? '#b08749' }}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.95rem] text-bone">
                        {room.rate.name}
                      </span>
                      <span className="label mt-1 block">
                        {free
                          ? `${room.availableCount} of ${room.tableCount} free`
                          : 'Fully booked'}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[0.95rem] tabular-nums text-gold-lit">
                        {isOnRequest(room.rate)
                          ? 'On request'
                          : formatMoney(room.rate.price, currency)}
                      </span>
                      <span className="label mt-1 block">
                        {room.minGuests}–{room.maxGuests} guests
                      </span>
                    </span>
                  </button>

                  {open && (
                    <div className="border-t border-hairline-soft p-4">
                      <p className="label">Choose the table</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tablesOf(room.rate._id).map(t => (
                          <button
                            key={t._id}
                            type="button"
                            disabled={!t.available || t.blocked}
                            onClick={() => selectTable(t)}
                            aria-pressed={t._id === table?._id}
                            className="chip"
                          >
                            T{t.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-faint">
            Prices are the table minimum spend, redeemable in bottle service on the night.
          </p>
        </div>
      )}
    </div>
  )
}
