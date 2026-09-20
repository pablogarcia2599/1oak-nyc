import 'server-only'
import { fvFetch, isMockMode } from './client'
import { MOCK_ZONES } from './mock'
import { roomsFrom } from '@/lib/floorplan'
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
 * its `minimum` or over its `capacity`. At 1 OAK every table is min 8 / max 15,
 * so a party of 6 legitimately sees nothing.
 *
 * Passing `quantity: 1` returns the full catalogue with every table marked
 * unavailable — which is how the home page reads the room list.
 */
export async function getAvailability(eventId: string, quantity = 1): Promise<FvZone[]> {
  if (isMockMode()) {
    // Mirror the live API: `quantity` is a MINIMUM party size, so a table is
    // offered only when it seats the party and the party clears its minimum.
    return MOCK_ZONES.map(zone => {
      const spaces = zone.spaces.map(space => ({
        ...space,
        available: space.available && space.capacity >= quantity && space.minimum <= quantity,
      }))
      return { ...zone, spaces, is_full: spaces.every(s => !s.available) }
    })
  }

  const res = await fvFetch<FvResponse<FvZone[]>>('/bookings/availability', {
    params: { event_id: eventId, quantity },
    cache: 'no-store',
  })
  // Full zones are kept: the UI explains *why* nothing is bookable (usually the
  // party size sits under the table minimum) instead of showing an empty room.
  return res.data ?? []
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
