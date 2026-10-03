'use client'

import type { FvEvent } from '@/types/fourvenues'
import Image from 'next/image'
import { PartySize } from '../PartySize'
import { cn, doorHours, nightDate } from '@/lib/utils'

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
                    {/* The artwork, small: it tells one night from another
                        at a glance without turning the list into a gallery. */}
                    {event.image_url ? (
                      <span
                        className={cn(
                          'relative block h-14 w-14 shrink-0 overflow-hidden rounded-sm transition-opacity duration-300',
                          selected ? 'opacity-100' : 'opacity-70',
                        )}
                      >
                        <Image
                          src={event.image_url}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </span>
                    ) : (
                      <span
                        className={cn(
                          'h-2 w-2 shrink-0 rounded-full transition-colors duration-300',
                          selected ? 'bg-gold' : 'bg-hairline',
                        )}
                        aria-hidden
                      />
                    )}

                    <span className="min-w-0 flex-1">
                      <span className="label label-gold block">
                        {date.weekday} · {date.day} {date.month}
                      </span>
                      {/* Two lines, not one: the part that tells a night
                          apart is often at the end of its name. */}
                      <span className="heading mt-1.5 line-clamp-2 block text-lg text-inherit">
                        {event.name}
                      </span>
                      <span className="label mt-1 block normal-case tracking-normal">
                        {doorHours(event)} · {event.age}+
                      </span>
                    </span>

                    {selected && (
                      <span
                        aria-hidden
                        className="h-2 w-2 shrink-0 rounded-full bg-gold"
                      />
                    )}
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
