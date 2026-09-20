'use client'

import { BirthdateField } from '../BirthdateField'
import { PhoneField } from '../PhoneField'
import type { GuestDetails } from '../types'
import { VENUE } from '@/content/venue'
import { cn } from '@/lib/utils'

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {error && <span className="mt-2 block text-xs text-red-400">{error}</span>}
    </label>
  )
}

export function GuestStep({
  guest,
  onChange,
  errors,
  allowsDiscountCodes,
}: {
  guest: GuestDetails
  onChange: (patch: Partial<GuestDetails>) => void
  errors: Record<string, string>
  allowsDiscountCodes: boolean
}) {
  return (
    <div>
      <h2 className="heading heading-lg text-bone">Who is the table under?</h2>
      <p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-mute">
        The name on the reservation must match the ID presented at the door. {VENUE.agePolicy}.
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <Field label="Full name" error={errors.full_name}>
          <input
            className={cn('field', errors.full_name && 'border-b-red-400')}
            value={guest.full_name}
            onChange={e => onChange({ full_name: e.target.value })}
            autoComplete="name"
            autoCapitalize="words"
            enterKeyHint="next"
            placeholder="As it appears on your ID"
          />
        </Field>

        <Field label="Email" error={errors.email}>
          <input
            className={cn('field', errors.email && 'border-b-red-400')}
            value={guest.email}
            onChange={e => onChange({ email: e.target.value })}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            placeholder="you@email.com"
          />
        </Field>

        <PhoneField
          value={guest.phone}
          error={errors.phone}
          onChange={phone => onChange({ phone })}
        />

        <BirthdateField
          value={guest.birthdate}
          error={errors.birthdate}
          onChange={birthdate => onChange({ birthdate })}
        />

        <div className="sm:col-span-2">
          <Field label="Notes for the host (optional)">
            <textarea
              className="field resize-none"
              rows={3}
              value={guest.observations_client}
              onChange={e => onChange({ observations_client: e.target.value })}
              maxLength={500}
              placeholder="Birthday, arrival time, champagne preference…"
            />
          </Field>
        </div>

        {allowsDiscountCodes && (
          <Field label="Access code (optional)">
            <input
              className="field uppercase"
              value={guest.discount_code}
              onChange={e => onChange({ discount_code: e.target.value.toUpperCase() })}
              autoCapitalize="characters"
              autoComplete="off"
              placeholder="CODE"
            />
          </Field>
        )}
      </div>

      <div className="mt-10 space-y-5">
        <label className="flex cursor-pointer items-start gap-4 py-1">
          <input
            type="checkbox"
            checked={guest.accepts_terms}
            onChange={e => onChange({ accepts_terms: e.target.checked })}
            className="check mt-0.5"
          />
          <span className="text-[0.875rem] leading-relaxed text-mute">
            I accept the reservation terms and the house policy, including the dress code and{' '}
            {VENUE.agePolicy.toLowerCase()}.
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-4 py-1">
          <input
            type="checkbox"
            checked={guest.marketing_consent}
            onChange={e => onChange({ marketing_consent: e.target.checked })}
            className="check mt-0.5"
          />
          <span className="text-[0.875rem] leading-relaxed text-mute">
            Keep me on the list for upcoming nights and guest announcements.
          </span>
        </label>
      </div>
    </div>
  )
}
