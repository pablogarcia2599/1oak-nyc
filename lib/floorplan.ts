import type { FvTable, FvTableRate, FvZone } from '@/types/fourvenues'

/**
 * Fourvenues' floor editor does not store table coordinates as percentages of
 * the plan image. `y` runs almost 1:1 down the image, but `x` is stored against
 * the plan's HEIGHT, so on a portrait plan it has to be stretched by the aspect
 * ratio before it can be used as a `left` percentage.
 *
 * These constants were fitted against the venue's own seating chart (1640×2520) by
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
/**
 * Everything specific to one venue plan, measured rather than derived.
 *
 * A linear calibration cannot land on these circles: the venue stores its
 * coordinates as rounded integers, so a table can sit a whole unit from where
 * the artwork draws it. Each plan therefore carries its own measurements,
 * taken by correlating a matched ring filter over the image and pairing the
 * responses with the API's tables by column — a shape that matches on both
 * sides and admits one assignment only.
 *
 * Keyed by the zone's `normalized_name`. An unlisted zone falls back to the
 * calibration, so a new room appears roughly right rather than not at all.
 */
interface PlanSpec {
  /** Share of the image height hidden at each end, as a percentage. */
  crop: { top: number; bottom: number }
  /** Used until the image reports its own, so the box never resizes on load. */
  naturalAspect: number
  /** The circle the artwork draws, as a share of the cropped viewport. */
  marker: { width: number; height: number }
  /** Measured centres, keyed by table name, within the cropped viewport. */
  positions: Record<string, [number, number]>
}

function spec(
  naturalWidth: number,
  naturalHeight: number,
  crop: { top: number; bottom: number },
  circlePx: number,
  positions: Record<string, [number, number]>,
): PlanSpec {
  const visible = (100 - crop.top - crop.bottom) / 100
  return {
    crop,
    naturalAspect: naturalWidth / naturalHeight,
    marker: {
      width: (circlePx / naturalWidth) * 100,
      height: ((circlePx / naturalHeight) * 100) / visible,
    },
    positions,
  }
}

export const PLANS: Record<string, PlanSpec> = {
  // This chart carries the venue's former logo above the room; the crop hides
  // it, and the artwork starts just below where the crop ends.
  'main-room': spec(1640, 2520, { top: 16.5, bottom: 3.2 }, 80, {
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
  }),

  // All plan, no header: its ink runs from 3% to 99% of the height.
  downstairs: spec(1320, 1224, { top: 0, bottom: 0 }, 106, {
      '1': [26.97, 27.12],
      '2': [26.97, 41.26],
      '3': [26.82, 55.07],
      '4': [26.97, 68.55],
      '5': [73.33, 26.96],
      '6': [74.02, 43.63],
      '7': [74.17, 59.15],
      '8': [74.17, 73.28],
  }),
}

const FALLBACK_CROP = { top: 0, bottom: 0 }

function planOf(zoneKey?: string): PlanSpec | undefined {
  return zoneKey ? PLANS[zoneKey] : undefined
}

/** Share of the original image height still on screen. */
export function planVisible(zoneKey?: string): number {
  const crop = planOf(zoneKey)?.crop ?? FALLBACK_CROP
  return 100 - crop.top - crop.bottom
}

/** Aspect ratio of the cropped viewport, given the image's own aspect. */
export function croppedAspect(zoneKey?: string, naturalAspect?: number): number {
  const aspect = naturalAspect ?? planOf(zoneKey)?.naturalAspect ?? 1
  return aspect / (planVisible(zoneKey) / 100)
}

/** CSS for the image inside the cropping viewport. */
export function planImageStyle(zoneKey?: string) {
  const crop = planOf(zoneKey)?.crop ?? FALLBACK_CROP
  const visible = planVisible(zoneKey)
  return {
    height: `${(100 / visible) * 100}%`,
    top: `-${(crop.top / visible) * 100}%`,
  }
}

/** The marker matches the circle the plan draws, so the two coincide. */
export function markerSize(zoneKey?: string) {
  const marker = planOf(zoneKey)?.marker
  return marker
    ? { width: `${marker.width}%`, height: `${marker.height}%` }
    : { width: '5.6%', height: '4.5%' }
}

export function planPosition(table: FvTable, zoneKey?: string) {
  const measured = planOf(zoneKey)?.positions[table.name]
  if (measured) return { left: measured[0], top: measured[1] }

  const { scaleX, offsetX, scaleY, offsetY } = PLAN_CALIBRATION
  const crop = planOf(zoneKey)?.crop ?? FALLBACK_CROP
  const topInImage = table.position.y * scaleY + offsetY
  return {
    left: table.position.x * scaleX + offsetX,
    top: ((topInImage - crop.top) / planVisible(zoneKey)) * 100,
  }
}

/** The chart draws its circles 80px across on a 1640x2520 plan. */
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
 * This venue models each part of the room (LOUNGE, DJ BOOTH, BACK…) as a
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
          existing.maxGuests = Math.max(existing.maxGuests, tableSeats(table, zone))
        } else {
          byRate.set(rate._id, {
            rate,
            tableCount: 1,
            availableCount: table.available ? 1 : 0,
            minGuests: table.minimum || 1,
            maxGuests: tableSeats(table, zone),
          })
        }
      }
    }
  }

  return [...byRate.values()].sort((a, b) => a.rate.price - b.rate.price)
}

/**
 * How many guests a table can actually be sold to.
 *
 * `capacity` is the venue's seating figure, and it is not what the rate will
 * take. Several tables are entered as 15 while their rate sells
 * `included_persons` plus `supplement_persons` — as few as seven. A booking
 * can only honour the smaller of the two, so that is the number the site
 * counts to.
 */
export function tableSeats(table: FvTable, zone?: FvZone): number {
  const rate = ratesFor(table, zone)[0]
  if (!rate) return table.capacity
  const sellable = rate.included_persons + rate.supplement_persons
  return Math.max(table.minimum || 1, Math.min(table.capacity, sellable))
}

/**
 * The one party size that shows the whole floor.
 *
 * The table is chosen before the guests now, so a single read of availability
 * has to stand for every table. The API offers a table only while
 * `minimum <= quantity <= capacity`, so the quantity that leaves none out is
 * the highest minimum any table carries — as long as no table seats fewer
 * than that. Where the two cannot both be met the smaller wins, and the
 * tables with a high minimum read as taken, which is the safe way to be
 * wrong.
 */
export function catalogueQuantity(zones: FvZone[]): number {
  const tables = zones.flatMap(z => (z.spaces ?? []).filter(t => !t.hidden).map(t => [t, z] as const))
  if (tables.length === 0) return 1
  const highestMinimum = Math.max(...tables.map(([t]) => t.minimum || 1))
  const smallestTable = Math.min(...tables.map(([t, z]) => tableSeats(t, z)))
  return Math.max(1, Math.min(highestMinimum, smallestTable))
}

