/**
 * What a table costs, line by line, and when each line falls due.
 *
 * The venue takes the table and the processing fee online. Everything else —
 * additional spend, tax, administrative and service fees, gratuity — it
 * settles at the door, in its own words and with the guest's approval, so
 * nothing else is itemised or priced here.
 *
 * Computed in cents and rounded per line, so the figures quoted add up.
 */
export const PROCESSING_FEE_RATE = 0.05

export interface PriceLine {
  label: string
  amount: number
}

export interface Breakdown {
  /** Taken by the payment page: the table and the processing fee. */
  payNow: number
  now: PriceLine[]
}

const cents = (amount: number) => Math.round(amount * 100)
const money = (inCents: number) => inCents / 100

/**
 * What the guests beyond the rate's own headcount add to the table.
 *
 * Derived in one place because four screens quote this figure — the panel,
 * the room list, the summary and the phone's action bar — and three of them
 * used to leave it out, so the same table read as two different prices
 * depending on where you looked.
 */
export function extraGuestsFor(
  rate: { included_persons: number },
  partySize: number,
): number {
  return Math.max(0, partySize - rate.included_persons)
}

export function supplementsFor(
  rate: { included_persons: number; supplement_price?: number },
  partySize: number,
): number {
  return extraGuestsFor(rate, partySize) * (rate.supplement_price ?? 0)
}

/** The breakdown for a rate as a given party will be charged it. */
export function priceFor(
  rate: { price: number; included_persons: number; supplement_price?: number },
  partySize: number,
): Breakdown {
  return priceBreakdown(rate.price, supplementsFor(rate, partySize))
}

export function priceBreakdown(minimumSpend: number, supplements = 0): Breakdown {
  const base = cents(minimumSpend) + cents(supplements)
  const processingFee = Math.round(base * PROCESSING_FEE_RATE)

  return {
    payNow: money(base + processingFee),
    now: [
      { label: 'Minimum spend', amount: money(base) },
      { label: 'Processing fee', amount: money(processingFee) },
    ],
  }
}
