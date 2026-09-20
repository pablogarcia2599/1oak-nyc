import { NextResponse, type NextRequest } from 'next/server'

export const GATE_COOKIE = 'oak_gate'

/**
 * Soft access gate for the preview deployment.
 *
 * The repository is public, so the password itself lives only in the
 * environment (`SITE_PASSWORD`) — never in the source. The cookie carries a
 * SHA-256 of that password rather than the password itself, so a stolen cookie
 * does not hand over the secret in plain text.
 *
 * With no `SITE_PASSWORD` set the gate is simply off, which keeps local
 * development and mock deployments unencumbered.
 */
export async function digest(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('')
}

/** Constant-time compare, so the gate leaks nothing through response timing. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function middleware(request: NextRequest) {
  const password = process.env.SITE_PASSWORD
  if (!password) return NextResponse.next()

  const cookie = request.cookies.get(GATE_COOKIE)?.value
  if (cookie && safeEqual(cookie, await digest(password))) return NextResponse.next()

  const gate = new URL('/gate', request.url)
  // Send people back where they were heading once they are through.
  const { pathname, search } = request.nextUrl
  if (pathname !== '/') gate.searchParams.set('next', pathname + search)
  return NextResponse.redirect(gate)
}

export const config = {
  // Everything except the gate itself, Next's own assets and the few public
  // files the gate screen needs to render.
  matcher: ['/((?!gate|_next/static|_next/image|favicon.ico|icon.png|logo.png).*)'],
}
