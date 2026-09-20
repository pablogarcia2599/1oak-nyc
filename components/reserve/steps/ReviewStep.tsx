'use client'

import type { GuestDetails, Selection } from '../types'
import { depositFor } from '../types'
import { priceBreakdown } from '@/lib/pricing'
import { doorTime, formatMoney, nightDate } from '@/lib/utils'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-hairline-soft py-4">
      <dt className="label">{label}</dt>
      <dd className="text-[0.95rem] text-bone sm:text-right">{value}</dd>
    </div>
  )
}

export function ReviewStep({
  selection,
  guest,
  currency,
  error,
}: {
  selection: Selection
  guest: GuestDetails
  currency: string
  error?: string
}) {
  const { event, zone, table, rate, partySize } = selection
  if (!event || !zone || !rate) return null

  const date = nightDate(event)
  const deposit = depositFor(rate)
  const inFull = deposit >= rate.price
  const extraGuests = Math.max(0, partySize - rate.included_persons)
  const supplements = extraGuests * (rate.supplement_price ?? 0)
  const price = priceBreakdown(rate.price, supplements)

  return (
    <div>
      <h2 className="heading heading-lg text-bone">Confirm the night</h2>

      <dl className="mt-10 border-t border-hairline-soft">
        <Row label="Night" value={`${date.weekdayLong} ${date.day} ${date.monthLong} ${date.year}`} />
        <Row label="Doors" value={`${doorTime(event)} · ${event.age}+`} />
        <Row label="Table" value={table ? `Table ${table.name} · ${zone.name}` : zone.name} />
        <Row label="Room" value={rate.name} />
        <Row label="Party" value={`${partySize} guests`} />
        <Row label="Name" value={guest.full_name} />
        <Row label="Contact" value={`${guest.email} · ${guest.phone}`} />
        {guest.observations_client && <Row label="Notes" value={guest.observations_client} />}
      </dl>

      <div className="material-lg mt-10 overflow-hidden">
        <div className="flex items-baseline justify-between gap-6 p-6 sm:p-8">
          <span className="label">Total</span>
          <span className="figure text-3xl text-gold-lit">
            {formatMoney(price.total, currency, { cents: true })}
          </span>
        </div>

        <details className="group border-t border-hairline-soft">
          <summary className="label flex cursor-pointer list-none items-center justify-between p-6 sm:px-8">
            View breakdown
            <span className="text-gold transition-transform duration-300 group-open:rotate-45">
              +
            </span>
          </summary>

          <dl className="px-6 pb-6 sm:px-8 sm:pb-8">
            {price.lines.map(line => (
              <div
                key={line.label}
                className="flex items-baseline justify-between gap-6 border-t border-hairline-soft py-3.5 first:border-t-0 first:pt-0"
              >
                <dt className="min-w-0">
                  <span className="text-[0.95rem] text-bone">{line.label}</span>
                  {line.note && <span className="label mt-0.5 block">{line.note}</span>}
                </dt>
                <dd className="figure shrink-0 text-[0.95rem] text-bone">
                  {formatMoney(line.amount, currency, { cents: true })}
                </dd>
              </div>
            ))}

            {extraGuests > 0 && supplements > 0 && (
              <p className="label mt-4">
                Minimum includes {extraGuests} additional{' '}
                {extraGuests === 1 ? 'guest' : 'guests'}
              </p>
            )}

            <div className="mt-2 flex items-baseline justify-between gap-6 border-t border-hairline pt-4">
              <dt className="text-[0.95rem] text-bone">Total</dt>
              <dd className="figure text-lg text-gold-lit">
                {formatMoney(price.total, currency, { cents: true })}
              </dd>
            </div>
          </dl>
        </details>

        <p className="border-t border-hairline-soft p-6 text-xs leading-relaxed text-faint sm:px-8">
          {inFull
            ? 'The table is prepaid. You will be taken to Fourvenues’ secure payment page, which confirms the exact amount before any charge.'
            : `A deposit of ${formatMoney(deposit, currency)} holds the table; the balance settles on the night. Fourvenues’ secure payment page confirms the exact amount before any charge.`}
        </p>
      </div>

      {error && (
        <p className="mt-8 border border-red-400/40 bg-red-500/5 p-5 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}
