'use client'

import type { Selection } from './types'
import { depositFor } from './types'
import { priceBreakdown } from '@/lib/pricing'
import { doorTime, formatMoney, nightDate } from '@/lib/utils'

/**
 * What the table costs, and what is being booked, on the step where the guest
 * commits. The reservation line is deliberately one sentence: the full summary
 * lives in the rail beside it, and repeating eight rows here only buries the
 * figure that matters.
 *
 * Two figures, and the distinction is not cosmetic. The charge is whatever
 * Fourvenues computes from the rate — the site cannot add to it, since a rate
 * carries a single `fee_quantity` and the checkout takes no amounts of its
 * own. The service charge, administration fee and tax are therefore an
 * estimate of the evening until those are configured on the rate itself, and
 * the amount actually being taken has to lead.
 */
export function PricePanel({
  selection,
  currency,
  error,
}: {
  selection: Selection
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
  // What the payment page will actually take, straight from the rate.
  const dueNow = deposit || rate.price

  return (
    <div>
      <h2 className="heading heading-md text-bone">Your table</h2>

      <p className="mt-3 text-[0.95rem] leading-relaxed text-mute">
        {date.weekdayLong} {date.day} {date.monthLong} · doors {doorTime(event)} ·{' '}
        {table ? `Table ${table.name}` : zone.name} · {rate.name} · {partySize} guests
      </p>

      <div className="material-lg mt-6 overflow-hidden">
        <div className="flex items-baseline justify-between gap-6 p-6">
          <span className="label">Due now</span>
          <span className="figure text-3xl text-gold-lit">
            {formatMoney(dueNow, currency)}
          </span>
        </div>

        <details className="group border-t border-hairline-soft">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4">
            <span className="label">Estimated total for the night</span>
            <span className="flex items-center gap-3">
              <span className="figure text-[0.95rem] text-bone">
                {formatMoney(price.total, currency, { cents: true })}
              </span>
              <span className="text-gold transition-transform duration-300 group-open:rotate-45">
                +
              </span>
            </span>
          </summary>

          <dl className="px-6 pb-6">
            {price.lines.map(line => (
              <div key={line.label} className="flex items-baseline justify-between gap-6 py-2.5">
                <dt className="text-[0.95rem] text-mute">
                  {line.label}
                  {line.note && <span className="text-faint"> · {line.note}</span>}
                </dt>
                <dd className="figure shrink-0 text-[0.95rem] text-bone">
                  {formatMoney(line.amount, currency, { cents: true })}
                </dd>
              </div>
            ))}

            {extraGuests > 0 && supplements > 0 && (
              <p className="label pt-2">
                Minimum includes {extraGuests} additional{' '}
                {extraGuests === 1 ? 'guest' : 'guests'}
              </p>
            )}
          </dl>
        </details>

        <p className="border-t border-hairline-soft p-6 text-xs leading-relaxed text-faint">
          {formatMoney(dueNow, currency)} is taken now
          {inFull ? ' as the table in full' : ' as a deposit'}. The service charge,
          administration fee and tax are settled with the venue. Fourvenues&rsquo; secure
          payment page confirms the exact amount before any charge.
        </p>
      </div>

      {error && (
        <p className="mt-6 rounded-sm border border-red-400/40 bg-red-500/5 p-5 text-sm leading-relaxed text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}
