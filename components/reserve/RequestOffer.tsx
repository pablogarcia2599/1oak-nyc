'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Asking for a table at a price of your own.
 *
 * Fourvenues prices a booking from the rate, not from the request, so an
 * offer cannot be checked out — there is no amount field in the payload. It
 * goes to a host on WhatsApp instead, written out, and the host closes it by
 * hand in FV Pro if they take it. Nothing here creates a booking.
 */
export function RequestOffer({
  currency,
  link,
}: {
  currency: string
  /** Builds the wa.me link once there is an amount to put in it. */
  link: (amount: number) => string | undefined
}) {
  const [amount, setAmount] = useState('')

  const value = Number(amount.replace(/[^\d.]/g, ''))
  const valid = Number.isFinite(value) && value > 0
  const href = valid ? link(value) : undefined

  return (
    <div className="border-t border-hairline-soft p-5 sm:p-6">
      <p className="label">Rather make an offer?</p>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-mute">
        Name what you would like to pay for this table and a host will come back to
        you. Nothing is booked or charged by sending it.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-stretch overflow-hidden rounded-sm border border-hairline bg-surface sm:w-48">
          <span className="flex items-center pl-4 text-mute" aria-hidden>
            {currency === 'USD' ? '$' : currency}
          </span>
          <input
            className="field border-0 bg-transparent"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            inputMode="decimal"
            autoComplete="off"
            aria-label="Your offer"
            placeholder="0"
          />
        </div>

        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!href}
          onClick={e => {
            if (!href) e.preventDefault()
          }}
          className={cn(
            'btn w-full sm:w-auto',
            href ? 'btn-quiet' : 'btn-quiet cursor-not-allowed opacity-40',
          )}
        >
          Make a request
        </a>
      </div>
    </div>
  )
}
