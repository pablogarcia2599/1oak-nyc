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
