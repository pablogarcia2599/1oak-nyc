'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { GATE_COOKIE, digest, safeEqual } from '@/middleware'

export async function unlock(_state: string | undefined, formData: FormData) {
  const password = process.env.SITE_PASSWORD
  if (!password) redirect('/')

  const attempt = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? '/')

  if (!safeEqual(await digest(attempt), await digest(password))) {
    return 'That password is not right.'
  }

  const store = await cookies()
  store.set(GATE_COOKIE, await digest(password), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  // Only ever bounce back to a path on this site.
  redirect(next.startsWith('/') && !next.startsWith('//') ? next : '/')
}
