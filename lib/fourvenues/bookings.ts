import 'server-only'
import { fvFetch, isMockMode } from './client'
import { MOCK_ZONES } from './mock'
import { roomsFrom, tableSeats } from '@/lib/floorplan'
import type {
  FvBookingCheckoutRequest,
  FvBookingCheckoutResponse,
  FvResponse,
  FvZone,
} from '@/types/fourvenues'

/**
 * Table availability for a night.
 *
 * `quantity` is the party size, and Fourvenues treats it as a MINIMUM as well
 * as a maximum: a table is returned `available: false` when the party is under
 * its `minimum` or over its `capacity`. Here every table is min 8 / max 15,
 * so a party of 6 legitimately sees nothing.
 *
 * Passing `quantity: 1` returns the full catalogue with every table marked
 * unavailable — which is how the home page reads the room list.
 */
/**
 * What `/bookings/availability` leaves out, keyed by rate id.
 *
 * Two things, and `/bookings/zones` is the only place either lives:
 *
 *  - The contact number for the rates the venue handles by hand. Availability
 *    knows a rate is contact-only but not who to contact.
 *  - The minimum spend with nobody added on. `price` on an availability
 *    response is the figure for the `quantity` it was read at — a table that
 *    includes four quotes 10,000 at a party of four and 20,000 at a party of
 *    eight — so it cannot be shown as "the price of this table". This
 *    endpoint takes no quantity and answers with the base.
 */
interface RateExtras {
  whatsapp?: string
  basePrice?: number
}

async function rateExtras(eventId: string): Promise<Map<string, RateExtras>> {
  const extras = new Map<string, RateExtras>()
  try {
    const res = await fvFetch<FvResponse<FvZone[]>>('/bookings/zones', {
      params: { event_id: eventId },
      next: { revalidate: 300 },
    })
    for (const zone of res.data ?? []) {
      for (const table of zone.spaces ?? []) {
        for (const rate of table.rates ?? []) {
          extras.set(rate._id, {
            whatsapp: rate.whatsapp_contact_phone_number,
            basePrice: rate.price,
          })
        }
      }
    }
  } catch (error) {
    // Losing this costs the request button and leaves the quantity-adjusted
    // price in place; it must never cost the floor.
    console.error('[rateExtras]', error)
  }
  return extras
}

export async function getAvailability(eventId: string, quantity = 1): Promise<FvZone[]> {
  if (isMockMode()) {
    // Mirror the live API: `quantity` is a MINIMUM party size, so a table is
    // offered only when it seats the party and the party clears its minimum.
    return MOCK_ZONES.map(zone => {
      const spaces = zone.spaces.map(space => ({
        ...space,
        available:
          space.available &&
          tableSeats(space, zone) >= quantity &&
          space.minimum <= quantity,
      }))
      return { ...zone, spaces, is_full: spaces.every(s => !s.available) }
    })
  }

  const [res, extras] = await Promise.all([
    fvFetch<FvResponse<FvZone[]>>('/bookings/availability', {
      params: { event_id: eventId, quantity },
      cache: 'no-store',
    }),
    rateExtras(eventId),
  ])

  // Full zones are kept: the UI explains *why* nothing is bookable (usually the
  // party size sits under the table minimum) instead of showing an empty room.
  return (res.data ?? []).map(zone => ({
    ...zone,
    spaces: (zone.spaces ?? []).map(table => ({
      ...table,
      rates: (table.rates ?? []).map(rate => {
        const extra = extras.get(rate._id)
        if (!extra) return rate
        return {
          ...rate,
          whatsapp_contact_phone_number:
            extra.whatsapp ?? rate.whatsapp_contact_phone_number,
          base_price: extra.basePrice,
        }
      }),
    })),
  }))
}

/**
 * Creates the booking and returns Fourvenues' hosted payment URL. In mock mode
 * it returns a local confirmation URL so the flow stays walkable end to end.
 */
export async function createBookingCheckout(
  payload: FvBookingCheckoutRequest,
): Promise<FvBookingCheckoutResponse> {
  if (isMockMode()) {
    const reference = `MOCK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    const url = new URL(payload.redirect_url)
    url.searchParams.set('reference', reference)
    url.searchParams.set('mock', '1')
    return {
      payment_id: reference,
      payment_url: url.toString(),
      total_amount: 0,
      booking: { reference, status: 'pending', ...payload.info },
    }
  }

  const res = await fvFetch<FvResponse<FvBookingCheckoutResponse>>('/bookings/checkout', {
    method: 'POST',
    body: payload,
    cache: 'no-store',
  })
  return res.data
}

/**
 * The room list for the front page. `quantity: 1` sits under every table
 * minimum, so the API returns the whole catalogue with nothing marked bookable
 * — exactly what we want for a shop window that must not imply availability.
 */
export async function getRoomCatalogue(eventId: string) {
  const zones = await getAvailability(eventId, 1)
  return roomsFrom(zones)
}
