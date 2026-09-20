'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import type { FvEvent, FvTable, FvTableRate, FvZone } from '@/types/fourvenues'
import { submitBooking } from '@/app/reserve/actions'
import { Stepper } from './Stepper'
import { NightStep } from './steps/NightStep'
import { TableStep } from './steps/TableStep'
import { GuestStep } from './steps/GuestStep'
import { PricePanel } from './PricePanel'
import { SummaryContent } from './Summary'
import { EMPTY_GUEST, STEPS, depositFor, type GuestDetails, type Selection } from './types'
import { partyBounds, ratesFor } from '@/lib/floorplan'
import { priceBreakdown } from '@/lib/pricing'
import { formatMoney } from '@/lib/utils'

export function ReserveFlow({
  events,
  initialEventSlug,
}: {
  events: FvEvent[]
  initialEventSlug?: string
}) {
  // Default to the next night: it makes the party-size limits meaningful
  // straight away, since they are only known once availability has loaded.
  const initialEvent =
    (initialEventSlug ? events.find(e => e.slug === initialEventSlug) : undefined) ?? events[0]

  const [step, setStep] = useState(0)
  const [selection, setSelection] = useState<Selection>({
    event: initialEvent,
    partySize: 2,
  })
  const [bounds, setBounds] = useState<{ min: number; max: number } | null>(null)
  const [guest, setGuest] = useState<GuestDetails>(EMPTY_GUEST)

  const [zones, setZones] = useState<FvZone[]>([])
  const [loadingZones, setLoadingZones] = useState(false)
  const [zonesError, setZonesError] = useState<string>()

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string>()
  const [pending, startTransition] = useTransition()

  const topRef = useRef<HTMLDivElement>(null)
  const stepRef = useRef<HTMLDivElement>(null)
  // Which night we have already snapped the party size for. Kept in state, not
  // a ref: a ref mutated inside a state updater is a side effect, and React
  // double-invokes updaters in development, which swallowed the snap.
  const [snappedEvent, setSnappedEvent] = useState<string>()
  const currency = selection.event?.currency ?? 'USD'

  // ─── Availability ─────────────────────────────────────────────────────────
  // Re-read the floor whenever the night or the party size changes; a stale
  // response from a previous party size must never overwrite a newer one.
  useEffect(() => {
    const event = selection.event
    if (!event) return

    let cancelled = false
    const controller = new AbortController()
    setLoadingZones(true)
    setZonesError(undefined)

    const timer = setTimeout(() => {
      fetch(
        `/api/availability?event_id=${encodeURIComponent(event._id)}&quantity=${selection.partySize}`,
        { signal: controller.signal },
      )
        .then(async res => {
          const json = await res.json()
          if (!res.ok || !json.success) throw new Error(json.error ?? 'Availability failed')
          return json.data as FvZone[]
        })
        .then(data => {
          if (cancelled) return
          setZones(data)

          const next = partyBounds(data)
          setBounds(next)
          // Drop selections that the new availability no longer offers.
          setSelection(prev => {
            // Keep the chosen room when it survives, otherwise open on the first.
            const zone = data.find(z => z._id === prev.zone?._id) ?? data[0]
            const table = (zone?.spaces ?? []).find(
              s => s._id === prev.table?._id && s.available,
            )
            const rate = ratesFor(table, zone).find(r => r._id === prev.rate?._id)

            return { ...prev, zone, table, rate }
          })
        })
        .catch(error => {
          if (cancelled || error.name === 'AbortError') return
          setZonesError(
            'We could not read the floor for this night. Please try again in a moment, or contact the venue directly.',
          )
          setZones([])
        })
        .finally(() => {
          if (!cancelled) setLoadingZones(false)
        })
    }, 250)

    return () => {
      cancelled = true
      controller.abort()
      clearTimeout(timer)
    }
  }, [selection.event, selection.partySize])

  // This venue's tables carry a minimum party size, so the default of 2 would
  // show an empty floor. Snap into range once per night — after that the guest
  // owns the number, including the edges.
  useEffect(() => {
    const event = selection.event
    if (!bounds || !event || snappedEvent === event._id) return
    setSnappedEvent(event._id)
    setSelection(prev =>
      prev.partySize < bounds.min || prev.partySize > bounds.max
        ? { ...prev, partySize: Math.min(Math.max(prev.partySize, bounds.min), bounds.max) }
        : prev,
    )
  }, [bounds, selection.event, snappedEvent])

  // ─── Navigation ───────────────────────────────────────────────────────────
  /**
   * Scrolls to the step's own content rather than the top of the flow, so the
   * page title and stepper do not eat the screen. That is what lets the whole
   * seating plan sit above the fold on a phone.
   */
  const goTo = useCallback((next: number) => {
    setStep(next)
    setSubmitError(undefined)
    requestAnimationFrame(() => {
      const target = stepRef.current ?? topRef.current
      if (!target) return
      const HEADER = 76
      const y = target.getBoundingClientRect().top + window.scrollY - HEADER
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
    })
  }, [])

  function validateGuest(): boolean {
    const errors: Record<string, string> = {}
    if (guest.full_name.trim().length < 2) errors.full_name = 'Please enter the full name.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(guest.email))
      errors.email = 'Please enter a valid email address.'
    if (!/^[+\d][\d\s().-]{6,}$/.test(guest.phone.trim()))
      errors.phone = 'Please enter a reachable phone number.'
    if (!guest.accepts_terms) errors.accepts_terms = 'Required.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const canAdvance =
    step === 0 ? Boolean(selection.event) : Boolean(selection.zone && selection.rate)

  function next() {
    goTo(Math.min(STEPS.length - 1, step + 1))
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
  function confirm() {
    const { event, zone, rate, table, partySize } = selection
    if (!event || !zone || !rate) return
    if (!validateGuest()) return
    setSubmitError(undefined)

    startTransition(async () => {
      const result = await submitBooking({
        event_id: event._id,
        zone_slug: zone.slug,
        normalized_zone_name: zone.normalized_name,
        rate_slug: rate.slug,
        table_id: table?._id,
        normalized_table_name: table?.normalized_name,
        quantity: partySize,
        minimum_spend: rate.price,
        full_name: guest.full_name.trim(),
        email: guest.email.trim(),
        phone: guest.phone.trim(),
        birthdate: guest.birthdate || undefined,
        observations_client: guest.observations_client || undefined,
        marketing_consent: guest.marketing_consent,
        discount_code: guest.discount_code || undefined,
      })

      if (!result.ok) {
        setSubmitError(result.error)
        if (result.fieldErrors) setFieldErrors(result.fieldErrors)
        return
      }

      // Hand off to the Fourvenues-hosted payment page.
      window.location.assign(result.payment_url)
    })
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  const confirmLabel = pending
    ? 'Opening payment…'
    : selection.rate && depositFor(selection.rate) < selection.rate.price
      ? 'Confirm & pay deposit'
      : 'Confirm & pay'

  return (
    <div
      ref={topRef}
      className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-32 sm:px-8 lg:pb-0"
    >
      <Stepper steps={[...STEPS]} current={step} onJump={goTo} />

      <div className="mt-10 grid gap-14 sm:mt-14 lg:grid-cols-[1fr_320px] lg:gap-20">
        <div ref={stepRef} className="min-w-0 scroll-mt-20">
          {step === 0 && (
            <NightStep
              events={events}
              selectedId={selection.event?._id}
              onSelect={event =>
                setSelection(prev => ({
                  ...prev,
                  event,
                  zone: undefined,
                  table: undefined,
                  rate: undefined,
                }))
              }
              partySize={selection.partySize}
              bounds={bounds}
              onPartySize={n => setSelection(prev => ({ ...prev, partySize: n }))}
            />
          )}

          {step === 1 && (
            <TableStep
              zones={zones}
              loading={loadingZones}
              error={zonesError}
              partySize={selection.partySize}
              zone={selection.zone}
              table={selection.table}
              rate={selection.rate}
              currency={currency}
              onZone={(zone: FvZone) =>
                setSelection(prev => ({ ...prev, zone, table: undefined, rate: undefined }))
              }
              onTable={(table?: FvTable) =>
                setSelection(prev => ({ ...prev, table, rate: undefined }))
              }
              onRate={(rate: FvTableRate) => setSelection(prev => ({ ...prev, rate }))}
              onPartySize={(n: number) => setSelection(prev => ({ ...prev, partySize: n }))}
            />
          )}

          {step === 2 && (
            <div className="space-y-14">
              <GuestStep
                guest={guest}
                errors={fieldErrors}
                allowsDiscountCodes={Boolean(selection.zone?.has_discount_codes_enabled)}
                onChange={patch => {
                  setGuest(prev => ({ ...prev, ...patch }))
                  setFieldErrors({})
                }}
              />
              <PricePanel selection={selection} currency={currency} error={submitError} />
            </div>
          )}

          {/* Desktop actions sit in the column; on a phone they live in the
              fixed bar below, within thumb reach. */}
          <div className="mt-14 hidden items-center justify-between gap-4 border-t border-hairline-soft pt-8 lg:flex">
            <button
              type="button"
              onClick={() => goTo(Math.max(0, step - 1))}
              disabled={step === 0 || pending}
              className="btn btn-quiet disabled:invisible"
            >
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} disabled={!canAdvance} className="btn btn-primary">
                Continue
              </button>
            ) : (
              <button type="button" onClick={confirm} disabled={pending} className="btn btn-primary">
                {confirmLabel}
              </button>
            )}
          </div>

          {/* Mobile summary: in flow, collapsed, so the bar stays one line. */}
          <details className="material-lg mt-12 overflow-hidden lg:hidden">
            <summary className="label flex cursor-pointer list-none items-center justify-between p-5">
              Your reservation
              <span className="text-gold">+</span>
            </summary>
            <div className="border-t border-hairline-soft px-5 pb-6 pt-5">
              <SummaryContent selection={selection} currency={currency} />
            </div>
          </details>
        </div>

        <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
          <div className="material-lg p-6">
            <p className="label label-gold">Your reservation</p>
            <div className="mt-6">
              <SummaryContent selection={selection} currency={currency} />
            </div>
          </div>
        </aside>
      </div>

      {/* Fixed action bar — phones only. */}
      <div
        className="glass fixed inset-x-0 bottom-0 z-40 border-t border-hairline-soft lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => goTo(Math.max(0, step - 1))}
            disabled={step === 0 || pending}
            aria-label="Back"
            className="btn btn-quiet !min-h-12 !w-12 !px-0 disabled:invisible"
          >
            ←
          </button>

          <div className="min-w-0 flex-1">
            <p className="label truncate">
              {selection.rate
                ? `${selection.rate.name} · ${selection.partySize} guests`
                : `${selection.partySize} guests`}
            </p>
            {selection.rate && (
              <p className="truncate text-sm text-gold-lit">
                {formatMoney(
                  depositFor(selection.rate) || selection.rate.price,
                  currency,
                )}{' '}
                <span className="text-faint">due now</span>
              </p>
            )}
          </div>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              disabled={!canAdvance}
              className="btn btn-primary !min-h-12 shrink-0"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={confirm}
              disabled={pending}
              className="btn btn-primary !min-h-12 shrink-0"
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
