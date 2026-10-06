'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { FvEvent } from '@/types/fourvenues'
import { cn, doorHours, formatMoney, nightDate } from '@/lib/utils'

/** Until the artwork loads and says otherwise. Portrait, like most flyers. */
const ASSUMED_ASPECT = 4 / 5

/**
 * A night as a bill poster: the artwork whole, and under it the date stacked
 * beside the name across the hairline the forms and the lockup already use.
 *
 * The frame takes the artwork's own proportions rather than imposing any.
 * A fixed box can only crop or letterbox, and the venue's flyers are not one
 * shape — the Cardi B artwork is 187×346, nearly twice as tall as it is wide,
 * and a square frame ate the bottom two lines of it.
 *
 * Sized by container query, not by viewport: the same poster sits two-up on a
 * phone and two-up inside the booking flow's narrower column on a laptop.
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
  const [aspect, setAspect] = useState(ASSUMED_ASPECT)

  return (
    <>
      {event.image_url && (
        <div className="relative overflow-hidden" style={{ aspectRatio: String(aspect) }}>
          <Image
            src={event.image_url}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            onLoad={e => {
              const { naturalWidth, naturalHeight } = e.currentTarget
              if (naturalWidth && naturalHeight) setAspect(naturalWidth / naturalHeight)
            }}
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
          <h3 className="heading line-clamp-3 break-words text-[0.8rem] leading-[1.2] font-medium tracking-[0.035em] text-bone @min-[15rem]:line-clamp-none @min-[15rem]:text-[0.95rem] @min-[22rem]:text-[1.05rem]">
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
