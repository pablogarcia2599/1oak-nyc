import Link from 'next/link'
import { Wordmark } from './Wordmark'
import { VENUE } from '@/content/venue'

const NAV = [
  { href: '/#nights', label: 'Nights' },
  { href: '/#rooms', label: 'The room' },
  { href: '/#visit', label: 'Visit' },
  { href: '/reserve', label: 'Reservations' },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline-soft bg-ink-sunk">
      <div className="gutter mx-auto max-w-7xl py-16 sm:py-24">
        <div className="flex flex-col items-center text-center">
          <Wordmark className="scale-90" />
          <p className="label mt-6">
            {VENUE.neighborhood} · {VENUE.city}
          </p>
        </div>

        <div className="mt-16 grid gap-10 border-t border-hairline-soft pt-12 sm:grid-cols-3 sm:gap-8">
          <div>
            <p className="label label-gold">Visit</p>
            <a
              href={VENUE.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block text-sm leading-relaxed text-bone transition-colors hover:text-gold-lit"
            >
              {VENUE.address}
            </a>
            <p className="mt-3 text-sm text-mute">{VENUE.hours}</p>
          </div>

          <div>
            <p className="label label-gold">Reservations</p>
            <a
              href={`mailto:${VENUE.email}`}
              className="mt-4 block text-sm text-bone transition-colors hover:text-gold-lit"
            >
              {VENUE.email}
            </a>
            <a
              href={`tel:${VENUE.phone.replace(/[^\d+]/g, '')}`}
              className="mt-3 block text-sm text-bone transition-colors hover:text-gold-lit"
            >
              {VENUE.phone}
            </a>
          </div>

          <div>
            <p className="label label-gold">Index</p>
            <ul className="mt-4 space-y-3">
              {NAV.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-bone transition-colors hover:text-gold-lit"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-hairline-soft pt-8 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {VENUE.name} {VENUE.city}
          </p>
          <div className="flex flex-wrap gap-6">
            <Link href="/legal/privacy" className="transition-colors hover:text-mute">
              Privacy
            </Link>
            <Link href="/legal/terms" className="transition-colors hover:text-mute">
              Terms
            </Link>
            {VENUE.instagram && (
              <a
                href={VENUE.instagram}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-mute"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
