'use client'

import type { FvEvent } from '@/types/fourvenues'
import { NightPoster } from '@/components/NightPoster'
import { cn } from '@/lib/utils'

/**
 * One decision, one tap. Choosing a night is the whole of this step, so the
 * flow moves on with the tap rather than asking for a second one on a button;
 * the party size belongs with the floor it filters, a step later.
 */
export function NightStep({
  events,
  selectedId,
  onSelect,
}: {
  events: FvEvent[]
  selectedId?: string
  onSelect: (event: FvEvent) => void
}) {
  const hasSelection = events.some(event => event._id === selectedId)

  return (
    <section>
      <h2 className="heading heading-lg text-bone">Choose your night</h2>

      {events.length === 0 ? (
        <p className="material mt-8 p-6 text-sm text-mute">No nights are on sale right now.</p>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-2 xl:grid-cols-3 xl:gap-3">
          {events.map(event => {
            const selected = event._id === selectedId
            return (
              <li key={event._id} className="contents">
                <button
                  type="button"
                  onClick={() => onSelect(event)}
                  aria-pressed={selected}
                  className={cn(
                    'material group @container relative flex h-full flex-col overflow-hidden transition-all duration-300 active:scale-[0.99]',
                    selected ? 'border-gold/60' : 'hover:border-hairline',
                  )}
                >
                  <NightPoster event={event} dimmed={!selected && hasSelection} />
                  {selected && (
                    <span
                      aria-hidden
                      className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-gold shadow-[0_0_0_4px_rgba(7,8,9,0.55)]"
                    />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
