'use client'

import type { Breakdown, PriceLine } from '@/lib/pricing'
import { formatMoney } from '@/lib/utils'

function Lines({ lines, currency }: { lines: PriceLine[]; currency: string }) {
  return (
    <>
      {lines.map(line => (
        <div key={line.label} className="flex items-baseline justify-between gap-6 py-2">
          <dt className="text-[0.95rem] text-mute">
            {line.label}
            {line.note && <span className="text-faint"> · {line.note}</span>}
          </dt>
          <dd className="figure shrink-0 text-[0.95rem] text-bone">
            {formatMoney(line.amount, currency, { cents: true })}
          </dd>
        </div>
      ))}
    </>
  )
}

/**
 * The charge lines, grouped by when they fall due, shared by the table card
 * and the confirmation step. What is taken online and what is settled at the
 * door are different commitments, so they are never summed into one column.
 */
export function BreakdownLines({
  price,
  currency,
  note,
}: {
  price: Breakdown
  currency: string
  note?: string
}) {
  return (
    <dl>
      <p className="label label-gold">Pay now</p>
      <div className="mt-1">
        <Lines lines={price.now} currency={currency} />
      </div>

      <p className="label mt-5">At the venue</p>
      <div className="mt-1">
        <Lines lines={price.later} currency={currency} />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-6 border-t border-hairline-soft pt-3">
        <dt className="text-[0.95rem] text-mute">Total</dt>
        <dd className="figure shrink-0 text-[0.95rem] text-bone">
          {formatMoney(price.total, currency, { cents: true })}
        </dd>
      </div>

      {note && <p className="label pt-3">{note}</p>}
    </dl>
  )
}
