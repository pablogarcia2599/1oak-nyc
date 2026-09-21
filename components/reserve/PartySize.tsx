'use client'

import { cn } from '@/lib/utils'

/** Above this many options a grid stops being scannable and steps win. */
const GRID_LIMIT = 12

/**
 * The party size, as the venue's actual range rather than a counter.
 *
 * At 1 OAK a table seats 8 to 15, so there are eight answers — laying them out
 * shows the constraint without a sentence explaining it, and takes one tap
 * instead of seven. Each step also refetches availability, so a counter meant
 * six throwaway requests on the way to the answer.
 *
 * A venue with a wider range falls back to the counter, where a grid of thirty
 * numbers would be worse than useless.
 */
export function PartySize({
  value,
  bounds,
  onChange,
}: {
  value: number
  bounds: { min: number; max: number } | null
  onChange: (n: number) => void
}) {
  const min = bounds?.min ?? 1
  const max = bounds?.max ?? 30
  const options = max - min + 1

  if (!bounds || options > GRID_LIMIT) {
    return (
      <div className="flex items-center gap-6">
        <button
          type="button"
          aria-label="Fewer guests"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="chip !h-13 !w-13 text-lg"
        >
          −
        </button>
        <span className="figure w-14 text-center text-4xl text-bone">{value}</span>
        <button
          type="button"
          aria-label="More guests"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="chip !h-13 !w-13 text-lg"
        >
          +
        </button>
      </div>
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label="Number of guests"
      className="grid grid-cols-4 gap-2 sm:grid-cols-8 sm:gap-2.5"
    >
      {Array.from({ length: options }, (_, i) => min + i).map(n => {
        const selected = n === value
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(n)}
            className={cn(
              'figure flex h-13 items-center justify-center rounded-sm border text-lg transition-all duration-300 active:scale-95',
              selected
                ? 'border-gold bg-gold text-[#0b0906]'
                : 'border-hairline bg-surface text-bone hover:border-gold/60',
            )}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}
