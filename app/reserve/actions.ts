'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { createBookingCheckout } from '@/lib/fourvenues/bookings'
import { priceBreakdown } from '@/lib/pricing'
import { FourvenuesApiError } from '@/lib/fourvenues/client'

const schema = z.object({
  event_id: z.string().min(1),
  zone_slug: z.string().min(1),
  normalized_zone_name: z.string().min(1),
  rate_slug: z.string().min(1),
  table_id: z.string().optional(),
  normalized_table_name: z.string().optional(),
  quantity: z.coerce.number().int().min(1).max(40),
  full_name: z.string().trim().min(2, 'Please enter the name the table is under.'),
  email: z.email('Please enter a valid email address.'),
  phone: z
    .string()
    .trim()
    .min(7, 'Please enter a reachable phone number.')
    .regex(/^[+\d][\d\s().-]{6,}$/, 'Please enter a valid phone number.'),
  birthdate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal('')),
  observations_client: z.string().max(500).optional(),
  marketing_consent: z.boolean().default(false),
  discount_code: z.string().trim().max(40).optional(),
  /** The rate's minimum spend, so the server can check what it was shown. */
  minimum_spend: z.coerce.number().min(0).optional(),
})

export type BookingInput = z.input<typeof schema>

export type BookingResult =
  | { ok: true; payment_url: string; payment_id: string; total_amount: number }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

async function siteOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3050'
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

/**
 * Pulls a human-readable reason out of whatever shape the API returned.
 *
 * A validation failure comes back as `{ message, errors: [{ field, error }] }`,
 * and the generic "Validation Error" on its own says nothing — the field list
 * is the part worth showing.
 */
function apiMessage(body: unknown): string | undefined {
  const trim = (value: unknown) =>
    typeof value === 'string' && value.trim() ? value.trim() : undefined

  if (typeof body === 'string') return body.length < 200 ? trim(body) : undefined
  if (!body || typeof body !== 'object') return undefined

  const record = body as Record<string, unknown>

  if (Array.isArray(record.errors)) {
    const details = record.errors
      .map(entry => {
        if (typeof entry === 'string') return trim(entry)
        const item = entry as Record<string, unknown>
        const field = trim(item.field)
        const reason = trim(item.error) ?? trim(item.message)
        if (!reason) return undefined
        return field ? `${field}: ${reason}` : reason
      })
      .filter(Boolean)
    if (details.length > 0) return details.join(' · ').slice(0, 300)
  }

  for (const key of ['message', 'error', 'detail']) {
    const value = trim(record[key])
    if (value && value.length < 200) return value
  }
  return undefined
}

export async function submitBooking(input: BookingInput): Promise<BookingResult> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      fieldErrors[key] ??= issue.message
    }
    return { ok: false, error: 'Please check the highlighted fields.', fieldErrors }
  }

  const v = parsed.data
  const origin = await siteOrigin()

  try {
    const checkout = await createBookingCheckout({
      redirect_url: `${origin}/reserve/confirmed`,
      error_url: `${origin}/reserve/declined`,
      event_id: v.event_id,
      // One zone identifier only: sending the slug and the normalized name
      // together is "a conflict between exclusive peers" and a 400, which is
      // what kept the payment page from ever opening.
      zone_slug: v.zone_slug,
      rate_slug: v.rate_slug,
      // The API documents these as mutually exclusive — sending both is a 400,
      // which is why checkout never reached the payment page. Prefer the id.
      ...(v.table_id
        ? { table_id: v.table_id }
        : v.normalized_table_name
          ? { normalized_table_name: v.normalized_table_name }
          : {}),
      full_payment: false,
      observations_client: v.observations_client || undefined,
      marketing_consent: v.marketing_consent,
      discount_code: v.discount_code || undefined,
      send_resources: true,
      metadata: { source: 'microsite', venue: '1oak-nyc' },
      info: {
        full_name: v.full_name,
        email: v.email,
        // The API's examples are E.164; the field is typed loosely but the
        // spaces and punctuation a guest types are not worth the risk.
        phone: v.phone.replace(/[^\d+]/g, ''),
        ...(v.birthdate ? { birthdate: v.birthdate } : {}),
        quantity: v.quantity,
      },
    })

    if (!checkout?.payment_url) {
      return {
        ok: false,
        error: 'The reservation could not be opened for payment. Please try again.',
      }
    }

    // The site computes the breakdown; Fourvenues computes what is charged. If
    // the venue has not configured the service charge, fee and tax on the rate,
    // the guest reads one figure here and pays another on the payment page.
    // Proceed — that page is the source of truth — but make the gap loud.
    const expected = priceBreakdown(v.minimum_spend ?? 0).total
    if (v.minimum_spend && checkout.total_amount && Math.abs(checkout.total_amount - expected) > 1) {
      console.error(
        '[submitBooking] total mismatch — site showed',
        expected,
        'Fourvenues will charge',
        checkout.total_amount,
        '· configure the charges on the rate in FV Pro',
      )
    }

    return {
      ok: true,
      payment_url: checkout.payment_url,
      payment_id: checkout.payment_id,
      total_amount: checkout.total_amount,
    }
  } catch (error) {
    if (error instanceof FourvenuesApiError) {
      // The body carries the real reason; without it every failure looks the
      // same from the outside and there is nothing to debug from.
      console.error('[submitBooking]', error.status, JSON.stringify(error.body))

      if (error.status === 409) {
        return {
          ok: false,
          error: 'That table was taken while you were booking. Pick another one.',
        }
      }
      const detail = apiMessage(error.body)
      if (detail) return { ok: false, error: detail }
    } else {
      console.error('[submitBooking]', error)
    }

    return {
      ok: false,
      error: 'We could not complete the reservation. Please try again or contact the venue.',
    }
  }
}
