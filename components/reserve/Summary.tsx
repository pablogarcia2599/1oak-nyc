'use client'

import type { Selection } from './types'
import { isOnRequest } from '@/lib/floorplan'
import { ADDITIONAL_CHARGES } from '@/content/venue'
import type { Breakdown } from '@/lib/pricing'
import { formatMoney, nightDate } from '@/lib/utils'

/** Shared by the desktop rail and the mobile drawer. */
export function SummaryContent({
  selection,
  quote,
  currency,
}: {
  selection: Selection
  quote?: Breakdown
  currency: string
}) {
  const date = selection.event ? nightDate(selection.event) : undefined
  const rate = selection.rate
  const price = quote

  return (
    <>
      <dl className="space-y-4">
        {[
          ['Night', date ? `${date.weekdayLong} ${date.day} ${date.month}` : '—'],
          ['Party', `${selection.partySize} guests`],
          ['Table', selection.table ? `Table ${selection.table.name}` : '—'],
          ['Zone', rate?.name ?? '—'],
        ].map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4">
            <dt className="label">{label}</dt>
            <dd className="text-right text-sm text-bone">{value}</dd>
          </div>
        ))}
      </dl>

      {rate && price && !isOnRequest(rate) && (
        <div className="mt-6 border-t border-hairline pt-5">
          {/* Itemised here too. The total on its own invited the question
              this answers, and the rail is where a guest looks for it. */}
          <dl>
            {price.now.map(line => (
              <div
                key={line.label}
                className="flex items-baseline justify-between gap-4 py-1.5"
              >
                <dt className="text-sm text-mute">{line.label}</dt>
                <dd className="figure shrink-0 text-sm text-bone">
                  {formatMoney(line.amount, currency, { cents: true })}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-hairline-soft pt-4">
            <span className="label label-gold">Pay now</span>
            <span className="figure text-xl text-gold-lit">
              {formatMoney(price.payNow, currency, { cents: true })}
            </span>
          </div>

          {/* The venue's own statement, not a paraphrase of it: the one that
              used to live here had already fallen behind it. */}
          <p className="mt-3 text-xs leading-relaxed text-faint">{ADDITIONAL_CHARGES}</p>
        </div>
      )}

      <p className="mt-6 text-xs leading-relaxed text-faint">
        Nothing is charged until you confirm on the secure payment page.
      </p>
    </>
  )
}
