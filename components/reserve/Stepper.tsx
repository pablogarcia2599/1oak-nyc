'use client'

import { cn } from '@/lib/utils'

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
    <div className="border-b border-hairline-soft pb-5">
      {/* Mobile: one line of text beats four cramped chips. */}
      <div className="flex items-center justify-between gap-4 sm:hidden">
        <p className="label">
          Step {current + 1} of {steps.length}
        </p>
        <p className="label label-gold">{steps[current]}</p>
      </div>
      <div
        className="mt-3 h-px w-full bg-hairline sm:hidden"
        role="progressbar"
        aria-valuenow={current + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
      >
        <span
          className="block h-px bg-gold transition-[width] duration-500"
          style={{ width: `${((current + 1) / steps.length) * 100}%` }}
        />
      </div>

      <ol className="hidden items-center gap-8 sm:flex">
        {steps.map((label, i) => {
          const done = i < current
          const active = i === current
          return (
            <li key={label}>
              <button
                type="button"
                disabled={i > current}
                onClick={() => onJump(i)}
                className={cn(
                  'label transition-colors duration-300',
                  active && 'text-gold-lit',
                  done && 'text-bone hover:text-gold-lit',
                  !active && !done && 'cursor-not-allowed text-faint',
                )}
              >
                <span className="mr-2 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                {label}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
