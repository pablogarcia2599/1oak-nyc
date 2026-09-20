/**
 * What a table actually costs, line by line.
 *
 * New York hospitality prices the room, then adds to it: a service charge, an
 * administration fee, and sales tax — and the tax does not fall on the service
 * charge, which is why this cannot be a single percentage.
 *
 * Everything is computed in cents and each line is rounded before the total is
 * summed, so the figures a guest reads always add up to the figure they pay.
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
  base: number
  lines: PriceLine[]
  total: number
}

const cents = (amount: number) => Math.round(amount * 100)
const money = (inCents: number) => inCents / 100

export function priceBreakdown(minimumSpend: number, supplements = 0): Breakdown {
  const base = cents(minimumSpend) + cents(supplements)
  const serviceCharge = Math.round(base * SERVICE_CHARGE_RATE)
  const adminFee = Math.round(base * ADMIN_FEE_RATE)
  // Sales tax falls on the table and the administration fee, never on the
  // service charge.
  const salesTax = Math.round((base + adminFee) * SALES_TAX_RATE)

  return {
    base: money(base),
    lines: [
      { label: 'Minimum spend', amount: money(base) },
      {
        label: 'Service charge',
        note: `${SERVICE_CHARGE_RATE * 100}%`,
        amount: money(serviceCharge),
      },
      {
        label: 'Administration fee',
        note: `${ADMIN_FEE_RATE * 100}%`,
        amount: money(adminFee),
      },
      {
        label: 'Sales tax',
        note: `${SALES_TAX_RATE * 100}% · not on service charge`,
        amount: money(salesTax),
      },
    ],
    total: money(base + serviceCharge + adminFee + salesTax),
  }
}
