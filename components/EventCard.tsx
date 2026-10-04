import Link from 'next/link'
import Image from 'next/image'
import type { FvEvent } from '@/types/fourvenues'
import { doorHours, formatMoney, nightDate } from '@/lib/utils'

/**
 * A night as a bill poster: the artwork whole, and under it the date stacked
 * beside the name, divided by the hairline the forms and the lockup already
 * use. The image meets the bar on a hard edge rather than fading into it —
 * the artwork is the venue's, and dimming its lower third to blend with the
 * card throws away the part a designer put there.
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
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]"
          />
        </div>
      )}

      <div className="flex items-stretch gap-5 p-5 sm:gap-6 sm:p-6">
        <div className="flex shrink-0 flex-col items-center justify-center text-center">
          <span className="label">{date.weekday}</span>
          <span className="label mt-0.5">{date.month}</span>
          <span className="figure mt-1 text-3xl leading-none text-bone">{date.day}</span>
        </div>

        <span aria-hidden className="w-px shrink-0 self-stretch bg-hairline" />

        <div className="flex min-w-0 flex-col justify-center">
          <h3 className="heading heading-md text-bone">{event.name}</h3>
          <p className="mt-2 text-sm text-mute">
            <span className="whitespace-nowrap">{doorHours(event)}</span> · {event.age}+
          </p>
          {fromPrice !== undefined && (
            <p className="label mt-2 transition-colors duration-500 group-hover:text-gold-lit">
              Tables from {formatMoney(fromPrice, event.currency)}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
