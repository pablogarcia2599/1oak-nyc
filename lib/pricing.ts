/**
 * What a table costs, line by line, and when each line falls due.
 *
 * The venue takes the table and the processing fee online, and settles the
 * administration fee, the service charge and the tax at the door.
 *
 * Tax falls on the table and on both fees, but never on the service charge,
 * which is why this cannot be a single percentage. The processing fee is paid
 * online while its tax is settled at the venue — the two are separate events,
 * and where a charge is taxed does not follow where it is collected.
 *
 * Only the amount actually taken online is quoted as money. The fees and the
 * tax are shown as their rates: what the venue finally bills depends on the
 * night, so a figure to the cent would be a commitment it has not made. That
 * is also why there is no total — it could only be built from those estimates.
 *
 * Everything is computed in cents and rounded per line, so what is quoted as
 * money always adds up.
 */
export const PROCESSING_FEE_RATE = 0.05
export const ADMIN_FEE_RATE = 0.1
export const SERVICE_CHARGE_RATE = 0.2
export const SALES_TAX_RATE = 0.08875

export interface PriceLine {
  label: string
  /** An exact charge, quoted as money. */
  amount?: number
  /** A rate, quoted instead of an amount the venue has not committed to. */
  rate?: string
}

export interface Breakdown {
  /** Taken by the payment page: the table and the processing fee. */
  payNow: number
  now: PriceLine[]
  later: PriceLine[]
}

const cents = (amount: number) => Math.round(amount * 100)
const money = (inCents: number) => inCents / 100
const pct = (rate: number) => `${+(rate * 100).toFixed(5)}%`

export function priceBreakdown(minimumSpend: number, supplements = 0): Breakdown {
  const base = cents(minimumSpend) + cents(supplements)
  const processingFee = Math.round(base * PROCESSING_FEE_RATE)

  return {
    payNow: money(base + processingFee),
    now: [
      { label: 'Minimum spend', amount: money(base) },
      { label: 'Processing fee', rate: pct(PROCESSING_FEE_RATE) },
    ],
    later: [
      { label: 'Administration fee', rate: pct(ADMIN_FEE_RATE) },
      { label: 'Service charge', rate: pct(SERVICE_CHARGE_RATE) },
      { label: 'Sales tax', rate: pct(SALES_TAX_RATE) },
    ],
  }
}
