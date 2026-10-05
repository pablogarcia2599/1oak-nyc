'use client'

import { partyTotal } from '@/lib/party'
import type { Selection } from './types'
import { isOnRequest } from '@/lib/floorplan'
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
  const price = rate ? priceBreakdown(rate.price) : undefined

  return (
    <>
      <dl className="space-y-4">
        {[
          ['Night', date ? `${date.weekdayLong} ${date.day} ${date.month}` : '—'],
          ['Party', `${partyTotal(selection.party)} guests`],
          ['Mix', `${selection.party.men} men · ${selection.party.women} women`],
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
          <div className="flex items-baseline justify-between gap-4">
            <span className="label label-gold">Pay now</span>
            <span className="figure text-xl text-gold-lit">
              {formatMoney(price.payNow, currency, { cents: true })}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-faint">
            Additional spend, tax, fees and gratuity are charged by the venue at the
            time of service.
          </p>
        </div>
      )}

      <p className="mt-6 text-xs leading-relaxed text-faint">
        Nothing is charged until you confirm on the secure payment page.
      </p>
    </>
  )
}
