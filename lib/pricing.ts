/**
 * What a table costs, line by line, and when each line falls due.
 *
 * The venue takes the table and its administration fee online, and settles the
 * service charge and the tax at the door. The arithmetic is unchanged by that
 * split: the tax still falls on the table and the fee, never on the service
 * charge, which is why this cannot be a single percentage.
 *
 * Everything is computed in cents and each line is rounded before the totals
 * are summed, so the figures a guest reads always add up to the figure paid.
 */
export const SERVICE_CHARGE_RATE = 0.2
export const ADMIN_FEE_RATE = 0.05
export const SALES_TAX_RATE = 0.08875

export interface PriceLine {
  label: string
  note?: string
  amount: number
}

export interface Breakdown {
  /** Taken by the payment page: the table and its fee. */
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
  const adminFee = Math.round(base * ADMIN_FEE_RATE)
  const serviceCharge = Math.round(base * SERVICE_CHARGE_RATE)
  // Sales tax falls on the table and the administration fee, never on the
  // service charge — so the split does not change what it is charged on.
  const salesTax = Math.round((base + adminFee) * SALES_TAX_RATE)

  return {
    payNow: money(base + adminFee),
    atVenue: money(serviceCharge + salesTax),
    total: money(base + adminFee + serviceCharge + salesTax),
    now: [
      { label: 'Minimum spend', amount: money(base) },
      { label: 'Administration fee', note: pct(ADMIN_FEE_RATE), amount: money(adminFee) },
    ],
    later: [
      { label: 'Service charge', note: pct(SERVICE_CHARGE_RATE), amount: money(serviceCharge) },
      { label: 'Sales tax', note: pct(SALES_TAX_RATE), amount: money(salesTax) },
    ],
  }
}
