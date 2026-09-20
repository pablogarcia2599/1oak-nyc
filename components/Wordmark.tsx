import Image from 'next/image'
import logo from '@/public/logo.png'
import { cn } from '@/lib/utils'

/**
 * The house mark, taken from the venue's own Fourvenues channel and keyed off
 * its black field so it sits on any surface. Sized by height; the width
 * follows the mark's own proportions.
 */
export function Wordmark({
  className,
  priority = false,
}: {
  className?: string
  priority?: boolean
}) {
  return (
    <Image
      src={logo}
      alt="1 OAK New York"
      priority={priority}
      sizes="(max-width: 640px) 160px, 260px"
      className={cn('h-10 w-auto select-none', className)}
    />
  )
}
