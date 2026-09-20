'use client'

import type { FvEvent } from '@/types/fourvenues'
import { cn, doorTime, nightDate } from '@/lib/utils'

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
  return (
    <div className="space-y-14">
      <section>
        <h2 className="heading heading-lg text-bone">Choose your night</h2>

        {events.length === 0 ? (
          <p className="material mt-8 p-6 text-sm text-mute">No nights are on sale right now.</p>
        ) : (
          <ul className="mt-8 space-y-2">
            {events.map(event => {
              const date = nightDate(event)
              const selected = event._id === selectedId
              return (
                <li key={event._id}>
                  <button
                    type="button"
                    onClick={() => onSelect(event)}
                    aria-pressed={selected}
                    className={cn(
                      'material flex w-full items-center gap-4 p-4 text-left transition-all duration-300 active:scale-[0.99]',
                      selected ? 'border-gold/60 text-bone' : 'text-mute hover:border-hairline',
                    )}
                  >
                    <span
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full transition-colors duration-300',
                        selected ? 'bg-gold' : 'bg-hairline',
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="heading block text-xl text-inherit sm:text-2xl">
                        {date.weekdayLong} {date.day} {date.monthLong}
                      </span>
                      <span className="label mt-1.5 block">
                        Doors {doorTime(event)} · {event.age}+
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="heading heading-md text-bone">How many guests?</h2>
        <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-mute">
          {bounds ? (
            <>
              Tables here are booked for{' '}
              <span className="text-gold-lit">
                {bounds.min} to {bounds.max} guests
              </span>
              .
            </>
          ) : (
            'Choose a night to see the tables it can take.'
          )}
        </p>

        <div className="mt-8 flex items-center gap-6">
          <button
            type="button"
            aria-label="Fewer guests"
            onClick={() => onPartySize(Math.max(bounds?.min ?? 1, partySize - 1))}
            disabled={partySize <= (bounds?.min ?? 1)}
            className="chip !h-13 !w-13 text-lg"
          >
            −
          </button>
          <span className="figure w-14 text-center text-4xl text-bone">
            {partySize}
          </span>
          <button
            type="button"
            aria-label="More guests"
            onClick={() => onPartySize(Math.min(bounds?.max ?? 30, partySize + 1))}
            disabled={partySize >= (bounds?.max ?? 30)}
            className="chip !h-13 !w-13 text-lg"
          >
            +
          </button>
        </div>
      </section>
    </div>
  )
}
