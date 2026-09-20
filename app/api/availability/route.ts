import { NextResponse } from 'next/server'
import { getAvailability } from '@/lib/fourvenues/bookings'
import { FourvenuesApiError } from '@/lib/fourvenues/client'

export const dynamic = 'force-dynamic'

/**
 * Table availability proxy. The browser never sees the API key — it asks this
 * route, which calls Fourvenues with the server-side credential.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('event_id')
  const quantity = Number(searchParams.get('quantity') ?? '1')

  if (!eventId) {
    return NextResponse.json({ success: false, error: 'event_id is required' }, { status: 400 })
  }

  try {
    const zones = await getAvailability(eventId, Number.isFinite(quantity) ? quantity : 1)
    return NextResponse.json({ success: true, data: zones })
  } catch (error) {
    const status = error instanceof FourvenuesApiError ? error.status : 502
    console.error('[availability]', error)
    return NextResponse.json(
      { success: false, error: 'Availability is temporarily unavailable.' },
      { status },
    )
  }
}
