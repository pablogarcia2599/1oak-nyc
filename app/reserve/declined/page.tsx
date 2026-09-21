import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { VENUE } from '@/content/venue'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Payment not completed', robots: { index: false } }

export default function DeclinedPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex min-h-[80svh] items-center gutter justify-center py-28">
        <div className="w-full max-w-md text-center">
          <p className="label label-gold">Not completed</p>
          <h1 className="heading heading-lg mt-4 text-bone">The payment did not go through</h1>

          <span className="rule mx-auto mt-8 block" />

          <p className="mt-8 text-[0.95rem] leading-relaxed text-mute">
            No charge was made and the table has been released. You can start again, or let a host
            arrange it with you directly.
          </p>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/reserve" className="btn btn-primary">
              Try again
            </Link>
            <a href={`mailto:${VENUE.email}`} className="btn btn-quiet">
              Contact a host
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  )
}
