'use client'

import type { FvTable, FvTableRate, FvZone } from '@/types/fourvenues'
import { FloorMap } from '../FloorMap'
import { depositFor } from '../types'
import { partyBounds, rateColor, ratesFor, roomsFrom } from '@/lib/floorplan'
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
  const bounds = partyBounds(zones)
  const nothingFree = rooms.every(r => r.availableCount === 0)
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

        {zones.length > 1 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {zones.map(z => (
              <button
                key={z._id}
                type="button"
                onClick={() => onZone(z)}
                aria-pressed={z._id === zone?._id}
                className="chip"
              >
                {z.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {nothingFree && (
        <div className="material p-6">
          <p className="text-[0.95rem] leading-relaxed text-bone">
            Nothing is available for a party of <span className="text-gold-lit">{partySize}</span>{' '}
            on this night.
            {partySize < bounds.min && <> Tables here seat a minimum of {bounds.min} guests.</>}
            {partySize > bounds.max && <> The largest table seats {bounds.max} guests.</>}
          </p>
          {(partySize < bounds.min || partySize > bounds.max) && (
            <button
              type="button"
              onClick={() => onPartySize(partySize < bounds.min ? bounds.min : bounds.max)}
              className="btn btn-quiet mt-5 w-full sm:w-auto"
            >
              Set party to {partySize < bounds.min ? bounds.min : bounds.max}
            </button>
          )}
        </div>
      )}

      {zone && (
        <FloorMap
          zone={zone}
          selectedId={table?._id}
          partySize={partySize}
          currency={currency}
          onSelect={selectTable}
        />
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

          <dl className="grid grid-cols-2 gap-px bg-hairline-soft">
            <div className="bg-ink p-5 sm:p-6">
              <dt className="label">Minimum spend</dt>
              <dd className="figure mt-2 text-2xl text-bone">
                {formatMoney(rate.price, currency)}
              </dd>
            </div>
            <div className="bg-ink p-5 sm:p-6">
              <dt className="label">
                {depositFor(rate) >= rate.price ? 'Payable now' : 'Deposit now'}
              </dt>
              <dd className="figure mt-2 text-2xl text-gold-lit">
                {formatMoney(depositFor(rate) || rate.price, currency)}
              </dd>
            </div>
          </dl>

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
                        {formatMoney(room.rate.price, currency)}
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
