import Link from 'next/link'
import Image from 'next/image'
import type { FvEvent } from '@/types/fourvenues'
import { doorHours, formatMoney, nightDate } from '@/lib/utils'

/**
 * A night, as the venue publishes it: its artwork, its name, when it runs and
 * what a table starts at.
 *
 * The image is whatever `image_url` carries. Today every event points at the
 * channel's own flyer, so the cards share one picture until the venue uploads
 * artwork per night — which is a thing to fix in the back office, not here.
 */
export function EventCard({ event, fromPrice }: { event: FvEvent; fromPrice?: number }) {
  const date = nightDate(event)

  return (
    <Link
      href={`/reserve?event=${event.slug}`}
      className="group flex h-full flex-col overflow-hidden bg-ink transition-colors duration-500 hover:bg-surface"
    >
      {event.image_url && (
        <div className="relative aspect-4/5 overflow-hidden">
          <Image
            src={event.image_url}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]"
          />
          {/* Lets the artwork meet the card instead of ending on a hard edge. */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
        </div>
      )}

      <div className="flex flex-1 flex-col justify-between gap-6 p-5 sm:p-6">
        <div>
          <p className="label label-gold">
            {date.weekday} · {date.day} {date.month}
          </p>
          <h3 className="heading heading-md mt-3 text-bone">{event.name}</h3>
          <p className="mt-3 text-sm text-mute">
            {doorHours(event)} · {event.age}+
          </p>
        </div>

        <p className="label transition-colors duration-500 group-hover:text-gold-lit">
          {fromPrice ? `Tables from ${formatMoney(fromPrice, event.currency)}` : 'Reserve'}
        </p>
      </div>
    </Link>
  )
}
