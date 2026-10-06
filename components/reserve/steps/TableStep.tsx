'use client'

import type { FvTable, FvTableRate, FvZone } from '@/types/fourvenues'
import { FloorMap } from '../FloorMap'
import { ZoneSwitch } from '../ZoneSwitch'
import { GuestCount } from '../GuestCount'
import { DisclosureMark } from '../DisclosureMark'
import { VENUE } from '@/content/venue'
import { BreakdownLines } from '../Breakdown'
import type { Breakdown } from '@/lib/pricing'
import {
  isOnRequest,
  ratesFor,
  tableSeats,
  whatsappLink,
} from '@/lib/floorplan'
import { cn, formatMoney } from '@/lib/utils'
import { WOMEN_PER_MAN } from '@/lib/party'

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
  acceptsRatio,
  onAcceptsRatio,
  ratioError,
  quote,
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
  onPartySize: (size: number) => void
  /** The door's ratio, acknowledged before the step will let you past. */
  acceptsRatio: boolean
  onAcceptsRatio: (accepted: boolean) => void
  /** Set when the guest tried to continue without acknowledging it. */
  ratioError?: boolean
  /** What the venue will ask, read from the API for this party size. */
  quote?: Breakdown
  currency: string
  /** Used to write the request a guest sends about a contact-only table. */
  nightLabel: string
}) {
  const selectedRate = rate ?? (table ? ratesFor(table, zone)[0] : undefined)

  // The table, once chosen, is the only limit on the party: its own minimum
  // at the bottom and what its rate sells at the top. Nothing above it.
  const partyLimits = table
    ? { min: table.minimum || 1, max: tableSeats(table, zone) }
    : null

  const header = <h2 className="heading heading-lg text-bone">Pick your table</h2>

  if (loading) {
    return (
      <div className="space-y-8">
        {header}
        <div className="material-lg h-96 animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        {header}
        <p className="material p-6 text-sm leading-relaxed text-mute">{error}</p>
      </div>
    )
  }

  if (zones.length === 0) {
    return (
      <div className="space-y-8">
        {header}
        <p className="material p-6 text-sm text-mute">No tables are on sale for this night.</p>
      </div>
    )
  }

  const nothingFree = !(zone?.spaces ?? []).some(s => !s.hidden && s.available && !s.blocked)
  const elsewhere = zones.find(
    z => z._id !== zone?._id && (z.spaces ?? []).some(space => space.available),
  )

  const selectTable = (t: FvTable) => {
    onTable(t)
    // Every table here carries exactly one rate; select it rather than asking
    // the guest to confirm a choice they have no say in.
    const [only, ...rest] = ratesFor(t, zone)
    if (only && rest.length === 0) onRate(only)
  }


  return (
    <div className="space-y-8">
      {header}

      {nothingFree && (
        <div className="material p-6">
          <p className="text-[0.95rem] leading-relaxed text-bone">
            {zone ? `${zone.name} is fully booked for this night.` : 'Nothing is left for this night.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {/* A room that does have space is the most useful thing to offer. */}
            {elsewhere && (
              <button
                type="button"
                onClick={() => onZone(elsewhere)}
                className="btn btn-primary w-full sm:w-auto"
              >
                Try {elsewhere.name}
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
            </div>
            <button type="button" onClick={() => onTable(undefined)} className="btn btn-plain shrink-0">
              Clear
            </button>
          </div>

          {/* The guests are counted here, under the table, because the table
              is what limits them. */}
          <div className="border-t border-hairline-soft p-5 sm:p-6">
            <p className="label">Who is coming</p>
            <div className="mt-5">
              <GuestCount
                value={partySize}
                bounds={partyLimits}
                included={selectedRate?.included_persons}
                onChange={onPartySize}
              />
            </div>

            {/* The door's rule is not ours to apply to a headcount, so it is
                put to the guest instead — and the step will not pass until
                they have taken it. Written from the rule itself, so the
                sentence cannot drift from it. */}
            <label
              data-invalid={ratioError && !acceptsRatio ? true : undefined}
              className={cn(
                'mt-5 flex cursor-pointer items-start gap-4 rounded-sm border p-4 transition-colors duration-300',
                ratioError && !acceptsRatio
                  ? 'border-red-400 bg-red-500/5'
                  : acceptsRatio
                    ? 'border-hairline bg-surface'
                    : 'border-gold/45 bg-surface',
              )}
            >
              <input
                type="checkbox"
                checked={acceptsRatio}
                onChange={e => onAcceptsRatio(e.target.checked)}
                className="check mt-0.5"
              />
              <span className="min-w-0">
                <span className="mt-0 block text-[0.875rem] leading-relaxed text-bone">
                  This event has a 1:{WOMEN_PER_MAN} male-to-female ratio.
                </span>
                {ratioError && !acceptsRatio && (
                  <span className="mt-2 block text-xs text-red-400">
                    Tick this to continue.
                  </span>
                )}
              </span>
            </label>
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
            quote && (
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-ink p-5 sm:p-6">
                    <span>
                      <span className="label label-gold block">Pay now</span>
                      <span className="figure mt-2 block text-2xl text-gold-lit">
                        {formatMoney(quote.payNow, currency, { cents: true })}
                      </span>
                    </span>
                    <DisclosureMark label="Details" />
                  </summary>

                  <div className="border-t border-hairline-soft p-5 sm:p-6">
                    <BreakdownLines
                      price={quote}
                      currency={currency}
                    />
                  </div>
                </details>
              )
          )}

          {rate.content && (
            <p className="border-t border-hairline-soft p-5 text-[0.95rem] leading-relaxed text-mute sm:p-6">
              {rate.content}
            </p>
          )}
        </div>
      )}

      {/* What the figures on the plan mean. */}
      <p className="text-xs leading-relaxed text-faint">
        Prices are the table minimum spend, redeemable in bottle service on the night.
      </p>

    </div>
  )
}
