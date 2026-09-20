'use client'

import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Month / day / year, in that order, as three numeric fields.
 *
 * A native `<input type="date">` renders in the *visitor's* browser locale, so
 * a guest in Madrid would read the same field as day-first while the room is
 * in New York. Three labelled fields are unambiguous for everyone, and they
 * beat a date picker for a birth year besides — no scrolling back decades.
 *
 * The parts are held locally and only surface as an ISO date once they form a
 * real one: a controlled ISO value cannot represent half-typed input, and
 * deriving the fields from it would wipe each digit as it was entered.
 */
export function BirthdateField({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (iso: string) => void
  error?: string
}) {
  const [initialYear = '', initialMonth = '', initialDay = ''] = value.split('-')
  const [parts, setParts] = useState({
    month: initialMonth,
    day: initialDay,
    year: initialYear,
  })
  const dayRef = useRef<HTMLInputElement>(null)
  const yearRef = useRef<HTMLInputElement>(null)

  /** An ISO date, or '' while the field is incomplete or impossible. */
  function toIso({ month, day, year }: typeof parts): string {
    if (month.length < 2 || day.length < 2 || year.length < 4) return ''
    const m = Number(month)
    const d = Number(day)
    const y = Number(year)
    const date = new Date(Date.UTC(y, m - 1, d))
    const real =
      date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
    if (!real || y < 1900 || date.getTime() > Date.now()) return ''
    return `${year}-${month}-${day}`
  }

  function update(patch: Partial<typeof parts>) {
    const next = { ...parts, ...patch }
    setParts(next)
    onChange(toIso(next))
  }

  const digits = (raw: string, max: number) => raw.replace(/\D/g, '').slice(0, max)

  const incomplete =
    [parts.month, parts.day, parts.year].some(Boolean) && !toIso(parts)

  return (
    <div>
      <span className="label">Date of birth (optional)</span>
      <div className="mt-2 flex items-center gap-2">
        <input
          className={cn('field w-16 text-center', error && 'border-red-400')}
          value={parts.month}
          onChange={e => {
            const month = digits(e.target.value, 2)
            update({ month })
            if (month.length === 2) dayRef.current?.focus()
          }}
          inputMode="numeric"
          autoComplete="bday-month"
          placeholder="MM"
          aria-label="Birth month"
          maxLength={2}
        />
        <span aria-hidden className="text-faint">/</span>
        <input
          ref={dayRef}
          className={cn('field w-16 text-center', error && 'border-red-400')}
          value={parts.day}
          onChange={e => {
            const day = digits(e.target.value, 2)
            update({ day })
            if (day.length === 2) yearRef.current?.focus()
          }}
          inputMode="numeric"
          autoComplete="bday-day"
          placeholder="DD"
          aria-label="Birth day"
          maxLength={2}
        />
        <span aria-hidden className="text-faint">/</span>
        <input
          ref={yearRef}
          className={cn('field w-24 text-center', error && 'border-red-400')}
          value={parts.year}
          onChange={e => update({ year: digits(e.target.value, 4) })}
          inputMode="numeric"
          autoComplete="bday-year"
          placeholder="YYYY"
          aria-label="Birth year"
          maxLength={4}
        />
      </div>

      {error ? (
        <span className="mt-2 block text-xs text-red-400">{error}</span>
      ) : (
        incomplete && (
          <span className="mt-2 block text-xs text-mute">
            Month, day and year — we will leave it off until it is a real date.
          </span>
        )
      )}
    </div>
  )
}
