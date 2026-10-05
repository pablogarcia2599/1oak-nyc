'use client'

import { partyTotal } from '@/lib/party'
import type { Selection } from './types'
import { BreakdownLines } from './Breakdown'
import type { Breakdown } from '@/lib/pricing'
import { ADDITIONAL_CHARGES } from '@/content/venue'
import { doorTime, formatMoney, nightDate } from '@/lib/utils'

/**
 * What the table costs, and what is being booked, on the step where the guest
 * commits. The reservation line is deliberately one sentence: the full summary
 * lives in the rail beside it, and repeating eight rows here only buries the
 * figure that matters.
 */
export function PricePanel({
  selection,
  quote,
  currency,
  error,
}: {
  selection: Selection
  /** What the venue will ask, read from the API for this party size. */
  quote?: Breakdown
  currency: string
  error?: string
}) {
  const { event, zone, table, rate } = selection
  const partySize = partyTotal(selection.party)
  if (!event || !zone || !rate || !quote) return null

  const price = quote

  const date = nightDate(event)


  return (
    <div>
      <h2 className="heading heading-md text-bone">Your table</h2>

      <p className="mt-3 text-[0.95rem] leading-relaxed text-mute">
        {date.weekdayLong} {date.day} {date.monthLong} · doors {doorTime(event)} ·{' '}
        {table ? `Table ${table.name}` : zone.name} · {rate.name} · {partySize} guests
      </p>

      <div className="material-lg mt-6 overflow-hidden">
        <div className="flex items-baseline justify-between gap-6 p-6">
          <span className="label label-gold">Pay now</span>
          <span className="figure text-3xl text-gold-lit">
            {formatMoney(price.payNow, currency, { cents: true })}
          </span>
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
            />
          </div>
        </details>

        <p className="border-t border-hairline-soft p-6 text-xs leading-relaxed text-faint">
          {formatMoney(price.payNow, currency, { cents: true })} is taken now — the table
          and the processing fee. {ADDITIONAL_CHARGES} Fourvenues&rsquo; secure payment page
          confirms the exact amount before any charge.
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
