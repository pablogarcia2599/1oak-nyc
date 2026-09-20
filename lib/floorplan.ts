import type { FvTable, FvTableRate, FvZone } from '@/types/fourvenues'

/**
 * Fourvenues' floor editor does not store table coordinates as percentages of
 * the plan image. `y` runs almost 1:1 down the image, but `x` is stored against
 * the plan's HEIGHT, so on a portrait plan it has to be stretched by the aspect
 * ratio before it can be used as a `left` percentage.
 *
 * These constants were fitted against 1 OAK's own seating chart (1640×2520) by
 * overlaying markers on the circles the chart already draws. They hold to
 * within ~1% of the plan's width, and that is the floor: the venue stores the
 * coordinates as rounded integers (T1–T4 sit at y 25/29/32/35 for four evenly
 * spaced booths), so no calibration can be exact. Markers are therefore drawn
 * as discs wide enough to cover a circle that is a few pixels off, rather than
 * as rings that would have to land on it precisely.
 *
 * A venue with a differently proportioned plan needs its own calibration, which
 * is why this lives in one place rather than inline in the component.
 */
export const PLAN_CALIBRATION = {
  scaleX: 1.542,
  offsetX: 2.9,
  scaleY: 1.054,
  offsetY: -0.35,
} as const

/**
 * The venue's chart carries its logo and a band of empty black above the room,
 * and a margin below it — together a fifth of a very tall portrait image. On a
 * phone that is dead vertical space, so the plan is cropped to the drawing.
 *
 * Measured off the chart itself: the frame's top edge lands at 17.8% of the
 * image height and the last ink at 96.3%. Cropping to 16.5%–96.8% keeps a
 * hair of margin and takes the aspect from 0.65 to 0.81, which is far kinder
 * to a phone. Every table sits between 25% and 90% of the original height, so
 * nothing plotted is ever cut.
 *
 * The crop is CSS only — the venue's asset is never modified or re-hosted.
 */
export const PLAN_CROP = {
  top: 16.5,
  bottom: 3.2,
  /** Fallback until the real image reports its size, so nothing jumps on load. */
  naturalAspect: 1640 / 2520,
} as const

/** Share of the original image height still on screen. */
export const PLAN_VISIBLE = 100 - PLAN_CROP.top - PLAN_CROP.bottom

/** Aspect ratio of the cropped viewport, given the image's own aspect. */
export function croppedAspect(naturalAspect = PLAN_CROP.naturalAspect) {
  return naturalAspect / (PLAN_VISIBLE / 100)
}

/** CSS for the image inside the cropping viewport. */
export const PLAN_IMAGE_STYLE = {
  height: `${(100 / PLAN_VISIBLE) * 100}%`,
  top: `-${(PLAN_CROP.top / PLAN_VISIBLE) * 100}%`,
} as const

/** Position within the *cropped* viewport, which is what the map renders. */
export function planPosition(table: FvTable) {
  const { scaleX, offsetX, scaleY, offsetY } = PLAN_CALIBRATION
  const topInImage = table.position.y * scaleY + offsetY
  return {
    left: table.position.x * scaleX + offsetX,
    top: ((topInImage - PLAN_CROP.top) / PLAN_VISIBLE) * 100,
  }
}

/** Falls back to spreading tables across the box when there is no plan image. */
export function spreadPosition(table: FvTable, all: FvTable[]) {
  const xs = all.map(t => t.position?.x ?? 50)
  const ys = all.map(t => t.position?.y ?? 50)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const spanX = Math.max(...xs) - minX || 1
  const spanY = Math.max(...ys) - minY || 1
  if (all.length === 1) return { left: 50, top: 50 }
  return {
    left: 8 + ((table.position.x - minX) / spanX) * 84,
    top: 8 + ((table.position.y - minY) / spanY) * 84,
  }
}

export function rateColor(rate?: FvTableRate, alpha = 1): string | undefined {
  const [r, g, b] = rate?.color ?? []
  if (r == null || g == null || b == null) return undefined
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** The rates a table can be booked on — table-level wins over zone-level. */
export function ratesFor(table?: FvTable, zone?: FvZone): FvTableRate[] {
  return (table?.rates?.length ? table.rates : zone?.rates) ?? []
}

/**
 * The venue's room catalogue, derived from the rates attached to its tables.
 * Venues like 1 OAK model each part of the room (LOUNGE, DJ BOOTH, BACK…) as a
 * rate rather than a zone, so this is what a guest actually chooses between.
 */
export interface Room {
  rate: FvTableRate
  tableCount: number
  availableCount: number
  minGuests: number
  maxGuests: number
}

export function roomsFrom(zones: FvZone[]): Room[] {
  const byRate = new Map<string, Room>()

  for (const zone of zones) {
    for (const table of zone.spaces ?? []) {
      if (table.hidden) continue
      for (const rate of ratesFor(table, zone)) {
        const existing = byRate.get(rate._id)
        if (existing) {
          existing.tableCount += 1
          if (table.available) existing.availableCount += 1
          existing.minGuests = Math.min(existing.minGuests, table.minimum || 1)
          existing.maxGuests = Math.max(existing.maxGuests, table.capacity)
        } else {
          byRate.set(rate._id, {
            rate,
            tableCount: 1,
            availableCount: table.available ? 1 : 0,
            minGuests: table.minimum || 1,
            maxGuests: table.capacity,
          })
        }
      }
    }
  }

  return [...byRate.values()].sort((a, b) => a.rate.price - b.rate.price)
}

/** Party-size bounds the venue actually accepts, across every table on sale. */
export function partyBounds(zones: FvZone[]): { min: number; max: number } {
  const tables = zones.flatMap(z => z.spaces ?? []).filter(t => !t.hidden)
  if (tables.length === 0) return { min: 1, max: 30 }
  return {
    min: Math.min(...tables.map(t => t.minimum || 1)),
    max: Math.max(...tables.map(t => t.capacity)),
  }
}
