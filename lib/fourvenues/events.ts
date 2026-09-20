import 'server-only'
import { fvFetch, isMockMode } from './client'
import { MOCK_EVENTS } from './mock'
import type { FvEvent, FvResponse } from '@/types/fourvenues'

interface GetEventsParams {
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
  search?: string
}

/** Upcoming nights, soonest first. */
export async function getEvents(params: GetEventsParams = {}): Promise<FvEvent[]> {
  if (isMockMode()) return [...MOCK_EVENTS]

  // No `start_date` by default: the API already returns only live events, and
  // sending today's timestamp drops the night currently in progress.
  const res = await fvFetch<FvResponse<FvEvent[]>>('/events', {
    params: {
      start_date: params.start_date,
      end_date: params.end_date,
      limit: params.limit ?? 24,
      offset: params.offset,
      search: params.search,
    },
    next: { revalidate: 60, tags: ['events'] },
  })

  const cutoff = Date.now()
  return [...(res.data ?? [])]
    .filter(e => new Date(e.end_date ?? e.start_date).getTime() >= cutoff)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
}

export async function getEventBySlug(slug: string): Promise<FvEvent | null> {
  if (isMockMode()) return MOCK_EVENTS.find(e => e.slug === slug) ?? null

  try {
    const res = await fvFetch<FvResponse<FvEvent>>(`/events/by-slug/${slug}`, {
      params: { populate: '*' },
      next: { revalidate: 60 },
    })
    return res.data ?? null
  } catch {
    // Not every deployment exposes by-slug; fall back to a list scan.
    const events = await getEvents({ limit: 50 })
    return events.find(e => e.slug === slug) ?? null
  }
}
