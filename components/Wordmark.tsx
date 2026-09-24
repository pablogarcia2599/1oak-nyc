import { cn } from '@/lib/utils'

/**
 * The house mark, set in type: the address is the name now.
 *
 * Built from the same vocabulary as the rest of the site — Archivo caps for
 * the number, the gold letterspaced line underneath that the old lockup used
 * for its city — so the change of identity does not read as a change of
 * design. The number carries the weight; the street carries the colour.
 */
export function Wordmark({
  className,
  variant = 'stacked',
}: {
  className?: string
  /** `stacked` for a standalone mark, `inline` for a bar. */
  variant?: 'stacked' | 'inline'
}) {
  if (variant === 'inline') {
    return (
      <span
        className={cn(
          'inline-flex items-baseline gap-1.5 whitespace-nowrap font-medium uppercase',
          'text-[0.8125rem] tracking-[0.16em]',
          className,
        )}
      >
        <span className="text-bone">453</span>
        <span className="text-gold-lit">W 17th St</span>
      </span>
    )
  }

  return (
    <span className={cn('flex flex-col items-center', className)}>
      {/* Sized as a mark, not as a heading: it stands where a logo stood and
          has to hold the same weight on the page. */}
      <span className="heading text-[clamp(5.5rem,30vw,13rem)] leading-[0.82] text-bone">
        453
      </span>
      <span className="wordmark-echo mt-5 sm:mt-6">W 17th Street</span>
    </span>
  )
}
