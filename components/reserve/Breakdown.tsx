'use client'

import type { Breakdown } from '@/lib/pricing'
import { formatMoney } from '@/lib/utils'

/** The charge lines, shared by the table card and the confirmation panel. */
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
      {note && <p className="label pt-2">{note}</p>}
    </dl>
  )
}
