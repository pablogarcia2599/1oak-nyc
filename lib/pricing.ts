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
 * Everything is computed in cents and each line is rounded before the totals
 * are summed, so the figures a guest reads always add up to the figure paid.
 */
export const PROCESSING_FEE_RATE = 0.05
export const ADMIN_FEE_RATE = 0.1
export const SERVICE_CHARGE_RATE = 0.2
export const SALES_TAX_RATE = 0.08875

export interface PriceLine {
  label: string
  note?: string
  amount: number
}

export interface Breakdown {
  /** Taken by the payment page: the table and the processing fee. */
  payNow: number
  /** Settled with the venue on the night. */
  atVenue: number
  total: number
  now: PriceLine[]
  later: PriceLine[]
}

const cents = (amount: number) => Math.round(amount * 100)
const money = (inCents: number) => inCents / 100
const pct = (rate: number) => `${+(rate * 100).toFixed(5)}%`

export function priceBreakdown(minimumSpend: number, supplements = 0): Breakdown {
  const base = cents(minimumSpend) + cents(supplements)
  const processingFee = Math.round(base * PROCESSING_FEE_RATE)
  const adminFee = Math.round(base * ADMIN_FEE_RATE)
  const serviceCharge = Math.round(base * SERVICE_CHARGE_RATE)
  const salesTax = Math.round((base + processingFee + adminFee) * SALES_TAX_RATE)

  return {
    payNow: money(base + processingFee),
    atVenue: money(adminFee + serviceCharge + salesTax),
    total: money(base + processingFee + adminFee + serviceCharge + salesTax),
    now: [
      { label: 'Minimum spend', amount: money(base) },
      { label: 'Processing fee', note: pct(PROCESSING_FEE_RATE), amount: money(processingFee) },
    ],
    later: [
      { label: 'Administration fee', note: pct(ADMIN_FEE_RATE), amount: money(adminFee) },
      { label: 'Service charge', note: pct(SERVICE_CHARGE_RATE), amount: money(serviceCharge) },
      { label: 'Sales tax', note: pct(SALES_TAX_RATE), amount: money(salesTax) },
    ],
  }
}
