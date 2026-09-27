'use client'

import type { FvZone } from '@/types/fourvenues'
import { cn } from '@/lib/utils'

/**
 * Which room you are booking in, as a segmented switch over the plan.
 *
 * It sits directly above the plan because it changes the plan — the two read
 * as one control. A zone with nothing left is still offered rather than
 * hidden: the guest can look at a full room and decide to try another night,
 * which a missing segment would not let them do.
 */
export function ZoneSwitch({
  zones,
  selectedId,
  onSelect,
}: {
  zones: FvZone[]
  selectedId?: string
  onSelect: (zone: FvZone) => void
}) {
  if (zones.length < 2) return null

  return (
    <div
      role="tablist"
      aria-label="Room"
      className="flex w-full gap-1 rounded-full border border-hairline bg-surface p-1 sm:w-auto sm:self-start"
    >
      {zones.map(zone => {
        const selected = zone._id === selectedId
        const free = (zone.spaces ?? []).some(s => s.available && !s.blocked)

        return (
          <button
            key={zone._id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(zone)}
            className={cn(
              'flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5',
              'text-[0.6875rem] font-medium uppercase tracking-[0.14em] transition-colors duration-300',
              selected
                ? 'bg-gold text-[#0b0906]'
                : 'text-mute hover:text-bone active:text-bone',
            )}
          >
            {zone.name}
            {!free && (
              <span
                className={cn(
                  'text-[0.625rem] tracking-normal',
                  selected ? 'text-[#0b0906]/60' : 'text-faint',
                )}
              >
                Full
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
