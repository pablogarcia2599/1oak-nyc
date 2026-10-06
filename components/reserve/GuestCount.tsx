'use client'

import { cn } from '@/lib/utils'

/**
 * How many are coming.
 *
 * Built like `PhoneField`: one bordered surface with hairline dividers
 * between its cells. The limits are enforced on the buttons rather than
 * checked later, so there is no way to count past what the table will take,
 * and the line underneath says what stopped you.
 */
export function GuestCount({
  value,
  bounds,
  included,
  onChange,
}: {
  value: number
  /** The chosen table's range. */
  bounds: { min: number; max: number } | null
  /** The headcount the rate already covers. */
  included?: number
  onChange: (size: number) => void
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
          {included !== undefined && `${included} included · `}up to {max}
        </p>
      )}

      {bounds && value >= max && (
        <p className="label mt-1.5 text-gold-lit">
          This table seats {max}. Choose a larger one for more.
        </p>
      )}
    </div>
  )
}
