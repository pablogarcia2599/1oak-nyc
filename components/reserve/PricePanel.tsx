'use client'

import type { Selection } from './types'
import { BreakdownLines } from './Breakdown'
import { priceBreakdown } from '@/lib/pricing'
import { doorTime, formatMoney, nightDate } from '@/lib/utils'

/**
 * What the table costs, and what is being booked, on the step where the guest
 * commits. The reservation line is deliberately one sentence: the full summary
 * lives in the rail beside it, and repeating eight rows here only buries the
 * figure that matters.
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
  const extraGuests = Math.max(0, partySize - rate.included_persons)
  const supplements = extraGuests * (rate.supplement_price ?? 0)
  const price = priceBreakdown(rate.price, supplements)

  return (
    <div>
      <h2 className="heading heading-md text-bone">Your table</h2>

      <p className="mt-3 text-[0.95rem] leading-relaxed text-mute">
        {date.weekdayLong} {date.day} {date.monthLong} · doors {doorTime(event)} ·{' '}
        {table ? `Table ${table.name}` : zone.name} · {rate.name} · {partySize} guests
      </p>

      <div className="material-lg mt-6 overflow-hidden">
        <div className="grid grid-cols-2 gap-px bg-hairline-soft">
          <div className="bg-ink p-6">
            <span className="label label-gold block">Pay now</span>
            <span className="figure mt-2 block text-2xl text-gold-lit">
              {formatMoney(price.payNow, currency, { cents: true })}
            </span>
          </div>
          <div className="bg-ink p-6">
            <span className="label block">At the venue</span>
            <span className="figure mt-2 block text-2xl text-bone">
              {formatMoney(price.atVenue, currency, { cents: true })}
            </span>
          </div>
        </div>

        <details className="group border-t border-hairline-soft">
          <summary className="label flex cursor-pointer list-none items-center justify-between px-6 py-4">
            View breakdown
            <span className="text-gold transition-transform duration-300 group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="px-6 pb-6">
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

        <p className="border-t border-hairline-soft p-6 text-xs leading-relaxed text-faint">
          {formatMoney(price.payNow, currency, { cents: true })} is taken now — the table
          and its administration fee. The service charge and tax are settled with the venue
          on the night. Fourvenues&rsquo; secure payment page confirms the exact amount
          before any charge.
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
