'use client'

import { useMemo, useState } from 'react'
import type { FvTable, FvZone } from '@/types/fourvenues'
import {
  PLAN_IMAGE_STYLE,
  croppedAspect,
  planPosition,
  rateColor,
  ratesFor,
  spreadPosition,
} from '@/lib/floorplan'
import { cn, formatMoney } from '@/lib/utils'

/**
 * Keeps the price pill inside the plan, which is clipped by the crop. Tables
 * near the top get the pill underneath them, and tables near either edge get
 * it nudged inwards.
 */
function pillPlacement(left: number, top: number) {
  const x = left < 24 ? '-12%' : left > 76 ? '-88%' : '-50%'
  const below = top < 18
  return {
    below,
    style: below
      ? { transform: `translateX(${x})`, marginTop: '1.5rem' }
      : { transform: `translateX(${x}) translateY(-100%)`, marginTop: '-1.5rem' },
  }
}

/**
 * The venue's own seating chart, cropped to the room, with live availability
 * over it.
 *
 * The whole plan fits the screen — no panning. That puts the markers below a
 * 44px touch target on a phone, so they are an overview and a confirmation,
 * not the only way in: `TableStep` pairs this with room rows and table chips
 * that are full-size targets.
 */
export function FloorMap({
  zone,
  selectedId,
  onSelect,
  partySize,
  currency,
}: {
  zone: FvZone
  selectedId?: string
  onSelect: (table: FvTable) => void
  partySize: number
  currency: string
}) {
  const tables = useMemo(() => (zone.spaces ?? []).filter(t => !t.hidden), [zone.spaces])
  const plan = zone.background_image
  // Seeded with this chart's proportions so the box never resizes on load.
  const [aspect, setAspect] = useState(() => croppedAspect())

  if (tables.length === 0) {
    return (
      <p className="material p-8 text-center text-sm text-mute">
        No tables plotted for this room.
      </p>
    )
  }

  return (
    <div
      // Bounded by height as well as width so the whole plan sits above the
      // fold at this step — tightly on a phone, where the step has to fit the
      // screen, and more generously on a desktop, where it only has to fit the
      // window.
      className="material-lg mx-auto w-full max-w-(--plan-max) overflow-hidden lg:max-w-(--plan-max-lg)"
      style={
        {
          '--plan-max': `calc(50svh * ${aspect})`,
          '--plan-max-lg': `calc(72svh * ${aspect})`,
        } as React.CSSProperties
      }
    >
      <div
        className="relative overflow-hidden"
        style={plan ? { aspectRatio: String(aspect) } : undefined}
      >
        {plan ? (
          // eslint-disable-next-line @next/next/no-img-element -- the plan is
          // the venue's own asset, cropped in place; next/image would fight the
          // percentage geometry the markers depend on.
          <img
            src={plan}
            alt={`${zone.name} seating chart`}
            onLoad={event => {
              const { naturalWidth, naturalHeight } = event.currentTarget
              if (naturalWidth && naturalHeight) {
                setAspect(croppedAspect(naturalWidth / naturalHeight))
              }
            }}
            className="absolute left-0 w-full max-w-none"
            style={PLAN_IMAGE_STYLE}
          />
        ) : (
          <div className="aspect-4/3 w-full" />
        )}

        {tables.map(table => {
          const { left, top } = plan ? planPosition(table) : spreadPosition(table, tables)
          const rate = ratesFor(table, zone)[0]
          const selected = table._id === selectedId
          const bookable = table.available && !table.blocked

          const reason = !bookable
            ? partySize < table.minimum
              ? `minimum ${table.minimum} guests`
              : partySize > table.capacity
                ? `seats ${table.capacity}`
                : 'unavailable'
            : undefined

          return (
            <div key={table._id}>
              <button
                type="button"
                disabled={!bookable}
                onClick={() => onSelect(table)}
                aria-pressed={selected}
                aria-label={`Table ${table.name}${rate ? `, ${rate.name}, ${formatMoney(rate.price, currency)}` : ''}, ${table.minimum} to ${table.capacity} guests${reason ? `, ${reason}` : ''}`}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  ...(selected
                    ? { backgroundColor: rateColor(rate, 1) ?? 'var(--color-gold)' }
                    : bookable
                      ? { backgroundColor: rateColor(rate, 0.3) }
                      : {}),
                }}
                className={cn(
                  'absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300',
                  'h-[4.5%] w-[5.6%] min-h-3.5 min-w-3.5 sm:min-h-7 sm:min-w-7',
                  selected
                    ? 'z-20 scale-125 ring-2 ring-bone'
                    : bookable
                      ? 'z-10 ring-1 ring-bone/25 hover:ring-bone/70'
                      : 'z-0 cursor-not-allowed bg-ink/80',
                )}
              >
                <span className="sr-only">T{table.name}</span>
              </button>

              {/* The rate, right where the guest tapped. */}
              {selected && rate && (
                <span
                  aria-hidden
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    ...pillPlacement(left, top).style,
                  }}
                  className="pointer-events-none absolute z-30"
                >
                  <span
                    style={{ animation: 'pop 260ms var(--ease-soft) both' }}
                    className="glass block whitespace-nowrap rounded-full border border-hairline px-3 py-1.5 text-[0.7rem] text-bone shadow-lg"
                  >
                    <span className="text-mute">T{table.name}</span>
                    <span className="mx-1.5 text-faint">·</span>
                    {rate.name}
                    <span className="mx-1.5 text-faint">·</span>
                    <span className="text-gold-lit">{formatMoney(rate.price, currency)}</span>
                  </span>
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
