'use client'

import { cn } from '@/lib/utils'

/**
 * Four segments that fill as the reservation advances.
 *
 * A luxury room does not explain its own booking form, so this carries no
 * instructions: the segments show how far along you are, the step's own
 * heading says what it wants, and a completed segment takes you back to it.
 */
export function Stepper({
  steps,
  current,
  onJump,
}: {
  steps: string[]
  current: number
  onJump: (index: number) => void
}) {
  return (
    <nav aria-label="Reservation progress">
      <ol className="flex items-end gap-2 sm:gap-3">
        {steps.map((label, i) => {
          const done = i < current
          const active = i === current

          const last = i === steps.length - 1

          return (
            <li key={label} className="min-w-0 flex-1">
              <button
                type="button"
                disabled={i > current}
                onClick={() => onJump(i)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'group block w-full disabled:cursor-default',
                  last ? 'text-right' : 'text-left',
                )}
              >
                {/* The label rides above its own segment on a wide screen; on
                    a phone only the current one is worth the room. A segment is
                    a quarter of the width, so the label is left to run past it
                    rather than be silently clipped mid-word. */}
                <span
                  className={cn(
                    'mb-2.5 block whitespace-nowrap text-[0.6875rem] font-medium uppercase tracking-[0.12em] transition-colors duration-300',
                    active ? 'text-bone' : 'text-faint',
                    done && 'group-hover:text-gold-lit',
                    !active && 'hidden sm:block',
                  )}
                >
                  {label}
                </span>
                <span
                  className={cn(
                    'block h-px w-full transition-colors duration-500',
                    active || done ? 'bg-gold' : 'bg-hairline',
                  )}
                />
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
