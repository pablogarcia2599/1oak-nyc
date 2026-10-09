import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Not found' }

/**
 * Where a dead link lands.
 *
 * Worth dressing: the venue renames and replaces nights in FV Pro, and
 * Fourvenues rebuilds each slug from the name, so links that were shared in
 * good faith stop matching. A guest who follows one is not lost — the night
 * they wanted has moved — so the page says that and points at the calendar
 * rather than leaving them on a white screen with a number on it.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="gutter mx-auto flex max-w-xl flex-col items-start pb-24 pt-32 sm:pt-40">
        <p className="label label-gold">404</p>
        <h1 className="heading heading-lg mt-4 text-bone">This page is not here</h1>
        <p className="prose-lede mt-5">
          The night you were sent to may have been renamed or taken down. The calendar
          has everything on sale.
        </p>
        <Link href="/#nights" className="btn btn-primary mt-10">
          See the calendar
        </Link>
      </main>
      <SiteFooter />
    </>
  )
}
