'use client'

import { cn } from '@/lib/utils'

/**
 * The party size as one control rather than three loose pieces.
 *
 * Built like `PhoneField`: a single bordered surface with hairline dividers
 * between its cells, which is the pattern the rest of the form already uses.
 * The range sits underneath as a fact about the room — with a counter there is
 * nothing on screen to say a table starts at eight.
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

  const step = (delta: number) => onChange(Math.min(max, Math.max(min, value + delta)))

  return (
    <div>
      <div className="flex w-full max-w-64 items-stretch overflow-hidden rounded-sm border border-hairline bg-surface">
        <button
          type="button"
          aria-label="Fewer guests"
          onClick={() => step(-1)}
          disabled={value <= min}
          className={cn(
            'flex h-14 w-14 shrink-0 items-center justify-center text-xl transition-colors duration-300',
            value <= min ? 'cursor-not-allowed text-faint' : 'text-gold-lit hover:bg-surface-strong',
          )}
        >
          −
        </button>

        <span aria-hidden className="my-3 w-px bg-hairline" />

        <span className="flex flex-1 items-baseline justify-center gap-2 py-4" aria-live="polite">
          <span className="figure text-2xl text-bone">{value}</span>
          <span className="label">guests</span>
        </span>

        <span aria-hidden className="my-3 w-px bg-hairline" />

        <button
          type="button"
          aria-label="More guests"
          onClick={() => step(1)}
          disabled={value >= max}
          className={cn(
            'flex h-14 w-14 shrink-0 items-center justify-center text-xl transition-colors duration-300',
            value >= max ? 'cursor-not-allowed text-faint' : 'text-gold-lit hover:bg-surface-strong',
          )}
        >
          +
        </button>
      </div>

      {bounds && (
        <p className="label mt-3">
          {min}–{max} guests per table
        </p>
      )}
    </div>
  )
}
