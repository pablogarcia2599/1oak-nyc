'use client'

import type { Breakdown, PriceLine } from '@/lib/pricing'
import { formatMoney } from '@/lib/utils'

/**
 * A charge, with money in the right-hand column when the amount is committed
 * and the rate there when it is not. Nothing is quoted to the cent that the
 * venue has not actually agreed to take.
 */
function Lines({ lines, currency }: { lines: PriceLine[]; currency: string }) {
  return (
    <>
      {lines.map(line => (
        <div key={line.label} className="flex items-baseline justify-between gap-6 py-2">
          <dt className="text-[0.95rem] text-mute">{line.label}</dt>
          <dd
            className={
              line.amount !== undefined
                ? 'figure shrink-0 text-[0.95rem] text-bone'
                : 'figure shrink-0 text-[0.95rem] text-mute'
            }
          >
            {line.amount !== undefined
              ? formatMoney(line.amount, currency, { cents: true })
              : line.rate}
          </dd>
        </div>
      ))}
    </>
  )
}

/**
 * The charges, grouped by when they fall due. What is taken online and what is
 * settled at the door are different commitments, so they are never summed into
 * one column — and the second group carries no total, because its amount is
 * not known until the night.
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
      <p className="mt-3 text-xs leading-relaxed text-faint">
        Applied to your final bill on the night.
      </p>

      {note && <p className="label pt-3">{note}</p>}
    </dl>
  )
}
