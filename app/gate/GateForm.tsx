'use client'

import { useActionState } from 'react'
import { unlock } from './actions'

export function GateForm({ next }: { next?: string }) {
  const [error, formAction, pending] = useActionState(unlock, undefined)

  return (
    <form action={formAction} className="mt-10 w-full max-w-xs">
      <input type="hidden" name="next" value={next ?? '/'} />
      <label className="block">
        <span className="sr-only">Access password</span>
        <input
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          placeholder="Password"
          className="field text-center"
        />
      </label>

      {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary mt-4 w-full">
        {pending ? 'Checking…' : 'Enter'}
      </button>
    </form>
  )
}
