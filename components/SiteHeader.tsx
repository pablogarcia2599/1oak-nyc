'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Wordmark } from './Wordmark'
import { VENUE } from '@/content/venue'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/#nights', label: 'Nights' },
  { href: '/#rooms', label: 'The room' },
  { href: '/#visit', label: 'Visit' },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      // Frosted once it has something to sit over; clean black at the top.
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500',
        scrolled ? 'glass border-hairline-soft' : 'border-transparent bg-ink',
      )}
    >
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] gutter items-center gap-4 sm:h-20">
        {/* Nav sits left on desktop; on mobile the mark holds the centre alone. */}
        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="label transition-colors duration-300 hover:text-gold-lit"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <span className="md:hidden" />

        <Link href="/" aria-label={`${VENUE.name} — home`} className="justify-self-center">
          <Wordmark variant="inline" />
        </Link>

        <div className="justify-self-end">
          <Link href="/reserve" className="btn btn-quiet !min-h-10 !px-4 sm:!px-6">
            Reserve
          </Link>
        </div>
      </div>
    </header>
  )
}
