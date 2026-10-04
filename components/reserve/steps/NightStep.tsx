'use client'

import type { FvEvent } from '@/types/fourvenues'
import { NightPoster } from '@/components/NightPoster'
import { PartySize } from '../PartySize'
import { cn } from '@/lib/utils'

export function NightStep({
  events,
  selectedId,
  onSelect,
  partySize,
  bounds,
  onPartySize,
}: {
  events: FvEvent[]
  selectedId?: string
  onSelect: (event: FvEvent) => void
  partySize: number
  /** Null until availability has told us what the venue accepts. */
  bounds: { min: number; max: number } | null
  onPartySize: (n: number) => void
}) {
  const hasSelection = events.some(event => event._id === selectedId)

  return (
    <div className="space-y-14">
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

      {/* Phones carry this in the action bar, so the night and the party
          size are both set without leaving the top of the step. */}
      <section className="hidden lg:block">
        <h2 className="heading heading-md text-bone">How many guests?</h2>
        <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-mute">
          {bounds
            ? 'Only the tables that can take your party are shown.'
            : 'Choose a night to see the tables it can take.'}
        </p>

        <div className="mt-8">
          <PartySize value={partySize} bounds={bounds} onChange={onPartySize} />
        </div>
      </section>
    </div>
  )
}
