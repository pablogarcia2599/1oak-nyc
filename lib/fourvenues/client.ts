import 'server-only'

// ─── Fourvenues Channel Manager client ───────────────────────────────────────
// Every call runs server-side only: the API key never reaches the browser.

export const FV_BASE_URL =
  process.env.FOURVENUES_BASE_URL ?? 'https://channels-service.fourvenues.com'

export function isMockMode(): boolean {
  if (process.env.FOURVENUES_MOCK === '1') return true
  if (process.env.FOURVENUES_MOCK === '0') return false
  return !process.env.FOURVENUES_API_KEY
}

export class FourvenuesApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message)
    this.name = 'FourvenuesApiError'
  }
}

interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>
  body?: unknown
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  cache?: RequestCache
  next?: { revalidate?: number; tags?: string[] }
}

export async function fvFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, method = 'GET', cache, next } = options
  const apiKey = process.env.FOURVENUES_API_KEY

  if (!apiKey) {
    throw new FourvenuesApiError(
      401,
      'FOURVENUES_API_KEY is not set. Add it to .env.local or run in mock mode.',
    )
  }

  const url = new URL(`${FV_BASE_URL}${path}`)
  if (process.env.FOURVENUES_ORGANIZATION_ID) {
    url.searchParams.set('organization_id', process.env.FOURVENUES_ORGANIZATION_ID)
  }
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
    ...(cache !== undefined && { cache }),
    ...(next !== undefined && { next }),
  })

  if (!res.ok) {
    let errorBody: unknown
    try {
      errorBody = await res.json()
    } catch {
      errorBody = await res.text()
    }
    throw new FourvenuesApiError(
      res.status,
      `Fourvenues API ${res.status} on ${method} ${path}`,
      errorBody,
    )
  }

  return res.json() as Promise<T>
}
