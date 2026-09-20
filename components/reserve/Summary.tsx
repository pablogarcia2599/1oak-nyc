'use client'

import type { Selection } from './types'
import { depositFor } from './types'
import { priceBreakdown } from '@/lib/pricing'
import { formatMoney, nightDate } from '@/lib/utils'

/** Shared by the desktop rail and the mobile drawer. */
export function SummaryContent({
  selection,
  currency,
}: {
  selection: Selection
  currency: string
}) {
  const date = selection.event ? nightDate(selection.event) : undefined
  const rate = selection.rate
  const deposit = rate ? depositFor(rate) : 0
  const total = rate ? priceBreakdown(rate.price).total : 0

  return (
    <>
      <dl className="space-y-4">
        {[
          ['Night', date ? `${date.weekdayLong} ${date.day} ${date.month}` : '—'],
          ['Party', `${selection.partySize} guests`],
          ['Table', selection.table ? `Table ${selection.table.name}` : '—'],
          ['Room', rate?.name ?? '—'],
        ].map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4">
            <dt className="label">{label}</dt>
            <dd className="text-right text-sm text-bone">{value}</dd>
          </div>
        ))}
      </dl>

      {rate && (
        <div className="mt-6 border-t border-hairline pt-5">
          <div className="flex items-baseline justify-between gap-4">
            <span className="label">Minimum</span>
            <span className="figure text-sm text-mute">
              {formatMoney(rate.price, currency)}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-4">
            <span className="label">Due now</span>
            <span className="figure text-xl text-gold-lit">
              {formatMoney(deposit || rate.price, currency)}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-4">
            <span className="label">Est. total</span>
            <span className="figure text-sm text-mute">
              {formatMoney(total, currency, { cents: true })}
            </span>
          </div>
        </div>
      )}

      <p className="mt-6 text-xs leading-relaxed text-faint">
        Nothing is charged until you confirm on the secure payment page.
      </p>
    </>
  )
}
