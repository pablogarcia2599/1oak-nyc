import Link from 'next/link'
import type { FvEvent } from '@/types/fourvenues'
import { doorTime, formatMoney, nightDate } from '@/lib/utils'

/**
 * Typographic by design. Every event in this account points `image_url` at the
 * channel's own logo, so an image here would be the same gold shield repeated
 * down the page. The date does the work until the venue uploads real artwork.
 */
export function EventCard({ event, fromPrice }: { event: FvEvent; fromPrice?: number }) {
  const date = nightDate(event)

  return (
    <Link
      href={`/reserve?event=${event.slug}`}
      className="group flex flex-col justify-between gap-8 bg-ink p-6 transition-colors duration-500 hover:bg-surface sm:p-8"
    >
      <div>
        <p className="label label-gold">{date.weekdayLong}</p>
        <p className="figure mt-5 text-[clamp(3rem,13vw,4.25rem)] leading-none text-bone">{date.day}</p>
        <p className="label mt-2">
          {date.monthLong} {date.year}
        </p>
      </div>

      <div className="border-t border-hairline pt-5">
        <p className="text-sm text-mute">
          {event.artists.length > 0
            ? event.artists.map(a => a.name).join(', ')
            : `Doors ${doorTime(event)} · ${event.age}+`}
        </p>
        <p className="label mt-4 transition-colors duration-500 group-hover:text-gold-lit">
          {fromPrice ? `Tables from ${formatMoney(fromPrice, event.currency)}` : 'Reserve'}
        </p>
      </div>
    </Link>
  )
}
