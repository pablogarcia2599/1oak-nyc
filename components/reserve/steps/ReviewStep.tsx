'use client'

import type { GuestDetails, Selection } from '../types'
import { depositFor } from '../types'
import { doorTime, formatMoney, nightDate } from '@/lib/utils'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-hairline-soft py-4">
      <dt className="label">{label}</dt>
      <dd className="text-[0.95rem] text-bone sm:text-right">{value}</dd>
    </div>
  )
}

export function ReviewStep({
  selection,
  guest,
  currency,
  error,
}: {
  selection: Selection
  guest: GuestDetails
  currency: string
  error?: string
}) {
  const { event, zone, table, rate, partySize } = selection
  if (!event || !zone || !rate) return null

  const date = nightDate(event)
  const deposit = depositFor(rate)
  const extraGuests = Math.max(0, partySize - rate.included_persons)
  const supplements = extraGuests * (rate.supplement_price ?? 0)
  const payNow = deposit || rate.price
  const inFull = deposit >= rate.price

  return (
    <div>
      <h2 className="heading heading-lg text-bone">Confirm the night</h2>

      <dl className="mt-10 border-t border-hairline-soft">
        <Row label="Night" value={`${date.weekdayLong} ${date.day} ${date.monthLong} ${date.year}`} />
        <Row label="Doors" value={`${doorTime(event)} · ${event.age}+`} />
        <Row label="Table" value={table ? `Table ${table.name} · ${zone.name}` : zone.name} />
        <Row label="Room" value={rate.name} />
        <Row label="Party" value={`${partySize} guests`} />
        <Row label="Name" value={guest.full_name} />
        <Row label="Contact" value={`${guest.email} · ${guest.phone}`} />
        {guest.observations_client && <Row label="Notes" value={guest.observations_client} />}
      </dl>

      <div className="material mt-10 p-6 sm:p-8">
        <div className="flex items-baseline justify-between gap-6">
          <span className="label">Minimum spend</span>
          <span className="heading text-2xl text-bone">{formatMoney(rate.price, currency)}</span>
        </div>
        {supplements > 0 && (
          <div className="mt-4 flex items-baseline justify-between gap-6">
            <span className="label">
              {extraGuests} additional {extraGuests === 1 ? 'guest' : 'guests'}
            </span>
            <span className="text-sm text-bone">{formatMoney(supplements, currency)}</span>
          </div>
        )}
        <div className="my-6 h-px bg-hairline" />
        <div className="flex items-baseline justify-between gap-6">
          <span className="label label-gold">{inFull ? 'Payable now in full' : 'Due now'}</span>
          <span className="heading text-3xl text-gold-lit">{formatMoney(payNow, currency)}</span>
        </div>
        <p className="mt-6 text-xs leading-relaxed text-faint">
          {inFull
            ? 'This table is prepaid in full. You will be taken to Fourvenues’ secure payment page, where the exact total, fees and taxes are confirmed before any charge. The amount is your minimum spend and is redeemable at the table.'
            : 'You will be taken to Fourvenues’ secure payment page to complete the deposit. The balance settles at the table on the night. Exact totals, fees and taxes are confirmed there before any charge.'}
        </p>
      </div>

      {error && (
        <p className="mt-8 border border-red-400/40 bg-red-500/5 p-5 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}
