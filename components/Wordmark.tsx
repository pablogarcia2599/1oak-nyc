import { cn } from '@/lib/utils'
import { VENUE } from '@/content/venue'

const STREET = 'W 17th Street'

/**
 * Letters spread to fill their line exactly.
 *
 * `justify-between` over individual characters flushes the street to whatever
 * width the number sets, at any size — so the two lines lock together instead
 * of floating one above the other. A fixed `letter-spacing` cannot do this:
 * it would have to be re-guessed for every breakpoint and would still leave a
 * ragged edge.
 */
function Flush({ text, className }: { text: string; className?: string }) {
  return (
    <span aria-hidden className={cn('flex w-full justify-between', className)}>
      {[...text].map((character, i) => (
        <span key={i} className={character === ' ' ? 'w-[0.2em]' : undefined}>
          {character === ' ' ? '' : character}
        </span>
      ))}
    </span>
  )
}

/**
 * The house mark, set in type: the address is the name now.
 *
 * Built from the vocabulary already on the page — Archivo caps, a gold
 * hairline, the bronze accent — so the change of identity reads as the same
 * design rather than a new one. The number carries the weight, the street
 * carries the colour, and a rule the width of both holds them together.
 */
export function Wordmark({
  className,
  variant = 'stacked',
}: {
  className?: string
  variant?: 'stacked' | 'inline'
}) {
  if (variant === 'inline') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-2.5 whitespace-nowrap uppercase',
          'text-[0.8125rem] font-medium leading-none',
          className,
        )}
      >
        <span aria-hidden className="tracking-[0.02em] text-bone">453</span>
        {/* The same hairline divider the form controls use. */}
        <span aria-hidden className="h-3.5 w-px bg-hairline" />
        <span aria-hidden className="tracking-[0.2em] text-gold-lit">
          W 17th St
        </span>
        <span className="sr-only">{VENUE.name}</span>
      </span>
    )
  }

  return (
    <span className={cn('inline-flex flex-col items-stretch', className)}>
      {/* The lockup is decorative to a screen reader; the name below is read
          once, whole, instead of as a number and then an address. */}
      <span
        aria-hidden
        className="heading text-[clamp(5.5rem,30vw,13rem)] leading-[0.8] text-bone"
      >
        453
      </span>
      <span aria-hidden className="mt-4 h-px w-full bg-gold/60 sm:mt-5" />
      <Flush
        text={STREET.toUpperCase()}
        className="mt-3.5 text-[0.6875rem] font-medium text-gold-lit sm:mt-4 sm:text-xs"
      />
      <span className="sr-only">{VENUE.name}</span>
    </span>
  )
}
