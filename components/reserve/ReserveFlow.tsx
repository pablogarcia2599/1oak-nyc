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
import { DisclosureMark } from './DisclosureMark'
import { EMPTY_GUEST, STEPS, depositFor, type GuestDetails, type Selection } from './types'
import { catalogueQuantity, isOnRequest, ratesFor, tableSeats } from '@/lib/floorplan'
import { ratioNote, sizeForTable } from '@/lib/party'
import { extraGuestsFor, priceBreakdown } from '@/lib/pricing'
import { cn, formatMoney, nightDate } from '@/lib/utils'

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

  // Arriving from a night on the home page, the first step has already been
  // answered; opening on it would be the tap this flow just lost.
  const [step, setStep] = useState(
    initialEventSlug && events.some(e => e.slug === initialEventSlug) ? 1 : 0,
  )
  const [selection, setSelection] = useState<Selection>({
    event: initialEvent,
    // The party most tables here are sized for, so the floor opens with
    // something on it until a table sets its own.
    partySize: 8,
  })
  // What the venue will ask for this table at this party size. Read from the
  // API rather than worked out here: `supplement_price` does not describe the
  // whole curve — one table steps by 2,000 a head and then by 4,000 for the
  // last — and a price we invent is a price we get wrong.
  const [quotedTotal, setQuotedTotal] = useState<number>()

  // The door's ratio, put to the guest on the table step. Kept here because
  // it gates leaving that step, like the selection itself.
  const [acceptsRatio, setAcceptsRatio] = useState(false)
  const [ratioError, setRatioError] = useState(false)

  // The party size the floor is read at — not the guest's party, which is
  // counted against the table once there is one.
  const [floorQuantity, setFloorQuantity] = useState(1)
  const [guest, setGuest] = useState<GuestDetails>(EMPTY_GUEST)

  const [zones, setZones] = useState<FvZone[]>([])
  const [loadingZones, setLoadingZones] = useState(false)
  const [zonesError, setZonesError] = useState<string>()

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string>()
  const [pending, startTransition] = useTransition()

  const topRef = useRef<HTMLDivElement>(null)
  const stepRef = useRef<HTMLDivElement>(null)
  const currency = selection.event?.currency ?? 'USD'
  const partySize = selection.partySize

  // ─── Availability ─────────────────────────────────────────────────────────
  // Read once per night, not once per guest: the table is chosen first now,
  // and the party is counted against it afterwards. `quantity` still decides
  // which tables the API offers, so the first read uses 1 and then settles on
  // the quantity that shows them all.
  useEffect(() => {
    const event = selection.event
    if (!event) return

    let cancelled = false
    const controller = new AbortController()
    setLoadingZones(true)
    setZonesError(undefined)

    const timer = setTimeout(() => {
      fetch(
        `/api/availability?event_id=${encodeURIComponent(event._id)}&quantity=${floorQuantity}`,
        { signal: controller.signal },
      )
        .then(async res => {
          const json = await res.json()
          if (!res.ok || !json.success) throw new Error(json.error ?? 'Availability failed')
          return json.data as FvZone[]
        })
        .then(data => {
          if (cancelled) return

          // The catalogue's own minimums are only known from a response, so
          // the first one may have been read at a quantity that hid part of
          // the floor. Settle on the right one and let the effect run again.
          const want = catalogueQuantity(data)
          if (want !== floorQuantity) {
            setFloorQuantity(want)
            return
          }

          setZones(data)
          // Drop selections that the new availability no longer offers.
          setSelection(prev => {
            // A room the guest chose is kept even once it fills up — being
            // moved out of it silently is worse than seeing it full. Only the
            // opening choice prefers a room with something left.
            const kept = data.find(z => z._id === prev.zone?._id)
            const zone =
              kept ??
              data.find(z => (z.spaces ?? []).some(space => space.available)) ??
              data[0]
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
  }, [selection.event, floorQuantity])

  // ─── The quote ────────────────────────────────────────────────────────────
  // Availability prices a rate for the quantity it is read at, so the figure
  // for this party comes from a read of its own. The floor is left alone, so
  // the plan does not redraw while the guests are counted.
  const tableId = selection.table?._id
  const rateId = selection.rate?._id
  useEffect(() => {
    const event = selection.event
    if (!event || !tableId || !rateId) {
      setQuotedTotal(undefined)
      return
    }

    let cancelled = false
    const controller = new AbortController()
    const timer = setTimeout(() => {
      fetch(
        `/api/availability?event_id=${encodeURIComponent(event._id)}&quantity=${partySize}`,
        { signal: controller.signal },
      )
        .then(res => res.json())
        .then(json => {
          if (cancelled || !json?.success) return
          const zones = json.data as FvZone[]
          const table = zones
            .flatMap(z => z.spaces ?? [])
            .find(s => s._id === tableId)
          const rate = (table?.rates ?? []).find(r => r._id === rateId)
          if (rate) setQuotedTotal(rate.price)
        })
        .catch(() => {
          // The previous quote stands, and the payment page is the authority.
        })
    }, 250)

    return () => {
      cancelled = true
      controller.abort()
      clearTimeout(timer)
    }
  }, [selection.event, tableId, rateId, partySize])

  const basePrice = selection.rate
    ? (selection.rate.base_price ?? selection.rate.price)
    : undefined
  const quote =
    basePrice === undefined
      ? undefined
      : priceBreakdown(
          basePrice,
          Math.max(0, (quotedTotal ?? basePrice) - basePrice),
          extraGuestsFor(selection.rate!, partySize),
        )

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

  /** Scrolls to the first thing that is missing, and puts the cursor in it. */
  function showFirstProblem() {
    requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>('[data-invalid]')
      if (!target) return
      const HEADER = 110
      window.scrollTo({
        top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - HEADER),
        behavior: 'smooth',
      })
      target.querySelector('input')?.focus({ preventScroll: true })
    })
  }

  function validateGuest(): boolean {
    const errors: Record<string, string> = {}
    if (guest.full_name.trim().length < 2) errors.full_name = 'Please enter the full name.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(guest.email))
      errors.email = 'Please enter a valid email address.'
    if (!/^[+\d][\d\s().-]{6,}$/.test(guest.phone.trim()))
      errors.phone = 'Please enter a reachable phone number.'
    if (!guest.accepts_terms) errors.accepts_terms = 'Required.'
    if (!guest.accepts_charge) errors.accepts_charge = 'Required.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // The floor always opens on a room. `selection.zone` is what the guest
  // picked; until they pick, this stands in, so no path through the flow can
  // reach the plan with nothing to draw.
  const activeZone =
    selection.zone ?? zones.find(z => (z.spaces ?? []).some(s => s.available)) ?? zones[0]

  // A contact-only rate has no checkout to advance to.
  // Belt and braces on the table's own limits. The counter cannot reach a
  // headcount outside them, and choosing a table brings it inside them, but
  // nothing downstream should depend on that having worked.
  const partyFitsTable = (() => {
    const { table, rate, zone } = selection
    if (!table || !rate) return true
    return partySize >= (table.minimum || 1) && partySize <= tableSeats(table, zone)
  })()

  const canAdvance =
    step === 0
      ? Boolean(selection.event)
      : Boolean(selection.zone && selection.rate) &&
        !isOnRequest(selection.rate) &&
        partyFitsTable

  const nightLabel = selection.event
    ? (() => {
        const d = nightDate(selection.event)
        return `${d.weekdayLong} ${d.day} ${d.monthLong}`
      })()
    : 'an upcoming night'

  function next() {
    // The ratio is not a reason to grey out Continue — a dead button that
    // will not say why is the worst of both. Let it be pressed, then point
    // at what is missing.
    if (step === 1 && !acceptsRatio) {
      setRatioError(true)
      stepRef.current?.querySelector('label[data-invalid]')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
      return
    }
    goTo(Math.min(STEPS.length - 1, step + 1))
  }

  // ─── Submit ───────────────────────────────────────────────────────────────
  function confirm() {
    const { event, zone, rate, table } = selection
    if (!event || !zone || !rate) return
    if (!validateGuest()) {
      // Without this the button simply does nothing, which reads as broken.
      showFirstProblem()
      return
    }
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
        minimum_spend: rate.base_price ?? rate.price,
        supplements: Math.max(0, (quotedTotal ?? rate.base_price ?? rate.price) - (rate.base_price ?? rate.price)),
        full_name: guest.full_name.trim(),
        email: guest.email.trim(),
        phone: guest.phone.trim(),
        birthdate: guest.birthdate || undefined,
        // The venue reads this on the booking in FV Pro, so the mix leads and
        // whatever the guest wrote follows it.
        // What the venue reads on the booking in FV Pro. Each line is written
        // from the tick that earned it rather than assumed from the fact that
        // the booking got this far: a note that cannot be false is worth more
        // than one that is merely usually true.
        observations_client: [
          guest.promoter.trim() ? `Promoter: ${guest.promoter.trim()}` : undefined,
          acceptsRatio ? ratioNote() : undefined,
          guest.accepts_charge ? 'Card authorisation accepted at checkout.' : undefined,
          guest.observations_client.trim(),
        ]
          .filter(Boolean)
          .join(' — '),
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
      className={cn(
        'gutter mx-auto max-w-7xl scroll-mt-24 lg:pb-0',
        // Room for the fixed bar, on the steps that have one.
        step === 0 ? 'pb-12' : 'pb-36',
      )}
    >
      <Stepper steps={[...STEPS]} current={step} onJump={goTo} />

      <div className="mt-10 grid gap-14 sm:mt-14 lg:grid-cols-[1fr_320px] lg:gap-20">
        <div ref={stepRef} className="min-w-0 scroll-mt-20">
          {step === 0 && (
            <NightStep
              events={events}
              selectedId={selection.event?._id}
              onSelect={event => {
                // Only a different night clears the floor. Re-tapping the one
                // already chosen used to wipe the zone while leaving the
                // availability effect untriggered — its dependency had not
                // changed — so nothing put a zone back and the next step came
                // up with no plan on it.
                if (selection.event?._id !== event._id) {
                  // Another night's floor can carry different minimums.
                  setFloorQuantity(1)
                }
                setSelection(prev =>
                  prev.event?._id === event._id
                    ? prev
                    : { ...prev, event, zone: undefined, table: undefined, rate: undefined },
                )
                // Choosing the night is the whole of this step, so it is also
                // the gesture that leaves it.
                goTo(1)
              }}
            />
          )}

          {step === 1 && (
            <TableStep
              zones={zones}
              loading={loadingZones}
              error={zonesError}
              partySize={selection.partySize}
              zone={activeZone}
              table={selection.table}
              rate={selection.rate}
              currency={currency}
              onZone={(zone: FvZone) =>
                setSelection(prev => ({ ...prev, zone, table: undefined, rate: undefined }))
              }
              onTable={(table?: FvTable) =>
                setSelection(prev => ({
                  ...prev,
                  table,
                  rate: undefined,
                  // The table opens on what it already includes, so the
                  // first figure a guest sees costs no supplement. Adding
                  // from there is theirs to decide.
                  partySize: table
                    ? sizeForTable(
                        ratesFor(table, prev.zone)[0]?.included_persons ??
                          (table.minimum || 1),
                        { min: table.minimum || 1, max: tableSeats(table, prev.zone) },
                      )
                    : prev.partySize,
                }))
              }
              onRate={(rate: FvTableRate) => setSelection(prev => ({ ...prev, rate }))}
              onPartySize={(size: number) =>
                setSelection(prev => ({ ...prev, partySize: size }))
              }
              acceptsRatio={acceptsRatio}
              onAcceptsRatio={next => {
                setAcceptsRatio(next)
                if (next) setRatioError(false)
              }}
              ratioError={ratioError}
              quote={quote}
              nightLabel={nightLabel}
              eventName={selection.event?.name}
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
              <PricePanel
                selection={selection}
                quote={quote}
                currency={currency}
                error={submitError}
              />
            </div>
          )}

          {/* Desktop actions sit in the column; on a phone they live in the
              fixed bar below, within thumb reach.

              Continue comes first so it starts flush with the content's left
              edge, where every heading and control on the page starts. Back
              follows it: reserving a slot to its left kept Continue from
              moving between steps but pushed it out of alignment with
              everything above it, which was the more visible fault. */}
          <div
            className={cn(
              'mt-12 hidden items-center gap-3 border-t border-hairline-soft pt-8',
              step > 0 && 'lg:flex',
            )}
          >
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                disabled={!canAdvance}
                className="btn btn-primary min-w-52"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={confirm}
                disabled={pending}
                className="btn btn-primary min-w-52"
              >
                {confirmLabel}
              </button>
            )}

            {step > 0 && (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                disabled={pending}
                className="btn btn-plain"
              >
                Back
              </button>
            )}
          </div>

          {/* Mobile summary: in flow, collapsed, so the bar stays one line. */}
          <details className="material-lg group mt-12 overflow-hidden lg:hidden">
            <summary className="label flex cursor-pointer list-none items-center justify-between p-5">
              Your reservation
              <DisclosureMark />
            </summary>
            <div className="border-t border-hairline-soft px-5 pb-6 pt-5">
              <SummaryContent selection={selection} quote={quote} currency={currency} />
            </div>
          </details>
        </div>

        <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
          <div className="material-lg p-6">
            <p className="label label-gold">Your reservation</p>
            <div className="mt-6">
              <SummaryContent selection={selection} quote={quote} currency={currency} />
            </div>
          </div>
        </aside>
      </div>

      {/* Fixed action bar — phones only, and not on the night step, where a
          tap on a night is itself the way forward. */}
      <div
        className={cn(
          'glass fixed inset-x-0 bottom-0 z-40 border-t border-hairline-soft lg:hidden',
          step === 0 && 'hidden',
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="gutter flex items-center gap-3 py-3.5">
          {/* A drawn chevron rather than an arrow glyph, and no chrome around
              it: the bar already has one emphasis, and it is the gold button. */}
          <button
            type="button"
            onClick={() => goTo(Math.max(0, step - 1))}
            disabled={step === 0 || pending}
            aria-label="Back"
            className="-ml-3 flex h-12 w-12 shrink-0 items-center justify-center text-mute transition-colors duration-200 hover:text-bone active:text-bone disabled:invisible"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M12 4.5 6.5 10l5.5 5.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="min-w-0 flex-1">
            <p className="label truncate">
              {selection.rate
                ? `${selection.rate.name} · ${partySize} guests`
                : `${partySize} guests`}
            </p>
            {selection.rate && (
              <p className="truncate text-sm text-gold-lit">
                {isOnRequest(selection.rate) ? (
                  'On request'
                ) : (
                  <>
                    {formatMoney(quote?.payNow ?? 0, currency, { cents: true })}{' '}
                    <span className="text-faint">now</span>
                  </>
                )}
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
