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
  /** For the phone's action bar, where the control shares a row with
      Continue: same control, shorter, and the range is printed above the
      row instead of under the pill. */
  compact = false,
}: {
  value: number
  bounds: { min: number; max: number } | null
  onChange: (n: number) => void
  compact?: boolean
}) {
  const min = bounds?.min ?? 1
  const max = bounds?.max ?? 30

  const step = (delta: number) => onChange(Math.min(max, Math.max(min, value + delta)))

  return (
    <div>
      <div
        className={cn(
          'flex w-full items-stretch overflow-hidden rounded-sm border border-hairline bg-surface',
          compact ? 'max-w-48' : 'max-w-64',
        )}
      >
        <button
          type="button"
          aria-label="Fewer guests"
          onClick={() => step(-1)}
          disabled={value <= min}
          className={cn(
            'flex shrink-0 items-center justify-center text-xl transition-colors duration-300',
            compact ? 'h-11 w-11' : 'h-14 w-14',
            value <= min ? 'cursor-not-allowed text-faint' : 'text-gold-lit hover:bg-surface-strong',
          )}
        >
          −
        </button>

        <span aria-hidden className={cn('w-px bg-hairline', compact ? 'my-2.5' : 'my-3')} />

        <span
          className={cn(
            'flex flex-1 items-baseline justify-center gap-1.5',
            compact ? 'min-w-0 py-2.5' : 'gap-2 py-4',
          )}
          aria-live="polite"
        >
          <span className={cn('figure text-bone', compact ? 'text-xl' : 'text-2xl')}>{value}</span>
          {/* On a 320px phone the word does not fit beside Continue, and a
              flex item will not shrink below its own text: left in, it pushed
              the + out under the button. The caption above the row carries
              the unit there. The query reads the bar's row, whose width is a
              plain fact about the viewport. */}
          <span className={cn('label', compact && 'hidden @min-[20rem]:inline')}>guests</span>
        </span>

        <span aria-hidden className={cn('w-px bg-hairline', compact ? 'my-2.5' : 'my-3')} />

        <button
          type="button"
          aria-label="More guests"
          onClick={() => step(1)}
          disabled={value >= max}
          className={cn(
            'flex shrink-0 items-center justify-center text-xl transition-colors duration-300',
            compact ? 'h-11 w-11' : 'h-14 w-14',
            value >= max ? 'cursor-not-allowed text-faint' : 'text-gold-lit hover:bg-surface-strong',
          )}
        >
          +
        </button>
      </div>

      {bounds && !compact && (
        <p className="label mt-3">
          {min}–{max} guests per table
        </p>
      )}
    </div>
  )
}
