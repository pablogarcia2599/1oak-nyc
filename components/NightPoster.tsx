import Image from 'next/image'
import type { FvEvent } from '@/types/fourvenues'
import { cn, doorHours, formatMoney, nightDate } from '@/lib/utils'

/**
 * A night as a bill poster: the artwork whole, and under it the date stacked
 * beside the name across the hairline the forms and the lockup already use.
 *
 * Sized by container query, not by viewport. The same poster sits two-up on a
 * phone (~170px) and two-up inside the booking flow's narrow column on a
 * laptop (~145px) — a viewport breakpoint would hand the narrower of the two
 * the wide-screen treatment. Below 15rem the bar keeps only what a 110px text
 * column can carry: the date and the name, with the opening price abbreviated.
 */
export function NightPoster({
  event,
  fromPrice,
  dimmed = false,
}: {
  event: FvEvent
  fromPrice?: number
  /** Unselected, in a set where something else is selected. */
  dimmed?: boolean
}) {
  const date = nightDate(event)

  return (
    <>
      {event.image_url && (
        <div className="relative aspect-square overflow-hidden @min-[15rem]:aspect-4/5">
          <Image
            src={event.image_url}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className={cn(
              'object-cover transition-all duration-[900ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]',
              dimmed && 'opacity-60',
            )}
          />
        </div>
      )}

      <div className="flex items-stretch gap-3 p-3 text-left @min-[15rem]:gap-5 @min-[15rem]:p-5">
        <div className="flex shrink-0 flex-col items-center justify-center text-center">
          <span className="label">{date.weekday}</span>
          <span className="label mt-0.5">{date.month}</span>
          <span className="figure mt-1 text-2xl leading-none text-bone @min-[15rem]:text-3xl">
            {date.day}
          </span>
        </div>

        <span aria-hidden className="w-px shrink-0 self-stretch bg-hairline" />

        <div className="flex min-w-0 flex-col justify-center">
          <h3 className="heading line-clamp-3 text-[0.8rem] leading-[1.2] font-medium tracking-[0.035em] text-bone @min-[15rem]:line-clamp-none @min-[15rem]:text-[0.95rem] @min-[22rem]:text-[1.05rem]">
            {event.name}
          </h3>
          <p className="mt-2 hidden text-sm text-mute @min-[15rem]:block">
            <span className="whitespace-nowrap">{doorHours(event)}</span> · {event.age}+
          </p>
          {fromPrice !== undefined && (
            <p className="label mt-1.5 transition-colors duration-500 group-hover:text-gold-lit @min-[15rem]:mt-2">
              <span className="@min-[15rem]:hidden">
                From {formatMoney(fromPrice, event.currency)}
              </span>
              <span className="hidden @min-[15rem]:inline">
                Tables from {formatMoney(fromPrice, event.currency)}
              </span>
            </p>
          )}
        </div>
      </div>
    </>
  )
}
