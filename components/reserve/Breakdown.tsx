'use client'

import type { Breakdown } from '@/lib/pricing'
import { ADDITIONAL_CHARGES } from '@/content/venue'
import { formatMoney } from '@/lib/utils'

/**
 * What the payment page will take, itemised, and the venue's own statement of
 * what it settles afterwards. The second half carries no figures and no rates:
 * the venue bills it at the time of service, so pricing it here would commit
 * it to something it has not agreed.
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
    <div>
      <dl>
        {price.now.map(line => (
          <div key={line.label} className="flex items-baseline justify-between gap-6 py-2">
            <dt className="text-[0.95rem] text-mute">{line.label}</dt>
            <dd className="figure shrink-0 text-[0.95rem] text-bone">
              {formatMoney(line.amount, currency, { cents: true })}
            </dd>
          </div>
        ))}

        <div className="mt-2 flex items-baseline justify-between gap-6 border-t border-hairline-soft pt-3">
          <dt className="label label-gold">Pay now</dt>
          <dd className="figure shrink-0 text-[0.95rem] text-gold-lit">
            {formatMoney(price.payNow, currency, { cents: true })}
          </dd>
        </div>
      </dl>

      <p className="mt-5 border-t border-hairline-soft pt-4 text-xs leading-relaxed text-faint">
        {ADDITIONAL_CHARGES}
      </p>

      {note && <p className="label pt-3">{note}</p>}
    </div>
  )
}
