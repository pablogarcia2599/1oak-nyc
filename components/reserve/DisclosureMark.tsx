/**
 * The mark on a `<details>` summary.
 *
 * A plus reads as "add something" — on a price panel that is the wrong verb
 * entirely. A chevron that turns over, with the word when the summary itself
 * does not already carry one.
 *
 * Needs `group` on the `<details>` it sits in.
 */
export function DisclosureMark({ label }: { label?: string }) {
  return (
    <span className="label flex shrink-0 items-center gap-1.5 text-mute transition-colors duration-300 group-hover:text-bone group-open:text-bone">
      {label && (
        <>
          <span className="group-open:hidden">{label}</span>
          <span className="hidden group-open:inline">Hide</span>
        </>
      )}
      <svg
        width="12"
        height="12"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden
        className="transition-transform duration-300 group-open:rotate-180"
      >
        <path
          d="M4.5 7.5 10 13l5.5-5.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
