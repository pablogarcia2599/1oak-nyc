import { LegalPage } from '@/components/LegalPage'
import { VENUE } from '@/content/venue'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Reservation terms' }

export default function TermsPage() {
  return (
    <LegalPage
      title="Reservation terms"
      sections={[
        {
          heading: 'Deposits and minimums',
          body: `Every table carries a minimum spend, shown before you confirm. A deposit is taken at booking and applied against that minimum. The balance is settled at the table.`,
        },
        {
          heading: 'Admission',
          body: `${VENUE.agePolicy}. The name on the reservation must match the ID presented at the door. ${VENUE.dressCode}`,
        },
        {
          heading: 'Changes and cancellations',
          body: `Party size can be adjusted up to 24 hours before doors by replying to your confirmation email. Deposits are non-refundable inside 48 hours of the event.`,
        },
        {
          heading: 'Right of admission',
          body: `Management reserves the right of admission. A reservation does not guarantee entry where house policy or capacity regulations are not met.`,
        },
      ]}
    />
  )
}
