'use client'

import { cn } from '@/lib/utils'
import { blockedBy, partyTotal, type Party } from '@/lib/party'

/**
 * Who is coming, counted separately.
 *
 * Built like `PhoneField`: one bordered surface with hairline dividers between
 * its cells. The rule is enforced on the buttons rather than checked later —
 * there is no way to reach a party the venue will not take — and the line
 * underneath says which limit stopped you the moment it does.
 */
export function PartyMix({
  party,
  bounds,
  included,
  onChange,
}: {
  party: Party
  bounds: { min: number; max: number } | null
  /** The selected rate's included headcount, once a table is chosen. */
  included?: number
  onChange: (party: Party) => void
}) {
  const min = bounds?.min ?? 1
  const max = bounds?.max ?? 30
  const total = partyTotal(party)
  const block = blockedBy(party, max, included)

  const canAddMan = block === null
  const canAddWoman = total < max
  // Removing a woman must not leave more men than women behind.
  const canDropWoman = party.women > 0 && total > min && party.women - 1 >= party.men
  const canDropMan = party.men > 0 && total > min

  const rows = [
    {
      key: 'men' as const,
      label: 'Men',
      value: party.men,
      add: canAddMan,
      drop: canDropMan,
      onAdd: () => onChange({ ...party, men: party.men + 1 }),
      onDrop: () => onChange({ ...party, men: party.men - 1 }),
    },
    {
      key: 'women' as const,
      label: 'Women',
      value: party.women,
      add: canAddWoman,
      drop: canDropWoman,
      onAdd: () => onChange({ ...party, women: party.women + 1 }),
      onDrop: () => onChange({ ...party, women: party.women - 1 }),
    },
  ]

  return (
    <div>
      <div className="w-full max-w-80 overflow-hidden rounded-sm border border-hairline bg-surface">
        {rows.map((row, i) => (
          <div
            key={row.key}
            className={cn('flex items-stretch', i > 0 && 'border-t border-hairline')}
          >
            <span className="label flex flex-1 items-center pl-4">{row.label}</span>

            <button
              type="button"
              aria-label={`Fewer ${row.label.toLowerCase()}`}
              onClick={row.onDrop}
              disabled={!row.drop}
              className={cn(
                'flex h-13 w-12 shrink-0 items-center justify-center text-xl transition-colors duration-300',
                row.drop ? 'text-gold-lit hover:bg-surface-strong' : 'cursor-not-allowed text-faint',
              )}
            >
              −
            </button>

            <span
              className="figure flex w-11 shrink-0 items-center justify-center text-xl text-bone"
              aria-live="polite"
            >
              {row.value}
            </span>

            <button
              type="button"
              aria-label={`More ${row.label.toLowerCase()}`}
              onClick={row.onAdd}
              disabled={!row.add}
              className={cn(
                'flex h-13 w-12 shrink-0 items-center justify-center text-xl transition-colors duration-300',
                row.add ? 'text-gold-lit hover:bg-surface-strong' : 'cursor-not-allowed text-faint',
              )}
            >
              +
            </button>
          </div>
        ))}
      </div>

      <p className="label mt-3">
        {total} {total === 1 ? 'guest' : 'guests'}
        {bounds && ` · ${min}–${max} per table`}
      </p>

      {block === 'ratio' && (
        <p className="label mt-1.5 text-gold-lit">
          One man for every woman — add a woman to add another man.
        </p>
      )}
      {block === 'extras' && included !== undefined && (
        <p className="label mt-1.5 text-gold-lit">
          This table includes {included}. Only one guest above that may be a man.
        </p>
      )}
      {block === 'size' && (
        <p className="label mt-1.5 text-mute">The largest table takes {max}.</p>
      )}
    </div>
  )
}
