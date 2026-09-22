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

/**
 * Exact marker positions, read off the venue's own chart.
 *
 * The calibration below is the best a linear fit can do, and it is not good
 * enough: the venue stores coordinates as rounded integers, so T1 sits a whole
 * unit — 57px on the source image, 3.5% of its width — from where the artwork
 * draws it. No scale and offset can absorb that.
 *
 * These are therefore measured rather than computed. A matched filter for a
 * 32–40px ring was correlated over the chart; the 23 strongest responses
 * (15.6–21.3, with the next at 11.7) are the 23 table circles, and they were
 * paired with the API's tables by column, whose shape — 4, 4, 6, 9 — matches
 * on both sides and admits only one assignment. Values are percentages of the
 * cropped plan, so they move with `PLAN_CROP`.
 *
 * Keyed by zone `normalized_name`, then table `name`. Anything not listed
 * falls back to the calibration, so a new table appears roughly right rather
 * than not at all. Re-measure if the venue replaces its chart.
 */
export const PLAN_OVERRIDES: Record<string, Record<string, [number, number]>> = {
  'vip-tables': {
    '1': [27.68, 14.64],
    '2': [27.62, 18.39],
    '3': [27.62, 22.3],
    '4': [27.56, 26.15],
    '5': [16.16, 37.86],
    '6': [16.16, 42.26],
    '7': [16.16, 54.42],
    '8': [16.22, 58.62],
    '9': [53.78, 12.07],
    '10': [82.26, 12.07],
    '11': [53.6, 25.11],
    '12': [53.54, 30.2],
    '13': [82.5, 25.26],
    '14': [82.44, 30.11],
    '15': [82.93, 42.95],
    '16': [83.05, 55.16],
    '17': [82.93, 66.97],
    '18': [82.93, 77.69],
    '19': [82.93, 81.55],
    '20': [54.88, 77.65],
    '21': [54.82, 81.55],
    '22': [55.18, 90.3],
    '23': [82.74, 90.3],
  },
}

/**
 * Position within the *cropped* viewport, which is what the map renders.
 * A measured position wins; the calibration is the fallback.
 */
export function planPosition(table: FvTable, zoneKey?: string) {
  const measured = zoneKey ? PLAN_OVERRIDES[zoneKey]?.[table.name] : undefined
  if (measured) return { left: measured[0], top: measured[1] }

  const { scaleX, offsetX, scaleY, offsetY } = PLAN_CALIBRATION
  const topInImage = table.position.y * scaleY + offsetY
  return {
    left: table.position.x * scaleX + offsetX,
    top: ((topInImage - PLAN_CROP.top) / PLAN_VISIBLE) * 100,
  }
}

/** The chart draws its circles 80px across on a 1640x2520 plan. */
export const MARKER_SIZE = {
  width: `${(80 / 1640) * 100}%`,
  height: `${((80 / 2520) * 100) / (PLAN_VISIBLE / 100)}%`,
} as const

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

/**
 * Rates the venue will not sell online. They carry no price in the interface
 * and no path to checkout — only a way to reach a host.
 */
export function isOnRequest(rate?: FvTableRate): boolean {
  return Boolean(rate?.whatsapp_contact_enabled)
}

/** A wa.me link for a rate, with the request already written. */
export function whatsappLink(rate: FvTableRate, message: string): string | undefined {
  const digits = rate.whatsapp_contact_phone_number?.replace(/\D/g, '')
  if (!digits) return undefined
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
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
