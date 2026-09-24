'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * A dial code beside the number, rather than a lone box with "+1 555 000 0000"
 * sitting in it as placeholder text.
 *
 * The room is in New York so the code defaults to +1 and the number formats as
 * (555) 000-0000 while it is typed — but the room draws an international
 * crowd, so the code is a choice, and a number outside +1 is left as entered.
 */
const DIAL_CODES = [
  { code: '+1', label: 'United States · Canada' },
  { code: '+44', label: 'United Kingdom' },
  { code: '+34', label: 'Spain' },
  { code: '+33', label: 'France' },
  { code: '+39', label: 'Italy' },
  { code: '+49', label: 'Germany' },
  { code: '+52', label: 'Mexico' },
  { code: '+55', label: 'Brazil' },
  { code: '+61', label: 'Australia' },
  { code: '+971', label: 'United Arab Emirates' },
]

function formatNational(digits: string, dial: string): string {
  // Only +1 is formatted. Grouping the rest in threes invents a convention the
  // country may not use, and leaves a stray digit hanging off the end.
  if (dial !== '+1') return digits
  const a = digits.slice(0, 3)
  const b = digits.slice(3, 6)
  const c = digits.slice(6, 10)
  if (digits.length > 6) return `(${a}) ${b}-${c}`
  if (digits.length > 3) return `(${a}) ${b}`
  if (digits.length > 0) return `(${a}`
  return ''
}

/** Splits a stored value back into its parts, longest dial code first. */
function parse(value: string): { dial: string; digits: string } {
  const clean = value.replace(/[^\d+]/g, '')
  const match = [...DIAL_CODES]
    .sort((a, b) => b.code.length - a.code.length)
    .find(entry => clean.startsWith(entry.code))
  if (!match) return { dial: '+1', digits: clean.replace(/\D/g, '') }
  return { dial: match.code, digits: clean.slice(match.code.length).replace(/\D/g, '') }
}

export function PhoneField({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (phone: string) => void
  error?: string
}) {
  const [parts, setParts] = useState(() => parse(value))

  function update(next: { dial: string; digits: string }) {
    setParts(next)
    onChange(next.digits ? `${next.dial} ${formatNational(next.digits, next.dial)}` : '')
  }

  const maxDigits = parts.dial === '+1' ? 10 : 14

  return (
    <div>
      <span className="label">Phone</span>
      <div
        className={cn(
          'mt-2 flex items-stretch overflow-hidden rounded-sm border border-hairline bg-surface transition-colors duration-300 focus-within:border-gold',
          error && 'border-red-400',
        )}
      >
        <label className="relative flex items-center">
          <span className="sr-only">Country dial code</span>
          <select
            value={parts.dial}
            onChange={e => update({ ...parts, digits: parts.digits, dial: e.target.value })}
            /* Transparent text and a fixed width: the closed control would
               otherwise render the whole country label and size itself to the
               longest one. The open dropdown still shows the full names. */
            className="h-13 w-[5.25rem] appearance-none bg-transparent py-0 pl-4 pr-7 text-base text-transparent outline-none"
          >
            {DIAL_CODES.map(entry => (
              <option key={entry.code} value={entry.code} className="bg-ink text-bone">
                {entry.code} — {entry.label}
              </option>
            ))}
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center gap-1.5 pl-4 pr-3 text-base text-bone"
          >
            {parts.dial}
            <svg width="9" height="6" viewBox="0 0 9 6" className="text-faint" aria-hidden>
              <path d="M1 1l3.5 3.5L8 1" stroke="currentColor" fill="none" strokeWidth="1.2" />
            </svg>
          </span>
        </label>

        <span aria-hidden className="my-2.5 w-px bg-hairline" />

        <input
          value={formatNational(parts.digits, parts.dial)}
          onChange={e =>
            update({ ...parts, digits: e.target.value.replace(/\D/g, '').slice(0, maxDigits) })
          }
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          enterKeyHint="next"
          placeholder={parts.dial === '+1' ? '(555) 000-0000' : 'Phone number'}
          aria-label="Phone number"
          className="h-13 min-w-0 flex-1 bg-transparent px-3 text-base text-bone outline-none placeholder:text-faint"
        />
      </div>
      {error && <span className="mt-2 block text-xs text-red-400">{error}</span>}
    </div>
  )
}
