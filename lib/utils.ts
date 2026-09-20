import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function eventDateParts(isoDate: string, timezone = 'America/New_York') {
  const d = new Date(isoDate)
  const fmt = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-US', { timeZone: timezone, ...options }).format(d)
  return {
    weekday: fmt({ weekday: 'short' }).toUpperCase(),
    weekdayLong: fmt({ weekday: 'long' }),
    day: fmt({ day: '2-digit' }),
    month: fmt({ month: 'short' }).toUpperCase(),
    monthLong: fmt({ month: 'long' }),
    year: fmt({ year: 'numeric' }),
    time: fmt({ hour: 'numeric', minute: '2-digit', hour12: true }),
  }
}

/**
 * The date a night is *called*, which is not the date it starts.
 *
 * 1 OAK's Saturdays open at midnight, so `start_date` lands on the Sunday.
 * Fourvenues carries the evening's own date in `display_date` — that is the
 * one the venue, the flyer and the guest all mean by "Saturday".
 */
export function nightDate(event: {
  display_date?: string
  start_date: string
  location?: { timezone?: string }
}) {
  return eventDateParts(event.display_date || event.start_date, event.location?.timezone)
}

/** The door time, which does come from `start_date`. */
export function doorTime(event: { start_date: string; location?: { timezone?: string } }) {
  return eventDateParts(event.start_date, event.location?.timezone).time
}
