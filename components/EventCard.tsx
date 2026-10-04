import Link from 'next/link'
import type { FvEvent } from '@/types/fourvenues'
import { NightPoster } from './NightPoster'

export function EventCard({ event, fromPrice }: { event: FvEvent; fromPrice?: number }) {
  return (
    <Link
      href={`/reserve?event=${event.slug}`}
      className="group @container flex h-full flex-col overflow-hidden bg-ink transition-colors duration-500 hover:bg-surface"
    >
      <NightPoster event={event} fromPrice={fromPrice} />
    </Link>
  )
}
